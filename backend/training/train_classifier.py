"""Train every CassavaGuard leaf-classifier model family on real, labelled photographs.

Data source: TFDS 'cassava' (https://www.tensorflow.org/datasets/catalog/cassava) —
9,430 real cassava leaf images, publicly hosted on GCS, no credentials required.
It has 5 classes (cbb, cbsd, cgm, cmd, healthy) and this app's taxonomy now uses
all 5 (healthy/cbb/cbsd/cmd/cgm — see backend/config.py CLASSES). 'cgm' (Cassava
Green Mite, a pest-damage class — 1,289 real images total across all 3 official
splits per arXiv:1908.02900) was excluded in an earlier version of this app
(narrower disease taxonomy at the time) but is trained on here now like the other
4 — it has just as real a labelled dataset as they do, no reason to leave it out.

Feature extraction is imported from backend.services.feature_extraction — the
exact same code path used at inference time in backend/services/ai_engine.py —
so every model is trained on identical features to what it sees when serving.

SPLITS: the official TFDS train/validation/test split is preserved.  Validation is
used for hyperparameter and active-family selection; test is used only for final
reporting.  Earlier versions pooled all three sets and selected the active family
from test macro-F1.  That made the result impossible to compare with the published
split and leaked test information into model selection.  This script also checks
exact dHash matches across the official splits, retaining the earliest occurrence
(train before validation before test).  Exact dHash equality is only a duplicate
candidate check, not a claim that all perceptually similar images are detected.

Trains + compares EVERY model family in CANDIDATES (see below — tree ensembles,
a kernel method, a linear baseline, an instance-based method and a small neural
net; all classical/CPU-fast, all already scikit-learn dependencies, no new
libraries or GPU needed), evaluates each on a held-out TEST split that was never
used for training or model selection, and writes one backend/ml_models/<id>.joblib
per family plus backend/ml_models/metrics.json (real measured metrics for every
model, not fabricated). backend/config.py's MODEL_REGISTRY and the /api/models/*
routes are fully generic over whatever families appear in metrics.json — add or
remove an entry in CANDIDATES and the registry, comparison page and active-model
selection all follow automatically, no other code changes needed.

Run with the isolated training venv (has tensorflow-datasets; the app itself
does not need it):
    .venv-training/bin/python backend/training/train_classifier.py
"""
import json
import random
import sys
import time
from collections import Counter
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(REPO_ROOT))

import numpy as np
from PIL import Image
from sklearn.ensemble import (ExtraTreesClassifier, GradientBoostingClassifier,
                              HistGradientBoostingClassifier, RandomForestClassifier)
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (accuracy_score, confusion_matrix, f1_score,
                             precision_score, recall_score)
from sklearn.neighbors import KNeighborsClassifier
from sklearn.neural_network import MLPClassifier
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVC

from backend.services.feature_extraction import (FEATURE_NAMES, ML_CLASS_ORDER,
                                                  extract_features, feature_vector)
from backend.training.training_utils import (atomic_joblib_dump, atomic_write_json,
                                             choose_active_from_validation, sha256_file)

ML_MODELS_DIR = REPO_ROOT / "backend" / "ml_models"
ML_MODELS_DIR.mkdir(parents=True, exist_ok=True)

# Use every official training example.  Class weighting in the estimators addresses
# imbalance without moving thousands of valid training images into the test set.
SEED = 42

# ----------------------------------------------------------------------
# OPTIONAL: extra real images from the Mendeley "Cassava Leaf Disease Dataset"
# (Divyanth, Soni, Machavaram; IIT Kharagpur, India), DOI 10.17632/3832tx2cb2.1,
# CC BY 4.0, https://data.mendeley.com/datasets/3832tx2cb2/1 — a genuinely
# independent population (different country/institution/camera pipeline than
# TFDS's Uganda-only data), covering exactly Healthy/CBB/CMV. Off by default:
# there is no download API (its public metadata doesn't even expose a file
# listing), so you have to download + unzip it yourself first — research could
# only confirm the dataset's existence/license/class list, NOT its internal
# folder/file layout, so MENDELEY_CLASS_ALIASES below is a best-effort guess.
# Inspect your actual unzipped folder names and adjust it if they don't match.
# ----------------------------------------------------------------------
USE_MENDELEY_EXTRA = False
MENDELEY_DIR = None  # e.g. Path("/path/to/mendeley_cassava") after downloading +
                      # unzipping https://data.mendeley.com/datasets/3832tx2cb2/1 yourself
MENDELEY_CLASS_ALIASES = {
    # unzipped subfolder name (lowercased) -> this app's class name. Adjust to match
    # your actual download — not verified against the real archive.
    "healthy": "healthy",
    "cbb": "cbb",
    "cmv": "cmd",  # the dataset's "CMV" (Cassava Mosaic Virus, the causal agent) is
                   # treated here as equivalent to this app's "cmd" (Cassava Mosaic
                   # Disease, the resulting leaf symptoms) — an assumption, not a
                   # confirmed 1:1 label mapping, since these come from different
                   # papers/institutions with their own labelling conventions
}

FAMILY_NAMES = {
    "random_forest": "Random Forest",
    "extra_trees": "Extra Trees",
    "hist_gb": "Hist Gradient Boosting",
    "gradient_boosting": "Gradient Boosting",
    "logistic_regression": "Logistic Regression",
    "svm_rbf": "SVM (RBF kernel)",
    "knn": "K-Nearest Neighbors",
    "mlp": "MLP (Neural Net)",
}


def dhash(img_pil, hash_size=8):
    """Perceptual difference-hash — a lightweight duplicate-candidate check using
    only PIL/numpy (no new dependency). Grayscale + shrink to (hash_size+1,
    hash_size), compare each pixel to its right-neighbour, pack the resulting
    bits into an int. Exact-hash match only (not Hamming-distance tolerant) —
    catches exact dHash matches only. A different photo, small edit or recompression
    may not match; this is not a complete near-duplicate detector."""
    small = img_pil.convert("L").resize((hash_size + 1, hash_size), Image.LANCZOS)
    arr = np.asarray(small, dtype=np.int16)
    bits = (arr[:, 1:] > arr[:, :-1]).flatten()
    h = 0
    for b in bits:
        h = (h << 1) | int(b)
    return h


def load_mendeley_extra(base_dir, seen_hashes):
    """Best-effort loader for a manually-downloaded+unzipped Mendeley dataset (see
    USE_MENDELEY_EXTRA toggle above). Walks base_dir for subfolders matching
    MENDELEY_CLASS_ALIASES (case-insensitive), extracts features from every image,
    and dhash-dedupes against `seen_hashes` — the SAME set already populated by the
    TFDS pool, so a Mendeley photo that happens to duplicate a TFDS one is still
    caught. Returns {class_name: [feature_vector, ...]}, empty per class if
    base_dir/aliases don't match anything — prints loudly rather than silently
    skipping, since a folder-name mismatch here is easy to miss otherwise."""
    extra = {c: [] for c in ML_CLASS_ORDER}
    if base_dir is None:
        return extra
    base_dir = Path(base_dir)
    if not base_dir.is_dir():
        print(f"  [mendeley] {base_dir} not found — download + unzip it first "
              f"(https://data.mendeley.com/datasets/3832tx2cb2/1), skipping")
        return extra
    found_any = False
    for sub in sorted(base_dir.iterdir()):
        if not sub.is_dir():
            continue
        cname = MENDELEY_CLASS_ALIASES.get(sub.name.strip().lower())
        if cname is None:
            continue
        found_any = True
        n_added = n_dupe = 0
        for img_path in sorted(sub.iterdir()):
            if img_path.suffix.lower() not in (".jpg", ".jpeg", ".png"):
                continue
            try:
                img = Image.open(img_path).convert("RGB")
            except Exception:
                continue
            h = dhash(img)
            if h in seen_hashes:
                n_dupe += 1
                continue
            seen_hashes.add(h)
            img.thumbnail((256, 256))
            feats = extract_features(img)
            extra[cname].append(feature_vector(feats))
            n_added += 1
        print(f"  [mendeley] {sub.name} -> {cname}: +{n_added} images ({n_dupe} duplicates skipped)")
    if not found_any:
        print(f"  [mendeley] no subfolder under {base_dir} matched "
              f"{list(MENDELEY_CLASS_ALIASES)} (case-insensitive) — check "
              f"MENDELEY_CLASS_ALIASES against your actual folder names")
    return extra


def load_official_splits(tfds, ds_all, info):
    """Extract features while preserving TFDS's official split boundaries.

    Exact dHash matches are retained only in their earliest split.  Optional
    external Mendeley samples are training-only; they never contaminate validation
    or test.  The returned feature vectors are small, so all rows fit comfortably
    in memory without retaining raw images.
    """
    label_names = info.features["label"].names
    split_names = ("train", "validation", "test")
    split_rows = {name: {c: [] for c in ML_CLASS_ORDER} for name in split_names}
    hash_groups = {}
    skipped_unmapped = 0
    skipped_dupe = Counter()
    conflicting_groups = 0
    t0 = time.perf_counter()
    for split_name, ds in zip(split_names, ds_all):
        for img_arr, label_idx in tfds.as_numpy(ds):
            cname = label_names[int(label_idx)]
            if cname not in ML_CLASS_ORDER:
                skipped_unmapped += 1
                continue
            img = Image.fromarray(img_arr).convert("RGB")
            h = dhash(img)
            img.thumbnail((256, 256))
            feats = extract_features(img)
            hash_groups.setdefault(h, []).append((split_name, cname, feature_vector(feats)))
    # Resolve groups only after seeing all splits. Conflicting-label groups are
    # quarantined in full; same-label copies retain only the earliest official
    # split occurrence (train -> validation -> test).
    for group in hash_groups.values():
        labels = {cname for _split, cname, _vec in group}
        if len(labels) > 1:
            conflicting_groups += 1
            for split_name, _cname, _vec in group:
                skipped_dupe[split_name] += 1
            continue
        first_split, first_class, first_vec = group[0]
        split_rows[first_split][first_class].append(first_vec)
        for split_name, _cname, _vec in group[1:]:
            skipped_dupe[split_name] += 1
    dt = time.perf_counter() - t0
    for split_name in split_names:
        counts = {c: len(v) for c, v in split_rows[split_name].items()}
        print(f"  {split_name}: {sum(counts.values())} images {counts}; "
              f"{skipped_dupe[split_name]} exact-dHash duplicate candidates skipped")
    print(f"  {skipped_unmapped} unmapped rows skipped; {conflicting_groups} conflicting-label "
          f"dHash groups quarantined; feature extraction {dt:.1f}s")
    if USE_MENDELEY_EXTRA:
        extra = load_mendeley_extra(MENDELEY_DIR, set(hash_groups))
        for cname, vecs in extra.items():
            split_rows["train"][cname].extend(vecs)
        print(f"  [mendeley] added {sum(len(v) for v in extra.values())} training-only images")
    return split_rows, {
        "method": "exact 64-bit dHash equality",
        "removed_by_split": {name: int(skipped_dupe[name]) for name in split_names},
        "conflicting_label_groups_quarantined": conflicting_groups,
    }


def build_official_matrices(split_rows, seed=SEED):
    """Build matrices from official splits, shuffling only within each split."""
    rng = random.Random(seed)
    matrices = []
    counts = {}
    for source_name in ("train", "validation", "test"):
        rows = []
        per_class = {}
        for cname in ML_CLASS_ORDER:
            items = list(split_rows[source_name][cname])
            rng.shuffle(items)
            rows.extend((vec, ML_CLASS_ORDER.index(cname)) for vec in items)
            per_class[cname] = len(items)
        rng.shuffle(rows)
        X = np.asarray([row[0] for row in rows], dtype=np.float64)
        y = np.asarray([row[1] for row in rows], dtype=np.int64)
        matrices.append((X, y))
        counts[source_name] = per_class
    return (*matrices, counts)


def _final_estimator(model):
    """Unwrap a Pipeline (StandardScaler + estimator) down to the actual estimator, so
    metadata extraction works the same whether a family is scaled or not."""
    return model.steps[-1][1] if hasattr(model, "steps") else model


def _size_hint(model):
    """A short, family-appropriate 'how big is this model' label for the registry/compare
    page — different model families expose completely different notions of size, so this
    checks the attributes that actually exist rather than assuming n_estimators for all."""
    est = _final_estimator(model)
    for attr in ("n_estimators", "n_support_", "n_neighbors", "hidden_layer_sizes", "n_iter_"):
        val = getattr(est, attr, None)
        if val is not None:
            if attr == "n_support_":
                val = int(np.sum(val))  # total support vectors across classes
            return {"param": attr, "value": val if not hasattr(val, "tolist") else val.tolist()}
    return {"param": None, "value": None}


def evaluate(model, X, y):
    pred = model.predict(X)
    return {
        "accuracy": round(float(accuracy_score(y, pred)), 4),
        "f1": round(float(f1_score(y, pred, average="macro")), 4),
        "precision": round(float(precision_score(y, pred, average="macro", zero_division=0)), 4),
        "recall": round(float(recall_score(y, pred, average="macro", zero_division=0)), 4),
        "confusion_matrix": confusion_matrix(y, pred, labels=list(range(len(ML_CLASS_ORDER)))).tolist(),
    }


def main():
    import tensorflow_datasets as tfds

    print("=" * 70)
    print("Downloading / loading TFDS 'cassava' (no credentials needed)...")
    print("=" * 70)
    ds_all, info = tfds.load("cassava", split=["train", "validation", "test"],
                             as_supervised=True, with_info=True)

    print(f"\nExtracting features (shared with runtime inference code)...")
    split_rows, duplicate_counts = load_official_splits(tfds, ds_all, info)
    (Xtr, ytr), (Xval, yval), (Xte, yte), split_counts = build_official_matrices(split_rows)

    # Every model family CassavaGuard's model registry/comparison page can show.
    # Tree ensembles (RF/ExtraTrees/GB/HistGB) train directly on raw features — they're
    # scale-invariant. SVM/KNN/LogReg/MLP are distance- or gradient-based and need scaled
    # inputs, so those are wrapped in a Pipeline(StandardScaler, model); joblib.dump'ing the
    # whole pipeline means ai_engine.py's clf.predict_proba(vec) keeps working unmodified —
    # the scaler travels with the model, invisible to every caller.
    candidates = {
        "random_forest": [
            RandomForestClassifier(n_estimators=200, max_depth=None, min_samples_leaf=2,
                                   class_weight="balanced", random_state=SEED, n_jobs=-1),
            RandomForestClassifier(n_estimators=400, max_depth=12, min_samples_leaf=1,
                                   class_weight="balanced", random_state=SEED, n_jobs=-1),
        ],
        "extra_trees": [
            ExtraTreesClassifier(n_estimators=300, max_depth=None, min_samples_leaf=2,
                                 class_weight="balanced", random_state=SEED, n_jobs=-1),
            ExtraTreesClassifier(n_estimators=500, max_depth=16, min_samples_leaf=1,
                                 class_weight="balanced", random_state=SEED, n_jobs=-1),
        ],
        "hist_gb": [
            HistGradientBoostingClassifier(max_iter=200, max_depth=None, learning_rate=0.08,
                                           class_weight="balanced", random_state=SEED),
            HistGradientBoostingClassifier(max_iter=300, max_depth=6, learning_rate=0.05,
                                           class_weight="balanced", random_state=SEED),
        ],
        "gradient_boosting": [
            GradientBoostingClassifier(n_estimators=150, max_depth=3, learning_rate=0.1,
                                       subsample=0.9, random_state=SEED),
            GradientBoostingClassifier(n_estimators=250, max_depth=2, learning_rate=0.05,
                                       subsample=0.8, random_state=SEED),
        ],
        "logistic_regression": [
            make_pipeline(StandardScaler(),
                          LogisticRegression(C=1.0, max_iter=2000, class_weight="balanced",
                                             random_state=SEED)),
            make_pipeline(StandardScaler(),
                          LogisticRegression(C=0.3, max_iter=2000, class_weight="balanced",
                                             random_state=SEED)),
        ],
        "svm_rbf": [
            make_pipeline(StandardScaler(),
                          SVC(kernel="rbf", C=2.0, gamma="scale", class_weight="balanced",
                             probability=True, random_state=SEED)),
            make_pipeline(StandardScaler(),
                          SVC(kernel="rbf", C=10.0, gamma="auto", class_weight="balanced",
                             probability=True, random_state=SEED)),
        ],
        "knn": [
            make_pipeline(StandardScaler(), KNeighborsClassifier(n_neighbors=9, weights="distance")),
            make_pipeline(StandardScaler(), KNeighborsClassifier(n_neighbors=15, weights="uniform")),
        ],
        "mlp": [
            make_pipeline(StandardScaler(),
                          MLPClassifier(hidden_layer_sizes=(32,), alpha=1e-3, max_iter=800,
                                       early_stopping=True, random_state=SEED)),
            make_pipeline(StandardScaler(),
                          MLPClassifier(hidden_layer_sizes=(64, 16), alpha=1e-3, max_iter=800,
                                       early_stopping=True, random_state=SEED)),
        ],
    }

    print("\n" + "=" * 70)
    print("Training + model selection (best config per family, chosen on VAL macro-F1)")
    print("=" * 70)
    # Selecting by macro-F1 (not accuracy) matters here: the natural class distribution
    # is imbalanced (cmd/cbsd >> healthy/cbb), so accuracy alone rewards a model that just
    # leans toward the majority class. Macro-F1 weighs every class equally, which is what
    # you want for a diagnostic tool that must not systematically miss rarer conditions.
    best_per_family = {}
    validation_results = {}
    for family, configs in candidates.items():
        best_val_f1, best_model = -1.0, None
        for i, model in enumerate(configs):
            t0 = time.perf_counter()
            model.fit(Xtr, ytr)
            val_pred = model.predict(Xval)
            val_acc = accuracy_score(yval, val_pred)
            val_f1 = f1_score(yval, val_pred, average="macro")
            dt = time.perf_counter() - t0
            print(f"  [{family}] config {i+1}/{len(configs)}: val_acc={val_acc:.4f} val_f1={val_f1:.4f} ({dt:.1f}s)")
            if val_f1 > best_val_f1:
                best_val_f1, best_model = val_f1, model
        best_per_family[family] = best_model
        validation_results[family] = evaluate(best_model, Xval, yval)

    active_id = choose_active_from_validation(validation_results)
    print(f"\nActive model selected on VALIDATION macro-F1: {active_id} "
          f"(val_f1={validation_results[active_id]['f1']:.4f})")

    print("\n" + "=" * 70)
    print("Held-out TEST evaluation (never touched during training/selection)")
    print("=" * 70)
    results = {}
    for family, model in best_per_family.items():
        m = evaluate(model, Xte, yte)
        results[family] = {**m, "size_hint": _size_hint(model)}
        print(f"  [{family}] test: acc={m['accuracy']:.4f} f1={m['f1']:.4f} "
              f"precision={m['precision']:.4f} recall={m['recall']:.4f}")
        print(f"    confusion_matrix (rows=true, cols=pred, order={ML_CLASS_ORDER}):")
        for row in m["confusion_matrix"]:
            print("     ", row)

    for family, model in best_per_family.items():
        atomic_joblib_dump(model, ML_MODELS_DIR / f"{family}.joblib")
        print(f"wrote {ML_MODELS_DIR / (family + '.joblib')}")

    metrics = {
        "active_model_id": active_id,
        "trained_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "classes": ML_CLASS_ORDER,
        "feature_names": FEATURE_NAMES,
        "selection": {
            "set": "validation",
            "metric": "macro_f1",
            "test_used_for_selection": False,
            "validation_metrics": validation_results,
        },
        "artifacts": {
            family: {
                "file": f"{family}.joblib",
                "sha256": sha256_file(ML_MODELS_DIR / f"{family}.joblib"),
            }
            for family in best_per_family
        },
        "dataset": {
            "source": "TFDS 'cassava' (public, https://www.tensorflow.org/datasets/catalog/cassava)",
            "split_policy": "official TFDS train/validation/test preserved; exact dHash "
                            "matches retained only in earliest split",
            "duplicate_audit": duplicate_counts,
            "mendeley_extra": ({"enabled": True, "dir": str(MENDELEY_DIR),
                               "source": "https://data.mendeley.com/datasets/3832tx2cb2/1 (CC BY 4.0)"}
                              if USE_MENDELEY_EXTRA else {"enabled": False}),
            "train": int(sum(split_counts["train"].values())),
            "val": int(sum(split_counts["validation"].values())),
            "test": int(sum(split_counts["test"].values())),
            "per_class_train": split_counts["train"],
            "per_class_val": split_counts["validation"],
            "per_class_test": split_counts["test"],
        },
        "models": {
            family: {"name": FAMILY_NAMES.get(family, family), **results[family]}
            for family in results
        },
    }
    atomic_write_json(ML_MODELS_DIR / "metrics.json", metrics)
    print(f"wrote {ML_MODELS_DIR / 'metrics.json'}")
    print("\nDone. Restart the app (or it will pick up the new model on next process start).")


if __name__ == "__main__":
    main()
