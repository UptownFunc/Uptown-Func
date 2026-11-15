// SI-assisted: drafted with Claude Code (Claude Opus 5.5); human Design review pending.
// Elevation profile of the whole walk (plan 9.2 charts, 9.4 margin ticks, UX-06 two-way scrub). Distance is the
// engine's cumulative 3D length on the grid path (model-derived); elevation is D1 on the F6 grid (directly measured,
// vertical reference unverified). The margin shown on hover is the slow-bound planned margin, an estimate.
import { useMemo } from "react";
import type { PlanOutput, ProfileSample } from "../engine/planner";
import type { Quantity } from "../contracts";
import { estRange } from "./format";
import { stopProfilePositions } from "./profile";

const W = 1000, H = 120, PAD = 6;

/** 3D-06: grade along the route at sample i, from D1 heights over about 8 grid steps either side (model-derived; not
 *  the terrain slope across the path). s is the 3D length along the path, so the horizontal run is sqrt(ds^2 - dz^2). */
function gradeAt(prof: readonly ProfileSample[], i: number): Quantity {
  const a = prof[Math.max(0, i - 8)]!, b = prof[Math.min(prof.length - 1, i + 8)]!, dz = b.z_m - a.z_m, ds = b.s_m - a.s_m;
  const v = ds > 0 ? (Math.atan2(Math.abs(dz), Math.sqrt(Math.max(ds * ds - dz * dz, 1e-9))) * 180) / Math.PI : 0;
  return { value: v, unit: "deg", valueClass: "model_derived", methodId: "profile:grade-d1-16-steps", assumptionIds: [], sourceIds: ["D1"] };
}

/** The grade band as runs of one 5-degree bin each (a few dozen rects, not one per sample), built once per profile. */
function gradeRuns(prof: readonly ProfileSample[]): { s0: number; s1: number; bin: number }[] {
  const runs: { s0: number; s1: number; bin: number }[] = [];
  for (let i = 0; i < prof.length - 1; i++) {
    const bin = Math.min(4, Math.floor(gradeAt(prof, i).value! / 5)), last = runs[runs.length - 1];
    if (last && last.bin === bin) last.s1 = prof[i + 1]!.s_m; else runs.push({ s0: prof[i]!.s_m, s1: prof[i + 1]!.s_m, bin });
  }
  return runs;
}

export interface RouteProfileProps {
  readonly output: PlanOutput | null;
  readonly hoverIndex: number | null;
  readonly onHoverIndex: (i: number | null) => void;
}

export function RouteProfile({ output, hoverIndex, onHoverIndex }: RouteProfileProps) {
  const prof = output?.geometry.profile ?? [];
  const runs = useMemo(() => gradeRuns(prof), [prof]);
  if (prof.length < 2) {
    return <div className="profile empty" aria-label="Elevation profile">Elevation profile: add a reachable stop to see the walk.</div>;
  }
  const sMax = prof[prof.length - 1]!.s_m;
  let zMin = Infinity, zMax = -Infinity;
  for (const p of prof) { if (p.z_m < zMin) zMin = p.z_m; if (p.z_m > zMax) zMax = p.z_m; }
  const zSpan = Math.max(zMax - zMin, 1);
  const x = (s: number) => (s / sMax) * W;
  const y = (z: number) => PAD + (1 - (z - zMin) / zSpan) * (H - 2 * PAD);
  const ticks = output!.geometry.marginTicks;
  const over = ticks.find((t) => t.kind === "OVER");
  const pts = (from: number, to: number) => prof.slice(from, to + 1).map((p) => `${x(p.s_m).toFixed(1)},${y(p.z_m).toFixed(1)}`).join(" ");
  const overAt = over ? prof.findIndex((p) => p.s_m >= over.s_m) : -1;
  const stopS = stopProfilePositions(prof, output!.plan.stops.map((s) => output!.geometry.stopCells[s.id]));
  const stops = output!.plan.stops.map((s, i) => (stopS[i] === null ? null : { letter: s.letter, s: stopS[i]! }))
    .filter((v): v is { letter: string; s: number } => v !== null);
  const h = hoverIndex !== null ? prof[hoverIndex] : undefined;
  const g = h ? gradeAt(prof, hoverIndex!) : null;

  const onMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const s = ((e.clientX - r.left) / r.width) * sMax;
    let lo = 0, hi = prof.length - 1;
    while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (prof[mid]!.s_m < s) lo = mid; else hi = mid; }
    onHoverIndex(Math.abs(prof[lo]!.s_m - s) <= Math.abs(prof[hi]!.s_m - s) ? lo : hi);
  };

  return (
    <div className="profile" aria-label="Elevation profile" data-testid="profile">
      <div className="profile-head"><span className="title">Elevation profile</span>
        <span>D1 {Math.round(zMin)} to {Math.round(zMax)} m, directly measured, vertical reference unverified</span>
        <span>{(sMax / 1000).toFixed(2)} km along the 2 m grid path, model-derived</span>
        <span className="grade-key">band: grade along the route <i data-bin="0" />0-5° <i data-bin="2" />10-15° <i data-bin="4" />20°+</span>
      </div>
      <div className="profile-plot">
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" onMouseMove={onMove} onMouseLeave={() => onHoverIndex(null)} role="img"
          aria-label="Elevation profile of the walk; hover to move the marker on the map">
                    <polygon className="profile-fill" points={`0,${H} ${pts(0, prof.length - 1)} ${W},${H}`} />
          <polyline className="profile-line" points={pts(0, overAt >= 0 ? overAt : prof.length - 1)} />
          {overAt >= 0 && <polyline className="profile-line over" points={pts(overAt, prof.length - 1)} />}
          {runs.map((r, i) => <rect key={i} className="profile-grade" data-bin={r.bin} x={x(r.s0)} y={H - 5} width={x(r.s1) - x(r.s0) + 0.3} height={5} />)}
          {stops.map((s) => <line key={s.letter} className="profile-stop" x1={x(s.s)} x2={x(s.s)} y1={0} y2={H} />)}
          {ticks.map((t) => <line key={t.kind} className={`profile-tick ${t.kind}`} x1={x(t.s_m)} x2={x(t.s_m)} y1={0} y2={H} />)}
          {h && <line className="profile-marker" x1={x(h.s_m)} x2={x(h.s_m)} y1={0} y2={H} />}
        </svg>
        {stops.map((s) => <span key={s.letter} className="profile-label stop" style={{ left: `${(s.s / sMax) * 100}%` }}>{s.letter}</span>)}
        {ticks.map((t) => (
          <span key={t.kind} className={`profile-label tick ${t.kind}`} style={{ left: `${(t.s_m / sMax) * 100}%` }} data-testid={`profile-tick-${t.kind}`}>
            {t.kind === "OVER" ? "margin 0 here" : "margin 10% here"}
          </span>
        ))}
      </div>
      <div className="profile-readout small" data-testid="profile-readout">
        {h ? (
          <>
            <span>s {Math.round(h.s_m)} m</span>
            <span>elev {h.z_m.toFixed(1)} m</span>
            <span data-testid="profile-grade" title="grade along the route, model-derived from D1">grade {g!.value!.toFixed(1)}°</span>
            <span>planned margin {h.margin_min === null ? <span className="unknown">unknown</span> : <span className="est">{estRange(h.margin_min * 60, (h.marginHigh_min ?? h.margin_min) * 60)}</span>}</span>
          </>
        ) : <span className="why">Hover the profile or the route to scrub the walk.</span>}
      </div>
    </div>
  );
}
