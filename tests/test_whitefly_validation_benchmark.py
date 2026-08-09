"""Safety and metric-contract tests for the validation-only Whitefly audit."""
from pathlib import Path

import pytest

from work.whitefly_validation_benchmark import (
    _assert_validation_only,
    _metrics,
    _positions,
)


def test_benchmark_refuses_any_path_containing_test(tmp_path):
    root = tmp_path / "test_dataset"
    (root / "images" / "val").mkdir(parents=True)
    (root / "labels" / "val").mkdir(parents=True)
    with pytest.raises(SystemExit, match="containing 'test'"):
        _assert_validation_only(root)


def test_acceptance_requires_precision_recall_and_f1_at_least_075():
    passing = _metrics([(0.9, 1)] * 80 + [(0.8, 0)] * 20, ground_truth_count=100)
    assert passing["precision"] == pytest.approx(1.0)
    assert passing["recall"] == pytest.approx(0.8)
    assert passing["f1"] == pytest.approx(8 / 9)
    assert passing["acceptance_met"] is True

    recall_failure = _metrics(
        [(0.9, 1)] * 70 + [(0.8, 0)] * 10,
        ground_truth_count=100,
    )
    assert recall_failure["precision"] > 0.75
    assert recall_failure["recall"] < 0.75
    assert recall_failure["acceptance_met"] is False


def test_tile_positions_cover_image_end_deterministically():
    positions = _positions(length=4000, tile=1024, overlap=0.20)
    assert positions[0] == 0
    assert positions[-1] == 4000 - 1024
    assert positions == _positions(length=4000, tile=1024, overlap=0.20)
    assert all(second > first for first, second in zip(positions, positions[1:]))
