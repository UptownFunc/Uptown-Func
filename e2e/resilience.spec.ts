// SI-assisted: drafted with Claude Code (Claude Opus 5.5); human Captain review pending.
// AC-31 (G4): missing data and network failure give a labelled state each time, no uncaught error, and the 2D sheet
// stays usable. 3D is cut (DECISIONS D-10), so its imagery case does not apply.
import { expect, test, type Page } from "@playwright/test";
import { STOP, clickAt } from "./helpers";

function trackErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  return errors;
}

test("a display layer that fails to load leaves the sheet usable, with no uncaught error", async ({ page }) => {
  const errors = trackErrors(page);
  await page.route("**/area/d2_luminance.jpg", (r) => r.fulfill({ status: 404, body: "" }));
  await page.goto("/");
  await expect(page.getByTestId("area-map").locator("canvas").first()).toBeVisible();
  await expect(page.getByLabel("Plan", { exact: true })).toContainText("No stops yet.");
  await expect(page.getByTestId("layer-errors")).toContainText("Orthophoto (D2 colour mosaic, luminance) could not be loaded");
  const box = (await page.getByTestId("area-map").boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await expect(page.getByTestId("status-line")).toContainText("elev");
  // The legend, the sources panel and the briefing card do not claim the missing layer.
  await expect(page.getByLabel("Layers")).toContainText("Orthophoto (D2 colour mosaic, luminance) - not loaded");
  await expect(page.getByTestId("datasets-in-view")).not.toContainText("D2:");
  await clickAt(page, STOP);
  await expect(page.getByTestId("legs")).toBeVisible({ timeout: 20_000 });
  await page.getByRole("button", { name: "Briefing" }).click();
  await page.getByRole("button", { name: "Generate card from current plan" }).click();
  const caption = page.getByTestId("briefing-card").locator("figcaption");
  await expect(caption).toBeVisible({ timeout: 20_000 });
  await expect(caption).not.toContainText("Orthophoto");
  await expect(caption).toContainText("Hillshade (D1)");
  expect(errors).toEqual([]);
});

test("grid files missing for the engine: a labelled state, no uncaught error, the sheet still draws", async ({ page }) => {
  const errors = trackErrors(page);
  await page.route("**/area/terrain_class.uint8.bin", (r) => r.fulfill({ status: 404, body: "" }));
  await page.goto("/");
  await expect(page.getByTestId("area-map").locator("canvas").first()).toBeVisible();
  await expect(page.getByTestId("engine-message")).toContainText("Engine could not start");
  expect(errors).toEqual([]);
});

test("network cut after load: the sheet and the engine keep working offline", async ({ page, context }) => {
  const errors = trackErrors(page);
  await page.goto("/");
  await expect(page.getByTestId("area-map").locator("canvas").first()).toBeVisible();
  await expect(page.getByLabel("Plan", { exact: true })).toContainText("No stops yet.");
  await context.setOffline(true);
  await page.getByTestId("area-map").focus();
  for (let i = 0; i < 4; i++) await page.keyboard.press("ArrowRight");
  await page.keyboard.press("Enter");
  await expect(page.getByTestId("legs")).toBeVisible({ timeout: 20_000 });
  await page.getByRole("button", { name: "Briefing" }).click();
  await page.getByRole("button", { name: "Generate card from current plan" }).click();
  await expect(page.getByTestId("briefing-card")).toBeVisible({ timeout: 20_000 });
  expect(errors).toEqual([]);
  await context.setOffline(false);
});
