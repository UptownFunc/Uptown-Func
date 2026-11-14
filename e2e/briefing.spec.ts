// SI-assisted: drafted with Claude Code (Claude Opus 5.5); human Design review pending.
// Phase 3.4: the briefing card is built from the current plan (UX-10), stamped with its version, carries the
// assumption list, limits and footer, and is marked STALE within 1 s of a plan change with printing blocked (UX-11, AC-06).
import { expect, test, type Page } from "@playwright/test";

const K = (Math.PI * 3_396_190) / 180;
const ORIGIN = { lat: -4.815, lon: 137.39 };
const STOP = { lat: -4.815118, lon: 137.390728 }; // slope-screened and reachable (PHASES 3.1 record)

async function clickAt(page: Page, p: { lat: number; lon: number }) {
  const box = (await page.getByTestId("area-map").boundingBox())!;
  await page.mouse.click(box.x + box.width / 2 + (K * (p.lon - ORIGIN.lon)) / 4, box.y + box.height / 2 - (K * (p.lat - ORIGIN.lat)) / 4);
}

test("briefing card: built from the current plan, then STALE and unprintable after a change", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByTestId("area-map").locator("canvas").first()).toBeVisible();
  await clickAt(page, STOP);
  await expect(page.getByTestId("legs")).toBeVisible({ timeout: 20_000 });
  const version = (await page.getByText(/^Plan [0-9a-f]{16} ·/).textContent())!.match(/Plan ([0-9a-f]{16})/)![1]!;

  await page.getByRole("button", { name: "Briefing" }).click();
  const print = page.getByRole("button", { name: "Print briefing" });
  await expect(print).toBeDisabled();
  await page.getByRole("button", { name: "Generate card from current plan" }).click();
  const card = page.getByTestId("briefing-card");
  await expect(card).toBeVisible({ timeout: 20_000 });
  await expect(page.getByTestId("card-version")).toHaveText(`Plan ${version}`);
  await expect(card.locator("tbody tr")).toHaveCount(2);
  await expect(card).toContainText("H → A");
  await expect(card.locator("td.est").first()).toHaveText(/^est\. \d+\.\d to \d+\.\d min$/);
  await expect(page.getByTestId("card-assumptions")).toContainText("Slope factors k_v");
  await expect(page.getByTestId("card-margin")).toContainText("unknown");
  await expect(card).toContainText("Independent student project; not affiliated with or endorsed by NASA.");
  await expect(card).toContainText("No dose and no safe zones");
  const img = card.locator(".card-map img");
  await expect(img).toBeVisible();
  expect(await img.evaluate((i: HTMLImageElement) => i.naturalWidth)).toBeGreaterThan(100);
  await expect(print).toBeEnabled();
  await expect(page.getByTestId("stale")).toHaveCount(0);
  await card.screenshot({ path: "test-results/briefing-card.png" });

  // Change the plan, return: the card is STALE within 1 s and cannot be printed.
  await page.getByRole("button", { name: "Planning" }).click();
  await page.getByRole("button", { name: "Delete stop A" }).click();
  await expect(page.getByLabel("Plan", { exact: true })).toContainText("No stops yet.");
  await page.getByRole("button", { name: "Briefing" }).click();
  await expect(page.getByTestId("stale")).toBeVisible({ timeout: 1000 });
  await expect(print).toBeDisabled();
  await page.getByRole("button", { name: "Regenerate from current plan" }).click();
  await expect(page.getByTestId("stale")).toHaveCount(0, { timeout: 20_000 });
  await expect(print).toBeEnabled();
});

test("the briefing map is the real sheet, not a blank image", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByTestId("area-map").locator("canvas").first()).toBeVisible();
  await clickAt(page, STOP);
  await expect(page.getByTestId("legs")).toBeVisible({ timeout: 20_000 });
  await page.getByRole("button", { name: "Briefing" }).click();
  await page.getByRole("button", { name: "Generate card from current plan" }).click();
  const img = page.getByTestId("briefing-card").locator(".card-map img");
  await expect(img).toBeVisible({ timeout: 20_000 });
  // Count distinct grey levels: a white or flat image has very few; the orthophoto + hillshade has many.
  const levels = await img.evaluate((i: HTMLImageElement) => {
    const c = document.createElement("canvas"); c.width = i.naturalWidth; c.height = i.naturalHeight;
    const ctx = c.getContext("2d")!; ctx.drawImage(i, 0, 0);
    const d = ctx.getImageData(0, 0, c.width, c.height).data, seen = new Set<number>();
    for (let k = 0; k < d.length; k += 4 * 97) seen.add(d[k]!);
    return seen.size;
  });
  expect(levels).toBeGreaterThan(50);
});

test("the printed card is one A5 page; printing from Planning is not blank", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByTestId("area-map").locator("canvas").first()).toBeVisible();
  await clickAt(page, STOP);
  await expect(page.getByTestId("legs")).toBeVisible({ timeout: 20_000 });
  await page.getByRole("button", { name: "Briefing" }).click();
  await page.getByRole("button", { name: "Generate card from current plan" }).click();
  await expect(page.getByTestId("briefing-card").locator(".card-map img")).toBeVisible({ timeout: 20_000 });
  // The Print briefing button sets the card-only print state while print() runs.
  await page.evaluate(() => { (window as unknown as { __printed: boolean[] }).__printed = [];
    window.print = () => { (window as unknown as { __printed: boolean[] }).__printed.push(document.body.classList.contains("print-card")); }; });
  await page.getByRole("button", { name: "Print briefing" }).click();
  expect(await page.evaluate(() => (window as unknown as { __printed: boolean[] }).__printed)).toEqual([true]);
  await page.evaluate(() => window.dispatchEvent(new Event("afterprint")));
  expect(await page.evaluate(() => document.body.classList.contains("print-card"))).toBe(false);
  await page.emulateMedia({ media: "print" });
  const pages = (pdf: Buffer) => (pdf.toString("latin1").match(/\/Type\s*\/Page[^s]/g) ?? []).length;
  const plain = await page.pdf({ preferCSSPageSize: true });
  expect(pages(plain)).toBeGreaterThanOrEqual(1);
  expect(plain.length).toBeGreaterThan(20_000); // the page content, not an empty sheet
  await page.evaluate(() => document.body.classList.add("print-card"));
  const card = await page.pdf({ preferCSSPageSize: true });
  expect(pages(card)).toBe(1);
  // A5 = 148 x 210 mm = 420 x 595 pt.
  const box = card.toString("latin1").match(/\/MediaBox\s*\[\s*0 0 ([\d.]+) ([\d.]+)\s*\]/)!;
  expect(Math.round(Number(box[1]))).toBe(420);
  expect(Math.round(Number(box[2]))).toBe(595);
});
