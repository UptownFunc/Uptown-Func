// SI-assisted: drafted with Claude Code (Claude Opus 5.5); human Data and Science review pending.
// D10: sun position and Mars time at one site, by the Mars24 algorithm (plan 6.10). Source for every coefficient:
// NASA GISS, Mars24 Sunclock "Algorithm and Worked Examples" (updated 2025-01-07, retrieved 14 Nov 2026,
// https://www.giss.nasa.gov/tools/mars24/help/algorithm.html), steps A-2 .. D-6 as labelled below; based on
// Allison and McEwen (2000), Planet. Space Sci. 48, 215-235, and Allison (1997), Geophys. Res. Lett. 24, 1967-1970.
// Tested step by step against both worked examples on that page (sun.test.ts).
// Limits: terrain shadowing is not modelled (plan 6.10); the site is one point (the area centre); local mean solar
// time is a clock label only, never a duration (plan 6.10; durations stay in SI seconds and minutes).
import { CONSTANTS } from "../constants";
import type { PlanetographicPoint } from "../geo/planetographic";

export interface MarsSun {
  readonly jdTT: number;
  readonly deltaTJ2000: number;
  readonly meanAnomaly_deg: number;
  readonly alphaFMS_deg: number;
  readonly pbs_deg: number;
  readonly nuMinusM_deg: number;
  /** Areocentric solar longitude L_s, [0, 360). */
  readonly ls_deg: number;
  readonly eot_deg: number;
  /** Clock labels in Mars hours [0, 24): never durations. */
  readonly mst_h: number;
  readonly lmst_h: number;
  readonly ltst_h: number;
  readonly subsolarLonW_deg: number;
  readonly declination_deg: number;
  readonly zenith_deg: number;
  /** 90 - zenith; terrain shadowing not modelled. */
  readonly elevation_deg: number;
  /** Clockwise from north, [0, 360). */
  readonly azimuth_deg: number;
}

const rad = (d: number) => (d * Math.PI) / 180;
const deg = (r: number) => (r * 180) / Math.PI;
const mod = (x: number, m: number) => ((x % m) + m) % m;
const sind = (d: number) => Math.sin(rad(d));
const cosd = (d: number) => Math.cos(rad(d));

const TT_UTC_FROM_2017_MS = Date.UTC(2017, 0, 1);

/** TT - UTC in seconds (GISS step A-4: TAI - UTC from the IERS table plus 32.184 s). Only the interval from
 *  1 Jan 2017 is implemented, where the page gives 37 s + 32.184 s = 69.184 s and states no later leap second
 *  as of winter 2025. Earlier dates throw rather than use a value this module does not carry. */
export function ttMinusUtc_s(utcMs: number): number {
  if (!Number.isFinite(utcMs) || utcMs < TT_UTC_FROM_2017_MS)
    throw new RangeError("TT - UTC is implemented only from 2017-01-01 UTC (GISS step A-4); earlier dates need the leap-second table");
  return CONSTANTS.ttMinusUtc2017.value;
}

/** B-3 perturber terms (A_i, tau_i, phi_i). */
const PBS_TERMS: readonly (readonly [number, number, number])[] = [
  [0.0071, 2.2353, 49.409], [0.0057, 2.7543, 168.173], [0.0039, 1.1177, 191.837], [0.0037, 15.7866, 21.736],
  [0.0021, 2.1354, 15.704], [0.002, 2.4694, 95.528], [0.0018, 32.8493, 49.095],
];

/** Sun and Mars time at `site` for a UTC instant (Unix milliseconds, no leap seconds, as Java/JS time). */
export function marsSun(utcMs: number, ttMinusUtc: number, site: PlanetographicPoint): MarsSun {
  if (!Number.isFinite(utcMs) || !Number.isFinite(ttMinusUtc)) throw new RangeError("time must be finite");
  if (!(site.lat >= -90 && site.lat <= 90) || !Number.isFinite(site.lonW)) throw new RangeError("site out of range");
  const jdUT = 2440587.5 + utcMs / 8.64e7; // A-2
  const jdTT = jdUT + ttMinusUtc / 86400; // A-5
  const dt = jdTT - 2451545.0; // A-6
  const M = 19.3871 + 0.52402073 * dt; // B-1
  const alphaFMS = 270.3871 + 0.524038496 * dt; // B-2
  const pbs = PBS_TERMS.reduce((s, [a, tau, phi]) => s + a * cosd((0.985626 * dt) / tau + phi), 0); // B-3
  const nuMinusM = (10.691 + 3.0e-7 * dt) * sind(M) + 0.623 * sind(2 * M) + 0.05 * sind(3 * M)
    + 0.005 * sind(4 * M) + 0.0005 * sind(5 * M) + pbs; // B-4
  const ls = mod(alphaFMS + nuMinusM, 360); // B-5
  const eot = 2.861 * sind(2 * ls) - 0.071 * sind(4 * ls) + 0.002 * sind(6 * ls) - nuMinusM; // C-1, degrees
  const mst = mod(24 * ((jdTT - 2451549.5) / 1.0274912517 + 44796.0 - 0.0009626), 24); // C-2
  const lmst = mod(mst - site.lonW / 15, 24); // C-3
  const ltst = mod(lmst + eot / 15, 24); // C-4
  const subsolar = mod(mst * 15 + eot + 180, 360); // C-5
  const decl = deg(Math.asin(0.42565 * sind(ls))) + 0.25 * sind(ls); // D-1 (planetographic)
  const H = site.lonW - subsolar; // D-5 hour angle
  const cosZ = sind(decl) * sind(site.lat) + cosd(decl) * cosd(site.lat) * cosd(H);
  const zenith = deg(Math.acos(Math.max(-1, Math.min(1, cosZ)))); // D-5
  const azimuth = mod(deg(Math.atan2(sind(H), cosd(site.lat) * Math.tan(rad(decl)) - sind(site.lat) * cosd(H))), 360); // D-6
  return {
    jdTT, deltaTJ2000: dt, meanAnomaly_deg: mod(M, 360), alphaFMS_deg: mod(alphaFMS, 360), pbs_deg: pbs,
    nuMinusM_deg: nuMinusM, ls_deg: ls, eot_deg: eot, mst_h: mst, lmst_h: lmst, ltst_h: ltst,
    subsolarLonW_deg: subsolar, declination_deg: decl, zenith_deg: zenith, elevation_deg: 90 - zenith, azimuth_deg: azimuth,
  };
}
