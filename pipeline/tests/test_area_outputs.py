# SI-assisted: drafted with Claude Code (Claude Opus 5.5); human Data and Science review pending.
# C-14: the committed area outputs in public/area must match the checksums the pipeline recorded, so the deployed
# static files are exactly the reproducible build (grid sha256 in build_report.json, layer sha256 in layers.json).
import hashlib, json
from pathlib import Path
import pytest

AREA = Path(__file__).resolve().parents[2] / "public" / "area"
pytestmark = pytest.mark.skipif(not (AREA / "build_report.json").exists(), reason="no committed area outputs")


def _sha(p: Path) -> str:
    return hashlib.sha256(p.read_bytes()).hexdigest()


def test_grids_match_build_report():
    rep = json.loads((AREA / "build_report.json").read_text())
    for g in rep["grids"]:
        assert _sha(AREA / g["path"]) == g["sha256"], g["name"]


def test_display_layers_match_layers_json():
    layers = json.loads((AREA / "layers.json").read_text())
    for L in layers["layers"]:
        assert _sha(AREA / L["path"]) == L["sha256"], L["id"]


def test_provenance_covers_every_dataset_used():
    prov = {r["id"] for r in json.loads((AREA / "provenance.json").read_text())}
    layers = json.loads((AREA / "layers.json").read_text())
    assert {L["source"] for L in layers["layers"]} <= prov


def test_coverage_outlines_match_their_checksum_and_cover_every_layer():
    """Plan 7.8: each dataset ships its coverage outline. Every display layer is listed by the feature of its source."""
    layers = json.loads((AREA / "layers.json").read_text())
    assert "coverage" in layers, "layers.json lists no coverage outline: run `python -m sharpwalk.run_coverage` after run_display"
    cov = layers["coverage"]
    assert _sha(AREA / cov["path"]) == cov["sha256"]
    fc = json.loads((AREA / cov["path"]).read_text())
    assert fc["type"] == "FeatureCollection" and fc["frame"] == "F1"
    by_dataset = {f["properties"]["dataset"]: f for f in fc["features"]}
    for L in layers["layers"]:
        assert L["source"] in by_dataset, f"no coverage outline for {L['source']} (layer {L['id']})"
        f = by_dataset[L["source"]]
        assert L["id"] in f["properties"]["layerIds"]
        assert 0.0 <= f["properties"]["validFraction"] <= 1.0
        lons = [p[0] for poly in f["geometry"]["coordinates"] for ring in poly for p in ring]
        k = 3.141592653589793 * 3_396_190 / 180
        x0, _, x1, _ = layers["extentF7"]
        # The outline lies on this sheet's display window (F7 -> F1 is x / k).
        assert min(lons) >= x0 / k - 1e-7 and max(lons) <= x1 / k + 1e-7


def test_contours_match_their_checksum_and_the_sheet_spec():
    """Plan 7.8 / 9: D1 contours at 10 m, every fifth an index line, in F1 inside this sheet's display window."""
    layers = json.loads((AREA / "layers.json").read_text())
    assert "contours" in layers, "layers.json lists no contours: run `python -m sharpwalk.run_contours` after run_display"
    c = layers["contours"]
    assert _sha(AREA / c["path"]) == c["sha256"]
    fc = json.loads((AREA / c["path"]).read_text())
    assert set(c) == {"path", "sha256"}  # the file carries its own metadata (R-13)
    assert fc["frame"] == "F1" and fc["properties"]["source"] == "D1"
    assert fc["properties"]["interval_m"] == 10.0 and fc["properties"]["indexEvery"] == 5
    k = 3.141592653589793 * 3_396_190 / 180
    x0, y0, x1, y1 = layers["extentF7"]
    for f in fc["features"]:
        e = f["properties"]["elev_m"]
        assert e % 10.0 == 0.0 and f["properties"]["index"] == (e % 50.0 == 0.0)
        for lon, lat in f["geometry"]["coordinates"]:
            assert x0 / k - 1e-7 <= lon <= x1 / k + 1e-7 and y0 / k - 1e-7 <= lat <= y1 / k + 1e-7
