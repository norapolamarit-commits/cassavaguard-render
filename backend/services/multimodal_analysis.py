"""Join image diagnosis with independent, provenance-labelled field evidence.

Environmental evidence affects field-risk guidance and recommendations only. It
never alters CNN disease probabilities, avoiding the target leakage present in
the legacy experimental fusion training set.
"""
from __future__ import annotations

import datetime as dt

from backend.services import reco_engine, satellite_engine, weather_engine
from backend.services.provider_client import ProviderError


def _field_brief(field) -> dict:
    return {
        "id": field.id, "name": field.name, "name_th": field.name_th,
        "province": field.province, "variety": field.variety,
        "area_rai": field.area_rai, "plant_count": field.plant_count,
        "lat": field.lat, "lon": field.lon,
        "health_score": field.health_score, "risk_level": field.risk_level,
        "planted_at": field.planted_at.date().isoformat(),
        "age_days": (dt.date.today() - field.planted_at.date()).days,
    }


def build(field, image_result: dict) -> dict:
    errors = []
    weather = terrain = indices = None
    try:
        weather = weather_engine.summary(field.lat, field.lon)
    except ProviderError as exc:
        errors.append({"source": "weather", "error": str(exc)})
    try:
        terrain = weather_engine.terrain(field.lat, field.lon)
    except ProviderError as exc:
        errors.append({"source": "terrain", "error": str(exc)})
    try:
        indices = satellite_engine.indices_on(
            field.id, field.lat, field.lon, field.planted_at.date(),
            field.health_score, dt.date.today(),
        )
    except ProviderError as exc:
        errors.append({"source": "satellite", "error": str(exc)})

    # reco_engine still expects a soil-shaped argument. Supply explicit missing
    # values only to enable its weather/satellite/disease rules, then remove every
    # nutrient/soil card. No soil value is fetched, inferred, or displayed.
    unavailable_soil = {
        "metrics": {key: None for key in ("ph", "om_pct", "n_ppm", "p_ppm", "k_ppm", "cec", "moisture_pct")},
        "statuses": {key: "unavailable" for key in ("ph", "om_pct", "n_ppm", "p_ppm", "k_ppm", "cec", "moisture_pct")},
        "is_sandy": False,
    }
    recommendations = []
    if weather is not None:
        candidates = reco_engine.build(
            _field_brief(field), unavailable_soil, weather,
            [indices] if indices is not None else [], image_result,
        )
        recommendations = [
            card for card in candidates
            if card.get("kind") != "nutrient"
            and card.get("title_en") != "More Field Measurements Required"
        ]

    evidence = []
    if weather is not None:
        evidence.append({
            "source": "weather", "available": True,
            "summary": {
                "rain_7d_mm": weather.get("rain_7d_mm"),
                "temperature_c": weather.get("today", {}).get("temp_c"),
                "humidity_pct": weather.get("today", {}).get("humidity_pct"),
                "warnings": weather.get("warnings", []),
            },
            "data_source": weather.get("data_source"),
        })
    if terrain is not None:
        evidence.append({"source": "terrain", "available": True, **terrain})
    if indices is not None:
        evidence.append({
            "source": "satellite", "available": True,
            "summary": {key: indices.get(key) for key in ("ndvi", "ndwi", "savi", "evi")},
            "data_source": indices.get("data_source"),
        })

    return {
        "method": "independent_multimodal_evidence_synthesis_v1",
        "field_id": field.id, "field_name": field.name,
        "changes_image_probabilities": False,
        "diagnosis_source": image_result.get("model", {}).get("id"),
        "evidence": evidence, "recommendations": recommendations,
        "partial": bool(errors), "errors": errors,
        "disclaimer_en": "Weather, terrain, and satellite evidence adjust field-risk guidance, not CNN disease probabilities.",
        "disclaimer_th": "ข้อมูลอากาศ ภูมิประเทศ และดาวเทียมใช้ปรับคำแนะนำความเสี่ยงของแปลง ไม่ได้เปลี่ยนค่าความน่าจะเป็นโรคจาก CNN",
    }
