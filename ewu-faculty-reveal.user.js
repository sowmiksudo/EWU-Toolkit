// ==UserScript==
// @name         EWU Portal - Reveal Faculty Info
// @namespace    https://github.com/sowmiksudo/show-faculty-info--EWU
// @version      1.0.0
// @description  Reveals hidden faculty initial, name, and email on East West University (EWU) Portal Class Schedule and Advising slip.
// @author       Sowmik
// @match        https://portal.ewubd.edu/*
// @match        http://portal.ewubd.edu/*
// @icon         https://portal.ewubd.edu/favicon.ico
// @grant        GM_setClipboard
// @run-at       document-end
// @updateURL    https://raw.githubusercontent.com/sowmiksudo/show-faculty-info--EWU/main/ewu-faculty-reveal.user.js
// @downloadURL  https://raw.githubusercontent.com/sowmiksudo/show-faculty-info--EWU/main/ewu-faculty-reveal.user.js
// ==/UserScript==

(function () {
  'use strict';

  // 1. Inject Styles
  const style = document.createElement('style');
  style.id = 'ewu-faculty-revealer-style';
  style.textContent = `
    th[ng-show*="Status"].ng-hide,
    td[ng-show*="Status"].ng-hide,
    th.ewu-revealed-col,
    td.ewu-revealed-col {
      display: table-cell !important;
    }

    .ewu-initial-badge {
      display: inline-block;
      padding: 3px 8px;
      font-size: 11px;
      font-weight: 700;
      color: #1e40af;
      background: #dbeafe;
      border: 1px solid #bfdbfe;
      border-radius: 4px;
      letter-spacing: 0.5px;
      text-transform: uppercase;
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

    .ewu-revealer-banner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: #0f172a;
      color: #f8fafc;
      border-left: 4px solid #3b82f6;
      padding: 10px 14px;
      border-radius: 6px;
      margin-bottom: 12px;
      font-size: 13px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      box-shadow: 0 2px 8px rgba(15, 23, 42, 0.12);
    }

    .ewu-banner-left {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .ewu-banner-pill {
      background: #22c55e;
      color: #ffffff;
      font-size: 10px;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 9999px;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }

    .ewu-banner-count {
      color: #60a5fa;
      font-weight: 600;
    }

    @media print {
      th[ng-show*="Status"].ng-hide,
      td[ng-show*="Status"].ng-hide,
      th.ewu-revealed-col,
      td.ewu-revealed-col {
        display: table-cell !important;
      }
      .ewu-copy-btn,
      .ewu-revealer-banner {
        display: none !important;
      }
    }
  `;
  document.head.appendChild(style);

  // 2. Clipboard helper
  function copyText(text, btn) {
    if (typeof GM_setClipboard !== 'undefined') {
      GM_setClipboard(text);
      showCopied(btn);
    } else if (navigator.clipboard && navigator.clipboard.writeText) {
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
      console.error(e);
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

  // 3. Process Table Rows
  function processTable() {
    const tables = document.querySelectorAll('table');
    tables.forEach((table) => {
      const headers = Array.from(table.querySelectorAll('th'));
      const hasFacultyHeader = headers.some(th => 
        (th.textContent && th.textContent.toLowerCase().includes('faculty')) || 
        (th.getAttribute('ng-show') && th.getAttribute('ng-show').includes('Status'))
      );

      if (!hasFacultyHeader) return;

      let initialIdx = -1;
      let nameIdx = -1;
      let emailIdx = -1;

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

      const rows = table.querySelectorAll('tbody tr:not(.ewu-processed)');
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
              copyText(email, copyBtn);
            });
          }
        }

        row.classList.add('ewu-processed');
      });

      const responsiveContainer = table.closest('.table-responsive') || table.parentElement;
      if (responsiveContainer && !responsiveContainer.previousElementSibling?.classList.contains('ewu-revealer-banner')) {
        const banner = document.createElement('div');
        banner.className = 'ewu-revealer-banner';
        banner.innerHTML = `
          <div class="ewu-banner-left">
            <span class="ewu-banner-pill">Active</span>
            <span>🎓 <strong>EWU Faculty Revealer (Userscript):</strong> Faculty details unhidden.</span>
          </div>
          <div class="ewu-banner-right">
            <span class="ewu-banner-count">Click "Copy" to copy faculty emails</span>
          </div>
        `;
        responsiveContainer.parentElement.insertBefore(banner, responsiveContainer);
      }
    });
  }

  processTable();

  let debounceTimer = null;
  const observer = new MutationObserver(() => {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(processTable, 80);
  });

  observer.observe(document.body, { childList: true, subtree: true });
})();
