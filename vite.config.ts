// SI-assisted: drafted with Claude Code (Claude Opus 5.5).
// Static web app, no backend (CLAUDE.md). Area data is served from public/area, written by the Python pipeline.
/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import { configDefaults } from "vitest/config";

export default defineConfig({
  oxc: { jsx: { runtime: "automatic" } },
  // One entry chunk plus the worker, so no modulepreload links exist: the polyfill was dead code (B-01, UI-03).
  build: { target: "es2022", sourcemap: true, modulePreload: { polyfill: false } },
  // Playwright specs in e2e/ run under `npx playwright test`, not Vitest.
  test: { exclude: [...configDefaults.exclude, "e2e/**"] },
});
