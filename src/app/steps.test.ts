// SI-assisted: drafted with Claude Code (Claude Opus 5.5) on design/sharpwalk-ui-ux (UI-01).
import { describe, expect, it } from "vitest";
import { STEPS, stepFromHash } from "./steps";

describe("guided flow steps", () => {
  it("follows Setup -> Planner -> Map -> Assess -> Brief -> HUD (the HUD is for the walk itself, after the briefing)", () => {
    expect(STEPS.map((s) => s.id)).toEqual(["setup", "planner", "map", "assess", "brief", "hud"]);
  });
  it("reads a known step from the hash and falls back to the welcome screen", () => {
    expect(stepFromHash("#map")).toBe("map");
    expect(stepFromHash("brief")).toBe("brief");
    expect(stepFromHash("")).toBe("welcome");
    expect(stepFromHash("#planning")).toBe("welcome");
  });
  it("shows the map on Map, Assess and HUD only", () => {
    expect(STEPS.filter((s) => s.map).map((s) => s.id)).toEqual(["map", "assess", "hud"]);
  });
});
