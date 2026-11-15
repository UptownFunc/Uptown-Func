// SI-assisted: drafted with Claude Code (Claude Opus 5.5); human Design review pending.
// Draws the engine's plan on the AREA sheet: grid-path legs, the habitat and lettered stops (plan 9.4).
// The features come in F1 from src/map/planGeometry (renderer-free, MAP-03) and go to F7 here through src/geo; F7 is
// display only. The line is the grid path the margins are computed on (D-04 smoothing undecided): nothing is smoothed.
import Feature from "ol/Feature";
import LineString from "ol/geom/LineString";
import Point from "ol/geom/Point";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { Fill, RegularShape, Stroke, Style, Text } from "ol/style";
import CircleStyle from "ol/style/Circle";
import { f1ToF7, type F1Point } from "../geo";
import { cellCentreF1, type GridDef } from "../geo/grid";
import type { PlanOutput } from "../engine/planner";
import { planFeatures } from "./planGeometry";
import type { ContourLevel } from "../engine/contours";

// UI-07: the route is a white line on a dark casing (reads on any terrain); stops carry the oxide accent (plan
// features, interaction); status colours stay status (OVER red dashed, NEAR LIMIT amber).
const PLAN = "#b94c22", PAPER = "#ffffff", INK = "#16120f", OVER = "#ff6b5e", CAUTION = "#f5c451";

const routeStyle = [
  new Style({ stroke: new Stroke({ color: "rgba(22, 18, 15, 0.75)", width: 7, lineCap: "round", lineJoin: "round" }) }),
  new Style({ stroke: new Stroke({ color: PAPER, width: 3, lineCap: "round", lineJoin: "round" }) }),
];
// Plan 9.4: route beyond the 0 tick takes the over colour and its word.
const overRouteStyle = [
  new Style({ stroke: new Stroke({ color: PAPER, width: 5 }) }),
  new Style({ stroke: new Stroke({ color: OVER, width: 3, lineDash: [8, 4] }) }),
];
const tickStyle = (kind: "NEAR_LIMIT" | "OVER") => new Style({
  image: new RegularShape({ points: 2, radius: 12, angle: Math.PI / 2, stroke: new Stroke({ color: kind === "OVER" ? OVER : CAUTION, width: 4 }) }),
  text: new Text({ text: kind === "OVER" ? "margin 0 here · OVER beyond" : "margin 10% here", offsetY: -16,
    font: "600 11px 'Barlow Semi Condensed', sans-serif", fill: new Fill({ color: INK }), backgroundFill: new Fill({ color: PAPER }), padding: [1, 3, 1, 3] }),
});
const markerStyle = new Style({ image: new CircleStyle({ radius: 6, fill: new Fill({ color: PAPER }), stroke: new Stroke({ color: INK, width: 2 }) }) });

const habitatStyle = [
  new Style({
    image: new RegularShape({ points: 4, radius: 10, angle: Math.PI / 4, fill: new Fill({ color: PAPER }), stroke: new Stroke({ color: INK, width: 2 }) }),
    text: new Text({ text: "H", font: "700 11px 'Barlow Semi Condensed', sans-serif", fill: new Fill({ color: INK }) }),
  }),
  // MAP-04: the habitat is the walk's anchor, so it carries its name (the habitat itself is an Assumed scenario input).
  new Style({ text: new Text({ text: "HABITAT", offsetY: 20, font: "700 10px 'Barlow Semi Condensed', sans-serif", fill: new Fill({ color: PAPER }),
    stroke: new Stroke({ color: INK, width: 3 }) }) }),
];
/** A stop marker; `scale` below 1 only while it lands (MAP-05). */
export const stopStyle = (letter: string, scale = 1) => new Style({
  image: new CircleStyle({ radius: 12 * scale, fill: new Fill({ color: PLAN }), stroke: new Stroke({ color: PAPER, width: 2.5 }) }),
  text: scale > 0.6 ? new Text({ text: letter, font: "700 12px 'Barlow Semi Condensed', sans-serif", fill: new Fill({ color: PAPER }) }) : undefined,
});

/** UI-11: the stop picked on the map carries a wider amber ring, so the pinned card's anchor is unmistakable. */
const selectedStopStyle = (letter: string) => [
  new Style({ image: new CircleStyle({ radius: 19, fill: new Fill({ color: "rgba(255, 179, 71, 0.22)" }), stroke: new Stroke({ color: "#ffb347", width: 2 }) }) }),
  stopStyle(letter),
];
/** MAP-04: which way each leg walks, a small paper chevron on the route's casing (turns with the view). */
const arrowStyle = (rotation: number) => new Style({
  image: new RegularShape({ points: 3, radius: 5.5, rotation, rotateWithView: true, fill: new Fill({ color: PAPER }), stroke: new Stroke({ color: INK, width: 1.5 }) }),
});

export function createPlanLayer(): VectorLayer<VectorSource> {
  return new VectorLayer({ source: new VectorSource(), className: "layer-plan" });
}

const toF7 = (p: F1Point) => { const q = f1ToF7(p); return [q.x, q.y]; };

export function drawPlan(layer: VectorLayer<VectorSource>, out: PlanOutput | null, grid: GridDef, selected: string | null = null): void {
  const src = layer.getSource()!;
  src.clear();
  if (!out) return;
  const g = planFeatures(out, grid);
  const features: Feature[] = [];
  for (const l of g.lines) {
    const f = new Feature({ geometry: new LineString(l.points.map(toF7)), kind: l.kind });
    f.setStyle(l.kind === "route-over" ? overRouteStyle : routeStyle);
    features.push(f);
  }
  for (const a of g.arrows) {
    const [x0, y0] = toF7(a.at), [x1, y1] = toF7(a.toward);
    const f = new Feature({ geometry: new Point([x0!, y0!]), kind: "leg-arrow" });
    f.setStyle(arrowStyle(Math.PI / 2 - Math.atan2(y1! - y0!, x1! - x0!)));
    features.push(f);
  }
  for (const t of g.ticks) {
    const f = new Feature({ geometry: new Point(toF7(t.at)), kind: `tick-${t.kind}` });
    f.setStyle(tickStyle(t.kind));
    features.push(f);
  }
  const h = new Feature({ geometry: new Point(toF7(g.habitat.at)), kind: "habitat" });
  h.setStyle(habitatStyle);
  features.push(h);
  for (const s of g.stops) {
    const f = new Feature({ geometry: new Point(toF7(s.at)), kind: "stop", stopId: s.id, letter: s.letter });
    f.setStyle(s.id === selected ? selectedStopStyle(s.letter) : stopStyle(s.letter));
    features.push(f);
  }
  src.addFeatures(features);
}

/** MAP-05: a new stop lands (its marker grows from a point with one small overshoot) once the engine has placed it.
 *  Skipped under reduced motion. Returns a function that stops it and leaves the final marker. */
export function landStop(f: Feature, letter: string, ms = 320): () => void {
  let raf = 0;
  const t0 = performance.now();
  const tick = (now: number) => {
    const t = Math.min(1, (now - t0) / ms), c = 1.9; // ease-out-back
    f.setStyle(stopStyle(letter, Math.max(0.05, 1 + (c + 1) * (t - 1) ** 3 + c * (t - 1) ** 2)));
    raf = t < 1 ? requestAnimationFrame(tick) : 0;
  };
  raf = requestAnimationFrame(tick);
  return () => { if (raf) cancelAnimationFrame(raf); raf = 0; f.setStyle(stopStyle(letter)); };
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
  text: new Text({ text: label, placement: "line", font: "10px VT323, monospace", fill: new Fill({ color: PAPER }),
    stroke: new Stroke({ color: INK, width: 3 }) }),
});
const drillStyle = (min: number) => [
  new Style({ stroke: new Stroke({ color: INK, width: 6 }) }),
  new Style({ stroke: new Stroke({ color: PAPER, width: 3, lineDash: [10, 5] }),
    text: new Text({ text: `SIMULATED DRILL · ASSUMED ${min} MIN WARNING`, placement: "line", font: "600 11px 'Barlow Semi Condensed', sans-serif",
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
