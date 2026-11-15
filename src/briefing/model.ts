// SI-assisted: drafted with Claude Code (Claude Opus 5.5); human Design review pending.
// Briefing card content (plan 3.3 / UX-10 / UX-11, module 04C): built only from a MissionPlan copy and stamped with its
// version. Values keep their class: estimates stay est. ranges, assumed values say so, unknown stays unknown.
import type { MarginState, MissionPlan } from "../contracts";
import { formatAssumptionValue, formatDuration, formatLength } from "../app/format";

export interface BriefingLeg { label: string; heading: string; distance: string; climb: string; time: string; estimated: boolean }
export interface BriefingStop { letter: string; name: string; duration: string; durationClass: string; tasks: string[] }
export interface BriefingModel {
  versionHash: string;
  engineVersion: string;
  constantsVersion: string;
  legs: BriefingLeg[];
  stops: BriefingStop[];
  assumptions: { id: string; text: string }[];
  margin: { text: string; state: MarginState | null; unknown: boolean };
  /** UI-09: the decision summary at the top of the card. Totals are sums of the engine's legs (model-derived from D1);
   *  the return walk is the engine's own last-leg estimate. Nothing is new science; unknown stays unknown. */
  summary: {
    returnWalk: { text: string; estimated: boolean; unknown: boolean };
    distance: string;
    climb: string;
    concern: string | null;
  };
}

export function briefingModel(plan: MissionPlan): BriefingModel {
  const letter = (id: string) => (id === "habitat" ? "H" : plan.stops.find((s) => s.id === id)?.letter ?? id);
  const last = plan.plannedMargins[plan.plannedMargins.length - 1];
  const end = formatDuration(plan.endMargin);
  return {
    versionHash: plan.versionHash,
    engineVersion: plan.engineVersion,
    constantsVersion: plan.constantsVersion,
    legs: plan.legs.map((l) => {
      const t = formatDuration(l.time);
      return { label: `${letter(l.fromId)} → ${letter(l.toId)}`, heading: `${Math.round(l.heading_deg) % 360}°`,
        distance: formatLength(l.distance_m), climb: `${Math.round(l.climb_m)} m`, time: t.text, estimated: t.estimated };
    }),
    stops: plan.stops.map((s) => ({
      letter: s.letter, name: s.name, duration: formatDuration(s.duration).text, durationClass: s.duration.valueClass, tasks: [...s.tasks],
    })),
    assumptions: plan.assumptions.map((a) => ({
      id: a.id,
      text: `${a.name} = ${formatAssumptionValue(a)} (${a.source}): ${a.rationale}`,
    })),
    margin: { text: end.text, state: end.unknown ? null : last?.state ?? null, unknown: end.unknown },
    summary: summarise(plan, letter),
  };
}

/** A card is stale as soon as the engine's current plan version differs from the version it was built from. */
export const isStale = (cardVersion: string, currentVersion: string | null): boolean => cardVersion !== currentVersion;

function summarise(plan: MissionPlan, letter: (id: string) => string): BriefingModel["summary"] {
  const legs = plan.legs;
  if (legs.length === 0) return { returnWalk: { text: "unknown", estimated: false, unknown: true }, distance: "unknown", climb: "unknown", concern: null };
  const back = legs.find((l) => l.toId === "habitat");
  const steepest = legs.reduce((a, l) => (l.climb_m > a.climb_m ? l : a));
  return {
    returnWalk: back ? formatDuration(back.time) : { text: "unknown", estimated: false, unknown: true },
    distance: formatLength(legs.reduce((a, l) => a + l.distance_m, 0)),
    climb: `${Math.round(legs.reduce((a, l) => a + l.climb_m, 0))} m`,
    concern: steepest.climb_m <= 0 ? null : `Largest climb: ${letter(steepest.fromId)} → ${letter(steepest.toId)}, ${Math.round(steepest.climb_m)} m over ${formatLength(steepest.distance_m)}`,
  };
}
