(function () {
  'use strict';

  try {
    document.documentElement.setAttribute('data-ewu-toolkit-installed', '1.5.1');
    window.__EWU_TOOLKIT_ACTIVE__ = true;
    console.log('[EWU-Toolkit] Content script loaded successfully v1.5.1 on ' + window.location.href);
  } catch(e) {}

  let config = {
    scheduleEnabled: true,
    offeredEnabled: false, // Default: OFF (BETA)
    ledgerEnabled: true,
    routineEnabled: true,
    captchaEnabled: true,
    routineViewMode: (window.innerWidth <= 768) ? 'agenda' : 'grid',
    darkModeEnabled: false,
    cgpaEnabled: true,
    basketEnabled: false, // Default: OFF (BETA)
    advisingFacultyEnabled: true
  };

  function applyTheme() {
    if (config.darkModeEnabled) {
      document.documentElement.classList.add('ewu-dark-mode');
      if (document.body) document.body.classList.add('ewu-dark-mode');
    } else {
      document.documentElement.classList.remove('ewu-dark-mode');
      if (document.body) document.body.classList.remove('ewu-dark-mode');
    }
  }

  function loadStoredConfig(cb) {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get({
        ewu_schedule_enabled: true,
        ewu_offered_enabled: false,
        ewu_ledger_enabled: true,
        ewu_routine_enabled: true,
        ewu_captcha_enabled: true,
        ewu_routine_view_mode: (window.innerWidth <= 768) ? 'agenda' : 'grid',
        ewu_dark_mode_enabled: false,
        ewu_cgpa_enabled: true,
        ewu_basket_enabled: false,
        ewu_advising_faculty_enabled: true
      }, (res) => {
        config.scheduleEnabled = res.ewu_schedule_enabled !== false;
        config.offeredEnabled = res.ewu_offered_enabled === true;
        config.ledgerEnabled = res.ewu_ledger_enabled !== false;
        config.routineEnabled = res.ewu_routine_enabled !== false;
        config.captchaEnabled = res.ewu_captcha_enabled !== false;
        if (res.ewu_routine_view_mode) config.routineViewMode = res.ewu_routine_view_mode;
        config.darkModeEnabled = res.ewu_dark_mode_enabled === true;
        config.cgpaEnabled = res.ewu_cgpa_enabled !== false;
        config.basketEnabled = res.ewu_basket_enabled === true;
        config.advisingFacultyEnabled = res.ewu_advising_faculty_enabled !== false;
        applyTheme();
        if (cb) cb();
      });
    } else {
      try {
        const sched = localStorage.getItem('ewu_schedule_enabled');
        const off = localStorage.getItem('ewu_offered_enabled');
        const ledg = localStorage.getItem('ewu_ledger_enabled');
        const rout = localStorage.getItem('ewu_routine_enabled');
        const cap = localStorage.getItem('ewu_captcha_enabled');
        const vmode = localStorage.getItem('ewu_routine_view_mode');
        const dark = localStorage.getItem('ewu_dark_mode_enabled');
        const cgpa = localStorage.getItem('ewu_cgpa_enabled');
        const bsk = localStorage.getItem('ewu_basket_enabled');
        const advf = localStorage.getItem('ewu_advising_faculty_enabled');

        config.scheduleEnabled = sched !== 'false';
        config.offeredEnabled = off === 'true'; // OFF by default
        config.ledgerEnabled = ledg !== 'false';
        config.routineEnabled = rout !== 'false';
        config.captchaEnabled = cap !== 'false';
        if (vmode) config.routineViewMode = vmode;
        config.darkModeEnabled = dark === 'true';
        config.cgpaEnabled = cgpa !== 'false';
        config.basketEnabled = bsk === 'true'; // OFF by default
        config.advisingFacultyEnabled = advf !== 'false';
        applyTheme();
      } catch (e) {}
      if (cb) cb();
    }
  }

  function saveStoredConfig(key, val) {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ [key]: val });
    }
    try {
      localStorage.setItem(key, String(val));
    } catch (e) {}
  }

  loadStoredConfig(() => {
    applyTheme();
    runEnhancements();
  });

  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.onChanged) {
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === 'local') {
        if (changes.ewu_schedule_enabled) config.scheduleEnabled = changes.ewu_schedule_enabled.newValue !== false;
        if (changes.ewu_offered_enabled) config.offeredEnabled = changes.ewu_offered_enabled.newValue === true;
        if (changes.ewu_ledger_enabled) config.ledgerEnabled = changes.ewu_ledger_enabled.newValue !== false;
        if (changes.ewu_routine_enabled) config.routineEnabled = changes.ewu_routine_enabled.newValue !== false;
        if (changes.ewu_captcha_enabled) config.captchaEnabled = changes.ewu_captcha_enabled.newValue !== false;
        if (changes.ewu_routine_view_mode) config.routineViewMode = changes.ewu_routine_view_mode.newValue;
        if (changes.ewu_dark_mode_enabled) config.darkModeEnabled = changes.ewu_dark_mode_enabled.newValue === true;
        if (changes.ewu_cgpa_enabled) config.cgpaEnabled = changes.ewu_cgpa_enabled.newValue !== false;
        if (changes.ewu_basket_enabled) config.basketEnabled = changes.ewu_basket_enabled.newValue === true;
        if (changes.ewu_advising_faculty_enabled) config.advisingFacultyEnabled = changes.ewu_advising_faculty_enabled.newValue !== false;
        applyTheme();
        runEnhancements();
      }
    });
  }

  function ensureMobileViewport() {
    try {
      let meta = document.querySelector('meta[name="viewport"]');
      if (!meta) {
        meta = document.createElement('meta');
        meta.name = 'viewport';
        meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes';
        document.head.appendChild(meta);
      } else if (!meta.content || !meta.content.includes('width=device-width')) {
        meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes';
      }
    } catch (e) {
      // Ignore in non-standard environments
    }
  }

  function ensureResponsiveTableWrapper(table, extraClass) {
    let existing = table.closest('.table-responsive');
    if (existing) {
      if (extraClass && !existing.classList.contains(extraClass)) {
        existing.classList.add(extraClass);
      }
      return existing;
    }
    let parent = table.parentElement;
    if (parent && parent.classList.contains('ewu-schedule-table-responsive')) {
      if (extraClass && !parent.classList.contains(extraClass)) {
        parent.classList.add(extraClass);
      }
      return parent;
    }
    const wrapper = document.createElement('div');
    wrapper.className = 'table-responsive' + (extraClass ? ' ' + extraClass : '');
    parent.insertBefore(wrapper, table);
    wrapper.appendChild(table);
    return wrapper;
  }

  let touchStartX = 0;
  let touchStartY = 0;

  function attachScrollableTouchShield(el) {
    if (!el || el.dataset.touchShieldAttached) return;
    el.dataset.touchShieldAttached = 'true';

    el.addEventListener('touchstart', (e) => {
      if (e.touches && e.touches.length === 1) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      }
    }, { passive: true });

    el.addEventListener('touchmove', (e) => {
      if (e.touches && e.touches.length === 1) {
        const dx = Math.abs(e.touches[0].clientX - touchStartX);
        const dy = Math.abs(e.touches[0].clientY - touchStartY);
        if (dx > dy && dx > 6) {
          if (window.AndroidBridge && typeof window.AndroidBridge.setSwipeRefreshEnabled === 'function') {
            window.AndroidBridge.setSwipeRefreshEnabled(false);
          }
        }
      }
    }, { passive: true });

    const resetSwipe = () => {
      if (window.AndroidBridge && typeof window.AndroidBridge.setSwipeRefreshEnabled === 'function') {
        window.AndroidBridge.setSwipeRefreshEnabled(true);
      }
    };

    el.addEventListener('touchend', resetSwipe, { passive: true });
    el.addEventListener('touchcancel', resetSwipe, { passive: true });
  }

  ensureMobileViewport();

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
  // FEATURE 0: In-Portal Sidebar Settings Navigation & Modal Overlay (v1.4.0)
  // =========================================================================
  function injectPortalSidebarSettings() {
    const sidebar = document.querySelector('.side-navbar ul, .sidebar-inverse ul, aside ul.nav, .sidebar-menu, nav ul.nav, #side-menu');
    if (sidebar && !sidebar.querySelector('.ewu-sidebar-settings-item')) {
      const li = document.createElement('li');
      li.className = 'ewu-sidebar-settings-item';
      li.innerHTML = `
        <a href="javascript:void(0)" id="ewuSidebarSettingsLink" class="ewu-sidebar-settings-link" title="Open EWU-Toolkit Extension Settings">
          <span style="font-size: 15px;">⚙️</span>
          <span class="ewu-nav-label">EWU-Toolkit</span>
          <span class="ewu-sidebar-badge">v1.5.1</span>
        </a>
      `;
      sidebar.appendChild(li);
      const link = li.querySelector('#ewuSidebarSettingsLink');
      if (link) {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          openSettingsModal();
        });
      }

      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.get(['ewu_update_available', 'ewu_latest_version'], (res) => {
          if (res && res.ewu_update_available && res.ewu_latest_version) {
            const badge = li.querySelector('.ewu-sidebar-badge');
            if (badge) {
              badge.textContent = `Update v${res.ewu_latest_version}`;
              badge.classList.add('ewu-sidebar-update-badge');
              badge.title = `Update v${res.ewu_latest_version} available on GitHub`;
            }
          }
        });
      }
    }

    if (!document.getElementById('ewuFloatingDarkBtn')) {
      const darkBtn = document.createElement('button');
      darkBtn.type = 'button';
      darkBtn.id = 'ewuFloatingDarkBtn';
      darkBtn.className = 'ewu-floating-dark-btn';
      darkBtn.title = 'Toggle Dark Mode';
      darkBtn.innerHTML = config.darkModeEnabled ? '☀️' : '🌙';
      darkBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        config.darkModeEnabled = !config.darkModeEnabled;
        darkBtn.innerHTML = config.darkModeEnabled ? '☀️' : '🌙';
        saveStoredConfig('ewu_dark_mode_enabled', config.darkModeEnabled);
        applyTheme();
        runEnhancements();
      });
      document.body.appendChild(darkBtn);
    }

    if (!document.getElementById('ewuFloatingSettingsBtn')) {
      const floatBtn = document.createElement('button');
      floatBtn.type = 'button';
      floatBtn.id = 'ewuFloatingSettingsBtn';
      floatBtn.className = 'ewu-floating-settings-btn';
      floatBtn.title = 'Open EWU-Toolkit Settings';
      floatBtn.innerHTML = `
        <span class="float-icon">⚙️</span>
        <span class="float-text">EWU-Toolkit</span>
      `;
      floatBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        openSettingsModal();
      });
      document.body.appendChild(floatBtn);
    }
  }

  function openSettingsModal() {
    let backdrop = document.getElementById('ewuSettingsModalBackdrop');
    if (backdrop) {
      backdrop.remove();
    }

    backdrop = document.createElement('div');
    backdrop.id = 'ewuSettingsModalBackdrop';
    backdrop.className = 'ewu-settings-modal-backdrop';
    backdrop.innerHTML = `
      <div class="ewu-settings-modal-card" role="dialog" aria-modal="true" aria-labelledby="ewuModalTitle">
        <div class="ewu-settings-modal-header">
          <div class="ewu-settings-brand">
            <span class="ewu-settings-brand-icon">🎓</span>
            <div class="ewu-settings-title-group">
              <h2 id="ewuModalTitle">EWU-Toolkit Settings</h2>
              <p>Student Utility Suite &bull; <span class="version-badge">v1.5.1</span></p>
            </div>
          </div>
          <button type="button" class="ewu-settings-close-btn" id="ewuModalCloseBtn" title="Close Settings">✕</button>
        </div>

        <div class="ewu-settings-modal-body">
          <div id="ewuUpdateAlertContainer"></div>
          <div class="ewu-settings-section-title">Active Features</div>

          <!-- Feature 1 -->
          <div class="ewu-settings-toggle-row">
            <div class="ewu-settings-toggle-info">
              <div class="ewu-settings-toggle-name">🎓 Schedule Faculty Info</div>
              <div class="ewu-settings-toggle-desc">Unhide Initial, Name & Email on Class Schedule & Advising Slip</div>
            </div>
            <label class="ewu-switch">
              <input type="checkbox" id="ewuModalToggleSchedule" ${config.scheduleEnabled ? 'checked' : ''}>
              <span class="ewu-slider"></span>
            </label>
          </div>

          <!-- Feature 2 -->
          <div class="ewu-settings-toggle-row">
            <div class="ewu-settings-toggle-info">
              <div class="ewu-settings-toggle-name">📅 Visual Routine & Mobile Agenda</div>
              <div class="ewu-settings-toggle-desc">Weekly Class Timetable, Day Agenda, Excel, Image & Google Calendar Export</div>
            </div>
            <label class="ewu-switch">
              <input type="checkbox" id="ewuModalToggleRoutine" ${config.routineEnabled ? 'checked' : ''}>
              <span class="ewu-slider"></span>
            </label>
          </div>

          <!-- Feature 3 -->
          <div class="ewu-settings-toggle-row">
            <div class="ewu-settings-toggle-info">
              <div class="ewu-settings-toggle-name">
                💺 Smart Seat Badges & Filters
                <span class="ewu-beta-tag">BETA</span>
              </div>
              <div class="ewu-settings-toggle-desc">Offered Courses Open Seats Counter, Day & Time Filter Chips & Spotlight (Experimental)</div>
            </div>
            <label class="ewu-switch">
              <input type="checkbox" id="ewuModalToggleOffered" ${config.offeredEnabled ? 'checked' : ''}>
              <span class="ewu-slider"></span>
            </label>
          </div>

          <!-- Feature 4: Course Basket & Sandbox -->
          <div class="ewu-settings-toggle-row">
            <div class="ewu-settings-toggle-info">
              <div class="ewu-settings-toggle-name">
                🛒 Advising Basket & Sandbox
                <span class="ewu-beta-tag">BETA</span>
              </div>
              <div class="ewu-settings-toggle-desc">Draft Offered Courses & Detect Real-Time Schedule Clashes (Plan A vs Plan B) (Experimental)</div>
            </div>
            <label class="ewu-switch">
              <input type="checkbox" id="ewuModalToggleBasket" ${config.basketEnabled ? 'checked' : ''}>
              <span class="ewu-slider"></span>
            </label>
          </div>

          <!-- Feature 5: What-If CGPA & Target Planner -->
          <div class="ewu-settings-toggle-row">
            <div class="ewu-settings-toggle-info">
              <div class="ewu-settings-toggle-name">🧮 "What-If" CGPA & Target Planner</div>
              <div class="ewu-settings-toggle-desc">Simulate Retake Grade Boosts & Calculate Required GPA on Degree Review</div>
            </div>
            <label class="ewu-switch">
              <input type="checkbox" id="ewuModalToggleCgpa" ${config.cgpaEnabled ? 'checked' : ''}>
              <span class="ewu-slider"></span>
            </label>
          </div>

          <!-- Feature 6: Advising Window Faculty Revealer -->
          <div class="ewu-settings-toggle-row">
            <div class="ewu-settings-toggle-info">
              <div class="ewu-settings-toggle-name">👨‍🏫 Advising Window Faculty Revealer</div>
              <div class="ewu-settings-toggle-desc">Show Teacher Initials During Live Advising & Routine Flowchart Selection</div>
            </div>
            <label class="ewu-switch">
              <input type="checkbox" id="ewuModalToggleAdvisingFaculty" ${config.advisingFacultyEnabled ? 'checked' : ''}>
              <span class="ewu-slider"></span>
            </label>
          </div>

          <!-- Feature 7: Dark Mode -->
          <div class="ewu-settings-toggle-row">
            <div class="ewu-settings-toggle-info">
              <div class="ewu-settings-toggle-name">🌙 Dark Mode Theme</div>
              <div class="ewu-settings-toggle-desc">Sleek eye-friendly dark palette across the EWU Student Portal</div>
            </div>
            <label class="ewu-switch">
              <input type="checkbox" id="ewuModalToggleDark" ${config.darkModeEnabled ? 'checked' : ''}>
              <span class="ewu-slider"></span>
            </label>
          </div>

          <!-- Feature 8: Ledger -->
          <div class="ewu-settings-toggle-row">
            <div class="ewu-settings-toggle-info">
              <div class="ewu-settings-toggle-name">💰 Accounts Ledger Breakdown</div>
              <div class="ewu-settings-toggle-desc">Financial calculation card with total dues and advance credit balances</div>
            </div>
            <label class="ewu-switch">
              <input type="checkbox" id="ewuModalToggleLedger" ${config.ledgerEnabled ? 'checked' : ''}>
              <span class="ewu-slider"></span>
            </label>
          </div>

          <!-- Feature 9: Captcha -->
          <div class="ewu-settings-toggle-row">
            <div class="ewu-settings-toggle-info">
              <div class="ewu-settings-toggle-name">🔢 Login Math Captcha Solver</div>
              <div class="ewu-settings-toggle-desc">Auto-fills the simple addition challenge on portal login screen</div>
            </div>
            <label class="ewu-switch">
              <input type="checkbox" id="ewuModalToggleCaptcha" ${config.captchaEnabled ? 'checked' : ''}>
              <span class="ewu-slider"></span>
            </label>
          </div>

          <div class="ewu-settings-section-title">Resources & Links</div>
          <div class="ewu-settings-links-grid">
            <a href="https://github.com/sowmiksudo/EWU-Toolkit" target="_blank" rel="noopener noreferrer" class="ewu-settings-link-btn primary">
              ⭐ Star on GitHub
            </a>
            <a href="https://ewu-faculty-explorer.azurewebsites.net/" target="_blank" rel="noopener noreferrer" class="ewu-settings-link-btn secondary">
              🌐 Faculty Explorer
            </a>
          </div>

          <div class="ewu-update-check-row" id="ewuUpdateCheckRow">
            <button type="button" class="ewu-update-check-btn" id="ewuCheckUpdatesBtn">
              🔄 Check for Updates
            </button>
            <span class="ewu-update-status-text" id="ewuUpdateStatusText"></span>
          </div>

          <div style="margin-top: 14px; padding: 12px 14px; background: #f8fafc; border-radius: 8px; font-size: 11px; color: #64748b; line-height: 1.4; border: 1px solid #e2e8f0;">
            <strong>Open-Source MIT License:</strong> Free for East West University students. Client-side processing only; institutional credentials and private backend data are never accessed by third parties.
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(backdrop);

    const closeBtn = backdrop.querySelector('#ewuModalCloseBtn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => backdrop.remove());
    }
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) backdrop.remove();
    });

    const escListener = (e) => {
      if (e.key === 'Escape') {
        backdrop.remove();
        document.removeEventListener('keydown', escListener);
      }
    };
    document.addEventListener('keydown', escListener);

    function bindToggle(id, configKey, storageKey, onToggle) {
      const input = backdrop.querySelector(id);
      if (!input) return;
      input.addEventListener('change', () => {
        config[configKey] = input.checked;
        saveStoredConfig(storageKey, input.checked);
        if (onToggle) onToggle(input.checked);
        runEnhancements();
      });
    }

    bindToggle('#ewuModalToggleSchedule', 'scheduleEnabled', 'ewu_schedule_enabled');
    bindToggle('#ewuModalToggleRoutine', 'routineEnabled', 'ewu_routine_enabled');
    bindToggle('#ewuModalToggleOffered', 'offeredEnabled', 'ewu_offered_enabled');
    bindToggle('#ewuModalToggleBasket', 'basketEnabled', 'ewu_basket_enabled');
    bindToggle('#ewuModalToggleCgpa', 'cgpaEnabled', 'ewu_cgpa_enabled');
    bindToggle('#ewuModalToggleAdvisingFaculty', 'advisingFacultyEnabled', 'ewu_advising_faculty_enabled');
    bindToggle('#ewuModalToggleDark', 'darkModeEnabled', 'ewu_dark_mode_enabled', () => {
      applyTheme();
      const floatDark = document.getElementById('ewuFloatingDarkBtn');
      if (floatDark) floatDark.innerHTML = config.darkModeEnabled ? '☀️' : '🌙';
    });
    bindToggle('#ewuModalToggleLedger', 'ledgerEnabled', 'ewu_ledger_enabled');
    bindToggle('#ewuModalToggleCaptcha', 'captchaEnabled', 'ewu_captcha_enabled');

    // Extension update checking within modal
    const checkBtn = backdrop.querySelector('#ewuCheckUpdatesBtn');
    const statusText = backdrop.querySelector('#ewuUpdateStatusText');
    const updateContainer = backdrop.querySelector('#ewuUpdateAlertContainer');

    function renderUpdateAlert(info) {
      if (!updateContainer || !info || !info.updateAvailable) return;
      updateContainer.innerHTML = `
        <div class="ewu-update-alert-card">
          <div class="ewu-update-alert-icon">⚡</div>
          <div class="ewu-update-alert-info">
            <div class="ewu-update-alert-title">Update Available: v${info.latestVersion}</div>
            <div class="ewu-update-alert-desc">A newer version of EWU-Toolkit is available on GitHub.</div>
          </div>
          <a href="${info.releaseUrl || 'https://github.com/sowmiksudo/EWU-Toolkit/releases'}" target="_blank" rel="noopener noreferrer" class="ewu-update-alert-btn">
            Download ▾
          </a>
        </div>
      `;
    }

    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(['ewu_update_available', 'ewu_latest_version', 'ewu_release_url'], (data) => {
        if (data && data.ewu_update_available) {
          renderUpdateAlert({
            updateAvailable: true,
            latestVersion: data.ewu_latest_version,
            releaseUrl: data.ewu_release_url
          });
        }
      });

      if (checkBtn) {
        checkBtn.addEventListener('click', () => {
          checkBtn.disabled = true;
          if (statusText) statusText.textContent = 'Checking GitHub...';
          try {
            chrome.runtime.sendMessage({ action: 'check_for_updates', force: true }, (res) => {
              checkBtn.disabled = false;
              if (chrome.runtime.lastError || !res || res.error) {
                if (statusText) statusText.textContent = 'Could not reach GitHub.';
                return;
              }
              if (res.updateAvailable) {
                if (statusText) statusText.textContent = `New version v${res.latestVersion} available!`;
                renderUpdateAlert(res);
                const sidebarBadge = document.querySelector('.ewu-sidebar-settings-link .ewu-sidebar-badge');
                if (sidebarBadge) {
                  sidebarBadge.textContent = `Update v${res.latestVersion}`;
                  sidebarBadge.classList.add('ewu-sidebar-update-badge');
                }
              } else {
                if (statusText) statusText.textContent = `✓ Up to date (v${res.currentVersion || '1.5.1'})`;
              }
            });
          } catch (err) {
            checkBtn.disabled = false;
            if (statusText) statusText.textContent = 'Error checking updates.';
          }
        });
      }
    } else {
      const updateRow = backdrop.querySelector('#ewuUpdateCheckRow');
      if (updateRow) updateRow.style.display = 'none';
    }
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
      attachScrollableTouchShield(responsiveContainer);
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

  // -------------------------------------------------------------------------
  // iCalendar (.ics) and Google Calendar Sync Utilities
  // -------------------------------------------------------------------------
  function exportRoutineToIcs(courses, semesterName) {
    if (!courses || courses.length === 0) return;
    const cleanSem = (semesterName || 'Semester').replace(/[^a-zA-Z0-9_\-]/g, '_');
    const now = new Date();
    const currentYear = now.getFullYear();

    let startMonth = 9; // Fall (Oct)
    let endMonth = 0;   // Jan next year
    let endYear = currentYear + 1;

    const lowerSem = (semesterName || '').toLowerCase();
    if (lowerSem.includes('spring')) {
      startMonth = 0; // Spring (Jan/Feb)
      endMonth = 4;   // May
      endYear = currentYear;
    } else if (lowerSem.includes('summer')) {
      startMonth = 4; // Summer (May/Jun)
      endMonth = 8;   // Sep
      endYear = currentYear;
    }

    const untilDateStr = `${endYear}${String(endMonth + 1).padStart(2, '0')}31T235959Z`;

    const dayOffsets = {
      'Sunday': 0,
      'Monday': 1,
      'Tuesday': 2,
      'Wednesday': 3,
      'Thursday': 4,
      'Friday': 5,
      'Saturday': 6
    };

    let icsLines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//EWU-Toolkit//Class Routine Exporter//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      `X-WR-CALNAME:EWU Routine - ${cleanSem}`,
      'X-WR-TIMEZONE:Asia/Dhaka'
    ];

    courses.forEach(c => {
      c.slots.forEach(slot => {
        const targetDayNum = dayOffsets[slot.day] !== undefined ? dayOffsets[slot.day] : 0;
        const eventDate = new Date(now);
        const currentDayNum = eventDate.getDay();
        let diff = targetDayNum - currentDayNum;
        if (diff < 0) diff += 7;
        eventDate.setDate(eventDate.getDate() + diff);

        const startH = Math.floor(slot.startMin / 60);
        const startM = slot.startMin % 60;
        const endH = Math.floor(slot.endMin / 60);
        const endM = slot.endMin % 60;

        const y = eventDate.getFullYear();
        const m = String(eventDate.getMonth() + 1).padStart(2, '0');
        const d = String(eventDate.getDate()).padStart(2, '0');

        const dtStartStr = `${y}${m}${d}T${String(startH).padStart(2, '0')}${String(startM).padStart(2, '0')}00`;
        const dtEndStr = `${y}${m}${d}T${String(endH).padStart(2, '0')}${String(endM).padStart(2, '0')}00`;
        const uid = `${c.courseCode}_Sec${c.section}_${slot.day}_${startH}${startM}@ewu-toolkit`;

        icsLines.push('BEGIN:VEVENT');
        icsLines.push(`UID:${uid}`);
        icsLines.push(`SUMMARY:${c.courseCode} (Sec ${c.section}) - ${c.facultyInitial || 'TBA'}`);
        icsLines.push(`LOCATION:Room ${c.room || 'TBA'}, East West University`);
        icsLines.push(`DESCRIPTION:Course: ${c.courseCode}\\nSection: ${c.section}\\nRoom: ${c.room}\\nFaculty: ${c.facultyName} (${c.facultyInitial})\\nEmail: ${c.facultyEmail}`);
        icsLines.push(`DTSTART;TZID=Asia/Dhaka:${dtStartStr}`);
        icsLines.push(`DTEND;TZID=Asia/Dhaka:${dtEndStr}`);
        icsLines.push(`RRULE:FREQ=WEEKLY;UNTIL=${untilDateStr}`);
        icsLines.push('BEGIN:VALARM');
        icsLines.push('TRIGGER:-PT15M');
        icsLines.push('ACTION:DISPLAY');
        icsLines.push(`DESCRIPTION:Class in 15 mins: ${c.courseCode} [Room ${c.room}]`);
        icsLines.push('END:VALARM');
        icsLines.push('END:VEVENT');
      });
    });

    icsLines.push('END:VCALENDAR');
    const icsContent = icsLines.join('\r\n');
    const encoder = new TextEncoder();
    downloadBinaryFile(encoder.encode(icsContent), `EWU_Routine_${cleanSem}.ics`, 'text/calendar');
  }

  function openGoogleCalendarSyncFlow(courses, semesterName) {
    if (!courses || courses.length === 0) return;
    const payload = {
      semester: semesterName || 'Current Semester',
      courses: courses.map(c => ({
        courseCode: c.courseCode,
        section: c.section,
        room: c.room,
        facultyInitial: c.facultyInitial,
        facultyName: c.facultyName,
        facultyEmail: c.facultyEmail,
        slots: c.slots
      }))
    };

    const jsonStr = encodeURIComponent(JSON.stringify(payload));
    const targetUrl = `https://ewu-faculty-explorer.azurewebsites.net/api/calendar/sync-flow?data=${jsonStr}`;

    const popupW = 560;
    const popupH = 680;
    const left = Math.round((window.screen.width - popupW) / 2);
    const top = Math.round((window.screen.height - popupH) / 2);

    const win = window.open(
      targetUrl,
      'EWUCalendarSync',
      `width=${popupW},height=${popupH},top=${top},left=${left},status=no,toolbar=no,menubar=no`
    );

    if (!win) {
      window.open(targetUrl, '_blank');
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

    // Inter-table watermark citation
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

    const currentSignature = courses.map(c => `${c.courseCode}_${c.section}_${c.timing}_${c.room}_${c.facultyInitial}`).join('|') + `_${semesterName}`;
    if (routineCard && routineCard.dataset.signature === currentSignature) {
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

    const isAgenda = config.routineViewMode === 'agenda';

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
            <div class="ewu-view-mode-switcher">
              <button type="button" class="ewu-view-btn ${!isAgenda ? 'active' : ''}" id="ewuViewModeGrid" title="Full Grid Timetable">
                📅 Grid
              </button>
              <button type="button" class="ewu-view-btn ${isAgenda ? 'active' : ''}" id="ewuViewModeAgenda" title="Mobile Day Agenda">
                📋 Day Agenda
              </button>
            </div>
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
              <button type="button" class="ewu-dropdown-item" id="ewuExportCalendarBtn" title="Sync classes directly to Google Calendar">
                <span class="dropdown-item-icon">📅</span>
                <div class="dropdown-item-text">
                  <div class="dropdown-item-title">Add to Google Calendar</div>
                  <div class="dropdown-item-desc">OAuth 1-click batch sync</div>
                </div>
              </button>
              <button type="button" class="ewu-dropdown-item" id="ewuExportIcsBtn" title="Download universal .ics calendar file">
                <span class="dropdown-item-icon">📆</span>
                <div class="dropdown-item-text">
                  <div class="dropdown-item-title">Export Calendar (.ics)</div>
                  <div class="dropdown-item-desc">Universal file for phone & PC</div>
                </div>
              </button>
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
        <div class="ewu-routine-grid-container" id="ewuRoutineGridContainer" style="${isAgenda ? 'display: none;' : ''}">
          <div class="ewu-mobile-scroll-hint">
            <span class="hint-icon">⇄</span>
            <span>Swipe horizontally to view full routine matrix</span>
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

        <div class="ewu-routine-agenda-container" id="ewuRoutineAgendaContainer" style="${!isAgenda ? 'display: none;' : ''}">
          <div class="ewu-agenda-tabs-strip" id="ewuAgendaTabsStrip">
            ${days.map(d => {
              const count = courses.filter(c => c.slots.some(s => s.day === d)).length;
              return `
                <button type="button" class="ewu-agenda-day-pill" data-day="${d}">
                  <span>${d.slice(0, 3)}</span>
                  <span class="day-count-badge">${count}</span>
                </button>
              `;
            }).join('')}
          </div>
          <div class="ewu-agenda-cards-list" id="ewuAgendaCardsList"></div>
        </div>
      </div>
    `;

    const insertAfterNode = watermarkCitation || container;
    if (!routineCard) {
      routineCard = document.createElement('div');
      routineCard.className = 'ewu-routine-card';
      routineCard.innerHTML = cardHtml;
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

    function renderAgendaDayCards(selectedDay) {
      const listContainer = routineCard.querySelector('#ewuAgendaCardsList');
      if (!listContainer) return;

      const dayPills = routineCard.querySelectorAll('.ewu-agenda-day-pill');
      dayPills.forEach(pill => {
        if (pill.dataset.day === selectedDay) pill.classList.add('active');
        else pill.classList.remove('active');
      });

      const dayEvents = [];
      courses.forEach(c => {
        c.slots.filter(s => s.day === selectedDay).forEach(s => {
          dayEvents.push({ course: c, slot: s });
        });
      });

      dayEvents.sort((a, b) => a.slot.startMin - b.slot.startMin);

      if (dayEvents.length === 0) {
        listContainer.innerHTML = `
          <div class="ewu-agenda-empty-day">
            <span class="ewu-agenda-empty-icon">☕</span>
            <div style="font-weight: 700; color: #334155;">No classes scheduled on ${selectedDay}</div>
            <div style="font-size: 11px; margin-top: 4px;">Enjoy your study time or campus break!</div>
          </div>
        `;
        return;
      }

      let cardsHtml = '';
      dayEvents.forEach(item => {
        const c = item.course;
        const s = item.slot;
        const dur = s.endMin - s.startMin;
        const timeStr = s.timeLabel || `${format12h(s.startStr)} - ${format12h(s.endStr)}`;

        cardsHtml += `
          <div class="ewu-agenda-card">
            <div class="ewu-agenda-time-col">
              <span class="ewu-agenda-time-start">${timeStr}</span>
              <span class="ewu-agenda-time-duration">${dur} mins</span>
            </div>
            <div class="ewu-agenda-card-body" style="border-left-color: ${c.color.border};">
              <div class="ewu-agenda-course-row">
                <div class="ewu-agenda-course-title">
                  <strong>${c.courseCode}</strong>
                  <span class="ewu-agenda-sec-badge">Sec ${c.section}</span>
                </div>
                <span class="ewu-agenda-room-badge">📍 Room ${c.room || 'TBA'}</span>
              </div>
              <div class="ewu-agenda-faculty-row">
                <div class="ewu-agenda-faculty-info">
                  <span class="ewu-agenda-initial-badge">${c.facultyInitial || 'TBA'}</span>
                  <span>${c.facultyName || 'Faculty TBA'}</span>
                </div>
                ${c.facultyEmail ? `
                  <div class="ewu-agenda-email-actions">
                    <a href="mailto:${c.facultyEmail}" class="ewu-email-link" title="Email ${c.facultyEmail}">${c.facultyEmail}</a>
                    <button type="button" class="ewu-copy-btn ewu-screen-only" data-email="${c.facultyEmail}" title="Copy email">📋 Copy</button>
                  </div>
                ` : ''}
              </div>
            </div>
          </div>
        `;
      });

      listContainer.innerHTML = cardsHtml;

      listContainer.querySelectorAll('.ewu-copy-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          const email = btn.dataset.email;
          if (email) copyToClipboard(email, btn);
        });
      });
    }

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const todayName = dayNames[new Date().getDay()];
    const defaultDay = days.includes(todayName) ? todayName : days[0];
    renderAgendaDayCards(defaultDay);

    // Delegated click handler
    if (!routineCard.dataset.delegated) {
      routineCard.dataset.delegated = 'true';
      routineCard.addEventListener('click', (e) => {
        const dropdownBtn = e.target.closest('#ewuExportDropdownBtn');
        const closeDropdownBtn = e.target.closest('#ewuCloseDropdownBtn');
        const backdrop = e.target.closest('#ewuDropdownBackdrop');
        const exportImageBtn = e.target.closest('#ewuExportImageBtn');
        const exportExcelBtn = e.target.closest('#ewuExportExcelBtn');
        const exportCalendarBtn = e.target.closest('#ewuExportCalendarBtn');
        const exportIcsBtn = e.target.closest('#ewuExportIcsBtn');
        const printBtn = e.target.closest('#ewuPrintRoutineBtn');
        const toggleBtn = e.target.closest('#ewuToggleRoutineView');
        const viewModeGridBtn = e.target.closest('#ewuViewModeGrid');
        const viewModeAgendaBtn = e.target.closest('#ewuViewModeAgenda');
        const dayPillBtn = e.target.closest('.ewu-agenda-day-pill');

        const dropdown = routineCard.querySelector('#ewuExportDropdown');

        if (dropdownBtn) {
          e.preventDefault();
          e.stopPropagation();
          if (dropdown) dropdown.classList.toggle('show');
        } else if (closeDropdownBtn || backdrop) {
          e.preventDefault();
          e.stopPropagation();
          if (dropdown) dropdown.classList.remove('show');
        } else if (viewModeGridBtn) {
          e.preventDefault();
          config.routineViewMode = 'grid';
          saveStoredConfig('ewu_routine_view_mode', 'grid');
          routineCard.querySelector('#ewuViewModeGrid').classList.add('active');
          routineCard.querySelector('#ewuViewModeAgenda').classList.remove('active');
          routineCard.querySelector('#ewuRoutineGridContainer').style.display = 'block';
          routineCard.querySelector('#ewuRoutineAgendaContainer').style.display = 'none';
        } else if (viewModeAgendaBtn) {
          e.preventDefault();
          config.routineViewMode = 'agenda';
          saveStoredConfig('ewu_routine_view_mode', 'agenda');
          routineCard.querySelector('#ewuViewModeGrid').classList.remove('active');
          routineCard.querySelector('#ewuViewModeAgenda').classList.add('active');
          routineCard.querySelector('#ewuRoutineGridContainer').style.display = 'none';
          routineCard.querySelector('#ewuRoutineAgendaContainer').style.display = 'block';
          const activePill = routineCard.querySelector('.ewu-agenda-day-pill.active');
          const selDay = activePill ? activePill.dataset.day : defaultDay;
          renderAgendaDayCards(selDay);
        } else if (dayPillBtn) {
          e.preventDefault();
          renderAgendaDayCards(dayPillBtn.dataset.day);
        } else if (exportCalendarBtn) {
          e.preventDefault();
          e.stopPropagation();
          if (dropdown) dropdown.classList.remove('show');
          const currentCourses = extractAdvisingCourses(table);
          openGoogleCalendarSyncFlow(currentCourses, semesterName);
        } else if (exportIcsBtn) {
          e.preventDefault();
          e.stopPropagation();
          if (dropdown) dropdown.classList.remove('show');
          const currentCourses = extractAdvisingCourses(table);
          exportRoutineToIcs(currentCourses, semesterName);
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

      document.addEventListener('click', (e) => {
        if (!e.target.closest('#ewuExportDropdown')) {
          const openDropdowns = document.querySelectorAll('.ewu-dropdown.show');
          openDropdowns.forEach(d => d.classList.remove('show'));
        }
      });
    }
  }

  // =========================================================================
  // FEATURE 2: Offered Courses Smart Seat Availability, Filter Chips & Basket
  // =========================================================================
  let hideFullSections = false;
  let courseSearchQuery = '';
  let activeDayFilter = 'ALL';
  let activeTimeFilter = 'ALL';
  let basketActivePreset = 'A'; // 'A' or 'B'
  let basketPlans = { 'A': [], 'B': [] };

  function loadBasketPlans() {
    try {
      const saved = localStorage.getItem('ewu_basket_plans');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Backward compatibility: If previously stored as a raw array, migrate to Plan A
          basketPlans = { 'A': parsed, 'B': [] };
        } else if (parsed && typeof parsed === 'object') {
          basketPlans = {
            'A': Array.isArray(parsed.A) ? parsed.A : [],
            'B': Array.isArray(parsed.B) ? parsed.B : []
          };
        }
      }
      const savedPreset = localStorage.getItem('ewu_basket_preset');
      if (savedPreset === 'A' || savedPreset === 'B') {
        basketActivePreset = savedPreset;
      }
    } catch(e) {
      basketPlans = { 'A': [], 'B': [] };
    }
    if (!Array.isArray(basketPlans.A)) basketPlans.A = [];
    if (!Array.isArray(basketPlans.B)) basketPlans.B = [];
  }
  loadBasketPlans();

  function saveBasketPlans() {
    try {
      localStorage.setItem('ewu_basket_plans', JSON.stringify(basketPlans));
      localStorage.setItem('ewu_basket_preset', basketActivePreset);
    } catch(e) {}
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ ewu_basket_plans: basketPlans, ewu_basket_preset: basketActivePreset });
    }
  }

  function parseDayCodes(timeStr) {
    const days = new Set();
    const upper = (timeStr || '').toUpperCase();
    if (upper.includes('ST')) { days.add('Sun'); days.add('Tue'); }
    if (upper.includes('MW')) { days.add('Mon'); days.add('Wed'); }
    if (upper.includes('SR')) { days.add('Sun'); days.add('Thu'); }
    if (upper.includes('TR')) { days.add('Tue'); days.add('Thu'); }
    if (upper.includes('RA')) { days.add('Thu'); days.add('Sat'); }
    if (upper.includes('FRIDAY') || /\bF\b/.test(upper)) { days.add('Fri'); }
    if (days.size === 0) {
      if (upper.includes('SUN')) days.add('Sun');
      if (upper.includes('MON')) days.add('Mon');
      if (upper.includes('TUE')) days.add('Tue');
      if (upper.includes('WED')) days.add('Wed');
      if (upper.includes('THU')) days.add('Thu');
      if (upper.includes('FRI')) days.add('Fri');
      if (upper.includes('SAT')) days.add('Sat');
    }
    return Array.from(days);
  }

  function parseTimeRangeMinutes(timeStr) {
    const match = (timeStr || '').match(/(\d{1,2}):(\d{2})\s*(AM|PM)?\s*[-–]\s*(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
    if (!match) return null;
    let [_, h1, m1, p1, h2, m2, p2] = match;
    let startH = parseInt(h1, 10);
    let startM = parseInt(m1, 10);
    let endH = parseInt(h2, 10);
    let endM = parseInt(m2, 10);

    p2 = (p2 || '').toUpperCase();
    p1 = (p1 || '').toUpperCase() || p2;
    if (!p2 && p1) p2 = p1;
    if (!p1 && !p2) {
      p1 = (startH >= 8 && startH < 12) ? 'AM' : 'PM';
      p2 = (endH >= 8 && endH < 12 && endH > startH) ? 'AM' : 'PM';
    }

    if (p1 === 'PM' && startH < 12) startH += 12;
    if (p1 === 'AM' && startH === 12) startH = 0;
    if (p2 === 'PM' && endH < 12) endH += 12;
    if (p2 === 'AM' && endH === 12) endH = 0;

    return {
      start: startH * 60 + startM,
      end: endH * 60 + endM
    };
  }

  function detectScheduleClashes(courses) {
    const clashes = [];
    for (let i = 0; i < courses.length; i++) {
      for (let j = i + 1; j < courses.length; j++) {
        const c1 = courses[i];
        const c2 = courses[j];
        const days1 = parseDayCodes(c1.time);
        const days2 = parseDayCodes(c2.time);
        const commonDays = days1.filter(d => days2.includes(d));
        if (commonDays.length > 0) {
          const t1 = parseTimeRangeMinutes(c1.time);
          const t2 = parseTimeRangeMinutes(c2.time);
          if (t1 && t2) {
            if (t1.start < t2.end && t2.start < t1.end) {
              clashes.push({
                course1: c1,
                course2: c2,
                commonDays: commonDays.join(', '),
                time1: c1.time,
                time2: c2.time
              });
            }
          }
        }
      }
    }
    return clashes;
  }

  function rowMatchesDay(text, day) {
    if (day === 'ALL') return true;
    const upper = text.toUpperCase();
    if (day === 'ST') return upper.includes('ST') || (upper.includes('SUN') && upper.includes('TUE'));
    if (day === 'MW') return upper.includes('MW') || (upper.includes('MON') && upper.includes('WED'));
    if (day === 'SR') return upper.includes('SR') || (upper.includes('SUN') && upper.includes('THU'));
    if (day === 'TR') return upper.includes('TR') || (upper.includes('TUE') && upper.includes('THU'));
    if (day === 'RA') return upper.includes('RA') || (upper.includes('THU') && upper.includes('SAT'));
    if (day === 'F') return upper.includes('FRIDAY') || /\bF\b/.test(upper);
    return true;
  }

  function rowMatchesTime(text, slot) {
    if (slot === 'ALL') return true;
    const upper = text.toUpperCase();
    if (slot === '08:30') return upper.includes('08:30') || upper.includes('8:30');
    if (slot === '10:10') return upper.includes('10:10');
    if (slot === '11:50') return upper.includes('11:50');
    if (slot === '01:30') return upper.includes('01:30') || upper.includes('1:30');
    if (slot === '03:10') return upper.includes('03:10') || upper.includes('3:10') || upper.includes('04:50') || upper.includes('4:50') || upper.includes('6:20');
    return true;
  }

  function processOfferedCourses(table) {
    const headers = Array.from(table.querySelectorAll('th, tr:first-child td'));
    const isOfferedTable = headers.some(h => h.textContent && h.textContent.trim().toLowerCase() === 'capacity') ||
                           table.querySelector('tbody tr[ng-repeat*="OfferedCourse"]') ||
                           window.location.pathname.toLowerCase().includes('offeredcourses');

    if (!isOfferedTable) return;

    const container = ensureResponsiveTableWrapper(table, 'ewu-offered-table-responsive');
    attachScrollableTouchShield(container);

    if (!config.offeredEnabled) {
      const existingToolbar = container.parentElement ? container.parentElement.querySelector('.ewu-offered-toolbar') : document.querySelector('.ewu-offered-toolbar');
      if (existingToolbar) existingToolbar.style.display = 'none';

      const existingBasket = document.getElementById('ewuCourseBasketDrawer');
      if (existingBasket) existingBasket.style.display = 'none';
      document.body.classList.remove('has-ewu-basket');

      table.querySelectorAll('.ewu-draft-btn').forEach(b => b.remove());
      table.querySelectorAll('.ewu-draft-col-header').forEach(h => h.remove());
      delete table.dataset.offeredSignature;
      return;
    }

    let codeIdx = -1, secIdx = -1, timeIdx = -1, roomIdx = -1, crIdx = -1, capIdx = -1;
    headers.forEach((h, idx) => {
      const text = (h.textContent || '').trim().toLowerCase();
      if (text.includes('course code') || text === 'code') codeIdx = idx;
      else if (text.includes('section') || text === 'sec') secIdx = idx;
      else if (text.includes('time')) timeIdx = idx;
      else if (text.includes('room')) roomIdx = idx;
      else if (text.includes('credit')) crIdx = idx;
      else if (text.includes('capacity')) capIdx = idx;
    });

    // Check Department & Semester selects
    const deptSelect = document.querySelector('select[ng-model*="Dept" i], select[ng-model*="Department" i], select#DepartmentId, select[name*="dept" i], select[name*="department" i]');
    const semSelect = document.querySelector('select[ng-model*="Semester" i], select#SemesterId, select[name*="Semester" i]');

    const isDeptSelected = deptSelect ? (
      deptSelect.value &&
      deptSelect.value !== '0' &&
      !deptSelect.value.includes('?') &&
      !((deptSelect.options[deptSelect.selectedIndex]?.text || '').toLowerCase().includes('select'))
    ) : true;

    const isSemSelected = semSelect ? (
      semSelect.value &&
      semSelect.value !== '0' &&
      !semSelect.value.includes('?') &&
      !((semSelect.options[semSelect.selectedIndex]?.text || '').toLowerCase().includes('select'))
    ) : true;

    const allSelects = Array.from(document.querySelectorAll('select'));
    const anySelectUnset = allSelects.some(sel => {
      const val = (sel.value || '').trim();
      const txt = (sel.options[sel.selectedIndex]?.text || '').toLowerCase();
      return !val || val === '0' || val.includes('?') || txt.includes('please select') || txt.includes('select department') || txt.includes('select semester');
    });

    // Count genuine course section rows in table (must have a valid course code AND capacity)
    const allRows = Array.from(table.querySelectorAll('tbody tr'));
    let genuineCourseCount = 0;
    allRows.forEach(r => {
      const text = r.textContent || '';
      const hasCode = /\b[A-Z]{2,4}\s*\d{3}[A-Z]?\b/i.test(text);
      const hasCap = /\d+\s*\/\s*\d+/.test(text);
      if (hasCode && hasCap) {
        genuineCourseCount++;
      }
    });

    // Attach reactive change listener to all dropdown selects
    allSelects.forEach(sel => {
      if (!sel.dataset.ewuOfferedBound) {
        sel.dataset.ewuOfferedBound = 'true';
        sel.addEventListener('change', () => {
          setTimeout(runEnhancements, 100);
          setTimeout(runEnhancements, 500);
          setTimeout(runEnhancements, 1200);
        });
      }
    });

    if (!isDeptSelected || !isSemSelected || anySelectUnset || genuineCourseCount === 0) {
      // Semester or Department not chosen or no courses fetched yet:
      // Hide helper toolbar & basket drawer, strip any draft buttons/headers
      const existingToolbar = container.parentElement ? container.parentElement.querySelector('.ewu-offered-toolbar') : document.querySelector('.ewu-offered-toolbar');
      if (existingToolbar) existingToolbar.style.display = 'none';

      const existingBasket = document.getElementById('ewuCourseBasketDrawer');
      if (existingBasket) existingBasket.style.display = 'none';
      document.body.classList.remove('has-ewu-basket');

      table.querySelectorAll('.ewu-draft-btn').forEach(b => b.remove());
      table.querySelectorAll('.ewu-draft-col-header').forEach(h => h.remove());
      delete table.dataset.offeredSignature;
      return;
    }

    let toolbar = container.parentElement.querySelector('.ewu-offered-toolbar');
    if (toolbar) {
      toolbar.style.display = '';
    }
    if (!toolbar) {
      toolbar = document.createElement('div');
      toolbar.className = 'ewu-offered-toolbar';
      toolbar.innerHTML = `
        <div class="ewu-toolbar-left" style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
          <label class="ewu-filter-label" title="Hide courses with 0 remaining seats">
            <input type="checkbox" class="ewu-filter-checkbox" id="ewuHideFull">
            <span>Show Open Sections Only</span>
          </label>
          <input type="text" class="ewu-search-input" id="ewuCourseSearch" placeholder="Search Code / Room / Time...">
          <button type="button" class="ewu-spotlight-btn" id="ewuOpenSpotlightBtn" title="Press Ctrl+K anytime">
            <span>🔍 Spotlight</span>
            <kbd>Ctrl K</kbd>
          </button>
        </div>
        <div class="ewu-toolbar-right" style="display:flex;align-items:center;gap:6px;">
          <span class="ewu-stats-pill" id="ewuStatsPill">Calculating seats...</span>
          <span class="ewu-beta-tag" title="Offered courses features are in Beta">BETA</span>
        </div>

        <div class="ewu-filter-chips-container" style="width: 100%;">
          <div class="ewu-filter-chip-group">
            <span class="ewu-filter-chip-label">Days:</span>
            <button type="button" class="ewu-filter-chip active" data-day="ALL">All</button>
            <button type="button" class="ewu-filter-chip" data-day="ST">ST</button>
            <button type="button" class="ewu-filter-chip" data-day="MW">MW</button>
            <button type="button" class="ewu-filter-chip" data-day="SR">SR</button>
            <button type="button" class="ewu-filter-chip" data-day="TR">TR</button>
            <button type="button" class="ewu-filter-chip" data-day="RA">RA</button>
            <button type="button" class="ewu-filter-chip" data-day="F">Fri</button>
          </div>
          <div class="ewu-filter-chip-group" style="margin-left: 12px;">
            <span class="ewu-filter-chip-label">Times:</span>
            <button type="button" class="ewu-filter-chip active" data-time="ALL">All</button>
            <button type="button" class="ewu-filter-chip" data-time="08:30">08:30 AM</button>
            <button type="button" class="ewu-filter-chip" data-time="10:10">10:10 AM</button>
            <button type="button" class="ewu-filter-chip" data-time="11:50">11:50 AM</button>
            <button type="button" class="ewu-filter-chip" data-time="01:30">01:30 PM</button>
            <button type="button" class="ewu-filter-chip" data-time="03:10">03:10+ PM</button>
          </div>
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

      const spotlightBtn = toolbar.querySelector('#ewuOpenSpotlightBtn');
      if (spotlightBtn) {
        spotlightBtn.addEventListener('click', (e) => {
          e.preventDefault();
          openSpotlightModal(table);
        });
      }

      // Day Chips
      toolbar.querySelectorAll('[data-day]').forEach(chip => {
        chip.addEventListener('click', () => {
          toolbar.querySelectorAll('[data-day]').forEach(c => c.classList.remove('active'));
          chip.classList.add('active');
          activeDayFilter = chip.dataset.day;
          applyOfferedFilter(table);
        });
      });

      // Time Chips
      toolbar.querySelectorAll('[data-time]').forEach(chip => {
        chip.addEventListener('click', () => {
          toolbar.querySelectorAll('[data-time]').forEach(c => c.classList.remove('active'));
          chip.classList.add('active');
          activeTimeFilter = chip.dataset.time;
          applyOfferedFilter(table);
        });
      });
    }

    const currentBasketCourses = basketPlans[basketActivePreset] || [];
    const activeClashes = detectScheduleClashes(currentBasketCourses);
    const clashingKeys = new Set();
    activeClashes.forEach(cl => {
      clashingKeys.add(`${cl.course1.code}_${cl.course1.section}`);
      clashingKeys.add(`${cl.course2.code}_${cl.course2.section}`);
    });

    const basketSig = currentBasketCourses.map(c => `${c.code}_${c.section}`).join(',');
    const offeredSignature = `${genuineCourseCount}_${basketActivePreset}_${basketSig}_${clashingKeys.size}`;

    if (table.dataset.offeredSignature === offeredSignature) {
      if (config.basketEnabled) {
        renderCourseBasketDrawer(table);
      }
      return;
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

      // Course Basket Section Extraction
      const cCode = (cells[codeIdx !== -1 ? codeIdx : 0]?.textContent || '').trim().toUpperCase();
      const cSec = (cells[secIdx !== -1 ? secIdx : 2]?.textContent || '').trim();
      const cTime = (cells[timeIdx !== -1 ? timeIdx : 3]?.textContent || '').trim();
      const cRoom = (cells[roomIdx !== -1 ? roomIdx : 4]?.textContent || '').trim();
      const cCredit = parseFloat((cells[crIdx !== -1 ? crIdx : 5]?.textContent || '3.0').trim()) || 3.0;

      const courseKey = `${cCode}_${cSec}`;
      row.dataset.courseKey = courseKey;

      if (clashingKeys.has(courseKey)) {
        row.classList.add('ewu-table-row-clash');
      } else {
        row.classList.remove('ewu-table-row-clash');
      }

      if (config.basketEnabled && cCode && cSec) {
        const firstCell = cells[0];
        let draftBtn = firstCell.querySelector('.ewu-draft-btn');
        const isInBasket = currentBasketCourses.some(c => c.code === cCode && c.section === cSec);

        if (!draftBtn) {
          draftBtn = document.createElement('button');
          draftBtn.type = 'button';
          draftBtn.className = 'ewu-draft-btn';
          firstCell.insertBefore(draftBtn, firstCell.firstChild);
        }

        if (isInBasket) {
          draftBtn.classList.add('in-basket');
          draftBtn.textContent = '✓ Drafted';
          draftBtn.title = 'Remove from draft basket';
        } else {
          draftBtn.classList.remove('in-basket');
          draftBtn.textContent = '+ Draft';
          draftBtn.title = 'Add to draft basket & clash sandbox';
        }

        draftBtn.onclick = (e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleCourseInBasket({
            code: cCode,
            section: cSec,
            time: cTime,
            room: cRoom,
            credits: cCredit
          }, table);
        };
      }
    });

    table.dataset.offeredSignature = offeredSignature;

    const statsPill = toolbar.querySelector('#ewuStatsPill');
    if (statsPill && totalSections > 0) {
      statsPill.textContent = `${openSections} open of ${totalSections} total sections`;
    }

    if (config.basketEnabled) {
      renderCourseBasketDrawer(table);
    }

    initSpotlightSearch(table);
    applyOfferedFilter(table);
  }

  function updateTableDraftStates(table) {
    if (!table) table = document.querySelector('table.ewu-offered-table, table:not(.ewu-summary-table)');
    if (!table) return;

    const currentBasketCourses = basketPlans[basketActivePreset] || [];
    const activeClashes = detectScheduleClashes(currentBasketCourses);
    const clashingKeys = new Set();
    activeClashes.forEach(cl => {
      clashingKeys.add(`${cl.course1.code}_${cl.course1.section}`);
      clashingKeys.add(`${cl.course2.code}_${cl.course2.section}`);
    });

    const rows = table.querySelectorAll('tbody tr');
    rows.forEach(row => {
      const courseKey = row.dataset.courseKey;
      if (!courseKey) return;
      const [cCode, cSec] = courseKey.split('_');

      if (clashingKeys.has(courseKey)) {
        row.classList.add('ewu-table-row-clash');
      } else {
        row.classList.remove('ewu-table-row-clash');
      }

      const draftBtn = row.querySelector('.ewu-draft-btn');
      if (draftBtn) {
        const isInBasket = currentBasketCourses.some(c => c.code === cCode && c.section === cSec);
        if (isInBasket) {
          draftBtn.classList.add('in-basket');
          draftBtn.textContent = '✓ Drafted';
          draftBtn.title = 'Remove from draft basket';
        } else {
          draftBtn.classList.remove('in-basket');
          draftBtn.textContent = '+ Draft';
          draftBtn.title = 'Add to draft basket & clash sandbox';
        }
      }
    });

    const genuineCourseCount = table.querySelectorAll('tbody tr[data-course-key]').length;
    const basketSig = currentBasketCourses.map(c => `${c.code}_${c.section}`).join(',');
    table.dataset.offeredSignature = `${genuineCourseCount}_${basketActivePreset}_${basketSig}_${clashingKeys.size}`;
  }

  function applyOfferedFilter(table) {
    const rows = table.querySelectorAll('tbody tr');
    rows.forEach((row) => {
      const available = parseInt(row.dataset.availableSeats || '999', 10);
      const rowText = row.textContent.toLowerCase();

      const matchesSearch = !courseSearchQuery || rowText.includes(courseSearchQuery);
      const matchesOpen = !hideFullSections || available > 0;
      const matchesDay = rowMatchesDay(rowText, activeDayFilter);
      const matchesTime = rowMatchesTime(rowText, activeTimeFilter);

      if (matchesSearch && matchesOpen && matchesDay && matchesTime) {
        row.classList.remove('ewu-row-hidden');
      } else {
        row.classList.add('ewu-row-hidden');
      }
    });
  }

  function toggleCourseInBasket(course, table) {
    if (!basketPlans[basketActivePreset]) basketPlans[basketActivePreset] = [];
    const plan = basketPlans[basketActivePreset];
    const idx = plan.findIndex(c => c.code === course.code && c.section === course.section);
    if (idx !== -1) {
      plan.splice(idx, 1);
    } else {
      plan.push(course);
    }
    basketPlans[basketActivePreset] = plan;
    saveBasketPlans();

    const drawer = document.getElementById('ewuCourseBasketDrawer');
    if (drawer) delete drawer.dataset.signature;

    renderCourseBasketDrawer(table);
    updateTableDraftStates(table);
  }

  function renderCourseBasketDrawer(table) {
    let drawer = document.getElementById('ewuCourseBasketDrawer');
    if (!drawer) {
      drawer = document.createElement('div');
      drawer.id = 'ewuCourseBasketDrawer';
      drawer.className = 'ewu-basket-drawer collapsed';
      document.body.appendChild(drawer);
    }
    drawer.style.display = '';
    document.body.classList.add('has-ewu-basket');

    const currentCourses = basketPlans[basketActivePreset] || [];
    const clashes = detectScheduleClashes(currentCourses);
    const totalCredits = currentCourses.reduce((sum, c) => sum + (c.credits || 3.0), 0);
    const isCollapsed = drawer.classList.contains('collapsed');

    // Signature Cache: Prevents infinite DOM mutations & screen blinking on every observer tick!
    const planASig = (basketPlans.A || []).map(c => `${c.code}_${c.section}`).join(',');
    const planBSig = (basketPlans.B || []).map(c => `${c.code}_${c.section}`).join(',');
    const drawerSignature = `${basketActivePreset}_${isCollapsed ? '1' : '0'}_${clashes.length}_${planASig}|${planBSig}`;

    if (drawer.dataset.signature === drawerSignature) {
      return;
    }
    drawer.dataset.signature = drawerSignature;

    drawer.innerHTML = `
      <div class="ewu-basket-header" id="ewuBasketHeaderToggle">
        <div class="ewu-basket-header-title">
          <span>🛒</span>
          <span>Advising Sandbox (Plan ${basketActivePreset})</span>
          <span class="ewu-beta-tag" style="font-size: 9px; padding: 1px 5px;">BETA</span>
        </div>
        <div class="ewu-basket-header-badges">
          ${clashes.length > 0 ? `<span class="ewu-basket-badge-clash">⚠️ ${clashes.length} Clash${clashes.length > 1 ? 'es' : ''}</span>` : ''}
          <span style="font-size: 11px; background: rgba(255,255,255,0.2); padding: 2px 7px; border-radius: 9999px;">
            ${currentCourses.length} Courses &bull; ${totalCredits.toFixed(1)} Cr
          </span>
          <span id="ewuBasketCollapseArrow" style="font-size: 12px; margin-left: 4px;">${isCollapsed ? '▲' : '▼'}</span>
        </div>
      </div>

      <div class="ewu-basket-body">
        <div class="ewu-basket-plan-bar">
          <div class="ewu-basket-presets">
            <button type="button" class="ewu-basket-preset-btn ${basketActivePreset === 'A' ? 'active' : ''}" id="ewuPresetA">Plan A (${(basketPlans.A || []).length})</button>
            <button type="button" class="ewu-basket-preset-btn ${basketActivePreset === 'B' ? 'active' : ''}" id="ewuPresetB">Plan B (${(basketPlans.B || []).length})</button>
          </div>
          ${currentCourses.length > 0 ? `<button type="button" id="ewuBasketClearBtn" style="background:none;border:none;color:#ef4444;cursor:pointer;font-size:11px;font-weight:700;">Clear All</button>` : ''}
        </div>

        ${clashes.length > 0 ? `
          <div class="ewu-basket-clash-alert">
            <strong>⚠️ Time Clashes Detected!</strong>
            ${clashes.map(cl => `
              <div style="margin-top: 4px;">&bull; <strong>${cl.course1.code} (Sec ${cl.course1.section})</strong> clashes with <strong>${cl.course2.code} (Sec ${cl.course2.section})</strong> on ${cl.commonDays} (${cl.time1})</div>
            `).join('')}
          </div>
        ` : ''}

        ${currentCourses.length === 0 ? `
          <div style="text-align: center; padding: 24px 12px; color: #64748b; font-size: 13px;">
            <div style="font-size: 28px; margin-bottom: 6px;">📝</div>
            Your draft basket for <strong>Plan ${basketActivePreset}</strong> is empty.<br>Click <strong>[+ Draft]</strong> on any offered section to test your schedule!
          </div>
        ` : `
          <div style="margin-bottom: 12px;">
            ${currentCourses.map((c, i) => {
              const hasClash = clashes.some(cl => (cl.course1.code === c.code && cl.course1.section === c.section) || (cl.course2.code === c.code && cl.course2.section === c.section));
              return `
                <div class="ewu-basket-card ${hasClash ? 'clashing' : ''}">
                  <div class="ewu-basket-card-info">
                    <div class="ewu-basket-course-code">
                      ${c.code} &bull; Sec ${c.section}
                      ${hasClash ? `<span style="color:#ef4444;font-size:11px;margin-left:4px;">⚠️ Clash</span>` : ''}
                    </div>
                    <div class="ewu-basket-meta">${c.time} &bull; Room: ${c.room || 'TBA'} &bull; ${c.credits} Cr</div>
                  </div>
                  <button type="button" class="ewu-basket-remove-btn" data-idx="${i}" title="Remove section">✕</button>
                </div>
              `;
            }).join('')}
          </div>

          <div style="display: flex; gap: 8px; margin-top: 12px;">
            <button type="button" id="ewuBasketSyncCalendarBtn" style="flex:1;padding:8px;border-radius:8px;border:none;background:#4f46e5;color:white;font-weight:700;font-size:12px;cursor:pointer;">
              📅 Sync to Google
            </button>
            <button type="button" id="ewuBasketExportIcsBtn" style="flex:1;padding:8px;border-radius:8px;border:1px solid #cbd5e1;background:#ffffff;color:#475569;font-weight:700;font-size:12px;cursor:pointer;">
              📆 Export .ics
            </button>
          </div>
        `}
      </div>
    `;

    const toggle = drawer.querySelector('#ewuBasketHeaderToggle');
    if (toggle) {
      toggle.onclick = (e) => {
        e.preventDefault();
        drawer.classList.toggle('collapsed');
        const isNowCollapsed = drawer.classList.contains('collapsed');
        const arrow = drawer.querySelector('#ewuBasketCollapseArrow');
        if (arrow) arrow.textContent = isNowCollapsed ? '▲' : '▼';
        const pASig = (basketPlans.A || []).map(c => `${c.code}_${c.section}`).join(',');
        const pBSig = (basketPlans.B || []).map(c => `${c.code}_${c.section}`).join(',');
        drawer.dataset.signature = `${basketActivePreset}_${isNowCollapsed ? '1' : '0'}_${clashes.length}_${pASig}|${pBSig}`;
      };
    }

    function switchPreset(targetPreset) {
      if (basketActivePreset === targetPreset) return;
      basketActivePreset = targetPreset;
      saveBasketPlans();
      delete drawer.dataset.signature;
      renderCourseBasketDrawer(table);
      updateTableDraftStates(table);
    }

    const presetA = drawer.querySelector('#ewuPresetA');
    const presetB = drawer.querySelector('#ewuPresetB');
    if (presetA) {
      presetA.onclick = (e) => {
        e.preventDefault();
        switchPreset('A');
      };
    }
    if (presetB) {
      presetB.onclick = (e) => {
        e.preventDefault();
        switchPreset('B');
      };
    }

    const clearBtn = drawer.querySelector('#ewuBasketClearBtn');
    if (clearBtn) {
      clearBtn.onclick = (e) => {
        e.preventDefault();
        basketPlans[basketActivePreset] = [];
        saveBasketPlans();
        delete drawer.dataset.signature;
        renderCourseBasketDrawer(table);
        updateTableDraftStates(table);
      };
    }

    drawer.querySelectorAll('.ewu-basket-remove-btn').forEach(btn => {
      btn.onclick = (e) => {
        e.preventDefault();
        const i = parseInt(btn.dataset.idx, 10);
        if (!isNaN(i) && basketPlans[basketActivePreset]) {
          basketPlans[basketActivePreset].splice(i, 1);
          saveBasketPlans();
          delete drawer.dataset.signature;
          renderCourseBasketDrawer(table);
          updateTableDraftStates(table);
        }
      };
    });

    const syncBtn = drawer.querySelector('#ewuBasketSyncCalendarBtn');
    if (syncBtn) {
      syncBtn.onclick = (e) => {
        e.preventDefault();
        triggerCalendarSyncFlow(currentCourses, `Draft Plan ${basketActivePreset}`);
      };
    }

    const icsBtn = drawer.querySelector('#ewuBasketExportIcsBtn');
    if (icsBtn) {
      icsBtn.onclick = (e) => {
        e.preventDefault();
        exportRoutineToICS(currentCourses, `Draft Plan ${basketActivePreset}`);
      };
    }
  }

  // =========================================================================
  // FEATURE 3: Quick Spotlight Search (Ctrl + K)
  // =========================================================================
  let spotlightListenerAttached = false;

  function initSpotlightSearch(table) {
    if (spotlightListenerAttached) return;
    spotlightListenerAttached = true;

    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        openSpotlightModal(table);
      }
    });
  }

  function openSpotlightModal(table) {
    let backdrop = document.getElementById('ewuSpotlightBackdrop');
    if (backdrop) backdrop.remove();

    backdrop = document.createElement('div');
    backdrop.id = 'ewuSpotlightBackdrop';
    backdrop.className = 'ewu-spotlight-backdrop';
    backdrop.innerHTML = `
      <div class="ewu-spotlight-modal" role="dialog" aria-modal="true">
        <div class="ewu-spotlight-input-wrapper">
          <span class="ewu-spotlight-icon">🔍</span>
          <input type="text" class="ewu-spotlight-input" id="ewuSpotlightInput" placeholder="Quick search Course, Room, Section, Time (e.g. CSE101, AB2-501)..." autofocus>
          <kbd style="font-size:11px;padding:3px 6px;background:#f1f5f9;border-radius:4px;color:#64748b;">ESC</kbd>
        </div>
        <div class="ewu-spotlight-results" id="ewuSpotlightResults">
          <div style="padding: 24px; text-align: center; color: #94a3b8; font-size: 13px;">
            Type any course code, section, or room to find sections instantly...
          </div>
        </div>
        <div class="ewu-spotlight-footer">
          <span>Tip: Click any section to jump directly to it in the table</span>
          <span>EWU-Toolkit v1.5.1</span>
        </div>
      </div>
    `;

    document.body.appendChild(backdrop);

    const input = backdrop.querySelector('#ewuSpotlightInput');
    const resultsContainer = backdrop.querySelector('#ewuSpotlightResults');
    input.focus();

    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) backdrop.remove();
    });

    const escListener = (e) => {
      if (e.key === 'Escape') {
        backdrop.remove();
        document.removeEventListener('keydown', escListener);
      }
    };
    document.addEventListener('keydown', escListener);

    // Extract all rows for spotlight
    const rows = Array.from(table.querySelectorAll('tbody tr')).filter(r => r.querySelectorAll('td').length >= 4);

    input.addEventListener('input', () => {
      const q = input.value.trim().toLowerCase();
      if (!q) {
        resultsContainer.innerHTML = `<div style="padding:24px;text-align:center;color:#94a3b8;font-size:13px;">Type to search courses...</div>`;
        return;
      }

      const matches = [];
      rows.forEach(r => {
        const text = r.textContent.toLowerCase();
        if (text.includes(q)) {
          const cells = r.querySelectorAll('td');
          const code = (cells[0]?.textContent || '').trim();
          const title = (cells[1]?.textContent || '').trim();
          const sec = (cells[2]?.textContent || '').trim();
          const time = (cells[3]?.textContent || '').trim();
          const room = (cells[4]?.textContent || '').trim();
          const avail = r.dataset.availableSeats || 'Open';
          matches.push({ row: r, code, title, sec, time, room, avail });
        }
      });

      if (matches.length === 0) {
        resultsContainer.innerHTML = `<div style="padding:24px;text-align:center;color:#ef4444;font-size:13px;">No matching course sections found for "${q}".</div>`;
        return;
      }

      resultsContainer.innerHTML = matches.slice(0, 30).map((m, idx) => `
        <div class="ewu-spotlight-item" data-idx="${idx}">
          <div>
            <div class="ewu-spotlight-item-code">${m.code} &bull; Section ${m.sec}</div>
            <div class="ewu-spotlight-item-meta">${m.title ? m.title + ' &bull; ' : ''}${m.time} &bull; Room: ${m.room || 'TBA'}</div>
          </div>
          <div style="font-size: 11px; padding: 3px 8px; border-radius: 9999px; background: ${m.avail === '0' ? '#fee2e2' : '#dcfce7'}; color: ${m.avail === '0' ? '#b91c1c' : '#15803d'}; font-weight: 700;">
            ${m.avail === '0' ? 'Full' : `${m.avail} seats`}
          </div>
        </div>
      `).join('');

      resultsContainer.querySelectorAll('.ewu-spotlight-item').forEach((item, idx) => {
        item.addEventListener('click', () => {
          const target = matches[idx];
          backdrop.remove();
          target.row.scrollIntoView({ behavior: 'smooth', block: 'center' });
          target.row.style.outline = '3px solid #4f46e5';
          setTimeout(() => { target.row.style.outline = ''; }, 2000);
        });
      });
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

    // Ensure raw ledger transaction table is wrapped in responsive scroll container
    const responsiveWrapper = ensureResponsiveTableWrapper(table, 'ewu-ledger-table-responsive');
    table.classList.add('ewu-ledger-table');
    attachScrollableTouchShield(responsiveWrapper);

    // Mobile scroll hint before raw ledger table
    let scrollHint = responsiveWrapper.parentElement.querySelector('.ewu-ledger-scroll-hint');
    if (!scrollHint) {
      scrollHint = document.createElement('div');
      scrollHint.className = 'ewu-mobile-scroll-hint ewu-ledger-scroll-hint';
      scrollHint.innerHTML = '<span>👈 Swipe table horizontally to view full transaction ledger 👉</span>';
      responsiveWrapper.parentElement.insertBefore(scrollHint, responsiveWrapper);
    }

    let summaryCard = responsiveWrapper.parentElement.querySelector('.ewu-ledger-summary-card');

    // Signature cache check: prevents wiping out DOM and breaking horizontal swipe on every MutationObserver tick
    const currentSignature = `${rows.length}_${totalBilled}_${totalPaid}_${totalWaiver}_${netDue}_${semesterOrder.join('|')}`;
    if (summaryCard && summaryCard.dataset.signature === currentSignature) {
      return;
    }

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
          <td class="sem-col"><strong>${sem}</strong></td>
          <td class="num-col">${formatMoney(s.billed)}</td>
          <td class="num-col" style="color: #15803d; font-weight: 600;">${formatMoney(s.paid)}</td>
          <td class="num-col" style="color: #6d28d9; font-weight: 600;">${formatMoney(s.waiver)}</td>
          <td class="status-col">${statusBadge}</td>
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
      <div class="table-responsive ewu-summary-table-wrapper">
        <table class="table table-bordered table-striped ewu-summary-table">
          <thead>
            <tr>
              <th class="sem-col">Semester</th>
              <th class="num-col">Billed <span class="ewu-desktop-only">(Charges)</span></th>
              <th class="num-col">Paid <span class="ewu-desktop-only">(Receipts)</span></th>
              <th class="num-col">Waivers <span class="ewu-desktop-only">/ Credits</span></th>
              <th class="status-col">Semester Status</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
          <tfoot>
            <tr class="ewu-ledger-tfoot-row" style="font-weight: 700;">
              <td class="sem-col">Grand Total</td>
              <td class="num-col">${formatMoney(totalBilled)}</td>
              <td class="num-col" style="color: #15803d;">${formatMoney(totalPaid)}</td>
              <td class="num-col" style="color: #6d28d9;">${formatMoney(totalWaiver)}</td>
              <td class="status-col">${netDue <= 0 ? '<span class="ewu-status-badge cleared">✓ Cleared</span>' : `<span class="ewu-status-badge due">${formatMoney(netDue)} Due</span>`}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    `;

    if (!summaryCard) {
      summaryCard = document.createElement('div');
      summaryCard.className = 'ewu-ledger-summary-card';
      summaryCard.dataset.signature = currentSignature;
      summaryCard.innerHTML = summaryHtml;
      responsiveWrapper.parentElement.insertBefore(summaryCard, scrollHint);
    } else {
      summaryCard.dataset.signature = currentSignature;
      summaryCard.innerHTML = summaryHtml;
    }

    const summaryTableWrapper = summaryCard.querySelector('.ewu-summary-table-wrapper');
    if (summaryTableWrapper) {
      attachScrollableTouchShield(summaryTableWrapper);
    }
  }

  // =========================================================================
  // FEATURE 5: Automatic Login Math Captcha Solver
  // =========================================================================
  function processLoginCaptcha() {
    const answerInputs = document.querySelectorAll(
      'input#lblcaptchaAnswer, input[name="Answer"], input#Answer, input[name*="Answer" i], input[id*="captcha" i], input[name*="captcha" i]'
    );

    if (answerInputs.length === 0) return;

    answerInputs.forEach((answerInput) => {
      // If disabled via settings, revert any styling/badge and exit
      if (!config.captchaEnabled) {
        if (answerInput.dataset.ewuSolved) {
          delete answerInput.dataset.ewuSolved;
          delete answerInput.dataset.ewuProblem;
          delete answerInput.dataset.ewuUserEdited;
          answerInput.classList.remove('ewu-captcha-solved-input');
          const existingBadge = answerInput.parentElement ? answerInput.parentElement.querySelector('.ewu-captcha-badge') : null;
          if (existingBadge) existingBadge.remove();
        }
        return;
      }

      const form = answerInput.closest('form') || document;

      // 1. Try hidden inputs FirstNo and SecondNo within the same form/context
      let num1 = NaN;
      let num2 = NaN;

      const hiddenFirst = form.querySelector('input[name="FirstNo"]');
      const hiddenSecond = form.querySelector('input[name="SecondNo"]');
      if (hiddenFirst && hiddenFirst.value !== '') {
        num1 = parseInt(hiddenFirst.value.trim(), 10);
      }
      if (hiddenSecond && hiddenSecond.value !== '') {
        num2 = parseInt(hiddenSecond.value.trim(), 10);
      }

      // 2. Try label IDs lblFirstNo and lblSecondNo
      if (isNaN(num1)) {
        const lblFirst = form.querySelector('#lblFirstNo') || document.getElementById('lblFirstNo');
        if (lblFirst && lblFirst.textContent) {
          num1 = parseInt(lblFirst.textContent.trim(), 10);
        }
      }
      if (isNaN(num2)) {
        const lblSecond = form.querySelector('#lblSecondNo') || document.getElementById('lblSecondNo');
        if (lblSecond && lblSecond.textContent) {
          num2 = parseInt(lblSecond.textContent.trim(), 10);
        }
      }

      // 3. Fallback: regex search in parent group or form for "X + Y"
      if (isNaN(num1) || isNaN(num2)) {
        const container = answerInput.closest('.input-group') || form;
        if (container) {
          const text = container.textContent || '';
          const match = text.match(/(\d+)\s*\+\s*(\d+)/);
          if (match) {
            num1 = parseInt(match[1], 10);
            num2 = parseInt(match[2], 10);
          }
        }
      }

      if (isNaN(num1) || isNaN(num2)) return;

      const sum = num1 + num2;
      const answer = String(sum);
      const problemKey = `${num1}+${num2}`;

      // If already solved and matches current state, nothing to do
      const existingBadge = answerInput.parentElement ? answerInput.parentElement.querySelector('.ewu-captcha-badge') : null;
      if (answerInput.dataset.ewuProblem === problemKey && answerInput.dataset.ewuSolved === answer && answerInput.value === answer && existingBadge) {
        return;
      }

      // If problem hasn't changed and user manually typed their own value, don't overwrite
      if (answerInput.dataset.ewuProblem === problemKey && answerInput.dataset.ewuUserEdited === 'true') {
        return;
      }

      // Set solved answer value
      answerInput.value = answer;
      answerInput.setAttribute('value', answer);
      answerInput.dataset.ewuSolved = answer;
      answerInput.dataset.ewuProblem = problemKey;
      answerInput.dataset.ewuUserEdited = 'false';
      answerInput.classList.add('ewu-captcha-solved-input');

      // Dispatch change/input events for listeners
      answerInput.dispatchEvent(new Event('input', { bubbles: true }));
      answerInput.dispatchEvent(new Event('change', { bubbles: true }));

      // Attach user edit listener once
      if (!answerInput.dataset.ewuListenerAttached) {
        answerInput.dataset.ewuListenerAttached = 'true';
        answerInput.addEventListener('input', () => {
          if (answerInput.value !== answerInput.dataset.ewuSolved) {
            answerInput.dataset.ewuUserEdited = 'true';
            const b = answerInput.parentElement ? answerInput.parentElement.querySelector('.ewu-captcha-badge') : null;
            if (b) b.style.display = 'none';
            answerInput.classList.remove('ewu-captcha-solved-input');
          }
        });
      }

      // Safety net: form submit listener ensures answer is filled before onsubmit check
      const actualForm = answerInput.closest('form') || document.getElementById('loginform') || document.forms['myForm'];
      if (actualForm && !actualForm.dataset.ewuCaptchaHooked) {
        actualForm.dataset.ewuCaptchaHooked = 'true';
        actualForm.addEventListener('submit', () => {
          if (config.captchaEnabled && (!answerInput.value || answerInput.value.trim() === '')) {
            answerInput.value = answer;
            answerInput.setAttribute('value', answer);
          }
        }, true);
      }

      // Render or update badge
      let badge = existingBadge;
      if (!badge) {
        badge = document.createElement('span');
        badge.className = 'ewu-captcha-badge';
        badge.innerHTML = `
          <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor" style="display:inline-block;vertical-align:-1px;">
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
          </svg> Auto-solved
        `;
        badge.title = `Captcha auto-solved by EWU-Toolkit (${num1} + ${num2} = ${sum})`;
        if (answerInput.nextSibling) {
          answerInput.parentNode.insertBefore(badge, answerInput.nextSibling);
        } else {
          answerInput.parentNode.appendChild(badge);
        }
      } else {
        badge.style.display = '';
        badge.title = `Captcha auto-solved by EWU-Toolkit (${num1} + ${num2} = ${sum})`;
      }
    });
  }

  // =========================================================================
  // FEATURE 6: Advising Window Faculty Revealer (v1.5.0)
  // =========================================================================
  // Advising Window Lookup & Enrolled Tracker
  const advisingFacultyLookup = {};
  let currentlyAdvisedList = [];
  let bridgeInjected = false;

  function timeSlotsClash(slotStr1, slotStr2) {
    if (!slotStr1 || !slotStr2) return false;
    const days1 = parseDayCodes(slotStr1);
    const days2 = parseDayCodes(slotStr2);
    const commonDays = days1.filter(d => days2.includes(d));
    if (commonDays.length === 0) return false;
    const t1 = parseTimeRangeMinutes(slotStr1);
    const t2 = parseTimeRangeMinutes(slotStr2);
    if (!t1 || !t2) return false;
    return (t1.start < t2.end && t2.start < t1.end);
  }

  function getCurrentlyAdvisedCourses() {
    const map = new Map();
    currentlyAdvisedList.forEach(item => {
      if (item && item.courseCode) map.set(item.courseCode, item);
    });

    // Also extract directly from right-hand AdvisingDataList table in DOM
    const enrolledRows = document.querySelectorAll('tr[ng-repeat*="AdvisingDataList"]');
    enrolledRows.forEach(row => {
      const cells = row.querySelectorAll('td');
      if (cells.length >= 4) {
        const code = (cells[0].textContent || '').trim().toUpperCase();
        const sec = (cells[1].textContent || '').trim();
        const slot = (cells[3].textContent || '').trim();
        if (code && !code.includes('{{')) {
          map.set(code, { courseCode: code, section: sec, timeSlot: slot });
        }
      }
    });

    return Array.from(map.values());
  }

  function injectAdvisingBridge() {
    if (bridgeInjected || document.getElementById('ewu-advising-bridge')) return;
    bridgeInjected = true;
    try {
      const script = document.createElement('script');
      script.id = 'ewu-advising-bridge';
      script.textContent = `
        (function() {
          function dispatchCaptured(url, data) {
            try {
              window.dispatchEvent(new CustomEvent('EWU_ADVISING_DATA_CAPTURED', {
                detail: { url: String(url || ''), data: data }
              }));
            } catch(e) {}
          }

          // 1. Intercept future XHRs
          const origOpen = XMLHttpRequest.prototype.open;
          const origSend = XMLHttpRequest.prototype.send;
          XMLHttpRequest.prototype.open = function(method, url, ...rest) {
            this._ewuUrl = url;
            return origOpen.call(this, method, url, ...rest);
          };
          XMLHttpRequest.prototype.send = function(...args) {
            this.addEventListener('load', function() {
              if (this._ewuUrl && (this._ewuUrl.includes('/api/Advising/') || this._ewuUrl.includes('/Advising/'))) {
                try {
                  const data = JSON.parse(this.responseText);
                  dispatchCaptured(this._ewuUrl, data);
                } catch(e) {}
              }
            });
            return origSend.apply(this, args);
          };

          // 2. Intercept future Fetches
          if (window.fetch) {
            const origFetch = window.fetch;
            window.fetch = async function(...args) {
              const resp = await origFetch.apply(this, args);
              try {
                const url = (args[0] && args[0].url) || String(args[0] || '');
                if (url.includes('/api/Advising/') || url.includes('/Advising/')) {
                  const clone = resp.clone();
                  clone.json().then(data => dispatchCaptured(url, data)).catch(() => {});
                }
              } catch(e) {}
              return resp;
            };
          }

          // 3. Eager AngularJS Scope Sync & Force Unhide isTBA
          function syncAngularState() {
            try {
              var el = document.querySelector('[ng-controller="AdvisingStudentController"]');
              if (window.angular && el) {
                var scope = window.angular.element(el).scope();
                if (scope) {
                  if (scope.isTBA !== 0) {
                    scope.isTBA = 0;
                    if (!scope.$$phase) scope.$apply();
                  }
                  if (scope.FlowChartDataList && scope.FlowChartDataList.length > 0) {
                    dispatchCaptured('/api/Advising/GetAllRoutine', scope.FlowChartDataList);
                  }
                  if (scope.RetakeList && scope.RetakeList.length > 0) {
                    dispatchCaptured('/api/Advising/GetRetakableGradeList', scope.RetakeList);
                  }
                  if (scope.DDplusList && scope.DDplusList.length > 0) {
                    dispatchCaptured('/api/Advising/GetDDplusGradeList', scope.DDplusList);
                  }
                  if (scope.FGradeDataList && scope.FGradeDataList.length > 0) {
                    dispatchCaptured('/api/Advising/GetFGradeList', scope.FGradeDataList);
                  }
                  if (scope.AdvisingDataList && scope.AdvisingDataList.length > 0) {
                    dispatchCaptured('/api/Advising/GetAdvisingData', scope.AdvisingDataList);
                  }
                }
              }
            } catch(e) {}
          }
          syncAngularState();
          setInterval(syncAngularState, 600);

          // 4. Eager Fetch Fallback for Immediate Hydration
          fetch('/api/Advising/GetAllRoutine')
            .then(function(r) { return r.json(); })
            .then(function(data) { dispatchCaptured('/api/Advising/GetAllRoutine', data); })
            .catch(function() {});
          fetch('/api/Advising/GetRetakableGradeList')
            .then(function(r) { return r.json(); })
            .then(function(data) { dispatchCaptured('/api/Advising/GetRetakableGradeList', data); })
            .catch(function() {});
          fetch('/api/Advising/GetDDplusGradeList')
            .then(function(r) { return r.json(); })
            .then(function(data) { dispatchCaptured('/api/Advising/GetDDplusGradeList', data); })
            .catch(function() {});
          fetch('/api/Advising/GetFGradeList')
            .then(function(r) { return r.json(); })
            .then(function(data) { dispatchCaptured('/api/Advising/GetFGradeList', data); })
            .catch(function() {});
          fetch('/api/Advising/GetAdvisingData')
            .then(function(r) { return r.json(); })
            .then(function(data) { dispatchCaptured('/api/Advising/GetAdvisingData', data); })
            .catch(function() {});
        })();
      `;
      (document.head || document.documentElement).appendChild(script);
    } catch(e) {}
  }

  window.addEventListener('EWU_ADVISING_DATA_CAPTURED', (e) => {
    const detail = e.detail;
    if (!detail || !detail.data) return;
    const items = Array.isArray(detail.data) ? detail.data : (detail.data.Result && Array.isArray(detail.data.Result) ? detail.data.Result : []);

    // Check if this was AdvisingDataList
    if (detail.url && (detail.url.includes('GetAdvisingData') || detail.url.includes('AdvisingData'))) {
      currentlyAdvisedList = items.map(item => ({
        courseCode: (item.CourseCode || '').trim().toUpperCase(),
        section: String(item.SectionName != null ? item.SectionName : (item.SectionId || item.Section || '')).trim(),
        timeSlot: item.TimeSlotName || '',
        shortName: item.ShortName || ''
      }));
    }

    items.forEach(item => {
      if (item && item.CourseCode) {
        const sec = String(item.SectionName != null ? item.SectionName : (item.SectionId || item.Section || '')).trim();
        const code = item.CourseCode.trim().toUpperCase();
        const key = `${code}_${sec}`;
        const initial = item.ShortName || item.FacultyInitial || (item.FacultyName ? item.FacultyName.split(' ').map(w=>w[0]).join('') : '');
        if (initial && initial !== 'TBA') {
          advisingFacultyLookup[key] = {
            initial: initial,
            name: item.FacultyName || '',
            room: item.RoomCode || item.RoomName || '',
            time: item.TimeSlotName || ''
          };
        }
      }
    });
    runEnhancements();
  });

  // Helper to accurately extract column indices for any Advising table (F Grade, Recommended, D/D+, Retakable)
  function getTableColumnIndices(table) {
    const headers = Array.from(table.querySelectorAll('th, tr:first-child td'));
    const colIdx = {
      course: 0,
      section: 1,
      credit: 2,
      time: -1,
      faculty: -1,
      room: -1,
      capacity: -1,
      taken: -1,
      prereq: -1
    };

    headers.forEach((th, idx) => {
      const text = (th.textContent || '').trim().toLowerCase();
      if (text.includes('course') || text === 'code') colIdx.course = idx;
      else if (text.includes('section') || text === 'sec') colIdx.section = idx;
      else if (text.includes('credit') && !text.includes('max')) colIdx.credit = idx;
      else if (text.includes('timing') || text.includes('time') || text.includes('slot')) colIdx.time = idx;
      else if (text.includes('faculty') || text.includes('initial') || (th.getAttribute('ng-show') && th.getAttribute('ng-show').includes('isTBA'))) colIdx.faculty = idx;
      else if (text.includes('room')) colIdx.room = idx;
      else if (text.includes('capacity') || text.includes('cap')) colIdx.capacity = idx;
      else if (text.includes('taken') || text.includes('seat')) colIdx.taken = idx;
      else if (text.includes('prerequisite') || text.includes('pre')) colIdx.prereq = idx;
    });

    // Fallbacks if headers weren't found or text was empty
    const cellsCount = headers.length || table.querySelector('tbody tr, tr[ng-repeat]')?.querySelectorAll('td')?.length || 9;
    if (colIdx.time === -1) {
      colIdx.time = (cellsCount >= 10 || table.closest('.Two, .One, #div2')) ? 4 : 3;
    }
    if (colIdx.capacity === -1) {
      colIdx.capacity = (cellsCount >= 10 || table.closest('.Two, .One, #div2')) ? 7 : 6;
    }
    if (colIdx.taken === -1) {
      colIdx.taken = (cellsCount >= 10 || table.closest('.Two, .One, #div2')) ? 8 : 7;
    }
    if (colIdx.faculty === -1) {
      colIdx.faculty = (cellsCount >= 10 || table.closest('.Two, .One, #div2')) ? 5 : 4;
    }
    if (colIdx.room === -1) {
      colIdx.room = (cellsCount >= 10 || table.closest('.Two, .One, #div2')) ? 6 : 5;
    }

    return colIdx;
  }

  function processAdvisingFaculty(table) {
    if (!config.advisingFacultyEnabled) return;
    injectAdvisingBridge();

    // 1. Unhide native Faculty table header & data cells
    table.querySelectorAll('th[ng-show*="isTBA"], td[ng-show*="isTBA"]').forEach(el => {
      el.classList.add('ewu-revealed-col');
      el.style.setProperty('display', 'table-cell', 'important');
    });

    const headers = Array.from(table.querySelectorAll('th, tr:first-child td'));
    headers.forEach(th => {
      const text = (th.textContent || '').toLowerCase();
      if (text.includes('faculty') || text.includes('initial') || (th.getAttribute('ng-show') && (th.getAttribute('ng-show').includes('Status') || th.getAttribute('ng-show').includes('isTBA')))) {
        th.classList.add('ewu-revealed-col');
        th.style.setProperty('display', 'table-cell', 'important');
      }
    });

    const cols = getTableColumnIndices(table);
    const enrolled = getCurrentlyAdvisedCourses();

    // 2. Process each section row in the Available Courses tables
    const rows = table.querySelectorAll('tbody tr, tr[ng-repeat]');
    rows.forEach(row => {
      const repeatAttr = row.getAttribute('ng-repeat') || '';
      // Skip the right-hand enrolled table (AdvisingDataList) itself from clash marking
      if (repeatAttr.includes('AdvisingDataList')) {
        return;
      }

      const cells = row.querySelectorAll('td');
      if (cells.length < 2) return;

      const cCode = (cells[cols.course]?.textContent || cells[0]?.textContent || '').trim().toUpperCase();
      const sec = (cells[cols.section]?.textContent || cells[1]?.textContent || '').trim();
      if (!cCode || !sec || cCode.includes('{{')) return;

      const key = `${cCode}_${sec}`;
      const info = advisingFacultyLookup[key];

      // A. Reveal Faculty Initials
      const initial = (info && info.initial) || '';
      const nativeCell = row.querySelector('td[ng-show*="isTBA"]') || (cols.faculty !== -1 ? cells[cols.faculty] : null);
      if (nativeCell) {
        nativeCell.style.setProperty('display', 'table-cell', 'important');
        if (initial && !nativeCell.querySelector('.ewu-advising-faculty-badge')) {
          nativeCell.innerHTML = `<span class="ewu-advising-faculty-badge" title="${info && info.name ? 'Faculty: ' + info.name : 'Initial: ' + initial}">${initial}</span>`;
        }
      } else if (initial && !row.querySelector('.ewu-advising-faculty-badge')) {
        const badge = document.createElement('span');
        badge.className = 'ewu-advising-faculty-badge';
        badge.title = info && info.name ? `Faculty: ${info.name}` : `Initial: ${initial}`;
        badge.textContent = initial;
        cells[cols.section].appendChild(badge);
      }

      // B. Seat Capacity Check: Show FULL or Remaining Seats
      if (cols.capacity !== -1 && cols.taken !== -1 && cells.length > Math.max(cols.capacity, cols.taken)) {
        let cap = parseInt(row.dataset.ewuCap || '', 10);
        let taken = parseInt(row.dataset.ewuTaken || '', 10);

        if (isNaN(cap)) {
          const rawCap = (cells[cols.capacity]?.textContent || '').trim();
          cap = parseInt(rawCap, 10);
          if (!isNaN(cap)) row.dataset.ewuCap = String(cap);
        }

        const pill = cells[cols.taken]?.querySelector('.ewu-seat-pill');
        if (isNaN(taken)) {
          if (!pill) {
            const rawTaken = (cells[cols.taken]?.textContent || '').trim();
            taken = parseInt(rawTaken, 10);
            if (!isNaN(taken)) row.dataset.ewuTaken = String(taken);
          } else {
            const m = (pill.textContent || '').match(/\((\d+)\/(\d+)\)/);
            if (m) {
              taken = parseInt(m[1], 10);
              row.dataset.ewuTaken = String(taken);
            }
          }
        }

        if (!isNaN(cap) && !isNaN(taken)) {
          const isFull = taken >= cap;
          const rem = Math.max(0, cap - taken);
          const targetClass = isFull ? 'ewu-seat-pill full' : (rem <= 5 ? 'ewu-seat-pill low' : 'ewu-seat-pill open');
          const targetText = isFull ? `FULL (${taken}/${cap})` : `${rem} left (${taken}/${cap})`;

          if (isFull) {
            row.classList.add('ewu-row-full');
          } else {
            row.classList.remove('ewu-row-full');
          }

          if (pill) {
            if (pill.textContent !== targetText) pill.textContent = targetText;
            if (pill.className !== targetClass) pill.className = targetClass;
          } else {
            const newPill = document.createElement('span');
            newPill.className = targetClass;
            newPill.textContent = targetText;
            cells[cols.taken].innerHTML = '';
            cells[cols.taken].appendChild(newPill);
          }
        }
      }

      // C. Preemptive Schedule Clash Check
      const timing = (cols.time !== -1 && cells[cols.time] ? cells[cols.time].textContent : (info && info.time)) || '';
      const isAlreadyEnrolled = enrolled.some(e => e.courseCode === cCode);

      const targetCol = cells[cols.section] || cells[1];
      const existingClashPill = targetCol.querySelector('.ewu-clash-pill');
      const existingEnrolledPill = targetCol.querySelector('.ewu-enrolled-pill');

      if (isAlreadyEnrolled) {
        row.classList.add('ewu-row-enrolled');
        row.classList.remove('ewu-row-clash');
        if (existingClashPill) existingClashPill.remove();

        if (!existingEnrolledPill) {
          const enrolledPill = document.createElement('span');
          enrolledPill.className = 'ewu-enrolled-pill';
          enrolledPill.textContent = '✓ Enrolled';
          targetCol.appendChild(enrolledPill);
        }
      } else {
        row.classList.remove('ewu-row-enrolled');
        if (existingEnrolledPill) existingEnrolledPill.remove();

        let clashCourse = null;
        for (const adv of enrolled) {
          if (adv.timeSlot && timeSlotsClash(timing, adv.timeSlot)) {
            clashCourse = adv;
            break;
          }
        }

        if (clashCourse) {
          row.classList.add('ewu-row-clash');
          const targetText = `⚠️ Clashes: ${clashCourse.courseCode}`;
          const targetTitle = `Time clash with enrolled course ${clashCourse.courseCode} [${clashCourse.timeSlot}]`;

          if (existingClashPill) {
            if (existingClashPill.textContent !== targetText) existingClashPill.textContent = targetText;
            if (existingClashPill.title !== targetTitle) existingClashPill.title = targetTitle;
          } else {
            const clashPill = document.createElement('span');
            clashPill.className = 'ewu-clash-pill';
            clashPill.title = targetTitle;
            clashPill.textContent = targetText;
            targetCol.appendChild(clashPill);
          }
        } else {
          row.classList.remove('ewu-row-clash');
          if (existingClashPill) existingClashPill.remove();
        }
      }

      row.dataset.ewuAdvRevealed = 'true';
    });

    // Re-apply active filters to updated rows
    applyAdvisingFilters();
  }

  // =========================================================================
  // Advising Window Course Browser Dynamic Toolbar & Filtering
  // =========================================================================
  let advisingSearchQuery = '';
  let advisingOpenSeatsOnly = false;
  let advisingHideClashes = false;
  let advisingActiveDay = 'ALL';
  let advisingActiveTime = 'ALL';

  function getActiveTabInfo() {
    if (document.querySelector('.btn1.active')) return { key: 'One', name: 'F Grade Courses' };
    if (document.querySelector('.btn2.active')) return { key: 'Two', name: 'Recommended Courses' };
    if (document.querySelector('.btn3.active')) return { key: 'Three', name: 'D / D+ Courses' };
    if (document.querySelector('.btn4.active')) return { key: 'Four', name: 'Retakable Courses' };

    // Fallbacks by checking display style on the 4 containers (excluding #div1)
    const one = document.querySelector('.One');
    if (one && window.getComputedStyle(one).display !== 'none') return { key: 'One', name: 'F Grade Courses' };
    const two = document.querySelector('.Two');
    if (two && window.getComputedStyle(two).display !== 'none') return { key: 'Two', name: 'Recommended Courses' };
    const three = document.querySelector('.Three');
    if (three && window.getComputedStyle(three).display !== 'none') return { key: 'Three', name: 'D / D+ Courses' };
    const four = document.querySelector('.Four');
    if (four && window.getComputedStyle(four).display !== 'none') return { key: 'Four', name: 'Retakable Courses' };

    return { key: 'Two', name: 'Recommended Courses' };
  }

  function applyAdvisingFilters() {
    const activeInfo = getActiveTabInfo();
    const activeContainer = document.querySelector('.' + activeInfo.key);

    const browserTables = Array.from(document.querySelectorAll('.One table, .Two table, .Three table, .Four table, table.grid-table')).filter(t => {
      return !t.querySelector('tr[ng-repeat*="AdvisingDataList"]') && !t.closest('.col-lg-5');
    });

    if (browserTables.length === 0) return;

    let activeTabTotal = 0;
    let activeTabVisible = 0;

    const query = (advisingSearchQuery || '').trim().toLowerCase();
    const queryNorm = query.replace(/[\s\-_]+/g, '');

    browserTables.forEach(table => {
      const cols = getTableColumnIndices(table);
      const rows = Array.from(table.querySelectorAll('tbody tr, tr[ng-repeat]')).filter(r => !r.querySelector('th'));
      
      // Determine if this table belongs to the currently active tab
      const isInsideActiveTab = activeContainer ? (activeContainer === table || activeContainer.contains(table)) : (table.closest('.' + activeInfo.key) !== null);

      rows.forEach(row => {
        const repeatAttr = row.getAttribute('ng-repeat') || '';
        if (repeatAttr.includes('AdvisingDataList')) return;

        const cells = row.querySelectorAll('td');
        if (cells.length < 2) return;

        const cCode = (cells[cols.course]?.textContent || cells[0]?.textContent || '').trim().toUpperCase();
        const sec = (cells[cols.section]?.textContent || cells[1]?.textContent || '').trim();
        if (!cCode || cCode.includes('{{')) return;

        if (isInsideActiveTab) activeTabTotal++;

        const key = `${cCode}_${sec}`;
        const info = advisingFacultyLookup[key];

        // 1. Search Query Match
        let matchesQuery = true;
        if (query) {
          const rowText = (row.textContent || '').toLowerCase();
          const rowTextNorm = rowText.replace(/[\s\-_]+/g, '');
          const facName = (info && info.name ? info.name.toLowerCase() : '');
          const facInit = (info && info.initial ? info.initial.toLowerCase() : (cells[cols.faculty]?.textContent || '').toLowerCase());

          matchesQuery = rowText.includes(query) ||
                         rowTextNorm.includes(queryNorm) ||
                         facName.includes(query) ||
                         facInit.includes(query);
        }

        // 2. Open Seats Only Match
        let matchesOpen = true;
        if (advisingOpenSeatsOnly) {
          const isFull = row.classList.contains('ewu-row-full');
          const cap = parseInt(row.dataset.ewuCap || '', 10);
          const taken = parseInt(row.dataset.ewuTaken || '', 10);
          if (isFull || (!isNaN(cap) && !isNaN(taken) && taken >= cap)) {
            matchesOpen = false;
          }
        }

        // 3. No Time Clashes Match
        let matchesClash = true;
        if (advisingHideClashes) {
          const hasClash = row.classList.contains('ewu-row-clash') || row.querySelector('.ewu-clash-pill');
          if (hasClash) {
            matchesClash = false;
          }
        }

        // 4. Day Filter Match
        const timing = (cols.time !== -1 && cells[cols.time] ? cells[cols.time].textContent : '') || (info && info.time) || '';
        let matchesDay = true;
        if (advisingActiveDay !== 'ALL') {
          matchesDay = rowMatchesDay(timing, advisingActiveDay);
        }

        // 5. Time Filter Match
        let matchesTime = true;
        if (advisingActiveTime !== 'ALL') {
          matchesTime = rowMatchesTime(timing, advisingActiveTime);
        }

        const shouldShow = matchesQuery && matchesOpen && matchesClash && matchesDay && matchesTime;
        if (shouldShow) {
          row.style.display = '';
          if (isInsideActiveTab) activeTabVisible++;
        } else {
          row.style.display = 'none';
        }
      });
    });

    // Update Counter / Stats Pill
    const statsPill = document.getElementById('ewuAdvisingStatsPill');
    if (statsPill) {
      const isFiltered = query || advisingOpenSeatsOnly || advisingHideClashes || advisingActiveDay !== 'ALL' || advisingActiveTime !== 'ALL';
      const tabSuffix = activeInfo.name ? ` in ${activeInfo.name}` : '';
      if (isFiltered) {
        statsPill.textContent = `Showing ${activeTabVisible} of ${activeTabTotal} sections${tabSuffix}`;
        statsPill.style.color = activeTabVisible === 0 ? '#ef4444' : '#2563eb';
      } else {
        statsPill.textContent = `Showing all ${activeTabTotal} sections${tabSuffix}`;
        statsPill.style.color = '';
      }
    }

    // Clean up empty notices from inactive tab containers
    document.querySelectorAll('.ewu-adv-empty-state').forEach(el => {
      if (!activeContainer || !activeContainer.contains(el)) {
        el.style.display = 'none';
      }
    });

    // Handle Empty State Notice in active container
    if (activeContainer) {
      let emptyNotice = activeContainer.querySelector('.ewu-adv-empty-state');
      const isFiltered = query || advisingOpenSeatsOnly || advisingHideClashes || advisingActiveDay !== 'ALL' || advisingActiveTime !== 'ALL';
      if (activeTabVisible === 0 && activeTabTotal > 0 && isFiltered) {
        if (!emptyNotice) {
          emptyNotice = document.createElement('div');
          emptyNotice.className = 'ewu-adv-empty-state';
          emptyNotice.innerHTML = `
            <div style="font-size:22px;margin-bottom:6px;">🔍</div>
            <div><strong>No matching course sections found in ${activeInfo.name}.</strong></div>
            <div style="font-size:12px;margin-top:4px;color:#64748b;">Try adjusting your search terms or clearing active filters.</div>
            <button type="button" class="ewu-adv-reset-btn">Clear All Filters</button>
          `;
          emptyNotice.querySelector('.ewu-adv-reset-btn').addEventListener('click', resetAdvisingFilters);
          activeContainer.appendChild(emptyNotice);
        } else {
          emptyNotice.style.display = '';
        }
      } else if (emptyNotice) {
        emptyNotice.style.display = 'none';
      }
    }
  }

  function resetAdvisingFilters() {
    advisingSearchQuery = '';
    advisingOpenSeatsOnly = false;
    advisingHideClashes = false;
    advisingActiveDay = 'ALL';
    advisingActiveTime = 'ALL';

    const searchInput = document.getElementById('ewuAdvisingSearch');
    if (searchInput) searchInput.value = '';

    const clearBtn = document.getElementById('ewuAdvisingClearSearch');
    if (clearBtn) clearBtn.style.display = 'none';

    const openSeatsCheck = document.getElementById('ewuAdvOpenSeatsOnly');
    if (openSeatsCheck) openSeatsCheck.checked = false;

    const hideClashesCheck = document.getElementById('ewuAdvHideClashes');
    if (hideClashesCheck) hideClashesCheck.checked = false;

    document.querySelectorAll('.ewu-adv-chip[data-day]').forEach(c => {
      c.classList.toggle('active', c.dataset.day === 'ALL');
    });
    document.querySelectorAll('.ewu-adv-chip[data-time]').forEach(c => {
      c.classList.toggle('active', c.dataset.time === 'ALL');
    });

    applyAdvisingFilters();
  }

  function renderAdvisingCourseBrowserToolbar() {
    if (!config.advisingFacultyEnabled) return;

    let toolbar = document.getElementById('ewuAdvisingToolbar');
    if (toolbar) {
      applyAdvisingFilters();
      return;
    }

    const scrollContainer = document.querySelector('.row[style*="height:400px"], .row[style*="height: 400px"]') ||
                            document.getElementById('div1')?.closest('.row') ||
                            document.querySelector('.One, .Two')?.closest('.row');

    if (!scrollContainer || !scrollContainer.parentElement) return;

    toolbar = document.createElement('div');
    toolbar.id = 'ewuAdvisingToolbar';
    toolbar.className = 'ewu-advising-toolbar';
    toolbar.innerHTML = `
      <div class="ewu-advising-toolbar-top">
        <div class="ewu-advising-search-wrap">
          <span class="ewu-advising-search-icon">🔍</span>
          <input type="text" id="ewuAdvisingSearch" class="ewu-advising-search-input" placeholder="Search course code, section, faculty, room, timing..." autocomplete="off">
          <button type="button" id="ewuAdvisingClearSearch" class="ewu-advising-clear-btn" style="display:none;" title="Clear search">✕</button>
        </div>

        <div class="ewu-advising-toggles">
          <label class="ewu-adv-toggle" title="Show only sections with seats available">
            <input type="checkbox" id="ewuAdvOpenSeatsOnly">
            <span>🟢 Open Seats Only</span>
          </label>
          <label class="ewu-adv-toggle" title="Hide sections that clash with your enrolled courses">
            <input type="checkbox" id="ewuAdvHideClashes">
            <span>🛡️ No Time Clashes</span>
          </label>
        </div>

        <div class="ewu-advising-stats">
          <span id="ewuAdvisingStatsPill" class="ewu-advising-stats-pill">Calculating...</span>
        </div>
      </div>

      <div class="ewu-advising-toolbar-bottom">
        <div class="ewu-adv-chip-group">
          <span class="ewu-adv-chip-label">Day:</span>
          <button type="button" class="ewu-adv-chip active" data-day="ALL">All</button>
          <button type="button" class="ewu-adv-chip" data-day="ST">ST</button>
          <button type="button" class="ewu-adv-chip" data-day="MW">MW</button>
          <button type="button" class="ewu-adv-chip" data-day="SR">SR</button>
          <button type="button" class="ewu-adv-chip" data-day="TR">TR</button>
          <button type="button" class="ewu-adv-chip" data-day="RA">RA</button>
          <button type="button" class="ewu-adv-chip" data-day="F">Fri</button>
        </div>
        <div class="ewu-adv-chip-group" style="margin-left: auto;">
          <span class="ewu-adv-chip-label">Time:</span>
          <button type="button" class="ewu-adv-chip active" data-time="ALL">All</button>
          <button type="button" class="ewu-adv-chip" data-time="08:30">08:30 AM</button>
          <button type="button" class="ewu-adv-chip" data-time="10:10">10:10 AM</button>
          <button type="button" class="ewu-adv-chip" data-time="11:50">11:50 AM</button>
          <button type="button" class="ewu-adv-chip" data-time="01:30">01:30 PM</button>
          <button type="button" class="ewu-adv-chip" data-time="03:10">03:10 PM+</button>
        </div>
      </div>
    `;

    scrollContainer.parentElement.insertBefore(toolbar, scrollContainer);

    const searchInput = toolbar.querySelector('#ewuAdvisingSearch');
    const clearBtn = toolbar.querySelector('#ewuAdvisingClearSearch');
    const openSeatsCheck = toolbar.querySelector('#ewuAdvOpenSeatsOnly');
    const hideClashesCheck = toolbar.querySelector('#ewuAdvHideClashes');

    searchInput.addEventListener('input', (e) => {
      advisingSearchQuery = e.target.value;
      clearBtn.style.display = advisingSearchQuery ? 'block' : 'none';
      applyAdvisingFilters();
    });

    clearBtn.addEventListener('click', () => {
      searchInput.value = '';
      advisingSearchQuery = '';
      clearBtn.style.display = 'none';
      searchInput.focus();
      applyAdvisingFilters();
    });

    openSeatsCheck.addEventListener('change', (e) => {
      advisingOpenSeatsOnly = e.target.checked;
      applyAdvisingFilters();
    });

    hideClashesCheck.addEventListener('change', (e) => {
      advisingHideClashes = e.target.checked;
      applyAdvisingFilters();
    });

    toolbar.querySelectorAll('.ewu-adv-chip[data-day]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        toolbar.querySelectorAll('.ewu-adv-chip[data-day]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        advisingActiveDay = btn.dataset.day || 'ALL';
        applyAdvisingFilters();
      });
    });

    toolbar.querySelectorAll('.ewu-adv-chip[data-time]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        toolbar.querySelectorAll('.ewu-adv-chip[data-time]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        advisingActiveTime = btn.dataset.time || 'ALL';
        applyAdvisingFilters();
      });
    });

    // Delegate tab switching clicks on the document
    document.addEventListener('click', (e) => {
      const tabBtn = e.target.closest('.btn1, .btn2, .btn3, .btn4');
      if (tabBtn) {
        applyAdvisingFilters();
        setTimeout(applyAdvisingFilters, 50);
        setTimeout(applyAdvisingFilters, 200);
        setTimeout(applyAdvisingFilters, 550);
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === '/' && document.activeElement !== searchInput && !['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) {
        e.preventDefault();
        searchInput.focus();
        searchInput.select();
      } else if (e.key === 'Escape' && document.activeElement === searchInput) {
        searchInput.blur();
      }
    });

    applyAdvisingFilters();
  }

  // =========================================================================
  // FEATURE 7: Interactive "What-If" CGPA & Target Planner (v1.5.0)
  // =========================================================================
  const EWU_GRADE_POINTS = {
    'A+': 4.00, 'A': 4.00, 'A-': 3.70,
    'B+': 3.30, 'B': 3.00, 'B-': 2.70,
    'C+': 2.30, 'C': 2.00, 'C-': 1.70,
    'D+': 1.30, 'D': 1.00,
    'F': 0.00
  };

  let simulatedRetakes = [];
  let userDegreeTotalCredits = 136.0;
  let userTargetCGPA = 3.75;

  function extractDegreeReviewCourses() {
    const completedCoursesMap = new Map();
    const tables = Array.from(document.querySelectorAll('table')).filter(t => 
      !t.classList.contains('ewu-summary-table') && 
      !t.closest('#ewuCgpaCard') && 
      !t.closest('.ewu-basket-drawer')
    );

    tables.forEach(table => {
      const rows = Array.from(table.querySelectorAll('tr'));
      rows.forEach(row => {
        const cells = Array.from(row.querySelectorAll('td, th'));
        if (cells.length < 3) return;

        const rowText = row.textContent || '';
        if (rowText.toLowerCase().includes('grand total') || (rowText.toLowerCase().includes('total') && cells.length < 5)) {
          return;
        }

        // 1. Find Course Code (e.g. BUS101, CSE110, ENG101, MAT101, ACT101, etc.)
        let code = '';
        let codeIdx = -1;
        cells.forEach((cell, idx) => {
          if (code) return;
          const txt = cell.textContent.trim().toUpperCase();
          const match = txt.match(/\b([A-Z]{2,4}\s*\d{3}[A-Z]?)\b/);
          if (match) {
            code = match[1].replace(/\s+/g, '');
            codeIdx = idx;
          }
        });
        if (!code) return;

        // 2. Find Letter Grade & Factor
        let grade = '';
        let factor = NaN;
        cells.forEach((cell, idx) => {
          if (grade || idx === codeIdx) return;
          const txt = cell.textContent.trim().toUpperCase();
          if (EWU_GRADE_POINTS[txt] !== undefined) {
            grade = txt;
            factor = EWU_GRADE_POINTS[txt];
          }
        });

        // Skip if not a standard graded course (e.g. W, I, P, S, or in-progress)
        if (!grade || isNaN(factor)) return;

        // 3. Find Credit
        let credit = 3.0; // default EWU course credit
        for (let i = 0; i < cells.length; i++) {
          if (i === codeIdx) continue;
          const txt = cells[i].textContent.trim();
          const val = parseFloat(txt);
          if (!isNaN(val) && (val === 1.0 || val === 1.5 || val === 2.0 || val === 3.0 || val === 4.0 || val === 6.0)) {
            const cellUpper = cells[i].textContent.trim().toUpperCase();
            if (cellUpper !== grade && val !== factor) {
              credit = val;
              break;
            }
          }
        }

        // 4. Find Title
        let title = '';
        if (codeIdx + 1 < cells.length) {
          const nextTxt = cells[codeIdx + 1].textContent.trim();
          if (nextTxt.length > 2 && isNaN(parseFloat(nextTxt))) {
            title = nextTxt;
          }
        }
        if (!title) {
          cells.forEach((c, idx) => {
            if (idx === codeIdx) return;
            const t = c.textContent.trim();
            if (t.length > title.length && isNaN(parseFloat(t)) && !EWU_GRADE_POINTS[t.toUpperCase()]) {
              title = t;
            }
          });
        }

        // Deduplicate: if course was retaken in past, keep the one with higher factor
        if (completedCoursesMap.has(code)) {
          const existing = completedCoursesMap.get(code);
          if (factor > existing.factor) {
            completedCoursesMap.set(code, { code, title, credit, grade, factor, points: credit * factor });
          }
        } else {
          completedCoursesMap.set(code, { code, title, credit, grade, factor, points: credit * factor });
        }
      });
    });

    return Array.from(completedCoursesMap.values());
  }

  function processDegreeReviewPage() {
    if (!config.cgpaEnabled) {
      const existing = document.getElementById('ewuCgpaCard');
      if (existing) existing.remove();
      return;
    }

    const completedCourses = extractDegreeReviewCourses();
    if (completedCourses.length === 0) return;

    // Sort alphabetically so student can find any course easily
    completedCourses.sort((a, b) => a.code.localeCompare(b.code));

    const signature = completedCourses.map(c => `${c.code}:${c.grade}:${c.credit}`).join('|');
    let card = document.getElementById('ewuCgpaCard');

    // Signature check: DO NOT rewrite innerHTML if already mounted and courses haven't changed!
    if (card && card.dataset.coursesSignature === signature) {
      return;
    }

    // Clean up any rogue/duplicate cards
    const existingCards = document.querySelectorAll('#ewuCgpaCard');
    if (existingCards.length > 1) {
      for (let i = 1; i < existingCards.length; i++) existingCards[i].remove();
    }

    const firstTable = document.querySelector('table');
    if (!firstTable) return;
    const mountContainer = firstTable.closest('.ewu-degreereview-responsive') || firstTable;

    if (!card) {
      card = document.createElement('div');
      card.id = 'ewuCgpaCard';
      card.className = 'ewu-cgpa-card';
      mountContainer.parentElement.insertBefore(card, mountContainer);
    }

    card.dataset.coursesSignature = signature;

    let totalGradedCredits = 0;
    let totalEarnedPoints = 0;
    completedCourses.forEach(c => {
      totalGradedCredits += c.credit;
      totalEarnedPoints += c.points;
    });
    const currentCGPA = totalGradedCredits > 0 ? (totalEarnedPoints / totalGradedCredits) : 0;

    renderCgpaCardUI(card, completedCourses, totalGradedCredits, totalEarnedPoints, currentCGPA);
  }

  function renderCgpaCardUI(card, courses, totalCredits, totalPoints, currentCGPA) {
    card.innerHTML = `
      <div class="ewu-cgpa-header">
        <div class="ewu-cgpa-title-group">
          <h3>🎓 <span>CGPA & Retake Simulator</span></h3>
        </div>
        <div class="ewu-cgpa-header-pills">
          <span class="ewu-cgpa-stat-pill">Current CGPA: <strong>${currentCGPA.toFixed(2)}</strong></span>
          <span class="ewu-cgpa-stat-pill">Completed: <strong>${totalCredits.toFixed(1)} Cr</strong></span>
          <span class="ewu-cgpa-stat-pill">Total Points: <strong>${totalPoints.toFixed(1)}</strong></span>
        </div>
      </div>

      <div class="ewu-cgpa-tabs">
        <button type="button" class="ewu-cgpa-tab-btn active" id="ewuTabBtnRetake">🔄 Retake Simulator</button>
        <button type="button" class="ewu-cgpa-tab-btn" id="ewuTabBtnTarget">🎯 Target CGPA Planner</button>
      </div>

      <!-- Tab 1: Retake Simulator -->
      <div class="ewu-cgpa-pane active" id="ewuPaneRetake">
        <div class="ewu-cgpa-retake-controls">
          <select id="ewuRetakeCourseSelect" style="flex: 1; min-width: 220px;">
            <option value="">-- Choose course to simulate retake --</option>
            ${courses.map(c => `<option value="${c.code}">${c.code} ${c.title ? '- ' + c.title.slice(0, 24) : ''} (Current: ${c.grade} • ${c.factor.toFixed(2)}) [${c.credit} cr]</option>`).join('')}
          </select>

          <select id="ewuRetakeGradeSelect" style="width: 140px;">
            <option value="4.00,A">A (4.00)</option>
            <option value="3.70,A-">A- (3.70)</option>
            <option value="3.30,B+">B+ (3.30)</option>
            <option value="3.00,B">B (3.00)</option>
            <option value="2.70,B-">B- (2.70)</option>
            <option value="2.30,C+">C+ (2.30)</option>
          </select>

          <button type="button" class="ewu-cgpa-add-btn" id="ewuAddRetakeBtn">+ Simulate Retake</button>
        </div>

        <div id="ewuSimulatedRetakesList" style="margin-bottom: 8px; display: none; flex-direction: column; gap: 4px;"></div>

        <div id="ewuSimulatedCgpaBanner" class="ewu-cgpa-simulated-banner"></div>
      </div>

      <!-- Tab 2: Target CGPA Planner -->
      <div class="ewu-cgpa-pane" id="ewuPaneTarget">
        <div class="ewu-cgpa-target-form" style="margin-bottom: 8px;">
          <div class="ewu-cgpa-field">
            <label>Total Degree Credits</label>
            <input type="number" id="ewuDegreeCreditsInput" value="${userDegreeTotalCredits}" step="0.5" min="${totalCredits}">
          </div>
          <div class="ewu-cgpa-field">
            <label>Target Graduation CGPA</label>
            <input type="number" id="ewuTargetCgpaInput" value="${userTargetCGPA}" step="0.01" min="1.0" max="4.0">
          </div>
        </div>

        <div id="ewuTargetResultBox" style="font-size: 13px; padding: 10px 14px; border-radius: 8px;"></div>
      </div>
    `;

    const tabRetake = card.querySelector('#ewuTabBtnRetake');
    const tabTarget = card.querySelector('#ewuTabBtnTarget');
    const paneRetake = card.querySelector('#ewuPaneRetake');
    const paneTarget = card.querySelector('#ewuPaneTarget');

    tabRetake.addEventListener('click', () => {
      tabRetake.classList.add('active');
      tabTarget.classList.remove('active');
      paneRetake.classList.add('active');
      paneTarget.classList.remove('active');
    });

    tabTarget.addEventListener('click', () => {
      tabTarget.classList.add('active');
      tabRetake.classList.remove('active');
      paneTarget.classList.add('active');
      paneRetake.classList.remove('active');
      calculateTargetCGPA();
    });

    function updateRetakesView() {
      let deltaPoints = 0;
      simulatedRetakes.forEach(r => {
        deltaPoints += (r.credit * (r.newFactor - r.oldFactor));
      });
      const simulatedCGPA = totalCredits > 0 ? ((totalPoints + deltaPoints) / totalCredits) : currentCGPA;
      const cgpaDiff = simulatedCGPA - currentCGPA;

      const listEl = card.querySelector('#ewuSimulatedRetakesList');
      if (listEl) {
        if (simulatedRetakes.length > 0) {
          listEl.style.display = 'flex';
          listEl.innerHTML = simulatedRetakes.map((r, idx) => `
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 5px 10px; background: rgba(79, 70, 229, 0.08); border-radius: 6px; font-size: 12.5px;">
              <span><strong>${r.code}</strong> (${r.credit} cr): Replaced <strong>${r.oldGrade}</strong> (${r.oldFactor.toFixed(2)}) with <strong>${r.newGrade}</strong> (${r.newFactor.toFixed(2)}) &bull; +${(r.credit * (r.newFactor - r.oldFactor)).toFixed(1)} pts</span>
              <button type="button" class="ewu-remove-retake-btn" data-idx="${idx}" style="background:none;border:none;color:#ef4444;cursor:pointer;font-weight:700;font-size:14px;line-height:1;" title="Remove this retake">✕</button>
            </div>
          `).join('');

          listEl.querySelectorAll('.ewu-remove-retake-btn').forEach(btn => {
            btn.addEventListener('click', () => {
              const i = parseInt(btn.dataset.idx, 10);
              if (!isNaN(i)) {
                simulatedRetakes.splice(i, 1);
                updateRetakesView();
              }
            });
          });
        } else {
          listEl.style.display = 'none';
          listEl.innerHTML = '';
        }
      }

      const bannerEl = card.querySelector('#ewuSimulatedCgpaBanner');
      if (bannerEl) {
        bannerEl.innerHTML = `
          <div>
            Current CGPA: <strong>${currentCGPA.toFixed(2)}</strong> &rarr; Simulated CGPA: <strong style="font-size: 15px; color: #10b981;">${simulatedCGPA.toFixed(2)}</strong>
            ${cgpaDiff > 0 ? `<span style="margin-left: 8px; padding: 2px 7px; background: #10b981; color: white; border-radius: 9999px; font-size: 11px;">+${cgpaDiff.toFixed(2)} Boost!</span>` : ''}
          </div>
          ${simulatedRetakes.length > 0 ? `<button type="button" id="ewuResetRetakesBtn" style="background:none;border:1px solid #cbd5e1;border-radius:4px;padding:2px 6px;cursor:pointer;font-size:11px;">Reset All</button>` : ''}
        `;

        const resetBtn = bannerEl.querySelector('#ewuResetRetakesBtn');
        if (resetBtn) {
          resetBtn.addEventListener('click', () => {
            simulatedRetakes = [];
            updateRetakesView();
          });
        }
      }

      calculateTargetCGPA();
    }

    const addRetakeBtn = card.querySelector('#ewuAddRetakeBtn');
    const courseSelect = card.querySelector('#ewuRetakeCourseSelect');
    const gradeSelect = card.querySelector('#ewuRetakeGradeSelect');

    addRetakeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const selectedCode = courseSelect.value;
      if (!selectedCode) return;
      const targetCourse = courses.find(c => c.code === selectedCode);
      if (!targetCourse) return;

      const [ptStr, grStr] = gradeSelect.value.split(',');
      const newPt = parseFloat(ptStr);
      if (isNaN(newPt)) return;

      const existingIdx = simulatedRetakes.findIndex(r => r.code === targetCourse.code);
      if (existingIdx !== -1) {
        simulatedRetakes[existingIdx].newGrade = grStr;
        simulatedRetakes[existingIdx].newFactor = newPt;
      } else {
        simulatedRetakes.push({
          code: targetCourse.code,
          title: targetCourse.title,
          credit: targetCourse.credit,
          oldGrade: targetCourse.grade,
          oldFactor: targetCourse.factor,
          newGrade: grStr,
          newFactor: newPt
        });
      }

      updateRetakesView();
    });

    function calculateTargetCGPA() {
      const degCrInput = card.querySelector('#ewuDegreeCreditsInput');
      const tgtCgpaInput = card.querySelector('#ewuTargetCgpaInput');
      const resultBox = card.querySelector('#ewuTargetResultBox');
      if (!degCrInput || !tgtCgpaInput || !resultBox) return;

      userDegreeTotalCredits = parseFloat(degCrInput.value) || 136.0;
      userTargetCGPA = parseFloat(tgtCgpaInput.value) || 3.75;

      let deltaPoints = 0;
      simulatedRetakes.forEach(r => {
        deltaPoints += (r.credit * (r.newFactor - r.oldFactor));
      });

      const remCredits = Math.max(0, userDegreeTotalCredits - totalCredits);
      if (remCredits <= 0) {
        resultBox.className = 'ewu-cgpa-target-result success';
        resultBox.innerHTML = `🎓 <strong>Completed Degree:</strong> You have reached or exceeded your degree credit requirements!`;
        return;
      }

      const totalNeededPoints = userTargetCGPA * userDegreeTotalCredits;
      const pointsRemaining = totalNeededPoints - (totalPoints + deltaPoints);
      const requiredAverageGPA = pointsRemaining / remCredits;

      if (requiredAverageGPA <= 0) {
        resultBox.className = 'ewu-cgpa-target-result success';
        resultBox.innerHTML = `🎉 <strong>Target Surpassed:</strong> You have already secured enough grade points to graduate with a <strong>${userTargetCGPA.toFixed(2)}</strong> CGPA!`;
      } else if (requiredAverageGPA <= 4.00) {
        resultBox.className = 'ewu-cgpa-target-result success';
        resultBox.innerHTML = `🎯 <strong>Achievable Goal:</strong> To graduate with a <strong>${userTargetCGPA.toFixed(2)}</strong> CGPA, you need an average GPA of <strong style="font-size: 15px; color: #10b981;">${requiredAverageGPA.toFixed(2)}</strong> across your remaining <strong>${remCredits.toFixed(1)}</strong> credits.`;
      } else {
        resultBox.className = 'ewu-cgpa-target-result warning';
        resultBox.innerHTML = `⚠️ <strong>Retakes Required:</strong> A target CGPA of <strong>${userTargetCGPA.toFixed(2)}</strong> requires an average GPA of <strong style="color: #ef4444;">${requiredAverageGPA.toFixed(2)}</strong> (> 4.00 max) in remaining credits. Switch to the <strong>Retake Simulator</strong> tab to simulate replacing C/D/F grades to boost your baseline.`;
      }
    }

    const degCrInput = card.querySelector('#ewuDegreeCreditsInput');
    const tgtCgpaInput = card.querySelector('#ewuTargetCgpaInput');
    if (degCrInput) degCrInput.addEventListener('input', calculateTargetCGPA);
    if (tgtCgpaInput) tgtCgpaInput.addEventListener('input', calculateTargetCGPA);

    updateRetakesView();
  }

  // =========================================================================
  // Master Dispatcher
  // =========================================================================
  function runEnhancements() {
    ensureMobileViewport();
    applyTheme();
    injectPortalSidebarSettings();
    processLoginCaptcha();
    const path = window.location.pathname.toLowerCase();
    const tables = document.querySelectorAll('table');

    // If not on offered courses, ensure advising basket drawer is hidden
    if (!path.includes('offeredcourses') && !document.querySelector('[ng-repeat*="OfferedCourse"]')) {
      const basketDrawer = document.getElementById('ewuCourseBasketDrawer');
      if (basketDrawer) basketDrawer.style.display = 'none';
      document.body.classList.remove('has-ewu-basket');
    }

    tables.forEach((table) => {
      // Skip internal summary table or injected widget cards
      if (table.classList.contains('ewu-summary-table') || table.closest('.ewu-ledger-summary-card') || table.closest('.ewu-cgpa-card') || table.closest('.ewu-basket-drawer')) {
        return;
      }
      // 1. Class Schedule & Advising
      if (!path.includes('facultyevaluation') && !path.includes('offeredcourses') && !path.includes('studentledger') && !path.includes('degreereview')) {
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

      // 5. Advising Window Faculty Revealer
      if (path.includes('advising')) {
        processAdvisingFaculty(table);
      }
    });

    // 5b. Advising Window Course Browser Dynamic Toolbar
    if (path.includes('advising')) {
      renderAdvisingCourseBrowserToolbar();
    }

    // 4. Degree Review / "What-If" CGPA & Target Planner (page-level single card)
    if (path.includes('degreereview') || document.querySelector('[ng-repeat*="DegreeReview"]') || document.querySelector('[ng-repeat*="CompletedCourse"]')) {
      processDegreeReviewPage();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runEnhancements);
  } else {
    runEnhancements();
  }

  let debounceTimer = null;
  const observer = new MutationObserver((mutations) => {
    const isOnlyOurOwnBadges = mutations.every(m => {
      const t = m.target;
      return t && t.nodeType === 1 && (
        t.classList.contains('ewu-seat-pill') ||
        t.classList.contains('ewu-clash-pill') ||
        t.classList.contains('ewu-enrolled-pill') ||
        t.classList.contains('ewu-advising-faculty-badge') ||
        t.classList.contains('ewu-advising-toolbar') ||
        t.classList.contains('ewu-adv-chip') ||
        t.classList.contains('ewu-adv-toggle') ||
        (t.closest && t.closest('.ewu-seat-pill, .ewu-clash-pill, .ewu-enrolled-pill, .ewu-advising-faculty-badge, .ewu-advising-toolbar, .ewu-adv-empty-state'))
      );
    });
    if (isOnlyOurOwnBadges) return;

    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(runEnhancements, 120);
  });

  observer.observe(document.body, { childList: true, subtree: true });

  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
    chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
      if (msg.action === 'toggleFeature') {
        if (msg.feature === 'schedule') config.scheduleEnabled = msg.enabled;
        if (msg.feature === 'offered') config.offeredEnabled = msg.enabled;
        if (msg.feature === 'ledger') config.ledgerEnabled = msg.enabled;
        if (msg.feature === 'routine') config.routineEnabled = msg.enabled;
        if (msg.feature === 'captcha') config.captchaEnabled = msg.enabled;
        runEnhancements();
        sendResponse({ success: true, config });
      }
    });
  }

  // Automatic background update check trigger for Chrome Extension
  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id && chrome.storage && chrome.storage.local) {
    chrome.storage.local.get(['ewu_last_update_check'], (res) => {
      const lastCheck = res ? res.ewu_last_update_check : 0;
      const FOUR_HOURS = 4 * 60 * 60 * 1000;
      if (!lastCheck || (Date.now() - lastCheck > FOUR_HOURS)) {
        try {
          chrome.runtime.sendMessage({ action: 'check_for_updates', force: false }, () => {
            if (chrome.runtime.lastError) {}
          });
        } catch(e) {}
      }
    });
  }
})();
