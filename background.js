// =========================================================================
// EWU-Toolkit - Background Service Worker (Manifest V3)
// =========================================================================

// Clicking the extension toolbar icon redirects directly to the GitHub repository.
chrome.action.onClicked.addListener((tab) => {
  chrome.tabs.create({
    url: 'https://github.com/sowmiksudo/EWU-Toolkit'
  });
});

// Semantic version comparator: returns 1 if v1 > v2, -1 if v1 < v2, 0 if equal
function compareVersions(v1, v2) {
  const p1 = (v1 || '').replace(/^v/, '').split('.').map(n => parseInt(n, 10) || 0);
  const p2 = (v2 || '').replace(/^v/, '').split('.').map(n => parseInt(n, 10) || 0);
  const len = Math.max(p1.length, p2.length);
  for (let i = 0; i < len; i++) {
    const a = p1[i] || 0;
    const b = p2[i] || 0;
    if (a > b) return 1;
    if (a < b) return -1;
  }
  return 0;
}

// Background update checker against GitHub Releases API
async function checkForUpdates(force = false) {
  const currentVersion = chrome.runtime.getManifest().version;
  const now = Date.now();
  const CHECK_INTERVAL_MS = 4 * 60 * 60 * 1000; // 4 hours

  if (!force) {
    const cached = await chrome.storage.local.get([
      'ewu_last_update_check',
      'ewu_update_available',
      'ewu_latest_version',
      'ewu_release_url'
    ]);
    if (cached.ewu_last_update_check && (now - cached.ewu_last_update_check < CHECK_INTERVAL_MS)) {
      return {
        currentVersion,
        latestVersion: cached.ewu_latest_version || currentVersion,
        updateAvailable: !!cached.ewu_update_available,
        releaseUrl: cached.ewu_release_url || 'https://github.com/sowmiksudo/EWU-Toolkit/releases',
        lastChecked: cached.ewu_last_update_check,
        fromCache: true
      };
    }
  }

  try {
    const res = await fetch('https://api.github.com/repos/sowmiksudo/EWU-Toolkit/releases/latest', {
      headers: {
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (!res.ok) {
      throw new Error(`GitHub API returned status ${res.status}`);
    }

    const data = await res.json();
    const rawTag = data.tag_name || '';
    const latestVersion = rawTag.replace(/^v/, '');
    const releaseUrl = data.html_url || 'https://github.com/sowmiksudo/EWU-Toolkit/releases';

    const isNewer = compareVersions(latestVersion, currentVersion) > 0;

    await chrome.storage.local.set({
      ewu_last_update_check: now,
      ewu_update_available: isNewer,
      ewu_latest_version: latestVersion,
      ewu_release_url: releaseUrl
    });

    if (isNewer) {
      chrome.action.setBadgeText({ text: 'NEW' });
      chrome.action.setBadgeBackgroundColor({ color: '#2563eb' });
      chrome.action.setTitle({ title: `EWU-Toolkit update available: v${latestVersion}` });
    } else {
      chrome.action.setBadgeText({ text: '' });
      chrome.action.setTitle({ title: 'EWU-Toolkit (Open Source on GitHub)' });
    }

    return {
      currentVersion,
      latestVersion,
      updateAvailable: isNewer,
      releaseUrl,
      lastChecked: now,
      fromCache: false
    };
  } catch (err) {
    console.warn('[EWU-Toolkit] Update check failed:', err);
    const fallback = await chrome.storage.local.get([
      'ewu_update_available',
      'ewu_latest_version',
      'ewu_release_url'
    ]);
    return {
      currentVersion,
      latestVersion: fallback.ewu_latest_version || currentVersion,
      updateAvailable: !!fallback.ewu_update_available,
      releaseUrl: fallback.ewu_release_url || 'https://github.com/sowmiksudo/EWU-Toolkit/releases',
      lastChecked: now,
      error: err.message
    };
  }
}

// Check on install or reload
chrome.runtime.onInstalled.addListener(() => {
  checkForUpdates(true);
});

// Check on browser startup
chrome.runtime.onStartup.addListener(() => {
  checkForUpdates(false);
});

// Respond to messages from content script
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg && msg.action === 'check_for_updates') {
    checkForUpdates(!!msg.force).then(sendResponse);
    return true; // Keep message channel open for async response
  }
  if (msg && msg.action === 'get_update_status') {
    chrome.storage.local.get([
      'ewu_last_update_check',
      'ewu_update_available',
      'ewu_latest_version',
      'ewu_release_url'
    ]).then(data => {
      const currentVersion = chrome.runtime.getManifest().version;
      sendResponse({
        currentVersion,
        latestVersion: data.ewu_latest_version || currentVersion,
        updateAvailable: !!data.ewu_update_available,
        releaseUrl: data.ewu_release_url || 'https://github.com/sowmiksudo/EWU-Toolkit/releases',
        lastChecked: data.ewu_last_update_check || null
      });
    });
    return true;
  }
});
