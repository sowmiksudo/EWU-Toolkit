(function () {
  'use strict';

  let isEnabled = true;

  // Check initial state from storage if chrome.storage is available
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    chrome.storage.local.get({ ewu_enabled: true }, (res) => {
      isEnabled = res.ewu_enabled !== false;
      applyState();
    });

    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === 'local' && changes.ewu_enabled) {
        isEnabled = changes.ewu_enabled.newValue !== false;
        applyState();
      }
    });
  }

  function applyState() {
    if (isEnabled) {
      document.body.classList.remove('ewu-faculty-disabled');
      processTable();
    } else {
      document.body.classList.add('ewu-faculty-disabled');
    }
  }

  // Clipboard copy helper
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

  function processTable() {
    const tables = document.querySelectorAll('table');
    tables.forEach((table) => {
      const headers = Array.from(table.querySelectorAll('th'));
      const hasFacultyHeader = headers.some(th => 
        (th.textContent && th.textContent.toLowerCase().includes('faculty')) || 
        (th.getAttribute('ng-show') && th.getAttribute('ng-show').includes('Status'))
      );

      if (!hasFacultyHeader) return;

      // Identify indices of faculty columns
      let initialIdx = -1;
      let nameIdx = -1;
      let emailIdx = -1;

      headers.forEach((th, idx) => {
        const text = th.textContent.trim().toLowerCase();
        if (text.includes('faculty initial')) initialIdx = idx;
        else if (text.includes('faculty name')) nameIdx = idx;
        else if (text.includes('faculty email')) emailIdx = idx;
      });

      // Fallback: If headers could not be matched by text, detect by ng-show attributes
      if (initialIdx === -1) {
        const hiddenHeaders = headers.filter(th => th.getAttribute('ng-show') && th.getAttribute('ng-show').includes('Status'));
        if (hiddenHeaders.length >= 3) {
          initialIdx = headers.indexOf(hiddenHeaders[0]);
          nameIdx = headers.indexOf(hiddenHeaders[1]);
          emailIdx = headers.indexOf(hiddenHeaders[2]);
        }
      }

      // Mark headers as revealed
      headers.forEach(th => {
        if (th.getAttribute('ng-show') && th.getAttribute('ng-show').includes('Status')) {
          th.classList.add('ewu-revealed-col');
        }
      });

      // Process rows
      const rows = table.querySelectorAll('tbody tr:not(.ewu-processed)');
      rows.forEach((row) => {
        const cells = row.querySelectorAll('td');
        if (cells.length < 5) return;

        // Reveal any cells with ng-show Status
        cells.forEach(td => {
          if (td.getAttribute('ng-show') && td.getAttribute('ng-show').includes('Status')) {
            td.classList.add('ewu-revealed-col');
          }
        });

        // Format Faculty Initial badge
        if (initialIdx !== -1 && cells[initialIdx]) {
          const initCell = cells[initialIdx];
          const text = initCell.textContent.trim();
          if (text && !initCell.querySelector('.ewu-initial-badge')) {
            initCell.innerHTML = `<span class="ewu-initial-badge">${text}</span>`;
          }
        }

        // Format Faculty Email with link & copy button
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

        row.classList.add('ewu-processed');
      });

      // Inject friendly notification banner above table-responsive
      const responsiveContainer = table.closest('.table-responsive') || table.parentElement;
      if (responsiveContainer && !responsiveContainer.previousElementSibling?.classList.contains('ewu-revealer-banner')) {
        const banner = document.createElement('div');
        banner.className = 'ewu-revealer-banner';
        banner.innerHTML = `
          <div class="ewu-banner-left">
            <span class="ewu-banner-pill">Active</span>
            <span>🎓 <strong>EWU Faculty Revealer:</strong> Faculty Initial, Name & Email unhidden.</span>
          </div>
          <div class="ewu-banner-right">
            <span class="ewu-banner-count">Click "Copy" to copy faculty emails</span>
          </div>
        `;
        responsiveContainer.parentElement.insertBefore(banner, responsiveContainer);
      }
    });
  }

  // Initial pass
  processTable();

  // Observe DOM for Angular rendering updates (e.g. course selection, semester changes)
  let debounceTimer = null;
  const observer = new MutationObserver(() => {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      if (isEnabled) processTable();
    }, 80);
  });

  observer.observe(document.body, { childList: true, subtree: true });

  // Chrome Extension message listener
  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
    chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
      if (msg.action === 'toggle') {
        isEnabled = msg.enabled;
        applyState();
        sendResponse({ success: true, isEnabled });
      } else if (msg.action === 'getStatus') {
        sendResponse({ isEnabled });
      }
    });
  }
})();
