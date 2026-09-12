"""Train real root-image phenotyping regressors from Saengwilai et al. data."""
from __future__ import annotations

import csv
import json
import re
from pathlib import Path

import joblib
import numpy as np
from sklearn.ensemble import ExtraTreesRegressor, RandomForestRegressor
from sklearn.metrics import mean_absolute_error, r2_score
from sklearn.model_selection import GroupKFold, cross_val_predict

from backend.services.root_size_model import extract_features


ROOT = Path("backend/training/data/saengwilai_cassava_2019")
OUT = Path("backend/ml_models/root_size_regressor.joblib")
PATTERN = re.compile(r"^(R5|R9|R11)\.(\d+)\.([DW])\.([ST])\.(?:JPG|jpg)$", re.I)
TARGETS = {
    "side": ["AREA(S)", "SKL_WIDTH(S)", "SKL_DEPTH(S)"],
    "top": ["AREA(T)", "WIDTH_MAX(T)", "SKL_WIDTH(T)"],
}


def train(root: Path = ROOT, output: Path = OUT) -> dict:
    with (root / "DIRT_Cassava_Field.csv").open(newline="", encoding="utf-8-sig") as handle:
        rows = list(csv.DictReader(handle))
    lookup = {(r["Genotype"], int(r["Replication #"]), r["Treatment"]): r for r in rows}
    datasets = {"side": ([], [], []), "top": ([], [], [])}
    for path in sorted((root / "cassava_field_images").iterdir()):
        match = PATTERN.match(path.name)
        if not match:
            continue
        genotype, replication, treatment_code, view_code = match.groups()
        view = "side" if view_code.upper() == "S" else "top"
        row = lookup[(genotype.upper(), int(replication), "Drought" if treatment_code.upper() == "D" else "Water")]
        targets = TARGETS[view]
        if any(not row.get(name, "").strip() for name in targets):
            continue
        x, y, groups = datasets[view]
        x.append(extract_features(path)); y.append([float(row[name]) for name in targets])
        groups.append(f"{genotype}.{replication}.{treatment_code.upper()}")
    models, evaluation, counts = {}, {}, {}
    for view, (x, y, groups) in datasets.items():
        x, y = np.asarray(x), np.asarray(y)
        candidates = {
            "extra_trees": ExtraTreesRegressor(n_estimators=500, min_samples_leaf=2, random_state=20260912, n_jobs=-1),
            "random_forest": RandomForestRegressor(n_estimators=500, min_samples_leaf=2, random_state=20260912, n_jobs=-1),
        }
        folds = GroupKFold(n_splits=5)
        scored = {}
        for name, model in candidates.items():
            predicted = cross_val_predict(model, x, y, groups=np.asarray(groups), cv=folds, n_jobs=1)
            scored[name] = {
                "mae": [round(float(mean_absolute_error(y[:, i], predicted[:, i])), 3) for i in range(y.shape[1])],
                "r2": [round(float(r2_score(y[:, i], predicted[:, i])), 3) for i in range(y.shape[1])],
            }
        winner = min(scored, key=lambda name: np.mean(scored[name]["mae"] / np.maximum(np.mean(y, axis=0), 1)))
        model = candidates[winner].fit(x, y)
        models[view] = model; evaluation[view] = {"split": "5-fold plant-grouped CV", "winner": winner, **scored[winner]}
        counts[view] = len(x)
    artifact = {"model_id": "root_size_saengwilai_v1", "models": models, "targets": TARGETS, "evaluation": evaluation, "counts": counts}
    output.parent.mkdir(parents=True, exist_ok=True); joblib.dump(artifact, output)
    metrics = {k: v for k, v in artifact.items() if k != "models"}
    output.with_suffix(".metrics.json").write_text(json.dumps(metrics, indent=2), encoding="utf-8")
    return metrics


if __name__ == "__main__":
    print(json.dumps(train(), indent=2))
