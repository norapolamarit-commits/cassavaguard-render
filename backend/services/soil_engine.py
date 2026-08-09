"""Soil analysis from real measurements.

In live mode this module never invents a missing laboratory/sensor value.
Synthetic generation remains available only when explicitly configured for
tests or demonstrations.
"""
from __future__ import annotations

import datetime as dt

from backend.config import ENVIRONMENTAL_DATA_MODE
from backend.services import weather_engine
from backend.services.simkit import clamp, hrange, smooth_noise

TEXTURES = [
    ("sandy_loam", "ร่วนปนทราย"),
    ("loamy_sand", "ทรายปนร่วน"),
    ("sandy_clay_loam", "ร่วนเหนียวปนทราย"),
    ("loam", "ร่วน"),
]

OPTIMA = {
    "ph": (5.5, 6.5),
    "om_pct": (1.2, 3.0),
    "n_ppm": (18, 40),
    "p_ppm": (12, 30),
    "k_ppm": (80, 160),
    "cec": (8, 20),
    "moisture_pct": (18, 34),
}
METRIC_KEYS = tuple(OPTIMA)


def _status(key: str, value: float | None) -> str:
    if value is None:
        return "unavailable"
    low, high = OPTIMA[key]
    if value < low * 0.8 or value > high * 1.25:
        return "critical"
    if value < low or value > high:
        return "warning"
    return "optimal"


def _risk(statuses: dict[str, str]) -> str:
    available = [value for value in statuses.values() if value != "unavailable"]
    if not available:
        return "unknown"
    critical = available.count("critical")
    warning = available.count("warning")
    return "high" if critical >= 2 else ("medium" if critical == 1 or warning >= 3 else "low")


def _sample_value(sample, key: str):
    if sample is None:
        return None
    if isinstance(sample, dict):
        return sample.get(key)
    return getattr(sample, key, None)


def _sample_profile(field_id: int, sample) -> dict:
    metrics = {
        key: (
            round(float(value), 2)
            if (value := _sample_value(sample, key)) is not None
            else None
        )
        for key in METRIC_KEYS
    }
    statuses = {key: _status(key, value) for key, value in metrics.items()}
    sampled_at = _sample_value(sample, "sampled_at")
    if hasattr(sampled_at, "isoformat"):
        sampled_at = sampled_at.isoformat()
    source = _sample_value(sample, "source") if sample is not None else None
    texture = _sample_value(sample, "texture") if sample is not None else ""
    return {
        "field_id": field_id,
        "texture": texture or "unknown",
        "texture_th": texture or "ยังไม่มีข้อมูล",
        "is_sandy": texture in {"sandy_loam", "loamy_sand"},
        "metrics": metrics,
        "statuses": statuses,
        "optima": OPTIMA,
        "risk_level": _risk(statuses),
        "sampled_at": sampled_at,
        "sample_id": _sample_value(sample, "id") if sample is not None else None,
        "data_source": {
            "mode": "live",
            "provider": _sample_value(sample, "lab_name") or source or "user supplied",
            "kind": "measured_soil_sample" if sample is not None else "no_measurement",
            "measurement_method": source,
            "is_observation": sample is not None,
        },
    }


def _synthetic_profile(field_id: int, lat: float, lon: float) -> dict:
    texture = TEXTURES[int(hrange(0, len(TEXTURES) - 0.001, "tex", field_id))]
    rain14 = sum(day["rainfall_mm"] for day in weather_engine.history(lat, lon, 14))
    sandy = texture[0] in ("sandy_loam", "loamy_sand")
    metrics = {
        "ph": round(hrange(4.6, 6.9, "ph", field_id), 1),
        "om_pct": round(hrange(0.6, 2.6, "om", field_id) * (0.85 if sandy else 1.15), 2),
        "n_ppm": round(hrange(8, 38, "n", field_id)),
        "p_ppm": round(hrange(5, 34, "p", field_id)),
        "k_ppm": round(hrange(35, 175, "k", field_id) * (0.8 if sandy else 1.05)),
        "cec": round(hrange(4, 22, "cec", field_id) * (0.75 if sandy else 1.1), 1),
        "moisture_pct": round(
            clamp(
                12
                + rain14 * 0.12
                + (0 if sandy else 5)
                + 3
                * smooth_noise(
                    dt.date.today().toordinal() / 6, f"sm{field_id}"
                ),
                5,
                44,
            ),
            1,
        ),
    }
    statuses = {key: _status(key, value) for key, value in metrics.items()}
    return {
        "field_id": field_id,
        "texture": texture[0],
        "texture_th": texture[1],
        "is_sandy": sandy,
        "metrics": metrics,
        "statuses": statuses,
        "optima": OPTIMA,
        "risk_level": _risk(statuses),
        "sampled_at": dt.date.today().isoformat(),
        "sample_id": None,
        "data_source": {
            "mode": "synthetic",
            "provider": "CassavaGuard deterministic test generator",
            "kind": "generated_test_data",
            "is_observation": False,
        },
    }


def profile(field_id: int, lat: float, lon: float, sample=None) -> dict:
    if ENVIRONMENTAL_DATA_MODE == "live":
        return _sample_profile(field_id, sample)
    return _synthetic_profile(field_id, lat, lon)


def moisture_history(
    field_id: int,
    lat: float,
    lon: float,
    days: int = 30,
    samples: list | None = None,
) -> list:
    if ENVIRONMENTAL_DATA_MODE == "live":
        rainfall = {
            row["date"]: row["rainfall_mm"]
            for row in weather_engine.history(lat, lon, days)
        }
        out = []
        for sample in samples or []:
            moisture = _sample_value(sample, "moisture_pct")
            sampled_at = _sample_value(sample, "sampled_at")
            if moisture is None or sampled_at is None:
                continue
            date = sampled_at.date().isoformat() if hasattr(sampled_at, "date") else str(sampled_at)[:10]
            out.append(
                {
                    "date": date,
                    "moisture_pct": round(float(moisture), 1),
                    "rainfall_mm": rainfall.get(date),
                    "sample_id": _sample_value(sample, "id"),
                    "data_source": {
                        "mode": "live",
                        "kind": "measured_soil_sample",
                        "is_observation": True,
                    },
                }
            )
        return out

    weather = weather_engine.history(lat, lon, days + 14)
    out, moisture = [], 20.0
    for index, day in enumerate(weather):
        moisture = clamp(moisture * 0.94 + day["rainfall_mm"] * 0.28 - 0.5, 5, 46)
        if index >= 14:
            out.append(
                {
                    "date": day["date"],
                    "moisture_pct": round(moisture, 1),
                    "rainfall_mm": day["rainfall_mm"],
                    "data_source": {
                        "mode": "synthetic",
                        "kind": "generated_test_data",
                        "is_observation": False,
                    },
                }
            )
    return out
