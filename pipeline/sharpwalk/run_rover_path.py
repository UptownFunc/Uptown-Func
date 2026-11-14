# SI-assisted: drafted with Claude Code (Claude Opus 5.5); human Data and Science review pending.
"""Run AC-08 on the committed area grids with the current D5 traverse.

usage: python -m sharpwalk.run_rover_path <area_dir> <out_dir>
Writes <out_dir>/ac08-rover-path.json (result + provenance) and <out_dir>/d5-traverse-in-area.geojson (the drives that
cross the area, as published, lon/lat), so the result can be re-derived offline from the clip.
"""
import datetime as dt
import hashlib
import json
import sys
import urllib.request
from pathlib import Path

import numpy as np
from affine import Affine

from .grids import dequantise
from .rover_path import ac08_summary, cells_on_path, densify, equirect_xy, lonlat_to_f6

TRAVERSE_URL = "https://mars.nasa.gov/mmgis-maps/MSL/Layers/json/MSL_traverse.json"
WAYPOINTS_URL = "https://mars.nasa.gov/mmgis-maps/MSL/Layers/json/MSL_waypoints.json"
STEP_M = 0.5


def fetch(url: str) -> tuple[bytes, str]:
    with urllib.request.urlopen(url, timeout=60) as r:
        body = r.read()
    return body, hashlib.sha256(body).hexdigest()


def load_grid(area: Path, report: dict, name: str) -> np.ndarray:
    g = next(x for x in report["grids"] if x["name"] == name)
    q = np.fromfile(area / g["path"], dtype=g["dtype"]).reshape(report["rows"], report["cols"])
    return q if name == "terrain_class" else dequantise(q, g["offset"], g["scale"], g["noData"])


def main(area_dir: str, out_dir: str) -> None:
    area, out = Path(area_dir), Path(out_dir)
    report = json.loads((area / "build_report.json").read_text())
    lat0, lon0, n = report["origin"]["f1"]["lat"], report["origin"]["f1"]["lon"], report["rows"]
    t = Affine(*report["f6Transform"])
    classes, slope = load_grid(area, report, "terrain_class"), load_grid(area, report, "slope")
    retrieved = dt.datetime.now(dt.timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")
    trav_raw, trav_sha = fetch(TRAVERSE_URL)
    wp_raw, wp_sha = fetch(WAYPOINTS_URL)
    trav, wps = json.loads(trav_raw), json.loads(wp_raw)

    cells, kept = [], []
    for f in trav["features"]:
        if f["geometry"]["type"] != "LineString":
            continue
        c = np.asarray(f["geometry"]["coordinates"], float)
        x, y = lonlat_to_f6(c[:, 0], c[:, 1], lat0, lon0)
        on = cells_on_path(densify(np.column_stack([x, y]), STEP_M), t, n)
        if on:
            kept.append(f)
            cells.extend(on)
    cells = list(dict.fromkeys(cells))  # a cell crossed by two drives counts once

    inside = []
    for w in wps["features"]:
        p = w["properties"]
        x, y = lonlat_to_f6([p["lon"]], [p["lat"]], lat0, lon0)
        if cells_on_path(np.array([[x[0], y[0]]]), t, n):
            inside.append(p)
    # D5 frame check: MMGIS easting/northing vs our equirectangular plane on the F1 sphere (the F7 display frame).
    frame_err = max((float(np.hypot(*(np.subtract(equirect_xy(p["lon"], p["lat"]), (p["easting"], p["northing"]))))) for p in inside), default=None)

    result = {
        "id": "AC-08", "what": "Share of Curiosity path cells the slope screen classes as excluded (sanity check, not ground truth)",
        "area": report["areaId"], "slopeLimit_deg": report["slopeLimit_deg"], "densifyStep_m": STEP_M,
        "summary": ac08_summary(cells, classes, slope),
        "drivesInArea": len(kept), "waypointsInArea": len(inside),
        "solRange": [min(p["sol"] for p in inside), max(p["sol"] for p in inside)] if inside else None,
        "d5FrameCheck_maxDiff_m": frame_err,
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
