// SI-assisted: drafted with Claude Code (Claude Opus 5.5); human Design review pending.
// The Plan panel's tasks box: one task per line, checked against the engine's limits before Save (C-19).
import { STOP_LIMITS } from "../engine/assumptions";

export function parseTasks(text: string): { tasks: string[]; problem: string | null } {
  const tasks = text.split("\n").map((t) => t.trim()).filter(Boolean);
  const problem = tasks.length > STOP_LIMITS.tasks ? `at most ${STOP_LIMITS.tasks} tasks`
    : tasks.some((t) => t.length > STOP_LIMITS.taskChars) ? `each task at most ${STOP_LIMITS.taskChars} characters` : null;
  return { tasks, problem };
}
