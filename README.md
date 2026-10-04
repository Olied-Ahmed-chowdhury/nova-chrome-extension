# ⚡ Nova - AI Web Assistant & Data Scraper (Manifest V3)

<div align="center">

![Manifest V3](https://img.shields.io/badge/Manifest-V3-6366f1?style=for-the-badge&logo=googlechrome&logoColor=white)
![Gemini AI](https://img.shields.io/badge/Google_Gemini-1.5_Flash-38bdf8?style=for-the-badge&logo=google&logoColor=white)
![Export](https://img.shields.io/badge/Data_Export-Excel_|_PDF_|_JSON-10b981?style=for-the-badge)
![Text to Speech](https://img.shields.io/badge/Audio-Text--to--Speech-f59e0b?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-a855f7?style=for-the-badge)

**A modern, production-grade Chrome Extension powered by Google Gemini AI, intelligent one-click HTML Data Scraper to Excel & PDF, Text-to-Speech audio reader, and productivity developer tools.**

[Features](#-key-features) • [Installation](#-getting-started) • [AI Integration](#-gemini-ai-features) • [Data Scraper](#-data-scraper--export-engine) • [Architecture](#-project-architecture) • [License](#-license)

</div>

---

## 🌟 Key Features

### 🤖 1. Gemini AI Web Assistant
* **⚡ 1-Click Page Summaries**: Instantly extract executive summaries, key takeaways, and action items from long articles or docs.
* **💬 Interactive Q&A**: Ask any question about the current webpage directly in the popup.
* **🎯 Model Selection**: Switch between **Gemini 1.5 Flash** and **Gemini 2.5 Flash**.
* **🔊 Audio Readback**: Listen to AI responses with Text-to-Speech playback.

### 📊 2. Smart Data Scraper & Exporter
* **📑 Auto-Detection**: Instantly detects and counts HTML `<table>` elements, links, lists, and headings on any webpage.
* **📗 Excel Export (.csv / .xls)**: One-click export with UTF-8 BOM encoding for native compatibility with Microsoft Excel, Apple Numbers, and Google Sheets.
* **📕 Formatted PDF Export**: Opens a formatted, print-optimized document view with source metadata, timestamp, and clean zebra-striped tables.
* **📦 JSON Export**: Raw structured data download for developers.

### 🛠️ 3. Built-In Productivity & Audio Tools
* **🔊 Text-to-Speech (TTS) Reader**: Listen to any webpage with Play, Pause, Stop, and customizable playback speed controls (0.8x - 1.5x).
* **🎨 Color Eyedropper**: Sample pixel-perfect HEX colors from any element on your screen with one click.
* **✨ Heading Highlighter**: Visual outline and count for page hierarchy auditing.
* **📖 Reader Focus Mode**: Distraction-free reading view.
* **📋 Clean URL Copier**: Automatic removal of tracking parameters (`utm_*`, `fbclid`, `gclid`).
* **📝 Synced Notes**: Quick markdown notes per domain saved to local browser storage.

### 🎯 4. In-Page Floating Quick-Action Pill
* Discrete floating action widget injected in the bottom-right corner of webpages for instant access to highlighters, focus mode, and table scraping without opening the toolbar popup.

---

## 📁 Project Architecture

```text
nova-chrome-extension/
├── manifest.json            # Manifest V3 configuration, permissions & commands
├── icons/                   # High-res extension icons (16px, 48px, 128px)
├── popup/                   # Browser Toolbar Interface
│   ├── popup.html           # Multi-tab layout (AI, Scraper, Tools, Notes)
│   ├── popup.css            # Dark glassmorphism styles & animations
│   └── popup.js             # Gemini AI API calls, Scraper, Exporters & TTS
├── options/                 # Options & Configuration Page
│   ├── options.html         # Settings UI
│   ├── options.css          # Responsive settings panel
│   └── options.js           # Gemini API key verification & storage sync
├── scripts/                 # Core Extension Scripts
│   ├── background.js        # Service Worker (Context menus, shortcuts, lifecycle)
│   ├── content.js           # Content Script (Scraper engine, PDF generator, floating pill)
│   └── content.css          # Injected styles for highlights, pill, and toasts
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### 1. Load the Extension in Google Chrome
1. Open **Google Chrome** (or Edge, Brave, Opera).
2. Go to `chrome://extensions`.
3. Enable **Developer mode** (top-right toggle).
4. Click **Load unpacked** (top-left button).
5. Select the project folder: `c:\Users\olied\Desktop\nnn`.
6. Click the **puzzle piece (🧩)** icon in your browser toolbar and pin **⚡ Nova**!

### 2. Configure Gemini API (Optional)
The extension comes pre-configured with a Gemini API key. You can also test or update your key anytime:
* Right-click the Nova icon and select **Options** (or click ⚙️ in the popup).
* Enter your Gemini API key and click **⚡ Test Key** to verify your connection!

---

## ⌨️ Keyboard Shortcuts
* `Ctrl + Shift + K` (Mac: `Cmd + Shift + K`) — Open Nova Popup
* `Ctrl + Shift + S` (Mac: `Cmd + Shift + S`) — Quick Scrape Current Page

---

## 📄 License
This project is licensed under the [MIT License](LICENSE).
