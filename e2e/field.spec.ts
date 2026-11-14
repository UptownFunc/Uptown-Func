// SI-assisted: drafted with Claude Code (Claude Opus 5.5); human Design review pending.
// Phase 3.3: Field View ticks arrival/departure by hand (MissionExecution), shows the continue / return-now field
// margins as est. ranges labelled "from manual entries, last tick at", and never changes the plan.
// Plan times here are labelled e2e fixtures, not plan values (DECISIONS T-01).
import { expect, test } from "@playwright/test";
import { STOP, clickAt, goStep, openStep, setTime } from "./helpers";


test("field view: manual ticks drive est. field margins; the plan is never changed", async ({ page }) => {
  await openStep(page, "map");
  await expect(page.getByTestId("area-map").locator("canvas").first()).toBeVisible();
  await clickAt(page, STOP);
  await expect(page.getByTestId("legs")).toBeVisible({ timeout: 20_000 });
  await goStep(page, "Planner");
  for (const [l, v] of [["Planned EVA duration (T_EVA)", "240"], ["Operational tasks (t_ops)", "20"], ["Contingency (t_cont)", "30"], ["Duration at each stop", "15"]] as const)
    await setTime(page, l, v);
  await expect(page.getByTestId("current-stop_duration")).toHaveText("15.0 min · assumed");
  await goStep(page, "Map");
  await expect(page.getByTestId("margin-state")).toHaveText("OK", { timeout: 20_000 });
  const version = (await page.getByText(/^Plan [0-9a-f]{16} ·/).textContent())!.match(/Plan ([0-9a-f]{16})/)![1]!;

  await goStep(page, "HUD");
  const field = page.getByTestId("field-view");
  await expect(page.getByTestId("field-next")).toContainText("Arrive at A");
  await expect(page.getByTestId("field-leg")).toContainText(/heading \d+° · 1\.\d\d km/);
  await expect(page.getByTestId("field-continue")).toContainText("no tick yet");

  await page.getByLabel("Elapsed EVA time, minutes").fill("45");
  await page.getByRole("button", { name: "Tick: arrive A" }).click();
  await expect(page.getByTestId("field-continue").locator("[data-quantity]")).toHaveText(/^est\. -?\d+\.\d to -?\d+\.\d min$/);
  await expect(page.getByTestId("field-return").locator("[data-quantity]")).toHaveText(/^est\. -?\d+\.\d to -?\d+\.\d min$/);
  await expect(page.getByTestId("field-continue").getByTestId("margin-state")).toHaveText(/OK|NEAR LIMIT|OVER/);
  await expect(page.getByTestId("field-provenance")).toContainText(/From manual entries, last tick at \d\d:\d\d UTC \(arrive A, elapsed 45 min\)/);
  await expect(page.getByTestId("field-next")).toContainText("Depart from A");

  // A time earlier than the last tick is refused.
  await page.getByLabel("Elapsed EVA time, minutes").fill("40");
  await page.getByRole("button", { name: "Tick: depart A" }).click();
  await expect(field.getByRole("alert")).toContainText("earlier than the last tick");
  await page.getByLabel("Elapsed EVA time, minutes").fill("62");
  await page.getByRole("button", { name: "Tick: depart A" }).click();
  await expect(page.getByTestId("field-next")).toContainText("All stops ticked");
  await expect(page.getByRole("button", { name: "All ticked" })).toBeDisabled();
  await expect(field).not.toContainText(/\bSAFE\b/);
  await page.screenshot({ path: "test-results/field-view.png" });

  // The plan is unchanged by ticks; ticks survive switching views; a plan change marks them as belonging to the old plan.
  await goStep(page, "Map");
  await expect(page.getByText(`Plan ${version} ·`)).toBeVisible();
  await goStep(page, "HUD");
  await expect(page.getByTestId("field-next")).toContainText("All stops ticked");
  await goStep(page, "Planner");
  await setTime(page, "Contingency (t_cont)", "25");
  await expect(page.getByTestId("current-t_cont")).toHaveText("25.0 min · assumed");
  await goStep(page, "HUD");
  await expect(field.getByRole("alert")).toContainText(`belong to plan ${version}`);
  // Ticking is blocked until the crew explicitly starts over, so old ticks are never discarded silently.
  await expect(page.getByRole("button", { name: /^Tick: / })).toBeDisabled();
  await page.getByRole("button", { name: "Start ticks for the current plan" }).click();
  await expect(page.getByRole("button", { name: "Tick: arrive A" })).toBeEnabled();
});
