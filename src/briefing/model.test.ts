// SI-assisted: drafted with Claude Code (Claude Opus 5.5); human Design review pending.
import { describe, expect, it } from "vitest";
import type { MissionPlan } from "../contracts";
import { briefingModel, isStale } from "./model";

const q = (value: number, low: number, high: number) => ({
  value, low, high, unit: "s", valueClass: "estimated" as const, methodId: "m", assumptionIds: ["A-kv"], sourceIds: ["D1"],
});
const unknown = { value: null, unit: "s", valueClass: "unknown" as const, methodId: "m", assumptionIds: [], sourceIds: ["plan-6.6"] };

const plan: MissionPlan = {
  planId: "p", versionHash: "abc123", engineVersion: "engine-x", constantsVersion: "c-x",
  assumptions: [
    { id: "A-kv", name: "Slope factors", value: 1, unit: "1", rationale: "kept", source: "team choice" },
    { id: "A-T_EVA", name: "Planned EVA duration, T_EVA", value: 14400, unit: "s", rationale: "why", source: "team choice" },
  ],
  stops: [{ id: "S1", letter: "A", f1: { lat: -4.8, lon: 137.39 }, name: "Ridge", tasks: [],
    duration: { value: 900, unit: "s", valueClass: "assumed", methodId: "m", assumptionIds: ["A-stop_duration"], sourceIds: ["team choice"] } }],
  legs: [
    { fromId: "habitat", toId: "S1", heading_deg: 165.4, distance_m: 1950.2, climb_m: 248.4, time: q(2350, 2010, 3047) },
    { fromId: "S1", toId: "habitat", heading_deg: 345.4, distance_m: 1950.2, climb_m: 56, time: q(2350, 2010, 3047) },
  ],
  plannedMargins: [{ s_m: 0, margin_min: 190, state: "OK" }, { s_m: 3900, margin_min: 73.6, state: "OK" }],
  endMargin: q(5400, 4416, 6486), terrainClassSummary: {}, provenanceIds: ["D1"],
};

describe("briefing model (plan UX-10: from the current plan, with version and assumptions)", () => {
  it("stamps the plan version and lists every assumption with its rationale", () => {
    const m = briefingModel(plan);
    expect(m.versionHash).toBe("abc123");
    expect(m.assumptions.map((a) => a.id)).toEqual(["A-kv", "A-T_EVA"]);
    expect(m.assumptions[1]!.text).toBe("Planned EVA duration, T_EVA = 240.0 min (team choice): why");
  });

  it("gives each leg a heading, distance and est. time range, with stop letters", () => {
    const [a, b] = briefingModel(plan).legs;
    expect(a).toMatchObject({ label: "H → A", heading: "165°", distance: "1.95 km", time: "est. 33.5 to 50.8 min", estimated: true });
    expect(b!.label).toBe("A → H");
  });

  it("gives each stop its assumed duration, tasks (or none entered) and blanks for recorded times", () => {
    const [s] = briefingModel(plan).stops;
    expect(s).toMatchObject({ letter: "A", name: "Ridge", duration: "15.0 min", durationClass: "assumed", tasks: [] });
  });

  it("carries the end margin and its slow-bound state, or unknown", () => {
    expect(briefingModel(plan).margin).toEqual({ text: "est. 73.6 to 108.1 min", state: "OK", unknown: false });
    const m = briefingModel({ ...plan, plannedMargins: [], endMargin: unknown }).margin;
    expect(m).toEqual({ text: "unknown", state: null, unknown: true });
  });
});

describe("stale check (UX-11, AC-06)", () => {
  it("is stale whenever the current plan version differs from the card's", () => {
    expect(isStale("abc", "abc")).toBe(false);
    expect(isStale("abc", "abd")).toBe(true);
    expect(isStale("abc", null)).toBe(true);
  });
});

describe("briefing card: scenario time assumption (Conditions, plan 19.11 weakness 27)", () => {
  it("shows the scenario time as a UTC date and time, not raw seconds", () => {
    const a = { id: "A-scenario_utc", name: "Scenario date and time (UTC)", value: Date.UTC(2026, 10, 14, 4, 0) / 1000, unit: "s since 1970-01-01 UTC", rationale: "demo", source: "team choice" as const };
    const m = briefingModel({ ...plan, assumptions: [...plan.assumptions, a] });
    expect(m.assumptions[2]!.text).toBe("Scenario date and time (UTC) = 2026-11-14 04:00 UTC (team choice): demo");
  });

  it("summarises the decision: return walk, distance, elevation gain and the largest climb (UI-09)", () => {
    const m = briefingModel(plan);
    // The return walk is the engine's own last-leg estimate (no new computation); totals are sums of the legs (D1 model).
    expect(m.summary.returnWalk).toEqual({ text: "est. 33.5 to 50.8 min", estimated: true, unknown: false });
    expect(m.summary.distance).toBe("3.90 km");
    expect(m.summary.climb).toBe("304 m");
    expect(m.summary.concern).toBe("Largest climb: H → A, 248 m over 1.95 km");
  });

  it("leaves the summary unknown without a route, never zero", () => {
    const m = briefingModel({ ...plan, legs: [], stops: [], plannedMargins: [], endMargin: unknown });
    expect(m.summary.returnWalk).toEqual({ text: "unknown", estimated: false, unknown: true });
    expect(m.summary.distance).toBe("unknown");
    expect(m.summary.climb).toBe("unknown");
    expect(m.summary.concern).toBeNull();
  });

  it("names no terrain concern for a route with no climb", () => {
    const flat = plan.legs.map((l) => ({ ...l, climb_m: 0 }));
    expect(briefingModel({ ...plan, legs: flat }).summary.concern).toBeNull();
  });
});
