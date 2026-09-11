document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('toggleExtension');
  const statusIndicator = document.querySelector('.status-indicator');
  const statusText = document.getElementById('statusText');
  const openPortalBtn = document.getElementById('openPortalBtn');

  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    chrome.storage.local.get({ ewu_enabled: true }, (res) => {
      const enabled = res.ewu_enabled !== false;
      toggle.checked = enabled;
      updateUI(enabled);
    });
  }

  toggle.addEventListener('change', () => {
    const enabled = toggle.checked;
    updateUI(enabled);

    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ ewu_enabled: enabled });
    }

    if (typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0] && tabs[0].id) {
          chrome.tabs.sendMessage(tabs[0].id, { action: 'toggle', enabled });
        }
      });
    }
  });

  function updateUI(enabled) {
    if (enabled) {
      statusIndicator.classList.remove('disabled');
      statusText.textContent = 'Active';
    } else {
      statusIndicator.classList.add('disabled');
      statusText.textContent = 'Paused';
    }
  }

  openPortalBtn.addEventListener('click', (e) => {
    e.preventDefault();
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.create({ url: 'https://portal.ewubd.edu/Home/ClassSchedule' });
    } else {
      window.open('https://portal.ewubd.edu/Home/ClassSchedule', '_blank');
    }
  });
});
