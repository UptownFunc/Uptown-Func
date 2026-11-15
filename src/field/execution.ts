// SI-assisted: drafted with Claude Code (Claude Opus 5.5); human Route Engine + Design review pending.
// Field execution (plan 6.6, 7.5; CLAUDE.md): MissionExecution is written only here, from manual arrival/departure
// ticks, and never edits the MissionPlan. Field margins are estimates from manual entries, shown beside (never instead
// of) the planned margin. Walking uses the slow bound for the low end and the fast bound for the high end.
// F-01 (DECISIONS): plan 6.6 does not split t_ops into egress and ingress, so t_ops,remaining charges all of t_ops,
// the same conservative choice the planned margin makes.
import { MissionExecution, type MissionPlan, type Tick } from "../contracts";
import { TIME_LIMIT_MIN } from "../engine/assumptions";

export const ENTERED_BY = "field view (manual entry)";

/** C-17: the contract's fieldMargins numbers cannot be null, so before they can be computed they hold 0 with
 *  lastTickAt null or stale. The UI never displays them; it always shows fieldMarginRanges(), which stays unknown. */
export function newExecution(plan: MissionPlan): MissionExecution {
  return { planVersion: plan.versionHash, ticks: [], fieldMargins: { continue_min: 0, returnNow_min: 0, lastTickAt: null } };
}

/** Assumptions a field margin rests on: those of every leg time (k_v, slope limit), the plan times and the stops. */
export function fieldMarginAssumptionIds(plan: MissionPlan): string[] {
  return [...new Set([...plan.legs.flatMap((l) => l.time.assumptionIds ?? []), "A-T_EVA", "A-t_ops", "A-t_cont",
    ...plan.stops.flatMap((s) => s.duration.assumptionIds ?? [])])];
}

/** The next tick the plan expects, in order: arrive A, depart A, arrive B, ...; null after the last stop. */
export function nextEvent(plan: MissionPlan, e: MissionExecution): { stopId: string; kind: Tick["kind"] } | null {
  const k = e.ticks.length, stop = plan.stops[Math.floor(k / 2)];
  return stop ? { stopId: stop.id, kind: k % 2 === 0 ? "arrive" : "depart" } : null;
}

/** Records the next expected tick. Returns a new MissionExecution; the plan and the old execution are unchanged. */
export function addTick(plan: MissionPlan, e: MissionExecution, entry: { elapsed_min: number; enteredAt: string },
  stopReturn_s: Record<string, number> | null = null, speedRatio = 1): MissionExecution {
  if (e.planVersion !== plan.versionHash) throw new RangeError(`ticks belong to plan version ${e.planVersion}, not ${plan.versionHash}`);
  if (!Number.isFinite(entry.elapsed_min) || entry.elapsed_min < 0 || entry.elapsed_min > 2 * TIME_LIMIT_MIN) throw new RangeError(`elapsed time must be a finite, non-negative number of minutes, at most ${2 * TIME_LIMIT_MIN}`);
  // V-15: twice the longest plan time, so a crew over even the longest T_EVA can still record the overrun.
  const next = nextEvent(plan, e);
  if (!next) throw new RangeError("the plan has no further stops to tick");
  const last = e.ticks[e.ticks.length - 1];
  if (last && entry.elapsed_min < last.elapsed_min) throw new RangeError(`elapsed time ${entry.elapsed_min} min is earlier than the last tick (${last.elapsed_min} min)`);
  const tick: Tick = { ...next, elapsed_min: entry.elapsed_min, enteredBy: ENTERED_BY, enteredAt: entry.enteredAt };
  const out: MissionExecution = { ...e, ticks: [...e.ticks, tick] };
  // Stored values are the slow-bound (low) ends, in minutes, when they can be computed (see C-17 above).
  const m = fieldMarginRanges(plan, out, stopReturn_s, speedRatio);
  const stored = m ? { continue_min: m.continue_s.low / 60, returnNow_min: m.returnNow_s.low / 60 } : {};
  return MissionExecution.parse({ ...out, fieldMargins: { ...out.fieldMargins, ...stored, lastTickAt: tick.enteredAt } });
}

export interface Range { readonly low: number; readonly high: number }
export interface FieldMargins { readonly continue_s: Range; readonly returnNow_s: Range; readonly lastTick: Tick }

/**
 * Plan 6.6 field margins after the latest tick k, seconds:
 *   continue   = T_EVA - (e_k + t_plan(k -> end) + t_cont)
 *   return now = T_EVA - (e_k + t_return(k -> h) + t_ops,remaining + t_cont)
 * low uses the slow speed bound, high the fast one (speedRatio = v_low / v_high scales the slow return time).
 * Null while there is no tick or any input is unknown (never defaulted).
 */
export function fieldMarginRanges(plan: MissionPlan, e: MissionExecution, stopReturn_s: Record<string, number> | null,
  speedRatio: number): FieldMargins | null {
  const last = e.ticks[e.ticks.length - 1];
  if (!last || !stopReturn_s) return null;
  const a = (id: string) => plan.assumptions.find((x) => x.id === id)?.value;
  const tEva = a("A-T_EVA"), tOps = a("A-t_ops"), tCont = a("A-t_cont");
  if (tEva === undefined || tOps === undefined || tCont === undefined) return null;
  const j = plan.stops.findIndex((s) => s.id === last.stopId);
  const ret = stopReturn_s[last.stopId];
  if (j < 0 || ret === undefined || plan.legs.length !== plan.stops.length + 1) return null;
  const dur = plan.stops.map((s) => s.duration.value);
  if (dur.some((d) => d === null)) return null;
  let restSlow = last.kind === "arrive" ? dur[j]! : 0, restFast = restSlow;
  for (let i = j + 1; i < plan.legs.length; i++) {
    const t = plan.legs[i]!.time;
    if (t.low === undefined || t.high === undefined) return null;
    restSlow += t.high; restFast += t.low; // slow walking -> longer time (the range's high end)
    if (i < plan.stops.length) { restSlow += dur[i]!; restFast += dur[i]!; }
  }
  const eS = last.elapsed_min * 60;
  return {
    continue_s: { low: tEva - (eS + restSlow + tOps + tCont), high: tEva - (eS + restFast + tOps + tCont) },
    returnNow_s: { low: tEva - (eS + ret + tOps + tCont), high: tEva - (eS + ret * speedRatio + tOps + tCont) },
    lastTick: last,
  };
}
