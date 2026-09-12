# 📋 Changelog

All notable changes to the **EWU-Toolkit** project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
- **Faculty Evaluation Instructor Column**:
  - Injected teacher initials and full names directly into course evaluation rows.

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
