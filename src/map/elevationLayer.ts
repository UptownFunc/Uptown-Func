// SI-assisted: drafted with Claude Code (Claude Opus 5.5); human Design review pending.
// Draws the plan 7.8 / 9 elevation contours: 10 m lines, every fifth heavier and labelled. Neutral graphite so they
// read apart from the light bone time-to-habitat lines ("est. N min"); labels are bone text on a graphite halo of
// at least 2 px (plan 9 "Labels on imagery"), decluttered. Line weights are a display choice pending Design review.
import Feature from "ol/Feature";
import LineString from "ol/geom/LineString";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { Fill, Stroke, Style, Text } from "ol/style";
import { contourLabel, type ContourLineF7, type ContourProps } from "./elevationContours";

const regular = new Style({ stroke: new Stroke({ color: "rgba(25, 27, 32, 0.55)", width: 0.75 }) });
const indexStyle = (label: string | null) => new Style({
  stroke: new Stroke({ color: "rgba(25, 27, 32, 0.8)", width: 1.5 }),
  text: label ? new Text({ text: label, placement: "line", font: "10px VT323, monospace",
    fill: new Fill({ color: "#e8e1d5" }), stroke: new Stroke({ color: "#191b20", width: 3 }) }) : undefined,
});

export function createElevationLayer(): VectorLayer<VectorSource> {
  return new VectorLayer({ source: new VectorSource(), className: "layer-elevation-contours", declutter: true });
}

/** Replaces the lines; returns how many were drawn. */
export function drawElevationContours(layer: VectorLayer<VectorSource>, lines: ContourLineF7[], props: ContourProps | null): number {
  const src = layer.getSource()!;
  src.clear();
  if (!props) return 0;
  src.addFeatures(lines.map((l) => {
    const f = new Feature({ geometry: new LineString(l.coords), elev_m: l.elev_m, index: l.index });
    f.setStyle(l.index ? indexStyle(contourLabel(l, props)?.text ?? null) : regular);
    return f;
  }));
  return lines.length;
}
