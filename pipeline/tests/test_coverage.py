# SI-assisted: drafted with Claude Code (Claude Opus 5.5); human Data and Science review pending.
"""Plan 7.8 "Missing and coarse data": each dataset ships its coverage outline, as GeoJSON in F1 (plan 7.8 vector
delivery). Here: the outline of a valid-data mask on the F7 display grid, converted exactly to F1 (x = k lon, y = k lat)."""
import math
import numpy as np
from affine import Affine
from sharpwalk.coverage import K_F7, coverage_feature, coverage_collection

T = Affine(1.0, 0.0, 8_142_244.0, 0.0, -1.0, -283_907.0)  # 1 m F7 grid, top-left corner


def ring_bounds(ring):
    xs, ys = [p[0] for p in ring], [p[1] for p in ring]
    return min(xs), min(ys), max(xs), max(ys)


def test_k_is_the_plan_7_8_metres_per_degree():
    assert math.isclose(K_F7, 59_274.70, abs_tol=0.01)


def test_full_mask_gives_the_window_rectangle_in_f1_lon_lat():
    f = coverage_feature("D2", "D2 colour coverage", ["d2"], np.ones((30, 40), bool), T, method="test")
    assert f["type"] == "Feature" and f["geometry"]["type"] == "MultiPolygon"
    polys = f["geometry"]["coordinates"]
    assert len(polys) == 1 and len(polys[0]) == 1  # one polygon, no holes
    lon0, lat0, lon1, lat1 = ring_bounds(polys[0][0])
    assert math.isclose(lon0, 8_142_244.0 / K_F7, abs_tol=1e-9) and math.isclose(lon1, (8_142_244.0 + 40) / K_F7, abs_tol=1e-9)
    assert math.isclose(lat1, -283_907.0 / K_F7, abs_tol=1e-9) and math.isclose(lat0, (-283_907.0 - 30) / K_F7, abs_tol=1e-9)
    assert f["properties"] == {"dataset": "D2", "label": "D2 colour coverage", "layerIds": ["d2"], "validFraction": 1.0,
                               "method": "test"}


def test_a_void_inside_becomes_a_hole_and_lowers_the_valid_fraction():
    m = np.ones((20, 20), bool)
    m[5:10, 5:10] = False
    f = coverage_feature("D1", "D1 elevation coverage", ["hillshade"], m, T, method="test")
    polys = f["geometry"]["coordinates"]
    assert len(polys) == 1 and len(polys[0]) == 2  # outer ring + one hole
    assert f["properties"]["validFraction"] == (400 - 25) / 400


def test_no_valid_pixel_gives_an_empty_outline_not_a_rectangle():
    f = coverage_feature("D2", "D2 colour coverage", ["d2"], np.zeros((10, 10), bool), T, method="test")
    assert f["geometry"]["coordinates"] == [] and f["properties"]["validFraction"] == 0.0


def test_collection_names_its_frame():
    fc = coverage_collection([coverage_feature("D1", "x", ["hillshade"], np.ones((2, 2), bool), T, method="m")])
    assert fc["type"] == "FeatureCollection" and fc["frame"] == "F1" and len(fc["features"]) == 1
