import json
import hashlib

from backend.config import BASE_DIR


def test_offline_model_metadata_is_pinned_and_review_only(client):
    response = client.get("/api/models/offline-info")
    assert response.status_code == 200, response.text
    payload = response.json()
    metrics_path = BASE_DIR / "backend" / "ml_models" / "cnn_metrics.json"
    model_path = BASE_DIR / "backend" / "ml_models" / "cnn_primary.onnx"
    meta = json.loads(metrics_path.read_text(encoding="utf-8"))
    expected_sha256 = hashlib.sha256(model_path.read_bytes()).hexdigest()

    assert payload["model_id"] == "cnn_efficientnet_b3"
    assert payload["classes"] == ["healthy", "cbb", "cbsd", "cmd", "cgm"]
    assert payload["img_size"] == 300
    assert payload["input_name"] == "image"
    assert payload["input_layout"] == "NCHW"
    assert payload["pipeline"] == "field_robust"
    assert payload["temperature"] == meta["temperature"]
    assert payload["sha256"] == expected_sha256 == meta["artifacts"]["onnx"]["sha256"]
    assert payload["size_bytes"] == model_path.stat().st_size
    assert payload["release_scope"] == "review_only"
    assert payload["production_eligible"] is False

    wasm = client.head("/dist/ort/ort-wasm-simd-threaded.wasm")
    assert wasm.status_code == 200
    assert int(wasm.headers["content-length"]) == 14_239_897
