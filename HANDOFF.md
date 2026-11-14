# SharpWalk - live session handoff

This file is the handoff between team members and Claude sessions. Keep it factual and current. A new session must read this file before touching code.

## Current snapshot

- Last updated: **Sat 14 Nov 2026, 17:26 Asia/Manila (UTC+8)** (container clock, `TZ=Asia/Manila date`).
- Deadline: **Sun 15 Nov 2026, 23:59 local** (plan 19.3 reading of the 2026 Project Submission Guide). **Still not verified on the live portal: a person must confirm it.** Remaining: about 30 h 33 min.
- Gates: G0 and G1 expired, passed only under their fallbacks (2D only; 3D cut). G2 (Sat 19:00): criteria met at 14:48. G3 (Sun 01:00, ~7 h 34 min away): **at risk on human inputs only**; the Conditions Must is now built (3.6), leaving rover point of view (B-3), planned-margin values (B-1), scenario time (B-9) and the public deploy (B-4).
- **Branch: `claude/wizardly-lovelace-i2i0wa`, HEAD = the log commit after `c739bf4`** (run `git log -1`). It is `claude/trusting-fermi-c5pc0s` (091866a, previous handoff, fast-forwarded, nothing overwritten) plus 17 commits; the latest part added b40550c, c739bf4 and the log commit. Pushed; working tree clean. `main` is still **bb473b7**. **No open PRs; nothing merged** (operator instruction this session: do not merge; human review and merge required).
- Session: operated from **parcilla13's account** (the member at the keyboard was not stated; four members share accounts); Claude Code with **Claude Opus 5.5**; Fable 5.2 not used; **Superpowers installed and its TDD skill used** this session.
- Environment: this session's "Space App" environment now allows `www.giss.nasa.gov` and `mars.nasa.gov` (approved in-session 15:21); that resolves B-2 for sessions on this environment.
- **Authorship:** `main`'s CLAUDE.md credits the concept and plan to the whole team (G-01); this branch carries G-06 (from the previous session), which credits Patrick Ezekiel A. Arcilla and supersedes G-01. **Unresolved: the team must settle G-01 vs G-06 in review before merge.** This session did not change either.

Do not interpret blank fields as proof that no work exists. Inspect GitHub and the working tree.

## Team and module ownership

Team: Patrick Ezekiel A. Arcilla (parcilla13), Christian Jesus Alcazar, Eugene Ibañez Jr. ("Yujin"), John Malubay.
**No per-module roles (G-05):** each session takes the earliest incomplete phase parts in order, on its own branch.
Where the plan names an owner role (Captain, Data and Science, Route Engine, Design), read it as "the team". Contract
changes still need the team's recorded agreement (CLAUDE.md step 6).

## Current phase and status

**Current phase: G3 (Tier 1 integration), with G4 items done ahead where unblocked.** Status per part (evidence in PHASES.md):

| State | Parts |
|---|---|
| VERIFIED | 0.1, 0.2; 2.2, 2.3, 2.5 (interim rule), 2.7 (cloud machine); 4.4 (automated checks) |
| IN PROGRESS (built, checks green, not complete) | 0.3 (contracts unagreed); 1.1, 1.2 (GDAL 3.12.3 rerun), 1.4; 2.1 (20 deg source unresolved); 2.4; 2.6 (coverage outlines, Plex fonts, 10 m contours and the hatch aliasing fix done by 17:24; Design review open); 3.1; 3.2; 3.3; 3.4 (paper/Safari print, fixed-scale map); **3.6 Conditions (new: AC-09 2/3 dates, scenario time unset)**; 4.1 (contours, drill, AC-31 done; sky obstruction deferred); 5.4 (README draft) |
| BLOCKED | 0.4 (Local Lead answers); 1.3 (C-12); 4.2 AC-07 and 4.3 AC-08 (D5) |
| NOT STARTED | 1.5 (control points); 3.5 (deploy); 4.5; 5.1-5.3, 5.5 |
| CUT | 1.6 (3D view, D-10) |

Missing for G3 (Tier 1 Musts): **rover point of view** (D6, B-3), **planned margin values** (T-01, B-1), **scenario
time** for the sun values (T-02, B-9), **first public deploy** (3.5, B-4). Conditions (D10, D7) is built (3.6).

## What exists and passes its tests

- `src/contracts` (Zod, frozen as drafted, unagreed); `src/geo` (F1/F5/F6/F7, grid cell <-> F1, metre offsets); `src/constants` (cited register; drill default 30 min).
- `src/engine`: A* routing, time field, leg ranges, plan 6.6 margins; **Planner** (only MissionPlan writer; Commands incl. per-stop durations); Comlink worker; contour lines.
- `src/map` + `src/app`: AREA sheet with route, stops, keyboard cursor, margin ticks, contours, drill line; console with ASSUMED banner, plan-time inputs (blank until entered), end margin and state, sources panel; elevation profile with two-way scrub.
- **2.6 part 5 (17:11-17:24):** hatch aliasing fixed (HATCH-01): `pipeline/sharpwalk/run_terrain_masks.py` writes three class masks; `src/map/terrainPattern.ts` + `terrainLayer.ts` draw the plan 9.2 symbols in screen pixels, static (reduced motion identical); empty inline favicon (ICON-01).
- **2.6 part 4 (16:50-17:05):** 10 m elevation contours from D1 (`pipeline/sharpwalk/run_contours.py` -> `public/area/contours.geojson`, gdal_contour 3.8.4 on D1 at 4 m; `src/map/elevationContours.ts`, `elevationLayer.ts`; every 50 m heavier and labelled; legend and card name them).
- **2.6 part 3 (16:27-16:47):** plan 7.8 coverage outlines (`pipeline/sharpwalk/run_coverage.py` -> `public/area/coverage.geojson`; `src/map/coverage.ts`, `coverageLayer.ts`; layer list says "partly outside D2 colour coverage"), and IBM Plex Sans/Mono from `@fontsource/*` 5.3.0 via `src/app/fonts.css` (S-02, S-06: IBM's own packages removed for their telemetry postinstall).
- **Conditions (3.6, this session):** `src/engine/sun.ts` (Mars24, both GISS worked examples), `src/geo/planetographic.ts`, scenario time `scenario_utc` as a plan assumption, `PlanOutput.conditions`, `src/app/ConditionsPanel.tsx`; D7 `pipeline/sharpwalk/run_rems.py` -> `public/conditions/rems.json` (sol 4995, 2026-08-25). Evidence: `docs/data/d10-mars24-source.md`.
- `src/briefing`: A5 card, version stamp, STALE + print blocked after edits. `src/field`: Field View (only MissionExecution writer).
- `pipeline`: D1 grids, F7 display layers, provenance for D1 and D2; `public/area` committed and checked by pytest.
- `docs/licences.md` generated by `scripts/licences.py`; `README.md` with authorship, SI use and references.

## Files changed this session (vs 204a9c4)

`.gitignore`, `CLAUDE.md`, `DECISIONS.md`, `HANDOFF.md`, `PHASES.md`, `README.md`, `SI_LOG.md`, `docs/licences.md`,
`scripts/licences.py`, `package.json`, `package-lock.json`, `playwright.config.ts`;
`e2e/{a11y,area-sheet,briefing,drill,field,phone,plan-route,resilience}.spec.ts`;
`pipeline/sharpwalk/{outputs,run_display}.py`, `pipeline/tests/{test_area_outputs,test_licences,test_outputs}.py`;
`src/app/{App,DrillPanel,MarginState,PlanPanel,PlanTimes,QuantityText,RouteProfile,SourcePanel}.tsx`,
`src/app/{format,format.test,sources,sources.test}.ts`, `src/app/styles.css`;
`src/briefing/{BriefingView.tsx,model.ts,model.test.ts}`; `src/constants/{index,constants.test}.ts`;
`src/engine/{assumptions,client,contours,contours.test,loadGrid,loadGrid.test,planner,planner.test,worker}.ts`;
`src/field/{FieldView.tsx,execution.ts,execution.test.ts}`; `src/geo/{index,geo.test,grid,grid.test}.ts`;
`src/map/{AreaSheet.tsx,planLayer.ts,snapshot.ts}`; and 9 generated files in `public/area/`.

## Tests run at handoff (Sat 14 Nov 17:22-17:24 at c739bf4, exact commands and results; earlier values in brackets)

| Command | Result |
|---|---|
| `npm ci` | OK, 0 vulnerabilities |
| `npx vitest run` | **255 passed / 255**, 23 files [249 / 22 at 1d85b36] |
| `npx tsc --noEmit` | clean |
| `npm run build` | OK; JS gzipped: main 205.3 KB + worker 40.9 KB = **~246.2 KB** (budget 250; **under 4 KB headroom**) [244.8]; fonts are separate woff2 assets (a Planning load fetches 10 files, 171 KB) |
| `(cd pipeline && ../.venv/bin/python -m pytest -q)` | **61 passed** [60] (includes area, mask, coverage and contour checksums; gdal_contour plane oracle (skips if the GDAL CLI is absent); licence inventory; REMS) |
| `PW_CHROMIUM=/opt/pw-browsers/chromium-1243/chrome-linux64/chrome npx playwright test --trace off` | **43 passed / 43** at c739bf4 (hatch 4 new) [39 at 1d85b36] (26 at 9608ecb with 3 new Conditions specs; +1 helper pin). Previous handoff: first run after `npm ci`: **2 failed / 21 passed** (area-sheet, a11y Planning). Cause reproduced: a cold Vite dev-server cache re-optimised dependencies and reloaded the page. Fixed in `cb7e24c` (E2E now runs on the production build via `vite preview`). After the fix: **23 passed / 23** on a cold run (cache and dist deleted) and on a warm run |
| `SHARPWALK_AREA=public/area node --experimental-strip-types bench/route-bench.ts` (14:48) | longest route 316-393 ms (< 500); time field 382-438 ms (< 3 s) |

## Known failures and limitations

1. No known failing check at handoff. E2E needs `PW_CHROMIUM` in this cloud container (Playwright 1.65.0 with 1.63 browsers, S-03).
2. Planned and field margins show "unknown" until the plan times are entered (B-1).
3. Latency measured only on the cloud Xeon; laptop timing pending (G5).
4. Pipeline outputs built with GDAL 3.10.3, not the pinned 3.12.3 (P-03).
5. 31 native libraries bundled in the pipeline wheels: licences **not verified** (docs/licences.md).
6. Contours cached per session (R-08 item 5); bundle headroom 15 KB (B-01).
7. Deferred review findings: R-02 (7, 8, 10), R-03 (5), R-04 (6, 7), R-05 (5, 6), R-06 (5), R-07 (3), R-08 (5).

## Decisions awaiting human approval (DECISIONS.md)

| Who | Items |
|---|---|
| Team | **G-06 authorship change** (supersedes the merged G-01; review in the PR); T-01 plan times; contract changes C-01..C-17 (C-12, C-16, C-17 open); H-01 habitat and D-04 interim smoothing (applied from plan defaults, confirm); F-01; P-01, P-02 encodings; K-02 bin edges; L-01, L-02 conventions; S-01..S-05 tooling; P-04 D2 licence wording |
| Patrick Ezekiel A. Arcilla | Concept-formation account (SI_LOG); Vercel deployment (R-17); portal deadline confirmation |
| Local Lead (via the team) | D-01 pre-event wireframes; D-02 GSAP / Cesium Mars |
| Data and Science work (team) | 1.1 sign-off; D-05 vertical reference; D-06; P-03 GDAL rerun; 1.4 trust grid; 20 deg slope-limit source |

## External blocker register (Sat 14 Nov 2026, 15:40 Asia/Manila; previous 14:58)

Nothing below is marked approved or filled in by SI. "Needed by" times are the latest that still leave time to build
and check the dependent work before G3 (Sun 01:00).

| # | Blocker | Owner | Input required | Impact if missing | Needed by |
|---|---|---|---|---|---|
| B-1 | EVA, task, contingency and stop durations (T-01) | Team (decided together; G-05) | T_EVA, t_ops, t_cont, default stop duration (and any per-stop values), each with a one-line rationale; enter in the console or record in DECISIONS | Planned margin and field margins show "unknown"; G3 acceptance "including planned margin" fails | Sat 22:00 |
| B-2 | **RESOLVED 15:21 for the "Space App" environment** (hosts added in-session; Conditions built). Kept for history: NASA Mars24 and MSL weather access (D10, D7) | John Malubay (environment owner) | Start a session on the "Uptown-Func" environment (allows www.giss.nasa.gov, mars.nasa.gov) or allow the download in this session | Tier 1 Conditions panel (sun elevation, LMST label, dated REMS reading) cannot be built or checked against the Mars24 worked example (AC-09) | Sat 20:00 (about 3 h of build and checks) |
| B-3 | 3-5 Curiosity images and metadata (D6) | Team | Image IDs or URLs with sol, camera, credit line; which stop or terrain each illustrates ("similar terrain"). Supplied references recorded in DECISIONS B-3-SRC: the NASA MSL raw-images browser (source to pick from) and "Curiosity's Proposed Path up Mount Sharp" (a planning visualization, **not** a rover-camera image; never to be used as one). Nothing selected or bundled by SI. | Tier 1 rover point-of-view feature missing at G3 | Sat 22:00 |
| B-4 | Vercel deployment access (R-17) | Patrick Ezekiel A. Arcilla (repository owner) | Vercel project linked to the repository, or a deploy done by a member; then the FortiGuard classification request (plan 19.3) | No public deploy: G3 and G5 acceptance fail; judges cannot open the app | Sun 00:00 |
| B-5 | Concept-formation account (SI_LOG, README) | Patrick Ezekiel A. Arcilla | How and when the concept was formed, pre-event research, confirmation and date | SI disclosure incomplete; submission SI field cannot be prepared truthfully | Sun 17:00 |
| B-6 | Contract agreement C-12, C-16, C-17 | Team (all members) | Agree or reject: nullable manifest residuals (C-12); Quantity fields for leg length and climb (C-16); nullable field margins (C-17) | No AreaManifest (G1 item 1 stays open); leg length/climb shown without Quantity metadata; stored field margins cannot be "unknown" | Sat 22:00 |
| B-7 | D5 rover positions | Team, plus John Malubay for network access | Curiosity positions for sols 1456-1467 (Butte M12) and the reference period, from D5, with the host allowed | AC-07 and AC-08 cannot run; sky-obstruction layer stays hidden (SKY-1) | Sun 06:00 (G4) |
| B-9 | Scenario date and time (T-02, plan 19.11 weakness 27) | Team | A UTC date and time from 2017 on, with a one-line rationale; enter in the console's Conditions panel or record under T-02 | Sun elevation, LMST and L_s show "unknown" in the demo | Sat 22:00 |
| B-10 | AC-09 third date | Any member with Java | Run the GISS Mars24 app at 4.8719 S (planetographic), 222.61 W for a chosen date; compare its sun elevation with the console's for the same scenario time (pass: within 0.1 deg); record in PHASES 3.6 | AC-09 stays 2 of 3 | Sun 10:00 (G4) |
| B-13 | Design / team confirmations from 2.6 parts 3-4 | Team (Design, Data and Science) | Confirm the coverage outline symbol (COV-01), the Fontsource font packages (S-06), the contour symbol (CON-03) and 4 m contour grid (CON-01), the GDAL 3.8.4 CLI (P-05), and the coverage/contour file contracts (C-20, C-21); decide whether the load view should fit the crop (COV-02) | Choices stay as display defaults | Sun 10:00 (G4) |
| B-12 | Stop name/tasks command (C-19) | Team (contract) | Pick option (a) new `edit_stop` CommandType or (b) engine-defined payload fields | Briefing card shows no per-stop tasks (Tier 1 card item) | Sat 22:00 |
| B-11 | REMS units and outreach terms (REMS-01, REMS-02) | Team (Data and Science) | Confirm degrees C / Pa and whether CAB's "outreach purposes only" terms fit the submission | D7 shown with unconfirmed units / terms | Sun 13:00 (G5) |
| B-8 | Merge of `claude/wizardly-lovelace-i2i0wa` (contains `trusting-fermi`) | A human (operator instruction: no AI merge this session) | Review including G-06 vs G-01, C-18, SUN-01..04; open a PR when the team wants one (none opened) | Work stays off `main`; G4 "Tier 2 merged" fails | Sun 10:00 |

## Exact next task

1. **Human inputs for G3 (smallest first):** B-9 scenario time and B-1 plan times (each a value + one-line rationale in the console, or recorded under T-02 / T-01 in DECISIONS so a session can pre-set them as logged team choices); B-3 rover images; B-4 Vercel. Do not invent any of them.
2. **Code-only work while waiting:** 2.6 is code-complete (coverage outlines, fonts, contours, hatch aliasing; last commits b40550c, c739bf4); only Design review remains (B-13). Next code-only items: G5 prep (laptop timing incl. contour load CON-02 and frame pacing HATCH-04); watch the bundle (under 4 KB headroom, B-01) before adding code. R-02 item 7 still waits for P-01; C-19 (stop tasks) still waits for the team (B-12); contour/coverage contracts (C-20, C-21) wait for agreement. None is to be implemented without approval.
3. **When images arrive (B-3):** rover point of view in the stop panel and the card, labelled "similar terrain".
4. **When deploy access arrives (B-4):** 3.5 first public deploy, then G5 checks. Re-take the REMS snapshot at build time (command below) so the dated reading is the latest.
5. Do not build the sky-obstruction layer until D5 positions allow AC-07 (SKY-1). Do not fabricate the Butte M12 position, any benchmark result, the scenario time or the AC-09 third date.

## Exact commands for the next session

```bash
git fetch origin && git checkout claude/wizardly-lovelace-i2i0wa && git pull
```

```bash
git log -1 && git status --short
```

```bash
npm ci && npx vitest run && npx tsc --noEmit && npm run build
```

```bash
python3.11 -m venv .venv && .venv/bin/pip install -r pipeline/requirements.txt && (cd pipeline && ../.venv/bin/python -m pytest -q)
```

```bash
PW_CHROMIUM=/opt/pw-browsers/chromium-1243/chrome-linux64/chrome npx playwright test --trace off
```

(Off this cloud container, run `npx playwright test --trace off` after `npx playwright install chromium`.)

```bash
SHARPWALK_AREA=public/area node --experimental-strip-types bench/route-bench.ts
```

```bash
.venv/bin/python scripts/licences.py > docs/licences.md
```

(Only after changing dependencies; the pytest check fails if docs/licences.md is stale.)

Re-take the D7 REMS snapshot (needs `mars.nasa.gov`; in this container also `SSL_CERT_FILE=/root/.ccr/ca-bundle.crt`):

```bash
cd pipeline && ../.venv/bin/python -m sharpwalk.run_rems ../public/conditions && cd ..
```

`public/area` is committed. Rebuild only if the pipeline changes (needs the USGS bucket host):

```bash
cd pipeline && ../.venv/bin/python -m sharpwalk.run_d1 ../public/area && ../.venv/bin/python -m sharpwalk.run_display ../public/area && cd ..
```

(run_display now also writes the terrain masks, the coverage outlines and the contours, and needs the GDAL CLI first: `apt-get install -y --no-install-recommends gdal-bin` (P-05). Not re-run end to end since. To redo only the terrain masks (local files, about 3 s), the outlines (about 30 s) or the contours (about 35 s):)

```bash
cd pipeline && ../.venv/bin/python -m sharpwalk.run_terrain_masks ../public/area && cd ..
```

(and:)

```bash
cd pipeline && SSL_CERT_FILE=/root/.ccr/ca-bundle.crt ../.venv/bin/python -m sharpwalk.run_coverage ../public/area && cd ..
```

```bash
cd pipeline && SSL_CERT_FILE=/root/.ccr/ca-bundle.crt ../.venv/bin/python -m sharpwalk.run_contours ../public/area && cd ..
```

Expected at this handoff: vitest 255/255 in 23 files; tsc clean; build OK (~246.2 KB gzipped JS); pytest 61 passed;
playwright 43/43; route bench not re-run this session (engine routing unchanged; last 316-393 ms). Open DECISIONS.md "Plan defaults applied" and the blocker register before editing.

## Last session report

```text
Session / member: operated from parcilla13's account (member not stated); cloud session_01NVSLpGshQsBW5eL1eQzMgw
Model / tools: Claude Code, Claude Opus 5.5; Superpowers test-driven-development skill; Fable 5.2 not used
Times (Asia/Manila, container clock): Sat 14 Nov 15:19-15:45 (Conditions, R-02/R-04 follow-ups), 16:27-16:50
  (R-11 review, 2.6 coverage outlines and fonts, R-12 review) 16:50-17:06 (2.6 contours, R-13 review) and 17:11-17:26 (2.6 hatch aliasing, R-14 review)
Branch: claude/wizardly-lovelace-i2i0wa (fast-forwarded from claude/trusting-fermi-c5pc0s at 091866a; nothing overwritten)
Starting commit this part: 38965fa (verified equal to origin, clean tree, no new branches, no open PRs at 17:11)
Ending commit: the log commit after c739bf4 (git log -1)
Phase parts: 2.6 parts 3-5 VERIFIED for their scope (coverage outlines, fonts, 10 m contours, hatch aliasing); 2.6
  overall IN PROGRESS (Design review only). R-11 VERIFIED. 3.6 Conditions still IN PROGRESS (AC-09 2/3; T-02 unset).
Files changed: see PHASES.md completion records (R-11; 2.6 part 3) plus the logs and README
Checks run: see "Tests run at handoff" (all green at e4cb7f6)
Failures / limitations: IBM font packages' telemetry postinstall attempted one report (refused by the proxy) before
  they were replaced (S-06); run_display not re-run end to end after it gained the coverage and contour calls;
  gdal-bin 3.8.4 installed in this container only (P-05); earlier test-file count corrected (LOG-01)
Decisions needing people: B-13 (COV-01, S-06, C-20, COV-02), plus B-1, B-3, B-4, B-9..B-12 unchanged
SI_LOG.md entries added this part: 1 row (17:11-17:26)
Uncommitted changes left: none (.venv/, node_modules/, dist/, test-results/ are git-ignored)
Next owner: the team (blocker register), then the next session from "Exact next task"
```

## Outgoing handoff checklist

- [ ] Stop before the account/member rotation deadline; do not abandon an unrecorded worktree.
- [ ] Finish and verify the current phase part where feasible. Otherwise mark it `IN PROGRESS` or `BLOCKED`, never `VERIFIED`.
- [ ] Commit verified work on the working branch. Do not push directly to shared `main`. Merge a PR (human or AI) only when it meets the completeness checklist in `CLAUDE.md` step 6.
- [ ] Update `PHASES.md` with exact checks, results, limitations and commit SHA.
- [ ] Update `DECISIONS.md` for any changed decision or newly discovered blocker.
- [ ] Update `SI_LOG.md` for SI contributions during the session.
- [ ] Record every changed file and the state of all uncommitted work.
- [ ] State the next phase part and give exact commands/paths for the incoming owner.
- [ ] Confirm no work was silently discarded, reset, force-pushed or overwritten.

## Incoming session checklist

1. Read `CLAUDE.md`, `HANDOFF.md`, `PHASES.md`, `DECISIONS.md` and `SI_LOG.md`.
2. Inspect `git status`, current branch, all active branches, recent commits and any open PRs.
3. Verify the live challenge deadline and remaining time in Asia/Manila. Rebase the original plan gates; do not restart the original clock.
4. Confirm the human owner and module boundary before editing.
5. Re-run the last relevant check if its result is unclear or the working tree changed.
6. Resume the first incomplete phase part. Do not repeat verified work unless a regression or changed dependency requires it.
7. Update this file and `PHASES.md` after meaningful progress.

## Handoff rules

- Rotation target: approximately every five hours, or sooner if the Claude Pro account reaches its usage limit.
- GitHub and these files are the source of continuity; prior chat messages are not.
- Use a separate branch per owner/workstream. Share commits before handoff, not uncommitted local state alone.
- No one, human or AI, merges a PR until it meets the completeness checklist in `CLAUDE.md` step 6.
