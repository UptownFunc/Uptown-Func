// SI-assisted: drafted with Claude Code (Claude Opus 5.5); rewritten for the UI-08 type system on design/sharpwalk-ui-ux.
// UI-08: Geist (interface and display) and Geist Mono (coordinates and technical identifiers) load from this origin and
// are what the console renders with; the mono's digits are equal width; if the files fail, the console falls back to
// system fonts and keeps working.
import { expect, test, type Page } from "@playwright/test";
import { goStep, openStep } from "./helpers";

const FAMILIES = ["Geist Variable", "Geist Mono Variable"];

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

test("Geist and Geist Mono load from this origin and are what the console renders with", async ({ page }) => {
  const fontResponses: { url: string; status: number }[] = [];
  page.on("response", (r) => { if (/\.woff2?(\?|$)/.test(r.url())) fontResponses.push({ url: r.url(), status: r.status() }); });
  await openStep(page, "map");
  await expect(page.getByTestId("area-map").locator("canvas").first()).toBeVisible();
  await page.getByTestId("area-map").hover(); // the status line (Geist Mono) appears with the pointer
  await expect(page.getByTestId("status-line")).toContainText("elev");

  const all = await faces(page);
  for (const family of FAMILIES) expect(all.some((f) => f.family === family && f.style === "normal" && f.status === "loaded"), `${family}: ${JSON.stringify(all)}`).toBe(true);
  expect(all.filter((f) => f.status === "error")).toEqual([]);

  const origin = new URL(page.url()).origin;
  expect(fontResponses.length).toBeGreaterThan(0);
  for (const r of fontResponses) { expect(r.url.startsWith(origin), r.url).toBe(true); expect(r.status).toBe(200); }

  await expect(page.locator("body")).toHaveCSS("font-family", /^"Geist Variable"/);
  await expect(page.locator("body")).toHaveCSS("font-variant-numeric", "tabular-nums"); // measurements and telemetry line up
  await expect(page.getByTestId("status-line")).toHaveCSS("font-family", /^"Geist Mono Variable"/);
  await expect(page.locator(".side-head h1")).toHaveCSS("font-family", /^"Geist Variable"/);

  const [sans, sansFallback, mono, monoFallback] = await widths(page, "Slope-screened route 0123456789", [
    '15px "Geist Variable", sans-serif', "15px sans-serif", '13px "Geist Mono Variable", monospace', "13px monospace"]);
  expect(sans).not.toBe(sansFallback);
  expect(mono).not.toBe(monoFallback);

  // Coordinates use Geist Mono: every digit has the same advance.
  const w = await widths(page, "0", ['13px "Geist Mono Variable"']);
  for (const d of "123456789") expect((await widths(page, d, ['13px "Geist Mono Variable"']))[0], `Geist Mono digit ${d}`).toBeCloseTo(w[0]!, 3);
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
