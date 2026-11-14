// SI-assisted: drafted with Claude Code (Claude Opus 5.5); human Data and Science review pending.
// Plan 6.7: "The browser computes no horizons: a stop reads the nearest grid value, labelled as a 20 m sample."
import { describe, expect, it } from "vitest";
import { f1 } from "../geo";
import { cellCentreF1 } from "../geo/grid";
import { Quantity } from "../contracts";
import { decodeSkyGrid, skySampleAt, type SkyGrid } from "./skySample";

const origin = f1(-4.815, 137.39, -3500);

function sky(values: (r: number, c: number) => number, n = 4, cell = 20): SkyGrid {
  const v = new Float32Array(n * n);
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) v[r * n + c] = values(r, c);
  return { def: { origin, rows: n, cols: n, cell_m: cell }, values: v };
}

describe("per-stop sky sample (plan 6.7)", () => {
  it("reads the 20 m cell whose observer is nearest (cell centre), as a model-derived % with V-12", () => {
    const g = sky((r, c) => (r * 4 + c) / 100);
    const p = cellCentreF1({ r: 2, c: 1 }, g.def);
    const q = skySampleAt(p, g);
    expect(Quantity.parse(q)).toEqual(q);
    expect(q.value).toBe(9); // (2 * 4 + 1) / 100 as a fraction -> 9.0 %
    expect(q.unit).toBe("%");
    expect(q.valueClass).toBe("model_derived");
    expect(q.methodId).toBe("pipeline:sky-grid-6.7");
    expect(q.sourceIds).toEqual(["D1", "D12"]);
    expect(q.assumptionIds).toEqual(["V-12"]);
  });

  it("rounds to 0.1 percentage points", () => {
    const g = sky(() => 0.23456);
    expect(skySampleAt(cellCentreF1({ r: 0, c: 0 }, g.def), g).value).toBe(23.5);
  });

  it("keeps a no-data cell unknown, never zero", () => {
    const g = sky(() => Number.NaN);
    const q = skySampleAt(cellCentreF1({ r: 1, c: 1 }, g.def), g);
    expect(q.value).toBeNull();
    expect(q.valueClass).toBe("unknown");
    expect(Quantity.parse(q)).toEqual(q);
  });

  it("is unknown outside the grid, and when the grid did not load", () => {
    const g = sky(() => 0.2);
    expect(skySampleAt(f1(-4.0, 137.39, 0), g).valueClass).toBe("unknown");
    expect(skySampleAt(origin, null).valueClass).toBe("unknown");
  });
});

describe("sky grid decoding", () => {
  const meta = { rows: 2, cols: 2, cell_m: 20, dtype: "uint16", scale: 0.0001, noData: 65535, f6Transform: [20, 0, -20, 0, -20, 20] };
  it("scales uint16 to a fraction and turns no-data into NaN", () => {
    const g = decodeSkyGrid(new Uint16Array([1850, 0, 65535, 10000]).buffer, meta, origin);
    expect(Array.from(g.values.slice(0, 2)).map((x) => Math.round(x * 1e4))).toEqual([1850, 0]);
    expect(Number.isNaN(g.values[2])).toBe(true);
    expect(g.def).toEqual({ origin, rows: 2, cols: 2, cell_m: 20 });
  });
  it("refuses a file whose length or dtype does not match layers.json", () => {
    expect(() => decodeSkyGrid(new Uint16Array(3).buffer, meta, origin)).toThrow(/length/);
    expect(() => decodeSkyGrid(new Uint16Array(4).buffer, { ...meta, dtype: "float32" }, origin)).toThrow(/uint16/);
  });
  it("refuses a grid that is not centred on the area origin (the F6 cell rule would read the wrong cell)", () => {
    expect(() => decodeSkyGrid(new Uint16Array(4).buffer, { ...meta, f6Transform: [20, 0, -1500, 0, -20, 1500] }, origin)).toThrow(/centred/);
  });
});
