# SI-assisted: drafted with Claude Code (Claude Opus 5.5); human Data and Science review pending.
"""Elevation contours for the AREA sheet (plan 7.8: gdal_contour on D1, GeoJSON in F1; plan 9: 10 m lines, every
fifth heavier and labelled). gdal_contour runs on an F7 GeoTIFF of the D1 window, so its output is in F7 metres;
F7 -> F1 is exact and linear (lon = x / k, lat = y / k). Heights are D1 as delivered; the vertical reference is
unverified (D-05), so a contour level is a D1 height, not an absolute Mars elevation."""
import json, subprocess
from pathlib import Path
import numpy as np
import rasterio

from .coverage import K_F7
from .display import F7_CRS


def contour_lines_f7(z: np.ndarray, transform, *, interval: float, nodata, workdir) -> list:
    """[(level, [(x, y), ...]), ...] in F7 from gdal_contour on the grid z (values at pixel centres)."""
    work = Path(workdir)
    src, dst = work / "contour_in.tif", work / "contour_out.geojson"
    for p in (src, dst):
        p.unlink(missing_ok=True)
    rows, cols = z.shape
    with rasterio.open(src, "w", driver="GTiff", width=cols, height=rows, count=1, dtype="float32", crs=F7_CRS,
                       transform=transform, nodata=nodata) as f:
        f.write(np.asarray(z, dtype=np.float32), 1)
    cmd = ["gdal_contour", "-q", "-a", "elev_m", "-i", str(interval), "-f", "GeoJSON"]
    if nodata is not None:
        cmd += ["-snodata", str(nodata)]
    subprocess.run(cmd + [str(src), str(dst)], check=True, capture_output=True, text=True)
    out = []
    for f in json.loads(dst.read_text())["features"]:
        g = f["geometry"]
        parts = [g["coordinates"]] if g["type"] == "LineString" else g["coordinates"]
        for part in parts:
            if len(part) >= 2:
                out.append((float(f["properties"]["elev_m"]), [(float(x), float(y)) for x, y, *_ in part]))
    return out


def contours_collection(lines: list, *, interval: float, index_every: int, cell_m: float, method: str) -> dict:
    """GeoJSON in F1 [lon, lat]; index lines are the levels at multiples of interval * index_every."""
    step = interval * index_every
    feats = [{
        "type": "Feature",
        # 1e-7 deg is about 6 mm on the sphere: rounding only trims the file size.
        "geometry": {"type": "LineString", "coordinates": [[round(x / K_F7, 7), round(y / K_F7, 7)] for x, y in coords]},
        "properties": {"elev_m": level, "index": abs(level / step - round(level / step)) < 1e-9},
    } for level, coords in lines]
    return {"type": "FeatureCollection", "frame": "F1",
            "properties": {"source": "D1", "interval_m": interval, "indexEvery": index_every, "cell_m": cell_m,
                           "method": method, "verticalReference": "D1 as delivered; unverified (DECISIONS D-05)"},
            "features": feats}
