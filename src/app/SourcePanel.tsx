// SI-assisted: drafted with Claude Code (Claude Opus 5.5); human Design + Data and Science review pending.
// Sources panel (UX-15, demo beat 5): the selected number's class, method, sources and assumptions, and every dataset
// used in the current view, all generated from provenance.json, the constants register and the plan.
import type { Assumption, Provenance, Quantity } from "../contracts";
import { formatQuantity } from "./format";
import { describeSource, explainQuantity, type SourceDescription } from "./sources";

export interface SourcePanelProps {
  readonly selected: Quantity | null;
  readonly provenance: readonly Provenance[];
  readonly assumptions: readonly Assumption[];
  readonly datasetsInView: readonly string[];
  /** Descriptions from pipeline outputs with their own records (D7 REMS snapshot). */
  readonly extraSources?: readonly SourceDescription[];
  readonly onClose: () => void;
}

export function SourcePanel({ selected, provenance, assumptions, datasetsInView, extraSources = [], onClose }: SourcePanelProps) {
  const e = selected ? explainQuantity(selected, provenance, assumptions, extraSources) : null;
  return (
    <section className="sources" aria-label="Sources" data-testid="source-panel">
      <h2>Sources {selected && <button type="button" className="link" onClick={onClose}>close</button>}</h2>
      {selected && e && (
        <div data-testid="source-detail">
          <p><strong>{formatQuantity(selected).text}</strong> · {e.valueClass.replace("_", " ")} · method {e.method}</p>
          <ul className="small">{e.sources.map((s) => <li key={s.id}><strong>{s.title}</strong>{s.detail && ` - ${s.detail}`}</li>)}</ul>
          {e.assumptions.length > 0 && <>
            <p className="small"><strong>Assumptions</strong></p>
            <ul className="small">{e.assumptions.map((a) => <li key={a.id}>{a.text}</li>)}</ul>
          </>}
        </div>
      )}
      <p className="small"><strong>Datasets in this view</strong></p>
      <ul className="small" data-testid="datasets-in-view">
        {datasetsInView.map((id) => { const d = describeSource(id, provenance, extraSources); return <li key={id}><strong>{d.title}</strong> - {d.detail}</li>; })}
      </ul>
    </section>
  );
}
