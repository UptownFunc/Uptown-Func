// SI-assisted: drafted with Claude Code (Claude Opus 5.5); human Data and Science review pending.
// Plan 7.3: every frame change goes through this module, F1 -> F5 -> F6 only, on the F1 sphere.
// F1 heights are added to R as in plan step 1; whether D1 heights are sphere-relative is UNVERIFIED (D-05).
// Points carry a frame tag so raw latitude/longitude numbers are never passed between frames.
import { CONSTANTS } from "../constants";

export const R_F1: number = CONSTANTS.sphereRadiusF1.value;

export interface F1Point { readonly frame: "F1"; readonly lat: number; readonly lon: number; readonly h: number }
export interface F5Point { readonly frame: "F5"; readonly x: number; readonly y: number; readonly z: number }
export interface F6Point { readonly frame: "F6"; readonly e: number; readonly n: number; readonly u: number }
export interface LocalFrame { readonly origin: F1Point; readonly originF5: F5Point }

const rad = (d: number) => (d * Math.PI) / 180;
const deg = (r: number) => (r * 180) / Math.PI;

/** F1: planetocentric latitude (deg), east-positive longitude -180..180 (deg), height h (m). */
export function f1(lat: number, lon: number, h: number): F1Point {
  if (!Number.isFinite(lat) || lat < -90 || lat > 90) throw new RangeError(`F1 latitude out of range: ${lat}`);
  if (!Number.isFinite(lon) || lon < -180 || lon > 180) throw new RangeError(`F1 longitude out of range: ${lon}`);
  if (!Number.isFinite(h)) throw new RangeError(`F1 height not finite: ${h}`);
  return { frame: "F1", lat, lon, h };
}

export function f1ToF5(p: F1Point): F5Point {
  const phi = rad(p.lat), lam = rad(p.lon), r = R_F1 + p.h;
  return { frame: "F5", x: r * Math.cos(phi) * Math.cos(lam), y: r * Math.cos(phi) * Math.sin(lam), z: r * Math.sin(phi) };
}

export function f5ToF1(p: F5Point): F1Point {
  const r = Math.hypot(p.x, p.y, p.z);
  return f1(deg(Math.asin(p.z / r)), deg(Math.atan2(p.y, p.x)), r - R_F1);
}

export function localFrame(origin: F1Point): LocalFrame {
  return { origin, originF5: f1ToF5(origin) };
}

function basis(o: F1Point) {
  const phi = rad(o.lat), lam = rad(o.lon);
  const sl = Math.sin(lam), cl = Math.cos(lam), sp = Math.sin(phi), cp = Math.cos(phi);
  return { east: [-sl, cl, 0], north: [-sp * cl, -sp * sl, cp], up: [cp * cl, cp * sl, sp] } as const;
}

/** Standard ECEF-to-ENU rotation about the area origin on the F1 sphere. */
export function f5ToF6(p: F5Point, frame: LocalFrame): F6Point {
  const b = basis(frame.origin), o = frame.originF5;
  const d = [p.x - o.x, p.y - o.y, p.z - o.z] as const;
  const dot = (v: readonly number[]) => v[0]! * d[0] + v[1]! * d[1] + v[2]! * d[2];
  return { frame: "F6", e: dot(b.east), n: dot(b.north), u: dot(b.up) };
}

export function f6ToF5(p: F6Point, frame: LocalFrame): F5Point {
  const b = basis(frame.origin), o = frame.originF5;
  const at = (i: 0 | 1 | 2) => b.east[i] * p.e + b.north[i] * p.n + b.up[i] * p.u;
  return { frame: "F5", x: o.x + at(0), y: o.y + at(1), z: o.z + at(2) };
}

/** F7: Equidistant Cylindrical on the F1 sphere, standard parallel 0, central meridian 0, metres (plan 7.8).
 *  Display only: OpenLayers draws D1/D2 in F7 without resampling. Never measure in F7 (east-west is stretched). */
export interface F7Point { readonly frame: "F7"; readonly x: number; readonly y: number }

const K_F7 = (Math.PI * R_F1) / 180; // metres per degree, 59,274.70

export function f1ToF7(p: F1Point): F7Point {
  return { frame: "F7", x: K_F7 * p.lon, y: K_F7 * p.lat };
}

/** The inverse needs the height from elsewhere (D1 at that point); F7 carries none. */
export function f7ToF1(p: F7Point, h: number): F1Point {
  return f1(p.y / K_F7, p.x / K_F7, h);
}

/** Ground metres per F7 unit at a latitude, for the OpenLayers scale bar (plan 7.8: resolution x cos(lat)). */
export function f7PointResolution(resolution: number, latDeg: number): number {
  return resolution * Math.cos(rad(latDeg));
}
