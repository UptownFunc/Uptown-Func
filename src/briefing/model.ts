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
  };
}

/** A card is stale as soon as the engine's current plan version differs from the version it was built from. */
export const isStale = (cardVersion: string, currentVersion: string | null): boolean => cardVersion !== currentVersion;
