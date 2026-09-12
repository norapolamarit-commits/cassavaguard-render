import csv

import pytest

from backend.training.train_yield_regressor import MIN_LABELS, load_verified, train


FIELDS = [
    "measurement_id", "prediction_id", "field_id", "model_id", "disease_class",
    "disease_confidence", "age_months", "height_cm", "stem_count",
    "total_fresh_root_weight_kg", "harvested_plant_count", "weight_kg_per_plant",
]


def _write(path, count, fields=10):
    with path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=FIELDS)
        writer.writeheader()
        for index in range(count):
            age = 7 + index % 6
            height = 160 + (index % 8) * 15
            confidence = 0.55 + (index % 4) * 0.1
            disease = "healthy" if index % 3 else "cbsd"
            weight = (0.35 * age + 0.008 * height) * (1 if disease == "healthy" else 0.72)
            writer.writerow({
                "measurement_id": index + 1, "prediction_id": index + 1,
                "field_id": (index % fields) + 1, "model_id": "test",
                "disease_class": disease, "disease_confidence": confidence,
                "age_months": age, "height_cm": height, "stem_count": 1 + index % 2,
                "total_fresh_root_weight_kg": weight * 4, "harvested_plant_count": 4,
                "weight_kg_per_plant": weight,
            })


def test_yield_training_fails_closed_with_too_few_labels(tmp_path):
    source = tmp_path / "labels.csv"
    _write(source, MIN_LABELS - 1)
    with pytest.raises(RuntimeError, match="verified labels"):
        load_verified(source)


def test_yield_training_writes_candidate_with_grouped_test_metrics(tmp_path):
    source = tmp_path / "labels.csv"
    output = tmp_path / "candidate"
    _write(source, MIN_LABELS)
    metrics = train(source, output)
    assert metrics["split"] == "field-grouped train/validation/sealed-test"
    assert metrics["counts"]["fields"] == 10
    assert metrics["test"]["n"] > 0
    assert (output / "yield_regressor_candidate.joblib").is_file()
    assert (output / "yield_regressor_metrics.json").is_file()
