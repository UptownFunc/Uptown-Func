// SI-assisted: drafted with Claude Code (Claude Opus 5.5); human Design + Data and Science review pending.
// Plan 7.8 status-line readout. Positions go F7 -> F1 -> F5 -> F6 through src/geo only. The F6 grid was warped with
// +proj=ortho on the bare F1 sphere (pipeline 1.2), so the lookup uses points and origin at h = 0, which is exactly that
// projection. Every value is a Quantity (CLAUDE.md); unknown elevation stays unknown, never zero.
import type { Quantity } from "../contracts";
import { f1, f1ToF5, f5ToF6, f7ToF1, localFrame, type F1Point, type LocalFrame } from "../geo";
import { f1ToCell } from "../geo/grid";

export interface AreaGrid {
  readonly origin: F1Point;
  readonly rows: number;
  readonly cols: number;
  readonly cell_m: number;
  readonly elevation: Float64Array;
  readonly elevationSource: string;
}

export interface Readout {
  readonly lat: string;   // 5 decimals, display precision
  readonly lon: string;
  readonly latQ: Quantity;
  readonly lonQ: Quantity;
  readonly east: Quantity;
  readonly north: Quantity;
  readonly elevation: Quantity;
  readonly elevationSource: string;
}

const POSITION = { methodId: "geo:F7-F1-F5-F6", assumptionIds: [] as string[], sourceIds: ["plan-7.3"] };
const q = (value: number, unit: string): Quantity => ({ value, unit, valueClass: "model_derived", ...POSITION });

/** The grid's own local frame: the area origin on the bare sphere (h = 0). Compute once per area. */
export const gridFrame = (grid: AreaGrid): LocalFrame => localFrame(f1(grid.origin.lat, grid.origin.lon, 0));

export function readoutAt(coordF7: readonly number[], grid: AreaGrid, frame: LocalFrame = gridFrame(grid)): Readout {
  const p = f7ToF1({ frame: "F7", x: coordF7[0]!, y: coordF7[1]! }, 0);
  const enu = f5ToF6(f1ToF5(p), frame);
  // The same cell lookup as the engine (src/geo/grid), so the readout and the planner never disagree (R-02 item 8).
  const cell = f1ToCell(p, grid);
  const v = cell ? grid.elevation[cell.r * grid.cols + cell.c]! : NaN;
  const z = Number.isFinite(v) ? v : null;
  const elevation: Quantity = z === null
    ? { value: null, unit: "m", valueClass: "unknown", methodId: "pipeline:f6-grid", assumptionIds: [], sourceIds: ["D1"] }
    : { value: z, unit: "m", valueClass: "directly_measured", methodId: "pipeline:f6-grid", assumptionIds: [], sourceIds: ["D1"] };
  return {
    lat: p.lat.toFixed(5), lon: p.lon.toFixed(5), latQ: q(p.lat, "deg"), lonQ: q(p.lon, "deg"),
    east: q(enu.e, "m"), north: q(enu.n, "m"), elevation, elevationSource: grid.elevationSource,
  };
}
