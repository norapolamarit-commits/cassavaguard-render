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

from backend.services.feature_extraction import (
    ML_CLASS_ORDER,
    gray_world_white_balance,
    leaf_background_crop,
)
from backend.training.training_utils import atomic_write_json, sha256_file

MODEL_DIR = REPO_ROOT / "backend" / "ml_models"
ONNX_PATH = MODEL_DIR / "cnn_primary.onnx"
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


class GrayWorldWhiteBalance:
    """Deterministic gray-world color-constancy correction on real pixels.

    Rescales each channel so the three channel means become equal, reducing
    the effect of a colored light source (e.g. a phone's warm/cool white
    balance) before the classifier ever sees the image. No pixels are
    invented; this only rescales existing real values, and clips the
    correction so near-uniform images (little color signal either way)
    aren't pushed to an extreme.
    """

    def __call__(self, image):
        return gray_world_white_balance(image)


class LeafBackgroundCrop:
    """Crop tightly to the vegetation-colored region of a real photo.

    Classical HSV thresholding (green-to-brown hue band), not a trained
    segmentation model -- there is no real, licensed cassava leaf-mask
    dataset in this repo to train one on, and this project does not
    fabricate labels/masks. Falls back to the untouched image when the
    heuristic finds too little vegetation-colored area to trust (e.g. a
    close-up already dominated by leaf, or an unusual background it can't
    characterize), rather than risk cropping out the diagnostic region.
    """

    def __init__(self, margin: float = 0.08, min_area_fraction: float = 0.02):
        self.margin = margin
        self.min_area_fraction = min_area_fraction

    def __call__(self, image):
        return leaf_background_crop(image, self.margin, self.min_area_fraction)


class TiledRandomCrop:
    """Force exposure to local detail instead of one global downsample.

    Upscales to a size*grid canvas and picks one grid tile at random.
    Different mechanism from RandomResizedCrop's continuous scale/ratio
    jitter: it guarantees the model sometimes trains on a spatially
    disjoint quarter of the leaf at full local resolution, rather than
    always seeing a (possibly slightly cropped) view of the whole leaf.
    Train-only, like every other stochastic transform in this file --
    evaluation keeps using the deterministic DirectSquareResize baseline
    so validation/test stay comparable across pipelines.
    """

    def __init__(self, size: int, grid: int = 2):
        self.size = size
        self.grid = grid

    def __call__(self, image):
        canvas = image.resize(
            (self.size * self.grid, self.size * self.grid), Image.Resampling.BILINEAR,
        )
        tile_x = random.randrange(self.grid)
        tile_y = random.randrange(self.grid)
        box = (
            tile_x * self.size, tile_y * self.size,
            (tile_x + 1) * self.size, (tile_y + 1) * self.size,
        )
        return canvas.crop(box)


class SaliencyGuidedCrop:
    """Crop toward the sub-region with the most local color anomaly.

    A cheap, deterministic, classical-CV proxy for attribution-guided
    cropping. True occlusion-sensitivity attribution (as used for the
    production result explanation, see backend/services/cnn_classifier.py)
    needs gradient/many-forward-pass access to a specific trained model,
    which is circular for a from-scratch candidate and prohibitively slow
    to run over the full ~9,000-image train/validation/test set (tens of
    forward passes per image). Lesions create local color contrast against
    otherwise uniform healthy leaf tissue, so this instead finds the
    window with the highest summed distance-from-mean-color, using an
    integral image for an O(1) window-sum lookup per candidate position.
    """

    def __init__(self, size: int, window_fraction: float = 0.6, probe_resolution: int = 96, step: int = 4):
        self.size = size
        self.window_fraction = window_fraction
        self.probe_resolution = probe_resolution
        self.step = step

    def __call__(self, image):
        probe = image.resize(
            (self.probe_resolution, self.probe_resolution), Image.Resampling.BILINEAR,
        )
        array = np.asarray(probe).astype(np.float32)
        mean_color = array.reshape(-1, 3).mean(axis=0)
        anomaly = np.linalg.norm(array - mean_color, axis=-1)
        window = max(8, int(self.probe_resolution * self.window_fraction))
        cumulative = np.pad(np.cumsum(np.cumsum(anomaly, axis=0), axis=1), ((1, 0), (1, 0)))

        best_score = -1.0
        best_position = (0, 0)
        limit = self.probe_resolution - window + 1
        for row in range(0, max(limit, 1), self.step):
            for col in range(0, max(limit, 1), self.step):
                score = (
                    cumulative[row + window, col + window]
                    - cumulative[row, col + window]
                    - cumulative[row + window, col]
                    + cumulative[row, col]
                )
                if score > best_score:
                    best_score = score
                    best_position = (row, col)

        row, col = best_position
        scale_y = image.height / self.probe_resolution
        scale_x = image.width / self.probe_resolution
        y0, x0 = int(row * scale_y), int(col * scale_x)
        y1, x1 = int((row + window) * scale_y), int((col + window) * scale_x)
        return image.crop((x0, y0, x1, y1))


PIPELINE_CHOICES = (
    "none",
    "color_constancy",
    "leaf_crop",
    "field_robust",
    "tiled_crop",
    "saliency_crop",
)


def _build_pipeline_transform(name: str, image_size: int):
    """Return (deterministic_pre_transform_or_None, train_only_transform_or_None).

    The deterministic transform (if any) is applied identically to both
    train and eval so the model is trained and evaluated on the same kind
    of input. The train-only transform (tiled_crop) replaces the eval
    step's job entirely for train, since it already produces a
    size x size crop -- eval keeps using plain DirectSquareResize.
    """
    if name == "none":
        return None, None
    if name == "color_constancy":
        return GrayWorldWhiteBalance(), None
    if name == "leaf_crop":
        return LeafBackgroundCrop(), None
    if name == "field_robust":
        # Deterministic and therefore identical in train/validation/test/runtime.
        # This is an ablation candidate, never silently enabled for the published
        # model: color constancy reduces phone/lighting shift and the conservative
        # crop reduces reliance on field backgrounds.
        from torchvision import transforms

        return transforms.Compose([GrayWorldWhiteBalance(), LeafBackgroundCrop()]), None
    if name == "saliency_crop":
        return SaliencyGuidedCrop(image_size), None
    if name == "tiled_crop":
        return None, TiledRandomCrop(image_size)
    raise ValueError(f"unknown pipeline {name!r}")


def parse_args(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--data-dir", type=Path, default=None)
    parser.add_argument("--epochs-head", type=int, default=5)
    parser.add_argument("--epochs-fine", type=int, default=14)
    parser.add_argument("--fine-tune-blocks", type=int, default=4)
    parser.add_argument(
        "--architecture",
        choices=(
            "efficientnet_b0",
            "efficientnet_b2",
            "efficientnet_b3",
            "mobilenet_v3_large",
            "convnext_tiny",
        ),
        default="efficientnet_b0",
    )
    parser.add_argument("--batch-size", type=int, default=32)
    parser.add_argument("--image-size", type=int, default=224)
    parser.add_argument("--patience", type=int, default=4)
    parser.add_argument("--workers", type=int, default=4)
    parser.add_argument("--seed", type=int, default=42)
    parser.add_argument("--device", choices=("auto", "mps", "cpu"), default="auto")
    parser.add_argument("--class-weight-power", type=float, default=1.0,
                        help="inverse-frequency exponent; 0 disables weights, 0.5 uses sqrt balancing")
    parser.add_argument(
        "--pipeline", choices=PIPELINE_CHOICES, default="none",
        help="preprocessing pipeline ablation: color_constancy, leaf_crop, tiled_crop, "
             "or saliency_crop instead of the baseline resize-only preprocessing",
    )
    parser.add_argument(
        "--oversample-minority-classes", action="store_true",
        help="sample train images with replacement, weighted by inverse class frequency, "
             "instead of a plain shuffle -- a different mechanism from --class-weight-power "
             "(that reweights the loss; this reweights how often each image is seen)",
    )
    parser.add_argument(
        "--balance-classes-and-sources", action="store_true",
        help="sample every class equally, then every available source equally within "
             "that class; recommended when adding large external datasets",
    )
    parser.add_argument(
        "--max-external-share-per-class", type=float, default=0.5,
        help=(
            "maximum sampler probability assigned to all external sources within "
            "each class when --balance-classes-and-sources is enabled; 0.2-0.3 "
            "is recommended for small cross-domain supplements"
        ),
    )
    parser.add_argument("--label-smoothing", type=float, default=0.08)
    parser.add_argument("--output-dir", type=Path, default=MODEL_DIR,
                        help="write candidate artifacts outside backend/ml_models until promoted")
    parser.add_argument(
        "--extra-data-dir", type=Path, action="append", default=[],
        help="class-folder dataset added to training only after cross-source duplicate quarantine",
    )
    return parser.parse_args(argv)


def _class_source_sample_weights(
    labels: list[int],
    sources: list[str],
    max_external_share: float = 0.5,
    official_source: str = "official_tfds",
) -> list[float]:
    """Equalize classes, then sources within each class.

    A large external CMD dataset must not swamp scarce official CBB examples, and
    an external source must not become a shortcut merely because it has more files.
    Missing class/source combinations receive no invented samples.
    """
    if len(labels) != len(sources) or not labels:
        raise ValueError("labels and sources must be non-empty and aligned")
    if not 0.0 <= max_external_share < 1.0:
        raise ValueError("max_external_share must be in [0, 1)")
    cell_counts = Counter(zip(labels, sources))
    sources_by_class: dict[int, list[str]] = {}
    for label, source in cell_counts:
        sources_by_class.setdefault(label, []).append(source)

    cell_mass = {}
    for label, class_sources in sources_by_class.items():
        external = [source for source in class_sources if source != official_source]
        if official_source in class_sources and external:
            cell_mass[(label, official_source)] = 1.0 - max_external_share
            for source in external:
                cell_mass[(label, source)] = max_external_share / len(external)
        else:
            for source in class_sources:
                cell_mass[(label, source)] = 1.0 / len(class_sources)
    return [cell_mass[(label, source)] / cell_counts[(label, source)] for label, source in zip(labels, sources)]


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
    # Index perceptual hashes by dHash. The duplicate policy requires an exact
    # dHash match, so scanning every prior image would turn large external-source
    # imports into an avoidable O(n²) operation.
    reference: dict[str, list[str]] = {}
    exact_hashes = set()
    for split in SPLITS:
        for path, _label in official_records[split]:
            exact, dhash, phash = _fingerprints_for_path(path)
            exact_hashes.add(exact)
            reference.setdefault(dhash, []).append(phash)

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
                    _hamming_hex(phash, known_phash) <= PERCEPTUAL_MAX_PHASH_HAMMING
                    for known_phash in reference.get(dhash, ())
                ):
                    removed_perceptual += 1
                    continue
                exact_hashes.add(exact)
                reference.setdefault(dhash, []).append(phash)
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
    if not 0.0 <= args.max_external_share_per_class < 1.0:
        raise SystemExit("max-external-share-per-class must be in [0, 1)")
    if args.oversample_minority_classes and args.balance_classes_and_sources:
        raise SystemExit(
            "choose either --oversample-minority-classes or "
            "--balance-classes-and-sources, not both"
        )
    if args.balance_classes_and_sources and args.class_weight_power != 0:
        raise SystemExit(
            "--balance-classes-and-sources already equalizes class exposure; set "
            "--class-weight-power 0 to avoid double compensation"
        )

    os.environ.setdefault("PYTORCH_ENABLE_MPS_FALLBACK", "1")
    import torch
    import torch.nn as nn
    from torch.utils.data import DataLoader, Dataset
    from torchvision import transforms
    from torchvision.models import (
        ConvNeXt_Tiny_Weights,
        EfficientNet_B0_Weights, EfficientNet_B2_Weights, EfficientNet_B3_Weights,
        MobileNet_V3_Large_Weights,
        convnext_tiny,
        efficientnet_b0, efficientnet_b2, efficientnet_b3,
        mobilenet_v3_large,
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
    deterministic_pipeline, train_only_pipeline = _build_pipeline_transform(args.pipeline, args.image_size)
    pre_steps = [deterministic_pipeline] if deterministic_pipeline is not None else []

    if train_only_pipeline is not None:
        # tiled_crop already yields a size x size crop; skip RandomResizedCrop
        # so the two spatial-sampling strategies aren't stacked on top of
        # each other in an untested, uncontrolled way.
        train_transform = transforms.Compose([
            *pre_steps,
            train_only_pipeline,
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
    else:
        train_transform = transforms.Compose([
            *pre_steps,
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

    eval_transform = transforms.Compose([*pre_steps, DirectSquareResize(args.image_size), to_255])
    generator = torch.Generator().manual_seed(args.seed)
    loader_args = {
        "batch_size": args.batch_size,
        "num_workers": args.workers,
        "persistent_workers": args.workers > 0,
        "generator": generator,
    }

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

    if args.balance_classes_and_sources:
        extra_roots = [path.expanduser().resolve() for path in args.extra_data_dir]

        def source_for(path):
            resolved = path.resolve()
            for index, root in enumerate(extra_roots):
                if resolved.is_relative_to(root):
                    return f"external_{index + 1}"
            return "official_tfds"

        labels = [label for _path, label in records["train"]]
        sources = [source_for(path) for path, _label in records["train"]]
        sample_weights = _class_source_sample_weights(
            labels,
            sources,
            max_external_share=args.max_external_share_per_class,
        )
        sampler = torch.utils.data.WeightedRandomSampler(
            weights=sample_weights,
            num_samples=len(records["train"]),
            replacement=True,
            generator=torch.Generator().manual_seed(args.seed),
        )
        train_loader = DataLoader(
            CassavaDataset(records["train"], train_transform),
            sampler=sampler,
            **loader_args,
        )
    elif args.oversample_minority_classes:
        # Distinct mechanism from --class-weight-power: that reweights the loss
        # gradient but every epoch still sees each real image exactly once.
        # Sampling with replacement, weighted by inverse class frequency, means
        # minority-class images (e.g. cbb) are physically seen more often per
        # epoch, at the cost of majority-class images being seen less often.
        sample_weights = [raw_weights[label] for _, label in records["train"]]
        sampler = torch.utils.data.WeightedRandomSampler(
            weights=sample_weights,
            num_samples=len(records["train"]),
            replacement=True,
            generator=torch.Generator().manual_seed(args.seed),
        )
        train_loader = DataLoader(
            CassavaDataset(records["train"], train_transform),
            sampler=sampler,
            **loader_args,
        )
    else:
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
    print(
        "Training counts: "
        + json.dumps({ML_CLASS_ORDER[index]: counts[index] for index in range(len(ML_CLASS_ORDER))}),
        flush=True,
    )

    builders = {
        "efficientnet_b0": (efficientnet_b0, EfficientNet_B0_Weights.IMAGENET1K_V1),
        "efficientnet_b2": (efficientnet_b2, EfficientNet_B2_Weights.IMAGENET1K_V1),
        "efficientnet_b3": (efficientnet_b3, EfficientNet_B3_Weights.IMAGENET1K_V1),
        "mobilenet_v3_large": (mobilenet_v3_large, MobileNet_V3_Large_Weights.IMAGENET1K_V2),
        "convnext_tiny": (convnext_tiny, ConvNeXt_Tiny_Weights.IMAGENET1K_V1),
    }
    builder, pretrained_weights = builders[args.architecture]
    network = builder(weights=pretrained_weights)
    # Architecture-agnostic head replacement: EfficientNet's classifier is
    # Sequential(Dropout, Linear); MobileNetV3's is Sequential(Linear,
    # Hardswish, Dropout, Linear). Only the final Linear and the Dropout's
    # rate are architecture-specific knowledge worth keeping in sync.
    in_features = network.classifier[-1].in_features
    network.classifier[-1] = nn.Linear(in_features, len(ML_CLASS_ORDER))
    for module in network.classifier:
        if isinstance(module, nn.Dropout):
            module.p = 0.35

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
                "oversample_minority_classes": args.oversample_minority_classes,
                "balance_classes_and_sources": args.balance_classes_and_sources,
                "max_external_share_per_class": args.max_external_share_per_class,
                "pipeline": args.pipeline,
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
