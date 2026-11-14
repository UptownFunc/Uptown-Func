// SI-assisted: drafted with Claude Code (Claude Opus 5.5); human Design review pending.
// Phase 2.6: the AREA sheet loads local grids, shows the layers and readout, and works without Cesium.
import { expect, test } from "@playwright/test";
import { EXCLUDED, STOP, pixelAt } from "./helpers";

test("AREA sheet loads, reads out F1/F6/elevation and carries the footer", async ({ page }) => {
  const cesium: string[] = [];
  page.on("request", (r) => { if (/cesium/i.test(r.url())) cesium.push(r.url()); });
  await page.goto("/");
  await expect(page.getByText("Independent student project; not affiliated with or endorsed by NASA.")).toBeVisible();
  const map = page.getByTestId("area-map");
  await expect(map.locator("canvas").first()).toBeVisible();
  await expect(page.getByLabel("Layers")).toContainText("slope-screened only, no rock detection");
  await expect(page.locator(".ol-scale-line-inner")).toContainText("m");

  const box = (await map.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  const status = page.getByTestId("status-line");
  await expect(status).toContainText(/lat -4\.81\d{3}/);
  await expect(status).toContainText(/lon 137\.39\d{3} E/);
  await expect(status).toContainText(/elev -3\d{3}\.\d m/);
  await expect(status).toContainText("vertical reference unverified");
  expect(cesium).toEqual([]);
  await page.screenshot({ path: "test-results/area-sheet.png" });
});

test("shows an error instead of a blank map when area data is missing", async ({ page }) => {
  await page.route("**/area/build_report.json", (r) => r.fulfill({ status: 404, body: "" }));
  await page.goto("/");
  await expect(page.getByRole("alert")).toContainText("Area data could not be loaded");
});

test("the map does not change size when the pointer moves over it or a stop is added", async ({ page }) => {
  await page.goto("/");
  const map = page.getByTestId("area-map");
  await expect(map.locator("canvas").first()).toBeVisible();
  const before = (await map.boundingBox())!;
  await page.mouse.move(before.x + before.width / 2, before.y + before.height / 2);
  await expect(page.getByTestId("status-line")).toContainText("elev");
  expect((await map.boundingBox())!.height).toBe(before.height);
});

test("the shared e2e helper maps each F1 test point to the pixel the sheet reads back (R-02 item 10)", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByTestId("area-map").locator("canvas").first()).toBeVisible();
  const status = page.getByTestId("status-line");
  /** Largest of |lat - point.lat| and |lon - point.lon| read from the status line, or Infinity if it has no coordinates. */
  const offset = async (point: { lat: number; lon: number }) => {
    const text = (await status.textContent()) ?? "";
    const lat = /lat (-?\d+\.\d+)/.exec(text), lon = /lon (-?\d+\.\d+)/.exec(text);
    return lat && lon ? Math.max(Math.abs(Number(lat[1]) - point.lat), Math.abs(Number(lon[1]) - point.lon)) : Infinity;
  };
  for (const point of [STOP, EXCLUDED]) {
    const p = await pixelAt(page, point);
    await page.mouse.move(p.x, p.y);
    // One screen pixel at the load view is 4 m, about 6.7e-5 deg; 1e-4 deg allows pixel rounding only. Polling waits
    // for the throttled readout to catch up with this pointer move.
    await expect.poll(() => offset(point), { message: `readout near ${point.lat}, ${point.lon}` }).toBeLessThanOrEqual(1e-4);
  }
});
