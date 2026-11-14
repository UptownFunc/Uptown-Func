# SI-assisted: drafted with Claude Code (Claude Opus 5.5); human Data and Science review pending.
"""Plan 6.7 sky obstruction: f_obs = mean(sin gamma_k), gamma_k = max(0, max_r atan((z - z0 - r^2/2R) / r)).

Synthetic oracles: a flat sphere gives 0; a ring wall gives sin of its angle; half a ring gives half of that.
Geometric obstruction only; never converted into dose.
"""
import math

import numpy as np
import pytest
from affine import Affine

from sharpwalk.geo import R_F1
from sharpwalk.sky import bilinear, f_obs, horizon_angles

AZ = np.arange(360) * 1.0
RANGES = np.arange(1.0, 2001.0, 1.0)


def test_flat_sphere_is_unobstructed():
    g = horizon_angles(lambda r, az: np.zeros_like(r), 0.0, AZ, RANGES)
    assert np.all(g == 0.0) and f_obs(g) == 0.0


def test_terrain_following_the_curvature_drop_is_at_the_horizon():
    g = horizon_angles(lambda r, az: r * r / (2 * R_F1), 0.0, AZ, RANGES)
    assert np.allclose(g, 0.0, atol=1e-12)


def test_a_ring_wall_gives_sin_of_its_curvature_corrected_angle():
    h, d = 50.0, 1000.0
    wall = lambda r, az: np.where(np.abs(r - d) < 0.5, h, 0.0)
    g = horizon_angles(wall, 0.0, AZ, RANGES)
    expect = math.atan((h - d * d / (2 * R_F1)) / d)
    assert np.allclose(g, expect, atol=1e-9)
    assert f_obs(g) == pytest.approx(math.sin(expect), abs=1e-9)


def test_half_a_ring_gives_half_and_observer_height_lowers_it():
    h, d = 50.0, 1000.0
    half = lambda r, az: np.where((np.abs(r - d) < 0.5) & (az < 180), h, 0.0)
    g = horizon_angles(half, 0.0, AZ, RANGES)
    full = math.sin(math.atan((h - d * d / (2 * R_F1)) / d))
    assert f_obs(g) == pytest.approx(full / 2, abs=1e-9)
    assert f_obs(horizon_angles(half, 2.0, AZ, RANGES)) < f_obs(g)


def test_nan_heights_are_ignored_not_treated_as_obstruction():
    g = horizon_angles(lambda r, az: np.where(r < 500, np.nan, 0.0), 0.0, AZ, RANGES)
    assert np.all(g == 0.0)


def test_bilinear_interpolates_and_returns_nan_outside_or_on_nodata():
    a = np.array([[0.0, 10.0], [20.0, np.nan]])
    t = Affine(1.0, 0.0, 0.0, 0.0, -1.0, 2.0)  # pixel centres at (0.5, 1.5), (1.5, 1.5), (0.5, 0.5), (1.5, 0.5)
    assert bilinear(a, t, np.array([0.5]), np.array([1.5]))[0] == pytest.approx(0.0)
    assert bilinear(a, t, np.array([1.0]), np.array([1.5]))[0] == pytest.approx(5.0)
    assert bilinear(a, t, np.array([0.5]), np.array([1.0]))[0] == pytest.approx(10.0)
    assert np.isnan(bilinear(a, t, np.array([1.2]), np.array([0.8]))[0])  # touches the NaN cell
    assert np.isnan(bilinear(a, t, np.array([5.0]), np.array([5.0]))[0])


def test_m12_position_is_the_last_drive_before_the_parking_and_refuses_a_drive_during_it():
    from sharpwalk.run_sky_benchmark import m12_position
    f = lambda sol, drive: {"properties": {"sol": sol, "site": 57, "drive": drive}}
    assert m12_position([f(1452, 1), f(1455, 2), f(1468, 3)])["drive"] == 2
    with pytest.raises(ValueError):
        m12_position([f(1455, 2), f(1460, 3)])          # a drive during the parking
    with pytest.raises(ValueError):
        m12_position([f(1440, 1), f(1468, 3)])          # last waypoint too long before sol 1456 (a log gap)
    with pytest.raises(ValueError):
        m12_position([f(1452, 1), f(1455, 2)])          # nothing logged after the parking


def test_raster_frames_are_checked_before_use():
    from rasterio.crs import CRS
    from sharpwalk.run_sky_benchmark import check_d12_crs
    check_d12_crs(CRS.from_proj4(f"+proj=longlat +R={R_F1:.0f} +no_defs"))
    with pytest.raises(ValueError):
        check_d12_crs(CRS.from_proj4(f"+proj=eqc +lat_ts=0 +lat_0=0 +lon_0=0 +R={R_F1:.0f} +units=m +no_defs"))
    with pytest.raises(ValueError):
        check_d12_crs(CRS.from_epsg(4326))  # Earth ellipsoid, not the F1 sphere


def test_horizon_reports_the_range_that_sets_each_angle():
    from sharpwalk.sky import horizon_with_range
    h, d = 50.0, 1000.0
    half = lambda r, az: np.where((np.abs(r - d) < 0.5) & (az < 180), h, 0.0)
    g, r_at = horizon_with_range(half, 0.0, AZ, RANGES)
    assert np.all(r_at[:180] == d) and np.all(np.isnan(r_at[180:]))  # no obstruction: no setting range
    assert np.allclose(g, horizon_angles(half, 0.0, AZ, RANGES))
