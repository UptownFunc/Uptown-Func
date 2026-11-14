// SI-assisted: drafted with Claude Code (Claude Opus 5.5); human Design review pending.
import { describe, expect, it } from "vitest";
import { STOP_LIMITS } from "../engine/assumptions";
import { parseTasks } from "./stopTasks";

describe("stop tasks editor input (R-16 finding 9: same limits as the engine)", () => {
  it("keeps non-blank trimmed lines", () => {
    expect(parseTasks(" a \n\n b ")).toEqual({ tasks: ["a", "b"], problem: null });
  });
  it("reports too many tasks or an overlong task before Save", () => {
    const many = Array.from({ length: STOP_LIMITS.tasks + 1 }, (_, i) => `t${i}`).join("\n");
    expect(parseTasks(many).problem).toMatch(new RegExp(`at most ${STOP_LIMITS.tasks}`));
    expect(parseTasks("x".repeat(STOP_LIMITS.taskChars + 1)).problem).toMatch(new RegExp(`${STOP_LIMITS.taskChars} characters`));
  });
});
