// SI-assisted: drafted with Claude Code (Claude Fable 5.2) on design/sharpwalk-ui-ux (B-01); human review pending.
// AC-12 check: every JavaScript file the build ships (entry, shared chunks and the engine worker), gzipped at level 9,
// must total at most 250 kB (250,000 bytes). Run after `npm run build`: `node scripts/bundle-size.mjs`.
// It counts all .js files under dist/, so code moved into a lazy chunk or the worker still counts.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { gzipSync } from "node:zlib";

const BUDGET_BYTES = 250_000;
const dist = new URL("../dist/", import.meta.url).pathname;
const walk = (dir) => readdirSync(dir).flatMap((n) => { const p = join(dir, n); return statSync(p).isDirectory() ? walk(p) : [p]; });
const files = walk(dist).filter((p) => p.endsWith(".js"));
if (files.length === 0) { console.error("No JavaScript in dist/: run `npm run build` first."); process.exit(2); }
let total = 0;
for (const f of files) {
  const raw = readFileSync(f), gz = gzipSync(raw, { level: 9 }).length;
  total += gz;
  console.log(`${String(gz).padStart(8)} B gzip  ${String(raw.length).padStart(8)} B raw  ${relative(dist, f)}`);
}
const ok = total <= BUDGET_BYTES;
console.log(`${String(total).padStart(8)} B gzip total of ${BUDGET_BYTES} B (AC-12): ${ok ? "within budget" : `OVER by ${total - BUDGET_BYTES} B`}`);
process.exit(ok ? 0 : 1);
