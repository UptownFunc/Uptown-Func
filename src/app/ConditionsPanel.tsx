// SI-assisted: drafted with Claude Code (Claude Opus 5.5); human Design review pending.
// Conditions panel, Tier 1 (plan 4 "Conditions", 6.10): local mean solar time, solar longitude and sun elevation at
// the area centre from the Mars24 algorithm (D10), computed by the engine for an Assumed scenario date and time
// (plan 19.11 weakness 27). No default time: everything stays "unknown" until a person sets one with a rationale,
// sent as a set_assumption Command. Terrain shadowing is not modelled, and the UI says so.
import { useState } from "react";
import type { Quantity } from "../contracts";
import type { PlanOutput } from "../engine/planner";
import { SCENARIO_ID } from "../engine/assumptions";
import { QuantityText } from "./QuantityText";
import { formatUtc } from "./format";
import { remsQuantities, type RemsSnapshot } from "./rems";

export interface ConditionsPanelProps {
  readonly output: PlanOutput | null;
  readonly onSet: (id: string, value_s: number, rationale: string) => void;
  readonly onOpenSource: (q: Quantity) => void;
  /** D7 snapshot; "failed" when the file is missing or invalid (shown as such, never filled in). */
  readonly rems: RemsSnapshot | "failed" | null;
}

/** "YYYY-MM-DDTHH:MM" from a datetime-local input, read as UTC; null if not a complete date and time. */
export function parseUtcInput(v: string): number | null {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(v)) return null;
  const ms = Date.parse(`${v}:00Z`);
  return Number.isFinite(ms) ? ms / 1000 : null;
}

export function ConditionsPanel({ output, onSet, onOpenSource, rems }: ConditionsPanelProps) {
  const [when, setWhen] = useState("");
  const [why, setWhy] = useState("");
  const c = output?.conditions;
  const s = parseUtcInput(when);
  const valid = s !== null && why.trim() !== "";
  const elev = c?.sunElevation.value;
  return (
    <section aria-label="Conditions" className="conditions">
      <h2 className="rule-head">Conditions <span className="sub">sun model-derived at the area centre; weather measured at the rover</span></h2>
      <div className="readout-row">
        <span className="time-label">Scenario date and time</span>
        <span data-testid="current-scenario" key={c?.scenario?.value} className={c?.scenario ? "assumed flash" : "unknown"}>
          {c?.scenario ? `${formatUtc(c.scenario.value)} · assumed` : "not set"}
        </span>
        {c?.scenario && <span className="why">{c.scenario.rationale}</span>}
      </div>
      <details className="change" open={!c?.scenario || undefined}>
        <summary>Change the scenario time</summary>
        <form className="time-row" onSubmit={(e) => { e.preventDefault(); if (valid && s !== null) onSet(SCENARIO_ID, s, why.trim()); }}>
          <label className="time-min"><span>UTC</span><input type="datetime-local" aria-label="Scenario date and time, UTC" value={when} onChange={(e) => setWhen(e.target.value)} /></label>
          <input className="time-why" aria-label="Scenario date and time, rationale" placeholder="One-line rationale (required)" value={why} onChange={(e) => setWhy(e.target.value)} />
          <button type="submit" className="set" disabled={!valid || !output}>Set</button>
        </form>
      </details>
      {c && (
        <dl className="conditions-values">
          <dt>Local mean solar time</dt>
          <dd data-testid="cond-lmst"><QuantityText q={c.lmst} onOpen={onOpenSource} label="Local mean solar time" /> <span className="why">clock label; durations are SI minutes</span></dd>
          <dt>Sun elevation</dt>
          <dd data-testid="cond-sun"><QuantityText q={c.sunElevation} onOpen={onOpenSource} label="Sun elevation" />
            {elev != null && elev < 0 && <span> below the horizon</span>}</dd>
          <dt>Solar longitude L<sub>s</sub></dt>
          <dd data-testid="cond-ls"><QuantityText q={c.ls} onOpen={onOpenSource} label="Solar longitude" /></dd>
        </dl>
      )}
      <p className="note">Mars24 algorithm (NASA GISS) at one point, the area centre. Terrain shadowing is not modelled: nearby slopes can hide the sun.</p>
      <Rems rems={rems} onOpenSource={onOpenSource} />
    </section>
  );
}

/** D7: "conditions at Curiosity on [date], for context" (plan 19.11 weakness 27): a real recent sol at the rover. */
function Rems({ rems, onOpenSource }: { rems: ConditionsPanelProps["rems"]; onOpenSource: (q: Quantity) => void }) {
  if (rems === null) return null;
  if (rems === "failed") return <p className="unknown" data-testid="rems">Curiosity weather snapshot (D7) unavailable.</p>;
  const q = remsQuantities(rems), r = rems.reading;
  return (
    <div data-testid="rems">
      <h3>Conditions at Curiosity on {r.terrestrialDate} (sol {r.sol}), for context</h3>
      <dl className="conditions-values">
        <dt>Air temperature</dt>
        <dd><QuantityText q={q.airTempMin} onOpen={onOpenSource} label="Air temperature, minimum" /> to <QuantityText q={q.airTempMax} onOpen={onOpenSource} label="Air temperature, maximum" /></dd>
        <dt>Pressure</dt>
        <dd><QuantityText q={q.pressure} onOpen={onOpenSource} label="Air pressure" /></dd>
      </dl>
      <p className="note">REMS daily summary at the rover, not at the boxwork, and not a forecast for the scenario date. Outreach data from CAB.</p>
    </div>
  );
}
