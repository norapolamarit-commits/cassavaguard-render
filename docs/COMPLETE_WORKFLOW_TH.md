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

## ส่วนที่ 12 Checklist ก่อนส่งมอบ

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
