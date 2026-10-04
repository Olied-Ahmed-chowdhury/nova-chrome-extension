// popup.js - Nova AI Assistant (Groq Powered) & Data Scraper

const DEFAULT_API_KEY = '';
const DEFAULT_MODEL = 'openai/gpt-oss-120b';


document.addEventListener('DOMContentLoaded', async () => {
  // Navigation
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
  const aiModelBadge = document.getElementById('aiModelBadge');

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

  // Screenshot & Capture Elements
  const quickScreenshotHeaderBtn = document.getElementById('quickScreenshotHeaderBtn');
  const captureTabBtn = document.getElementById('captureTabBtn');
  const screenshotPreviewContainer = document.getElementById('screenshotPreviewContainer');
  const screenshotPreviewImg = document.getElementById('screenshotPreviewImg');
  const downloadCapturedImgBtn = document.getElementById('downloadCapturedImgBtn');
  const copyCapturedImgBtn = document.getElementById('copyCapturedImgBtn');
  const screenshotStatus = document.getElementById('screenshotStatus');

  // TTS & Tools
  const ttsPlayHeaderBtn = document.getElementById('ttsPlayHeaderBtn');
  const ttsPlayFullBtn = document.getElementById('ttsPlayFullBtn');
  const ttsPauseBtn = document.getElementById('ttsPauseBtn');
  const ttsStopBtn = document.getElementById('ttsStopBtn');
  const ttsSpeedSelect = document.getElementById('ttsSpeedSelect');
  const ttsStatus = document.getElementById('ttsStatus');
  const eyeDropperBtn = document.getElementById('eyeDropperBtn');
  const highlightHeadingsBtn = document.getElementById('highlightHeadingsBtn');
  const toggleFocusBtn = document.getElementById('toggleFocusBtn');
  const copyCleanUrlBtn = document.getElementById('copyCleanUrlBtn');

  // Notes
  const pageNoteInput = document.getElementById('pageNoteInput');
  const saveNoteBtn = document.getElementById('saveNoteBtn');
  const clearNoteBtn = document.getElementById('clearNoteBtn');
  const savedNotesList = document.getElementById('savedNotesList');

  let currentScrapedData = null;
  let activeTab = null;
  let lastCapturedDataUrl = null;

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

  // 3. Active Tab Info
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  activeTab = tab;

  if (activeTab) {
    try {
      const urlObj = new URL(activeTab.url);
      activeDomainLabel.textContent = urlObj.hostname;
    } catch {
      activeDomainLabel.textContent = 'Chrome Tab';
    }
    scanPageStats();
  }

  // Load configured model badge
  chrome.storage.sync.get(['groqModel'], (res) => {
    if (res.groqModel) {
      aiModelBadge.textContent = res.groqModel.split('/').pop();
    }
  });

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
  // 4. GROQ / GROK AI INTEGRATION
  // -------------------------------------------------------------
  async function getAiConfig() {
    const res = await chrome.storage.sync.get(['groqApiKey', 'groqModel']);
    const apiKey = res.groqApiKey && res.groqApiKey.trim() !== '' ? res.groqApiKey.trim() : DEFAULT_API_KEY;
    const model = res.groqModel || DEFAULT_MODEL;
    return { apiKey, model };
  }

  async function callGroqAi(promptText, pageContext = '') {
    const { apiKey, model } = await getAiConfig();
    aiResponseBody.innerHTML = '<span style="color: #38bdf8;">✦ Analyzing page content with Groq AI...</span>';

    const systemPrompt = `You are Nova AI, an advanced, highly capable web assistant. Analyze the user's webpage context and provide structured, precise, bullet-pointed insights. Avoid fluff.`;
    
    const userMessage = `Webpage Title: ${activeTab?.title || 'Unknown'}
URL: ${activeTab?.url || 'Unknown'}

Webpage Content:
"""
${pageContext.substring(0, 12000)}
"""

User Request:
${promptText}`;

    const endpoint = 'https://api.groq.com/openai/v1/chat/completions';

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage }
          ],
          temperature: 0.3,
          max_tokens: 1024
        })
      });

      const data = await response.json();

      if (data.error) {
        aiResponseBody.innerHTML = `<span style="color: #f87171;">AI Error: ${escapeHtml(data.error.message || JSON.stringify(data.error))}</span>`;
        return;
      }

      const generatedText = data.choices?.[0]?.message?.content;
      if (generatedText && generatedText.trim() !== '') {
        aiResponseBody.textContent = generatedText.trim();
      } else {
        aiResponseBody.textContent = 'No response received. Please try again.';
      }
    } catch (err) {
      aiResponseBody.innerHTML = `<span style="color: #f87171;">Connection error: ${escapeHtml(err.message)}</span>`;
    }
  }

  async function triggerAiWithPageText(promptText) {
    const res = await sendTabMessage('GET_PAGE_TEXT');
    const pageText = res?.text || '';
    await callGroqAi(promptText, pageText);
  }

  aiSummarizeBtn.addEventListener('click', () => {
    triggerAiWithPageText('Provide a concise 3-5 bullet point executive summary of this webpage.');
  });

  aiKeyPointsBtn.addEventListener('click', () => {
    triggerAiWithPageText('Extract the top 5 key takeaways, data metrics, or main facts from this page.');
  });

  aiActionItemsBtn.addEventListener('click', () => {
    triggerAiWithPageText('List all actionable takeaways, recommended steps, or important to-dos from this content.');
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
  // 5. FULL-TAB SCREENSHOT ENGINE
  // -------------------------------------------------------------
  async function captureTabScreenshot() {
    try {
      screenshotStatus.textContent = 'Capturing...';
      const dataUrl = await chrome.tabs.captureVisibleTab(null, { format: 'png' });
      if (!dataUrl) {
        screenshotStatus.textContent = 'Failed to capture';
        return;
      }
      lastCapturedDataUrl = dataUrl;
      screenshotPreviewImg.src = dataUrl;
      screenshotPreviewContainer.style.display = 'flex';
      screenshotStatus.textContent = 'Captured!';

      // Trigger automatic download
      const filename = `nova_screenshot_${getTimestamp()}.png`;
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error('Screenshot capture error:', err);
      screenshotStatus.textContent = 'Capture error';
      alert('Could not capture screenshot on this tab: ' + err.message);
    }
  }

  captureTabBtn.addEventListener('click', captureTabScreenshot);
  quickScreenshotHeaderBtn.addEventListener('click', captureTabScreenshot);

  downloadCapturedImgBtn.addEventListener('click', () => {
    if (!lastCapturedDataUrl) return;
    const filename = `nova_screenshot_${getTimestamp()}.png`;
    const a = document.createElement('a');
    a.href = lastCapturedDataUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  });

  copyCapturedImgBtn.addEventListener('click', async () => {
    if (!lastCapturedDataUrl) return;
    try {
      const res = await fetch(lastCapturedDataUrl);
      const blob = await res.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
      copyCapturedImgBtn.textContent = '✅ Copied!';
      setTimeout(() => { copyCapturedImgBtn.textContent = '📋 Copy Image'; }, 2000);
    } catch (e) {
      alert('Failed to copy image to clipboard: ' + e.message);
    }
  });

  // -------------------------------------------------------------
  // 6. DATA SCRAPER & EXPORTERS
  // -------------------------------------------------------------
  async function scanPageStats() {
    const stats = await sendTabMessage('GET_PAGE_STATS');
    if (stats) {
      document.getElementById('countTables').textContent = stats.tables || 0;
      document.getElementById('countLinks').textContent = stats.links || 0;
      document.getElementById('countLists').textContent = stats.lists || 0;
      document.getElementById('countHeadings').textContent = stats.headings || 0;
      scraperDetectedInfo.textContent = `${stats.tables} tables, ${stats.links} links detected.`;
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

    // Body Rows
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

    let csvContent = '\uFEFF';
    csvContent += headers.map(h => `"${h.replace(/"/g, '""')}"`).join(',') + '\r\n';

    currentScrapedData.forEach(row => {
      const line = headers.map(h => {
        const val = row[h] !== undefined ? String(row[h]) : '';
        return `"${val.replace(/"/g, '""')}"`;
      }).join(',');
      csvContent += line + '\r\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    downloadBlob(blob, `nova_data_${getTimestamp()}.csv`);
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
    downloadBlob(blob, `nova_data_${getTimestamp()}.json`);
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
  // 7. TEXT-TO-SPEECH (TTS)
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

  ttsPlayHeaderBtn.addEventListener('click', async () => {
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
  // 8. PRODUCTIVITY TOOLS
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
        console.log('Eyedropper closed');
      }
    } else {
      alert('EyeDropper API is available in Chrome.');
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
      alert('🔗 Clean URL copied to clipboard!');
    } catch {
      await navigator.clipboard.writeText(activeTab.url);
    }
  });

  // -------------------------------------------------------------
  // 9. NOTES STORAGE
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
