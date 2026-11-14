// SI-assisted: drafted with Claude Code (Claude Opus 5.5); human Design review pending.
// D6 rover point of view (Tier 1, B-3/G3-01): three Curiosity Navcam frames of similar boxwork terrain, each with sol,
// date, camera and credit, in the Planning panel and on the briefing card; D6 is listed among the sources in view.
import { expect, test } from "@playwright/test";
import { STOP, clickAt, goStep, openSources, openStep } from "./helpers";

test("rover views are shown as similar terrain with credits, listed as D6, and printed on the card", async ({ page }) => {
  await openStep(page, "setup"); // context imagery belongs to mission setup
  const view = page.getByRole("region", { name: "Rover point of view" });
  await expect(view).toContainText("similar terrain, not the demo stops");
  const imgs = view.locator("img");
  await expect(imgs).toHaveCount(3);
  for (let i = 0; i < 3; i++) {
    await imgs.nth(i).scrollIntoViewIfNeeded();
    await expect.poll(() => imgs.nth(i).evaluate((el: HTMLImageElement) => el.naturalWidth)).toBeGreaterThan(100);
  }
  await expect(view.locator("figcaption").first()).toHaveText(/^Sol \d+ \(\d{4}-\d{2}-\d{2}\), Left Navigation Camera \(Navcam\), raw\. Credit: NASA\/JPL-Caltech$/);
  await openSources(page);
  await expect(page.getByRole("region", { name: /Sources/ })).toContainText("D6");
  await goStep(page, "Map");

  await expect(page.getByTestId("area-map").locator("canvas").first()).toBeVisible();
  await clickAt(page, STOP);
  await expect(page.getByTestId("legs")).toBeVisible({ timeout: 20_000 });
  await goStep(page, "Brief");
  await page.getByRole("button", { name: "Generate card from current plan" }).click();
  const card = page.getByTestId("briefing-card");
  await expect(card).toBeVisible({ timeout: 20_000 });
  await expect(card.getByTestId("rover-view").locator("img")).toHaveCount(3);
  await expect(card).toContainText("Credit: NASA/JPL-Caltech");
  await card.screenshot({ path: "test-results/briefing-card-rover.png" });
});
