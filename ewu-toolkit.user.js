// ==UserScript==
// @name         EWU-Toolkit
// @namespace    https://github.com/sowmiksudo/EWU-Toolkit
// @version      1.3.0
// @description  Complete student utility suite for EWU Portal: visual weekly class routine generator, 1-click Excel export, unhide faculty info, seat availability & filters, accounts ledger breakdown, and more.
// @author       Sowmik
// @match        https://portal.ewubd.edu/*
// @match        http://portal.ewubd.edu/*
// @icon         https://portal.ewubd.edu/favicon.ico
// @grant        GM_setClipboard
// @run-at       document-end
// @updateURL    https://raw.githubusercontent.com/sowmiksudo/EWU-Toolkit/main/ewu-toolkit.user.js
// @downloadURL  https://raw.githubusercontent.com/sowmiksudo/EWU-Toolkit/main/ewu-toolkit.user.js
// ==/UserScript==

(function () {
  'use strict';

  // Inject Styles
  const style = document.createElement('style');
  style.id = 'ewu-toolkit-all-styles';
  style.textContent = `/* ==========================================================================
   EWU-Toolkit - Comprehensive Stylesheet (v1.2.0)
   ========================================================================== */

/* --------------------------------------------------------------------------
   1. Class Schedule & Advising Slip: Faculty Info Unhiding
   -------------------------------------------------------------------------- */
th[ng-show*="Status"].ng-hide,
td[ng-show*="Status"].ng-hide,
th.ewu-revealed-col,
td.ewu-revealed-col {
    display: table-cell !important;
}

body.ewu-schedule-disabled th[ng-show*="Status"].ng-hide,
body.ewu-schedule-disabled td[ng-show*="Status"].ng-hide,
body.ewu-schedule-disabled th.ewu-revealed-col,
body.ewu-schedule-disabled td.ewu-revealed-col {
    display: none !important;
}

body.ewu-schedule-disabled .ewu-schedule-banner {
    display: none !important;
}

.ewu-initial-badge {
    display: inline-block;
    padding: 2px 7px;
    font-size: 11px;
    font-weight: 700;
    color: #1e40af;
    background: #eff6ff;
    border: 1px solid #bfdbfe;
    border-radius: 4px;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    width: fit-content;
}

.ewu-email-container {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    flex-wrap: nowrap;
}

.ewu-email-link {
    color: #1d4ed8 !important;
    text-decoration: none !important;
    font-weight: 500;
    transition: color 0.15s ease;
}

.ewu-email-link:hover {
    color: #1e40af !important;
    text-decoration: underline !important;
}

.ewu-copy-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: #f8fafc;
    border: 1px solid #cbd5e1;
    border-radius: 4px;
    padding: 2px 6px;
    cursor: pointer;
    color: #64748b;
    font-size: 11px;
    line-height: 1;
    transition: all 0.15s ease;
    user-select: none;
}

.ewu-copy-btn:hover {
    background: #f1f5f9;
    color: #0f172a;
    border-color: #94a3b8;
}

.ewu-copy-btn.copied {
    background: #dcfce7;
    color: #166534;
    border-color: #86efac;
}

/* Light Theme Notice Banner */
.ewu-revealer-banner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: #ffffff;
    color: #334155;
    border: 1px solid #e2e8f0;
    border-left: 4px solid #3b82f6;
    padding: 10px 14px;
    border-radius: 6px;
    margin-bottom: 12px;
    font-size: 13px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
    flex-wrap: wrap;
    gap: 10px;
}

.ewu-banner-left {
    display: flex;
    align-items: center;
    gap: 10px;
}

.ewu-banner-pill {
    background: #eff6ff;
    color: #1d4ed8;
    border: 1px solid #bfdbfe;
    font-size: 11px;
    font-weight: 700;
    padding: 2px 8px;
    border-radius: 9999px;
    letter-spacing: 0.5px;
    text-transform: uppercase;
}

.ewu-banner-text {
    color: #1e293b;
    font-weight: 500;
}

.ewu-banner-right {
    display: flex;
    align-items: center;
    gap: 10px;
}

.ewu-github-gesture {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    background: #f8fafc;
    border: 1px solid #cbd5e1;
    color: #475569 !important;
    text-decoration: none !important;
    padding: 4px 10px;
    border-radius: 6px;
    font-size: 11.5px;
    font-weight: 500;
    transition: all 0.15s ease;
}

.ewu-github-gesture:hover {
    background: #f1f5f9;
    border-color: #3b82f6;
    color: #1d4ed8 !important;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.ewu-banner-excel-btn {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    background: #ecfdf5;
    border: 1px solid #6ee7b7;
    color: #065f46;
    padding: 4px 10px;
    border-radius: 6px;
    font-size: 11.5px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s ease;
}

.ewu-banner-excel-btn:hover {
    background: #d1fae5;
    border-color: #10b981;
    color: #047857;
    box-shadow: 0 1px 3px rgba(16, 185, 129, 0.2);
}

.ewu-banner-print-btn {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    background: #f8fafc;
    border: 1px solid #cbd5e1;
    color: #334155;
    padding: 4px 10px;
    border-radius: 6px;
    font-size: 11.5px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s ease;
}

.ewu-banner-print-btn:hover {
    background: #f1f5f9;
    border-color: #94a3b8;
    color: #0f172a;
}

/* --------------------------------------------------------------------------
   2. Offered Courses: Seat Availability Badges & Smart Filter Bar
   -------------------------------------------------------------------------- */
.ewu-offered-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 10px 14px;
    margin-bottom: 12px;
    font-size: 13px;
    flex-wrap: wrap;
    gap: 12px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.ewu-toolbar-left {
    display: flex;
    align-items: center;
    gap: 14px;
    flex-wrap: wrap;
}

.ewu-filter-label {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    cursor: pointer;
    font-weight: 600;
    color: #1e293b;
    user-select: none;
}

.ewu-filter-checkbox {
    width: 16px;
    height: 16px;
    cursor: pointer;
    accent-color: #2563eb;
}

.ewu-search-input {
    border: 1px solid #cbd5e1;
    border-radius: 6px;
    padding: 5px 10px;
    font-size: 12.5px;
    outline: none;
    transition: border-color 0.15s ease;
    width: 180px;
}

.ewu-search-input:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.15);
}

.ewu-stats-pill {
    font-size: 11.5px;
    color: #64748b;
    background: #f1f5f9;
    padding: 3px 8px;
    border-radius: 6px;
}

.ewu-seat-wrapper {
    display: inline-flex;
    align-items: center;
    gap: 6px;
}

.ewu-seat-badge {
    display: inline-block;
    padding: 2px 7px;
    font-size: 11px;
    font-weight: 700;
    border-radius: 4px;
    letter-spacing: 0.3px;
    white-space: nowrap;
}

.ewu-seat-badge.open {
    background: #dcfce7;
    color: #15803d;
    border: 1px solid #bbf7d0;
}

.ewu-seat-badge.warning {
    background: #fef9c3;
    color: #854d0e;
    border: 1px solid #fde047;
}

.ewu-seat-badge.full {
    background: #fee2e2;
    color: #b91c1c;
    border: 1px solid #fecaca;
}

.ewu-row-hidden {
    display: none !important;
}


/* --------------------------------------------------------------------------
   4. Student Ledger: Financial Summary & Semester Breakdown
   -------------------------------------------------------------------------- */
.ewu-ledger-summary-card {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    padding: 16px;
    margin-bottom: 20px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.ewu-ledger-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 14px;
    flex-wrap: wrap;
    gap: 8px;
}

.ewu-ledger-title {
    font-size: 15px;
    font-weight: 700;
    color: #0f172a;
    display: flex;
    align-items: center;
    gap: 8px;
}

.ewu-ledger-tag {
    font-size: 11px;
    background: #eff6ff;
    color: #2563eb;
    border: 1px solid #bfdbfe;
    padding: 2px 8px;
    border-radius: 9999px;
    font-weight: 600;
}

/* Bento KPI Grid */
.ewu-kpi-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 12px;
    margin-bottom: 16px;
}

.ewu-kpi-card {
    border-radius: 8px;
    padding: 12px 14px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    border: 1px solid transparent;
}

.ewu-kpi-card.paid {
    background: #f0fdf4;
    border-color: #bbf7d0;
}

.ewu-kpi-card.paid .ewu-kpi-amount {
    color: #15803d;
}

.ewu-kpi-card.waiver {
    background: #f5f3ff;
    border-color: #ddd6fe;
}

.ewu-kpi-card.waiver .ewu-kpi-amount {
    color: #6d28d9;
}

.ewu-kpi-card.billed {
    background: #f8fafc;
    border-color: #e2e8f0;
}

.ewu-kpi-card.billed .ewu-kpi-amount {
    color: #1e293b;
}

.ewu-kpi-card.due {
    background: #fff1f2;
    border-color: #fecdd3;
}

.ewu-kpi-card.due .ewu-kpi-amount {
    color: #be123c;
}

.ewu-kpi-card.due.cleared {
    background: #f0fdf4;
    border-color: #bbf7d0;
}

.ewu-kpi-card.due.cleared .ewu-kpi-amount {
    color: #15803d;
}

.ewu-kpi-label {
    font-size: 11.5px;
    font-weight: 600;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.3px;
}

.ewu-kpi-amount {
    font-size: 20px;
    font-weight: 800;
    letter-spacing: -0.5px;
}

.ewu-kpi-desc {
    font-size: 11px;
    color: #64748b;
}

/* Semester Breakdown Table */
.ewu-summary-table {
    width: 100%;
    margin-bottom: 0 !important;
    font-size: 13px;
}

.ewu-summary-table th {
    background: #f8fafc !important;
    font-weight: 600;
    color: #334155;
    border-bottom: 2px solid #cbd5e1 !important;
}

.ewu-summary-table td {
    vertical-align: middle !important;
}

.ewu-status-badge {
    display: inline-block;
    padding: 3px 8px;
    border-radius: 9999px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.3px;
}

.ewu-status-badge.cleared {
    background: #dcfce7;
    color: #15803d;
    border: 1px solid #bbf7d0;
}

.ewu-status-badge.due {
    background: #fee2e2;
    color: #b91c1c;
    border: 1px solid #fecaca;
}

/* --------------------------------------------------------------------------
   5. Interactive Class Routine Timetable & Excel Export
   -------------------------------------------------------------------------- */
.ewu-routine-card {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    box-shadow: 0 4px 12px -2px rgba(15, 23, 42, 0.08);
    margin-bottom: 20px;
    overflow: visible;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}

.ewu-routine-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
    color: #ffffff;
    padding: 14px 18px;
    border-radius: 11px 11px 0 0;
    flex-wrap: wrap;
    gap: 12px;
}

.routine-title-wrap {
    display: flex;
    align-items: center;
    gap: 14px;
    flex-wrap: wrap;
}

.routine-main-title {
    display: flex;
    align-items: center;
    gap: 8px;
}

.routine-main-title h2 {
    font-size: 16px;
    font-weight: 700;
    margin: 0;
    color: #ffffff;
    letter-spacing: -0.2px;
}

.calendar-icon {
    font-size: 18px;
}

.ewu-sem-pill {
    background: rgba(56, 189, 248, 0.15);
    color: #38bdf8;
    border: 1px solid rgba(56, 189, 248, 0.35);
    padding: 2px 8px;
    border-radius: 9999px;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.3px;
}

.routine-meta-stats {
    display: flex;
    align-items: center;
    gap: 8px;
}

.stat-tag {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.18);
    color: #e2e8f0;
    padding: 2px 8px;
    border-radius: 6px;
    font-size: 11px;
}

.stat-tag strong {
    color: #ffffff;
}

.routine-action-buttons {
    display: flex;
    align-items: center;
    gap: 8px;
}

.ewu-dropdown {
    position: relative;
    display: inline-block;
}

.ewu-dropdown-btn {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    background: linear-gradient(135deg, #1e40af 0%, #2563eb 100%);
    color: #ffffff;
    border: 1px solid rgba(255, 255, 255, 0.25);
    padding: 6px 14px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 2px 4px rgba(30, 64, 175, 0.25);
    transition: all 0.15s ease;
}

.ewu-dropdown-btn:hover {
    background: linear-gradient(135deg, #1d4ed8 0%, #1e3a8a 100%);
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(30, 64, 175, 0.35);
}

.dropdown-caret {
    font-size: 10px;
    transition: transform 0.2s ease;
}

.ewu-dropdown.show .dropdown-caret {
    transform: rotate(180deg);
}

.ewu-dropdown-backdrop {
    display: none;
}

.ewu-dropdown-mobile-header {
    display: none;
}

.ewu-mobile-scroll-hint {
    display: none;
    align-items: center;
    justify-content: center;
    gap: 6px;
    background: #eff6ff;
    color: #1e40af;
    font-size: 11.5px;
    font-weight: 600;
    padding: 7px 12px;
    border-radius: 6px;
    margin-bottom: 10px;
    border: 1px dashed #93c5fd;
    user-select: none;
}

.ewu-dropdown-menu {
    position: absolute;
    top: calc(100% + 6px);
    right: 0;
    min-width: 250px;
    max-width: calc(100vw - 32px);
    background: #ffffff;
    border: 1px solid #cbd5e1;
    border-radius: 10px;
    box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.18), 0 8px 10px -6px rgba(15, 23, 42, 0.1);
    padding: 6px;
    z-index: 99999;
    display: none;
    flex-direction: column;
    gap: 4px;
    animation: ewuDropdownFadeIn 0.15s cubic-bezier(0.16, 1, 0.3, 1);
}

.ewu-dropdown.show .ewu-dropdown-menu {
    display: flex;
}

@keyframes ewuDropdownFadeIn {
    from {
        opacity: 0;
        transform: translateY(-6px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.ewu-dropdown-item {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    padding: 8px 10px;
    background: transparent;
    border: none;
    border-radius: 6px;
    text-align: left;
    cursor: pointer;
    transition: background 0.15s ease;
    box-sizing: border-box;
}

.ewu-dropdown-item:hover {
    background: #f1f5f9;
}

.dropdown-item-icon {
    font-size: 18px;
    flex-shrink: 0;
    line-height: 1;
}

.dropdown-item-text {
    display: flex;
    flex-direction: column;
}

.dropdown-item-title {
    font-size: 12px;
    font-weight: 600;
    color: #0f172a;
    line-height: 1.2;
}

.dropdown-item-desc {
    font-size: 10px;
    color: #64748b;
    margin-top: 2px;
    line-height: 1.2;
}

.ewu-excel-export-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    color: #ffffff;
    border: none;
    padding: 6px 14px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 2px 4px rgba(16, 185, 129, 0.25);
    transition: all 0.15s ease;
}

.ewu-excel-export-btn:hover {
    background: linear-gradient(135deg, #059669 0%, #047857 100%);
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(16, 185, 129, 0.35);
}

.ewu-routine-print-btn {
    background: rgba(255, 255, 255, 0.12);
    border: 1px solid rgba(255, 255, 255, 0.25);
    color: #ffffff;
    padding: 6px 12px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s ease;
}

.ewu-routine-print-btn:hover {
    background: rgba(255, 255, 255, 0.22);
}

.ewu-routine-toggle-btn {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: #cbd5e1;
    padding: 4px 8px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 11px;
}

.ewu-routine-toggle-btn:hover {
    color: #ffffff;
    background: rgba(255, 255, 255, 0.2);
}

.ewu-routine-body {
    padding: 14px;
    background: #f8fafc;
    border-radius: 0 0 11px 11px;
}

.ewu-routine-table-responsive {
    margin: 0 !important;
    border-radius: 8px;
    overflow-x: auto !important;
    -webkit-overflow-scrolling: touch !important;
    width: 100% !important;
    max-width: 100% !important;
    box-sizing: border-box !important;
}

.ewu-routine-grid {
    width: 100%;
    min-width: 780px !important;
    margin-bottom: 0 !important;
    background: #ffffff;
    border: 1px solid #cbd5e1 !important;
    table-layout: fixed;
}

.ewu-routine-grid th {
    background: #f1f5f9 !important;
    color: #334155 !important;
    font-size: 11px !important;
    font-weight: 700 !important;
    text-align: center !important;
    padding: 10px 6px !important;
    border: 1px solid #cbd5e1 !important;
    letter-spacing: 0.2px;
}

.ewu-routine-day-col {
    width: 100px;
}

.ewu-routine-day-cell {
    background: #f1f5f9 !important;
    color: #1e293b !important;
    font-weight: 700 !important;
    font-size: 12px !important;
    text-align: center !important;
    vertical-align: middle !important;
    border: 1px solid #cbd5e1 !important;
}

.ewu-routine-cell {
    border: 1px solid #e2e8f0 !important;
    padding: 6px !important;
    vertical-align: top !important;
    min-width: 130px;
    background: #ffffff;
}

.ewu-routine-cell.empty {
    text-align: center;
    vertical-align: middle !important;
}

.empty-dash {
    color: #cbd5e1;
    font-size: 13px;
}

/* Routine Course Badge */
.ewu-routine-badge {
    border-radius: 7px;
    padding: 7px 9px;
    margin-bottom: 5px;
    border: 1px solid;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    transition: transform 0.12s ease, box-shadow 0.12s ease;
}

.ewu-routine-badge:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.ewu-routine-badge:last-child {
    margin-bottom: 0;
}

.badge-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 3px;
}

.badge-title strong {
    font-size: 12px;
    font-weight: 700;
}

.badge-sec {
    font-size: 10px;
    font-weight: 600;
    opacity: 0.85;
}

.badge-room {
    font-size: 11px;
    font-weight: 500;
    margin-bottom: 5px;
    display: flex;
    align-items: center;
    gap: 3px;
}

.badge-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 4px;
    flex-wrap: wrap;
}

.badge-initial {
    display: inline-block;
    padding: 1px 5px;
    border-radius: 4px;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.3px;
}

.badge-time {
    font-size: 9px;
    opacity: 0.8;
}

/* Color Palettes */
.ewu-routine-badge.indigo {
    background: #eef2ff;
    border-color: #c7d2fe;
    color: #3730a3;
}
.ewu-routine-badge.indigo .badge-initial {
    background: #e0e7ff;
    color: #312e81;
}

.ewu-routine-badge.emerald {
    background: #ecfdf5;
    border-color: #a7f3d0;
    color: #065f46;
}
.ewu-routine-badge.emerald .badge-initial {
    background: #d1fae5;
    color: #047857;
}

.ewu-routine-badge.violet {
    background: #f5f3ff;
    border-color: #ddd6fe;
    color: #5b21b6;
}
.ewu-routine-badge.violet .badge-initial {
    background: #ede9fe;
    color: #6d28d9;
}

.ewu-routine-badge.amber {
    background: #fffbeb;
    border-color: #fde68a;
    color: #92400e;
}
.ewu-routine-badge.amber .badge-initial {
    background: #fef3c7;
    color: #b45309;
}

.ewu-routine-badge.rose {
    background: #fff1f2;
    border-color: #fecdd3;
    color: #9f1239;
}
.ewu-routine-badge.rose .badge-initial {
    background: #ffe4e6;
    color: #be123c;
}

.ewu-routine-badge.cyan {
    background: #ecfeff;
    border-color: #a5f3fc;
    color: #155e75;
}
.ewu-routine-badge.cyan .badge-initial {
    background: #cffafe;
    color: #0e7490;
}

.ewu-routine-badge.blue {
    background: #eff6ff;
    border-color: #bfdbfe;
    color: #1e40af;
}
.ewu-routine-badge.blue .badge-initial {
    background: #dbeafe;
    color: #1d4ed8;
}

.ewu-clash-warning {
    background: #fee2e2;
    color: #b91c1c;
    border: 1px solid #fecaca;
    font-size: 10px;
    font-weight: 700;
    padding: 2px 5px;
    border-radius: 4px;
    margin-bottom: 4px;
    text-align: center;
}

/* --------------------------------------------------------------------------
   5.5. Inter-Table Watermark Website Citation
   -------------------------------------------------------------------------- */
.ewu-inter-table-watermark {
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 8px 0 16px 0;
    padding: 7px 16px;
    background: linear-gradient(90deg, #f8fafc 0%, #f1f5f9 50%, #f8fafc 100%);
    border: 1px dashed #cbd5e1;
    border-radius: 8px;
    font-size: 11.5px;
    color: #64748b;
    letter-spacing: 0.2px;
}

.ewu-inter-table-watermark .ewu-watermark-content {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    flex-wrap: wrap;
    text-align: center;
}

.ewu-inter-table-watermark a {
    color: #2563eb !important;
    text-decoration: none !important;
    font-weight: 600;
}

.ewu-inter-table-watermark a:hover {
    color: #1d4ed8 !important;
    text-decoration: underline !important;
}

.ewu-inter-table-watermark strong {
    color: #334155;
}

.ewu-inter-table-watermark .watermark-bullet {
    color: #94a3b8;
}



.ewu-print-header,
.ewu-print-section-divider,
.ewu-print-footer,
.ewu-pdf-footer,
.ewu-print-only {
    display: none;
}

/* --------------------------------------------------------------------------
   6. Comprehensive Mobile & Responsive Optimization (@media (max-width: 768px))
   -------------------------------------------------------------------------- */
/* Responsive Table Wrappers */
.ewu-schedule-table-responsive,
.table-responsive {
    width: 100% !important;
    max-width: 100% !important;
    overflow-x: auto !important;
    -webkit-overflow-scrolling: touch !important;
    box-sizing: border-box !important;
    position: relative;
}

.ewu-schedule-table-responsive > table,
.table-responsive > table.table {
    min-width: 780px;
}

@media (max-width: 768px) {
    /* Notice Banner on Mobile */
    .ewu-revealer-banner {
        flex-direction: column;
        align-items: stretch;
        gap: 10px;
        padding: 10px 12px;
    }

    .ewu-banner-left {
        flex-wrap: wrap;
        gap: 6px;
    }

    .ewu-banner-text {
        font-size: 12px;
        line-height: 1.35;
    }

    .ewu-banner-right {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        width: 100%;
    }

    .ewu-banner-excel-btn,
    .ewu-banner-print-btn,
    .ewu-github-gesture {
        flex: 1 1 auto;
        justify-content: center;
        text-align: center;
        padding: 6px 10px;
        font-size: 11px;
    }

    /* Email cell wrap so it never forces giant column widths */
    .ewu-email-container {
        flex-wrap: wrap;
        gap: 4px;
        max-width: 220px;
    }

    .ewu-email-link {
        word-break: break-all;
        font-size: 11.5px;
    }

    .ewu-copy-btn {
        padding: 2px 5px;
        font-size: 10px;
    }

    /* Mobile scroll hint on routine */
    .ewu-mobile-scroll-hint {
        display: flex;
    }

    /* Routine Card Header on Mobile */
    .ewu-routine-card {
        border-radius: 8px;
        margin-bottom: 16px;
    }

    .ewu-routine-header {
        flex-direction: column;
        align-items: stretch;
        gap: 10px;
        padding: 12px 14px;
        border-radius: 7px 7px 0 0;
    }

    .routine-title-wrap {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
        width: 100%;
    }

    .routine-main-title {
        flex-wrap: wrap;
        gap: 6px;
    }

    .routine-main-title h2 {
        font-size: 15px;
    }

    .routine-meta-stats {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
    }

    .routine-action-buttons {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
    }

    .ewu-dropdown {
        flex: 1;
    }

    .ewu-dropdown-btn {
        width: 100%;
        justify-content: center;
        padding: 7px 12px;
        font-size: 12px;
    }

    .ewu-routine-body {
        padding: 8px;
        border-radius: 0 0 7px 7px;
    }

    .ewu-routine-table-responsive {
        width: 100% !important;
        max-width: 100% !important;
        overflow-x: auto !important;
        -webkit-overflow-scrolling: touch !important;
        display: block !important;
        box-sizing: border-box !important;
    }

    /* Keep routine grid from collapsing into narrow vertical text */
    .ewu-routine-grid {
        min-width: 780px !important;
        width: max-content !important;
        table-layout: fixed !important;
    }

    /* Sticky Day Column while scrolling time slots */
    .ewu-routine-day-col,
    .ewu-routine-day-cell {
        position: sticky !important;
        left: 0 !important;
        z-index: 5 !important;
        background: #f1f5f9 !important;
        box-shadow: 2px 0 6px -1px rgba(0, 0, 0, 0.08);
    }

    th.ewu-routine-day-col {
        z-index: 6 !important;
    }

    .ewu-routine-badge {
        padding: 5px 6px;
    }

    .badge-title strong {
        font-size: 11px;
    }

    .badge-room {
        font-size: 10px;
        margin-bottom: 3px;
    }

    .badge-initial {
        font-size: 9.5px;
    }

    .badge-time {
        font-size: 8.5px;
    }

    /* Inter-Table Watermark on Mobile */
    .ewu-inter-table-watermark {
        padding: 8px 12px;
        margin: 6px 0 12px 0;
    }

    .ewu-inter-table-watermark .ewu-watermark-content {
        flex-direction: column;
        gap: 4px;
        font-size: 10.5px;
    }

    .ewu-inter-table-watermark .watermark-bullet {
        display: none;
    }

    /* Offered Courses Toolbar on Mobile */
    .ewu-offered-toolbar {
        flex-direction: column;
        align-items: stretch;
        gap: 10px;
        padding: 10px 12px;
    }

    .ewu-toolbar-left {
        flex-direction: column;
        align-items: stretch;
        gap: 8px;
    }

    .ewu-search-input {
        width: 100% !important;
        box-sizing: border-box;
    }

    /* Accounts Ledger Bento Cards on Mobile */
    .ewu-kpi-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 8px;
    }

    .ewu-kpi-card {
        padding: 10px 12px;
    }

    .ewu-kpi-amount {
        font-size: 16px;
    }
}

@media (max-width: 480px) {
    .ewu-kpi-grid {
        grid-template-columns: 1fr;
    }
}

/* --------------------------------------------------------------------------
   Export Button Popup: Mobile Bottom Sheet (Screen <= 640px)
   -------------------------------------------------------------------------- */
@media (max-width: 640px) {
    .ewu-dropdown-backdrop {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(15, 23, 42, 0.45);
        backdrop-filter: blur(3px);
        -webkit-backdrop-filter: blur(3px);
        z-index: 999998;
    }

    .ewu-dropdown.show .ewu-dropdown-backdrop {
        display: block;
    }

    .ewu-dropdown-menu {
        position: fixed !important;
        top: auto !important;
        bottom: 0 !important;
        left: 0 !important;
        right: 0 !important;
        width: 100% !important;
        max-width: 100vw !important;
        min-width: 100vw !important;
        border-radius: 20px 20px 0 0 !important;
        padding: 16px 16px calc(20px + env(safe-area-inset-bottom, 0px)) 16px !important;
        box-shadow: 0 -12px 35px rgba(0, 0, 0, 0.3) !important;
        z-index: 999999 !important;
        background: #ffffff !important;
        border: 1px solid #cbd5e1 !important;
        border-bottom: none !important;
        box-sizing: border-box !important;
        gap: 8px !important;
        animation: ewuBottomSheetSlideUp 0.22s cubic-bezier(0.16, 1, 0.3, 1) !important;
    }

    .ewu-dropdown-mobile-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding-bottom: 12px;
        margin-bottom: 6px;
        border-bottom: 1px solid #e2e8f0;
        position: relative;
    }

    .ewu-bottom-sheet-handle {
        position: absolute;
        top: -8px;
        left: 50%;
        transform: translateX(-50%);
        width: 40px;
        height: 4px;
        background: #cbd5e1;
        border-radius: 9999px;
    }

    .ewu-bottom-sheet-title {
        font-size: 14px;
        font-weight: 700;
        color: #0f172a;
    }

    .ewu-bottom-sheet-close {
        background: #f1f5f9;
        border: none;
        color: #64748b;
        font-size: 14px;
        font-weight: 700;
        width: 28px;
        height: 28px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
    }

    .ewu-bottom-sheet-close:hover {
        background: #e2e8f0;
        color: #0f172a;
    }

    .ewu-dropdown-item {
        padding: 12px 14px !important;
        border-radius: 10px !important;
        background: #f8fafc !important;
        border: 1px solid #e2e8f0 !important;
    }

    .ewu-dropdown-item:active {
        background: #e2e8f0 !important;
        transform: scale(0.98);
    }

    .dropdown-item-title {
        font-size: 13px !important;
    }

    .dropdown-item-desc {
        font-size: 11px !important;
    }
}

@keyframes ewuBottomSheetSlideUp {
    from {
        opacity: 0;
        transform: translateY(100%);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@media (min-width: 641px) and (max-width: 900px) {
    .ewu-dropdown-menu {
        right: 0 !important;
        left: auto !important;
        max-width: calc(100vw - 32px) !important;
    }
}

/* --------------------------------------------------------------------------
   7. Comprehensive Print Optimization (@media print)
   -------------------------------------------------------------------------- */
@media print {
    /* 1. Complete Suppression of Portal Chrome, Sidebars, and Controls */
    .navbar,
    .navbar-default,
    .navbar-fixed-top,
    .navbar-top,
    .top-nav,
    .navbar-header,
    .top-header,
    .top-navbar,
    .navbar-right,
    .nav-user,
    .dropdown-content,
    .nav-notify,
    .sidebar-inverse,
    .side-navbar,
    .side-navbar *,
    nav,
    aside,
    footer,
    .breadcumb,
    .page-title,
    #form_part_1,
    #adminBaseUrl,
    #StudentBaseUrl,
    #StudentId,
    #successmessageDiv,
    #errormessageDiv,
    .alert,
    .modal,
    .modal-backdrop,
    .blackout,
    #myloadingdiv,
    #crisp-chatbox,
    .crisp-client,
    .ewu-revealer-banner,
    .ewu-copy-btn,
    .ewu-screen-only,
    .ewu-offered-toolbar,
    .routine-action-buttons,
    .ewu-routine-toggle-btn,
    .ewu-excel-export-btn,
    .ewu-routine-print-btn,
    .ewu-dropdown,
    .ewu-dropdown-btn,
    .ewu-dropdown-menu,
    .ewu-dropdown-item,
    .ewu-routine-footer-bar,
    .btn {
        display: none !important;
        visibility: hidden !important;
        width: 0 !important;
        height: 0 !important;
        margin: 0 !important;
        padding: 0 !important;
        border: none !important;
    }

    /* Suppress automatic link URL expansion (e.g. Bootstrap's a[href]:after { content: " (" attr(href) ")" }) */
    a:after,
    a:before,
    a[href]:after,
    a[href]:before,
    a[href^="mailto"]:after,
    a[href^="mailto"]:before,
    body a[href]:after,
    html body a[href]:after,
    html body .table a[href]:after,
    .ewu-email-link:after,
    .ewu-email-container a:after {
        content: "" !important;
        display: none !important;
    }

    .ewu-print-only {
        display: inline !important;
        visibility: visible !important;
    }

    @page {
        size: A4 portrait;
        margin: 8mm 10mm 8mm 10mm;
    }

    html, body {
        width: 100% !important;
        min-width: 100% !important;
        height: auto !important;
        min-height: 100% !important;
        overflow: visible !important;
        position: static !important;
        margin: 0 !important;
        padding: 0 !important;
        background: #ffffff !important;
        color: #0f172a !important;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
        font-size: 8pt !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
    }

    .main-wrapper,
    .body-container,
    .body-container.left,
    .common-container,
    .body-content,
    .col-lg-12,
    .col-sm-12,
    .col-xs-12,
    .row {
        margin: 0 !important;
        padding: 0 !important;
        width: 100% !important;
        max-width: 100% !important;
        left: 0 !important;
        right: 0 !important;
        position: static !important;
        float: none !important;
        display: block !important;
    }

    .table-responsive {
        overflow: visible !important;
        display: block !important;
        width: 100% !important;
        margin: 0 0 8px 0 !important;
        padding: 0 !important;
        border: none !important;
    }

    /* 3. Official University Print Header */
    .ewu-print-header {
        display: block !important;
        margin-bottom: 8px !important;
        padding-bottom: 5px !important;
        border-bottom: 2px solid #0f172a !important;
    }

    .ewu-print-header-top {
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        text-align: center !important;
        margin-bottom: 5px !important;
    }

    .ewu-print-uni-title {
        font-size: 15pt !important;
        font-weight: 800 !important;
        letter-spacing: 1.5px !important;
        color: #0f172a !important;
        margin: 0 0 2px 0 !important;
        text-transform: uppercase !important;
    }

    .ewu-print-doc-title {
        font-size: 9.5pt !important;
        font-weight: 600 !important;
        color: #475569 !important;
        margin: 0 !important;
    }

    .ewu-print-meta-grid {
        display: flex !important;
        flex-wrap: wrap !important;
        justify-content: space-between !important;
        align-items: center !important;
        background: #f8fafc !important;
        border: 1px solid #cbd5e1 !important;
        border-radius: 4px !important;
        padding: 4px 8px !important;
        font-size: 7.5pt !important;
        color: #334155 !important;
    }

    .ewu-print-meta-item strong {
        color: #0f172a !important;
    }

    .ewu-print-section-divider {
        display: block !important;
        font-size: 8.5pt !important;
        font-weight: 700 !important;
        color: #0f172a !important;
        margin: 8px 0 5px 0 !important;
        padding-bottom: 3px !important;
        border-bottom: 1px solid #94a3b8 !important;
        text-transform: uppercase !important;
        letter-spacing: 0.5px !important;
    }

    /* 4. Advising Slip Table Styling */
    table.table-bordered:not(.ewu-routine-grid) {
        display: table !important;
        visibility: visible !important;
        width: 100% !important;
        border-collapse: collapse !important;
        border: 1px solid #64748b !important;
        margin-bottom: 8px !important;
        table-layout: fixed !important;
    }

    table.table-bordered:not(.ewu-routine-grid) thead {
        display: table-header-group !important;
    }

    table.table-bordered:not(.ewu-routine-grid) tbody {
        display: table-row-group !important;
    }

    table.table-bordered:not(.ewu-routine-grid) tr {
        display: table-row !important;
        visibility: visible !important;
    }

    table.table-bordered:not(.ewu-routine-grid) th,
    table.table-bordered:not(.ewu-routine-grid) td {
        display: table-cell !important;
        visibility: visible !important;
        border: 1px solid #94a3b8 !important;
        padding: 4px 2px !important;
        font-size: 7.2pt !important;
        vertical-align: middle !important;
        word-wrap: break-word !important;
        overflow-wrap: break-word !important;
    }

    table.table-bordered:not(.ewu-routine-grid) th {
        background: #f1f5f9 !important;
        color: #0f172a !important;
        font-weight: 700 !important;
        text-align: center !important;
        vertical-align: middle !important;
        white-space: normal !important;
        line-height: 1.15 !important;
    }

    /* Precise column widths in Advising Slip to fit A4 cleanly with ZERO overlap (Sum: 100%) */
    table.table-bordered:not(.ewu-routine-grid) th:nth-child(1),
    table.table-bordered:not(.ewu-routine-grid) td:nth-child(1) { width: 4.5%; text-align: center; } /* Serial */

    table.table-bordered:not(.ewu-routine-grid) th:nth-child(2),
    table.table-bordered:not(.ewu-routine-grid) td:nth-child(2) { width: 10%; font-weight: 700; } /* Course */

    table.table-bordered:not(.ewu-routine-grid) th:nth-child(3),
    table.table-bordered:not(.ewu-routine-grid) td:nth-child(3) { width: 5%; text-align: center; } /* Section */

    table.table-bordered:not(.ewu-routine-grid) th:nth-child(4),
    table.table-bordered:not(.ewu-routine-grid) td:nth-child(4) { width: 5%; text-align: center; } /* Credits */

    table.table-bordered:not(.ewu-routine-grid) th:nth-child(5),
    table.table-bordered:not(.ewu-routine-grid) td:nth-child(5) { width: 16%; font-size: 7pt; } /* Timing */

    table.table-bordered:not(.ewu-routine-grid) th:nth-child(6),
    table.table-bordered:not(.ewu-routine-grid) td:nth-child(6) { width: 8%; text-align: center; } /* Room */

    table.table-bordered:not(.ewu-routine-grid) th:nth-child(7),
    table.table-bordered:not(.ewu-routine-grid) td:nth-child(7) { width: 7.5%; text-align: center; font-size: 7pt; } /* WithDraw */

    table.table-bordered:not(.ewu-routine-grid) th:nth-child(8),
    table.table-bordered:not(.ewu-routine-grid) td:nth-child(8) { width: 6.5%; text-align: center; font-size: 7pt; } /* Drop */

    table.table-bordered:not(.ewu-routine-grid) th:nth-child(9),
    table.table-bordered:not(.ewu-routine-grid) td:nth-child(9) { width: 8.5%; text-align: center; } /* Faculty Initial */

    table.table-bordered:not(.ewu-routine-grid) th:nth-child(10),
    table.table-bordered:not(.ewu-routine-grid) td:nth-child(10) { width: 15%; font-size: 7.2pt; } /* Faculty Name */

    table.table-bordered:not(.ewu-routine-grid) th:nth-child(11),
    table.table-bordered:not(.ewu-routine-grid) td:nth-child(11) { width: 14.5%; font-size: 6.8pt; word-break: break-all !important; } /* Email */

    th[ng-show*="Status"].ng-hide,
    td[ng-show*="Status"].ng-hide,
    th.ewu-revealed-col,
    td.ewu-revealed-col {
        display: table-cell !important;
    }

    .ewu-initial-badge {
        background: #e0e7ff !important;
        color: #1e40af !important;
        border: 1px solid #bfdbfe !important;
        padding: 1px 4px !important;
        font-size: 7pt !important;
        font-weight: 700 !important;
        display: inline-block !important;
    }

    .ewu-email-text {
        color: #0f172a !important;
        font-size: 6.8pt !important;
        font-weight: 500 !important;
        word-break: break-all !important;
    }

    /* 4.5. Inter-Table Watermark Website Citation */
    .ewu-inter-table-watermark {
        display: block !important;
        visibility: visible !important;
        text-align: center !important;
        margin: 4px 0 6px 0 !important;
        padding: 3px 8px !important;
        background: #f8fafc !important;
        border: 1px dashed #94a3b8 !important;
        border-radius: 4px !important;
        page-break-inside: avoid !important;
        break-inside: avoid !important;
    }

    .ewu-inter-table-watermark .ewu-watermark-content {
        display: flex !important;
        visibility: visible !important;
        align-items: center !important;
        justify-content: center !important;
        gap: 12px !important;
        font-size: 6.8pt !important;
        color: #475569 !important;
        line-height: 1.25 !important;
    }

    .ewu-inter-table-watermark strong {
        color: #0f172a !important;
    }

    .ewu-inter-table-watermark .watermark-toolkit strong {
        color: #1e40af !important;
    }

    .ewu-inter-table-watermark .watermark-bullet {
        color: #64748b !important;
    }

    /* 5. Routine Timetable Card on Print */
    .ewu-routine-card {
        display: block !important;
        visibility: visible !important;
        border: none !important;
        box-shadow: none !important;
        margin-top: 4px !important;
        margin-bottom: 4px !important;
        page-break-inside: avoid !important;
        break-inside: avoid !important;
        background: transparent !important;
        width: 100% !important;
        overflow: visible !important;
    }

    .ewu-routine-header {
        display: flex !important;
        visibility: visible !important;
        background: #f8fafc !important;
        color: #0f172a !important;
        border-bottom: 1px solid #94a3b8 !important;
        padding: 4px 8px !important;
    }

    .routine-main-title h2 {
        color: #0f172a !important;
        font-size: 9.5pt !important;
    }

    .ewu-sem-pill {
        background: #e0f2fe !important;
        color: #0369a1 !important;
        border: 1px solid #bae6fd !important;
    }

    .stat-tag {
        background: #f1f5f9 !important;
        border: 1px solid #cbd5e1 !important;
        color: #334155 !important;
    }

    .stat-tag strong {
        color: #0f172a !important;
    }

    .ewu-routine-body {
        display: block !important;
        visibility: visible !important;
        padding: 4px !important;
        background: #ffffff !important;
        overflow: visible !important;
    }

    .ewu-routine-table-responsive {
        overflow: visible !important;
        display: block !important;
        width: 100% !important;
        margin: 0 !important;
        padding: 0 !important;
        border: none !important;
    }

    .ewu-routine-grid {
        display: table !important;
        visibility: visible !important;
        width: 100% !important;
        min-width: 100% !important;
        max-width: 100% !important;
        border-collapse: collapse !important;
        border: 1.5px solid #0f172a !important;
        table-layout: fixed !important;
        margin: 0 !important;
    }

    .ewu-routine-grid thead {
        display: table-header-group !important;
    }

    .ewu-routine-grid tbody {
        display: table-row-group !important;
    }

    .ewu-routine-grid tr {
        display: table-row !important;
        visibility: visible !important;
    }

    .ewu-routine-grid th,
    .ewu-routine-grid td {
        display: table-cell !important;
        visibility: visible !important;
        border: 1px solid #94a3b8 !important;
        padding: 3px 2px !important;
        vertical-align: top !important;
        word-wrap: break-word !important;
        overflow-wrap: break-word !important;
    }

    /* Day Column (11% width) */
    .ewu-routine-grid th:first-child,
    .ewu-routine-grid td.ewu-routine-day-cell {
        width: 11% !important;
        max-width: 11% !important;
        min-width: 0 !important;
        background: #f1f5f9 !important;
        color: #0f172a !important;
        font-size: 7pt !important;
        font-weight: 700 !important;
        text-align: center !important;
        vertical-align: middle !important;
        padding: 2px !important;
        white-space: nowrap !important;
    }

    /* All Time Slot Columns (Equal ~14.83% width each) */
    .ewu-routine-grid th:not(:first-child) {
        width: 14.83% !important;
        max-width: 14.83% !important;
        min-width: 0 !important;
        background: #f1f5f9 !important;
        color: #0f172a !important;
        font-size: 6.2pt !important;
        font-weight: 700 !important;
        text-align: center !important;
        vertical-align: middle !important;
        padding: 3px 2px !important;
        white-space: normal !important;
        line-height: 1.15 !important;
    }

    .ewu-routine-grid td.ewu-routine-cell {
        width: 14.83% !important;
        max-width: 14.83% !important;
        min-width: 0 !important;
        padding: 2px !important;
        vertical-align: top !important;
        background: #ffffff !important;
    }

    .ewu-routine-grid td.ewu-routine-cell.empty {
        text-align: center !important;
        vertical-align: middle !important;
    }

    .ewu-routine-grid td.ewu-routine-cell.empty .empty-dash {
        color: #cbd5e1 !important;
        font-size: 9pt !important;
    }

    /* Course Badge inside Routine Cell */
    .ewu-routine-badge {
        display: block !important;
        padding: 3px 3px !important;
        margin-bottom: 2px !important;
        border-radius: 4px !important;
        font-size: 6.5pt !important;
        box-shadow: none !important;
        border: 1px solid #94a3b8 !important;
        page-break-inside: avoid !important;
        break-inside: avoid !important;
        width: 100% !important;
        box-sizing: border-box !important;
    }

    .ewu-routine-badge .badge-title {
        display: flex !important;
        justify-content: space-between !important;
        align-items: center !important;
        margin-bottom: 2px !important;
    }

    .ewu-routine-badge .badge-title strong {
        font-size: 7pt !important;
        font-weight: 800 !important;
    }

    .ewu-routine-badge .badge-sec {
        font-size: 6pt !important;
        font-weight: 600 !important;
    }

    .ewu-routine-badge .badge-room {
        font-size: 6pt !important;
        margin-bottom: 2px !important;
        display: block !important;
    }

    .ewu-routine-badge .badge-meta {
        display: flex !important;
        justify-content: space-between !important;
        align-items: center !important;
        gap: 1px !important;
    }

    .ewu-routine-badge .badge-initial {
        font-size: 6pt !important;
        font-weight: 700 !important;
        padding: 1px 2px !important;
        border-radius: 2px !important;
    }

    .ewu-routine-badge .badge-time {
        font-size: 5.5pt !important;
        white-space: nowrap !important;
    }

    .ewu-ledger-summary-card {
        border: 1px solid #000;
        box-shadow: none;
    }

}
`;
  document.head.appendChild(style);

  // Core Logic
(function () {
  'use strict';

  let config = {
    scheduleEnabled: true,
    offeredEnabled: true,
    ledgerEnabled: true,
    routineEnabled: true
  };

  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    chrome.storage.local.get({
      ewu_schedule_enabled: true,
      ewu_offered_enabled: true,
      ewu_ledger_enabled: true,
      ewu_routine_enabled: true
    }, (res) => {
      config.scheduleEnabled = res.ewu_schedule_enabled !== false;
      config.offeredEnabled = res.ewu_offered_enabled !== false;
      config.ledgerEnabled = res.ewu_ledger_enabled !== false;
      config.routineEnabled = res.ewu_routine_enabled !== false;
      runEnhancements();
    });

    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === 'local') {
        if (changes.ewu_schedule_enabled) config.scheduleEnabled = changes.ewu_schedule_enabled.newValue !== false;
        if (changes.ewu_offered_enabled) config.offeredEnabled = changes.ewu_offered_enabled.newValue !== false;
        if (changes.ewu_ledger_enabled) config.ledgerEnabled = changes.ewu_ledger_enabled.newValue !== false;
        if (changes.ewu_routine_enabled) config.routineEnabled = changes.ewu_routine_enabled.newValue !== false;
        runEnhancements();
      }
    });
  }

  function copyToClipboard(text, btn) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => showCopied(btn)).catch(() => fallbackCopy(text, btn));
    } else {
      fallbackCopy(text, btn);
    }
  }

  function fallbackCopy(text, btn) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      showCopied(btn);
    } catch (e) {
      console.error('Failed to copy', e);
    }
    document.body.removeChild(ta);
  }

  function showCopied(btn) {
    const originalText = btn.innerHTML;
    btn.innerHTML = '✓ Copied';
    btn.classList.add('copied');
    setTimeout(() => {
      btn.innerHTML = originalText;
      btn.classList.remove('copied');
    }, 1500);
  }

  function formatMoney(amount) {
    return '৳ ' + Number(amount).toLocaleString('en-IN');
  }

  // =========================================================================
  // FEATURE 1: Class Schedule & Advising Slip Faculty Revealer
  // =========================================================================
  function processClassSchedule(table) {
    const path = window.location.pathname.toLowerCase();
    if (path.includes('facultyevaluation') || path.includes('offeredcourses') || path.includes('studentledger')) return;

    const headers = Array.from(table.querySelectorAll('th'));
    const hasFacultyHeader = headers.some(th => 
      (th.textContent && th.textContent.toLowerCase().includes('faculty initial')) || 
      (th.textContent && th.textContent.toLowerCase().includes('faculty name')) ||
      (th.getAttribute('ng-show') && th.getAttribute('ng-show').includes('Status'))
    );

    if (!hasFacultyHeader) return;

    if (!config.scheduleEnabled) {
      document.body.classList.add('ewu-schedule-disabled');
      return;
    }
    document.body.classList.remove('ewu-schedule-disabled');

    let initialIdx = -1, nameIdx = -1, emailIdx = -1;
    headers.forEach((th, idx) => {
      const text = th.textContent.trim().toLowerCase();
      if (text.includes('faculty initial')) initialIdx = idx;
      else if (text.includes('faculty name')) nameIdx = idx;
      else if (text.includes('faculty email')) emailIdx = idx;
    });

    if (initialIdx === -1) {
      const hiddenHeaders = headers.filter(th => th.getAttribute('ng-show') && th.getAttribute('ng-show').includes('Status'));
      if (hiddenHeaders.length >= 3) {
        initialIdx = headers.indexOf(hiddenHeaders[0]);
        nameIdx = headers.indexOf(hiddenHeaders[1]);
        emailIdx = headers.indexOf(hiddenHeaders[2]);
      }
    }

    headers.forEach(th => {
      if (th.getAttribute('ng-show') && th.getAttribute('ng-show').includes('Status')) {
        th.classList.add('ewu-revealed-col');
      }
    });

    const rows = table.querySelectorAll('tbody tr:not(.ewu-schedule-processed)');
    rows.forEach((row) => {
      const cells = row.querySelectorAll('td');
      if (cells.length < 5) return;

      cells.forEach(td => {
        if (td.getAttribute('ng-show') && td.getAttribute('ng-show').includes('Status')) {
          td.classList.add('ewu-revealed-col');
        }
      });

      if (initialIdx !== -1 && cells[initialIdx]) {
        const initCell = cells[initialIdx];
        const text = initCell.textContent.trim();
        if (text && !initCell.querySelector('.ewu-initial-badge')) {
          initCell.innerHTML = `<span class="ewu-initial-badge">${text}</span>`;
        }
      }

      if (emailIdx !== -1 && cells[emailIdx]) {
        const emailCell = cells[emailIdx];
        const rawEmail = emailCell.textContent.trim();
        const emailMatch = rawEmail.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
        if (emailMatch && !emailCell.querySelector('.ewu-email-container')) {
          const email = emailMatch[0];
          emailCell.innerHTML = `
            <div class="ewu-email-container">
              <a class="ewu-email-link ewu-screen-only" href="mailto:${email}" title="Send email to ${email}">${email}</a>
              <span class="ewu-email-text ewu-print-only">${email}</span>
              <button type="button" class="ewu-copy-btn" title="Copy email address" data-email="${email}">
                📋 Copy
              </button>
            </div>
          `;
          const copyBtn = emailCell.querySelector('.ewu-copy-btn');
          copyBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            copyToClipboard(email, copyBtn);
          });
        }
      }

      row.classList.add('ewu-schedule-processed');
    });

    const responsiveContainer = table.closest('.table-responsive') || table.parentElement;
    if (responsiveContainer) {
      responsiveContainer.classList.add('ewu-schedule-table-responsive');
    }
    let banner = responsiveContainer.parentElement.querySelector('.ewu-schedule-banner');
    if (responsiveContainer && !banner) {
      banner = document.createElement('div');
      banner.className = 'ewu-revealer-banner ewu-schedule-banner';
      banner.innerHTML = `
        <div class="ewu-banner-left">
          <span class="ewu-banner-pill">EWU-Toolkit</span>
          <span class="ewu-banner-text">🎓 Faculty Initial, Name & Email unhidden</span>
        </div>
        <div class="ewu-banner-right">
          <button type="button" class="ewu-banner-excel-btn" id="ewuBannerExportExcel" title="Export this advising slip and weekly routine to Excel (.xlsx)">
            📊 Export Excel (.xlsx)
          </button>
          <button type="button" class="ewu-banner-print-btn" id="ewuBannerPrintSlip" title="Print this advising slip and routine">
            🖨️ Print
          </button>
          <a href="https://github.com/sowmiksudo/EWU-Toolkit" target="_blank" rel="noopener noreferrer" class="ewu-github-gesture" title="EWU-Toolkit is open-source on GitHub">
            ⭐ <span>GitHub ↗</span>
          </a>
        </div>
      `;
      responsiveContainer.parentElement.insertBefore(banner, responsiveContainer);

      const bannerExcelBtn = banner.querySelector('#ewuBannerExportExcel');
      if (bannerExcelBtn) {
        bannerExcelBtn.addEventListener('click', (e) => {
          e.preventDefault();
          const orig = bannerExcelBtn.innerHTML;
          bannerExcelBtn.innerHTML = '⏳ Exporting...';
          const courses = extractAdvisingCourses(table);
          let sem = 'Fall-2026';
          const semSelect = document.querySelector('select[ng-model*="Semester"]');
          if (semSelect && semSelect.selectedOptions && semSelect.selectedOptions[0]) {
            sem = semSelect.selectedOptions[0].textContent.trim();
          }
          try {
            exportRoutineToExcel(courses, sem);
            setTimeout(() => {
              bannerExcelBtn.innerHTML = '✓ Downloaded!';
              setTimeout(() => { bannerExcelBtn.innerHTML = orig; }, 1500);
            }, 300);
          } catch (err) {
            console.error('Export Excel failed:', err);
            bannerExcelBtn.innerHTML = '⚠️ Error';
            setTimeout(() => { bannerExcelBtn.innerHTML = orig; }, 2000);
          }
        });
      }

      const bannerPrintBtn = banner.querySelector('#ewuBannerPrintSlip');
      if (bannerPrintBtn) {
        bannerPrintBtn.addEventListener('click', (e) => {
          e.preventDefault();
          window.print();
        });
      }
    }

    // Hook EWU portal's native "Print Slip" button so it uses our clean print layout
    const nativePrintBtn = document.querySelector('button[ng-click*="PaySlipPrint"]');
    if (nativePrintBtn && !nativePrintBtn.dataset.ewuHooked) {
      nativePrintBtn.dataset.ewuHooked = 'true';
      nativePrintBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        window.print();
      });
    }

    // Ensure Official University Print Header (hidden on screen, visible on print)
    let printHeader = responsiveContainer.parentElement.querySelector('.ewu-print-header');
    if (!printHeader) {
      printHeader = document.createElement('div');
      printHeader.className = 'ewu-print-header';
      const insertTarget = banner || responsiveContainer;
      responsiveContainer.parentElement.insertBefore(printHeader, insertTarget);
    }

    const studentIdElem = document.getElementById('StudentId');
    const studentId = studentIdElem ? studentIdElem.textContent.trim() : '';
    let semName = 'Fall-2026';
    const semSelect = document.querySelector('select[ng-model*="Semester"]');
    if (semSelect && semSelect.selectedOptions && semSelect.selectedOptions[0]) {
      semName = semSelect.selectedOptions[0].textContent.trim();
    }
    const currentAdvisingCourses = extractAdvisingCourses(table);
    const totalCredits = currentAdvisingCourses.reduce((sum, c) => sum + c.credits, 0);
    const nowFormatted = new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });

    printHeader.innerHTML = `
      <div class="ewu-print-header-top">
        <div class="ewu-print-title-area">
          <h1 class="ewu-print-uni-title">EAST WEST UNIVERSITY</h1>
          <h2 class="ewu-print-doc-title">Student Advising Slip &bull; Weekly Class Routine</h2>
        </div>
      </div>
      <div class="ewu-print-meta-grid">
        ${studentId ? `<div class="ewu-print-meta-item"><strong>Student ID:</strong> ${studentId}</div>` : ''}
        <div class="ewu-print-meta-item"><strong>Semester:</strong> ${semName}</div>
        <div class="ewu-print-meta-item"><strong>Enrolled Courses:</strong> ${currentAdvisingCourses.length}</div>
        <div class="ewu-print-meta-item"><strong>Total Credits:</strong> ${totalCredits}</div>
        <div class="ewu-print-meta-item"><strong>Print Date:</strong> ${nowFormatted}</div>
      </div>
      <div class="ewu-print-section-divider">
        <span>1. Enrolled Courses & Faculty Information</span>
      </div>
    `;

    // Remove fixed bottom PDF footer if present (credits kept only on the separator)
    const existingPdfFooter = document.querySelector('.ewu-pdf-footer');
    if (existingPdfFooter) existingPdfFooter.remove();

    // Render or update the Visual Class Routine below the table
    processClassRoutine(table, responsiveContainer);
  }

  // =========================================================================
  // FEATURE 1.5: Interactive Class Routine Timetable & Automated Excel Export
  // =========================================================================
  const EWU_DEFAULT_TIME_SLOTS = [
    { label: '08:30 AM - 10:00 AM', startMin: 510, endMin: 600 },
    { label: '10:10 AM - 11:40 AM', startMin: 610, endMin: 700 },
    { label: '11:50 AM - 01:20 PM', startMin: 710, endMin: 800 },
    { label: '01:30 PM - 03:00 PM', startMin: 810, endMin: 900 },
    { label: '03:10 PM - 04:40 PM', startMin: 910, endMin: 1000 },
    { label: '04:50 PM - 06:20 PM', startMin: 1010, endMin: 1100 }
  ];

  const COLOR_PALETTES = [
    { name: 'indigo', bg: '#e0e7ff', border: '#818cf8', text: '#3730a3', badge: '#4338ca' },
    { name: 'emerald', bg: '#d1fae5', border: '#6ee7b7', text: '#065f46', badge: '#047857' },
    { name: 'violet', bg: '#ede9fe', border: '#c4b5fd', text: '#5b21b6', badge: '#6d28d9' },
    { name: 'amber', bg: '#fef3c7', border: '#fcd34d', text: '#92400e', badge: '#b45309' },
    { name: 'rose', bg: '#ffe4e6', border: '#fda4af', text: '#9f1239', badge: '#be123c' },
    { name: 'cyan', bg: '#cffafe', border: '#67e8f9', text: '#155e75', badge: '#0e7490' },
    { name: 'blue', bg: '#dbeafe', border: '#93c5fd', text: '#1e40af', badge: '#1d4ed8' }
  ];

  function parseTimingString(timingStr) {
    if (!timingStr) return [];
    const results = [];
    const segments = timingStr.split(/[,;\n]+/).map(s => s.trim()).filter(Boolean);

    segments.forEach(seg => {
      const match = seg.match(/^([A-Za-z]+)\s+([0-9]{1,2}:[0-9]{2}\s*(?:AM|PM|am|pm)?)\s*-\s*([0-9]{1,2}:[0-9]{2}\s*(?:AM|PM|am|pm)?)/i);
      if (match) {
        const dayLetters = match[1].toUpperCase();
        let startStr = match[2].trim();
        let endStr = match[3].trim();

        if (!/am|pm/i.test(startStr) && /am|pm/i.test(endStr)) {
          const meridian = endStr.slice(-2);
          startStr += ' ' + meridian;
        }

        const startMin = timeToMinutes(startStr);
        const endMin = timeToMinutes(endStr);
        const days = decodeDays(dayLetters);

        days.forEach(day => {
          results.push({
            day,
            startStr,
            endStr,
            startMin,
            endMin,
            timeLabel: `${format12h(startStr)} - ${format12h(endStr)}`
          });
        });
      }
    });

    return results;
  }

  function decodeDays(dayLetters) {
    const days = [];
    if (dayLetters.includes('SAT') || dayLetters.includes('A')) days.push('Saturday');
    if (dayLetters.includes('S') && !dayLetters.includes('SAT')) days.push('Sunday');
    if (dayLetters.includes('M')) days.push('Monday');
    if (dayLetters.includes('T')) days.push('Tuesday');
    if (dayLetters.includes('W')) days.push('Wednesday');
    if (dayLetters.includes('R')) days.push('Thursday');
    if (dayLetters.includes('F')) days.push('Friday');
    return [...new Set(days)];
  }

  function timeToMinutes(str) {
    const m = str.match(/([0-9]{1,2}):([0-9]{2})\s*(AM|PM)?/i);
    if (!m) return 0;
    let h = parseInt(m[1], 10);
    const min = parseInt(m[2], 10);
    const mod = m[3] ? m[3].toUpperCase() : '';
    if (mod === 'PM' && h < 12) h += 12;
    if (mod === 'AM' && h === 12) h = 0;
    return h * 60 + min;
  }

  function format12h(str) {
    const m = str.match(/([0-9]{1,2}):([0-9]{2})\s*(AM|PM)?/i);
    if (!m) return str;
    let h = parseInt(m[1], 10);
    const min = m[2];
    const mod = m[3] ? m[3].toUpperCase() : '';
    return `${h}:${min} ${mod}`.trim();
  }

  function extractAdvisingCourses(table) {
    const headers = Array.from(table.querySelectorAll('th'));
    let courseIdx = -1, secIdx = -1, credIdx = -1, timeIdx = -1, roomIdx = -1, initIdx = -1, nameIdx = -1, emailIdx = -1;

    headers.forEach((th, idx) => {
      const txt = th.textContent.trim().toLowerCase();
      if (txt === 'course' || txt.includes('course')) courseIdx = idx;
      if (txt === 'section' || txt.includes('section')) secIdx = idx;
      if (txt === 'credits' || txt.includes('credit')) credIdx = idx;
      if (txt === 'timing' || txt.includes('time')) timeIdx = idx;
      if (txt.includes('room')) roomIdx = idx;
      if (txt.includes('faculty initial')) initIdx = idx;
      if (txt.includes('faculty name')) nameIdx = idx;
      if (txt.includes('faculty email')) emailIdx = idx;
    });

    const courses = [];
    const rows = table.querySelectorAll('tbody tr');
    let cIdx = 0;

    rows.forEach(row => {
      const cells = Array.from(row.querySelectorAll('td'));
      if (cells.length < 5) return;

      const courseCode = cells[courseIdx]?.textContent.trim() || '';
      if (!courseCode || courseCode.toLowerCase() === 'course') return;

      const section = cells[secIdx]?.textContent.trim() || '';
      const credits = parseFloat(cells[credIdx]?.textContent.trim()) || 3.0;
      const timing = cells[timeIdx]?.textContent.trim() || '';
      const room = cells[roomIdx]?.textContent.trim() || '';

      const initBadge = cells[initIdx]?.querySelector('.ewu-initial-badge');
      const facultyInitial = initBadge ? initBadge.textContent.trim() : (cells[initIdx]?.textContent.trim() || '');

      const facultyName = cells[nameIdx]?.textContent.trim() || '';

      const emailLink = cells[emailIdx]?.querySelector('.ewu-email-link');
      const facultyEmail = emailLink ? emailLink.textContent.trim() : (cells[emailIdx]?.textContent.trim() || '');

      const slots = parseTimingString(timing);
      const color = COLOR_PALETTES[cIdx % COLOR_PALETTES.length];
      cIdx++;

      courses.push({
        courseCode,
        section,
        credits,
        timing,
        room,
        facultyInitial,
        facultyName,
        facultyEmail,
        slots,
        color
      });
    });

    return courses;
  }

  function getActiveScheduleDays(courses) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'];
    if (courses.some(c => c.slots.some(s => s.day === 'Friday'))) days.push('Friday');
    if (courses.some(c => c.slots.some(s => s.day === 'Saturday'))) days.push('Saturday');
    return days;
  }

  function getActiveScheduleSlots(courses) {
    const slots = [...EWU_DEFAULT_TIME_SLOTS];
    courses.forEach(c => {
      c.slots.forEach(s => {
        const overlaps = slots.some(col => !(s.endMin <= col.startMin || s.startMin >= col.endMin));
        if (!overlaps) {
          slots.push({
            label: s.timeLabel,
            startMin: s.startMin,
            endMin: s.endMin
          });
        }
      });
    });
    slots.sort((a, b) => a.startMin - b.startMin);
    return slots;
  }

  function xmlEscape(str) {
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  function colToLetter(colIndex) {
    let temp, letter = '';
    while (colIndex > 0) {
      temp = (colIndex - 1) % 26;
      letter = String.fromCharCode(temp + 65) + letter;
      colIndex = Math.floor((colIndex - temp - 1) / 26);
    }
    return letter;
  }

  function buildXlsxXml(courses, semesterName) {
    const days = getActiveScheduleDays(courses);
    const slots = getActiveScheduleSlots(courses);
    const now = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    const totalCredits = courses.reduce((sum, c) => sum + (parseFloat(c.credits) || 0), 0);

    let rowsXml = '';
    let rowIdx = 1;

    function addRow(cells, height) {
      let rowContent = `<row r="${rowIdx}"${height ? ` ht="${height}" customHeight="1"` : ''}>`;
      cells.forEach((cell, cIdx) => {
        const colLetter = colToLetter(cIdx + 1);
        const cellRef = `${colLetter}${rowIdx}`;
        const styleAttr = cell.style ? ` s="${cell.style}"` : '';
        if (typeof cell.val === 'number') {
          rowContent += `<c r="${cellRef}"${styleAttr}><v>${cell.val}</v></c>`;
        } else {
          const text = xmlEscape(cell.val || '');
          rowContent += `<c r="${cellRef}"${styleAttr} t="inlineStr"><is><t>${text}</t></is></c>`;
        }
      });
      rowContent += `</row>`;
      rowsXml += rowContent;
      rowIdx++;
    }

    // Row 1: Title
    addRow([{ val: 'EAST WEST UNIVERSITY - CLASS ROUTINE & ADVISING SLIP', style: 1 }], 28);
    // Row 2: Metadata
    addRow([{ val: `Semester: ${semesterName} | Total Courses: ${courses.length} | Total Credits: ${totalCredits} | Exported: ${now} via EWU-Toolkit`, style: 2 }], 20);
    // Row 3: Blank
    addRow([]);

    // Row 4: Section 1 Header
    addRow([{ val: '1. WEEKLY CLASS TIMETABLE MATRIX', style: 3 }], 24);

    // Row 5: Timetable Headers
    const gridHeaders = [{ val: 'Day / Time', style: 4 }];
    slots.forEach(s => gridHeaders.push({ val: s.label, style: 4 }));
    addRow(gridHeaders, 22);

    // Timetable Grid Rows
    days.forEach(day => {
      const rowCells = [{ val: day, style: 5 }];
      slots.forEach(slot => {
        const matching = courses.filter(c =>
          c.slots.some(s => s.day === day && !(s.endMin <= slot.startMin || s.startMin >= slot.endMin))
        );
        if (matching.length === 0) {
          rowCells.push({ val: '-', style: 6 });
        } else {
          const desc = matching.map(m => `${m.courseCode} (Sec ${m.section}) [${m.room}] - ${m.facultyInitial}`).join('\n');
          rowCells.push({ val: desc, style: 7 });
        }
      });
      addRow(rowCells, 32);
    });

    // Blank row
    addRow([]);

    // Section 2 Header
    addRow([{ val: '2. COURSE & FACULTY DETAILS ROSTER', style: 3 }], 24);

    // Roster Header
    const rosterHeaders = [
      { val: '#', style: 4 },
      { val: 'Course Code', style: 4 },
      { val: 'Section', style: 4 },
      { val: 'Credits', style: 4 },
      { val: 'Class Timing', style: 4 },
      { val: 'Room No.', style: 4 },
      { val: 'Faculty Initial', style: 4 },
      { val: 'Faculty Name', style: 4 },
      { val: 'Faculty Email', style: 4 }
    ];
    addRow(rosterHeaders, 22);

    // Roster Rows
    courses.forEach((c, idx) => {
      addRow([
        { val: idx + 1, style: 6 },
        { val: c.courseCode, style: 8 },
        { val: c.section, style: 6 },
        { val: c.credits, style: 6 },
        { val: c.timing, style: 6 },
        { val: c.room, style: 6 },
        { val: c.facultyInitial, style: 8 },
        { val: c.facultyName, style: 6 },
        { val: c.facultyEmail, style: 9 }
      ], 20);
    });

    // Blank row
    addRow([]);

    // Footer Row with Website Link
    addRow([{ val: 'Official Portal: https://portal.ewubd.edu | Enhanced by EWU-Toolkit: https://github.com/sowmiksudo/EWU-Toolkit', style: 10 }], 20);

    const worksheetXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <cols>
    <col min="1" max="1" width="16" customWidth="1"/>
    <col min="2" max="2" width="24" customWidth="1"/>
    <col min="3" max="3" width="24" customWidth="1"/>
    <col min="4" max="4" width="24" customWidth="1"/>
    <col min="5" max="5" width="24" customWidth="1"/>
    <col min="6" max="6" width="24" customWidth="1"/>
    <col min="7" max="7" width="24" customWidth="1"/>
    <col min="8" max="8" width="28" customWidth="1"/>
    <col min="9" max="9" width="32" customWidth="1"/>
  </cols>
  <sheetData>
    ${rowsXml}
  </sheetData>
</worksheet>`;

    const stylesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts count="8">
    <font><name val="Calibri"/><sz val="11"/></font>
    <font><b/><color rgb="FF0F172A"/><name val="Calibri"/><sz val="14"/></font>
    <font><i/><color rgb="FF475569"/><name val="Calibri"/><sz val="9.5"/></font>
    <font><b/><color rgb="FF1E293B"/><name val="Calibri"/><sz val="12"/></font>
    <font><b/><color rgb="FFFFFFFF"/><name val="Calibri"/><sz val="10"/></font>
    <font><b/><color rgb="FF1E40AF"/><name val="Calibri"/><sz val="10"/></font>
    <font><u/><color rgb="FF1D4ED8"/><name val="Calibri"/><sz val="10"/></font>
    <font><i/><color rgb="FF64748B"/><name val="Calibri"/><sz val="9"/></font>
  </fonts>
  <fills count="5">
    <fill><patternFill patternType="none"/></fill>
    <fill><patternFill patternType="gray125"/></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FF0F172A"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFF1F5F9"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFEEF2FF"/></patternFill></fill>
  </fills>
  <borders count="2">
    <border><left/><right/><top/><bottom/><diagonal/></border>
    <border>
      <left style="thin"><color rgb="FFCBD5E1"/></left>
      <right style="thin"><color rgb="FFCBD5E1"/></right>
      <top style="thin"><color rgb="FFCBD5E1"/></top>
      <bottom style="thin"><color rgb="FFCBD5E1"/></bottom>
    </border>
  </borders>
  <cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
  <cellXfs count="11">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
    <xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/>
    <xf numFmtId="0" fontId="2" fillId="0" borderId="0" xfId="0" applyFont="1"/>
    <xf numFmtId="0" fontId="3" fillId="0" borderId="0" xfId="0" applyFont="1"/>
    <xf numFmtId="0" fontId="4" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="0" fillId="3" borderId="1" xfId="0" applyFill="1" applyBorder="1"><alignment horizontal="center" vertical="center"/></xf>
    <xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1"><alignment vertical="center"/></xf>
    <xf numFmtId="0" fontId="0" fillId="4" borderId="1" xfId="0" applyFill="1" applyBorder="1"><alignment vertical="center" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="5" fillId="0" borderId="1" xfId="0" applyFont="1" applyBorder="1"><alignment horizontal="center" vertical="center"/></xf>
    <xf numFmtId="0" fontId="6" fillId="0" borderId="1" xfId="0" applyFont="1" applyBorder="1"><alignment vertical="center"/></xf>
    <xf numFmtId="0" fontId="7" fillId="0" borderId="0" xfId="0" applyFont="1"/>
  </cellXfs>
</styleSheet>`;

    return { worksheetXml, stylesXml };
  }

  function createZip(files) {
    const crcTable = new Uint32Array(256);
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let k = 0; k < 8; k++) {
        c = ((c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
      }
      crcTable[i] = c;
    }

    function crc32(bytes) {
      let crc = 0 ^ (-1);
      for (let i = 0; i < bytes.length; i++) {
        crc = (crc >>> 8) ^ crcTable[(crc ^ bytes[i]) & 0xFF];
      }
      return (crc ^ (-1)) >>> 0;
    }

    const encoder = new TextEncoder();
    const localHeaders = [];
    const centralHeaders = [];
    let offset = 0;

    for (const [name, content] of Object.entries(files)) {
      const nameBytes = encoder.encode(name);
      const dataBytes = typeof content === 'string' ? encoder.encode(content) : new Uint8Array(content);
      const crc = crc32(dataBytes);
      const size = dataBytes.length;

      // Local header: 30 bytes + name length + data length
      const local = new Uint8Array(30 + nameBytes.length + size);
      const view = new DataView(local.buffer);

      view.setUint32(0, 0x04034b50, true); // Local file header signature
      view.setUint16(4, 20, true);         // Version needed (2.0)
      view.setUint16(6, 0x0800, true);     // Flags (bit 11 = UTF-8 filename)
      view.setUint16(8, 0, true);          // Compression method (0 = store)
      view.setUint16(10, 0, true);         // Mod time
      view.setUint16(12, 0, true);         // Mod date
      view.setUint32(14, crc, true);        // CRC-32
      view.setUint32(18, size, true);       // Compressed size
      view.setUint32(22, size, true);       // Uncompressed size
      view.setUint16(26, nameBytes.length, true); // Filename length
      view.setUint16(28, 0, true);         // Extra field length
      local.set(nameBytes, 30);
      local.set(dataBytes, 30 + nameBytes.length);
      localHeaders.push(local);

      // Central header: 46 bytes + name length
      const central = new Uint8Array(46 + nameBytes.length);
      const cview = new DataView(central.buffer);

      cview.setUint32(0, 0x02014b50, true); // Central directory signature
      cview.setUint16(4, 20, true);         // Version made by
      cview.setUint16(6, 20, true);         // Version needed
      cview.setUint16(8, 0x0800, true);     // Flags (UTF-8)
      cview.setUint16(10, 0, true);         // Compression (0)
      cview.setUint16(12, 0, true);         // Mod time
      cview.setUint16(14, 0, true);         // Mod date
      cview.setUint32(16, crc, true);        // CRC-32
      cview.setUint32(20, size, true);       // Compressed size
      cview.setUint32(24, size, true);       // Uncompressed size
      cview.setUint16(28, nameBytes.length, true);
      cview.setUint16(30, 0, true);         // Extra field length
      cview.setUint16(32, 0, true);         // Comment length
      cview.setUint16(34, 0, true);         // Disk start
      cview.setUint16(36, 0, true);         // Internal attr
      cview.setUint32(38, 0, true);         // External attr
      cview.setUint32(42, offset, true);     // Relative offset of local header
      central.set(nameBytes, 46);
      centralHeaders.push(central);

      offset += local.length;
    }

    const centralOffset = offset;
    let centralSize = 0;
    for (const c of centralHeaders) centralSize += c.length;

    // End of Central Directory: 22 bytes
    const eocd = new Uint8Array(22);
    const eview = new DataView(eocd.buffer);
    eview.setUint32(0, 0x06054b50, true); // EOCD signature
    eview.setUint16(4, 0, true);          // Disk number
    eview.setUint16(6, 0, true);          // Start disk
    eview.setUint16(8, centralHeaders.length, true);  // Entries this disk
    eview.setUint16(10, centralHeaders.length, true); // Total entries
    eview.setUint32(12, centralSize, true);           // Central directory size
    eview.setUint32(16, centralOffset, true);         // Central directory offset
    eview.setUint16(20, 0, true);                     // Comment length

    const totalLength = centralOffset + centralSize + 22;
    const out = new Uint8Array(totalLength);
    let pos = 0;
    for (const l of localHeaders) {
      out.set(l, pos);
      pos += l.length;
    }
    for (const c of centralHeaders) {
      out.set(c, pos);
      pos += c.length;
    }
    out.set(eocd, pos);

    return out;
  }

  function downloadBinaryFile(uint8Array, filename, mimeType) {
    const type = mimeType || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    try {
      const blob = new Blob([uint8Array], { type });
      if (window.navigator && window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveOrOpenBlob(blob, filename);
        return;
      }
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.style.display = 'none';
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        if (link.parentElement) link.parentElement.removeChild(link);
        URL.revokeObjectURL(url);
      }, 10000);
      return;
    } catch (err) {
      console.warn('Blob URL export failed, attempting Base64 fallback:', err);
    }

    // Base64 Data URI fallback
    try {
      let binary = '';
      const chunk = 8192;
      for (let i = 0; i < uint8Array.length; i += chunk) {
        binary += String.fromCharCode.apply(null, uint8Array.subarray(i, i + chunk));
      }
      const base64 = btoa(binary);
      const link = document.createElement('a');
      link.style.display = 'none';
      link.href = `data:${type};base64,` + base64;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        if (link.parentElement) link.parentElement.removeChild(link);
      }, 10000);
    } catch (err2) {
      console.error('Base64 export failed:', err2);
    }
  }

  function exportRoutineToExcel(courses, semesterName) {
    const cleanSem = (semesterName || 'Fall-2026').replace(/[^a-zA-Z0-9_-]/g, '_');
    const { worksheetXml, stylesXml } = buildXlsxXml(courses, semesterName || 'Fall-2026');

    const files = {
      '[Content_Types].xml': `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
</Types>`,
      '_rels/.rels': `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`,
      'xl/_rels/workbook.xml.rels': `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`,
      'xl/workbook.xml': `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>
    <sheet name="Class Routine" sheetId="1" r:id="rId1"/>
  </sheets>
</workbook>`,
      'xl/styles.xml': stylesXml,
      'xl/worksheets/sheet1.xml': worksheetXml
    };

    const zipBytes = createZip(files);
    downloadBinaryFile(zipBytes, `EWU_Class_Routine_${cleanSem}.xlsx`, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  }

  function exportRoutineToImage(courses, semesterName) {
    if (!courses || courses.length === 0) return;

    let studentId = '';
    const idEl = document.getElementById('StudentId') || document.querySelector('input[ng-model*="StudentId"]');
    if (idEl && idEl.value) studentId = idEl.value.trim();
    if (!studentId) {
      const match = document.body.innerText.match(/\b\d{4}-\d{1,2}-\d{2}-\d{3}\b/);
      if (match) studentId = match[0];
    }

    const totalCredits = courses.reduce((sum, c) => sum + c.credits, 0);
    const nowFormatted = new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    const cleanSem = (semesterName || 'Fall-2026').replace(/[^a-zA-Z0-9_-]/g, '_');

    const days = getActiveScheduleDays(courses);
    const slots = getActiveScheduleSlots(courses);

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const W = 1000;
    const padding = 20;
    const contentW = W - padding * 2;

    const dayRowHeights = days.map(day => {
      const maxInSlot = Math.max(1, ...slots.map(s => 
        courses.filter(c => c.slots.some(sl => sl.day === day && !(sl.endMin <= s.startMin || sl.startMin >= s.endMin))).length
      ));
      return maxInSlot > 1 ? 38 + maxInSlot * 48 : 68;
    });

    const headerH = 75;
    const s1TitleH = 26;
    const t1RowH = 26;
    const t1H = 28 + courses.length * t1RowH;
    const watermarkH = 28;
    const s2TitleH = 26;
    const routineHeaderH = 34;
    const t2H = 30 + dayRowHeights.reduce((sum, h) => sum + h, 0);

    const totalH = padding + headerH + 10 + s1TitleH + t1H + 12 + watermarkH + 12 + s2TitleH + routineHeaderH + t2H + padding;

    const scale = 2;
    canvas.width = Math.round(W * scale);
    canvas.height = Math.round(totalH * scale);
    ctx.scale(scale, scale);

    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, W, totalH);

    let y = padding;

    // 1. University Header
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('EAST WEST UNIVERSITY', W / 2, y);

    y += 26;
    ctx.fillStyle = '#475569';
    ctx.font = '600 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('Student Advising Slip • Weekly Class Routine', W / 2, y);

    y += 20;
    // Meta box
    ctx.fillStyle = '#f8fafc';
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(padding, y, contentW, 26, 4);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#334155';
    ctx.font = '11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    const metaParts = [
      `Student ID: ${studentId || 'N/A'}`,
      `Semester: ${semesterName || 'Fall-2026'}`,
      `Enrolled Courses: ${courses.length}`,
      `Total Credits: ${totalCredits}`,
      `Print Date: ${nowFormatted}`
    ];
    const colW = contentW / metaParts.length;
    metaParts.forEach((part, i) => {
      const x = padding + i * colW + colW / 2;
      ctx.fillText(part, x, y + 6);
    });

    y += 36;

    // 2. Section 1 Title
    ctx.textAlign = 'left';
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('1. ENROLLED COURSES & FACULTY INFORMATION', padding, y);
    y += 18;
    ctx.strokeStyle = '#94a3b8';
    ctx.beginPath();
    ctx.moveTo(padding, y);
    ctx.lineTo(W - padding, y);
    ctx.stroke();
    y += 6;

    // 3. Table 1 (Advising Courses Table)
    const t1Cols = [
      { label: 'Serial', w: 0.05, align: 'center' },
      { label: 'Course', w: 0.10, align: 'left', bold: true },
      { label: 'Section', w: 0.05, align: 'center' },
      { label: 'Credits', w: 0.05, align: 'center' },
      { label: 'Timing', w: 0.16, align: 'left' },
      { label: 'Room No.', w: 0.08, align: 'center' },
      { label: 'WithDraw Status', lines: ['WithDraw', 'Status'], w: 0.08, align: 'center' },
      { label: 'Drop Status', lines: ['Drop', 'Status'], w: 0.07, align: 'center' },
      { label: 'Faculty Initial', lines: ['Faculty', 'Initial'], w: 0.09, align: 'center' },
      { label: 'Faculty Name', w: 0.15, align: 'left' },
      { label: 'Faculty Email', w: 0.12, align: 'left' }
    ];

    // Header row
    let xCur = padding;
    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(padding, y, contentW, 28);
    ctx.strokeStyle = '#94a3b8';
    ctx.strokeRect(padding, y, contentW, 28);

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 10px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    t1Cols.forEach(col => {
      const colPx = col.w * contentW;
      ctx.strokeStyle = '#cbd5e1';
      ctx.strokeRect(xCur, y, colPx, 28);
      if (col.lines) {
        ctx.textAlign = 'center';
        ctx.fillText(col.lines[0], xCur + colPx / 2, y + 3);
        ctx.fillText(col.lines[1], xCur + colPx / 2, y + 14);
      } else if (col.align === 'center') {
        ctx.textAlign = 'center';
        ctx.fillText(col.label, xCur + colPx / 2, y + 8);
      } else {
        ctx.textAlign = 'left';
        ctx.fillText(col.label, xCur + 6, y + 8);
      }
      xCur += colPx;
    });
    y += 28;

    // Data rows
    courses.forEach((c, idx) => {
      xCur = padding;
      ctx.fillStyle = idx % 2 === 0 ? '#ffffff' : '#fcfcfd';
      ctx.fillRect(padding, y, contentW, t1RowH);
      ctx.strokeStyle = '#cbd5e1';
      ctx.strokeRect(padding, y, contentW, t1RowH);

      const values = [
        idx + 1,
        c.courseCode,
        c.section,
        c.credits,
        c.timing,
        c.room,
        c.withDraw || 'No',
        c.dropStatus || 'No',
        c.facultyInitial,
        c.facultyName,
        c.facultyEmail
      ];

      t1Cols.forEach((col, cIdx) => {
        const colPx = col.w * contentW;
        ctx.strokeRect(xCur, y, colPx, t1RowH);

        const val = String(values[cIdx]);
        if (col.label === 'Faculty Initial') {
          ctx.fillStyle = '#e0e7ff';
          ctx.strokeStyle = '#bfdbfe';
          const badgeW = 54;
          const badgeH = 18;
          const bx = xCur + (colPx - badgeW) / 2;
          const by = y + (t1RowH - badgeH) / 2;
          ctx.beginPath();
          ctx.roundRect(bx, by, badgeW, badgeH, 4);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = '#1e40af';
          ctx.font = 'bold 10px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(val, bx + badgeW / 2, by + 3);
        } else {
          ctx.fillStyle = '#0f172a';
          let fontSize = col.bold ? 10.5 : 9.5;
          ctx.font = (col.bold ? 'bold ' : '') + `${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;

          while (ctx.measureText(val).width > colPx - 8 && fontSize > 7.5) {
            fontSize -= 0.5;
            ctx.font = (col.bold ? 'bold ' : '') + `${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
          }

          if (col.align === 'center') {
            ctx.textAlign = 'center';
            ctx.fillText(val, xCur + colPx / 2, y + 7);
          } else {
            ctx.textAlign = 'left';
            ctx.fillText(val, xCur + 5, y + 7);
          }
        }
        xCur += colPx;
      });
      y += t1RowH;
    });

    y += 12;

    // 4. Inter-Table Watermark Website Citation
    ctx.fillStyle = '#f8fafc';
    ctx.strokeStyle = '#94a3b8';
    ctx.beginPath();
    ctx.roundRect(padding, y, contentW, watermarkH, 4);
    ctx.fill();
    ctx.save();
    ctx.setLineDash([4, 3]);
    ctx.stroke();
    ctx.restore();

    ctx.textAlign = 'center';
    ctx.fillStyle = '#475569';
    ctx.font = '10px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('🎓 Official EWU Portal: https://portal.ewubd.edu   •   ⭐ EWU-Toolkit on GitHub: https://github.com/sowmiksudo/EWU-Toolkit', W / 2, y + 8);

    y += watermarkH + 12;

    // 5. Section 2 Title
    ctx.textAlign = 'left';
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('2. WEEKLY CLASS ROUTINE TIMETABLE', padding, y);
    y += 18;
    ctx.strokeStyle = '#94a3b8';
    ctx.beginPath();
    ctx.moveTo(padding, y);
    ctx.lineTo(W - padding, y);
    ctx.stroke();
    y += 6;

    // 6. Routine Header Bar
    ctx.fillStyle = '#f8fafc';
    ctx.strokeStyle = '#cbd5e1';
    ctx.beginPath();
    ctx.roundRect(padding, y, contentW, routineHeaderH, [6, 6, 0, 0]);
    ctx.fill();
    ctx.stroke();

    ctx.textAlign = 'left';
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('📅 My Weekly Class Routine', padding + 12, y + 9);

    // Semester Pill
    ctx.fillStyle = '#e0f2fe';
    ctx.strokeStyle = '#bae6fd';
    ctx.beginPath();
    ctx.roundRect(padding + 220, y + 6, 80, 20, 10);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#0369a1';
    ctx.font = 'bold 10.5px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(semesterName || 'Fall-2026', padding + 220 + 40, y + 9);

    // Stats
    ctx.fillStyle = '#334155';
    ctx.font = '11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`${courses.length} Courses  •  ${totalCredits} Credits`, W - padding - 14, y + 10);

    y += routineHeaderH;

    // 7. Routine Table
    const dayColW = contentW * 0.11;
    const slotColW = (contentW - dayColW) / slots.length;

    // Table header
    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(padding, y, contentW, 30);
    ctx.strokeStyle = '#94a3b8';
    ctx.strokeRect(padding, y, contentW, 30);

    ctx.strokeRect(padding, y, dayColW, 30);
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 10.5px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Day / Time', padding + dayColW / 2, y + 9);

    slots.forEach((s, sIdx) => {
      const sx = padding + dayColW + sIdx * slotColW;
      ctx.strokeRect(sx, y, slotColW, 30);
      ctx.font = 'bold 9.5px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      const parts = s.label.split(' - ');
      ctx.fillText(parts[0], sx + slotColW / 2, y + 4);
      ctx.fillText('- ' + parts[1], sx + slotColW / 2, y + 16);
    });

    y += 30;

    // Routine grid rows
    days.forEach((day, dIdx) => {
      const rowH = dayRowHeights[dIdx];

      // Day cell
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(padding, y, dayColW, rowH);
      ctx.strokeStyle = '#94a3b8';
      ctx.strokeRect(padding, y, dayColW, rowH);

      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(day, padding + dayColW / 2, y + rowH / 2 - 6);

      slots.forEach((s, sIdx) => {
        const sx = padding + dayColW + sIdx * slotColW;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(sx, y, slotColW, rowH);
        ctx.strokeStyle = '#cbd5e1';
        ctx.strokeRect(sx, y, slotColW, rowH);

        const matching = courses.filter(c => 
          c.slots.some(sl => sl.day === day && !(sl.endMin <= s.startMin || sl.startMin >= s.endMin))
        );

        if (matching.length === 0) {
          ctx.fillStyle = '#cbd5e1';
          ctx.font = '14px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('-', sx + slotColW / 2, y + rowH / 2 - 8);
        } else {
          const cardPad = 4;
          const cardW = slotColW - cardPad * 2;
          const singleCardH = matching.length > 1 ? (rowH - cardPad * (matching.length + 1)) / matching.length : rowH - cardPad * 2;

          matching.forEach((c, mIdx) => {
            const cardX = sx + cardPad;
            const cardY = y + cardPad + mIdx * (singleCardH + cardPad);

            ctx.fillStyle = c.color.bg;
            ctx.strokeStyle = c.color.border;
            ctx.beginPath();
            ctx.roundRect(cardX, cardY, cardW, singleCardH, 5);
            ctx.fill();
            ctx.stroke();

            // Course code + Sec
            ctx.textAlign = 'left';
            ctx.fillStyle = c.color.text;
            ctx.font = 'bold 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
            ctx.fillText(c.courseCode, cardX + 6, cardY + 5);

            ctx.textAlign = 'right';
            ctx.font = '600 9.5px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
            ctx.fillText(`Sec ${c.section}`, cardX + cardW - 6, cardY + 6);

            // Room
            ctx.textAlign = 'left';
            ctx.font = '10px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
            ctx.fillText(`📍 ${c.room}`, cardX + 6, cardY + 22);

            // Initial + time
            ctx.font = 'bold 9.5px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
            ctx.fillText(c.facultyInitial, cardX + 6, cardY + 38);

            const currentSlot = c.slots.find(sl => sl.day === day && !(sl.endMin <= s.startMin || sl.startMin >= s.endMin));
            if (currentSlot) {
              ctx.textAlign = 'right';
              ctx.font = '8.5px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
              ctx.fillText(currentSlot.timeLabel, cardX + cardW - 6, cardY + 39);
            }
          });
        }
      });

      y += rowH;
    });



    // Trigger PNG Download
    const filename = `EWU_Class_Routine_${cleanSem}.png`;
    if (canvas.toBlob) {
      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.style.display = 'none';
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        setTimeout(() => {
          if (link.parentElement) link.parentElement.removeChild(link);
          URL.revokeObjectURL(url);
        }, 10000);
      }, 'image/png');
    } else {
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.style.display = 'none';
      link.href = dataUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        if (link.parentElement) link.parentElement.removeChild(link);
      }, 10000);
    }
  }

  function processClassRoutine(table, container) {
    if (!config.routineEnabled) {
      const existingCitation = container.parentElement.querySelector('.ewu-inter-table-watermark');
      if (existingCitation) existingCitation.remove();
      const existing = container.parentElement.querySelector('.ewu-routine-card');
      if (existing) existing.remove();
      return;
    }

    const courses = extractAdvisingCourses(table);
    if (courses.length === 0) return;

    // Detect semester name
    let semesterName = 'Fall-2026';
    const semSelect = document.querySelector('select[ng-model*="Semester"]');
    if (semSelect && semSelect.selectedOptions && semSelect.selectedOptions[0]) {
      semesterName = semSelect.selectedOptions[0].textContent.trim();
    }

    // Inter-table watermark website citation (positioned between Courses Table and Routine Timetable)
    let watermarkCitation = container.parentElement.querySelector('.ewu-inter-table-watermark');
    if (!watermarkCitation) {
      watermarkCitation = document.createElement('div');
      watermarkCitation.className = 'ewu-inter-table-watermark';
      watermarkCitation.innerHTML = `
        <div class="ewu-watermark-content">
          <span class="watermark-portal">
            🎓 <strong>Official Student Portal:</strong> <a href="https://portal.ewubd.edu" target="_blank" rel="noopener noreferrer" class="ewu-screen-only">portal.ewubd.edu</a><span class="ewu-print-only">https://portal.ewubd.edu</span>
          </span>
          <span class="watermark-bullet">&bull;</span>
          <span class="watermark-toolkit">
            ⭐ <strong>EWU-Toolkit on GitHub:</strong> <a href="https://github.com/sowmiksudo/EWU-Toolkit" target="_blank" rel="noopener noreferrer" class="ewu-screen-only">https://github.com/sowmiksudo/EWU-Toolkit</a><span class="ewu-print-only">https://github.com/sowmiksudo/EWU-Toolkit</span>
          </span>
        </div>
      `;
      if (container.nextSibling) {
        container.parentElement.insertBefore(watermarkCitation, container.nextSibling);
      } else {
        container.parentElement.appendChild(watermarkCitation);
      }
    } else {
      if (container.nextSibling !== watermarkCitation && watermarkCitation.previousElementSibling !== container) {
        if (container.nextSibling) {
          container.parentElement.insertBefore(watermarkCitation, container.nextSibling);
        } else {
          container.parentElement.appendChild(watermarkCitation);
        }
      }
    }

    let routineCard = container.parentElement.querySelector('.ewu-routine-card');

    // Signature cache check: prevents wiping out buttons / DOM on every MutationObserver tick
    const currentSignature = courses.map(c => `${c.courseCode}_${c.section}_${c.timing}_${c.room}_${c.facultyInitial}`).join('|') + `_${semesterName}`;
    if (routineCard && routineCard.dataset.signature === currentSignature) {
      // Ensure it stays positioned directly below the watermark citation (or table container)
      const insertAfterNode = watermarkCitation || container;
      if (insertAfterNode.nextSibling !== routineCard && routineCard.previousElementSibling !== insertAfterNode) {
        if (insertAfterNode.nextSibling) {
          insertAfterNode.parentElement.insertBefore(routineCard, insertAfterNode.nextSibling);
        } else {
          insertAfterNode.parentElement.appendChild(routineCard);
        }
      }
      return;
    }

    const days = getActiveScheduleDays(courses);
    const slots = getActiveScheduleSlots(courses);
    const totalCredits = courses.reduce((sum, c) => sum + c.credits, 0);

    let slotsHeaderHtml = '<th class="ewu-routine-day-col">Day / Time</th>';
    slots.forEach(slot => {
      slotsHeaderHtml += `<th class="ewu-routine-time-col">${slot.label}</th>`;
    });

    let gridRowsHtml = '';
    days.forEach(day => {
      gridRowsHtml += `<tr><td class="ewu-routine-day-cell">${day}</td>`;
      slots.forEach(slot => {
        const matching = courses.filter(c => 
          c.slots.some(s => s.day === day && !(s.endMin <= slot.startMin || s.startMin >= slot.endMin))
        );

        if (matching.length === 0) {
          gridRowsHtml += `<td class="ewu-routine-cell empty"><span class="empty-dash">-</span></td>`;
        } else {
          let cellCards = '';
          const hasClash = matching.length > 1;
          matching.forEach(c => {
            const currentSlot = c.slots.find(s => s.day === day && !(s.endMin <= slot.startMin || s.startMin >= slot.endMin));
            const timeTag = currentSlot ? currentSlot.timeLabel : c.timing;
            cellCards += `
              <div class="ewu-routine-badge ${c.color.name}" title="${c.facultyName} (${c.facultyEmail})">
                <div class="badge-title">
                  <strong>${c.courseCode}</strong>
                  <span class="badge-sec">Sec ${c.section}</span>
                </div>
                <div class="badge-room">📍 ${c.room}</div>
                <div class="badge-meta">
                  <span class="badge-initial">${c.facultyInitial}</span>
                  <span class="badge-time">${timeTag}</span>
                </div>
              </div>
            `;
          });

          const clashBadge = hasClash ? '<div class="ewu-clash-warning">⚠️ Clash Detected!</div>' : '';
          gridRowsHtml += `<td class="ewu-routine-cell active">${clashBadge}${cellCards}</td>`;
        }
      });
      gridRowsHtml += `</tr>`;
    });

    const cardHtml = `
      <div class="ewu-print-section-divider">
        <span>2. Weekly Class Routine Timetable</span>
      </div>
      <div class="ewu-routine-header">
        <div class="routine-title-wrap">
          <div class="routine-main-title">
            <span class="calendar-icon">📅</span>
            <h2>My Weekly Class Routine</h2>
            <span class="ewu-sem-pill">${semesterName}</span>
          </div>
          <div class="routine-meta-stats">
            <span class="stat-tag"><strong>${courses.length}</strong> Courses</span>
            <span class="stat-tag"><strong>${totalCredits}</strong> Credits</span>
          </div>
        </div>
        <div class="routine-action-buttons">
          <div class="ewu-dropdown" id="ewuExportDropdown">
            <button type="button" class="ewu-dropdown-btn" id="ewuExportDropdownBtn" title="Export Routine Options">
              <span>📥 Export</span> <span class="dropdown-caret">▾</span>
            </button>
            <div class="ewu-dropdown-backdrop" id="ewuDropdownBackdrop"></div>
            <div class="ewu-dropdown-menu" id="ewuExportDropdownMenu">
              <div class="ewu-dropdown-mobile-header">
                <div class="ewu-bottom-sheet-handle"></div>
                <div class="ewu-bottom-sheet-title">Export Routine Options</div>
                <button type="button" class="ewu-bottom-sheet-close" id="ewuCloseDropdownBtn" title="Close">✕</button>
              </div>
              <button type="button" class="ewu-dropdown-item" id="ewuExportImageBtn" title="Export as High-Resolution PNG Image">
                <span class="dropdown-item-icon">🖼️</span>
                <div class="dropdown-item-text">
                  <div class="dropdown-item-title">Export as Image (.png)</div>
                  <div class="dropdown-item-desc">High-res &bull; Compact borders</div>
                </div>
              </button>
              <button type="button" class="ewu-dropdown-item" id="ewuExportExcelBtn" title="Export to Microsoft Excel (.xlsx)">
                <span class="dropdown-item-icon">📊</span>
                <div class="dropdown-item-text">
                  <div class="dropdown-item-title">Export to Excel (.xlsx)</div>
                  <div class="dropdown-item-desc">Native OpenXML spreadsheet</div>
                </div>
              </button>
              <button type="button" class="ewu-dropdown-item" id="ewuPrintRoutineBtn" title="Print advising slip & routine or save as PDF">
                <span class="dropdown-item-icon">🖨️</span>
                <div class="dropdown-item-text">
                  <div class="dropdown-item-title">Print / Save as PDF</div>
                  <div class="dropdown-item-desc">Official A4 portrait copy</div>
                </div>
              </button>
            </div>
          </div>
          <button type="button" class="ewu-routine-toggle-btn" id="ewuToggleRoutineView" title="Minimize / Expand Routine">
            ▼
          </button>
        </div>
      </div>
      <div class="ewu-routine-body" id="ewuRoutineBody">
        <div class="ewu-mobile-scroll-hint">
          <span class="hint-icon">⇄</span>
          <span>Swipe horizontally to view full routine & time slots</span>
        </div>
        <div class="table-responsive ewu-routine-table-responsive">
          <table class="table ewu-routine-grid">
            <thead>
              <tr>${slotsHeaderHtml}</tr>
            </thead>
            <tbody>
              ${gridRowsHtml}
            </tbody>
          </table>
        </div>
      </div>

    `;

    const insertAfterNode = watermarkCitation || container;
    if (!routineCard) {
      routineCard = document.createElement('div');
      routineCard.className = 'ewu-routine-card';
      routineCard.innerHTML = cardHtml;
      // Injected directly BELOW the watermark citation
      if (insertAfterNode.nextSibling) {
        insertAfterNode.parentElement.insertBefore(routineCard, insertAfterNode.nextSibling);
      } else {
        insertAfterNode.parentElement.appendChild(routineCard);
      }
    } else {
      routineCard.innerHTML = cardHtml;
      if (insertAfterNode.nextSibling !== routineCard && routineCard.previousElementSibling !== insertAfterNode) {
        if (insertAfterNode.nextSibling) {
          insertAfterNode.parentElement.insertBefore(routineCard, insertAfterNode.nextSibling);
        } else {
          insertAfterNode.parentElement.appendChild(routineCard);
        }
      }
    }

    routineCard.dataset.signature = currentSignature;

    // Delegated click handler: attached once to the card container
    if (!routineCard.dataset.delegated) {
      routineCard.dataset.delegated = 'true';
      routineCard.addEventListener('click', (e) => {
        const dropdownBtn = e.target.closest('#ewuExportDropdownBtn');
        const closeDropdownBtn = e.target.closest('#ewuCloseDropdownBtn');
        const backdrop = e.target.closest('#ewuDropdownBackdrop');
        const exportImageBtn = e.target.closest('#ewuExportImageBtn');
        const exportExcelBtn = e.target.closest('#ewuExportExcelBtn');
        const printBtn = e.target.closest('#ewuPrintRoutineBtn');
        const toggleBtn = e.target.closest('#ewuToggleRoutineView');

        const dropdown = routineCard.querySelector('#ewuExportDropdown');

        if (dropdownBtn) {
          e.preventDefault();
          e.stopPropagation();
          if (dropdown) dropdown.classList.toggle('show');
        } else if (closeDropdownBtn || backdrop) {
          e.preventDefault();
          e.stopPropagation();
          if (dropdown) dropdown.classList.remove('show');
        } else if (exportImageBtn) {
          e.preventDefault();
          e.stopPropagation();
          const orig = exportImageBtn.innerHTML;
          exportImageBtn.innerHTML = `
            <span class="dropdown-item-icon">⏳</span>
            <div class="dropdown-item-text">
              <div class="dropdown-item-title">Generating Image...</div>
              <div class="dropdown-item-desc">Rendering high-res PNG</div>
            </div>
          `;
          setTimeout(() => {
            const currentCourses = extractAdvisingCourses(table);
            exportRoutineToImage(currentCourses, semesterName);
            exportImageBtn.innerHTML = `
              <span class="dropdown-item-icon">✓</span>
              <div class="dropdown-item-text">
                <div class="dropdown-item-title">Image Downloaded!</div>
                <div class="dropdown-item-desc">Saved as PNG</div>
              </div>
            `;
            setTimeout(() => {
              exportImageBtn.innerHTML = orig;
              if (dropdown) dropdown.classList.remove('show');
            }, 1200);
          }, 60);
        } else if (exportExcelBtn) {
          e.preventDefault();
          e.stopPropagation();
          const orig = exportExcelBtn.innerHTML;
          exportExcelBtn.innerHTML = `
            <span class="dropdown-item-icon">⏳</span>
            <div class="dropdown-item-text">
              <div class="dropdown-item-title">Exporting Excel...</div>
              <div class="dropdown-item-desc">Building .xlsx workbook</div>
            </div>
          `;
          setTimeout(() => {
            const currentCourses = extractAdvisingCourses(table);
            exportRoutineToExcel(currentCourses, semesterName);
            exportExcelBtn.innerHTML = `
              <span class="dropdown-item-icon">✓</span>
              <div class="dropdown-item-text">
                <div class="dropdown-item-title">Excel Downloaded!</div>
                <div class="dropdown-item-desc">Saved as .xlsx</div>
              </div>
            `;
            setTimeout(() => {
              exportExcelBtn.innerHTML = orig;
              if (dropdown) dropdown.classList.remove('show');
            }, 1200);
          }, 60);
        } else if (printBtn) {
          e.preventDefault();
          e.stopPropagation();
          if (dropdown) dropdown.classList.remove('show');
          window.print();
        } else if (toggleBtn) {
          e.preventDefault();
          e.stopPropagation();
          const bodyElem = routineCard.querySelector('#ewuRoutineBody');
          if (bodyElem) {
            const isCollapsed = bodyElem.style.display === 'none';
            bodyElem.style.display = isCollapsed ? 'block' : 'none';
            toggleBtn.textContent = isCollapsed ? '▼' : '▲';
          }
        } else {
          if (dropdown) dropdown.classList.remove('show');
        }
      });

      // Global click-outside listener to close the dropdown
      document.addEventListener('click', (e) => {
        if (!e.target.closest('#ewuExportDropdown')) {
          const openDropdowns = document.querySelectorAll('.ewu-dropdown.show');
          openDropdowns.forEach(d => d.classList.remove('show'));
        }
      });
    }
  }

  // =========================================================================
  // FEATURE 2: Offered Courses Smart Seat Availability & Filter Bar
  // =========================================================================
  let hideFullSections = false;
  let courseSearchQuery = '';

  function processOfferedCourses(table) {
    if (!config.offeredEnabled) return;

    const headers = Array.from(table.querySelectorAll('th, tr:first-child td'));
    const isOfferedTable = headers.some(h => h.textContent && h.textContent.trim().toLowerCase() === 'capacity') ||
                           table.querySelector('tbody tr[ng-repeat*="OfferedCourse"]');

    if (!isOfferedTable) return;

    let capIdx = -1;
    headers.forEach((h, idx) => {
      if (h.textContent && h.textContent.trim().toLowerCase().includes('capacity')) {
        capIdx = idx;
      }
    });

    const container = table.closest('.table-responsive') || table.parentElement;
    let toolbar = container.parentElement.querySelector('.ewu-offered-toolbar');
    if (!toolbar) {
      toolbar = document.createElement('div');
      toolbar.className = 'ewu-offered-toolbar';
      toolbar.innerHTML = `
        <div class="ewu-toolbar-left">
          <label class="ewu-filter-label" title="Hide courses with 0 remaining seats">
            <input type="checkbox" class="ewu-filter-checkbox" id="ewuHideFull">
            <span>Show Open Sections Only</span>
          </label>
          <input type="text" class="ewu-search-input" id="ewuCourseSearch" placeholder="Filter by Course / Room / Time...">
        </div>
        <div class="ewu-toolbar-right">
          <span class="ewu-stats-pill" id="ewuStatsPill">Calculating seats...</span>
        </div>
      `;
      container.parentElement.insertBefore(toolbar, container);

      const checkbox = toolbar.querySelector('#ewuHideFull');
      checkbox.addEventListener('change', (e) => {
        hideFullSections = e.target.checked;
        applyOfferedFilter(table);
      });

      const searchInput = toolbar.querySelector('#ewuCourseSearch');
      searchInput.addEventListener('input', (e) => {
        courseSearchQuery = e.target.value.toLowerCase().trim();
        applyOfferedFilter(table);
      });
    }

    const rows = table.querySelectorAll('tbody tr');
    let totalSections = 0;
    let openSections = 0;

    rows.forEach((row) => {
      const cells = row.querySelectorAll('td');
      if (cells.length < 4) return;
      totalSections++;

      const capCell = capIdx !== -1 && cells[capIdx] ? cells[capIdx] : cells[cells.length - 1];
      const text = capCell.textContent.trim();
      const match = text.match(/(\d+)\s*\/\s*(\d+)/);

      if (match) {
        const taken = parseInt(match[1], 10);
        const capacity = parseInt(match[2], 10);
        const available = Math.max(0, capacity - taken);

        row.dataset.availableSeats = available;
        if (available > 0) openSections++;

        if (!capCell.querySelector('.ewu-seat-badge')) {
          let badgeClass = 'open';
          let badgeText = `${available} left`;

          if (available === 0) {
            badgeClass = 'full';
            badgeText = 'Full';
          } else if (available <= 5) {
            badgeClass = 'warning';
            badgeText = `${available} left`;
          }

          capCell.innerHTML = `
            <div class="ewu-seat-wrapper">
              <span>${taken}/${capacity}</span>
              <span class="ewu-seat-badge ${badgeClass}">${badgeText}</span>
            </div>
          `;
        }
      }
    });

    const statsPill = toolbar.querySelector('#ewuStatsPill');
    if (statsPill && totalSections > 0) {
      statsPill.textContent = `${openSections} open of ${totalSections} total sections`;
    }

    applyOfferedFilter(table);
  }

  function applyOfferedFilter(table) {
    const rows = table.querySelectorAll('tbody tr');
    rows.forEach((row) => {
      const available = parseInt(row.dataset.availableSeats || '999', 10);
      const rowText = row.textContent.toLowerCase();

      const matchesSearch = !courseSearchQuery || rowText.includes(courseSearchQuery);
      const matchesOpen = !hideFullSections || available > 0;

      if (matchesSearch && matchesOpen) {
        row.classList.remove('ewu-row-hidden');
      } else {
        row.classList.add('ewu-row-hidden');
      }
    });
  }



  // =========================================================================
  // FEATURE 4: Student Accounts Ledger Financial Summary & Breakdown
  // =========================================================================
  function processStudentLedger(table) {
    if (!config.ledgerEnabled) return;

    const headers = Array.from(table.querySelectorAll('th'));
    const isLedgerTable = headers.some(th => th.textContent && th.textContent.toLowerCase().includes('voucher type')) &&
                          headers.some(th => th.textContent && th.textContent.toLowerCase().includes('debit'));

    if (!isLedgerTable) return;

    // Locate column indices
    let semIdx = -1, typeIdx = -1, debitIdx = -1, creditIdx = -1;
    headers.forEach((th, idx) => {
      const t = th.textContent.trim().toLowerCase();
      if (t.includes('semester')) semIdx = idx;
      else if (t.includes('voucher type')) typeIdx = idx;
      else if (t === 'debit') debitIdx = idx;
      else if (t === 'credit') creditIdx = idx;
    });

    if (semIdx === -1 || typeIdx === -1 || debitIdx === -1 || creditIdx === -1) return;

    const rows = table.querySelectorAll('tbody tr');
    if (rows.length === 0) return;

    // Parse and aggregate transactions
    let totalBilled = 0;
    let totalPaid = 0;
    let totalWaiver = 0;
    const semesterMap = {};
    const semesterOrder = [];

    rows.forEach((row) => {
      const cells = row.querySelectorAll('td');
      if (cells.length < 5) return;

      const semester = cells[semIdx].textContent.trim();
      const vtype = cells[typeIdx].textContent.trim().toLowerCase();
      const debit = parseFloat(cells[debitIdx].textContent.replace(/[^0-9.-]/g, '')) || 0;
      const credit = parseFloat(cells[creditIdx].textContent.replace(/[^0-9.-]/g, '')) || 0;

      if (!semesterMap[semester]) {
        semesterMap[semester] = { billed: 0, paid: 0, waiver: 0 };
        semesterOrder.push(semester);
      }

      totalBilled += debit;
      semesterMap[semester].billed += debit;

      if (vtype.includes('receipt')) {
        totalPaid += credit;
        semesterMap[semester].paid += credit;
      } else if (vtype.includes('credit')) {
        totalWaiver += credit;
        semesterMap[semester].waiver += credit;
      }
    });

    const netDue = Math.max(0, totalBilled - (totalPaid + totalWaiver));

    // Inject Summary Card above table-wrapper
    const tableWrapper = table.closest('.table-wrapper') || table.closest('.table-responsive') || table.parentElement;
    let summaryCard = tableWrapper.parentElement.querySelector('.ewu-ledger-summary-card');

    let rowsHtml = '';
    semesterOrder.forEach((sem) => {
      const s = semesterMap[sem];
      const semNet = s.billed - (s.paid + s.waiver);
      let statusBadge = '';

      if (semNet <= 0) {
        statusBadge = '<span class="ewu-status-badge cleared">✓ Cleared</span>';
      } else {
        statusBadge = `<span class="ewu-status-badge due">৳ ${semNet.toLocaleString('en-IN')} Due</span>`;
      }

      rowsHtml += `
        <tr>
          <td><strong>${sem}</strong></td>
          <td>${formatMoney(s.billed)}</td>
          <td style="color: #15803d; font-weight: 600;">${formatMoney(s.paid)}</td>
          <td style="color: #6d28d9; font-weight: 600;">${formatMoney(s.waiver)}</td>
          <td>${statusBadge}</td>
        </tr>
      `;
    });

    const summaryHtml = `
      <div class="ewu-ledger-header">
        <div class="ewu-ledger-title">
          <span>📊 Accounts Ledger & Semester Breakdown</span>
          <span class="ewu-ledger-tag">Auto-Calculated</span>
        </div>
        <a href="https://github.com/sowmiksudo/EWU-Toolkit" target="_blank" class="ewu-github-gesture">
          ⭐ Open Source on GitHub ↗
        </a>
      </div>

      <!-- Bento KPI Cards -->
      <div class="ewu-kpi-grid">
        <div class="ewu-kpi-card paid">
          <span class="ewu-kpi-label">Total Paid by You</span>
          <span class="ewu-kpi-amount">${formatMoney(totalPaid)}</span>
          <span class="ewu-kpi-desc">Verified receipts deposited</span>
        </div>
        <div class="ewu-kpi-card waiver">
          <span class="ewu-kpi-label">Scholarships & Waivers</span>
          <span class="ewu-kpi-amount">${formatMoney(totalWaiver)}</span>
          <span class="ewu-kpi-desc">Credit notes & tuition discounts</span>
        </div>
        <div class="ewu-kpi-card billed">
          <span class="ewu-kpi-label">Total Tuition & Fees Billed</span>
          <span class="ewu-kpi-amount">${formatMoney(totalBilled)}</span>
          <span class="ewu-kpi-desc">Total university charges</span>
        </div>
        <div class="ewu-kpi-card due ${netDue <= 0 ? 'cleared' : ''}">
          <span class="ewu-kpi-label">Current Outstanding Due</span>
          <span class="ewu-kpi-amount">${netDue <= 0 ? '৳ 0 (Cleared)' : formatMoney(netDue)}</span>
          <span class="ewu-kpi-desc">${netDue <= 0 ? 'All semester dues are settled' : 'Payable for current semester'}</span>
        </div>
      </div>

      <!-- Semester Table -->
      <div class="table-responsive">
        <table class="table table-bordered table-striped ewu-summary-table">
          <thead>
            <tr>
              <th>Semester</th>
              <th>Billed (Charges)</th>
              <th>Paid (Receipts)</th>
              <th>Waivers / Credits</th>
              <th>Semester Status</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
          <tfoot>
            <tr style="background: #f1f5f9; font-weight: 700;">
              <td>Grand Total</td>
              <td>${formatMoney(totalBilled)}</td>
              <td style="color: #15803d;">${formatMoney(totalPaid)}</td>
              <td style="color: #6d28d9;">${formatMoney(totalWaiver)}</td>
              <td>${netDue <= 0 ? '<span class="ewu-status-badge cleared">✓ Cleared</span>' : `<span class="ewu-status-badge due">${formatMoney(netDue)} Due</span>`}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    `;

    if (!summaryCard) {
      summaryCard = document.createElement('div');
      summaryCard.className = 'ewu-ledger-summary-card';
      summaryCard.innerHTML = summaryHtml;
      tableWrapper.parentElement.insertBefore(summaryCard, tableWrapper);
    } else {
      summaryCard.innerHTML = summaryHtml;
    }
  }

  // =========================================================================
  // Master Dispatcher
  // =========================================================================
  function runEnhancements() {
    const path = window.location.pathname.toLowerCase();
    const tables = document.querySelectorAll('table');

    tables.forEach((table) => {
      // 1. Class Schedule & Advising
      if (!path.includes('facultyevaluation') && !path.includes('offeredcourses') && !path.includes('studentledger')) {
        processClassSchedule(table);
      }

      // 2. Offered Courses
      if (path.includes('offeredcourses') || table.querySelector('[ng-repeat*="OfferedCourse"]')) {
        processOfferedCourses(table);
      }

      // 3. Student Accounts Ledger
      if (path.includes('studentledger') || table.querySelector('[ng-repeat*="StudentLedgerlist"]')) {
        processStudentLedger(table);
      }
    });
  }

  runEnhancements();

  let debounceTimer = null;
  const observer = new MutationObserver(() => {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(runEnhancements, 80);
  });

  observer.observe(document.body, { childList: true, subtree: true });

  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
    chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
      if (msg.action === 'toggleFeature') {
        if (msg.feature === 'schedule') config.scheduleEnabled = msg.enabled;
        if (msg.feature === 'offered') config.offeredEnabled = msg.enabled;
        if (msg.feature === 'ledger') config.ledgerEnabled = msg.enabled;
        if (msg.feature === 'routine') config.routineEnabled = msg.enabled;
        runEnhancements();
        sendResponse({ success: true, config });
      }
    });
  }
})();

})();
