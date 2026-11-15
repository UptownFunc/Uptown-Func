// SI-assisted: drafted with Claude Code (Claude Opus 5.5) (HUD-01, ASSESS-01); human Design review pending.
// HUD-01: the crew's progress on the 2D sheet follows the HUD's manual ticks, tick by tick, at any zoom, on the HUD step
// only. ASSESS-01: the Assess ladder's trace loops while the Assess step is open, stops on any other step, and never
// runs under reduced motion.
import { expect, test, type Page } from "@playwright/test";
import { STOP, STOP2, clickAt, goStep, openStep, pixelAt, setTime } from "./helpers";

async function twoStops(page: Page): Promise<void> {
  await openStep(page, "map");
  await expect(page.getByTestId("area-map").locator("canvas").first()).toBeVisible();
  await clickAt(page, STOP);
  await expect(page.locator(".stops > .stop")).toHaveCount(1, { timeout: 20_000 });
  await page.waitForTimeout(350); // two clicks within 250 ms would be a double-click (E2E-03)
  await clickAt(page, STOP2);
  await expect(page.locator(".stops > .stop")).toHaveCount(2, { timeout: 20_000 });
}

/** Amber (#ffb347) pixels of the progress layer in a box of half-size h round a page point: count and mean position. */
async function amberAround(page: Page, at: { x: number; y: number }, h: number) {
  return page.locator(".layer-progress canvas").first().evaluate((c: HTMLCanvasElement, a) => {
    const r = c.getBoundingClientRect(), s = c.width / r.width;
    const x0 = Math.round((a.x - r.left - a.h) * s), y0 = Math.round((a.y - r.top - a.h) * s), n = Math.round(2 * a.h * s) + 1;
    const d = c.getContext("2d")!.getImageData(x0, y0, n, n).data;
    let count = 0, sx = 0, sy = 0;
    for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
      const k = 4 * (j * n + i);
      if (d[k + 3]! > 120 && d[k]! > 220 && Math.abs(d[k + 1]! - 179) < 40 && d[k + 2]! < 120) { count++; sx += i; sy += j; }
    }
    return { count, x: count ? r.left + (x0 + sx / count) / s : NaN, y: count ? r.top + (y0 + sy / count) / s : NaN };
  }, { ...at, h });
}

const tickAt = async (page: Page, min: string, name: string) => {
  await page.getByLabel("Elapsed EVA time, minutes").fill(min);
  await page.getByRole("button", { name }).click();
};

test("HUD-01: the map's crew mark follows each HUD tick, stays put across zoom, and shows on the HUD step only", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await twoStops(page);
  await goStep(page, "HUD");
  const map = page.getByTestId("area-map");
  await expect(page.getByText("View only · amber = crew from HUD ticks, not GPS")).toBeVisible();
  await expect(page.getByTestId("field-map-progress")).toHaveText("On the map, the amber mark: it appears with the first tick.");
  await expect(map).toHaveAttribute("data-progress", "");

  // Arrival at A: a ring centred on stop A.
  await tickAt(page, "45", "Tick: arrive A");
  await expect(map).toHaveAttribute("data-progress", "at A 1");
  await expect(page.getByTestId("field-map-progress")).toHaveText("On the map, the amber mark: Crew at A (arrival ticked at 45 min).");
  const ringCentred = async () => {
    const a = await pixelAt(page, STOP), m = await amberAround(page, a, 30);
    return m.count > 150 ? Math.hypot(m.x - a.x, m.y - a.y) : Infinity;
  };
  await expect.poll(ringCentred, { timeout: 5_000 }).toBeLessThanOrEqual(2);
  await page.screenshot({ path: "test-results/hud-progress-at-A.png" });
  // The ring is drawn in screen pixels: it stays on the stop, the same size, after zooming in with the sheet's key.
  const before = (await amberAround(page, await pixelAt(page, STOP), 30)).count;
  await page.getByRole("button", { name: "Zoom in", exact: true }).click();
  await page.waitForTimeout(700);
  await expect.poll(ringCentred, { timeout: 5_000 }).toBeLessThanOrEqual(2);
  expect(Math.abs((await amberAround(page, await pixelAt(page, STOP), 30)).count - before)).toBeLessThan(before * 0.25);
  // The stop marker itself stays on top of the ring (its orange fill at the stop's centre).
  const c = await pixelAt(page, STOP);
  expect((await amberAround(page, c, 6)).count, "no amber under the stop's own marker").toBe(0);

  // Departure from A: the whole leg A to B is marked, with no point chosen on it; both ends of the leg are covered.
  await tickAt(page, "70", "Tick: depart A");
  await expect(map).toHaveAttribute("data-progress", /^leg A \d+$/);
  await expect(page.getByTestId("field-map-progress")).toContainText("Crew on the leg A to B (left A at 70 min; position on the leg not tracked)");
  await expect(page.getByTestId("key-progress")).toContainText("Now: Crew on the leg A to B");
  await expect.poll(async () => (await amberAround(page, await pixelAt(page, STOP2), 14)).count, { timeout: 5_000 }).toBeGreaterThan(20);
  expect((await amberAround(page, await pixelAt(page, STOP), 14)).count).toBeGreaterThan(20);
  await page.getByRole("button", { name: "Fit the route" }).click();
  await page.waitForTimeout(700);
  await page.screenshot({ path: "test-results/hud-progress-leg-A-B.png" });

  // Arrival at B moves the mark on; departure from B marks the walk back.
  await tickAt(page, "95", "Tick: arrive B");
  await expect(map).toHaveAttribute("data-progress", "at B 1");
  await tickAt(page, "130", "Tick: depart B");
  await expect(map).toHaveAttribute("data-progress", /^leg B \d+$/);
  await expect(page.getByTestId("field-map-progress")).toContainText("Crew on the leg B to habitat");

  // Other steps do not show it; the HUD shows it again (the ticks are kept).
  await goStep(page, "Map");
  await expect(map).toHaveAttribute("data-progress", "");
  await goStep(page, "HUD");
  await expect(map).toHaveAttribute("data-progress", /^leg B \d+$/);
  // A plan change makes the ticks belong to the old plan: the mark goes with them.
  await goStep(page, "Planner");
  await setTime(page, "Contingency (t_cont)", "25");
  await goStep(page, "HUD");
  await expect(page.getByTestId("field-view").getByRole("alert")).toContainText("belong to plan");
  await expect(map).toHaveAttribute("data-progress", "");
  await expect(page.getByTestId("field-map-progress")).toContainText("it appears with the first tick");
  expect(errors).toEqual([]);
});

/** The trace's running animations (Motion runs one Web Animation per property). */
const traceAnimations = (page: Page) => page.evaluate(() => {
  const el = document.querySelector('[data-testid="ladder-trace"]');
  return el ? el.getAnimations().map((a) => ({ state: a.playState, iterations: a.effect!.getComputedTiming().iterations, iteration: a.effect!.getComputedTiming().currentIteration })) : null;
});

test("ASSESS-01: the ladder trace draws and loops on the Assess step, stops on other steps, and pauses out of view", async ({ page }) => {
  await twoStops(page);
  await goStep(page, "Assess");
  await expect(page.getByTestId("ladder-trace")).toBeAttached();
  await expect(page.getByLabel("Assessment")).toContainText("An illustration, not a live run.");
  const ladder = page.getByRole("list", { name: "Traverse, leg by leg" });
  // Where the panel opens, the ladder may sit below the fold of the panel's scroll area: it runs once it is in view.
  await ladder.scrollIntoViewIfNeeded();
  await expect.poll(async () => (await traceAnimations(page))?.map((a) => `${a.state} ${a.iterations}`)).toEqual(["running Infinity", "running Infinity"]);
  // It draws from the top: the trace's height grows during the first part of each pass.
  const h = () => page.getByTestId("ladder-trace").evaluate((el) => el.getBoundingClientRect().height);
  const h1 = await h(); await page.waitForTimeout(500); const h2 = await h();
  await page.screenshot({ path: "test-results/assess-trace-drawing.png" });
  expect(h2).toBeGreaterThan(h1);
  // It loops: a second pass starts on its own.
  await expect.poll(async () => (await traceAnimations(page))?.[0]?.iteration ?? 0, { timeout: 9_000 }).toBeGreaterThanOrEqual(1);
  // Out of view (the panel scrolled to the top on a short window), it pauses; back in view, it runs again.
  const scroller = page.getByLabel("Assessment").locator(".side-scroll");
  await page.setViewportSize({ width: 1280, height: 520 });
  await scroller.evaluate((el) => { el.scrollTop = 0; });
  const below = await ladder.evaluate((el) => el.getBoundingClientRect().top >= el.closest(".side-scroll")!.getBoundingClientRect().bottom);
  expect(below, "on a 520 px window the ladder starts below the panel's fold").toBe(true);
  await expect.poll(async () => (await traceAnimations(page))?.map((a) => a.state)).toEqual(["paused", "paused"]);
  await ladder.scrollIntoViewIfNeeded();
  await expect.poll(async () => (await traceAnimations(page))?.map((a) => a.state)).toEqual(["running", "running"]);
  await page.setViewportSize({ width: 1280, height: 800 });
  // Another step: the panel and its animation are gone; no Motion (Web Animations) loop is left running. CSS
  // animations, such as the existing loader icon's spin, are not Motion's and are left out of this count.
  await goStep(page, "Map");
  await expect(page.getByTestId("ladder-trace")).toHaveCount(0);
  expect(await page.evaluate(() => document.getAnimations().filter((a) => !(a instanceof CSSAnimation) && a.effect?.getComputedTiming().iterations === Infinity).length)).toBe(0);
  await goStep(page, "Assess");
  await ladder.scrollIntoViewIfNeeded();
  await expect.poll(async () => (await traceAnimations(page))?.[0]?.state).toBe("running");
  // The user turns on reduced motion mid-run: the trace stops and the ladder is the plain rail again.
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect.poll(async () => (await traceAnimations(page))?.length).toBe(0);
  await expect(page.getByTestId("ladder-trace")).toHaveCSS("opacity", "0");
});

test("ASSESS-01: under reduced motion the ladder trace never runs and its note is hidden", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await twoStops(page);
  await goStep(page, "Assess");
  await expect(page.getByTestId("ladder-trace")).toBeAttached();
  await page.waitForTimeout(300);
  expect(await traceAnimations(page)).toEqual([]);
  await expect(page.getByTestId("ladder-trace")).toHaveCSS("opacity", "0");
  await expect(page.getByText("An illustration, not a live run.")).toBeHidden();
  await page.screenshot({ path: "test-results/assess-reduced-motion.png" });
});
