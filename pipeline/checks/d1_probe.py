# SI-assisted: drafted with Claude Code (Claude Opus 5.5); human Data and Science review pending.
# Phase 1.1 read-only evidence check. Writes only to $SHARPWALK_WORK (default ./work, git-ignored).
# Run with Python 3.11.18 and rasterio 1.4.4 / numpy 2.4.6. Not part of the production pipeline (1.2).
import os
WORK = os.environ.get("SHARPWALK_WORK", "work")
os.makedirs(WORK, exist_ok=True)
import rasterio, numpy as np, json
from rasterio.windows import from_bounds
URL="/vsicurl/https://asc-pds-services.s3.us-west-2.amazonaws.com/mosaic/Mars/MSL/MSL_Gale_DEM_Mosaic_1m_v3.tif"
with rasterio.Env(GDAL_DISABLE_READDIR_ON_OPEN="EMPTY_DIR", CPL_VSIL_CURL_ALLOWED_EXTENSIONS=".tif"):
    with rasterio.open(URL) as ds:
        print("size", ds.width, ds.height, "dtype", ds.dtypes, "nodata", ds.nodata)
        print("crs", ds.crs.to_wkt())
        print("transform", ds.transform)
        print("bounds", ds.bounds)
        print("tags", ds.tags(), ds.tags(1))
        print("profile", {k:v for k,v in ds.profile.items() if k not in('crs','transform')})
        print("units", ds.units, "descriptions", ds.descriptions)
