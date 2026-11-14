// SI-assisted: drafted with Claude Code (Claude Opus 5.5); human Design review pending.
// Briefing map (plan 7.8 "Print"): the card's map is exported from the same OpenLayers map, not redrawn elsewhere.
// The view is fitted to the drawn plan, then the layer canvases are composited in order (the hillshade layer with
// the same multiply blend the screen uses). Display only: F7 pixels, nothing is measured from the image.
import type OlMap from "ol/Map";
import type VectorLayer from "ol/layer/Vector";
import type VectorSource from "ol/source/Vector";
import { f7PointResolution } from "../geo";

/** layers: names of the display layers that were loaded and drawn into the image (failed layers are left out). */
export interface MapSnapshot { readonly dataUrl: string; readonly widthGround_m: number; readonly layers: readonly string[] }

/** Never hangs: resolves null on any error or after timeout_ms. The planner's view is restored afterwards. */
export function snapshotMap(map: OlMap, plan: VectorLayer<VectorSource>, latDeg: number, layers: () => readonly string[] = () => [],
  timeout_ms = 10_000): Promise<MapSnapshot | null> {
  const view = map.getView();
  const saved = { center: view.getCenter(), resolution: view.getResolution() };
  const restore = () => { if (saved.center) view.setCenter(saved.center); if (saved.resolution) view.setResolution(saved.resolution); };
  return new Promise<MapSnapshot | null>((resolve) => {
    let done = false;
    const finish = (v: MapSnapshot | null) => { if (!done) { done = true; clearTimeout(timer); resolve(v); } };
    const timer = setTimeout(() => finish(null), timeout_ms);
    try { capture(map, plan, latDeg, (s) => finish(s ? { ...s, layers: layers() } : null)); } catch { finish(null); }
  }).finally(restore);
}

function capture(map: OlMap, plan: VectorLayer<VectorSource>, latDeg: number, resolve: (v: Omit<MapSnapshot, "layers"> | null) => void): void {
  {
    const ext = plan.getSource()!.getExtent();
    if (ext && ext.every(Number.isFinite) && ext[2]! > ext[0]!) map.getView().fit(ext, { padding: [48, 48, 48, 48] });
    map.once("rendercomplete", () => { try {
      const size = map.getSize();
      const el = map.getTargetElement();
      if (!size || !el) return resolve(null);
      const out = document.createElement("canvas");
      out.width = size[0]!; out.height = size[1]!;
      const ctx = out.getContext("2d")!;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, out.width, out.height);
      el.querySelectorAll<HTMLCanvasElement>(".ol-layers canvas").forEach((c) => {
        if (c.width === 0) return;
        const container = c.parentElement;
        const opacity = container?.style.opacity || c.style.opacity;
        ctx.globalAlpha = opacity === "" || opacity === undefined ? 1 : Number(opacity);
        ctx.globalCompositeOperation = container?.classList.contains("layer-hillshade") ? "multiply" : "source-over";
        const m = c.style.transform.match(/^matrix\(([^(]*)\)$/);
        const t = m ? m[1]!.split(",").map(Number) : [1, 0, 0, 1, 0, 0];
        ctx.setTransform(t[0]!, t[1]!, t[2]!, t[3]!, t[4]!, t[5]!);
        ctx.drawImage(c, 0, 0);
      });
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      const res = map.getView().getResolution() ?? 0;
      resolve({ dataUrl: out.toDataURL("image/png"), widthGround_m: size[0]! * f7PointResolution(res, latDeg) });
    } catch { resolve(null); } });
    map.render();
  }
}
