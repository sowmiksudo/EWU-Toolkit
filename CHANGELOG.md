# 📋 Changelog

All notable changes to the **EWU-Toolkit** project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.5.1] - 2026-10-16

### Added
- **Advising Window Course Search and Filter Bar**:
  - Dynamic text search box filtering course sections by course code, section number, instructor name, room, or time on `portal.ewubd.edu/Home/Advising`.
  - Filter toggle checkboxes:
    - **Open Seats Only**: Filters out sections with 0 remaining capacity.
    - **No Time Clashes**: Hides sections that overlap with courses already added to your schedule.
  - Day filter chips (`ST`, `MW`, `SR`, `TR`, `RA`, `Fri`) and time slot filters (Morning, Afternoon, Evening) for filtering advising options.
  - Badges displaying remaining seat counts (e.g. `8 left (22/30)`) and full section markers.
  - Indicators for courses already added to your schedule (`✓ Enrolled`).
  - Support across all four advising tabs: Recommended Courses, D / D+ Courses, Retakable Courses, and F Grade Courses, using dynamic column detection.
- **Documentation Images & Visual Guides**:
  - Added screenshots for the advising course browser, routine export menu, retake simulator, and target CGPA planner to the `images/` directory.
  - Updated `README.md` with step-by-step descriptions and screenshots for each feature.
- **Chrome Extension Update Checker**:
  - Background service worker checks the GitHub Releases API periodically for newer releases.
  - Injects an update notification card into the settings modal and highlights the sidebar badge with the new version number when available.
  - Adds a manual "Check for Updates" button inside the student portal settings modal.
  - Displays a "NEW" badge on the Chrome toolbar extension icon when a new version is published.

### Changed
- Refactored table column indexing on advising pages to adapt dynamically to varying column layouts across advising tabs.
- Replaced extension toolbar popup with a direct link to the project repository, with settings accessible from the student portal sidebar.
- Removed AI buzzwords and simplified phrasing across documentation.

---

## [1.5.0] - 2026-10-15

### 🚀 Major Release: Dark Mode, What-If CGPA Planner, Advising Basket & Clash Sandbox

- **🎯 Advising Window Faculty Revealer**:
  - Automatically captures and unhides teacher initials (`ShortName`) during live advising / course selection on `portal.ewubd.edu/Home/Advising`.
  - Injects non-intrusive faculty badges directly into routine selection rows without calling any private or backend-only APIs.
- **🧮 Interactive "What-If" CGPA & Target Graduation Planner**:
  - Injected directly into the Degree Review / Grades page (`/Home/DegreeReview`).
  - **Retake Simulator**: Allows testing improved grades for previously taken courses, accurately calculating the CGPA boost by replacing old grade points while keeping credits constant.
  - **Graduation Target Planner**: Calculates the exact average GPA required in remaining credits to achieve your target graduation CGPA (e.g. 3.50, 3.80), with dynamic feasibility banners (Achievable, Requires High Performance, or Mathematically Impossible).
- **🛒 Advising Course Basket & Real-Time Conflict Sandbox**:
  - Interactive course draft sandbox added to Offered Courses (`/Home/OfferedCourses`).
  - Add courses to draft with 1-click **"+ Draft"** buttons.
  - Supports **Plan A** and **Plan B** preset baskets stored in browser storage.
  - Real-time time-overlap and day clash detection engine across all EWU schedules (`ST`, `MW`, `SR`, `TR`, `RA`, `Fri`).
  - Visual clash warnings and table row highlighting for conflicting sections.
  - Export basket to Google Calendar or universal `.ics` file.
- **🔍 Smart Day & Time Filter Chips + Spotlight Search (`Ctrl + K`)**:
  - Added one-click day chips (`ST`, `MW`, `SR`, `TR`, `RA`, `Fri`) and morning/afternoon time filters on Offered Courses.
  - Added global quick-access spotlight search modal triggered by `Ctrl + K` / `Cmd + K` to search course codes, sections, rooms, and faculty initials instantly.
- **🌙 Eyes-Friendly Dark Mode**:
  - Complete dark theme for `portal.ewubd.edu` and `faportal.ewubd.edu` covering tables, navigation bars, bento cards, inputs, and modals.
  - Floating dark/light toggle button (`🌙` / `☀️`) and native sidebar toggle switch.
- **⚙️ Integrated Sidebar Settings Modal**:
  - Full management of all 9 modular features directly from the portal sidebar.
  - Clicking toolbar extension icon redirects to GitHub repository.

---

## [1.4.0] - 2026-10-15

### 🚀 Added & Improved
- **In-Portal Sidebar Settings Page & Modal**:
  - Moved all extension controls natively into `portal.ewubd.edu` inside the student portal sidebar (`⚙️ EWU-Toolkit Settings`).
  - Added modern in-portal settings modal with backdrop blur, smooth switch toggles for all 5 superpowers, active status indicator, and quick links.
  - Added a floating settings shortcut button accessible on all portal pages and mobile screens.
  - Clicking the toolbar extension icon in Chrome now redirects directly to the open-source repository on GitHub via background service worker (`background.js`).
- **Mobile-Friendly Dynamic Weekly Routine Timetable & Day Agenda**:
  - Added a dynamic view switcher on the routine card: `[📅 Timetable Grid]` and `[📋 Day Agenda]`.
  - On mobile screens (`< 768px`) or when selected, automatically displays an interactive day selector tab strip (`Sun`, `Mon`, `Tue`, `Wed`, `Thu`, `Fri`, `Sat`).
  - Selecting a day renders clean chronological class cards displaying start/end times, course code, section, room badge, teacher name, initial, and 1-click email copy button.
  - Day pills display course counts and automatically select the current day.
- **Google Calendar & iCalendar (.ics) Export**:
  - Added **"📅 Add to Google Calendar"** in the routine export menu for 1-click batch calendar synchronization.
  - Added **"📆 Export Calendar (.ics)"** generating RFC 5545 `.ics` files with recurring weekly VEVENTs and 15-minute reminders, working 100% offline across iOS, Android, macOS, and Windows.

---

## [1.3.2] - 2026-10-09

### 🚀 Added
- **Automatic Login Math Captcha Solver**:
  - Automatically parses two-number addition operands from student and portal login forms (`#lblFirstNo` / `#lblSecondNo`, `FirstNo` / `SecondNo` hidden fields, and arithmetic text patterns).
  - Instantly computes the sum and populates the answer field (`#lblcaptchaAnswer` / `name="Answer"`), setting both DOM value property and HTML attribute.
  - Injects a sleek, unobtrusive **`✓ Auto-solved`** visual status badge with informative calculation tooltip (`X + Y = Z`) and a clean green-tinted input border.
  - Automatically triggers reactive `input` and `change` events and installs a pre-submit safety hook so standard `loginclick()` verification passes seamlessly.
  - Includes user-edit preservation (hides badge and avoids overriding if student manually types a custom value) and auto-recalculation upon captcha regeneration or dynamic reloads.
  - Added dedicated toggle control (**⚡ Auto Solve Captcha**) in the extension popup menu and full sync across Chrome extension, Tampermonkey userscript, and native Android app.

---

## [1.3.1] - 2026-09-28

### 🛠️ Fixed & Improved
- **Accounts Ledger Horizontal Swipe Glitch Resolved**:
  - **Eliminated Infinite DOM Mutation Loop**: Added data signature caching to `processStudentLedger()` (`content.js`). Previously, updating `summaryCard.innerHTML` on every debounced tick triggered an infinite `MutationObserver` re-render cycle (~12 times/sec), which tore down and recreated the DOM during touch gestures, causing horizontal swiping to glitch, cancel, or freeze.
  - **Fixed Sticky Column Rendering Bug**: Replaced `border-collapse: collapse` with `border-collapse: separate` and `border-spacing: 0` on `.ewu-summary-table`. In Chromium and Android WebView, `position: sticky` on table cells inside a collapsed border table causes jittery rendering and breaks horizontal swipe scrolling.
  - **Nested Scroll Container Conflict Prevention**: Refactored `ensureResponsiveTableWrapper()` to detect existing ancestor `.table-responsive` containers via `closest()`, preventing nested `overflow-x: auto` wrappers from fighting over horizontal scroll gestures.
  - **Mobile Touch Shielding & SwipeRefresh Protection**: Added `touch-action: pan-x pan-y !important` and `overscroll-behavior-x: contain !important` to table responsive wrappers, and added a touch shield listener with `AndroidBridge.setSwipeRefreshEnabled(false)` so horizontal swipes near the top of the screen cannot be accidentally stolen by Android's pull-to-refresh.
  - **Ledger Table Width & No-Wrap Styling**: Enforced `min-width: 820px !important`, `width: max-content !important`, and `white-space: nowrap !important` on the raw ledger table so columns remain properly sized and smoothly swipeable on mobile.

---

## [1.3.0] - 2026-09-12

### 🚀 Added
- **Export as High-Resolution Image (`.png`)**:
  - Implemented client-side in-memory 2D Canvas rendering at **2x Retina resolution** (~2000px wide).
  - Tightly wraps document contents with minimal padding (20px) — eliminating excessive white space for easy sharing on mobile, Discord, and messaging apps.
  - Retains full PDF accuracy: institutional header, enrolled courses table with faculty badges, schedule matrix, and course color coding.
- **Unified "📥 Export ▾" Dropdown Menu**:
  - Replaced multiple individual action buttons with a clean, animated dropdown menu on the routine card header.
  - Houses **Export as Image (`.png`)**, **Export to Excel (`.xlsx`)**, and **Print / Save as PDF** with interactive status animations (`⏳ Exporting...` → `✓ Downloaded!`).
  - Includes click-outside auto-dismissal and full keyboard accessibility.
- **Inter-Table Watermark Separator Credit**:
  - Added an authentic verification badge (`.ewu-inter-table-watermark`) placed between the enrolled courses table and routine timetable.
  - Interactive clickable links on screen and clean plain text URLs on print/PDF.
- **Modern GitHub README Cover Banner**:
  - Added high-aesthetic widescreen hero banner (`icons/readme_cover.jpg`) showcasing key features.

### 🛠️ Fixed & Improved
- **Zero-Warning Native Excel Exporter (`.xlsx`)**:
  - Eliminated the legacy HTML `.xls` format and Microsoft Excel's *"file format and extension don't match"* corruption warning.
  - Implemented genuine ECMA-376 OpenXML (`.xlsx`) generation with an in-memory client-side ZIP packer (`STORE` mode + CRC32 checksums) with zero external runtime dependencies.
- **Table Layout Collision & Overlap Fix**:
  - Isolated Table 1 (Advising Slip) and Table 2 (Routine Timetable) styles in `content.css` via `:not(.ewu-routine-grid)`.
  - Resolved column width crushing where timetable columns were compressed into 38px slivers.
  - Allowed natural multi-line header wrapping for narrow columns (`WithDraw Status`, `Drop Status`, `Faculty Initial`).
- **Print & PDF Layout Perfected**:
  - Purged universal selector `*,` rule that caused browser print preview to display a blank white page.
  - Eliminated duplicate `(mailto:...)` URLs on print/PDF copies via dual screen/print DOM elements.
- **Streamlined Footers & Cleaned Attribution**:
  - Removed redundant bottom and page footers (`.ewu-pdf-footer`, `.ewu-routine-footer-bar`, `.ewu-print-footer`), preserving only the single inter-table separator credit.
  - Normalized `@page` print margins to clean 8mm/10mm.
- **Mobile Responsiveness & Bottom Sheet Export Menu**:
  - Fixed mobile layout breakage on class schedule and weekly routine timetable across phones and tablets.
  - Added horizontal touch scrolling with sticky Day column (`position: sticky`) so days remain visible while swiping through time slots.
  - Converted Export dropdown into an intuitive mobile bottom sheet with grab handle, blurred backdrop, and touch-friendly action tiles on screens $\le$ 640px.
  - Added swipe indicator (`⇄ Swipe horizontally to view full routine`) on mobile devices.
- **Optimized Release Packaging**:
  - Streamlined `package_extension.py` to package only runtime extension assets and icons, reducing zip file size to ~36 KB.

---

## [1.2.0] - 2026-09-11

### 🚀 Added
- **Visual Weekly Class Routine Generator**:
  - Automatically transforms linear course rows into an interactive visual schedule matrix organized by day and standard time slots.
  - Intelligent conflict and overlap detection with warning indicators (`⚠️ Clash Detected!`).
  - Color-coded course badges (emerald, violet, amber, rose, cyan, blue) displaying course code, section, room number, faculty initial, and time tags.
  - Min/max routine card toggle button.
- **Offered Courses Smart Seat Availability**:
  - Real-time seat calculation with color badges (🟢 Open, 🟡 Almost Full `1 - 5 left`, 🔴 Full `0 left`).
  - "Show Open Sections Only" filter checkbox to hide full sections during advising rush.
  - Instant live search bar filtering courses by code, room, or timing.
- **Accounts Ledger Financial Summary**:
  - Added financial dashboard cards above ledger: Total Paid, Scholarships & Waivers, Total Tuition Billed, and Current Outstanding Due.
  - Semester breakdown table with `✓ Cleared` badges and due amount indicators.

---

## [1.1.0] - 2026-09-11

### 🚀 Added
- Project rebranded to **EWU-Toolkit**.
- Extension popup control panel with feature toggles and direct portal navigation links.
- Tampermonkey userscript distribution (`ewu-toolkit.user.js`).
- Open-source MIT License and community contributors gallery.

---

## [1.0.0] - 2026-09-11

### 🚀 Added
- Initial release: **EWU Faculty Reveal**.
- Revealed hidden teacher initials, full names, and official university email addresses on class schedule tables.
- 1-click email copy button with tooltip feedback.

[1.3.2]: https://github.com/sowmiksudo/EWU-Toolkit/compare/v1.3.1...v1.3.2
[1.3.1]: https://github.com/sowmiksudo/EWU-Toolkit/compare/v1.3.0...v1.3.1
[1.3.0]: https://github.com/sowmiksudo/EWU-Toolkit/compare/v1.1.0...v1.3.0
[1.1.0]: https://github.com/sowmiksudo/EWU-Toolkit/compare/1.0...v1.1.0
[1.0.0]: https://github.com/sowmiksudo/EWU-Toolkit/releases/tag/1.0
