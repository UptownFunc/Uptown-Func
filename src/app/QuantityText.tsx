// SI-assisted: drafted with Claude Code (Claude Opus 5.5); human Design review pending.
// One displayed Quantity (CLAUDE.md, AC-05): carries its value class and source ids in the DOM and opens its source
// on click (demo beat 5). Estimates render italic as "est. a to b"; unknown stays "unknown".
import type { Quantity } from "../contracts";
import { formatQuantity } from "./format";

export function QuantityText({ q, onOpen, label }: { q: Quantity; onOpen?: ((q: Quantity) => void) | undefined; label?: string }) {
  // Durations in SI minutes, angles to 0.1 deg, Mars time as a clock label (format.ts); unknown stays unknown.
  const f = formatQuantity(q);
  const cls = f.unknown ? "unknown" : f.estimated ? "est" : undefined;
  if (!onOpen) {
    return <span className={`qty-static${cls ? ` ${cls}` : ""}`} data-quantity="" data-value-class={q.valueClass} data-source-ids={q.sourceIds.join(" ")}
      title={`${q.valueClass.replace("_", " ")} · sources: ${q.sourceIds.join(", ")}`}>{f.text}</span>;
  }
  return (
    <button type="button" className={`qty${cls ? ` ${cls}` : ""}`} data-quantity="" data-value-class={q.valueClass}
      data-source-ids={q.sourceIds.join(" ")} title={`${q.valueClass.replace("_", " ")} · sources: ${q.sourceIds.join(", ")} · click for details`}
      aria-label={`${label ? `${label}: ` : ""}${f.text}, ${q.valueClass.replace("_", " ")}; show source`} onClick={() => onOpen(q)}>
      {f.text}
    </button>
  );
}
