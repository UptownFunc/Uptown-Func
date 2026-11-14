// SI-assisted: drafted with Claude Code (Claude Opus 5.5); human Design review pending.
// UX-12: at phone width there is no horizontal scroll, every view is reachable, and the Field View text is large.
import { devices, expect, test } from "@playwright/test";

test.use({ viewport: devices["iPhone 13"].viewport, deviceScaleFactor: devices["iPhone 13"].deviceScaleFactor, isMobile: true, hasTouch: true });

test("phone width: no sideways scroll, all views reachable, field view readable", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByTestId("area-map").locator("canvas").first()).toBeVisible();
  const overflow = () => page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(await overflow()).toBeLessThanOrEqual(0);
  for (const name of ["Planning", "Briefing", "Field View"]) {
    const b = page.getByRole("button", { name, exact: true });
    await expect(b).toBeInViewport();
  }
  await expect(page.getByLabel("Plan", { exact: true })).toBeAttached();
  await page.getByRole("button", { name: "Field View" }).click();
  const field = page.getByTestId("field-view");
  await expect(field).toBeVisible();
  const box = (await field.boundingBox())!;
  expect(box.width).toBeLessThanOrEqual(page.viewportSize()!.width);
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
  // The views stay reachable from the field view.
  await page.getByRole("button", { name: "Planning", exact: true }).click();
  await expect(field).toBeHidden();
});
