// SI-assisted: drafted with Claude Code (Claude Opus 5.5); human Design review pending.
// Display formatting for engine Quantities. The engine keeps seconds; the UI shows SI minutes (CLAUDE.md).
// Estimates are shown as ranges marked "est." (the caller italicises them); unknown values stay "unknown".
import type { Quantity } from "../contracts";
import { MARS_CLOCK_UNIT } from "../engine/sun";

export interface Formatted { readonly text: string; readonly estimated: boolean; readonly unknown: boolean }

const min = (s: number) => (s / 60).toFixed(1);

/** "est. a to b min": words, not a dash, so negative margins stay readable ("est. -52.7 to -17.8 min"). */
export const estRange = (low_s: number, high_s: number): string => `est. ${min(low_s)} to ${min(high_s)} min`;

export function formatDuration(q: Quantity): Formatted {
  if (q.valueClass === "unknown" || q.value === null) return { text: "unknown", estimated: false, unknown: true };
  if (q.unit !== "s") throw new RangeError(`durations must arrive in seconds, got ${q.unit}`);
  if (q.valueClass === "estimated") {
    if (q.low === undefined || q.high === undefined) throw new RangeError("an estimate must carry a low-high range");
    return { text: estRange(q.low, q.high), estimated: true, unknown: false };
  }
  return { text: `${min(q.value)} min`, estimated: false, unknown: false };
}

/** Any engine Quantity: durations in SI minutes, angles to 0.1 deg, Mars local time as an HH:MM clock label
 *  (truncated, like a clock), other units as value and unit. Unknown stays unknown. */
export function formatQuantity(q: Quantity): Formatted {
  if (q.unit === "s") return formatDuration(q);
  if (q.valueClass === "unknown" || q.value === null) return { text: "unknown", estimated: false, unknown: true };
  const est = q.valueClass === "estimated";
  if (q.unit === "deg") return { text: `${est ? "est. " : ""}${q.value.toFixed(1)}°`, estimated: est, unknown: false };
  if (q.unit === MARS_CLOCK_UNIT) {
    const m = Math.floor(q.value * 60) % 1440;
    return { text: `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")} LMST`, estimated: false, unknown: false };
  }
  return { text: `${est ? "est. " : ""}${q.value} ${q.unit}`, estimated: est, unknown: false };
}

/** A UTC instant (Unix seconds) as "YYYY-MM-DD HH:MM UTC". */
export function formatUtc(s: number): string {
  return `${new Date(s * 1000).toISOString().slice(0, 16).replace("T", " ")} UTC`;
}

/** Engine lengths (model-derived from D1); the caller carries the Quantity metadata. */
export function formatLength(m: number): string {
  return m < 1000 ? `${Math.round(m)} m` : `${(m / 1000).toFixed(2)} km`;
}
