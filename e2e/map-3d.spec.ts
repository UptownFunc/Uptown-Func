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
  await expect(panel).toContainText("In 3D: elevation contours, time-to-habitat lines, the sky layer and the crew progress mark are drawn on the 2D sheet only.");
  const strength = panel.getByRole("slider", { name: "Symbol and contour strength" });
  await strength.focus();
  await page.keyboard.press("Home");
  await expect(scene(page)).toHaveAttribute("data-overlay", "0.25");
  await panel.getByRole("checkbox", { name: /^Terrain classes/ }).uncheck();
  await expect(scene(page)).toHaveAttribute("data-layers", "relief");
  await panel.getByRole("checkbox", { name: /^Hillshade/ }).uncheck();
  await expect(scene(page)).toHaveAttribute("data-layers", "plain", { timeout: 20_000 });
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
    for (const name of ["Zoom in", "Reset the view"]) {
      const b = (await page.getByRole("button", { name, exact: true }).boundingBox())!;
      expect(b.x >= plate.x && b.x + b.width <= plate.x + plate.width && b.y >= plate.y && b.y + b.height <= plate.y + plate.height, `${name} inside`).toBe(true);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0);
    await goStep(page, "Assess");
    await expect(page.getByTestId("scene-3d")).toBeVisible(); // the 3D view stays with the plate on the map steps
  });
});
