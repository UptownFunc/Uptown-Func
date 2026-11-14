// SI-assisted: drafted with Claude Code (Claude Opus 5.5); human Data and Science review pending.
// F1 -> planetographic latitude and west-positive longitude, the input convention of the Mars24 algorithm (D10).
// Oracle: plan 7.3 step 4, tan(phi_g) = (a/c)^2 tan(phi_c) with a = 3,396,190 m and c = 3,376,200 m (IAU_2015:49902),
// and lambda_W = 360 - lambda_E.
import { describe, expect, it } from "vitest";
import { f1 } from "./index";
import { f1ToPlanetographic } from "./planetographic";

const close = (a: number, b: number, tol: number) => expect(Math.abs(a - b)).toBeLessThanOrEqual(tol);
const k = (3_396_190 / 3_376_200) ** 2;

describe("F1 -> planetographic (F3 convention: planetographic latitude, west-positive longitude)", () => {
  it("tags the result so its numbers are never mistaken for F1", () => {
    expect(f1ToPlanetographic(f1(0, 0, 0)).frame).toBe("F3");
  });

  it("applies tan(phi_g) = (a/c)^2 tan(phi_c) at the area centre", () => {
    const g = f1ToPlanetographic(f1(-4.815, 137.39, -3506.337));
    close(g.lat, (Math.atan(k * Math.tan((-4.815 * Math.PI) / 180)) * 180) / Math.PI, 1e-12);
    // Plan 7.3: planetographic differs from planetocentric by about 0.049 to 0.060 deg across the D1 extent.
    expect(g.lat - -4.815).toBeLessThan(-0.049);
    expect(g.lat - -4.815).toBeGreaterThan(-0.060);
  });

  it("keeps the equator and the poles fixed", () => {
    close(f1ToPlanetographic(f1(0, 10, 0)).lat, 0, 1e-12);
    close(f1ToPlanetographic(f1(90, 10, 0)).lat, 90, 1e-12);
    close(f1ToPlanetographic(f1(-90, 10, 0)).lat, -90, 1e-12);
  });

  it("flips longitude to west-positive in [0, 360)", () => {
    close(f1ToPlanetographic(f1(-4.815, 137.39, 0)).lonW, 222.61, 1e-9);
    close(f1ToPlanetographic(f1(0, -10, 0)).lonW, 10, 1e-9);
    expect(f1ToPlanetographic(f1(0, 0, 0)).lonW).toBe(0);
    expect(f1ToPlanetographic(f1(0, 180, 0)).lonW).toBe(180);
    expect(f1ToPlanetographic(f1(0, -180, 0)).lonW).toBe(180);
  });
});
