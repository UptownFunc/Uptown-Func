// SI-assisted: drafted with Claude Code (Claude Opus 5.5) on design/sharpwalk-ui-ux (UI-01); human Design review pending.
// The guided flow: Welcome -> Setup -> Planner -> Map -> HUD -> Assess -> Brief, one purpose per screen. The step lives
// in the URL hash so a step can be linked, reloaded and reached with Back; the plan itself never goes in the URL.
export const STEPS = [
  { id: "setup", label: "Setup", map: false },
  { id: "planner", label: "Planner", map: false },
  { id: "map", label: "Map", map: true },
  { id: "hud", label: "HUD", map: true },
  { id: "assess", label: "Assess", map: true },
  { id: "brief", label: "Brief", map: false },
] as const;

export type StepId = (typeof STEPS)[number]["id"] | "welcome";

/** "#map" -> "map"; anything unknown opens the welcome screen. */
export function stepFromHash(hash: string): StepId {
  const h = hash.replace(/^#/, "");
  return STEPS.some((s) => s.id === h) ? (h as StepId) : "welcome";
}
