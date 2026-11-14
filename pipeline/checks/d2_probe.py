# SI-assisted: drafted with Claude Code (Claude Opus 5.5); human Data and Science review pending.
# Phase 1.1 read-only evidence check. Writes only to $SHARPWALK_WORK (default ./work, git-ignored).
# Run with Python 3.11.18 and rasterio 1.4.4 / numpy 2.4.6. Not part of the production pipeline (1.2).
import os
WORK = os.environ.get("SHARPWALK_WORK", "work")
os.makedirs(WORK, exist_ok=True)
import rasterio, numpy as np, math
from rasterio.windows import from_bounds
R=3396190.0
URL="/vsicurl/https://asc-pds-services.s3.us-west-2.amazonaws.com/mosaic/Mars/MSL/MSL_Gale_HiRISE-LRGB_78quads_sharp_cog.tif"
with rasterio.Env(GDAL_DISABLE_READDIR_ON_OPEN="EMPTY_DIR", CPL_VSIL_CURL_ALLOWED_EXTENSIONS=".tif"):
  with rasterio.open(URL) as ds:
    print("size",ds.width,ds.height,"bands",ds.count,ds.dtypes[0],"nodata",ds.nodata,"res",ds.res)
    print("crs",ds.crs.to_wkt()[:200]); b=ds.bounds
    print("lon",math.degrees(b.left/R),math.degrees(b.right/R),"lat",math.degrees(b.bottom/R),math.degrees(b.top/R))
    print("overviews",ds.overviews(1),"block",ds.block_shapes[0],"layout",ds.tags(ns='IMAGE_STRUCTURE'))
    # sample AOI at overview to count empty cells
    xs=[R*math.radians(l) for l in (137.365,137.415)]; ys=[R*math.radians(l) for l in (-4.840,-4.790)]
    w=from_bounds(xs[0],ys[0],xs[1],ys[1],ds.transform)
    a=ds.read(window=w,out_shape=(ds.count,300,300))
    empty=(a.max(axis=0)==0).mean() if ds.nodata is None else (a[0]==ds.nodata).mean()
    print("AOI sampled 300x300: fraction empty/nodata",round(float(empty),4))
