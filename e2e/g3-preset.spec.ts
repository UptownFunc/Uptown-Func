// SI-assisted: drafted with Claude Code (Claude Opus 5.5); human review pending.
// G3-01: on a default load the console sends the demonstration plan times and scenario time as set_assumption
// Commands, so one stop gives a planned margin (G3 "including planned margin") and the sun values are computed.
// Each value is shown as assumed with its G3-01 rationale, and stays editable.
import { expect, test } from "@playwright/test";
import { STOP, clickAt } from "./helpers";

test("G3-01 preset: plan times and scenario time are set as assumed values; one stop gives a planned margin", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByTestId("area-map").locator("canvas").first()).toBeVisible();
  await expect(page.getByTestId("current-T_EVA")).toHaveText("240.0 min · assumed", { timeout: 20_000 });
  await expect(page.getByTestId("current-scenario")).toHaveText("2026-11-15 12:00 UTC · assumed");
  await expect(page.getByTestId("cond-sun").locator("[data-quantity]")).toHaveAttribute("data-value-class", "model_derived");

  await clickAt(page, STOP);
  await expect(page.getByTestId("end-margin")).toContainText(/est\. -?\d+\.\d to -?\d+\.\d min/, { timeout: 20_000 });
  await expect(page.getByTestId("margin-state")).toHaveText(/^(OK|NEAR LIMIT|OVER)$/);
  await expect(page.locator("body")).not.toContainText(/\bSAFE\b/);

  // The rationale names who chose the value; the sources panel shows it.
  await page.getByTestId("end-margin").locator("[data-quantity]").first().click();
  await expect(page.getByRole("region", { name: /Sources/ })).toContainText("G3-01 demonstration value chosen by SI");
  await page.screenshot({ path: "test-results/g3-preset.png" });
});
