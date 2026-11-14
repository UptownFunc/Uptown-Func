# SI-assisted: drafted with Claude Code (Claude Opus 5.5); human Captain review pending.
# docs/licences.md must match the actual package trees (regenerate with scripts/licences.py when dependencies change).
import subprocess, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


def test_licence_inventory_is_current():
    r = subprocess.run([sys.executable, str(ROOT / "scripts" / "licences.py"), "--check"], cwd=ROOT)
    assert r.returncode == 0, "docs/licences.md is stale: run .venv/bin/python scripts/licences.py > docs/licences.md"
