// SI-assisted: drafted with Claude Code (Claude Opus 5.5).
// Static web app, no backend (CLAUDE.md). Area data is served from public/area, written by the Python pipeline.
/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import { configDefaults } from "vitest/config";

export default defineConfig({
  oxc: { jsx: { runtime: "automatic" } },
  // B-01 / AC-12: the engine worker is a second entry of the same build (not Vite's separate worker build), so the code
  // both sides use (Zod, the contracts, constants, src/geo, Comlink) is emitted once as a shared chunk instead of
  // twice. The worker keeps a fixed name outside assets/ so src/engine/client.ts can address it; its imports are hashed.
  build: {
    target: "es2022", sourcemap: true, modulePreload: { polyfill: false },
    rolldownOptions: {
      input: { index: "index.html", "engine-worker": "src/engine/worker.ts" },
      output: {
        entryFileNames: (chunk) => (chunk.name === "engine-worker" ? "engine-worker.js" : "assets/[name]-[hash].js"),
        chunkFileNames: "assets/shared-[hash].js",
      },
    },
  },
  // Playwright specs in e2e/ run under `npx playwright test`, not Vitest.
  test: { exclude: [...configDefaults.exclude, "e2e/**"] },
});
