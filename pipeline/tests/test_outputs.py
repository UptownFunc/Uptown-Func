# SI-assisted: drafted with Claude Code (Claude Opus 5.5); human Data and Science review pending.
# Plan 7.5 / 19.9 contracts as drafted in src/contracts: Grid, AreaManifest, Provenance.
import hashlib, json
import numpy as np

from sharpwalk.outputs import write_grid, sha256_file

def test_write_grid_little_endian_with_checksum(tmp_path):
    a = np.array([[1, 2], [3, 65535]], dtype=np.uint16)
    meta = write_grid(tmp_path, "elevation", a, unit="m", noData=65535, scale=0.01, offset=-3900.0,
                      valueClass="directly_measured")
    raw = (tmp_path / meta["path"]).read_bytes()
    assert raw == a.astype("<u2").tobytes()
    assert meta["dtype"] == "uint16" and meta["name"] == "elevation"
    assert meta["sha256"] == hashlib.sha256(raw).hexdigest() == sha256_file(tmp_path / meta["path"])
    assert set(meta) >= {"name", "unit", "dtype", "noData", "scale", "offset", "valueClass", "path"}
