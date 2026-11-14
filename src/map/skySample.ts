// SI-assisted: drafted with Claude Code (Claude Opus 5.5); human Data and Science review pending.
// Plan 6.7: "The browser computes no horizons: a stop reads the nearest grid value, labelled as a 20 m sample."
// The pipeline put one observer at each cell centre of a grid centred on the area origin, so the containing F6 cell
// (src/geo/grid, the engine's cell rule) is the nearest observer. Geometry, not dose; unknown stays unknown.
import type { Quantity } from "../contracts";
import { f1, type F1Point } from "../geo";
import { f1ToCell, type GridDef } from "../geo/grid";

/** The sky-obstruction fractions (0-1, NaN for no data) in a typed array, never React state (CLAUDE.md). */
export interface SkyGrid { readonly def: GridDef; readonly values: Float32Array }
export interface SkyGridMeta { rows: number; cols: number; cell_m: number; dtype: string; scale: number; noData: number; f6Transform: number[] }

export function decodeSkyGrid(buf: ArrayBuffer, m: SkyGridMeta, origin: F1Point): SkyGrid {
  if (m.dtype !== "uint16") throw new Error(`sky grid must be uint16, got ${m.dtype}`);
  const t = m.f6Transform;
  if (t[0] !== m.cell_m || t[4] !== -m.cell_m || t[2] !== (-m.cols * m.cell_m) / 2 || t[5] !== (m.rows * m.cell_m) / 2) {
    throw new Error("sky grid is not centred on the area origin");
  }
  const q = new Uint16Array(buf);
  if (q.length !== m.rows * m.cols) throw new Error(`sky grid length ${q.length} does not match ${m.rows} x ${m.cols}`);
  const values = new Float32Array(q.length);
  for (let i = 0; i < q.length; i++) values[i] = q[i] === m.noData ? Number.NaN : q[i]! * m.scale;
  return { def: { origin, rows: m.rows, cols: m.cols, cell_m: m.cell_m }, values };
}

/** The per-stop reader handed to the console (plan 6.7). */
export type SkySampler = (p: { lat: number; lon: number }) => Quantity;

/** f_obs at the nearest 20 m observer, in % (shown to 0.1 percentage points by format.ts); h_obs is the session's assumed 1 m (V-12).
 *  Unknown outside the grid, on no-data cells, or when the grid did not load (g null). */
export function skySampleAt(p: { lat: number; lon: number }, g: SkyGrid | null): Quantity {
  const cell = g && f1ToCell(f1(p.lat, p.lon, 0), g.def);
  const v = cell ? g.values[cell.r * g.def.cols + cell.c]! : Number.NaN;
  const known = Number.isFinite(v);
  return { value: known ? v * 100 : null, unit: "%", valueClass: known ? "model_derived" : "unknown",
    methodId: "pipeline:sky-grid-6.7", assumptionIds: ["V-12"], sourceIds: ["D1", "D12"] };
}
