// SI-assisted: drafted with Claude Code (Claude Opus 5.5); human Route Engine review pending.
import { describe, expect, it } from "vitest";
import { MissionPlan } from "../contracts";
import { f1 } from "../geo";
import { cellCentreF1 } from "../geo/grid";
import { CLASS } from "./route";
import { KV_PLACEHOLDER } from "./assumptions";
import { Planner, type PlannerGrid } from "./planner";

// 41 x 41 flat 2 m grid at the demo origin, with an excluded wall in column 20 except a gap at rows 30-32.
function testGrid(): PlannerGrid {
  const rows = 41, cols = 41, n = rows * cols;
  const elevation = new Float64Array(n), classes = new Uint8Array(n).fill(CLASS.CANDIDATE);
  for (let r = 0; r < rows; r++) if (r < 30 || r > 32) classes[r * cols + 20] = CLASS.EXCLUDED;
  classes[5 * cols + 5] = CLASS.UNKNOWN;
  return { origin: f1(-4.815, 137.39, 0), rows, cols, cell_m: 2, elevation, classes };
}

const at = (g: PlannerGrid, r: number, c: number) => {
  const p = cellCentreF1({ r, c }, g);
  return { lat: p.lat, lon: p.lon };
};
let n = 0;
const cmd = (type: string, payload: Record<string, unknown>, planVersion = "none") =>
  ({ id: `c${++n}`, type, payload, issuedAt: "2026-11-14T05:00:00Z", planVersion }) as never;

function plannerWithHabitat() {
  const g = testGrid();
  const p = new Planner(g, at(g, 2, 2));
  return { g, p };
}

describe("engine planner (only writer of MissionPlan)", () => {
  it("emits a Zod-valid plan with no stops", () => {
    const { p } = plannerWithHabitat();
    const out = p.current();
    expect(MissionPlan.safeParse(out.plan).success).toBe(true);
    expect(out.plan.stops).toEqual([]);
    expect(out.plan.legs).toEqual([]);
  });

  it("refuses a habitat that is not on slope-screened ground", () => {
    const g = testGrid();
    expect(() => new Planner(g, at(g, 5, 5))).toThrow(/slope-screened/);
  });

  it("adds a stop through a command and routes out and back around the wall", () => {
    const { g, p } = plannerWithHabitat();
    const r = p.apply(cmd("add_stop", { ...at(g, 2, 38), name: "Ridge" }, p.current().plan.versionHash));
    expect(r.ok).toBe(true);
    const { plan, geometry } = p.current();
    expect(MissionPlan.safeParse(plan).success).toBe(true);
    expect(plan.stops.map((s) => s.letter)).toEqual(["A"]);
    expect(plan.legs.map((l) => [l.fromId, l.toId])).toEqual([["habitat", plan.stops[0]!.id], [plan.stops[0]!.id, "habitat"]]);
    // The only way through the wall is the gap at rows 30-32.
    const crossing = geometry.legs[0]!.cells.find((i) => i % g.cols === 20)!;
    expect(Math.floor(crossing / g.cols)).toBeGreaterThanOrEqual(30);
    expect(Math.floor(crossing / g.cols)).toBeLessThanOrEqual(32);
  });

  it("labels leg times as estimated ranges that cite the speed range and the K-01 placeholder", () => {
    const { g, p } = plannerWithHabitat();
    p.apply(cmd("add_stop", { ...at(g, 2, 10), name: "A" }, p.current().plan.versionHash));
    const t = p.current().plan.legs[0]!.time;
    expect(t.valueClass).toBe("estimated");
    expect(t.unit).toBe("s");
    expect(t.low!).toBeLessThan(t.value!);
    expect(t.high!).toBeGreaterThan(t.value!);
    expect(t.assumptionIds).toContain(KV_PLACEHOLDER.assumption.id);
    expect(t.sourceIds).toContain("walkSpeedRange");
    // 8 orthogonal 2 m steps on flat ground: 16 m / 0.83 m/s nominal.
    expect(t.value!).toBeCloseTo(16 / 0.83, 6);
    expect(t.low!).toBeCloseTo(16 / 0.97, 6);
    expect(t.high!).toBeCloseTo(16 / 0.64, 6);
  });

  it("keeps margins and stop durations unknown while the Assumed plan times are unset", () => {
    const { g, p } = plannerWithHabitat();
    p.apply(cmd("add_stop", { ...at(g, 2, 10), name: "A" }, p.current().plan.versionHash));
    const { plan } = p.current();
    expect(plan.endMargin.valueClass).toBe("unknown");
    expect(plan.endMargin.value).toBeNull();
    expect(plan.plannedMargins).toEqual([]);
    expect(plan.stops[0]!.duration.valueClass).toBe("unknown");
  });

  it("records the K-01 placeholder as a team-choice assumption", () => {
    const { p } = plannerWithHabitat();
    const a = p.current().plan.assumptions.find((x) => x.id === KV_PLACEHOLDER.assumption.id)!;
    expect(a.source).toBe("team choice");
    expect(a.value).toBe(1);
    expect(a.rationale).toMatch(/placeholder/i);
  });

  it("rejects a stop off slope-screened ground without changing the plan", () => {
    const { g, p } = plannerWithHabitat();
    const before = p.current().plan.versionHash;
    const r = p.apply(cmd("add_stop", { ...at(g, 10, 20), name: "Wall" }, before));
    expect(r.ok).toBe(false);
    expect(r.ok ? "" : r.reason).toMatch(/slope-screened/);
    expect(p.current().plan.versionHash).toBe(before);
  });

  it("rejects a command issued against a stale plan version", () => {
    const { g, p } = plannerWithHabitat();
    const r = p.apply(cmd("add_stop", { ...at(g, 2, 10), name: "A" }, "stale"));
    expect(r.ok).toBe(false);
    expect(r.ok ? "" : r.reason).toMatch(/version/);
  });

  it("moves, reorders and deletes stops, changing the version hash each time", () => {
    const { g, p } = plannerWithHabitat();
    const v = () => p.current().plan.versionHash;
    p.apply(cmd("add_stop", { ...at(g, 2, 10), name: "A" }, v()));
    p.apply(cmd("add_stop", { ...at(g, 10, 10), name: "B" }, v()));
    const [a, b] = p.current().plan.stops;
    const h1 = v();
    expect(p.apply(cmd("move_stop", { stopId: a!.id, ...at(g, 3, 10) }, h1)).ok).toBe(true);
    const h2 = v();
    expect(h2).not.toBe(h1);
    expect(p.apply(cmd("reorder_stops", { order: [b!.id, a!.id] }, h2)).ok).toBe(true);
    expect(p.current().plan.stops.map((s) => s.name)).toEqual(["B", "A"]);
    expect(p.current().plan.stops.map((s) => s.letter)).toEqual(["A", "B"]);
    expect(p.apply(cmd("delete_stop", { stopId: b!.id }, v())).ok).toBe(true);
    expect(p.current().plan.stops.map((s) => s.name)).toEqual(["A"]);
    expect(p.current().plan.legs).toHaveLength(2);
  });

  it("returns the same hash for the same inputs", () => {
    const a = plannerWithHabitat(), b = plannerWithHabitat();
    a.p.apply(cmd("add_stop", { ...at(a.g, 2, 10), name: "A" }, a.p.current().plan.versionHash));
    b.p.apply(cmd("add_stop", { ...at(b.g, 2, 10), name: "A" }, b.p.current().plan.versionHash));
    expect(a.p.current().plan.versionHash).toBe(b.p.current().plan.versionHash);
  });

  it("reports an unreachable stop instead of inventing a leg", () => {
    const g = testGrid();
    // Close the gap: the east half becomes unreachable.
    for (let r = 30; r <= 32; r++) g.classes[r * g.cols + 20] = CLASS.EXCLUDED;
    const p = new Planner(g, at(g, 2, 2));
    const r = p.apply(cmd("add_stop", { ...at(g, 2, 38), name: "Far" }, p.current().plan.versionHash));
    expect(r.ok).toBe(true);
    const { plan, geometry } = p.current();
    expect(plan.legs).toEqual([]);
    expect(geometry.unreachable).toEqual([{ fromId: "habitat", toId: plan.stops[0]!.id }, { fromId: plan.stops[0]!.id, toId: "habitat" }]);
  });

  it("does not hand out its internal plan object for mutation", () => {
    const { p } = plannerWithHabitat();
    const out = p.current();
    (out.plan.stops as unknown[]).push("x");
    expect(p.current().plan.stops).toEqual([]);
  });
});

describe("Assumed plan times via set_assumption (plan 6.6, UX-03; T-01: no values until a person enters them)", () => {
  const setTimes = (p: Planner, values: Record<string, number>) => {
    for (const [id, value_s] of Object.entries(values)) {
      const r = p.apply(cmd("set_assumption", { id, value_s, rationale: `test value for ${id}` }, p.current().plan.versionHash));
      expect(r.ok, JSON.stringify(r)).toBe(true);
    }
  };
  const ALL = { T_EVA: 4 * 3600, t_ops: 1200, t_cont: 1800, stop_duration: 900 };

  it("records each entered time as a team-choice Assumption with its rationale, in seconds", () => {
    const { p } = plannerWithHabitat();
    setTimes(p, { T_EVA: 14400 });
    const a = p.current().plan.assumptions.find((x) => x.id === "A-T_EVA")!;
    expect(a).toMatchObject({ value: 14400, unit: "s", source: "team choice", rationale: "test value for T_EVA" });
  });

  it("refuses a missing rationale, an unknown id, a negative time and a zero T_EVA", () => {
    const { p } = plannerWithHabitat();
    const v = () => p.current().plan.versionHash;
    expect(p.apply(cmd("set_assumption", { id: "T_EVA", value_s: 3600, rationale: "" }, v())).ok).toBe(false);
    expect(p.apply(cmd("set_assumption", { id: "k_v", value_s: 1, rationale: "x" }, v())).ok).toBe(false);
    expect(p.apply(cmd("set_assumption", { id: "t_ops", value_s: -1, rationale: "x" }, v())).ok).toBe(false);
    expect(p.apply(cmd("set_assumption", { id: "T_EVA", value_s: 0, rationale: "x" }, v())).ok).toBe(false);
    expect(p.current().plan.assumptions.some((a) => a.id.startsWith("A-T"))).toBe(false);
  });

  it("keeps margins unknown until every plan time is set", () => {
    const { g, p } = plannerWithHabitat();
    p.apply(cmd("add_stop", { ...at(g, 2, 10), name: "A" }, p.current().plan.versionHash));
    setTimes(p, { T_EVA: ALL.T_EVA, t_ops: ALL.t_ops, t_cont: ALL.t_cont });
    expect(p.current().plan.endMargin.valueClass).toBe("unknown");
    expect(p.current().plan.plannedMargins).toEqual([]);
  });

  it("computes the plan 6.6 end margin as an est. range (slow bound low, fast bound high) once all times are set", () => {
    const { g, p } = plannerWithHabitat();
    p.apply(cmd("add_stop", { ...at(g, 2, 10), name: "A" }, p.current().plan.versionHash));
    setTimes(p, ALL);
    const { plan } = p.current();
    expect(MissionPlan.safeParse(plan).success).toBe(true);
    // Out and back: 2 x 16 m on flat ground. The return from the stop end is 0 (at the habitat).
    const walk = (v: number) => 32 / v;
    const m = (v: number) => ALL.T_EVA - (walk(v) + ALL.stop_duration + ALL.t_ops + ALL.t_cont);
    const e = plan.endMargin;
    expect(e.valueClass).toBe("estimated");
    expect(e.unit).toBe("s");
    expect(e.low!).toBeCloseTo(m(0.64), 6);
    expect(e.value!).toBeCloseTo(m(0.83), 6);
    expect(e.high!).toBeCloseTo(m(0.97), 6);
    expect(e.assumptionIds).toEqual(expect.arrayContaining(["A-kv", "A-T_EVA", "A-t_ops", "A-t_cont", "A-stop_duration"]));
    expect(plan.stops[0]!.duration).toMatchObject({ value: 900, unit: "s", valueClass: "assumed" });
  });

  it("emits the slow-bound margin profile in minutes, never rising and lowest at the end (AC-19, grid metric)", () => {
    const { g, p } = plannerWithHabitat();
    p.apply(cmd("add_stop", { ...at(g, 2, 38), name: "Far" }, p.current().plan.versionHash));
    setTimes(p, ALL);
    const pm = p.current().plan.plannedMargins;
    expect(pm.length).toBeGreaterThan(10);
    for (let i = 1; i < pm.length; i++) {
      expect(pm[i]!.margin_min).toBeLessThanOrEqual(pm[i - 1]!.margin_min + 1e-9);
      expect(pm[i]!.s_m).toBeGreaterThanOrEqual(pm[i - 1]!.s_m);
    }
    expect(pm[pm.length - 1]!.margin_min).toBeCloseTo(p.current().plan.endMargin.low! / 60, 6);
    expect(pm[0]!.margin_min).toBeCloseTo((ALL.T_EVA - ALL.t_ops - ALL.t_cont) / 60, 6);
  });

  it("classifies the end state from the slow bound: OVER when the plan does not fit", () => {
    const { g, p } = plannerWithHabitat();
    p.apply(cmd("add_stop", { ...at(g, 2, 10), name: "A" }, p.current().plan.versionHash));
    setTimes(p, { ...ALL, T_EVA: 3000 }); // 1200 + 1800 + 900 > 3000
    const pm = p.current().plan.plannedMargins;
    expect(pm[pm.length - 1]!.state).toBe("OVER");
  });

  it("changes the version hash when an assumption changes", () => {
    const { p } = plannerWithHabitat();
    const h0 = p.current().plan.versionHash;
    setTimes(p, { T_EVA: 3600 });
    const h1 = p.current().plan.versionHash;
    setTimes(p, { T_EVA: 7200 });
    expect(new Set([h0, h1, p.current().plan.versionHash]).size).toBe(3);
  });

  it("keeps margins unknown when a leg is unreachable", () => {
    const g = testGrid();
    for (let r = 30; r <= 32; r++) g.classes[r * g.cols + 20] = CLASS.EXCLUDED;
    const p = new Planner(g, at(g, 2, 2));
    p.apply(cmd("add_stop", { ...at(g, 2, 38), name: "Far" }, p.current().plan.versionHash));
    setTimes(p, ALL);
    expect(p.current().plan.endMargin.valueClass).toBe("unknown");
  });
});
