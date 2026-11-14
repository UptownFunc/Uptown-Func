// SI-assisted: drafted with Claude Code (Claude Opus 5.5); human Design review pending.
// Conditions panel (Tier 1, plan 6.10): sun values stay unknown until a person sets the Assumed scenario time with a
// rationale; then the engine returns model-derived LMST, sun elevation and L_s at the area centre, each opening its
// source (D10 Mars24) in the sources panel. The test instant is a test input, not a team choice.
import { expect, test } from "@playwright/test";

test("scenario time drives the Mars24 sun values, each traceable to D10", async ({ page }) => {
  await page.goto("/");
  const panel = page.getByRole("region", { name: "Conditions" });
  await expect(panel).toBeVisible();
  await expect(page.getByTestId("current-scenario")).toHaveText("not set");
  await expect(page.getByTestId("cond-sun")).toContainText("unknown", { timeout: 20_000 });
  await expect(panel).toContainText("Terrain shadowing is not modelled");

  const set = panel.getByRole("button", { name: "Set" });
  await panel.getByLabel("Scenario date and time, UTC").fill("2026-11-14T04:00");
  await expect(set).toBeDisabled(); // a rationale is required
  await panel.getByLabel("Scenario date and time, rationale").fill("e2e test instant");
  await set.click();

  await expect(page.getByTestId("current-scenario")).toHaveText("2026-11-14 04:00 UTC · assumed");
  await expect(page.getByTestId("cond-lmst").locator("[data-quantity]")).toHaveText(/^\d\d:\d\d LMST$/);
  const sun = page.getByTestId("cond-sun").locator("[data-quantity]");
  await expect(sun).toHaveText(/^-?\d+\.\d°$/);
  await expect(sun).toHaveAttribute("data-value-class", "model_derived");
  await expect(page.getByTestId("cond-ls").locator("[data-quantity]")).toHaveText(/^\d+\.\d°$/);

  await sun.click();
  const sources = page.getByRole("region", { name: /Sources/ });
  await expect(sources).toContainText("Mars24");
  await expect(sources).toContainText("2026-11-14 04:00 UTC (team choice): e2e test instant");
  await page.screenshot({ path: "test-results/conditions.png" });
});
