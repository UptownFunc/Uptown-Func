// SI-assisted: drafted with Claude Code (Anthropic); human contracts-owner review pending.
// Contracts from plan 19.9. Units: metres, degrees, SI minutes; coordinates in F1
// (planetocentric latitude, east-positive longitude, sphere R = 3,396,190 m) unless named.
import { z } from "zod";
import { Quantity, ValueClass } from "./quantity";

const id = z.string().min(1);
const finite = z.number().finite();
const nonNeg = finite.nonnegative();
const isoTime = z.iso.datetime({ offset: true });

/** Dataset ids D1 to D13 (plan section 5). */
export const ProvenanceId = z.string().regex(/^D(?:[1-9]|1[0-3])$/, "dataset id must be D1 to D13");
export type ProvenanceId = z.infer<typeof ProvenanceId>;

export const LatLonF1 = z.object({
  lat: finite.min(-90).max(90),
  lon: finite.min(-180).max(180),
});
export type LatLonF1 = z.infer<typeof LatLonF1>;

export const PointF1 = LatLonF1.extend({ h: finite });
export type PointF1 = z.infer<typeof PointF1>;

export const PointF5 = z.object({ x: finite, y: finite, z: finite });
export type PointF5 = z.infer<typeof PointF5>;

export const Provenance = z.object({
  id: ProvenanceId,
  productId: id,
  url: z.url(),
  licence: id,
  crs: id,
  latitudeType: z.enum(["planetocentric", "planetographic"]),
  longitudeDirection: z.enum(["east", "west"]),
  verticalReference: id, // "unknown" until verified (D-05 / O-02)
  resolution_m: finite.positive(),
  valueClass: ValueClass,
  retrievedOn: z.iso.date(),
  sha256: z.string().regex(/^[0-9a-f]{64}$/, "sha256 must be 64 lowercase hex characters"),
});
export type Provenance = z.infer<typeof Provenance>;

export const Grid = z.object({
  name: id,
  unit: id,
  dtype: z.enum(["uint8", "uint16", "float32"]),
  noData: finite,
  scale: finite,
  offset: finite,
  valueClass: ValueClass,
  path: id,
});
export type Grid = z.infer<typeof Grid>;

export const ControlPointResidual = z.object({ id, e_m: finite, n_m: finite, u_m: finite });
export type ControlPointResidual = z.infer<typeof ControlPointResidual>;

export const AreaManifest = z.object({
  areaId: id,
  origin: z.object({ f1: PointF1, f5: PointF5 }),
  cellSize_m: finite.positive(),
  rows: z.number().int().positive(),
  cols: z.number().int().positive(),
  grids: z.array(id),
  controlPoints: z.array(ControlPointResidual),
  rmsHorizontal_m: nonNeg,
  maxHorizontal_m: nonNeg,
  verticalBias_m: finite,
  provenanceIds: z.array(ProvenanceId),
});
export type AreaManifest = z.infer<typeof AreaManifest>;

export const CommandType = z.enum([
  "add_stop",
  "move_stop",
  "delete_stop",
  "reorder_stops",
  "set_assumption",
  "recompute",
  // C-19 (DECISIONS): renames a stop and sets its tasks for the briefing card; payload { stopId, name?, tasks? }.
  "edit_stop",
]);
export type CommandType = z.infer<typeof CommandType>;

/** Payload shapes per command type are not fixed in 19.9; the route engine owner defines them. */
export const Command = z.object({
  id,
  type: CommandType,
  payload: z.record(z.string(), z.unknown()),
  issuedAt: isoTime,
  planVersion: id,
});
export type Command = z.infer<typeof Command>;

export const Assumption = z.object({
  id,
  name: id,
  value: finite,
  unit: id,
  rationale: id,
  source: z.union([ProvenanceId, z.literal("team choice")]),
});
export type Assumption = z.infer<typeof Assumption>;

/** Margin bands (6.6): OK >= 10% of T_EVA, NEAR_LIMIT 0-10%, OVER < 0. There is no SAFE state. */
export const MarginState = z.enum(["OK", "NEAR_LIMIT", "OVER"]);
export type MarginState = z.infer<typeof MarginState>;

export const Stop = z.object({
  id,
  letter: id,
  f1: LatLonF1,
  name: id,
  duration: Quantity,
  tasks: z.array(id),
});
export type Stop = z.infer<typeof Stop>;

export const Leg = z.object({
  fromId: id,
  toId: id,
  heading_deg: finite.min(0).max(360),
  distance_m: nonNeg,
  climb_m: finite,
  time: Quantity,
});
export type Leg = z.infer<typeof Leg>;

export const PlannedMargin = z.object({ s_m: nonNeg, margin_min: finite, state: MarginState });
export type PlannedMargin = z.infer<typeof PlannedMargin>;

/** Written only by the engine. */
export const MissionPlan = z.object({
  planId: id,
  versionHash: id,
  engineVersion: id,
  constantsVersion: id,
  assumptions: z.array(Assumption),
  stops: z.array(Stop),
  legs: z.array(Leg),
  plannedMargins: z.array(PlannedMargin),
  endMargin: Quantity,
  // Shape not fixed in 19.9: terrain class -> share of route length (0..1). To agree at G0.
  terrainClassSummary: z.record(z.string(), finite.min(0).max(1)),
  provenanceIds: z.array(ProvenanceId),
});
export type MissionPlan = z.infer<typeof MissionPlan>;

export const Tick = z.object({
  stopId: id,
  kind: z.enum(["arrive", "depart"]),
  elapsed_min: nonNeg,
  enteredBy: id,
  enteredAt: isoTime,
});
export type Tick = z.infer<typeof Tick>;

/** Written only by the field view. Field margins come from manual entries. */
export const MissionExecution = z.object({
  planVersion: id,
  ticks: z.array(Tick),
  fieldMargins: z.object({
    continue_min: finite,
    returnNow_min: finite,
    lastTickAt: isoTime.nullable(),
  }),
});
export type MissionExecution = z.infer<typeof MissionExecution>;

export const MapState = z.object({
  viewMode: z.enum(["2D", "3D"]),
  centerF1: LatLonF1,
  groundWidth_m: finite.positive(),
  bearing_deg: finite.min(0).max(360),
  scaleLevel: z.enum(["PLANET", "GALE", "AREA", "SITE"]),
  selectedId: id.nullable(),
  scrub_s_m: nonNeg.nullable(),
  layers: z.record(z.string(), z.object({ on: z.boolean(), opacity: finite.min(0).max(1) })),
});
export type MapState = z.infer<typeof MapState>;
