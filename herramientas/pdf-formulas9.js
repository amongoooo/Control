// Genera formulas-9-pasos.pdf: solo las fórmulas (despejadas) de los 9 pasos del trazo del LGDR, para copiarlas a mano.
// Uso, desde la raíz del repositorio:  node herramientas/pdf-formulas9.js
// Toma el formulario del modo «Los 9 pasos del LGDR» de Entrenar (entrenar/ejercicios.js, F9) ya dibujado con KaTeX.
const path = require('path'), fs = require('fs'), http = require('http');
const { chromium } = require('playwright');

const RAIZ = path.resolve(__dirname, '..');
const SALIDA = path.join(RAIZ, 'formulas-9-pasos.pdf');
const TIPOS = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.json': 'application/json', '.webmanifest': 'application/json' };

(async () => {
  // los módulos de Entrenar no cargan desde file://: servidor local mínimo
  const srv = http.createServer((q, r) => {
    const f = path.join(RAIZ, decodeURIComponent(q.url.split('?')[0]).replace(/^\/+/, '') || 'index.html');
    if (!f.startsWith(RAIZ) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); r.end(); return; }
    r.writeHead(200, { 'Content-Type': TIPOS[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r);
  }).listen(0);
  const port = srv.address().port;
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 760, height: 1000 }, colorScheme: 'light', reducedMotion: 'reduce' });
  const errores = [];
  page.on('pageerror', e => errores.push(String(e)));
  await page.addInitScript(() => { try { localStorage.setItem('lgdr-tema', 'light'); } catch (e) {} });
  await page.goto(`http://localhost:${port}/index.html#entrenar`);
  await page.waitForSelector('.en-f9d', { timeout: 30000 });
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => {
    const g = document.querySelector('.en-f9d .en-f9g').cloneNode(true);
    const doc = document.createElement('div'); doc.id = 'f9pdf';
    doc.innerHTML = `<h1>Formulario · los 9 pasos del LGDR</h1><p class="f9-sub">Todas despejadas · Laboratorio LGDR · Nise, secciones 8.5–8.6</p>`;
    doc.appendChild(g);
    [...document.body.children].forEach(e => { if (!/^(STYLE|SCRIPT|LINK)$/.test(e.tagName)) e.remove(); });
    document.body.appendChild(doc);
    document.documentElement.className = ''; document.documentElement.removeAttribute('data-theme');
    const st = document.createElement('style');
    st.textContent = `html,body{background:#fff!important;color:#111!important;margin:0;padding:0}
      #f9pdf{font-family:var(--f-body,system-ui,sans-serif);color:#111}
      #f9pdf h1{font-size:19px;margin:0 0 2px}
      #f9pdf .f9-sub{margin:0 0 6px;font-size:11px;color:#555}
      #f9pdf .en-f9g{display:block;columns:2;column-gap:22px;column-rule:1px solid #ddd}
      #f9pdf .en-f9s{break-inside:auto;margin:0 0 4px}
      #f9pdf .en-f9s h4{break-after:avoid;margin:8px 0 2px;font:700 10.5px/1.3 system-ui,sans-serif;letter-spacing:.04em;text-transform:uppercase;color:#1d4ed8;border-bottom:1px solid #ccc;padding-bottom:2px}
      #f9pdf .en-f9r{break-inside:avoid;overflow:visible;padding:1px 0}
      #f9pdf .katex-display{margin:3px 0!important}
      #f9pdf .katex{font-size:.95em;color:#111}`;
    document.body.appendChild(st);
  });
  await page.waitForTimeout(300);
  await page.pdf({ path: SALIDA, format: 'Letter', margin: { top: '12mm', bottom: '12mm', left: '12mm', right: '12mm' }, printBackground: true,
    displayHeaderFooter: true, headerTemplate: '<span></span>', footerTemplate: '<div style="font-size:8px;width:100%;text-align:center;color:#777">Formulario · 9 pasos del LGDR · <span class="pageNumber"></span>/<span class="totalPages"></span></div>' });
  await browser.close(); srv.close();
  if (errores.length) console.log('Errores en la página:', errores);
  console.log('Listo:', path.relative(RAIZ, SALIDA));
})();
