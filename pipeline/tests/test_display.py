# SI-assisted: drafted with Claude Code (Claude Opus 5.5); human Data and Science + Design review pending.
# Plan 7.8 / 9.2: display layers in F7 (equirectangular, sphere, clon 0). Shown, never measured.
import math
import numpy as np
from affine import Affine
from rasterio.crs import CRS

from sharpwalk.display import F7_CRS, f7_bounds_of_f6_grid, hillshade_u8, linear_stretch_u8, terrain_masks, write_mask_png
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

def test_terrain_masks_follow_the_plan_classes():
    """Plan 9.2: slope 15-20 deg (steep but allowed) amber hatch, known exclusion cross-hatch, unknown stipple. The
    pipeline ships one mask per symbol; the sheet draws the pattern in screen pixels (plan 7.8), so no pattern here."""
    classes = np.array([[CLASS_CANDIDATE, CLASS_CANDIDATE, CLASS_EXCLUDED, CLASS_UNKNOWN, CLASS_CANDIDATE]], dtype=np.uint8)
    slope = np.array([[5.0, 17.0, 30.0, np.nan, 15.0]])
    m = terrain_masks(classes, slope)
    assert set(m) == {"steep", "excluded", "unknown"}
    assert m["steep"].tolist() == [[False, True, False, False, True]]      # candidate at 15 deg or more
    assert m["excluded"].tolist() == [[False, False, True, False, False]]
    assert m["unknown"].tolist() == [[False, False, False, True, False]]
    assert not (m["steep"] & m["excluded"]).any() and not (m["steep"] & m["unknown"]).any()


def test_mask_png_is_grey_plus_alpha_with_alpha_on_the_class(tmp_path):
    import rasterio, warnings
    from rasterio.errors import NotGeoreferencedWarning
    warnings.simplefilter("ignore", NotGeoreferencedWarning)  # the mask PNG carries no georeferencing by design
    mask = np.array([[True, False], [False, True]])
    write_mask_png(tmp_path / "m.png", mask)  # georeferencing lives in layers.json (maskExtentF7), not a sidecar
    with rasterio.open(tmp_path / "m.png") as f:
        assert f.count == 2 and f.dtypes[0] == "uint8"
        assert f.read(2).tolist() == [[255, 0], [0, 255]] and (f.read(1) == 0).all()
    assert not (tmp_path / "m.png.aux.xml").exists()

def test_hillshade_flat_is_uniform_and_8_bit():
    hs = hillshade_u8(np.full((10, 10), -3500.0), dx=1.0, dy=1.0)
    assert hs.dtype == np.uint8 and hs[1:-1, 1:-1].min() == hs[1:-1, 1:-1].max()

def test_linear_stretch_is_linear_and_keeps_order():
    a = np.array([[10.0, 20.0, 30.0, 40.0]])
    s = linear_stretch_u8(a, lo=10.0, hi=40.0)
    assert s.tolist() == [[0, 85, 170, 255]]


def _mem(crs, bounds=(0.0, 0.0, 100.0, 100.0)):
    import rasterio
    from rasterio.io import MemoryFile
    x0, y0, x1, y1 = bounds
    mf = MemoryFile()
    ds = mf.open(driver="GTiff", width=10, height=10, count=1, dtype="uint8", crs=crs,
                 transform=Affine((x1 - x0) / 10, 0, x0, 0, -(y1 - y0) / 10, y1))
    return mf, ds


def test_display_sources_must_be_in_f7_and_cover_the_extent():
    import pytest
    from sharpwalk.run_display import _require_f7
    mf, ok = _mem(F7_CRS)
    _require_f7(ok, "ok", 10, 10, 90, 90)
    with pytest.raises(ValueError, match="does not cover"):
        _require_f7(ok, "ok", 10, 10, 190, 90)
    mf2, other = _mem(CRS.from_proj4("+proj=eqc +lat_ts=-5 +lon_0=0 +R=3396190 +units=m +no_defs"))
    with pytest.raises(ValueError, match="not in F7"):
        _require_f7(other, "other", 10, 10, 90, 90)
    ok.close(); other.close(); mf.close(); mf2.close()
