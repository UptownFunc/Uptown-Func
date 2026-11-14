// SI-assisted: drafted with Claude Code (Claude Opus 5.5); human Design + Data and Science review pending.
// AREA-sheet elevation contours (plan 7.8: gdal_contour on D1, GeoJSON in F1; plan 9: 10 m lines, every fifth heavier
// and labelled; derived layers name their source and cell size). Written by pipeline sharpwalk/run_contours.py.
// Heights are D1 as delivered: the vertical reference is unverified (D-05), which the legend says. Lines go
// F1 -> F7 through src/geo; F7 is display only. Schema local to the app until the team agrees a contract (C-21).
import { z } from "zod";
import type { Quantity } from "../contracts";
import { f1, f1ToF7 } from "../geo";
import { formatQuantity } from "../app/format";

const lonLat = z.tuple([z.number().finite().min(-180).max(180), z.number().finite().min(-90).max(90)]);
const ContourProps = z.object({
  source: z.literal("D1"), interval_m: z.number().positive(), indexEvery: z.number().int().positive(),
  cell_m: z.number().positive(), method: z.string().min(1), verticalReference: z.string().min(1),
});
export type ContourProps = z.infer<typeof ContourProps>;
export const ContourCollection = z.object({
  type: z.literal("FeatureCollection"), frame: z.literal("F1"), properties: ContourProps,
  features: z.array(z.object({
    type: z.literal("Feature"),
    geometry: z.object({ type: z.literal("LineString"), coordinates: z.array(lonLat).min(2) }),
    properties: z.object({ elev_m: z.number().finite(), index: z.boolean() }),
  })),
});
export type ContourCollection = z.infer<typeof ContourCollection>;

export interface ContourLineF7 { readonly elev_m: number; readonly index: boolean; readonly coords: number[][] }

export function contourLinesF7(c: ContourCollection): ContourLineF7[] {
  return c.features.map((f) => ({
    elev_m: f.properties.elev_m, index: f.properties.index,
    coords: f.geometry.coordinates.map(([lon, lat]) => { const p = f1ToF7(f1(lat, lon, 0)); return [p.x, p.y]; }),
  }));
}

const plan = (value: number, methodId: string): Quantity =>
  ({ value, unit: "m", valueClass: "assumed", methodId, assumptionIds: [], sourceIds: ["plan-9"] });

/** Label for an index line: the D1 height of the line as a Quantity; ordinary lines carry no label (plan 9). */
export function contourLabel(line: { elev_m: number; index: boolean }, p: ContourProps): { quantity: Quantity; text: string } | null {
  if (!line.index) return null;
  const quantity: Quantity = { value: line.elev_m, unit: "m", valueClass: "model_derived",
    methodId: `pipeline:gdal_contour-D1-${p.cell_m}m`, assumptionIds: [], sourceIds: ["D1"] };
  return { quantity, text: formatQuantity(quantity).text };
}

/** Layer-list entry: source, interval and index step (plan 9 choices), cell size (pipeline), vertical reference. */
export function contourLegend(p: ContourProps): string {
  const interval = plan(p.interval_m, "plan-9:contour-interval"), index = plan(p.interval_m * p.indexEvery, "plan-9:index-contour");
  const cell: Quantity = { value: p.cell_m, unit: "m", valueClass: "model_derived", methodId: "pipeline:contour-grid", assumptionIds: [], sourceIds: ["D1"] };
  const t = (q: Quantity) => formatQuantity(q).text;
  return `Contours (D1), ${t(interval)} interval, every ${t(index)} heavier and labelled; from D1 at ${t(cell)}; D1 heights, vertical reference unverified`;
}
