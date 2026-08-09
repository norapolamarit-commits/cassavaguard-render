"""Unit tests for training/runtime artifact contracts."""
from copy import deepcopy
import json
from pathlib import Path
from types import SimpleNamespace

import numpy as np
import pytest
from PIL import Image

from backend.services import cnn_classifier
from backend.training import train_whitefly_detector
from backend.services.feature_extraction import FEATURE_NAMES, ML_CLASS_ORDER
from backend.services.model_contract import verify_sklearn_bundle
from backend.training.training_utils import (atomic_write_json,
                                             choose_active_from_validation,
                                             sha256_file)
from backend.training.train_cnn_torch import (
    _audit_records,
    _decoded_fingerprints,
    _hamming_hex,
    _wilson_interval,
)
from backend.training.verify_artifacts import _verify_cnn_evaluation_contract
from backend.training.train_whitefly_detector import (
    ABUNDANCE_GROUPS,
    _allocate_acquisition_runs,
    _fixed_threshold_operating_point,
    _group_acquisition_runs,
    _pascal_boxes,
    _quality_gate,
    _select_validation_threshold,
    _tile_labels,
    _tile_origins,
    prepare_tiled_yolo_dataset,
)


def test_active_model_is_chosen_from_validation_only():
    validation = {
        "accurate_majority": {"f1": 0.51, "accuracy": 0.80},
        "balanced": {"f1": 0.65, "accuracy": 0.72},
    }
    assert choose_active_from_validation(validation) == "balanced"

    # A hypothetical reversal in test results cannot affect this function because
    # test scores are deliberately not an input to model selection.
    hypothetical_test = {"accurate_majority": {"f1": 0.99}, "balanced": {"f1": 0.01}}
    assert hypothetical_test["accurate_majority"]["f1"] > hypothetical_test["balanced"]["f1"]
    assert choose_active_from_validation(validation) == "balanced"


def test_atomic_json_and_sha256(tmp_path):
    path = tmp_path / "metrics.json"
    atomic_write_json(path, {"classes": ML_CLASS_ORDER})
    assert json.loads(path.read_text()) == {"classes": ML_CLASS_ORDER}
    assert len(sha256_file(path)) == 64
    assert not list(tmp_path.glob("*.tmp"))


def test_runtime_sklearn_contract_rejects_class_order_mismatch(tmp_path):
    from sklearn.linear_model import LogisticRegression

    X = np.vstack([np.zeros((5, len(FEATURE_NAMES))), np.ones((5, len(FEATURE_NAMES)))])
    y = np.array([0] * 5 + [1] * 5)
    model = LogisticRegression().fit(X, y)
    model_path = tmp_path / "model.joblib"
    import joblib
    joblib.dump(model, model_path)
    meta = {
        "classes": list(reversed(ML_CLASS_ORDER)),
        "feature_names": FEATURE_NAMES,
        "selection": {"set": "validation", "test_used_for_selection": False},
        "artifacts": {"model": {"file": model_path.name, "sha256": sha256_file(model_path)}},
    }
    try:
        verify_sklearn_bundle(meta, model, model_path, "model", ML_CLASS_ORDER, FEATURE_NAMES)
    except ValueError as exc:
        assert "class order" in str(exc)
    else:
        raise AssertionError("class-order mismatch must fail closed")


def test_cnn_preprocess_zero_to_255_nchw(monkeypatch):
    monkeypatch.setattr(cnn_classifier, "_loaded", True)
    monkeypatch.setattr(cnn_classifier, "_metrics", {
        "img_size": 8,
        "input_scale": "zero_to_255",
        "input_layout": "NCHW",
        "normalize_mean": [0.0, 0.0, 0.0],
        "normalize_std": [1.0, 1.0, 1.0],
    })
    image = Image.fromarray(np.full((5, 7, 3), 128, dtype=np.uint8))
    prepared = cnn_classifier.cnn_preprocess(image)
    assert prepared.shape == (1, 3, 8, 8)
    assert prepared.dtype == np.float32
    assert np.all(prepared == 128.0)


def test_calibrated_softmax_is_normalized():
    logits = np.array([[1000.0, 999.0, -1000.0]])
    probabilities = cnn_classifier._softmax(logits / 2.0)
    assert np.isfinite(probabilities).all()
    assert np.allclose(probabilities.sum(axis=1), 1.0)


def test_cnn_four_view_tta_uses_one_batch_and_mean_logits(monkeypatch):
    metrics = {
        "img_size": 8,
        "input_scale": "zero_to_255",
        "input_layout": "NCHW",
        "normalize_mean": [0.0, 0.0, 0.0],
        "normalize_std": [1.0, 1.0, 1.0],
        "classes": ML_CLASS_ORDER,
        "temperature": 1.0,
        "input_name": "image",
        "inference_tta": {
            "enabled": True,
            "transforms": [
                "identity", "horizontal_flip", "vertical_flip",
                "horizontal_vertical_flip",
            ],
            "aggregation": "mean_logits",
        },
    }

    class FakeSession:
        def run(self, _outputs, inputs):
            assert inputs["image"].shape == (4, 3, 8, 8)
            return [np.array([
                [4, 0, 0, 0, 0], [0, 4, 0, 0, 0],
                [4, 0, 0, 0, 0], [4, 0, 0, 0, 0],
            ], dtype=np.float32)]

    monkeypatch.setattr(cnn_classifier, "get_cnn_session", lambda: FakeSession())
    monkeypatch.setattr(cnn_classifier, "get_cnn_metrics", lambda: metrics)
    image = Image.fromarray(np.arange(8 * 8 * 3, dtype=np.uint8).reshape(8, 8, 3))
    probabilities = cnn_classifier.cnn_predict_proba(image)
    assert max(probabilities, key=probabilities.get) == "healthy"
    assert np.isclose(sum(probabilities.values()), 1.0)


def test_whitefly_split_keeps_contiguous_frames_across_clock_boundary_together():
    records = [
        ("IMG_20190313_061459_1", "low_abundance"),
        ("IMG_20190313_061501_6", "moderate_abundance"),
        ("IMG_20190313_064501_5", "super_abundance"),
    ]
    stem_to_run, runs = _group_acquisition_runs(records)
    assert stem_to_run[records[0][0]] == stem_to_run[records[1][0]]
    assert stem_to_run[records[1][0]] != stem_to_run[records[2][0]]
    assert len(runs) == 2


def test_whitefly_group_allocator_is_deterministic_and_stratified():
    counts = [
        (326, 93, 0),
        (43, 10, 0),
        (304, 23, 0),
        (147, 19, 0),
        (58, 194, 40),
        (23, 49, 24),
        (64, 258, 273),
        (6, 89, 171),
        (29, 265, 492),
    ]
    runs = [
        {
            "id": f"run_{index}",
            "abundance": dict(zip(ABUNDANCE_GROUPS, values)),
        }
        for index, values in enumerate(counts)
    ]
    first = _allocate_acquisition_runs(runs, seed=1)
    assert first == _allocate_acquisition_runs(runs, seed=1)
    assert set(first.values()) == {"train", "val", "test"}
    for split in ("val", "test"):
        for abundance in ABUNDANCE_GROUPS:
            assert sum(
                run["abundance"][abundance]
                for run in runs
                if first[run["id"]] == split
            ) >= 100


def test_whitefly_runtime_threshold_is_selected_from_validation_curve():
    metrics = SimpleNamespace(box=SimpleNamespace(
        px=np.array([0.1, 0.2, 0.3]),
        f1_curve=np.array([[0.2, 0.8, 0.4]]),
        p_curve=np.array([[0.3, 0.7, 0.9]]),
        r_curve=np.array([[0.9, 0.7, 0.2]]),
    ))
    selected = _select_validation_threshold(metrics)
    assert selected == {
        "value": 0.2,
        "basis": "maximum min(precision, recall, F1) on validation; F1 tie-break; test was not used",
        "validation_primary": 0.7,
        "validation_f1": 0.8,
        "validation_precision": 0.7,
        "validation_recall": 0.7,
        "selection_set": "validation",
        "test_used_for_selection": False,
    }


def test_whitefly_threshold_protects_precision_and_recall_before_f1():
    metrics = SimpleNamespace(box=SimpleNamespace(
        px=np.array([0.1, 0.2]),
        f1_curve=np.array([[0.82, 0.80]]),
        p_curve=np.array([[0.90, 0.78]]),
        r_curve=np.array([[0.60, 0.78]]),
    ))
    selected = _select_validation_threshold(metrics)
    assert selected["value"] == 0.2
    assert selected["validation_primary"] == 0.78


def test_whitefly_test_operating_point_uses_frozen_validation_threshold():
    metrics = SimpleNamespace(stats={
        "tp": [np.array([[True], [False], [True]])],
        "conf": [np.array([0.9, 0.8, 0.4])],
        "target_cls": [np.array([0, 0, 0])],
    })
    operating_point = _fixed_threshold_operating_point(metrics, threshold=0.5)
    assert operating_point["precision"] == 0.5
    assert operating_point["recall"] == 0.33333333
    assert operating_point["f1"] == 0.4
    assert operating_point["threshold_selection_set"] == "validation"
    assert operating_point["test_used_for_threshold_selection"] is False
    assert _quality_gate(operating_point)["passed"] is False
    passing = {**operating_point, "precision": 0.8, "recall": 0.75, "f1": 0.774}
    assert _quality_gate(passing)["passed"] is True


def test_whitefly_tiles_conserve_boxes_and_use_non_overlapping_origins():
    boxes = [
        (10.0, 10.0, 30.0, 30.0),
        (1990.0, 10.0, 2010.0, 30.0),
        (2500.0, 100.0, 2530.0, 130.0),
    ]
    assert _tile_origins(4000, 2000) == [0, 2000]
    assert _tile_origins(1920, 2000) == [0]
    labels = [
        label
        for tile_x in _tile_origins(4000, 2000)
        for label in _tile_labels(
            boxes,
            tile_x=tile_x,
            tile_y=0,
            tile_size=2000,
        )
    ]
    assert len(labels) == len(boxes)
    for label in labels:
        class_id, *coordinates = label.split()
        assert class_id == "0"
        assert all(0.0 <= float(value) <= 1.0 for value in coordinates)


def test_whitefly_tiles_inherit_source_acquisition_run_split(tmp_path, monkeypatch):
    sources = []
    stem_to_run = {}
    run_to_split = {}
    run_summaries = []
    for index, split in enumerate(("train", "val", "test")):
        stem = f"IMG_2019031{index + 1}_010101_1"
        image_path = tmp_path / f"{stem}.jpg"
        Image.new("RGB", (640, 320)).save(image_path)
        xml_path = tmp_path / f"{stem}.xml"
        xml_path.write_text(
            """
            <annotation><size><width>640</width><height>320</height></size>
            <object><name>whitefly</name><bndbox>
            <xmin>10</xmin><ymin>10</ymin><xmax>20</xmax><ymax>20</ymax>
            </bndbox></object></annotation>
            """,
            encoding="utf-8",
        )
        run_id = f"run_{index}"
        sources.append((image_path, xml_path, "low_abundance"))
        stem_to_run[stem] = run_id
        run_to_split[run_id] = split
        run_summaries.append({
            "id": run_id,
            "started_at": "2019-01-01T00:00:00",
            "ended_at": "2019-01-01T00:00:01",
            "images": 1,
            "abundance": {
                "low_abundance": 1,
                "moderate_abundance": 0,
                "super_abundance": 0,
            },
        })
    monkeypatch.setattr(
        train_whitefly_detector,
        "_source_inventory",
        lambda _seed: (sources, stem_to_run, run_summaries, run_to_split),
    )
    monkeypatch.setattr(train_whitefly_detector, "SOURCE_ROOT", tmp_path)
    manifest = prepare_tiled_yolo_dataset(
        materialize=False,
        dataset_root=tmp_path / "tiles",
        tile_size=320,
    )
    for run_id, split in run_to_split.items():
        inherited = {
            record["split"]
            for record in manifest["records"]
            if record["acquisition_run"] == run_id
        }
        assert inherited == {split}
    assert sum(
        split["boxes"] for split in manifest["split"]["counts"].values()
    ) == 3


def test_pascal_conversion_uses_decoded_orientation_and_clips_edges(tmp_path):
    xml = tmp_path / "sample.xml"
    xml.write_text(
        """
        <annotation>
          <size><width>4000</width><height>1920</height></size>
          <object><name>whitefly</name><bndbox>
            <xmin>1900</xmin><ymin>100</ymin>
            <xmax>1993</xmax><ymax>180</ymax>
          </bndbox></object>
        </annotation>
        """,
        encoding="utf-8",
    )
    labels = _pascal_boxes(xml, actual_width=1920, actual_height=4000)
    class_id, x_center, y_center, width, height = labels[0].split()
    assert class_id == "0"
    assert 0 <= float(x_center) <= 1
    assert 0 <= float(y_center) <= 1
    assert 0 < float(width) <= 1
    assert 0 < float(height) <= 1


def _pattern_image() -> Image.Image:
    y, x = np.mgrid[:128, :128]
    array = np.stack([
        (3 * x + y) % 256,
        (x + 5 * y) % 256,
        ((x - 64) ** 2 + (y - 64) ** 2) % 256,
    ], axis=-1).astype(np.uint8)
    return Image.fromarray(array)


def test_perceptual_audit_quarantines_reencoded_cross_split_copy(tmp_path):
    for split in ("train", "validation", "test"):
        for class_name in ML_CLASS_ORDER:
            (tmp_path / split / class_name).mkdir(parents=True)

    source = _pattern_image()
    source.save(tmp_path / "train" / "cbsd" / "source.jpg", quality=96)
    source.save(tmp_path / "test" / "cbsd" / "reencoded.jpg", quality=72)

    records, audit = _audit_records(tmp_path)
    perceptual = audit["perceptual_duplicate_audit"]
    assert audit["exact_removed_by_split"] == {"train": 0, "validation": 0, "test": 0}
    assert perceptual["cross_split_candidate_groups"] == 1
    assert perceptual["same_label_groups_deduplicated"] == 1
    assert perceptual["removed_by_split"] == {"train": 0, "validation": 0, "test": 1}
    assert len(records["train"]) == 1
    assert records["test"] == []
    assert perceptual["manual_review_manifest"][0]["review_status"] == "pending"


def test_perceptual_hash_contract_is_conservative_for_reencoding(tmp_path):
    original = _pattern_image()
    first = tmp_path / "first.jpg"
    second = tmp_path / "second.jpg"
    original.save(first, quality=96)
    original.save(second, quality=72)
    with Image.open(first) as opened:
        first_exact, first_dhash, first_phash = _decoded_fingerprints(opened)
    with Image.open(second) as opened:
        second_exact, second_dhash, second_phash = _decoded_fingerprints(opened)
    assert first_exact != second_exact
    assert first_dhash == second_dhash
    assert _hamming_hex(first_phash, second_phash) <= 3


def test_wilson_interval_requires_accuracy_above_target_with_confidence():
    lower, upper = _wilson_interval(1525, 1874)
    assert lower == pytest.approx(0.795506, abs=1e-6)
    assert lower > 0.75
    assert upper > lower


def test_current_cnn_verifier_surfaces_legacy_perceptual_audit_warning():
    metrics_path = Path(__file__).resolve().parents[2] / "ml_models" / "cnn_metrics.json"
    metrics = json.loads(metrics_path.read_text(encoding="utf-8"))
    report = _verify_cnn_evaluation_contract(metrics)
    assert report["accuracy"] == pytest.approx(0.813767, abs=1e-6)
    assert report["accuracy_wilson_95"][0] > 0.75
    assert report["synthetic_validation_or_test"] is False
    assert report["duplicate_audit"]["status"] == "warning"
    assert report["duplicate_audit"]["leakage_free_claim_allowed"] is False


def test_cnn_verifier_rejects_synthetic_evaluation_claim():
    metrics_path = Path(__file__).resolve().parents[2] / "ml_models" / "cnn_metrics.json"
    metrics = json.loads(metrics_path.read_text(encoding="utf-8"))
    tampered = deepcopy(metrics)
    tampered["dataset"]["synthetic_evaluation"] = True
    with pytest.raises(AssertionError, match="synthetic"):
        _verify_cnn_evaluation_contract(tampered)


def test_cnn_verifier_accepts_hashed_perceptual_manifest_but_keeps_scene_warning():
    import hashlib

    metrics_path = Path(__file__).resolve().parents[2] / "ml_models" / "cnn_metrics.json"
    metrics = json.loads(metrics_path.read_text(encoding="utf-8"))
    upgraded = deepcopy(metrics)
    manifest = []
    manifest_sha = hashlib.sha256(
        json.dumps(manifest, sort_keys=True, separators=(",", ":")).encode()
    ).hexdigest()
    upgraded["dataset"]["duplicate_audit"] = {
        "method": upgraded["dataset"]["method"],
        "removed_by_split": upgraded["dataset"]["removed_by_split"],
        "perceptual_duplicate_audit": {
            "cross_split_candidate_groups": 0,
            "policy": "quarantine all candidates before training/evaluation pending manual review",
            "manual_review_required": True,
            "manual_review_manifest_sha256": manifest_sha,
            "manual_review_manifest": manifest,
        },
    }
    report = _verify_cnn_evaluation_contract(upgraded)
    assert report["duplicate_audit"]["status"] == "passed_with_residual_scene_risk"
    assert report["duplicate_audit"]["leakage_free_claim_allowed"] is False
