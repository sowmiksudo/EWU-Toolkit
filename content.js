(function () {
  'use strict';

  let config = {
    scheduleEnabled: true,
    offeredEnabled: true,
    evalEnabled: true,
    ledgerEnabled: true
  };

  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    chrome.storage.local.get({
      ewu_schedule_enabled: true,
      ewu_offered_enabled: true,
      ewu_eval_enabled: true,
      ewu_ledger_enabled: true
    }, (res) => {
      config.scheduleEnabled = res.ewu_schedule_enabled !== false;
      config.offeredEnabled = res.ewu_offered_enabled !== false;
      config.evalEnabled = res.ewu_eval_enabled !== false;
      config.ledgerEnabled = res.ewu_ledger_enabled !== false;
      runEnhancements();
    });

    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === 'local') {
        if (changes.ewu_schedule_enabled) config.scheduleEnabled = changes.ewu_schedule_enabled.newValue !== false;
        if (changes.ewu_offered_enabled) config.offeredEnabled = changes.ewu_offered_enabled.newValue !== false;
        if (changes.ewu_eval_enabled) config.evalEnabled = changes.ewu_eval_enabled.newValue !== false;
        if (changes.ewu_ledger_enabled) config.ledgerEnabled = changes.ewu_ledger_enabled.newValue !== false;
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
              <a class="ewu-email-link" href="mailto:${email}" title="Send email to ${email}">${email}</a>
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
    if (responsiveContainer && !responsiveContainer.previousElementSibling?.classList.contains('ewu-schedule-banner')) {
      const banner = document.createElement('div');
      banner.className = 'ewu-revealer-banner ewu-schedule-banner';
      banner.innerHTML = `
        <div class="ewu-banner-left">
          <span class="ewu-banner-pill">EWU-Toolkit</span>
          <span class="ewu-banner-text">🎓 Faculty Initial, Name & Email unhidden</span>
        </div>
        <div class="ewu-banner-right">
          <a href="https://github.com/sowmiksudo/EWU-Toolkit" target="_blank" rel="noopener noreferrer" class="ewu-github-gesture" title="EWU-Toolkit is open-source on GitHub">
            ⭐ <span>Open Source on GitHub ↗</span>
          </a>
        </div>
      `;
      responsiveContainer.parentElement.insertBefore(banner, responsiveContainer);
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
  // FEATURE 3: Faculty Evaluation Instructor Names Revealer
  // =========================================================================
  const facultyMap = {};
  let isFetchingFacultyMap = false;
  let hasFetchedFacultyMap = false;

  function loadEvaluationFacultyData(semesterId, callback) {
    if (hasFetchedFacultyMap && Object.keys(facultyMap).length > 0) {
      if (callback) callback();
      return;
    }
    if (isFetchingFacultyMap) return;
    isFetchingFacultyMap = true;

    const advisingUrl = semesterId 
      ? `/api/Advising/GetSemesterStudentWiseAdvisingCourseListStudent/${semesterId}`
      : '/api/Advising/GetSemesterStudentWiseAdvisingCourseListStudent/141';

    fetch(advisingUrl)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          data.forEach(item => {
            const code = (item.CourseCode || '').toUpperCase().trim();
            const sec = String(item.SectionName || '').trim();
            if (code && sec) {
              const key = `${code}-${sec}`;
              facultyMap[key] = {
                name: item.FacultyName || item.FacFirstName || 'Instructor',
                initial: item.ShortName || '',
                email: item.Email || ''
              };
            }
          });
        }
        hasFetchedFacultyMap = true;
        isFetchingFacultyMap = false;
        if (callback) callback();
      })
      .catch(() => {
        const evalUrl = `/api/FacultyEvaluation/GetAdvisingCourseListBySemesterStudentinfoId?SemesterId=${semesterId || 141}`;
        fetch(evalUrl)
          .then(r => r.json())
          .then(evalCourses => {
            if (Array.isArray(evalCourses)) {
              evalCourses.forEach(c => {
                const code = (c.CourseCode || '').toUpperCase().trim();
                const sec = String(c.SectionName || '').trim();
                const secId = c.SectionId;
                if (code && sec && secId) {
                  const key = `${code}-${sec}`;
                  fetch(`/api/FacultyEvaluation/GetCourseSectionInstructorSingle?SectionId=${secId}`)
                    .then(r2 => r2.json())
                    .then(instData => {
                      facultyMap[key] = {
                        name: instData.FacFirstName || instData.FacultyName || 'Instructor',
                        initial: '',
                        email: ''
                      };
                      if (callback) callback();
                    });
                }
              });
            }
          })
          .finally(() => {
            hasFetchedFacultyMap = true;
            isFetchingFacultyMap = false;
          });
      });
  }

  function processFacultyEvaluation(table) {
    if (!config.evalEnabled) return;

    const headers = Array.from(table.querySelectorAll('th'));
    const isEvalTable = headers.some(th => th.textContent && th.textContent.toLowerCase().includes('faculty evaluation status'));

    if (!isEvalTable) return;

    const semSelect = document.querySelector('select[ng-model*="SemesterId"], select');
    let currentSemesterId = semSelect ? semSelect.value : null;

    loadEvaluationFacultyData(currentSemesterId, () => {
      updateEvaluationRows(table);
    });

    if (semSelect && !semSelect.dataset.ewuBound) {
      semSelect.dataset.ewuBound = 'true';
      semSelect.addEventListener('change', () => {
        hasFetchedFacultyMap = false;
        loadEvaluationFacultyData(semSelect.value, () => {
          updateEvaluationRows(table);
        });
      });
    }

    let instructorColIdx = headers.findIndex(th => th.textContent.trim().toLowerCase() === 'instructor');
    if (instructorColIdx === -1) {
      const th = document.createElement('th');
      th.textContent = 'Instructor';
      th.className = 'ewu-instructor-header';
      const courseIdx = headers.findIndex(h => h.textContent.trim().toLowerCase().includes('course'));
      const targetHeader = courseIdx !== -1 ? headers[courseIdx] : headers[0];
      targetHeader.parentElement.insertBefore(th, targetHeader.nextSibling);
    }

    const responsiveContainer = table.closest('.table-responsive') || table.parentElement;
    if (responsiveContainer && !responsiveContainer.previousElementSibling?.classList.contains('ewu-eval-banner')) {
      const banner = document.createElement('div');
      banner.className = 'ewu-revealer-banner ewu-eval-banner';
      banner.innerHTML = `
        <div class="ewu-banner-left">
          <span class="ewu-banner-pill">EWU-Toolkit</span>
          <span class="ewu-banner-text">🎓 Faculty Evaluation: Instructor names revealed for your enrolled courses</span>
        </div>
        <div class="ewu-banner-right">
          <a href="https://github.com/sowmiksudo/EWU-Toolkit" target="_blank" rel="noopener noreferrer" class="ewu-github-gesture" title="EWU-Toolkit on GitHub">
            ⭐ <span>Open Source on GitHub ↗</span>
          </a>
        </div>
      `;
      responsiveContainer.parentElement.insertBefore(banner, responsiveContainer);
    }

    updateEvaluationRows(table);
  }

  function updateEvaluationRows(table) {
    const rows = table.querySelectorAll('tbody tr');
    rows.forEach((row) => {
      const cells = row.querySelectorAll('td');
      if (cells.length < 2) return;

      const courseText = cells[0].textContent.trim();
      const match = courseText.match(/([A-Za-z0-9]+)\s*\(\s*(\d+)\s*\)/);

      let instructorCell = row.querySelector('.ewu-instructor-cell');
      if (!instructorCell) {
        instructorCell = document.createElement('td');
        instructorCell.className = 'ewu-instructor-cell';
        cells[0].parentElement.insertBefore(instructorCell, cells[0].nextSibling);
      }

      if (match) {
        const code = match[1].toUpperCase();
        const sec = match[2];
        const key = `${code}-${sec}`;

        if (facultyMap[key]) {
          const info = facultyMap[key];
          let badgeHtml = '';
          if (info.initial) {
            badgeHtml = `<span class="ewu-initial-badge" title="${info.email || ''}">${info.initial}</span>`;
          }
          instructorCell.innerHTML = `
            <div class="ewu-instructor-container">
              <span class="ewu-instructor-name">${info.name}</span>
              ${badgeHtml}
            </div>
          `;
        } else if (!hasFetchedFacultyMap) {
          instructorCell.innerHTML = '<span class="ewu-loading-spinner">Loading instructor...</span>';
        }
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

      // 3. Faculty Evaluation
      if (path.includes('facultyevaluation') || table.querySelector('[ng-repeat*="CourseList"]')) {
        processFacultyEvaluation(table);
      }

      // 4. Student Accounts Ledger
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
        if (msg.feature === 'eval') config.evalEnabled = msg.enabled;
        if (msg.feature === 'ledger') config.ledgerEnabled = msg.enabled;
        runEnhancements();
        sendResponse({ success: true, config });
      }
    });
  }
})();
