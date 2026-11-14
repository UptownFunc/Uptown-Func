// SI-assisted: drafted with Claude Code (Claude Opus 5.5); human Design + Route Engine review pending.
// Phase 2.6 part 2 / 3.1: clicks on the AREA sheet become add_stop Commands to the engine worker; the engine's plan
// (habitat, stop, grid-path route, est. leg times) is drawn and listed; refused commands leave the plan unchanged.
// Test points were found on the real D1 grid (PHASES.md 3.1 record): STOP is slope-screened and reachable from the
// habitat; EXCLUDED is in a block of excluded cells at the area centre.
import { expect, test, type Page } from "@playwright/test";

const K = (Math.PI * 3_396_190) / 180; // F7 metres per degree (src/geo)
const ORIGIN = { lat: -4.815, lon: 137.39 }; // view centre at load (AreaSheet)
const RES = 4; // view resolution at load, F7 units per pixel
const STOP = { lat: -4.815118, lon: 137.390728 };
const EXCLUDED = { lat: -4.815017, lon: 137.390017 };

async function clickAt(page: Page, p: { lat: number; lon: number }) {
  const box = (await page.getByTestId("area-map").boundingBox())!;
  const x = box.x + box.width / 2 + (K * (p.lon - ORIGIN.lon)) / RES;
  const y = box.y + box.height / 2 - (K * (p.lat - ORIGIN.lat)) / RES;
  await page.mouse.click(x, y);
}

test("a click adds a stop through the engine worker and the route is drawn and listed", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByTestId("assumed-banner")).toContainText("ASSUMED placeholder");
  await expect(page.getByLabel("Plan")).toContainText("No stops yet.");
  await expect(page.getByTestId("area-map").locator("canvas").first()).toBeVisible();

  await clickAt(page, STOP);
  const legs = page.getByTestId("legs");
  await expect(legs).toBeVisible({ timeout: 20_000 });
  await expect(legs.locator("tbody tr")).toHaveCount(2);
  await expect(legs).toContainText("Habitat → A");
  await expect(legs).toContainText("A → Habitat");
  // Walking times are estimated ranges in SI minutes, italic.
  const time = legs.locator("tbody tr").first().locator("td").nth(3);
  await expect(time).toHaveText(/^est\. \d+\.\d-\d+\.\d min$/);
  await expect(time).toHaveCSS("font-style", "italic");
  await expect(page.getByTestId("end-margin")).toContainText("unknown");
  await expect(page.getByTestId("engine-message")).toContainText(/Plan updated in \d+ ms/);
  await page.screenshot({ path: "test-results/plan-route.png" });

  await page.getByRole("button", { name: "Delete stop A" }).click();
  await expect(page.getByLabel("Plan")).toContainText("No stops yet.");
});

test("a click on excluded ground is refused and the plan is unchanged", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByLabel("Plan")).toContainText("No stops yet.");
  await expect(page.getByTestId("area-map").locator("canvas").first()).toBeVisible();
  await clickAt(page, EXCLUDED);
  await expect(page.getByTestId("engine-message")).toContainText("not on slope-screened ground");
  await expect(page.getByLabel("Plan")).toContainText("No stops yet.");
});
