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
import { f1ToF7 } from "../geo";
import { F7_PROJECTION } from "./f7";
import { loadArea, type LoadedArea } from "./loadArea";
import { readoutAt, type Readout } from "./readout";

export function AreaSheet({ dataUrl }: { dataUrl: string }) {
  const target = useRef<HTMLDivElement>(null);
  const area = useRef<LoadedArea | null>(null);
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
        layers: [image("d2", "layer-d2"), image("hillshade", "layer-hillshade"), image("terrain", "layer-terrain")],
        controls: [new Zoom(), new ScaleLine({ units: "metric" })],
        view: new View({
          projection: F7_PROJECTION, center: [o.x, o.y], resolution: 4,
          // Honest zoom: stop at twice the native 1 m display pixel.
          minResolution: a.display.pixel_m / 2, maxResolution: 16, extent, constrainOnlyCenter: true,
        }),
      });
      map.on("pointermove", (e) => {
        if (area.current) setReadout(readoutAt(e.coordinate, area.current.grid));
      });
    }).catch((e: unknown) => setError(e instanceof Error ? e.message : String(e)));
    return () => { cancelled = true; map?.setTarget(undefined); };
  }, [dataUrl]);

  if (error) return <div className="error" role="alert">Area data could not be loaded: {error}</div>;
  return (
    <>
      <div className="sheet">
        <div className="map" ref={target} data-testid="area-map" />
        <div className="legend" aria-label="Layers">
          <ul>{legend.map((l) => <li key={l.id}>{l.name} - {l.valueClass.replace("_", " ")}, {l.source}, {l.resolution_m} m, {l.date}</li>)}</ul>
        </div>
      </div>
      <div className="status" data-testid="status-line">
        {readout ? (
          <>
            <span><span className="label">lat </span>{readout.lat}</span>
            <span><span className="label">lon </span>{readout.lon} E</span>
            <span className="label">(display precision)</span>
            <span><span className="label">E </span>{readout.east_m.toFixed(1)} m</span>
            <span><span className="label">N </span>{readout.north_m.toFixed(1)} m</span>
            <span><span className="label">elev </span>{readout.elevation_m === null ? "unknown" : `${readout.elevation_m.toFixed(1)} m`}</span>
            <span className="label">{readout.elevationSource}; vertical reference unverified</span>
          </>
        ) : <span className="label">Move the pointer over the sheet for coordinates.</span>}
      </div>
    </>
  );
}
