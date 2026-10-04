// background.js - Nova v2.0 Background Service Worker

chrome.runtime.onInstalled.addListener((details) => {
  console.log('[Nova] Extension installed/updated:', details.reason);

  // Set default settings
  chrome.storage.sync.get(['geminiApiKey', 'geminiModel', 'floatingButton'], (res) => {
    if (!res.geminiApiKey) {
      chrome.storage.sync.set({
        geminiApiKey: '',
        geminiModel: 'gemini-1.5-flash',
        floatingButton: true,
        autoDetectTables: true,
        includeMetadataRow: true
      });
    }
  });

  // Register Context Menus
  chrome.contextMenus.create({
    id: 'nova-summarize-selection',
    title: '🤖 Summarize selection with Gemini',
    contexts: ['selection']
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
      text: `Selected: "${info.selectionText}" (Open Nova to analyze with Gemini)`
    });
  } else if (info.menuItemId === 'nova-scrape-page') {
    chrome.tabs.sendMessage(tab.id, { action: 'TRIGGER_QUICK_SCRAPE' });
  }
});

// Keyboard Commands Handler
chrome.commands.onCommand.addListener(async (command) => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return;

  if (command === 'quick_scrape') {
    chrome.tabs.sendMessage(tab.id, { action: 'TRIGGER_QUICK_SCRAPE' });
  }
});
