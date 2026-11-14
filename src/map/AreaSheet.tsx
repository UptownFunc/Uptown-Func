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
import { f1ToF7, f7ToF1 } from "../geo";
import type { LatLon, PlanOutput } from "../engine/planner";
import { createPlanLayer, drawPlan } from "./planLayer";
import { snapshotMap, type MapSnapshot } from "./snapshot";
import { F7_PROJECTION } from "./f7";
import { loadArea, type LoadedArea } from "./loadArea";
import { gridFrame, readoutAt, type Readout } from "./readout";
import type { Quantity } from "../contracts";

/** Displays a Quantity: unknown stays "unknown" (CLAUDE.md); one decimal for metres. */
function fmt(q: Quantity): string {
  return q.value === null ? "unknown" : `${q.value.toFixed(1)} ${q.unit}`;
}

export interface AreaSheetProps {
  readonly dataUrl: string;
  /** The engine's latest plan (a copy); the sheet only draws it. */
  readonly plan?: PlanOutput | null;
  /** Called with the F1 position of a click; the console turns it into a Command for the engine. */
  readonly onPick?: (p: LatLon) => void;
  /** Receives a function that exports the current sheet with the plan for the briefing card (plan 7.8). */
  readonly onSnapshotReady?: (snapshot: () => Promise<MapSnapshot | null>) => void;
}

export function AreaSheet({ dataUrl, plan = null, onPick, onSnapshotReady }: AreaSheetProps) {
  const target = useRef<HTMLDivElement>(null);
  const area = useRef<LoadedArea | null>(null);
  const planLayerRef = useRef<ReturnType<typeof createPlanLayer> | null>(null);
  planLayerRef.current ??= createPlanLayer();
  const planLayer = planLayerRef as { current: ReturnType<typeof createPlanLayer> };
  const planRef = useRef(plan);
  planRef.current = plan;
  const pickRef = useRef(onPick);
  pickRef.current = onPick;
  const snapRef = useRef(onSnapshotReady);
  snapRef.current = onSnapshotReady;
  const [readout, setReadout] = useState<Readout | null>(null);
  const [legend, setLegend] = useState<LoadedArea["display"]["layers"]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let map: OlMap | null = null;
    let cancelled = false;
    loadArea(dataUrl).then((a) => {
      if (cancelled || !target.current) return;
      area.current = a;
      setLegend(a.display.layers);
      const extent = a.display.extentF7;
      const image = (id: string, className: string) => {
        const L = a.display.layers.find((l) => l.id === id)!;
        // interpolate: false keeps source pixels crisp past native size (plan 7.8, honest zoom).
        return new ImageLayer({ className, source: new Static({ url: dataUrl + L.path, imageExtent: extent, projection: F7_PROJECTION, interpolate: false }) });
      };
      const o = f1ToF7(a.grid.origin);
      map = new OlMap({
        target: target.current,
        layers: [image("d2", "layer-d2"), image("hillshade", "layer-hillshade"), image("terrain", "layer-terrain"), planLayer.current],
        controls: [new Zoom(), new ScaleLine({ units: "metric" })],
        view: new View({
          projection: F7_PROJECTION, center: [o.x, o.y], resolution: 4,
          // Honest zoom: stop at twice the native 1 m display pixel.
          minResolution: a.display.pixel_m / 2, maxResolution: 16, extent, constrainOnlyCenter: true,
        }),
      });
      drawPlan(planLayer.current, planRef.current, a.grid);
      const m = map;
      snapRef.current?.(() => snapshotMap(m, planLayer.current, a.grid.origin.lat));
      map.on("singleclick", (e) => {
        const p = f7ToF1({ frame: "F7", x: e.coordinate[0]!, y: e.coordinate[1]! }, 0);
        pickRef.current?.({ lat: p.lat, lon: p.lon });
      });
      // The frame is computed once; readouts are throttled to one per animation frame.
      const frame = gridFrame(a.grid);
      let pending: number[] | null = null, raf = 0;
      map.on("pointermove", (e) => {
        pending = e.coordinate;
        if (raf) return;
        raf = requestAnimationFrame(() => {
          raf = 0;
          if (pending && area.current) setReadout(readoutAt(pending, area.current.grid, frame));
        });
      });
    }).catch((e: unknown) => setError(e instanceof Error ? e.message : String(e)));
    return () => { cancelled = true; map?.setTarget(undefined); };
  }, [dataUrl]);

  useEffect(() => {
    if (area.current) drawPlan(planLayer.current, plan, area.current.grid);
  }, [plan]);

  if (error) return <div className="error" role="alert">Area data could not be loaded: {error}</div>;
  return (
    <>
      <div className="sheet">
        <div className="map" ref={target} data-testid="area-map" />
        <div className="legend" aria-label="Layers">
          <ul>{legend.map((l) => <li key={l.id}>{l.name} - {l.valueClass.replace("_", " ")}, {l.source}, {fmt(l.resolution)}, built {l.builtOn}</li>)}</ul>
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
