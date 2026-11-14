// SI-assisted: drafted with Claude Code (Claude Opus 5.5); Folio restyle on design/sharpwalk-ui-ux; human Design review pending.
// Assumed plan-time inputs (plan 6.6, UX-03). No defaults (DECISIONS T-01): a field stays "not set" until a person
// enters a value in SI minutes and a one-line rationale; the change is a set_assumption Command to the engine.
import { useState } from "react";
import type { Assumption } from "../contracts";

export const FIELDS = [
  { id: "T_EVA", label: "Planned EVA duration (T_EVA)", short: "EVA duration" },
  { id: "t_ops", label: "Operational tasks (t_ops)", short: "Operational tasks" },
  { id: "t_cont", label: "Contingency (t_cont)", short: "Contingency" },
  { id: "stop_duration", label: "Duration at each stop", short: "Each stop" },
] as const;

type OnSet = (id: string, value_s: number, rationale: string, stopId?: string) => void;

export function TimeRow({ id, label, current, onSet, stopId, inherited }: {
  id: string; label: string; current: Assumption | undefined; onSet: OnSet; stopId?: string; inherited?: string;
}) {
  const [minutes, setMinutes] = useState("");
  const [why, setWhy] = useState("");
  const n = Number(minutes);
  const valid = minutes.trim() !== "" && Number.isFinite(n) && n >= 0 && why.trim() !== "";
  return (
    <form className="time-row" onSubmit={(e) => { e.preventDefault(); if (valid) onSet(id, n * 60, why.trim(), stopId); }}>
      <div className="time-what">
        <span className="time-label">{label}</span>
        <span data-testid={`current-${id}${stopId ? `-${stopId}` : ""}`} key={current?.value} className={current ? "assumed flash" : "unknown"}>
          {current ? `${(current.value / 60).toFixed(1)} min · assumed` : inherited ?? "not set"}
        </span>
        {current && <span className="why">{current.rationale}</span>}
      </div>
      <label className="time-min"><span>min</span>
        <input aria-label={`${label}, minutes`} inputMode="decimal" value={minutes} placeholder={current ? (current.value / 60).toFixed(0) : "—"} onChange={(e) => setMinutes(e.target.value)} />
      </label>
      <input className="time-why" aria-label={`${label}, rationale`} placeholder="One-line rationale (required)" value={why} onChange={(e) => setWhy(e.target.value)} />
      <button type="submit" className="set" disabled={!valid}>Set</button>
    </form>
  );
}

export function PlanTimes({ assumptions, onSet }: { readonly assumptions: readonly Assumption[]; readonly onSet: OnSet }) {
  return (
    <section aria-label="Assumed plan times" className="times">
      {FIELDS.map((f) => (
        <TimeRow key={f.id} id={f.id} label={f.label} current={assumptions.find((a) => a.id === `A-${f.id}`)} onSet={onSet} />
      ))}
    </section>
  );
}
