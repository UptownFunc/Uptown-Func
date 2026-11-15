// SI-assisted: drafted with Claude Code (Claude Opus 5.5) (FLOW-01).
import { describe, expect, it } from "vitest";
import type { PlanOutput } from "../engine/planner";
import { infeasible } from "./feasible";

const out = (state: string | null, unreachable: { fromId: string; toId: string }[] = []) => ({
  plan: { stops: [{ id: "S1", letter: "A" }, { id: "S2", letter: "B" }], plannedMargins: state ? [{ state }] : [] },
  geometry: { unreachable },
}) as unknown as PlanOutput;

describe("infeasible (FLOW-01)", () => {
  it("is null for an OK or NEAR LIMIT plan, and while the margin is not known yet", () => {
    expect(infeasible(out("OK"))).toBeNull();
    expect(infeasible(out("NEAR_LIMIT"))).toBeNull();
    expect(infeasible(out(null))).toBeNull();
  });
  it("names the reason: an OVER margin, or a stop the route cannot reach (that one first)", () => {
    expect(infeasible(out("OVER"))).toBe("the walk overruns the EVA at the slow speed");
    expect(infeasible(out("OVER", [{ fromId: "S1", toId: "S2" }]))).toBe("stop B cannot be reached on slope-screened ground");
    expect(infeasible(out(null, [{ fromId: "S2", toId: "habitat" }]))).toBe("stop B cannot be reached on slope-screened ground");
  });
});
