# CassavaGuard AI

**ภาษาไทย** | [English](README_EN.md)

เว็บแอปช่วยคัดกรองสุขภาพมันสำปะหลังจากภาพถ่ายด้วย AI รองรับบัญชีผู้ใช้
ประวัติส่วนตัว ภาพต้นฉบับ Heatmap และ Chatbot ให้คำแนะนำ

[เปิดแอป](https://cassavaguard-render.onrender.com/) ·
[คู่มือ Deploy บน Render](deploy/render/README.md) ·
[คู่มือการฝึกโมเดล](docs/TRAINING.md) ·
[Security](SECURITY.md)

> [!IMPORTANT]
> ผลจาก AI เป็นเครื่องมือช่วยคัดกรอง ไม่ใช่ผลยืนยันจากห้องปฏิบัติการ
> ห้ามใช้ผลเพียงอย่างเดียวเพื่อตัดสินใจถอนต้น ใช้สารเคมี หรือดำเนินการที่มีความเสี่ยง

## สถานะระบบปัจจุบัน

| รายการ | สถานะ |
|---|---|
| รูปแบบแอป | วิเคราะห์จากภาพเป็นหลัก (image-only) |
| Login | บังคับใช้บน Production |
| การสมัครสมาชิก | เปิดให้สมัครบัญชีทั่วไป |
| Guest mode | ปิดบน Production |
| โมเดลที่ให้บริการ | EfficientNet-B3 ONNX, 5 คลาส |
| Test accuracy | **88.15%** (1,651/1,873 ภาพ) |
| Macro-F1 | **84.59%** |
| Wilson 95% CI | **86.60–89.53%** |
| เป้าหมายการพัฒนา | **90%** |
| Ensemble candidate | **90.55%**; ยังไม่ deploy และ Wilson lower bound 89.14% |
| Serving policy | `review_only` |
| Automated tests | **122 tests ผ่าน** |

ระบบ Field, Satellite, Weather และ Soil ถูกนำออกจากประสบการณ์ใช้งานปัจจุบัน
การวิเคราะห์จึงไม่ดึงข้อมูลสิ่งแวดล้อมมาปรับผลเบื้องหลัง

## ความสามารถหลัก

- สมัครสมาชิก เข้าสู่ระบบ และแยกข้อมูลตามบัญชี
- ถ่ายภาพด้วยกล้องหรืออัปโหลด JPG, PNG และ WebP
- วิเคราะห์ Healthy, CBB, CBSD, CMD และ CGM
- แสดง Confidence, Top-3, Heatmap และเหตุผลประกอบ
- วิเคราะห์ภาพใบและภาพทั้งต้นแบบหลายมุม
- บันทึกภาพและผลตรวจลงประวัติส่วนตัว
- เปิดดูภาพต้นฉบับหรือ Heatmap ย้อนหลัง
- ส่งออกประวัติเป็น CSV หรือ PDF
- ลบผลวิเคราะห์พร้อมไฟล์ภาพที่เกี่ยวข้อง
- Chatbot ให้คำแนะนำ โดยแยกจากผลวินิจฉัยของโมเดลภาพ
- หน้าแสดงสถานะโมเดลและหลักฐานการประเมิน

## คลาสที่โมเดลหลักรองรับ

| Key | รายการ |
|---|---|
| `healthy` | ใบมันสำปะหลังสุขภาพดี |
| `cbb` | Cassava Bacterial Blight |
| `cbsd` | Cassava Brown Streak Disease |
| `cmd` | Cassava Mosaic Disease |
| `cgm` | Cassava Green Mite |

คลาสอื่นจะไม่ถูกสร้างเป็นผลวินิจฉัยหลักหากยังไม่มีข้อมูลติดป้ายและผลประเมินเพียงพอ

## ประสิทธิภาพของ AI

โมเดล Production ปัจจุบันคือ EfficientNet-B3 ที่ export เป็น ONNX และทำ inference
ด้วย ONNX Runtime บน CPU

| Metric | ผล |
|---|---:|
| Held-out test images | 1,873 |
| Correct predictions | 1,651 |
| Accuracy | 88.15% |
| Macro-F1 | 84.59% |
| ECE (15 bins) | 1.35% |
| Wilson 95% lower bound | 86.60% |

ข้อมูล Test ไม่ใช่ภาพสังเคราะห์ และมีการ quarantine exact/perceptual duplicates
อย่างไรก็ตาม upstream dataset ไม่มี field/plant/session identifier ครบถ้วน จึงยังไม่อ้างว่า
ไม่มี leakage ทุกประเภท และยังไม่มี independent Thai-field test ที่ครอบคลุมเพียงพอ

### เป้าหมาย 90%

Ensemble ที่เลือกน้ำหนักจาก Validation (`EfficientNet-B3 0.70 + ConvNeXt-Tiny 0.30`)
ได้ Test accuracy 90.55% และผ่านเป้าหมายแบบ point estimate แต่ Wilson 95% lower bound
อยู่ที่ 89.14% จึงยังไม่ถือว่าผ่านอย่างมั่นใจ นอกจากนี้ ensemble ยังไม่ถูกนำขึ้น Render
เพราะมีขนาดและ latency สูงกว่าโมเดล B3 ตัวเดียว

เป้าหมายจะถือว่าผ่านสมบูรณ์เมื่อ:

1. Held-out accuracy ≥90%
2. Wilson 95% lower bound ≥90%
3. Macro-F1 และ recall รายคลาสไม่ถดถอยอย่างมีนัยสำคัญ
4. ผ่าน independent Thai-field evaluation
5. Runtime บน Render อยู่ในขอบเขตที่ใช้งานจริงได้

ค่า 75% ใน training pipeline เป็น release safety floor เดิม ไม่ใช่เป้าหมายความสำเร็จ 90%

## Login และการเก็บข้อมูล

ข้อมูลถูกแบ่งเป็นสองส่วน:

### PostgreSQL

เก็บบัญชีผู้ใช้ รหัสผ่านแบบ hash เวลา ผลวิเคราะห์ Confidence ความน่าจะเป็น
โมเดลที่ใช้ และ `user_id` ของเจ้าของข้อมูล

### Persistent Disk

เก็บภาพต้นฉบับและ Heatmap แยกตามบัญชี:

```text
/var/data/uploads/users/{user_id}/
/var/data/uploads/users/{user_id}/heatmaps/
```

- ผู้ใช้ทั่วไปเรียกดูได้เฉพาะ Prediction ของตนเอง
- URL รูปเป็น signed URL อายุสั้น
- การเข้าถึง ID ของผู้ใช้อื่นตอบกลับ `404`
- การลบ Prediction จะลบทั้ง record และไฟล์ที่เกี่ยวข้อง
- หาก transaction ฐานข้อมูลล้มเหลว ระบบจะลบไฟล์ค้าง

บน Render ต้องตั้ง `DATA_DIR=/var/data` และติดตั้ง Persistent Disk ไม่เช่นนั้นไฟล์ภาพ
อาจหายเมื่อ service restart หรือ deploy ใหม่

## เริ่มใช้งานบนเครื่อง

ต้องมี Python 3.11+, Node.js และ Git

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

เปิด:

- แอป: <http://127.0.0.1:8800/>
- API Docs: <http://127.0.0.1:8800/api/docs>
- Health: <http://127.0.0.1:8800/api/health>

## ทดสอบระบบ

```bash
source .venv/bin/activate
python backend/training/verify_artifacts.py --cnn-only
python backend/training/quality_gate.py
python -m pytest -q
npm run build
git diff --exit-code -- frontend/dist
```

ผลที่คาดหวังในเวอร์ชันนี้คือ `122 passed` และ frontend build สำเร็จ

## Deploy บน Render

Repository มี [render.yaml](render.yaml) สำหรับสร้าง Web Service, PostgreSQL และ
Persistent Disk

Environment สำคัญ:

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

Secret ที่ต้องตั้งใน Render:

```text
SECRET_KEY=<ค่าสุ่มอย่างน้อย 32 bytes>
BOOTSTRAP_ADMIN_EMAIL=<อีเมลผู้ดูแล>
BOOTSTRAP_ADMIN_PASSWORD=<รหัสผ่านผู้ดูแลอย่างน้อย 10 ตัวอักษร>
GROQ_API_KEY=<ใส่เมื่อต้องการใช้ Chatbot จริง>
```

คำสั่งที่ Render ใช้:

```text
Build Command:     bash deploy/render/build.sh
Pre-deploy:        bash deploy/render/predeploy.sh
Start Command:     bash deploy/render/start.sh
Health Check Path: /api/health
```

หลัง deploy ให้ตรวจว่า `/api/health` แสดง:

```json
{
  "status": "ok",
  "environment": "production",
  "auth_required": true,
  "database_backend": "postgresql",
  "persistent_upload_storage": true
}
```

## โครงสร้างโปรเจกต์

```text
backend/
  api/                 FastAPI routes
  core/                Authentication, authorization, rate limiting
  models/              SQLAlchemy models
  services/            AI inference and application services
  ml_models/           Published model artifacts and metrics
  training/            Training, evaluation and artifact verification
frontend/
  src/                 React UI source
  dist/                Production bundle
migrations/            Alembic database migrations
deploy/render/          Render build, predeploy and startup scripts
tests/                  API, security, model and deployment tests
docs/                   Training and operational documentation
```

## ความปลอดภัยและข้อจำกัด

- Password ใช้ PBKDF2 พร้อม salt และไม่บันทึกรหัสผ่านแบบ plain text
- Access token และ asset token มีวันหมดอายุ
- Production ต้องมี `SECRET_KEY` ที่แข็งแรง
- โมเดลอยู่ในโหมด `review_only`
- ผล Confidence ไม่ใช่ความน่าจะเป็นของการยืนยันโรคในห้องปฏิบัติการ
- หลีกเลี่ยงการอัปโหลดใบหน้า เอกสาร ป้ายทะเบียน หรือข้อมูลส่วนบุคคลที่ไม่เกี่ยวข้อง
- API key ที่เคยเผยแพร่ในข้อความหรือ commit ต้อง revoke และสร้างใหม่

## License และข้อมูลภายนอก

License ของ repository ไม่ได้ให้สิทธิ์ใช้งาน third-party datasets หรือโมเดลทั้งหมดโดยอัตโนมัติ
ตรวจ [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) ก่อนแจกจ่ายหรือใช้เชิงพาณิชย์

---

**สรุป:** ระบบ Production ใช้ EfficientNet-B3 Accuracy 88.15% ส่วนเป้าหมายการพัฒนา
คือ 90% ปัจจุบัน ensemble candidate ได้ 90.55% แต่ยังไม่ผ่าน Wilson lower bound
และยังไม่ถูกนำไปให้บริการจริง
