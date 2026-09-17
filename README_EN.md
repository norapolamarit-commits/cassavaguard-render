# CassavaGuard AI

[ภาษาไทย](README.md) | **English**

An AI-assisted web application for screening cassava health from photographs. It includes
authenticated accounts, private analysis history, original-image and heatmap storage, and
an advisory chatbot.

[Open the app](https://cassavaguard-render.onrender.com/) ·
[Render deployment guide](deploy/render/README.md) ·
[Model training guide](docs/TRAINING.md) ·
[Security](SECURITY.md)

> [!IMPORTANT]
> AI output is screening support, not laboratory confirmation. Never use it as the sole
> basis for roguing plants, applying chemicals, or taking other high-risk action.

## Current status

| Item | Status |
|---|---|
| Product scope | Photo-first, image-only analysis |
| Authentication | Required in production |
| Public registration | Enabled |
| Guest access | Disabled in production |
| Serving model | EfficientNet-B3 ONNX, five classes |
| Test accuracy | **88.15%** (1,651/1,873 images) |
| Macro-F1 | **84.59%** |
| Wilson 95% CI | **86.60–89.53%** |
| Development goal | **90%** |
| Ensemble candidate | **90.55%**; not deployed, Wilson lower bound 89.14% |
| Serving policy | `review_only` |
| Automated tests | **122 passing** |

Field, satellite, weather, and soil features have been removed from the current user
experience. Environmental data is not silently fused into image predictions.

## Main features

- Account registration and sign-in
- Account-isolated records and image files
- Camera capture and JPG, PNG, or WebP upload
- Healthy, CBB, CBSD, CMD, and CGM classification
- Confidence, Top-3 probabilities, heatmap, and explanation
- Leaf and whole-plant multi-view analysis
- Private history with original-image and heatmap review
- CSV and PDF history export
- Deletion of a prediction and its related files
- Advisory chatbot, separate from image-model diagnosis
- Model readiness and evaluation reporting

## Supported primary classes

| Key | Class |
|---|---|
| `healthy` | Healthy cassava leaf |
| `cbb` | Cassava Bacterial Blight |
| `cbsd` | Cassava Brown Streak Disease |
| `cmd` | Cassava Mosaic Disease |
| `cgm` | Cassava Green Mite |

The application does not invent a primary diagnosis for classes without sufficient labelled
data and evaluation evidence.

## AI performance

The production model is EfficientNet-B3 exported to ONNX and served with ONNX Runtime on CPU.

| Metric | Result |
|---|---:|
| Held-out test images | 1,873 |
| Correct predictions | 1,651 |
| Accuracy | 88.15% |
| Macro-F1 | 84.59% |
| ECE (15 bins) | 1.35% |
| Wilson 95% lower bound | 86.60% |

The Test split is not synthetic and exact/perceptual duplicate candidates were quarantined.
The upstream dataset does not include complete field, plant, or capture-session identifiers,
so the project does not claim that every possible source of leakage has been excluded. A
representative independent Thai-field test is still required.

### 90% goal

A Validation-selected ensemble (`EfficientNet-B3 0.70 + ConvNeXt-Tiny 0.30`) reached 90.55%
Test accuracy. This passes the 90% point target, but its Wilson 95% lower bound is 89.14%.
It is not considered a confident pass and has not been deployed because its size and CPU
latency are higher than the single B3 model.

The goal is considered fully achieved only when:

1. Held-out accuracy is at least 90%.
2. The Wilson 95% lower bound is at least 90%.
3. Macro-F1 and per-class recall do not materially regress.
4. An independent Thai-field evaluation passes.
5. Render CPU runtime remains operationally acceptable.

The pipeline's 75% release floor is a minimum safety gate, not the 90% development goal.

## Authentication and storage

### PostgreSQL

Stores accounts, password hashes, timestamps, diagnoses, confidence, probabilities, model
metadata, and the owning `user_id`.

### Persistent disk

Stores original images and heatmaps in account-specific directories:

```text
/var/data/uploads/users/{user_id}/
/var/data/uploads/users/{user_id}/heatmaps/
```

- Standard users can only query their own predictions.
- Images are served through short-lived signed URLs.
- Cross-account prediction access returns `404`.
- Deleting a prediction removes its database record and related files.
- Failed database transactions clean up newly written files.

Render must mount a persistent disk at `/var/data` and set `DATA_DIR=/var/data`.

## Local setup

Requirements: Python 3.11+, Node.js, and Git.

```bash
git clone https://github.com/norapolamarit-commits/cassavaguard-render.git
cd cassavaguard-render

python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements-dev.txt

cp .env.example .env
npm ci
npm run build

alembic upgrade head
python serve.py
```

- Application: <http://127.0.0.1:8800/>
- API docs: <http://127.0.0.1:8800/api/docs>
- Health: <http://127.0.0.1:8800/api/health>

## Verification

```bash
source .venv/bin/activate
python backend/training/verify_artifacts.py --cnn-only
python backend/training/quality_gate.py
python -m pytest -q
npm run build
git diff --exit-code -- frontend/dist
```

The current expected result is `122 passed` plus a successful frontend build.

## Render deployment

The root [render.yaml](render.yaml) provisions the web service, PostgreSQL, and persistent disk.

Important environment values:

```text
APP_ENV=production
AUTH_REQUIRED=true
PUBLIC_REGISTRATION_ENABLED=true
ALLOW_GUEST_ACCESS=false
DATA_DIR=/var/data
SEED_DEMO_DATA=false
USE_CNN=true
USE_FUSION=false
ENABLE_AUXILIARY_MODELS=false
AI_SERVING_MODE=review_only
```

Required secrets:

```text
SECRET_KEY=<at least 32 random bytes>
BOOTSTRAP_ADMIN_EMAIL=<administrator email>
BOOTSTRAP_ADMIN_PASSWORD=<at least 10 characters>
GROQ_API_KEY=<required only for the live chatbot>
```

Render commands:

```text
Build Command:     bash deploy/render/build.sh
Pre-deploy:        bash deploy/render/predeploy.sh
Start Command:     bash deploy/render/start.sh
Health Check Path: /api/health
```

After deployment, `/api/health` should report production, required authentication, PostgreSQL,
and persistent upload storage.

## Repository layout

```text
backend/             FastAPI, auth, models, inference, and training
frontend/src/        React UI source
frontend/dist/       Production frontend bundle
migrations/          Alembic migrations
deploy/render/       Render lifecycle scripts
tests/               API, security, model, and deployment tests
docs/                Training and operational documentation
```

## Security and limitations

- Passwords use salted PBKDF2 hashes and are never stored as plaintext.
- Access and asset tokens expire.
- Production requires a strong `SECRET_KEY`.
- The model remains `review_only`.
- Confidence is not laboratory-confirmation probability.
- Do not upload faces, identity documents, licence plates, or unrelated personal data.
- Revoke any API key ever exposed in a message or commit.

## Licence and third-party data

The repository licence does not automatically grant redistribution or commercial-use rights
for every external dataset or model. Review [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

---

**Summary:** production serves EfficientNet-B3 at 88.15% Test accuracy. The development goal
is 90%; the ensemble candidate reaches 90.55%, but its Wilson lower bound remains below target
and it is not deployed.
