// SI-assisted: drafted with Claude Code (Claude Opus 5.5) (MAP-01..MAP-08, TOUR-01, UX-24); human review pending.
// The final 2D map, through real input only (clicks, keys, the pointer, the window size): the load view, the map keys,
// the layer switches, coordinate and layer alignment, keyboard use, reduced motion, missing data and recovery, and the
// orientation tour's answers to navigation. Pixels are read from the layer canvases (read only), never written.
import { readFileSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";
import { HABITAT, ORIGIN, STOP, clickAt, goStep, mapView, openStep, pixelAt } from "./helpers";
import { f7ToF1 } from "../src/geo";

const layers = JSON.parse(readFileSync(new URL("../public/area/layers.json", import.meta.url), "utf8")) as { extentF7: [number, number, number, number] };
const [X0, Y0, X1, Y1] = layers.extentF7;
/** The sheet's corners as F1 points (the extent of every display layer). */
const CORNERS = [[X0, Y0], [X0, Y1], [X1, Y0], [X1, Y1]].map(([x, y]) => f7ToF1({ frame: "F7", x: x!, y: y! }, 0));

function trackErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
  return errors;
}

const ready = async (page: Page) => {
  await expect(page.getByTestId("area-map").locator("canvas").first()).toBeVisible({ timeout: 20_000 });
  await expect.poll(() => page.locator(".app").getAttribute("data-busy"), { timeout: 20_000 }).toBe("false");
};

const inBox = (p: { x: number; y: number }, b: { x: number; y: number; width: number; height: number }) =>
  p.x >= b.x && p.x <= b.x + b.width && p.y >= b.y && p.y <= b.y + b.height;

/** Pixels of one layer's canvas in a box of half-size h round a page point: count, and the mean position of pixels the
 *  test function accepts (page px). */
async function layerPixels(page: Page, cls: string, at: { x: number; y: number }, h: number, kind: "any" | "stop") {
  return page.locator(`.${cls} canvas`).first().evaluate((c: HTMLCanvasElement, a) => {
    const r = c.getBoundingClientRect(), s = c.width / r.width;
    const x0 = Math.round((a.x - r.left) * s) - Math.round(a.h * s), y0 = Math.round((a.y - r.top) * s) - Math.round(a.h * s), n = 2 * Math.round(a.h * s) + 1;
    const d = c.getContext("2d")!.getImageData(x0, y0, n, n).data;
    let count = 0, sx = 0, sy = 0, maxA = 0;
    for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
      const k = 4 * (j * n + i), [R, G, B, A] = [d[k]!, d[k + 1]!, d[k + 2]!, d[k + 3]!];
      // The stop marker's fill (#b94c22) within a small tolerance, or any ink at all.
      const hit = a.kind === "any" ? A > 0 : A > 200 && Math.abs(R - 185) < 30 && Math.abs(G - 76) < 30 && Math.abs(B - 34) < 30;
      if (hit) { count++; sx += i; sy += j; maxA = Math.max(maxA, A); }
    }
    return { count, maxA, x: count ? r.left + (x0 + sx / count) / s : NaN, y: count ? r.top + (y0 + sy / count) / s : NaN };
  }, { ...at, h, kind });
}

test("the load view shows the whole sheet and the habitat; the keys zoom, fit the route and show the whole sheet", async ({ page }) => {
  const errors = trackErrors(page);
  await openStep(page, "map");
  await ready(page);
  const map = page.getByTestId("area-map"), box = (await map.boundingBox())!;
  const load = await mapView(page);
  expect(load.resolution).toBeGreaterThanOrEqual(4);
  // MAP-01: every corner of the sheet and the habitat are on screen at load; the view is centred on the area origin.
  for (const c of CORNERS) expect(inBox(await pixelAt(page, c), box), `corner ${c.lat}, ${c.lon} on screen`).toBe(true);
  const h = await pixelAt(page, HABITAT);
  expect(inBox(h, box)).toBe(true);
  const o = await pixelAt(page, ORIGIN);
  expect(Math.abs(o.x - (box.x + box.width / 2))).toBeLessThan(1);
  // The habitat marker is drawn where the habitat is.
  await expect.poll(async () => (await layerPixels(page, "layer-plan", h, 3, "any")).count).toBeGreaterThan(0);

  // MAP-06: the zoom keys step one zoom level each way about the centre.
  await page.getByRole("button", { name: "Zoom in", exact: true }).click();
  await expect.poll(async () => (await mapView(page)).resolution).toBeCloseTo(load.resolution / 2, 3);
  await page.getByRole("button", { name: "Zoom out", exact: true }).click();
  await expect.poll(async () => (await mapView(page)).resolution).toBeCloseTo(load.resolution, 3);

  // Before any stop the framing key shows the habitat; with a stop it fits the route, closer than the load view.
  await expect(page.getByRole("button", { name: "Show the habitat" })).toBeEnabled();
  await clickAt(page, STOP);
  await expect(page.getByTestId("legs")).toBeVisible({ timeout: 20_000 });
  await page.getByRole("button", { name: "Fit the route" }).click();
  await expect.poll(async () => (await mapView(page)).resolution).toBeLessThan(load.resolution);
  await page.waitForTimeout(600); // let the glide finish before reading pixels
  for (const p of [HABITAT, STOP]) expect(inBox(await pixelAt(page, p), box), "habitat and stop framed").toBe(true);
  await page.getByRole("button", { name: "Show the whole sheet" }).click();
  await expect.poll(async () => (await mapView(page)).resolution, { timeout: 3_000 }).toBeGreaterThan(load.resolution * 0.9);
  await page.waitForTimeout(600);
  for (const c of CORNERS) expect(inBox(await pixelAt(page, c), box)).toBe(true);
  expect(errors).toEqual([]);
});

test("coordinate and layer alignment: the stop lands where it was clicked, the readout agrees, and the image layers share the sheet's edges", async ({ page }) => {
  await openStep(page, "map");
  await ready(page);
  const p = await pixelAt(page, STOP);
  await page.mouse.click(p.x, p.y);
  await expect(page.getByTestId("legs")).toBeVisible({ timeout: 20_000 });
  await page.mouse.move(p.x + 60, p.y + 60); // off the marker, so no hover ring sits over it
  // The marker's orange fill is centred on the clicked pixel (one screen pixel of rounding allowed).
  await expect.poll(async () => {
    const m = await layerPixels(page, "layer-plan", p, 18, "stop");
    return m.count > 200 ? Math.hypot(m.x - p.x, m.y - p.y) : Infinity;
  }, { timeout: 5_000 }).toBeLessThanOrEqual(1.5);
  // The readout under that pixel names the stop's own coordinates.
  await page.mouse.move(p.x, p.y);
  await expect.poll(async () => {
    const t = (await page.getByTestId("status-line").textContent()) ?? "";
    const lat = /lat (-?\d+\.\d+)/.exec(t), lon = /lon (-?\d+\.\d+)/.exec(t);
    return lat && lon ? Math.max(Math.abs(Number(lat[1]) - STOP.lat), Math.abs(Number(lon[1]) - STOP.lon)) : Infinity;
  }).toBeLessThanOrEqual(1.5e-4);
  // The orthophoto and the hillshade end at the same west and north edges: ink 3 px inside, none 3 px outside.
  const v = await mapView(page), box = (await page.getByTestId("area-map").boundingBox())!;
  const west = box.x + box.width / 2 + (X0 - v.x) / v.resolution, north = box.y + box.height / 2 - (Y1 - v.y) / v.resolution;
  const midY = box.y + box.height / 2, midX = box.x + box.width / 2;
  for (const cls of ["layer-d2", "layer-hillshade"]) {
    if (west > box.x + 4) {
      expect((await layerPixels(page, cls, { x: west + 3, y: midY }, 1, "any")).count, `${cls} inside the west edge`).toBeGreaterThan(0);
      expect((await layerPixels(page, cls, { x: west - 3, y: midY }, 1, "any")).count, `${cls} outside the west edge`).toBe(0);
    }
    if (north > box.y + 4) {
      expect((await layerPixels(page, cls, { x: midX, y: north + 3 }, 1, "any")).count, `${cls} inside the north edge`).toBeGreaterThan(0);
      expect((await layerPixels(page, cls, { x: midX, y: north - 3 }, 1, "any")).count, `${cls} outside the north edge`).toBe(0);
    }
  }
});

test("layer switches hide and show layers, the strength slider dims the symbols, and the card names only the layers shown", async ({ page }) => {
  await openStep(page, "map");
  await ready(page);
  await page.getByRole("button", { name: "Layers", exact: true }).click();
  const panel = page.locator("#layers-panel");
  const terrain = panel.getByRole("checkbox", { name: /^Terrain classes/ });
  await expect(terrain).toBeChecked();
  await terrain.uncheck();
  await expect(page.locator(".layer-terrain")).toHaveCount(0);
  await expect(panel.locator('[data-layer="terrain"]')).toHaveAttribute("data-off", "true");
  await terrain.check();
  await expect(page.locator(".layer-terrain")).toHaveCount(1);
  // Strength by keyboard: Home is the weakest offered (25 %), never zero while the switch is on. OpenLayers draws the
  // layer at that alpha (so the briefing snapshot carries it too): the symbols' strongest pixel drops to about a quarter.
  const box = (await page.getByTestId("area-map").boundingBox())!, mid = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
  const strongest = async () => (await layerPixels(page, "layer-terrain", mid, 60, "any")).maxA;
  await expect.poll(strongest).toBeGreaterThan(200);
  const strength = panel.getByRole("slider", { name: "Symbol and contour strength" });
  await strength.focus();
  await page.keyboard.press("Home");
  await expect(strength).toHaveAttribute("aria-valuetext", "25 %");
  await expect.poll(strongest).toBeLessThan(90);
  await expect.poll(strongest).toBeGreaterThan(30);
  // Escape closes the panel and gives focus back to its key.
  await page.keyboard.press("Escape");
  await expect(panel).toHaveAttribute("data-open", "false");
  await expect(page.getByRole("button", { name: "Layers", exact: true })).toBeFocused();
  // Relief off: the briefing card's map does not claim the hillshade.
  await page.getByRole("button", { name: "Layers", exact: true }).click();
  await panel.getByRole("checkbox", { name: /^Hillshade/ }).uncheck();
  await expect(page.locator(".layer-hillshade")).toHaveCount(0);
  await page.getByRole("button", { name: "Close panel" }).click(); // the open panel covers part of the sheet
  await clickAt(page, STOP);
  await expect(page.getByTestId("legs")).toBeVisible({ timeout: 20_000 });
  await goStep(page, "Brief");
  await page.getByRole("button", { name: "Generate card from current plan" }).click();
  const caption = page.getByTestId("briefing-card").locator(".card-map figcaption");
  await expect(caption).toContainText("Orthophoto (D2 colour mosaic, luminance)", { timeout: 20_000 });
  await expect(caption).not.toContainText("Hillshade (D1)");
});

test("keyboard only: the map keys and the layer panel are reached with Tab and work with Enter and Space", async ({ page }) => {
  await openStep(page, "map");
  await ready(page);
  const load = await mapView(page);
  await page.getByTestId("area-map").focus();
  // From the map, Tab reaches the map keys in their visual order.
  const order: string[] = [];
  for (let i = 0; i < 8; i++) {
    await page.keyboard.press("Tab");
    order.push(await page.evaluate(() => document.activeElement?.getAttribute("aria-label") ?? document.activeElement?.textContent ?? ""));
  }
  expect(order).toEqual(expect.arrayContaining(["Zoom in", "Zoom out", "Show the habitat", "Show the whole sheet"]));
  await page.getByRole("button", { name: "Zoom in", exact: true }).focus();
  await page.keyboard.press("Enter");
  await expect.poll(async () => (await mapView(page)).resolution).toBeCloseTo(load.resolution / 2, 3);
  await page.getByRole("button", { name: "Layers", exact: true }).focus();
  await page.keyboard.press("Enter");
  const relief = page.locator("#layers-panel").getByRole("checkbox", { name: /^Hillshade/ });
  await relief.focus();
  await page.keyboard.press("Space");
  await expect(relief).not.toBeChecked();
  await expect(page.locator(".layer-hillshade")).toHaveCount(0);
});

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });
  test("zoom and framing jump straight to their end view, and a new stop is drawn at full size at once", async ({ page }) => {
    await openStep(page, "map");
    await ready(page);
    const load = await mapView(page);
    await page.getByRole("button", { name: "Zoom in", exact: true }).click();
    await expect.poll(async () => (await mapView(page)).resolution, { timeout: 300, intervals: [16] }).toBeCloseTo(load.resolution / 2, 3);
    await page.getByRole("button", { name: "Show the whole sheet" }).click();
    await expect.poll(async () => (await mapView(page)).resolution, { timeout: 300, intervals: [16] }).toBeCloseTo(load.resolution, 1);
    const p = await pixelAt(page, STOP);
    await page.mouse.click(p.x, p.y);
    await expect(page.getByTestId("engine-message")).toContainText("Plan updated", { timeout: 20_000 });
    await page.mouse.move(p.x + 80, p.y + 80);
    // Full size in the first frames: the marker's fill covers most of a 12 px disc (less the letter and the ring).
    const m = await layerPixels(page, "layer-plan", p, 18, "stop");
    expect(m.count).toBeGreaterThan(200);
  });
});

test("missing data: the sheet says what failed, and Try again loads it without reloading the page", async ({ page }) => {
  let fail = true;
  await page.route("**/area/layers.json", (r) => (fail ? r.fulfill({ status: 404, body: "" }) : r.continue()));
  await openStep(page, "map");
  const alert = page.getByRole("alert").filter({ hasText: "Area data could not be loaded" });
  await expect(alert).toBeVisible({ timeout: 20_000 });
  await expect(page.getByTestId("area-map")).toHaveCount(0);
  fail = false;
  await alert.getByRole("button", { name: "Try again" }).click();
  await expect(page.getByTestId("area-map").locator("canvas").first()).toBeVisible({ timeout: 20_000 });
  await expect(alert).toHaveCount(0);
  // The engine had its own files: the plan still works after the sheet recovered.
  await clickAt(page, STOP);
  await expect(page.getByTestId("legs")).toBeVisible({ timeout: 20_000 });
});

test("loading: the sheet says it is loading until the terrain is drawn", async ({ page }) => {
  let release: () => void = () => undefined;
  const gate = new Promise<void>((r) => { release = r; });
  await page.route("**/area/layers.json", async (r) => { await gate; await r.continue(); });
  await openStep(page, "map");
  await expect(page.getByTestId("sheet-loading")).toBeVisible();
  await expect(page.getByTestId("sheet-loading")).toContainText("Loading the terrain sheet");
  await expect(page.getByRole("button", { name: "Zoom in", exact: true })).toBeDisabled();
  release();
  await expect(page.getByTestId("sheet-loading")).toHaveCount(0, { timeout: 20_000 });
  await expect(page.getByRole("button", { name: "Zoom in", exact: true })).toBeEnabled();
});

test("empty HUD and assessment say why and lead to the map", async ({ page }) => {
  await openStep(page, "hud");
  await ready(page);
  await expect(page.getByRole("heading", { name: "No stops in the plan yet." })).toBeVisible();
  await page.getByRole("button", { name: "Place stops on the map" }).click();
  await expect(page).toHaveURL(/#map$/);
  await goStep(page, "Assess");
  await expect(page.getByText("No route yet")).toBeVisible();
  await page.getByRole("button", { name: "Place stops on the map" }).click();
  await expect(page).toHaveURL(/#map$/);
});

test("the tour answers navigation: it opens on the current step, jumps from its progress bar, follows Back, and re-places its card on resize", async ({ page }) => {
  await openStep(page, "map");
  await ready(page);
  await page.getByRole("button", { name: "Orientation" }).click();
  const mapCard = page.getByRole("dialog", { name: "Point and click to place stops" });
  await expect(mapCard.getByLabel("Card 4 of 8")).toBeVisible();
  await expect(page.locator(".tour-ring")).toHaveCount(1);
  // A pointer user jumps straight to card 7 from the progress bar; the step comes with it.
  await page.getByRole("button", { name: "Card 7: Judge the return margin" }).click();
  await expect(page).toHaveURL(/#assess$/);
  const gauge = page.getByRole("dialog", { name: "Judge the return margin" });
  await expect(gauge).toBeVisible();
  // Browser Back: the app returns to the map and the tour follows to the map's card.
  await page.goBack();
  await expect(page).toHaveURL(/#map$/);
  await expect(mapCard).toBeVisible();
  // A resize: the card stays whole inside the window and off its spotlight.
  for (const size of [{ width: 1024, height: 700 }, { width: 1440, height: 900 }]) {
    await page.setViewportSize(size);
    await expect.poll(async () => {
      const c = (await page.locator(".tour-card").boundingBox())!, s = (await page.locator(".tour-hole").boundingBox())!;
      const inside = c.x >= 0 && c.y >= 0 && c.x + c.width <= size.width + 1 && c.y + c.height <= size.height + 1;
      const apart = c.x >= s.x + s.width - 1 || c.x + c.width <= s.x + 1 || c.y >= s.y + s.height - 1 || c.y + c.height <= s.y + 1;
      return inside && (apart || size.width <= 1024); // a narrow laptop may overlap a full-width map spotlight
    }, { message: `card placed at ${size.width} x ${size.height}` }).toBe(true);
  }
  await page.keyboard.press("Escape");
  await expect(page.locator(".tour")).toHaveCount(0);
});

test.describe("phone", () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  test("the map keys and the Layers panel fit the phone sheet, with no sideways scroll", async ({ page }) => {
    await openStep(page, "map");
    await ready(page);
    const box = (await page.getByTestId("area-map").boundingBox())!;
    for (const name of ["Zoom in", "Zoom out", "Show the habitat", "Show the whole sheet"]) {
      const b = (await page.getByRole("button", { name, exact: true }).boundingBox())!;
      expect(b.x >= box.x && b.x + b.width <= box.x + box.width && b.y >= box.y && b.y + b.height <= box.y + box.height, `${name} inside the sheet`).toBe(true);
      expect(b.width).toBeGreaterThanOrEqual(36); // a thumb-sized key
    }
    expect(inBox(await pixelAt(page, HABITAT), box)).toBe(true);
    await page.getByRole("button", { name: "Layers", exact: true }).tap();
    const panel = (await page.locator("#layers-panel").boundingBox())!;
    expect(panel.x >= box.x - 1 && panel.x + panel.width <= box.x + box.width + 1).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0);
    // The engine's answer to a stop is on screen (review R-30: the map-step message rules once pushed it off a phone).
    await page.getByRole("button", { name: "Close panel" }).tap();
    await clickAt(page, STOP);
    const msg = page.getByTestId("engine-message");
    await expect(msg).toContainText("Plan updated", { timeout: 20_000 });
    const m = (await msg.boundingBox())!, vp = page.viewportSize()!;
    expect(m.x >= 0 && m.x + m.width <= vp.width && m.y >= 0 && m.y + m.height <= vp.height, "message inside the phone screen").toBe(true);
  });
});
