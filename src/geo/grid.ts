// SI-assisted: drafted with Claude Code (Claude Opus 5.5); human Data and Science review pending.
// Grid cells <-> F1 through F5 and F6 (plan 7.3). The F6 grid was warped with +proj=ortho on the bare F1 sphere
// (pipeline 1.2), so positions use h = 0 for the point and the origin; that is exactly the pipeline's projection.
// Row 0 is the north edge, column 0 the west edge; the origin is the centre of the grid.
import { f1, f1ToF5, f5ToF1, f5ToF6, f6ToF5, localFrame, type F1Point, type F6Point, type LocalFrame } from "./index";

export interface GridDef { readonly origin: F1Point; readonly rows: number; readonly cols: number; readonly cell_m: number }
export interface GridCell { readonly r: number; readonly c: number }

const frameCache = new WeakMap<GridDef, LocalFrame>();
/** The grid's own F6 frame (origin on the bare sphere, h = 0), cached per grid object. */
export function gridFrameOf(g: GridDef): LocalFrame {
  let fr = frameCache.get(g);
  if (!fr) { fr = localFrame(f1(g.origin.lat, g.origin.lon, 0)); frameCache.set(g, fr); }
  return fr;
}

/** The cell containing a point given in the grid's own F6 frame (gridFrameOf), or null outside the grid. */
export function enuToCell(enu: F6Point, g: GridDef): GridCell | null {
  const c = Math.floor((enu.e + (g.cols * g.cell_m) / 2) / g.cell_m);
  const r = Math.floor(((g.rows * g.cell_m) / 2 - enu.n) / g.cell_m);
  return r >= 0 && c >= 0 && r < g.rows && c < g.cols ? { r, c } : null;
}

/** The cell containing an F1 position (height ignored), or null outside the grid. */
export function f1ToCell(p: F1Point, g: GridDef): GridCell | null {
  return enuToCell(f5ToF6(f1ToF5(f1(p.lat, p.lon, 0)), gridFrameOf(g)), g);
}

/** F1 position (h = 0 on the sphere) of a cell centre. */
export function cellCentreF1(cell: GridCell, g: GridDef): F1Point {
  const e = (cell.c + 0.5) * g.cell_m - (g.cols * g.cell_m) / 2;
  const n = (g.rows * g.cell_m) / 2 - (cell.r + 0.5) * g.cell_m;
  // The ortho plane is tangent at the origin: project the plane point back onto the sphere along the up axis.
  const fr = gridFrameOf(g);
  const R = Math.hypot(fr.originF5.x, fr.originF5.y, fr.originF5.z);
  const u = Math.sqrt(R * R - e * e - n * n) - R;
  const p = f5ToF1(f6ToF5({ frame: "F6", e, n, u }, fr));
  return f1(p.lat, p.lon, 0);
}
