// SI-assisted: drafted with Claude Code (Claude Opus 5.5); human Data and Science review pending.
// Source and provenance descriptions (plan 6, module 05, UX-15, demo beat 5). Datasets come only from the pipeline's
// provenance.json, constants only from the register; anything else is named as what it is. A dataset without a
// provenance record is reported as missing, never filled in.
import type { Assumption, Provenance, Quantity, ValueClass } from "../contracts";
import { CONSTANTS, type ConstantId } from "../constants";

export interface SourceDescription { id: string; kind: "dataset" | "constant" | "team" | "plan" | "missing" | "other"; title: string; detail: string }

export function describeSource(id: string, provenance: readonly Provenance[]): SourceDescription {
  const p = provenance.find((x) => x.id === id);
  if (p) {
    return { id, kind: "dataset", title: `${p.id}: ${p.productId}`,
      detail: `${p.valueClass.replace("_", " ")}; ${p.resolution_m} m; ${p.latitudeType} latitude, ${p.longitudeDirection}-positive longitude; vertical reference ${p.verticalReference}; licence: ${p.licence}; retrieved ${p.retrievedOn}; ${p.url}` };
  }
  if (/^D(?:[1-9]|1[0-3])$/.test(id)) return { id, kind: "missing", title: id, detail: "No provenance record in provenance.json yet (pipeline follow-up P-04)." };
  if (Object.hasOwn(CONSTANTS, id)) {
    const c = CONSTANTS[id as ConstantId];
    return { id, kind: "constant", title: `Constant ${id}`, detail: `${c.citation.source}, ${c.citation.location}${"limitation" in c && c.limitation ? `. Limits: ${c.limitation}` : ""}` };
  }
  if (id === "manual entries") return { id, kind: "other", title: "Manual entries", detail: "Arrival and departure times ticked by the crew in the Field View." };
  if (id === "team choice") return { id, kind: "team", title: "Team choice", detail: "An Assumed value set by the team, with its rationale; not a measurement." };
  if (/^plan-/.test(id)) return { id, kind: "plan", title: `SharpWalk plan ${id.slice(5)}`, detail: "Formula or rule in the team's project plan." };
  return { id, kind: "other", title: id, detail: "" };
}

export interface QuantityExplanation {
  valueClass: ValueClass;
  method: string;
  sources: SourceDescription[];
  assumptions: { id: string; text: string }[];
}

export function explainQuantity(q: Quantity, provenance: readonly Provenance[], assumptions: readonly Assumption[]): QuantityExplanation {
  return {
    valueClass: q.valueClass,
    method: q.methodId,
    sources: q.sourceIds.map((id) => describeSource(id, provenance)),
    assumptions: q.assumptionIds.map((id) => {
      const a = assumptions.find((x) => x.id === id);
      if (!a) return { id, text: `${id}: not in this plan's assumption list` };
      const v = a.unit === "s" ? `${(a.value / 60).toFixed(1)} min` : `${a.value}${a.unit === "1" ? "" : ` ${a.unit}`}`;
      return { id, text: `${a.name} = ${v} (${a.source}): ${a.rationale}` };
    }),
  };
}
