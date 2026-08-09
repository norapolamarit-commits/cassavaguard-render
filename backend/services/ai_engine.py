"""AI inference engine for cassava crop decision support.

The diagnostic probability distribution contains only the five classes that
the loaded model was actually trained on:

- healthy / cbb / cbsd / cmd / cgm: the scikit-learn candidate selected only by
  validation macro-F1 (currently Hist Gradient Boosting — see
  backend/training/train_classifier.py)
  trained on real, labelled photographs from the public
  TFDS 'cassava' dataset (which has all 5 of these classes). Its feature
  vector is the same hand-crafted colour/texture extraction used everywhere
  else in this file (see backend.services.feature_extraction), so training
  and serving never skew.
- brown_leaf_spot is an independent binary auxiliary head trained on real CCMT
  images. It is returned under auxiliary_findings and never mixed into the
  primary five-way distribution.
- white_leaf_spot is exposed only as an experimental, local auxiliary head.
- whitefly is exposed only as an experimental, local object detector/count;
  it is never folded into the five-way disease probability distribution.
- water_stress / nutrient_def / cad / sed / mealybug are not served as image
  diagnoses because no verified, task-appropriate artifact is present.

If no verified classifier is available, inference fails closed. It never
silently substitutes hand-written rules for a trained diagnosis model.

Optional third mechanism — fusion (image + satellite + soil), see
backend/training/train_fusion_classifier.py: when a prediction is linked to a
Field (field_id given), USE_FUSION is explicitly enabled, AND a trained fusion
classifier exists (backend/
services/fusion_classifier.py), the 5 ML-backed classes are served by the
fusion model instead of the image-only one, using the SAME
satellite_engine.indices_on()/soil_engine.profile() formulas the app's own
satellite/soil pages already show for that field. The fusion artifact remains
disabled because its training context contains target leakage.
Strictly additive: no field_id, or no trained fusion model yet, silently
falls back to image-only prediction exactly as before fusion existed.
Disclosed via the "fusion_used" boolean on every prediction response.

Optional fourth mechanism — a real CNN (EfficientNet-B0 trained end-to-end on raw
224x224x3 leaf pixels, see backend/services/cnn_classifier.py and backend.config.
USE_CNN): when USE_CNN is True AND a trained CNN model actually exists on disk, it
preempts BOTH the fusion and image-only classical classifiers for the 5 ML-backed
classes — see _score()'s docstring for the exact 3-way priority and the reasoning
for why CNN is allowed to preempt fusion by default. Strictly additive, same as
fusion: USE_CNN defaults to False, so the app behaves exactly as before until both
conditions are true. Disclosed
via the "cnn_used" boolean on every prediction response, alongside "fusion_used".
"""
import base64
import datetime as dt
import io
import time

import numpy as np
from PIL import Image, ImageFilter

from backend.config import (
    ACTIVE_MODEL,
    AI_FIELD_VALIDATED,
    AI_MIN_CONFIDENCE,
    AI_MIN_MARGIN,
    CLASSES,
    ENVIRONMENTAL_DATA_MODE,
    USE_CNN,
    USE_FUSION,
)
from backend.services.cnn_classifier import (cnn_predict_proba, cnn_predict_proba_batch,
                                             get_cnn_metrics, get_cnn_session)
from backend.services.brown_spot_classifier import (
    brown_spot_predict_probability,
    get_brown_spot_classifier,
    get_brown_spot_metrics,
)
from backend.services.white_leaf_spot_classifier import (
    get_white_leaf_spot_classifier,
    get_white_leaf_spot_metrics,
    white_leaf_spot_predict_probability,
)
from backend.services.whitefly_detector import (
    detect_whiteflies,
    get_whitefly_metrics,
    get_whitefly_session,
)
from backend.services.feature_extraction import (FEATURE_NAMES, FUSION_FEATURE_NAMES,
                                                  ML_CLASS_ORDER, SATELLITE_FEATURE_NAMES,
                                                  SOIL_FEATURE_NAMES, TARGET_SIZE, extract_features,
                                                  feature_vector, load_image)
from backend.services.fusion_classifier import get_fusion_classifier, get_fusion_metrics
from backend.services.ml_classifier import get_classifier
from backend.services.satellite_engine import indices_on as satellite_indices_on
from backend.services.soil_engine import profile as soil_profile

CLASS_KEYS = [c["key"] for c in CLASSES]


class ModelUnavailableError(RuntimeError):
    """No verified trained classifier can serve this request."""


def _fusion_extra_features(field) -> list:
    """Field-context satellite + soil features for "today" — the 11-dim non-image
    portion of a fusion vector (4 satellite + 7 soil, FUSION_FEATURE_NAMES tail order),
    using the exact same satellite_engine/soil_engine functions the app's own
    satellite/soil pages call. This experimental path is disabled outside tests.
    Split out from the image features so predict_image() can compute this once and
    reuse it for both the fusion classifier's input AND the occlusion-sensitivity
    heatmap's fixed (non-occludable) portion, without a Field ORM object leaking into
    _score()/_occlusion_sensitivity() — those only ever see plain numbers."""
    planted = field.planted_at.date()
    on = dt.date.today()
    sat = satellite_indices_on(field.id, field.lat, field.lon, planted, field.health_score, on)
    soil = soil_profile(field.id, field.lat, field.lon)["metrics"]
    return [sat[k] for k in SATELLITE_FEATURE_NAMES] + [soil[k] for k in SOIL_FEATURE_NAMES]


def _load(image_bytes: bytes) -> Image.Image:
    return load_image(image_bytes)


def _load_full_resolution(image_bytes: bytes) -> Image.Image:
    """Decode without the 256px classifier thumbnail used by feature extraction.

    Tiny-object detectors must see the uploaded pixels. Passing the shared
    classifier thumbnail here silently removes whiteflies from otherwise valid
    photographs.
    """
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    image.load()
    return image


# --------------------------------------------------------------------------- #
# Scoring: verified trained classifier, five supported classes only           #
# --------------------------------------------------------------------------- #
def _heuristic_score(f: dict) -> dict:
    """Original hand-tuned linear scoring across all 13 classes. Used as: (a) the full
    fallback when no trained classifier is available yet, (b) the water_stress/
    nutrient_def signal always (no labelled dataset exists for those anywhere), and
    (c) inside _score() below, the relative weight given to "this looks like water
    stress / nutrient deficiency" vs "this is one of the 5 diseases/classes the
    trained classifier knows" when blending the two mechanisms.
    """
    s = {k: 0.0 for k in CLASS_KEYS}

    # Healthy: lots of uniform green, high pseudo-NDVI, low lesions
    s["healthy"] = (2.6 * f["green_frac"] + 1.4 * max(0, f["pseudo_ndvi"])
                    - 2.2 * f["brown_frac"] - 1.8 * f["necrosis_frac"]
                    - 1.1 * f["yellow_frac"] - 1.3 * f["mottle"] * 4)

    # CMD (mosaic): high mottling + hue variance, moderate yellow, green present
    s["cmd"] = (5.5 * f["mottle"] + 1.6 * f["yellow_frac"]
                + 0.8 * f["edge_density"] + 0.6 * f["green_frac"] - 0.6 * f["brown_frac"])

    # CBSD (brown streak): streaks + brown, chlorosis
    s["cbsd"] = (3.2 * f["streak"] + 2.4 * f["brown_frac"]
                 + 1.0 * f["yellow_frac"] + 1.4 * f["edge_density"])

    # CBB (bacterial blight): dark necrosis + bright angular spots + brown margins
    s["cbb"] = (3.4 * f["necrosis_frac"] + 2.6 * f["bright_spot_frac"]
                + 1.8 * f["brown_frac"] + 0.7 * f["edge_density"])

    # CGM (green mite): fine chlorotic stippling + bronzing/yellowing + leaf curling/
    # deformation at growing tips ("candlestick" symptom) — distinguished from CMD
    # mainly by LOW mottle (feeding damage is fine-grained stippling, not the large
    # blotchy mosaic patches mottle picks up) and from CBSD/CBB by low brown_frac/
    # necrosis_frac (mite feeding discolours and deforms tissue, it doesn't brown or
    # necrotise it the way the bacterial/viral diseases do)
    s["cgm"] = (2.2 * f["yellow_frac"] + 1.6 * f["bright_spot_frac"]
                + 1.3 * f["edge_density"] - 1.8 * f["mottle"] * 3
                - 1.0 * f["brown_frac"] - 0.6 * f["necrosis_frac"])

    # --- 6 more heuristic-only disease/pest classes, added after a multi-agent
    # research + adversarial-verification pass (each independently source-checked
    # against CABI/FAO/CIAT/IITA/peer-reviewed literature/Thai DOA extension
    # material before writing these formulas — not guessed). None of these have a
    # labelled photo dataset anywhere, same as water_stress/nutrient_def, so they
    # stay heuristic-only. `texture_var` (grad.var()) runs roughly 10-25x smaller
    # in magnitude than the fraction-based features in real samples, so its terms
    # below carry an explicit "* 40" calibration multiplier (a rough estimate from
    # limited real samples, not a precisely fitted constant) to be comparable.

    # CAD (anthracnose): discrete sunken necrotic spots with pale centres
    # (sometimes pinkish fungal fruiting bodies), scattered — NOT a diffuse mosaic
    # (low mottle, unlike cmd) and NOT vein-following (low streak, unlike cbsd).
    # Known limitation, disclosed rather than hidden: shares necrosis_frac/
    # bright_spot_frac with cbb, so the two are the most likely mutual confusion
    # of any pair in this taxonomy — cbb's lesions are angular/water-soaked with
    # ooze in the literature, cues these 12 features can't capture directly.
    s["cad"] = (1.8 * f["necrosis_frac"] + 2.0 * f["bright_spot_frac"]
                + 1.0 * f["edge_density"] + 1.0 * f["texture_var"] * 40
                + 0.4 * f["brown_frac"] - 0.8 * f["streak"]
                - 0.5 * f["mottle"] * 3 - 0.3 * f["pseudo_ndvi"]
                - 0.3 * f["mean_sat"])

    # Brown leaf spot: discrete, sharp-edged, roughly circular brown spots on
    # otherwise normal old leaves (often with a chlorotic halo before premature
    # drop) — chronic and cosmetic-looking, unlike cbb's fast wilting/blight or
    # cmd's diffuse mottle.
    s["brown_leaf_spot"] = (2.0 * f["brown_frac"] + 1.0 * f["necrosis_frac"]
                            + 0.8 * f["edge_density"] + 0.5 * f["yellow_frac"]
                            + 0.4 * f["bright_spot_frac"] - 0.6 * f["mottle"] * 3
                            - 0.8 * f["streak"] - 0.3 * f["pseudo_ndvi"])

    # White leaf spot: many small (1-7mm) pale/white sunken spots, scattered —
    # a fine speckled texture rather than a few larger lesions. mottle's weight
    # is deliberately kept low here (not a confident CMD-disambiguator per the
    # verification pass — mottle's fine-scale blur-difference metric can fire on
    # small sharp spots almost as readily as on cmd's blotches, so leaning on it
    # too hard would be overclaiming precision the underlying feature doesn't have).
    s["white_leaf_spot"] = (1.4 * f["bright_spot_frac"] + 1.0 * f["edge_density"]
                            + 0.8 * f["texture_var"] * 40 + 0.3 * f["brown_frac"]
                            - 0.6 * f["necrosis_frac"] - 0.2 * f["mottle"]
                            - 0.4 * f["streak"] - 0.3 * f["mean_sat"]
                            - 0.2 * f["pseudo_ndvi"])

    # SED (super elongation disease): chlorotic spots with necrotic centres that
    # dry out into "shot-holes", plus raised corky scab lesions on the midrib/
    # petiole (rough, high local texture) — no established Thai name found in DOA
    # extension material (see config.py CLASSES comment), unlike the others here.
    s["sed"] = (1.8 * f["necrosis_frac"] + 1.6 * f["bright_spot_frac"]
                + 1.2 * f["texture_var"] * 40 + 1.0 * f["edge_density"]
                + 0.4 * f["yellow_frac"] - 0.6 * f["mottle"] * 3
                - 0.8 * f["streak"] - 0.3 * f["pseudo_ndvi"])

    # Mealybug: white waxy insect masses + honeydew residue on young leaves/
    # growing tips, dulling colour saturation — trimmed to the ~5 strongest terms
    # per the verification pass rather than the original 9 (edge_density's
    # "curling distorts margins" justification didn't hold up: edge_density is a
    # 2D edge-count feature, not a proxy for 3D leaf-fold geometry from an
    # arbitrary camera angle). Known limitation: its single most diagnostic real
    # cue (visible insect bodies + whole-shoot "bunchy top") isn't something a
    # 2D single-leaf colour/texture feature can capture — this heuristic is
    # weaker/less specific than most of the others here, by nature of the pest.
    s["mealybug"] = (1.8 * f["bright_spot_frac"] + 1.2 * f["yellow_frac"]
                     - 1.0 * f["mean_sat"] - 0.7 * f["mottle"] * 3
                     - 0.5 * f["streak"])

    # Whitefly (direct feeding damage): anchored on the sooty-mould darkening
    # signature (low value, low saturation) rather than mottling/yellowing alone,
    # since B. tabaci is CMD's own vector and the two symptom sets legitimately
    # overlap in the field and in the literature. Known limitation, the lowest-
    # confidence class in this set: if sooty mould isn't visible in the
    # photographed leaf area (e.g. only upper canopy shown), this will likely
    # score similarly to cmd — an honest limitation of a single-leaf-photo
    # heuristic, not something a formula tweak can fix.
    s["whitefly"] = (0.9 * f["yellow_frac"] - 1.1 * f["mean_val"]
                     - 0.8 * f["mean_sat"] + 0.6 * f["texture_var"] * 40
                     - 0.5 * f["pseudo_ndvi"] - 0.5 * f["mottle"] * 3
                     - 0.4 * f["streak"] - 0.4 * f["necrosis_frac"])

    # Water stress: low saturation, wilting -> low NDVI, some yellowing, low green
    s["water_stress"] = (2.4 * max(0, 0.35 - f["mean_sat"]) * 3
                         + 1.9 * f["yellow_frac"] + 1.5 * max(0, -f["pseudo_ndvi"]) * 3
                         - 1.4 * f["green_frac"] + 1.2 * (1 - f["mean_val"]) * f["yellow_frac"] * 3)

    # Nutrient deficiency: uniform interveinal yellowing, moderate green, low mottle
    s["nutrient_def"] = (3.6 * f["yellow_frac"] + 1.1 * f["green_frac"]
                         - 2.0 * f["mottle"] * 4 - 1.2 * f["necrosis_frac"]
                         + 0.9 * max(0, 0.5 - f["pseudo_ndvi"]))

    # temperature-scaled softmax
    vals = np.array([s[k] for k in CLASS_KEYS], dtype=np.float64)
    vals = (vals - vals.mean()) / (vals.std() + 1e-6)
    exp = np.exp(vals / 0.7)
    probs = exp / exp.sum()
    return {k: float(p) for k, p in zip(CLASS_KEYS, probs)}


def _score(f: dict, fusion_extra: list = None, cnn_probs: dict = None) -> tuple:
    """Return a normalized distribution over the five genuinely trained classes."""
    basis = {
        key: "trained_ml" if key in ML_CLASS_ORDER else "unsupported_no_training_data"
        for key in CLASS_KEYS
    }

    ml_source = None
    p_ml = None
    if cnn_probs is not None:
        p_ml = dict(cnn_probs)
        ml_source = "cnn"
    else:
        clf = None
        vec = None
        if fusion_extra is not None:
            fusion_clf = get_fusion_classifier()
            if fusion_clf is not None:
                clf = fusion_clf
                vec = np.asarray([feature_vector(f) + fusion_extra], dtype=np.float64)
                ml_source = "fusion"
        if clf is None:
            clf = get_classifier()
            if clf is not None:
                vec = np.asarray([feature_vector(f)], dtype=np.float64)
                ml_source = "classical"
        if clf is not None:
            p_ml = dict(zip(ML_CLASS_ORDER, clf.predict_proba(vec)[0]))

    if p_ml is None:
        raise ModelUnavailableError(
            "No verified trained image classifier is available"
        )
    missing = [key for key in ML_CLASS_ORDER if key not in p_ml]
    if missing:
        raise ModelUnavailableError(
            f"Classifier output is missing trained classes: {', '.join(missing)}"
        )
    total = sum(max(0.0, float(p_ml[key])) for key in ML_CLASS_ORDER)
    if total <= 0:
        raise ModelUnavailableError("Classifier returned an invalid probability distribution")
    probs = {
        key: max(0.0, float(p_ml[key])) / total
        for key in ML_CLASS_ORDER
    }
    return probs, basis, ml_source


def _quality_review(
    img: Image.Image,
    features: dict,
    *,
    source: str,
    top_confidence: float,
    margin: float,
) -> tuple[dict, list[str]]:
    """Transparent quality and confidence gates; these do not alter probabilities."""
    width, height = img.size
    leaf_signal = (
        features["green_frac"]
        + features["yellow_frac"]
        + features["brown_frac"]
        + features["necrosis_frac"]
    )
    reasons = []
    if min(width, height) < 128:
        reasons.append("image_too_small")
    if features["mean_val"] < 0.12:
        reasons.append("image_too_dark")
    elif features["mean_val"] > 0.95:
        reasons.append("image_overexposed")
    if features["texture_var"] < 0.00002:
        reasons.append("low_image_detail")
    if leaf_signal < 0.05:
        reasons.append("weak_leaf_signal")
    if source != "leaf":
        reasons.append("source_domain_mismatch")
    if top_confidence < AI_MIN_CONFIDENCE:
        reasons.append("low_confidence")
    if margin < AI_MIN_MARGIN:
        reasons.append("low_class_margin")
    if not AI_FIELD_VALIDATED:
        reasons.append("model_not_independently_field_validated")
    return {
        "width": width,
        "height": height,
        "brightness": round(float(features["mean_val"]), 4),
        "texture_variance": round(float(features["texture_var"]), 6),
        "leaf_signal": round(float(leaf_signal), 4),
        "min_confidence": AI_MIN_CONFIDENCE,
        "min_margin": AI_MIN_MARGIN,
        "field_validated": AI_FIELD_VALIDATED,
        "passed": not reasons,
    }, reasons


SYMPTOM_RULES = [
    ("mottle",           0.055, "Mosaic mottling / chlorotic patches", "ลายด่างเหลืองสลับเขียว"),
    ("brown_frac",       0.10,  "Brown streaking on tissue",           "รอยเส้นสีน้ำตาลบนใบ"),
    ("necrosis_frac",    0.06,  "Necrotic (dead) tissue",              "เนื้อเยื่อตายสีดำ/น้ำตาลเข้ม"),
    ("bright_spot_frac", 0.04,  "Angular water-soaked lesions",        "แผลฉ่ำน้ำเป็นเหลี่ยม"),
    ("yellow_frac",      0.14,  "Leaf chlorosis (yellowing)",          "อาการใบเหลือง"),
    ("edge_density",     0.28,  "Leaf deformation / crinkling",        "ใบผิดรูป/หงิกงอ"),
]


def _symptoms(f: dict) -> list:
    out = []
    for key, thr, en, th in SYMPTOM_RULES:
        v = f[key]
        if v >= thr:
            sev = "high" if v >= thr * 2 else "medium"
            out.append({"en": en, "th": th, "severity": sev,
                        "score": round(min(1.0, v / (thr * 2.5)), 2)})
    if not out:
        out.append({"en": "No significant lesions detected", "th": "ไม่พบรอยโรคเด่นชัด",
                    "severity": "info", "score": 0.1})
    return out[:5]


_FEATURE_LABELS = {
    "green_frac": "Green canopy fraction", "yellow_frac": "Leaf yellowing (chlorosis)",
    "brown_frac": "Brown tissue fraction", "necrosis_frac": "Necrotic (dead) tissue",
    "bright_spot_frac": "Bright/angular lesion spots", "pseudo_ndvi": "Vegetation index (pseudo-NDVI)",
    "edge_density": "Leaf edge/texture density", "texture_var": "Texture variance",
    "mottle": "Mosaic mottling", "streak": "Streak pattern",
    "mean_sat": "Colour saturation", "mean_val": "Brightness",
    # fusion-only features (satellite + soil) — only ever shown when fusion_used=True
    "ndvi": "Satellite NDVI", "ndwi": "Satellite NDMI (NIR/SWIR moisture index)",
    "savi": "Satellite SAVI (soil-adjusted)", "evi": "Satellite EVI",
    "ph": "Soil pH", "om_pct": "Soil organic matter %", "n_ppm": "Soil nitrogen (N)",
    "p_ppm": "Soil phosphorus (P)", "k_ppm": "Soil potassium (K)", "cec": "Soil CEC",
    "moisture_pct": "Soil moisture %",
}

# Coarse 3x3 semantic zone labels for the CNN's occlusion-sensitivity grid — the CNN
# has no hand-crafted feature vector at all (see _feature_importance's docstring), so
# instead of a named-feature breakdown it gets a real, per-image "which part of the
# photo mattered" breakdown, mapped from raw (row, col) grid cells down to a coarse
# human-readable region.
_REGION_NAMES = [
    ["Top-left", "Top-center", "Top-right"],
    ["Middle-left", "Center", "Middle-right"],
    ["Bottom-left", "Bottom-center", "Bottom-right"],
]


def _region_label(row: int, col: int, grid: int) -> str:
    zr = min(2, row * 3 // grid)
    zc = min(2, col * 3 // grid)
    return f"{_REGION_NAMES[zr][zc]} region"


_HEURISTIC_FEATURE_WEIGHTS = {
    "healthy":      [("Green canopy fraction", "green_frac", 1.0), ("Vegetation index", "pseudo_ndvi", 1.0), ("Low lesion area", "brown_frac", -1.0)],
    "cmd":          [("Mosaic mottling", "mottle", 1.0), ("Chlorosis", "yellow_frac", 1.0), ("Leaf texture", "edge_density", 1.0)],
    "cbsd":         [("Brown streaking", "streak", 1.0), ("Brown tissue", "brown_frac", 1.0), ("Chlorosis", "yellow_frac", 1.0)],
    "cbb":          [("Necrotic tissue", "necrosis_frac", 1.0), ("Angular lesions", "bright_spot_frac", 1.0), ("Brown margins", "brown_frac", 1.0)],
    "cgm":          [("Chlorotic stippling", "yellow_frac", 1.0), ("Fine pale spotting", "bright_spot_frac", 1.0), ("Leaf deformation", "edge_density", 1.0)],
    "cad":              [("Necrotic sunken spots", "necrosis_frac", 1.0), ("Pale lesion centres", "bright_spot_frac", 1.0), ("Discrete spot texture", "edge_density", 1.0)],
    "brown_leaf_spot":  [("Brown circular spots", "brown_frac", 1.0), ("Necrotic centres", "necrosis_frac", 1.0), ("Sharp spot edges", "edge_density", 1.0)],
    "white_leaf_spot":  [("White/pale sunken spots", "bright_spot_frac", 1.0), ("Discrete spot edges", "edge_density", 1.0), ("Fine speckled texture", "texture_var", 1.0)],
    "sed":              [("Necrotic shot-holes", "necrosis_frac", 1.0), ("Pale corky lesions", "bright_spot_frac", 1.0), ("Rough scab texture", "texture_var", 1.0)],
    "mealybug":         [("Waxy insect masses", "bright_spot_frac", 1.0), ("Chlorosis", "yellow_frac", 1.0), ("Dulled colour (wax/soot)", "mean_sat", -1.0)],
    "whitefly":         [("Sooty mould darkening", "mean_val", -1.0), ("Dulled colour (soot)", "mean_sat", -1.0), ("Feeding-site chlorosis", "yellow_frac", 1.0)],
    "water_stress": [("Low colour saturation", "mean_sat", -1.0), ("Wilting / low NDVI", "pseudo_ndvi", -1.0), ("Yellowing", "yellow_frac", 1.0)],
    "nutrient_def": [("Interveinal chlorosis", "yellow_frac", 1.0), ("Uniform pattern (low mottling)", "mottle", -1.0), ("Vegetation index", "pseudo_ndvi", -1.0)],
}


def _feature_importance(f: dict, top_key: str, basis: str, clf=None, feature_names=None,
                        vec: list = None, ml_source: str = None,
                        cnn_grid: np.ndarray = None) -> list:
    """For trained-ML classes: the classifier's real (global) feature_importances_,
    which is an honest measure of what the fitted model actually relies on overall —
    not a per-sample explanation (that would need SHAP, out of scope here), but a real
    number from the fitted model rather than a hand-typed constant. `clf`/`feature_names`
    let the caller pass the fusion classifier + FUSION_FEATURE_NAMES when fusion served
    this prediction (defaults to the image-only classifier + FEATURE_NAMES otherwise, so
    existing callers that don't pass these keep working unchanged).
    Some real trained models (SVM-RBF, HistGradientBoosting, logistic regression) don't
    expose feature_importances_ at all — falling through to the heuristic weights below
    for THOSE would silently show unrelated hand-picked text under a "trained_ml" label,
    which is exactly the fabricated-explanation pattern this app deliberately avoids
    elsewhere. When `vec` (this exact prediction's input vector) is given, those models
    instead get a real single-sample sensitivity: each feature is zeroed out of the
    actual input and the resulting drop in the top class's predicted probability — a
    live measurement from the fitted model on this input, not a lookup table.

    For CNN-served classes (`ml_source == "cnn"`): the CNN has no hand-crafted feature
    vector at all (it consumes raw 224x224x3 pixels), so neither feature_importances_
    nor the zero-out sensitivity technique above applies. Instead this returns a REAL
    per-image, per-region explanation derived from actual live model behaviour: the
    caller passes `cnn_grid`, the (grid,grid) occlusion-sensitivity array already
    computed once by _cnn_occlusion_grid() for the heatmap (predict_image() computes it
    once and reuses it here, avoiding a second expensive CNN inference pass), the top-5
    highest-sensitivity cells are mapped to a coarse 3x3 semantic zone label via
    _region_label(), and their normalized sensitivity values become "importance". This
    deliberately does NOT fall through to the heuristic weights below for the CNN case —
    that would silently show unrelated hand-picked text under a "trained_ml" label,
    exactly the fabricated-explanation bug found and fixed earlier this session for
    SVM/HistGradientBoosting models lacking feature_importances_ (see above).

    For heuristic-only classes (water_stress/nutrient_def, or no classifier loaded):
    the hand-picked weights that drove the rule-based score, as before.
    """
    if ml_source == "cnn":
        grid_size = cnn_grid.shape[0]
        flat = cnn_grid.flatten()
        top_idx = np.argsort(-flat)[:5]
        pairs = [(_region_label(*divmod(int(i), grid_size), grid_size), max(0.001, float(flat[i])))
                 for i in top_idx]
        total = sum(v for _, v in pairs)
        return [{"feature": label, "importance": round(v / total, 3)}
                for label, v in sorted(pairs, key=lambda x: -x[1])]

    if basis == "trained_ml":
        clf = clf if clf is not None else get_classifier()
        names = feature_names if feature_names is not None else FEATURE_NAMES
        if clf is not None and hasattr(clf, "feature_importances_"):
            pairs = sorted(zip(names, clf.feature_importances_), key=lambda x: -x[1])[:5]
            total = sum(max(0.001, float(v)) for _, v in pairs)
            return [{"feature": _FEATURE_LABELS.get(n, n), "importance": round(max(0.001, float(v)) / total, 3)}
                    for n, v in pairs]
        if clf is not None and vec is not None:
            cls_idx = ML_CLASS_ORDER.index(top_key)
            base_p = float(clf.predict_proba([vec])[0][cls_idx])
            batch = []
            for i in range(len(vec)):
                perturbed = list(vec)
                perturbed[i] = 0.0
                batch.append(perturbed)
            proba = clf.predict_proba(np.asarray(batch, dtype=np.float64))[:, cls_idx]
            drops = [max(0.001, base_p - float(p)) for p in proba]
            total = sum(drops)
            pairs = sorted(zip(names, drops), key=lambda x: -x[1])[:5]
            return [{"feature": _FEATURE_LABELS.get(n, n), "importance": round(v / total, 3)}
                    for n, v in pairs]

    weights = [(label, max(0.001, sign * f[key])) for label, key, sign in
               _HEURISTIC_FEATURE_WEIGHTS.get(top_key, _HEURISTIC_FEATURE_WEIGHTS["nutrient_def"])]
    total = sum(v for _, v in weights)
    return [{"feature": n, "importance": round(v / total, 3)}
            for n, v in sorted(weights, key=lambda x: -x[1])]


# --------------------------------------------------------------------------- #
# Attribution map: real occlusion sensitivity (ML classes) or feature-map     #
# visualisation (heuristic-only classes)                                     #
# --------------------------------------------------------------------------- #
def _heuristic_act_map(f: dict, top_key: str) -> np.ndarray:
    """Hand-crafted feature-map visualisation. Used for water_stress/nutrient_def
    (no trained model exists for those) and as the fallback for all classes before
    the classifier has been trained. NOT a model explanation — just a transparent
    view of the same pixel features that drove the rule-based score."""
    grad, hue, val, sat = f["_grad"], f["_hue"], f["_val"], f["_sat"]
    if top_key == "healthy":
        act = np.clip((hue > 0.18) & (hue < 0.45), 0, 1).astype(np.float32) * sat
    elif top_key == "cmd":
        gimg = np.asarray(Image.fromarray((val * 255).astype("uint8")).filter(ImageFilter.GaussianBlur(3)), np.float32) / 255
        act = np.abs(val - gimg) * 6 + 0.4 * ((hue > 0.10) & (hue <= 0.18))
    elif top_key == "cbsd":
        act = grad * ((hue < 0.12).astype(np.float32) + 0.3) * (val < 0.6)
    elif top_key == "cbb":
        act = (val < 0.28).astype(np.float32) * 1.2 + ((val > 0.82) & (sat < 0.25)).astype(np.float32)
    elif top_key == "cgm":
        act = ((val > 0.82) & (sat < 0.25)).astype(np.float32) * 1.3 + 0.5 * ((hue > 0.10) & (hue <= 0.20))
    elif top_key == "cad":
        act = ((val > 0.75) & (sat < 0.3)).astype(np.float32) * 1.3 + (val < 0.3).astype(np.float32) * 0.8
    elif top_key == "brown_leaf_spot":
        act = ((hue < 0.10) & (val > 0.25) & (val < 0.6)).astype(np.float32) * 1.2 + grad * 0.4
    elif top_key == "white_leaf_spot":
        act = ((val > 0.8) & (sat < 0.3)).astype(np.float32) * 1.4 + grad * 0.5
    elif top_key == "sed":
        act = ((val > 0.75) & (sat < 0.3)).astype(np.float32) * 1.0 + (val < 0.3).astype(np.float32) * 0.9 + grad * 0.5
    elif top_key == "mealybug":
        act = ((val > 0.8) & (sat < 0.3)).astype(np.float32) * 1.3 + 0.5 * ((hue > 0.10) & (hue <= 0.20))
    elif top_key == "whitefly":
        act = (0.4 - val).clip(0) * 2.5 * (sat < 0.35).astype(np.float32) + 0.3 * ((hue > 0.10) & (hue <= 0.20))
    elif top_key == "water_stress":
        act = (0.4 - sat).clip(0) * 2 + 0.6 * ((hue > 0.10) & (hue <= 0.18))
    else:  # nutrient_def
        act = ((hue > 0.10) & (hue < 0.20) & (sat > 0.2)).astype(np.float32) + 0.3 * val
    return np.clip(act, 0, act.max() + 1e-6) / (act.max() + 1e-6)


def _occlusion_sensitivity(img: Image.Image, top_key: str, base_prob: float,
                           target_shape: tuple, grid: int = 8, clf=None,
                           extra_features: list = None) -> np.ndarray:
    """Genuine occlusion-sensitivity map from the trained classifier: mask each grid
    cell with the image's mean colour, recompute the model's probability for top_key,
    and record the confidence drop. Cells whose removal drops confidence the most are
    the ones the model actually relied on — a real, model-grounded explanation
    (computed by perturbation, since there's no CNN here to backprop gradients
    through). Runs on a small 96x96 working copy for speed, and batches all grid
    cells into a single predict_proba() call — sklearn's per-call overhead (~15ms,
    dominated by tree-traversal dispatch) is nearly fixed-cost regardless of batch
    size, so calling it once for 64 rows instead of 64 times for 1 row each is
    roughly 50x faster with an identical result.

    `clf` defaults to the image-only classifier when not given (unchanged behaviour
    for existing callers). `extra_features` (the satellite+soil portion of a
    fusion vector) is appended UNCHANGED to every occluded cell's image features when
    given — masking the photo only perturbs what the photo itself contributes, so the
    satellite/soil numbers for the field stay fixed across all 64 cells, exactly as
    they should (occlusion tests "what part of the PHOTO mattered", not the field's
    real-world satellite/soil readings).
    """
    clf = clf if clf is not None else get_classifier()
    work_size = 96
    work = img.resize((work_size, work_size))
    arr = np.asarray(work, dtype=np.uint8)
    mean_color = arr.reshape(-1, 3).mean(0).astype(np.uint8)
    cell = work_size // grid
    cls_idx = ML_CLASS_ORDER.index(top_key)

    batch = []
    for gy in range(grid):
        for gx in range(grid):
            occluded = arr.copy()
            y0, y1 = gy * cell, work_size if gy == grid - 1 else (gy + 1) * cell
            x0, x1 = gx * cell, work_size if gx == grid - 1 else (gx + 1) * cell
            occluded[y0:y1, x0:x1] = mean_color
            feats_occ = extract_features(Image.fromarray(occluded))
            vec = feature_vector(feats_occ)
            if extra_features is not None:
                vec = vec + extra_features
            batch.append(vec)

    proba = clf.predict_proba(np.asarray(batch, dtype=np.float64))[:, cls_idx]
    sens = np.maximum(0.0, base_prob - proba).reshape(grid, grid).astype(np.float32)

    if sens.max() > 1e-9:
        sens = sens / sens.max()
    h, w = target_shape
    sens_img = Image.fromarray((sens * 255).astype("uint8")).resize((w, h), Image.BILINEAR)
    return np.asarray(sens_img, dtype=np.float32) / 255.0


def _cnn_occlusion_grid(img: Image.Image, top_key: str, base_prob: float, grid: int = 8) -> np.ndarray:
    """Same 8x8 mean-colour grid-masking occlusion-sensitivity technique as
    _occlusion_sensitivity() above (see that function's docstring for the general
    idea), but for the CNN: each occluded crop is run through the real ONNX model via
    cnn_predict_proba_batch() — ONE batched session.run() call for all 64 cells, not 64
    separate calls, the same batching discipline as the classical path above — instead
    of extract_features()+clf.predict_proba(), since the CNN consumes raw pixels, not
    the 12-dim hand-crafted feature vector. Returns the RAW (grid, grid) sensitivity
    array (NOT yet resized/normalized to the source image's shape — callers needing an
    image-shaped heatmap resize+normalize it themselves; callers needing per-region
    feature-importance labels use the raw grid values/coordinates directly)."""
    work_size = 96
    work = img.resize((work_size, work_size))
    arr = np.asarray(work, dtype=np.uint8)
    mean_color = arr.reshape(-1, 3).mean(0).astype(np.uint8)
    cell = work_size // grid

    crops = []
    for gy in range(grid):
        for gx in range(grid):
            occluded = arr.copy()
            y0, y1 = gy * cell, work_size if gy == grid - 1 else (gy + 1) * cell
            x0, x1 = gx * cell, work_size if gx == grid - 1 else (gx + 1) * cell
            occluded[y0:y1, x0:x1] = mean_color
            crops.append(Image.fromarray(occluded))

    proba = cnn_predict_proba_batch(crops)
    meta = get_cnn_metrics()
    col_idx = meta["classes"].index(top_key)
    occluded_prob = proba[:, col_idx]
    sens = np.maximum(0.0, base_prob - occluded_prob).reshape(grid, grid).astype(np.float32)
    return sens


def _heatmap(img: Image.Image, f: dict, top_key: str, basis: str, top_conf: float,
            clf=None, extra_features: list = None, ml_source: str = None,
            cnn_grid: np.ndarray = None) -> str:
    """Render a colourised attribution overlay for the predicted class. `clf`/
    `extra_features` let the caller route occlusion sensitivity through the fusion
    classifier (see _occlusion_sensitivity) when fusion served this prediction.
    `ml_source`/`cnn_grid` let the caller route it through the CNN's occlusion grid
    (see _cnn_occlusion_grid) when the CNN served this prediction — `cnn_grid` is the
    already-computed (grid,grid) sensitivity array (predict_image() computes it once
    and reuses it for both this heatmap and _feature_importance(), avoiding a second
    expensive CNN inference pass); computed here as a fallback if not given."""
    h, w = f["_shape"]

    if ml_source == "cnn":
        grid_arr = cnn_grid if cnn_grid is not None else _cnn_occlusion_grid(img, top_key, top_conf)
        if grid_arr.max() > 1e-9:
            grid_arr = grid_arr / grid_arr.max()
        sens_img = Image.fromarray((grid_arr * 255).astype("uint8")).resize((w, h), Image.BILINEAR)
        act = np.asarray(sens_img, dtype=np.float32) / 255.0
    elif basis == "trained_ml":
        act = _occlusion_sensitivity(img, top_key, top_conf, f["_shape"], clf=clf, extra_features=extra_features)
    else:
        act = _heuristic_act_map(f, top_key)
        act = np.asarray(Image.fromarray((act * 255).astype("uint8")), np.float32) / 255

    act = np.asarray(Image.fromarray((act * 255).astype("uint8")).filter(ImageFilter.GaussianBlur(6)), np.float32) / 255
    act = act ** 0.8

    base = np.asarray(img.convert("RGB"), dtype=np.float32)
    # jet-ish colormap
    cmap = np.zeros((h, w, 3), np.float32)
    cmap[..., 0] = np.clip(1.5 - np.abs(act - 0.75) * 4, 0, 1) * 255  # R
    cmap[..., 1] = np.clip(1.5 - np.abs(act - 0.5) * 4, 0, 1) * 255   # G
    cmap[..., 2] = np.clip(1.5 - np.abs(act - 0.25) * 4, 0, 1) * 255  # B
    alpha = (act[..., None] * 0.6)
    out = (base * (1 - alpha) + cmap * alpha).clip(0, 255).astype("uint8")

    buf = io.BytesIO()
    Image.fromarray(out).save(buf, format="PNG")
    return "data:image/png;base64," + base64.b64encode(buf.getvalue()).decode()


def _explanation(top_key: str, conf: float, symptoms: list, basis: str, fusion_used: bool = False,
                 cnn_used: bool = False) -> tuple:
    label = next(c for c in CLASSES if c["key"] == top_key)
    sym_en = ", ".join(s["en"] for s in symptoms if s["severity"] != "info")[:180] or "no dominant lesions"
    sym_th = ", ".join(s["th"] for s in symptoms if s["severity"] != "info")[:180] or "ไม่พบรอยโรคเด่น"
    if basis == "trained_ml" and cnn_used:
        method_en = ("a deep convolutional neural network (EfficientNet-B0) trained on real leaf "
                     "photographs, analyzing the raw image directly")
        method_th = "โครงข่ายประสาทเทียมเชิงลึก EfficientNet-B0 ที่เทรนจากภาพใบจริง วิเคราะห์จากพิกเซลภาพโดยตรง"
    elif basis == "trained_ml" and fusion_used:
        context_en = "live" if ENVIRONMENTAL_DATA_MODE == "live" else "synthetic"
        context_th = "จริง" if ENVIRONMENTAL_DATA_MODE == "live" else "จำลอง"
        method_en = f"a classifier trained on real leaf photographs plus this field's {context_en} satellite and soil context"
        method_th = f"แบบจำลองที่เทรนจากภาพใบจริง ร่วมกับบริบทดาวเทียมและดิน{context_th}ของแปลงนี้"
    elif basis == "trained_ml":
        method_en = "a classifier trained on real, labelled cassava leaf photographs"
        method_th = "แบบจำลองที่เทรนจากภาพใบมันสำปะหลังจริงที่มีป้ายกำกับ"
    else:
        method_en = "rule-based visual heuristics (no labelled dataset exists yet for this condition)"
        method_th = "กฎการประเมินเชิงภาพ (ยังไม่มีชุดข้อมูลจริงสำหรับภาวะนี้)"
    en = (f"Classified as {label['en']} with {conf*100:.1f}% confidence, using {method_en}. "
          f"Visual evidence: {sym_en}. The highlighted map shows the image regions that "
          f"most influenced this result.")
    th = (f"วินิจฉัยเป็น “{label['th']}” ด้วยความมั่นใจ {conf*100:.1f}% โดยใช้{method_th} "
          f"หลักฐานทางภาพ: {sym_th} แผนที่ที่ไฮไลต์แสดงบริเวณที่มีผลต่อผลลัพธ์นี้มากที่สุด")
    return en, th


def predict_image(image_bytes: bytes, source: str = "leaf", field=None) -> dict:
    """`field` (a Field ORM row, or None) is optional — when given AND a trained fusion
    classifier exists (and the CNN isn't already serving this prediction — see below),
    the 5 ML-backed classes are served by the fusion (image+satellite+soil) model using
    this field's configured satellite/soil context instead of the image-only model; otherwise
    this behaves exactly as it did before fusion existed. See _score()'s docstring for
    the exact 3-way (cnn / fusion / classical) priority.

    When backend.config.USE_CNN is True AND a trained CNN model exists (see
    backend.services.cnn_classifier.get_cnn_session()), the CNN preempts fusion
    entirely — fusion_extra is never even computed in that case, since it would be
    thrown away (no need to hit satellite_engine/soil_engine for a prediction the CNN
    is about to serve)."""
    t0 = time.perf_counter()
    full_resolution_img = _load_full_resolution(image_bytes)
    # Decode the upload once. The classifier still receives the exact same Pillow
    # thumbnail contract as load_image(), while the tiny-object detector retains
    # the original pixels. Reopening the same compressed upload here used to pay a
    # second decode on every request without changing either model input.
    img = full_resolution_img.copy()
    img.thumbnail((TARGET_SIZE, TARGET_SIZE))
    feats = extract_features(img)

    cnn_probs = None
    if USE_CNN and get_cnn_session() is not None:
        cnn_probs = cnn_predict_proba(img)

    fusion_extra = None
    if (cnn_probs is None and USE_FUSION and field is not None
            and get_fusion_classifier() is not None):
        fusion_extra = _fusion_extra_features(field)

    probs, basis, ml_source = _score(feats, fusion_extra=fusion_extra, cnn_probs=cnn_probs)
    auxiliary_findings = []
    auxiliary_supported_classes = []
    if cnn_probs is not None and get_brown_spot_classifier() is not None:
        brown_metrics = get_brown_spot_metrics()
        brown_probability = brown_spot_predict_probability(feats, cnn_probs)
        brown_threshold = float(brown_metrics["threshold"])
        auxiliary_supported_classes.append("brown_leaf_spot")
        basis["brown_leaf_spot"] = "trained_auxiliary_model"
        auxiliary_findings.append({
            "key": "brown_leaf_spot",
            "en": "Cassava Brown Leaf Spot",
            "th": "โรคใบจุดสีน้ำตาล",
            "probability": round(brown_probability, 4),
            "threshold": round(brown_threshold, 4),
            "detected": bool(brown_probability >= brown_threshold),
            "requires_review": True,
            "model": {
                "id": brown_metrics["model_id"],
                "version": brown_metrics["trained_at"][:10],
                "test_macro_f1": brown_metrics["test"]["macro_f1"],
                "field_validated": brown_metrics["field_validated"],
            },
        })
    if cnn_probs is not None and get_white_leaf_spot_classifier() is not None:
        white_metrics = get_white_leaf_spot_metrics()
        white_probability = white_leaf_spot_predict_probability(feats, cnn_probs)
        white_threshold = float(white_metrics["threshold"])
        auxiliary_supported_classes.append("white_leaf_spot")
        basis["white_leaf_spot"] = "experimental_trained_auxiliary_model"
        auxiliary_findings.append({
            "key": "white_leaf_spot",
            "en": "Cassava White Leaf Spot",
            "th": "โรคใบจุดขาว",
            "probability": round(white_probability, 4),
            "threshold": round(white_threshold, 4),
            "detected": bool(white_probability >= white_threshold),
            "requires_review": True,
            "experimental": True,
            "model": {
                "id": white_metrics["model_id"],
                "version": white_metrics["trained_at"][:10],
                "test_macro_f1": white_metrics["test"]["macro_f1"],
                "field_validated": white_metrics["field_validated"],
                "production_eligible": white_metrics["production_eligible"],
            },
        })
    if get_whitefly_session() is not None:
      try:
        whitefly_metrics = get_whitefly_metrics()
        whitefly_result = detect_whiteflies(full_resolution_img)
        whitefly_detections = whitefly_result["detections"]
        whitefly_probability = max(
            (row["confidence"] for row in whitefly_detections),
            default=0.0,
        )
        whitefly_test = whitefly_metrics["test"]
        test_evaluated = whitefly_test.get("evaluated") is not False
        evaluation = (
            whitefly_test if test_evaluated
            else whitefly_metrics["validation_operating_point"]
        )
        auxiliary_supported_classes.append("whitefly")
        basis["whitefly"] = "experimental_object_detector"
        auxiliary_findings.append({
            "key": "whitefly",
            "en": "Cassava Whitefly",
            "th": "แมลงหวี่ขาวมันสำปะหลัง",
            "probability": round(whitefly_probability, 4),
            "threshold": round(float(whitefly_result["threshold"]), 4),
            "detected": bool(whitefly_result["count"] > 0),
            "count": whitefly_result["count"],
            "detections": whitefly_detections,
            "image_size": whitefly_result["image_size"],
            "truncated": whitefly_result["truncated"],
            "tiled": whitefly_result["tiled"],
            "tile_count": whitefly_result["tile_count"],
            "source_tile_size": whitefly_result["source_tile_size"],
            "candidate_count": whitefly_result["candidate_count"],
            "detection_capacity": whitefly_result["detection_capacity"],
            "requires_review": True,
            "experimental": True,
            "model": {
                "id": whitefly_metrics["model_id"],
                "version": whitefly_metrics["trained_at"][:10],
                "evaluation_set": "test" if test_evaluated else "validation",
                "test_map50": whitefly_test.get("metrics/mAP50(B)"),
                "test_map50_95": whitefly_test.get("metrics/mAP50-95(B)"),
                "test_recall": whitefly_test.get("metrics/recall(B)"),
                "validation_precision": evaluation.get("precision"),
                "validation_recall": evaluation.get("recall"),
                "validation_f1": evaluation.get("f1"),
                "field_validated": bool(
                    whitefly_metrics.get("field_validated", False)
                ),
                "production_eligible": bool(
                    whitefly_metrics.get("production_eligible", False)
                ),
                "evaluation_warning": whitefly_metrics.get("evaluation_warning"),
            },
        })
      except Exception as exc:
        # Whitefly is an auxiliary review-only detector. Its artifact/runtime
        # failure must not discard the primary cassava-disease diagnosis.
        print(f"[ai_engine] Whitefly auxiliary inference skipped: {exc}")
    ranked = sorted(probs.items(), key=lambda x: -x[1])
    top_key, top_conf = ranked[0]
    margin = top_conf - ranked[1][1] if len(ranked) > 1 else top_conf
    symptoms = _symptoms(feats)

    fusion_used = ml_source == "fusion"
    cnn_used = ml_source == "cnn"

    cnn_grid = None
    if cnn_used:
        cnn_grid = _cnn_occlusion_grid(img, top_key, top_conf)
        heatmap = _heatmap(img, feats, top_key, basis[top_key], top_conf,
                           ml_source="cnn", cnn_grid=cnn_grid)
    else:
        heatmap_clf = get_fusion_classifier() if fusion_used else None
        heatmap = _heatmap(img, feats, top_key, basis[top_key], top_conf,
                           clf=heatmap_clf, extra_features=fusion_extra if fusion_used else None,
                           ml_source=ml_source)
    en, th = _explanation(top_key, top_conf, symptoms, basis[top_key],
                          fusion_used=fusion_used, cnn_used=cnn_used)
    infer_ms = round((time.perf_counter() - t0) * 1000, 1)  # real measured latency, no padding

    clean_feats = {k: round(v, 4) for k, v in feats.items() if not k.startswith("_")}
    label_map = {c["key"]: c for c in CLASSES}
    quality, review_reasons = _quality_review(
        img,
        feats,
        source=source,
        top_confidence=top_conf,
        margin=margin,
    )
    if fusion_used and ENVIRONMENTAL_DATA_MODE != "live":
        review_reasons.append("synthetic_environmental_context")
    if any(item["detected"] for item in auxiliary_findings):
        review_reasons.append("auxiliary_finding_requires_expert_review")

    if cnn_used:
        cnn_meta = get_cnn_metrics()
        model_info = {"id": cnn_meta["model_id"], "name": cnn_meta["architecture"],
                     "version": cnn_meta["trained_at"][:10]}
        importance = _feature_importance(feats, top_key, basis[top_key],
                                         ml_source="cnn", cnn_grid=cnn_grid)
    elif fusion_used:
        fusion_meta = get_fusion_metrics()
        active_fusion_id = fusion_meta["active_model_id"]
        model_info = {"id": f"fusion_{active_fusion_id}",
                     "name": f"Fusion {fusion_meta['fusion'][active_fusion_id]['name']}",
                     "version": fusion_meta["trained_at"][:10]}
        importance = _feature_importance(feats, top_key, basis[top_key], clf=heatmap_clf,
                                         feature_names=FUSION_FEATURE_NAMES,
                                         vec=feature_vector(feats) + fusion_extra)
    elif ml_source == "classical":
        model_info = {"id": ACTIVE_MODEL["id"], "name": ACTIVE_MODEL["name"], "version": ACTIVE_MODEL["version"]}
        importance = _feature_importance(feats, top_key, basis[top_key],
                                         vec=feature_vector(feats))
    else:
        model_info = {"id": "heuristic_rules_v1", "name": "Heuristic rules fallback",
                      "version": "1"}
        importance = _feature_importance(feats, top_key, "heuristic")

    return {
        "source": source,
        "top3": [{"key": k, "en": label_map[k]["en"], "th": label_map[k]["th"],
                  "confidence": round(p, 4)} for k, p in ranked[:3]],
        "probs": {k: round(v, 4) for k, v in probs.items()},
        "top_class": top_key,
        "confidence": round(top_conf, 4),
        "confidence_margin": round(margin, 4),
        "model_basis": basis,  # transparency: which mechanism produced each class's score
        "requires_review": bool(review_reasons),
        "review_reasons": review_reasons,
        "decision": "review_required" if review_reasons else "model_prediction",
        "quality": quality,
        "supported_classes": list(ML_CLASS_ORDER),
        "auxiliary_supported_classes": auxiliary_supported_classes,
        "auxiliary_findings": auxiliary_findings,
        "unsupported_classes": [
            key for key in CLASS_KEYS
            if key not in ML_CLASS_ORDER and key not in auxiliary_supported_classes
        ],
        "environmental_data_mode": ENVIRONMENTAL_DATA_MODE,
        "fusion_used": fusion_used,  # transparency: image-only vs image+satellite+soil
        "cnn_used": cnn_used,  # transparency: raw-pixel CNN vs classical/fusion feature-vector model
        "symptoms": symptoms,
        "feature_importance": importance,
        "raw_features": clean_feats,
        "explanation_en": en,
        "explanation_th": th,
        "heatmap": heatmap,
        "inference_ms": infer_ms,
        "model": model_info,
        "created_at": dt.datetime.now(dt.UTC).isoformat(),
    }


def predict_csv(rows: list) -> dict:
    """Tabular path: aggregate sensor rows (temp,humidity,soil_moisture,ndvi,...) into risk."""
    if not rows:
        return {"error": "empty csv"}
    def col(name, default=0.0):
        vals = []
        for row in rows:
            if name not in row or row[name] in ("", None):
                continue
            try:
                vals.append(float(row[name]))
            except (TypeError, ValueError):
                continue
        return sum(vals) / len(vals) if vals else default
    ndvi = col("ndvi", 0.6); moisture = col("soil_moisture", 22)
    temp = col("temp", 30); humidity = col("humidity", 65)
    probs = {k: 0.0 for k in CLASS_KEYS}
    probs["water_stress"] = max(0, (18 - moisture) / 18) + max(0, (temp - 34) / 10)
    probs["nutrient_def"] = max(0, (0.55 - ndvi) / 0.55)
    probs["healthy"] = max(0.05, ndvi - 0.2)
    probs["cbb"] = max(0, (humidity - 80) / 40)
    tot = sum(probs.values()) + 1e-6
    probs = {k: round(v / tot, 4) for k, v in probs.items()}
    ranked = sorted(probs.items(), key=lambda x: -x[1])
    label_map = {c["key"]: c for c in CLASSES}
    return {
        "source": "csv", "rows": len(rows),
        "top3": [{"key": k, "en": label_map[k]["en"], "th": label_map[k]["th"], "confidence": p} for k, p in ranked[:3]],
        "probs": probs, "top_class": ranked[0][0], "confidence": ranked[0][1],
        "model_basis": {key: "sensor_rules" for key in CLASS_KEYS},
        "requires_review": True,
        "review_reasons": ["sensor_rules"],
        "environmental_data_mode": ENVIRONMENTAL_DATA_MODE,
        "model": {"id": "sensor_rules_v1", "name": "Sensor rule engine", "version": "1.0"},
        "aggregates": {"ndvi": round(ndvi, 3), "soil_moisture": round(moisture, 1),
                       "temp": round(temp, 1), "humidity": round(humidity, 1)},
        "created_at": dt.datetime.now(dt.UTC).isoformat(),
    }
