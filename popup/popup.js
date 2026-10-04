// popup.js

document.addEventListener('DOMContentLoaded', async () => {
  // Elements
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');
  const openOptionsBtn = document.getElementById('openOptionsBtn');
  const activeDomain = document.getElementById('activeDomain');
  const statusMessage = document.getElementById('statusMessage');

  // Tab Info Elements
  const infoTitle = document.getElementById('infoTitle');
  const infoUrl = document.getElementById('infoUrl');
  const infoStatus = document.getElementById('infoStatus');

  // Note Elements
  const pageNoteInput = document.getElementById('pageNoteInput');
  const saveNoteBtn = document.getElementById('saveNoteBtn');
  const clearNoteBtn = document.getElementById('clearNoteBtn');
  const savedNotesList = document.getElementById('savedNotesList');

  // Action Buttons
  const highlightBtn = document.getElementById('highlightBtn');
  const extractLinksBtn = document.getElementById('extractLinksBtn');
  const copyUrlBtn = document.getElementById('copyUrlBtn');
  const readingModeBtn = document.getElementById('readingModeBtn');

  // 1. Tab Switching
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      tabButtons.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      const targetId = `tab-${btn.dataset.tab}`;
      const targetContent = document.getElementById(targetId);
      if (targetContent) targetContent.classList.add('active');
    });
  });

  // 2. Open Options Page
  openOptionsBtn.addEventListener('click', () => {
    if (chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      window.open(chrome.runtime.getURL('options/options.html'));
    }
  });

  // 3. Get Current Active Tab
  let [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (activeTab) {
    try {
      const urlObj = new URL(activeTab.url);
      activeDomain.textContent = urlObj.hostname;
    } catch {
      activeDomain.textContent = 'Chrome Page';
    }

    infoTitle.textContent = activeTab.title || 'Unknown';
    infoUrl.textContent = activeTab.url || 'Unknown';
    infoStatus.textContent = activeTab.status ? activeTab.status.toUpperCase() : 'Ready';
  }

  function setStatus(msg, isSuccess = true) {
    statusMessage.textContent = msg;
    statusMessage.style.color = isSuccess ? '#38bdf8' : '#f87171';
  }

  // 4. Send Message to Active Tab's Content Script
  async function sendTabMessage(action, data = {}) {
    if (!activeTab || !activeTab.id || activeTab.url.startsWith('chrome://')) {
      setStatus('Cannot run on internal browser pages.', false);
      return null;
    }
    try {
      return await chrome.tabs.sendMessage(activeTab.id, { action, ...data });
    } catch (err) {
      console.warn('Content script not responsive, trying script injection...', err);
      try {
        await chrome.scripting.executeScript({
          target: { tabId: activeTab.id },
          files: ['scripts/content.js']
        });
        return await chrome.tabs.sendMessage(activeTab.id, { action, ...data });
      } catch (e) {
        setStatus('Failed to connect to page.', false);
        return null;
      }
    }
  }

  // 5. Action: Highlight Headings
  highlightBtn.addEventListener('click', async () => {
    const res = await sendTabMessage('HIGHLIGHT_HEADINGS');
    if (res && res.count !== undefined) {
      setStatus(`✨ Highlighted ${res.count} headings on the page!`);
    }
  });

  // 6. Action: Count Links
  extractLinksBtn.addEventListener('click', async () => {
    const res = await sendTabMessage('COUNT_LINKS');
    if (res) {
      setStatus(`🔗 Found ${res.totalLinks} links (${res.externalLinks} external).`);
    }
  });

  // 7. Action: Copy Clean URL
  copyUrlBtn.addEventListener('click', async () => {
    if (!activeTab || !activeTab.url) return;
    try {
      const urlObj = new URL(activeTab.url);
      // Remove common tracking query params
      const trackingParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'fbclid', 'gclid'];
      trackingParams.forEach(p => urlObj.searchParams.delete(p));
      const cleanUrl = urlObj.toString();
      await navigator.clipboard.writeText(cleanUrl);
      setStatus('📋 Clean URL copied to clipboard!');
    } catch {
      await navigator.clipboard.writeText(activeTab.url);
      setStatus('📋 URL copied to clipboard!');
    }
  });

  // 8. Action: Toggle Reading/Focus Mode
  readingModeBtn.addEventListener('click', async () => {
    const res = await sendTabMessage('TOGGLE_FOCUS_MODE');
    if (res) {
      setStatus(res.active ? '📖 Focus mode enabled.' : '📖 Focus mode disabled.');
    }
  });

  // 9. Notes Storage
  async function loadNotes() {
    const result = await chrome.storage.local.get(['pageNotes']);
    const notes = result.pageNotes || [];
    savedNotesList.innerHTML = '';

    if (notes.length === 0) {
      savedNotesList.innerHTML = '<div style="color: var(--text-muted); font-size: 11px; text-align: center; padding: 8px;">No saved notes yet.</div>';
      return;
    }

    notes.forEach((item, index) => {
      const noteEl = document.createElement('div');
      noteEl.className = 'note-item';
      noteEl.innerHTML = `
        <div style="flex: 1;">
          <div style="font-weight: 600; color: #e2e8f0;">${escapeHtml(item.text)}</div>
          <div style="font-size: 9px; color: #64748b; margin-top: 2px;">${item.date}</div>
        </div>
        <button class="note-delete-btn" data-index="${index}" title="Delete note">✕</button>
      `;
      savedNotesList.appendChild(noteEl);
    });

    document.querySelectorAll('.note-delete-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const idx = parseInt(e.target.getAttribute('data-index'), 10);
        notes.splice(idx, 1);
        await chrome.storage.local.set({ pageNotes: notes });
        loadNotes();
      });
    });
  }

  saveNoteBtn.addEventListener('click', async () => {
    const text = pageNoteInput.value.trim();
    if (!text) return;
    const result = await chrome.storage.local.get(['pageNotes']);
    const notes = result.pageNotes || [];
    notes.unshift({
      text,
      url: activeTab ? activeTab.url : '',
      date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
    await chrome.storage.local.set({ pageNotes: notes });
    pageNoteInput.value = '';
    loadNotes();
    setStatus('📝 Note saved!');
  });

  clearNoteBtn.addEventListener('click', () => {
    pageNoteInput.value = '';
  });

  function escapeHtml(str) {
    return str.replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m]);
  }

  loadNotes();
});
