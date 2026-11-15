// SI-assisted: drafted with Claude Code (Claude Opus 5.5) (3D-02, B-02); human review pending.
// CesiumJS (the plan's pinned 1.147.0) is loaded only when the user opens the 3D view: its published, unmodified
// build is copied to dist/cesium-<version>/ (vite.config.ts) and added as a script on demand, so it is never part of
// the application bundle (AC-12) and is checked against its own ceiling (B-02, scripts/bundle-size.mjs). No Cesium ion.
import type * as CesiumNS from "cesium";

export type Cesium = typeof CesiumNS;
export const CESIUM_VERSION = "1.147.0";
/** Where the vendor files are served, relative to the page (versioned, so the files can be cached for good). */
export const CESIUM_DIR = `cesium-${CESIUM_VERSION}/`;

let loading: Promise<Cesium> | null = null;

/** Loads Cesium once; rejects (and forgets the attempt, so it can be retried) on a load error or after timeout_ms. */
export function loadCesium(timeout_ms = 30_000): Promise<Cesium> {
  const w = window as unknown as { Cesium?: Cesium; CESIUM_BASE_URL?: string };
  if (w.Cesium) return Promise.resolve(w.Cesium);
  loading ??= new Promise<Cesium>((resolve, reject) => {
    w.CESIUM_BASE_URL = new URL(CESIUM_DIR, document.baseURI).href;
    const s = Object.assign(document.createElement("script"), { src: `${w.CESIUM_BASE_URL}Cesium.js`, async: true });
    const fail = (why: string) => { clearTimeout(timer); s.remove(); loading = null; reject(new Error(why)); };
    const timer = setTimeout(() => fail(`the 3D library did not load within ${Math.round(timeout_ms / 1000)} s`), timeout_ms);
    s.onload = () => { clearTimeout(timer); if (w.Cesium) resolve(w.Cesium); else fail("the 3D library loaded but did not start"); };
    s.onerror = () => fail("the 3D library could not be downloaded");
    document.head.append(s);
  });
  return loading;
}
