// SI-assisted: drafted with Claude Code (Claude Opus 5.5) (3D-01..3D-06); human Design and Data and Science review pending.
// The 3D scene, built on CesiumJS only when the user opens 3D (vendor.ts). Frames (CLAUDE.md): every position Cesium
// receives is an F5 Cartesian3 from src/geo; the globe is the plan's F1 sphere (R_F1), so F5 from src/geo and Cesium
// agree exactly and no sphere-to-ellipsoid correction applies (3D-03). Cesium cartographic values are only used as
// transient API inputs (tile bounds, the draped image's rectangle), never stored or shown.
// Data (3D-01, 3D-04): heights are D1 from the engine's grid (heights.ts, in the worker), no exaggeration; the draped
// image is the D2 orthophoto in its published colour (pipeline run_colour, same F7 window and 1 m grid as the 2D
// layers), softly multiplied by the D1 hillshade when relief is on; if the colour file is missing, the D2 luminance
// the 2D sheet uses, as it is (grey). The terrain-class symbols are the 2D sheet's masks and hatches. Nothing is drawn
// beyond the D1/D2 window.
import type * as CesiumNS from "cesium";
import { R_F1, f1, f1ToF5, f5ToF1, f7ToF1, type F1Point } from "../geo";
import { cellCentreF1, type GridDef } from "../geo/grid";
import type { PlanOutput } from "../engine/planner";
import { planFeatures } from "../map/planGeometry";
import { SYMBOLS, tileInk, type SymbolKind } from "../map/terrainPattern";
import type { BoundsF1 } from "./heights";
import type { Cesium } from "./vendor";

type C = Cesium;
export interface Sampler {
  heights(b: BoundsF1, w: number, h: number): Promise<Float32Array>;
  sample(points: { lat: number; lon: number }[]): Promise<{ z: number | null; cls: number | null }[]>;
}

const deg = (r: number) => (r * 180) / Math.PI;
export const toF5 = (C: C, p: F1Point) => { const q = f1ToF5(p); return new C.Cartesian3(q.x, q.y, q.z); };
export const fromF5 = (c: { x: number; y: number; z: number }) => f5ToF1({ frame: "F5", x: c.x, y: c.y, z: c.z });

const image = (url: string) => new Promise<HTMLImageElement>((ok, no) => {
  const i = new Image(); i.crossOrigin = "anonymous"; i.onload = () => ok(i); i.onerror = () => no(new Error(`${url.split("/").pop()} could not be loaded`)); i.src = url;
});
const canvasOf = (w: number, h: number) => { const c = document.createElement("canvas"); c.width = w; c.height = h; return c; };

/** The D2 image as given, optionally multiplied by the D1 hillshade at 60 % (both on the same F7 extent and grid). */
export async function baseTexture(d2: string, hillshade: string | null): Promise<HTMLCanvasElement> {
  const a = await image(d2), c = canvasOf(a.naturalWidth, a.naturalHeight), x = c.getContext("2d")!;
  x.drawImage(a, 0, 0);
  if (hillshade) { x.globalCompositeOperation = "multiply"; x.globalAlpha = 0.6; x.drawImage(await image(hillshade), 0, 0, c.width, c.height); }
  return c;
}

/** The terrain classes with the 2D sheet's plan 9.2 symbols (one texel per mask cell) over a light wash of the same colour. */
export async function classTexture(masks: Record<SymbolKind, string>): Promise<HTMLCanvasElement> {
  const kinds = Object.keys(masks) as SymbolKind[], imgs = await Promise.all(kinds.map((k) => image(masks[k])));
  const out = canvasOf(imgs[0]!.naturalWidth, imgs[0]!.naturalHeight), o = out.getContext("2d")!;
  kinds.forEach((k, i) => {
    const p = SYMBOLS[k].period, t = canvasOf(p, p), tx = t.getContext("2d")!, s = canvasOf(out.width, out.height), sx = s.getContext("2d")!;
    tx.fillStyle = SYMBOLS[k].colour; for (const [x, y] of tileInk(k)) tx.fillRect(x, y, 1, 1);
    // A soft wash of the symbol's colour under its hatch keeps the class readable when the hatch is too fine to see.
    sx.fillStyle = SYMBOLS[k].colour; sx.globalAlpha = 0.28; sx.fillRect(0, 0, s.width, s.height); sx.globalAlpha = 1;
    sx.fillStyle = sx.createPattern(t, "repeat")!; sx.fillRect(0, 0, s.width, s.height);
    sx.globalCompositeOperation = "destination-in"; sx.drawImage(imgs[i]!, 0, 0); o.drawImage(s, 0, 0);
  });
  return out;
}

/** A Rectangle for an F7 extent (F7 is equirectangular on the F1 sphere, so it maps exactly onto Cesium's geographic
 *  tiling of the same sphere): the corners go F7 -> F1 through src/geo. */
export function rectOf(C: C, e: readonly number[]): CesiumNS.Rectangle {
  const sw = f7ToF1({ frame: "F7", x: e[0]!, y: e[1]! }, 0), ne = f7ToF1({ frame: "F7", x: e[2]!, y: e[3]! }, 0);
  return C.Rectangle.fromDegrees(sw.lon, sw.lat, ne.lon, ne.lat);
}

/** An imagery layer showing one canvas over one rectangle (no encoding, no network). */
export function canvasLayer(C: C, sphere: CesiumNS.Ellipsoid, canvas: HTMLCanvasElement, rect: CesiumNS.Rectangle, credit: string): CesiumNS.ImageryLayer {
  const provider = {
    tilingScheme: new C.GeographicTilingScheme({ ellipsoid: sphere, rectangle: rect, numberOfLevelZeroTilesX: 1, numberOfLevelZeroTilesY: 1 }),
    rectangle: rect, tileWidth: canvas.width, tileHeight: canvas.height, minimumLevel: 0, maximumLevel: 0,
    tileDiscardPolicy: undefined, errorEvent: new C.Event(), credit: new C.Credit(credit), proxy: undefined, hasAlphaChannel: true,
    getTileCredits: () => [], requestImage: () => Promise.resolve(canvas), pickFeatures: () => undefined,
  } as unknown as CesiumNS.ImageryProvider;
  return new C.ImageryLayer(provider, { rectangle: rect });
}

/** Terrain from D1 through the worker: 65 x 65 posts per tile, the geographic tiling of the F1 sphere. */
export function terrain(C: C, sphere: CesiumNS.Ellipsoid, sampler: Sampler): CesiumNS.TerrainProvider {
  const ts = new C.GeographicTilingScheme({ ellipsoid: sphere });
  return new C.CustomHeightmapTerrainProvider({
    width: 65, height: 65, tilingScheme: ts, credit: "Heights: D1 (HiRISE DTM mosaic), 2 m grid, no exaggeration",
    callback: (x, y, level) => { const r = ts.tileXYToRectangle(x, y, level); return sampler.heights({ north: deg(r.north), south: deg(r.south), east: deg(r.east), west: deg(r.west) }, 65, 65); },
  });
}

export const sphereOf = (C: C) => new C.Ellipsoid(R_F1, R_F1, R_F1);

/** Marker image: a lettered stop (the 2D oxide disc) or the habitat diamond. */
function markerCanvas(letter: string, habitat: boolean, selected: boolean): HTMLCanvasElement {
  const c = canvasOf(48, 48), x = c.getContext("2d")!;
  x.translate(24, 24);
  if (selected) { x.beginPath(); x.arc(0, 0, 21, 0, 7); x.fillStyle = "rgba(255,179,71,.3)"; x.fill(); x.strokeStyle = "#ffb347"; x.lineWidth = 2; x.stroke(); }
  x.beginPath();
  if (habitat) { x.rotate(Math.PI / 4); x.rect(-10, -10, 20, 20); x.rotate(-Math.PI / 4); } else x.arc(0, 0, 13, 0, 7);
  x.fillStyle = habitat ? "#fff" : "#b94c22"; x.fill(); x.lineWidth = habitat ? 2.5 : 3; x.strokeStyle = habitat ? "#16120f" : "#fff"; x.stroke();
  x.fillStyle = habitat ? "#16120f" : "#fff"; x.font = "700 14px 'Barlow Semi Condensed', sans-serif"; x.textAlign = "center"; x.textBaseline = "middle";
  x.fillText(habitat ? "H" : letter, 0, 1);
  return c;
}

export interface Drawn { marks: { id: string; at: CesiumNS.Cartesian3 }[]; profile: CesiumNS.Cartesian3[] }

/** Draws the plan: the route on the 2 m grid path at D1 height + 3 m (the line the margins use, not smoothed; red after
 *  the OVER mark, as in 2D), the habitat and the stops at their D1 heights + 3 m, markers always on top. */
export async function drawPlan3d(C: C, lines: CesiumNS.PolylineCollection, marks: CesiumNS.BillboardCollection, out: PlanOutput | null,
  grid: GridDef, sampler: Sampler, selected: string | null, current: () => boolean): Promise<Drawn | null> {
  if (!out) { lines.removeAll(); marks.removeAll(); return { marks: [], profile: [] }; }
  const g = planFeatures(out, grid), prof = out.geometry.profile;
  const pts = [g.habitat.at, ...g.stops.map((s) => s.at), ...g.lines.flatMap((l) => (l.kind === "leg" ? l.points : []))];
  const z = await sampler.sample(pts.map((p) => ({ lat: p.lat, lon: p.lon })));
  // A newer plan arrived while the heights were fetched: draw nothing (clearing here, after the wait, means two quick
  // changes can never both draw).
  if (!current()) return null;
  lines.removeAll(); marks.removeAll();
  const lift = (p: F1Point, h: number | null | undefined) => toF5(C, f1(p.lat, p.lon, (h ?? 0) + 3));
  // Profile points carry the engine's own D1 height per cell; legs without a profile use the sampled heights.
  const profile = prof.map((s) => { const c = { r: Math.floor(s.cell / grid.cols), c: s.cell % grid.cols }; return { c, z: s.z_m }; });
  const profF5 = profile.map(({ c, z: h }) => lift(cellCentreF1(c, grid), h));
  let k = 1 + g.stops.length;
  for (const l of g.lines) {
    const positions = l.kind === "leg" ? l.points.map((p) => lift(p, z[k++]?.z)) : l.kind === "route" ? profF5.slice(0, l.points.length) : profF5.slice(profF5.length - l.points.length);
    lines.add({ positions, width: 5, material: C.Material.fromType("PolylineOutline", { color: C.Color.fromCssColorString(l.kind === "route-over" ? "#ff6b5e" : "#ffffff"),
      outlineColor: C.Color.fromCssColorString("#16120f"), outlineWidth: 2 }) });
  }
  const at = [lift(g.habitat.at, z[0]?.z), ...g.stops.map((s, i) => lift(s.at, z[i + 1]?.z))];
  [{ id: "habitat", letter: "H" }, ...g.stops].forEach((s, i) => marks.add({ position: at[i]!, image: markerCanvas(s.letter, s.id === "habitat", s.id === selected),
    disableDepthTestDistance: Number.POSITIVE_INFINITY, id: s.id }));
  return { marks: at.map((a, i) => ({ id: i === 0 ? "habitat" : g.stops[i - 1]!.id, at: a })), profile: profF5 };
}
