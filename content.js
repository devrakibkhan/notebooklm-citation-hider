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

// Fix math colors using JavaScript to guarantee it matches the visible text color
function fixMathColors() {
  const mathRoots = document.querySelectorAll('.katex, .MathJax, mjx-container, math, .math-inline, .math-display');
  mathRoots.forEach(root => {
    // Get the true text color from the PARENT element (the paragraph holding the math).
    // This perfectly matches NotebookLM's current theme (light or dark).
    const parent = root.parentElement;
    if (parent) {
      const correctColor = window.getComputedStyle(parent).color;
      
      // Force SVGs (like the square root tick) to use this exact color
      const svgs = root.querySelectorAll('svg, path, use');
      svgs.forEach(svg => {
        svg.style.setProperty('fill', correctColor, 'important');
        if (window.getComputedStyle(svg).stroke !== 'none') {
            svg.style.setProperty('stroke', correctColor, 'important');
        }
      });
      
      // Fix square roots rendered as inline <img> SVG data URIs
      const imgSvgs = root.querySelectorAll('img.katex-svg');
      imgSvgs.forEach(img => {
        // Save the original src the very first time we see it
        if (!img.dataset.originalSrc) {
            img.dataset.originalSrc = img.getAttribute('src');
        }
        
        // Only update the image if the color has actually changed
        if (img.dataset.lastColor !== correctColor) {
          const originalSrc = img.dataset.originalSrc;
          let newSrc = originalSrc;
          
          if (newSrc.includes('<path')) {
            newSrc = newSrc.replace('<path', `<path fill="${correctColor}" `);
          } else if (newSrc.includes('%3Cpath')) {
            // URL encoded version
            const encodedColor = encodeURIComponent(correctColor);
            newSrc = newSrc.replace('%3Cpath', `%3Cpath fill="${encodedColor}" `);
          }
          
          img.setAttribute('src', newSrc);
          img.dataset.lastColor = correctColor;
        }
      });
      
      // Force all text and borders to use this exact color
      root.style.setProperty('color', correctColor, 'important');
      
      const allEls = root.querySelectorAll('*');
      allEls.forEach(el => {
        // Force text color
        el.style.setProperty('color', correctColor, 'important');
        
        const computed = window.getComputedStyle(el);
        if (computed.borderTopWidth !== '0px' && computed.borderTopWidth !== '0' && computed.borderTopStyle !== 'none') {
          el.style.setProperty('border-color', correctColor, 'important');
        }
        if (computed.borderBottomWidth !== '0px' && computed.borderBottomWidth !== '0' && computed.borderBottomStyle !== 'none') {
          el.style.setProperty('border-color', correctColor, 'important');
        }
      });
    }
  });
}

// 4. Function to scan and mark citation numbers
function processCitations() {
  // Only select elements we haven't processed yet
  const elements = document.querySelectorAll('button:not(.notebooklm-processed), span:not(.notebooklm-processed), a:not(.notebooklm-processed), div:not(.notebooklm-processed), mark:not(.notebooklm-processed)');
  const citationRegex = /^\[?\d+\]?$/;

  elements.forEach((element) => {
    // Skip elements that are part of math formulas
    if (element.closest && element.closest('math, .math, .MathJax, .katex, mjx-container, .math-inline, .math-display')) {
      element.classList.add('notebooklm-processed');
      return;
    }

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
  
  // Apply math color fixes
  fixMathColors();
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

// 6. Listen for Theme Changes (Light <-> Dark mode toggles)
// This catches system theme changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    setTimeout(fixMathColors, 50); // Small delay to let NotebookLM update its text colors first
});

// This catches NotebookLM's own theme toggle button (which usually modifies the class on HTML or BODY)
const themeObserver = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
        if (mutation.type === 'attributes' && (mutation.attributeName === 'class' || mutation.attributeName === 'theme' || mutation.attributeName === 'data-theme')) {
            setTimeout(fixMathColors, 50);
            break;
        }
    }
});
themeObserver.observe(document.documentElement, { attributes: true });
themeObserver.observe(document.body, { attributes: true });
