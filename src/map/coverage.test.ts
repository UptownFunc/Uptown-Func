// SI-assisted: drafted with Claude Code (Claude Opus 5.5); human Design + Data and Science review pending.
// Plan 7.8 "Missing and coarse data": each dataset ships its coverage outline; outside it the layer list says so
// (for example "outside D2 colour coverage") instead of showing a blank.
import { describe, expect, it } from "vitest";
import { f1, f1ToF7 } from "../geo";
import { CoverageCollection, coverageNote, coveragePolygonsF7, viewCoverage } from "./coverage";

const K = (Math.PI * 3_396_190) / 180;
// A 1 km x 1 km square of coverage around the area origin, in F1 [lon, lat] as the pipeline writes it.
const x0 = 137.39 * K, y0 = -4.815 * K;
const sq = (cx: number, cy: number, h: number) => [[cx - h, cy - h], [cx + h, cy - h], [cx + h, cy + h], [cx - h, cy + h], [cx - h, cy - h]].map(([x, y]) => [x! / K, y! / K]);
const feature = (dataset: string, polys: number[][][][]) => ({
  type: "Feature", geometry: { type: "MultiPolygon", coordinates: polys },
  properties: { dataset, label: `${dataset} colour coverage`, layerIds: ["d2"], validFraction: 1, method: "test" },
});
const fc = { type: "FeatureCollection", frame: "F1", features: [feature("D2", [[sq(x0, y0, 500)]])] };

describe("coverage file", () => {
  it("accepts the pipeline's FeatureCollection in F1 and refuses another frame or a bad valid fraction", () => {
    expect(CoverageCollection.safeParse(fc).success).toBe(true);
    expect(CoverageCollection.safeParse({ ...fc, frame: "WGS84" }).success).toBe(false);
    expect(CoverageCollection.safeParse({ ...fc, features: [{ ...fc.features[0], properties: { ...fc.features[0]!.properties, validFraction: 1.5 } }] }).success).toBe(false);
  });

  it("converts each ring to F7 through src/geo", () => {
    const polys = coveragePolygonsF7(CoverageCollection.parse(fc).features[0]!);
    const p = f1ToF7(f1(-4.815 + 500 / K, 137.39 + 500 / K, 0));
    expect(polys[0]![0]![2]![0]).toBeCloseTo(p.x, 6);
    expect(polys[0]![0]![2]![1]).toBeCloseTo(p.y, 6);
  });
});

describe("view against a coverage outline", () => {
  const polys = coveragePolygonsF7(CoverageCollection.parse(fc).features[0]!);
  const view = (cx: number, cy: number, h: number) => [cx - h, cy - h, cx + h, cy + h] as const;
  it("is inside when the whole view lies within the outline", () => expect(viewCoverage(polys, view(x0, y0, 100))).toBe("inside"));
  it("is partial when the outline crosses the view", () => expect(viewCoverage(polys, view(x0 + 500, y0, 100))).toBe("partial"));
  it("is partial when the whole outline sits inside a larger view", () => expect(viewCoverage(polys, view(x0, y0, 2000))).toBe("partial"));
  it("is outside when the view misses the outline", () => expect(viewCoverage(polys, view(x0 + 3000, y0, 100))).toBe("outside"));
  it("is outside when the view lies in a hole (a void in the data)", () => {
    const holed = coveragePolygonsF7(CoverageCollection.parse({ ...fc, features: [feature("D2", [[sq(x0, y0, 500), sq(x0, y0, 200)]])] }).features[0]!);
    expect(viewCoverage(holed, view(x0, y0, 50))).toBe("outside");
  });
  it("is outside when the dataset has no coverage at all", () => expect(viewCoverage([], view(x0, y0, 10))).toBe("outside"));
});

describe("layer-list wording (plan 7.8)", () => {
  it("names the coverage the view leaves, and says nothing when inside", () => {
    expect(coverageNote("outside", "D2 colour coverage")).toBe("outside D2 colour coverage");
    expect(coverageNote("partial", "D2 colour coverage")).toBe("partly outside D2 colour coverage");
    expect(coverageNote("inside", "D2 colour coverage")).toBeNull();
  });
});
