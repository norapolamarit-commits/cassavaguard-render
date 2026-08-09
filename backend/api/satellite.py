"""Satellite analysis routes."""
import datetime as dt
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from backend.core.access import get_field
from backend.core.security import get_current_user
from backend.database import get_db
from backend.models import User
from backend.services import satellite_engine as sat
from backend.services.provider_client import ProviderError

router = APIRouter(prefix="/api/satellite", tags=["satellite"])


def _provider_call(func, *args):
    try:
        return func(*args)
    except ProviderError as exc:
        raise HTTPException(503, f"Live satellite data unavailable: {exc}") from exc


@router.get("/meta")
def meta():
    return {
        "indices": sat.INDEX_META,
        "constellation": _provider_call(sat.constellation_status),
    }


@router.get("/status")
def status():
    return _provider_call(sat.constellation_status)


@router.get("/{field_id}/timeline")
def timeline(field_id: int, months: int = Query(12, ge=3, le=24),
             user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    f = get_field(db, field_id, user)
    return {
        "field_id": field_id,
        "series": _provider_call(
            sat.timeline,
            f.id,
            f.lat,
            f.lon,
            f.planted_at.date(),
            f.health_score,
            months,
        ),
    }


@router.get("/{field_id}/grid")
def grid(field_id: int, index: str = Query("ndvi"),
         date: Optional[dt.date] = Query(None),
         user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    f = get_field(db, field_id, user)
    if index not in sat.INDEX_META:
        raise HTTPException(400, "Unknown index")
    on = date or dt.date.today()
    return _provider_call(
        sat.spatial_grid,
        f.id,
        f.lat,
        f.lon,
        f.planted_at.date(),
        f.health_score,
        index,
        on,
    )


@router.get("/{field_id}/passes")
def passes(field_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    f = get_field(db, field_id, user)
    return {
        "field_id": field_id,
        "passes": _provider_call(sat.pass_timeline, f.id, f.lat, f.lon),
    }


@router.get("/{field_id}/compare")
def compare(field_id: int, index: str = Query("ndvi"),
            date_a: Optional[dt.date] = Query(None),
            date_b: Optional[dt.date] = Query(None),
            user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    f = get_field(db, field_id, user)
    if index not in sat.INDEX_META:
        raise HTTPException(400, "Unknown index")
    today = dt.date.today()
    a = date_a or today - dt.timedelta(days=120)
    b = date_b or today
    ga = _provider_call(
        sat.spatial_grid,
        f.id,
        f.lat,
        f.lon,
        f.planted_at.date(),
        f.health_score,
        index,
        a,
    )
    gb = _provider_call(
        sat.spatial_grid,
        f.id,
        f.lat,
        f.lon,
        f.planted_at.date(),
        f.health_score,
        index,
        b,
    )
    return {"index": index, "a": ga, "b": gb,
            "delta_mean": round(gb["mean"] - ga["mean"], 3)}
