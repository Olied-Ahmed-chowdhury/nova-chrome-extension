// options.js - Settings & Groq AI Configuration

const DEFAULT_API_KEY = '';
const DEFAULT_MODEL = 'openai/gpt-oss-120b';


document.addEventListener('DOMContentLoaded', async () => {
  const navItems = document.querySelectorAll('.nav-item');
  const sections = document.querySelectorAll('.settings-section');

  // Elements
  const groqApiKeyInput = document.getElementById('groqApiKeyInput');
  const toggleApiKeyVisibility = document.getElementById('toggleApiKeyVisibility');
  const testAiConnectionBtn = document.getElementById('testAiConnectionBtn');
  const apiTestStatus = document.getElementById('apiTestStatus');
  const groqModelSelect = document.getElementById('groqModelSelect');

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
    groqApiKey: DEFAULT_API_KEY,
    groqModel: DEFAULT_MODEL,
    autoDetectTables: true,
    includeMetadataRow: true,
    floatingButton: true,
    highlightColor: '#0ea5e9'
  };

  // 2. Load Settings
  async function loadSettings() {
    const data = await chrome.storage.sync.get(DEFAULT_SETTINGS);
    groqApiKeyInput.value = data.groqApiKey || DEFAULT_API_KEY;
    groqModelSelect.value = data.groqModel || DEFAULT_MODEL;
    autoDetectTables.checked = data.autoDetectTables !== false;
    includeMetadataRow.checked = data.includeMetadataRow !== false;
    floatingButtonToggle.checked = data.floatingButton !== false;
    highlightColor.value = data.highlightColor || '#0ea5e9';
  }

  // 3. Save Settings
  async function saveSettings() {
    const updated = {
      groqApiKey: groqApiKeyInput.value.trim(),
      groqModel: groqModelSelect.value,
      autoDetectTables: autoDetectTables.checked,
      includeMetadataRow: includeMetadataRow.checked,
      floatingButton: floatingButtonToggle.checked,
      highlightColor: highlightColor.value
    };
    await chrome.storage.sync.set(updated);
    saveStatus.textContent = '✦ Settings saved!';
    saveStatus.style.color = '#38bdf8';
    setTimeout(() => {
      saveStatus.textContent = 'All changes saved automatically.';
      saveStatus.style.color = 'var(--text-muted)';
    }, 2000);
  }

  groqApiKeyInput.addEventListener('input', saveSettings);
  groqModelSelect.addEventListener('change', saveSettings);
  autoDetectTables.addEventListener('change', saveSettings);
  includeMetadataRow.addEventListener('change', saveSettings);
  floatingButtonToggle.addEventListener('change', saveSettings);
  highlightColor.addEventListener('input', saveSettings);

  // 4. Toggle Visibility
  toggleApiKeyVisibility.addEventListener('click', () => {
    if (groqApiKeyInput.type === 'password') {
      groqApiKeyInput.type = 'text';
      toggleApiKeyVisibility.textContent = '🙈 Hide';
    } else {
      groqApiKeyInput.type = 'password';
      toggleApiKeyVisibility.textContent = '👁 Show';
    }
  });

  // 5. Test Groq AI Key Connection
  testAiConnectionBtn.addEventListener('click', async () => {
    const key = groqApiKeyInput.value.trim() || DEFAULT_API_KEY;
    const model = groqModelSelect.value || DEFAULT_MODEL;

    apiTestStatus.textContent = '⏳ Verifying connection with Groq AI...';
    apiTestStatus.style.color = '#38bdf8';

    const endpoint = 'https://api.groq.com/openai/v1/chat/completions';
    try {
      const resp = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: model,
          messages: [
            { role: 'user', content: 'Say: Nova AI is online!' }
          ],
          max_tokens: 30
        })
      });

      const resData = await resp.json();
      if (resData.error) {
        apiTestStatus.textContent = `❌ API Error: ${resData.error.message}`;
        apiTestStatus.style.color = '#f87171';
      } else if (resData.choices?.[0]?.message?.content) {
        apiTestStatus.textContent = `✅ Success! AI Connected (${resData.choices[0].message.content.trim()})`;
        apiTestStatus.style.color = '#10b981';
      } else {
        apiTestStatus.textContent = '⚠️ Unexpected response format from AI.';
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
