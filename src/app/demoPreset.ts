// SI-assisted: drafted with Claude Code (Claude Opus 5.5); human review pending.
// G3-01 (DECISIONS.md): the plan gives no values for the Assumed plan times (T-01, plan 19.11 weakness 5) or the
// scenario time (T-02, weakness 27). At a team member's direction ("for g3 needed you choose", Sat 14 Nov 2026), the
// SI session chose these demonstration values so the planned margin and the sun values can be shown at G3. They are
// sent at start-up as ordinary set_assumption Commands (the engine stays the only MissionPlan writer), are shown with
// their rationale and "assumed" badge, and stay editable in the console. They are not measurements or mission rules.
import { SCENARIO_ID } from "../engine/assumptions";

const WHO = "G3-01 demonstration value chosen by SI at a team member's direction (the plan gives none); replace with the team's value";

export interface PresetAssumption { readonly id: string; readonly value_s: number; readonly rationale: string }

export const G3_PRESET: readonly PresetAssumption[] = [
  { id: "T_EVA", value_s: 240 * 60, rationale: `${WHO}: a 4 h planned EVA` },
  { id: "t_ops", value_s: 30 * 60, rationale: `${WHO}: egress, ingress and equipment handling` },
  { id: "t_cont", value_s: 30 * 60, rationale: `${WHO}: contingency allowance` },
  { id: "stop_duration", value_s: 45 * 60, rationale: `${WHO}: default science stop` },
  { id: SCENARIO_ID, value_s: Date.UTC(2026, 10, 15, 12, 0) / 1000, rationale: `${WHO}: local mid-morning start on 15 Nov 2026` },
];

/** The preset is skipped with ?preset=none (checks of the empty console and of manual entry). */
export function presetEnabled(search: string): boolean {
  return new URLSearchParams(search).get("preset") !== "none";
}
