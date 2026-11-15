// SI-assisted: drafted with Claude Code (Claude Opus 5.5) on design/sharpwalk-ui-ux (UI-14).
import { describe, expect, it } from "vitest";
import { marginState } from "../engine/margin";
import { ZONES, needleAngle } from "./gauge";

const T = 360 * 60;

describe("return-margin meter (UI-14): the needle uses the same bands as the margin state", () => {
  it("parks at rest when the margin is unknown", () => {
    expect(needleAngle(null, T)).toBe(-90);
    expect(needleAngle(600, null)).toBe(-90);
  });
  it("puts every margin in the zone of its own state (OK >= 10% of T_EVA, NEAR LIMIT 0-10%, OVER < 0)", () => {
    for (const m of [-3 * T, -0.5 * T, -60, 0, 0.05 * T, 0.0999 * T, 0.1 * T, 0.3 * T, 2 * T]) {
      const a = needleAngle(m, T), z = ZONES.find((z) => a >= z.from && a <= z.to)!;
      expect(z.state, `margin ${m} s`).toBe(marginState(m, T));
    }
  });
  it("stays on the dial: from -90 to +90 degrees, rising with the margin", () => {
    const xs = [-2 * T, -0.1 * T, 0, 0.05 * T, 0.1 * T, 0.4 * T, 3 * T].map((m) => needleAngle(m, T));
    for (const a of xs) { expect(a).toBeGreaterThanOrEqual(-90); expect(a).toBeLessThanOrEqual(90); }
    for (let i = 1; i < xs.length; i++) expect(xs[i]!).toBeGreaterThanOrEqual(xs[i - 1]!);
  });
});
