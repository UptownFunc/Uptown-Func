// SI-assisted: drafted with Claude Code (Claude Opus 5.5); human Route Engine + Design review pending.
import { describe, expect, it } from "vitest";
import { MissionExecution, type MissionPlan } from "../contracts";
import { addTick, fieldMarginRanges, newExecution, nextEvent } from "./execution";

const q = (value: number | null, extra: object = {}) => ({ value, unit: "s", valueClass: value === null ? "unknown" as const : "assumed" as const, methodId: "m", assumptionIds: [], sourceIds: ["x"], ...extra });
const est = (low: number, high: number) => ({ value: (low + high) / 2, low, high, unit: "s", valueClass: "estimated" as const, methodId: "m", assumptionIds: ["A-kv"], sourceIds: ["D1"] });
const A = (id: string, value: number) => ({ id, name: id, value, unit: "s", rationale: "r", source: "team choice" as const });

// Habitat -> S1 -> S2 -> habitat. Slow-bound leg times are the `high` ends of the time ranges.
const plan: MissionPlan = {
  planId: "p", versionHash: "v1", engineVersion: "e", constantsVersion: "c",
  assumptions: [A("A-T_EVA", 3600), A("A-t_ops", 300), A("A-t_cont", 600)],
  stops: [
    { id: "S1", letter: "A", f1: { lat: -4.8, lon: 137.39 }, name: "A", duration: q(240), tasks: [] },
    { id: "S2", letter: "B", f1: { lat: -4.8, lon: 137.39 }, name: "B", duration: q(120), tasks: [] },
  ],
  legs: [
    { fromId: "habitat", toId: "S1", heading_deg: 90, distance_m: 500, climb_m: 0, time: est(500 / 0.97, 500 / 0.64) },
    { fromId: "S1", toId: "S2", heading_deg: 180, distance_m: 300, climb_m: 0, time: est(300 / 0.97, 300 / 0.64) },
    { fromId: "S2", toId: "habitat", heading_deg: 300, distance_m: 600, climb_m: 0, time: est(600 / 0.97, 600 / 0.64) },
  ],
  plannedMargins: [], endMargin: q(null), terrainClassSummary: {}, provenanceIds: ["D1"],
};
const returns = { S1: 500 / 0.64, S2: 450 / 0.64 };
const at = "2026-11-14T06:00:00Z";

describe("MissionExecution (written only by the field view; never edits the plan)", () => {
  it("expects ticks in plan order: arrive A, depart A, arrive B, ...", () => {
    let e = newExecution(plan);
    expect(nextEvent(plan, e)).toEqual({ stopId: "S1", kind: "arrive" });
    e = addTick(plan, e, { elapsed_min: 12, enteredAt: at });
    expect(nextEvent(plan, e)).toEqual({ stopId: "S1", kind: "depart" });
    e = addTick(plan, e, { elapsed_min: 16, enteredAt: at });
    expect(nextEvent(plan, e)).toEqual({ stopId: "S2", kind: "arrive" });
    expect(MissionExecution.safeParse(e).success).toBe(true);
    expect(e.ticks.map((t) => `${t.kind}:${t.stopId}`)).toEqual(["arrive:S1", "depart:S1"]);
    expect(e.planVersion).toBe("v1");
  });

  it("refuses elapsed times that go backwards or are not finite, and ticks after the last stop", () => {
    let e = addTick(plan, newExecution(plan), { elapsed_min: 12, enteredAt: at });
    expect(() => addTick(plan, e, { elapsed_min: 11, enteredAt: at })).toThrow(/earlier/);
    expect(() => addTick(plan, e, { elapsed_min: Number.NaN, enteredAt: at })).toThrow(/finite/);
    for (const m of [16, 20, 22]) e = addTick(plan, e, { elapsed_min: m, enteredAt: at });
    expect(nextEvent(plan, e)).toBeNull();
    expect(() => addTick(plan, e, { elapsed_min: 30, enteredAt: at })).toThrow(/no further/);
  });

  it("refuses ticks against a different plan version", () => {
    const e = newExecution({ ...plan, versionHash: "old" });
    expect(() => addTick(plan, e, { elapsed_min: 1, enteredAt: at })).toThrow(/plan version/);
  });

  it("does not mutate the plan or the previous execution", () => {
    const before = JSON.stringify(plan), e0 = newExecution(plan);
    addTick(plan, e0, { elapsed_min: 5, enteredAt: at });
    expect(JSON.stringify(plan)).toBe(before);
    expect(e0.ticks).toEqual([]);
  });
});

describe("field margins (plan 6.6), as est. ranges from manual entries", () => {
  const speedRatio = 0.64 / 0.97;

  it("computes continue and return-now at an arrival, slow bound low and fast bound high", () => {
    const e = addTick(plan, newExecution(plan), { elapsed_min: 15, enteredAt: at });
    const m = fieldMarginRanges(plan, e, returns, speedRatio)!;
    const eS = 15 * 60;
    // Continue: stay at A (240) + leg to B + B (120) + leg home + t_ops; then t_cont.
    const remSlow = 240 + 300 / 0.64 + 120 + 600 / 0.64 + 300, remFast = 240 + 300 / 0.97 + 120 + 600 / 0.97 + 300;
    expect(m.continue_s.low).toBeCloseTo(3600 - (eS + remSlow + 600), 6);
    expect(m.continue_s.high).toBeCloseTo(3600 - (eS + remFast + 600), 6);
    // Return now: walk back from A + t_ops (all of it, F-01) + t_cont.
    expect(m.returnNow_s.low).toBeCloseTo(3600 - (eS + 500 / 0.64 + 300 + 600), 6);
    expect(m.returnNow_s.high).toBeCloseTo(3600 - (eS + (500 / 0.64) * speedRatio + 300 + 600), 6);
    expect(m.lastTick).toMatchObject({ stopId: "S1", kind: "arrive", elapsed_min: 15 });
  });

  it("drops the stop's own duration after departure", () => {
    let e = addTick(plan, newExecution(plan), { elapsed_min: 15, enteredAt: at });
    e = addTick(plan, e, { elapsed_min: 19, enteredAt: at });
    const m = fieldMarginRanges(plan, e, returns, speedRatio)!;
    expect(m.continue_s.low).toBeCloseTo(3600 - (19 * 60 + 300 / 0.64 + 120 + 600 / 0.64 + 300 + 600), 6);
  });

  it("is null with no ticks, or while a plan time, stop duration or return time is unknown", () => {
    expect(fieldMarginRanges(plan, newExecution(plan), returns, speedRatio)).toBeNull();
    const e = addTick(plan, newExecution(plan), { elapsed_min: 15, enteredAt: at });
    expect(fieldMarginRanges({ ...plan, assumptions: plan.assumptions.slice(1) }, e, returns, speedRatio)).toBeNull();
    expect(fieldMarginRanges(plan, e, {}, speedRatio)).toBeNull();
    const noDur = { ...plan, stops: [{ ...plan.stops[0]!, duration: q(null) }, plan.stops[1]!] };
    expect(fieldMarginRanges(noDur, e, returns, speedRatio)).toBeNull();
  });
});

describe("stored fieldMargins (contract C-17)", () => {
  it("stores the slow-bound ends in minutes when they can be computed", () => {
    const e = addTick(plan, newExecution(plan), { elapsed_min: 15, enteredAt: at }, returns, 0.64 / 0.97);
    const m = fieldMarginRanges(plan, e, returns, 0.64 / 0.97)!;
    expect(e.fieldMargins.continue_min).toBeCloseTo(m.continue_s.low / 60, 9);
    expect(e.fieldMargins.returnNow_min).toBeCloseTo(m.returnNow_s.low / 60, 9);
    expect(e.fieldMargins.lastTickAt).toBe(at);
  });
});

describe("field-margin provenance (R-15 review finding 8)", () => {
  it("cites the assumptions every leg time carries, plus the plan times and stop durations", async () => {
    const { fieldMarginAssumptionIds } = await import("./execution");
    const plan = {
      legs: [{ time: { assumptionIds: ["A-kv", "A-slope-limit"] } }, { time: { assumptionIds: ["A-kv-new"] } }],
      stops: [{ duration: { assumptionIds: ["A-stop_duration"] } }],
    } as never;
    expect(fieldMarginAssumptionIds(plan)).toEqual(["A-kv", "A-slope-limit", "A-kv-new", "A-T_EVA", "A-t_ops", "A-t_cont", "A-stop_duration"]);
  });
});
