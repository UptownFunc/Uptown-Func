// SI-assisted: drafted with Claude Code (Claude Opus 5.5).
// Uses the machine's Chromium when PW_CHROMIUM is set (the cloud session pins @playwright/test 1.65.0 but has
// browsers from 1.63). Area data must exist in public/area (pipeline output).
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "e2e",
  timeout: 60_000,
  use: {
    baseURL: "http://localhost:5173",
    viewport: { width: 1280, height: 800 },
    launchOptions: process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {},
  },
  // E2E runs against the production build (vite preview), not the dev server: the dev server's dependency optimiser
  // reloads the page on a cold cache (first run after npm ci), which failed the first specs; and the preview serves
  // exactly what is deployed, worker chunk and public/area included.
  webServer: { command: "npm run build && npx vite preview --port 5173 --strictPort", url: "http://localhost:5173",
    reuseExistingServer: false, timeout: 120_000 },
});
