// background.js - Nova Background Service Worker

chrome.runtime.onInstalled.addListener((details) => {
  console.log('[Nova] Extension initialized:', details.reason);

  // Set default settings
  chrome.storage.sync.get(['groqApiKey', 'groqModel', 'floatingButton'], (res) => {
    if (!res.groqApiKey) {
      chrome.storage.sync.set({
        groqApiKey: '',
        groqModel: 'openai/gpt-oss-120b',
        floatingButton: true,
        autoDetectTables: true,
        includeMetadataRow: true
      });
    }
  });

  // Register Context Menus
  chrome.contextMenus.create({
    id: 'nova-summarize-selection',
    title: '✦ Summarize selection with Nova AI',
    contexts: ['selection']
  });

  chrome.contextMenus.create({
    id: 'nova-capture-screenshot',
    title: '📸 Capture Tab Screenshot',
    contexts: ['page']
  });

  chrome.contextMenus.create({
    id: 'nova-scrape-page',
    title: '📊 Scrape Page Data (Excel/PDF)',
    contexts: ['page']
  });
});

// Context Menu Click Handler
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (!tab?.id) return;

  if (info.menuItemId === 'nova-summarize-selection') {
    chrome.tabs.sendMessage(tab.id, {
      action: 'NOTIFY_POPUP',
      text: `Selected: "${info.selectionText}" (Open Nova to analyze with AI)`
    });
  } else if (info.menuItemId === 'nova-capture-screenshot') {
    try {
      const dataUrl = await chrome.tabs.captureVisibleTab(null, { format: 'png' });
      if (dataUrl) {
        chrome.downloads.download({
          url: dataUrl,
          filename: `nova_screenshot_${new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)}.png`,
          saveAs: false
        });
      }
    } catch (e) {
      console.error('Screenshot error:', e);
    }
  } else if (info.menuItemId === 'nova-scrape-page') {
    chrome.tabs.sendMessage(tab.id, { action: 'TRIGGER_QUICK_SCRAPE' });
  }
});

// Keyboard Commands Handler
chrome.commands.onCommand.addListener(async (command) => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return;

  if (command === 'take_screenshot') {
    try {
      const dataUrl = await chrome.tabs.captureVisibleTab(null, { format: 'png' });
      if (dataUrl) {
        chrome.downloads.download({
          url: dataUrl,
          filename: `nova_screenshot_${new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)}.png`,
          saveAs: false
        });
      }
    } catch (e) {
      console.error('Screenshot error:', e);
    }
  } else if (command === 'quick_scrape') {
    chrome.tabs.sendMessage(tab.id, { action: 'TRIGGER_QUICK_SCRAPE' });
  }
});
