# CassavaGuard AI

[ภาษาไทย](README.md) | **English**

> A web-based decision-support platform for screening cassava diseases and pests
> from leaf images, enriched with weather, satellite, soil, analysis history,
> and traceable agronomic recommendations.

[Open the app](https://cassavaguard-render.onrender.com/) ·
[Complete workflow](docs/COMPLETE_WORKFLOW_TH.md) ·
[User guide](docs/USER_GUIDE_TH.md) ·
[Experiment report](docs/reports/CassavaGuard_Experiment_Report_TH.docx) ·
[API](docs/API.md) ·
[Security](SECURITY.md)

> [!IMPORTANT]
> CassavaGuard is a **decision-support tool**, not a laboratory-confirmed diagnosis
> or expert opinion. Never use its output alone to decide whether to apply chemicals,
> uproot plants, or destroy a field.

## Current status

| Item | Status |
|---|---|
| Production site | [cassavaguard-render.onrender.com](https://cassavaguard-render.onrender.com/) |
| Authentication | Disabled — the app and image analysis are directly accessible |
| AI serving mode | `review_only` — every result requires review |
| Primary model | EfficientNet-B2 + TTA, five classes |
| Primary test result | **Accuracy 88.20%, Macro-F1 83.63%** |
| 95% target | **Not achieved** |
| Thai-field validation | No sufficiently representative independent holdout yet |
| Automated tests | 74 tests passed in the latest repository verification |

Service status: [Production health check](https://cassavaguard-render.onrender.com/api/health)

Production was last verified on **15 August 2026**: the application returned HTTP 200,
health was `ok`, and the runtime reported `environment=production`,
`environmental_data_mode=live`, and `ai_serving_mode=review_only`.

## Contents

- [What the application does](#what-the-application-does)
- [Quick start](#quick-start)
- [How to analyze an image](#how-to-analyze-an-image)
- [Verified AI performance](#verified-ai-performance)
- [Class readiness](#class-readiness)
- [Datasets and leakage controls](#datasets-and-leakage-controls)
- [Architecture](#architecture)
- [Development and testing](#development-and-testing)
- [Render deployment](#render-deployment)
- [Documentation](#documentation)
- [Limitations and security](#limitations-and-security)

## What the application does

| Capability | Implementation |
|---|---|
| Image screening | Validates type, size, pixel count, and image quality before running real ONNX inference |
| Five primary classes | Healthy, CBB, CBSD, CMD, and CGM |
| Auxiliary models | Brown Leaf Spot, White Leaf Spot, and Whitefly remain separate from the primary five-way probabilities |
| Thirteen-class readiness | Reports the actual state of every displayed class and never fabricates scores for unsupported classes |
| Explainability | Shows confidence, review warnings, and an occlusion-sensitivity attribution map |
| Weather | Uses Open-Meteo and records provider and observation time |
| Satellite | Uses Sentinel-2 L2A through Earth Search with NDVI, NDMI, SAVI, and EVI |
| Soil | Accepts laboratory, sensor, or field-kit measurements; missing values are not invented |
| Recommendations | Combines image, soil, weather, and satellite evidence with an explicit confidence level |
| History | Stores, reviews, and exports previous analyses |
| Interface | Thai/English, dark/light themes, and responsive layouts |

### System principles

- **No fabricated output:** unsupported classes are reported as unavailable.
- **Correct task separation:** classifiers, auxiliary classifiers, detectors, and
  stress estimators are not forced into an invalid 13-way probability distribution.
- **Traceability:** artifacts, preprocessing, labels, metrics, and hashes are recorded
  in model contracts.
- **Leakage controls:** exact and perceptual duplicates are audited across data splits.
- **Honest uncertainty:** low-confidence or insufficient-evidence cases require review.
- **Source-aware live data:** weather and satellite results include provider and time.

## Quick start

### Requirements

- Git
- Python 3.11 or 3.12
- At least 4 GB RAM for development
- Node.js LTS only when changing the frontend

### Install and run

```bash
git clone https://github.com/norapolamarit-commits/cassavaguard-render.git
cd cassavaguard-render

python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install -r requirements.txt

cp .env.example .env
python serve.py
```

Open <http://127.0.0.1:8800/> and check <http://127.0.0.1:8800/api/health>.

On Windows PowerShell, activate the environment with:

```powershell
.venv\Scripts\Activate.ps1
```

The detailed Windows/macOS setup, `.env` configuration, GitHub workflow,
application development process, and troubleshooting guide are available in the
[complete Thai workflow](docs/COMPLETE_WORKFLOW_TH.md).

## How to analyze an image

1. Open the application and select **AI Analysis**. No login is required.
2. Select a clear JPEG or PNG image with the leaf centered and adequately lit.
3. Start the analysis and wait for image validation and model inference.
4. Review the predicted class, confidence, warnings, and attribution display.
5. If confidence is low or quality checks fail, capture several better views.
6. Ask an agricultural specialist to verify high-impact decisions.
7. Use **History** for previous results and **System & Models** for AI readiness.

Recommended images show the complete leaf in focus, without harsh shadows,
cluttered backgrounds, or aggressive color editing.

## Verified AI performance

### Primary classifier

| Model | Evaluation set | Accuracy | Macro-F1 | Decision |
|---|---:|---:|---:|---|
| EfficientNet-B2, single view | Test, 1,873 images | 86.60% | 80.82% | Baseline |
| **EfficientNet-B2 + TTA** | **Test, 1,873 images** | **88.20%** | **83.63%** | **Published model** |
| Candidate + 225 real images | Test, 1,873 images | 85.80% | 79.78% | Rejected |

- Accuracy Wilson 95% CI for the published TTA model: **86.66%–89.58%**
- Per-class F1: Healthy 82.51%, CBB 72.73%, CBSD 87.69%, CMD 93.56%, CGM 81.68%
- Primary weakness: CBB Recall 67.53%
- The real-data candidate underperformed the baseline and was not promoted.
- The project will not claim 95% until it passes an independent Thai-field test.

### Auxiliary models and object detection

| Model | Evaluation set | Main result | Release status |
|---|---|---|---|
| Brown Leaf Spot | Test | Accuracy 92.78%, Macro-F1 88.70% | Auxiliary, expert review required; no Thai-field validation |
| White Leaf Spot | Test | Accuracy 96.77%, Macro-F1 94.94% | Experimental; domain and licence warnings |
| Whitefly detector | Validation | mAP50 75.57%, mAP50-95 36.39% | Review-only; sealed test unopened |
| Whitefly operating point | Validation | Precision 74.74%, Recall 74.68%, F1 74.71% | Slightly below the 75% gate |

Whitefly is an object-detection task, so it is evaluated using mAP, Precision,
Recall, and F1—not classification Accuracy. Complete contracts and artifacts are in
[`backend/ml_models`](backend/ml_models).

## Class readiness

The application uses a multi-head taxonomy and reports readiness directly through
`/api/models/readiness`.

| Class | Task | Current state | Application output |
|---|---|---|---|
| Healthy, CBB, CBSD, CMD, CGM | Five-way classification | Trained model | Production output, review required |
| Brown Leaf Spot | Auxiliary binary classification | Trained auxiliary | Production output, review required |
| White Leaf Spot | Experimental auxiliary | Executable but blocked by field/licence gates | Experimental review only |
| Whitefly | Object detection and counting | Validation-only detector | Review-only; no sealed-test metric |
| CAD | Auxiliary classification | One real image | No diagnostic output |
| SED | Whole-plant multiview | Synthetic seed only | No diagnostic output |
| Mealybug | Object detection | Three real images, no bounding boxes | No diagnostic output |
| Water Stress | Multimodal estimation | No paired real image/soil/weather data | No diagnostic output |
| Nutrient Deficiency | Multimodal estimation | Insufficient paired real data | No diagnostic output |

Displaying 13 classes does **not** mean that 13 production models exist. Check the
current state through the [Model Readiness API](https://cassavaguard-render.onrender.com/api/models/readiness).

## Datasets and leakage controls

### TFDS Cassava — primary five-class model

- Source: [TensorFlow Datasets Cassava](https://www.tensorflow.org/datasets/catalog/cassava)
- Raw splits: Train 5,656 / Validation 1,889 / Test 1,885
- Effective splits after quarantine: Train 5,619 / Validation 1,875 / Test 1,873
- Exact duplicates are checked using SHA-256 of decoded RGB pixels.
- Similar images are audited using dHash and pHash.
- Conflicting-label groups are quarantined.
- Test predictions are not used for checkpoint selection.

### Mendeley India — real-data candidate experiment

- Dataset: [Mendeley India Cassava Dataset](https://data.mendeley.com/datasets/3832tx2cb2/1)
- DOI: `10.17632/3832tx2cb2.1`, licence: CC BY 4.0
- Published: 228 images; accepted into Train: 225; near-duplicates quarantined: 3
- Healthy 91 / CBB 46 / CMD 88
- Used only for training; official Validation and Test remained untouched.

Raw datasets are not stored in GitHub because of size, licensing, and privacy.
Every new source must pass provenance, label-mapping, licence, and leakage review.

## Architecture

```text
Browser / React SPA
        │
        │ HTTPS + JSON + multipart image
        ▼
FastAPI routes
        ├── AI services ── ONNX Runtime ── Model artifacts + contracts
        ├── Weather ───── Open-Meteo
        ├── Satellite ─── Earth Search / Sentinel-2
        ├── Soil & recommendation services
        ├── SQLAlchemy ── SQLite (local) / PostgreSQL (production)
        └── DATA_DIR ──── uploaded/generated assets
```

```text
cassavaguard-render/
├── backend/
│   ├── api/                 # FastAPI routes
│   ├── core/                # Access policy, security, rate limiting
│   ├── services/            # AI and external-data services
│   ├── training/            # Download, audit, train, evaluate, promote
│   └── ml_models/           # Published artifacts, metrics, hashes
├── frontend/
│   ├── src/                 # React source
│   └── dist/                # Production build
├── migrations/              # Alembic migrations
├── tests/                   # API, runtime, security, model/data contracts
├── docs/                    # Guides, plans, and reports
├── deploy/render/           # Build, pre-deploy, start, verification
├── render.yaml              # Render Blueprint
├── serve.py                 # Application launcher
└── requirements.txt         # Runtime dependencies
```

The end-to-end implementation process—from requirements, database and API design
through AI, UI, security, tests, and production—is documented in the
[complete application workflow](docs/COMPLETE_WORKFLOW_TH.md#ส่วนที่-12-วิธีสร้างแอป-cassavaguard-ตั้งแต่ต้น).

## Development and testing

### Important environment variables

| Variable | Local | Production |
|---|---|---|
| `APP_ENV` | `development` | `production` |
| `SECRET_KEY` | Unique random local value | Newly generated Render secret |
| `AUTH_REQUIRED` | `false` | `false` in the current release |
| `AI_SERVING_MODE` | `review_only` | `review_only` |
| `AI_FIELD_VALIDATED` | `false` | `false` until independent validation |
| `ENVIRONMENTAL_DATA_MODE` | `live` | `live` |
| `USE_CNN` | `true` | `true` |

Never commit `.env`, tokens, API keys, databases, uploads, or user data.

### Build the frontend

```bash
npm ci
npm run build
```

After changing `frontend/src`, review and commit the regenerated `frontend/dist`.

### Tests and artifact verification

```bash
python -m pip install -r requirements-dev.txt
python -m pytest -q
python backend/training/verify_artifacts.py --require-cnn --include-fusion
python backend/training/quality_gate.py
```

The suite covers the API and SPA, security headers, rate limiting, ONNX loading,
artifact hashes/contracts/self-tests, leakage controls, Whitefly runtime, and the
Render deployment bundle.

### Train a candidate

```bash
python3 -m venv backend/training/.venv-torch
backend/training/.venv-torch/bin/python -m pip install -r requirements-training-torch.txt

backend/training/.venv-torch/bin/python \
  backend/training/train_cnn_torch.py \
  --architecture efficientnet_b2 \
  --image-size 260 \
  --device mps \
  --output-dir tmp/candidates/efficientnet_b2_candidate
```

Select checkpoints, thresholds, and TTA using Validation only; open sealed Test
after locking decisions; verify ONNX parity and hashes; and promote only candidates
that outperform the baseline. See the [training guide](docs/TRAINING.md).

## Render deployment

### Recommended: Blueprint

1. Push the repository to GitHub.
2. In Render, select **New + → Blueprint**.
3. Select the repository and let Render read [`render.yaml`](render.yaml).
4. Review the Web Service, PostgreSQL database, and persistent disk.
5. Apply and deploy the Blueprint.
6. Check `/api/health`, `/api/models`, and a permitted sample image.

> [!WARNING]
> The current Blueprint uses a `starter` Web Service, a `basic-256mb` PostgreSQL
> database, and a persistent disk. This configuration incurs charges. Review
> Render pricing and billing before creating or scaling the service.

### Manual Web Service settings

| Render setting | Value |
|---|---|
| Runtime | Python 3 |
| Branch | `main` |
| Build Command | `bash deploy/render/build.sh` |
| Pre-Deploy Command | `bash deploy/render/predeploy.sh` |
| Start Command | `bash deploy/render/start.sh` |
| Health Check Path | `/api/health` |

Set `APP_ENV=production`, `SECRET_KEY`, `DATABASE_URL`, and the remaining variables
described in the [Render deployment guide](deploy/render/README.md).

## Main API endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/health` | Service health and runtime readiness |
| `POST` | `/api/predict/image` | Validate and analyze a leaf image |
| `GET` | `/api/models` | Model registry and artifact status |
| `GET` | `/api/models/readiness` | Per-class readiness |
| `GET` | `/api/models/compare` | Model-comparison metrics |
| `GET` | `/api/weather/*` | Weather data |
| `GET` | `/api/satellite/*` | Sentinel-2 indices |

Schemas and examples are in the [API reference](docs/API.md). Swagger UI is
available at `/api/docs` only in development when `ENABLE_API_DOCS=true`.

## Documentation

### Guides

- [Complete setup, usage, development, GitHub, and Render workflow](docs/COMPLETE_WORKFLOW_TH.md) — Thai
- [User guide](docs/USER_GUIDE_TH.md) — Thai
- [Application user guide PDF](docs/reports/CassavaGuard_App_Usage_Guide_TH.pdf) — Thai
- [API reference](docs/API.md)
- [Training and data guide](docs/TRAINING.md)
- [Model artifact policy](docs/ARTIFACT_POLICY.md)
- [Render deployment guide](deploy/render/README.md) — Thai

### Reports and plans

- [Experiment report](docs/reports/CassavaGuard_Experiment_Report_TH.docx) — Thai
- [Project summary PDF](docs/reports/CassavaGuard_Project_Summary_TH.pdf) — Thai
- [Project summary Word document](docs/reports/CassavaGuard_Project_Summary_TH.docx) — Thai
- [Performance plan](docs/PERFORMANCE_PLAN_TH.md) — Thai
- [Whitefly quality plan](docs/WHITEFLY_QUALITY_PLAN_TH.md) — Thai

## Limitations and security

- There is no independent Thai-field holdout covering enough provinces, seasons,
  cultivars, and capture devices.
- Some datasets do not provide plant/field grouping, so all same-scene leakage
  cannot be ruled out.
- White Leaf Spot has cross-source/domain-confounding risk and CC BY-NC 4.0 restrictions.
- Whitefly does not yet pass every 75% validation P/R/F1 gate, and sealed Test is unopened.
- Synthetic data may be explicitly labeled for Train/experiments only, never Validation/Test.
- With login disabled, anyone with the URL shares the application data context.
- Runtime artifacts must match their metric contracts and build-time SHA-256 checks.

### Short threat model

| Risk | Control |
|---|---|
| Malicious or oversized uploads | MIME validation, byte/pixel limits, sanitized filenames |
| Swapped model artifact | SHA-256, label contract, and self-test |
| Excessive requests | Rate limiting, provider timeouts, bounded inference |
| Missing provider data | Explicit unavailable/source/time state; no fabricated live values |
| Overconfident AI result | Confidence/margin gates, review-only mode, user warnings |
| Experimental leakage | Duplicate quarantine and locked Validation/Test roles |

Intentionally excluded from GitHub:

- `.env`, secrets, tokens, and credentials
- Databases, uploads, and user data
- Raw datasets, training caches, and virtual environments
- Candidate models that were not promoted
- Temporary builds, QA screenshots, and transient test files

See [SECURITY.md](SECURITY.md) for responsible reporting and deployment guidance.

## Licence and data sources

This project combines code, models, and metadata from sources with different terms.
Review each artifact's licence and DOI before redistribution or commercial use:

- Mendeley India and CCMT: CC BY 4.0
- Cassava Whitefly Dataset: CC BY 4.0
- Embrapa White Leaf Spot subset: CC BY-NC 4.0 — no commercial use
- TFDS Cassava: verify upstream image rights before redistribution or commercial use

Repository-level source code is published under the
[CassavaGuard Proprietary Source-Available Notice](LICENSE), which does not grant
automatic rights to use, modify, or distribute the code. Datasets, dependencies,
and model tooling remain subject to their owners' terms. See
[Third-party notices](THIRD_PARTY_NOTICES.md).

> [!CAUTION]
> The repository licence does not grant rights to third-party materials. In
> particular, Embrapa CC BY-NC and Ultralytics AGPL/commercial licensing require
> review before redistribution or commercial use.

No warranty is provided for diagnosis or high-risk agricultural decisions.

---

**Current verified primary result: EfficientNet-B2 + TTA — Test Accuracy 88.20%,
Macro-F1 83.63%. The 95% target has not been achieved.**
