// options.js

document.addEventListener('DOMContentLoaded', async () => {
  const navItems = document.querySelectorAll('.nav-item');
  const sections = document.querySelectorAll('.settings-section');
  const floatingButtonToggle = document.getElementById('floatingButtonToggle');
  const autoCleanUrls = document.getElementById('autoCleanUrls');
  const highlightColor = document.getElementById('highlightColor');
  const badgeNotification = document.getElementById('badgeNotification');
  const resetDefaultsBtn = document.getElementById('resetDefaultsBtn');
  const saveStatus = document.getElementById('saveStatus');

  // 1. Tab Switching
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
    floatingButton: true,
    autoCleanUrls: true,
    highlightColor: '#6366f1',
    badgeNotification: true
  };

  // 2. Load Settings from chrome.storage.sync
  async function loadSettings() {
    const data = await chrome.storage.sync.get(DEFAULT_SETTINGS);
    floatingButtonToggle.checked = data.floatingButton;
    autoCleanUrls.checked = data.autoCleanUrls;
    highlightColor.value = data.highlightColor;
    badgeNotification.checked = data.badgeNotification;
  }

  // 3. Save Settings helper
  async function saveSettings() {
    const updated = {
      floatingButton: floatingButtonToggle.checked,
      autoCleanUrls: autoCleanUrls.checked,
      highlightColor: highlightColor.value,
      badgeNotification: badgeNotification.checked
    };
    await chrome.storage.sync.set(updated);
    saveStatus.textContent = '✨ Settings saved!';
    saveStatus.style.color = '#38bdf8';
    setTimeout(() => {
      saveStatus.textContent = 'All changes saved automatically.';
      saveStatus.style.color = 'var(--text-muted)';
    }, 2000);
  }

  floatingButtonToggle.addEventListener('change', saveSettings);
  autoCleanUrls.addEventListener('change', saveSettings);
  highlightColor.addEventListener('input', saveSettings);
  badgeNotification.addEventListener('change', saveSettings);

  // 4. Reset Defaults
  resetDefaultsBtn.addEventListener('click', async () => {
    if (confirm('Reset all settings to default values?')) {
      await chrome.storage.sync.set(DEFAULT_SETTINGS);
      loadSettings();
      saveStatus.textContent = 'Defaults restored.';
    }
  });

  loadSettings();
});
