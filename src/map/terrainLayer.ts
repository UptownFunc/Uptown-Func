// SI-assisted: drafted with Claude Code (Claude Opus 5.5); human Design review pending.
// The terrain-class layer of the AREA sheet: plan 9.2 symbols filled into the pipeline's class masks in screen
// pixels (src/map/terrainPattern.ts). One canvas per render; the browser does the work with three pattern fills and
// three mask draws, so pan and zoom stay cheap. Re-rendered only when the view leaves the rendered extent (ratio 1.5)
// or the resolution changes. Nothing animates. A mask that fails to load leaves the layer empty and is reported.
import ImageLayer from "ol/layer/Image";
import ImageCanvas from "ol/source/ImageCanvas";
import type { Extent } from "ol/extent";
import { F7_PROJECTION } from "./f7";
import { SYMBOLS, maskRect, patternPhase, tileInk, type SymbolKind } from "./terrainPattern";

const KINDS: SymbolKind[] = ["excluded", "steep", "unknown"];

/** Tiles are built once per pixel ratio and reused for every render. */
const tiles = new Map<string, HTMLCanvasElement>();
function tile(kind: SymbolKind, pixelRatio: number): HTMLCanvasElement {
  const key = `${kind}@${pixelRatio}`, hit = tiles.get(key);
  if (hit) return hit;
  const p = SYMBOLS[kind].period, c = document.createElement("canvas");
  c.width = c.height = p * pixelRatio;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = SYMBOLS[kind].colour;
  for (const [x, y] of tileInk(kind)) ctx.fillRect(x * pixelRatio, y * pixelRatio, pixelRatio, pixelRatio);
  tiles.set(key, c);
  return c;
}

/** `maskExtent`: the masks' own F7 extent (whole 2 m cells); `displayExtent`: the sheet's data extent, which the layer is
 *  clipped to so it never reaches past the other display layers (the mask grid can overhang it by up to 1 m). */
export function createTerrainLayer(urls: Record<SymbolKind, string>, maskExtent: Extent, displayExtent: Extent, className: string,
  onError: () => void): ImageLayer<ImageCanvas> {
  const images = new Map<SymbolKind, HTMLImageElement>();
  let failed = false, pending = KINDS.length;
  const scratch = document.createElement("canvas");
  const source = new ImageCanvas({
    projection: F7_PROJECTION, ratio: 1.5, interpolate: false,
    canvasFunction(extent, resolution, pixelRatio, size) {
      const out = document.createElement("canvas");
      out.width = Math.round(size[0]!); out.height = Math.round(size[1]!);
      if (failed || pending > 0) return out;
      const ctx = out.getContext("2d")!, s = scratch;
      s.width = out.width; s.height = out.height;
      const sc = s.getContext("2d")!;
      const m = maskRect(maskExtent, extent, resolution, pixelRatio), clip = maskRect(displayExtent, extent, resolution, pixelRatio);
      ctx.beginPath();
      ctx.rect(clip.x, clip.y, clip.w, clip.h);
      ctx.clip();
      for (const kind of KINDS) {
        sc.globalCompositeOperation = "copy";
        const pattern = sc.createPattern(tile(kind, pixelRatio), "repeat")!;
        const ph = patternPhase(extent, resolution, pixelRatio, SYMBOLS[kind].period);
        pattern.setTransform(new DOMMatrix([1, 0, 0, 1, ph.x, ph.y]));
        sc.fillStyle = pattern;
        sc.fillRect(0, 0, s.width, s.height);
        sc.globalCompositeOperation = "destination-in";
        sc.imageSmoothingEnabled = false;
        sc.drawImage(images.get(kind)!, m.x, m.y, m.w, m.h);
        ctx.drawImage(s, 0, 0);
      }
      return out;
    },
  });
  for (const kind of KINDS) {
    const img = new Image();
    // Same-origin today (area/ is relative); "anonymous" keeps the canvas exportable (briefing card) if area data is
    // ever served from another origin with CORS, instead of silently tainting it.
    img.crossOrigin = "anonymous";
    img.onload = () => { images.set(kind, img); if (--pending === 0 && !failed) source.changed(); };
    img.onerror = () => { if (!failed) { failed = true; onError(); source.changed(); } };
    img.src = urls[kind];
  }
  return new ImageLayer({ source, className });
}
