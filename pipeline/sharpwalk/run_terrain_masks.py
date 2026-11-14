# SI-assisted: drafted with Claude Code (Claude Opus 5.5); human Data and Science + Design review pending.
"""Write the terrain-class masks for the AREA sheet and its layers.json entry. Usage:
python -m sharpwalk.run_terrain_masks AREA_DIR (local files only; run_display also calls it).

One grey+alpha PNG per plan 9.2 symbol (steep 15-20 deg, excluded, unknown) on a 2 m F7 grid over the display extent
(the F6 classes are 2 m), warped from F6 by nearest neighbour exactly as the old overlay was. The sheet draws the
hatch and stipple in screen pixels (plan 7.8); the old overlay baked them into 1 m ground pixels and aliased at
coarse zoom (2.6 part 1 note), so terrain_overlay.png is removed."""
import datetime as dt
import json, math, sys
from pathlib import Path
from affine import Affine

from .display import classes_f7, terrain_masks, write_mask_png
from .outputs import sha256_file

MASK_M = 2.0
NAME = "Terrain classes (slope-screened only, no rock detection)"


def terrain_entry(area_dir, rep: dict, extent_f7, built_on: str) -> dict:
    out = Path(area_dir)
    x0, y0, x1, y1 = extent_f7
    cols, rows = math.ceil((x1 - x0) / MASK_M - 1e-9), math.ceil((y1 - y0) / MASK_M - 1e-9)
    cls, slope = classes_f7(out, rep, Affine(MASK_M, 0.0, x0, 0.0, -MASK_M, y1), rows, cols)
    masks = {}
    for kind, m in terrain_masks(cls, slope).items():
        path = f"terrain_{kind}.png"
        write_mask_png(out / path, m)
        masks[kind] = {"path": path, "sha256": sha256_file(out / path), "cells": int(m.sum())}
    return {"id": "terrain", "kind": "masks", "name": NAME, "unit": "class", "valueClass": "model_derived", "source": "D1",
            "resolution_m": rep["cellSize_m"], "slopeLimit_deg": rep["slopeLimit_deg"], "builtOn": built_on,
            "masks": masks, "mask_m": MASK_M, "maskExtentF7": [x0, y1 - rows * MASK_M, x0 + cols * MASK_M, y1]}


def main(area_dir: str) -> None:
    out = Path(area_dir)
    rep = json.loads((out / "build_report.json").read_text())
    layers = json.loads((out / "layers.json").read_text())
    entry = terrain_entry(out, rep, layers["extentF7"], dt.date.today().isoformat())
    layers["layers"] = [entry if L["id"] == "terrain" else L for L in layers["layers"]]
    (out / "layers.json").write_text(json.dumps(layers, indent=2))
    (out / "terrain_overlay.png").unlink(missing_ok=True)
    print({k: v["cells"] for k, v in entry["masks"].items()}, "mask grid", entry["maskExtentF7"])


if __name__ == "__main__":
    main(sys.argv[1])
