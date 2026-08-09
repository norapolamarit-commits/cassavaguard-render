# แผนควบคุมประสิทธิภาพ CassavaGuard AI

## เป้าหมายและผู้ควบคุมงาน

Supervisor รับผิดชอบ acceptance gate, การแบ่งขอบเขตไฟล์, การรวมงาน และการอนุมัติ
ตัวเลขสุดท้าย เป้าหมายหลักคือ held-out accuracy ของโมเดลจำแนกภาพ 5 คลาสมากกว่า
75% โดยต้องรักษา macro-F1 และ calibration เพื่อไม่ให้ accuracy สูงจากคลาส CMD
ที่มีจำนวนมากกว่าเพียงคลาสเดียว

Baseline ที่ตรวจแล้ว:

| งาน | ชุดทดสอบจริง | Metric หลัก | Baseline |
|---|---:|---|---:|
| EfficientNet-B0 จำแนก 5 คลาส | 1,874 ภาพ | Accuracy | 81.38% |
| EfficientNet-B0 จำแนก 5 คลาส | 1,874 ภาพ | Macro-F1 | 74.74% |
| Calibration | 1,874 ภาพ | ECE 15 bins | 4.34% |
| CNN sensitivity หลังตัด near-duplicate test | 1,873 ภาพ | Accuracy | 81.37% |
| CNN sensitivity หลังตัด near-duplicate test | 1,873 ภาพ | Wilson 95% lower | 79.54% |
| Whitefly detector (legacy split; ต้อง retrain) | 450 ภาพ / 33,755 boxes | mAP50 | 31.53% |
| Whitefly detector (legacy split; ต้อง retrain) | 450 ภาพ / 33,755 boxes | Recall | 41.47% |

## การแบ่งสายงาน

1. **CNN quality:** ตรวจ split, duplicate quarantine, augmentation, checkpoint selection,
   class balance, ONNX parity และ metric contract ของโมเดล 5 คลาส
2. **Whitefly quality:** ใช้ precision/recall/mAP50/mAP50-95 ตรวจ detector โดยห้ามเรียก
   detection metric ว่า accuracy
3. **Runtime/Render:** วัด startup/inference, ปรับ session และ deployment โดยผล logits,
   class order, thresholds และ SHA-256 contract ต้องไม่เปลี่ยน
4. **Supervisor:** อนุมัติการเปิด test เพียงหลังเลือกจาก validation, รวมการแก้ไข,
   รัน regression tests และปฏิเสธตัวเลขที่ไม่สามารถทำซ้ำได้

## กฎข้อมูลและการประเมิน

- Train ใช้ข้อมูลจริงที่ติดป้าย; synthetic ใช้ augmentation ฝึกเท่านั้น
- Validation ใช้เลือก checkpoint, family, hyperparameter และ threshold
- Test เปิดหลัง selection และไม่ใช้วนปรับโมเดล
- เก็บ official TFDS split และ quarantine ทั้ง exact duplicate และ conservative
  perceptual candidate (dHash ตรง + pHash Hamming ≤3) ก่อนสร้าง loader
- Whitefly รอบถัดไปแบ่งทั้ง acquisition run: 1,920 train / 648 validation /
  432 test; ห้ามใช้ค่า legacy split เป็นหลักฐาน production
- รายงาน per-class metric และ confusion matrix ควบคู่กับ accuracy
- ไม่เปลี่ยน `AI_FIELD_VALIDATED=true` จนกว่าจะมี Thai-field holdout อิสระ

## Release gate อัตโนมัติ

```bash
.venv/bin/python backend/training/quality_gate.py
```

ค่าเริ่มต้นบังคับ:

- CNN held-out accuracy > 75%
- CNN held-out macro-F1 ≥ 70%
- CNN ECE ≤ 10%
- Whitefly held-out mAP50 ≥ 30%
- Whitefly held-out recall ≥ 40%
- checkpoint/threshold เลือกจาก validation และ `test_used_for_selection=false`
- CNN artifact hash, preprocessing, class order และ ONNX smoke test ผ่าน
- CNN Wilson 95% lower bound >75%

เกณฑ์ Whitefly เป็น regression floor ไม่ใช่ production target; detector ยังเป็น
review-only จนกว่าจะ retrain บน acquisition-run split, ปรับปรุงคุณภาพ และผ่าน
independent Thai-field evaluation ตัว gate จะแสดง warning ของ CNN/Whitefly และ
อนุญาตเฉพาะ release scope `review_only`

## ผลปรับ runtime

- startup-to-health median 4,863.7 → 1,916.7 ms (เร็วขึ้น 60.6%)
- decode JPEG 3,200×2,400 median 161.51 → 84.75 ms (เร็วขึ้น 47.5%)
- classifier thumbnail เหมือนเดิมทุกพิกเซล และ model session ถูก warm/reuse ใน
  process เดียวกับ Uvicorn
