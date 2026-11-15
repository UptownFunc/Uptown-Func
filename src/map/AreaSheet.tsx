// SI-assisted: drafted with Claude Code (Claude Opus 5.5); Folio plate and HUD on design/sharpwalk-ui-ux; final 2D map
// polish (MAP-01..MAP-08) with Claude Opus 5.5; human Design review pending.
// Plan 7.8 AREA level of the 2D sheet: D2 base, D1 hillshade multiplied, terrain classes, scale bar, cursor readout.
// F7 is display only; the readout's east/north and elevation come from the F6 grid through src/geo. What is shown
// (MapLayers) and what is drawn (planGeometry) are renderer-free inputs, so a later 3D view can share them.
import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import OlMap from "ol/Map";
import View from "ol/View";
import ImageLayer from "ol/layer/Image";
import Static from "ol/source/ImageStatic";
import ScaleLine from "ol/control/ScaleLine";
import { defaults as defaultInteractions } from "ol/interaction/defaults";
import type BaseLayer from "ol/layer/Base";
import { f1ToF7, f7ToF1, offsetF1, type F1Point } from "../geo";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { Stroke, Style } from "ol/style";
import RegularShape from "ol/style/RegularShape";
import { cellCentreF1, type GridDef } from "../geo/grid";
import type { LatLon, PlanOutput } from "../engine/planner";
import { createContourLayer, createMarkerLayer, createPlanLayer, createProgressLayer, drawContours, drawMarker, drawPlan, drawProgress, type ContourDisplay } from "./planLayer";
import { progressText, type Progress } from "../field/progress";
import { snapshotMap, type MapSnapshot } from "./snapshot";
import { F7_PROJECTION } from "./f7";
import { FIT_PADDING, MAX_RESOLUTION_F7, fitResolution, formatView } from "./view";
import { DEFAULT_LAYERS, MIN_OVERLAY, clampOverlay, layerShown, type MapLayers } from "./layers";
import { SYMBOLS, tileInk, type SymbolKind } from "./terrainPattern";
import { loadArea, type LoadedArea } from "./loadArea";
import { readoutAt, type Readout } from "./readout";
import { coverageNote, coveragePolygonsF7, viewCoverage, type PolygonsF7 } from "./coverage";
import { createCoverageLayer, drawCoverage } from "./coverageLayer";
import { contourLegend, contourLinesF7 } from "./elevationContours";
import { createElevationLayer, drawElevationContours } from "./elevationLayer";
import { createTerrainLayer } from "./terrainLayer";
import { skySampleAt, type SkySampler } from "./skySample";
import type { Quantity } from "../contracts";
import { Layers, LoaderCircle, MousePointerClick, Minus, Plus, RotateCcw, Route, Scan, X } from "lucide-react";
import Overlay from "ol/Overlay";
import { terrainHint } from "./terrainHint";

/** The view glides on the map keys (zoom, fit) follow the user's reduced-motion setting: then they jump. */
const reducedMotion = () => typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
const EASE = (t: number) => 1 - (1 - t) ** 3;

/** A terrain symbol's tile as a CSS background, for the key (the same ink the layer draws). Built once. */
function swatchOf(kind: SymbolKind): string {
  const p = SYMBOLS[kind].period;
  const rects = tileInk(kind).map(([x, y]) => `<rect x='${x}' y='${y}' width='1' height='1'/>`).join("");
  return `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='${p}' height='${p}' fill='${SYMBOLS[kind].colour}' shape-rendering='crispEdges'>${rects}</svg>`)}")`;
}
const SWATCH: Record<SymbolKind, string> = { steep: swatchOf("steep"), excluded: swatchOf("excluded"), unknown: swatchOf("unknown") };

/** Displays a Quantity: unknown stays "unknown" (CLAUDE.md); one decimal for metres. */
function fmt(q: Quantity): string {
  return q.value === null ? "unknown" : `${q.value.toFixed(1)} ${q.unit}`;
}

/** The loaded area with the engine's terrain classes on its grid, when they fit it (a wrong-sized grid is ignored). */
function withClasses(a: LoadedArea, classes: Uint8Array | null): LoadedArea {
  const { classes: _old, ...grid } = a.grid;
  return { ...a, grid: classes && classes.length === grid.rows * grid.cols ? { ...grid, classes } : grid };
}

function profileXY(plan: PlanOutput | null, grid: GridDef): Float64Array {
  const prof = plan?.geometry.profile ?? [];
  const out = new Float64Array(prof.length * 2);
  prof.forEach((p, i) => {
    const x = f1ToF7(cellCentreF1({ r: Math.floor(p.cell / grid.cols), c: p.cell % grid.cols }, grid));
    out[2 * i] = x.x; out[2 * i + 1] = x.y;
  });
  return out;
}

export interface AreaSheetProps {
  readonly dataUrl: string;
  /** The engine's latest plan (a copy); the sheet only draws it. */
  readonly plan?: PlanOutput | null;
  /** Called with the F1 position of a click; the console turns it into a Command for the engine. */
  readonly onPick?: ((p: LatLon) => void) | undefined;
  /** Receives a function that exports the current sheet with the plan for the briefing card (plan 7.8). */
  readonly onSnapshotReady?: (snapshot: () => Promise<MapSnapshot | null>) => void;
  /** Index into plan.geometry.profile under the pointer (shared with the profile chart, UX-06). */
  readonly hoverIndex?: number | null;
  readonly onHoverIndex?: (i: number | null) => void;
  /** Dataset ids of the layers drawn on the sheet (from layers.json), for the sources panel (UX-15). */
  readonly onDatasets?: (ids: string[]) => void;
  /** The keyboard cursor position (AC-32), so stops can be moved to it by keyboard. */
  readonly onCursor?: (p: LatLon | null) => void;
  /** Tier 2 time-to-habitat contours and the simulated drill line; null hides them. */
  readonly contours?: ContourDisplay | null;
  /** Plan 6.7 sky-obstruction layer (tier 2), off by default; geometry, not dose. */
  readonly showSky?: boolean;
  /** Whether this area has a sky layer, and whether its image failed to load; with the per-stop 20 m sampler (plan 6.7). */
  readonly onSky?: (state: "none" | "ok" | "failed", sample?: SkySampler) => void;
  /** Layer switches shown at the top of the Layers panel (the console owns their state). */
  readonly tools?: ReactNode;
  /** One line telling the user what a click on the sheet does in the current step. */
  readonly hint?: string;
  /** UI-11 point and click: a click on a stop marker selects it instead of adding a stop. */
  readonly onSelectStop?: ((stopId: string) => void) | undefined;
  readonly selectedStop?: string | null;
  /** A card pinned to the selected stop (an OpenLayers overlay keeps it on the stop while the map moves). */
  readonly popover?: ReactNode;
  /** Cursor tag: true shows the terrain-class hint under the pointer; a string replaces it (e.g. move mode). */
  readonly cursorHint?: boolean | string;
  /** The engine's terrain-class grid (a copy), for the cursor tag. Null until the engine has loaded it, or when the
   *  engine could not start: the tag then says the ground cannot be checked. The sheet never downloads it itself. */
  readonly terrainClasses?: Uint8Array | null;
  /** MAP-02: which display layers are shown and how strong the overlays are (the console owns it). */
  readonly layers?: MapLayers;
  readonly onLayers?: (l: MapLayers) => void;
  /** HUD-01: the crew's progress from the HUD's manual ticks (null: not shown). */
  readonly progress?: Progress | null;
}

const cursorStyle = new Style({ image: new RegularShape({ points: 4, radius: 11, radius2: 0, angle: 0, stroke: new Stroke({ color: "#f3eee4", width: 2 }) }) });

export function AreaSheet({ dataUrl, plan = null, onPick, onSnapshotReady, hoverIndex = null, onHoverIndex, onDatasets, onCursor, contours = null, showSky = false, onSky, tools, hint, onSelectStop, selectedStop = null, popover = null, cursorHint = false, terrainClasses = null, layers = DEFAULT_LAYERS, onLayers, progress = null }: AreaSheetProps) {
  const [layersOpen, setLayersOpen] = useState(false);
  const layersBtn = useRef<HTMLButtonElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const keysRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  /** Retry key: a failed load can be tried again without reloading the page (the plan and the engine are kept). */
  const [attempt, setAttempt] = useState(0);
  /** True once the map has been built on the loaded area (the load message shows until then). */
  const [ready, setReady] = useState(false);
  const layersRef = useRef(layers);
  layersRef.current = layers;
  /** The OpenLayers layers the MapLayers switches act on, once built. */
  const switched = useRef<{ relief?: BaseLayer; terrain?: BaseLayer }>({});
  const classesRef = useRef(terrainClasses);
  classesRef.current = terrainClasses;
  const selectRef = useRef(onSelectStop);
  selectRef.current = onSelectStop;
  // The overlay element belongs to OpenLayers (it moves it into its own container); React renders into it by portal.
  const popEl = useRef<HTMLDivElement | null>(null);
  popEl.current ??= Object.assign(document.createElement("div"), { className: "pop-anchor" });
  const overlay = useRef<Overlay | null>(null);
  /** Pointer position over the map (CSS px within the sheet) for the cursor tag; null when the pointer is off it. */
  const [pointer, setPointer] = useState<{ x: number; y: number } | null>(null);
  /** The stop under the pointer: a click there edits it, so the cursor tag must not offer to add a stop. */
  const [overStop, setOverStop] = useState<string | null>(null);
  const target = useRef<HTMLDivElement>(null);
  const area = useRef<LoadedArea | null>(null);
  const planLayerRef = useRef<ReturnType<typeof createPlanLayer> | null>(null);
  planLayerRef.current ??= createPlanLayer();
  const planLayer = planLayerRef as { current: ReturnType<typeof createPlanLayer> };
  const planRef = useRef(plan);
  planRef.current = plan;
  const pickRef = useRef(onPick);
  pickRef.current = onPick;
  // Keyboard cursor (AC-32): arrow keys step it in ground metres through src/geo; Enter adds a stop there.
  const cursor = useRef<F1Point | null>(null);
  const cursorLayer = useRef<VectorLayer<VectorSource> | null>(null);
  cursorLayer.current ??= new VectorLayer({ source: new VectorSource(), className: "layer-cursor" });
  const mapRef = useRef<OlMap | null>(null);
  const [announce, setAnnounce] = useState("");
  const cursorRef = useRef(onCursor);
  cursorRef.current = onCursor;
  const contourLayer = useRef<ReturnType<typeof createContourLayer> | null>(null);
  contourLayer.current ??= createContourLayer();
  const contoursRef = useRef(contours);
  contoursRef.current = contours;
  const markerLayerRef = useRef<ReturnType<typeof createMarkerLayer> | null>(null);
  markerLayerRef.current ??= createMarkerLayer();
  const progressLayer = useRef<ReturnType<typeof createProgressLayer> | null>(null);
  progressLayer.current ??= createProgressLayer("layer-progress");
  const progressLabels = useRef<ReturnType<typeof createProgressLayer> | null>(null);
  progressLabels.current ??= createProgressLayer("layer-progress-label");
  const hoverRef = useRef(onHoverIndex);
  hoverRef.current = onHoverIndex;
  /** F7 x, y of each profile sample, for nearest-sample lookup on pointer move. */
  const profXY = useRef<Float64Array>(new Float64Array(0));
  const lastHover = useRef<number | null>(null);
  const snapRef = useRef(onSnapshotReady);
  snapRef.current = onSnapshotReady;
  const [readout, setReadout] = useState<Readout | null>(null);
  const [legend, setLegend] = useState<LoadedArea["display"]["layers"]>([]);
  const [sky, setSky] = useState<LoadedArea["display"]["sky"]>(undefined);
  const skyLayer = useRef<ImageLayer<Static> | null>(null);
  const [skyFailed, setSkyFailed] = useState(false);
  /** Why the per-stop sky grid is missing (stops then read unknown), or null. */
  const [skyGridError, setSkyGridError] = useState<string | null>(null);
  const skyRef = useRef(onSky);
  skyRef.current = onSky;
  const showSkyRef = useRef(showSky);
  showSkyRef.current = showSky;
  useEffect(() => { skyLayer.current?.setVisible(showSky); }, [showSky]);
  const [error, setError] = useState<string | null>(null);
  /** AC-31: display layers that failed to load are named; the sheet keeps working without them. */
  const [layerErrors, setLayerErrors] = useState<string[]>([]);
  const failed = useRef<Set<string>>(new Set());
  /** Plan 7.8: per dataset id, the note the layer list shows when the view leaves that dataset's coverage. */
  const [coverageNotes, setCoverageNotes] = useState<Record<string, string>>({});
  /** Why the coverage outlines are missing, or null when they are drawn. */
  const [coverageError, setCoverageError] = useState<string | null>(null);
  const [coverageDatasets, setCoverageDatasets] = useState<string[]>([]);
  const coverageLayer = useRef<ReturnType<typeof createCoverageLayer> | null>(null);
  coverageLayer.current ??= createCoverageLayer();
  const elevationLayer = useRef<ReturnType<typeof createElevationLayer> | null>(null);
  elevationLayer.current ??= createElevationLayer();
  /** Plan 7.8 / 9 contours: the layer-list text, or why they are missing. */
  const [contourEntry, setContourEntry] = useState<{ ok: boolean; text: string; source?: string } | null>(null);
  const datasetsRef = useRef(onDatasets);
  datasetsRef.current = onDatasets;

  /** MAP-02: applies the switches and the overlay strength to the built layers (and to the next snapshot). */
  const applyLayers = () => {
    const L = layersRef.current, d = switched.current, op = clampOverlay(L.overlay);
    d.relief?.setVisible(L.relief);
    d.terrain?.setVisible(L.terrain); d.terrain?.setOpacity(op);
    elevationLayer.current?.setVisible(L.elevation); elevationLayer.current?.setOpacity(op);
  };
  useEffect(applyLayers, [layers.relief, layers.terrain, layers.elevation, layers.overlay]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    let map: OlMap | null = null;
    setError(null);
    setReady(false);
    setLayerErrors([]); // a new area starts with no failed layers
    setCoverageNotes({});
    setCoverageError(null);
    setCoverageDatasets([]);
    setContourEntry(null);
    failed.current = new Set();
    let cancelled = false;
    let raf = 0; // pending pointermove frame, cancelled on unmount (R-15 finding 10)
    loadArea(dataUrl).then((a) => {
      if (cancelled || !target.current) return;
      area.current = withClasses(a, classesRef.current);
      setLegend(a.display.layers);
      setSky(a.display.sky);
      // UX-15: the datasets in view are the sources of the layers actually shown (recomputed if one fails to load).
      const report = () => datasetsRef.current?.([...new Set(a.display.layers.filter((l) => !failed.current.has(l.id)).map((l) => l.source))]);
      report();
      const extent = a.display.extentF7;
      const fail = (L: { id: string; name: string }) => {
        if (cancelled) return;
        failed.current.add(L.id);
        setLayerErrors((e) => (e.includes(L.name) ? e : [...e, L.name]));
        report();
      };
      // Plan 9.2 symbols in screen pixels from the pipeline's class masks (plan 7.8; the baked hatch aliased).
      const terrain = () => {
        const L = a.display.layers.find((l) => l.id === "terrain")!;
        if (L.kind !== "masks" || !L.masks || !L.maskExtentF7) throw new Error("terrain layer: masks missing from layers.json");
        const m = L.masks;
        return createTerrainLayer({ steep: dataUrl + m.steep.path, excluded: dataUrl + m.excluded.path, unknown: dataUrl + m.unknown.path },
          L.maskExtentF7, extent, "layer-terrain", () => fail(L));
      };
      const image = (id: string, className: string) => {
        const L = a.display.layers.find((l) => l.id === id)!;
        // interpolate: false keeps source pixels crisp past native size (plan 7.8, honest zoom).
        // crossOrigin as the 3D view and the terrain masks ask, so a 3D image that reuses this file comes from the cache.
        const source = new Static({ url: dataUrl + L.path!, imageExtent: extent, projection: F7_PROJECTION, interpolate: false, crossOrigin: "anonymous" });
        source.on("imageloaderror", () => fail(L));
        return new ImageLayer({ className, source });
      };
      const relief = image("hillshade", "layer-hillshade"), terrainLayer = terrain();
      switched.current = { relief, terrain: terrainLayer };
      // Plan 6.7 / 9.2: precomputed single-hue ramp; hidden until the user turns it on.
      skyLayer.current = null;
      setSkyFailed(false);
      if (a.display.sky) {
        const src = new Static({ url: dataUrl + a.display.sky.image, imageExtent: extent, projection: F7_PROJECTION, interpolate: false });
        src.on("imageloaderror", () => { setSkyFailed(true); skyRef.current?.("failed"); });
        skyLayer.current = new ImageLayer({ className: "layer-sky", source: src, visible: showSkyRef.current });
      }
      const sg = a.skyGrid.ok ? a.skyGrid.collection : null; // only the grid is captured, not the whole area
      setSkyGridError(a.skyGrid.ok ? null : a.skyGrid.reason);
      skyRef.current?.(a.display.sky ? "ok" : "none", (p) => skySampleAt(p, sg));
      const o = f1ToF7(a.grid.origin);
      const el = target.current;
      map = new OlMap({
        target: el,
        layers: [image("d2", "layer-d2"), relief, ...(skyLayer.current ? [skyLayer.current] : []), terrainLayer, elevationLayer.current!, coverageLayer.current!, contourLayer.current!, progressLayer.current!, planLayer.current, progressLabels.current!, markerLayerRef.current!, cursorLayer.current!],
        // The zoom keys are the sheet's own (MAP-06); wheel and double-click zoom jump under reduced motion.
        controls: [new ScaleLine({ units: "metric" })],
        interactions: defaultInteractions({ zoomDuration: reducedMotion() ? 0 : 250 }),
        view: new View({
          // MAP-01: the load view shows the whole sheet, so the habitat and the boxwork are both on screen at once.
          projection: F7_PROJECTION, center: [o.x, o.y], resolution: fitResolution(extent[2] - extent[0], extent[3] - extent[1], el.clientWidth, el.clientHeight),
          // Honest zoom: stop at twice the native 1 m display pixel.
          minResolution: a.display.pixel_m / 2, maxResolution: MAX_RESOLUTION_F7, extent, constrainOnlyCenter: true,
        }),
      });
      applyLayers();
      // Plan 7.8 coverage outlines, and the layer-list notes for the current view (recomputed after each move).
      const outlines: { dataset: string; label: string; polys: PolygonsF7 }[] = a.coverage.ok
        ? a.coverage.collection.features.map((f) => ({ dataset: f.properties.dataset, label: f.properties.label, polys: coveragePolygonsF7(f) }))
        : [];
      if (!a.coverage.ok) setCoverageError(a.coverage.reason);
      setCoverageDatasets(outlines.filter((o) => o.polys.length > 0).map((o) => o.dataset));
      target.current.dataset.coverageOutlines = String(drawCoverage(coverageLayer.current!, outlines));
      const updateCoverageNotes = (m: OlMap) => {
        if (!a.coverage.ok) return;
        const ext = m.getView().calculateExtent(m.getSize());
        const notes: Record<string, string> = {};
        for (const o of outlines) {
          const note = coverageNote(viewCoverage(o.polys, ext), o.label);
          if (note) notes[o.dataset] = note;
        }
        setCoverageNotes((prev) => (JSON.stringify(prev) === JSON.stringify(notes) ? prev : notes));
      };
      const contours = a.contours;
      target.current.dataset.elevationContours = String(contours.ok
        ? drawElevationContours(elevationLayer.current!, contourLinesF7(contours.collection), contours.collection.properties) : 0);
      setContourEntry(contours.ok ? { ok: true, text: contourLegend(contours.collection.properties), source: contours.collection.properties.source } : { ok: false, text: contours.reason });
      drawPlan(planLayer.current, planRef.current, a.grid);
      target.current.dataset.contourLines = String(drawContours(contourLayer.current!, contoursRef.current, a.grid));
      profXY.current = profileXY(planRef.current, a.grid);
      const m = map;
      mapRef.current = map;
      // The live view, published read-only for tests and tools that turn F1 positions into pixels (MAP-01).
      const publish = () => { const c = m.getView().getCenter(), r = m.getView().getResolution(); if (c && r && target.current) target.current.dataset.viewF7 = formatView(c[0]!, c[1]!, r); };
      publish();
      map.on("moveend", () => { if (!cancelled) { updateCoverageNotes(m); publish(); } });
      // The card names only the layers it draws: loaded, and switched on (MAP-02).
      snapRef.current?.(() => snapshotMap(m, planLayer.current, a.grid.origin.lat,
        () => [...a.display.layers.filter((l) => !failed.current.has(l.id) && layerShown(l.id, layersRef.current)).map((l) => l.name),
          ...(a.contours.ok && layersRef.current.elevation ? [contourLegend(a.contours.collection.properties)] : [])]));
      overlay.current = new Overlay({ element: popEl.current!, positioning: "bottom-center", offset: [0, -24], stopEvent: true });
      map.addOverlay(overlay.current);
      map.on("singleclick", (e) => {
        // A click on a stop marker selects that stop (UI-11); anywhere else it is a pick for a new stop.
        const hit = selectRef.current ? m.forEachFeatureAtPixel(e.pixel, (f) => (f.get("kind") === "stop" ? (f.get("stopId") as string) : undefined),
          { hitTolerance: 6, layerFilter: (l) => l === planLayer.current }) : undefined;
        if (hit) { selectRef.current?.(hit); return; }
        const p = f7ToF1({ frame: "F7", x: e.coordinate[0]!, y: e.coordinate[1]! }, 0);
        pickRef.current?.({ lat: p.lat, lon: p.lon });
      });
      m.getViewport()?.addEventListener("pointerleave", () => setPointer(null));
      // Readouts are throttled to one per animation frame; the grid frame is cached in src/geo/grid.
      let pending: number[] | null = null;
      map.on("pointermove", (e) => {
        pending = e.coordinate;
        if (raf) return;
        raf = requestAnimationFrame(() => {
          raf = 0;
          if (!pending || !area.current) return;
          setReadout(readoutAt(pending, area.current.grid));
          const px = m.getPixelFromCoordinate(pending);
          if (px) setPointer({ x: px[0]!, y: px[1]! });
          const stopHit = px && selectRef.current ? m.forEachFeatureAtPixel(px, (f) => (f.get("kind") === "stop" ? (f.get("stopId") as string) : undefined),
            { hitTolerance: 6, layerFilter: (l) => l === planLayer.current }) ?? null : null;
          setOverStop((s) => (s === stopHit ? s : stopHit));
          // Nearest profile sample within 10 screen pixels drives the shared scrub marker (UX-06).
          const xy = profXY.current, tol = 10 * (m.getView().getResolution() ?? 1);
          let best = -1, bestD = tol * tol;
          for (let i = 0; i < xy.length; i += 2) {
            const dx = xy[i]! - pending[0]!, dy = xy[i + 1]! - pending[1]!, d = dx * dx + dy * dy;
            if (d < bestD) { bestD = d; best = i / 2; }
          }
          const next = best >= 0 ? best : null;
          if (next !== lastHover.current) { lastHover.current = next; hoverRef.current?.(next); }
        });
      });
      setReady(true);
    }).catch((e: unknown) => { if (!cancelled) setError(e instanceof Error ? e.message : String(e)); });
    return () => { cancelled = true; if (raf) cancelAnimationFrame(raf); map?.setTarget(undefined); mapRef.current = null; };
  }, [dataUrl, attempt]);

  // The engine's terrain classes arrive after the sheet has loaded (or before: see the load above).
  useEffect(() => { if (area.current) area.current = withClasses(area.current, terrainClasses); }, [terrainClasses]);

  // The pinned stop card follows the selected stop (and drops when the stop is gone).
  useEffect(() => {
    const a = area.current, o = overlay.current, cell = selectedStop ? plan?.geometry.stopCells[selectedStop] : undefined;
    if (!a || !o) return;
    if (cell === undefined || !popover) { o.setPosition(undefined); return; }
    const p = f1ToF7(cellCentreF1({ r: Math.floor(cell / a.grid.cols), c: cell % a.grid.cols }, a.grid));
    o.setPosition([p.x, p.y]);
  }, [selectedStop, plan, !!popover]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!area.current) return;
    drawPlan(planLayer.current, plan, area.current.grid, selectedStop);
    profXY.current = profileXY(plan, area.current.grid);
    lastHover.current = null; // indices refer to the previous profile
  }, [plan, selectedStop, ready]);

  useEffect(() => {
    if (area.current && target.current) target.current.dataset.contourLines = String(drawContours(contourLayer.current!, contours, area.current.grid));
  }, [contours]);

  useEffect(() => {
    const prof = plan?.geometry.profile;
    if (area.current) drawMarker(markerLayerRef.current!, hoverIndex !== null && prof?.[hoverIndex] ? prof[hoverIndex].cell : null, area.current.grid);
  }, [hoverIndex, plan]);

  // HUD-01: redrawn on every tick; the sheet publishes what it drew (read-only) for the e2e checks.
  useEffect(() => {
    if (!area.current || !target.current) return;
    drawProgress(progressLayer.current!, progressLabels.current!, progress, area.current.grid);
    target.current.dataset.progress = progress ? `${progress.kind} ${progress.letter} ${progress.cells.length}` : "";
  }, [progress, ready]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const a = area.current, m = mapRef.current;
    // Only keys pressed on the sheet itself; the zoom buttons inside it keep their own keyboard behaviour.
    if (!a || !m || e.target !== e.currentTarget) return;
    const steps: Record<string, [number, number]> = { ArrowUp: [0, 1], ArrowDown: [0, -1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] };
    if (e.key in steps) {
      e.preventDefault(); e.stopPropagation();
      const s = e.shiftKey ? 100 : 10, [dx, dy] = steps[e.key]!;
      const c = m.getView().getCenter()!;
      const from = cursor.current ?? f7ToF1({ frame: "F7", x: c[0]!, y: c[1]! }, 0);
      const next = offsetF1(from, dx * s, dy * s); // the cursor starts at the view centre; every press steps
      cursor.current = next;
      const xy = f1ToF7(next);
      const src = cursorLayer.current!.getSource()!;
      src.clear();
      const f = new Feature({ geometry: new Point([xy.x, xy.y]) }); f.setStyle(cursorStyle); src.addFeature(f);
      const ext = m.getView().calculateExtent(m.getSize());
      if (xy.x < ext[0]! || xy.x > ext[2]! || xy.y < ext[1]! || xy.y > ext[3]!) m.getView().setCenter([xy.x, xy.y]);
      const r = readoutAt([xy.x, xy.y], a.grid);
      setReadout(r);
      // The same verdict the pointer's tag gives, in words: keyboard and screen-reader users hear it before Enter.
      const ground = terrainHint(r.terrainClass);
      setAnnounce(`Cursor at latitude ${r.lat}, longitude ${r.lon} east, elevation ${fmt(r.elevation)}. ${
        ground.kind === "ok" ? "Slope-screened ground. Enter adds a stop here." : `${ground.text.replace(" · ", ": ")}.`}`);
      cursorRef.current?.({ lat: next.lat, lon: next.lon });
    } else if (e.key === "Enter" && cursor.current) {
      e.preventDefault();
      pickRef.current?.({ lat: cursor.current.lat, lon: cursor.current.lon });
    }
  };

  /** MAP-06: zoom by one step about the centre, like the wheel; a key pressed mid-glide continues from where it is. */
  const zoomBy = (d: 1 | -1) => {
    const v = mapRef.current?.getView(), z = v?.getZoom();
    if (!v || z === undefined) return;
    if (v.getAnimating()) v.cancelAnimations();
    v.animate({ zoom: v.getConstrainedZoom(z + d), duration: reducedMotion() ? 0 : 220, easing: EASE });
  };
  /** MAP-06: frame the whole sheet, or the plan (habitat, route and stops; the habitat alone before any stop). */
  const frame = (what: "sheet" | "route") => {
    const m = mapRef.current, a = area.current;
    if (!m || !a) return;
    const v = m.getView();
    const planExt = planLayerRef.current?.getSource()?.getExtent();
    let ext: number[] = what === "route" && planExt ? [...planExt] : [...a.display.extentF7];
    if (!ext.every(Number.isFinite)) ext = [...a.display.extentF7];
    const cx = (ext[0]! + ext[2]!) / 2, cy = (ext[1]! + ext[3]!) / 2, half = 400; // a lone habitat is framed with 800 m of ground round it
    if (ext[2]! - ext[0]! < 2 * half && ext[3]! - ext[1]! < 2 * half) ext = [cx - half, cy - half, cx + half, cy + half];
    if (v.getAnimating()) v.cancelAnimations();
    // The route is framed clear of the chrome as drawn now (hint row, readout, keys: their size changes with the window
    // and the readout's line count); the whole sheet as at load.
    const mapBox = target.current?.getBoundingClientRect(), edge = (el: Element | null | undefined) => el?.getBoundingClientRect();
    const hintBox = edge(sheetRef.current?.querySelector(".map-hint")), keysBox = edge(keysRef.current), statusBox = edge(statusRef.current);
    const padding = what === "route" && mapBox
      ? [Math.max(40, (hintBox ? hintBox.bottom - mapBox.top : 0) + 20), Math.max(40, (keysBox ? mapBox.right - keysBox.left : 0) + 16),
        Math.max(40, (statusBox ? mapBox.bottom - statusBox.top : 0) + 20), 40]
      : [...FIT_PADDING];
    v.fit(ext, { padding, duration: reducedMotion() ? 0 : 420, easing: EASE });
  };
  const setLayer = (patch: Partial<MapLayers>) => onLayers?.({ ...layers, ...patch });
  /** The switch a layer row carries (none for the orthophoto base, a failed layer or a sheet without a console). */
  const switchFor = (id: string): keyof Omit<MapLayers, "overlay"> | null =>
    !onLayers ? null : id === "hillshade" ? "relief" : id === "terrain" ? "terrain" : id === "contours" ? "elevation" : null;
  const layerRow = (id: string, body: ReactNode) => {
    const k = switchFor(id);
    return k ? <label className="layer-row"><input type="checkbox" checked={layers[k]} onChange={(e) => setLayer({ [k]: e.target.checked })} />
      <span className="sw" data-sw={id} aria-hidden="true" /><span>{body}</span></label>
      : <span className="layer-row"><span className="sw" data-sw={id} aria-hidden="true" /><span>{body}</span></span>;
  };

  if (error) return (
    <div className="sheet">
      <div className="sheet-msg" role="alert" data-kind="error">
        <strong>Area data could not be loaded: {error}</strong>
        <span>The sheet, its readout and the route need these files. Check the connection, then try again.</span>
        <button type="button" className="key small" onClick={() => setAttempt((n) => n + 1)}><RotateCcw size={16} strokeWidth={1.75} aria-hidden="true" />Try again</button>
      </div>
    </div>
  );
  return (
    <>
      <div className="sheet" data-ready={ready} ref={sheetRef}>
        <div className="map" ref={target} data-testid="area-map" tabIndex={0} onKeyDownCapture={onKeyDown} role="application"
          aria-label="Traverse sheet. Arrow keys move a cursor 10 m, Shift plus arrow 100 m; Enter adds a stop at the cursor." />
        <div className="sr-only" aria-live="polite" data-testid="cursor-announce">{announce}</div>
        {!ready && <p className="sheet-msg" role="status" data-testid="sheet-loading"><LoaderCircle size={18} strokeWidth={1.75} aria-hidden="true" />Loading the terrain sheet…</p>}
        {createPortal(popover, popEl.current)}
        {cursorHint && pointer && readout && (() => {
          const stop = overStop ? plan?.plan.stops.find((s) => s.id === overStop) : undefined;
          const h = typeof cursorHint === "string" ? { kind: "move" as const, text: cursorHint }
            : stop ? { kind: "stop" as const, text: `Stop ${stop.letter} · click to edit it` } : terrainHint(readout.terrainClass);
          // Near the right or bottom edge the tag flips to the other side of the pointer, so it is never cut off.
          const w = target.current?.clientWidth ?? 0, hgt = target.current?.clientHeight ?? 0;
          // MAP-07: on a narrow sheet neither side has room for the whole tag, so it is also kept 8 px inside both edges.
          const x = pointer.x > w - 380 ? `max(8px, calc(${pointer.x - 18}px - 100%))` : `max(8px, min(${pointer.x + 18}px, calc(${w - 8}px - 100%)))`;
          const y = pointer.y > hgt - 60 ? `calc(${pointer.y - 18}px - 100%)` : `${pointer.y + 18}px`;
          return <div className="cursor-tag" data-kind={h.kind} data-testid="cursor-tag" aria-hidden="true" style={{ transform: `translate(${x}, ${y})` }}>
            <span className="lamp" aria-hidden="true" />{h.text}</div>;
        })()}
        {contours?.drill_s != null && (
          <div className="sim-banner" role="note" data-testid="simulation-banner">
            SIMULATION · SIMULATED DRILL · ASSUMED {Math.round(contours.drill_s / 60)} MIN WARNING · not a live alert, not a measurement
          </div>
        )}
        {layerErrors.length > 0 && (
          <div className="layer-errors" role="status" data-testid="layer-errors">
            {layerErrors.map((n) => `${n} could not be loaded`).join("; ")}. The sheet, the route and the readout work without it.
          </div>
        )}
        {hint && <p className="map-hint"><MousePointerClick size={16} strokeWidth={1.5} aria-hidden="true" />{hint}</p>}
        {/* MAP-06: the sheet's keys, one column at the lower right: zoom, then the two framings. */}
        <div className="map-keys" role="group" aria-label="Map view" ref={keysRef}>
          <button type="button" title="Zoom in" aria-label="Zoom in" onClick={() => zoomBy(1)} disabled={!ready}><Plus size={18} strokeWidth={2} aria-hidden="true" /></button>
          <button type="button" title="Zoom out" aria-label="Zoom out" onClick={() => zoomBy(-1)} disabled={!ready}><Minus size={18} strokeWidth={2} aria-hidden="true" /></button>
          <button type="button" title={plan?.plan.stops.length ? "Fit the route" : "Show the habitat"} aria-label={plan?.plan.stops.length ? "Fit the route" : "Show the habitat"}
            onClick={() => frame("route")} disabled={!ready || !plan}><Route size={18} strokeWidth={1.75} aria-hidden="true" /></button>
          <button type="button" title="Show the whole sheet" aria-label="Show the whole sheet" onClick={() => frame("sheet")} disabled={!ready}><Scan size={18} strokeWidth={1.75} aria-hidden="true" /></button>
        </div>
        <button ref={layersBtn} type="button" className="layers-btn" aria-expanded={layersOpen} aria-controls="layers-panel" onClick={() => setLayersOpen((o) => !o)}><Layers size={18} strokeWidth={1.5} aria-hidden="true" />Layers</button>
        <div className="legend" id="layers-panel" aria-label="Layers" data-open={layersOpen} inert={!layersOpen}
          onKeyDown={(e) => { if (e.key === "Escape") { e.stopPropagation(); setLayersOpen(false); layersBtn.current?.focus(); } }}>
          <div className="legend-head"><span className="legend-title">Layers</span>
            <button type="button" className="legend-x" aria-label="Close panel" onClick={() => { setLayersOpen(false); layersBtn.current?.focus(); }}><X size={16} strokeWidth={2} aria-hidden="true" /></button></div>
          <ul className="layer-list">{legend.map((l) => layerErrors.includes(l.name)
            ? <li key={l.id} className="failed">{l.name} - not loaded</li>
            : <li key={l.id} data-layer={l.id} data-off={!layerShown(l.id, layers) || undefined}>{layerRow(l.id, <>{l.name} - {l.valueClass.replace("_", " ")}, {l.source}, {fmt(l.resolution)}, built {l.builtOn}
              {coverageNotes[l.source] && <span className="coverage-note"> · {coverageNotes[l.source]}</span>}</>)}</li>)}
            {contourEntry && (contourEntry.ok
              ? <li data-layer="contours" data-off={!layers.elevation || undefined}>{layerRow("contours", <>{contourEntry.text}{contourEntry.source && coverageNotes[contourEntry.source] && <span className="coverage-note"> · {coverageNotes[contourEntry.source]}</span>}</>)}</li>
              : <li data-layer="contours" className="failed">Contours (D1) - not loaded: {contourEntry.text}</li>)}
            {showSky && sky && skyFailed && <li data-layer="sky" className="failed">Sky obstruction - not loaded</li>}
            {showSky && sky && !skyFailed && <li data-layer="sky">Sky obstruction, % of the upper hemisphere (geometry, not dose) - model derived, D1 near and
              D12 far, {fmt(sky.cell)} grid, observer {fmt(sky.hObs)} assumed; darker = more sky blocked. Checked at Butte M12: {fmt(sky.benchmark)}{" "}
              vs {fmt(sky.published)} published (AC-07){skyGridError && <span className="coverage-note"> · stop values unknown: {skyGridError}</span>}</li>}
            {legend.length > 0 && (coverageError
              ? <li className="failed" data-testid="coverage-status">Coverage outlines not available: {coverageError}</li>
              : <li className="muted" data-testid="coverage-status">{coverageDatasets.length
                ? `Dotted outline: edge of the ${coverageDatasets.join(" and ")} data on this sheet; blank beyond it`
                : "No valid data on this sheet for any dataset: no coverage outline to draw"}</li>)}</ul>
          {onLayers && <label className="strength"><span>Symbol and contour strength</span>
            <input type="range" min={MIN_OVERLAY} max={1} step={0.05} value={clampOverlay(layers.overlay)} onChange={(e) => setLayer({ overlay: Number(e.target.value) })}
              aria-valuetext={`${Math.round(clampOverlay(layers.overlay) * 100)} %`} />
            <output aria-hidden="true">{Math.round(clampOverlay(layers.overlay) * 100)} %</output></label>}
          {tools}
          {/* MAP-04: what each mark on the sheet means; the same marks the layers draw. */}
          <dl className="map-key" aria-label="Map key">
            <div><dt><span className="k-route" /></dt><dd>Route on the 2 m grid path; the chevrons show each leg's direction</dd></div>
            <div><dt><span className="k-habitat">H</span></dt><dd>Habitat (an Assumed scenario input)</dd></div>
            <div><dt><span className="k-stop">A</span></dt><dd>Stop; click one to edit it</dd></div>
            <div data-testid="key-progress"><dt><span className="k-progress" /></dt><dd>Crew progress on the HUD step, from its manual ticks (not GPS): a ring at the stop
              last reached, or a band over the leg being walked{progress && <strong>. Now: {progressText(progress)}</strong>}</dd></div>
            <div><dt><span className="k-tick" /></dt><dd>Margin marks: 10 % of the EVA left (amber), none left (red)</dd></div>
            <div><dt><span className="k-sym" style={{ backgroundImage: SWATCH.steep }} /></dt><dd>Steep but under the Assumed limit</dd></div>
            <div><dt><span className="k-sym" style={{ backgroundImage: SWATCH.excluded }} /></dt><dd>Excluded: steeper than the Assumed limit</dd></div>
            <div><dt><span className="k-sym" style={{ backgroundImage: SWATCH.unknown }} /></dt><dd>Unknown ground: no slope value</dd></div>
          </dl>
        </div>
      </div>
      <div className="status" data-testid="status-line" ref={statusRef}>
        {readout ? (
          <>
            <span><span className="label">lat </span>{readout.lat}</span>
            <span><span className="label">lon </span>{readout.lon} E</span>
            <span className="label">display precision</span>
            <span><span className="label">E </span>{fmt(readout.east)}</span>
            <span><span className="label">N </span>{fmt(readout.north)}</span>
            <span><span className="label">elev </span>{fmt(readout.elevation)}</span>
            <span className="label">{readout.elevationSource}; vertical reference unverified</span>
          </>
        ) : <span className="label">Point at the plate, or tap it, for coordinates.</span>}
      </div>
    </>
  );
}
