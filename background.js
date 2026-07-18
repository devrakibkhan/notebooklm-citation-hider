chrome.action.onClicked.addListener(async (tab) => {
  // Get current state, defaulting to true
  const { isEnabled = true } = await chrome.storage.local.get("isEnabled");
  const newState = !isEnabled;
  
  // Save new state
  await chrome.storage.local.set({ isEnabled: newState });

  // Update badge UI
  updateBadge(newState);

  // Send message to the tab where the user clicked the icon
  chrome.tabs.sendMessage(tab.id, { action: "toggle", isEnabled: newState }).catch(() => {});
});

// Helper to update the extension icon badge
function updateBadge(isEnabled) {
  chrome.action.setBadgeText({ text: isEnabled ? "ON" : "OFF" });
  chrome.action.setBadgeBackgroundColor({ color: isEnabled ? "#4CAF50" : "#F44336" });
}

// Set initial badge text when extension is loaded
chrome.runtime.onInstalled.addListener(() => {
  updateBadge(true);
  chrome.storage.local.set({ isEnabled: true });
});

// Update badge if service worker wakes up
chrome.storage.local.get("isEnabled", (result) => {
  const isEnabled = result.isEnabled !== false;
  updateBadge(isEnabled);
});
