from backend.services.root_weight_model import predict_from_volume


def test_root_weight_model_returns_measured_data_provenance():
    result = predict_from_volume(4000, 10)
    per_plant = result["estimated_fresh_root_weight_kg_per_plant"]
    assert per_plant["low"] < per_plant["midpoint"] < per_plant["high"]
    assert result["estimated_total_weight_kg"]["midpoint"] == round(per_plant["midpoint"] * 10, 2)
    assert result["model"]["validation"] == "leave-one-cultivar-out"
    assert result["model"]["source_doi"] == "10.1038/s41598-022-14325-4"


def test_root_weight_model_marks_extrapolation():
    assert predict_from_volume(10000)["in_training_domain"] is False
