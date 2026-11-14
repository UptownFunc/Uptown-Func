# SharpWalk - live session handoff

This file is the handoff between team members and Claude sessions. Keep it factual and current. A new session must read this file before touching code.

## Current snapshot

- Last updated: **Sat 14 Nov 2026, 10:05 Asia/Manila**
- Current local time / time zone: **Sat 14 Nov 2026, 10:05, Asia/Manila (UTC+8)**
- Actual challenge deadline: **Plan baseline Sun 15 Nov 2026, 23:59 Asia/Manila; live portal NOT re-verified this session**
- Remaining time: **37 h 54 min to the deadline; 55 min to G0 (11:00); 3 h 55 min to G1 (14:00)**
- Current gate: **G0 (due Sat 11:00)**
- Active branch: **`claude/lucid-ptolemy-nz6qpw`** (cloud session branch; merge to `main` by a human)
- Last verified commit: **5e9cbdd** (scaffold + contracts; tests 44/44, typecheck clean)
- Current owner / member: **parcilla13, Captain + contracts draft**
- Repository state: **`main` = 393723e (logs only). Branch adds package scaffold, `src/contracts`, LICENSE and log updates.**
- Active phase part: **0.3 contracts agreement (pending Data and Science); 0.4 Local Lead answers pending**

Do not interpret blank fields as proof that no work exists. Inspect GitHub and the working tree.

## Team and module ownership

Assign one human owner to each module. Names and assignments are intentionally left blank until the team fills them in.

| Module / responsibility | Human owner | Working branch | Backup / reviewer |
|---|---|---|---|
| Captain / integration / deploy / submission | parcilla13 | `claude/lucid-ptolemy-nz6qpw` (this session) | TBA |
| Data pipeline / data provenance / geo / contracts | TBA | TBA | TBA |
| Route and safety engine / worker | TBA | TBA | TBA |
| Design / console / field view / briefing card | TBA | TBA | TBA |
| 3D console (if retained) | Assign within the team; do not create a fifth owner | TBA | TBA |

Avoid simultaneous edits to the same files. Agree on shared contract changes before implementation.

## Current work

- **Verified complete:** 0.1 repo/toolchain audit; 0.2 logs and LICENSE.
- **In progress:** 0.3 contracts drafted in `src/contracts` (44 tests pass); needs Data and Science agreement on C-01..C-05 and owner names for the other modules.
- **Blocked:** 0.4 Local Lead answers (D-01, D-02); defaults retained. G1 needs GDAL, rasterio and QGIS, which are not installed in the cloud container: run the pipeline on a team laptop or install them first.
- **Cut:** none.
- **Next action:** at 11:00 freeze contracts (agreed or as drafted), merge the branch to `main` after review, then start 1.1 (Data and Science).

## Last session report

```text
Session / member: parcilla13 (Captain), Claude Code cloud session
Model used: Claude Code (Anthropic); team to record exact model in SI_LOG.md
Start and end time (Asia/Manila): Sat 14 Nov 09:49 - 10:05
Branch: claude/lucid-ptolemy-nz6qpw
Starting commit: 393723e
Ending commit: see `git log -1` on the branch (logs commit after 5e9cbdd)
Phase parts completed: 0.1, 0.2 (VERIFIED); 0.3 drafted (IN PROGRESS)
Files changed: package.json, package-lock.json, tsconfig.json, .gitignore, LICENSE, src/contracts/{index,quantity,schemas}.ts and tests, PHASES.md, HANDOFF.md, DECISIONS.md, SI_LOG.md
Checks run (exact commands and results): npx vitest run -> 2 files, 44/44 pass; npx tsc --noEmit -> clean
Failures / limitations: portal deadline not re-verified; GDAL/QGIS missing in cloud container; /code-review not yet run
Decisions made (link DECISIONS.md IDs): C-01..C-05 drafted (pending); D-01, D-02 defaults kept
SI_LOG.md entries added: 1 (G0 contracts)
Uncommitted changes left (file + reason): none
Next exact commands: npm ci && npx vitest run && npx tsc --noEmit
Next owner: Data and Science (agree contracts, start 1.1)
```

## Outgoing handoff checklist

- [ ] Stop before the account/member rotation deadline; do not abandon an unrecorded worktree.
- [ ] Finish and verify the current phase part where feasible. Otherwise mark it `IN PROGRESS` or `BLOCKED`, never `VERIFIED`.
- [ ] Commit verified work on the working branch. Do not push directly to shared `main` or merge your own PR.
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
- No human owner should merge a PR without tests passing and `/code-review` completed.
