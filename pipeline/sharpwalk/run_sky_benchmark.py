# SI-assisted: drafted with Claude Code (Claude Opus 5.5); human Data and Science review pending.
"""AC-07 geometric obstruction benchmark at Butte M12 (plan 6.7, AC-07, AC-21, AC-22). Geometry, not dose.

usage: python -m sharpwalk.run_sky_benchmark <out_dir>
Observer: the D5 waypoint where Curiosity was parked for sols 1456-1467 (the last drive before sol 1456; the run checks
that no drive is logged during those sols). Heights: D1 (1 m) within R_near, else D12 (200 m) shifted by the measured
mean D1 - D12 offset. Rays every 0.5 deg; ranges every 1 m to R_near, then every 100 m (half a D12 pixel) to 150 km;
every configuration is a subset of that one set of rays. The reference period (about 10 %) is not computed: its sols
are UNVERIFIED (plan R-13).
"""
import datetime as dt
import hashlib
import json
import math
import sys
import urllib.request
from pathlib import Path

import numpy as np
import rasterio
from rasterio.crs import CRS
from rasterio.warp import transform as rio_transform
from rasterio.windows import from_bounds

from .geo import R_F1, ortho_crs
from .sky import bilinear, f_obs, horizon_with_range

D1_URL = "https://asc-pds-services.s3.us-west-2.amazonaws.com/mosaic/Mars/MSL/MSL_Gale_DEM_Mosaic_1m_v3.tif"
D12_URL = "https://asc-pds-services.s3.us-west-2.amazonaws.com/mosaic/Mars/HRSC_MOLA_Blend/Mars_HRSC_MOLA_BlendDEM_Global_200mp_v2.tif"
WAYPOINTS_URL = "https://mars.nasa.gov/mmgis-maps/MSL/Layers/json/MSL_waypoints.json"
M12_SOLS = (1456, 1467)                     # Ehresmann et al. 2021 (plan 6.7)
PUBLISHED = {"f_obs": 0.37 / 2, "label": "0.37 pi of 2 pi (about 19 %), Ehresmann et al. 2021; Guo et al. 2021"}
THRESHOLD_PP = 3.0                          # Assumed (plan AC-07)
BASE = {"N": 360, "R_far_m": 100_000.0, "R_near_m": 3_000.0, "h_obs_m": 1.0}  # h_obs base is Assumed (0-2 m sweep)
NEAR_MAX, FAR_MAX, FAR_STEP = 3_000.0, 150_000.0, 100.0
SPHERE = CRS.from_proj4(f"+proj=longlat +R={R_F1:.0f} +no_defs")
ENV = {"GDAL_DISABLE_READDIR_ON_OPEN": "EMPTY_DIR", "GDAL_HTTP_MULTIRANGE": "YES", "GDAL_HTTP_MERGE_CONSECUTIVE_RANGES": "YES"}


def m12_position(features: list) -> dict:
    """The final waypoint before sol 1456; refuses if a drive is logged during sols 1456-1467 (the rover moved)."""
    props = [f["properties"] for f in features]
    if any(M12_SOLS[0] <= p["sol"] <= M12_SOLS[1] for p in props):
        raise ValueError("a drive is logged during sols 1456-1467: average over the positions instead (plan 6.7)")
    return max((p for p in props if p["sol"] < M12_SOLS[0]), key=lambda p: (p["sol"], p["site"], p["drive"]))


def read_window(url: str, bounds, nodata_to_nan=True):
    with rasterio.Env(**ENV), rasterio.open("/vsicurl/" + url) as s:
        w = from_bounds(*bounds, s.transform).round_offsets().round_lengths()
        a = s.read(1, window=w).astype(np.float64)
        if nodata_to_nan and s.nodata is not None:
            a[a == s.nodata] = np.nan
        return a, s.window_transform(w), s.crs


def main(out_dir: str) -> None:
    out = Path(out_dir)
    with urllib.request.urlopen(WAYPOINTS_URL, timeout=60) as r:
        raw = r.read()
    wp = m12_position(json.loads(raw)["features"])
    lat0, lon0 = wp["lat"], wp["lon"]

    # D1 window (eqc metres) around the observer; D12 window (degrees) to beyond the largest R_far.
    (ox,), (oy,) = rio_transform(SPHERE, CRS.from_proj4(f"+proj=eqc +lat_ts=0 +lat_0=0 +lon_0=0 +R={R_F1:.0f} +units=m +no_defs"), [lon0], [lat0])
    pad = NEAR_MAX + 50
    d1, d1_t, d1_crs = read_window(D1_URL, (ox - pad, oy - pad, ox + pad, oy + pad))
    deg = (FAR_MAX + 2_000) / (R_F1 * math.pi / 180) / math.cos(math.radians(lat0))
    d12, d12_t, _ = read_window(D12_URL, (lon0 - deg, lat0 - deg, lon0 + deg, lat0 + deg))

    def heights_at(lon, lat):
        x, y = rio_transform(SPHERE, d1_crs, lon.ravel().tolist(), lat.ravel().tolist())
        z1 = bilinear(d1, d1_t, np.asarray(x), np.asarray(y)).reshape(lon.shape)
        z12 = bilinear(d12, d12_t, lon, lat)
        return z1, z12

    # D1 - D12 offset on a 200 m lattice within the D1 window (plan 6.7: measured and removed before merging).
    g = np.arange(-2_800.0, 2_801.0, 200.0)
    ge, gn = np.meshgrid(g, g)
    glon, glat = rio_transform(ortho_crs(lat0, lon0), SPHERE, ge.ravel().tolist(), gn.ravel().tolist())
    z1, z12 = heights_at(np.asarray(glon), np.asarray(glat))
    diff = (z1 - z12)[np.isfinite(z1 - z12)]
    offset, spread = float(diff.mean()), float(diff.std())

    # One set of rays: 720 azimuths, near 1 m steps, far 100 m steps.
    az = np.arange(720) * 0.5
    ranges = np.concatenate([np.arange(1.0, NEAR_MAX + 0.5, 1.0), np.arange(NEAR_MAX + FAR_STEP, FAR_MAX + 1, FAR_STEP)])
    A, Rg = np.meshgrid(az, ranges, indexing="ij")
    e, n = Rg * np.sin(np.radians(A)), Rg * np.cos(np.radians(A))
    lon, lat = rio_transform(ortho_crs(lat0, lon0), SPHERE, e.ravel().tolist(), n.ravel().tolist())
    Z1, Z12 = heights_at(np.asarray(lon).reshape(A.shape), np.asarray(lat).reshape(A.shape))
    Z12 = Z12 + offset
    (z0,), = [bilinear(d1, d1_t, np.array([ox]), np.array([oy]))]

    def run(N, R_far_m, R_near_m, h_obs_m):
        k = np.arange(0, 720, 720 // N)
        m = ranges <= R_far_m
        z = np.where((ranges[m] <= R_near_m)[None, :] & np.isfinite(Z1[k][:, m]), Z1[k][:, m], Z12[k][:, m])
        gam, r_at = horizon_with_range(lambda r, a: z, z0 + h_obs_m, az[k], ranges[m])
        return gam, f_obs(gam), r_at

    def bands(r_at, gam):
        """Share of azimuths whose horizon is set in each range band, and their share of f_obs (plan AC-22)."""
        edges = [(0, 10), (10, 100), (100, 1_500), (1_500, 3_000), (3_000, 50_000), (50_000, math.inf)]
        out = {}
        for lo, hi in edges:
            m = (r_at > lo) & (r_at <= hi)
            out[f"{lo}-{hi} m" if hi != math.inf else f">{lo} m"] = {"azimuths": float(m.mean()), "f_obs_part": float(np.sin(gam[m]).sum() / len(gam))}
        out["unobstructed"] = {"azimuths": float(np.isnan(r_at).mean()), "f_obs_part": 0.0}
        return out

    rows = []
    for label, cfgs in [("h_obs", [dict(BASE, h_obs_m=h) for h in (0.0, 1.0, 2.0)]),
                        ("AC-21 azimuths", [dict(BASE, N=N) for N in (180, 360, 720)]),
                        ("AC-22 R_far", [dict(BASE, R_far_m=R) for R in (50_000.0, 100_000.0, 150_000.0)]),
                        ("R_near (D1 extent)", [dict(BASE, R_near_m=R) for R in (1_500.0, 3_000.0)])]:
        for c in cfgs:
            gam, f, r_at = run(**c)
            rows.append({"check": label, **c, "f_obs": f, "meanGamma_deg": float(np.degrees(gam).mean()),
                         "maxGamma_deg": float(np.degrees(gam).max()), "settingRangeShare": bands(r_at, gam)})
    gam, f, r_at = run(**BASE)
    diff_pp = 100 * (f - PUBLISHED["f_obs"])
    res = {
        "id": "AC-07", "what": "Geometric sky obstruction at Butte M12 from D1/D12 (plan 6.7); geometry, not dose; a benchmark, not validation",
        "observer": {"source": "D5 waypoint (final drive before sol 1456; none logged sols 1456-1467)", **{k: wp[k] for k in ("sol", "site", "drive", "lat", "lon", "elev_geoid")},
                     "z0_D1_m": float(z0)},
        "base": BASE, "f_obs": f, "published": PUBLISHED, "difference_pp": diff_pp, "threshold_pp": THRESHOLD_PP,
        "pass": bool(abs(diff_pp) <= THRESHOLD_PP),
        "meanGamma_deg": float(np.degrees(gam).mean()), "maxGamma_deg": float(np.degrees(gam).max()),
        "settingRangeShare": bands(r_at, gam),
        "publishedShape": "average blocking angle 11 deg, obstructions no higher than 30 deg (Ehresmann et al. 2021, via plan 6.7)",
        "sensitivity": rows,
        "d1MinusD12Offset_m": {"mean": offset, "std": spread, "samples": int(diff.size)},
        "referencePosition": "not computed: the reference-period sols are UNVERIFIED (plan R-13); the about 10 % figure is not compared",
        "horizonBase_deg": [round(float(v), 2) for v in np.degrees(gam)],
        "horizonBaseRange_m": [None if np.isnan(v) else float(v) for v in r_at],
        "sources": {"D1": D1_URL, "D12": D12_URL, "D5": {"url": WAYPOINTS_URL, "sha256": hashlib.sha256(raw).hexdigest()},
                    "retrievedAt": dt.datetime.now(dt.timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")},
    }
    out.mkdir(parents=True, exist_ok=True)
    (out / "ac07-sky-m12.json").write_text(json.dumps(res, indent=1) + "\n")
    print(json.dumps({k: v for k, v in res.items() if k not in ("horizonBase_deg", "horizonBaseRange_m", "sensitivity")}, indent=1))
    for r in rows:
        print(r["check"], r["N"], r["R_far_m"], r["R_near_m"], r["h_obs_m"], round(100 * r["f_obs"], 2), "%")


if __name__ == "__main__":
    main(sys.argv[1])
