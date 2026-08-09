"""Dashboard KPIs + notifications."""
import datetime as dt

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.config import ACTIVE_MODEL
from backend.core.access import alerts_query, fields_query, predictions_query
from backend.core.security import get_current_user
from backend.database import get_db
from backend.models import AlertRead, Field, User
from backend.services import satellite_engine, weather_engine
from backend.services.provider_client import ProviderError

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("/kpis")
def kpis(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    fields = fields_query(db, user).all()
    total_fields = len(fields)
    total_plants = sum(f.plant_count for f in fields)
    total_area = round(sum(f.area_rai for f in fields), 1)
    if total_fields:
        assessed = [f for f in fields if f.risk_level in {"low", "medium", "high"}]
        healthy = sum(1 for f in assessed if f.risk_level == "low")
        high_risk = sum(1 for f in assessed if f.risk_level == "high")
        avg_health = (
            round(sum(f.health_score for f in assessed) / len(assessed), 1)
            if assessed
            else 0.0
        )
        healthy_pct = round(healthy / total_fields * 100, 1)
        high_pct = round(high_risk / total_fields * 100, 1)
    else:
        avg_health = healthy_pct = high_pct = 0.0

    alerts = alerts_query(db, user).all()
    read_ids = {row[0] for row in db.query(AlertRead.alert_id).filter_by(user_id=user.id).all()}
    disease_alerts = sum(1 for a in alerts if a.kind == "disease" and a.id not in read_ids)
    nutrient_alerts = sum(1 for a in alerts if a.kind == "nutrient" and a.id not in read_ids)
    water_alerts = sum(1 for a in alerts if a.kind == "water" and a.id not in read_ids)

    # weather summary from first field (or default NE-Thailand point)
    lat, lon = (fields[0].lat, fields[0].lon) if fields else (14.97, 102.1)
    try:
        wsum = weather_engine.summary(lat, lon)
        constellation = satellite_engine.constellation_status()
    except ProviderError:
        wsum = {
            "today": {
                "temp_c": None,
                "humidity_pct": None,
                "condition": "unavailable",
                "condition_th": "ข้อมูลไม่พร้อมใช้งาน",
            },
            "rain_7d_mm": None,
            "warnings": [],
            "data_source": {"mode": "unavailable"},
        }
        constellation = []

    return {
        "total_fields": total_fields,
        "total_plants": total_plants,
        "total_area_rai": total_area,
        "avg_health": avg_health,
        "healthy_pct": healthy_pct,
        "high_risk_pct": high_pct,
        "unassessed_fields": sum(
            1 for field in fields if field.risk_level == "unknown"
        ),
        "disease_alerts": disease_alerts,
        "nutrient_alerts": nutrient_alerts,
        "water_alerts": water_alerts,
        "total_predictions": predictions_query(db, user).count(),
        "weather": {
            "temp_c": wsum["today"]["temp_c"],
            "humidity_pct": wsum["today"]["humidity_pct"],
            "condition": wsum["today"]["condition"],
            "condition_th": wsum["today"]["condition_th"],
            "rain_7d_mm": wsum["rain_7d_mm"],
            "warnings": wsum["warnings"],
        },
        "satellite": {
            "constellation": constellation,
            "online": sum(1 for s in constellation if s["status"] == "online"),
        },
        "model": {"name": ACTIVE_MODEL["name"], "version": ACTIVE_MODEL["version"],
                  "accuracy": ACTIVE_MODEL["accuracy"]},
        "generated_at": dt.datetime.now(dt.UTC).isoformat(),
    }


@router.get("/risk-distribution")
def risk_distribution(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    fields = fields_query(db, user).all()
    out = {"low": 0, "medium": 0, "high": 0}
    for f in fields:
        out[f.risk_level] = out.get(f.risk_level, 0) + 1
    return out


@router.get("/health-by-field")
def health_by_field(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return [{"name": f.name, "name_th": f.name_th, "health": f.health_score,
            "risk": f.risk_level}
            for f in fields_query(db, user).order_by(Field.health_score).all()]
