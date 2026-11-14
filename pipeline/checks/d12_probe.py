# SI-assisted: drafted with Claude Code (Claude Opus 5.5); human Data and Science review pending.
# Phase 1.1 read-only evidence check. Writes only to $SHARPWALK_WORK (default ./work, git-ignored).
# Run with Python 3.11.18 and rasterio 1.4.4 / numpy 2.4.6. Not part of the production pipeline (1.2).
import os
WORK = os.environ.get("SHARPWALK_WORK", "work")
os.makedirs(WORK, exist_ok=True)
import rasterio
u="/vsicurl/https://asc-pds-services.s3.us-west-2.amazonaws.com/mosaic/Mars/HRSC_MOLA_Blend/Mars_HRSC_MOLA_BlendDEM_Global_200mp_v2.tif"
with rasterio.Env(GDAL_DISABLE_READDIR_ON_OPEN="EMPTY_DIR", CPL_VSIL_CURL_ALLOWED_EXTENSIONS=".tif"):
  with rasterio.open(u) as ds:
    print(ds.width,ds.height,ds.dtypes,ds.nodata,ds.res); print(ds.crs.to_wkt()); print(ds.bounds); print(ds.tags(),ds.tags(1)); print(ds.scales,ds.offsets,ds.units)
