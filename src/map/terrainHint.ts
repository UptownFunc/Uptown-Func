// SI-assisted: drafted with Claude Code (Claude Opus 5.5) on design/sharpwalk-ui-ux (UI-11); human review pending.
// Point and click: what a click at the cursor will do, from the pipeline's terrain classes (the engine uses the same
// grid, so the hint and the engine's refusal never disagree). The limit is the constants register's Assumed value.
import { CONSTANTS } from "../constants";

export type TerrainHint = { kind: "ok" | "no" | "unknown"; text: string };

/** cls: 1 candidate (slope-screened), 2 excluded (steeper than the limit), 0 unknown; null outside the grid or no data. */
export function terrainHint(cls: number | null): TerrainHint {
  if (cls === 1) return { kind: "ok", text: "Slope-screened ground · click to add a stop" };
  if (cls === 2) return { kind: "no", text: `Steeper than the Assumed ${CONSTANTS.slopeLimit.value}° slope limit · no stop here` };
  if (cls === 0) return { kind: "unknown", text: "Unknown ground (no slope value) · no stop here" };
  return { kind: "unknown", text: "No terrain class here · a stop cannot be checked" };
}
