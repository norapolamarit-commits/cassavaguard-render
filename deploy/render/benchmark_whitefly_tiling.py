#!/usr/bin/env python3
"""Read-only latency/correctness benchmark for Whitefly tiled inference.

Detection counts in this report are *not* accuracy, recall, or model-quality
evidence. Quality must be measured on a leakage-safe labelled evaluation set.
"""
from __future__ import annotations

import argparse
import json
import statistics
import sys
import time
from pathlib import Path

from PIL import Image

REPO_ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(REPO_ROOT))

from backend.services.whitefly_detector import detect_whiteflies


def _benchmark(image: Image.Image, use_tiling: bool, iterations: int) -> dict:
    samples = []
    results = []
    for _ in range(iterations):
        started = time.perf_counter()
        result = detect_whiteflies(image, use_tiling=use_tiling)
        samples.append((time.perf_counter() - started) * 1000)
        results.append(result)
    final = results[-1]
    boxes_in_bounds = all(
        0.0 <= row["box_xyxy"][0] < row["box_xyxy"][2] <= image.width
        and 0.0 <= row["box_xyxy"][1] < row["box_xyxy"][3] <= image.height
        for row in final["detections"]
    )
    return {
        "median_ms": round(statistics.median(samples), 2),
        "runs_ms": [round(value, 2) for value in samples],
        "detections_reported_not_accuracy": final["count"],
        "candidate_count": final["candidate_count"],
        "tile_count": final["tile_count"],
        "detection_capacity": final["detection_capacity"],
        "deterministic_across_runs": all(
            result["detections"] == results[0]["detections"]
            for result in results[1:]
        ),
        "all_boxes_in_source_bounds": boxes_in_bounds,
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("image", type=Path)
    parser.add_argument("--iterations", type=int, default=3)
    args = parser.parse_args()
    if args.iterations < 2:
        parser.error("--iterations must be at least 2")
    if not args.image.is_file():
        parser.error(f"image does not exist: {args.image}")

    with Image.open(args.image) as source:
        image = source.convert("RGB")

    # Warm the provider once so both modes measure inference rather than import/load.
    detect_whiteflies(image, use_tiling=False)
    report = {
        "image": str(args.image),
        "image_size": [image.width, image.height],
        "quality_evaluation": False,
        "warning": (
            "Counts are runtime observations only; do not interpret them as "
            "accuracy/recall improvement."
        ),
        "single_letterbox": _benchmark(image, False, args.iterations),
        "tiled": _benchmark(image, True, args.iterations),
    }
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
