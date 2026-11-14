# SI-assisted: drafted with Claude Code (Claude Opus 5.5); human Data and Science review pending.
"""Plan 6.7 sky-obstruction layer: ray steps grow as max(2 m, r/100); beyond the base cell, rays read a max-aggregated
level whose cell matches the step, so a crest is never missed (it can only be over-, not under-stated)."""
import math

import numpy as np
import pytest
from affine import Affine

from sharpwalk.geo import R_F1
from sharpwalk.sky_grid import Level, max_pyramid, ray_ranges, sky_fraction


def test_ray_ranges_follow_the_plan_step_rule():
    r = ray_ranges(2.0, 100_000.0)
    assert r[0] == 2.0 and r[-1] <= 100_000.0 * 1.0101
    steps = np.diff(r)
    assert np.allclose(steps[r[:-1] < 200], 2.0)
    far = r[:-1] >= 200
    assert np.allclose(steps[far] / r[:-1][far], 0.01, rtol=1e-6)
    assert 600 < len(r) < 800  # plan: about 725 samples a ray


def test_max_pyramid_keeps_the_highest_value_and_ignores_nan():
    a = np.array([[1.0, 2.0, np.nan, np.nan], [3.0, 9.0, np.nan, np.nan], [0, 0, 1, 1], [0, 0, 1, 5.0]])
    t = Affine(2.0, 0.0, 0.0, 0.0, -2.0, 8.0)
    lv = max_pyramid(Level(a, t, 2.0), 4.0)
    assert lv.cell_m == 4.0 and lv.t.a == 4.0 and lv.t.c == 0.0 and lv.t.f == 8.0
    assert lv.a[0, 0] == 9.0 and np.isnan(lv.a[0, 1]) and lv.a[1, 1] == 5.0


def _flat_with_wall(cell, size, h, d):
    n = int(size / cell)
    t = Affine(cell, 0.0, -size / 2, 0.0, -cell, size / 2)
    e = (np.arange(n) + 0.5) * cell - size / 2
    E, N = np.meshgrid(e, -e)
    a = np.where(np.abs(np.hypot(E, N) - d) <= cell, h, 0.0)
    return Level(a, t, cell)


def test_a_ring_wall_gives_the_same_fraction_as_the_formula():
    near = [_flat_with_wall(2.0, 4000.0, 30.0, 150.0)]
    f = sky_fraction([(0.0, 0.0)], np.array([0.0]), near, [], np.arange(360.0), ray_ranges(2.0, 1900.0), 1900.0)
    expect = math.sin(math.atan((30.0 - 150.0 ** 2 / (2 * R_F1)) / 150.0))
    assert f[0] == pytest.approx(expect, abs=0.01)


def test_flat_ground_is_unobstructed_and_nan_observer_ground_gives_nan():
    near = [Level(np.zeros((100, 100)), Affine(2.0, 0.0, -100.0, 0.0, -2.0, 100.0), 2.0)]
    f = sky_fraction([(0.0, 0.0), (10.0, 0.0)], np.array([0.0, np.nan]), near, [], np.arange(0.0, 360.0, 10.0), ray_ranges(2.0, 90.0), 90.0)
    assert f[0] == 0.0 and np.isnan(f[1])


def test_committed_sky_layer_matches_its_registration():
    import json
    from pathlib import Path
    from sharpwalk.outputs import sha256_file
    area = Path(__file__).resolve().parents[2] / "public" / "area"
    sky = json.loads((area / "layers.json").read_text())["sky"]
    g = sky["grid"]
    assert sha256_file(area / g["path"]) == g["sha256"] and sha256_file(area / sky["image"]["path"]) == sky["image"]["sha256"]
    q = np.fromfile(area / g["path"], dtype="<u2").reshape(g["rows"], g["cols"])
    v = q[q != g["noData"]] * g["scale"]
    assert 0.0 <= v.min() and v.max() <= 1.0
    assert sky["range"] == pytest.approx([v.min(), v.max()], abs=g["scale"])
    assert sky["selfCheck_maxDiff_pp"] <= 0.5  # coarse steps + max levels vs fixed fine steps (plan's convergence bar)
    assert "geometry, not dose" in sky["name"]
