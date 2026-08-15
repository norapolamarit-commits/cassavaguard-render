"""Train a real auxiliary Cassava Brown Leaf Spot classifier on CCMT images.

This is deliberately a binary auxiliary head, not a sixth member forced into the
TFDS five-way softmax.  CCMT and TFDS are different acquisition domains and brown
leaf spot can coexist with other findings.  The head consumes the 12 shared visual
features plus the verified CNN's five probabilities.

Dataset: CCMT raw Cassava subset, DOI 10.17632/bwh3zbpkpv.1, CC BY 4.0.
The script downloads at most 1,000 raw images for each of the five CCMT cassava
labels through Mendeley Data's public API, verifies every published SHA-256, removes
exact duplicates, preserves a held-out test split, and publishes metadata last.
"""
from __future__ import annotations

import argparse
import concurrent.futures
import datetime as dt
import hashlib
import json
import sys
import time
import urllib.request
from collections import Counter
from pathlib import Path

import joblib
import numpy as np
from PIL import Image
from sklearn.ensemble import ExtraTreesClassifier, HistGradientBoostingClassifier, RandomForestClassifier
from sklearn.metrics import (accuracy_score, balanced_accuracy_score, confusion_matrix,
                             f1_score, precision_recall_fscore_support, roc_auc_score)
from sklearn.model_selection import train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression

REPO_ROOT = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(REPO_ROOT))

from backend.services.cnn_classifier import cnn_predict_proba_batch, get_cnn_metrics, get_cnn_session
from backend.services.feature_extraction import (FEATURE_NAMES, ML_CLASS_ORDER,
                                                  extract_features, feature_vector)
from backend.training.training_utils import atomic_write_json, sha256_file

PUBLIC_API = "https://data.mendeley.com/public-api"
DATASET_ID = "bwh3zbpkpv"
DATASET_VERSION = 1
DATASET_DOI = "10.17632/bwh3zbpkpv.1"
DATASET_LICENSE = "CC BY 4.0"

RAW_FOLDERS = {
    "bacterial_blight": "5a089bd5-4c26-415c-862d-530233120bd9",
    "brown_leaf_spot": "d871023f-5dc4-4e10-a4b9-c0b1762ce351",
    "green_mite": "3d09905e-e4f5-4415-a454-120fd29b6951",
    "healthy": "17e79247-49e5-4c6b-b81c-11c97599561d",
    "mosaic": "fbf17af1-ab7c-495b-9c9a-705025a7eadc",
}

FEATURE_ORDER = FEATURE_NAMES + [f"cnn_prob_{name}" for name in ML_CLASS_ORDER]
MODEL_DIR = REPO_ROOT / "backend" / "ml_models"
DEFAULT_DATA_DIR = REPO_ROOT / "backend" / "training" / "data" / "ccmt_cassava_raw"
HEADERS = {
    "Accept": "application/vnd.mendeley-public-dataset.1+json",
    "User-Agent": "CassavaGuard-training/1.0",
}


def _read_json(url: str):
    request = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(request, timeout=60) as response:
        return json.loads(response.read())


def _download_one(item: dict, destination: Path) -> tuple[str, bool]:
    destination.parent.mkdir(parents=True, exist_ok=True)
    expected = item["content_details"]["sha256_hash"]
    if destination.is_file() and sha256_file(destination) == expected:
        return destination.name, False
    payload = None
    last_error = None
    for attempt in range(5):
        request = urllib.request.Request(
            item["content_details"]["download_url"],
            headers={"User-Agent": HEADERS["User-Agent"]},
        )
        try:
            with urllib.request.urlopen(request, timeout=120) as response:
                payload = response.read()
            break
        except Exception as exc:
            last_error = exc
            if attempt < 4:
                time.sleep(2 ** attempt)
    if payload is None:
        raise RuntimeError(
            f"Download failed after retries for {item['filename']}: {last_error}"
        )
    actual = hashlib.sha256(payload).hexdigest()
    if actual != expected:
        raise RuntimeError(f"SHA-256 mismatch for {item['filename']}")
    destination.write_bytes(payload)
    return destination.name, True


def fetch_dataset(data_dir: Path, workers: int = 12) -> dict:
    manifest = {
        "dataset_id": DATASET_ID,
        "version": DATASET_VERSION,
        "doi": DATASET_DOI,
        "license": DATASET_LICENSE,
        "retrieved_at": dt.datetime.now(dt.UTC).isoformat(),
        "classes": {},
    }
    for source_class, folder_id in RAW_FOLDERS.items():
        url = (
            f"{PUBLIC_API}/datasets/{DATASET_ID}/files"
            f"?folder_id={folder_id}&version={DATASET_VERSION}"
        )
        items = _read_json(url)
        if not items:
            raise RuntimeError(f"Mendeley returned no files for {source_class}")
        print(f"[download] {source_class}: {len(items)} files")
        downloaded = 0
        with concurrent.futures.ThreadPoolExecutor(max_workers=workers) as pool:
            futures = [
                pool.submit(
                    _download_one,
                    item,
                    data_dir / source_class / Path(item["filename"]).name,
                )
                for item in items
            ]
            for index, future in enumerate(concurrent.futures.as_completed(futures), 1):
                _, created = future.result()
                downloaded += int(created)
                if index % 200 == 0 or index == len(futures):
                    print(f"  {index}/{len(futures)} verified ({downloaded} downloaded)")
        manifest["classes"][source_class] = {
            "files": len(items),
            "bytes": sum(int(item.get("size", 0)) for item in items),
            "folder_id": folder_id,
        }
    atomic_write_json(data_dir / "source_manifest.json", manifest)
    return manifest


def _records(data_dir: Path) -> tuple[list[dict], dict]:
    by_hash: dict[str, list[dict]] = {}
    for source_class in RAW_FOLDERS:
        for path in sorted((data_dir / source_class).glob("*")):
            if not path.is_file():
                continue
            try:
                with Image.open(path) as image:
                    image.verify()
            except Exception:
                continue
            record = {
                "path": path,
                "source_class": source_class,
                "target": int(source_class == "brown_leaf_spot"),
            }
            by_hash.setdefault(sha256_file(path), []).append(record)

    rows = []
    same_label_removed = 0
    conflicts = 0
    for group in by_hash.values():
        targets = {item["target"] for item in group}
        if len(targets) > 1:
            conflicts += 1
            continue
        rows.append(group[0])
        same_label_removed += len(group) - 1
    audit = {
        "method": "exact file SHA-256",
        "unique_images": len(rows),
        "same_label_duplicates_removed": same_label_removed,
        "conflicting_label_groups_quarantined": conflicts,
    }
    return rows, audit


def _extract(rows: list[dict], batch_size: int = 32) -> tuple[np.ndarray, np.ndarray]:
    session = get_cnn_session()
    if session is None:
        raise RuntimeError("Verified cnn_primary ONNX artifact is required")
    matrix, targets = [], []
    for offset in range(0, len(rows), batch_size):
        batch_rows = rows[offset:offset + batch_size]
        images = []
        handcrafted = []
        for row in batch_rows:
            with Image.open(row["path"]) as image:
                rgb = image.convert("RGB")
                images.append(rgb.copy())
                handcrafted.append(feature_vector(extract_features(rgb)))
        cnn = cnn_predict_proba_batch(images)
        for row, base, probs in zip(batch_rows, handcrafted, cnn):
            matrix.append(base + probs.tolist())
            targets.append(row["target"])
        done = min(offset + batch_size, len(rows))
        if done % 320 == 0 or done == len(rows):
            print(f"[features] {done}/{len(rows)}")
    return np.asarray(matrix, dtype=np.float64), np.asarray(targets, dtype=np.int64)


def _metrics(y_true: np.ndarray, probabilities: np.ndarray, threshold: float) -> dict:
    predicted = (probabilities >= threshold).astype(np.int64)
    precision, recall, f1, support = precision_recall_fscore_support(
        y_true, predicted, labels=[0, 1], zero_division=0
    )
    return {
        "accuracy": round(float(accuracy_score(y_true, predicted)), 6),
        "balanced_accuracy": round(float(balanced_accuracy_score(y_true, predicted)), 6),
        "macro_f1": round(float(f1_score(y_true, predicted, average="macro")), 6),
        "roc_auc": round(float(roc_auc_score(y_true, probabilities)), 6),
        "threshold": round(float(threshold), 6),
        "confusion_matrix": confusion_matrix(y_true, predicted, labels=[0, 1]).tolist(),
        "per_class": {
            name: {
                "precision": round(float(precision[index]), 6),
                "recall": round(float(recall[index]), 6),
                "f1": round(float(f1[index]), 6),
                "support": int(support[index]),
            }
            for index, name in enumerate(["other", "brown_leaf_spot"])
        },
    }


def _best_threshold(y_true: np.ndarray, probabilities: np.ndarray) -> float:
    candidates = np.linspace(0.10, 0.90, 161)
    return float(max(
        candidates,
        key=lambda threshold: (
            f1_score(y_true, probabilities >= threshold, average="macro"),
            -abs(float(threshold) - 0.5),
        ),
    ))


def train(data_dir: Path, seed: int = 42) -> dict:
    rows, duplicate_audit = _records(data_dir)
    strata = [row["source_class"] for row in rows]
    train_rows, remainder = train_test_split(
        rows, test_size=0.30, random_state=seed, stratify=strata
    )
    remainder_strata = [row["source_class"] for row in remainder]
    val_rows, test_rows = train_test_split(
        remainder, test_size=0.50, random_state=seed, stratify=remainder_strata
    )

    split_rows = {"train": train_rows, "validation": val_rows, "test": test_rows}
    arrays = {}
    for split, split_records in split_rows.items():
        print(f"[features] extracting {split}: {len(split_records)}")
        arrays[split] = _extract(split_records)

    x_train, y_train = arrays["train"]
    candidates = {
        "hist_gb": HistGradientBoostingClassifier(
            learning_rate=0.06, max_iter=260, max_leaf_nodes=31,
            l2_regularization=1.0, random_state=seed,
        ),
        "random_forest": RandomForestClassifier(
            n_estimators=500, min_samples_leaf=2, class_weight="balanced_subsample",
            n_jobs=-1, random_state=seed,
        ),
        "extra_trees": ExtraTreesClassifier(
            n_estimators=500, min_samples_leaf=2, class_weight="balanced",
            n_jobs=-1, random_state=seed,
        ),
        "logistic_regression": make_pipeline(
            StandardScaler(),
            LogisticRegression(
                C=1.0, class_weight="balanced", max_iter=3000,
                random_state=seed, solver="liblinear",
            ),
        ),
    }
    validation = {}
    fitted = {}
    x_val, y_val = arrays["validation"]
    for model_id, model in candidates.items():
        print(f"[train] {model_id}")
        model.fit(x_train, y_train)
        probabilities = model.predict_proba(x_val)[:, 1]
        threshold = _best_threshold(y_val, probabilities)
        validation[model_id] = _metrics(y_val, probabilities, threshold)
        fitted[model_id] = model
        print(
            f"  val macro-F1={validation[model_id]['macro_f1']:.4f} "
            f"AUC={validation[model_id]['roc_auc']:.4f} threshold={threshold:.3f}"
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
    test_probabilities = active_model.predict_proba(x_test)[:, 1]
    test = _metrics(y_test, test_probabilities, threshold)

    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    artifact_path = MODEL_DIR / f"brown_leaf_spot_{active_id}.joblib"
    joblib.dump(active_model, artifact_path)
    cnn_meta = get_cnn_metrics()
    metadata = {
        "model_id": f"brown_leaf_spot_{active_id}",
        "active_model_id": active_id,
        "trained_at": dt.datetime.now(dt.UTC).isoformat(),
        "task": "auxiliary_binary_classification",
        "classes": ["other", "brown_leaf_spot"],
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
            "source": "CCMT raw Cassava subset",
            "doi": DATASET_DOI,
            "license": DATASET_LICENSE,
            "split_policy": "70/15/15 stratified by original CCMT class after exact SHA-256 deduplication",
            "duplicate_audit": duplicate_audit,
            "counts": {name: len(value) for name, value in split_rows.items()},
            "per_source_class": {
                split: dict(Counter(row["source_class"] for row in value))
                for split, value in split_rows.items()
            },
            "limitation": (
                "CCMT does not publish plant/field group identifiers. Exact duplicates "
                "were removed, but near-duplicate or same-scene leakage cannot be ruled out."
            ),
        },
        "validation": validation[active_id],
        "test": test,
    }
    atomic_write_json(MODEL_DIR / "brown_leaf_spot_metrics.json", metadata)
    print(json.dumps({
        "status": "ok",
        "model_id": metadata["model_id"],
        "validation": metadata["validation"],
        "test": metadata["test"],
    }, indent=2))
    return metadata


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--data-dir", type=Path, default=DEFAULT_DATA_DIR)
    parser.add_argument("--workers", type=int, default=12)
    parser.add_argument("--skip-download", action="store_true")
    parser.add_argument("--download-only", action="store_true")
    parser.add_argument("--seed", type=int, default=42)
    args = parser.parse_args(argv)
    if not args.skip_download:
        fetch_dataset(args.data_dir, workers=args.workers)
    if not args.download_only:
        train(args.data_dir, seed=args.seed)


if __name__ == "__main__":
    main()
