import datetime as dt
import io

import numpy as np
from PIL import Image

from backend.services import ai_engine, soil_engine, weather_engine
from backend.services.brown_spot_classifier import (
    brown_spot_predict_probability,
    get_brown_spot_classifier,
)
from backend.services.feature_extraction import ML_CLASS_ORDER
from backend.services.white_leaf_spot_classifier import (
    get_white_leaf_spot_classifier,
    white_leaf_spot_predict_probability,
)
from backend.services.whitefly_detector import (
    detect_whiteflies,
    get_whitefly_session,
)


def test_live_weather_response_keeps_provider_provenance(monkeypatch):
    payload = {
        "current": {
            "time": "2026-07-31T11:30",
            "temperature_2m": 30.4,
            "relative_humidity_2m": 63,
            "precipitation": 0,
            "weather_code": 3,
            "wind_speed_10m": 13.5,
            "shortwave_radiation": 800,
        },
        "daily": {
            "time": ["2026-07-31"],
            "weather_code": [95],
            "temperature_2m_max": [33.1],
            "temperature_2m_min": [24.2],
            "temperature_2m_mean": [28.2],
            "relative_humidity_2m_mean": [77],
            "precipitation_sum": [8.5],
            "wind_speed_10m_max": [20.1],
            "shortwave_radiation_sum": [18.2],
        },
    }
    monkeypatch.setattr(weather_engine, "ENVIRONMENTAL_DATA_MODE", "live")
    monkeypatch.setattr(weather_engine, "_live_payload", lambda *args, **kwargs: payload)
    result = weather_engine.current(14.97, 102.1)
    assert result["observed_at"] == "2026-07-31T11:30"
    assert result["data_source"]["provider"] == "Open-Meteo"
    assert result["data_source"]["is_observation"] is False


def test_soil_sample_endpoint_stores_only_measured_values(
    client, farmer_headers, monkeypatch
):
    field_id = client.get("/api/fields", headers=farmer_headers).json()[0]["id"]
    payload = {
        "sampled_at": dt.datetime.now(dt.UTC).isoformat(),
        "source": "lab",
        "lab_name": "Accredited Lab",
        "ph": 5.8,
        "k_ppm": 92,
    }
    response = client.post(
        f"/api/soil/{field_id}/samples",
        headers=farmer_headers,
        json=payload,
    )
    assert response.status_code == 201, response.text
    assert response.json()["ph"] == 5.8
    assert response.json()["n_ppm"] is None

    monkeypatch.setattr(soil_engine, "ENVIRONMENTAL_DATA_MODE", "live")
    profile = client.get(f"/api/soil/{field_id}", headers=farmer_headers)
    assert profile.status_code == 200
    body = profile.json()
    assert body["metrics"]["ph"] == 5.8
    assert body["metrics"]["n_ppm"] is None
    assert body["statuses"]["n_ppm"] == "unavailable"
    assert body["data_source"]["kind"] == "measured_soil_sample"


def test_ai_probability_distribution_contains_only_trained_classes():
    supplied = {
        "healthy": 0.1,
        "cbb": 0.2,
        "cbsd": 0.3,
        "cmd": 0.25,
        "cgm": 0.15,
    }
    probabilities, basis, source = ai_engine._score({}, cnn_probs=supplied)
    assert set(probabilities) == set(ML_CLASS_ORDER)
    assert abs(sum(probabilities.values()) - 1) < 1e-9
    assert basis["water_stress"] == "unsupported_no_training_data"
    assert source == "cnn"


def test_unvalidated_model_cannot_pass_automatic_action_gate():
    image = type("ImageSize", (), {"size": (256, 256)})()
    features = {
        "green_frac": 0.4,
        "yellow_frac": 0.1,
        "brown_frac": 0.05,
        "necrosis_frac": 0.01,
        "mean_val": 0.5,
        "texture_var": 0.002,
    }
    quality, reasons = ai_engine._quality_review(
        image,
        features,
        source="leaf",
        top_confidence=0.99,
        margin=0.8,
    )
    assert quality["field_validated"] is False
    assert "model_not_independently_field_validated" in reasons


def test_brown_spot_auxiliary_artifact_returns_binary_probability():
    if get_brown_spot_classifier() is None:
        return
    features = {
        "green_frac": 0.25, "yellow_frac": 0.10, "brown_frac": 0.14,
        "necrosis_frac": 0.05, "bright_spot_frac": 0.03,
        "pseudo_ndvi": 0.02, "edge_density": 0.16, "texture_var": 0.004,
        "mottle": 0.04, "streak": 0.02, "mean_sat": 0.50, "mean_val": 0.45,
    }
    cnn = {"healthy": 0.1, "cbb": 0.45, "cbsd": 0.15, "cmd": 0.1, "cgm": 0.2}
    probability = brown_spot_predict_probability(features, cnn)
    assert 0 <= probability <= 1


def test_white_spot_auxiliary_artifact_returns_binary_probability():
    if get_white_leaf_spot_classifier() is None:
        return
    features = {
        "green_frac": 0.25, "yellow_frac": 0.10, "brown_frac": 0.14,
        "necrosis_frac": 0.05, "bright_spot_frac": 0.03,
        "pseudo_ndvi": 0.02, "edge_density": 0.16, "texture_var": 0.004,
        "mottle": 0.04, "streak": 0.02, "mean_sat": 0.50, "mean_val": 0.45,
    }
    cnn = {
        "healthy": 0.1, "cbb": 0.45, "cbsd": 0.15,
        "cmd": 0.1, "cgm": 0.2,
    }
    probability = white_leaf_spot_predict_probability(features, cnn)
    assert 0 <= probability <= 1


def test_whitefly_onnx_detector_returns_box_contract():
    if get_whitefly_session() is None:
        return
    result = detect_whiteflies(Image.new("RGB", (320, 240), "green"))
    assert result["image_size"] == [320, 240]
    assert result["count"] == len(result["detections"])
    for detection in result["detections"]:
        assert len(detection["box_xyxy"]) == 4
        assert 0 <= detection["confidence"] <= 1


def test_tiny_object_path_keeps_uploaded_resolution():
    buffer = io.BytesIO()
    Image.new("RGB", (1600, 1200), "green").save(buffer, format="JPEG")
    decoded = ai_engine._load_full_resolution(buffer.getvalue())
    assert decoded.size == (1600, 1200)


def test_single_decode_classifier_thumbnail_matches_load_contract():
    """The optimized shared decode must not change classifier input pixels."""
    pixels = np.random.default_rng(20260801).integers(
        0,
        256,
        size=(713, 941, 3),
        dtype=np.uint8,
    )
    buffer = io.BytesIO()
    Image.fromarray(pixels).save(buffer, format="JPEG", quality=91)
    image_bytes = buffer.getvalue()

    expected = ai_engine._load(image_bytes)
    full_resolution = ai_engine._load_full_resolution(image_bytes)
    optimized = full_resolution.copy()
    optimized.thumbnail((ai_engine.TARGET_SIZE, ai_engine.TARGET_SIZE))

    assert optimized.size == expected.size
    assert np.array_equal(np.asarray(optimized), np.asarray(expected))
