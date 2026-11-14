# SI-assisted: drafted with Claude Code (Claude Opus 5.5); human Data and Science + Design review pending.
"""Display layers in F7 for the OpenLayers AREA sheet (plan 7.8, 9.2). Shown only; every measurement comes from F6.

F7 = Equidistant Cylindrical on the F1 sphere, standard parallel 0, central meridian 0 (the D1/D2 native projection).
Terrain classes ship as masks, one per plan 9.2 symbol; the sheet draws the hatch and stipple in screen pixels
(plan 7.8 "symbols and line weights are fixed in screen pixels"; src/map/terrainLayer.ts). A pattern baked into
ground pixels aliased at coarse zoom (2.6 part 1 note), which is why no pattern is drawn here.
"""
import math
import numpy as np
from rasterio.crs import CRS
from rasterio.warp import transform as rio_transform

from .geo import R_F1, ortho_crs
from .grids import CLASS_CANDIDATE, CLASS_EXCLUDED, CLASS_UNKNOWN

F7_CRS = CRS.from_proj4(f"+proj=eqc +lat_ts=0 +lat_0=0 +lon_0=0 +R={R_F1:.0f} +units=m +no_defs")

def f7_bounds_of_f6_grid(lat0: float, lon0: float, half_m: float, samples: int = 64):
    """F7 bounding box of the F6 square [-half, half]^2 (edges densified, since ortho -> eqc is not linear)."""
    t = np.linspace(-half_m, half_m, samples)
    xs = np.concatenate([t, t, np.full(samples, -half_m), np.full(samples, half_m)])
    ys = np.concatenate([np.full(samples, -half_m), np.full(samples, half_m), t, t])
    fx, fy = rio_transform(ortho_crs(lat0, lon0), F7_CRS, xs.tolist(), ys.tolist())
    return (min(fx), min(fy), max(fx), max(fy))


def terrain_masks(classes: np.ndarray, slope_deg: np.ndarray) -> dict:
    """One boolean mask per plan 9.2 symbol: steep (candidate, slope 15-20 deg: amber hatch), excluded (neutral
    cross-hatch), unknown (stipple). Candidate ground under 15 deg carries no symbol."""
    with np.errstate(invalid="ignore"):
        steep = (classes == CLASS_CANDIDATE) & (slope_deg >= 15.0)
    return {"steep": steep, "excluded": classes == CLASS_EXCLUDED, "unknown": classes == CLASS_UNKNOWN}


def write_mask_png(path, mask: np.ndarray) -> None:
    """Grey + alpha PNG: alpha 255 where the mask is set, 0 elsewhere; grey 0. No georeferencing in the file (no
    .aux.xml sidecar): layers.json records the mask's F7 extent."""
    import rasterio
    import warnings
    from rasterio.errors import NotGeoreferencedWarning
    m = np.asarray(mask, dtype=bool)
    with rasterio.Env(GDAL_PAM_ENABLED="NO"), warnings.catch_warnings():
        warnings.simplefilter("ignore", NotGeoreferencedWarning)  # by design: the extent is in layers.json
        with rasterio.open(path, "w", driver="PNG", width=m.shape[1], height=m.shape[0], count=2, dtype="uint8") as f:
            f.write(np.zeros(m.shape, dtype=np.uint8), 1)
            f.write(np.where(m, 255, 0).astype(np.uint8), 2)


def classes_f7(area_dir, rep: dict, transform, rows: int, cols: int):
    """The F6 terrain classes and slope warped to an F7 grid by nearest neighbour (0 = unknown outside the F6 square)."""
    from pathlib import Path
    from affine import Affine
    from rasterio.enums import Resampling
    from rasterio.warp import reproject
    from .grids import dequantise
    out, n = Path(area_dir), rep["rows"]
    grids = {g["name"]: g for g in rep["grids"]}
    cls_f6 = np.fromfile(out / grids["terrain_class"]["path"], dtype="<u1").reshape(n, n)
    gs = grids["slope"]
    slope_f6 = dequantise(np.fromfile(out / gs["path"], dtype="<u2").reshape(n, n), gs["offset"], gs["scale"], gs["noData"])
    lat0, lon0 = rep["origin"]["f1"]["lat"], rep["origin"]["f1"]["lon"]
    cls, slope = np.zeros((rows, cols), dtype=np.uint8), np.full((rows, cols), np.nan)
    for src, dst in ((cls_f6, cls), (slope_f6, slope)):
        reproject(source=src, destination=dst, src_transform=Affine(*rep["f6Transform"]), src_crs=ortho_crs(lat0, lon0),
                  dst_transform=transform, dst_crs=F7_CRS, resampling=Resampling.nearest, src_nodata=None, dst_nodata=None)
    return cls, slope


def hillshade_u8(z: np.ndarray, dx: float, dy: float, azimuth_deg: float = 315.0, altitude_deg: float = 45.0):
    """Horn hillshade (as gdaldem), 8-bit; NaN or border cells become 0."""
    z = np.asarray(z, dtype=np.float64)
    out = np.zeros(z.shape, dtype=np.uint8)
    a, b, c = z[:-2, :-2], z[:-2, 1:-1], z[:-2, 2:]
    d, f = z[1:-1, :-2], z[1:-1, 2:]
    g, h, i = z[2:, :-2], z[2:, 1:-1], z[2:, 2:]
    gx = ((c + 2 * f + i) - (a + 2 * d + g)) / (8 * dx)
    gy = ((g + 2 * h + i) - (a + 2 * b + c)) / (8 * dy)
    slope = np.arctan(np.hypot(gx, gy))
    aspect = np.arctan2(gy, -gx)
    zen, az = math.radians(90 - altitude_deg), math.radians(360 - azimuth_deg + 90)
    hs = np.cos(zen) * np.cos(slope) + np.sin(zen) * np.sin(slope) * np.cos(az - aspect)
    inner = np.where(np.isnan(hs), 0, np.clip(hs, 0, 1) * 255)
    out[1:-1, 1:-1] = np.round(inner).astype(np.uint8)
    return out


def linear_stretch_u8(a: np.ndarray, lo: float, hi: float) -> np.ndarray:
    """Plan 9.2: a linear display stretch only."""
    s = (np.asarray(a, dtype=np.float64) - lo) / (hi - lo)
    return np.round(np.clip(s, 0, 1) * 255).astype(np.uint8)
