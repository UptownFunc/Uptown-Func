// SI-assisted: drafted with Claude Code (Claude Opus 5.5) (FLOW-01); human Design review pending.
// FLOW-01: Welcome (orientation or go) -> data choice (NASA-sourced preset or custom) -> Map -> Assess -> HUD, with
// no briefing checkboxes on the way; an infeasible plan is announced at once on Assess (no way on to the HUD) and on
// the HUD ("Plan not feasible (reason). Turn back now.").
import { expect, test } from "@playwright/test";
import { STOP, clickAt, goStep, setTime } from "./helpers";

test("the flow: go, preset, map, assess, HUD; the step index holds only Map, Assess and HUD", async ({ page }) => {
  await page.goto("/?preset=none");
  await page.getByRole("button", { name: "Go", exact: true }).click();
  await page.getByRole("button", { name: /NASA-sourced preset/ }).click();
  await expect(page).toHaveURL(/#map$/);
  const nav = page.getByRole("navigation", { name: "Mission steps" });
  await expect(nav.getByRole("button")).toHaveText([/Map/, /Assess/, /HUD/]);
  await expect(page.getByRole("dialog")).toHaveCount(0); // "Go": no orientation
  await expect(page.getByTestId("area-map").locator("canvas").first()).toBeVisible();
  await clickAt(page, STOP);
  await expect(page.locator(".stops > .stop")).toHaveCount(1, { timeout: 20_000 });
  // The preset's cited times are in, so the margin is known without visiting the Planner.
  await expect(page.getByTestId("margin-state")).toHaveText(/OK|NEAR LIMIT/, { timeout: 20_000 });
  await page.getByRole("button", { name: "Continue to the assessment" }).click();
  await expect(page.getByTestId("assess-infeasible")).toHaveCount(0);
  await page.getByRole("button", { name: "Continue to the field HUD" }).click();
  await expect(page).toHaveURL(/#hud$/);
  await expect(page.getByTestId("field-view")).toBeVisible();
  await expect(page.getByText(/briefing not confirmed/i)).toHaveCount(0);
  await page.screenshot({ path: "test-results/flow-01-hud.png" });
});

test("custom times open the Planner; orientation starts on its card", async ({ page }) => {
  await page.goto("/?preset=none");
  await page.getByRole("button", { name: /Begin orientation/ }).click();
  await page.getByRole("button", { name: "Custom times" }).click();
  await expect(page).toHaveURL(/#planner$/);
  await expect(page.getByRole("dialog")).toContainText("Set the time budget");
});

test("an infeasible plan is announced at once on Assess (no way on) and on the HUD (turn back now)", async ({ page }) => {
  await page.goto("/#map"); // preset on: cited times, then a T_EVA too short for them
  await expect(page.getByTestId("area-map").locator("canvas").first()).toBeVisible();
  await clickAt(page, STOP);
  await expect(page.locator(".stops > .stop")).toHaveCount(1, { timeout: 20_000 });
  await goStep(page, "Planner");
  await setTime(page, "Planned EVA duration (T_EVA)", "60");
  await goStep(page, "Assess");
  const bad = page.getByTestId("assess-infeasible");
  await expect(bad).toContainText("Plan not feasible (the walk overruns the EVA at the slow speed)", { timeout: 20_000 });
  await expect(page.getByRole("button", { name: "Continue to the field HUD" })).toHaveCount(0);
  await page.screenshot({ path: "test-results/flow-01-assess-infeasible.png" });
  await expect(page.getByRole("button", { name: "Back to the map: change the route" })).toBeVisible();
  await goStep(page, "HUD"); // the step index still opens it: the HUD says the same, and what to do
  await expect(page.getByTestId("hud-infeasible")).toContainText("Plan not feasible (the walk overruns the EVA at the slow speed). Turn back now.");
  await page.screenshot({ path: "test-results/flow-01-hud-infeasible.png" });
});

test("on the HUD, a tick that leaves no margin to carry on says turn back now", async ({ page }) => {
  await page.goto("/#map");
  await expect(page.getByTestId("area-map").locator("canvas").first()).toBeVisible();
  await clickAt(page, STOP);
  await expect(page.locator(".stops > .stop")).toHaveCount(1, { timeout: 20_000 });
  await expect(page.getByTestId("margin-state")).toHaveText(/OK|NEAR LIMIT/, { timeout: 20_000 });
  await goStep(page, "HUD");
  await expect(page.getByTestId("hud-infeasible")).toHaveCount(0);
  await page.getByLabel("Elapsed EVA time, minutes").fill("355"); // arrived at A five minutes before the 6 h EVA ends
  await page.getByRole("button", { name: "Tick: arrive A" }).click();
  await expect(page.getByTestId("hud-infeasible")).toContainText("Plan not feasible (carrying on overruns the EVA at the slow speed). Turn back now.");
});
