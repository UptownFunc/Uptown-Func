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
