"""Import human-reviewed field photos into a training-only class-folder dataset.

The CSV is produced by prepare_pseudo_label_dataset.py. Only rows with a valid
human label plus reviewer and reviewed_at provenance are accepted. Images remain
training-only; this command never creates or modifies validation/test splits.
"""
from __future__ import annotations

import argparse
import csv
import json
import shutil
import sys
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(REPO_ROOT))

from backend.services.feature_extraction import ML_CLASS_ORDER
from backend.training.train_cnn_torch import _fingerprints_for_path


def import_reviewed(source: Path, queue: Path, output: Path) -> dict:
    source, queue, output = source.resolve(), queue.resolve(), output.resolve()
    if not source.is_dir() or not queue.is_file():
        raise FileNotFoundError("source folder or review queue is missing")
    output.mkdir(parents=True, exist_ok=True)
    for class_name in ML_CLASS_ORDER:
        (output / class_name).mkdir(parents=True, exist_ok=True)

    counts = Counter()
    skipped = Counter()
    seen = set()
    with queue.open(encoding="utf-8", newline="") as handle:
        rows = list(csv.DictReader(handle))
    for row in rows:
        label = row.get("human_label", "").strip().lower()
        if label not in ML_CLASS_ORDER:
            skipped["not_confirmed"] += 1
            continue
        if not row.get("reviewer", "").strip() or not row.get("reviewed_at", "").strip():
            skipped["missing_provenance"] += 1
            continue
        candidates = list(source.rglob(row["file"]))
        if len(candidates) != 1:
            skipped["source_missing_or_ambiguous"] += 1
            continue
        path = candidates[0]
        exact, _dhash, _phash = _fingerprints_for_path(path)
        if exact in seen:
            skipped["duplicate"] += 1
            continue
        seen.add(exact)
        target = output / label / f"{exact[:12]}__{path.name}"
        shutil.copy2(path, target)
        counts[label] += 1

    manifest = {
        "schema_version": 1,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "label_type": "human_reviewed",
        "usage": "training_only; prohibited from validation/test metrics",
        "source": str(source),
        "review_queue": str(queue),
        "accepted": sum(counts.values()),
        "accepted_per_class": dict(counts),
        "skipped": dict(skipped),
    }
    (output / "source_manifest.json").write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    return manifest


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source", type=Path)
    parser.add_argument("queue", type=Path)
    parser.add_argument("output", type=Path)
    args = parser.parse_args(argv)
    print(json.dumps(import_reviewed(args.source, args.queue, args.output), indent=2))


if __name__ == "__main__":
    main()
