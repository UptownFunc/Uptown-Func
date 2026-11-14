# SharpWalk - Super Intelligence (SI) use log

This log supports the 2026 submission disclosure and README `SI use` section. Keep it complete and factual. Record tools/models, tasks, contributions, what the team kept or changed, human review, affected files and commits.

## Concept origin and SI boundary

**Human team must complete this section truthfully.** The 2026 guide says SI should not be used to come up with the idea of how to solve the challenge. Do not infer or invent who originated the idea, what was discussed, or how the concept was formed. Record the actual human-origin story and distinguish it from later SI assistance.

- Team-originated challenge solution / concept:
- Who proposed it and when:
- Human research and decisions that led to it:
- SI use after the concept was formed:
- Human confirmation and date:

## SI-assisted work entries

Add one row for every meaningful SI-assisted contribution, including code, data processing, documentation, tests, images, video, research, and analysis. Be specific enough to reconcile this log with commit history and submission metadata.

| Date/time (Asia/Manila) | Human member | Tool / model | Task and inputs | SI contribution | What the team kept / changed / rejected | Human review / verification | Files and commit SHA | Required marker / disclosure |
|---|---|---|---|---|---|---|---|---|
| Sat 14 Nov 2026, 09:50-10:05 | parcilla13 (Captain) | Claude Code (Anthropic); exact model to be filled in by the team | Draft G0 contracts from plan 19.9 and 7.5; inputs: the team's plan PDF and CLAUDE.md | Drafted Zod schemas for the nine 19.9 contracts, their 44 Vitest tests, the package scaffold with exact pins, and the MIT LICENSE text | Kept as drafted, pending Data and Science agreement on C-01..C-05 (DECISIONS.md) | Tests and typecheck run (`npx vitest run` 44/44, `npx tsc --noEmit` clean); human owner review pending | `src/contracts/*`, `package.json`, `tsconfig.json`, `LICENSE`; commit 5e9cbdd | `SI-assisted` file headers in `src/contracts/*`; `SI-assisted:` commit trailer |
| Sat 14 Nov 2026, 10:21-10:30 | Yujin (session operator); Captain parcilla13 | Claude Code (Anthropic), Claude Opus 5.5. The model of the 09:50 entry above was not recorded by that session and is not inferred here. | Run /code-review on the G0 changes, apply the fixes that do not touch contracts, record the rest, check 1.1 readiness | Ran the review; corrected the SI-assisted header wording; fixed .gitignore; logged C-06..C-11; updated logs; probed tools and data hosts | Contract changes were not applied and await owner agreement | `npx vitest run` 44/44; `npx tsc --noEmit` clean; human review pending | `.gitignore`, `src/contracts/*` (headers), DECISIONS/PHASES/SI_LOG/HANDOFF; commit after 8986d70 | `SI-assisted:` commit trailer |
| Sat 14 Nov 2026, ~10:35 | Yujin | Claude Code (Anthropic), Claude Opus 5.5 | Change the attribution and merge rules in CLAUDE.md at Yujin's direction | Drafted the team-attribution wording and the AI-merge completeness checklist; ran /code-review and fixed 2 findings | Wording and the decision to allow AI merges came from Yujin; the tool drafted the checklist text | /code-review low; docs only, no package scripts on main | CLAUDE.md, DECISIONS.md, HANDOFF.md, SESSION_PROMPTS.md, PHASES.md, SI_LOG.md; PR parcilla13/Uptown-Func#1 | `SI-assisted:` commit trailer |
| Sat 14 Nov 2026, 10:42-10:48 | Yujin | Claude Code (Anthropic), Claude Opus 5.5 | Phase 1.1 source audit from plan sections 5 and 7.3 | Read D1, D2 and D12 metadata remotely; computed demo-area NoData, hillshade, roughness and slope; HiRISE coverage and height comparison; wrote 7 read-only check scripts and the audit record | All results await Data and Science sign-off; no dataset or area decision was made by the tool | Scripts re-run from the repo with identical results; vitest 44/44; tsc clean | `docs/data/phase-1.1-source-audit.md`, `pipeline/checks/*.py` | `SI-assisted` file headers; `SI-assisted:` commit trailer |
| Sat 14 Nov 2026, 10:48-10:58 | Yujin | Claude Code (Anthropic), Claude Opus 5.5 | Phase 1.2 pipeline core from plan 6.3, 6.4, 7.3, 7.5, 7.7 | Wrote the tests first, then geo/warp/grids/outputs/build/run_d1; ran the real D1 build twice | Encoding choices P-01/P-02 and contract issues C-12/C-13 left for the owners; nothing agreed by the tool | pytest 29/29; identical checksums on two runs | `pipeline/sharpwalk/*`, `pipeline/tests/*` | `SI-assisted` file headers; `SI-assisted:` commit trailer |
| Sat 14 Nov 2026, 10:58-11:11 | Yujin | Claude Code (Anthropic), Claude Opus 5.5 | 1.4 measurements; 2.1 `src/geo` and constants register | Ran the seam clustering and the D1/D2 alignment attempts (recorded as inconclusive); wrote the geo and constants tests first, then the code | Unresolved citations left as UNRESOLVED, not filled in | vitest 60/60; tsc clean | `pipeline/checks/align_d1_d2.py`, `src/geo/*`, `src/constants/*` | `SI-assisted` file headers; `SI-assisted:` commit trailer |
| Sat 14 Nov 2026, 11:11-11:26 | Yujin | Claude Code (Anthropic), Claude Opus 5.5 | Phase 2.2 route engine and 2.7 latency measurement from plan 6.4 / 7.7 | Wrote the tests first (hand-solved grids, slope rules, A*-vs-Dijkstra property tests), then the A* engine and time field; profiled and optimised; measured connectivity | k_v values left as inputs (K-01); placeholder factors used only for timing and labelled as such | vitest 77/77; tsc clean; bench numbers in PHASES.md | `src/engine/*`, `bench/route-bench.ts` | `SI-assisted` file headers; `SI-assisted:` commit trailer |
| Sat 14 Nov 2026, 11:30-11:52 | Yujin | Claude Code (Anthropic), Claude Opus 5.5 | Phase 2.6 part 1: F7 projection, display layers and the OpenLayers AREA sheet | Wrote the tests first (F7 vector, overlay symbols, readout), then the pipeline display step, the React/OpenLayers shell and the Playwright tests; added the pinned packages | S-01..S-04 and C-14 left for the owners; hatch aliasing flagged for Design | vitest 88/88; pytest 38/38; playwright 2/2; build OK | `src/map/*`, `src/app/*`, `pipeline/sharpwalk/display.py`, `run_display.py`, `e2e/*` | `SI-assisted` file headers; `SI-assisted:` commit trailer |
| Sat 14 Nov 2026, 11:55-12:06 | Yujin | Claude Code (Anthropic), Claude Opus 5.5 | Phases 2.3 and 2.4 engine functions from plan 6.2, 6.4, 6.5, 6.6 | Wrote the tests first (leg metrics, margin states, AC-19 property tests, field margins), then leg.ts and margin.ts; checked the property tests are effective and mutation-sensitive | Conventions L-01/L-02 left for the owner; the plan's formulas used as written | vitest 133/133; tsc clean | `src/engine/leg*`, `src/engine/margin*` | `SI-assisted` file headers; `SI-assisted:` commit trailer |
| Sat 14 Nov 2026, 12:06-12:20 | Yujin | Claude Code (Anthropic), Claude Opus 5.5 | /code-review of 2.3/2.4/2.6 and the session handoff | Fixed the 10 review findings (readout geometry, shared edge rule, Quantities, CRS checks); found and fixed Vitest collecting the Playwright spec; re-ran every check; wrote the handoff | No human-originated decisions are attributed to SI; open decisions left to their owners | npm ci 0; vitest 143/143 in 8 files; tsc 0; build OK; pytest 39; playwright 2; latency target missed (R-01) | logs, `vite.config.ts`, `src/*`, `pipeline/*` | `SI-assisted:` commit trailer |

## Local Lead / G0 answers

Record the exact response, including who answered and when. Do not infer approval from silence.

| Question | Date/time | Local Lead / source | Exact answer or written approval reference | Action taken |
|---|---|---|---|---|
| Are the pre-event wireframes cleared, or must they be redrawn from tokens after kickoff? (D-01 / O-23) | PENDING | PENDING | PENDING | Existing wireframes remain not cleared until answered; redraw from tokens after kickoff |
| Is GSAP permitted under the 2026 Terms? (D-02 / R-04) | PENDING | PENDING | PENDING | Default remains Motion only; do not install GSAP |
| Are Cesium Mars tiles permitted, including the ion/account condition? (D-02 / R-04) | PENDING | PENDING | PENDING | Default remains no ion; own D1 heights + Mars Trek imagery or cut 3D |

## Required repository and commit markers

- SI-assisted source files must include a `SI-assisted` line in the file header.
- SI-assisted commits must include the `SI-assisted:` commit trailer.
- SI images and video must carry a visible watermark. Do not present generated Mars imagery as real data.
- Acknowledge SI-assisted code and data in descriptive text and metadata.
- Keep the README section titled `SI use` consistent with this log.
- List every dependency, dataset and image in the submission references, including licence information.

## README `SI use` reconciliation checklist

- [ ] Concept origin is described truthfully and is not attributed to SI if it was human-originated.
- [ ] Tools/models and tasks match this log.
- [ ] SI-generated or SI-assisted code/data are acknowledged.
- [ ] Required file-header and commit-trailer markers are present.
- [ ] SI-generated images/video, if any, have visible watermarks.
- [ ] Submission SI field is prepared from the same facts.
- [ ] Human team member reviews the final disclosure for accuracy.
