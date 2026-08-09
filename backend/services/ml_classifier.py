"""Lazy-loads the trained scikit-learn classifier produced by
backend/training/train_classifier.py.

Returns None if no verified artifact has been produced. The API can still
start, but image inference fails closed rather than returning rule scores.
"""
import json
import threading

import joblib
import numpy as np

from backend.config import BASE_DIR
from backend.services.feature_extraction import FEATURE_NAMES, ML_CLASS_ORDER
from backend.services.model_contract import verify_sklearn_bundle

ML_MODELS_DIR = BASE_DIR / "backend" / "ml_models"
METRICS_PATH = ML_MODELS_DIR / "metrics.json"

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
        model_path = ML_MODELS_DIR / f"{active_id}.joblib"
        classifier = joblib.load(model_path)
        verify_sklearn_bundle(meta, classifier, model_path, active_id,
                              ML_CLASS_ORDER, FEATURE_NAMES)
        _classifier = classifier
        _metrics = meta
        acc = meta["models"][active_id]["accuracy"]
        print(f"[ai_engine] loaded trained classifier '{active_id}' "
              f"(held-out test accuracy={acc:.3f}, n_test={meta['dataset']['test']})")
    except FileNotFoundError:
        print("[ai_engine] no trained classifier found at "
              f"{METRICS_PATH} — run the verified `backend/training/train_all.py` "
              "pipeline to train one. "
              "Image inference will remain unavailable.")
    except Exception as e:  # pragma: no cover - defensive
        _classifier = None
        _metrics = None
        print(f"[ai_engine] failed to load trained classifier: {e} — image inference unavailable.")


def get_classifier():
    """Returns the fitted sklearn estimator, or None if not yet trained."""
    with _access_lock:
        _load()
        return _classifier


def get_metrics():
    """Returns the metrics.json dict (real measured numbers), or None if not yet trained."""
    with _access_lock:
        _load()
        return _metrics


def verify_all_classifiers() -> list[dict]:
    """Load and smoke-test every published classical model artifact.

    Normal prediction still uses only the validation-selected active model.  This
    audit proves that standby entries in the registry are executable artifacts,
    rather than names copied from metrics metadata.
    """
    try:
        meta = json.loads(METRICS_PATH.read_text(encoding="utf-8"))
    except Exception as exc:
        return [{
            "id": "classical_bundle",
            "status": "unavailable",
            "error": str(exc),
        }]

    rows = []
    # Plausible in-domain feature rows avoid exercising scaler edge cases with an
    # all-zero vector that no real RGB leaf image can produce.
    smoke_input = np.asarray([
        [0.55, 0.05, 0.02, 0.01, 0.03, 0.20, 0.08, 0.002, 0.02, 0.01, 0.65, 0.55],
        [0.20, 0.18, 0.10, 0.06, 0.04, -0.02, 0.20, 0.006, 0.08, 0.04, 0.48, 0.42],
    ], dtype=np.float64)
    for model_id, metrics in meta.get("models", {}).items():
        model_path = ML_MODELS_DIR / f"{model_id}.joblib"
        try:
            classifier = joblib.load(model_path)
            verify_sklearn_bundle(
                meta,
                classifier,
                model_path,
                model_id,
                ML_CLASS_ORDER,
                FEATURE_NAMES,
            )
            probabilities = np.asarray(classifier.predict_proba(smoke_input))
            rows.append({
                "id": model_id,
                "name": metrics["name"],
                "status": "ready",
                "active": model_id == meta["active_model_id"],
                "classes": list(ML_CLASS_ORDER),
                "output_shape": list(probabilities.shape),
                "probability_rows_sum_to_one": bool(
                    np.allclose(probabilities.sum(axis=1), 1.0, atol=1e-6)
                ),
            })
        except Exception as exc:
            rows.append({
                "id": model_id,
                "name": metrics.get("name", model_id),
                "status": "unavailable",
                "active": model_id == meta.get("active_model_id"),
                "classes": list(ML_CLASS_ORDER),
                "error": str(exc),
            })
    return rows
