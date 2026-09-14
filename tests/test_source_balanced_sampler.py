from collections import defaultdict

import pytest

from backend.training.train_cnn_torch import _class_source_sample_weights


def test_class_source_weights_equalize_classes_and_sources():
    labels = [0] * 2 + [0] * 6 + [1] * 3
    sources = ["official_tfds"] * 2 + ["external"] * 6 + ["official_tfds"] * 3
    weights = _class_source_sample_weights(labels, sources)

    by_class = defaultdict(float)
    by_cell = defaultdict(float)
    for label, source, weight in zip(labels, sources, weights):
        by_class[label] += weight
        by_cell[(label, source)] += weight

    assert by_class[0] == pytest.approx(by_class[1])
    assert by_cell[(0, "official_tfds")] == pytest.approx(by_cell[(0, "external")])


def test_external_share_is_capped_for_small_cross_domain_source():
    labels = [0] * 100 + [0] * 5
    sources = ["official_tfds"] * 100 + ["external_1"] * 5
    weights = _class_source_sample_weights(labels, sources, max_external_share=0.2)

    official_mass = sum(w for w, s in zip(weights, sources) if s == "official_tfds")
    external_mass = sum(w for w, s in zip(weights, sources) if s == "external_1")
    assert official_mass == pytest.approx(0.8)
    assert external_mass == pytest.approx(0.2)


def test_class_source_weights_reject_misaligned_input():
    with pytest.raises(ValueError):
        _class_source_sample_weights([0], [])
