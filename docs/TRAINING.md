# แผน Train AI — CassavaGuard

เอกสารนี้เป็น runbook สำหรับฝึก ตรวจ และอนุมัติโมเดล โดยแยกหน้าที่เพื่อลด
confirmation bias และป้องกันการนำคะแนนทดลองไปใช้เกินขอบเขต

## การแบ่งบทบาท

| บทบาท | หน้าที่ | เกณฑ์ส่งมอบ |
|---|---|---|
| Data researcher | ตรวจแหล่งข้อมูล license, label taxonomy, duplicates และ domain | data provenance + duplicate audit |
| Model engineer | train baseline/CNN โดยไม่อ่านผล test ก่อนเลือก checkpoint | model + validation selection record |
| Evaluation owner | เปิด test หลัง model freeze แล้วคำนวณ metrics | test report ที่ไม่ถูกใช้เลือก model |
| Independent QA | ตรวจ class order, feature/preprocess parity, SHA-256, ONNX parity | `verify_artifacts.py` ผ่าน |
| Agronomy reviewer | ตรวจ label mapping และกำหนด pilot thresholds | ลงนามอนุมัติ external Thai-field set |

Model engineer ไม่ควรเป็นผู้เปลี่ยน acceptance threshold หลังเห็น test result หากต้อง
เปลี่ยน threshold ให้สร้าง test set รุ่นใหม่สำหรับการยืนยันครั้งถัดไป

## ขอบเขตข้อมูลและ label

- TFDS `cassava:0.1.0`: raw split 5,656 train / 1,889 validation / 1,885 test
- label ต้นทาง: `cbb, cbsd, cgm, cmd, healthy`
- runtime order: `healthy, cbb, cbsd, cmd, cgm`
- exact duplicate groups ที่ label ขัดแย้งถูก quarantine ทั้งกลุ่ม
- CNN ใช้ SHA-256 ของ decoded pixels สำหรับ exact duplicate และใช้ conservative
  perceptual audit เพิ่มอีกชั้น: dHash 64-bit ต้องตรงกันและ pHash 64-bit ต้องห่าง
  ไม่เกิน 3 bits จึงจะเป็น candidate ข้าม split
- perceptual candidate ทุกกลุ่มถูก quarantine ก่อนสร้าง train/validation/test loader
  และบันทึก manual-review manifest พร้อม SHA-256; กระบวนการนี้ตรวจเฉพาะโครงสร้างภาพ
  ไม่อ่าน prediction หรือคะแนน test
- Brown Leaf Spot ใช้ auxiliary binary head แยกจาก 5-way softmax ฝึกจาก CCMT raw
  Cassava subset ภายใต้ CC BY 4.0
- White Leaf Spot และ Whitefly มี local experimental head ที่รันได้จริงแล้ว
  แต่คืนผลแยกใน `auxiliary_findings`, บังคับ expert review และ
  `production_eligible=false`
- อีก 5 conditions ไม่ถูกคำนวณเป็นผลวินิจฉัยจนกว่าจะมีข้อมูลและโมเดลตรงชนิดงาน
  (`object_detection` สำหรับ mealybug และ paired multimodal labels สำหรับ stress)
- endpoint ทำนายส่ง probability เฉพาะ 5 trained classes จึงไม่มีการอ้าง
  end-to-end 13-class accuracy

### ข้อมูลจริงของ 7 conditions ที่เตรียมแล้ว

รันตัวเตรียมข้อมูล (ดาวน์โหลดประมาณ 7.84 GB และตรวจ provider checksum ทุกไฟล์):

```bash
.venv/bin/python backend/training/prepare_extended_dataset.py --workers 16
```

ผลลัพธ์อยู่ใน `backend/training/data/extended_conditions/` และมี
`dataset_manifest.json` บันทึกแหล่งที่มา, license, hash และสิทธิ์การใช้:

- CAD: Embrapa PDDB 1 ภาพจริง — ยังไม่พอฝึก
- White Leaf Spot: Embrapa PDDB 115 ภาพจริง — ฝึก candidate ได้เมื่อเพิ่ม
  negative set แต่ยังไม่มี independent test set; license เป็น CC BY-NC 4.0
- Whitefly: Mendeley v3 จำนวน 3,000 ภาพจริง + 3,000 PASCAL VOC XML
  พร้อม bounding box ภายใต้ CC BY 4.0
- Mealybug: ภาพจริง CIAT 3 ภาพจาก Wikimedia Commons ภายใต้ CC BY-SA 2.0
  เป็น image-level label และยังไม่มี bounding box
- Nutrient Deficiency: ภาพจริง cassava zinc deficiency 1 ภาพจาก Bugwood
  ภายใต้ CC BY 3.0
- SED และ Water Stress: ยังไม่พบชุดภาพจริงติดป้ายที่เปิดให้นำกลับมาใช้ได้

มีภาพ ImageGen ตั้งต้นคลาสละ 1 ภาพสำหรับ CAD, White Leaf Spot, SED,
Mealybug, Water Stress และ Nutrient Deficiency โดยเก็บแยกใต้ `synthetic/`
และ manifest บังคับ `evaluation_allowed=false`,
`production_evidence_allowed=false`, `expert_review_required=true`
ภาพเหล่านี้ใช้ได้เฉพาะ augmentation ใน train split หลังผู้เชี่ยวชาญตรวจ
ห้ามนำไป validation/test หรือใช้อ้างความแม่นยำ

ฝึก White Leaf Spot candidate (local experimental auxiliary เท่านั้น):

```bash
.venv/bin/python backend/training/train_white_leaf_spot.py
```

ตรวจ tile plan โดยไม่สร้างไฟล์ภาพก่อน:

```bash
backend/training/.venv-detector/bin/python \
  backend/training/train_whitefly_detector.py \
  --prepare-only --dry-run --tile-size 2000
```

สร้าง smoke dataset จริงเพียง 1 source image ต่อ split/abundance เพื่อตรวจ JPEG,
label และพื้นที่:

```bash
backend/training/.venv-detector/bin/python \
  backend/training/train_whitefly_detector.py \
  --prepare-only --smoke-prepare --tile-size 2000
```

เมื่อเปรียบเทียบหลาย tile sizes ต้องใช้ cache คนละ directory เพื่อไม่ลบข้อมูลของ
งานที่กำลังฝึก เช่น candidate 1,000 px:

```bash
backend/training/.venv-detector/bin/python \
  backend/training/train_whitefly_detector.py \
  --prepare-only --tile-size 1000 --tile-jpeg-quality 92 \
  --tiled-dataset-root \
  backend/training/data/extended_conditions/whitefly_yolo_tiled_1000
```

ฝึก Whitefly detector จาก 3,000 ภาพจริง/212,948 usable bounding boxes:

```bash
python3.12 -m venv backend/training/.venv-detector
backend/training/.venv-detector/bin/python -m pip install \
  -r requirements-training-detector.txt
backend/training/.venv-detector/bin/python \
  backend/training/train_whitefly_detector.py \
  --device cpu --epochs 3 --imgsz 640 --batch-size 4 \
  --tile-size 2000 --mosaic 0 --scale 0.15 --translate 0.05
```

บน Apple M5 ชุด dense-object นี้ CPU batch 4 เร็วและเสถียรกว่า MPS ใน benchmark
จริง: CPU ประมาณ 34 นาที/epoch ส่วน MPS ประมาณ 60 นาที/epoch และ YOLO26
target assigner เคยหยุดด้วย tensor-shape mismatch ที่ batch 349/384 จึงไม่ใช้ MPS
เป็นค่าแนะนำรอบปัจจุบัน การลอง 1,000 px tiles ลดจำนวน object ต่อ tile แล้วแต่ MPS
ยังหยุดด้วย shape mismatch เดิมที่ batch 9 จึงเป็น backend failure ไม่ใช่หลักฐานว่า
annotation เสีย คำสั่ง train จะ reuse tile tree เดิมเมื่อ manifest, seed, tile size,
JPEG quality, จำนวน tile ที่คำนวณจาก source geometry และไฟล์ image/label ทุกคู่
ตรงกัน; ใช้ `--rebuild-tiles` เมื่อต้องการสร้างใหม่โดยตั้งใจ

ตัวแปลงข้อมูลรุ่นปัจจุบันจัด split ระดับ **contiguous acquisition run** โดยเริ่ม
run ใหม่เมื่อเวลาถ่ายห่างจากภาพก่อนหน้าเกิน 15 นาที ไม่ใช้ fixed clock-window
เพราะภาพที่ถ่ายติดกันคนละฝั่งของนาทีที่ 15 อาจเป็นฉากเดียวกัน ข้อมูลนี้มีเพียง
9 acquisition runs จึงได้ประมาณ 1,920 train / 648 validation / 432 held-out test
และทุก holdout มีภาพครบทั้ง 3 abundance groups อย่างน้อยกลุ่มละ 100 ภาพ
การจัดกลุ่มใช้เฉพาะเวลา/จำนวน/abundance label ไม่ใช้ผลโมเดล และบันทึก provenance
ทุกภาพใน `whitefly_yolo_tiled/split_manifest.json` อย่างไรก็ตาม upstream ไม่มี
plant/leaf ID จึงยังยืนยันไม่ได้ว่าไม่มีต้นเดียวกันข้ามคนละ acquisition run

tile pipeline ใช้ non-overlapping 2,000×2,000 px และ padding สีเทาไม่เกิน 80 px
กับ source 4,000×1,920/1,920×4,000 จึงได้ 2 tiles ต่อภาพ รวม 6,000 tiles:

- train 3,840 tiles / 121,711 boxes / 256 empty real-negative tiles /
  1,740 center-assigned boxes ถูก clip ที่ขอบ
- validation 1,296 tiles / 58,250 boxes / 37 empty real-negative tiles /
  993 boxes ถูก clip ที่ขอบ
- test 864 tiles / 32,987 boxes / 58 empty real-negative tiles /
  619 boxes ถูก clip ที่ขอบ

ทุก box ถูก assign เพียงครั้งเดียวตามจุดศูนย์กลางและ clip ที่ขอบ tile; ผล dry-run
ตรวจ conservation ครบ 212,948 boxes และไม่พบ acquisition run ข้าม split
pipeline นี้อ่านเฉพาะข้อมูลจริงจาก Mendeley ไม่อ่านโฟลเดอร์ synthetic
มี 3,352/212,948 boxes (1.57%) ที่คร่อมเส้นแบ่ง tile: box ถูก label เฉพาะ tile
ที่มีจุดศูนย์กลางจึงอาจเหลือ partial fragment ที่ไม่มี label ใน tile ข้างเคียง
ต้องรายงาน caveat นี้และทำ boundary-policy ablation บน validation ก่อนใช้จริง

candidate 1,000 px ใช้ split/source เดิม ได้ 24,000 tiles (train 15,360 / validation
5,184 / test 3,456) และ conservation ครบ 212,948 boxes เช่นเดิม median object ที่
input 640 เพิ่มจาก 6.72×7.04 px เป็น 14.08×14.72 px แต่ boundary-clipped boxes
เพิ่มเป็น 8,771 (4.12%) และมี real negative tiles มากขึ้น จึงต้องคัดเลือกจาก
validation ไม่ใช่ถือว่าดีกว่าโดยอัตโนมัติ

ผลวัด prepare บน Apple M5: full dry-run 20.116 วินาที; smoke 18 tiles ใช้
1.966 วินาที/10.64 MB และ full materialization จริงที่ JPEG quality 92 ใช้ประมาณ
8 นาที/4.9 GB ส่วน candidate 1,000 px ใช้ 433.759 วินาที/5.22 GB งานเดิม 9 epochs ที่ 640 px
ใช้ 4.3 ชั่วโมง; เมื่อเพิ่มเป็น 3,840 train tiles ที่ 1,280 px คาดหยาบราว
30–40 ชั่วโมงต่อ 9 epochs หรือมากกว่า 100 ชั่วโมงต่อ 30 epochs จึงควรเริ่ม
3-epoch validation-only pilot และวัด throughput จริงก่อนรันข้ามคืน

training pipeline เลือก `best.pt` จาก validation เท่านั้น แล้วเลือก confidence
threshold จาก maximum `min(precision, recall, F1)` และใช้ F1 เป็น tie-break ของ
checkpoint เดียวกัน กำหนด validation
gate ให้ precision, recall และ F1 ต้อง ≥75% ก่อนเปิด held-out test หาก validation
ไม่ผ่านจะเขียนเพียง `runs/<run>/candidate_metrics.json` และไม่แตะ test/ไม่เขียนทับ
runtime artifact ระหว่างเปรียบเทียบ tile/model ให้ใส่ `--validation-only`; แม้
validation ผ่าน gate ระบบจะบันทึก candidate แต่ seal test ต่อ เมื่อ freeze
checkpoint, threshold, NMS และ tile geometry ครบแล้วจึงรัน final candidate โดยไม่ใส่
flag นี้เพื่อเปิด test ครั้งเดียว และคำนวณ test P/R/F1
ที่ threshold ที่ freeze จาก validation (ไม่ optimize threshold บน test) และ publish
experimental artifact เฉพาะเมื่อ test P/R/F1 ผ่าน 75% ทั้งหมด การใช้ test gate
เป็นการยอมรับ/ปฏิเสธ final candidate ไม่ใช่การเลือก checkpoint หรือ threshold;
หากไม่ผ่านต้องเก็บ holdout ใหม่ก่อนรอบพัฒนาถัดไปเพื่อไม่ iterate บน test เดิม

fast pipeline smoke ใช้ 6 train/6 validation tiles ที่ 320 px ฝึก 1 epochสำเร็จ
และ Ultralytics อ่าน image/label ได้ครบ การรันนี้มีไว้ตรวจ plumbing เท่านั้น
คะแนนจาก smoke sample เล็กมากไม่ใช่ performance metric และห้ามนำไปอ้าง

Ultralytics training dependency เป็น AGPL-3.0 ต้องปฏิบัติตาม AGPL หรือซื้อ
commercial license ก่อนนำ dependency/artifact ไปกระจายในระบบ proprietary

TFDS catalog ไม่ระบุ license ของภาพอย่างชัดเจน จึงบันทึกเป็น
`unknown/pending upstream image-license verification`; ต้องตรวจสิทธิ์ก่อนใช้งานเชิงพาณิชย์

## Pipeline

```text
TFDS official splits
  -> exact + perceptual duplicate/conflicting-label quarantine
  -> immutable manual-review manifest
  -> train only: all remaining rows + class weights where supported + augmentation
  -> validation only: hyperparameters/checkpoint + temperature calibration
  -> freeze model
  -> test once: final report
  -> atomic artifact publish + SHA-256 metadata
  -> framework/ONNX parity + runtime contract verification
```

Classical baseline ใช้ shared 12-feature contract จาก
`backend/services/feature_extraction.py`. CNN ใช้ EfficientNet-B0 transfer learning,
Pillow bilinear resize แบบเดียวกับ serving, NCHW float32 `[0,255]`, validation
macro-F1 early stopping และ temperature scaling

Fusion เป็นการทดลองเท่านั้น เพราะสร้าง health/NDVI จาก target label และ downstream
demo engines ยังขึ้นกับวันที่รัน จึงต้องคง `USE_FUSION=false`,
`production_eligible=false`, `reproducible=false` จนมีข้อมูลจริงแบบ
photo + field + timestamp + satellite/soil

## วิธีรัน

ใช้ Python 3.11 หรือ 3.12 และ GPU สำหรับ CNN เส้นทาง Apple silicon ที่ใช้สร้าง
artifact ปัจจุบัน:

```bash
python3.12 -m venv backend/training/.venv-torch
backend/training/.venv-torch/bin/python -m pip install -r requirements-training-torch.txt
backend/training/.venv-torch/bin/python backend/training/train_cnn_torch.py --device mps
```

ปรับจำนวน epoch/batch ได้:

```bash
backend/training/.venv-torch/bin/python backend/training/train_cnn_torch.py \
  --device mps --epochs-head 5 --epochs-fine 14 --batch-size 32
```

ตรวจ artifact ซ้ำโดยไม่ train:

```bash
.venv/bin/python backend/training/verify_artifacts.py --require-cnn
.venv/bin/python backend/training/verify_artifacts.py --include-fusion
```

ฝึก fusion เฉพาะงาน ablation:

```bash
ENVIRONMENTAL_DATA_MODE=synthetic \
  .venv-training/bin/python backend/training/train_all.py --include-experimental-fusion
```

ฝึก Brown Leaf Spot auxiliary head (ดาวน์โหลดภาพ CCMT จริงและตรวจ SHA-256):

```bash
.venv/bin/python backend/training/train_brown_leaf_spot.py
```

## ผลที่ยืนยันในเครื่องนี้

- active family: EfficientNet-B0 CNN — เลือก checkpoint จาก validation เท่านั้น
- validation: accuracy 79.10%, macro-F1 72.25%, ECE 3.18%
- held-out test: accuracy 81.38%, macro-F1 74.74%, ECE 4.34%
- test recall: Healthy 85.71%, CBB 65.58%, CBSD 78.36%, CMD 86.00%, CGM 78.66%
- effective rows หลัง quarantine: 5,620 / 1,876 / 1,874
- PyTorch/ONNX parity: argmax ตรง, max absolute logit difference `7.15e-06`
- `verify_artifacts.py --require-cnn`: ผ่าน
- `verify_artifacts.py --include-fusion`: ผ่านครบทุก bundle รวม White Leaf Spot
  และ Whitefly ONNX detector (17 executable model entries)
- classical fallback: held-out test accuracy 59.65%, macro-F1 47.04%
- experimental fusion (ปิด serving): validation-selected Gradient Boosting,
  validation macro-F1 41.81%, held-out test macro-F1 33.40%
- Brown Leaf Spot auxiliary head:
  - effective images หลัง exact SHA-256 dedup: 4,887
  - split: 3,420 train / 733 validation / 734 held-out test
  - validation macro-F1 88.95%, ROC-AUC 96.81%
  - held-out test macro-F1 85.77%, ROC-AUC 95.88%
  - test Brown Leaf Spot precision 80.74%, recall 73.65%
  - CCMT ไม่มี field/plant group ID จึงยังตัด same-scene leakage ออกไม่ได้ทั้งหมด
- White Leaf Spot experimental auxiliary:
  - 430 train / 92 validation / 93 held-out test
  - validation macro-F1 98.15%, held-out test macro-F1 96.40%
  - test White Leaf Spot recall 88.89%
  - คะแนนอาจสูงเกินจริงเพราะ positive/negative มาจากคนละ source/camera
    จึงไม่ใช้เป็น production evidence
- Whitefly detector artifact ปัจจุบัน (YOLO26n, 640 px, baseline 1 + fine-tune
  9 epochs; **legacy evaluation — ต้อง retrain ด้วย acquisition-run split**):
  - 1,931 train / 619 validation / 450 held-out test
  - validation-selected checkpoint: precision 33.21%, recall 29.44%,
    mAP50 14.92%, mAP50-95 3.75%
  - held-out test: precision 49.85%, recall 41.47%, mAP50 31.53%,
    mAP50-95 8.50%
  - ดีขึ้นจาก smoke baseline test mAP50 7.02% ประมาณ 4.5 เท่า
  - audit พบว่า split ของ artifact นี้ใช้ fixed 15-minute clock windows ทั้งที่
    ข้อมูลจริงมีเพียง 9 contiguous acquisition runs จึงมีโอกาสที่ adjacent frames
    ของ run เดียวกันข้าม split และทำให้คะแนนข้างต้น optimistic; ตัวเลข measured
    เดิมไม่ถูกแก้ แต่ห้ามใช้เป็น release evidence จน retrain/evaluate ใหม่
  - runtime confidence `0.19419419` เลือกจาก maximum F1 บน validation เท่านั้น
    (validation F1 31.28%, precision 33.76%, recall 29.13%); test ไม่ได้ใช้เลือก
  - artifact รัน ONNX ได้และคืนกรอบ/จำนวนจริง แต่ recall และ mAP50-95
  ยังต่ำกว่า release gate จึงเปิดเฉพาะ local experimental review mode

### CNN leakage sensitivity audit (2026-08-01)

artifact CNN ปัจจุบันถูกฝึกด้วย exact SHA-256 quarantine รุ่นเดิม การ audit แบบ
perceptual ภายหลังพบ candidate เพิ่ม 2 กลุ่มที่ exact hash จับไม่ได้:

- `train/cbsd/train-cbsd-55.jpg` กับ
  `validation/healthy/validation-healthy-82.jpg` เป็นภาพเดียวกันที่ re-encode
  แต่ label ขัดแย้ง จึงต้อง quarantine ทั้งคู่ในงานฝึกครั้งถัดไป
- `validation/cmd/validation-cmd-138.jpg` กับ
  `test/cmd/test-cmd-592.jpg` เป็น same-scene/re-encoded copy และ label เดียวกัน
  จึงต้องคงตัวแรกและตัด test copy ในงานฝึกครั้งถัดไป

หลังใช้ contract ใหม่ จำนวนที่ยืนยันจาก full audit เป็น 5,619 train / 1,875 validation /
1,873 test (exact removal เดิม 36/13/11 และ perceptual removalเพิ่ม 1/1/1)
โดยยังไม่รวมผล manual review ที่อาจเปลี่ยนสถานะ candidate

เพื่อไม่เขียนทับ measured metric เดิม ได้คำนวณ post-hoc sensitivity โดยตัดเฉพาะ
test copy ที่พบออกจาก confusion matrix: 1,524/1,873 = **81.3668%**,
macro-F1 74.7330% และ Wilson 95% CI **79.5398–83.0653%** ขอบล่างยังสูงกว่า
เป้าหมาย 75% อย่างไรก็ตามตัวเลขนี้เป็น sensitivity analysis ไม่ใช่ผลจาก artifact
ที่ retrain แล้ว จึงยังห้ามอ้างว่า artifact ปัจจุบัน leakage-free และ
`verify_artifacts.py --cnn-only` จะแสดงสถานะ warning จนกว่าจะ retrain ด้วย pipeline ใหม่

Whitefly เป็น object detection จึงไม่ใช้ `accuracy >75%` เป็นเกณฑ์หลัก เป้าหมาย
ที่ตรวจสอบได้ควรระบุ precision, recall, mAP50 และ mAP50-95 พร้อม confidence
threshold ที่เลือกจาก validation เท่านั้น เนื่องจากมีเพียง 9 runs รอบถัดไปควร
รายงาน grouped cross-validation ระดับ acquisition run เพิ่มจาก single split และ
เก็บ Thai-field runs ใหม่ที่มี whitefly, แมลงชนิดอื่น และใบที่ไม่มีแมลงเป็น negative
ก่อนตั้งเป้า precision/recall ≥75% ห้ามใช้ synthetic image ใน validation/test

local development เปิด `USE_CNN=true` แล้ว แต่ยังคง
`AI_FIELD_VALIDATED=false` เพราะยังไม่มี independent Thai-field evaluation

## Release gates

ก่อน pilot ให้ agronomy owner อนุมัติเกณฑ์อย่างน้อย:

- grouped Thai-field holdout แยก field/plant/session/date/camera
- exact/perceptual cross-split duplicate audit ผ่าน และ candidate ทุกกลุ่มมี
  quarantine decision + manual-review manifest
- held-out accuracy > 0.75 และ Wilson 95% lower bound > 0.75
- macro-F1 lower 95% CI ≥ 0.60
- recall ทุก class lower 95% CI ≥ 0.50
- any-disease sensitivity ≥ 0.90 และ healthy specificity ≥ 0.80
- ECE ≤ 0.10
- non-cassava/blur/dark OOD มี abstention test
- framework/ONNX argmax ตรง และ logits `rtol/atol <= 1e-4`
- ไม่มี class/feature/preprocessing/hash contract mismatch

เกณฑ์เหล่านี้เป็นข้อเสนอเริ่มต้น ไม่ใช่มาตรฐานทางคลินิกหรือกฎหมาย และต้องให้ผู้เชี่ยวชาญ
พืชกำหนดตามต้นทุน false positive/false negative จริง

## Primary sources

- [TFDS Cassava catalog](https://www.tensorflow.org/datasets/catalog/cassava)
- [TFDS Cassava builder source](https://github.com/tensorflow/datasets/blob/master/tensorflow_datasets/image_classification/cassava.py)
- [iCassava 2019 paper](https://arxiv.org/abs/1908.02900)
- [Keras transfer learning guide](https://keras.io/guides/transfer_learning/)
- [Keras EfficientNet API and input contract](https://keras.io/api/applications/efficientnet/efficientnet_models/)
- [Keras ONNX export API](https://keras.io/api/models/model_saving_apis/export/)
- [scikit-learn cross-validation guidance](https://scikit-learn.org/stable/modules/cross_validation.html)
- [scikit-learn data leakage guidance](https://scikit-learn.org/stable/common_pitfalls.html)
- [ONNX Runtime documentation](https://onnxruntime.ai/docs/)
- [Temperature scaling paper](https://proceedings.mlr.press/v70/guo17a.html)
- [CCMT primary dataset (CC BY 4.0)](https://doi.org/10.17632/bwh3zbpkpv.1)
- [Cassava Whitefly Dataset v3 (CC BY 4.0)](https://doi.org/10.17632/5g38399z9p.3)
- [Embrapa PDDB (CC BY-NC 4.0)](https://doi.org/10.48432/XA1OVL)
- [CIAT cassava mealybug photograph (CC BY-SA 2.0)](https://commons.wikimedia.org/wiki/File:Mealybug2_(4288382696).jpg)
- [Bugwood cassava zinc deficiency image 5356709 (CC BY 3.0)](https://www.invasive.org/browse/detail.cfm?imgnum=5356709)

External-domain candidates ต้องให้ผู้เชี่ยวชาญยืนยัน taxonomy:
[India dataset](https://data.mendeley.com/datasets/3832tx2cb2/1) และ
[Makerere dataset](https://doi.org/10.7910/DVN/T4RB0B)
