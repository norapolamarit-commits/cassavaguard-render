# CassavaGuard UI/UX Redesign — Design Spec

**Date:** 2026-09-15
**Goal:** รื้อ UI/UX ทั้งแอปให้ "สดใส เป็นมิตร การ์ดใหญ่ น่าใช้จริง" สำหรับเกษตรกร — สวย อ่านง่าย กดง่ายด้วยนิ้ว โดยไม่แตะ logic/ฟีเจอร์เดิม

## 1. หลักการออกแบบ (Design Principles)

1. **สว่าง เป็นมิตร** — ตัด glassmorphism/เบลอฝ้า และ gradient เข้มออก ใช้พื้นสะอาด การ์ดใหญ่ ขอบมน เงานุ่ม
2. **กดง่ายด้วยนิ้ว** — touch target ≥ 54px, ตัวอักษรฐาน 16–17px, ช่องไฟเยอะ
3. **สื่อความชัดด้วยสี** — เขียว=ปกติ, เหลือง=เฝ้าระวัง, แดง=เป็นโรค
4. **ทำแค่หน้าตา** — ไม่แก้ API, การนำทาง route, หรือ business logic; ทุกฟีเจอร์ทำงานเหมือนเดิม
5. **ทั้ง light + dark** — light เป็นค่าเริ่มต้น, dark เป็นโทนเขียวเข้มอุ่น (ไม่ใช่น้ำเงินดำ)

## 2. Design Tokens (แหล่งความจริงเดียว)

ปรับที่ `frontend/styles/input.css` (ย้าย tokens จาก inline `<style>` ใน index.html มาไว้เป็น `@layer base` + CSS variables) และ `tailwind.config.cjs`

- **Brand:** leaf green สดใส (เช่น `#22a447` / `#16a34a` family) เป็นสีหลัก
- **Secondary/warm:** ส้ม-เหลืองทอง (ดิน/แดด) สำหรับ accent รอง เช่น `#f59e0b`
- **Status:** ok=green, warn=amber, danger=red — ชุดเดียวใช้ทั้งแอป
- **Surface:**
  - light: พื้นครีม/ขาวนวล (`#f7f9f4`), การ์ด `#ffffff`
  - dark: เขียวเข้มอุ่น (`#0d1a12` family), การ์ด `#13241a`
- **Radius:** card 24px, control 14–16px, pill 999px
- **Shadow:** เงานุ่มบางชั้นเดียว (ไม่มีเส้น hairline กระจก)
- **Type scale:** base 16px (TH 17px), h1 clamp(28–40px), heading หนา 750–850
- **Spacing:** section gap เพิ่มขึ้น (การ์ดไม่อัดกัน)

## 3. คอมโพเนนต์กลาง (`frontend/src/ui.jsx`)

ปรับ primitives ให้เป็นภาษาใหม่ (หน้าอื่นได้ตามอัตโนมัติ):

- `Card` — ขอบมน 24px เงานุ่ม พื้นทึบ (เลิก `.glass`)
- `SectionTitle` — ไอคอนในวงพื้นสีอ่อนต่อหมวด หัวข้อใหญ่ขึ้น
- `KPICard` — การ์ดใหญ่ ตัวเลขเด่น ไอคอนสีพื้นมน
- `Badge`/`Ring`/`Skeleton`/`Modal`/`Toast`/`Spinner` — โทนใหม่, ปุ่มปิด/ปุ่มหลักสูงขึ้น
- ปุ่มมาตรฐาน: `primary-action` (เขียวทึบ), `secondary-action` (พื้นอ่อน), ทั้งคู่สูง ≥54px มุมมน
- ไอคอน: คงชุด inline SVG เดิม (ขยายขนาด default ได้)

## 4. โครงนำทาง (`frontend/src/App.jsx`)

- **Header** สะอาด: โลโก้ + ชื่อ CassavaGuard + ปุ่มสลับภาษา/โหมดสี (ปุ่มใหญ่ชัด)
- **Desktop:** แถบเมนูบน (nav pill โทนใหม่)
- **Mobile dock (คงไว้):** 4 เมนูหลัก + ปุ่ม "วิเคราะห์" เด่นกลาง dock; พื้นทึบ เงานุ่ม
- เมนู "เพิ่มเติม" เป็น sheet/grid การ์ดใหญ่
- คง route keys เดิมทั้งหมด (predict, history, recommendations, weather, map, satellite, dashboard, system, guide, legal)

## 5. หน้าวิเคราะห์ — หัวใจ (`frontend/src/pages/predict.jsx`)

- **ขั้นตอน 1‑2‑3** ชัด (ถ่าย/อัปโหลด → วิเคราะห์ → ผล) แถบ step ใหญ่ อ่านง่าย
- **โซนถ่ายรูป** การ์ดใหญ่ ปุ่มกล้อง/อัปโหลดเด่น
- **การ์ดผลลัพธ์** ใบใหญ่: ชื่อโรค + แถบ/วงความมั่นใจ + "สิ่งที่ควรทำ" + ปุ่มถัดไป (ไปคำแนะนำ) ชัด
- **3D plant — ทำใหม่ให้สวย** (คงไว้ แต่ยกเครื่องภาพ):
  - แสงนุ่มขึ้น (soft key + fill + rim), วัสดุใบเนียน/สมจริงขึ้น, ลดหมอกทึบ
  - พื้นหลัง stage เข้ากับธีมใหม่ (light: ฟ้า‑เขียวอ่อน→ดินอุ่น; dark: เขียวเข้ม)
  - คงการควบคุม ลาก‑หมุน‑ซูม และ fallback เมื่อไม่มี WebGL
- คงฟอร์ม evidence/harvest, การเรียก API วิเคราะห์เดิมทั้งหมด

## 6. หน้าอื่นๆ (ไล่ปรับตามภาษาใหม่)

history, recommendations, weather, fieldmap, satellite, dashboard, system, guide, legal, auth — ปรับการ์ด/สี/ตัวอักษร/ปุ่มให้เข้าชุด, แผนที่ (leaflet) และกราฟ (chart.js) ปรับสีให้เข้าธีม, คง logic เดิม

## 7. องค์ประกอบพิเศษ (คงไว้)

- **แชทลอย ถาม‑ตอบ AI** — คง flow/logic, ปรับหน้าตาให้เข้าธีม (พื้นทึบ ขอบมน)
- **Mobile dock** — คงไว้ ปรับหน้าตา
- **3D plant** — คงไว้ + ยกเครื่องภาพ (ข้อ 5)

## 8. ขอบเขตที่ไม่แตะ (Out of scope)

- Backend/API, โครงสร้างข้อมูล, ระบบ auth logic
- ชื่อ route / โครงสร้างไฟล์ (ยกเว้นแก้ style/JSX ภายในไฟล์เดิม)
- การเพิ่มฟีเจอร์ใหม่ที่ไม่มีอยู่เดิม

## 9. ผลลัพธ์ที่ตรวจได้ (Success criteria)

- `npm run build` ผ่าน ไม่มี error
- เปิดแอปแล้วทุกหน้าแสดงผลด้วยภาษาใหม่ ทั้ง light + dark
- ทุกฟีเจอร์เดิม (วิเคราะห์, แผนที่, แชท, 3D, สลับภาษา/ธีม) ยังทำงาน
- ใช้งานบนมือถือ (~380px) ได้จริง ปุ่มกดง่าย ไม่ล้นจอ
- ผ่านการตรวจด้วย browser preview (screenshot มือถือ + เดสก์ท็อป, ทั้งสองธีม)

## 10. แผนการทำงาน (ลำดับ)

1. Design tokens (input.css + tailwind.config) + ย้าย inline style ออกจาก index.html
2. Primitives ใน ui.jsx
3. Shell/นำทาง App.jsx + mobile dock
4. หน้า predict + 3D plant
5. หน้าอื่นๆ ทีละหน้า
6. แชทลอย
7. Build + ตรวจด้วย browser (มือถือ/เดสก์ท็อป, light/dark) + เก็บรายละเอียด
