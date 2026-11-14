// SI-assisted: drafted with Claude Code (Claude Opus 5.5); human Data and Science review pending.
// D7: the build-time REMS snapshot (pipeline sharpwalk/run_rems.py -> public/conditions/rems.json), shown in the
// Conditions panel as "conditions at Curiosity on [date], for context" (plan 19.11 weakness 27). The schema is local
// to the app until the team agrees a contract for it (DECISIONS C-18); it adds nothing to src/contracts.
import { z } from "zod";
import type { Quantity } from "../contracts";
import type { SourceDescription } from "./sources";

const n = z.number().finite();
export const RemsSnapshot = z.object({
  id: z.literal("D7"),
  valueClass: z.literal("directly_measured"),
  reading: z.object({
    sol: z.number().int().nonnegative(), terrestrialDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    ls_deg: n.nullable(), airTempMin_C: n, airTempMax_C: n, pressure_Pa: n,
  }),
  source: z.object({
    title: z.string().min(1), url: z.string().url(), retrievedAt: z.string().min(1),
    sha256: z.string().regex(/^[0-9a-f]{64}$/), disclaimer: z.string().min(1),
  }),
});
export type RemsSnapshot = z.infer<typeof RemsSnapshot>;

const METHOD = "D7:rems-daily-summary";
const q = (value: number, unit: string): Quantity => ({ value, unit, valueClass: "directly_measured", methodId: METHOD, assumptionIds: [], sourceIds: ["D7"] });

export function remsQuantities(s: RemsSnapshot): { airTempMin: Quantity; airTempMax: Quantity; pressure: Quantity } {
  const r = s.reading;
  return { airTempMin: q(r.airTempMin_C, "°C"), airTempMax: q(r.airTempMax_C, "°C"), pressure: q(r.pressure_Pa, "Pa") };
}

export function remsSource(s: RemsSnapshot): SourceDescription {
  const r = s.reading;
  return {
    id: "D7", kind: "dataset", title: `D7: ${s.source.title}`,
    detail: `Directly measured, sol ${r.sol} (${r.terrestrialDate}); at the rover, not at the boxwork, and not a forecast for the scenario date. Daily summary as delivered; units read as °C and Pa (not labelled in the feed; DECISIONS REMS-01). Retrieved ${s.source.retrievedAt}; ${s.source.url}; sha256 ${s.source.sha256.slice(0, 12)}. Provider's disclaimer: "${s.source.disclaimer}"`,
  };
}
