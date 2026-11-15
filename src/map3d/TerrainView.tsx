// SI-assisted: drafted with Claude Code (Claude Opus 5.5) (3D-01..3D-07, 3D-09); human Design and Data and Science review pending.
// The 3D view of the AREA sheet, loaded only when the user opens it (App lazy-imports this module; CesiumJS is a vendor
// script loaded on demand). It reads the same plan, layer switches, hover index and selected stop as the 2D sheet and
// writes nothing but Commands' inputs (a pick) and the shared hover/selection, so switching views loses nothing.
// Cesium objects live in a ref; camera movement never re-renders React. Any failure hands back to the 2D sheet.
// 3D-09: a key lights the rendered D1 terrain with the hillshade's light (relief.ts); while it is on, the hillshade
// image is not drawn, so the relief is shown once.
import { useEffect, useRef, useState } from "react";
import type * as CesiumNS from "cesium";
import { ChevronDown, ChevronUp, LoaderCircle, Minus, Mountain, Plus, RotateCcw, RotateCw, Scan } from "lucide-react";
import { f1 } from "../geo";
import { cellCentreF1, type GridDef } from "../geo/grid";
import type { LatLon, PlanOutput } from "../engine/planner";
import type { Quantity } from "../contracts";
import { clampOverlay, type MapLayers } from "../map/layers";
import type { SymbolKind } from "../map/terrainPattern";
import { terrainHint } from "../map/terrainHint";
import { loadCesium, type Cesium } from "./vendor";
import { baseTexture, canvasLayer, classTexture, drawPlan3d, fromF5, rectOf, sphereOf, terrain, toF5, type Drawn, type Sampler } from "./scene";
import { reliefLight, reliefMaterial, reliefSource } from "./relief";

export interface TerrainViewProps {
  readonly areaUrl: string;
  readonly output: PlanOutput | null;
  readonly sampler: Sampler;
  readonly layers: MapLayers;
  readonly hoverIndex: number | null;
  readonly onHoverIndex: (i: number | null) => void;
  readonly selectedStop: string | null;
  readonly onPick?: ((p: LatLon) => void) | undefined;
  readonly onSelectStop?: ((id: string) => void) | undefined;
  /** The 3D view could not start or lost its terrain: the console returns to the 2D sheet and says why. */
  readonly onFail: (why: string) => void;
}

interface Scene3d {
  C: Cesium; w: CesiumNS.CesiumWidget; sphere: CesiumNS.Ellipsoid; grid: GridDef; rect: CesiumNS.Rectangle;
  base: { relief?: CesiumNS.ImageryLayer; plain?: CesiumNS.ImageryLayer }; classes?: CesiumNS.ImageryLayer; lighting?: CesiumNS.Material;
  lines: CesiumNS.PolylineCollection; marks: CesiumNS.BillboardCollection; hover: CesiumNS.PointPrimitiveCollection;
  home: CesiumNS.BoundingSphere; corners: CesiumNS.Cartesian3[]; drawn: Drawn; urls: { d2: string; colour: boolean; hs: string; masks: Record<SymbolKind, string> };
}
interface Readout3d { lat: string; lon: string; elev: Quantity; cls: number | null }

/** Adds an imagery layer (at the bottom when `bottom`) and returns it. */
const put = (t: Scene3d, l: CesiumNS.ImageryLayer, bottom?: number) => { t.w.imageryLayers.add(l, bottom); return l; };
/** Image credit (USGS Astrogeology asks to credit the D2 authors). */
const credit = (t: Scene3d) => `Image: D2 MSL Gale HiRISE-LRGB orthomosaic, ${t.urls.colour ? "published colour" : "luminance"} (USGS Astrogeology; T. J. Parker, F. J. Calef III)`;
const urlsColour = (t: Scene3d | null) => (t && !t.urls.colour ? "luminance" : "published colour");
const fmtQ = (q: Quantity) => (q.value === null ? "unknown" : `${q.value.toFixed(1)} ${q.unit}`);

export default function TerrainView(props: TerrainViewProps) {
  const host = useRef<HTMLDivElement>(null), credits = useRef<HTMLDivElement>(null);
  const s = useRef<Scene3d | null>(null);
  const p = useRef(props); p.current = props;
  const [ready, setReady] = useState(false), [tiles, setTiles] = useState(false), [lit, setLit] = useState(false);
  const [notes, setNotes] = useState<string[]>([]);
  /** Bumped when a plan has been drawn, so the scrub marker is placed on the drawn profile, not the previous one. */
  const [drawnN, setDrawnN] = useState(0);
  const [readout, setReadout] = useState<Readout3d | null>(null);
  const note = (n: string) => setNotes((v) => (v.includes(n) ? v : [...v, n]));

  /** Publishes, read only, where the habitat, the stops and the hover marker are on screen and where the camera is
   *  (tests click those pixels with a real pointer; nothing in the app reads them back). */
  const publish = () => {
    const t = s.current, el = host.current;
    if (!t || !el) return;
    const xy = (a: CesiumNS.Cartesian3) => { const v = t.C.SceneTransforms.worldToWindowCoordinates(t.w.scene, a); return v ? [Math.round(v.x), Math.round(v.y)] : null; };
    el.dataset.marks = JSON.stringify(Object.fromEntries([...t.drawn.marks.map((m) => [m.id, xy(m.at)]), ...t.corners.map((c, i) => [`corner${i}`, xy(c)])]));
    el.dataset.range = String(Math.round(t.C.Cartesian3.distance(t.w.camera.positionWC, t.home.center)));
    el.dataset.pitch = (t.w.camera.pitch * 180 / Math.PI).toFixed(1);
  };
  const render = () => { s.current?.w.scene.requestRender(); };

  useEffect(() => {
    let dead = false, widget: CesiumNS.CesiumWidget | null = null;
    const fail = (e: unknown) => { if (!dead) p.current.onFail(e instanceof Error ? e.message : String(e)); };
    (async () => {
      const probe = document.createElement("canvas");
      if (!(probe.getContext("webgl2") ?? probe.getContext("webgl"))) throw new Error("this browser has no WebGL");
      const base = new URL(p.current.areaUrl, document.baseURI).href;
      const get = (f: string) => fetch(base + f).then((r) => (r.ok ? r.json() : Promise.reject(new Error(`${f} could not be loaded (${r.status})`))));
      const [C, meta, report, colour] = await Promise.all([loadCesium(), get("layers.json"), get("build_report.json"), get("d2_colour.json").catch(() => null)]);
      if (dead || !host.current) return;
      const sphere = sphereOf(C), o = report.origin.f1;
      const grid: GridDef = { origin: f1(o.lat, o.lon, o.h), rows: report.rows, cols: report.cols, cell_m: report.cellSize_m };
      const L = (id: string) => (meta.layers as { id: string; path?: string; masks?: Record<SymbolKind, { path: string }> }[]).find((l) => l.id === id);
      const m = L("terrain")?.masks;
      // The published D2 colour when its file matches the display extent; else the 2D sheet's D2 luminance (grey).
      const sameGrid = colour && JSON.stringify(colour.extentF7) === JSON.stringify(meta.extentF7);
      if (!sameGrid) note("D2 colour not available: the image is the D2 luminance (grey)");
      const urls = { d2: base + (sameGrid ? colour.path : L("d2")?.path), colour: !!sameGrid, hs: base + L("hillshade")?.path,
        masks: { excluded: base + m?.excluded.path, steep: base + m?.steep.path, unknown: base + m?.unknown.path } as Record<SymbolKind, string> };
      widget = new C.CesiumWidget(host.current, {
        ellipsoid: sphere, terrainProvider: terrain(C, sphere, p.current.sampler), baseLayer: false, skyBox: false, skyAtmosphere: false,
        scene3DOnly: true, requestRenderMode: true, maximumRenderTimeChange: Number.POSITIVE_INFINITY, creditContainer: credits.current!,
        useBrowserRecommendedResolution: true,
        // Rendering is on demand (idle when nothing moves); keeping the drawn frame stops the compositor showing a
        // cleared buffer when page chrome over the canvas changes.
        contextOptions: { webgl: { preserveDrawingBuffer: true } },
      });
      const sc = widget.scene, g = sc.globe;
      g.baseColor = C.Color.fromCssColorString("#2a1a10"); sc.backgroundColor = C.Color.fromCssColorString("#140b05");
      g.showGroundAtmosphere = false; g.enableLighting = false; g.depthTestAgainstTerrain = true; sc.fog.enabled = false;
      g.maximumScreenSpaceError = 1.5; g.tileCacheSize = 300;
      // 3D-09: the scene's one light is the hillshade's, fixed to the sheet (read only by the relief material).
      sc.light = reliefLight(C, grid.origin);
      const cc = sc.screenSpaceCameraController;
      cc.minimumZoomDistance = 60; cc.maximumZoomDistance = 60_000;
      const lines = sc.primitives.add(new C.PolylineCollection()) as CesiumNS.PolylineCollection;
      const marks = sc.primitives.add(new C.BillboardCollection({ scene: sc })) as CesiumNS.BillboardCollection;
      const hover = sc.primitives.add(new C.PointPrimitiveCollection()) as CesiumNS.PointPrimitiveCollection;
      // Home: the whole sheet in view from the south-west, 38 deg down, centred on the area origin at its D1 height.
      // The sheet's corner cells at their D1 heights: the home view must hold all four.
      const cornerF1 = [[0, 0], [0, grid.cols - 1], [grid.rows - 1, 0], [grid.rows - 1, grid.cols - 1]].map(([r, c]) => cellCentreF1({ r: r!, c: c! }, grid));
      const [z0, ...zc] = await p.current.sampler.sample([{ lat: o.lat, lon: o.lon }, ...cornerF1.map((q) => ({ lat: q.lat, lon: q.lon }))]);
      const home = new C.BoundingSphere(toF5(C, f1(o.lat, o.lon, z0?.z ?? o.h)), (Math.max(grid.rows, grid.cols) * grid.cell_m) / Math.SQRT2);
      if (dead) return;
      s.current = { C, w: widget, sphere, grid, rect: rectOf(C, meta.extentF7), base: {}, lines, marks, hover, home, corners: cornerF1.map((q, i) => toF5(C, f1(q.lat, q.lon, zc[i]?.z ?? o.h))), drawn: { marks: [], profile: [] }, urls };
      // Cesium stretches the bottom imagery layer's edge pixels over every tile it does not cover; a plain layer of one
      // flat "no data" colour under the whole planet keeps the D2 image clipped to its own rectangle (3D-04).
      const blank = document.createElement("canvas"); blank.width = blank.height = 2;
      const bx = blank.getContext("2d")!; bx.fillStyle = "#2a1a10"; bx.fillRect(0, 0, 2, 2);
      put(s.current, canvasLayer(C, sphere, blank, C.Rectangle.MAX_VALUE, "Beyond the D1/D2 window: no data shown"), 0);
      goHome();
      g.tileLoadProgressEvent.addEventListener((n: number) => { if (n === 0 && g.tilesLoaded) { setTiles(true); publish(); } else if (n > 0) setTiles(false); });
      sc.camera.moveEnd.addEventListener(publish);
      sc.renderError.addEventListener((_: unknown, e: unknown) => fail(new Error(`the 3D view stopped: ${e instanceof Error ? e.message : String(e)}`)));
      // Pointer: hover reads out the ground and scrubs the profile; a click picks a stop or the ground.
      const h = new C.ScreenSpaceEventHandler(sc.canvas);
      let frame = 0, last: CesiumNS.Cartesian2 | null = null, asking = false;
      // The ground under a pixel: the rendered terrain's depth, else a ray against the loaded terrain tiles.
      // The route, the markers and the scrub marker are hidden for the pick, so it always hits the terrain: the
      // readout and a click at the same pixel then name the same ground.
      const ground = (pos: CesiumNS.Cartesian2) => {
        const plan = [lines, marks, hover];
        plan.forEach((q) => { q.show = false; });
        try {
          const d = sc.pickPositionSupported ? sc.pickPosition(pos) : undefined;
          if (d && Number.isFinite(d.x)) return d;
          const ray = sc.camera.getPickRay(pos); return ray ? g.pick(ray, sc) : undefined;
        } finally { plan.forEach((q) => { q.show = true; }); }
      };
      h.setInputAction((e: { endPosition: CesiumNS.Cartesian2 }) => {
        last = C.Cartesian2.clone(e.endPosition);
        frame ||= requestAnimationFrame(() => {
          frame = 0;
          const t = s.current, at = last && ground(last);
          if (!t || !at) { setReadout(null); return; }
          const q = fromF5(at);
          // Nearest profile sample within 12 screen pixels of the ground point (the shared scrub, UX-06).
          const tol = 12 * sc.camera.getPixelSize(new C.BoundingSphere(at, 1), sc.drawingBufferWidth, sc.drawingBufferHeight);
          let best = -1, bestD = tol * tol;
          t.drawn.profile.forEach((v, i) => { const d = C.Cartesian3.distanceSquared(v, at); if (d < bestD) { bestD = d; best = i; } });
          if ((best >= 0 ? best : null) !== p.current.hoverIndex) p.current.onHoverIndex(best >= 0 ? best : null);
          if (asking) return;
          asking = true;
          p.current.sampler.sample([{ lat: q.lat, lon: q.lon }]).then(([r]) => {
            setReadout({ lat: q.lat.toFixed(5), lon: q.lon.toFixed(5), cls: r?.cls ?? null,
              elev: r?.z == null ? { value: null, unit: "m", valueClass: "unknown", methodId: "3d:d1-bilinear", assumptionIds: [], sourceIds: ["D1"] }
                : { value: r.z, unit: "m", valueClass: "model_derived", methodId: "3d:d1-bilinear", assumptionIds: [], sourceIds: ["D1"] } });
          }).finally(() => { asking = false; });
        });
      }, C.ScreenSpaceEventType.MOUSE_MOVE);
      // Leaving the view clears its readout and lets go of the shared scrub (as the 2D sheet does).
      sc.canvas.addEventListener("pointerleave", () => { last = null; setReadout(null); if (p.current.hoverIndex !== null) p.current.onHoverIndex(null); });
      h.setInputAction((e: { position: CesiumNS.Cartesian2 }) => {
        // A click within 16 px of a stop's marker selects that stop (the markers are always drawn on top, so their
        // screen position is what the user aims at; a pick could hit the scrub marker on the route instead).
        const stop = s.current?.drawn.marks.find((m) => {
          const v = m.id !== "habitat" && C.SceneTransforms.worldToWindowCoordinates(sc, m.at);
          return v && Math.hypot(v.x - e.position.x, v.y - e.position.y) <= 16;
        })?.id;
        if (stop) { p.current.onSelectStop?.(stop); return; }
        const at = ground(e.position);
        if (at && p.current.onPick) { const q = fromF5(at); p.current.onPick({ lat: q.lat, lon: q.lon }); }
      }, C.ScreenSpaceEventType.LEFT_CLICK);
      setReady(true);
    })().catch(fail);
    return () => { dead = true; s.current = null; widget?.destroy(); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /** Back to the starting view: the whole sheet. */
  const goHome = () => {
    const t = s.current;
    if (!t) return;
    const off = new t.C.HeadingPitchRange(-0.45, -0.66, t.home.radius * 2.35);
    // It jumps: Motion owns the app's timelines (CLAUDE.md), so the camera adds none of its own.
    t.w.camera.viewBoundingSphere(t.home, off); t.w.camera.lookAtTransform(t.C.Matrix4.IDENTITY);
    render(); publish();
  };
  /** Orbit, tilt or zoom about the ground at the centre of the view (or the sheet centre if the view holds no ground). */
  const move = (kind: "in" | "out" | "left" | "right" | "up" | "down") => {
    const t = s.current;
    if (!t) return;
    const { C, w } = t, cam = w.camera, sc = w.scene;
    const mid = new C.Cartesian2(sc.canvas.clientWidth / 2, sc.canvas.clientHeight / 2), ray = cam.getPickRay(mid);
    const target = sc.pickPositionSupported ? sc.pickPosition(mid) ?? (ray && sc.globe.pick(ray, sc)) ?? t.home.center : (ray && sc.globe.pick(ray, sc)) ?? t.home.center;
    const range = C.Cartesian3.distance(cam.positionWC, target), pitch = cam.pitch;
    cam.cancelFlight();
    if (kind === "in" || kind === "out") cam.moveForward(kind === "in" ? Math.min(range * 0.4, range - 80) : -range * 0.6);
    else {
      cam.lookAtTransform(C.Transforms.eastNorthUpToFixedFrame(target, t.sphere));
      const a = 0.26; // 15 deg a press
      if (kind === "left") cam.rotateLeft(a); else if (kind === "right") cam.rotateRight(a);
      else if (kind === "up" && pitch < -0.37) cam.rotateUp(Math.min(a, -0.35 - pitch)); // towards the horizon, never flatter than 20 deg
      else if (kind === "down" && pitch > -1.5) cam.rotateDown(Math.min(a, pitch + 1.55)); // towards overhead
      cam.lookAtTransform(C.Matrix4.IDENTITY);
    }
    render(); publish();
  };

  // Layers (MAP-02, shared with 2D): the base image with or without relief, the terrain-class symbols and their strength.
  // 3D-09: with the lighting on, the base image is the D2 without the hillshade, whatever the Hillshade switch says.
  useEffect(() => {
    const t = s.current;
    if (!ready || !t) return;
    let live = true;
    const want = reliefSource(props.layers.relief, lit) === "hillshade" ? "relief" : "plain";
    const ensureBase = async () => {
      if (!t.base[want]) {
        try {
          const c = await baseTexture(t.urls.d2, want === "relief" ? t.urls.hs : null);
          if (!live || t.base[want]) return;
          t.base[want] = put(t, canvasLayer(t.C, t.sphere, c, t.rect, credit(t) + (want === "relief" ? "; D1 hillshade (USGS)" : "")), 1);
        } catch (e) {
          // No imagery is drawn rather than any stand-in: the terrain stays, in its plain base colour.
          note(`${e instanceof Error ? e.message : String(e)}: the terrain is shown without ${want === "relief" ? "relief shading" : "imagery"}`);
          if (want === "relief") { try { const c = await baseTexture(t.urls.d2, null); if (live && !t.base.plain) t.base.plain = put(t, canvasLayer(t.C, t.sphere, c, t.rect, credit(t)), 1); } catch { /* noted above */ } }
        }
      }
      if (!live) return; // a newer switch setting decides what shows
      const shown = t.base[want] ?? t.base.plain;
      for (const l of [t.base.relief, t.base.plain]) if (l) l.show = l === shown;
      // Set with the base image, in the same frame, so the two reliefs are never drawn together.
      t.w.scene.globe.material = lit ? (t.lighting ??= reliefMaterial(t.C, t.grid.origin)) : undefined;
      render();
    };
    const ensureClasses = async () => {
      if (props.layers.terrain && !t.classes) {
        try { const c = await classTexture(t.urls.masks); if (live && !t.classes) t.classes = put(t, canvasLayer(t.C, t.sphere, c, t.rect, "Terrain classes: D1 slope-screened (model derived)")); }
        catch (e) { note(`Terrain classes could not be loaded (${e instanceof Error ? e.message : String(e)})`); }
      }
      if (t.classes) { t.classes.show = props.layers.terrain; t.classes.alpha = clampOverlay(props.layers.overlay); }
      host.current!.dataset.layers = [t.base.relief?.show && "relief", t.base.plain?.show && "plain", t.classes?.show && "terrain", t.w.scene.globe.material && "lit"].filter(Boolean).join(" ");
      host.current!.dataset.overlay = String(t.classes?.alpha ?? "");
      render();
    };
    void ensureBase().then(ensureClasses);
    return () => { live = false; };
  }, [ready, lit, props.layers.relief, props.layers.terrain, props.layers.overlay]); // eslint-disable-line react-hooks/exhaustive-deps

  // The plan (route, habitat, stops) and the selected stop.
  useEffect(() => {
    const t = s.current;
    if (!ready || !t) return;
    let live = true;
    void drawPlan3d(t.C, t.lines, t.marks, props.output, t.grid, props.sampler, props.selectedStop, () => live).then((d) => {
      if (d && live && s.current) { s.current.drawn = d; setDrawnN((n) => n + 1); render(); publish(); }
    });
    return () => { live = false; };
  }, [ready, props.output, props.selectedStop]); // eslint-disable-line react-hooks/exhaustive-deps

  // The shared scrub marker (profile <-> route).
  useEffect(() => {
    const t = s.current;
    if (!ready || !t) return;
    t.hover.removeAll();
    const at = props.hoverIndex === null ? undefined : t.drawn.profile[props.hoverIndex];
    if (at) t.hover.add({ position: at, pixelSize: 12, color: t.C.Color.WHITE, outlineColor: t.C.Color.fromCssColorString("#16120f"), outlineWidth: 2, disableDepthTestDistance: Number.POSITIVE_INFINITY });
    const v = at && t.C.SceneTransforms.worldToWindowCoordinates(t.w.scene, at);
    host.current!.dataset.hover = v ? `${Math.round(v.x)} ${Math.round(v.y)}` : "";
    render();
  }, [ready, props.hoverIndex, drawnN]); // eslint-disable-line react-hooks/exhaustive-deps

  const k = (label: string, kind: Parameters<typeof move>[0], icon: React.ReactNode) =>
    <button type="button" title={label} aria-label={label} disabled={!ready} onClick={() => move(kind)}>{icon}</button>;
  const ground = readout ? terrainHint(readout.cls) : null;
  return (
    <div className="scene3d" data-testid="scene-3d" data-ready={ready} data-tiles={tiles}>
      <div className="scene3d-canvas" ref={host} role="application" aria-label="3D terrain view. Drag to pan, right-drag or wheel to zoom, Ctrl-drag to rotate and tilt; the keys do the same." />
      <div className="scene3d-credits" ref={credits} aria-hidden="true" hidden />
      <p className="scene3d-attrib">Heights D1 MSL Gale DEM · image D2 HiRISE-LRGB, {urlsColour(s.current)} · USGS Astrogeology (T. J. Parker, F. J. Calef III) · CesiumJS</p>
      {!tiles && <p className="sheet-msg scene3d-loading" role="status" data-testid="scene-3d-loading"><LoaderCircle size={18} strokeWidth={1.75} aria-hidden="true" />{ready ? "Refining the terrain…" : "Loading the 3D terrain…"}</p>}
      {notes.length > 0 && <div className="layer-errors" role="status" data-testid="scene-3d-notes">{notes.join(". ")}.</div>}
      <div className="map-keys" role="group" aria-label="3D view">
        {k("Zoom in", "in", <Plus size={18} strokeWidth={2} aria-hidden="true" />)}
        {k("Zoom out", "out", <Minus size={18} strokeWidth={2} aria-hidden="true" />)}
        {k("Rotate left", "left", <RotateCcw size={17} strokeWidth={1.75} aria-hidden="true" />)}
        {k("Rotate right", "right", <RotateCw size={17} strokeWidth={1.75} aria-hidden="true" />)}
        {k("Tilt towards the horizon", "up", <ChevronUp size={18} strokeWidth={2} aria-hidden="true" />)}
        {k("Tilt towards overhead", "down", <ChevronDown size={18} strokeWidth={2} aria-hidden="true" />)}
        <button type="button" title="Reset the view" aria-label="Reset the view" disabled={!ready} onClick={() => goHome()}><Scan size={18} strokeWidth={1.75} aria-hidden="true" /></button>
        <button type="button" title="Relief lighting: light the terrain from the north-west, 45° up, as the hillshade (it replaces the hillshade image in 3D)"
          aria-label="Relief lighting" aria-pressed={lit} disabled={!ready} onClick={() => setLit((v) => !v)}><Mountain size={18} strokeWidth={1.75} aria-hidden="true" /></button>
      </div>
      <div className="status status-3d" data-testid="status-line-3d">
        {readout ? <>
          <span><span className="label">lat </span>{readout.lat}</span><span><span className="label">lon </span>{readout.lon} E</span>
          <span><span className="label">elev </span>{fmtQ(readout.elev)}</span>
          <span className="label">D1 between 2 m cells; vertical reference unverified{ground ? ` · ${ground.text.split(" · ")[0]}` : ""}</span>
        </> : <span className="label">3D: D1 heights at true scale (no exaggeration) under the D2 orthophoto.{lit
          ? " Lit from the north-west, 45° up, as the hillshade; not the sun." : ""} Point at the ground for coordinates.</span>}
      </div>
    </div>
  );
}
