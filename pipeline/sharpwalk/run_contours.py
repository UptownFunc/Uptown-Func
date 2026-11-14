# SI-assisted: drafted with Claude Code (Claude Opus 5.5); human Data and Science review pending.
"""Write <AREA_DIR>/contours.geojson: AREA-sheet elevation contours (plan 7.8: gdal_contour on D1, GeoJSON in F1;
plan 9: 10 m lines, every fifth heavier and labelled) and register it with its sha256 in layers.json.
Usage: python -m sharpwalk.run_contours AREA_DIR (after run_display; needs the GDAL CLI's gdal_contour).

D1 is read on this sheet's 1 m F7 display grid and averaged to CELL_M blocks first, as the plan's wireframe D did
("D1 at its 4 m overview"); measured on 14 Nov: 1 m gives 8.5 MB of GeoJSON, 2 m 4.1 MB, 4 m 2.0 MB (DECISIONS CON-01)."""
import json, shutil, subprocess, sys, tempfile
from pathlib import Path
import numpy as np
import rasterio
from affine import Affine

from .contours import contour_lines_f7, contours_collection
from .outputs import sha256_file
from .run_coverage import display_grid, read_d1_window
from .run_display import ENV

CELL_M, INTERVAL_M, INDEX_EVERY = 4, 10.0, 5
NODATA = -32767.0


def block_mean(z: np.ndarray, f: int) -> np.ndarray:
    """f x f block means; a block with any NaN (D1 NoData) stays NaN. Trailing rows/columns that do not fill a
    block are dropped (at most f - 1 m at the south and east edges)."""
    r, c = (z.shape[0] // f) * f, (z.shape[1] // f) * f
    return z[:r, :c].reshape(r // f, f, c // f, f).mean(axis=(1, 3))


def main(area_dir: str) -> None:
    if shutil.which("gdal_contour") is None:
        raise SystemExit("gdal_contour not found: install the GDAL command-line tools (e.g. apt-get install gdal-bin)")
    out = Path(area_dir)
    layers = json.loads((out / "layers.json").read_text())
    grid = display_grid(layers)
    with rasterio.Env(**ENV):
        z = read_d1_window(grid)  # 1 m, NaN where D1 is NoData
    zc = block_mean(z, CELL_M)
    zc = np.where(np.isnan(zc), NODATA, zc)
    t = Affine(CELL_M * grid["pixel_m"], 0.0, grid["x0"], 0.0, -CELL_M * grid["pixel_m"], grid["y1"])
    version = subprocess.run(["gdal_contour", "--version"], capture_output=True, text=True).stdout.strip()
    with tempfile.TemporaryDirectory() as tmp:
        lines = contour_lines_f7(zc, t, interval=INTERVAL_M, nodata=NODATA, workdir=tmp)
    fc = contours_collection(lines, interval=INTERVAL_M, index_every=INDEX_EVERY, cell_m=float(CELL_M),
                             method=f"gdal_contour ({version}) on D1 averaged to {CELL_M} m blocks of the 1 m F7 display grid")
    (out / "contours.geojson").write_text(json.dumps(fc, separators=(",", ":")) + "\n")
    layers["contours"] = {"path": "contours.geojson", "sha256": sha256_file(out / "contours.geojson"), "source": "D1",
                          "interval_m": INTERVAL_M, "indexEvery": INDEX_EVERY, "cell_m": float(CELL_M)}
    (out / "layers.json").write_text(json.dumps(layers, indent=2))
    lv = sorted({lvl for lvl, _ in lines})
    print(f"{len(lines)} lines, {sum(len(c) for _, c in lines)} vertices, levels {lv[0]}..{lv[-1]} m ({len(lv)}), "
          f"{(out / 'contours.geojson').stat().st_size / 1e6:.2f} MB; {version}")


if __name__ == "__main__":
    main(sys.argv[1])
