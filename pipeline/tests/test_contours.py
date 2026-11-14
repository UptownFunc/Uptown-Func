# SI-assisted: drafted with Claude Code (Claude Opus 5.5); human Data and Science review pending.
"""Plan 7.8 contours: gdal_contour on D1, delivered as GeoJSON in F1; plan 9 sheet layers: AREA sheet 10 m lines,
every fifth heavier and labelled. Oracle: a plane z = a * x has straight contour lines at exactly known positions."""
import math, shutil
import numpy as np
import pytest
from affine import Affine
from sharpwalk.contours import contour_lines_f7, contours_collection
from sharpwalk.coverage import K_F7

needs_gdal = pytest.mark.skipif(shutil.which("gdal_contour") is None, reason="gdal_contour (GDAL CLI) not installed")
T = Affine(2.0, 0.0, 8_142_244.0, 0.0, -2.0, -283_907.0)  # 2 m F7 grid, top-left corner


@needs_gdal
def test_a_plane_gives_straight_lines_at_the_exact_level_positions(tmp_path):
    rows, cols = 10, 40
    z = np.tile(np.arange(cols, dtype=np.float32) * 1.0, (rows, 1))  # +1 m per 2 m column, rising east
    lines = contour_lines_f7(z, T, interval=5.0, nodata=None, workdir=tmp_path)
    levels = sorted({lvl for lvl, _ in lines})
    assert levels == [5.0, 10.0, 15.0, 20.0, 25.0, 30.0, 35.0]
    for lvl, coords in lines:
        # Values sit at pixel centres: z = c at x = x0 + (c + 0.5) * 2, so level L lies at x0 + (L + 0.5) * 2.
        want = 8_142_244.0 + (lvl + 0.5) * 2.0
        assert all(abs(x - want) < 1e-4 for x, _ in coords), (lvl, {x for x, _ in coords})  # 0.1 mm: float32 only


@needs_gdal
def test_nodata_cells_are_not_contoured_through(tmp_path):
    z = np.tile(np.arange(40, dtype=np.float32), (10, 1))
    z[:, 18:22] = -32767.0
    lines = contour_lines_f7(z, T, interval=5.0, nodata=-32767.0, workdir=tmp_path)
    for lvl, coords in lines:
        assert not any(8_142_244.0 + 18 * 2 <= x <= 8_142_244.0 + 22 * 2 for x, _ in coords), lvl


def test_collection_is_f1_lon_lat_with_index_lines_every_fifth_interval():
    lines = [(-3500.0, [(137.39 * K_F7, -4.815 * K_F7), (137.391 * K_F7, -4.815 * K_F7)]),
             (-3510.0, [(137.39 * K_F7, -4.816 * K_F7), (137.391 * K_F7, -4.816 * K_F7)])]
    fc = contours_collection(lines, interval=10.0, index_every=5, cell_m=4.0, method="test")
    assert fc["type"] == "FeatureCollection" and fc["frame"] == "F1"
    assert fc["properties"] == {"source": "D1", "interval_m": 10.0, "indexEvery": 5, "cell_m": 4.0, "method": "test",
                                "verticalReference": "D1 as delivered; unverified (DECISIONS D-05)"}
    a, b = fc["features"]
    assert a["geometry"]["type"] == "LineString"
    assert a["geometry"]["coordinates"][0] == [137.39, -4.815]
    assert a["properties"] == {"elev_m": -3500.0, "index": True}   # -3500 is a multiple of 50 m
    assert b["properties"] == {"elev_m": -3510.0, "index": False}
    assert math.isclose(b["geometry"]["coordinates"][1][0], 137.391, abs_tol=1e-9)


def test_block_mean_averages_blocks_keeps_nodata_and_drops_partial_blocks():
    from sharpwalk.run_contours import block_mean
    z = np.arange(30, dtype=np.float64).reshape(5, 6)
    z[0, 0] = np.nan
    m = block_mean(z, 2)
    assert m.shape == (2, 3)                       # the 5th row does not fill a block
    assert np.isnan(m[0, 0])                       # a block with NoData stays NoData
    assert m[0, 1] == np.mean([2, 3, 8, 9]) and m[1, 2] == np.mean([16, 17, 22, 23])


def test_display_grid_matches_layers_json():
    from sharpwalk.run_coverage import display_grid
    g = display_grid({"extentF7": [100.0, -50.0, 112.0, -40.0], "pixel_m": 1.0})
    assert (g["rows"], g["cols"]) == (10, 12)
    assert g["transform"] @ (0, 0) == (100.0, -40.0) and g["transform"] @ (12, 10) == (112.0, -50.0)
