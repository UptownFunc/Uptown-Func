// SI-assisted: drafted with Claude Code (Claude Opus 5.5); human Design review pending.
// Draws the plan 7.8 coverage outlines on the AREA sheet. Plan 9.2 names no symbol for them, so this is a display
// choice pending Design review: a thin dotted neutral line (text-muted on a graphite casing), unlike the route (solid
// bone), the return path (dashed) and exclusions; burgundy (interaction) and red (violations) are not used.
import Feature from "ol/Feature";
import MultiPolygon from "ol/geom/MultiPolygon";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { Stroke, Style } from "ol/style";
import type { PolygonsF7 } from "./coverage";

const MUTED = "#aeb5b3", CASING = "#191b20";
const outlineStyle = [
  new Style({ stroke: new Stroke({ color: CASING, width: 3 }) }),
  new Style({ stroke: new Stroke({ color: MUTED, width: 1.5, lineDash: [2, 4] }) }),
];

export function createCoverageLayer(): VectorLayer<VectorSource> {
  return new VectorLayer({ source: new VectorSource(), className: "layer-coverage", style: outlineStyle });
}

/** Replaces the outlines; returns how many datasets have an outline drawn. */
export function drawCoverage(layer: VectorLayer<VectorSource>, outlines: { dataset: string; polys: PolygonsF7 }[]): number {
  const src = layer.getSource()!;
  src.clear();
  const drawn = outlines.filter((o) => o.polys.length > 0);
  src.addFeatures(drawn.map((o) => new Feature({ geometry: new MultiPolygon(o.polys), dataset: o.dataset })));
  return drawn.length;
}
