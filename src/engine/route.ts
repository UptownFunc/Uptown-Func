// SI-assisted: drafted with Claude Code (Claude Opus 5.5); human Route Engine review pending.
// Plan 6.4 routing model. Engine units are seconds and metres; the UI converts to SI minutes.
// Slope factors k_v per bin (0-5, 5-10, 10-15, 15-limit deg) are Assumed inputs; their values come from the plan
// (6.5 / 19), not from this module. Grids stay in typed arrays and never enter UI state.

/** Terrain class codes, matching pipeline/sharpwalk/grids.py (P-02, pending agreement). */
export const CLASS = { UNKNOWN: 0, CANDIDATE: 1, EXCLUDED: 2 } as const;

export interface RouteGrid {
  readonly rows: number;
  readonly cols: number;
  readonly cell_m: number;
  readonly elevation: Float64Array | Float32Array;
  readonly classes: Uint8Array;
}
export interface Cell { readonly r: number; readonly c: number }
export interface SpeedModel {
  readonly vLevel_mps: number;
  readonly kBins: readonly [number, number, number, number];
  readonly slopeLimit_deg: number;
}
export interface Route { readonly cells: number[]; readonly time_s: number }

const BIN_EDGES_DEG = [5, 10, 15] as const;
// Neighbour offsets: the first four are orthogonal, the last four diagonal.
const DR = Int8Array.of(-1, 1, 0, 0, -1, -1, 1, 1);
const DC = Int8Array.of(0, 0, -1, 1, -1, 1, -1, 1);

function checkModel(m: SpeedModel): void {
  if (!(m.vLevel_mps > 0)) throw new RangeError("vLevel_mps must be positive");
  if (!Array.isArray(m.kBins) || m.kBins.length !== 4 || m.kBins.some((k) => !(k > 0) || !Number.isFinite(k)))
    throw new RangeError("kBins must hold four positive finite factors");
  if (!(m.slopeLimit_deg > 0 && m.slopeLimit_deg < 90)) throw new RangeError("slopeLimit_deg must be in (0, 90)");
}

const TAN_BIN_EDGES = BIN_EDGES_DEG.map((d) => Math.tan((d * Math.PI) / 180));

/** Factor for an edge with |dz| / horizontal length = ratio (bin edges compared as tangents, so no atan per edge). */
function kForRatio(ratio: number, m: SpeedModel): number {
  if (ratio < TAN_BIN_EDGES[0]!) return m.kBins[0];
  if (ratio < TAN_BIN_EDGES[1]!) return m.kBins[1];
  if (ratio < TAN_BIN_EDGES[2]!) return m.kBins[2];
  return m.kBins[3];
}

const routable = (g: RouteGrid, i: number) => g.classes[i] === CLASS.CANDIDATE;

/** Octile distance over the fastest bin: a lower bound on the remaining time (plan 6.4). */
export function heuristicSeconds(from: Cell, to: Cell, cell_m: number, m: SpeedModel): number {
  const di = Math.abs(from.r - to.r), dj = Math.abs(from.c - to.c);
  return (cell_m * (Math.max(di, dj) + (Math.SQRT2 - 1) * Math.min(di, dj))) / (m.vLevel_mps * Math.max(...m.kBins));
}

class MinHeap {
  private keys = new Float64Array(1024);
  private vals = new Int32Array(1024);
  size = 0;
  push(k: number, v: number) {
    if (this.size === this.keys.length) {
      const nk = new Float64Array(this.size * 2); nk.set(this.keys); this.keys = nk;
      const nv = new Int32Array(this.size * 2); nv.set(this.vals); this.vals = nv;
    }
    const K = this.keys, V = this.vals;
    let i = this.size++;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (K[p]! <= k) break;
      K[i] = K[p]!; V[i] = V[p]!; i = p;
    }
    K[i] = k; V[i] = v;
  }
  pop(): number {
    const K = this.keys, V = this.vals, top = V[0]!;
    const last = --this.size;
    const k = K[last]!, v = V[last]!;
    let i = 0;
    for (;;) {
      const l = 2 * i + 1, r = l + 1;
      let m = i, mk = k;
      if (l < last && K[l]! < mk) { m = l; mk = K[l]!; }
      if (r < last && K[r]! < mk) { m = r; }
      if (m === i) break;
      K[i] = K[m]!; V[i] = V[m]!; i = m;
    }
    K[i] = k; V[i] = v;
    return top;
  }
}

/** Generic search. If goal < 0 it runs to exhaustion and returns the full time field. */
function search(g: RouteGrid, start: number, goal: number, m: SpeedModel, useHeuristic: boolean) {
  checkModel(m);
  const n = g.rows * g.cols;
  const dist = new Float64Array(n).fill(Infinity);
  const prev = new Int32Array(n).fill(-1);
  const done = new Uint8Array(n);
  const tanLimitTol = Math.tan((m.slopeLimit_deg * Math.PI) / 180) * (1 + 1e-12);
  const rows = g.rows, el = g.elevation, cls = g.classes, CANDIDATE = CLASS.CANDIDATE;
  const lenO = g.cell_m, lenD = g.cell_m * Math.SQRT2;
  const cols = g.cols, gr = goal >= 0 ? Math.floor(goal / cols) : 0, gc = goal >= 0 ? goal % cols : 0;
  const hScale = g.cell_m / (m.vLevel_mps * Math.max(...m.kBins)), D2 = Math.SQRT2 - 1;
  const heur = useHeuristic && goal >= 0;
  // Same bound as heuristicSeconds(), inlined to avoid allocating per node.
  const h = (r: number, c: number) => {
    if (!heur) return 0;
    const di = Math.abs(r - gr), dj = Math.abs(c - gc);
    return hScale * (di > dj ? di + D2 * dj : dj + D2 * di);
  };
  const heap = new MinHeap();
  dist[start] = 0;
  heap.push(h(Math.floor(start / cols), start % cols), start);
  while (heap.size) {
    const i = heap.pop();
    if (done[i]) continue;
    done[i] = 1;
    if (i === goal) break;
    const r = Math.floor(i / cols), c = i % cols;
    const zi = el[i]!, di = dist[i]!;
    for (let k = 0; k < 8; k++) {
      const dr = DR[k]!, dc = DC[k]!;
      const rr = r + dr, cc = c + dc;
      if (rr < 0 || cc < 0 || rr >= rows || cc >= cols) continue;
      const j = rr * cols + cc;
      if (done[j] || cls[j] !== CANDIDATE) continue;
      const diagonal = k >= 4;
      // No corner cutting: a diagonal needs both orthogonal neighbours routable.
      if (diagonal && (cls[r * cols + cc] !== CANDIDATE || cls[rr * cols + c] !== CANDIDATE)) continue;
      const len = diagonal ? lenD : lenO;
      const dz = el[j]! - zi;
      const ratio = Math.abs(dz) / len;
      if (!(ratio <= tanLimitTol)) continue; // also rejects NaN heights
      const nd = di + Math.sqrt(len * len + dz * dz) / (m.vLevel_mps * kForRatio(ratio, m));
      if (nd < dist[j]!) { dist[j] = nd; prev[j] = i; heap.push(nd + h(rr, cc), j); }
    }
  }
  return { dist, prev };
}

function endpoints(g: RouteGrid, start: Cell, goal: Cell) {
  const s = start.r * g.cols + start.c, t = goal.r * g.cols + goal.c;
  if (!routable(g, s)) throw new RangeError("start cell is not slope-screened");
  if (!routable(g, t)) throw new RangeError("goal cell is not slope-screened");
  return [s, t] as const;
}

function unwind(prev: Int32Array, start: number, goal: number): number[] {
  const cells: number[] = [];
  for (let i = goal; i !== -1; i = prev[i]!) { cells.push(i); if (i === start) break; }
  return cells.reverse();
}

function route(g: RouteGrid, start: Cell, goal: Cell, m: SpeedModel, useHeuristic: boolean): Route | null {
  const [s, t] = endpoints(g, start, goal);
  const { dist, prev } = search(g, s, t, m, useHeuristic);
  if (!Number.isFinite(dist[t]!)) return null;
  return { cells: unwind(prev, s, t), time_s: dist[t]! };
}

/** Time-optimal route on the grid (A*, admissible heuristic). */
export const routeAStar = (g: RouteGrid, start: Cell, goal: Cell, m: SpeedModel) => route(g, start, goal, m, true);
/** Plain Dijkstra; the reference oracle for A* in tests. */
export const routeDijkstra = (g: RouteGrid, start: Cell, goal: Cell, m: SpeedModel) => route(g, start, goal, m, false);

/** Time in seconds from every cell to `source` (edges are symmetric in |dz|, plan 6.4). Infinity where unreachable. */
export function timeField(g: RouteGrid, source: Cell, m: SpeedModel): Float64Array {
  const s = source.r * g.cols + source.c;
  if (!routable(g, s)) throw new RangeError("source cell is not slope-screened");
  return search(g, s, -1, m, false).dist;
}
