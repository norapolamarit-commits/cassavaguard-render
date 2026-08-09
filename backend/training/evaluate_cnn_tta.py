#!/usr/bin/env python3
"""Evaluate deterministic four-view TTA for an isolated CNN candidate.

The validation split selects whether TTA is beneficial.  The held-out test result is
reported only after that decision and is never used to select the inference policy.
"""
from __future__ import annotations

import argparse
import json
from pathlib import Path

import numpy as np
from PIL import Image

from backend.training.train_cnn_torch import _audit_records, _evaluate_logits
from backend.training.training_utils import atomic_write_json


def parse_args(argv=None):
    parser = argparse.ArgumentParser()
    parser.add_argument("--data-dir", type=Path, required=True)
    parser.add_argument("--model", type=Path, required=True)
    parser.add_argument("--metrics", type=Path, required=True)
    parser.add_argument("--batch-size", type=int, default=16)
    return parser.parse_args(argv)


def _prepare(path: Path, image_size: int) -> np.ndarray:
    with Image.open(path) as source:
        resized = source.convert("RGB").resize((image_size, image_size), Image.BILINEAR)
        return np.asarray(resized, dtype=np.float32).transpose(2, 0, 1)


def _collect_tta_logits(session, input_name, rows, image_size, batch_size):
    logits, labels = [], []
    for start in range(0, len(rows), batch_size):
        batch = rows[start:start + batch_size]
        images = np.stack([_prepare(path, image_size) for path, _ in batch])
        views = np.concatenate([
            images,
            images[:, :, :, ::-1],
            images[:, :, ::-1, :],
            images[:, :, ::-1, ::-1],
        ]).astype(np.float32, copy=False)
        output = np.asarray(session.run(None, {input_name: views})[0])
        output = output.reshape(4, len(batch), -1).mean(axis=0)
        logits.append(output)
        labels.extend(label for _, label in batch)
    return np.concatenate(logits), np.asarray(labels, dtype=np.int64)


def main(argv=None):
    args = parse_args(argv)
    if args.batch_size <= 0:
        raise SystemExit("batch-size must be > 0")
    import onnxruntime

    metrics = json.loads(args.metrics.read_text(encoding="utf-8"))
    records, audit = _audit_records(args.data_dir.expanduser().resolve())
    if audit["effective_split_counts"] != metrics["dataset"]["effective_split_counts"]:
        raise RuntimeError("candidate metrics and audited dataset counts do not match")
    session = onnxruntime.InferenceSession(str(args.model.expanduser().resolve()))
    input_name = metrics.get("input_name", "image")
    temperature = float(metrics["temperature"])
    evaluated = {}
    for split in ("validation", "test"):
        split_logits, split_labels = _collect_tta_logits(
            session, input_name, records[split], int(metrics["img_size"]), args.batch_size
        )
        evaluated[split] = _evaluate_logits(split_logits, split_labels, temperature)

    base_validation = float(metrics["validation"]["macro_f1"])
    tta_validation = float(evaluated["validation"]["macro_f1"])
    enabled = tta_validation > base_validation
    metrics["inference_tta"] = {
        "enabled": enabled,
        "selection_set": "validation",
        "selection_metric": "macro_f1",
        "test_used_for_selection": False,
        "transforms": [
            "identity", "horizontal_flip", "vertical_flip",
            "horizontal_vertical_flip",
        ],
        "aggregation": "mean_logits",
        "base_validation_macro_f1": base_validation,
        "tta_validation_macro_f1": tta_validation,
    }
    metrics["tta_validation"] = evaluated["validation"]
    metrics["tta_test"] = evaluated["test"]
    atomic_write_json(args.metrics, metrics)
    print(json.dumps({"inference_tta": metrics["inference_tta"], **evaluated}, indent=2))


if __name__ == "__main__":
    main()
