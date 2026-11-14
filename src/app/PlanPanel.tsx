// SI-assisted: drafted with Claude Code (Claude Opus 5.5); human Design review pending.
// Planning panel (Tier 1 subset): K-01 placeholder banner, stops, leg estimates and the planned margin state.
// It never edits the plan: deleting a stop sends a Command to the engine through onCommand.
import type { PlanOutput } from "../engine/planner";
import { CONSTANTS } from "../constants";
import { formatDuration, formatLength } from "./format";

const RANGE = CONSTANTS.walkSpeedRange;
import { MarginState } from "./MarginState";
import { PlanTimes } from "./PlanTimes";

export interface PlanPanelProps {
  readonly output: PlanOutput | null;
  readonly message: string | null;
  readonly onDeleteStop: (stopId: string) => void;
  readonly onSetTime: (id: string, value_s: number, rationale: string) => void;
}

export function PlanPanel({ output, message, onDeleteStop, onSetTime }: PlanPanelProps) {
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
              <span className="letter">{s.letter}</span> {s.name}
              <span className="muted"> · duration {formatDuration(s.duration).text}</span>
              <button type="button" onClick={() => onDeleteStop(s.id)} aria-label={`Delete stop ${s.letter}`}>Delete</button>
            </li>
          ))}
        </ol>
      )}
      {plan.legs.length > 0 && (
        <table className="legs" data-testid="legs">
          <caption className="muted">Legs on the 2 m grid path (D1 heights)</caption>
          <thead><tr><th>Leg</th><th>Length</th><th>Climb</th><th>Walking time</th></tr></thead>
          <tbody>
            {plan.legs.map((l) => {
              const t = formatDuration(l.time);
              return (
                <tr key={`${l.fromId}-${l.toId}`}>
                  <td>{name(l.fromId)} → {name(l.toId)}</td>
                  <td>{formatLength(l.distance_m)}</td>
                  <td>{Math.round(l.climb_m)} m</td>
                  <td className={t.estimated ? "est" : undefined}>{t.text}</td>
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
        End margin: <span className={end.unknown ? "unknown" : end.estimated ? "est" : undefined}>{end.text}</span>
        {last && <> <MarginState state={last.state} /></>}
        {end.unknown && <span className="muted"> - {why}</span>}
      </p>
      {last && (
        <p className="muted small">
          Estimate under stated assumptions, not a guarantee. Range = slow ({RANGE.low} m/s) to fast ({RANGE.high} m/s) bound; the state
          uses the slow bound. On the grid path the margin never rises and is lowest at the end (AC-19).
        </p>
      )}
      <PlanTimes assumptions={plan.assumptions} onSet={onSetTime} />
      <p className="muted small">Plan {plan.versionHash} · {plan.engineVersion} · suit life support not modelled</p>
      {message && <p className="message" role="status" data-testid="engine-message">{message}</p>}
    </aside>
  );
}
