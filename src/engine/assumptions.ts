// SI-assisted: drafted with Claude Code (Claude Opus 5.5); human Route Engine review pending.
// Engine assumptions. K-01 (DECISIONS.md, 14 Nov 2026): the plan gives no values for the four slope factors k_v
// (plan 19.5: they stay Assumed; plan 19.11 weakness 5: the team sets them). Until the team does, every bin uses
// k_v = 1 and the console shows a visible ASSUMED placeholder banner. This is a team choice, not a measurement.
import type { Assumption } from "../contracts";
import { CONSTANTS } from "../constants";

export const KV_PLACEHOLDER = {
  kBins: [1, 1, 1, 1] as const,
  isPlaceholder: true,
  assumption: {
    id: "A-kv",
    name: "Slope factors k_v for 0-5, 5-10, 10-15 and 15-20 deg (all bins)",
    value: 1,
    unit: "1",
    rationale: "K-01 placeholder: equal factors until the team sets values; slope changes the route only through 3D length",
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
  rationale: "xEVA 20 deg slope requirement, a lunar source applied to Mars (plan 6.4); Assumed",
  source: "team choice",
};

/** Limits on a stop's name and tasks (C-19 edit_stop, add_stop), shared by the engine and the Plan panel editor. */
export const STOP_LIMITS = { nameChars: 60, tasks: 10, taskChars: 120 } as const;
