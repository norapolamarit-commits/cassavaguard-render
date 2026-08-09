"""Central authorization helpers.

Admins and researchers may read all agronomy data. Farmers are isolated to
their own fields and predictions. Only admins or a field's farmer-owner may
mutate a field. A missing and an inaccessible object both return 404 so IDs
cannot be enumerated across accounts.
"""
from fastapi import HTTPException
from sqlalchemy.orm import Query, Session

from backend.models import Alert, Field, Prediction, User


def can_read_all(user: User) -> bool:
    return user.role in {"admin", "researcher"}


def fields_query(db: Session, user: User) -> Query:
    query = db.query(Field)
    if not can_read_all(user):
        query = query.filter(Field.owner_id == user.id)
    return query


def predictions_query(db: Session, user: User) -> Query:
    query = db.query(Prediction)
    if not can_read_all(user):
        query = query.filter(Prediction.user_id == user.id)
    return query


def alerts_query(db: Session, user: User) -> Query:
    query = db.query(Alert)
    if not can_read_all(user):
        query = query.join(Field, Alert.field_id == Field.id).filter(Field.owner_id == user.id)
    return query


def get_field(db: Session, field_id: int, user: User, *, write: bool = False) -> Field:
    field = db.get(Field, field_id)
    if field is None:
        raise HTTPException(404, "Field not found")
    if can_read_all(user):
        if write and user.role != "admin":
            raise HTTPException(403, "Researchers have read-only field access")
        return field
    if field.owner_id != user.id:
        raise HTTPException(404, "Field not found")
    return field


def get_prediction(db: Session, prediction_id: int, user: User) -> Prediction:
    prediction = db.get(Prediction, prediction_id)
    if prediction is None or (not can_read_all(user) and prediction.user_id != user.id):
        raise HTTPException(404, "Prediction not found")
    return prediction


def get_alert(db: Session, alert_id: int, user: User) -> Alert:
    alert = db.get(Alert, alert_id)
    if alert is None:
        raise HTTPException(404, "Alert not found")
    if not can_read_all(user):
        field = db.get(Field, alert.field_id) if alert.field_id else None
        if field is None or field.owner_id != user.id:
            raise HTTPException(404, "Alert not found")
    return alert
