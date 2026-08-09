"""Train an experimental White Leaf Spot auxiliary classifier on real images.

Positive images are the 115 expert-labelled Embrapa PDDB photographs prepared by
``prepare_extended_dataset.py``.  Negatives are sampled from all five real CCMT
cassava classes.  The source domains differ, so this artifact remains
non-production and requires an independent same-domain field evaluation.
"""
from __future__ import annotations

import argparse
import datetime as dt
import json
import sys
from collections import Counter
from pathlib import Path

import joblib
import numpy as np
from PIL import Image
from sklearn.ensemble import (
    ExtraTreesClassifier,
    HistGradientBoostingClassifier,
    RandomForestClassifier,
)
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

REPO_ROOT = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(REPO_ROOT))

from backend.services.cnn_classifier import get_cnn_metrics
from backend.training.train_brown_leaf_spot import (
    FEATURE_ORDER,
    _best_threshold,
    _extract,
    _metrics,
)
from backend.training.training_utils import atomic_write_json, sha256_file

DEFAULT_POSITIVE_DIR = (
    REPO_ROOT
    / "backend"
    / "training"
    / "data"
    / "extended_conditions"
    / "real"
    / "white_leaf_spot"
    / "images"
)
DEFAULT_NEGATIVE_DIR = (
    REPO_ROOT / "backend" / "training" / "data" / "ccmt_cassava_raw"
)
MODEL_DIR = REPO_ROOT / "backend" / "ml_models"
NEGATIVE_CLASSES = (
    "bacterial_blight",
    "brown_leaf_spot",
    "green_mite",
    "healthy",
    "mosaic",
)


def _white_metrics(
    targets: np.ndarray,
    probabilities: np.ndarray,
    threshold: float,
) -> dict:
    metrics = _metrics(targets, probabilities, threshold)
    metrics["per_class"]["white_leaf_spot"] = metrics["per_class"].pop(
        "brown_leaf_spot"
    )
    return metrics


def _verified_images(directory: Path) -> list[Path]:
    paths = []
    for path in sorted(directory.glob("*")):
        if not path.is_file():
            continue
        try:
            with Image.open(path) as image:
                image.verify()
        except Exception:
            continue
        paths.append(path)
    return paths


def _records(
    positive_dir: Path,
    negative_dir: Path,
    negatives_per_class: int,
) -> tuple[list[dict], dict]:
    candidates = [
        {
            "path": path,
            "source_class": "white_leaf_spot",
            "target": 1,
        }
        for path in _verified_images(positive_dir)
    ]
    for source_class in NEGATIVE_CLASSES:
        images = _verified_images(negative_dir / source_class)
        # Input filenames are stable; deterministic sampling avoids reading test
        # outcomes to choose a more convenient negative set.
        for path in images[:negatives_per_class]:
            candidates.append({
                "path": path,
                "source_class": source_class,
                "target": 0,
            })

    by_hash: dict[str, list[dict]] = {}
    for row in candidates:
        by_hash.setdefault(sha256_file(row["path"]), []).append(row)
    rows = []
    same_label_removed = 0
    conflicts = 0
    for group in by_hash.values():
        if len({row["target"] for row in group}) > 1:
            conflicts += 1
            continue
        rows.append(group[0])
        same_label_removed += len(group) - 1
    audit = {
        "method": "exact file SHA-256",
        "candidate_images": len(candidates),
        "unique_images": len(rows),
        "same_label_duplicates_removed": same_label_removed,
        "conflicting_label_groups_quarantined": conflicts,
    }
    positives = sum(row["target"] for row in rows)
    if positives < 100:
        raise RuntimeError(f"Expected at least 100 real positive images, found {positives}")
    return rows, audit


def train(
    positive_dir: Path,
    negative_dir: Path,
    *,
    negatives_per_class: int,
    seed: int,
) -> dict:
    rows, duplicate_audit = _records(
        positive_dir,
        negative_dir,
        negatives_per_class,
    )
    strata = [row["source_class"] for row in rows]
    train_rows, remainder = train_test_split(
        rows,
        test_size=0.30,
        random_state=seed,
        stratify=strata,
    )
    remainder_strata = [row["source_class"] for row in remainder]
    val_rows, test_rows = train_test_split(
        remainder,
        test_size=0.50,
        random_state=seed,
        stratify=remainder_strata,
    )
    split_rows = {"train": train_rows, "validation": val_rows, "test": test_rows}

    arrays = {}
    for split, split_records in split_rows.items():
        print(f"[features] extracting {split}: {len(split_records)}", flush=True)
        arrays[split] = _extract(split_records)

    x_train, y_train = arrays["train"]
    candidates = {
        "hist_gb": HistGradientBoostingClassifier(
            learning_rate=0.06,
            max_iter=260,
            max_leaf_nodes=31,
            l2_regularization=1.0,
            random_state=seed,
        ),
        "random_forest": RandomForestClassifier(
            n_estimators=500,
            min_samples_leaf=2,
            class_weight="balanced_subsample",
            n_jobs=-1,
            random_state=seed,
        ),
        "extra_trees": ExtraTreesClassifier(
            n_estimators=500,
            min_samples_leaf=2,
            class_weight="balanced",
            n_jobs=-1,
            random_state=seed,
        ),
        "logistic_regression": make_pipeline(
            StandardScaler(),
            LogisticRegression(
                C=1.0,
                class_weight="balanced",
                max_iter=3000,
                random_state=seed,
                solver="liblinear",
            ),
        ),
    }
    validation, fitted = {}, {}
    x_val, y_val = arrays["validation"]
    for model_id, model in candidates.items():
        model.fit(x_train, y_train)
        probabilities = model.predict_proba(x_val)[:, 1]
        threshold = _best_threshold(y_val, probabilities)
        validation[model_id] = _white_metrics(y_val, probabilities, threshold)
        fitted[model_id] = model
        print(
            f"[validation] {model_id}: "
            f"F1={validation[model_id]['macro_f1']:.4f}, "
            f"AUC={validation[model_id]['roc_auc']:.4f}",
            flush=True,
        )

    active_id = max(
        validation,
        key=lambda key: (
            validation[key]["macro_f1"],
            validation[key]["balanced_accuracy"],
            validation[key]["roc_auc"],
            key,
        ),
    )
    active_model = fitted[active_id]
    threshold = validation[active_id]["threshold"]
    x_test, y_test = arrays["test"]
    test = _white_metrics(
        y_test,
        active_model.predict_proba(x_test)[:, 1],
        threshold,
    )

    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    artifact_path = MODEL_DIR / f"white_leaf_spot_{active_id}.joblib"
    joblib.dump(active_model, artifact_path)
    cnn_meta = get_cnn_metrics()
    metadata = {
        "model_id": f"white_leaf_spot_{active_id}",
        "active_model_id": active_id,
        "trained_at": dt.datetime.now(dt.UTC).isoformat(),
        "task": "auxiliary_binary_classification",
        "classes": ["other", "white_leaf_spot"],
        "feature_names": FEATURE_ORDER,
        "threshold": threshold,
        "production_eligible": False,
        "requires_expert_review": True,
        "field_validated": False,
        "artifact": {
            "file": artifact_path.name,
            "sha256": sha256_file(artifact_path),
        },
        "base_cnn": {
            "model_id": cnn_meta["model_id"],
            "artifact_sha256": cnn_meta["artifacts"]["onnx"]["sha256"],
        },
        "selection": {
            "set": "validation",
            "metric": "macro_f1",
            "test_used_for_selection": False,
            "candidate_metrics": validation,
        },
        "dataset": {
            "positive": {
                "source": "Embrapa PDDB White Leaf Spot subset",
                "doi": "10.48432/XA1OVL",
                "license": "Embrapa CC BY-NC 4.0",
                "commercial_use_allowed": False,
            },
            "negative": {
                "source": "CCMT raw Cassava subset",
                "doi": "10.17632/bwh3zbpkpv.1",
                "license": "CC BY 4.0",
            },
            "counts": {name: len(value) for name, value in split_rows.items()},
            "per_source_class": {
                split: dict(Counter(row["source_class"] for row in value))
                for split, value in split_rows.items()
            },
            "duplicate_audit": duplicate_audit,
            "limitation": (
                "Positive and negative images come from different source domains; "
                "scores may measure source/camera differences. No plant/field group "
                "identifiers or independent Thai-field test set are available."
            ),
        },
        "validation": validation[active_id],
        "test": test,
        "release_blockers": [
            "Cross-source domain confounding",
            "Only 115 positive images",
            "No independent Thai-field holdout",
            "Positive source licence prohibits commercial use",
        ],
    }
    atomic_write_json(MODEL_DIR / "white_leaf_spot_metrics.json", metadata)
    print(json.dumps({
        "status": "experimental_candidate_only",
        "model_id": metadata["model_id"],
        "validation": metadata["validation"],
        "test": metadata["test"],
    }, indent=2))
    return metadata


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--positive-dir", type=Path, default=DEFAULT_POSITIVE_DIR)
    parser.add_argument("--negative-dir", type=Path, default=DEFAULT_NEGATIVE_DIR)
    parser.add_argument("--negatives-per-class", type=int, default=100)
    parser.add_argument("--seed", type=int, default=42)
    args = parser.parse_args()
    train(
        args.positive_dir,
        args.negative_dir,
        negatives_per_class=args.negatives_per_class,
        seed=args.seed,
    )


if __name__ == "__main__":
    main()
