// SI-assisted: drafted with Claude Code (Claude Opus 5.5); human Design review pending.
// The AREA sheet's view at load, in one dependency-free place: AreaSheet uses it, and the e2e helpers read the live
// view from the sheet's `data-view-f7` attribute (MAP-01). The centre is the area grid origin (build_report.json).
/** F7 metres per screen pixel when the sheet opens on a window too small to measure (and the closest load view). */
export const INITIAL_RESOLUTION_F7 = 4;
/** The widest the sheet zooms out (F7 m per CSS px). */
export const MAX_RESOLUTION_F7 = 16;

/** Space kept round the sheet at load, in CSS px (top, right, bottom, left); the right side leaves room for the map keys. */
export const FIT_PADDING: readonly [number, number, number, number] = [28, 60, 28, 28]; // top, right, bottom, left

/** MAP-01: the load view shows the whole sheet (habitat included) inside the padding. Never closer than
 *  INITIAL_RESOLUTION_F7 (a large screen keeps the earlier load view) nor wider than MAX_RESOLUTION_F7; a window with
 *  no size yet keeps INITIAL_RESOLUTION_F7. */
export function fitResolution(extentW_m: number, extentH_m: number, viewW_px: number, viewH_px: number,
  pad: readonly [number, number, number, number] = FIT_PADDING): number {
  const w = viewW_px - pad[1] - pad[3], h = viewH_px - pad[0] - pad[2];
  if (!(w > 0 && h > 0 && extentW_m > 0 && extentH_m > 0)) return INITIAL_RESOLUTION_F7;
  return Math.min(MAX_RESOLUTION_F7, Math.max(INITIAL_RESOLUTION_F7, extentW_m / w, extentH_m / h));
}

/** The live view as the sheet publishes it on `data-view-f7` ("x y resolution"), for tests and tools that turn F1
 *  positions into pixels. Read only; nothing in the app reads it back. */
export function formatView(x: number, y: number, resolution: number): string {
  return `${x.toFixed(3)} ${y.toFixed(3)} ${resolution.toFixed(6)}`;
}
export function parseView(s: string | null): { x: number; y: number; resolution: number } | null {
  const v = (s ?? "").split(" ").map(Number);
  return v.length === 3 && v.every(Number.isFinite) ? { x: v[0]!, y: v[1]!, resolution: v[2]! } : null;
}
