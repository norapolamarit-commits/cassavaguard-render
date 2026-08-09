"""Field routes: list, geojson, detail (with fused analysis + recommendations)."""
import datetime as dt
import json

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.core.access import fields_query, get_field, predictions_query
from backend.core.security import get_current_user
from backend.database import get_db
from backend.models import Field, Prediction, SoilSample, User
from backend.schemas import FieldIn
from backend.services import (reco_engine, satellite_engine, soil_engine,
                             weather_engine)
from backend.services.provider_client import ProviderError
from backend.services.seed import _boundary

router = APIRouter(prefix="/api/fields", tags=["fields"])


def _field_brief(f: Field) -> dict:
    return {
        "id": f.id, "name": f.name, "name_th": f.name_th, "province": f.province,
        "variety": f.variety, "area_rai": f.area_rai, "plant_count": f.plant_count,
        "lat": f.lat, "lon": f.lon, "health_score": f.health_score,
        "risk_level": f.risk_level, "planted_at": f.planted_at.date().isoformat(),
        "age_days": (dt.date.today() - f.planted_at.date()).days,
    }


@router.get("")
def list_fields(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return [_field_brief(f) for f in fields_query(db, user).order_by(Field.id).all()]


@router.get("/geojson")
def fields_geojson(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    feats = []
    for f in fields_query(db, user).all():
        feats.append({
            "type": "Feature",
            "properties": {**_field_brief(f)},
            "geometry": {"type": "Polygon", "coordinates": [json.loads(f.boundary_json)]},
        })
    return {"type": "FeatureCollection", "features": feats}


@router.post("", status_code=201)
def create_field(body: FieldIn, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if user.role == "researcher":
        raise HTTPException(403, "Researchers have read-only field access")
    planted = dt.date.today()
    fid = (db.query(Field).count() or 0) + 1
    # A raw NDVI value is not a validated crop-health score, especially before
    # emergence. Keep health unknown until a real assessment is recorded.
    health, risk = 0.0, "unknown"
    f = Field(name=body.name, name_th=body.name_th, province=body.province, variety=body.variety,
              area_rai=body.area_rai, plant_count=int(body.area_rai * 1600 / 1.2),
              planted_at=dt.datetime.combine(planted, dt.time()), lat=body.lat, lon=body.lon,
              boundary_json=_boundary(body.lat, body.lon, body.area_rai, fid),
              health_score=health, risk_level=risk, owner_id=user.id)
    db.add(f); db.commit(); db.refresh(f)
    return _field_brief(f)


@router.get("/{field_id}")
def field_detail(field_id: int, user: User = Depends(get_current_user),
                 db: Session = Depends(get_db)):
    f = get_field(db, field_id, user)
    planted = f.planted_at.date()
    latest_soil = (
        db.query(SoilSample)
        .filter(SoilSample.field_id == f.id)
        .order_by(SoilSample.sampled_at.desc(), SoilSample.id.desc())
        .first()
    )
    try:
        wsum = weather_engine.summary(f.lat, f.lon)
        ndvi_series = satellite_engine.timeline(
            f.id, f.lat, f.lon, planted, f.health_score, months=8
        )
    except ProviderError as exc:
        raise HTTPException(503, f"Live environmental data unavailable: {exc}") from exc
    soil = soil_engine.profile(f.id, f.lat, f.lon, latest_soil)
    field_predictions = predictions_query(db, user).filter(Prediction.field_id == f.id)
    last_pred = (field_predictions
                 .order_by(Prediction.created_at.desc()).first())
    ai_pred = None
    if last_pred:
        ai_pred = {"top_class": last_pred.top_class, "confidence": last_pred.confidence,
                   "symptoms": json.loads(last_pred.symptoms_json or "[]")}
    recos = reco_engine.build(_field_brief(f), soil, wsum, ndvi_series, ai_pred)

    # predicted risks summary
    risks = []
    for r in recos:
        if r["severity"] in ("high", "medium"):
            risks.append({"kind": r["kind"], "severity": r["severity"],
                          "en": r["title_en"], "th": r["title_th"], "confidence": r["confidence"]})

    return {
        **_field_brief(f),
        "weather": wsum,
        "soil": {k: v for k, v in soil.items() if k != "optima"},
        "ndvi_series": ndvi_series,
        "current_indices": ndvi_series[-1] if ndvi_series else {},
        "predicted_risks": risks,
        "recommendations": recos,
        "history_count": field_predictions.count(),
        "boundary": json.loads(f.boundary_json),
    }
