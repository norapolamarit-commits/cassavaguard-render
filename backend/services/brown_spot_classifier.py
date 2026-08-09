"""Verified runtime loader for the auxiliary Brown Leaf Spot classifier."""
from __future__ import annotations

import json
import threading

import joblib
import numpy as np

from backend.config import AI_SERVING_MODE, BASE_DIR, IS_PRODUCTION
from backend.services.cnn_classifier import get_cnn_metrics
from backend.services.feature_extraction import FEATURE_NAMES, ML_CLASS_ORDER, feature_vector
from backend.services.model_contract import file_sha256

MODEL_DIR = BASE_DIR / "backend" / "ml_models"
METRICS_PATH = MODEL_DIR / "brown_leaf_spot_metrics.json"
FEATURE_ORDER = FEATURE_NAMES + [f"cnn_prob_{name}" for name in ML_CLASS_ORDER]

_classifier = None
_metrics = None
_loaded = False
_access_lock = threading.RLock()


def _load() -> None:
    global _classifier, _metrics, _loaded
    if _loaded:
        return
    _loaded = True
    try:
        metadata = json.loads(METRICS_PATH.read_text(encoding="utf-8"))
        if metadata.get("classes") != ["other", "brown_leaf_spot"]:
            raise ValueError("binary class order mismatch")
        if metadata.get("feature_names") != FEATURE_ORDER:
            raise ValueError("feature order mismatch")
        selection = metadata.get("selection", {})
        if selection.get("set") != "validation" or selection.get("test_used_for_selection") is not False:
            raise ValueError("model was not selected exclusively on validation data")
        if (
            IS_PRODUCTION
            and metadata.get("production_eligible") is not True
            and AI_SERVING_MODE != "review_only"
        ):
            raise ValueError("artifact is not approved for production")

        record = metadata["artifact"]
        model_path = MODEL_DIR / record["file"]
        if file_sha256(model_path) != record["sha256"]:
            raise ValueError("artifact SHA-256 mismatch")
        cnn_metadata = get_cnn_metrics()
        if cnn_metadata is None:
            raise ValueError("required base CNN is unavailable")
        if metadata["base_cnn"]["model_id"] != cnn_metadata["model_id"]:
            raise ValueError("base CNN model id mismatch")
        if (
            metadata["base_cnn"]["artifact_sha256"]
            != cnn_metadata["artifacts"]["onnx"]["sha256"]
        ):
            raise ValueError("base CNN artifact mismatch")

        classifier = joblib.load(model_path)
        if int(getattr(classifier, "n_features_in_", -1)) != len(FEATURE_ORDER):
            raise ValueError("estimator feature count mismatch")
        if not np.array_equal(np.asarray(classifier.classes_), np.asarray([0, 1])):
            raise ValueError("estimator class encoding mismatch")
        smoke = np.asarray([[
            0.55, 0.05, 0.02, 0.01, 0.03, 0.20,
            0.08, 0.002, 0.02, 0.01, 0.65, 0.55,
            0.20, 0.20, 0.20, 0.20, 0.20,
        ]], dtype=np.float64)
        probabilities = np.asarray(classifier.predict_proba(smoke))
        if (
            probabilities.shape != (1, 2)
            or not np.isfinite(probabilities).all()
            or not np.allclose(probabilities.sum(axis=1), 1.0, atol=1e-6)
        ):
            raise ValueError("invalid probability output")

        _classifier = classifier
        _metrics = metadata
        print(
            f"[ai_engine] loaded auxiliary classifier '{metadata['model_id']}' "
            f"(held-out test macro-F1={metadata['test']['macro_f1']:.3f})"
        )
    except FileNotFoundError:
        print("[ai_engine] Brown Leaf Spot auxiliary model is not trained yet")
    except Exception as exc:  # pragma: no cover - defensive fail-closed path
        _classifier = None
        _metrics = None
        print(f"[ai_engine] failed to load Brown Leaf Spot auxiliary model: {exc}")


def get_brown_spot_classifier():
    with _access_lock:
        _load()
        return _classifier


def get_brown_spot_metrics():
    with _access_lock:
        _load()
        return _metrics


def brown_spot_predict_probability(features: dict, cnn_probabilities: dict) -> float:
    classifier = get_brown_spot_classifier()
    if classifier is None:
        raise RuntimeError("Brown Leaf Spot auxiliary model is unavailable")
    vector = feature_vector(features) + [
        float(cnn_probabilities[name]) for name in ML_CLASS_ORDER
    ]
    return float(classifier.predict_proba(np.asarray([vector], dtype=np.float64))[0, 1])
