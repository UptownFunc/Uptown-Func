# SI-assisted: drafted with Claude Code (Claude Opus 5.5); human Data and Science review pending.
"""Run AC-08 on the committed area grids with the current D5 traverse.

usage: python -m sharpwalk.run_rover_path <area_dir> <out_dir>
Writes <out_dir>/ac08-rover-path.json (result, provenance, the grid checksums it ran on) and
<out_dir>/d5-traverse-in-area.geojson (the drives that cross the area, as published), so the result can be re-derived
offline from the clip (pipeline/tests/test_rover_path.py).
"""
import datetime as dt
import hashlib
import json
import sys
import urllib.request
from pathlib import Path

import numpy as np
from affine import Affine

from .geo import f1_surface_to_f6
from .grids import dequantise
from .outputs import sha256_file
from .rover_path import ac08_summary, polyline_cells, to_f7

TRAVERSE_URL = "https://mars.nasa.gov/mmgis-maps/MSL/Layers/json/MSL_traverse.json"
WAYPOINTS_URL = "https://mars.nasa.gov/mmgis-maps/MSL/Layers/json/MSL_waypoints.json"


def fetch(url: str) -> tuple[bytes, str]:
    with urllib.request.urlopen(url, timeout=60) as r:
        body = r.read()
    return body, hashlib.sha256(body).hexdigest()


def load_grids(area: Path):
    """The committed grids, each checked against the sha256 in build_report.json. Returns report, classes, slope, hashes."""
    report = json.loads((area / "build_report.json").read_text())
    shape, out, hashes = (report["rows"], report["cols"]), {}, {}
    for g in report["grids"]:
        if g["name"] not in ("terrain_class", "slope"):
            continue
        if sha256_file(area / g["path"]) != g["sha256"]:
            raise ValueError(f"{g['path']} does not match its sha256 in build_report.json")
        q = np.fromfile(area / g["path"], dtype=g["dtype"]).reshape(shape)
        out[g["name"]] = q if g["name"] == "terrain_class" else dequantise(q, g["offset"], g["scale"], g["noData"])
        hashes[g["name"]] = g["sha256"]
    return report, out["terrain_class"], out["slope"], hashes


def drive_parts(f: dict) -> list:
    """Coordinate arrays of a LineString or MultiLineString drive; [] for other geometry (counted by the caller)."""
    g = f.get("geometry") or {}
    if g.get("type") == "LineString":
        return [np.asarray(g["coordinates"], float)]
    if g.get("type") == "MultiLineString":
        return [np.asarray(p, float) for p in g["coordinates"] if p]
    return []


def main(area_dir: str, out_dir: str) -> None:
    area, out = Path(area_dir), Path(out_dir)
    report, classes, slope, hashes = load_grids(area)
    lat0, lon0 = report["origin"]["f1"]["lat"], report["origin"]["f1"]["lon"]
    t, rows, cols = Affine(*report["f6Transform"]), report["rows"], report["cols"]
    retrieved = dt.datetime.now(dt.timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")
    trav_raw, trav_sha = fetch(TRAVERSE_URL)
    wp_raw, wp_sha = fetch(WAYPOINTS_URL)
    trav, wps = json.loads(trav_raw), json.loads(wp_raw)

    cells, kept, skipped = [], [], 0
    for f in trav["features"]:
        parts = drive_parts(f)
        if not parts:
            skipped += 1
            continue
        on = []
        for c in parts:
            e, n = f1_surface_to_f6(c[:, 1], c[:, 0], lat0, lon0)
            on.extend(polyline_cells(np.column_stack([e, n]), t, rows, cols))
        if on:
            kept.append(f)
            cells.extend(on)
    cells = list(dict.fromkeys(cells))  # a cell crossed by two drives counts once

    inside = []
    for w in wps["features"]:
        p = w["properties"]
        e, n = f1_surface_to_f6([p["lat"]], [p["lon"]], lat0, lon0)
        if polyline_cells(np.array([[e[0], n[0]]]), t, rows, cols):
            inside.append(p)
    # D5 frame check: MMGIS easting/northing vs the app's F7 display CRS for the same lon/lat.
    if inside:
        fx, fy = to_f7([p["lon"] for p in inside], [p["lat"] for p in inside])
        frame_err = float(np.max(np.hypot(fx - [p["easting"] for p in inside], fy - [p["northing"] for p in inside])))
    else:
        frame_err = None

    result = {
        "id": "AC-08", "what": "Share of Curiosity path cells the slope screen classes as excluded (sanity check, not ground truth)",
        "area": report["areaId"], "slopeLimit_deg": report["slopeLimit_deg"], "grids": hashes,
        "method": "exact grid traversal of each drive line through geo.f1_surface_to_f6 (F1 -> F5 -> F6)",
        "summary": ac08_summary(cells, classes, slope),
        "drivesInArea": len(kept), "featuresSkippedNotLines": skipped, "waypointsInArea": len(inside),
        "waypointSolRangeInArea": [min(p["sol"] for p in inside), max(p["sol"] for p in inside)] if inside else None,
        "solNote": "traverse lines carry no sol; the range is from waypoints inside the area, so drives entering from outside may add earlier or later sols",
        "d5F7FrameCheck_maxDiff_m": frame_err,
        "source": {"dataset": "D5", "title": "NASA/JPL MMGIS Curiosity (MSL) traverse and waypoints",
                   "traverse": {"url": TRAVERSE_URL, "sha256": trav_sha}, "waypoints": {"url": WAYPOINTS_URL, "sha256": wp_sha},
                   "retrievedAt": retrieved, "localisationError": "UNVERIFIED (plan O-17)"},
    }
    out.mkdir(parents=True, exist_ok=True)
    (out / "ac08-rover-path.json").write_text(json.dumps(result, indent=1) + "\n")
    (out / "d5-traverse-in-area.geojson").write_text(json.dumps({"type": "FeatureCollection", "features": kept}) + "\n")
    print(json.dumps(result, indent=1))


if __name__ == "__main__":
    main(*sys.argv[1:3])
