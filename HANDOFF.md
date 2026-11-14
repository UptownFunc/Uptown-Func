# SharpWalk - live session handoff

This file is the handoff between team members and Claude sessions. Keep it factual and current. A new session must read this file before touching code.

## Latest session (Sun 15 Nov 2026, 01:04-01:20 Asia/Manila): W-01 decided on a separate branch

- **Branch:** `yujin/w-01-slow-bound`, on top of `yujin/reg-02-verification` (PR #21). Commit `4be709c` plus a log commit. **Not merged.**
- **What it does:** the slow walking bound goes from 0.64 to 0.56 m/s (DECISIONS W-01). The slope factors stay 1 (K-01 reaffirmed). Yujin delegated both choices to the SI session ("choose what is best").
- **Why it is separate:** PR #21 changes no value. This one changes a value the plan fixes (plan 19.5), so **the other members must confirm it before it is merged.** If they reject it, close this PR; PR #21 does not depend on it.
- **Effect:** demo stop end margin est. 77.6 to 127.2 min, OK (was est. 92.3 to 127.2 min). Time-to-habitat contours move in.
- **Checks:** vitest 290/290; tsc clean; build ~249.95 of 250 KB (about 50 bytes left); Playwright: 50/50 with `--workers=1`.

## Earlier session (Sun 15 Nov 2026, 00:02-00:35 Asia/Manila): REG-02, every value and citation checked

**Read this first; the two older sections below are otherwise still valid.**

- **Branch:** `yujin/reg-02-verification`, commit `4733a4f` plus a log commit. **Not merged.** No PR opened yet.
- **Session:** directed by Yujin, on his own computer (not the cloud container). Model: Claude Fable 5.2. Superpowers not installed, not used.
- **Done:** every register value (V-01..V-14), science constant and README reference was checked against its source (DECISIONS REG-02; evidence `docs/data/reg-02-verification.md`).
  - Every value confirmed in its source (0.37 pi at M12 from 00:57, once the paper was read). RAD's height (V-12) has no source: the paper states none. **No value changed.**
  - Three citations corrected in `src/constants` (speed range wording and pages; drill warning documents; the M12 page), with tests.
  - Two REG-01 statements corrected: the "habitat hatch" reading of the egress/ingress hour, and the place of the TBR tag.
  - Read for the first time: NASA/TP-2010-216125, Guo et al. 2021 full text, Loewe et al. 2025, NASA/TM-20205000837, JPL's Image Use Policy, the three Curiosity blog posts.
- **Checks at `4733a4f`:** vitest 289/289; tsc clean; build ~249.9 of 250 KB (about 94 bytes left). Playwright: 50/50 with `--workers=1`; two default parallel runs on this 4-core computer gave 48/50 and 49/50 with different specs failing each time (briefing.spec.ts:50 and conditions.spec.ts:7, then coverage.spec.ts:94), and the first two pass when run alone (6/6); read as machine load, not proven. **pytest, run later (00:50):** 79 passed, 3 failed, 2 skipped; the three failures are this Windows computer's, not data (one carriage return added to two geojson files at checkout, whose git copies match the recorded sha256; the licence check needs the repo's Linux `.venv`). The licence check itself was not run. Details: section 8 of the record.
- **Open for people:**
  1. ~~0.37 pi at M12~~ **Done (00:57):** Yujin opened the paper and supplied its text. 0.37 pi and the 11 deg average are in sec. 2.2 and 4. The paper states no height for RAD. No constant is UNRESOLVED now.
  1b. **Six leftover items worked through (01:15, record section 10):** REMS degrees C confirmed; RAD height sourced to the 1.1 m deck; D1 agrees with the rover's geoid heights at 116 waypoints; the p. 8 station durations confirmed (Figure 4, not Table 1); sun angles within 0.1 deg of JPL Horizons at the scenario times. **AC-09 is now 3 of 3 (01:45):** Yujin ran the Mars24 app; 43.5 deg at 09:28 LMST, the same as SharpWalk (B-10 closed). NASA/TP-2010-216115 is not online and stays unread; the speed window keeps its secondary citation.
  2. **W-01:** two sources now give 0.56 m/s, below the app's slow bound of 0.64 m/s. Data and Science to decide.
  3. The other members review REG-01 and REG-02.
  4. A PR for this branch (`/code-review` low of the diff: 0 findings), then the CLAUDE.md step 6 checklist before any merge.
- **Next:** review and merge this branch before the G5 freeze at Sun 13:00; check the live site after the merge.

## Earlier session (Sat 14 Nov 2026, 23:07-23:59 Asia/Manila): register cleared, REG-01

**Read this first; the older snapshot below is from 22:50 and is otherwise still valid.**

- **Branch:** `claude/amazing-hypatia-f808mz`, commits `29830fd` and `3039376`. **Merged to `main` as `08ed600` through PR #19** at the operator's instruction ("merge it to main"), after the CLAUDE.md step 6 checklist (recorded on the PR). **Live site checked (~23:40):** https://uptown-func.vercel.app serves `assets/index-D-8LoYh9.js`, byte-identical to the build tested here; `e2e/g3-preset.spec.ts` and `e2e/plan-route.spec.ts` pass 7/7 against the live URL (T_EVA shows 360.0 min).
- **Session:** operator not stated. Model: Claude Fable 5.2 (the session's configured model; CLAUDE.md names Opus 5.5 as primary). Superpowers not installed, not used.
- **Done:** register V-01..V-14 cleared (DECISIONS REG-01; evidence `docs/data/reg-01-register-sources.md`).
  - FIXED: T_EVA 360 min, t_ops 60 min, t_cont 60 min (EVA-EXP-0042 Rev B, pp. 29-30); stop 45 min (NASA/TM-2010-216138, Tables 2-3, p. 12); V-08 image terms.
  - KEPT with reasons: scenario time, k_v = 1, habitat, display and method rows.
  - 20 deg slope-limit citation resolved (EVA-EXP-0042 Rev B, 4.2.1.3, p. 38).
- **Checks at 29830fd:** vitest 286/286; tsc clean; build ~249.8 of 250 KB (about 165 bytes left); Playwright 50/50; pytest 82 + 2 skipped; licences current; /code-review low 0 findings. Route bench not re-run.
- **Open for people:**
  1. The other members confirm REG-01 (the values were picked by SI at one member's direction).
  2. **W-01:** the same NASA document plans walking at about 2 km/h (0.56 m/s), below the app's slow bound of 0.64 m/s. Data and Science to decide.
  3. **IMG-01:** confirm the citation wording with the Local Lead (never "according to NASA").
  4. k_v = 1 is unsupported for 10-20 deg; R-13 (RAD height) and the M12 page numbers stay unresolved.
- **Environment:** the session moved to the "Uptown-Func" cloud environment and added `ntrs.nasa.gov` and `www.nasa.gov` to its allowed hosts (operator approved).
- **Next:** the other members confirm REG-01; decide W-01; then the G5 freeze at Sun 13:00.

## Current snapshot

- **Last updated:** Sat 14 Nov 2026, 22:50 Asia/Manila (UTC+8). Container clock read in UTC (14:50) plus 8 h, because `TZ=Asia/Manila` is not honoured in this container.
- **Session:** cloud session on branch **`claude/optimistic-darwin-dxdct4`**, Sat ~21:30-22:50.
  - Operator not stated; the account email does not name a team member, so no owner is assumed (G-05).
  - Model: Claude Code with Claude Opus 5.5. Fable 5.2 not used. **Superpowers is not installed in this container and was not used.**
- **Deadline:** Sun 15 Nov 2026, 23:59 local (plan 19.3). **A person must still confirm it on the portal.** About 25 h 9 min remained at 22:50.
- **Current phase:** G3 and G4 are **met**. The public deploy (3.5) was VERIFIED at ~22:30. Next gate: **G5 freeze, Sun 13:00**.
- **`main`:** was `d5488de` (PR #16) when the handoff was written. The handoff commit was first left unmerged, as the handoff request said; the operator then asked to merge it, and it went to `main` through **PR #17** (merge SHA: run `git log --merges -1 origin/main`).
- **Working tree:** clean after the handoff commit. No stashes. Only git-ignored items remain: `node_modules/`, `.venv/` (created this session), `dist/`, `test-results/`, `__pycache__/`.
- **Open PRs:** none (GitHub API, 22:45).
- **Live app:** **https://uptown-func.vercel.app**. Vercel team Kauhla, project `uptown-func`.
  - Git-linked to `UptownFunc/Uptown-Func`; every merge to `main` deploys to production in about a minute. Each PR gets a preview URL.
  - Vercel Authentication is off (turned off by a person), so the site opens without a login.
- **Cloud environment "Uptown-Func"** (this session moved onto it from Default):
  - holds a **Vercel API token** as a network secret for `api.vercel.com`;
  - allows `uptown-func.vercel.app`, plus the earlier NASA/USGS hosts.
  - Revoke the token in Vercel (Account Settings > Tokens) once it is no longer needed.

Do not interpret blank fields as proof that no work exists. Inspect GitHub and the working tree.

## Authorship (read before editing attribution)

- **`CLAUDE.md` on `main` (G-07):** the concept, framing, solution direction, requirements and plan are credited to the **whole four-member team**.
- **Conflict, again:** this handoff request (Sat ~22:45) asked to "preserve the user's sole authorship of the concept and plan", as the 17:27 and 20:25 requests did. The request does not say which user, and it conflicts with G-07.
  - **This session changed no attribution.** It recorded the conflict as **G-07 note 2** in `DECISIONS.md`.
- **The team (Patrick, Christian, Yujin, John) must settle G-07 in writing** before submission.
- **SI is never credited with the concept or plan.** SI assistance is recorded in `SI_LOG.md`.

## Team and module ownership

Team: Patrick Ezekiel A. Arcilla (parcilla13), Christian Jesus Alcazar, Eugene Ibañez Jr. ("Yujin"), John Malubay.
**No per-module roles (G-05).** Each session takes the earliest incomplete phase parts in order, on its own branch. Contract changes need the team's recorded agreement (CLAUDE.md step 6).

## Phase status (details and evidence in PHASES.md)

| State | Parts |
|---|---|
| VERIFIED | 0.1, 0.2; 2.2, 2.3, 2.4 (G3-01 demo values), 2.5 (interim rule), 2.7 (cloud); 3.2; **3.5 (public deploy, this session)**; 4.1, 4.2 (AC-07 at M12), 4.3 (AC-08), 4.4 (automated), 4.5 |
| IN PROGRESS | 0.3 (contracts agreed as drafted; C-12/C-16/C-17 open); 1.1, 1.2 (P-03), 1.4; 2.1 (20° source UNRESOLVED); 2.6 (Design review); 3.1; 3.3 (phone check); 3.4 (paper print); 3.6 (AC-09 2 of 3); 5.4 (README; concept account B-5) |
| BLOCKED | 0.4 (Local Lead); 1.3 (C-12, needs 1.5) |
| PENDING | 5.1 freeze at Sun 13:00 (two-machine check moved to 5.5); 5.2 (register V-01..V-14: another session, REG-DEFER); 5.3 video; **5.5 incl. the deferred two-machine check and FortiGuard request (G5-DEFER)** |
| NOT STARTED | 1.5 (control points, human) |
| CUT | 1.6 (3D view, D-10) |

## Work done this session (Sat ~21:30-22:50)

| PR | Merge | Content |
|---|---|---|
| #13 | b1f72f8 | Deploy config, DEP-01: `vercel.json` (single static Vite project; not Vercel Services), `.vercelignore`, `package.json` `engines.node` 22.x, `docs/DEPLOY.md`. /code-review high R-21: 5 fixed, 1 kept (DEP-02, public source maps) |
| #14 | 1c7201c | Merge record for #13 |
| #15 | f48697e | First deploy record |
| #16 | d5488de | 3.5 VERIFIED: live deploy opens without login; Playwright 50/50 against it |
| #17 | `git log --merges -1` | This session handoff (logs only), merged at the operator's later instruction |

Earlier sessions' PRs #2-#12 and their merges are listed in `PHASES.md` and `git log --merges`.

**Outside git:**
- **Vercel project:** a person imported the project and turned off Vercel Authentication. This session set the project's Node version to 22.x through the API.
- **Cloud environment:** this session added the Vercel token and the `uptown-func.vercel.app` host to the Uptown-Func environment, with the operator's approval in the prompts.

## Files changed this session (`git diff 030534c..HEAD`)

- **Added:** `vercel.json`, `.vercelignore`, `docs/DEPLOY.md`.
- **Modified:**
  - `package.json` and `package-lock.json` (root `engines` only);
  - `DECISIONS.md`: DEP-01, DEP-02, R-21, G5-DEFER, REG-DEFER, G-07 note 2;
  - `PHASES.md`, `HANDOFF.md`, `SI_LOG.md`.
- **No app, engine, contract, pipeline or data file changed.**

## Tests run at handoff (Sat 14 Nov 22:40-22:48, fresh container, at d5488de)

| Command | Result |
|---|---|
| `npm ci` | 83 packages |
| `npx vitest run` | **282 passed / 282**, 28 files |
| `npx tsc --noEmit` | clean |
| `rm -rf dist && npm run build` | OK; main 208.16 kB gzip + worker 41,460 B (`gzip -9`): **~249.6 of 250 KB** |
| `PW_CHROMIUM=/opt/pw-browsers/chromium-1243/chrome-linux64/chrome npx playwright test --trace off` | **50 passed / 50** (local production build) |
| Same 50 specs against https://uptown-func.vercel.app (temporary config, deleted; Sat ~22:30) | **50 passed / 50** (live deploy of f48697e) |
| `(cd pipeline && ../.venv/bin/python -m pytest -rs)` | **82 passed, 2 skipped** (`gdal_contour` not installed in this container) |
| `.venv/bin/python scripts/licences.py \| diff -q - docs/licences.md` | no difference |
| `SHARPWALK_AREA=public/area node --experimental-strip-types bench/route-bench.ts` (twice) | **Longest route 476-585 ms; 5 of the 9 recorded runs over the 500 ms target.** Time field 486-593 ms (< 3 s). See known failure 1. |

## Known failures and limitations

1. **Route latency on this container exceeds 500 ms in some runs** (476-585 ms; 309-436 ms at 20:26).
   - No engine code changed in between. This container had just restarted (load average 2.27, 4 cores), so machine variance is the likely cause, but that is **not proven**.
   - Re-measure on a team laptop at G5 (G2 note "laptop timing at G5"). Do not record G2 latency as passing on this machine.
2. **G5 two-machine check not done:** deferred to 5.5 by the operator (G5-DEFER). The same goes for the FortiGuard classification request (plan 19.3).
3. **Register V-01..V-14 still OPEN:** deferred to another session (REG-DEFER). G-08's target is still the G5 freeze unless the team changes it.
4. **JS bundle is full:** ~0.4 KB left of the 250 KB budget (B-01). Any new app code needs savings first.
5. **GDAL:** outputs built with rasterio's GDAL 3.10.3 and the GDAL CLI 3.8.4, not the pinned 3.12.3 (P-03, P-05). The rebuild reproduces the committed outputs exactly.
6. **AC-07 reference position not computed:**
   - its sols are UNVERIFIED (R-13), as is the RAD observer height;
   - constants `skyObstructionM12` and `slopeLimit` have UNRESOLVED pages.
7. **Sky layer ramp (V-14) is hard to see** on dark imagery: needs Design review.
8. **SI-chosen demo values load by default** (G3-01/G3-02). They are labelled and editable; `?preset=none` skips them.
9. **E2E in this cloud container needs `PW_CHROMIUM`** (S-03).
10. **Public source maps:** `.map` files (~3.8 MB) are served (DEP-02, kept).
11. **Open review items:** R-15 #2, #6, #7, #9; R-16 #3, #4; earlier deferred items in DECISIONS.
12. **Licences not verified:** the 31 native libraries in the pipeline wheels, and the D12 licence terms.

## Decisions awaiting human approval

| Who | Items |
|---|---|
| **Whole team** | **G-07 authorship** (team credit vs the "sole authorship" wording in three handoff requests); **register V-01..V-14** (REG-DEFER: another session; G-08 target Sun 13:00); G3-01/G3-02; C-19; C-22 (image picks and image-use terms); C-12, C-16, C-17; H-01; K-01/K-02; L-01/L-02; F-01; D-04 |
| Repository owner / Captain | B-5 concept-formation account; **portal deadline confirmation**; 5.5 two-machine check and FortiGuard request (G5-DEFER); revoke the Vercel token when done |
| Data and Science | P-01/P-02, P-03/P-05; D-05; 1.1 sign-off; 1.4 trust grid; 20° slope-limit source; SUN-01..03; REMS-01/02; AC-07/AC-08 review; V-11..V-13 |
| Design (B-13) | V-14 sky ramp; COV-01, CON-03, HATCH-01, S-06; 2.6 review; video (5.3) |
| Local Lead (via the team) | D-01 pre-event wireframes; D-02 GSAP / Cesium Mars |
| ~~Any member with Java~~ | ~~AC-09 third date with the Mars24 app (B-10)~~ **Done Sun 01:45** |

## External blocker register (Sat 14 Nov 2026, 22:50)

| # | Blocker | Owner | Needed by |
|---|---|---|---|
| ~~B-4~~ | ~~Vercel deploy~~ **Done** (3.5 VERIFIED). FortiGuard request moved to 5.5 (G5-DEFER) | Captain | Sun 21:00 (5.5) |
| G5-DEFER | Two-machine check of the public deploy | Captain + any member | Sun 21:00 (5.5) |
| B-5 | Concept-formation account for SI_LOG / README (not written by SI) | Team (G-07) | Sun 17:00 |
| ~~B-10~~ | ~~AC-09 third date (Mars24 app)~~ **Done Sun 01:45: 3 of 3 dates pass** | Yujin | - |
| B-11 | REMS units and outreach terms | Data and Science | Sun 13:00 |
| B-13 | Design confirmations incl. V-14 | Design | Sun 13:00 |
| R-13 | AC-07 reference-period sols, RAD observer height, page numbers | Data and Science | Sun 13:00 (else reported as not computed) |
| G-08 / REG-01 | Register cleared and merged (PR #19, 08ed600); needs the other members' confirmation | Team | Sun 13:00 |
| BENCH | Laptop route-latency measurement (< 500 ms) | Any member with a laptop | Sun 13:00 |

## Exact next task

1. **Register session (REG-DEFER):** walk V-01..V-14 with the team. Mark each FIXED (value, code, tests and DECISIONS updated) or KEPT (reason in DECISIONS), and update the CLAUDE.md register. Every merge to `main` redeploys the live site; check it after each merge.
2. **Laptop latency:** run the route bench on a team laptop and record it in PHASES (G2/G5).
3. **G5 freeze at Sun 13:00:** bug fixes only from then. Record G5 as met except the two-machine criterion (deferred).
4. **5.3 video** (Design, Sun 17:00) and **5.4 README / SI use** (B-5 concept account by the team).
5. **5.5 (last phase, before Sun 21:00):**
   - the two-machine check (steps in `docs/DEPLOY.md` "Verify the deploy");
   - the FortiGuard classification request for https://uptown-func.vercel.app (plan 19.3);
   - every submission field; links open without login; submit.
6. ~~Optional: merge this handoff to `main`~~ done: PR #17. Merging it redeployed the live site with no app change.
7. **Do not:**
   - fabricate any value, benchmark, approval or test result;
   - add an invented value without a CLAUDE.md register row;
   - change attribution without the team's written decision on G-07;
   - turn Vercel Authentication back on (judges need access).

## Exact commands for the next session

```bash
git fetch origin && git checkout claude/optimistic-darwin-dxdct4 && git pull
```

```bash
git log -1 && git status --short
```

```bash
npm ci && npx vitest run && npx tsc --noEmit && rm -rf dist && npm run build
```

```bash
python3.11 -m venv .venv && .venv/bin/pip install -r pipeline/requirements.txt pytest==9.2.0 && (cd pipeline && ../.venv/bin/python -m pytest -rs)
```

(`gdal-bin` is needed only for the two contour oracle tests and contour rebuilds: `apt-get install -y --no-install-recommends gdal-bin`. Without it, two tests skip.)

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

Check the live deploy (needs `uptown-func.vercel.app` allowed, as in the Uptown-Func environment):

```bash
curl -sS -o /dev/null -w "%{http_code}\n" https://uptown-func.vercel.app/
```

Pipeline reruns are needed only if the data or method changes. Commands are unchanged; see PHASES (RUN-01, AC-07, AC-08, sky grid).

Expected at this handoff (`main` d5488de):
- vitest 282/282;
- tsc clean;
- build OK (~249.6 KB);
- Playwright 50/50 (local and live);
- pytest 82 + 2 skipped without gdal-bin (84 with it);
- licences current;
- route bench: see known failure 1.

## Last session report

```text
Session / member: cloud session, branch claude/optimistic-darwin-dxdct4; operator not stated (no member assumed)
Model / tools: Claude Code, Claude Opus 5.5; Fable 5.2 not used; Superpowers NOT installed (not used);
  /code-review high on the deploy PR (R-21); Vercel REST API through the session proxy (token entered by a person)
Times (Asia/Manila): Sat 14 Nov ~21:30-22:50
Starting commit: main 030534c. Ending: main = PR #17 merge of this handoff (logs only)
Phase parts: 3.5 VERIFIED (deploy config, deploy, live e2e 50/50). Deferred by the operator: two-machine check and
  FortiGuard to 5.5 (G5-DEFER); register V-01..V-14 to another session (REG-DEFER)
Files changed: see "Files changed this session"
Checks run: see "Tests run at handoff" (all pass except the route-latency bench on this container, recorded)
Decisions recorded: DEP-01, DEP-02, R-21, G5-DEFER, REG-DEFER, G-07 note 2
SI_LOG.md: deploy-config row, deploy row, handoff row
Uncommitted changes left: none
Next owner: the team (register session, G-07); any member with a laptop (latency); Captain (5.5)
```

## Outgoing handoff checklist

- [x] Stop before the account/member rotation deadline; do not abandon an unrecorded worktree.
- [x] Finish and verify the current phase part where feasible (3.5 VERIFIED; nothing left half-done).
- [x] Commit verified work on the working branch. Do not push directly to shared `main`. (This session's earlier work reached `main` only through PRs #13-#16 at the operator's instruction; the handoff commit was merged later through PR #17 at the operator's instruction.)
- [x] Update `PHASES.md` with exact checks, results, limitations and commit SHA.
- [x] Update `DECISIONS.md` for any changed decision or newly discovered blocker.
- [x] Update `SI_LOG.md` for SI contributions during the session.
- [x] Record every changed file and the state of all uncommitted work.
- [x] State the next phase part and give exact commands/paths for the incoming owner.
- [x] Confirm no work was silently discarded, reset, force-pushed or overwritten. (The branch only fast-forwarded to `main` after each merge; nothing was force-pushed.)

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
