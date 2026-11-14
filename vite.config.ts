// SI-assisted: drafted with Claude Code (Claude Opus 5.5).
// Static web app, no backend (CLAUDE.md). Area data is served from public/area, written by the Python pipeline.
import { defineConfig } from "vite";

export default defineConfig({
  oxc: { jsx: { runtime: "automatic" } },
  build: { target: "es2022", sourcemap: true },
});
