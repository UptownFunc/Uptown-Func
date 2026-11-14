// SI-assisted: drafted with Claude Code (Claude Opus 5.5); human Design review pending.
import { describe, expect, it } from "vitest";
import type { Quantity } from "../contracts";
import { formatDuration, formatLength, formatQuantity, formatUtc } from "./format";

const base = { methodId: "m", assumptionIds: ["A-kv"], sourceIds: ["D1"] };

describe("quantity formatting (CLAUDE.md: estimates are ranges, italic, marked est.; unknown stays unknown)", () => {
  it("shows an estimated time as an est. range in SI minutes", () => {
    const q: Quantity = { value: 600, low: 540, high: 780, unit: "s", valueClass: "estimated", ...base };
    expect(formatDuration(q)).toEqual({ text: "est. 9.0 to 13.0 min", estimated: true, unknown: false });
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

describe("conditions formatting (plan 6.10: Mars solar time is a clock label, never a duration)", () => {
  const q = (value: number | null, unit: string) => ({ value, unit, valueClass: value === null ? "unknown" as const : "model_derived" as const, methodId: "m", assumptionIds: [], sourceIds: ["D10"] });
  it("shows angles to 0.1 degree with the degree sign", () => {
    expect(formatQuantity(q(-61.93960, "deg")).text).toBe("-61.9°");
    expect(formatQuantity(q(327.32416, "deg")).text).toBe("327.3°");
  });
  it("shows local mean solar time as an HH:MM clock label marked LMST", () => {
    expect(formatQuantity(q(0.8519, "Mars h (clock label)")).text).toBe("00:51 LMST");
    expect(formatQuantity(q(23.99425, "Mars h (clock label)")).text).toBe("23:59 LMST");
  });
  it("keeps unknown unknown and still formats durations in SI minutes", () => {
    expect(formatQuantity(q(null, "deg"))).toEqual({ text: "unknown", estimated: false, unknown: true });
    expect(formatQuantity({ ...q(600, "s"), valueClass: "assumed" }).text).toBe("10.0 min");
  });
  it("formats a UTC instant from Unix seconds", () => {
    expect(formatUtc(Date.UTC(2026, 10, 14, 4, 5) / 1000)).toBe("2026-11-14 04:05 UTC");
  });
});
