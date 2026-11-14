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

## /code-review of 1.1-2.1 (Sat 14 Nov, ~11:15), medium, `3c372f4...ac7e61c`

Ten findings. Eight were fixed, test-first where code was involved. One was fixed in part, and one was not changed:
- **Not changed (recorded here):** the warped elevation grid and the D1 provenance stay `directly_measured`. Plan section 4 (Must table) classes D1 terrain as "Directly measured", and the repo rules do not let a session redesign the plan. The unverified vertical reference is carried separately (`verticalReference: "unknown"`, D-05). Data and Science may reclassify.
- **Partly fixed:** the two UNRESOLVED citations (walkSpeedRange, slopeLimit) remain, because their pages are in plan section 19, which this session has not read. A test now pins the exact list, so any new uncited constant fails the suite.
- **Fixed:** the vertical-reference check now uses CRS transforms, the D1 NoData value and edge guards (results unchanged: -8.62 m / -9.21 m); quantise refuses an all-unknown grid; the build validates before writing anything; odd grid sizes are refused; the report is written once with its source metadata; 0.83 m/s is classed `assumed`; the check scripts import the shared radius and URL; the alignment check refuses windows that contain D1 NoData.

## Route engine inputs (2.2)

| ID | Topic | Status |
|---|---|---|
| K-01 | Slope factors k_v for the bins 0-5, 5-10, 10-15 and 15-20 deg | **DECIDED 14 Nov 13:00 by the session operator: k_v = 1 placeholder in every bin, with a visible ASSUMED banner.** Plan 19.5 confirms k_v stay Assumed (no speed-versus-slope source exists) and gives no values; 19.11 weakness 5 leaves them to the team "by G2". The placeholder is a team-choice Assumption (`A-kv`), not a measurement. Revisit: the team supplies four values with a one-line rationale; then also apply weakness 57 (interpolate between bin centres). |
| K-02 | Bin-edge convention | The code uses lower-inclusive bins: [0,5), [5,10), [10,15), [15, limit]. Edges exactly at the limit are allowed. Route Engine to confirm. |
| D-03 note | Connectivity of the demo area at 2 m | The main routable region covers 58.1% of the area; the area centre is not in it. Habitat and stops must be placed in the main region. Recorded for the D-03 sign-off. |

## /code-review of 2.2 (Sat 14 Nov, ~11:29), medium, `225e3e3...29e5a71`

Ten findings: seven fixed, two partly fixed, one skipped.
- **Fixed, test-first:** out-of-grid cells are refused instead of wrapping to the next row; the grid shape and cell size are validated; bin edges use the same relative tolerance as the limit, so an edge designed at exactly 5, 10 or 15 deg goes to the upper bin (a real rounding miss, reproduced across 400 cell sizes); the heuristic has one implementation, used by both search and the export; a cross-language test checks that the engine's class codes equal the pipeline's (proven by changing a pipeline code and watching the test fail).
- **Fixed in the benchmark:** separate rows and cols; guards for no seed and an unreachable route; the level speed read from `src/constants`; two labelled placeholder factor sets.
- **Partly fixed:** the time field no longer builds `prev`; per-call buffers are still allocated each route (about 29 MB on the full grid). The latency is within budget on this machine, so buffer reuse is left as the first optimisation if the Worker or laptop run exceeds 500 ms.
- **Partly fixed:** the class codes are still defined in `src/engine` rather than `src/contracts`, because moving them is a contract change (P-02, both owners). The cross-language test guards against drift until then.
- **Skipped:** `bench/` is not type-checked, because doing so needs `@types/node`, which is not in the plan's pinned stack. Adding a dependency needs a documented decision.

## Plan number discrepancies found while implementing

| ID | Where | Plan says | Exact value | Effect |
|---|---|---|---|---|
| G-03 | Plan 7.8 F7 test vector (137.4 E, -4.8) | x = 8,144,343.5 m | 8,144,343.44 m (k = pi x 3,396,190 / 180 = 59,274.6975 m/deg) | 0.06 m, below display precision. The code uses the exact formula; the test accepts the plan's value at its printed 0.1 m precision. Data and Science to note. |

## App scaffold decisions (2.6, need the owners' confirmation)

| ID | Topic | Choice | Why | Status |
|---|---|---|---|---|
| S-01 | `@types/react` 19.3.0 and `@types/react-dom` 19.3.0 (dev only) | Added at exact versions | React 19 ships no TypeScript types; TypeScript 7 needs them for JSX. Type definitions only, not a runtime library. | PENDING confirmation (Captain / Design) |
| S-02 | IBM Plex fonts | Not bundled yet; the CSS stacks fall back to system fonts | No font files or font package in the pinned stack. Bundling the OFL font files is needed before G3. | OPEN (Design) |
| S-03 | Playwright browser | @playwright/test 1.65.0 runs here with the machine's Chromium (from Playwright 1.63) via `PW_CHROMIUM` | This cloud machine ships 1.63 browsers; installing other browsers is not allowed here. CI should use the 1.65.0 browsers. | NOTED |
| S-04 | No geotiff.js / COG source in the browser | Display layers are F7 PNG/JPEG with a known extent (OpenLayers ImageStatic); grids are binary | Plan 10.1 rejects geotiff.js in the browser. `ol` still installs geotiff as its own dependency, but the app does not import it. | DONE; Captain to confirm |
| C-14 | Delivery of area data | `public/area/` is git-ignored and filled by the pipeline | Grids (11 MB) plus display layers (4.8 MB) are generated. Committing them, publishing them as a release asset, or building them in CI is a Captain decision before the first deploy (G3). | OPEN (Captain) |

## Leg conventions (2.3, Route Engine to confirm)

| ID | Topic | Choice in code | Status |
|---|---|---|---|
| L-01 | `Leg.distance_m` | The sum of 3D edge lengths (plan 6.2: in-plane step plus height difference). `horizontal_m` is also computed for display. | PENDING |
| L-02 | `Leg.heading_deg` | The straight start-to-end bearing in F6, clockwise from grid north (0-360). The briefing card may want the initial heading instead. | PENDING |

## /code-review of 2.6 part 1 and 2.3/2.4 (Sat 14 Nov, ~12:10), medium, `7db8df0...e5dfbcc`

All ten findings fixed, test-first where possible. Each of the three key tests was shown to fail against the old code:
- **Readout geometry (real bug):** the readout put the cursor at the origin height (h0 about -3,500 m) before F6, but the grid is `+proj=ortho` on the bare sphere. That scaled east/north by (R + h0)/R, about 1.4 m at 1.4 km, enough to read the wrong cell. It now uses h = 0, exactly the grid's projection. The test point at a northing of 1,398.2 m fails under the old behaviour.
- **One edge rule:** `edgeCost` in `route.ts` validates adjacency, class, corner cutting, NaN and the slope limit. `legMetrics` and `plannedMarginProfile` now use it, so a jump, an over-limit edge or a NaN elevation is refused rather than costed. A test checks that the leg's nominal time equals the A* time, which pins the search's inlined rule to the same metric.
- **Unknown stays unknown:** plan times are validated, and `marginState` throws on NaN instead of returning NEAR_LIMIT.
- **Quantities:** the readout returns schema-valid Quantities (lat, lon, E, N, elevation); unknown elevation is `valueClass: unknown, value: null`. Legend resolutions are Quantities.
- **Legend date:** renamed `builtOn` and shown as "built ...", so it is not read as a data date.
- **Display sources:** `run_display` asserts that D1 and D2 are in F7 and cover the extent (a test shows it rejects a different `lat_ts` and a short extent).
- **Performance:** the readout frame is computed once and throttled to one per animation frame; `plannedMarginProfile` accepts a precomputed habitat field.

## Handoff notes (Sat 14 Nov, 12:20)

| ID | Topic | Status |
|---|---|---|
| G-04 | Authorship wording | The handoff request asked to "preserve the user's sole authorship", but CLAUDE.md on `main` (G-01, PR #1) credits the concept and plan to the whole four-member team. The session followed the merged repo rule. The team should confirm which wording is right; the session changed nothing. |
| R-01 | G2 latency | At the handoff re-run, the longest route took 521-552 ms with decreasing placeholder factors (target < 500 ms). First try: reuse search buffers. Fallback: a 4 m grid (D-08). Re-measure with the real K-01 values on a mid-range laptop, in a Worker. |

## Session 14 Nov 13:00-13:20 (claude/trusting-fermi-c5pc0s)

| ID | Topic | Decision / status | Evidence / revisit |
|---|---|---|---|
| G-05 | Module ownership | **No per-module roles.** The session operator (14 Nov, ~13:00) stated: "no roles the phases are setup to start from beginning to end so simply continue working". Sessions take phase parts in order; one branch per session. Contract changes still need the agreement rule in CLAUDE.md, now from the team as a whole. | HANDOFF.md ownership section |
| H-01 | Default demo habitat | The plan 19.2 suggestion (4.795 S, 137.392 E) falls on an excluded cell (over 20 deg) outside the main routable region. Default set to the nearest slope-screened cell in the main region, 15.6 m away: **4.795211 S, 137.391845 E** (F6 row 163, col 804). Assumed scenario input, not a base site. | PENDING team confirmation; `src/app/App.tsx` DEFAULT_HABITAT |
| T-01 | Assumed plan times: T_EVA, t_ops, t_cont, stop durations, 30-min warning | **No values exist** in either plan part (weakness 5: "Assumed and still have no values"; due at G0). Since 4420678 the console has inputs for T_EVA, t_ops, t_cont and one stop duration (minutes + required rationale) sent as `set_assumption`; margins appear once all four are entered. **No values are built in.** The team must choose them (and decide whether demo values ship pre-set). The 30-min warning is not implemented. | BLOCKING for G3 demo - team |
| C-15 | Route geometry | MissionPlan (19.9) has no route geometry. The engine returns `geometry` (grid cells per leg, habitat/stop cells) beside the plan in `PlanOutput`; not a contract change. Adding it to the contract needs team agreement. | PENDING |
| C-16 | Leg length / climb display | Contract `Leg.distance_m` and `climb_m` are bare numbers, so the console shows them without Quantity metadata (CLAUDE.md Quantity rule). Fix needs a contract change (Quantity fields) agreed by the team. | PENDING (review finding 4) |
| R-02 | /code-review high of `204a9c4...88f8b9a` | 10 findings: fixed 1-3, 5, 6, 9 in 19b7c68. Deferred: 4 (= C-16); 7 loadGrid duplicates loadArea elevation decoding (merge after P-01 agreed); 8 readoutAt duplicates `f1ToCell` (a test pins them together); 10 e2e hard-codes the initial view. | Follow-ups, not blockers |
| R-03 | /code-review high of `89b08a7...bf0524b` | 6 findings: fixed 2 (field rescale), 3 (field cache key), 4 (speed text from constants), 6 (CSS classes) in 4420678. Deferred: 1 one duration for all stops (plan 6.6 sums per-stop durations; needs per-stop input); 5 plan-time values shown from Assumption, not Quantity (contract shape, C-16 family). | Follow-ups |
| R-04 | /code-review high of `16fb661...05cc50e` (briefing) | 7 findings: fixed 1 (snapshot could hang), 2 (map/stamp version mix), 3 (planner view moved) in 0ff9423; 4 (blank print from Planning) in b68dec1; 5 (AC-06 timing now measured from the edit, 3/3 runs within 1 s) on 14 Nov 14:50. Deferred: 6 e2e click helper duplicated across specs (with R-02 item 10); 7 leg length/climb without Quantity on the card (C-16). | Follow-ups |
| R-05 | /code-review high of `db1109d...f07094f` (3.2) | 6 findings: fixed 1 (status clipped below 800 px), 2 (duplicate test ids), 3 (stale hover index), 4 (speed range in tooltip from constants) in 0aaae81. Deferred: 5 profile readout s/elevation not Quantities (C-16 family); 6 profile() re-runs edgeCost per edge (minor). R-03 item 1 (one duration for all stops) is now resolved by per-stop durations (f07094f). | Follow-ups |
| L-03 | Map layout stability | The map must not resize during use: a resize keeps the view centre, so the ground under the cursor moves (measured 60 m at load zoom when the status line wrapped). Status and profile rows have fixed heights (f07094f). | Design to review heights |
| R-06 | /code-review high of `088a272...edf9492` (sources, field view) | 6 findings: fixed 1 (ticks discarded silently after a plan change), 2 (dead source button), 3 (field margin assumption list), 4 (QuantityText units) in 0acf9e7. Deferred: 5 field leg length not a Quantity (C-16); 6 datasets-in-view list is static, should derive from layers + plan provenanceIds. | Follow-ups |
| F-01 | Field margin t_ops,remaining | Plan 6.6 return-now uses t_ops,remaining but never splits t_ops into egress and ingress. The field view charges all of t_ops (conservative, as the planned margin does). Revisit if the team splits t_ops. | PENDING team confirmation |
| C-17 | MissionExecution.fieldMargins | The contract requires finite continue_min/returnNow_min, so it cannot hold "unknown". The store fills them only when computable (slow-bound ends) and the UI never displays them; it shows live est. ranges. Proposal: make both nullable (team agreement needed). | PENDING (contract) |
| P-04 | D2 provenance record | provenance.json has D1 only; run_display uses D2 without writing its record. The sources panel reports D2 as missing. Pipeline should write D2 (and any other source) records. | OPEN (pipeline) |
| R-07 | /code-review high of `7539a4f...bfa4189` | 5 findings: fixed 1 (print class removed before async print), 2 (phone rules in print), 4 (provenance sort), 5 (print button untested) in a7cb260. Deferred: 3 the D2 sha256 covers the averaged 1 m display read, so it changes with GDAL/resampling; Provenance has no field to say so (C-13 family). | Follow-up |
| P-04 | D2 provenance record | **Done (bfa4189):** run_display merges a D2 record into provenance.json. Data and Science to review the licence/credit wording taken from the 1.1 audit. | Review pending |
| G1-R | G1 outcome and 3D | G1 not fully met (no manifest, no control points): plan fallback "overlays in 2D only" applies. Recommendation: cut the 3D view now (1.6 not started, no D-02 approval). | **Team decision needed** |
| R-08 | /code-review high of `c7b2512...10ec506` (4.4, 4.1) | 6 findings: fixed 1 (contour request restarted on plan changes), 2 (contour labels now "est. N min"), 3 (dead filter), 4 (empty levels), 6 (arrow keys on zoom buttons) in 48e2774. Deferred: 5 contours cached for the session (inputs fixed in this build; invalidate when habitat or k_v become editable). | Follow-up |
| S-05 | `@types/d3-contour` 3.0.6, `@axe-core/playwright` 4.14.0 (dev only) | Types for the plan's d3-contour 4.0.3; axe pinned "from the first lockfile" (plan 11.2) | DONE; team to confirm |
| B-01 | Bundle budget | JS 235 KB gzipped of the 250 KB budget (plan AC). Zod in the main bundle comes from the field view's MissionExecution validation. | Watch |
| SKY-1 | Sky-obstruction layer | Deferred: the plan hides the layer while AC-07 is off, and AC-07 needs the M12 rover position from D5 (UNVERIFIED, unreachable). D1/D12 are 1-row strips without overviews (near-field reads about 1 GB); the pipeline must build its own max-aggregated overview when this resumes. | Waiting on D5 |
| R-09 | /code-review high of `10ec506...40ff5a1` | 6 findings, all addressed: failed layers no longer claimed by the legend, sources panel or card caption; failed-layer state reset (c3277b2); README licence inventory replaced by the generated `docs/licences.md`; README authorship per G-06; duplicate G-04 renamed G-05 (f38f824). | Done |
| SCH-1 | Schedule rebaseline (14:48) | G0/G1 expired and passed under fallback, not rescheduled; G2 met; G3 at risk on B-1..B-4; acceptance criteria unchanged. See PHASES "Schedule reconciliation" and the HANDOFF blocker register. | Recorded |
| T-02 | E2E server | Playwright now builds and serves the production bundle (`vite preview`) instead of the Vite dev server: a cold dev cache re-optimised dependencies and reloaded the page, failing the first two specs reproducibly. Also tests exactly what is deployed. (cb7e24c) | Done |
| X-01 | Superpowers skill | Not installed in this cloud session (no skill or plugin present). Its test-first and verify-before-marking practice was followed manually; the skill is not claimed as used. | Install for future sessions if required |
| D-04 note | Smoothing | Still undecided; the map draws the grid path itself (option 3 behaviour by default). Decide by G2 (19:00). | PENDING |

## Plan defaults applied (Sat 14 Nov 2026, 14:15; operator instruction "do what is needed based on the plan")

| ID | Decision applied | Plan / CLAUDE.md basis | Status |
|---|---|---|---|
| D-10 | **3D view cut**; Cesium overlay draping not attempted; AREA 2D sheet kept | CLAUDE.md "If 3D is doubtful, cut it at G0/G1"; G1 fallback "overlays in 2D only"; cut order under the no-ion default; D-02 has no written approval | APPLIED |
| D-04 | **No smoothing at G2**: grid path for calculations and display; AC-19 on the grid metric | Plan 6.6: "until decided, all calculations use grid paths and the guarantee is only claimed on the grid metric" | APPLIED (interim rule; options stay open) |
| H-01 | Default habitat 4.795211 S, 137.391845 E (nearest slope-screened cell, 15.6 m from the 19.2 point) | Plan 19.2: habitat "around 4.795 S, 137.392 E ... confirm the slope there at G1; it is a scenario input" (the exact point is over 20 deg) | APPLIED |
| F-01 | Field return-now charges all of t_ops | Plan 6.6: charging all t_ops "is conservative" (same choice as the planned margin) | APPLIED |
| C-14 | Area outputs committed in public/area, checked by pytest | Plan 7: static app, one-time pipeline, static files | APPLIED (db7c103) |
| T-01 | **Not applied**: no plan-time values exist in the plan | CLAUDE.md: never invent values; plan weakness 5 leaves them to the team | BLOCKED - team |
| C-12, C-16, C-17 | **Not applied**: contract changes | CLAUDE.md: change a contract only with the owners' agreement | BLOCKED - team |
| N-01 | Network: new personal environment "Uptown-Func" allows www.giss.nasa.gov, mars.nasa.gov and the USGS bucket (operator approved). Fetches from this session were still refused (WebFetch DNS failure; Bash download refused by the session's permission check) | Plan D6, D7, D10 sources | BLOCKED - retry in a session on that environment, or the operator allows the fetch |

## Governance decisions

| ID | Topic | Decision | Decided by | Date/time (Asia/Manila) | Evidence |
|---|---|---|---|---|---|
| G-01 | Attribution | **Superseded by G-06 (14:47).** Was: the project concept, challenge framing, solution direction, requirements and plan are credited to the whole four-member team. | Team member Yujin, in the Claude Code session | Sat 14 Nov 2026 | `CLAUDE.md` Authorship section; PR parcilla13/Uptown-Func#1 |
| G-02 | Merging | Human approval is no longer required to merge. A human or the AI agent may merge a PR only when it meets the completeness checklist in `CLAUDE.md` step 6. | Team member Yujin, in the Claude Code session | Sat 14 Nov 2026 | `CLAUDE.md` step 6; PR parcilla13/Uptown-Func#1 |

| G-06 | Concept and plan authorship | **Supersedes G-01.** SharpWalk's concept and project plan originated with Patrick Ezekiel A. Arcilla (parcilla13). Not credited to the team or to Claude/SI. Team members credited for recorded contributions: Patrick Ezekiel A. Arcilla, Christian Jesus Alcazar, Eugene Ibañez Jr. (Yujin), John Malubay. How the concept was formed: pending Patrick's own account. | John Malubay (session operator), in this Claude Code session, choosing "supersede G-01 everywhere" | Sat 14 Nov 2026, 14:47 | `CLAUDE.md` Authorship section, `README.md`; **flag for the team's review before merge** (G-01 was a team decision recorded by Yujin) |

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
