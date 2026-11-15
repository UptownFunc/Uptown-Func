// SI-assisted: drafted with Claude Code (Claude Fable 5.2) on design/sharpwalk-ui-ux (B-01); split for the 3D view
// (B-02) with Claude Opus 5.5; human review pending.
// AC-12 check: every JavaScript file of the application (entry, shared chunks, lazy chunks and the engine worker),
// gzipped at level 9, must total at most 250 kB (250,000 bytes). Lazy app code still counts.
// B-02 (team decisions, Sun 15 Nov 2026): what loads only when the user opens the 3D view is checked separately:
// the CesiumJS vendor build under dist/cesium-<version>/ (its own ceiling; byte-identical to the published files in
// node_modules/cesium/Build/Cesium) and the 3D view's own lazy chunk assets/view3d-*.js (its own ceiling; no other
// file may import it statically, so it cannot slip into the first load). AC-12 counts everything else, lazy app code
// included. Run after `npm run build`.
import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join, relative } from "node:path";
import { gzipSync } from "node:zlib";

const BUDGET_BYTES = 250_000;
/** B-02: CesiumJS 1.147.0 as published, the parts copied (vite.config.ts): 2,112,862 B gzip -9 (Cesium.js 1,774,242 B + 63 worker files). */
const VENDOR_CEILING_BYTES = 2_120_000;
/** B-02 amended: the 3D view's own code (src/map3d), loaded with Cesium only. */
const VIEW3D_CEILING_BYTES = 10_000;
const dist = new URL("../dist/", import.meta.url).pathname;
const build = new URL("../node_modules/cesium/Build/Cesium/", import.meta.url).pathname;
const walk = (dir) => readdirSync(dir).flatMap((n) => { const p = join(dir, n); return statSync(p).isDirectory() ? walk(p) : [p]; });
const files = walk(dist).filter((p) => p.endsWith(".js"));
if (files.length === 0) { console.error("No JavaScript in dist/: run `npm run build` first."); process.exit(2); }
const isVendor = (f) => /^cesium-\d+\.\d+\.\d+\//.test(relative(dist, f));
const isView3d = (f) => /^assets\/view3d-[\w-]+\.js$/.test(relative(dist, f));
let app = 0, vendor = 0, vendorFiles = 0, view3d = 0, modified = [], staticView3d = [];
for (const f of files) {
  const raw = readFileSync(f), gz = gzipSync(raw, { level: 9 }).length, rel = relative(dist, f);
  if (isVendor(f)) {
    vendor += gz; vendorFiles++;
    const src = join(build, rel.replace(/^cesium-[^/]+\//, ""));
    if (!existsSync(src) || !readFileSync(src).equals(raw)) modified.push(rel);
    continue;
  }
  if (isView3d(f)) { view3d += gz; console.log(`${String(gz).padStart(8)} B gzip  ${String(raw.length).padStart(8)} B raw  ${rel}  (3D only)`); continue; }
  // A static import of the 3D chunk would load it with the page: only import("./view3d-...") is allowed.
  if (/(?:from|import)\s*["'][^"']*view3d-[\w-]+\.js["']/.test(raw.toString("utf8"))) staticView3d.push(rel);
  app += gz;
  console.log(`${String(gz).padStart(8)} B gzip  ${String(raw.length).padStart(8)} B raw  ${rel}`);
}
const appOk = app <= BUDGET_BYTES && staticView3d.length === 0, vendorOk = vendor <= VENDOR_CEILING_BYTES && modified.length === 0 && view3d <= VIEW3D_CEILING_BYTES;
console.log(`${String(app).padStart(8)} B gzip total of ${BUDGET_BYTES} B (AC-12, application without 3D): ${app <= BUDGET_BYTES ? "within budget" : `OVER by ${app - BUDGET_BYTES} B`}${
  staticView3d.length ? `; STATIC import of the 3D chunk in ${staticView3d.join(", ")}` : ""}`);
if (view3d) console.log(`${String(view3d).padStart(8)} B gzip 3D view app code, loaded only in 3D (B-02 ceiling ${VIEW3D_CEILING_BYTES} B): ${view3d <= VIEW3D_CEILING_BYTES ? "within ceiling" : `OVER by ${view3d - VIEW3D_CEILING_BYTES} B`}`);
if (vendorFiles) console.log(`${String(vendor).padStart(8)} B gzip in ${vendorFiles} CesiumJS vendor files, loaded only in 3D (B-02 ceiling ${VENDOR_CEILING_BYTES} B): ${
  vendor > VENDOR_CEILING_BYTES ? `OVER by ${vendor - VENDOR_CEILING_BYTES} B` : "within ceiling"}${modified.length ? `; MODIFIED or unknown: ${modified.join(", ")}` : "; unmodified"}`);
process.exit(appOk && vendorOk ? 0 : 1);
