# 🎓 EWU-Toolkit

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Manifest V3](https://img.shields.io/badge/Manifest-V3-blue.svg)](https://developer.chrome.com/docs/extensions/mv3/intro/)
[![Tampermonkey](https://img.shields.io/badge/Tampermonkey-Supported-brightgreen.svg)](https://www.tampermonkey.net/)
[![East West University](https://img.shields.io/badge/Portal-portal.ewubd.edu-003366.svg)](https://portal.ewubd.edu/)

**EWU-Toolkit** is an open-source browser extension and userscript suite for East West University (EWU) students. It reveals hidden **Faculty Initial**, **Faculty Name**, and **Faculty Email** on the EWU portal's **Class Schedule** and **Advising Slip** pages (`https://portal.ewubd.edu/Home/ClassSchedule`).

💖 **Open Source Project:** Contributions and feature suggestions are welcome! If you find this helpful, please consider giving it a ⭐ on [GitHub](https://github.com/sowmiksudo/EWU-Toolkit).

---

## ⚡ 1-Click Installation (Tampermonkey - Easiest & Recommended)

> [!TIP]
> **This is the fastest method** — works in 1 click across Chrome, Edge, Brave, Firefox, and mobile browsers (Kiwi / Orion)!

### 👉 [Click Here to Install Script](https://raw.githubusercontent.com/sowmiksudo/EWU-Toolkit/main/ewu-toolkit.user.js)

### Step-by-Step Instructions:
1. **Install Tampermonkey** (if you don't already have it):
   - [Get Tampermonkey for Chrome / Edge / Brave](https://chromewebstore.google.com/detail/tampermonkey/dhdgffkkminghmkfafnlmfeedhkdaph)
   - [Get Tampermonkey for Firefox](https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/)
2. **Click the install link:**
   - Click 👉 **[Install Script](https://raw.githubusercontent.com/sowmiksudo/EWU-Toolkit/main/ewu-toolkit.user.js)**
   - Tampermonkey will automatically open an **"Install Userscript"** tab.
   - Click the green **"Install"** button.
3. **Open EWU Portal:**
   - Go to [portal.ewubd.edu/Home/ClassSchedule](https://portal.ewubd.edu/Home/ClassSchedule).
   - The hidden **Faculty Initial**, **Faculty Name**, and **Faculty Email** columns will immediately appear! 🎉

---

## 📦 Alternative: Install as Chrome Extension (Developer Mode)

If you prefer using a standalone Chrome Extension:

1. **Download / Clone this repository:**
   - `git clone https://github.com/sowmiksudo/EWU-Toolkit.git`
   - Or click **Code $ightarrow$ Download ZIP** on GitHub and extract the folder.
2. **Open Extensions in Chrome:**
   - Navigate to `chrome://extensions` in your Chrome URL bar.
3. **Enable Developer Mode:**
   - Toggle on the **"Developer mode"** switch in the top right corner.
4. **Load the Extension:**
   - Click **"Load unpacked"** in the top left.
   - Select the folder containing `manifest.json`.
5. **Done!**
   - Click the extension icon in your toolbar to see the **EWU-Toolkit** dialogue showing:
     - **Name:** EWU-Toolkit
     - **Version:** 1.0.0
     - **GitHub Repo:** `github.com/sowmiksudo/EWU-Toolkit`
     - **License:** MIT License
   - Open [portal.ewubd.edu/Home/ClassSchedule](https://portal.ewubd.edu/Home/ClassSchedule).

---

## ✨ Key Features

- 🔍 **Instant Unhiding**: Automatically reveals the 3 faculty columns (`Faculty Initial`, `Faculty Name`, `Faculty Email`) that the university portal serves in HTML but hides via AngularJS `.ng-hide`.
- 📋 **1-Click Copy**: Includes a handy "Copy" button next to every faculty email.
- ✉️ **Clickable Mailto Links**: Click any email to compose an email directly in your default mail app.
- 🏷️ **Initials Badge**: Clean, styled badge for teacher initials for easy scanning.
- 🖨️ **Print-Friendly**: When you press `Ctrl + P` to print or save your advising slip as a PDF, the faculty columns are cleanly preserved.
- ℹ️ **Extension Dialogue**: Displays version (1.0.0), project name, MIT license details, and quick link to the open-source GitHub repository.
- 🌿 **Eye-Friendly White/Light Theme Notice**: A gentle, modern notice banner right above the schedule table designed to blend naturally with the portal without straining your eyes, featuring an open-source gesture to GitHub.

---

## 📸 Preview

### What EWU serves vs What you see with EWU-Toolkit:

| Course | Section | Timing | Room No. | Faculty Initial | Faculty Name | Faculty Email |
|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **MAT291** | 2 | ST 4:50PM-6:20PM | AB1-802 | `APURBO` | Apurbo Roy Chowdhury | `apurbo.roy@ewubd.edu` [📋 Copy] |
| **STA293** | 2 | SR 11:50AM-1:20PM | AB1-802 | `AAS` | DR. AFSANA AL SHARMIN | `aas@ewubd.edu` [📋 Copy] |
| **PPHS7102** | 4 | MW 3:10PM-4:40PM | 429 | `DAAH` | Dr Aeorangajeb Al Hossain | `aeorangajeb.hossain@ewubd.edu` [📋 Copy] |

---

## 🛠️ File Structure

```
EWU-Toolkit/
├── manifest.json         # Chrome Extension Manifest V3 configuration
├── content.css           # CSS rules overriding Angular's .ng-hide & UI polish
├── content.js            # Dynamic observer, email copy helper & open-source banner
├── popup.html            # Extension popup dialogue (name, version, repo, license)
├── popup.css             # Modern styling for popup dialogue
├── popup.js              # Popup toggle logic, license toggler & storage sync
├── icons/                # Extension icons (16x16, 48x48, 128x128)
├── ewu-toolkit.user.js   # Standalone 1-Click Tampermonkey script
├── LICENSE               # MIT License
├── table_reference.html  # Sample EWU portal DOM structure reference
└── README.md             # Documentation and install guide
```

---

## 📄 License

This project is open-sourced under the **[MIT License](LICENSE)**. 

### Why MIT License?
- **Permissive & Open:** Anyone can freely use, modify, study, or contribute to it.
- **Liability Protection:** Protects contributors by disclaiming any warranty or liability.
- **Community Standard:** Widely recognized and trusted across the open-source community.
