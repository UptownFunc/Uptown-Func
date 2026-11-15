// SI-assisted: drafted with Claude Code (Claude Opus 5.5); human Route Engine review pending.
// The mission engine in a Web Worker via Comlink (CLAUDE.md architecture). The worker owns the grids and the Planner,
// so it is the only place a MissionPlan is written; the console sends Commands and receives copies.
import * as Comlink from "comlink";
import { f1 } from "../geo";
import { f1ToCell } from "../geo/grid";
import { loadPlannerGrid } from "./loadGrid";
import { Planner, type ApplyResult, type LatLon, type PlanOutput } from "./planner";
import { timeContours, type ContourLevel } from "./contours";
import { floorOf, gridBounds, heightAt, tileHeights, type BoundsF1, type HeightGrid } from "../map3d/heights";

let planner: Planner | null = null;
/** The terrain classes the planner was built from, kept to hand a copy to the sheet (UI-11). */
let classes: Uint8Array | null = null;
/** 3D-01: the same grid, read only, for the 3D view's terrain tiles and readout (never copied to the page). */
let heightGrid: { g: HeightGrid; floor: number; within: BoundsF1 } | null = null;

const need = (): Planner => {
  if (!planner) throw new Error("engine not initialised");
  return planner;
};

export const engineApi = {
  /** areaBaseUrl must be absolute: a relative URL would resolve against this worker script, not the page. */
  async init(areaBaseUrl: string, habitat: LatLon): Promise<PlanOutput> {
    if (!/^[a-z]+:/i.test(areaBaseUrl)) throw new Error(`area URL must be absolute, got ${areaBaseUrl}`);
    const grid = await loadPlannerGrid(areaBaseUrl);
    planner = new Planner(grid, habitat);
    classes = grid.classes;
    heightGrid = { g: grid, floor: floorOf(grid), within: gridBounds(grid) };
    return planner.current();
  },
  /** A copy of the terrain-class grid the planner uses (0 unknown, 1 slope-screened, 2 excluded), for the sheet's
   *  cursor tag: one download, and the tag can never disagree with the engine's refusal. The copy is transferred. */
  terrainClasses(): Uint8Array {
    need();
    const copy = classes!.slice();
    return Comlink.transfer(copy, [copy.buffer]);
  },
  /** Time-to-habitat contour lines (tier 2) at the given levels in minutes, on a 4 m display grid. */
  contours(levels_min: number[]): ContourLevel[] {
    const p = need(), f = p.habitatFieldSlow(), g = p.gridShape();
    return timeContours(f, g.rows, g.cols, { factor: 2, levels_s: levels_min.map((m) => m * 60), minArea_cells: 400 });
  },
  /** 3D-01: a w x h D1 heightmap for one terrain tile (row 0 north; the floor outside the D1 window), transferred. */
  heights(b: BoundsF1, w: number, h: number): Float32Array {
    need();
    const t = heightGrid!, out = tileHeights(t.g, b, w, h, t.floor, t.within);
    return Comlink.transfer(out, [out.buffer]);
  },
  /** 3D-01: D1 heights (bilinear) and terrain classes at F1 points, for markers and the readout; null outside D1. */
  sample(points: { lat: number; lon: number }[]): { z: number | null; cls: number | null }[] {
    need();
    const t = heightGrid!.g;
    return points.map(({ lat, lon }) => {
      const z = heightAt(t, lat, lon), cell = z === null ? null : f1ToCell(f1(lat, lon, 0), t);
      return { z, cls: cell ? classes![cell.r * t.cols + cell.c]! : null };
    });
  },
  current(): PlanOutput {
    return need().current();
  },
  /** Applies one Command; returns the outcome and the plan after it (unchanged when refused). */
  apply(command: unknown): { result: ApplyResult; output: PlanOutput; elapsed_ms: number } {
    const t0 = performance.now();
    const result = need().apply(command);
    const output = need().current();
    return { result, output, elapsed_ms: performance.now() - t0 };
  },
};
export type EngineApi = typeof engineApi;

Comlink.expose(engineApi);
