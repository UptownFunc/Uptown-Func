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
| D-10 | 3D fallback and feature cuts | No-ion default. AREA 2D sheet is never cut. Under no-ion default, cut whole 3D view after PLANET and SITE, before 3D rasters. Draped Cesium overlays only after G1 residuals pass and are the first overlay cut. | Captain + 3D owner | G0/G1 | DEFAULT - verify Local Lead response to D-02 |

## Governance decisions

| ID | Topic | Decision | Decided by | Date/time (Asia/Manila) | Evidence |
|---|---|---|---|---|---|
| G-01 | Attribution | The project concept, challenge framing, solution direction, requirements and plan are credited to the whole four-member team. | Team member Yujin, in the Claude Code session | Sat 14 Nov 2026 | `CLAUDE.md` Authorship section; PR parcilla13/Uptown-Func#1 |
| G-02 | Merging | Human approval is no longer required to merge. A human or the AI agent may merge a PR only when it meets the completeness checklist in `CLAUDE.md` step 6. | Team member Yujin, in the Claude Code session | Sat 14 Nov 2026 | `CLAUDE.md` step 6; PR parcilla13/Uptown-Func#1 |

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
