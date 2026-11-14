// SI-assisted: drafted with Claude Code (Claude Opus 5.5); human Design + Data and Science review pending.
// Loads the pipeline's area outputs. Grids go into typed arrays, never into React state (CLAUDE.md).
import { f1 } from "../geo";
import type { AreaGrid } from "./readout";

import type { Quantity } from "../contracts";
import { CoverageCollection } from "./coverage";

interface RawLayer { id: string; path: string; name: string; unit: string; valueClass: string; source: string; resolution_m: number; builtOn: string }
/** A display layer; its resolution is a Quantity because it is shown in the legend. builtOn is the pipeline build date. */
export interface DisplayLayer extends RawLayer { resolution: Quantity }
export interface AreaDisplay { extentF7: [number, number, number, number]; pixel_m: number; layers: DisplayLayer[] }
/** Plan 7.8 coverage outlines; a missing or invalid file is a labelled state, never a reason to drop the sheet. */
export type AreaCoverage = { ok: true; collection: CoverageCollection } | { ok: false; reason: string };
export interface LoadedArea { grid: AreaGrid; display: AreaDisplay; coverage: AreaCoverage }

interface GridMeta { name: string; path: string; dtype: string; noData: number; scale: number; offset: number }

export async function loadArea(base: string): Promise<LoadedArea> {
  const get = async (p: string) => {
    const r = await fetch(base + p);
    if (!r.ok) throw new Error(`could not load ${base + p} (${r.status})`);
    return r;
  };
  const report = await (await get("build_report.json")).json();
  const raw = (await (await get("layers.json")).json()) as Omit<AreaDisplay, "layers"> & { layers: RawLayer[]; coverage?: { path: string } };
  const display: AreaDisplay = { ...raw, layers: raw.layers.map((l) => ({ ...l, resolution: {
    value: l.resolution_m, unit: "m", valueClass: "model_derived", methodId: "pipeline:display-grid", assumptionIds: [], sourceIds: [l.source] } })) };
  const eg = (report.grids as GridMeta[]).find((g) => g.name === "elevation");
  if (!eg || eg.dtype !== "uint16") throw new Error("elevation grid missing or not uint16");
  const q = new Uint16Array(await (await get(eg.path)).arrayBuffer());
  const elevation = new Float64Array(q.length);
  for (let i = 0; i < q.length; i++) elevation[i] = q[i] === eg.noData ? Number.NaN : q[i]! * eg.scale + eg.offset;
  const o = report.origin.f1;
  const coverage = await loadCoverage(base, raw.coverage?.path);
  return {
    grid: { origin: f1(o.lat, o.lon, o.h), rows: report.rows, cols: report.cols, cell_m: report.cellSize_m, elevation,
      elevationSource: `D1, ${report.cellSize_m} m F6 grid` },
    display,
    coverage,
  };
}

async function loadCoverage(base: string, path: string | undefined): Promise<AreaCoverage> {
  if (!path) return { ok: false, reason: "no coverage file listed in layers.json" };
  try {
    const r = await fetch(base + path);
    if (!r.ok) return { ok: false, reason: `${path} could not be loaded (${r.status})` };
    const p = CoverageCollection.safeParse(await r.json());
    return p.success ? { ok: true, collection: p.data } : { ok: false, reason: `${path} is not a valid coverage file` };
  } catch {
    return { ok: false, reason: `${path} could not be loaded` };
  }
}
