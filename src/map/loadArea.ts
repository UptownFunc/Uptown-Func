// SI-assisted: drafted with Claude Code (Claude Opus 5.5); human Design + Data and Science review pending.
// Loads the pipeline's area outputs. Grids go into typed arrays, never into React state (CLAUDE.md).
import { f1 } from "../geo";
import type { AreaGrid } from "./readout";

import type { Quantity } from "../contracts";
import { CONSTANTS } from "../constants";
import { CoverageCollection } from "./coverage";
import { ContourCollection } from "./elevationContours";
import type { z } from "zod";
import { decodeSkyGrid, type SkyGrid, type SkyGridMeta } from "./skySample";

/** The terrain entry ships one mask per plan 9.2 symbol instead of one image (`kind: "masks"`); others have `path`. */
interface RawLayer {
  id: string; path?: string; name: string; unit: string; valueClass: string; source: string; resolution_m: number; builtOn: string;
  kind?: "masks"; masks?: Record<"steep" | "excluded" | "unknown", { path: string }>; maskExtentF7?: [number, number, number, number];
}
/** A display layer; its resolution is a Quantity because it is shown in the legend. builtOn is the pipeline build date. */
export interface DisplayLayer extends RawLayer { resolution: Quantity }
/** Plan 6.7 sky-obstruction layer (tier 2): the display image and the numbers its legend shows, each a Quantity. */
export interface SkyDisplay { image: string; cell: Quantity; hObs: Quantity; benchmark: Quantity; published: Quantity }
export interface AreaDisplay { extentF7: [number, number, number, number]; pixel_m: number; layers: DisplayLayer[]; sky?: SkyDisplay }
/** Plan 7.8 coverage outlines; a missing or invalid file is a labelled state, never a reason to drop the sheet. */
export type Optional<T> = { ok: true; collection: T } | { ok: false; reason: string };
export type AreaCoverage = Optional<CoverageCollection>;
/** Plan 7.8 / 9 elevation contours; missing or invalid is a labelled state, like the coverage outlines. */
export type AreaContours = Optional<ContourCollection>;
/** skyGrid: plan 6.7 per-stop "20 m sample"; when missing or invalid the reason is shown and stops read unknown. */
export interface LoadedArea { grid: AreaGrid; display: AreaDisplay; coverage: AreaCoverage; contours: AreaContours; skyGrid: Optional<SkyGrid> }

interface GridMeta { name: string; path: string; dtype: string; noData: number; scale: number; offset: number }

export async function loadArea(base: string): Promise<LoadedArea> {
  const get = async (p: string) => {
    const r = await fetch(base + p);
    if (!r.ok) throw new Error(`could not load ${base + p} (${r.status})`);
    return r;
  };
  const report = await (await get("build_report.json")).json();
  const raw = (await (await get("layers.json")).json()) as Omit<AreaDisplay, "layers"> & { layers: RawLayer[]; coverage?: { path: string }; contours?: { path: string };
    sky?: { image: { path: string }; grid: SkyGridMeta & { path: string }; h_obs_m: number; benchmark: { f_obs: number; published: number } } };
  const md = (value: number, unit: string, methodId: string, sourceIds: string[], assumptionIds: string[] = []): Quantity =>
    ({ value, unit, valueClass: "model_derived", methodId, assumptionIds, sourceIds });
  const s = raw.sky;
  const display: AreaDisplay = { ...raw, layers: raw.layers.map((l) => ({ ...l, resolution: {
    value: l.resolution_m, unit: "m", valueClass: "model_derived", methodId: "pipeline:display-grid", assumptionIds: [], sourceIds: [l.source] } })),
    ...(s ? { sky: { image: s.image.path, cell: md(s.grid.cell_m, "m", "pipeline:sky-grid-6.7", ["D1", "D12"]),
      hObs: { value: s.h_obs_m, unit: "m", valueClass: "assumed", methodId: "V-12", assumptionIds: ["V-12"], sourceIds: ["team choice"] }, // session choice, register V-12
      benchmark: md(s.benchmark.f_obs * 100, "%", "AC-07", ["D1", "D12", "D5"]),
      published: { value: CONSTANTS.skyObstructionM12.value * 100, unit: "%", valueClass: "published_observation", methodId: "constant", assumptionIds: [], sourceIds: ["skyObstructionM12"] } } } : {}) };
  const eg = (report.grids as GridMeta[]).find((g) => g.name === "elevation");
  if (!eg || eg.dtype !== "uint16") throw new Error("elevation grid missing or not uint16");
  const q = new Uint16Array(await (await get(eg.path)).arrayBuffer());
  const elevation = new Float64Array(q.length);
  for (let i = 0; i < q.length; i++) elevation[i] = q[i] === eg.noData ? Number.NaN : q[i]! * eg.scale + eg.offset;
  const o = report.origin.f1;
  const origin = f1(o.lat, o.lon, o.h);
  const loadSky = async (): Promise<Optional<SkyGrid>> => {
    if (!s) return { ok: false, reason: "no sky grid listed in layers.json" };
    try {
      return { ok: true, collection: decodeSkyGrid(await (await get(s.grid.path)).arrayBuffer(), s.grid, origin) };
    } catch (e) {
      return { ok: false, reason: e instanceof Error ? e.message : `${s.grid.path} could not be loaded` };
    }
  };
  // UI-11: the terrain classes drive the cursor hint only; a missing file leaves the hint unknown, never the map broken.
  const cg = (report.grids as GridMeta[]).find((g) => g.name === "terrain_class");
  const loadClasses = async (): Promise<Uint8Array | undefined> => {
    try { return cg && cg.dtype === "uint8" ? new Uint8Array(await (await get(cg.path)).arrayBuffer()) : undefined; } catch { return undefined; }
  };
  const [coverage, contours, skyGrid, classes] = await Promise.all([
    loadOptional(base, raw.coverage?.path, CoverageCollection, "coverage"),
    loadOptional(base, raw.contours?.path, ContourCollection, "contours"),
    loadSky(),
    loadClasses(),
  ]);
  return {
    grid: { origin, rows: report.rows, cols: report.cols, cell_m: report.cellSize_m, elevation,
      elevationSource: `D1, ${report.cellSize_m} m F6 grid`, ...(classes && classes.length === report.rows * report.cols ? { classes } : {}) },
    display,
    coverage,
    contours,
    skyGrid,
  };
}

async function loadOptional<S extends z.ZodTypeAny>(base: string, path: string | undefined, schema: S, what: string): Promise<Optional<z.infer<S>>> {
  if (!path) return { ok: false, reason: `no ${what} file listed in layers.json` };
  try {
    const r = await fetch(base + path);
    if (!r.ok) return { ok: false, reason: `${path} could not be loaded (${r.status})` };
    const p = schema.safeParse(await r.json());
    return p.success ? { ok: true, collection: p.data } : { ok: false, reason: `${path} is not a valid ${what} file` };
  } catch {
    return { ok: false, reason: `${path} could not be loaded` };
  }
}
