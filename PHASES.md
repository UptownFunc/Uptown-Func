# SharpWalk - phase tracker

This file is the live execution record. Update it **after every phase part**, not only at five-hour handoffs.

## Status key

- `NOT STARTED` - not yet attempted.
- `IN PROGRESS` - actively being implemented; not complete.
- `VERIFIED` - implementation and recorded checks passed.
- `BLOCKED` - cannot proceed; blocker and owner recorded.
- `CUT` - intentionally removed under the approved cut order; reason recorded.
- `UNVERIFIED` - old work or repository state exists but has not yet been checked.

**Initial status:** all tasks below are `UNVERIFIED` until the first Claude session inspects the repository and validates the state. Do not turn unknown state into `VERIFIED`.

## Deadline and baseline gates

- Time zone: Asia/Manila (UTC+8).
- Plan baseline: kickoff Sat 14 Nov 2026, 09:00; deadline Sun 15 Nov 2026, 23:59.
- **The baseline is not a live clock.** At every new session, verify the actual event deadline and current time, calculate remaining hours, and rebase the work. Do not reset the 38 h 59 min baseline or assume a missed gate is still available.

| Gate | Baseline time | Planned owner | Acceptance | If missed |
|---|---:|---|---|---|
| G0 Kickoff | Sat 11:00 (+2 h) | Captain | Repository created; `CLAUDE.md` written; contracts agreed | Freeze contracts as drafted; log unresolved items |
| G1 Data and frames | Sat 14:00 (+5 h) | Data and Science | Area grids generated, Zod-valid and checksummed; DEM checks and control-point residuals recorded | Use fallback area; overlays in 2D only |
| G2 Engine | Sat 19:00 (+10 h) | Route Engine | Synthetic, property, admissibility and slope-oracle tests pass; route under 500 ms; speed parameters cited or labelled Assumed; workload off unless rates are cited | Coarser 4 m grid; Assumed ranges with visible banner |
| G3 Tier 1 | Sun 01:00 (+16 h) | Captain | Tier 1 end-to-end test green, including planned margin; first public deploy | Field view moves to Tier 3; console and card ship |
| G4 Tier 2 | Sun 10:00 (+25 h) | Captain | Tier 2 merged; AC-07 obstruction benchmark and AC-08 rover-path consistency results recorded; no serious axe violations | Ship Tier 1 plus only Tier 2 items that pass |
| G5 Freeze | Sun 13:00 (+28 h) | Captain | Demo runs from public deploy on two machines and on the 2D map with Cesium blocked | Bug fixes only from here |
| Video locked | Sun 17:00 (+32 h) | Design | Video <=30 s, subtitles, every claim sourced, limitation caption present | Switch to the 7-slide format |
| Internal submit target | Sun 21:00 (+36 h) | Captain | Every field filled; links open without login | Submit the frozen version |
| Deadline | Sun 23:59 (+38 h 59 min) | Captain | Buffer only | No planned work after deadline |

The plan freezes at Sun 13:00, leaving 10 h 59 min for validation, video and submission, plus a 2 h 59 min buffer after the internal submit target. Verify the portal in case the event's actual deadline differs.

## G1 outcome (recorded Sat 14 Nov 2026, 13:55 Asia/Manila, before the 14:00 gate)

G1 acceptance is **not fully met**: area grids are generated and checksummed (reproduced this session: a93aa209...99a3ef,
aa366e6f...18bdc0, c9c06b3e...58ae21, GDAL 3.10.3) and provenance now covers D1 and D2, but the area manifest is not
written (C-12: residual fields would need invented numbers) and no control-point residuals exist (1.5). **Plan fallback
applies: overlays in 2D only.** Cesium overlay draping must not start. The 3D view (1.6) has not been started and has no
written Local Lead approval for Cesium Mars (D-02); CLAUDE.md says "If 3D is doubtful, cut it at G0/G1". **Recommendation
for the team (not decided here): cut the 3D view now under the fixed cut order; the AREA 2D sheet is never cut.**

## Plan defaults applied (Sat 14 Nov 2026, 14:15 Asia/Manila)

The session operator instructed "do what is needed based on the plan". Applied only where the plan or CLAUDE.md states the
rule; values and approvals the plan leaves to people were not invented (DECISIONS "Plan defaults applied, 14:15").
- **3D view CUT** (1.6): G1 residuals missing, no written Cesium Mars approval, CLAUDE.md "If 3D is doubtful, cut it at
  G0/G1"; fixed cut order under the no-ion default. The AREA 2D sheet stays.
- **G2 engine gate: criteria met on the cloud machine** except smoothing, which keeps the plan's interim rule (D-04):
  grid paths for calculations and display; AC-19 claimed on the grid metric only.
- **C-14:** area outputs committed (db7c103), checked by pytest against recorded checksums.
- **Still blocked (people or network):** T-01 plan times; Conditions panel (D7 REMS snapshot, D10 Mars24 needs the GISS
  worked example as test oracle); rover point-of-view images (D6: 3-5 images picked by people); first public deploy
  (Vercel account, R-17); D-01/D-02 Local Lead answers; contract changes C-12/C-16/C-17.

## Status at handoff (Sat 14 Nov 2026, 14:30 Asia/Manila container clock; previous 12:20)

| Part | Status | One-line reason |
|---|---|---|
| 0.1 | VERIFIED | Official closing time still to be confirmed on the portal (Captain) |
| 0.2 | VERIFIED | |
| 0.3 | IN PROGRESS | G0 fallback applied: contracts frozen as drafted and **unagreed** (C-01..C-13) |
| 0.4 | BLOCKED | No Local Lead answers (D-01, D-02) |
| 1.1 | IN PROGRESS | Evidence recorded; Data and Science sign-off and plan section 19 pending |
| 1.2 | IN PROGRESS | Pipeline built and reproducible; GDAL 3.12.3 rerun (P-03) and owner review pending |
| 1.3 | BLOCKED | Manifest cannot be written without invented residuals (C-12) |
| 1.4 | IN PROGRESS | Seam candidates listed; alignment inconclusive; trust-grid method undecided |
| 1.5 | NOT STARTED | Needs 8+ control points with Cesium picks (human + 3D owner) |
| 1.6 | CUT | 3D view cut at G1 under the plan rule (no residuals, no D-02 approval); AREA 2D sheet kept |
| 2.1 | IN PROGRESS | Range citation resolved from plan 19.5 (3d0e68c); 20 deg slide still UNRESOLVED (plan names only "NASA presentation") |
| 2.2 | VERIFIED (human review pending) | K-01 decided: k_v = 1 placeholder with ASSUMED banner (9e9496c) |
| 2.3 | VERIFIED (human review pending) | Leg ranges use the cited 0.64-0.97 m/s range; L-01/L-02 still to confirm |
| 2.4 | IN PROGRESS | Planned margin incl. per-stop durations and ticks (bf0524b..0aaae81); field-margin UI belongs to 3.3 |
| 2.5 | VERIFIED (interim) | No smoothing: grid path for calculations and display; AC-19 on the grid metric |
| 2.6 | IN PROGRESS | Part 2 done: habitat, stops, route drawn via the worker (88f8b9a, 19b7c68); coverage outlines, contours, fonts open |
| 2.7 | VERIFIED (Node, cloud Xeon) | k_v = 1: longest route 354-395 ms, field 426-470 ms; worker command 261 ms for 2 legs |
| 3.1 | IN PROGRESS | Planner (only MissionPlan writer) + Comlink worker + all six commands; C-15 route geometry outside the contract |
| 3.3 | IN PROGRESS (core done) | Field View: manual ticks, est. margins, stale guard (edf9492, 0acf9e7); phone width checked (b68dec1); outdoor daylight check needs a real phone |
| 4.1 | IN PROGRESS | Tier 2: contours + simulated drill done (10ec506, 48e2774); sky obstruction (pipeline, D12) and AC-07/AC-08 not started |
| 4.4 | VERIFIED (automated) | 0 serious/critical axe on 3 views; AC-32 keyboard place/move/delete; 1280/1920 px (6bdb98e, 48e2774); manual checks (projector, outdoors) at G5 |
| 3.4 | IN PROGRESS (core done) | Card + STALE + print; Chromium PDF = one A5 page (b68dec1, a7cb260); paper print and fixed-scale map open |
| 3.2 | IN PROGRESS (nearly done) | + sources panel (UX-15) and AC-05 quantity labelling (66c373e, 0acf9e7); remaining: stop renaming/tasks, datasets-in-view derived from layers |
| 3.x-5.x | NOT STARTED | |

## Critical path

**Contracts -> data pipeline and frame checks (G1) -> route engine (G2) -> Tier 1 integration (G3) -> Tier 2 and benchmarks (G4) -> freeze (G5) -> video -> submission.**

Work on optional features only when it does not endanger this path. The AREA 2D sheet, working route, planned margin, and briefing card are core deliverables.

## Phase 0 - kickoff and contracts (G0)

| Part | Task | Owner | Status | Checks / evidence | Commit |
|---|---|---|---|---|---|
| 0.1 | Inspect repository, branch state, toolchain, challenge portal deadline, and required Superpowers skill. Record actual start/deadline and repo state. | Captain | VERIFIED; deadline partly confirmed | **Sat 14 Nov, 10:23 re-check:** the official Space Apps participant FAQ confirms the event runs 14-15 Nov 2026. The 23:59 local closing time appears only on third-party pages. **Captain: confirm it in the official submission guide or portal.** Until then, 23:59 Sun 15 Nov Asia/Manila is used. Original evidence: Repo: `main` held only the six log files, no code. Toolchain: Node 22.23.4, npm 10.9.9, Python 3.11 and 3.13.18 present; GDAL/QGIS **not installed** in the cloud container. All pinned npm versions in 10.5 resolve on the registry (`npm view`). Superpowers loaded. Plan baseline deadline Sun 15 Nov 23:59 used; **live portal deadline not verified by this session**. | 5e9cbdd |
| 0.2 | Create/verify root instructions and shared logs: `CLAUDE.md`, `PHASES.md`, `HANDOFF.md`, `DECISIONS.md`, `SI_LOG.md`. | Captain | VERIFIED | All five files on `main` (393723e) plus `SESSION_PROMPTS.md`; read against plan 19.10, no contradictions found. MIT `LICENSE` added (19.3). | 5e9cbdd |
| 0.3 | Agree contracts from plan Section 19.9 and module owners. Establish one owner per module and separate working branches. | Captain + Data and Science + Route Engine + Design | IN PROGRESS | Zod schemas for all nine 19.9 contracts in `src/contracts`; `npx vitest run` 44/44 pass; `npx tsc --noEmit` clean. **10:23:** /code-review run. Six contract issues were logged as C-06..C-11 and not changed; the non-contract fixes were applied (see completion record). No owner agreement on C-01..C-05, so the G0 fallback at 11:00 freezes them as drafted and unagreed. **Pending:** Data and Science agreement on the drafted details (C-01..C-05 in DECISIONS.md) and owner/branch names in HANDOFF.md. If not agreed by 11:00, G0 fallback: freeze as drafted. | 5e9cbdd |
| 0.4 | Ask/verify Local Lead decisions on pre-event wireframes and R-04 (GSAP/Cesium Mars); record exact responses in `SI_LOG.md` and `DECISIONS.md`. | Captain | BLOCKED (human) | No answer yet (Captain, 14 Nov 10:00; still none recorded at 10:23). Defaults retained: wireframes not cleared, no GSAP, no Cesium ion. | - |

**G0 acceptance:** repository and instructions exist; contracts and ownership are agreed. The G0 plan default is to freeze contracts as drafted if time is short.

## Phase 1 - data pipeline and frame checks (G1)

| Part | Task | Owner | Status | Checks / evidence | Commit |
|---|---|---|---|---|---|
| 1.1 | Verify source datasets, licences, CRS, latitude type, longitude direction, vertical reference, resolution, date and coverage. Re-check the demo area and case-A hillshade condition. | Data and Science | IN PROGRESS (evidence gathered; owner sign-off pending) | Sat 10:50: D1, D2 and D12 metadata read and matched to plan 5.2 / 7.3. Demo area inside D1, D2 and HiRISE stereo extents; 0% NoData; the 1 m hillshade supports case A. D12 is a sphere (was UNVERIFIED). D1 vertical reference: lead only (about -9 m vs the HiRISE areoid DTMs). Full record: `docs/data/phase-1.1-source-audit.md`. **Open:** plan section 19 (part 2) not read; Data and Science sign-off; QGIS absent; bundled GDAL 3.10.3, not 3.12.3; D5 host not allowed. | see completion record |
| 1.2 | Build the one-time Python pipeline for approved crops, frame conversions and derived grids. Keep raw-source preparation out of the browser. | Data and Science | IN PROGRESS (built and tested; pinned-GDAL rerun and owner review pending) | After /code-review: `pytest` 33/33; the real D1 rebuild reproduces the same three checksums. `pipeline/sharpwalk`: F1->F5->F6 (`geo`), D1 -> F6 warp by averaging on `+proj=ortho` (`warp`), Horn slope, terrain classes and quantisation (`grids`), typed-array grids with sha256 (`outputs`, `build`). `pytest` 29/29. A real D1 run (3 x 3 km, 2 m, 1,500 x 1,500) reproduced identical checksums on two runs. **Open:** GDAL 3.10.3, not 3.12.3 (P-03); the "filled from CTX/HRSC/MOLA" and seam parts of the unknown class are not implemented (no trust grid yet; 1.4); encoding choices P-01/P-02 need agreement; plan section 19 not read. | see completion record |
| 1.3 | Emit area manifest, typed grid files, provenance and checksums; validate against shared Zod contracts. | Data and Science + Contracts owner | UNVERIFIED | All required files present; schema validation; checksums reproduced | - |
| 1.4 | Run DEM quality checks and raster alignment checks. Record the hillshade/roughness check and D1/D2 vertical relationship. | Data and Science | IN PROGRESS (measurements recorded; alignment inconclusive) | Hillshade/roughness: see 1.1 audit. **Seams:** 2,411 F6 cells over 60 deg (2,423 before quantisation) in 197 clusters. Most follow natural scarps; a few short, straight north-south segments (up to 57 cells in one column) are seam candidates for owner inspection. All are already excluded (over 20 deg). **Raster alignment (code, not QGIS):** D1 and D2 have identical CRS definitions, so there is no CRS-level offset. Image matching at 3 sites was **inconclusive**: hillshade NCC 0.21-0.41 with inconsistent shifts (one at the search limit); edge NCC 0.04-0.26 with shifts of 0-5 m. No residual is claimed; the 7.4 control points must decide. **Not done:** fill/seam trust grid (method undecided); D1-Cesium comparison (needs 1.5/1.6). Script: `pipeline/checks/align_d1_d2.py`. | see 1.4 record |
| 1.5 | Complete at least eight spread-out control points; record D2 pixel, F1, F5 XYZ, matching Cesium Cartesian pick, per-point east/north/up residuals, RMS, maximum, raster offset and vertical bias/spread. | Data and Science + 3D owner | UNVERIFIED | AC-15 evidence; horizontal RMS and fallback decision recorded | - |
| 1.6 | Optional early 3D feasibility task, only if retained at G0: test Cesium with own D1 heights and Mars Trek imagery. Verify the plan's 105-159 m sphere-to-ellipsoid correction plus D1's vertical reference against control points. Do not delay G1/G2 or assume 3D is required. | 3D owner + Data and Science | CUT (14:15) | Cut under the plan rule at G1: control-point residuals absent (1.5), no written Local Lead approval for Cesium Mars (D-02), 3D not started. Fixed cut order: PLANET, SITE, then the whole 3D view (no-ion default). The AREA 2D sheet is never cut. | - |

**G1 acceptance:** area grids are generated, Zod-valid and checksummed; DEM checks and control-point residuals are recorded. If horizontal RMS exceeds 5 m (Assumed), apply and log a translation; if it exceeds 25 m (Assumed), keep overlays in 2D only. Never use Cesium overlays before residuals pass.

## Phase 2 - route engine and AREA sheet (G2)

| Part | Task | Owner | Status | Checks / evidence | Commit |
|---|---|---|---|---|---|
| 2.1 | Implement and test the approved `src/geo` frame conversions and typed scientific constants with citations/pages. | Data and Science | IN PROGRESS (range citation resolved; 20 deg source UNRESOLVED) | **13:00 (this session):** `walkSpeedRange` now cites NASA/TM-2010-216138, Table 4, p. 13 (plan 19.5) with the lunar-gravity limits; both speeds state they are along the surface (plan 19.11 weakness 58). The 20 deg slope-limit source stays UNRESOLVED: the plan reference list names only "xEVA 20 deg slope requirement (NASA presentation)". `npx vitest run` 144/144; `npx tsc --noEmit` clean. | 3d0e68c |
| 2.2 | Implement admissible grid costs and route search. Exclude unknown terrain; apply slope screening; forbid diagonal corner cutting when either orthogonal neighbour is blocked. | Route Engine | VERIFIED (checks pass; human review pending) | K-01 decided by the session operator (14 Nov, 13:00): k_v = 1 in every bin as a labelled placeholder (`src/engine/assumptions.ts`), recorded as a team-choice Assumption and shown on a visible ASSUMED banner. Engine tests unchanged and passing (vitest 169/169 at 19b7c68). Weakness 57 (interpolate k_v) moot while all factors are 1; revisit when values arrive. | 9e9496c |
| 2.3 | Implement leg distance/time ranges and habitat time field. Keep seconds in the engine and display SI minutes. | Route Engine | VERIFIED (checks pass; L-01/L-02 confirmation pending) | Leg ranges now feed the plan: `Leg.time` is an estimated Quantity in seconds (low = 0.97 m/s, high = 0.64 m/s) with A-kv and A-slope-limit assumption ids; planner test checks 16 m -> 16/0.83 s nominal. UI shows SI minutes. | 9e9496c |
| 2.4 | Implement planned margin and the manual-entry field-margin calculations without conflating `MissionPlan` and `MissionExecution`. | Route Engine + Design | IN PROGRESS (planned margin wired end to end; field-margin UI and per-stop durations open) | **13:15 (this session):** `set_assumption` { id: T_EVA, t_ops, t_cont, stop_duration; value_s; rationale } records team-choice Assumptions with no defaults (T-01). With all set and every leg reachable, the planner fills `plannedMargins` (slow bound, minutes, state) and `endMargin` (est. range slow..fast, nominal value). 8 new planner tests incl. exact end margins at all three bounds, AC-19 monotone profile, OVER state, unreachable leg -> unknown. Habitat field cached by its inputs; other bounds derived as 1/v (review R-03). **Open:** one duration applies to every stop (per-stop durations not yet); field margins UI belongs to 3.3. | bf0524b, 4420678 |
| 2.5 | Resolve route smoothing at G2 with Route Engine owner and Data and Science agreement. Record the selected option in `DECISIONS.md`, plan log and O-22. | Route Engine | VERIFIED (interim rule kept) | At G2 no smoothing is implemented: calculations and the drawn line both use the grid path, which is the plan's stated interim rule (6.6 / D-04); AC-19 property tests hold on the grid metric (30 random grids). Options 1-3 remain open if the team wants smoothing later; any change needs matching tests. | 9e9496c (engine), 2.4 tests |
| 2.6 | Build the OpenLayers **AREA-level 2D sheet** by G2. It is the permanent fallback and is never cut. | Design + Data and Science | IN PROGRESS (parts 1 and 2 done) | **Part 2 (13:10):** `src/map/planLayer.ts` draws grid-path legs, habitat (H) and lettered stops via cell -> F1 -> F7 (`src/geo/grid.ts`); a click sends `add_stop` to the engine worker; refused clicks are reported. `npx playwright test` 4/4 (2 new: route drawn and listed with italic est. ranges; excluded ground refused). Screenshot `test-results/plan-route.png`. **Still open:** D1/D2 coverage outlines, 10 m contours, fonts (S-02), hatch aliasing. | 88f8b9a, 19b7c68 |
| 2.7 | Run the complete G2 engine test and latency gate; record all speed inputs as cited or Assumed. | Route Engine | VERIFIED on this machine (Node 22.23.4, cloud Xeon 2.1 GHz, 4 cores) | **13:00 re-run, k_v = 1 (K-01):** longest route 395/354/377 ms (< 500); time field 470/462/426 ms (< 3 s); A* equals the field every run. The decreasing placeholder also passed this run (349-429 ms) but is not used. In the browser worker, one `add_stop` (two A* legs, ~1.95 km each) took 261 ms. Not yet measured on a mid-range laptop. Workload off. | 9e9496c |

**G2 acceptance:** all listed engine tests pass and route is under 500 ms. If missed, move to a 4 m grid and show a visible Assumed-input banner. Do not turn on kJ workload without cited rates.

## Phase 3 - Tier 1 integration (G3)

| Part | Task | Owner | Status | Checks / evidence | Commit |
|---|---|---|---|---|---|
| 3.1 | Integrate command flow, engine worker, `MissionPlan`, version hash and shared contracts. | Route Engine + Captain | IN PROGRESS | `src/engine/planner.ts`: only writer of MissionPlan; applies add/move/delete/reorder/recompute Commands, refuses stale versions and off-screen ground, emits Zod-valid plans with a content version hash; set_assumption refused until plan times/k_v are set. `worker.ts`/`client.ts`: Comlink 4.4.2. `loadGrid.ts`: size-checked typed arrays. 12 planner + 3 loader tests. Works in dev and in the production build. **Open:** plan times (T_EVA, t_ops, t_cont, stop durations) unset so margins unknown; route geometry returned beside the plan (C-15); review findings 7/8/10 deferred. | 9e9496c, 88f8b9a, 19b7c68 |
| 3.2 | Integrate console Planning and Analysis around the AREA sheet, stops, route, profile and provenance. | Design | IN PROGRESS (profile, scrub, ticks, per-stop durations, badges done; provenance panel open) | Console panel beside the AREA sheet: ASSUMED k_v banner (text from src/constants), stops with delete, leg table (length, climb, italic est. time ranges in SI minutes), end margin with OK check / NEAR LIMIT triangle / OVER octagon (word + shape + colour; no SAFE), "estimate under stated assumptions" note, plan-time inputs in minutes. `npx playwright test` 6/6 (margin unknown until all four times are entered; OK then OVER; Set disabled without a rationale; no "SAFE" on the page). Screenshot `test-results/plan-margin.png`. **Open:** elevation/margin profile, provenance panel, stop renaming, responsive check below 800 px. **13:35:** per-stop durations (`set_assumption` with `stopId`, overrides drop with their stop; plan 6.6 sums each stop's own t_stop). Engine geometry adds a whole-walk profile (3D distance, D1 elevation, margin as an est. range per sample) and NEAR_LIMIT/OVER ticks. Map: "margin 10% here" / "margin 0 here" ticks, route past 0 dashed in the over colour, scrub marker. Console: SVG elevation profile with stop letters and ticks, hover synced both ways with the map (UX-06); value-class badges on the leg table (UX-05); ranges read "est. a to b min". **Bug fixed:** the map resized when the status line wrapped on first hover (and when the profile appeared), so a click could land up to 60 m from the cursor; status/profile rows now fixed height, e2e guards it. Checks: vitest 187/187; tsc clean; build OK; playwright 10/10. **Open:** provenance/source panel, stop renaming, AC-05 DOM scan, profile readout numbers not Quantities (C-16). **13:39:** sources panel (`src/app/sources.ts`, `SourcePanel`): selected number's class, method, sources (from provenance.json validated by the Provenance contract, and the constants register) and assumptions with rationales; datasets in view (UX-15); D2 has no provenance record yet (P-04), shown as missing. `QuantityText` puts data-value-class/data-source-ids on every displayed time, margin and duration; e2e AC-05 DOM scan. | 88f8b9a, bf0524b, 4420678, f07094f, 0aaae81, 66c373e, 0acf9e7 |
| 3.3 | Integrate Field View with manual arrival/departure ticks and separate `MissionExecution` state. | Design | IN PROGRESS (core implemented and green; phone/outdoor readability not checked) | **13:43:** `src/field/execution.ts` is the only writer of MissionExecution: ticks in plan order, refuses backwards/non-finite times and other plan versions, never mutates the plan (8 unit tests). Plan 6.6 field margins (continue, return now) as est. ranges, slow bound low / fast bound high; F-01 charges all of t_ops as remaining; C-17 contract cannot hold unknown field margins. Engine geometry adds per-stop slow-bound return time. `FieldView`: next stop, leg heading/length, both margins with word+shape+colour, elapsed-time entry, one burgundy tick key, "From manual entries, last tick at HH:MM UTC (...)", blocks ticking after a plan change until the crew starts over. `npx playwright test` 12/12 (field spec: ticks, margins, refusal, plan unchanged, stale guard). Screenshot `test-results/field-view.png`. **Open:** phone-width/outdoor check (UX-12), field leg length not a Quantity (C-16), elapsed clock helper (manual entry only). | edf9492, 0acf9e7 |
| 3.4 | Produce the briefing card with route, leg ranges, margin, assumptions, sources, limits and the required NASA non-affiliation footer. | Design | IN PROGRESS (core implemented and green; print output not yet checked) | **13:20 (this session):** `src/briefing/model.ts` builds the card only from a MissionPlan copy (5 unit tests): per leg heading, length, climb, italic est. time range; per stop assumed duration, tasks ("none entered"), blanks for arrive/depart; every assumption with value, source and rationale; end margin + state or "unknown". `BriefingView`: "Generate card from current plan" stamps the plan version; on any plan change it shows STALE and "Print briefing" is disabled until regenerated (UX-10/11). Card carries the limits text and the NASA footer. Map exported from the same OpenLayers map (`src/map/snapshot.ts`, fit to plan, view restored; resolves null on error/timeout). Print CSS: A5 portrait, 12 mm margins, two columns, white. `npx playwright test` 8/8 x3 runs (2 briefing specs: version, assumptions, footer, STALE within 1 s of returning to Briefing, print disabled; map image has >50 grey levels). One earlier full run failed the map-image spec once (20.8 s; first run after a change; not reproduced). Screenshot `test-results/briefing-card.png`. **Open:** paper/PDF print check; map at a fixed scale (plan 7.8) rather than fit-to-route; halftone print styling; AC-06 measured from view switch, not from the edit (R-04). | 05cc50e, 0ff9423 |
| 3.5 | Run Tier 1 end-to-end tests and publish the first public deploy. | Captain | UNVERIFIED | E2E green; planned margin included; deploy opens without login | - |

**G3 acceptance:** Tier 1 end-to-end is green, planned margin included, and first public deploy works. If missed, use the plan fallback: move Field View to Tier 3; ship console and card.

## Phase 4 - Tier 2, benchmarks and accessibility (G4)

| Part | Task | Owner | Status | Checks / evidence | Commit |
|---|---|---|---|---|---|
| 4.1 | Complete Tier 2 features that do not threaten Tier 1. Contour display is optional; sky-obstruction grid runs after G1 and stays off the critical path. | Assigned module owners | IN PROGRESS (contours and drill done; sky obstruction not started) | **14:27:** time-to-habitat contour lines (d3-contour 4.0.3 in the worker; slow-bound field on a 4 m display grid by block minimum; lines only, labelled "est. N min"; no lines along the grid border or unreachable ground) and the simulated solar-event drill (plan 6.9: 30 min Assumed default in the constants register, 20/10 min stress cases, hatched SIMULATION banner, labelled drill line, stops outside named; no dose, no shelter wording). e2e `drill.spec.ts`. **Not started:** sky-obstruction grid (pipeline, needs D12) and its AC-07 benchmark. | 10ec506, 48e2774 |
| 4.2 | Run AC-07 sky-obstruction benchmark and preserve the interpretation “geometry, not dose.” | Data and Science | UNVERIFIED | Benchmark results, assumptions, source IDs and limits recorded | - |
| 4.3 | Run AC-08 rover-path consistency checks and document results. | Data and Science + Route Engine | UNVERIFIED | Reproducible results and limitations | - |
| 4.4 | Run accessibility checks, including serious axe violations and keyboard/reduced-motion behaviour. | Design | VERIFIED (automated checks); manual checks due at G5 | @axe-core/playwright 4.14.0: 0 serious/critical violations on Planning, Briefing (with card) and Field View (AC-11). AC-32: place, move and delete a stop by keyboard alone (map cursor: arrows 10 m, Shift 100 m, Enter adds; "Move stop X to the map cursor"; Delete), leg table as the non-map equivalent, console at 1280 and 1920 px without sideways scroll. No animations exist yet, so reduced motion has nothing to reduce. Manual projector/outdoor/slow-network checks are a G5 item. | 6bdb98e, 48e2774 |
| 4.5 | Merge only passing Tier 2 items and produce the integrated G4 build. | Captain | UNVERIFIED | Merged commit SHAs; benchmark and accessibility results | - |

**G4 acceptance:** Tier 2 merged; AC-07 and AC-08 results recorded; no serious axe violations. If missed, ship Tier 1 plus only Tier 2 items that passed.

## Phase 5 - freeze, validation and submission (G5)

| Part | Task | Owner | Status | Checks / evidence | Commit |
|---|---|---|---|---|---|
| 5.1 | Freeze features. Run the demo from public deploy on two machines and verify the AREA 2D map with Cesium blocked. | Captain + all owners | UNVERIFIED | Two-machine evidence; Cesium-blocked fallback works; known defects logged | - |
| 5.2 | After freeze, allow bug fixes only. Re-run core tests and validate all displayed quantities, citations, assumptions and warnings. | Module owners | UNVERIFIED | Regression suite; provenance review; no new feature scope | - |
| 5.3 | Lock the <=30-second subtitled video with every on-screen claim sourced and limitation caption present. If not ready by the video gate, switch to the 7-slide format. | Design | UNVERIFIED | Final asset reviewed; SI watermark if applicable; sources captured | - |
| 5.4 | Complete README `SI use`, dependency/dataset/image licences, submission references and SI form data from `SI_LOG.md`. | Captain | UNVERIFIED | All SI and source disclosures reconciled | - |
| 5.5 | Verify every submission field; public app and repository links open without login; submit the frozen version by the internal target. | Captain | UNVERIFIED | Link checks; submission receipt or confirmation captured | - |

**G5 acceptance:** demo runs from public deploy on two machines and the 2D map works with Cesium blocked. From G5 onward, bug fixes only.

## Fixed feature-cut order

1. PLANET level.
2. SITE crops.
3. 3D rasters.
4. Under the default no-ion option, the full 3D view is cut after PLANET and SITE and before 3D rasters.
5. Cesium overlay draping is attempted only after G1 residuals pass and is the first overlay cut.

The AREA sheet is never cut. Preserve the working route, planned margin and briefing card. If 3D is in doubt, cut it at G0/G1 rather than waiting until late integration.

## Completion records

```text
Part: 0.1-0.3 (G0)
Owner: Captain (parcilla13), contracts drafted for Data and Science review
Status: 0.1 VERIFIED, 0.2 VERIFIED, 0.3 IN PROGRESS, 0.4 BLOCKED (Local Lead)
Scope completed: repo audit; package scaffold with exact pins; src/contracts (9 contracts); LICENSE
Files changed: package.json, package-lock.json, tsconfig.json, .gitignore, LICENSE, src/contracts/*
Checks run (exact commands): npx vitest run ; npx tsc --noEmit
Results: 2 test files, 44/44 tests pass; typecheck clean
Known limitations or failures: GDAL/QGIS absent in cloud container (needed at G1); portal deadline not re-verified
Review status: /code-review not yet run; Data and Science agreement pending
Commit SHA: 5e9cbdd
Next part / blocker owner: agree C-01..C-05 (Data and Science); Local Lead answers (Captain); then 1.1
```

```text
Part: G0 /code-review follow-up (0.1, 0.3) and 1.1 readiness
Owner: Captain (parcilla13); session operated by Yujin
Status: 0.3 IN PROGRESS (contracts frozen as drafted, unagreed, at 11:00 fallback); 1.1 BLOCKED
Scope completed: /code-review (medium) on main...8986d70 -> 10 findings. Fixed: SI-assisted headers
  no longer claim an owner review that has not happened; .gitignore now excludes
  .claude/settings.local.json, not the shared settings.json; deadline evidence updated; SI_LOG model
  recorded. Logged, not changed (contract changes need owners): C-06..C-11 in DECISIONS.md.
Files changed: .gitignore, src/contracts/{index,quantity,schemas}.ts and both test files (header
  comment only), DECISIONS.md, PHASES.md, SI_LOG.md, HANDOFF.md
Checks run (exact commands): npm ci ; npx vitest run ; npx tsc --noEmit
Results: npm ci exit 0; 2 test files, 44/44 pass; tsc exit 0
Known limitations or failures: plan PDF not available to this session; data hosts blocked by the
  egress proxy; QGIS absent; GDAL 3.12.3 not confirmed; official closing time not confirmed
Review status: /code-review done for G0; human review and merge still required
Commit SHA: see the commit after 8986d70 on claude/kind-ptolemy-1wdqf5
Next part / blocker owner: 1.1 Data and Science, on a machine with the plan and GIS tools
```text
Part: Governance (G-01 attribution, G-02 merge rule), PR parcilla13/Uptown-Func#1
Owner: Team member Yujin (direction); Claude Code session (drafting)
Status: VERIFIED (docs only)
Scope completed: CLAUDE.md credits the concept and plan to the whole team; the human-merge rule is replaced by
  the completeness checklist in step 6; HANDOFF.md and SESSION_PROMPTS.md aligned; G-01/G-02 in DECISIONS.md
Files changed: CLAUDE.md, DECISIONS.md, HANDOFF.md, SESSION_PROMPTS.md, PHASES.md, SI_LOG.md
Checks run (exact commands): no package scripts on main (docs-only); /code-review low on origin/main...claude/team-attribution
Results: 2 review findings (PR failed its own 'Logged' item; 'Checks green' unrunnable on docs-only main); both fixed in this PR
Known limitations or failures: none
Review status: /code-review done
Commit SHA: 444728b (PR head); merged to main as bb473b7
Next part / blocker owner: merge PR #1; G0 branch claude/kind-ptolemy-1wdqf5 then needs a rebase on main
```

```text
Part: 1.1 (evidence; not VERIFIED)
Owner: Data and Science (TBA); evidence gathered in Yujin's session
Status: IN PROGRESS. The evidence supports case A; owner sign-off and the section-19 check are outstanding.
Scope completed: D1/D2/D12 headers read remotely; D1 demo-area window fetched; NoData, hillshade, roughness and slope
  computed; HiRISE stereo extents checked; D1 vs HiRISE areoid DTM height comparison at 36 + 35 points
Files changed: docs/data/phase-1.1-source-audit.md, pipeline/checks/*.py (7 read-only scripts), .gitignore (work/), PHASES.md,
  HANDOFF.md, DECISIONS.md, SI_LOG.md
Checks run (exact commands, Python 3.11.18 venv with rasterio 1.4.4, numpy 2.4.6):
  python -I pipeline/checks/d1_probe.py ; d1_crop.py ; d1_checks.py ; d2_probe.py ; d12_probe.py ; vref.py ;
  dtm_cover.py <DTMCUMINDEX.TAB>  (SHARPWALK_WORK set to a scratch directory)
  npx vitest run ; npx tsc --noEmit
Results: area NoData 0/8,782,332; elevation -3,865.81 to -3,247.22 m; 26.23% of cells over 20 deg; 19,569 over 60 deg;
  roughness p50 0.192 m; HiRISE DTM extents cover 100% of the area (019698: 95%, 009149: 93%); D1 - HiRISE mean
  -8.62 m (std 5.94) and -9.21 m (std 13.43); D2 COG 36,000 x 76,000 at 0.25 m, LAYOUT=COG, area 0% empty; D12 sphere
  R = 3,396,190 m, -180..180 east-positive; vitest 44/44; tsc clean
Known limitations or failures: plan section 19 not read; GDAL 3.10.3 (bundled) not 3.12.3; QGIS absent; HiRISE valid-data
  footprints not checked (extents only); D5 not checked
Review status: /code-review pending at PR time; Data and Science sign-off pending
Commit SHA: see the 1.1 evidence commit on claude/kind-ptolemy-1wdqf5
Next part / blocker owner: Data and Science sign off on 1.1 and D-03 case A; read plan section 19; then 1.2 pipeline
```

```text
Part: 1.2 (pipeline core; not VERIFIED)
Owner: Data and Science (TBA); built in Yujin's session
Status: IN PROGRESS. Tests pass and outputs reproduce; the pinned-GDAL rerun, owner review and section-19 check are outstanding.
Scope completed: pipeline/sharpwalk/{geo,grids,warp,outputs,build,run_d1}.py; pipeline/tests (29 tests);
  pipeline/requirements.txt; pipeline/pytest.ini
Checks run (exact commands):
  cd pipeline && python -m pytest                      (Python 3.11.18 venv: rasterio 1.4.4 / GDAL 3.10.3, numpy 2.4.6, pytest 9.2.0)
  cd pipeline && python -m sharpwalk.run_d1 <scratch>/area   (twice, into two directories)
  npx vitest run ; npx tsc --noEmit
Results: pytest 29 passed. Real D1 area: origin F1 (-4.815, 137.39, h -3506.337 m), F5 (-2488131.803, 2288756.065,
  -284777.53); 1,500 x 1,500 at 2 m; candidate 1,709,324, excluded (over 20 deg) 534,680, unknown 5,996 (= the grid
  border); elevation -3871.609 to -3234.268 m; 2,423 cells over 60 deg (seam check, 1.4). Grids 11.25 MB in total.
  sha256: elevation a93aa209...99a3ef, slope aa366e6f...18bdc0, terrain_class c9c06b3e...58ae21, identical on both runs.
  vitest 44/44; tsc clean.
Known limitations or failures: GDAL version deviation (P-03); fill/seam unknown classes not implemented; provenance
  sha256 covers the window read, not the full file (C-13); area manifest not written because control-point residuals
  do not exist yet (C-12)
Review status: /code-review pending at PR time; Data and Science review pending
Commit SHA: see the 1.2 commit on claude/kind-ptolemy-1wdqf5
Next part / blocker owner: 1.3 manifest + Zod validation (needs C-12); 1.4 seams and fill mask; owner review
```

```text
Part: 1.4 (measurements only; not VERIFIED)
Owner: Data and Science (TBA); measured in Yujin's session
Status: IN PROGRESS. Alignment inconclusive; seam candidates listed; trust-grid method undecided.
Checks run: python -I pipeline/checks/align_d1_d2.py (twice: hillshade only, then with edges); inline seam clustering
  on the 1.2 slope grid (8-neighbour components of cells over 60 deg)
Results: see the 1.4 row. Largest steep clusters (cells, row range, col range): 145 (998-1069, 158-166);
  112 (854-897, 793-805); 97 (87-106, 1204-1228); 75 (647-695, 719-721); 67 (1193-1221, 238-242)
Known limitations: matching a DEM hillshade to an albedo image is illumination-sensitive, so the method cannot give
  residuals here; QGIS absent; GDAL 3.10.3
Commit SHA: see the 1.4 commit on claude/kind-ptolemy-1wdqf5
Next: owner inspects the north-south segments (cols ~158-166, 719-721, 238-242 and the vertical line near col 720);
  decide the trust-grid method; control points (1.5)
```

```text
Part: 2.1 (not VERIFIED: two citations unresolved)
Owner: Data and Science (TBA); written in Yujin's session
Files changed: src/geo/index.ts, src/geo/geo.test.ts, src/constants/index.ts, src/constants/constants.test.ts
Checks run: npx vitest run ; npx tsc --noEmit
Results: 4 files, 60/60 pass; typecheck clean
Known limitations: walkSpeedRange and slopeLimit citation locations UNRESOLVED; F1 heights are sphere-relative per
  plan step 1 while D1 is probably areoid-relative (D-05)
Commit SHA: see the 2.1 commit on claude/kind-ptolemy-1wdqf5
Next: fill the citations from plan section 19.5; Route Engine starts 2.2 against src/geo and the 1.2 grids
```

```text
Part: 2.2 and 2.7 (not VERIFIED)
Owner: Route Engine (TBA); written in Yujin's session
Files changed: src/engine/route.ts, src/engine/route.test.ts, bench/route-bench.ts
Checks run: npx vitest run ; npx tsc --noEmit ; SHARPWALK_AREA=<area> node --experimental-strip-types bench/route-bench.ts
Results: vitest 77/77; tsc clean; latency as in the 2.7 row
Connectivity finding (real grid, engine edge rules, placeholder factors): 5,441 separate routable regions. The largest
  holds 1,307,532 cells (76.5% of candidates, 58.1% of the area); 4,336 regions hold 1-9 cells. The exact area centre
  (row 750, col 750) is NOT in the largest region, so a habitat or stop placed there reaches only a small pocket.
  Stops must sit in the main region; the engine returns null for unreachable goals.
Known limitations: k_v values missing (K-01); one test expectation was corrected during TDD (with (1,1) unknown,
  the corner rule makes the hand solution 4, not 2*sqrt(2)); latency not yet on target hardware
Commit SHA: see the 2.2 commit on claude/kind-ptolemy-1wdqf5
Next: Route Engine supplies the k_v bin values with their source (plan 6.5 / 19), then 2.3 leg ranges
```

```text
Part: 2.6 part 1 (not VERIFIED: stops/route not drawn yet)
Owner: Design + Data and Science (TBA); written in Yujin's session
Files changed: src/geo (F7), src/map/{f7,readout,loadArea,AreaSheet}.ts(x), src/app/*, index.html, vite.config.ts,
  playwright.config.ts, e2e/area-sheet.spec.ts, pipeline/sharpwalk/{display,run_display}.py, pipeline/tests/test_display.py,
  package.json/package-lock.json (react 19.3.1, react-dom 19.3.1, ol 10.11.0, vite 8.3.7, @playwright/test 1.65.0,
  @types/react 19.3.0, @types/react-dom 19.3.0), tsconfig.json (jsx), .gitignore (public/area, test-results)
Checks run: npx vitest run ; npx tsc --noEmit ; npx vite build ; cd pipeline && python -m pytest ;
  python -m sharpwalk.run_display <area> ; PW_CHROMIUM=<chromium> npx playwright test --trace off
Results: vitest 88/88; tsc clean; build OK (JS 130.7 KB gz); pytest 38/38; playwright 2/2
To run the app locally: build the area (python -m sharpwalk.run_d1 ../public/area && python -m sharpwalk.run_display
  ../public/area from pipeline/), then npm run dev. public/area is git-ignored (C-14: data delivery not decided).
Commit SHA: see the 2.6 part 1 commit on claude/kind-ptolemy-1wdqf5
Next: 2.3 leg ranges and 2.4 margins (need K-01), engine worker (3.1), then stops/route on the sheet (2.6 part 2)
```

```text
Part: 2.3 and 2.4 engine functions (not VERIFIED: k_v missing; stores/UI later)
Owner: Route Engine (+ Design for 2.4) (TBA); written in Yujin's session
Files changed: src/engine/leg.ts, leg.test.ts, margin.ts, margin.test.ts; route.ts (kForRatio exported)
Checks run: npx vitest run ; npx tsc --noEmit ; AC-19 seed count (node script) ; mutation test (reverted)
Results: after /code-review: vitest 143/143, pytest 39/39, playwright 2/2 (before the review: vitest 133/133); tsc clean; 30/30 AC-19 seeds exercise the assertions; the mutation failed 32 tests
Known limitations: k_v placeholders in tests only; margins on the grid metric only (D-04); the ops time is charged in
  full from the first step (plan 6.6, conservative)
Commit SHA: see the 2.3/2.4 commit on claude/kind-ptolemy-1wdqf5
Next: /code-review; then the engine worker (3.1, Comlink) and stops/route on the sheet (2.6 part 2)
```

```text
Part: Session handoff (Yujin's session, 09:49-12:20 across two account turns)
Status: checkpoint only; no part marked VERIFIED beyond 0.1/0.2
Correction: from commit 3ec10e0 until the handoff commit, `npx vitest run` also collected e2e/area-sheet.spec.ts (a
  Playwright file) and reported "1 failed" test file, although every test passed. Earlier records quoted only the test
  counts. Fixed in the handoff commit by excluding e2e/ in vite.config.ts.
Checks run at handoff (exact commands, results):
  npm ci                                                        -> exit 0
  npx vitest run                                                -> 8 files, 143/143 pass (after the e2e exclusion)
  npx tsc --noEmit                                              -> exit 0
  npx vite build                                                -> OK; JS 130.99 KB gzipped
  cd pipeline && python -m pytest -q -W error                   -> 39 passed
  PW_CHROMIUM=/opt/pw-browsers/chromium-1243/chrome-linux64/chrome npx playwright test --trace off -> 2 passed
  SHARPWALK_AREA=<area> node --experimental-strip-types bench/route-bench.ts -> see the 2.7 row (target missed with
    decreasing placeholders)
Commit SHA: see the handoff commit on claude/kind-ptolemy-1wdqf5
```

```text
Part: 2.1 (range citation), 2.2/2.3 (K-01 placeholder), 2.6 part 2, 2.7 re-run, 3.1 part 1
Owner: no per-module roles (session operator, 14 Nov); Claude Code session on claude/trusting-fermi-c5pc0s
Status: 2.2, 2.3, 2.7 VERIFIED (human review pending); 2.1, 2.6, 3.1 IN PROGRESS
Scope completed: plan section 19 read (first time); 19.5 citation applied; K-01 placeholder; planner + worker;
  route, habitat and stops on the AREA sheet; ASSUMED banner; H-01 default habitat
Files changed: src/constants/*, src/geo/grid*, src/engine/{assumptions,planner*,loadGrid*,worker,client}.ts,
  src/map/{AreaSheet.tsx,planLayer.ts}, src/app/{App,PlanPanel}.tsx, src/app/format*, src/app/styles.css,
  e2e/plan-route.spec.ts, package.json, package-lock.json, logs
Checks run (exact commands): npm ci; npx vitest run; npx tsc --noEmit; npm run build;
  PW_CHROMIUM=/opt/pw-browsers/chromium-1243/chrome-linux64/chrome npx playwright test --trace off;
  (cd pipeline && ../.venv/bin/python -m pytest -q); pipeline run_d1 + run_display into public/area;
  SHARPWALK_AREA=public/area node --experimental-strip-types bench/route-bench.ts
Results: vitest 169/169 in 12 files; tsc clean; build OK (main JS 160.6 KB gz + worker chunk 118 KB raw);
  playwright 4/4; pytest 39 passed; grid checksums reproduce a93aa209...99a3ef, aa366e6f...18bdc0,
  c9c06b3e...58ae21 (GDAL 3.10.3); bench as in 2.7
Known limitations or failures: margins unknown (plan times unset); 20 deg source UNRESOLVED; Superpowers skill
  not installed in this session (workflow followed manually: tests first, verify before marking)
Review status: /code-review high on 204a9c4...88f8b9a: 10 findings; 6 fixed (19b7c68); 4 deferred (DECISIONS R-02)
Commit SHA: 3d0e68c, 9e9496c, 88f8b9a, 19b7c68 (+ log commit)
Next part / blocker owner: team sets plan times (T-01) -> planned margin; then 3.2 console / 3.4 briefing card
```

```text
Part: 2.4 (planned margin) and 3.2 (console inputs and margin state), same session, after "proceed"
Owner: no per-module roles (G-04)
Status: IN PROGRESS (both): implemented and green; per-stop durations, profile and field UI open
Scope completed: set_assumption command; plan 6.6 margins in the plan; Assumed time inputs; state badge
Files changed: src/engine/planner.ts, src/engine/planner.test.ts, src/app/{PlanTimes,MarginState,PlanPanel,App}.tsx,
  src/app/styles.css, e2e/plan-route.spec.ts
Checks run (exact commands): npx vitest run; npx tsc --noEmit; npm run build;
  PW_CHROMIUM=/opt/pw-browsers/chromium-1243/chrome-linux64/chrome npx playwright test --trace off
Results: vitest 177/177 (12 files); tsc clean; build OK (main JS 159.7 KB gz, worker chunk 121.6 KB raw); playwright 6/6
Known limitations or failures: no plan-time values exist (T-01): the e2e test uses labelled fixtures (240/20/30/15 min),
  which are NOT proposed plan values; one stop duration for all stops
Review status: /code-review high on 89b08a7...bf0524b: 6 findings; 4 fixed (4420678); 2 deferred (DECISIONS R-03)
Commit SHA: bf0524b, 4420678 (+ log commit)
Next part / blocker owner: team enters real T-01 values in the console (or tells the next session); then 3.4 briefing card
```

```text
Part: 3.4 briefing card (after the operator's second "proceed")
Owner: no per-module roles (G-04)
Status: IN PROGRESS (core implemented and green; print output on paper/PDF not checked)
Files changed: src/briefing/{model,model.test,BriefingView}.ts(x), src/map/{snapshot.ts,AreaSheet.tsx}, src/app/{App.tsx,styles.css},
  e2e/briefing.spec.ts
Checks run (exact commands): npx vitest run; npx tsc --noEmit; npm run build;
  PW_CHROMIUM=/opt/pw-browsers/chromium-1243/chrome-linux64/chrome npx playwright test --trace off (x3)
Results: vitest 182/182 (13 files); tsc clean; build OK (main JS 161.6 KB gz); playwright 8/8 on three consecutive runs;
  one earlier run had 1 failure (map-image spec, 20.8 s) not reproduced
Review status: /code-review high on 16fb661...05cc50e: 7 findings; 3 fixed (0ff9423); 4 deferred (DECISIONS R-04)
Commit SHA: 05cc50e, 0ff9423 (+ log commit)
Next part / blocker owner: T-01 values (team); D-04 (G2, 19:00); C-14 then 3.5 first deploy
```

```text
Part: 3.2 (and 2.4 per-stop durations), after the operator's third "proceed"
Owner: no per-module roles (G-04)
Status: IN PROGRESS (core analysis features done; provenance panel open)
Files changed: src/engine/planner{,.test}.ts, src/map/{AreaSheet.tsx,planLayer.ts}, src/app/{App,PlanPanel,PlanTimes,RouteProfile}.tsx,
  src/app/{format,format.test}.ts, src/app/styles.css, src/briefing/model.test.ts, e2e/{area-sheet,plan-route,briefing}.spec.ts
Checks run (exact commands): npx vitest run; npx tsc --noEmit; npm run build;
  PW_CHROMIUM=/opt/pw-browsers/chromium-1243/chrome-linux64/chrome npx playwright test --trace off
Results: vitest 187/187 (13 files); tsc clean; build OK; playwright 10/10
Known limitations or failures: fixed status/profile heights are a layout choice to keep the map still (Design to review)
Review status: /code-review high on db1109d...f07094f: 6 findings; 4 fixed (0aaae81); 2 deferred (DECISIONS R-05)
Commit SHA: f07094f, 0aaae81 (+ log commit)
Next part / blocker owner: T-01 values, D-04 (G2 19:00), C-14 -> 3.5 first deploy; then 3.3 field view
```

```text
Part: 3.2 sources panel / AC-05 and 3.3 Field View, after the operator's fourth "proceed"
Owner: no per-module roles (G-04)
Status: IN PROGRESS (both core-complete and green)
Files changed: src/app/{sources,sources.test}.ts, src/app/{QuantityText,SourcePanel,PlanPanel,App}.tsx, src/app/styles.css,
  src/field/{execution,execution.test}.ts, src/field/FieldView.tsx, src/engine/planner{,.test}.ts, e2e/{plan-route,field}.spec.ts
Checks run (exact commands): npx vitest run; npx tsc --noEmit; npm run build;
  PW_CHROMIUM=/opt/pw-browsers/chromium-1243/chrome-linux64/chrome npx playwright test --trace off
Results: vitest 201/201 (15 files); tsc clean; build OK; playwright 12/12
Review status: /code-review high on 088a272...edf9492: 6 findings; 4 fixed (0acf9e7); 2 deferred (DECISIONS R-06)
Commit SHA: 66c373e, edf9492, 0acf9e7 (+ log commit)
Next part / blocker owner: T-01 values, D-04 (G2 19:00), C-14 -> 3.5 first deploy (G3)
```

```text
Part: 3.3 phone width (UX-12), 3.4 print/PDF check, P-04 D2 provenance, R-04/R-06 follow-ups (fifth "proceed")
Owner: no per-module roles (G-04)
Status: IN PROGRESS (3.3, 3.4); P-04 DONE (checks green)
Scope completed: phone layout (the Field View button was off screen at 390 px; field overlay covered the nav);
  card-only print scoped to 'Print briefing' (Ctrl+P from Planning no longer blank); Chromium PDF of the card is one
  A5 page (420 x 595 pt), two columns; run_display writes the D2 provenance record (display checksums unchanged);
  datasets in view derived from layer sources + plan provenanceIds
Files changed: src/app/{App.tsx,styles.css}, src/briefing/BriefingView.tsx, src/map/AreaSheet.tsx,
  pipeline/sharpwalk/{run_display,outputs}.py, pipeline/tests/test_outputs.py, e2e/{phone,briefing,plan-route}.spec.ts
Checks run (exact commands): (cd pipeline && ../.venv/bin/python -m pytest -q); (cd pipeline && ../.venv/bin/python
  -m sharpwalk.run_display ../public/area); npx vitest run; npx tsc --noEmit; npm run build;
  PW_CHROMIUM=/opt/pw-browsers/chromium-1243/chrome-linux64/chrome npx playwright test --trace off
Results: pytest 40 passed; display layer sha256 unchanged (08c9e4be8f51, a8ca2a3ba913, d3925d882723); vitest 201/201;
  tsc clean; build OK; playwright 14/14
Known limitations: PDF checked in Chromium only, not on paper or in Safari/Firefox; outdoor readability not tested
Review status: /code-review high on 7539a4f...bfa4189: 5 findings; 4 fixed (a7cb260); 1 deferred (R-07)
Commit SHA: b68dec1, bfa4189, a7cb260 (+ log commit)
Next part / blocker owner: team: T-01, D-04 (19:00), C-14, 3D cut decision; then 3.5 first deploy
```

```text
Part: 4.4 accessibility (automated) and 4.1 tier 2 contours + drill, after "do what is needed based on the plan" / "proceed"
Owner: no per-module roles (G-04)
Status: 4.4 VERIFIED (automated); 4.1 IN PROGRESS (sky obstruction not started)
Files changed: package.json, package-lock.json, src/geo/{index,geo.test}.ts, src/engine/{contours,contours.test,planner,planner.test,worker}.ts,
  src/constants/{index,constants.test}.ts, src/map/{AreaSheet.tsx,planLayer.ts}, src/app/{App,PlanPanel,DrillPanel}.tsx,
  src/app/styles.css, e2e/{a11y,drill}.spec.ts
Checks run (exact commands): npx vitest run; npx tsc --noEmit; npm run build;
  PW_CHROMIUM=/opt/pw-browsers/chromium-1243/chrome-linux64/chrome npx playwright test --trace off
Results: vitest 209/209; tsc clean; build OK, JS 196 KB main + 39 KB worker gzipped = 235 KB (budget 250); playwright 20/20
Known limitations: contours cached for the session (habitat and k_v fixed now; R-08 item 5); 15 KB budget headroom
Review status: /code-review high on c7b2512...10ec506: 6 findings; 5 fixed (48e2774); 1 deferred (R-08)
Commit SHA: 6bdb98e, 10ec506, 48e2774 (+ log commit)
Next part / blocker owner: team (T-01, rover images, deploy account); network for Conditions (D7, D10); sky obstruction (D12)
```

## Phase-part completion record

Copy this block for every phase part and update its table row above:

```text
Part:
Owner:
Status: VERIFIED / BLOCKED / CUT
Scope completed:
Files changed:
Checks run (exact commands):
Results (pass/fail and relevant counts):
Known limitations or failures:
Review status:
Commit SHA:
Next part / blocker owner:
```
