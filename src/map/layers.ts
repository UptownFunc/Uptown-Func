// SI-assisted: drafted with Claude Code (Claude Opus 5.5) (MAP-02); human Design review pending.
// Which display layers are shown, as plain data the console owns. The 2D sheet applies it today; a later 3D view can
// read the same object, so a layer switched off in one view is off in the other. Display only: hiding a layer never
// changes the plan, the route search or any margin (the engine reads its own grids, not these layers).

export interface MapLayers {
  /** D1 hillshade, multiplied over the D2 orthophoto. */
  readonly relief: boolean;
  /** Terrain-class symbols: steep, excluded and unknown ground (plan 9.2). */
  readonly terrain: boolean;
  /** D1 elevation contours (10 m, every 50 m labelled). */
  readonly elevation: boolean;
  /** Strength of the terrain symbols and contour lines over the imagery, 0.25 to 1. */
  readonly overlay: number;
}

export const DEFAULT_LAYERS: MapLayers = { relief: true, terrain: true, elevation: true, overlay: 1 };

/** The weakest overlay strength offered: the symbols never vanish while their switch is on. */
export const MIN_OVERLAY = 0.25;

export const clampOverlay = (v: number): number => (Number.isFinite(v) ? Math.min(1, Math.max(MIN_OVERLAY, v)) : 1);

/** The layer ids (layers.json and the sheet's own) each switch controls; the briefing card names only shown layers. */
export const SWITCHED: Readonly<Record<"relief" | "terrain" | "elevation", string>> = { relief: "hillshade", terrain: "terrain", elevation: "contours" };

/** Whether the display layer with this id is shown under these settings (layers without a switch are always shown). */
export function layerShown(id: string, layers: MapLayers): boolean {
  const key = (Object.keys(SWITCHED) as (keyof typeof SWITCHED)[]).find((k) => SWITCHED[k] === id);
  return key ? layers[key] : true;
}
