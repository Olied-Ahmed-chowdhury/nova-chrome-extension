// background.js - Service Worker (Manifest V3)

chrome.runtime.onInstalled.addListener((details) => {
  console.log('[Nova Extension] Installed/Updated:', details.reason);

  // 1. Initialize Default Settings
  chrome.storage.sync.get(['floatingButton', 'autoCleanUrls', 'highlightColor', 'badgeNotification'], (res) => {
    if (res.floatingButton === undefined) {
      chrome.storage.sync.set({
        floatingButton: true,
        autoCleanUrls: true,
        highlightColor: '#6366f1',
        badgeNotification: true
      });
    }
  });

  // 2. Register Context Menus
  chrome.contextMenus.create({
    id: 'nova-inspect-selection',
    title: '⚡ Inspect with Nova: "%s"',
    contexts: ['selection']
  });

  chrome.contextMenus.create({
    id: 'nova-clean-url',
    title: '🔗 Copy Clean Link',
    contexts: ['link']
  });
});

// Handle Context Menu Actions
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === 'nova-inspect-selection' && tab?.id) {
    chrome.tabs.sendMessage(tab.id, {
      action: 'NOTIFY_POPUP',
      text: `Selected text: "${info.selectionText}"`
    });
  } else if (info.menuItemId === 'nova-clean-url' && tab?.id) {
    try {
      const url = new URL(info.linkUrl);
      const trackingParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'fbclid', 'gclid'];
      trackingParams.forEach(p => url.searchParams.delete(p));
      chrome.tabs.sendMessage(tab.id, {
        action: 'NOTIFY_POPUP',
        text: `Clean Link: ${url.toString()}`
      });
    } catch (e) {
      console.error('Error cleaning URL:', e);
    }
  }
});

// Listen for messages from content scripts or popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'GET_EXTENSION_INFO') {
    const manifest = chrome.runtime.getManifest();
    sendResponse({
      version: manifest.version,
      name: manifest.name
    });
    return true;
  }

  if (message.action === 'SET_BADGE') {
    if (sender.tab?.id) {
      chrome.action.setBadgeText({
        tabId: sender.tab.id,
        text: message.text || ''
      });
      chrome.action.setBadgeBackgroundColor({
        tabId: sender.tab.id,
        color: '#6366f1'
      });
    }
    sendResponse({ success: true });
    return true;
  }
});
