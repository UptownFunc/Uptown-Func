# SharpWalk - live session handoff

This file is the handoff between team members and Claude sessions. Keep it factual and current. A new session must read this file before touching code.

## Current snapshot

- Last updated: **Sat 14 Nov 2026, 14:15 Asia/Manila (UTC+8)** (container clock, `TZ=Asia/Manila date`)
- Deadline: **Sun 15 Nov 2026, 23:59 local** (plan 19.3, Project Submission Guide dated 12 Nov). The official portal time is still to be confirmed by a human.
- Remaining: **about 33 h 44 min to the deadline. G1 passed under its fallback (2D only; 3D cut). G2 (19:00) in 4 h 45 min: engine criteria met on the cloud machine. G3 (Sun 01:00) in 10 h 45 min.**
- Gate: G0 passed under its fallback. **G1 will not fully pass:** control points (1.5) and manifest (1.3, C-12) not done -> plan fallback, overlays in 2D only. **G2 engine criteria now met on this machine** (tests pass, route < 500 ms, speeds cited or Assumed, workload off) except the D-04 smoothing decision.
- Working branch: **`claude/trusting-fermi-c5pc0s`**, pushed. It is `claude/kind-ptolemy-1wdqf5` (204a9c4, previous handoff) **plus** this session's commits 3d0e68c, 9e9496c, 88f8b9a, 19b7c68, 89b08a7, bf0524b, 4420678, 16fb661, 05cc50e, 0ff9423, db1109d, f07094f, 0aaae81, 088a272, 66c373e, edf9492, 0acf9e7, 7539a4f, b68dec1, bfa4189, a7cb260, 30e1d26, db7c103 and the log commit. `kind-ptolemy` is unchanged; continue from `trusting-fermi`.
- `main`: **bb473b7**. **No open PRs.** Nothing merged this session (operator instruction: do not merge).
- Session operator this session: the account owner of the cloud session (no per-module role). Model: Claude Opus 5.5. Fable 5.2 not used. **Superpowers skill was not installed** in this session (X-01).
- Authorship: the SharpWalk concept, framing, direction, requirements and plan belong to **the four-member team**. SI assistance is recorded in SI_LOG.md only.

Do not interpret blank fields as proof that no work exists. Inspect GitHub and the working tree.

## Team and module ownership

**No per-module roles (G-04, session operator, 14 Nov ~13:00):** "no roles the phases are setup to start from beginning to end so simply continue working". Each session takes the phase parts in order, from the first incomplete one, on its own branch. Contract changes still need the team's recorded agreement (CLAUDE.md step 6). The earlier table (Captain = parcilla13, others TBA) is superseded; where the plan names an owner role (Captain, Data and Science, Route Engine, Design), read it as "the team".

## Current work

**What exists and passes its tests (no human sign-off yet):**
- `src/contracts`: nine Zod contracts (frozen as drafted, unagreed).
- `pipeline/sharpwalk`: D1 -> 2 m F6 grid, slope, terrain classes, quantised grids with sha256, F7 display layers. Rebuilt this session; checksums reproduce.
- `src/geo`: F1/F5/F6/F7 conversions and **grid cell <-> F1** (`grid.ts`). `src/constants`: cited register; only the 20 deg source is UNRESOLVED.
- `src/engine`: A* route, time field, leg metrics, plan 6.6 margins; **planner (only MissionPlan writer, Commands, version hash)**, **Comlink worker**, **K-01 placeholder k_v = 1**.
- `src/map` + `src/app`: AREA sheet with **habitat, lettered stops and the grid-path route**; click adds a stop; console panel with the **ASSUMED banner**, leg lengths/climb, est. time ranges in SI minutes, **Assumed plan-time inputs** (empty until a person enters minutes + rationale); once all four are set, **end margin est. range + OK / NEAR LIMIT / OVER state** (word + shape + colour).
- Analysis: **elevation profile** with two-way scrub to the map, **margin ticks** ("margin 10% here" / "margin 0 here") on map and profile, route past 0 in the over colour, **per-stop durations**, value-class badges.
- **Sources panel** (click any time/margin/duration; datasets in view from provenance.json) and AC-05 labelling.
- `src/field`: **Field View**: manual arrival/departure ticks (only MissionExecution writer), est. continue / return-now margins, "from manual entries, last tick at", stale-plan guard.
- `src/briefing`: **briefing card** (Briefing view): built from the current plan, version-stamped, STALE + print blocked after any change, sheet map crop, legs, stops with blanks, assumptions with rationales, limits, NASA footer; A5 print CSS.

**Known failures and risks:**
1. **T-01 (blocks the G3 demo):** no values exist for T_EVA, t_ops, t_cont, stop duration. The machinery works (enter them in the console); the team must choose the values and whether the demo ships with them pre-set. Per-stop durations are supported.
2. D-04 smoothing undecided (due G2, 19:00). The map draws the grid path; calculations use it.
3. GDAL 3.10.3, not 3.12.3 (P-03): re-run on a team machine and compare checksums.
4. Control points (1.5) not done; G1 fallback: overlays 2D only.
5. Habitat H-01 is a proposal (19.2 point is on excluded ground). Main routable region is 58% of the area and excludes the centre.
6. Leg length and climb shown without Quantity metadata (C-16, contract change needed).
7. Latency measured only on the cloud Xeon; not yet on a mid-range laptop.

**Cut:** none.

## Decisions awaiting human approval (all in DECISIONS.md)

| Topic | IDs |
|---|---|
| Blocking G3 | **T-01 plan times**; H-01 habitat confirmation; D-04 smoothing (G2); **G1-R: cut the 3D view?** |
| Contracts (team agreement) | C-01..C-16 (C-12 blocks the manifest; C-15 route geometry; C-16 Leg Quantities) |
| Data | 1.1 sign-off; D-03; D-05; D-06; P-01; P-02; P-03 GDAL rerun; 1.4 trust grid |
| Engine | K-01 real values (placeholder now); K-02; L-01/L-02 |
| Design / delivery | S-01, S-02 fonts, S-04, C-14 area data delivery (before first deploy), hatch aliasing |
| Local Lead | D-01 wireframes; D-02 GSAP / Cesium Mars |
| Team | SI_LOG "Concept origin" section (human-only); portal closing time |

## Exact next task

Plan defaults were applied at 14:15 (DECISIONS "Plan defaults applied"). Remaining G3 (Tier 1) gaps, in order:
1. **T-01 plan times** from the team (enter in the console, or record in DECISIONS so a session pre-sets them as logged Assumptions). Without them the planned margin shows "unknown" on every view.
2. **Conditions panel (Tier 1 Must):** D10 Mars24 (solar longitude, LMST clock label, sun elevation at the area centre; no terrain shadowing; check against the Mars24 app, AC-09) and a dated D7 REMS snapshot. Needs www.giss.nasa.gov and mars.nasa.gov: start the next session on the **"Uptown-Func"** environment, which allows them.
3. **Rover point of view (Tier 1 Must):** the team picks 3-5 Curiosity raw images (D6) of boxwork-like terrain and records sol, camera and credit; then a session adds them to the card and stop panel, labelled "similar terrain".
4. **3.5 first public deploy** (Vercel account, R-17); area data is now committed. Then request the FortiGuard classification (plan 19.3).
5. Follow-ups: R-02 (7, 8, 10), R-03 (5), R-04 (5-7), R-05 (5, 6), R-06 (5), R-07 (3); contracts C-12/C-16/C-17; P-03 GDAL 3.12.3 rerun.

## Exact commands for the next session

```bash
git fetch origin && git checkout claude/trusting-fermi-c5pc0s && git pull
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

(Only to rebuild: public/area is committed since db7c103; pytest checks it against the recorded checksums.)

```bash
npx playwright test --trace off
```

```bash
SHARPWALK_AREA=public/area node --experimental-strip-types bench/route-bench.ts
```

The pipeline needs HTTPS access to `asc-pds-services.s3.us-west-2.amazonaws.com` (USGS data). In a cloud session, the environment "Uptown-Func" allows the Mars data hosts. In this cloud container only, Playwright needs `PW_CHROMIUM=/opt/pw-browsers/chromium-1243/chrome-linux64/chrome`.

Expected results: vitest 201/201 in 15 files; tsc clean; pytest 43 passed; playwright 14 passed; real build checksums elevation `a93aa209...99a3ef`, slope `aa366e6f...18bdc0`, terrain_class `c9c06b3e...58ae21` (GDAL 3.10.3; compare under 3.12.3).

## Last session report

```text
Session / member: session operator of cloud session_018Xnznho5hoLyC49RJSn7oD (no per-module role, G-04); Claude Opus 5.5
Start and end time (Asia/Manila, container clock): Sat 14 Nov 12:57 - 14:15
Branch: claude/trusting-fermi-c5pc0s (fast-forwarded from claude/kind-ptolemy-1wdqf5 at 204a9c4; nothing overwritten)
Starting commit: 204a9c4
Ending commit: the log commit after 19b7c68 (see git log -1)
Phase parts: 2.1 (citation), 2.2/2.3/2.7 VERIFIED (human review pending); 2.4, 2.6 part 2, 3.1, 3.2, 3.3, 3.4 IN PROGRESS
Files changed: src/constants/*, src/geo/grid*, src/engine/{assumptions,planner*,loadGrid*,worker,client}.ts,
  src/map/{AreaSheet.tsx,planLayer.ts}, src/app/{App,PlanPanel}.tsx, src/app/format*, src/app/styles.css,
  e2e/plan-route.spec.ts, package.json, package-lock.json, PHASES.md, HANDOFF.md, DECISIONS.md, SI_LOG.md
Checks run: see the PHASES.md completion record (all green)
Failures / limitations: margins unknown (T-01); Superpowers not installed; plan PDFs live only on
  claude/lucid-ptolemy-nz6qpw (docs/plan); *.pdf is git-ignored on this line of work
Decisions made by humans this session: G-04 (no roles), K-01 (k_v = 1 placeholder + banner)
SI_LOG.md entries added: 7 rows
Uncommitted changes left: none (public/area/, .venv/, work/, dist/ are git-ignored build outputs)
Next owner: next session, from "Exact next task" above
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
