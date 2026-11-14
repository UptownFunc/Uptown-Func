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
