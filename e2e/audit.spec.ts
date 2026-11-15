// SI-assisted: drafted with Claude Code (Claude Fable 5.2) on design/sharpwalk-ui-ux (audit R-25); human Design review pending.
// Audit of the Bureau redesign, with real input only: the terrain-class grid is downloaded once (the engine worker
// hands it to the sheet), the demonstration briefing prints on one readable A5 page, estimates stay italic on the
// card, the four Motion timelines end in the right state, and the orientation tour keeps out of the way of the map
// and of form fields and gives focus back when it closes.
import { expect, test, type Page } from "@playwright/test";
import { STOP, STOP2, clickAt, goStep, openStep, pixelAt, setTime } from "./helpers";

function trackErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  return errors;
}

/** The demonstration scenario with two stops, as a short demo walk has. */
async function demoPlan(page: Page): Promise<void> {
  await page.goto("/#map");
  await expect(page.getByTestId("area-map").locator("canvas").first()).toBeVisible();
  await expect(page.getByLabel("Plan", { exact: true })).toContainText("No stops yet.");
  await clickAt(page, STOP);
  await expect(page.locator(".stops > .stop")).toHaveCount(1, { timeout: 20_000 });
  await page.waitForTimeout(350); // two clicks within 250 ms would be a double-click (E2E-03)
  await clickAt(page, STOP2);
  await expect(page.locator(".stops > .stop")).toHaveCount(2, { timeout: 20_000 });
}

test("terrain classes are downloaded once: the engine hands them to the sheet for the cursor tag", async ({ page }) => {
  const errors = trackErrors(page);
  let classRequests = 0;
  await page.route("**/area/terrain_class.uint8.bin", (r) => { classRequests += 1; return r.continue(); });
  await openStep(page, "map");
  await expect(page.getByTestId("area-map").locator("canvas").first()).toBeVisible();
  await expect(page.getByLabel("Plan", { exact: true })).toContainText("No stops yet.");
  // The cursor tag still knows the ground under the pointer.
  const { x, y } = await pixelAt(page, STOP);
  await page.mouse.move(x, y);
  await expect(page.getByTestId("cursor-tag")).toHaveText("Slope-screened ground · click to add a stop");
  expect(classRequests).toBe(1);
  // The page itself never asks for the grid: only the engine worker does.
  const pageFetches = await page.evaluate(() => performance.getEntriesByType("resource").filter((e) => e.name.includes("terrain_class")).length);
  expect(pageFetches).toBe(0);
  expect(errors).toEqual([]);
});

test("without the terrain-class grid the cursor tag says it cannot check the ground, and the sheet still reads out", async ({ page }) => {
  const errors = trackErrors(page);
  await page.route("**/area/terrain_class.uint8.bin", (r) => r.fulfill({ status: 404, body: "" }));
  await openStep(page, "map");
  await expect(page.getByTestId("area-map").locator("canvas").first()).toBeVisible();
  await expect(page.getByTestId("engine-message")).toContainText("Engine could not start");
  const { x, y } = await pixelAt(page, STOP);
  await page.mouse.move(x, y);
  await expect(page.getByTestId("cursor-tag")).toHaveText("No terrain class here · a stop cannot be checked");
  await expect(page.getByTestId("status-line")).toContainText("elev");
  expect(errors).toEqual([]);
});

test("the demonstration briefing prints on one A5 page: nothing clipped, nothing under 6 pt, nothing left out", async ({ page }) => {
  const errors = trackErrors(page);
  await demoPlan(page);
  await goStep(page, "Brief");
  await page.getByRole("button", { name: "Generate card from current plan" }).click();
  const card = page.getByTestId("briefing-card");
  await expect(card.locator(".card-map img")).toBeVisible({ timeout: 20_000 });
  // Estimates are italic on the card too (CLAUDE.md), whatever the type style of the figure they sit in.
  await expect(card.locator(".card-verdict .margin")).toHaveText(/^est\. -?\d+\.\d to -?\d+\.\d min$/);
  await expect(card.locator(".card-verdict .margin")).toHaveCSS("font-style", "italic");
  await expect(card.locator(".card-kpis dd.est")).toHaveCSS("font-style", "italic");

  // The one exception to "real input only" in this file: the browser's native print dialog cannot be driven, so
  // window.print is replaced with a no-op (the briefing.spec pattern). Everything else here is clicks and keys, and
  // the layout is then measured in print media and in the PDF the browser itself produces.
  await page.evaluate(() => { window.print = () => undefined; });
  await page.getByRole("button", { name: "Print briefing" }).click();
  await page.emulateMedia({ media: "print" });
  // A5 less the 12 mm margins is 124 x 186 mm: 469 x 703 CSS px.
  await page.setViewportSize({ width: 469, height: 703 });
  await expect(card.locator(".rover-strip img")).toHaveCount(3);
  for (const img of await card.locator("img").all()) await expect.poll(() => img.evaluate((i: HTMLImageElement) => i.complete && i.naturalWidth > 0)).toBe(true);
  const layout = await card.evaluate((c) => {
    const box = c.getBoundingClientRect();
    const texts = [...c.querySelectorAll<HTMLElement>("*")].filter((e) => [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent!.trim() !== ""));
    const visible = texts.filter((e) => e.getClientRects().length > 0);
    return {
      height: box.height,
      smallestPt: Math.min(...visible.map((e) => parseFloat(getComputedStyle(e).fontSize) * 0.75)),
      outside: visible.filter((e) => { const r = e.getBoundingClientRect(); return r.right > box.right + 1 || r.left < box.left - 1 || r.bottom > box.bottom + 1; }).map((e) => e.textContent!.slice(0, 40)),
      state: (() => { const s = c.querySelector<HTMLElement>(".card-verdict .state")!; const cs = getComputedStyle(s); return { color: cs.color, background: cs.backgroundColor }; })(),
    };
  });
  expect(layout.height).toBeLessThanOrEqual(703);
  expect(layout.smallestPt).toBeGreaterThanOrEqual(6);
  expect(layout.outside).toEqual([]);
  // Black on white (plan 9.2): the status word is printed dark on a light ground, not as a dark lamp.
  expect(layout.state.color).toBe("rgb(0, 0, 0)");
  // Every part of the briefing is on the printed card.
  await expect(card.locator("details:not([open])")).toHaveCount(0);
  await expect(card.locator(".card-legs tbody tr")).toHaveCount(3);
  await expect(card.locator(".card-stop")).toHaveCount(2);
  await expect(card.getByTestId("card-assumptions").locator("li")).toHaveCount(7);
  await expect(card).toContainText("Arrive ____:____ Depart ____:____");
  await expect(card).toContainText("Credit: NASA/JPL-Caltech");
  await expect(card).toContainText("Margins are estimates under stated assumptions, not guarantees.");
  await expect(card).toContainText("Independent student project; not affiliated with or endorsed by NASA.");

  const pdf = await page.pdf({ preferCSSPageSize: true });
  expect((pdf.toString("latin1").match(/\/Type\s*\/Page[^s]/g) ?? []).length).toBe(1);
  const media = pdf.toString("latin1").match(/\/MediaBox\s*\[\s*0 0 ([\d.]+) ([\d.]+)\s*\]/)!;
  expect([Math.round(Number(media[1])), Math.round(Number(media[2]))]).toEqual([420, 595]); // A5 in points
  expect(errors).toEqual([]);
});

test("Motion timelines end in the right state: needle, stamp, spotlight and the welcome monitor", async ({ page }) => {
  const errors = trackErrors(page);
  // Welcome: after the warm-up the copy is fully shown and the terrain keeps its tone (no leftover inline styles).
  await page.goto("/");
  const lede = page.locator(".crt-lede");
  await expect(lede).toHaveCSS("opacity", "1");
  await expect.poll(() => page.locator(".crt-terrain").evaluate((e) => getComputedStyle(e).filter)).toContain("sepia");
  await expect.poll(() => page.locator(".crt-copy > *").evaluateAll((els) => els.every((e) => !(e as HTMLElement).style.opacity && !(e as HTMLElement).style.transform))).toBe(true);

  // Orientation: the spotlight settles on its target.
  await expect(page.getByText("Terrain and route engine ready")).toBeVisible({ timeout: 20_000 });
  await page.getByRole("button", { name: /Begin orientation/ }).click();
  await page.getByRole("button", { name: "Custom times" }).click();
  await expect(page.getByRole("dialog", { name: "Set the time budget" })).toBeVisible();
  const target = page.locator('[data-tour="budget"]');
  await expect.poll(async () => {
    const [t, h, view] = [await target.boundingBox(), await page.locator(".tour-hole").boundingBox(), page.viewportSize()!];
    if (!t || !h) return 999;
    // 8 px of air around the target, kept inside the window (the form runs past the bottom edge).
    const bottom = Math.min(view.height - 4, t.y + t.height + 8);
    return Math.max(Math.abs(h.x - (t.x - 8)), Math.abs(h.y - (t.y - 8)), Math.abs(h.width - (t.width + 16)), Math.abs(h.y + h.height - bottom));
  }).toBeLessThan(2);
  await page.keyboard.press("Escape");
  await expect(page.locator(".tour")).toHaveCount(0);
  // Closing the tour gives focus back to the key that reopens it.
  await expect(page.getByRole("button", { name: "Orientation" })).toBeFocused();

  // Assess: with no stops the meter rests at the left stop; with a route it reads the margin.
  await goStep(page, "Assess");
  const needle = page.locator(".meter .needle");
  const angle = () => needle.evaluate((n) => { const m = new DOMMatrixReadOnly(getComputedStyle(n).transform); return Math.round(Math.atan2(m.b, m.a) * 180 / Math.PI); });
  await expect.poll(angle).toBe(-90);
  await goStep(page, "Map");
  await expect(page.getByLabel("Plan", { exact: true })).toContainText("No stops yet.");
  await clickAt(page, STOP);
  await expect(page.getByTestId("legs")).toBeVisible({ timeout: 20_000 });
  await goStep(page, "Assess");
  await expect(page.getByTestId("assess-margin").getByTestId("margin-state")).toHaveText("OK");
  await expect.poll(() => needle.evaluate((n) => n.getAnimations().length), { timeout: 5_000 }).toBe(0); // the swing has ended
  expect(await angle()).toBeGreaterThan(10); // the OK zone starts at +10 degrees
  expect(await angle()).toBeLessThanOrEqual(90);

  // Brief: the stamp lands and rests at the stylesheet's tilt and ink.
  await goStep(page, "Brief");
  await page.getByRole("button", { name: "Generate card from current plan" }).click();
  await expect(page.getByTestId("briefing-card")).toBeVisible({ timeout: 20_000 });
  for (const box of await page.getByRole("checkbox").all()) await box.check();
  await page.getByRole("button", { name: "Confirm briefing" }).click();
  const stamp = page.locator(".briefed");
  await expect(stamp).toBeVisible();
  await expect.poll(() => stamp.evaluate((e) => e.getAnimations().length)).toBe(0);
  await expect(stamp).toHaveCSS("opacity", "0.92");
  expect(await stamp.evaluate((e) => { const m = new DOMMatrixReadOnly(getComputedStyle(e).transform); return Math.round(Math.atan2(m.b, m.a) * 180 / Math.PI); })).toBe(-12);
  expect(errors).toEqual([]);
});

test("the tour stays out of the way: arrows in a field or on the map do not turn cards, and it follows the user's step", async ({ page }) => {
  const errors = trackErrors(page);
  await page.goto("/?preset=none#planner");
  await expect(page.getByLabel("EVA duration (T_EVA), minutes")).toBeVisible({ timeout: 20_000 });
  // TOUR-01: opened on the Planner, the tour starts at the Planner's card.
  await page.getByRole("button", { name: "Orientation" }).click();
  const budget = page.getByRole("dialog", { name: "Set the time budget" });
  await expect(budget).toBeVisible();
  await expect(budget.getByLabel("Card 1 of 5")).toBeVisible();
  // Typing in a field with the tour open: the field keeps the keys and the card stays.
  await setTime(page, "EVA duration (T_EVA)", "300");
  await expect(page.getByTestId("current-T_EVA")).toHaveText("300.0 min · assumed");
  const minutes = page.getByLabel("EVA duration (T_EVA), minutes");
  await minutes.fill("123");
  await minutes.press("ArrowLeft");
  await minutes.press("ArrowRight");
  await expect(budget).toBeVisible();
  await expect(page).toHaveURL(/#planner$/);
  // The user walks off to the map on their own: the tour follows to the Map's first card (TOUR-01), its spotlight on the
  // map, and the map keeps its keys.
  await goStep(page, "Map");
  await expect(page.getByTestId("area-map").locator("canvas").first()).toBeVisible();
  const mapCard = page.getByRole("dialog", { name: "Point and click to place stops" });
  await expect(mapCard).toBeVisible();
  await expect(page.locator(".tour-ring")).toHaveCount(1);
  await page.getByTestId("area-map").focus();
  for (let i = 0; i < 4; i++) await page.keyboard.press("ArrowRight"); // 40 m east of the centre is slope-screened (resilience.spec)
  await expect(page.getByTestId("cursor-announce")).toContainText("Cursor at latitude");
  await expect(mapCard).toBeVisible(); // still card 4: the arrow moved the map cursor, not the tour
  await page.keyboard.press("Enter");
  await expect(page.locator(".stops > .stop")).toHaveCount(1, { timeout: 20_000 });
  await page.getByRole("button", { name: "Close orientation" }).click();
  await expect(page.locator(".tour")).toHaveCount(0);
  expect(errors).toEqual([]);
});

const overlap = (a: { x: number; y: number; width: number; height: number }, b: { x: number; y: number; width: number; height: number }) =>
  a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;

test("status messages: a success clears itself, a refusal stays, and both reach a persistent live region", async ({ page }) => {
  await openStep(page, "map");
  await expect(page.getByTestId("area-map").locator("canvas").first()).toBeVisible();
  await expect(page.getByLabel("Plan", { exact: true })).toContainText("No stops yet.");
  const toast = page.getByTestId("engine-message");
  // A refusal explains why nothing changed, so it stays until the next message.
  const { x, y } = await pixelAt(page, { lat: -4.815017, lon: 137.390017 }); // excluded ground (helpers EXCLUDED)
  await page.mouse.click(x, y);
  await expect(toast).toContainText("not on slope-screened ground");
  await expect(page.getByTestId("engine-announce")).toContainText("not on slope-screened ground");
  await expect(page.getByTestId("engine-announce")).toHaveAttribute("role", "status");
  await page.waitForTimeout(5_000);
  await expect(toast).toContainText("not on slope-screened ground");
  // A success does not sit on the map for good.
  await clickAt(page, STOP);
  await expect(toast).toContainText(/Plan updated in \d+ ms/, { timeout: 20_000 }); // the first route search on a cold engine can take seconds
  await expect(page.getByTestId("engine-announce")).toContainText(/Plan updated in \d+ ms/);
  await expect(toast).toHaveCount(0, { timeout: 8_000 });
});

test("map chrome: the scale bar is not covered, the cursor tag stays inside the sheet and names a stop under the pointer", async ({ page }) => {
  await openStep(page, "map");
  const map = page.getByTestId("area-map");
  await expect(map.locator("canvas").first()).toBeVisible();
  await expect(page.getByLabel("Plan", { exact: true })).toContainText("No stops yet.");
  await clickAt(page, STOP);
  await expect(page.locator(".stops > .stop")).toHaveCount(1, { timeout: 20_000 });
  const stop = await pixelAt(page, STOP);
  await page.mouse.move(stop.x + 60, stop.y);
  await expect(page.getByTestId("status-line")).toContainText("elev");
  expect(overlap((await page.getByTestId("status-line").boundingBox())!, (await page.locator(".ol-scale-line").boundingBox())!)).toBe(false);
  // Over a stop the click edits it, and the tag says so.
  await page.mouse.move(stop.x, stop.y);
  await expect(page.getByTestId("cursor-tag")).toHaveText("Stop A · click to edit it");
  // At the right and bottom edges the tag flips to stay inside the sheet.
  const box = (await map.boundingBox())!;
  await page.mouse.move(box.x + box.width - 6, box.y + box.height - 80);
  await expect(page.getByTestId("cursor-tag")).toBeVisible();
  const tag = (await page.getByTestId("cursor-tag").boundingBox())!;
  expect(tag.x + tag.width).toBeLessThanOrEqual(box.x + box.width + 1);
  expect(tag.x).toBeGreaterThanOrEqual(box.x - 1);
});

test("keyboard and focus: a step change moves focus to the new step's heading, and the map cursor says what the ground is", async ({ page }) => {
  await page.goto("/?preset=none#setup");
  await expect(page.getByRole("heading", { name: "Choose the scenario" })).toBeVisible({ timeout: 20_000 });
  const next = page.getByRole("button", { name: /Continue to the time budget/ });
  await next.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("heading", { name: "Set the time budget" })).toBeFocused();
  await page.getByRole("button", { name: /Continue to the map/ }).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("heading", { name: "Route", exact: true })).toBeFocused();
  await expect(page.getByTestId("area-map").locator("canvas").first()).toBeVisible();
  await expect(page.getByLabel("Plan", { exact: true })).toContainText("No stops yet.");
  await page.getByTestId("area-map").focus();
  // The area centre is in a block of excluded ground (helpers EXCLUDED); 40 m east is slope-screened.
  await page.keyboard.press("ArrowRight");
  await expect(page.getByTestId("cursor-announce")).toContainText(/no stop here|cannot be checked/);
  for (let i = 0; i < 3; i++) await page.keyboard.press("ArrowRight");
  await expect(page.getByTestId("cursor-announce")).toContainText("Slope-screened ground. Enter adds a stop here.");
});

test("Assess meter and the Briefed stamp never sit on a word or a number they do not mean", async ({ page }) => {
  await demoPlan(page);
  // The margin is never shown as a bare verdict: the Map panel says what it is, as main's panel did.
  await expect(page.getByTestId("end-margin")).toContainText("Estimate under stated assumptions, not a guarantee.");
  await goStep(page, "Assess");
  const needle = page.locator(".meter .needle");
  await expect.poll(() => needle.evaluate((n) => n.getAnimations().length), { timeout: 5_000 }).toBe(0);
  const line = (await page.locator(".meter .needle line").boundingBox())!;
  for (const word of await page.locator(".meter .zone-word").all()) expect(overlap(line, (await word.boundingBox())!), `needle over "${await word.textContent()}"`).toBe(false);
  for (const size of [{ width: 1280, height: 800 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(size);
    await goStep(page, "Brief");
    if (await page.getByTestId("briefing-card").count() === 0) await page.getByRole("button", { name: "Generate card from current plan" }).click();
    await expect(page.getByTestId("briefing-card").locator(".card-map img")).toBeVisible({ timeout: 20_000 });
    if (await page.locator(".briefed").count() === 0) {
      for (const box of await page.getByRole("checkbox").all()) await box.check();
      await page.getByRole("button", { name: "Confirm briefing" }).click();
    }
    const stamp = page.locator(".briefed");
    await expect.poll(() => stamp.evaluate((e) => e.getAnimations().length)).toBe(0);
    const s = (await stamp.boundingBox())!;
    for (const sel of [".card-verdict .margin", ".card-verdict .state", ".card-kpis", ".card-head .meta"])
      expect(overlap(s, (await page.getByTestId("briefing-card").locator(sel).boundingBox())!), `stamp over ${sel} at ${size.width} px`).toBe(false);
  }
});

test("phone: the time budget names every part without clipping, and the welcome monitor's caption is not cut", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/#planner");
  await expect(page.getByTestId("current-T_EVA")).toHaveText("360.0 min · assumed", { timeout: 20_000 });
  const key = page.locator(".budget-key");
  await expect(key).toBeVisible();
  for (const name of ["Operational tasks", "Contingency", "Left for walking and margin"]) await expect(key.getByText(name, { exact: true })).toBeVisible();
  // No label inside the bar is cut off: on a phone the bar is colour only and the key carries the words.
  expect(await page.locator(".budget-bar .seg").evaluateAll((els) => els.filter((e) => e.scrollWidth > e.clientWidth + 1).length)).toBe(0);
  await page.goto("/");
  await expect(page.getByText("Terrain and route engine ready")).toBeVisible({ timeout: 20_000 });
  const badge = (await page.locator(".crt-badge").boundingBox())!, glass = (await page.locator(".crt-glass").boundingBox())!;
  expect(overlap(badge, glass)).toBe(false);
  expect(badge.x).toBeGreaterThanOrEqual(0);
  expect(badge.x + badge.width).toBeLessThanOrEqual(390);
});
