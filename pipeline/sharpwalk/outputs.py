# SI-assisted: drafted with Claude Code (Claude Opus 5.5); human Data and Science review pending.
"""Typed-array grid files and checksums (plan 7.5 Grid contract, as drafted in src/contracts)."""
import hashlib
from pathlib import Path
import numpy as np

_LE = {"uint8": "<u1", "uint16": "<u2", "float32": "<f4"}


def sha256_file(path) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def write_grid(out_dir, name: str, array: np.ndarray, *, unit: str, noData, scale: float, offset: float,
               valueClass: str) -> dict:
    dtype = np.dtype(array.dtype).name
    if dtype not in _LE:
        raise ValueError(f"unsupported dtype {dtype}")
    rel = f"{name}.{dtype}.bin"
    path = Path(out_dir) / rel
    path.write_bytes(np.ascontiguousarray(array).astype(_LE[dtype]).tobytes())
    return {"name": name, "unit": unit, "dtype": dtype, "noData": noData, "scale": scale, "offset": offset,
            "valueClass": valueClass, "path": rel, "sha256": sha256_file(path)}


def merge_provenance(records: list, record: dict) -> list:
    """Provenance list with `record` replacing any record of the same dataset id; other records are kept in order."""
    out = [r for r in records if r.get("id") != record["id"]]
    out.append(record)
    def key(r):
        i = str(r.get("id", ""))
        return (0, int(i[1:]), i) if i[:1] == "D" and i[1:].isdigit() else (1, 0, i)
    return sorted(out, key=key)
