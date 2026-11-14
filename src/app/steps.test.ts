// SI-assisted: drafted with Claude Code (Claude Opus 5.5) on design/sharpwalk-ui-ux (UI-01).
import { describe, expect, it } from "vitest";
import { STEPS, stepFromHash, stepIndex } from "./steps";

describe("guided flow steps", () => {
  it("follows Setup -> Planner -> Map -> HUD -> Assess -> Brief", () => {
    expect(STEPS.map((s) => s.id)).toEqual(["setup", "planner", "map", "hud", "assess", "brief"]);
  });
  it("reads a known step from the hash and falls back to the welcome screen", () => {
    expect(stepFromHash("#map")).toBe("map");
    expect(stepFromHash("brief")).toBe("brief");
    expect(stepFromHash("")).toBe("welcome");
    expect(stepFromHash("#planning")).toBe("welcome");
  });
  it("orders steps so a move can be told apart as forward or back", () => {
    expect(stepIndex("welcome")).toBe(-1);
    expect(stepIndex("setup")).toBeLessThan(stepIndex("assess"));
  });
  it("shows the map on Map, HUD and Assess only", () => {
    expect(STEPS.filter((s) => s.map).map((s) => s.id)).toEqual(["map", "hud", "assess"]);
  });
});
