// SI-assisted: drafted with Claude Code (Claude Opus 5.5) (3D-01); human review pending.
// 3D terrain heights come from the engine's F6 grid through src/geo: exact at cell centres, linear between them,
// nothing outside the window (the floor), and Cesium's tile layout (row 0 north, edges included).
import { describe, expect, it } from "vitest";
import { f1 } from "../geo";
import { cellCentreF1 } from "../geo/grid";
import { floorOf, gridBounds, heightAt, tileHeights, type HeightGrid } from "./heights";

const rows = 40, cols = 50, cell_m = 2;
/** A tilted plane: z = -3500 + 0.5 per column eastward - 0.25 per row southward (row 0 north). */
const plane = (r: number, c: number) => -3500 + 0.5 * c - 0.25 * r;
const elevation = new Float64Array(rows * cols);
for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) elevation[r * cols + c] = plane(r, c);
const g: HeightGrid = { origin: f1(-4.815, 137.39, -3506), rows, cols, cell_m, elevation };

describe("3D-01 D1 heights through src/geo", () => {
  it("equals the grid value at every sampled cell centre", () => {
    for (const [r, c] of [[0, 0], [10, 20], [39, 49], [25, 3]] as const) {
      const p = cellCentreF1({ r, c }, g);
      expect(heightAt(g, p.lat, p.lon)).toBeCloseTo(plane(r, c), 6);
    }
  });
  it("interpolates linearly between centres (exact on a plane)", () => {
    const a = cellCentreF1({ r: 12, c: 30 }, g), b = cellCentreF1({ r: 13, c: 31 }, g);
    expect(heightAt(g, (a.lat + b.lat) / 2, (a.lon + b.lon) / 2)).toBeCloseTo((plane(12, 30) + plane(13, 31)) / 2, 3);
  });
  it("has no height outside the window, and a cell without data poisons only its neighbourhood", () => {
    const b = gridBounds(g);
    expect(heightAt(g, b.north + 0.01, g.origin.lon)).toBeNull();
    const holed = new Float64Array(elevation); holed[20 * cols + 20] = Number.NaN;
    const h = { ...g, elevation: holed }, p = cellCentreF1({ r: 20, c: 20 }, g), q = cellCentreF1({ r: 5, c: 5 }, g);
    expect(heightAt(h, p.lat, p.lon)).toBeNull();
    expect(heightAt(h, q.lat, q.lon)).toBeCloseTo(plane(5, 5), 6);
  });
  it("fills a tile row 0 north, edges included; outside the window it is the floor, never invented terrain", () => {
    const floor = floorOf(g);
    expect(floor).toBe(plane(rows - 1, 0));
    const nw = cellCentreF1({ r: 0, c: 0 }, g), se = cellCentreF1({ r: rows - 1, c: cols - 1 }, g);
    const t = tileHeights(g, { north: nw.lat, south: se.lat, west: nw.lon, east: se.lon }, 3, 3, floor);
    expect(t[0]).toBeCloseTo(plane(0, 0), 3);
    expect(t[8]).toBeCloseTo(plane(rows - 1, cols - 1), 3);
    expect(t[2]).toBeCloseTo(plane(0, cols - 1), 3); // north-east corner
    const far = tileHeights(g, { north: 10, south: 5, west: 0, east: 5 }, 4, 4, floor);
    expect([...far].every((v) => v === floor)).toBe(true);
  });
});
