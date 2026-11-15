// SI-assisted: drafted with Claude Code (Claude Opus 5.5); human Route Engine + Design review pending.
// Cross-check between the engine's planned margin (Map step) and the field margins (HUD): a crew that ticks every
// arrival and departure exactly on the slow-bound plan must see the same numbers the plan showed. Uses the real
// Planner on a sloped test grid, so leg times, the habitat field and stop return times all come from the engine.
import { describe, expect, it } from "vitest";
import { f1 } from "../geo";
import { cellCentreF1 } from "../geo/grid";
import { CLASS } from "../engine/route";
import { Planner, type PlannerGrid } from "../engine/planner";
import { CONSTANTS } from "../constants";
import { addTick, fieldMarginRanges, newExecution } from "./execution";

function slopedGrid(): PlannerGrid {
  const rows = 41, cols = 41, n = rows * cols;
  const elevation = new Float64Array(n), classes = new Uint8Array(n).fill(CLASS.CANDIDATE);
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) elevation[r * cols + c] = 0.15 * c + 0.05 * r; // gentle tilt
  return { origin: f1(-4.815, 137.39, 0), rows, cols, cell_m: 2, elevation, classes };
}
const at = (g: PlannerGrid, r: number, c: number) => { const p = cellCentreF1({ r, c }, g); return { lat: p.lat, lon: p.lon }; };
let n = 0;
const cmd = (type: string, payload: Record<string, unknown>, planVersion: string) =>
  ({ id: `x${++n}`, type, payload, issuedAt: "2026-11-15T09:00:00Z", planVersion }) as never;

describe("planned margin (Map) and field margins (HUD) agree when the crew is exactly on plan", () => {
  it("reproduces the planned end margin and the planned turn-back margin at every tick", () => {
    const g = slopedGrid(), p = new Planner(g, at(g, 2, 2));
    const run = (type: string, payload: Record<string, unknown>) => {
      const r = p.apply(cmd(type, payload, p.current().plan.versionHash));
      expect(r.ok, JSON.stringify(r)).toBe(true);
    };
    run("add_stop", { ...at(g, 30, 10), name: "A" });
    run("add_stop", { ...at(g, 20, 35), name: "B" });
    const why = { rationale: "test" };
    run("set_assumption", { id: "T_EVA", value_s: 3600, ...why });
    run("set_assumption", { id: "t_ops", value_s: 300, ...why });
    run("set_assumption", { id: "t_cont", value_s: 600, ...why });
    run("set_assumption", { id: "stop_duration", value_s: 240, ...why });
    run("set_assumption", { id: "stop_duration", value_s: 120, stopId: p.current().plan.stops[1]!.id, ...why });

    const { plan, geometry } = p.current();
    const ratio = CONSTANTS.walkSpeedRange.low / CONSTANTS.walkSpeedRange.high;
    const slowLeg = plan.legs.map((l) => l.time.high!), fastLeg = plan.legs.map((l) => l.time.low!);
    const dur = plan.stops.map((s) => s.duration.value!);
    const tEva = 3600, tOps = 300, tCont = 600;

    // Tick each event at the slow-bound planned elapsed time.
    let e = newExecution(plan), clock = 0;
    plan.stops.forEach((s, k) => {
      clock += slowLeg[k]!;
      e = addTick(plan, e, { elapsed_min: clock / 60, enteredAt: "2026-11-15T09:00:00Z" });
      const arrive = fieldMarginRanges(plan, e, geometry.stopReturn_s, ratio)!;
      // Continue, slow end = the planned end margin, slow end.
      expect(arrive.continue_s.low).toBeCloseTo(plan.endMargin.low!, 6);
      // Turn back now = the plan's own margin formula at this stop before its stop time, with t_return from the field.
      expect(arrive.returnNow_s.low).toBeCloseTo(tEva - (clock + geometry.stopReturn_s[s.id]! + tOps + tCont), 6);
      clock += dur[k]!;
      e = addTick(plan, e, { elapsed_min: clock / 60, enteredAt: "2026-11-15T09:00:00Z" });
      const depart = fieldMarginRanges(plan, e, geometry.stopReturn_s, ratio)!;
      expect(depart.continue_s.low).toBeCloseTo(plan.endMargin.low!, 6);
    });
    // After the last departure, continue = the walk home; it equals the planned end margin exactly.
    clock += slowLeg[slowLeg.length - 1]!;
    expect(tEva - (clock + tOps + tCont)).toBeCloseTo(plan.endMargin.low!, 6);

    // The fast end of the planned end margin is the whole walk at the fast bound.
    const fastWalk = fastLeg.reduce((a, b) => a + b, 0);
    expect(plan.endMargin.high!).toBeCloseTo(tEva - (fastWalk + dur[0]! + dur[1]! + tOps + tCont), 6);

    // Turning back from a stop is never slower than the planned walk home from it (the field gives the shortest path).
    const homeLegSlow = slowLeg[slowLeg.length - 1]!;
    expect(geometry.stopReturn_s[plan.stops[1]!.id]!).toBeLessThanOrEqual(homeLegSlow + 1e-6);
  });

  it("a stop that runs long lowers both field margins by exactly the overrun", () => {
    const g = slopedGrid(), p = new Planner(g, at(g, 2, 2));
    const run = (type: string, payload: Record<string, unknown>) => p.apply(cmd(type, payload, p.current().plan.versionHash));
    run("add_stop", { ...at(g, 30, 10), name: "A" });
    for (const [id, value] of [["T_EVA", 3600], ["t_ops", 300], ["t_cont", 600], ["stop_duration", 240]] as const)
      run("set_assumption", { id, value_s: value, rationale: "test" });
    const { plan, geometry } = p.current();
    const ratio = CONSTANTS.walkSpeedRange.low / CONSTANTS.walkSpeedRange.high;
    const arriveAt = plan.legs[0]!.time.high! / 60;
    const margins = (stay_min: number) => {
      let e = addTick(plan, newExecution(plan), { elapsed_min: arriveAt, enteredAt: "2026-11-15T09:00:00Z" });
      e = addTick(plan, e, { elapsed_min: arriveAt + stay_min, enteredAt: "2026-11-15T09:00:00Z" });
      return fieldMarginRanges(plan, e, geometry.stopReturn_s, ratio)!;
    };
    const onTime = margins(4), late = margins(14); // planned stop: 4 min; 10 min overrun
    expect(onTime.continue_s.low - late.continue_s.low).toBeCloseTo(600, 6);
    expect(onTime.returnNow_s.low - late.returnNow_s.low).toBeCloseTo(600, 6);
  });
});
