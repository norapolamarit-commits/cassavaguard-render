# Deploy CassavaGuard AI จาก GitHub ไป Render

โฟลเดอร์นี้รวมไฟล์ deployment โดยเฉพาะ ส่วน source code ยังอยู่ที่ root ของ repository
เพื่อไม่สร้างสำเนาโค้ดที่อาจไม่ตรงกัน Render จะเรียก `build.sh`, `predeploy.sh`
และ `start.sh` จากโฟลเดอร์นี้

## สิ่งที่ bundle นี้ deploy

- FastAPI และ React SPA ใน Web Service เดียว
- PostgreSQL สำหรับบัญชี แปลง ผลวิเคราะห์ และข้อมูลดิน
- Persistent disk `/var/data` สำหรับภาพอัปโหลดและ heatmap
- EfficientNet-B0 CNN, Brown Leaf Spot, White Leaf Spot และ Whitefly runtime artifacts
- โหมด `AI_SERVING_MODE=review_only` และ `AI_FIELD_VALIDATED=false`
- ตรวจและ warm โมเดลใน process เดียวกับ Uvicorn เพื่อลด cold start โดยไม่โหลด
  ONNX/sklearn ซ้ำใน process ชั่วคราว

ข้อมูลฝึกประมาณ 8.4 GB, virtual environments, training runs และโมเดลเปรียบเทียบที่เกิน
GitHub 100 MB จะไม่ถูกส่งขึ้น GitHub หรือ Render

## 1. ตรวจไฟล์ก่อน push GitHub

รันจาก root ของโปรเจกต์:

```bash
python backend/training/verify_artifacts.py --require-cnn --include-fusion
python backend/training/quality_gate.py
npm ci
npm run build
python -m pytest -q
git status --short
```

`quality_gate.py` บังคับ CNN held-out accuracy มากกว่า 75% พร้อม macro-F1,
calibration และ integrity contract ส่วน Whitefly ใช้ mAP/recall เป็น regression
floor และยังคงเป็น review-only เนื่องจาก artifact เดิมต้อง retrain บน split แบบ
whole acquisition run

วัด runtime แบบอ่านอย่างเดียวและทำซ้ำได้ด้วย:

```bash
python deploy/render/benchmark_runtime.py --iterations 10
```

รายงานจะตรวจด้วยว่า classifier thumbnail จาก shared decode เหมือนเส้นทางเดิม
ทุกพิกเซล และวัด cold model load กับ repeated CNN inference แยกกัน

สำหรับ Whitefly tiled runtime ให้ส่งภาพจริงที่ต้องการวัดเข้า benchmark:

```bash
python deploy/render/benchmark_whitefly_tiling.py /path/to/whitefly-image.jpg --iterations 3
```

ผลนี้ใช้วัด latency, deterministic output และความถูกต้องของพิกัดกรอบเท่านั้น
จำนวน detection ที่ต่างกันระหว่าง single/tiled **ไม่ใช่** accuracy หรือหลักฐานว่าโมเดลดีขึ้น

ไฟล์ runtime ต่อไปนี้ต้องปรากฏใน commit:

```text
backend/ml_models/cnn_efficientnet_b0.onnx
backend/ml_models/cnn_metrics.json
backend/ml_models/brown_leaf_spot_hist_gb.joblib
backend/ml_models/brown_leaf_spot_metrics.json
backend/ml_models/white_leaf_spot_random_forest.joblib
backend/ml_models/white_leaf_spot_metrics.json
backend/ml_models/whitefly_detector.onnx
backend/ml_models/whitefly_detector.pt
backend/ml_models/whitefly_detector_metrics.json
```

อย่า commit `.env`, ฐานข้อมูล local, uploads, training data, `.venv` หรือ
`backend/ml_models/extra_trees.joblib` เพราะมีข้อมูลลับ/ข้อมูล runtime หรือเกินข้อจำกัด GitHub

## 2. สร้าง GitHub repository

```bash
git add README.md docs deploy render.yaml .github frontend/dist backend/ml_models
git add backend frontend scripts requirements*.txt package*.json alembic.ini migrations serve.py .env.example .gitignore
git commit -m "Prepare CassavaGuard for Render deployment"
git remote add origin https://github.com/OWNER/REPOSITORY.git
git push -u origin main
```

ตรวจรายการด้วย `git status` ก่อน commit ทุกครั้ง โดยเฉพาะกรณีโปรเจกต์มีงานเดิมที่ยังไม่ต้องการส่ง

## 3. สร้าง Render Blueprint

1. เข้า Render Dashboard และเชื่อมบัญชี GitHub
2. เลือก **New + → Blueprint**
3. เลือก repository ของ CassavaGuard
4. ใช้ `render.yaml` ที่ root ได้ทันที หรือกำหนด Blueprint Path เป็น
   `deploy/render/render.yaml`
5. กด Apply/Deploy และรอ build, migration, runtime verification และ health check ผ่าน

Blueprint ใช้ `starter` Web Service, `basic-256mb` PostgreSQL และ persistent disk
จึงมีค่าใช้จ่าย เหมาะกว่าชุด free สำหรับระบบที่ต้องเก็บภาพและฐานข้อมูลระยะยาว

## 4. ตรวจหลัง deploy

เปิด URL ที่ Render สร้างและตรวจ:

```text
https://YOUR-SERVICE.onrender.com/api/health
```

ผลควรมี `environment=production`, `environmental_data_mode=live` และ
`ai_serving_mode=review_only` แอปจะเปิดแดชบอร์ดทันทีโดยไม่ต้อง Login จากนั้นเปิด
**ระบบ & โมเดล** เพื่อตรวจว่า CNN, Brown Leaf Spot, White Leaf Spot และ Whitefly พร้อม

Blueprint กำหนด `AUTH_REQUIRED=false` และใช้บัญชีระบบร่วมกัน ผู้ที่เข้าถึง URL จะมี
สิทธิ์ใช้งานข้อมูลเดียวกันทั้งหมด จึงควรจำกัด URL ที่ระดับ Render/เครือข่ายหากมีข้อมูลสำคัญ

API docs ถูกปิดใน production โดยตั้งใจ หากต้องใช้ชั่วคราวให้เปลี่ยน
`ENABLE_API_DOCS=true` ใน Render แล้วปิดกลับเมื่อเสร็จ

## 5. ข้อกำหนด AI ที่ห้ามเปลี่ยนโดยไม่มีหลักฐานใหม่

- คง `AI_FIELD_VALIDATED=false` จนกว่าจะมีการประเมินอิสระกับภาพแปลงไทย
- `review_only` อนุญาตให้โมเดลทดลองทำงาน แต่ผลยังต้องตรวจซ้ำและไม่สร้าง alert อัตโนมัติ
- ห้ามนำภาพสังเคราะห์ไปใส่ validation/test หรืออ้างเป็นหลักฐานประสิทธิภาพ
- ตรวจเงื่อนไขใบอนุญาต Embrapa CC BY-NC และ Ultralytics AGPL ก่อนใช้งานเชิงพาณิชย์

อ้างอิงการตั้งค่าปัจจุบัน: [Render Blueprint Spec](https://render.com/docs/blueprint-spec),
[FastAPI on Render](https://render.com/docs/deploy-fastapi),
[Persistent Disks](https://render.com/docs/disks)
