// SI-assisted: drafted with Claude Code (Claude Opus 5.5); rewritten for the UI-02 type system on design/sharpwalk-ui-ux.
// UI-02: Newsreader (display and estimates), Instrument Sans (interface) and DM Mono (labels, coordinates, tables) load
// from this origin and are what the console renders with; digits are tabular where numbers line up; if the files fail,
// the console falls back to system fonts and keeps working.
import { expect, test, type Page } from "@playwright/test";
import { goStep, openStep } from "./helpers";

const FAMILIES = ["Newsreader Variable", "Instrument Sans Variable", "DM Mono"];

/** Every UI-02 FontFace the page knows, with its load status (read from document.fonts after it settles). */
async function faces(page: Page) {
  return page.evaluate(async (families) => {
    await document.fonts.ready;
    return [...document.fonts].map((f) => ({ family: f.family.replace(/["']/g, ""), weight: f.weight, style: f.style, status: f.status }))
      .filter((f) => families.includes(f.family));
  }, FAMILIES);
}

/** Text width in a detached canvas: differs from the fallback only if the named font is really in use. */
async function widths(page: Page, text: string, fonts: string[]) {
  return page.evaluate(({ text, fonts }) => {
    const ctx = document.createElement("canvas").getContext("2d")!;
    return fonts.map((f) => { ctx.font = f; return ctx.measureText(text).width; });
  }, { text, fonts });
}

test("Newsreader, Instrument Sans and DM Mono load from this origin and are what the console renders with", async ({ page }) => {
  const fontResponses: { url: string; status: number }[] = [];
  page.on("response", (r) => { if (/\.woff2?(\?|$)/.test(r.url())) fontResponses.push({ url: r.url(), status: r.status() }); });
  await openStep(page, "map");
  await expect(page.getByTestId("area-map").locator("canvas").first()).toBeVisible();
  await page.getByTestId("area-map").hover(); // the status line (DM Mono) appears with the pointer
  await expect(page.getByTestId("status-line")).toContainText("elev");

  const all = await faces(page);
  for (const family of FAMILIES) expect(all.some((f) => f.family === family && f.style === "normal" && f.status === "loaded"), `${family}: ${JSON.stringify(all)}`).toBe(true);
  expect(all.filter((f) => f.status === "error")).toEqual([]);

  const origin = new URL(page.url()).origin;
  expect(fontResponses.length).toBeGreaterThan(0);
  for (const r of fontResponses) { expect(r.url.startsWith(origin), r.url).toBe(true); expect(r.status).toBe(200); }

  await expect(page.locator("body")).toHaveCSS("font-family", /^"Instrument Sans Variable"/);
  await expect(page.getByTestId("status-line")).toHaveCSS("font-family", /^"DM Mono"/);
  await expect(page.locator(".side-head h1")).toHaveCSS("font-family", /^"Newsreader Variable"/);

  const [serif, serifFallback, sans, sansFallback, mono, monoFallback] = await widths(page, "Slope-screened route 0123456789", [
    '15px "Newsreader Variable", serif', "15px serif", '15px "Instrument Sans Variable", sans-serif', "15px sans-serif",
    '13px "DM Mono", monospace', "13px monospace"]);
  expect(serif).not.toBe(serifFallback);
  expect(sans).not.toBe(sansFallback);
  expect(mono).not.toBe(monoFallback);

  // Coordinates, tables and readouts use DM Mono: every digit has the same advance.
  const w = await widths(page, "0", ['13px "DM Mono"']);
  for (const d of "123456789") expect((await widths(page, d, ['13px "DM Mono"']))[0], `DM Mono digit ${d}`).toBeCloseTo(w[0]!, 3);
});

test("if the font files cannot load, the console falls back to system fonts and keeps working", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.route(/\.woff2?(\?|$)/, (r) => r.abort());
  await openStep(page, "map");
  await expect(page.getByTestId("area-map").locator("canvas").first()).toBeVisible();
  const all = await faces(page);
  expect(all.some((f) => f.status === "loaded"), JSON.stringify(all)).toBe(false);
  // Text is still shown and the console still works: move between steps with the keyboard and back.
  await expect(page.getByText("Independent student project; not affiliated with or endorsed by NASA.")).toBeVisible();
  const steps = page.getByRole("navigation", { name: "Mission steps" });
  await steps.getByRole("button", { name: "Brief", exact: true }).focus();
  await page.keyboard.press("Enter");
  await expect(steps.getByRole("button", { name: "Brief", exact: true })).toHaveAttribute("aria-current", "step");
  await goStep(page, "Map");
  await expect(page.getByLabel("Plan", { exact: true })).toContainText("No stops yet.");
  expect(errors).toEqual([]);
});

test("if only the .woff2 files fail, DM Mono's .woff fallback still loads", async ({ page }) => {
  await page.route(/\.woff2(\?|$)/, (r) => r.abort());
  await openStep(page, "map");
  await expect(page.getByTestId("area-map").locator("canvas").first()).toBeVisible();
  await page.getByTestId("area-map").hover();
  const all = await faces(page);
  // The variable packages ship woff2 only (format woff2-variations); their fallback is the system stack.
  expect(all.some((f) => f.family === "DM Mono" && f.weight === "400" && f.status === "loaded"), JSON.stringify(all)).toBe(true);
});
