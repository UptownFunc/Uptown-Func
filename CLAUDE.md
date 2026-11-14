# SharpWalk - repository instructions

## Project

SharpWalk checks a crewed walk from a habitat to the Mount Sharp boxwork in Gale crater against stated assumptions and displays estimated time margins. It does **not** certify a safe return.

Repository: https://github.com/parcilla13/Uptown-Func  
Project specification: the team's `SharpWalk plan.pdf`  
Required workflow skill: **Superpowers**

The plan is the project authority. **Section 19 overrides earlier sections wherever they conflict.** These repo instructions operationalise the plan; they do not authorise redesigning it. If a detail is missing, mark it unresolved and check the plan or ask the responsible human. Never invent a scientific value, test result, source, approval, or completed task.

## Authorship and attribution

- SharpWalk's concept and project plan originated with **Patrick Ezekiel A. Arcilla (parcilla13)** (DECISIONS G-06, which supersedes G-01; pending the team's review in the PR). Do not credit the concept's origin to the team, to Claude or to any SI tool.
- Credit the team members (Patrick Ezekiel A. Arcilla, Christian Jesus Alcazar, Eugene Ibañez Jr. "Yujin", John Malubay) for their actual implementation, data, design, review and delivery contributions as recorded in git and the logs; never invent a contribution. How the concept was formed is Patrick's account to give; do not write it for him.
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
- Walking speed: nominal `0.83 m/s` (3.0 km/h), NASA/TM-2010-216138, Table 4, p. 13. The `0.64-0.97 m/s` range is estimated from lunar-gravity tests and must carry the plan's limitations. Slope factors by bin and the `20°` slope limit are Assumed. Do not present these as Mars-validated measurements.
- Margin bands: `OK` at or above 10% of `T_EVA`; `NEAR LIMIT` from 0% to under 10%; `OVER` below 0%. No SAFE state.
- Radiation values are only cited published observations. The `12%` figure is a model prediction for downward dose only. Obstruction must never be converted into dose.
- Do not present generated Mars imagery as scientific data. Do not use NASA logos, flags, or mission identifiers. Every view carries the footer: “Independent student project; not affiliated with or endorsed by NASA.”

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
- Visual system: graphite housing, bone faceplate/card stock, burgundy `#722A3E` as the only accent; no blue or copper. Burgundy means interaction, never warning. Status uses word + shape + colour: OK/check (green), NEAR LIMIT/triangle (amber), OVER/octagon (red). IBM Plex Sans and IBM Plex Mono with tabular figures. Keep the map well the largest, brightest surface. No generic template styling.
- Motion: one library owns each element; no gratuitous loops; honour `prefers-reduced-motion`. Motion owns all motion; do not build a second timeline by hand.

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
6. One human owner per module. Work only in the assigned module/branch. Never overwrite another member's uncommitted work, reset another member's changes, or force-push shared history. Use separate branches for parallel work. A PR may be merged by a human or by the AI agent, with no human approval needed. Either way, merge only when the PR is complete:
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
