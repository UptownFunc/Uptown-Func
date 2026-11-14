# SI-assisted: drafted with Claude Code (Claude Opus 5.5); human Data and Science review pending.
"""Plan 6.3 terrain classes and 6.4 Horn slope on a square ENU grid; plan 7.7 quantisation.

Class codes are a pipeline encoding choice (pending Data and Science agreement, P-02):
0 = unknown or low-confidence (never routed), 1 = slope-screened candidate, 2 = known exclusion.
"""
import numpy as np

CLASS_UNKNOWN = 0
CLASS_CANDIDATE = 1
CLASS_EXCLUDED = 2


def horn_slope_deg(z: np.ndarray, cell_m: float) -> np.ndarray:
    """Horn's 3 x 3 slope in degrees. Border cells and cells next to NaN are NaN (unknown)."""
    z = np.asarray(z, dtype=np.float64)
    out = np.full(z.shape, np.nan)
    a, b, c = z[:-2, :-2], z[:-2, 1:-1], z[:-2, 2:]
    d, f = z[1:-1, :-2], z[1:-1, 2:]
    g, h, i = z[2:, :-2], z[2:, 1:-1], z[2:, 2:]
    dzdx = ((c + 2 * f + i) - (a + 2 * d + g)) / (8 * cell_m)
    dzdy = ((g + 2 * h + i) - (a + 2 * b + c)) / (8 * cell_m)
    out[1:-1, 1:-1] = np.degrees(np.arctan(np.hypot(dzdx, dzdy)))
    return out


def classify_terrain(slope_deg: np.ndarray, limit_deg: float) -> np.ndarray:
    """Unknown where slope is NaN; candidate at or below the Assumed limit; exclusion above it."""
    s = np.asarray(slope_deg, dtype=np.float64)
    out = np.full(s.shape, CLASS_UNKNOWN, dtype=np.uint8)
    known = ~np.isnan(s)
    out[known & (s <= limit_deg)] = CLASS_CANDIDATE
    out[known & (s > limit_deg)] = CLASS_EXCLUDED
    return out


def quantise(z: np.ndarray, scale: float, dtype=np.uint16):
    """Return (q, offset, scale, nodata). NaN maps to the dtype maximum, which is reserved as NoData."""
    z = np.asarray(z, dtype=np.float64)
    nodata = int(np.iinfo(dtype).max)
    valid = ~np.isnan(z)
    offset = float(np.floor(np.nanmin(z) / scale) * scale)
    steps = np.zeros(z.shape, dtype=np.float64)
    steps[valid] = np.round((z[valid] - offset) / scale)
    if valid.any() and steps[valid].max() >= nodata:
        raise ValueError(f"range {np.nanmax(z) - offset:.3f} does not fit {np.dtype(dtype).name} at scale {scale}")
    q = np.full(z.shape, nodata, dtype=dtype)
    q[valid] = steps[valid].astype(dtype)
    return q, offset, scale, nodata


def dequantise(q: np.ndarray, offset: float, scale: float, nodata: int) -> np.ndarray:
    out = q.astype(np.float64) * scale + offset
    out[q == nodata] = np.nan
    return out
