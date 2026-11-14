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
import type { ContourLevel } from "../engine/contours";

// UI-02 Folio: cobalt survey ink marks the plan (interaction), ink and paper the symbols; status colours stay status.
const PLAN = "#2340d8", PAPER = "#fbf9f4", INK = "#14130f", OVER = "#c2261b", CAUTION = "#e3a21a";

const routeStyle = [
  new Style({ stroke: new Stroke({ color: PAPER, width: 6, lineCap: "round", lineJoin: "round" }) }),
  new Style({ stroke: new Stroke({ color: PLAN, width: 3, lineCap: "round", lineJoin: "round" }) }),
];
// Plan 9.4: route beyond the 0 tick takes the over colour and its word.
const overRouteStyle = [
  new Style({ stroke: new Stroke({ color: PAPER, width: 5 }) }),
  new Style({ stroke: new Stroke({ color: OVER, width: 3, lineDash: [8, 4] }) }),
];
const tickStyle = (kind: "NEAR_LIMIT" | "OVER") => new Style({
  image: new RegularShape({ points: 2, radius: 12, angle: Math.PI / 2, stroke: new Stroke({ color: kind === "OVER" ? OVER : CAUTION, width: 4 }) }),
  text: new Text({ text: kind === "OVER" ? "margin 0 here · OVER beyond" : "margin 10% here", offsetY: -16,
    font: "600 11px 'Instrument Sans Variable', system-ui", fill: new Fill({ color: INK }), backgroundFill: new Fill({ color: PAPER }), padding: [1, 3, 1, 3] }),
});
const markerStyle = new Style({ image: new CircleStyle({ radius: 6, fill: new Fill({ color: PAPER }), stroke: new Stroke({ color: INK, width: 2 }) }) });

const habitatStyle = new Style({
  image: new RegularShape({ points: 4, radius: 9, angle: Math.PI / 4, fill: new Fill({ color: PAPER }), stroke: new Stroke({ color: INK, width: 2 }) }),
  text: new Text({ text: "H", font: "600 11px 'Instrument Sans Variable', system-ui", fill: new Fill({ color: INK }) }),
});
const stopStyle = (letter: string) => new Style({
  image: new CircleStyle({ radius: 11, fill: new Fill({ color: PAPER }), stroke: new Stroke({ color: INK, width: 2 }) }),
  text: new Text({ text: letter, font: "600 13px 'Newsreader Variable', Georgia, serif", fill: new Fill({ color: INK }) }),
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
  // Split the walk at the OVER tick: everything after it is drawn in the over colour.
  const over = out.geometry.marginTicks.find((t) => t.kind === "OVER");
  const prof = out.geometry.profile;
  const overAt = over ? prof.findIndex((p) => p.s_m >= over.s_m) : -1;
  const cut = overAt >= 0 ? overAt : prof.length;
  const line = (from: number, to: number, style: Style[], kind: string) => {
    if (to - from < 1) return;
    const f = new Feature({ geometry: new LineString(prof.slice(from, to + 1).map((p) => xy(p.cell))), kind });
    f.setStyle(style);
    features.push(f);
  };
  if (prof.length) {
    line(0, Math.min(cut, prof.length - 1), routeStyle, "route");
    if (overAt >= 0) line(overAt, prof.length - 1, overRouteStyle, "route-over");
  } else {
    // No whole-walk profile (a leg is unreachable): draw the legs that exist, each on its own.
    for (const leg of out.geometry.legs) {
      if (leg.cells.length < 2) continue;
      const f = new Feature({ geometry: new LineString(leg.cells.map(xy)), kind: "leg" });
      f.setStyle(routeStyle);
      features.push(f);
    }
  }
  for (const t of out.geometry.marginTicks) {
    const f = new Feature({ geometry: new Point(xy(t.cell)), kind: `tick-${t.kind}` });
    f.setStyle(tickStyle(t.kind));
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

/** Separate small layer for the scrub marker, so hovering never redraws the plan. */
export function createMarkerLayer(): VectorLayer<VectorSource> {
  return new VectorLayer({ source: new VectorSource(), className: "layer-marker" });
}

export function drawMarker(layer: VectorLayer<VectorSource>, cell: number | null, grid: GridDef): void {
  const src = layer.getSource()!;
  src.clear();
  if (cell === null) return;
  const p = f1ToF7(cellCentreF1({ r: Math.floor(cell / grid.cols), c: cell % grid.cols }, grid));
  const f = new Feature({ geometry: new Point([p.x, p.y]) });
  f.setStyle(markerStyle);
  src.addFeature(f);
}

// Tier 2 time-to-habitat contours (plan 9.2: labelled lines, never filled) and the simulated drill line (plan 6.9).

export interface ContourDisplay { readonly levels: readonly ContourLevel[]; readonly drill_s: number | null }

const contourStyle = (label: string) => new Style({
  stroke: new Stroke({ color: "rgba(243, 238, 228, 0.7)", width: 1 }),
  text: new Text({ text: label, placement: "line", font: "10px 'DM Mono', monospace", fill: new Fill({ color: PAPER }),
    stroke: new Stroke({ color: INK, width: 3 }) }),
});
const drillStyle = (min: number) => [
  new Style({ stroke: new Stroke({ color: INK, width: 6 }) }),
  new Style({ stroke: new Stroke({ color: PAPER, width: 3, lineDash: [10, 5] }),
    text: new Text({ text: `SIMULATED DRILL · ASSUMED ${min} MIN WARNING`, placement: "line", font: "600 11px 'Instrument Sans Variable', system-ui",
      fill: new Fill({ color: INK }), stroke: new Stroke({ color: PAPER, width: 4 }) }) }),
];

export function createContourLayer(): VectorLayer<VectorSource> {
  return new VectorLayer({ source: new VectorSource(), className: "layer-contours" });
}

/** Contour lines arrive in fine-grid cell-edge coordinates (x = column edge, y = row edge); src/geo places them. */
export function drawContours(layer: VectorLayer<VectorSource>, c: ContourDisplay | null, grid: GridDef): number {
  const src = layer.getSource()!;
  src.clear();
  if (!c) return 0;
  const xy = ([x, y]: [number, number]) => {
    const p = f1ToF7(cellCentreF1({ r: y - 0.5, c: x - 0.5 }, grid));
    return [p.x, p.y];
  };
  const features: Feature[] = [];
  for (const lvl of c.levels) {
    const min = Math.round(lvl.level_s / 60), drill = c.drill_s !== null && Math.abs(lvl.level_s - c.drill_s) < 1;
    for (const line of lvl.lines) {
      const f = new Feature({ geometry: new LineString(line.map(xy)), kind: drill ? "drill" : "contour", level_min: min });
      f.setStyle(drill ? drillStyle(min) : contourStyle(`est. ${min} min`));
      features.push(f);
    }
  }
  src.addFeatures(features);
  return features.length;
}
