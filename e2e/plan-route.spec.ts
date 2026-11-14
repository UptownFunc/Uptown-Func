// SI-assisted: drafted with Claude Code (Claude Opus 5.5); human Design + Route Engine review pending.
// Phase 2.6 part 2 / 3.1: clicks on the AREA sheet become add_stop Commands to the engine worker; the engine's plan
// (habitat, stop, grid-path route, est. leg times) is drawn and listed; refused commands leave the plan unchanged.
// Test points were found on the real D1 grid (PHASES.md 3.1 record): STOP is slope-screened and reachable from the
// habitat; EXCLUDED is in a block of excluded cells at the area centre.
import { expect, test, type Page } from "@playwright/test";
import { EXCLUDED, STOP, clickAt, pixelAt } from "./helpers";

test("a click adds a stop through the engine worker and the route is drawn and listed", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByTestId("assumed-banner")).toContainText("ASSUMED placeholder");
  await expect(page.getByLabel("Plan", { exact: true })).toContainText("No stops yet.");
  await expect(page.getByTestId("area-map").locator("canvas").first()).toBeVisible();

  await clickAt(page, STOP);
  const legs = page.getByTestId("legs");
  await expect(legs).toBeVisible({ timeout: 20_000 });
  await expect(legs.locator("tbody tr")).toHaveCount(2);
  await expect(legs).toContainText("Habitat → A");
  await expect(legs).toContainText("A → Habitat");
  // Walking times are estimated ranges in SI minutes, italic.
  const time = legs.locator("tbody tr").first().locator("td").nth(3).locator("[data-quantity]");
  await expect(time).toHaveText(/^est\. \d+\.\d to \d+\.\d min$/);
  await expect(time).toHaveCSS("font-style", "italic");
  await expect(page.getByTestId("end-margin")).toContainText("unknown");
  await expect(page.getByTestId("engine-message")).toContainText(/Plan updated in \d+ ms/);
  await page.screenshot({ path: "test-results/plan-route.png" });

  await page.getByRole("button", { name: "Delete stop A" }).click();
  await expect(page.getByLabel("Plan", { exact: true })).toContainText("No stops yet.");
});

test("a click on excluded ground is refused and the plan is unchanged", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByLabel("Plan", { exact: true })).toContainText("No stops yet.");
  await expect(page.getByTestId("area-map").locator("canvas").first()).toBeVisible();
  await clickAt(page, EXCLUDED);
  await expect(page.getByTestId("engine-message")).toContainText("not on slope-screened ground");
  await expect(page.getByLabel("Plan", { exact: true })).toContainText("No stops yet.");
});

async function setTime(page: Page, label: string, minutes: string) {
  await page.getByLabel(`${label}, minutes`).fill(minutes);
  await page.getByLabel(`${label}, rationale`).fill("e2e test fixture, not a plan value");
  await page.getByLabel(`${label}, minutes`).press("Enter");
}

test("planned margin stays unknown until every Assumed time is entered, then shows an est. range and a state", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByTestId("area-map").locator("canvas").first()).toBeVisible();
  await expect(page.getByTestId("current-T_EVA")).toHaveText("not set");
  await clickAt(page, STOP);
  await expect(page.getByTestId("legs")).toBeVisible({ timeout: 20_000 });
  await setTime(page, "Planned EVA duration (T_EVA)", "240");
  await expect(page.getByTestId("current-T_EVA")).toHaveText("240.0 min · assumed");
  await setTime(page, "Operational tasks (t_ops)", "20");
  await setTime(page, "Contingency (t_cont)", "30");
  await expect(page.getByTestId("end-margin")).toContainText("unknown");
  await setTime(page, "Duration at each stop", "15");
  const end = page.getByTestId("end-margin");
  await expect(end).toContainText(/est\. -?\d+\.\d to -?\d+\.\d min/, { timeout: 20_000 });
  await expect(page.getByTestId("margin-state")).toHaveText("OK");
  await page.screenshot({ path: "test-results/plan-margin.png" });

  // A shorter EVA that cannot fit the walk, stop, tasks and contingency is OVER (octagon, word and colour).
  await setTime(page, "Planned EVA duration (T_EVA)", "60");
  await expect(page.getByTestId("margin-state")).toHaveText("OVER");
  await expect(page.locator("body")).not.toContainText(/\bSAFE\b/);
});

test("a time without a rationale cannot be submitted", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByTestId("current-T_EVA")).toHaveText("not set");
  await page.getByLabel("Planned EVA duration (T_EVA), minutes").fill("240");
  await expect(page.getByRole("button", { name: "Set" }).first()).toBeDisabled();
});

test("profile scrubs both ways with the map, and margin ticks appear when the plan runs over", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByTestId("area-map").locator("canvas").first()).toBeVisible();
  await clickAt(page, STOP);
  const profile = page.getByTestId("profile");
  await expect(profile).toBeVisible({ timeout: 20_000 });
  const readout = page.getByTestId("profile-readout");

  // Profile -> readout (and map marker): hover the middle of the profile.
  const box = (await profile.locator("svg").boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await expect(readout).toContainText(/s \d+ m/);
  await expect(readout).toContainText("planned margin unknown");

  // Map -> profile: hovering the route at the stop selects a profile sample.
  await page.mouse.move(0, 0);
  await expect(readout).toContainText("Hover the profile");
  const atStop = await pixelAt(page, STOP);
  await page.mouse.move(atStop.x, atStop.y);
  await expect(readout).toContainText(/s \d+ m/);

  // A per-stop duration overrides; a short T_EVA makes the plan run over and draws both ticks.
  await setTime(page, "Planned EVA duration (T_EVA)", "90");
  await setTime(page, "Operational tasks (t_ops)", "10");
  await setTime(page, "Contingency (t_cont)", "10");
  await setTime(page, "Stop A duration", "20");
  await expect(page.getByTestId("current-stop_duration-S1")).toHaveText("20.0 min · assumed");
  await expect(page.getByTestId("current-stop_duration")).toHaveText("not set");
  await expect(page.getByTestId("margin-state")).toHaveText("OVER", { timeout: 20_000 });
  await expect(page.getByTestId("profile-tick-NEAR_LIMIT")).toHaveText("margin 10% here");
  await expect(page.getByTestId("profile-tick-OVER")).toHaveText("margin 0 here");
  await page.mouse.move(box.x + box.width * 0.9, box.y + box.height / 2);
  await expect(readout).toContainText(/planned margin est\. -?\d+\.\d to -?\d+\.\d min/);
  await page.screenshot({ path: "test-results/plan-profile.png" });
});

test("AC-05: every displayed quantity carries its class and sources, and opens its source (UX-15, beat 5)", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByTestId("area-map").locator("canvas").first()).toBeVisible();
  await clickAt(page, STOP);
  await expect(page.getByTestId("legs")).toBeVisible({ timeout: 20_000 });
  const qs = page.locator("[data-quantity]");
  expect(await qs.count()).toBeGreaterThanOrEqual(4); // 2 leg times, 1 stop duration, end margin
  for (const el of await qs.all()) {
    await expect(el).toHaveAttribute("data-value-class", /^(directly_measured|published_observation|model_derived|estimated|simulated|assumed|unknown)$/);
    await expect(el).toHaveAttribute("data-source-ids", /\S/);
  }
  await page.getByTestId("legs").locator("[data-quantity]").first().click();
  const detail = page.getByTestId("source-detail");
  await expect(detail).toContainText("estimated");
  await expect(detail).toContainText("NASA/TM-2010-216138");
  await expect(detail).toContainText("Table 4, p. 13");
  await expect(detail).toContainText("K-01 placeholder");
  const datasets = page.getByTestId("datasets-in-view");
  await expect(datasets).toContainText("MSL_Gale_DEM_Mosaic_1m_v3");
  await expect(datasets).toContainText("vertical reference unknown");
  await expect(datasets).toContainText("D2: MSL_Gale_HiRISE-LRGB_78quads_sharp_cog");
  await expect(datasets).toContainText("vertical reference not applicable (orthophoto, no heights)");
  await expect(datasets).not.toContainText("No provenance record");
});
