#!/usr/bin/env python3
"""Release gate for measured CassavaGuard model quality.

This gate reads immutable, held-out metrics and verifies the executable CNN
artifact. It never trains, tunes a threshold, or opens test predictions for model
selection. Object detection is evaluated with mAP/recall instead of the invalid
shortcut of calling box detection "accuracy".
"""
from __future__ import annotations

import argparse
import json
import math
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(REPO_ROOT))

from backend.training.verify_artifacts import verify


MODEL_DIR = Path(__file__).resolve().parents[1] / "ml_models"


def _read_json(name: str) -> dict:
    payload = json.loads((MODEL_DIR / name).read_text(encoding="utf-8"))
    if not isinstance(payload, dict):
        raise AssertionError(f"{name} must contain a JSON object")
    return payload


def _finite_score(value, label: str) -> float:
    if not isinstance(value, (int, float)) or not math.isfinite(value):
        raise AssertionError(f"{label} must be a finite number")
    return float(value)


def evaluate(
    *,
    min_accuracy: float = 0.75,
    min_macro_f1: float = 0.70,
    max_ece: float = 0.10,
    min_whitefly_map50: float = 0.30,
    min_whitefly_recall: float = 0.40,
    min_whitefly_review_f1: float = 0.70,
) -> dict:
    cnn = _read_json("cnn_metrics.json")
    selection = cnn.get("selection", {})
    if selection.get("set") != "validation":
        raise AssertionError("CNN checkpoint must be selected on validation")
    if selection.get("test_used_for_selection") is not False:
        raise AssertionError("CNN test split must not be used for selection")
    dataset = cnn.get("dataset", {})
    if dataset.get("split_policy") != "official TFDS train/validation/test preserved":
        raise AssertionError("CNN must preserve the official real-data splits")
    test_count = int(dataset.get("effective_split_counts", {}).get("test", 0))
    if test_count < 1000:
        raise AssertionError("CNN held-out test set is unexpectedly small")

    test = cnn.get("test", {})
    accuracy = _finite_score(test.get("accuracy"), "CNN test accuracy")
    macro_f1 = _finite_score(test.get("macro_f1"), "CNN test macro-F1")
    ece = _finite_score(test.get("ece_15_bins"), "CNN test ECE")
    if accuracy <= min_accuracy:
        raise AssertionError(
            f"CNN held-out accuracy {accuracy:.4f} must be greater than "
            f"{min_accuracy:.4f}"
        )
    if macro_f1 < min_macro_f1:
        raise AssertionError(
            f"CNN held-out macro-F1 {macro_f1:.4f} is below {min_macro_f1:.4f}"
        )
    if ece > max_ece:
        raise AssertionError(f"CNN ECE {ece:.4f} exceeds {max_ece:.4f}")

    # Hash, class order, preprocessing and ONNX smoke-output verification.
    artifact_report = verify(
        require_cnn=True,
        include_classical=False,
        include_auxiliary=False,
    )["cnn"]
    cnn_evaluation = artifact_report["evaluation"]
    wilson_lower = _finite_score(
        cnn_evaluation["accuracy_wilson_95"][0],
        "CNN accuracy Wilson 95% lower bound",
    )
    if wilson_lower <= min_accuracy:
        raise AssertionError(
            f"CNN Wilson 95% lower bound {wilson_lower:.4f} must be greater "
            f"than {min_accuracy:.4f}"
        )

    whitefly = _read_json("whitefly_detector_metrics.json")
    detector_selection = whitefly.get("selection", {})
    if detector_selection.get("set") != "validation":
        raise AssertionError("Whitefly checkpoint must be selected on validation")
    if detector_selection.get("test_used_for_selection") is not False:
        raise AssertionError("Whitefly test split must not be used for selection")
    detector_test = whitefly.get("test", {})
    test_evaluated = detector_test.get("evaluated") is not False
    if test_evaluated:
        evaluation_set = "test"
        map50 = _finite_score(
            detector_test.get("metrics/mAP50(B)"), "Whitefly test mAP50"
        )
        recall = _finite_score(
            detector_test.get("metrics/recall(B)"), "Whitefly test recall"
        )
        precision = _finite_score(
            detector_test.get("metrics/precision(B)"), "Whitefly test precision"
        )
        f1 = 2 * precision * recall / (precision + recall)
    else:
        evaluation_set = "validation"
        if "acquisition-run" not in whitefly.get("split", {}).get("method", ""):
            raise AssertionError("Whitefly validation-only deploy requires acquisition-run split")
        validation = whitefly.get("validation", {})
        operating_point = whitefly.get("validation_operating_point", {})
        map50 = _finite_score(validation.get("metrics/mAP50(B)"), "Whitefly validation mAP50")
        precision = _finite_score(operating_point.get("precision"), "Whitefly validation precision")
        recall = _finite_score(operating_point.get("recall"), "Whitefly validation recall")
        f1 = _finite_score(operating_point.get("f1"), "Whitefly validation F1")
        if min(precision, recall, f1) < min_whitefly_review_f1:
            raise AssertionError(
                "Whitefly validation-only review metrics are below "
                f"{min_whitefly_review_f1:.4f}"
            )
    if map50 < min_whitefly_map50:
        raise AssertionError(
            f"Whitefly test mAP50 {map50:.4f} is below {min_whitefly_map50:.4f}"
        )
    if recall < min_whitefly_recall:
        raise AssertionError(
            f"Whitefly test recall {recall:.4f} is below {min_whitefly_recall:.4f}"
        )

    warnings = []
    duplicate_audit = cnn_evaluation["duplicate_audit"]
    if duplicate_audit.get("status") == "warning":
        warnings.append({
            "model": cnn["model_id"],
            "code": "perceptual_duplicate_retrain_required",
            "detail": (
                "Current artifact predates the perceptual quarantine contract; "
                "do not claim it is leakage-free until retrained."
            ),
        })
    detector_warning = whitefly.get("evaluation_warning")
    if detector_warning:
        warnings.append({
            "model": whitefly["model_id"],
            "code": detector_warning.get("status", "evaluation_warning"),
            "detail": detector_warning.get("detail"),
        })

    return {
        "status": "pass",
        "release_scope": "review_only",
        "warnings": warnings,
        "metric_contract": {
            "classification": "held-out accuracy + macro-F1 + calibration",
            "object_detection": "held-out mAP50 + recall",
            "test_used_for_selection": False,
        },
        "primary_cnn": {
            "model_id": cnn["model_id"],
            "test_images": test_count,
            "accuracy": accuracy,
            "accuracy_must_exceed": min_accuracy,
            "accuracy_wilson_95": cnn_evaluation["accuracy_wilson_95"],
            "wilson_lower_must_exceed": min_accuracy,
            "macro_f1": macro_f1,
            "min_macro_f1": min_macro_f1,
            "ece_15_bins": ece,
            "max_ece": max_ece,
            "artifact": artifact_report,
        },
        "whitefly_detector": {
            "model_id": whitefly["model_id"],
            "map50": map50,
            "min_map50": min_whitefly_map50,
            "recall": recall,
            "precision": precision,
            "f1": f1,
            "evaluation_set": evaluation_set,
            "test_evaluated": test_evaluated,
            "min_recall": min_whitefly_recall,
            "release_scope": "review_only",
            "evaluation_warning": detector_warning,
        },
    }


def main(argv=None) -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--min-accuracy", type=float, default=0.75)
    parser.add_argument("--min-macro-f1", type=float, default=0.70)
    parser.add_argument("--max-ece", type=float, default=0.10)
    parser.add_argument("--min-whitefly-map50", type=float, default=0.30)
    parser.add_argument("--min-whitefly-recall", type=float, default=0.40)
    args = parser.parse_args(argv)
    report = evaluate(
        min_accuracy=args.min_accuracy,
        min_macro_f1=args.min_macro_f1,
        max_ece=args.max_ece,
        min_whitefly_map50=args.min_whitefly_map50,
        min_whitefly_recall=args.min_whitefly_recall,
    )
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
