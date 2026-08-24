"""Prepare a train-only CBB supplement from CCMT for the primary 5-way classifier.

Context (see docs/superpowers/specs/2026-08-20-week1-repo-audit.md and
config/class_mapping.yaml): the production EfficientNet-B2 classifier's
weakest class is CBB, recall 67.53% on the TFDS-only test set. CCMT's raw
Cassava subset (DOI 10.17632/bwh3zbpkpv.1, CC BY 4.0) already ships a
``bacterial_blight`` class and is already downloaded/used in this repo for
the Brown Leaf Spot auxiliary head (see train_brown_leaf_spot.py). It is
NOT currently merged into the primary classifier's "cbb" label because CCMT
(Ghana/Ivory Coast) is a different acquisition domain than TFDS (Uganda) and
that merge must go through a controlled ablation experiment before being
trusted, per the project's "verified real data > pseudo-labels, prove it
first" rule (master spec section 23) -- this mirrors exactly what already
happened with the Mendeley India supplement, which was tried and *rejected*
because it lowered test macro-F1.

This script does NOT train anything. It only downloads (or reuses the
already-downloaded, checksum-verified CCMT cache) and republishes the
"bacterial_blight" -> "cbb" subset as a class-folder directory with a
source_manifest.json, in exactly the shape backend/training/train_cnn_torch.py
already expects for --extra-data-dir. Two safety properties matter:

1. Only images that fall in CCMT's own *train* split are included. CCMT's
   raw download is undifferentiated; this script reproduces the identical
   70/15/15 stratified split (seed=42) already used by
   train_brown_leaf_spot.py, so the val/test portions of CCMT's
   "bacterial_blight" class can never leak into this candidate's training
   data even indirectly.
2. train_cnn_torch.py's --extra-data-dir loader itself re-runs exact +
   perceptual duplicate quarantine against the official TFDS train/
   validation/test split before accepting any image, exactly as it did for
   the Mendeley India candidate.

Usage:
    python backend/training/prepare_ccmt_cbb_supplement.py \
        --output-dir backend/training/data/ccmt_cbb_supplement

    # then run the candidate exactly like the Mendeley India experiment:
    backend/training/.venv-torch/bin/python backend/training/train_cnn_torch.py \
        --architecture efficientnet_b2 --image-size 260 --device mps \
        --extra-data-dir backend/training/data/ccmt_cbb_supplement \
        --output-dir tmp/candidates/efficientnet_b2_cbb_ccmt_candidate

Then evaluate/compare against the current production metrics with
evaluate_cnn_tta.py before ever considering promotion -- do not promote
unless CBB recall AND overall macro-F1 both hold up on the untouched TFDS
test split (see quality_gate.py / promote_cnn_candidate.py for the existing
promotion gate this must also pass).
"""
from __future__ import annotations

import argparse
import datetime as dt
import json
import sys
from pathlib import Path

from sklearn.model_selection import train_test_split

REPO_ROOT = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(REPO_ROOT))

from backend.training.train_brown_leaf_spot import (  # noqa: E402
    DATASET_DOI,
    DATASET_ID,
    DATASET_LICENSE,
    DEFAULT_DATA_DIR as CCMT_RAW_DIR,
    _records,
    fetch_dataset,
)
from backend.training.training_utils import atomic_write_json, sha256_file  # noqa: E402

SOURCE_CLASS = "bacterial_blight"
TARGET_CLASS = "cbb"
SPLIT_SEED = 42
SPLIT_TEST_SIZE = 0.30  # matches train_brown_leaf_spot.py's train/(val+test) split


def _parse_args(argv=None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument(
        "--data-dir", type=Path, default=CCMT_RAW_DIR,
        help="raw CCMT cache directory (reused from train_brown_leaf_spot.py if already downloaded)",
    )
    parser.add_argument(
        "--output-dir", type=Path, required=True,
        help="class-folder directory to write, suitable for train_cnn_torch.py --extra-data-dir",
    )
    parser.add_argument("--skip-download", action="store_true", help="assume --data-dir is already populated")
    parser.add_argument("--workers", type=int, default=12)
    parser.add_argument("--seed", type=int, default=SPLIT_SEED)
    return parser.parse_args(argv)


def prepare(data_dir: Path, output_dir: Path, *, skip_download: bool, workers: int, seed: int) -> dict:
    if not skip_download:
        fetch_dataset(data_dir, workers=workers)
    elif not data_dir.is_dir():
        raise FileNotFoundError(f"{data_dir} does not exist and --skip-download was passed")

    rows, duplicate_audit = _records(data_dir)
    if not rows:
        raise RuntimeError(f"no usable CCMT images found under {data_dir}")

    strata = [row["source_class"] for row in rows]
    train_rows, _remainder = train_test_split(
        rows, test_size=SPLIT_TEST_SIZE, random_state=seed, stratify=strata,
    )
    cbb_train_rows = [row for row in train_rows if row["source_class"] == SOURCE_CLASS]
    if not cbb_train_rows:
        raise RuntimeError(f"no {SOURCE_CLASS!r} rows landed in the train split")

    target_dir = output_dir / TARGET_CLASS
    target_dir.mkdir(parents=True, exist_ok=True)
    for existing in target_dir.glob("*"):
        if existing.is_file():
            existing.unlink()

    files_manifest = []
    for row in sorted(cbb_train_rows, key=lambda item: item["path"].name):
        source_path = row["path"]
        digest = sha256_file(source_path)
        destination = target_dir / f"{digest}{source_path.suffix.lower()}"
        destination.write_bytes(source_path.read_bytes())
        files_manifest.append({
            "sha256": digest,
            "filename": destination.name,
            "original_filename": source_path.name,
        })

    manifest = {
        "dataset_id": DATASET_ID,
        "doi": DATASET_DOI,
        "license": DATASET_LICENSE,
        "source_url": f"https://doi.org/{DATASET_DOI}",
        "retrieved_at": dt.datetime.now(dt.timezone.utc).isoformat(),
        "usage": "training_only; supplements the primary 5-way classifier's cbb class only",
        "label_mapping": {SOURCE_CLASS: TARGET_CLASS},
        "provenance_note": (
            "Reproduces train_brown_leaf_spot.py's own 70/15/15 stratified split "
            f"(seed={seed}) over all five CCMT classes, then keeps only the "
            f"{SOURCE_CLASS!r} rows that fell in the 70% train portion. This is the "
            "same subset already reported as CCMT bacterial_blight train=693 in "
            "backend/ml_models/brown_leaf_spot_metrics.json -- CCMT's own "
            "validation/test bacterial_blight images are excluded here by "
            "construction, not by after-the-fact filtering."
        ),
        "warning": (
            "CCMT is a different acquisition domain than TFDS (Ghana/Ivory Coast vs "
            "Uganda). This candidate MUST be evaluated against the untouched TFDS "
            "test split before any promotion decision -- do not assume more CBB "
            "training data improves CBB recall. The prior Mendeley India ablation "
            "added real CBB/CMD/healthy data and made test macro-F1 worse "
            "(85.80%/79.78% vs the 88.20%/83.63% baseline), so this must be treated "
            "as an experiment to report honestly, not a foregone improvement."
        ),
        "duplicate_audit_within_ccmt": duplicate_audit,
        "split": {"seed": seed, "test_size": SPLIT_TEST_SIZE, "stratify_by": "ccmt_source_class"},
        "counts": {TARGET_CLASS: len(files_manifest)},
        "files": files_manifest,
    }
    atomic_write_json(output_dir / "source_manifest.json", manifest)
    return {"status": "ok", "output_dir": str(output_dir), "counts": {TARGET_CLASS: len(files_manifest)}}


def main(argv=None) -> None:
    args = _parse_args(argv)
    result = prepare(
        args.data_dir.expanduser().resolve(),
        args.output_dir.expanduser().resolve(),
        skip_download=args.skip_download,
        workers=args.workers,
        seed=args.seed,
    )
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
