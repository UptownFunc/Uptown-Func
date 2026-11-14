// SI-assisted: drafted with Claude Code (Claude Opus 5.5); human Route Engine + Design review pending.
// Plan 6.6 planned and field return margins; AC-19 on the grid metric (route smoothing undecided, D-04).
import { describe, expect, it } from "vitest";
import { CLASS, routeAStar, type RouteGrid } from "./route";
import type { SpeedRange } from "./leg";
import { fieldMargins, marginState, plannedMarginProfile, type PlanTimes } from "./margin";

const close = (a: number, b: number, tol = 1e-9) => expect(Math.abs(a - b)).toBeLessThanOrEqual(tol);
const speeds: SpeedRange = { nominal_mps: 0.83, low_mps: 0.64, high_mps: 0.97, kBins: [1, 0.85, 0.7, 0.5], slopeLimit_deg: 20 };

function flat(rows: number, cols: number, z: (r: number, c: number) => number = () => 0): RouteGrid {
  const elevation = new Float64Array(rows * cols), classes = new Uint8Array(rows * cols).fill(CLASS.CANDIDATE);
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) elevation[r * cols + c] = z(r, c);
  return { rows, cols, cell_m: 2, elevation, classes };
}

describe("margin states (plan 6.6; 10% band Assumed)", () => {
  it("has exactly OK, NEAR_LIMIT and OVER, with the boundaries as specified", () => {
    expect(marginState(600, 6000)).toBe("OK");          // exactly 10% of T_EVA
    expect(marginState(599.999, 6000)).toBe("NEAR_LIMIT");
    expect(marginState(0, 6000)).toBe("NEAR_LIMIT");    // 0 is "from 0 to under 10%"
    expect(marginState(-0.001, 6000)).toBe("OVER");
  });
});

describe("planned margin profile", () => {
  const g = flat(1, 6);
  const times: PlanTimes = { tEva_s: 3600, tOps_s: 600, tCont_s: 300 };

  it("starts at T_EVA - t_ops - t_cont at the habitat and ends after the full plan", () => {
    // habitat at cell 0, one stop at cell 5 (5 minutes), back to the habitat.
    const legs = [[0, 1, 2, 3, 4, 5], [5, 4, 3, 2, 1, 0]];
    const p = plannedMarginProfile(g, legs, [300], times, speeds);
    close(p[0]!.margin_s, 3600 - 600 - 300);
    const walk = (10 * 2) / 0.64; // ten 2 m edges at the slow bound
    close(p[p.length - 1]!.margin_s, 3600 - (walk + 300 + 600 + 300));
  });

  it("gives a stop two values: arrival and departure", () => {
    const p = plannedMarginProfile(g, [[0, 1, 2], [2, 1, 0]], [300], times, speeds);
    const arrive = p.find((x) => x.kind === "arrive")!, depart = p.find((x) => x.kind === "depart")!;
    close(arrive.margin_s - depart.margin_s, 300);
    expect(arrive.cell).toBe(depart.cell);
  });

  it("is OVER before the first step when T_EVA - t_ops - t_cont is below zero", () => {
    const p = plannedMarginProfile(g, [[0, 1], [1, 0]], [0], { tEva_s: 500, tOps_s: 400, tCont_s: 200 }, speeds);
    expect(p[0]!.state).toBe("OVER");
  });

  it("refuses legs that do not chain or a stop list of the wrong length", () => {
    expect(() => plannedMarginProfile(g, [[0, 1], [2, 1]], [0], times, speeds)).toThrow(/chain/);
    expect(() => plannedMarginProfile(g, [[0, 1], [1, 0]], [], times, speeds)).toThrow(/stop/);
    expect(() => plannedMarginProfile(g, [[0, 1], [1, 2]], [0], times, speeds)).toThrow(/habitat/);
  });
});

function lcg(seed: number) { let s = seed >>> 0; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 2 ** 32); }

describe("AC-19 on the grid metric (property tests, 30 random grids)", () => {
  const nominal = { vLevel_mps: speeds.nominal_mps, kBins: speeds.kBins, slopeLimit_deg: speeds.slopeLimit_deg };
  for (let seed = 1; seed <= 30; seed++) {
    it(`seed ${seed}: margin never rises, lowest at the end, state never improves`, () => {
      const rnd = lcg(seed);
      const g = flat(20, 20, () => rnd() * 1.0);
      const pick = () => ({ r: Math.floor(rnd() * 20), c: Math.floor(rnd() * 20) });
      const H = pick(), A = pick(), B = pick();
      const legs = [routeAStar(g, H, A, nominal), routeAStar(g, A, B, nominal), routeAStar(g, B, H, nominal)];
      if (legs.some((l) => l === null || l.cells.length < 2)) return;
      const p = plannedMarginProfile(g, legs.map((l) => l!.cells), [rnd() * 900, rnd() * 900],
        { tEva_s: 7200, tOps_s: 900, tCont_s: 600 }, speeds);
      const rank = { OK: 0, NEAR_LIMIT: 1, OVER: 2 } as const;
      for (let i = 1; i < p.length; i++) {
        expect(p[i]!.margin_s).toBeLessThanOrEqual(p[i - 1]!.margin_s + 1e-9);
        expect(rank[p[i]!.state]).toBeGreaterThanOrEqual(rank[p[i - 1]!.state]);
      }
      close(Math.min(...p.map((x) => x.margin_s)), p[p.length - 1]!.margin_s);
    });
  }
});

describe("field margins (plan 6.6)", () => {
  it("with no ticks, the continue margin equals the planned end margin", () => {
    const g = flat(1, 6);
    const times: PlanTimes = { tEva_s: 3600, tOps_s: 600, tCont_s: 300 };
    const p = plannedMarginProfile(g, [[0, 1, 2, 3, 4, 5], [5, 4, 3, 2, 1, 0]], [300], times, speeds);
    const walk = (10 * 2) / 0.64;
    const f = fieldMargins({ elapsed_s: 0, planRemaining_s: walk + 300 + 600, returnNow_s: 0, opsRemaining_s: 600 }, times);
    close(f.continue_s, p[p.length - 1]!.margin_s);
  });

  it("return-now is never below continue when the return is part of the remaining plan", () => {
    const times: PlanTimes = { tEva_s: 3600, tOps_s: 600, tCont_s: 300 };
    const f = fieldMargins({ elapsed_s: 1200, planRemaining_s: 1500, returnNow_s: 700, opsRemaining_s: 400 }, times);
    expect(f.returnNow_s).toBeGreaterThanOrEqual(f.continue_s);
    close(f.continue_s, 3600 - (1200 + 1500 + 300));
    close(f.returnNow_s, 3600 - (1200 + 700 + 400 + 300));
  });
});
