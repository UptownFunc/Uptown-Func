// SI-assisted: drafted with Claude Code (Claude Opus 5.5); human Route Engine review pending.
// The engine's plan store (plan 19.9, CLAUDE.md): the only writer of MissionPlan. The console changes the plan only by
// sending Commands; a command against a stale plan version is refused. Engine units are seconds and metres.
// Planned margins need T_EVA, t_ops, t_cont and stop durations, which the plan leaves to the team (19.11 weakness 5)
// and which are not set yet, so margins and durations stay unknown rather than defaulted.
import { Command, MissionPlan, type Leg, type Quantity, type Stop } from "../contracts";
import { CONSTANTS } from "../constants";
import { f1 } from "../geo";
import { cellCentreF1, f1ToCell, type GridDef } from "../geo/grid";
import { KV_PLACEHOLDER, SLOPE_LIMIT_ASSUMPTION } from "./assumptions";
import { legMetrics, type SpeedRange } from "./leg";
import { CLASS, routeAStar, type RouteGrid } from "./route";

export const ENGINE_VERSION = "engine-0.2.0";
export const CONSTANTS_VERSION = "constants-2026-11-14b";

export interface PlannerGrid extends GridDef { readonly elevation: Float64Array; readonly classes: Uint8Array }
export interface LatLon { readonly lat: number; readonly lon: number }
export interface LegGeometry { readonly fromId: string; readonly toId: string; readonly cells: number[] }
/** Display data that goes with a plan version. Cells index the F6 grid; the map converts them through src/geo. */
export interface PlanGeometry {
  readonly habitatCell: number;
  readonly stopCells: Record<string, number>;
  readonly legs: LegGeometry[];
  readonly unreachable: { fromId: string; toId: string }[];
}
export interface PlanOutput { readonly plan: MissionPlan; readonly geometry: PlanGeometry; readonly kvPlaceholder: boolean }
export type ApplyResult = { ok: true; versionHash: string } | { ok: false; reason: string };

interface StopState { id: string; name: string; cell: number }

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

  current(): PlanOutput {
    this.cached ??= this.compute();
    return structuredClone(this.cached);
  }

  apply(raw: unknown): ApplyResult {
    const parsed = Command.safeParse(raw);
    if (!parsed.success) return { ok: false, reason: `invalid command: ${parsed.error.issues[0]?.message ?? "unknown"}` };
    const c = parsed.data, p = c.payload;
    const version = this.current().plan.versionHash;
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
      case "set_assumption":
        return { ok: false, reason: "set_assumption is not supported yet: the Assumed plan times and k_v values are not set (K-01)" };
    }
    this.cached = null;
    return { ok: true, versionHash: this.current().plan.versionHash };
  }

  private compute(): PlanOutput {
    const g = this.grid, cols = g.cols;
    const latLon = (i: number) => { const p = cellCentreF1({ r: Math.floor(i / cols), c: i % cols }, g); return { lat: p.lat, lon: p.lon }; };
    const assumptions = [KV_PLACEHOLDER.assumption, SLOPE_LIMIT_ASSUMPTION];
    const stops: Stop[] = this.stops.map((s, k) => ({
      id: s.id, letter: LETTERS[k]!, f1: latLon(s.cell), name: s.name, duration: { ...PLAN_TIMES_UNSET, unit: "s" }, tasks: [],
    }));
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
    const versionHash = contentHash(JSON.stringify({ e: ENGINE_VERSION, c: CONSTANTS_VERSION, h: this.habitat,
      s: this.stops, a: assumptions, k: this.speeds }));
    const plan: MissionPlan = MissionPlan.parse({
      planId: "plan-boxwork-demo", versionHash, engineVersion: ENGINE_VERSION, constantsVersion: CONSTANTS_VERSION,
      assumptions, stops, legs, plannedMargins: [], endMargin: { ...PLAN_TIMES_UNSET, unit: "s" },
      terrainClassSummary: legs.length ? { slope_screened_candidate: 1 } : {}, provenanceIds: ["D1"],
    });
    return {
      plan, kvPlaceholder: KV_PLACEHOLDER.isPlaceholder,
      geometry: { habitatCell: this.habitat, stopCells: Object.fromEntries(this.stops.map((s) => [s.id, s.cell])), legs: geomLegs, unreachable },
    };
  }
}
