"""Export real app-submitted leaf photos into the Thai field collection.

Bridges production `predictions` rows (real photos users submitted through the
app, already saved under uploads/) into the data/thai_field/ structure defined
by docs/THAI_FIELD_COLLECTION_TH.md, so they can enter the same
agronomist-review -> canonical_class -> leakage-safe-split pipeline as manually
collected field photos. The AI's own top_class is recorded as `raw_label` only
-- never as `canonical_class` -- so nothing here is usable for training until a
human reviewer confirms it (same rule prepare_pseudo_label_dataset.py and
import_reviewed_field_labels.py already enforce for other sources).

Safe to re-run: predictions already present in metadata.csv (by image_id) are
skipped, so this can run repeatedly as new predictions arrive.
"""
from __future__ import annotations

import argparse
import csv
import shutil
import sys
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(REPO_ROOT))

from backend.config import UPLOAD_DIR  # noqa: E402
from backend.database import SessionLocal  # noqa: E402
from backend.models import Field, Prediction  # noqa: E402
from backend.services.feature_extraction import ML_CLASS_ORDER  # noqa: E402
from backend.training.train_cnn_torch import _fingerprints_for_path  # noqa: E402

METADATA_FIELDS = [
    "image_id", "date", "province", "farm_id", "plant_id", "device", "lighting",
    "growth_stage", "disease", "severity", "label_source", "expert_verified", "notes",
]
LABEL_FIELDS = [
    "image_id", "raw_label", "canonical_class", "split", "reviewer", "review_date",
    "review_status", "notes",
]


def _read_existing_ids(metadata_path: Path) -> set[str]:
    if not metadata_path.is_file():
        return set()
    with metadata_path.open(encoding="utf-8", newline="") as handle:
        return {row["image_id"] for row in csv.DictReader(handle)}


def _append_rows(path: Path, fieldnames: list[str], rows: list[dict]) -> None:
    is_new = not path.is_file()
    with path.open("a", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fieldnames)
        if is_new:
            writer.writeheader()
        writer.writerows(rows)


def export(output_dir: Path) -> dict:
    output_dir = output_dir.resolve()
    images_dir = output_dir / "images"
    images_dir.mkdir(parents=True, exist_ok=True)
    metadata_path = output_dir / "metadata.csv"
    labels_path = output_dir / "labels.csv"

    already_exported = _read_existing_ids(metadata_path)
    seen_fingerprints = set()

    skipped = Counter()
    exported_per_class = Counter()
    metadata_rows, label_rows = [], []

    db = SessionLocal()
    try:
        predictions = (
            db.query(Prediction, Field)
            .outerjoin(Field, Prediction.field_id == Field.id)
            .filter(Prediction.top_class.in_(ML_CLASS_ORDER))
            .filter(Prediction.image_path != "")
            .order_by(Prediction.id)
            .all()
        )
        for prediction, field in predictions:
            image_id = f"pred_{prediction.id}"
            if image_id in already_exported:
                skipped["already_exported"] += 1
                continue
            source_path = UPLOAD_DIR.parent / prediction.image_path
            if not source_path.is_file():
                skipped["file_missing"] += 1
                continue
            try:
                fingerprint, _dhash, _phash = _fingerprints_for_path(source_path)
            except Exception:
                skipped["unreadable_image"] += 1
                continue
            if fingerprint in seen_fingerprints:
                skipped["duplicate_in_batch"] += 1
                continue
            seen_fingerprints.add(fingerprint)

            target_name = f"{image_id}__{fingerprint[:12]}{source_path.suffix.lower()}"
            shutil.copy2(source_path, images_dir / target_name)

            metadata_rows.append({
                "image_id": image_id,
                "date": prediction.created_at.date().isoformat() if prediction.created_at else "",
                "province": field.province if field else "",
                "farm_id": prediction.field_id or "",
                "plant_id": "",
                "device": "",
                "lighting": "",
                "growth_stage": "",
                "disease": prediction.top_class,
                "severity": "",
                "label_source": "app_prediction",
                "expert_verified": "",
                "notes": f"AI confidence {prediction.confidence:.4f}; model {prediction.model_id}",
            })
            label_rows.append({
                "image_id": image_id,
                "raw_label": prediction.top_class,
                "canonical_class": "",
                "split": "",
                "reviewer": "",
                "review_date": "",
                "review_status": "pending",
                "notes": "",
            })
            exported_per_class[prediction.top_class] += 1
    finally:
        db.close()

    _append_rows(metadata_path, METADATA_FIELDS, metadata_rows)
    _append_rows(labels_path, LABEL_FIELDS, label_rows)

    return {
        "schema_version": 1,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "output_dir": str(output_dir),
        "exported": len(metadata_rows),
        "exported_per_class": dict(exported_per_class),
        "skipped": dict(skipped),
        "note": "canonical_class left blank; requires agronomist review before any training use "
                "(see docs/THAI_FIELD_COLLECTION_TH.md)",
    }


def main(argv=None) -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path, default=Path("data/thai_field"))
    args = parser.parse_args(argv)
    import json
    print(json.dumps(export(args.output), indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
