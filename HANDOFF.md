# SharpWalk - live session handoff

This file is the handoff between team members and Claude sessions. Keep it factual and current. A new session must read this file before touching code.

## Current snapshot

- Last updated: **NOT RECORDED - first session must fill this in**
- Current local time / time zone: **NOT VERIFIED - Asia/Manila (UTC+8)**
- Actual challenge deadline: **NOT VERIFIED - plan baseline is Sun 15 Nov 2026, 23:59 Asia/Manila**
- Remaining time: **NOT CALCULATED**
- Current gate: **NOT VERIFIED**
- Active branch: **NOT VERIFIED**
- Last verified commit: **NONE RECORDED**
- Current owner / member: **NOT ASSIGNED HERE**
- Repository state: **RECHECK REQUIRED**
- Active phase part: **FIRST INCOMPLETE PART AFTER REPOSITORY AUDIT**

Do not interpret blank fields as proof that no work exists. Inspect GitHub and the working tree.

## Team and module ownership

Assign one human owner to each module. Names and assignments are intentionally left blank until the team fills them in.

| Module / responsibility | Human owner | Working branch | Backup / reviewer |
|---|---|---|---|
| Captain / integration / deploy / submission | TBA | TBA | TBA |
| Data pipeline / data provenance / geo / contracts | TBA | TBA | TBA |
| Route and safety engine / worker | TBA | TBA | TBA |
| Design / console / field view / briefing card | TBA | TBA | TBA |
| 3D console (if retained) | Assign within the team; do not create a fifth owner | TBA | TBA |

Avoid simultaneous edits to the same files. Agree on shared contract changes before implementation.

## Current work

- **Verified complete:** none recorded in this starter file.
- **In progress:** none recorded.
- **Blocked:** none recorded.
- **Cut:** none recorded.
- **Next action:** inspect repository, verify deadline, read all project logs and the plan, then resume the first incomplete `PHASES.md` part.

## Last session report

```text
Session / member:
Model used:
Start and end time (Asia/Manila):
Branch:
Starting commit:
Ending commit:
Phase parts completed:
Files changed:
Checks run (exact commands and results):
Failures / limitations:
Decisions made (link DECISIONS.md IDs):
SI_LOG.md entries added:
Uncommitted changes left (file + reason):
Next exact commands:
Next owner:
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
