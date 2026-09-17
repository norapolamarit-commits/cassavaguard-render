#!/usr/bin/env python3
"""Select a two-model probability ensemble on validation, then open test once."""
from __future__ import annotations

import argparse
import json
from pathlib import Path
import sys

import numpy as np

REPO_ROOT = Path(__file__).resolve().parents[2]
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from backend.training.evaluate_cnn_tta_pipeline import _collect_tta_logits, _prepare
from backend.training.train_cnn_torch import (
    _audit_records,
    _build_pipeline_transform,
    _evaluate_logits,
    _softmax,
)
from backend.training.training_utils import atomic_write_json


def parse_args(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--data-dir", type=Path, required=True)
    parser.add_argument("--model-a", type=Path, required=True)
    parser.add_argument("--metrics-a", type=Path, required=True)
    parser.add_argument("--model-b", type=Path, required=True)
    parser.add_argument("--metrics-b", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--batch-size", type=int, default=16)
    parser.add_argument("--weight-step", type=float, default=0.05)
    parser.add_argument("--tta", action="store_true", help="use four-view flip TTA")
    return parser.parse_args(argv)


def _load_session(model_path, metrics_path):
    import onnxruntime

    metrics = json.loads(metrics_path.read_text(encoding="utf-8"))
    pipeline = metrics.get("training", {}).get("pipeline", "none")
    image_size = int(metrics["img_size"])
    pre_step, train_only = _build_pipeline_transform(pipeline, image_size)
    if train_only is not None:
        raise RuntimeError(f"pipeline {pipeline!r} has no deterministic evaluation form")
    session = onnxruntime.InferenceSession(
        str(model_path.expanduser().resolve()), providers=["CPUExecutionProvider"]
    )
    return session, metrics, image_size, pre_step


def _probabilities(session, metrics, rows, image_size, pre_step, batch_size, tta):
    input_name = metrics.get("input_name", "image")
    if tta:
        logits, labels = _collect_tta_logits(
            session, input_name, rows, image_size, pre_step, batch_size,
        )
    else:
        chunks, labels = [], []
        for start in range(0, len(rows), batch_size):
            batch = rows[start:start + batch_size]
            images = np.stack([_prepare(path, image_size, pre_step) for path, _ in batch])
            chunks.append(np.asarray(session.run(None, {input_name: images})[0]))
            labels.extend(label for _, label in batch)
        logits = np.concatenate(chunks)
        labels = np.asarray(labels, dtype=np.int64)
    return _softmax(logits, float(metrics["temperature"])), labels


def _score(probabilities, labels):
    safe_logits = np.log(np.clip(probabilities, 1e-12, 1.0))
    return _evaluate_logits(safe_logits, labels, 1.0)


def main(argv=None):
    args = parse_args(argv)
    if args.batch_size <= 0 or not 0 < args.weight_step <= 0.5:
        raise SystemExit("batch-size must be positive and weight-step must be in (0, 0.5]")
    records, audit = _audit_records(args.data_dir.expanduser().resolve())
    session_a, metrics_a, size_a, pre_a = _load_session(args.model_a, args.metrics_a)
    session_b, metrics_b, size_b, pre_b = _load_session(args.model_b, args.metrics_b)

    val_a, labels_a = _probabilities(session_a, metrics_a, records["validation"], size_a, pre_a, args.batch_size, args.tta)
    val_b, labels_b = _probabilities(session_b, metrics_b, records["validation"], size_b, pre_b, args.batch_size, args.tta)
    if not np.array_equal(labels_a, labels_b):
        raise RuntimeError("validation labels are not aligned")

    candidates = []
    for weight_a in np.arange(0.0, 1.0 + args.weight_step / 2, args.weight_step):
        combined = weight_a * val_a + (1.0 - weight_a) * val_b
        result = _score(combined, labels_a)
        candidates.append((result["macro_f1"], result["accuracy"], float(weight_a), result))
    _, _, weight_a, validation = max(candidates, key=lambda item: (item[0], item[1]))

    # Test is evaluated only after the ensemble weight is frozen on validation.
    test_a, test_labels_a = _probabilities(session_a, metrics_a, records["test"], size_a, pre_a, args.batch_size, args.tta)
    test_b, test_labels_b = _probabilities(session_b, metrics_b, records["test"], size_b, pre_b, args.batch_size, args.tta)
    if not np.array_equal(test_labels_a, test_labels_b):
        raise RuntimeError("test labels are not aligned")
    test = _score(weight_a * test_a + (1.0 - weight_a) * test_b, test_labels_a)

    report = {
        "model_id": "cnn_validation_selected_ensemble",
        "selection": {"set": "validation", "metric": "macro_f1", "test_used_for_selection": False},
        "weight_a": round(weight_a, 4),
        "weight_b": round(1.0 - weight_a, 4),
        "tta": args.tta,
        "model_a": {"path": str(args.model_a), "model_id": metrics_a.get("model_id")},
        "model_b": {"path": str(args.model_b), "model_id": metrics_b.get("model_id")},
        "validation": validation,
        "test": test,
        "quality_target": {
            "metric": "held_out_test_accuracy",
            "threshold": 0.90,
            "point_estimate_passed": test["accuracy"] >= 0.90,
            "wilson_lower_95_passed": test["accuracy_wilson_95"][0] >= 0.90,
        },
        "dataset_audit": audit,
    }
    atomic_write_json(args.output, report)
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
