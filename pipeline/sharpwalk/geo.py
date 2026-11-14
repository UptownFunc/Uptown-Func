# SI-assisted: drafted with Claude Code (Claude Opus 5.5); human Data and Science review pending.
"""Plan 7.3 frame chain F1 -> F5 -> F6 on the F1 sphere. Degrees in, metres out.

F1: planetocentric latitude, east-positive longitude, heights h added to R (the plan's step 1).
Whether D1 heights are relative to this sphere is UNVERIFIED (D-05); the 7.4 control points measure it.
"""
import math
from rasterio.crs import CRS

R_F1 = 3_396_190.0  # m, IAU_2015:49900 sphere (plan 7.3)


def f1_to_f5(lat_deg: float, lon_deg: float, h_m: float) -> tuple[float, float, float]:
    phi, lam = math.radians(lat_deg), math.radians(lon_deg)
    r = R_F1 + h_m
    return (r * math.cos(phi) * math.cos(lam), r * math.cos(phi) * math.sin(lam), r * math.sin(phi))


def f5_to_f6(p, lat0_deg: float, lon0_deg: float, origin_f5) -> tuple[float, float, float]:
    """Standard ECEF-to-ENU rotation about (lat0, lon0) on the F1 sphere."""
    phi, lam = math.radians(lat0_deg), math.radians(lon0_deg)
    dx, dy, dz = (p[0] - origin_f5[0], p[1] - origin_f5[1], p[2] - origin_f5[2])
    sl, cl, sp, cp = math.sin(lam), math.cos(lam), math.sin(phi), math.cos(phi)
    e = -sl * dx + cl * dy
    n = -sp * cl * dx - sp * sl * dy + cp * dz
    u = cp * cl * dx + cp * sl * dy + sp * dz
    return (e, n, u)


def ortho_crs(lat0_deg: float, lon0_deg: float) -> CRS:
    """Plan 7.3: grids are warped to +proj=ortho centred on the area origin on the F1 sphere."""
    return CRS.from_proj4(f"+proj=ortho +lat_0={lat0_deg} +lon_0={lon0_deg} +R={R_F1:.0f} +units=m +no_defs")
