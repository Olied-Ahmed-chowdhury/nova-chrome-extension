// content.js - Injected Content Script

(function () {
  if (window.__novaExtensionInjected) return;
  window.__novaExtensionInjected = true;

  let isHighlighted = false;
  let isFocusMode = false;

  // 1. Toast Notification Helper
  function showToast(message, duration = 3000) {
    let toast = document.getElementById('nova-toast-container');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'nova-toast-container';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('nova-toast-visible');

    setTimeout(() => {
      toast.classList.remove('nova-toast-visible');
    }, duration);
  }

  // 2. Message Listener for Popup and Background commands
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request.action) {
      case 'HIGHLIGHT_HEADINGS': {
        const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        isHighlighted = !isHighlighted;

        headings.forEach(el => {
          if (isHighlighted) {
            el.classList.add('nova-heading-highlight');
          } else {
            el.classList.remove('nova-heading-highlight');
          }
        });

        sendResponse({ count: headings.length, active: isHighlighted });
        break;
      }

      case 'COUNT_LINKS': {
        const links = document.querySelectorAll('a[href]');
        const currentHost = window.location.hostname;
        let external = 0;

        links.forEach(a => {
          try {
            const host = new URL(a.href, window.location.origin).hostname;
            if (host && host !== currentHost) external++;
          } catch {}
        });

        // Update badge count
        chrome.runtime.sendMessage({
          action: 'SET_BADGE',
          text: links.length > 99 ? '99+' : `${links.length}`
        });

        sendResponse({
          totalLinks: links.length,
          externalLinks: external
        });
        break;
      }

      case 'TOGGLE_FOCUS_MODE': {
        isFocusMode = !isFocusMode;
        document.body.classList.toggle('nova-focus-mode-active', isFocusMode);
        sendResponse({ active: isFocusMode });
        break;
      }

      case 'NOTIFY_POPUP': {
        showToast(request.text || 'Notification received');
        sendResponse({ received: true });
        break;
      }

      default:
        sendResponse({ status: 'unknown_action' });
    }
    return true;
  });

  // 3. Inject Floating Quick Action Pill if enabled
  chrome.storage.sync.get(['floatingButton'], (res) => {
    if (res.floatingButton !== false) {
      createFloatingPill();
    }
  });

  function createFloatingPill() {
    if (document.getElementById('nova-floating-pill')) return;

    const pill = document.createElement('div');
    pill.id = 'nova-floating-pill';
    pill.innerHTML = `
      <div class="nova-pill-trigger" title="Nova Tools">⚡</div>
      <div class="nova-pill-menu">
        <button class="nova-pill-btn" id="nova-action-highlight" title="Toggle Heading Highlight">✨ Highlight</button>
        <button class="nova-pill-btn" id="nova-action-focus" title="Toggle Focus Mode">📖 Focus</button>
      </div>
    `;

    document.body.appendChild(pill);

    const trigger = pill.querySelector('.nova-pill-trigger');
    const menu = pill.querySelector('.nova-pill-menu');

    trigger.addEventListener('click', () => {
      pill.classList.toggle('nova-pill-open');
    });

    pill.querySelector('#nova-action-highlight').addEventListener('click', () => {
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      isHighlighted = !isHighlighted;
      headings.forEach(el => el.classList.toggle('nova-heading-highlight', isHighlighted));
      showToast(isHighlighted ? `✨ Highlighted ${headings.length} headings` : 'Highlights removed');
    });

    pill.querySelector('#nova-action-focus').addEventListener('click', () => {
      isFocusMode = !isFocusMode;
      document.body.classList.toggle('nova-focus-mode-active', isFocusMode);
      showToast(isFocusMode ? '📖 Focus mode enabled' : 'Focus mode disabled');
    });
  }
})();
