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

export const SLOPE_LIMIT_ASSUMPTION: Assumption = {
  id: "A-slope-limit",
  name: "Slope limit for walking edges",
  value: CONSTANTS.slopeLimit.value,
  unit: "deg",
  rationale: "xEVA 20 deg slope requirement, a lunar source applied to Mars (plan 6.4); Assumed",
  source: "team choice",
};
