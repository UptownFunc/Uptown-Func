// SI-assisted: drafted with Claude Code (Claude Opus 5.5); human review pending.
// REG-01 (was G3-01): on a default load the console sends the demonstration plan times and scenario time as
// set_assumption Commands, so one stop gives a planned margin (G3 "including planned margin") and the sun values are
// computed. Each value is shown as assumed with its REG-01 rationale (document and page), and stays editable.
import { expect, test } from "@playwright/test";
import { STOP, clickAt } from "./helpers";

test("REG-01 preset: plan times and scenario time are set as assumed values; one stop gives a planned margin", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByTestId("area-map").locator("canvas").first()).toBeVisible();
  await expect(page.getByTestId("current-T_EVA")).toHaveText("360.0 min · assumed", { timeout: 20_000 });
  await expect(page.getByTestId("current-scenario")).toHaveText("2026-11-15 12:00 UTC · assumed");
  await expect(page.getByTestId("cond-sun").locator("[data-quantity]")).toHaveAttribute("data-value-class", "model_derived");

  await clickAt(page, STOP);
  await expect(page.getByTestId("end-margin")).toContainText(/est\. -?\d+\.\d to -?\d+\.\d min/, { timeout: 20_000 });
  await expect(page.getByTestId("margin-state")).toHaveText(/^(OK|NEAR LIMIT|OVER)$/);
  await expect(page.locator("body")).not.toContainText(/\bSAFE\b/);

  // The rationale names the cited document and page and who picked the value; the sources panel shows it.
  await page.getByTestId("end-margin").locator("[data-quantity]").first().click();
  const sources = page.getByRole("region", { name: /Sources/ });
  await expect(sources).toContainText("EVA-EXP-0042 Rev B, 4.1.4, p. 29");
  await expect(sources).toContainText("NASA/TM-2010-216138, Tables 2-3, p. 12");
  await expect(sources).toContainText("picked from the cited document by SI at a team member's direction");
  await page.screenshot({ path: "test-results/g3-preset.png" });
});
