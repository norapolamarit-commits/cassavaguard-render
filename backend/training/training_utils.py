"""Shared correctness helpers for CassavaGuard training jobs.

The functions in this module intentionally have no TensorFlow/scikit-learn imports at
module import time.  This keeps artifact verification and unit tests lightweight.
"""
from __future__ import annotations

import json
import hashlib
import math
import os
import tempfile
from pathlib import Path
from typing import Mapping


def sha256_file(path: Path, chunk_size: int = 1024 * 1024) -> str:
    """Return a streaming SHA-256 digest for a published artifact."""
    digest = hashlib.sha256()
    with Path(path).open("rb") as handle:
        for chunk in iter(lambda: handle.read(chunk_size), b""):
            digest.update(chunk)
    return digest.hexdigest()


def choose_active_from_validation(validation_metrics: Mapping[str, Mapping[str, float]]) -> str:
    """Choose a model using validation metrics only.

    Macro-F1 is the primary metric because CassavaGuard's five measured classes are
    imbalanced.  Accuracy is a deterministic tie-breaker; the model id is the final
    tie-breaker so repeated runs do not depend on dictionary insertion order.
    """
    if not validation_metrics:
        raise ValueError("validation_metrics must contain at least one model")

    ranked = []
    for model_id, metrics in validation_metrics.items():
        f1 = float(metrics["f1"])
        accuracy = float(metrics["accuracy"])
        if not (math.isfinite(f1) and math.isfinite(accuracy)):
            raise ValueError(f"non-finite validation score for {model_id}")
        ranked.append((f1, accuracy, model_id))
    return max(ranked)[2]


def atomic_write_json(path: Path, payload: Mapping) -> None:
    """Write JSON atomically so an interrupted run cannot leave partial metadata."""
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    fd, tmp_name = tempfile.mkstemp(prefix=f".{path.name}.", suffix=".tmp", dir=path.parent)
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as handle:
            json.dump(payload, handle, indent=2, ensure_ascii=False)
            handle.write("\n")
            handle.flush()
            os.fsync(handle.fileno())
        os.replace(tmp_name, path)
    except Exception:
        try:
            os.unlink(tmp_name)
        except FileNotFoundError:
            pass
        raise


def atomic_joblib_dump(model, path: Path) -> None:
    """Serialize a joblib model to a temporary file, then atomically publish it."""
    import joblib

    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    fd, tmp_name = tempfile.mkstemp(prefix=f".{path.name}.", suffix=".tmp", dir=path.parent)
    os.close(fd)
    try:
        joblib.dump(model, tmp_name)
        os.replace(tmp_name, path)
    except Exception:
        try:
            os.unlink(tmp_name)
        except FileNotFoundError:
            pass
        raise
