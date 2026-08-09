"""Runtime validation for model+metadata bundles.

Training publishes artifacts first and metadata last.  The metadata SHA-256 manifest
therefore acts as the atomic bundle pointer: loaders fail closed if a process stopped
between file replacements or if files were copied from different training runs.
"""
from __future__ import annotations

import hashlib
from pathlib import Path

import numpy as np


def file_sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with Path(path).open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def verify_artifact(meta: dict, artifact_id: str, path: Path) -> None:
    record = meta.get("artifacts", {}).get(artifact_id)
    if not isinstance(record, dict):
        raise ValueError(f"metadata missing artifact record {artifact_id!r}")
    if record.get("file") != path.name:
        raise ValueError(f"artifact filename mismatch for {artifact_id!r}")
    if file_sha256(path) != record.get("sha256"):
        raise ValueError(f"artifact SHA-256 mismatch for {artifact_id!r}")


def verify_sklearn_bundle(meta: dict, model, model_path: Path, artifact_id: str,
                          expected_classes: list[str], expected_features: list[str]) -> None:
    if meta.get("classes") != expected_classes:
        raise ValueError("model class order does not match runtime")
    if meta.get("feature_names") != expected_features:
        raise ValueError("model feature order does not match runtime")
    selection = meta.get("selection", {})
    if selection.get("set") != "validation" or selection.get("test_used_for_selection") is not False:
        raise ValueError("model was not selected exclusively on validation data")
    verify_artifact(meta, artifact_id, model_path)
    if not np.array_equal(np.asarray(getattr(model, "classes_", [])),
                          np.arange(len(expected_classes))):
        raise ValueError("estimator classes_ does not match runtime label encoding")
    if int(getattr(model, "n_features_in_", -1)) != len(expected_features):
        raise ValueError("estimator n_features_in_ does not match runtime")
    if len(expected_features) == 12:
        smoke_input = np.asarray([
            [
                0.55, 0.05, 0.02, 0.01, 0.03, 0.20,
                0.08, 0.002, 0.02, 0.01, 0.65, 0.55,
            ],
            [
                0.20, 0.18, 0.10, 0.06, 0.04, -0.02,
                0.20, 0.006, 0.08, 0.04, 0.48, 0.42,
            ],
        ], dtype=np.float64)
    else:
        smoke_input = np.zeros((2, len(expected_features)), dtype=np.float64)
    probabilities = np.asarray(model.predict_proba(smoke_input))
    if (probabilities.shape != (2, len(expected_classes))
            or not np.isfinite(probabilities).all() or (probabilities < 0).any()
            or not np.allclose(probabilities.sum(axis=1), 1.0, atol=1e-6)):
        raise ValueError("estimator probability output contract is invalid")
