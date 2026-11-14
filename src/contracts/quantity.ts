// SI-assisted: drafted with Claude Code (Anthropic); human contracts-owner review pending.
// Quantity contract, plan 19.9. Every number shown in the UI is one of these.
import { z } from "zod";

export const ValueClass = z.enum([
  "directly_measured",
  "published_observation",
  "model_derived",
  "estimated",
  "simulated",
  "assumed",
  "unknown",
]);
export type ValueClass = z.infer<typeof ValueClass>;

const finite = z.number().finite();
const id = z.string().min(1);

export const Quantity = z
  .object({
    value: finite.nullable(),
    low: finite.optional(),
    high: finite.optional(),
    unit: z.string().min(1),
    valueClass: ValueClass,
    methodId: id,
    assumptionIds: z.array(id),
    sourceIds: z.array(id).min(1),
  })
  .superRefine((q, ctx) => {
    const hasRange = q.low !== undefined || q.high !== undefined;
    if (q.valueClass === "unknown") {
      // Unknown stays unknown: never a silent default.
      if (q.value !== null) ctx.addIssue({ code: "custom", path: ["value"], message: "unknown must have value null" });
      if (hasRange) ctx.addIssue({ code: "custom", path: ["low"], message: "unknown must not carry a range" });
      return;
    }
    if (q.value === null) {
      ctx.addIssue({ code: "custom", path: ["value"], message: "only valueClass unknown may have a null value" });
      return;
    }
    if (q.valueClass === "estimated") {
      if (q.low === undefined || q.high === undefined)
        ctx.addIssue({ code: "custom", path: ["low"], message: "estimates are ranges: low and high required" });
      if (q.assumptionIds.length === 0)
        ctx.addIssue({ code: "custom", path: ["assumptionIds"], message: "estimates must list their assumptions" });
    }
    if (q.low !== undefined && q.low > q.value)
      ctx.addIssue({ code: "custom", path: ["low"], message: "low must not exceed value" });
    if (q.high !== undefined && q.high < q.value)
      ctx.addIssue({ code: "custom", path: ["high"], message: "high must not be below value" });
  });
export type Quantity = z.infer<typeof Quantity>;
