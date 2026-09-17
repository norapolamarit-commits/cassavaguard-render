"""AI prediction routes: image (leaf/plant/canopy) + CSV, with persistence."""
import base64
import csv
import io
import json
import shutil
import uuid
from pathlib import Path
from typing import Optional

from fastapi import (APIRouter, Depends, File, Form, HTTPException, UploadFile)
from PIL import Image, UnidentifiedImageError
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from backend.config import (
    ACTIVE_MODEL,
    MAX_CSV_ROWS,
    MAX_CSV_UPLOAD_BYTES,
    MAX_IMAGE_PIXELS,
    MAX_IMAGE_UPLOAD_BYTES,
    UPLOAD_DIR,
)
from backend.core.access import get_field, get_prediction
from backend.core.security import get_current_user
from backend.database import get_db
from backend.models import Alert, HarvestMeasurement, Prediction, User
from backend.services import ai_engine
from backend.services.yield_estimator import YieldInputs, estimate as estimate_yield
from backend.services.root_weight_model import predict_from_volume
from backend.services.root_size_model import predict as predict_root_size
from backend.services import photogrammetry
from backend.services import video_frames
from backend.services.capture_time import analyze as analyze_capture_time

router = APIRouter(prefix="/api/predict", tags=["predict"])

_DISEASE = {"cmd", "cbsd", "cbb", "cgm", "cad", "brown_leaf_spot", "white_leaf_spot", "sed", "mealybug", "whitefly"}
_IMAGE_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp"}
_SOURCE_WEIGHTS = {"leaf": 1.0, "plant": 0.75, "canopy": 0.6}
_MAX_EVIDENCE_IMAGES = 4
_MAX_ROOT_VIDEO_BYTES = 250 * 1024 * 1024


class YieldEstimateIn(BaseModel):
    prediction_id: int = Field(gt=0)
    age_months: float = Field(ge=3, le=18)
    height_cm: float = Field(ge=40, le=450)
    stem_count: int = Field(ge=1, le=6)


class HarvestMeasurementIn(YieldEstimateIn):
    total_fresh_root_weight_kg: float = Field(gt=0, le=2000)
    harvested_plant_count: int = Field(ge=1, le=1000)
    variety: str = Field(default="unknown", min_length=1, max_length=80)
    field_code: str = Field(default="", max_length=120)
    latitude: Optional[float] = Field(default=None, ge=-90, le=90)
    longitude: Optional[float] = Field(default=None, ge=-180, le=180)
    root_volume_cm3_per_plant: Optional[float] = Field(default=None, ge=200, le=20000)
    season: str = Field(default="", max_length=80)
    root_images: list[str] = Field(default_factory=list, max_length=40)
    notes: str = Field(default="", max_length=1000)


class RootWeightIn(BaseModel):
    volume_cm3_per_plant: float = Field(ge=200, le=20000)
    plant_count: int = Field(default=1, ge=1, le=1000)


class ReconstructionIn(BaseModel):
    set_id: str = Field(min_length=32, max_length=32)
    reference_span_cm: float = Field(ge=5, le=300)


@router.post("/root-size")
async def root_size_from_image(
    file: UploadFile = File(...),
    view: str = Form("side"),
    _user: User = Depends(get_current_user),
):
    """Estimate DIRT root geometry from an excavated-root reference image."""
    data = await file.read(MAX_IMAGE_UPLOAD_BYTES + 1)
    _validate_image(data, file.content_type)
    try:
        return predict_root_size(data, view)
    except ValueError as exc:
        raise HTTPException(422, str(exc))
    except RuntimeError as exc:
        raise HTTPException(503, str(exc))


@router.post("/root-weight")
def root_weight_from_volume(payload: RootWeightIn, _user: User = Depends(get_current_user)):
    """Estimate fresh-root weight from measured 3-D root volume."""
    try:
        return predict_from_volume(payload.volume_cm3_per_plant, payload.plant_count)
    except ValueError as exc:
        raise HTTPException(422, str(exc))
    except RuntimeError as exc:
        raise HTTPException(503, str(exc))


@router.post("/root-image-sets", status_code=201)
async def save_root_image_set(
    files: list[UploadFile] = File(...),
    _user: User = Depends(get_current_user),
):
    """Store a multi-view excavated-root capture set for paired field labels."""
    if not 3 <= len(files) <= 40:
        raise HTTPException(422, "upload 3-40 views of the same excavated root crown")
    set_id = uuid.uuid4().hex
    target = UPLOAD_DIR / "root_sets" / set_id
    target.mkdir(parents=True, exist_ok=False)
    saved = []
    try:
        for index, upload in enumerate(files):
            data = await upload.read(MAX_IMAGE_UPLOAD_BYTES + 1)
            _validate_image(data, upload.content_type)
            suffix = Path(upload.filename or "root.jpg").suffix.lower()
            if suffix not in {".jpg", ".jpeg", ".png", ".webp"}:
                suffix = ".jpg"
            name = f"view_{index + 1:02d}{suffix}"
            (target / name).write_bytes(data)
            saved.append(f"uploads/root_sets/{set_id}/{name}")
    except Exception:
        for path in target.glob("*"):
            path.unlink(missing_ok=True)
        target.rmdir()
        raise
    return {
        "set_id": set_id,
        "images": saved,
        "view_count": len(saved),
        "reconstruction_ready": len(saved) >= 12,
        "guidance": "Use 20-30 overlapping views around the full crown with a scale marker for reliable photogrammetry.",
    }


@router.post("/root-video-sets", status_code=201)
async def save_root_video_set(
    file: UploadFile = File(...),
    _user: User = Depends(get_current_user),
):
    """Convert a short orbit video into a quality-filtered root image set."""
    allowed = {"video/mp4", "video/quicktime", "video/webm", "video/x-m4v"}
    if file.content_type and file.content_type.lower() not in allowed:
        raise HTTPException(415, "supported video formats: MP4, MOV, M4V and WebM")
    data = await file.read(_MAX_ROOT_VIDEO_BYTES + 1)
    if len(data) > _MAX_ROOT_VIDEO_BYTES:
        raise HTTPException(413, "video exceeds the 250 MB limit")
    set_id = uuid.uuid4().hex
    target = UPLOAD_DIR / "root_sets" / set_id
    target.mkdir(parents=True, exist_ok=False)
    suffix = Path(file.filename or "capture.mp4").suffix.lower()
    if suffix not in {".mp4", ".mov", ".m4v", ".webm"}:
        suffix = ".mp4"
    video_path = target / f"source{suffix}"
    video_path.write_bytes(data)
    try:
        quality = video_frames.extract(video_path, target)
    except (ValueError, RuntimeError) as exc:
        shutil.rmtree(target, ignore_errors=True)
        raise HTTPException(422, str(exc))
    video_path.unlink(missing_ok=True)
    images = [f"uploads/root_sets/{set_id}/{path.name}" for path in sorted(target.glob("view_*.jpg"))]
    return {"set_id": set_id, "images": images, "view_count": len(images), "reconstruction_ready": len(images) >= 12, "quality": quality}


@router.get("/reconstruction/runtime")
def reconstruction_runtime(_user: User = Depends(get_current_user)):
    return photogrammetry.runtime_status()


@router.post("/reconstruction", status_code=202)
def start_reconstruction(payload: ReconstructionIn, _user: User = Depends(get_current_user)):
    try:
        return photogrammetry.start(payload.set_id, payload.reference_span_cm)
    except ValueError as exc:
        raise HTTPException(422, str(exc))
    except RuntimeError as exc:
        raise HTTPException(503, str(exc))


@router.get("/reconstruction/{job_id}")
def reconstruction_status(job_id: str, _user: User = Depends(get_current_user)):
    try:
        return photogrammetry.get(job_id)
    except KeyError:
        raise HTTPException(404, "reconstruction job not found")


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
            # Some phones/cameras store a normal first JPEG frame inside an MPO
            # container while keeping the .jpg extension. Pillow reports these as
            # ``MPO``; accepting the verified first frame lets real field photos
            # work without weakening the MIME or decompression-bomb checks above.
            if image.format not in {"JPEG", "MPO", "PNG", "WEBP"}:
                raise HTTPException(415, "Only JPEG, PNG, and WebP images are supported")
    except HTTPException:
        raise
    except (Image.DecompressionBombError, Image.DecompressionBombWarning):
        raise HTTPException(413, "Image dimensions exceed the safety limit")
    except (UnidentifiedImageError, OSError, ValueError):
        raise HTTPException(422, "Could not decode a valid image")


def _save_image_and_heatmap(
    image_bytes: bytes, result: dict, filename: str, user_id: int
) -> tuple:
    """Persist the uploaded image + generated heatmap to disk (uploads/, uploads/heatmaps/)
    so history can retrieve them later. Returns (image_path, heatmap_path), either "" if
    not applicable (e.g. CSV predictions have no image/heatmap)."""
    uid = uuid.uuid4().hex
    ext = Path(filename or "upload.jpg").suffix.lower() or ".jpg"
    if ext not in (".jpg", ".jpeg", ".png", ".webp"):
        ext = ".jpg"

    # Keep each account's artifacts in its own directory. Authorization still
    # comes from the Prediction.user_id check and short-lived signed URLs; this
    # layout adds filesystem-level separation and makes account export/deletion
    # straightforward without relying on opaque filenames alone.
    owner_dir = UPLOAD_DIR / "users" / str(user_id)
    owner_heatmap_dir = owner_dir / "heatmaps"
    owner_heatmap_dir.mkdir(parents=True, exist_ok=True)

    image_path = ""
    if image_bytes:
        dest = owner_dir / f"{uid}{ext}"
        dest.write_bytes(image_bytes)
        image_path = f"uploads/users/{user_id}/{dest.name}"

    heatmap_path = ""
    heatmap_data_url = result.get("heatmap")
    if heatmap_data_url and heatmap_data_url.startswith("data:image/png;base64,"):
        png_bytes = base64.b64decode(heatmap_data_url.split(",", 1)[1])
        dest = owner_heatmap_dir / f"{uid}.png"
        dest.write_bytes(png_bytes)
        heatmap_path = f"uploads/users/{user_id}/heatmaps/{dest.name}"

    return image_path, heatmap_path


def _persist(db: Session, result: dict, user_id, field_id, filename: str,
            image_bytes: bytes = b""):
    image_path, heatmap_path = _save_image_and_heatmap(
        image_bytes, result, filename, int(user_id)
    )
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
    try:
        db.add(p); db.commit(); db.refresh(p)
    except Exception:
        db.rollback()
        for value in (image_path, heatmap_path):
            if value:
                (UPLOAD_DIR.parent / value).unlink(missing_ok=True)
        raise

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


def _aggregate_image_results(results: list[dict], sources: list[str]) -> dict:
    """Fuse multiple independently inferred views without inventing new evidence."""
    if not results or len(results) != len(sources):
        raise ValueError("results and sources must be non-empty and aligned")
    class_keys = list(results[0]["probs"])
    weights = [_SOURCE_WEIGHTS.get(source, 0.6) for source in sources]
    total_weight = sum(weights)
    probabilities = {
        key: sum(weight * float(result["probs"].get(key, 0.0))
                 for result, weight in zip(results, weights)) / total_weight
        for key in class_keys
    }
    probability_total = sum(probabilities.values()) or 1.0
    probabilities = {key: value / probability_total for key, value in probabilities.items()}
    ranked = sorted(probabilities.items(), key=lambda item: -item[1])
    label_lookup = {
        item["key"]: {"en": item["en"], "th": item["th"]}
        for result in results for item in result["top3"]
    }
    top_key, top_confidence = ranked[0]
    representative = max(
        (result for result in results if result["top_class"] == top_key),
        key=lambda result: result["confidence"],
        default=max(results, key=lambda result: result["confidence"]),
    )
    output = dict(representative)
    view_classes = [result["top_class"] for result in results]
    agreement = sum(key == top_key for key in view_classes) / len(view_classes)
    review_reasons = list(dict.fromkeys(
        reason for result in results for reason in result.get("review_reasons", [])
    ))
    if agreement < 1.0:
        review_reasons.append("multi_view_disagreement")
    output.update({
        "source": "multi_view",
        "top_class": top_key,
        "confidence": round(top_confidence, 4),
        "top3": [
            {"key": key, **label_lookup.get(key, {"en": key, "th": key}),
             "confidence": round(value, 4)}
            for key, value in ranked[:3]
        ],
        "probs": {key: round(value, 4) for key, value in probabilities.items()},
        "requires_review": bool(review_reasons),
        "review_reasons": review_reasons,
        "multi_view": {
            "image_count": len(results),
            "sources": sources,
            "agreement": round(agreement, 4),
            "per_view": [
                {
                    "source": source,
                    "top_class": result["top_class"],
                    "confidence": result["confidence"],
                    "quality": result.get("quality"),
                }
                for source, result in zip(sources, results)
            ],
            "fusion": "weighted arithmetic mean of calibrated class probabilities",
            "weights": {source: _SOURCE_WEIGHTS[source] for source in dict.fromkeys(sources)},
        },
        "inference_ms": round(sum(float(result.get("inference_ms", 0)) for result in results), 2),
    })
    health_values = [(result.get("health_score") or {}).get("score") for result in results]
    health_values = [float(value) for value in health_values if value is not None]
    if health_values and output.get("health_score"):
        output["health_score"] = dict(output["health_score"])
        output["health_score"]["score"] = round(sum(health_values) / len(health_values))
        output["health_score"]["note_en"] = "Multi-view estimate; not a measured whole-plant score"
        output["health_score"]["note_th"] = "ค่าประมาณจากหลายมุม ไม่ใช่คะแนนที่วัดจริงทั้งต้น"
    return output


@router.post("/image")
async def predict_image(
    file: UploadFile = File(...),
    source: str = Form("leaf"),
    field_id: int = Form(None),
    client_observed_at: Optional[str] = Form(None),
    client_timestamp_kind: Optional[str] = Form(None),
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
    result["capture_context"] = analyze_capture_time(data, client_observed_at, field, client_timestamp_kind)
    filename = _safe_filename(file.filename, "upload.jpg")
    pid = _persist(db, result, user.id, field.id if field else None, filename, image_bytes=data)
    result["prediction_id"] = pid
    return result


@router.post("/images")
async def predict_images(
    files: list[UploadFile] = File(...),
    sources: list[str] = Form(...),
    field_id: int = Form(None),
    client_observed_at: Optional[str] = Form(None),
    client_timestamp_kind: Optional[str] = Form(None),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Analyze 2-4 leaf/plant/canopy views and fuse calibrated probabilities."""
    if not 2 <= len(files) <= _MAX_EVIDENCE_IMAGES:
        raise HTTPException(422, f"Upload 2-{_MAX_EVIDENCE_IMAGES} images")
    if len(sources) != len(files):
        raise HTTPException(422, "Each image requires one aligned source value")
    normalized_sources = [source if source in _SOURCE_WEIGHTS else "leaf" for source in sources]
    field = get_field(db, field_id, user) if field_id else None
    payloads: list[tuple[bytes, str]] = []
    results = []
    for upload, source in zip(files, normalized_sources):
        data = await upload.read(MAX_IMAGE_UPLOAD_BYTES + 1)
        if not data:
            raise HTTPException(400, "Empty file")
        _validate_image(data, upload.content_type)
        try:
            results.append(ai_engine.predict_image(data, source=source, field=field))
        except ai_engine.ModelUnavailableError as error:
            raise HTTPException(503, f"AI model unavailable: {error}") from error
        except Exception as error:
            raise HTTPException(422, f"Could not process image: {error}") from error
        payloads.append((data, _safe_filename(upload.filename, "upload.jpg")))
    result = _aggregate_image_results(results, normalized_sources)
    first_data, first_name = payloads[0]
    result["capture_context"] = analyze_capture_time(first_data, client_observed_at, field, client_timestamp_kind)
    result["prediction_id"] = _persist(
        db, result, user.id, field.id if field else None,
        f"multi-view-{first_name}", image_bytes=first_data,
    )
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
    from backend.services.feature_extraction import ML_CLASS_ORDER
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
        if item["key"] in ML_CLASS_ORDER
    ]


@router.post("/yield-estimate")
def yield_estimate(
    payload: YieldEstimateIn,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Return a conservative yield scenario linked to a persisted diagnosis."""
    prediction = get_prediction(db, payload.prediction_id, user)
    result = estimate_yield(YieldInputs(
        age_months=payload.age_months,
        height_cm=payload.height_cm,
        stem_count=payload.stem_count,
        disease_class=prediction.top_class,
        disease_confidence=float(prediction.confidence or 0.0),
    ))
    result["prediction_id"] = prediction.id
    return result


@router.post("/harvest-measurements", status_code=201)
def save_harvest_measurement(
    payload: HarvestMeasurementIn,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Store a verified destructive-harvest label for future yield-model training."""
    prediction = get_prediction(db, payload.prediction_id, user)
    existing = (db.query(HarvestMeasurement)
                .filter(HarvestMeasurement.prediction_id == prediction.id).first())
    if existing:
        raise HTTPException(409, "A harvest measurement already exists for this prediction")
    per_plant = payload.total_fresh_root_weight_kg / payload.harvested_plant_count
    if not 0.02 <= per_plant <= 40:
        raise HTTPException(422, "Measured weight per plant is outside the plausible 0.02-40 kg range")
    row = HarvestMeasurement(
        total_fresh_root_weight_kg=payload.total_fresh_root_weight_kg,
        harvested_plant_count=payload.harvested_plant_count,
        weight_kg_per_plant=per_plant,
        age_months=payload.age_months,
        height_cm=payload.height_cm,
        stem_count=payload.stem_count,
        variety=payload.variety.strip(),
        field_code=payload.field_code.strip(),
        latitude=payload.latitude,
        longitude=payload.longitude,
        root_volume_cm3_per_plant=payload.root_volume_cm3_per_plant,
        season=payload.season.strip(),
        root_images_json=json.dumps(payload.root_images),
        notes=payload.notes.strip(),
        prediction_id=prediction.id,
        user_id=user.id,
    )
    db.add(row); db.commit(); db.refresh(row)
    return {
        "id": row.id,
        "prediction_id": row.prediction_id,
        "weight_kg_per_plant": round(row.weight_kg_per_plant, 3),
        "label_status": "verified_user_measurement",
        "eligible_for_training_review": True,
    }


@router.get("/context/{prediction_id}")
def prediction_context(
    prediction_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Load field evidence after image inference has already returned."""
    prediction = get_prediction(db, prediction_id, user)
    if prediction.field_id is None:
        raise HTTPException(400, "Prediction is not linked to a field")
    field = get_field(db, prediction.field_id, user)
    from backend.services.multimodal_analysis import build as build_multimodal_analysis

    image_result = {
        "top_class": prediction.top_class,
        "confidence": prediction.confidence,
        "symptoms": json.loads(prediction.symptoms_json or "[]"),
        "model": {"id": prediction.model_id},
    }
    return build_multimodal_analysis(field, image_result)
