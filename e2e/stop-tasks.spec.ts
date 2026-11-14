// SI-assisted: drafted with Claude Code (Claude Opus 5.5); human Design review pending.
// C-19 (option a): a stop's name and tasks are edited in the Plan panel, sent to the engine as edit_stop, and printed
// on the briefing card ("per stop: duration, tasks", Tier 1).
import { expect, test } from "@playwright/test";
import { STOP, clickAt, openStep, goStep } from "./helpers";

test("stop name and tasks reach the briefing card through an edit_stop Command", async ({ page }) => {
  await openStep(page, "map");
  await expect(page.getByTestId("area-map").locator("canvas").first()).toBeVisible();
  await clickAt(page, STOP);
  await expect(page.getByTestId("legs")).toBeVisible({ timeout: 20_000 });

  await page.getByText("Name and tasks").click();
  await page.getByLabel("Stop A name").fill("Boxwork ridge");
  await page.getByLabel("Stop A tasks, one per line").fill("Image the ridge crest\n\nSample the vein fill");
  await page.getByRole("button", { name: "Save" }).click();
  const plan = page.getByLabel("Plan", { exact: true });
  await expect(plan).toContainText("Boxwork ridge");
  await expect(plan).toContainText("name and tasks (2)");

  await goStep(page, "Brief");
  await page.getByRole("button", { name: "Generate card from current plan" }).click();
  const card = page.getByTestId("briefing-card");
  await expect(card).toBeVisible({ timeout: 20_000 });
  await expect(card).toContainText("Boxwork ridge");
  await expect(card).toContainText("Tasks: Image the ridge crest; Sample the vein fill");
});
