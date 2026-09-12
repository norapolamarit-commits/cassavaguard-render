"""Evaluate one frozen candidate on the sealed Figshare external test split.

Run only after architecture, preprocessing, checkpoint and calibration are frozen.
This report is external-domain evidence and must not be used to tune the candidate.
"""
from __future__ import annotations

import argparse
import io
import json
import sys
import zipfile
from pathlib import Path

import numpy as np
from PIL import Image
from sklearn.metrics import accuracy_score, confusion_matrix, precision_recall_fscore_support

REPO_ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(REPO_ROOT))

from backend.services.cnn_classifier import _softmax, cnn_preprocess  # noqa: E402
from backend.services.feature_extraction import ML_CLASS_ORDER  # noqa: E402
from backend.training.prepare_figshare_cassava import (  # noqa: E402
    DOI,
    EXPECTED_MD5,
    _md5,
)
from backend.training.training_utils import atomic_write_json, sha256_file  # noqa: E402


def evaluate(model: Path, metrics_path: Path, archive: Path, output: Path, batch_size: int) -> dict:
    if batch_size <= 0:
        raise ValueError("batch_size must be positive")
    model, metrics_path, archive = model.resolve(), metrics_path.resolve(), archive.resolve()
    metrics = json.loads(metrics_path.read_text(encoding="utf-8"))
    if metrics["classes"] != ML_CLASS_ORDER:
        raise RuntimeError("candidate class order does not match runtime")
    if _md5(archive) != EXPECTED_MD5:
        raise RuntimeError("Figshare archive checksum mismatch")

    import onnxruntime

    session = onnxruntime.InferenceSession(str(model), providers=["CPUExecutionProvider"])
    input_name = metrics.get("input_name", "image")
    paths_and_labels = []
    with zipfile.ZipFile(archive) as bundle:
        for member in sorted(bundle.infolist(), key=lambda item: item.filename):
            parts = Path(member.filename).parts
            if (not member.is_dir() and len(parts) == 4 and parts[:2] == ("archive", "test")
                    and parts[2] in ML_CLASS_ORDER):
                paths_and_labels.append((member, ML_CLASS_ORDER.index(parts[2])))

        logits_parts, labels = [], []
        for offset in range(0, len(paths_and_labels), batch_size):
            rows = paths_and_labels[offset:offset + batch_size]
            tensors = []
            for member, label in rows:
                with bundle.open(member) as handle, Image.open(io.BytesIO(handle.read())) as image:
                    tensors.append(cnn_preprocess(image, metrics))
                labels.append(label)
            batch = np.concatenate(tensors, axis=0)
            logits_parts.append(session.run(None, {input_name: batch})[0])

    logits = np.concatenate(logits_parts)
    truth = np.asarray(labels, dtype=np.int64)
    probabilities = _softmax(logits.astype(np.float64) / float(metrics.get("temperature", 1.0)))
    predicted = probabilities.argmax(axis=1)
    precision, recall, f1, support = precision_recall_fscore_support(
        truth, predicted, labels=range(len(ML_CLASS_ORDER)), zero_division=0
    )
    report = {
        "schema_version": 1,
        "evaluation_set": "sealed_external_figshare_test",
        "dataset_doi": DOI,
        "used_for_model_selection": False,
        "model_id": metrics["model_id"],
        "model_sha256": sha256_file(model),
        "sample_count": int(len(truth)),
        "accuracy": round(float(accuracy_score(truth, predicted)), 6),
        "confusion_matrix": confusion_matrix(
            truth, predicted, labels=range(len(ML_CLASS_ORDER))
        ).tolist(),
        "per_class": {
            name: {
                "precision": round(float(precision[index]), 6),
                "recall": round(float(recall[index]), 6),
                "f1": round(float(f1[index]), 6),
                "support": int(support[index]),
            }
            for index, name in enumerate(ML_CLASS_ORDER)
        },
        "warning": "Do not tune architecture, thresholds, or preprocessing on this report.",
    }
    atomic_write_json(output.resolve(), report)
    return report


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--model", type=Path, required=True)
    parser.add_argument("--metrics", type=Path, required=True)
    parser.add_argument("--archive", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--batch-size", type=int, default=16)
    args = parser.parse_args(argv)
    report = evaluate(args.model, args.metrics, args.archive, args.output, args.batch_size)
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
