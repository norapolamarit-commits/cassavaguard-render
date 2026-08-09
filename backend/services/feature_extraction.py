"""Shared image feature extraction — used identically by the training script
(backend/training/train_classifier.py) and the runtime inference engine
(backend/services/ai_engine.py), so the model always sees the same features
it was trained on (no train/serve skew).
"""
import numpy as np
from PIL import Image, ImageFilter

TARGET_SIZE = 256

# Canonical, ordered list of the numeric features fed to the trained classifier.
# Order matters: the model's feature vector at inference time must match this
# exactly, and in the same order as when the training script built its matrix.
FEATURE_NAMES = [
    "green_frac", "yellow_frac", "brown_frac", "necrosis_frac", "bright_spot_frac",
    "pseudo_ndvi", "edge_density", "texture_var", "mottle", "streak",
    "mean_sat", "mean_val",
]

# The 5 classes with a real, labelled public dataset (TFDS 'cassava' has all 5:
# cbb/cbsd/cgm/cmd/healthy — map 1:1 onto these, no relabelling needed). water_stress/
# nutrient_def have no matching labelled image dataset here, so they are excluded from
# diagnostic probabilities. This exact order is the label encoding both the training
# script and runtime classifier loader must agree on.
ML_CLASS_ORDER = ["healthy", "cbb", "cbsd", "cmd", "cgm"]

# Fusion (image+satellite+soil) feature names — single source of truth shared by
# backend/training/train_fusion_classifier.py and backend/services/ai_engine.py, same
# train/serve-parity reasoning as FEATURE_NAMES above. satellite_engine.indices_on()
# and soil_engine.profile()["metrics"] are the real functions these come from (see
# each service for the formulas) — never duplicate this list elsewhere.
SATELLITE_FEATURE_NAMES = ["ndvi", "ndwi", "savi", "evi"]
SOIL_FEATURE_NAMES = ["ph", "om_pct", "n_ppm", "p_ppm", "k_ppm", "cec", "moisture_pct"]
FUSION_FEATURE_NAMES = FEATURE_NAMES + SATELLITE_FEATURE_NAMES + SOIL_FEATURE_NAMES


def load_image(image_bytes: bytes) -> Image.Image:
    img = Image.open(__import__("io").BytesIO(image_bytes)).convert("RGB")
    img.thumbnail((TARGET_SIZE, TARGET_SIZE))
    return img


def extract_features(img: Image.Image) -> dict:
    """Compute colour/texture/lesion features from a leaf image.

    Returns a dict with the FEATURE_NAMES keys (float, model-ready) plus a
    few underscore-prefixed raw arrays (_grad/_hue/_val/_sat/_shape) kept
    around for building the occlusion-sensitivity visualisation — those are
    NOT part of the model's feature vector.
    """
    arr = np.asarray(img, dtype=np.float32) / 255.0
    r, g, b = arr[..., 0], arr[..., 1], arr[..., 2]
    h, w = r.shape

    # HSV per-pixel
    mx = arr.max(-1); mn = arr.min(-1); diff = mx - mn + 1e-6
    val = mx
    sat = diff / (mx + 1e-6)
    mask = diff > 1e-6
    rc = (mx - r) / diff; gc = (mx - g) / diff; bc = (mx - b) / diff
    hue = np.where(mx == r, bc - gc, np.where(mx == g, 2 + rc - bc, 4 + gc - rc))
    hue = (hue / 6.0) % 1.0
    hue = np.where(mask, hue, 0)

    # vegetation-ish masks (hue is 0..1; green ~0.20-0.45, yellow ~0.10-0.20, brown low-sat warm)
    green = ((hue > 0.18) & (hue < 0.45) & (sat > 0.18)).mean()
    yellow = ((hue > 0.10) & (hue <= 0.18) & (sat > 0.25)).mean()
    brown = ((hue < 0.10) & (val < 0.55) & (sat > 0.12)).mean()
    dark_necrosis = (val < 0.28).mean()
    bright_spot = ((val > 0.82) & (sat < 0.25)).mean()

    # pseudo-NDVI from visible bands (green-red contrast proxy)
    vndvi = float(((g - r) / (g + r + 1e-6)).mean())

    # texture via Sobel-like gradient magnitude on grayscale
    gray = (0.299 * r + 0.587 * g + 0.114 * b)
    gy, gx = np.gradient(gray)
    grad = np.sqrt(gx ** 2 + gy ** 2)
    edge_density = float((grad > 0.12).mean())
    texture_var = float(grad.var())

    # mottling / mosaic: local variance of hue (CMD signature)
    gimg = Image.fromarray((gray * 255).astype("uint8"))
    blur = np.asarray(gimg.filter(ImageFilter.GaussianBlur(3)), dtype=np.float32) / 255.0
    mottle = float(np.abs(gray - blur).mean())

    # vein/streak proxy: strong vertical-ish gradients (CBSD brown streak)
    streak = float((np.abs(gx) > np.abs(gy) * 1.6).mean() * (brown + 0.05))

    return {
        "green_frac": float(green), "yellow_frac": float(yellow),
        "brown_frac": float(brown), "necrosis_frac": float(dark_necrosis),
        "bright_spot_frac": float(bright_spot), "pseudo_ndvi": vndvi,
        "edge_density": edge_density, "texture_var": texture_var,
        "mottle": mottle, "streak": streak,
        "mean_sat": float(sat.mean()), "mean_val": float(val.mean()),
        "_grad": grad, "_hue": hue, "_val": val, "_sat": sat,
        "_shape": (h, w),
    }


def feature_vector(feats: dict) -> list:
    """Extract the ordered numeric feature vector (FEATURE_NAMES order) for the classifier."""
    return [feats[name] for name in FEATURE_NAMES]
