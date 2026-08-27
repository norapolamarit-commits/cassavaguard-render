# สร้างแอป Android (APK) จาก CassavaGuard

เอกสารนี้อธิบายวิธี build ตัวห่อ native Android (ผ่าน [Capacitor](https://capacitorjs.com/))
ที่แสดงเว็บแอป CassavaGuard เดิม backend ยังคงเป็น FastAPI/Python + ML model
รันบนเซิร์ฟเวอร์เท่านั้น — ตัว APK เป็นแค่เปลือก native ที่เปิด WebView ชี้ไปยัง
เซิร์ฟเวอร์จริง (คล้าย Trusted Web Activity) ไม่ได้ bundle backend ลงในเครื่อง

## โครงสร้าง

- `capacitor.config.json` — ตั้งค่า `server.url` ชี้ไปยัง backend production จริง
  (`https://cassavaguard-render.onrender.com`)
- `android/` — native Android project ที่ `npx cap add android` สร้างขึ้น
  (commit เฉพาะ source/config; ไม่ commit `build/`, `.gradle/` — ดู `.gitignore`)
- `android/keystore/cassavaguard-release.jks` — **ไม่ commit เข้า git เด็ดขาด**
  (อยู่ใน `.gitignore`) กุญแจเซ็นแอปสำหรับ release build ถ้าไฟล์นี้หายและไม่มี
  backup จะ**อัปเดตแอปตัวเดิมบน Play Store ต่อไม่ได้อีกเลย** ต้อง backup
  ไฟล์นี้ + รหัสผ่านไว้ในที่ปลอดภัย (password manager) ทันทีที่สร้าง

## Build ใหม่

```bash
npm run build                      # rebuild frontend/dist ก่อนเสมอ
npx cap sync android

cd android
export ANDROID_HOME=~/Library/Android/sdk
export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
export JAVA_TOOL_OPTIONS="-Duser.language=en -Duser.country=US"   # ดูเหตุผลด้านล่าง
./gradlew assembleDebug
```

APK (debug, เซ็นด้วย debug keystore อัตโนมัติของ Gradle) อยู่ที่
`android/app/build/outputs/apk/debug/app-debug.apk` — ติดตั้งทดสอบเองได้ปกติ
แต่เอาขึ้น Play Store ไม่ได้

## Build เวอร์ชัน Release (เซ็นด้วย release keystore)

ต้องมีไฟล์ `android/keystore/cassavaguard-release.jks` อยู่ก่อน (สร้างครั้งเดียว
ด้วย `keytool -genkeypair`, ดู "การสร้าง keystore" ด้านล่าง) รหัสผ่านต้อง**ไม่ใส่
ในไฟล์ repo เด็ดขาด** — ส่งผ่าน environment variable เฉพาะตอน build:

```bash
cd android
export ANDROID_HOME=~/Library/Android/sdk
export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
export CASSAVAGUARD_KEYSTORE_PASSWORD="รหัสผ่านที่ตั้งไว้ตอนสร้าง keystore"
export CASSAVAGUARD_KEY_PASSWORD="รหัสผ่านเดียวกัน หรือรหัส key แยกถ้าตั้งไว้ต่างกัน"
./gradlew assembleRelease
```

APK อยู่ที่ `android/app/build/outputs/apk/release/app-release.apk` — ถ้าไม่ตั้ง
สองตัวแปรนี้ `assembleRelease` จะยัง build ผ่าน แต่ได้ APK ที่**ไม่ได้เซ็น** (ติดตั้ง
ไม่ได้จนกว่าจะเซ็นทีหลัง) เพื่อกันไม่ให้ build ล้มเหลวแบบงงๆ ถ้าลืมตั้งค่า

### การสร้าง keystore (ทำครั้งเดียว)

```bash
mkdir -p android/keystore
"/Applications/Android Studio.app/Contents/jbr/Contents/Home/bin/keytool" -genkeypair -v \
  -keystore android/keystore/cassavaguard-release.jks \
  -alias cassavaguard \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -dname "CN=CassavaGuard AI, OU=CassavaGuard, O=CassavaGuard, L=Bangkok, ST=Bangkok, C=TH"
```

**สำคัญมาก**: หลัง build เสร็จ backup ไฟล์ `.jks` นี้ + รหัสผ่านทั้งสองตัว (store
password, key password) ไว้ใน password manager หรือที่ปลอดภัยอื่นทันที ไฟล์นี้
**ไม่ได้อยู่ใน git** (ตั้งใจ — ไม่ควรมีกุญแจเซ็นแอป production ไปอยู่ใน git history)
ถ้าเครื่องนี้พังหรือไฟล์หาย และไม่มี backup จะสร้างอัปเดตให้แอปตัวเดิมบน Play
Store ไม่ได้อีกเลย ต้องขึ้นแอปใหม่เป็นคนละ listing

## ⚠️ ปัญหาที่เจอและวิธีแก้: locale ไทยทำให้ build พังแบบไม่มี error message

Build ล้มเหลวซ้ำๆ ที่ `:app:mergeDebugJavaResource` ด้วย
`com.google.common.base.VerifyException` (ไม่มีข้อความ error เลย) ไม่ว่าจะลอง
เปลี่ยน AGP version หรือ JDK version ก็ตาม

**สาเหตุจริง**: เครื่อง macOS ที่ตั้งค่าประเทศเป็นไทย (`user.country=TH`) ทำให้ Java
`Calendar.getInstance()` คืนค่าปีเป็น**พุทธศักราช** (เช่น 2569 แทน 2026) โดย default
AGP's zip writer (`MsDosDateTimeUtils.packDate`) ตรวจว่าปีต้องอยู่ในช่วง 1980-2107
(ตามมาตรฐาน DOS zip date format) — ปี 2569 เกินขอบเขตนี้ ทำให้ assertion ภายในพัง
โดยไม่มีข้อความอธิบายอะไรเลย (Guava's `Verify.verify(condition)` แบบไม่มี message)

**วิธีแก้**: บังคับ JVM ให้ใช้ locale อังกฤษ/สหรัฐฯ ตอน build เท่านั้น (ไม่กระทบ
locale ของแอปเอง เพราะแอปมี i18n ของตัวเองแยกต่างหาก):

```bash
export JAVA_TOOL_OPTIONS="-Duser.language=en -Duser.country=US"
```

ต้อง set ตัวแปรนี้ไว้ **ทุกครั้ง** ก่อนรัน `./gradlew` บนเครื่องที่ตั้ง region เป็นไทย
ไม่งั้นจะเจอ error เดิมซ้ำ

## หมายเหตุอื่น

- **Cleartext HTTP**: `AndroidManifest.xml` ตั้ง `android:usesCleartextTraffic="true"`
  เพราะ `capacitor.config.json` ชี้ไปที่ `http://` (ไม่ใช่ `https://`) สำหรับทดสอบ
  local — ถ้าจะปล่อยจริงต้องเปลี่ยนไปชี้ URL production ที่เป็น HTTPS
  (`https://cassavaguard-render.onrender.com`) แล้วเอา `usesCleartextTraffic` ออก
- **สิทธิ์กล้อง**: เพิ่ม `android.permission.CAMERA` ใน manifest เพื่อให้ฟีเจอร์
  "ถ่ายรูป" ในหน้า AI Diagnosis (ใช้ `getUserMedia` ผ่าน WebView) ขอสิทธิ์ได้จริง
- **IP เปลี่ยน**: ถ้า dev เปลี่ยนเครือข่าย ต้องแก้ `server.url` ใน
  `capacitor.config.json` ให้ตรงกับ LAN IP ใหม่ แล้ว `npx cap sync android` และ
  build ใหม่
- **Firewall**: ถ้ามือถือเชื่อมต่อ backend ไม่ได้ทั้งที่ IP/port ถูกต้อง ให้ตรวจ
  macOS System Settings → Network → Firewall ว่าอนุญาตให้ Python รับ incoming
  connection หรือไม่ (ค่า default ของ macOS มักบล็อกไว้)
