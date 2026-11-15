// SI-assisted: drafted with Claude Code (Claude Opus 5.5) (FLOW-01); human Route Engine and Design review pending.
// FLOW-01: when the plan cannot work as planned, the Assess step and the HUD say so at once, with the reason, instead of
// letting the user carry on. Not feasible = a stop the route cannot reach on slope-screened ground, or a planned
// return margin below zero (OVER) at the slow walking speed. An estimate under stated assumptions, like every margin:
// a plan that passes is not called safe (there is no SAFE state).
import type { PlanOutput } from "../engine/planner";

/** The reason the plan is not feasible, or null. */
export function infeasible(out: PlanOutput): string | null {
  const u = out.geometry.unreachable[0];
  if (u) {
    const s = out.plan.stops.find((x) => x.id === u.toId) ?? out.plan.stops.find((x) => x.id === u.fromId);
    return `stop ${s?.letter ?? ""} cannot be reached on slope-screened ground`;
  }
  return out.plan.plannedMargins.at(-1)?.state === "OVER" ? "the walk overruns the EVA at the slow speed" : null;
}
