// SI-assisted: drafted with Claude Code (Claude Opus 5.5); human Route Engine review pending.
// Plan 6.2 / 6.4 / 6.5: leg metrics along an engine path. Seconds in the engine; the nominal speed routes, and the
// low/high bounds are propagated along the chosen path (fast bound -> low time, slow bound -> high time).
import { describe, expect, it } from "vitest";
import { CLASS, type RouteGrid, timeField } from "./route";
import { habitatField, legMetrics, type SpeedRange } from "./leg";

const close = (a: number, b: number, tol = 1e-9) => expect(Math.abs(a - b)).toBeLessThanOrEqual(tol);
const speeds: SpeedRange = { nominal_mps: 0.83, low_mps: 0.64, high_mps: 0.97, kBins: [1, 0.8, 0.6, 0.4], slopeLimit_deg: 20 };

function grid(rows: number, cols: number, z: (r: number, c: number) => number = () => 0, s = 2): RouteGrid {
  const elevation = new Float64Array(rows * cols), classes = new Uint8Array(rows * cols).fill(CLASS.CANDIDATE);
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) elevation[r * cols + c] = z(r, c);
  return { rows, cols, cell_m: s, elevation, classes };
}

describe("leg metrics", () => {
  it("measures a flat eastward leg", () => {
    const g = grid(1, 5);
    const m = legMetrics(g, [0, 1, 2, 3, 4], speeds);
    close(m.horizontal_m, 8); close(m.distance_m, 8); close(m.climb_m, 0); close(m.descent_m, 0);
    close(m.heading_deg, 90);
    close(m.time_s.nominal, 8 / 0.83); close(m.time_s.low, 8 / 0.97); close(m.time_s.high, 8 / 0.64);
  });

  it("uses 3D edge lengths and the slope bin of each edge", () => {
    const dz = 2 * Math.tan((12 * Math.PI) / 180); // 12 deg -> bin 10-15, k = 0.6
    const g = grid(1, 3, (_r, c) => c * dz);
    const m = legMetrics(g, [0, 1, 2], speeds);
    const e = Math.hypot(2, dz);
    close(m.distance_m, 2 * e); close(m.horizontal_m, 4); close(m.climb_m, 2 * dz);
    close(m.time_s.nominal, (2 * e) / (0.83 * 0.6));
    close(m.time_s.high, (2 * e) / (0.64 * 0.6));
  });

  it("counts climb and descent separately", () => {
    const g = grid(1, 4, (_r, c) => [0, 1, 0.5, 2][c]!);
    const m = legMetrics(g, [0, 1, 2, 3], speeds);
    close(m.climb_m, 1 + 1.5); close(m.descent_m, 0.5);
  });

  it("gives headings clockwise from grid north (row decreasing is north)", () => {
    const g = grid(3, 3);
    close(legMetrics(g, [7, 4, 1], speeds).heading_deg, 0);     // north
    close(legMetrics(g, [6, 4, 2], speeds).heading_deg, 45);    // north-east
    close(legMetrics(g, [1, 4, 7], speeds).heading_deg, 180);   // south
    close(legMetrics(g, [5, 4, 3], speeds).heading_deg, 270);   // west
  });

  it("orders the time range low <= nominal <= high", () => {
    const m = legMetrics(grid(2, 2), [0, 3], speeds);
    expect(m.time_s.low).toBeLessThanOrEqual(m.time_s.nominal);
    expect(m.time_s.nominal).toBeLessThanOrEqual(m.time_s.high);
  });

  it("refuses a path with a gap or fewer than two cells", () => {
    expect(() => legMetrics(grid(1, 5), [0, 2], speeds)).toThrow(/connected/);
    expect(() => legMetrics(grid(1, 5), [0], speeds)).toThrow(/two cells/);
  });

  it("refuses speeds that are not ordered low <= nominal <= high", () => {
    expect(() => legMetrics(grid(1, 2), [0, 1], { ...speeds, low_mps: 0.9 })).toThrow(/order/);
  });
});

describe("time-to-habitat field", () => {
  it("is the time field at the slow speed bound (plan 6.2)", () => {
    const g = grid(5, 5, (r, c) => (r + c) * 0.2);
    const f = habitatField(g, { r: 2, c: 2 }, speeds);
    const ref = timeField(g, { r: 2, c: 2 }, { vLevel_mps: 0.64, kBins: speeds.kBins, slopeLimit_deg: 20 });
    for (let i = 0; i < f.length; i++) close(f[i]!, ref[i]!);
  });
});
