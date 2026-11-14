# SI-assisted: drafted with Claude Code (Claude Opus 5.5); human Data and Science review pending.
"""AC-08 rover-path consistency check (plan 11 AC-08, 19.11 weakness 64), from D5 (NASA/JPL MMGIS Curiosity traverse).

The share of Curiosity path cells that our slope screen classes as excluded; pass at <= 5 % (Assumed threshold). It is a
sanity check, not human ground truth: rover drivers avoid steep ground, so the slope distribution along the path is
reported as well. D5 positions are planetocentric, east-positive lon/lat on the 3,396,190 m sphere (plan 5.2 D5 row);
they are mapped into the grids' own +proj=ortho CRS on that sphere (as warp.py builds the grids), then to cells.
Localisation error of D5 is UNVERIFIED (plan O-17), and the path is a line, so a cell is "on the path" if the line
passes through it (densified at 0.5 m on 2 m cells).
"""
import math

import numpy as np
from rasterio.crs import CRS
from rasterio.warp import transform as warp_transform

from .geo import R_F1, ortho_crs
from .grids import CLASS_EXCLUDED, CLASS_UNKNOWN

EXCLUDED_SHARE_MAX = 0.05  # Assumed (plan AC-08)
SLOPE_BINS = [(0, 5), (5, 10), (10, 15), (15, 20), (20, 25), (25, 30), (30, math.inf)]
_SPHERE = CRS.from_proj4(f"+proj=longlat +R={R_F1:.0f} +no_defs")


def lonlat_to_f6(lon, lat, lat0: float, lon0: float):
    """D5 lon/lat (degrees, F1 sphere) to the F6 grid plane (+proj=ortho about the area origin), metres."""
    x, y = warp_transform(_SPHERE, ortho_crs(lat0, lon0), list(np.asarray(lon, float)), list(np.asarray(lat, float)))
    return np.asarray(x), np.asarray(y)


def equirect_xy(lon: float, lat: float) -> tuple[float, float]:
    """The D1/D2 equirectangular plane (standard parallel 0) on the F1 sphere: the F7 display frame."""
    return R_F1 * math.radians(lon), R_F1 * math.radians(lat)


def densify(xy: np.ndarray, step_m: float) -> np.ndarray:
    """Points along a polyline no more than step_m apart, keeping every vertex."""
    out = [xy[0]]
    for a, b in zip(xy[:-1], xy[1:]):
        n = max(1, math.ceil(float(np.hypot(*(b - a))) / step_m))
        t = np.arange(1, n + 1)[:, None] / n
        out.extend(a + t * (b - a))
    return np.asarray(out)


def cells_on_path(xy: np.ndarray, t, n: int) -> list[tuple[int, int]]:
    """Distinct (row, col) cells of an n x n grid with affine t that the points fall in, in first-visit order."""
    inv = ~t
    seen, out = set(), []
    for x, y in xy:
        c, r = inv @ (float(x), float(y))
        r, c = math.floor(r), math.floor(c)
        if 0 <= r < n and 0 <= c < n and (r, c) not in seen:
            seen.add((r, c))
            out.append((r, c))
    return out


def ac08_summary(cells, classes: np.ndarray, slope_deg: np.ndarray) -> dict:
    rows = np.array([r for r, _ in cells], dtype=int)
    cols = np.array([c for _, c in cells], dtype=int)
    k, s = classes[rows, cols], slope_deg[rows, cols].astype(float)
    hist = {(f">{lo}" if hi == math.inf else f"{lo}-{hi}"): int(((s >= lo) & (s < hi)).sum()) for lo, hi in SLOPE_BINS}
    hist["unknown"] = int(np.isnan(s).sum())
    excluded = int((k == CLASS_EXCLUDED).sum())
    share = excluded / len(cells) if cells else float("nan")
    return {"cells": len(cells), "excluded": excluded, "unknown": int((k == CLASS_UNKNOWN).sum()),
            "excludedShare": share, "threshold": EXCLUDED_SHARE_MAX, "pass": bool(share <= EXCLUDED_SHARE_MAX),
            "slopeHistogram": hist,
            "slopeMax_deg": float(np.nanmax(s)) if np.isfinite(s).any() else None,
            "slopeMedian_deg": float(np.nanmedian(s)) if np.isfinite(s).any() else None}
