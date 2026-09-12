"""Prepare an unlabeled field-photo folder for cautious self-training.

The current production CNN assigns weak labels, but only predictions that pass
both a probability and a top-1/top-2 margin threshold are accepted.  Exact
decoded-pixel duplicates are removed.  Outputs are class folders suitable for
``train_cnn_torch.py --extra-data-dir`` plus a complete provenance manifest and
a CSV review queue.  Pseudo labels are training-only and never become test data.
"""
from __future__ import annotations

import argparse
import csv
import hashlib
import json
import os
import shutil
import sys
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path

import numpy as np
from PIL import Image

REPO_ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(REPO_ROOT))

from backend.services.cnn_classifier import (  # noqa: E402
    _softmax,
    cnn_preprocess,
    get_cnn_metrics,
    get_cnn_session,
)
from backend.services.feature_extraction import ML_CLASS_ORDER  # noqa: E402
from backend.training.train_cnn_torch import _fingerprints_for_path  # noqa: E402


IMAGE_SUFFIXES = {".jpg", ".jpeg", ".png", ".webp"}


def _hex_hamming(left: str, right: str) -> int:
    return (int(left, 16) ^ int(right, 16)).bit_count()


def parse_args(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source", type=Path)
    parser.add_argument("output", type=Path)
    parser.add_argument("--min-confidence", type=float, default=0.95)
    parser.add_argument("--min-margin", type=float, default=0.50)
    parser.add_argument("--batch-size", type=int, default=8)
    return parser.parse_args(argv)


def _source_digest(paths: list[Path]) -> str:
    digest = hashlib.sha256()
    for path in paths:
        digest.update(path.name.encode("utf-8"))
        digest.update(str(path.stat().st_size).encode("ascii"))
    return digest.hexdigest()


def prepare(source: Path, output: Path, min_confidence: float, min_margin: float,
            batch_size: int) -> dict:
    source, output = source.resolve(), output.resolve()
    if not source.is_dir():
        raise FileNotFoundError(source)
    if not (0 < min_confidence <= 1 and 0 <= min_margin <= 1):
        raise ValueError("thresholds must be between 0 and 1")
    paths = sorted(
        path for path in source.rglob("*")
        if path.is_file() and path.suffix.lower() in IMAGE_SUFFIXES
    )
    if not paths:
        raise RuntimeError(f"no supported images found in {source}")

    session, metrics = get_cnn_session(), get_cnn_metrics()
    if session is None or metrics is None:
        raise RuntimeError("the reviewed CNN artifact is not available")

    if output.exists():
        shutil.rmtree(output)
    for class_name in ML_CLASS_ORDER:
        (output / class_name).mkdir(parents=True, exist_ok=True)

    valid, review_rows, broken = [], [], []
    for path in paths:
        try:
            with Image.open(path) as opened:
                opened.verify()
            with Image.open(path) as opened:
                valid.append((path, cnn_preprocess(opened)))
        except Exception as error:
            broken.append({"file": path.name, "error": str(error)})

    input_name = metrics.get("input_name", "image")
    temperature = float(metrics.get("temperature", 1.0))
    seen_exact: dict[str, str] = {}
    seen_perceptual: list[tuple[str, str, str]] = []
    accepted_counts = Counter()
    for offset in range(0, len(valid), batch_size):
        chunk = valid[offset:offset + batch_size]
        batch = np.concatenate([item[1] for item in chunk], axis=0)
        logits = session.run(None, {input_name: batch})[0]
        probabilities = _softmax(logits / temperature)
        for (path, _prepared), probability in zip(chunk, probabilities):
            order = np.argsort(probability)
            top_index, second_index = int(order[-1]), int(order[-2])
            confidence = float(probability[top_index])
            margin = confidence - float(probability[second_index])
            exact, dhash, phash = _fingerprints_for_path(path)
            duplicate_of = seen_exact.get(exact)
            duplicate_kind = "exact" if duplicate_of else ""
            if duplicate_of is None:
                for prior_name, prior_dhash, prior_phash in seen_perceptual:
                    if dhash == prior_dhash and _hex_hamming(phash, prior_phash) <= 3:
                        duplicate_of = prior_name
                        duplicate_kind = "perceptual"
                        break
            accepted = (
                confidence >= min_confidence
                and margin >= min_margin
                and duplicate_of is None
            )
            class_name = ML_CLASS_ORDER[top_index]
            target = None
            if accepted:
                # Digest prefix prevents same-named files from nested source folders
                # overwriting one another in the class output.
                target = output / class_name / f"{exact[:12]}__{path.name}"
                shutil.copy2(path, target)
                accepted_counts[class_name] += 1
            seen_exact.setdefault(exact, path.name)
            seen_perceptual.append((path.name, dhash, phash))
            review_rows.append({
                "file": path.name,
                "pseudo_label": class_name,
                "confidence": round(confidence, 8),
                "margin": round(margin, 8),
                "accepted": accepted,
                "duplicate_of": duplicate_of or "",
                "duplicate_kind": duplicate_kind,
                "decoded_sha256": exact,
                "dhash64": dhash,
                "phash64": phash,
                "output": str(target.relative_to(output)) if target else "",
            })

    review_path = output / "review_queue.csv"
    with review_path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=list(review_rows[0]))
        writer.writeheader()
        writer.writerows(review_rows)

    # A human-confirmed label is much more valuable than another pseudo-label.
    # Put accepted samples first so a reviewer can quickly convert them into
    # ground truth, followed by uncertain unique images ordered by the smallest
    # class margin (active learning). Exact/near duplicates are omitted.
    human_rows = []
    for row in review_rows:
        if row["duplicate_of"]:
            continue
        confidence = float(row["confidence"])
        margin = float(row["margin"])
        priority = (2.0 + confidence) if row["accepted"] else (1.0 - margin)
        human_rows.append({
            "priority": round(priority, 8),
            "file": row["file"],
            "suggested_label": row["pseudo_label"],
            "teacher_confidence": row["confidence"],
            "teacher_margin": row["margin"],
            "accepted_pseudo_label": row["accepted"],
            "human_label": "",
            "reviewer": "",
            "reviewed_at": "",
            "notes": "",
        })
    human_rows.sort(key=lambda row: (-float(row["priority"]), row["file"]))
    human_queue_path = output / "human_label_queue.csv"
    with human_queue_path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=list(human_rows[0]))
        writer.writeheader()
        writer.writerows(human_rows)

    manifest = {
        "schema_version": 1,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "source_url": str(source),
        "source_inventory_sha256": _source_digest(paths),
        "license": "user-provided; confirm rights before redistribution",
        "label_type": "pseudo_label",
        "teacher_model_id": metrics["model_id"],
        "teacher_artifact_sha256": metrics.get("artifacts", {}).get("onnx", {}).get("sha256"),
        "classes": list(ML_CLASS_ORDER),
        "thresholds": {
            "min_confidence": min_confidence,
            "min_top1_top2_margin": min_margin,
        },
        "usage": "training_only; prohibited from validation/test metrics",
        "limitations": [
            "labels are predictions, not expert diagnoses",
            "self-training can reinforce teacher-model errors",
            "exact and conservative perceptual duplicates are excluded",
            "human review is required before treating labels as ground truth",
        ],
        "counts": {
            "discovered": len(paths),
            "valid": len(valid),
            "broken": len(broken),
            "accepted": sum(accepted_counts.values()),
            "rejected": len(valid) - sum(accepted_counts.values()),
            "accepted_per_class": dict(accepted_counts),
        },
        "broken_files": broken,
        "review_queue": review_path.name,
        "human_label_queue": human_queue_path.name,
        "human_label_instructions": {
            "allowed_labels": list(ML_CLASS_ORDER) + ["uncertain", "not_cassava"],
            "rule": "Fill human_label, reviewer, and reviewed_at; never copy suggested_label without inspecting the image.",
        },
    }
    (output / "source_manifest.json").write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    return manifest


def main(argv=None):
    args = parse_args(argv)
    if args.batch_size <= 0:
        raise SystemExit("batch-size must be positive")
    manifest = prepare(
        args.source, args.output, args.min_confidence, args.min_margin, args.batch_size
    )
    print(json.dumps(manifest, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    os.environ.setdefault("APP_ENV", "development")
    main()
