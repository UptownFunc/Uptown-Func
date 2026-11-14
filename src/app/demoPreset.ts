// SI-assisted: drafted with Claude Code (Claude Opus 5.5; revised with Claude Fable 5.2); human review pending.
// REG-01 (DECISIONS.md, register rows V-01..V-05): the plan gives no values for the Assumed plan times (T-01, plan
// 19.11 weakness 5) or the scenario time (T-02, weakness 27). The G3-01 values (240/30/30/45 min) had no source.
// At a team member's direction ("replace them with the correct value ... citation", Sat 14 Nov 2026) the SI session
// replaced the plan times with figures from two NASA planning documents (pages checked in the PDFs,
// docs/data/reg-01-register-sources.md):
//   EVA-EXP-0042 Rev B, Exploration EVA System Concept of Operations (19 Oct 2020);
//   NASA/TM-2010-216138, Life Sciences Implications of Lunar Surface Operations (Nov 2010).
// Both are lunar planning documents; applied to Mars the values stay Assumed (the plan's class for these inputs), not
// measurements, mission rules or a suit capability. They are sent at start-up as ordinary set_assumption Commands
// (the engine stays the only MissionPlan writer), shown with their rationale and "assumed" badge, and stay editable.
import { SCENARIO_ID } from "../engine/assumptions";

const WHO = "REG-01, Assumed: lunar planning figure applied to Mars, picked from the cited document by SI at a team member's direction";
const OPS = "EVA-EXP-0042 Rev B";

export interface PresetAssumption { readonly id: string; readonly value_s: number; readonly rationale: string }

export const DEMO_PRESET: readonly PresetAssumption[] = [
  { id: "T_EVA", value_s: 360 * 60, rationale: `${WHO}: 6 h, centre of the 6±2 h EVA range (${OPS}, 4.1.4, p. 29)` },
  { id: "t_ops", value_s: 60 * 60, rationale: `${WHO}: 1 h for egress and ingress (${OPS}, 4.1.4.3.2, p. 30)` },
  { id: "t_cont", value_s: 60 * 60, rationale: `${WHO}: 1 h for off-nominal situations (${OPS}, 4.1.4.3.2, p. 30), held inside T_EVA` },
  { id: "stop_duration", value_s: 45 * 60, rationale: `${WHO}: 45 min of EVA per exploration site (NASA/TM-2010-216138, Tables 2-3, p. 12)` },
  { id: SCENARIO_ID, value_s: Date.UTC(2026, 10, 15, 12, 0) / 1000,
    rationale: "REG-01, Assumed scenario input, kept (no source can give it), picked by SI at a team member's direction: a mid-morning start keeps a 6 h EVA in daylight" },
];

/** The preset is skipped with ?preset=none (checks of the empty console and of manual entry). */
export function presetEnabled(search: string): boolean {
  return new URLSearchParams(search).get("preset") !== "none";
}
