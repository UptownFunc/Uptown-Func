# SharpWalk - live session handoff

This file is the handoff between team members and Claude sessions. Keep it factual and current. A new session must read this file before touching code.

## MERGED (Sun 15 Nov 2026, about 18:30 Asia/Manila): final 2D map baseline (MERGE-06). Start here

- **`main` = `d97ff38`** (PR #30), plus this record. Its tree is identical to the approved branch. The live site serves `assets/index-YVIcYmuh.js` and `engine-worker.js`, byte-identical to a local build of `d97ff38`. Playwright passed **86/86 against the live URL**.
- **Checks on `main`:** vitest 331/331; tsc clean; JS 245,896 B of 250,000 (**about 4.1 kB left**); Playwright 86/86; pytest 82 + 2 skipped.
- **Next (separate phase):** the 3D upgrade branches from `main` `d97ff38` and uses `src/map/planGeometry.ts` and `src/map/layers.ts`. The 2D sheet stays independent of it. Note that the bundle budget leaves about 4 kB.
- **Still for people:** a Design review of MAP-01..MAP-08 and TOUR-01; everything in the 15:10 handoff, section 3 (portal deadline, concept account, video, submission fields, submit).

## Detail: final 2D map baseline (Sun 15 Nov 2026, from 17:09 Asia/Manila): branch `claude/practical-johnson-hbw41e`, PR #30 (merged as `d97ff38`)

- **What:** the final 2D map that the 3D upgrade will branch from (DECISIONS MAP-01..MAP-08, TOUR-01, UX-24, UX-25, R-30). The load view now shows the whole sheet, with the habitat (before, the habitat was off screen). The sheet has its own keys (zoom, fit the route, whole sheet). The Layers panel has switches, a strength slider and a key. The sheet shows its own loading and error states, with Try again. The tour opens on the current step and follows the user's navigation. Empty HUD and Assess lead to the Map. **No 3D code**; no engine, contract, constant, dataset or value change.
- **For the 3D upgrade:** use `src/map/planGeometry.ts` (the plan as F1 features; project to F5 with `f1ToF5`) and `src/map/layers.ts` (`MapLayers`, the console's layer state). The 2D sheet does not depend on either 3D or Cesium. Its view is published on `data-view-f7`, and the e2e helpers `pixelAt`, `mapView` and `zoomTo` read it.
- **Checks at `ab0ff2b`:** vitest 327/327; tsc clean; JS 245,635 B of 250,000 (**about 4.4 kB left**); Playwright 86/86; pytest 82 + 2 skipped; licences current. /code-review high R-30: 7 findings, all fixed.
- **Approval and merge:** the operator confirmed the team's approval (MERGE-06). `main` had moved to `be056b7` (PR #31: HUD last, slow bound 0.56 m/s); it was merged into the branch and every check rerun: tsc clean, vitest 331/331, JS 245,896 B, Playwright 86/86. Then PR #30 was merged with a merge commit; the SHA and the live-site check are in the follow-up record. Live-site check: `curl -sS https://uptown-func.vercel.app/ | grep -o 'assets/index-[^"]*\.js'` against a local build of the merge commit (this container's network may refuse the site; a person may need to run it).
- **Open for people:** a Design review of the map and tour changes; everything in the 15:10 handoff, section 3, below.
## BRANCH (Sun 15 Nov 2026, about 17:55 Asia/Manila): HUD after the briefing, margin logic cross-checked. Not merged

- **Branch `claude/eager-hypatia-3w23ko`** (from `main` `c60d37e`). Step order is now Setup -> Planner -> Map -> Assess -> Brief -> HUD (DECISIONS UI-17), because the HUD is used during the walk. New test `src/field/consistency.test.ts` shows the HUD reproduces the planned margins when the crew is on plan (LOGIC-01).
- **Checks:** tsc clean; vitest 318/318; Playwright 76/76; JS 242,650 B of 250,000; /code-review low: 0 findings.
- **For the team:** approve UI-17 and merge (after the freeze); decide the elapsed-time label (LOGIC-01: from leaving the habitat, or from egress?).

## MERGED (Sun 15 Nov 2026, 15:57 Asia/Manila): every variable explained (MERGE-04). Start here, then read the 15:10 handoff below

- **`main` = `f1fd37f`** (PR #28) plus this record. The live site serves `assets/index-3s757jEt.js` and `engine-worker.js`, byte-identical to a local build of `f1fd37f`; Playwright **76/76 against the live URL** (15:57-16:02).
- **New on `main`:** the plain-language glossary (`src/app/glossary.ts`) in the tour cards, under each plan-time and condition field, as tap-to-explain names in the Route, Field and Assess panels, and in full in the Sources drawer (DECISIONS UX-22, UX-23).
- **Still for the team:** everything in section 3 of the 15:10 handoff below (portal deadline, concept account and authorship, video, two-machine check and FortiGuard, submission fields, PR #22, submit), plus Data and Science reading `src/app/glossary.ts` once.
- Checks on `main`: vitest 316/316; tsc clean; JS 241,933 B of 250,000 (about 8 kB left: any new code needs savings first).

## Detail (Sun 15 Nov 2026, 15:14-15:57 Asia/Manila): every variable explained, on `yujin/onboarding-terms` (merged at 15:57 as `f1fd37f`, MERGE-04)

- **Branch:** `yujin/onboarding-terms` from `main` `13fb96c`; commit `534698a` plus logs. **Not merged** (after the freeze): the team decides.
- **What it does (DECISIONS UX-22, UX-23):** a 27-term plain-language glossary used in the tour (each card lists its screen's terms), under each plan-time and condition field, as tap-to-explain names in the Route, Field and Assess panels, and in full in the Sources drawer. Plainer Planner heading and Demonstration tile.
- **Checks:** vitest 316/316; tsc clean; Playwright 76/76; JS 241,933 B of 250,000 (about 8 kB left).
- **For Data and Science:** read `src/app/glossary.ts` once; every definition was checked against the code and the register in review R-29.

## HANDOFF (Sun 15 Nov 2026, 15:10 Asia/Manila): start here

Written at Yujin's request ("Merge to main now, and prepare a handoff. Push."). It replaces the two sections below it as
the starting point; they keep the detail.

### 1. State right now

| Item | State |
|---|---|
| `main` | **`598cafe`** = merge of PR #26 (UX-17..UX-21), Sun 15 Nov 15:03, at Yujin's instruction (DECISIONS MERGE-03), plus this handoff's logs merge. |
| Live site | **Checked 15:04-15:09:** https://uptown-func.vercel.app serves `assets/index-5xmFCMnS.js` and `engine-worker.js`, both byte-identical (`cmp`) to a local build of `598cafe`; the full Playwright suite against the live URL: **74/74** (`--workers=1`). This also closes the open check from MERGE-02: the Bureau redesign is live and working. |
| Checks on `main` | vitest 311/311; `tsc --noEmit` clean; build OK; JavaScript 238,947 B gzip of 250,000 (AC-12). |
| Open pull requests | **#22** (W-01, slow walking bound 0.56 m/s): **conflicts with `main`**; waits for the team. Branch `credits/equal-team-authorship` (G-11) has no pull request. |
| Freeze | G5 was 13:00 (bug fixes only). Two merges came after it, both recorded as exceptions on a member's instruction: MERGE-02 (Bureau, 13:27, parcilla13's account) and MERGE-03 (UX polish, 15:03, Yujin). |
| Deadline | Submission Sun 15 Nov 23:59 local. **A person must confirm it on the portal.** Resubmitting is allowed; the last saved version is judged. |

### 2. What is on `main` now (since the REG-02 handoff further down)

1. **Bureau redesign (MERGE-02):** guided flow (Welcome, Setup, Planner, Map, HUD, Assess, Brief), the 1970s office look, orientation tour, point and click with a stop card, return-margin meter. Fonts Fraunces, Barlow Semi Condensed and VT323; `motion` 14.11.1 and `lucide-react` 1.73.0.
2. **UX polish (MERGE-03, DECISIONS UX-17..UX-21):** the tour's words, spotlight and card move together (on target at 220-345 ms, was 630-1,055 ms); short copy with a "try it" line that turns to Done when the plan shows it; card placement beside, below or above its control; one key for Next and Finish; each card announced; an old refusal cleared on the next click; the cursor tag's text kept inside the tag.
3. **Science values:** unchanged since REG-02 (every value checked against its source; no constant unresolved; AC-09 3 of 3).

### 3. What the team must do before 23:59, in order

| # | Task | Owner | Note |
|---|---|---|---|
| 1 | Confirm the deadline on the portal | Captain | Late saves are not eligible |
| 2 | Concept-origin account in `SI_LOG.md` (section "Concept origin and SI boundary") and README | **The team, not SI** | The 2026 rule: SI must not be used to come up with the idea. G-07..G-10 and G-11 (authorship) are open: settle them in writing first |
| 3 | Video (5.3) | Design | No SI-generated image without a visible watermark; no NASA logo; nobody under 18 |
| 4 | Two-machine check of the public site and the FortiGuard request (5.5, G5-DEFER) | Captain + one member | Steps in `docs/DEPLOY.md` |
| 5 | Submission fields | Captain | References field: copy the README References (every dataset, document, package and font). SI field: from `SI_LOG.md` |
| 6 | Decide PR #22 (W-01) | Data and Science | If accepted: rebase it on `main` (it conflicts), run the checks, merge, check the live site. If not: close it |
| 7 | Submit, then resubmit after any fix | Captain | |

### 4. Rules check (plan 19.3) for what changed today

The full rule-by-rule table is in "Handoff: Yujin's session", section 4, further down. Changes since then:

- **New dependencies** (`motion` MIT, `lucide-react` ISC, three SIL OFL fonts) are listed in README References. `docs/licences.md` was updated by the design branch; `scripts/licences.py` could not be re-run on Windows (it needs the Linux `.venv`): **re-run it in the cloud container before submitting.**
- **SI images:** the design sessions generated 25 Higgsfield exploration images; none is shipped or used as data (SI_LOG). The one image added since, `docs/data/ac-09-mars24-third-date.png`, is a screenshot of NASA's Mars24 app taken by a member.
- **SI disclosure:** every session today has an `SI_LOG.md` row and every commit an `SI-assisted:` trailer.

### 5. Known issues (not blockers)

- `scripts/bundle-size.mjs` fails on Windows (it builds the path as `D:\D:\...`); measure there with a gzip-9 sum of `dist/**/*.js`.
- Playwright on a 4-core Windows computer: run with `--workers=1` (parallel runs fail specs at random).
- EL-01: the elevation grid is still downloaded twice. BUILD-01: the worker build layout awaits the Route Engine owners.
- `HANDOFF.md` repeats one heading ("Latest session (Sat 14 Nov 2026, 23:07-23:59 ...)") above Yujin's session section: a merge leftover, harmless.

### 6. Commands

```bash
git fetch origin && git checkout main && git pull --ff-only
npm ci && npx vitest run && npx tsc --noEmit && rm -rf dist && npm run build
npx playwright test --trace off --workers=1
curl -sS https://uptown-func.vercel.app/ | grep -o 'assets/index-[^"]*\.js'      # expect assets/index-5xmFCMnS.js
```

If the live site is ever wrong: promote the previous production deployment in Vercel (instant), then on a branch `git revert -m 1 <merge commit>` and open a pull request. Never force-push `main`.

## Earlier (Sun 15 Nov 2026, 14:14-15:00 Asia/Manila): orientation timing and interaction polish on `yujin/ux-polish` (merged at 15:03 as `598cafe`, MERGE-03)

- **Branch:** `yujin/ux-polish` from `main` `943d30e`; commit `6fb67ca` plus logs. **Not merged:** it comes after the G5 freeze, so the team decides.
- **What changed (DECISIONS UX-17..UX-21):** the tour's words, spotlight and card now move together (words in the frame of the press, spotlight on target at 220-345 ms, was 630-1,055 ms); shorter copy with a "try it" line that turns to Done when the plan shows it; the card is placed beside, below or above its control; keyboard focus stays on one key; each card is announced; a refusal no longer outlives the next click; the cursor tag's words fit.
- **Checks:** vitest 311/311; tsc clean; Playwright 74/74 (7 new); JS 238,947 B of 250,000.
- **Not changed:** engine, contracts, constants, datasets, values, the Bureau visual tokens.

## MERGED INTO MAIN (Sun 15 Nov 2026, 13:27 Asia/Manila, container clock): start here

- **`main` = merge commit `b0896ad`** (parents `ca2504a` = previous `main`, `52965ae` = `design/sharpwalk-ui-ux`), plus
  the logs commit that records this. Merge commit, no squash, no force push; `git ls-remote origin refs/heads/main`
  answered `b0896ad13f11451084d9f16f89675a6450ec4561` right after the push. The merged tree is byte-identical to the
  tested branch tree (`git diff b0896ad 52965ae` is empty).
- **Why now:** the operator (parcilla13's account) answered "Merge now" to the question of MERGE-01; attribution
  "Leave as is" (DECISIONS MERGE-02). The merge is after the G5 freeze time (13:00), as an exception at the operator's
  instruction.
- **Commits brought to `main` (15):** 2b5f515, dbfdd6d, 0f153e5, 46218f4, 0a00683, 6380209, 62fa3bd (the three
  redesigns and their review fixes), 9107c42 (audit), 08f20f7, 0800f59, 63c8b82, c28bc24, 79c9c56, 7d3982b, 52965ae
  (review R-27 fixes and records).
- **Checks at `52965ae`, fresh `npm ci`, all passed:** `npx vitest run` 31 files, 302/302; `npx tsc --noEmit` exit 0;
  `rm -rf dist && npm run build` OK; `node scripts/bundle-size.mjs` 238,771 B of 250,000 B;
  `PW_CHROMIUM=/opt/pw-browsers/chromium-1243/chrome-linux64/chrome npx playwright test --trace off` 67/67;
  `(cd pipeline && ../.venv/bin/python -m pytest)` 82 passed, 2 skipped; licences current. Rerun on the merge commit
  itself: tsc exit 0, vitest 302/302, build OK, bundle 238,771 B.
- **Deployment: NOT VERIFIED from this session.** Vercel builds `main` for Production, but this container's network
  policy refuses `uptown-func.vercel.app` (proxy 403). Evidence short of that: Vercel built the branch preview at
  08f20f7 and reported "Ready" on pull request #24. **A person must check the live site now:**

  ```bash
  curl -sS https://uptown-func.vercel.app/ | grep -o 'assets/index-[^"]*\.js'      # expect assets/index-CuLWKMki.js
  curl -sS -o /dev/null -w '%{http_code}\n' https://uptown-func.vercel.app/engine-worker.js   # expect 200
  ```

  Then open the site, wait for "Terrain and route engine ready", add a stop on Map and generate the card.
- **If the live site is wrong:** in Vercel, promote the previous production deployment (instant), then on a branch
  `git revert -m 1 b0896ad` and open a pull request. Do not force-push `main`.
- **Still open for people:** the other members' written review of the redesign (UI-01 to UI-16, MOT-04); BUILD-01
  (worker build layout); authorship wording (G-08 to G-10, unchanged: whole team); EL-01; pull request #22 (W-01); the
  team's confirmation of REG-01; G5 two-machine demo on the new interface; the card on paper; the video and the
  submission.

## Earlier: merge preparation, audit session (Sun 15 Nov 2026, 12:55 Asia/Manila, container clock): superseded by the merge above

Two sessions received the merge request at the same time and both stopped before the merge, for the same reasons.
This section is the audit session's; the next section is the second session's (MERGE-01).

- **Asked:** merge `design/sharpwalk-ui-ux` into `main` (request from parcilla13's account, about 12:47).
- **Done:** whole-branch `/code-review` (R-27; 3 findings fixed in 79c9c56, 3 kept and recorded); every check rerun
  and green: vitest 302/302, tsc exit 0, build OK, bundle 238,771 B of 250,000 B, Playwright 67/67, pytest 82 passed +
  2 skipped, licences current. The merge is conflict-free (`main` ca2504a is already inside the branch). AUD-13 closed.
- **Not done: the merge itself.** Three points need a person's yes (DECISIONS MERGE-01 and its note): the team approval the records
  require for the redesign; merging a whole new interface at the G5 freeze (13:00, bug fixes only) into the branch
  Vercel deploys; and the authorship wording (G-10), which does not match the records.
- **To merge once confirmed** (no force push; keep the history):

  ```bash
  git fetch origin && git checkout main && git pull --ff-only
  git merge --no-ff origin/design/sharpwalk-ui-ux
  npx vitest run && npx tsc --noEmit && npm run build && node scripts/bundle-size.mjs
  git push origin main
  curl -sS https://uptown-func.vercel.app/ | grep -o 'assets/index-[^"]*\.js'   # compare with dist/index.html
  ```

  In the same merge, rewrite the "pending team approval / not merged" wording in CLAUDE.md (visual and motion lines),
  HANDOFF and PHASES, and record the merge commit SHA.
## Merge request (Sun 15 Nov 2026, about 12:55 Asia/Manila, container clock): prepared, NOT merged (MERGE-01)

- **Asked:** merge `design/sharpwalk-ui-ux` into `main`. **Done:** audit of the diff against `main` (87 files; no
  `src/contracts`, `src/constants`, `pipeline/` or `public/` change; engine change limited to the worker build and
  `terrainClasses()`), `/code-review` low (R-26, 0 findings, partial pass as stated there), checks (see the addendum
  below: all passed at 08f20f7; only log files changed since), SI headers present on every new source file, licences
  current, a pull request opened.
- **Not merged, two decisions needed from the team, in writing:**
  1. **Authorship:** sole credit to Patrick Ezekiel A. Arcilla (this request, and G-06) or the whole team (G-07, now in
     `CLAUDE.md` and `README.md`). No file was changed.
  2. **The redesign itself:** the branch's own records say no merge until the team approves the interface (UI-01 to
     UI-16). Merging replaces the live site's interface; after 13:00 `main` takes bug fixes only (G5).
- **To merge once both are settled:** update the attribution text if the team chooses to, rerun
  `npm ci && npx vitest run && npx tsc --noEmit && npm run build && node scripts/bundle-size.mjs && npx playwright test --trace off`,
  merge the pull request with a merge commit, then check https://uptown-func.vercel.app (`/engine-worker.js` must answer 200).
- **Also open:** AUD-13 (were the "13 defects" the UX-16 and A11Y-02 fixes?), BUILD-01 (worker build layout), PR #22 (W-01).

## Addendum (Sun 15 Nov 2026, 12:55 Asia/Manila, container clock): second session's independent check of 08f20f7

A separate cloud session (the one that did REG-01 on Sat night) was asked to resume the audit and then to hand off. It
changed **no code**. Read the 12:50 handoff below for the branch state; this adds four facts.

- **Independent re-run at 08f20f7, fresh `npm ci`, all passed:** `npx vitest run` 303/303 (31 files); `npx tsc --noEmit`
  clean; `rm -rf dist && npm run build` OK; `node scripts/bundle-size.mjs` 238,750 B of 250,000 B (index 195,579 +
  shared 34,631 + engine-worker 8,540); `PW_CHROMIUM=/opt/pw-browsers/chromium-1243/chrome-linux64/chrome npx
  playwright test --trace off` 67 passed / 67; pipeline pytest 82 passed + 2 skipped (`gdal_contour` not installed);
  `scripts/licences.py` against `docs/licences.md`: no difference. The A5 print check was not run separately; it is
  inside `e2e/audit.spec.ts`. Not re-run after the logs-only commit 0800f59.
- **"13 failing regression tests" are not in the repository.** The resume brief said the previous session stopped
  after writing failing tests for 13 further UX and accessibility defects. At 0800f59 there is no failing, skipped,
  `fixme` or `fail` test: `e2e/audit.spec.ts` holds 10 tests and all pass. Either the 13 were fixed inside 9107c42
  (UX-16, A11Y-02 list in DECISIONS) or that work was never pushed. **The member who ran that session should say
  which.** This session wrote no tests and fixed no defect, so as not to duplicate or overwrite that work.
- **Two sessions wrote to this branch within minutes of each other** (9107c42 and 08f20f7 at 12:37, 0800f59 at 12:44,
  this commit after). Always `git fetch origin && git status -sb` before committing here.
- **Tools installed in this session's container only (TOOL-01):** Claude Code plugins Superpowers 7.0.2
  (`obra/superpowers`) and caveman 4.1.0 (`juliusbrussee/caveman`), user scope. Other containers do not have them.
  Caveman shortens chat replies only; code, documents, commits and these logs stay in full prose.
- **Authorship:** this handoff request again asked to preserve "the user's sole authorship of the concept and plan".
  The records credit the whole team (G-07). Nothing was changed (G-07 note 3; same question as G-08 below).
- **Outside git:** a shareable document, "SharpWalk register corrections (REG-01)", was written for the team:
  https://claude.ai/artifact/YTD4Mj1cQyoUwmNWRuFr1H. It predates REG-02; where they differ, `docs/data/reg-02-verification.md` is newer.

## HANDOFF (Sun 15 Nov 2026, 12:50 Asia/Manila, container clock): design branch audit finished; start here

**Deadline:** Sun 15 Nov 2026 23:59 Asia/Manila (about 11 h left at this handoff). The G5 freeze (13:00) concerns
`main`; this session did not touch `main`.

- **Current phase part:** design branch audit A1-A6 (PHASES "Design branch, audit of the Bureau redesign"): **VERIFIED,
  complete, not merged.** Nothing is in progress and nothing is uncommitted.
- **Exact next task:** a human decision, not code. The team reviews `design/sharpwalk-ui-ux` and decides whether it
  replaces the interface on `main` before submission. If yes: merge current `main` into the branch, rerun the checks
  below, run `/code-review`, then open a pull request. If no: `main` (ca2504a) stays as it is and the branch is kept
  as a record. The plan's own next steps on `main` (freeze, video, submission) are in the older sections below.
- **Branch:** `design/sharpwalk-ui-ux` = `origin/design/sharpwalk-ui-ux`. Code and tests: **9107c42**; logs: 08f20f7,
  then this handoff commit (see `git log`). Working tree clean. `main` = ca2504a, untouched; the branch already
  contains it (0 commits behind).
- **Pull requests:** #22 (`yujin/w-01-slow-bound`, W-01, needs the team's confirmation) is the only open one. #24, opened
  for this branch from the Claude Code app during the session, was **closed unmerged** at 12:40. This session opened
  and merged none. GitHub now reports the repository as `UptownFunc/Uptown-Func`; the old
  `parcilla13/Uptown-Func` address still works for fetch and push.
- **Files changed by the audit (9107c42):** `src/app/{App,AssessPanel,PlanPanel,Screens,Tutorial,fx,motion,styles}.*`,
  `src/briefing/BriefingView.tsx`, `src/engine/{client,worker}.ts`, `src/map/{AreaSheet,loadArea}.*`, `src/raw.d.ts`,
  `vite.config.ts`, `vercel.json`, `package.json`, `package-lock.json`, `e2e/audit.spec.ts` (new),
  `scripts/bundle-size.mjs` (new), `docs/licences.md`, `docs/design/visual-system.md`, `docs/design/screenshots/*`,
  and the six records. `src/contracts`, `src/constants`, the engine's calculations, `pipeline/` and `public/` are unchanged.
- **Checks run again at 08f20f7 for this handoff (12:42-12:48), all passed:**

  | Command | Result |
  |---|---|
  | `npx vitest run` | 31 files, 303/303 passed |
  | `npx tsc --noEmit` | exit 0 |
  | `rm -rf dist && npm run build` | built |
  | `node scripts/bundle-size.mjs` | 238,750 B of 250,000 B: within budget (AC-12) |
  | `PW_CHROMIUM=/opt/pw-browsers/chromium-1243/chrome-linux64/chrome npx playwright test --trace off` | 67/67 passed |
  | `(cd pipeline && ../.venv/bin/python -m pytest)` | 82 passed, 2 skipped (`gdal_contour` not installed) |
  | `.venv/bin/python scripts/licences.py \| diff -q - docs/licences.md` | no difference |

- **Known failures:** none in the checks above. **Not verified:** the card printed on paper; the phone layout in
  daylight; the deployed site (this branch is not deployed); browsers other than Chromium.
- **Blockers and decisions awaiting people:**
  1. Team approval of the redesign (UI-11 to UI-16, MOT-04) before any merge.
  2. BUILD-01: Route Engine owners confirm the worker build (`engine-worker.js` as a second build entry).
  3. EL-01: the elevation grid is requested by both the page and the worker (same on `main`); owners decide.
  4. G-08 / G-09: authorship wording. Two session briefs asked for one member's sole authorship of the concept and
     plan; the records in force credit the whole team (G-07). Nothing was changed. **The team must settle this before
     the submission text is written.**
  5. Still open from earlier sessions: PR #22 (W-01), the team's confirmation of REG-01, and the items in the older
     sections below.
- **Commands for the next session:**

  ```bash
  git fetch origin && git checkout design/sharpwalk-ui-ux && git pull --ff-only
  npm ci
  npx vitest run && npx tsc --noEmit
  npm run build && node scripts/bundle-size.mjs
  PW_CHROMIUM=/opt/pw-browsers/chromium-1243/chrome-linux64/chrome npx playwright test --trace off
  python3.11 -m venv .venv && .venv/bin/pip install -r pipeline/requirements.txt && (cd pipeline && ../.venv/bin/python -m pytest)
  npx vite preview   # then open / or /#map
  ```

  `PW_CHROMIUM` is only needed in the cloud container. Do not import the `motion`/`m` components again (about 30 kB);
  use `Appear` in `src/app/motion.tsx` and `src/app/fx.ts`.

## Session detail (Sun 15 Nov 2026, 11:34 to about 12:50 Asia/Manila): audit of the "Bureau" redesign, design branch, NOT merged

**Read this first if you work on the interface.** `main` is untouched.

- **Branch:** `design/sharpwalk-ui-ux`, commit 9107c42 on top of 62fa3bd (plus a logs commit). Pushed to that branch only. Not merged. A pull request
  (#24) was opened from the Claude Code app during the session and closed unmerged at 12:40; this session opened none.
- **Model:** Claude Fable 5.2 (configured and serving). Superpowers loaded; tests first; /code-review high (R-25).
- **What changed:**
  - **Bundle (B-01): AC-12 met.** 310,521 B -> 238,750 B (`gzip -9`, every `.js` in `dist/`). Check it with
    `npm run build && node scripts/bundle-size.mjs`.
  - **Anime.js removed (MOT-04).** Motion alone animates: `src/app/fx.ts` (four timelines) and `src/app/motion.tsx`
    (`Appear`, enter and exit). Do not import `m`/`motion` components again: they add about 30 kB.
  - **Worker build (BUILD-01).** The engine worker is the `engine-worker` entry in `vite.config.ts` and shares
    `assets/shared-<hash>.js` with the page. `src/engine/client.ts` addresses `/engine-worker.js` (dev: the module).
  - **Terrain (TER-01).** Only the worker downloads `terrain_class.uint8.bin`; `engineApi.terrainClasses()` gives the
    sheet a copy for the cursor tag.
  - **Print (PRINT-02).** The demonstration card is one A5 page, 6 pt minimum.
  - **Design, UX, accessibility (UX-16, A11Y-02):** see DECISIONS for the list.
- **Checks:** vitest 303/303; tsc clean; build OK; bundle 238,750 B of 250,000 B; Playwright 67/67 (new
  `e2e/audit.spec.ts`, 10 tests); pytest 82 passed + 2 skipped; licences regenerated.
- **Open for the team:**
  1. Approve or change the branch (UI-11 to UI-16, MOT-04) before any merge.
  2. BUILD-01: Route Engine owners confirm the worker build layout.
  3. EL-01: the elevation grid is still requested twice (page and worker), as on `main`.
  4. G-08: the brief asked to credit one member with the concept and plan; the records credit the whole team (G-07).
     Nothing was changed. The team decides.
  5. Print the card on paper once; try the phone layout in daylight.
- **To look at it:** `git fetch origin design/sharpwalk-ui-ux && git checkout design/sharpwalk-ui-ux && npm ci && npm run build && npx vite preview`.
- **Pipeline tests here need Python 3.11:** `python3.11 -m venv .venv && .venv/bin/pip install -r pipeline/requirements.txt`.

## Earlier session (Sun 15 Nov 2026, until about 11:30 Asia/Manila): "Bureau" redesign, design branch, NOT merged

**Read this first if you work on the interface.** `main` is untouched.

- **Branch:** `design/sharpwalk-ui-ux`, one commit on top of 6380209. Pushed to that branch only; no PR, as the operator asked.
- **What changed:** "Bureau" (UI-13) replaces Frosted terrain on this branch: walnut, cream index cards and forms, keys
  with travel, lamps, the real terrain on a CRT, Fraunces / Barlow Semi Condensed / VT323. New: point and click on the
  map (UI-11: cursor tag, stop card with Rename/Move/Delete, move mode), an 8-card orientation tour (UI-12), a
  return-margin meter (UI-14). Motion 14.11.1 and Anime.js 4.5.0 installed at the operator's request (MOT-03).
  Records: `docs/design/visual-system.md`, `docs/design/screenshots/` (now also `desktop-8-orientation`,
  `desktop-9-stop-card`), DECISIONS UI-11..UI-14, MOT-03, R-24, E2E-03, B-01.
- **Checks:** vitest 303/303; tsc clean; build OK; Playwright 57/57 (new `e2e/bureau.spec.ts`); pytest 82 + 2 skipped; licences regenerated.
- **Blockers before any PR:** B-01 (about 313.6 kB vs 250 KB; Motion + Anime.js added about 55 kB); MOT-03 (Anime.js vs
  the CLAUDE.md rule); team approval of UI-11..UI-14; PRINT-02.
- **Next:** team review of the look; if kept, cut bundle size (drop Anime.js or lazy-load both libraries; Zod into the worker).

## Earlier session (Sun 15 Nov 2026, 01:58-02:40 Asia/Manila): "Frosted terrain" redesign, design branch, NOT merged

**Read this first if you work on the interface.** `main` is untouched.

- **Branch:** `design/sharpwalk-ui-ux`. `main` ca2504a was merged in (46218f4), then the redesign (0a00683) and the review fixes and logs. Pushed to that branch only; no PR, as the operator asked.
- **What changed:**
  - The real terrain is the stage on all seven steps, with frosted glass panels over it and an oxide accent.
  - Geist and Geist Mono, Lucide icons, design tokens.
  - CSS-only motion per emil-design-eng, with view transitions removed.
  - A decision-first briefing card with expandable details.
  - Records: `docs/design/visual-system.md`, `docs/design/screenshots/`. Decisions: UI-07..UI-10, MOT-02, PRINT-02, R-23, B-01 in `DECISIONS.md`.
- **Checks:** vitest 296/296; tsc clean; build OK; Playwright 55/55; pytest 82 + 2 skipped; licences current.
- **Blockers before any PR:**
  1. **B-01:** about 258.5 kB of app JavaScript against 250 KB.
  2. **MOT-01:** the CLAUDE.md Motion rule.
  3. The team approves UI-07..UI-10.
  4. **PRINT-02:** the demo-preset card prints on two pages.
- **To look at it:** `git checkout design/sharpwalk-ui-ux && npm ci && npm run build && npx vite preview`; open `/` (Welcome) or `/#map`.

## Latest session (Sun 15 Nov 2026, 00:58-01:55 Asia/Manila): UI/UX redesign on an isolated branch, NOT merged

**Read this first if you work on the interface.** `main` is untouched by this session.

- **Branch:** `design/sharpwalk-ui-ux`, from `main` 1ad41f6. Commits 2b5f515 (redesign), dbfdd6d (review fixes and records), plus a logs commit. Pushed to that branch only.
  - The operator said: no merge and no PR until the team approves.
  - `main`, `claude/ecstatic-keller-k9idte` and every other branch were not touched.
- **Session:** run from parcilla13's account (member identity not otherwise stated).
  - Model: Claude Opus 5.5. Superpowers loaded; the frontend-design skill used; Higgsfield used for 18 exploration images (none shipped).
  - The cloud environment "Space App" gained the allowed host `d8j0ntlcm91z4.cloudfront.net` (Higgsfield's image host), with the operator's approval in the prompt.
- **What changed:**
  - A guided flow (Welcome -> Setup -> Planner -> Map -> HUD -> Assess -> Brief) with the step in the URL hash.
  - The "Geologic Folio" visual system (paper, ink, cobalt interaction, the map as a framed plate).
  - Newsreader, Instrument Sans and DM Mono replace IBM Plex.
  - CSS and view-transition motion; a briefing confirmation.
  - Design record: `docs/design/visual-system.md`. Decisions: UI-01..UI-06, MOT-01, R-22, E2E-02 in `DECISIONS.md`.
- **Checks:**
  - vitest 290/290; tsc clean; build OK; Playwright 56/56; pytest 82 + 2 skipped; licences current.
  - /code-review high: 10 findings, 8 fixed.
- **Blockers before any PR:**
  1. **B-01:** app JavaScript about 254.1 kB against the 250 KB AC-12 budget (about 4.1 kB over); options are in DECISIONS B-01.
  2. **MOT-01:** the CLAUDE.md "Motion owns all motion" rule versus CSS-only motion (Motion was never installed).
  3. The team must approve UI-01..UI-06; the visual revision came from one member's authorisation.
- **To look at it:** `git fetch origin design/sharpwalk-ui-ux && git checkout design/sharpwalk-ui-ux && npm ci && npm run build && npx vite preview`; open `/` (welcome) or `/#map`.

## Latest session (Sat 14 Nov 2026, 23:07-23:59 Asia/Manila): register cleared, REG-01
## Handoff: Yujin's session (Sun 15 Nov 2026, 00:02-01:55 Asia/Manila)

**Read this section first.** It replaces the two short "latest session" notes below it, which keep the detail.

### 1. State right now

| Item | State |
|---|---|
| `main` | **`4d24d53`: PR #21 merged, Sun 15 Nov 01:51**, at Yujin's instruction ("Do it"). Live site checked at 01:52-01:56: it serves `assets/index-D6_LSyTq.js`, byte-identical (`cmp`) to the build of this branch, and all 50 Playwright specs pass against https://uptown-func.vercel.app (`--workers=1`, temporary config, deleted). |
| **PR #21** `yujin/reg-02-verification`, head `13506af` plus this handoff commit | **Merged as `4d24d53`.** (A first merge attempt by the SI session at 01:46 was refused by its own permission check; it was merged after the member said to.) Changes no value. |
| **PR #22** `yujin/w-01-slow-bound` | Open, stacked on PR #21. **Do not merge until the other members confirm it:** it changes a plan value (section 3). |
| Session | Directed by Yujin on his own Windows computer. Claude Code with Claude Fable 5.2. Superpowers not installed, not used. |
| Deadlines | G5 freeze Sun 15 Nov 13:00. Submission Sun 15 Nov 23:59 local. **A person must still confirm the deadline on the portal.** |

### 2. What this session did

Scope set by Yujin: "1. Verify them 2. Citation 3. Check if they are correct and appropriate"; "ALL DATA MUST HAVE BEEN VERIFIED". Full record: `docs/data/reg-02-verification.md` (12 sections).

| Work | Result |
|---|---|
| Register V-01..V-14, the nine science constants, README references | Every source downloaded again and read. The four REG-01 documents have the recorded sha256; every quotation is on its stated page. **No value changed.** |
| Citations corrected in `src/constants` (tests written first) | `walkSpeedRange` (a treadmill speed window, pages 2, 5, 10, 70); `drillWarningDefault` (arXiv:2502.02469; NASA/TM-20205000837, p. 49); `skyObstructionM12` (resolved). `unresolvedCitations()` is now empty. |
| Wrong statements in REG-01 corrected | The egress/ingress hour is from rover-based sustained missions, not a habitat hatch. The TBR tag is on the rover walk-back sentence. The station timeline on p. 8 of NASA/TM-2010-216138 is Figure 4, not Table 1. The README lacked the TM's fourth author. |
| 0.37 pi at Butte M12 | **Yujin opened Ehresmann et al. 2021 and supplied its text.** Sections 2.2 and 4 give 0.37 pi (about 19 %), average blocking angle 11 deg, up to about 30 deg. The paper states no height for RAD. |
| AC-09 third date | **Yujin ran NASA GISS Mars24 8.3.1:** 43.5 deg at 09:28 LMST for 2026-11-15 12:00 UT, the same as SharpWalk. **AC-09 passes on 3 of 3 dates; B-10 closed.** Screenshot: `docs/data/ac-09-mars24-third-date.png`. |
| Other checks | REMS temperature in degrees C confirmed from NASA's own script for the feed. RAD height sourced to the 1.1 m rover deck. D1 agrees with the rover's `elev_geoid` at 116 waypoints (mean -0.003 m, sd 0.050 m). D1, D2, D12 headers, the D5 file and the rover image checksums match their records. Sun angles agree with JPL Horizons within 0.1 deg at the four scenario times (0.13 and 0.19 deg at two other dates). |
| Decisions, on PR #22 only | Yujin delegated them ("choose what is best"); **SI chose.** Slow walking bound 0.64 -> 0.56 m/s (EVA-EXP-0042 Rev B, p. 40). Slope factors k_v kept at 1 (no source gives a value). Demo stop end margin est. 77.6 to 127.2 min, OK (was 92.3 to 127.2). |

Checks on PR #21's head: vitest 289/289; `tsc --noEmit` clean; build about 249.9 of 250 KB; Playwright 50/50 with `--workers=1`; `/code-review` low on the final diff, 0 findings. On PR #22: vitest 290/290; tsc clean; build about 249.95 of 250 KB (about 50 bytes left); Playwright 50/50 with `--workers=1`; `/code-review` low, 0 findings.

### 3. What to do next, in order

1. ~~Merge PR #21~~ **Done: `4d24d53`.**
2. ~~Check the live site after the merge.~~ **Done 01:52-01:56 (row above).** The command, for the next merge: `curl -sS https://uptown-func.vercel.app/ | grep -o 'assets/index-[^"]*\.js'` should print `assets/index-D6_LSyTq.js`, the bundle built from this branch. Then record the merge SHA in `PHASES.md` and here (CLAUDE.md step 6).
3. **Decide PR #22 as a team.** It lowers the slow walking bound, which plan 19.5 and CLAUDE.md fix at 0.64 m/s. If the team agrees: record the agreement in `DECISIONS.md` (W-01), run `gh pr edit 22 --base main`, merge, and check the live site again. If not: close it. PR #21 does not depend on it.
4. **G5 freeze at 13:00:** bug fixes only from then. Laptop route-latency measurement (BENCH) is still owed.
5. **5.3 video** (Design, 17:00) and **5.4 README / SI use**: the team's own account of how the concept was formed (B-5). SI must not write it.
6. **5.5, before 21:00:** two-machine check of the public site; FortiGuard request; every submission field; submit. Resubmitting is allowed and the last saved version is judged, so submit early and again after fixes.

### 4. Hackathon rules: where the project stands

Rules as the team plan records them (section 19.3: the Project Submission Guide and the Judging and Awards Guide, both dated 12 Nov 2026, and the Participant Terms updated 7 Aug 2026). **This session did not read the guides themselves; a person should check each row against the portal before submitting.**

| Rule (plan 19.3) | Status after this session | Still to do, and who |
|---|---|---|
| SI "should not be used to" come up with the idea of how to solve the challenge | Not affected. This session verified and cited values; it did not touch the concept. | **Team:** write the concept account in `SI_LOG.md` and the README (B-5). Authorship wording G-07 is still unsettled. |
| SI code and data acknowledged "in descriptive text and metadata" | Done for this session: `SI_LOG.md` rows for each step, the README "SI use" paragraph, `SI-assisted` file headers, and an `SI-assisted:` trailer on every commit. Commits are authored by Yujin, who directed the work. | **Team:** fill the submission's SI field from `SI_LOG.md`. |
| SI images and video need a visible watermark | None generated. The one new image is a screenshot of NASA's Mars24 app, taken by Yujin, in `docs/` only (not shipped). | **Design:** keep this true for the video (5.3). |
| No NASA logos, flags or mission identifiers | Unchanged: none in the app; the non-affiliation footer is on every view. NASA's media page was re-read: "References like 'according to NASA' or similar are prohibited in SI products" (IMG-01). Documents are cited by number. | **Team:** confirm the IMG-01 reading with the Local Lead. Keep "according to NASA" out of the video and the project page. |
| At least one NASA data or resource (Global Award eligibility) | Met and re-checked: D1, D2, D12 (USGS files, headers re-read), D5 and D6 (NASA/JPL), D7 (REMS feed), D10 (GISS Mars24). | None. |
| Relevance: NASA data as "a core component ... rather than a superficial addition" | README section "How each NASA dataset drives a number on screen" stands; every cited value behind it is now verified. | **Team:** say the same on the project page. |
| References field: list all data, resources and tools, "including any code, text, and images" | README References updated with every document read here, including the ones used only to verify (section "Verification sources"). | **Captain:** copy the README References into the submission field. Licences of the 31 native libraries in the pipeline wheels and the D12 terms are still unverified. |
| Own code open source (MIT); third-party code OSI-licensed and identified | Unchanged: MIT `LICENSE`; `docs/licences.md`. No dependency added. Mars24 and a Java runtime were used as tools on one computer and are **not** in the repository. | **Any member with the cloud container:** re-run `scripts/licences.py` (it could not run on Windows). |
| No export-controlled information | The NASA documents used are public NTRS releases; EVA-EXP-0042 Rev B carries "This document does not contain export control information" on each page. | None. |
| No image, video, audio or likeness of anyone under 18 | Nothing added that shows a person. | **Design:** keep this true for the video. |
| Submit before Sun 15 Nov 23:59 local; late saves are not eligible | Not started. | **Captain:** confirm the deadline on the portal; submit. |
| Team of 1-6, same Local Event, on the Members tab | Not checked by this session. | **Captain.** |
| Website access: FortiGuard classification request recommended | Deferred to 5.5 (G5-DEFER). | **Captain.** |

### 5. Still open after this session

- **PR #22** team decision. (PR #21 is merged and recorded.)
- NASA/TP-2010-216115 (the IST-1 report) is not online. The 2.3-3.5 km/h window is confirmed only as quoted in NASA/TM-2010-216138, Table 4, p. 13.
- D1 vertical reference: strong lead (areoid), not an independent survey; the app's label is unchanged. Plan part 1.5 (control points) is not done.
- k_v = 1 on 10-20 deg is an unsupported choice, kept because no source exists.
- The sun model is good to about 0.2 deg against JPL Horizons; the app shows 0.1 deg.
- Bundle budget: about 94 bytes left on PR #21, about 50 on PR #22. Any new app code needs savings first.
- Not run here: `scripts/licences.py`; the AC-07 and AC-08 pipeline jobs; the route bench.

### 6. Notes for whoever works on a Windows computer

- Node 24.16.0 was used; the repo pins 22.x. The build still reproduced the live bundle byte for byte before any change.
- Run Playwright with `--workers=1`. Parallel runs on a 4-core machine fail one or two specs at random.
- pytest needs `PYTHONUTF8=1`. Three tests then fail for reasons that are not data: git adds one carriage return to `coverage.geojson` and `contours.geojson` at checkout (their copies in git match the recorded sha256), and the licence check looks for a Linux `.venv`.
- Tools fetched for the checks live outside the repository and are not needed to build or run the app.

### 7. Do not

- Merge PR #22 without the other members' recorded agreement.
- Write "according to NASA" or "official NASA value" anywhere.
- Present any cited value as measured or Mars-validated: every one is a lunar planning figure applied to Mars, and stays Assumed.
- Add an invented value without a row in the CLAUDE.md register.
- Change attribution without the team's written decision on G-07.

## Detail of the decisions branch (Sun 15 Nov 2026, 01:04-01:20 Asia/Manila): W-01 decided on a separate branch

- **Branch:** `yujin/w-01-slow-bound`, on top of `yujin/reg-02-verification` (PR #21). Commit `4be709c` plus a log commit. **Not merged.**
- **What it does:** the slow walking bound goes from 0.64 to 0.56 m/s (DECISIONS W-01). The slope factors stay 1 (K-01 reaffirmed). Yujin delegated both choices to the SI session ("choose what is best").
- **Why it is separate:** PR #21 changes no value. This one changes a value the plan fixes (plan 19.5), so **the other members must confirm it before it is merged.** If they reject it, close this PR; PR #21 does not depend on it.
- **Effect:** demo stop end margin est. 77.6 to 127.2 min, OK (was est. 92.3 to 127.2 min). Time-to-habitat contours move in.
- **Checks:** vitest 290/290; tsc clean; build ~249.95 of 250 KB (about 50 bytes left); Playwright: 50/50 with `--workers=1`.

## Detail of the first part of that session (Sun 15 Nov 2026, 00:02-00:35 Asia/Manila): REG-02, every value and citation checked

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
