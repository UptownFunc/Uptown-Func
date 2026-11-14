// SI-assisted: drafted with Claude Code (Claude Opus 5.5); human Data and Science review pending.
import { describe, expect, it } from "vitest";
import { describeSource, explainQuantity } from "./sources";
import type { Assumption, Provenance, Quantity } from "../contracts";

const prov: Provenance[] = [{
  id: "D1", productId: "MSL_Gale_DEM_Mosaic_1m_v3", url: "https://example.org/d1.tif", licence: "credit authors", crs: "x",
  latitudeType: "planetocentric", longitudeDirection: "east", verticalReference: "unknown", resolution_m: 1,
  valueClass: "directly_measured", retrievedOn: "2026-11-14", sha256: "a".repeat(64),
}];
const assumptions: Assumption[] = [{ id: "A-kv", name: "Slope factors", value: 1, unit: "1", rationale: "K-01 placeholder", source: "team choice" }];

describe("source descriptions (UX-15: generated from provenance.json and the constants register)", () => {
  it("describes a dataset from its provenance record, including an unverified vertical reference", () => {
    const d = describeSource("D1", prov);
    expect(d.kind).toBe("dataset");
    expect(d.title).toContain("MSL_Gale_DEM_Mosaic_1m_v3");
    expect(d.detail).toContain("vertical reference unknown");
    expect(d.detail).toContain("credit authors");
  });

  it("says plainly when a dataset has no provenance record yet, instead of inventing one", () => {
    expect(describeSource("D2", prov)).toMatchObject({ kind: "missing", title: "D2" });
  });

  it("describes a constant from the register with its citation and page", () => {
    const d = describeSource("walkSpeedRange", prov);
    expect(d.kind).toBe("constant");
    expect(d.detail).toContain("NASA/TM-2010-216138");
    expect(d.detail).toContain("Table 4, p. 13");
  });

  it("names team choices and plan formulas", () => {
    expect(describeSource("team choice", prov).kind).toBe("team");
    expect(describeSource("plan-6.6", prov).kind).toBe("plan");
  });
});

describe("explainQuantity (demo beat 5: open one number's source)", () => {
  it("lists class, method, each source and each assumption with its rationale", () => {
    const q: Quantity = { value: 600, low: 500, high: 700, unit: "s", valueClass: "estimated", methodId: "engine:grid-path-6.4",
      assumptionIds: ["A-kv", "A-missing"], sourceIds: ["D1", "walkSpeedRange"] };
    const e = explainQuantity(q, prov, assumptions);
    expect(e.valueClass).toBe("estimated");
    expect(e.method).toBe("engine:grid-path-6.4");
    expect(e.sources.map((s) => s.kind)).toEqual(["dataset", "constant"]);
    expect(e.assumptions).toEqual([
      { id: "A-kv", text: "Slope factors = 1 (team choice): K-01 placeholder" },
      { id: "A-missing", text: "A-missing: not in this plan's assumption list" },
    ]);
  });
});
