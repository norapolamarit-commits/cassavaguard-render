"""Train a multimodal (satellite + soil + leaf-photo) classifier for CassavaGuard.

Extends backend/training/train_classifier.py (image-only) by concatenating each
photo's hand-crafted image features with satellite vegetation indices (NDVI/NDWI/
SAVI/EVI) and soil metrics (pH/OM/N/P/K/CEC/moisture) for the field it came from.

Reuses the app's REAL production code for every non-image feature — not a
reimplementation:
  - backend.services.satellite_engine.indices_on()  (same function serve.py calls
    live for the "ดาวเทียม" page and field detail page)
  - backend.services.soil_engine.profile()          (same function serve.py calls
    live for the "ดิน" page)
This guarantees the fusion model is trained on numbers computed by the exact same
formulas the running app would compute for a real field, so there is no train/
serve skew for the satellite+soil half of the feature vector either.

======================================================================
IMPORTANT CAVEAT — read before trusting the "does satellite/soil help?" numbers
======================================================================
TFDS 'cassava' (the real photo dataset — see train_classifier.py) has NO location,
planting date, or field history attached to any image; it is just a photo + a
disease label. There is no public dataset that pairs real geotagged cassava photos
with real satellite passes. So for TRAINING ONLY, this script assigns each photo a
SYNTHETIC field context: a lat/lon sampled from Thailand's cassava belt (matching
backend/services/seed.py's real field coordinates), a random planting date, and a
"health" input to satellite_engine.indices_on() that is *derived from the photo's
own disease label* (healthy -> high assumed vigour, diseased -> lower, both with
wide random noise) — because a real diseased plant does tend to show reduced
canopy vigour that real NDVI would pick up, this is an agronomically-motivated
assumption, not a measured fact. Soil metrics are NOT derived from the label at
all (soil_engine.profile() only depends on lat/lon/field_id, independent of plant
health) so that part of the fusion is a clean, non-circular signal.

Net effect: any accuracy/F1 improvement this script reports from adding satellite
features is partly a modelling artefact of that health->NDVI assumption, not proof
that real satellite passes would help by the same amount. Soil's contribution is
more trustworthy (no label leakage there). To get a trustworthy answer for
satellite specifically, you need real geotagged field photos with independently-
measured NDVI at time of photo — until then, treat this as "does the fusion
*architecture* work end-to-end", not "how much would real satellite data help".

The runtime integration exists but is gated by USE_FUSION=false. Keep it disabled
until training uses independently measured paired field observations.

POOLING: same rationale as train_classifier.py — TFDS's 3 official splits are a
plain per-class stratified random split (arXiv:1908.02900), so this script pools
all 3 back together per class, drops exact/near-duplicate images via a perceptual
hash, and re-splits itself with train capped at GLOBAL_TRAIN_CAP per class. See
train_classifier.py's module docstring for the full statistical argument.

EARTH ENGINE (optional, off by default — see USE_EARTH_ENGINE below): when
enabled, satellite indices for each synthetic field context are queried from
real Sentinel-2 imagery via Google Earth Engine instead of satellite_engine.py's
simulated formulas, falling back to the simulation whenever no cloud-light scene
is available near the sampled (lat, lon, date) or GEE isn't authenticated. Soil
metrics are unaffected either way (soil_engine.py has no satellite equivalent).

Run with the isolated training venv (has tensorflow-datasets):
    .venv-training/bin/python backend/training/train_fusion_classifier.py
"""
import json
import random
import sys
import time
from collections import Counter
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(REPO_ROOT))

import datetime as dt
import numpy as np
from PIL import Image
from sklearn.ensemble import (ExtraTreesClassifier, GradientBoostingClassifier,
                              HistGradientBoostingClassifier, RandomForestClassifier)
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, f1_score, precision_score, recall_score
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

from backend.services.feature_extraction import (FEATURE_NAMES, FUSION_FEATURE_NAMES,
                                                  ML_CLASS_ORDER, SATELLITE_FEATURE_NAMES,
                                                  SOIL_FEATURE_NAMES, extract_features,
                                                  feature_vector)
from backend.services.satellite_engine import indices_on as satellite_indices_on
from backend.services.soil_engine import profile as soil_profile
from backend.training.training_utils import (atomic_joblib_dump, atomic_write_json,
                                             choose_active_from_validation, sha256_file)

ML_MODELS_DIR = REPO_ROOT / "backend" / "ml_models"
ML_MODELS_DIR.mkdir(parents=True, exist_ok=True)

# Same ceiling-not-target pooling scheme as train_classifier.py — see that file's
# module docstring for the full imbalance argument (accuracy vs macro-F1 tradeoff).
GLOBAL_TRAIN_CAP = 500
TRAIN_FRAC, VAL_FRAC = 0.70, 0.15   # remainder (0.15) goes to test
SEED = 42
REFERENCE_DATE = dt.date(2025, 1, 1)

# ----------------------------------------------------------------------
# OPTIONAL: extra real images from the Mendeley "Cassava Leaf Disease Dataset"
# (IIT Kharagpur, India), DOI 10.17632/3832tx2cb2.1, CC BY 4.0 — see
# train_classifier.py's identical toggle for the full rationale/caveats. Off by
# default; requires a manual download+unzip first (no download API exists).
# ----------------------------------------------------------------------
USE_MENDELEY_EXTRA = False
MENDELEY_DIR = None
MENDELEY_CLASS_ALIASES = {
    "healthy": "healthy",
    "cbb": "cbb",
    "cmv": "cmd",  # assumption, not a confirmed 1:1 label mapping — see train_classifier.py
}

# ----------------------------------------------------------------------
# OPTIONAL: real Sentinel-2 satellite indices via Google Earth Engine, in place
# of satellite_engine.py's simulated NDVI/NDWI/SAVI/EVI. Off by default — needs
# a one-time `earthengine authenticate` plus a registered GCP project, which most
# people running this script won't have set up, and the app itself is designed
# to work with zero external dependencies (see satellite_engine.py). Turning this
# on only changes where the four satellite numbers going into training come from;
# the synthetic (lat, lon, date) sampling and the "health" label-derived input to
# the simulated formulas are unchanged, and still apply as the fallback whenever
# GEE has no usable scene for a given point/date.
# ----------------------------------------------------------------------
USE_EARTH_ENGINE = False
GEE_PROJECT = None  # required by ee.Initialize(project=...) since Nov 2024 —
                     # set to your GCP project id (e.g. "my-cassava-project")

_ee_initialized = False
_ee_stats = {"real_hits": 0, "simulated_fallback": 0}


def _ee_init_once():
    """Lazily authenticate/initialize Earth Engine exactly once per process.
    Any failure (not authenticated, no network, ee package missing) is treated
    as 'GEE unavailable' and silently falls back to the simulation — this is a
    training-data enrichment, not something worth crashing a training run over."""
    global _ee_initialized
    if _ee_initialized:
        return True
    try:
        import ee
        ee.Initialize(project=GEE_PROJECT)
        _ee_initialized = True
        return True
    except Exception as exc:
        print(f"  [earth-engine] init failed ({exc}); using satellite_engine.py simulation instead")
        return False


def _ee_indices(lat, lon, on_date):
    """Real Sentinel-2 NDVI/NDWI/SAVI/EVI for the least-cloudy scene within 30
    days before `on_date` at (lat, lon). Returns None (caller falls back to the
    simulated formulas) if no scene is found or the query fails for any reason —
    a missing scene near a random synthetic point/date is an expected, common
    outcome, not an error.

    Verification note: NDVI/NDWI here (Initialize(project=...), the
    COPERNICUS/S2_SR_HARMONIZED collection, band names, the /10000 reflectance
    scale, [lon, lat] point order, and this reduceRegion() call shape) were
    independently research-verified against Google's own docs before writing
    this. SAVI (Huete 1988, L=0.5) and EVI (Huete et al. 2002) are the standard
    published formulas but were not separately fact-checked the same way — they
    are well-established, not something we invented, just flagging the
    difference in verification rigor for the record."""
    import ee
    try:
        point = ee.Geometry.Point([lon, lat])  # GEE point order is [lon, lat]
        end = ee.Date(on_date.isoformat())
        start = end.advance(-30, "day")
        coll = (ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
                .filterBounds(point).filterDate(start, end)
                .filter(ee.Filter.lt("CLOUDY_PIXEL_PERCENTAGE", 40))
                .sort("CLOUDY_PIXEL_PERCENTAGE"))
        img = coll.first()
        bands = img.select(["B2", "B3", "B4", "B8"]).divide(10000)  # DN -> reflectance
        b2, b3, b4, b8 = (bands.select(b) for b in ["B2", "B3", "B4", "B8"])
        ndvi = img.normalizedDifference(["B8", "B4"])
        ndwi = img.normalizedDifference(["B3", "B8"])
        L = 0.5
        savi = b8.subtract(b4).divide(b8.add(b4).add(L)).multiply(1 + L)
        evi = (b8.subtract(b4).multiply(2.5)
               .divide(b8.add(b4.multiply(6)).subtract(b2.multiply(7.5)).add(1)))
        stacked = ee.Image.cat([ndvi.rename("ndvi"), ndwi.rename("ndwi"),
                                 savi.rename("savi"), evi.rename("evi")])
        vals = stacked.reduceRegion(reducer=ee.Reducer.mean(), geometry=point,
                                     scale=10, maxPixels=1e9).getInfo()
        if not vals or vals.get("ndvi") is None:
            return None
        return {k: float(vals[k]) for k in ["ndvi", "ndwi", "savi", "evi"]}
    except Exception:
        return None

# Same bounding region as the real demo fields in backend/services/seed.py
# (Nakhon Ratchasima / Chaiyaphum / Kanchanaburi — Thailand's cassava belt).
LAT_RANGE = (14.2, 16.1)
LON_RANGE = (99.4, 102.1)

# SATELLITE_FEATURE_NAMES / SOIL_FEATURE_NAMES / FUSION_FEATURE_NAMES now come from
# feature_extraction.py (imported above) — single source of truth shared with ai_engine.py's
# real-time fusion serving code, so the two can never silently drift out of order.

FAMILY_NAMES = {
    "random_forest": "Random Forest", "extra_trees": "Extra Trees",
    "hist_gb": "Hist Gradient Boosting", "gradient_boosting": "Gradient Boosting",
    "logistic_regression": "Logistic Regression",
}


def _synthetic_field_context(cname, rng):
    """One synthetic (lat, lon, planted, health, observed-on) tuple for a training
    photo. health is DELIBERATELY correlated with the label (see module docstring
    caveat) — diseased classes get a lower, noisier assumed vigour than healthy."""
    lat = rng.uniform(*LAT_RANGE)
    lon = rng.uniform(*LON_RANGE)
    # A fixed reference date makes the experimental dataset reproducible.  Using
    # date.today() here made identical seeded runs produce different features.
    planted = REFERENCE_DATE - dt.timedelta(days=int(rng.uniform(20, 320)))
    on = REFERENCE_DATE - dt.timedelta(days=int(rng.uniform(0, 10)))
    if cname == "healthy":
        health = float(np.clip(rng.normal(85, 8), 55, 98))
    else:
        health = float(np.clip(rng.normal(52, 15), 12, 88))
    return lat, lon, planted, health, on


def _fusion_vector(img_feats, lat, lon, planted, health, on, field_id):
    """image(12) + satellite(4) + soil(7, real formulas, label-independent).
    Satellite defaults to satellite_engine.py's simulated formulas; when
    USE_EARTH_ENGINE=True, tries real Sentinel-2 first and only falls back to
    the simulation when no usable scene is found near (lat, lon, on)."""
    sat = None
    if USE_EARTH_ENGINE and _ee_init_once():
        sat = _ee_indices(lat, lon, on)
    if sat is not None:
        _ee_stats["real_hits"] += 1
    else:
        sat = satellite_indices_on(field_id, lat, lon, planted, health, on)
        if USE_EARTH_ENGINE:
            _ee_stats["simulated_fallback"] += 1
    soil = soil_profile(field_id, lat, lon)["metrics"]
    return (feature_vector(img_feats)
            + [sat[k] for k in SATELLITE_FEATURE_NAMES]
            + [soil[k] for k in SOIL_FEATURE_NAMES])


def dhash(img_pil, hash_size=8):
    """Perceptual difference-hash — see train_classifier.py's dhash() for the
    full rationale; duplicated here (not imported) so this script stays a
    standalone, independently-runnable file like its sibling."""
    small = img_pil.convert("L").resize((hash_size + 1, hash_size), Image.LANCZOS)
    arr = np.asarray(small, dtype=np.int16)
    bits = (arr[:, 1:] > arr[:, :-1]).flatten()
    h = 0
    for b in bits:
        h = (h << 1) | int(b)
    return h


def load_mendeley_extra_fusion(base_dir, seen_hashes, rng):
    """Best-effort loader for a manually-downloaded+unzipped Mendeley dataset (see
    USE_MENDELEY_EXTRA toggle above) — same folder-walk/dedup logic as
    train_classifier.py's load_mendeley_extra(), but also attaches a synthetic
    field context (+ fusion vector) to each image, same as the TFDS pool.
    field_id starts at 1,000,000 to avoid any accidental collision with TFDS
    pooled field ids (harmless either way — field_id only seeds deterministic
    synthetic satellite/soil formulas — but keeping the ranges disjoint makes
    debugging easier). Returns {class_name: [(img_vec, fusion_vec), ...]}."""
    extra = {c: [] for c in ML_CLASS_ORDER}
    if base_dir is None:
        return extra
    base_dir = Path(base_dir)
    if not base_dir.is_dir():
        print(f"  [mendeley] {base_dir} not found — download + unzip it first "
              f"(https://data.mendeley.com/datasets/3832tx2cb2/1), skipping")
        return extra
    found_any = False
    field_id_counter = 1_000_000
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
            lat, lon, planted, health, on = _synthetic_field_context(cname, rng)
            field_id_counter += 1
            img_vec = feature_vector(feats)
            fusion_vec = _fusion_vector(feats, lat, lon, planted, health, on, field_id_counter)
            extra[cname].append((img_vec, fusion_vec))
            n_added += 1
        print(f"  [mendeley] {sub.name} -> {cname}: +{n_added} images ({n_dupe} duplicates skipped)")
    if not found_any:
        print(f"  [mendeley] no subfolder under {base_dir} matched "
              f"{list(MENDELEY_CLASS_ALIASES)} (case-insensitive) — check "
              f"MENDELEY_CLASS_ALIASES against your actual folder names")
    return extra


def load_pooled_fusion(tfds, ds_all, info, rng):
    """Pool all 3 TFDS splits per class, dedupe via dhash(), and attach a
    synthetic field context (+ fusion vector) to each surviving unique image.
    Also folds in extra Mendeley images (see USE_MENDELEY_EXTRA above) when
    enabled. Returns {class_name: [(img_vec, fusion_vec), ...]}."""
    label_names = info.features["label"].names
    per_class = {c: [] for c in ML_CLASS_ORDER}
    seen_hashes = set()
    skipped_unmapped = skipped_dupe = 0
    field_id_counter = 0
    t0 = time.perf_counter()
    for split_name, ds in zip(["train", "validation", "test"], ds_all):
        for img_arr, label_idx in tfds.as_numpy(ds):
            cname = label_names[int(label_idx)]
            if cname not in ML_CLASS_ORDER:
                skipped_unmapped += 1
                continue
            img = Image.fromarray(img_arr).convert("RGB")
            h = dhash(img)
            if h in seen_hashes:
                skipped_dupe += 1
                continue
            seen_hashes.add(h)
            img.thumbnail((256, 256))
            feats = extract_features(img)
            lat, lon, planted, health, on = _synthetic_field_context(cname, rng)
            field_id_counter += 1
            img_vec = feature_vector(feats)
            fusion_vec = _fusion_vector(feats, lat, lon, planted, health, on, field_id_counter)
            per_class[cname].append((img_vec, fusion_vec))
    dt_s = time.perf_counter() - t0
    print(f"  pooled all 3 official splits: {sum(len(v) for v in per_class.values())} unique images "
          f"({ {c: len(v) for c, v in per_class.items()} }), {skipped_unmapped} unmapped-class skipped "
          f"(0 expected — TFDS 'cassava' only has our 5 classes), "
          f"{skipped_dupe} exact/near-duplicate skipped, {dt_s:.1f}s")
    if USE_MENDELEY_EXTRA:
        extra = load_mendeley_extra_fusion(MENDELEY_DIR, seen_hashes, rng)
        for cname, items in extra.items():
            per_class[cname].extend(items)
        print(f"  [mendeley] added {sum(len(v) for v in extra.values())} extra images "
              f"— pooled total now {sum(len(v) for v in per_class.values())}")
    return per_class


def stratified_pool_split_fusion(per_class, seed=SEED):
    """Same ceiling-not-target train/val/test split as train_classifier.py's
    stratified_pool_split(), but carrying the paired (img_vec, fusion_vec) rows
    together so the image-only and fusion models are compared on identical rows."""
    rng = random.Random(seed)
    Xtr_img, Xtr_fus, ytr = [], [], []
    Xval_img, Xval_fus, yval = [], [], []
    Xte_img, Xte_fus, yte = [], [], []
    counts = {"train": Counter(), "val": Counter(), "test": Counter(), "total": Counter()}
    for cname, items in per_class.items():
        items = list(items)
        rng.shuffle(items)
        n = len(items)
        n_train = min(GLOBAL_TRAIN_CAP, int(n * TRAIN_FRAC))
        n_val = int(n * VAL_FRAC)
        n_test = n - n_train - n_val
        cls_id = ML_CLASS_ORDER.index(cname)
        for img_vec, fus_vec in items[:n_train]:
            Xtr_img.append(img_vec); Xtr_fus.append(fus_vec); ytr.append(cls_id)
        for img_vec, fus_vec in items[n_train:n_train + n_val]:
            Xval_img.append(img_vec); Xval_fus.append(fus_vec); yval.append(cls_id)
        for img_vec, fus_vec in items[n_train + n_val:n_train + n_val + n_test]:
            Xte_img.append(img_vec); Xte_fus.append(fus_vec); yte.append(cls_id)
        counts["total"][cname] = n; counts["train"][cname] = n_train
        counts["val"][cname] = n_val; counts["test"][cname] = n_test
    return (
        (np.asarray(Xtr_img, dtype=np.float64), np.asarray(Xtr_fus, dtype=np.float64), np.asarray(ytr, dtype=np.int64)),
        (np.asarray(Xval_img, dtype=np.float64), np.asarray(Xval_fus, dtype=np.float64), np.asarray(yval, dtype=np.int64)),
        (np.asarray(Xte_img, dtype=np.float64), np.asarray(Xte_fus, dtype=np.float64), np.asarray(yte, dtype=np.int64)),
        {k: dict(v) for k, v in counts.items()},
    )


def evaluate(model, X, y):
    pred = model.predict(X)
    return {
        "accuracy": round(float(accuracy_score(y, pred)), 4),
        "f1": round(float(f1_score(y, pred, average="macro")), 4),
        "precision": round(float(precision_score(y, pred, average="macro", zero_division=0)), 4),
        "recall": round(float(recall_score(y, pred, average="macro", zero_division=0)), 4),
    }


def _candidates():
    """A representative subset of train_classifier.py's model families — enough
    to see whether fusion helps without doubling total training time again."""
    return {
        "random_forest": RandomForestClassifier(n_estimators=300, max_depth=None,
                                                 min_samples_leaf=2, class_weight="balanced",
                                                 random_state=SEED, n_jobs=-1),
        "extra_trees": ExtraTreesClassifier(n_estimators=400, max_depth=None,
                                            min_samples_leaf=1, class_weight="balanced",
                                            random_state=SEED, n_jobs=-1),
        "hist_gb": HistGradientBoostingClassifier(max_iter=250, max_depth=None,
                                                   learning_rate=0.06, class_weight="balanced",
                                                   random_state=SEED),
        "gradient_boosting": GradientBoostingClassifier(n_estimators=200, max_depth=3,
                                                         learning_rate=0.08, subsample=0.9,
                                                         random_state=SEED),
        "logistic_regression": make_pipeline(
            StandardScaler(),
            LogisticRegression(C=1.0, max_iter=2000, class_weight="balanced", random_state=SEED)),
    }


def train_and_eval_all(Xtr, ytr, Xval, yval, Xte, yte, tag):
    """Train every family in _candidates() on (Xtr,ytr), select nothing (single
    config per family here, unlike train_classifier.py's 2-config search — kept
    simple since the point of this script is the image-vs-fusion comparison, not
    another hyperparameter sweep) and report held-out test metrics."""
    results = {}
    validation_results = {}
    best_models = {}
    for family, model in _candidates().items():
        t0 = time.perf_counter()
        model.fit(Xtr, ytr)
        val_m = evaluate(model, Xval, yval)
        test_m = evaluate(model, Xte, yte)
        dt_s = time.perf_counter() - t0
        print(f"  [{tag}/{family}] val_f1={val_m['f1']:.4f} test_acc={test_m['accuracy']:.4f} "
              f"test_f1={test_m['f1']:.4f} ({dt_s:.1f}s)")
        validation_results[family] = val_m
        results[family] = test_m
        best_models[family] = model
    return validation_results, results, best_models


def main():
    import tensorflow_datasets as tfds
    rng = np.random.default_rng(SEED)
    random.seed(SEED)

    print("=" * 70); print("Downloading / loading TFDS 'cassava' ..."); print("=" * 70)
    ds_all, info = tfds.load("cassava", split=["train", "validation", "test"],
                             as_supervised=True, with_info=True)

    sat_source = "real Sentinel-2 via Earth Engine (falls back to satellite_engine.py sim)" \
        if USE_EARTH_ENGINE else "satellite_engine.py simulation"
    print(f"\nExtracting image features + synthesizing field context "
          f"(satellite via {sat_source}, soil via application soil_engine.py)...")
    per_class = load_pooled_fusion(tfds, ds_all, info, rng)
    (Xtr_img, Xtr_fus, ytr), (Xval_img, Xval_fus, yval), (Xte_img, Xte_fus, yte), split_counts = \
        stratified_pool_split_fusion(per_class)
    if USE_EARTH_ENGINE:
        print(f"  [earth-engine] real scene hits={_ee_stats['real_hits']} "
              f"simulated fallback={_ee_stats['simulated_fallback']}")

    print(f"\nfeature dims: image-only={Xtr_img.shape[1]}, fusion={Xtr_fus.shape[1]} "
          f"(+{len(SATELLITE_FEATURE_NAMES)} satellite +{len(SOIL_FEATURE_NAMES)} soil)")

    print("\n" + "=" * 70); print("IMAGE-ONLY baseline (same features as train_classifier.py)"); print("=" * 70)
    img_validation, img_results, _ = train_and_eval_all(
        Xtr_img, ytr, Xval_img, yval, Xte_img, yte, "image")

    print("\n" + "=" * 70); print("FUSION (image + satellite + soil)"); print("=" * 70)
    fusion_validation, fusion_results, fusion_models = train_and_eval_all(
        Xtr_fus, ytr, Xval_fus, yval, Xte_fus, yte, "fusion")

    print("\n" + "=" * 70); print("COMPARISON — image-only vs fusion (held-out test)"); print("=" * 70)
    print(f"  {'family':22} {'img_f1':>8} {'fusion_f1':>10} {'delta':>8}")
    for family in img_results:
        d = fusion_results[family]["f1"] - img_results[family]["f1"]
        sign = "+" if d >= 0 else ""
        print(f"  {family:22} {img_results[family]['f1']:>8.4f} {fusion_results[family]['f1']:>10.4f} {sign}{d:>7.4f}")

    active_id = choose_active_from_validation(fusion_validation)
    print(f"\nBest experimental fusion model selected on validation macro-F1: {active_id} "
          f"(val_f1={fusion_validation[active_id]['f1']:.4f})")

    for family, model in fusion_models.items():
        atomic_joblib_dump(model, ML_MODELS_DIR / f"fusion_{family}.joblib")
        print(f"wrote {ML_MODELS_DIR / f'fusion_{family}.joblib'}")

    metrics = {
        "active_model_id": active_id,
        "trained_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "classes": ML_CLASS_ORDER,
        "feature_names": FUSION_FEATURE_NAMES,
        "image_feature_names": FEATURE_NAMES,
        "satellite_feature_names": SATELLITE_FEATURE_NAMES,
        "soil_feature_names": SOIL_FEATURE_NAMES,
        "production_eligible": False,
        "reproducible": False,
        "selection": {
            "set": "validation",
            "metric": "macro_f1",
            "test_used_for_selection": False,
            "validation_metrics": fusion_validation,
        },
        "artifacts": {
            family: {
                "file": f"fusion_{family}.joblib",
                "sha256": sha256_file(ML_MODELS_DIR / f"fusion_{family}.joblib"),
            }
            for family in fusion_models
        },
        "caveat": ("health->NDVI input for training rows is derived from the photo's own "
                  "disease label with wide random noise, since TFDS 'cassava' has no real "
                  "geotagged field history; soil features are label-independent (lat/lon/"
                  "field_id only). Downstream weather/soil engines also depend on the run "
                  "date, so the fixed synthetic reference date does not make the complete "
                  "fusion run reproducible. See module docstring."),
        "dataset": {
            "source": "TFDS 'cassava' (public) + synthetic field context via real "
                      "satellite_engine.py / soil_engine.py formulas",
            "pooling": "all 3 official splits pooled per class, deduplicated via "
                       "perceptual hash, then re-split ourselves — see module docstring",
            "mendeley_extra": ({"enabled": True, "dir": str(MENDELEY_DIR),
                               "source": "https://data.mendeley.com/datasets/3832tx2cb2/1 (CC BY 4.0)"}
                              if USE_MENDELEY_EXTRA else {"enabled": False}),
            "train": int(sum(split_counts["train"].values())),
            "val": int(sum(split_counts["val"].values())),
            "test": int(sum(split_counts["test"].values())),
            "per_class_total": split_counts["total"],
            "per_class_train": split_counts["train"],
            "per_class_val": split_counts["val"],
            "per_class_test": split_counts["test"],
            "earth_engine": ({
                "enabled": True, "project": GEE_PROJECT,
                "real_scene_hits": _ee_stats["real_hits"],
                "simulated_fallback": _ee_stats["simulated_fallback"],
            } if USE_EARTH_ENGINE else {"enabled": False}),
            "synthetic_reference_date": REFERENCE_DATE.isoformat(),
        },
        "image_only_validation": {
            family: {"name": FAMILY_NAMES.get(family, family), **img_validation[family]}
            for family in img_validation
        },
        "image_only": {family: {"name": FAMILY_NAMES.get(family, family), **img_results[family]}
                       for family in img_results},
        "fusion": {family: {"name": FAMILY_NAMES.get(family, family), **fusion_results[family]}
                  for family in fusion_results},
    }
    atomic_write_json(ML_MODELS_DIR / "fusion_metrics.json", metrics)
    print(f"wrote {ML_MODELS_DIR / 'fusion_metrics.json'}")
    print("\nDone. Fusion remains experimental and production_eligible=false because "
          "the satellite context is derived from the target label. Serving must keep "
          "USE_FUSION=false until paired real field observations exist.")


if __name__ == "__main__":
    main()
