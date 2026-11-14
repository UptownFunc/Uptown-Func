# D10 Mars24 algorithm: source record and AC-09 evidence

SI-assisted: source read and record drafted with Claude Code (Claude Opus 5.5) on Sat 14 Nov 2026, 15:20-15:36 Asia/Manila (container clock). Human Data and Science review is pending.

## Source

| Item | Value |
|---|---|
| Page | NASA GISS, Mars24 Sunclock, "Algorithm and Worked Examples", https://www.giss.nasa.gov/tools/mars24/help/algorithm.html |
| Page version | "Updated 2025-01-07"; site footer "Page updated: Apr 3, 2025" |
| Retrieved | Sat 14 Nov 2026, 15:21 Asia/Manila, HTTP 200, 28,561 bytes, sha256 `7b84bff88ce73006049930ba1d2801b745ec678740cb18cbcaf91220e86afe51` (copy not committed) |
| Underlying papers | Allison and McEwen (2000), Planet. Space Sci. 48, 215-235; Allison (1997), Geophys. Res. Lett. 24, 1967-1970 (cited by the page; not read by this session) |
| Value class of outputs | Model-derived (plan 6.1) |
| Licence | US Government work (NASA GISS web page); formulas only are reproduced, in `src/engine/sun.ts` |

## Implemented steps (`src/engine/sun.ts`)

A-2 (JD UT), A-4 (TT - UTC), A-5, A-6, B-1 to B-5 (mean anomaly, fictitious mean sun, perturbers, equation of centre, L_s), C-1 to C-5 (equation of time, MST, LMST, LTST, subsolar longitude), D-1 (declination), D-5 (zenith and elevation), D-6 (azimuth). D-2 to D-4 (heliocentric distance, longitude, latitude) are not needed for the panel and are not implemented.

**Site convention.** The page's D-5 takes *planetographic* latitude and C-3 takes *west-positive* longitude. The area centre (grid origin, F1 -4.815, 137.39 E planetocentric) is converted through `src/geo/planetographic.ts` with plan 7.3 step 4 (tan phi_g = (a/c)^2 tan phi_c; lambda_W = 360 - lambda_E): planetographic latitude -4.8719 deg, 222.61 W. See DECISIONS SUN-01: the plan's D10 frame row says "planetocentric", the source says planetographic.

**TT - UTC.** Only the interval from 1 Jan 2017 is implemented (69.184 s, constant `ttMinusUtc2017`, page step A-4). Earlier dates are refused, not approximated.

## Check against the published worked examples (AC-09)

AC-09 (plan, acceptance table): sun elevation within 0.1 deg (Assumed) of Mars24 for 3 dates.

| Date (UTC) | Site | Table zenith | Ours | Elevation difference | Within 0.1 deg? |
|---|---|---|---|---|---|
| 2000-01-06 00:00:00 | 0 W, 0 N | 154.26182 | every step A-5..D-6 within 1e-4 of the table | < 1e-4 deg | Yes |
| 2004-01-03 13:46:31 (MER-A Spirit) | 184.702 W, -14.640 N | 151.93895 | 151.93960 | 0.00065 deg | Yes |
| Third date | - | - | - | - | **Not done: needs the Mars24 app (human)** |

Spirit example: every step to L_s agrees within 1e-4. D-1 applied to the table's own L_s (327.32416) gives -13.42040 deg, not the tabulated -13.42065, and D-5 with the tabulated declination gives 151.93935, not 151.93895. The table's last digits cannot be reproduced from the published equations (DECISIONS SUN-02); the gap is 150 times inside the AC-09 tolerance.

**AC-09 status: 2 of 3 dates pass.** The third date must be checked by a person running the Mars24 app (GISS, Java) for the area centre (4.8719 S planetographic, 222.61 W) at a date of the team's choice, then compared with the console's value for the same scenario time.

## Independent plausibility check

Scenario 2026-11-14 04:00 UTC at the area centre gives L_s 21.7 deg. The D7 REMS feed reports L_s 341 for sol 4995 (2026-08-25); 81 days at roughly 0.5 deg per day near that season reaches about 21 deg past 360. Consistent; not a formal check.

## Limits shown in the UI

Terrain shadowing is not modelled (plan 6.10). One point (area centre). Local mean solar time is a clock label only; all durations stay in SI minutes. The scenario date and time is an Assumed team input with a rationale (plan 19.11 weakness 27); no default is built in.
