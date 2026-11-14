// SI-assisted: drafted with Claude Code (Claude Opus 5.5); human Route Engine review pending.
// Time-to-habitat contour lines (plan 6.4/6.6 tier 2, 9.2: labelled lines, never filled). Runs in the worker.
// The field is downsampled by the minimum over factor x factor blocks (a block is as near as its nearest cell), then
// d3-contour traces the levels. Unreachable cells (Infinity) count as beyond every level. Rings smaller than minArea are
// dropped as clutter (small excluded islands). Output rings are in fine-grid cell-edge coordinates: x = column edge,
// y = row edge from the north-west corner; src/geo converts them for display.
import { contours } from "d3-contour";

export interface ContourLevel { readonly level_s: number; readonly lines: [number, number][][] }

export function timeContours(field: Float64Array, rows: number, cols: number,
  opt: { factor: number; levels_s: readonly number[]; minArea_cells: number }): ContourLevel[] {
  if (opt.levels_s.length === 0) return [];
  const k = Math.max(1, Math.floor(opt.factor));
  const w = Math.ceil(cols / k), h = Math.ceil(rows / k);
  const v = new Float64Array(w * h).fill(Infinity);
  for (let r = 0; r < rows; r++) {
    const R = Math.floor(r / k) * w;
    for (let c = 0; c < cols; c++) {
      const t = field[r * cols + c]!, i = R + Math.floor(c / k);
      if (t < v[i]!) v[i] = t;
    }
  }
  // Trace the regions "time <= level" on the negated field; unreachable (Infinity) is beyond every level.
  const far = Math.max(...opt.levels_s) * 2 + 1;
  const vals = Array.from(v, (t) => -(Number.isFinite(t) ? t : far));
  const gen = contours().size([w, h]).thresholds(opt.levels_s.map((l) => -l));
  const minArea = opt.minArea_cells / (k * k);
  return gen(vals).map((mp) => ({
    level_s: -mp.value,
    lines: mp.coordinates.flat()
      .filter((ring) => Math.abs(area(ring as [number, number][])) >= minArea)
      .flatMap((ring) => splitAt(ring as [number, number][], (p) => onBorder(p, w, h) || nextToUnreachable(p, v, w, h)))
      .map((line) => line.map(([x, y]) => [x * k, y * k] as [number, number])),
  }));
}

const onBorder = ([x, y]: [number, number], w: number, h: number) => x <= 1e-9 || y <= 1e-9 || x >= w - 1e-9 || y >= h - 1e-9;

/** A point between pixel centres touching unreachable ground lies on a barrier outline, not on a time isoline. */
function nextToUnreachable([x, y]: [number, number], v: Float64Array, w: number, h: number): boolean {
  const c0 = Math.floor(x - 0.5), r0 = Math.floor(y - 0.5);
  for (let r = r0; r <= r0 + 1; r++) for (let c = c0; c <= c0 + 1; c++)
    if (r >= 0 && c >= 0 && r < h && c < w && !Number.isFinite(v[r * w + c]!)) return true;
  return false;
}

/** Drops ring points that are not on an isoline (grid border, unreachable ground) and splits the ring there.
 *  A closed ring that is cut is rejoined across its start point, so each isoline stays one line. */
function splitAt(ring: [number, number][], drop: (p: [number, number]) => boolean): [number, number][][] {
  if (!ring.some(drop)) return [ring];
  const pts = ring.slice(0, -1); // closed ring: last point repeats the first
  const start = pts.findIndex(drop);
  const lines: [number, number][][] = [];
  let cur: [number, number][] = [];
  for (let i = 1; i <= pts.length; i++) {
    const p = pts[(start + i) % pts.length]!;
    if (drop(p)) { if (cur.length > 1) lines.push(cur); cur = []; } else cur.push(p);
  }
  if (cur.length > 1) lines.push(cur);
  return lines;
}

function area(ring: [number, number][]): number {
  let a = 0;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) a += (ring[j]![0] - ring[i]![0]) * (ring[j]![1] + ring[i]![1]);
  return a / 2;
}
