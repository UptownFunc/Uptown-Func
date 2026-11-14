// SI-assisted: drafted with Claude Code (Claude Opus 5.5); human Design + Data and Science review pending.
// Plan 7.8 status-line readout. Positions go F7 -> F1 -> F5 -> F6 through src/geo only; elevation is read from the
// engine's F6 grid. Unknown stays unknown (null), never zero.
import { f1ToF5, f5ToF6, f7ToF1, localFrame, type F1Point } from "../geo";

export interface AreaGrid {
  readonly origin: F1Point;
  readonly rows: number;
  readonly cols: number;
  readonly cell_m: number;
  readonly elevation: Float64Array;
  readonly elevationSource: string;
}

export interface Readout {
  readonly lat: string;          // planetocentric, 5 decimals (display precision)
  readonly lon: string;          // east-positive, 5 decimals (display precision)
  readonly east_m: number;       // F6, from the area origin
  readonly north_m: number;      // F6, from the area origin
  readonly elevation_m: number | null;
  readonly elevationSource: string;
}

export function readoutAt(coordF7: readonly number[], grid: AreaGrid): Readout {
  const frame = localFrame(grid.origin);
  const p = f7ToF1({ frame: "F7", x: coordF7[0]!, y: coordF7[1]! }, grid.origin.h);
  const enu = f5ToF6(f1ToF5(p), frame);
  const halfE = (grid.cols * grid.cell_m) / 2, halfN = (grid.rows * grid.cell_m) / 2;
  const col = Math.floor((enu.e + halfE) / grid.cell_m);
  const row = Math.floor((halfN - enu.n) / grid.cell_m);
  let z: number | null = null;
  if (row >= 0 && col >= 0 && row < grid.rows && col < grid.cols) {
    const v = grid.elevation[row * grid.cols + col]!;
    z = Number.isFinite(v) ? v : null;
  }
  return { lat: p.lat.toFixed(5), lon: p.lon.toFixed(5), east_m: enu.e, north_m: enu.n, elevation_m: z, elevationSource: grid.elevationSource };
}
