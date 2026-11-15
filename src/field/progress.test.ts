// SI-assisted: drafted with Claude Code (Claude Opus 5.5) (HUD-01); human Route Engine + Design review pending.
// The crew's progress on the map comes from the HUD's manual ticks only: an arrival is the stop's planned cell, a
// departure is the whole next leg (no point on it is chosen), and stale or missing ticks show nothing.
import { describe, expect, it } from "vitest";
import type { MissionPlan } from "../contracts";
import type { PlanOutput } from "../engine/planner";
import { addTick, newExecution } from "./execution";
import { progressOf, progressText } from "./progress";

const q = (value: number) => ({ value, unit: "s", valueClass: "assumed" as const, methodId: "m", assumptionIds: [], sourceIds: ["x"] });
const plan = {
  planId: "p", versionHash: "v1", engineVersion: "e", constantsVersion: "c", assumptions: [],
  stops: [
    { id: "S1", letter: "A", f1: { lat: -4.8, lon: 137.39 }, name: "A", duration: q(240), tasks: [] },
    { id: "S2", letter: "B", f1: { lat: -4.8, lon: 137.39 }, name: "B", duration: q(120), tasks: [] },
  ],
  legs: [], plannedMargins: [], endMargin: q(0), terrainClassSummary: {}, provenanceIds: [],
} as unknown as MissionPlan;
// Cells: habitat 10, A 14, B 30. The engine's legs carry the grid path each walk follows.
const out = {
  plan,
  geometry: { habitatCell: 10, stopCells: { S1: 14, S2: 30 }, unreachable: [], profile: [], marginTicks: [], stopReturn_s: null,
    legs: [{ fromId: "habitat", toId: "S1", cells: [10, 11, 12, 13, 14] }, { fromId: "S1", toId: "S2", cells: [14, 22, 30] },
      { fromId: "S2", toId: "habitat", cells: [30, 20, 10] }] },
} as unknown as PlanOutput;
const at = "2026-11-15T06:00:00Z";
const tick = (e: ReturnType<typeof newExecution>, min: number) => addTick(plan, e, { elapsed_min: min, enteredAt: at });

describe("progressOf (HUD-01)", () => {
  it("shows nothing before the first tick, without a plan, or for ticks of an older plan version", () => {
    const e = newExecution(plan);
    expect(progressOf(out, e)).toBeNull();
    expect(progressOf(out, null)).toBeNull();
    expect(progressOf(null, tick(e, 12))).toBeNull();
    expect(progressOf({ ...out, plan: { ...plan, versionHash: "v2" } }, tick(e, 12))).toBeNull();
  });

  it("follows every tick: at a stop after an arrival, the whole next leg after a departure", () => {
    let e = tick(newExecution(plan), 12);
    expect(progressOf(out, e)).toEqual({ kind: "at", letter: "A", toLetter: null, elapsed_min: 12, cells: [14] });
    e = tick(e, 20);
    expect(progressOf(out, e)).toEqual({ kind: "leg", letter: "A", toLetter: "B", elapsed_min: 20, cells: [14, 22, 30] });
    e = tick(e, 31);
    expect(progressOf(out, e)?.cells).toEqual([30]);
    e = tick(e, 40);
    // After the last stop the leg walks back to the habitat.
    expect(progressOf(out, e)).toEqual({ kind: "leg", letter: "B", toLetter: null, elapsed_min: 40, cells: [30, 20, 10] });
  });

  it("keeps the departure when the engine has no path for the next leg, with no cells to draw", () => {
    const e = tick(tick(newExecution(plan), 12), 20);
    const noPath = { ...out, geometry: { ...out.geometry, legs: out.geometry.legs.filter((l) => l.fromId !== "S1") } } as PlanOutput;
    expect(progressOf(noPath, e)).toMatchObject({ kind: "leg", letter: "A", cells: [] });
  });

  it("says what the ticks establish and no more", () => {
    expect(progressText({ kind: "at", letter: "A", toLetter: null, elapsed_min: 12, cells: [14] })).toBe("Crew at A (arrival ticked at 12 min)");
    const leg = progressText({ kind: "leg", letter: "B", toLetter: null, elapsed_min: 40, cells: [30, 20, 10] });
    expect(leg).toBe("Crew on the leg B to habitat (left B at 40 min; position on the leg not tracked)");
  });
});
