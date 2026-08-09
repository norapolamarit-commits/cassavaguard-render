"""Weather provider.

Live mode returns operational weather-model data from Open-Meteo and includes
provider/time provenance in every record. Synthetic mode exists only for
offline tests and explicitly labels every generated value.
"""
from __future__ import annotations

import datetime as dt
import math
from typing import Any

from backend.config import ENVIRONMENTAL_DATA_MODE, OPEN_METEO_BASE_URL
from backend.services.provider_client import ProviderError, get_json
from backend.services.simkit import clamp, h01, smooth_noise

CONDITIONS = [
    ("sunny", "แดดจัด"),
    ("partly_cloudy", "มีเมฆบางส่วน"),
    ("cloudy", "เมฆมาก"),
    ("rain", "ฝนตก"),
    ("storm", "พายุฝน"),
]

_DAILY_FIELDS = ",".join(
    [
        "weather_code",
        "temperature_2m_max",
        "temperature_2m_min",
        "temperature_2m_mean",
        "relative_humidity_2m_mean",
        "precipitation_sum",
        "wind_speed_10m_max",
        "shortwave_radiation_sum",
    ]
)
_CURRENT_FIELDS = ",".join(
    [
        "temperature_2m",
        "relative_humidity_2m",
        "precipitation",
        "weather_code",
        "wind_speed_10m",
        "shortwave_radiation",
    ]
)


def _source(kind: str, *, model: str | None = None) -> dict:
    if ENVIRONMENTAL_DATA_MODE == "synthetic":
        return {
            "mode": "synthetic",
            "provider": "CassavaGuard deterministic test generator",
            "kind": "generated_test_data",
            "is_observation": False,
        }
    return {
        "mode": "live",
        "provider": "Open-Meteo",
        "kind": kind,
        "is_observation": False,
        "model": model or "best_match",
        "license": "CC BY 4.0",
        "url": "https://open-meteo.com/",
    }


def _condition(code: int | float | None) -> tuple[str, str]:
    code = int(code or 0)
    if code == 0:
        return CONDITIONS[0]
    if code in {1, 2}:
        return CONDITIONS[1]
    if code == 3 or code in {45, 48}:
        return CONDITIONS[2]
    if code >= 95:
        return CONDITIONS[4]
    if code in {51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82}:
        return CONDITIONS[3]
    return CONDITIONS[2]


def _live_payload(
    lat: float,
    lon: float,
    *,
    past_days: int = 0,
    forecast_days: int = 1,
    include_current: bool = False,
) -> dict:
    params: dict[str, Any] = {
        "latitude": round(lat, 6),
        "longitude": round(lon, 6),
        "daily": _DAILY_FIELDS,
        "timezone": "auto",
        "past_days": past_days,
        "forecast_days": forecast_days,
    }
    if include_current:
        params["current"] = _CURRENT_FIELDS
    return get_json(
        OPEN_METEO_BASE_URL,
        params=params,
        cache_key=(
            f"weather:{round(lat, 4)}:{round(lon, 4)}:"
            f"{past_days}:{forecast_days}:{int(include_current)}"
        ),
        ttl=900 if include_current else 21600,
    )


def _daily_records(payload: dict) -> list[dict]:
    daily = payload.get("daily") or {}
    dates = daily.get("time") or []
    required = {
        "weather_code",
        "temperature_2m_max",
        "temperature_2m_min",
        "temperature_2m_mean",
        "relative_humidity_2m_mean",
        "precipitation_sum",
        "wind_speed_10m_max",
        "shortwave_radiation_sum",
    }
    if not dates or any(len(daily.get(name) or []) != len(dates) for name in required):
        raise ProviderError("Open-Meteo returned incomplete daily weather data")
    source = _source("operational_weather_model", model=payload.get("model"))
    out = []
    for index, date in enumerate(dates):
        cond = _condition(daily["weather_code"][index])
        out.append(
            {
                "date": date,
                "temp_c": round(float(daily["temperature_2m_mean"][index]), 1),
                "temp_min": round(float(daily["temperature_2m_min"][index]), 1),
                "temp_max": round(float(daily["temperature_2m_max"][index]), 1),
                "humidity_pct": round(float(daily["relative_humidity_2m_mean"][index])),
                "rainfall_mm": round(float(daily["precipitation_sum"][index]), 1),
                "wind_kmh": round(float(daily["wind_speed_10m_max"][index]), 1),
                "solar_mj": round(float(daily["shortwave_radiation_sum"][index]), 1),
                "condition": cond[0],
                "condition_th": cond[1],
                "data_source": source,
            }
        )
    return out


def _season(doy: int) -> dict:
    rain_season = math.exp(-((doy - 250) % 365) ** 2 / (2 * 55**2)) + 0.55 * math.exp(
        -((doy - 150) % 365) ** 2 / (2 * 40**2)
    )
    heat = math.cos((doy - 105) / 365 * 2 * math.pi)
    return {
        "t_base": 27.5 + 3.5 * heat,
        "rain_base": clamp(rain_season, 0, 1.15),
        "rh_base": 62 + 22 * clamp(rain_season, 0, 1),
    }


def _synthetic_day(lat: float, lon: float, date: dt.date) -> dict:
    seed = f"{round(lat, 2)},{round(lon, 2)}"
    doy = date.timetuple().tm_yday
    t = date.toordinal() / 7.0
    season = _season(doy)
    n_t = smooth_noise(t, seed + "T")
    n_r = smooth_noise(t, seed + "R")
    n_w = smooth_noise(t * 1.7, seed + "W")
    temp = round(season["t_base"] + 2.2 * n_t, 1)
    rain_prob = clamp(season["rain_base"] * 0.75 + 0.3 * n_r, 0, 1)
    raining = h01(seed, "rainday", date.isoformat()) < rain_prob
    rainfall = (
        round(clamp(rain_prob, 0, 1) * (4 + 42 * h01(seed, "mm", date.isoformat())), 1)
        if raining
        else 0.0
    )
    humidity = round(clamp(season["rh_base"] + 10 * n_r + (8 if raining else 0), 35, 99))
    wind = round(clamp(7 + 6 * n_w + (9 if rainfall > 25 else 0), 1, 42), 1)
    solar = round(clamp(23 - 12 * rain_prob + 3 * n_t, 6, 29), 1)
    cond = (
        CONDITIONS[4]
        if rainfall > 28
        else CONDITIONS[3]
        if raining
        else CONDITIONS[2]
        if rain_prob > 0.55
        else CONDITIONS[1]
        if rain_prob > 0.3
        else CONDITIONS[0]
    )
    return {
        "date": date.isoformat(),
        "temp_c": temp,
        "temp_min": round(temp - 4.5 - 1.5 * h01(seed, "tmin", doy), 1),
        "temp_max": round(temp + 4.0 + 2.0 * h01(seed, "tmax", doy), 1),
        "humidity_pct": humidity,
        "rainfall_mm": rainfall,
        "wind_kmh": wind,
        "solar_mj": solar,
        "condition": cond[0],
        "condition_th": cond[1],
        "data_source": _source("generated_test_data"),
    }


def day_weather(lat: float, lon: float, date: dt.date) -> dict:
    if ENVIRONMENTAL_DATA_MODE == "synthetic":
        return _synthetic_day(lat, lon, date)
    today = dt.date.today()
    if date < today:
        records = history(lat, lon, min(90, max(1, (today - date).days)))
    else:
        records = forecast(lat, lon, min(14, max(1, (date - today).days)))
    match = next((record for record in records if record["date"] == date.isoformat()), None)
    if match is None:
        raise ProviderError(f"No weather data available for {date.isoformat()}")
    return match


def history(lat: float, lon: float, days: int = 30) -> list:
    if ENVIRONMENTAL_DATA_MODE == "synthetic":
        today = dt.date.today()
        return [
            _synthetic_day(lat, lon, today - dt.timedelta(days=index))
            for index in range(days - 1, -1, -1)
        ]
    payload = _live_payload(lat, lon, past_days=days, forecast_days=0)
    return _daily_records(payload)[-days:]


def forecast(lat: float, lon: float, days: int = 7) -> list:
    if ENVIRONMENTAL_DATA_MODE == "synthetic":
        today = dt.date.today()
        return [_synthetic_day(lat, lon, today + dt.timedelta(days=index)) for index in range(1, days + 1)]
    payload = _live_payload(lat, lon, forecast_days=days + 1)
    today = dt.date.today().isoformat()
    future = [record for record in _daily_records(payload) if record["date"] > today]
    return future[:days]


def current(lat: float, lon: float) -> dict:
    if ENVIRONMENTAL_DATA_MODE == "synthetic":
        weather = _synthetic_day(lat, lon, dt.date.today())
        hour = dt.datetime.now().hour
        weather["temp_c"] = round(
            weather["temp_c"] + 3.5 * math.sin((hour - 9) / 24 * 2 * math.pi), 1
        )
        return weather
    payload = _live_payload(lat, lon, forecast_days=1, include_current=True)
    daily = _daily_records(payload)[0]
    current_data = payload.get("current") or {}
    required = {
        "time",
        "temperature_2m",
        "relative_humidity_2m",
        "precipitation",
        "weather_code",
        "wind_speed_10m",
    }
    if any(current_data.get(name) is None for name in required):
        raise ProviderError("Open-Meteo returned incomplete current weather data")
    cond = _condition(current_data["weather_code"])
    daily.update(
        {
            "observed_at": current_data["time"],
            "temp_c": round(float(current_data["temperature_2m"]), 1),
            "humidity_pct": round(float(current_data["relative_humidity_2m"])),
            "rainfall_mm": round(float(current_data["precipitation"]), 1),
            "wind_kmh": round(float(current_data["wind_speed_10m"]), 1),
            "condition": cond[0],
            "condition_th": cond[1],
        }
    )
    return daily


def summary(lat: float, lon: float) -> dict:
    hist = history(lat, lon, 7)
    today = current(lat, lon)
    rain7 = round(sum(day["rainfall_mm"] for day in hist), 1)
    warnings = []
    if rain7 > 120:
        warnings.append(
            {
                "kind": "heavy_rain",
                "en": "Heavy rainfall accumulation (7d)",
                "th": "ฝนสะสมมากผิดปกติ (7 วัน)",
            }
        )
    if rain7 < 4:
        warnings.append(
            {
                "kind": "dry_spell",
                "en": "Dry spell — irrigation advised",
                "th": "ฝนทิ้งช่วง — ควรให้น้ำ",
            }
        )
    if today["temp_max"] > 38:
        warnings.append({"kind": "heat", "en": "Extreme heat risk", "th": "อากาศร้อนจัด"})
    return {
        "today": today,
        "rain_7d_mm": rain7,
        "warnings": warnings,
        "data_source": today["data_source"],
    }
