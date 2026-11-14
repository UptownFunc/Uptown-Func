// SI-assisted: drafted with Claude Code (Claude Opus 5.5); human Design review pending.
// Plan 7.8 AREA level of the 2D sheet: D2 base, D1 hillshade multiplied, terrain classes, scale bar, cursor readout.
// F7 is display only; the readout's east/north and elevation come from the F6 grid through src/geo.
import { useEffect, useRef, useState } from "react";
import OlMap from "ol/Map";
import View from "ol/View";
import ImageLayer from "ol/layer/Image";
import Static from "ol/source/ImageStatic";
import ScaleLine from "ol/control/ScaleLine";
import Zoom from "ol/control/Zoom";
import { f1ToF7, f7ToF1, offsetF1, type F1Point } from "../geo";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { Stroke, Style } from "ol/style";
import RegularShape from "ol/style/RegularShape";
import { cellCentreF1, type GridDef } from "../geo/grid";
import type { LatLon, PlanOutput } from "../engine/planner";
import { createContourLayer, createMarkerLayer, createPlanLayer, drawContours, drawMarker, drawPlan, type ContourDisplay } from "./planLayer";
import { snapshotMap, type MapSnapshot } from "./snapshot";
import { F7_PROJECTION } from "./f7";
import { INITIAL_RESOLUTION_F7 } from "./view";
import { loadArea, type LoadedArea } from "./loadArea";
import { readoutAt, type Readout } from "./readout";
import type { Quantity } from "../contracts";

/** Displays a Quantity: unknown stays "unknown" (CLAUDE.md); one decimal for metres. */
function fmt(q: Quantity): string {
  return q.value === null ? "unknown" : `${q.value.toFixed(1)} ${q.unit}`;
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
  readonly onPick?: (p: LatLon) => void;
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
}

const cursorStyle = new Style({ image: new RegularShape({ points: 4, radius: 11, radius2: 0, angle: 0, stroke: new Stroke({ color: "#f3eee4", width: 2 }) }) });

export function AreaSheet({ dataUrl, plan = null, onPick, onSnapshotReady, hoverIndex = null, onHoverIndex, onDatasets, onCursor, contours = null }: AreaSheetProps) {
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
  const hoverRef = useRef(onHoverIndex);
  hoverRef.current = onHoverIndex;
  /** F7 x, y of each profile sample, for nearest-sample lookup on pointer move. */
  const profXY = useRef<Float64Array>(new Float64Array(0));
  const lastHover = useRef<number | null>(null);
  const snapRef = useRef(onSnapshotReady);
  snapRef.current = onSnapshotReady;
  const [readout, setReadout] = useState<Readout | null>(null);
  const [legend, setLegend] = useState<LoadedArea["display"]["layers"]>([]);
  const [error, setError] = useState<string | null>(null);
  /** AC-31: display layers that failed to load are named; the sheet keeps working without them. */
  const [layerErrors, setLayerErrors] = useState<string[]>([]);
  const failed = useRef<Set<string>>(new Set());
  const datasetsRef = useRef(onDatasets);
  datasetsRef.current = onDatasets;

  useEffect(() => {
    let map: OlMap | null = null;
    setLayerErrors([]); // a new area starts with no failed layers
    failed.current = new Set();
    let cancelled = false;
    loadArea(dataUrl).then((a) => {
      if (cancelled || !target.current) return;
      area.current = a;
      setLegend(a.display.layers);
      // UX-15: the datasets in view are the sources of the layers actually shown (recomputed if one fails to load).
      const report = () => datasetsRef.current?.([...new Set(a.display.layers.filter((l) => !failed.current.has(l.id)).map((l) => l.source))]);
      report();
      const extent = a.display.extentF7;
      const image = (id: string, className: string) => {
        const L = a.display.layers.find((l) => l.id === id)!;
        // interpolate: false keeps source pixels crisp past native size (plan 7.8, honest zoom).
        const source = new Static({ url: dataUrl + L.path, imageExtent: extent, projection: F7_PROJECTION, interpolate: false });
        source.on("imageloaderror", () => {
          if (cancelled) return;
          failed.current.add(L.id);
          setLayerErrors((e) => (e.includes(L.name) ? e : [...e, L.name]));
          report();
        });
        return new ImageLayer({ className, source });
      };
      const o = f1ToF7(a.grid.origin);
      map = new OlMap({
        target: target.current,
        layers: [image("d2", "layer-d2"), image("hillshade", "layer-hillshade"), image("terrain", "layer-terrain"), contourLayer.current!, planLayer.current, markerLayerRef.current!, cursorLayer.current!],
        controls: [new Zoom(), new ScaleLine({ units: "metric" })],
        view: new View({
          projection: F7_PROJECTION, center: [o.x, o.y], resolution: INITIAL_RESOLUTION_F7,
          // Honest zoom: stop at twice the native 1 m display pixel.
          minResolution: a.display.pixel_m / 2, maxResolution: 16, extent, constrainOnlyCenter: true,
        }),
      });
      drawPlan(planLayer.current, planRef.current, a.grid);
      target.current.dataset.contourLines = String(drawContours(contourLayer.current!, contoursRef.current, a.grid));
      profXY.current = profileXY(planRef.current, a.grid);
      const m = map;
      mapRef.current = map;
      snapRef.current?.(() => snapshotMap(m, planLayer.current, a.grid.origin.lat,
        () => a.display.layers.filter((l) => !failed.current.has(l.id)).map((l) => l.name)));
      map.on("singleclick", (e) => {
        const p = f7ToF1({ frame: "F7", x: e.coordinate[0]!, y: e.coordinate[1]! }, 0);
        pickRef.current?.({ lat: p.lat, lon: p.lon });
      });
      // Readouts are throttled to one per animation frame; the grid frame is cached in src/geo/grid.
      let pending: number[] | null = null, raf = 0;
      map.on("pointermove", (e) => {
        pending = e.coordinate;
        if (raf) return;
        raf = requestAnimationFrame(() => {
          raf = 0;
          if (!pending || !area.current) return;
          setReadout(readoutAt(pending, area.current.grid));
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
    }).catch((e: unknown) => setError(e instanceof Error ? e.message : String(e)));
    return () => { cancelled = true; map?.setTarget(undefined); };
  }, [dataUrl]);

  useEffect(() => {
    if (!area.current) return;
    drawPlan(planLayer.current, plan, area.current.grid);
    profXY.current = profileXY(plan, area.current.grid);
    lastHover.current = null; // indices refer to the previous profile
  }, [plan]);

  useEffect(() => {
    if (area.current && target.current) target.current.dataset.contourLines = String(drawContours(contourLayer.current!, contours, area.current.grid));
  }, [contours]);

  useEffect(() => {
    const prof = plan?.geometry.profile;
    if (area.current) drawMarker(markerLayerRef.current!, hoverIndex !== null && prof?.[hoverIndex] ? prof[hoverIndex].cell : null, area.current.grid);
  }, [hoverIndex, plan]);

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
      setAnnounce(`Cursor at latitude ${r.lat}, longitude ${r.lon} east, elevation ${fmt(r.elevation)}. Enter adds a stop here.`);
      cursorRef.current?.({ lat: next.lat, lon: next.lon });
    } else if (e.key === "Enter" && cursor.current) {
      e.preventDefault();
      pickRef.current?.({ lat: cursor.current.lat, lon: cursor.current.lon });
    }
  };

  if (error) return <div className="error" role="alert">Area data could not be loaded: {error}</div>;
  return (
    <>
      <div className="sheet">
        <div className="map" ref={target} data-testid="area-map" tabIndex={0} onKeyDownCapture={onKeyDown} role="application"
          aria-label="Traverse sheet. Arrow keys move a cursor 10 m, Shift plus arrow 100 m; Enter adds a stop at the cursor." />
        <div className="sr-only" aria-live="polite" data-testid="cursor-announce">{announce}</div>
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
        <div className="legend" aria-label="Layers">
          <ul>{legend.map((l) => layerErrors.includes(l.name)
            ? <li key={l.id} className="failed">{l.name} - not loaded</li>
            : <li key={l.id}>{l.name} - {l.valueClass.replace("_", " ")}, {l.source}, {fmt(l.resolution)}, built {l.builtOn}</li>)}</ul>
        </div>
      </div>
      <div className="status" data-testid="status-line">
        {readout ? (
          <>
            <span><span className="label">lat </span>{readout.lat}</span>
            <span><span className="label">lon </span>{readout.lon} E</span>
            <span className="label">(display precision)</span>
            <span><span className="label">E </span>{fmt(readout.east)}</span>
            <span><span className="label">N </span>{fmt(readout.north)}</span>
            <span><span className="label">elev </span>{fmt(readout.elevation)}</span>
            <span className="label">{readout.elevationSource}; vertical reference unverified</span>
          </>
        ) : <span className="label">Move the pointer over the sheet for coordinates.</span>}
      </div>
    </>
  );
}
