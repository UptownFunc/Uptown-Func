// SI-assisted: drafted with Claude Code (Claude Opus 5.5); human Design review pending.
// Stop positions on the elevation profile: each stop is searched for after the previous one, so a stop whose cell the
// walk passed earlier is drawn at its own visit (R-15 review finding 4).
export function stopProfilePositions(prof: readonly { cell: number; s_m: number }[], stopCells: readonly (number | undefined)[]): (number | null)[] {
  let from = 0;
  return stopCells.map((cell) => {
    const i = cell === undefined ? -1 : prof.findIndex((p, k) => k >= from && p.cell === cell);
    if (i < 0) return null;
    from = i + 1;
    return prof[i]!.s_m;
  });
}
