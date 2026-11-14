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
    // REG-02: the last one (skyObstructionM12) was resolved when a team member read Ehresmann et al. 2021 in full.
    expect(unresolvedCitations().sort()).toEqual([]);
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
    // W-01 decided (DECISIONS, Sun 15 Nov 2026): the slow bound is the 2 km/h planning pace of EVA-EXP-0042 Rev B,
    // 4.2.1.3.1.1, p. 40 (0.56 m/s), not the 2.3 km/h lower edge of the IST-1 treadmill window (0.64 m/s).
    expect([r.low, r.high]).toEqual([0.56, 0.97]);
    expect(r.limitation).toMatch(/lunar/i);
    // Plan 19.5: IST-1 treadmill window 2.3-3.5 km/h, NASA/TM-2010-216138, Table 4, p. 13 (the fast bound).
    expect(r.citation.source).toContain("NASA/TM-2010-216138");
    expect(r.citation.source).toContain("EVA-EXP-0042 Rev B");
    expect(r.citation.location).toBe("Table 4, p. 13; 4.2.1.3.1.1, p. 40");
  });

  it("keeps the slow bound at or below every planning pace found in the cited documents (W-01)", () => {
    const kmh = (mps: number) => mps * 3.6;
    expect(kmh(constant("walkSpeedRange").low!)).toBeLessThanOrEqual(2.0 + 0.02); // 2 km/h, EVA-EXP-0042 Rev B, p. 40
    expect(constant("walkSpeedRange").low!).toBeLessThan(constant("walkSpeedNominal").value);
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

  // REG-02 (docs/data/reg-02-verification.md): citations re-read in the sources themselves.
  it("says the speed range is a treadmill speed window and cites the pages read in NASA/TP-2010-216125", () => {
    const r = constant("walkSpeedRange");
    expect(r.citation.source).toMatch(/treadmill/i);
    expect(r.limitation).toContain("NASA/TP-2010-216125, pp. 2, 5, 10, 70");
    expect(r.limitation).toMatch(/speed fixed by protocol/);
  });

  it("names the documents behind the drill warning time by number, with the page read", () => {
    const d = constant("drillWarningDefault");
    expect(d.citation.source).toContain("arXiv:2502.02469");
    expect(d.citation.source).toContain("NASA/TM-20205000837");
    expect(d.citation.source).toContain("p. 49");
  });

  it("cites the sections read for 0.37 pi at M12 and the page read for the 19 % figure", () => {
    const m = constant("skyObstructionM12");
    expect(m.value).toBe(0.185);
    expect(m.citation.location).toContain("Ehresmann sec. 2.2 and 4");
    expect(m.citation.location).toContain("p. 6 of 10");
  });

  it("does not hold a workload rate (kJ workload is off)", () => {
    expect(Object.keys(CONSTANTS).some((k) => /workload|metabolic|kj/i.test(k))).toBe(false);
  });

  it("uses SI units only", () => {
    for (const c of Object.values(CONSTANTS)) expect(["m", "m/s", "deg", "1", "s"]).toContain(c.unit);
  });
});
