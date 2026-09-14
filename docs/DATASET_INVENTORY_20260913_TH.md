# รายงานชุดข้อมูลที่ดาวน์โหลด 13 กันยายน 2026

ไฟล์ภาพดิบอยู่ใน `backend/training/data/` และถูกละเว้นจาก Git ตามนโยบาย
ข้อมูลขนาดใหญ่ ส่วนโค้ดดาวน์โหลด, manifest, DOI และวิธีสร้างซ้ำอยู่ใน repository

## ชุดข้อมูลที่ตรวจและดาวน์โหลดแล้ว

| ชุดข้อมูล | สิทธิ์ | งานที่ใช้ | จำนวนที่ตรวจได้ | ตำแหน่ง |
|---|---|---|---:|---|
| Cassava Leaf Disease Dataset, India, DOI `10.17632/3832tx2cb2.1` | CC BY 4.0 | 5-class classifier (train-only) | 228 ภาพ: CBB 49, CMD 88, Healthy 91 | `backend/training/data/mendeley_india_3832tx2cb2_v1/` |
| CCMT Crop Pest and Disease, DOI `10.17632/bwh3zbpkpv.1` | CC BY 4.0 | BLS auxiliary และชุดเสริมที่ต้องทดลองแยก | 5,000 ภาพ; พบ exact duplicate ภายในแหล่ง 111 รายการก่อน quarantine | `backend/training/data/ccmt_cassava_raw/` |
| Cassava Whitefly Dataset v3, DOI `10.17632/5g38399z9p.3` | CC BY 4.0 | object detector | 3,000 ภาพ, 3,000 XML, 212,948 valid boxes | `backend/training/data/extended_conditions/real/whitefly/` |
| Embrapa PDDB, DOI `10.48432/XA1OVL` | CC BY-NC 4.0 | งานทดลองเท่านั้น | White Leaf Spot 115 ภาพ; CAD 1 ภาพ | `backend/training/data/extended_conditions/real/` |
| CIAT/Wikimedia + Bugwood | CC BY-SA 2.0 / CC BY 3.0 ตาม manifest | seed reference เท่านั้น | Mealybug 3, nutrient deficiency 1 | `backend/training/data/extended_conditions/real/` |
| Cassava Image Dataset3, DOI `10.6084/m9.figshare.21769070.v2` | CC BY 4.0 | external domain/train-only experiment ตาม run | 7,131 ภาพที่ pipeline รับหลัง audit | `backend/training/data/figshare_cassava_21769070_v2/` |

แหล่งอ้างอิงหลัก:

- <https://data.mendeley.com/datasets/3832tx2cb2/1>
- <https://data.mendeley.com/datasets/bwh3zbpkpv/1>
- <https://data.mendeley.com/datasets/5g38399z9p/3>
- <https://doi.org/10.48432/XA1OVL>
- <https://doi.org/10.6084/m9.figshare.21769070.v2>

## วิธีใช้กับโมเดลหลักอย่างปลอดภัย

Trainer รองรับ `--extra-data-dir` ซ้ำได้ ชุดเสริมจะเข้า **train เท่านั้น** และ
ระบบจะกัก exact/perceptual duplicate ที่ชนกับ official train/validation/test ก่อนฝึก:

```bash
PYTHONPATH=. .venv-training/bin/python backend/training/train_cnn_torch.py \
  --architecture efficientnet_b3 \
  --pipeline field_robust \
  --balance-classes-and-sources \
  --extra-data-dir backend/training/data/figshare_cassava_21769070_v2 \
  --extra-data-dir backend/training/data/mendeley_india_3832tx2cb2_v1 \
  --output-dir backend/training/candidates/multi_source_candidate
```

ห้ามนำ CCMT ทุกคลาสมารวมกับ 5-class โดยตรง: `brown_leaf_spot` ไม่ใช่ CBB และ
`green_mite` ไม่ใช่ CGM เสมอไป ต้องทดลองเป็น auxiliary task หรือ mapping ที่ผู้เชี่ยวชาญอนุมัติ

## ข้อจำกัดที่ยังเหลือ

- ข้อมูล CAD, Mealybug และ nutrient deficiency ยังต่ำกว่าเกณฑ์สร้างโมเดลจริงมาก
- Embrapa เป็น CC BY-NC 4.0 จึงห้ามใช้เป็นหลักฐานสำหรับ release เชิงพาณิชย์
- จำนวนภาพที่เพิ่มไม่ใช่หลักฐานว่า accuracy สูงขึ้น ต้องวัดบน sealed external/Thai field test
- ชุด Thai field test ที่เป็นคนละแปลง คนละอุปกรณ์ และคนละฤดูยังเป็นช่องว่างสำคัญที่สุด
