// options.js - Settings & Gemini Configuration

const DEFAULT_GEMINI_KEY = '';


document.addEventListener('DOMContentLoaded', async () => {
  const navItems = document.querySelectorAll('.nav-item');
  const sections = document.querySelectorAll('.settings-section');

  // Elements
  const geminiApiKeyInput = document.getElementById('geminiApiKeyInput');
  const toggleApiKeyVisibility = document.getElementById('toggleApiKeyVisibility');
  const testAiConnectionBtn = document.getElementById('testAiConnectionBtn');
  const apiTestStatus = document.getElementById('apiTestStatus');
  const geminiModelSelect = document.getElementById('geminiModelSelect');

  const autoDetectTables = document.getElementById('autoDetectTables');
  const includeMetadataRow = document.getElementById('includeMetadataRow');
  const floatingButtonToggle = document.getElementById('floatingButtonToggle');
  const highlightColor = document.getElementById('highlightColor');
  const resetDefaultsBtn = document.getElementById('resetDefaultsBtn');
  const saveStatus = document.getElementById('saveStatus');

  // 1. Tab Navigation
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      navItems.forEach(i => i.classList.remove('active'));
      sections.forEach(s => s.classList.remove('active'));
      item.classList.add('active');
      const targetId = `section-${item.dataset.section}`;
      const targetSection = document.getElementById(targetId);
      if (targetSection) targetSection.classList.add('active');
    });
  });

  const DEFAULT_SETTINGS = {
    geminiApiKey: DEFAULT_GEMINI_KEY,
    geminiModel: 'gemini-1.5-flash',
    autoDetectTables: true,
    includeMetadataRow: true,
    floatingButton: true,
    highlightColor: '#6366f1'
  };

  // 2. Load Settings
  async function loadSettings() {
    const data = await chrome.storage.sync.get(DEFAULT_SETTINGS);
    geminiApiKeyInput.value = data.geminiApiKey || DEFAULT_GEMINI_KEY;
    geminiModelSelect.value = data.geminiModel || 'gemini-1.5-flash';
    autoDetectTables.checked = data.autoDetectTables !== false;
    includeMetadataRow.checked = data.includeMetadataRow !== false;
    floatingButtonToggle.checked = data.floatingButton !== false;
    highlightColor.value = data.highlightColor || '#6366f1';
  }

  // 3. Save Settings
  async function saveSettings() {
    const updated = {
      geminiApiKey: geminiApiKeyInput.value.trim(),
      geminiModel: geminiModelSelect.value,
      autoDetectTables: autoDetectTables.checked,
      includeMetadataRow: includeMetadataRow.checked,
      floatingButton: floatingButtonToggle.checked,
      highlightColor: highlightColor.value
    };
    await chrome.storage.sync.set(updated);
    saveStatus.textContent = '✨ Settings saved!';
    saveStatus.style.color = '#38bdf8';
    setTimeout(() => {
      saveStatus.textContent = 'All changes saved automatically.';
      saveStatus.style.color = 'var(--text-muted)';
    }, 2000);
  }

  geminiApiKeyInput.addEventListener('input', saveSettings);
  geminiModelSelect.addEventListener('change', saveSettings);
  autoDetectTables.addEventListener('change', saveSettings);
  includeMetadataRow.addEventListener('change', saveSettings);
  floatingButtonToggle.addEventListener('change', saveSettings);
  highlightColor.addEventListener('input', saveSettings);

  // 4. Toggle API Key Visibility
  toggleApiKeyVisibility.addEventListener('click', () => {
    if (geminiApiKeyInput.type === 'password') {
      geminiApiKeyInput.type = 'text';
      toggleApiKeyVisibility.textContent = '🙈 Hide';
    } else {
      geminiApiKeyInput.type = 'password';
      toggleApiKeyVisibility.textContent = '👁️ Show';
    }
  });

  // 5. Test Gemini API Key Connection
  testAiConnectionBtn.addEventListener('click', async () => {
    const key = geminiApiKeyInput.value.trim();
    if (!key) {
      apiTestStatus.textContent = '❌ Please enter an API key first.';
      apiTestStatus.style.color = '#f87171';
      return;
    }

    apiTestStatus.textContent = '⏳ Testing connection to Gemini API...';
    apiTestStatus.style.color = '#38bdf8';

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`;
    try {
      const resp = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'Hello! Respond with: Gemini is ready' }] }]
        })
      });

      const resData = await resp.json();
      if (resData.error) {
        apiTestStatus.textContent = `❌ API Error: ${resData.error.message}`;
        apiTestStatus.style.color = '#f87171';
      } else if (resData.candidates?.[0]?.content?.parts?.[0]?.text) {
        apiTestStatus.textContent = `✅ Success! Gemini Connected (${resData.candidates[0].content.parts[0].text.trim()})`;
        apiTestStatus.style.color = '#10b981';
      } else {
        apiTestStatus.textContent = '⚠️ Unexpected response format from Gemini.';
        apiTestStatus.style.color = '#f59e0b';
      }
    } catch (err) {
      apiTestStatus.textContent = `❌ Network Error: ${err.message}`;
      apiTestStatus.style.color = '#f87171';
    }
  });

  // 6. Reset Defaults
  resetDefaultsBtn.addEventListener('click', async () => {
    if (confirm('Reset all settings to default values?')) {
      await chrome.storage.sync.set(DEFAULT_SETTINGS);
      loadSettings();
      saveStatus.textContent = 'Defaults restored.';
    }
  });

  loadSettings();
});
