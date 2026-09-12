# 📱 EWU-Toolkit Android App

A clean, native, lightweight Android WebView application for **EWU-Toolkit**. It wraps the East West University student portal (`portal.ewubd.edu`) and injects the complete EWU-Toolkit suite with native Android optimizations.

---

## ⚡ Key Highlights

- **Ultra-Lightweight**: Minimal APK size (~2 MB), zero heavy frameworks, built on pure AndroidX & Material Components.
- **Zero-Maintenance Sync**: Whenever `python build_userscript.py` is executed in the repository root (or during a Gradle build), the latest `ewu-toolkit.user.js` is automatically mirrored into `app/src/main/assets/`.
- **Native Android Enhancements**:
  - **Pull-to-Refresh**: Native `SwipeRefreshLayout` to quickly refresh advising and course pages.
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

## 🔄 How Future Updates Work (Zero Hassle)

You don't need to manually edit Java or Kotlin code when updating the toolkit:
1. Make your JavaScript or CSS modifications in the root `content.js` or `content.css`.
2. Run:
   ```bash
   python build_userscript.py
   ```
3. The script will automatically compile and mirror `ewu-toolkit.user.js` directly into `android/app/src/main/assets/ewu-toolkit.user.js`.
4. Build the Android app — the latest features are immediately live!
