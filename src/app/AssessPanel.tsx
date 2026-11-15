// SI-assisted: drafted with Claude Code (Claude Opus 5.5) on design/sharpwalk-ui-ux (UI-01); human Design review pending.
// Assess step: the planned return margin as the one large figure, the traverse as a ladder of legs and stops (each
// number a Quantity that opens its source), and the simulated drill. Margins are estimates under stated assumptions:
// the word set is OK / NEAR LIMIT / OVER with shape and colour, and there is no SAFE state.
import { useEffect, useRef, type ReactNode } from "react";
import { ZONES, arc, needleAngle } from "./gauge";
import { swingNeedle, traceLadder } from "./fx";
import { Term } from "./Term";
import type { Quantity } from "../contracts";
import type { PlanOutput } from "../engine/planner";
import { CONSTANTS } from "../constants";
import { DrillPanel } from "./DrillPanel";
import { MarginState } from "./MarginState";
import { AssumedNote } from "./PlanPanel";
import { QuantityText } from "./QuantityText";

const RANGE = CONSTANTS.walkSpeedRange;
const ZONE_WORD = { OVER: "OVER", NEAR_LIMIT: "NEAR LIMIT", OK: "OK" } as const;
/** Dial geometry in the 240 x 140 viewBox; the stylesheet's needle pivot (.needle transform-origin) is the same point. */
const CX = 120, CY = 124, R = 78;

/** The return-margin meter: zones by word and colour, needle at the slow-bound margin (UI-14). */
function Meter({ angle, live }: { angle: number; live: boolean }) {
  const needle = useRef<SVGGElement>(null);
  useEffect(() => { if (needle.current) swingNeedle(needle.current, angle); }, [angle]);
  return (
    <svg className="meter" viewBox="0 0 240 140" role="img" aria-label={live ? "Return-margin meter; the needle reads the slow-bound margin" : "Return-margin meter at rest: margin unknown"}>
      {ZONES.map((z) => <path key={z.state} className={`zone zone-${z.state}`} d={arc(CX, CY, R, z.from, z.to)} />)}
      {/* Each word sits outside the arc beside its own zone, so the needle (shorter than the arc) never crosses a word
          and cannot seem to point at the neighbouring zone's label. */}
      {ZONES.map((z) => {
        const deg = (z.from + z.to) / 2, mid = deg * (Math.PI / 180);
        return <text key={z.state} className={`zone-word zone-${z.state}`} x={CX + (R + 18) * Math.sin(mid)} y={CY - (R + 18) * Math.cos(mid) + 4}
          textAnchor={deg < -20 ? "end" : deg > 20 ? "start" : "middle"}>{ZONE_WORD[z.state]}</text>;
      })}
      <g ref={needle} className="needle" data-live={live}><line x1={CX} y1={CY} x2={CX} y2={CY - R + 12} /><circle cx={CX} cy={CY} r="7" /></g>
    </svg>
  );
}

/** ASSESS-01: the ladder's looping trace. It lives only while the Assess step is open (the panel unmounts on any other
 *  step), pauses while the ladder is scrolled out of view, and stops for good if the user turns on reduced motion. */
function Trace() {
  const ref = useRef<HTMLLIElement>(null);
  useEffect(() => {
    const a = ref.current && traceLadder(ref.current);
    if (!a) return;
    const io = new IntersectionObserver(([en]) => (en?.isIntersecting ? a.play() : a.pause()));
    io.observe(ref.current!.parentElement!); // the ladder, not the trace: the trace has no height at the start of a pass
    const mq = matchMedia("(prefers-reduced-motion: reduce)"), off = () => { if (mq.matches) a.cancel(); };
    mq.addEventListener("change", off);
    return () => { io.disconnect(); mq.removeEventListener("change", off); a.cancel(); };
  }, []);
  return <li ref={ref} className="ladder-trace" aria-hidden="true" data-testid="ladder-trace" />;
}

export function AssessPanel({ output, onOpenSource, drillMin, onDrillMin, busy, next, toMap }: {
  output: PlanOutput | null; onOpenSource: (q: Quantity) => void; drillMin: number | null; onDrillMin: (m: number | null) => void;
  busy: boolean; next: ReactNode; /** UX-24: the way out of the empty state. */ toMap?: ReactNode;
}) {
  if (!output) return <aside className="side" aria-label="Assessment"><div className="side-scroll"><header className="side-head"><h1>Return margin</h1><p className="unknown">Loading the route engine…</p></header></div></aside>;
  const { plan, geometry } = output;
  const last = plan.plannedMargins[plan.plannedMargins.length - 1];
  const ticks = geometry.marginTicks.map((t) => t.kind);
  const stopOf = (id: string) => plan.stops.find((s) => s.id === id);
  const tEva = plan.assumptions.find((a) => a.id === "A-T_EVA")?.value ?? null;
  const low = plan.endMargin.valueClass === "unknown" ? null : plan.endMargin.low ?? plan.endMargin.value;
  return (
    <aside className="side assess" aria-label="Assessment">
      <div className="side-scroll">
        <header className="side-head">
          <h1>Return margin</h1>
          <p>What the walk leaves of the EVA, with the route as planned.</p>
        </header>
        <div className="verdict-block" data-testid="assess-margin" data-tour="gauge">
          <Meter angle={needleAngle(low, tEva)} live={low !== null && tEva !== null} />
          <span className="k"><Term k="margin">Planned return margin</Term></span>
          <p className="big-figure flash" key={plan.versionHash}><QuantityText q={plan.endMargin} onOpen={onOpenSource} label="Planned return margin" /></p>
          {last ? <p className="big-state"><MarginState state={last.state} /></p> : <p className="note">Unknown until a reachable stop and every plan time are set.</p>}
          <p className="caveat">Estimate under stated assumptions, not a guarantee. Range from the slow ({RANGE.low} m/s) to the fast ({RANGE.high} m/s) bound;
            the state uses the <Term k="slow">slow bound</Term>: OK at or above 10% of <Term k="T_EVA">T_EVA</Term>, NEAR LIMIT from 0 to under 10%, OVER below 0.
            {ticks.length > 0 && ` The profile and the map mark where the margin ${ticks.includes("OVER") ? "reaches 0" : "falls under 10%"}.`}</p>
        </div>
        <AssumedNote output={output} />
        <p className="section-title">Traverse</p>
        {plan.legs.length > 0 && <p className="note trace-note">The moving line shows the order the margin is added up: each walk and stop, habitat to habitat. An illustration, not a live run.</p>}
        {plan.legs.length === 0 ? <div className="empty-state"><strong>No route yet</strong><span>Add stops on the Map step.</span>{toMap}</div> : (
          <ol className="ladder" aria-label="Traverse, leg by leg">
            <Trace />
            <li className="node">Habitat <span className="kind">depart</span></li>
            {plan.legs.map((l) => {
              const to = stopOf(l.toId);
              return [
                <li key={`${l.fromId}-${l.toId}`} className="leg"><span>Walk</span><QuantityText q={l.time} onOpen={onOpenSource} label={`Walking time to ${to?.letter ?? "Habitat"}`} /></li>,
                <li key={l.toId} className="node">{to ? <><span className="letter" aria-hidden="true">{to.letter}</span>{to.name}
                  <span className="dur"><QuantityText q={to.duration} onOpen={onOpenSource} label={`Stop ${to.letter} duration`} /></span></>
                  : <>Habitat <span className="kind">return</span></>}</li>,
              ];
            })}
          </ol>
        )}
        <p className="section-title"><Term k="toHab" /></p>
        <DrillPanel output={output} drillMin={drillMin} onDrillMin={onDrillMin} busy={busy} />
      </div>
      <div className="side-foot">{next}</div>
    </aside>
  );
}
