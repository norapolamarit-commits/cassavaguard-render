# CassavaGuard AI

> ระบบช่วยคัดกรองโรคและศัตรูมันสำปะหลังจากภาพใบพืช พร้อมข้อมูลอากาศ ดาวเทียม ดิน
> ประวัติการวิเคราะห์ และคำแนะนำที่ตรวจสอบแหล่งข้อมูลย้อนหลังได้

[เปิดแอป](https://cassavaguard-render.onrender.com/) ·
[คู่มือทุกขั้นตอน](docs/COMPLETE_WORKFLOW_TH.md) ·
[คู่มือผู้ใช้](docs/USER_GUIDE_TH.md) ·
[ผลการทดลอง](docs/reports/CassavaGuard_Experiment_Report_TH.docx) ·
[API](docs/API.md)

> [!IMPORTANT]
> CassavaGuard เป็น **เครื่องมือช่วยตัดสินใจ (decision support)** ไม่ใช่ผลวินิจฉัยยืนยัน
> จากห้องปฏิบัติการหรือผู้เชี่ยวชาญ ห้ามใช้ผลเพียงอย่างเดียวเพื่อตัดสินใจใช้สารเคมี
> ถอนต้น หรือทำลายแปลง

## สถานะปัจจุบัน

| รายการ | สถานะ |
|---|---|
| เว็บ Production | [cassavaguard-render.onrender.com](https://cassavaguard-render.onrender.com/) |
| การเข้าสู่ระบบ | ปิด — เปิดหน้าแอปและวิเคราะห์ได้ทันที |
| AI serving | `review_only` — ทุกผลต้องตรวจซ้ำ |
| โมเดลหลัก | EfficientNet-B2 + TTA, 5 คลาส |
| ผล Test หลัก | **Accuracy 88.20%, Macro-F1 83.63%** |
| เป้าหมาย 95% | **ยังไม่บรรลุ** |
| Thai-field validation | ยังไม่มีชุดทดสอบอิสระที่ครอบคลุมเพียงพอ |
| Automated tests | 74 tests ผ่านในการตรวจล่าสุดของเอกสารชุดนี้ |

ตรวจบริการ: [Production Health Check](https://cassavaguard-render.onrender.com/api/health)

ตรวจ Production ล่าสุดเมื่อ **15 สิงหาคม 2026**: หน้าเว็บตอบ HTTP 200, Health เป็น `ok`,
`environment=production`, `environmental_data_mode=live` และ `ai_serving_mode=review_only`

## สารบัญ

- [สิ่งที่แอปทำได้](#สิ่งที่แอปทำได้)
- [เริ่มใช้งานภายใน 5 นาที](#เริ่มใช้งานภายใน-5-นาที)
- [วิธีใช้วิเคราะห์ภาพ](#วิธีใช้วิเคราะห์ภาพ)
- [ผลประเมิน AI](#ผลประเมิน-ai)
- [ความพร้อมของแต่ละคลาส](#ความพร้อมของแต่ละคลาส)
- [ข้อมูลที่ใช้](#ข้อมูลที่ใช้)
- [สถาปัตยกรรม](#สถาปัตยกรรม)
- [พัฒนาและทดสอบ](#พัฒนาและทดสอบ)
- [Deploy บน Render](#deploy-บน-render)
- [เอกสารทั้งหมด](#เอกสารทั้งหมด)
- [ข้อจำกัดและความปลอดภัย](#ข้อจำกัดและความปลอดภัย)

## สิ่งที่แอปทำได้

| ความสามารถ | การทำงาน |
|---|---|
| วิเคราะห์ภาพ | ตรวจชนิด ขนาด จำนวนพิกเซล และคุณภาพภาพ ก่อนเรียกโมเดล ONNX จริง |
| โรคหลัก 5 คลาส | Healthy, CBB, CBSD, CMD และ CGM |
| โมเดลเสริม | Brown Leaf Spot, White Leaf Spot และ Whitefly แยกจาก probability ของโมเดลหลัก |
| ความพร้อมรายคลาส | แสดงสถานะจริงของ 13 คลาส และไม่สร้างคะแนนปลอมให้คลาสที่ข้อมูลไม่พอ |
| อธิบายผล | แสดง confidence, review warning และ attribution map แบบ occlusion sensitivity |
| สภาพอากาศ | Open-Meteo พร้อมชื่อ provider และเวลาของข้อมูล |
| ดาวเทียม | Sentinel-2 L2A จาก Earth Search พร้อม NDVI, NDMI, SAVI และ EVI |
| ดิน | รับค่าจากแล็บ เซนเซอร์ หรือชุดตรวจ; ค่าที่ไม่มีจะไม่ถูกสมมติแทน |
| คำแนะนำ | รวมหลักฐานจากภาพ ดิน อากาศ และดาวเทียม พร้อมระดับความเชื่อมั่น |
| ประวัติ | บันทึก ดูย้อนหลัง และส่งออกผลการวิเคราะห์ |
| การใช้งาน | ไทย/อังกฤษ, Dark/Light และ Responsive |

### หลักการที่ระบบยึดถือ

- **ไม่สร้างผลปลอม:** คลาสที่ไม่มีโมเดลหรือข้อมูลเพียงพอจะแสดงว่าไม่พร้อม
- **แยกงานให้ถูกประเภท:** classifier, auxiliary classifier, detector และ stress estimator
  ไม่ถูกรวมเป็น probability 13 คลาสแบบผิดความหมาย
- **ตรวจสอบย้อนหลังได้:** artifact, preprocessing, labels, metrics และ hash อยู่ใน model contract
- **ป้องกัน leakage:** ตรวจ exact/perceptual duplicates และแยก Train/Validation/Test ตามนโยบาย
- **ยอมรับความไม่แน่นอน:** confidence ต่ำหรือหลักฐานไม่พอจะส่งให้ตรวจทานแทนการเดา
- **ข้อมูลจริงมีที่มา:** weather/satellite ต้องระบุ provider และเวลาสังเกตการณ์

## เริ่มใช้งานภายใน 5 นาที

### สิ่งที่ต้องมี

- Git
- Python 3.11 หรือ 3.12
- RAM อย่างน้อย 4 GB สำหรับ Development
- Node.js LTS เฉพาะกรณีแก้ Frontend

### ติดตั้งและเปิดแอป

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

เปิด <http://127.0.0.1:8800/> และตรวจ <http://127.0.0.1:8800/api/health>

Windows PowerShell ใช้คำสั่งเปิด environment ต่อไปนี้แทน:

```powershell
.venv\Scripts\Activate.ps1
```

อ่านขั้นตอนติดตั้ง Windows/macOS, การตั้ง `.env` และการแก้ปัญหาได้ที่
[คู่มือทำทุกขั้นตอน](docs/COMPLETE_WORKFLOW_TH.md)

## วิธีใช้วิเคราะห์ภาพ

1. เปิดหน้าแอปและเลือก **วิเคราะห์ด้วย AI** — ไม่ต้อง Login
2. เลือก JPEG/PNG ที่ใบอยู่กลางภาพ ภาพชัด และมีแสงเพียงพอ
3. กดวิเคราะห์และรอระบบตรวจภาพกับโหลดโมเดล
4. อ่านคลาสที่ทำนาย confidence คำเตือน และตำแหน่งที่โมเดลให้ความสำคัญ
5. ถ้าความมั่นใจต่ำหรือภาพไม่ผ่าน ให้ถ่ายใหม่หลายมุม
6. ตรวจซ้ำกับนักวิชาการเกษตร โดยเฉพาะก่อนการตัดสินใจที่มีความเสี่ยง
7. เปิด **ประวัติ** เพื่อดูผลเดิม หรือ **ระบบ & โมเดล** เพื่อตรวจสถานะ AI

ภาพแนะนำ: ใบเต็มใบ, โฟกัสชัด, ไม่มีเงาหนัก, ฉากหลังไม่รก และไม่ผ่านการแต่งสีรุนแรง

## ผลประเมิน AI

### โมเดลจำแนกหลัก

| โมเดล | ชุดประเมิน | Accuracy | Macro-F1 | การตัดสินใจ |
|---|---:|---:|---:|---|
| EfficientNet-B2 ภาพเดียว | Test 1,873 ภาพ | 86.60% | 80.82% | Baseline |
| **EfficientNet-B2 + TTA** | **Test 1,873 ภาพ** | **88.20%** | **83.63%** | **โมเดลที่ใช้งาน** |
| Candidate + ข้อมูลจริง 225 ภาพ | Test 1,873 ภาพ | 85.80% | 79.78% | ไม่โปรโมต |

- Wilson 95% CI ของ Accuracy โมเดลหลัก + TTA: **86.66%–89.58%**
- F1 รายคลาส: Healthy 82.51%, CBB 72.73%, CBSD 87.69%, CMD 93.56%, CGM 81.68%
- จุดอ่อนหลัก: CBB Recall 67.53%
- Candidate ที่เพิ่มข้อมูลจริงให้ผลต่ำกว่า baseline จึงไม่ถูกนำขึ้น Production
- จะไม่รายงานว่าได้ 95% จนกว่าจะผ่าน independent Thai-field test

### โมเดลเสริมและ Object Detection

| โมเดล | ชุดประเมิน | ผลหลัก | สถานะ |
|---|---|---|---|
| Brown Leaf Spot | Test | Accuracy 92.78%, Macro-F1 88.70% | ใช้เป็นหัวเสริม; ยังไม่มี Thai-field validation |
| White Leaf Spot | Test | Accuracy 96.77%, Macro-F1 94.94% | Experimental; มี domain/license warning |
| Whitefly detector | Validation | mAP50 75.57%, mAP50-95 36.39% | Review-only; sealed test ยังไม่เปิด |
| Whitefly operating point | Validation | Precision 74.74%, Recall 74.68%, F1 74.71% | ต่ำกว่า gate 75% เล็กน้อย |

Whitefly เป็นงาน Object Detection จึงประเมินด้วย mAP, Precision, Recall และ F1
ไม่ใช้ Accuracy แทน ผลเต็มและ artifact contracts อยู่ใน
[`backend/ml_models`](backend/ml_models)

## ความพร้อมของแต่ละคลาส

ระบบใช้ taxonomy แบบ multi-head และรายงานสถานะจาก `/api/models/readiness` โดยตรง

| คลาส | งาน | สถานะ | ผลที่แอปใช้ได้ |
|---|---|---|---|
| Healthy, CBB, CBSD, CMD, CGM | 5-way classification | Trained model | Production output แบบ review-required |
| Brown Leaf Spot | Auxiliary binary classification | Trained auxiliary | Production output แบบ review-required |
| White Leaf Spot | Experimental auxiliary | ทำงานได้แต่ยังไม่ผ่าน field/license gate | Experimental review เท่านั้น |
| Whitefly | Object detection/counting | Validation-only detector | Review-only; ยังไม่มี sealed-test metric |
| CAD | Auxiliary classification | ข้อมูลจริง 1 ภาพ | ไม่เปิดผลวิเคราะห์ |
| SED | Whole-plant multiview | มีเพียง synthetic seed | ไม่เปิดผลวิเคราะห์ |
| Mealybug | Object detection | ข้อมูลจริง 3 ภาพ ไม่มี bounding boxes | ไม่เปิดผลวิเคราะห์ |
| Water Stress | Multimodal estimation | ไม่มีข้อมูลจริงแบบจับคู่ภาพ/ดิน/อากาศ | ไม่เปิดผลวิเคราะห์ |
| Nutrient Deficiency | Multimodal estimation | ข้อมูลจริงแบบจับคู่ไม่เพียงพอ | ไม่เปิดผลวิเคราะห์ |

คำว่า “แสดง 13 คลาส” จึงไม่ได้หมายความว่ามีโมเดล Production ครบ 13 คลาส
สถานะล่าสุดตรวจได้จาก [Model Readiness API](https://cassavaguard-render.onrender.com/api/models/readiness)

## ข้อมูลที่ใช้

### TFDS Cassava — โมเดลหลัก 5 คลาส

- แหล่งข้อมูล: [TensorFlow Datasets Cassava](https://www.tensorflow.org/datasets/catalog/cassava)
- Raw: Train 5,656 / Validation 1,889 / Test 1,885
- หลังตรวจซ้ำ: Train 5,619 / Validation 1,875 / Test 1,873
- ตรวจ exact duplicates ด้วย SHA-256 ของ decoded RGB pixels
- ตรวจภาพคล้ายด้วย dHash และ pHash
- กักกลุ่มฉลากขัดแย้ง และไม่ใช้ Test เลือก checkpoint

### Mendeley India — การทดลองเพิ่มข้อมูลจริง

- Dataset: [Mendeley India Cassava Dataset](https://data.mendeley.com/datasets/3832tx2cb2/1)
- DOI: `10.17632/3832tx2cb2.1`, License: CC BY 4.0
- เผยแพร่ 228 ภาพ; รับเข้า Train 225 ภาพ; กัก near-duplicates 3 ภาพ
- Healthy 91 / CBB 46 / CMD 88
- ใช้ใน Train เท่านั้น ไม่แตะ Validation/Test

Dataset ดิบไม่อยู่ใน GitHub เพราะขนาด เงื่อนไข license และความเป็นส่วนตัว
Pipeline ต้องตรวจ provenance, label mapping และ leakage ก่อนรับข้อมูลใหม่ทุกครั้ง

## สถาปัตยกรรม

```text
Browser / React SPA
        │
        │ HTTPS + JSON + multipart image
        ▼
FastAPI routes
        ├── AI services ── ONNX Runtime ── Model artifacts + contracts
        ├── Weather ───── Open-Meteo
        ├── Satellite ─── Earth Search / Sentinel-2
        ├── Soil & Recommendation services
        ├── SQLAlchemy ── SQLite (local) / PostgreSQL (production)
        └── DATA_DIR ──── uploaded/generated assets
```

```text
cassavaguard-render/
├── backend/
│   ├── api/                 # FastAPI routes
│   ├── core/                # Access policy, security, rate limiting
│   ├── services/            # AI และ external-data services
│   ├── training/            # Download, audit, train, evaluate, promote
│   └── ml_models/           # Published artifacts, metrics, hashes
├── frontend/
│   ├── src/                 # React source
│   └── dist/                # Production build
├── migrations/              # Alembic database migrations
├── tests/                   # API, runtime, security, model/data contracts
├── docs/                    # คู่มือ แผน และรายงาน
├── deploy/render/           # Build, pre-deploy, start, verification
├── render.yaml              # Render Blueprint
├── serve.py                 # Application launcher
└── requirements.txt         # Runtime dependencies
```

อ่านวิธีสร้างแต่ละส่วนตั้งแต่ requirement, database, API, AI, UI, security และ production ที่
[วิธีสร้างแอป CassavaGuard ตั้งแต่ต้น](docs/COMPLETE_WORKFLOW_TH.md#ส่วนที่-12-วิธีสร้างแอป-cassavaguard-ตั้งแต่ต้น)

## พัฒนาและทดสอบ

### Environment สำคัญ

| ตัวแปร | Local | Production |
|---|---|---|
| `APP_ENV` | `development` | `production` |
| `SECRET_KEY` | ค่าสุ่มเฉพาะเครื่อง | Render Secret ที่สุ่มใหม่ |
| `AUTH_REQUIRED` | `false` | `false` ตาม release ปัจจุบัน |
| `AI_SERVING_MODE` | `review_only` | `review_only` |
| `AI_FIELD_VALIDATED` | `false` | `false` จนผ่านการตรวจอิสระ |
| `ENVIRONMENTAL_DATA_MODE` | `live` | `live` |
| `USE_CNN` | `true` | `true` |

ห้าม commit `.env`, token, API key, database, uploads หรือข้อมูลผู้ใช้

### Build Frontend

```bash
npm ci
npm run build
```

เมื่อแก้ `frontend/src` ต้องตรวจและ commit `frontend/dist` ที่ build ใหม่ด้วย

### Test และตรวจ artifacts

```bash
python -m pip install -r requirements-dev.txt
python -m pytest -q
python backend/training/verify_artifacts.py --require-cnn --include-fusion
python backend/training/quality_gate.py
```

ชุดทดสอบครอบคลุม API/SPA, security headers, rate limiting, ONNX loading,
artifact hash/contract/self-test, leakage controls, Whitefly runtime และ Render bundle

### ฝึก Candidate

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

กฎสำคัญ: เลือก checkpoint/threshold/TTA จาก Validation, เปิด sealed Test หลังล็อก
การตัดสินใจ, ตรวจ ONNX parity และ hash และโปรโมตเฉพาะ Candidate ที่ดีกว่า baseline
ดูขั้นตอนเต็มใน [คู่มือฝึกโมเดล](docs/TRAINING.md)

## Deploy บน Render

### Blueprint — วิธีแนะนำ

1. Push repository ไป GitHub
2. Render Dashboard → **New + → Blueprint**
3. เลือก repository และให้ Render อ่าน [`render.yaml`](render.yaml)
4. ตรวจ Web Service, PostgreSQL และ Persistent Disk
5. กด Apply/Deploy
6. ตรวจ `/api/health`, `/api/models` และทดลองวิเคราะห์ภาพ

### สร้าง Web Service เอง

| Render setting | ค่า |
|---|---|
| Runtime | Python 3 |
| Branch | `main` |
| Build Command | `bash deploy/render/build.sh` |
| Pre-Deploy Command | `bash deploy/render/predeploy.sh` |
| Start Command | `bash deploy/render/start.sh` |
| Health Check Path | `/api/health` |

ต้องตั้ง `APP_ENV=production`, `SECRET_KEY`, `DATABASE_URL` และ environment อื่นตาม
[คู่มือ Deploy ฉบับเต็ม](deploy/render/README.md)

## API หลัก

| Method | Endpoint | หน้าที่ |
|---|---|---|
| `GET` | `/api/health` | Health และ runtime readiness |
| `POST` | `/api/predict/image` | ตรวจและวิเคราะห์ภาพ |
| `GET` | `/api/models` | Model registry และสถานะ artifact |
| `GET` | `/api/models/readiness` | ความพร้อมรายคลาส |
| `GET` | `/api/models/compare` | Metric สำหรับเปรียบเทียบโมเดล |
| `GET` | `/api/weather/*` | ข้อมูลสภาพอากาศ |
| `GET` | `/api/satellite/*` | Sentinel-2 indices |

Schema และตัวอย่าง request อยู่ใน [API Reference](docs/API.md) ส่วน Swagger UI เปิดที่
`/api/docs` เฉพาะ Development เมื่อ `ENABLE_API_DOCS=true`

## เอกสารทั้งหมด

### คู่มือ

- [คู่มือทุกขั้นตอน: ติดตั้ง ใช้ พัฒนา GitHub และ Render](docs/COMPLETE_WORKFLOW_TH.md)
- [คู่มือผู้ใช้ภาษาไทย](docs/USER_GUIDE_TH.md)
- [คู่มือการใช้แอป PDF](docs/reports/CassavaGuard_App_Usage_Guide_TH.pdf)
- [API Reference](docs/API.md)
- [คู่มือฝึกโมเดลและจัดการข้อมูล](docs/TRAINING.md)
- [คู่มือ Render](deploy/render/README.md)

### รายงานและแผน

- [รายงานผลการทดลองภาษาไทย](docs/reports/CassavaGuard_Experiment_Report_TH.docx)
- [รายงานสรุปโครงการ PDF](docs/reports/CassavaGuard_Project_Summary_TH.pdf)
- [รายงานสรุปโครงการ Word](docs/reports/CassavaGuard_Project_Summary_TH.docx)
- [แผนเพิ่มประสิทธิภาพ](docs/PERFORMANCE_PLAN_TH.md)
- [แผนคุณภาพ Whitefly](docs/WHITEFLY_QUALITY_PLAN_TH.md)

## ข้อจำกัดและความปลอดภัย

- ยังไม่มี independent Thai-field holdout ที่ครอบคลุมจังหวัด ฤดู พันธุ์ และอุปกรณ์เพียงพอ
- Dataset บางชุดไม่มี plant/field grouping ครบ จึงตัด same-scene leakage ไม่ได้ทุกกรณี
- White Leaf Spot มีความเสี่ยง cross-source/domain confounding และข้อจำกัด CC BY-NC 4.0
- Whitefly ยังไม่ผ่าน Validation P/R/F1 75% ครบทุกค่า และ sealed test ยังไม่เปิด
- Synthetic data ใช้ได้เฉพาะ Train/experiment ที่ติดป้าย ห้ามใส่ Validation/Test
- การปิด Login หมายถึงผู้เข้าถึง URL ใช้พื้นที่ข้อมูลร่วมกัน ไม่ควรใส่ข้อมูลส่วนบุคคล
- Runtime artifacts ต้องตรงกับ metric contract และ SHA-256 ที่ตรวจระหว่าง build

### Threat model โดยย่อ

| ความเสี่ยง | การควบคุม |
|---|---|
| ไฟล์อัปโหลดอันตราย/ใหญ่เกิน | ตรวจ MIME, byte limit, pixel limit และชื่อไฟล์ |
| Model artifact ถูกสลับ | ตรวจ SHA-256, label contract และ self-test |
| Request มากผิดปกติ | Rate limiting, provider timeout และ bounded inference |
| ข้อมูลจาก provider ขาดหาย | แสดง unavailable/source/time ไม่สร้างค่าจริงเทียม |
| ผล AI มั่นใจเกินจริง | confidence/margin gate, review-only mode และคำเตือน |
| Leakage ในการทดลอง | duplicate quarantine และล็อกบทบาท Validation/Test |

สิ่งที่ตั้งใจไม่เก็บใน GitHub:

- `.env`, secrets, tokens และ credentials
- Database, uploads และข้อมูลผู้ใช้
- Dataset ดิบ, training cache และ virtual environments
- Candidate models ที่ไม่ผ่านการโปรโมต
- Temporary builds, QA screenshots และไฟล์ทดสอบชั่วคราว

## License และแหล่งข้อมูล

โครงการรวมโค้ด โมเดล และ metadata หลายแหล่งซึ่งมีเงื่อนไขต่างกัน ต้องตรวจ license/DOI
ของแต่ละ artifact ก่อนนำไปแจกจ่ายหรือใช้เชิงพาณิชย์ โดยเฉพาะ:

- Mendeley India และ CCMT: CC BY 4.0
- Cassava Whitefly Dataset: CC BY 4.0
- Embrapa White Leaf Spot subset: CC BY-NC 4.0 — ไม่อนุญาตการใช้เชิงพาณิชย์
- TFDS Cassava: ต้องตรวจสิทธิ์ภาพต้นทางก่อนแจกจ่ายซ้ำหรือใช้เชิงพาณิชย์

> [!CAUTION]
> Repository ยังไม่มี `LICENSE` ระดับโครงการ จึง **ไม่ควรตีความว่าโค้ดทั้งหมดเป็น
> open source หรือได้รับอนุญาตให้นำไปใช้เชิงพาณิชย์** ผู้ดูแลต้องเลือก license ของโค้ด
> และตรวจ compatibility ของ dataset/model dependencies ก่อนเผยแพร่ต่อ โดยเฉพาะ
> Embrapa CC BY-NC และ Ultralytics AGPL/commercial licensing

ไม่มีการรับประกันความเหมาะสมสำหรับการวินิจฉัยหรือการตัดสินใจทางการเกษตรที่มีความเสี่ยงสูง

---

**ผลหลักที่ยืนยันได้ในปัจจุบัน: EfficientNet-B2 + TTA — Test Accuracy 88.20%,
Macro-F1 83.63%. เป้าหมาย 95% ยังไม่บรรลุ**
