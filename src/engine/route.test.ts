// SI-assisted: drafted with Claude Code (Claude Opus 5.5); human Route Engine review pending.
// Plan 6.4 routing model: A* on an 8-connected grid of slope-screened cells; time-optimal; admissible heuristic.
// Slope factors k_v per bin are inputs: their values are Assumed and not yet supplied (plan 6.5 / 19).
import { describe, expect, it } from "vitest";
import { CLASS, type RouteGrid, type SpeedModel, routeAStar, routeDijkstra, heuristicSeconds, timeField } from "./route";

const unitSpeed: SpeedModel = { vLevel_mps: 1, kBins: [1, 1, 1, 1], slopeLimit_deg: 20 };

function grid(rows: number, cols: number, opts: { z?: (r: number, c: number) => number; cls?: (r: number, c: number) => number; s?: number } = {}): RouteGrid {
  const elevation = new Float64Array(rows * cols);
  const classes = new Uint8Array(rows * cols);
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      elevation[r * cols + c] = opts.z ? opts.z(r, c) : 0;
      classes[r * cols + c] = opts.cls ? opts.cls(r, c) : CLASS.CANDIDATE;
    }
  return { rows, cols, cell_m: opts.s ?? 1, elevation, classes };
}

const close = (a: number, b: number, tol = 1e-9) => expect(Math.abs(a - b)).toBeLessThanOrEqual(tol);

describe("hand-solved grids", () => {
  it("takes two diagonals across a flat 3x3", () => {
    const r = routeAStar(grid(3, 3), { r: 0, c: 0 }, { r: 2, c: 2 }, unitSpeed)!;
    close(r.time_s, 2 * Math.SQRT2);
    expect(r.cells).toEqual([0, 4, 8]);
  });

  it("walks a straight orthogonal line", () => {
    const r = routeAStar(grid(1, 5), { r: 0, c: 0 }, { r: 0, c: 4 }, unitSpeed)!;
    close(r.time_s, 4);
  });

  it("scales by cell size and level speed", () => {
    const r = routeAStar(grid(1, 3, { s: 2 }), { r: 0, c: 0 }, { r: 0, c: 2 }, { ...unitSpeed, vLevel_mps: 0.5 })!;
    close(r.time_s, 8);
  });

  it("routes around an unknown cell", () => {
    const g = grid(3, 3, { cls: (r, c) => (r === 1 && c === 1 ? CLASS.UNKNOWN : CLASS.CANDIDATE) });
    const r = routeAStar(g, { r: 0, c: 1 }, { r: 2, c: 1 }, unitSpeed)!;
    expect(r.cells).not.toContain(4);
    // Every diagonal next to (1,1) would cut its corner, so the hand solution is 4 orthogonal steps.
    close(r.time_s, 4);
  });

  it("never cuts a corner past a blocked orthogonal neighbour", () => {
    const g = grid(2, 2, { cls: (r, c) => (r === 0 && c === 1 ? CLASS.EXCLUDED : CLASS.CANDIDATE) });
    const r = routeAStar(g, { r: 0, c: 0 }, { r: 1, c: 1 }, unitSpeed)!;
    expect(r.cells).toEqual([0, 2, 3]);
    close(r.time_s, 2);
  });

  it("returns null when the goal is walled off", () => {
    const g = grid(3, 3, { cls: (_r, c) => (c === 1 ? CLASS.EXCLUDED : CLASS.CANDIDATE) });
    expect(routeAStar(g, { r: 0, c: 0 }, { r: 0, c: 2 }, unitSpeed)).toBeNull();
  });

  it("refuses to start or end on a cell that is not slope-screened", () => {
    const g = grid(1, 3, { cls: (_r, c) => (c === 0 ? CLASS.UNKNOWN : CLASS.CANDIDATE) });
    expect(() => routeAStar(g, { r: 0, c: 0 }, { r: 0, c: 2 }, unitSpeed)).toThrow(/start/);
    expect(() => routeAStar(g, { r: 0, c: 2 }, { r: 0, c: 0 }, unitSpeed)).toThrow(/goal/);
  });
});

describe("slope on edges", () => {
  it("forbids an edge steeper than the limit even between candidate cells", () => {
    const dz = Math.tan((25 * Math.PI) / 180);
    const g = grid(1, 2, { z: (_r, c) => c * dz });
    expect(routeAStar(g, { r: 0, c: 0 }, { r: 0, c: 1 }, unitSpeed)).toBeNull();
  });

  it("allows an edge at exactly the limit", () => {
    const dz = Math.tan((20 * Math.PI) / 180);
    const g = grid(1, 2, { z: (_r, c) => c * dz });
    expect(routeAStar(g, { r: 0, c: 0 }, { r: 0, c: 1 }, unitSpeed)).not.toBeNull();
  });

  it("applies the factor of the edge's slope bin to the 3D edge length", () => {
    const k: SpeedModel = { vLevel_mps: 0.83, kBins: [1, 0.8, 0.6, 0.4], slopeLimit_deg: 20 };
    for (const [deg, kv] of [[2, 1], [7, 0.8], [12, 0.6], [17, 0.4]] as const) {
      const dz = 2 * Math.tan((deg * Math.PI) / 180);
      const r = routeAStar(grid(1, 2, { s: 2, z: (_r, c) => c * dz }), { r: 0, c: 0 }, { r: 0, c: 1 }, k)!;
      close(r.time_s, Math.hypot(2, dz) / (0.83 * kv), 1e-9);
    }
  });

  it("gives uphill and downhill the same time (one factor until R-09)", () => {
    const k: SpeedModel = { vLevel_mps: 0.83, kBins: [1, 0.8, 0.6, 0.4], slopeLimit_deg: 20 };
    const g = grid(1, 2, { z: (_r, c) => c * 0.3 });
    close(routeAStar(g, { r: 0, c: 0 }, { r: 0, c: 1 }, k)!.time_s, routeAStar(g, { r: 0, c: 1 }, { r: 0, c: 0 }, k)!.time_s);
  });

  it("rejects a speed model without four positive factors", () => {
    expect(() => routeAStar(grid(1, 2), { r: 0, c: 0 }, { r: 0, c: 1 }, { ...unitSpeed, kBins: [1, 1, 1] as unknown as SpeedModel["kBins"] })).toThrow();
    expect(() => routeAStar(grid(1, 2), { r: 0, c: 0 }, { r: 0, c: 1 }, { ...unitSpeed, kBins: [1, 0, 1, 1] })).toThrow();
  });
});

function lcg(seed: number) {
  let s = seed >>> 0;
  return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 2 ** 32);
}

function randomGrid(seed: number, n = 24): RouteGrid {
  const rnd = lcg(seed);
  return grid(n, n, { s: 2, z: () => rnd() * 1.2, cls: () => (rnd() < 0.15 ? CLASS.EXCLUDED : CLASS.CANDIDATE) });
}

describe("optimality and admissibility (property tests)", () => {
  const k: SpeedModel = { vLevel_mps: 0.83, kBins: [1, 0.85, 0.7, 0.5], slopeLimit_deg: 20 };

  it("A* time equals plain Dijkstra time on 40 random grids", () => {
    for (let seed = 1; seed <= 40; seed++) {
      const g = randomGrid(seed);
      g.classes[0] = CLASS.CANDIDATE; g.classes[g.rows * g.cols - 1] = CLASS.CANDIDATE;
      const a = routeAStar(g, { r: 0, c: 0 }, { r: g.rows - 1, c: g.cols - 1 }, k);
      const d = routeDijkstra(g, { r: 0, c: 0 }, { r: g.rows - 1, c: g.cols - 1 }, k);
      if (d === null) expect(a).toBeNull();
      else close(a!.time_s, d.time_s, 1e-9);
    }
  });

  it("the heuristic never exceeds the true remaining time", () => {
    for (let seed = 1; seed <= 10; seed++) {
      const g = randomGrid(seed);
      const goal = { r: 12, c: 12 };
      g.classes[goal.r * g.cols + goal.c] = CLASS.CANDIDATE;
      const field = timeField(g, goal, k); // exact time from every cell to the goal (edges are symmetric)
      for (let i = 0; i < field.length; i++) {
        if (!Number.isFinite(field[i]!)) continue;
        const h = heuristicSeconds({ r: Math.floor(i / g.cols), c: i % g.cols }, goal, g.cell_m, k);
        expect(h).toBeLessThanOrEqual(field[i]! + 1e-9);
      }
    }
  });

  it("every returned path is connected and only uses slope-screened cells", () => {
    for (let seed = 1; seed <= 20; seed++) {
      const g = randomGrid(seed);
      g.classes[0] = CLASS.CANDIDATE; g.classes[g.rows * g.cols - 1] = CLASS.CANDIDATE;
      const r = routeAStar(g, { r: 0, c: 0 }, { r: g.rows - 1, c: g.cols - 1 }, k);
      if (!r) continue;
      for (const i of r.cells) expect(g.classes[i]).toBe(CLASS.CANDIDATE);
      for (let j = 1; j < r.cells.length; j++) {
        const a = r.cells[j - 1]!, b = r.cells[j]!;
        expect(Math.max(Math.abs(Math.floor(a / g.cols) - Math.floor(b / g.cols)), Math.abs((a % g.cols) - (b % g.cols)))).toBe(1);
      }
    }
  });
});
