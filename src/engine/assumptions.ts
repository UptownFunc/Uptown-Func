// SI-assisted: drafted with Claude Code (Claude Opus 5.5; revised with Claude Fable 5.2); human Route Engine review pending.
// Engine assumptions. K-01 (DECISIONS.md, 14 Nov 2026): the plan gives no values for the four slope factors k_v
// (plan 19.5: they stay Assumed; plan 19.11 weakness 5: the team sets them). REG-01 (register row V-06) looked for
// a sourced value and found none: NASA's xEVA concept of operations plans walking at about 2 km/h and says this
// "does not account for slope or obstacles" (EVA-EXP-0042 Rev B, 4.2.1.3.1.1, p. 40); the Apollo 14 walking
// traverses (NASA SP-368, ch. 4, Table 4, p. 125) reach net slopes of only 7.9 deg and show no slowdown when uphill
// and downhill legs are pooled (docs/data/reg-01-register-sources.md). So every bin keeps k_v = 1, Assumed, and the
// console says so. It is a team choice, not a measurement, and is probably optimistic on the steeper bins.
import type { Assumption } from "../contracts";
import { CONSTANTS } from "../constants";

export const KV_ASSUMED = {
  kBins: [1, 1, 1, 1] as const,
  isAssumed: true,
  assumption: {
    id: "A-kv",
    name: "Slope factors k_v for 0-5, 5-10, 10-15 and 15-20 deg (all bins)",
    value: 1,
    unit: "1",
    rationale: "K-01 kept (REG-01): no speed-versus-slope value was found in any cited source; slope changes time only through 3D length",
    source: "team choice",
  } satisfies Assumption,
} as const;

/** Scenario date and time (plan 19.11 weakness 27): set_assumption payload { id: "scenario_utc", value_s: Unix
 *  seconds UTC, rationale }, stored as an Assumption whose unit names the time scale. No default (team choice). */
export const SCENARIO_ID = "scenario_utc";
export const SCENARIO_UNIT = "s since 1970-01-01 UTC";
/** Unit of local mean solar time in engine Quantities: a clock label, never a duration (plan 6.10). Kept here, not
 *  in sun.ts, so UI formatting does not import the sun module. */
export const MARS_CLOCK_UNIT = "Mars h (clock label)";

export const SLOPE_LIMIT_ASSUMPTION: Assumption = {
  id: "A-slope-limit",
  name: "Slope limit for walking edges",
  value: CONSTANTS.slopeLimit.value,
  unit: "deg",
  rationale: "xEVA capability to walk slopes of up to 20 deg (EVA-EXP-0042 Rev B, 4.2.1.3, p. 38), a lunar source applied to Mars (plan 6.4); Assumed",
  source: "team choice",
};

/** Limits on a stop's name and tasks (C-19 edit_stop, add_stop), shared by the engine and the Plan panel editor. */
export const STOP_LIMITS = { nameChars: 60, tasks: 10, taskChars: 120 } as const;
