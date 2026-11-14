// SI-assisted: drafted with Claude Code (Claude Opus 5.5) on design/sharpwalk-ui-ux (UI-01); human Design review pending.
// Assess step: the planned return margin as the one large figure, the traverse as a ladder of legs and stops (each
// number a Quantity that opens its source), and the simulated drill. Margins are estimates under stated assumptions:
// the word set is OK / NEAR LIMIT / OVER with shape and colour, and there is no SAFE state.
import type { ReactNode } from "react";
import type { Quantity } from "../contracts";
import type { PlanOutput } from "../engine/planner";
import { CONSTANTS } from "../constants";
import { DrillPanel } from "./DrillPanel";
import { MarginState } from "./MarginState";
import { AssumedNote } from "./PlanPanel";
import { QuantityText } from "./QuantityText";

const RANGE = CONSTANTS.walkSpeedRange;

export function AssessPanel({ output, onOpenSource, drillMin, onDrillMin, busy, next }: {
  output: PlanOutput | null; onOpenSource: (q: Quantity) => void; drillMin: number | null; onDrillMin: (m: number | null) => void;
  busy: boolean; next: ReactNode;
}) {
  if (!output) return <aside className="side" aria-label="Assessment"><div className="side-scroll"><p className="unknown">Loading the route engine…</p></div></aside>;
  const { plan, geometry } = output;
  const last = plan.plannedMargins[plan.plannedMargins.length - 1];
  const ticks = geometry.marginTicks.map((t) => t.kind);
  const stopOf = (id: string) => plan.stops.find((s) => s.id === id);
  return (
    <aside className="side assess" aria-label="Assessment">
      <div className="side-scroll">
        <header className="side-head">
          <h1>Return margin</h1>
          <p>What the walk leaves of the EVA, with the route as planned.</p>
        </header>
        <div className="verdict-block" data-testid="assess-margin">
          <span className="k">Planned return margin</span>
          <p className="big-figure flash" key={plan.versionHash}><QuantityText q={plan.endMargin} onOpen={onOpenSource} label="Planned return margin" /></p>
          {last ? <p className="big-state"><MarginState state={last.state} /></p> : <p className="note">Unknown until a reachable stop and every plan time are set.</p>}
          <p className="caveat">Estimate under stated assumptions, not a guarantee. Range from the slow ({RANGE.low} m/s) to the fast ({RANGE.high} m/s) bound;
            the state uses the slow bound: OK at or above 10% of T_EVA, NEAR LIMIT from 0 to under 10%, OVER below 0.
            {ticks.length > 0 && ` The profile and the map mark where the margin ${ticks.includes("OVER") ? "reaches 0" : "falls under 10%"}.`}</p>
        </div>
        <AssumedNote output={output} />
        <p className="section-title">Traverse</p>
        {plan.legs.length === 0 ? <div className="empty-state"><strong>No route yet</strong><span>Add stops on the Map step.</span></div> : (
          <ol className="ladder" aria-label="Traverse, leg by leg">
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
        <p className="section-title">Time to habitat</p>
        <DrillPanel output={output} drillMin={drillMin} onDrillMin={onDrillMin} busy={busy} />
      </div>
      <div className="side-foot">{next}</div>
    </aside>
  );
}
