# SI-assisted: drafted with Claude Code (Claude Opus 5.5); human Data and Science + Design review pending.
"""Write the AREA sheet display layers in F7 next to an area build. Usage: python -m sharpwalk.run_display AREA_DIR

Products (plan 7.7/7.8/9.2): D2 luminance JPEG at 1 m (linear stretch only), D1 hillshade JPEG at 1 m (native D1
pixels, no resampling), terrain-class masks (run_terrain_masks: one PNG per plan 9.2 symbol; the sheet draws the
hatch in screen pixels), layers.json.
"""
import datetime as dt
import hashlib, json, math, shutil, sys
from pathlib import Path
import numpy as np
import rasterio
from affine import Affine
from rasterio.enums import Resampling
from rasterio.windows import from_bounds

from .display import F7_CRS, f7_bounds_of_f6_grid, hillshade_u8, linear_stretch_u8
from .outputs import merge_provenance, sha256_file
from .run_d1 import D1_URL
from .run_terrain_masks import terrain_entry

D2_URL = "https://asc-pds-services.s3.us-west-2.amazonaws.com/mosaic/Mars/MSL/MSL_Gale_HiRISE-LRGB_78quads_sharp_cog.tif"
ENV = dict(GDAL_DISABLE_READDIR_ON_OPEN="EMPTY_DIR", CPL_VSIL_CURL_ALLOWED_EXTENSIONS=".tif",
           GDAL_HTTP_MERGE_CONSECUTIVE_RANGES="YES")


def _require_f7(ds, name, x0, y0, x1, y1):
    """The display layers are cut in F7 directly, so each source must be in F7 and must contain the extent."""
    p = ds.crs.to_dict()
    same = (p.get("proj") == "eqc" and abs(p.get("R", p.get("a", 0)) - F7_CRS.to_dict()["R"]) < 1e-6
            and p.get("lon_0", 0) == 0 and p.get("lat_ts", 0) == 0 and p.get("x_0", 0) == 0 and p.get("y_0", 0) == 0)
    if not same:
        raise ValueError(f"{name} is not in F7 ({ds.crs.to_proj4()}); reproject it before cutting display layers")
    b = ds.bounds
    if not (b.left <= x0 and b.right >= x1 and b.bottom <= y0 and b.top >= y1):
        raise ValueError(f"{name} does not cover the area extent")


def keep_sky(old: dict, new: dict, out) -> dict:
    """Carry the sky registration over a layers.json rewrite if its grid and image files still match their sha256."""
    from pathlib import Path
    sky = old.get("sky")
    if sky and all((Path(out) / sky[k]["path"]).exists() and sha256_file(Path(out) / sky[k]["path"]) == sky[k]["sha256"] for k in ("grid", "image")):
        return {**new, "sky": sky}
    return {k: v for k, v in new.items() if k != "sky"}


def main(area_dir: str, with_sky: bool = False) -> None:
    # run_contours (called at the end) needs the GDAL CLI; fail now, before any download or rewrite, not after.
    if shutil.which("gdal_contour") is None:
        raise SystemExit("gdal_contour not found: install the GDAL command-line tools (e.g. apt-get install gdal-bin) first")
    out = Path(area_dir)
    old_layers = json.loads((out / "layers.json").read_text()) if (out / "layers.json").exists() else {}
    rep = json.loads((out / "build_report.json").read_text())
    lat0, lon0 = rep["origin"]["f1"]["lat"], rep["origin"]["f1"]["lon"]
    n, cell = rep["rows"], rep["cellSize_m"]
    bx0, by0, bx1, by1 = f7_bounds_of_f6_grid(lat0, lon0, half_m=n * cell / 2)
    with rasterio.Env(**ENV):
        with rasterio.open("/vsicurl/" + D1_URL) as d1:
            _require_f7(d1, "D1", bx0, by0, bx1, by1)
            # Snap outward to D1 pixel edges (1 m), then pad 1 px for the hillshade kernel.
            fw = from_bounds(bx0, by0, bx1, by1, d1.transform)
            c0, r0 = math.floor(fw.col_off), math.floor(fw.row_off)
            c1, r1 = math.ceil(fw.col_off + fw.width), math.ceil(fw.row_off + fw.height)
            w = rasterio.windows.Window(c0 - 1, r0 - 1, (c1 - c0) + 2, (r1 - r0) + 2)
            z = d1.read(1, window=w).astype(np.float64)
            z[z == d1.nodata] = np.nan
            t_pad = d1.window_transform(w)
        hs = hillshade_u8(z, dx=math.cos(math.radians(lat0)), dy=1.0)[1:-1, 1:-1]
        t = t_pad * Affine.translation(1, 1)
        rows, cols = hs.shape
        x0, y1 = t.c, t.f
        x1, y0 = x0 + cols * t.a, y1 + rows * t.e
        with rasterio.open("/vsicurl/" + D2_URL) as d2:
            _require_f7(d2, "D2", x0, y0, x1, y1)
            wd = from_bounds(x0, y0, x1, y1, d2.transform)
            rgb_u8 = d2.read(window=wd, out_shape=(3, rows, cols), resampling=Resampling.average)
            d2_crs_wkt = d2.crs.to_wkt()
            rgb = rgb_u8.astype(np.float64)
    lum = 0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2]
    lo, hi = np.percentile(lum, [0.5, 99.5])
    base = linear_stretch_u8(lum, lo, hi)

    prof = dict(width=cols, height=rows, crs=F7_CRS, transform=t)
    with rasterio.open(out / "d2_luminance.jpg", "w", driver="JPEG", count=1, dtype="uint8", QUALITY=85, **prof) as f:
        f.write(base, 1)
    with rasterio.open(out / "d1_hillshade.jpg", "w", driver="JPEG", count=1, dtype="uint8", QUALITY=85, **prof) as f:
        f.write(hs, 1)
    today = dt.date.today().isoformat()
    layers = {
        "frame": "F7", "crs": F7_CRS.to_proj4(), "extentF7": [x0, y0, x1, y1], "pixel_m": t.a,
        "originF1": rep["origin"]["f1"],
        "layers": [
            {"id": "d2", "path": "d2_luminance.jpg", "name": "Orthophoto (D2 colour mosaic, luminance)",
             "unit": "8-bit luminance", "valueClass": "directly_measured", "source": "D2", "resolution_m": 1.0,
             "nativeResolution_m": 0.25, "stretch": [round(float(lo), 2), round(float(hi), 2)], "builtOn": today},
            {"id": "hillshade", "path": "d1_hillshade.jpg", "name": "Hillshade (D1)", "unit": "8-bit shade",
             "valueClass": "model_derived", "source": "D1", "resolution_m": 1.0, "builtOn": today},
            terrain_entry(out, rep, [x0, y0, x1, y1], today),
        ],
    }
    for L in layers["layers"]:
        if "path" in L:  # the terrain entry lists its masks with their own sha256
            L["sha256"] = sha256_file(out / L["path"])
    (out / "terrain_overlay.png").unlink(missing_ok=True)  # replaced by the masks (run_terrain_masks)
    (out / "layers.json").write_text(json.dumps(layers, indent=2))
    # P-04: D2 is shown on the sheet, so it gets a provenance record (facts from docs/data/phase-1.1-source-audit.md).
    d2_record = {
        "id": "D2", "productId": "MSL_Gale_HiRISE-LRGB_78quads_sharp_cog", "url": D2_URL,
        "licence": "USGS Astrogeology orthophoto: Use Constraints None; please credit authors (T. J. Parker, F. J. Calef III)",
        "crs": d2_crs_wkt, "latitudeType": "planetocentric", "longitudeDirection": "east",
        "verticalReference": "not applicable (orthophoto, no heights)", "resolution_m": 0.25,
        "valueClass": "directly_measured", "retrievedOn": today,
        # Scope as for D1 (C-13): sha256 of the window actually read (3 x uint8 after averaging to the 1 m display grid).
        "sha256": hashlib.sha256(np.ascontiguousarray(rgb_u8).tobytes()).hexdigest(),
    }
    prov_path = out / "provenance.json"
    existing = json.loads(prov_path.read_text()) if prov_path.exists() else []
    prov_path.write_text(json.dumps(merge_provenance(existing, d2_record), indent=2))
    print(json.dumps({"extentF7": layers["extentF7"], "size": [cols, rows]}))
    for L in layers["layers"]:
        if "path" in L:
            print(L["id"], (out / L["path"]).stat().st_size, L["sha256"][:12])
    # Plan 7.8 coverage outlines and contours belong to these layers; rewriting layers.json above dropped their
    # registration, so write them again for the same display grid (each step also runs on its own).
    from .run_coverage import main as write_coverage
    write_coverage(area_dir)
    # The 10 m contours (plan 7.8) are registered in layers.json the same way.
    from .run_contours import main as write_contours
    write_contours(area_dir)
    # The plan 6.7 sky-obstruction layer takes about 5 min and the network, so it is recomputed only with --sky;
    # otherwise its existing registration is kept when its files still match (keep_sky).
    if with_sky:
        from .run_sky_grid import main as write_sky
        write_sky(area_dir)
    else:
        lay_path = out / "layers.json"
        lay_path.write_text(json.dumps(keep_sky(old_layers, json.loads(lay_path.read_text()), out), indent=2))


if __name__ == "__main__":
    main(sys.argv[1], "--sky" in sys.argv[2:])
