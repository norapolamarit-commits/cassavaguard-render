"""Per-user notification / alert routes."""
from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.core.access import alerts_query, get_alert
from backend.core.security import get_current_user
from backend.database import get_db
from backend.models import Alert, AlertRead, Field, User

router = APIRouter(prefix="/api/notifications", tags=["notifications"])


def _out(a: Alert, read: bool, field_name="", field_name_th=""):
    return {"id": a.id, "kind": a.kind, "severity": a.severity,
            "title": a.title, "title_th": a.title_th,
            "message": a.message, "message_th": a.message_th,
            "read": read, "field_id": a.field_id,
            "field_name": field_name, "field_name_th": field_name_th,
            "created_at": a.created_at.isoformat()}


@router.get("")
def list_alerts(unread_only: bool = Query(False), user: User = Depends(get_current_user),
                db: Session = Depends(get_db)):
    q = alerts_query(db, user)
    read_ids_query = select(AlertRead.alert_id).where(AlertRead.user_id == user.id)
    if unread_only:
        q = q.filter(~Alert.id.in_(read_ids_query))
    alerts = q.order_by(Alert.created_at.desc()).limit(50).all()
    read_ids = {row[0] for row in db.query(AlertRead.alert_id).filter_by(user_id=user.id).all()}
    fmap = {f.id: f for f in db.query(Field).all()}
    return {
        "unread": alerts_query(db, user).filter(~Alert.id.in_(read_ids_query)).count(),
        "items": [_out(a, a.id in read_ids, fmap[a.field_id].name if a.field_id in fmap else "",
                       fmap[a.field_id].name_th if a.field_id in fmap else "") for a in alerts],
    }


@router.post("/{alert_id}/read")
def mark_read(alert_id: int, user: User = Depends(get_current_user),
              db: Session = Depends(get_db)):
    a = get_alert(db, alert_id, user)
    if db.get(AlertRead, (user.id, a.id)) is None:
        db.add(AlertRead(user_id=user.id, alert_id=a.id))
        db.commit()
    return {"ok": True}


@router.post("/read-all")
def mark_all(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    read_ids = {row[0] for row in db.query(AlertRead.alert_id).filter_by(user_id=user.id).all()}
    for alert in alerts_query(db, user).all():
        if alert.id not in read_ids:
            db.add(AlertRead(user_id=user.id, alert_id=alert.id))
    db.commit()
    return {"ok": True}
