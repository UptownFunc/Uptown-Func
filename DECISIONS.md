# SharpWalk - decision register

Record decisions that affect science, eligibility, architecture, scope or delivery. Never silently turn a default or assumption into a verified fact. Section 19 of the project plan overrides earlier sections.

## Open / conditional decisions

| ID | Topic | Plan default / permitted options | Owner | Resolve by | Status / evidence |
|---|---|---|---|---|---|
| D-01 / O-23 | Pre-event wireframes and challenge-integrity concern | Existing pre-event wireframes are **not treated as cleared**. Ask the Local Lead. Redraw screens from the approved tokens after kickoff; describe prior work honestly as research/planning. | Captain | G0 | PENDING. No Local Lead answer was recorded as of Sat 14 Nov, 10:23. Silence is not approval, so the default stands. Record the exact question, answer, date and source in `SI_LOG.md`. |
| D-02 / R-04 / O-21 | GSAP and Cesium Mars eligibility | Default: no GSAP; Motion owns all motion. Default: no Cesium Mars/ion; use own D1 heights with Mars Trek imagery. Include either only after the Local Lead confirms in writing. | Captain | G0 | PENDING. No written approval as of Sat 14 Nov, 10:23. Defaults stand: no GSAP, no Cesium ion. |
| D-03 / R-06 | Demo area and DEM case | Proposed area: 4.790-4.840 S, 137.365-137.415 E, planetocentric and east-positive; likely case A, pending hillshade/roughness verification. Grid cell 2 m. | Data and Science | G1 | PENDING sign-off. Sat 10:50 evidence (`docs/data/phase-1.1-source-audit.md`): the area is inside D1, the D2 colour COG and two HiRISE stereo DTM extents (T3, Traverse); 0% NoData; the 1 m hillshade shows HiRISE-quality texture with no fill patches. **Supports case A.** Whether the area holds the boxwork itself is not established. |
| D-04 / O-22 | Route smoothing and the “margin never rises” guarantee | Decide at G2: (1) smooth outbound and return consistently; (2) relax AC-19 to allow rises up to 8% and reword the guarantee; or (3) use grid paths for calculations and smooth only the displayed line with a visible note. Until decided, all calculations use grid paths and the guarantee is only claimed on the grid metric. | Route Engine, with Data and Science agreement | G2 | PENDING - record chosen option and tests here |
| D-05 / O-02 | D1 vertical reference and Cesium height conversion | Must be verified; do not assume an ellipsoid/datum. The plan's own-terrain alternative adds a 105-159 m sphere-to-ellipsoid correction and also requires D1's still-unknown vertical reference to be resolved; control points determine whether the conversion is right. | Data and Science | G1 | PENDING. Lead: D1 heights average about 9 m below the UA HiRISE DTMs, which are labelled relative to the Mars 2000 areoid (36 + 35 points; std 5.9 and 13.4 m). That fits an areoid reference; still to be confirmed by control points (7.4). If it is the areoid, plan 7.3 step 1 (R + h on the sphere) needs the areoid-sphere separation; flagged in the audit. |
| D-06 / O-03 | HiRISE stereo coverage at the boxwork | Verify whether 1 m pixels provide usable detail at the target. The plan notes boxwork ridges are 1-2 m tall and may not be resolved by the DEM. | Data and Science | G1 | PENDING - record coverage and resolution evidence |
| D-07 | Control-point residual fallback | AC-15: record at least eight points and per-point east/north/up residuals, RMS and maximum. If horizontal RMS exceeds 5 m (Assumed), apply and log a translation; if it exceeds 25 m (Assumed), draw overlays only in 2D. | Data and Science + 3D owner | G1 | PENDING - no measurements recorded here |
| D-08 | Route grid fallback | Default grid is 2 m for the proposed area. If G2 is missed, the roadmap fallback is a coarser 4 m grid plus visible Assumed-input banner. | Route Engine | G2 | PENDING - verify actual grid and gate outcome |
| D-09 | kJ workload | Off. Do not compute or display workload unless validated cited rates are supplied. | Captain + Route Engine | Before any implementation | DEFAULT LOCKED - off |
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

**C-01 note (Sat 14 Nov, 10:23).** The plan types `Quantity.value` as a number; the draft allows `null`, but only when `valueClass` is `unknown`. Both readings are on record. Neither the plan nor the code has been changed. The Data and Science and contracts owners must choose one: (a) keep `number | null`, restricted to `unknown`, and record it as an agreed deviation from 19.9; or (b) make `value` always numeric, so that an unknown quantity is either not emitted or carried by a separate field. Until they decide, the draft stands.

**Status at G0 (11:00).** No owner names for Data and Science, Route Engine or Design have been recorded in HANDOFF.md, so nobody has agreed C-01 to C-05. At 11:00 the plan's G0 fallback applies: the contracts are **frozen as drafted, unagreed**. The fallback is not consent. Any later change still needs both responsible owners to agree.

## Contract issues raised by /code-review (Sat 14 Nov, 10:23; need owner agreement, not changed in code)

/code-review at medium effort on `main...8986d70` raised these. Each one changes a shared contract, so under CLAUDE.md it needs both responsible owners to agree. None has been applied.

| ID | Contract | Issue | Proposed change | Owner | Status |
|---|---|---|---|---|---|
| C-06 | PlannedMargin, MissionExecution.fieldMargins, Leg, Assumption | `margin_min`, `continue_min`, `returnNow_min`, `distance_m`, `climb_m`, `heading_deg` and `Assumption.value` are bare numbers, not `Quantity`. CLAUDE.md requires every displayed number to be a `Quantity`. | Make the displayed fields `Quantity`, or document that the UI wraps them from a stated source. Margins are estimates, so they need ranges and assumption IDs. | Route Engine + Data and Science | PENDING. Check against the 19.9 field list first. |
| C-07 | Assumption.source | Only `D1`-`D13` or `"team choice"` are accepted, so a literature citation such as NASA/TM-2010-216138, Table 4, p. 13 cannot be recorded. | Allow a citation ID that points to the constants file. | Data and Science | PENDING |
| C-08 | Quantity | `assumed` and `simulated` values may have an empty `assumptionIds`. | Require at least one assumption ID for `assumed` (and possibly `simulated`). | Data and Science | PENDING |
| C-09 | Quantity | `sourceIds` must be non-empty even for `unknown`, which pushes producers to invent a source. | Allow empty `sourceIds` when `valueClass` is `unknown`. | Data and Science | PENDING |
| C-10 | AreaManifest.grids | A list of names only; the `Grid` metadata (dtype, noData, scale, offset) is not referenced by any contract. | Make `grids` an array of `Grid`. | Data and Science + contracts owner | PENDING |
| C-11 | MissionExecution.ticks | No checks that a stop exists in the plan, that departure follows arrival, or that elapsed time increases. | Add the in-record checks in the schema; leave the cross-record stop check to the field view. | Design + Route Engine | PENDING |
## Pipeline encoding and toolchain items from 1.2 (need Data and Science agreement)

| ID | Topic | Current choice in code | Why it needs a decision | Status |
|---|---|---|---|---|
| P-01 | Grid quantisation | Elevation uint16, 0.01 m steps, offset = floor(min); slope uint16, 0.01 deg steps; NoData = 65535 | Plan 7.7 says "quantised" without fixing the encoding. Elevation fails loudly if the relief exceeds 655.34 m. | PENDING |
| P-02 | Terrain class codes | uint8: 0 unknown or low-confidence, 1 slope-screened candidate, 2 known exclusion | Plan 6.3 names the classes but not their codes. "Validated for traversal" has no code, because none exists in the area. | PENDING |
| P-03 | GDAL version | pip rasterio 1.4.4 wheel with bundled GDAL 3.10.3 | The plan pins GDAL 3.12.3. A conda-forge install was refused by this session's safety check. The outputs must be re-run on a machine with GDAL 3.12.3 and the checksums compared. | OPEN - needs a team machine |
| C-12 | AreaManifest residual fields | Manifest not written | `controlPoints`, `rmsHorizontal_m`, `maxHorizontal_m` and `verticalBias_m` are required numbers, so a manifest written before 1.5 would need invented values. Options: make them nullable until measured, or write the manifest only after 1.5. | PENDING (contract change: both owners) |
| C-13 | Provenance.sha256 scope | sha256 of the D1 window actually read (float32 LE) | The contract does not say whether the checksum covers the full source file (3.9 GB; USGS publishes only an md5) or the bytes used. | PENDING |

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
