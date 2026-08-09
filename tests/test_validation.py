def test_satellite_dates_are_validated(client, farmer_headers):
    field_id = client.get("/api/fields", headers=farmer_headers).json()[0]["id"]
    response = client.get(
        f"/api/satellite/{field_id}/grid?date=not-a-date",
        headers=farmer_headers,
    )
    assert response.status_code == 422


def test_weather_coordinates_must_be_complete_and_in_range(client, farmer_headers):
    assert (
        client.get("/api/weather/current?lat=14.9", headers=farmer_headers).status_code
        == 422
    )
    assert (
        client.get(
            "/api/weather/current?lat=100&lon=102",
            headers=farmer_headers,
        ).status_code
        == 422
    )


def test_csv_requires_a_supported_sensor_column(client, farmer_headers):
    response = client.post(
        "/api/predict/csv",
        headers=farmer_headers,
        files={"file": ("bad.csv", b"unknown\n123\n", "text/csv")},
    )
    assert response.status_code == 422


def test_system_status_separates_trained_and_heuristic_classes(
    client, farmer_headers
):
    response = client.get("/api/models/system", headers=farmer_headers)
    assert response.status_code == 200
    dataset = response.json()["dataset"]
    assert dataset["classes"] >= 5
    assert dataset["primary_classes"] == 5
    assert dataset["auxiliary_classes"] in {0, 1}
    assert dataset["display_classes"] == 13
    assert dataset["heuristic_classes"] == 0
    assert dataset["reference_only_classes"] == 13 - dataset["classes"]
    assert dataset["field_validated"] is False


def test_model_readiness_discloses_all_classes(client):
    response = client.get("/api/models/readiness")
    assert response.status_code == 200
    payload = response.json()
    assert payload["summary"]["display_classes"] == 13
    assert payload["summary"]["serving_classes"] >= 5
    rows = {item["key"]: item for item in payload["classes"]}
    assert rows["healthy"]["production_output"] is True
    assert rows["brown_leaf_spot"]["status"] in {
        "dataset_available_training_required",
        "serving_trained_auxiliary_model",
    }
    assert rows["brown_leaf_spot"]["dataset"]["license"] == "CC BY 4.0"
    assert rows["whitefly"]["task"] == "object_detection_and_counting"
    assert rows["whitefly"]["dataset"]["images"] == 3000
    assert rows["whitefly"]["status"] in {
        "real_dataset_downloaded_detector_training_required",
        "serving_experimental_detector",
        "serving_review_only_detector",
    }
    if rows["whitefly"]["status"] in {
        "serving_experimental_detector",
        "serving_review_only_detector",
    }:
        assert rows["whitefly"]["production_output"] is False
        assert 0 <= rows["whitefly"]["evaluation"]["map50"] <= 1
        assert rows["whitefly"]["evaluation"]["set"] in {"validation", "test"}
        assert rows["whitefly"]["evaluation_warning"]["status"] in {
            "legacy_split_retrain_required",
            "validation_only_below_target",
        }
    assert rows["cad"]["production_output"] is False


def test_model_self_test_executes_every_published_model(
    client, farmer_headers
):
    response = client.get("/api/models/self-test", headers=farmer_headers)
    assert response.status_code == 200
    payload = response.json()
    assert payload["status"] == "ok"
    assert payload["ready_models"] == payload["total_models"]
    assert payload["total_models"] >= 15
    fusion_models = [
        model for model in payload["models"]
        if model["id"].startswith("fusion_")
    ]
    # fusion_extra_trees is an optional >100 MB standby artifact and is omitted
    # from the GitHub/Render bundle; all compact published heads must still run.
    assert len(fusion_models) >= 4
    assert all(model["experimental"] is True for model in fusion_models)
    assert all(model["serving_eligible"] is False for model in fusion_models)
    for model in payload["models"]:
        assert model["status"] == "ready"
        assert model["classes"] in (
            ["healthy", "cbb", "cbsd", "cmd", "cgm"],
            ["other", "brown_leaf_spot"],
            ["other", "white_leaf_spot"],
            ["whitefly"],
        )
