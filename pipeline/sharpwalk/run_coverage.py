# SI-assisted: drafted with Claude Code (Claude Opus 5.5); human Data and Science review pending.
"""Write <AREA_DIR>/coverage.geojson: the D1 and D2 coverage outlines on this sheet's F7 display grid (plan 7.8), and
register it with its sha256 in layers.json. Usage: python -m sharpwalk.run_coverage AREA_DIR (after run_display).

D1: valid where the 1 m DEM is not NoData (read at native pixels; the display grid is snapped to them).
D2: the COG's own per-dataset mask band, read at 1 m (its overview level) with nearest resampling."""
import json, sys
from pathlib import Path
import numpy as np
import rasterio
from affine import Affine
from rasterio.enums import Resampling
from rasterio.windows import from_bounds

from .coverage import coverage_collection, coverage_feature
from .outputs import sha256_file
from .run_d1 import D1_URL
from .run_display import D2_URL, ENV


def main(area_dir: str) -> None:
    out = Path(area_dir)
    layers = json.loads((out / "layers.json").read_text())
    x0, y0, x1, y1 = layers["extentF7"]
    px = layers["pixel_m"]
    cols, rows = round((x1 - x0) / px), round((y1 - y0) / px)
    t = Affine(px, 0.0, x0, 0.0, -px, y1)
    by_source = {}
    for L in layers["layers"]:
        by_source.setdefault(L["source"], []).append(L["id"])
    with rasterio.Env(**ENV):
        with rasterio.open("/vsicurl/" + D1_URL) as d1:
            w = from_bounds(x0, y0, x1, y1, d1.transform).round_offsets().round_lengths()
            if (w.width, w.height) != (cols, rows):
                raise ValueError(f"D1 window {w} does not match the display grid {cols} x {rows}")
            d1_valid = d1.read_masks(1, window=w) > 0
        with rasterio.open("/vsicurl/" + D2_URL) as d2:
            wd = from_bounds(x0, y0, x1, y1, d2.transform)
            d2_valid = d2.read_masks(1, window=wd, out_shape=(rows, cols), resampling=Resampling.nearest) > 0
    fc = coverage_collection([
        coverage_feature("D1", "D1 elevation coverage", by_source.get("D1", []), d1_valid, t,
                         method="valid (not NoData) D1 pixels on the 1 m F7 display grid"),
        coverage_feature("D2", "D2 colour coverage", by_source.get("D2", []), d2_valid, t,
                         method="D2 COG mask band at 1 m (overview level, nearest) on the F7 display grid"),
    ])
    (out / "coverage.geojson").write_text(json.dumps(fc, separators=(",", ":")) + "\n")
    layers["coverage"] = {"path": "coverage.geojson", "sha256": sha256_file(out / "coverage.geojson")}
    (out / "layers.json").write_text(json.dumps(layers, indent=2))
    for f in fc["features"]:
        p = f["properties"]
        print(p["dataset"], p["layerIds"], "validFraction", round(p["validFraction"], 6), "polygons", len(f["geometry"]["coordinates"]))


if __name__ == "__main__":
    main(sys.argv[1])
