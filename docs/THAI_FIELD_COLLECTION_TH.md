# แผนเก็บข้อมูลภาพจากไร่จริงในไทย (Thai Field Data)

เอกสารนี้อธิบายโครงสร้างและกติกาการเก็บภาพมันสำปะหลังจากไร่จริงในประเทศไทย
ตาม master spec ของโครงการ ส่วนที่ยังไม่มีเลยในตอนนี้คือ **ตัวภาพจริง** —
เอกสารนี้เตรียมเฉพาะโครงสร้าง, schema และกติกา split ให้พร้อมรับข้อมูล
เมื่อมีการถ่ายภาพจริงเกิดขึ้น

## ทำไมต้องมี

โมเดลหลัก (EfficientNet-B2 + TTA, Test Accuracy 88.20%, Macro-F1 83.63%)
ฝึกและวัดผลจาก TFDS Cassava (ยูกันดา), Mendeley India และ CCMT
(กานา/ไอวอรีโคสต์) เท่านั้น — ไม่มีภาพจากไทยแม้แต่ภาพเดียว พันธุ์มันสำปะหลัง,
สภาพภูมิอากาศ, กล้องโทรศัพท์, พื้นหลังไร่ และลักษณะอาการโรคในไทยอาจต่างจาก
แหล่งข้อมูลเหล่านี้ นี่คือเหตุผลที่ README ระบุไว้ชัดเจนว่า **ยังไม่บรรลุเป้าหมาย
95%** และ **ยังไม่มี independent Thai-field test ที่ครอบคลุมพอ**

## โครงสร้างไฟล์

```text
data/thai_field/
├── images/           # ไฟล์ภาพจริง (.jpg/.png) — ไม่ commit เข้า git ตาม .gitignore
├── metadata.csv       # บริบทการถ่ายภาพ ต่อ 1 แถวต่อ 1 ภาพ
└── labels.csv          # ฉลากที่ตรวจสอบแล้ว + การกำหนด split ต่อภาพ
```

`images/` ยังว่างเปล่า (มีแค่ `.gitkeep`) — ภาพจริงต้องเก็บนอก git
(ดู `.gitignore` ที่กัน `data/` เอาไว้แล้วในลักษณะเดียวกับ `uploads/`, `database/`)
และเก็บ manifest/checksum แยกต่างหากถ้าต้องซิงค์ระหว่างเครื่อง

### `metadata.csv`

| คอลัมน์ | ความหมาย |
|---|---|
| `image_id` | รหัสภาพ ไม่ซ้ำ |
| `date` | วันที่ถ่าย (ISO 8601) |
| `province` | จังหวัด |
| `farm_id` | รหัสไร่ — ใช้ทำ leakage-safe split (ห้าม split ตามภาพเดี่ยว) |
| `plant_id` | รหัสต้น ถ้าระบุได้ |
| `device` | รุ่นมือถือ/กล้องที่ใช้ |
| `lighting` | สภาพแสงตอนถ่าย |
| `growth_stage` | ระยะการเจริญเติบโตของพืช |
| `disease` | ชื่อโรคดิบตามที่ผู้บันทึกภาคสนามระบุ (ก่อน harmonize) |
| `severity` | ความรุนแรงตามที่ประเมินหน้างาน (ถ้ามี) |
| `label_source` | ใครเป็นคนให้ label เช่น `farmer`, `agronomist`, `app_prediction` |
| `expert_verified` | `true`/`false`/`null` |
| `notes` | หมายเหตุอื่น |

ค่าที่ไม่ทราบต้องเป็น `null` เสมอ **ห้ามเดา/ห้ามใส่ค่า default แทนข้อมูลจริง**
ตามกติกาของ master spec (ข้อ 26)

### `labels.csv`

| คอลัมน์ | ความหมาย |
|---|---|
| `image_id` | รหัสภาพ ต้องตรงกับ `metadata.csv` |
| `raw_label` | ฉลากดิบจากภาคสนาม |
| `canonical_class` | ฉลากที่ map เข้า taxonomy หลักแล้ว (`config/class_mapping.yaml`) หรือ `quarantined` ถ้า map ไม่ได้แน่ชัด |
| `split` | ดูกติกา split ด้านล่าง |
| `reviewer` | ผู้ตรวจ (agronomist/expert) |
| `review_date` | วันที่ตรวจ |
| `review_status` | `pending` / `approved` / `rejected` |
| `notes` | เหตุผลถ้า reject หรือ quarantine |

## กติกา split (สำคัญที่สุด)

`split` ใน `labels.csv` ต้องเป็นหนึ่งในค่าต่อไปนี้เท่านั้น:

- `thai_independent_test` — ชุดทดสอบอิสระสุดท้าย
- `thai_finetune_train` — ใช้ fine-tune เฉพาะ Experiment D (ตัวเลือกเสริมใน
  ablation study) เท่านั้น

**ภาพที่อยู่ใน `thai_independent_test` ห้ามนำไปใช้ในกรณีต่อไปนี้เด็ดขาด**
(master spec ข้อ 27):

- training
- pseudo-label training
- hyperparameter tuning
- threshold tuning
- model selection

Split ต้องแบ่งตาม `farm_id` (หรือ `plant_id`/session ถ้ามีละเอียดกว่า) ไม่ใช่แบ่ง
แบบสุ่มระดับภาพเดี่ยว เพื่อไม่ให้ภาพจากไร่/ต้นเดียวกันหลุดข้าม split — ตามหลัก
leakage prevention เดียวกับที่ใช้กับ TFDS/CCMT ใน `backend/training/`

## ขั้นตอนถัดไปที่ต้องมีคนลงพื้นที่จริง

เอกสารนี้เตรียมแค่โครงสร้างรับข้อมูล ขั้นตอนต่อไปนี้เป็นงานภาคสนามที่ต้องมีคน
ไปทำจริง ไม่สามารถทำแทนได้:

1. เลือกจังหวัด/ไร่ตัวอย่างให้ครอบคลุมพันธุ์และฤดูกาลพอสมควร
2. ถ่ายภาพจริงตามแนวทางในแอป (ใบเต็มใบ, โฟกัสชัด, ไม่มีเงาหนัก)
3. บันทึกแถวใน `metadata.csv` ทันทีที่ถ่าย (อย่าใส่ทีหลังจากความจำ)
4. ให้ agronomist ตรวจ label จริงแล้วบันทึกใน `labels.csv`
5. กำหนด `split` ตาม `farm_id` ก่อน freeze ชุด `thai_independent_test`
6. รัน duplicate/leakage check ชุดเดียวกับที่ใช้กับ dataset อื่นก่อนนำเข้า pipeline
