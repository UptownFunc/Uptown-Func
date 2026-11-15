// SI-assisted: drafted with Claude Code (Claude Opus 5.5); Folio restyle on design/sharpwalk-ui-ux; human Design review pending.
// Assumed plan-time inputs (plan 6.6, UX-03). No defaults (DECISIONS T-01): a field stays "not set" until a person
// enters a value in SI minutes and a one-line rationale; the change is a set_assumption Command to the engine.
import { useId, useState } from "react";
import type { Assumption } from "../contracts";
import { Hint } from "./Term";
import type { TermKey } from "./glossary";
import { TIME_LIMIT_MIN } from "../engine/assumptions";

export const FIELDS = [
  { id: "T_EVA", label: "Planned EVA duration (T_EVA)", short: "EVA duration", term: "T_EVA" },
  { id: "t_ops", label: "Operational tasks (t_ops)", short: "Operational tasks", term: "t_ops" },
  { id: "t_cont", label: "Contingency (t_cont)", short: "Contingency", term: "t_cont" },
  { id: "stop_duration", label: "Duration at each stop", short: "Each stop", term: "stop" },
] as const satisfies readonly { id: string; label: string; short: string; term: TermKey }[];

type OnSet = (id: string, value_s: number, rationale: string, stopId?: string) => void;

export function TimeRow({ id, label, current, onSet, stopId, inherited, hint }: {
  id: string; label: string; current: Assumption | undefined; onSet: OnSet; stopId?: string; inherited?: string;
  /** UX-22: the variable's plain meaning, shown under its name. */
  hint?: TermKey;
}) {
  const [minutes, setMinutes] = useState("");
  const hintId = useId();
  const [why, setWhy] = useState("");
  const n = Number(minutes);
  const over = n > TIME_LIMIT_MIN; // V-15: a typing mistake such as 1,000,000 min is refused, with the reason
  const valid = minutes.trim() !== "" && Number.isFinite(n) && n >= 0 && !over && why.trim() !== "";
  return (
    <form className="time-row" onSubmit={(e) => { e.preventDefault(); if (valid) onSet(id, n * 60, why.trim(), stopId); }}>
      <div className="time-what">
        <span className="time-label">{label}</span>
        {hint && <Hint k={hint} id={hintId} />}
        <span data-testid={`current-${id}${stopId ? `-${stopId}` : ""}`} key={current?.value} className={current ? "assumed flash" : "unknown"}>
          {current ? `${(current.value / 60).toFixed(1)} min · assumed` : inherited ?? "not set"}
        </span>
        {current && <span className="why" title={current.rationale}>{current.rationale}</span>}
      </div>
      <label className="time-min"><span>min</span>
        <input aria-label={`${label}, minutes`} aria-describedby={hint ? hintId : undefined} inputMode="decimal" aria-invalid={over || undefined} value={minutes} placeholder={current ? (current.value / 60).toFixed(0) : "—"} onChange={(e) => setMinutes(e.target.value)} />
      </label>
      <input className="time-why" aria-label={`${label}, rationale`} placeholder="One-line rationale (required)" value={why} onChange={(e) => setWhy(e.target.value)} />
      <button type="submit" className="set" disabled={!valid}>Set</button>
      {over && <span className="field-error" role="alert">At most {TIME_LIMIT_MIN} min (24 h)</span>}
    </form>
  );
}

export function PlanTimes({ assumptions, onSet }: { readonly assumptions: readonly Assumption[]; readonly onSet: OnSet }) {
  return (
    <section aria-label="Assumed plan times" className="times">
      {FIELDS.map((f) => (
        <TimeRow key={f.id} id={f.id} label={f.label} hint={f.term} current={assumptions.find((a) => a.id === `A-${f.id}`)} onSet={onSet} />
      ))}
    </section>
  );
}
