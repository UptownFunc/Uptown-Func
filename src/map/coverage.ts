// SI-assisted: drafted with Claude Code (Claude Opus 5.5); human Design + Data and Science review pending.
// Coverage outlines (plan 7.8 "Missing and coarse data"): each dataset ships its coverage outline (pipeline
// sharpwalk/run_coverage.py -> coverage.geojson, GeoJSON in F1); outside it the layer list says so, for example
// "outside D2 colour coverage", instead of showing a blank. Rings go F1 -> F7 through src/geo; F7 is display only.
// The schema is local to the app, like layers.json's, until the team agrees a contract (DECISIONS C-20).
import { z } from "zod";
import { f1, f1ToF7 } from "../geo";

const lonLat = z.tuple([z.number().finite().min(-180).max(180), z.number().finite().min(-90).max(90)]);
export const CoverageFeature = z.object({
  type: z.literal("Feature"),
  geometry: z.object({ type: z.literal("MultiPolygon"), coordinates: z.array(z.array(z.array(lonLat).min(4))) }),
  properties: z.object({
    dataset: z.string().regex(/^D\d+$/), label: z.string().min(1), layerIds: z.array(z.string().min(1)),
    validFraction: z.number().min(0).max(1), method: z.string().min(1),
  }),
});
export type CoverageFeature = z.infer<typeof CoverageFeature>;
export const CoverageCollection = z.object({ type: z.literal("FeatureCollection"), frame: z.literal("F1"), features: z.array(CoverageFeature) });
export type CoverageCollection = z.infer<typeof CoverageCollection>;

/** Polygons -> rings -> [x, y] in F7. */
export type PolygonsF7 = number[][][][];

export function coveragePolygonsF7(f: CoverageFeature): PolygonsF7 {
  return f.geometry.coordinates.map((poly) => poly.map((ring) => ring.map(([lon, lat]) => {
    const p = f1ToF7(f1(lat, lon, 0));
    return [p.x, p.y];
  })));
}

export type ViewCoverage = "inside" | "partial" | "outside";

/** Liang-Barsky: does the segment a-b touch the rectangle [x0, y0, x1, y1]? */
function segmentHitsRect(ax: number, ay: number, bx: number, by: number, r: readonly number[]): boolean {
  let t0 = 0, t1 = 1;
  const dx = bx - ax, dy = by - ay;
  for (const [p, q] of [[-dx, ax - r[0]!], [dx, r[2]! - ax], [-dy, ay - r[1]!], [dy, r[3]! - ay]] as const) {
    if (p === 0) { if (q < 0) return false; continue; }
    const t = q / p;
    if (p < 0) { if (t > t1) return false; if (t > t0) t0 = t; } else { if (t < t0) return false; if (t < t1) t1 = t; }
  }
  return true;
}

/** Even-odd test over all rings of one polygon (outer ring and holes). */
function inPolygon(x: number, y: number, rings: number[][][]): boolean {
  let inside = false;
  for (const ring of rings) {
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const [xi, yi] = ring[i]!, [xj, yj] = ring[j]!;
      if ((yi! > y) !== (yj! > y) && x < ((xj! - xi!) * (y - yi!)) / (yj! - yi!) + xi!) inside = !inside;
    }
  }
  return inside;
}

/** How a view extent [minX, minY, maxX, maxY] in F7 relates to a dataset's coverage: if any outline edge touches the
 *  view, the view is partly outside; otherwise it is wholly inside or wholly outside, decided at its centre. */
export function viewCoverage(polys: PolygonsF7, extent: readonly number[]): ViewCoverage {
  for (const rings of polys) for (const ring of rings)
    for (let i = 1; i < ring.length; i++)
      if (segmentHitsRect(ring[i - 1]![0]!, ring[i - 1]![1]!, ring[i]![0]!, ring[i]![1]!, extent)) return "partial";
  const cx = (extent[0]! + extent[2]!) / 2, cy = (extent[1]! + extent[3]!) / 2;
  return polys.some((rings) => inPolygon(cx, cy, rings)) ? "inside" : "outside";
}

/** Plan 7.8 wording for the layer list; nothing when the view is inside. */
export function coverageNote(state: ViewCoverage, label: string): string | null {
  return state === "inside" ? null : state === "partial" ? `partly outside ${label}` : `outside ${label}`;
}
