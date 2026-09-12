"""Train a volume-to-fresh-root-weight model from paired Thai measurements.

Source: Sunvittayakul et al. (2022), Supplementary Table S2,
https://doi.org/10.1038/s41598-022-14325-4 (CC BY 4.0).
"""
from __future__ import annotations

import csv
import json
from pathlib import Path

import joblib
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import LeaveOneGroupOut, cross_val_predict

ROOT = Path(__file__).resolve().parents[2]
DATA = Path(__file__).parent / "data" / "cassava_3d_weight_2022.csv"
MODEL = ROOT / "backend" / "ml_models" / "root_weight_regressor.joblib"
METRICS = ROOT / "backend" / "ml_models" / "root_weight_regressor.metrics.json"


def train() -> dict:
    with DATA.open(newline="", encoding="utf-8") as handle:
        rows = list(csv.DictReader(handle))
    x = np.asarray([[float(row["volume_cm3"])] for row in rows])
    y = np.asarray([float(row["fresh_root_weight_kg"]) for row in rows])
    groups = np.asarray([row["cultivar"] for row in rows])
    model = LinearRegression(positive=True)
    prediction = cross_val_predict(model, x, y, groups=groups, cv=LeaveOneGroupOut())
    residual = np.abs(y - prediction)
    metrics = {
        "model_id": "thai_root_volume_weight_v1",
        "samples": len(rows),
        "cultivars": len(set(groups)),
        "validation": "leave-one-cultivar-out",
        "mae_kg": round(float(mean_absolute_error(y, prediction)), 4),
        "rmse_kg": round(float(mean_squared_error(y, prediction) ** 0.5), 4),
        "r2": round(float(r2_score(y, prediction)), 4),
        "within_20_percent": round(float(np.mean(residual / y <= 0.20)), 4),
        "prediction_interval_abs_error_p95_kg": round(float(np.quantile(residual, 0.95)), 4),
        "volume_range_cm3": [float(x.min()), float(x.max())],
        "source_doi": "10.1038/s41598-022-14325-4",
        "source_table": "Supplementary Table S2",
    }
    model.fit(x, y)
    MODEL.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump({"model": model, "metrics": metrics}, MODEL)
    METRICS.write_text(json.dumps(metrics, indent=2) + "\n", encoding="utf-8")
    return metrics


if __name__ == "__main__":
    print(json.dumps(train(), indent=2))
