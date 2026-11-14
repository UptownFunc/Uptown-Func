// SI-assisted: drafted with Claude Code (Claude Opus 5.5); human Data and Science review pending.
// D7 REMS snapshot in the console: validated, every number a directly measured Quantity sourced to D7, and the
// source description carries the date, the rover-site caveat and CAB's own disclaimer.
import { describe, expect, it } from "vitest";
import { Quantity } from "../contracts";
import { RemsSnapshot, remsQuantities, remsSource } from "./rems";
import { describeSource, explainQuantity } from "./sources";

const snap = {
  id: "D7", valueClass: "directly_measured",
  reading: { sol: 4995, terrestrialDate: "2026-08-25", ls_deg: 341, airTempMin_C: -71, airTempMax_C: -5, pressure_Pa: 777 },
  source: { title: "MSL REMS daily weather summary (CAB), via mars.nasa.gov", url: "https://mars.nasa.gov/x", retrievedAt: "2026-11-14T07:32:00Z",
    sha256: "a".repeat(64), disclaimer: "The information ... is intended for outreach purposes only." },
};

describe("D7 REMS snapshot", () => {
  it("accepts the pipeline's file and refuses one without a date or with a non-number reading", () => {
    expect(RemsSnapshot.safeParse(snap).success).toBe(true);
    expect(RemsSnapshot.safeParse({ ...snap, reading: { ...snap.reading, terrestrialDate: "" } }).success).toBe(false);
    expect(RemsSnapshot.safeParse({ ...snap, reading: { ...snap.reading, pressure_Pa: "777" } }).success).toBe(false);
  });

  it("turns each reading into a directly measured Quantity sourced to D7", () => {
    const q = remsQuantities(RemsSnapshot.parse(snap));
    for (const x of [q.airTempMin, q.airTempMax, q.pressure]) {
      expect(Quantity.safeParse(x).success).toBe(true);
      expect(x.valueClass).toBe("directly_measured");
      expect(x.sourceIds).toEqual(["D7"]);
    }
    expect([q.airTempMin.value, q.airTempMin.unit, q.pressure.value, q.pressure.unit]).toEqual([-71, "°C", 777, "Pa"]);
  });

  it("describes D7 with sol, date, rover-site caveat and the disclaimer, used by the sources panel", () => {
    const d = remsSource(RemsSnapshot.parse(snap));
    expect(d.id).toBe("D7");
    expect(d.detail).toMatch(/sol 4995 \(2026-08-25\)/);
    expect(d.detail).toMatch(/at the rover, not at the boxwork/);
    expect(d.detail).toMatch(/outreach purposes only/);
    expect(describeSource("D7", [], [d])).toEqual(d);
    const q = remsQuantities(RemsSnapshot.parse(snap)).pressure;
    expect(explainQuantity(q, [], [], [d]).sources[0]).toEqual(d);
  });
});
