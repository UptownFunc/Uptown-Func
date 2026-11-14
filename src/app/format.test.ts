// SI-assisted: drafted with Claude Code (Claude Opus 5.5); human Design review pending.
import { describe, expect, it } from "vitest";
import type { Quantity } from "../contracts";
import { formatDuration, formatLength } from "./format";

const base = { methodId: "m", assumptionIds: ["A-kv"], sourceIds: ["D1"] };

describe("quantity formatting (CLAUDE.md: estimates are ranges, italic, marked est.; unknown stays unknown)", () => {
  it("shows an estimated time as an est. range in SI minutes", () => {
    const q: Quantity = { value: 600, low: 540, high: 780, unit: "s", valueClass: "estimated", ...base };
    expect(formatDuration(q)).toEqual({ text: "est. 9.0-13.0 min", estimated: true, unknown: false });
  });

  it("refuses an estimate without a range rather than showing it as a bare number", () => {
    const q = { value: 600, unit: "s", valueClass: "estimated", ...base } as Quantity;
    expect(() => formatDuration(q)).toThrow(/range/);
  });

  it("keeps an unknown value unknown", () => {
    const q: Quantity = { value: null, unit: "s", valueClass: "unknown", ...base };
    expect(formatDuration(q)).toEqual({ text: "unknown", estimated: false, unknown: true });
  });

  it("refuses to format a duration that is not in seconds", () => {
    const q: Quantity = { value: 1, unit: "min", valueClass: "assumed", ...base };
    expect(() => formatDuration(q)).toThrow(/seconds/);
  });

  it("formats lengths in metres below 1 km and kilometres above", () => {
    expect(formatLength(842.4)).toBe("842 m");
    expect(formatLength(1534)).toBe("1.53 km");
  });
});
