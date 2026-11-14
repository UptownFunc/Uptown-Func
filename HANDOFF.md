# SharpWalk - live session handoff

This file is the handoff between team members and Claude sessions. Keep it factual and current. A new session must read this file before touching code.

## Current snapshot

- Last updated: **Sat 14 Nov 2026, 12:20 Asia/Manila (UTC+8)**
- Deadline: **Sun 15 Nov 2026, 23:59 local.** The official Space Apps FAQ confirms the 14-15 Nov dates; the 23:59 closing time comes from third-party pages only. **Captain: confirm it on the portal.**
- Remaining: **about 35 h 39 min to the deadline; G1 (14:00) in 1 h 40 min; G2 (19:00) in 6 h 40 min.**
- Gate: **G0 passed under its fallback** (contracts frozen as drafted, unagreed). **G1 will not fully pass on time:** control points (1.5) and the manifest (1.3, blocked by C-12) are not done. Apply the G1 fallback per plan: overlays in 2D only.
- Working branch: **`claude/kind-ptolemy-1wdqf5`**, pushed, **0 ahead / 0 behind origin**, working tree clean after the handoff commit. It is **ahead of `main` by the G0 and G1/G2 work** and has `main` (PR #1) merged in.
- `main`: **bb473b7** (PR parcilla13/Uptown-Func#1 merged: team attribution and the AI-merge completeness checklist). **No open PRs.**
- Other branches: `claude/lucid-ptolemy-nz6qpw` (old G0 work, already contained in this branch); `claude/team-attribution` (merged).
- Session operator: **Yujin** (git author `Yujin <eibanezjri@gmail.com>`). Model: Claude Opus 5.5. Fable 5.2 not used.
- Authorship: the SharpWalk concept, framing, direction, requirements and plan belong to **the four-member team** (CLAUDE.md, merged). SI assistance is recorded in SI_LOG.md only.

Do not interpret blank fields as proof that no work exists. Inspect GitHub and the working tree.

## Team and module ownership

**Still unassigned. Every pending decision below needs these names first.**

| Module / responsibility | Human owner | Working branch | Backup / reviewer |
|---|---|---|---|
| Captain / integration / deploy / submission | parcilla13 | `claude/kind-ptolemy-1wdqf5` (this session's work) | TBA |
| Data pipeline / data provenance / geo / contracts | TBA | TBA | TBA |
| Route and safety engine / worker | TBA | TBA | TBA |
| Design / console / field view / briefing card | TBA | TBA | TBA |
| 3D console (if retained) | Assign within the team; do not create a fifth owner | TBA | TBA |

## Current work

**What exists and passes its tests (none of it signed off by a human owner):**
- `src/contracts`: nine Zod contracts (frozen as drafted, unagreed).
- `pipeline/sharpwalk`: D1 -> 2 m F6 grid (ortho on the sphere, averaging), Horn slope, terrain classes, quantised grids with sha256, F7 display layers. Read-only checks in `pipeline/checks`. Audit: `docs/data/phase-1.1-source-audit.md`.
- `src/geo`: F1/F5/F6/F7 conversions; `src/constants`: cited register (2 citations UNRESOLVED).
- `src/engine`: A* route, time field, shared `edgeCost`, leg metrics and ranges, plan 6.6 margins with AC-19 property tests.
- `src/map` + `src/app`: OpenLayers AREA sheet (D2 base, D1 hillshade, class overlay, scale bar, Quantity readout, NASA footer). No stops or route drawn yet.

**In progress / blocked:** see the "Status at handoff" table in PHASES.md.

**Known failures and risks:**
1. **G2 latency (2.7) not met reliably:** the longest route took 521-552 ms with decreasing placeholder factors at the handoff re-run (target < 500 ms). Try buffer reuse first; the fallback is a 4 m grid (D-08).
2. GDAL is 3.10.3 (bundled with rasterio), not the pinned 3.12.3 (P-03). The pipeline outputs must be re-run and checksums compared on a machine with 3.12.3.
3. At 2 m the demo area splits into 5,441 routable regions; the main one covers 58.1% of the area and **does not contain the area centre**. Habitat and stops must sit in the main region.
4. D1/D2 raster alignment by image matching was inconclusive; residuals still need control points (1.5).
5. The hatch patterns alias at coarse zoom (Design to review).
6. Plan **part 2 (section 19) has not been read by any session.** Anything it changes is unchecked.

**Cut:** none.

## Decisions awaiting human approval (all in DECISIONS.md)

| Who | IDs |
|---|---|
| Captain | Portal closing time; owner names; C-14 (area data delivery); S-01 (@types/react); S-04 (no geotiff in browser) |
| Local Lead (via Captain) | D-01 wireframes; D-02 GSAP / Cesium Mars |
| Data and Science | 1.1 sign-off; D-03 area and case A; D-05 vertical reference lead; D-06; P-01 quantisation; P-02 class codes; P-03 GDAL rerun; C-01..C-13 (with the contracts owner); trust-grid method for 1.4; G-03 plan vector note |
| Route Engine | **K-01 slope factor values and source (blocks real times)**; K-02 bin edges; L-01/L-02; C-03 command payloads; D-04 smoothing (due at G2) |
| Design | S-02 fonts; hatch aliasing; whether to show the route with an ASSUMED-factors banner before K-01 arrives |
| Team | Fill the "Concept origin" section of SI_LOG.md (human-only) |

## Exact next task

**Next code task (2.6 part 2 + 3.1):** draw the habitat, stops and engine route on the AREA sheet through a Comlink worker. **First get a decision on the speed factors (K-01):** either the Route Engine owner supplies the four values and their source, or Design and Route Engine approve using equal factors for the route shape under a visible "ASSUMED" banner, with times and margins shown as unknown. In parallel, optimise the route search (buffer reuse) and re-run the 2.7 benchmark.

## Exact commands for the next session

```bash
git fetch origin && git checkout claude/kind-ptolemy-1wdqf5 && git pull
```

```bash
npm ci && npx vitest run && npx tsc --noEmit && npx vite build
```

```bash
python3.11 -m venv .venv && .venv/bin/pip install -r pipeline/requirements.txt && (cd pipeline && ../.venv/bin/python -m pytest -q)
```

```bash
cd pipeline && ../.venv/bin/python -m sharpwalk.run_d1 ../public/area && ../.venv/bin/python -m sharpwalk.run_display ../public/area && cd ..
```

```bash
npx playwright test --trace off
```

```bash
SHARPWALK_AREA=public/area node --experimental-strip-types bench/route-bench.ts
```

The pipeline needs HTTPS access to `asc-pds-services.s3.us-west-2.amazonaws.com` (USGS data). In a cloud session, the environment "Uptown-Func" allows the Mars data hosts. In this cloud container only, Playwright needs `PW_CHROMIUM=/opt/pw-browsers/chromium-1243/chrome-linux64/chrome`.

Expected results: vitest 143/143 in 8 files; tsc clean; pytest 39 passed; playwright 2 passed; real build checksums elevation `a93aa209...99a3ef`, slope `aa366e6f...18bdc0`, terrain_class `c9c06b3e...58ae21` (GDAL 3.10.3; compare under 3.12.3).

## Last session report

```text
Session / member: Yujin (operator); Claude Code cloud session, Claude Opus 5.5
Start and end time (Asia/Manila): Sat 14 Nov 10:21 - 12:20
Branch: claude/kind-ptolemy-1wdqf5
Starting commit: 8986d70 (fast-forward from 393723e)
Ending commit: the handoff commit after d4154de (see git log -1)
Phase parts touched: G0 review; 1.1, 1.2, 1.4, 2.1, 2.2, 2.3, 2.4, 2.6 (part 1), 2.7 - all IN PROGRESS, none VERIFIED
Merged: PR parcilla13/Uptown-Func#1 (docs only) into main as bb473b7, at Yujin's direction, under the new checklist
Files changed (whole session): src/{contracts headers,geo,constants,engine,map,app,raw.d.ts}, pipeline/{sharpwalk,tests,
  checks,requirements.txt,pytest.ini}, docs/data/phase-1.1-source-audit.md, bench/route-bench.ts, e2e/area-sheet.spec.ts,
  index.html, vite.config.ts, playwright.config.ts, package.json, package-lock.json, tsconfig.json, .gitignore,
  CLAUDE.md (via PR #1), PHASES.md, HANDOFF.md, DECISIONS.md, SI_LOG.md, SESSION_PROMPTS.md (via PR #1)
Checks run at handoff: see the PHASES.md handoff record (all green except the 2.7 latency target)
Failures / limitations: 2.7 latency target missed with non-unity factors; GDAL 3.10.3; plan section 19 unread; vitest
  had been collecting the Playwright spec (fixed at handoff)
Decisions made by humans this session: G-01 (team attribution) and G-02 (AI merges under the checklist), both by Yujin
SI_LOG.md entries added: 9 rows for this session
Uncommitted changes left: none
Environment: personal cloud environment "Uptown-Func" (Mars data hosts); local reference files and the
  data crops live only in the session scratch area and are never committed (.gitignore blocks *.pdf, *.zip, work/, public/area/)
Next owner: Route Engine (K-01) and Data and Science (sign-offs); Captain (portal, owners, C-14)
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
