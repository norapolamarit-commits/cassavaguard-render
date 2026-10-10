# การติดตั้ง CassavaGuard บน Android และ iOS

CassavaGuard Mobile v1.1.0 เป็นแอปแบบ Capacitor ที่เปิดเว็บ CassavaGuard จาก Render ภายในแอปมือถือ การวิเคราะห์ AI ยังทำที่ backend ดังนั้นโทรศัพท์ต้องเชื่อมต่ออินเทอร์เน็ต

## วิธีติดตั้งที่ไม่ต้องผ่าน Store (แนะนำสำหรับเริ่มใช้งาน)

ทั้ง iPhone และ Android เปิด [CassavaGuard บน Render](https://cassavaguard-render.onrender.com) ผ่านเบราว์เซอร์ แล้วเพิ่มลงหน้าจอหลักได้:

- **iPhone/iPad:** เปิดลิงก์ด้วย Safari → แตะปุ่มแชร์ → **Add to Home Screen / เพิ่มไปยังหน้าจอโฮม** → แตะ **Add / เพิ่ม**
- **Android:** เปิดลิงก์ด้วย Chrome → แตะเมนู ⋮ → **Install app / ติดตั้งแอป** หรือ **Add to Home screen / เพิ่มในหน้าจอหลัก**

เมื่อเพิ่มแล้วจะเปิดเป็นหน้าต่างแอป CassavaGuard โดยตรง วิธีนี้ไม่ต้องใช้บัญชีนักพัฒนา Apple หรือดาวน์โหลดจาก App Store แต่ต้องต่ออินเทอร์เน็ต และยังคงเรียก AI จากเซิร์ฟเวอร์ Render

## ฟีเจอร์ที่ใช้ได้บนมือถือ

เว็บแอป, PWA และ Android APK เปิดหน้าระบบ CassavaGuard ชุดเดียวกัน จึงใช้ฟีเจอร์หลักชุดเดียวกับเว็บ ได้แก่:

- สมัคร/เข้าสู่ระบบ และเก็บผลวิเคราะห์แยกตามบัญชี
- ถ่ายหรือเลือกรูปใบ/ทั้งต้น วิเคราะห์โรค ดูความมั่นใจ Heatmap และคำแนะนำ
- ดูประวัติ ค้นหา เปิดรายละเอียด ลบรายการ และส่งออก CSV/หน้ารายงาน
- ใช้ผู้ช่วยแชต คู่มือ สถานะโมเดล เปลี่ยนภาษาไทย/อังกฤษ และธีมสว่าง/มืด
- ใช้เมนูและปุ่มย้อนกลับของเบราว์เซอร์/Android เพื่อกลับหน้าก่อนหน้า

การประมวลผลและข้อมูลบัญชียังอยู่บนเซิร์ฟเวอร์ จึงต้องต่ออินเทอร์เน็ต แอปไม่ได้วิเคราะห์ภาพแบบออฟไลน์ และไม่ได้เพิ่ม push notification ของระบบปฏิบัติการ ส่วนกล้องใช้กล้องในหน้าเว็บก่อน หากเปิดไม่ได้จะมีทางเลือกใช้กล้อง/ตัวเลือกรูปของอุปกรณ์

## Android: ติดตั้ง APK สำหรับทดสอบ

ดาวน์โหลด [CassavaGuard Android v1.1.0 APK](../releases/mobile/CassavaGuard-Android-v1.1.0-debug.apk) ลงโทรศัพท์ Android หรือดาวน์โหลดไฟล์จากโฟลเดอร์ `releases/mobile/` ใน GitHub

1. ดาวน์โหลดไฟล์ APK ลงโทรศัพท์ Android
2. เปิดไฟล์จาก Downloads
3. ถ้าระบบเตือน ให้เปิดสิทธิ์ **Install unknown apps** สำหรับเบราว์เซอร์หรือแอป Files ที่ใช้เปิดไฟล์
4. กด **Install** แล้วเปิด **CassavaGuard AI**
5. อนุญาตกล้องหรือคลังรูปเมื่อแอปถาม

ไฟล์นี้ตรวจลายเซ็นแล้วและลงนามด้วย Android debug key เหมาะสำหรับติดตั้งทดสอบโดยตรง แต่ยังไม่ใช่ไฟล์สำหรับ Google Play Store ตรวจไฟล์หลังดาวน์โหลดได้ด้วย SHA-256 ใน `releases/mobile/SHA256SUMS.txt`

### สร้าง APK ใหม่

ต้องมี Node.js, Android Studio/Android SDK และ Java 21 จากนั้นรันจากโฟลเดอร์โครงการ:

```bash
npm ci
npm run build
npx cap sync android
cd android
ANDROID_HOME="$HOME/Library/Android/sdk" \
JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home" \
JAVA_TOOL_OPTIONS="-Duser.language=en -Duser.country=US" \
./gradlew assembleDebug
```

ผลลัพธ์อยู่ที่ `android/app/build/outputs/apk/debug/app-debug.apk` ส่วนขั้นตอนสร้างไฟล์ release ที่เซ็นจริงอยู่ใน `docs/ANDROID_BUILD_TH.md`

## iPhone/iPad: สร้างแอป native สำหรับติดตั้งผ่าน Xcode

iOS ไม่ติดตั้ง APK ต้อง build และ sign เป็นแอป iOS ผ่าน Xcode

1. ติดตั้ง Xcode แล้วเปิด **Xcode > Settings > Components**
2. ดาวน์โหลด iOS Platform/Simulator ที่ Xcode แจ้งว่าขาด
3. รันคำสั่งต่อไปนี้จากโฟลเดอร์โครงการ:

```bash
npm ci
npm run build
npx cap sync ios
open ios/App/App.xcodeproj
```

4. ใน Xcode เลือก target **App > Signing & Capabilities**
5. เพิ่ม Apple ID ใน **Xcode > Settings > Accounts** แล้วเลือก Team ของผู้พัฒนา เปิด **Automatically manage signing**
6. เชื่อม iPhone, เลือกอุปกรณ์ แล้วกด Run เพื่อ build, sign และติดตั้งบนเครื่องที่เชื่อมอยู่
7. หากต้องแจกผ่าน TestFlight/App Store ให้เลือก **Product > Archive > Distribute App** และใช้บัญชีนักพัฒนา Apple ที่พร้อมสำหรับการแจกจ่าย

ยังไม่มีไฟล์ `.ipa` ในชุดนี้ เพราะการติดตั้งบน iPhone ต้องเซ็นด้วย Apple Team/certificate ของเจ้าของแอป Xcode บนเครื่อง build นี้ยังไม่มี signing identity และต้องติดตั้ง iOS Platform ที่ตรงกับ Xcode ก่อน ในการใช้เครื่องอื่นให้เปิด **Xcode > Settings > Components** และติดตั้ง platform/runtime ที่ Xcode แจ้งว่าขาด จากนั้นทำขั้นตอนด้านบน

## หลังแก้หน้าเว็บ

โครงการปัจจุบันชี้ mobile shell ไปยัง `https://cassavaguard-render.onrender.com` จึงเห็นหน้าเว็บเวอร์ชันล่าสุดโดยอัตโนมัติ เมื่อแก้ native config/plugin ให้รัน `npm run build` และ `npx cap sync android` หรือ `npx cap sync ios` อีกครั้ง

## ข้อจำกัดที่ควรรู้

- ต้องมีอินเทอร์เน็ตเพื่อเรียก backend และโมเดล AI
- APK debug ใช้สำหรับทดสอบ/sideload ไม่ใช่ production release
- การลง iPhone ต้อง build ผ่าน Xcode และเซ็นด้วย Apple Team
- อย่าใส่ API key, keystore, certificate หรือรหัสผ่านลง GitHub
