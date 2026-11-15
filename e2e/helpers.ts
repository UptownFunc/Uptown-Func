// SI-assisted: drafted with Claude Code (Claude Opus 5.5); human Design review pending.
// Shared e2e helpers (R-02 item 10, R-04 item 6). A test point is an F1 position; its pixel follows from the sheet's
// live view, which the sheet publishes read-only on `data-view-f7` (MAP-01: centre and resolution in F7), converted
// with the app's own src/geo F1 -> F7. The view at load is centred on the area grid origin (build_report.json).
import { readFileSync } from "node:fs";
import type { Page } from "@playwright/test";
import { f1, f1ToF7, offsetF1 } from "../src/geo";
import { parseView } from "../src/map/view";

/** Found on the real D1 grid (PHASES 3.1 record): slope-screened and reachable from the habitat, about 51 min back at
 *  the slow bound (PHASES 2.6/3.1). */
export const STOP = { lat: -4.815118, lon: 137.390728 };
/** In a block of excluded cells at the area centre (PHASES 3.1 record). */
export const EXCLUDED = { lat: -4.815017, lon: 137.390017 };
/** The default habitat (App.tsx DEFAULT_HABITAT, H-01): an Assumed scenario input. */
export const HABITAT = { lat: -4.795211, lon: 137.391845 };
/** A second slope-screened stop, 200 m west and 400 m south of STOP: the ground the two-stop specs used before MAP-01
 *  (50 px left and 100 px down of STOP at the earlier 4 m load view), now named by place instead of by pixel. */
export const STOP2 = (() => { const p = offsetF1(f1(STOP.lat, STOP.lon, 0), -200, -400); return { lat: p.lat, lon: p.lon }; })();

const report = JSON.parse(readFileSync(new URL("../public/area/build_report.json", import.meta.url), "utf8")) as { origin: { f1: { lat: number; lon: number } } };
/** The area grid origin, where the sheet's view is centred at load. */
export const ORIGIN = { lat: report.origin.f1.lat, lon: report.origin.f1.lon };

/** The sheet's current view (F7 centre and metres per CSS pixel), once the map has drawn. */
export async function mapView(page: Page): Promise<{ x: number; y: number; resolution: number }> {
  const map = page.getByTestId("area-map");
  await map.locator("canvas").first().waitFor();
  const v = parseView(await map.getAttribute("data-view-f7"));
  if (!v) throw new Error("the sheet has not published its view (data-view-f7)");
  return v;
}

/** Zooms in with the sheet's own key (real input) until the view is at least as close as `resolution` (F7 m per px),
 *  for checks that need the detail of the earlier 4 m load view. */
export async function zoomTo(page: Page, resolution = 4): Promise<void> {
  for (let i = 0; i < 4 && (await mapView(page)).resolution > resolution + 1e-6; i++) {
    const before = (await mapView(page)).resolution;
    await page.getByRole("button", { name: "Zoom in", exact: true }).click();
    await page.waitForFunction((r) => { const v = document.querySelector('[data-testid="area-map"]')?.getAttribute("data-view-f7")?.split(" "); return !!v && Number(v[2]) < r - 1e-6; }, before);
  }
}

/** Page pixel of an F1 point on the AREA sheet in its current view. */
export async function pixelAt(page: Page, p: { lat: number; lon: number }): Promise<{ x: number; y: number }> {
  const v = await mapView(page);
  const box = (await page.getByTestId("area-map").boundingBox())!;
  const q = f1ToF7(f1(p.lat, p.lon, 0));
  return { x: box.x + box.width / 2 + (q.x - v.x) / v.resolution, y: box.y + box.height / 2 - (q.y - v.y) / v.resolution };
}

export async function clickAt(page: Page, p: { lat: number; lon: number }): Promise<void> {
  const { x, y } = await pixelAt(page, p);
  await page.mouse.click(x, y);
}

/** Guided flow (UI-01): the step lives in the URL hash, so a spec can open a step directly, like a shared link. */
export async function openStep(page: Page, step: string, query = "?preset=none"): Promise<void> {
  await page.goto(`/${query}#${step}`);
}

/** Waits until a step change's view transition has finished (pointer input during it reaches the snapshot layer). */
export async function settle(page: Page): Promise<void> {
  await page.waitForFunction(() => { try { return !document.documentElement.matches(":active-view-transition"); } catch { return true; } });
}

/** Moves to a step with a real click on the masthead's step index, as a user does. */
export async function goStep(page: Page, name: "Setup" | "Planner" | "Map" | "HUD" | "Assess" | "Brief"): Promise<void> {
  await page.getByRole("navigation", { name: "Mission steps" }).getByRole("button", { name, exact: true }).click();
  await settle(page);
}

/** Opens the source drawer from the masthead (a click on a Quantity opens it too). */
export async function openSources(page: Page): Promise<void> {
  const b = page.getByRole("button", { name: "Sources", exact: true });
  if ((await b.getAttribute("aria-expanded")) !== "true") await b.click();
}

/** Opens the map's Layers panel (layer list and the Tier 2 layer switches). */
export async function openLayers(page: Page): Promise<void> {
  const b = page.getByRole("button", { name: "Layers", exact: true });
  if ((await b.getAttribute("aria-expanded")) !== "true") await b.click();
}

/** Sets one Assumed plan time on the Planner step (the caller is on that step). */
export async function setTime(page: Page, label: string, minutes: string): Promise<void> {
  await page.getByLabel(`${label}, minutes`).fill(minutes);
  await page.getByLabel(`${label}, rationale`).fill("e2e test fixture, not a plan value");
  await page.getByLabel(`${label}, minutes`).press("Enter");
}
