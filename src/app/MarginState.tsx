// SI-assisted: drafted with Claude Code (Claude Opus 5.5); human Design review pending.
// Margin state as word + shape + colour (CLAUDE.md): OK / check (green), NEAR LIMIT / triangle (amber),
// OVER / octagon (red). There is no SAFE state.
import type { MarginState as State } from "../contracts";

const WORD: Record<State, string> = { OK: "OK", NEAR_LIMIT: "NEAR LIMIT", OVER: "OVER" };

function Shape({ state }: { state: State }) {
  if (state === "OK")
    return <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8.5l3.2 3.2L13 4.8" fill="none" stroke="currentColor" strokeWidth="2.4" /></svg>;
  if (state === "NEAR_LIMIT")
    return <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 1.5L15 14.5H1z" fill="currentColor" /></svg>;
  return <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M5.2 1h5.6L15 5.2v5.6L10.8 15H5.2L1 10.8V5.2z" fill="currentColor" /></svg>;
}

export function MarginState({ state }: { state: State }) {
  return (
    <span className={`state state-${state}`} data-testid="margin-state">
      <Shape state={state} />{WORD[state]}
    </span>
  );
}
