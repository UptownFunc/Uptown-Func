// SI-assisted: drafted with Claude Code (Claude Opus 5.5); human Design review pending.
// Plan 7.8 "Missing and coarse data": each dataset ships its coverage outline; outside it the layer list says so
// instead of showing a blank. Driven through the UI only: zoom buttons, the keyboard cursor and the pointer.
import { readFileSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";
import { STOP, clickAt, pixelAt, openStep } from "./helpers";

const cov = JSON.parse(readFileSync(new URL("../public/area/coverage.geojson", import.meta.url), "utf8")) as {
  features: { properties: { dataset: string }; geometry: { coordinates: number[][][][] } }[];
};
const d2Ring = cov.features.find((f) => f.properties.dataset === "D2")!.geometry.coordinates[0]![0]!;
const WEST_LON = Math.min(...d2Ring.map((p) => p[0]!));

function trackErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  return errors;
}

/** Non-transparent pixels the coverage layer drew in a box of half-size h around a page point (read, not changed). */
async function coverageInk(page: Page, at: { x: number; y: number }, h: number): Promise<number> {
  return page.locator(".layer-coverage canvas").first().evaluate((c: HTMLCanvasElement, a) => {
    const r = c.getBoundingClientRect(), s = c.width / r.width;
    const x = Math.round((a.x - r.left) * s), y = Math.round((a.y - r.top) * s), n = Math.round(a.h * s);
    const d = c.getContext("2d")!.getImageData(x - n, y - n, 2 * n + 1, 2 * n + 1).data;
    let ink = 0;
    for (let i = 3; i < d.length; i += 4) if (d[i]! > 0) ink++;
    return ink;
  }, { ...at, h });
}

test("coverage outline is drawn at the data edge and the layer list names partial coverage", async ({ page }) => {
  const errors = trackErrors(page);
  await openStep(page, "map");
  const map = page.getByTestId("area-map"), legend = page.getByLabel("Layers");
  await expect(map.locator("canvas").first()).toBeVisible();
  await expect(map).toHaveAttribute("data-coverage-outlines", "2");
  await expect(page.getByTestId("coverage-status")).toHaveText("Dotted outline: edge of the D1 and D2 data on this sheet; blank beyond it");
  // The load view is wider than the shipped window, so every layer is partly outside its dataset's coverage.
  await expect(legend.locator('[data-layer="d2"]')).toContainText("partly outside D2 colour coverage");
  await expect(legend.locator('[data-layer="hillshade"]')).toContainText("partly outside D1 elevation coverage");
  await expect(legend.locator('[data-layer="terrain"]')).toContainText("partly outside D1 elevation coverage");

  // The outline sits on the west edge of the data (from coverage.geojson), and nowhere near the middle of the sheet.
  const edge = await pixelAt(page, { lat: STOP.lat, lon: WEST_LON });
  const mid = await pixelAt(page, STOP);
  await expect.poll(() => coverageInk(page, edge, 3)).toBeGreaterThan(0);
  expect(await coverageInk(page, mid, 3)).toBe(0);
  // The readout confirms where that edge pixel is: its longitude is the outline's, within one 4 m pixel.
  await page.mouse.move(edge.x, edge.y);
  await expect.poll(async () => {
    const m = /lon (-?\d+\.\d+)/.exec((await page.getByTestId("status-line").textContent()) ?? "");
    return m ? Math.abs(Number(m[1]) - WEST_LON) : Infinity;
  }).toBeLessThanOrEqual(1e-4);
  expect(errors).toEqual([]);
});

test("zooming in clears the notes; walking the keyboard cursor past the edge brings them back", async ({ page }) => {
  await openStep(page, "map");
  const map = page.getByTestId("area-map"), legend = page.getByLabel("Layers");
  await expect(legend.locator('[data-layer="d2"]')).toContainText("partly outside D2 colour coverage");
  const zoomIn = page.getByTitle("Zoom in"); // OpenLayers' zoom button (accessible name "+")
  for (let i = 0; i < 2; i++) await zoomIn.click();
  await expect(legend).not.toContainText("outside", { timeout: 5_000 });

  // Keyboard: the cursor starts at the view centre; Shift+ArrowRight steps 100 m east and the view follows it.
  await map.focus();
  for (let i = 0; i < 16; i++) await page.keyboard.press("Shift+ArrowRight");
  await expect(page.getByTestId("cursor-announce")).toContainText("Cursor at latitude");
  await expect(legend.locator('[data-layer="d2"]')).toContainText("partly outside D2 colour coverage");
  // The readout follows the keyboard cursor: about 1.6 km east of the origin, past the data's 1.5 km half-width.
  await expect(page.getByTestId("status-line")).toContainText(/E 1[56]\d\d\.\d m/);
});

test("a missing coverage file is labelled and the sheet still works", async ({ page }) => {
  const errors = trackErrors(page);
  await page.route("**/area/coverage.geojson", (r) => r.fulfill({ status: 404, body: "" }));
  await openStep(page, "map");
  await expect(page.getByTestId("coverage-status")).toHaveText("Coverage outlines not available: coverage.geojson could not be loaded (404)");
  await expect(page.getByTestId("area-map")).toHaveAttribute("data-coverage-outlines", "0");
  await expect(page.getByLabel("Layers")).not.toContainText("partly outside");
  await clickAt(page, STOP);
  await expect(page.getByTestId("legs")).toBeVisible({ timeout: 20_000 });
  expect(errors).toEqual([]);
});

test("an invalid coverage file is refused, not drawn", async ({ page }) => {
  await page.route("**/area/coverage.geojson", (r) => r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ type: "FeatureCollection", frame: "WGS84", features: [] }) }));
  await openStep(page, "map");
  await expect(page.getByTestId("coverage-status")).toHaveText("Coverage outlines not available: coverage.geojson is not a valid coverage file");
  await expect(page.getByTestId("area-map")).toHaveAttribute("data-coverage-outlines", "0");
});

test("a dataset with no valid data on the sheet: every layer says it is outside its coverage", async ({ page }) => {
  const empty = (dataset: string, label: string, layerIds: string[]) => ({ type: "Feature", geometry: { type: "MultiPolygon", coordinates: [] },
    properties: { dataset, label, layerIds, validFraction: 0, method: "e2e fixture" } });
  await page.route("**/area/coverage.geojson", (r) => r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({
    type: "FeatureCollection", frame: "F1", features: [empty("D1", "D1 elevation coverage", ["hillshade", "terrain"]), empty("D2", "D2 colour coverage", ["d2"])] }) }));
  await openStep(page, "map");
  const legend = page.getByLabel("Layers");
  await expect(page.getByTestId("coverage-status")).toHaveText("No valid data on this sheet for any dataset: no coverage outline to draw");
  await expect(page.getByTestId("area-map")).toHaveAttribute("data-coverage-outlines", "0");
  await expect(legend.locator('[data-layer="d2"]')).toContainText("outside D2 colour coverage");
  await expect(legend.locator('[data-layer="d2"]')).not.toContainText("partly");
  await expect(legend.locator('[data-layer="hillshade"]')).toContainText("outside D1 elevation coverage");
});
