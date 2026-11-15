// SI-assisted: drafted with Claude Code (Claude Opus 5.5) on yujin/onboarding-terms (UX-22); human Design and Data and
// Science review pending.
// One plain-language glossary for every variable and term the app shows (UX-22). `brief` is the few words the
// orientation card shows beside the term; `plain` is the one- or two-sentence meaning shown in the app when a term is
// opened. The words follow the plan's honesty rules: values are Assumed or estimated, never "safe" or "guaranteed".
// No new value is introduced here: the two numbers quoted (the slope limit, the NEAR LIMIT band) are read from the
// constants and the engine, so they cannot drift from what the app computes.
import { CONSTANTS } from "../constants";
import { NEAR_LIMIT_SHARE } from "../engine/margin";

const LIMIT = `${CONSTANTS.slopeLimit.value}°`, BAND = `${Math.round(NEAR_LIMIT_SHARE * 100)}%`;

/** short: the label in the orientation card's list (a few characters); term: the full name in the app. */
export interface Entry { readonly short: string; readonly term: string; readonly brief: string; readonly plain: string }

export const GLOSSARY = {
  EVA: { short: "EVA", term: "EVA", brief: "time outside in suits",
    plain: "Extravehicular activity: the crew's time outside in suits, from the start of egress (getting out) to the end of ingress (getting back in)." },
  assumed: { short: "Assumed", term: "Assumed", brief: "chosen, not measured; editable",
    plain: "A value chosen for the plan, not measured on Mars. Some come from cited planning documents, others are team choices with no source; each shows its reason." },
  utc: { short: "UTC", term: "UTC", brief: "Earth's world clock time",
    plain: "Coordinated Universal Time: Earth's world clock. It fixes the scenario's date; the Mars clock follows from it." },
  lmst: { short: "LMST", term: "Local mean solar time", brief: "the Mars clock at the site",
    plain: "The time of day on Mars at the site, read like a clock. A Mars hour is a little longer than an Earth hour, so every duration in SharpWalk stays in Earth minutes." },
  sun: { short: "Sun elevation", term: "Sun elevation", brief: "the sun's angle above the horizon",
    plain: "How high the sun stands: 0° is sunrise or sunset, 90° straight overhead. Nearby slopes can still hide it." },
  ls: { short: "Ls", term: "Solar longitude (Ls)", brief: "Mars's season, as an angle",
    plain: "Mars's place on its orbit, which sets the season: 0° is northern spring, 90° northern summer, 180° autumn, 270° winter." },
  T_EVA: { short: "T_EVA", term: "EVA duration (T_EVA)", brief: "the whole EVA, egress to ingress",
    plain: "The planned length of the EVA, egress to ingress. Getting out and in, tasks, stops, walking and the reserve all fit inside it." },
  t_ops: { short: "t_ops", term: "Operational tasks (t_ops)", brief: "egress, ingress and equipment handling",
    plain: "Time for egress, ingress and equipment handling, as the plan defines it. It is not walking time." },
  t_cont: { short: "t_cont", term: "Contingency (t_cont)", brief: "reserve time for problems",
    plain: "Reserve time held back for problems. It stays inside the EVA duration and is never planned for walking." },
  stop: { short: "Stop time", term: "Duration at each stop", brief: "time working at each stop",
    plain: "Time spent working at a stop (samples, photos). One default for all stops; each stop can have its own." },
  slope: { short: "Slope-screened", term: "Slope-screened", brief: `no steeper than the assumed ${LIMIT} limit`,
    plain: `Ground no steeper than the assumed ${LIMIT} walking limit, read from the terrain model. The model cannot see rocks, so slope-screened is not rock-free.` },
  leg: { short: "Leg", term: "Leg", brief: "one stretch between two points",
    plain: "One stretch of the walk, from the habitat or a stop to the next stop or back to the habitat." },
  climb: { short: "Climb", term: "Climb", brief: "height gained along the leg",
    plain: "The height gained along a leg, added up step by step from the terrain model (D1)." },
  est: { short: "est.", term: "est.", brief: "a range across the walking speeds",
    plain: "An estimate, shown as a range across the suited walking speeds from lunar-gravity tests. Not a measurement on Mars, and not a guarantee." },
  margin: { short: "Margin", term: "Margin", brief: "time left after the whole plan",
    plain: "The EVA time left once walking, stops, tasks and contingency are taken out. Below zero, the plan does not fit in the EVA." },
  slow: { short: "Slow bound", term: "Slow bound", brief: "the slowest speed in the range",
    plain: "The slowest walking speed in SharpWalk's range (lunar-gravity tests). The margin's state is judged at it. Real walking can be slower: it is not a worst case." },
  states: { short: "OK / NEAR / OVER", term: "OK · NEAR LIMIT · OVER", brief: `≥${BAND} of the EVA left · 0-${BAND} · below zero`,
    plain: `OK: at least ${BAND} of the EVA duration left at the slow bound. NEAR LIMIT: between 0 and ${BAND}. OVER: less than nothing; the plan does not fit.` },
  kv: { short: "kᵥ", term: "Slope factor kᵥ", brief: "extra slowdown on slopes; set to 1",
    plain: "Extra slowdown on a slope, beyond the longer path over it. No cited source gives a value, so it is 1 (no extra slowdown), Assumed: probably optimistic on steep ground." },
  elapsed: { short: "Elapsed", term: "Elapsed EVA time", brief: "minutes since leaving the habitat",
    plain: "Minutes since the crew left the habitat, typed from the suit or wrist clock." },
  tick: { short: "Tick", term: "Tick", brief: "mark arriving at or leaving a stop",
    plain: "Record the moment you arrive at or leave a stop. The field margins update from your ticks; the plan does not change." },
  goOn: { short: "If we continue", term: "Margin if we continue", brief: "time left if the plan carries on",
    plain: "The EVA time left at the end if the crew carries on with the rest of the plan, worked out from the last tick (a manual entry), not from a live position." },
  goBack: { short: "If we turn back", term: "Margin if we turn back now", brief: "time left if you head back",
    plain: "The EVA time left if the crew walks straight back to the habitat from the last ticked stop, at the elapsed time typed then." },
  toHab: { short: "Time to habitat", term: "Time to habitat", brief: "the walk back from a point, slow bound",
    plain: "How long the walk back to the habitat takes from a point, at the slow bound, along slope-screened ground." },
  drill: { short: "Drill", term: "Simulated drill", brief: "practice: does the walk back fit a warning?",
    plain: "Practice for a solar-storm warning: which stops are within the assumed warning time of the habitat. A simulation, not a forecast or a live alert." },
  stale: { short: "STALE", term: "STALE", brief: "the plan changed since the card was built",
    plain: "The plan changed after the card was generated, so the card no longer matches it. Generate it again." },
  model: { short: "Model-derived", term: "Model-derived", brief: "computed from data, not measured",
    plain: "Computed by SharpWalk from the datasets (for example the D1 terrain model), not measured on the ground." },
  vref: { short: "Vertical ref.", term: "Vertical reference unverified", brief: "absolute heights may be offset",
    plain: "The data provider does not state D1's zero height level, and it is not independently checked, so absolute elevations may be offset. Climbs and slopes use height differences." },
} as const satisfies Record<string, Entry>;

export type TermKey = keyof typeof GLOSSARY;
export const term = (k: TermKey): Entry => GLOSSARY[k];
