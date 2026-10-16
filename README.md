# 🎓 EWU-Toolkit

<p align="center">
  <img src="icons/readme_cover.jpg" alt="EWU-Toolkit Cover Banner" width="100%">
</p>

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Manifest V3](https://img.shields.io/badge/Manifest-V3-blue.svg)](https://developer.chrome.com/docs/extensions/mv3/intro/)
[![Tampermonkey](https://img.shields.io/badge/Tampermonkey-Supported-brightgreen.svg)](https://www.tampermonkey.net/)
[![Android App](https://img.shields.io/badge/Android%20App-Download%20APK-brightgreen.svg?logo=android)](https://github.com/sowmiksudo/EWU-Toolkit/releases/download/v1.4.0/EWU-Toolkit-v1.40.apk)
[![Faculty Explorer](https://img.shields.io/badge/Web%20App-Faculty%20Explorer-6366f1.svg?logo=azure)](https://ewu-faculty-explorer.azurewebsites.net/)
[![East West University](https://img.shields.io/badge/Portal-portal.ewubd.edu-003366.svg)](https://portal.ewubd.edu/)

**EWU-Toolkit** is an open-source browser extension and userscript made by students, for students. It makes using the East West University student portal (`portal.ewubd.edu`) simpler, faster, and much more useful.

💖 **Open Source Project:** If this tool saves you time, please give it a ⭐ on [GitHub](https://github.com/sowmiksudo/EWU-Toolkit)!

---

## ⚡ 1-Click Install (Easiest Method - Tampermonkey)

> [!TIP]
> **Recommended:** Takes only 10 seconds and works across Chrome, Brave, Edge, Firefox, and mobile browsers (Kiwi / Orion)!

### 👉 [Click Here to Install Script](https://raw.githubusercontent.com/sowmiksudo/EWU-Toolkit/main/ewu-toolkit.user.js)

### Steps:
1. **Install the Tampermonkey extension** in your browser if you don't have it yet:
   - [Tampermonkey for Chrome / Edge / Brave](https://chromewebstore.google.com/detail/tampermonkey/dhdgffkkminghmkfafnlmfeedhkdaph)
   - [Tampermonkey for Firefox](https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/)
2. **Click the install link:**
   - Click 👉 **[Install Script](https://raw.githubusercontent.com/sowmiksudo/EWU-Toolkit/main/ewu-toolkit.user.js)**
   - Tampermonkey will open a tab showing the script details.
   - Click the green **"Install"** button.
3. **Open EWU Portal:**
   - Log into [portal.ewubd.edu](https://portal.ewubd.edu) — all features will work automatically! 🎉

---

## 📦 Alternative: Install as Chrome Extension

If you prefer installing it directly as a browser extension without Tampermonkey:

1. **Download the Extension:**
   - Download the latest **`EWU-Toolkit-v1.5.1.zip`** from [Releases](https://github.com/sowmiksudo/EWU-Toolkit/releases).
   - Unzip the downloaded folder on your computer.
2. **Open Extensions in Chrome:**
   - Type `chrome://extensions` in your Chrome URL address bar and press Enter.
3. **Turn on Developer Mode:**
   - Toggle on the **"Developer mode"** switch in the top right corner.
4. **Load the Extension:**
   - Click the **"Load unpacked"** button in the top left.
   - Select the unzipped folder containing `manifest.json`.
5. **Done!**
   - Click the extension icon anytime to jump straight to this GitHub repository. All extension settings are natively integrated right inside the EWU portal navigation sidebar!

---

## 📱 Native Android App (Instant Download)

Prefer using an app on your Android phone instead of a browser extension? EWU-Toolkit includes a lightweight native Android app:

### 👉 **[Download EWU-Toolkit Android App (APK)](https://github.com/sowmiksudo/EWU-Toolkit/releases/download/v1.4.0/EWU-Toolkit-v1.40.apk)**

* **1-Click Download**: Download the APK file (`app-debug.apk`) directly to your phone and install it (tap "Allow from this source" if prompted).
* **Pre-injected Toolkit**: Automatically loads `portal.ewubd.edu` with faculty reveal, visual routine timetable, seat counts, and ledger breakdown fully working out-of-the-box.
* **⚡ Dynamic Over-The-Air (OTA) Updates**: The app automatically fetches the latest toolkit scripts from GitHub in the background — no need to reinstall APKs for routine or style updates!
* **Native Android Integration**: Pull-to-refresh, hardware back button navigation, native system PDF printing (`PrintManager`), and direct file saving/sharing to Android's `Downloads` folder via the native Share Sheet.
* **Minimal Footprint**: Native Kotlin WebView with zero third-party bloatware (~5 MB).
* For developers or building from source, see [android/README.md](android/README.md).

---

## 🌐 Also Available: EWU Faculty & Section Explorer (Web App)

Looking for a dedicated web portal to browse, search, and plan course sections with faculty details before advising starts? Check out the **[EWU Faculty & Section Explorer](https://ewu-faculty-explorer.azurewebsites.net/)**:

### 👉 **[Launch EWU Faculty & Section Explorer](https://ewu-faculty-explorer.azurewebsites.net/)**

<p align="center">
  <a href="https://ewu-faculty-explorer.azurewebsites.net/" target="_blank">
    <img src="icons/faculty_explorer.png" alt="EWU Faculty and Section Explorer Web App" width="100%">
  </a>
</p>

* 🔍 **Instant Search & Multi-Filters**: Search by Course Code (e.g. `CSE101`), Teacher Name, Faculty Initial (`MIR`, `SJA`, `AUR`), Classroom (`AB1-601`, `SEIP Lab`), or schedule timings.
* 📋 **Department & Seat Status Filters**: Narrow down sections by department, schedule days, and open/full seats.
* 🔀 **Cards & Table Views**: Easily switch between a high-density table and visual card layout.
* 📄 **1-Click PDF Export**: Download clean, print-ready PDF section overviews for offline planning.

> [!IMPORTANT]
> **🔒 Access Confidentiality & Prevention of Misuse:**  
> To protect institutional privacy, safeguard faculty contact details, and prevent automated web scraping or misuse by outside third parties, access to the Faculty Explorer web app **strictly requires logging in with your official East West University student account (`@std.ewubd.edu`)**. Only verified EWU students are granted access.

---

## ✨ Features (Explained in Simple Words)

### 1. 📅 Visual Weekly Routine, Mobile Day Agenda & Multi-Export
* **The Problem:** The advising slip is a plain list of text rows without a calendar layout, making it difficult to see class timings, daily breaks, or routine details on mobile devices.
* **What EWU-Toolkit does:**
  * Shows a weekly timetable below your class schedule table.
  * **View Switcher**:
    * **Grid Timetable**: Desktop view displaying all days and time slots together.
    * **Day Agenda**: Mobile view with individual day tabs (`Sun`, `Mon`, `Tue`, `Wed`, `Thu`, `Fri`, `Sat`) showing clean class cards with course codes, sections, rooms, teacher initials, and copy buttons for email addresses.
  * Warns you if any of your enrolled courses overlap in schedule.
  * Includes an **"Export ▾"** menu:
    * 📅 **Add to Google Calendar**: Adds your weekly recurring classes to Google Calendar.
    * 📆 **Export Calendar (.ics)**: Downloads a standard `.ics` calendar file for your phone or desktop calendar app.
    * 🖼️ **Export as Image (.png)**: Saves an image of your routine with compact borders for quick sharing.
    * 📊 **Export to Excel (.xlsx)**: Downloads an Excel spreadsheet with your routine and course schedule.
    * 🖨️ **Print / Save as PDF**: Clean, print-friendly layout formatted for saving as PDF or printing.

<p align="center">
  <img src="images/routine_export_menu.png" alt="Weekly Class Routine and Export Menu" width="100%">
</p>

### 2. 🔍 See Teacher Names & Emails on Your Class Schedule
* **The Problem:** The university portal hides faculty names, initials, and emails on your class schedule and advising slip.
* **What EWU-Toolkit does:** 
  * Automatically reveals your teachers' **initials**, **full names**, and official **emails**.
  * Adds a handy **"📋 Copy"** button next to every email address so you can copy it in 1 click.
  * Clicking an email address opens your email app directly to write an email.
  * Everything stays visible when you press `Ctrl + P` to print or save your advising slip as a PDF.

<p align="center">
  <img src="icons/faculty name tab.png" alt="Unhidden Faculty Initials, Names and Emails" width="100%">
</p>

### 3. 💺 Know How Many Seats Are Left & Hide Full Courses
* **The Problem:** During advising rush, you have to read confusing numbers like `28 / 30` to guess how many seats are left, while scrolling through dozens of full sections.
* **What EWU-Toolkit does:**
  * Displays easy color-coded badges for every course:
    * 🟢 **Green:** Open (e.g. `8 left`)
    * 🟡 **Yellow:** Almost full (`1 - 5 left`)
    * 🔴 **Red:** Full (`0 left`)
  * Adds a **"Show Open Sections Only"** checkbox at the top: check it, and all full courses disappear instantly so you only see what you can actually take!
  * Adds an **instant search bar** to filter courses by course code, room number, or time slot.

<p align="center">
  <img src="icons/Screenshot 2026-09-12 171554.png" alt="Seat Availability Badges and Open Sections" width="100%">
</p>

### 4. 📊 Understand Your Tuition Fees & Dues Easily
* **The Problem:** The student accounts ledger is a giant, confusing table of "Debit Notes" and "Credit Notes".
* **What EWU-Toolkit does:**
  * Adds a clean **financial summary** right above the table:
    * 💳 **Total Money Paid:** Sum of all your bank and online deposit receipts.
    * 🎓 **Scholarships & Waivers:** Total merit discounts and waivers granted to you.
    * 💰 **Total Tuition Billed:** Total university fees charged across all semesters.
    * ⚠️ **Current Due:** Exactly how much you need to pay for the current semester.
  * Shows a neat **semester-by-semester table** with green `✓ Cleared` badges for completed semesters and clear amounts for pending terms.

<p align="center">
  <img src="icons/account ledger.png" alt="Accounts Ledger Breakdown and Bento Summary" width="100%">
</p>

### 5. ⚡ Automatic Math Captcha Solver on Student Login
* **The Problem:** Every time you log into the EWU Student Portal (`portal.ewubd.edu`), you must manually calculate a random two-number math addition problem (e.g. `6 + 16 = ?`), slowing down login even when credentials are saved.
* **What EWU-Toolkit does:**
  * Detects the math captcha numbers on page load.
  * Calculates the sum and fills the answer field automatically.
  * Adds a **`✓ Auto-solved`** badge and green border indicator.
  * Allows signing in with Enter when browser credentials are saved.
  * Leaves manual typing intact if you edit the field, and recalculates if a new captcha appears.

### 6. 🎯 Advising Window: Course Search, Faculty Reveal & Clash Alerts
* **The Problem:** During live course advising on `portal.ewubd.edu/Home/Advising`, teacher initials are hidden, scrolling through hundreds of sections is slow, and there is no advance warning if a section has no seats or clashes with a course you already selected.
* **What EWU-Toolkit does:**
  * **Dynamic Search Bar**: Type to filter sections by course code (e.g. `CSE405`, `BUS101`), section number, teacher name or initial, room, or timing.
  * **Open Seats Only Filter**: Hide sections with 0 remaining seats so you only see what is available.
  * **No Time Clashes Filter**: Hide sections that conflict with any course already added to your schedule.
  * **Day & Time Chips**: Filter sections by schedule days (`ST`, `MW`, `SR`, `TR`, `RA`, `Fri`) or class times.
  * **Teacher Initials**: Displays teacher initials in the course selection table rows.
  * **Seat Counter Badges**: Shows remaining seats (e.g. `6 left (24/30)`) and marks full sections with a red `FULL` badge.
  * **Enrolled Indicators**: Displays a `✓ Enrolled` badge next to courses you already added.
  * **Multi-Tab Support**: Works across all 4 advising tabs (**F Grade Courses**, **Recommended Courses**, **D / D+ Courses**, and **Retakable Courses**).

<p align="center">
  <img src="images/advising_course_browser.png" alt="Advising Portal Course Browser and Filtering" width="100%">
</p>

### 7. 🧮 What-If CGPA & Target Graduation Planner
* **The Problem:** On the Degree Review page (`/Home/DegreeReview`), students have to calculate by hand how retakes or future semester grades might change their final graduating CGPA.
* **What EWU-Toolkit does:**
  * Injects a planning calculator directly above your degree review summary.
  * **Retake Simulator**: Pick any completed course and choose a simulated new grade (for example, replacing a `C+` with an `A`). It calculates your new CGPA following EWU's exact retake policy (replacing old grade points while keeping credits constant).

<p align="center">
  <img src="images/cgpa_retake_simulator.png" alt="Degree Review Retake Simulator" width="100%">
</p>

  * **Target CGPA Planner**: Enter your total degree credits (e.g. `136`) and your goal graduation CGPA (e.g. `3.75`). It shows the average GPA needed in your remaining credits to reach that goal.

<p align="center">
  <img src="images/cgpa_target_planner.png" alt="Degree Review Target CGPA Planner" width="100%">
</p>

### 8. 🛒 Course Basket & Schedule Conflict Detection
* **The Problem:** Planning your courses before advising involves writing sections on paper or manually checking whether two courses clash.
* **What EWU-Toolkit does:**
  * Adds **"+ Draft"** buttons next to each section on Offered Courses (`/Home/OfferedCourses`).
  * Provides a collapsible bottom **Draft Basket drawer** with **Plan A** and **Plan B** preset tabs.
  * **Schedule Conflict Detection**: Identifies overlapping times across all EWU day combinations (`ST`, `MW`, `SR`, `TR`, `RA`, `Fri`), marks conflicting sections, and highlights rows in red.
  * **Export Schedule**: Export your drafted schedule to Google Calendar or download a `.ics` file.

### 9. 🔍 Offered Courses Filters & Search Modal (`Ctrl + K`)
* **The Problem:** Finding sections with specific day combinations or morning slots requires manual scrolling through long tables.
* **What EWU-Toolkit does:**
  * Injects day filter chips (`ST`, `MW`, `SR`, `TR`, `RA`, `Fri`) and morning/afternoon time filters.
  * Adds a search modal (`Ctrl + K` / `Cmd + K`) on the Offered Courses page to search by course code, section, room, or faculty initial.

### 10. 🌙 Dark Mode Theme
* **The Problem:** The student portal only has a bright white background, which can be tiring to look at in low light.
* **What EWU-Toolkit does:**
  * Adds a dark theme covering portal pages, navigation, cards, and tables.
  * Includes a floating quick-toggle button (`🌙` / `☀️`) and a toggle switch in settings.

### 11. ⚙️ In-Portal Sidebar Settings
* **The Problem:** Extension popup windows close when clicking outside and are difficult to use on mobile screens.
* **What EWU-Toolkit does:**
  * Moves settings into the student portal navigation sidebar (`⚙️ EWU-Toolkit Settings`).
  * Opens a settings modal to turn individual features on or off.
  * Checks for new releases in the background and displays an update notification card with download link when a new version is available.
  * Clicking the browser extension icon in the toolbar opens this GitHub repository.

---

## 👥 Contributors

Thank you to all the students and developers who contribute to making **EWU-Toolkit** better!

<a href="https://github.com/sowmiksudo/EWU-Toolkit/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=sowmiksudo/EWU-Toolkit" alt="EWU-Toolkit Contributors" />
</a>

Contributions of any kind (new features, bug fixes, UI improvements, or ideas) are warmly welcomed! Feel free to check out open [Issues](https://github.com/sowmiksudo/EWU-Toolkit/issues) or submit a [Pull Request](https://github.com/sowmiksudo/EWU-Toolkit/pulls).

---

## 📄 License

This project is open-sourced under the **[MIT License](LICENSE)**. 
- You are free to use, study, modify, and share this software.
- Provided "as-is" without warranty, created by and for the EWU student community.
