# CassavaGuard UI Redesign Implementation Plan

> **For agentic workers:** This is a visual (CSS/JSX) redesign. There is no frontend unit-test framework, so each task's "test cycle" is: `npm run build` succeeds + browser preview verification (screenshot desktop + mobile ~380px, light + dark) + no new console errors. Steps use checkbox (`- [ ]`) syntax.

**Goal:** รื้อ UI/UX ทั้งแอป CassavaGuard เป็นแนว "สดใส เป็นมิตร การ์ดใหญ่ ใช้ง่าย" โดยไม่แตะ logic/API/route

**Architecture:** เปลี่ยน design tokens กลาง (CSS variables ใน index.html `<style>` + tailwind.config) → primitives ใน ui.jsx → shell/นำทาง → แต่ละหน้า → 3D + แชท ทุกอย่างเป็น global React (CDN) + esbuild IIFE bundle, build ด้วย `npm run build`

**Tech Stack:** React 18 (global), Tailwind 3.4, esbuild, three.js (3D), leaflet, chart.js, FastAPI backend (เสิร์ฟ static)

## Global Constraints

- ห้ามแก้ backend/API, route keys, business logic — visual เท่านั้น
- ต้องรองรับทั้ง light + dark; light เป็นค่าเริ่มต้น
- Touch target ≥ 54px; base font 16px (TH 17px)
- คงฟีเจอร์: 3D plant (ยกเครื่องภาพ), แชทลอย AI, mobile dock
- Build ต้องผ่าน: `.venv/bin/python` ไม่เกี่ยว — ใช้ `node scripts/build-frontend.mjs` ผ่าน `npm run build` (ต้อง `npm install` ให้มี esbuild + tailwind ก่อน)
- โทนสี: brand = leaf green สดใส, secondary = ส้ม/เหลืองทอง, status green/amber/red
- Radius: card 24px, control 14–16px
- เซิร์ฟเวอร์ preview รันอยู่แล้วที่พอร์ต 8800 (`.venv/bin/python serve.py`); rebuild frontend แล้ว reload

---

### Task 0: เตรียม build toolchain

**Files:** Modify: none (ติดตั้ง node deps)

- [ ] **Step 1:** ตรวจว่า node/npm มี และ `npm install` ให้ครบ (esbuild, tailwind)

Run: `cd <repo> && npm install`
Expected: ติดตั้งสำเร็จ ไม่ error

- [ ] **Step 2:** ทดสอบ build เดิมผ่าน

Run: `npm run build`
Expected: สร้าง `frontend/dist/app.js` + `app.css` สำเร็จ

- [ ] **Step 3:** เปลี่ยน cache-buster ใน `frontend/index.html` (query `?v=`) เป็นค่าใหม่ เพื่อให้ browser โหลด bundle ใหม่ทุกครั้ง (เช่น `?v=redesign-1`)

---

### Task 1: Design tokens ใหม่ (หัวใจ)

**Files:** Modify: `frontend/index.html` (`<style>` block), `tailwind.config.cjs`

**Interfaces:**
- Produces: CSS variables `--cg-bg, --cg-surface, --cg-surface-2, --cg-text, --cg-text-soft, --cg-brand, --cg-brand-strong, --cg-warm, --cg-ok, --cg-warn, --cg-danger, --cg-border, --cg-radius-card, --cg-shadow` ในทั้ง light (`:root`) และ dark (`html.dark`)
- ยูทิลิตี้คลาสเดิมที่หน้าอื่นใช้ (`.theme-bg .txt .txt-soft .txt-dim .glass .cg-card .hair .grad-brand .grad-text`) ต้องคงชื่อไว้ แต่ให้ map ไปสีใหม่ (`.glass` → พื้นทึบ surface ไม่มีเบลอ)

- [ ] **Step 1:** เพิ่มบล็อก `:root{}` + `html.dark{}` ประกาศตัวแปรสีใหม่ (light: bg `#f6f8f3`, surface `#ffffff`, text `#14261a`, brand `#16a34a`, warm `#f59e0b`; dark: bg `#0d1a12`, surface `#13241a`, text `#e8f2ea`)
- [ ] **Step 2:** เขียนทับ `.theme-bg` (พื้นเรียบ/ไล่เฉดอ่อนมาก), `.glass`/`.glass-strong` (พื้นทึบ surface + เงานุ่ม ไม่มี backdrop-blur), `.txt*`, `.hair`, `.cg-card` (radius 24, เงานุ่มชั้นเดียว, ตัด `::before` เส้นกระจก)
- [ ] **Step 3:** อัปเดต `tailwind.config.cjs` — brand palette เป็น leaf green + เพิ่ม warm/amber ถ้าจำเป็น (คง key เดิมที่ ui.jsx ใช้: `brand-*, cyan2*`)
- [ ] **Step 4:** ตั้ง `<html>` default เป็น light (index.html: `class="light"` มีอยู่แล้ว) และ font base 16/17px
- [ ] **Step 5 (test):** `npm run build` → reload → screenshot desktop+mobile, light+dark ของหน้าแรก; ยืนยันไม่มีเบลอกระจก สีสดใส ไม่มี error console

---

### Task 2: Primitives ui.jsx

**Files:** Modify: `frontend/src/ui.jsx`

- [ ] **Step 1:** `Card` — ใช้ surface ทึบ radius 24 เงานุ่ม (คง prop `pad/hover/className`)
- [ ] **Step 2:** `SectionTitle` — ไอคอนวงพื้นสีอ่อน, หัวข้อ text-lg หนา
- [ ] **Step 3:** `KPICard` — การ์ดใหญ่ ตัวเลขเด่น (คง count-up), tone map ไปสีใหม่
- [ ] **Step 4:** `Badge/Ring/Skeleton/Modal/Toast/Spinner` — โทนใหม่, ปุ่มปิดใหญ่ขึ้น, radius สม่ำเสมอ; เพิ่มขนาด default ไอคอนถ้าเหมาะ
- [ ] **Step 5 (test):** build + reload; ตรวจหน้า dashboard/system ที่ใช้ KPICard/Card render ถูก ทั้งสองธีม

---

### Task 3: Shell & Navigation

**Files:** Modify: `frontend/src/App.jsx`, `frontend/index.html` (คลาส `.app-header .nav-pill .utility-button .mobile-dock .dock-item .menu-tile* .route-heading`)

- [ ] **Step 1:** Header ใหม่ — พื้นทึบ สะอาด, brand mark, ปุ่มภาษา/ธีม/แจ้งเตือนใหญ่ชัด (≥40px)
- [ ] **Step 2:** Desktop nav pill โทนใหม่ (active = พื้นเขียวอ่อน text เขียวเข้ม)
- [ ] **Step 3:** Mobile dock — พื้นทึบ เงานุ่ม, 4 เมนู + ปุ่ม "วิเคราะห์" เด่นกลาง (ยกปุ่มขึ้น/สีเขียวทึบ)
- [ ] **Step 4:** เมนู "เพิ่มเติม" เป็น sheet การ์ดใหญ่ (menu-tile ใหม่)
- [ ] **Step 5 (test):** build + reload; ทดสอบสลับเมนูทุกอันด้วยคลิก, ทดสอบ dock บน mobile viewport (resize 380px), light+dark; ยืนยัน route ทำงานครบ

---

### Task 4: หน้า Predict + 3D plant

**Files:** Modify: `frontend/src/pages/predict.jsx`, `frontend/index.html` (คลาส `.diagnosis-* .workflow-steps .capture-* .primary-action .analyze-action .evidence-* .harvest-form .plant-*`)

- [ ] **Step 1:** Hero/intro + step 1‑2‑3 ใหม่ให้ใหญ่ อ่านง่าย (workflow-steps โทนใหม่)
- [ ] **Step 2:** Capture zone การ์ดใหญ่ ปุ่มกล้อง/อัปโหลดเด่น (ตัด dashed เขียวเข้ม → โทนอ่อนสดใส)
- [ ] **Step 3:** การ์ดผลลัพธ์ใบใหญ่: ชื่อโรค + วง/แถบความมั่นใจ + สิ่งที่ควรทำ + ปุ่มถัดไปชัด (คงการเรียก API + state logic เดิมทั้งหมด — แก้เฉพาะ JSX/className/CSS)
- [ ] **Step 4:** 3D plant ยกเครื่องภาพใน three.js: ปรับ lights (hemisphere อ่อนลง, key/fill/rim นุ่ม), materials ใบ (roughness/สี), ลด fog, พื้น stage เข้าธีมใหม่ (แก้ `.plant-stage` gradient ทั้ง light/dark); คง controls + WebGL fallback
- [ ] **Step 5 (test):** build + reload; อัปโหลดรูปทดสอบ 1 ใบ → ยิงวิเคราะห์ → ยืนยันผลแสดง, 3D หมุน/ซูมได้และดูสวยขึ้น, ทั้งสองธีม, mobile

---

### Task 5: หน้าอื่นๆ (ไล่ทีละหน้า)

**Files:** Modify (ทีละไฟล์ แต่ละไฟล์เป็น 1 checkpoint): `frontend/src/pages/history.jsx`, `recommendations.jsx`, `weather.jsx`, `fieldmap.jsx` (+`map.jsx`), `satellite.jsx`, `dashboard.jsx`, `system.jsx`, `guide.jsx`, `legal.jsx`, `auth.jsx`, `welcome.jsx`; `charts.jsx` (สีกราฟ), leaflet CSS ใน index.html

- [ ] **Step 1:** แต่ละหน้า: ปรับ Card/spacing/typography/ปุ่มให้เข้าชุด (ใช้ primitives ใหม่ ส่วนใหญ่ได้ฟรี), แก้สี inline ที่ยังอ้างโทนเก่า
- [ ] **Step 2:** `charts.jsx` — palette กราฟเป็นสีใหม่ (brand/warm/status), grid/label อ่านง่ายทั้งสองธีม
- [ ] **Step 3:** leaflet — ปรับ popup/control ให้เข้าธีมใหม่ (คลาสใน index.html)
- [ ] **Step 4 (test):** build + reload; เปิดทุกหน้า screenshot ทั้งสองธีม + mobile; ยืนยันไม่มีล้นจอ/สีตกค้าง/console error

---

### Task 6: แชทลอย AI

**Files:** Modify: `frontend/index.html` (คลาส `.advice-chat*`, `.chat-*`), JSX ที่เรนเดอร์แชท (อยู่ใน predict.jsx/where mounted)

- [ ] **Step 1:** FAB + panel โทนใหม่ (พื้นทึบ surface, ขอบมน, bubble ผู้ใช้=เขียว, ผู้ช่วย=พื้นอ่อน) คง flow ถาม-ตอบ/logic เดิม
- [ ] **Step 2 (test):** build + reload; เปิดแชท พิมพ์คำถาม 1 ครั้ง ยืนยันได้คำตอบ, หน้าตาเข้าธีม, mobile ไม่ทับ dock

---

### Task 7: ตรวจรวม + เก็บงาน

- [ ] **Step 1:** ไล่ทุกหน้าอีกรอบ ทั้ง light+dark, desktop+mobile(380px); เก็บ spacing/สี/ปุ่มที่ยังหลุด
- [ ] **Step 2:** ตรวจ console ทุกหน้าไม่มี error; ตรวจ contrast อ่านง่าย
- [ ] **Step 3:** ส่ง screenshot before/after ให้ผู้ใช้ดู (มือถือ + เดสก์ท็อป, สองธีม)
- [ ] **Step 4:** อัปเดต cache-buster สุดท้าย, build ครั้งสุดท้าย

## Self-Review (ทำแล้ว)

- ครอบคลุมทุกหน้าในสเปก (predict, history, recommendations, weather, map, satellite, dashboard, system, guide, legal, auth, welcome) ✓
- คงฟีเจอร์พิเศษ (3D=Task4, แชท=Task6, dock=Task3) ✓
- ทั้ง light+dark ทุก task ✓
- ไม่แตะ API/logic ✓ (ระบุชัดในทุก task ที่มี logic)
