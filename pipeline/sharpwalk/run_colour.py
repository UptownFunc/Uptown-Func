# SI-assisted: drafted with Claude Code (Claude Opus 5.5) (3D-04); human Data and Science review pending.
"""Write the D2 orthophoto in its published colour for the 3D view. Usage: python -m sharpwalk.run_colour AREA_DIR

D2 (USGS Astrogeology MSL Gale HiRISE-LRGB mosaic, 0.25 m, F7) is read for exactly the window and the 1 m pixel grid of
the existing display layers (layers.json extentF7 and pixel_m), averaged to 1 m like the luminance layer, and written
as published: no stretch, no tint, no colour change. A small manifest (d2_colour.json) records the extent, the method
and the sha256; layers.json and the contracts are not changed.
"""
import datetime as dt
import json, sys
from pathlib import Path
import rasterio
from rasterio.enums import Resampling
from rasterio.windows import from_bounds

from .display import F7_CRS
from .outputs import sha256_file
from .run_display import D2_URL, ENV, _require_f7

NAME = "d2_colour.jpg"


def main(area_dir: str) -> dict:
    out = Path(area_dir)
    lay = json.loads((out / "layers.json").read_text())
    x0, y0, x1, y1 = lay["extentF7"]
    px = lay["pixel_m"]
    cols, rows = round((x1 - x0) / px), round((y1 - y0) / px)
    with rasterio.Env(**ENV):
        with rasterio.open("/vsicurl/" + D2_URL) as d2:
            _require_f7(d2, "D2", x0, y0, x1, y1)
            rgb = d2.read(window=from_bounds(x0, y0, x1, y1, d2.transform), out_shape=(3, rows, cols), resampling=Resampling.average)
    t = rasterio.transform.from_bounds(x0, y0, x1, y1, cols, rows)
    with rasterio.open(out / NAME, "w", driver="JPEG", count=3, dtype="uint8", QUALITY=88, width=cols, height=rows,
                       crs=F7_CRS, transform=t, photometric="RGB") as f:
        f.write(rgb)
    (out / (NAME + ".aux.xml")).unlink(missing_ok=True)
    manifest = {
        "id": "d2colour", "path": NAME, "source": "D2", "valueClass": "directly_measured",
        "name": "Orthophoto (D2 colour mosaic, as published)", "frame": "F7", "extentF7": [x0, y0, x1, y1], "pixel_m": px,
        "size": [cols, rows], "nativeResolution_m": 0.25,
        "method": "D2 RGB averaged from 0.25 m to the 1 m display grid of layers.json; no stretch, no tint",
        "builtOn": dt.date.today().isoformat(), "sha256": sha256_file(out / NAME),
    }
    (out / "d2_colour.json").write_text(json.dumps(manifest, indent=2))
    return manifest


if __name__ == "__main__":
    print(json.dumps(main(sys.argv[1]), indent=2))
