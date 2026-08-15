# CassavaGuard AI

แพลตฟอร์มเว็บสำหรับช่วยคัดกรองโรคและศัตรูมันสำปะหลังจากภาพใบพืช พร้อมข้อมูลดาวเทียม สภาพอากาศ ดิน ประวัติการวิเคราะห์ และคำแนะนำเชิงเกษตร

> **สถานะสำคัญ:** ระบบเปิดให้ใช้งานแบบไม่ต้อง Login และโมเดลทุกตัวเป็นเครื่องมือช่วยคัดกรอง (`decision support`) ไม่ใช่ผลยืนยันจากห้องปฏิบัติการ ผลวิเคราะห์ต้องได้รับการตรวจซ้ำ โดยเฉพาะก่อนตัดสินใจใช้สารเคมีหรือทำลายพืช

## ทดลองใช้งาน

- เว็บไซต์: [cassavaguard-render.onrender.com](https://cassavaguard-render.onrender.com/)
- Health check: [cassavaguard-render.onrender.com/api/health](https://cassavaguard-render.onrender.com/api/health)
- API documentation เปิดเฉพาะ Development ที่ `/api/docs`

Render Free อาจ sleep เมื่อไม่มีการใช้งาน คำขอแรกจึงอาจใช้เวลาประมาณ 30-60 วินาที

## ความสามารถหลัก

| ส่วน | รายละเอียด |
|---|---|
| วิเคราะห์ด้วย AI | อัปโหลดภาพใบมันสำปะหลัง ตรวจคุณภาพภาพ และวิเคราะห์ด้วยโมเดลจริง |
| โมเดลหลัก | EfficientNet-B2 + Test-Time Augmentation สำหรับ Healthy, CBB, CBSD, CMD และ CGM |
| โมเดลเสริม | Brown Leaf Spot, White Leaf Spot และ Whitefly แยกจาก probability 5 คลาสหลัก |
| ความพร้อม 13 คลาส | แสดงสถานะจริงของแต่ละคลาส ไม่สร้าง probability ปลอมให้คลาสที่ข้อมูลไม่พอ |
| ดาวเทียม | Sentinel-2 L2A จาก Earth Search พร้อม NDVI, NDMI, SAVI และ EVI |
| สภาพอากาศ | Open-Meteo พร้อมชื่อแหล่งข้อมูลและเวลาของข้อมูล |
| ดิน | รับค่าจากผลแล็บ เซนเซอร์ หรือชุดตรวจภาคสนาม; ค่าที่ไม่มีจะไม่ถูกสร้างแทน |
| คำแนะนำ | รวมหลักฐานจากภาพ ดิน อากาศ และดาวเทียม พร้อมระดับความเชื่อมั่น |
| ประวัติ | เก็บและส่งออกผลวิเคราะห์ พร้อม attribution map แบบ occlusion sensitivity |
| ระบบและโมเดล | แสดงทะเบียนโมเดล ผลวัด ขนาด ความเร็ว และความพร้อมของทุกคลาส |
| ภาษาและหน้าจอ | ไทย/อังกฤษ, Dark/Light, Responsive |

## ผลการทดลองที่ยืนยันได้

### โมเดลจำแนกหลัก

| รายการ | ชุดประเมิน | Accuracy | Macro-F1 | หมายเหตุ |
|---|---:|---:|---:|---|
| EfficientNet-B2 ภาพเดียว | Test 1,873 ภาพ | 86.60% | 80.82% | โมเดลฐาน |
| **EfficientNet-B2 + TTA** | **Test 1,873 ภาพ** | **88.20%** | **83.63%** | โมเดลที่ระบบใช้ |
| Candidate + ข้อมูลจริง 225 ภาพ | Test 1,873 ภาพ | 85.80% | 79.78% | ไม่โปรโมต เพราะต่ำกว่าเดิม |

- Wilson 95% CI ของ Accuracy โมเดลหลัก + TTA: **86.66%-89.58%**
- F1 รายคลาส: Healthy 82.51%, CBB 72.73%, CBSD 87.69%, CMD 93.56%, CGM 81.68%
- จุดอ่อนหลักคือ CBB: Recall 67.53%
- เป้าหมาย 95% **ยังไม่บรรลุ** และจะไม่รายงานว่าได้ 95% จนกว่าจะผ่าน independent Thai-field test

### โมเดลเสริมและ Object Detector

| โมเดล | ชุดประเมิน | ผลหลัก | สถานะ |
|---|---|---|---|
| Brown Leaf Spot | Test | Accuracy 92.78%, Macro-F1 88.70% | ใช้เป็นหัวเสริม; ยังไม่มี Thai-field validation |
| White Leaf Spot | Test | Accuracy 96.77%, Macro-F1 94.94% | Experimental; เสี่ยง cross-source/domain confounding และ CC BY-NC |
| Whitefly detector | Validation | mAP50 75.57%, mAP50-95 36.39% | Review-only; sealed test ยังไม่เปิด |
| Whitefly operating point | Validation | Precision 74.74%, Recall 74.68%, F1 74.71% | ต่ำกว่า gate 75% เล็กน้อย |

Whitefly เป็นงาน Object Detection จึงวัดด้วย mAP/Precision/Recall/F1 ไม่ใช่ Accuracy

Artifacts และผลเต็มอยู่ใน [`backend/ml_models`](backend/ml_models) และรายงานอยู่ใน [`docs/reports`](docs/reports)

## Dataset และการป้องกัน Data Leakage

### TFDS Cassava 5 คลาส

- แหล่งข้อมูล: [TensorFlow Datasets Cassava](https://www.tensorflow.org/datasets/catalog/cassava)
- Raw splits: Train 5,656 / Validation 1,889 / Test 1,885
- หลังตรวจซ้ำ: Train 5,619 / Validation 1,875 / Test 1,873
- ตรวจ exact duplicates จาก SHA-256 ของ decoded RGB pixels
- ตรวจภาพคล้ายด้วย dHash และ pHash
- กักกลุ่มฉลากขัดแย้งและไม่ใช้ผล Test เลือก checkpoint

### ข้อมูลจริงที่เพิ่มสำหรับการทดลอง

- [Mendeley India Cassava Dataset](https://data.mendeley.com/datasets/3832tx2cb2/1)
- DOI `10.17632/3832tx2cb2.1`, CC BY 4.0
- เผยแพร่ 228 ภาพ; รับเข้า Train 225 ภาพ; กักภาพคล้ายซ้ำ 3 ภาพ
- Healthy 91 / CBB 46 / CMD 88
- ใช้เฉพาะ Train และไม่แตะ Validation/Test
- Candidate ที่ฝึกด้วยชุดนี้ไม่ดีกว่าโมเดลเดิม จึงไม่ถูกนำขึ้น Production

Dataset ดิบไม่เก็บใน GitHub เนื่องจากขนาด สัญญาอนุญาต และความสามารถในการทำซ้ำผ่าน downloader/DOI

## เอกสารและรายงาน

- [รายงานผลการทดลองภาษาไทย](docs/reports/CassavaGuard_Experiment_Report_TH.docx)
- [รายงานสรุปโครงการ PDF](docs/reports/CassavaGuard_Project_Summary_TH.pdf)
- [รายงานสรุปโครงการ Word](docs/reports/CassavaGuard_Project_Summary_TH.docx)
- [คู่มือการใช้แอป PDF](docs/reports/CassavaGuard_App_Usage_Guide_TH.pdf)
- [คู่มือการใช้งานฉบับ Markdown](docs/USER_GUIDE_TH.md)
- [คู่มือฝึกโมเดลและข้อมูล](docs/TRAINING.md)
- [แผนเพิ่มประสิทธิภาพ](docs/PERFORMANCE_PLAN_TH.md)
- [แผนคุณภาพ Whitefly](docs/WHITEFLY_QUALITY_PLAN_TH.md)
- [API Reference](docs/API.md)

## โครงสร้างระบบ

ขั้นตอนการพัฒนาแอปตั้งแต่การกำหนดโจทย์ ออกแบบหน้าจอ สร้างฐานข้อมูล/API เชื่อม AI
ไปจนถึงทดสอบและ Deploy อธิบายไว้ใน
**[วิธีสร้างแอป CassavaGuard ตั้งแต่ต้น](docs/COMPLETE_WORKFLOW_TH.md#ส่วนที่-12-วิธีสร้างแอป-cassavaguard-ตั้งแต่ต้น)**

```text
cassavaguard-render/
├── backend/
│   ├── api/                 # FastAPI routes
│   ├── core/                # Security, policies, rate limiting
│   ├── services/            # AI, weather, satellite, soil, recommendations
│   ├── training/            # Download, audit, train, evaluate, promote
│   └── ml_models/           # Runtime artifacts + metric contracts + hashes
├── frontend/
│   ├── src/                 # React UI source
│   └── dist/                # Production assets committed for Render
├── migrations/              # Alembic migrations
├── tests/                   # Runtime, security, model and data contracts
├── docs/                    # คู่มือ แผน และรายงาน
├── deploy/render/           # Render build/start/runtime verification
├── render.yaml              # Render Blueprint
├── serve.py                 # Application launcher
└── requirements.txt         # Runtime dependencies
```

## การรันในเครื่อง

> ต้องการทำตามแบบละเอียดตั้งแต่เริ่มต้นจน Deploy ให้เปิด
> **[คู่มือทำทุกขั้นตอน (Local, AI, GitHub และ Render)](docs/COMPLETE_WORKFLOW_TH.md)**

### ความต้องการ

- Python 3.11 หรือ 3.12
- Node.js ใช้เฉพาะเมื่อแก้ Frontend
- RAM อย่างน้อย 4 GB สำหรับ Development; การวิเคราะห์ครั้งแรกต้องโหลด ONNX models

### ติดตั้งและเริ่มระบบ

```bash
git clone https://github.com/norapolamarit-commits/cassavaguard-render.git
cd cassavaguard-render

python3.12 -m venv .venv
.venv/bin/python -m pip install --upgrade pip
.venv/bin/python -m pip install -r requirements.txt

cp .env.example .env
.venv/bin/python serve.py
```

เปิด <http://127.0.0.1:8800>

ระบบปัจจุบันไม่ต้อง Login ผู้ใช้สามารถเปิดหน้า วิเคราะห์ด้วย AI และอัปโหลดภาพได้ทันที

### Environment ที่สำคัญ

| ตัวแปร | Development | Production |
|---|---|---|
| `APP_ENV` | `development` | `production` |
| `SECRET_KEY` | ค่าเฉพาะเครื่อง | ค่าสุ่มยาวและเก็บเป็น Render Secret |
| `AI_SERVING_MODE` | `review` | `review` จนผ่าน Thai-field validation |
| `AI_FIELD_VALIDATED` | `false` | `false` จนผ่านการตรวจอิสระ |
| `ENVIRONMENTAL_DATA_MODE` | `live` หรือ `synthetic` | `live` |
| `USE_CNN` | `true` | `true` |

ห้าม commit `.env`, token, API key, database, uploads หรือข้อมูลผู้ใช้

## การ Build Frontend

Production โหลดไฟล์จาก `frontend/dist` ซึ่งถูก commit เพื่อให้ Render runtime ไม่ต้องติดตั้ง Node.js

```bash
npm ci
npm run build
```

เมื่อแก้ `frontend/src` ต้อง build และ commit `frontend/dist` ด้วย

## การทดสอบ

```bash
python3.12 -m venv .venv
.venv/bin/python -m pip install -r requirements.txt -r requirements-dev.txt
.venv/bin/python -m pytest -q
```

ชุดทดสอบครอบคลุม:

- Backend/API และหน้า SPA
- Model artifact hash/contract/self-test
- ONNX loading และ memory-bounded inference
- Train/validation/test leakage controls
- Security headers และ rate limiting
- Whitefly runtime และ validation benchmark contracts
- Render bundle/runtime verification

## การฝึกโมเดล

### EfficientNet บน Apple Silicon

```bash
python3.12 -m venv backend/training/.venv-torch
backend/training/.venv-torch/bin/python -m pip install -r requirements-training-torch.txt

backend/training/.venv-torch/bin/python \
  backend/training/train_cnn_torch.py \
  --architecture efficientnet_b2 \
  --image-size 260 \
  --device mps \
  --output-dir tmp/candidates/efficientnet_b2_candidate
```

### ดาวน์โหลดข้อมูลจริง Mendeley India

```bash
.venv/bin/python backend/training/download_mendeley_india.py \
  --output-dir backend/training/data/mendeley_india
```

Downloader ตรวจ Dataset ID/version, จำนวนคลาส และ SHA-256 ของไฟล์ที่ผู้เผยแพร่ระบุ

### เพิ่มข้อมูลภายนอกเข้า Train เท่านั้น

```bash
backend/training/.venv-torch/bin/python \
  backend/training/train_cnn_torch.py \
  --architecture efficientnet_b2 \
  --image-size 260 \
  --device mps \
  --extra-data-dir backend/training/data/mendeley_india \
  --output-dir tmp/candidates/efficientnet_b2_extra_real
```

Pipeline จะตรวจ exact/perceptual overlap กับ official Train/Validation/Test ก่อนรับภาพเข้า Train

### กฎการโปรโมตโมเดล

1. เลือก architecture/checkpoint/threshold/TTA จาก Validation เท่านั้น
2. เปิด Test หลังการเลือกเสร็จ
3. Candidate ต้องดีกว่าโมเดลเดิม ไม่ใช่แค่ผ่าน 75%
4. ตรวจ ONNX parity และ SHA-256 artifacts
5. รัน tests และ Render runtime verification
6. Thai-field validation ต้องแยกตามแปลง/ต้นก่อนเปิด `AI_FIELD_VALIDATED=true`

## Deploy ไป Render

คู่มือด้านล่างเป็นฉบับย่อ ส่วนขั้นตอนกดเมนู ตั้งค่าตัวแปร ตรวจ Deploy และแก้ปัญหาอยู่ใน
[คู่มือทำทุกขั้นตอน](docs/COMPLETE_WORKFLOW_TH.md#ส่วนที่-8-deploy-ขึ้น-renderแบบ-blueprint)

### วิธีแนะนำ: Blueprint

1. Fork หรือ push repository นี้ไป GitHub
2. Render Dashboard → **New → Blueprint**
3. เลือก repository
4. Render อ่านค่าใน [`render.yaml`](render.yaml)
5. ตั้ง Secret/Environment variables ที่ไม่มีใน Git
6. Deploy และตรวจ `/api/health`, `/api/models`, `/api/models/compare`

### ตั้ง Web Service เอง

- Runtime: Python 3
- Branch: `main`
- Build Command: `bash deploy/render/build.sh`
- Start Command: `bash deploy/render/start.sh`
- Health Check Path: `/api/health`
- Environment: `APP_ENV=production`
- กำหนด `SECRET_KEY` เป็นค่าลับแบบสุ่ม

ดูรายละเอียดใน [deploy/render/README.md](deploy/render/README.md)

## API สำคัญ

| Method | Endpoint | หน้าที่ |
|---|---|---|
| GET | `/api/health` | Health และ runtime readiness |
| POST | `/api/predict/image` | วิเคราะห์ภาพใบมันสำปะหลัง |
| GET | `/api/models` | Model registry และ class readiness |
| GET | `/api/models/compare` | ข้อมูลกราฟเปรียบเทียบโมเดล |
| GET | `/api/models/readiness` | ความพร้อมของทุกคลาส |
| GET | `/api/weather/*` | ข้อมูลสภาพอากาศ |
| GET | `/api/satellite/*` | Sentinel-2 indices |

รายละเอียด schema อยู่ใน [docs/API.md](docs/API.md)

## ข้อจำกัดที่ต้องเปิดเผย

- ไม่มี independent Thai-field holdout ที่ครอบคลุมหลายจังหวัด ฤดู พันธุ์ และอุปกรณ์
- TFDS และ CCMT ไม่มี plant/field grouping ครบ จึงตัด same-scene leakage ไม่ได้ทุกกรณี
- White Leaf Spot มี cross-source/domain confounding และข้อจำกัด CC BY-NC 4.0
- Whitefly ยังไม่ผ่าน Validation Precision/Recall/F1 gate 75% ครบทุกค่า และ sealed test ยังไม่เปิด
- Synthetic data ใช้เพื่อ seed/train experiments เท่านั้น ห้ามใช้เป็นหลักฐานประสิทธิภาพหรือใช้ใน test
- คำแนะนำเป็น decision support ไม่ใช่คำสั่งใช้สารเคมีหรือผลวินิจฉัยจากผู้เชี่ยวชาญ

## สิ่งที่ไม่เก็บใน GitHub

- `.env`, secrets, tokens และ credentials
- `database/`, `uploads/` และข้อมูลผู้ใช้
- Dataset ดิบและ training caches
- Virtual environments และ `node_modules`
- Candidate models ที่ไม่ผ่านการโปรโมต
- QA screenshots, temporary renders และไฟล์ build ชั่วคราว

ไฟล์โมเดล Runtime ที่ commit ต้องมีขนาดต่ำกว่าข้อจำกัด GitHub และถูกตรวจ hash จาก metrics/manifest ระหว่าง build

## License และที่มาข้อมูล

Repository นี้รวมโค้ด โมเดล และ metadata จากหลายแหล่งซึ่งมีเงื่อนไขต่างกัน โปรดตรวจ license/DOI ใน metrics และเอกสารก่อนนำไปใช้ต่อ โดยเฉพาะ:

- Mendeley India และ CCMT: CC BY 4.0
- Whitefly Dataset: CC BY 4.0
- Embrapa White Leaf Spot subset: CC BY-NC 4.0 (ไม่อนุญาตเชิงพาณิชย์)
- TFDS Cassava: ตรวจสิทธิ์ของภาพต้นทางก่อนแจกจ่ายซ้ำหรือใช้เชิงพาณิชย์

ไม่มีการรับประกันความเหมาะสมสำหรับการวินิจฉัยหรือการตัดสินใจทางการเกษตรที่มีความเสี่ยงสูง

---

**Current verified primary result: EfficientNet-B2 + TTA - Test Accuracy 88.20%, Macro-F1 83.63%. Target 95% is not yet achieved.**
