/* GoodPWR HR Hub — shared helpers used by every tool. Nothing here stores or sends data anywhere. */
(function () {
  const LIBS = {
    pdfjs: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js',
    pdflib: 'https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js',
    fontkit: 'https://cdn.jsdelivr.net/npm/@pdf-lib/fontkit@1.1.1/dist/fontkit.umd.min.js',
    jszip: 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js',
    papa: 'https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.4.1/papaparse.min.js',
    xlsx: 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js',
    diff: 'https://cdnjs.cloudflare.com/ajax/libs/jsdiff/5.1.0/diff.min.js',
    tesseract: 'https://cdn.jsdelivr.net/npm/tesseract.js@5.0.4/dist/tesseract.min.js',
    qrcode: 'https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js',
    jsbarcode: 'https://cdn.jsdelivr.net/npm/jsbarcode@3.11.6/dist/JsBarcode.all.min.js'
  };
  const PDF_WORKER = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  const loaded = {};

  const Hub = {
    company: { name: 'GoodPWR', site: 'getgoodpwr.com' },

    /** Load one or more libraries by key (see LIBS) or URL. Each loads once. */
    load(...keys) {
      return Promise.all(keys.map(k => {
        const url = LIBS[k] || k;
        if (!loaded[url]) loaded[url] = new Promise((res, rej) => {
          const s = document.createElement('script'); s.src = url; s.onload = res;
          s.onerror = () => rej(new Error('Could not load a required library. Check your internet connection and reload.'));
          document.head.appendChild(s);
        });
        return loaded[url];
      })).then(() => { if (window.pdfjsLib && !pdfjsLib.GlobalWorkerOptions.workerSrc) pdfjsLib.GlobalWorkerOptions.workerSrc = PDF_WORKER; });
    },

    /** Tab icon: a dark rounded square with a green bar and a short code, so HR Hub tabs never look like the GoodPWR logo. */
    favicon(code) {
      const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d');
      x.fillStyle = '#1F2124'; x.beginPath(); x.roundRect ? x.roundRect(0, 0, 64, 64, 14) : x.rect(0, 0, 64, 64); x.fill();
      x.fillStyle = '#5FBF84'; x.fillRect(12, 50, 40, 5);
      x.fillStyle = '#FFFFFF'; x.textAlign = 'center'; x.textBaseline = 'middle';
      x.font = `700 ${code.length > 2 ? 21 : 28}px Arial, Helvetica, sans-serif`; x.fillText(code, 32, 29);
      document.querySelectorAll('link[rel~="icon"]').forEach(l => l.remove());
      const l = document.createElement('link'); l.rel = 'icon'; l.type = 'image/png'; l.href = c.toDataURL('image/png'); document.head.appendChild(l);
    },
    ICONS: { 'pdf-editor': 'PE', 'form-builder': 'FF', 'sign-pdf': 'SI', 'pdf-compare': 'CP', 'ocr': 'OCR', 'bates-numbering': 'BN', 'mail-merge': 'MM',
      'certificate-designer': 'CD', 'social-graphics': 'AG', 'background-remover': 'BG', 'email-signature': 'ES', 'time-zones': 'TZ', 'label-maker': 'QR' },

    /** Insert the shared top bar. */
    mount(title) {
      const file = (location.pathname.split('/').pop() || '').replace(/\.html$/, '');
      Hub.favicon(Hub.ICONS[file] || 'HR');
      const home = /\/tools\//.test(location.pathname) ? '../' : './';
      const h = document.createElement('header'); h.className = 'hub-top';
      h.innerHTML = `<a class="hub-brand" href="${home}index.html"><img src="${home}assets/logo.png" alt="" onerror="this.remove()"><b>GoodPWR</b><span>HR Hub</span></a>
        ${title ? `<span class="hub-crumb">/ <strong></strong></span>` : ''}<span class="grow"></span>
        <span class="hub-private" title="Files are processed in your browser and never uploaded">Files stay on your computer</span>`;
      if (title) h.querySelector('strong').textContent = title;
      document.body.prepend(h);
      if (title) document.title = title + ' · GoodPWR HR Hub';
    },

    toast(msg, ms = 2800) {
      let t = document.querySelector('.hub-toast');
      if (!t) { t = document.createElement('div'); t.className = 'hub-toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); }
      t.textContent = msg; t.classList.add('show'); clearTimeout(Hub._tt); Hub._tt = setTimeout(() => t.classList.remove('show'), ms);
    },

    /** Save a Blob/bytes/string as a file. */
    download(data, filename, type) {
      const blob = data instanceof Blob ? data : new Blob([data], { type: type || 'application/octet-stream' });
      const u = URL.createObjectURL(blob), a = document.createElement('a');
      a.href = u; a.download = filename; document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(u), 5000);
    },

    async zip(files, zipName) {
      await Hub.load('jszip');
      const z = new JSZip(); files.forEach(f => z.file(f.name, f.data));
      Hub.download(await z.generateAsync({ type: 'blob' }), zipName);
    },

    bytes: async f => new Uint8Array(await f.arrayBuffer()),
    dataURL: f => new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsDataURL(f); }),
    loadImage: src => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; }),
    baseName: n => (n || 'file').replace(/\.[^.]+$/, ''),
    size: b => b < 1024 ? b + ' B' : b < 1048576 ? (b / 1024).toFixed(0) + ' KB' : (b / 1048576).toFixed(1) + ' MB',
    esc: s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])),

    /** Make an element a click-or-drop file picker. */
    dropzone(el, { accept = '', multiple = false, onFiles }) {
      const inp = document.createElement('input'); inp.type = 'file'; inp.accept = accept; inp.multiple = multiple; inp.hidden = true;
      el.after(inp); el.tabIndex = 0; el.setAttribute('role', 'button');
      const take = list => { const fs = [...list]; if (fs.length) onFiles(multiple ? fs : [fs[0]]); };
      el.addEventListener('click', () => inp.click());
      el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); inp.click(); } });
      inp.addEventListener('change', () => { take(inp.files); inp.value = ''; });
      el.addEventListener('dragover', e => { e.preventDefault(); el.classList.add('over'); });
      el.addEventListener('dragleave', () => el.classList.remove('over'));
      el.addEventListener('drop', e => { e.preventDefault(); el.classList.remove('over'); take(e.dataTransfer.files); });
      return inp;
    },

    /** Open a PDF with pdf.js (keeps the original bytes intact). */
    async openPdf(bytes) {
      await Hub.load('pdfjs');
      try { return await pdfjsLib.getDocument({ data: bytes.slice(0) }).promise; }
      catch (e) { throw new Error(e && e.name === 'PasswordException' ? 'This PDF is password-protected. Remove the password first.' : 'That file could not be read as a PDF.'); }
    },

    /** Render a pdf.js page to a canvas at a given scale. */
    async renderPage(page, scale, canvas, rotation) {
      const vp = page.getViewport({ scale, rotation: rotation ?? page.rotate });
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas = canvas || document.createElement('canvas');
      canvas.width = Math.floor(vp.width * dpr); canvas.height = Math.floor(vp.height * dpr);
      canvas.style.width = vp.width + 'px'; canvas.style.height = vp.height + 'px';
      const ctx = canvas.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      await page.render({ canvasContext: ctx, viewport: vp }).promise;
      return { canvas, viewport: vp };
    },

    hexRgb(h) { const n = parseInt((h || '#000000').slice(1), 16); return PDFLib.rgb(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255); },

    /** Make text safe for standard PDF fonts. */
    winAnsi: s => String(s || '').normalize('NFKC').replace(/₱/g, 'PHP ')
      .replace(/[^\n\x20-\x7E\xA0-\xFF‘’“”–—•€…]/g, '?'),

    /** Read a CSV or Excel file (or pasted CSV text) into { headers, rows:[{col:value}] }. */
    async readTable(fileOrText) {
      let rows;
      if (typeof fileOrText === 'string' || /\.(csv|txt|tsv)$/i.test(fileOrText.name)) {
        await Hub.load('papa');
        const text = typeof fileOrText === 'string' ? fileOrText : await fileOrText.text();
        rows = Papa.parse(text.trim(), { header: true, skipEmptyLines: true, transformHeader: h => h.trim() }).data;
      } else {
        await Hub.load('xlsx');
        const wb = XLSX.read(await fileOrText.arrayBuffer(), { type: 'array', cellDates: true });
        rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: '', raw: false });
      }
      rows = rows.filter(r => Object.values(r).some(v => String(v).trim()));
      const headers = rows.length ? Object.keys(rows[0]).filter(h => h && !/^__EMPTY/.test(h)) : [];
      return { headers, rows };
    },

    /** Wrap text into lines that fit a width with a pdf-lib font. */
    wrap(text, font, size, maxW) {
      const out = [];
      String(text).split('\n').forEach(par => {
        if (!par.trim()) { out.push(''); return; }
        let line = '';
        par.split(/(\s+)/).forEach(tok => {
          const test = line + tok;
          if (font.widthOfTextAtSize(test.trimEnd(), size) <= maxW || !line.trim()) line = test;
          else { out.push(line.trimEnd()); line = tok.trimStart(); }
        });
        out.push(line.trimEnd());
      });
      return out;
    },

    /** Make a small working state for a tool when there is nothing loaded yet. */
    async samplePdf(lines, title) {
      await Hub.load('pdflib');
      const { PDFDocument, StandardFonts, rgb } = PDFLib;
      const d = await PDFDocument.create(), f = await d.embedFont(StandardFonts.Helvetica), fb = await d.embedFont(StandardFonts.HelveticaBold);
      const p = d.addPage([612, 792]);
      p.drawText(title, { x: 72, y: 700, size: 20, font: fb, color: rgb(.12, .13, .15) });
      lines.forEach((l, i) => p.drawText(l, { x: 72, y: 660 - i * 22, size: 11, font: f, color: rgb(.12, .13, .15) }));
      return await d.save();
    }
  };
  window.Hub = Hub;
})();
