# SharpWalk - live session handoff

This file is the handoff between team members and Claude sessions. Keep it factual and current. A new session must read this file before touching code.

## Current snapshot

- **Last updated:** Sat 14 Nov 2026, 20:58 Asia/Manila (UTC+8), container clock (`TZ=Asia/Manila date`). Session `claude/clever-thompson-qowa8n` (20:41-20:58); the 20:28 snapshot below is kept where still true.
- **This session (20:41-20:58):** branch **`claude/clever-thompson-qowa8n`** = `main` **`8285658`** (PR #10 merged the 20:28 handoff) + 3 commits: `2a65db1` per-stop sky "20 m sample" (plan 6.7, part 4.1), `7cf23b2` /code-review R-20 fixes, and the log commit (run `git log -1`). **Pushed, no PR opened, not merged** (the session request said human review and merge are required). Operator not stated; the account email does not name a team member, so no owner is assumed (G-05: no per-module roles). Claude Opus 5.5 only; Fable 5.2 not used; Superpowers not installed (not used). Checks at 7cf23b2: vitest 282/282, tsc clean, build ~249.6 of 250 KB, Playwright 50/50, pytest 82 + 2 skipped (no gdal-bin), licences current.
- **Deadline:** Sun 15 Nov 2026, 23:59 local (plan 19.3). The official Space Apps FAQ confirms the 14-15 Nov dates. The 23:59 close appears only on third-party pages: **a person must confirm it on the portal.** Remaining at 20:28: about 27 h 31 min.
- **Current phase:** G4 work done; preparing for G5. G3 and G4 are met **except the first public deploy (B-4)**. G5 freeze: Sun 13:00.
- **Branch:** `ccr-dbbcdd02-kqy23v`. **`main` = `38839d0`** holds all work (PRs #2-#9 merged this evening). This handoff commit sits on `ccr-dbbcdd02-kqy23v` on top of `38839d0` and is **not merged** (the handoff request said not to merge to main). Run `git log -1` for its SHA.
- **Working tree:** clean after the handoff commit. No stashes. Only git-ignored caches remain (`node_modules/`, `.venv/`, `dist/`, `test-results/`, `__pycache__/`, `.pytest_cache/`).
- **Open PRs:** none at 20:41 (checked with the GitHub API). PR #10 merged as `8285658`. Older branches `claude/kind-ptolemy-1wdqf5` and `claude/lucid-ptolemy-nz6qpw` hold pre-rebase commits (Sat 10:36-12:18) whose content reached `main` by other branches; not touched. The plan PDFs are only on `claude/lucid-ptolemy-nz6qpw` (`docs/plan/`).
- **Session:** cloud session `ccr-dbbcdd02-kqy23v`, Sat 18:29-20:30.
  - Operator not stated in the session; the account appears to be Christian Jesus Alcazar's (to be confirmed).
  - Claude Code with Claude Opus 5.5 throughout. Fable 5.2 not used.
  - **The Superpowers skill is not installed in this container and was not used.**
- **Container setup this session:** `gdal-bin` 3.8.4 installed with apt (needed only for contour rebuilds). A conda-forge environment for GDAL 3.12.3 was refused twice by the permission classifier.

Do not interpret blank fields as proof that no work exists. Inspect GitHub and the working tree.

## Authorship (read before editing attribution)

- **`CLAUDE.md` on `main` (G-07, Sat 18:52, on this session operator's instruction):** the concept, framing, solution direction, requirements and plan are credited to the **whole four-member team**. G-07 superseded G-06 (Patrick Ezekiel A. Arcilla's sole authorship, recorded at 14:47 and reaffirmed from parcilla13's account at 17:27).
- **This handoff request (Sat ~20:25)** asked to "preserve the user's sole authorship of the concept and plan". That conflicts with G-07. It also does not say which user, and changing authorship on a guess would risk misattribution. **This session changed nothing** and recorded the conflict as the G-07 note in `DECISIONS.md`.
- **The team must settle G-07 in writing** before submission: Patrick, Christian, Yujin and John.
- **SI is never credited with the concept or plan.** SI assistance is recorded in `SI_LOG.md`. Values that SI chose at a member's direction are labelled as such (G3-01, C-19, C-22, V-11..V-14).

## Team and module ownership

Team: Patrick Ezekiel A. Arcilla (parcilla13), Christian Jesus Alcazar, Eugene Ibañez Jr. ("Yujin"), John Malubay.
**No per-module roles (G-05).** Each session takes the earliest incomplete phase parts in order, on its own branch. Contract changes need the team's recorded agreement (CLAUDE.md step 6).

## Phase status (details and evidence in PHASES.md)

| State | Parts |
|---|---|
| VERIFIED | 0.1, 0.2; 2.2, 2.3, 2.4 (G3-01 demo values), 2.5 (interim rule), 2.7 (cloud); 3.2; 4.1 (contours, drill, sky layer), 4.2 (AC-07 at M12), 4.3 (AC-08), 4.4 (automated), 4.5 (integrated build on main) |
| IN PROGRESS | 0.3 (contracts agreed as drafted for the merge only; C-12/C-16/C-17 open); 1.1, 1.2 (P-03), 1.4; 2.1 (20° source UNRESOLVED); 2.6 (Design review); 3.1; 3.3 (phone check); 3.4 (paper print); 3.6 (AC-09 2 of 3); 5.4 (README; concept account B-5) |
| BLOCKED | 0.4 (Local Lead); 1.3 (C-12, needs 1.5) |
| NOT STARTED | 1.5 (control points, human); **3.5 first public deploy (B-4)**; 5.1-5.3, 5.5 |
| CUT | 1.6 (3D view, D-10) |

## Work done this session (all merged to main)

| PR | Merge | Content |
|---|---|---|
| #2 | 1da70b5 | All earlier branch work (pipeline, engine, AREA sheet, console, card, field view); RUN-01 reproducibility; G-07 team credit; C-AGREE; /code-review R-15 fixes |
| #3 | a761afd | G3 inputs chosen by SI at the operator's direction: preset plan times and scenario (G3-01); `edit_stop` (C-19); D6 rover images (C-22); R-16 fixes; G3-02 approvals |
| #4 | 304d87c | CLAUDE.md placeholder and invented values register (G-08) |
| #5 | 31270cf | AC-08 rover-path check: PASS, 83 of 2,537 known path cells excluded (3.27 %); R-17 fixes |
| #6 | 234d0cf | AC-07 sky-obstruction benchmark at Butte M12: PASS, f_obs 18.50 % vs 18.5 %; R-18 fixes |
| #7 | 40f3aef | HANDOFF 19:55 |
| #8 | 706cc1a | Sky-obstruction layer (plan 6.7, 20 m grid, off by default); R-19 fixes |
| #9 | 38839d0 | Merge record, HANDOFF 20:25 |

## Files changed this session (git diff 82babb6..38839d0: 34 added, 44 modified; 32 commits)

- **Added:**
  - **Docs:** `docs/data/{ac-07-sky-m12.md, ac07-sky-m12.json, ac-08-rover-path.md, ac08-rover-path.json, d5-traverse-in-area.geojson}`.
  - **E2E:** `e2e/{g3-preset, rover, sky, stop-tasks}.spec.ts`.
  - **Pipeline:** `pipeline/sharpwalk/{rover_path, run_rover_path, sky, run_sky_benchmark, sky_grid, run_sky_grid}.py`, `pipeline/tests/{test_rover_images, test_rover_path, test_sky, test_sky_grid}.py`.
  - **Data:** `public/area/sky_obstruction.{png,uint16.bin}`, `public/rover/{images.json, sol4602/4628/4650_navcam_left.jpg}`.
  - **App:** `src/app/{RoverView.tsx, demoPreset.ts(+test), profile.ts(+test), rover.ts(+test), stopTasks.ts(+test)}`.
- **Modified:**
  - **Logs and docs:** `CLAUDE.md`, `DECISIONS.md`, `HANDOFF.md`, `PHASES.md`, `README.md`, `SI_LOG.md`.
  - **E2E:** all 13 earlier e2e specs (moved to `/?preset=none`).
  - **Pipeline:** `pipeline/sharpwalk/{geo, run_display}.py`.
  - **Data:** `public/area/{layers.json, provenance.json}`.
  - **App:** `src/app/{App, DrillPanel, PlanPanel, RouteProfile}.tsx`, `styles.css`, `src/briefing/BriefingView.tsx`, `src/map/{AreaSheet.tsx, loadArea.ts, snapshot.ts}`, `src/field/{FieldView.tsx, execution.ts(+test)}`.
  - **Engine:** `src/engine/{assumptions, margin(+test), planner(+test)}.ts`.
  - **Constants:** `src/constants/{index, constants.test}.ts`.
  - **Contracts:** `src/contracts/{schemas.ts, contracts.test.ts}` (**`edit_stop` CommandType**).
- **This handoff commit:** `PHASES.md`, `HANDOFF.md`, `DECISIONS.md`, `SI_LOG.md` only.

## Tests run at handoff (Sat 14 Nov 20:25-20:27, clean install, at 38839d0)

| Command | Result |
|---|---|
| `npm ci` | 83 packages, 0 vulnerabilities |
| `npx vitest run` | **274 passed / 274**, 27 files |
| `npx tsc --noEmit` | clean |
| `rm -rf dist && npm run build` | OK; main 207.64 kB gzip (Vite) + worker 41,460 B (gzip -9): **~249.1 of 250 KB** |
| `(cd pipeline && ../.venv/bin/python -m pytest)` | **84 passed** (gdal-bin installed, so the contour oracle runs) |
| `.venv/bin/python scripts/licences.py \| diff -q - docs/licences.md` | no difference |
| `PW_CHROMIUM=/opt/pw-browsers/chromium-1243/chrome-linux64/chrome npx playwright test --trace off` | **48 passed / 48** |
| `SHARPWALK_AREA=public/area node --experimental-strip-types bench/route-bench.ts` | longest route 309-319 ms (unity) and 364-436 ms (placeholder), all < 500 ms; time field 377-418 ms (< 3 s) |

Earlier this session: full pipeline rebuild (RUN-01) reproduced all 13 committed area files byte for byte. AC-08, AC-07 and the sky grid runs are recorded with their commands in PHASES.

## Known failures and limitations

1. **No public deploy (B-4).** G3 and G5 cannot complete without it.
2. **JS bundle is full:** ~0.9 KB left of the 250 KB budget (B-01). Any new app code needs savings first. For this reason the per-stop "20 m sample" sky value (plan 6.7) is not shown.
3. **GDAL:** pipeline outputs were built with rasterio's GDAL 3.10.3 and contours with GDAL CLI 3.8.4, not the pinned 3.12.3 (P-03, P-05). With that stack the rebuild reproduces the committed outputs exactly.
4. **AC-07 reference position (about 10 %) not computed:** its sols are UNVERIFIED (R-13). RAD observer height UNVERIFIED (f_obs moves about 2 pp per metre). Paper page numbers not read (constants `skyObstructionM12` and `slopeLimit` are UNRESOLVED; the release check lists them).
5. **Sky layer ramp (V-14) is hard to see** on dark imagery: Design review.
6. **SI-chosen values on default load:** plan times (T_EVA 240, t_ops 30, t_cont 30, stop 45 min) and the scenario time 2026-11-15 12:00 UTC (G3-01, approved G3-02). They are labelled, editable and skippable with `?preset=none`.
7. **E2E in this cloud container needs `PW_CHROMIUM`** (Playwright 1.65.0 with 1.63 browsers, S-03).
8. **Open review items (recorded, not fixed):** R-15 #2, #6 (= C-16), #7, #9; R-16 #3, #4; earlier deferred items listed in DECISIONS (R-02 to R-13).
9. Licences of 31 native libraries bundled in the pipeline wheels not verified; D12 licence terms not read.

## Decisions awaiting human approval

| Who | Items |
|---|---|
| **Whole team** | **G-07 authorship** (team credit vs the sole-authorship wording in this handoff request and in G-06); **CLAUDE.md register V-01..V-14**: each FIXED or KEPT before the G5 freeze (G-08); G3-01/G3-02 (SI-chosen defaults); C-19 (`edit_stop`), C-22 (rover image picks, image-use terms); C-12, C-16, C-17 contract changes; H-01 habitat; K-01/K-02; L-01/L-02; F-01; D-04 smoothing |
| Patrick Ezekiel A. Arcilla / repository owner | B-4 Vercel deployment; B-5 concept-formation account (or the team's, per G-07); portal deadline confirmation |
| Data and Science | P-01/P-02 encoding, P-03/P-05 GDAL versions; D-05 vertical reference (D-05-LEAD: D1 and D5 agree to 0.05 m at M12, one point); 1.1 sign-off; 1.4 trust grid; 20° slope-limit source; SUN-01..03; REMS-01/02; AC-07/AC-08 review; V-11..V-13 method choices |
| Design (B-13) | V-14 sky ramp; COV-01, CON-03, HATCH-01, S-06; 2.6 review |
| Local Lead (via the team) | D-01 pre-event wireframes; D-02 GSAP / Cesium Mars |
| Any member with Java | AC-09 third date with the Mars24 app (B-10) |

## External blocker register (Sat 14 Nov 2026, 20:28)

| # | Blocker | Owner | Needed by |
|---|---|---|---|
| B-4 | Vercel deployment access, then a FortiGuard classification request (plan 19.3) | Repository owner | **As soon as possible** (G3 was Sun 01:00; G5 Sun 13:00) |
| B-5 | Concept-formation account for SI_LOG / README (not written by SI) | Team (G-07) | Sun 17:00 |
| B-10 | AC-09 third date (Mars24 app) | Any member with Java | Sun 13:00 |
| B-11 | REMS units and outreach terms | Data and Science | Sun 13:00 |
| B-13 | Design confirmations incl. V-14 | Design | Sun 13:00 |
| R-13 | AC-07 reference-period sols, RAD observer height, page numbers (papers' full text) | Data and Science | Sun 13:00 (else reported as not computed) |
| G-08 | Register V-01..V-14 cleared | Team | Sun 13:00 |

Resolved this session: B-1 and B-9 (G3-01), B-3 (C-22), B-7 for AC-08 and AC-07 at M12 (D5 fetched), B-8 (merged), B-12 (C-19).

## Exact next task

0. **Review and merge `claude/clever-thompson-qowa8n`** (per-stop sky sample, 2a65db1 + 7cf23b2 + logs) through a PR, after a human review (merge checklist in CLAUDE.md step 6). Bundle headroom after it: ~0.4 KB.
1. **B-4 deploy (a person with Vercel access).** Link the repository to Vercel, or deploy `dist/` from `npm run build`. Then a session runs 3.5 (deploy opens without login) and the G5 checks (two machines; 2D with Cesium blocked is trivially true since 3D is cut).
2. **Merge this handoff commit** from `ccr-dbbcdd02-kqy23v` to `main` through a PR, if the team wants `main`'s logs current. It changes logs only.
3. **Team review before Sun 13:00:** G-07 authorship; register V-01..V-14; G3-02; C-22 image terms.
4. ~~Per-stop sky "20 m sample"~~ **done on `claude/clever-thompson-qowa8n`** (fits the budget: ~249.6 of 250 KB). Remaining code options are cleanups only (R-15 #7/#9); new features need bundle savings first (Zod is ~25 KB gzip in each of main and worker; only a contract change could recover it).
5. **Then G5 → video (Sun 17:00) → submission (internal target Sun 21:00):** 5.1-5.5.
6. **Do not:**
   - touch the shared elevation decoder before P-01;
   - fabricate any position, benchmark, plan time, image or AC-09 date;
   - add an invented value without a CLAUDE.md register row;
   - change attribution without the team's written decision on G-07.

## Exact commands for the next session

```bash
git fetch origin && git checkout ccr-dbbcdd02-kqy23v && git pull   # main 38839d0 + this handoff commit
git log -1 && git status --short
```

```bash
npm ci && npx vitest run && npx tsc --noEmit && rm -rf dist && npm run build
```

```bash
python3.11 -m venv .venv && .venv/bin/pip install -r pipeline/requirements.txt && (cd pipeline && ../.venv/bin/python -m pytest)
```

(`gdal-bin` is needed only for the contour oracle tests and contour rebuilds: `apt-get install -y --no-install-recommends gdal-bin`; without it two tests skip.)

```bash
PW_CHROMIUM=/opt/pw-browsers/chromium-1243/chrome-linux64/chrome npx playwright test --trace off
```

(Off this cloud container: `npx playwright install chromium`, then `npx playwright test --trace off`.)

```bash
SHARPWALK_AREA=public/area node --experimental-strip-types bench/route-bench.ts
.venv/bin/python scripts/licences.py | diff -q - docs/licences.md
```

Pipeline reruns (only if data or method changes; they need the USGS bucket and mars.nasa.gov):

```bash
cd pipeline && export SSL_CERT_FILE=/root/.ccr/ca-bundle.crt
../.venv/bin/python -m sharpwalk.run_d1 ../public/area && ../.venv/bin/python -m sharpwalk.run_display ../public/area   # add --sky to recompute the sky layer (~5 min)
../.venv/bin/python -m sharpwalk.run_rover_path ../public/area ../docs/data      # AC-08
../.venv/bin/python -m sharpwalk.run_sky_benchmark ../docs/data                  # AC-07 (~80 s)
../.venv/bin/python -m sharpwalk.run_sky_grid ../public/area                     # sky layer (~5 min)
cd ..
```

Expected at this handoff (on `claude/clever-thompson-qowa8n`; `main` 8285658 gives vitest 274, Playwright 48):
- vitest 282/282;
- tsc clean;
- build OK (~249.1 KB);
- pytest 84;
- licences current;
- Playwright 50/50;
- route bench < 500 ms.

## Last session report

```text
Session / member: cloud session ccr-dbbcdd02-kqy23v; operator not stated (account appears to be Christian Jesus
  Alcazar's; to be confirmed)
Model / tools: Claude Code, Claude Opus 5.5 throughout; Fable 5.2 not used; Superpowers NOT installed (not used);
  /code-review on every PR (R-15..R-19 plus low reviews of each fix); gdal-bin 3.8.4 and ImageMagick in the container
Times (Asia/Manila, container clock): Sat 14 Nov 18:29-20:30
Branch: ccr-dbbcdd02-kqy23v (fast-forwarded from claude/wizardly-lovelace-i2i0wa 82babb6; nothing overwritten)
Starting commit: 82babb6. Ending: main 38839d0 + this handoff commit (not merged)
Phase parts: VERIFIED 1.2 RUN-01 (part 1.2 still IN PROGRESS for P-03), 2.4, 3.2, 4.1, 4.2 (M12), 4.3, 4.5; G3-01
  inputs; register G-08. Nothing marked complete without its checks.
Files changed: see "Files changed this session"
Checks run: see "Tests run at handoff" (all passing)
Decisions recorded: G-07, G-08, C-AGREE, G3-01, G3-02, C-19, C-22, B-7-AC08, SKY-2, SKY-3, D-05-LEAD, R-15..R-19,
  G-07 note (handoff authorship wording)
SI_LOG.md: one row per working part, plus the handoff row
Uncommitted changes left: none
Next owner: repository owner for B-4; the team for G-07 and the register; then the next session from "Exact next task"
```

## Outgoing handoff checklist

- [x] Stop before the account/member rotation deadline; do not abandon an unrecorded worktree.
- [x] Finish and verify the current phase part where feasible (none left in progress).
- [x] Commit verified work on the working branch. Do not push directly to shared `main`.
- [x] Update `PHASES.md` with exact checks, results, limitations and commit SHA.
- [x] Update `DECISIONS.md` for any changed decision or newly discovered blocker.
- [x] Update `SI_LOG.md` for SI contributions during the session.
- [x] Record every changed file and the state of all uncommitted work.
- [x] State the next phase part and give exact commands/paths for the incoming owner.
- [x] Confirm no work was silently discarded, reset, force-pushed or overwritten. (The session branch `ccr-dbbcdd02-kqy23v` was reset to `main` after each merge with `--force-with-lease`; it held only already-merged commits each time. `main` was never force-pushed.)

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
