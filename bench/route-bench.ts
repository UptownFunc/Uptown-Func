// SI-assisted: drafted with Claude Code (Claude Opus 5.5); human Route Engine review pending.
// G2 latency check (plan 7.7): route < 500 ms per leg, habitat time field < 3 s.
// Usage: SHARPWALK_AREA=<dir with build_report.json and grids> node --experimental-strip-types bench/route-bench.ts
// The level speed comes from src/constants. The k_v factors are NOT supplied yet (K-01), so two PLACEHOLDER sets are
// timed to show sensitivity: unity, and a decreasing set. Neither is a science value.
// Not type-checked by `tsc` (bench/ is outside tsconfig, and @types/node is not in the pinned stack).
import { readFileSync } from "node:fs";
import { CLASS, routeAStar, timeField, type RouteGrid, type SpeedModel } from "../src/engine/route.ts";
import { CONSTANTS } from "../src/constants/index.ts";

const dir = process.env.SHARPWALK_AREA ?? "work/area";
const rep = JSON.parse(readFileSync(`${dir}/build_report.json`, "utf8"));
const rows: number = rep.rows, cols: number = rep.cols;
const ge = rep.grids.find((x: { name: string }) => x.name === "elevation");
const gc = rep.grids.find((x: { name: string }) => x.name === "terrain_class");
const q = new Uint16Array(readFileSync(`${dir}/${ge.path}`).buffer.slice(0));
const cls = new Uint8Array(readFileSync(`${dir}/${gc.path}`));
const z = new Float64Array(rows * cols);
for (let i = 0; i < z.length; i++) z[i] = q[i] === ge.noData ? Number.NaN : q[i]! * ge.scale + ge.offset;
const g: RouteGrid = { rows, cols, cell_m: rep.cellSize_m, elevation: z, classes: cls };
const v = CONSTANTS.walkSpeedNominal.value;
const PLACEHOLDERS: Record<string, SpeedModel["kBins"]> = { unity: [1, 1, 1, 1], decreasing: [1, 0.8, 0.6, 0.4] };

for (const [label, kBins] of Object.entries(PLACEHOLDERS)) {
  const m: SpeedModel = { vLevel_mps: v, kBins, slopeLimit_deg: rep.slopeLimit_deg };
  // Find a seed in the largest region by sampling row 1; keep the biggest field.
  let seed: { r: number; c: number } | null = null, best = 0, field: Float64Array | null = null;
  for (let c = 0; c < cols && best < 0.3 * rows * cols; c += 50) {
    if (cls[cols + c] !== CLASS.CANDIDATE) continue;
    const f = timeField(g, { r: 1, c }, m);
    let n = 0; for (const t of f) if (Number.isFinite(t)) n++;
    if (n > best) { best = n; seed = { r: 1, c }; field = f; }
  }
  if (!seed || !field) throw new Error("no slope-screened seed found on row 1; choose another seed row");
  let far = -1, tmax = -1;
  for (let i = 0; i < field.length; i++) if (Number.isFinite(field[i]!) && field[i]! > tmax) { tmax = field[i]!; far = i; }
  const goal = { r: Math.floor(far / cols), c: far % cols };
  for (let k = 1; k <= 3; k++) {
    const t0 = performance.now(); const r = routeAStar(g, seed, goal, m); const t1 = performance.now();
    if (!r) throw new Error("route unexpectedly unreachable");
    console.log(`[${label} placeholder] longest route run ${k}: ${(t1 - t0).toFixed(0)} ms (target < 500); equals field: ${Math.abs(r.time_s - tmax) < 1e-6}`);
  }
  for (let k = 1; k <= 3; k++) {
    const t0 = performance.now(); timeField(g, seed, m); const t1 = performance.now();
    console.log(`[${label} placeholder] time field run ${k}: ${(t1 - t0).toFixed(0)} ms (target < 3000); region ${best} cells`);
  }
}
