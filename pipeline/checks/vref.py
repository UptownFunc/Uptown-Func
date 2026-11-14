# SI-assisted: drafted with Claude Code (Claude Opus 5.5); human Data and Science review pending.
# Phase 1.1 read-only evidence check. Writes only to $SHARPWALK_WORK (default ./work, git-ignored).
# Run with Python 3.11.18 and rasterio 1.4.4 / numpy 2.4.6. Not part of the production pipeline (1.2).
import os
WORK = os.environ.get("SHARPWALK_WORK", "work")
os.makedirs(WORK, exist_ok=True)
import rasterio, numpy as np, math, sys
from rasterio.windows import Window
from rasterio.warp import transform as rio_transform
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from sharpwalk.geo import R_F1 as R
LONLAT = "+proj=longlat +R=3396190 +no_defs"
env=dict(GDAL_DISABLE_READDIR_ON_OPEN="EMPTY_DIR", CPL_VSIL_CURL_ALLOWED_EXTENSIONS=".IMG,.tif")
H={"T3 DTEEC_019698":"/vsicurl/https://hirise-pds.lpl.arizona.edu/PDS/DTM/ESP/ORB_019600_019699/ESP_019698_1750_ESP_019988_1750/DTEEC_019698_1750_019988_1750_U01.IMG",
   "Traverse DTEEC_009149":"/vsicurl/https://hirise-pds.lpl.arizona.edu/PDS/DTM/PSP/ORB_009100_009199/PSP_009149_1750_PSP_009294_1750/DTEEC_009149_1750_009294_1750_U01.IMG"}
d1=rasterio.open(f"{WORK}/d1_aoi_crop.tif"); a=d1.read(1)
lats=np.linspace(-4.835,-4.795,6); lons=np.linspace(137.37,137.41,6)
with rasterio.Env(**env):
  for name,u in H.items():
    ds=rasterio.open(u); print("==",name, ds.crs.to_proj4() if ds.crs else None, ds.res, "nodata",ds.nodata)
    diffs=[]
    for la in lats:
      for lo in lons:
        # D1 (equirect clon0, std par 0)
        (x1,),(y1,)=rio_transform(LONLAT, d1.crs, [lo], [la]); r1,c1=d1.index(x1,y1); z1=float(a[r1,c1])
        (x2,),(y2,)=rio_transform(LONLAT, ds.crs, [lo], [la]); r2,c2=ds.index(x2,y2)
        if not(1<=r2<ds.height-1 and 1<=c2<ds.width-1): continue
        z2=float(ds.read(1,window=Window(c2-1,r2-1,3,3)).astype('float64')[1,1])
        if z1==d1.nodata or (ds.nodata is not None and z2==ds.nodata) or z2<-1e5: continue
        diffs.append(z1-z2)
    d=np.array(diffs); print(f"points {len(d)}  D1-HiRISE mean {d.mean():.2f} m  median {np.median(d):.2f}  std {d.std():.2f}  min {d.min():.2f} max {d.max():.2f}")
