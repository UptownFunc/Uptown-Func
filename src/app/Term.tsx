// SI-assisted: drafted with Claude Code (Claude Opus 5.5) on yujin/onboarding-terms (UX-22); human Design review pending.
// A variable's name that explains itself (UX-22): the name is a quiet key (dotted underline); pressing it opens its
// plain meaning on the line below, in place, so nothing floats over the map or is cut off by a scrolling panel.
// `Hint` is the always-visible one-line meaning used under form fields.
import { useId, useState, type ReactNode } from "react";
import { GLOSSARY, type TermKey } from "./glossary";

/** label: the words shown, when they differ from the glossary's term (for the accessible name). */
export function Term({ k, children, label }: { k: TermKey; children?: ReactNode; label?: string }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const e = GLOSSARY[k];
  // The name starts with the words shown (WCAG 2.5.3) and says what the key does; it never repeats a value's own name.
  const name = `${label ?? (typeof children === "string" ? children : e.term)}, what it means`;
  return (
    <>
      <button type="button" className="term" aria-label={name} aria-expanded={open} aria-controls={open ? id : undefined} title={open ? undefined : e.plain}
        onClick={(ev) => { ev.stopPropagation(); setOpen((o) => !o); }}>{children ?? e.term}</button>
      {open && <span id={id} className="term-def" role="note">{e.plain}</span>}
    </>
  );
}

/** Every term in one list, for the Sources drawer: the place to look a word up at any step. */
export function GlossaryList() {
  return (
    <details className="glossary" data-testid="glossary">
      <summary>Glossary: every term in plain words</summary>
      <dl>{(Object.keys(GLOSSARY) as TermKey[]).map((k) => <div key={k}><dt>{GLOSSARY[k].term}</dt><dd>{GLOSSARY[k].plain}</dd></div>)}</dl>
    </details>
  );
}

export function Hint({ k, id }: { k: TermKey; id?: string }) {
  return <span className="hint" id={id}>{GLOSSARY[k].plain}</span>;
}
