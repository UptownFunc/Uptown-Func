// SI-assisted: drafted with Claude Code (Claude Opus 5.5); human Data and Science review pending.
// CLAUDE.md: every science constant needs a source citation and page; Assumed values are labelled.
import { describe, expect, it } from "vitest";
import { CONSTANTS, constant, unresolvedCitations } from "./index";

describe("constants register", () => {
  it("cites a source and a location (or marks it UNRESOLVED) for every constant", () => {
    for (const c of Object.values(CONSTANTS)) {
      expect(c.citation.source.length).toBeGreaterThan(0);
      expect(c.citation.location.length).toBeGreaterThan(0);
    }
  });

  it("lists exactly the known unresolved citations, so no new constant can ship without a page", () => {
    expect(unresolvedCitations().sort()).toEqual(["skyObstructionM12"]);
  });

  it("does not present the nominal walking speed as an observation", () => {
    expect(constant("walkSpeedNominal").valueClass).toBe("assumed");
  });

  it("labels the slope limit as Assumed, not measured", () => {
    expect(constant("slopeLimit").valueClass).toBe("assumed");
    expect(constant("slopeLimit").value).toBe(20);
    expect(constant("slopeLimit").unit).toBe("deg");
  });

  it("cites the slope limit to the xEVA concept of operations with its section and page (REG-01)", () => {
    const s = constant("slopeLimit");
    expect(s.citation.source).toContain("EVA-EXP-0042 Rev B");
    expect(s.citation.location).toBe("4.2.1.3, p. 38");
    expect(s.limitation).toMatch(/lunar/i);
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
    // Plan 19.5: IST-1 suited walking range 2.3-3.5 km/h, NASA/TM-2010-216138, Table 4, p. 13.
    expect(r.citation.source).toContain("NASA/TM-2010-216138");
    expect(r.citation.location).toBe("Table 4, p. 13");
  });

  it("states that walking speeds are along the surface (plan 19.11, weakness 58)", () => {
    expect(constant("walkSpeedNominal").limitation).toMatch(/along the surface/i);
    expect(constant("walkSpeedRange").limitation).toMatch(/along the surface/i);
  });

  it("holds the drill warning time as an Assumed 30 min default, cited to plan 6.9", () => {
    const d = constant("drillWarningDefault");
    expect([d.value, d.unit, d.valueClass]).toEqual([1800, "s", "assumed"]);
    expect(d.citation.location).toBe("Plan 6.9, p. 32");
    expect(d.limitation).toMatch(/Simulated/);
  });

  it("does not hold a workload rate (kJ workload is off)", () => {
    expect(Object.keys(CONSTANTS).some((k) => /workload|metabolic|kj/i.test(k))).toBe(false);
  });

  it("uses SI units only", () => {
    for (const c of Object.values(CONSTANTS)) expect(["m", "m/s", "deg", "1", "s"]).toContain(c.unit);
  });
});
