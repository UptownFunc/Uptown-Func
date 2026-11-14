// SI-assisted: drafted with Claude Code (Claude Opus 5.5); human Data and Science review pending.
import { describe, expect, it } from "vitest";
import { f1 } from "./index";
import { cellCentreF1, f1ToCell, type GridDef } from "./grid";
import { readoutAt } from "../map/readout";
import { f1ToF7 } from "./index";

const grid: GridDef = { origin: f1(-4.815, 137.39, 0), rows: 1500, cols: 1500, cell_m: 2 };

describe("grid cell <-> F1 (through F5 and F6)", () => {
  it("puts the area origin at the shared corner of the four centre cells", () => {
    expect(f1ToCell(f1(-4.815, 137.39, 0), grid)).toEqual({ r: 750, c: 750 });
  });

  it("round-trips every sampled cell centre", () => {
    for (const [r, c] of [[0, 0], [0, 1499], [1499, 0], [1499, 1499], [123, 987], [750, 750]] as const) {
      expect(f1ToCell(cellCentreF1({ r, c }, grid), grid)).toEqual({ r, c });
    }
  });

  it("places row 0 at the north edge and column 0 at the west edge", () => {
    const nw = cellCentreF1({ r: 0, c: 0 }, grid), se = cellCentreF1({ r: 1499, c: 1499 }, grid);
    expect(nw.lat).toBeGreaterThan(se.lat);
    expect(nw.lon).toBeLessThan(se.lon);
  });

  it("returns null outside the grid", () => {
    expect(f1ToCell(f1(-4.7, 137.39, 0), grid)).toBeNull();
  });

  it("agrees with the status-line readout lookup", () => {
    const elevation = new Float64Array(grid.rows * grid.cols);
    elevation[123 * grid.cols + 987] = 42;
    const p = cellCentreF1({ r: 123, c: 987 }, grid), x = f1ToF7(p);
    const out = readoutAt([x.x, x.y], { ...grid, elevation, elevationSource: "test" });
    expect(out.elevation.value).toBe(42);
  });
});

describe("one grid frame for cells and east/north (review R-11 items 1-2)", () => {
  it("enuToCell on the grid frame's F6 point gives the same cell as f1ToCell", async () => {
    const { enuToCell, gridFrameOf } = await import("./grid");
    const { f1ToF5, f5ToF6 } = await import("./index");
    for (const [r, c] of [[0, 0], [1499, 1499], [123, 987], [750, 750]] as const) {
      const p = cellCentreF1({ r, c }, grid);
      expect(enuToCell(f5ToF6(f1ToF5(p), gridFrameOf(grid)), grid)).toEqual(f1ToCell(p, grid));
    }
    expect(gridFrameOf(grid)).toBe(gridFrameOf(grid)); // cached per grid
  });
});
