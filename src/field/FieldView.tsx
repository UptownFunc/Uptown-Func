// SI-assisted: drafted with Claude Code (Claude Opus 5.5); human Design review pending.
// Field View (plan 3.3, 6.6, UX-12): one column, at most five items, readable at arm's length. The crew ticks arrival
// and departure by hand; this component alone holds and writes MissionExecution. Field margins are labelled as coming
// from manual entries with the last tick time, and never replace the planned margin. Suit life support is not modelled.
import { useState } from "react";
import type { MissionExecution, Quantity } from "../contracts";
import { CONSTANTS } from "../constants";
import type { PlanOutput } from "../engine/planner";
import { marginState } from "../engine/margin";
import { MarginState } from "../app/MarginState";
import { QuantityText } from "../app/QuantityText";
import { formatLength } from "../app/format";
import { addTick, fieldMarginRanges, newExecution, nextEvent, type Range } from "./execution";

const SPEED_RATIO = CONSTANTS.walkSpeedRange.low / CONSTANTS.walkSpeedRange.high;

export function FieldView({ output, hidden = false }: { output: PlanOutput | null; hidden?: boolean }) {
  const [exec, setExec] = useState<MissionExecution | null>(null);
  const [minutes, setMinutes] = useState("");
  const [error, setError] = useState<string | null>(null);
  if (!output) return <section className="field" aria-label="Field view" hidden={hidden}><p>Engine loading…</p></section>;
  const { plan, geometry } = output;
  const e = exec && exec.planVersion === plan.versionHash ? exec : null;
  const stale = exec !== null && exec.planVersion !== plan.versionHash;
  const ex = e ?? newExecution(plan);
  const next = nextEvent(plan, ex);
  const stopOf = (id: string) => plan.stops.find((s) => s.id === id);
  // The leg being walked or about to be walked: to the next arrival, or onward after the current stop.
  const legIndex = next ? plan.stops.findIndex((s) => s.id === next.stopId) + (next.kind === "depart" ? 1 : 0) : plan.legs.length - 1;
  const leg = plan.legs[legIndex];
  const m = fieldMarginRanges(plan, ex, geometry.stopReturn_s, SPEED_RATIO);
  const tEva = plan.assumptions.find((a) => a.id === "A-T_EVA")?.value;
  const last = ex.ticks[ex.ticks.length - 1];
  const q = (r: Range, method: string): Quantity => ({ value: r.low, low: r.low, high: r.high, unit: "s", valueClass: "estimated", methodId: method,
    assumptionIds: [...new Set(["A-kv", "A-T_EVA", "A-t_ops", "A-t_cont", ...plan.stops.flatMap((s) => s.duration.assumptionIds)])],
    sourceIds: ["manual entries", "D1", "walkSpeedRange"] });

  const tick = () => {
    try {
      const n = Number(minutes);
      if (minutes.trim() === "") throw new RangeError("enter the elapsed EVA time in minutes");
      setExec(addTick(plan, ex, { elapsed_min: n, enteredAt: new Date().toISOString() }, geometry.stopReturn_s, SPEED_RATIO));
      setMinutes(""); setError(null);
    } catch (err) { setError(err instanceof Error ? err.message : String(err)); }
  };

  return (
    <section className="field" aria-label="Field view" hidden={hidden} data-testid="field-view">
      {stale && (
        <p className="field-warning" role="alert">
          The plan changed after ticks were entered; those ticks belong to plan {exec!.planVersion}.
          <button type="button" onClick={() => setExec(null)}>Start ticks for the current plan</button>
        </p>
      )}
      {plan.stops.length === 0 ? <p className="field-item">No stops in the plan.</p> : <>
        <div className="field-item" data-testid="field-next">
          <span className="field-label">Next</span>
          {next ? <>{next.kind === "arrive" ? "Arrive at" : "Depart from"} <strong>{stopOf(next.stopId)?.letter}</strong> {stopOf(next.stopId)?.name}</> : "All stops ticked: walk back to the habitat"}
        </div>
        {leg && (
          <div className="field-item" data-testid="field-leg">
            <span className="field-label">Leg</span>
            heading {Math.round(leg.heading_deg) % 360}° · {formatLength(leg.distance_m)} <span className="field-note">(grid path, D1)</span>
          </div>
        )}
        <div className="field-item" data-testid="field-continue">
          <span className="field-label">Margin if we continue</span>
          {m && tEva ? <><QuantityText q={q(m.continue_s, "field:6.6-continue")} label="Field margin, continue" /> <MarginState state={marginState(m.continue_s.low, tEva)} /></>
            : <span className="unknown">{last ? "unknown (plan times or durations not set)" : "no tick yet"}</span>}
        </div>
        <div className="field-item" data-testid="field-return">
          <span className="field-label">Margin if we turn back now</span>
          {m && tEva ? <><QuantityText q={q(m.returnNow_s, "field:6.6-return-now")} label="Field margin, return now" /> <MarginState state={marginState(m.returnNow_s.low, tEva)} /></>
            : <span className="unknown">{last ? "unknown (plan times or durations not set)" : "no tick yet"}</span>}
        </div>
        <form className="field-item field-tick" onSubmit={(ev) => { ev.preventDefault(); tick(); }}>
          <label>Elapsed EVA time, min <input inputMode="decimal" value={minutes} onChange={(ev) => setMinutes(ev.target.value)} aria-label="Elapsed EVA time, minutes" /></label>
          {/* While ticks from an older plan exist, ticking is blocked until the crew explicitly starts over. */}
          <button type="submit" className="primary" disabled={!next || stale}>
            {next ? `Tick: ${next.kind} ${stopOf(next.stopId)?.letter}` : "All ticked"}
          </button>
          <div className="field-note" data-testid="field-provenance">
            From manual entries{last ? `, last tick at ${last.enteredAt.slice(11, 16)} UTC (${last.kind} ${stopOf(last.stopId)?.letter}, elapsed ${last.elapsed_min} min)` : "; no tick yet"}.
            Estimates under stated assumptions; the planned margin is unchanged. Suit life support not modelled.
          </div>
          {error && <div className="field-error" role="alert">{error}</div>}
        </form>
      </>}
    </section>
  );
}
