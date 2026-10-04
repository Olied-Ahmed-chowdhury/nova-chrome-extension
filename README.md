# ⚡ Nova Chrome Extension (Manifest V3)

<div align="center">

![Manifest V3](https://img.shields.io/badge/Manifest-V3-6366f1?style=for-the-badge&logo=googlechrome&logoColor=white)
![Platform](https://img.shields.io/badge/Platform-Chromium%20%7C%20Edge%20%7C%20Brave-38bdf8?style=for-the-badge)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-f7df1e?style=for-the-badge&logo=javascript&logoColor=black)
![CSS3](https://img.shields.io/badge/Style-Glassmorphism%20CSS-a855f7?style=for-the-badge&logo=css3&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-10b981?style=for-the-badge)

**A modern, production-grade Chrome Extension template built with Google Manifest V3, complete with a dark glassmorphism popup, full settings sync, background service workers, and interactive content scripts.**

[Features](#-key-features) • [Installation](#-getting-started) • [Architecture](#-project-architecture) • [Customization](#-customizing--extending) • [License](#-license)

</div>

---

## 🌟 Key Features

* **⚡ Modern Glassmorphism Popup**:
  * Multi-tab navigation (**Actions**, **Notes**, **Tab Info**).
  * Highlighting page headings with smooth CSS pulse effects.
  * Real-time link counter and dynamic badge updater on the extension icon.
  * Clean URL copier that automatically strips tracking parameters (`utm_*`, `fbclid`, `gclid`).
  * Distraction-free Focus / Reader mode filter toggle.
  * Persistent quick notes synchronized via `chrome.storage.local`.

* **⚙️ Full Options & Settings Page**:
  * Customizable highlight accent colors with live color picker.
  * Preferences synced across browser sessions via `chrome.storage.sync`.
  * Diagnostic panel showing runtime state and Manifest V3 compatibility.

* **🛠️ Background Service Worker**:
  * Context menu integrations (*"Inspect with Nova"*, *"Copy Clean Link"*).
  * Chrome lifecycle listeners (`onInstalled`, `onStartup`).
  * Asynchronous message passing between tabs and background tasks.

* **🎯 In-Page Floating Quick-Action Pill**:
  * Injected discrete floating widget on webpages for instant one-click productivity.
  * Built-in toast notification system.

---

## 📁 Project Architecture

```text
nova-chrome-extension/
├── manifest.json            # Manifest V3 configuration & permission grants
├── icons/                   # High-res extension icons
│   ├── icon16.png           # Toolbar & favicon size (16x16)
│   ├── icon48.png           # Extension manager size (48x48)
│   └── icon128.png          # Web Store & install size (128x128)
├── popup/                   # Browser Toolbar Popup Interface
│   ├── popup.html           # Multi-tab dashboard layout
│   ├── popup.css            # Dark glassmorphism styles & micro-animations
│   └── popup.js             # UI state, DOM communication, and storage logic
├── options/                 # Options & Configuration Page
│   ├── options.html         # Settings UI
│   ├── options.css          # Responsive sidebar & settings controls
│   └── options.js           # Settings persistence via chrome.storage.sync
├── scripts/                 # Core Extension Scripts
│   ├── background.js        # Service Worker (Context menus, badges, lifecycle)
│   ├── content.js           # Content Script (Injected DOM tools & floating pill)
│   └── content.css          # Injected stylesheet for webpage elements & toasts
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/Olied-Ahmed-chowdhury/nova-chrome-extension.git
```

### 2. Load the Extension in Google Chrome
1. Open **Google Chrome** (or any Chromium browser like Brave, Edge, Opera).
2. Navigate to:
   ```text
   chrome://extensions
   ```
3. In the top-right corner, toggle **Developer mode** to **ON**.
4. In the top-left corner, click **Load unpacked**.
5. Select the `nova-chrome-extension` directory.
6. Click the **puzzle piece (🧩)** icon in your browser toolbar and pin **⚡ Nova Extension Starter** for quick access.

---

## 🛠️ Customizing & Extending

### Adding New Permissions
Open [`manifest.json`](manifest.json) and add any additional permissions needed:
```json
"permissions": [
  "storage",
  "activeTab",
  "scripting",
  "contextMenus",
  "tabs"
]
```

### Adding New Popup Actions
1. Add your button in [`popup/popup.html`](popup/popup.html).
2. Attach your event listener in [`popup/popup.js`](popup/popup.js) and send a message:
```javascript
chrome.tabs.sendMessage(activeTab.id, { action: 'YOUR_CUSTOM_ACTION' });
```
3. Handle the message inside [`scripts/content.js`](scripts/content.js):
```javascript
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'YOUR_CUSTOM_ACTION') {
    // Perform custom DOM manipulation or data extraction
    sendResponse({ success: true });
  }
});
```

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/Olied-Ahmed-chowdhury/nova-chrome-extension/issues).

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
