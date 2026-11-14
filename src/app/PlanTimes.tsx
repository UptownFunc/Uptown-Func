// SI-assisted: drafted with Claude Code (Claude Opus 5.5); human Design review pending.
// Assumed plan-time inputs (plan 6.6, UX-03). No defaults (DECISIONS T-01): a field stays "not set" until a person
// enters a value in SI minutes and a one-line rationale; the change is a set_assumption Command to the engine.
import { useState } from "react";
import type { Assumption } from "../contracts";

const FIELDS = [
  { id: "T_EVA", label: "Planned EVA duration (T_EVA)" },
  { id: "t_ops", label: "Operational tasks (t_ops)" },
  { id: "t_cont", label: "Contingency (t_cont)" },
  { id: "stop_duration", label: "Duration at each stop" },
] as const;

export interface PlanTimesProps {
  readonly assumptions: readonly Assumption[];
  readonly onSet: (id: string, value_s: number, rationale: string, stopId?: string) => void;
}

export function TimeRow({ id, label, current, onSet, stopId, inherited }: {
  id: string; label: string; current: Assumption | undefined; onSet: PlanTimesProps["onSet"]; stopId?: string; inherited?: string;
}) {
  const [minutes, setMinutes] = useState("");
  const [why, setWhy] = useState("");
  const n = Number(minutes);
  const valid = minutes.trim() !== "" && Number.isFinite(n) && n >= 0 && why.trim() !== "";
  return (
    <form className="time-row" onSubmit={(e) => { e.preventDefault(); if (valid) onSet(id, n * 60, why.trim(), stopId); }}>
      <div className="time-head">
        <span>{label}</span>
        <span data-testid={`current-${id}${stopId ? `-${stopId}` : ""}`} className={current ? "assumed" : "unknown"}>
          {current ? `${(current.value / 60).toFixed(1)} min · assumed` : inherited ?? "not set"}
        </span>
      </div>
      {current && <div className="muted small">Rationale: {current.rationale}</div>}
      <div className="time-inputs">
        <label>min <input className="minutes" aria-label={`${label}, minutes`} inputMode="decimal" value={minutes} onChange={(e) => setMinutes(e.target.value)} /></label>
        <input className="rationale" aria-label={`${label}, rationale`} placeholder="one-line rationale" value={why} onChange={(e) => setWhy(e.target.value)} />
        <button type="submit" disabled={!valid}>Set</button>
      </div>
    </form>
  );
}

export function PlanTimes({ assumptions, onSet }: PlanTimesProps) {
  return (
    <section aria-label="Assumed plan times">
      <h2>Assumed plan times <span className="muted">team choices, not measurements</span></h2>
      {FIELDS.map((f) => (
        <TimeRow key={f.id} id={f.id} label={f.label} current={assumptions.find((a) => a.id === `A-${f.id}`)} onSet={onSet} />
      ))}
    </section>
  );
}
