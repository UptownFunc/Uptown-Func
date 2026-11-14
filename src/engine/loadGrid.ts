// SI-assisted: drafted with Claude Code (Claude Opus 5.5); human Route Engine review pending.
// Loads the pipeline's elevation and terrain-class grids into typed arrays for the engine (never into React state).
// The grids are checked against the sizes in build_report.json; a mismatch is an error, not a silent truncation.
import { f1 } from "../geo";
import type { PlannerGrid } from "./planner";

interface GridMeta { name: string; path: string; dtype: string; noData: number; scale: number; offset: number }

export async function loadPlannerGrid(base: string, fetchFn: typeof fetch = fetch): Promise<PlannerGrid> {
  const get = async (p: string) => {
    const r = await fetchFn(base + p);
    if (!r.ok) throw new Error(`could not load ${base + p} (${r.status})`);
    return r;
  };
  const report = await (await get("build_report.json")).json();
  const meta = (name: string, dtype: string) => {
    const m = (report.grids as GridMeta[]).find((g) => g.name === name);
    if (!m || m.dtype !== dtype) throw new Error(`${name} grid missing or not ${dtype}`);
    return m;
  };
  const em = meta("elevation", "uint16"), cm = meta("terrain_class", "uint8");
  const n = report.rows * report.cols;
  const q = new Uint16Array(await (await get(em.path)).arrayBuffer());
  const classes = new Uint8Array(await (await get(cm.path)).arrayBuffer());
  if (q.length !== n || classes.length !== n) throw new Error(`grid files do not hold ${report.rows} x ${report.cols} values`);
  const elevation = new Float64Array(n);
  for (let i = 0; i < n; i++) elevation[i] = q[i] === em.noData ? Number.NaN : q[i]! * em.scale + em.offset;
  const o = report.origin.f1;
  return { origin: f1(o.lat, o.lon, o.h), rows: report.rows, cols: report.cols, cell_m: report.cellSize_m, elevation, classes };
}
