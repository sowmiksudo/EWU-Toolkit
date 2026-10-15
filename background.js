// =========================================================================
// EWU-Toolkit - Background Service Worker (Manifest V3)
// =========================================================================
// Clicking the extension toolbar icon redirects directly to the open source
// repository on GitHub, as settings are natively integrated in the portal sidebar.

chrome.action.onClicked.addListener((tab) => {
  chrome.tabs.create({
    url: 'https://github.com/sowmiksudo/EWU-Toolkit'
  });
});
