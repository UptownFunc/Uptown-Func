// SI-assisted: drafted with Claude Code (Claude Opus 5.5; revised with Claude Fable 5.2); human Data and Science review pending.
// Science constants register (CLAUDE.md: source citation and page for every constant; SI units).
// A location marked UNRESOLVED means this session could not read the page; it must be filled before release.
// REG-02 (Sun 15 Nov 2026, docs/data/reg-02-verification.md): every citation below was re-read in its source at
// Yujin's direction. Changed: walkSpeedRange wording and pages, drillWarningDefault documents, skyObstructionM12 page.
// W-01/W-02 (Sun 15 Nov 2026): walkSpeedRange slow bound 0.64 -> 0.56 m/s, re-read in EVA-EXP-0042 Rev B p. 40 and
// NASA/TP-2010-216125 p. 70 (DECISIONS W-02).
// skyObstructionM12: Yujin opened Ehresmann et al. 2021 on the publisher's page (free access) and supplied its text;
// 0.37 pi is in sections 2.2 and 4. No constant is UNRESOLVED now.
import type { ValueClass } from "../contracts";

export interface Citation { readonly source: string; readonly location: string }
export interface Constant {
  readonly id: string;
  readonly value: number;
  readonly low?: number;
  readonly high?: number;
  readonly unit: "m" | "m/s" | "deg" | "1" | "s";
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
    limitation: "Comparison reference and the planetographic latitude of the Mars24 sun input (D10) only; never used to place data.",
  },
  ellipsoidPolarF2: {
    id: "ellipsoidPolarF2", value: 3_376_200, unit: "m", valueClass: "published_observation",
    citation: { source: "IAU_2015:49902, Mars (2015) / Ocentric, via spatialreference.org (plan 7.3, frame F2)", location: "Plan 7.3 frame table" },
    limitation: "Comparison reference and the planetographic latitude of the Mars24 sun input (D10) only; never used to place data.",
  },
  ttMinusUtc2017: {
    id: "ttMinusUtc2017", value: 69.184, unit: "s", valueClass: "published_observation",
    citation: { source: "NASA GISS, Mars24 Sunclock 'Algorithm and Worked Examples' (updated 2025-01-07, retrieved 14 Nov 2026): TAI - UTC = 37.0 s from 1 Jan 2017, plus 32.184 s", location: "Step A-4 (web page, no page numbers)" },
    limitation: "Valid from 1 Jan 2017 while no further leap second is inserted; the page reports none as of winter 2025. One leap second would move the sun by about 0.004 deg.",
  },
  walkSpeedNominal: {
    id: "walkSpeedNominal", value: 0.83, unit: "m/s", valueClass: "assumed",
    citation: { source: "NASA/TM-2010-216138 (planning walking speed, 3.0 km/h)", location: "Table 4, p. 13" },
    limitation: "Planning value for suited walking; not validated at Mars gravity on natural terrain. Speeds are along the surface (treadmill belt speed), so edge time divides the 3D edge length by speed (plan 19.11, weakness 58).",
  },
  walkSpeedRange: {
    id: "walkSpeedRange", value: 0.83, low: 0.56, high: 0.97, unit: "m/s", valueClass: "estimated",
    citation: { source: "Fast: NASA/TM-2010-216138, IST-1 treadmill speeds, 2.3-3.5 km/h. Slow: 2 km/h, EVA-EXP-0042 Rev B (W-01)", location: "Table 4, p. 13; 4.2.1.3.1.1, p. 40" },
    limitation: "A lunar-gravity treadmill speed window, not a measured range on terrain. Incline tests (NASA/TP-2010-216125, pp. 2, 5, 10, 70): 0.12-0.32 g, six male subjects, one 121 kg MKIII suit, speed fixed by protocol, no downhill data. No suited Mars-gravity data exists. The 15-20 deg bin is beyond tested grades. Speeds are along the surface (plan 19.11, weakness 58). Slow bound (W-01, W-02): 0.56 m/s is both the 2 km/h planning pace on level regolith and the lowest speed in the incline tests (\"0.56 to 0.97 m/s\", NASA/TP-2010-216125, p. 70). Apollo 14 uphill legs were slower, 1.42-1.71 km/h (0.39-0.48 m/s; NASA SP-368, ch. 4, Table 4, p. 125) while the whole traverse averaged about 2.5 km/h; with slope factors kept at 1 (V-06), climbs may still be optimistic.",
  },
  slopeLimit: {
    id: "slopeLimit", value: 20, unit: "deg", valueClass: "assumed",
    citation: { source: "NASA EVA-EXP-0042 Rev B, Exploration EVA System Concept of Operations (19 Oct 2020): walking up/down/across a slope of up to 20 deg (plan 6.4)", location: "4.2.1.3, p. 38" },
    limitation: "A lunar xEVA design capability applied to Mars; Assumed, not Mars-validated.",
  },
  skyObstructionM12: {
    id: "skyObstructionM12", value: 0.185, unit: "1", valueClass: "published_observation", // fraction of the 2 pi hemisphere
    citation: { source: "Ehresmann et al. 2021, JGR Planets, doi:10.1029/2021JE006851: 0.37 pi of the 2 pi hemisphere at Butte M12, sols 1456-1467; Guo et al. 2021, GRL, doi:10.1029/2021GL093912: about 19 %", location: "Ehresmann sec. 2.2 and 4 (publisher HTML, no page numbers); Guo sec. 4, p. 6 of 10" },
    limitation: "Geometric sky obstruction at one rover position, used only as the AC-07 benchmark; never converted into dose (plan 6.7).",
  },
  drillWarningDefault: {
    id: "drillWarningDefault", value: 1800, unit: "s", valueClass: "assumed",
    citation: { source: "SharpWalk plan 6.9 (drill default 30 min, Assumed; stress cases 10 and 20 min), informed by Loewe et al. 2025 (arXiv:2502.02469: at least 30 min to avoid the peak) and NASA/TM-20205000837 (Minow et al. 2020, R-1, R-3, p. 49: 10-30 min of warning; at least 30 min for SEPs)", location: "Plan 6.9, p. 32" },
    limitation: "Simulated drill only: an assumed warning time, not a forecast, a live alert or a measurement. Habitat shielding is Assumed, not modelled; no dose is computed.",
  },
} as const satisfies Record<string, Constant>;

export type ConstantId = keyof typeof CONSTANTS;
export const constant = (id: ConstantId): Constant => CONSTANTS[id];

/** Constants whose page/location is still UNRESOLVED; all must be resolved before release. */
export const unresolvedCitations = (): ConstantId[] =>
  (Object.keys(CONSTANTS) as ConstantId[]).filter((k) => CONSTANTS[k].citation.location.startsWith("UNRESOLVED"));
