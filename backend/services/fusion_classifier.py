"""Lazy-loads the trained fusion (image+satellite+soil) classifier produced by
backend/training/train_fusion_classifier.py.

Mirrors ml_classifier.py's pattern exactly, reading a separate fusion_metrics.json
+ fusion_<active>.joblib pair so this never touches or risks breaking the working
image-only model. Falls back to None if no trained fusion model exists yet — this
is a strict additive capability: ai_engine.py falls back to image-only prediction
(exactly the behaviour before fusion existed) whenever this returns None, whether
because training hasn't been run or because a given prediction has no field_id.
"""
import json
import threading

import joblib
import numpy as np

from backend.config import BASE_DIR
from backend.services.feature_extraction import FUSION_FEATURE_NAMES, ML_CLASS_ORDER
from backend.services.model_contract import verify_sklearn_bundle

ML_MODELS_DIR = BASE_DIR / "backend" / "ml_models"
METRICS_PATH = ML_MODELS_DIR / "fusion_metrics.json"

_classifier = None
_metrics = None
_loaded = False
_access_lock = threading.RLock()


def _load():
    global _classifier, _metrics, _loaded
    if _loaded:
        return
    _loaded = True
    try:
        meta = json.loads(METRICS_PATH.read_text(encoding="utf-8"))
        active_id = meta["active_model_id"]
        model_path = ML_MODELS_DIR / f"fusion_{active_id}.joblib"
        if meta.get("production_eligible") is not False:
            raise ValueError("fusion metadata must explicitly declare production_eligible=false")
        classifier = joblib.load(model_path)
        verify_sklearn_bundle(meta, classifier, model_path, active_id,
                              ML_CLASS_ORDER, FUSION_FEATURE_NAMES)
        _classifier = classifier
        _metrics = meta
        acc = meta["fusion"][active_id]["accuracy"]
        print(f"[ai_engine] loaded trained fusion classifier 'fusion_{active_id}' "
              f"(held-out test accuracy={acc:.3f}) — used when a prediction has a field_id")
    except FileNotFoundError:
        print(f"[ai_engine] no trained fusion classifier found at {METRICS_PATH} — run "
              "`python backend/training/train_all.py --include-experimental-fusion` "
              "to train one. Falling back to image-only prediction for field-linked uploads "
              "in the meantime.")
    except Exception as e:  # pragma: no cover - defensive
        _classifier = None
        _metrics = None
        print(f"[ai_engine] failed to load trained fusion classifier: {e} — falling back to image-only.")


def get_fusion_classifier():
    """Returns the fitted sklearn fusion estimator, or None if not yet trained."""
    with _access_lock:
        _load()
        return _classifier


def get_fusion_metrics():
    """Returns the fusion_metrics.json dict (real measured numbers), or None if not yet trained."""
    with _access_lock:
        _load()
        return _metrics


def get_fusion_metadata():
    """Read experimental metadata without trying to enable the serving gate."""
    try:
        meta = json.loads(METRICS_PATH.read_text(encoding="utf-8"))
        if meta.get("production_eligible") is not False:
            raise ValueError(
                "fusion metadata must explicitly declare production_eligible=false"
            )
        return meta
    except Exception:
        return None


def verify_all_fusion_classifiers() -> list[dict]:
    """Smoke-test every experimental fusion artifact while keeping serving off."""
    meta = get_fusion_metadata()
    if meta is None:
        return [{
            "id": "fusion_bundle",
            "status": "unavailable",
            "active": False,
            "experimental": True,
            "serving_eligible": False,
            "classes": list(ML_CLASS_ORDER),
            "error": "verified fusion metadata is unavailable",
        }]

    smoke_input = np.zeros((2, len(FUSION_FEATURE_NAMES)), dtype=np.float64)
    rows = []
    for model_id, metrics in meta.get("fusion", {}).items():
        model_path = ML_MODELS_DIR / f"fusion_{model_id}.joblib"
        try:
            classifier = joblib.load(model_path)
            verify_sklearn_bundle(
                meta,
                classifier,
                model_path,
                model_id,
                ML_CLASS_ORDER,
                FUSION_FEATURE_NAMES,
            )
            probabilities = np.asarray(classifier.predict_proba(smoke_input))
            rows.append({
                "id": f"fusion_{model_id}",
                "name": f"Fusion {metrics['name']}",
                "status": "ready",
                "active": False,
                "selected_experimental": model_id == meta["active_model_id"],
                "experimental": True,
                "serving_eligible": False,
                "classes": list(ML_CLASS_ORDER),
                "output_shape": list(probabilities.shape),
                "probability_rows_sum_to_one": bool(
                    np.allclose(probabilities.sum(axis=1), 1.0, atol=1e-6)
                ),
            })
        except Exception as exc:
            rows.append({
                "id": f"fusion_{model_id}",
                "name": f"Fusion {metrics.get('name', model_id)}",
                "status": "unavailable",
                "active": False,
                "selected_experimental": model_id == meta.get("active_model_id"),
                "experimental": True,
                "serving_eligible": False,
                "classes": list(ML_CLASS_ORDER),
                "error": str(exc),
            })
    return rows
