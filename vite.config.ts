// SI-assisted: drafted with Claude Code (Claude Opus 5.5).
// Static web app, no backend (CLAUDE.md). Area data is served from public/area, written by the Python pipeline.
/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import { configDefaults } from "vitest/config";

export default defineConfig({
  oxc: { jsx: { runtime: "automatic" } },
  build: { target: "es2022", sourcemap: true },
  // Playwright specs in e2e/ run under `npx playwright test`, not Vitest.
  test: { exclude: [...configDefaults.exclude, "e2e/**"] },
});
