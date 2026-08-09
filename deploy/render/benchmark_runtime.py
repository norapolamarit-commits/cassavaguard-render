#!/usr/bin/env python3
"""Repeatable, read-only benchmark for deployment runtime hot paths.

This intentionally does not call the training pipeline or rewrite model metadata.
It measures the production CNN artifact and verifies that the shared image decode
produces byte-identical classifier pixels to the legacy double-decode path.
"""
from __future__ import annotations

import argparse
import hashlib
import io
import json
import platform
import statistics
import sys
import time
from pathlib import Path

import numpy as np
from PIL import Image

REPO_ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(REPO_ROOT))

from backend.services.ai_engine import _load_full_resolution
from backend.services.cnn_classifier import cnn_predict_proba, get_cnn_session
from backend.services.feature_extraction import TARGET_SIZE, load_image


def _median_ms(samples: list[float]) -> float:
    return round(statistics.median(samples), 2)


def _timed(callable_, iterations: int) -> tuple[list[float], object]:
    samples = []
    result = None
    for _ in range(iterations):
        started = time.perf_counter()
        result = callable_()
        samples.append((time.perf_counter() - started) * 1000)
    return samples, result


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--iterations", type=int, default=10)
    args = parser.parse_args()
    if args.iterations < 3:
        parser.error("--iterations must be at least 3")

    rng = np.random.default_rng(20260801)
    pixels = rng.integers(0, 256, size=(1200, 1600, 3), dtype=np.uint8)
    upload = io.BytesIO()
    Image.fromarray(pixels).save(upload, format="JPEG", quality=88)
    image_bytes = upload.getvalue()

    def legacy_double_decode():
        full = _load_full_resolution(image_bytes)
        thumbnail = load_image(image_bytes)
        return full, thumbnail

    def shared_decode():
        full = _load_full_resolution(image_bytes)
        thumbnail = full.copy()
        thumbnail.thumbnail((TARGET_SIZE, TARGET_SIZE))
        return full, thumbnail

    # One unmeasured pass avoids comparing a first-time Pillow import/plugin cost.
    legacy_double_decode()
    shared_decode()
    legacy_ms, legacy_result = _timed(legacy_double_decode, args.iterations)
    shared_ms, shared_result = _timed(shared_decode, args.iterations)
    legacy_thumbnail = np.asarray(legacy_result[1])
    shared_thumbnail = np.asarray(shared_result[1])

    load_started = time.perf_counter()
    session = get_cnn_session()
    cnn_load_ms = (time.perf_counter() - load_started) * 1000
    if session is None:
        raise RuntimeError("verified CNN runtime is unavailable")

    image = shared_result[1]
    cnn_predict_proba(image)  # warm execution/provider caches
    cnn_ms, probabilities = _timed(
        lambda: cnn_predict_proba(image),
        args.iterations,
    )
    probability_bytes = json.dumps(
        probabilities,
        sort_keys=True,
        separators=(",", ":"),
    ).encode()

    report = {
        "platform": platform.platform(),
        "python": platform.python_version(),
        "iterations": args.iterations,
        "upload": {
            "width": pixels.shape[1],
            "height": pixels.shape[0],
            "jpeg_bytes": len(image_bytes),
        },
        "decode": {
            "legacy_double_decode_median_ms": _median_ms(legacy_ms),
            "shared_decode_median_ms": _median_ms(shared_ms),
            "classifier_pixels_identical": bool(
                np.array_equal(legacy_thumbnail, shared_thumbnail)
            ),
            "classifier_pixels_sha256": hashlib.sha256(
                shared_thumbnail.tobytes()
            ).hexdigest(),
        },
        "cnn": {
            "cold_load_and_contract_ms": round(cnn_load_ms, 2),
            "repeated_inference_median_ms": _median_ms(cnn_ms),
            "repeated_inference_max_ms": round(max(cnn_ms), 2),
            "probability_output_sha256": hashlib.sha256(
                probability_bytes
            ).hexdigest(),
        },
    }
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
