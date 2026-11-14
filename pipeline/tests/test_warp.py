# SI-assisted: drafted with Claude Code (Claude Opus 5.5); human Data and Science review pending.
# Plan 6.4 / 7.3: D1 is resampled once, by averaging, into a square F6 grid (s = 2 m) via +proj=ortho.
import math
import numpy as np
from affine import Affine
from rasterio.crs import CRS

from sharpwalk.geo import R_F1
from sharpwalk.grids import horn_slope_deg
from sharpwalk.warp import warp_to_f6

EQC = CRS.from_proj4(f"+proj=eqc +lat_ts=0 +lat_0=0 +lon_0=0 +R={R_F1:.0f} +units=m +no_defs")
LAT0, LON0 = -4.815, 137.39

def source(fn, size=1200, res=1.0):
    """Synthetic 1 m equirectangular source centred on the origin, like D1 (central meridian 0)."""
    x0 = R_F1 * math.radians(LON0) - size / 2 * res
    y0 = R_F1 * math.radians(LAT0) + size / 2 * res
    t = Affine(res, 0, x0, 0, -res, y0)
    cols, rows = np.meshgrid(np.arange(size), np.arange(size))
    xs, ys = t @ (cols + 0.5, rows + 0.5)
    return fn(xs, ys).astype(np.float32), t

def test_grid_is_square_and_centred_on_the_origin():
    z, t = source(lambda x, y: np.full(x.shape, -3500.0))
    out, ot = warp_to_f6(z, t, EQC, -32767.0, LAT0, LON0, cell_m=2.0, n=200)
    assert out.shape == (200, 200)
    assert ot.a == 2.0 and ot.e == -2.0
    assert ot @ (100, 100) == (0.0, 0.0)  # grid corner shared by the four central cells is the origin

def test_constant_surface_stays_constant():
    z, t = source(lambda x, y: np.full(x.shape, -3500.0))
    out, _ = warp_to_f6(z, t, EQC, -32767.0, LAT0, LON0, cell_m=2.0, n=200)
    np.testing.assert_allclose(out, -3500.0, atol=1e-3)

def test_nodata_stays_unknown_and_is_not_averaged_in():
    z, t = source(lambda x, y: np.full(x.shape, -3500.0))
    z[:, :600] = -32767.0  # western half missing
    out, _ = warp_to_f6(z, t, EQC, -32767.0, LAT0, LON0, cell_m=2.0, n=200)
    assert np.isnan(out[:, :95]).all()
    np.testing.assert_allclose(out[:, 105:], -3500.0, atol=1e-3)

def test_north_tilt_survives_the_warp():
    k = math.tan(math.radians(12.0))
    yc = R_F1 * math.radians(LAT0)
    z, t = source(lambda x, y: -3500.0 + k * (y - yc))
    out, _ = warp_to_f6(z, t, EQC, -32767.0, LAT0, LON0, cell_m=2.0, n=200)
    np.testing.assert_allclose(np.nanmedian(horn_slope_deg(out, 2.0)), 12.0, atol=0.05)

def test_east_tilt_uses_true_metres_not_source_pixels():
    """Source pixels are 0.9965 m east-west at -4.8 deg (plan 7.3); the warp must correct for that."""
    k = math.tan(math.radians(12.0))
    xc = R_F1 * math.radians(LON0)
    z, t = source(lambda x, y: -3500.0 + k * (x - xc))  # tilt per source easting metre
    out, _ = warp_to_f6(z, t, EQC, -32767.0, LAT0, LON0, cell_m=2.0, n=200)
    true = math.degrees(math.atan(k / math.cos(math.radians(LAT0))))
    np.testing.assert_allclose(np.nanmedian(horn_slope_deg(out, 2.0)), true, atol=0.05)
