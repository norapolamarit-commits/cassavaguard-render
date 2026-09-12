"""Train a candidate cassava fresh-root-weight regressor with fail-closed gates.

The script requires verified destructive-harvest labels from multiple fields. It
uses field-grouped train/validation/test splits, selects only on validation, then
opens test once and writes candidates outside the runtime model directory.
"""
from __future__ import annotations

import argparse
import csv
import hashlib
import json
from pathlib import Path

import joblib
import numpy as np
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import HistGradientBoostingRegressor, RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import GroupShuffleSplit
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

MIN_LABELS = 150
MIN_FIELDS = 5
TARGET_WITHIN_20PCT = 0.95
SEED = 20260912
NUMERIC = ["disease_confidence", "age_months", "height_cm", "stem_count", "root_volume_cm3_per_plant"]
CATEGORICAL = ["disease_class", "variety", "season"]


def _sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def load_verified(path: Path) -> tuple[list[dict], np.ndarray, np.ndarray]:
    with path.open(newline="", encoding="utf-8") as handle:
        rows = list(csv.DictReader(handle))
    if len(rows) < MIN_LABELS:
        raise RuntimeError(f"need at least {MIN_LABELS} verified labels; found {len(rows)}")
    fields = [(row.get("field_code") or row.get("field_id") or "").strip() for row in rows]
    if any(not value for value in fields):
        raise RuntimeError("every training row must be linked to a field")
    if len(set(fields)) < MIN_FIELDS:
        raise RuntimeError(f"need at least {MIN_FIELDS} independent fields; found {len(set(fields))}")
    features = [
        {
            "disease_confidence": float(row["disease_confidence"]),
            "age_months": float(row["age_months"]),
            "height_cm": float(row["height_cm"]),
            "stem_count": float(row["stem_count"]),
            "root_volume_cm3_per_plant": float(row.get("root_volume_cm3_per_plant") or 0),
            "disease_class": row["disease_class"],
            "variety": row.get("variety") or "unknown",
            "season": row.get("season") or "unknown",
        }
        for row in rows
    ]
    target = np.asarray([float(row["weight_kg_per_plant"]) for row in rows], dtype=np.float64)
    if not np.all(np.isfinite(target)) or np.any((target < 0.02) | (target > 40)):
        raise RuntimeError("target weights must be finite and within 0.02-40 kg/plant")
    return features, target, np.asarray(fields)


def _matrix(rows: list[dict]) -> np.ndarray:
    return np.asarray([[row[key] for key in NUMERIC + CATEGORICAL] for row in rows], dtype=object)


def _metrics(y_true: np.ndarray, y_pred: np.ndarray) -> dict:
    relative = np.abs(y_pred - y_true) / np.maximum(np.abs(y_true), 0.1)
    return {
        "mae_kg_per_plant": round(float(mean_absolute_error(y_true, y_pred)), 5),
        "rmse_kg_per_plant": round(float(mean_squared_error(y_true, y_pred) ** 0.5), 5),
        "r2": round(float(r2_score(y_true, y_pred)), 5),
        "within_20pct": round(float(np.mean(relative <= 0.20)), 5),
        "n": int(len(y_true)),
    }


def train(input_path: Path, output_dir: Path) -> dict:
    features, target, groups = load_verified(input_path)
    matrix = _matrix(features)
    first = GroupShuffleSplit(n_splits=1, test_size=0.20, random_state=SEED)
    dev_idx, test_idx = next(first.split(matrix, target, groups))
    second = GroupShuffleSplit(n_splits=1, test_size=0.25, random_state=SEED + 1)
    train_rel, val_rel = next(second.split(matrix[dev_idx], target[dev_idx], groups[dev_idx]))
    train_idx, val_idx = dev_idx[train_rel], dev_idx[val_rel]
    columns = NUMERIC + CATEGORICAL
    numeric_idx = [columns.index(key) for key in NUMERIC]
    categorical_idx = [columns.index(key) for key in CATEGORICAL]
    preprocess = ColumnTransformer([
        ("numeric", StandardScaler(), numeric_idx),
        ("categorical", OneHotEncoder(handle_unknown="ignore", sparse_output=False), categorical_idx),
    ])
    candidates = {
        "hist_gradient_boosting": HistGradientBoostingRegressor(max_iter=400, learning_rate=0.05, l2_regularization=0.1, random_state=SEED),
        "random_forest": RandomForestRegressor(n_estimators=500, min_samples_leaf=3, max_features=0.8, n_jobs=-1, random_state=SEED),
    }
    fitted = {}
    validation = {}
    for name, estimator in candidates.items():
        pipeline = Pipeline([("preprocess", preprocess), ("regressor", estimator)])
        pipeline.fit(matrix[train_idx], target[train_idx])
        fitted[name] = pipeline
        validation[name] = _metrics(target[val_idx], pipeline.predict(matrix[val_idx]))
    winner = max(validation, key=lambda name: (validation[name]["within_20pct"], -validation[name]["mae_kg_per_plant"]))
    model = fitted[winner]
    test_metrics = _metrics(target[test_idx], model.predict(matrix[test_idx]))
    production_eligible = bool(test_metrics["within_20pct"] >= TARGET_WITHIN_20PCT and test_metrics["r2"] >= 0.60)
    output_dir.mkdir(parents=True, exist_ok=True)
    model_path = output_dir / "yield_regressor_candidate.joblib"
    joblib.dump(model, model_path)
    metadata = {
        "model_id": f"yield_{winner}_candidate",
        "feature_order": columns,
        "split": "field-grouped train/validation/sealed-test",
        "counts": {"total": len(target), "train": len(train_idx), "validation": len(val_idx), "test": len(test_idx), "fields": len(set(groups))},
        "validation": validation,
        "test": test_metrics,
        "quality_target": {"metric": "within_20pct", "threshold": TARGET_WITHIN_20PCT, "minimum_r2": 0.60},
        "production_eligible": production_eligible,
        "artifact": {"file": model_path.name, "sha256": _sha256(model_path)},
        "input_sha256": _sha256(input_path),
    }
    (output_dir / "yield_regressor_metrics.json").write_text(json.dumps(metadata, indent=2), encoding="utf-8")
    return metadata


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", type=Path, required=True)
    parser.add_argument("--output-dir", type=Path, default=Path("tmp/candidates/yield"))
    args = parser.parse_args()
    print(json.dumps(train(args.input, args.output_dir), indent=2))


if __name__ == "__main__":
    main()
