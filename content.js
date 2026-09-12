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

    if (window.AndroidBridge && typeof window.AndroidBridge.saveBase64File === 'function') {
      try {
        let binary = '';
        const chunk = 8192;
        for (let i = 0; i < uint8Array.length; i += chunk) {
          binary += String.fromCharCode.apply(null, uint8Array.subarray(i, i + chunk));
        }
        const base64 = btoa(binary);
        window.AndroidBridge.saveBase64File(base64, filename, type);
        return;
      } catch (e) {
        console.warn('AndroidBridge file export error, falling back:', e);
      }
    }

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

    if (window.AndroidBridge && typeof window.AndroidBridge.saveBase64File === 'function') {
      try {
        const dataUrl = canvas.toDataURL('image/png');
        const base64 = dataUrl.replace(/^data:image\/png;base64,/, '');
        window.AndroidBridge.saveBase64File(base64, filename, 'image/png');
        return;
      } catch (e) {
        console.warn('AndroidBridge image export error, falling back:', e);
      }
    }

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
