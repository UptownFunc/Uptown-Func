// SI-assisted: drafted with Claude Code (Claude Opus 5.5); human review pending.
import { describe, expect, it } from "vitest";
import { G3_PRESET, presetEnabled } from "./demoPreset";

describe("G3-01 demonstration preset (Assumed values chosen by SI at a team member's direction)", () => {
  it("sets the four plan times and the scenario time, each with a rationale that names who chose it", () => {
    expect(G3_PRESET.map((p) => p.id).sort()).toEqual(["T_EVA", "scenario_utc", "stop_duration", "t_cont", "t_ops"]);
    for (const p of G3_PRESET) {
      expect(Number.isFinite(p.value_s)).toBe(true);
      expect(p.value_s).toBeGreaterThan(0);
      expect(p.rationale).toMatch(/G3-01/);
      expect(p.rationale).toMatch(/chosen by SI at a team member's direction/);
    }
  });

  it("can be switched off for checks of the empty console", () => {
    expect(presetEnabled("")).toBe(true);
    expect(presetEnabled("?preset=none")).toBe(false);
    expect(presetEnabled("?x=1&preset=none")).toBe(false);
    expect(presetEnabled("?preset=g3")).toBe(true);
  });
});
