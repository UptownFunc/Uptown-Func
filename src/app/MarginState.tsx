// SI-assisted: drafted with Claude Code (Claude Opus 5.5); Lucide shapes on design/sharpwalk-ui-ux; human Design review pending.
// Margin state as word + shape + colour (CLAUDE.md): OK / check (green), NEAR LIMIT / triangle (amber),
// OVER / octagon (red). There is no SAFE state.
import { CircleCheck, OctagonAlert, TriangleAlert } from "lucide-react";
import type { MarginState as State } from "../contracts";

const WORD: Record<State, string> = { OK: "OK", NEAR_LIMIT: "NEAR LIMIT", OVER: "OVER" };
const SHAPE = { OK: CircleCheck, NEAR_LIMIT: TriangleAlert, OVER: OctagonAlert } as const;

export function MarginState({ state }: { state: State }) {
  const Shape = SHAPE[state];
  return (
    <span className={`state state-${state}`} data-testid="margin-state">
      <Shape size={16} strokeWidth={2} aria-hidden="true" />{WORD[state]}
    </span>
  );
}
