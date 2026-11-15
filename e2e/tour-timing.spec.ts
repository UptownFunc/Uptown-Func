// SI-assisted: drafted with Claude Code (Claude Opus 5.5) on yujin/ux-polish (UX-17); human Design review pending.
// Regression checks for the orientation tour's timing (UX-17). Each card change is pressed inside the page and sampled
// on every animation frame, so the numbers are the user's, not the test runner's: the new words appear in the frame of
// the press, the spotlight starts moving with them and lands on the new control within one glide, never shrinks to a
// point on the way, and the card never sits on the spotlight. Reduced motion lands at once. Also: the "try it" line
// answers the user's action, a refusal does not outlive the next action, and the map's cursor tag keeps its words.
import { expect, test, type Page } from "@playwright/test";
import { EXCLUDED, STOP, clickAt, pixelAt } from "./helpers";

const TARGETS: Record<string, string> = {
  "Pick a scenario": "scenario", "Check the conditions": "conditions", "Set the time budget": "budget",
  "Point and click to place stops": "map", "Read the route": "route", "Carry it in the field": "hud",
  "Judge the return margin": "gauge", "Brief and confirm": "brief",
};

type Turn = { titleAt: number; movedAt: number | null; landedAt: number | null; minSide: number; overlap: number; title: string; huge: boolean };

/** Presses a tour key inside the page and samples the tour on every frame for 900 ms (times from the press, in ms). */
async function press(page: Page, key: "Next" | "Back"): Promise<Turn> {
  return page.evaluate(async ({ key, targets }) => {
    const hole = document.querySelector<HTMLElement>(".tour-hole")!;
    const before = hole.getBoundingClientRect();
    const button = [...document.querySelectorAll<HTMLButtonElement>(".tour-card button")].find((b) => b.textContent?.trim().startsWith(key))!;
    const oldTitle = document.querySelector("#tour-title")!.textContent;
    const out = { titleAt: -1, movedAt: null as number | null, landedAt: null as number | null, minSide: 1e9, overlap: 0, title: "", huge: false };
    const t0 = performance.now();
    button.click();
    await new Promise<void>((done) => {
      const frame = () => {
        const t = performance.now() - t0;
        const title = document.querySelector("#tour-title")!.textContent ?? "";
        if (out.titleAt < 0 && title !== oldTitle) out.titleAt = t;
        const h = hole.getBoundingClientRect();
        if (out.movedAt === null && (Math.abs(h.x - before.x) > 1 || Math.abs(h.y - before.y) > 1 || Math.abs(h.width - before.width) > 1)) out.movedAt = t;
        out.minSide = Math.min(out.minSide, h.width, h.height);
        const el = document.querySelector(`[data-tour="${targets[title]}"]`)!.getBoundingClientRect();
        const want = { x: Math.max(4, el.left - 8), y: Math.max(4, el.top - 8), r: Math.min(innerWidth - 4, el.right + 8), b: Math.min(innerHeight - 4, el.bottom + 8) };
        const on = Math.abs(h.left - want.x) < 2 && Math.abs(h.top - want.y) < 2 && Math.abs(h.right - want.r) < 2 && Math.abs(h.bottom - want.b) < 2;
        if (on && out.landedAt === null) out.landedAt = t;
        if (!on) out.landedAt = null; // landed means it stays landed
        out.title = title;
        if (t < 900) requestAnimationFrame(frame); else done();
      };
      requestAnimationFrame(frame);
    });
    const c = document.querySelector(".tour-card")!.getBoundingClientRect(), h = hole.getBoundingClientRect();
    const ox = Math.max(0, Math.min(c.right, h.right) - Math.max(c.left, h.left)), oy = Math.max(0, Math.min(c.bottom, h.bottom) - Math.max(c.top, h.top));
    out.overlap = (ox * oy) / (c.width * c.height);
    // No free place for the card: not beside the spotlight, nor above or below it (under the 90 px masthead).
    const fits = h.left - 16 >= c.width || innerWidth - h.right - 16 >= c.width || h.top - 12 - 90 >= c.height || innerHeight - h.bottom - 24 >= c.height;
    out.huge = !fits || (innerWidth <= 800 && (h.width * h.height) / (innerWidth * innerHeight) > 0.5);
    return out;
  }, { key, targets: TARGETS });
}

async function beginTour(page: Page) {
  await page.goto("/?preset=none");
  await expect(page.getByText("Terrain and route engine ready")).toBeVisible({ timeout: 20_000 });
  await page.getByRole("button", { name: /Begin orientation/ }).click();
  await expect(page.getByRole("dialog", { name: "Pick a scenario" })).toBeVisible();
  await expect(page.locator(".tour-ring")).toHaveCount(1);
  await expect.poll(() => page.locator(".tour-hole").evaluate((e) => e.getAnimations().length)).toBe(0);
}

for (const size of [{ name: "desktop", width: 1440, height: 900 }, { name: "laptop", width: 1024, height: 768 }, { name: "phone", width: 390, height: 844 }]) {
  test(`${size.name}: every card's words, spotlight and card arrive together, never late or detached`, async ({ page }) => {
    await page.setViewportSize({ width: size.width, height: size.height });
    await beginTour(page);
    const turns: Turn[] = [];
    for (let k = 0; k < 7; k++) turns.push(await press(page, "Next"));
    turns.push(await press(page, "Back"));
    for (const t of turns) {
      expect(t.titleAt, `${t.title}: the words change in the frame of the press`).toBeGreaterThanOrEqual(0);
      expect(t.titleAt, `${t.title}: the words change in the frame of the press`).toBeLessThan(40);
      expect(t.movedAt, `${t.title}: the spotlight moves`).not.toBeNull();
      expect(t.movedAt! - t.titleAt, `${t.title}: no wait between the words and the spotlight`).toBeLessThan(120);
      expect(t.landedAt, `${t.title}: the spotlight lands on its control and stays`).not.toBeNull();
      expect(t.landedAt!, `${t.title}: within one glide`).toBeLessThan(500);
      expect(t.minSide, `${t.title}: the spotlight never shrinks to a point on the way`).toBeGreaterThan(40);
    }
    // Beside, below or above the spotlight on a wide window; docked to the other edge on a narrow one. Only where no
    // such place exists (a control that fills the window) may the card cover it.
    for (const t of turns) if (!t.huge) expect(t.overlap, `${t.title}: the card does not cover the spotlight`).toBeLessThan(0.05);
    expect(turns.filter((t) => !t.huge).length, "most cards are checked for overlap").toBeGreaterThanOrEqual(5);
    // Every card, with its list of terms, fits inside the window.
    const fits = await page.locator(".tour-card").evaluate((e) => { const r = e.getBoundingClientRect(); return r.top >= 0 && r.bottom <= innerHeight + 1; });
    expect(fits, "the last card fits inside the window").toBe(true);
    // The card is placed (beside, below or docked) at its full width, never left shrunk in the window's top-left corner.
    const c = (await page.locator(".tour-card").boundingBox())!;
    expect(c.width).toBeGreaterThan(300);
    if (size.width > 800) expect(c.y).toBeGreaterThan(80);
  });
}

test("reduced motion: the spotlight is on the new control in the first frame and nothing animates", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await beginTour(page);
  for (let k = 0; k < 7; k++) {
    const t = await press(page, "Next");
    expect(t.landedAt, `${t.title}: on target`).not.toBeNull();
    expect(t.landedAt!, `${t.title}: on target at once`).toBeLessThan(40);
    expect(await page.locator(".tour").evaluate((e) => e.getAnimations({ subtree: true }).length), `${t.title}: nothing animates`).toBe(0);
  }
});

test("keyboard: Enter walks all eight cards on one key, Back never strands focus, and Finish closes the tour", async ({ page }) => {
  await beginTour(page);
  const main = page.locator(".tour-card .key.primary");
  await main.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("dialog", { name: "Check the conditions" })).toBeVisible();
  // Screen readers hear the new card from a region that stays mounted.
  await expect(page.getByTestId("tour-announce")).toHaveText(/^Card 2 of 8\. Check the conditions\./);
  await page.locator(".tour-card").getByRole("button", { name: "Back" }).focus();
  await page.keyboard.press("Enter"); // back to the first card: Back turns disabled, focus moves to the main key
  await expect(page.getByRole("dialog", { name: "Pick a scenario" })).toBeVisible();
  await expect(main).toBeFocused();
  for (let k = 2; k <= 8; k++) {
    await page.keyboard.press("Enter");
    await expect(page.locator(".tour-card")).toHaveAttribute("data-card", String(k));
    await expect(main).toBeFocused();
  }
  await expect(main).toHaveText("Finish orientation");
  await page.keyboard.press("Enter");
  await expect(page.locator(".tour")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Orientation" })).toBeFocused();
});

test("the tour answers the user: placing a stop on the map card marks its try-it line Done", async ({ page }) => {
  await beginTour(page);
  for (let k = 0; k < 3; k++) await page.locator(".tour-card .key.primary").click();
  await expect(page.getByRole("dialog", { name: "Point and click to place stops" })).toBeVisible();
  const act = page.getByTestId("tour-act");
  await expect(act).not.toHaveAttribute("data-done", "true");
  await expect(act).toContainText("Try it:");
  await clickAt(page, STOP); // the tour never blocks the map
  await expect(page.locator(".stops > .stop")).toHaveCount(1, { timeout: 20_000 });
  await expect(act).toHaveAttribute("data-done", "true");
  await expect(act).toContainText("Done:");
});

test("a refusal does not outlive the next action, and the cursor tag keeps its words inside its box", async ({ page }) => {
  await page.goto("/?preset=none#map");
  await expect(page.getByTestId("area-map").locator("canvas").first()).toBeVisible({ timeout: 20_000 });
  await expect.poll(() => page.locator(".app").getAttribute("data-busy"), { timeout: 20_000 }).toBe("false");
  // Hover steep ground: the tag's whole verdict fits inside the tag.
  const p = await pixelAt(page, EXCLUDED);
  await page.mouse.move(p.x, p.y);
  const tag = page.getByTestId("cursor-tag");
  await expect(tag).toHaveAttribute("data-kind", "no");
  expect(await tag.evaluate((e) => e.scrollWidth <= e.clientWidth + 1 && e.scrollHeight <= e.clientHeight + 1)).toBe(true);
  const msg = page.getByTestId("engine-message");
  await clickAt(page, EXCLUDED);
  await expect(msg).toContainText("Not changed");
  // The next action starts: the refusal goes at once, before the engine answers, and the answer replaces it.
  await clickAt(page, STOP);
  await expect(page.locator('.toast[data-kind="hold"]')).toHaveCount(0, { timeout: 400 });
  await expect(msg).toContainText("Plan updated", { timeout: 20_000 });
});

test("every variable explains itself: card terms, field meanings, tap-to-explain labels and the glossary (UX-22)", async ({ page }) => {
  await beginTour(page);
  for (let k = 0; k < 2; k++) await page.locator(".tour-card .key.primary").click();
  const card = page.getByRole("dialog", { name: "Set the time budget" });
  await expect(card.locator(".tour-terms dt")).toHaveText(["T_EVA", "t_ops", "t_cont", "Stop time"]);
  await expect(card.locator(".tour-terms dd").first()).toHaveText("the whole EVA, egress to ingress");
  await expect(page.getByTestId("tour-announce")).toContainText("Terms: EVA duration (T_EVA), the whole EVA, egress to ingress");
  await page.keyboard.press("Escape");
  // Under each plan-time field: what the variable is.
  await expect(page.locator(".time-row").first()).toContainText("The planned length of the EVA, egress to ingress.");
  // A screen reader hears the same meaning when it reaches the field.
  await expect(page.getByLabel("Planned EVA duration (T_EVA), minutes")).toHaveAccessibleDescription(/The planned length of the EVA/);
  // Set every time, add a stop: the route panel's terms open their meaning in place.
  await page.goto("/#map");
  await expect.poll(() => page.locator(".app").getAttribute("data-busy"), { timeout: 20_000 }).toBe("false");
  await clickAt(page, STOP);
  await expect(page.getByTestId("legs")).toBeVisible({ timeout: 20_000 });
  await expect(page.locator(".legs-note")).toContainText("Climb: height gained along it.");
  const key = page.getByRole("button", { name: "End margin, what it means" });
  await expect(key).toHaveAttribute("aria-expanded", "false");
  await key.click();
  await expect(key).toHaveAttribute("aria-expanded", "true");
  await expect(page.getByRole("note").filter({ hasText: "The EVA time left once walking" })).toBeVisible();
  // The whole glossary, from the Sources drawer.
  await page.getByRole("button", { name: "Sources", exact: true }).click();
  await page.getByTestId("glossary").locator("summary").click();
  await expect(page.getByTestId("glossary").locator("dt")).toContainText(["EVA", "Local mean solar time", "Slope factor kᵥ"]);
});

test("on a laptop the card's terms start folded, and opening them keeps the card inside the window", async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 });
  await beginTour(page);
  for (let k = 0; k < 5; k++) await page.locator(".tour-card .key.primary").click();
  const card = page.getByRole("dialog", { name: "Carry it in the field" });
  const terms = card.locator(".tour-terms");
  await expect(terms).not.toHaveAttribute("open");
  await terms.locator("summary").click();
  await expect(terms).toHaveAttribute("open", "");
  await expect(card.locator(".tour-terms dt")).toHaveText(["Elapsed", "Tick", "If we continue", "If we turn back"]);
  await expect.poll(() => card.evaluate((e) => { const r = e.getBoundingClientRect(); return r.top >= 0 && r.bottom <= innerHeight + 1; })).toBe(true);
});
