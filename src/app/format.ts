// SI-assisted: drafted with Claude Code (Claude Opus 5.5); human Design review pending.
// Display formatting for engine Quantities. The engine keeps seconds; the UI shows SI minutes (CLAUDE.md).
// Estimates are shown as ranges marked "est." (the caller italicises them); unknown values stay "unknown".
import type { Quantity } from "../contracts";

export interface Formatted { readonly text: string; readonly estimated: boolean; readonly unknown: boolean }

const min = (s: number) => (s / 60).toFixed(1);

export function formatDuration(q: Quantity): Formatted {
  if (q.valueClass === "unknown" || q.value === null) return { text: "unknown", estimated: false, unknown: true };
  if (q.unit !== "s") throw new RangeError(`durations must arrive in seconds, got ${q.unit}`);
  if (q.valueClass === "estimated") {
    if (q.low === undefined || q.high === undefined) throw new RangeError("an estimate must carry a low-high range");
    return { text: `est. ${min(q.low)}-${min(q.high)} min`, estimated: true, unknown: false };
  }
  return { text: `${min(q.value)} min`, estimated: false, unknown: false };
}

/** Engine lengths (model-derived from D1); the caller carries the Quantity metadata. */
export function formatLength(m: number): string {
  return m < 1000 ? `${Math.round(m)} m` : `${(m / 1000).toFixed(2)} km`;
}
