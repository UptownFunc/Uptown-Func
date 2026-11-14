# SI-assisted: drafted with Claude Code (Claude Opus 5.5); human Data and Science review pending.
# Plan 7.3: F1 -> F5 -> F6 on the F1 sphere, R = 3,396,190 m. These formulas are the test oracle.
import math
import numpy as np
import pytest
from rasterio.crs import CRS
from rasterio.warp import transform as rio_transform

from sharpwalk.geo import R_F1, f1_to_f5, f5_to_f6, ortho_crs

def test_sphere_radius_is_plan_value():
    assert R_F1 == 3_396_190.0

@pytest.mark.parametrize("lat,lon,expected", [
    (0.0, 0.0, (R_F1 + 10, 0.0, 0.0)),
    (0.0, 90.0, (0.0, R_F1 + 10, 0.0)),
    (90.0, 0.0, (0.0, 0.0, R_F1 + 10)),
])
def test_f1_to_f5_axes(lat, lon, expected):
    np.testing.assert_allclose(f1_to_f5(lat, lon, 10.0), expected, atol=1e-6)

def test_f1_to_f5_east_positive_longitude():
    x, y, _ = f1_to_f5(-4.815, 137.39, 0.0)
    assert x < 0 and y > 0  # 137.39 E lies in the second quadrant

def test_f5_to_f6_origin_is_zero():
    o = f1_to_f5(-4.815, 137.39, -3500.0)
    np.testing.assert_allclose(f5_to_f6(o, -4.815, 137.39, o), (0, 0, 0), atol=1e-6)

def test_f5_to_f6_axes_point_east_north_up():
    lat0, lon0 = -4.815, 137.39
    o = f1_to_f5(lat0, lon0, 0.0)
    e = f5_to_f6(f1_to_f5(lat0, lon0 + 0.001, 0.0), lat0, lon0, o)
    n = f5_to_f6(f1_to_f5(lat0 + 0.001, lon0, 0.0), lat0, lon0, o)
    u = f5_to_f6(f1_to_f5(lat0, lon0, 25.0), lat0, lon0, o)
    assert e[0] > 0 and abs(e[1]) < 1e-3
    assert n[1] > 0 and abs(n[0]) < 1e-3
    np.testing.assert_allclose(u, (0, 0, 25.0), atol=1e-6)

def test_ortho_plane_matches_enu_for_points_on_the_sphere():
    """Plan 7.3: the +proj=ortho plane on the F1 sphere is exactly the F6 east/north axes."""
    lat0, lon0 = -4.815, 137.39
    o = f1_to_f5(lat0, lon0, 0.0)
    lats = [-4.84, -4.80, -4.79, -4.815]
    lons = [137.365, 137.40, 137.415, 137.39]
    xs, ys = rio_transform(CRS.from_proj4("+proj=longlat +R=3396190 +no_defs"), ortho_crs(lat0, lon0), lons, lats)
    for la, lo, x, y in zip(lats, lons, xs, ys):
        e, n, _ = f5_to_f6(f1_to_f5(la, lo, 0.0), lat0, lon0, o)
        assert abs(e - x) < 1e-3 and abs(n - y) < 1e-3
