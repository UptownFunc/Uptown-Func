# SI-assisted: drafted with Claude Code (Claude Opus 5.5); human Data and Science review pending.
"""Sky-obstruction layer over the demo area (plan 6.7 compute budget; Tier 2 "Should"). Geometry, not dose.

usage: python -m sharpwalk.run_sky_grid <area_dir> [--cell 20]
1. D1 (area +- 3 km) and D12 (+- ~104 km) are reprojected once into the area's F6 plane (ortho, as warp.py), D1 at 2 m
   by averaging, D12 at 200 m bilinear; the mean D1 - D12 offset is measured on 200 m blocks and removed (plan 6.7).
2. Max-aggregated levels: near 4/8/16/32 m, far 400/800 m (sky_grid.max_pyramid).
3. f_obs per observer on a 20 m grid (h_obs = 1 m, V-12), rays every 1 deg, steps max(2 m, r/100) to 100 km. Timed on a
   300 m crop first; if the full run would pass 20 minutes the grid is coarsened to 40 m (plan 6.7).
4. Self-check: 25 observers also run with fixed 2 m steps on the 2 m level to 3 km and 100 m steps on D12 (no
   aggregation); the largest difference is recorded.
Writes sky_obstruction.uint16.bin (f_obs x 10,000; 65535 = no value), sky_obstruction.png (F7 display, single-hue
ramp), registers both under "sky" in layers.json, and adds a D12 provenance record.
"""
import datetime as dt
import hashlib
import json
import math
import multiprocessing as mp
import sys
import time
from pathlib import Path

import numpy as np
import rasterio
from affine import Affine
from rasterio.enums import Resampling
from rasterio.warp import reproject, transform as rio_transform, transform_bounds

from .display import F7_CRS
from .geo import R_F1, ortho_crs
from .outputs import merge_provenance, sha256_file
from .run_d1 import D1_URL
from .run_sky_benchmark import D12_URL, ENV, check_d12_crs
from .sky import bilinear
from .sky_grid import Level, max_pyramid, ray_ranges, sky_fraction

H_OBS = 1.0                    # V-12 (Assumed; sweep 0-2 m in AC-07)
NEAR_PAD, FAR_R = 3_000.0, 100_000.0
AZ = np.arange(360.0)
SCALE, NODATA = 1e-4, 65535
RAMP_MAX = 0.5                 # display: alpha reaches its maximum at 50 % obstructed (V-14)
_G: dict = {}                  # levels shared with forked workers


def _row(args):
    obs, z = args
    return sky_fraction(obs, z, _G["near"], _G["far"], AZ, _G["ranges"], NEAR_PAD)


def _read_reprojected(url, dst_shape, dst_t, dst_crs, resampling, check=None):
    with rasterio.Env(**ENV), rasterio.open("/vsicurl/" + url) as s:
        if check:
            check(s.crs)
        left, bottom, right, top = transform_bounds(dst_crs, s.crs, dst_t.c, dst_t.f + dst_t.e * dst_shape[0],
                                                    dst_t.c + dst_t.a * dst_shape[1], dst_t.f, densify_pts=21)
        pad = 4 * abs(s.transform.a)
        w = rasterio.windows.from_bounds(left - pad, bottom - pad, right + pad, top + pad, s.transform).round_offsets().round_lengths()
        src = s.read(1, window=w).astype(np.float32)
        nod = s.nodata
        src_t, src_crs = s.window_transform(w), s.crs
    if nod is not None:
        src[src == nod] = np.nan
    dst = np.full(dst_shape, np.nan, dtype=np.float32)
    reproject(source=src, destination=dst, src_transform=src_t, src_crs=src_crs, src_nodata=np.nan,
              dst_transform=dst_t, dst_crs=dst_crs, dst_nodata=np.nan, resampling=resampling)
    return dst.astype(np.float64), hashlib.sha256(np.ascontiguousarray(src).tobytes()).hexdigest()


def main(area_dir: str, cell_m: float = 20.0) -> None:
    out = Path(area_dir)
    rep = json.loads((out / "build_report.json").read_text())
    lat0, lon0 = rep["origin"]["f1"]["lat"], rep["origin"]["f1"]["lon"]
    half = rep["rows"] * rep["cellSize_m"] / 2           # 1,500 m
    crs = ortho_crs(lat0, lon0)
    t0 = time.time()

    nb = half + NEAR_PAD + 100.0                          # 4,600 m: a multiple of 200 m, so the far grid aligns
    n2 = int(2 * nb / 2.0)
    near_t = Affine(2.0, 0.0, -nb, 0.0, -2.0, nb)
    d1, _ = _read_reprojected(D1_URL, (n2, n2), near_t, crs, Resampling.average)
    fb = math.ceil((half + FAR_R + 2_000.0) / 200.0) * 200.0
    nf = int(2 * fb / 200.0)
    far_t = Affine(200.0, 0.0, -fb, 0.0, -200.0, fb)
    d12, d12_sha = _read_reprojected(D12_URL, (nf, nf), far_t, crs, Resampling.bilinear, check=check_d12_crs)

    # D1 - D12 offset on 200 m blocks of the near window (plan 6.7).
    k = 100
    blocks = d1[: (n2 // k) * k, : (n2 // k) * k].reshape(n2 // k, k, n2 // k, k)
    d1_200 = np.where(np.isfinite(blocks).all(axis=(1, 3)), blocks.mean(axis=(1, 3)), np.nan)
    off_r, off_c = int(round((fb - nb) / 200.0)), int(round((fb - nb) / 200.0))
    diff = d1_200 - d12[off_r:off_r + d1_200.shape[0], off_c:off_c + d1_200.shape[1]]
    diff = diff[np.isfinite(diff)]
    offset, spread = float(diff.mean()), float(diff.std())
    d12 = d12 + offset

    near = [Level(d1, near_t, 2.0)]
    for c in (4.0, 8.0, 16.0, 32.0):
        near.append(max_pyramid(near[0], c))
    far = [Level(d12, far_t, 200.0)]
    for c in (400.0, 800.0):
        far.append(max_pyramid(far[0], c))
    _G.update(near=near, far=far, ranges=ray_ranges(2.0, FAR_R))
    load_s = time.time() - t0

    def observers(cell):
        n = int(round(2 * half / cell))
        c = -half + (np.arange(n) + 0.5) * cell
        return n, [[(e, nn) for e in c] for nn in -c]

    def z_of(obs_rows):
        return [np.array([bilinear(d1, near_t, np.array([e]), np.array([nn]))[0] + H_OBS for e, nn in row]) for row in obs_rows]

    # Timing on a 300 m crop (15 x 15 observers at 20 m), then the plan's 20-minute rule.
    _, crop = observers(cell_m)
    mid = len(crop) // 2
    crop_rows = [r[mid - 7: mid + 8] for r in crop[mid - 7: mid + 8]]
    ts = time.time()
    with mp.get_context("fork").Pool() as pool:
        pool.map(_row, list(zip(crop_rows, z_of(crop_rows))))
    per_obs = (time.time() - ts) / (15 * 15)
    n_obs = int(round(2 * half / cell_m)) ** 2
    projected_min = per_obs * n_obs / 60
    if projected_min > 20 and cell_m < 40:
        cell_m = 40.0
    n, rows = observers(cell_m)
    ts = time.time()
    with mp.get_context("fork").Pool() as pool:
        grid = np.vstack(pool.map(_row, list(zip(rows, z_of(rows)))))
    run_s = time.time() - ts

    # Self-check against fixed fine steps without aggregation (25 observers on a 5 x 5 lattice).
    fine_r = np.concatenate([np.arange(2.0, NEAR_PAD + 1, 2.0), np.arange(NEAR_PAD + 100.0, FAR_R + 1, 100.0)])
    lat_idx = np.linspace(0, n - 1, 5).astype(int)
    pts = [rows[i][j] for i in lat_idx for j in lat_idx]
    zs = np.concatenate(z_of([pts]))
    fine = sky_fraction(pts, zs, [near[0]], [far[0]], AZ, fine_r, NEAR_PAD)
    coarse = np.array([grid[i, j] for i in lat_idx for j in lat_idx])
    check_pp = float(np.nanmax(np.abs(fine - coarse)) * 100)

    q = np.where(np.isfinite(grid), np.round(grid / SCALE), NODATA).astype("<u2")
    (out / "sky_obstruction.uint16.bin").write_bytes(q.tobytes())
    # F7 display PNG: nearest from the observer grid (honest blocks); graphite with alpha by f_obs (single-hue ramp).
    lay = json.loads((out / "layers.json").read_text())
    x0, y0, x1, y1 = lay["extentF7"]
    px = 4.0
    w, h = int(round((x1 - x0) / px)), int(round((y1 - y0) / px))
    f7 = np.full((h, w), np.nan, dtype=np.float32)
    reproject(source=grid.astype(np.float32), destination=f7, src_transform=Affine(cell_m, 0, -half, 0, -cell_m, half), src_crs=crs,
              src_nodata=np.nan, dst_transform=Affine(px, 0, x0, 0, -px, y1), dst_crs=F7_CRS, dst_nodata=np.nan, resampling=Resampling.nearest)
    alpha = np.where(np.isfinite(f7), np.clip(f7 / RAMP_MAX, 0, 1) * 200, 0).astype(np.uint8)
    import warnings
    from rasterio.errors import NotGeoreferencedWarning
    with rasterio.Env(GDAL_PAM_ENABLED="NO"), warnings.catch_warnings():
        warnings.simplefilter("ignore", NotGeoreferencedWarning)
        with rasterio.open(out / "sky_obstruction.png", "w", driver="PNG", width=w, height=h, count=4, dtype="uint8") as f:
            for b, v in enumerate((25, 27, 32), start=1):
                f.write(np.full((h, w), v, dtype=np.uint8), b)
            f.write(alpha, 4)

    bench = json.loads((Path(__file__).resolve().parents[2] / "docs" / "data" / "ac07-sky-m12.json").read_text())
    vals = grid[np.isfinite(grid)]
    lay["sky"] = {
        "name": "Sky obstruction, % of the upper hemisphere (geometry, not dose)",
        "valueClass": "model_derived", "source": "D1", "sources": ["D1", "D12"],
        "grid": {"path": "sky_obstruction.uint16.bin", "sha256": sha256_file(out / "sky_obstruction.uint16.bin"),
                 "rows": n, "cols": n, "cell_m": cell_m, "f6Transform": [cell_m, 0.0, -half, 0.0, -cell_m, half],
                 "dtype": "uint16", "scale": SCALE, "noData": NODATA},
        "image": {"path": "sky_obstruction.png", "sha256": sha256_file(out / "sky_obstruction.png"), "pixel_m": px, "rampMax": RAMP_MAX},
        "h_obs_m": H_OBS, "range": [float(vals.min()), float(vals.max())],
        "benchmark": {"id": "AC-07", "f_obs": bench["f_obs"], "published": bench["published"]["f_obs"], "site": "Butte M12, sols 1456-1467"},
        "method": "plan 6.7: 1 deg rays, steps max(2 m, r/100) to 100 km, max-aggregated levels, curvature r^2/2R",
        "selfCheck_maxDiff_pp": check_pp, "d1MinusD12Offset_m": {"mean": offset, "std": spread},
        "builtOn": dt.date.today().isoformat(),
    }
    (out / "layers.json").write_text(json.dumps(lay, indent=2))
    d12_record = {"id": "D12", "productId": "Mars_HRSC_MOLA_BlendDEM_Global_200mp_v2", "url": D12_URL,
                  "licence": "USGS Astrogeology product; licence terms not yet read (UNVERIFIED)",
                  "crs": "+proj=longlat +R=3396190 +no_defs", "latitudeType": "planetocentric", "longitudeDirection": "east",
                  "verticalReference": "unknown (not stated in the header; phase 1.1 audit)", "resolution_m": 200.0,
                  "valueClass": "directly_measured", "retrievedOn": dt.date.today().isoformat(), "sha256": d12_sha}
    prov = out / "provenance.json"
    prov.write_text(json.dumps(merge_provenance(json.loads(prov.read_text()), d12_record), indent=2))
    print(json.dumps(lay["sky"], indent=1))
    # Timing is printed, not stored, so a rebuild reproduces layers.json byte for byte (RUN-01).
    print(json.dumps({"cell_m": cell_m, "load_s": round(load_s, 1), "run_s": round(run_s, 1), "projectedAt20m_min": round(projected_min, 2)}))


if __name__ == "__main__":
    args = sys.argv[1:]
    main(args[0], float(args[args.index("--cell") + 1]) if "--cell" in args else 20.0)
