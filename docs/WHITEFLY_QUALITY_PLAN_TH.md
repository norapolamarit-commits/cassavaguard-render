# แผนยกระดับ Whitefly detector ให้ P/R/F1 ≥ 0.75

สถานะวันที่ 1 สิงหาคม 2026: **ยังไม่ผ่าน acceptance gate และห้ามใช้เป็นผลอัตโนมัติ**

เอกสารนี้แยกงานประเมินออกจากงานฝึก โมเดลและ confidence threshold เลือกได้จาก
validation เท่านั้น ส่วน held-out test ต้องถูกล็อกจนกว่า supervisor จะอนุมัติหลัง
model/threshold/NMS/tile geometry ถูก freeze แล้ว

## ข้อสรุปสำหรับตัดสินใจ

ปัญหาหลักไม่ใช่เพียง YOLO มีขนาดเล็ก แต่คือการย่อภาพ 4,000 × 1,920 ลง 640 px
ทำให้ whitefly กึ่งกลางเหลือประมาณ **3.20 × 3.36 pixels** ขณะที่ detection head
ละเอียดสุดของ artifact ปัจจุบันมี stride 8 pixels แมลงจึงเล็กกว่าหนึ่ง feature cell

ลำดับงานที่มีหลักฐานรองรับมากที่สุดคือ:

1. freeze split และ hash manifest ก่อน เพราะ artifact ปัจจุบันไม่ได้ผูกกับ
   `split_manifest.json` และโฟลเดอร์ symlink ถูกสร้างใหม่หลัง artifact
2. สร้าง **slicing-aided training set** จาก train split เท่านั้น
3. ฝึก YOLO small-target candidate บน patch แล้วใช้ tiled inference แบบเดียวกัน
4. ฝึก Faster R-CNN + FPN บน patch เป็น independent architecture baseline
5. เลือกทุกอย่างจาก validation ด้วย `min(precision, recall, F1)` ไม่ใช้ test
6. เปิด test ครั้งเดียวเมื่อ validation ผ่าน P/R/F1 ≥ 0.75 และ supervisor อนุมัติ

การเปิด tiled inference ให้โมเดล full-frame เดิมทันที **ไม่ผ่าน**: benchmark 45 ภาพ
validation แบบกำหนด seed ล่วงหน้าพบว่า tile ทำให้ false positive เพิ่มมาก เพราะ
โมเดลไม่เคยเรียน distribution ของ patch-scale

## หลักฐานข้อมูลจริง

ข้อมูลต้นทางคือ [Cassava Whitefly Dataset](https://doi.org/10.17632/5g38399z9p.3)
ภายใต้ CC BY 4.0 ภาพถ่ายมาจาก NaCRRI, Namulonge, Uganda และแบ่งระดับ abundance
เป็น low/moderate/high ตามข้อมูลผู้เผยแพร่
[Mendeley Data](https://data.mendeley.com/datasets/5g38399z9p/2)

split manifest รุ่นปัจจุบันแบ่งตาม contiguous acquisition run ที่ห่างกันเกิน 15 นาที:

| Split | Images | Boxes | Acquisition runs |
|---|---:|---:|---:|
| Train | 1,920 | 121,711 | 5 |
| Validation | 648 | 58,250 | 2 |
| Test — locked | 432 | 32,987 | 2 |

upstream ไม่มี plant/leaf ID จึงยังพิสูจน์ไม่ได้ว่าต้นหรือใบเดียวกันไม่ข้าม run
และ validation มีเพียง 2 acquisition runs ทำให้ช่วงความเชื่อมั่นแบบ grouped กว้าง

### สถิติ validation ที่อธิบายความยาก

- boxes/image: mean 89.89, median 74, P95 232.3, maximum 539
- 15/648 ภาพมีมากกว่า 300 boxes
- normalized box width: median 0.70%, P90 1.35%
- normalized box height: median 0.73%, P90 1.41%
- เมื่อ letterbox เป็น 640: median 3.20 × 3.36 px, P90 4.80 × 4.80 px
- detector cap 100 มี theoretical maximum recall เพียง 69.36%
- cap 300 มี theoretical maximum recall 97.59% แต่เสีย ground truth ได้ 1,406 boxes
- cap 700 ครอบคลุม validation ทุกภาพและต้องใช้เป็น evaluation contract

ชุดข้อมูลนี้มีเฉพาะใบที่มี whitefly จึงยังไม่วัด false positive บนใบมันสำปะหลังสะอาด,
แมลงชนิดอื่น, คราบใบ, แสงสะท้อน และภาพไม่ใช่มันสำปะหลังได้ครบถ้วน

## Baseline และ benchmark ที่ไม่เปิด test

artifact ปัจจุบันเป็น YOLO26n, P3/P4/P5 heads (stride 8/16/32), full-frame 640,
train 9 epochs ต่อจาก smoke checkpoint และ `max_det=300`

stored validation ซึ่งมาจาก split รุ่นก่อน:

- Precision 0.3321
- Recall 0.2944
- F1 ประมาณ 0.3121
- mAP50 0.1492

metadata ไม่บันทึก split counts หรือ hash ของ split manifest จึงยัง reproduce คะแนนนี้
กับ tree รุ่นปัจจุบันไม่ได้

Validation-only benchmark ใช้ `backend/training/benchmarks/whitefly_validation_benchmark.py`, seed
`20260801`, abundance ละ 15 ภาพ รวม 45 ภาพ/3,048 boxes, IoU 0.50,
`max_det=700` และเลือก confidence จาก validation micro-F1:

| Candidate | P | R | F1 | AP50 | sec/image | ผล |
|---|---:|---:|---:|---:|---:|---|
| current YOLO26n full 640 | 0.490 | 0.347 | 0.407 | 0.267 | 0.248 | ไม่ผ่าน |
| current YOLO26n full 1280 | 0.507 | 0.532 | 0.519 | 0.440 | 0.210 | ไม่ผ่าน |
| current YOLO26n tile 1600/20% overlap | 0.273 | 0.320 | 0.295 | 0.165 | 0.720 | ไม่ผ่าน |
| current YOLO26n tile 1024/20% overlap | 0.016 | 0.139 | 0.029 | 0.002 | 1.483 | ไม่ผ่าน |

นี่เป็น architecture/inference audit บน validation ไม่ใช่ผล release และไม่ใช้ test
ข้อสรุปคือ tile ต้องใช้ร่วมกับ slicing-aided fine-tuning ไม่ใช่เปิดหลังฝึก full-frame
การเพิ่ม input จาก 640 เป็น 1,280 ช่วย F1 ประมาณ 0.112 แต่ยังห่างเป้าหมาย และที่
global confidence เดียวกัน low-abundance subset มี P `0.170`, R `0.408`, F1 `0.240`
จึงต้องใช้ per-abundance gate ไม่เช่นนั้นกลุ่ม super-abundance จะครอง micro metric

เมื่อรัน current YOLO26n full 640 บน validation รุ่นปัจจุบันครบ 648 ภาพ/58,250
boxes ได้ P `0.4773`, R `0.3486`, F1 `0.4029`, AP50 `0.2648` ที่ confidence
`0.1683` และ 0.154 sec/image ตัวเลขนี้เป็น baseline สำหรับ split รุ่นปัจจุบันและ
ยังต่ำกว่า acceptance gate มาก

รันยืนยันด้วย Ultralytics validator โดยตรงบน split เดียวกันและ `max_det=700` ได้
P `0.4764`, R `0.3544`, F1 `0.4064`, mAP50 `0.2703`, mAP50-95 `0.0709`
ซึ่งสอดคล้องกับ independent evaluator; ความต่างเล็กน้อยมาจาก NMS/curve protocol

### Patch-trained pilot บน acquisition-run validation

วันที่ 1 สิงหาคม 2026 ฝึก YOLO26n ต่อจาก COCO 1 epoch บน real-only tiles 2,000 px,
input 640, CPU batch 4, mosaic 0, scale 0.15 และ translate 0.05 โดยไม่เปิด test:

- Ultralytics validation summary: P `0.5433`, R `0.5112`, mAP50 `0.4224`,
  mAP50-95 `0.1378`
- operating point ที่เลือกด้วย maximum `min(P,R,F1)`: confidence `0.1892`,
  P `0.5261`, R `0.5268`, F1 `0.5264`
- split manifest SHA-256:
  `bc5852c746640fdf2acedbd0cb651619ba3e69db58af4f5cfac781d52983faad`
- validation gate 0.75 ยังไม่ผ่าน; `test.evaluated=false`

F1 เพิ่มจาก corrected full-frame baseline `0.4064` เป็น `0.5264` หลัง 1 epoch
จึงยืนยันว่า slicing-aided training มี learning signal แต่ยังไม่ใช่ release result
และต้องฝึก/คัดเลือกต่อจาก validation เท่านั้น

checkpoint กลางของ stage 2 บน tile 2,000 px (epoch 1/4) ให้ Ultralytics
P `0.6494`, R `0.5816`, F1 `0.6134`, mAP50 `0.5418` และ mAP50-95 `0.1809`;
ยังไม่ผ่าน gate และ test ยังไม่ถูกเปิด การเพิ่ม inference เป็น 1,280 px บน validation
เดียวกันกลับลดเป็น P `0.205`, R `0.317`, mAP50 `0.120` จึง reject configuration นี้

เพื่อแก้ tiny-object bottleneck ได้สร้าง candidate 1,000 px แยก cacheครบ 24,000
real-only tiles/212,948 boxes โดยไม่เปลี่ยน acquisition-run split ทำให้ median object
ที่ input 640 เพิ่มจากประมาณ 6.72×7.04 เป็น 14.08×14.72 pixels ขั้นต่อไปคือ
fine-tune บน CPU แล้วเปรียบเทียบ validation กับ candidate 2,000 px; Apple MPS
ถูกตัดออกหลัง target-assigner shape mismatch ซ้ำที่ batch 9

## หลักฐานจากงานวิจัย

[SAHI paper](https://arxiv.org/abs/2202.06934) เสนอให้แบ่งภาพ high-resolution
เป็น overlapping patches ทั้งตอน fine-tune และ inference แล้วรวมพิกัดด้วย NMS
งานดังกล่าวรายงาน AP เพิ่มจาก sliced inference และเพิ่มมากขึ้นอีกเมื่อฝึกด้วย slice;
ใช้ overlap 25% และ `max_detections=500` ในการทดลอง small/dense objects

[Feature Pyramid Networks](https://openaccess.thecvf.com/content_cvpr_2017/html/Lin_Feature_Pyramid_Networks_for_CVPR_2017_paper.html)
รองรับ multi-scale proposals และเป็นฐานของ Faster R-CNN สำหรับ small objects แต่
FPN ไม่แก้ปัญหาหาก input ยังคงย่อแมลงเหลือ 3 pixels ดังนั้น Faster R-CNN ต้องฝึกและ
ทดสอบบน patch เช่นกัน

[Ultralytics SAHI guide](https://docs.ultralytics.com/guides/sahi-tiled-inference/)
ยืนยัน workflow แบ่งภาพ, infer แต่ละ slice และ merge กลับ แต่ผล local benchmark
แสดงว่าต้อง fine-tune กับ scale เดียวกันก่อนนำมาใช้ใน CassavaGuard

## Experiment matrix ที่แนะนำ

ทุก candidate ใช้ train/validation manifest เดียวกัน, seed ชุดเดียวกัน, augmentation
budget เท่ากัน และไม่เปิด test

### A — YOLO slicing-aided fine-tuning (ลำดับแรก)

- backbone candidate: YOLO26n และ YOLO26s; เริ่มจาก `s` เพื่อเพิ่ม capacity
- source patch: 1,024 × 1,024 และ 1,280 × 1,280 px, overlap 25%
- network input: 960 หรือ 1,280; เป้าหมายให้ median short side ≥12 network pixels
- รวม full-frame train images 10–20% เพื่อรักษา global context
- กล่องที่ถูกตัดขอบ: เก็บเมื่อ center อยู่ใน patch และ visible area ≥50%
- ใส่ empty/background patches จริงอย่างน้อย 10–20%; ห้ามใช้ synthetic เป็น
  validation/test
- train 50 epochs เป็นอย่างน้อย, patience 10, checkpoint selection จาก validation
  `min(P,R,F1)` แล้วใช้ F1 เป็น tie-break
- tiled validation geometry ต้องตรงกับ training geometry และ merge NMS/WBF เลือกจาก
  validation เท่านั้น
- `max_det=700` หลัง global merge

### B — Faster R-CNN ResNet50-FPN v2 (independent baseline)

- ฝึกบน patch เดียวกับ candidate A; ห้าม full-frame 640 baseline เป็นตัวเปรียบเทียบหลัก
- anchor sizes เริ่มที่ 8/16/32/64/128 px และตรวจ positive-anchor coverage
- RPN pre/post-NMS proposals ต้องรองรับ dense scene อย่างน้อย 4,000/2,000
- `box_detections_per_img=700`; ค่า default 100 ผ่าน recall 0.75 ไม่ได้ในข้อมูลนี้
- ใช้ focal-loss/negative sampling ablation หาก background false positive สูง
- ข้อดีคือ FPN + proposal refinement เป็น architecture ต่างจาก YOLO จริง
- ข้อเสียคือช้ากว่าและ dense proposal/NMS ใช้หน่วยความจำสูง

### C — Full-frame high-resolution control

- YOLO26n/s ที่ input 1,280 เพื่อวัดว่าการเพิ่ม resolution อย่างเดียวพอหรือไม่
- ใช้เป็น control เพราะยังทำให้ median object สั้นเพียงประมาณ 6–7 px
- หากต่ำกว่า patch candidate ให้หยุด ไม่เพิ่ม 1,920/2,560 แบบไร้ขอบเขต

### D — FCOS/TOOD + slicing (ทำเมื่อ A/B ยังไม่ผ่าน)

SAHI paper พบว่า FCOS/VFNet/TOOD ได้ประโยชน์จาก slicing-aided fine-tuning
candidate นี้มีคุณค่าทางวิจัย แต่เพิ่ม dependency/operational complexity มากกว่า A/B
จึงไม่ควรเป็นรอบแรก

## Acceptance contract

### ก่อนเปิด held-out test

1. freeze `split_manifest.json` และบันทึก SHA-256 ในทุก metrics artifact
2. freeze image/label count และ SHA-256 inventory; symlink destination ต้อง resolve ได้
3. predeclare architecture, patch sizes, overlap, confidence, NMS/WBF และ max_det
4. confidence/NMS/tile geometry เลือกจาก validation เท่านั้น
5. evaluator ต้องยืนยัน `test_used_for_selection=false`
6. validation ที่ IoU 0.50, one-to-one matching, `max_det=700` ต้องมี:
   - micro Precision ≥ 0.75
   - micro Recall ≥ 0.75
   - micro F1 ≥ 0.75
   - Recall แต่ละ abundance group ≥ 0.70
   - grouped-bootstrap 95% lower bound ของ P/R/F1 ≥ 0.70 เมื่อจำนวน run เพียงพอ
7. validation clean-negative set ต้องรายงาน false positives/image แยกต่างหาก
8. export/framework parity: จำนวน detections, class, box coordinates และ confidence
   ต้องตรงภายใน tolerance ที่กำหนด

ใช้ metric selection ดังนี้เพื่อป้องกันการดัน precision แลก recall:

```text
primary = min(precision, recall, F1)
tie-break 1 = F1
tie-break 2 = AP50
tie-break 3 = latency
```

ไม่ใช้คำว่า `accuracy` สำหรับ object detector เพราะ true negatives ไม่สามารถนับแบบ
image classification ได้

### การเปิด test ครั้งเดียว

หลัง supervisor ลงนาม model card และ hash ทั้งหมดแล้ว evaluation owner จึงเปิด test
ครั้งเดียวด้วยค่าที่ freeze จาก validation ห้ามย้อนกลับไปเปลี่ยน architecture,
confidence, NMS หรือ tile geometry จากผล test หากไม่ผ่าน ให้สร้าง model generation ใหม่
และ test set รุ่นใหม่สำหรับการยืนยันรอบถัดไป

### Production/Thai-field gate เพิ่มเติม

แม้ internal held-out test ผ่าน ยังต้องมี external Thai-field set แยก field/plant/date/
camera และมี clean leaves/other insects ด้วย Synthetic images ใช้ train augmentation
ได้หลังผู้เชี่ยวชาญตรวจ แต่ห้ามอยู่ใน validation/test และห้ามใช้เป็น production evidence

## การแบ่งงานและลำดับอนุมัติ

| Owner | งาน | ห้ามทำ |
|---|---|---|
| Data QA | freeze manifest, annotation audit, negatives | ดู model score แล้วเปลี่ยน split |
| Model A | YOLO patch candidate | เปิด test |
| Model B | Faster R-CNN-FPN baseline | ใช้ threshold จาก test |
| Evaluation owner | validation metrics/CI/curves | train หรือเปลี่ยน labels |
| Supervisor | freeze candidate และอนุมัติ test | เลือกย้อนหลังจาก test |
| Agronomy QA | ตรวจ box/false positives/Thai field | อนุมัติจาก metric อย่างเดียว |

## คำสั่ง benchmark audit

คำสั่งนี้ล็อก path ที่ `val` และ abort หากพบคำว่า `test`:

```bash
backend/training/.venv-detector/bin/python \
  backend/training/benchmarks/whitefly_validation_benchmark.py \
  --data-root backend/training/data/extended_conditions/whitefly_yolo \
  --model backend/ml_models/whitefly_detector.pt \
  --configs full,tile1600o20,tile1024o20 \
  --max-images 45 --seed 20260801 --max-det 700 --device mps
```

ไฟล์ผล audit ปัจจุบัน:

- `backend/training/benchmarks/whitefly_validation_benchmark_45.json`
- `backend/training/benchmarks/whitefly_validation_full_648.json`
