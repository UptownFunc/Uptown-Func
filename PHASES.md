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
| 1.1 | Verify source datasets, licences, CRS, latitude type, longitude direction, vertical reference, resolution, date and coverage. Re-check the demo area and case-A hillshade condition. | Data and Science | BLOCKED (Sat 10:23) | (1) This session cannot read the plan PDF: it is not in the repo or on the connected Google Drive. The D1-D13 dataset register, product IDs and AOI details cannot be checked against the plan. (2) The egress proxy refused HTTPS connections to hirise-pds.lpl.arizona.edu, trek.nasa.gov, astrogeology.usgs.gov, planetarymaps.usgs.gov and pds-imaging.jpl.nasa.gov. (3) Python 3.11.18 is present. Wheels for rasterio 1.4.4, numpy 2.4.6 and pytest 9.2.0 resolve from PyPI. The rasterio wheel bundles its own GDAL, which is not confirmed to be the pinned 3.12.3. QGIS is unavailable. **Unblock:** run on a team machine with the plan and the GIS tools, or give this session the plan and allowed data hosts. No pipeline results exist. | - |
| 1.2 | Build the one-time Python pipeline for approved crops, frame conversions and derived grids. Keep raw-source preparation out of the browser. | Data and Science | UNVERIFIED | Pipeline tests; reproducible outputs; no unapproved source substitutions | - |
| 1.3 | Emit area manifest, typed grid files, provenance and checksums; validate against shared Zod contracts. | Data and Science + Contracts owner | UNVERIFIED | All required files present; schema validation; checksums reproduced | - |
| 1.4 | Run DEM quality checks and raster alignment checks. Record the hillshade/roughness check and D1/D2 vertical relationship. | Data and Science | UNVERIFIED | DEM checks and outputs stored with source IDs and assumptions | - |
| 1.5 | Complete at least eight spread-out control points; record D2 pixel, F1, F5 XYZ, matching Cesium Cartesian pick, per-point east/north/up residuals, RMS, maximum, raster offset and vertical bias/spread. | Data and Science + 3D owner | UNVERIFIED | AC-15 evidence; horizontal RMS and fallback decision recorded | - |
| 1.6 | Optional early 3D feasibility task, only if retained at G0: test Cesium with own D1 heights and Mars Trek imagery. Verify the plan's 105-159 m sphere-to-ellipsoid correction plus D1's vertical reference against control points. Do not delay G1/G2 or assume 3D is required. | 3D owner + Data and Science | UNVERIFIED | Height conversion and control-point evidence; if in doubt or schedule slips, mark CUT and keep the 2D AREA sheet | - |

**G1 acceptance:** area grids are generated, Zod-valid and checksummed; DEM checks and control-point residuals are recorded. If horizontal RMS exceeds 5 m (Assumed), apply and log a translation; if it exceeds 25 m (Assumed), keep overlays in 2D only. Never use Cesium overlays before residuals pass.

## Phase 2 - route engine and AREA sheet (G2)

| Part | Task | Owner | Status | Checks / evidence | Commit |
|---|---|---|---|---|---|
| 2.1 | Implement and test the approved `src/geo` frame conversions and typed scientific constants with citations/pages. | Data and Science | UNVERIFIED | Frame/unit tests; constants register; no bypass conversions | - |
| 2.2 | Implement admissible grid costs and route search. Exclude unknown terrain; apply slope screening; forbid diagonal corner cutting when either orthogonal neighbour is blocked. | Route Engine | UNVERIFIED | Synthetic and property tests; slope oracle; AC-01 family; unknown-cell tests | - |
| 2.3 | Implement leg distance/time ranges and habitat time field. Keep seconds in the engine and display SI minutes. | Route Engine | UNVERIFIED | Known-grid oracle tests; range and unit tests; benchmark under 500 ms | - |
| 2.4 | Implement planned margin and the manual-entry field-margin calculations without conflating `MissionPlan` and `MissionExecution`. | Route Engine + Design | UNVERIFIED | Margin boundary tests; stop arrival/departure tests; AC-19 on the grid metric | - |
| 2.5 | Resolve route smoothing at G2 with Route Engine owner and Data and Science agreement. Record the selected option in `DECISIONS.md`, plan log and O-22. | Route Engine | UNVERIFIED | Written option and matching tests; until decided, calculations use grid paths only | - |
| 2.6 | Build the OpenLayers **AREA-level 2D sheet** by G2. It is the permanent fallback and is never cut. | Design + Data and Science | UNVERIFIED | Loads local grid; displays route/stops/unknown/slope states; works without Cesium | - |
| 2.7 | Run the complete G2 engine test and latency gate; record all speed inputs as cited or Assumed. | Route Engine | UNVERIFIED | Synthetic, property, admissibility and slope-oracle tests; route <500 ms; workload remains off | - |

**G2 acceptance:** all listed engine tests pass and route is under 500 ms. If missed, move to a 4 m grid and show a visible Assumed-input banner. Do not turn on kJ workload without cited rates.

## Phase 3 - Tier 1 integration (G3)

| Part | Task | Owner | Status | Checks / evidence | Commit |
|---|---|---|---|---|---|
| 3.1 | Integrate command flow, engine worker, `MissionPlan`, version hash and shared contracts. | Route Engine + Captain | UNVERIFIED | Command/plan integration tests; only engine writes plan | - |
| 3.2 | Integrate console Planning and Analysis around the AREA sheet, stops, route, profile and provenance. | Design | UNVERIFIED | Playwright flows; quantity labels; responsive checks | - |
| 3.3 | Integrate Field View with manual arrival/departure ticks and separate `MissionExecution` state. | Design | UNVERIFIED | Tick timing, continue/return-now margin, last-tick labels; field view cannot mutate plan | - |
| 3.4 | Produce the briefing card with route, leg ranges, margin, assumptions, sources, limits and the required NASA non-affiliation footer. | Design | UNVERIFIED | Print/export check; no untraceable number; readable on one card | - |
| 3.5 | Run Tier 1 end-to-end tests and publish the first public deploy. | Captain | UNVERIFIED | E2E green; planned margin included; deploy opens without login | - |

**G3 acceptance:** Tier 1 end-to-end is green, planned margin included, and first public deploy works. If missed, use the plan fallback: move Field View to Tier 3; ship console and card.

## Phase 4 - Tier 2, benchmarks and accessibility (G4)

| Part | Task | Owner | Status | Checks / evidence | Commit |
|---|---|---|---|---|---|
| 4.1 | Complete Tier 2 features that do not threaten Tier 1. Contour display is optional; sky-obstruction grid runs after G1 and stays off the critical path. | Assigned module owners | UNVERIFIED | Each feature has its own test and provenance | - |
| 4.2 | Run AC-07 sky-obstruction benchmark and preserve the interpretation “geometry, not dose.” | Data and Science | UNVERIFIED | Benchmark results, assumptions, source IDs and limits recorded | - |
| 4.3 | Run AC-08 rover-path consistency checks and document results. | Data and Science + Route Engine | UNVERIFIED | Reproducible results and limitations | - |
| 4.4 | Run accessibility checks, including serious axe violations and keyboard/reduced-motion behaviour. | Design | UNVERIFIED | No serious axe violations; evidence recorded | - |
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
