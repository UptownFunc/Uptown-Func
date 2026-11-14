// SI-assisted: drafted with Claude Code (Claude Opus 5.5); human Design review pending.
// Planning panel (Tier 1 subset): K-01 placeholder banner, stops, leg estimates and the planned margin state.
// It never edits the plan: deleting a stop sends a Command to the engine through onCommand.
import { useEffect, useState } from "react";
import type { PlanOutput } from "../engine/planner";
import { CONSTANTS } from "../constants";
import { formatDuration, formatLength } from "./format";

const RANGE = CONSTANTS.walkSpeedRange;
import { MarginState } from "./MarginState";
import { PlanTimes, TimeRow } from "./PlanTimes";
import { QuantityText } from "./QuantityText";
import type { Quantity, Stop } from "../contracts";
import { STOP_LIMITS } from "../engine/assumptions";
import { parseTasks } from "./stopTasks";

export interface PlanPanelProps {
  readonly output: PlanOutput | null;
  readonly message: string | null;
  readonly onDeleteStop: (stopId: string) => void;
  /** C-19: sends edit_stop; the card lists the tasks. */
  readonly onEditStop?: ((stopId: string, name: string, tasks: string[]) => void) | undefined;
  readonly onSetTime: (id: string, value_s: number, rationale: string, stopId?: string) => void;
  readonly onOpenSource?: (q: Quantity) => void;
  /** Moves a stop to the map's keyboard cursor (AC-32); undefined while there is no cursor. */
  readonly onMoveToCursor?: ((stopId: string) => void) | undefined;
  readonly children?: React.ReactNode;
}

export function PlanPanel({ output, message, onDeleteStop, onEditStop, onSetTime, onOpenSource, onMoveToCursor, children }: PlanPanelProps) {
  if (!output) return (
    <aside className="console" aria-label="Plan">
      {message ? <p className="problem" role="alert" data-testid="engine-message">{message}</p> : <p className="muted">Engine loading…</p>}
    </aside>
  );
  const { plan, geometry } = output;
  const name = (id: string) => (id === "habitat" ? "Habitat" : plan.stops.find((s) => s.id === id)?.letter ?? id);
  const end = formatDuration(plan.endMargin);
  const last = plan.plannedMargins[plan.plannedMargins.length - 1];
  const why = plan.stops.length === 0 ? "add a stop first."
    : geometry.unreachable.length > 0 ? "a leg has no slope-screened path."
    : "EVA duration, task, contingency and stop times are Assumed inputs not yet set below.";
  return (
    <aside className="console" aria-label="Plan">
      {output.kvPlaceholder && (
        <div className="banner" role="note" data-testid="assumed-banner">
          <strong>ASSUMED placeholder.</strong> Slope factors k<sub>v</sub> = 1 in every bin (K-01, team choice): slope
          changes walking time only through 3D path length. Times are estimates from the {RANGE.low}-{RANGE.high} m/s suited
          range (lunar-gravity tests, {RANGE.citation.source.split(",")[0]}, {RANGE.citation.location}), not Mars-validated.
        </div>
      )}
      <h2>Route <span className="muted">slope-screened, not rock-free</span></h2>
      <p className="muted">Habitat (Assumed scenario input). Click slope-screened ground on the sheet to add a stop.</p>
      {plan.stops.length === 0 ? <p className="muted">No stops yet.</p> : (
        <ol className="stops">
          {plan.stops.map((s) => (
            <li key={s.id}>
              <div className="stop-head">
                <span className="letter">{s.letter}</span> {s.name}
                <span className="muted"> · duration </span><QuantityText q={s.duration} onOpen={onOpenSource} label={`Stop ${s.letter} duration`} />
                <button type="button" disabled={!onMoveToCursor} onClick={() => onMoveToCursor?.(s.id)} aria-label={`Move stop ${s.letter} to the map cursor`}>Move</button>
                <button type="button" onClick={() => onDeleteStop(s.id)} aria-label={`Delete stop ${s.letter}`}>Delete</button>
              </div>
              <TimeRow id="stop_duration" stopId={s.id} label={`Stop ${s.letter} duration`} onSet={onSetTime}
                current={plan.assumptions.find((a) => a.id === `A-stop_duration-${s.id}`)}
                inherited={plan.assumptions.some((a) => a.id === "A-stop_duration") ? "uses the default" : "not set"} />
              {onEditStop && <StopEdit key={s.id} stop={s} onSave={onEditStop} />}
            </li>
          ))}
        </ol>
      )}
      {plan.legs.length > 0 && (
        <table className="legs" data-testid="legs">
          <caption className="muted">Legs on the 2 m grid path (D1 heights)</caption>
          <thead><tr><th>Leg</th>
            <th>Length <span className="badge" title="Model-derived from D1 on the 2 m grid path">model · D1</span></th>
            <th>Climb <span className="badge" title="Model-derived from D1 heights">model · D1</span></th>
            <th>Walking time <span className="badge" title={`Estimated range: ${RANGE.low}-${RANGE.high} m/s suited range, k_v placeholder`}>est.</span></th></tr></thead>
          <tbody>
            {plan.legs.map((l) => {
              return (
                <tr key={`${l.fromId}-${l.toId}`}>
                  <td>{name(l.fromId)} → {name(l.toId)}</td>
                  <td>{formatLength(l.distance_m)}</td>
                  <td>{Math.round(l.climb_m)} m</td>
                  <td><QuantityText q={l.time} onOpen={onOpenSource} label={`Walking time ${name(l.fromId)} to ${name(l.toId)}`} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
      {geometry.unreachable.length > 0 && (
        <p className="problem" role="status">
          No slope-screened path: {geometry.unreachable.map((u) => `${name(u.fromId)} → ${name(u.toId)}`).join(", ")}.
        </p>
      )}
      <h2>Planned margin</h2>
      <p data-testid="end-margin">
        End margin: <QuantityText q={plan.endMargin} onOpen={onOpenSource} label="End margin" />
        {last && <> <MarginState state={last.state} /></>}
        {end.unknown && <span className="muted"> - {why}</span>}
      </p>
      {last && (
        <p className="muted small">
          Estimate under stated assumptions, not a guarantee. Range = slow ({RANGE.low} m/s) to fast ({RANGE.high} m/s) bound; the state
          uses the slow bound. On the grid path the margin never rises and is lowest at the end (AC-19).
        </p>
      )}
      {children}
      <PlanTimes assumptions={plan.assumptions} onSet={onSetTime} />
      <p className="muted small">Plan {plan.versionHash} · {plan.engineVersion} · suit life support not modelled</p>
      {message && <p className="message" role="status" data-testid="engine-message">{message}</p>}
    </aside>
  );
}

/** C-19: a stop's name and tasks (one per line), sent to the engine as edit_stop; the card prints them. */
function StopEdit({ stop, onSave }: { stop: Stop; onSave: (stopId: string, name: string, tasks: string[]) => void }) {
  const [name, setName] = useState(stop.name);
  const [tasks, setTasks] = useState(stop.tasks.join("\n"));
  // Show what the engine stored (trimmed, or changed elsewhere) while the editor stays open.
  const stored = stop.tasks.join("\n");
  useEffect(() => { setName(stop.name); setTasks(stored); }, [stop.name, stored]);
  const { tasks: list, problem } = parseTasks(tasks);
  return (
    <details className="stop-edit">
      <summary>Name and tasks{stop.tasks.length ? ` (${stop.tasks.length})` : ""}</summary>
      <form onSubmit={(e) => { e.preventDefault(); if (name.trim() && !problem) onSave(stop.id, name.trim(), list); }}>
        <input aria-label={`Stop ${stop.letter} name`} value={name} maxLength={STOP_LIMITS.nameChars} onChange={(e) => setName(e.target.value)} />
        <textarea aria-label={`Stop ${stop.letter} tasks, one per line`} rows={3} value={tasks} onChange={(e) => setTasks(e.target.value)} />
        {problem && <span className="problem small" role="status">Tasks: {problem}.</span>}
        <button type="submit" disabled={!name.trim() || problem !== null}>Save</button>
      </form>
    </details>
  );
}
