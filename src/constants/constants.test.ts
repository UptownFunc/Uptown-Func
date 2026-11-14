// SI-assisted: drafted with Claude Code (Claude Opus 5.5); human Data and Science review pending.
// CLAUDE.md: every science constant needs a source citation and page; Assumed values are labelled.
import { describe, expect, it } from "vitest";
import { CONSTANTS, constant } from "./index";

describe("constants register", () => {
  it("cites a source and a location (or marks it UNRESOLVED) for every constant", () => {
    for (const c of Object.values(CONSTANTS)) {
      expect(c.citation.source.length).toBeGreaterThan(0);
      expect(c.citation.location.length).toBeGreaterThan(0);
    }
  });

  it("labels the slope limit as Assumed, not measured", () => {
    expect(constant("slopeLimit").valueClass).toBe("assumed");
    expect(constant("slopeLimit").value).toBe(20);
    expect(constant("slopeLimit").unit).toBe("deg");
  });

  it("holds the nominal walking speed with its NASA/TM citation", () => {
    const v = constant("walkSpeedNominal");
    expect(v.value).toBe(0.83);
    expect(v.unit).toBe("m/s");
    expect(v.citation.source).toContain("NASA/TM-2010-216138");
    expect(v.citation.location).toBe("Table 4, p. 13");
  });

  it("keeps the speed range estimated, as a range, with its limitation stated", () => {
    const r = constant("walkSpeedRange");
    expect(r.valueClass).toBe("estimated");
    expect([r.low, r.high]).toEqual([0.64, 0.97]);
    expect(r.limitation).toMatch(/lunar/i);
  });

  it("does not hold a workload rate (kJ workload is off)", () => {
    expect(Object.keys(CONSTANTS).some((k) => /workload|metabolic|kj/i.test(k))).toBe(false);
  });

  it("uses SI units only", () => {
    for (const c of Object.values(CONSTANTS)) expect(["m", "m/s", "deg", "1"]).toContain(c.unit);
  });
});
