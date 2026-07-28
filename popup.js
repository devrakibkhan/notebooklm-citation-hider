document.addEventListener('DOMContentLoaded', async () => {
  const toggleSwitch = document.getElementById('toggleSwitch');
  const domainListEl = document.getElementById('domainList');
  const quickAddContainer = document.getElementById('quickAddContainer');
  const quickAddBtn = document.getElementById('quickAddBtn');
  const currentDomainText = document.getElementById('currentDomainText');

  // Load current settings
  // Default to [ 'notebooklm.google.com' ] if not set, or migrate old string
  let { isEnabled = true, targetDomains } = await chrome.storage.local.get(['isEnabled', 'targetDomains', 'targetDomain']);
  
  // Migration logic for older versions that used string `targetDomain`
  if (!targetDomains) {
    const oldDomainData = await chrome.storage.local.get('targetDomain');
    if (oldDomainData.targetDomain) {
      targetDomains = [oldDomainData.targetDomain];
      await chrome.storage.local.remove('targetDomain'); // Clean up
    } else {
      targetDomains = ['notebooklm.google.com'];
    }
    await chrome.storage.local.set({ targetDomains });
  }

  toggleSwitch.checked = isEnabled;

  // Get current active tab's hostname
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  let currentHostname = '';
  if (tab && tab.url && tab.url.startsWith('http')) {
    currentHostname = new URL(tab.url).hostname;
  }

  // Render domains
  const renderDomains = () => {
    domainListEl.innerHTML = '';
    targetDomains.forEach((domain, index) => {
      const li = document.createElement('li');
      li.className = 'domain-item';
      
      const span = document.createElement('span');
      span.textContent = domain;
      
      const btn = document.createElement('button');
      btn.className = 'remove-btn';
      btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
      btn.title = 'Remove domain';
      btn.addEventListener('click', async () => {
        targetDomains.splice(index, 1);
        await chrome.storage.local.set({ targetDomains });
        renderUI(); // Re-render
      });
      
      li.appendChild(span);
      li.appendChild(btn);
      domainListEl.appendChild(li);
    });
  };

  // Check if current hostname is in the list
  const renderUI = () => {
    renderDomains();
    if (currentHostname && !targetDomains.includes(currentHostname)) {
      quickAddContainer.style.display = 'block';
      currentDomainText.textContent = currentHostname;
    } else {
      quickAddContainer.style.display = 'none';
    }
  };

  renderUI();

  // Handle Quick Add
  quickAddBtn.addEventListener('click', async () => {
    if (currentHostname && !targetDomains.includes(currentHostname)) {
      targetDomains.push(currentHostname);
      await chrome.storage.local.set({ targetDomains });
      renderUI();
      
      // Update badge right away for this tab
      if (isEnabled) {
        chrome.action.setBadgeText({ text: "ON", tabId: tab.id });
        chrome.action.setBadgeBackgroundColor({ color: "#4CAF50", tabId: tab.id });
      }
    }
  });

  // Handle Toggle Switch
  toggleSwitch.addEventListener('change', async (e) => {
    const newState = e.target.checked;
    
    // Save state
    await chrome.storage.local.set({ isEnabled: newState });
    
    // Update Badge for current tab ONLY IF it's an active domain
    if (tab && currentHostname && targetDomains.includes(currentHostname)) {
      chrome.action.setBadgeText({ text: newState ? "ON" : "OFF", tabId: tab.id });
      chrome.action.setBadgeBackgroundColor({ color: newState ? "#4CAF50" : "#F44336", tabId: tab.id });
    }

    // Send message to active tab to apply immediately
    if (tab) {
      chrome.tabs.sendMessage(tab.id, { action: "toggle", isEnabled: newState }).catch(() => {});
    }
  });
});
