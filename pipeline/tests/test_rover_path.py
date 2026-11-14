# SI-assisted: drafted with Claude Code (Claude Opus 5.5); human Data and Science review pending.
"""AC-08 (plan 11, 19.11 weakness 64): share of Curiosity path cells the slope screen classes as excluded."""
import math

import numpy as np
import pytest
from affine import Affine

from sharpwalk.geo import R_F1
from sharpwalk.grids import CLASS_CANDIDATE, CLASS_EXCLUDED, CLASS_UNKNOWN
from sharpwalk.rover_path import ac08_summary, cells_on_path, densify, lonlat_to_f6, equirect_xy


def test_densify_keeps_ends_and_spacing():
    pts = densify(np.array([[0.0, 0.0], [10.0, 0.0], [10.0, 5.0]]), 1.0)
    assert pts[0].tolist() == [0.0, 0.0] and pts[-1].tolist() == [10.0, 5.0]
    gaps = np.hypot(*np.diff(pts, axis=0).T)
    assert gaps.max() <= 1.0 + 1e-9
    assert len(pts) == 16  # 10 + 5 steps + the start


def test_cells_on_path_are_unique_in_path_order_and_inside_the_grid():
    t = Affine(2.0, 0.0, -4.0, 0.0, -2.0, 4.0)  # 4 x 4 grid of 2 m cells centred on 0
    xy = np.array([[-3.9, 3.9], [-3.0, 3.0], [-1.0, 3.0], [5.0, 3.0], [-1.0, -3.9]])
    assert cells_on_path(xy, t, 4) == [(0, 0), (0, 1), (3, 1)]


def test_origin_maps_to_zero_and_a_northward_step_to_the_arc_length():
    x, y = lonlat_to_f6(np.array([137.39, 137.39]), np.array([-4.815, -4.814]), -4.815, 137.39)
    assert abs(x[0]) < 1e-6 and abs(y[0]) < 1e-6
    assert y[1] == pytest.approx(R_F1 * math.radians(0.001), rel=1e-6)


def test_equirect_matches_the_d1_projection_used_for_f7():
    # Plan 7.8 test vector (DECISIONS G-03): 137.4 E on the 3,396,190 m sphere, standard parallel 0.
    x, y = equirect_xy(137.4, -4.8)
    assert x == pytest.approx(8_144_343.44, abs=0.01)
    assert y == pytest.approx(R_F1 * math.radians(-4.8), abs=1e-6)


def test_summary_counts_classes_and_applies_the_assumed_5_percent_threshold():
    classes = np.array([[CLASS_CANDIDATE] * 20, [CLASS_EXCLUDED] + [CLASS_CANDIDATE] * 19], dtype=np.uint8)
    slope = np.full(classes.shape, 3.0)
    slope[1, 0] = 22.0
    cells = [(0, c) for c in range(20)] + [(1, c) for c in range(20)]
    s = ac08_summary(cells, classes, slope)
    assert s["cells"] == 40 and s["excluded"] == 1 and s["unknown"] == 0
    assert s["excludedShare"] == pytest.approx(0.025)
    assert s["pass"] is True
    assert s["slopeHistogram"]["0-5"] == 39 and s["slopeHistogram"]["20-25"] == 1
    classes[0, :2] = CLASS_EXCLUDED
    assert ac08_summary(cells, classes, slope)["pass"] is False  # 3 / 40 = 7.5 %


def test_unknown_cells_are_counted_apart_and_not_as_excluded():
    classes = np.array([[CLASS_UNKNOWN, CLASS_CANDIDATE]], dtype=np.uint8)
    s = ac08_summary([(0, 0), (0, 1)], classes, np.array([[np.nan, 1.0]]))
    assert s["unknown"] == 1 and s["excluded"] == 0 and s["slopeHistogram"]["unknown"] == 1


def test_committed_ac08_result_reproduces_from_the_committed_clip_and_grids():
    """Offline check: docs/data/d5-traverse-in-area.geojson + public/area give the recorded AC-08 summary."""
    import json
    from pathlib import Path

    from sharpwalk.run_rover_path import STEP_M, load_grid

    root = Path(__file__).resolve().parents[2]
    area, rec = root / "public" / "area", json.loads((root / "docs" / "data" / "ac08-rover-path.json").read_text())
    report = json.loads((area / "build_report.json").read_text())
    lat0, lon0, n = report["origin"]["f1"]["lat"], report["origin"]["f1"]["lon"], report["rows"]
    t = Affine(*report["f6Transform"])
    cells = []
    for f in json.loads((root / "docs" / "data" / "d5-traverse-in-area.geojson").read_text())["features"]:
        c = np.asarray(f["geometry"]["coordinates"], float)
        x, y = lonlat_to_f6(c[:, 0], c[:, 1], lat0, lon0)
        cells.extend(cells_on_path(densify(np.column_stack([x, y]), STEP_M), t, n))
    s = ac08_summary(list(dict.fromkeys(cells)), load_grid(area, report, "terrain_class"), load_grid(area, report, "slope"))
    assert s == rec["summary"]
