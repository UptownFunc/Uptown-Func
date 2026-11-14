# SI-assisted: drafted with Claude Code (Claude Opus 5.5); human Data and Science review pending.
# Build step: warped elevation -> Horn slope -> terrain classes -> quantised typed-array grids + report.
import json, math
import numpy as np
from affine import Affine
from rasterio.crs import CRS

from sharpwalk.build import build_area
from sharpwalk.geo import R_F1
from sharpwalk.grids import CLASS_UNKNOWN, CLASS_CANDIDATE, CLASS_EXCLUDED, dequantise

EQC = CRS.from_proj4(f"+proj=eqc +lat_ts=0 +lat_0=0 +lon_0=0 +R={R_F1:.0f} +units=m +no_defs")
LAT0, LON0 = -4.815, 137.39

def src_two_slopes(size=800):
    """West half 10 deg (candidate), east half 30 deg (excluded), a NoData strip in the north."""
    x0 = R_F1 * math.radians(LON0) - size / 2
    y0 = R_F1 * math.radians(LAT0) + size / 2
    t = Affine(1.0, 0, x0, 0, -1.0, y0)
    r = np.arange(size)[:, None] * np.ones((1, size))
    c = np.ones((size, 1)) * np.arange(size)[None, :]
    z = np.where(c < size / 2, -3500 + math.tan(math.radians(10)) * r, -3500 + math.tan(math.radians(30)) * r)
    z = z.astype(np.float32)
    z[:150, :] = -32767.0  # 400-250 m north of the origin; grid rows 0-24 fall inside it
    return z, t

def run(tmp_path):
    z, t = src_two_slopes()
    return build_area(z, t, EQC, -32767.0, LAT0, LON0, cell_m=2.0, n=300, slope_limit_deg=20.0,
                      out_dir=tmp_path, area_id="test-area")

def test_writes_three_grids_with_checksums(tmp_path):
    rep = run(tmp_path)
    names = {g["name"] for g in rep["grids"]}
    assert names == {"elevation", "slope", "terrain_class"}
    for g in rep["grids"]:
        assert (tmp_path / g["path"]).exists() and len(g["sha256"]) == 64

def test_classes_split_at_the_limit_and_nodata_is_unknown(tmp_path):
    rep = run(tmp_path)
    tc = np.fromfile(tmp_path / "terrain_class.uint8.bin", dtype="<u1").reshape(300, 300)
    assert tc[150, 60] == CLASS_CANDIDATE
    assert tc[150, 240] == CLASS_EXCLUDED
    assert tc[2, 150] == CLASS_UNKNOWN          # NoData strip
    assert (tc[0, :] == CLASS_UNKNOWN).all()     # grid border has no Horn neighbours
    assert rep["counts"]["unknown"] + rep["counts"]["candidate"] + rep["counts"]["excluded"] == 300 * 300

def test_elevation_round_trips_within_quantisation(tmp_path):
    rep = run(tmp_path)
    g = next(g for g in rep["grids"] if g["name"] == "elevation")
    q = np.fromfile(tmp_path / g["path"], dtype="<u2").reshape(300, 300)
    z = dequantise(q, g["offset"], g["scale"], g["noData"])
    assert np.isnan(z[2, 150]) and np.nanmin(z) < -3400

def test_report_states_inputs_and_is_json(tmp_path):
    rep = run(tmp_path)
    saved = json.loads((tmp_path / "build_report.json").read_text())
    assert saved["areaId"] == "test-area" and saved["cellSize_m"] == 2.0
    assert saved["rows"] == saved["cols"] == 300
    assert saved["origin"]["f1"]["lat"] == LAT0 and saved["slopeLimit_deg"] == 20.0
    assert "controlPoints" not in saved  # residuals are 1.5 work; never written as placeholders
