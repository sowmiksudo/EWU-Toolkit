# 🎓 EWU Portal - Reveal Faculty Info

[![Manifest V3](https://img.shields.io/badge/Manifest-V3-blue.svg)](https://developer.chrome.com/docs/extensions/mv3/intro/)
[![Tampermonkey](https://img.shields.io/badge/Tampermonkey-Supported-brightgreen.svg)](https://www.tampermonkey.net/)
[![East West University](https://img.shields.io/badge/Portal-portal.ewubd.edu-003366.svg)](https://portal.ewubd.edu/)

Reveals hidden **Faculty Initial**, **Faculty Name**, and **Faculty Email** on the East West University (EWU) student portal's **Class Schedule** and **Advising Slip** page (`https://portal.ewubd.edu/Home/ClassSchedule`).

---

## ⚡ 1-Click Installation (Tampermonkey - Easiest & Recommended)

> [!TIP]
> **This is the fastest method** — works in 1 click across Chrome, Brave, Edge, Firefox, and even mobile browsers (Kiwi / Orion)!

### 👉 [Click Here to Install Script](https://raw.githubusercontent.com/sowmiksudo/show-faculty-info--EWU/main/ewu-faculty-reveal.user.js)

### Step-by-Step Instructions:
1. **Install Tampermonkey** (if you don't already have it):
   - [Get Tampermonkey for Chrome / Edge / Brave](https://chromewebstore.google.com/detail/tampermonkey/dhdgffkkminghmkfafnlmfeedhkdaph)
   - [Get Tampermonkey for Firefox](https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/)
2. **Click the install link:**
   - Click 👉 **[Install Script](https://raw.githubusercontent.com/sowmiksudo/show-faculty-info--EWU/main/ewu-faculty-reveal.user.js)**
   - Tampermonkey will automatically open an **"Install Userscript"** tab.
   - Click the green **"Install"** button.
3. **Open EWU Portal:**
   - Go to [portal.ewubd.edu/Home/ClassSchedule](https://portal.ewubd.edu/Home/ClassSchedule).
   - The hidden **Faculty Initial**, **Faculty Name**, and **Faculty Email** columns will immediately appear! 🎉

---

## 📦 Alternative: Install as Chrome Extension (Developer Mode)

If you prefer using a standalone Chrome Extension without installing Tampermonkey:

1. **Download / Clone this repository:**
   - Clone: `git clone https://github.com/sowmiksudo/show-faculty-info--EWU.git`
   - Or click **Code $ightarrow$ Download ZIP** on GitHub and extract the folder.
2. **Open Extensions in Chrome:**
   - Navigate to `chrome://extensions` in your Chrome URL bar.
3. **Enable Developer Mode:**
   - Toggle on the **"Developer mode"** switch in the top right corner.
4. **Load the Extension:**
   - Click **"Load unpacked"** in the top left.
   - Select the folder containing `manifest.json` (`show-faculty-info--EWU`).
5. **Done!**
   - Pin the extension icon to your toolbar.
   - Open [portal.ewubd.edu/Home/ClassSchedule](https://portal.ewubd.edu/Home/ClassSchedule).

---

## ✨ Features

- 🔍 **Instant Unhiding**: Automatically reveals the 3 faculty columns (`Faculty Initial`, `Faculty Name`, `Faculty Email`) that the university portal serves in HTML but hides via AngularJS `.ng-hide`.
- 📋 **1-Click Copy**: Includes a handy "Copy" button next to every faculty email.
- ✉️ **Clickable Mailto Links**: Click any email to compose an email directly in your default mail app.
- 🏷️ **Initials Badge**: Clean, styled badge for teacher initials for easy scanning.
- 🖨️ **Print-Friendly**: When you press `Ctrl + P` to print or save your advising slip as a PDF, the faculty columns are cleanly preserved.
- ⚡ **Zero Lag & Real-Time**: Uses lightweight DOM mutation observers, reacting instantly when switching semesters or filtering courses.

---

## 📸 Preview

### What EWU serves vs What you see with this extension:

| Course | Section | Timing | Room No. | Faculty Initial | Faculty Name | Faculty Email |
|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **MAT291** | 2 | ST 4:50PM-6:20PM | AB1-802 | `APURBO` | Apurbo Roy Chowdhury | `apurbo.roy@ewubd.edu` [📋 Copy] |
| **STA293** | 2 | SR 11:50AM-1:20PM | AB1-802 | `AAS` | DR. AFSANA AL SHARMIN | `aas@ewubd.edu` [📋 Copy] |
| **PPHS7102** | 4 | MW 3:10PM-4:40PM | 429 | `DAAH` | Dr Aeorangajeb Al Hossain | `aeorangajeb.hossain@ewubd.edu` [📋 Copy] |

---

## 🛠️ File Structure

```
show-faculty-info--EWU/
├── manifest.json              # Chrome Extension Manifest V3 configuration
├── content.css                # CSS rules overriding Angular's .ng-hide
├── content.js                 # Dynamic observer, email copy helper & table enhancements
├── popup.html                 # Extension popup interface
├── popup.css                  # Modern styling for popup
├── popup.js                   # Popup toggle logic & storage sync
├── icons/                     # Extension icons (16x16, 48x48, 128x128)
├── ewu-faculty-reveal.user.js # Standalone 1-Click Tampermonkey script
├── table_reference.html       # Sample EWU portal DOM structure reference
└── README.md                  # Documentation and install guide
```

---

## 📄 License
MIT License. Created for East West University students.
