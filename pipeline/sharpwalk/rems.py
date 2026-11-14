# SI-assisted: drafted with Claude Code (Claude Opus 5.5); human Data and Science review pending.
"""D7: a dated, build-time snapshot of the latest Curiosity REMS daily summary (plan 6.10, weakness 27; plan 13
"take it at build time so the dated reading is the latest").

The feed is CAB's outreach summary served by mars.nasa.gov. Its JSON gives no unit per field: temperatures are read
as degrees Celsius and pressure as pascals, from the feed's own pressure description ("about 700 Pascals") and
CAB's REMS reports (DECISIONS REMS-01, pending Data and Science review). The reading is at the rover, not at the
boxwork, and is from a real recent sol, not the scenario date."""
import hashlib
import json

FEED_URL = "https://mars.nasa.gov/rss/api/?feed=weather&category=msl&feedtype=json"
_FIELDS = ("min_temp", "max_temp", "pressure")


def _num(v):
    try:
        return float(v)
    except (TypeError, ValueError):
        return None


def latest_complete_sol(feed: dict) -> dict:
    """The highest-numbered sol whose air temperatures and pressure are all numbers ("--" means not reported)."""
    complete = [s for s in feed.get("soles", []) if _num(s.get("sol")) is not None and all(_num(s.get(f)) is not None for f in _FIELDS)]
    if not complete:
        raise ValueError("no sol in the feed has air temperature and pressure")
    return max(complete, key=lambda s: int(s["sol"]))


def build_snapshot(raw: bytes, *, url: str, retrieved_at: str) -> dict:
    feed = json.loads(raw)
    s = latest_complete_sol(feed)
    disclaimer = " ".join(str(feed.get("descriptions", {}).get("disclaimer_en", "")).split())
    return {
        "id": "D7",
        "valueClass": "directly_measured",
        "reading": {
            "sol": int(s["sol"]), "terrestrialDate": s["terrestrial_date"], "ls_deg": _num(s.get("ls")),
            "airTempMin_C": _num(s["min_temp"]), "airTempMax_C": _num(s["max_temp"]), "pressure_Pa": _num(s["pressure"]),
        },
        "source": {
            "title": "MSL REMS daily weather summary (Centro de Astrobiologia, CAB), via mars.nasa.gov",
            "url": url, "retrievedAt": retrieved_at, "sha256": hashlib.sha256(raw).hexdigest(), "disclaimer": disclaimer,
        },
    }
