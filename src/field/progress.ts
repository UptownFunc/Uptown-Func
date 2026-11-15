// SI-assisted: drafted with Claude Code (Claude Opus 5.5) (HUD-01); human Route Engine and Design review pending.
// Where the crew is along the route, from the Field HUD's manual ticks only (HUD-01). No GPS, no clock, no telemetry:
// an "arrive" tick puts the crew at that stop's planned cell; a "depart" tick says only that the crew is somewhere on
// the next leg, so the whole leg is marked and no point on it is chosen. Display only: it never edits the plan or the
// execution, and ticks that belong to an older plan version show nothing.
import type { MissionExecution } from "../contracts";
import type { PlanOutput } from "../engine/planner";

export interface Progress {
  /** "at": the crew ticked arrival at the stop; "leg": it ticked departure and is somewhere on the leg after it. */
  readonly kind: "at" | "leg";
  readonly letter: string;
  /** The next stop's letter on a "leg", or null when that leg walks back to the habitat. */
  readonly toLetter: string | null;
  /** The elapsed EVA time the crew entered with the tick, minutes (a manual entry). */
  readonly elapsed_min: number;
  /** The stop's cell ("at") or the leg's grid cells ("leg"; empty when the engine found no path for that leg). */
  readonly cells: readonly number[];
}

export function progressOf(out: PlanOutput | null, e: MissionExecution | null): Progress | null {
  const last = e?.ticks[e.ticks.length - 1];
  if (!out || !e || !last || e.planVersion !== out.plan.versionHash) return null;
  const stops = out.plan.stops, j = stops.findIndex((s) => s.id === last.stopId), cell = out.geometry.stopCells[last.stopId];
  if (j < 0 || cell === undefined) return null;
  const base = { letter: stops[j]!.letter, elapsed_min: last.elapsed_min };
  if (last.kind === "arrive") return { ...base, kind: "at", toLetter: null, cells: [cell] };
  const leg = out.geometry.legs.find((l) => l.fromId === last.stopId);
  return { ...base, kind: "leg", toLetter: stops[j + 1]?.letter ?? null, cells: leg?.cells ?? [] };
}

/** The same words on the map label, the map key's live line and the HUD, so the three never disagree. */
export function progressText(p: Progress): string {
  return p.kind === "at" ? `Crew at ${p.letter} (arrival ticked at ${p.elapsed_min} min)`
    : `Crew on the leg ${p.letter} to ${p.toLetter ?? "habitat"} (left ${p.letter} at ${p.elapsed_min} min; position on the leg not tracked)`;
}
