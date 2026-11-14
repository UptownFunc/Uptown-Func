// SI-assisted: drafted with Claude Code (Claude Opus 5.5); human Design review pending.
// Phase 4.4 / AC (accessible): no serious or critical axe violations on the three experiences, and (UI-01) on every
// step of the guided flow, the welcome screen included.
import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { STOP, clickAt, openStep, goStep } from "./helpers";

async function setup(page: Page) {
  await openStep(page, "map");
  await expect(page.getByTestId("area-map").locator("canvas").first()).toBeVisible();
  await clickAt(page, STOP);
  await expect(page.getByTestId("legs")).toBeVisible({ timeout: 20_000 });
}

async function serious(page: Page) {
  // Entrance animations change opacity, so contrast is measured once they have finished (looping ones excepted).
  await page.waitForFunction(() => document.getAnimations().every((a) => a.playState !== "running" || a.effect?.getComputedTiming().iterations === Infinity));
  const r = await new AxeBuilder({ page }).analyze();
  return r.violations.filter((v) => v.impact === "serious" || v.impact === "critical")
    .map((v) => `${v.id}: ${v.help} -> ${v.nodes.slice(0, 3).map((n) => n.target.join(" ")).join(" | ")}`);
}

test("Planning view has no serious or critical axe violations", async ({ page }) => {
  await setup(page);
  expect(await serious(page)).toEqual([]);
});

test("Briefing view with a card has no serious or critical axe violations", async ({ page }) => {
  await setup(page);
  await goStep(page, "Brief");
  await page.getByRole("button", { name: "Generate card from current plan" }).click();
  await expect(page.getByTestId("briefing-card")).toBeVisible({ timeout: 20_000 });
  expect(await serious(page)).toEqual([]);
});

test("Field HUD has no serious or critical axe violations", async ({ page }) => {
  await setup(page);
  await goStep(page, "HUD");
  await expect(page.getByTestId("field-view")).toBeVisible();
  expect(await serious(page)).toEqual([]);
});

test("AC-32: place, move and delete a stop by keyboard alone; leg table is the non-map equivalent", async ({ page }) => {
  await openStep(page, "map");
  await expect(page.getByTestId("area-map").locator("canvas").first()).toBeVisible();
  await page.getByTestId("area-map").focus();
  // From the view centre (the area origin), 4 x 10 m east lands on slope-screened ground in the habitat's region.
  for (let i = 0; i < 4; i++) await page.keyboard.press("ArrowRight");
  await expect(page.getByTestId("cursor-announce")).toContainText("Cursor at latitude");
  await page.keyboard.press("Enter");
  const legs = page.getByTestId("legs");
  await expect(legs).toBeVisible({ timeout: 20_000 });
  await expect(legs).toContainText("Habitat → A");
  const before = (await page.getByText(/^Plan [0-9a-f]{16} ·/).textContent())!;

  // Move: step the cursor 10 m south, then activate "Move stop A to the map cursor" with the keyboard.
  await page.getByTestId("area-map").focus();
  await page.keyboard.press("ArrowDown");
  await page.getByRole("button", { name: "Move stop A to the map cursor" }).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByTestId("engine-message")).toContainText("Plan updated");
  await expect(page.getByText(/^Plan [0-9a-f]{16} ·/)).not.toHaveText(before);

  // Delete with the keyboard.
  await page.getByRole("button", { name: "Delete stop A" }).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByLabel("Plan", { exact: true })).toContainText("No stops yet.");
});

test("AC-32: the console works at 1280 and 1920 px wide", async ({ page }) => {
  for (const width of [1280, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    await openStep(page, "map");
    await expect(page.getByTestId("area-map").locator("canvas").first()).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
    await expect(page.getByLabel("Plan", { exact: true })).toBeInViewport();
  }
});

test("every step of the guided flow has no serious or critical axe violations", async ({ page }) => {
  await page.goto("/?preset=none");
  await expect(page.getByRole("heading", { name: /Plan the walk/ })).toBeVisible();
  expect(await serious(page), "welcome").toEqual([]);
  await page.getByRole("button", { name: /Begin mission setup/ }).click();
  for (const step of ["Setup", "Planner", "Assess", "Brief"] as const) {
    await goStep(page, step);
    expect(await serious(page), step).toEqual([]);
  }
});
