"""CassavaGuard AI — central configuration."""
import json
import hashlib
import os
import sys
from pathlib import Path

if sys.version_info < (3, 11):
    raise RuntimeError(
        "CassavaGuard requires Python 3.11 or newer. "
        f"Current interpreter: {sys.version.split()[0]}"
    )

BASE_DIR = Path(__file__).resolve().parent.parent

try:
    from dotenv import load_dotenv

    load_dotenv(BASE_DIR / ".env")
except ImportError:
    pass


def _env_bool(name: str, default: bool = False) -> bool:
    value = os.environ.get(name)
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


def _env_list(name: str, default: str = "") -> list[str]:
    return [item.strip() for item in os.environ.get(name, default).split(",") if item.strip()]


APP_ENV = os.environ.get("APP_ENV", "development").strip().lower()
if APP_ENV not in {"development", "test", "production"}:
    raise RuntimeError("APP_ENV must be one of: development, test, production.")
IS_PRODUCTION = APP_ENV == "production"
ENVIRONMENTAL_DATA_MODE = os.environ.get(
    "ENVIRONMENTAL_DATA_MODE",
    "synthetic" if APP_ENV == "test" else "live",
).strip().lower()
if ENVIRONMENTAL_DATA_MODE not in {"live", "synthetic"}:
    raise RuntimeError("ENVIRONMENTAL_DATA_MODE must be either live or synthetic.")
ENABLE_API_DOCS = _env_bool("ENABLE_API_DOCS", default=not IS_PRODUCTION)

# DATA_DIR is where the DB and uploaded images/heatmaps actually live — separate from
# BASE_DIR (the code) so a host with an ephemeral app filesystem (e.g. Render's default
# web-service disk, wiped on every deploy/restart) can point this at a mounted
# persistent volume via the DATA_DIR env var (e.g. DATA_DIR=/var/data) without touching
# any other path in this file. Defaults to BASE_DIR, i.e. unchanged local-dev behaviour
# when DATA_DIR isn't set.
DATA_DIR = Path(os.environ.get("DATA_DIR", str(BASE_DIR)))
DATABASE_DIR = DATA_DIR / "database"
UPLOAD_DIR = DATA_DIR / "uploads"
FRONTEND_DIR = BASE_DIR / "frontend"
HEATMAP_DIR = UPLOAD_DIR / "heatmaps"
ML_MODELS_DIR = BASE_DIR / "backend" / "ml_models"

DATABASE_URL = os.environ.get("DATABASE_URL", f"sqlite:///{DATABASE_DIR / 'cassavaguard.db'}")
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)
if DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+psycopg://", 1)

# Auth
AUTH_REQUIRED = _env_bool("AUTH_REQUIRED", default=False)
_DEV_SECRET = "cassavaguard-dev-secret-change-in-production"
SECRET_KEY = os.environ.get("SECRET_KEY", _DEV_SECRET)
if IS_PRODUCTION and (SECRET_KEY == _DEV_SECRET or len(SECRET_KEY.encode()) < 32):
    raise RuntimeError("Production requires SECRET_KEY with at least 32 bytes.")
if not IS_PRODUCTION and SECRET_KEY == _DEV_SECRET:
    print("[config] WARNING: SECRET_KEY is not set — using the built-in dev fallback. "
          "Set a unique value before sharing this instance.")
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.environ.get("ACCESS_TOKEN_EXPIRE_MINUTES", "480"))
RESET_TOKEN_EXPIRE_MINUTES = int(os.environ.get("RESET_TOKEN_EXPIRE_MINUTES", "30"))
ASSET_TOKEN_EXPIRE_MINUTES = int(os.environ.get("ASSET_TOKEN_EXPIRE_MINUTES", "10"))

# Deployment behaviour
SEED_DEMO_DATA = _env_bool(
    "SEED_DEMO_DATA",
    default=not IS_PRODUCTION and ENVIRONMENTAL_DATA_MODE == "synthetic",
)
EXPOSE_RESET_TOKEN = _env_bool("EXPOSE_RESET_TOKEN", default=not IS_PRODUCTION)
BOOTSTRAP_ADMIN_EMAIL = os.environ.get("BOOTSTRAP_ADMIN_EMAIL", "").strip().lower()
BOOTSTRAP_ADMIN_PASSWORD = os.environ.get("BOOTSTRAP_ADMIN_PASSWORD", "")
if IS_PRODUCTION and bool(BOOTSTRAP_ADMIN_EMAIL) != bool(BOOTSTRAP_ADMIN_PASSWORD):
    raise RuntimeError(
        "Set both BOOTSTRAP_ADMIN_EMAIL and BOOTSTRAP_ADMIN_PASSWORD, or neither."
    )
if IS_PRODUCTION and BOOTSTRAP_ADMIN_PASSWORD and len(BOOTSTRAP_ADMIN_PASSWORD) < 10:
    raise RuntimeError("BOOTSTRAP_ADMIN_PASSWORD must be at least 10 characters.")
_RENDER_HOST = os.environ.get("RENDER_EXTERNAL_HOSTNAME", "").strip()
PUBLIC_BASE_URL = os.environ.get(
    "PUBLIC_BASE_URL",
    f"https://{_RENDER_HOST}" if _RENDER_HOST else "http://127.0.0.1:8800",
).rstrip("/")

# Optional SMTP password-reset delivery. In production, configure all required
# values; development may expose the token directly when EXPOSE_RESET_TOKEN=true.
SMTP_HOST = os.environ.get("SMTP_HOST", "")
SMTP_PORT = int(os.environ.get("SMTP_PORT", "587"))
SMTP_USERNAME = os.environ.get("SMTP_USERNAME", "")
SMTP_PASSWORD = os.environ.get("SMTP_PASSWORD", "")
SMTP_FROM = os.environ.get("SMTP_FROM", "")
SMTP_USE_TLS = _env_bool("SMTP_USE_TLS", default=True)

# Browser/API security
_DEV_ORIGINS = "http://127.0.0.1:8800,http://localhost:8800"
CORS_ORIGINS = _env_list("CORS_ORIGINS", "" if IS_PRODUCTION else _DEV_ORIGINS)
if IS_PRODUCTION and "*" in CORS_ORIGINS:
    raise RuntimeError("Production CORS_ORIGINS must list explicit origins, not '*'.")
TRUST_PROXY_HEADERS = _env_bool("TRUST_PROXY_HEADERS", default=IS_PRODUCTION)

# Upload limits are enforced before image decoding or CSV parsing.
MAX_IMAGE_UPLOAD_BYTES = int(os.environ.get("MAX_IMAGE_UPLOAD_BYTES", str(10 * 1024 * 1024)))
MAX_CSV_UPLOAD_BYTES = int(os.environ.get("MAX_CSV_UPLOAD_BYTES", str(2 * 1024 * 1024)))
MAX_IMAGE_PIXELS = int(os.environ.get("MAX_IMAGE_PIXELS", "25000000"))
MAX_CSV_ROWS = int(os.environ.get("MAX_CSV_ROWS", "10000"))
LOG_RETENTION_ROWS = int(os.environ.get("LOG_RETENTION_ROWS", "10000"))

# Live environmental-data providers. Open-Meteo supplies operational weather
# model output; Earth Search indexes public Sentinel-2 L2A imagery on AWS.
# Provider failures are surfaced as 503 responses in live mode—never replaced
# by synthetic values without an explicit ENVIRONMENTAL_DATA_MODE=synthetic.
PROVIDER_TIMEOUT_SECONDS = float(os.environ.get("PROVIDER_TIMEOUT_SECONDS", "30"))
PROVIDER_CACHE_TTL_SECONDS = int(os.environ.get("PROVIDER_CACHE_TTL_SECONDS", "21600"))
OPEN_METEO_BASE_URL = os.environ.get(
    "OPEN_METEO_BASE_URL", "https://api.open-meteo.com/v1/forecast"
).rstrip("/")
EARTH_SEARCH_STAC_URL = os.environ.get(
    "EARTH_SEARCH_STAC_URL", "https://earth-search.aws.element84.com/v1"
).rstrip("/")
SATELLITE_MAX_CLOUD_PCT = float(os.environ.get("SATELLITE_MAX_CLOUD_PCT", "70"))
SATELLITE_LOOKBACK_DAYS = int(os.environ.get("SATELLITE_LOOKBACK_DAYS", "45"))
SATELLITE_GRID_RADIUS_M = float(os.environ.get("SATELLITE_GRID_RADIUS_M", "120"))

# A prediction remains visible below these gates, but is explicitly marked for
# expert review and cannot create an automatic disease alert.
AI_MIN_CONFIDENCE = float(os.environ.get("AI_MIN_CONFIDENCE", "0.65"))
AI_MIN_MARGIN = float(os.environ.get("AI_MIN_MARGIN", "0.10"))
AI_FIELD_VALIDATED = _env_bool("AI_FIELD_VALIDATED", default=False)
AI_SERVING_MODE = os.environ.get(
    "AI_SERVING_MODE",
    "approved_only" if IS_PRODUCTION else "review_only",
).strip().lower()
if AI_SERVING_MODE not in {"approved_only", "review_only"}:
    raise RuntimeError("AI_SERVING_MODE must be either approved_only or review_only.")
if AI_SERVING_MODE == "review_only" and AI_FIELD_VALIDATED:
    raise RuntimeError(
        "AI_FIELD_VALIDATED must remain false while AI_SERVING_MODE=review_only."
    )
if not 0 < AI_MIN_CONFIDENCE <= 1:
    raise RuntimeError("AI_MIN_CONFIDENCE must be in (0, 1].")
if not 0 <= AI_MIN_MARGIN < 1:
    raise RuntimeError("AI_MIN_MARGIN must be in [0, 1).")


# --------------------------------------------------------------------------- #
# AI model registry — built from REAL measured metrics (backend/ml_models/    #
# metrics.json, written by backend/training/train_classifier.py after        #
# training on the public TFDS 'cassava' dataset), not fabricated numbers.    #
# Falls back to an honest "not trained yet" placeholder; inference then       #
# fails closed instead of substituting hand-written diagnostic rules.         #
# --------------------------------------------------------------------------- #
def _load_model_registry():
    metrics_path = ML_MODELS_DIR / "metrics.json"
    try:
        meta = json.loads(metrics_path.read_text(encoding="utf-8"))
        selection = meta.get("selection", {})
        if (selection.get("set") != "validation"
                or selection.get("test_used_for_selection") is not False):
            raise ValueError("legacy/unverified selection metadata")
        active_id = meta["active_model_id"]
        record = meta.get("artifacts", {}).get(active_id)
        active_path = ML_MODELS_DIR / f"{active_id}.joblib"
        if not isinstance(record, dict) or record.get("file") != active_path.name:
            raise ValueError("missing active artifact manifest")
        digest = hashlib.sha256()
        with active_path.open("rb") as handle:
            for chunk in iter(lambda: handle.read(1024 * 1024), b""):
                digest.update(chunk)
        if digest.hexdigest() != record.get("sha256"):
            raise ValueError("active artifact SHA-256 mismatch")
    except (FileNotFoundError, KeyError, ValueError) as exc:
        print(f"[config] trained model registry unavailable ({exc}); using fail-closed placeholder")
        placeholder = {
            "id": "not-trained", "name": "No verified trained model available",
            "version": "0.0.0", "task": "leaf classification (healthy/cbb/cbsd/cmd/cgm)",
            "classes": 5, "accuracy": None, "f1": None, "precision": None, "recall": None,
            "params_m": None, "size_mb": None, "avg_inference_ms": None, "active": True,
            "note": "Run the verified backend/training/train_all.py pipeline",
        }
        return [placeholder], placeholder

    registry = []
    for family, m in meta["models"].items():
        model_path = ML_MODELS_DIR / f"{family}.joblib"
        registry.append({
            "id": family, "name": m["name"], "version": meta["trained_at"][:10],
            "task": "leaf classification (healthy/cbb/cbsd/cmd/cgm)", "classes": len(meta["classes"]),
            "accuracy": m["accuracy"], "f1": m["f1"], "precision": m["precision"], "recall": m["recall"],
            "params_m": None, "size_mb": round(model_path.stat().st_size / 1e6, 2) if model_path.exists() else None,
            "avg_inference_ms": None,  # measured live per-request in ai_engine.py, not a fixed claim
            "active": family == meta["active_model_id"],
            "trained_on": f"TFDS 'cassava' — {meta['dataset']['train']} train / "
                          f"{meta['dataset']['val']} val / {meta['dataset']['test']} test images",
        })
    active = next(m for m in registry if m["active"])
    return registry, active


MODEL_REGISTRY, ACTIVE_MODEL = _load_model_registry()

# Optional: prefer the CNN (EfficientNet-B0 on raw pixels, backend/services/cnn_classifier.py)
# over the classical/fusion classifiers for the 5 ML-backed classes, when BOTH this is True
# AND a trained CNN model actually exists on disk (backend/ml_models/cnn_efficientnet_b0.onnx +
# cnn_metrics.json — produced by train_cnn.py or train_cnn_torch.py). Defaults to False: until real
# CNN training, artifact verification and independent Thai-field validation have happened,
# the CNN is an experimental candidate rather than a production diagnosis model.
# Flip to True only after comparing cnn_metrics.json's real measured test macro-F1 against the
# classical/fusion ones and deciding CNN is actually better for your real production photo
# distribution (TFDS's distribution may not match what users actually upload).
USE_CNN = _env_bool("USE_CNN", default=False)

# The current fusion dataset derives synthetic canopy health/NDVI from the target
# disease label because TFDS has no paired field observations.  That is useful for
# an end-to-end architecture experiment, but it is target leakage and must not drive
# production predictions.  Enable only for an explicitly labelled experiment until
# training uses real photo + date + field + satellite/soil pairs.
USE_FUSION = _env_bool("USE_FUSION", default=False)
if USE_FUSION and APP_ENV != "test":
    raise RuntimeError(
        "USE_FUSION is experimental and not production-eligible because its "
        "training context contains target leakage."
    )

# Prediction classes.
# healthy/cmd/cbsd/cbb/cgm: trained ML classes (real TFDS 'cassava' photo dataset).
# brown_leaf_spot is served by an independent auxiliary binary head when its
# verified artifact is present. It is never mixed into the five-way probability
# distribution. The remaining conditions stay out of diagnosis outputs until a
# task-appropriate model exists.
CLASSES = [
    {"key": "healthy",  "en": "Healthy",                        "th": "สุขภาพดี"},
    {"key": "cmd",      "en": "Cassava Mosaic Disease (CMD)",   "th": "โรคใบด่างมันสำปะหลัง (CMD)"},
    {"key": "cbsd",     "en": "Cassava Brown Streak (CBSD)",    "th": "โรคเส้นใบสีน้ำตาล (CBSD)"},
    {"key": "cbb",      "en": "Cassava Bacterial Blight (CBB)", "th": "โรคใบไหม้แบคทีเรีย (CBB)"},
    {"key": "cgm",      "en": "Cassava Green Mite (CGM)",       "th": "ไรแดงมันสำปะหลัง (CGM)"},
    {"key": "cad",             "en": "Cassava Anthracnose Disease (CAD)", "th": "โรคแอนแทรคโนสมันสำปะหลัง"},
    {"key": "brown_leaf_spot", "en": "Cassava Brown Leaf Spot",          "th": "โรคใบจุดสีน้ำตาล"},
    {"key": "white_leaf_spot", "en": "Cassava White Leaf Spot",         "th": "โรคใบจุดขาว"},
    {"key": "sed",             "en": "Super Elongation Disease (SED)",  "th": "โรคยอดยืดผิดปกติ (ซูเปอร์อีลองเกชัน)"},  # Thai name is a translation, not an established DOA term — no Thai extension source found for SED
    {"key": "mealybug",        "en": "Cassava Mealybug",                "th": "เพลี้ยแป้งมันสำปะหลัง"},
    {"key": "whitefly",        "en": "Cassava Whitefly Damage",         "th": "แมลงหวี่ขาว (แมลงหวี่ขาวยาสูบ)"},
    {"key": "water_stress",  "en": "Water Stress",              "th": "ภาวะขาดน้ำ"},
    {"key": "nutrient_def",  "en": "Nutrient Deficiency",       "th": "ภาวะขาดธาตุอาหาร"},
]

for d in (DATABASE_DIR, UPLOAD_DIR, HEATMAP_DIR):
    d.mkdir(parents=True, exist_ok=True)
