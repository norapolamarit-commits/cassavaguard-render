# 🌿 CassavaGuard AI

**An AI-powered precision-agriculture platform for cassava monitoring, disease
diagnosis, and evidence-based agronomy decision support.**

CassavaGuard turns leaf photos, satellite indices, weather and soil data into a
single intelligent dashboard — the kind of decision-support tool that farmers,
researchers and administrators can act on. It is styled after commercial
platforms like Google Earth Engine, ArcGIS Dashboard and Climate FieldView, with
a modern glassmorphic UI, dark/light mode, Thai/English, and smooth animations.

---

## ✨ Features

| Area | What it does |
|------|--------------|
| **Dashboard** | Animated KPI cards (fields, plants, healthy %, high-risk %, disease/nutrient/water alerts), weather summary, satellite constellation status, risk distribution & per-field health charts |
| **Interactive GIS Map** | Leaflet map with 4 basemaps (Esri satellite / OSM street / OpenTopo / CARTO dark), field boundary polygons, risk heatmap and observed Sentinel-2 index overlays |
| **AI Diagnosis** | Upload a **cassava leaf** image. The verified EfficientNet-B0 head returns a 5-class distribution (Healthy, CMD, CBSD, CBB, CGM), while separate heads handle Brown Leaf Spot and review-only White Leaf Spot/Whitefly findings. They are never fabricated into the 5-way softmax. The remaining 5 conditions expose explicit data/model readiness instead of heuristic diagnoses. Confidence, margin, image-quality and field-validation gates determine `requires_review`; automatic alerts are disabled until independent Thai-field validation is explicitly approved |
| **Satellite Analysis** | Actual Sentinel-2 L2A reflectance from the public Earth Search/AWS archive; NDVI / NDMI / SAVI / EVI, cloud/SCL masking, acquisition provenance, spatial grid and historical comparison |
| **Weather** | Live Open-Meteo operational-model current conditions, 7-day forecast and recent history, with timestamp/provider provenance (model output, not a local weather-station reading) |
| **Soil** | Stores real laboratory, sensor or field-kit samples. Missing pH/OM/N/P/K/CEC/moisture remain blank—no generated replacement values |
| **Recommendations** | Evidence-based agronomy cards that **fuse AI + soil + weather + satellite** into a hypothesis, multi-source evidence, concrete actions and a transparent confidence score |
| **History** | Searchable/filterable prediction log with a detail modal (attribution-map explainability), **CSV and PDF export** |
| **System & Models** | Model registry & comparison (accuracy/F1/size/speed), server/compute/inference/dataset status, bounded API request logs, and Admin user/role management |
| **Notifications** | Per-user alert read state + toast notifications (disease / nutrient / water / weather) |
| **Auth & privacy** | JWT with revocation after password/role changes, expiring hashed reset tokens, Admin / Researcher / Farmer RBAC, owner-scoped fields/history, and short-lived signed image URLs |

Everything is **bilingual (ไทย / English)** with **dark & light** themes and a
**fully responsive** layout.

---

## 🚀 Run it

```bash
cd cassavaguard
python3.12 -m venv .venv
.venv/bin/python -m pip install -r requirements.txt
cp .env.example .env
.venv/bin/python serve.py           # http://127.0.0.1:8800
```

Open **http://127.0.0.1:8800**. The default `.env.example` uses live
environmental providers and does not seed fictional fields. Set bootstrap admin
credentials or register the first farmer account. Set
`ENVIRONMENTAL_DATA_MODE=synthetic` and `SEED_DEMO_DATA=true` only for an
explicit offline demo/test instance.

**Interactive API docs (development only):** http://127.0.0.1:8800/api/docs

### Demo accounts (only when `SEED_DEMO_DATA=true`)

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@cassavaguard.ai` | `admin123` |
| Researcher | `researcher@cassavaguard.ai` | `research123` |
| Farmer | `farmer@cassavaguard.ai` | `farmer123` |

When editing frontend source, rebuild the committed production assets:

```bash
npm ci
npm run build
```

Run the verification suite with `python3.12 -m pytest -q`.
The release-level performance gate is
`.venv/bin/python backend/training/quality_gate.py`; it enforces held-out CNN
accuracy above 75% together with macro-F1, calibration and task-appropriate
Whitefly mAP/recall floors. See
[`docs/PERFORMANCE_PLAN_TH.md`](docs/PERFORMANCE_PLAN_TH.md) for the supervised
work split and metric contract.

### คู่มือการใช้งาน

เปิดแอปแล้วเลือกเมนู **คู่มือใช้งาน** ในแถบด้านซ้ายเพื่อดูขั้นตอนสร้างแปลง
บันทึกผลตรวจดิน ถ่ายภาพ วิเคราะห์ AI และอ่านผลแบบ review-only คู่มือฉบับเต็มอยู่ที่
[`docs/USER_GUIDE_TH.md`](docs/USER_GUIDE_TH.md)

---

## 🏗️ Architecture

```
cassavaguard/
├── backend/                    # FastAPI application (clean, modular)
│   ├── main.py                 # lifespan, rate limiting, security headers, SPA serving
│   ├── config.py               # environment settings, upload limits, model registry
│   ├── database.py             # SQLAlchemy engine/session + Alembic runner
│   ├── models/                 # ORM: User, Field, Prediction, Alert/AlertRead, LogEntry
│   ├── schemas/                # Pydantic request/response models
│   ├── core/                   # PBKDF2/JWT, RBAC/ownership policy, rate limiter
│   ├── api/                    # auth/admin, fields, signed files, prediction and analytics
│   └── services/               # AI and live-provider adapters:
│       ├── ai_engine.py        #   primary 5-way + auxiliary heads, review gates, attribution
│       ├── model_readiness.py  #   honest readiness contract for all 13 display classes
│       ├── reco_engine.py      #   multi-source evidence fusion → recommendation cards
│       ├── satellite_engine.py #   Earth Search + Sentinel-2 L2A COG processing
│       ├── weather_engine.py   #   Open-Meteo live weather-model adapter
│       ├── soil_engine.py      #   real lab/sensor sample interpretation
│       ├── provider_client.py  #   provider HTTP errors + bounded cache
│       ├── simkit.py           #   explicit synthetic test-mode generator
│       └── seed.py             #   idempotent demo data
├── frontend/                   # React SPA with committed production assets
│   ├── index.html              # theming + pre-built asset references
│   ├── dist/                   # minified JS/CSS generated by npm run build
│   ├── vendor/                 # React, ReactDOM, Chart.js, Leaflet
│   └── src/
│       ├── api.js              # fetch client with JWT
│       ├── i18n.js             # TH/EN dictionary
│       ├── store.js            # React context: theme, language, auth, toasts
│       ├── ui.jsx              # reusable primitives (glass cards, KPI, rings, badges, modal…)
│       ├── charts.jsx          # Chart.js wrappers (line, bar, radar, doughnut, scatter)
│       ├── map.jsx             # Leaflet GIS component
│       ├── pages/              # dashboard, fieldmap, predict, satellite, weather,
│       │                       #   soil, recommendations, history, system, auth
│       ├── App.jsx             # sidebar / navbar / notifications / FAB / router
│       └── main.jsx            # mount
├── migrations/                 # Alembic schema history
├── tests/                      # authorization/security regression tests
├── database/                   # local SQLite file (auto-created)
├── uploads/                    # private prediction assets (served via signed URL)
├── package.json                # pinned frontend build dependencies
├── serve.py                    # launcher
└── requirements.txt
```

### Production frontend

React JSX is compiled by esbuild and Tailwind is generated at build time.
Production browsers load only `frontend/dist/app.js` and `app.css`; Babel and
Tailwind's browser compiler are not shipped. The generated files are committed,
so the Python service can deploy without Node installed on the runtime host.

---

## 🧠 About the AI

`ai_engine.py` uses a multi-head contract. The primary probability distribution
contains **only the five classes present in the verified TFDS artifact**:

1. **healthy / CMD / CBSD / CBB / CGM** — the active model is an
   **EfficientNet-B0 raw-pixel CNN**, selected by validation macro-F1 and trained
   with ImageNet transfer learning on real, labelled photographs from the public
   [TFDS `cassava`](https://www.tensorflow.org/datasets/catalog/cassava) dataset.
   See `backend/ml_models/cnn_metrics.json` for its held-out test metrics and
   artifact hash. The verified scikit-learn 12-feature model remains available
   as a fail-closed fallback if the ONNX artifact is absent or invalid.
2. **Brown Leaf Spot** — an independent binary Hist Gradient Boosting head trained
   on 4,887 effective raw CCMT cassava images (CC BY 4.0), selected and thresholded
   on validation only. It consumes the shared 12 visual features plus the five CNN
   outputs. It appears in `auxiliary_findings`, never inside the 5-way `probs`.
3. **White Leaf Spot** — a local experimental binary auxiliary trained from
   115 real Embrapa PDDB positives and real CCMT negatives. It is returned only
   in `auxiliary_findings`, is always marked review-required, and is blocked from
   production by cross-source confounding, missing Thai-field validation and the
   source's CC BY-NC 4.0 licence.
4. **Whitefly** — a local experimental YOLO object detector/counting head trained
   from 3,000 real photographs and 212,948 PASCAL VOC boxes. Its boxes and count
   are returned in `auxiliary_findings`; it is not a leaf-classification label and
   remains blocked from production. The validation-selected checkpoint measured
   held-out test precision 49.85%, recall 41.47%, mAP50 31.53% and mAP50-95 8.50%.
5. **Water Stress / Nutrient Deficiency / Anthracnose (CAD) / Super Elongation
   Disease (SED) / Mealybug** — not served as diagnoses. `/api/models/readiness`
   states the real-data count, correct task type and concrete blocker for each.

For the ML-backed classes, the "attribution map" is a **genuine occlusion-
sensitivity map**: the runtime masks 8×8 grid cells with the image's mean
colour and measures the real drop in the active classifier's probability.
It is an input-perturbation explanation, not relabelled as Grad-CAM.

### Verified training pipeline

Use Python 3.11 or 3.12. The first run downloads TFDS `cassava` (~1.26 GiB); CNN
training is substantially faster on a GPU.

For Google Colab, open [`CassavaGuard_Train_CNN_Colab.ipynb`](CassavaGuard_Train_CNN_Colab.ipynb).
It supports project upload by ZIP, Google Drive or Git and downloads a verified
Keras/ONNX/metrics artifact bundle after training.

```bash
python3.12 -m venv .venv-training
.venv-training/bin/python -m pip install -r requirements-training.txt
.venv-training/bin/python backend/training/train_all.py
```

On Apple silicon, the Metal/MPS path used for the current artifact is:

```bash
python3.12 -m venv backend/training/.venv-torch
backend/training/.venv-torch/bin/python -m pip install -r requirements-training-torch.txt
backend/training/.venv-torch/bin/python backend/training/train_cnn_torch.py --device mps
.venv/bin/python backend/training/verify_artifacts.py --require-cnn
```

Train the Brown Leaf Spot auxiliary head from the primary CCMT repository:

```bash
.venv/bin/python backend/training/train_brown_leaf_spot.py
```

The downloader verifies the provider's SHA-256 for every file, stores source DOI
and CC BY 4.0 provenance, removes exact duplicates before a stratified 70/15/15
split, selects the family and threshold only on validation, and opens test only
after selection.

`train_all.py` is the TensorFlow/Keras alternative. The pipelines run
`verify_artifacts.py`. It preserves TFDS's official splits, quarantines exact
duplicate label conflicts, uses all remaining train images (with class weights where
the estimator supports them),
selects checkpoints only from validation macro-F1, fits confidence temperature
on validation, evaluates test after selection, exports ONNX, checks framework/ONNX
numeric parity and records SHA-256 hashes. Restart `serve.py` after a successful
run. The local development instance uses `USE_CNN=true`; keep
`AI_FIELD_VALIDATED=false` until an independent Thai-field evaluation passes.

See [`docs/TRAINING.md`](docs/TRAINING.md) for role ownership, data provenance,
release gates, current measured results and primary source links.

Fusion training is intentionally opt-in:

```bash
ENVIRONMENTAL_DATA_MODE=synthetic \
  .venv-training/bin/python backend/training/train_all.py --include-experimental-fusion
```

It remains `production_eligible=false` and `USE_FUSION=false` because its synthetic
NDVI is derived from the target label and the downstream demo engines are date-
dependent. All five fusion-family artifacts are hash/contract/smoke-test verified
and appear in the model registry as `experimental · off`; they are architecture
experiments, not production accuracy evidence.

With `ENVIRONMENTAL_DATA_MODE=live`, weather comes from Open-Meteo's operational
weather-model feed, satellite indices are computed from observed Sentinel-2 L2A
pixels found via Earth Search, and soil values come only from stored lab/sensor/
field-kit samples. Every response includes `data_source`. Provider failures
produce HTTP 503; the live path never falls back to generated values. Synthetic
mode remains available for deterministic offline tests and is always labelled.

The active EfficientNet-B0 CNN reached validation accuracy **79.10%** /
macro-F1 **72.25%**, then measured held-out test accuracy **81.38%** /
macro-F1 **74.74%** on 1,874 post-quarantine official-test images. Calibration
ECE is **4.34%** and PyTorch/ONNX maximum absolute logit difference is
`7.15e-06` with identical argmax. The previous Hist Gradient Boosting fallback
measured test accuracy **59.65%** / macro-F1 **47.04%**. Metrics for the five
trained classes must not be described as end-to-end accuracy for all display
conditions. The Brown Leaf Spot auxiliary head measured validation macro-F1
**88.95%** and held-out test macro-F1 **85.77%**, ROC-AUC **95.88%**, with
Brown Leaf Spot precision **80.74%** and recall **73.65%**. CCMT lacks
field/plant grouping identifiers, so same-scene leakage cannot be fully ruled out
despite exact-duplicate removal; this is not Thai-field validation. By default
`AI_FIELD_VALIDATED=false`, so every image result requires expert review and
cannot create an automatic disease alert. Set it true only after an independent,
representative Thai-field validation. CassavaGuard remains decision support,
not a laboratory-confirmed diagnosis.

The full artifact self-test currently exercises **17 executable artifacts**:
one CNN, Brown Leaf Spot, White Leaf Spot, Whitefly, eight classical image-feature
models and five disabled experimental fusion models. This count is not the same
as class coverage: **6 of 13 conditions are trained serving outputs**, two more
are executable review-only experimental findings, and five still lack enough
real labelled data for a defensible model.

---

## 🔐 Production configuration

The deployment bundle lives in [`deploy/render/`](deploy/render/README.md).
The root `render.yaml` (mirrored at `deploy/render/render.yaml`) provisions
PostgreSQL, a persistent upload disk, pre-deploy Alembic migrations, a generated
JWT secret, committed hash-verified runtime models, demo mode disabled, and
`AUTH_REQUIRED=false`. The app creates one internal `app@cassavaguard.local`
identity and opens directly without a login screen. Anyone who can reach the URL
shares that identity and its application permissions, so restrict the Render URL
at the network/platform layer when the stored data is sensitive.

Render uses `AI_SERVING_MODE=review_only`, `AI_FIELD_VALIDATED=false` and
`USE_CNN=true`. This lets the measured experimental heads execute without
misrepresenting them as field-validated: every such finding remains review-required
and cannot create an automatic disease alert. Use `approved_only` to fail closed on
all artifacts that have not passed the production gate.

For password-reset email, configure:

```text
SMTP_HOST, SMTP_PORT, SMTP_USERNAME, SMTP_PASSWORD, SMTP_FROM, SMTP_USE_TLS
PUBLIC_BASE_URL
```

Useful optional settings include `CORS_ORIGINS`, `MAX_IMAGE_UPLOAD_BYTES`,
`MAX_CSV_UPLOAD_BYTES`, `LOG_RETENTION_ROWS`, provider timeout/cache settings,
`SATELLITE_MAX_CLOUD_PCT`, and the AI review gates. Production defaults to
`ENVIRONMENTAL_DATA_MODE=live`.
Production refuses to start with the built-in JWT secret or a secret shorter
than 32 bytes, and an empty production database requires bootstrap-admin
credentials.

The in-process rate limiter matches the included single-instance deployment.
Use a Redis-backed limiter before scaling the web service to multiple instances.

---

## 🛠️ Tech

**Backend:** FastAPI · SQLAlchemy · Alembic · Pydantic · PyJWT · Pillow · NumPy · HTTPX · Rasterio
**Frontend:** React · esbuild · Tailwind CSS · Chart.js · Leaflet
**DB:** SQLite (local development) · PostgreSQL (production Blueprint)
