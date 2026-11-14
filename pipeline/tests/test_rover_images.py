# SI-assisted: drafted with Claude Code (Claude Opus 5.5); human Data and Science review pending.
"""D6 rover views (G3-01): every committed image matches the checksum in public/rover/images.json."""
import hashlib
import json
from pathlib import Path

ROVER = Path(__file__).resolve().parents[2] / "public" / "rover"


def test_rover_images_match_manifest_checksums():
    doc = json.loads((ROVER / "images.json").read_text())
    assert doc["datasetId"] == "D6"
    files = {i["file"] for i in doc["images"]}
    assert files == {p.name for p in ROVER.glob("*.jpg")}
    for i in doc["images"]:
        assert hashlib.sha256((ROVER / i["file"]).read_bytes()).hexdigest() == i["sha256"]
        assert i["credit"] == "NASA/JPL-Caltech"
