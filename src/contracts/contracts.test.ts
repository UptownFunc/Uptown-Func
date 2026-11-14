// SI-assisted: drafted with Claude Code (Anthropic); human contracts-owner review pending.
// Plan 19.9 contract list: Provenance, Grid, AreaManifest, Command, Assumption,
// MissionPlan, MissionExecution, mapState.
import { describe, expect, it } from "vitest";
import {
  AreaManifest,
  Assumption,
  Command,
  Grid,
  MapState,
  MarginState,
  MissionExecution,
  MissionPlan,
  Provenance,
} from "./index";

const ok = (schema: { safeParse: (v: unknown) => { success: boolean } }, v: unknown) =>
  schema.safeParse(v).success;

const sha = "a".repeat(64);

const provenance = {
  id: "D1",
  productId: "Gale DEM mosaic",
  url: "https://astrogeology.usgs.gov/",
  licence: "Public domain (USGS)",
  crs: "IAU_2015:49900",
  latitudeType: "planetocentric",
  longitudeDirection: "east",
  verticalReference: "unknown",
  resolution_m: 1,
  valueClass: "model_derived",
  retrievedOn: "2026-11-12",
  sha256: sha,
};

describe("Provenance", () => {
  it("accepts a D1 record with an unknown vertical reference", () => {
    expect(ok(Provenance, provenance)).toBe(true);
  });
  it("only accepts dataset ids D1 to D13", () => {
    expect(ok(Provenance, { ...provenance, id: "D13" })).toBe(true);
    expect(ok(Provenance, { ...provenance, id: "D14" })).toBe(false);
    expect(ok(Provenance, { ...provenance, id: "D0" })).toBe(false);
  });
  it("requires a 64-hex sha256", () => {
    expect(ok(Provenance, { ...provenance, sha256: "abc" })).toBe(false);
  });
  it("requires an ISO date for retrievedOn", () => {
    expect(ok(Provenance, { ...provenance, retrievedOn: "12 Nov" })).toBe(false);
  });
  it("rejects a non-positive resolution", () => {
    expect(ok(Provenance, { ...provenance, resolution_m: 0 })).toBe(false);
  });
  it("rejects an unrecognised latitude type", () => {
    expect(ok(Provenance, { ...provenance, latitudeType: "geodetic" })).toBe(false);
  });
});

const grid = {
  name: "slope",
  unit: "deg",
  dtype: "uint16",
  noData: 65535,
  scale: 0.01,
  offset: 0,
  valueClass: "model_derived",
  path: "data/area/slope.u16",
};

describe("Grid", () => {
  it("accepts a quantised slope grid", () => {
    expect(ok(Grid, grid)).toBe(true);
  });
  it("only accepts uint8, uint16 or float32", () => {
    expect(ok(Grid, { ...grid, dtype: "float32" })).toBe(true);
    expect(ok(Grid, { ...grid, dtype: "int32" })).toBe(false);
  });
});

const manifest = {
  areaId: "boxwork-a",
  origin: {
    f1: { lat: -4.815, lon: 137.39, h: -3500 },
    f5: { x: -2482000, y: 2302000, z: -285000 },
  },
  cellSize_m: 2,
  rows: 1500,
  cols: 1500,
  grids: ["slope", "height"],
  controlPoints: [{ id: "CP1", e_m: 0.4, n_m: -1.2, u_m: 3.1 }],
  rmsHorizontal_m: 1.3,
  maxHorizontal_m: 2.0,
  verticalBias_m: 3.1,
  provenanceIds: ["D1", "D2"],
};

describe("AreaManifest", () => {
  it("accepts a manifest for the 19.2 demo area", () => {
    expect(ok(AreaManifest, manifest)).toBe(true);
  });
  it("rejects a latitude outside -90..90 or longitude outside -180..180 (east-positive)", () => {
    expect(ok(AreaManifest, { ...manifest, origin: { ...manifest.origin, f1: { lat: -95, lon: 137, h: 0 } } })).toBe(false);
    expect(ok(AreaManifest, { ...manifest, origin: { ...manifest.origin, f1: { lat: -4.8, lon: 222.6, h: 0 } } })).toBe(false);
  });
  it("requires positive integer rows and cols", () => {
    expect(ok(AreaManifest, { ...manifest, rows: 0 })).toBe(false);
    expect(ok(AreaManifest, { ...manifest, cols: 1.5 })).toBe(false);
  });
  it("rejects negative residual magnitudes", () => {
    expect(ok(AreaManifest, { ...manifest, rmsHorizontal_m: -1 })).toBe(false);
  });
  it("only references provenance ids D1 to D13", () => {
    expect(ok(AreaManifest, { ...manifest, provenanceIds: ["D99"] })).toBe(false);
  });
});

describe("Command", () => {
  const cmd = {
    id: "c-1",
    type: "add_stop",
    payload: { f1: { lat: -4.81, lon: 137.39 } },
    issuedAt: "2026-11-14T02:00:00Z",
    planVersion: "v0",
  };
  it("accepts the six command types", () => {
    for (const type of ["add_stop", "move_stop", "delete_stop", "reorder_stops", "set_assumption", "recompute"]) {
      expect(ok(Command, { ...cmd, type })).toBe(true);
    }
  });
  it("rejects a command type that writes the plan directly", () => {
    expect(ok(Command, { ...cmd, type: "set_plan" })).toBe(false);
  });
  it("requires an ISO timestamp", () => {
    expect(ok(Command, { ...cmd, issuedAt: "yesterday" })).toBe(false);
  });
});

const assumption = {
  id: "A-teva",
  name: "Planned EVA duration T_EVA",
  value: 240,
  unit: "min",
  rationale: "Team scenario input",
  source: "team choice",
};

describe("Assumption", () => {
  it("accepts a team-choice assumption", () => {
    expect(ok(Assumption, assumption)).toBe(true);
  });
  it("accepts a provenance id as the source", () => {
    expect(ok(Assumption, { ...assumption, source: "D1" })).toBe(true);
  });
  it("rejects any other source text", () => {
    expect(ok(Assumption, { ...assumption, source: "the internet" })).toBe(false);
  });
});

const minutes = (v: number) => ({
  value: v,
  low: v - 2,
  high: v + 3,
  unit: "min",
  valueClass: "estimated",
  methodId: "leg-time-range",
  assumptionIds: ["A-speed-range"],
  sourceIds: ["NASA/TM-2010-216138"],
});

const plan = {
  planId: "demo",
  versionHash: "sha256:" + sha,
  engineVersion: "0.0.0",
  constantsVersion: "0.0.0",
  assumptions: [assumption],
  stops: [{ id: "S1", letter: "A", f1: { lat: -4.81, lon: 137.39 }, name: "Ridge", duration: minutes(20), tasks: ["image"] }],
  legs: [{ fromId: "HAB", toId: "S1", heading_deg: 180, distance_m: 1500, climb_m: 40, time: minutes(32) }],
  plannedMargins: [{ s_m: 0, margin_min: 120, state: "OK" }],
  endMargin: minutes(60),
  terrainClassSummary: { routable: 0.9, unknown: 0.1 },
  provenanceIds: ["D1"],
};

describe("MarginState", () => {
  it("has exactly OK, NEAR_LIMIT and OVER; never SAFE", () => {
    expect(MarginState.options).toEqual(["OK", "NEAR_LIMIT", "OVER"]);
    expect(MarginState.safeParse("SAFE").success).toBe(false);
  });
});

describe("MissionPlan", () => {
  it("accepts a one-stop plan", () => {
    expect(ok(MissionPlan, plan)).toBe(true);
  });
  it("rejects a heading outside 0..360", () => {
    expect(ok(MissionPlan, { ...plan, legs: [{ ...plan.legs[0], heading_deg: 361 }] })).toBe(false);
  });
  it("rejects a negative leg distance", () => {
    expect(ok(MissionPlan, { ...plan, legs: [{ ...plan.legs[0], distance_m: -1 }] })).toBe(false);
  });
  it("rejects a stop duration that is not a valid Quantity", () => {
    expect(ok(MissionPlan, { ...plan, stops: [{ ...plan.stops[0], duration: { value: 20 } }] })).toBe(false);
  });
  it("rejects a SAFE margin state", () => {
    expect(ok(MissionPlan, { ...plan, plannedMargins: [{ s_m: 0, margin_min: 120, state: "SAFE" }] })).toBe(false);
  });
});

describe("MissionExecution", () => {
  const exec = {
    planVersion: plan.versionHash,
    ticks: [{ stopId: "S1", kind: "arrive", elapsed_min: 35, enteredBy: "EV1", enteredAt: "2026-11-14T03:00:00Z" }],
    fieldMargins: { continue_min: 50, returnNow_min: 80, lastTickAt: "2026-11-14T03:00:00Z" },
  };
  it("accepts a manual arrival tick", () => {
    expect(ok(MissionExecution, exec)).toBe(true);
  });
  it("allows no ticks yet, with lastTickAt null", () => {
    expect(ok(MissionExecution, { ...exec, ticks: [], fieldMargins: { ...exec.fieldMargins, lastTickAt: null } })).toBe(true);
  });
  it("only accepts arrive or depart ticks", () => {
    expect(ok(MissionExecution, { ...exec, ticks: [{ ...exec.ticks[0], kind: "skip" }] })).toBe(false);
  });
  it("rejects negative elapsed time", () => {
    expect(ok(MissionExecution, { ...exec, ticks: [{ ...exec.ticks[0], elapsed_min: -1 }] })).toBe(false);
  });
});

describe("MapState", () => {
  const map = {
    viewMode: "2D",
    centerF1: { lat: -4.815, lon: 137.39 },
    groundWidth_m: 3000,
    bearing_deg: 0,
    scaleLevel: "AREA",
    selectedId: null,
    scrub_s_m: null,
    layers: { slope: { on: true, opacity: 0.8 } },
  };
  it("accepts the AREA 2D state", () => {
    expect(ok(MapState, map)).toBe(true);
  });
  it("only accepts PLANET, GALE, AREA, SITE", () => {
    expect(ok(MapState, { ...map, scaleLevel: "REGION" })).toBe(false);
  });
  it("rejects layer opacity outside 0..1", () => {
    expect(ok(MapState, { ...map, layers: { slope: { on: true, opacity: 1.5 } } })).toBe(false);
  });
});
