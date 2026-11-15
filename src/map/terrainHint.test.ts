// SI-assisted: drafted with Claude Code (Claude Opus 5.5) on design/sharpwalk-ui-ux (UI-11); human review pending.
import { describe, expect, it } from "vitest";
import { terrainHint } from "./terrainHint";

describe("cursor terrain hint (point and click, UI-11)", () => {
  it("invites a click only on slope-screened ground (class CANDIDATE), with the pipeline's own classes", () => {
    expect(terrainHint(1)).toEqual({ kind: "ok", text: "Slope-screened ground · click to add a stop" });
  });
  it("says why a click will be refused on excluded ground, naming the limit as Assumed", () => {
    expect(terrainHint(2)).toEqual({ kind: "no", text: "Steeper than the Assumed 20° slope limit · no stop here" });
  });
  it("keeps unknown ground and missing data unknown, never routable", () => {
    expect(terrainHint(0).kind).toBe("unknown");
    expect(terrainHint(null)).toEqual({ kind: "unknown", text: "No terrain class here · a stop cannot be checked" });
  });
});
