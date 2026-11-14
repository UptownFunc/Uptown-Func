// SI-assisted: drafted with Claude Code (Claude Opus 5.5); Folio redesign on design/sharpwalk-ui-ux; human Design review pending.
// Map step side column: the K-01 Assumed note, the stops (details on demand), leg estimates and the live end margin.
// It never edits the plan: every action sends a Command to the engine through the callbacks.
import { useEffect, useState, type ReactNode } from "react";
import type { PlanOutput } from "../engine/planner";
import { CONSTANTS } from "../constants";
import { formatDuration, formatLength } from "./format";
import { MarginState } from "./MarginState";
import { TimeRow } from "./PlanTimes";
import { QuantityText } from "./QuantityText";
import type { SkySampler } from "../map/skySample";
import type { Quantity, Stop } from "../contracts";
import { STOP_LIMITS } from "../engine/assumptions";
import { parseTasks } from "./stopTasks";
import { Crosshair, MapPinPlus, Trash2 } from "lucide-react";
import { ICON_LG, ICON_SM } from "./icons";

const RANGE = CONSTANTS.walkSpeedRange;

export interface PlanPanelProps {
  readonly output: PlanOutput | null;
  readonly onDeleteStop: (stopId: string) => void;
  /** C-19: sends edit_stop; the card lists the tasks. */
  readonly onEditStop?: ((stopId: string, name: string, tasks: string[]) => void) | undefined;
  readonly onSetTime: (id: string, value_s: number, rationale: string, stopId?: string) => void;
  readonly onOpenSource?: (q: Quantity) => void;
  /** Moves a stop to the map's keyboard cursor (AC-32); undefined while there is no cursor. */
  readonly onMoveToCursor?: ((stopId: string) => void) | undefined;
  /** Plan 6.7: the nearest 20 m sky-obstruction value at a stop, given only while the sky layer is shown. */
  readonly skyAt?: SkySampler | null;
  readonly next?: ReactNode;
}

/** The K-01 note, shown wherever walking times are (Map and Assess). */
export function AssumedNote({ output }: { output: PlanOutput }) {
  if (!output.kvAssumed) return null;
  return (
    <details className="note-assumed" data-testid="assumed-banner">
      <summary><span className="tag">Assumed</span><span>Slope factors k<sub>v</sub> = 1</span></summary>
      <p><strong>ASSUMED.</strong> Slope factors k<sub>v</sub> = 1 in every bin (K-01, team choice; no sourced
        speed-versus-slope value exists): slope changes walking time only through 3D path length. Times are estimates from the {RANGE.low}-{RANGE.high} m/s suited
        range (lunar-gravity tests, {RANGE.citation.source.split(",")[0]}, {RANGE.citation.location}), not Mars-validated.</p>
    </details>
  );
}

export function PlanPanel({ output, onDeleteStop, onEditStop, onSetTime, onOpenSource, onMoveToCursor, skyAt, next }: PlanPanelProps) {
  if (!output) return <aside className="side" aria-label="Plan"><div className="side-scroll"><p className="unknown">Loading the route engine…</p></div></aside>;
  const { plan, geometry } = output;
  const name = (id: string) => (id === "habitat" ? "Habitat" : plan.stops.find((s) => s.id === id)?.letter ?? id);
  const end = formatDuration(plan.endMargin);
  const last = plan.plannedMargins[plan.plannedMargins.length - 1];
  const why = plan.stops.length === 0 ? "add a stop first."
    : geometry.unreachable.length > 0 ? "a leg has no slope-screened path."
    : "EVA duration, task, contingency and stop times are Assumed inputs not yet set on the Planner step.";
  return (
    <aside className="side" aria-label="Plan">
      <div className="side-scroll">
      <header className="side-head">
        <h1>Route</h1>
        <p>Slope-screened, not rock-free. The habitat is an Assumed scenario input.</p>
      </header>
      <AssumedNote output={output} />
      {plan.stops.length === 0 ? (
        <div className="empty-state">
          <MapPinPlus {...ICON_LG} aria-hidden="true" />
          <strong>No stops yet.</strong>
          <span>Click slope-screened ground on the map, or focus the map and use the arrow keys and Enter.</span>
        </div>
      ) : (
        <ol className="stops">
          {plan.stops.map((s) => (
            <li key={s.id} className="stop">
              <div className="stop-head">
                <span className="letter" aria-hidden="true">{s.letter}</span>
                <span className="stop-name">{s.name}</span>
                <span className="stop-dur"><QuantityText q={s.duration} onOpen={onOpenSource} label={`Stop ${s.letter} duration`} /></span>
                <span className="stop-acts">
                  <button type="button" className="textbtn" disabled={!onMoveToCursor} onClick={() => onMoveToCursor?.(s.id)} aria-label={`Move stop ${s.letter} to the map cursor`}
                    title="Move to the keyboard cursor"><Crosshair {...ICON_SM} aria-hidden="true" /></button>
                  <button type="button" className="textbtn danger" onClick={() => onDeleteStop(s.id)} aria-label={`Delete stop ${s.letter}`} title="Delete stop">
                    <Trash2 {...ICON_SM} aria-hidden="true" /></button>
                </span>
              </div>
              <details className="stop-more">
                <summary>Duration, name and tasks{s.tasks.length ? ` (${s.tasks.length})` : ""}</summary>
                <TimeRow id="stop_duration" stopId={s.id} label={`Stop ${s.letter} duration`} onSet={onSetTime}
                  current={plan.assumptions.find((a) => a.id === `A-stop_duration-${s.id}`)}
                  inherited={plan.assumptions.some((a) => a.id === "A-stop_duration") ? "uses the default" : "not set"} />
                {onEditStop && <StopEdit key={s.id} stop={s} onSave={onEditStop} />}
              </details>
              {skyAt && <p className="sky" data-testid="stop-sky">Sky blocked, 20 m sample (geometry, not dose):{" "}
                <QuantityText q={skyAt(s.f1)} onOpen={onOpenSource} label={`Stop ${s.letter} sky blocked`} /></p>}
            </li>
          ))}
        </ol>
      )}
      {plan.legs.length > 0 && (
        <table className="legs" data-testid="legs">
          <caption className="section-title">Legs</caption>
          <thead><tr><th>Leg</th><th>Length</th><th>Climb</th><th>Walking time</th></tr></thead>
          <tbody>
            {plan.legs.map((l) => (
              <tr key={`${l.fromId}-${l.toId}`}>
                <td>{name(l.fromId)} → {name(l.toId)}</td>
                <td>{formatLength(l.distance_m)}</td>
                <td>{Math.round(l.climb_m)} m</td>
                <td><QuantityText q={l.time} onOpen={onOpenSource} label={`Walking time ${name(l.fromId)} to ${name(l.toId)}`} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {plan.legs.length > 0 && <p className="legs-note">Length and climb are model-derived from D1 heights on the 2 m grid path. Walking times are
        estimates from the {RANGE.low}-{RANGE.high} m/s suited range with k<sub>v</sub> = 1 assumed.</p>}
      {geometry.unreachable.length > 0 && (
        <p className="problem" role="status">No slope-screened path: {geometry.unreachable.map((u) => `${name(u.fromId)} → ${name(u.toId)}`).join(", ")}.</p>
      )}
      </div>
      <div className="side-foot">
        <p className="margin-line" data-testid="end-margin">
          <span className="k">End margin</span>
          <span key={plan.versionHash} className="flash v"><QuantityText q={plan.endMargin} onOpen={onOpenSource} label="End margin" /></span>
          {last && <MarginState state={last.state} />}
          {end.unknown && <span className="why">Unknown: {why}</span>}
        </p>
        {next}
      </div>
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
    <form className="stop-edit" onSubmit={(e) => { e.preventDefault(); if (name.trim() && !problem) onSave(stop.id, name.trim(), list); }}>
      <input aria-label={`Stop ${stop.letter} name`} value={name} maxLength={STOP_LIMITS.nameChars} onChange={(e) => setName(e.target.value)} />
      <textarea aria-label={`Stop ${stop.letter} tasks, one per line`} rows={3} value={tasks} onChange={(e) => setTasks(e.target.value)} placeholder="Tasks, one per line" />
      {problem && <span className="problem" role="status">Tasks: {problem}.</span>}
      <button type="submit" className="set" disabled={!name.trim() || problem !== null}>Save</button>
    </form>
  );
}
