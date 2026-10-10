# CassavaGuard Mobile builds

- [CassavaGuard-Android-v1.1.0-debug.apk](CassavaGuard-Android-v1.1.0-debug.apk) — current Android install package (4 MB), signed with the Android debug key for sideload/testing.
- `CassavaGuard-Android-v1.0-debug.apk` — previous build, kept for reference.
- `SHA256SUMS.txt` — SHA-256 checksums for both APK files.

The app opens the production CassavaGuard website and requires an internet connection for sign-in and AI analysis. See `docs/MOBILE_BUILD_TH.md` for installation steps.

For both iPhone and Android, users can also install the web app from [cassavaguard-render.onrender.com](https://cassavaguard-render.onrender.com) using the browser's **Add to Home Screen / Install app** option. On iPhone, use Safari's Share → Add to Home Screen. This does not require App Store distribution.

iOS source is under `ios/` at version 1.1.0. A package for physical iPhones must be built and signed in Xcode using the owner's Apple signing team; no iOS signing certificate is stored in this repository.
