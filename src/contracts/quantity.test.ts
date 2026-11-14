// SI-assisted: drafted with Claude Code (Anthropic); human contracts-owner review pending.
// Plan 19.9 (Quantity) and CLAUDE.md hard rules.
import { describe, expect, it } from "vitest";
import { Quantity, ValueClass } from "./index";

const measured = {
  value: 0.83,
  unit: "m/s",
  valueClass: "published_observation",
  methodId: "cited-constant",
  assumptionIds: [],
  sourceIds: ["NASA/TM-2010-216138"],
};

const estimate = {
  value: 12.5,
  low: 10.7,
  high: 16.2,
  unit: "min",
  valueClass: "estimated",
  methodId: "leg-time-range",
  assumptionIds: ["A-speed-range"],
  sourceIds: ["NASA/TM-2010-216138"],
};

describe("ValueClass", () => {
  it("accepts exactly the seven plan value classes", () => {
    expect(ValueClass.options).toEqual([
      "directly_measured",
      "published_observation",
      "model_derived",
      "estimated",
      "simulated",
      "assumed",
      "unknown",
    ]);
  });

  it("rejects a SAFE-style class", () => {
    expect(ValueClass.safeParse("safe").success).toBe(false);
  });
});

describe("Quantity", () => {
  it("accepts a cited published value", () => {
    expect(Quantity.safeParse(measured).success).toBe(true);
  });

  it("accepts an estimate given as a range with assumptions", () => {
    expect(Quantity.safeParse(estimate).success).toBe(true);
  });

  it("rejects a quantity with no unit", () => {
    expect(Quantity.safeParse({ ...measured, unit: "" }).success).toBe(false);
  });

  it("rejects a quantity with no source ids", () => {
    expect(Quantity.safeParse({ ...measured, sourceIds: [] }).success).toBe(false);
  });

  it("rejects an estimate without a low/high range", () => {
    const { low: _low, high: _high, ...point } = estimate;
    expect(Quantity.safeParse(point).success).toBe(false);
  });

  it("rejects an estimate without assumption ids", () => {
    expect(Quantity.safeParse({ ...estimate, assumptionIds: [] }).success).toBe(false);
  });

  it("rejects a range where low > value or value > high", () => {
    expect(Quantity.safeParse({ ...estimate, low: 13 }).success).toBe(false);
    expect(Quantity.safeParse({ ...estimate, high: 12 }).success).toBe(false);
  });

  it("keeps unknown as unknown: value must be null, no range", () => {
    const unknown = { ...measured, value: null, valueClass: "unknown" };
    expect(Quantity.safeParse(unknown).success).toBe(true);
    expect(Quantity.safeParse({ ...unknown, value: 0 }).success).toBe(false);
    expect(Quantity.safeParse({ ...unknown, low: 0, high: 1 }).success).toBe(false);
  });

  it("rejects a null value on a known class", () => {
    expect(Quantity.safeParse({ ...measured, value: null }).success).toBe(false);
  });

  it("rejects non-finite values", () => {
    expect(Quantity.safeParse({ ...measured, value: Number.NaN }).success).toBe(false);
    expect(Quantity.safeParse({ ...measured, value: Infinity }).success).toBe(false);
  });
});
