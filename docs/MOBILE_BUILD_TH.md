# การติดตั้ง CassavaGuard บน Android และ iOS

CassavaGuard Mobile เป็นแอปแบบ Capacitor ที่เปิดหน้าเว็บ CassavaGuard จาก Render ภายในแอปมือถือ การวิเคราะห์ AI ยังทำที่ backend ดังนั้นโทรศัพท์ต้องเชื่อมต่ออินเทอร์เน็ต

## Android: ติดตั้ง APK สำหรับทดสอบ

ไฟล์พร้อมติดตั้งอยู่ที่ `releases/mobile/CassavaGuard-Android-v1.0-debug.apk`

1. ดาวน์โหลดไฟล์ APK ลงโทรศัพท์ Android
2. เปิดไฟล์จาก Downloads
3. ถ้าระบบเตือน ให้เปิดสิทธิ์ **Install unknown apps** สำหรับเบราว์เซอร์หรือแอป Files ที่ใช้เปิดไฟล์
4. กด **Install** แล้วเปิด **CassavaGuard AI**
5. อนุญาตกล้องหรือคลังรูปเมื่อแอปถาม

ไฟล์นี้ลงลายเซ็นด้วย Android debug key เหมาะสำหรับติดตั้งทดสอบโดยตรง แต่ยังไม่ใช่ไฟล์สำหรับ Google Play Store

### สร้าง APK ใหม่

ต้องมี Node.js, Android Studio/Android SDK และ Java 21 จากนั้นรันจากโฟลเดอร์โครงการ:

```bash
npm install
npm run build
npx cap sync android
cd android
ANDROID_HOME="$HOME/Library/Android/sdk" \
JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home" \
JAVA_TOOL_OPTIONS="-Duser.language=en -Duser.country=US" \
./gradlew assembleDebug
```

ผลลัพธ์อยู่ที่ `android/app/build/outputs/apk/debug/app-debug.apk` ส่วนขั้นตอนสร้างไฟล์ release ที่เซ็นจริงอยู่ใน `docs/ANDROID_BUILD_TH.md`

## iPhone/iPad: เปิดด้วย Xcode

iOS ไม่ติดตั้ง APK ต้อง build และ sign เป็นแอป iOS ผ่าน Xcode

1. ติดตั้ง Xcode แล้วเปิด **Xcode > Settings > Components**
2. ดาวน์โหลด iOS Platform/Simulator ที่ Xcode แจ้งว่าขาด
3. รันคำสั่งต่อไปนี้จากโฟลเดอร์โครงการ:

```bash
npm install
npm run build
npx cap sync ios
open ios/App/App.xcodeproj
```

4. ใน Xcode เลือก target **App > Signing & Capabilities**
5. เลือก Apple ID/Team ของผู้พัฒนา และตั้ง Bundle Identifier ให้ไม่ซ้ำถ้าจำเป็น
6. เชื่อม iPhone, เลือกอุปกรณ์ แล้วกด Run
7. หากต้องแจกผ่าน TestFlight/App Store ให้เลือก **Product > Archive > Distribute App**

การสร้าง `.ipa` ที่ติดตั้งบนเครื่องจริงต้องมี Apple signing certificate และ provisioning profile ของเจ้าของบัญชี จึงไม่ควรเก็บ certificate หรือรหัสผ่านไว้ใน GitHub

## หลังแก้หน้าเว็บ

โครงการปัจจุบันชี้ mobile shell ไปยัง `https://cassavaguard-render.onrender.com` จึงเห็นหน้าเว็บเวอร์ชันล่าสุดโดยอัตโนมัติ เมื่อแก้ native config/plugin ให้รัน `npm run build` และ `npx cap sync android` หรือ `npx cap sync ios` อีกครั้ง

## ข้อจำกัดที่ควรรู้

- ต้องมีอินเทอร์เน็ตเพื่อเรียก backend และโมเดล AI
- APK debug ใช้สำหรับทดสอบ/sideload ไม่ใช่ production release
- การลง iPhone ต้องใช้ Xcode และการลงนามจาก Apple
- อย่าใส่ API key, keystore, certificate หรือรหัสผ่านลง GitHub
