# SharpWalk - live session handoff

This file is the handoff between team members and Claude sessions. Keep it factual and current. A new session must read this file before touching code.

## Current snapshot

- Last updated: **Sat 14 Nov 2026, ~18:45 Asia/Manila (UTC+8)** (container clock). Previous full handoff: 17:31 (session on `claude/wizardly-lovelace-i2i0wa`); this session only appended RUN-01 (see "Session update 18:45" below).
- Deadline: **Sun 15 Nov 2026, 23:59 local** (plan 19.3). Re-checked 18:40: the official Space Apps FAQ confirms the 14-15 Nov 2026 dates; the 23:59 local close is still only on third-party pages. **A person must confirm it on the live portal.** Remaining at 18:45: about 29 h 14 min.
- Gates: G0 and G1 expired and passed only under their fallbacks (2D only; 3D cut). G2 (Sat 19:00): criteria met at 14:48; latency margin thinner on this machine at 17:30 (see Known failures 2). **G3 (Sun 01:00, about 7 h 29 min away): at risk on human inputs only** (B-1, B-3, B-4, B-9, B-12).
- **Branch `ccr-dbbcdd02-kqy23v`** (this session's designated branch), fast-forwarded from `claude/wizardly-lovelace-i2i0wa` at 82babb6 (nothing overwritten) plus this session's log commit. `claude/wizardly-lovelace-i2i0wa` itself is unchanged at 82babb6. Working tree clean after the commit.
- History: `claude/trusting-fermi-c5pc0s` at 091866a (previous handoff) fast-forwarded, nothing overwritten, **plus 18 commits** from this session (17 before this handoff commit). `main` is **bb473b7**, unchanged. **No open PRs; nothing merged** (operator instruction: no merge, no PR without authorization).
- Session: operated from **parcilla13's account**; Claude Code with **Claude Opus 5.5** throughout; Fable 5.2 not used; the Superpowers skill was installed and its test-driven-development workflow used.
- Environment ("Space App", personal): allows `www.giss.nasa.gov` and `mars.nasa.gov` (added with the user's approval at 15:21); the USGS bucket and package registries were reachable. **`gdal-bin` 3.8.4 was installed in this container only** (P-05); a new container needs it again for contour rebuilds.
- **Authorship:** SharpWalk's concept and project plan are **Patrick Ezekiel A. Arcilla's (parcilla13)**. This branch's CLAUDE.md says so (G-06), and the account owner restated it in this session's handoff request ("preserve the user's sole authorship of the concept and plan"; DECISIONS G-06 note). `main` still carries the older G-01 wording (team credit); the change reaches `main` only through a reviewed PR. SI assistance is recorded separately in SI_LOG.md and never as the origin of the concept or plan.

Do not interpret blank fields as proof that no work exists. Inspect GitHub and the working tree.

## Session update 18:45 (ccr-dbbcdd02-kqy23v)

- Operator: not stated in the session (the account appears to be Christian Jesus Alcazar's; to be confirmed). Claude Code, Claude Opus 5.5. **The Superpowers skill is not installed in this container and was not used.** Fable 5.2 not used.
- The user supplied the plan PDFs (parts 1-2). Their sha256 match `docs/plan/*.pdf` on `claude/lucid-ptolemy-nz6qpw` (c1ae51be..., 74b67ac6...). They are not on this branch (`*.pdf` is git-ignored).
- Baseline re-run on a fresh container at 82babb6: vitest 255/255 (23 files), tsc clean, build OK, pytest 59 passed + 2 skipped (before gdal-bin), licence inventory current, Playwright 43/43.
- **RUN-01 (1.2):** full rebuild from the USGS sources reproduces all 13 committed area outputs (PHASES completion record). P-03 is still open.
- No code, data, contract or decision changed. No PR opened, nothing merged. Open PRs: none (PR #1 merged earlier).
- Still open, unchanged: G-01 (`main`, team credit) vs G-06 (this branch, Patrick's sole authorship). The team must settle it before any merge to `main`.

## Team and module ownership

Team: Patrick Ezekiel A. Arcilla (parcilla13; concept and plan), Christian Jesus Alcazar, Eugene Ibañez Jr. ("Yujin"), John Malubay.
**No per-module roles (G-05):** each session takes the earliest incomplete phase parts in order, on its own branch.
Where the plan names an owner role (Captain, Data and Science, Route Engine, Design), read it as "the team". Contract
changes still need the team's recorded agreement (CLAUDE.md step 6). Credit for implementation, data, design, review
and delivery follows git and the logs.

## Current phase and status

**Current phase: G3 (Tier 1 integration); G4 items done ahead where unblocked.** Evidence per part in PHASES.md.

| State | Parts |
|---|---|
| VERIFIED | 0.1, 0.2; 2.2, 2.3, 2.5 (interim rule), 2.7 (cloud machine); 4.4 (automated checks); review follow-ups R-02/8, R-02/10, R-04/6, R-11 |
| IN PROGRESS (built, checks green, not complete) | 0.3 (contracts unagreed); 1.1, 1.2 (GDAL 3.12.3 rerun), 1.4; 2.1 (20 deg source unresolved); 2.4; **2.6 (code-complete: parts 1-5 incl. coverage outlines, Plex fonts, 10 m contours, hatch aliasing fix; Design review B-13 open)**; 3.1; 3.2; 3.3; 3.4 (paper/Safari print, fixed-scale map); **3.6 Conditions (built; AC-09 2 of 3 dates; scenario time T-02 unset)**; 4.1 (contours, drill, AC-31; sky obstruction deferred); 5.4 (README draft) |
| BLOCKED | 0.4 (Local Lead answers); 1.3 (C-12); 4.2 AC-07 and 4.3 AC-08 (D5) |
| NOT STARTED | 1.5 (control points); 3.5 (deploy, B-4); 4.5; 5.1-5.3, 5.5 |
| CUT | 1.6 (3D view, D-10) |

Missing for G3 (Tier 1 Musts): **rover point of view** (D6, B-3), **planned margin values** (T-01, B-1), **scenario
time** for the sun values (T-02, B-9), **per-stop tasks on the card** (C-19, B-12), **first public deploy** (3.5, B-4).

## What exists and passes its tests

- `src/contracts` (Zod, frozen as drafted, unagreed); `src/geo` (F1/F5/F6/F7, planetographic for the sun input, grid cell <-> F1 with one cached grid frame); `src/constants` (cited register incl. TT-UTC).
- `src/engine`: A* routing, time field, leg ranges, plan 6.6 margins; Planner (only MissionPlan writer; Commands incl. per-stop durations and `scenario_utc`); Mars24 sun (`sun.ts`); Comlink worker; time-to-habitat contour lines.
- `src/map`: AREA sheet with D2 base, D1 hillshade, **terrain symbols drawn in screen pixels from class masks** (`terrainLayer.ts`, `terrainPattern.ts`), **10 m elevation contours** (`elevationContours.ts`, `elevationLayer.ts`), **D1/D2 coverage outlines** with layer-list notes (`coverage.ts`, `coverageLayer.ts`), route, stops, keyboard cursor, readout, margin ticks, drill line; briefing snapshot.
- `src/app`: console with ASSUMED banner, plan-time inputs, end margin and state, **Conditions panel** (LMST, sun elevation, L_s; dated REMS reading), sources panel (D7, D10 described), elevation profile; **IBM Plex Sans/Mono** self-hosted (`fonts.css`).
- `src/briefing`: A5 card, version stamp, STALE + print blocked; lists contours. `src/field`: Field View (only MissionExecution writer).
- `pipeline`: D1 grids, F7 display layers, provenance; `run_rems` (D7), `run_coverage`, `run_contours` (needs the GDAL CLI), `run_terrain_masks` (local files only); `run_display` calls the last three. `public/area` and `public/conditions` committed and checksummed by pytest.
- `docs/licences.md` (generated, current); `docs/data/d10-mars24-source.md`; `README.md` (authorship, SI use, references incl. D7, D10, fonts).

## Files changed this session (git diff 091866a..HEAD: 42 added, 42 modified, 1 deleted)

- Logs and docs: `DECISIONS.md`, `HANDOFF.md`, `PHASES.md`, `README.md`, `SI_LOG.md`, `docs/licences.md`, `docs/data/d10-mars24-source.md` (new).
- Config: `index.html` (empty inline icon), `package.json`, `package-lock.json` (+ `@fontsource/ibm-plex-sans` 5.3.0, `@fontsource/ibm-plex-mono` 5.3.0).
- E2E: new `e2e/{helpers.ts,conditions,contours,coverage,fonts,hatch}.spec.ts`; changed `e2e/{a11y,area-sheet,briefing,drill,field,plan-route,resilience}.spec.ts`.
- Pipeline: new `pipeline/sharpwalk/{rems,run_rems,coverage,run_coverage,contours,run_contours,run_terrain_masks}.py`, `pipeline/tests/{test_rems,test_coverage,test_contours}.py`; changed `pipeline/sharpwalk/{display,run_display}.py`, `pipeline/tests/{test_display,test_area_outputs}.py`.
- Data: new `public/area/{coverage.geojson,contours.geojson,terrain_steep.png,terrain_excluded.png,terrain_unknown.png}`, `public/conditions/rems.json`; changed `public/area/layers.json`; **deleted `public/area/terrain_overlay.png`**.
- App: new `src/app/{ConditionsPanel.tsx,conditions.test.ts,fonts.css,rems.ts,rems.test.ts}`, `src/engine/{sun,sun.test}.ts`, `src/geo/{planetographic,planetographic.test}.ts`, `src/map/{coverage,coverage.test,coverageLayer,elevationContours,elevationContours.test,elevationLayer,terrainLayer,terrainPattern,terrainPattern.test,view}.ts`; changed `src/app/{App.tsx,QuantityText.tsx,SourcePanel.tsx,format.ts,format.test.ts,main.tsx,sources.ts,sources.test.ts,styles.css}`, `src/briefing/{model,model.test}.ts`, `src/constants/index.ts`, `src/engine/{assumptions,planner,planner.test}.ts`, `src/geo/{grid,grid.test}.ts`, `src/map/{AreaSheet.tsx,loadArea.ts,readout.ts,snapshot.ts}`.
- Note: commits 9ec2f70 and 6e8ca00 say "Phase 3.2 Conditions" in their messages; PHASES records that work as part 3.6.

## Tests run at handoff (Sat 14 Nov 17:27-17:30 at d9bd3bd, clean install; exact commands and results)

| Command | Result |
|---|---|
| `npm ci` | OK, 0 vulnerabilities |
| `npx vitest run` | **255 passed / 255**, 23 files |
| `npx tsc --noEmit` | clean |
| `npm run build` (dist deleted first) | OK; Vite reports main 205.29 kB gzip; worker 40,897 B gzip: **~246.2 KB of the 250 KB JS budget** (B-01, under 4 KB headroom). Fonts are separate woff2 assets (a Planning load fetches 10 files, 171 KB) |
| `(cd pipeline && ../.venv/bin/python -m pytest)` | **61 passed** (area, mask, coverage, contour, REMS checksums and content; gdal_contour plane oracle, which skips without the GDAL CLI; licence inventory) |
| `.venv/bin/python scripts/licences.py \| diff -q - docs/licences.md` | no difference (inventory current) |
| `PW_CHROMIUM=/opt/pw-browsers/chromium-1243/chrome-linux64/chrome npx playwright test --trace off` | **43 passed / 43** (cold build via vite preview) |
| `SHARPWALK_AREA=public/area node --experimental-strip-types bench/route-bench.ts`, two runs | Run A (straight after Playwright, load average ~2.35 on 4 cores): decreasing placeholder longest route 450, 472, **523** ms; time field 586, 517, 514 ms. Run B: **unity (the factors the app uses, K-01) longest route 463, 377, 369 ms**; time field 475, 484, 596 ms; decreasing placeholder longest route 458, 498, 447 ms; time field 462, 464, 553 ms. Target: route < 500 ms, field < 3 s. Routing code unchanged since 091866a |

## Known failures and limitations

1. No failing test or check. E2E needs `PW_CHROMIUM` in this cloud container (Playwright 1.65.0 with 1.63 browsers, S-03).
2. **Latency margin:** one of six "decreasing placeholder" route runs took 523 ms (> 500 ms) under load; unity factors (used by the app) stayed under 500 ms (369-463 ms). At 14:48 the same benchmark gave 316-393 ms. The engine is unchanged, so this is machine load; confirm on a mid-range laptop at G5 before calling G2 latency safe.
3. Planned and field margins show "unknown" until plan times are entered (B-1); sun values show "unknown" until a scenario time is set (B-9).
4. **Bundle: ~246.2 KB of 250 KB** (B-01). Check size before adding code.
5. Pipeline: outputs built with rasterio's GDAL 3.10.3 (P-03) and contours with the GDAL 3.8.4 CLI (P-05), not the pinned 3.12.3. **18:35 RUN-01: `run_d1` + `run_display` re-run end to end into an empty directory reproduce all 13 committed `public/area` files byte for byte** (same stack). A conda-forge GDAL 3.12.3 env was refused again by the permission classifier, so P-03 stays open.
6. 31 native libraries bundled in the pipeline wheels: licences not verified (docs/licences.md).
7. Hatch: during a button zoom (~250 ms) the terrain canvas is briefly scaled before re-rendering (HATCH-02, accepted).
8. Deferred review findings still open: R-02 (4 = C-16; 7 waits for P-01), R-03 (5), R-04 (7 = C-16), R-05 (5, 6), R-06 (5), R-07 (3), R-08 (5), R-11 (4, skipped), R-13 (CON-02 timing at G5).

## Decisions awaiting human approval (DECISIONS.md)

| Who | Items |
|---|---|
| Patrick Ezekiel A. Arcilla | Concept-formation account for SI_LOG/README (B-5; his account to give); Vercel deployment (B-4, R-17); portal deadline confirmation |
| Team (contracts) | C-01..C-17 (C-12, C-16, C-17 open), **C-18** (REMS snapshot schema), **C-19** (stop name/tasks command, B-12), **C-20** (coverage file), **C-21** (contour file); G-06 wording reaching `main` via PR review |
| Team (plan values) | **T-01** plan times (B-1), **T-02** scenario time (B-9), K-02 bin edges, H-01 habitat, D-04 interim smoothing, F-01, L-01/L-02 |
| Design (B-13) | COV-01 coverage outline symbol, COV-02 load view vs crop, CON-03 contour symbol, HATCH-01 hatch look, S-06 Fontsource packages, S-01..S-05 tooling |
| Data and Science | **P-01** grid encoding (gates the shared elevation decoder, R-02/7), P-02, **P-03/P-05** GDAL versions, CON-01 contour grid, SUN-01..03 (Mars24 frame, table digits, coefficient register), REMS-01/02 (units, outreach terms, B-11), D-05 vertical reference, D-06, 1.1 sign-off, 1.4 trust grid, 20 deg slope-limit source |
| Local Lead (via the team) | D-01 pre-event wireframes; D-02 GSAP / Cesium Mars |
| Any member with Java | AC-09 third date with the Mars24 app (B-10) |

## External blocker register (Sat 14 Nov 2026, 17:31 Asia/Manila)

Nothing below is marked approved or filled in by SI. "Needed by" times leave time to build and check before G3 (Sun 01:00).

| # | Blocker | Owner | Input required | Impact if missing | Needed by |
|---|---|---|---|---|---|
| B-1 | EVA, task, contingency and stop durations (T-01) | Team | T_EVA, t_ops, t_cont, default stop duration (and any per-stop values), each with a one-line rationale; enter in the console or record under T-01 | Planned and field margins show "unknown"; G3 "including planned margin" fails | Sat 22:00 |
| B-3 | 3-5 Curiosity images and metadata (D6) | Team | For each: image ID/URL, sol, camera, credit line, and the stop or terrain it illustrates ("similar terrain"). Pick from the NASA MSL raw-images browser (DECISIONS B-3-SRC). "Curiosity's Proposed Path up Mount Sharp" is a planning visualization, **not** a rover-camera image. Nothing selected by SI | Tier 1 rover point of view missing at G3 | Sat 22:00 |
| B-4 | Vercel deployment access (R-17) | Patrick Ezekiel A. Arcilla | Vercel project linked to the repository, or a deploy by a member; then the FortiGuard classification request (plan 19.3) | No public deploy: G3 and G5 fail; judges cannot open the app | Sun 00:00 |
| B-5 | Concept-formation account (SI_LOG, README) | Patrick Ezekiel A. Arcilla | How and when the concept was formed, pre-event research, confirmation and date (not written by SI) | SI disclosure incomplete | Sun 17:00 |
| B-6 | Contract agreement C-12, C-16, C-17 | Team | Agree or reject each | No AreaManifest; leg length/climb without Quantity metadata; stored field margins cannot be "unknown" | Sat 22:00 |
| B-7 | D5 rover positions | Team | Curiosity positions for sols 1456-1467 (Butte M12) and the reference period | AC-07 and AC-08 cannot run; sky-obstruction layer stays hidden (SKY-1) | Sun 06:00 (G4) |
| B-8 | Merge of `claude/wizardly-lovelace-i2i0wa` (contains `trusting-fermi`) | A human (no AI merge or PR without authorization) | Open a PR when authorized; review incl. G-06 vs G-01, C-18..C-21, SUN-01..04, S-06, P-05 | Work stays off `main`; G4 "Tier 2 merged" fails | Sun 10:00 |
| B-9 | Scenario date and time (T-02) | Team | A UTC date and time from 2017 on, with a one-line rationale | Sun elevation, LMST and L_s show "unknown" | Sat 22:00 |
| B-10 | AC-09 third date | Any member with Java | Mars24 app at 4.8719 S (planetographic), 222.61 W; compare sun elevation with the console's (pass within 0.1 deg) | AC-09 stays 2 of 3 | Sun 10:00 (G4) |
| B-11 | REMS units and outreach terms (REMS-01/02) | Team (Data and Science) | Confirm degrees C / Pa and whether CAB's "outreach purposes only" terms fit the submission | D7 shown with unconfirmed units/terms | Sun 13:00 (G5) |
| B-12 | Stop name/tasks command (C-19) | Team (contract) | Option (a) new `edit_stop` CommandType or (b) engine-defined payload fields | Card shows no per-stop tasks | Sat 22:00 |
| B-13 | Design / Data and Science confirmations from 2.6 | Team | COV-01, COV-02, CON-01, CON-03, HATCH-01, S-06, P-05, C-20, C-21 | Choices stay as display defaults | Sun 10:00 (G4) |

B-2 (NASA host access) was resolved at 15:21 for the "Space App" environment.

## Exact next task

1. **Human inputs for G3, smallest first:** B-9 scenario time and B-1 plan times (a value + one-line rationale each, in the console or recorded under T-02 / T-01 so a session can pre-set them as logged team choices); B-12 stop-tasks option; B-3 images; B-4 Vercel. Do not invent any of them.
2. **Next code-only work (no approval needed):** G5 preparation that does not add bundle weight: measure route latency, contour load (CON-02) and frame pacing (HATCH-04) on a mid-range laptop (needs a person's machine). The end-to-end pipeline rerun is DONE (RUN-01, 18:35). P-03 needs a machine with GDAL 3.12.3.
3. **When B-12 is decided:** implement stop name/tasks in the planner, the plan panel and the card (contract change recorded first).
4. **When B-3 images arrive:** rover point of view in the stop panel and the card, labelled "similar terrain", with sol, camera and credit.
5. **When B-4 arrives:** 3.5 first public deploy, then G5 checks; re-take the REMS snapshot at build time.
6. **Do not:** touch the shared elevation decoder before P-01; change contract files before agreement (C-18..C-21); build the sky-obstruction layer before AC-07 (SKY-1); fabricate any position, benchmark, plan time, scenario time, image or AC-09 date.

## Exact commands for the next session

```bash
git fetch origin && git checkout ccr-dbbcdd02-kqy23v && git pull   # or claude/wizardly-lovelace-i2i0wa (82babb6) + the RUN-01 log commit
```

```bash
git log -1 && git status --short
```

```bash
npm ci && npx vitest run && npx tsc --noEmit && npm run build
```

```bash
python3.11 -m venv .venv && .venv/bin/pip install -r pipeline/requirements.txt && (cd pipeline && ../.venv/bin/python -m pytest)
```

```bash
PW_CHROMIUM=/opt/pw-browsers/chromium-1243/chrome-linux64/chrome npx playwright test --trace off
```

(Off this cloud container: `npx playwright install chromium`, then `npx playwright test --trace off`.)

```bash
SHARPWALK_AREA=public/area node --experimental-strip-types bench/route-bench.ts
```

```bash
.venv/bin/python scripts/licences.py | diff -q - docs/licences.md
```

(Regenerate with `.venv/bin/python scripts/licences.py > docs/licences.md` only after changing dependencies.)

Pipeline reruns (only if the pipeline or data changes). Terrain masks, local files only (about 3 s):

```bash
cd pipeline && ../.venv/bin/python -m sharpwalk.run_terrain_masks ../public/area && cd ..
```

Coverage outlines (USGS bucket, about 30 s) and contours (USGS bucket + GDAL CLI, about 35 s):

```bash
cd pipeline && SSL_CERT_FILE=/root/.ccr/ca-bundle.crt ../.venv/bin/python -m sharpwalk.run_coverage ../public/area && cd ..
```

```bash
apt-get install -y --no-install-recommends gdal-bin
```

```bash
cd pipeline && SSL_CERT_FILE=/root/.ccr/ca-bundle.crt ../.venv/bin/python -m sharpwalk.run_contours ../public/area && cd ..
```

D7 REMS snapshot (mars.nasa.gov):

```bash
cd pipeline && SSL_CERT_FILE=/root/.ccr/ca-bundle.crt ../.venv/bin/python -m sharpwalk.run_rems ../public/conditions && cd ..
```

Full rebuild (USGS bucket + GDAL CLI; also writes masks, coverage and contours; not yet run end to end):

```bash
cd pipeline && SSL_CERT_FILE=/root/.ccr/ca-bundle.crt ../.venv/bin/python -m sharpwalk.run_d1 ../public/area && SSL_CERT_FILE=/root/.ccr/ca-bundle.crt ../.venv/bin/python -m sharpwalk.run_display ../public/area && cd ..
```

Expected at this handoff: vitest 255/255 in 23 files; tsc clean; build OK (~246.2 KB JS gzip); pytest 61 passed;
licence inventory current; Playwright 43/43; route bench unity factors under 500 ms (machine-dependent, see Known failures 2).

## Last session report

```text
Session / member: operated from parcilla13's account (the account owner, Patrick Ezekiel A. Arcilla; the member at the
  keyboard was not otherwise stated); cloud session_01NVSLpGshQsBW5eL1eQzMgw
Model / tools: Claude Code, Claude Opus 5.5 throughout; Superpowers test-driven-development skill; Fable 5.2 not used;
  one web search (REMS units); gdal-bin 3.8.4 installed in the container; two environment hosts added with approval
Times (Asia/Manila, container clock): Sat 14 Nov 15:19-17:31, in parts: 15:19-15:45 Conditions (3.6) and R-02/R-04
  follow-ups; 16:27-16:50 R-11 review, 2.6 coverage outlines and fonts, R-12; 16:50-17:06 2.6 contours, R-13;
  17:11-17:26 2.6 hatch aliasing, R-14; 17:27-17:31 handoff (clean-install check run)
Branch: claude/wizardly-lovelace-i2i0wa (fast-forwarded from claude/trusting-fermi-c5pc0s at 091866a; nothing overwritten)
Starting commit: 091866a. Ending commit: the handoff commit after d9bd3bd (18 commits this session)
Phase parts: VERIFIED (for their scope): 2.6 parts 3-5; R-02/8, R-02/10, R-04/6, R-11. IN PROGRESS: 2.6 overall
  (Design review only), 3.6 Conditions (AC-09 2/3, T-02 unset). No part was marked complete without its checks.
Files changed: see "Files changed this session" (42 added, 42 modified, 1 deleted)
Checks run: see "Tests run at handoff" (17:27-17:30, clean install, all passing; bench margin noted)
Reviews: /code-review R-10..R-14 on every code change; all findings fixed or recorded in DECISIONS
Failures / limitations: see "Known failures and limitations"; IBM font packages' telemetry postinstall made one
  attempt (refused by the proxy) before they were replaced (S-06); test-file count once mis-logged, corrected (LOG-01)
Decisions needing people: see "Decisions awaiting human approval" and the blocker register
SI_LOG.md: one row per working part, plus the handoff row
Uncommitted changes left: none
Next owner: the team for B-1, B-3, B-4, B-9, B-12, B-13; then the next session from "Exact next task"
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
