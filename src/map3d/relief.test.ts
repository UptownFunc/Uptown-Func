// SI-assisted: drafted with Claude Code (Claude Opus 5.5) (3D-09); human Data and Science review pending.
// 3D-09 relief lighting: the light is the D1 hillshade's (same direction, built in F6 through src/geo), the shader
// only darkens (one factor for R, G and B, so the D2 colour keeps its hue), Cesium will accept it on terrain without
// vertex normals, and the 3D view never shows the lighting and the hillshade image together.
import { describe, expect, it } from "vitest";
import { f1, f5ToF6, localFrame } from "../geo";
import { RELIEF_LIGHT, RELIEF_SHADER, RELIEF_STRENGTH, pickBase, reliefLightF5, reliefSource, reliefUpF5 } from "./relief";

const origin = f1(-4.815, 137.39, -3506);
/** The light's direction of travel back in the F6 frame at the origin (east, north, up), through a point 1,000 km
 *  along it (next to F5 coordinates of ~3.4e6 m, a 1 m step would lose ~1e-10 to rounding). */
function travelF6(at = origin): [number, number, number] {
  const fr = localFrame(at), o = fr.originF5, v = reliefLightF5(at), k = 1e6;
  const q = f5ToF6({ frame: "F5", x: o.x + k * v[0], y: o.y + k * v[1], z: o.z + k * v[2] }, fr);
  return [q.e / k, q.n / k, q.u / k];
}

/** pipeline/sharpwalk/display.py hillshade_u8 (Horn, as gdaldem) on a 3 x 3 window, before the 8-bit rounding.
 *  Row 0 is north, column 0 west; dx, dy in metres. */
function hornHillshade(z: number[][], dx: number, dy: number, azimuth_deg: number, altitude_deg: number): number {
  const [[a, b, c], [d, , f], [g, h, i]] = z as [[number, number, number], [number, number, number], [number, number, number]];
  const gx = ((c + 2 * f + i) - (a + 2 * d + g)) / (8 * dx), gy = ((g + 2 * h + i) - (a + 2 * b + c)) / (8 * dy);
  const slope = Math.atan(Math.hypot(gx, gy)), aspect = Math.atan2(gy, -gx);
  const zen = ((90 - altitude_deg) * Math.PI) / 180, az = ((360 - azimuth_deg + 90) * Math.PI) / 180;
  return Math.min(1, Math.max(0, Math.cos(zen) * Math.cos(slope) + Math.sin(zen) * Math.sin(slope) * Math.cos(az - aspect)));
}

describe("3D-09 relief light", () => {
  it("is the D1 hillshade's light: azimuth 315 deg (from the north-west), 45 deg above the horizon", () => {
    expect(RELIEF_LIGHT).toEqual({ azimuth_deg: 315, altitude_deg: 45 });
  });

  it("travels from the north-west, down at 45 deg, in the F6 frame at the sheet (unit length)", () => {
    const [e, n, u] = travelF6();
    expect(Math.hypot(...reliefLightF5(origin))).toBeCloseTo(1, 14);
    expect(Math.hypot(e, n, u)).toBeCloseTo(1, 12);
    expect(e).toBeCloseTo(0.5, 9); // towards the east...
    expect(n).toBeCloseTo(-0.5, 9); // ...and the south: it comes from the north-west
    expect(u).toBeCloseTo(-Math.SQRT1_2, 9);
  });

  it("has the sheet's own up: unit length, the F6 up at the origin", () => {
    const fr = localFrame(origin), o = fr.originF5, v = reliefUpF5(origin), k = 1e6;
    expect(Math.hypot(...v)).toBeCloseTo(1, 14);
    const q = f5ToF6({ frame: "F5", x: o.x + k * v[0], y: o.y + k * v[1], z: o.z + k * v[2] }, fr);
    expect([q.e / k, q.n / k, q.u / k].map((x) => Math.round(x * 1e9) / 1e9)).toEqual([0, 0, 1]);
  });

  it("is built at the sheet's own origin (another place on the sphere gets its own north-west)", () => {
    const far = f1(30, -60, 0), [e, n, u] = travelF6(far);
    expect([e, n, u].map((x) => Number(x.toFixed(9)))).toEqual([0.5, -0.5, -Number(Math.SQRT1_2.toFixed(9))]);
    expect(reliefLightF5(far)).not.toEqual(reliefLightF5(origin));
  });

  it("lights any plane exactly as the 2D sheet's D1 hillshade does (Lambert = the Horn hillshade formula)", () => {
    const [te, tn, tu] = travelF6();
    const toLight = [-te, -tn, -tu];
    // Planes z = p * east + q * north, sampled on a 1 m 3 x 3 window (row 0 north), as the pipeline's kernel sees them.
    for (const [p, q] of [[0, 0], [0.2, 0], [-0.2, 0], [0, 0.3], [0.15, -0.25], [-0.36, 0.36], [0.8, 0.8], [-1.5, 0.2]] as const) {
      const z = [1, 0, -1].map((north) => [-1, 0, 1].map((east) => p * east + q * north));
      const len = Math.hypot(p, q, 1), nrm = [-p / len, -q / len, 1 / len];
      const lambert = Math.max(0, nrm[0]! * toLight[0]! + nrm[1]! * toLight[1]! + nrm[2]! * toLight[2]!);
      expect(lambert, `plane ${p}, ${q}`).toBeCloseTo(hornHillshade(z, 1, 1, RELIEF_LIGHT.azimuth_deg, RELIEF_LIGHT.altitude_deg), 12);
    }
  });
});

describe("3D-09 relief shader", () => {
  it("can run on terrain without vertex normals: Cesium drops a globe material whose source names 'slope' or 'normalEC'", () => {
    expect(RELIEF_SHADER).not.toMatch(/slope/);
    expect(RELIEF_SHADER).not.toContain("normalEC");
  });
  it("lights the rendered D1 surface from the scene's light: facet normal from screen-space derivatives", () => {
    expect(RELIEF_SHADER).toMatch(/cross\(\s*dFdx\(/);
    expect(RELIEF_SHADER).toContain("czm_lightDirectionEC");
  });
  it("shades near-vertical facets (Cesium's tile skirts, seen through hairline cracks) as level ground: no seam lines", () => {
    expect(RELIEF_SHADER).toMatch(/mix\(\s*u\s*,\s*n\s*,\s*smoothstep\(\s*0\.03\s*,\s*0\.12\s*,\s*dot\(n,\s*u\)\s*\)\s*\)/);
    expect(RELIEF_SHADER).toContain("czm_viewRotation * upWC");
  });
  it("only darkens, by one factor for R, G and B: the material is black, blended by its alpha", () => {
    expect(RELIEF_SHADER).toMatch(/\.diffuse\s*=\s*vec3\(0\.0\)/);
    expect(RELIEF_SHADER).not.toMatch(/\.(emission|specular|normal)\s*=/);
    expect(RELIEF_STRENGTH).toBeGreaterThan(0);
    expect(RELIEF_STRENGTH).toBeLessThanOrEqual(0.5); // restrained: shaded ground keeps at least half its brightness
  });
});

describe("3D-09 one relief at a time", () => {
  it("terrain lighting replaces the hillshade image; the hillshade image shows only with lighting off", () => {
    expect(reliefSource(true, true)).toBe("lit");
    expect(reliefSource(false, true)).toBe("lit");
    expect(reliefSource(true, false)).toBe("hillshade");
    expect(reliefSource(false, false)).toBe("none");
  });
});

describe("3D-09 the base image under the lighting", () => {
  const relief = "relief image", plain = "plain image";
  it("lights the plain image; shows the hillshade image unlit if the plain one could not be loaded", () => {
    expect(pickBase({ relief, plain }, "plain", true)).toEqual({ shown: plain, light: true });
    expect(pickBase({ relief }, "plain", true)).toEqual({ shown: relief, light: false });
    expect(pickBase({}, "plain", true)).toEqual({ shown: undefined, light: false });
  });
  it("without lighting behaves as before 3D-09 (a missing hillshade image falls back to the plain one)", () => {
    expect(pickBase({ relief, plain }, "relief", false)).toEqual({ shown: relief, light: false });
    expect(pickBase({ plain }, "relief", false)).toEqual({ shown: plain, light: false });
    expect(pickBase({ relief }, "plain", false)).toEqual({ shown: undefined, light: false });
  });
  it("never lights the hillshade image, whatever is loaded", () => {
    for (const base of [{}, { relief }, { plain }, { relief, plain }]) for (const want of ["relief", "plain"] as const) for (const lit of [false, true]) {
      const r = pickBase(base as { relief?: string; plain?: string }, want, lit);
      expect(r.light && r.shown === relief).toBe(false);
      expect(r.light).toBe(lit && r.shown === plain);
    }
  });
});
