<!-- SI-assisted: drafted with Claude Code (Claude Opus 5.5); human Data and Science review pending. -->
# AC-07 geometric sky-obstruction benchmark at Butte M12 (plan 6.7, AC-07, AC-21, AC-22)

**Geometry, not dose.** This compares a DEM-derived obstructed fraction of the sky with the published figure. It is
a benchmark of the method, not a reproduction of RAD's camera-derived horizon, and it validates no radiation dose.
The published 19 % is never used as a conversion factor.

**Result (Sat 14 Nov 2026, run 11:46 UTC): PASS at the M12 parking position.** f_obs = **18.50 %** with the base
settings, against 0.37π of 2π = 18.5 % (Ehresmann et al. 2021; Guo et al. 2021 report 19 %). The threshold is
±3 percentage points (Assumed). Every observer height in the plan's 0-2 m sweep also passes:

| h_obs | f_obs | Difference |
|---|---|---|
| 0 m | 20.73 % | +2.23 pp |
| 1 m (base, chosen before the run) | 18.50 % | +0.00 pp |
| 2 m | 16.51 % | -1.99 pp |

The near-exact match at 1 m is a coincidence of the chosen height: the result moves by about 2 pp per metre of
h_obs, and RAD's observer reference height is still UNVERIFIED (plan R-13).

**Shape.** Mean horizon angle 10.8° (published average blocking angle 11°); highest 28.9° (published: no higher than
30°). The horizon is set by the butte, not by DEM noise at the rover's feet:

| Range that sets the horizon | Share of azimuths | Share of f_obs (pp) |
|---|---|---|
| 0-10 m | 0 % | 0 |
| 10-100 m (Butte M12) | 46 % | 13.2 |
| 100-1,500 m | 11 % | 0.5 |
| 1.5-3 km | 0 % | 0 |
| 3-50 km (Mount Sharp, crater rim) | 36 % | 4.5 |
| > 50 km | 7 % | 0.3 |

**Convergence (all within the plan's 0.5 pp rule, Assumed).** AC-21 azimuths: 2° 18.51 %, 1° 18.50 %, 0.5° 18.50 %.
AC-22 search radius: 50 km 18.47 %, 100 km 18.50 %, 150 km 18.50 %. Near-field extent (D1 vs D12 from 1.5 km or
3 km): identical, 18.50 %.

**Observer.** The D5 waypoint after the last drive before sol 1456 (sol 1455, site 57, drive 2798: 4.69520223 S,
137.3530064 E). No drive is logged during sols 1456-1467, so the rover did not move (plan 6.7: average only if it
moved). Ground height z0 from D1 (bilinear) = -4379.41 m; D5 lists elev_geoid -4,379.46 m. The 0.05 m agreement is a lead (one point, not a verification) that D1 heights share D5's areoid reference (DECISIONS D-05).

**Method (plan 6.7).** γ_k = max(0, max_r atan((z − z0 − h_obs − r²/2R) / r)), R = 3,396,190 m; f_obs = mean sin γ_k.
Rays in the observer's F6 plane (`geo.ortho_crs`), mapped to lon/lat on the F1 sphere. Heights: D1 (1 m, bilinear)
every 1 m out to 3 km; beyond, D12 (200 m, bilinear) every 100 m, shifted by the measured mean D1 − D12 offset
(−5.34 m, std 14.31 m, 841 points on a 200 m lattice). Deviation from the plan, recorded as CLAUDE.md V-13: D1 is used
to 3 km, not to its edge, because D1 is stored as full-width strips (reading to the edge is about 3.8 GB); the
near-field check above shows no change between 1.5 km and 3 km.

**Not done.** The reference position (about 10 %): its sols are UNVERIFIED (plan R-13), so it is not computed or
compared. The sky-obstruction layer over the demo area (plan 6.7 compute budget, 20 m grid) is not built yet.

**Re-run.** `cd pipeline && SSL_CERT_FILE=/root/.ccr/ca-bundle.crt ../.venv/bin/python -m sharpwalk.run_sky_benchmark ../docs/data`
(about 80 s: a 6 km D1 window and a 300 km D12 window). Unit oracles: `pipeline/tests/test_sky.py`.

**Sources.** D1 and D12 (USGS Astrogeology); D5 waypoints (NASA/JPL MMGIS, sha256 in the JSON); Ehresmann et al.
(2021), JGR Planets, doi:10.1029/2021JE006851; Guo et al. (2021), GRL, doi:10.1029/2021GL093912 (figures as read from
the abstracts, plan 19.6; page numbers still to be read).
