// SI-assisted: drafted with Claude Code (Claude Opus 5.5) (MAP-01..MAP-03, TOUR-01); human review pending.
// The final 2D map's renderer-free pieces: the load view's fit, the published view string, the layer switches, the
// plan as F1 features (what a later 3D view will share), and which card the tour opens on.
import { describe, expect, it } from "vitest";
import { FIT_PADDING, INITIAL_RESOLUTION_F7, MAX_RESOLUTION_F7, fitResolution, formatView, parseView } from "./view";
import { DEFAULT_LAYERS, MIN_OVERLAY, clampOverlay, layerShown } from "./layers";
import { cellF1, planFeatures } from "./planGeometry";
import { f1 } from "../geo";
import type { GridDef } from "../geo/grid";
import type { PlanOutput } from "../engine/planner";
import { TOUR, firstCardOf } from "../app/Tutorial";

describe("MAP-01 load view", () => {
  it("fits the whole 3 km sheet inside the padding", () => {
    const r = fitResolution(3000, 3000, 956, 556);
    expect(r).toBeCloseTo(3000 / (556 - FIT_PADDING[0] - FIT_PADDING[2]), 9);
    // The sheet then fits both ways.
    expect(3000 / r).toBeLessThanOrEqual(556 - FIT_PADDING[0] - FIT_PADDING[2] + 1e-9);
    expect(3000 / r).toBeLessThanOrEqual(956 - FIT_PADDING[1] - FIT_PADDING[3]);
  });
  it("never opens closer than the earlier 4 m view, nor wider than the zoom-out limit", () => {
    expect(fitResolution(3000, 3000, 4000, 4000)).toBe(INITIAL_RESOLUTION_F7);
    expect(fitResolution(3000, 3000, 200, 200)).toBe(MAX_RESOLUTION_F7);
  });
  it("keeps the 4 m view when the window has no size yet (a hidden sheet)", () => {
    expect(fitResolution(3000, 3000, 0, 0)).toBe(INITIAL_RESOLUTION_F7);
    expect(fitResolution(3000, 3000, NaN, 500)).toBe(INITIAL_RESOLUTION_F7);
  });
  it("publishes the view as text and reads it back", () => {
    const s = formatView(8143750.6929, -285407.6691, 6.002);
    expect(s).toBe("8143750.693 -285407.669 6.002000");
    expect(parseView(s)).toEqual({ x: 8143750.693, y: -285407.669, resolution: 6.002 });
    expect(parseView(null)).toBeNull();
    expect(parseView("1 2")).toBeNull();
  });
});

describe("MAP-02 layer switches", () => {
  it("everything is shown by default at full strength", () => {
    expect(DEFAULT_LAYERS).toEqual({ relief: true, terrain: true, elevation: true, overlay: 1 });
  });
  it("maps each switch to its layer id; layers without a switch are always shown", () => {
    const off = { ...DEFAULT_LAYERS, relief: false, terrain: false, elevation: false };
    expect(["hillshade", "terrain", "contours"].map((id) => layerShown(id, off))).toEqual([false, false, false]);
    expect(layerShown("d2", off)).toBe(true);
    expect(layerShown("hillshade", DEFAULT_LAYERS)).toBe(true);
  });
  it("keeps the overlay strength between the weakest offered and full", () => {
    expect(clampOverlay(0)).toBe(MIN_OVERLAY);
    expect(clampOverlay(2)).toBe(1);
    expect(clampOverlay(0.5)).toBe(0.5);
    expect(clampOverlay(NaN)).toBe(1);
  });
});

describe("MAP-03 plan features in F1 (renderer-free)", () => {
  const grid: GridDef = { origin: f1(-4.815, 137.39, 0), rows: 10, cols: 10, cell_m: 2 };
  const cells = (from: number, n: number, step = 1) => Array.from({ length: n }, (_, i) => from + i * step);
  const out = (over: boolean) => ({
    plan: { stops: [{ id: "s1", letter: "A", name: "First" }, { id: "s2", letter: "B", name: "Gone" }] },
    geometry: {
      habitatCell: 0, stopCells: { s1: 9 }, unreachable: [], stopReturn_s: {},
      legs: [{ fromId: "habitat", toId: "s1", cells: cells(0, 10) }, { fromId: "s1", toId: "habitat", cells: cells(9, 10, -1) }],
      profile: [...cells(0, 10), ...cells(8, 9, -1)].map((cell, i) => ({ cell, s_m: 2 * i, z_m: 0, margin_min: null, marginHigh_min: null })),
      marginTicks: over ? [{ kind: "OVER", cell: 5, s_m: 10 }] : [],
    },
  }) as unknown as PlanOutput;

  it("draws the whole walk as one route, the habitat, and only the stops that have a cell", () => {
    const g = planFeatures(out(false), grid);
    expect(g.lines.map((l) => [l.kind, l.points.length])).toEqual([["route", 19]]);
    expect(g.habitat.at).toEqual(cellF1(0, grid));
    expect(g.stops.map((s) => [s.id, s.letter])).toEqual([["s1", "A"]]);
    expect(g.stops[0]!.at).toEqual(cellF1(9, grid));
    expect(g.lines[0]!.points.every((p) => p.frame === "F1")).toBe(true);
  });
  it("splits the walk at the OVER tick, the over part starting where the tick is", () => {
    const g = planFeatures(out(true), grid);
    expect(g.lines.map((l) => l.kind)).toEqual(["route", "route-over"]);
    expect(g.lines[1]!.points[0]).toEqual(cellF1(5, grid));
    expect(g.ticks).toEqual([{ kind: "OVER", at: cellF1(5, grid) }]);
  });
  it("puts one direction mark a third of the way along each leg, so an out-and-back pair stays apart", () => {
    const g = planFeatures(out(false), grid);
    expect(g.arrows.map((a) => [a.fromId, a.toId])).toEqual([["habitat", "s1"], ["s1", "habitat"]]);
    expect(g.arrows[0]!.at).toEqual(cellF1(3, grid));
    expect(g.arrows[1]!.at).toEqual(cellF1(6, grid));
    expect(g.arrows[0]!.toward.lon).toBeGreaterThan(g.arrows[0]!.at.lon); // walking east along the row
    expect(g.arrows[1]!.toward.lon).toBeLessThan(g.arrows[1]!.at.lon);
  });
});

describe("TOUR-01 the tour opens on the screen the user is on", () => {
  it("names the first card of each step, and none for the welcome screen", () => {
    expect(firstCardOf("setup")).toBe(0);
    expect(TOUR[firstCardOf("map")]!.title).toBe("Point and click to place stops");
    expect(TOUR[firstCardOf("assess")]!.target).toBe("gauge");
    expect(firstCardOf("welcome")).toBe(-1);
  });
});
