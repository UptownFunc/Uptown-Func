// SI-assisted: drafted with Claude Code (Claude Opus 5.5); human Data and Science review pending.
// Mars24 sun algorithm (D10). Oracle: NASA GISS, Mars24 Sunclock "Algorithm and Worked Examples" (updated
// 2025-01-07, retrieved 14 Nov 2026), section II, both worked examples, every tabulated step. The page rounds to
// 5 decimals, so a step agrees when it is within 1e-4 of the table. AC-09 (sun elevation within 0.1 deg of Mars24)
// is checked here on the two published dates; the plan's third date needs the Mars24 app itself (PHASES 2.8).
import { describe, expect, it } from "vitest";
import { marsSun, ttMinusUtc_s, type MarsSun } from "./sun";

const close = (a: number, b: number, tol = 1e-4) => expect(Math.abs(a - b)).toBeLessThanOrEqual(tol);
const elevationOf = (z: number) => 90 - z;

function expectSteps(s: MarsSun, t: Record<keyof MarsSun, number>, wider: Partial<Record<keyof MarsSun, number>> = {}) {
  for (const k of Object.keys(t) as (keyof MarsSun)[]) {
    const tol = wider[k] ?? (k === "jdTT" || k === "deltaTJ2000" ? 1e-5 : 1e-4);
    expect.soft(Math.abs(s[k] - t[k]), `${k}: got ${s[k]}, table ${t[k]}`).toBeLessThanOrEqual(tol);
  }
}

describe("Mars24 worked example 1: 2000-01-06 00:00:00 UTC at 0 W, 0 N", () => {
  const s = marsSun(947116800000, 64.184, { frame: "F3", lat: 0, lonW: 0 });
  it("reproduces every tabulated step A-5 .. D-6", () => {
    expectSteps(s, {
      jdTT: 2451549.50074, deltaTJ2000: 4.50074, meanAnomaly_deg: 21.74558, alphaFMS_deg: 272.74566,
      pbs_deg: 0.00142, nuMinusM_deg: 4.44193, ls_deg: 277.18758, eot_deg: -5.18774, mst_h: 23.99425,
      lmst_h: 23.99425, ltst_h: 23.6484, subsolarLonW_deg: 174.726, declination_deg: -25.22825,
      zenith_deg: 154.26182, elevation_deg: elevationOf(154.26182), azimuth_deg: 191.03905,
    });
  });
  it("meets AC-09 (sun elevation within 0.1 deg of Mars24)", () => close(s.elevation_deg, elevationOf(154.26182), 0.1));
});

/** DECISIONS SUN-02: in example 2 the page's own D-1 formula applied to the table's own L_s (327.32416) gives
 *  -13.42040 deg, not the tabulated -13.42065, and D-5 with the tabulated declination gives Z = 151.93935, not
 *  151.93895. Those digits cannot be reproduced from the published equations (example 1 reproduces exactly), so
 *  these three steps are held to 1e-3 deg here; the gap (0.00065 deg) is 150 times inside AC-09's 0.1 deg. */
const SPIRIT_TABLE_INCONSISTENCY = { declination_deg: 1e-3, zenith_deg: 1e-3, elevation_deg: 1e-3 } as const;

describe("Mars24 worked example 2: MER-A Spirit, 2004-01-03 13:46:31 UTC at 184.702 W, -14.640 N", () => {
  const s = marsSun(1073137591000, 64.184, { frame: "F3", lat: -14.64, lonW: 184.702 });
  it("reproduces every tabulated step A-5 .. D-6 (angles reduced to [0, 360))", () => {
    expectSteps(s, {
      jdTT: 2453008.07471, deltaTJ2000: 1463.07471, meanAnomaly_deg: 66.06858, alphaFMS_deg: 317.09457,
      pbs_deg: 0.01614, nuMinusM_deg: 10.22959, ls_deg: 327.32416, eot_deg: -12.77553, mst_h: 13.16537,
      lmst_h: 0.8519, ltst_h: 0.00025, subsolarLonW_deg: 4.705, declination_deg: -13.42065,
      zenith_deg: 151.93895, elevation_deg: elevationOf(151.93895), azimuth_deg: 179.99383,
    }, SPIRIT_TABLE_INCONSISTENCY);
  });
  it("meets AC-09 (sun elevation within 0.1 deg of Mars24)", () => close(s.elevation_deg, elevationOf(151.93895), 0.1));
});

describe("TT - UTC (GISS step A-4)", () => {
  it("is 37 s (TAI - UTC from 1 Jan 2017) + 32.184 s = 69.184 s for 2017 onward", () => {
    expect(ttMinusUtc_s(Date.UTC(2017, 0, 1))).toBe(69.184);
    expect(ttMinusUtc_s(Date.UTC(2026, 10, 14, 12))).toBe(69.184);
  });
  it("refuses earlier dates: the leap-second table before 2017 is not implemented", () => {
    expect(() => ttMinusUtc_s(Date.UTC(2016, 11, 31, 23, 59, 59))).toThrow(RangeError);
  });
});

describe("input checks", () => {
  it("refuses a non-finite time or a latitude off the globe", () => {
    expect(() => marsSun(Number.NaN, 69.184, { frame: "F3", lat: 0, lonW: 0 })).toThrow(RangeError);
    expect(() => marsSun(0, 69.184, { frame: "F3", lat: 91, lonW: 0 })).toThrow(RangeError);
  });
});
