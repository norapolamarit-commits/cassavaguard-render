"""Train CassavaGuard's raw-pixel EfficientNet-B0 model.

Correctness contract
--------------------
* Uses TFDS ``cassava`` official train/validation/test splits without pooling.
* Quarantines exact and conservative perceptual duplicates across splits before
  constructing loaders and emits an immutable manual-review manifest.
* Chooses checkpoints and early-stops on validation macro-F1 only.
* Opens the test iterator only after the final checkpoint has been selected.
* Uses all training images and class-weighted loss instead of moving majority-class
  samples into the test set.
* Stores the exact class order, preprocessing, temperature and dependency versions
  required by ``backend.services.cnn_classifier``.
* Exports an NCHW float32 ONNX model with input name ``image`` and raw-logit output.

The five measured labels are healthy/CBB/CBSD/CMD/CGM.  The application's other
eight rule-based conditions are not part of this mutually-exclusive classifier.

Example:
    python -m pip install -r requirements-training.txt
    python backend/training/train_cnn.py
"""
from __future__ import annotations

import argparse
import hashlib
import json
import math
import os
import platform
import subprocess
import sys
import tempfile
import time
from collections import Counter
from pathlib import Path

import numpy as np

REPO_ROOT = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(REPO_ROOT))

from backend.services.feature_extraction import ML_CLASS_ORDER
from backend.training.train_cnn_torch import (
    PERCEPTUAL_DHASH_SIZE,
    PERCEPTUAL_MAX_PHASH_HAMMING,
    PERCEPTUAL_PHASH_SIZE,
    PERCEPTUAL_PHASH_SOURCE_SIZE,
    _decoded_fingerprints,
    _perceptual_candidate_groups,
    _wilson_interval,
)
from backend.training.training_utils import atomic_write_json, sha256_file

MODEL_DIR = REPO_ROOT / "backend" / "ml_models"
KERAS_PATH = MODEL_DIR / "cnn_efficientnet_b0.keras"
ONNX_PATH = MODEL_DIR / "cnn_efficientnet_b0.onnx"
METRICS_PATH = MODEL_DIR / "cnn_metrics.json"


def parse_args(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--epochs-head", type=int, default=6,
                        help="epochs with the ImageNet backbone frozen")
    parser.add_argument("--epochs-fine", type=int, default=10,
                        help="epochs fine-tuning the last backbone layers")
    parser.add_argument("--fine-tune-layers", type=int, default=40,
                        help="number of final backbone layers to unfreeze")
    parser.add_argument("--batch-size", type=int, default=32)
    parser.add_argument("--image-size", type=int, default=224)
    parser.add_argument("--patience", type=int, default=3)
    parser.add_argument("--seed", type=int, default=42)
    parser.add_argument("--data-dir", type=Path, default=None,
                        help="optional TFDS data directory/cache")
    parser.add_argument("--skip-onnx", action="store_true",
                        help="save .keras + metrics but do not export ONNX")
    parser.add_argument("--no-imagenet", action="store_true",
                        help="train from random initialization (mainly for offline smoke tests)")
    return parser.parse_args(argv)


def _softmax(logits: np.ndarray, temperature: float = 1.0) -> np.ndarray:
    scaled = np.asarray(logits, dtype=np.float64) / float(temperature)
    scaled -= scaled.max(axis=1, keepdims=True)
    exp = np.exp(scaled)
    return exp / exp.sum(axis=1, keepdims=True)


def _expected_calibration_error(y_true, probabilities, bins: int = 15) -> float:
    y_true = np.asarray(y_true)
    probabilities = np.asarray(probabilities)
    confidence = probabilities.max(axis=1)
    correct = probabilities.argmax(axis=1) == y_true
    edges = np.linspace(0.0, 1.0, bins + 1)
    ece = 0.0
    for lower, upper in zip(edges[:-1], edges[1:]):
        mask = (confidence > lower) & (confidence <= upper)
        if mask.any():
            ece += mask.mean() * abs(correct[mask].mean() - confidence[mask].mean())
    return float(ece)


def _fit_temperature(logits: np.ndarray, labels: np.ndarray) -> float:
    """Fit one positive temperature on validation negative log-likelihood."""
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
    from sklearn.metrics import (accuracy_score, balanced_accuracy_score,
                                 confusion_matrix, f1_score, log_loss,
                                 precision_recall_fscore_support)

    probabilities = _softmax(logits, temperature)
    predicted = probabilities.argmax(axis=1)
    total = int(labels.shape[0])
    correct = int(np.sum(predicted == labels))
    precision, recall, f1, support = precision_recall_fscore_support(
        labels, predicted, labels=range(len(ML_CLASS_ORDER)), zero_division=0)
    one_hot = np.eye(len(ML_CLASS_ORDER), dtype=np.float64)[labels]
    return {
        "accuracy": round(float(accuracy_score(labels, predicted)), 6),
        "accuracy_correct": correct,
        "sample_count": total,
        "accuracy_wilson_95": _wilson_interval(correct, total),
        "balanced_accuracy": round(float(balanced_accuracy_score(labels, predicted)), 6),
        "macro_f1": round(float(f1_score(labels, predicted, average="macro")), 6),
        "log_loss": round(float(log_loss(labels, probabilities,
                                         labels=range(len(ML_CLASS_ORDER)))), 6),
        "brier_multiclass": round(float(np.mean(np.sum((probabilities - one_hot) ** 2, axis=1))), 6),
        "ece_15_bins": round(_expected_calibration_error(labels, probabilities), 6),
        "confusion_matrix": confusion_matrix(
            labels, predicted, labels=range(len(ML_CLASS_ORDER))).tolist(),
        "per_class": {
            class_name: {
                "precision": round(float(precision[i]), 6),
                "recall": round(float(recall[i]), 6),
                "f1": round(float(f1[i]), 6),
                "support": int(support[i]),
            }
            for i, class_name in enumerate(ML_CLASS_ORDER)
        },
    }


def _collect_logits(model, dataset):
    logits_parts, labels_parts = [], []
    for images, labels in dataset:
        logits_parts.append(np.asarray(model(images, training=False)))
        labels_parts.append(np.asarray(labels))
    return np.concatenate(logits_parts), np.concatenate(labels_parts).astype(np.int64)


def _audit_and_filter_duplicates(tfds, datasets, source_names):
    """Quarantine exact and conservative perceptual duplicates across splits.

    Structural inspection of the test split is allowed here solely to create the
    immutable hygiene mask; no predictions or performance metrics are computed.
    Conflicting groups are removed in full because retaining an arbitrary label
    would silently teach/evaluate contradictory ground truth.
    """
    split_names = ("train", "validation", "test")
    from PIL import Image

    occurrences = {}
    audited_rows = []
    split_sizes = []
    for split_name, dataset in zip(split_names, datasets):
        count = 0
        for index, (image, label) in enumerate(tfds.as_numpy(dataset)):
            image = np.asarray(image)
            exact_sha256, dhash, phash = _decoded_fingerprints(
                Image.fromarray(np.asarray(image, dtype=np.uint8))
            )
            row = {
                "split": split_name,
                "index": index,
                "label": int(label),
                "order": len(audited_rows),
                "exact_sha256": exact_sha256,
                "dhash": dhash,
                "phash": phash,
            }
            audited_rows.append(row)
            occurrences.setdefault(exact_sha256, []).append(row)
            count += 1
        split_sizes.append(count)

    keep = {name: np.ones(size, dtype=bool)
            for name, size in zip(split_names, split_sizes)}
    conflict_groups = same_label_groups = 0
    for group in occurrences.values():
        if len(group) < 2:
            continue
        labels = {int(row["label"]) for row in group}
        if len(labels) > 1:
            conflict_groups += 1
            for row in group:
                keep[row["split"]][int(row["index"])] = False
        else:
            same_label_groups += 1
            # Occurrences were appended train -> validation -> test, so retaining
            # group[0] can never move held-out information into training.
            for row in group[1:]:
                keep[row["split"]][int(row["index"])] = False

    exact_removed = {
        split_name: int((~keep[split_name]).sum()) for split_name in split_names
    }
    perceptual_input = [
        row for row in audited_rows
        if keep[row["split"]][int(row["index"])]
    ]
    perceptual_groups = _perceptual_candidate_groups(perceptual_input)
    perceptual_conflicts = 0
    perceptual_same_label = 0
    review_manifest = []
    for group in perceptual_groups:
        labels = {int(row["label"]) for row in group}
        if len(labels) > 1:
            perceptual_conflicts += 1
            decision = "quarantine_all_label_conflict"
            rows_to_remove = group
        else:
            perceptual_same_label += 1
            decision = "keep_earliest_split_occurrence"
            rows_to_remove = group[1:]
        for row in rows_to_remove:
            keep[row["split"]][int(row["index"])] = False
        review_manifest.append({
            "decision": decision,
            "review_status": "pending",
            "occurrences": [
                {
                    "split": row["split"],
                    "source_index": int(row["index"]),
                    "label": source_names[int(row["label"])],
                    "exact_sha256": row["exact_sha256"],
                    "dhash64": row["dhash"],
                    "phash64": row["phash"],
                }
                for row in group
            ],
        })

    perceptual_removed = {
        split_name: int((~keep[split_name]).sum()) - exact_removed[split_name]
        for split_name in split_names
    }

    import tensorflow as tf

    filtered = []
    removed = {}
    for split_name, dataset in zip(split_names, datasets):
        mask = tf.constant(keep[split_name])

        def should_keep(index, _row, mask=mask):
            return tf.gather(mask, index)

        def strip_index(_index, row):
            return row

        filtered.append(dataset.enumerate().filter(should_keep).map(strip_index))
        removed[split_name] = int((~keep[split_name]).sum())

    manifest_payload = {
        digest: [
            (row["split"], int(row["index"]), int(row["label"]))
            for row in group
        ]
        for digest, group in sorted(occurrences.items()) if len(group) > 1
    }
    manifest_sha = hashlib.sha256(
        json.dumps(manifest_payload, sort_keys=True, separators=(",", ":")).encode()
    ).hexdigest()
    review_payload = json.dumps(
        review_manifest,
        sort_keys=True,
        separators=(",", ":"),
    ).encode()
    summary = {
        "method": "SHA-256 of decoded pixel shape+bytes",
        "conflicting_label_groups_quarantined": conflict_groups,
        "same_label_duplicate_groups_deduplicated": same_label_groups,
        "exact_removed_by_split": exact_removed,
        "removed_by_split": removed,
        "duplicate_manifest_sha256": manifest_sha,
        "test_access_before_selection": "structural duplicate quarantine only; no model outputs",
        "source_label_names": list(source_names),
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
    return tuple(filtered), summary


def _git_revision() -> str | None:
    try:
        return subprocess.run(
            ["git", "rev-parse", "HEAD"], cwd=REPO_ROOT, check=True,
            capture_output=True, text=True).stdout.strip()
    except Exception:
        return None


def _atomic_keras_save(model, destination: Path) -> None:
    destination.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix=".cnn-keras-", dir=destination.parent) as tmp_dir:
        temp_path = Path(tmp_dir) / destination.name
        model.save(temp_path)
        os.replace(temp_path, destination)


def _atomic_onnx_export(model, destination: Path, parity_batch: np.ndarray) -> dict:
    destination.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix=".cnn-onnx-", dir=destination.parent) as tmp_dir:
        temp_path = Path(tmp_dir) / destination.name
        model.export(temp_path, format="onnx", verbose=False)
        if not temp_path.is_file():
            raise RuntimeError("Keras ONNX export did not produce a single .onnx file")

        import onnxruntime

        session = onnxruntime.InferenceSession(str(temp_path), providers=["CPUExecutionProvider"])
        inputs = session.get_inputs()
        outputs = session.get_outputs()
        if len(inputs) != 1 or inputs[0].name != "image" or len(inputs[0].shape) != 4:
            raise RuntimeError(f"unexpected ONNX input contract: {inputs}")
        batch_dim = inputs[0].shape[0]
        if isinstance(batch_dim, int) and batch_dim > 0:
            raise RuntimeError(f"ONNX export does not expose a dynamic batch: {inputs[0].shape}")
        if len(outputs) != 1:
            raise RuntimeError(f"expected one ONNX logits output, got {len(outputs)}")
        keras_logits = np.asarray(model(parity_batch, training=False), dtype=np.float32)
        onnx_logits = np.asarray(session.run(None, {"image": parity_batch})[0], dtype=np.float32)
        max_abs = float(np.max(np.abs(keras_logits - onnx_logits)))
        argmax_equal = bool(np.array_equal(keras_logits.argmax(axis=1),
                                           onnx_logits.argmax(axis=1)))
        if not argmax_equal or not np.allclose(keras_logits, onnx_logits, rtol=1e-4, atol=1e-4):
            raise RuntimeError(
                f"Keras/ONNX parity failed (argmax_equal={argmax_equal}, max_abs={max_abs})")
        os.replace(temp_path, destination)
        return {
            "samples": int(parity_batch.shape[0]),
            "rtol": 1e-4,
            "atol": 1e-4,
            "max_abs_logit_difference": max_abs,
            "argmax_equal": argmax_equal,
        }


def main(argv=None):
    args = parse_args(argv)
    if min(args.epochs_head, args.epochs_fine) < 0:
        raise SystemExit("epoch counts must be >= 0")
    if args.epochs_head + args.epochs_fine == 0:
        raise SystemExit("at least one training phase must have epochs > 0")
    if min(args.batch_size, args.image_size, args.patience, args.fine_tune_layers) <= 0:
        raise SystemExit("batch-size, image-size, patience and fine-tune-layers must be > 0")

    # Set deterministic controls before importing TensorFlow.
    os.environ.setdefault("TF_DETERMINISTIC_OPS", "1")
    import keras
    import tensorflow as tf
    import tensorflow_datasets as tfds
    from PIL import Image
    from sklearn.metrics import f1_score

    keras.utils.set_random_seed(args.seed)
    try:
        tf.config.experimental.enable_op_determinism()
    except Exception:
        pass

    print("Loading TFDS 'cassava' official splits...")
    load_kwargs = {
        "split": ["train", "validation", "test"],
        "as_supervised": True,
        "with_info": True,
        "shuffle_files": False,
    }
    if args.data_dir is not None:
        load_kwargs["data_dir"] = str(args.data_dir)
    (raw_train, raw_validation, raw_test), info = tfds.load("cassava", **load_kwargs)

    source_names = list(info.features["label"].names)
    missing = sorted(set(ML_CLASS_ORDER) - set(source_names))
    if missing:
        raise RuntimeError(f"TFDS label vocabulary is missing required classes: {missing}")
    (raw_train, raw_validation, raw_test), duplicate_audit = _audit_and_filter_duplicates(
        tfds, (raw_train, raw_validation, raw_test), source_names)
    print(f"Duplicate audit: {duplicate_audit}")
    source_to_runtime_ids = [ML_CLASS_ORDER.index(name) for name in source_names]
    source_to_runtime = tf.constant(source_to_runtime_ids, dtype=tf.int64)

    train_counts = Counter()
    for _, source_label in tfds.as_numpy(raw_train):
        train_counts[ML_CLASS_ORDER[source_to_runtime_ids[int(source_label)]]] += 1
    total_train = sum(train_counts.values())
    class_weights = {
        ML_CLASS_ORDER.index(name): total_train / (len(ML_CLASS_ORDER) * count)
        for name, count in train_counts.items()
    }
    print(f"Official training counts: {dict(train_counts)}")

    options = tf.data.Options()
    options.experimental_deterministic = True

    def pil_resize(image):
        image = Image.fromarray(np.asarray(image, dtype=np.uint8)).convert("RGB")
        image = image.resize((args.image_size, args.image_size), Image.BILINEAR)
        return np.asarray(image, dtype=np.float32)

    def resize_and_remap(image, source_label):
        # Use the same Pillow resize implementation as serving. This is slower than
        # tf.image.resize but removes a subtle train/serve interpolation mismatch.
        image = tf.numpy_function(pil_resize, [image], Tout=tf.float32)
        image.set_shape((args.image_size, args.image_size, 3))
        # Runtime ONNX contract is NCHW float32 in the [0,255] range. EfficientNet's
        # own Rescaling layer handles ImageNet normalization inside the model.
        image = tf.transpose(image, [2, 0, 1])
        return image, tf.gather(source_to_runtime, tf.cast(source_label, tf.int32))

    augmentation = keras.Sequential([
        keras.layers.RandomFlip("horizontal_and_vertical", seed=args.seed),
        keras.layers.RandomRotation(0.08, fill_mode="reflect", seed=args.seed + 1),
        keras.layers.RandomZoom(0.12, fill_mode="reflect", seed=args.seed + 2),
        keras.layers.RandomContrast(0.15, seed=args.seed + 3),
    ], name="train_augmentation")

    def augment_nchw(images, labels):
        nhwc = tf.transpose(images, [0, 2, 3, 1])
        nhwc = augmentation(nhwc, training=True)
        return tf.transpose(nhwc, [0, 3, 1, 2]), labels

    autotune = tf.data.AUTOTUNE
    train_ds = (raw_train.with_options(options)
                .map(resize_and_remap, num_parallel_calls=autotune, deterministic=True)
                .shuffle(min(total_train, 4096), seed=args.seed, reshuffle_each_iteration=True)
                .batch(args.batch_size)
                .map(augment_nchw, num_parallel_calls=autotune, deterministic=True)
                .prefetch(autotune))
    validation_ds = (raw_validation.with_options(options)
                     .map(resize_and_remap, num_parallel_calls=autotune, deterministic=True)
                     .batch(args.batch_size).prefetch(autotune))
    # Deliberately construct test_ds only after model selection below.

    inputs = keras.Input(shape=(3, args.image_size, args.image_size), dtype="float32", name="image")
    nhwc = keras.layers.Permute((2, 3, 1), name="nchw_to_nhwc")(inputs)
    base = keras.applications.EfficientNetB0(
        include_top=False,
        weights=None if args.no_imagenet else "imagenet",
        input_shape=(args.image_size, args.image_size, 3),
    )
    base.trainable = False
    features = base(nhwc, training=False)
    features = keras.layers.GlobalAveragePooling2D(name="global_average_pool")(features)
    features = keras.layers.Dropout(0.30, name="classifier_dropout")(features)
    logits = keras.layers.Dense(len(ML_CLASS_ORDER), name="logits")(features)
    model = keras.Model(inputs, logits, name="cassavaguard_efficientnet_b0")

    checkpoint_fd, checkpoint_name = tempfile.mkstemp(
        prefix=".cnn-best-", suffix=".weights.h5", dir=MODEL_DIR)
    os.close(checkpoint_fd)
    checkpoint_path = Path(checkpoint_name)

    class ValidationMacroF1(keras.callbacks.Callback):
        def __init__(self, validation_data, path, patience):
            super().__init__()
            self.validation_data = validation_data
            self.path = path
            self.patience = patience
            self.best = -math.inf
            self.wait = 0

        def on_epoch_end(self, epoch, logs=None):
            val_logits, val_labels = _collect_logits(self.model, self.validation_data)
            score = float(f1_score(val_labels, val_logits.argmax(axis=1), average="macro"))
            if logs is not None:
                logs["val_macro_f1"] = score
            print(f" — val_macro_f1={score:.6f}")
            if score > self.best + 1e-6:
                self.best = score
                self.wait = 0
                self.model.save_weights(self.path)
            else:
                self.wait += 1
                if self.wait >= self.patience:
                    self.model.stop_training = True

    def compile_model(learning_rate):
        model.compile(
            optimizer=keras.optimizers.Adam(learning_rate),
            loss=keras.losses.SparseCategoricalCrossentropy(from_logits=True),
            metrics=[keras.metrics.SparseCategoricalAccuracy(name="accuracy")],
        )

    try:
        checkpoint_callback = ValidationMacroF1(
            validation_ds, checkpoint_path, args.patience)
        if args.epochs_head:
            print("Training classification head...")
            compile_model(1e-3)
            model.fit(train_ds, validation_data=validation_ds, epochs=args.epochs_head,
                      class_weight=class_weights, callbacks=[checkpoint_callback])
            model.load_weights(checkpoint_path)

        if args.epochs_fine:
            print(f"Fine-tuning final {args.fine_tune_layers} backbone layers...")
            base.trainable = True
            freeze_until = max(0, len(base.layers) - args.fine_tune_layers)
            for index, layer in enumerate(base.layers):
                layer.trainable = index >= freeze_until and not isinstance(
                    layer, keras.layers.BatchNormalization)
            compile_model(1e-5)
            # Preserve the best validation score from the frozen-head phase.  A
            # worse first fine-tuning epoch must never overwrite the better model.
            checkpoint_callback.wait = 0
            model.stop_training = False
            model.fit(train_ds, validation_data=validation_ds, epochs=args.epochs_fine,
                      class_weight=class_weights, callbacks=[checkpoint_callback])
            model.load_weights(checkpoint_path)

        # All selection is complete. Validation calibrates confidence; test is now
        # opened exactly once for the final, frozen model.
        validation_logits, validation_labels = _collect_logits(model, validation_ds)
        temperature = _fit_temperature(validation_logits, validation_labels)
        validation_metrics = _evaluate_logits(validation_logits, validation_labels, temperature)

        test_ds = (raw_test.with_options(options)
                   .map(resize_and_remap, num_parallel_calls=autotune, deterministic=True)
                   .batch(args.batch_size).prefetch(autotune))
        test_logits, test_labels = _collect_logits(model, test_ds)
        test_metrics = _evaluate_logits(test_logits, test_labels, temperature)

        MODEL_DIR.mkdir(parents=True, exist_ok=True)
        _atomic_keras_save(model, KERAS_PATH)
        onnx_parity = None
        if not args.skip_onnx:
            try:
                parity_batch = np.asarray(next(iter(validation_ds))[0][:2], dtype=np.float32)
                onnx_parity = _atomic_onnx_export(model, ONNX_PATH, parity_batch)
            except (ImportError, ModuleNotFoundError) as exc:
                raise RuntimeError(
                    "ONNX export dependency missing; install requirements-training.txt "
                    "or rerun with --skip-onnx") from exc

        metrics = {
            "model_id": "cnn_efficientnet_b0",
            "architecture": "Keras EfficientNet-B0 (ImageNet transfer learning)",
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
            # Retained for compatibility with older loaders; input_scale is the
            # authoritative preprocessing contract for newly trained artifacts.
            "normalize_mean": [0.0, 0.0, 0.0],
            "normalize_std": [1.0, 1.0, 1.0],
            "output": "logits",
            "temperature": temperature,
            "selection": {
                "set": "validation",
                "metric": "macro_f1",
                "test_used_for_selection": False,
            },
            "artifacts": {
                "keras": {"file": KERAS_PATH.name, "sha256": sha256_file(KERAS_PATH)},
                **({"onnx": {"file": ONNX_PATH.name, "sha256": sha256_file(ONNX_PATH)}}
                   if not args.skip_onnx else {}),
            },
            "dataset": {
                "source": "TensorFlow Datasets cassava:0.1.0",
                "url": "https://www.tensorflow.org/datasets/catalog/cassava",
                "license": "unknown/pending upstream image-license verification",
                "split_policy": "official TFDS train/validation/test preserved",
                "raw_split_counts": {
                    name: int(info.splits[name].num_examples)
                    for name in ("train", "validation", "test")
                },
                "effective_split_counts": {
                    name: int(info.splits[name].num_examples)
                          - duplicate_audit["removed_by_split"][name]
                    for name in ("train", "validation", "test")
                },
                "per_class_train": dict(train_counts),
                "duplicate_audit": duplicate_audit,
            },
            "training": {
                "seed": args.seed,
                "batch_size": args.batch_size,
                "epochs_head_requested": args.epochs_head,
                "epochs_fine_requested": args.epochs_fine,
                "fine_tune_layers": args.fine_tune_layers,
                "class_weights": {ML_CLASS_ORDER[index]: value
                                  for index, value in class_weights.items()},
                "imagenet_initialization": not args.no_imagenet,
            },
            "calibration": {"method": "validation temperature scaling",
                            "temperature": temperature},
            "onnx_parity": onnx_parity,
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
            "release_note": ("Requires independent Thai-field validation and ONNX parity "
                             "verification before setting USE_CNN=true."),
            "reproducibility": {
                "git_revision": _git_revision(),
                "python": platform.python_version(),
                "tensorflow": tf.__version__,
                "keras": keras.__version__,
                "tensorflow_datasets": tfds.__version__,
                "pillow": __import__("PIL").__version__,
            },
        }
        atomic_write_json(METRICS_PATH, metrics)
        print(json.dumps({"validation": validation_metrics, "test": test_metrics}, indent=2))
        print(f"Wrote {KERAS_PATH}")
        if not args.skip_onnx:
            print(f"Wrote {ONNX_PATH}")
        print(f"Wrote {METRICS_PATH}")
    finally:
        checkpoint_path.unlink(missing_ok=True)


if __name__ == "__main__":
    main()
