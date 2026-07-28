// Helper to update the extension icon badge contextually
async function updateBadgeContextually(tabId, url) {
  if (!url || !url.startsWith('http')) {
    chrome.action.setBadgeText({ text: "", tabId });
    return;
  }
  
  try {
    const hostname = new URL(url).hostname;
    const data = await chrome.storage.local.get(['isEnabled', 'targetDomains']);
    
    // Default config logic if empty
    const isEnabled = data.isEnabled !== false;
    let targetDomains = data.targetDomains;
    
    // Fallback for migration edge cases
    if (!targetDomains) {
      const oldData = await chrome.storage.local.get('targetDomain');
      targetDomains = oldData.targetDomain ? [oldData.targetDomain] : ['notebooklm.google.com'];
    }

    if (targetDomains.includes(hostname)) {
      chrome.action.setBadgeText({ text: isEnabled ? "ON" : "OFF", tabId });
      chrome.action.setBadgeBackgroundColor({ color: isEnabled ? "#4CAF50" : "#F44336", tabId });
    } else {
      chrome.action.setBadgeText({ text: "", tabId });
    }
  } catch (e) {
    chrome.action.setBadgeText({ text: "", tabId });
  }
}

// When a tab URL changes
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url || changeInfo.status === 'complete') {
    updateBadgeContextually(tabId, tab.url);
  }
});

// When the user switches to a different tab
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  try {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    if (tab) {
      updateBadgeContextually(tab.id, tab.url);
    }
  } catch (e) {
    // Tab might be closed or unavailable
  }
});

// On install, just clear the global badge, we will rely on contextual badges
chrome.runtime.onInstalled.addListener(() => {
  chrome.action.setBadgeText({ text: "" });
  chrome.storage.local.set({ isEnabled: true });
});
