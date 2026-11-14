// SI-assisted: drafted with Claude Code (Claude Opus 5.5); human Route Engine review pending.
// Plan 6.2 / 6.4 / 6.5 leg metrics along an engine path, in seconds and metres (the UI shows SI minutes).
// distance_m is the sum of 3D edge lengths (plan 6.2: in-plane step plus height difference); horizontal_m is also
// given (L-01). heading_deg is the straight start-to-end bearing in F6, clockwise from grid north (L-02).
import { kForRatio, timeField, type Cell, type RouteGrid } from "./route";

export interface SpeedRange {
  readonly nominal_mps: number;   // routes the path (plan 6.4)
  readonly low_mps: number;       // slow bound -> high time; also the time-to-habitat field (plan 6.2)
  readonly high_mps: number;      // fast bound -> low time
  readonly kBins: readonly [number, number, number, number];
  readonly slopeLimit_deg: number;
}

export interface LegMetrics {
  readonly horizontal_m: number;
  readonly distance_m: number;
  readonly climb_m: number;
  readonly descent_m: number;
  readonly heading_deg: number;
  readonly time_s: { readonly low: number; readonly nominal: number; readonly high: number };
}

function checkSpeeds(s: SpeedRange): void {
  if (!(s.low_mps > 0 && s.low_mps <= s.nominal_mps && s.nominal_mps <= s.high_mps))
    throw new RangeError("speeds must be positive and in the order low <= nominal <= high");
}

export function legMetrics(g: RouteGrid, cells: readonly number[], s: SpeedRange): LegMetrics {
  checkSpeeds(s);
  if (cells.length < 2) throw new RangeError("a leg needs at least two cells");
  let horizontal = 0, distance = 0, climb = 0, descent = 0, unitTime = 0;
  for (let j = 1; j < cells.length; j++) {
    const a = cells[j - 1]!, b = cells[j]!;
    const dr = Math.abs(Math.floor(a / g.cols) - Math.floor(b / g.cols)), dc = Math.abs((a % g.cols) - (b % g.cols));
    if (Math.max(dr, dc) !== 1) throw new RangeError(`path is not connected between cells ${a} and ${b}`);
    const len = dr === 1 && dc === 1 ? g.cell_m * Math.SQRT2 : g.cell_m;
    const dz = g.elevation[b]! - g.elevation[a]!;
    const e = Math.sqrt(len * len + dz * dz);
    horizontal += len; distance += e;
    if (dz > 0) climb += dz; else descent -= dz;
    // Time at unit level speed; the three bounds differ only by the level speed.
    unitTime += e / kForRatio(Math.abs(dz) / len, s);
  }
  const first = cells[0]!, last = cells[cells.length - 1]!;
  const east = (last % g.cols) - (first % g.cols), north = Math.floor(first / g.cols) - Math.floor(last / g.cols);
  const heading = ((Math.atan2(east, north) * 180) / Math.PI + 360) % 360;
  return {
    horizontal_m: horizontal, distance_m: distance, climb_m: climb, descent_m: descent, heading_deg: heading,
    time_s: { low: unitTime / s.high_mps, nominal: unitTime / s.nominal_mps, high: unitTime / s.low_mps },
  };
}

/** Time from every cell to the habitat at the slow speed bound (plan 6.2 time-to-habitat). Infinity if unreachable. */
export function habitatField(g: RouteGrid, habitat: Cell, s: SpeedRange): Float64Array {
  checkSpeeds(s);
  return timeField(g, habitat, { vLevel_mps: s.low_mps, kBins: s.kBins, slopeLimit_deg: s.slopeLimit_deg });
}

