// SI-assisted: drafted with Claude Code (Claude Opus 5.5); human Design review pending.
// Plan 6.7 / 9.2 sky-obstruction layer (Tier 2): off by default; when shown, a single-hue ramp whose legend gives the
// M12 benchmark and says "geometry, not dose"; never labelled safe; D12 listed among the sources in view.
import { expect, test } from "@playwright/test";

test("sky obstruction layer: off by default, legend states geometry not dose and the M12 benchmark", async ({ page }) => {
  await page.goto("/?preset=none");
  await expect(page.getByTestId("area-map").locator("canvas").first()).toBeVisible();
  const legend = page.getByLabel("Layers");
  await expect(legend.locator('[data-layer="sky"]')).toHaveCount(0);
  const toggle = page.getByLabel(/Sky obstruction layer/);
  await expect(toggle).toHaveAccessibleName(/geometry, not dose/);
  await expect(page.getByText(/Sky obstruction layer .*20 m/)).toHaveCount(0); // no hard-coded resolution in the label
  await expect(toggle).not.toBeChecked();
  await toggle.check();
  const entry = legend.locator('[data-layer="sky"]');
  await expect(entry).toContainText("geometry, not dose");
  await expect(entry).toContainText("Butte M12");
  await expect(entry).toContainText(/20(\.0)? m grid/);
  await expect(entry).toContainText(/% vs /);
  await expect(page.locator("body")).not.toContainText(/\b(safe|shelter)\b/i);
  await expect(page.getByRole("region", { name: /Sources/ })).toContainText("D12");
  // The ramp is drawn: the layer canvas has visible alpha (mean over the canvas).
  await expect.poll(() => page.locator(".layer-sky canvas").first().evaluate((c: HTMLCanvasElement) => {
    const d = c.getContext("2d")!.getImageData(0, 0, c.width, c.height).data;
    let sum = 0;
    for (let i = 3; i < d.length; i += 4) sum += d[i]!;
    return sum / (d.length / 4);
  }), { timeout: 10_000 }).toBeGreaterThan(20);
  await page.screenshot({ path: "test-results/sky-layer.png" });
  await toggle.uncheck();
  await expect(legend.locator('[data-layer="sky"]')).toHaveCount(0);
});


test("a sky image that fails to load is named, and D12 is not claimed as in view", async ({ page }) => {
  await page.route("**/area/sky_obstruction.png", (r) => r.fulfill({ status: 404, body: "" }));
  await page.goto("/?preset=none");
  await expect(page.getByTestId("area-map").locator("canvas").first()).toBeVisible();
  await page.getByLabel(/Sky obstruction layer/).check();
  await expect(page.getByLabel("Layers").locator('[data-layer="sky"]')).toContainText("not loaded", { timeout: 10_000 });
  await expect(page.getByRole("region", { name: /Sources/ })).not.toContainText("D12");
});
