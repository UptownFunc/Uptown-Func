// SI-assisted: drafted with Claude Code (Claude Opus 5.5).
// Static web app, no backend (CLAUDE.md). Area data is served from public/area, written by the Python pipeline.
/// <reference types="vitest/config" />
import { defineConfig, type Plugin } from "vite";
import { configDefaults } from "vitest/config";
import { cpSync, createReadStream, existsSync, statSync } from "node:fs";
import { join, normalize } from "node:path";
import { CESIUM_DIR } from "./src/map3d/vendor";

/** 3D-02 / B-02: the published CesiumJS build, unmodified, served from /cesium-<version>/ and copied into dist/ there.
 *  Only what a CesiumWidget with our own terrain and imagery uses: the library, its workers, the credit images, the
 *  approximate terrain heights, the frame-rotation tables Cesium reads every frame (IAU2006_XYS, one small file at a
 *  time), and the widget stylesheet. No ion, no sky box, no third-party. */
const CESIUM_BUILD = "node_modules/cesium/Build/Cesium";
const CESIUM_PARTS = ["Cesium.js", "Workers", "Assets/approximateTerrainHeights.json", "Assets/Images", "Assets/IAU2006_XYS", "Widgets/CesiumWidget/CesiumWidget.css"];
function cesiumVendor(): Plugin {
  const prefix = `/${CESIUM_DIR}`;
  return {
    name: "sharpwalk-cesium-vendor",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const path = decodeURIComponent((req.url ?? "").split("?")[0]!);
        if (!path.startsWith(prefix)) return next();
        const rel = normalize(path.slice(prefix.length)), file = join(CESIUM_BUILD, rel);
        if (rel.startsWith("..") || !CESIUM_PARTS.some((p) => rel === p || rel.startsWith(`${p}/`)) || !existsSync(file) || !statSync(file).isFile()) return next();
        res.setHeader("Content-Type", file.endsWith(".js") ? "text/javascript" : file.endsWith(".css") ? "text/css" : file.endsWith(".json") ? "application/json" : "image/png");
        createReadStream(file).pipe(res);
      });
    },
    writeBundle(options) {
      for (const p of CESIUM_PARTS) cpSync(join(CESIUM_BUILD, p), join(options.dir ?? "dist", CESIUM_DIR, p), { recursive: true });
      // Apache-2.0: the licence (with its third-party notices) travels with the redistributed files.
      cpSync("node_modules/cesium/LICENSE.md", join(options.dir ?? "dist", CESIUM_DIR, "LICENSE.md"));
    },
  };
}

export default defineConfig({
  oxc: { jsx: { runtime: "automatic" } },
  plugins: [cesiumVendor()],
  // B-01 / AC-12: the engine worker is a second entry of the same build (not Vite's separate worker build), so the code
  // both sides use (Zod, the contracts, constants, src/geo, Comlink) is emitted once as a shared chunk instead of
  // twice. The worker keeps a fixed name outside assets/ so src/engine/client.ts can address it; its imports are hashed.
  build: {
    target: "es2022", sourcemap: true, modulePreload: { polyfill: false },
    rolldownOptions: {
      input: { index: "index.html", "engine-worker": "src/engine/worker.ts" },
      output: {
        entryFileNames: (chunk) => (chunk.name === "engine-worker" ? "engine-worker.js" : "assets/[name]-[hash].js"),
        // B-02: the 3D view's own code is named view3d-*, so the AC-12 check can count it with the 3D files.
        chunkFileNames: (chunk) => (chunk.name === "TerrainView" ? "assets/view3d-[hash].js" : "assets/shared-[hash].js"),
      },
    },
  },
  // Playwright specs in e2e/ run under `npx playwright test`, not Vitest.
  test: { exclude: [...configDefaults.exclude, "e2e/**"] },
});
