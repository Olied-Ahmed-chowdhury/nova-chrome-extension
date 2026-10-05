# ✦ Nova - AI Web Assistant & Data Scraper (Manifest V3)

<div align="center">

<img src="showcase_banner.jpg" alt="Nova AI Showcase Banner" width="100%" style="border-radius: 12px; margin-bottom: 16px;" />

![Manifest V3](https://img.shields.io/badge/Manifest-V3-0284c7?style=for-the-badge&logo=googlechrome&logoColor=white)
![AI Engine](https://img.shields.io/badge/AI_Engine-Groq_LLaMA_/_GPT--OSS-38bdf8?style=for-the-badge&logo=openai&logoColor=white)
![Data Export](https://img.shields.io/badge/Data_Export-Excel_|_PDF_|_JSON-10b981?style=for-the-badge)
![Capture](https://img.shields.io/badge/Capture-High--Res_PNG_Screenshot-f59e0b?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-0ea5e9?style=for-the-badge)

**A high-performance Chrome Extension powered by Groq AI, intelligent HTML Data Scraper to Excel & PDF, one-click high-res Screenshots, Text-to-Speech audio reader, and productivity developer tools.**

[Features](#-features) • [Installation](#-getting-started) • [AI Integration](#-ai-intelligence) • [Screenshot & Scraper](#-data-scraper--screenshot-suite) • [Architecture](#-project-architecture) • [License](#-license)

</div>

---

## 🌟 Features

### ✦ 1. Groq AI Page Intelligence
* **⚡ 1-Click Page Summaries**: Extract concise executive summaries, key data metrics, and action items.
* **💬 Interactive Q&A**: Ask any custom question about the active webpage.
* **🎯 Model Selection**: Switch between **GPT-OSS 120B**, **Qwen 3.8 27B**, and **GPT-OSS 20B**.
* **🔊 Audio Readback**: Listen to AI responses with Text-to-Speech playback.

### 📸 2. Full-Tab Screenshot Engine
* **Instant Capture**: Capture the active browser tab with one click (`Ctrl+Shift+X` or via popup).
* **Automatic Download**: Saves high-res `.png` with webpage title and timestamp.
* **Clipboard Copy**: Direct one-click copy of the captured image to the system clipboard.

### 📊 3. Smart HTML Data Scraper & Exporter
* **📑 Auto-Detection**: Scans HTML `<table>` elements, links, lists, and headings on any webpage.
* **📗 Excel Export (.csv / .xls)**: UTF-8 BOM encoding for native compatibility with Microsoft Excel and Google Sheets.
* **📕 Formatted PDF Export**: Formatted, print-ready document view with metadata and clean zebra-striped tables.
* **📦 JSON Export**: Download raw structured data.

### 🛠️ 4. Built-In Productivity & Audio Tools
* **🔊 Text-to-Speech (TTS) Reader**: Listen to any webpage with Play, Pause, Stop, and customizable playback speed controls (0.8x - 1.5x).
* **🎨 Color Eyedropper**: Sample pixel-perfect HEX colors from any webpage element with one click.
* **✦ Heading Highlighter**: Visual dashed outline to audit page structure.
* **📖 Reader Focus Mode**: Distraction-free reading view filter.
* **🔗 Clean URL Copier**: Automatic removal of tracking parameters (`utm_*`, `fbclid`, `gclid`).
* **📝 Synced Notes**: Quick markdown notes per domain saved to local browser storage.

---

## 📁 Project Architecture

```text
nova-chrome-extension/
├── manifest.json            # Manifest V3 configuration & keyboard shortcuts
├── icons/                   # Nova Star celestial icons (16px, 48px, 128px)
├── popup/                   # Browser Toolbar Interface
│   ├── popup.html           # Multi-tab layout (AI, Scraper, Capture, Notes)
│   ├── popup.css            # Nova Star cosmic Cyan-to-Gold styles
│   └── popup.js             # Groq AI, Screenshot engine, Scraper & Exporters
├── options/                 # Options & Configuration Page
│   ├── options.html         # Settings UI
│   ├── options.css          # Nova Star theme settings styling
│   └── options.js           # Groq API verification & settings sync
├── scripts/                 # Core Extension Scripts
│   ├── background.js        # Service Worker (Shortcuts, Context menus, Screenshots)
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
6. Click the **puzzle piece (🧩)** icon in your browser toolbar and pin **✦ Nova**!

### 2. Configure Groq AI Key
* Right-click the Nova icon and select **Options** (or click ⚙️ in the popup).
* Paste your Groq API key (`gsk_...`) and click **⚡ Test Key** to verify your live connection!

---

## ⌨️ Keyboard Shortcuts
* `Ctrl + Shift + K` (Mac: `Cmd + Shift + K`) — Open Nova Popup
* `Ctrl + Shift + X` (Mac: `Cmd + Shift + X`) — Capture Tab Screenshot
* `Ctrl + Shift + S` (Mac: `Cmd + Shift + S`) — Quick Scrape Current Page

---

## 🧠 What I Learned & Key Technical Takeaways

1. **Manifest V3 Architecture & Lifecycle**:
   * Transitioned from legacy background pages to modern, event-driven Service Workers.
   * Handled asynchronous cross-context message passing between Content Scripts, Service Worker, and Toolbar Popups.
   * Managed reliable extension state and user settings across sessions using `chrome.storage.sync`.

2. **Ultra-Fast AI Inference with Groq Cloud**:
   * Integrated high-throughput Groq REST endpoints for sub-second page comprehension and Q&A.
   * Engineered dynamic DOM context extraction and custom system prompts tailored for web summarization.
   * Built flexible model-switching logic between **GPT-OSS 120B**, **Qwen 3.8 27B**, and **GPT-OSS 20B**.

3. **Client-Side Data Scraping & File Generation**:
   * Developed an HTML DOM parser that auto-detects `<table>` structures, links, and headings.
   * Implemented pure client-side CSV/Excel file compilation with **UTF-8 BOM encoding** to prevent character corruption in Microsoft Excel and Google Sheets.
   * Crafted a custom printable PDF document generator with print stylesheets directly in JavaScript without heavy external dependencies.

4. **Security & Content Security Policy (CSP)**:
   * Maintained compliance with strict Chrome Web Store Manifest V3 security rules (no remote script execution, isolated script scopes).
   * Built URL sanitizer routines to strip invasive tracking parameters (`utm_*`, `fbclid`, `gclid`).

---

## 📄 License
This project is licensed under the [MIT License](LICENSE).
