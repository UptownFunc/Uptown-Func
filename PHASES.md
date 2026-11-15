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

## Schedule reconciliation (Sat 14 Nov 2026, 20:27 Asia/Manila, container clock; previous 14:48)

**Deadline:** Sun 15 Nov 2026, 23:59 local time (plan 19.3). The official Space Apps FAQ confirms the 14-15 Nov dates;
the 23:59 close is only on third-party pages: **a person must confirm it on the portal.** Remaining: about 27 h 32 min.

| Gate | Planned | Status now | What is incomplete | Next |
|---|---|---|---|---|
| G0 | Sat 11:00 | Passed under fallback | Contracts agreed as drafted for the merge (C-AGREE, operator); no Local Lead answers (D-01, D-02) | Carried as blockers |
| G1 | Sat 14:00 | Passed under fallback (overlays 2D only, 3D cut) | AreaManifest not written (C-12); no control points (1.5); P-03 GDAL 3.12.3 rerun | Human items |
| G2 | Sat 19:00 | **Met** | Laptop timing not measured (cloud: longest route 309-436 ms at 20:26) | Laptop timing at G5 |
| G3 | Sun 01:00 | **Met except the first public deploy** | Tier 1 e2e green incl. planned margin (G3-01 values); **no deploy (B-4, Vercel access)** | Deploy as soon as a person links Vercel |
| G4 | Sun 10:00 | **Met except the deploy carried from G3** | Tier 2 merged (main 38839d0); AC-07 PASS at M12, AC-08 PASS; no serious axe violations (48/48 Playwright) | Design review of the sky ramp (V-14) |
| G5 | Sun 13:00 | Not started | Two-machine demo from the public deploy; clear the CLAUDE.md register V-01..V-14 (G-08) | Needs the deploy |
| Video | Sun 17:00 | Not started (Design, human) | Video or 7-slide fallback | Unchanged |
| Internal submit | Sun 21:00 | Not started | Every field; links open without login | Unchanged |

## Schedule reconciliation (Sat 14 Nov 2026, 22:48 Asia/Manila; container clock 14:48 UTC; previous 20:27)

Deadline still Sun 15 Nov 23:59 local (portal confirmation by a person still pending). **Remaining: about 25 h 11 min.**

| Gate | Planned | Status now | What is incomplete | Next |
|---|---|---|---|---|
| G3 | Sun 01:00 | **Met** (deploy public Sat ~22:30, before the gate) | - | - |
| G4 | Sun 10:00 | **Met** | V-14 sky-ramp Design review (not a gate criterion) | Design |
| G5 | Sun 13:00 | Not started | Two-machine check **deferred to 5.5 (G5-DEFER)**; register V-01..V-14 (REG-DEFER, another session) | Freeze at 13:00 |
| Video | Sun 17:00 | Not started (Design, human) | Video or 7-slide fallback | Unchanged |
| Internal submit | Sun 21:00 | Not started | 5.5 incl. two-machine check and FortiGuard | Unchanged |

## Handoff checks (Sat 14 Nov 2026, 22:40-22:48, branch claude/optimistic-darwin-dxdct4 = main d5488de)

| Command | Result |
|---|---|
| `npm ci` | 83 packages added |
| `npx vitest run` | 282 passed / 282, 28 files |
| `npx tsc --noEmit` | clean |
| `rm -rf dist && npm run build` | OK; main 208.16 kB gzip (Vite) + worker 41,460 B (`gzip -9`): ~249.6 of 250 KB |
| `PW_CHROMIUM=/opt/pw-browsers/chromium-1243/chrome-linux64/chrome npx playwright test --trace off` | 50 passed / 50 (local build) |
| Same 50 specs, baseURL https://uptown-func.vercel.app (temporary config, deleted) | 50 passed / 50 (live deploy f48697e, Sat ~22:30) |
| `python3.11 -m venv .venv && .venv/bin/pip install -r pipeline/requirements.txt pytest==9.2.0` | OK (fresh container) |
| `(cd pipeline && ../.venv/bin/python -m pytest -rs)` | 82 passed, 2 skipped (gdal_contour not installed in this container) |
| `.venv/bin/python scripts/licences.py \| diff -q - docs/licences.md` | no difference |
| `SHARPWALK_AREA=public/area node --experimental-strip-types bench/route-bench.ts` (twice) | **Longest route 476-585 ms: 5 of the 9 recorded runs over the 500 ms target** (first run: only the placeholder lines were kept); time field 486-593 ms (< 3 s). The 20:26 runs gave 309-436 ms. No engine code changed since then; this container had just restarted (load average 2.27, 4 cores). **Not a pass on this machine; re-measure on a laptop (G2 note "laptop timing at G5").** |

## Status at handoff (Sat 14 Nov 2026, 22:55 Asia/Manila; previous 20:27). Branch claude/optimistic-darwin-dxdct4 = main ea1fb27 (PR #17)

| Part | Status | One-line reason / evidence |
|---|---|---|
| 0.1 | VERIFIED | Portal closing time still to be confirmed by a person |
| 0.2 | VERIFIED | |
| 0.3 | IN PROGRESS | Contracts frozen as drafted, **unagreed** (C-01..C-21 open items) |
| 0.4 | BLOCKED | No Local Lead answers (D-01, D-02) |
| 1.1 | IN PROGRESS | Evidence recorded; Data and Science sign-off pending |
| 1.2 | IN PROGRESS | Full `run_d1` + `run_display` rebuild into an empty directory reproduces all 13 committed `public/area` files byte for byte (Sat 18:3x, RUN-01); GDAL 3.12.3 rerun (P-03) still pending (install refused in this container too); contours use the GDAL 3.8.4 CLI (P-05) |
| 1.3 | BLOCKED | Manifest needs residuals that do not exist yet (C-12) |
| 1.4 | IN PROGRESS | Seam candidates listed; alignment inconclusive; trust-grid method undecided |
| 1.5 | NOT STARTED | 8+ control points with Cesium picks (human) |
| 1.6 | CUT | 3D view cut at G1 under the plan rule (D-10); AREA 2D sheet kept |
| 2.1 | IN PROGRESS | 20 deg slope-limit source **resolved by REG-01 (PR #19, 08ed600)** (EVA-EXP-0042 Rev B, 4.2.1.3, p. 38; SLOPE-01); skyObstructionM12 page still UNRESOLVED |
| 2.2 | VERIFIED (human review pending) | K-01: k_v = 1 placeholder with ASSUMED banner |
| 2.3 | VERIFIED (human review pending) | L-01/L-02 conventions to confirm |
| 2.4 | VERIFIED (G3-01 demo values; team to confirm) | Planned margin shown on default load from the G3-01 preset (est. 32.3 to 67.2 min, OK, for the e2e stop); values chosen by SI at the operator's direction |
| 2.5 | VERIFIED (interim) | Grid path for calculations and display (D-04 interim) |
| 2.6 | IN PROGRESS (code-complete) | Parts 1-5: sheet, route/stops, coverage outlines (7e7c459), Plex fonts (f329682), 10 m contours (0bf81f2), hatch aliasing fix (b40550c); reviews e4cb7f6, 1d85b36, c739bf4. Only Design review (B-13) open |
| 2.7 | VERIFIED (cloud Xeon) | Re-run 20:26: longest route 309-319 ms (unity, used by the app), 364-436 ms (decreasing placeholder); time field 377-418 ms; laptop timing at G5; **22:40-22:48 rerun on a freshly restarted container: 476-585 ms, 5 of 9 recorded runs over 500 ms (no engine change); re-measure on a laptop before claiming the target (HANDOFF known failure 1)** |
| 3.1 | IN PROGRESS | Planner + worker + seven commands (edit_stop added, C-19); C-15 route geometry outside the contract |
| 3.2 | VERIFIED (Design review pending) | Stop name/tasks via edit_stop (C-19 option a, fdc64e7); D6 rover point of view panel (C-22) |
| 3.3 | IN PROGRESS (core done) | Outdoor/phone daylight check needs a real phone |
| 3.4 | IN PROGRESS (core done) | Card prints stop tasks and the three D6 rover views with credits; paper print and fixed-scale map open |
| 3.5 | VERIFIED (deploy public; G5 two-machine check pending) | **Sat 22:34: VERIFIED from this session.** Vercel Authentication turned off by a person (API shows ssoProtection and passwordProtection null). `curl` without credentials: `/` 200 text/html, no login redirect; `area/provenance.json`, `area/slope.uint16.bin`, `conditions/rems.json`, `rover/images.json` all 200; `x-content-type-options: nosniff` present. `npx playwright test` (all 50 specs, temporary config with baseURL https://uptown-func.vercel.app, deleted after) **50/50 passed (57.3 s)** against the live deploy of `main` f48697e. Still for people: the G5 two-machine check and the FortiGuard classification request (plan 19.3). Earlier: **Sat 21:57 production deploy READY** of `main` 1c7201c: Vercel project `uptown-func` (team Kauhla), linked to GitHub `UptownFunc/Uptown-Func`, production branch `main`, domain **https://uptown-func.vercel.app**. Build log: `.vercelignore` applied, `npm ci`, `tsc --noEmit && vite build` OK, same asset hashes as the local build. Project Node set to 22.x (22:10). **Vercel Authentication is still on (all except custom domains): the deploy does not yet open without a login; a person must turn it off.** Not opened in a browser by this session (sandbox cannot reach vercel.app). `vercel.json`, `.vercelignore`, `docs/DEPLOY.md` (DEP-01), PR #13; the deploy itself needs a person with Vercel access (B-4) |
| 3.6 | IN PROGRESS | Conditions built (9ec2f70, 6e8ca00, 9608ecb); AC-09 **3 of 3 dates** (third date run in the Mars24 app by Yujin, Sun 01:43; B-10 closed); scenario time set by G3-01 (2026-11-15 12:00 UTC, assumed) |
| 4.1 | VERIFIED (Design review pending) | Contours, drill, AC-31 done; **sky-obstruction layer built** (20 m grid, plan 6.7; self-check 0.064 pp after R-19; off by default; legend: geometry, not dose + M12 benchmark). **Per-stop "20 m sample" added (Sat 20:41-20:55, 2a65db1 + R-20 fixes 7cf23b2); merged to main by PR #11 as 99eabc7 (Sat 20:57)** |
| 4.2 | VERIFIED at M12 (Data and Science review pending) | AC-07 PASS: f_obs 18.50 % vs 18.5 % published (h_obs 1 m); 0-2 m sweep 20.73-16.51 %, all within ±3 pp; AC-21/AC-22 converged; reference position not computed (R-13) |
| 4.3 | VERIFIED (result recorded; Data and Science review pending) | AC-08 PASS: 83 of 2,537 known path cells excluded (3.27 % ≤ 5 % Assumed), 1 unknown; waypoints sols 4469-5073; `docs/data/ac-08-rover-path.md` |
| 4.4 | VERIFIED (automated) | axe, keyboard and width checks pass: Playwright 50/50 on the local build and 50/50 against the live deploy (Sat 22:30-22:45); manual checks at G5 |
| 4.5 | VERIFIED (integrated build on main 38839d0) | PRs #2-#9 merged after checks and /code-review (R-15..R-19); deploy done since (3.5, PRs #13-#16) |
| 5.1 | PENDING | Freeze Sun 13:00; two-machine check moved to 5.5 (G5-DEFER); Cesium-blocked criterion trivially true (3D cut) |
| 5.2 | IN PROGRESS (register cleared, REG-01, 29830fd; other members' confirmation and the post-freeze regression pending) | **Sat 23:59:** V-01..V-14 each FIXED or KEPT; T_EVA 360, t_ops 60, t_cont 60, stop 45 min cited; 20 deg citation resolved; **merged to `main` as 08ed600 (PR #19)**. **Sun 00:35: REG-02** checked every value, constant and citation against its source: all confirmed except the unread 0.37 pi at M12 and the RAD height (V-12); none changed; three citations corrected (`docs/data/reg-02-verification.md`); **merged to `main` as 4d24d53 (PR #21), Sun 01:51; live site checked** |
| 5.3 | NOT STARTED | Video (Design, Sun 17:00) or the 7-slide fallback |
| 5.5 | PENDING (last phase) | Includes the deferred two-machine check and FortiGuard request (G5-DEFER); internal submit Sun 21:00 |
| 5.4 | IN PROGRESS | README SI use and references current (D5, D6, D12, papers); concept-origin account (B-5) and native-library licences open; D12 licence terms not read |

## Design branch, audit of the "Bureau" redesign (Sun 15 Nov 2026, 11:34 to about 12:50 Asia/Manila; NOT merged)

```text
Part: Design branch audit A1-A6 (MOT-04, B-01, BUILD-01, TER-01, PRINT-02, UX-16, A11Y-02, R-25, E2E-04)
Owner: session from parcilla13's account (member not otherwise stated); model Claude Fable 5.2; Design and Route Engine review pending
Status: VERIFIED on design/sharpwalk-ui-ux only; not merged (team approval of the branch pending)
Scope completed:
  A1 bundle: contributors measured from source maps; Anime.js removed; Motion reduced to motion/mini + AnimatePresence;
     worker built as a second entry sharing one chunk with the page (Zod no longer shipped twice)
  A2 animation: CRT power-on, tour spotlight, meter needle and stamp on Motion (src/app/fx.ts); enter/exit in
     src/app/motion.tsx; a crash found and fixed (Motion committing styles on a hidden toast)
  A3 terrain: terrain_class.uint8.bin requested once (engine worker), handed to the sheet
  A4 print: demonstration card on one A5 page, 6 pt minimum, status word dark on white
  A5 design, UX and accessibility sweep at 1440 x 900 and iPhone 13 (UX-16, A11Y-02)
  A6 /code-review high (R-25: 8 findings, 8 fixed), records, screenshots
Files changed: src/app/{App,AssessPanel,PlanPanel,Screens,Tutorial,fx,motion,styles}.*, src/briefing/BriefingView.tsx,
  src/engine/{client,worker}.ts, src/map/{AreaSheet,loadArea}.*, src/raw.d.ts, vite.config.ts, vercel.json,
  package.json, package-lock.json, e2e/audit.spec.ts (new), scripts/bundle-size.mjs (new), docs/licences.md,
  docs/design/visual-system.md, docs/design/screenshots/*, CLAUDE.md (motion line), README.md, DECISIONS.md,
  HANDOFF.md, SI_LOG.md, PHASES.md
Engine calculations, contracts (src/contracts), constants, pipeline and data: unchanged
Tests first: scripts/bundle-size.mjs failed at 310,521 B; e2e/audit.spec.ts failed on the terrain count (2 requests),
  the card's italic estimate and page count, and all five UX/accessibility tests, before the fixes
Checks run (exact commands, final tree):
  npx vitest run                                   -> 31 files, 303/303 passed
  npx tsc --noEmit                                 -> clean
  rm -rf dist && npm run build                     -> OK; index 198.08 kB, shared 34.98 kB, engine-worker 8.56 kB (Vite gzip)
  node scripts/bundle-size.mjs                     -> 238,750 B of 250,000 B (gzip -9, every .js in dist): within budget
  PW_CHROMIUM=/opt/pw-browsers/chromium-1243/chrome-linux64/chrome npx playwright test --trace off  -> 67/67 passed
     (includes e2e/a11y.spec.ts with axe: no serious or critical violation; e2e/audit.spec.ts 10/10)
  (cd pipeline && ../.venv/bin/python -m pytest)   -> 82 passed, 2 skipped (Python 3.11.18; gdal_contour not installed)
  .venv/bin/python scripts/licences.py > docs/licences.md   -> regenerated (animejs gone); the licence test passes
  vite dev server                                  -> engine ready (the development worker path works)
  print check: demonstration card, two stops -> 1 A5 page (420 x 595 pt), card 642 px of 703 px, smallest text 6 pt
Bundle before / after: 310,521 B -> 238,750 B (gzip -9); 313.6 kB -> 241.6 kB (Vite gzip); AC-12 MET
Terrain download: terrain_class.uint8.bin 2 requests (up to 2 x 2.25 MB) -> 1 request
Known limitations: EL-01 (elevation grid still requested twice, as on main); card not printed on paper; phone not
  checked in daylight; BUILD-01 needs the Route Engine owners' confirmation; G-08 (attribution wording) for the team
Review status: /code-review high, R-25 in DECISIONS.md; human Design review pending
Commit SHA: 9107c42 (audit fixes, tests and records), then a logs commit recording this SHA
Next part / blocker owner: team (Design, Route Engine, Local Lead) reviews the branch; PR #24 (opened from the app
  during the session) was closed unmerged at 12:40
```

Handoff state (12:50 Asia/Manila, checks rerun at 08f20f7: vitest 303/303, tsc exit 0, build OK, bundle 238,750 B,
Playwright 67/67, pytest 82 passed + 2 skipped, licences current):

| State | Work |
|---|---|
| Completed and verified | Audit A1-A6 on `design/sharpwalk-ui-ux` (9107c42): MOT-04, B-01 (AC-12 met), BUILD-01, TER-01, PRINT-02, UX-16, A11Y-02, R-25, E2E-04 |
| In progress | None. Working tree clean |
| Blocked on people | Merge of the design branch (team approval); BUILD-01 (Route Engine owners); G-08 / G-09 (authorship wording); PR #22 (W-01); the team's confirmation of REG-01 |
| Pending, not started | EL-01 (elevation grid requested twice); card printed on paper; phone in daylight; browsers other than Chromium; on `main`: the plan's freeze, video and submission steps (older sections of this file) |

**MERGED (Sun 15 Nov, 13:27 Asia/Manila; MERGE-02): `main` = merge commit `b0896ad`** (parents ca2504a, 52965ae), pushed without
force; remote head verified with `git ls-remote`. Checks at 52965ae on a fresh `npm ci`: vitest 302/302, tsc exit 0, build
OK, bundle 238,771 B of 250,000 B, Playwright 67/67, pytest 82 passed + 2 skipped, licences current; the merge tree is
identical to that tree. Merged after the G5 freeze time on the operator's confirmation. **Live site not verified from the
session** (the container cannot reach `uptown-func.vercel.app`): a person checks it with the commands in HANDOFF.

**Merge preparation (Sun 15 Nov, 12:47-12:55 Asia/Manila; audit session; MERGE-01 note, R-27):** whole-branch `/code-review` (7 findings: 3 fixed,
3 kept and recorded, 1 waits for the merge). Checks on the final tree: `npx vitest run` 31 files, 302/302 (one dead test
removed with `stepIndex`); `npx tsc --noEmit` exit 0; `rm -rf dist && npm run build` OK; `node scripts/bundle-size.mjs`
238,771 B of 250,000 B; `PW_CHROMIUM=... npx playwright test --trace off` 67/67; `(cd pipeline && ../.venv/bin/python -m pytest)`
82 passed, 2 skipped; licences current; `git merge-tree --write-tree origin/main HEAD` clean. **Status: READY, NOT MERGED.**
The merge waits for people (DECISIONS MERGE-01 and its note).
**Merge preparation (Sun 15 Nov, about 12:55; MERGE-01): BLOCKED, not merged.** Checks green, /code-review low R-26 0 findings, pull request opened; waiting for the team's written decision on authorship wording and on adopting the redesign. See HANDOFF.

**Second session's independent check (Sun 15 Nov, 12:42-12:52 Asia/Manila, container clock; fresh `npm ci` at 08f20f7; no code changed):**
vitest 303/303; `npx tsc --noEmit` clean; build OK; `node scripts/bundle-size.mjs` 238,750 B of 250,000 B; Playwright 67/67;
pytest 82 passed + 2 skipped; licences current. Status unchanged: audit A1-A6 VERIFIED, not merged. Open: AUD-13 (the
"13 failing regression tests" of a resume brief are not in the repository), team review of the branch, PR #22 (W-01).

## Design branch, third redesign "Bureau" (Sun 15 Nov 2026, until about 11:30 Asia/Manila; NOT merged, no PR)

```text
Part: Design branch B1-B3 (UI-11..UI-14, MOT-03)
Owner: session from parcilla13's account (member not otherwise stated); Design review pending
Status: VERIFIED on design/sharpwalk-ui-ux only; not merged (B-01, MOT-03 and team approval open)
Scope completed: B1 foundation (tokens, Fraunces/Barlow Semi Condensed/VT323, Motion + Anime.js, terrain-class cursor
  tag, stop card, move mode); B2 all seven screens in the Bureau style, desktop and phone; B3 e2e for the tour and
  point and click, font test, /code-review R-24 (8 fixed, 2 kept), logs, screenshots.
Files changed: src/app/{App,Screens,AssessPanel,PlanPanel,Tutorial,StopPopover,fx,motion,gauge,styles,fonts}.*,
  src/map/{AreaSheet,planLayer,elevationLayer,readout,loadArea,terrainHint}.*, src/briefing/BriefingView.tsx,
  src/field/FieldView.tsx, e2e/{bureau,flow,a11y,fonts}.spec.ts, package*.json, docs/licences.md, docs/design/*,
  CLAUDE.md (visual and motion lines), README.md, DECISIONS.md, HANDOFF.md, SI_LOG.md, PHASES.md
Checks run (exact commands): npx tsc --noEmit; npx vitest run; rm -rf dist && npm run build;
  PW_CHROMIUM=/opt/pw-browsers/chromium-1243/chrome-linux64/chrome npx playwright test --trace off;
  (cd pipeline && ../.venv/bin/python -m pytest); .venv/bin/python scripts/licences.py > docs/licences.md
Results: tsc clean; vitest 303/303 (31 files); build OK; Playwright 57/57; pytest 82 passed, 2 skipped
Known limitations or failures: AC-12 NOT met (main 272.04 kB Vite gzip + worker 41,530 B = about 313.6 kB vs 250 KB, B-01);
  Anime.js conflicts with CLAUDE.md (MOT-03); demo-preset card prints on two A5 pages (PRINT-02)
Review status: /code-review high, R-24 in DECISIONS.md
Commit SHA: the commit after 6380209 on design/sharpwalk-ui-ux (see git log)
Next part / blocker owner: team (Design, Local Lead) for UI-11..UI-14 and MOT-03; bundle owners for B-01
```

## Design branch, second redesign "Frosted terrain" (Sun 15 Nov 2026, 01:58-02:40 Asia/Manila; NOT merged, no PR)

Outside the plan's phase list. Phases D1-D5, each followed by `npx vitest run`, `npx tsc --noEmit`, `npm run build` and a screenshot or e2e check.

| Part | Scope | Checks after the part | Result |
|---|---|---|---|
| D0 | Merge `main` ca2504a (REG-02) into the branch | vitest, tsc | 293/293; clean (46218f4) |
| D1 | Tokens, Geist fonts, Lucide icons, glass shell over the full-bleed terrain | tsc, build, desktop screenshots of all steps | clean; built; issues found and fixed (Welcome chrome, figure wrap, footer contrast) |
| D2 | Welcome, Setup, Planner | same, plus screenshots | OK |
| D3 | Map, HUD, Assess; recalculation pill, click ring, empty and loading states | vitest, tsc, build, full Playwright | 295/295; clean; 51/55: STALE 1.3 s, print 2 pages, coverage point under the panel, sky drawer |
| D3 fixes | Map beside the panel; no re-blurred canvas; drawer closes on a step change | targeted e2e | 15/17, then 10/10 |
| D4 | Decision-focused card (`src/briefing/model.ts` summary tests first: 2 failing, then 8/8); print opens every section; print layout | e2e briefing; PDF rendered | one A5 page (blank scenario); two with the demo preset (PRINT-02) |
| D4 fix | View transitions removed (STALE 1.09-1.18 s) | briefing STALE test x3 | 3/3 pass |
| D5 | Full verification, /code-review R-23 (6 of 8 fixed), screenshots, logs | see below | all pass except AC-12 |

Final checks (after the R-23 fixes):
- `npx vitest run`: 29 files, 296/296 passed.
- `npx tsc --noEmit`: clean.
- `rm -rf dist && npm run build`: OK; main 216.92 kB gzip (Vite), worker 41,530 B (`gzip -9`), about 258.5 kB in all (AC-12: **not met**, B-01).
- `PW_CHROMIUM=/opt/pw-browsers/chromium-1243/chrome-linux64/chrome npx playwright test --trace off`: **55/55 passed**.
- `(cd pipeline && ../.venv/bin/python -m pytest)`: 82 passed, 2 skipped (gdal_contour not installed).
- `.venv/bin/python scripts/licences.py | diff -q - docs/licences.md`: no difference.
- Screenshots: `docs/design/screenshots/` (7 desktop at 1440 x 900, 7 mobile at iPhone 13 width; real app, real data).

## Design branch `design/sharpwalk-ui-ux` (Sun 15 Nov 2026, 00:58-01:55 Asia/Manila; NOT merged, no PR)

A UI/UX redesign done on an isolated branch at the operator's request. It is outside the plan's phase list and changes no phase status on `main`.

```text
Part: UI redesign (UI-01..UI-06, MOT-01; docs/design/visual-system.md)
Owner: session run from parcilla13's account (member identity not otherwise stated, G-05); Design to review
Status: IMPLEMENTED AND CHECKED; NOT VERIFIED FOR MERGE (B-01 bundle overrun; team approval pending)
Base: main 1ad41f6 (latest merged and deployed state; the open PR #21 branch yujin/reg-02-verification was not included)
Scope completed:
  - guided flow Welcome -> Setup -> Planner -> Map -> HUD -> Assess -> Brief;
  - Geologic Folio visual system and new fonts;
  - CSS-only motion and view transitions;
  - briefing confirmation;
  - e2e specs moved to step navigation, plus a new flow.spec.ts.
Files changed: src/app/{App,Screens,AssessPanel,PlanPanel,PlanTimes,DrillPanel,ConditionsPanel,RouteProfile,RoverView,SourcePanel}.tsx,
  src/app/{steps.ts,steps.test.ts,styles.css,fonts.css}, src/briefing/BriefingView.tsx, src/field/FieldView.tsx,
  src/map/{AreaSheet.tsx,planLayer.ts,elevationLayer.ts}, vite.config.ts, package.json, package-lock.json, e2e/*,
  docs/design/visual-system.md, docs/licences.md, CLAUDE.md (visual line), DECISIONS.md, SI_LOG.md, README.md, PHASES.md, HANDOFF.md
Engine, contracts, pipeline, data and constants: unchanged
Checks run (exact commands, at dbfdd6d's tree):
  npx vitest run                                   -> 29 files, 290/290 passed
  npx tsc --noEmit                                 -> clean
  rm -rf dist && npm run build                     -> OK; main 212.60 kB gzip (Vite); worker 41,515 B (gzip -9)
  PW_CHROMIUM=/opt/pw-browsers/chromium-1243/chrome-linux64/chrome npx playwright test --trace off  -> 56/56 passed
  (cd pipeline && ../.venv/bin/python -m pytest)   -> 82 passed, 2 skipped (gdal_contour not installed)
  .venv/bin/python scripts/licences.py | diff -q - docs/licences.md   -> no difference
  /code-review high on main...2b5f515              -> 10 findings, 8 fixed in dbfdd6d, 2 kept (R-22)
Results: all pass except AC-12: about 254.1 kB of app JavaScript against 250 KB (B-01)
Known limitations: B-01 overrun; MOT-01 conflict with the CLAUDE.md Motion rule; contrast pairs to recheck with a tool; paper print not rechecked; phone daylight check not done
Review status: /code-review done; human Design and team review pending
Commit SHA: 2b5f515 (redesign), dbfdd6d (review fixes and records), plus the logs commit
Next: the team reviews the branch (UI-01..UI-06, MOT-01) and decides B-01 before any PR
```

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
| 1.2 | Build the one-time Python pipeline for approved crops, frame conversions and derived grids. Keep raw-source preparation out of the browser. | Data and Science | IN PROGRESS (built and tested; pinned-GDAL rerun and owner review pending) | After /code-review: `pytest` 33/33; the real D1 rebuild reproduces the same three checksums. `pipeline/sharpwalk`: F1->F5->F6 (`geo`), D1 -> F6 warp by averaging on `+proj=ortho` (`warp`), Horn slope, terrain classes and quantisation (`grids`), typed-array grids with sha256 (`outputs`, `build`). `pytest` 29/29. A real D1 run (3 x 3 km, 2 m, 1,500 x 1,500) reproduced identical checksums on two runs. **Open:** GDAL 3.10.3, not 3.12.3 (P-03); the "filled from CTX/HRSC/MOLA" and seam parts of the unknown class are not implemented (no trust grid yet; 1.4); encoding choices P-01/P-02 need agreement; plan section 19 not read. **Sat 14 Nov ~18:35 (RUN-01):** end-to-end rebuild from the USGS sources into an empty scratch directory (`run_d1` then `run_display`, which now runs masks, coverage and contours) reproduced all 13 committed `public/area` files with identical sha256; GDAL also wrote two git-ignored `*.aux.xml` sidecars for the JPEGs. Same stack as before (rasterio 1.4.4 / GDAL 3.10.3, gdal-bin 3.8.4), so P-03 stays open. | see completion record (RUN-01) |
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
| 2.6 | Build the OpenLayers **AREA-level 2D sheet** by G2. It is the permanent fallback and is never cut. | Design + Data and Science | IN PROGRESS (parts 1-5 done; Design review open) | **Part 2 (13:10):** `src/map/planLayer.ts` draws grid-path legs, habitat (H) and lettered stops via cell -> F1 -> F7 (`src/geo/grid.ts`); a click sends `add_stop` to the engine worker; refused clicks are reported. `npx playwright test` 4/4 (2 new: route drawn and listed with italic est. ranges; excluded ground refused). Screenshot `test-results/plan-route.png`. **Still open:** D1/D2 coverage outlines, 10 m contours, fonts (S-02), hatch aliasing. **Part 3 (14 Nov 16:27-16:47):** plan 7.8 coverage outlines (pipeline `run_coverage` -> `coverage.geojson` in F1, measured D1 and D2 100% valid on the window; dotted outline layer; layer list says "partly outside D2 colour coverage" for the current view; missing/invalid file labelled) and IBM Plex Sans/Mono from npm (S-02, S-06), both verified in the browser. **Still open:** 10 m contours (plan 7.8 AREA level), hatch aliasing, Design review (COV-01). **Part 4 (16:50-17:05):** 10 m elevation contours from D1 (gdal_contour 3.8.4 on D1 at 4 m, GeoJSON in F1; every fifth heavier and labelled with a Quantity; legend names source, interval and cell; on the card's layer list); positions verified with the map readout. **Still open:** hatch aliasing; Design review (COV-01, CON-03). **Part 5 (17:11-17:24):** hatch aliasing fixed (HATCH-01): class masks from the pipeline, plan 9.2 symbols drawn in screen pixels and anchored to the ground; static, same under reduced motion; verified at 16, 4, 0.5 m/px, after wheel zoom and drag. **Still open:** Design review (COV-01, CON-03, HATCH-01 look). | 88f8b9a, 19b7c68, 7e7c459, f329682, e4cb7f6, 0bf81f2, 1d85b36, b40550c, c739bf4 |
| 2.7 | Run the complete G2 engine test and latency gate; record all speed inputs as cited or Assumed. | Route Engine | VERIFIED on this machine (Node 22.23.4, cloud Xeon 2.1 GHz, 4 cores) | **13:00 re-run, k_v = 1 (K-01):** longest route 395/354/377 ms (< 500); time field 470/462/426 ms (< 3 s); A* equals the field every run. The decreasing placeholder also passed this run (349-429 ms) but is not used. In the browser worker, one `add_stop` (two A* legs, ~1.95 km each) took 261 ms. Not yet measured on a mid-range laptop. Workload off. **14:48 re-run (k_v = 1):** longest route 393/316/359 ms; time field 438/431/382 ms; A* equals the field each run. | 9e9496c |

**G2 acceptance:** all listed engine tests pass and route is under 500 ms. If missed, move to a 4 m grid and show a visible Assumed-input banner. Do not turn on kJ workload without cited rates.

## Phase 3 - Tier 1 integration (G3)

| Part | Task | Owner | Status | Checks / evidence | Commit |
|---|---|---|---|---|---|
| 3.1 | Integrate command flow, engine worker, `MissionPlan`, version hash and shared contracts. | Route Engine + Captain | IN PROGRESS | `src/engine/planner.ts`: only writer of MissionPlan; applies add/move/delete/reorder/recompute Commands, refuses stale versions and off-screen ground, emits Zod-valid plans with a content version hash; set_assumption refused until plan times/k_v are set. `worker.ts`/`client.ts`: Comlink 4.4.2. `loadGrid.ts`: size-checked typed arrays. 12 planner + 3 loader tests. Works in dev and in the production build. **Open:** plan times (T_EVA, t_ops, t_cont, stop durations) unset so margins unknown; route geometry returned beside the plan (C-15); review findings 7/8/10 deferred. | 9e9496c, 88f8b9a, 19b7c68 |
| 3.2 | Integrate console Planning and Analysis around the AREA sheet, stops, route, profile and provenance. | Design | IN PROGRESS (profile, scrub, ticks, per-stop durations, badges done; provenance panel open) | Console panel beside the AREA sheet: ASSUMED k_v banner (text from src/constants), stops with delete, leg table (length, climb, italic est. time ranges in SI minutes), end margin with OK check / NEAR LIMIT triangle / OVER octagon (word + shape + colour; no SAFE), "estimate under stated assumptions" note, plan-time inputs in minutes. `npx playwright test` 6/6 (margin unknown until all four times are entered; OK then OVER; Set disabled without a rationale; no "SAFE" on the page). Screenshot `test-results/plan-margin.png`. **Open:** elevation/margin profile, provenance panel, stop renaming, responsive check below 800 px. **13:35:** per-stop durations (`set_assumption` with `stopId`, overrides drop with their stop; plan 6.6 sums each stop's own t_stop). Engine geometry adds a whole-walk profile (3D distance, D1 elevation, margin as an est. range per sample) and NEAR_LIMIT/OVER ticks. Map: "margin 10% here" / "margin 0 here" ticks, route past 0 dashed in the over colour, scrub marker. Console: SVG elevation profile with stop letters and ticks, hover synced both ways with the map (UX-06); value-class badges on the leg table (UX-05); ranges read "est. a to b min". **Bug fixed:** the map resized when the status line wrapped on first hover (and when the profile appeared), so a click could land up to 60 m from the cursor; status/profile rows now fixed height, e2e guards it. Checks: vitest 187/187; tsc clean; build OK; playwright 10/10. **Open:** provenance/source panel, stop renaming, AC-05 DOM scan, profile readout numbers not Quantities (C-16). **13:39:** sources panel (`src/app/sources.ts`, `SourcePanel`): selected number's class, method, sources (from provenance.json validated by the Provenance contract, and the constants register) and assumptions with rationales; datasets in view (UX-15); D2 has no provenance record yet (P-04), shown as missing. `QuantityText` puts data-value-class/data-source-ids on every displayed time, margin and duration; e2e AC-05 DOM scan. | 88f8b9a, bf0524b, 4420678, f07094f, 0aaae81, 66c373e, 0acf9e7 |
| 3.3 | Integrate Field View with manual arrival/departure ticks and separate `MissionExecution` state. | Design | IN PROGRESS (core implemented and green; phone/outdoor readability not checked) | **13:43:** `src/field/execution.ts` is the only writer of MissionExecution: ticks in plan order, refuses backwards/non-finite times and other plan versions, never mutates the plan (8 unit tests). Plan 6.6 field margins (continue, return now) as est. ranges, slow bound low / fast bound high; F-01 charges all of t_ops as remaining; C-17 contract cannot hold unknown field margins. Engine geometry adds per-stop slow-bound return time. `FieldView`: next stop, leg heading/length, both margins with word+shape+colour, elapsed-time entry, one burgundy tick key, "From manual entries, last tick at HH:MM UTC (...)", blocks ticking after a plan change until the crew starts over. `npx playwright test` 12/12 (field spec: ticks, margins, refusal, plan unchanged, stale guard). Screenshot `test-results/field-view.png`. **Open:** phone-width/outdoor check (UX-12), field leg length not a Quantity (C-16), elapsed clock helper (manual entry only). | edf9492, 0acf9e7 |
| 3.4 | Produce the briefing card with route, leg ranges, margin, assumptions, sources, limits and the required NASA non-affiliation footer. | Design | IN PROGRESS (core implemented and green; print output not yet checked) | **13:20 (this session):** `src/briefing/model.ts` builds the card only from a MissionPlan copy (5 unit tests): per leg heading, length, climb, italic est. time range; per stop assumed duration, tasks ("none entered"), blanks for arrive/depart; every assumption with value, source and rationale; end margin + state or "unknown". `BriefingView`: "Generate card from current plan" stamps the plan version; on any plan change it shows STALE and "Print briefing" is disabled until regenerated (UX-10/11). Card carries the limits text and the NASA footer. Map exported from the same OpenLayers map (`src/map/snapshot.ts`, fit to plan, view restored; resolves null on error/timeout). Print CSS: A5 portrait, 12 mm margins, two columns, white. `npx playwright test` 8/8 x3 runs (2 briefing specs: version, assumptions, footer, STALE within 1 s of returning to Briefing, print disabled; map image has >50 grey levels). One earlier full run failed the map-image spec once (20.8 s; first run after a change; not reproduced). Screenshot `test-results/briefing-card.png`. **Open:** paper/PDF print check; map at a fixed scale (plan 7.8) rather than fit-to-route; halftone print styling; AC-06 measured from view switch, not from the edit (R-04). | 05cc50e, 0ff9423 |
| 3.6 | **Added this session (not a plan-numbered part):** Tier 1 Must "Conditions" (plan section 4 tier table, 6.10, 19.11 weakness 27): local solar time and sun elevation (D10 Mars24) and the latest dated Curiosity weather reading (D7 REMS). | Design + Data and Science | IN PROGRESS (built, all checks green; AC-09 2 of 3 dates; scenario time not chosen; units/licence items for review) | **15:20-15:36 (session on claude/wizardly-lovelace-i2i0wa, operated from parcilla13's account):** `src/engine/sun.ts` Mars24 steps A-2..D-6, every tabulated step of both GISS worked examples reproduced (example 2: D-1/D-5 table digits not reproducible from the page's own formulas, 0.00065 deg, SUN-02); `src/geo/planetographic.ts` F1 -> planetographic/west for the sun input (SUN-01); Planner `set_assumption` id `scenario_utc` (team choice, rationale, no default, refused before 2017); `PlanOutput.conditions` (L_s, LMST clock label, sun elevation; unknown until set); Conditions panel; D7 snapshot via `pipeline/sharpwalk/run_rems.py` -> `public/conditions/rems.json` (sol 4995, 2026-08-25, retrieved 2026-11-14T07:32:00Z) shown as "Conditions at Curiosity on [date] (sol N), for context"; D7/D10 in the sources panel. Evidence: `docs/data/d10-mars24-source.md`. Checks below. | 9ec2f70, 6e8ca00, 9608ecb |
| 3.5 | Run Tier 1 end-to-end tests and publish the first public deploy. | Captain | IN PROGRESS (config ready, not deployed) | E2E green; planned margin included; deploy opens without login. **Sat 21:40 (claude/optimistic-darwin-dxdct4):** added `vercel.json`, `.vercelignore`, `docs/DEPLOY.md` (DEP-01). Checks: `npm ci && npm run build` OK in the repo; the same in a copy with `.vercelignore` applied, OK; `python3 -m http.server` on that `dist/` plus headless Chromium: 38 responses, 0 with status >= 400, 0 console errors, NASA footer present. **Not deployed; no deploy URL yet (B-4).** /code-review high (R-21): 6 findings, 5 fixed (Node `engines` 22.x, DEP-01 confirmed, SHAs logged, CLI pinned), 1 kept (DEP-02). | d47e01b, 2d6dbc6; **merged by PR #13 as b1f72f8** (Sat 21:56). Deployed Sat 21:57 to https://uptown-func.vercel.app (1c7201c, READY); Vercel Authentication later turned off; 3.5 VERIFIED against https://uptown-func.vercel.app (f48697e): no login, Playwright 50/50 live |

**G3 acceptance:** Tier 1 end-to-end is green, planned margin included, and first public deploy works. If missed, use the plan fallback: move Field View to Tier 3; ship console and card.

## Phase 4 - Tier 2, benchmarks and accessibility (G4)

| Part | Task | Owner | Status | Checks / evidence | Commit |
|---|---|---|---|---|---|
| 4.1 | Complete Tier 2 features that do not threaten Tier 1. Contour display is optional; sky-obstruction grid runs after G1 and stays off the critical path. | Assigned module owners | IN PROGRESS (contours and drill done; sky obstruction not started) | **14:27:** time-to-habitat contour lines (d3-contour 4.0.3 in the worker; slow-bound field on a 4 m display grid by block minimum; lines only, labelled "est. N min"; no lines along the grid border or unreachable ground) and the simulated solar-event drill (plan 6.9: 30 min Assumed default in the constants register, 20/10 min stress cases, hatched SIMULATION banner, labelled drill line, stops outside named; no dose, no shelter wording). e2e `drill.spec.ts`. **Not started:** sky-obstruction grid (pipeline, needs D12) and its AC-07 benchmark. **Sat 20:41-20:55 (claude/clever-thompson-qowa8n):** per-stop sky "20 m sample" (plan 6.7: "a stop reads the nearest grid value, labelled as a 20 m sample"); shown in each stop row only while the sky layer is on; model-derived %, sources D1 D12, assumption V-12; unknown outside the grid, on no-data or when the grid fails (named in the legend). Python oracle 11.6 % at the e2e stop matches the app. vitest 282/282, tsc clean, build ~249.6 of 250 KB, Playwright 50/50, pytest 82 + 2 skipped (no gdal-bin). /code-review R-20: 6 findings, all fixed. | 10ec506, 48e2774, 2a65db1, 7cf23b2 |
| 4.2 | Run AC-07 sky-obstruction benchmark and preserve the interpretation “geometry, not dose.” | Data and Science | VERIFIED at M12 (Sat 19:46; review pending) | **AC-07 PASS at M12: f_obs 18.50 % vs 0.37π/2π = 18.5 %** (h_obs 1 m, Assumed); h_obs 0/1/2 m: 20.73/18.50/16.51 %, all within ±3 pp (Assumed); AC-21 (2°/1°/0.5°) and AC-22 (50/100/150 km) converged within 0.03 pp; horizon set 46 % of azimuths at 10-100 m (the butte), 36 % at 3-50 km. Reference position (about 10 %) NOT computed: sols UNVERIFIED (R-13). Sky-obstruction layer over the area not built. `docs/data/ac-07-sky-m12.md` | see completion record (AC-07) |
| 4.3 | Run AC-08 rover-path consistency checks and document results. | Data and Science + Route Engine | VERIFIED (Sat 19:33; review pending) | **PASS: 83 / 2,537 known path cells excluded = 3.27 % (≤ 5 %, Assumed; after review R-17)**; slope median 8.8°, 83 cells > 20°; 157 D5 drives, sols 4469-5073; D5 frame check 3 mm. Sanity check only (weakness 64). Report `docs/data/ac-08-rover-path.md`; offline reproduction test in `pipeline/tests/test_rover_path.py`. Reproducible results and limitations | - |
| 4.4 | Run accessibility checks, including serious axe violations and keyboard/reduced-motion behaviour. | Design | VERIFIED (automated checks); manual checks due at G5 | @axe-core/playwright 4.14.0: 0 serious/critical violations on Planning, Briefing (with card) and Field View (AC-11). AC-32: place, move and delete a stop by keyboard alone (map cursor: arrows 10 m, Shift 100 m, Enter adds; "Move stop X to the map cursor"; Delete), leg table as the non-map equivalent, console at 1280 and 1920 px without sideways scroll. No animations exist yet, so reduced motion has nothing to reduce. Manual projector/outdoor/slow-network checks are a G5 item. | 6bdb98e, 48e2774 |
| 4.5 | Merge only passing Tier 2 items and produce the integrated G4 build. | Captain | VERIFIED (20:27; deploy pending) | Merged in order: PR #2 1da70b5, #3 a761afd, #4 304d87c, #5 31270cf, #6 234d0cf, #7 40f3aef, #8 706cc1a, #9 38839d0. Integrated build at 38839d0: vitest 274/274, tsc clean, build OK (~249.1 of 250 KB), pytest 84, Playwright 48/48, licences current | 38839d0 |

**G4 acceptance:** Tier 2 merged; AC-07 and AC-08 results recorded; no serious axe violations. If missed, ship Tier 1 plus only Tier 2 items that passed.

## Phase 5 - freeze, validation and submission (G5)

| Part | Task | Owner | Status | Checks / evidence | Commit |
|---|---|---|---|---|---|
| 5.1 | Freeze features. Run the demo from public deploy on two machines and verify the AREA 2D map with Cesium blocked. | Captain + all owners | PENDING (freeze Sun 13:00; two-machine check deferred to 5.5) | **G5-DEFER (Sat 22:48, operator):** the two-machine check of https://uptown-func.vercel.app moves to 5.5. Cesium-blocked criterion trivially true (3D cut, 1.6). Single-machine evidence so far: Playwright 50/50 against the live URL (3.5). | - |
| 5.2 | After freeze, allow bug fixes only. Re-run core tests and validate all displayed quantities, citations, assumptions and warnings. **Clear the CLAUDE.md placeholder register (V-01..V-10): each row FIXED or KEPT by the team (G-08).** | Module owners | IN PROGRESS (register cleared by REG-01, merged as 08ed600; the other members' confirmation and the post-freeze regression pending) | Regression suite; provenance review; no new feature scope. **REG-01 (Sat 23:59):** see the completion record "5.2 register" | 29830fd |
| 5.3 | Lock the <=30-second subtitled video with every on-screen claim sourced and limitation caption present. If not ready by the video gate, switch to the 7-slide format. | Design | UNVERIFIED | Final asset reviewed; SI watermark if applicable; sources captured | - |
| 5.4 | Complete README `SI use`, dependency/dataset/image licences, submission references and SI form data from `SI_LOG.md`. | Captain | IN PROGRESS (draft written; team review and concept-origin text pending) | **14:39:** README.md: summary and limits, dataset-to-number table (19.3), run/check commands, "SI use" reconciled with SI_LOG.md, references with exact versions and licences for every bundled, dev and pipeline package (read from installed metadata), datasets with credit, cited publications, images. **Pending:** the team's concept-origin account in SI_LOG.md, then the submission SI field from the same facts; human review of the disclosure. **14:47:** authorship per G-06 (concept and plan: Patrick Ezekiel A. Arcilla; team credited only for recorded contributions); "SI use" audited against SI_LOG; `docs/licences.md` generated by `scripts/licences.py` (130 lockfile entries: 31 production, 99 development-only including @axe-core/playwright MPL-2.0; 16 pipeline distributions; 31 bundled native libraries marked NOT VERIFIED), cross-checked with `npm ls --omit=dev` (31) and kept current by `pipeline/tests/test_licences.py`. | bdb889e, f38f824 |
| 5.5 | Verify every submission field; public app and repository links open without login; submit the frozen version by the internal target. **Deferred here (G5-DEFER):** (a) open https://uptown-func.vercel.app on two machines (private window; map, footer, a stop with route and margin, Briefing, Field View; DevTools Network all 200); (b) request the FortiGuard web-filter classification for the URL (plan 19.3) and record the result. | Captain | UNVERIFIED | Link checks; two-machine evidence; FortiGuard request and result; submission receipt or confirmation captured | - |

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
Owner: no per-module roles (G-05)
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
Owner: no per-module roles (G-05)
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
Owner: no per-module roles (G-05)
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
Owner: no per-module roles (G-05)
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
Owner: no per-module roles (G-05)
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
Owner: no per-module roles (G-05)
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

```text
Part: AC-31 resilience (4.1/G4), 4.2 assessment, 5.4 README draft, after another "proceed"
Owner: no per-module roles (G-05)
Status: AC-31 done; 4.2 BLOCKED (D5); 5.4 IN PROGRESS (draft)
Files changed: src/map/AreaSheet.tsx, src/app/styles.css, e2e/resilience.spec.ts, README.md, logs
Checks run (exact commands): npx vitest run; npx tsc --noEmit; npm run build;
  PW_CHROMIUM=/opt/pw-browsers/chromium-1243/chrome-linux64/chrome npx playwright test --trace off;
  rasterio metadata read of D1 and D12 (see 4.2); npm ls --omit=dev --all (licences)
Results: vitest 209/209; tsc clean; build OK; playwright 23/23
Commit SHA: a1e9173, bdb889e (+ log commit)
Next part / blocker owner: team (T-01 values, rover image picks, deploy account, concept origin, contract agreement);
  network for D7/D10 (Conditions) and D5 (AC-07, AC-08)
```

```text
Part: review of 10ec506...40ff5a1, G-06 authorship, SI-use audit, licence inventory, schedule reconciliation
Owner: John Malubay (session operator; no per-module roles, G-05)
Status: review fixes VERIFIED; 5.4 IN PROGRESS; schedule rebaselined (above)
Files changed: src/map/{AreaSheet.tsx,snapshot.ts}, src/briefing/BriefingView.tsx, e2e/resilience.spec.ts, README.md, CLAUDE.md,
  docs/licences.md, scripts/licences.py, pipeline/tests/test_licences.py, DECISIONS.md, SI_LOG.md, HANDOFF.md, PHASES.md
Checks run (exact commands): npx vitest run; npx tsc --noEmit; npm run build;
  PW_CHROMIUM=/opt/pw-browsers/chromium-1243/chrome-linux64/chrome npx playwright test --trace off;
  (cd pipeline && ../.venv/bin/python -m pytest -q); npm ls --omit=dev --all --parseable;
  SHARPWALK_AREA=public/area node --experimental-strip-types bench/route-bench.ts
Results: vitest 209/209; tsc clean; build OK; playwright 23/23; pytest 44 passed; npm production packages 31 = lockfile
  non-dev 31 = inventory; bench as in 2.7
Review status: /code-review high on 10ec506...40ff5a1: 6 findings; 6 addressed (c3277b2 code; f38f824 docs and logs)
Commit SHA: c3277b2, f38f824 (+ log commit)
Next part / blocker owner: see the HANDOFF blocker register
```

```text
Part: session handoff (Sat 14 Nov 14:53-14:58), operator John Malubay
Owner: no per-module roles (G-05)
Status: checkpoint; no part newly marked VERIFIED
Scope completed: full check run; e2e cold-cache failure diagnosed and fixed (E2E now runs on the production build via
  vite preview); HANDOFF rewritten (snapshot, status, files, tests, failures, decisions, blockers, next task, commands)
Files changed: playwright.config.ts, HANDOFF.md, PHASES.md, DECISIONS.md, SI_LOG.md
Checks run (exact commands): npm ci; npx vitest run; npx tsc --noEmit; npm run build;
  (cd pipeline && ../.venv/bin/python -m pytest -q);
  PW_CHROMIUM=/opt/pw-browsers/chromium-1243/chrome-linux64/chrome npx playwright test --trace off (before and after the fix;
  cold run after rm -rf node_modules/.vite dist)
Results: vitest 209/209 (16 files); tsc clean; build OK (235 KB gzipped JS); pytest 44 passed; playwright 2 failed / 21 passed
  on the first run after npm ci (reproduced with a cold Vite cache), 23/23 cold and 23/23 warm after cb7e24c
Known limitations or failures: none failing; see HANDOFF "Known failures and limitations"
Review status: the one-line config change was not separately /code-reviewed (diagnosis and fix recorded above)
Commit SHA: cb7e24c (+ handoff log commit)
Next part / blocker owner: B-1 (team) is the smallest human action; code-only: R-02 item 10 / R-04 item 6
```

```text
Part: 3.6 Conditions (Tier 1 Must: D10 Mars24 sun + D7 REMS), added this session
Owner: team (G-05); session operated from parcilla13's account, Sat 14 Nov 2026 15:19-15:40 Asia/Manila
Status: IN PROGRESS (all checks green; not VERIFIED because AC-09 has 2 of its 3 dates and the scenario time is unset)
Scope completed: Mars24 engine module with worked-example tests; F1 -> planetographic conversion in src/geo;
  scenario_utc Assumed input (no default) in MissionPlan.assumptions; engine conditions output; Conditions panel;
  D7 build-time REMS snapshot (pipeline + app); D7/D10 source descriptions; sources-panel crash fix on non-duration
  Quantities; briefing card scenario-time formatting
Files changed: src/engine/{sun,sun.test,planner,planner.test,assumptions}.ts; src/geo/{planetographic,planetographic.test}.ts;
  src/constants/index.ts; src/app/{ConditionsPanel.tsx,conditions.test.ts,rems.ts,rems.test.ts,format.ts,format.test.ts,
  sources.ts,sources.test.ts,QuantityText.tsx,SourcePanel.tsx,App.tsx,styles.css}; src/briefing/{model,model.test}.ts;
  e2e/conditions.spec.ts; pipeline/sharpwalk/{rems,run_rems}.py; pipeline/tests/test_rems.py; public/conditions/rems.json;
  docs/data/d10-mars24-source.md
Checks run (exact commands), at 9608ecb:
  npx vitest run                                  -> 235 passed / 235, 21 files
  npx tsc --noEmit                                -> clean
  npm run build                                   -> OK; main 200.70 kB gzip + worker 40.9 kB = ~241.6 kB (budget 250; B-01)
  (cd pipeline && ../.venv/bin/python -m pytest)  -> 48 passed
  PW_CHROMIUM=/opt/pw-browsers/chromium-1243/chrome-linux64/chrome npx playwright test --trace off -> 26 passed / 26
Results: AC-09 example 1 (2000-01-06) every step within 1e-4; example 2 (Spirit) within 1e-4 to L_s and 0.00065 deg in
  elevation (SUN-02); third date NOT done (needs the Mars24 app). TDD: each new test was seen failing first (one,
  parseUtcInput, was written after the code and then checked against a stub).
Known limitations or failures: terrain shadowing not modelled (shown); one point (area centre); TT-UTC only from 2017;
  REMS units not labelled in the feed (REMS-01); CAB "outreach purposes only" disclaimer (REMS-02); RemsSnapshot schema
  app-local (C-18); Mars24 coefficients cited in sun.ts and the D10 record, not the constants register (SUN-03)
Review status: /code-review high on 091866a..6e8ca00: 7 findings; 4 fixed in 9608ecb, 3 recorded (SUN-03, C-18, SUN-04)
Commit SHA: 9ec2f70, 6e8ca00, 9608ecb (branch claude/wizardly-lovelace-i2i0wa); not merged
Next part / blocker owner: team picks the scenario date/time (B-9); a person runs the Mars24 app for AC-09 date 3
```

```text
Part: Deferred review follow-ups R-02 items 8 and 10, R-04 item 6 (no plan part; supports 2.6/3.2 test quality)
Owner: team (G-05); session operated from parcilla13's account, Sat 14 Nov 2026 15:37-15:45 Asia/Manila
Status: VERIFIED (refactor; behaviour unchanged, checks green)
Scope completed: e2e/helpers.ts (shared STOP, EXCLUDED, pixelAt, clickAt) derived from public/area/build_report.json,
  src/map/view.ts INITIAL_RESOLUTION_F7 (now used by AreaSheet) and src/geo F1 -> F7; six specs de-duplicated;
  new e2e pins helper pixels to the sheet's readout within 1e-4 deg; readoutAt uses src/geo/grid f1ToCell
Files changed: e2e/{helpers.ts,a11y,area-sheet,briefing,drill,field,plan-route,resilience}.spec.ts; src/map/{view.ts,AreaSheet.tsx,readout.ts}
Checks run (exact commands), at b0741fe:
  npx vitest run      -> 235 passed / 235
  npx tsc --noEmit    -> clean
  npm run build       -> OK (main 200.74 kB gzip)
  PW_CHROMIUM=/opt/pw-browsers/chromium-1243/chrome-linux64/chrome npx playwright test --trace off -> 27 passed / 27
Results: probe - with AreaSheet's resolution temporarily set to 8 the old specs still passed (clicks are not position-
  sensitive); the new helper e2e failed (lat off by 1.2e-4 deg) and passed again once restored
Known limitations or failures: R-02 item 7 still deferred (P-01 pending); C-19 found (no command edits stop tasks)
Review status: self-reviewed diff (small refactor); no separate /code-review run on b0741fe
Commit SHA: b0741fe
Next part / blocker owner: team decisions (B-1, B-9, C-19); then 3.5 deploy when B-4 arrives
```

```text
Part: /code-review R-11 of 6e8ca00..8526718 (review fixes, e2e helpers, readout refactor)
Owner: team (G-05); session operated from parcilla13's account, Sat 14 Nov 2026 16:27-16:33 Asia/Manila
Status: VERIFIED
Scope completed: 4 findings - 3 fixed (one grid frame for the readout via gridFrameOf/enuToCell; one transform per
  pointer move; helper pin test on STOP and EXCLUDED with expect.poll), 1 skipped (DECISIONS R-11)
Files changed: src/geo/{grid,grid.test}.ts; src/map/{readout.ts,AreaSheet.tsx}; e2e/area-sheet.spec.ts
Checks run (exact commands), at 2498856: npx vitest run -> 236/236; npx tsc --noEmit -> clean; npm run build -> OK;
  PW_CHROMIUM=/opt/pw-browsers/chromium-1243/chrome-linux64/chrome npx playwright test --trace off -> 27/27
Commit SHA: 2498856
```

```text
Part: 2.6 part 3 - coverage outlines (plan 7.8 "Missing and coarse data") and IBM Plex fonts (plan 9 type, S-02)
Owner: team (G-05; plan owner Design + Data and Science); session operated from parcilla13's account, 16:33-16:47
Status: VERIFIED for this scope (2.6 as a whole stays IN PROGRESS: 10 m contours, hatch aliasing, Design review)
Scope completed:
  Coverage: pipeline/sharpwalk/{coverage,run_coverage}.py polygonise each dataset's valid-data mask on the F7
    display grid and write public/area/coverage.geojson (F1), registered in layers.json with its sha256; run_display
    now writes it too. Measured: D1 and D2 100% valid over the whole window (COV-02). App: src/map/{coverage.ts,
    coverageLayer.ts}, AreaSheet outline layer and per-layer notes for the current view ("partly outside D2 colour
    coverage"), missing/invalid/empty states labelled; not on the briefing card.
  Fonts: @fontsource/ibm-plex-sans 5.3.0 + @fontsource/ibm-plex-mono 5.3.0 (S-06; IBM packages removed for their
    telemetry postinstall); src/app/fonts.css; docs/licences.md regenerated.
Files changed: pipeline/sharpwalk/{coverage.py,run_coverage.py,run_display.py}; pipeline/tests/{test_coverage.py,
  test_area_outputs.py}; public/area/{coverage.geojson,layers.json}; src/map/{coverage.ts,coverage.test.ts,
  coverageLayer.ts,loadArea.ts,AreaSheet.tsx,snapshot.ts}; src/app/{fonts.css,main.tsx,styles.css}; e2e/{coverage,
  fonts}.spec.ts; package.json; package-lock.json; docs/licences.md
Checks run (exact commands), at e4cb7f6:
  npx vitest run                                   -> 245 passed / 245, 21 files (corrected 17:05: was logged as 23, LOG-01)
  npx tsc --noEmit                                 -> clean
  npm run build                                    -> OK; main 203.10 kB gzip + worker 40.9 kB (~244 of 250, B-01)
  (cd pipeline && ../.venv/bin/python -m pytest)   -> 54 passed
  PW_CHROMIUM=/opt/pw-browsers/chromium-1243/chrome-linux64/chrome npx playwright test --trace off -> 35 passed / 35
  (cd pipeline && SSL_CERT_FILE=/root/.ccr/ca-bundle.crt ../.venv/bin/python -m sharpwalk.run_coverage ../public/area)
                                                   -> D1 1.0, D2 1.0 valid, 1 polygon each, 29 s
Browser evidence: e2e reads the coverage layer's own canvas (ink at the west data edge from coverage.geojson, none
  at the sheet middle) and the readout confirms that pixel's longitude within 1e-4 deg; Zoom-in button clears the
  notes; 16 x Shift+ArrowRight brings them back (readout E ~1.6 km); 404, invalid and all-empty files are labelled.
  Fonts: FontFace status "loaded" for Plex Sans 400/600 and Mono 400, all .woff2 responses 200 from this origin,
  body/status line resolve to Plex, text widths differ from generic fallbacks, digits tabular; all font files
  aborted -> fallback, console used by keyboard; .woff2 aborted -> .woff fallback loads Plex.
  TDD: each new test was run red first (pipeline coverage, app coverage module, fonts e2e).
Not re-run: run_display (full D1/D2 rebuild) after it gained the run_coverage call; the call was import-checked only.
Known limitations: coverage symbol is a display choice (COV-01); schema app-local (C-20); fonts fetch ~60 KB of
  unused 600-weight subsets (FONT-01); load view wider than the crop (COV-02)
Review status: /code-review high R-12 on 2498856..f329682: 6 findings, 4 fixed (e4cb7f6), 2 recorded (C-20, S-06)
Commit SHA: 7e7c459, f329682, e4cb7f6 (branch claude/wizardly-lovelace-i2i0wa); not merged
Next part / blocker owner: 2.6 10 m contours (plan 7.8 AREA level; gdal_contour on D1, GeoJSON in F1) is code-only;
  team inputs B-1, B-3, B-4, B-9, B-12 (C-19) unchanged
```

```text
Part: 2.6 part 4 - AREA-sheet 10 m elevation contours (plan 7.8 product table; plan 9 sheet layers)
Owner: team (G-05; plan owner Design + Data and Science); session operated from parcilla13's account, 16:50-17:05
Status: VERIFIED for this scope (2.6 overall IN PROGRESS: hatch aliasing, Design review)
Scope completed: pipeline/sharpwalk/{contours,run_contours}.py (gdal_contour on D1 averaged to 4 m, GeoJSON in F1,
  registered in layers.json; run_display calls it and checks for gdal_contour first); run_coverage helpers shared;
  src/map/{elevationContours,elevationLayer}.ts, loadArea optional-vector loader, AreaSheet layer + legend, card list
Files changed: pipeline/sharpwalk/{contours.py,run_contours.py,run_coverage.py,run_display.py};
  pipeline/tests/{test_contours.py,test_area_outputs.py}; public/area/{contours.geojson,layers.json};
  src/map/{elevationContours.ts,elevationContours.test.ts,elevationLayer.ts,loadArea.ts,AreaSheet.tsx};
  e2e/contours.spec.ts
Checks run (exact commands), at 1d85b36:
  npx vitest run                                   -> 249 passed / 249, 22 files
  npx tsc --noEmit                                 -> clean
  npm run build                                    -> OK; main 203.9 kB gzip + worker 40.9 kB (~244.8 of 250, B-01)
  (cd pipeline && ../.venv/bin/python -m pytest)   -> 60 passed
  PW_CHROMIUM=/opt/pw-browsers/chromium-1243/chrome-linux64/chrome npx playwright test --trace off -> 39 passed / 39
  (cd pipeline && SSL_CERT_FILE=/root/.ccr/ca-bundle.crt ../.venv/bin/python -m sharpwalk.run_contours ../public/area)
     -> 290 lines, 78,232 vertices, levels -3870..-3240 m (64), 1.97 MB, GDAL 3.8.4; rerun byte-identical
  run_coverage rerun after the shared-helper refactor -> coverage.geojson byte-identical
Browser evidence: two -3450 m index-line vertices (line running 3.9 deg and 84 deg from east, slope <= 9.3 deg):
  contour-layer ink at each vertex and none 6 px across the line; the readout at that pixel is the same place and
  reads within 1.0 m of -3450 (bound from pointer error x slope ~0.8 m). Probes: shifting the layer 18 m east or
  north fails the test (the first version of the test missed the east shift; fixed). Card layer list names the
  contours; 404 and invalid files labelled, sheet usable. TDD: pipeline and app tests run red first; block_mean and
  display_grid tests written after the code and checked by mutation.
Not done: full run_display rebuild (not re-run; it now calls run_coverage and run_contours)
Review status: /code-review high R-13: 6 findings, 3 fixed (1d85b36), 3 recorded (P-05, CON-02, C-21)
Commit SHA: 0bf81f2, 1d85b36 (branch claude/wizardly-lovelace-i2i0wa); not merged
Next part / blocker owner: 2.6 hatch aliasing (code); Design review B-13; team inputs B-1, B-3, B-4, B-9, B-12
```

```text
Part: 2.6 part 5 - terrain hatch aliasing ("The hatch patterns alias at coarse zoom", 2.6 part 1 note; plan 7.8, 9.2)
Owner: team (G-05; plan owner Design + Data and Science); session operated from parcilla13's account, 17:11-17:24
Status: VERIFIED for this scope (2.6 overall IN PROGRESS only for Design review)
Interpretation (HATCH-01): a defect fix, not an animation: the plan's symbols are static and fixed in screen pixels.
Scope completed: pipeline display.py (terrain_masks, write_mask_png, classes_f7) and run_terrain_masks.py (three
  grey+alpha masks on a 2 m F7 grid, layers.json terrain entry `kind: "masks"`; terrain_overlay.png removed; local
  files only); run_display uses it. App: src/map/terrainPattern.ts (plan tokens, tiles, ground-anchored phase, mask
  placement), terrainLayer.ts (ImageCanvas, ratio 1.5, no smoothing, clipped to the data extent, failures reported).
  index.html empty inline icon (ICON-01).
Files changed: pipeline/sharpwalk/{display.py,run_display.py,run_terrain_masks.py}; pipeline/tests/{test_display.py,
  test_area_outputs.py}; public/area/{layers.json,terrain_steep.png,terrain_excluded.png,terrain_unknown.png}
  (terrain_overlay.png deleted); src/map/{terrainPattern.ts,terrainPattern.test.ts,terrainLayer.ts,loadArea.ts,
  AreaSheet.tsx}; e2e/hatch.spec.ts; index.html
Checks run (exact commands), at c739bf4:
  npx vitest run                                   -> 255 passed / 255, 23 files
  npx tsc --noEmit                                 -> clean
  npm run build                                    -> OK; main 205.29 kB gzip + worker 40.9 kB (~246.2 of 250, B-01)
  (cd pipeline && ../.venv/bin/python -m pytest)   -> 61 passed
  PW_CHROMIUM=/opt/pw-browsers/chromium-1243/chrome-linux64/chrome npx playwright test --trace off -> 43 passed / 43
  (cd pipeline && ../.venv/bin/python -m sharpwalk.run_terrain_masks ../public/area) -> steep 274,772, excluded
     537,101, unknown 7,514 mask cells
Browser evidence (e2e/hatch.spec.ts): red first on the old overlay (amber on 2 residues, cross-hatch off-diagonal,
  stipple on 4 columns at the load view); green after: every amber, neutral and bone pixel of the terrain canvas on its
  screen lattice at 4 m/px, 16 m/px (two Zoom out clicks), 0.5 m/px (Zoom in clicks), after a wheel zoom and after a
  mouse drag; reduced-motion emulation gives the identical canvas and no animations on the sheet; a stop is still
  placed and the route drawn; a 404 mask is labelled "not loaded", draws no partial hatch, and route, readout,
  contours and coverage still work; no console errors, failed requests or page errors.
Measured: F6 class cells kept in the masks 100.000% (HATCH-03); frame pacing unchanged (HATCH-04).
Not done: run_display end-to-end rebuild (not re-run; it now calls run_terrain_masks, run_coverage, run_contours)
Review status: /code-review high R-14: 6 findings, 4 fixed (c739bf4), 1 no change (measured), 1 recorded (HATCH-02)
Commit SHA: b40550c, c739bf4 (branch claude/wizardly-lovelace-i2i0wa); not merged
Next part / blocker owner: Design review B-13; team inputs B-1, B-3, B-4, B-9, B-12; bundle headroom under 4 KB
```

```text
Part: 1.2 reproducibility check (RUN-01): full pipeline rebuild end to end (HANDOFF "Exact next task" 2)
Owner: the team (G-05); Claude Code session on ccr-dbbcdd02-kqy23v
Status: VERIFIED for this scope (part 1.2 stays IN PROGRESS: P-03 pinned-GDAL rerun open)
Scope completed: first end-to-end run of run_d1 + run_display since run_display gained the masks, coverage and
  contour steps; outputs compared with the committed public/area. No code or data changed.
Files changed: PHASES.md, HANDOFF.md, DECISIONS.md, SI_LOG.md (logs only)
Environment: Python 3.11.18; rasterio 1.4.4 (bundled GDAL 3.10.3); numpy 2.4.6; gdal-bin 3.8.4+dfsg-3ubuntu3 installed
  in this container (apt-get install -y --no-install-recommends gdal-bin)
Checks run (exact commands), Sat 14 Nov 2026 ~18:33-18:36 Asia/Manila, at 82babb6:
  S=<scratchpad>/area; mkdir -p $S (empty)
  cd pipeline && SSL_CERT_FILE=/root/.ccr/ca-bundle.crt ../.venv/bin/python -m sharpwalk.run_d1 $S      -> rc 0, 46 s
  SSL_CERT_FILE=/root/.ccr/ca-bundle.crt ../.venv/bin/python -m sharpwalk.run_display $S                -> rc 0, 95 s
     (290 contour lines, 78,232 vertices, levels -3870..-3240 m, GDAL 3.8.4)
  sha256sum of each file in public/area vs $S                                                     -> 13 / 13 identical
     (build_report.json, contours.geojson, coverage.geojson, d1_hillshade.jpg, d2_luminance.jpg, elevation.uint16.bin,
     layers.json, provenance.json, slope.uint16.bin, terrain_class.uint8.bin, terrain_excluded.png, terrain_steep.png,
     terrain_unknown.png)
  Baseline re-run at 82babb6 on a fresh container (npm ci; new .venv): npx vitest run 255/255 in 23 files;
     npx tsc --noEmit clean; npm run build OK (main 205.29 kB gzip); pytest 59 passed + 2 skipped before gdal-bin was
     installed (the two gdal_contour tests); licence inventory current; Playwright 43/43 (PW_CHROMIUM, --trace off)
Results: PASS. The committed area outputs are reproducible from the sources with the current stack.
Known limitations or failures: GDAL 3.12.3 (plan pin) still not available: downloading micromamba from conda-forge was
  refused by this session's permission classifier (as in P-03), not retried. Extra *.aux.xml sidecars appear next to the
  JPEGs on a rerun; they are git-ignored, but a local `npm run build` after an in-place rerun would copy them into dist/
  (a deploy built from git is unaffected).
Review status: no code changed; nothing to review
Commit SHA: the commit that adds this record (branch ccr-dbbcdd02-kqy23v, fast-forwarded from 82babb6)
Next part / blocker owner: P-03 on a team machine with GDAL 3.12.3 (or the user allows a conda-forge env here);
  human inputs B-1, B-3, B-4, B-9, B-12 for G3
```

```text
Part: merge of the branch work to main (B-8), PR parcilla13/Uptown-Func#2, with /code-review R-15 fixes
Owner: the team (G-05); session operator of ccr-dbbcdd02-kqy23v directed the merge, G-07 and C-AGREE
Status: VERIFIED (checks green at the merge head; review findings fixed or recorded)
Scope completed: G-07 attribution (team credit) and C-AGREE recorded (d3330cb); R-15 review of the whole branch diff
  (10 findings: 6 fixed, 4 recorded in DECISIONS R-15); low review of the fix commit (1 finding, fixed)
Files changed (R-15): src/engine/{margin.ts,margin.test.ts,planner.ts,planner.test.ts}, src/app/{profile.ts (new),
  profile.test.ts (new),RouteProfile.tsx}, src/field/{execution.ts,execution.test.ts,FieldView.tsx},
  src/map/{snapshot.ts,AreaSheet.tsx}
Tests written first and seen failing: 4 engine tests (one-cell leg, stop on habitat/same cell, scenario beyond the date
  range, no tick when OVER from the start), stopProfilePositions (module missing), fieldMarginAssumptionIds (not a function)
Checks run (exact commands), Sat 14 Nov 2026 ~18:53-18:59 Asia/Manila, at the R-15 fix commits (times corrected 19:06 from commit times):
  npx vitest run                                   -> 262 passed / 262, 24 files
  npx tsc --noEmit                                 -> clean
  rm -rf dist && npm run build                     -> OK; main 205.39 kB gzip + worker 40,991 B (~246.4 of 250 KB, B-01)
  (cd pipeline && ../.venv/bin/python -m pytest)   -> 61 passed (gdal-bin 3.8.4 installed, contour oracle runs)
  PW_CHROMIUM=/opt/pw-browsers/chromium-1243/chrome-linux64/chrome npx playwright test --trace off -> 43 passed / 43
Results: all green. main (bb473b7) is an ancestor of the branch: fast-forward, no conflicts.
Known limitations or failures: R-15 items 2, 6, 7, 9 recorded, not fixed; P-03 open; bundle headroom ~3.6 KB
Review status: /code-review medium (whole PR diff) + low (fix commit), all findings fixed or recorded (R-15)
Commit SHA: d3330cb (G-07), 5e4e5d2 + 7eff389 (R-15). **Merged: PR #2 merge commit 1da70b5 (Sat 14 Nov 19:00)**
Next part / blocker owner: G3 inputs (T-01, T-02, C-19, B-3) chosen by the session at the operator's direction; B-4 human
```

```text
Part: G3 inputs chosen by SI at the operator's direction (G3-01): T-01 plan times, T-02 scenario time, C-19 stop
  name/tasks (option a), B-3 rover views (D6, C-22). B-4 deploy stays with a human.
Owner: the team (G-05); operator of ccr-dbbcdd02-kqy23v delegated the choices ("for g3 needed you choose")
Status: VERIFIED for this scope (values and picks are SI choices for the team to confirm)
Scope completed: src/app/demoPreset.ts (start-up set_assumption Commands; ?preset=none skips them); edit_stop in
  CommandType + planner + Plan panel editor; public/rover (3 Navcam frames + manifest), src/app/{rover.ts,RoverView.tsx},
  D6 in the sources panel and on the card; existing e2e specs moved to ?preset=none; new e2e g3-preset, stop-tasks, rover
Tests written first and seen failing: preset unit + planner tests (module missing); contract "seven command types" and
  edit_stop planner test (unknown type). The rover manifest schema and its tests were written together.
Checks run (exact commands), Sat 14 Nov 2026 ~19:01-19:15 Asia/Manila (from commit times):
  npx vitest run                                   -> 271 passed / 271, 27 files
  npx tsc --noEmit                                 -> clean
  rm -rf dist && npm run build                     -> OK; main 206.55 kB gzip + worker 41,176 B (~247.7 of 250 KB, B-01)
  (cd pipeline && ../.venv/bin/python -m pytest)   -> 62 passed (new: rover image checksums)
  PW_CHROMIUM=/opt/pw-browsers/chromium-1243/chrome-linux64/chrome npx playwright test --trace off -> 46 passed / 46
  .venv/bin/python scripts/licences.py | diff -q - docs/licences.md -> no difference (no new dependency)
Results: all green. First run of the rover change failed 3 e2e specs (card caption selectors matched the new
  figcaptions; muted text on the card failed axe colour contrast); fixed, then 46/46.
G3 status: Tier 1 e2e green including planned margin. **First public deploy not done (B-4, Vercel access).**
Known limitations or failures: bundle headroom ~2.3 KB; values and image picks need team confirmation; image-use terms
  to confirm (C-22); AC-09 2 of 3 dates (B-10)
Review status: /code-review medium of PR #3 (R-16): 10 findings; 6 fixed, 2 resolved by the operator (G3-02), 2 recorded
R-16 fix checks (Sat 14 Nov ~19:18-19:22): npx vitest run 274/274 (28 files); npx tsc --noEmit clean; npm run build OK
  (main 206.69 kB gzip + worker 41,242 B, ~247.9 of 250 KB); pytest 62 passed; Playwright 46/46. Tests written first and
  seen failing: add_stop name rule (accepted a blank name), parseTasks (module missing)
Commit SHA: 34ccda0 (G3-01 preset), fdc64e7 (C-19), c72157d (D6), aecf8d5 + 56b261b (R-16). **Merged: PR #3 merge commit a761afd (Sat 14 Nov 19:27)**
Next part / blocker owner: B-4 deploy (human); then G4 items (B-7 rover positions for AC-07/AC-08)
```

```text
Part: 4.3 AC-08 rover-path consistency check
Owner: the team (G-05); Claude Code session on ccr-dbbcdd02-kqy23v
Status: VERIFIED (result recorded; Data and Science review pending)
Scope completed: D5 (MMGIS traverse + waypoints) fetched with sha256; pipeline/sharpwalk/{rover_path.py,run_rover_path.py};
  docs/data/{ac08-rover-path.json,d5-traverse-in-area.geojson,ac-08-rover-path.md}; README D5 reference; CLAUDE.md V-11
Tests written first and seen failing (module missing): pipeline/tests/test_rover_path.py (6 unit tests; one test value
  corrected: 25 deg belongs to the 25-30 bin under lower-inclusive bins) + an offline reproduction test
Checks run (exact commands), Sat 14 Nov 2026 19:30-19:33 Asia/Manila:
  cd pipeline && SSL_CERT_FILE=/root/.ccr/ca-bundle.crt ../.venv/bin/python -m sharpwalk.run_rover_path ../public/area ../docs/data
     -> 2,412 path cells, 76 excluded (3.15 %), 1 unknown; PASS at <= 5 % (Assumed)
  (cd pipeline && ../.venv/bin/python -m pytest)   -> 69 passed
Results: PASS. Sanity check, not validation (plan weakness 64). After /code-review R-17 (exact traversal, known-cell share,
  upper-inclusive bins, geo F1->F5->F6 mapping, grid checksums, MultiLineString): re-run 11:36 UTC -> 83 / 2,537 known
  cells excluded (3.27 %), 1 unknown; same D5 sha256 c22752254772...; pytest 68 passed
Known limitations: D5 localisation error UNVERIFIED (O-17); the line-through-cell rule is a session choice (V-11)
Commit SHA: 33927f6, c058dea (R-17), 1eddcba. **Merged: PR #5 merge commit 31270cf (Sat 14 Nov 19:38)**; PR #4 (register) merge 304d87c
Next part / blocker owner: 4.2 AC-07 (sky-obstruction run; reference-period sols need the papers' full text, R-13)
```

```text
Part: 4.2 AC-07 geometric sky-obstruction benchmark at Butte M12 (with AC-21, AC-22)
Owner: the team (G-05); Claude Code session on ccr-dbbcdd02-kqy23v
Status: VERIFIED at M12 (reference position not computed; Data and Science review pending)
Scope completed: pipeline/sharpwalk/{sky.py,run_sky_benchmark.py}; docs/data/{ac07-sky-m12.json,ac-07-sky-m12.md};
  README D12 and paper references; CLAUDE.md V-12 (h_obs base 1 m), V-13 (D1 to 3 km, 1 m / 100 m steps)
Tests written first and seen failing (module missing): pipeline/tests/test_sky.py (flat sphere 0; curvature drop at
  the horizon; ring wall = sin of its corrected angle; half ring = half; NaN ignored; bilinear; M12 position rule;
  setting range per azimuth)
Checks run (exact commands), Sat 14 Nov 2026 19:43-19:46 Asia/Manila:
  cd pipeline && SSL_CERT_FILE=/root/.ccr/ca-bundle.crt ../.venv/bin/python -m sharpwalk.run_sky_benchmark ../docs/data
     -> f_obs 18.50 % (base), +0.00 pp vs 18.5 %; h_obs 0 m 20.73 %, 2 m 16.51 %; AC-21 18.51/18.50/18.50 %;
        AC-22 18.47/18.50/18.50 %; near field 1.5 km = 3 km; D1 - D12 offset -5.34 m (std 14.31 m, n 841)
  (cd pipeline && ../.venv/bin/python -m pytest)   -> 76 passed
Results: PASS at M12 for every h_obs in the 0-2 m sweep. Benchmark only: geometry, not dose, not validation.
Known limitations: RAD observer height UNVERIFIED (about 2 pp per metre); reference period not computed (R-13); D1 used
  to 3 km only (V-13); paper page numbers not read; the 20 m obstruction layer over the area is not built
Review: /code-review medium R-18 (10 findings, all fixed; re-run unchanged at 18.50 %; 0 of 1,080,000 near samples from D12)
Commit SHA: 903d7ff (AC-07), 8df1f80 (R-18)
Next part / blocker owner: sky-obstruction layer (Tier 2, plan 6.7 budget) if the bundle allows; B-4 deploy (human)
```

```text
Part: 4.1 sky-obstruction layer (plan 6.7 compute budget, Tier 2 "Should")
Owner: the team (G-05); Claude Code session on ccr-dbbcdd02-kqy23v
Status: VERIFIED (Design review pending)
Scope completed: pipeline/sharpwalk/{sky_grid.py,run_sky_grid.py} (called by run_display); public/area/{sky_obstruction.uint16.bin,
  sky_obstruction.png}, layers.json "sky", provenance.json D12 record; app: loadArea sky display data (Quantities),
  AreaSheet sky image layer (off by default) and legend line, DrillPanel toggle, D12 in sources while shown, snapshot
  leaves the layer off the card; e2e/sky.spec.ts
Tests written first and seen failing: pipeline/tests/test_sky_grid.py (module missing); e2e/sky.spec.ts (no toggle)
Checks run (exact commands), Sat 14 Nov 2026 19:59-20:08 Asia/Manila:
  cd pipeline && SSL_CERT_FILE=/root/.ccr/ca-bundle.crt ../.venv/bin/python -m sharpwalk.run_sky_grid ../public/area
     -> 150 x 150 at 20 m (projected 2.6 min at 20 m, so no 40 m fallback); run 173 s; f_obs 6.2-43.5 %;
        self-check vs fixed fine steps at 25 observers: max 0.03 pp; D1 - D12 offset +2.92 m (std 20.5 m)
  (cd pipeline && ../.venv/bin/python -m pytest)   -> 82 passed
  npx vitest run -> 274/274; npx tsc --noEmit -> clean; npm run build -> OK (main 207.26 kB gzip + worker 41,243 B,
     ~248.5 of 250 KB, B-01)
  PW_CHROMIUM=/opt/pw-browsers/chromium-1243/chrome-linux64/chrome npx playwright test --trace off -> 47 passed
     (first run: sky spec failed on "20.0 m" formatting and a missing space in the legend; fixed)
Results: PASS. Geometry, not dose; never labelled safe or shelter.
Review: /code-review medium R-19 (10 findings, all fixed): explicit --cell (no machine-dependent fallback); aggregated
  levels read by nearest block (a crest is never blended down); load failure named and D12 not claimed; toggle without a
  hard-coded number and only offered when the area has the layer; layer below the terrain symbols; layer reset per
  load; run_display keeps the registration unless --sky; 32 m level dropped; published M12 value is the constant
  skyObstructionM12 (page UNRESOLVED). Regenerated 20:22: grid sha256 fc225d1364d6..., self-check max 0.064 pp,
  f_obs 6.2-43.5 %; pytest 84; vitest 274; build ~249.1 of 250 KB; Playwright 48/48
Known limitations: the graphite ramp is hard to see on dark imagery (Design review, V-14); per-stop sky value
  ("20 m sample", plan 6.7) not shown: bundle headroom ~0.9 KB; h_obs 1 m (V-12); D12 licence terms not read
Commit SHA: d8351d4, 48db58d (R-19). **Merged: PR #8 merge commit 706cc1a (Sat 14 Nov 20:24)**
Next part / blocker owner: Design review of the ramp (B-13); B-4 deploy (human)
```

```text
Part: session handoff (ccr-dbbcdd02-kqy23v, Sat 14 Nov 2026 18:29-20:28 Asia/Manila)
Owner: the team (G-05); session operator (account appears to be Christian Jesus Alcazar's; to be confirmed)
Status: VERIFIED (checks re-run on a clean install; no phase part left in progress)
Scope: re-ran every check at 38839d0; updated PHASES, HANDOFF, DECISIONS, SI_LOG
Checks run (exact commands), Sat 14 Nov 2026 20:25-20:27 Asia/Manila, at 38839d0:
  npm ci                                           -> 83 packages, 0 vulnerabilities
  npx vitest run                                   -> 274 passed / 274, 27 files
  npx tsc --noEmit                                 -> clean
  rm -rf dist && npm run build                     -> OK; main 207.64 kB gzip (Vite) + worker 41,460 B (gzip -9) = ~249.1 of 250 KB
  (cd pipeline && ../.venv/bin/python -m pytest)   -> 84 passed
  .venv/bin/python scripts/licences.py | diff -q - docs/licences.md -> no difference
  PW_CHROMIUM=/opt/pw-browsers/chromium-1243/chrome-linux64/chrome npx playwright test --trace off -> 48 passed
  SHARPWALK_AREA=public/area node --experimental-strip-types bench/route-bench.ts -> longest route 309-436 ms (< 500),
     time field 377-418 ms (< 3 s), A* equals the field in every run
Results: all green.
Known limitations: no public deploy (B-4); bundle ~0.9 KB from the 250 KB budget; see HANDOFF "Known failures"
Commit SHA: the handoff commit on ccr-dbbcdd02-kqy23v (not merged; main stays 38839d0)
Next part / blocker owner: B-4 deploy (a person); register review V-01..V-14 (team)
```

```text
Part: 4.1 per-stop sky-obstruction "20 m sample" (plan 6.7)
Owner: no per-module roles (G-05); session operator not stated (claude/clever-thompson-qowa8n)
Status: VERIFIED (Data and Science + Design review pending)
Scope completed: src/map/skySample.ts (decode the committed 20 m grid, refuse a grid not centred on the area origin,
  nearest-observer lookup through src/geo/grid); loadArea loads it in parallel as an Optional with a named reason;
  AreaSheet hands a sampler to the console; PlanPanel shows the value per stop only while the sky layer is on;
  format.ts shows % to 0.1 percentage points. No pipeline or contract change.
Files changed: src/map/{skySample.ts, skySample.test.ts, loadArea.ts, AreaSheet.tsx}, src/app/{App.tsx, PlanPanel.tsx,
  format.ts, format.test.ts}, e2e/sky.spec.ts
Checks run (exact commands): npx vitest run ; npx tsc --noEmit ; rm -rf dist && npm run build ;
  gzip -9 -c dist/assets/worker-*.js | wc -c ;
  PW_CHROMIUM=/opt/pw-browsers/chromium-1243/chrome-linux64/chrome npx playwright test --trace off ;
  (cd pipeline && ../.venv/bin/python -m pytest) ; .venv/bin/python scripts/licences.py | diff -q - docs/licences.md
Results: vitest 282/282 (28 files); tsc clean; build OK, main 208.16 kB gzip + worker 41,460 B = ~249.6 of 250 KB (B-01);
  Playwright 50/50 (two new sky specs); pytest 82 passed, 2 skipped (gdal-bin not installed; pipeline unchanged);
  licences current. Oracle: plain-Python F1 -> F6 puts the e2e STOP 43.0 m E, 7.0 m S of the origin, cell r75 c77,
  raw 1164 -> 11.6 %; the app shows 11.6 %.
Known limitations or failures: h_obs 1 m is the session's choice (V-12); value is geometry, not dose; kept off the
  briefing card (SKY-3); ~0.4 KB of bundle headroom left.
Review status: /code-review high R-20 of 8285658..2a65db1: 6 findings, all fixed in 7cf23b2; low review of 7cf23b2: 0 findings
Commit SHA: 2a65db1, 7cf23b2
Merge: PR #11 merged as 99eabc7 (Sat 14 Nov 20:57, by the SI session at the operator's instruction "proceed. review and merge"; merge tree identical to 9ebd66e)
Next part / blocker owner: B-4 deploy (repository owner)
```

```text
Part: 5.2 register (REG-01): clear CLAUDE.md placeholder register V-01..V-14; 2.1 slope-limit citation
Owner: session operator (member not named); SI session on claude/amazing-hypatia-f808mz (Claude Fable 5.2; Superpowers not installed, not used)
Status: IN PROGRESS (register cleared and checked on the branch; not merged; other members' confirmation pending)
Scope completed: V-01 T_EVA 240 -> 360 min, V-02 t_ops 30 -> 60 min, V-03 t_cont 30 -> 60 min (EVA-EXP-0042 Rev B,
  pp. 29-30); V-04 stop 45 min cited (NASA/TM-2010-216138, Tables 2-3, p. 12); V-05..V-07, V-09..V-14 KEPT with
  reasons; V-08 terms recorded; 20 deg citation resolved (EVA-EXP-0042 Rev B, 4.2.1.3, p. 38); banner "ASSUMED.";
  findings W-01 (2 km/h planning pace) and IMG-01 (wording) left open
Files changed: src/app/{demoPreset.ts,demoPreset.test.ts,App.tsx,PlanPanel.tsx,sources.test.ts},
  src/engine/{assumptions.ts,planner.ts,planner.test.ts}, src/constants/{index.ts,constants.test.ts},
  src/briefing/model.test.ts, e2e/{g3-preset,plan-route}.spec.ts, docs/data/reg-01-register-sources.md,
  CLAUDE.md, DECISIONS.md, README.md
Checks run (exact commands), Sat 14 Nov ~23:25-23:55 Asia/Manila (container clock UTC + 8 h):
  npx vitest run (tests written first)             -> 8 failed / 278 passed before the change; 286 passed / 286, 28 files after
  npx tsc --noEmit                                 -> clean
  rm -rf dist && npm run build                     -> OK; main 208.32 kB gzip + worker 41,515 B (gzip -9): ~249.8 of 250 KB
  PW_CHROMIUM=/opt/pw-browsers/chromium-1243/chrome-linux64/chrome npx playwright test --trace off -> 50 passed / 50
  (cd pipeline && ../.venv/bin/python -m pytest -rs -q) -> 82 passed, 2 skipped (gdal_contour not installed)
  .venv/bin/python scripts/licences.py | diff -q - docs/licences.md -> no difference
Results: demo end margin for the e2e stop est. 92.3 to 127.2 min, OK (was est. 32.3 to 67.2 min)
Known limitations or failures: values picked from the documents by SI, not yet reviewed by the other members;
  k_v = 1 unsupported for 10-20 deg; RAD height (R-13) and M12 pages unresolved; route bench not re-run;
  live deploy not updated (branch not merged)
Review status: /code-review low of main...29830fd: 0 findings
Commit SHA: 29830fd
Merge: PR #19 merged as 08ed600 (Sat 14 Nov ~23:38 Asia/Manila by the container clock, by the SI session at the operator's
  instruction "merge it to main"; GitHub reported mergeable_state clean; head 3039376)
Live deploy after the merge (~23:40): https://uptown-func.vercel.app serves assets/index-D-8LoYh9.js, byte-identical (cmp) to the
  locally tested build; e2e/g3-preset.spec.ts + e2e/plan-route.spec.ts against the live URL (temporary config, deleted): 7 passed / 7.
  The full 50-spec suite was not re-run against the live URL.
Next part / blocker owner: the other members confirm REG-01; W-01 Data and Science; IMG-01 Local Lead
```

```text
Part: 5.2 verification (REG-02): every register value, science constant and citation checked against its source
Owner: Yujin (directed the session and set the scope); SI-assisted (Claude Code, Claude Fable 5.2)
Status: VERIFIED for the check itself; 5.2 stays IN PROGRESS (other members' review; 0.37 pi at M12 not read)
Scope completed: sources downloaded again and compared by sha256; each quotation located on its page; four new
  documents read (NASA/TP-2010-216125, Guo et al. 2021, Loewe et al. 2025, NASA/TM-20205000837) plus JPL's policy
  and the three Curiosity blog posts; sun table, Apollo pooling and demo margin recomputed; three citations
  corrected in src/constants. No value, unit or value class changed.
Files changed: src/constants/index.ts, src/constants/constants.test.ts, docs/data/reg-02-verification.md (new),
  docs/data/reg-01-register-sources.md (pointer), CLAUDE.md, README.md, DECISIONS.md, PHASES.md, HANDOFF.md, SI_LOG.md
Checks run (exact commands), on a team member's Windows computer, Node 24.16.0 (repo pins 22.x):
  npm ci ; npx vitest run ; npx tsc --noEmit ; rm -rf dist && npm run build ;
  gzip -9 -c dist/assets/worker-*.js | wc -c ; npx playwright install chromium ; npx playwright test --trace off
Results: vitest 289/289 (28 files; 3 new tests, first shown failing 3 of 14); tsc clean; build OK, main 208.36 kB gzip
  + worker 41,546 B = ~249.9 of 250 KB (B-01, about 94 bytes left). Before the change the build reproduced
  assets/index-D-8LoYh9.js, the file the live site serves.
  Playwright: 50/50 with `--workers=1`; two default parallel runs on this 4-core computer gave 48/50 and 49/50 with different specs failing each time (briefing.spec.ts:50 and conditions.spec.ts:7, then coverage.spec.ts:94), and the first two pass when run alone (6/6); read as machine load, not proven.
Later check (00:50), pins installed on Python 3.14.4: (cd pipeline && PYTHONUTF8=1 python -m pytest) -> 79 passed, 3 failed,
  2 skipped. The 3 failures are the Windows checkout (one CR added to coverage.geojson and contours.geojson; their git
  copies match the recorded sha256) and the licence check (needs the repo's Linux .venv). D1, D2, D12 headers, the D5
  waypoints file and the rover image checksums were re-read and match (record section 8).
Later (00:57): the member opened Ehresmann et al. 2021 and supplied its text; 0.37 pi is in sec. 2.2 and 4, so
  skyObstructionM12 is resolved and unresolvedCitations() is empty. vitest 289/289; tsc clean; build main 208.35 kB +
  worker 41,530 B = ~249.9 of 250 KB. RAD's height is not stated in the paper (V-12 stays Assumed).
Known limitations or failures (as first written): pytest and scripts/licences.py NOT run (no Python 3.11 pipeline environment on this
  computer; no pipeline or dependency file changed). Ehresmann et al. 2021 full text not read (HTTP 403), so 0.37 pi
  and RAD's height stay unverified. NASA/TP-2010-216115 is not online. Route bench not re-run.
Review status: /code-review low of origin/main...4733a4f plus the log changes: 0 findings
Commit SHA: 4733a4f
Merge: PR #21 merged as 4d24d53 (Sun 15 Nov 01:51 Asia/Manila, by the SI session at the member's instruction "Do it";
  GitHub reported mergeable, state clean; head d898fe3). vitest 289/289 and tsc clean at 13506af; later commits are docs.
Live deploy after the merge (01:52): https://uptown-func.vercel.app serves assets/index-D6_LSyTq.js, byte-identical (cmp)
  to the local build; the full 50-spec Playwright suite against the live URL (temporary config, deleted, --workers=1):
  50 passed / 50.
Next part / blocker owner: the other members review REG-01 and REG-02; a person opens the Ehresmann paper (M12);
  W-01 Data and Science
```

```text
Part: UX-17..UX-21 on yujin/ux-polish: orientation timing, copy and placement; map feedback (after the G5 freeze; not merged)
Owner: Yujin (directed the session and set the scope); SI-assisted (Claude Code, Claude Opus 5.5)
Status: VERIFIED on the branch; NOT merged (G5 freeze: the team decides)
Scope completed: see DECISIONS UX-17..UX-21 and R-28. No engine, contract, constant, dataset, value or design token changed.
Files changed: src/app/Tutorial.tsx, src/app/fx.ts, src/app/motion.tsx, src/app/App.tsx, src/app/styles.css;
  new: src/app/tour.test.ts, e2e/tour-timing.spec.ts; logs: DECISIONS.md, PHASES.md, HANDOFF.md, SI_LOG.md, README.md
Checks run (exact commands), a team member's Windows computer, Node 24.16.0 (repo pins 22.x):
  npm ci ; npx vitest run ; npx tsc --noEmit ; npm run build ; gzip -9 sum of dist/**/*.js ;
  npx playwright test --trace off --workers=1
Results: vitest 311/311 (32 files; tour.test.ts new, 9 tests); tsc clean; build OK; JS 238,947 B gzip of 250,000;
  Playwright 74/74 (67 existing unchanged + 7 new in tour-timing.spec.ts: desktop 1440, laptop 1024 and phone 390 timing,
  reduced motion, keyboard, the Done line, refusal clearing and the cursor tag). The frame-by-frame numbers before and
  after are in DECISIONS UX-17.
Known limitations or failures: scripts/bundle-size.mjs fails on Windows (it builds the path as D:\D:\...); the bundle was
  measured by the same gzip-9 sum by hand. pytest not run (no pipeline file changed). Two phone targets (the conditions
  sheet, the map) are taller than the screen, so the docked card overlaps them; the test allows that only where no free
  place exists.
Review status: /code-review high of the working tree: 10 findings, all fixed (R-28)
Commit SHA: 6fb67ca
Next part / blocker owner: the team decides whether UX-17..UX-21 go into main after the freeze; Design review of the copy
```

```text
Part: MERGE-03 - yujin/ux-polish merged into main; live-site check; session handoff
Owner: Yujin (instruction "Merge to main now, and prepare a handoff. Push."); SI-assisted (Claude Code, Claude Opus 5.5)
Status: VERIFIED
Merge: PR #26 merged as 598cafe (Sun 15 Nov 2026 15:03 Asia/Manila), GitHub mergeable, state clean, head dc5bde3; main was
  943d30e and had not moved. After the G5 freeze: an exception at the member's instruction (DECISIONS MERGE-03).
Checks: local build of 598cafe -> assets/index-5xmFCMnS.js; the live site served it within a minute of the merge;
  cmp of the live index-5xmFCMnS.js and engine-worker.js with the local build: identical; Playwright against
  https://uptown-func.vercel.app (temporary config, deleted, --workers=1): 74 passed / 74.
Known limitations or failures: scripts/licences.py not re-run (Windows); pytest not run (no pipeline file changed).
Next part / blocker owner: the team (HANDOFF section 3): portal deadline, concept account and authorship, video,
  two-machine check and FortiGuard, submission fields, PR #22, submit
```

```text
Part: UX-22, UX-23 on yujin/onboarding-terms: every variable explained in plain words; tour card height (not merged)
Owner: Yujin (set the brief); SI-assisted (Claude Code, Claude Opus 5.5)
Status: VERIFIED on the branch; NOT merged (after the G5 freeze: the team decides)
Files changed: new src/app/glossary.ts, src/app/Term.tsx; src/app/Tutorial.tsx, PlanTimes.tsx, ConditionsPanel.tsx,
  PlanPanel.tsx, AssessPanel.tsx, Screens.tsx, App.tsx, styles.css, src/field/FieldView.tsx, src/engine/margin.ts
  (a named constant only), src/app/tour.test.ts, e2e/tour-timing.spec.ts; logs
Checks run (exact commands), a team member's Windows computer, Node 24.16.0:
  npx vitest run ; npx tsc --noEmit ; npm run build ; gzip -9 sum of dist/**/*.js ; npx playwright test --trace off --workers=1
Results: vitest 316/316 (5 new: glossary rules and numbers from the code); tsc clean; build OK; JS 241,933 B of 250,000;
  Playwright 76/76 (2 new: every variable explains itself; a laptop card stays in the window with its terms open)
Review status: /code-review high of the working tree: 10 findings, all fixed (R-29)
Commit SHA: 534698a
Next part / blocker owner: the team decides whether UX-22/UX-23 go into main; Data and Science check the glossary
```

```text
Part: MERGE-04 - yujin/onboarding-terms merged into main; live-site check
Owner: Yujin (instruction "Merge it"); SI-assisted (Claude Code, Claude Opus 5.5)
Status: VERIFIED
Merge: PR #28 merged as f1fd37f (Sun 15 Nov 2026 15:57 Asia/Manila); main was 13fb96c and had not moved; GitHub clean;
  Vercel preview passed. After the G5 freeze: an exception at the member's instruction (DECISIONS MERGE-04).
Checks: local build of f1fd37f -> assets/index-3s757jEt.js; the live site served it within a minute; cmp of the live
  index-3s757jEt.js and engine-worker.js with the local build: identical; Playwright against https://uptown-func.vercel.app
  (temporary config, deleted, --workers=1): 76 passed / 76.
Next part / blocker owner: the team (HANDOFF 15:10 section 3); Data and Science read src/app/glossary.ts
Part: 2.1 / 5.2 decisions: W-01 slow walking bound 0.64 -> 0.56 m/s; K-01 slope factors kept at 1
Owner: Yujin (delegated the choice: "choose what is best"); chosen and drafted by SI (Claude Code, Claude Fable 5.2)
Status: IN PROGRESS - applied on branch yujin/w-01-slow-bound; NOT merged; the other members must confirm (plan value)
Scope completed: walkSpeedRange.low 0.56 with its citation (EVA-EXP-0042 Rev B, 4.2.1.3.1.1, p. 40); the contour label
  reads the bound from the constant; planner tests follow the constant; CLAUDE.md, README and DECISIONS updated.
Files changed: src/constants/index.ts, src/constants/constants.test.ts, src/engine/planner.test.ts, src/app/DrillPanel.tsx,
  CLAUDE.md, README.md, DECISIONS.md, PHASES.md, HANDOFF.md, SI_LOG.md, docs/data/reg-02-verification.md
Checks run (exact commands), Windows computer, Node 24.16.0 (repo pins 22.x):
  npx vitest run ; npx tsc --noEmit ; rm -rf dist && npm run build ; gzip -9 -c dist/assets/worker-*.js | wc -c ;
  npx playwright test --trace off --workers=1
Results: vitest 290/290 (2 tests written first and shown failing; then 3 planner tests that had 0.64 typed in were
  pointed at the constant); tsc clean; build main 208.39 kB + worker 41,560 B = ~249.95 of 250 KB.
  Playwright: 50/50 with `--workers=1`.
  Demo stop end margin, read from the built app: est. 77.6 to 127.2 min, OK (was est. 92.3 to 127.2 min).
Known limitations or failures: route bench not re-run (the time field uses the slow bound; its cost does not depend on
  the value). pytest not re-run (no pipeline file changed). About 50 bytes of bundle budget left.
Review status: /code-review low of commit 4be709c: 0 findings
Commit SHA: 4be709c
Next part / blocker owner: the other members confirm or reject W-01 and K-01; then merge after PR #21
```

```text
Part: FINAL-2D - final 2D map baseline (MAP-01..MAP-08), tour navigation (TOUR-01), empty states (UX-24, UX-25)
Owner: session operator (cloud session from the claude.ai web app; member not named); SI-assisted (Claude Code, Claude Opus 5.5)
Status: VERIFIED on the branch claude/practical-johnson-hbw41e; NOT merged (team approval required, MERGE-06)
Scope completed: load view frames the whole sheet with the habitat; map keys (zoom, fit route, whole sheet); layer
  switches and strength; map key; renderer-free plan features and layer state for the 3D upgrade; in-sheet loading and
  error states with Try again; tour opens on the current step, follows navigation, Start over, progress jumps, resize;
  empty HUD/assessment lead to the map; profile readout on a laptop. No 3D code. No engine, contract, constant,
  dataset, pipeline or value change.
Files changed: src/map/{AreaSheet.tsx,planLayer.ts,view.ts,layers.ts (new),planGeometry.ts (new),mapFinal.test.ts (new)},
  src/app/{App.tsx,Tutorial.tsx,AssessPanel.tsx,styles.css}, src/field/FieldView.tsx, src/briefing/BriefingView.tsx (one
  caption), e2e/{helpers.ts,map-final.spec.ts (new),audit.spec.ts,bureau.spec.ts,contours.spec.ts}; logs
Checks run (exact commands), cloud container, Node 22.23.4, fresh npm ci:
  npx vitest run ; npx tsc --noEmit ; rm -rf dist && npm run build && node scripts/bundle-size.mjs ;
  PW_CHROMIUM=/opt/pw-browsers/chromium-1243/chrome-linux64/chrome npx playwright test --trace off ;
  (cd pipeline && ../.venv/bin/python -m pytest) ; .venv/bin/python scripts/licences.py | diff -q - docs/licences.md
Results at ab0ff2b: vitest 33 files 327/327 (11 new); tsc clean; build OK; JS 245,635 B of 250,000 (AC-12);
  Playwright 86/86 (10 new); pytest 82 passed, 2 skipped (gdal_contour not installed); licences: no difference.
  Baseline on main c60d37e before the work: vitest 316/316, Playwright 76/76, JS 242,652 B (same script).
  The map-only commit 7f5844f was also checked alone in a worktree: tsc clean, vitest 326/326, and the map, audit,
  bureau, contour and tour specs 33/33.
Known limitations: Design review of MAP-01..MAP-08 and TOUR-01 pending; screenshots inspected at 1440 x 900, 1024 x 768
  and 390 x 844 (Chromium only); paper print not re-checked (the print spec passes); live site not checked from here.
Review status: /code-review high of origin/main...ddbfad0: 7 findings, all fixed in ab0ff2b (R-30)
Commit SHA: 7f5844f (map), ddbfad0 (tour, empty states), ab0ff2b (review fixes), plus the logs commit
Next part / blocker owner: the team approves (or not) PR #30 for main (MERGE-06)
```

```text
Part: MERGE-06 - PR #30 (final 2D map baseline) merged into main; live-site check
Owner: session operator, confirming the team's approval ("Team approved: merge now"); SI-assisted (Claude Code, Claude Opus 5.5)
Status: VERIFIED
Merge: main had moved to be056b7 (PR #31); it was merged into the branch (d30678d; conflicts in App.tsx, HANDOFF, SI_LOG
  resolved), checks rerun, then PR #30 merged as d97ff38 (parents be056b7, d30678d). No squash, no force push.
  git rev-parse origin/main^{tree} == d30678d^{tree} (26d1e2e6).
Checks on main d97ff38 (fresh npm ci, worktree): npx tsc --noEmit clean; npx vitest run 331/331; build OK;
  node scripts/bundle-size.mjs 245,896 B of 250,000; PW_CHROMIUM=... npx playwright test --trace off 86/86;
  (cd pipeline && ../.venv/bin/python -m pytest) 82 passed, 2 skipped.
Live site: assets/index-YVIcYmuh.js and engine-worker.js byte-identical (cmp) to the local build of d97ff38; Playwright
  against https://uptown-func.vercel.app (temporary config, deleted): 86/86.
Next part / blocker owner: 3D upgrade (separate phase) from d97ff38; Design review of MAP-01..MAP-08 and TOUR-01
```

```text
Part: 3D-VIEW - 3D view of the AREA sheet on the 2D baseline (3D-01..3D-08, B-02, E2E-06)
Owner: session operator (cloud session from the claude.ai web app; member not named); SI-assisted (Claude Code, Claude Opus 5.5)
Status: VERIFIED on the branch claude/practical-johnson-hbw41e; NOT merged (team approval required, MERGE-07)
Scope completed: CesiumJS 1.147.0 on demand (no ion); terrain from the engine's D1 grid through src/geo, no exaggeration;
  D2 in its published colour (new pipeline step) with the D1 hillshade; terrain classes and strength; route, habitat and
  stops from the shared plan features; camera keys; readout; 2D/3D switch keeping all state; failure returns to 2D;
  grade along the route in the profile. 2D sheet unchanged as the fallback (one crossOrigin attribute added).
Files changed: src/map3d/{vendor,heights,scene,TerrainView}.ts(x) and tests (new), src/engine/worker.ts (read-only
  heights and sample), src/app/{App.tsx,RouteProfile.tsx,styles.css}, src/map/AreaSheet.tsx, vite.config.ts,
  scripts/{bundle-size.mjs,licences.py}, package.json, package-lock.json, docs/licences.md, playwright.config.ts,
  e2e/map-3d.spec.ts (new), pipeline/sharpwalk/run_colour.py (new), pipeline/tests/test_area_outputs.py,
  public/area/d2_colour.{jpg,json} (new); logs
Checks run (exact commands), cloud container, Node 22.23.4:
  npx vitest run ; npx tsc --noEmit ; rm -rf dist && npm run build && node scripts/bundle-size.mjs ;
  PW_CHROMIUM=/opt/pw-browsers/chromium-1243/chrome-linux64/chrome npx playwright test --trace off ;
  (cd pipeline && ../.venv/bin/python -m pytest) ; .venv/bin/python scripts/licences.py --check
Results: vitest 336/336 (36 files); tsc clean; AC-12 application JavaScript 248,118 B of 250,000 (without 3D);
  3D view chunk 6,756 B of 10,000; CesiumJS vendor 2,112,862 B of 2,120,000, unmodified; Playwright 95/95 (9 new 3D);
  pytest 83 passed, 2 skipped; licences current.
Measurements (local vite preview, software WebGL, 1440 x 900): first load JavaScript unchanged (248,118 B gzip);
  entering 3D fetches the 3D chunk (6,756 B gzip), Cesium.js (6,095,011 B raw, 1,774,242 B gzip; served compressed in
  production), approximateTerrainHeights.json (299,471 B), one IAU2006 table (65,310 B), d2_colour.jpg (2,500,701 B)
  and the hillshade again (1,692,188 B; a 304 revalidation in production); 3D ready 2.8-2.9 s, first terrain complete
  5.5-5.8 s, a close-up refined in 7-8 s; JS heap unchanged at 44.7 MB (textures live on the GPU).
Known limitations: 3D-08 (coverage is the sheet only; D1 vertical reference unverified; AC-15 control points not
  recorded; D2 colour as published, not calibrated); grazing-angle texel stretch near the horizon with the mouse tilt;
  only Chromium with software WebGL tested here; no real GPU, no other browser.
Review status: /code-review high (R-31): 7 findings, all fixed in the review commit; Playwright 95/95 after them. Note: 95/95 = app project 86/86 (full run) + 3D project 9/9 (rerun after a 1 % tolerance fix to the reset test)
Commit SHA: 0112e90 (D2 colour), d8241c0 (vendor and budget), 9de97b6 (3D view), plus the logs commit
Next part / blocker owner: the team approves (or not) the 3D pull request (MERGE-07); Data and Science: 3D-03, 3D-04
```

```text
Part: MERGE-07 - PR #36 (3D view) merged into main; live-site check
Owner: session operator, confirming the team's approval ("Team approved: merge now"); SI-assisted (Claude Code, Claude Opus 5.5)
Status: VERIFIED
Merge: main had moved to 6c147f3 (PRs #34, #35, Markdown only); merged into the branch (1a4b7e6), then PR #36 merged as
  158ece1 (parents 6c147f3, 1a4b7e6). No squash, no force push. origin/main^{tree} == 1a4b7e6^{tree}.
Checks on main 158ece1 (fresh npm ci, worktree): npx tsc --noEmit clean; npx vitest run 336/336; build OK;
  node scripts/bundle-size.mjs: app 248,267 B of 250,000, 3D chunk 6,738 B of 10,000, Cesium 2,112,862 B of 2,120,000
  (unmodified); pytest 83 passed, 2 skipped; Playwright app project 85 passed + 1 timing flake (tour frame timing 44.8 ms
  vs 40 ms; passed 27/27 on --repeat-each=3), 3D project 9/9.
Live site: assets/index-DIhEGVs4.js, engine-worker.js, the 3D chunk, cesium-1.147.0/Cesium.js and area/d2_colour.jpg
  byte-identical to the local build; full suite against https://uptown-func.vercel.app (temporary config, deleted,
  --workers=2): 95/95.
Next part / blocker owner: Data and Science confirm 3D-03 and 3D-04; Design reviews the 3D look; the team's submission
```

```text
Part: 3D-09 - relief lighting in the 3D view (3D-09, 3D-10, PERF-3D-09, E2E-08, R-35)
Owner: session operator (cloud session from the claude.ai web app; member not named); SI-assisted (Claude Code, Claude Opus 5.5)
Status: VERIFIED on the branch ccr-59efed41-jlwyn8 (from main bdd041b); NOT merged (after the G5 freeze: team approval needed)
Scope completed: one Fabric globe material (facet normal from screen-space derivatives; Lambert with the D1 hillshade's
  light, 315 deg / 45 deg, built in F6 through src/geo; black output with alpha, so one factor for R, G and B); tile-skirt
  guard; one relief at a time (the hillshade image is off while lit; pickBase); "Relief lighting" key, off by default,
  kept across 2D/3D; status line wording; phone key spacing. Nothing outside the lazy 3D chunk except 3D-scoped CSS.
Files changed: src/map3d/relief.ts (new), src/map3d/relief.test.ts (new), src/map3d/TerrainView.tsx,
  src/app/styles.css (3D keys only), e2e/map-3d.spec.ts; logs (DECISIONS, PHASES, HANDOFF, SI_LOG, CLAUDE.md V-16, README)
Checks run (exact commands), cloud container, Node v22.23.4, Chromium /opt/pw-browsers/chromium (software WebGL):
  npx tsc --noEmit ; npx vitest run ; npm run build && node scripts/bundle-size.mjs ;
  PW_CHROMIUM=/opt/pw-browsers/chromium npx playwright test --reporter=line ;
  PW_CHROMIUM=/opt/pw-browsers/chromium npx playwright test --project=3d --no-deps ;
  PW_CHROMIUM=/opt/pw-browsers/chromium npx playwright test --project=3d --no-deps -g "relief lighting" --repeat-each=3 ;
  PW_CHROMIUM=/opt/pw-browsers/chromium npx playwright test e2e/tour-timing.spec.ts --project=app --repeat-each=3 (branch, and main bdd041b in a worktree)
Results (after the R-35 fixes): tsc clean; vitest 349/349 (37 files; 13 new); AC-12 app JavaScript 248,265 B of 250,000
  (baseline 248,267); 3D chunk 7,569 B of 10,000 (baseline 6,738); CesiumJS vendor 2,112,862 B of 2,120,000, unmodified;
  Playwright 3D project 10/10 (1 new); the new test 3/3 repeated; app project 85/86 on the full run (before R-32, which
  touches only the lazy 3D chunk), the one failure the tour timing flake (FLAKE-01: 23/27 alone on this branch, 25/27 on main).
Not run: pytest (no pipeline or data change; this container has no pipeline venv, rasterio missing); scripts/licences.py
  (no dependency change).
Render checks (scratch Playwright harness, not committed; frames read from the WebGL canvas): five cameras (home, two and
  five zoom steps, low oblique turned 90 deg, overhead): lit with the Hillshade switch on = lit alone, max difference 0 at
  all five; shade factor never above 1; chroma residual p99 1.2-1.3 levels; tile seam lines found, fixed by the skirt
  guard and checked again; strength 0.5 / 0.4 / 0.3 compared, 0.4 chosen; terrain classes legible when lit; phone layout.
Performance: PERF-3D-09 (+14 to 17 % per frame on software WebGL; idle costs nothing).
Known limitations: 3D-10. Found, not fixed: 3D-BUG-01 (overlays missing after the tilt-to-overhead keys, pre-existing).
Review status: /code-review medium (R-35; R-32 in the commit message): 8 findings; 5 code findings fixed (660a0c4), 2 log findings done here, 1 not
  valid (reason recorded).
Commit SHA: 4b88b1c (lighting), 660a0c4 (review fixes), plus the logs commit
Next part / blocker owner: the team decides whether to merge after the freeze (it is opt-in and off by default); Design
  reviews the look; Data and Science confirm the light and strength (V-16); 3D view owner: 3D-BUG-01; nobody has tested a GPU
```

```text
Part: MERGE-10 - PR #41 (3D-09 relief lighting) merged into main
Owner: session operator ("merge it to main"); SI-assisted (Claude Code, Claude Opus 5.5)
Status: VERIFIED (live site not checked: the container's proxy refuses it, 403)
Merge: main had moved to 49d852d (PRs #38, #40); merged into the branch as dd844a1 (log conflicts: both sides kept;
  E2E-07/R-32 taken by main, V-15/R-33/MERGE-09 by open PR #39, so this work uses E2E-08, R-35, R-36, V-16, MERGE-10).
  /code-review medium on the final diff (R-36): 5 fixed in ce720a8, 3 recorded with reasons. PR #41 merged as 6f06b62
  (parents 49d852d, ce720a8); origin/main^{tree} == ce720a8^{tree}.
Checks on the merged tree (commands as in the 3D-09 record): npx tsc --noEmit clean; npx vitest run 353/353 (38 files);
  node scripts/bundle-size.mjs: app 249,570 B of 250,000 (430 B left), 3D chunk 7,609 B of 10,000, Cesium 2,112,862 B
  of 2,120,000 (unmodified); Playwright full 99/99 (app 89 incl. tour timing, 3D 10) at dd844a1; after the R-36 fixes
  (lazy 3D chunk only; entry and worker byte-identical apart from file names) --project=3d --no-deps 10/10.
GitHub: Vercel preview deployment success; Vercel Preview Comments success; no conflicts.
Next part / blocker owner: a person checks https://uptown-func.vercel.app serves the new build and opens 3D with the
  Relief lighting key; Design reviews the look; Data and Science confirm V-16; 3D view owner: 3D-BUG-01
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

```text
Part: UI-17 + LOGIC-01 - HUD moved after the briefing; planned vs field margin cross-check
Owner: this cloud session's operator (a team member: "lets do A but first check if our logic is correct"); SI-assisted
  (Claude Code, Claude Opus 5.5)
Status: VERIFIED on branch claude/eager-hypatia-3w23ko (not merged; after the G5 freeze, the team decides)
Scope completed: new test src/field/consistency.test.ts (LOGIC-01); step order Setup -> Planner -> Map -> Assess ->
  Brief -> HUD (src/app/steps.ts, App.tsx continue keys, Tutorial.tsx card order); tests updated (steps.test.ts,
  e2e/flow.spec.ts, tour-timing.spec.ts, phone.spec.ts, helpers.ts)
Checks run: npx tsc --noEmit; npx vitest run; PW_CHROMIUM=/opt/pw-browsers/chromium-1243/chrome-linux64/chrome
  npx playwright test --trace off --workers=2; node scripts/bundle-size.mjs; /code-review low on the diff
Results: tsc clean; vitest 318/318 (316 + 2 new); Playwright 76/76; JS 242,650 B gzip of 250,000 (AC-12 within
  budget); review 0 findings. Mutation check: removing the stop time from "continue" fails consistency.test.ts.
Known limitations: the elapsed-time convention question in DECISIONS LOGIC-01 (no code change)
Commit SHA: see git log of claude/eager-hypatia-3w23ko
Next part / blocker owner: the team: approve UI-17, then merge (checks above) and verify the live site
```

```text
Part: UI-17 follow-up - orientation tour checked
Owner: same operator ("did you do the same for the onboarding/tutorial"); SI-assisted (Claude Code, Claude Opus 5.5)
Status: VERIFIED on branch claude/eager-hypatia-3w23ko (not merged)
Scope completed: the tour already had the HUD card last (dcacef2); its text now says "During the walk, after the
  briefing."; stale step-order comment in App.tsx fixed. Welcome screen lists no step order (unchanged).
Checks run: npx tsc --noEmit; npx vitest run; npx playwright test e2e/tour-timing.spec.ts e2e/flow.spec.ts
  e2e/audit.spec.ts --trace off --workers=2; node scripts/bundle-size.mjs; a scripted browser walk of all 8 tour cards
Results: tsc clean; vitest 318/318; Playwright 24/24; JS 242,663 B of 250,000; tour cards 1-8 on #setup, #setup,
  #planner, #map, #map, #assess, #brief, #hud
Next part / blocker owner: the team: approve UI-17 and merge
```

```text
Part: W-02 - slow walking bound re-checked; PR #22 (W-01) merged into claude/eager-hypatia-3w23ko
Owner: this cloud session's operator (a team member: "check what is best and merge"); SI-assisted (Claude Code,
  Claude Opus 5.5)
Status: VERIFIED on the branch
Scope completed: merged origin/yujin/w-01-slow-bound (520e796); conflicts: DrillPanel.tsx (main's redesigned panel
  kept), PHASES.md (both sides kept); the contour label in LayerToggles now reads the slow bound from the constant;
  walkSpeedRange limitation cites NASA/TP-2010-216125 p. 70 and the Apollo 14 uphill caveat; record
  docs/data/w-02-walking-speed.md; DECISIONS W-02; CLAUDE.md W-01 line
Checks run: npx tsc --noEmit; npx vitest run; PW_CHROMIUM=/opt/pw-browsers/chromium-1243/chrome-linux64/chrome npx
  playwright test --trace off --workers=2; node scripts/bundle-size.mjs; /code-review low
Results: tsc clean; vitest 320/320; Playwright 76/76; JS 242,912 B of 250,000; review 0 findings
Known limitations: lunar sources, not Mars-validated; climbs may still be optimistic (k_v = 1)
Next part / blocker owner: merge to main (this operator's instruction); the other two members confirm W-01/W-02
```

```text
Part: MERGE-05 - PR #31 merged into main; PR #22 closed as superseded; live-site check
Owner: this cloud session's operator ("merge to main also resolve any other merges"); SI-assisted (Claude Code,
  Claude Opus 5.5)
Status: VERIFIED
Merge: PR #31 merged as be056b7 (Sun 15 Nov 2026 about 18:00 Asia/Manila); main was c60d37e and had not moved; GitHub
  clean; Vercel status success. PR #22 closed with a comment. PR #30 not merged (incomplete by its own description);
  comment left on #30 about the UI-17 conflicts.
Checks: local build of be056b7 -> assets/index-BahgxpwT.js; the live site served it; cmp of the live index-BahgxpwT.js
  and engine-worker.js with the local build: identical. Playwright against https://uptown-func.vercel.app (temporary
  config, deleted, --workers=1): 75 passed / 1 failed on the first run (tour-timing "a refusal does not outlive the
  next action": the map canvas did not appear within 20 s over the network); that test alone, --repeat-each=3: 3/3
  passed. Recorded as a load-time flake, not a code failure.
Later: PR #30's own session merged main into it and merged it as d97ff38 (MERGE-06). Checked on d97ff38 (about
  18:20): tsc clean; vitest 331/331; JS 245,896 B; live index-YVIcYmuh.js and engine-worker.js identical to a local
  build (cmp); Playwright against the live URL 86/86 (--workers=1, --retries=0). UI-17 order and the 0.56 m/s bound
  survived the MERGE-06 merge.
Next part / blocker owner: the other two members confirm W-01/W-02 and UI-17
```

```text
Part: G-12 - README "Team" section replaces "Authorship and credits"
Owner: this cloud session's operator (a team member, wording and roles given by the member); SI-assisted (Claude
  Code, Claude Opus 5.5)
Status: VERIFIED (docs only)
Scope completed: README.md section replaced (whole-team credit, one role per member, SI sentence kept); DECISIONS
  G-12 (with the member's note on G-08..G-10); no link pointed to the old heading
Checks run: npx tsc --noEmit; npx vitest run (docs-only change; run for completeness); /code-review low
Results: tsc clean; vitest 331/331; review 0 findings; no code changed
Next part / blocker owner: the other three members confirm their roles (G-12)
```

```text
Part: SUB-01 - README top links (live app, SI pointer, References) for the submission
Owner: this cloud session's operator (a team member: "do the readme needed for now"); SI-assisted (Claude Code,
  Claude Opus 5.5)
Status: VERIFIED (docs only)
Scope completed: README.md, three lines under the introduction; DECISIONS SUB-01
Checks run: npm ci; npx tsc --noEmit; npx vitest run (docs-only change; run for completeness); anchors #si-use and
  #references match the headings; curl of https://uptown-func.vercel.app/ -> 200; /code-review low
Results: tsc clean; vitest 331/331 (34 files); live site 200; /code-review low: 1 finding (SI_LOG wording), fixed
Next part / blocker owner: Captain - choose the portal Project link (recommended: the GitHub repository) and check
  both links in a private window; FortiGuard request optional (HANDOFF section 3, task 4)
```

```text
Part: HUD-01, ASSESS-01, B-03 - crew progress on the 2D map from the HUD ticks; looping trace on the Assess ladder;
  bundle-size check on Windows
Owner: Yujin (team member), on his own computer (Personal PC); SI-assisted (Claude Code, Claude Opus 5.5)
Status: VERIFIED (branch yujin/hud-marker-assess-anim; commits 5c82dcc, e37aa6c, merged with main bdd041b)
Scope completed: src/field/progress.ts (+ test), src/map/planLayer.ts (progress layers), src/map/AreaSheet.tsx,
  src/map/snapshot.ts, src/field/FieldView.tsx, src/app/{App.tsx,AssessPanel.tsx,fx.ts,styles.css},
  scripts/bundle-size.mjs, e2e/hud-progress.spec.ts (new), e2e/map-3d.spec.ts (note text); DECISIONS HUD-01, ASSESS-01,
  HUD-02, B-03, E2E-07, R-32, MERGE-08; CLAUDE.md Motion line (five timelines)
Checks run: npm ci; npx tsc --noEmit; npx vitest run; rm -rf dist && npm run build && node scripts/bundle-size.mjs;
  npx playwright test --trace off --workers=1 (full); npx playwright test --project=3d --no-deps; tour-timing spec
  --repeat-each=3 on the branch and on main; /code-review high (R-32)
Results: tsc clean; vitest 340/340 (37 files); AC-12 249,567 B of 250,000 (433 B left; main 248,267 B on the same
  Windows machine), 3D chunk 6,739 B of 10,000, Cesium 2,112,862 B unmodified; Playwright app project 88/89, 3D
  project 9/9; the one failure is tour-timing "desktop" (spotlight 122-138 ms after the words, limit 120 ms), which
  also fails on main on this machine (4 of 9 runs: 120-145 ms, and 42-44 ms on the 40 ms limit): this computer's
  speed, not this change (HANDOFF known flake); the new spec 3/3 (the map mark follows each tick and stays centred on
  the stop after zoom; the trace draws, loops, pauses out of view, stops on another step and under reduced motion);
  screenshots inspected (the first showed the route cutting the label: fixed with a label layer above the route; the
  first trace colour read as the rail fading: changed to ink with an amber tip)
Next part / blocker owner: Design confirms ASSESS-01 (the one deliberate loop) and the HUD-01 look; the team decides
  HUD-02 (minutes in the label)
```

```text
Part: ORIGIN-01 - the team's concept-origin account in SI_LOG.md and the README
Owner: this cloud session's operator (a team member wrote the account); SI-assisted (Claude Code, Claude Opus 5.5;
  wording only)
Status: VERIFIED (docs only)
Scope completed: SI_LOG.md concept-origin section filled from the account; README SI use opens with the account;
  DECISIONS ORIGIN-01 keeps the original text verbatim
Checks run: npx tsc --noEmit; npx vitest run (docs-only change; run for completeness); /code-review low
Results: tsc clean; vitest 340/340 (37 files); /code-review low: 1 finding (this placeholder), fixed; no code changed
Next part / blocker owner: the other three members confirm the account; the team states whether SI was used while
  forming the concept or writing the plan, and the brainstorm date if known
```

```text
Part: UNDO-01, V-15 - Undo for a stop placed by a click on the map; upper limit on typed times
Owner: Yujin (team member), on his own computer (Personal PC); SI-assisted (Claude Code, Claude Opus 5.5)
Status: VERIFIED (branch yujin/stop-undo-time-limits from main 3df441b; commits 4e4b90c, 3b09c32)
Scope completed: src/app/App.tsx (Undo key, Ctrl+Z, pause on hover/focus), src/app/styles.css, src/app/PlanTimes.tsx,
  src/engine/assumptions.ts (TIME_LIMIT_MIN), src/engine/planner.ts, src/field/execution.ts, unit tests in
  src/engine/planner.test.ts and src/field/execution.test.ts, e2e/undo-limits.spec.ts (new); CLAUDE.md register row
  V-15; DECISIONS UNDO-01, V-15, R-33, B-04, MERGE-08 record, MERGE-09
Checks run: npx tsc --noEmit; npx vitest run; rm -rf dist && npm run build && node scripts/bundle-size.mjs;
  npx playwright test --trace off --workers=1 (full); --project=3d --no-deps; the reduced-motion tour spec
  --repeat-each=3; /code-review high (R-33)
Results: tsc clean; vitest 340/340; AC-12 249,880 B of 250,000 (120 B left); Playwright app 90/91, 3D 9/9; the one
  failure is the tour's reduced-motion timing at 40.9 ms on a 40 ms limit (frame timing on this machine; it passed
  3/3 when rerun alone, and main fails the same class here); new spec 2/2 (Undo by double click sends one delete,
  Ctrl+Z, the key clears itself, 1,000,000 min refused in the Planner and the HUD); screenshots inspected
After merging main eca1720 (PRs #40-#42; only log files conflicted, both sides kept): tsc clean; vitest 353/353;
  AC-12 249,904 B (96 B left); Playwright app 90/91 (desktop tour timing 120.4 ms on 120) and 3D 10/10
Next part / blocker owner: the team confirms the 24 h figure (V-15); Design reviews the Undo key (UNDO-01); any new
  app code needs savings first (B-04)
```
