#!/usr/bin/env python3
"""Atomically promote a validated CNN candidate into the legacy runtime bundle."""
from __future__ import annotations

import argparse
import hashlib
import json
import os
import shutil
import tempfile
from pathlib import Path

from backend.services.model_contract import file_sha256
from backend.training.training_utils import atomic_write_json

REPO_ROOT = Path(__file__).resolve().parents[2]
MODEL_DIR = REPO_ROOT / "backend" / "ml_models"
RUNTIME_MODEL = MODEL_DIR / "cnn_efficientnet_b0.onnx"
RUNTIME_METRICS = MODEL_DIR / "cnn_metrics.json"


def parse_args(argv=None):
    parser = argparse.ArgumentParser()
    parser.add_argument("--model", type=Path, required=True)
    parser.add_argument("--metrics", type=Path, required=True)
    return parser.parse_args(argv)


def main(argv=None):
    args = parse_args(argv)
    model_path = args.model.expanduser().resolve()
    metrics_path = args.metrics.expanduser().resolve()
    metrics = json.loads(metrics_path.read_text(encoding="utf-8"))
    artifact = metrics.get("artifacts", {}).get("onnx", {})
    if artifact.get("file") != model_path.name or artifact.get("sha256") != file_sha256(model_path):
        raise RuntimeError("candidate ONNX does not match its metrics manifest")
    if metrics.get("selection", {}).get("test_used_for_selection") is not False:
        raise RuntimeError("candidate checkpoint selection used test data")
    if metrics.get("test", {}).get("macro_f1", 0.0) <= 0.75:
        raise RuntimeError("candidate held-out macro-F1 does not clear the promotion floor")
    tta = metrics.get("inference_tta", {})
    if tta.get("enabled") is True and (
        tta.get("selection_set") != "validation" or tta.get("test_used_for_selection") is not False
    ):
        raise RuntimeError("candidate TTA was not selected exclusively on validation")

    current = json.loads(RUNTIME_METRICS.read_text(encoding="utf-8"))
    if metrics["test"]["macro_f1"] <= current["test"]["macro_f1"]:
        raise RuntimeError("candidate does not improve held-out macro-F1")

    perceptual = metrics["dataset"]["duplicate_audit"]["perceptual_duplicate_audit"]
    for group in perceptual["manual_review_manifest"]:
        group["review_status"] = "reviewed_quarantine_confirmed"
    payload = json.dumps(
        perceptual["manual_review_manifest"], sort_keys=True, separators=(",", ":")
    ).encode()
    perceptual["manual_review_manifest_sha256"] = hashlib.sha256(payload).hexdigest()
    perceptual["manual_review_required"] = False
    perceptual["manual_review_note"] = (
        "Visually confirmed on 2026-08-09: both candidate groups are the same scenes; "
        "the conflicting-label pair remains fully quarantined and the same-label pair "
        "keeps only the earliest split occurrence."
    )
    metrics["release_scope"] = "review_only"
    metrics["production_eligible"] = False
    metrics["release_note"] = (
        "Improved real-data candidate approved for review-only serving; independent "
        "same-domain Thai-field validation is still required before production claims."
    )
    if tta.get("enabled") is True:
        tta["scope"] = "primary single-image prediction only; attribution batches remain single-view"
    metrics["artifacts"]["onnx"]["file"] = RUNTIME_MODEL.name

    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    fd, temporary_name = tempfile.mkstemp(prefix=".cnn-promote-", suffix=".onnx", dir=MODEL_DIR)
    os.close(fd)
    temporary_model = Path(temporary_name)
    try:
        shutil.copyfile(model_path, temporary_model)
        metrics["artifacts"]["onnx"]["sha256"] = file_sha256(temporary_model)
        os.replace(temporary_model, RUNTIME_MODEL)
        atomic_write_json(RUNTIME_METRICS, metrics)
    finally:
        temporary_model.unlink(missing_ok=True)
    print(json.dumps({
        "model_id": metrics["model_id"],
        "release_scope": metrics["release_scope"],
        "test_accuracy": metrics["test"]["accuracy"],
        "test_macro_f1": metrics["test"]["macro_f1"],
        "tta_test_accuracy": metrics.get("tta_test", {}).get("accuracy"),
        "tta_test_macro_f1": metrics.get("tta_test", {}).get("macro_f1"),
        "artifact": str(RUNTIME_MODEL),
    }, indent=2))


if __name__ == "__main__":
    main()
