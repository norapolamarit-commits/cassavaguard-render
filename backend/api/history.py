"""History routes: prediction history with search/filter + CSV export."""
import csv
import io
import json
from pathlib import Path

from fastapi import APIRouter, Depends, Query, Response
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from backend.config import UPLOAD_DIR
from backend.core.access import get_prediction, predictions_query
from backend.core.security import create_asset_token, get_current_user
from backend.database import get_db
from backend.models import Field, Prediction, User

router = APIRouter(prefix="/api/history", tags=["history"])


def _row(p: Prediction, user: User, fname="", uemail=""):
    return {
        "id": p.id, "created_at": p.created_at.isoformat(), "source": p.source,
        "filename": p.filename, "top_class": p.top_class, "confidence": p.confidence,
        "inference_ms": p.inference_ms, "model_id": p.model_id,
        "field_id": p.field_id, "field_name": fname, "user_email": uemail,
        "probs": json.loads(p.probs_json or "{}"),
        "auxiliary_findings": json.loads(p.auxiliary_json or "[]"),
        "explanation": p.explanation, "explanation_th": p.explanation_th,
        "image_url": (f"/api/files/{p.id}/image?token="
                      f"{create_asset_token(user, p.id, 'image')}") if p.image_path else None,
        "heatmap_url": (f"/api/files/{p.id}/heatmap?token="
                        f"{create_asset_token(user, p.id, 'heatmap')}") if p.heatmap_path else None,
    }


@router.get("/predictions")
def predictions(
    q: str = Query("", description="search filename/class"),
    top_class: str = Query(None),
    field_id: int = Query(None),
    source: str = Query(None),
    limit: int = Query(100, ge=1, le=500),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = predictions_query(db, user)
    if top_class:
        query = query.filter(Prediction.top_class == top_class)
    if field_id:
        query = query.filter(Prediction.field_id == field_id)
    if source:
        query = query.filter(Prediction.source == source)
    if q:
        like = f"%{q}%"
        query = query.filter((Prediction.filename.like(like)) | (Prediction.top_class.like(like)))
    preds = query.order_by(Prediction.created_at.desc()).limit(limit).all()
    fmap = {f.id: f.name for f in db.query(Field).all()}
    umap = {u.id: u.email for u in db.query(User).all()}
    return {"count": len(preds),
            "items": [_row(p, user, fmap.get(p.field_id, ""),
                           umap.get(p.user_id, "") if user.role in {"admin", "researcher"} else "")
                      for p in preds]}


def _csv_safe(value):
    text = "" if value is None else str(value)
    return f"'{text}" if text[:1] in {"=", "+", "-", "@"} else text


@router.get("/predictions/export.csv")
def export_csv(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    preds = predictions_query(db, user).order_by(Prediction.created_at.desc()).all()
    fmap = {f.id: f.name for f in db.query(Field).all()}
    buf = io.StringIO()
    w = csv.writer(buf)
    w.writerow(["id", "created_at", "source", "filename", "top_class",
                "confidence", "inference_ms", "model_id", "field"])
    for p in preds:
        w.writerow([p.id, p.created_at.isoformat(), p.source, _csv_safe(p.filename), p.top_class,
                    p.confidence, p.inference_ms, p.model_id,
                    _csv_safe(fmap.get(p.field_id, ""))])
    buf.seek(0)
    return StreamingResponse(iter([buf.getvalue()]), media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=cassavaguard_predictions.csv"})


@router.get("/predictions/{pred_id}")
def prediction_detail(pred_id: int, user: User = Depends(get_current_user),
                      db: Session = Depends(get_db)):
    p = get_prediction(db, pred_id, user)
    fmap = {f.id: f.name for f in db.query(Field).all()}
    umap = {u.id: u.email for u in db.query(User).all()}
    d = _row(p, user, fmap.get(p.field_id, ""),
             umap.get(p.user_id, "") if user.role in {"admin", "researcher"} else "")
    d["symptoms"] = json.loads(p.symptoms_json or "[]")
    d["feature_importance"] = json.loads(p.features_json or "[]")
    return d


@router.delete("/predictions/{pred_id}", status_code=204)
def delete_prediction(pred_id: int, user: User = Depends(get_current_user),
                      db: Session = Depends(get_db)):
    """Delete one accessible prediction and its generated local image artifacts."""
    prediction = get_prediction(db, pred_id, user)
    artifact_paths = [prediction.image_path, prediction.heatmap_path]
    db.delete(prediction)
    db.commit()
    for value in artifact_paths:
        if not value:
            continue
        path = (UPLOAD_DIR.parent / Path(value)).resolve()
        try:
            path.relative_to(UPLOAD_DIR.resolve())
            if path.is_file():
                path.unlink()
        except (OSError, ValueError):
            # The database deletion is authoritative. Missing/stale artifacts must
            # not turn a successful privacy deletion into an API failure.
            pass
    return Response(status_code=204)
