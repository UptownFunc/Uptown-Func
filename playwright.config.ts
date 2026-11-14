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
  webServer: { command: "npx vite --port 5173 --strictPort", url: "http://localhost:5173", reuseExistingServer: true, timeout: 60_000 },
});
