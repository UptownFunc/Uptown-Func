// SI-assisted: drafted with Claude Code (Claude Opus 5.5); human Design review pending.
// Shared e2e helpers (R-02 item 10, R-04 item 6). A test point is an F1 position; its pixel follows from the sheet's
// view at load: centre = the area grid origin from public/area/build_report.json, resolution = INITIAL_RESOLUTION_F7,
// both converted with the app's own src/geo F1 -> F7. Valid only before the view is panned or zoomed.
import { readFileSync } from "node:fs";
import type { Page } from "@playwright/test";
import { f1, f1ToF7 } from "../src/geo";
import { INITIAL_RESOLUTION_F7 } from "../src/map/view";

/** Found on the real D1 grid (PHASES 3.1 record): slope-screened and reachable from the habitat, about 51 min back at
 *  the slow bound (PHASES 2.6/3.1). */
export const STOP = { lat: -4.815118, lon: 137.390728 };
/** In a block of excluded cells at the area centre (PHASES 3.1 record). */
export const EXCLUDED = { lat: -4.815017, lon: 137.390017 };

const report = JSON.parse(readFileSync(new URL("../public/area/build_report.json", import.meta.url), "utf8")) as { origin: { f1: { lat: number; lon: number } } };
const CENTRE = f1ToF7(f1(report.origin.f1.lat, report.origin.f1.lon, 0));

/** Page pixel of an F1 point on the AREA sheet at its load view. */
export async function pixelAt(page: Page, p: { lat: number; lon: number }): Promise<{ x: number; y: number }> {
  const box = (await page.getByTestId("area-map").boundingBox())!;
  const q = f1ToF7(f1(p.lat, p.lon, 0));
  return { x: box.x + box.width / 2 + (q.x - CENTRE.x) / INITIAL_RESOLUTION_F7, y: box.y + box.height / 2 - (q.y - CENTRE.y) / INITIAL_RESOLUTION_F7 };
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
