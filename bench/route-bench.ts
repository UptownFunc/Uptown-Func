// SI-assisted: drafted with Claude Code (Claude Opus 5.5); human Route Engine review pending.
// G2 latency check (plan 7.7): route < 500 ms per leg, habitat time field < 3 s.
// Usage: SHARPWALK_AREA=<dir with build_report.json and grids> node --experimental-strip-types bench/route-bench.ts
// Speed factors here are placeholders for TIMING ONLY; they are not science values.
import { readFileSync } from "node:fs";
import { CLASS, routeAStar, timeField, type RouteGrid } from "../src/engine/route.ts";

const dir = process.env.SHARPWALK_AREA ?? "work/area";
const rep = JSON.parse(readFileSync(`${dir}/build_report.json`, "utf8"));
const N: number = rep.rows;
const ge = rep.grids.find((x: { name: string }) => x.name === "elevation");
const q = new Uint16Array(readFileSync(`${dir}/${ge.path}`).buffer.slice(0));
const cls = new Uint8Array(readFileSync(`${dir}/terrain_class.uint8.bin`));
const z = new Float64Array(N * N);
for (let i = 0; i < z.length; i++) z[i] = q[i] === ge.noData ? Number.NaN : q[i]! * ge.scale + ge.offset;
const g: RouteGrid = { rows: N, cols: rep.cols, cell_m: rep.cellSize_m, elevation: z, classes: cls };
const m = { vLevel_mps: 0.83, kBins: [1, 1, 1, 1] as const, slopeLimit_deg: rep.slopeLimit_deg };

// Largest reachable region: seed from the first candidate cell of row 1 whose field is large.
let seed = -1, best = 0, field: Float64Array | null = null;
for (let c = 0; c < N && best < 0.3 * N * N; c += 50) {
  const i = N + c;
  if (cls[i] !== CLASS.CANDIDATE) continue;
  const f = timeField(g, { r: 1, c }, m);
  let n = 0; for (const v of f) if (Number.isFinite(v)) n++;
  if (n > best) { best = n; seed = i; field = f; }
}
const s = { r: Math.floor(seed / N), c: seed % N };
let far = -1, tmax = -1;
for (let i = 0; i < field!.length; i++) if (Number.isFinite(field![i]!) && field![i]! > tmax) { tmax = field![i]!; far = i; }
const goal = { r: Math.floor(far / N), c: far % N };
for (let k = 1; k <= 3; k++) {
  const t0 = performance.now(); const r = routeAStar(g, s, goal, m); const t1 = performance.now();
  console.log(`longest route run ${k}: ${(t1 - t0).toFixed(0)} ms (target < 500); matches field: ${Math.abs(r!.time_s - tmax) < 1e-6}`);
}
for (let k = 1; k <= 3; k++) {
  const t0 = performance.now(); timeField(g, s, m); const t1 = performance.now();
  console.log(`time field run ${k}: ${(t1 - t0).toFixed(0)} ms (target < 3000); region ${best} of ${N * N} cells`);
}
