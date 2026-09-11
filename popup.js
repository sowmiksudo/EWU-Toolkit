document.addEventListener('DOMContentLoaded', () => {
  const toggleSchedule = document.getElementById('toggleSchedule');
  const toggleOffered = document.getElementById('toggleOffered');
  const toggleEval = document.getElementById('toggleEval');
  const toggleLedger = document.getElementById('toggleLedger');
  const toggleLicenseBtn = document.getElementById('toggleLicenseBtn');
  const licenseNotice = document.getElementById('licenseNotice');

  if (toggleLicenseBtn && licenseNotice) {
    toggleLicenseBtn.addEventListener('click', () => {
      licenseNotice.classList.toggle('hidden');
      toggleLicenseBtn.textContent = licenseNotice.classList.contains('hidden') 
        ? '📄 License' 
        : '✖ Close';
    });
  }

  // Load saved toggles
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    chrome.storage.local.get({
      ewu_schedule_enabled: true,
      ewu_offered_enabled: true,
      ewu_eval_enabled: true,
      ewu_ledger_enabled: true
    }, (res) => {
      toggleSchedule.checked = res.ewu_schedule_enabled !== false;
      toggleOffered.checked = res.ewu_offered_enabled !== false;
      toggleEval.checked = res.ewu_eval_enabled !== false;
      toggleLedger.checked = res.ewu_ledger_enabled !== false;
    });
  }

  function handleToggle(key, feature, checkbox) {
    checkbox.addEventListener('change', () => {
      const enabled = checkbox.checked;
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.set({ [key]: enabled });
      }
      if (typeof chrome !== 'undefined' && chrome.tabs) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs[0] && tabs[0].id) {
            chrome.tabs.sendMessage(tabs[0].id, { action: 'toggleFeature', feature, enabled });
          }
        });
      }
    });
  }

  handleToggle('ewu_schedule_enabled', 'schedule', toggleSchedule);
  handleToggle('ewu_offered_enabled', 'offered', toggleOffered);
  handleToggle('ewu_eval_enabled', 'eval', toggleEval);
  handleToggle('ewu_ledger_enabled', 'ledger', toggleLedger);
});
