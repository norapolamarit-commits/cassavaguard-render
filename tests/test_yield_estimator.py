import pytest

from backend.database import SessionLocal
from backend.models import Prediction, User
from backend.services.yield_estimator import YieldInputs, estimate


def test_yield_estimator_returns_ordered_bounded_range_and_provenance():
    result = estimate(YieldInputs(10, 220, 1, "healthy", 0.9))
    weight = result["estimated_fresh_root_weight_kg_per_plant"]
    size = result["estimated_root_size"]
    assert 0 < weight["low"] < weight["midpoint"] < weight["high"] <= 20
    assert result["method"]["trained_model"] is False
    assert result["method"]["reference_records"] == 216
    assert result["method"]["reference_doi"] == "10.17632/gh2nfyyknj.1"
    assert result["quality_gate"]["production_eligible"] is False
    assert result["quality_gate"]["requires_measured_harvest_weight"] is True
    size = result["estimated_root_size"]
    assert size["size_class"] in {"small", "medium", "large"}
    assert 3 <= size["root_count"] <= 12
    assert size["length_cm"]["low"] < size["length_cm"]["midpoint"] < size["length_cm"]["high"]
    assert size["diameter_cm"]["low"] < size["diameter_cm"]["midpoint"] < size["diameter_cm"]["high"]
    assert size["measured_from_image"] is False


def test_disease_scenario_is_lower_than_healthy_with_same_observations():
    healthy = estimate(YieldInputs(10, 220, 1, "healthy", 0.9))
    diseased = estimate(YieldInputs(10, 220, 1, "cbsd", 0.9))
    key = "estimated_fresh_root_weight_kg_per_plant"
    assert diseased[key]["midpoint"] < healthy[key]["midpoint"]


@pytest.mark.parametrize("inputs", [
    YieldInputs(2, 220, 1, "healthy", 0.8),
    YieldInputs(10, 20, 1, "healthy", 0.8),
    YieldInputs(10, 220, 0, "healthy", 0.8),
    YieldInputs(10, 220, 1, "healthy", 1.2),
])
def test_yield_estimator_rejects_out_of_range_observations(inputs):
    with pytest.raises(ValueError):
        estimate(inputs)


def test_yield_and_verified_measurement_endpoints(client, farmer_headers):
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == "farmer@cassavaguard.ai").one()
        prediction = Prediction(
            source="leaf", filename="paired-label.jpg", top_class="cbsd",
            confidence=0.8, user_id=user.id, model_id="test-model",
        )
        db.add(prediction); db.commit(); db.refresh(prediction)
        prediction_id = prediction.id
    finally:
        db.close()

    scenario = client.post("/api/predict/yield-estimate", headers=farmer_headers, json={
        "prediction_id": prediction_id, "age_months": 10,
        "height_cm": 220, "stem_count": 1,
    })
    assert scenario.status_code == 200, scenario.text
    assert scenario.json()["prediction_id"] == prediction_id
    assert scenario.json()["method"]["trained_model"] is False

    payload = {
        "prediction_id": prediction_id, "age_months": 10,
        "height_cm": 220, "stem_count": 1,
        "total_fresh_root_weight_kg": 12.0,
        "harvested_plant_count": 4,
        "notes": "Destructive sample",
    }
    saved = client.post("/api/predict/harvest-measurements", headers=farmer_headers, json=payload)
    assert saved.status_code == 201, saved.text
    assert saved.json()["weight_kg_per_plant"] == 3.0
    assert saved.json()["label_status"] == "verified_user_measurement"
    duplicate = client.post("/api/predict/harvest-measurements", headers=farmer_headers, json=payload)
    assert duplicate.status_code == 409
