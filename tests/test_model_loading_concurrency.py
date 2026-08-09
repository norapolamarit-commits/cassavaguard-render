import threading
import time
from concurrent.futures import ThreadPoolExecutor

import pytest

from backend.services import (
    brown_spot_classifier,
    cnn_classifier,
    fusion_classifier,
    ml_classifier,
    white_leaf_spot_classifier,
    whitefly_detector,
)


@pytest.mark.parametrize(
    ("module", "model_getter", "metrics_getter", "model_attr"),
    [
        (cnn_classifier, "get_cnn_session", "get_cnn_metrics", "_session"),
        (
            brown_spot_classifier,
            "get_brown_spot_classifier",
            "get_brown_spot_metrics",
            "_classifier",
        ),
        (
            white_leaf_spot_classifier,
            "get_white_leaf_spot_classifier",
            "get_white_leaf_spot_metrics",
            "_classifier",
        ),
        (
            whitefly_detector,
            "get_whitefly_session",
            "get_whitefly_metrics",
            "_session",
        ),
        (ml_classifier, "get_classifier", "get_metrics", "_classifier"),
        (
            fusion_classifier,
            "get_fusion_classifier",
            "get_fusion_metrics",
            "_classifier",
        ),
    ],
)
def test_lazy_model_getters_wait_for_an_inflight_load(
    monkeypatch,
    module,
    model_getter,
    metrics_getter,
    model_attr,
):
    """A concurrent metadata request must not cache/observe a half-loaded head."""
    entered = threading.Event()
    release = threading.Event()
    model = object()
    metrics = {"status": "ready"}

    monkeypatch.setattr(module, "_loaded", False)
    monkeypatch.setattr(module, model_attr, None)
    monkeypatch.setattr(module, "_metrics", None)

    def slow_load():
        if module._loaded:
            return
        module._loaded = True
        entered.set()
        assert release.wait(timeout=2)
        setattr(module, model_attr, model)
        module._metrics = metrics

    monkeypatch.setattr(module, "_load", slow_load)
    with ThreadPoolExecutor(max_workers=2) as pool:
        model_future = pool.submit(getattr(module, model_getter))
        assert entered.wait(timeout=1)
        metrics_future = pool.submit(getattr(module, metrics_getter))
        try:
            time.sleep(0.03)
            assert not metrics_future.done()
        finally:
            release.set()
        assert model_future.result(timeout=1) is model
        assert metrics_future.result(timeout=1) is metrics
