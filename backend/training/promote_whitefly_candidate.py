#!/usr/bin/env python3
"""Publish an explicitly selected validation-only Whitefly candidate for review."""
from __future__ import annotations

import argparse
import datetime as dt
import json
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(REPO_ROOT))

from backend.training.train_whitefly_detector import _atomic_copy
from backend.training.training_utils import atomic_write_json, sha256_file

ML_MODELS_DIR = REPO_ROOT / "backend" / "ml_models"


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("candidate", type=Path)
    parser.add_argument("--allow-below-target-review-deploy", action="store_true")
    args = parser.parse_args()
    if not args.allow_below_target_review_deploy:
        parser.error("explicit --allow-below-target-review-deploy is required")

    candidate_path = args.candidate.resolve()
    candidate = json.loads(candidate_path.read_text(encoding="utf-8"))
    if candidate.get("published") is not False:
        raise RuntimeError("candidate must be unpublished")
    if candidate.get("test", {}).get("evaluated") is not False:
        raise RuntimeError("review deployment requires the sealed test to remain unopened")
    if candidate.get("checkpoint", {}).get("selected_on") != "validation":
        raise RuntimeError("checkpoint was not selected on validation")
    if candidate.get("checkpoint", {}).get("test_used_for_selection") is not False:
        raise RuntimeError("test was used for checkpoint selection")

    checkpoint = Path(candidate["checkpoint"]["file"]).resolve()
    if sha256_file(checkpoint) != candidate["checkpoint"]["sha256"]:
        raise RuntimeError("candidate checkpoint SHA-256 mismatch")

    import torch
    import ultralytics
    from ultralytics import YOLO

    image_size = int(candidate["training"]["image_size"])
    max_detections = 700
    exported = Path(YOLO(str(checkpoint)).export(
        format="onnx",
        imgsz=image_size,
        dynamic=True,
        simplify=True,
        opset=17,
        max_det=max_detections,
    ))

    ML_MODELS_DIR.mkdir(parents=True, exist_ok=True)
    pt_target = ML_MODELS_DIR / "whitefly_detector.pt"
    onnx_target = ML_MODELS_DIR / "whitefly_detector.onnx"
    _atomic_copy(checkpoint, pt_target)
    _atomic_copy(exported, onnx_target)

    operating_point = candidate["validation_operating_point"]
    metrics = {
        "model_id": "whitefly_detector_stage3_review",
        "trained_at": candidate["trained_at"],
        "published_at": dt.datetime.now(dt.timezone.utc).isoformat(),
        "deployment_scope": "review_only_validation_candidate",
        "framework": {
            "ultralytics": ultralytics.__version__,
            "torch": torch.__version__,
            "training_code_license": "AGPL-3.0",
            "distribution_note": (
                "Obtain a commercial Ultralytics licence or comply with AGPL "
                "before proprietary distribution."
            ),
        },
        "architecture": candidate["training"]["architecture"],
        "training": candidate["training"],
        "task": "object_detection_and_counting",
        "classes": ["whitefly"],
        "input": {
            "image_size": image_size,
            "max_detections": max_detections,
        },
        "dataset": candidate["dataset"],
        "tiling": candidate["tiling"],
        "split": candidate["split"],
        "integrity": candidate["integrity"],
        "selection": {
            "set": "validation",
            "checkpoint": "best.pt",
            "test_used_for_selection": False,
        },
        "validation": candidate["validation"],
        "validation_operating_point": operating_point,
        "validation_gate": candidate["validation_gate"],
        "test": {
            "evaluated": False,
            "reason": "sealed test was not opened because the 75% validation gate failed",
        },
        "evaluation_warning": {
            "status": "validation_only_below_target",
            "detail": (
                "Explicitly deployed for review at validation P/R/F1 "
                f"{operating_point['precision']:.4f}/"
                f"{operating_point['recall']:.4f}/"
                f"{operating_point['f1']:.4f}; the 0.75 gate failed and no test "
                "metric is available."
            ),
        },
        "artifacts": {
            "pytorch": {"file": pt_target.name, "sha256": sha256_file(pt_target)},
            "onnx": {"file": onnx_target.name, "sha256": sha256_file(onnx_target)},
        },
        "production_eligible": False,
        "field_validated": False,
        "runtime_threshold": candidate["runtime_threshold"],
        "release_blockers": [
            "Validation precision, recall and F1 did not all reach 0.75",
            "Held-out test remains sealed and unevaluated",
            "Independent Thai-field holdout is not available",
            "Relevant negative insect/background images are not present",
            "Distribution licensing review is required",
        ],
    }
    atomic_write_json(ML_MODELS_DIR / "whitefly_detector_metrics.json", metrics)
    print(json.dumps(metrics, indent=2))


if __name__ == "__main__":
    main()
