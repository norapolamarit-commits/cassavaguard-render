#!/usr/bin/env python3
"""Fail-fast check for the exact AI heads expected by the Render deployment."""
from __future__ import annotations

import json
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(REPO_ROOT))

from backend.config import (
    AI_FIELD_VALIDATED,
    AI_SERVING_MODE,
    APP_ENV,
    USE_CNN,
)
from backend.services.brown_spot_classifier import get_brown_spot_classifier
from backend.services.cnn_classifier import get_cnn_session
from backend.services.white_leaf_spot_classifier import (
    get_white_leaf_spot_classifier,
)
from backend.services.whitefly_detector import get_whitefly_session


def verify_runtime() -> dict:
    """Load and validate every Render AI head in the current process.

    Keeping this callable separate from ``main`` lets ``serve.py`` perform the
    fail-fast deployment check before starting Uvicorn without throwing the warm
    ONNX/sklearn sessions away in a short-lived subprocess.
    """
    if APP_ENV != "production":
        raise RuntimeError("Render bundle requires APP_ENV=production")
    if AI_SERVING_MODE != "review_only":
        raise RuntimeError("Render bundle requires AI_SERVING_MODE=review_only")
    if AI_FIELD_VALIDATED:
        raise RuntimeError("AI_FIELD_VALIDATED must remain false in review-only mode")
    if not USE_CNN:
        raise RuntimeError("Render bundle requires USE_CNN=true")

    heads = {
        "cnn_efficientnet_b0": get_cnn_session() is not None,
        "brown_leaf_spot": get_brown_spot_classifier() is not None,
        "white_leaf_spot_review_only": get_white_leaf_spot_classifier() is not None,
        "whitefly_review_only": get_whitefly_session() is not None,
    }
    unavailable = [name for name, ready in heads.items() if not ready]
    if unavailable:
        raise RuntimeError(f"required runtime model(s) unavailable: {unavailable}")
    return {"status": "ok", "ai_serving_mode": AI_SERVING_MODE, "heads": heads}


def main() -> None:
    print(json.dumps(verify_runtime()))


if __name__ == "__main__":
    main()
