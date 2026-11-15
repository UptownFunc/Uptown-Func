// SI-assisted: drafted with Claude Code (Claude Opus 5.5) on design/sharpwalk-ui-ux (UI-01); human Design review pending.
// The guided flow with real input only: Welcome -> Setup -> Planner -> Map -> Assess -> Brief -> HUD, the state carried
// across every step, the browser's Back button, click feedback on the plate, and the briefing confirmation.
import { expect, test } from "@playwright/test";
import { EXCLUDED, STOP, clickAt, goStep, settle } from "./helpers";

test("the whole journey with clicks (FLOW-01): go, custom times, map, assess, HUD; Setup and Brief by link", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  // Welcome: the title page, the real terrain plate, the three limits, the footer.
  await expect(page.getByRole("heading", { name: /Plan the walk\. Know the margin\./ })).toBeVisible();
  await expect(page.getByText("Slope-screened, not rock-free.")).toBeVisible();
  await expect(page.getByText("Independent student project; not affiliated with or endorsed by NASA.")).toBeVisible();
  await expect(page.getByText("Terrain and route engine ready")).toBeVisible({ timeout: 20_000 });
  await page.getByRole("button", { name: "Go", exact: true }).click();
  await page.getByRole("button", { name: "Custom times" }).click();
  await settle(page);
  await expect(page).toHaveURL(/#planner$/);
  // FLOW-01: the step index holds Map, Assess and HUD; Setup is off it, reached by its link.
  const steps = page.getByRole("navigation", { name: "Mission steps" });
  await expect(steps.getByRole("button")).toHaveText([/Map/, /Assess/, /HUD/]);
  await goStep(page, "Setup");
  // Setup: the demonstration scenario is in force; its scenario time is an Assumed input.
  await expect(page.getByRole("button", { name: /Demonstration scenario/ })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByTestId("current-scenario")).toHaveText("2026-11-15 12:00 UTC · assumed");
  await page.getByRole("button", { name: /Continue to the time budget/ }).click();
  await settle(page);

  // Planner: the time budget bar divides T_EVA; changing a time is a Command and the bar follows.
  await expect(page.getByRole("heading", { name: "Set the time budget" })).toBeVisible();
  await expect(page.getByTestId("current-T_EVA")).toHaveText("360.0 min · assumed");
  await expect(page.locator(".budget-bar .seg.ops")).toBeVisible();
  const before = (await page.locator(".budget-bar .seg.cont").boundingBox())!.width;
  await page.getByLabel("Contingency (t_cont), minutes").fill("90");
  await page.getByLabel("Contingency (t_cont), rationale").fill("e2e test fixture, not a plan value");
  await page.getByRole("button", { name: "Set", exact: true }).nth(2).click();
  await expect(page.getByTestId("current-t_cont")).toHaveText("90.0 min · assumed");
  await expect.poll(async () => (await page.locator(".budget-bar .seg.cont").boundingBox())!.width).toBeGreaterThan(before);
  await page.getByRole("button", { name: /Continue to the map/ }).click();
  await settle(page);

  // Map: a click on the plate rings where it landed (cause), then the stop and its legs appear (effect).
  await expect(page.getByLabel("Plan", { exact: true })).toContainText("No stops yet.");
  await expect(page.getByTestId("area-map").locator("canvas").first()).toBeVisible();
  await clickAt(page, STOP);
  await expect(page.locator(".plate .ping")).toHaveCount(1);
  await expect(page.getByTestId("legs")).toBeVisible({ timeout: 20_000 });
  await expect(page.getByTestId("end-margin")).toContainText(/est\. -?\d+\.\d to -?\d+\.\d min/);
  const version = (await page.getByText(/^Plan [0-9a-f]{16} ·/).textContent())!.match(/Plan ([0-9a-f]{16})/)![1]!;
  await page.getByRole("button", { name: /Continue to the assessment/ }).click();
  await settle(page);

  // Assess: the planned margin as one large figure with word + shape + colour; the traverse ladder.
  await expect(page.getByTestId("assess-margin")).toContainText(/est\. -?\d+\.\d to -?\d+\.\d min/);
  await expect(page.getByTestId("assess-margin").getByTestId("margin-state")).toHaveText(/^(OK|NEAR LIMIT|OVER)$/);
  await expect(page.getByRole("list", { name: "Traverse, leg by leg" })).toContainText("Stop S1");
  await page.getByRole("button", { name: /Continue to the field HUD/ }).click();
  await settle(page);

  // HUD, last: used during the walk. The next event; no step after it; no briefing in the way (FLOW-01).
  await expect(page).toHaveURL(/#hud$/);
  await expect(page.getByTestId("field-next")).toContainText("Arrive at A");
  await expect(page.getByTestId("field-view").getByRole("button", { name: /Continue to/ })).toHaveCount(0);
  // Back goes to the previous step; the plan is still there.
  await page.goBack();
  await settle(page);
  await expect(page).toHaveURL(/#assess$/);

  // Brief, by its link (off the main flow): confirmation needs a card and every acknowledgement; the stamp lands.
  await goStep(page, "Brief");
  const confirm = page.getByRole("button", { name: "Confirm briefing" });
  await expect(confirm).toBeDisabled();
  await page.getByRole("button", { name: "Generate card from current plan" }).click();
  await expect(page.getByTestId("card-version")).toHaveText(`Plan ${version}`, { timeout: 20_000 });
  for (const box of await page.getByRole("complementary", { name: "Confirmation" }).getByRole("checkbox").all()) {
    await expect(confirm).toBeDisabled();
    await box.check();
  }
  await confirm.click();
  await expect(page.getByRole("button", { name: "Briefing confirmed" })).toBeDisabled();
  await expect(page.locator(".briefed")).toBeVisible();
  await expect(page.getByText(`Confirmed for plan ${version}.`)).toBeVisible();

  // A plan change lapses the confirmation and marks the card STALE.
  await goStep(page, "Map");
  await page.getByRole("button", { name: "Delete stop A" }).click();
  await expect(page.getByLabel("Plan", { exact: true })).toContainText("No stops yet.");
  await goStep(page, "Brief");
  await expect(page.getByTestId("stale")).toBeVisible();
  await expect(page.getByText("An earlier confirmation lapsed: the plan changed since.")).toBeVisible();
  await goStep(page, "HUD");
  await expect(page.locator("body")).not.toContainText(/\bSAFE\b/);
  expect(errors).toEqual([]);
});

test("a refused click is explained in place and the plan is unchanged", async ({ page }) => {
  await page.goto("/?preset=none#map");
  await expect(page.getByLabel("Plan", { exact: true })).toContainText("No stops yet.");
  await expect(page.getByTestId("area-map").locator("canvas").first()).toBeVisible();
  await clickAt(page, EXCLUDED);
  const msg = page.getByTestId("engine-message");
  await expect(msg).toContainText("not on slope-screened ground");
  await expect(msg).toHaveAttribute("data-kind", "hold"); // a refusal stays until the next message
  await expect(page.getByLabel("Plan", { exact: true })).toContainText("No stops yet.");
});

test("clicks on the plate add stops only on the Map step", async ({ page }) => {
  await page.goto("/?preset=none#assess");
  await expect(page.getByTestId("area-map").locator("canvas").first()).toBeVisible();
  await expect(page.getByText("View only · edit the route on the Map step")).toBeVisible();
  await expect(page.getByLabel("Assessment")).toContainText("No route yet");
  await clickAt(page, STOP);
  await goStep(page, "Map");
  await expect(page.getByLabel("Plan", { exact: true })).toContainText("No stops yet.");
});

test("reduced motion: the flow still works with every animation off", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/?preset=none");
  await page.getByRole("button", { name: "Go", exact: true }).click();
  await page.getByRole("button", { name: "Custom times" }).click();
  await expect(page).toHaveURL(/#planner$/);
  await goStep(page, "Setup");
  const duration = await page.getByRole("heading", { name: "Choose the scenario" }).evaluate((el) => parseFloat(getComputedStyle(el).animationDuration));
  expect(duration).toBeLessThan(0.01);
  await goStep(page, "Map");
  await expect(page.getByLabel("Plan", { exact: true })).toContainText("No stops yet.");
});

test("the source drawer opens from a number and from the masthead, and closes with Escape", async ({ page }) => {
  await page.goto("/?preset=none#setup");
  await expect(page.getByRole("region", { name: "Sources" })).toHaveCount(0); // closed drawer is out of the accessibility tree
  await page.getByRole("button", { name: "Sources", exact: true }).click();
  const sources = page.getByRole("region", { name: "Sources" });
  await expect(sources.getByTestId("datasets-in-view")).toContainText("D10: Mars24");
  await page.keyboard.press("Escape");
  await expect(sources).toHaveCount(0);
  await page.getByTestId("rems").getByRole("button", { name: /Air pressure/ }).click();
  await expect(page.getByRole("region", { name: "Sources" }).getByTestId("source-detail")).toContainText("outreach purposes only");
  await page.getByRole("region", { name: "Sources" }).getByRole("button", { name: "Close" }).click();
  await expect(page.getByRole("region", { name: "Sources" })).toHaveCount(0);
});
