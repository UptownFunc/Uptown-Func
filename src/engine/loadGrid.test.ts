// SI-assisted: drafted with Claude Code (Claude Opus 5.5); human Route Engine review pending.
import { describe, expect, it } from "vitest";
import { loadPlannerGrid } from "./loadGrid";

const report = {
  rows: 2, cols: 2, cellSize_m: 2, origin: { f1: { lat: -4.815, lon: 137.39, h: 0 } },
  grids: [
    { name: "elevation", dtype: "uint16", path: "e.bin", noData: 65535, scale: 0.01, offset: -3000 },
    { name: "terrain_class", dtype: "uint8", path: "c.bin", noData: 0, scale: 1, offset: 0 },
  ],
};
function fakeFetch(files: Record<string, BodyInit | object>): typeof fetch {
  return (async (url: string) => {
    const key = Object.keys(files).find((k) => url.endsWith(k));
    if (!key) return new Response("", { status: 404 });
    const v = files[key]!;
    return new Response(v instanceof Uint8Array || v instanceof Uint16Array ? (v as unknown as BodyInit) : JSON.stringify(v));
  }) as unknown as typeof fetch;
}

describe("loadPlannerGrid", () => {
  it("decodes quantised elevation, keeps NoData unknown (NaN) and loads classes", async () => {
    const g = await loadPlannerGrid("area/", fakeFetch({
      "build_report.json": report, "e.bin": Uint16Array.of(0, 100, 65535, 50), "c.bin": Uint8Array.of(1, 1, 0, 2),
    }));
    expect(Array.from(g.elevation.slice(0, 2))).toEqual([-3000, -2999]);
    expect(Number.isNaN(g.elevation[2]!)).toBe(true);
    expect(Array.from(g.classes)).toEqual([1, 1, 0, 2]);
    expect([g.rows, g.cols, g.cell_m]).toEqual([2, 2, 2]);
  });

  it("refuses grid files of the wrong size", async () => {
    await expect(loadPlannerGrid("area/", fakeFetch({
      "build_report.json": report, "e.bin": Uint16Array.of(0, 1, 2), "c.bin": Uint8Array.of(1, 1, 1, 1),
    }))).rejects.toThrow(/2 x 2/);
  });

  it("reports a missing file with its URL", async () => {
    await expect(loadPlannerGrid("area/", fakeFetch({ "build_report.json": report }))).rejects.toThrow(/area\/e\.bin \(404\)/);
  });

  // AUD-01: a report without finite scale, offset or cell size would decode every height to NaN, and every leg would
  // then read "unreachable" with no error. The load is refused instead.
  it.each([
    ["scale", { ...report, grids: [{ ...report.grids[0]!, scale: undefined }, report.grids[1]] }],
    ["offset", { ...report, grids: [{ ...report.grids[0]!, offset: "x" }, report.grids[1]] }],
    ["cell size", { ...report, cellSize_m: 0 }],
  ])("refuses a build report with a bad %s", async (_what, bad) => {
    await expect(loadPlannerGrid("area/", fakeFetch({
      "build_report.json": bad, "e.bin": Uint16Array.of(0, 100, 65535, 50), "c.bin": Uint8Array.of(1, 1, 0, 2),
    }))).rejects.toThrow(/build_report/);
  });
});
