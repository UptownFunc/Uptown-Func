# SI-assisted: drafted with Claude Code (Claude Opus 5.5); human Data and Science review pending.
"""Run the area build on the real D1 window. Usage: python -m sharpwalk.run_d1 OUT_DIR

Area: DECISIONS.md D-03 (4.790-4.840 S, 137.365-137.415 E; origin at its centre). 3 x 3 km at 2 m (plan 6.4/7.7).
Thin I/O glue around build_area; the science steps are tested in tests/.
"""
import datetime as dt
import hashlib, json, math, sys
from pathlib import Path
import rasterio
from rasterio.windows import from_bounds

from .build import build_area
from .geo import R_F1

D1_URL = "https://asc-pds-services.s3.us-west-2.amazonaws.com/mosaic/Mars/MSL/MSL_Gale_DEM_Mosaic_1m_v3.tif"
LAT0, LON0 = -4.815, 137.390
CELL_M, N = 2.0, 1500
SLOPE_LIMIT_DEG = 20.0  # Assumed (plan 6.4)


def main(out_dir: str) -> None:
    out = Path(out_dir)
    pad_m = N * CELL_M / 2 * 1.5
    xc, yc = R_F1 * math.radians(LON0), R_F1 * math.radians(LAT0)
    env = dict(GDAL_DISABLE_READDIR_ON_OPEN="EMPTY_DIR", CPL_VSIL_CURL_ALLOWED_EXTENSIONS=".tif",
               GDAL_HTTP_MERGE_CONSECUTIVE_RANGES="YES")
    with rasterio.Env(**env), rasterio.open("/vsicurl/" + D1_URL) as ds:
        w = from_bounds(xc - pad_m, yc - pad_m, xc + pad_m, yc + pad_m, ds.transform).round_offsets().round_lengths()
        src = ds.read(1, window=w)
        t, crs, nd = ds.window_transform(w), ds.crs, ds.nodata
        area_or_point = ds.tags().get("AREA_OR_POINT")
    window_sha = hashlib.sha256(src.astype("<f4").tobytes()).hexdigest()
    source = {"d1Window": [w.col_off, w.row_off, w.width, w.height], "d1AreaOrPoint": area_or_point,
              "sha256Scope": "sha256 of the float32 little-endian window read, not of the full D1 file",
              "gdal": rasterio.__gdal_version__, "rasterio": rasterio.__version__}
    report = build_area(src, t, crs, nd, LAT0, LON0, cell_m=CELL_M, n=N, slope_limit_deg=SLOPE_LIMIT_DEG,
                        out_dir=out, area_id="boxwork-demo-D03", source=source)
    provenance = [{
        "id": "D1", "productId": "MSL_Gale_DEM_Mosaic_1m_v3", "url": D1_URL,
        "licence": "USGS Astrogeology: Use Constraints None; Access Constraints: please credit authors",
        "crs": crs.to_wkt(), "latitudeType": "planetocentric", "longitudeDirection": "east",
        "verticalReference": "unknown", "resolution_m": 1.0, "valueClass": "directly_measured",
        "retrievedOn": dt.date.today().isoformat(), "sha256": window_sha,
    }]
    (out / "provenance.json").write_text(json.dumps(provenance, indent=2))
    print(json.dumps({k: report[k] for k in ("counts", "elevationRange_m", "slopeOver60_deg", "origin")}, indent=1))
    for g in report["grids"]:
        print(g["name"], g["dtype"], g["sha256"])


if __name__ == "__main__":
    main(sys.argv[1])
