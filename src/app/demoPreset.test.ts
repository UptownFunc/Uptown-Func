// SI-assisted: drafted with Claude Code (Claude Opus 5.5; revised with Claude Fable 5.2); human review pending.
import { describe, expect, it } from "vitest";
import { DEMO_PRESET, presetEnabled } from "./demoPreset";

const value = (id: string) => DEMO_PRESET.find((p) => p.id === id)!.value_s;
const why = (id: string) => DEMO_PRESET.find((p) => p.id === id)!.rationale;

describe("REG-01 demonstration preset (Assumed values; plan times taken from cited NASA planning documents)", () => {
  it("sets the four plan times and the scenario time", () => {
    expect(DEMO_PRESET.map((p) => p.id).sort()).toEqual(["T_EVA", "scenario_utc", "stop_duration", "t_cont", "t_ops"]);
    expect(value("T_EVA")).toBe(360 * 60);
    expect(value("t_ops")).toBe(60 * 60);
    expect(value("t_cont")).toBe(60 * 60);
    expect(value("stop_duration")).toBe(45 * 60);
    expect(value("scenario_utc")).toBe(Date.UTC(2026, 10, 15, 12, 0) / 1000);
  });

  it("cites a document and page for every plan time and says it is a lunar figure applied to Mars", () => {
    for (const id of ["T_EVA", "t_ops", "t_cont"]) expect(why(id)).toMatch(/EVA-EXP-0042 Rev B, [\d.]+, p\. \d+/);
    expect(why("stop_duration")).toMatch(/NASA\/TM-2010-216138, Tables 2-3, p\. 12/);
    for (const id of ["T_EVA", "t_ops", "t_cont", "stop_duration"]) expect(why(id)).toMatch(/lunar.*applied to Mars/);
  });

  it("keeps every value Assumed, names REG-01 and who picked it, and never claims safety or validation", () => {
    for (const p of DEMO_PRESET) {
      expect(p.rationale).toMatch(/^REG-01, Assumed/);
      expect(p.rationale).toMatch(/SI at a team member's direction/);
      expect(p.rationale).not.toMatch(/\bsafe|validated|guarantee|according to NASA/i);
    }
  });

  it("states that the scenario time is a scenario input, not a sourced value", () => {
    expect(why("scenario_utc")).toMatch(/scenario input/);
    expect(why("scenario_utc")).not.toMatch(/p\. \d+/);
  });

  it("can be switched off for checks of the empty console", () => {
    expect(presetEnabled("")).toBe(true);
    expect(presetEnabled("?preset=none")).toBe(false);
    expect(presetEnabled("?x=1&preset=none")).toBe(false);
    expect(presetEnabled("?preset=g3")).toBe(true);
  });
});
