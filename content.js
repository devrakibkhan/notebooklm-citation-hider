// 1. Inject a style block into the document that handles the hiding
const style = document.createElement('style');
style.textContent = `
  body.notebooklm-hide-citations .notebooklm-citation-target {
    display: none !important;
  }
`;
document.head.appendChild(style);

// 2. Fetch the initial state from storage and apply the class to body
chrome.storage.local.get({ isEnabled: true }, (result) => {
  if (result.isEnabled) {
    document.body.classList.add('notebooklm-hide-citations');
  }
});

// 3. Listen for toggle messages from the background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'toggle') {
    if (request.isEnabled) {
      document.body.classList.add('notebooklm-hide-citations');
    } else {
      document.body.classList.remove('notebooklm-hide-citations');
    }
  }
});

// 4. Function to scan and mark citation numbers
function processCitations() {
  // Only select elements we haven't processed yet
  const elements = document.querySelectorAll('button:not(.notebooklm-processed), span:not(.notebooklm-processed), a:not(.notebooklm-processed), div:not(.notebooklm-processed), mark:not(.notebooklm-processed)');
  const citationRegex = /^\[?\d+\]?$/;

  elements.forEach((element) => {
    if (element.children.length === 0) {
      const text = (element.textContent || "").trim();
      if (citationRegex.test(text)) {
        // Traverse up to find the outermost container
        let targetToHide = element;
        while (targetToHide.parentElement) {
          const parent = targetToHide.parentElement;
          if (['SPAN', 'A', 'SUP', 'BUTTON', 'DIV', 'MARK'].includes(parent.tagName) && 
              (parent.textContent || "").trim() === text) {
            targetToHide = parent;
          } else {
            break;
          }
        }
        
        // Instead of setting inline style, add a class that our injected stylesheet targets
        targetToHide.classList.add('notebooklm-citation-target');
        
        // Mark the base element as processed so we don't evaluate it over and over
        element.classList.add('notebooklm-processed');
      }
    }
  });
}

// Initial run
processCitations();

// 5. Use MutationObserver to watch for dynamic changes (new messages, etc.)
const observer = new MutationObserver((mutations) => {
  let hasNewNodes = false;
  for (const mutation of mutations) {
    if (mutation.addedNodes.length > 0 || mutation.type === 'characterData') {
      hasNewNodes = true;
      break;
    }
  }

  // If new elements or text were added, run the processing again
  if (hasNewNodes) {
    processCitations();
  }
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
  characterData: true
});
