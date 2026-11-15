// SI-assisted: drafted with Claude Code (Claude Opus 5.5); Folio HUD layout on design/sharpwalk-ui-ux; human Design review pending.
// Field View (plan 3.3, 6.6, UX-12): one column, at most five items, readable at arm's length. The crew ticks arrival
// and departure by hand; this component alone holds and writes MissionExecution. Field margins are labelled as coming
// from manual entries with the last tick time, and never replace the planned margin. Suit life support is not modelled.
import { useState, type ReactNode } from "react";
import type { MissionExecution, Quantity } from "../contracts";
import { CONSTANTS } from "../constants";
import { Term } from "../app/Term";
import type { PlanOutput } from "../engine/planner";
import { marginState } from "../engine/margin";
import { MarginState } from "../app/MarginState";
import { QuantityText } from "../app/QuantityText";
import { formatLength } from "../app/format";
import { addTick, fieldMarginAssumptionIds, fieldMarginRanges, newExecution, nextEvent, type Range } from "./execution";
import { progressOf, progressText } from "./progress";
import { infeasible } from "../app/feasible";

const SPEED_RATIO = CONSTANTS.walkSpeedRange.low / CONSTANTS.walkSpeedRange.high;

export function FieldView({ output, hidden = false, next, toMap, onExec }: { output: PlanOutput | null; hidden?: boolean; next?: ReactNode;
  /** UX-24: the way out of the empty state (a key to the Map step). */ toMap?: ReactNode;
  /** HUD-01: a read-only copy of every execution this component writes, so the map can show the crew's progress
   *  (progressOf drops ticks of an older plan). This component stays the only writer of MissionExecution. */
  onExec?: (e: MissionExecution | null) => void }) {
  const [exec, setExecState] = useState<MissionExecution | null>(null);
  const setExec = (x: MissionExecution | null) => { setExecState(x); onExec?.(x); };
  const [minutes, setMinutes] = useState("");
  const [error, setError] = useState<string | null>(null);
  if (!output) return <section className="side field" aria-label="Field view" hidden={hidden}><div className="side-scroll"><h1 className="hud-next">Field HUD</h1><p>Loading the route engine…</p></div></section>;
  const { plan, geometry } = output;
  const e = exec && exec.planVersion === plan.versionHash ? exec : null;
  const stale = exec !== null && exec.planVersion !== plan.versionHash;
  const ex = e ?? newExecution(plan);
  const next0 = nextEvent(plan, ex);
  const stopOf = (id: string) => plan.stops.find((s) => s.id === id);
  // The leg being walked or about to be walked: to the next arrival, or onward after the current stop.
  const legIndex = next0 ? plan.stops.findIndex((s) => s.id === next0.stopId) + (next0.kind === "depart" ? 1 : 0) : plan.legs.length - 1;
  const leg = plan.legs[legIndex];
  const m = fieldMarginRanges(plan, ex, geometry.stopReturn_s, SPEED_RATIO);
  const tEva = plan.assumptions.find((a) => a.id === "A-T_EVA")?.value;
  const last = ex.ticks[ex.ticks.length - 1];
  const q = (r: Range, method: string): Quantity => ({ value: r.low, low: r.low, high: r.high, unit: "s", valueClass: "estimated", methodId: method,
    assumptionIds: fieldMarginAssumptionIds(plan),
    sourceIds: ["manual entries", "D1", "walkSpeedRange"] });

  const tick = () => {
    try {
      const n = Number(minutes);
      if (minutes.trim() === "") throw new RangeError("enter the elapsed EVA time in minutes");
      setExec(addTick(plan, ex, { elapsed_min: n, enteredAt: new Date().toISOString() }, geometry.stopReturn_s, SPEED_RATIO));
      setMinutes(""); setError(null);
    } catch (err) { setError(err instanceof Error ? err.message : String(err)); }
  };

  const state = (r: Range | undefined) => (m && tEva && r ? <MarginState state={marginState(r.low, tEva)} /> : null);
  const bad = m && tEva && marginState(m.continue_s.low, tEva) === "OVER" ? "carrying on overruns the EVA at the slow speed" : infeasible(output);
  const nothing = <span className="unknown">{last ? "unknown (plan times or durations not set)" : "no tick yet"}</span>;
  return (
    <section className="side field" aria-label="Field view" hidden={hidden} data-testid="field-view">
      <div className="side-scroll" data-tour="hud">
      {stale && (
        <p className="field-warning" role="alert">
          The plan changed after ticks were entered; those ticks belong to plan {exec!.planVersion}.{" "}
          <button type="button" className="textbtn" onClick={() => setExec(null)}>Start ticks for the current plan</button>
        </p>
      )}
      {bad && <p className="infeasible" role="alert" data-testid="hud-infeasible"><MarginState state="OVER" /> <strong>Plan not feasible</strong> ({bad}).
        <strong> Turn back now.</strong> Estimate under stated assumptions.</p>}
      {plan.stops.length === 0 ? <div className="empty-lead"><h1 className="hud-next">No stops in the plan yet.</h1>
        <p className="note">The HUD walks the planned stops in order. Place at least one stop on the map first.</p>{toMap}</div> : <>
        <div data-testid="field-next"><span className="field-label">Next</span><h1 className="hud-next">
          {next0 ? <>{next0.kind === "arrive" ? "Arrive at" : "Depart from"} <strong>{stopOf(next0.stopId)?.letter}</strong> {stopOf(next0.stopId)?.name}</> : "All stops ticked: walk back to the habitat"}
        </h1></div>
        {leg && (
          <div className="hud-leg" data-testid="field-leg">
            <span className="field-label">Leg</span>
            <span className="hud-big">heading {Math.round(leg.heading_deg) % 360}° · {formatLength(leg.distance_m)}</span> <span className="field-note">(grid path, D1)</span>
          </div>
        )}
        <div className="hud-pair">
          <div className="hud-box" data-testid="field-continue">
            <span className="field-label"><Term k="goOn" /></span>
            {m && tEva ? <><QuantityText q={q(m.continue_s, "field:6.6-continue")} label="Field margin, continue" /> {state(m.continue_s)}</> : nothing}
          </div>
          <div className="hud-box" data-testid="field-return">
            <span className="field-label"><Term k="goBack" /></span>
            {m && tEva ? <><QuantityText q={q(m.returnNow_s, "field:6.6-return-now")} label="Field margin, return now" /> {state(m.returnNow_s)}</> : nothing}
          </div>
        </div>
        <form className="hud-tick" onSubmit={(ev) => { ev.preventDefault(); tick(); }}>
          <label className="hud-elapsed"><span className="field-label">Elapsed EVA time, min</span>
            <input inputMode="decimal" value={minutes} onChange={(ev) => setMinutes(ev.target.value)} aria-label="Elapsed EVA time, minutes" /></label>
          {/* While ticks from an older plan exist, ticking is blocked until the crew explicitly starts over. */}
          <button type="submit" className="go big" disabled={!next0 || stale}>
            {next0 ? `Tick: ${next0.kind} ${stopOf(next0.stopId)?.letter}` : "All ticked"}
          </button>
          {error && <div className="field-error" role="alert">{error}</div>}
        </form>
        <p className="field-note" data-testid="field-provenance">
          From manual entries{last ? `, last tick at ${last.enteredAt.slice(11, 16)} UTC (${last.kind} ${stopOf(last.stopId)?.letter}, elapsed ${last.elapsed_min} min)` : "; no tick yet"}.
          Estimates under stated assumptions; the planned margin is unchanged. Suit life support not modelled.
          {" "}<span data-testid="field-map-progress">On the map: {(() => { const p = progressOf(output, e); return p ? `${progressText(p)}.` : "the amber crew mark appears with the first tick."; })()}</span>
        </p>
      </>}
      </div>
      {next && <div className="side-foot">{next}</div>}
    </section>
  );
}
