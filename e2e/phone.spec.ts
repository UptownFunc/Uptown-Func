// SI-assisted: drafted with Claude Code (Claude Opus 5.5); step navigation for the guided flow on design/sharpwalk-ui-ux.
// UX-12: at phone width there is no horizontal scroll, every step is reachable, and the field HUD text is large.
import { devices, expect, test } from "@playwright/test";
import { goStep, openStep } from "./helpers";

test.use({ viewport: devices["iPhone 13"].viewport, deviceScaleFactor: devices["iPhone 13"].deviceScaleFactor, isMobile: true, hasTouch: true });

test("phone width: no sideways scroll, all steps reachable, field HUD readable", async ({ page }) => {
  await openStep(page, "map");
  await expect(page.getByTestId("area-map").locator("canvas").first()).toBeVisible();
  const overflow = () => page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(await overflow()).toBeLessThanOrEqual(0);
  const steps = page.getByRole("navigation", { name: "Mission steps" });
  for (const name of ["Map", "Assess", "HUD"]) await expect(steps.getByRole("button", { name, exact: true })).toBeInViewport(); // FLOW-01
  await expect(page.getByLabel("Plan", { exact: true })).toBeAttached();
  await goStep(page, "HUD");
  const field = page.getByTestId("field-view");
  await expect(field).toBeVisible();
  const box = (await field.boundingBox())!;
  expect(box.width).toBeLessThanOrEqual(page.viewportSize()!.width);
  // Arm's length: no text in the field HUD under 14 px.
  const minFont = await field.evaluate((el) => {
    let m = 99;
    el.querySelectorAll("*").forEach((n) => {
      if ([...n.childNodes].some((c) => c.nodeType === 3 && c.textContent!.trim())) m = Math.min(m, parseFloat(getComputedStyle(n).fontSize));
    });
    return m;
  });
  expect(minFont).toBeGreaterThanOrEqual(14);
  expect(await overflow()).toBeLessThanOrEqual(0);
  await page.screenshot({ path: "test-results/phone-field.png" });
  for (const name of ["Setup", "Planner", "Assess", "Brief"] as const) {
    await goStep(page, name);
    expect(await overflow(), `no sideways scroll on ${name}`).toBeLessThanOrEqual(0);
  }
  await goStep(page, "Map");
  await expect(field).toBeHidden();
});
