# 📱 EWU-Toolkit Android App

A clean, native, lightweight Android WebView application for **EWU-Toolkit**. It wraps the East West University student portal (`portal.ewubd.edu`) and injects the complete EWU-Toolkit suite with native Android optimizations.

---

## ⚡ Key Highlights

- **Ultra-Lightweight**: Minimal APK size, zero heavy frameworks, built on pure AndroidX & Material Components.
- **Dynamic Over-The-Air (OTA) Updates**: The app automatically checks GitHub's raw download link in the background on startup and pull-to-refresh. When you push changes to GitHub `main`, installed apps update their JavaScript/CSS dynamically without requiring users to reinstall or download a new APK!
- **Offline & Instant Startup Fallback**: The app loads from local cache / bundled assets instantly with zero startup delay, ensuring 100% offline availability even without an internet connection.
- **Zero-Maintenance Sync**: Whenever `python build_userscript.py` is executed in the repository root (or during a Gradle build), `ewu-toolkit.user.js` is automatically mirrored into `app/src/main/assets/`.
- **Native Android Enhancements**:
  - **Pull-to-Refresh**: Native `SwipeRefreshLayout` to quickly refresh advising and course pages, and trigger script update checks.
  - **Hardware Back Button**: Full history back-stack handling (`webView.goBack()`).
  - **Direct Downloads & Share Sheet**: Exporting routine images (`.png`) or spreadsheets (`.xlsx`) automatically writes to Android's `Download/` directory and triggers the native Android Share Sheet (WhatsApp, Telegram, Drive, etc.).
  - **Print / Save as PDF**: Tapping Print connects directly to Android's native `PrintManager`.
  - **Email Client Handlers**: Tapping faculty email addresses automatically launches Gmail, Outlook, or system email apps.

---

## 🛠️ How to Open & Build

### In Android Studio
1. Open **Android Studio**.
2. Click **Open** and select the `android/` directory inside this repository.
3. Allow Gradle to sync dependencies.
4. Click **Run (`Shift + F10`)** to launch on an Android emulator or connected device.

### Generate APK via Terminal
```bash
# On Windows (PowerShell)
cd android
./gradlew assembleDebug

# Output APK will be at:
# android/app/build/outputs/apk/debug/app-debug.apk
```

---

## 🔄 Dynamic Updates vs APK Rebuilds

### 1. Small Fixes & Toolkit Enhancements (Instant OTA - No APK rebuild needed)
When you fix a bug or add a CSS/JS feature to `content.js` or `content.css`:
1. Rebuild and commit userscript:
   ```bash
   python build_userscript.py
   git commit -am "fix: update routine styles"
   git push origin main
   ```
2. **That's it!** All users with the Android app will automatically receive the updated script directly from GitHub's raw download link on their next app launch or pull-to-refresh.

### 2. Native Android Code Updates (New APK required)
Only rebuild the APK if you change native Kotlin code (such as `MainActivity.kt`, permissions in `AndroidManifest.xml`, or native file handlers).
