# SI-assisted: drafted with Claude Code (Claude Opus 5.5); human Data and Science review pending.
"""AC-08 rover-path consistency check (plan 11 AC-08, 19.11 weakness 64), from D5 (NASA/JPL MMGIS Curiosity traverse).

The share of Curiosity path cells that our slope screen classes as excluded, over the cells the screen gave a verdict for
(unknown cells are reported apart, never counted as passable); pass at <= 5 % (Assumed). A sanity check, not ground truth:
rover drivers avoid steep ground, so the slope distribution along the path is reported as well. D5 positions are
planetocentric, east-positive lon/lat on the 3,396,190 m sphere (plan 5.2); they go through geo.f1_surface_to_f6
(F1 -> F5 -> F6), and every cell the path line enters is counted (exact grid traversal). D5 localisation error is
UNVERIFIED (plan O-17).
"""
import math

import numpy as np
from rasterio.crs import CRS
from rasterio.warp import transform as rio_transform

from .display import F7_CRS
from .geo import R_F1
from .grids import CLASS_EXCLUDED, CLASS_UNKNOWN

EXCLUDED_SHARE_MAX = 0.05  # Assumed (plan AC-08)
# Upper-inclusive bins, like the screen: a slope of exactly 20 deg is passable (grids.classify_terrain excludes > limit).
SLOPE_BINS = [(0, 5), (5, 10), (10, 15), (15, 20), (20, 25), (25, 30), (30, math.inf)]
_SPHERE = CRS.from_proj4(f"+proj=longlat +R={R_F1:.0f} +no_defs")


def to_f7(lon, lat):
    """D5 lon/lat to the app's F7 display CRS (display.F7_CRS), for the frame check against MMGIS easting/northing."""
    x, y = rio_transform(_SPHERE, F7_CRS, list(np.asarray(lon, float)), list(np.asarray(lat, float)))
    return np.asarray(x), np.asarray(y)


def _segment_cells(c0: float, r0: float, c1: float, r1: float):
    """Every cell a segment enters, in order (Amanatides-Woo traversal in fractional col/row units)."""
    x, y, ex, ey = math.floor(c0), math.floor(r0), math.floor(c1), math.floor(r1)
    dx, dy = c1 - c0, r1 - r0
    sx, sy = (1 if dx > 0 else -1), (1 if dy > 0 else -1)
    tmx = ((x + (sx > 0)) - c0) / dx if dx else math.inf
    tmy = ((y + (sy > 0)) - r0) / dy if dy else math.inf
    tdx, tdy = (abs(1 / dx) if dx else math.inf), (abs(1 / dy) if dy else math.inf)
    out = [(y, x)]
    for _ in range(abs(ex - x) + abs(ey - y)):
        if tmx < tmy:
            x, tmx = x + sx, tmx + tdx
        else:
            y, tmy = y + sy, tmy + tdy
        out.append((y, x))
    return out


def polyline_cells(xy: np.ndarray, t, rows: int, cols: int) -> list[tuple[int, int]]:
    """Distinct (row, col) cells a polyline in the plane of affine t enters, in first-visit order, inside the grid."""
    inv = ~t
    cr = [inv @ (float(x), float(y)) for x, y in xy]
    seen, out = set(), []
    steps = zip(cr[:-1], cr[1:]) if len(cr) > 1 else [(cr[0], cr[0])]
    for (c0, r0), (c1, r1) in steps:
        for r, c in _segment_cells(c0, r0, c1, r1):
            if 0 <= r < rows and 0 <= c < cols and (r, c) not in seen:
                seen.add((r, c))
                out.append((r, c))
    return out


def ac08_summary(cells, classes: np.ndarray, slope_deg: np.ndarray) -> dict:
    rows = np.array([r for r, _ in cells], dtype=int)
    cols = np.array([c for _, c in cells], dtype=int)
    k, s = classes[rows, cols], slope_deg[rows, cols].astype(float)
    hist = {}
    for lo, hi in SLOPE_BINS:
        inbin = ((s >= lo) if lo == 0 else (s > lo)) & (s <= hi)
        hist[f">{lo}" if hi == math.inf else f"{lo}-{hi}"] = int(inbin.sum())
    hist["unknown"] = int(np.isnan(s).sum())
    excluded, unknown = int((k == CLASS_EXCLUDED).sum()), int((k == CLASS_UNKNOWN).sum())
    known = len(cells) - unknown
    share = excluded / known if known else float("nan")
    finite = np.isfinite(s).any()
    return {"cells": len(cells), "knownCells": known, "excluded": excluded, "unknown": unknown,
            "excludedShare": share, "unknownShare": unknown / len(cells) if cells else float("nan"),
            "threshold": EXCLUDED_SHARE_MAX, "pass": bool(share <= EXCLUDED_SHARE_MAX), "slopeHistogram": hist,
            "slopeMax_deg": float(np.nanmax(s)) if finite else None, "slopeMedian_deg": float(np.nanmedian(s)) if finite else None}
