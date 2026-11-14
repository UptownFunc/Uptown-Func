// SI-assisted: drafted with Claude Code (Claude Opus 5.5); human Design review pending.
// Plan 7.8: "symbols and line weights are fixed in screen pixels"; plan 9.2: slope 15-20 deg amber diagonal hatch,
// known exclusion neutral cross-hatch, unknown stipple. Defect being fixed (logged by the 2.6 part 1 session):
// "The hatch patterns alias at coarse zoom". A hatch drawn in screen pixels puts every ink pixel of a symbol on one
// lattice at every zoom: amber on (x + y) mod 6, neutral on (x + y) or (x - y) mod 6, stipple on a 4 px grid.
// Static symbols: no animation, the same pixels with reduced motion. Driven by the zoom buttons, the wheel and a drag.
import { expect, test, type Page } from "@playwright/test";
import { STOP, clickAt } from "./helpers";

interface Lattice { amber: number; neutral: number; bone: number; offLattice: string[] }

/** Classify the terrain layer's own canvas pixels by symbol colour and test each against its screen lattice. */
async function hatchLattice(page: Page): Promise<Lattice> {
  return page.locator(".layer-terrain canvas").first().evaluate((c: HTMLCanvasElement) => {
    const ctx = c.getContext("2d")!, { width: w, height: h } = c, d = ctx.getImageData(0, 0, w, h).data;
    const near = (i: number, r: number, g: number, b: number) => Math.abs(d[i]! - r) <= 2 && Math.abs(d[i + 1]! - g) <= 2 && Math.abs(d[i + 2]! - b) <= 2;
    const mod = (v: number, m: number) => ((v % m) + m) % m;
    const amberRes = new Set<number>(), neutralSum = new Set<number>(), neutralDiff = new Set<number>(), boneX = new Set<number>(), boneY = new Set<number>();
    let amber = 0, neutral = 0, bone = 0;
    const neutralPx: [number, number][] = [];
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = 4 * (y * w + x);
      if (d[i + 3] === 0) continue;
      if (near(i, 0xe8, 0xb3, 0x41)) { amber++; amberRes.add(mod(x + y, 6)); }
      else if (near(i, 0xae, 0xb5, 0xb3)) { neutral++; neutralPx.push([x, y]); }
      else if (near(i, 0xe8, 0xe1, 0xd5)) { bone++; boneX.add(mod(x, 4)); boneY.add(mod(y, 4)); }
    }
    // Cross-hatch: two line families; every neutral pixel must be on one of them. Take the commonest residues.
    const count = (f: (p: [number, number]) => number) => { const m = new Map<number, number>(); for (const p of neutralPx) m.set(f(p), (m.get(f(p)) ?? 0) + 1); return [...m].sort((a, b) => b[1] - a[1])[0]?.[0]; };
    const s0 = count(([x, y]) => mod(x + y, 6)), d0 = count(([x, y]) => mod(x - y, 6));
    for (const [x, y] of neutralPx) { if (mod(x + y, 6) !== s0 && mod(x - y, 6) !== d0) { neutralSum.add(mod(x + y, 6)); neutralDiff.add(mod(x - y, 6)); } }
    const offLattice: string[] = [];
    if (amberRes.size > 1) offLattice.push(`amber on ${amberRes.size} diagonal residues`);
    if (neutralSum.size > 0) offLattice.push(`neutral off both diagonals (${neutralSum.size} residues)`);
    if (boneX.size > 1 || boneY.size > 1) offLattice.push(`stipple on ${boneX.size} x ${boneY.size} grid residues`);
    return { amber, neutral, bone, offLattice };
  });
}

function watch(page: Page) {
  const problems: string[] = [];
  page.on("pageerror", (e) => problems.push(`pageerror: ${e.message}`));
  page.on("console", (m) => { if (m.type() === "error") problems.push(`console: ${m.text()} [${m.location().url}]`); });
  page.on("requestfailed", (r) => problems.push(`requestfailed: ${r.url()}`));
  page.on("response", (r) => { if (r.status() >= 400) problems.push(`${r.status()}: ${r.url()}`); });
  return problems;
}

/** Waits until the terrain canvas shows all three symbols on their lattices (re-rendered after a view change). */
async function expectScreenLattice(page: Page, what: string) {
  await expect.poll(async () => {
    const l = await hatchLattice(page);
    return l.amber > 0 && l.neutral > 0 && l.offLattice.length === 0 ? "ok" : JSON.stringify(l);
  }, { message: `hatch on its screen lattice ${what}`, timeout: 10_000 }).toBe("ok");
}

test("the hatch stays on its screen-pixel lattice at every zoom and after a drag", async ({ page }) => {
  const problems = watch(page);
  await page.goto("/");
  const map = page.getByTestId("area-map");
  await expect(map.locator("canvas").first()).toBeVisible();
  await expectScreenLattice(page, "at the 4 m/px load view");
  const zoomIn = page.getByTitle("Zoom in"), zoomOut = page.getByTitle("Zoom out");
  for (let i = 0; i < 2; i++) await zoomOut.click();
  await expectScreenLattice(page, "zoomed out to 16 m/px");
  for (let i = 0; i < 5; i++) await zoomIn.click();
  await expectScreenLattice(page, "zoomed in to 0.5 m/px");
  // Wheel zoom lands on fractional resolutions; drag pans the sheet.
  const box = (await map.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.wheel(0, 700);
  await expectScreenLattice(page, "after wheel zoom");
  await page.mouse.down();
  for (let i = 1; i <= 10; i++) await page.mouse.move(box.x + box.width / 2 - 13 * i, box.y + box.height / 2 - 7 * i);
  await page.mouse.up();
  await expectScreenLattice(page, "after a drag");
  expect(problems).toEqual([]);
});

test("with reduced motion the hatch is the same static image, and nothing on the sheet animates", async ({ browser }) => {
  const snap = async (reducedMotion: "reduce" | "no-preference") => {
    const ctx = await browser.newContext({ reducedMotion, viewport: { width: 1280, height: 800 } });
    const page = await ctx.newPage();
    await page.goto("/");
    await expect(page.getByTestId("area-map").locator("canvas").first()).toBeVisible();
    await expectScreenLattice(page, `(${reducedMotion})`);
    const pixels = await page.locator(".layer-terrain canvas").first().evaluate((c: HTMLCanvasElement) => {
      const d = c.getContext("2d")!.getImageData(0, 0, c.width, c.height).data;
      let hsh = 0; for (let i = 0; i < d.length; i++) hsh = (Math.imul(hsh, 31) + d[i]!) | 0; return hsh;
    });
    const animations = await page.evaluate(() => document.getAnimations().filter((a) => (a.effect as KeyframeEffect | null)?.target?.closest?.("[data-testid=area-map]")).length);
    await ctx.close();
    return { pixels, animations };
  };
  const reduced = await snap("reduce"), normal = await snap("no-preference");
  expect(reduced.animations).toBe(0);
  expect(normal.animations).toBe(0);
  expect(reduced.pixels).toBe(normal.pixels);
});

test("the hatch does not get in the way: a stop is still placed and the route drawn", async ({ page }) => {
  const problems = watch(page);
  await page.goto("/");
  await expect(page.getByTestId("area-map").locator("canvas").first()).toBeVisible();
  await expectScreenLattice(page, "before placing a stop");
  await clickAt(page, STOP);
  await expect(page.getByTestId("legs")).toBeVisible({ timeout: 20_000 });
  await expectScreenLattice(page, "with the route drawn");
  expect(problems).toEqual([]);
});

test("a terrain mask that fails to load is labelled, draws no partial hatch, and the sheet keeps working", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.route("**/area/terrain_steep.png", (r) => r.fulfill({ status: 404, body: "" }));
  await page.goto("/");
  const map = page.getByTestId("area-map");
  await expect(map.locator("canvas").first()).toBeVisible();
  await expect(page.getByTestId("layer-errors")).toContainText("Terrain classes (slope-screened only, no rock detection) could not be loaded");
  await expect(page.getByLabel("Layers")).toContainText("Terrain classes (slope-screened only, no rock detection) - not loaded");
  const l = await hatchLattice(page);
  expect(l.amber + l.neutral + l.bone).toBe(0); // no half-drawn layer that looks like "no steep ground"
  // Route, readout, contours and coverage still work.
  await expect(map).toHaveAttribute("data-elevation-contours", "290");
  await expect(map).toHaveAttribute("data-coverage-outlines", "2");
  await clickAt(page, STOP);
  await expect(page.getByTestId("legs")).toBeVisible({ timeout: 20_000 });
  const box = (await map.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await expect(page.getByTestId("status-line")).toContainText("elev");
  expect(errors).toEqual([]);
});
