# SI-assisted: drafted with Claude Code (Claude Opus 5.5); human Data and Science review pending.
# Phase 1.4 read-only check (plan 7.4 step 4, done in code because QGIS is unavailable): D1 hillshade vs D2
# luminance at three separated 400 m sites, by hillshade (12 azimuths) and by gradient-magnitude edges. Offsets come from the peak of a normalised cross-correlation over
# integer 1 m shifts within +/-25 m, testing 12 sun azimuths for the hillshade. Writes nothing.
import math
import numpy as np
import rasterio
from rasterio.windows import from_bounds
from rasterio.enums import Resampling

import sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from sharpwalk.geo import R_F1 as R
from sharpwalk.run_d1 import D1_URL
D1 = "/vsicurl/" + D1_URL
D2 = "/vsicurl/https://asc-pds-services.s3.us-west-2.amazonaws.com/mosaic/Mars/MSL/MSL_Gale_HiRISE-LRGB_78quads_sharp_cog.tif"
SITES = {"NW": (-4.797, 137.372), "C": (-4.815, 137.390), "SE": (-4.833, 137.408)}
HALF, MAXS = 200, 25
ENV = dict(GDAL_DISABLE_READDIR_ON_OPEN="EMPTY_DIR", CPL_VSIL_CURL_ALLOWED_EXTENSIONS=".tif")


def read(url, lat, lon, half, shape=None):
    xc, yc = R * math.radians(lon), R * math.radians(lat)
    with rasterio.open(url) as ds:
        w = from_bounds(xc - half, yc - half, xc + half, yc + half, ds.transform)
        if shape:
            a = ds.read(window=w, out_shape=(ds.count, *shape), resampling=Resampling.average).astype(float)
            return a.mean(axis=0), ds.crs
        a = ds.read(1, window=w).astype(float)
        if ds.nodata is not None and (a == ds.nodata).any():
            raise ValueError(f"D1 NoData inside the site window at ({lat}, {lon}); choose another site")
        return a, ds.crs


def hillshade(z, az_deg, alt_deg=45.0):
    gy, gx = np.gradient(z)
    slope = np.arctan(np.hypot(gx, gy)); aspect = np.arctan2(-gx, gy)
    az, alt = math.radians(az_deg), math.radians(alt_deg)
    return np.sin(alt) * np.cos(slope) + np.cos(alt) * np.sin(slope) * np.cos(az - aspect)


def ncc_peak(a, b):
    n = a.shape[0]; inner = slice(MAXS, n - MAXS)
    A = a[inner, inner]; A = (A - A.mean()) / A.std()
    best = (-2, 0, 0)
    for dy in range(-MAXS, MAXS + 1):
        for dx in range(-MAXS, MAXS + 1):
            B = b[MAXS + dy:n - MAXS + dy, MAXS + dx:n - MAXS + dx]
            r = float((A * (B - B.mean()) / B.std()).mean())
            if r > best[0]: best = (r, dx, dy)
    return best


with rasterio.Env(**ENV):
    for name, (lat, lon) in SITES.items():
        z, c1 = read(D1, lat, lon, HALF + MAXS)
        img, c2 = read(D2, lat, lon, HALF + MAXS, shape=z.shape)
        best = max(((ncc_peak(img, hillshade(z, az)), az) for az in range(0, 360, 30)), key=lambda t: t[0][0])
        (r, dx, dy), az = best
        ge = np.hypot(*np.gradient(np.hypot(*np.gradient(z))))  # edges of the slope field
        gi = np.hypot(*np.gradient(img))
        r2, dx2, dy2 = ncc_peak(gi, ge)
        print(f"site {name} edges: NCC {r2:.3f}, D1-D2 shift east {dx2:+d} m, north {-dy2:+d} m")
        # dx > 0: the D1 feature sits east of the D2 feature by dx metres (column offset); dy > 0: south.
        print(f"site {name} ({lat}, {lon}): best azimuth {az} deg, NCC {r:.3f}, D1-D2 shift east {dx:+d} m, north {-dy:+d} m")
    print("D1 CRS central meridian 0:", "central_meridian\",0" in c1.to_wkt().replace(" ", ""), "| D2 CRS:", c2.to_proj4())
