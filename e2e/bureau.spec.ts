// SI-assisted: drafted with Claude Code (Claude Opus 5.5) on design/sharpwalk-ui-ux (UI-11, UI-12); human Design review pending.
// Real-input checks for the Bureau redesign: the orientation tour for new users (UI-12) and point and click on the map
// (UI-11): the cursor tag says before the click whether a stop can go there, a click on a stop opens its card, and the
// card renames, moves and deletes the stop through engine Commands.
import { expect, test } from "@playwright/test";
import { EXCLUDED, STOP, clickAt, openStep, pixelAt } from "./helpers";

test("orientation: eight cards walk the real screens, keyboard works, Escape closes and it is remembered", async ({ page }) => {
  await page.goto("/?preset=none");
  await expect(page.getByText("Terrain and route engine ready")).toBeVisible({ timeout: 20_000 });
  await page.getByRole("button", { name: /Begin orientation/ }).click();
  await expect(page).toHaveURL(/#setup$/);
  const card = page.getByRole("dialog", { name: "Pick a scenario" });
  await expect(card).toBeVisible();
  await expect(card.getByLabel("Card 1 of 8")).toBeVisible();
  await expect(page.locator(".tour-ring")).toHaveCount(1); // the spotlight found its target
  // The app stays usable under the tour: the step keys still answer.
  await card.getByRole("button", { name: /Next/ }).click();
  await expect(page.getByRole("dialog", { name: "Check the conditions" })).toBeVisible();
  await page.getByRole("dialog", { name: "Check the conditions" }).getByRole("button", { name: /Next/ }).click();
  await expect(page).toHaveURL(/#planner$/);
  await expect(page.getByRole("dialog", { name: "Set the time budget" })).toBeVisible();
  await page.keyboard.press("ArrowRight");
  await expect(page).toHaveURL(/#map$/);
  await expect(page.getByRole("dialog", { name: "Point and click to place stops" })).toBeVisible();
  await page.keyboard.press("ArrowLeft");
  await expect(page).toHaveURL(/#planner$/);
  await page.keyboard.press("Escape");
  await expect(page.locator(".tour")).toHaveCount(0);
  expect(await page.evaluate(() => localStorage.getItem("sharpwalk.orientation.done"))).toBe("1");
  // It can be reopened from the masthead at any time.
  await page.getByRole("button", { name: "Orientation" }).click();
  await expect(page.getByRole("dialog", { name: "Pick a scenario" })).toBeVisible();
  await page.getByRole("button", { name: "Close orientation" }).click();
  await expect(page.locator(".tour")).toHaveCount(0);
});

test("point and click: the cursor tag judges the ground, a stop opens its card, and the card edits, moves and deletes", async ({ page }) => {
  await openStep(page, "map");
  await expect(page.getByTestId("area-map").locator("canvas").first()).toBeVisible();
  const tag = page.getByTestId("cursor-tag");
  const at = async (p: { lat: number; lon: number }) => { const { x, y } = await pixelAt(page, p); await page.mouse.move(x, y); };

  await at(EXCLUDED);
  await expect(tag).toHaveText(/no stop here/);
  await expect(tag).toHaveAttribute("data-kind", /no|unknown/);
  await at(STOP);
  await expect(tag).toHaveText("Slope-screened ground · click to add a stop");
  await expect(tag).toHaveAttribute("data-kind", "ok");

  await clickAt(page, STOP);
  const plan = page.getByLabel("Plan", { exact: true });
  await expect(plan.locator(".stop")).toHaveCount(1);

  // A click on the stop opens its card, pinned to the map.
  await clickAt(page, STOP);
  const pop = page.getByTestId("stop-popover");
  await expect(pop).toBeVisible();
  await expect(pop).toContainText("Time at stop");
  await expect(plan.locator(".stop")).toHaveCount(1); // the click selected the stop; it did not add a second one

  // Rename from the card: the engine takes the Command and the plan list follows.
  const name = pop.getByLabel("Stop A name, on the map");
  await name.fill("Boxwork ridge");
  await name.press("Enter");
  await expect(plan).toContainText("Boxwork ridge");

  // Move mode: the tag says what the next click does; Escape cancels.
  await pop.getByRole("button", { name: "Move" }).click();
  await at(STOP);
  await expect(tag).toHaveAttribute("data-kind", "move");
  await page.keyboard.press("Escape");
  await expect(page.locator(".app")).not.toHaveAttribute("data-moving", "true");

  // Delete from the card. OpenLayers reads two clicks within 250 ms as a double-click, so pause as a person would.
  await page.waitForTimeout(350);
  await clickAt(page, STOP);
  await expect(pop).toBeVisible();
  await pop.getByRole("button", { name: "Delete" }).click();
  await expect(plan).toContainText("No stops yet.");
  await expect(page.getByTestId("stop-popover")).toHaveCount(0);
});
