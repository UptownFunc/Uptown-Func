// SI-assisted: drafted with Claude Code (Claude Opus 5.5); human Design review pending.
import { describe, expect, it } from "vitest";
import { parseUtcInput } from "./ConditionsPanel";

describe("scenario time input (datetime-local, read as UTC)", () => {
  it("reads a complete date and time as UTC Unix seconds", () => {
    expect(parseUtcInput("2026-11-14T04:05")).toBe(Date.UTC(2026, 10, 14, 4, 5) / 1000);
  });
  it("returns null for blank, partial or impossible input instead of guessing", () => {
    for (const v of ["", "2026-11-14", "2026-11-14T4:05", "2026-13-40T25:99", "garbage"]) expect(parseUtcInput(v)).toBeNull();
  });
});
