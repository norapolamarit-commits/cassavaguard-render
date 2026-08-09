"""Train the raw-pixel CassavaGuard CNN with PyTorch and Apple Metal.

This is the accelerated counterpart to ``train_cnn.py``.  It reads the original
TFDS Cassava directory layout, preserves the official train/validation/test
splits, quarantines exact and conservative perceptual duplicates, selects
checkpoints on validation macro-F1 only, and opens the test loader only after
model selection is complete.

The exported ONNX contract is intentionally identical to
``backend.services.cnn_classifier``: NCHW float32 pixels in [0, 255], one
dynamic-batch logits output, and the runtime class order in ML_CLASS_ORDER.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import math
import os
import platform
import random
import subprocess
import sys
import tempfile
import time
from collections import Counter
from pathlib import Path

import numpy as np
from PIL import Image, ImageOps

REPO_ROOT = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(REPO_ROOT))

from backend.services.feature_extraction import ML_CLASS_ORDER
from backend.training.training_utils import atomic_write_json, sha256_file

MODEL_DIR = REPO_ROOT / "backend" / "ml_models"
ONNX_PATH = MODEL_DIR / "cnn_efficientnet_b0.onnx"
METRICS_PATH = MODEL_DIR / "cnn_metrics.json"
SPLITS = ("train", "validation", "test")
PERCEPTUAL_DHASH_SIZE = 8
PERCEPTUAL_PHASH_SIZE = 8
PERCEPTUAL_PHASH_SOURCE_SIZE = 32
PERCEPTUAL_MAX_PHASH_HAMMING = 3


class CassavaDataset:
    """Pickle-safe dataset so macOS DataLoader workers can use spawn."""

    def __init__(self, rows, transform):
        self.rows = rows
        self.transform = transform

    def __len__(self):
        return len(self.rows)

    def __getitem__(self, index):
        path, label = self.rows[index]
        with Image.open(path) as opened:
            image = opened.convert("RGB")
            tensor = self.transform(image)
        return tensor, label


class ScaleTo255:
    def __call__(self, tensor):
        return tensor * 255.0


class DirectSquareResize:
    def __init__(self, size: int):
        self.size = size

    def __call__(self, image):
        return image.resize(
            (self.size, self.size),
            Image.Resampling.BILINEAR,
        )


def parse_args(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--data-dir", type=Path, default=None)
    parser.add_argument("--epochs-head", type=int, default=5)
    parser.add_argument("--epochs-fine", type=int, default=14)
    parser.add_argument("--fine-tune-blocks", type=int, default=4)
    parser.add_argument("--architecture", choices=("efficientnet_b0", "efficientnet_b2", "efficientnet_b3"), default="efficientnet_b0")
    parser.add_argument("--batch-size", type=int, default=32)
    parser.add_argument("--image-size", type=int, default=224)
    parser.add_argument("--patience", type=int, default=4)
    parser.add_argument("--workers", type=int, default=4)
    parser.add_argument("--seed", type=int, default=42)
    parser.add_argument("--device", choices=("auto", "mps", "cpu"), default="auto")
    parser.add_argument("--class-weight-power", type=float, default=1.0,
                        help="inverse-frequency exponent; 0 disables weights, 0.5 uses sqrt balancing")
    parser.add_argument("--label-smoothing", type=float, default=0.08)
    parser.add_argument("--output-dir", type=Path, default=MODEL_DIR,
                        help="write candidate artifacts outside backend/ml_models until promoted")
    parser.add_argument(
        "--extra-data-dir", type=Path, action="append", default=[],
        help="class-folder dataset added to training only after cross-source duplicate quarantine",
    )
    return parser.parse_args(argv)


def _find_data_dir(explicit: Path | None) -> Path:
    if explicit is not None:
        candidate = explicit.expanduser().resolve()
        if all((candidate / split).is_dir() for split in SPLITS):
            return candidate
        raise FileNotFoundError(f"{candidate} does not contain train/validation/test")
    root = Path.home() / "tensorflow_datasets" / "downloads" / "extracted"
    candidates = sorted(root.glob("*/cassavaleafdata"))
    for candidate in candidates:
        if all((candidate / split).is_dir() for split in SPLITS):
            return candidate
    raise FileNotFoundError(
        "TFDS Cassava source directory not found; pass --data-dir /path/to/cassavaleafdata"
    )


def _dct_matrix(size: int) -> np.ndarray:
    positions = np.arange(size, dtype=np.float64)
    frequencies = positions[:, None]
    matrix = np.cos(np.pi * (2.0 * positions + 1.0) * frequencies / (2.0 * size))
    matrix[0] *= math.sqrt(1.0 / size)
    matrix[1:] *= math.sqrt(2.0 / size)
    return matrix


_PHASH_DCT_MATRIX = _dct_matrix(PERCEPTUAL_PHASH_SOURCE_SIZE)


def _decoded_fingerprints(image: Image.Image) -> tuple[str, str, str]:
    """Return exact SHA-256, 64-bit dHash and 64-bit pHash deterministically."""
    rgb = image.convert("RGB")
    array = np.asarray(rgb, dtype=np.uint8)
    digest = hashlib.sha256()
    digest.update(np.asarray(array.shape, dtype=np.int64).tobytes())
    digest.update(array.tobytes())

    gray = ImageOps.grayscale(rgb)
    dhash_pixels = np.asarray(
        gray.resize(
            (PERCEPTUAL_DHASH_SIZE + 1, PERCEPTUAL_DHASH_SIZE),
            Image.Resampling.LANCZOS,
        ),
        dtype=np.uint8,
    )
    dhash_bits = dhash_pixels[:, 1:] > dhash_pixels[:, :-1]
    dhash = np.packbits(dhash_bits.reshape(-1)).tobytes().hex()

    phash_pixels = np.asarray(
        gray.resize(
            (PERCEPTUAL_PHASH_SOURCE_SIZE, PERCEPTUAL_PHASH_SOURCE_SIZE),
            Image.Resampling.LANCZOS,
        ),
        dtype=np.float64,
    )
    # ``einsum(..., optimize=False)`` avoids platform-BLAS variability observed
    # for tiny chained matrix products while preserving the exact DCT formula.
    low_matrix = _PHASH_DCT_MATRIX[:PERCEPTUAL_PHASH_SIZE]
    row_transform = np.einsum(
        "ux,xy->uy", low_matrix, phash_pixels, optimize=False
    )
    low_frequency = np.einsum(
        "uy,vy->uv", row_transform, low_matrix, optimize=False
    )
    median = float(np.median(low_frequency.reshape(-1)[1:]))
    phash = np.packbits((low_frequency > median).reshape(-1)).tobytes().hex()
    return digest.hexdigest(), dhash, phash


def _fingerprints_for_path(path: Path) -> tuple[str, str, str]:
    with Image.open(path) as opened:
        return _decoded_fingerprints(opened)


def _hamming_hex(first: str, second: str) -> int:
    # int.bit_count() is unavailable in the Python 3.9 training environment.
    return bin(int(first, 16) ^ int(second, 16)).count("1")


def _perceptual_candidate_groups(rows: list[dict]) -> list[list[dict]]:
    """Find conservative cross-split near-duplicate connected components.

    Requiring an identical 64-bit dHash plus pHash distance <= 3 deliberately
    favours precision. Every candidate is quarantined before training and listed
    for manual review; no model output or metric is consulted.
    """
    by_dhash: dict[str, list[int]] = {}
    for index, row in enumerate(rows):
        by_dhash.setdefault(row["dhash"], []).append(index)

    parent = list(range(len(rows)))

    def find(index: int) -> int:
        while parent[index] != index:
            parent[index] = parent[parent[index]]
            index = parent[index]
        return index

    def union(first: int, second: int) -> None:
        first_root, second_root = find(first), find(second)
        if first_root != second_root:
            parent[second_root] = first_root

    candidate_indices: set[int] = set()
    for bucket in by_dhash.values():
        for offset, first_index in enumerate(bucket):
            first = rows[first_index]
            for second_index in bucket[offset + 1:]:
                second = rows[second_index]
                if first["split"] == second["split"]:
                    continue
                if first["exact_sha256"] == second["exact_sha256"]:
                    continue
                if _hamming_hex(first["phash"], second["phash"]) > PERCEPTUAL_MAX_PHASH_HAMMING:
                    continue
                union(first_index, second_index)
                candidate_indices.update((first_index, second_index))

    components: dict[int, list[dict]] = {}
    for index in sorted(candidate_indices):
        components.setdefault(find(index), []).append(rows[index])
    return sorted(
        components.values(),
        key=lambda group: min(int(row["order"]) for row in group),
    )


def _audit_records(data_dir: Path) -> tuple[dict[str, list[tuple[Path, int]]], dict]:
    occurrences: dict[str, list[dict]] = {}
    audited_rows: list[dict] = []
    raw_counts = {}
    for split in SPLITS:
        rows = []
        for class_index, class_name in enumerate(ML_CLASS_ORDER):
            rows.extend((path, class_index) for path in sorted((data_dir / split / class_name).glob("*.jpg")))
        raw_counts[split] = len(rows)
        for path, class_index in rows:
            exact_sha256, dhash, phash = _fingerprints_for_path(path)
            row = {
                "split": split,
                "path": path,
                "relative_path": path.relative_to(data_dir).as_posix(),
                "label": class_index,
                "order": len(audited_rows),
                "exact_sha256": exact_sha256,
                "dhash": dhash,
                "phash": phash,
            }
            audited_rows.append(row)
            occurrences.setdefault(exact_sha256, []).append(row)

    excluded: set[Path] = set()
    conflict_groups = 0
    same_label_groups = 0
    for group in occurrences.values():
        if len(group) < 2:
            continue
        if len({int(row["label"]) for row in group}) > 1:
            conflict_groups += 1
            excluded.update(row["path"] for row in group)
        else:
            same_label_groups += 1
            # The scan order is train -> validation -> test. Keeping the first
            # occurrence therefore never moves held-out information into training.
            excluded.update(row["path"] for row in group[1:])

    exact_removed = {
        split: sum(row["path"] in excluded for row in audited_rows if row["split"] == split)
        for split in SPLITS
    }
    perceptual_input = [row for row in audited_rows if row["path"] not in excluded]
    perceptual_groups = _perceptual_candidate_groups(perceptual_input)
    perceptual_conflicts = 0
    perceptual_same_label = 0
    review_manifest = []
    before_perceptual = set(excluded)
    for group in perceptual_groups:
        labels = {int(row["label"]) for row in group}
        if len(labels) > 1:
            perceptual_conflicts += 1
            decision = "quarantine_all_label_conflict"
            excluded.update(row["path"] for row in group)
        else:
            perceptual_same_label += 1
            decision = "keep_earliest_split_occurrence"
            excluded.update(row["path"] for row in group[1:])
        review_manifest.append({
            "decision": decision,
            "review_status": "pending",
            "occurrences": [
                {
                    "split": row["split"],
                    "path": row["relative_path"],
                    "label": ML_CLASS_ORDER[int(row["label"])],
                    "exact_sha256": row["exact_sha256"],
                    "dhash64": row["dhash"],
                    "phash64": row["phash"],
                }
                for row in group
            ],
        })

    perceptual_removed = {
        split: sum(
            row["path"] in excluded and row["path"] not in before_perceptual
            for row in audited_rows
            if row["split"] == split
        )
        for split in SPLITS
    }

    records = {}
    removed = {}
    effective_counts = {}
    for split in SPLITS:
        rows = []
        for class_index, class_name in enumerate(ML_CLASS_ORDER):
            rows.extend(
                (path, class_index)
                for path in sorted((data_dir / split / class_name).glob("*.jpg"))
                if path not in excluded
            )
        records[split] = rows
        effective_counts[split] = len(rows)
        removed[split] = raw_counts[split] - len(rows)

    manifest = {
        digest: [
            (row["split"], row["relative_path"], int(row["label"]))
            for row in group
        ]
        for digest, group in sorted(occurrences.items())
        if len(group) > 1
    }
    manifest_sha = hashlib.sha256(
        json.dumps(manifest, sort_keys=True, separators=(",", ":")).encode()
    ).hexdigest()
    review_payload = json.dumps(
        review_manifest,
        sort_keys=True,
        separators=(",", ":"),
    ).encode()
    return records, {
        "method": "SHA-256 of decoded RGB pixel shape+bytes",
        "conflicting_label_groups_quarantined": conflict_groups,
        "same_label_duplicate_groups_deduplicated": same_label_groups,
        "exact_removed_by_split": exact_removed,
        "removed_by_split": removed,
        "duplicate_manifest_sha256": manifest_sha,
        "test_access_before_selection": "structural duplicate quarantine only; no model outputs",
        "raw_split_counts": raw_counts,
        "effective_split_counts": effective_counts,
        "perceptual_duplicate_audit": {
            "method": "identical 64-bit dHash and 64-bit pHash Hamming distance <= 3",
            "dhash_size": PERCEPTUAL_DHASH_SIZE,
            "phash_size": PERCEPTUAL_PHASH_SIZE,
            "phash_source_size": PERCEPTUAL_PHASH_SOURCE_SIZE,
            "max_phash_hamming": PERCEPTUAL_MAX_PHASH_HAMMING,
            "cross_split_candidate_groups": len(perceptual_groups),
            "conflicting_label_groups_quarantined": perceptual_conflicts,
            "same_label_groups_deduplicated": perceptual_same_label,
            "removed_by_split": perceptual_removed,
            "policy": "quarantine all candidates before training/evaluation pending manual review",
            "manual_review_required": True,
            "manual_review_manifest_sha256": hashlib.sha256(review_payload).hexdigest(),
            "manual_review_manifest": review_manifest,
        },
    }


def _load_extra_training_records(
    directories: list[Path],
    official_records: dict[str, list[tuple[Path, int]]],
) -> tuple[list[tuple[Path, int]], list[dict]]:
    """Load real external images for training only, quarantining overlap."""
    if not directories:
        return [], []
    reference = []
    exact_hashes = set()
    for split in SPLITS:
        for path, _label in official_records[split]:
            exact, dhash, phash = _fingerprints_for_path(path)
            exact_hashes.add(exact)
            reference.append((dhash, phash))

    accepted = []
    reports = []
    for raw_directory in directories:
        directory = raw_directory.expanduser().resolve()
        if not directory.is_dir():
            raise RuntimeError(f"extra training directory does not exist: {directory}")
        manifest_path = directory / "source_manifest.json"
        manifest = json.loads(manifest_path.read_text(encoding="utf-8")) if manifest_path.is_file() else {}
        counts = Counter()
        removed_exact = 0
        removed_perceptual = 0
        for class_index, class_name in enumerate(ML_CLASS_ORDER):
            for path in sorted((directory / class_name).glob("*")):
                if not path.is_file() or path.suffix.lower() not in {".jpg", ".jpeg", ".png"}:
                    continue
                exact, dhash, phash = _fingerprints_for_path(path)
                if exact in exact_hashes:
                    removed_exact += 1
                    continue
                if any(
                    dhash == known_dhash
                    and _hamming_hex(phash, known_phash) <= PERCEPTUAL_MAX_PHASH_HAMMING
                    for known_dhash, known_phash in reference
                ):
                    removed_perceptual += 1
                    continue
                exact_hashes.add(exact)
                reference.append((dhash, phash))
                accepted.append((path, class_index))
                counts[class_name] += 1
        reports.append({
            "source": manifest.get("source_url", str(directory)),
            "doi": manifest.get("doi"),
            "license": manifest.get("license", "unknown"),
            "usage": "training_only",
            "accepted": sum(counts.values()),
            "per_class": dict(counts),
            "exact_duplicates_removed": removed_exact,
            "perceptual_duplicates_removed": removed_perceptual,
            "manifest_file": manifest_path.name if manifest_path.is_file() else None,
        })
    return accepted, reports


def _softmax(logits: np.ndarray, temperature: float = 1.0) -> np.ndarray:
    scaled = np.asarray(logits, dtype=np.float64) / float(temperature)
    scaled -= scaled.max(axis=1, keepdims=True)
    exp = np.exp(scaled)
    return exp / exp.sum(axis=1, keepdims=True)


def _expected_calibration_error(y_true, probabilities, bins: int = 15) -> float:
    confidence = probabilities.max(axis=1)
    correct = probabilities.argmax(axis=1) == y_true
    edges = np.linspace(0.0, 1.0, bins + 1)
    result = 0.0
    for lower, upper in zip(edges[:-1], edges[1:]):
        mask = (confidence > lower) & (confidence <= upper)
        if mask.any():
            result += mask.mean() * abs(correct[mask].mean() - confidence[mask].mean())
    return float(result)


def _wilson_interval(correct: int, total: int, z: float = 1.959963984540054) -> list[float]:
    """Two-sided Wilson score interval for an observed accuracy."""
    if total <= 0 or not 0 <= correct <= total:
        raise ValueError("Wilson interval requires 0 <= correct <= total and total > 0")
    proportion = correct / total
    denominator = 1.0 + z * z / total
    center = (proportion + z * z / (2.0 * total)) / denominator
    half_width = (
        z
        * math.sqrt(
            proportion * (1.0 - proportion) / total
            + z * z / (4.0 * total * total)
        )
        / denominator
    )
    return [round(center - half_width, 6), round(center + half_width, 6)]


def _fit_temperature(logits: np.ndarray, labels: np.ndarray) -> float:
    from scipy.optimize import minimize_scalar
    from sklearn.metrics import log_loss

    def objective(log_temperature):
        temperature = math.exp(float(log_temperature))
        return log_loss(labels, _softmax(logits, temperature), labels=range(len(ML_CLASS_ORDER)))

    result = minimize_scalar(objective, bounds=(-3.0, 3.0), method="bounded")
    if not result.success:
        raise RuntimeError(f"temperature fitting failed: {result.message}")
    return float(math.exp(result.x))


def _evaluate_logits(logits: np.ndarray, labels: np.ndarray, temperature: float) -> dict:
    from sklearn.metrics import (
        accuracy_score,
        balanced_accuracy_score,
        confusion_matrix,
        f1_score,
        log_loss,
        precision_recall_fscore_support,
    )

    probabilities = _softmax(logits, temperature)
    predicted = probabilities.argmax(axis=1)
    total = int(labels.shape[0])
    correct = int(np.sum(predicted == labels))
    precision, recall, f1, support = precision_recall_fscore_support(
        labels, predicted, labels=range(len(ML_CLASS_ORDER)), zero_division=0
    )
    one_hot = np.eye(len(ML_CLASS_ORDER), dtype=np.float64)[labels]
    return {
        "accuracy": round(float(accuracy_score(labels, predicted)), 6),
        "accuracy_correct": correct,
        "sample_count": total,
        "accuracy_wilson_95": _wilson_interval(correct, total),
        "balanced_accuracy": round(float(balanced_accuracy_score(labels, predicted)), 6),
        "macro_f1": round(float(f1_score(labels, predicted, average="macro")), 6),
        "log_loss": round(float(log_loss(labels, probabilities, labels=range(len(ML_CLASS_ORDER)))), 6),
        "brier_multiclass": round(float(np.mean(np.sum((probabilities - one_hot) ** 2, axis=1))), 6),
        "ece_15_bins": round(_expected_calibration_error(labels, probabilities), 6),
        "confusion_matrix": confusion_matrix(labels, predicted, labels=range(len(ML_CLASS_ORDER))).tolist(),
        "per_class": {
            class_name: {
                "precision": round(float(precision[index]), 6),
                "recall": round(float(recall[index]), 6),
                "f1": round(float(f1[index]), 6),
                "support": int(support[index]),
            }
            for index, class_name in enumerate(ML_CLASS_ORDER)
        },
    }


def _git_revision() -> str | None:
    try:
        return subprocess.run(
            ["git", "rev-parse", "HEAD"],
            cwd=REPO_ROOT,
            check=True,
            capture_output=True,
            text=True,
        ).stdout.strip()
    except Exception:
        return None


def main(argv=None):
    args = parse_args(argv)
    if args.epochs_head + args.epochs_fine <= 0:
        raise SystemExit("at least one training phase must have epochs > 0")
    if min(args.batch_size, args.image_size, args.patience, args.fine_tune_blocks) <= 0:
        raise SystemExit("batch-size, image-size, patience and fine-tune-blocks must be > 0")
    if not 0.0 <= args.class_weight_power <= 1.0:
        raise SystemExit("class-weight-power must be between 0 and 1")
    if not 0.0 <= args.label_smoothing < 1.0:
        raise SystemExit("label-smoothing must be in [0, 1)")

    os.environ.setdefault("PYTORCH_ENABLE_MPS_FALLBACK", "1")
    import torch
    import torch.nn as nn
    from torch.utils.data import DataLoader, Dataset
    from torchvision import transforms
    from torchvision.models import (
        EfficientNet_B0_Weights, EfficientNet_B2_Weights, EfficientNet_B3_Weights,
        efficientnet_b0, efficientnet_b2, efficientnet_b3,
    )

    random.seed(args.seed)
    np.random.seed(args.seed)
    torch.manual_seed(args.seed)
    if torch.backends.mps.is_available():
        torch.mps.manual_seed(args.seed)

    if args.device == "mps" or (args.device == "auto" and torch.backends.mps.is_available()):
        device = torch.device("mps")
    else:
        device = torch.device("cpu")
    if args.device == "mps" and not torch.backends.mps.is_available():
        raise RuntimeError("MPS was requested but is not available")

    data_dir = _find_data_dir(args.data_dir)
    print(f"Data directory: {data_dir}", flush=True)
    print("Auditing exact-pixel duplicates across official splits...", flush=True)
    records, duplicate_audit = _audit_records(data_dir)
    print(json.dumps(duplicate_audit, indent=2), flush=True)
    extra_records, extra_training_sources = _load_extra_training_records(
        args.extra_data_dir,
        records,
    )
    records["train"].extend(extra_records)
    if extra_training_sources:
        print(json.dumps({"extra_training_sources": extra_training_sources}, indent=2), flush=True)

    to_255 = transforms.Compose([
        transforms.PILToTensor(),
        transforms.ConvertImageDtype(torch.float32),
        ScaleTo255(),
    ])
    train_transform = transforms.Compose([
        transforms.RandomResizedCrop(
            args.image_size,
            scale=(0.72, 1.0),
            ratio=(0.85, 1.15),
            interpolation=transforms.InterpolationMode.BILINEAR,
            antialias=True,
        ),
        transforms.RandomHorizontalFlip(),
        transforms.RandomVerticalFlip(p=0.25),
        transforms.RandomRotation(
            12,
            interpolation=transforms.InterpolationMode.BILINEAR,
            fill=0,
        ),
        transforms.ColorJitter(brightness=0.18, contrast=0.18, saturation=0.18, hue=0.04),
        to_255,
    ])

    eval_transform = transforms.Compose([DirectSquareResize(args.image_size), to_255])
    generator = torch.Generator().manual_seed(args.seed)
    loader_args = {
        "batch_size": args.batch_size,
        "num_workers": args.workers,
        "persistent_workers": args.workers > 0,
        "generator": generator,
    }
    train_loader = DataLoader(
        CassavaDataset(records["train"], train_transform),
        shuffle=True,
        **loader_args,
    )
    validation_loader = DataLoader(
        CassavaDataset(records["validation"], eval_transform),
        shuffle=False,
        **loader_args,
    )

    counts = Counter(label for _, label in records["train"])
    raw_weights = np.asarray([
        len(records["train"]) / (len(ML_CLASS_ORDER) * counts[index])
        for index in range(len(ML_CLASS_ORDER))
    ], dtype=np.float32)
    powered_weights = np.power(raw_weights, args.class_weight_power)
    powered_weights /= powered_weights.mean()
    class_weights = torch.tensor(
        powered_weights,
        dtype=torch.float32,
        device=device,
    )
    print(
        "Training counts: "
        + json.dumps({ML_CLASS_ORDER[index]: counts[index] for index in range(len(ML_CLASS_ORDER))}),
        flush=True,
    )

    builders = {
        "efficientnet_b0": (efficientnet_b0, EfficientNet_B0_Weights.IMAGENET1K_V1),
        "efficientnet_b2": (efficientnet_b2, EfficientNet_B2_Weights.IMAGENET1K_V1),
        "efficientnet_b3": (efficientnet_b3, EfficientNet_B3_Weights.IMAGENET1K_V1),
    }
    builder, pretrained_weights = builders[args.architecture]
    network = builder(weights=pretrained_weights)
    in_features = network.classifier[1].in_features
    network.classifier[0] = nn.Dropout(p=0.35)
    network.classifier[1] = nn.Linear(in_features, len(ML_CLASS_ORDER))

    class ServingModel(nn.Module):
        def __init__(self, classifier):
            super().__init__()
            self.classifier = classifier
            self.register_buffer(
                "mean",
                torch.tensor([0.485, 0.456, 0.406], dtype=torch.float32).view(1, 3, 1, 1),
            )
            self.register_buffer(
                "std",
                torch.tensor([0.229, 0.224, 0.225], dtype=torch.float32).view(1, 3, 1, 1),
            )

        def forward(self, image):
            normalized = (image / 255.0 - self.mean) / self.std
            return self.classifier(normalized)

    model = ServingModel(network).to(device)
    criterion = nn.CrossEntropyLoss(
        weight=class_weights,
        label_smoothing=args.label_smoothing,
    )

    output_dir = args.output_dir.expanduser().resolve()
    output_dir.mkdir(parents=True, exist_ok=True)
    candidate_mode = output_dir != MODEL_DIR.resolve()
    onnx_path = output_dir / (
        f"cnn_{args.architecture}.onnx" if candidate_mode else ONNX_PATH.name
    )
    metrics_path = output_dir / (
        f"cnn_{args.architecture}_metrics.json" if candidate_mode else METRICS_PATH.name
    )

    def collect_logits(loader):
        model.eval()
        logits_parts, label_parts = [], []
        with torch.inference_mode():
            for images, labels in loader:
                logits = model(images.to(device, non_blocking=False))
                logits_parts.append(logits.detach().cpu().numpy())
                label_parts.append(labels.numpy())
        return np.concatenate(logits_parts), np.concatenate(label_parts).astype(np.int64)

    checkpoint_fd, checkpoint_name = tempfile.mkstemp(
        prefix=".cnn-torch-best-",
        suffix=".pt",
        dir=output_dir,
    )
    os.close(checkpoint_fd)
    checkpoint_path = Path(checkpoint_name)
    best_f1 = -math.inf
    history = []

    def run_phase(name, epochs, optimizer):
        nonlocal best_f1
        if epochs <= 0:
            return
        scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=max(1, epochs))
        wait = 0
        for epoch in range(1, epochs + 1):
            model.train()
            running_loss = 0.0
            seen = 0
            correct = 0
            for images, labels in train_loader:
                images = images.to(device, non_blocking=False)
                labels = labels.to(device, non_blocking=False)
                optimizer.zero_grad(set_to_none=True)
                logits = model(images)
                loss = criterion(logits, labels)
                loss.backward()
                torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=5.0)
                optimizer.step()
                running_loss += float(loss.detach().cpu()) * labels.shape[0]
                correct += int((logits.argmax(dim=1) == labels).sum().detach().cpu())
                seen += labels.shape[0]
            scheduler.step()
            validation_logits, validation_labels = collect_logits(validation_loader)
            from sklearn.metrics import f1_score

            validation_f1 = float(
                f1_score(validation_labels, validation_logits.argmax(axis=1), average="macro")
            )
            row = {
                "phase": name,
                "epoch": epoch,
                "loss": running_loss / seen,
                "train_accuracy": correct / seen,
                "validation_macro_f1": validation_f1,
                "learning_rate": optimizer.param_groups[0]["lr"],
            }
            history.append(row)
            print(json.dumps(row), flush=True)
            if validation_f1 > best_f1 + 1e-6:
                best_f1 = validation_f1
                wait = 0
                torch.save(
                    {key: value.detach().cpu() for key, value in model.state_dict().items()},
                    checkpoint_path,
                )
            else:
                wait += 1
                if wait >= args.patience:
                    print(f"Early stopping {name} after {epoch} epochs", flush=True)
                    break

    try:
        for parameter in network.features.parameters():
            parameter.requires_grad = False
        run_phase(
            "head",
            args.epochs_head,
            torch.optim.AdamW(
                [parameter for parameter in model.parameters() if parameter.requires_grad],
                lr=1e-3,
                weight_decay=1e-4,
            ),
        )

        for parameter in network.features.parameters():
            parameter.requires_grad = False
        trainable_blocks = list(network.features.children())[-args.fine_tune_blocks:]
        for block in trainable_blocks:
            for parameter in block.parameters():
                parameter.requires_grad = True
        for parameter in network.classifier.parameters():
            parameter.requires_grad = True
        run_phase(
            "fine_tune",
            args.epochs_fine,
            torch.optim.AdamW(
                [parameter for parameter in model.parameters() if parameter.requires_grad],
                lr=4e-5,
                weight_decay=2e-4,
            ),
        )

        model.load_state_dict(torch.load(checkpoint_path, map_location="cpu"))
        model.to(device)
        validation_logits, validation_labels = collect_logits(validation_loader)
        temperature = _fit_temperature(validation_logits, validation_labels)
        validation_metrics = _evaluate_logits(
            validation_logits,
            validation_labels,
            temperature,
        )

        # Model selection is now frozen. Construct and open test_loader only here.
        test_loader = DataLoader(
            CassavaDataset(records["test"], eval_transform),
            shuffle=False,
            **loader_args,
        )
        test_logits, test_labels = collect_logits(test_loader)
        test_metrics = _evaluate_logits(test_logits, test_labels, temperature)

        output_dir.mkdir(parents=True, exist_ok=True)
        model.to("cpu").eval()
        with tempfile.TemporaryDirectory(prefix=".cnn-onnx-", dir=output_dir) as temp_dir:
            temp_onnx = Path(temp_dir) / onnx_path.name
            parity_images = next(iter(validation_loader))[0][:2].cpu()
            with torch.inference_mode():
                framework_logits = model(parity_images).numpy()
            torch.onnx.export(
                model,
                (parity_images,),
                str(temp_onnx),
                input_names=["image"],
                output_names=["logits"],
                dynamic_axes={"image": {0: "batch"}, "logits": {0: "batch"}},
                opset_version=17,
                dynamo=False,
            )
            import onnxruntime

            session = onnxruntime.InferenceSession(
                str(temp_onnx),
                providers=["CPUExecutionProvider"],
            )
            onnx_logits = np.asarray(
                session.run(None, {"image": parity_images.numpy().astype(np.float32)})[0]
            )
            max_abs = float(np.max(np.abs(framework_logits - onnx_logits)))
            argmax_equal = bool(
                np.array_equal(framework_logits.argmax(axis=1), onnx_logits.argmax(axis=1))
            )
            if not argmax_equal or not np.allclose(
                framework_logits,
                onnx_logits,
                rtol=1e-4,
                atol=1e-4,
            ):
                raise RuntimeError(
                    f"PyTorch/ONNX parity failed (argmax_equal={argmax_equal}, max_abs={max_abs})"
                )
            os.replace(temp_onnx, onnx_path)

        metrics = {
            "model_id": f"cnn_{args.architecture}",
            "architecture": f"Torchvision {args.architecture.replace('_', '-').title()} (ImageNet transfer learning)",
            "trained_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "classes": ML_CLASS_ORDER,
            "img_size": args.image_size,
            "input_name": "image",
            "input_layout": "NCHW",
            "input_dtype": "float32",
            "input_scale": "zero_to_255",
            "resize_interpolation": "bilinear",
            "resize_policy": "direct_square",
            "resize_implementation": "Pillow Image.resize",
            "normalize_mean": [0.485, 0.456, 0.406],
            "normalize_std": [0.229, 0.224, 0.225],
            "normalization_location": "inside_onnx_graph",
            "output": "logits",
            "temperature": temperature,
            "selection": {
                "set": "validation",
                "metric": "macro_f1",
                "test_used_for_selection": False,
                "best_validation_macro_f1": best_f1,
            },
            "artifacts": {
                "onnx": {
                    "file": onnx_path.name,
                    "sha256": sha256_file(onnx_path),
                }
            },
            "dataset": {
                "source": (
                    "TensorFlow Datasets cassava:0.1.0 extracted source"
                    + (" + external real training-only sources" if extra_training_sources else "")
                ),
                "url": "https://www.tensorflow.org/datasets/catalog/cassava",
                "license": "unknown/pending upstream image-license verification",
                "split_policy": "official TFDS train/validation/test preserved",
                "raw_split_counts": duplicate_audit["raw_split_counts"],
                "effective_split_counts": duplicate_audit["effective_split_counts"],
                "per_class_train": {
                    ML_CLASS_ORDER[index]: counts[index]
                    for index in range(len(ML_CLASS_ORDER))
                },
                "extra_training_sources": extra_training_sources,
                "duplicate_audit": duplicate_audit,
            },
            "training": {
                "seed": args.seed,
                "architecture": args.architecture,
                "device": str(device),
                "batch_size": args.batch_size,
                "epochs_head_requested": args.epochs_head,
                "epochs_fine_requested": args.epochs_fine,
                "fine_tune_blocks": args.fine_tune_blocks,
                "class_weights": {
                    ML_CLASS_ORDER[index]: float(class_weights[index].detach().cpu())
                    for index in range(len(ML_CLASS_ORDER))
                },
                "class_weight_power": args.class_weight_power,
                "label_smoothing": args.label_smoothing,
                "imagenet_initialization": True,
                "history": history,
            },
            "calibration": {
                "method": "validation temperature scaling",
                "temperature": temperature,
            },
            "onnx_parity": {
                "samples": int(parity_images.shape[0]),
                "rtol": 1e-4,
                "atol": 1e-4,
                "max_abs_logit_difference": max_abs,
                "argmax_equal": argmax_equal,
            },
            "validation": validation_metrics,
            "test": test_metrics,
            "quality_target": {
                "metric": "held_out_test_accuracy",
                "operator": ">",
                "threshold": 0.75,
                "point_estimate_passed": test_metrics["accuracy"] > 0.75,
                "wilson_lower_95_passed": test_metrics["accuracy_wilson_95"][0] > 0.75,
                "used_for_model_selection": False,
            },
            "production_eligible": False,
            "release_note": (
                "Requires independent Thai-field validation before AI_FIELD_VALIDATED=true."
            ),
            "reproducibility": {
                "git_revision": _git_revision(),
                "python": platform.python_version(),
                "torch": torch.__version__,
                "torchvision": __import__("torchvision").__version__,
                "pillow": __import__("PIL").__version__,
                "device": str(device),
            },
        }
        atomic_write_json(metrics_path, metrics)
        print(
            json.dumps(
                {
                    "validation": validation_metrics,
                    "test": test_metrics,
                    "onnx_parity": metrics["onnx_parity"],
                },
                indent=2,
            ),
            flush=True,
        )
        print(f"Wrote {onnx_path}", flush=True)
        print(f"Wrote {metrics_path}", flush=True)
    finally:
        checkpoint_path.unlink(missing_ok=True)


if __name__ == "__main__":
    main()
