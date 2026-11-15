// SI-assisted: drafted with Claude Code (Claude Opus 5.5) (UNDO-01, V-15); human Design review pending.
// UNDO-01: a stop added by a click on the map can be taken back with one click on the message's Undo key, for a few
// seconds. V-15: a time over 24 h (a typing mistake such as 1,000,000 min) is refused in the Planner and the HUD.
import { expect, test } from "@playwright/test";
import { STOP, clickAt, goStep, openStep } from "./helpers";

test("UNDO-01: an accidental stop is taken back with the message's Undo key; the key goes with the message", async ({ page }) => {
  await openStep(page, "map");
  await expect(page.getByTestId("area-map").locator("canvas").first()).toBeVisible();
  const plan = page.getByLabel("Plan", { exact: true });
  await expect(plan).toContainText("No stops yet.");
  await clickAt(page, STOP);
  await expect(page.locator(".stops > .stop")).toHaveCount(1, { timeout: 20_000 });
  const undo = page.getByRole("button", { name: "Undo stop A" });
  await expect(undo).toBeVisible();
  await expect(page.getByTestId("engine-announce")).toContainText("Undo stop A: Ctrl+Z, or the key in the message.");
  await page.screenshot({ path: "test-results/undo-stop.png" });
  await undo.dblclick(); // a real double click: the message passes pointer input to its key; the second click is ignored
  await expect(plan).toContainText("No stops yet.", { timeout: 20_000 });
  await expect(page.getByRole("button", { name: /^Undo stop/ })).toHaveCount(0);
  await expect(page.getByTestId("engine-message")).not.toContainText("Not changed");

  // Keyboard: Ctrl+Z takes back the stop just added (outside a text field).
  await page.waitForTimeout(350);
  await clickAt(page, STOP);
  await expect(page.getByRole("button", { name: "Undo stop A" })).toBeVisible({ timeout: 20_000 });
  await page.keyboard.press("Control+z");
  await expect(plan).toContainText("No stops yet.", { timeout: 20_000 });

  // Placed on purpose: the key is offered for a few seconds, then the message clears itself.
  await page.waitForTimeout(350); // two clicks within 250 ms would be a double-click (E2E-03)
  await clickAt(page, STOP);
  await expect(page.locator(".stops > .stop")).toHaveCount(1, { timeout: 20_000 });
  await expect(page.getByRole("button", { name: "Undo stop A" })).toBeVisible();
  await expect(page.getByTestId("engine-message")).toHaveCount(0, { timeout: 9_000 });
  await expect(page.locator(".stops > .stop")).toHaveCount(1);
});

test("V-15: a time over 24 h is refused with its reason, in the Planner and in the HUD", async ({ page }) => {
  await openStep(page, "planner");
  const minutes = page.getByLabel("Planned EVA duration (T_EVA), minutes");
  await page.getByLabel("Planned EVA duration (T_EVA), rationale").fill("typing mistake test");
  const set = page.getByRole("button", { name: "Set", exact: true }).first();
  await minutes.fill("1000000");
  await expect(page.getByRole("alert").filter({ hasText: "At most 1440 min (24 h)" })).toBeVisible();
  await expect(set).toBeDisabled();
  await page.screenshot({ path: "test-results/time-limit.png" });
  await minutes.fill("1440");
  await expect(page.getByText("At most 1440 min (24 h)")).toHaveCount(0);
  await expect(set).toBeEnabled();

  await goStep(page, "Map");
  await expect(page.getByTestId("area-map").locator("canvas").first()).toBeVisible();
  await clickAt(page, STOP);
  await expect(page.locator(".stops > .stop")).toHaveCount(1, { timeout: 20_000 });
  await goStep(page, "HUD");
  await page.getByLabel("Elapsed EVA time, minutes").fill("1000000");
  await page.getByRole("button", { name: "Tick: arrive A" }).click();
  await expect(page.getByTestId("field-view").getByRole("alert")).toContainText("at most 2880");
  await expect(page.getByTestId("field-continue")).toContainText("no tick yet");
});
