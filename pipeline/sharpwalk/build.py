# SI-assisted: drafted with Claude Code (Claude Opus 5.5); human Data and Science review pending.
"""Area build: D1 window -> F6 elevation (2 m, averaged) -> Horn slope -> terrain classes -> grid files.

Writes typed-array grids and build_report.json. It does not write the area manifest: control-point
residuals (plan 7.4, phase 1.5) are not measured yet, and they are never written as placeholders.
"""
import json
from pathlib import Path
import numpy as np

from .geo import f1_to_f5
from .grids import CLASS_CANDIDATE, CLASS_EXCLUDED, CLASS_UNKNOWN, classify_terrain, horn_slope_deg, quantise
from .outputs import write_grid
from .warp import warp_to_f6

ELEVATION_SCALE_M = 0.01   # pipeline encoding choice, pending agreement (P-01)
SLOPE_SCALE_DEG = 0.01     # pipeline encoding choice, pending agreement (P-01)


def build_area(src, src_transform, src_crs, src_nodata, lat0, lon0, *, cell_m, n, slope_limit_deg,
               out_dir, area_id):
    out = Path(out_dir)
    out.mkdir(parents=True, exist_ok=True)
    elev, f6_transform = warp_to_f6(src, src_transform, src_crs, src_nodata, lat0, lon0, cell_m, n)
    slope = horn_slope_deg(elev, cell_m)
    classes = classify_terrain(slope, slope_limit_deg)

    qe, e_off, e_scale, e_nd = quantise(elev, ELEVATION_SCALE_M, np.uint16)
    qs, s_off, s_scale, s_nd = quantise(slope, SLOPE_SCALE_DEG, np.uint16)
    grids = [
        write_grid(out, "elevation", qe, unit="m", noData=e_nd, scale=e_scale, offset=e_off,
                   valueClass="directly_measured"),
        write_grid(out, "slope", qs, unit="deg", noData=s_nd, scale=s_scale, offset=s_off,
                   valueClass="model_derived"),
        write_grid(out, "terrain_class", classes, unit="class", noData=CLASS_UNKNOWN, scale=1.0, offset=0.0,
                   valueClass="model_derived"),
    ]

    c = n // 2
    h0 = float(np.nanmean(elev[c - 1:c + 1, c - 1:c + 1]))
    if np.isnan(h0):
        raise ValueError("no elevation at the area origin")
    x, y, z = f1_to_f5(lat0, lon0, h0)
    report = {
        "areaId": area_id,
        "origin": {"f1": {"lat": lat0, "lon": lon0, "h": round(h0, 3)},
                   "f5": {"x": round(x, 3), "y": round(y, 3), "z": round(z, 3)}},
        "cellSize_m": cell_m, "rows": n, "cols": n,
        "f6Transform": list(f6_transform)[:6],
        "slopeLimit_deg": slope_limit_deg,
        "grids": grids,
        "counts": {"unknown": int((classes == CLASS_UNKNOWN).sum()),
                   "candidate": int((classes == CLASS_CANDIDATE).sum()),
                   "excluded": int((classes == CLASS_EXCLUDED).sum())},
        "elevationRange_m": [round(float(np.nanmin(elev)), 3), round(float(np.nanmax(elev)), 3)],
        "slopeOver60_deg": int(np.nansum(slope > 60)),
    }
    (out / "build_report.json").write_text(json.dumps(report, indent=2))
    return report
