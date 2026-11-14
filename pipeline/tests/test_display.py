# SI-assisted: drafted with Claude Code (Claude Opus 5.5); human Data and Science + Design review pending.
# Plan 7.8 / 9.2: display layers in F7 (equirectangular, sphere, clon 0). Shown, never measured.
import math
import numpy as np
from affine import Affine
from rasterio.crs import CRS

from sharpwalk.display import (
    F7_CRS, f7_bounds_of_f6_grid, class_overlay_rgba, hillshade_u8, linear_stretch_u8,
    HATCH_EXCLUDED, STIPPLE_UNKNOWN, HATCH_STEEP,
)
from sharpwalk.geo import R_F1
from sharpwalk.grids import CLASS_UNKNOWN, CLASS_CANDIDATE, CLASS_EXCLUDED

def test_f7_is_the_plan_equirectangular_on_the_sphere():
    p = F7_CRS.to_dict()
    assert p["proj"] == "eqc" and p.get("lon_0", 0) == 0 and p.get("lat_ts", 0) == 0 and p["R"] == R_F1

def test_f7_bounds_cover_the_f6_square():
    x0, y0, x1, y1 = f7_bounds_of_f6_grid(-4.815, 137.39, half_m=1500.0)
    k = math.pi * R_F1 / 180
    assert x0 < k * 137.39 < x1 and y0 < k * -4.815 < y1
    # East-west spans more F7 metres than ground metres (F7 stretches by 1/cos(lat)).
    assert (x1 - x0) > 3000.0 and abs((y1 - y0) - 3000.0) < 5.0

def test_class_overlay_symbols():
    # Each class fills an 8-pixel-wide block, wide enough for the hatch and stipple patterns.
    row_c = np.repeat([CLASS_CANDIDATE, CLASS_EXCLUDED, CLASS_UNKNOWN, CLASS_CANDIDATE], 8).astype(np.uint8)
    row_s = np.repeat([5.0, 30.0, np.nan, 17.0], 8)
    classes, slope = np.tile(row_c, (16, 1)), np.tile(row_s, (16, 1))
    rgba = class_overlay_rgba(classes, slope)
    assert rgba.shape == (16, 32, 4) and rgba.dtype == np.uint8
    block = lambda k: rgba[:, 8 * k:8 * k + 8].reshape(-1, 4)
    assert (block(0)[:, 3] == 0).all()                                # candidate under 15 deg: untouched imagery
    for k, rgb in ((1, HATCH_EXCLUDED), (2, STIPPLE_UNKNOWN), (3, HATCH_STEEP)):
        b = block(k)
        assert (b[:, 3] > 0).any() and (b[:, 3] == 0).any()           # a pattern, not a fill
        assert {tuple(p[:3]) for p in b[b[:, 3] > 0]} == {rgb}

def test_hillshade_flat_is_uniform_and_8_bit():
    hs = hillshade_u8(np.full((10, 10), -3500.0), dx=1.0, dy=1.0)
    assert hs.dtype == np.uint8 and hs[1:-1, 1:-1].min() == hs[1:-1, 1:-1].max()

def test_linear_stretch_is_linear_and_keeps_order():
    a = np.array([[10.0, 20.0, 30.0, 40.0]])
    s = linear_stretch_u8(a, lo=10.0, hi=40.0)
    assert s.tolist() == [[0, 85, 170, 255]]
