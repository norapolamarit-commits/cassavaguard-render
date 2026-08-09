#!/usr/bin/env python3
"""Validation-only Whitefly full-frame/tiled inference benchmark.

This script intentionally hard-codes the ``val`` tree and rejects paths that
contain ``test``. It may be used to select inference geometry and confidence on
validation; it must never be repointed at the held-out test set.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import math
import time
from pathlib import Path

import numpy as np
from PIL import Image


def parse_args():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--data-root", type=Path, required=True)
    parser.add_argument("--model", type=Path, required=True)
    parser.add_argument("--configs", default="full,tile1024o20")
    parser.add_argument("--max-images", type=int, default=45)
    parser.add_argument("--seed", type=int, default=20260801)
    parser.add_argument("--imgsz", type=int, default=640)
    parser.add_argument("--max-det", type=int, default=700)
    parser.add_argument("--device", default="mps")
    parser.add_argument("--batch", type=int, default=8)
    parser.add_argument("--prediction-conf", type=float, default=0.001)
    parser.add_argument("--merge-iou", type=float, default=0.5)
    parser.add_argument("--match-iou", type=float, default=0.5)
    parser.add_argument("--output", type=Path)
    return parser.parse_args()


def _assert_validation_only(root: Path) -> None:
    root = root.resolve()
    required = (root / "images" / "val", root / "labels" / "val")
    if any(not path.is_dir() for path in required):
        raise SystemExit(f"validation directories are missing under {root}")
    if any("test" in part.lower() for path in required for part in path.parts):
        raise SystemExit("refusing to benchmark a path containing 'test'")


def _validation_rows(root: Path, max_images: int, seed: int) -> list[tuple[Path, Path, str]]:
    rows = []
    for label_path in sorted((root / "labels" / "val").glob("*.txt")):
        image_path = root / "images" / "val" / f"{label_path.stem}.jpg"
        abundance = label_path.stem.split("__", 1)[0]
        rows.append((image_path, label_path, abundance))
    if max_images <= 0 or max_images >= len(rows):
        return rows

    groups: dict[str, list[tuple[Path, Path, str]]] = {}
    for row in rows:
        groups.setdefault(row[2], []).append(row)
    selected = []
    base, remainder = divmod(max_images, len(groups))
    for group_index, abundance in enumerate(sorted(groups)):
        quota = base + int(group_index < remainder)
        ranked = sorted(
            groups[abundance],
            key=lambda row: hashlib.sha256(
                f"{seed}:{row[0].name}".encode()
            ).hexdigest(),
        )
        selected.extend(ranked[:quota])
    return sorted(selected, key=lambda row: row[0].name)


def _ground_truth(label_path: Path, width: int, height: int) -> np.ndarray:
    rows = []
    for line in label_path.read_text(encoding="utf-8").splitlines():
        if not line.strip():
            continue
        _class_id, x_center, y_center, box_width, box_height = map(float, line.split())
        x_center *= width
        y_center *= height
        box_width *= width
        box_height *= height
        rows.append([
            x_center - box_width / 2.0,
            y_center - box_height / 2.0,
            x_center + box_width / 2.0,
            y_center + box_height / 2.0,
        ])
    return np.asarray(rows, dtype=np.float32).reshape(-1, 4)


def _positions(length: int, tile: int, overlap: float) -> list[int]:
    if length <= tile:
        return [0]
    stride = max(1, int(round(tile * (1.0 - overlap))))
    positions = list(range(0, length - tile + 1, stride))
    if positions[-1] != length - tile:
        positions.append(length - tile)
    return positions


def _iou_one_to_many(box: np.ndarray, boxes: np.ndarray) -> np.ndarray:
    if len(boxes) == 0:
        return np.zeros(0, dtype=np.float32)
    top_left = np.maximum(box[:2], boxes[:, :2])
    bottom_right = np.minimum(box[2:], boxes[:, 2:])
    intersection = np.prod(np.maximum(0.0, bottom_right - top_left), axis=1)
    area = np.prod(np.maximum(0.0, box[2:] - box[:2]))
    other_area = np.prod(np.maximum(0.0, boxes[:, 2:] - boxes[:, :2]), axis=1)
    return intersection / np.maximum(area + other_area - intersection, 1e-12)


def _nms(boxes: np.ndarray, scores: np.ndarray, threshold: float, max_det: int) -> np.ndarray:
    order = np.argsort(-scores, kind="stable")
    keep = []
    while len(order) and len(keep) < max_det:
        current = int(order[0])
        keep.append(current)
        if len(order) == 1:
            break
        remaining = order[1:]
        order = remaining[_iou_one_to_many(boxes[current], boxes[remaining]) <= threshold]
    return np.asarray(keep, dtype=np.int64)


def _extract(result, x_offset: int = 0, y_offset: int = 0) -> tuple[np.ndarray, np.ndarray]:
    if result.boxes is None or len(result.boxes) == 0:
        return np.zeros((0, 4), dtype=np.float32), np.zeros(0, dtype=np.float32)
    boxes = result.boxes.xyxy.detach().cpu().numpy().astype(np.float32)
    boxes[:, [0, 2]] += x_offset
    boxes[:, [1, 3]] += y_offset
    scores = result.boxes.conf.detach().cpu().numpy().astype(np.float32)
    return boxes, scores


def _predict_full(model, image: Image.Image, args) -> tuple[np.ndarray, np.ndarray, int]:
    result = model.predict(
        source=image,
        imgsz=args.imgsz,
        conf=args.prediction_conf,
        iou=args.merge_iou,
        max_det=args.max_det,
        device=args.device,
        verbose=False,
    )[0]
    boxes, scores = _extract(result)
    return boxes, scores, 1


def _predict_tiled(
    model,
    image: Image.Image,
    tile: int,
    overlap: float,
    args,
) -> tuple[np.ndarray, np.ndarray, int]:
    x_positions = _positions(image.width, tile, overlap)
    y_positions = _positions(image.height, tile, overlap)
    offsets = [(x, y) for y in y_positions for x in x_positions]
    crops = [image.crop((x, y, min(x + tile, image.width), min(y + tile, image.height)))
             for x, y in offsets]
    boxes_parts, score_parts = [], []
    for start in range(0, len(crops), args.batch):
        batch_crops = crops[start:start + args.batch]
        results = model.predict(
            source=batch_crops,
            imgsz=args.imgsz,
            conf=args.prediction_conf,
            iou=args.merge_iou,
            max_det=args.max_det,
            device=args.device,
            verbose=False,
        )
        for result, (x, y) in zip(results, offsets[start:start + args.batch]):
            boxes, scores = _extract(result, x, y)
            boxes_parts.append(boxes)
            score_parts.append(scores)
    boxes = np.concatenate(boxes_parts) if boxes_parts else np.zeros((0, 4), dtype=np.float32)
    scores = np.concatenate(score_parts) if score_parts else np.zeros(0, dtype=np.float32)
    if len(boxes):
        keep = _nms(boxes, scores, args.merge_iou, args.max_det)
        boxes, scores = boxes[keep], scores[keep]
    return boxes, scores, len(crops)


def _config(value: str) -> tuple[str, int | None, float | None]:
    if value == "full":
        return value, None, None
    if not value.startswith("tile") or "o" not in value:
        raise ValueError(f"invalid config {value!r}; use full or tile1024o20")
    tile_text, overlap_text = value[4:].split("o", 1)
    tile = int(tile_text)
    overlap = int(overlap_text) / 100.0
    if tile <= 0 or not 0 <= overlap < 0.5:
        raise ValueError(f"invalid tile config {value!r}")
    return value, tile, overlap


def _score_image(
    boxes: np.ndarray,
    scores: np.ndarray,
    ground_truth: np.ndarray,
    match_iou: float,
) -> list[tuple[float, int]]:
    matched = np.zeros(len(ground_truth), dtype=bool)
    outcomes = []
    for index in np.argsort(-scores, kind="stable"):
        overlaps = _iou_one_to_many(boxes[index], ground_truth)
        overlaps[matched] = -1.0
        best = int(overlaps.argmax()) if len(overlaps) else -1
        is_true_positive = best >= 0 and overlaps[best] >= match_iou
        if is_true_positive:
            matched[best] = True
        outcomes.append((float(scores[index]), int(is_true_positive)))
    return outcomes


def _metrics(outcomes: list[tuple[float, int]], ground_truth_count: int) -> dict:
    if not outcomes:
        return {
            "precision": 0.0,
            "recall": 0.0,
            "f1": 0.0,
            "ap50": 0.0,
            "confidence": None,
            "acceptance_met": False,
        }
    ordered = sorted(outcomes, key=lambda row: -row[0])
    scores = np.asarray([row[0] for row in ordered])
    true_positive = np.asarray([row[1] for row in ordered], dtype=np.int64)
    tp = np.cumsum(true_positive)
    fp = np.cumsum(1 - true_positive)
    precision = tp / np.maximum(tp + fp, 1)
    recall = tp / max(ground_truth_count, 1)
    f1 = 2.0 * precision * recall / np.maximum(precision + recall, 1e-12)
    # A threshold retains every prediction with the same score, so only evaluate
    # the final row of each score tie. This keeps the selected operating point
    # reproducible by ``score >= confidence``.
    threshold_rows = np.concatenate((scores[:-1] > scores[1:], [True]))
    candidates = np.flatnonzero(threshold_rows)
    best = int(candidates[np.argmax(f1[candidates])])

    precision_envelope = np.maximum.accumulate(precision[::-1])[::-1]
    recall_points = np.concatenate(([0.0], recall, [1.0]))
    precision_points = np.concatenate(([precision_envelope[0]], precision_envelope, [0.0]))
    ap50 = float(np.sum((recall_points[1:] - recall_points[:-1]) * precision_points[1:]))
    best_precision = float(precision[best])
    best_recall = float(recall[best])
    best_f1 = float(f1[best])
    return {
        "precision": best_precision,
        "recall": best_recall,
        "f1": best_f1,
        "ap50": ap50,
        "confidence": float(scores[best]),
        "tp": int(tp[best]),
        "fp": int(fp[best]),
        "fn": int(ground_truth_count - tp[best]),
        "acceptance_met": min(best_precision, best_recall, best_f1) >= 0.75,
    }


def _metrics_at_threshold(
    outcomes: list[tuple[float, int]],
    ground_truth_count: int,
    threshold: float,
) -> dict:
    retained = [row for row in outcomes if row[0] >= threshold]
    true_positive = sum(row[1] for row in retained)
    false_positive = len(retained) - true_positive
    false_negative = ground_truth_count - true_positive
    precision = true_positive / max(true_positive + false_positive, 1)
    recall = true_positive / max(ground_truth_count, 1)
    f1 = 2.0 * precision * recall / max(precision + recall, 1e-12)
    return {
        "precision": precision,
        "recall": recall,
        "f1": f1,
        "confidence": threshold,
        "tp": true_positive,
        "fp": false_positive,
        "fn": false_negative,
    }


def main() -> None:
    args = parse_args()
    root = args.data_root.resolve()
    _assert_validation_only(root)
    rows = _validation_rows(root, args.max_images, args.seed)
    from ultralytics import YOLO

    model = YOLO(str(args.model.resolve()))
    reports = []
    for config_text in args.configs.split(","):
        name, tile, overlap = _config(config_text.strip())
        outcomes = []
        outcomes_by_abundance: dict[str, list[tuple[float, int]]] = {}
        total_ground_truth = 0
        forward_passes = 0
        started = time.perf_counter()
        abundance_images: dict[str, int] = {}
        abundance_boxes: dict[str, int] = {}
        for image_path, label_path, abundance in rows:
            if "test" in str(image_path).lower() or "test" in str(label_path).lower():
                raise RuntimeError("test path reached validation-only loop")
            with Image.open(image_path) as opened:
                image = opened.convert("RGB")
            ground_truth = _ground_truth(label_path, image.width, image.height)
            if tile is None:
                boxes, scores, passes = _predict_full(model, image, args)
            else:
                boxes, scores, passes = _predict_tiled(model, image, tile, overlap, args)
            image_outcomes = _score_image(boxes, scores, ground_truth, args.match_iou)
            outcomes.extend(image_outcomes)
            outcomes_by_abundance.setdefault(abundance, []).extend(image_outcomes)
            total_ground_truth += len(ground_truth)
            forward_passes += passes
            abundance_images[abundance] = abundance_images.get(abundance, 0) + 1
            abundance_boxes[abundance] = abundance_boxes.get(abundance, 0) + len(ground_truth)
        elapsed = time.perf_counter() - started
        overall_metrics = _metrics(outcomes, total_ground_truth)
        selected_confidence = overall_metrics["confidence"]
        report = {
            "config": name,
            "selection_set": "validation",
            "test_opened": False,
            "images": len(rows),
            "ground_truth_boxes": total_ground_truth,
            "abundance_images": abundance_images,
            "abundance_boxes": abundance_boxes,
            "forward_passes": forward_passes,
            "elapsed_seconds": elapsed,
            "seconds_per_image": elapsed / max(len(rows), 1),
            "network_image_size": args.imgsz,
            "raw_prediction_confidence": args.prediction_conf,
            "merge_iou": args.merge_iou,
            "iou_match": args.match_iou,
            "max_detections_per_image": args.max_det,
            "metrics_at_validation_selected_confidence": overall_metrics,
            "metrics_by_abundance_at_global_selected_confidence": {
                abundance: _metrics_at_threshold(
                    group_outcomes,
                    abundance_boxes[abundance],
                    selected_confidence,
                )
                for abundance, group_outcomes in sorted(outcomes_by_abundance.items())
            },
        }
        reports.append(report)
        print(json.dumps(report, indent=2), flush=True)

    payload = {
        "contract": {
            "selection_set": "validation",
            "test_opened": False,
            "confidence_selected_on": "validation micro-F1",
            "acceptance": "precision >= 0.75 AND recall >= 0.75 AND F1 >= 0.75 at IoU 0.50",
        },
        "model": str(args.model.resolve()),
        "data_root": str(root),
        "sample_seed": args.seed,
        "reports": reports,
    }
    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
