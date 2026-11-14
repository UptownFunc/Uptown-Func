# SI-assisted: drafted with Claude Code (Claude Opus 5.5); human Data and Science review pending.
"""Plan 6.7 sky-obstruction layer (compute budget paragraph): f_obs on a grid of observers, geometry not dose.

Rays every 1 deg; the step grows with range, max(2 m, r/100) (about 725 samples to 100 km). Heights come from rasters in
the area's own F6 plane (+proj=ortho about the area origin): a near level set (D1) and a far level set (D12). Beyond the
base cell, a ray reads the max-aggregated level whose cell matches its step, so a narrow crest is not missed (the
horizon can be over-, never under-stated by the aggregation). gamma and f_obs follow sky.py (curvature r^2 / 2R).
"""
import math
from typing import NamedTuple

import numpy as np
from affine import Affine

from .geo import R_F1
from .sky import bilinear


class Level(NamedTuple):
    a: np.ndarray
    t: Affine
    cell_m: float


def max_pyramid(base: Level, cell_m: float) -> Level:
    """Block maximum of a level to a coarser cell (an integer multiple); NaN is ignored, all-NaN blocks stay NaN."""
    k = int(round(cell_m / base.cell_m))
    h, w = (base.a.shape[0] // k) * k, (base.a.shape[1] // k) * k
    b = base.a[:h, :w].reshape(h // k, k, w // k, k)
    finite = np.isfinite(b).any(axis=(1, 3))
    out = np.where(finite, np.max(np.where(np.isfinite(b), b, -np.inf), axis=(1, 3)), np.nan)
    return Level(out, Affine(cell_m, 0.0, base.t.c, 0.0, -cell_m, base.t.f), cell_m)


def ray_ranges(r0: float, r_max: float) -> np.ndarray:
    """Sample ranges from r0: step max(2 m, r / 100) (plan 6.7 compute budget)."""
    out, r = [], r0
    while r <= r_max:
        out.append(r)
        r += max(2.0, r / 100.0)
    return np.asarray(out)


def _pick(levels: list, step: float) -> int:
    """Index of the coarsest level whose cell does not exceed the step (the finest if none does)."""
    ok = [i for i, lv in enumerate(levels) if lv.cell_m <= step + 1e-9]
    return max(ok, key=lambda i: levels[i].cell_m) if ok else min(range(len(levels)), key=lambda i: levels[i].cell_m)


def sky_fraction(observers, z_obs: np.ndarray, near: list, far: list, az_deg: np.ndarray, ranges: np.ndarray,
                 r_near_max: float, radius_m: float = R_F1) -> np.ndarray:
    """f_obs per observer (F6 east, north). z_obs includes h_obs; NaN z_obs gives NaN. NaN heights are ignored."""
    steps = np.append(np.diff(ranges), ranges[-1] / 100.0) if len(ranges) > 1 else np.array([2.0])
    groups = {}
    for i, (r, s) in enumerate(zip(ranges, steps)):
        key = ("near", _pick(near, s)) if (r <= r_near_max or not far) else ("far", _pick(far, s))
        groups.setdefault(key, []).append(i)
    sa, ca = np.sin(np.radians(az_deg))[:, None], np.cos(np.radians(az_deg))[:, None]
    out = np.full(len(observers), np.nan)
    for o, (e0, n0) in enumerate(observers):
        if not np.isfinite(z_obs[o]):
            continue
        best = np.full(len(az_deg), -np.inf)
        for (side, li), idx in groups.items():
            lv = (near if side == "near" else far)[li]
            r = ranges[idx][None, :]
            z = bilinear(lv.a, lv.t, e0 + r * sa, n0 + r * ca)
            ang = np.arctan((z - z_obs[o] - r * r / (2 * radius_m)) / r)
            best = np.maximum(best, np.where(np.isnan(ang), -np.inf, ang).max(axis=1))
        out[o] = float(np.mean(np.sin(np.maximum(0.0, best))))
    return out
