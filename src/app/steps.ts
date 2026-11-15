// SI-assisted: drafted with Claude Code (Claude Opus 5.5) on design/sharpwalk-ui-ux (UI-01); streamlined (FLOW-01);
// human Design review pending.
// The guided flow (FLOW-01, Sun 15 Nov 2026): Welcome (orientation or go) -> data choice (NASA preset or custom) ->
// Map -> Assess -> HUD. Setup, Planner and Brief are off the main flow: no key in the step index, still reached by a
// link (#setup, #planner, #brief) or, for the Planner, by the "custom" choice. The step lives in the URL hash so a step
// can be linked, reloaded and reached with Back; the plan itself never goes in the URL.
export const STEPS = [
  { id: "map", label: "Map", map: true },
  { id: "assess", label: "Assess", map: true },
  { id: "hud", label: "HUD", map: true },
] as const;

/** Screens off the main flow (FLOW-01): kept, but not in the step index. */
export const OFF_FLOW = ["setup", "planner", "brief"] as const;

export type StepId = (typeof STEPS)[number]["id"] | (typeof OFF_FLOW)[number] | "welcome";

/** "#map" -> "map"; anything unknown opens the welcome screen. */
export function stepFromHash(hash: string): StepId {
  const h = hash.replace(/^#/, "");
  return STEPS.some((s) => s.id === h) || (OFF_FLOW as readonly string[]).includes(h) ? (h as StepId) : "welcome";
}
