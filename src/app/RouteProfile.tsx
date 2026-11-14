// SI-assisted: drafted with Claude Code (Claude Opus 5.5); human Design review pending.
// Elevation profile of the whole walk (plan 9.2 charts, 9.4 margin ticks, UX-06 two-way scrub). Distance is the
// engine's cumulative 3D length on the grid path (model-derived); elevation is D1 on the F6 grid (directly measured,
// vertical reference unverified). The margin shown on hover is the slow-bound planned margin, an estimate.
import type { PlanOutput } from "../engine/planner";
import { estRange } from "./format";
import { stopProfilePositions } from "./profile";

const W = 1000, H = 120, PAD = 6;

export interface RouteProfileProps {
  readonly output: PlanOutput | null;
  readonly hoverIndex: number | null;
  readonly onHoverIndex: (i: number | null) => void;
}

export function RouteProfile({ output, hoverIndex, onHoverIndex }: RouteProfileProps) {
  const prof = output?.geometry.profile ?? [];
  if (prof.length < 2) {
    return <div className="profile empty" aria-label="Elevation profile"><span className="kicker">Cross-section</span> Elevation profile: add a reachable stop to see the walk.</div>;
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

  const onMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const s = ((e.clientX - r.left) / r.width) * sMax;
    let lo = 0, hi = prof.length - 1;
    while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (prof[mid]!.s_m < s) lo = mid; else hi = mid; }
    onHoverIndex(Math.abs(prof[lo]!.s_m - s) <= Math.abs(prof[hi]!.s_m - s) ? lo : hi);
  };

  return (
    <div className="profile" aria-label="Elevation profile" data-testid="profile">
      <div className="profile-head"><span className="kicker">Cross-section</span>
        <span>Elevation along the route: D1 {Math.round(zMin)} to {Math.round(zMax)} m (directly measured, vertical reference unverified)</span>
        <span>Distance {(sMax / 1000).toFixed(2)} km (model-derived, 2 m grid path)</span>
      </div>
      <div className="profile-plot">
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" onMouseMove={onMove} onMouseLeave={() => onHoverIndex(null)} role="img"
          aria-label="Elevation profile of the walk; hover to move the marker on the map">
          <defs><pattern id="xsec" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="6" className="hatch" /></pattern></defs>
          <polygon className="profile-fill" points={`0,${H} ${pts(0, prof.length - 1)} ${W},${H}`} fill="url(#xsec)" />
          <polyline className="profile-line" points={pts(0, overAt >= 0 ? overAt : prof.length - 1)} />
          {overAt >= 0 && <polyline className="profile-line over" points={pts(overAt, prof.length - 1)} />}
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
            <span>planned margin {h.margin_min === null ? <span className="unknown">unknown</span> : <span className="est">{estRange(h.margin_min * 60, (h.marginHigh_min ?? h.margin_min) * 60)}</span>}</span>
          </>
        ) : <span className="why">Hover the profile or the route to scrub the walk.</span>}
      </div>
    </div>
  );
}
