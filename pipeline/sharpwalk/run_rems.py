# SI-assisted: drafted with Claude Code (Claude Opus 5.5); human Data and Science review pending.
"""Fetch the REMS feed once and write <out>/rems.json. Run: python -m sharpwalk.run_rems ../public/conditions"""
import datetime
import json
import sys
import urllib.request
from pathlib import Path
from .rems import FEED_URL, build_snapshot


def main(out_dir: str) -> None:
    with urllib.request.urlopen(FEED_URL, timeout=60) as r:
        raw = r.read()
    now = datetime.datetime.now(datetime.timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")
    snap = build_snapshot(raw, url=FEED_URL, retrieved_at=now)
    out = Path(out_dir)
    out.mkdir(parents=True, exist_ok=True)
    (out / "rems.json").write_text(json.dumps(snap, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(json.dumps(snap["reading"]))


if __name__ == "__main__":
    main(sys.argv[1])
