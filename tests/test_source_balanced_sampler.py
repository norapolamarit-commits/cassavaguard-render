from collections import defaultdict

import pytest

from backend.training.train_cnn_torch import _class_source_sample_weights


def test_class_source_weights_equalize_classes_and_sources():
    labels = [0] * 2 + [0] * 6 + [1] * 3
    sources = ["official"] * 2 + ["external"] * 6 + ["official"] * 3
    weights = _class_source_sample_weights(labels, sources)

    by_class = defaultdict(float)
    by_cell = defaultdict(float)
    for label, source, weight in zip(labels, sources, weights):
        by_class[label] += weight
        by_cell[(label, source)] += weight

    assert by_class[0] == pytest.approx(by_class[1])
    assert by_cell[(0, "official")] == pytest.approx(by_cell[(0, "external")])


def test_class_source_weights_reject_misaligned_input():
    with pytest.raises(ValueError):
        _class_source_sample_weights([0], [])
