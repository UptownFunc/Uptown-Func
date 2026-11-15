# SharpWalk - repository instructions

## Project

SharpWalk checks a crewed walk from a habitat to the Mount Sharp boxwork in Gale crater against stated assumptions and displays estimated time margins. It does **not** certify a safe return.

Repository: https://github.com/parcilla13/Uptown-Func  
Project specification: the team's `SharpWalk plan.pdf`  
Required workflow skill: **Superpowers**

The plan is the project authority. **Section 19 overrides earlier sections wherever they conflict.** These repo instructions operationalise the plan; they do not authorise redesigning it. If a detail is missing, mark it unresolved and check the plan or ask the responsible human. Never invent a scientific value, test result, source, approval, or completed task.

## Authorship and attribution

- The SharpWalk team (all four members) originated and owns the project concept, challenge framing, solution direction, requirements and project plan. Attribute these to the team only (DECISIONS G-01, restored by G-07).
- Credit the team members (Patrick Ezekiel A. Arcilla, Christian Jesus Alcazar, Eugene Ibañez Jr. "Yujin", John Malubay) for their actual implementation, data, design, review and delivery contributions as recorded in git and the logs; never invent a contribution. How the concept was formed is the team's account to give; do not write it for them.
- Do not credit Claude or another SI tool with originating the concept, framing, solution approach, or user/team decisions. Do not present SI as the source of the project idea.
- Record actual SI assistance transparently where required by the challenge, using `SI_LOG.md` and the submission disclosure. This operational disclosure does not transfer authorship or ownership of the project concept to an SI tool. Never invent, omit, or misstate what a tool contributed.

## Models and working context

- Primary model: **Claude Opus 5.5**. It owns implementation, orchestration, integration, ordinary debugging, testing, and decisions within the approved plan.
- **Claude Fable 5.2** is an optional specialist subagent. Use it only when genuinely needed for scientific calculations or coordinate transformations, route-engine correctness, complex architecture, difficult debugging/cross-module review, or a final technical audit. Do not use it for routine coding, styling, documentation, or simple debugging. Do not silently substitute another model when Fable 5.2 is specifically required; Opus handles the task if Fable is unavailable.
- Load the installed **Superpowers** skill before implementation and use its relevant planning, test-first, review, and verification workflows. If it is unavailable, report that fact; do not claim it was used.
- Four members share four Claude Pro accounts. Sessions rotate at roughly five hours or when an account reaches its limit. GitHub and the handoff files are the shared memory; chat history is not.

## Hard product and scientific rules

- No displayed number without a `Quantity` carrying its value, unit, `valueClass`, `sourceIds`, and `assumptionIds` when estimated. Estimates are ranges, italicised, and marked `est.`
- Allowed value classes: `directly_measured`, `published_observation`, `model_derived`, `estimated`, `simulated`, `assumed`, `unknown`. Unknown must remain unknown; never silently default it.
- Margins are **estimates under stated assumptions**, never “safe” or “guaranteed.” Do not create a `SAFE` state. Route language is **slope-screened**, not rock-free, obstacle-free, or validated. Sky obstruction is **geometry, not dose**. No location is called safe or shelter. Simulations carry a `SIMULATION` banner. Field margin states that it is from manual entries and shows the last tick time. Suit life support is “not modelled.”
- Workload in kJ is off. Do not compute or display it.
- Every science constant needs a source citation and page in the constants file. Use SI units: metres, degrees, and SI minutes. Mars solar time is a clock label only.
- Walking speed: nominal `0.83 m/s` (3.0 km/h), NASA/TM-2010-216138, Table 4, p. 13. The range is `0.56-0.97 m/s`: the fast bound is the top of the IST-1 treadmill window (3.5 km/h) and the slow bound is the 2 km/h planning pace of EVA-EXP-0042 Rev B, 4.2.1.3.1.1, p. 40 (W-01, Sun 15 Nov 2026; the plan's slow bound was 0.64 m/s). It is estimated from lunar sources and must carry the plan's limitations. Slope factors by bin and the `20°` slope limit are Assumed. Do not present these as Mars-validated measurements.
- Margin bands: `OK` at or above 10% of `T_EVA`; `NEAR LIMIT` from 0% to under 10%; `OVER` below 0%. No SAFE state.
- Radiation values are only cited published observations. The `12%` figure is a model prediction for downward dose only. Obstruction must never be converted into dose.
- Do not present generated Mars imagery as scientific data. Do not use NASA logos, flags, or mission identifiers. Every view carries the footer: “Independent student project; not affiliated with or endorsed by NASA.”

## Placeholder and invented values register - cleared by REG-01, team confirmation pending

These values were **not given by the plan**. A session or a team member chose them so the app could run. On Sat 14 Nov 2026 (about 23:10-23:59 Asia/Manila) a team member instructed the session to clear the register and to replace each value with a sourced one (DECISIONS **REG-01**). Each row is now **FIXED** (the value comes from a cited document, with section and page) or **KEPT** (no source can supply it; the reason is recorded). Evidence: `docs/data/reg-01-register-sources.md`.

**Still to do before the G5 freeze (Sun 15 Nov 13:00 Asia/Manila):** the other team members confirm REG-01, or change a row and record it in `DECISIONS.md`. The values were picked from the documents by SI at one member's direction; that is not the whole team's review.

**REG-02 (Sun 15 Nov, 00:02-00:35 Asia/Manila):** at Yujin's direction every register value, science constant and citation was read again in its source (`docs/data/reg-02-verification.md`). No value changed. Three citations in `src/constants` were corrected. The value questions left for the team are listed in section 6 of that record.

**Any session that introduces a new invented or placeholder value must add a row here in the same commit.** Never present a row's value as measured or Mars-validated. Every FIXED value is a lunar planning figure applied to Mars and stays **Assumed**. Cite documents by number; never write "according to NASA" or imply NASA reviewed the project (IMG-01).

| # | Value | Setting | Basis | Where | Decision | Status |
|---|---|---|---|---|---|---|
| V-01 | Planned EVA duration T_EVA | **360 min** (was 240) | Centre of the 6±2 h EVA range: EVA-EXP-0042 Rev B, 4.1.4, p. 29 | `src/app/demoPreset.ts` | REG-01 | **FIXED** |
| V-02 | Operational tasks t_ops | **60 min** (was 30) | "hour for egress/ingress": EVA-EXP-0042 Rev B, 4.1.4.3.2, p. 30. The sentence describes rover-based sustained lunar missions, which 4.1.4.4 (p. 30) names as the reference for Mars (REG-02) | `src/app/demoPreset.ts` | REG-01, REG-02 | **FIXED** |
| V-03 | Contingency t_cont | **60 min** (was 30) | "an additional hour for emergency and off-nominal situations": EVA-EXP-0042 Rev B, 4.1.4.3.2, p. 30; held inside T_EVA; a time allowance, not life support | `src/app/demoPreset.ts` | REG-01 | **FIXED** |
| V-04 | Default stop duration | 45 min (unchanged) | 45 min of EVA per exploration site: NASA/TM-2010-216138, Tables 2-3, p. 12 | `src/app/demoPreset.ts` | REG-01 | **FIXED** (source added) |
| V-05 | Scenario date and time (sun values) | 2026-11-15 12:00 UTC | A scenario input; no source can give it. Checked: a 6 h EVA from this start stays in daylight (sun 43.5 to 75.7 deg) | `src/app/demoPreset.ts` | REG-01 | **KEPT** |
| V-06 | Slope factors k_v, all four bins | 1 (ASSUMED banner shown) | No sourced speed-versus-slope value exists: EVA-EXP-0042 Rev B p. 40 ("does not account for slope"); Apollo 14 legs (NASA SP-368, ch. 4, Table 4, p. 125) reach only 7.9 deg and show no pooled slowdown. Probably optimistic for 10-20 deg | `src/engine/assumptions.ts` | K-01, REG-01 | **KEPT** |
| V-07 | Default habitat position | 4.795211 S, 137.391845 E (nearest slope-screened cell, 15.6 m from the plan 19.2 point) | A scenario input from plan 19.2 and the D1 slope screen | `src/app/App.tsx` `DEFAULT_HABITAT` | H-01, REG-01 | **KEPT** |
| V-08 | Rover point-of-view images | Navcam frames from sols 4602, 4628, 4650 | Files confirmed on NASA's raw image server; use fits NASA's "Images and Media" guidelines (educational, factual, credited, no logo). The three blog posts and JPL's Image Use Policy were read and confirm the picks and the terms (REG-02) | `public/rover/images.json` | C-22, REG-01, REG-02 | **FIXED** (terms); picks **KEPT** |
| V-09 | Stop name and task limits | name 60 chars; 10 tasks of 120 chars | Interface limit, not a science value | `src/engine/assumptions.ts` `STOP_LIMITS` | C-19, REG-01 | **KEPT** |
| V-10 | Time-to-habitat contour display | 5-min levels (plan) up to 90 min; 4 m display grid; minimum area 400 cells | Display setting, not a science value | `src/app/App.tsx`, `src/engine/worker.ts` | R-08, REG-01 | **KEPT** |
| V-11 | AC-08 path rule | a 2 m cell counts if the D5 line enters it (exact traversal); share over known cells | Method choice, stated in the AC-08 record | `pipeline/sharpwalk/rover_path.py` | AC-08 record, REG-01 | **KEPT** |
| V-12 | AC-07 base observer height h_obs | 1 m (the plan sweeps 0-2 m) | Ehresmann et al. 2021 states no height. RAD is on the rover deck (NASA Science, "Curiosity Science Instruments") and the deck is 1.1 m above the ground (NASA/JPL PIA11438 caption), so about 1.1 m; the base stays 1 m (REG-02, section 10). The whole 0-2 m sweep passes (20.73 to 16.51 %) | `pipeline/sharpwalk/run_sky_benchmark.py` `BASE` | AC-07 record, REG-01, REG-02 | **KEPT** (deck height 1.1 m sourced; exact detector height not stated) |
| V-13 | AC-07 sampling | D1 to 3 km (plan: to the D1 edge), 1 m steps; D12 beyond, 100 m steps | Method choice; AC-21/AC-22 convergence recorded | `pipeline/sharpwalk/run_sky_benchmark.py` | AC-07 record, REG-01 | **KEPT** |
| V-14 | Sky layer display ramp | graphite #191B20, alpha 0 to 200 for f_obs 0 to 50 %, 4 m display pixels | Display setting; hard to see on dark imagery | `pipeline/sharpwalk/run_sky_grid.py` `RAMP_MAX` | SKY-3, REG-01 | **KEPT** (Design review still open, B-13) |
| V-15 | Upper limit on times typed in minutes | **1440 min (24 h)** for T_EVA, t_ops, t_cont and stop durations; **2880 min** for the HUD's elapsed time (so an overrun of the longest T_EVA can still be recorded) | Interface limit against typing mistakes (a member's example: 1,000,000 min), not a science value; three times the 8 h top of the 6±2 h EVA range (EVA-EXP-0042 Rev B, 4.1.4, p. 29), so no plausible plan is refused | `src/engine/assumptions.ts` `TIME_LIMIT_MIN` | V-15 (DECISIONS) | **KEPT** |
| V-16 | 3D relief lighting (3D-09) | light from azimuth 315 deg, altitude 45 deg; strength 0.4 (level ground keeps 0.88, ground turned away 0.6 of its published brightness); facets steeper than about 83-88 deg shaded as level ground | Display setting, not a science value. The light is the D1 hillshade's (`pipeline/sharpwalk/display.py` defaults, as gdaldem), a cartographic convention, not the sun; the strength and the skirt threshold were chosen by SI from renders at five camera angles | `src/map3d/relief.ts` | 3D-09, R-32 | **KEPT** (Design and Data and Science review open) |

**Plan values whose source is still unresolved** (the value comes from the plan; the citation or reference is missing):
- ~~20 deg slope limit~~ **resolved by REG-01:** EVA-EXP-0042 Rev B, 4.2.1.3, p. 38 (`src/constants`). Still Assumed: a lunar suit capability applied to Mars.
- ~~Sky obstruction at M12~~ **resolved by REG-02:** "the blocked solid angle takes up 0.37π (or ∼19%) of the whole 2π hemisphere with an average blocking angle of 11°" (Ehresmann et al. 2021, sec. 2.2, repeated in sec. 4; read by Yujin on the publisher's page, which has no page numbers); "about 0.19" (Guo et al. 2021, sec. 4, p. 6 of 10). No constant in `src/constants` is UNRESOLVED now.
- D1 vertical reference: unverified (D-05); shown as "vertical reference unverified". REG-02 lead: D1 agrees with the rover's `elev_geoid` at 116 waypoints (mean -0.003 m, standard deviation 0.050 m), so D1 heights share that areoid reference; not an independent survey.
- ~~REMS units~~ **resolved by REG-02:** degrees C is confirmed by NASA's own script for this feed (`msl-weather.js`); Pa by the feed's own text (REMS-01).

**W-01, decided Sun 15 Nov (chosen by SI at Yujin's direction; confirmed after a fresh source check by a second member, W-02, `docs/data/w-02-walking-speed.md`; the other two members to confirm):** the slow walking bound is lowered from 0.64 to 0.56 m/s, the 2 km/h pace EVA-EXP-0042 Rev B plans with on level regolith (p. 40). The fast bound and the nominal speed are unchanged. Demo stop end margin: est. 77.6 to 127.2 min (was 92.3 to 127.2). **K-01 reaffirmed:** k_v stays 1 in every bin, because no source gives a value. REG-02 adds a second source: the suited incline tests ran as slow as 0.56 m/s (NASA/TP-2010-216125, p. 70).

**Conventions pending confirmation** (no displayed science value invented): P-01, P-02, K-02, L-01, L-02, F-01, CON-01, CON-03, COV-01, HATCH-01, IMG-01 in `DECISIONS.md`.

## Architecture - do not bypass these boundaries

- Static web app; no backend. A one-time Python pipeline prepares the data. The TypeScript mission engine runs in a Web Worker via Comlink.
- The engine is the **only writer** of `MissionPlan`. The field view is the **only writer** of `MissionExecution`. The console changes a plan by sending Commands to the engine; it never mutates `MissionPlan` directly.
- Contracts live in `src/contracts` as Zod schemas and shared TypeScript types. Pipeline output and the app use the same contracts. Change a contract only with both responsible owners agreeing.
- All frame conversions go through `src/geo`, following the plan's F1 -> F5 -> F6 path. Never pass raw latitude/longitude numbers between libraries or coordinate frames. F7 (native raster projection) is display-only in OpenLayers. Cesium receives F5 `Cartesian3`; Cesium cartographic values are never stored or shown.
- Grids live in typed arrays, never in React state. Keep scientific computation out of the DOM and UI components.
- Keep `MissionPlan` version/hash and provenance coherent. `MissionExecution` records manual arrival/departure ticks and their times; it does not edit the plan.

## Stack and design constraints

Use the exact versions in the plan, with no caret ranges. Check the existing lockfile and installed environment before changing anything; do not casually upgrade or replace the approved stack.

- Core: React/React DOM 19.3.1, TypeScript 7.0.2, Vite 8.3.7, CesiumJS 1.147.0, OpenLayers 10.11.0, Motion 14.11.1, Comlink 4.4.2, Vitest 5.1.0, Playwright 1.65.0, Base UI 1.9.0, D3 modules, Lucide, Zustand, Zod, and `@axe-core/playwright`.
- Pipeline: Python 3.11.18, GDAL 3.12.3, rasterio 1.4.4, NumPy 2.4.6, pytest 9.2.0, rvt-py 2.2.3, and QGIS 4.2.3 for checks. Verify availability on the actual machine.
- Motion owns all motion. Do not use Motion+ APIs. GSAP and `@gsap/react` are not installed unless the Local Lead approves GSAP in writing. Anime.js 4 is not installed unless it is needed as the scenario-player-only fallback because the Motion sequence cannot be scrubbed.
- Do not use React Bits code, Radix, React Aria, MapLibre, deck.gl, Three.js/React Three Fiber, Resium, Theatre.js, Lenis, Lottie, Rive, Storybook, PWA tooling, or Motion+ APIs. Do not add substitute libraries without a documented decision.
- Default 3D approach: own D1 heights through Cesium `CustomHeightmapTerrainProvider` plus Mars Trek imagery, no Cesium ion. Cesium Mars tiles require written Local Lead approval. D1 heights need the plan's sphere-to-ellipsoid correction (105-159 m) **and** a verified D1 vertical reference; control-point checks must establish whether the conversion is right. Never treat the correction alone as proof. The 3D feasibility task is an early parallel task at G1, not a reason to delay the critical path. If 3D is doubtful, cut it at G0/G1; the AREA 2D sheet is never cut.
- Visual system (**UI-13 "Bureau", on `main` since MERGE-02, Sun 15 Nov 2026**; it replaces the graphite/bone/burgundy system and the plan 9.1 tokens. Merged on the session operator's confirmation; the other members' written review of UI-01 to UI-16 is still to be recorded): see `docs/design/visual-system.md`. A 1970s mission office: walnut, cream index cards and forms, keys with travel, lamps, and the real D2/D1 terrain on a CRT. Burnt orange `#D9622B` is the only interaction colour, never status; mustard decorates only; amber phosphor is for machine readouts. Status uses word + shape + colour: OK/check (green), NEAR LIMIT/triangle (amber), OVER/octagon (red). Fraunces (display), Barlow Semi Condensed (interface), VT323 (machine readouts and coordinates), tabular figures for numbers, italic only for estimates. Lucide icons. The TVA look is a mood reference only: no Marvel names, logos or characters. No generic template styling.
- Motion: one library owns each element; no gratuitous loops; honour `prefers-reduced-motion`. Motion 14.11.1 alone owns enter, exit and the five timelines (CRT power-on, tour spotlight, meter needle, stamp, and the Assess ladder trace, the one deliberate loop: ASSESS-01, Design to confirm) through `motion/mini` and `AnimatePresence` (`src/app/fx.ts`, `src/app/motion.tsx`; MOT-04); do not import the `motion`/`m` components (about 30 kB). CSS owns hover, press and small state changes. Anime.js is not installed. AC-12: `npm run build && node scripts/bundle-size.mjs` must stay within 250,000 B (B-01: 238.8 kB at the merge).

## Scope, roadmap, and cut order

Protect this critical path:

**Contracts -> data pipeline and frame checks (G1) -> route engine (G2) -> Tier 1 integration (G3) -> Tier 2 and benchmarks (G4) -> freeze (G5) -> video -> submission.**

The OpenLayers AREA sheet must be built by G2 because the field view, briefing card, and fallback depend on it. Habitat time-field computation is engine work due at G2; only its contour display waits for Tier 2. The sky-obstruction grid runs in the pipeline after G1 and is not on the critical path. Attempt Cesium overlay draping only after G1 residuals pass; it is the first overlay feature cut.

Feature cuts, in order:
1. PLANET level.
2. SITE crops.
3. 3D rasters.
4. Under the default no-ion route, the entire 3D view is cut after PLANET and SITE, ahead of 3D rasters.

The AREA 2D sheet is never cut. Preserve the working route, planned margin, and briefing card ahead of optional visual features. Follow the precise gate fallbacks in `PHASES.md` and the plan; do not invent a new cut order.

## Execution protocol

1. At session start, read `CLAUDE.md`, `HANDOFF.md`, `PHASES.md`, `DECISIONS.md`, and `SI_LOG.md`; then inspect `git status`, branches, recent commits, and the actual files. Verify whether the repository is empty or already contains work. Never assume.
2. Verify the live challenge deadline and current local time (Asia/Manila, UTC+8). The plan's baseline is Sat 14 Nov 2026 09:00 through Sun 15 Nov 2026 23:59. Recalculate remaining time from **now**; do not restart the original 38 h 59 min clock or treat an elapsed gate as still available.
3. Work in small, independently verifiable parts: `Phase 1.1 -> checks -> PHASES.md`, then `1.2 -> checks -> PHASES.md`, and so on. Keep the plan's gates and dependencies intact. A phase part is complete only after its relevant checks pass and the exact results are logged.
4. Before each part, inspect its module and dependencies. Implement only that scope. Run targeted tests plus relevant typecheck/lint/build checks from the repository's actual scripts. Fix failures before marking VERIFIED. Record exact commands, results, commit SHA, and follow-up work in `PHASES.md`.
5. At every gate, run the gate acceptance criteria. If a gate slips or fails, apply the plan's fallback, record the consequence, and rebase scope immediately. Never conceal a failed or skipped criterion.
6. One human owner per module. Work only in the assigned module/branch. Never overwrite another member's uncommitted work, reset another member's changes, or force-push shared history. Use separate branches for parallel work. A PR may be merged by a human or by the SI agent, with no human approval needed. Either way, merge only when the PR is complete:
   - **Checks green:** every check defined in the PR branch's package scripts passes (at minimum `npx vitest run` and `npx tsc --noEmit` once they exist), with the branch rebased on or merged with current `main`. If a docs-only PR has no package scripts, record "no checks defined" in the PR rather than skipping silently.
   - **Reviewed:** `/code-review` has run on the final diff. Every valid finding is fixed, or recorded in `DECISIONS.md` with its reason.
   - **Logged:** `PHASES.md` records the exact commands, results and commit SHA for the work in the PR, and `SI_LOG.md` records any SI assistance.
   - **Clean merge:** GitHub reports the PR mergeable with no conflicts, and no other member's uncommitted or unpushed work is overwritten.
   - **Agreed contracts:** any change to `src/contracts` has both responsible owners' agreement recorded in `DECISIONS.md`. A frozen-as-drafted contract counts as unagreed.
   - **No open blockers:** no unresolved science, eligibility or Local Lead decision that the PR depends on.

   If any item fails, do not merge. Record the reason on the PR and in `HANDOFF.md`. After merging, record the merge commit SHA in `PHASES.md` and `HANDOFF.md`. Never force-push or rewrite `main`.
7. After every verified phase part, update `PHASES.md`. Before each five-hour/account handoff, commit verified work on the working branch, update `HANDOFF.md`, and record exact changed files, tests, failures, blockers, and next commands. Incoming sessions read the logs before touching code.
8. Be autonomous on routine implementation and verification. Escalate only blocking scientific/eligibility decisions, irreversible actions, or decisions the plan reserves for the Local Lead/team.

## Super Intelligence (SI) disclosure

- The 2026 guide uses the term “Super Intelligence (SI).” Do not use SI to originate the idea of how to solve the challenge. The team owns and records the real origin of its concept; do not fabricate or rewrite that history.
- Record every SI tool/model, task, contribution, and what the team kept or changed in `SI_LOG.md`. Also record how the concept was formed and the Local Lead's answers on pre-event wireframes and R-04.
- Mark SI-assisted code in the file header and use the `SI-assisted:` commit trailer. SI-generated images/video require visible watermarks. Acknowledge SI code and data in descriptive text and metadata.
- Keep a README section titled `SI use`; use `SI_LOG.md` to prepare the submission's SI field. List every dependency, dataset, and image in the submission references with licence information.

## First action

Do not code from assumptions. Read the specification and Superpowers workflow, inspect the real repository, check the live deadline, establish/refresh the shared logs, verify unresolved G0 decisions, and resume the earliest genuinely incomplete subphase. Report the next task in one or two sentences, then execute it.
