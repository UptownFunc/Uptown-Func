// SI-assisted: drafted with Claude Code (Claude Opus 5.5); human Design review pending.
// Plan 9.2 terrain symbols, drawn in screen pixels (plan 7.8: "symbols and line weights are fixed in screen pixels").
// The hatch used to be baked into a 1 m ground-pixel PNG and aliased at coarse zoom (2.6 part 1 note); now the
// pipeline ships one mask per symbol and the sheet fills each mask with its pattern at a fixed screen spacing.
// Colours are the plan 9.1/9.2 tokens; spacing (6 px hatch, 4 px stipple) is unchanged from the baked version.
// Static: nothing here animates, so reduced-motion users see the same image.

export type SymbolKind = "steep" | "excluded" | "unknown";

export const SYMBOLS: Record<SymbolKind, { colour: string; period: number; label: string }> = {
  steep: { colour: "#e8b341", period: 6, label: "amber diagonal hatch: slope 15-20 deg, steep but allowed" },   // plan 9.2
  excluded: { colour: "#aeb5b3", period: 6, label: "neutral cross-hatch: excluded (slope over 20 deg)" },       // plan 9.2
  unknown: { colour: "#e8e1d5", period: 4, label: "stipple: unknown or low confidence" },                       // plan 9.1
};

const mod = (v: number, m: number) => ((v % m) + m) % m;

/** Ink cells of one tile, in CSS pixels, origin at the tile's top-left. */
export function tileInk(kind: SymbolKind): [number, number][] {
  const p = SYMBOLS[kind].period, out: [number, number][] = [];
  for (let y = 0; y < p; y++) for (let x = 0; x < p; x++) {
    const diag = mod(x + y, p) === 0, anti = mod(x - y, p) === 0;
    if (kind === "steep" ? diag : kind === "excluded" ? diag || anti : x === 0 && y === 0) out.push([x, y]);
  }
  return out;
}

/** Device-pixel phase of the pattern lattice for a render of `extent` (F7) at `resolution` (F7 m per CSS px): the canvas
 *  position of the F7 origin, reduced mod the tile size. Anchored to the ground, so a pan moves the hatch with it. */
export function patternPhase(extent: readonly number[], resolution: number, pixelRatio: number, period: number): { x: number; y: number } {
  const r = resolution / pixelRatio, P = period * pixelRatio;
  return { x: mod(Math.round(-extent[0]! / r), P), y: mod(Math.round(extent[3]! / r), P) };
}

/** Where a mask covering `maskExtent` (F7) lands on a canvas rendering `extent`, in device pixels. */
export function maskRect(maskExtent: readonly number[], extent: readonly number[], resolution: number, pixelRatio: number) {
  const r = resolution / pixelRatio;
  return { x: (maskExtent[0]! - extent[0]!) / r, y: (extent[3]! - maskExtent[3]!) / r,
    w: (maskExtent[2]! - maskExtent[0]!) / r, h: (maskExtent[3]! - maskExtent[1]!) / r };
}
