// SI-assisted: drafted with Claude Code (Claude Opus 5.5); human Design + Data and Science review pending.
// Plan 7.8 / 9: AREA sheet elevation contours from D1, 10 m lines, every fifth heavier and labelled; GeoJSON in F1.
import { describe, expect, it } from "vitest";
import { Quantity } from "../contracts";
import { f1, f1ToF7 } from "../geo";
import { ContourCollection, contourLabel, contourLegend, contourLinesF7 } from "./elevationContours";

const fc = {
  type: "FeatureCollection", frame: "F1",
  properties: { source: "D1", interval_m: 10, indexEvery: 5, cell_m: 4, method: "gdal_contour (GDAL 3.8.4) on D1", verticalReference: "D1 as delivered; unverified (DECISIONS D-05)" },
  features: [
    { type: "Feature", geometry: { type: "LineString", coordinates: [[137.39, -4.815], [137.391, -4.8151]] }, properties: { elev_m: -3500, index: true } },
    { type: "Feature", geometry: { type: "LineString", coordinates: [[137.39, -4.816], [137.391, -4.8161]] }, properties: { elev_m: -3510, index: false } },
  ],
};

describe("contour file", () => {
  it("accepts the pipeline's F1 collection and refuses another frame, a non-D1 source or a one-point line", () => {
    expect(ContourCollection.safeParse(fc).success).toBe(true);
    expect(ContourCollection.safeParse({ ...fc, frame: "F7" }).success).toBe(false);
    expect(ContourCollection.safeParse({ ...fc, properties: { ...fc.properties, source: "D12" } }).success).toBe(false);
    const bad = { ...fc, features: [{ ...fc.features[0], geometry: { type: "LineString", coordinates: [[137.39, -4.815]] } }] };
    expect(ContourCollection.safeParse(bad).success).toBe(false);
  });

  it("puts each line in F7 through src/geo", () => {
    const lines = contourLinesF7(ContourCollection.parse(fc));
    const p = f1ToF7(f1(-4.8151, 137.391, 0));
    expect(lines[0]!.coords[1]![0]).toBeCloseTo(p.x, 6);
    expect(lines[0]!.coords[1]![1]).toBeCloseTo(p.y, 6);
    expect(lines.map((l) => [l.elev_m, l.index])).toEqual([[-3500, true], [-3510, false]]);
  });
});

describe("contour labels and legend (every number a Quantity)", () => {
  const c = ContourCollection.parse(fc);
  it("labels index lines with a D1 height Quantity and leaves the others unlabelled", () => {
    const l = contourLabel({ elev_m: -3500, index: true }, c.properties);
    expect(l).not.toBeNull();
    expect(Quantity.safeParse(l!.quantity).success).toBe(true);
    expect(l!.quantity).toMatchObject({ value: -3500, unit: "m", sourceIds: ["D1"] });
    expect(l!.text).toBe("-3500 m");
    expect(contourLabel({ elev_m: -3510, index: false }, c.properties)).toBeNull();
  });
  it("names the source, interval, index step, cell size and the unverified vertical reference", () => {
    expect(contourLegend(c.properties)).toBe("Contours (D1), 10 m interval, every 50 m heavier and labelled; from D1 at 4 m; D1 heights, vertical reference unverified");
  });
});
