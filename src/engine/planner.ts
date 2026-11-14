// SI-assisted: drafted with Claude Code (Claude Opus 5.5); human Route Engine review pending.
// The engine's plan store (plan 19.9, CLAUDE.md): the only writer of MissionPlan. The console changes the plan only by
// sending Commands; a command against a stale plan version is refused. Engine units are seconds and metres.
// Planned margins need T_EVA, t_ops, t_cont and a stop duration, which the plan leaves to the team (19.11 weakness 5,
// DECISIONS T-01). They have no defaults: each arrives through a set_assumption Command with a rationale, and margins
// and durations stay unknown until all are set (CLAUDE.md: unknown is never silently defaulted).
import { Command, MissionPlan, type Assumption, type Leg, type PlannedMargin, type Quantity, type Stop } from "../contracts";
import { CONSTANTS } from "../constants";
import { f1 } from "../geo";
import { f1ToPlanetographic, type PlanetographicPoint } from "../geo/planetographic";
import { marsSun, ttMinusUtc_s } from "./sun";
import { cellCentreF1, f1ToCell, type GridDef } from "../geo/grid";
import { KV_PLACEHOLDER, MARS_CLOCK_UNIT, SCENARIO_ID, SCENARIO_UNIT, SLOPE_LIMIT_ASSUMPTION } from "./assumptions";
import { legMetrics, type SpeedRange } from "./leg";
import { plannedMarginProfile } from "./margin";
import { CLASS, edgeCost, routeAStar, timeField, type RouteGrid } from "./route";
import type { MarginSample } from "./margin";

export const ENGINE_VERSION = "engine-0.4.0";
export const CONSTANTS_VERSION = "constants-2026-11-14c";

export interface PlannerGrid extends GridDef { readonly elevation: Float64Array; readonly classes: Uint8Array }
export interface LatLon { readonly lat: number; readonly lon: number }
export interface LegGeometry { readonly fromId: string; readonly toId: string; readonly cells: number[] }
/** Display data that goes with a plan version. Cells index the F6 grid; the map converts them through src/geo. */
/** One sample per route cell along the whole walk (stop cells once). z_m is D1 elevation on the F6 grid (directly
 *  measured; vertical reference unverified, D-05); s_m is cumulative 3D length (model-derived); margin_min is the
 *  slow-bound planned margin after any stop at that cell (null while unknown). */
export interface ProfileSample {
  readonly cell: number; readonly s_m: number; readonly z_m: number;
  /** Slow-bound (low) and fast-bound (high) planned margin in minutes: an est. range; both null while unknown. */
  readonly margin_min: number | null; readonly marginHigh_min: number | null;
}
/** Where the slow-bound margin first falls below 10% of T_EVA (NEAR_LIMIT) and below 0 (OVER), plan 9.4. */
export interface MarginTick { readonly kind: "NEAR_LIMIT" | "OVER"; readonly cell: number; readonly s_m: number }
export interface PlanGeometry {
  readonly habitatCell: number;
  readonly stopCells: Record<string, number>;
  readonly legs: LegGeometry[];
  readonly unreachable: { fromId: string; toId: string }[];
  readonly profile: ProfileSample[];
  readonly marginTicks: MarginTick[];
  /** Slow-bound time from each stop back to the habitat (plan 6.6 t_return), seconds; Infinity if unreachable. */
  readonly stopReturn_s: Record<string, number>;
}
/** Conditions panel, D10 part (plan 6.10, Tier 1): sun at the area centre for the Assumed scenario time. Outside the
 *  MissionPlan contract, like geometry; the scenario time itself is a plan assumption. Values stay unknown until set. */
export interface PlanConditions {
  readonly scenario: Assumption | null;
  /** The grid origin (area centre) through src/geo, in the Mars24 input convention. */
  readonly site: PlanetographicPoint;
  /** Areocentric solar longitude L_s, degrees. */
  readonly ls: Quantity;
  /** Local mean solar time at the site: a clock label in Mars hours [0, 24), never a duration. */
  readonly lmst: Quantity;
  /** Sun elevation above the horizontal, degrees; terrain shadowing not modelled. */
  readonly sunElevation: Quantity;
}
export interface PlanOutput { readonly plan: MissionPlan; readonly geometry: PlanGeometry; readonly conditions: PlanConditions; readonly kvPlaceholder: boolean }
export type ApplyResult = { ok: true; versionHash: string } | { ok: false; reason: string };

interface StopState { id: string; name: string; cell: number }

/** The Assumed plan times (plan 6.6). Payload of set_assumption: { id, value_s, rationale } (C-03, engine-defined). */
export const PLAN_TIME_IDS = {
  T_EVA: { name: "Planned EVA duration, T_EVA", min: "positive" },
  t_ops: { name: "Operational tasks (egress, ingress, equipment), t_ops", min: "zero" },
  t_cont: { name: "Contingency allowance, t_cont", min: "zero" },
  stop_duration: { name: "Planned duration at each stop", min: "zero" },
} as const;
export type PlanTimeId = keyof typeof PLAN_TIME_IDS;

const SUN_METHOD = "engine:mars24-giss-2025-01-07";
const SUN_SOURCES = ["D10", "ttMinusUtc2017"];

const HABITAT_ID = "habitat";
const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const PLAN_TIMES_UNSET: Omit<Quantity, "unit"> = {
  value: null, valueClass: "unknown", methodId: "plan-6.6:plan-times-unset", assumptionIds: [], sourceIds: ["plan-6.6"],
};

/** Non-cryptographic content hash (two FNV-1a 32-bit passes): a plan version id, not a security measure. */
function contentHash(s: string): string {
  let a = 0x811c9dc5, b = 0x01000193 ^ 0x5bd1e995;
  for (let i = 0; i < s.length; i++) {
    const ch = s.charCodeAt(i);
    a = Math.imul(a ^ ch, 0x01000193);
    b = Math.imul(b ^ ch, 0x01000193) ^ (b >>> 13);
  }
  return (a >>> 0).toString(16).padStart(8, "0") + (b >>> 0).toString(16).padStart(8, "0");
}

const str = (v: unknown): v is string => typeof v === "string" && v.length > 0;
const num = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);

export class Planner {
  private readonly grid: PlannerGrid;
  private readonly routeGrid: RouteGrid;
  private readonly speeds: SpeedRange;
  private readonly habitat: number;
  private stops: StopState[] = [];
  private nextStop = 1;
  private cached: PlanOutput | null = null;
  private planTimes: Partial<Record<PlanTimeId, Assumption>> = {};
  /** Per-stop duration overrides (seconds, rationale); the stop's letter is applied at compute time. */
  private stopDurations: Record<string, { value: number; rationale: string }> = {};
  private scenario: Assumption | null = null;
  /** Slow-bound time-to-habitat field, keyed by the inputs it depends on (habitat, k_v, slope limit, speed). */
  private slowField: { key: string; field: Float64Array } | null = null;

  constructor(grid: PlannerGrid, habitat: LatLon) {
    if (grid.elevation.length !== grid.rows * grid.cols || grid.classes.length !== grid.rows * grid.cols)
      throw new RangeError("grid arrays must hold rows x cols values");
    this.grid = grid;
    this.routeGrid = { rows: grid.rows, cols: grid.cols, cell_m: grid.cell_m, elevation: grid.elevation, classes: grid.classes };
    const r = CONSTANTS.walkSpeedRange;
    this.speeds = { nominal_mps: CONSTANTS.walkSpeedNominal.value, low_mps: r.low, high_mps: r.high,
      kBins: KV_PLACEHOLDER.kBins, slopeLimit_deg: CONSTANTS.slopeLimit.value };
    const h = this.cellAt(habitat);
    if (typeof h === "string") throw new RangeError(`habitat: ${h}`);
    this.habitat = h;
  }

  /** The cell under an F1 position, or the reason it cannot hold a habitat or stop. */
  private cellAt(p: LatLon): number | string {
    if (!num(p.lat) || !num(p.lon)) return "position must have finite lat and lon";
    let cell;
    try { cell = f1ToCell(f1(p.lat, p.lon, 0), this.grid); } catch (e) { return (e as Error).message; }
    if (!cell) return "position is outside the area";
    const i = cell.r * this.grid.cols + cell.c;
    if (this.grid.classes[i] !== CLASS.CANDIDATE) return "position is not on slope-screened ground (unknown or excluded)";
    return i;
  }

  /** A copy of the current plan; callers can never mutate the engine's own state. */
  gridShape(): { rows: number; cols: number } {
    return { rows: this.grid.rows, cols: this.grid.cols };
  }

  current(): PlanOutput {
    return structuredClone(this.peek());
  }

  private peek(): PlanOutput {
    this.cached ??= this.compute();
    return this.cached;
  }

  apply(raw: unknown): ApplyResult {
    const parsed = Command.safeParse(raw);
    if (!parsed.success) return { ok: false, reason: `invalid command: ${parsed.error.issues[0]?.message ?? "unknown"}` };
    const c = parsed.data, p = c.payload;
    const version = this.peek().plan.versionHash;
    if (c.planVersion !== version) return { ok: false, reason: `command was issued against plan version ${c.planVersion}; current version is ${version}` };
    const find = (id: unknown) => this.stops.findIndex((s) => s.id === id);
    switch (c.type) {
      case "add_stop": {
        const cell = this.cellAt(p as unknown as LatLon);
        if (typeof cell === "string") return { ok: false, reason: cell };
        if (this.stops.length >= LETTERS.length) return { ok: false, reason: "too many stops" };
        const id = `S${this.nextStop++}`;
        this.stops.push({ id, name: str(p.name) ? p.name : `Stop ${id}`, cell });
        break;
      }
      case "move_stop": {
        const k = find(p.stopId);
        if (k < 0) return { ok: false, reason: `no stop ${String(p.stopId)}` };
        const cell = this.cellAt(p as unknown as LatLon);
        if (typeof cell === "string") return { ok: false, reason: cell };
        this.stops[k] = { ...this.stops[k]!, cell };
        break;
      }
      case "delete_stop": {
        const k = find(p.stopId);
        if (k < 0) return { ok: false, reason: `no stop ${String(p.stopId)}` };
        delete this.stopDurations[this.stops[k]!.id];
        this.stops.splice(k, 1);
        break;
      }
      case "reorder_stops": {
        const order = p.order;
        const ids = this.stops.map((s) => s.id);
        if (!Array.isArray(order) || order.length !== ids.length || new Set(order).size !== ids.length || !order.every((x) => ids.includes(x as string)))
          return { ok: false, reason: "order must list every current stop id exactly once" };
        this.stops = order.map((id) => this.stops[find(id)]!);
        break;
      }
      case "recompute":
        break;
      case "set_assumption": {
        if (p.id === SCENARIO_ID) {
          const v = p.value_s;
          if (p.stopId !== undefined) return { ok: false, reason: "the scenario time applies to the whole plan, not one stop" };
          if (!num(v)) return { ok: false, reason: "scenario time must be a finite number of seconds since 1970-01-01 UTC" };
          try { ttMinusUtc_s(v * 1000); } catch (e) { return { ok: false, reason: (e as Error).message }; }
          if (!str(p.rationale) || !p.rationale.trim()) return { ok: false, reason: "every Assumed value needs a one-line rationale" };
          this.scenario = { id: `A-${SCENARIO_ID}`, name: "Scenario date and time (UTC)", value: v, unit: SCENARIO_UNIT, rationale: p.rationale.trim(), source: "team choice" };
          break;
        }
        const id = p.id as PlanTimeId;
        if (typeof p.id !== "string" || !Object.hasOwn(PLAN_TIME_IDS, id))
          return { ok: false, reason: `unknown assumption ${String(p.id)}; settable: ${[...Object.keys(PLAN_TIME_IDS), SCENARIO_ID].join(", ")}` };
        const v = p.value_s;
        if (!num(v) || v < 0 || (PLAN_TIME_IDS[id].min === "positive" && v === 0))
          return { ok: false, reason: `${id} must be a finite ${PLAN_TIME_IDS[id].min === "positive" ? "positive" : "non-negative"} number of seconds` };
        if (!str(p.rationale) || !p.rationale.trim()) return { ok: false, reason: "every Assumed value needs a one-line rationale" };
        if (p.stopId !== undefined) {
          if (id !== "stop_duration") return { ok: false, reason: "only stop_duration can be set per stop" };
          if (find(p.stopId) < 0) return { ok: false, reason: `no stop ${String(p.stopId)}` };
          this.stopDurations[p.stopId as string] = { value: v, rationale: p.rationale.trim() };
        } else {
          this.planTimes[id] = { id: `A-${id}`, name: PLAN_TIME_IDS[id].name, value: v, unit: "s", rationale: p.rationale.trim(), source: "team choice" };
        }
        break;
      }
    }
    this.cached = null;
    return { ok: true, versionHash: this.peek().plan.versionHash };
  }

  private compute(): PlanOutput {
    const g = this.grid, cols = g.cols;
    const latLon = (i: number) => { const p = cellCentreF1({ r: Math.floor(i / cols), c: i % cols }, g); return { lat: p.lat, lon: p.lon }; };
    const times = (Object.keys(PLAN_TIME_IDS) as PlanTimeId[]).map((k) => this.planTimes[k]).filter((a): a is Assumption => !!a);
    const own: Assumption[] = [];
    const durA = this.stops.map((s, k) => {
      const o = this.stopDurations[s.id];
      if (!o) return this.planTimes.stop_duration ?? null;
      const a: Assumption = { id: `A-stop_duration-${s.id}`, name: `Planned duration at stop ${LETTERS[k]} (${s.id})`, value: o.value, unit: "s", rationale: o.rationale, source: "team choice" };
      own.push(a);
      return a;
    });
    const assumptions = [KV_PLACEHOLDER.assumption, SLOPE_LIMIT_ASSUMPTION, ...times, ...own, ...(this.scenario ? [this.scenario] : [])];
    const stops: Stop[] = this.stops.map((s, k) => {
      const a = durA[k];
      const duration: Quantity = a
        ? { value: a.value, unit: "s", valueClass: "assumed", methodId: "plan-6.6:team-choice", assumptionIds: [a.id], sourceIds: ["team choice"] }
        : { ...PLAN_TIMES_UNSET, unit: "s" };
      return { id: s.id, letter: LETTERS[k]!, f1: latLon(s.cell), name: s.name, duration, tasks: [] };
    });
    const nodes = [{ id: HABITAT_ID, cell: this.habitat }, ...this.stops, ...(this.stops.length ? [{ id: HABITAT_ID, cell: this.habitat }] : [])];
    const model = { vLevel_mps: this.speeds.nominal_mps, kBins: this.speeds.kBins, slopeLimit_deg: this.speeds.slopeLimit_deg };
    const legs: Leg[] = [], geomLegs: LegGeometry[] = [], unreachable: PlanGeometry["unreachable"] = [];
    for (let k = 1; k < nodes.length; k++) {
      const a = nodes[k - 1]!, b = nodes[k]!;
      const cell = (i: number) => ({ r: Math.floor(i / cols), c: i % cols });
      const route = a.cell === b.cell ? { cells: [a.cell], time_s: 0 } : routeAStar(this.routeGrid, cell(a.cell), cell(b.cell), model);
      if (!route) { unreachable.push({ fromId: a.id, toId: b.id }); continue; }
      const m = route.cells.length >= 2 ? legMetrics(this.routeGrid, route.cells, this.speeds)
        : { heading_deg: 0, distance_m: 0, climb_m: 0, time_s: { low: 0, nominal: 0, high: 0 } };
      legs.push({
        fromId: a.id, toId: b.id, heading_deg: m.heading_deg, distance_m: m.distance_m, climb_m: m.climb_m,
        time: { value: m.time_s.nominal, low: m.time_s.low, high: m.time_s.high, unit: "s", valueClass: "estimated",
          methodId: "engine:grid-path-6.4", assumptionIds: [KV_PLACEHOLDER.assumption.id, SLOPE_LIMIT_ASSUMPTION.id],
          sourceIds: ["D1", "walkSpeedNominal", "walkSpeedRange"] },
      });
      geomLegs.push({ fromId: a.id, toId: b.id, cells: route.cells });
    }
    const margins = unreachable.length === 0 && this.stops.length > 0 ? this.margins(geomLegs.map((l) => l.cells), durA) : null;
    // A gap (unreachable leg) would join non-adjacent legs, so there is no whole-walk profile then.
    const { profile, marginTicks } = unreachable.length ? { profile: [], marginTicks: [] } : this.profile(geomLegs, margins?.samples ?? null);
    const versionHash = contentHash(JSON.stringify({ e: ENGINE_VERSION, c: CONSTANTS_VERSION, h: this.habitat,
      s: this.stops, a: assumptions, k: this.speeds }));
    const plan: MissionPlan = MissionPlan.parse({
      planId: "plan-boxwork-demo", versionHash, engineVersion: ENGINE_VERSION, constantsVersion: CONSTANTS_VERSION,
      assumptions, stops, legs, plannedMargins: margins?.profile ?? [], endMargin: margins?.end ?? { ...PLAN_TIMES_UNSET, unit: "s" },
      terrainClassSummary: legs.length ? { slope_screened_candidate: 1 } : {}, provenanceIds: ["D1"],
    });
    return {
      plan, kvPlaceholder: KV_PLACEHOLDER.isPlaceholder, conditions: this.conditions(),
      geometry: { habitatCell: this.habitat, stopCells: Object.fromEntries(this.stops.map((s) => [s.id, s.cell])), legs: geomLegs, unreachable,
        profile, marginTicks,
        stopReturn_s: this.stops.length ? Object.fromEntries(this.stops.map((s) => [s.id, this.habitatFieldSlow()[s.cell]!])) : {} },
    };
  }

  /** D10 sun and Mars time at the area centre, or unknown while the scenario time is unset. */
  private conditions(): PlanConditions {
    const site = f1ToPlanetographic(this.grid.origin), a = this.scenario;
    const unknown = (unit: string): Quantity => ({ value: null, unit, valueClass: "unknown", methodId: "plan-19.11:scenario-time-unset", assumptionIds: [], sourceIds: ["plan-19.11"] });
    if (!a) return { scenario: null, site, ls: unknown("deg"), lmst: unknown(MARS_CLOCK_UNIT), sunElevation: unknown("deg") };
    const ms = a.value * 1000, sun = marsSun(ms, ttMinusUtc_s(ms), site);
    const q = (value: number, unit: string): Quantity => ({ value, unit, valueClass: "model_derived", methodId: SUN_METHOD, assumptionIds: [a.id], sourceIds: SUN_SOURCES });
    return { scenario: { ...a }, site, ls: q(sun.ls_deg, "deg"), lmst: q(sun.lmst_h, MARS_CLOCK_UNIT), sunElevation: q(sun.elevation_deg, "deg") };
  }

  /** Plan 6.6 margins at the slow, nominal and fast speed bounds, or null while any plan time is unset.
   *  The profile and the state use the slow bound (conservative, AC-19); the end margin is an est. range. */
  /** Slow-bound time-to-habitat field (plan 6.4: Dijkstra from the habitat at the slow speed), cached by its inputs.
   *  Read-only for callers: it feeds t_return, the field margins and the tier-2 contour lines. */
  habitatFieldSlow(): Float64Array {
    const g = this.routeGrid, sp = this.speeds;
    const key = JSON.stringify([this.habitat, sp.kBins, sp.slopeLimit_deg, sp.low_mps]);
    if (this.slowField?.key !== key) {
      const h = { r: Math.floor(this.habitat / g.cols), c: this.habitat % g.cols };
      this.slowField = { key, field: timeField(g, h, { vLevel_mps: sp.low_mps, kBins: sp.kBins, slopeLimit_deg: sp.slopeLimit_deg }) };
    }
    return this.slowField.field;
  }

  private margins(legCells: number[][], durA: (Assumption | null)[]): { profile: PlannedMargin[]; samples: MarginSample[]; end: Quantity } | null {
    const t = this.planTimes;
    if (!t.T_EVA || !t.t_ops || !t.t_cont || durA.some((a) => !a)) return null;
    const times = { tEva_s: t.T_EVA.value, tOps_s: t.t_ops.value, tCont_s: t.t_cont.value };
    const stopDur = durA.map((a) => a!.value);
    const g = this.routeGrid, sp = this.speeds;
    const slow = plannedMarginProfile(g, legCells, stopDur, times, sp, this.habitatFieldSlow());
    // Walking and the walk back both scale as 1/v along the same grid path, so the end margin at another speed bound
    // follows from the slow-bound end: m(v) = fixed - travel_slow * v_low / v, with fixed = T_EVA - stops - t_ops - t_cont.
    const low = slow[slow.length - 1]!.margin_s;
    const fixed = times.tEva_s - stopDur.reduce((a, b) => a + b, 0) - times.tOps_s - times.tCont_s;
    const travelSlow = fixed - low;
    const at = (v: number) => fixed - (travelSlow * sp.low_mps) / v;
    const nominal = at(sp.nominal_mps), high = at(sp.high_mps);
    return {
      profile: slow.map((m) => ({ s_m: m.s_m, margin_min: m.margin_s / 60, state: m.state })),
      samples: slow,

      end: { value: nominal, low, high, unit: "s", valueClass: "estimated", methodId: "engine:margin-6.6-grid-metric",
        assumptionIds: [...new Set([KV_PLACEHOLDER.assumption.id, SLOPE_LIMIT_ASSUMPTION.id, "A-T_EVA", "A-t_ops", "A-t_cont", ...durA.map((a) => a!.id)])],
        sourceIds: ["D1", "walkSpeedNominal", "walkSpeedRange"] },
    };
  }

  /** Profile samples along the whole walk and the margin ticks (plan 9.4). Stop cells appear once, carrying the
   *  margin after the stop (the "depart" sample); ticks are found on all samples, so a stop can hold a tick. */
  private profile(legs: LegGeometry[], samples: MarginSample[] | null): { profile: ProfileSample[]; marginTicks: MarginTick[] } {
    const t = this.planTimes, sp = this.speeds;
    const g = this.routeGrid, out: ProfileSample[] = [];
    let s = 0;
    legs.forEach((leg, li) => {
      leg.cells.forEach((cell, j) => {
        if (j === 0 && li > 0) return; // shared with the previous leg's end
        if (j > 0) s += edgeCost(g, leg.cells[j - 1]!, cell, this.speeds).length3d_m;
        out.push({ cell, s_m: s, z_m: g.elevation[cell]!, margin_min: null, marginHigh_min: null });
      });
    });
    const ticks: MarginTick[] = [];
    if (samples) {
      const withMargin: ProfileSample[] = [];
      // Walking and the walk back scale as 1/v; stops, t_ops and t_cont do not. Stop time so far is recovered from
      // each arrive/depart pair, so the fast-bound margin follows from the slow one as for the end margin.
      const base = t.T_EVA!.value - t.t_ops!.value - t.t_cont!.value;
      let k = 0, stopsSoFar = 0, arrive = 0;
      for (const m of samples) {
        if (m.kind === "arrive") { arrive = m.margin_s; continue; } // the following "depart" sample carries the stop
        if (m.kind === "depart") stopsSoFar += arrive - m.margin_s;
        const fixed = base - stopsSoFar, travelSlow = fixed - m.margin_s;
        const p = out[k++]!;
        withMargin.push({ ...p, margin_min: m.margin_s / 60, marginHigh_min: (fixed - (travelSlow * sp.low_mps) / sp.high_mps) / 60 });
      }
      out.splice(0, out.length, ...withMargin);
      for (const kind of ["NEAR_LIMIT", "OVER"] as const) {
        const hit = samples.find((m) => (kind === "OVER" ? m.state === "OVER" : m.state !== "OK"));
        if (hit) ticks.push({ kind, cell: hit.cell, s_m: hit.s_m });
      }
    }
    return { profile: out, marginTicks: ticks };
  }
}
