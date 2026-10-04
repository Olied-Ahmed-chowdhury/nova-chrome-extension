// content.js - Nova Injected Content Script & Scraper Engine

(function () {
  if (window.__novaExtensionInjected) return;
  window.__novaExtensionInjected = true;

  let isHighlighted = false;
  let isFocusMode = false;

  // 1. Toast Notification
  function showToast(message, duration = 3000) {
    let toast = document.getElementById('nova-toast-container');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'nova-toast-container';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('nova-toast-visible');
    setTimeout(() => { toast.classList.remove('nova-toast-visible'); }, duration);
  }

  // 2. Extract Clean Text for Gemini & TTS
  function extractCleanPageText() {
    const clone = document.body.cloneNode(true);
    // Remove scripts, styles, navs, footers for cleaner context
    const unwanted = clone.querySelectorAll('script, style, noscript, svg, nav, footer, iframe');
    unwanted.forEach(el => el.remove());
    return clone.innerText.replace(/\s+/g, ' ').trim();
  }

  // 3. Scrape Functions
  function scrapeTables() {
    const tables = document.querySelectorAll('table');
    const results = [];

    tables.forEach((table, tableIdx) => {
      const rows = table.querySelectorAll('tr');
      if (rows.length === 0) return;

      let headers = [];
      const ths = rows[0].querySelectorAll('th, td');
      ths.forEach((th, i) => {
        const text = th.innerText.trim();
        headers.push(text || `Column_${i + 1}`);
      });

      const startRow = (rows[0].querySelectorAll('th').length > 0) ? 1 : 0;

      for (let r = startRow; r < rows.length; r++) {
        const cells = rows[r].querySelectorAll('td, th');
        if (cells.length === 0) continue;
        const rowObj = { 'Table': `Table ${tableIdx + 1}` };
        headers.forEach((h, cIdx) => {
          rowObj[h] = cells[cIdx] ? cells[cIdx].innerText.trim() : '';
        });
        results.push(rowObj);
      }
    });

    return { data: results, target: 'Tables' };
  }

  function scrapeLinks() {
    const links = document.querySelectorAll('a[href]');
    const results = [];
    const currentHost = window.location.hostname;

    links.forEach((a, idx) => {
      const text = a.innerText.trim();
      const href = a.href;
      if (!href || href.startsWith('javascript:')) return;

      let isExternal = false;
      try {
        const urlHost = new URL(href).hostname;
        isExternal = urlHost !== currentHost;
      } catch {}

      results.push({
        '#': idx + 1,
        'Anchor Text': text || '[Icon/Image Link]',
        'Destination URL': href,
        'Type': isExternal ? 'External' : 'Internal'
      });
    });

    return { data: results, target: 'Links' };
  }

  function scrapeLists() {
    const listItems = document.querySelectorAll('ul > li, ol > li');
    const results = [];

    listItems.forEach((li, idx) => {
      const parentHeading = li.closest('section, article, div')?.querySelector('h1, h2, h3, h4')?.innerText || 'General';
      results.push({
        '#': idx + 1,
        'Section': parentHeading.trim(),
        'Item Content': li.innerText.trim()
      });
    });

    return { data: results, target: 'Lists' };
  }

  function scrapeHeadings() {
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const results = [];

    headings.forEach((h, idx) => {
      results.push({
        '#': idx + 1,
        'Level': h.tagName.toUpperCase(),
        'Heading Text': h.innerText.trim()
      });
    });

    return { data: results, target: 'Headings' };
  }

  // 4. Export Printable PDF Dialog
  function openPdfPrintView(title, url, data) {
    if (!data || data.length === 0) return;
    const headers = Object.keys(data[0]);

    const printWin = window.open('', '_blank', 'width=900,height=700');
    if (!printWin) {
      alert('Popup blocker prevented PDF export window from opening.');
      return;
    }

    let rowsHtml = '';
    data.forEach(row => {
      rowsHtml += '<tr>';
      headers.forEach(h => {
        rowsHtml += `<td>${escapeHtml(row[h] !== undefined ? String(row[h]) : '')}</td>`;
      });
      rowsHtml += '</tr>';
    });

    let headersHtml = '';
    headers.forEach(h => {
      headersHtml += `<th>${escapeHtml(h)}</th>`;
    });

    const docHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${escapeHtml(title)} - Scraped Data</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 24px; color: #1e293b; background: #fff; }
          .header { border-bottom: 2px solid #6366f1; padding-bottom: 12px; margin-bottom: 20px; }
          .header h1 { margin: 0 0 6px 0; font-size: 20px; color: #0f172a; }
          .header .meta { font-size: 11px; color: #64748b; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 11px; }
          th, td { border: 1px solid #cbd5e1; padding: 8px 10px; text-align: left; }
          th { background-color: #f1f5f9; color: #334155; font-weight: 600; }
          tr:nth-child(even) { background-color: #f8fafc; }
          @media print {
            body { padding: 0; }
            button { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>📊 Nova Data Export: ${escapeHtml(title)}</h1>
          <div class="meta">
            <div>Source: ${escapeHtml(url)}</div>
            <div>Exported: ${new Date().toLocaleString()} | Total Records: ${data.length}</div>
          </div>
        </div>
        <table>
          <thead><tr>${headersHtml}</tr></thead>
          <tbody>${rowsHtml}</tbody>
        </table>
        <script>
          window.onload = function() { window.print(); };
        </script>
      </body>
      </html>
    `;

    printWin.document.open();
    printWin.document.write(docHtml);
    printWin.document.close();
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m]);
  }

  // 5. Message Routing
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request.action) {
      case 'GET_PAGE_TEXT':
        sendResponse({ text: extractCleanPageText() });
        break;

      case 'GET_PAGE_STATS':
        sendResponse({
          tables: document.querySelectorAll('table').length,
          links: document.querySelectorAll('a[href]').length,
          lists: document.querySelectorAll('ul, ol').length,
          headings: document.querySelectorAll('h1, h2, h3, h4, h5, h6').length
        });
        break;

      case 'SCRAPE_DATA': {
        let result = { data: [], target: '' };
        if (request.target === 'tables') result = scrapeTables();
        else if (request.target === 'links') result = scrapeLinks();
        else if (request.target === 'lists') result = scrapeLists();
        else if (request.target === 'headings') result = scrapeHeadings();
        sendResponse(result);
        break;
      }

      case 'EXPORT_PDF_VIEW':
        openPdfPrintView(request.title, request.url, request.data);
        sendResponse({ success: true });
        break;

      case 'HIGHLIGHT_HEADINGS': {
        const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        isHighlighted = !isHighlighted;
        headings.forEach(el => el.classList.toggle('nova-heading-highlight', isHighlighted));
        showToast(isHighlighted ? `✨ Highlighted ${headings.length} headings` : 'Highlights removed');
        sendResponse({ count: headings.length, active: isHighlighted });
        break;
      }

      case 'TOGGLE_FOCUS_MODE': {
        isFocusMode = !isFocusMode;
        document.body.classList.toggle('nova-focus-mode-active', isFocusMode);
        showToast(isFocusMode ? '📖 Focus mode enabled' : 'Focus mode disabled');
        sendResponse({ active: isFocusMode });
        break;
      }

      default:
        sendResponse({ status: 'unhandled' });
    }
    return true;
  });

  // 6. Floating Action Pill on Webpages
  chrome.storage.sync.get(['floatingButton'], (res) => {
    if (res.floatingButton !== false) {
      createFloatingPill();
    }
  });

  function createFloatingPill() {
    if (document.getElementById('nova-floating-pill')) return;

    const pill = document.createElement('div');
    pill.id = 'nova-floating-pill';
    pill.innerHTML = `
      <div class="nova-pill-trigger" title="Nova AI & Tools">⚡</div>
      <div class="nova-pill-menu">
        <button class="nova-pill-btn" id="nova-btn-highlight">✨ Highlight</button>
        <button class="nova-pill-btn" id="nova-btn-focus">📖 Focus</button>
        <button class="nova-pill-btn" id="nova-btn-scrape">📊 Scrape Tables</button>
      </div>
    `;

    document.body.appendChild(pill);
    const trigger = pill.querySelector('.nova-pill-trigger');

    trigger.addEventListener('click', () => {
      pill.classList.toggle('nova-pill-open');
    });

    pill.querySelector('#nova-btn-highlight').addEventListener('click', () => {
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      isHighlighted = !isHighlighted;
      headings.forEach(el => el.classList.toggle('nova-heading-highlight', isHighlighted));
      showToast(isHighlighted ? `✨ Highlighted ${headings.length} headings` : 'Highlights removed');
    });

    pill.querySelector('#nova-btn-focus').addEventListener('click', () => {
      isFocusMode = !isFocusMode;
      document.body.classList.toggle('nova-focus-mode-active', isFocusMode);
      showToast(isFocusMode ? '📖 Focus mode enabled' : 'Focus mode disabled');
    });

    pill.querySelector('#nova-btn-scrape').addEventListener('click', () => {
      const tablesResult = scrapeTables();
      if (tablesResult.data.length > 0) {
        openPdfPrintView(document.title, window.location.href, tablesResult.data);
      } else {
        showToast('No tables found on this page.');
      }
    });
  }
})();
