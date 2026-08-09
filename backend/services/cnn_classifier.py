"""Lazy-loads the trained CNN (EfficientNet-B0 on raw 224x224x3 pixels) ONNX model
produced by backend/training/train_cnn.py or train_cnn_torch.py — backend/ml_models/
cnn_efficientnet_b0.onnx + cnn_metrics.json.

This is the raw-pixel CNN alternative to ml_classifier.py's hand-crafted-feature
classifier: ml_classifier.py's sklearn model consumes a 12-dim engineered feature
vector (backend.services.feature_extraction.feature_vector()); this module consumes
the raw 224x224x3 image pixels directly through a real convolutional network. Because
the input representation is completely different, this module cannot share
ml_classifier.py's `clf.predict_proba(vec)` call site in ai_engine.py — ai_engine.py
instead routes to this module's cnn_predict_proba()/cnn_predict_proba_batch() when CNN
mode is active (see backend.config.USE_CNN).

Mirrors fusion_classifier.py's lazy-singleton pattern exactly: module-level
_session/_metrics/_loaded globals, a _load() that sets _loaded=True first thing, a
try/except FileNotFoundError with a helpful print, a generic except Exception as a
defensive fallback, and public get_*() accessors that call _load() then return the
cached global. Strictly additive — the app runs fine with no onnxruntime installed and
no trained CNN present; USE_CNN-gated callers just get None back and fall through to
classical/fusion.

get_cnn_session() returns None (leaving the app on classical/fusion) whenever:
- onnxruntime isn't installed (imported lazily inside _load(), wrapped in its own
  try/except ImportError, so the base app never requires this optional dependency), or
- no cnn_efficientnet_b0.onnx / cnn_metrics.json exist yet, or
- cnn_metrics.json's "classes" order doesn't EXACTLY match
  feature_extraction.ML_CLASS_ORDER — a class-order mismatch would silently mislabel
  every prediction (e.g. serve a "cbb" logit's probability under the "cmd" key), which
  is far worse than just not having a CNN at all, so this is treated as a hard failure
  that keeps the session at None rather than a soft warning.

CRITICAL for correctness: cnn_preprocess() follows cnn_metrics.json's explicit
input_scale/input_layout/resize contract. The training export and serving both use Pillow
bilinear direct-square resize; augmentation is training-only. Any drift between
these paths invalidates the measured test result.
"""
import json
import threading

import numpy as np
from PIL import Image

from backend.config import AI_SERVING_MODE, BASE_DIR, IS_PRODUCTION
from backend.services.feature_extraction import ML_CLASS_ORDER
from backend.services.model_contract import verify_artifact

ML_MODELS_DIR = BASE_DIR / "backend" / "ml_models"
ONNX_PATH = ML_MODELS_DIR / "cnn_efficientnet_b0.onnx"
METRICS_PATH = ML_MODELS_DIR / "cnn_metrics.json"

_session = None
_metrics = None
_loaded = False
_access_lock = threading.RLock()


def _load():
    global _session, _metrics, _loaded
    if _loaded:
        return
    _loaded = True
    try:
        import onnxruntime
    except ImportError:
        print("[ai_engine] onnxruntime not installed — CNN inference path disabled "
              "(pip install onnxruntime, or `pip install -r requirements.txt`, to enable "
              "it). Falling back to classical/fusion prediction in the meantime.")
        return
    try:
        meta = json.loads(METRICS_PATH.read_text(encoding="utf-8"))

        # Validate the FULL required schema atomically before committing anything to the
        # module globals below — a structurally-incomplete-but-otherwise-valid metrics
        # file (e.g. an interrupted export, or a hand-edited file while testing) must
        # fail closed here, not partially load and then crash every later prediction
        # request (or worse, leave a live session while claiming to have fallen back).
        required = ("model_id", "architecture", "trained_at", "classes", "img_size",
                   "normalize_mean", "normalize_std")
        missing = [k for k in required if k not in meta]
        if missing:
            print(f"[ai_engine] cnn_metrics.json is missing required key(s) {missing} — "
                  "refusing to load the CNN model (a partially-written or hand-edited "
                  "metrics file would otherwise load 'successfully' and then crash every "
                  "prediction request the first time the missing field is used). Falling "
                  "back to classical/fusion prediction.")
            return
        if meta["classes"] != ML_CLASS_ORDER:
            print(f"[ai_engine] cnn_metrics.json 'classes' order {meta['classes']} does NOT "
                  f"match feature_extraction.ML_CLASS_ORDER {ML_CLASS_ORDER} — refusing to "
                  "load the CNN model. A class-order mismatch would silently mislabel every "
                  "prediction (e.g. serving one disease's logit under another disease's "
                  "name), which is far worse than not having a CNN at all. Falling back to "
                  "classical/fusion prediction.")
            return
        if (not isinstance(meta["img_size"], int) or
                not isinstance(meta["normalize_mean"], list) or len(meta["normalize_mean"]) != 3 or
                not isinstance(meta["normalize_std"], list) or len(meta["normalize_std"]) != 3):
            print("[ai_engine] cnn_metrics.json has malformed img_size/normalize_mean/"
                  "normalize_std (expected an int and two 3-element lists) — refusing to "
                  "load the CNN model. Falling back to classical/fusion prediction.")
            return

        input_scale = meta.get("input_scale", "imagenet_normalized")
        if input_scale not in {"zero_to_255", "zero_to_one", "imagenet_normalized"}:
            print(f"[ai_engine] cnn_metrics.json has unsupported input_scale={input_scale!r} — "
                  "refusing to load the CNN model.")
            return
        numeric_meta = meta["normalize_mean"] + meta["normalize_std"]
        if (not all(isinstance(value, (int, float)) and np.isfinite(value)
                    for value in numeric_meta)
                or (input_scale == "imagenet_normalized"
                    and not all(value > 0 for value in meta["normalize_std"]))):
            print("[ai_engine] cnn_metrics.json contains invalid normalization values — "
                  "refusing to load the CNN model.")
            return
        temperature = meta.get("temperature", 1.0)
        if not isinstance(temperature, (int, float)) or not np.isfinite(temperature) or temperature <= 0:
            print("[ai_engine] cnn_metrics.json has an invalid calibration temperature — "
                  "refusing to load the CNN model.")
            return
        if (
            IS_PRODUCTION
            and meta.get("production_eligible") is not True
            and AI_SERVING_MODE != "review_only"
        ):
            print("[ai_engine] CNN artifact is not approved for production — refusing to load.")
            return

        verify_artifact(meta, "onnx", ONNX_PATH)
        session = onnxruntime.InferenceSession(str(ONNX_PATH))
        inputs = session.get_inputs()
        outputs = session.get_outputs()
        expected_input_name = meta.get("input_name", "image")
        if (len(inputs) != 1 or inputs[0].name != expected_input_name
                or len(inputs[0].shape) != 4 or inputs[0].type != "tensor(float)"):
            print("[ai_engine] CNN ONNX input contract does not match cnn_metrics.json — "
                  "refusing to load the model.")
            return
        if len(outputs) != 1 or outputs[0].type != "tensor(float)":
            print("[ai_engine] CNN ONNX must expose exactly one logits output — refusing to load.")
            return
        input_shape = inputs[0].shape
        if meta.get("input_layout", "NCHW") == "NCHW":
            if (isinstance(input_shape[1], int) and input_shape[1] != 3) or (
                    isinstance(input_shape[2], int) and input_shape[2] != meta["img_size"]) or (
                    isinstance(input_shape[3], int) and input_shape[3] != meta["img_size"]):
                print("[ai_engine] CNN ONNX NCHW shape disagrees with metadata — refusing to load.")
                return
        output_shape = outputs[0].shape
        if (len(output_shape) != 2 or
                (isinstance(output_shape[-1], int)
                 and output_shape[-1] != len(ML_CLASS_ORDER)) or
                meta.get("output") != "logits"):
            print("[ai_engine] CNN ONNX logits shape/type contract is invalid — refusing to load.")
            return
        smoke_shape = (2, 3, meta["img_size"], meta["img_size"])
        smoke = session.run(None, {expected_input_name: np.zeros(smoke_shape, dtype=np.float32)})[0]
        if np.asarray(smoke).shape != (2, len(ML_CLASS_ORDER)) or not np.isfinite(smoke).all():
            print("[ai_engine] CNN ONNX smoke inference failed its output contract — refusing to load.")
            return
        # Only commit to the module globals once loading AND validation have both fully
        # succeeded — never leave a partially-initialized (session set but metrics
        # invalid, or vice versa) state visible to get_cnn_session()/get_cnn_metrics().
        _session = session
        _metrics = meta
        macro_f1 = meta.get("test", {}).get("macro_f1")
        f1_str = f"{macro_f1:.3f}" if isinstance(macro_f1, (int, float)) else "n/a"
        print(f"[ai_engine] loaded trained CNN classifier '{meta['model_id']}' "
              f"(held-out test macro-F1={f1_str}) — used when backend.config.USE_CNN is True "
              "and a prediction routes through the CNN path")
    except FileNotFoundError:
        print(f"[ai_engine] no trained CNN model found at {ONNX_PATH} / {METRICS_PATH} — run "
              "backend/training/train_cnn.py to produce them. Falling back to "
              "classical/fusion prediction in the meantime.")
    except Exception as e:  # pragma: no cover - defensive
        _session = None
        _metrics = None
        print(f"[ai_engine] failed to load trained CNN model: {e} — falling back to "
              "classical/fusion.")


def get_cnn_session():
    """Returns the onnxruntime.InferenceSession, or None if CNN mode isn't available
    (onnxruntime not installed, no trained model on disk yet, or a class-order
    mismatch was detected)."""
    with _access_lock:
        _load()
        return _session


def get_cnn_metrics():
    """Returns the parsed cnn_metrics.json dict (real measured numbers), or None if
    not yet trained / not loaded."""
    with _access_lock:
        _load()
        return _metrics


def cnn_preprocess(img: Image.Image) -> np.ndarray:
    """Resize (no crop) to cnn_metrics.json's img_size, HWC uint8 -> CHW float32 /255,
    then per-channel normalize with cnn_metrics.json's normalize_mean/normalize_std —
    mirrors the training notebook's eval_transform exactly (see module docstring).
    Reads mean/std/img_size from cnn_metrics.json rather than hardcoding them, so a
    future retrain that changes normalization is picked up automatically. Returns
    shape (1, 3, H, W) float32, ready for session.run(None, {"image": x})."""
    meta = get_cnn_metrics()
    img_size = meta["img_size"]
    resized = img.convert("RGB").resize((img_size, img_size), Image.BILINEAR)
    arr = np.asarray(resized, dtype=np.float32)
    input_scale = meta.get("input_scale", "imagenet_normalized")
    if input_scale == "zero_to_255":
        prepared = arr
    elif input_scale == "zero_to_one":
        prepared = arr / 255.0
    else:  # backward-compatible path for the original PyTorch-style notebook contract
        mean = np.asarray(meta["normalize_mean"], dtype=np.float32).reshape(1, 1, 3)
        std = np.asarray(meta["normalize_std"], dtype=np.float32).reshape(1, 1, 3)
        prepared = (arr / 255.0 - mean) / std
    layout = meta.get("input_layout", "NCHW")
    if layout == "NCHW":
        prepared = prepared.transpose(2, 0, 1)
    elif layout != "NHWC":
        raise ValueError(f"unsupported CNN input_layout: {layout}")
    return prepared[np.newaxis, ...].astype(np.float32)


def _softmax(logits: np.ndarray) -> np.ndarray:
    """Numerically-stable softmax (subtracts the row max before exp), row-wise when
    `logits` is 2D."""
    shifted = logits - logits.max(axis=-1, keepdims=True)
    exp = np.exp(shifted)
    return exp / exp.sum(axis=-1, keepdims=True)


def cnn_predict_proba(img: Image.Image) -> dict:
    """Single-image CNN inference: preprocess, one session.run() call, numerically-
    stable softmax over the raw logits. Returns {class_key: float} using
    cnn_metrics.json's "classes" order (confirmed identical in content+order to
    ML_CLASS_ORDER when the session was loaded)."""
    session = get_cnn_session()
    meta = get_cnn_metrics()
    x = cnn_preprocess(img)
    logits = session.run(None, {meta.get("input_name", "image"): x})[0][0]
    probs = _softmax(logits.astype(np.float64) / float(meta.get("temperature", 1.0)))
    return dict(zip(meta["classes"], probs.tolist()))


def cnn_predict_proba_batch(imgs: list) -> np.ndarray:
    """Batched CNN inference: preprocesses all N images and runs ONE session.run()
    call (not N separate calls) — the same batching discipline ai_engine.py's
    _occlusion_sensitivity() uses for the classical model (a ~50x speedup there over
    per-cell calls); EfficientNet-B0's CPU per-call overhead is considerably higher
    than sklearn's, so batching matters even more here (e.g. the 8x8=64 occluded crops
    used by ai_engine.py's _cnn_occlusion_grid() for the CNN's occlusion-sensitivity
    heatmap). Returns (N, num_classes) probabilities, column order = cnn_metrics.json's
    "classes" order."""
    session = get_cnn_session()
    batch = np.concatenate([cnn_preprocess(img) for img in imgs], axis=0)
    meta = get_cnn_metrics()
    logits = session.run(None, {meta.get("input_name", "image"): batch})[0]
    return _softmax(logits.astype(np.float64) / float(meta.get("temperature", 1.0)))
