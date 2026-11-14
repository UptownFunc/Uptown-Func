# SI-assisted: drafted with Claude Code (Claude Opus 5.5); human Data and Science review pending.
"""Plan 6.7 sky obstruction, geometric only (never converted into dose).

gamma_k = max(0, max_{0 < r <= R_far} atan((z(r, phi_k) - (z0 + h_obs) - r^2 / (2R)) / r));  f_obs = mean_k sin(gamma_k)
R = 3,396,190 m (F1 sphere). Heights come from a caller-supplied function of range and azimuth (bilinear on D1/D12);
NaN heights (NoData, outside a raster) are ignored, never treated as obstruction.
"""
import numpy as np

from .geo import R_F1


def horizon_angles(height_fn, z_obs: float, az_deg: np.ndarray, ranges_m: np.ndarray, radius_m: float = R_F1) -> np.ndarray:
    """Horizon angle gamma (radians, >= 0) per azimuth. height_fn(r, az) takes and returns arrays of shape (N, M)."""
    az = np.asarray(az_deg, float)[:, None] * np.ones((1, len(ranges_m)))
    r = np.ones((len(az_deg), 1)) * np.asarray(ranges_m, float)[None, :]
    z = np.asarray(height_fn(r, az), float)
    ang = np.arctan((z - z_obs - r * r / (2 * radius_m)) / r)
    ang = np.where(np.isnan(ang), -np.inf, ang)
    return np.maximum(0.0, ang.max(axis=1))


def f_obs(gamma_rad: np.ndarray) -> float:
    """Obstructed fraction of the upper hemisphere: mean of sin(gamma) over equally spaced azimuths."""
    return float(np.mean(np.sin(gamma_rad)))


def bilinear(a: np.ndarray, t, x: np.ndarray, y: np.ndarray) -> np.ndarray:
    """Bilinear value at map points (x, y) of raster a with area-convention affine t; NaN if any neighbour is NaN/outside."""
    inv = ~t
    col = inv.a * x + inv.b * y + inv.c - 0.5
    row = inv.d * x + inv.e * y + inv.f - 0.5
    c0, r0 = np.floor(col).astype(int), np.floor(row).astype(int)
    fc, fr = col - c0, row - r0
    h, w = a.shape
    c1, r1 = np.where(fc > 0, c0 + 1, c0), np.where(fr > 0, r0 + 1, r0)
    ok = (c0 >= 0) & (r0 >= 0) & (c1 < w) & (r1 < h)
    out = np.full(np.shape(x), np.nan)
    c0, c1, r0, r1, fc, fr = c0[ok], c1[ok], r0[ok], r1[ok], fc[ok], fr[ok]
    v = (a[r0, c0] * (1 - fc) * (1 - fr) + a[r0, c1] * fc * (1 - fr) + a[r1, c0] * (1 - fc) * fr + a[r1, c1] * fc * fr)
    nan = np.isnan(a[r0, c0]) | np.isnan(a[r0, c1]) | np.isnan(a[r1, c0]) | np.isnan(a[r1, c1])
    out[ok] = np.where(nan, np.nan, v)
    return out


def horizon_with_range(height_fn, z_obs: float, az_deg: np.ndarray, ranges_m: np.ndarray, radius_m: float = R_F1):
    """As horizon_angles, plus the range (m) that sets each angle; NaN where nothing rises above the horizon (plan AC-22)."""
    az = np.asarray(az_deg, float)[:, None] * np.ones((1, len(ranges_m)))
    r = np.ones((len(az_deg), 1)) * np.asarray(ranges_m, float)[None, :]
    ang = np.arctan((np.asarray(height_fn(r, az), float) - z_obs - r * r / (2 * radius_m)) / r)
    ang = np.where(np.isnan(ang), -np.inf, ang)
    k = ang.argmax(axis=1)
    best = ang[np.arange(len(k)), k]
    return np.maximum(0.0, best), np.where(best > 0, np.asarray(ranges_m, float)[k], np.nan)
