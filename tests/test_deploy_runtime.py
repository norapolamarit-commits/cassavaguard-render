"""Render runtime verification must warm models without changing its fail-fast gate."""

import pytest

from deploy.render import verify_runtime as runtime_check


def _valid_environment(monkeypatch):
    monkeypatch.setattr(runtime_check, "APP_ENV", "production")
    monkeypatch.setattr(runtime_check, "AI_SERVING_MODE", "review_only")
    monkeypatch.setattr(runtime_check, "AI_FIELD_VALIDATED", False)
    monkeypatch.setattr(runtime_check, "USE_CNN", True)
    monkeypatch.setattr(runtime_check, "get_cnn_session", lambda: object())
    monkeypatch.setattr(runtime_check, "get_brown_spot_classifier", lambda: object())
    monkeypatch.setattr(runtime_check, "get_white_leaf_spot_classifier", lambda: object())
    monkeypatch.setattr(runtime_check, "get_whitefly_session", lambda: object())


def test_verify_runtime_returns_warmed_head_status(monkeypatch):
    _valid_environment(monkeypatch)

    result = runtime_check.verify_runtime()

    assert result["status"] == "ok"
    assert result["ai_serving_mode"] == "review_only"
    assert all(result["heads"].values())


def test_verify_runtime_remains_fail_closed(monkeypatch):
    _valid_environment(monkeypatch)
    monkeypatch.setattr(runtime_check, "get_cnn_session", lambda: None)

    with pytest.raises(RuntimeError, match="cnn_efficientnet_b2"):
        runtime_check.verify_runtime()
