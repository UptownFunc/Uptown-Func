# SharpWalk - decision register

Record decisions that affect science, eligibility, architecture, scope or delivery. Never silently turn a default or assumption into a verified fact. Section 19 of the project plan overrides earlier sections.

## Open / conditional decisions

| ID | Topic | Plan default / permitted options | Owner | Resolve by | Status / evidence |
|---|---|---|---|---|---|
| D-01 / O-23 | Pre-event wireframes and challenge-integrity concern | Existing pre-event wireframes are **not treated as cleared**. Ask the Local Lead. Redraw screens from the approved tokens after kickoff; describe prior work honestly as research/planning. | Captain | G0 | PENDING - record exact question, answer, date and source in `SI_LOG.md` |
| D-02 / R-04 / O-21 | GSAP and Cesium Mars eligibility | Default: no GSAP; Motion owns all motion. Default: no Cesium Mars/ion; use own D1 heights with Mars Trek imagery. Include either only after the Local Lead confirms in writing. | Captain | G0 | PENDING - no written approval recorded in this starter file |
| D-03 / R-06 | Demo area and DEM case | Proposed area: 4.790-4.840 S, 137.365-137.415 E, planetocentric and east-positive; likely case A, pending hillshade/roughness verification. Grid cell 2 m. | Data and Science | G1 | PENDING - verify data coverage and hillshade before treating case A as confirmed |
| D-04 / O-22 | Route smoothing and the “margin never rises” guarantee | Decide at G2: (1) smooth outbound and return consistently; (2) relax AC-19 to allow rises up to 8% and reword the guarantee; or (3) use grid paths for calculations and smooth only the displayed line with a visible note. Until decided, all calculations use grid paths and the guarantee is only claimed on the grid metric. | Route Engine, with Data and Science agreement | G2 | PENDING - record chosen option and tests here |
| D-05 / O-02 | D1 vertical reference and Cesium height conversion | Must be verified; do not assume an ellipsoid/datum. The plan's own-terrain alternative adds a 105-159 m sphere-to-ellipsoid correction and also requires D1's still-unknown vertical reference to be resolved; control points determine whether the conversion is right. | Data and Science | G1 | PENDING - record source, reference, correction method, control-point evidence and residuals |
| D-06 / O-03 | HiRISE stereo coverage at the boxwork | Verify whether 1 m pixels provide usable detail at the target. The plan notes boxwork ridges are 1-2 m tall and may not be resolved by the DEM. | Data and Science | G1 | PENDING - record coverage and resolution evidence |
| D-07 | Control-point residual fallback | AC-15: record at least eight points and per-point east/north/up residuals, RMS and maximum. If horizontal RMS exceeds 5 m (Assumed), apply and log a translation; if it exceeds 25 m (Assumed), draw overlays only in 2D. | Data and Science + 3D owner | G1 | PENDING - no measurements recorded here |
| D-08 | Route grid fallback | Default grid is 2 m for the proposed area. If G2 is missed, the roadmap fallback is a coarser 4 m grid plus visible Assumed-input banner. | Route Engine | G2 | PENDING - verify actual grid and gate outcome |
| D-09 | kJ workload | Off. Do not compute or display workload unless validated cited rates are supplied. | Captain + Route Engine | Before any implementation | DEFAULT LOCKED - off |
| D-11 | Project plan PDF in the repository | Plan 19.10: "Nothing made before Sat 14 Nov 09:00 goes into this repository." The plan PDF is pre-event research and includes the 9.3 wireframes that D-01 treats as not cleared. | Captain | G0 | Captain (parcilla13) directed upload on Sat 14 Nov ~10:35 to `docs/plan/` on the working branch, as the project specification and pre-event research, not as build output. sha256: part 1 `c1ae51be…5c13`, part 2 `74b67ac6…b30a`. Confirm with the Local Lead together with D-01; remove before merge/submission if not cleared. |
| D-10 | 3D fallback and feature cuts | No-ion default. AREA 2D sheet is never cut. Under no-ion default, cut whole 3D view after PLANET and SITE, before 3D rasters. Draped Cesium overlays only after G1 residuals pass and are the first overlay cut. | Captain + 3D owner | G0/G1 | DEFAULT - verify Local Lead response to D-02 |

## Contract details drafted at G0 (need Data and Science agreement)

Plan 19.9 lists fields but leaves these details open. The drafts below are in `src/contracts` (commit 5e9cbdd). If they are not agreed by G0 (Sat 11:00), the G0 fallback freezes them as drafted.

| ID | Contract | Detail not fixed by 19.9 | Draft in code | Status |
|---|---|---|---|---|
| C-01 | Quantity | 19.9 types `value` as number, but "unknown is never given a default" | `value` is `number \| null`; `null` is allowed **only** for `unknown`, which also may not carry a range | PENDING agreement |
| C-02 | Quantity | How strictly to enforce the display rules | `estimated` requires `low`, `high` and at least one `assumptionId`; every class needs at least one `sourceId`; `low <= value <= high` | PENDING agreement |
| C-03 | Command | Payload shape per command type | Generic object; the route engine owner defines per-type payloads before G2 | PENDING - Route Engine |
| C-04 | MissionPlan | `terrainClassSummary` shape | Map of terrain class to share of route length (0..1) | PENDING agreement |
| C-05 | AreaManifest / Grid / Assumption | Small typing choices | `cellSize_m` any positive number (allows D-08's 4 m fallback); `grids[]` hold `Grid.name`; F1 longitude -180..180 east-positive (D12 domain); `Assumption.value` numeric; `Assumption.source` is `D1`-`D13` or `"team choice"` | PENDING agreement |

## Fixed technical / presentation constraints

- `MissionPlan` is written only by the engine; `MissionExecution` only by the field view. Console changes the plan by Commands.
- Frame conversions go through `src/geo`: F1 -> F5 -> F6. F7 remains native-projection display-only in OpenLayers. Cesium consumes F5 Cartesian3; Cesium cartographic values are not stored or shown.
- Unknown terrain is not silently made routable. Diagonal movement is forbidden when either orthogonal neighbour is not routable.
- The nominal walking speed is 0.83 m/s from NASA/TM-2010-216138, Table 4, p. 13. The 0.64-0.97 m/s range is estimated from lunar-gravity tests, not Mars-validated. Slope factors and 20-degree limit are Assumed.
- Margin states: OK >=10% of T_EVA; NEAR LIMIT 0-10%; OVER <0. Never create SAFE.
- No workload kJ; suit life support not modelled; obstruction is geometry, not dose; no place is described as safe/shelter.
- Motion owns all motion; no Motion+ APIs. Anime.js 4 is permitted only as the scenario-player fallback if Motion cannot be scrubbed. No GSAP without D-02 written approval.
- No AI-generated Mars imagery as data; no NASA logos, flags or mission identifiers; required non-affiliation footer on every view.

## Decision record template

```text
ID:
Date/time (Asia/Manila):
Question:
Options considered (from plan):
Decision:
Reason / evidence:
Human decision owner:
Written approval location (if required):
Affected files / contracts / tests:
Revisit trigger:
```
