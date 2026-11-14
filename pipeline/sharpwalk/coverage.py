# SI-assisted: drafted with Claude Code (Claude Opus 5.5); human Data and Science review pending.
"""Coverage outlines (plan 7.8 "Missing and coarse data": each dataset ships its coverage outline; vector delivery is
GeoJSON in F1). The outline is the boundary of a dataset's valid-data mask on the F7 display grid of this sheet, so it
says where the shipped layer has data. F7 -> F1 is exact and linear (plan 7.8): lon = x / k, lat = y / k."""
import math
import numpy as np
from rasterio.features import shapes

from .geo import R_F1

K_F7 = math.pi * R_F1 / 180.0  # metres per degree, 59,274.70 (plan 7.8)


def _ring_f1(ring):
    # 1e-8 deg is about 0.6 mm on the sphere: rounding only trims the file size.
    return [[round(x / K_F7, 8), round(y / K_F7, 8)] for x, y in ring]


def coverage_feature(dataset: str, label: str, layer_ids: list, valid: np.ndarray, transform, *, method: str) -> dict:
    """GeoJSON Feature (MultiPolygon, F1 [lon, lat] degrees) outlining the True cells of `valid` on an F7 grid."""
    valid = np.asarray(valid, dtype=bool)
    polys = []
    if valid.any():
        for geom, val in shapes(valid.astype(np.uint8), mask=valid, transform=transform, connectivity=4):
            if val == 1:
                polys.append([_ring_f1(r) for r in geom["coordinates"]])
    return {
        "type": "Feature",
        "geometry": {"type": "MultiPolygon", "coordinates": polys},
        "properties": {"dataset": dataset, "label": label, "layerIds": list(layer_ids),
                       "validFraction": float(valid.mean()) if valid.size else 0.0, "method": method},
    }


def coverage_collection(features: list) -> dict:
    return {"type": "FeatureCollection", "frame": "F1", "features": features}
