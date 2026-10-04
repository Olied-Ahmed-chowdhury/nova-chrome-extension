// popup.js - Nova v2.0 AI Assistant & Data Scraper

const DEFAULT_GEMINI_KEY = '';


document.addEventListener('DOMContentLoaded', async () => {
  // Elements
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');
  const openOptionsBtn = document.getElementById('openOptionsBtn');
  const activeDomainLabel = document.getElementById('activeDomainLabel');
  const statusIndicator = document.getElementById('statusIndicator');

  // AI Elements
  const aiSummarizeBtn = document.getElementById('aiSummarizeBtn');
  const aiKeyPointsBtn = document.getElementById('aiKeyPointsBtn');
  const aiActionItemsBtn = document.getElementById('aiActionItemsBtn');
  const aiCustomQuery = document.getElementById('aiCustomQuery');
  const aiAskBtn = document.getElementById('aiAskBtn');
  const aiResponseBody = document.getElementById('aiResponseBody');
  const copyAiResponseBtn = document.getElementById('copyAiResponseBtn');
  const ttsAiResponseBtn = document.getElementById('ttsAiResponseBtn');

  // Scraper Elements
  const scraperDetectedInfo = document.getElementById('scraperDetectedInfo');
  const scraperTarget = document.getElementById('scraperTarget');
  const scrapeNowBtn = document.getElementById('scrapeNowBtn');
  const scraperResultsCard = document.getElementById('scraperResultsCard');
  const resultsCountLabel = document.getElementById('resultsCountLabel');
  const tablePreviewContainer = document.getElementById('tablePreviewContainer');
  const exportExcelBtn = document.getElementById('exportExcelBtn');
  const exportPdfBtn = document.getElementById('exportPdfBtn');
  const exportJsonBtn = document.getElementById('exportJsonBtn');

  // Tools Elements
  const ttsPlayBtn = document.getElementById('ttsPlayBtn');
  const ttsPlayFullBtn = document.getElementById('ttsPlayFullBtn');
  const ttsPauseBtn = document.getElementById('ttsPauseBtn');
  const ttsStopBtn = document.getElementById('ttsStopBtn');
  const ttsSpeedSelect = document.getElementById('ttsSpeedSelect');
  const ttsStatus = document.getElementById('ttsStatus');
  const eyeDropperBtn = document.getElementById('eyeDropperBtn');
  const highlightHeadingsBtn = document.getElementById('highlightHeadingsBtn');
  const toggleFocusBtn = document.getElementById('toggleFocusBtn');
  const copyCleanUrlBtn = document.getElementById('copyCleanUrlBtn');

  // Notes Elements
  const pageNoteInput = document.getElementById('pageNoteInput');
  const saveNoteBtn = document.getElementById('saveNoteBtn');
  const clearNoteBtn = document.getElementById('clearNoteBtn');
  const savedNotesList = document.getElementById('savedNotesList');

  let currentScrapedData = null;
  let activeTab = null;

  // 1. Tab Switching
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      tabButtons.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      const targetContent = document.getElementById(`tab-${btn.dataset.tab}`);
      if (targetContent) targetContent.classList.add('active');
    });
  });

  // 2. Open Settings
  openOptionsBtn.addEventListener('click', () => {
    if (chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      window.open(chrome.runtime.getURL('options/options.html'));
    }
  });

  // 3. Initialize Active Tab
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  activeTab = tab;

  if (activeTab) {
    try {
      const urlObj = new URL(activeTab.url);
      activeDomainLabel.textContent = urlObj.hostname;
    } catch {
      activeDomainLabel.textContent = 'Chrome Tab';
    }
    // Scan page elements for scraper preview count
    scanPageStats();
  }

  // Helper: Send message to content script
  async function sendTabMessage(action, payload = {}) {
    if (!activeTab || !activeTab.id || activeTab.url.startsWith('chrome://')) {
      return null;
    }
    try {
      return await chrome.tabs.sendMessage(activeTab.id, { action, ...payload });
    } catch (err) {
      try {
        await chrome.scripting.executeScript({
          target: { tabId: activeTab.id },
          files: ['scripts/content.js']
        });
        return await chrome.tabs.sendMessage(activeTab.id, { action, ...payload });
      } catch (e) {
        console.error('Failed to communicate with tab:', e);
        return null;
      }
    }
  }

  // -------------------------------------------------------------
  // 4. GEMINI AI INTEGRATION
  // -------------------------------------------------------------
  async function getGeminiApiKey() {
    const res = await chrome.storage.sync.get(['geminiApiKey']);
    return res.geminiApiKey && res.geminiApiKey.trim() !== '' ? res.geminiApiKey.trim() : DEFAULT_GEMINI_KEY;
  }

  async function callGemini(promptText, pageContext = '') {
    const apiKey = await getGeminiApiKey();
    aiResponseBody.innerHTML = '<span style="color: #38bdf8;">⚡ Gemini is analyzing the page content...</span>';

    const fullPrompt = `You are Nova, an AI assistant analyzing a webpage.
Webpage URL: ${activeTab?.url || 'Unknown'}
Webpage Title: ${activeTab?.title || 'Unknown'}

Context from page:
"""
${pageContext.substring(0, 15000)}
"""

User Request:
${promptText}

Please provide a clear, well-structured, formatted response:`;

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: fullPrompt }] }]
        })
      });

      const data = await response.json();

      if (data.error) {
        aiResponseBody.innerHTML = `<span style="color: #f87171;">Error from Gemini: ${escapeHtml(data.error.message)}</span>`;
        return;
      }

      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (generatedText) {
        aiResponseBody.textContent = generatedText;
      } else {
        aiResponseBody.textContent = 'No response generated. Please try again.';
      }
    } catch (err) {
      aiResponseBody.innerHTML = `<span style="color: #f87171;">Connection error: ${escapeHtml(err.message)}</span>`;
    }
  }

  async function triggerAiWithPageText(promptText) {
    const res = await sendTabMessage('GET_PAGE_TEXT');
    const pageText = res?.text || '';
    await callGemini(promptText, pageText);
  }

  aiSummarizeBtn.addEventListener('click', () => {
    triggerAiWithPageText('Provide a concise 3-5 bullet point executive summary of the main points of this page.');
  });

  aiKeyPointsBtn.addEventListener('click', () => {
    triggerAiWithPageText('Extract the top 5 key insights, data points, or takeaways from this page.');
  });

  aiActionItemsBtn.addEventListener('click', () => {
    triggerAiWithPageText('List any actionable recommendations, steps, or important to-dos mentioned in this content.');
  });

  aiAskBtn.addEventListener('click', () => {
    const q = aiCustomQuery.value.trim();
    if (!q) return;
    triggerAiWithPageText(q);
  });

  aiCustomQuery.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') aiAskBtn.click();
  });

  copyAiResponseBtn.addEventListener('click', async () => {
    await navigator.clipboard.writeText(aiResponseBody.textContent);
    copyAiResponseBtn.textContent = '✅ Copied!';
    setTimeout(() => { copyAiResponseBtn.textContent = '📋 Copy'; }, 2000);
  });

  ttsAiResponseBtn.addEventListener('click', () => {
    speakText(aiResponseBody.textContent);
  });

  // -------------------------------------------------------------
  // 5. DATA SCRAPER & EXPORTER (EXCEL, PDF, JSON)
  // -------------------------------------------------------------
  async function scanPageStats() {
    const stats = await sendTabMessage('GET_PAGE_STATS');
    if (stats) {
      document.getElementById('countTables').textContent = stats.tables || 0;
      document.getElementById('countLinks').textContent = stats.links || 0;
      document.getElementById('countLists').textContent = stats.lists || 0;
      document.getElementById('countHeadings').textContent = stats.headings || 0;
      scraperDetectedInfo.textContent = `Found ${stats.tables} tables, ${stats.links} links, ${stats.lists} lists.`;
    } else {
      scraperDetectedInfo.textContent = 'Ready to extract.';
    }
  }

  scrapeNowBtn.addEventListener('click', async () => {
    const target = scraperTarget.value;
    scrapeNowBtn.textContent = '⏳ Extracting...';

    const res = await sendTabMessage('SCRAPE_DATA', { target });
    scrapeNowBtn.textContent = '⚡ Extract Data';

    if (res && res.data && res.data.length > 0) {
      currentScrapedData = res.data;
      renderTablePreview(res.data, res.headers);
      scraperResultsCard.style.display = 'flex';
      resultsCountLabel.textContent = `Extracted ${res.data.length} records (${res.target})`;
    } else {
      alert('No data found for the selected target on this webpage.');
    }
  });

  function renderTablePreview(data, headers = []) {
    tablePreviewContainer.innerHTML = '';
    const table = document.createElement('table');
    table.className = 'preview-table';

    if (headers.length === 0 && data.length > 0) {
      headers = Object.keys(data[0]);
    }

    // Header Row
    const thead = document.createElement('thead');
    const trHead = document.createElement('tr');
    headers.forEach(h => {
      const th = document.createElement('th');
      th.textContent = h;
      trHead.appendChild(th);
    });
    thead.appendChild(trHead);
    table.appendChild(thead);

    // Body Rows (Preview first 20)
    const tbody = document.createElement('tbody');
    data.slice(0, 20).forEach(row => {
      const tr = document.createElement('tr');
      headers.forEach(h => {
        const td = document.createElement('td');
        const val = Array.isArray(row) ? row[headers.indexOf(h)] : row[h];
        td.textContent = val !== undefined ? val : '';
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    tablePreviewContainer.appendChild(table);
  }

  // Export to Excel (.csv with UTF-8 BOM)
  exportExcelBtn.addEventListener('click', () => {
    if (!currentScrapedData || currentScrapedData.length === 0) return;
    const headers = Object.keys(currentScrapedData[0]);

    let csvContent = '\uFEFF'; // UTF-8 BOM for Excel native compatibility
    csvContent += headers.map(h => `"${h.replace(/"/g, '""')}"`).join(',') + '\r\n';

    currentScrapedData.forEach(row => {
      const line = headers.map(h => {
        const val = row[h] !== undefined ? String(row[h]) : '';
        return `"${val.replace(/"/g, '""')}"`;
      }).join(',');
      csvContent += line + '\r\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    downloadBlob(blob, `scraped_data_${getTimestamp()}.csv`);
  });

  // Export to Formatted PDF
  exportPdfBtn.addEventListener('click', () => {
    if (!currentScrapedData || currentScrapedData.length === 0) return;
    sendTabMessage('EXPORT_PDF_VIEW', {
      title: activeTab?.title || 'Scraped Data',
      url: activeTab?.url || '',
      data: currentScrapedData
    });
  });

  // Export to JSON
  exportJsonBtn.addEventListener('click', () => {
    if (!currentScrapedData) return;
    const jsonStr = JSON.stringify(currentScrapedData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    downloadBlob(blob, `scraped_data_${getTimestamp()}.json`);
  });

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function getTimestamp() {
    return new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  }

  // -------------------------------------------------------------
  // 6. TEXT-TO-SPEECH (TTS)
  // -------------------------------------------------------------
  function speakText(text) {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis not supported in this browser.');
      return;
    }
    window.speechSynthesis.cancel();
    if (!text || text.trim() === '') return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = parseFloat(ttsSpeedSelect.value) || 1.0;
    utterance.onstart = () => { ttsStatus.textContent = 'Speaking...'; };
    utterance.onend = () => { ttsStatus.textContent = 'Ready'; };
    utterance.onerror = () => { ttsStatus.textContent = 'Ready'; };
    window.speechSynthesis.speak(utterance);
  }

  ttsPlayBtn.addEventListener('click', async () => {
    const res = await sendTabMessage('GET_PAGE_TEXT');
    if (res?.text) speakText(res.text);
  });

  ttsPlayFullBtn.addEventListener('click', async () => {
    const res = await sendTabMessage('GET_PAGE_TEXT');
    if (res?.text) speakText(res.text);
  });

  ttsPauseBtn.addEventListener('click', () => {
    if (window.speechSynthesis.speaking) {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
        ttsStatus.textContent = 'Speaking...';
      } else {
        window.speechSynthesis.pause();
        ttsStatus.textContent = 'Paused';
      }
    }
  });

  ttsStopBtn.addEventListener('click', () => {
    window.speechSynthesis.cancel();
    ttsStatus.textContent = 'Stopped';
  });

  // -------------------------------------------------------------
  // 7. PRODUCTIVITY & TOOLS
  // -------------------------------------------------------------
  eyeDropperBtn.addEventListener('click', async () => {
    if ('EyeDropper' in window) {
      try {
        const eyeDropper = new EyeDropper();
        const result = await eyeDropper.open();
        if (result?.sRGBHex) {
          await navigator.clipboard.writeText(result.sRGBHex);
          alert(`🎨 Color ${result.sRGBHex} copied to clipboard!`);
        }
      } catch (e) {
        console.log('Eyedropper cancelled');
      }
    } else {
      alert('EyeDropper API is available in Chromium browsers.');
    }
  });

  highlightHeadingsBtn.addEventListener('click', () => {
    sendTabMessage('HIGHLIGHT_HEADINGS');
  });

  toggleFocusBtn.addEventListener('click', () => {
    sendTabMessage('TOGGLE_FOCUS_MODE');
  });

  copyCleanUrlBtn.addEventListener('click', async () => {
    if (!activeTab?.url) return;
    try {
      const urlObj = new URL(activeTab.url);
      const tracking = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'fbclid', 'gclid'];
      tracking.forEach(p => urlObj.searchParams.delete(p));
      await navigator.clipboard.writeText(urlObj.toString());
      alert('📋 Clean URL copied to clipboard!');
    } catch {
      await navigator.clipboard.writeText(activeTab.url);
    }
  });

  // -------------------------------------------------------------
  // 8. NOTES STORAGE
  // -------------------------------------------------------------
  async function loadNotes() {
    const res = await chrome.storage.local.get(['pageNotes']);
    const notes = res.pageNotes || [];
    savedNotesList.innerHTML = '';

    if (notes.length === 0) {
      savedNotesList.innerHTML = '<div style="color: var(--text-muted); font-size: 10px; text-align: center; padding: 6px;">No saved notes.</div>';
      return;
    }

    notes.forEach((item, idx) => {
      const div = document.createElement('div');
      div.className = 'note-item';
      div.innerHTML = `
        <div style="flex: 1;">
          <div style="font-weight: 500; color: #f1f5f9;">${escapeHtml(item.text)}</div>
          <div style="font-size: 9px; color: #64748b; margin-top: 2px;">${item.date}</div>
        </div>
        <button class="note-delete-btn" data-idx="${idx}">✕</button>
      `;
      savedNotesList.appendChild(div);
    });

    document.querySelectorAll('.note-delete-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const i = parseInt(e.target.dataset.idx, 10);
        notes.splice(i, 1);
        await chrome.storage.local.set({ pageNotes: notes });
        loadNotes();
      });
    });
  }

  saveNoteBtn.addEventListener('click', async () => {
    const text = pageNoteInput.value.trim();
    if (!text) return;
    const res = await chrome.storage.local.get(['pageNotes']);
    const notes = res.pageNotes || [];
    notes.unshift({
      text,
      date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
    await chrome.storage.local.set({ pageNotes: notes });
    pageNoteInput.value = '';
    loadNotes();
  });

  clearNoteBtn.addEventListener('click', () => { pageNoteInput.value = ''; });

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m]);
  }

  loadNotes();
});
