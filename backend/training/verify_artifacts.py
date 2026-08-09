"""Fail-closed verification for CassavaGuard ML artifacts and metadata."""
from __future__ import annotations

import argparse
import json
import math
import sys
from pathlib import Path

import numpy as np

REPO_ROOT = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(REPO_ROOT))

from backend.services.feature_extraction import (FEATURE_NAMES, FUSION_FEATURE_NAMES,
                                                  ML_CLASS_ORDER)
from backend.training.training_utils import sha256_file
from backend.training.training_utils import choose_active_from_validation

MODEL_DIR = REPO_ROOT / "backend" / "ml_models"


def _read_json(path: Path) -> dict:
    try:
        payload = json.loads(path.read_text(encoding="utf-8"))
    except Exception as exc:
        raise AssertionError(f"cannot read {path}: {exc}") from exc
    if not isinstance(payload, dict):
        raise AssertionError(f"{path} must contain a JSON object")
    return payload


def _verify_selection(meta: dict, name: str) -> None:
    selection = meta.get("selection")
    if not isinstance(selection, dict):
        raise AssertionError(f"{name}: missing selection audit metadata")
    if selection.get("set") != "validation" or selection.get("test_used_for_selection") is not False:
        raise AssertionError(f"{name}: active model must be selected only from validation")


def _verify_hashes(meta: dict, name: str, required_ids=None) -> list[str]:
    artifacts = meta.get("artifacts")
    if not isinstance(artifacts, dict) or not artifacts:
        raise AssertionError(f"{name}: missing artifact SHA-256 manifest")
    required_ids = set(required_ids or artifacts)
    missing_optional = []
    for artifact_id, record in artifacts.items():
        path = MODEL_DIR / record["file"]
        if not path.is_file():
            if artifact_id in required_ids:
                raise AssertionError(f"{name}/{artifact_id}: missing {path.name}")
            missing_optional.append(path.name)
            continue
        actual = sha256_file(path)
        if actual != record.get("sha256"):
            raise AssertionError(f"{name}/{artifact_id}: SHA-256 mismatch")
    return missing_optional


def _verify_scores(metrics: dict, name: str) -> None:
    for key in ("accuracy", "f1", "precision", "recall"):
        if key not in metrics:
            continue
        value = metrics[key]
        if not isinstance(value, (int, float)) or not math.isfinite(value) or not 0 <= value <= 1:
            raise AssertionError(f"{name}: invalid {key}={value!r}")


def _wilson_interval(correct: int, total: int, z: float = 1.959963984540054) -> list[float]:
    if total <= 0 or not 0 <= correct <= total:
        raise AssertionError("accuracy counts must satisfy 0 <= correct <= total and total > 0")
    proportion = correct / total
    denominator = 1.0 + z * z / total
    center = (proportion + z * z / (2.0 * total)) / denominator
    half_width = (
        z
        * math.sqrt(
            proportion * (1.0 - proportion) / total
            + z * z / (4.0 * total * total)
        )
        / denominator
    )
    return [round(center - half_width, 6), round(center + half_width, 6)]


def _verify_cnn_evaluation_contract(meta: dict) -> dict:
    """Validate real-data provenance, counts and the predeclared >75% target."""
    dataset = meta.get("dataset")
    if not isinstance(dataset, dict):
        raise AssertionError("cnn_metrics.json: missing dataset provenance")
    source = str(dataset.get("source", ""))
    if "tensorflow datasets cassava:0.1.0" not in source.lower():
        raise AssertionError("cnn_metrics.json: CNN evaluation source is not TFDS cassava:0.1.0")
    if "synthetic" in source.lower() or dataset.get("synthetic_evaluation") is True:
        raise AssertionError("cnn_metrics.json: synthetic images cannot be validation/test evidence")
    if dataset.get("split_policy") != "official TFDS train/validation/test preserved":
        raise AssertionError("cnn_metrics.json: official held-out split policy is not preserved")

    effective_counts = dataset.get("effective_split_counts")
    if not isinstance(effective_counts, dict):
        raise AssertionError("cnn_metrics.json: missing effective split counts")
    test_count = effective_counts.get("test")
    if not isinstance(test_count, int) or test_count < 1000:
        raise AssertionError("cnn_metrics.json: held-out test count is unexpectedly small")

    test = meta.get("test")
    if not isinstance(test, dict):
        raise AssertionError("cnn_metrics.json: missing held-out test metrics")
    matrix = np.asarray(test.get("confusion_matrix"))
    expected_shape = (len(ML_CLASS_ORDER), len(ML_CLASS_ORDER))
    if matrix.shape != expected_shape or not np.issubdtype(matrix.dtype, np.integer):
        raise AssertionError("cnn_metrics.json: invalid held-out confusion matrix")
    if (matrix < 0).any() or int(matrix.sum()) != test_count:
        raise AssertionError("cnn_metrics.json: confusion-matrix count differs from held-out test count")
    correct = int(np.trace(matrix))
    measured_accuracy = correct / test_count
    stored_accuracy = test.get("accuracy")
    if (
        not isinstance(stored_accuracy, (int, float))
        or not math.isfinite(stored_accuracy)
        or not math.isclose(float(stored_accuracy), measured_accuracy, abs_tol=5e-7)
    ):
        raise AssertionError("cnn_metrics.json: held-out accuracy is inconsistent with confusion matrix")

    interval = _wilson_interval(correct, test_count)
    target = 0.75
    if measured_accuracy <= target:
        raise AssertionError("cnn/test: held-out accuracy must be greater than 0.75")
    if interval[0] <= target:
        raise AssertionError("cnn/test: Wilson 95% lower bound must be greater than 0.75")

    quality_target = meta.get("quality_target")
    if quality_target is not None:
        if (
            not isinstance(quality_target, dict)
            or quality_target.get("metric") != "held_out_test_accuracy"
            or quality_target.get("operator") != ">"
            or quality_target.get("threshold") != target
            or quality_target.get("used_for_model_selection") is not False
        ):
            raise AssertionError("cnn_metrics.json: invalid predeclared quality target")

    duplicate_audit = dataset.get("duplicate_audit")
    if duplicate_audit is None:
        # Backward-compatible view of the current artifact, whose exact audit was
        # stored directly under dataset before the perceptual contract was added.
        duplicate_audit = dataset
    if not isinstance(duplicate_audit, dict):
        raise AssertionError("cnn_metrics.json: missing duplicate audit")
    if "SHA-256" not in str(duplicate_audit.get("method", "")):
        raise AssertionError("cnn_metrics.json: missing exact decoded-pixel audit")
    exact_removed = duplicate_audit.get("removed_by_split")
    if not isinstance(exact_removed, dict) or set(exact_removed) != {"train", "validation", "test"}:
        raise AssertionError("cnn_metrics.json: invalid exact duplicate removal counts")

    perceptual = duplicate_audit.get("perceptual_duplicate_audit")
    if perceptual is None:
        leakage_audit = {
            "status": "warning",
            "exact_pixel_duplicates": "quarantined",
            "perceptual_duplicates": "not recorded for this artifact",
            "leakage_free_claim_allowed": False,
            "requires_retrain_with_current_pipeline": True,
        }
    else:
        if not isinstance(perceptual, dict):
            raise AssertionError("cnn_metrics.json: invalid perceptual duplicate audit")
        manifest = perceptual.get("manual_review_manifest")
        expected_manifest_sha = perceptual.get("manual_review_manifest_sha256")
        if not isinstance(manifest, list) or not isinstance(expected_manifest_sha, str):
            raise AssertionError("cnn_metrics.json: missing perceptual manual-review manifest")
        actual_manifest_sha = __import__("hashlib").sha256(
            json.dumps(manifest, sort_keys=True, separators=(",", ":")).encode()
        ).hexdigest()
        if actual_manifest_sha != expected_manifest_sha:
            raise AssertionError("cnn_metrics.json: perceptual review-manifest SHA-256 mismatch")
        if perceptual.get("cross_split_candidate_groups") != len(manifest):
            raise AssertionError("cnn_metrics.json: perceptual candidate count mismatch")
        if not str(perceptual.get("policy", "")).startswith("quarantine all candidates"):
            raise AssertionError("cnn_metrics.json: perceptual candidates were not quarantined")
        leakage_audit = {
            "status": "passed_with_residual_scene_risk",
            "exact_pixel_duplicates": "quarantined",
            "perceptual_duplicates": "quarantined before training/evaluation",
            "candidate_groups": len(manifest),
            "manual_review_required": bool(perceptual.get("manual_review_required")),
            "leakage_free_claim_allowed": False,
            "residual_risk": "upstream data has no field/plant/session group identifiers",
        }

    return {
        "source": source,
        "synthetic_validation_or_test": False,
        "test_images": test_count,
        "correct": correct,
        "accuracy": round(measured_accuracy, 6),
        "accuracy_target": target,
        "accuracy_target_passed": True,
        "accuracy_wilson_95": interval,
        "wilson_lower_target_passed": True,
        "duplicate_audit": leakage_audit,
    }


def _verify_sklearn(meta_path: Path, expected_features: list[str], prefix: str = "") -> dict:
    import joblib

    meta = _read_json(meta_path)
    name = meta_path.name
    if meta.get("classes") != ML_CLASS_ORDER:
        raise AssertionError(f"{name}: class order differs from runtime")
    if meta.get("feature_names") != expected_features:
        raise AssertionError(f"{name}: feature order differs from runtime")
    active_id = meta.get("active_model_id")
    section = meta.get("fusion" if prefix else "models", {})
    if active_id not in section:
        raise AssertionError(f"{name}: active_model_id not present in metrics")
    if prefix and meta.get("production_eligible") is not False:
        raise AssertionError("fusion artifact must remain production_eligible=false")
    _verify_selection(meta, name)
    validation_metrics = meta["selection"].get("validation_metrics")
    if not isinstance(validation_metrics, dict):
        raise AssertionError(f"{name}: missing per-model validation metrics")
    if choose_active_from_validation(validation_metrics) != active_id:
        raise AssertionError(f"{name}: active_model_id is not validation argmax")
    missing_optional = _verify_hashes(meta, name, required_ids=[active_id])

    verified_models = []
    smoke_input = np.asarray([
        [0.55, 0.05, 0.02, 0.01, 0.03, 0.20, 0.08, 0.002, 0.02, 0.01, 0.65, 0.55],
        [0.20, 0.18, 0.10, 0.06, 0.04, -0.02, 0.20, 0.006, 0.08, 0.04, 0.48, 0.42],
    ], dtype=np.float64)
    if smoke_input.shape[1] != len(expected_features):
        smoke_input = np.zeros((2, len(expected_features)), dtype=np.float64)
    for model_id in section:
        model_path = MODEL_DIR / f"{prefix}{model_id}.joblib"
        if not model_path.is_file():
            continue
        model = joblib.load(model_path)
        classes = np.asarray(getattr(model, "classes_", []))
        if not np.array_equal(classes, np.arange(len(ML_CLASS_ORDER))):
            raise AssertionError(f"{name}/{model_id}: estimator classes_ contract mismatch")
        if int(getattr(model, "n_features_in_", -1)) != len(expected_features):
            raise AssertionError(f"{name}/{model_id}: estimator n_features_in_ contract mismatch")
        probabilities = np.asarray(model.predict_proba(smoke_input))
        if probabilities.shape != (2, len(ML_CLASS_ORDER)):
            raise AssertionError(f"{name}/{model_id}: predict_proba shape mismatch")
        if (not np.isfinite(probabilities).all() or (probabilities < 0).any()
                or not np.allclose(probabilities.sum(axis=1), 1.0, atol=1e-6)):
            raise AssertionError(f"{name}/{model_id}: invalid probability output")
        verified_models.append(model_id)
    for model_id, scores in section.items():
        _verify_scores(scores, f"{name}/{model_id}")
    return {"active_model_id": active_id, "features": len(expected_features),
            "verified_models": verified_models,
            "missing_optional_artifacts": missing_optional}


def _verify_cnn() -> dict:
    import onnxruntime

    meta = _read_json(MODEL_DIR / "cnn_metrics.json")
    if meta.get("classes") != ML_CLASS_ORDER:
        raise AssertionError("cnn_metrics.json: class order differs from runtime")
    _verify_selection(meta, "cnn_metrics.json")
    _verify_hashes(meta, "cnn_metrics.json")
    if meta.get("input_layout") != "NCHW" or meta.get("input_scale") != "zero_to_255":
        raise AssertionError("cnn_metrics.json: unsupported preprocessing contract")
    temperature = meta.get("temperature")
    if not isinstance(temperature, (int, float)) or not math.isfinite(temperature) or temperature <= 0:
        raise AssertionError("cnn_metrics.json: invalid temperature")
    parity = meta.get("onnx_parity")
    if not isinstance(parity, dict) or parity.get("argmax_equal") is not True:
        raise AssertionError("cnn_metrics.json: missing successful framework/ONNX parity")

    onnx_path = MODEL_DIR / "cnn_efficientnet_b0.onnx"
    session = onnxruntime.InferenceSession(str(onnx_path), providers=["CPUExecutionProvider"])
    inputs, outputs = session.get_inputs(), session.get_outputs()
    if len(inputs) != 1 or inputs[0].name != meta.get("input_name") or len(outputs) != 1:
        raise AssertionError("CNN ONNX input/output contract mismatch")
    size = int(meta["img_size"])
    logits = np.asarray(session.run(None, {inputs[0].name: np.zeros((2, 3, size, size),
                                                                      dtype=np.float32)})[0])
    if logits.shape != (2, len(ML_CLASS_ORDER)) or not np.isfinite(logits).all():
        raise AssertionError("CNN ONNX logits contract mismatch")
    _verify_scores({"accuracy": meta["test"]["accuracy"]}, "cnn/test")
    macro_f1 = meta["test"].get("macro_f1")
    if not isinstance(macro_f1, (int, float)) or not 0 <= macro_f1 <= 1:
        raise AssertionError("cnn/test: invalid macro_f1")
    evaluation = _verify_cnn_evaluation_contract(meta)
    return {
        "model_id": meta["model_id"],
        "temperature": temperature,
        "evaluation": evaluation,
    }


def _verify_brown_leaf_spot() -> dict:
    """Verify the independent Brown Leaf Spot head and its base-CNN binding."""
    import joblib

    meta = _read_json(MODEL_DIR / "brown_leaf_spot_metrics.json")
    name = "brown_leaf_spot_metrics.json"
    expected_features = FEATURE_NAMES + [
        f"cnn_prob_{class_name}" for class_name in ML_CLASS_ORDER
    ]
    if meta.get("classes") != ["other", "brown_leaf_spot"]:
        raise AssertionError(f"{name}: binary class order differs from runtime")
    if meta.get("feature_names") != expected_features:
        raise AssertionError(f"{name}: feature order differs from runtime")
    _verify_selection(meta, name)

    active_id = meta.get("active_model_id")
    candidate_metrics = meta["selection"].get("candidate_metrics")
    if not isinstance(candidate_metrics, dict) or active_id not in candidate_metrics:
        raise AssertionError(f"{name}: active model is absent from validation candidates")
    expected_active = max(
        candidate_metrics,
        key=lambda model_id: (
            float(candidate_metrics[model_id]["macro_f1"]),
            float(candidate_metrics[model_id]["balanced_accuracy"]),
            float(candidate_metrics[model_id]["accuracy"]),
            model_id,
        ),
    )
    if active_id != expected_active:
        raise AssertionError(f"{name}: active model is not validation argmax")

    record = meta.get("artifact")
    if not isinstance(record, dict):
        raise AssertionError(f"{name}: missing artifact SHA-256 record")
    artifact_path = MODEL_DIR / record.get("file", "")
    if not artifact_path.is_file() or sha256_file(artifact_path) != record.get("sha256"):
        raise AssertionError(f"{name}: artifact is missing or SHA-256 mismatched")

    cnn_meta = _read_json(MODEL_DIR / "cnn_metrics.json")
    base_cnn = meta.get("base_cnn", {})
    if (
        base_cnn.get("model_id") != cnn_meta.get("model_id")
        or base_cnn.get("artifact_sha256")
        != cnn_meta.get("artifacts", {}).get("onnx", {}).get("sha256")
    ):
        raise AssertionError(f"{name}: base CNN contract mismatch")

    threshold = meta.get("threshold")
    if not isinstance(threshold, (int, float)) or not math.isfinite(threshold) or not 0 <= threshold <= 1:
        raise AssertionError(f"{name}: invalid threshold")
    for split in ("validation", "test"):
        metrics = meta.get(split)
        if not isinstance(metrics, dict):
            raise AssertionError(f"{name}: missing {split} metrics")
        _verify_scores(metrics, f"{name}/{split}")
        for key in ("macro_f1", "balanced_accuracy", "roc_auc"):
            value = metrics.get(key)
            if not isinstance(value, (int, float)) or not math.isfinite(value) or not 0 <= value <= 1:
                raise AssertionError(f"{name}/{split}: invalid {key}={value!r}")

    classifier = joblib.load(artifact_path)
    if int(getattr(classifier, "n_features_in_", -1)) != len(expected_features):
        raise AssertionError(f"{name}: estimator n_features_in_ contract mismatch")
    if not np.array_equal(np.asarray(getattr(classifier, "classes_", [])), np.asarray([0, 1])):
        raise AssertionError(f"{name}: estimator classes_ contract mismatch")
    probabilities = np.asarray(classifier.predict_proba(
        np.zeros((2, len(expected_features)), dtype=np.float64)
    ))
    if (
        probabilities.shape != (2, 2)
        or not np.isfinite(probabilities).all()
        or (probabilities < 0).any()
        or not np.allclose(probabilities.sum(axis=1), 1.0, atol=1e-6)
    ):
        raise AssertionError(f"{name}: invalid probability output")
    return {
        "model_id": meta["model_id"],
        "base_model_id": base_cnn["model_id"],
        "threshold": threshold,
        "test_macro_f1": meta["test"]["macro_f1"],
        "test_roc_auc": meta["test"]["roc_auc"],
        "field_validated": bool(meta.get("field_validated")),
        "production_eligible": bool(meta.get("production_eligible")),
    }


def _verify_white_leaf_spot() -> dict:
    """Verify the local-only White Leaf Spot head and its base-CNN binding."""
    import joblib

    meta = _read_json(MODEL_DIR / "white_leaf_spot_metrics.json")
    name = "white_leaf_spot_metrics.json"
    expected_features = FEATURE_NAMES + [
        f"cnn_prob_{class_name}" for class_name in ML_CLASS_ORDER
    ]
    if meta.get("classes") != ["other", "white_leaf_spot"]:
        raise AssertionError(f"{name}: binary class order differs from runtime")
    if meta.get("feature_names") != expected_features:
        raise AssertionError(f"{name}: feature order differs from runtime")
    if meta.get("production_eligible") is not False:
        raise AssertionError(f"{name}: experimental artifact cannot be production eligible")
    _verify_selection(meta, name)

    active_id = meta.get("active_model_id")
    candidate_metrics = meta["selection"].get("candidate_metrics")
    if not isinstance(candidate_metrics, dict) or active_id not in candidate_metrics:
        raise AssertionError(f"{name}: active model is absent from validation candidates")
    expected_active = max(
        candidate_metrics,
        key=lambda model_id: (
            float(candidate_metrics[model_id]["macro_f1"]),
            float(candidate_metrics[model_id]["balanced_accuracy"]),
            float(candidate_metrics[model_id]["accuracy"]),
            model_id,
        ),
    )
    if active_id != expected_active:
        raise AssertionError(f"{name}: active model is not validation argmax")

    record = meta.get("artifact")
    if not isinstance(record, dict):
        raise AssertionError(f"{name}: missing artifact SHA-256 record")
    artifact_path = MODEL_DIR / record.get("file", "")
    if (
        not artifact_path.is_file()
        or sha256_file(artifact_path) != record.get("sha256")
    ):
        raise AssertionError(f"{name}: artifact is missing or SHA-256 mismatched")

    cnn_meta = _read_json(MODEL_DIR / "cnn_metrics.json")
    base_cnn = meta.get("base_cnn", {})
    if (
        base_cnn.get("model_id") != cnn_meta.get("model_id")
        or base_cnn.get("artifact_sha256")
        != cnn_meta.get("artifacts", {}).get("onnx", {}).get("sha256")
    ):
        raise AssertionError(f"{name}: base CNN contract mismatch")

    threshold = meta.get("threshold")
    if (
        not isinstance(threshold, (int, float))
        or not math.isfinite(threshold)
        or not 0 <= threshold <= 1
    ):
        raise AssertionError(f"{name}: invalid threshold")
    test_evaluated = meta.get("test", {}).get("evaluated") is not False
    for split in (("validation", "test") if test_evaluated else ("validation",)):
        metrics = meta.get(split)
        if not isinstance(metrics, dict):
            raise AssertionError(f"{name}: missing {split} metrics")
        for key in ("macro_f1", "balanced_accuracy", "roc_auc"):
            value = metrics.get(key)
            if (
                not isinstance(value, (int, float))
                or not math.isfinite(value)
                or not 0 <= value <= 1
            ):
                raise AssertionError(f"{name}/{split}: invalid {key}={value!r}")

    classifier = joblib.load(artifact_path)
    if int(getattr(classifier, "n_features_in_", -1)) != len(expected_features):
        raise AssertionError(f"{name}: estimator n_features_in_ contract mismatch")
    if not np.array_equal(
        np.asarray(getattr(classifier, "classes_", [])),
        np.asarray([0, 1]),
    ):
        raise AssertionError(f"{name}: estimator classes_ contract mismatch")
    probabilities = np.asarray(
        classifier.predict_proba(
            np.zeros((2, len(expected_features)), dtype=np.float64)
        )
    )
    if (
        probabilities.shape != (2, 2)
        or not np.isfinite(probabilities).all()
        or (probabilities < 0).any()
        or not np.allclose(probabilities.sum(axis=1), 1.0, atol=1e-6)
    ):
        raise AssertionError(f"{name}: invalid probability output")
    return {
        "model_id": meta["model_id"],
        "threshold": threshold,
        "test_macro_f1": meta["test"]["macro_f1"],
        "test_recall": meta["test"]["per_class"]["white_leaf_spot"]["recall"],
        "production_eligible": False,
    }


def _verify_whitefly() -> dict:
    """Verify detector provenance, ONNX contract and finite smoke output."""
    import onnxruntime

    meta = _read_json(MODEL_DIR / "whitefly_detector_metrics.json")
    name = "whitefly_detector_metrics.json"
    if meta.get("task") != "object_detection_and_counting":
        raise AssertionError(f"{name}: task mismatch")
    if meta.get("classes") != ["whitefly"]:
        raise AssertionError(f"{name}: class order mismatch")
    if meta.get("production_eligible") is not False:
        raise AssertionError(f"{name}: detector cannot be production eligible")
    _verify_selection(meta, name)
    _verify_hashes(meta, name, required_ids=["onnx", "pytorch"])

    test_evaluated = meta.get("test", {}).get("evaluated") is not False
    for split in (("validation", "test") if test_evaluated else ("validation",)):
        scores = meta.get(split)
        if not isinstance(scores, dict):
            raise AssertionError(f"{name}: missing {split} metrics")
        for key in (
            "metrics/precision(B)",
            "metrics/recall(B)",
            "metrics/mAP50(B)",
            "metrics/mAP50-95(B)",
        ):
            value = scores.get(key)
            if (
                not isinstance(value, (int, float))
                or not math.isfinite(value)
                or not 0 <= value <= 1
            ):
                raise AssertionError(f"{name}/{split}: invalid {key}={value!r}")

    model_path = MODEL_DIR / meta["artifacts"]["onnx"]["file"]
    session = onnxruntime.InferenceSession(
        str(model_path),
        providers=["CPUExecutionProvider"],
    )
    inputs, outputs = session.get_inputs(), session.get_outputs()
    if len(inputs) != 1 or len(outputs) != 1:
        raise AssertionError(f"{name}: expected one input and one output")
    size = int(meta["input"]["image_size"])
    max_detections = int(meta["input"]["max_detections"])
    if max_detections <= 0:
        raise AssertionError(f"{name}: max_detections must be positive")
    predictions = np.asarray(
        session.run(
            None,
            {inputs[0].name: np.zeros((1, 3, size, size), dtype=np.float32)},
        )[0]
    )
    if predictions.shape != (1, max_detections, 6) or not np.isfinite(predictions).all():
        raise AssertionError(f"{name}: invalid detector output")
    evaluation = (
        meta["test"] if test_evaluated else meta["validation_operating_point"]
    )
    return {
        "model_id": meta["model_id"],
        "output_shape": list(predictions.shape),
        "evaluation_set": "test" if test_evaluated else "validation",
        "test_map50": meta["test"].get("metrics/mAP50(B)"),
        "recall": evaluation.get("metrics/recall(B)", evaluation.get("recall")),
        "production_eligible": False,
    }


def verify(*, include_fusion: bool = False, require_cnn: bool = False,
           include_classical: bool = True, include_auxiliary: bool = True) -> dict:
    report = {}
    if include_classical:
        report["classical"] = _verify_sklearn(MODEL_DIR / "metrics.json", FEATURE_NAMES)
    if include_fusion:
        report["fusion_experimental"] = _verify_sklearn(
            MODEL_DIR / "fusion_metrics.json", FUSION_FEATURE_NAMES, prefix="fusion_")
    cnn_meta = MODEL_DIR / "cnn_metrics.json"
    if require_cnn or cnn_meta.exists():
        report["cnn"] = _verify_cnn()
    brown_meta = MODEL_DIR / "brown_leaf_spot_metrics.json"
    if include_auxiliary and brown_meta.exists():
        report["brown_leaf_spot_auxiliary"] = _verify_brown_leaf_spot()
    white_meta = MODEL_DIR / "white_leaf_spot_metrics.json"
    if include_auxiliary and white_meta.exists():
        report["white_leaf_spot_experimental"] = _verify_white_leaf_spot()
    whitefly_meta = MODEL_DIR / "whitefly_detector_metrics.json"
    if include_auxiliary and whitefly_meta.exists():
        report["whitefly_detector_experimental"] = _verify_whitefly()
    return report


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--include-fusion", action="store_true")
    parser.add_argument("--require-cnn", action="store_true")
    parser.add_argument("--cnn-only", action="store_true",
                        help="verify the CNN bundle without requiring classical artifacts")
    args = parser.parse_args(argv)
    report = verify(include_fusion=args.include_fusion,
                    require_cnn=args.require_cnn or args.cnn_only,
                    include_classical=not args.cnn_only,
                    include_auxiliary=not args.cnn_only)
    print(json.dumps({"status": "ok", **report}, indent=2))


if __name__ == "__main__":
    main()
