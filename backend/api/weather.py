"""Weather routes."""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from backend.core.access import fields_query, get_field
from backend.core.security import get_current_user
from backend.database import get_db
from backend.models import User
from backend.services import weather_engine as we
from backend.services.provider_client import ProviderError

router = APIRouter(prefix="/api/weather", tags=["weather"])


def _provider_call(func, *args):
    try:
        return func(*args)
    except ProviderError as exc:
        raise HTTPException(503, f"Live weather data unavailable: {exc}") from exc


def _coords(db, user, field_id, lat, lon):
    if field_id is not None:
        f = get_field(db, field_id, user)
        return f.lat, f.lon
    if (lat is None) != (lon is None):
        raise HTTPException(422, "lat and lon must be provided together")
    if lat is not None and lon is not None:
        return lat, lon
    first = fields_query(db, user).first()
    return (first.lat, first.lon) if first else (14.97, 102.1)


@router.get("/current")
def current(field_id: int = Query(None), lat: float = Query(None, ge=-90, le=90),
            lon: float = Query(None, ge=-180, le=180),
            user: User = Depends(get_current_user),
    db: Session = Depends(get_db)):
    la, lo = _coords(db, user, field_id, lat, lon)
    return _provider_call(we.current, la, lo)


@router.get("/history")
def history(field_id: int = Query(None), lat: float = Query(None, ge=-90, le=90),
            lon: float = Query(None, ge=-180, le=180),
            days: int = Query(30, ge=7, le=90), user: User = Depends(get_current_user),
    db: Session = Depends(get_db)):
    la, lo = _coords(db, user, field_id, lat, lon)
    return {"days": days, "series": _provider_call(we.history, la, lo, days)}


@router.get("/forecast")
def forecast(field_id: int = Query(None), lat: float = Query(None, ge=-90, le=90),
             lon: float = Query(None, ge=-180, le=180),
             days: int = Query(7, ge=1, le=14), user: User = Depends(get_current_user),
    db: Session = Depends(get_db)):
    la, lo = _coords(db, user, field_id, lat, lon)
    return {"days": days, "series": _provider_call(we.forecast, la, lo, days)}


@router.get("/summary")
def summary(field_id: int = Query(None), lat: float = Query(None, ge=-90, le=90),
            lon: float = Query(None, ge=-180, le=180),
            user: User = Depends(get_current_user),
    db: Session = Depends(get_db)):
    la, lo = _coords(db, user, field_id, lat, lon)
    return _provider_call(we.summary, la, lo)
