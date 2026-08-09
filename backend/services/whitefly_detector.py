"""Verified ONNX runtime for the experimental cassava-whitefly detector."""
from __future__ import annotations

import json
import math
import threading

import numpy as np
import onnxruntime as ort
from PIL import Image

from backend.config import AI_SERVING_MODE, BASE_DIR, IS_PRODUCTION
from backend.services.model_contract import file_sha256

MODEL_DIR = BASE_DIR / "backend" / "ml_models"
METRICS_PATH = MODEL_DIR / "whitefly_detector_metrics.json"

_session = None
_metrics = None
_loaded = False
_access_lock = threading.RLock()

# Legacy artifacts did not record their training tile geometry. Keep the old 4x
# fallback only for those artifacts; newly published detectors must use the source
# tile size recorded in their verified metadata so tiny insects reach the model at
# the same scale used during training.
SOURCE_TILE_SCALE = 4
TILE_OVERLAP = 0.20
MAX_TILES = 32
MAX_GLOBAL_DETECTIONS = 1200
CROSS_TILE_NMS_IOU = 0.50


def _load() -> None:
    global _session, _metrics, _loaded
    if _loaded:
        return
    _loaded = True
    try:
        metadata = json.loads(METRICS_PATH.read_text(encoding="utf-8"))
        if metadata.get("classes") != ["whitefly"]:
            raise ValueError("detector class order mismatch")
        if metadata.get("task") != "object_detection_and_counting":
            raise ValueError("detector task mismatch")
        selection = metadata.get("selection", {})
        if (
            selection.get("set") != "validation"
            or selection.get("test_used_for_selection") is not False
        ):
            raise ValueError("detector was not selected exclusively on validation")
        threshold = metadata.get("runtime_threshold", {})
        if (
            threshold.get("selection_set") != "validation"
            or threshold.get("test_used_for_selection") is not False
        ):
            raise ValueError("detector threshold was not selected exclusively on validation")
        if (
            IS_PRODUCTION
            and metadata.get("production_eligible") is not True
            and AI_SERVING_MODE != "review_only"
        ):
            raise ValueError("experimental detector is not approved for production")

        record = metadata["artifacts"]["onnx"]
        model_path = MODEL_DIR / record["file"]
        if file_sha256(model_path) != record["sha256"]:
            raise ValueError("detector ONNX SHA-256 mismatch")
        session_options = ort.SessionOptions()
        session_options.enable_cpu_mem_arena = False
        session_options.enable_mem_pattern = False
        session_options.intra_op_num_threads = 1
        session_options.inter_op_num_threads = 1
        session = ort.InferenceSession(
            str(model_path),
            sess_options=session_options,
            providers=["CPUExecutionProvider"],
        )
        inputs, outputs = session.get_inputs(), session.get_outputs()
        if len(inputs) != 1 or len(outputs) != 1:
            raise ValueError("detector must have one input and one output")
        max_detections = int(metadata["input"].get("max_detections", 300))
        if outputs[0].shape[-2:] != [max_detections, 6]:
            raise ValueError(f"unexpected detector output shape {outputs[0].shape}")
        size = int(metadata["input"]["image_size"])
        smoke = np.zeros((1, 3, size, size), dtype=np.float32)
        predictions = np.asarray(session.run(None, {inputs[0].name: smoke})[0])
        if (
            predictions.shape != (1, max_detections, 6)
            or not np.isfinite(predictions).all()
        ):
            raise ValueError("invalid detector smoke output")

        _session = session
        _metrics = metadata
        evaluation = metadata.get("test", {})
        label = "test"
        if evaluation.get("evaluated") is False:
            evaluation = metadata["validation_operating_point"]
            label = "validation F1"
            score = float(evaluation["f1"])
        else:
            score = float(evaluation["metrics/mAP50(B)"])
            label = "test mAP50"
        print(f"[ai_engine] loaded experimental Whitefly detector ({label}={score:.3f})")
    except FileNotFoundError:
        print("[ai_engine] Whitefly detector is not trained yet")
    except Exception as exc:  # pragma: no cover - defensive fail-closed path
        _session = None
        _metrics = None
        print(f"[ai_engine] failed to load Whitefly detector: {exc}")


def get_whitefly_session():
    with _access_lock:
        _load()
        return _session


def get_whitefly_metrics():
    with _access_lock:
        _load()
        return _metrics


def _axis_starts(length: int, tile_size: int, overlap: float) -> list[int]:
    """Deterministic starts that cover an axis and anchor its far edge."""
    if length <= tile_size:
        return [0]
    stride = max(1, int(round(tile_size * (1.0 - overlap))))
    last = length - tile_size
    starts = list(range(0, last + 1, stride))
    if starts[-1] != last:
        starts.append(last)
    return starts


def _tile_plan(
    width: int,
    height: int,
    model_size: int,
    *,
    source_tile_size: int | None = None,
    overlap: float = TILE_OVERLAP,
    max_tiles: int = MAX_TILES,
) -> list[tuple[int, int, int, int]]:
    """Return bounded, full-coverage source-space ``(x0,y0,x1,y1)`` tiles.

    Normal uploads use the metadata-declared training tile size. For a legacy
    artifact without that field, they use the historical 4x-model-input fallback.
    For an unusually large/aspect-ratio
    image, a deterministic grid of at most ``max_tiles`` overlapping regions covers
    the full source. The fallback chooses rows/columns that keep regions near-square;
    unlike growing one giant square, it also bounds each temporary crop's pixel area.
    """
    if width < 1 or height < 1:
        raise ValueError("image dimensions must be positive")
    if not 0.0 <= overlap < 1.0:
        raise ValueError("tile overlap must be in [0, 1)")
    if isinstance(max_tiles, bool) or not isinstance(max_tiles, int) or max_tiles < 1:
        raise ValueError("max_tiles must be a positive integer")
    if source_tile_size is not None and (
        isinstance(source_tile_size, bool)
        or not isinstance(source_tile_size, int)
        or source_tile_size < model_size
    ):
        raise ValueError("source_tile_size must be an integer >= model_size")

    tile_size = source_tile_size or max(
        model_size,
        int(round(model_size * SOURCE_TILE_SCALE)),
    )
    x_starts = _axis_starts(width, tile_size, overlap)
    y_starts = _axis_starts(height, tile_size, overlap)
    if len(x_starts) * len(y_starts) <= max_tiles:
        return [
            (
                x0,
                y0,
                min(width, x0 + tile_size),
                min(height, y0 + tile_size),
            )
            for y0 in y_starts
            for x0 in x_starts
        ]

    # Pick a <=max_tiles grid whose cells are closest to square. A small unused-slot
    # penalty selects the denser grid when two shapes have similar aspect distortion.
    best = None
    for columns in range(1, max_tiles + 1):
        for rows in range(1, max_tiles // columns + 1):
            cell_aspect = (width / columns) / (height / rows)
            unused = max_tiles - columns * rows
            score = abs(math.log(cell_aspect)) + 0.05 * unused / max_tiles
            candidate = (score, unused, rows, columns)
            if best is None or candidate < best:
                best = candidate
    _score, _unused, rows, columns = best
    x_edges = [round(index * width / columns) for index in range(columns + 1)]
    y_edges = [round(index * height / rows) for index in range(rows + 1)]
    margin_x = max(1, round((width / columns) * overlap / 2.0))
    margin_y = max(1, round((height / rows) * overlap / 2.0))
    return [
        (
            max(0, x_edges[column] - margin_x),
            max(0, y_edges[row] - margin_y),
            min(width, x_edges[column + 1] + margin_x),
            min(height, y_edges[row + 1] + margin_y),
        )
        for row in range(rows)
        for column in range(columns)
    ]


def _cross_tile_nms(detections: list[dict], iou_threshold: float) -> list[dict]:
    """Vectorized confidence-first NMS with deterministic coordinate tie-breaks."""
    ranked = sorted(
        detections,
        key=lambda row: (
            -row["confidence"],
            row["box_xyxy"][0],
            row["box_xyxy"][1],
            row["box_xyxy"][2],
            row["box_xyxy"][3],
            row["_tile_index"],
            row["_row_index"],
        ),
    )
    if not ranked:
        return []
    boxes = np.asarray([row["box_xyxy"] for row in ranked], dtype=np.float64)
    areas = np.maximum(0.0, boxes[:, 2] - boxes[:, 0]) * np.maximum(
        0.0,
        boxes[:, 3] - boxes[:, 1],
    )
    suppressed = np.zeros(len(ranked), dtype=bool)
    kept_indices = []
    for index in range(len(ranked)):
        if suppressed[index]:
            continue
        kept_indices.append(index)
        remaining = np.flatnonzero(~suppressed[index + 1:]) + index + 1
        if remaining.size == 0:
            continue
        intersection_width = np.maximum(
            0.0,
            np.minimum(boxes[index, 2], boxes[remaining, 2])
            - np.maximum(boxes[index, 0], boxes[remaining, 0]),
        )
        intersection_height = np.maximum(
            0.0,
            np.minimum(boxes[index, 3], boxes[remaining, 3])
            - np.maximum(boxes[index, 1], boxes[remaining, 1]),
        )
        intersection = intersection_width * intersection_height
        union = areas[index] + areas[remaining] - intersection
        iou = np.divide(
            intersection,
            union,
            out=np.zeros_like(intersection),
            where=union > 0.0,
        )
        suppressed[remaining[iou > iou_threshold]] = True
    return [ranked[index] for index in kept_indices]


def _infer_tile(
    session,
    tile: Image.Image,
    *,
    origin_x: int,
    origin_y: int,
    source_width: int,
    source_height: int,
    model_size: int,
    confidence: float,
    tile_index: int,
) -> list[dict]:
    """Infer one source crop and map valid boxes into full-image coordinates."""
    tile_width, tile_height = tile.size
    scale = min(model_size / tile_width, model_size / tile_height)
    resized_width = max(1, round(tile_width * scale))
    resized_height = max(1, round(tile_height * scale))
    resized = tile.resize(
        (resized_width, resized_height),
        Image.Resampling.BILINEAR,
    )
    canvas = Image.new("RGB", (model_size, model_size), (114, 114, 114))
    left = (model_size - resized_width) // 2
    top = (model_size - resized_height) // 2
    canvas.paste(resized, (left, top))
    tensor = (
        np.asarray(canvas, dtype=np.float32)
        .transpose(2, 0, 1)[None, ...]
        / 255.0
    )
    output = np.asarray(
        session.run(None, {session.get_inputs()[0].name: tensor})[0][0]
    )

    detections = []
    for row_index, (xmin, ymin, xmax, ymax, score, class_id) in enumerate(output):
        if float(score) < confidence or int(round(float(class_id))) != 0:
            continue
        mapped_xmin = origin_x + (float(xmin) - left) / scale
        mapped_ymin = origin_y + (float(ymin) - top) / scale
        mapped_xmax = origin_x + (float(xmax) - left) / scale
        mapped_ymax = origin_y + (float(ymax) - top) / scale
        mapped_xmin = max(float(origin_x), min(mapped_xmin, float(origin_x + tile_width)))
        mapped_ymin = max(float(origin_y), min(mapped_ymin, float(origin_y + tile_height)))
        mapped_xmax = max(float(origin_x), min(mapped_xmax, float(origin_x + tile_width)))
        mapped_ymax = max(float(origin_y), min(mapped_ymax, float(origin_y + tile_height)))
        mapped_xmin = max(0.0, min(mapped_xmin, float(source_width)))
        mapped_ymin = max(0.0, min(mapped_ymin, float(source_height)))
        mapped_xmax = max(0.0, min(mapped_xmax, float(source_width)))
        mapped_ymax = max(0.0, min(mapped_ymax, float(source_height)))
        if mapped_xmax <= mapped_xmin or mapped_ymax <= mapped_ymin:
            continue
        detections.append({
            "box_xyxy": [mapped_xmin, mapped_ymin, mapped_xmax, mapped_ymax],
            "confidence": float(score),
            "_tile_index": tile_index,
            "_row_index": row_index,
        })
    return detections


def detect_whiteflies(
    image: Image.Image,
    *,
    confidence: float | None = None,
    limit: int | None = None,
    use_tiling: bool = True,
) -> dict:
    """Detect whiteflies with bounded full-resolution tiling for tiny objects.

    The exported YOLO head already applies NMS within each model invocation. Large
    source images are split with overlap, evaluated sequentially, mapped back to
    source pixels, then deduplicated by a second cross-tile NMS. ``use_tiling=False``
    retains the legacy single-letterbox path for reproducible latency comparisons.
    """
    session = get_whitefly_session()
    metrics = get_whitefly_metrics()
    if session is None or metrics is None:
        raise RuntimeError("Whitefly detector is unavailable")
    if confidence is None:
        confidence = float(
            metrics.get("runtime_threshold", {}).get("value", 0.25)
        )
    if not np.isfinite(confidence) or not 0.0 <= confidence <= 1.0:
        raise ValueError("confidence must be between 0 and 1")
    model_limit = int(metrics["input"].get("max_detections", 300))
    if limit is not None and (
        isinstance(limit, bool) or not isinstance(limit, int) or limit < 1
    ):
        raise ValueError("limit must be a positive integer")
    if not isinstance(use_tiling, bool):
        raise ValueError("use_tiling must be a boolean")

    # ai_engine already provides a decoded RGB image; reuse it instead of cloning a
    # multi-megapixel upload. Non-RGB direct callers still get the same conversion.
    rgb = image if image.mode == "RGB" else image.convert("RGB")
    original_width, original_height = rgb.size
    size = int(metrics["input"]["image_size"])
    declared_tile_size = metrics.get("tiling", {}).get("tile_size")
    if use_tiling:
        tiles = _tile_plan(
            original_width,
            original_height,
            size,
            source_tile_size=(
                int(declared_tile_size) if declared_tile_size is not None else None
            ),
        )
    else:
        tiles = [(0, 0, original_width, original_height)]

    candidates = []
    for tile_index, (x0, y0, x1, y1) in enumerate(tiles):
        # Sequential crop -> tensor -> inference keeps peak input allocation at one
        # (1,3,H,W) float32 tensor regardless of source dimensions/tile count.
        tile = rgb.crop((x0, y0, x1, y1))
        candidates.extend(
            _infer_tile(
                session,
                tile,
                origin_x=x0,
                origin_y=y0,
                source_width=original_width,
                source_height=original_height,
                model_size=size,
                confidence=confidence,
                tile_index=tile_index,
            )
        )

    if len(tiles) > 1:
        merged = _cross_tile_nms(candidates, CROSS_TILE_NMS_IOU)
    else:
        # Preserve the exported head's existing order for single-image inference.
        merged = candidates

    dynamic_capacity = min(MAX_GLOBAL_DETECTIONS, model_limit * len(tiles))
    effective_limit = dynamic_capacity if limit is None else min(limit, dynamic_capacity)
    truncated = len(merged) > effective_limit
    merged = merged[:effective_limit]
    detections = [{
        "box_xyxy": [round(float(value), 2) for value in row["box_xyxy"]],
        "confidence": round(float(row["confidence"]), 4),
    } for row in merged]
    return {
        "count": len(detections),
        "detections": detections,
        "threshold": confidence,
        "truncated": truncated,
        "image_size": [original_width, original_height],
        "tiled": len(tiles) > 1,
        "tile_count": len(tiles),
        "source_tile_size": int(
            declared_tile_size or round(size * SOURCE_TILE_SCALE)
        ) if use_tiling else None,
        "candidate_count": len(candidates),
        "detection_capacity": dynamic_capacity,
    }
