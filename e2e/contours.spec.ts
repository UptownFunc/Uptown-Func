// SI-assisted: drafted with Claude Code (Claude Opus 5.5); human Design review pending.
// Plan 7.8 / 9: AREA sheet elevation contours from D1 (gdal_contour, GeoJSON in F1), 10 m lines, every fifth heavier
// and labelled; derived layers name source and cell size. Driven through the UI; positions checked with the readout.
import { readFileSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";
import { STOP, clickAt, pixelAt, openStep, goStep, zoomTo } from "./helpers";

/** Two vertices of the -3450 m index line in public/area/contours.geojson, chosen (14 Nov) as the gentlest index
 *  vertices in the load view with the line running east-west (3.9 deg) and north-south (84 deg), so a misplaced layer
 *  is caught whichever way it moves. Local slope <= 9.3 deg; the F6 grid reads -3449.93 m and -3450.09 m there. At the
 *  4 m load view the pointer is <= 2.83 m off, x tan(9.3 deg) plus the 2 m cell keeps the readout within ~0.8 m. */
const FIXTURES = [{ lat: -4.8173711, lon: 137.392291 }, { lat: -4.8113122, lon: 137.3971416 }];
const contourFile = JSON.parse(readFileSync(new URL("../public/area/contours.geojson", import.meta.url), "utf8")) as {
  features: { properties: { elev_m: number }; geometry: { coordinates: number[][] } }[];
};
/** The fixture's neighbours two vertices either side on its line, to get the line's local direction. */
function neighbours(p: { lat: number; lon: number }) {
  for (const f of contourFile.features) {
    const cs = f.geometry.coordinates, i = cs.findIndex(([lon, lat]) => Math.abs(lon! - p.lon) < 1e-7 && Math.abs(lat! - p.lat) < 1e-7);
    if (i >= 2 && i + 2 < cs.length) return { level: f.properties.elev_m, a: { lon: cs[i - 2]![0]!, lat: cs[i - 2]![1]! }, b: { lon: cs[i + 2]![0]!, lat: cs[i + 2]![1]! } };
  }
  throw new Error(`fixture ${p.lat}, ${p.lon} is not a vertex in contours.geojson`);
}
const LEGEND = "Contours (D1), 10 m interval, every 50 m heavier and labelled; from D1 at 4 m; D1 heights, vertical reference unverified";

function trackErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  return errors;
}

/** Non-transparent pixels the contour layer drew in a box of half-size h around a page point (read only). */
async function contourInk(page: Page, at: { x: number; y: number }, h: number): Promise<number> {
  return page.locator(".layer-elevation-contours canvas").first().evaluate((c: HTMLCanvasElement, a) => {
    const r = c.getBoundingClientRect(), s = c.width / r.width;
    const x = Math.round((a.x - r.left) * s), y = Math.round((a.y - r.top) * s), n = Math.round(a.h * s);
    const d = c.getContext("2d")!.getImageData(x - n, y - n, 2 * n + 1, 2 * n + 1).data;
    let ink = 0;
    for (let i = 3; i < d.length; i += 4) if (d[i]! > 0) ink++;
    return ink;
  }, { ...at, h });
}

test("contours are drawn, named in the layer list, and sit where D1 has that height", async ({ page }) => {
  const errors = trackErrors(page);
  await openStep(page, "map");
  const map = page.getByTestId("area-map");
  await expect(map.locator("canvas").first()).toBeVisible();
  await expect(map).toHaveAttribute("data-elevation-contours", "290");
  const entry = page.getByLabel("Layers").locator('[data-layer="contours"]');
  await expect(entry).toContainText(LEGEND);
  await expect(entry).toContainText("partly outside D1 elevation coverage"); // contours come from D1 (plan 9)

  const status = page.getByTestId("status-line");
  await zoomTo(page, 4); // the placement check below is stated for 4 m pixels (the whole-sheet load view is coarser)
  for (const fx of FIXTURES) {
    const { level, a, b } = neighbours(fx);
    const p = await pixelAt(page, fx), pa = await pixelAt(page, a), pb = await pixelAt(page, b);
    const len = Math.hypot(pb.x - pa.x, pb.y - pa.y), nx = -(pb.y - pa.y) / len, ny = (pb.x - pa.x) / len;
    // Ink on the line at the vertex, none 6 px (24 m) either side across it: no other 10 m line is that close here.
    await expect.poll(() => contourInk(page, p, 2), { message: `contour ink at ${level} m vertex` }).toBeGreaterThan(0);
    for (const sgn of [1, -1]) expect(await contourInk(page, { x: p.x + sgn * 6 * nx, y: p.y + sgn * 6 * ny }, 1), `no ink 6 px across the ${level} m line`).toBe(0);
    // The map's own readout at that pixel: the same place, and D1 has the line's height there.
    await page.mouse.move(p.x, p.y);
    await expect.poll(async () => {
      const t = (await status.textContent()) ?? "";
      const lat = /lat (-?\d+\.\d+)/.exec(t), elev = /elev (-?\d+\.\d+) m/.exec(t);
      return lat && elev && Math.abs(Number(lat[1]) - fx.lat) <= 1e-4 ? Math.abs(Number(elev[1]) - level) : Infinity;
    }, { message: `readout elevation at the ${level} m contour` }).toBeLessThanOrEqual(1.0);
  }
  expect(errors).toEqual([]);
});

test("the briefing card's layer list names the contours", async ({ page }) => {
  await openStep(page, "map");
  await expect(page.getByTestId("area-map").locator("canvas").first()).toBeVisible();
  await clickAt(page, STOP);
  await expect(page.getByTestId("legs")).toBeVisible({ timeout: 20_000 });
  await goStep(page, "Brief");
  await page.getByRole("button", { name: "Generate card from current plan" }).click();
  await expect(page.getByTestId("briefing-card").locator(".card-map figcaption")).toContainText("Contours (D1), 10 m interval", { timeout: 20_000 });
});

test("a missing contour file is labelled and the sheet still works", async ({ page }) => {
  const errors = trackErrors(page);
  await page.route("**/area/contours.geojson", (r) => r.fulfill({ status: 404, body: "" }));
  await openStep(page, "map");
  await expect(page.getByTestId("area-map").locator("canvas").first()).toBeVisible();
  await expect(page.getByLabel("Layers").locator('[data-layer="contours"]')).toHaveText("Contours (D1) - not loaded: contours.geojson could not be loaded (404)");
  await expect(page.getByTestId("area-map")).toHaveAttribute("data-elevation-contours", "0");
  await clickAt(page, STOP);
  await expect(page.getByTestId("legs")).toBeVisible({ timeout: 20_000 });
  expect(errors).toEqual([]);
});

test("an invalid contour file is refused, not drawn", async ({ page }) => {
  await page.route("**/area/contours.geojson", (r) => r.fulfill({ status: 200, contentType: "application/json",
    body: JSON.stringify({ type: "FeatureCollection", frame: "F1", properties: { source: "D12" }, features: [] }) }));
  await openStep(page, "map");
  await expect(page.getByLabel("Layers").locator('[data-layer="contours"]')).toHaveText("Contours (D1) - not loaded: contours.geojson is not a valid contours file");
  await expect(page.getByTestId("area-map")).toHaveAttribute("data-elevation-contours", "0");
});
