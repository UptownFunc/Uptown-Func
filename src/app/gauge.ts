// SI-assisted: drafted with Claude Code (Claude Opus 5.5) on design/sharpwalk-ui-ux (UI-14); human review pending.
// The Assess meter: a moving-coil style dial with three zones, OVER, NEAR LIMIT and OK, using the margin bands of
// src/engine/margin (OK at or above 10% of T_EVA, NEAR LIMIT from 0 to under 10%, OVER below 0). The needle reads the
// slow-bound end margin, the same value the state uses. The dial carries words, not numbers: the number itself is the
// estimate printed under it, as a Quantity that opens its source. Display mapping only; no new science.
import type { MarginState } from "../contracts";

/** Dial zones in degrees from straight up (-90 left ... +90 right). */
export const ZONES: readonly { state: MarginState; from: number; to: number }[] = [
  { state: "OVER", from: -90, to: -30.5 },
  { state: "NEAR_LIMIT", from: -30, to: 9.5 },
  { state: "OK", from: 10, to: 90 },
];

/** Needle angle for an end margin (seconds, slow bound) against T_EVA (seconds); rest (-90) when either is unknown. */
export function needleAngle(margin_s: number | null, tEva_s: number | null): number {
  if (margin_s === null || tEva_s === null || !Number.isFinite(margin_s) || !(tEva_s > 0)) return -90;
  const f = margin_s / tEva_s;
  if (f < 0) return -31 + (Math.max(f, -0.5) / 0.5) * 59;
  if (f < 0.1) return -30 + (f / 0.1) * 39;
  return 10 + ((Math.min(f, 0.6) - 0.1) / 0.5) * 80;
}

/** SVG arc path for a zone on a dial of radius r centred at (cx, cy). */
export function arc(cx: number, cy: number, r: number, from: number, to: number): string {
  const p = (a: number) => [cx + r * Math.sin((a * Math.PI) / 180), cy - r * Math.cos((a * Math.PI) / 180)] as const;
  const [x1, y1] = p(from), [x2, y2] = p(to);
  return `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 0 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`;
}
