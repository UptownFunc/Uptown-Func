// SI-assisted: drafted with Claude Code (Claude Opus 5.5); human Design review pending.
// Draws the engine's plan on the AREA sheet: grid-path legs, the habitat and lettered stops (plan 9.4).
// Cells go cell -> F1 (src/geo/grid) -> F7 (src/geo); F7 is display only. The line is the grid path the margins are
// computed on (D-04 smoothing undecided), so nothing is smoothed here.
import Feature from "ol/Feature";
import LineString from "ol/geom/LineString";
import Point from "ol/geom/Point";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { Fill, RegularShape, Stroke, Style, Text } from "ol/style";
import CircleStyle from "ol/style/Circle";
import { f1ToF7 } from "../geo";
import { cellCentreF1, type GridDef } from "../geo/grid";
import type { PlanOutput } from "../engine/planner";

const PLAN = "#722a3e", PAPER = "#f3eee4", INK = "#191b20";

const routeStyle = [
  new Style({ stroke: new Stroke({ color: PAPER, width: 5 }) }),
  new Style({ stroke: new Stroke({ color: PLAN, width: 3 }) }),
];
const habitatStyle = new Style({
  image: new RegularShape({ points: 4, radius: 9, angle: Math.PI / 4, fill: new Fill({ color: PAPER }), stroke: new Stroke({ color: INK, width: 2 }) }),
  text: new Text({ text: "H", font: "600 11px 'IBM Plex Sans', system-ui", fill: new Fill({ color: INK }) }),
});
const stopStyle = (letter: string) => new Style({
  image: new CircleStyle({ radius: 10, fill: new Fill({ color: PLAN }), stroke: new Stroke({ color: PAPER, width: 2 }) }),
  text: new Text({ text: letter, font: "600 12px 'IBM Plex Sans', system-ui", fill: new Fill({ color: PAPER }) }),
});

export function createPlanLayer(): VectorLayer<VectorSource> {
  return new VectorLayer({ source: new VectorSource(), className: "layer-plan" });
}

export function drawPlan(layer: VectorLayer<VectorSource>, out: PlanOutput | null, grid: GridDef): void {
  const src = layer.getSource()!;
  src.clear();
  if (!out) return;
  const xy = (cell: number) => {
    const p = f1ToF7(cellCentreF1({ r: Math.floor(cell / grid.cols), c: cell % grid.cols }, grid));
    return [p.x, p.y];
  };
  const features: Feature[] = [];
  for (const leg of out.geometry.legs) {
    if (leg.cells.length < 2) continue;
    const f = new Feature({ geometry: new LineString(leg.cells.map(xy)), kind: "leg", fromId: leg.fromId, toId: leg.toId });
    f.setStyle(routeStyle);
    features.push(f);
  }
  const h = new Feature({ geometry: new Point(xy(out.geometry.habitatCell)), kind: "habitat" });
  h.setStyle(habitatStyle);
  features.push(h);
  for (const s of out.plan.stops) {
    const cell = out.geometry.stopCells[s.id];
    if (cell === undefined) continue;
    const f = new Feature({ geometry: new Point(xy(cell)), kind: "stop", stopId: s.id });
    f.setStyle(stopStyle(s.letter));
    features.push(f);
  }
  src.addFeatures(features);
}
