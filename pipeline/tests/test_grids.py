# SI-assisted: drafted with Claude Code (Claude Opus 5.5); human Data and Science review pending.
# Plan 6.3 (terrain classes), 6.4 (Horn slope on a square ENU grid, s = 2 m), 7.7 (quantised grids).
import math
import numpy as np
import pytest

from sharpwalk.grids import (
    CLASS_UNKNOWN, CLASS_CANDIDATE, CLASS_EXCLUDED,
    horn_slope_deg, classify_terrain, quantise, dequantise,
)

def plane(rows, cols, s, deg_east=0.0, deg_north=0.0):
    x = np.arange(cols) * s
    y = -np.arange(rows) * s  # row index increases southward
    X, Y = np.meshgrid(x, y)
    return X * math.tan(math.radians(deg_east)) + Y * math.tan(math.radians(deg_north))

def test_flat_ground_has_zero_slope_inside_and_nan_on_border():
    s = horn_slope_deg(np.zeros((5, 5)), 2.0)
    assert np.all(np.isnan(s[0, :])) and np.all(np.isnan(s[:, -1]))
    np.testing.assert_allclose(s[1:-1, 1:-1], 0.0, atol=1e-12)

@pytest.mark.parametrize("deg", [5.0, 10.0, 19.9, 35.0])
def test_tilted_plane_recovers_its_slope(deg):
    s = horn_slope_deg(plane(7, 7, 2.0, deg_east=deg), 2.0)
    np.testing.assert_allclose(s[1:-1, 1:-1], deg, atol=1e-9)

def test_slope_combines_both_axes():
    z = plane(7, 7, 2.0, deg_east=10.0, deg_north=10.0)
    expected = math.degrees(math.atan(math.hypot(math.tan(math.radians(10)), math.tan(math.radians(10)))))
    np.testing.assert_allclose(horn_slope_deg(z, 2.0)[3, 3], expected, atol=1e-9)

def test_nodata_neighbour_makes_slope_unknown():
    z = np.zeros((5, 5)); z[2, 3] = np.nan
    s = horn_slope_deg(z, 2.0)
    assert np.isnan(s[2, 2]) and not np.isnan(s[3, 1])

def test_classes_follow_the_20_degree_assumed_limit():
    slope = np.array([[0.0, 20.0, 20.0001, np.nan]])
    np.testing.assert_array_equal(
        classify_terrain(slope, limit_deg=20.0),
        [[CLASS_CANDIDATE, CLASS_CANDIDATE, CLASS_EXCLUDED, CLASS_UNKNOWN]])

def test_class_codes_are_distinct_uint8():
    c = classify_terrain(np.array([[1.0]]), 20.0)
    assert c.dtype == np.uint8
    assert len({CLASS_UNKNOWN, CLASS_CANDIDATE, CLASS_EXCLUDED}) == 3

def test_quantise_round_trip_within_half_step():
    z = np.array([[-3865.81, -3500.123], [-3247.22, np.nan]])
    q, offset, scale, nodata = quantise(z, scale=0.01, dtype=np.uint16)
    assert q.dtype == np.uint16 and q[1, 1] == nodata
    back = dequantise(q, offset, scale, nodata)
    assert np.isnan(back[1, 1])
    np.testing.assert_allclose(back[~np.isnan(z)], z[~np.isnan(z)], atol=0.005 + 1e-9)

def test_quantise_refuses_a_range_that_does_not_fit():
    with pytest.raises(ValueError):
        quantise(np.array([0.0, 700.0]), scale=0.01, dtype=np.uint16)

def test_quantise_refuses_an_all_unknown_grid():
    with pytest.raises(ValueError):
        quantise(np.full((3, 3), np.nan), scale=0.01, dtype=np.uint16)
