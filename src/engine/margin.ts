// SI-assisted: drafted with Claude Code (Claude Opus 5.5); human Route Engine + Design review pending.
// Plan 6.6 planned and field return margins, in seconds. Estimates under stated assumptions, never "safe".
// Every walking time uses the slow bound, and t_return comes from the slow-bound habitat field, so on the grid metric
// the margin never rises along the route (AC-19). Route smoothing is undecided (D-04): this is the grid metric only.
import { kForRatio, type RouteGrid } from "./route";
import { habitatField, type SpeedRange } from "./leg";

export type MarginState = "OK" | "NEAR_LIMIT" | "OVER";

/** Assumed inputs (plan 6.6): planned EVA duration, operational tasks, contingency. Seconds. */
export interface PlanTimes { readonly tEva_s: number; readonly tOps_s: number; readonly tCont_s: number }

export interface MarginSample {
  readonly cell: number;
  readonly leg: number;
  readonly kind: "walk" | "arrive" | "depart";
  readonly s_m: number;        // cumulative 3D distance along the route
  readonly margin_s: number;
  readonly state: MarginState;
}

/** OK at or above 10% of T_EVA; NEAR_LIMIT from 0 to under 10%; OVER below 0 (the 10% band is Assumed). */
export function marginState(margin_s: number, tEva_s: number): MarginState {
  if (margin_s < 0) return "OVER";
  return margin_s >= 0.1 * tEva_s ? "OK" : "NEAR_LIMIT";
}

export function plannedMarginProfile(g: RouteGrid, legs: readonly (readonly number[])[], stopDurations_s: readonly number[],
  t: PlanTimes, s: SpeedRange): MarginSample[] {
  if (legs.length < 2) throw new RangeError("a plan needs at least an outbound and a return leg");
  if (stopDurations_s.length !== legs.length - 1) throw new RangeError("one stop duration is needed between each pair of legs");
  for (let i = 1; i < legs.length; i++)
    if (legs[i - 1]![legs[i - 1]!.length - 1] !== legs[i]![0]) throw new RangeError(`legs ${i - 1} and ${i} do not chain`);
  const home = legs[0]![0]!;
  if (legs[legs.length - 1]![legs[legs.length - 1]!.length - 1] !== home) throw new RangeError("the last leg must end at the habitat");

  const field = habitatField(g, { r: Math.floor(home / g.cols), c: home % g.cols }, s);
  const out: MarginSample[] = [];
  let walk = 0, stops = 0, dist = 0;
  const push = (cell: number, leg: number, kind: MarginSample["kind"]) => {
    const ret = field[cell]!;
    if (!Number.isFinite(ret)) throw new RangeError(`cell ${cell} cannot reach the habitat`);
    const m = t.tEva_s - (walk + stops + t.tOps_s + ret + t.tCont_s);
    out.push({ cell, leg, kind, s_m: dist, margin_s: m, state: marginState(m, t.tEva_s) });
  };
  push(home, 0, "walk");
  legs.forEach((cells, li) => {
    for (let j = 1; j < cells.length; j++) {
      const a = cells[j - 1]!, b = cells[j]!;
      const diag = Math.floor(a / g.cols) !== Math.floor(b / g.cols) && a % g.cols !== b % g.cols;
      const len = diag ? g.cell_m * Math.SQRT2 : g.cell_m;
      const dz = g.elevation[b]! - g.elevation[a]!;
      const e = Math.sqrt(len * len + dz * dz);
      walk += e / (s.low_mps * kForRatio(Math.abs(dz) / len, s));
      dist += e;
      const atStop = j === cells.length - 1 && li < legs.length - 1;
      if (atStop) {
        push(b, li, "arrive");
        stops += stopDurations_s[li]!;
        push(b, li, "depart");
      } else push(b, li, "walk");
    }
  });
  return out;
}

export interface FieldInputs {
  readonly elapsed_s: number;         // e_k, from the latest manual tick
  readonly planRemaining_s: number;   // remaining legs, stops, the walk back and ingress tasks
  readonly returnNow_s: number;       // t_return from the tick position, from the habitat field
  readonly opsRemaining_s: number;
}

/** Plan 6.6 field margins. Labelled in the UI as "from manual entries, last tick at ...". */
export function fieldMargins(f: FieldInputs, t: PlanTimes) {
  return {
    continue_s: t.tEva_s - (f.elapsed_s + f.planRemaining_s + t.tCont_s),
    returnNow_s: t.tEva_s - (f.elapsed_s + f.returnNow_s + f.opsRemaining_s + t.tCont_s),
  };
}
