"""Root-image phenotyping model shared by training and inference."""
from __future__ import annotations

import io
from pathlib import Path

import joblib
import numpy as np
from PIL import Image, ImageOps


MODEL_DIR = Path(__file__).resolve().parents[1] / "ml_models"
ARTIFACT = MODEL_DIR / "root_size_regressor.joblib"


def extract_features(image_or_bytes) -> np.ndarray:
    """Extract scale-aware foreground geometry from a DIRT-style root image."""
    source = io.BytesIO(image_or_bytes) if isinstance(image_or_bytes, bytes) else image_or_bytes
    with Image.open(source) as opened:
        image = ImageOps.exif_transpose(opened).convert("RGB")
        image.thumbnail((640, 640))
        rgb = np.asarray(image, dtype=np.float32) / 255.0
    gray = rgb.mean(axis=2)
    # Roots and the white calibration disk are much brighter than the black cloth.
    foreground = gray > max(0.12, float(np.quantile(gray, 0.70)) * 0.48)
    ys, xs = np.nonzero(foreground)
    if len(xs) < 500:
        raise ValueError("root foreground could not be detected; use a dark plain background")
    height, width = foreground.shape
    bbox_w = (xs.max() - xs.min() + 1) / width
    bbox_h = (ys.max() - ys.min() + 1) / height
    area = foreground.mean()
    row_span = np.count_nonzero(foreground, axis=1)
    col_span = np.count_nonzero(foreground, axis=0)
    brightness = gray[foreground]
    return np.asarray([
        area, bbox_w, bbox_h, bbox_w / max(bbox_h, 1e-6),
        np.percentile(row_span, 50) / width, np.percentile(row_span, 90) / width,
        np.percentile(col_span, 50) / height, np.percentile(col_span, 90) / height,
        brightness.mean(), brightness.std(),
    ], dtype=np.float64)


def predict(image_bytes: bytes, view: str) -> dict:
    view = view.lower().strip()
    if view not in {"side", "top"}:
        raise ValueError("view must be side or top")
    if not ARTIFACT.is_file():
        raise RuntimeError("root size ML artifact is not installed")
    artifact = joblib.load(ARTIFACT)
    values = artifact["models"][view].predict(extract_features(image_bytes).reshape(1, -1))[0]
    names = artifact["targets"][view]
    scores = artifact["evaluation"][view]["r2"]
    result = {
        name: round(max(0.0, float(value)), 2)
        for name, value, score in zip(names, values, scores)
        if float(score) >= 0.50
    }
    withheld = [name for name, score in zip(names, scores) if float(score) < 0.50]
    return {
        "view": view,
        "measurements": result,
        "model_id": artifact["model_id"],
        "evaluation": artifact["evaluation"][view],
        "withheld_measurements": withheld,
        "training_samples": artifact["counts"][view],
        "source_doi": "10.25739/ej8x-3b24",
        "scope": "excavated_root_image_on_dark_background_with_2_inch_reference",
        "weight_supported": False,
    }
