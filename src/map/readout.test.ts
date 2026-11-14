// SI-assisted: drafted with Claude Code (Claude Opus 5.5); human Design + Data and Science review pending.
// Plan 7.8 readouts: F1 lon/lat to 5 decimals, east/north in metres from the origin (F6), elevation and its source.
import { describe, expect, it } from "vitest";
import { getPointResolution } from "ol/proj";
import { f1, f1ToF7 } from "../geo";
import { F7_PROJECTION } from "./f7";
import { Quantity } from "../contracts";
import { readoutAt, type AreaGrid } from "./readout";

const origin = f1(-4.815, 137.39, -3500);

function area(n = 10, cell = 2, z = (r: number, c: number) => -3500 + r + c / 10): AreaGrid {
  const elevation = new Float64Array(n * n);
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) elevation[r * n + c] = z(r, c);
  return { origin, rows: n, cols: n, cell_m: cell, elevation, elevationSource: "D1, 2 m F6 grid" };
}

describe("F7 projection object", () => {
  it("is in metres and gives a true scale bar (resolution x cos lat)", () => {
    expect(F7_PROJECTION.getUnits()).toBe("m");
    const p = f1ToF7(f1(-4.815, 137.39, 0));
    const pr = getPointResolution(F7_PROJECTION, 2, [p.x, p.y]);
    expect(Math.abs(pr - 2 * Math.cos((4.815 * Math.PI) / 180))).toBeLessThan(1e-9);
  });
});

describe("cursor readout", () => {
  it("reports the origin as 0 m east / 0 m north with F1 to 5 decimals", () => {
    const p = f1ToF7(f1(-4.815, 137.39, 0));
    const r = readoutAt([p.x, p.y], area());
    expect(r.lat).toBe("-4.81500");
    expect(r.lon).toBe("137.39000");
    expect(Math.abs(r.east.value!)).toBeLessThan(1e-6);
    expect(Math.abs(r.north.value!)).toBeLessThan(1e-6);
  });

  it("reads elevation from the F6 cell under the cursor", () => {
    const g = area();
    // A point about 3 m east and 3 m south of the origin lies in row 6, col 6 of a 10 x 10, 2 m grid.
    const k = Math.PI * 3_396_190 / 180;
    const pt = f1ToF7(f1(-4.815 - 3 / (k), 137.39 + 3 / (k * Math.cos((4.815 * Math.PI) / 180)), 0));
    const r = readoutAt([pt.x, pt.y], g);
    expect(r.elevation.value!).toBeCloseTo(-3500 + 6 + 0.6, 6);
  });

  it("says elevation is unknown outside the grid or on a NaN cell, never zero", () => {
    const g = area(10, 2, (r) => (r === 0 ? Number.NaN : -3500));
    const far = f1ToF7(f1(-4.7, 137.39, 0));
    expect(readoutAt([far.x, far.y], g).elevation.value).toBeNull();
    const k = Math.PI * 3_396_190 / 180;
    const top = f1ToF7(f1(-4.815 + 9 / k, 137.39, 0));
    expect(readoutAt([top.x, top.y], g).elevation.value).toBeNull();
  });
});

describe("readout against the F6 grid's own geometry", () => {
  it("finds the right cell about 1.4 km from the origin (grid is ortho on the bare sphere, not at the origin height)", () => {
    const n = 1500, cell = 2;
    const g = area(n, cell, (r, c) => r * 1000 + c);
    const k = Math.PI * 3_396_190 / 180;
    // 1,400 m north of the origin along the meridian: ortho northing = R sin(dphi) -> row = floor((1500 - N) / 2).
    // Northing 1,398.2 m: (1500 - N) / 2 = 50.9 -> row 50. Scaling by (R + h0) / R with h0 = -3500 m would shift N by
    // about 1.44 m and give row 51, so this point separates the two geometries.
    const dphi = Math.asin(1398.2 / 3_396_190);
    // Half a metre east of the central meridian, so the point is not on the boundary between columns 749 and 750.
    const dlon = (0.5 / (3_396_190 * Math.cos((-4.815 + (dphi * 180) / Math.PI) * Math.PI / 180))) * 180 / Math.PI;
    const pt = f1ToF7(f1(-4.815 + (dphi * 180) / Math.PI, 137.39 + dlon, 0));
    const N = 3_396_190 * (Math.sin(-4.815 * Math.PI / 180 + dphi) * Math.cos(-4.815 * Math.PI / 180) - Math.cos(-4.815 * Math.PI / 180 + dphi) * Math.sin(-4.815 * Math.PI / 180));
    const row = Math.floor((1500 - N) / cell);
    const r = readoutAt([pt.x, pt.y], g);
    expect(r.elevation.value).toBe(row * 1000 + 750);
    void k;
  });
});

describe("readout values are Quantities (CLAUDE.md)", () => {
  it("returns schema-valid Quantities, and unknown elevation stays unknown", () => {
    const p = f1ToF7(f1(-4.815, 137.39, 0));
    const r = readoutAt([p.x, p.y], area());
    for (const q of [r.latQ, r.lonQ, r.east, r.north, r.elevation]) expect(Quantity.safeParse(q).success).toBe(true);
    expect(r.elevation.sourceIds).toContain("D1");
    const far = f1ToF7(f1(-4.7, 137.39, 0));
    const u = readoutAt([far.x, far.y], area()).elevation;
    expect(u.valueClass).toBe("unknown"); expect(u.value).toBeNull();
  });
});
