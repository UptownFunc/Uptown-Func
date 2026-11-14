// SI-assisted: drafted with Claude Code (Claude Opus 5.5); human Design review pending.
import { describe, expect, it } from "vitest";
import { stopProfilePositions } from "./profile";

describe("stop markers on the elevation profile (R-15 review finding 4)", () => {
  it("places each stop at its own visit in walk order, not at an earlier pass over the same cell", () => {
    const prof = [1, 2, 3, 4, 3, 2, 1].map((cell, i) => ({ cell, s_m: i * 2 }));
    // Stop A at cell 4 (s 6), stop B at cell 2, reached on the way back (s 10), not at the outbound pass (s 2).
    expect(stopProfilePositions(prof, [4, 2])).toEqual([6, 10]);
  });

  it("returns null for a stop that is not on the profile", () => {
    expect(stopProfilePositions([{ cell: 1, s_m: 0 }, { cell: 2, s_m: 2 }], [9])).toEqual([null]);
  });
});
