// SI-assisted: drafted with Claude Code (Claude Opus 5.5) on design/sharpwalk-ui-ux (UI-01); FLOW-01.
import { describe, expect, it } from "vitest";
import { OFF_FLOW, STEPS, stepFromHash } from "./steps";

describe("guided flow steps (FLOW-01)", () => {
  it("follows Map -> Assess -> HUD in the step index", () => {
    expect(STEPS.map((s) => s.id)).toEqual(["map", "assess", "hud"]);
  });
  it("keeps Setup, Planner and Brief reachable by link, off the step index", () => {
    expect([...OFF_FLOW]).toEqual(["setup", "planner", "brief"]);
    for (const s of OFF_FLOW) expect(stepFromHash(`#${s}`)).toBe(s);
  });
  it("reads a known step from the hash and falls back to the welcome screen", () => {
    expect(stepFromHash("#map")).toBe("map");
    expect(stepFromHash("")).toBe("welcome");
    expect(stepFromHash("#planning")).toBe("welcome");
  });
  it("shows the map on Map, Assess and HUD", () => {
    expect(STEPS.filter((s) => s.map).map((s) => s.id)).toEqual(["map", "assess", "hud"]);
  });
});
