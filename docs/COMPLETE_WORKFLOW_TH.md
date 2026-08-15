# คู่มือ CassavaGuard AI ทุกขั้นตอน

เอกสารนี้อธิบายตั้งแต่ดาวน์โหลดโค้ด เปิดแอป ใช้วิเคราะห์ภาพ ตรวจสอบโมเดล แก้ Frontend
รันทดสอบ ฝึก Candidate ส่งขึ้น GitHub และ Deploy บน Render เหมาะสำหรับผู้เริ่มต้นและผู้ดูแลระบบ

> โมเดลเป็นเครื่องมือช่วยคัดกรอง ไม่ใช่คำวินิจฉัยยืนยัน ห้ามอ้าง Accuracy 95% เพราะผล Test
> ของโมเดลหลักปัจจุบันคือ Accuracy 88.20% และ Macro-F1 83.63%

## ส่วนที่ 1 เตรียมเครื่อง

1. ติดตั้ง Git จาก <https://git-scm.com/downloads>
2. ติดตั้ง Python 3.11 หรือ 3.12 จาก <https://www.python.org/downloads/>
3. ถ้าจะแก้หน้าเว็บ ให้ติดตั้ง Node.js LTS จาก <https://nodejs.org/>
4. เปิด Terminal แล้วตรวจเวอร์ชัน

```bash
git --version
python3 --version
node --version
npm --version
```

ถ้าแก้เฉพาะ Backend หรือเปิดแอปจาก `frontend/dist` ไม่จำเป็นต้องติดตั้ง Node.js

## ส่วนที่ 2 ดาวน์โหลดโปรเจกต์จาก GitHub

```bash
git clone https://github.com/norapolamarit-commits/cassavaguard-render.git
cd cassavaguard-render
git status
```

ถ้ามีโปรเจกต์อยู่แล้วให้อัปเดตก่อนทำงาน โดยต้องตรวจว่าไม่มีงานค้างที่ยังไม่ commit

```bash
git status --short
git pull --ff-only origin main
```

## ส่วนที่ 3 ติดตั้งและตั้งค่า Backend

### 3.1 สร้าง Virtual Environment

macOS/Linux:

```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
```

Windows PowerShell:

```powershell
py -3.11 -m venv .venv
.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
```

### 3.2 สร้างไฟล์ Environment

macOS/Linux:

```bash
cp .env.example .env
```

Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

เปิด `.env` และตรวจค่าหลัก:

```dotenv
APP_ENV=development
DATABASE_URL=sqlite:///./database/cassavaguard.db
AUTH_REQUIRED=false
ENABLE_API_DOCS=true
ENVIRONMENTAL_DATA_MODE=live
USE_CNN=true
AI_SERVING_MODE=review_only
AI_FIELD_VALIDATED=false
```

สร้าง `SECRET_KEY` ใหม่ ห้ามใช้ค่าตัวอย่างในระบบจริง:

```bash
python -c "import secrets; print(secrets.token_urlsafe(48))"
```

นำผลลัพธ์ไปใส่ `SECRET_KEY=` ใน `.env` และห้าม commit `.env` ขึ้น GitHub

## ส่วนที่ 4 เปิดแอปในเครื่อง

1. เปิด Terminal ที่ root ของโปรเจกต์
2. เปิด virtual environment
3. รันแอป

```bash
source .venv/bin/activate
python serve.py
```

บน Windows ใช้ `.venv\Scripts\Activate.ps1` ก่อน `python serve.py`

เปิดหน้าเหล่านี้:

- แอป: <http://127.0.0.1:8800/>
- Health: <http://127.0.0.1:8800/api/health>
- API Docs ใน Development: <http://127.0.0.1:8800/api/docs>

หยุดแอปด้วย `Ctrl+C`

## ส่วนที่ 5 วิธีใช้แอปวิเคราะห์ภาพ

1. เปิดหน้าแอป ไม่ต้อง Login
2. เลือกเมนู **วิเคราะห์ด้วย AI**
3. กดเลือกไฟล์หรือลากภาพใบมันสำปะหลังลงพื้นที่อัปโหลด
4. ใช้ภาพชัด แสงเพียงพอ ใบอยู่กลางภาพ และหลีกเลี่ยงฉากหลังรก
5. รอระบบตรวจขนาดไฟล์ จำนวนพิกเซล และคุณภาพภาพ
6. กดวิเคราะห์ ระบบจะเรียกโมเดล ONNX จริง ไม่ได้สุ่มคำตอบ
7. อ่านชื่อคลาส ความเชื่อมั่น คำเตือน และ attribution/ตำแหน่งที่โมเดลใช้ประกอบผล
8. ถ้าความมั่นใจต่ำหรือภาพไม่ผ่าน ให้ถ่ายใหม่หลายมุมและส่งผู้เชี่ยวชาญตรวจ
9. เปิดเมนู **ประวัติ** เพื่อดูหรือส่งออกผลเดิม
10. เปิด **ระบบ & โมเดล** เพื่อตรวจสถานะ artifact, metric และความพร้อมรายคลาส

คลาสหลัก 5 คลาสคือ Healthy, CBB, CBSD, CMD และ CGM ส่วน Brown Leaf Spot,
White Leaf Spot และ Whitefly ใช้โมเดลเสริมแยกกัน คลาสที่ข้อมูลไม่พอจะไม่สร้าง probability ปลอม

## ส่วนที่ 6 ตรวจสอบว่าระบบและ AI ทำงานจริง

### 6.1 Health และทะเบียนโมเดล

```bash
curl http://127.0.0.1:8800/api/health
curl http://127.0.0.1:8800/api/models
curl http://127.0.0.1:8800/api/models/readiness
curl http://127.0.0.1:8800/api/models/compare
```

Health ต้องตอบสถานะพร้อมใช้งาน และหน้า models ต้องแสดงชื่อโมเดล metric และสถานะ artifact

### 6.2 รันชุดทดสอบทั้งหมด

```bash
python -m pip install -r requirements-dev.txt
python -m pytest -q
```

ก่อนเผยแพร่ README รอบนี้ผ่าน `74 passed` การผ่าน test ยืนยัน wiring, artifact contract,
hash, API และ runtime แต่ไม่ใช่หลักฐานว่า Accuracy เพิ่มขึ้น

### 6.3 ตรวจ Runtime artifacts

```bash
python backend/training/verify_artifacts.py --require-cnn --include-fusion
python backend/training/quality_gate.py
python deploy/render/benchmark_runtime.py --iterations 10
```

ห้ามแก้ตัวเลข metric JSON ด้วยมือเพื่อให้ผ่าน gate ต้องสร้างจากการประเมินจริงและตรวจ hash คู่ artifact

## ส่วนที่ 7 แก้และ Build หน้าเว็บ

ติดตั้ง dependency ครั้งแรก:

```bash
npm ci
```

แก้ source ใน `frontend/src` แล้ว build:

```bash
npm run build
```

Production ใช้ `frontend/dist` ดังนั้นต้องตรวจและ commit ทั้ง source ที่แก้กับไฟล์ build ใหม่

```bash
git status --short
git diff --check
python -m pytest -q
```

## ส่วนที่ 8 Deploy ขึ้น Render แบบ Blueprint

### 8.1 เตรียม GitHub

1. Push โค้ดไป repository ของ GitHub
2. ตรวจว่า root มี `render.yaml`, `requirements.txt`, `serve.py` และ `deploy/render/`
3. ตรวจว่าไม่มี `.env`, token, database, uploads และ dataset ใน commit

### 8.2 สร้างบริการ

1. Login ที่ <https://dashboard.render.com/>
2. กด **New +**
3. เลือก **Blueprint**
4. เชื่อม GitHub และอนุญาต repository ที่ต้องการ
5. เลือก repository `cassavaguard-render`
6. Render จะอ่าน `render.yaml` จาก root
7. ตรวจชื่อ Web Service, PostgreSQL และ Persistent Disk
8. กด **Apply** หรือ **Deploy Blueprint**

Blueprint จะตั้งค่า `APP_ENV=production`, สร้าง `SECRET_KEY`, เชื่อม PostgreSQL,
mount `/var/data`, ปิด Login และรัน build/predeploy/start scripts ให้

### 8.3 ถ้าสร้าง Web Service เอง

ตั้งค่าดังนี้:

| ช่อง Render | ค่า |
|---|---|
| Runtime | Python 3 |
| Branch | `main` |
| Build Command | `bash deploy/render/build.sh` |
| Pre-Deploy Command | `bash deploy/render/predeploy.sh` |
| Start Command | `bash deploy/render/start.sh` |
| Health Check Path | `/api/health` |

Environment ที่ต้องมีอย่างน้อย:

```text
APP_ENV=production
SECRET_KEY=<Generate>
DATABASE_URL=<Internal PostgreSQL URL>
DATA_DIR=/var/data
AUTH_REQUIRED=false
ENABLE_API_DOCS=false
ENVIRONMENTAL_DATA_MODE=live
USE_CNN=true
AI_SERVING_MODE=review_only
AI_FIELD_VALIDATED=false
PYTHON_VERSION=3.11.9
```

อย่าใส่เครื่องหมาย `< >` จริง ให้ใช้ค่าที่ Render สร้างหรือค่าจริงของบริการ

### 8.4 ตรวจหลัง Deploy

1. เปิดหน้า **Logs** และรอข้อความ service started/healthy
2. เปิด `https://ชื่อบริการ.onrender.com/api/health`
3. เปิดหน้าเว็บหลักและทดลองภาพที่ทราบ label อย่างน้อยหนึ่งภาพ
4. เปิด **ระบบ & โมเดล** และตรวจว่า artifact พร้อม
5. ตรวจ weather/satellite ว่าระบุแหล่งข้อมูลและเวลาจริง
6. ถ้าแก้ Environment ให้กด **Save Changes** และ Deploy ใหม่

## ส่วนที่ 9 อัปเดต GitHub และ Render

ทุกครั้งที่เปลี่ยนโค้ด:

```bash
git switch -c feature/ชื่อการเปลี่ยนแปลง
git status --short
git add <ระบุเฉพาะไฟล์ที่ต้องการ>
git diff --cached
git commit -m "อธิบายการเปลี่ยนแปลง"
git push -u origin feature/ชื่อการเปลี่ยนแปลง
```

จากนั้นสร้าง Pull Request, ตรวจ test แล้ว merge เข้า `main` ถ้า Render เปิด Auto Deploy
ระบบจะ deploy commit ใหม่อัตโนมัติ ถ้าไม่เปิดให้ไปหน้า Render แล้วกด **Manual Deploy → Deploy latest commit**

## ส่วนที่ 10 ฝึก Candidate model อย่างถูกต้อง

### 10.1 สร้าง training environment

```bash
python3 -m venv backend/training/.venv-torch
backend/training/.venv-torch/bin/python -m pip install --upgrade pip
backend/training/.venv-torch/bin/python -m pip install -r requirements-training-torch.txt
```

### 10.2 ดาวน์โหลดข้อมูลจริงที่รองรับ

```bash
.venv/bin/python backend/training/download_mendeley_india.py \
  --output-dir backend/training/data/mendeley_india
```

### 10.3 ฝึก Candidate

```bash
backend/training/.venv-torch/bin/python \
  backend/training/train_cnn_torch.py \
  --architecture efficientnet_b2 \
  --image-size 260 \
  --device mps \
  --extra-data-dir backend/training/data/mendeley_india \
  --output-dir tmp/candidates/efficientnet_b2_extra_real
```

ถ้าไม่มี Apple Silicon ให้เลือก device ที่ script รองรับตาม `--help`

```bash
backend/training/.venv-torch/bin/python backend/training/train_cnn_torch.py --help
```

### 10.4 ลำดับการประเมินและโปรโมต

1. ตรวจ license, provenance และ mapping ของทุก label
2. แบ่งข้อมูลตามแปลง/ต้น/ชุดเก็บภาพ ห้ามภาพต้นเดียวกันข้าม split
3. กัก exact duplicate และ perceptual near-duplicate
4. ใช้ Train สำหรับเรียนรู้และ Validation สำหรับเลือก checkpoint/threshold/TTA
5. เปิด sealed Test เพียงหลังล็อกการตัดสินใจแล้ว
6. รายงาน Accuracy, Macro-F1, per-class precision/recall/F1, confusion matrix และ calibration
7. Object detector ต้องรายงาน mAP50, mAP50-95, precision และ recall ไม่ใช้ Accuracy แทน
8. Export ONNX และตรวจ output parity กับโมเดลต้นฉบับ
9. สร้าง metric contract/manifest และ SHA-256 ใหม่จาก pipeline
10. โปรโมตเฉพาะ Candidate ที่ดีกว่า baseline และผ่าน test/runtime/security checks
11. คง `AI_FIELD_VALIDATED=false` จนผ่าน independent Thai-field evaluation

ภาพสังเคราะห์ใช้ช่วยทดลองหรือเพิ่มความหลากหลาย Train ได้เมื่อระบุที่มา แต่ห้ามใส่ Validation/Test
และห้ามใช้ผลจากภาพสังเคราะห์เป็นหลักฐานว่าประสิทธิภาพภาคสนามถึง 95%

## ส่วนที่ 11 ปัญหาที่พบบ่อย

### เปิด `0.0.0.0:8800` แล้วเห็น JSON

ให้เปิด `http://127.0.0.1:8800/` ถ้ายังเห็นข้อความว่าไม่มี frontend build ให้รัน `npm ci`
และ `npm run build` แล้ว restart Backend

### Render แจ้ง `requires APP_ENV=production`

ไปที่ **Environment** เพิ่ม `APP_ENV` ค่า `production`, Save Changes แล้ว Deploy ใหม่

### `Encountered error while generating package metadata`

ตรวจ Python ให้ตรง `PYTHON_VERSION=3.11.9`, ตรวจ `requirements.txt` และดูชื่อ package
ที่ล้มเหลวจากบรรทัดก่อน error จากนั้น Clear build cache และ Deploy ใหม่

### วิเคราะห์ภาพไม่ได้

1. ตรวจ `/api/health`
2. ตรวจหน้า **ระบบ & โมเดล**
3. ใช้ JPEG/PNG ที่เล็กกว่า 10 MB และไม่เกิน 25 ล้านพิกเซล
4. ตรวจ Render Logs ขณะส่งภาพ
5. ตรวจว่า runtime artifacts อยู่ครบและ `USE_CNN=true`
6. รัน `verify_artifacts.py` และ test ในเครื่อง

### หน้าเว็บยังเป็นเวอร์ชันเก่า

รัน `npm run build`, commit `frontend/dist`, merge เข้า `main` แล้วสั่ง Deploy latest commit
จากนั้น hard refresh เบราว์เซอร์

### Render เริ่มช้าหรือหน่วยความจำไม่พอ

โมเดล ONNX โหลดครั้งแรกและบริการแบบประหยัดอาจ cold start หลีกเลี่ยง worker หลาย process,
ตรวจว่า `WEB_CONCURRENCY=1` และเลือก plan ที่มี RAM เพียงพอ

## ส่วนที่ 12 วิธีสร้างแอป CassavaGuard ตั้งแต่ต้น

หัวข้อนี้อธิบายกระบวนการ “ทำแอป” ไม่ใช่เพียงวิธีเปิดโปรเจกต์ โดยยึดโครงสร้างที่ใช้จริง
ใน repository ปัจจุบัน

### 12.1 กำหนดปัญหาและขอบเขต

1. กำหนดผู้ใช้หลัก เช่น เกษตรกร นักวิชาการเกษตร และผู้ดูแลระบบ
2. กำหนดงานหลัก: รับภาพ ตรวจคุณภาพ วิเคราะห์ด้วย AI แสดงผลและคำแนะนำ
3. กำหนดข้อมูลประกอบ: แปลง พิกัด ดิน อากาศ ดาวเทียม และประวัติ
4. กำหนดว่าเป็น `decision support` ไม่ใช่ระบบยืนยันโรค
5. สร้างรายการคลาสพร้อมเกณฑ์เปิดใช้งาน ห้ามเปิดคลาสที่ไม่มีข้อมูลประเมินเพียงพอ
6. กำหนด metric ก่อนฝึก: classifier ใช้ Accuracy/Macro-F1/per-class recall;
   detector ใช้ mAP50/mAP50-95/precision/recall
7. กำหนด acceptance gate และชุดทดสอบอิสระก่อนพัฒนา เพื่อป้องกันการเลือกตัวเลขย้อนหลัง

ผลลัพธ์ของขั้นนี้ควรเป็น requirement สั้น ๆ, class definitions, data policy,
metric target และข้อจำกัดที่แสดงต่อผู้ใช้

### 12.2 ออกแบบสถาปัตยกรรม

ระบบนี้ใช้สถาปัตยกรรมแบบ Web Service เดียวเพื่อ deploy ง่าย:

```text
Browser (React SPA)
        |
        | HTTPS / JSON / multipart image
        v
FastAPI routes
        |
        +--> Services: AI / Weather / Satellite / Soil / Recommendation
        |
        +--> ONNX Runtime + model artifacts
        |
        +--> SQLAlchemy --> SQLite (local) / PostgreSQL (production)
        |
        +--> DATA_DIR --> uploaded images / generated assets
```

หลักการแยกส่วน:

- `backend/api/` รับ request ตรวจ schema และคืน response
- `backend/services/` ทำ business logic และเชื่อม provider/model
- `backend/models/` และ `backend/database.py` จัดการข้อมูลถาวร
- `backend/ml_models/` เก็บเฉพาะ artifact ที่ผ่านขั้นเผยแพร่
- `frontend/src/` แสดงผลและเรียก API โดยไม่ฝัง logic ของโมเดล
- `backend/training/` แยก training ออกจาก production runtime

### 12.3 ออกแบบฐานข้อมูล

1. ระบุ entity: ผู้ใช้ระบบ แปลง ผลวิเคราะห์ ภาพ ดิน การแจ้งเตือน และประวัติ
2. กำหนด primary key, foreign key, timestamp และ ownership ของแต่ละ record
3. เก็บ metadata ของผล AI เช่น model ID, artifact hash, confidence และเวลาวิเคราะห์
4. หลีกเลี่ยงเก็บภาพเป็น binary ในฐานข้อมูล ให้เก็บไฟล์ใน `DATA_DIR` และบันทึก path/metadata
5. สร้าง migration ใหม่ทุกครั้งที่ schema เปลี่ยน ห้ามแก้ production DB ด้วยมือ

ตัวอย่างสร้าง migration หลังแก้ models:

```bash
alembic revision --autogenerate -m "add field observation"
alembic upgrade head
```

ตรวจไฟล์ migration ที่สร้างทุกครั้ง เพราะ autogenerate อาจไม่เข้าใจ data migration ทั้งหมด

### 12.4 สร้าง Backend และ API

1. กำหนด configuration ใน `backend/config.py` และอ่านค่าจาก environment
2. สร้าง FastAPI app, middleware, security headers และ lifecycle ใน `backend/main.py`
3. สร้าง route แยกตามโดเมนใน `backend/api/`
4. สร้าง request/response schema เพื่อ validate ชนิดและขนาดข้อมูล
5. ย้าย logic หนักไป `backend/services/` ไม่เขียนทั้งหมดใน route
6. จำกัดขนาดไฟล์ จำนวนพิกเซล rate และ timeout ก่อนเรียก provider/model
7. คืน error ที่ผู้ใช้เข้าใจได้ แต่ไม่เปิดเผย stack trace หรือ path ภายในใน production

รูปแบบ route ใหม่:

```python
from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/api/example", tags=["example"])

@router.get("/status")
def status():
    return {"status": "ok"}
```

จากนั้น import และเพิ่ม router ในรายการที่ `backend/main.py` ใช้ `app.include_router(...)`
พร้อมเพิ่ม test ของ success, invalid input และ provider/model failure

### 12.5 สร้าง AI pipeline

ลำดับ inference ที่ปลอดภัยควรเป็น:

1. รับ JPEG/PNG และตรวจ MIME จากเนื้อไฟล์ ไม่เชื่อ extension อย่างเดียว
2. จำกัด byte size และ pixel count ป้องกัน decompression bomb
3. แก้ EXIF orientation และแปลงเป็น RGB
4. ตรวจคุณภาพ เช่น blur, ความสว่าง และพื้นที่ใบ
5. resize/normalize ด้วยค่าเดียวกับ training contract
6. เรียก ONNX Runtime จาก service ที่ cache model ใน process
7. แปลง logits เป็น probability ตาม contract และใช้ threshold/margin ที่ล็อกไว้
8. เรียกโมเดลเสริมเฉพาะหน้าที่ของมัน ไม่รวม score ต่างชนิดเป็น probability เดียว
9. สร้าง attribution เพื่อช่วยตรวจผล แต่ไม่อ้างว่าเป็นเหตุผลเชิงสาเหตุ
10. บันทึก model ID, version, hash, output และ latency เพื่อ audit ย้อนหลัง
11. ถ้า confidence ต่ำหรือ artifact ไม่พร้อม ให้ตอบ review-required/unknown แทนการเดา

ไฟล์หลักที่ใช้จริง:

- `backend/services/ai_engine.py` ควบคุม workflow
- `backend/services/cnn_classifier.py` โหลด classifier ONNX
- `backend/services/whitefly_detector.py` ทำ object detection
- `backend/services/model_contract.py` ตรวจ metadata และ integrity
- `backend/services/model_readiness.py` สรุปความพร้อมรายคลาส

ทุก artifact ต้องมี metric/manifest ที่ระบุ preprocessing, labels, evaluation split,
metrics และ SHA-256 เพื่อป้องกันการจับคู่ model/label ผิด

### 12.6 เชื่อมข้อมูลจริง

1. Weather ใช้ Open-Meteo ผ่าน `backend/services/weather_engine.py`
2. Satellite ใช้ Earth Search STAC/Sentinel-2 ผ่าน `satellite_engine.py`
3. Soil รับค่าจากแล็บ เซนเซอร์ หรือผู้ใช้ผ่าน `soil_engine.py`
4. Provider ทุกตัวต้องมี timeout, cache, source name, observation time และ error state
5. ถ้าข้อมูลจริงไม่มี ห้ามสร้างค่าปลอมโดยไม่ติดป้าย `synthetic`
6. คำแนะนำต้องระบุหลักฐานที่ใช้ ความเชื่อมั่น และสิ่งที่ยังขาด

ทดสอบทั้งกรณี provider ตอบสำเร็จ, timeout, ไม่มีข้อมูล และ response ผิดรูปแบบ

### 12.7 สร้าง Frontend

1. วาง app shell และ navigation ใน `frontend/src/App.jsx`
2. สร้างหน้าแยกใน `frontend/src/pages/`
3. รวมการเรียก Backend ไว้ใน `frontend/src/api.js`
4. เก็บ state ที่แชร์กันใน `frontend/src/store.js`
5. เก็บข้อความไทย/อังกฤษใน `frontend/src/i18n.js`
6. แสดง loading, empty, success และ error state ทุกหน้า
7. แสดง source/time/confidence และคำเตือนใกล้ผลวิเคราะห์
8. รองรับมือถือ keyboard navigation contrast และข้อความที่อ่านได้
9. ห้ามใส่ secret หรือ provider credential ใน JavaScript เพราะผู้ใช้ดาวน์โหลดได้ทั้งหมด
10. รัน `npm run build` เพื่อสร้าง `frontend/dist` สำหรับ production

เมื่อต้องเพิ่มหน้าใหม่ ให้สร้าง component ใน `pages`, export จากส่วนรวมที่โครงการใช้,
เพิ่ม route/menu ใน `App.jsx`, เพิ่มคำแปล และเชื่อม endpoint ผ่าน `api.js`

### 12.8 เชื่อม Frontend กับ Backend

ตัวอย่าง flow การวิเคราะห์ภาพ:

```text
ผู้ใช้เลือกภาพ
  -> Frontend ตรวจชนิด/ขนาดเบื้องต้น
  -> POST /api/predict/image แบบ multipart/form-data
  -> Backend ตรวจไฟล์และเรียก AI service
  -> Model คืนผล + readiness + warnings
  -> Backend บันทึก history
  -> Frontend แสดงผล ความมั่นใจ และคำแนะนำ
```

อย่าเรียกโมเดลโดยตรงจาก UI ใน architecture นี้ เพราะจะข้าม validation, audit,
rate limit และ model contract ของ Backend

### 12.9 สร้างระบบความปลอดภัยและความเป็นส่วนตัว

1. เก็บ secret ใน `.env`/Render Environment เท่านั้น
2. ตั้ง upload limit, pixel limit, CSV row limit และ rate limit
3. sanitize filename และสร้างชื่อไฟล์ใหม่ ไม่ใช้ path จากผู้ใช้
4. ตรวจสิทธิ์การอ่านไฟล์และ record แม้ปัจจุบันตั้ง `AUTH_REQUIRED=false`
5. จำกัด CORS ให้เฉพาะ origin ที่ต้องใช้
6. เปิด proxy headers เฉพาะเมื่ออยู่หลัง trusted proxy
7. ไม่บันทึก secret, token หรือภาพผู้ใช้ลง application log
8. กำหนด retention และวิธีลบข้อมูลผู้ใช้
9. แสดง privacy notice และข้อจำกัดของ AI
10. สแกน dependency และอัปเดต patch อย่างมี test รองรับ

การเอา Login ออกทำให้ทุกคนที่เข้าถึง URL ใช้ข้อมูลร่วมกัน จึงไม่เหมาะกับข้อมูลส่วนบุคคล
หากใช้จริงหลายองค์กรควรเปิด auth และทำ tenant/record authorization ก่อน

### 12.10 เขียนการทดสอบ

สร้าง test อย่างน้อย 5 ระดับ:

1. Unit test สำหรับ preprocessing, thresholds และ services
2. API test สำหรับ input ปกติ/ผิดรูปแบบ/ขนาดเกิน/provider ล้มเหลว
3. Artifact contract test สำหรับ hash, labels, shapes และ self-test
4. Data leakage test สำหรับ exact/perceptual duplicate ระหว่าง split
5. Deployment smoke test สำหรับหน้า SPA, health, database และ model loading

ก่อน commit:

```bash
git diff --check
python -m pytest -q
python backend/training/verify_artifacts.py --require-cnn --include-fusion
```

ถ้าแก้ UI ให้ build และทดลองทั้ง desktop/mobile พร้อมตรวจ browser console/network

### 12.11 ทำให้พร้อม Production

1. build `frontend/dist`
2. ล็อก runtime dependencies ใน `requirements.txt`
3. ตั้ง migration ผ่าน pre-deploy command
4. ใช้ PostgreSQL แทน SQLite เมื่อมีหลาย request/instance
5. ใช้ persistent/object storage สำหรับภาพ
6. ตั้ง `APP_ENV=production` และสุ่ม `SECRET_KEY`
7. ปิด API docs ถ้าไม่ต้องเปิดสาธารณะ
8. ใช้ worker เดียวเมื่อแต่ละ process ต้องโหลดโมเดลขนาดใหญ่
9. ตั้ง health check และตรวจ readiness ของ model/database/provider
10. deploy ผ่าน Pull Request และ commit ที่ตรวจสอบย้อนกลับได้
11. หลัง deploy ทำ smoke test ด้วยภาพตัวอย่างที่อนุญาตให้ใช้
12. เฝ้าดู error, latency, memory, drift และ distribution ของ unknown/low-confidence

### 12.12 วงจรพัฒนารอบถัดไป

```text
เก็บ feedback/ข้อผิดพลาด
  -> ขอ consent และติดป้ายโดยผู้เชี่ยวชาญ
  -> audit provenance/license/duplicates
  -> สร้าง split ตามแปลงหรือต้น
  -> ฝึก Candidate
  -> validation เลือกค่า
  -> sealed test หนึ่งครั้ง
  -> runtime/security tests
  -> review และ promote
  -> monitor หลัง deploy
```

ห้ามนำภาพ production เข้า Train อัตโนมัติ เพราะ label จาก prediction เดิมไม่ใช่ ground truth
ต้องผ่าน consent, de-identification และ expert annotation ก่อนเสมอ

## ส่วนที่ 13 Checklist ก่อนส่งมอบ

- [ ] หน้าเว็บหลักเปิดได้และไม่บังคับ Login
- [ ] `/api/health` ผ่าน
- [ ] อัปโหลดภาพและได้ผลจากโมเดลจริง
- [ ] หน้าโมเดลแสดง metric และข้อจำกัดตรงกับ artifact
- [ ] Weather/Satellite ระบุ source และ timestamp
- [ ] Tests ผ่านทั้งหมด
- [ ] ไม่มี `.env`, secret, database, uploads หรือ dataset ใน Git
- [ ] README และรายงานไม่อ้าง 95% โดยไม่มีผล independent test
- [ ] GitHub PR ผ่าน checks และ merge เข้า `main`
- [ ] Render deploy commit ล่าสุดและ health check ผ่าน

รายละเอียดเฉพาะเพิ่มเติมอยู่ที่ [คู่มือผู้ใช้](USER_GUIDE_TH.md),
[คู่มือฝึกโมเดล](TRAINING.md), [API Reference](API.md) และ
[คู่มือ Render](../deploy/render/README.md)
