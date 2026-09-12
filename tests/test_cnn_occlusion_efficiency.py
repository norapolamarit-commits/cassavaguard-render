import numpy as np
from PIL import Image

from backend.services import ai_engine


def test_default_cnn_occlusion_uses_sixteen_masked_views(monkeypatch):
    observed = {}

    def fake_batch(images):
        observed["count"] = len(images)
        return np.tile(np.asarray([[0.1, 0.2, 0.3, 0.25, 0.15]]), (len(images), 1))

    monkeypatch.setattr(ai_engine, "cnn_predict_proba_batch", fake_batch)
    monkeypatch.setattr(ai_engine, "get_cnn_metrics", lambda: {
        "classes": ["healthy", "cbb", "cbsd", "cmd", "cgm"]
    })
    grid = ai_engine._cnn_occlusion_grid(Image.new("RGB", (160, 120), "green"), "cbsd", 0.8)
    assert observed["count"] == 16
    assert grid.shape == (4, 4)
