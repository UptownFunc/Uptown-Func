// SI-assisted: drafted with Claude Code (Claude Opus 5.5); human Data and Science review pending.
// Science constants register (CLAUDE.md: source citation and page for every constant; SI units).
// A location marked UNRESOLVED means this session could not read the page; it must be filled before release.
import type { ValueClass } from "../contracts";

export interface Citation { readonly source: string; readonly location: string }
export interface Constant {
  readonly id: string;
  readonly value: number;
  readonly low?: number;
  readonly high?: number;
  readonly unit: "m" | "m/s" | "deg" | "1";
  readonly valueClass: ValueClass;
  readonly citation: Citation;
  readonly limitation?: string;
}

export const CONSTANTS = {
  sphereRadiusF1: {
    id: "sphereRadiusF1", value: 3_396_190, unit: "m", valueClass: "published_observation",
    citation: { source: "IAU_2015:49900, Mars (2015) - Sphere / Ocentric, as used by the USGS D1/D2 rasters (plan 7.3, frame F1)", location: "Plan 7.3 frame table; D1 header read 14 Nov 2026 (docs/data/phase-1.1-source-audit.md)" },
  },
  ellipsoidEquatorialF2: {
    id: "ellipsoidEquatorialF2", value: 3_396_190, unit: "m", valueClass: "published_observation",
    citation: { source: "IAU_2015:49902, Mars (2015) / Ocentric, via spatialreference.org (plan 7.3, frame F2)", location: "Plan 7.3 frame table" },
    limitation: "Comparison reference only; never used to place data.",
  },
  ellipsoidPolarF2: {
    id: "ellipsoidPolarF2", value: 3_376_200, unit: "m", valueClass: "published_observation",
    citation: { source: "IAU_2015:49902, Mars (2015) / Ocentric, via spatialreference.org (plan 7.3, frame F2)", location: "Plan 7.3 frame table" },
    limitation: "Comparison reference only; never used to place data.",
  },
  walkSpeedNominal: {
    id: "walkSpeedNominal", value: 0.83, unit: "m/s", valueClass: "assumed",
    citation: { source: "NASA/TM-2010-216138 (planning walking speed, 3.0 km/h)", location: "Table 4, p. 13" },
    limitation: "Planning value for suited walking; not validated at Mars gravity on natural terrain. Speeds are along the surface (treadmill belt speed), so edge time divides the 3D edge length by speed (plan 19.11, weakness 58).",
  },
  walkSpeedRange: {
    id: "walkSpeedRange", value: 0.83, low: 0.64, high: 0.97, unit: "m/s", valueClass: "estimated",
    citation: { source: "NASA/TM-2010-216138, suited walking range in IST-1, 2.3-3.5 km/h (plan 19.5)", location: "Table 4, p. 13" },
    limitation: "Estimated from lunar-gravity treadmill tests (0.12-0.32 g, six male subjects, one 121 kg MKIII suit, no downhill data; NASA/TP-2010-216125, pp. 2-3, 10, 83-86, via plan 19.5); no suited Mars-gravity data exists. The 15-20 deg bin is beyond tested grades. Speeds are along the surface (plan 19.11, weakness 58).",
  },
  slopeLimit: {
    id: "slopeLimit", value: 20, unit: "deg", valueClass: "assumed",
    citation: { source: "xEVA requirement to walk up, down and across 20 deg slopes (NASA presentation; plan 6.4)", location: "UNRESOLVED: the plan's reference list (both parts, read 14 Nov 13:10) names only 'xEVA 20 deg slope requirement (NASA presentation)', with no title, date or slide" },
    limitation: "A lunar requirement applied to Mars; Assumed, not Mars-validated.",
  },
} as const satisfies Record<string, Constant>;

export type ConstantId = keyof typeof CONSTANTS;
export const constant = (id: ConstantId): Constant => CONSTANTS[id];

/** Constants whose page/location is still UNRESOLVED; all must be resolved before release. */
export const unresolvedCitations = (): ConstantId[] =>
  (Object.keys(CONSTANTS) as ConstantId[]).filter((k) => CONSTANTS[k].citation.location.startsWith("UNRESOLVED"));
