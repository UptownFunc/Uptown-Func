# SI-assisted: drafted with Claude Code (Claude Opus 5.5); human Data and Science review pending.
"""AC-08 (plan 11, 19.11 weakness 64): share of Curiosity path cells the slope screen classes as excluded."""
import json
import math
from pathlib import Path

import numpy as np
import pytest
from affine import Affine
from rasterio.crs import CRS
from rasterio.warp import transform as rio_transform

from sharpwalk.display import F7_CRS
from sharpwalk.geo import R_F1, f1_surface_to_f6, ortho_crs
from sharpwalk.grids import CLASS_CANDIDATE, CLASS_EXCLUDED, CLASS_UNKNOWN
from sharpwalk.rover_path import ac08_summary, polyline_cells, to_f7

T4 = Affine(2.0, 0.0, -4.0, 0.0, -2.0, 4.0)  # 4 x 4 grid of 2 m cells centred on 0


def test_surface_points_on_the_f1_f5_f6_chain_equal_the_grids_ortho_projection():
    lat0, lon0 = -4.815, 137.39
    lon = np.array([137.37, 137.39, 137.41, 137.388886])
    lat = np.array([-4.80, -4.815, -4.83, -4.82602331])
    e, n = f1_surface_to_f6(lat, lon, lat0, lon0)
    sphere = CRS.from_proj4(f"+proj=longlat +R={R_F1:.0f} +no_defs")
    x, y = rio_transform(sphere, ortho_crs(lat0, lon0), lon.tolist(), lat.tolist())
    np.testing.assert_allclose(e, x, atol=1e-3)
    np.testing.assert_allclose(n, y, atol=1e-3)
    assert abs(e[1]) < 1e-6 and abs(n[1]) < 1e-6


def test_f7_uses_the_apps_display_crs():
    x, y = to_f7(np.array([137.4]), np.array([-4.8]))
    assert x[0] == pytest.approx(8_144_343.44, abs=0.01)  # plan 7.8 test vector (DECISIONS G-03)
    fx, fy = rio_transform(CRS.from_proj4(f"+proj=longlat +R={R_F1:.0f} +no_defs"), F7_CRS, [137.4], [-4.8])
    assert (x[0], y[0]) == pytest.approx((fx[0], fy[0]), abs=1e-6)


def test_every_cell_the_line_enters_is_counted_even_a_clipped_corner():
    # From (-3, 1) to (-1, 3.04): crosses y = 2 at x = -2.0196, just before x = -2, so it clips cell (0, 0).
    assert polyline_cells(np.array([[-3.0, 1.0], [-1.0, 3.04]]), T4, 4, 4) == [(1, 0), (0, 0), (0, 1)]


def test_cells_are_unique_in_visit_order_and_bounded_by_rows_and_cols_separately():
    t = Affine(2.0, 0.0, 0.0, 0.0, -2.0, 4.0)  # 2 rows x 3 cols
    xy = np.array([[0.5, 3.5], [5.5, 3.5], [0.5, 3.5], [7.5, 0.5]])
    cells = polyline_cells(xy, t, 2, 3)
    assert cells[:3] == [(0, 0), (0, 1), (0, 2)]
    assert all(0 <= r < 2 and 0 <= c < 3 for r, c in cells) and len(cells) == len(set(cells))


def test_summary_uses_known_cells_and_bins_that_match_the_screen():
    classes = np.array([[CLASS_CANDIDATE] * 20, [CLASS_EXCLUDED] + [CLASS_CANDIDATE] * 18 + [CLASS_UNKNOWN]], dtype=np.uint8)
    slope = np.full(classes.shape, 3.0)
    slope[1, 0], slope[0, 0], slope[1, 19] = 22.0, 20.0, np.nan  # exactly 20 deg is passable (screen excludes > 20)
    cells = [(0, c) for c in range(20)] + [(1, c) for c in range(20)]
    s = ac08_summary(cells, classes, slope)
    assert (s["cells"], s["knownCells"], s["excluded"], s["unknown"]) == (40, 39, 1, 1)
    assert s["excludedShare"] == pytest.approx(1 / 39) and s["unknownShare"] == pytest.approx(1 / 40)
    assert s["pass"] is True
    assert s["slopeHistogram"]["15-20"] == 1 and s["slopeHistogram"]["20-25"] == 1 and s["slopeHistogram"]["unknown"] == 1
    classes[0, 1:3] = CLASS_EXCLUDED
    assert ac08_summary(cells, classes, slope)["pass"] is False  # 3 / 39 = 7.7 %


def test_committed_ac08_result_reproduces_from_the_committed_clip_and_grids():
    """Offline check: docs/data/d5-traverse-in-area.geojson + public/area give the recorded AC-08 summary."""
    from sharpwalk.run_rover_path import drive_parts, load_grids

    root = Path(__file__).resolve().parents[2]
    area, rec = root / "public" / "area", json.loads((root / "docs" / "data" / "ac08-rover-path.json").read_text())
    report, classes, slope, hashes = load_grids(area)
    assert hashes == rec["grids"]
    lat0, lon0 = report["origin"]["f1"]["lat"], report["origin"]["f1"]["lon"]
    cells = []
    for f in json.loads((root / "docs" / "data" / "d5-traverse-in-area.geojson").read_text())["features"]:
        for part in drive_parts(f):
            e, n = f1_surface_to_f6(part[:, 1], part[:, 0], lat0, lon0)
            cells.extend(polyline_cells(np.column_stack([e, n]), Affine(*report["f6Transform"]), report["rows"], report["cols"]))
    assert ac08_summary(list(dict.fromkeys(cells)), classes, slope) == rec["summary"]
