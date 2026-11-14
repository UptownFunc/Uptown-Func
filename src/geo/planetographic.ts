// SI-assisted: drafted with Claude Code (Claude Opus 5.5); human Data and Science review pending.
// F1 -> planetographic latitude / west-positive longitude (the F3 convention, IAU_2015:49901), plan 7.3 step 4.
// Used only as the site input of the Mars24 sun algorithm (D10), whose equations take planetographic latitude and
// west longitude (NASA GISS Mars24 "Algorithm and Worked Examples", steps C-3 and D-5). Never used to place data.
// The F1 point lies on the sphere, not the ellipsoid; for a direction-only use such as the sun's zenith angle the
// latitude formula is applied to the F1 planetocentric latitude directly, as plan 7.3 step 4 states it.
import { CONSTANTS } from "../constants";
import type { F1Point } from "./index";

export interface PlanetographicPoint { readonly frame: "F3"; readonly lat: number; readonly lonW: number }

const K = (CONSTANTS.ellipsoidEquatorialF2.value / CONSTANTS.ellipsoidPolarF2.value) ** 2;
const rad = (d: number) => (d * Math.PI) / 180;
const deg = (r: number) => (r * 180) / Math.PI;

export function f1ToPlanetographic(p: F1Point): PlanetographicPoint {
  const lat = Math.abs(p.lat) === 90 ? p.lat : deg(Math.atan(K * Math.tan(rad(p.lat))));
  const w = (360 - p.lon) % 360; // F1 longitude is in [-180, 180]
  return { frame: "F3", lat, lonW: w === 0 ? 0 : w };
}
