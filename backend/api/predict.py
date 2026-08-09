"""AI prediction routes: image (leaf/plant/canopy) + CSV, with persistence."""
import base64
import csv
import io
import json
import uuid
from pathlib import Path
from typing import Optional

from fastapi import (APIRouter, Depends, File, Form, HTTPException, UploadFile)
from PIL import Image, UnidentifiedImageError
from sqlalchemy.orm import Session

from backend.config import (
    ACTIVE_MODEL,
    HEATMAP_DIR,
    MAX_CSV_ROWS,
    MAX_CSV_UPLOAD_BYTES,
    MAX_IMAGE_PIXELS,
    MAX_IMAGE_UPLOAD_BYTES,
    UPLOAD_DIR,
)
from backend.core.access import get_field
from backend.core.security import get_current_user
from backend.database import get_db
from backend.models import Alert, Prediction, User
from backend.services import ai_engine

router = APIRouter(prefix="/api/predict", tags=["predict"])

_DISEASE = {"cmd", "cbsd", "cbb", "cgm", "cad", "brown_leaf_spot", "white_leaf_spot", "sed", "mealybug", "whitefly"}
_IMAGE_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp"}


def _safe_filename(filename: str, fallback: str) -> str:
    return (Path(filename or fallback).name or fallback)[:255]


def _validate_image(data: bytes, content_type: Optional[str]) -> None:
    if len(data) > MAX_IMAGE_UPLOAD_BYTES:
        raise HTTPException(413, "Image exceeds the upload size limit")
    if content_type and content_type.lower() not in _IMAGE_CONTENT_TYPES:
        raise HTTPException(415, "Only JPEG, PNG, and WebP images are supported")
    try:
        Image.MAX_IMAGE_PIXELS = MAX_IMAGE_PIXELS
        with Image.open(io.BytesIO(data)) as image:
            image.verify()
        with Image.open(io.BytesIO(data)) as image:
            if image.width * image.height > MAX_IMAGE_PIXELS:
                raise HTTPException(413, "Image dimensions exceed the safety limit")
            if image.format not in {"JPEG", "PNG", "WEBP"}:
                raise HTTPException(415, "Only JPEG, PNG, and WebP images are supported")
    except HTTPException:
        raise
    except (Image.DecompressionBombError, Image.DecompressionBombWarning):
        raise HTTPException(413, "Image dimensions exceed the safety limit")
    except (UnidentifiedImageError, OSError, ValueError):
        raise HTTPException(422, "Could not decode a valid image")


def _save_image_and_heatmap(image_bytes: bytes, result: dict, filename: str) -> tuple:
    """Persist the uploaded image + generated heatmap to disk (uploads/, uploads/heatmaps/)
    so history can retrieve them later. Returns (image_path, heatmap_path), either "" if
    not applicable (e.g. CSV predictions have no image/heatmap)."""
    uid = uuid.uuid4().hex
    ext = Path(filename or "upload.jpg").suffix.lower() or ".jpg"
    if ext not in (".jpg", ".jpeg", ".png", ".webp"):
        ext = ".jpg"

    image_path = ""
    if image_bytes:
        dest = UPLOAD_DIR / f"{uid}{ext}"
        dest.write_bytes(image_bytes)
        image_path = f"uploads/{dest.name}"

    heatmap_path = ""
    heatmap_data_url = result.get("heatmap")
    if heatmap_data_url and heatmap_data_url.startswith("data:image/png;base64,"):
        png_bytes = base64.b64decode(heatmap_data_url.split(",", 1)[1])
        dest = HEATMAP_DIR / f"{uid}.png"
        dest.write_bytes(png_bytes)
        heatmap_path = f"uploads/heatmaps/{dest.name}"

    return image_path, heatmap_path


def _persist(db: Session, result: dict, user_id, field_id, filename: str,
            image_bytes: bytes = b""):
    image_path, heatmap_path = _save_image_and_heatmap(image_bytes, result, filename)
    p = Prediction(
        source=result.get("source", "leaf"), filename=filename,
        image_path=image_path, heatmap_path=heatmap_path,
        top_class=result["top_class"], confidence=result["confidence"],
        probs_json=json.dumps(result.get("probs", {})),
        auxiliary_json=json.dumps(result.get("auxiliary_findings", [])),
        symptoms_json=json.dumps(result.get("symptoms", [])),
        features_json=json.dumps(result.get("feature_importance", [])),
        explanation=result.get("explanation_en", ""), explanation_th=result.get("explanation_th", ""),
        inference_ms=result.get("inference_ms", 0.0),
        model_id=result.get("model", {}).get("id", ACTIVE_MODEL["id"]),
        user_id=user_id, field_id=field_id,
    )
    db.add(p); db.commit(); db.refresh(p)

    # auto-alert on confident disease / stress finding
    tk = result["top_class"]
    if (
        field_id
        and tk in _DISEASE
        and result["confidence"] >= 0.65
        and not result.get("requires_review", True)
    ):
        lbl = result["top3"][0]
        db.add(Alert(kind="disease", severity="high",
                     title=f"{lbl['en']} detected by AI", title_th=f"AI ตรวจพบ{lbl['th']}",
                     message=result.get("explanation_en", "")[:240],
                     message_th=result.get("explanation_th", "")[:240], field_id=field_id))
        db.commit()
    return p.id


@router.post("/image")
async def predict_image(
    file: UploadFile = File(...),
    source: str = Form("leaf"),
    field_id: int = Form(None),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if source not in ("leaf", "plant", "canopy"):
        source = "leaf"
    data = await file.read(MAX_IMAGE_UPLOAD_BYTES + 1)
    if not data:
        raise HTTPException(400, "Empty file")
    _validate_image(data, file.content_type)
    # field_id lets prediction use this field's configured satellite+soil context
    # when a trained fusion classifier exists; falls back to image-only otherwise.
    field = get_field(db, field_id, user) if field_id else None
    try:
        result = ai_engine.predict_image(data, source=source, field=field)
    except ai_engine.ModelUnavailableError as e:
        raise HTTPException(503, f"AI model unavailable: {e}") from e
    except Exception as e:
        raise HTTPException(422, f"Could not process image: {e}")
    filename = _safe_filename(file.filename, "upload.jpg")
    pid = _persist(db, result, user.id, field.id if field else None, filename, image_bytes=data)
    result["prediction_id"] = pid
    return result


@router.post("/csv")
async def predict_csv(
    file: UploadFile = File(...),
    field_id: int = Form(None),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    data = await file.read(MAX_CSV_UPLOAD_BYTES + 1)
    if not data:
        raise HTTPException(400, "Empty file")
    if len(data) > MAX_CSV_UPLOAD_BYTES:
        raise HTTPException(413, "CSV exceeds the upload size limit")
    filename = _safe_filename(file.filename, "data.csv")
    if Path(filename).suffix.lower() != ".csv":
        raise HTTPException(415, "A .csv file is required")
    field = get_field(db, field_id, user) if field_id else None
    try:
        text = data.decode("utf-8", errors="ignore")
        reader = csv.DictReader(io.StringIO(text))
        rows = list(reader)
    except Exception as e:
        raise HTTPException(422, f"Could not parse CSV: {e}")
    supported_columns = {"temp", "humidity", "soil_moisture", "ndvi"}
    headers = {str(name).strip() for name in (reader.fieldnames or []) if name}
    if not headers.intersection(supported_columns):
        raise HTTPException(
            422,
            "CSV must contain at least one supported column: "
            "temp, humidity, soil_moisture, ndvi",
        )
    if len(rows) > MAX_CSV_ROWS:
        raise HTTPException(413, "CSV contains too many rows")
    result = ai_engine.predict_csv(rows)
    if "error" in result:
        raise HTTPException(400, result["error"])
    pid = _persist(db, result, user.id, field.id if field else None, filename)
    result["prediction_id"] = pid
    return result


@router.get("/classes")
def classes():
    from backend.services.model_readiness import class_readiness
    return [
        {
            **item,
            "prediction_support": (
                "trained_model"
                if item["production_output"]
                else item["status"]
            ),
        }
        for item in class_readiness()
    ]
