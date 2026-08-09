"""Train and evaluate a real cassava-whitefly object detector.

Input is the 3,000-image Mendeley v3 dataset prepared by
``prepare_extended_dataset.py``.  PASCAL VOC boxes are converted to YOLO
format.  Contiguous acquisition runs are kept in one split, including frames
on opposite sides of a fixed clock boundary.

The training command selects checkpoints from validation only.  The held-out
test split is opened after training and cannot influence checkpoint selection.
"""
from __future__ import annotations

import argparse
import datetime as dt
import hashlib
import itertools
import json
import os
import random
import shutil
import sys
import tempfile
import time
import xml.etree.ElementTree as ET
from collections import Counter
from pathlib import Path

from PIL import Image

REPO_ROOT = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(REPO_ROOT))

from backend.training.training_utils import atomic_write_json, sha256_file

SOURCE_ROOT = (
    REPO_ROOT
    / "backend"
    / "training"
    / "data"
    / "extended_conditions"
    / "real"
    / "whitefly"
)
DATASET_ROOT = (
    REPO_ROOT
    / "backend"
    / "training"
    / "data"
    / "extended_conditions"
    / "whitefly_yolo"
)
TILED_DATASET_ROOT = (
    REPO_ROOT
    / "backend"
    / "training"
    / "data"
    / "extended_conditions"
    / "whitefly_yolo_tiled"
)
MODEL_DIR = REPO_ROOT / "backend" / "ml_models"
RUNS_DIR = REPO_ROOT / "backend" / "training" / "runs"
ABUNDANCE_GROUPS = ("low_abundance", "moderate_abundance", "super_abundance")
SPLITS = ("train", "val", "test")
SPLIT_FRACTIONS = (0.70, 0.15, 0.15)
ACQUISITION_GAP_SECONDS = 15 * 60
MAX_DETECTIONS = 700
DEFAULT_TILE_SIZE = 2000
DEFAULT_TILE_JPEG_QUALITY = 88
DEFAULT_MOSAIC = 0.0
DEFAULT_SCALE = 0.15
DEFAULT_TRANSLATE = 0.05
TARGET_DETECTION_PRECISION_RECALL_F1 = 0.75
DATASET_DOI = "10.17632/5g38399z9p.3"
DATASET_LICENSE = "CC BY 4.0"


def _atomic_copy(source: Path, destination: Path) -> None:
    """Publish one artifact without exposing a partially copied file."""
    destination.parent.mkdir(parents=True, exist_ok=True)
    temporary_path = None
    try:
        with tempfile.NamedTemporaryFile(
            dir=destination.parent,
            prefix=f".{destination.name}.",
            suffix=".tmp",
            delete=False,
        ) as temporary:
            temporary_path = Path(temporary.name)
            with source.open("rb") as source_handle:
                shutil.copyfileobj(source_handle, temporary)
            temporary.flush()
            os.fsync(temporary.fileno())
        os.replace(temporary_path, destination)
    finally:
        if temporary_path is not None and temporary_path.exists():
            temporary_path.unlink()


def _capture_timestamp(stem: str) -> dt.datetime:
    """Parse the upstream ``IMG_YYYYMMDD_HHMMSS_N`` capture timestamp."""
    parts = stem.split("_")
    if len(parts) < 4 or len(parts[1]) != 8 or len(parts[2]) != 6:
        raise ValueError(f"Unexpected Whitefly filename: {stem}")
    try:
        return dt.datetime.strptime(parts[1] + parts[2], "%Y%m%d%H%M%S")
    except ValueError as exc:
        raise ValueError(f"Unexpected Whitefly filename: {stem}") from exc


def _group_acquisition_runs(
    records: list[tuple[str, str]],
) -> tuple[dict[str, str], list[dict]]:
    """Group consecutive frames; a gap over 15 minutes starts a new run.

    Fixed 15-minute clock buckets are not safe groups: two near-identical frames
    on opposite sides of a bucket boundary can otherwise land in different
    splits.  This groups the complete contiguous acquisition run instead.
    """
    ordered = sorted(
        ((_capture_timestamp(stem), stem, abundance) for stem, abundance in records),
        key=lambda row: row[0],
    )
    if not ordered:
        raise ValueError("Whitefly source records are empty")

    grouped: list[list[tuple[dt.datetime, str, str]]] = []
    current: list[tuple[dt.datetime, str, str]] = []
    for row in ordered:
        if current and (row[0] - current[-1][0]).total_seconds() > ACQUISITION_GAP_SECONDS:
            grouped.append(current)
            current = []
        current.append(row)
    grouped.append(current)

    stem_to_run: dict[str, str] = {}
    summaries = []
    for rows in grouped:
        run_id = f"run_{rows[0][0].strftime('%Y%m%dT%H%M%S')}"
        abundance = Counter(row[2] for row in rows)
        summaries.append({
            "id": run_id,
            "started_at": rows[0][0].isoformat(),
            "ended_at": rows[-1][0].isoformat(),
            "images": len(rows),
            "abundance": {
                name: int(abundance.get(name, 0)) for name in ABUNDANCE_GROUPS
            },
        })
        for _, stem, _ in rows:
            stem_to_run[stem] = run_id
    return stem_to_run, summaries


def _allocate_acquisition_runs(runs: list[dict], seed: int) -> dict[str, str]:
    """Create a deterministic group-stratified 70/15/15 assignment.

    Assignment uses only group sizes and abundance labels, never model results.
    Exhaustive search is intentional for this fixed nine-run public dataset and
    avoids quietly accepting a holdout without every abundance category.
    """
    if not 3 <= len(runs) <= 12:
        raise ValueError(
            f"Expected 3-12 acquisition runs for exact allocation, found {len(runs)}"
        )
    totals = {
        abundance: sum(int(run["abundance"][abundance]) for run in runs)
        for abundance in ABUNDANCE_GROUPS
    }
    total_images = sum(totals.values())
    holdout_minimums = {
        abundance: min(100, max(1, int(totals[abundance] * 0.10)))
        for abundance in ABUNDANCE_GROUPS
    }
    best: tuple[float, str, tuple[int, ...]] | None = None
    for assignment in itertools.product(range(3), repeat=len(runs)):
        if set(assignment) != {0, 1, 2}:
            continue
        counts = [Counter() for _ in SPLITS]
        for split_index, run in zip(assignment, runs):
            counts[split_index].update(run["abundance"])
        split_images = [sum(count.values()) for count in counts]
        if split_images[0] < total_images * 0.50:
            continue
        if any(
            counts[split_index][abundance] < holdout_minimums[abundance]
            for split_index in (1, 2)
            for abundance in ABUNDANCE_GROUPS
        ):
            continue

        score = sum(
            (
                (split_images[index] - total_images * SPLIT_FRACTIONS[index])
                / (total_images * SPLIT_FRACTIONS[index])
            ) ** 2
            for index in range(3)
        )
        score += sum(
            (
                (counts[index][abundance] - totals[abundance] * SPLIT_FRACTIONS[index])
                / (totals[abundance] * SPLIT_FRACTIONS[index])
            ) ** 2
            for index in range(3)
            for abundance in ABUNDANCE_GROUPS
        )
        tie_breaker = hashlib.sha256(
            f"{seed}:{','.join(map(str, assignment))}".encode()
        ).hexdigest()
        candidate = (round(score, 12), tie_breaker, assignment)
        if best is None or candidate < best:
            best = candidate
    if best is None:
        raise RuntimeError(
            "Cannot create grouped Whitefly holdouts containing every abundance class"
        )
    return {
        run["id"]: SPLITS[split_index]
        for run, split_index in zip(runs, best[2])
    }


def _reset_generated_dataset() -> None:
    """Remove only generated links, YOLO labels, and validator caches."""
    for split in SPLITS:
        image_dir = DATASET_ROOT / "images" / split
        if image_dir.is_dir():
            for path in image_dir.iterdir():
                if not path.is_symlink():
                    raise RuntimeError(
                        f"Refusing to remove non-symlink generated image: {path}"
                    )
                path.unlink()
        label_dir = DATASET_ROOT / "labels" / split
        if label_dir.is_dir():
            for path in label_dir.iterdir():
                if not path.is_file() or path.suffix not in {".txt", ".cache"}:
                    raise RuntimeError(f"Refusing to remove unexpected label file: {path}")
                path.unlink()
    label_root = DATASET_ROOT / "labels"
    if label_root.is_dir():
        for path in label_root.glob("*.cache"):
            path.unlink()


def _pascal_box_coordinates(
    xml_path: Path,
    actual_width: int,
    actual_height: int,
) -> list[tuple[float, float, float, float]]:
    """Return clipped absolute Whitefly boxes aligned to decoded pixels."""
    root = ET.parse(xml_path).getroot()
    xml_width = int(root.findtext("size/width", "0"))
    xml_height = int(root.findtext("size/height", "0"))
    # Some upstream portrait JPEGs have width/height reversed in the XML
    # metadata while box coordinates still align with the stored portrait
    # pixels.  Accept exactly that known reversal, normalize against the
    # decoded image, and clip the few edge boxes to the real dimensions.
    if (xml_width, xml_height) not in {
        (actual_width, actual_height),
        (actual_height, actual_width),
    }:
        raise ValueError(
            f"Image/XML size mismatch for {xml_path.name}: "
            f"{actual_width}x{actual_height} vs {xml_width}x{xml_height}"
        )
    boxes = []
    for obj in root.findall("object"):
        if (obj.findtext("name") or "").strip().lower() != "whitefly":
            continue
        box = obj.find("bndbox")
        if box is None:
            continue
        xmin = max(0.0, min(float(box.findtext("xmin", "0")), actual_width))
        ymin = max(0.0, min(float(box.findtext("ymin", "0")), actual_height))
        xmax = max(0.0, min(float(box.findtext("xmax", "0")), actual_width))
        ymax = max(0.0, min(float(box.findtext("ymax", "0")), actual_height))
        if xmax <= xmin or ymax <= ymin:
            continue
        boxes.append((xmin, ymin, xmax, ymax))
    if not boxes:
        raise ValueError(f"No usable whitefly boxes in {xml_path}")
    return boxes


def _pascal_boxes(xml_path: Path, actual_width: int, actual_height: int) -> list[str]:
    boxes = _pascal_box_coordinates(xml_path, actual_width, actual_height)
    labels = []
    for xmin, ymin, xmax, ymax in boxes:
        x_center = (xmin + xmax) / 2 / actual_width
        y_center = (ymin + ymax) / 2 / actual_height
        width = (xmax - xmin) / actual_width
        height = (ymax - ymin) / actual_height
        labels.append(
            f"0 {x_center:.8f} {y_center:.8f} {width:.8f} {height:.8f}"
        )
    return labels


def _tile_origins(length: int, tile_size: int) -> list[int]:
    """Return non-overlapping origins; the final tile is padded, never shifted."""
    if length < 1 or tile_size < 1:
        raise ValueError("image length and tile size must be positive")
    return list(range(0, length, tile_size))


def _tile_labels(
    boxes: list[tuple[float, float, float, float]],
    *,
    tile_x: int,
    tile_y: int,
    tile_size: int,
) -> list[str]:
    """Assign each object once to the non-overlapping tile containing its center."""
    labels = []
    right = tile_x + tile_size
    bottom = tile_y + tile_size
    for xmin, ymin, xmax, ymax in boxes:
        center_x = (xmin + xmax) / 2
        center_y = (ymin + ymax) / 2
        if not (tile_x <= center_x < right and tile_y <= center_y < bottom):
            continue
        clipped_xmin = max(xmin, tile_x) - tile_x
        clipped_ymin = max(ymin, tile_y) - tile_y
        clipped_xmax = min(xmax, right) - tile_x
        clipped_ymax = min(ymax, bottom) - tile_y
        if clipped_xmax <= clipped_xmin or clipped_ymax <= clipped_ymin:
            continue
        x_center = (clipped_xmin + clipped_xmax) / 2 / tile_size
        y_center = (clipped_ymin + clipped_ymax) / 2 / tile_size
        width = (clipped_xmax - clipped_xmin) / tile_size
        height = (clipped_ymax - clipped_ymin) / tile_size
        labels.append(
            f"0 {x_center:.8f} {y_center:.8f} {width:.8f} {height:.8f}"
        )
    return labels


def _tile_boundary_clipped_box_count(
    boxes: list[tuple[float, float, float, float]],
    *,
    tile_x: int,
    tile_y: int,
    tile_size: int,
) -> int:
    """Count center-assigned boxes that are clipped by this tile boundary."""
    right = tile_x + tile_size
    bottom = tile_y + tile_size
    return sum(
        1
        for xmin, ymin, xmax, ymax in boxes
        if tile_x <= (xmin + xmax) / 2 < right
        and tile_y <= (ymin + ymax) / 2 < bottom
        and (xmin < tile_x or ymin < tile_y or xmax > right or ymax > bottom)
    )


def _replace_symlink(link: Path, target: Path) -> None:
    link.parent.mkdir(parents=True, exist_ok=True)
    if link.is_symlink():
        if link.resolve() == target.resolve():
            return
        link.unlink()
    elif link.exists():
        raise RuntimeError(f"Refusing to overwrite non-symlink dataset file: {link}")
    link.symlink_to(target.resolve())


def _source_inventory(
    seed: int,
) -> tuple[list[tuple[Path, Path, str]], dict[str, str], list[dict], dict[str, str]]:
    """Validate the public source inventory and assign whole acquisition runs."""
    sources: list[tuple[Path, Path, str]] = []
    for abundance in ABUNDANCE_GROUPS:
        image_dir = SOURCE_ROOT / abundance / "images"
        annotation_dir = SOURCE_ROOT / abundance / "annotations"
        images = sorted(path for path in image_dir.glob("*") if path.is_file())
        if len(images) != 1000:
            raise RuntimeError(f"Expected 1,000 {abundance} images, found {len(images)}")
        for image_path in images:
            xml_path = annotation_dir / f"{image_path.stem}.xml"
            if not xml_path.is_file():
                raise RuntimeError(f"Missing annotation: {xml_path}")
            sources.append((image_path, xml_path, abundance))
    stem_to_run, run_summaries = _group_acquisition_runs([
        (image_path.stem, abundance) for image_path, _, abundance in sources
    ])
    run_to_split = _allocate_acquisition_runs(run_summaries, seed)
    return sources, stem_to_run, run_summaries, run_to_split


def prepare_yolo_dataset(seed: int = 1) -> dict:
    counts = {split: Counter() for split in SPLITS}
    boxes = Counter()
    acquisition_runs = {split: set() for split in SPLITS}
    records = []
    sources, stem_to_run, run_summaries, run_to_split = _source_inventory(seed)
    _reset_generated_dataset()

    for image_path, xml_path, abundance in sources:
        acquisition_run = stem_to_run[image_path.stem]
        split = run_to_split[acquisition_run]
        acquisition_runs[split].add(acquisition_run)
        with Image.open(image_path) as image:
            width, height = image.size
            image.verify()
        yolo_labels = _pascal_boxes(xml_path, width, height)
        target_name = f"{abundance}__{image_path.name}"
        _replace_symlink(
            DATASET_ROOT / "images" / split / target_name,
            image_path,
        )
        label_path = (
            DATASET_ROOT / "labels" / split / f"{Path(target_name).stem}.txt"
        )
        label_path.parent.mkdir(parents=True, exist_ok=True)
        label_path.write_text("\n".join(yolo_labels) + "\n", encoding="utf-8")
        counts[split][abundance] += 1
        boxes[split] += len(yolo_labels)
        records.append({
            "source_image": str(image_path.relative_to(SOURCE_ROOT)),
            "image": str(
                (DATASET_ROOT / "images" / split / target_name)
                .relative_to(DATASET_ROOT)
            ),
            "label": str(label_path.relative_to(DATASET_ROOT)),
            "split": split,
            "acquisition_run": acquisition_run,
            "abundance": abundance,
            "boxes": len(yolo_labels),
        })

    # A complete contiguous acquisition run must not leak across splits.
    for left, right in (("train", "val"), ("train", "test"), ("val", "test")):
        overlap = acquisition_runs[left] & acquisition_runs[right]
        if overlap:
            raise RuntimeError(f"Acquisition-run leakage {left}/{right}: {overlap}")
    for split in ("val", "test"):
        for abundance in ABUNDANCE_GROUPS:
            if counts[split][abundance] < 100:
                raise RuntimeError(
                    f"{split} has too few {abundance} images: "
                    f"{counts[split][abundance]}"
                )

    yaml_path = DATASET_ROOT / "whitefly.yaml"
    yaml_path.write_text(
        "\n".join([
            f"path: {DATASET_ROOT}",
            "train: images/train",
            "val: images/val",
            "test: images/test",
            "names:",
            "  0: whitefly",
            "",
        ]),
        encoding="utf-8",
    )
    manifest = {
        "schema_version": 1,
        "created_at": dt.datetime.now(dt.timezone.utc).isoformat(),
        "source": {
            "doi": DATASET_DOI,
            "license": DATASET_LICENSE,
            "images": 3000,
            "annotation": "PASCAL VOC bounding boxes",
        },
        "split": {
            "method": (
                "Deterministic group-stratified assignment of contiguous acquisition "
                "runs separated by >15-minute gaps; assignment uses only image counts "
                "and abundance labels, never model results"
            ),
            "seed": seed,
            "target_fractions": dict(zip(SPLITS, SPLIT_FRACTIONS)),
            "acquisition_gap_seconds": ACQUISITION_GAP_SECONDS,
            "counts": {
                split: {
                    "images": sum(counts[split].values()),
                    "boxes": boxes[split],
                    "acquisition_runs": len(acquisition_runs[split]),
                    "abundance": dict(counts[split]),
                }
                for split in SPLITS
            },
            "groups": [
                {**run, "split": run_to_split[run["id"]]}
                for run in run_summaries
            ],
            "test_used_for_selection": False,
            "caveat": (
                "No plant/leaf identity is supplied upstream. Contiguous-run grouping "
                "is stricter than fixed clock windows but cannot prove absence of "
                "same-plant leakage between different runs."
            ),
        },
        "records": records,
    }
    atomic_write_json(DATASET_ROOT / "split_manifest.json", manifest)
    return manifest


def _reset_tiled_dataset(dataset_root: Path) -> None:
    """Remove only files produced by :func:`prepare_tiled_yolo_dataset`."""
    for split in SPLITS:
        image_dir = dataset_root / "images" / split
        if image_dir.is_dir():
            for path in image_dir.iterdir():
                if not path.is_file() or path.suffix.lower() not in {".jpg", ".jpeg"}:
                    raise RuntimeError(f"Refusing to remove unexpected tile image: {path}")
                path.unlink()
        label_dir = dataset_root / "labels" / split
        if label_dir.is_dir():
            for path in label_dir.iterdir():
                if not path.is_file() or path.suffix not in {".txt", ".cache"}:
                    raise RuntimeError(f"Refusing to remove unexpected tile label: {path}")
                path.unlink()
    label_root = dataset_root / "labels"
    if label_root.is_dir():
        for path in label_root.glob("*.cache"):
            path.unlink()


def prepare_tiled_yolo_dataset(
    seed: int = 1,
    *,
    tile_size: int = DEFAULT_TILE_SIZE,
    jpeg_quality: int = DEFAULT_TILE_JPEG_QUALITY,
    materialize: bool = True,
    dataset_root: Path = TILED_DATASET_ROOT,
    smoke_sources_per_abundance_split: int | None = None,
) -> dict:
    """Plan or create non-overlapping real-image tiles for tiny Whiteflies.

    Every tile inherits its source image's acquisition-run split.  Boxes are
    assigned exactly once by center, including boxes clipped at a tile edge.
    Empty tiles are retained as real negative/background examples.  Synthetic
    images are never read by this pipeline.
    """
    if tile_size < 320:
        raise ValueError("tile_size must be at least 320 pixels")
    if not 1 <= jpeg_quality <= 95:
        raise ValueError("jpeg_quality must be between 1 and 95")
    if (
        smoke_sources_per_abundance_split is not None
        and smoke_sources_per_abundance_split < 1
    ):
        raise ValueError("smoke source limit must be positive")

    sources, stem_to_run, run_summaries, run_to_split = _source_inventory(seed)
    if smoke_sources_per_abundance_split is not None:
        selected = []
        selected_counts = Counter()
        for source in sources:
            image_path, _, abundance = source
            split = run_to_split[stem_to_run[image_path.stem]]
            key = (split, abundance)
            if selected_counts[key] >= smoke_sources_per_abundance_split:
                continue
            selected.append(source)
            selected_counts[key] += 1
        expected_keys = {
            (split, abundance) for split in SPLITS for abundance in ABUNDANCE_GROUPS
        }
        if set(selected_counts) != expected_keys:
            raise RuntimeError("Smoke selection could not cover every split/abundance")
        sources = selected

    if materialize:
        _reset_tiled_dataset(dataset_root)

    counts = {
        split: {
            "source_images": 0,
            "tiles": 0,
            "positive_tiles": 0,
            "negative_tiles": 0,
            "boxes": 0,
            "boundary_clipped_boxes": 0,
            "acquisition_runs": set(),
            "abundance": Counter(),
        }
        for split in SPLITS
    }
    records = []
    for image_path, xml_path, abundance in sources:
        acquisition_run = stem_to_run[image_path.stem]
        split = run_to_split[acquisition_run]
        with Image.open(image_path) as image:
            width, height = image.size
            image.verify()
        boxes = _pascal_box_coordinates(xml_path, width, height)
        planned_tiles = []
        assigned_boxes = 0
        for tile_y in _tile_origins(height, tile_size):
            for tile_x in _tile_origins(width, tile_size):
                labels = _tile_labels(
                    boxes,
                    tile_x=tile_x,
                    tile_y=tile_y,
                    tile_size=tile_size,
                )
                assigned_boxes += len(labels)
                boundary_clipped = _tile_boundary_clipped_box_count(
                    boxes,
                    tile_x=tile_x,
                    tile_y=tile_y,
                    tile_size=tile_size,
                )
                planned_tiles.append((tile_x, tile_y, labels, boundary_clipped))
        if assigned_boxes != len(boxes):
            raise RuntimeError(
                f"Tile box conservation failed for {image_path.name}: "
                f"{assigned_boxes} != {len(boxes)}"
            )

        rgb = None
        if materialize:
            with Image.open(image_path) as image:
                rgb = image.convert("RGB")
        for tile_x, tile_y, labels, boundary_clipped in planned_tiles:
            target_stem = (
                f"{abundance}__{image_path.stem}__x{tile_x:04d}_y{tile_y:04d}"
            )
            image_target = dataset_root / "images" / split / f"{target_stem}.jpg"
            label_target = dataset_root / "labels" / split / f"{target_stem}.txt"
            if materialize:
                image_target.parent.mkdir(parents=True, exist_ok=True)
                label_target.parent.mkdir(parents=True, exist_ok=True)
                tile = Image.new("RGB", (tile_size, tile_size), (114, 114, 114))
                crop = rgb.crop((
                    tile_x,
                    tile_y,
                    min(tile_x + tile_size, width),
                    min(tile_y + tile_size, height),
                ))
                tile.paste(crop, (0, 0))
                tile.save(
                    image_target,
                    format="JPEG",
                    quality=jpeg_quality,
                    subsampling=2,
                )
                label_target.write_text(
                    "\n".join(labels) + ("\n" if labels else ""),
                    encoding="utf-8",
                )

            split_counts = counts[split]
            split_counts["tiles"] += 1
            split_counts["boxes"] += len(labels)
            split_counts["boundary_clipped_boxes"] += boundary_clipped
            split_counts[
                "positive_tiles" if labels else "negative_tiles"
            ] += 1
            records.append({
                "source_image": str(image_path.relative_to(SOURCE_ROOT)),
                "image": str(image_target.relative_to(dataset_root)),
                "label": str(label_target.relative_to(dataset_root)),
                "split": split,
                "acquisition_run": acquisition_run,
                "abundance": abundance,
                "tile_xywh": [tile_x, tile_y, tile_size, tile_size],
                "source_size": [width, height],
                "boxes": len(labels),
            })
        if rgb is not None:
            rgb.close()
        split_counts = counts[split]
        split_counts["source_images"] += 1
        split_counts["acquisition_runs"].add(acquisition_run)
        split_counts["abundance"][abundance] += 1

    for left, right in (("train", "val"), ("train", "test"), ("val", "test")):
        overlap = counts[left]["acquisition_runs"] & counts[right]["acquisition_runs"]
        if overlap:
            raise RuntimeError(f"Tiled acquisition-run leakage {left}/{right}: {overlap}")

    yaml_path = dataset_root / "whitefly_tiled.yaml"
    manifest = {
        "schema_version": 2,
        "created_at": dt.datetime.now(dt.timezone.utc).isoformat(),
        "materialized": materialize,
        "source": {
            "doi": DATASET_DOI,
            "license": DATASET_LICENSE,
            "images": 3000,
            "annotation": "PASCAL VOC bounding boxes",
            "synthetic_images": 0,
        },
        "tiling": {
            "method": "non_overlapping_padded_edge_tiles",
            "tile_size": tile_size,
            "jpeg_quality": jpeg_quality,
            "box_assignment": "exactly once by object center; clip at tile edge",
            "boundary_caveat": (
                "A center-assigned clipped object can leave an unlabeled partial "
                "fragment in the adjacent non-overlapping tile; counts are reported"
            ),
            "padding_rgb": [114, 114, 114],
            "retain_empty_tiles": True,
        },
        "split": {
            "method": (
                "source tiles inherit deterministic contiguous acquisition-run split; "
                "no run appears in more than one split"
            ),
            "seed": seed,
            "test_used_for_selection": False,
            "counts": {
                split: {
                    **{
                        key: value
                        for key, value in counts[split].items()
                        if key not in {"acquisition_runs", "abundance"}
                    },
                    "acquisition_runs": len(counts[split]["acquisition_runs"]),
                    "abundance": dict(counts[split]["abundance"]),
                }
                for split in SPLITS
            },
            "groups": [
                {**run, "split": run_to_split[run["id"]]}
                for run in run_summaries
            ],
        },
        "smoke_sources_per_abundance_split": smoke_sources_per_abundance_split,
        "records": records,
    }
    if materialize:
        yaml_path.write_text(
            "\n".join([
                f"path: {dataset_root}",
                "train: images/train",
                "val: images/val",
                "test: images/test",
                "names:",
                "  0: whitefly",
                "",
            ]),
            encoding="utf-8",
        )
        atomic_write_json(dataset_root / "split_manifest.json", manifest)
    return manifest


def _load_reusable_tiled_manifest(
    *,
    seed: int,
    tile_size: int,
    jpeg_quality: int,
    dataset_root: Path = TILED_DATASET_ROOT,
) -> dict | None:
    """Reuse a fully materialized tile tree only when its contract still matches."""
    manifest_path = dataset_root / "split_manifest.json"
    yaml_path = dataset_root / "whitefly_tiled.yaml"
    if not manifest_path.is_file() or not yaml_path.is_file():
        return None
    try:
        manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
        counts = manifest["split"]["counts"]
        records = manifest["records"]
        expected_tiles = sum(int(counts[split]["tiles"]) for split in SPLITS)
        expected_sources = sum(
            int(counts[split]["source_images"]) for split in SPLITS
        )
        expected_boxes = sum(int(counts[split]["boxes"]) for split in SPLITS)
        contract_matches = (
            manifest.get("schema_version") == 2
            and manifest.get("materialized") is True
            and manifest.get("source", {}).get("images") == 3000
            and manifest.get("source", {}).get("synthetic_images") == 0
            and manifest.get("split", {}).get("seed") == seed
            and manifest.get("tiling", {}).get("tile_size") == tile_size
            and manifest.get("tiling", {}).get("jpeg_quality") == jpeg_quality
            and expected_sources == 3000
            and expected_tiles == len(records)
            and expected_tiles > 0
            and expected_boxes == 212948
        )
        if not contract_matches:
            return None
        source_tile_counts = Counter()
        source_expected_tiles = {}
        for record in records:
            if record.get("split") not in SPLITS:
                return None
            source_image = record.get("source_image")
            source_size = record.get("source_size")
            if (
                not isinstance(source_image, str)
                or not isinstance(source_size, list)
                or len(source_size) != 2
            ):
                return None
            width, height = (int(source_size[0]), int(source_size[1]))
            expected_for_source = (
                len(_tile_origins(width, tile_size))
                * len(_tile_origins(height, tile_size))
            )
            if source_image in source_expected_tiles:
                if source_expected_tiles[source_image] != expected_for_source:
                    return None
            else:
                source_expected_tiles[source_image] = expected_for_source
            source_tile_counts[source_image] += 1
            image_path = dataset_root / record["image"]
            label_path = dataset_root / record["label"]
            if not image_path.is_file() or not label_path.is_file():
                return None
        if (
            len(source_tile_counts) != 3000
            or source_tile_counts != Counter(source_expected_tiles)
        ):
            return None
    except (KeyError, TypeError, ValueError, json.JSONDecodeError):
        return None
    return manifest


def _result_dict(metrics) -> dict:
    results = getattr(metrics, "results_dict", {}) or {}
    return {
        str(key): round(float(value), 8)
        for key, value in results.items()
        if isinstance(value, (int, float))
    }


def _select_validation_threshold(metrics) -> dict:
    """Select the threshold that best protects all three acceptance metrics.

    The release contract requires precision, recall, and F1 to pass together,
    so maximizing F1 alone can choose an operating point with an avoidably weak
    precision or recall.  Select by ``min(P, R, F1)`` first and use F1 only as
    a deterministic tie-break.  The held-out test is never consulted.
    """
    import numpy as np

    box = getattr(metrics, "box", None)
    px = np.asarray(getattr(box, "px", []), dtype=float)
    f1_curve = np.asarray(getattr(box, "f1_curve", []), dtype=float)
    precision_curve = np.asarray(getattr(box, "p_curve", []), dtype=float)
    recall_curve = np.asarray(getattr(box, "r_curve", []), dtype=float)
    if px.ndim != 1 or px.size == 0:
        raise RuntimeError("Validation metrics do not expose confidence thresholds")
    curves = []
    for name, curve in (
        ("f1", f1_curve),
        ("precision", precision_curve),
        ("recall", recall_curve),
    ):
        if curve.ndim == 1:
            curve = curve[None, :]
        if curve.ndim != 2 or curve.shape[1] != px.size:
            raise RuntimeError(f"Invalid validation {name} curve shape {curve.shape}")
        curves.append(curve.mean(axis=0))
    mean_f1, mean_precision, mean_recall = curves
    primary = np.minimum.reduce((mean_precision, mean_recall, mean_f1))
    finite = np.isfinite(primary) & np.isfinite(mean_f1)
    if not finite.any():
        raise RuntimeError("Validation curves contain no finite operating point")
    best_primary = np.nanmax(primary[finite])
    candidates = np.flatnonzero(finite & np.isclose(primary, best_primary))
    index = int(candidates[np.nanargmax(mean_f1[candidates])])
    return {
        "value": round(float(px[index]), 8),
        "basis": "maximum min(precision, recall, F1) on validation; F1 tie-break; test was not used",
        "validation_primary": round(float(primary[index]), 8),
        "validation_f1": round(float(mean_f1[index]), 8),
        "validation_precision": round(float(mean_precision[index]), 8),
        "validation_recall": round(float(mean_recall[index]), 8),
        "selection_set": "validation",
        "test_used_for_selection": False,
    }


def _fixed_threshold_operating_point(metrics, threshold: float) -> dict:
    """Compute IoU=0.5 P/R/F1 at one frozen confidence threshold.

    Ultralytics' headline precision/recall are chosen from each evaluation
    set's confidence curve.  That is suitable on validation but would tune on
    test.  This helper instead filters raw test matches at the threshold that
    was already frozen on validation.
    """
    import numpy as np

    stats = getattr(metrics, "stats", {}) or {}
    try:
        tp = np.concatenate(stats["tp"], axis=0)
        confidence = np.concatenate(stats["conf"], axis=0)
        targets = np.concatenate(stats["target_cls"], axis=0)
    except (KeyError, TypeError, ValueError) as exc:
        raise RuntimeError("Evaluation metrics do not expose raw detection stats") from exc
    if tp.ndim != 2 or tp.shape[0] != confidence.shape[0] or tp.shape[1] < 1:
        raise RuntimeError("Invalid raw detection stats shape")
    selected = confidence >= threshold
    true_positives = int(np.asarray(tp[selected, 0], dtype=bool).sum())
    predicted = int(selected.sum())
    target_count = int(targets.size)
    false_positives = predicted - true_positives
    false_negatives = target_count - true_positives
    precision = true_positives / predicted if predicted else 0.0
    recall = true_positives / target_count if target_count else 0.0
    f1 = 2 * precision * recall / (precision + recall) if precision + recall else 0.0
    return {
        "confidence_threshold": round(float(threshold), 8),
        "iou_threshold": 0.5,
        "precision": round(precision, 8),
        "recall": round(recall, 8),
        "f1": round(f1, 8),
        "true_positives": true_positives,
        "false_positives": false_positives,
        "false_negatives": false_negatives,
        "threshold_selection_set": "validation",
        "test_used_for_threshold_selection": False,
    }


def _quality_gate(operating_point: dict) -> dict:
    metrics = {
        name: float(operating_point[name])
        for name in ("precision", "recall", "f1")
    }
    return {
        "target": TARGET_DETECTION_PRECISION_RECALL_F1,
        "metrics": metrics,
        "passed": all(
            value >= TARGET_DETECTION_PRECISION_RECALL_F1
            for value in metrics.values()
        ),
    }


def train_detector(
    *,
    model_name: str,
    epochs: int,
    image_size: int,
    batch_size: int,
    device: str,
    seed: int,
    workers: int,
    run_name: str,
    tile_size: int,
    tile_jpeg_quality: int,
    mosaic: float,
    scale: float,
    translate: float,
    rebuild_tiles: bool,
    optimizer: str = "auto",
    learning_rate: float = 0.01,
    final_learning_rate_fraction: float = 0.01,
    warmup_epochs: float = 3.0,
    tiled_dataset_root: Path = TILED_DATASET_ROOT,
    open_test_on_validation_pass: bool = True,
) -> dict:
    try:
        import torch
        import ultralytics
        from ultralytics import YOLO
    except ImportError as exc:
        raise RuntimeError(
            "Install requirements-training-detector.txt in an isolated environment"
        ) from exc

    split_manifest = None if rebuild_tiles else _load_reusable_tiled_manifest(
        seed=seed,
        tile_size=tile_size,
        jpeg_quality=tile_jpeg_quality,
        dataset_root=tiled_dataset_root,
    )
    reused_prepared_tiles = split_manifest is not None
    if split_manifest is None:
        split_manifest = prepare_tiled_yolo_dataset(
            seed,
            tile_size=tile_size,
            jpeg_quality=tile_jpeg_quality,
            dataset_root=tiled_dataset_root,
        )
    yaml_path = tiled_dataset_root / "whitefly_tiled.yaml"
    split_manifest_path = tiled_dataset_root / "split_manifest.json"
    source_manifest_path = SOURCE_ROOT.parents[1] / "dataset_manifest.json"
    integrity = {
        "split_manifest": {
            "file": str(split_manifest_path.relative_to(REPO_ROOT)),
            "sha256": sha256_file(split_manifest_path),
            "schema_version": split_manifest["schema_version"],
        },
        "source_dataset_manifest": (
            {
                "file": str(source_manifest_path.relative_to(REPO_ROOT)),
                "sha256": sha256_file(source_manifest_path),
            }
            if source_manifest_path.is_file()
            else None
        ),
    }
    random.seed(seed)

    model = YOLO(model_name)
    train_results = model.train(
        data=str(yaml_path),
        epochs=epochs,
        imgsz=image_size,
        batch=batch_size,
        device=device,
        workers=workers,
        project=str(RUNS_DIR),
        name=run_name,
        exist_ok=True,
        seed=seed,
        deterministic=True,
        patience=max(5, min(15, epochs // 3)),
        close_mosaic=max(1, min(10, epochs // 5)),
        mosaic=mosaic,
        scale=scale,
        translate=translate,
        optimizer=optimizer,
        lr0=learning_rate,
        lrf=final_learning_rate_fraction,
        warmup_epochs=warmup_epochs,
        max_det=MAX_DETECTIONS,
        plots=True,
        verbose=True,
    )
    best_path = Path(train_results.save_dir) / "weights" / "best.pt"
    if not best_path.is_file():
        raise RuntimeError(f"Training did not produce {best_path}")

    # Freeze best.pt, then obtain the confidence curve from that exact
    # validation-selected checkpoint. ``model.train()`` may expose the final
    # epoch's validator rather than best.pt, so it is not a safe threshold source.
    frozen = YOLO(str(best_path))
    validation_results = frozen.val(
        data=str(yaml_path),
        split="val",
        imgsz=image_size,
        batch=batch_size,
        device=device,
        workers=workers,
        max_det=MAX_DETECTIONS,
        plots=True,
        project=str(RUNS_DIR),
        name=f"{run_name}_validation",
        exist_ok=True,
    )
    runtime_threshold = _select_validation_threshold(validation_results)
    validation_operating_point = {
        "confidence_threshold": runtime_threshold["value"],
        "iou_threshold": 0.5,
        "precision": runtime_threshold["validation_precision"],
        "recall": runtime_threshold["validation_recall"],
        "f1": runtime_threshold["validation_f1"],
        "threshold_selection_set": "validation",
        "test_used_for_threshold_selection": False,
    }
    validation_gate = _quality_gate(validation_operating_point)
    candidate_path = Path(train_results.save_dir) / "candidate_metrics.json"
    candidate_report = {
        "model_id": "whitefly_detector_candidate",
        "trained_at": dt.datetime.now(dt.timezone.utc).isoformat(),
        "status": "validation_gate_passed" if validation_gate["passed"] else "validation_gate_failed",
        "published": False,
        "checkpoint": {
            "file": str(best_path),
            "sha256": sha256_file(best_path),
            "selected_on": "validation",
            "test_used_for_selection": False,
        },
        "training": {
            "architecture": model_name,
            "epochs": epochs,
            "image_size": image_size,
            "batch_size": batch_size,
            "device": device,
            "seed": seed,
            "run_name": run_name,
            "tile_size": tile_size,
            "tile_jpeg_quality": tile_jpeg_quality,
            "tiled_dataset_root": str(tiled_dataset_root),
            "augmentation": {
                "mosaic": mosaic,
                "scale": scale,
                "translate": translate,
            },
            "optimization": {
                "optimizer": optimizer,
                "learning_rate": learning_rate,
                "final_learning_rate_fraction": final_learning_rate_fraction,
                "warmup_epochs": warmup_epochs,
            },
            "reused_prepared_tiles": reused_prepared_tiles,
            "test_opening_enabled": open_test_on_validation_pass,
        },
        "dataset": split_manifest["source"],
        "tiling": split_manifest["tiling"],
        "split": split_manifest["split"],
        "integrity": integrity,
        "validation": _result_dict(validation_results),
        "runtime_threshold": runtime_threshold,
        "validation_operating_point": validation_operating_point,
        "validation_gate": validation_gate,
        "test": {
            "evaluated": False,
            "reason": "validation gate must pass before the held-out test is opened",
        },
    }
    if not validation_gate["passed"]:
        atomic_write_json(candidate_path, candidate_report)
        return candidate_report

    if not open_test_on_validation_pass:
        candidate_report.update({
            "status": "validation_gate_passed_test_sealed",
            "test": {
                "evaluated": False,
                "reason": (
                    "validation gate passed, but the held-out test remains sealed "
                    "by the validation-only supervisor contract"
                ),
            },
        })
        atomic_write_json(candidate_path, candidate_report)
        return candidate_report

    # Test is opened only after checkpoint and runtime threshold were selected
    # exclusively on validation and the validation P/R/F1 gate passed.
    test_results = frozen.val(
        data=str(yaml_path),
        split="test",
        imgsz=image_size,
        batch=batch_size,
        device=device,
        workers=workers,
        max_det=MAX_DETECTIONS,
        plots=True,
        project=str(RUNS_DIR),
        name=f"{run_name}_test",
        exist_ok=True,
    )
    test_operating_point = _fixed_threshold_operating_point(
        test_results,
        runtime_threshold["value"],
    )
    test_gate = _quality_gate(test_operating_point)
    test_ap = _result_dict(test_results)
    test_summary = {
        "metrics/precision(B)": test_operating_point["precision"],
        "metrics/recall(B)": test_operating_point["recall"],
        "metrics/F1(B)": test_operating_point["f1"],
        "metrics/mAP50(B)": test_ap.get("metrics/mAP50(B)"),
        "metrics/mAP50-95(B)": test_ap.get("metrics/mAP50-95(B)"),
        "operating_point": test_operating_point,
        "threshold_selected_on": "validation",
        "test_used_for_model_or_threshold_selection": False,
    }
    candidate_report.update({
        "status": "test_gate_passed" if test_gate["passed"] else "test_gate_failed",
        "test": test_summary,
        "test_gate": test_gate,
    })
    if not test_gate["passed"]:
        atomic_write_json(candidate_path, candidate_report)
        return candidate_report

    exported = Path(frozen.export(
        format="onnx",
        imgsz=image_size,
        dynamic=True,
        simplify=True,
        opset=17,
        max_det=MAX_DETECTIONS,
    ))

    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    pt_target = MODEL_DIR / "whitefly_detector.pt"
    onnx_target = MODEL_DIR / "whitefly_detector.onnx"
    _atomic_copy(best_path, pt_target)
    _atomic_copy(exported, onnx_target)
    metrics = {
        "model_id": "whitefly_detector",
        "trained_at": dt.datetime.now(dt.timezone.utc).isoformat(),
        "framework": {
            "ultralytics": ultralytics.__version__,
            "torch": torch.__version__,
            "training_code_license": "AGPL-3.0",
            "distribution_note": (
                "Obtain a commercial Ultralytics licence or comply with AGPL "
                "before proprietary distribution."
            ),
        },
        "architecture": model_name,
        "training": {
            "epochs": epochs,
            "image_size": image_size,
            "batch_size": batch_size,
            "device": device,
            "seed": seed,
            "run_name": run_name,
            "tile_size": tile_size,
            "tile_jpeg_quality": tile_jpeg_quality,
            "tiled_dataset_root": str(tiled_dataset_root),
            "augmentation": {
                "mosaic": mosaic,
                "scale": scale,
                "translate": translate,
            },
            "reused_prepared_tiles": reused_prepared_tiles,
            "deterministic_requested": True,
            "determinism_caveat": (
                "PyTorch MPS may warn that index_put_with_accumulate has no "
                "deterministic implementation"
                if str(device).startswith("mps")
                else None
            ),
        },
        "task": "object_detection_and_counting",
        "classes": ["whitefly"],
        "input": {
            "image_size": image_size,
            "max_detections": MAX_DETECTIONS,
            "note": (
                "Median source box is ~0.78% of image width; high-resolution or "
                "tiled inference is recommended for tiny insects."
            ),
        },
        "dataset": split_manifest["source"],
        "tiling": split_manifest["tiling"],
        "split": split_manifest["split"],
        "integrity": integrity,
        "selection": {
            "set": "validation",
            "checkpoint": "best.pt",
            "test_used_for_selection": False,
        },
        "validation": _result_dict(validation_results),
        "validation_operating_point": validation_operating_point,
        "validation_gate": validation_gate,
        "test": test_summary,
        "test_gate": test_gate,
        "artifacts": {
            "pytorch": {
                "file": pt_target.name,
                "sha256": sha256_file(pt_target),
            },
            "onnx": {
                "file": onnx_target.name,
                "sha256": sha256_file(onnx_target),
            },
        },
        "production_eligible": False,
        "field_validated": False,
        "runtime_threshold": runtime_threshold,
        "release_blockers": [
            "Independent Thai-field holdout is not available",
            "Relevant negative insect/background images are not present",
            "No upstream plant/leaf identity for definitive leakage exclusion",
            "Distribution licensing review is required",
        ],
    }
    atomic_write_json(MODEL_DIR / "whitefly_detector_metrics.json", metrics)
    candidate_report.update({
        "status": "published_experimental_artifact",
        "published": True,
        "published_metrics_file": str(MODEL_DIR / "whitefly_detector_metrics.json"),
    })
    atomic_write_json(candidate_path, candidate_report)
    return metrics


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--prepare-only", action="store_true")
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--smoke-prepare", action="store_true")
    parser.add_argument("--model", default="yolo26n.pt")
    parser.add_argument("--epochs", type=int, default=30)
    parser.add_argument("--imgsz", type=int, default=1280)
    parser.add_argument("--batch-size", type=int, default=2)
    parser.add_argument("--device", default="mps")
    parser.add_argument("--workers", type=int, default=2)
    parser.add_argument("--seed", type=int, default=1)
    parser.add_argument("--run-name", default="whitefly_detector")
    parser.add_argument("--tile-size", type=int, default=DEFAULT_TILE_SIZE)
    parser.add_argument(
        "--tile-jpeg-quality",
        type=int,
        default=DEFAULT_TILE_JPEG_QUALITY,
    )
    parser.add_argument("--mosaic", type=float, default=DEFAULT_MOSAIC)
    parser.add_argument("--scale", type=float, default=DEFAULT_SCALE)
    parser.add_argument("--translate", type=float, default=DEFAULT_TRANSLATE)
    parser.add_argument("--optimizer", default="auto")
    parser.add_argument("--lr0", type=float, default=0.01)
    parser.add_argument("--lrf", type=float, default=0.01)
    parser.add_argument("--warmup-epochs", type=float, default=3.0)
    parser.add_argument("--rebuild-tiles", action="store_true")
    parser.add_argument(
        "--validation-only",
        action="store_true",
        help=(
            "Keep the held-out test sealed even if the validation gate passes; "
            "use while comparing candidate geometry or architecture."
        ),
    )
    parser.add_argument(
        "--tiled-dataset-root",
        type=Path,
        default=TILED_DATASET_ROOT,
        help=(
            "Materialized tile cache. Use a distinct directory when comparing "
            "tile sizes so an active run's data is never replaced."
        ),
    )
    args = parser.parse_args()

    if args.dry_run and not args.prepare_only:
        parser.error("--dry-run requires --prepare-only")
    if args.smoke_prepare and not args.prepare_only:
        parser.error("--smoke-prepare requires --prepare-only")
    if args.dry_run and args.smoke_prepare:
        parser.error("choose only one of --dry-run or --smoke-prepare")
    if not 0.0 <= args.mosaic <= 1.0:
        parser.error("--mosaic must be between 0 and 1")
    if not 0.0 <= args.scale < 1.0:
        parser.error("--scale must be in [0, 1)")
    if not 0.0 <= args.translate < 1.0:
        parser.error("--translate must be in [0, 1)")
    if args.lr0 <= 0:
        parser.error("--lr0 must be positive")
    if not 0.0 < args.lrf <= 1.0:
        parser.error("--lrf must be in (0, 1]")
    if args.warmup_epochs < 0:
        parser.error("--warmup-epochs must be non-negative")

    if args.prepare_only:
        started = time.perf_counter()
        dataset_root = args.tiled_dataset_root.resolve()
        smoke_limit = None
        materialize = not args.dry_run
        if args.smoke_prepare:
            dataset_root = RUNS_DIR / "whitefly_tile_prepare_smoke"
            smoke_limit = 1
        manifest = prepare_tiled_yolo_dataset(
            args.seed,
            tile_size=args.tile_size,
            jpeg_quality=args.tile_jpeg_quality,
            materialize=materialize,
            dataset_root=dataset_root,
            smoke_sources_per_abundance_split=smoke_limit,
        )
        elapsed = time.perf_counter() - started
        payload = {
            "materialized": materialize,
            "dataset_root": str(dataset_root),
            "elapsed_seconds": round(elapsed, 3),
            "tiling": manifest["tiling"],
            "split": manifest["split"],
        }
        if materialize:
            payload["materialized_bytes"] = sum(
                path.stat().st_size
                for path in dataset_root.rglob("*")
                if path.is_file()
            )
        print(json.dumps(payload, indent=2))
        return
    metrics = train_detector(
        model_name=args.model,
        epochs=args.epochs,
        image_size=args.imgsz,
        batch_size=args.batch_size,
        device=args.device,
        seed=args.seed,
        workers=args.workers,
        run_name=args.run_name,
        tile_size=args.tile_size,
        tile_jpeg_quality=args.tile_jpeg_quality,
        mosaic=args.mosaic,
        scale=args.scale,
        translate=args.translate,
        optimizer=args.optimizer,
        learning_rate=args.lr0,
        final_learning_rate_fraction=args.lrf,
        warmup_epochs=args.warmup_epochs,
        rebuild_tiles=args.rebuild_tiles,
        tiled_dataset_root=args.tiled_dataset_root.resolve(),
        open_test_on_validation_pass=not args.validation_only,
    )
    print(json.dumps(metrics, indent=2))


if __name__ == "__main__":
    main()
