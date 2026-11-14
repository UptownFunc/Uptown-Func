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
  if (!output) return <aside className="side" aria-label="Assessment"><p className="unknown">Engine loading…</p></aside>;
  const { plan, geometry } = output;
  const last = plan.plannedMargins[plan.plannedMargins.length - 1];
  const ticks = geometry.marginTicks.map((t) => t.kind);
  const stopOf = (id: string) => plan.stops.find((s) => s.id === id);
  return (
    <aside className="side assess" aria-label="Assessment">
      <header className="side-head">
        <p className="kicker"><span className="n">05</span>Route assessment</p>
        <h1>Planned return margin</h1>
      </header>
      <div className="verdict-block" data-testid="assess-margin">
        <p className="big-figure" key={plan.versionHash}><QuantityText q={plan.endMargin} onOpen={onOpenSource} label="Planned return margin" /></p>
        {last ? <p className="big-state"><MarginState state={last.state} /></p> : <p className="why">Unknown until a reachable stop and every plan time are set.</p>}
        <p className="caveat">Estimate under stated assumptions, not a guarantee. Range = slow ({RANGE.low} m/s) to fast ({RANGE.high} m/s) bound;
          the state uses the slow bound. Bands: OK at or above 10% of T_EVA, NEAR LIMIT from 0 to under 10%, OVER below 0.
          {ticks.length > 0 && ` The profile and the map mark where the margin ${ticks.includes("OVER") ? "reaches 0" : "falls under 10%"}.`}</p>
      </div>
      <AssumedNote output={output} />
      <h2 className="rule-head">Traverse</h2>
      {plan.legs.length === 0 ? <p className="empty-state">No route yet: add stops on the Map step.</p> : (
        <ol className="ladder" aria-label="Traverse, leg by leg">
          <li className="node">Habitat <span className="why">depart</span></li>
          {plan.legs.map((l) => {
            const to = stopOf(l.toId);
            return [
              <li key={`${l.fromId}-${l.toId}`} className="leg">walk <QuantityText q={l.time} onOpen={onOpenSource} label={`Walking time to ${to?.letter ?? "Habitat"}`} /></li>,
              <li key={l.toId} className="node">{to ? <><span className="letter" aria-hidden="true">{to.letter}</span>{to.name} <span className="why">stop</span>{" "}
                <QuantityText q={to.duration} onOpen={onOpenSource} label={`Stop ${to.letter} duration`} /></> : <>Habitat <span className="why">return</span></>}</li>,
            ];
          })}
        </ol>
      )}
      <h2 className="rule-head">Time to habitat</h2>
      <DrillPanel output={output} drillMin={drillMin} onDrillMin={onDrillMin} busy={busy} />
      <div className="side-foot">{next}</div>
    </aside>
  );
}
