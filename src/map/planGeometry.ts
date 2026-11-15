// SI-assisted: drafted with Claude Code (Claude Opus 5.5) (MAP-03); human Route Engine and Design review pending.
// The engine's plan as map features in F1, with no renderer in it: the 2D sheet projects these to F7 (src/map/planLayer)
// and a later 3D view can take the same features to F5 through src/geo. Cells go cell -> F1 through src/geo/grid only.
// Display only: the line is the 2 m grid path the margins are computed on (D-04 smoothing undecided), never smoothed.
import { cellCentreF1, type GridDef } from "../geo/grid";
import type { F1Point } from "../geo";
import type { PlanOutput } from "../engine/planner";

export type PlanLineKind = "route" | "route-over" | "leg";
export interface PlanLine { readonly kind: PlanLineKind; readonly points: readonly F1Point[] }
/** One direction mark per leg, a third of the way along it (an out-and-back pair on the same ground stays apart). */
export interface LegArrow { readonly at: F1Point; readonly toward: F1Point; readonly fromId: string; readonly toId: string }
export interface PlanPoint { readonly at: F1Point }
export interface PlanFeatures {
  readonly lines: readonly PlanLine[];
  readonly arrows: readonly LegArrow[];
  readonly ticks: readonly (PlanPoint & { readonly kind: "NEAR_LIMIT" | "OVER" })[];
  readonly habitat: PlanPoint;
  readonly stops: readonly (PlanPoint & { readonly id: string; readonly letter: string; readonly name: string })[];
}

export const cellF1 = (cell: number, grid: GridDef): F1Point => cellCentreF1({ r: Math.floor(cell / grid.cols), c: cell % grid.cols }, grid);

/** The plan's features in F1. The walk is split at the OVER tick: everything after it is drawn as over (plan 9.4). */
export function planFeatures(out: PlanOutput, grid: GridDef): PlanFeatures {
  const at = (cell: number) => cellF1(cell, grid);
  const lines: PlanLine[] = [];
  const prof = out.geometry.profile;
  const over = out.geometry.marginTicks.find((t) => t.kind === "OVER");
  const overAt = over ? prof.findIndex((p) => p.s_m >= over.s_m) : -1;
  const cut = overAt >= 0 ? overAt : prof.length;
  const line = (from: number, to: number, kind: PlanLineKind) => {
    if (to - from >= 1) lines.push({ kind, points: prof.slice(from, to + 1).map((p) => at(p.cell)) });
  };
  if (prof.length) {
    line(0, Math.min(cut, prof.length - 1), "route");
    if (overAt >= 0) line(overAt, prof.length - 1, "route-over");
  } else {
    // No whole-walk profile (a leg is unreachable): the legs that exist, each on its own.
    for (const leg of out.geometry.legs) if (leg.cells.length >= 2) lines.push({ kind: "leg", points: leg.cells.map(at) });
  }
  const arrows: LegArrow[] = [];
  for (const leg of out.geometry.legs) {
    const n = leg.cells.length;
    if (n < 6) continue; // too short to carry a mark that reads
    const i = Math.floor(n / 3), j = Math.min(n - 1, i + 2);
    arrows.push({ at: at(leg.cells[i]!), toward: at(leg.cells[j]!), fromId: leg.fromId, toId: leg.toId });
  }
  const stops = out.plan.stops.flatMap((s) => {
    const cell = out.geometry.stopCells[s.id];
    return cell === undefined ? [] : [{ at: at(cell), id: s.id, letter: s.letter, name: s.name }];
  });
  return {
    lines, arrows, stops,
    ticks: out.geometry.marginTicks.map((t) => ({ at: at(t.cell), kind: t.kind })),
    habitat: { at: at(out.geometry.habitatCell) },
  };
}
