<!-- SI-assisted: drafted with Claude Code (Claude Opus 5.5); human Data and Science review pending. -->
# AC-08 rover-path consistency check (plan AC-08, 19.11 weakness 64)

**Result (Sat 14 Nov 2026, run 11:36 UTC): PASS.** 83 of the 2,537 known grid cells on Curiosity's path inside the
demo area (3.27 %) are classed as excluded by our 20° slope screen; the Assumed threshold is ≤ 5 %. 1 further cell is
unknown (reported apart, not counted as passable).

This is a **sanity check, not ground truth or validation** (plan weakness 64): rover drivers avoid steep ground, so a
20° screen is expected to pass. It shows that the screen does not mark ground the rover actually drove as excluded,
beyond a small share.

| Item | Value |
|---|---|
| Area / grid | boxwork-demo-D03, 1,500 × 1,500 cells of 2 m (`public/area`) |
| D5 drives crossing the area | 157 (waypoints in the area: 157, sols 4469–5073) |
| Path cells (distinct) | 2,538, of which 2,537 known (every cell the line enters; a cell counts once even if crossed twice) |
| Excluded / unknown | 83 / 1 |
| Slope along the path (cells; upper-inclusive bins, so exactly 20° is passable like the screen) | 0–5°: 414 · 5–10°: 1,163 · 10–15°: 693 · 15–20°: 184 · 20–25°: 46 · 25–30°: 16 · >30°: 21 · unknown: 1 |
| Median / max slope | 8.8° / 47.7° (2 m Horn slope from D1) |
| D5 frame check | MMGIS easting/northing vs the app's F7 display CRS for the same lon/lat: max 3 mm over the 157 waypoints. The cell mapping itself uses `geo.f1_surface_to_f6` (F1 → F5 → F6), which a test pins to the grids' ortho projection to 1 mm |
| Grids checked | terrain_class and slope sha256 verified against build_report.json and recorded in the result |
| Sols | Waypoints inside the area span sols 4469–5073; traverse lines carry no sol, so drives entering from outside may add sols |

**Likely causes of the excluded cells** (not investigated cell by cell): D5 localisation error (UNVERIFIED, plan
O-17) places a line within metres of steep edges; every cell the line enters counts, including clipped corners; D1's 1 m DEM and the 2 m Horn
slope steepen short ridge flanks (boxwork ridges are 1–2 m tall, DECISIONS D-06). Plan: "otherwise investigate the
DEM" applies only above 5 %.

**Method.** D5 lon/lat (planetocentric, east-positive, F1 sphere) → F6 through `geo.f1_surface_to_f6` → exact grid
traversal of each drive line (`pipeline/sharpwalk/rover_path.py`); classes and slope read from the committed grids after
a checksum check. A first run (11:32 UTC) sampled the line every 0.5 m and gave 76 / 2,412 (3.15 %); review R-17 replaced
it with the exact traversal.
Re-run: `cd pipeline && SSL_CERT_FILE=/root/.ccr/ca-bundle.crt ../.venv/bin/python -m sharpwalk.run_rover_path ../public/area ../docs/data`.
Offline reproduction from the committed clip: `pipeline/tests/test_rover_path.py`.

**Source (D5).** NASA/JPL MMGIS Curiosity traverse and waypoints, retrieved 2026-11-14T11:36:19Z; sha256 in
`ac08-rover-path.json`; drives crossing the area kept as published in `d5-traverse-in-area.geojson`.
