# SharpWalk - live session handoff

This file is the handoff between team members and Claude sessions. Keep it factual and current. A new session must read this file before touching code.

## Current snapshot

- Last updated: **Sat 14 Nov 2026, 10:30 Asia/Manila**
- Current local time / time zone: **Sat 14 Nov 2026, ~10:30, Asia/Manila (UTC+8)**
- Actual challenge deadline: **Sun 15 Nov 2026, 23:59 local.** The official Space Apps FAQ confirms the 14-15 Nov dates; the 23:59 closing time is from third-party pages only. Captain to confirm on the portal.
- Remaining time: **about 37 h 29 min to the deadline; 30 min to G0 (11:00); 3 h 30 min to G1 (14:00)**
- Current gate: **G0 (due Sat 11:00). Contracts freeze as drafted and unagreed under the G0 fallback.**
- Active branches: **`claude/kind-ptolemy-1wdqf5`** (this session; fast-forwarded onto `claude/lucid-ptolemy-nz6qpw` at 8986d70, then adds the review follow-up commit). `claude/lucid-ptolemy-nz6qpw` is unchanged at 8986d70. A human merges to `main`.
- Last verified commit: **the review follow-up commit after 8986d70 on `claude/kind-ptolemy-1wdqf5`** (tests 44/44, typecheck clean)
- Current owner / member: **parcilla13 (Captain); this session is operated by Yujin. The project concept and plan belong to the whole team.**
- Repository state: **`main` = 393723e (logs only). The G0 branches add the package scaffold, `src/contracts`, LICENSE and the log updates.**
- Active phase part: **0.3 frozen as drafted (unagreed); 0.4 blocked on the Local Lead; 1.1 BLOCKED (plan PDF not available here, data hosts blocked, QGIS absent)**

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

- **Verified complete:** 0.1 repo/toolchain audit (deadline partly confirmed); 0.2 logs and LICENSE; G0 /code-review with the non-contract fixes applied.
- **In progress:** 0.3. Contracts are frozen as drafted under the G0 fallback; C-01..C-11 await owner agreement (DECISIONS.md). Owner names are still TBA.
- **Blocked:** 0.4 (Local Lead answers for D-01 and D-02; none recorded, defaults kept). 1.1: the plan PDF is not readable by this session, and the egress proxy refused the HiRISE, Mars Trek and USGS hosts. QGIS is absent. rasterio 1.4.4 bundles its own GDAL, which is not confirmed to be the pinned 3.12.3.
- **Cut:** none.
- **Next action:** Data and Science run 1.1 on a team machine with the plan PDF, GDAL 3.12.3, rasterio 1.4.4 and QGIS 4.2.3. Alternatively, give a cloud session the plan and allow the data hosts. In parallel, a human reviews and merges the G0 branch.

## Last session report

```text
Session / member: Yujin (operator) for parcilla13 (Captain); Claude Code cloud session, Claude Opus 5.5
Start and end time (Asia/Manila): Sat 14 Nov 10:21 - 10:30
Branch: claude/kind-ptolemy-1wdqf5
Starting commit: 8986d70 (fast-forward from 393723e)
Ending commit: review follow-up commit (see git log -1 on the branch)
Phase parts: G0 /code-review done; 0.3 frozen as drafted; 0.4 BLOCKED; 1.1 BLOCKED
Files changed: .gitignore, src/contracts/* (header comment only), DECISIONS.md, PHASES.md, SI_LOG.md, HANDOFF.md
Checks run: npm ci (exit 0); npx vitest run (44/44); npx tsc --noEmit (exit 0)
Failures / limitations: plan PDF unavailable; data hosts blocked by egress proxy; QGIS absent
Decisions made: none by humans. C-06..C-11 logged; G0 fallback freeze recorded as not consent
SI_LOG.md entries added: 1
Uncommitted changes left: none
Next exact commands (team machine): git fetch origin && git checkout claude/kind-ptolemy-1wdqf5 && npm ci && npx vitest run && npx tsc --noEmit
Next owner: Data and Science (1.1); Captain (portal deadline, Local Lead, owner names, merge review)
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
