# SI-assisted: drafted with Claude Code (Claude Opus 5.5); human Data and Science review pending.
"""AC-07 geometric obstruction benchmark at Butte M12 (plan 6.7, AC-07, AC-21, AC-22). Geometry, not dose.

usage: python -m sharpwalk.run_sky_benchmark <out_dir>
Observer: the D5 waypoint where Curiosity was parked for sols 1456-1467 (the last drive before sol 1456; the run checks
that no drive is logged during those sols, that the waypoint is at most 3 sols before 1456 and that a later waypoint
exists). Heights: D1 (1 m) within R_near, else D12 (200 m) shifted by the measured mean D1 - D12 offset; near-field
samples where D1 has no value and D12 stands in are counted and reported. Rays every 0.5 deg; ranges every 1 m to 3 km,
then every 100 m (half a D12 pixel) to 150 km; every configuration is a subset of that one set of rays. Both rasters'
CRSs are read and checked; D1 is tagged AREA_OR_POINT=Point and GDAL returns an area-convention transform for it
(GTIFF_POINT_GEO_IGNORE unset), which bilinear() expects. The reference period (about 10 %) is not computed: its sols
are UNVERIFIED (plan R-13).
"""
import datetime as dt
import json
import math
import re
import sys
from pathlib import Path

import numpy as np
import rasterio
from rasterio.crs import CRS
from rasterio.warp import transform as rio_transform
from rasterio.windows import from_bounds

from .geo import R_F1, ortho_crs
from .rover_path import _SPHERE as SPHERE
from .run_d1 import D1_URL
from .run_rover_path import WAYPOINTS_URL, fetch
from .sky import bilinear, f_obs, horizon_with_range

D12_URL = "https://asc-pds-services.s3.us-west-2.amazonaws.com/mosaic/Mars/HRSC_MOLA_Blend/Mars_HRSC_MOLA_BlendDEM_Global_200mp_v2.tif"
M12_SOLS = (1456, 1467)                     # Ehresmann et al. 2021 (plan 6.7)
MAX_ARRIVAL_GAP_SOLS = 3                    # the parking waypoint must be this close to sol 1456 (log-gap guard)
PUBLISHED = {"f_obs": 0.37 / 2, "label": "0.37 pi of 2 pi (about 19 %), Ehresmann et al. 2021; Guo et al. 2021"}
THRESHOLD_PP = 3.0                          # Assumed (plan AC-07)
BASE = {"N": 360, "R_far_m": 100_000.0, "R_near_m": 3_000.0, "h_obs_m": 1.0}  # h_obs base: V-12 (Assumed)
NEAR_MAX, FAR_MAX, FAR_STEP = 3_000.0, 150_000.0, 100.0   # V-13
ENV = {"GDAL_DISABLE_READDIR_ON_OPEN": "EMPTY_DIR", "GDAL_HTTP_MULTIRANGE": "YES", "GDAL_HTTP_MERGE_CONSECUTIVE_RANGES": "YES"}


def m12_position(features: list) -> dict:
    """The parking waypoint for sols 1456-1467; refuses a drive during it, a log gap before it, or no later waypoint."""
    props = [f["properties"] for f in features]
    if any(M12_SOLS[0] <= p["sol"] <= M12_SOLS[1] for p in props):
        raise ValueError("a drive is logged during sols 1456-1467: average over the positions instead (plan 6.7)")
    before = [p for p in props if p["sol"] < M12_SOLS[0]]
    if not before or not any(p["sol"] > M12_SOLS[1] for p in props):
        raise ValueError("no waypoint before and after sols 1456-1467")
    wp = max(before, key=lambda p: (p["sol"], p["site"], p["drive"]))
    if M12_SOLS[0] - wp["sol"] > MAX_ARRIVAL_GAP_SOLS:
        raise ValueError(f"last waypoint before sol 1456 is from sol {wp['sol']}: possible gap in the D5 log")
    return wp


def check_d12_crs(crs: CRS) -> None:
    """D12 heights are looked up by lon/lat: its CRS must be geographic on the F1 sphere."""
    if not crs.is_geographic:
        raise ValueError(f"D12 CRS is not geographic: {crs.to_proj4()}")
    m = re.search(r'(?:SPHEROID|ELLIPSOID)\["[^"]*",\s*([0-9.eE+-]+),\s*([0-9.eE+-]+)', crs.to_wkt())
    if not m or abs(float(m.group(1)) - R_F1) > 1 or float(m.group(2)) != 0.0:  # semi-major axis, inverse flattening 0
        raise ValueError(f"D12 CRS is not the {R_F1:.0f} m sphere: {crs.to_proj4()}")


def read_window(url: str, bounds_fn):
    """Window of a remote raster; bounds_fn(crs) gives (left, bottom, right, top) in the raster's own CRS."""
    with rasterio.Env(**ENV), rasterio.open("/vsicurl/" + url) as s:
        w = from_bounds(*bounds_fn(s.crs), s.transform).round_offsets().round_lengths()
        a = s.read(1, window=w).astype(np.float64)
        if s.nodata is not None:
            a[a == s.nodata] = np.nan
        return a, s.window_transform(w), s.crs, s.tags().get("AREA_OR_POINT")


def main(out_dir: str) -> None:
    out = Path(out_dir)
    raw, wp_sha = fetch(WAYPOINTS_URL)
    wp = m12_position(json.loads(raw)["features"])
    lat0, lon0 = wp["lat"], wp["lon"]
    obs = {}

    def d1_bounds(crs):
        (x,), (y,) = rio_transform(SPHERE, crs, [lon0], [lat0])
        obs["xy"] = (x, y)
        pad = NEAR_MAX + 50
        return x - pad, y - pad, x + pad, y + pad

    d1, d1_t, d1_crs, d1_aop = read_window(D1_URL, d1_bounds)
    deg = (FAR_MAX + 2_000) / (R_F1 * math.pi / 180) / math.cos(math.radians(lat0))

    def d12_bounds(crs):
        check_d12_crs(crs)
        return lon0 - deg, lat0 - deg, lon0 + deg, lat0 + deg

    d12, d12_t, _, d12_aop = read_window(D12_URL, d12_bounds)

    def to_d1(e, n):
        """F6 (observer plane) -> lon/lat on the F1 sphere -> D1 map coordinates."""
        lon, lat = rio_transform(ortho_crs(lat0, lon0), SPHERE, np.ravel(e), np.ravel(n))
        x, y = rio_transform(SPHERE, d1_crs, lon, lat)
        return np.asarray(x), np.asarray(y), np.asarray(lon), np.asarray(lat)

    # D1 - D12 offset on a 200 m lattice within the D1 window (plan 6.7: measured and removed before merging).
    g = np.arange(-2_800.0, 2_801.0, 200.0)
    ge, gn = np.meshgrid(g, g)
    x, y, lon, lat = to_d1(ge, gn)
    diff = bilinear(d1, d1_t, x, y) - bilinear(d12, d12_t, lon, lat)
    diff = diff[np.isfinite(diff)]
    offset, spread = float(diff.mean()), float(diff.std())

    # One set of rays: 720 azimuths; D1 only for the near ranges, D12 for all (it stands in where D1 has no value).
    az = np.arange(720) * 0.5
    near_r = np.arange(1.0, NEAR_MAX + 0.5, 1.0)
    ranges = np.concatenate([near_r, np.arange(NEAR_MAX + FAR_STEP, FAR_MAX + 1, FAR_STEP)])
    A, Rg = np.meshgrid(az, ranges, indexing="ij")
    e, n = Rg * np.sin(np.radians(A)), Rg * np.cos(np.radians(A))
    lon, lat = rio_transform(ortho_crs(lat0, lon0), SPHERE, e.ravel(), n.ravel())
    Z12 = bilinear(d12, d12_t, np.asarray(lon), np.asarray(lat)).reshape(A.shape) + offset
    nm = len(near_r)
    x, y, _, _ = to_d1(e[:, :nm], n[:, :nm])
    Z1 = np.full(A.shape, np.nan)
    Z1[:, :nm] = bilinear(d1, d1_t, x, y).reshape(A[:, :nm].shape)
    z0 = float(bilinear(d1, d1_t, np.array([obs["xy"][0]]), np.array([obs["xy"][1]]))[0])

    def bands(r_at, gam):
        """Share of azimuths whose horizon is set in each range band, and their share of f_obs (plan AC-22)."""
        out_b = {}
        for lo, hi in [(0, 10), (10, 100), (100, 1_500), (1_500, 3_000), (3_000, 50_000), (50_000, math.inf)]:
            m = (r_at > lo) & (r_at <= hi)
            out_b[f"{lo}-{hi} m" if hi != math.inf else f">{lo} m"] = {"azimuths": float(m.mean()), "f_obs_part": float(np.sin(gam[m]).sum() / len(gam))}
        out_b["unobstructed"] = {"azimuths": float(np.isnan(r_at).mean()), "f_obs_part": 0.0}
        return out_b

    cache = {}

    def run(N, R_far_m, R_near_m, h_obs_m):
        key = (N, R_far_m, R_near_m, h_obs_m)
        if key not in cache:
            k = np.arange(0, 720, 720 // N)
            m = ranges <= R_far_m
            near = (ranges[m] <= R_near_m)[None, :]
            use_d1 = near & np.isfinite(Z1[k][:, m])
            z = np.where(use_d1, Z1[k][:, m], Z12[k][:, m])
            gam, r_at = horizon_with_range(lambda r, a: z, z0 + h_obs_m, az[k], ranges[m])
            cache[key] = (gam, f_obs(gam), r_at, int((near & ~use_d1).sum()), int(near.sum() * len(k)))
        return cache[key]

    rows = []
    for label, cfgs in [("h_obs", [dict(BASE, h_obs_m=h) for h in (0.0, 1.0, 2.0)]),
                        ("AC-21 azimuths", [dict(BASE, N=N) for N in (180, 360, 720)]),
                        ("AC-22 R_far", [dict(BASE, R_far_m=R) for R in (50_000.0, 100_000.0, 150_000.0)]),
                        ("R_near (D1 extent)", [dict(BASE, R_near_m=R) for R in (1_500.0, 3_000.0)])]:
        for c in cfgs:
            gam, f, r_at, filled, near_n = run(**c)
            rows.append({"check": label, **c, "f_obs": f, "meanGamma_deg": float(np.degrees(gam).mean()),
                         "maxGamma_deg": float(np.degrees(gam).max()), "nearSamplesFromD12": filled,
                         "settingRangeShare": bands(r_at, gam)})
    gam, f, r_at, filled, near_n = run(**BASE)
    diff_pp = 100 * (f - PUBLISHED["f_obs"])
    res = {
        "id": "AC-07", "what": "Geometric sky obstruction at Butte M12 from D1/D12 (plan 6.7); geometry, not dose; a benchmark, not validation",
        "observer": {"source": "D5 waypoint (final drive before sol 1456; none logged sols 1456-1467)",
                     **{k: wp[k] for k in ("sol", "site", "drive", "lat", "lon", "elev_geoid")}, "z0_D1_m": z0},
        "base": BASE, "f_obs": f, "published": PUBLISHED, "difference_pp": diff_pp, "threshold_pp": THRESHOLD_PP,
        "pass": bool(abs(diff_pp) <= THRESHOLD_PP),
        "meanGamma_deg": float(np.degrees(gam).mean()), "maxGamma_deg": float(np.degrees(gam).max()),
        "settingRangeShare": bands(r_at, gam),
        "nearField": {"samples": near_n, "fromD12WhereD1Missing": filled},
        "publishedShape": "average blocking angle 11 deg, obstructions no higher than 30 deg (Ehresmann et al. 2021, via plan 6.7)",
        "sensitivity": rows,
        "d1MinusD12Offset_m": {"mean": offset, "std": spread, "samples": int(diff.size)},
        "frames": {"D1": {"crs": d1_crs.to_proj4(), "AREA_OR_POINT": d1_aop}, "D12": {"AREA_OR_POINT": d12_aop, "check": "geographic, F1 sphere"}},
        "referencePosition": "not computed: the reference-period sols are UNVERIFIED (plan R-13); the about 10 % figure is not compared",
        "horizonBase_deg": [round(float(v), 2) for v in np.degrees(gam)],
        "horizonBaseRange_m": [None if np.isnan(v) else float(v) for v in r_at],
        "sources": {"D1": D1_URL, "D12": D12_URL, "D5": {"url": WAYPOINTS_URL, "sha256": wp_sha},
                    "retrievedAt": dt.datetime.now(dt.timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")},
    }
    out.mkdir(parents=True, exist_ok=True)
    (out / "ac07-sky-m12.json").write_text(json.dumps(res, indent=1) + "\n")
    print(json.dumps({k: res[k] for k in ("f_obs", "difference_pp", "pass", "meanGamma_deg", "maxGamma_deg", "nearField", "d1MinusD12Offset_m", "frames", "observer")}, indent=1))
    for r in rows:
        print(r["check"], r["N"], r["R_far_m"], r["R_near_m"], r["h_obs_m"], round(100 * r["f_obs"], 2), "%", "D12 fill", r["nearSamplesFromD12"])


if __name__ == "__main__":
    main(sys.argv[1])
