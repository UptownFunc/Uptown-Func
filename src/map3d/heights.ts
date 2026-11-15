// SI-assisted: drafted with Claude Code (Claude Opus 5.5) (3D-01); human Data and Science and Route Engine review pending.
// D1 heights for the 3D view, sampled from the engine's own F6 grid (the grid the route and the margins use) through
// src/geo only: F1 -> F5 -> F6 -> fractional cell, then bilinear between the four cell centres. Runs in the engine
// worker, so the grid is never copied to the page. Outside the D1 window there is no terrain: tiles there get one flat
// floor height (the window's lowest D1 height), so the sheet stands as a block and nothing is invented beyond it.
// No vertical exaggeration: heights are D1 metres as stored.
import { R_F1, f1, f1ToF5, f5ToF6 } from "../geo";
import { gridFrameOf, type GridDef } from "../geo/grid";

export interface HeightGrid extends GridDef { readonly elevation: Float64Array }

/** A tile's bounds in F1 degrees (north > south, east > west). */
export interface BoundsF1 { readonly north: number; readonly south: number; readonly east: number; readonly west: number }

/** Bilinear D1 height at an F1 position, or null outside the grid or next to a cell with no data. */
export function heightAt(g: HeightGrid, lat: number, lon: number): number | null {
  const enu = f5ToF6(f1ToF5(f1(lat, lon, 0)), gridFrameOf(g));
  // Fractional position in cell-centre units: column 0 centre at x = 0, row 0 centre at y = 0 (row 0 is north).
  const x = (enu.e + (g.cols * g.cell_m) / 2) / g.cell_m - 0.5, y = ((g.rows * g.cell_m) / 2 - enu.n) / g.cell_m - 0.5;
  if (!(x >= -0.5 && y >= -0.5 && x <= g.cols - 0.5 && y <= g.rows - 0.5)) return null;
  const cx = Math.min(Math.max(x, 0), g.cols - 1), cy = Math.min(Math.max(y, 0), g.rows - 1);
  const c0 = Math.min(Math.floor(cx), g.cols - 2), r0 = Math.min(Math.floor(cy), g.rows - 2), fx = cx - c0, fy = cy - r0;
  const z = (r: number, c: number) => g.elevation[r * g.cols + c]!;
  const v = (1 - fy) * ((1 - fx) * z(r0, c0) + fx * z(r0, c0 + 1)) + fy * ((1 - fx) * z(r0 + 1, c0) + fx * z(r0 + 1, c0 + 1));
  return Number.isFinite(v) ? v : null;
}

/** The grid's F1 bounds (a little generous), for skipping tiles that cannot touch it. */
export function gridBounds(g: HeightGrid): BoundsF1 {
  const half = (Math.max(g.rows, g.cols) * g.cell_m) / 2 + 2 * g.cell_m;
  const dLat = (half / (Math.PI * R_F1)) * 180;
  const dLon = dLat / Math.cos((g.origin.lat * Math.PI) / 180);
  return { north: g.origin.lat + dLat, south: g.origin.lat - dLat, east: g.origin.lon + dLon, west: g.origin.lon - dLon };
}

/** The window's lowest D1 height: the floor outside it. */
export function floorOf(g: HeightGrid): number {
  let m = Infinity;
  for (const v of g.elevation) if (v < m) m = v;
  return Number.isFinite(m) ? m : 0;
}

/** A w x h heightmap for one terrain tile, row 0 north, column 0 west, samples on the tile's edges (Cesium's layout). */
export function tileHeights(g: HeightGrid, b: BoundsF1, w: number, h: number, floor: number, within = gridBounds(g)): Float32Array {
  const out = new Float32Array(w * h).fill(floor);
  if (b.south > within.north || b.north < within.south || b.west > within.east || b.east < within.west) return out;
  for (let j = 0; j < h; j++) {
    const lat = b.north - ((b.north - b.south) * j) / (h - 1);
    if (lat > within.north || lat < within.south) continue;
    for (let i = 0; i < w; i++) {
      const lon = b.west + ((b.east - b.west) * i) / (w - 1);
      if (lon > within.east || lon < within.west) continue;
      const z = heightAt(g, lat, lon);
      if (z !== null) out[j * w + i] = z;
    }
  }
  return out;
}
