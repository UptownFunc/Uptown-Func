# SharpWalk - session prompts

Use these with Claude Code. The durable rules are in `CLAUDE.md`; do not paste a conflicting instruction over them.

## First session / kickoff

```text
Read CLAUDE.md, HANDOFF.md, PHASES.md, DECISIONS.md and SI_LOG.md. Load the Superpowers skill and read the complete SharpWalk plan; Section 19 overrides earlier sections. Inspect the actual repository, branches, uncommitted work and recent commits before editing. Verify the live challenge deadline and remaining time in Asia/Manila, then rebase the plan's gates from now rather than restarting the original clock. Use Opus 5.5 as primary; use Fable 5.2 only for the specialist cases in CLAUDE.md. Confirm module ownership and unresolved G0 decisions. Resume the earliest genuinely incomplete phase part. For each part: implement, run relevant checks, fix failures, record exact results and commit SHA in PHASES.md. Keep HANDOFF.md current. Do not mark untested work complete or invent approvals, science, sources or test results.
```

## Five-hour / account-limit handoff

```text
Prepare a SharpWalk handoff. Read CLAUDE.md and the live logs, inspect git status and branches, and finish or safely checkpoint the current phase part. Run and record its relevant checks. Commit verified work on the working branch; do not merge or push to shared main. Update PHASES.md, HANDOFF.md, DECISIONS.md and SI_LOG.md with exact files, commands, results, failures, blockers, decisions, commit SHA and the next exact action. Leave no ambiguous uncommitted state. The incoming session must be able to resume from GitHub and these files without chat history.
```

## Incoming member / new account

```text
Continue SharpWalk from the repository state, not from prior chat. Read CLAUDE.md, HANDOFF.md, PHASES.md, DECISIONS.md and SI_LOG.md. Inspect git status, branches, open PRs, recent commits and actual files. Verify the current deadline and remaining time in Asia/Manila. Confirm your module owner and branch, re-run any unclear last check, then resume the first incomplete phase part without repeating verified work. Update the phase and handoff logs after each verified part. Follow the plan's gates, scientific limits and cut order.
```
