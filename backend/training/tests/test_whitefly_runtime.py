"""Focused runtime contracts for the Whitefly ONNX adapter."""
from __future__ import annotations

import numpy as np
import pytest
from PIL import Image

from backend.services import whitefly_detector


class _Input:
    name = "images"


class _FakeSession:
    def __init__(self, rows: list[list[float]]) -> None:
        self.output = np.asarray([[*rows]], dtype=np.float32)

    def get_inputs(self):
        return [_Input()]

    def run(self, _outputs, _feeds):
        return [self.output]


class _SequencedFakeSession:
    def __init__(self, outputs: list[list[list[float]]]) -> None:
        self.outputs = [np.asarray([rows], dtype=np.float32) for rows in outputs]
        self.calls = []

    def get_inputs(self):
        return [_Input()]

    def run(self, _outputs, feeds):
        self.calls.append(next(iter(feeds.values())).shape)
        return [self.outputs[len(self.calls) - 1]]


def _install_runtime(monkeypatch, rows):
    metrics = {
        "input": {"image_size": 100, "max_detections": 3},
        "runtime_threshold": {
            "value": 0.5,
            "selection_set": "validation",
            "test_used_for_selection": False,
        },
    }
    monkeypatch.setattr(
        whitefly_detector,
        "get_whitefly_session",
        lambda: _FakeSession(rows),
    )
    monkeypatch.setattr(
        whitefly_detector,
        "get_whitefly_metrics",
        lambda: metrics,
    )


def _install_sequenced_runtime(monkeypatch, outputs):
    session = _SequencedFakeSession(outputs)
    # Small deterministic geometry: a 200px source tile for a 100px model input.
    monkeypatch.setattr(whitefly_detector, "SOURCE_TILE_SCALE", 2)
    metrics = {
        "input": {"image_size": 100, "max_detections": 3},
        "runtime_threshold": {
            "value": 0.5,
            "selection_set": "validation",
            "test_used_for_selection": False,
        },
    }
    monkeypatch.setattr(
        whitefly_detector,
        "get_whitefly_session",
        lambda: session,
    )
    monkeypatch.setattr(
        whitefly_detector,
        "get_whitefly_metrics",
        lambda: metrics,
    )
    return session


def test_whitefly_runtime_maps_letterbox_and_reports_real_truncation(monkeypatch):
    _install_runtime(monkeypatch, [
        [10, 30, 20, 40, 0.9, 0],
        [30, 35, 40, 45, 0.8, 0],
        [50, 30, 60, 40, 0.7, 0],
    ])
    result = whitefly_detector.detect_whiteflies(
        Image.new("RGB", (100, 50)),
        limit=2,
    )
    assert result["count"] == 2
    assert result["truncated"] is True
    assert result["detections"][0]["box_xyxy"] == [10.0, 5.0, 20.0, 15.0]


def test_whitefly_runtime_exact_limit_is_not_reported_as_truncated(monkeypatch):
    _install_runtime(monkeypatch, [
        [10, 30, 20, 40, 0.9, 0],
        [30, 35, 40, 45, 0.8, 0],
        [50, 30, 60, 40, 0.4, 0],
    ])
    result = whitefly_detector.detect_whiteflies(
        Image.new("RGB", (100, 50)),
        limit=2,
    )
    assert result["count"] == 2
    assert result["truncated"] is False


@pytest.mark.parametrize(
    ("kwargs", "message"),
    [
        ({"confidence": -0.1}, "confidence"),
        ({"confidence": 1.1}, "confidence"),
        ({"limit": 0}, "limit"),
        ({"limit": True}, "limit"),
        ({"use_tiling": "yes"}, "use_tiling"),
    ],
)
def test_whitefly_runtime_rejects_invalid_controls(monkeypatch, kwargs, message):
    _install_runtime(monkeypatch, [[0, 0, 1, 1, 0.9, 0]] * 3)
    with pytest.raises(ValueError, match=message):
        whitefly_detector.detect_whiteflies(Image.new("RGB", (10, 10)), **kwargs)


def test_tile_plan_covers_full_image_and_is_bounded():
    tiles = whitefly_detector._tile_plan(
        10_000,
        7_500,
        100,
        max_tiles=7,
    )

    assert 1 < len(tiles) <= 7
    assert min(tile[0] for tile in tiles) == 0
    assert min(tile[1] for tile in tiles) == 0
    assert max(tile[2] for tile in tiles) == 10_000
    assert max(tile[3] for tile in tiles) == 7_500
    for axis_start, axis_end in ((0, 2), (1, 3)):
        spans = sorted({(tile[axis_start], tile[axis_end]) for tile in tiles})
        for previous, current in zip(spans, spans[1:]):
            assert current[0] <= previous[1]


def test_runtime_uses_metadata_training_tile_size(monkeypatch):
    session = _SequencedFakeSession([[], [], [], [], [], []])
    metrics = {
        "input": {"image_size": 640, "max_detections": 3},
        "tiling": {"tile_size": 1000},
        "runtime_threshold": {"value": 0.5},
    }
    monkeypatch.setattr(whitefly_detector, "get_whitefly_session", lambda: session)
    monkeypatch.setattr(whitefly_detector, "get_whitefly_metrics", lambda: metrics)

    result = whitefly_detector.detect_whiteflies(Image.new("RGB", (3000, 1000)))

    assert result["source_tile_size"] == 1000
    assert result["tile_count"] == 4
    assert session.calls == [(1, 3, 640, 640)] * 4


def test_tile_plan_bounds_crop_area_for_extreme_aspect_ratio():
    # 25M pixels mirrors the default upload pixel limit but stresses a pathological
    # panorama. The bounded grid must not turn it into one giant temporary crop.
    tiles = whitefly_detector._tile_plan(
        25_000_000,
        1,
        640,
        max_tiles=32,
    )

    assert len(tiles) == 32
    assert max((x1 - x0) * (y1 - y0) for x0, y0, x1, y1 in tiles) < 1_000_000
    assert tiles[0][0] == 0
    assert tiles[-1][2] == 25_000_000


def test_tiled_runtime_maps_boxes_and_deduplicates_overlap(monkeypatch):
    session = _install_sequenced_runtime(monkeypatch, [
        [
            [85, 30, 95, 40, 0.9, 0],  # global [170,10,190,30]
            [10, 30, 20, 40, 0.7, 0],  # global [20,10,40,30]
        ],
        [
            [10, 30, 20, 40, 0.8, 0],  # same global box from overlap
            [80, 30, 90, 40, 0.6, 0],  # global [310,10,330,30]
        ],
    ])

    result = whitefly_detector.detect_whiteflies(
        Image.new("RGB", (350, 100)),
    )

    assert result["tiled"] is True
    assert result["tile_count"] == 2
    assert result["candidate_count"] == 4
    assert result["count"] == 3
    assert result["detections"] == [
        {"box_xyxy": [170.0, 10.0, 190.0, 30.0], "confidence": 0.9},
        {"box_xyxy": [20.0, 10.0, 40.0, 30.0], "confidence": 0.7},
        {"box_xyxy": [310.0, 10.0, 330.0, 30.0], "confidence": 0.6},
    ]
    assert session.calls == [(1, 3, 100, 100), (1, 3, 100, 100)]


def test_tiled_runtime_scales_default_detection_capacity(monkeypatch):
    rows = [
        [5, 30, 10, 40, 0.9, 0],
        [25, 30, 30, 40, 0.8, 0],
        [50, 30, 55, 40, 0.7, 0],
    ]
    _install_sequenced_runtime(monkeypatch, [rows, rows])

    result = whitefly_detector.detect_whiteflies(
        Image.new("RGB", (350, 100)),
    )

    assert result["tile_count"] == 2
    assert result["detection_capacity"] == 6
    assert result["count"] == 6
    assert result["truncated"] is False


def test_explicit_limit_applies_after_cross_tile_nms(monkeypatch):
    rows = [
        [5, 30, 10, 40, 0.9, 0],
        [25, 30, 30, 40, 0.8, 0],
        [50, 30, 55, 40, 0.7, 0],
    ]
    _install_sequenced_runtime(monkeypatch, [rows, rows])

    result = whitefly_detector.detect_whiteflies(
        Image.new("RGB", (350, 100)),
        limit=4,
    )

    assert result["count"] == 4
    assert result["truncated"] is True
