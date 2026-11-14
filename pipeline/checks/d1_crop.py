# SI-assisted: drafted with Claude Code (Claude Opus 5.5); human Data and Science review pending.
# Phase 1.1 read-only evidence check. Writes only to $SHARPWALK_WORK (default ./work, git-ignored).
# Run with Python 3.11.18 and rasterio 1.4.4 / numpy 2.4.6. Not part of the production pipeline (1.2).
import os
WORK = os.environ.get("SHARPWALK_WORK", "work")
os.makedirs(WORK, exist_ok=True)
import rasterio, numpy as np, math, hashlib, sys
from rasterio.windows import from_bounds, Window
R=3396190.0
URL="/vsicurl/https://asc-pds-services.s3.us-west-2.amazonaws.com/mosaic/Mars/MSL/MSL_Gale_DEM_Mosaic_1m_v3.tif"
lat0,lat1,lon0,lon1=-4.840,-4.790,137.365,137.415
pad=0.002
xs=[R*math.radians(l) for l in (lon0-pad,lon1+pad)]; ys=[R*math.radians(l) for l in (lat0-pad,lat1+pad)]
with rasterio.Env(GDAL_DISABLE_READDIR_ON_OPEN="EMPTY_DIR", CPL_VSIL_CURL_ALLOWED_EXTENSIONS=".tif", GDAL_HTTP_MULTIRANGE="YES", GDAL_HTTP_MERGE_CONSECUTIVE_RANGES="YES", VSI_CACHE="TRUE"):
    with rasterio.open(URL) as ds:
        w=from_bounds(xs[0],ys[0],xs[1],ys[1],ds.transform).round_offsets().round_lengths()
        print("window",w, file=sys.stderr)
        a=ds.read(1,window=w)
        prof=ds.profile.copy(); prof.update(width=w.width,height=w.height,transform=ds.window_transform(w),tiled=True,blockxsize=256,blockysize=256,compress="deflate")
        with rasterio.open(f"{WORK}/d1_aoi_crop.tif","w",**prof) as out: out.write(a,1)
print("ok", a.shape)
