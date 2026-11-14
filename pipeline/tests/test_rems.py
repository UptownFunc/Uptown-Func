# SI-assisted: drafted with Claude Code (Claude Opus 5.5); human Data and Science review pending.
"""D7 REMS snapshot (plan 6.10 / weakness 27): the latest sol with air temperature and pressure, dated, with the
feed's own disclaimer and the raw bytes' checksum. No network: the feed is a fixture here."""
import hashlib
import json
import pytest
from sharpwalk.rems import build_snapshot, latest_complete_sol

DISCLAIMER = ("\n\t The information contained into this file is provided by Centro de Astrobiologia\n (CAB) and is intended"
              " for outreach purposes only. Any other use is discouraged.\n\t More text.")


def sol(n, date, tmin="-70", tmax="-5", p="777", ls="341"):
    return {"id": str(n), "terrestrial_date": date, "sol": str(n), "ls": ls, "season": "Month 12",
            "min_temp": tmin, "max_temp": tmax, "pressure": p, "atmo_opacity": "Sunny"}


def feed(soles):
    return {"descriptions": {"disclaimer_en": DISCLAIMER}, "soles": soles}


def test_picks_the_highest_sol_with_temperature_and_pressure_whatever_the_order():
    f = feed([sol(4993, "2026-08-23"), sol(4995, "2026-08-25", tmin="--"), sol(4994, "2026-08-24", tmin="-71")])
    assert latest_complete_sol(f)["sol"] == "4994"


def test_refuses_a_feed_with_no_complete_sol():
    with pytest.raises(ValueError):
        latest_complete_sol(feed([sol(1, "2026-01-01", p="--")]))


def test_snapshot_carries_the_reading_its_date_and_the_disclaimer():
    raw = json.dumps(feed([sol(4995, "2026-08-25", tmin="-71", tmax="-5", p="777", ls="341")])).encode()
    s = build_snapshot(raw, url="https://mars.nasa.gov/feed", retrieved_at="2026-11-14T08:00:00Z")
    assert s["id"] == "D7"
    assert s["reading"] == {"sol": 4995, "terrestrialDate": "2026-08-25", "ls_deg": 341.0,
                            "airTempMin_C": -71.0, "airTempMax_C": -5.0, "pressure_Pa": 777.0}
    assert s["source"]["url"] == "https://mars.nasa.gov/feed"
    assert s["source"]["retrievedAt"] == "2026-11-14T08:00:00Z"
    assert s["source"]["sha256"] == hashlib.sha256(raw).hexdigest()
    # The disclaimer is the feed's own words (whitespace collapsed), not a paraphrase.
    assert s["source"]["disclaimer"].startswith("The information contained into this file is provided by Centro de Astrobiologia (CAB)")
    assert "outreach purposes only" in s["source"]["disclaimer"]
    assert s["valueClass"] == "directly_measured"


def test_skips_a_sol_that_is_not_a_whole_number():
    f = feed([sol(4994, "2026-08-24"), {**sol(4995, "2026-08-25"), "sol": "4995.0"}])
    assert latest_complete_sol(f)["sol"] == "4994"
