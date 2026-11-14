# SI-assisted: drafted with Claude Code (Claude Opus 5.5); human Data and Science + Design review pending.
"""Write the AREA sheet display layers in F7 next to an area build. Usage: python -m sharpwalk.run_display AREA_DIR

Products (plan 7.7/7.8/9.2): D2 luminance JPEG at 1 m (linear stretch only), D1 hillshade JPEG at 1 m (native D1
pixels, no resampling), terrain-class overlay PNG (F6 classes warped to F7 by nearest neighbour), layers.json.
"""
import datetime as dt
import json, math, sys
from pathlib import Path
import numpy as np
import rasterio
from affine import Affine
from rasterio.enums import Resampling
from rasterio.warp import reproject
from rasterio.windows import from_bounds

from .display import F7_CRS, class_overlay_rgba, f7_bounds_of_f6_grid, hillshade_u8, linear_stretch_u8
from .geo import ortho_crs
from .grids import dequantise
from .outputs import sha256_file
from .run_d1 import D1_URL

D2_URL = "https://asc-pds-services.s3.us-west-2.amazonaws.com/mosaic/Mars/MSL/MSL_Gale_HiRISE-LRGB_78quads_sharp_cog.tif"
ENV = dict(GDAL_DISABLE_READDIR_ON_OPEN="EMPTY_DIR", CPL_VSIL_CURL_ALLOWED_EXTENSIONS=".tif",
           GDAL_HTTP_MERGE_CONSECUTIVE_RANGES="YES")


def main(area_dir: str) -> None:
    out = Path(area_dir)
    rep = json.loads((out / "build_report.json").read_text())
    lat0, lon0 = rep["origin"]["f1"]["lat"], rep["origin"]["f1"]["lon"]
    n, cell = rep["rows"], rep["cellSize_m"]
    bx0, by0, bx1, by1 = f7_bounds_of_f6_grid(lat0, lon0, half_m=n * cell / 2)
    with rasterio.Env(**ENV):
        with rasterio.open("/vsicurl/" + D1_URL) as d1:
            # Snap outward to D1 pixel edges (1 m), then pad 1 px for the hillshade kernel.
            fw = from_bounds(bx0, by0, bx1, by1, d1.transform)
            c0, r0 = math.floor(fw.col_off), math.floor(fw.row_off)
            c1, r1 = math.ceil(fw.col_off + fw.width), math.ceil(fw.row_off + fw.height)
            w = rasterio.windows.Window(c0 - 1, r0 - 1, (c1 - c0) + 2, (r1 - r0) + 2)
            z = d1.read(1, window=w).astype(np.float64)
            z[z == d1.nodata] = np.nan
            t_pad = d1.window_transform(w)
        hs = hillshade_u8(z, dx=math.cos(math.radians(lat0)), dy=1.0)[1:-1, 1:-1]
        t = t_pad * Affine.translation(1, 1)
        rows, cols = hs.shape
        x0, y1 = t.c, t.f
        x1, y0 = x0 + cols * t.a, y1 + rows * t.e
        with rasterio.open("/vsicurl/" + D2_URL) as d2:
            wd = from_bounds(x0, y0, x1, y1, d2.transform)
            rgb = d2.read(window=wd, out_shape=(3, rows, cols), resampling=Resampling.average).astype(np.float64)
    lum = 0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2]
    lo, hi = np.percentile(lum, [0.5, 99.5])
    base = linear_stretch_u8(lum, lo, hi)

    grids = {g["name"]: g for g in rep["grids"]}
    def load(name, dtype):
        g = grids[name]
        q = np.fromfile(out / g["path"], dtype=dtype).reshape(n, n)
        return q, g
    cls_f6, _ = load("terrain_class", "<u1")
    qs, gs = load("slope", "<u2")
    slope_f6 = dequantise(qs, gs["offset"], gs["scale"], gs["noData"])
    f6_t = Affine(*rep["f6Transform"])
    cls_f7 = np.zeros((rows, cols), dtype=np.uint8)  # 0 = unknown outside the F6 square
    slope_f7 = np.full((rows, cols), np.nan)
    for src, dst in ((cls_f6, cls_f7), (slope_f6, slope_f7)):
        reproject(source=src, destination=dst, src_transform=f6_t, src_crs=ortho_crs(lat0, lon0),
                  dst_transform=t, dst_crs=F7_CRS, resampling=Resampling.nearest,
                  src_nodata=None, dst_nodata=None)
    overlay = class_overlay_rgba(cls_f7, slope_f7)

    prof = dict(width=cols, height=rows, crs=F7_CRS, transform=t)
    with rasterio.open(out / "d2_luminance.jpg", "w", driver="JPEG", count=1, dtype="uint8", QUALITY=85, **prof) as f:
        f.write(base, 1)
    with rasterio.open(out / "d1_hillshade.jpg", "w", driver="JPEG", count=1, dtype="uint8", QUALITY=85, **prof) as f:
        f.write(hs, 1)
    with rasterio.open(out / "terrain_overlay.png", "w", driver="PNG", count=4, dtype="uint8", **prof) as f:
        f.write(np.moveaxis(overlay, -1, 0))
    today = dt.date.today().isoformat()
    layers = {
        "frame": "F7", "crs": F7_CRS.to_proj4(), "extentF7": [x0, y0, x1, y1], "pixel_m": t.a,
        "originF1": rep["origin"]["f1"],
        "layers": [
            {"id": "d2", "path": "d2_luminance.jpg", "name": "Orthophoto (D2 colour mosaic, luminance)",
             "unit": "8-bit luminance", "valueClass": "directly_measured", "source": "D2", "resolution_m": 1.0,
             "nativeResolution_m": 0.25, "stretch": [round(float(lo), 2), round(float(hi), 2)], "date": today},
            {"id": "hillshade", "path": "d1_hillshade.jpg", "name": "Hillshade (D1)", "unit": "8-bit shade",
             "valueClass": "model_derived", "source": "D1", "resolution_m": 1.0, "date": today},
            {"id": "terrain", "path": "terrain_overlay.png", "name": "Terrain classes (slope-screened only, no rock detection)",
             "unit": "class", "valueClass": "model_derived", "source": "D1", "resolution_m": rep["cellSize_m"],
             "slopeLimit_deg": rep["slopeLimit_deg"], "date": today},
        ],
    }
    for L in layers["layers"]:
        L["sha256"] = sha256_file(out / L["path"])
    (out / "layers.json").write_text(json.dumps(layers, indent=2))
    print(json.dumps({"extentF7": layers["extentF7"], "size": [cols, rows]}))
    for L in layers["layers"]:
        print(L["id"], (out / L["path"]).stat().st_size, L["sha256"][:12])


if __name__ == "__main__":
    main(sys.argv[1])
