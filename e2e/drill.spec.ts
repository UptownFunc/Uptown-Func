// SI-assisted: drafted with Claude Code (Claude Opus 5.5); human Design review pending.
// Tier 2: time-to-habitat contour lines and the simulated drill (plan 6.9): SIMULATION banner, the drill line label,
// stops outside the line named, stress cases 20 and 10 min; never "safe" or "shelter".
import { expect, test, type Page } from "@playwright/test";
import { STOP, clickAt, goStep, openLayers, openStep } from "./helpers";

test("contour lines and the simulated drill", async ({ page }) => {
  await openStep(page, "map");
  const map = page.getByTestId("area-map");
  await expect(map.locator("canvas").first()).toBeVisible();
  await expect(page.getByLabel("Plan", { exact: true })).toContainText("No stops yet."); // engine ready
  await clickAt(page, STOP);
  await expect(page.getByTestId("legs")).toBeVisible({ timeout: 20_000 });

  await openLayers(page);
  await page.getByLabel(/5-minute contour lines/).check();
  await expect.poll(async () => Number(await map.getAttribute("data-contour-lines")), { timeout: 30_000 }).toBeGreaterThan(5);

  await goStep(page, "Assess"); // the drill is part of the route assessment
  await page.getByTestId("drill-toggle").check();
  await expect(page.getByTestId("simulation-banner")).toContainText("SIMULATION · SIMULATED DRILL · ASSUMED 30 MIN WARNING");
  await expect(page.getByTestId("drill-outside")).toContainText(/Outside the 30-min line .*A Stop S1 \(est\. \d+\.\d min\)/);
  await page.getByLabel("Assumed warning time").selectOption("10");
  await expect(page.getByTestId("simulation-banner")).toContainText("ASSUMED 10 MIN WARNING");
  await expect(page.locator("body")).not.toContainText(/\bsafe\b|\bshelter\b/i);
  await page.screenshot({ path: "test-results/drill.png" });

  await page.getByTestId("drill-toggle").uncheck();
  await expect(page.getByTestId("simulation-banner")).toHaveCount(0);
});
