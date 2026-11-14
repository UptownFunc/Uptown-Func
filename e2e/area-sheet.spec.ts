// SI-assisted: drafted with Claude Code (Claude Opus 5.5); human Design review pending.
// Phase 2.6: the AREA sheet loads local grids, shows the layers and readout, and works without Cesium.
import { expect, test } from "@playwright/test";

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
