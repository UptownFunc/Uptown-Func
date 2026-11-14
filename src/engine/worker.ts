// SI-assisted: drafted with Claude Code (Claude Opus 5.5); human Route Engine review pending.
// The mission engine in a Web Worker via Comlink (CLAUDE.md architecture). The worker owns the grids and the Planner,
// so it is the only place a MissionPlan is written; the console sends Commands and receives copies.
import * as Comlink from "comlink";
import { loadPlannerGrid } from "./loadGrid";
import { Planner, type ApplyResult, type LatLon, type PlanOutput } from "./planner";

let planner: Planner | null = null;

const need = (): Planner => {
  if (!planner) throw new Error("engine not initialised");
  return planner;
};

export const engineApi = {
  /** areaBaseUrl must be absolute: a relative URL would resolve against this worker script, not the page. */
  async init(areaBaseUrl: string, habitat: LatLon): Promise<PlanOutput> {
    if (!/^[a-z]+:/i.test(areaBaseUrl)) throw new Error(`area URL must be absolute, got ${areaBaseUrl}`);
    planner = new Planner(await loadPlannerGrid(areaBaseUrl), habitat);
    return planner.current();
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
