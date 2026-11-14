<!-- SI-assisted: drafted with Claude Code (Claude Opus 5.5); human Data and Science review pending. -->
# AC-08 rover-path consistency check (plan AC-08, 19.11 weakness 64)

**Result (Sat 14 Nov 2026, run 11:32 UTC): PASS.** 76 of the 2,412 grid cells on Curiosity's path inside the demo
area (3.15 %) are classed as excluded by our 20° slope screen; the Assumed threshold is ≤ 5 %. 1 cell is unknown.

This is a **sanity check, not ground truth or validation** (plan weakness 64): rover drivers avoid steep ground, so a
20° screen is expected to pass. It shows that the screen does not mark ground the rover actually drove as excluded,
beyond a small share.

| Item | Value |
|---|---|
| Area / grid | boxwork-demo-D03, 1,500 × 1,500 cells of 2 m (`public/area`) |
| D5 drives crossing the area | 157 (waypoints in the area: 157, sols 4469–5073) |
| Path cells (distinct) | 2,412 (line densified every 0.5 m; a cell counts once even if crossed twice) |
| Excluded / unknown | 76 / 1 |
| Slope along the path (cells) | 0–5°: 397 · 5–10°: 1,105 · 10–15°: 656 · 15–20°: 177 · 20–25°: 44 · 25–30°: 13 · >30°: 19 · unknown: 1 |
| Median / max slope | 8.8° / 47.7° (2 m Horn slope from D1) |
| D5 frame check | MMGIS easting/northing vs our equirectangular plane on the 3,396,190 m sphere: max 3 mm over the 157 waypoints |

**Likely causes of the excluded cells** (not investigated cell by cell): D5 localisation error (UNVERIFIED, plan
O-17) places a line within metres of steep edges; a 2 m line crosses cells it only clips; D1's 1 m DEM and the 2 m Horn
slope steepen short ridge flanks (boxwork ridges are 1–2 m tall, DECISIONS D-06). Plan: "otherwise investigate the
DEM" applies only above 5 %.

**Method.** D5 lon/lat (planetocentric, east-positive, F1 sphere) → the grids' own `+proj=ortho` CRS
(`pipeline/sharpwalk/rover_path.py`) → cells via the F6 affine; classes and slope read from the committed grids.
Re-run: `cd pipeline && SSL_CERT_FILE=/root/.ccr/ca-bundle.crt ../.venv/bin/python -m sharpwalk.run_rover_path ../public/area ../docs/data`.
Offline reproduction from the committed clip: `pipeline/tests/test_rover_path.py`.

**Source (D5).** NASA/JPL MMGIS Curiosity traverse and waypoints, retrieved 2026-11-14T11:32:31Z; sha256 in
`ac08-rover-path.json`; drives crossing the area kept as published in `d5-traverse-in-area.geojson`.
