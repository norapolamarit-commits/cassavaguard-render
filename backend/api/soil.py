"""Soil routes backed by real laboratory/sensor measurements."""
from __future__ import annotations

import datetime as dt

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from backend.config import ENVIRONMENTAL_DATA_MODE
from backend.core.access import fields_query, get_field
from backend.core.security import get_current_user
from backend.database import get_db
from backend.models import Field, SoilSample, User
from backend.schemas import SoilSampleIn
from backend.services import soil_engine as se
from backend.services.provider_client import ProviderError

router = APIRouter(prefix="/api/soil", tags=["soil"])


def _latest_sample(db: Session, field_id: int):
    return (
        db.query(SoilSample)
        .filter(SoilSample.field_id == field_id)
        .order_by(SoilSample.sampled_at.desc(), SoilSample.id.desc())
        .first()
    )


def _sample_out(sample: SoilSample) -> dict:
    return {
        "id": sample.id,
        "field_id": sample.field_id,
        "sampled_at": sample.sampled_at.isoformat(),
        "source": sample.source,
        "lab_name": sample.lab_name,
        "texture": sample.texture,
        "ph": sample.ph,
        "om_pct": sample.om_pct,
        "n_ppm": sample.n_ppm,
        "p_ppm": sample.p_ppm,
        "k_ppm": sample.k_ppm,
        "cec": sample.cec,
        "moisture_pct": sample.moisture_pct,
        "notes": sample.notes,
    }


@router.get("/{field_id}")
def profile(
    field_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    field = get_field(db, field_id, user)
    return se.profile(field.id, field.lat, field.lon, _latest_sample(db, field.id))


@router.get("/{field_id}/moisture")
def moisture(
    field_id: int,
    days: int = Query(30, ge=7, le=90),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    field = get_field(db, field_id, user)
    since = dt.datetime.now(dt.UTC).replace(tzinfo=None) - dt.timedelta(days=days)
    samples = (
        db.query(SoilSample)
        .filter(
            SoilSample.field_id == field.id,
            SoilSample.sampled_at >= since,
        )
        .order_by(SoilSample.sampled_at)
        .all()
    )
    try:
        series = se.moisture_history(
            field.id, field.lat, field.lon, days, samples=samples
        )
    except ProviderError as exc:
        raise HTTPException(503, f"Live weather data unavailable: {exc}") from exc
    return {"field_id": field_id, "series": series}


@router.get("/{field_id}/samples")
def samples(
    field_id: int,
    limit: int = Query(100, ge=1, le=500),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    field = get_field(db, field_id, user)
    rows = (
        db.query(SoilSample)
        .filter(SoilSample.field_id == field.id)
        .order_by(SoilSample.sampled_at.desc())
        .limit(limit)
        .all()
    )
    return [_sample_out(row) for row in rows]


@router.post("/{field_id}/samples", status_code=201)
def create_sample(
    field_id: int,
    body: SoilSampleIn,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if user.role == "researcher":
        raise HTTPException(403, "Researchers have read-only soil access")
    field = get_field(db, field_id, user)
    sampled_at = body.sampled_at
    if sampled_at.tzinfo is not None:
        sampled_at = sampled_at.astimezone(dt.UTC).replace(tzinfo=None)
    if sampled_at > dt.datetime.now(dt.UTC).replace(tzinfo=None) + dt.timedelta(minutes=5):
        raise HTTPException(422, "sampled_at cannot be in the future")
    row = SoilSample(
        field_id=field.id,
        user_id=user.id,
        sampled_at=sampled_at,
        **body.model_dump(exclude={"sampled_at"}),
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return _sample_out(row)


@router.get("")
def all_soils(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    out = []
    for field in fields_query(db, user).order_by(Field.id).all():
        profile_data = se.profile(
            field.id,
            field.lat,
            field.lon,
            _latest_sample(db, field.id),
        )
        out.append(
            {
                "field_id": field.id,
                "name": field.name,
                "name_th": field.name_th,
                "metrics": profile_data["metrics"],
                "risk_level": profile_data["risk_level"],
                "sampled_at": profile_data["sampled_at"],
                "data_source": profile_data["data_source"],
            }
        )
    return out
