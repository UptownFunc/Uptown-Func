// SI-assisted: drafted with Claude Code (Claude Opus 5.5) (3D-01..3D-07); human review pending.
// The 3D view through real input only (clicks, keys, the pointer, window size). The 3D view publishes, read only,
// where the habitat, the stops, the sheet's corners and the hover marker are on screen (data-marks, data-hover) and the
// camera's range and pitch (data-range, data-pitch); the tests point and click at those pixels like a user would.
// Rendering runs on the container's software WebGL (SwiftShader), so waits are generous.
import { expect, test, type Page } from "@playwright/test";
import { STOP, clickAt, goStep, mapView, openStep } from "./helpers";

test.setTimeout(150_000);

const scene = (page: Page) => page.locator(".scene3d-canvas");
async function open3d(page: Page): Promise<void> {
  await page.getByRole("button", { name: "3D", exact: true }).click();
  await expect(page.getByTestId("scene-3d")).toHaveAttribute("data-tiles", "true", { timeout: 90_000 });
}
async function marks(page: Page): Promise<Record<string, [number, number] | null>> {
  return JSON.parse((await scene(page).getAttribute("data-marks")) ?? "{}");
}
const num = async (page: Page, attr: string) => Number(await scene(page).getAttribute(attr));
const ready = async (page: Page) => {
  await expect(page.getByTestId("area-map").locator("canvas").first()).toBeVisible({ timeout: 20_000 });
  await expect.poll(() => page.locator(".app").getAttribute("data-busy"), { timeout: 20_000 }).toBe("false");
};
async function withStop(page: Page): Promise<void> {
  await openStep(page, "map");
  await ready(page);
  await clickAt(page, STOP);
  await expect(page.locator(".stops > .stop")).toHaveCount(1, { timeout: 20_000 });
}

test("2D to 3D and back: the plan, the 2D view, the layer switches and the step are kept; Cesium loads only in 3D", async ({ page }) => {
  const cesium: string[] = [];
  page.on("request", (r) => { if (/cesium-1\.147\.0\/Cesium\.js|view3d-/.test(r.url())) cesium.push(r.url()); });
  await withStop(page);
  expect(cesium).toEqual([]); // nothing of the 3D view is fetched until the user asks for it
  const view2d = await mapView(page);
  await page.getByRole("button", { name: "Layers", exact: true }).click();
  await page.locator("#layers-panel").getByRole("checkbox", { name: /^Terrain classes/ }).uncheck();
  await page.getByRole("button", { name: "Close panel" }).click();
  await open3d(page);
  expect(cesium.length).toBe(2);
  await expect(page.getByTestId("scene-3d")).toHaveAttribute("data-ready", "true");
  await expect(scene(page)).toHaveAttribute("data-layers", "relief"); // terrain classes stay off, relief on
  const m = await marks(page);
  expect(m.habitat).toBeTruthy();
  expect(Object.keys(m).filter((k) => k.startsWith("S"))).toHaveLength(1);
  await page.getByRole("button", { name: "2D", exact: true }).click();
  await expect(page.getByTestId("scene-3d")).toHaveCount(0);
  expect(await mapView(page)).toEqual(view2d);
  await expect(page.locator(".stops > .stop")).toHaveCount(1);
  await page.getByRole("button", { name: "Layers", exact: true }).click();
  await expect(page.locator("#layers-panel").getByRole("checkbox", { name: /^Terrain classes/ })).not.toBeChecked();
  await expect(page).toHaveURL(/#map$/);
});

test("the home view holds the whole sheet; the keys zoom, rotate, tilt and reset the camera", async ({ page }) => {
  await withStop(page);
  await open3d(page);
  const box = (await scene(page).boundingBox())!;
  const m = await marks(page);
  for (const k of ["corner0", "corner1", "corner2", "corner3", "habitat"]) {
    const p = m[k]!;
    expect(p && p[0] > 0 && p[0] < box.width && p[1] > 0 && p[1] < box.height, `${k} on screen at home`).toBe(true);
  }
  const range0 = await num(page, "data-range"), pitch0 = await num(page, "data-pitch");
  expect(pitch0).toBeLessThan(-30);
  await page.getByRole("button", { name: "Zoom in", exact: true }).click();
  await expect.poll(() => num(page, "data-range")).toBeLessThan(range0 * 0.8);
  const before = (await marks(page)).habitat!;
  await page.getByRole("button", { name: "Rotate left", exact: true }).click();
  await expect.poll(async () => JSON.stringify((await marks(page)).habitat)).not.toBe(JSON.stringify(before));
  await page.getByRole("button", { name: "Tilt towards the horizon", exact: true }).click();
  await expect.poll(() => num(page, "data-pitch")).toBeGreaterThan(pitch0 + 5);
  await page.getByRole("button", { name: "Reset the view", exact: true }).click();
  // The glide ends within 1 % of the home range (Cesium's flight lands a few metres from the exact placement).
  await expect.poll(async () => Math.abs(await num(page, "data-range") - range0) / range0, { timeout: 5_000 }).toBeLessThan(0.01);
  await expect.poll(() => num(page, "data-pitch")).toBeCloseTo(pitch0, 0);
});

test("anchoring: pointing at the stop's marker reads the stop's own coordinates; a click on it selects that stop", async ({ page }) => {
  await withStop(page);
  await open3d(page);
  const box = (await scene(page).boundingBox())!;
  const [x, y] = Object.entries(await marks(page)).find(([k]) => k.startsWith("S"))![1]!;
  await page.mouse.move(box.x + x, box.y + y);
  const status = page.getByTestId("status-line-3d");
  await expect.poll(async () => {
    const t = (await status.textContent()) ?? "";
    const lat = /lat (-?\d+\.\d+)/.exec(t), lon = /lon (-?\d+\.\d+)/.exec(t);
    return lat && lon ? Math.max(Math.abs(Number(lat[1]) - STOP.lat), Math.abs(Number(lon[1]) - STOP.lon)) : Infinity;
  }, { timeout: 10_000 }).toBeLessThan(2e-4); // within about 12 m at the home view's range
  await expect(status).toContainText(/elev -3\d{3}\.\d m/);
  await page.mouse.click(box.x + x, box.y + y);
  await expect(page.locator(".stops > .stop[data-picked]")).toHaveCount(1);
});

test("the profile and the 3D route scrub together; the profile shows distance, elevation and grade", async ({ page }) => {
  await withStop(page);
  await open3d(page);
  const plot = page.getByTestId("profile").locator("svg");
  const pb = (await plot.boundingBox())!;
  await page.mouse.move(pb.x + pb.width * 0.3, pb.y + pb.height / 2);
  await expect(page.getByTestId("profile-readout")).toContainText(/s \d+ m/);
  await expect(page.getByTestId("profile-grade")).toContainText(/grade \d+\.\d°/);
  await expect.poll(async () => (await scene(page).getAttribute("data-hover")) ?? "").toMatch(/^\d+ \d+$/);
  const [hx, hy] = ((await scene(page).getAttribute("data-hover"))!).split(" ").map(Number);
  // Leave the profile, then point at the route in 3D where the marker was: the profile follows the 3D pointer.
  await page.mouse.move(pb.x + pb.width * 0.3, pb.y - 300);
  const box = (await scene(page).boundingBox())!;
  await page.mouse.move(box.x + hx!, box.y + hy!);
  await expect(page.getByTestId("profile-readout")).toContainText(/s \d+ m/, { timeout: 10_000 });
  // Adding a stop from 3D, as a user does: point near the route until the readout says the ground is slope-screened
  // (at this range one pixel spans several metres), then click there.
  const status = page.getByTestId("status-line-3d");
  let spot: [number, number] | null = null;
  for (const [dx, dy] of [[0, 0], [0, -3], [3, 0], [0, 3], [-3, 0], [4, -4], [-4, 4], [6, 0], [0, 6], [-6, 0], [0, -6]] as const) {
    await page.mouse.move(box.x + hx! + dx, box.y + hy! + dy);
    await page.waitForTimeout(250);
    if ((await status.textContent())?.includes("Slope-screened ground")) { spot = [hx! + dx, hy! + dy]; break; }
  }
  expect(spot, "slope-screened ground next to the route").not.toBeNull();
  await page.mouse.click(box.x + spot![0], box.y + spot![1]);
  await expect(page.locator(".stops > .stop")).toHaveCount(2, { timeout: 20_000 });
});

test("layers in 3D: the terrain-class symbols switch and take the strength slider; relief switches the base image", async ({ page }) => {
  await withStop(page);
  await open3d(page);
  await expect(scene(page)).toHaveAttribute("data-layers", "relief terrain");
  await page.getByRole("button", { name: "Layers", exact: true }).click();
  const panel = page.locator("#layers-panel");
  await expect(panel).toContainText("In 3D: elevation contours, time-to-habitat lines and the sky layer are drawn on the 2D sheet only.");
  const strength = panel.getByRole("slider", { name: "Symbol and contour strength" });
  await strength.focus();
  await page.keyboard.press("Home");
  await expect(scene(page)).toHaveAttribute("data-overlay", "0.25");
  await panel.getByRole("checkbox", { name: /^Terrain classes/ }).uncheck();
  await expect(scene(page)).toHaveAttribute("data-layers", "relief");
  await panel.getByRole("checkbox", { name: /^Hillshade/ }).uncheck();
  await expect(scene(page)).toHaveAttribute("data-layers", "plain", { timeout: 20_000 });
});

// 3D-09: the 3D view's own pixels, read from its WebGL canvas (the drawing buffer is kept), so the page's chrome never
// enters a comparison. `grab` waits for the loaded tiles and a canvas unchanged over two reads, then keeps the frame.
async function grab(page: Page, name: string): Promise<void> {
  await expect(page.getByTestId("scene-3d")).toHaveAttribute("data-tiles", "true", { timeout: 90_000 });
  const read = () => page.evaluate((n) => {
    const c = document.querySelector(".scene3d-canvas canvas") as HTMLCanvasElement, x = document.createElement("canvas");
    x.width = c.width; x.height = c.height; const g = x.getContext("2d")!; g.drawImage(c, 0, 0);
    const d = g.getImageData(0, 0, x.width, x.height), w = window as unknown as { frames3d?: Record<string, ImageData> };
    (w.frames3d ??= {})[n] = d;
    let h = 0; for (let k = 0; k < d.data.length; k += 61) h = (h * 31 + d.data[k]!) >>> 0;
    return h;
  }, name);
  let last = await read(), same = 0;
  for (let i = 0; i < 80 && same < 2; i++) { await page.waitForTimeout(350); const h = await read(); same = h === last ? same + 1 : 0; last = h; }
  expect(same, `${name}: the 3D view settles`).toBe(2);
}
/** Per pixel (each channel of `base` at least 12): the shade factor f = sum(b) / sum(base), how far b strays from
 *  f * base in any channel (0 when the change is the same factor for R, G and B), the share of pixels where any channel
 *  got brighter, the largest per-channel difference, and the correlation of f with the factor of a third frame, over the
 *  pixels that frame changes (the hillshade image covers the sheet only, not the flat floor around it). */
function compare(page: Page, base: string, b: string, other?: string) {
  return page.evaluate(([base, b, other]) => {
    const F = (window as unknown as { frames3d: Record<string, ImageData> }).frames3d, A = F[base!]!.data, B = F[b!]!.data, O = other ? F[other]!.data : null;
    const f: number[] = [], fo: number[] = [], fc: number[] = [], resid: number[] = [];
    let brighter = 0, maxDiff = 0, n = 0;
    for (let k = 0; k < A.length; k += 4) {
      for (let c = 0; c < 3; c++) maxDiff = Math.max(maxDiff, Math.abs(A[k + c]! - B[k + c]!));
      if (Math.min(A[k]!, A[k + 1]!, A[k + 2]!) < 12) continue;
      n++;
      const r = (B[k]! + B[k + 1]! + B[k + 2]!) / (A[k]! + A[k + 1]! + A[k + 2]!);
      f.push(r); resid.push(Math.max(...[0, 1, 2].map((c) => Math.abs(B[k + c]! - r * A[k + c]!))));
      if ([0, 1, 2].some((c) => B[k + c]! > A[k + c]! + 2)) brighter++;
      if (O && [0, 1, 2].some((c) => O[k + c] !== A[k + c])) { fo.push((O[k]! + O[k + 1]! + O[k + 2]!) / (A[k]! + A[k + 1]! + A[k + 2]!)); fc.push(r); }
    }
    const q = (a: number[], p: number) => [...a].sort((x, y) => x - y)[Math.floor(p * (a.length - 1))]!;
    let corr = NaN;
    if (O) {
      const m = (a: number[]) => a.reduce((s, v) => s + v, 0) / a.length, mf = m(fc), mo = m(fo);
      let sxy = 0, sx = 0, sy = 0;
      fc.forEach((v, i) => { sxy += (v - mf) * (fo[i]! - mo); sx += (v - mf) ** 2; sy += (fo[i]! - mo) ** 2; });
      corr = sxy / Math.sqrt(sx * sy);
    }
    return { n, maxDiff, brighter: brighter / n, f001: q(f, 0.001), f01: q(f, 0.01), f50: q(f, 0.5), resid99: q(resid, 0.99), corr };
  }, [base, b, other] as const);
}

test("relief lighting (3D-09): shades the terrain once, keeps the D2 colour, and leaves the plan, the picks and the hillshade as they were", async ({ page }) => {
  await withStop(page);
  await open3d(page);
  const lighting = page.getByRole("button", { name: "Relief lighting", exact: true });
  await expect(lighting).toHaveAttribute("aria-pressed", "false"); // off by default: the 3D view opens as before
  // Close enough that the terrain mesh carries the relief (at the home view it is coarser than the 1 m hillshade).
  await page.getByRole("button", { name: "Zoom in", exact: true }).click();
  await page.getByRole("button", { name: "Zoom in", exact: true }).click();
  const layer = async (name: RegExp, on: boolean) => {
    await page.getByRole("button", { name: "Layers", exact: true }).click();
    const box = page.locator("#layers-panel").getByRole("checkbox", { name });
    await (on ? box.check() : box.uncheck());
    await page.getByRole("button", { name: "Close panel" }).click();
    await page.mouse.move(2, 2); // the pointer off the view: no readout pick, no scrub marker
  };
  await layer(/^Terrain classes/, false); // the D2 image alone under the relief
  await expect(scene(page)).toHaveAttribute("data-layers", "relief");
  await grab(page, "hillshade");
  const marks0 = await scene(page).getAttribute("data-marks");
  await layer(/^Hillshade/, false);
  await expect(scene(page)).toHaveAttribute("data-layers", "plain", { timeout: 20_000 });
  await grab(page, "plain");

  await lighting.click();
  await page.mouse.move(2, 2);
  await expect(lighting).toHaveAttribute("aria-pressed", "true");
  await expect(scene(page)).toHaveAttribute("data-layers", "plain lit");
  await expect(page.getByTestId("status-line-3d")).toContainText("Lit from the north-west, 45° up, as the hillshade; not the sun.");
  await grab(page, "lit");
  const lit = await compare(page, "plain", "lit", "hillshade");
  expect(lit.n).toBeGreaterThan(50_000);
  expect(lit.brighter, "the lighting only darkens").toBeLessThan(0.001);
  expect(lit.resid99, "one factor for R, G and B: no tint").toBeLessThanOrEqual(2.5);
  expect(lit.f50, "level ground keeps most of its brightness").toBeGreaterThan(0.82);
  expect(lit.f50).toBeLessThan(0.97);
  expect(lit.f01, "ridges and valleys are shaded").toBeLessThan(0.8);
  expect(lit.f001, "never darker than the strength allows (0.6)").toBeGreaterThan(0.55);
  expect(lit.corr, "the same light as the D1 hillshade: the two shade the same ground").toBeGreaterThan(0.5);
  // Geometry, imagery placement and overlays are untouched: same marker and corner pixels, same marker colour.
  expect(await scene(page).getAttribute("data-marks")).toBe(marks0);
  const at = Object.entries(JSON.parse(marks0!) as Record<string, [number, number] | null>).find(([k]) => k.startsWith("S"))![1]!;
  const px = (name: string) => page.evaluate(([n, x, y]) => {
    const d = (window as unknown as { frames3d: Record<string, ImageData> }).frames3d[n as string]!;
    return Array.from(d.data.slice(((y as number) * d.width + (x as number)) * 4, ((y as number) * d.width + (x as number)) * 4 + 3));
  }, [name, at[0], at[1]] as const);
  expect(await px("lit")).toEqual(await px("plain"));

  // The Hillshade switch on under the lighting adds nothing: the relief is never counted twice.
  await layer(/^Hillshade/, true);
  await expect(scene(page)).toHaveAttribute("data-layers", "plain lit");
  await grab(page, "lit+hillshade");
  expect((await compare(page, "lit", "lit+hillshade")).maxDiff).toBeLessThanOrEqual(1);
  // A pick through the lit view names the stop's own ground (the lighting changes no depth).
  const box = (await scene(page).boundingBox())!;
  await page.mouse.move(box.x + at[0], box.y + at[1]);
  await expect.poll(async () => {
    const t = (await page.getByTestId("status-line-3d").textContent()) ?? "";
    const lat = /lat (-?\d+\.\d+)/.exec(t), lon = /lon (-?\d+\.\d+)/.exec(t);
    return lat && lon ? Math.max(Math.abs(Number(lat[1]) - STOP.lat), Math.abs(Number(lon[1]) - STOP.lon)) : Infinity;
  }, { timeout: 10_000 }).toBeLessThan(2e-4);
  await page.mouse.move(2, 2);

  // Lighting off: the hillshade image returns exactly as it was.
  await lighting.click();
  await page.mouse.move(2, 2);
  await expect(lighting).toHaveAttribute("aria-pressed", "false");
  await expect(scene(page)).toHaveAttribute("data-layers", "relief");
  await grab(page, "hillshade again");
  expect((await compare(page, "hillshade", "hillshade again")).maxDiff).toBeLessThanOrEqual(1);
});

test("missing 3D library: the app says why and stays on the 2D sheet, which keeps working", async ({ page }) => {
  await page.route("**/cesium-1.147.0/Cesium.js", (r) => r.fulfill({ status: 404, body: "" }));
  await withStop(page);
  await page.getByRole("button", { name: "3D", exact: true }).click();
  await expect(page.getByTestId("engine-announce")).toHaveText("3D view unavailable: the 3D library could not be downloaded. Showing the 2D sheet.", { timeout: 30_000 });
  await expect(page.getByTestId("scene-3d")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "2D", exact: true })).toHaveAttribute("aria-pressed", "true");
  await page.unroute("**/cesium-1.147.0/Cesium.js");
  await open3d(page); // the next attempt loads it
});

test("missing D2 colour: the 3D view says so and drapes the D2 luminance, never a stand-in", async ({ page }) => {
  await page.route("**/area/d2_colour.json", (r) => r.fulfill({ status: 404, body: "" }));
  await withStop(page);
  await open3d(page);
  await expect(page.getByTestId("scene-3d-notes")).toContainText("D2 colour not available: the image is the D2 luminance (grey)");
  await expect(page.locator(".scene3d-attrib")).toContainText("luminance");
});

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });
  test("Reset jumps straight to the home view", async ({ page }) => {
    await withStop(page);
    await open3d(page);
    const range0 = await num(page, "data-range");
    await page.getByRole("button", { name: "Zoom in", exact: true }).click();
    await expect.poll(() => num(page, "data-range")).toBeLessThan(range0 * 0.8);
    await page.getByRole("button", { name: "Reset the view", exact: true }).click();
    await expect.poll(() => num(page, "data-range"), { timeout: 400, intervals: [20] }).toBeCloseTo(range0, -1);
  });
});

test.describe("phone", () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  test("3D opens on a phone; its keys sit inside the plate and nothing scrolls sideways", async ({ page }) => {
    await openStep(page, "map");
    await ready(page);
    await open3d(page);
    const plate = (await scene(page).boundingBox())!;
    for (const name of ["Zoom in", "Reset the view", "Relief lighting"]) {
      const b = (await page.getByRole("button", { name, exact: true }).boundingBox())!;
      expect(b.x >= plate.x && b.x + b.width <= plate.x + plate.width && b.y >= plate.y && b.y + b.height <= plate.y + plate.height, `${name} inside`).toBe(true);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0);
    await goStep(page, "Assess");
    await expect(page.getByTestId("scene-3d")).toBeVisible(); // the 3D view stays with the plate on the map steps
  });
});
