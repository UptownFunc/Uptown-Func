# SI-assisted: drafted with Claude Code (Claude Opus 5.5); human Data and Science + Design review pending.
"""Display layers in F7 for the OpenLayers AREA sheet (plan 7.8, 9.2). Shown only; every measurement comes from F6.

F7 = Equidistant Cylindrical on the F1 sphere, standard parallel 0, central meridian 0 (the D1/D2 native projection).
Symbol colours are the plan 9.1/9.2 tokens; pattern spacing is a display choice pending Design review.
"""
import math
import numpy as np
from rasterio.crs import CRS
from rasterio.warp import transform as rio_transform

from .geo import R_F1, ortho_crs
from .grids import CLASS_CANDIDATE, CLASS_EXCLUDED, CLASS_UNKNOWN

F7_CRS = CRS.from_proj4(f"+proj=eqc +lat_ts=0 +lat_0=0 +lon_0=0 +R={R_F1:.0f} +units=m +no_defs")

HATCH_EXCLUDED = (0xAE, 0xB5, 0xB3)   # neutral (text-muted on graphite), plan 9.2 "neutral cross-hatch"
STIPPLE_UNKNOWN = (0xE8, 0xE1, 0xD5)  # bone, plan 9.1 "unknown: stipple"
HATCH_STEEP = (0xE8, 0xB3, 0x41)      # caution amber, plan 9.2 "slope 15-20 deg: amber diagonal hatch"
PATTERN_PX = 6


def f7_bounds_of_f6_grid(lat0: float, lon0: float, half_m: float, samples: int = 64):
    """F7 bounding box of the F6 square [-half, half]^2 (edges densified, since ortho -> eqc is not linear)."""
    t = np.linspace(-half_m, half_m, samples)
    xs = np.concatenate([t, t, np.full(samples, -half_m), np.full(samples, half_m)])
    ys = np.concatenate([np.full(samples, -half_m), np.full(samples, half_m), t, t])
    fx, fy = rio_transform(ortho_crs(lat0, lon0), F7_CRS, xs.tolist(), ys.tolist())
    return (min(fx), min(fy), max(fx), max(fy))


def class_overlay_rgba(classes: np.ndarray, slope_deg: np.ndarray) -> np.ndarray:
    rows, cols = classes.shape
    r, c = np.mgrid[0:rows, 0:cols]
    diag = (r + c) % PATTERN_PX == 0
    cross = diag | ((r - c) % PATTERN_PX == 0)
    dots = (r % 4 == 0) & (c % 4 == 0)
    out = np.zeros((rows, cols, 4), dtype=np.uint8)

    def paint(mask, rgb):
        out[mask, 0], out[mask, 1], out[mask, 2], out[mask, 3] = rgb[0], rgb[1], rgb[2], 255

    with np.errstate(invalid="ignore"):
        steep = (classes == CLASS_CANDIDATE) & (slope_deg >= 15.0)
    paint(steep & diag, HATCH_STEEP)
    paint((classes == CLASS_EXCLUDED) & cross, HATCH_EXCLUDED)
    paint((classes == CLASS_UNKNOWN) & dots, STIPPLE_UNKNOWN)
    return out


def hillshade_u8(z: np.ndarray, dx: float, dy: float, azimuth_deg: float = 315.0, altitude_deg: float = 45.0):
    """Horn hillshade (as gdaldem), 8-bit; NaN or border cells become 0."""
    z = np.asarray(z, dtype=np.float64)
    out = np.zeros(z.shape, dtype=np.uint8)
    a, b, c = z[:-2, :-2], z[:-2, 1:-1], z[:-2, 2:]
    d, f = z[1:-1, :-2], z[1:-1, 2:]
    g, h, i = z[2:, :-2], z[2:, 1:-1], z[2:, 2:]
    gx = ((c + 2 * f + i) - (a + 2 * d + g)) / (8 * dx)
    gy = ((g + 2 * h + i) - (a + 2 * b + c)) / (8 * dy)
    slope = np.arctan(np.hypot(gx, gy))
    aspect = np.arctan2(gy, -gx)
    zen, az = math.radians(90 - altitude_deg), math.radians(360 - azimuth_deg + 90)
    hs = np.cos(zen) * np.cos(slope) + np.sin(zen) * np.sin(slope) * np.cos(az - aspect)
    inner = np.where(np.isnan(hs), 0, np.clip(hs, 0, 1) * 255)
    out[1:-1, 1:-1] = np.round(inner).astype(np.uint8)
    return out


def linear_stretch_u8(a: np.ndarray, lo: float, hi: float) -> np.ndarray:
    """Plan 9.2: a linear display stretch only."""
    s = (np.asarray(a, dtype=np.float64) - lo) / (hi - lo)
    return np.round(np.clip(s, 0, 1) * 255).astype(np.uint8)
