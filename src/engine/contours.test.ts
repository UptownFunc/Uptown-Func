// SI-assisted: drafted with Claude Code (Claude Opus 5.5); human Route Engine review pending.
import { describe, expect, it } from "vitest";
import { timeContours } from "./contours";

// Radial field: time = distance from the centre (in fine cells) x 10 s; Infinity in one corner block (unreachable).
function radial(n: number): Float64Array {
  const f = new Float64Array(n * n);
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) f[r * n + c] = Math.hypot(r + 0.5 - n / 2, c + 0.5 - n / 2) * 10;
  return f;
}

describe("time-to-habitat contours (plan 6.4 tier 2: 5-min lines, never filled)", () => {
  it("draws one closed line per level at the right distance, in fine-cell edge coordinates", () => {
    const n = 80, f = radial(n);
    const [c] = timeContours(f, n, n, { factor: 2, levels_s: [200], minArea_cells: 4 });
    expect(c!.level_s).toBe(200);
    expect(c!.lines.length).toBe(1);
    const ring = c!.lines[0]!;
    expect(ring[0]).toEqual(ring[ring.length - 1]); // closed
    for (const [x, y] of ring) expect(Math.hypot(x - n / 2, y - n / 2)).toBeGreaterThan(17); // radius 20 cells, 2-cell blocks
    for (const [x, y] of ring) expect(Math.hypot(x - n / 2, y - n / 2)).toBeLessThan(23);
  });

  it("treats unreachable cells (Infinity) as beyond every level and draws no outline around them", () => {
    const n = 80, f = radial(n);
    f[30 * n + 40] = Infinity; // a single unreachable cell well inside the 300 s disc (about 95 s) makes a tiny hole
    const [c] = timeContours(f, n, n, { factor: 1, levels_s: [300], minArea_cells: 50 });
    expect(c!.lines.length).toBe(1); // the hole is dropped as clutter
    const [d] = timeContours(f, n, n, { factor: 1, levels_s: [300], minArea_cells: 0.1 });
    expect(d!.lines.length).toBe(1); // ... and never drawn anyway: its outline borders unreachable ground
  });

  it("downsamples by the minimum of each block (a block is as close as its closest cell)", () => {
    const n = 4, f = new Float64Array(16).fill(1000);
    f[0] = 10; // top-left block min = 10 -> below a 100 s level
    const [c] = timeContours(f, n, n, { factor: 2, levels_s: [100], minArea_cells: 0 });
    // Only the top-left block is within 100 s: its isoline crosses the interior; the grid-border part is cut out.
    expect(c!.lines.length).toBeGreaterThan(0);
    for (const line of c!.lines) expect(line.some(([x, y]) => x > 0 && x < 4 && y > 0 && y < 4)).toBe(true);
  });
});

it("cuts a line where the region meets the grid border, keeping only the isoline", () => {
  const n = 40, f = new Float64Array(n * n);
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) f[r * n + c] = c * 10; // time grows west to east
  const [l] = timeContours(f, n, n, { factor: 1, levels_s: [200], minArea_cells: 0 });
  expect(l!.lines.length).toBe(1);
  for (const [x] of l!.lines[0]!) expect(x).toBeCloseTo(20.5, 0); // a north-south line near column 20
});

it("returns nothing for an empty level list", () => {
  expect(timeContours(radial(10), 10, 10, { factor: 1, levels_s: [], minArea_cells: 0 })).toEqual([]);
});

it("draws no line along the edge of unreachable ground (that is a barrier, not an isoline)", () => {
  const n = 60, f = radial(n);
  // A large unreachable block inside the 200 s disc: only the 200 s circle may be drawn, not the block's outline.
  for (let r = 25; r < 35; r++) for (let c = 25; c < 35; c++) f[r * n + c] = Infinity;
  const [l] = timeContours(f, n, n, { factor: 1, levels_s: [200], minArea_cells: 0 });
  expect(l!.lines.length).toBe(1);
  for (const [x, y] of l!.lines[0]!) expect(Math.hypot(x - n / 2, y - n / 2)).toBeGreaterThan(15);
});
