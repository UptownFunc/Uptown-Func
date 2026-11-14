# SI-assisted: drafted with Claude Code (Claude Opus 5.5); human Data and Science review pending.
"""Plan 6.4 / 7.3: warp D1 once to a square F6 grid (+proj=ortho on the F1 sphere) by averaging."""
import numpy as np
from affine import Affine
from rasterio.warp import reproject, Resampling

from .geo import ortho_crs


def warp_to_f6(src: np.ndarray, src_transform: Affine, src_crs, src_nodata: float,
               lat0: float, lon0: float, cell_m: float, n: int):
    """Return (elevation float64 with NaN for unknown, F6 affine transform). Grid is n x n, centred on the origin."""
    half = n * cell_m / 2
    dst_t = Affine(cell_m, 0.0, -half, 0.0, -cell_m, half)
    dst = np.full((n, n), np.nan, dtype=np.float32)
    reproject(source=src, destination=dst, src_transform=src_transform, src_crs=src_crs, src_nodata=src_nodata,
              dst_transform=dst_t, dst_crs=ortho_crs(lat0, lon0), dst_nodata=np.nan,
              resampling=Resampling.average)
    return dst.astype(np.float64), dst_t
