// SI-assisted: drafted with Claude Code (Claude Opus 5.5); human Design review pending.
// Plan 9 type: IBM Plex Sans for interface text, IBM Plex Mono for numbers, coordinates and times, with tabular
// figures; installed from npm inside the repository (plan on-the-day list), so served from our own origin.
// A successful build is not proof: these checks run in the browser. Nothing in the page is changed by the test.
import { expect, test, type Page } from "@playwright/test";

/** Every IBM Plex FontFace the page knows, with its load status (read from document.fonts after it settles). */
async function plexFaces(page: Page) {
  return page.evaluate(async () => {
    await document.fonts.ready;
    return [...document.fonts].filter((f) => f.family.replace(/["']/g, "").startsWith("IBM Plex"))
      .map((f) => ({ family: f.family.replace(/["']/g, ""), weight: f.weight, style: f.style, status: f.status }));
  });
}

/** Text width in a detached canvas: differs from the fallback only if the named font is really in use. */
async function widths(page: Page, text: string, fonts: string[]) {
  return page.evaluate(({ text, fonts }) => {
    const ctx = document.createElement("canvas").getContext("2d")!;
    return fonts.map((f) => { ctx.font = f; return ctx.measureText(text).width; });
  }, { text, fonts });
}

test("IBM Plex Sans and Mono load from this origin and are what the console renders with", async ({ page }) => {
  const fontResponses: { url: string; status: number }[] = [];
  page.on("response", (r) => { if (/\.woff2?(\?|$)/.test(r.url())) fontResponses.push({ url: r.url(), status: r.status() }); });
  await page.goto("/?preset=none");
  await expect(page.getByTestId("area-map").locator("canvas").first()).toBeVisible();
  await page.getByTestId("area-map").hover(); // the status line (Plex Mono) appears with the pointer
  await expect(page.getByTestId("status-line")).toContainText("elev");

  const faces = await plexFaces(page);
  const loaded = (family: string, weight: string) => faces.some((f) => f.family === family && f.weight === weight && f.style === "normal" && f.status === "loaded");
  expect(loaded("IBM Plex Sans", "400"), JSON.stringify(faces)).toBe(true);
  expect(loaded("IBM Plex Sans", "600"), JSON.stringify(faces)).toBe(true); // headings and the wordmark
  expect(loaded("IBM Plex Mono", "400"), JSON.stringify(faces)).toBe(true);
  expect(faces.filter((f) => f.status === "error")).toEqual([]);

  // Served by us (npm package bundled by Vite), never from a font CDN.
  const origin = new URL(page.url()).origin;
  expect(fontResponses.length).toBeGreaterThan(0);
  for (const r of fontResponses) { expect(r.url.startsWith(origin), r.url).toBe(true); expect(r.status).toBe(200); }

  // The console's own elements resolve to Plex first.
  await expect(page.locator("body")).toHaveCSS("font-family", /^"IBM Plex Sans"/);
  await expect(page.getByTestId("status-line")).toHaveCSS("font-family", /^"IBM Plex Mono"/);

  // Rendering proof: Plex changes text widths against the generic fallbacks.
  const [sans, sansFallback, mono, monoFallback] = await widths(page, "Slope-screened route 0123456789", [
    '13px "IBM Plex Sans", sans-serif', "13px sans-serif", '13px "IBM Plex Mono", monospace', "13px monospace"]);
  expect(sans).not.toBe(sansFallback);
  expect(mono).not.toBe(monoFallback);

  // Tabular figures: every digit has the same advance in Plex Sans and Plex Mono (CLAUDE.md, plan 9).
  for (const font of ['13px "IBM Plex Sans"', '13px "IBM Plex Mono"']) {
    const w = await widths(page, "0", [font]);
    for (const d of "123456789") expect((await widths(page, d, [font]))[0], `${font} digit ${d}`).toBeCloseTo(w[0]!, 3);
  }
});

test("if the font files cannot load, the console falls back to system fonts and keeps working", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  // Both formats: each face lists a .woff fallback after its .woff2 (Fontsource CSS).
  await page.route(/\.woff2?(\?|$)/, (r) => r.abort());
  await page.goto("/?preset=none");
  await expect(page.getByTestId("area-map").locator("canvas").first()).toBeVisible();
  const faces = await plexFaces(page);
  expect(faces.some((f) => f.status === "loaded"), JSON.stringify(faces)).toBe(false);
  // Text is still shown and the console still works: switch views with the keyboard and back.
  await expect(page.getByText("Independent student project; not affiliated with or endorsed by NASA.")).toBeVisible();
  const views = page.getByRole("navigation", { name: "Views" });
  await views.getByRole("button", { name: "Briefing" }).focus();
  await page.keyboard.press("Enter");
  await expect(views.getByRole("button", { name: "Briefing" })).toHaveAttribute("aria-pressed", "true");
  await views.getByRole("button", { name: "Planning" }).click();
  await expect(page.getByLabel("Plan", { exact: true })).toContainText("No stops yet.");
  expect(errors).toEqual([]);
});

test("if only the .woff2 files fail, the .woff fallback still loads IBM Plex", async ({ page }) => {
  await page.route(/\.woff2(\?|$)/, (r) => r.abort());
  await page.goto("/?preset=none");
  await expect(page.getByTestId("area-map").locator("canvas").first()).toBeVisible();
  const faces = await plexFaces(page);
  expect(faces.some((f) => f.family === "IBM Plex Sans" && f.weight === "400" && f.status === "loaded"), JSON.stringify(faces)).toBe(true);
});
