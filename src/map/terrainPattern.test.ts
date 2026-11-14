// SI-assisted: drafted with Claude Code (Claude Opus 5.5); human Design review pending.
// Plan 9.2 symbols drawn in screen pixels (plan 7.8): the tile of each symbol, the lattice phase anchored to F7
// (so the hatch moves with the ground when panned, never swims), and where the class mask lands on the canvas.
import { describe, expect, it } from "vitest";
import { SYMBOLS, maskRect, patternPhase, tileInk } from "./terrainPattern";

describe("plan 9.2 symbol tiles (CSS pixels)", () => {
  it("uses the plan tokens: amber steep, neutral excluded, bone unknown", () => {
    expect(SYMBOLS.steep.colour).toBe("#e8b341");
    expect(SYMBOLS.excluded.colour).toBe("#aeb5b3");
    expect(SYMBOLS.unknown.colour).toBe("#e8e1d5");
  });
  it("steep is one diagonal family every 6 px; excluded is a cross-hatch; unknown is a 4 px stipple", () => {
    const set = (k: keyof typeof SYMBOLS) => new Set(tileInk(k).map(([x, y]) => `${x},${y}`));
    expect([...set("steep")].sort()).toEqual(["0,0", "1,5", "2,4", "3,3", "4,2", "5,1"]);
    const ex = set("excluded");
    for (const p of set("steep")) expect(ex.has(p)).toBe(true);
    for (const p of ["1,1", "2,2", "5,5"]) expect(ex.has(p)).toBe(true);   // the (x - y) family
    expect(ex.size).toBe(10);                                               // 6 + 6, sharing (0,0) and (3,3)
    expect([...set("unknown")]).toEqual(["0,0"]);
    expect(SYMBOLS.unknown.period).toBe(4);
  });
  it("keeps the symbols light: under a third of a tile is ink", () => {
    for (const k of ["steep", "excluded", "unknown"] as const) expect(tileInk(k).length / SYMBOLS[k].period ** 2).toBeLessThan(1 / 3);
  });
});

describe("lattice phase is anchored to the ground (F7), not to the canvas", () => {
  const ext = [8_142_000.3, -286_000, 8_143_280.3, -284_720.7];
  it("moves with the ground: panning by whole pixels shifts the phase by the same pixels", () => {
    const r = 4, p0 = patternPhase(ext, r, 1, 6);
    const panned = [ext[0]! + 5 * r, ext[1]! - 2 * r, ext[2]! + 5 * r, ext[3]! - 2 * r];
    const p1 = patternPhase(panned, r, 1, 6);
    expect(((p1.x - p0.x + 5) % 6 + 6) % 6).toBe(0);  // canvas x of a ground point drops by 5 px
    expect(((p1.y - p0.y + 2) % 6 + 6) % 6).toBe(0);  // view moved 2 px south: ground moves up 2 px on the canvas
  });
  it("is a whole number of device pixels in [0, period x pixel ratio)", () => {
    for (const pr of [1, 2]) {
      const p = patternPhase(ext, 0.73, pr, 6);
      expect(Number.isInteger(p.x) && Number.isInteger(p.y)).toBe(true);
      expect(p.x).toBeGreaterThanOrEqual(0); expect(p.x).toBeLessThan(6 * pr);
    }
  });
});

describe("mask placement on the canvas", () => {
  it("maps the mask's F7 extent into canvas pixels for this render", () => {
    const r = maskRect([100, 0, 300, 100], [0, -50, 400, 150], 2, 1);
    expect(r).toEqual({ x: 50, y: 25, w: 100, h: 50 });
    expect(maskRect([100, 0, 300, 100], [0, -50, 400, 150], 2, 2)).toEqual({ x: 100, y: 50, w: 200, h: 100 });
  });
});
