"""Model registry / system status routes."""
import datetime as dt
import os

from fastapi import APIRouter, Depends

from backend.config import (
    AI_FIELD_VALIDATED,
    AI_SERVING_MODE,
    ACTIVE_MODEL,
    BASE_DIR,
    CLASSES,
    MODEL_REGISTRY,
    USE_CNN,
)
from backend.core.security import get_current_user
from backend.database import SessionLocal
from backend.models import Prediction, User
from backend.services.cnn_classifier import get_cnn_metrics, get_cnn_session
from backend.services.brown_spot_classifier import (
    get_brown_spot_classifier,
    get_brown_spot_metrics,
)
from backend.services.fusion_classifier import (
    get_fusion_metadata,
    verify_all_fusion_classifiers,
)
from backend.services.ml_classifier import get_metrics, verify_all_classifiers
from backend.services.model_readiness import class_readiness, readiness_summary
from backend.services.white_leaf_spot_classifier import (
    get_white_leaf_spot_classifier,
    get_white_leaf_spot_metrics,
)
from backend.services.whitefly_detector import (
    get_whitefly_metrics,
    get_whitefly_session,
)

router = APIRouter(prefix="/api/models", tags=["models"])

_START = dt.datetime.now(dt.UTC)


def _cnn_entry():
    if not USE_CNN or get_cnn_session() is None:
        return None
    meta = get_cnn_metrics()
    test = meta["test"]
    test_evaluated = test.get("evaluated") is not False
    evaluation = test if test_evaluated else meta["validation_operating_point"]
    per_class = list(test.get("per_class", {}).values())
    precision = (
        sum(row["precision"] for row in per_class) / len(per_class)
        if per_class else None
    )
    recall = (
        sum(row["recall"] for row in per_class) / len(per_class)
        if per_class else None
    )
    model_path = BASE_DIR / "backend" / "ml_models" / "cnn_efficientnet_b0.onnx"
    return {
        "id": meta["model_id"],
        "name": "EfficientNet-B0 CNN",
        "version": meta["trained_at"][:10],
        "task": "raw-pixel leaf classification (healthy/cbb/cbsd/cmd/cgm)",
        "classes": len(meta["classes"]),
        "accuracy": test["accuracy"],
        "f1": test["macro_f1"],
        "precision": round(precision, 6) if precision is not None else None,
        "recall": round(recall, 6) if recall is not None else None,
        "params_m": None,
        "size_mb": round(model_path.stat().st_size / 1e6, 2),
        "avg_inference_ms": None,
        "active": True,
        "trained_on": "Official TFDS Cassava train/validation/test splits",
    }


def _brown_spot_entry():
    classifier = get_brown_spot_classifier()
    if classifier is None:
        return None
    meta = get_brown_spot_metrics()
    per_class = list(meta["test"]["per_class"].values())
    model_path = BASE_DIR / "backend" / "ml_models" / meta["artifact"]["file"]
    return {
        "id": meta["model_id"],
        "name": "Brown Leaf Spot Auxiliary",
        "version": meta["trained_at"][:10],
        "task": "auxiliary binary classification (other/brown_leaf_spot)",
        "classes": 2,
        "accuracy": meta["test"]["accuracy"],
        "f1": meta["test"]["macro_f1"],
        "precision": round(
            sum(row["precision"] for row in per_class) / len(per_class), 6
        ),
        "recall": meta["test"]["balanced_accuracy"],
        "params_m": None,
        "size_mb": round(model_path.stat().st_size / 1e6, 2),
        "avg_inference_ms": None,
        "active": True,
        "role": "auxiliary_active",
        "trained_on": (
            f"CCMT raw Cassava — {meta['dataset']['counts']['train']} train / "
            f"{meta['dataset']['counts']['validation']} val / "
            f"{meta['dataset']['counts']['test']} test images"
        ),
    }


def _white_leaf_spot_entry():
    classifier = get_white_leaf_spot_classifier()
    if classifier is None:
        return None
    meta = get_white_leaf_spot_metrics()
    per_class = list(meta["test"]["per_class"].values())
    model_path = BASE_DIR / "backend" / "ml_models" / meta["artifact"]["file"]
    return {
        "id": meta["model_id"],
        "name": "White Leaf Spot Auxiliary",
        "version": meta["trained_at"][:10],
        "task": "experimental auxiliary binary classification",
        "classes": 2,
        "accuracy": meta["test"]["accuracy"],
        "f1": meta["test"]["macro_f1"],
        "precision": round(
            sum(row["precision"] for row in per_class) / len(per_class), 6
        ),
        "recall": meta["test"]["balanced_accuracy"],
        "params_m": None,
        "size_mb": round(model_path.stat().st_size / 1e6, 2),
        "avg_inference_ms": None,
        "active": False,
        "experimental": True,
        "serving_eligible": False,
        "runtime_enabled": True,
        "role": "review_only_auxiliary",
        "trained_on": (
            f"Embrapa PDDB positives + CCMT negatives — "
            f"{meta['dataset']['counts']['train']} train / "
            f"{meta['dataset']['counts']['validation']} val / "
            f"{meta['dataset']['counts']['test']} test images"
        ),
        "note": meta["dataset"]["limitation"],
    }


def _whitefly_entry():
    session = get_whitefly_session()
    if session is None:
        return None
    meta = get_whitefly_metrics()
    test = meta["test"]
    test_evaluated = test.get("evaluated") is not False
    evaluation = test if test_evaluated else meta["validation_operating_point"]
    detection_metrics = test if test_evaluated else meta["validation"]
    model_path = BASE_DIR / "backend" / "ml_models" / meta["artifacts"]["onnx"]["file"]
    return {
        "id": meta["model_id"],
        "name": "Cassava Whitefly Detector",
        "version": meta["trained_at"][:10],
        "task": "experimental object detection and counting",
        "classes": 1,
        "accuracy": None,
        "f1": evaluation.get("f1"),
        "map50": detection_metrics.get("metrics/mAP50(B)"),
        "map50_95": detection_metrics.get("metrics/mAP50-95(B)"),
        "precision": evaluation.get("metrics/precision(B)", evaluation.get("precision")),
        "recall": evaluation.get("metrics/recall(B)", evaluation.get("recall")),
        "evaluation_set": "test" if test_evaluated else "validation",
        "params_m": None,
        "size_mb": round(model_path.stat().st_size / 1e6, 2),
        "avg_inference_ms": None,
        "active": False,
        "experimental": True,
        "serving_eligible": False,
        "runtime_enabled": True,
        "role": "review_only_object_detector",
        "evaluation_warning": meta.get("evaluation_warning"),
        "trained_on": (
            f"Mendeley Cassava Whitefly Dataset v3 — "
            f"{meta['dataset']['images']} real boxed images"
        ),
        "note": (
            "Review-only detector selected on whole acquisition-run validation. "
            "The sealed test is not reported when the validation gate has not passed."
        ),
    }


def _fusion_entries():
    """Expose every executable fusion artifact, clearly marked non-serving."""
    meta = get_fusion_metadata()
    if meta is None:
        return []
    output = []
    for model_id, metrics in meta.get("fusion", {}).items():
        record = meta.get("artifacts", {}).get(model_id, {})
        model_path = BASE_DIR / "backend" / "ml_models" / record.get(
            "file", f"fusion_{model_id}.joblib"
        )
        output.append({
            "id": f"fusion_{model_id}",
            "name": f"Fusion {metrics['name']}",
            "version": meta["trained_at"][:10],
            "task": "experimental image + satellite + soil five-way classification",
            "classes": len(meta["classes"]),
            "accuracy": metrics["accuracy"],
            "f1": metrics["f1"],
            "precision": metrics["precision"],
            "recall": metrics["recall"],
            "params_m": None,
            "size_mb": (
                round(model_path.stat().st_size / 1e6, 2)
                if model_path.is_file() else None
            ),
            "avg_inference_ms": None,
            "active": False,
            "selected_experimental": model_id == meta["active_model_id"],
            "experimental": True,
            "serving_eligible": False,
            "role": "experimental_disabled",
            "trained_on": meta["dataset"]["source"],
            "note": meta["caveat"],
        })
    return output


def _runtime_registry():
    cnn = _cnn_entry()
    brown = _brown_spot_entry()
    white = _white_leaf_spot_entry()
    whitefly = _whitefly_entry()
    fusion = _fusion_entries()
    if cnn is None:
        models = [
            *([brown] if brown else []),
            *([white] if white else []),
            *([whitefly] if whitefly else []),
            *MODEL_REGISTRY,
            *fusion,
        ]
        return models, ACTIVE_MODEL
    classical = [{**model, "active": False} for model in MODEL_REGISTRY]
    return [
        cnn,
        *([brown] if brown else []),
        *([white] if white else []),
        *([whitefly] if whitefly else []),
        *classical,
        *fusion,
    ], cnn


@router.get("")
def registry():
    models, active_model = _runtime_registry()
    return {
        "active": active_model["id"],
        "models": models,
        "classes": CLASSES,
        "class_readiness": class_readiness(),
        "readiness_summary": readiness_summary(),
    }


@router.get("/active")
def active():
    return _runtime_registry()[1]


@router.get("/compare")
def compare():
    models, _active_model = _runtime_registry()
    keys = ["accuracy", "f1", "precision", "recall", "params_m", "size_mb", "avg_inference_ms"]
    return {"metrics": keys,
            "models": [{"id": m["id"], "name": m["name"], **{k: m[k] for k in keys}}
                       for m in models]}


@router.get("/readiness")
def readiness():
    return {
        "summary": readiness_summary(),
        "classes": class_readiness(),
    }


@router.get("/self-test")
def self_test(_user: User = Depends(get_current_user)):
    classical = verify_all_classifiers()
    # These two standby estimators exceed GitHub's 100 MB per-file limit and are
    # deliberately omitted from the Render bundle. Their active compact peers are
    # still hash-verified; omit only the expected missing-file rows, not corrupt files.
    classical = [
        row for row in classical
        if not (
            row.get("id") == "extra_trees"
            and row.get("status") == "unavailable"
            and "No such file or directory" in row.get("error", "")
        )
    ]
    cnn_ready = get_cnn_session() is not None
    cnn_meta = get_cnn_metrics() if cnn_ready else None
    cnn = {
        "id": cnn_meta["model_id"] if cnn_meta else "cnn_efficientnet_b0",
        "status": "ready" if cnn_ready else "unavailable",
        "active": bool(cnn_ready and USE_CNN),
        "classes": list(cnn_meta["classes"]) if cnn_meta else [],
        "output_shape": [None, len(cnn_meta["classes"])] if cnn_meta else None,
    }
    brown_classifier = get_brown_spot_classifier()
    brown_meta = get_brown_spot_metrics() if brown_classifier is not None else None
    brown = {
        "id": brown_meta["model_id"] if brown_meta else "brown_leaf_spot_auxiliary",
        "status": "ready" if brown_classifier is not None else "unavailable",
        "active": bool(brown_classifier is not None),
        "classes": list(brown_meta["classes"]) if brown_meta else [],
        "output_shape": [None, 2] if brown_meta else None,
        "task": "auxiliary_binary_classification",
    }
    white_classifier = get_white_leaf_spot_classifier()
    white_meta = (
        get_white_leaf_spot_metrics() if white_classifier is not None else None
    )
    white = {
        "id": (
            white_meta["model_id"]
            if white_meta else "white_leaf_spot_auxiliary"
        ),
        "status": "ready" if white_classifier is not None else "unavailable",
        "active": False,
        "experimental": True,
        "serving_eligible": False,
        "classes": list(white_meta["classes"]) if white_meta else [],
        "output_shape": [None, 2] if white_meta else None,
        "task": "auxiliary_binary_classification",
    }
    whitefly_session = get_whitefly_session()
    whitefly_meta = (
        get_whitefly_metrics() if whitefly_session is not None else None
    )
    whitefly = {
        "id": (
            whitefly_meta["model_id"]
            if whitefly_meta else "whitefly_detector"
        ),
        "status": "ready" if whitefly_session is not None else "unavailable",
        "active": False,
        "experimental": True,
        "serving_eligible": False,
        "classes": list(whitefly_meta["classes"]) if whitefly_meta else [],
        "output_shape": (
            [None, int(whitefly_meta["input"]["max_detections"]), 6]
            if whitefly_meta else None
        ),
        "evaluation_warning": (
            whitefly_meta.get("evaluation_warning") if whitefly_meta else None
        ),
        "task": "object_detection_and_counting",
    }
    fusion = verify_all_fusion_classifiers()
    fusion = [
        row for row in fusion
        if not (
            row.get("id") == "fusion_extra_trees"
            and row.get("status") == "unavailable"
            and "No such file or directory" in row.get("error", "")
        )
    ]
    models = [
        cnn,
        brown,
        *([white] if white_meta else []),
        *([whitefly] if whitefly_meta else []),
        *classical,
        *fusion,
    ]
    return {
        "status": "ok" if all(row["status"] == "ready" for row in models) else "degraded",
        "models": models,
        "ready_models": sum(row["status"] == "ready" for row in models),
        "total_models": len(models),
        "class_readiness": readiness_summary(),
    }


@router.get("/system")
def system_status(_user: User = Depends(get_current_user)):
    try:
        load1, load5, load15 = os.getloadavg()
    except OSError:
        load1 = load5 = load15 = 0.0
    uptime = (dt.datetime.now(dt.UTC) - _START).total_seconds()

    # Real average inference latency measured from actual served predictions
    # (ai_engine.py records true wall-clock time per request, no padding) — not a
    # fixed claim, so if there's no traffic yet we honestly report null.
    db = SessionLocal()
    try:
        recent = (db.query(Prediction.inference_ms)
                  .filter(Prediction.source != "csv")
                  .order_by(Prediction.created_at.desc()).limit(50).all())
    finally:
        db.close()
    times = [r[0] for r in recent if r[0]]
    avg_ms = round(sum(times) / len(times), 1) if times else None

    cnn_meta = get_cnn_metrics() if USE_CNN and get_cnn_session() is not None else None
    brown_meta = (
        get_brown_spot_metrics()
        if get_brown_spot_classifier() is not None
        else None
    )
    classical_meta = get_metrics()
    meta = cnn_meta or classical_meta
    if meta:
        trained_classes = len(meta["classes"])
        display_classes = len(CLASSES)
        if cnn_meta:
            split_counts = cnn_meta["dataset"]["effective_split_counts"]
            source = cnn_meta["dataset"]["source"]
        else:
            split_counts = {
                "train": classical_meta["dataset"]["train"],
                "validation": classical_meta["dataset"]["val"],
                "test": classical_meta["dataset"]["test"],
            }
            source = classical_meta["dataset"]["source"]
        auxiliary_counts = (
            brown_meta["dataset"]["counts"]
            if brown_meta is not None
            else {"train": 0, "validation": 0, "test": 0}
        )
        auxiliary_classes = int(brown_meta is not None)
        dataset = {"train": split_counts["train"] + auxiliary_counts["train"],
                   "val": split_counts["validation"] + auxiliary_counts["validation"],
                   "test": split_counts["test"] + auxiliary_counts["test"],
                   "classes": trained_classes + auxiliary_classes,
                   "primary_classes": trained_classes,
                   "auxiliary_classes": auxiliary_classes,
                   "display_classes": display_classes,
                   "heuristic_classes": 0,
                   "reference_only_classes": display_classes - trained_classes - auxiliary_classes,
                   "source": (
                       f"{source} + CCMT auxiliary"
                       if brown_meta is not None else source
                   ),
                   "note": (
                       "5 primary photo classes plus 1 independent Brown Leaf Spot "
                       "auxiliary head; 7 conditions have no serving artifact"
                       if brown_meta is not None else
                       "5 trained photo classes; 8 additional conditions have no serving artifact"
                   ),
                   "field_validated": AI_FIELD_VALIDATED}
    else:
        dataset = {"train": 0, "val": 0, "test": 0, "classes": 0,
                   "display_classes": len(CLASSES),
                   "heuristic_classes": 0,
                   "reference_only_classes": len(CLASSES),
                   "field_validated": False,
                   "source": "not trained yet"}

    return {
        "server": {"status": "online", "uptime_s": round(uptime, 1),
                   "load_1m": round(load1, 2), "load_5m": round(load5, 2),
                   "python": os.sys.version.split()[0],
                   "ai_serving_mode": AI_SERVING_MODE},
        "gpu": {
            "available": False,
            "device": "CPU inference",
            "backend": (
                "ONNX Runtime · EfficientNet-B0 raw-pixel CNN"
                if cnn_meta
                else "scikit-learn (trained) + PIL/NumPy feature extraction"
            ),
        },
        "inference": {"avg_ms": avg_ms, "n_samples": len(times),
                      "throughput_img_s": round(1000 / avg_ms, 1) if avg_ms else None},
        "dataset": dataset,
    }
