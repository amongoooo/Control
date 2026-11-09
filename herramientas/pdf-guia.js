// Genera guia.pdf (pestaña «Guía de diseño» con todo desplegado, para estudiar con la hoja) a partir de index.html.
// Uso, desde la raíz del repositorio:  node herramientas/pdf-guia.js
// Requiere Playwright (en las sesiones en la nube ya viene instalado). No modifica index.html.
const path = require('path');
const { chromium } = require('playwright');

const RAIZ = path.resolve(__dirname, '..');
const SALIDA = path.join(RAIZ, 'guia.pdf');
const ANCHO = 718; // ancho útil de A4 con márgenes de 10 mm, en px CSS

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: ANCHO, height: 1000 }, deviceScaleFactor: 2, colorScheme: 'light', reducedMotion: 'reduce' });
  const errores = [];
  page.on('pageerror', e => errores.push(String(e)));
  await page.addInitScript(() => { try { localStorage.setItem('lgdr-tema', 'light'); } catch (e) {} });
  await page.goto('file://' + path.join(RAIZ, 'index.html') + '#guia');
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(800);

  await page.evaluate(() => {
    const g = document.getElementById('guia');
    g.hidden = false;
    g.querySelectorAll('details').forEach(d => { d.open = true; });
    g.querySelectorAll('.gd-acts,.gd-hint').forEach(e => e.remove());
    g.querySelector('.gd-intro').prepend(Object.assign(document.createElement('h3'), { textContent: 'Cómo usar esta guía' }));
    // Portada con índice y enlaces a cada grupo y a cada tema.
    const cov = document.createElement('div'); cov.className = 'gdpdf-cov';
    const grupos = [...g.querySelectorAll('.gd-grp')].map(c => ({ id: c.id, k: c.querySelector('.gd-k').textContent, t: c.querySelector('h3').textContent,
      items: [...c.querySelectorAll('details.gd-acc')].map(d => ({ id: d.id, tag: d.querySelector('.gd-tag').textContent, t: d.querySelector('.gd-sm b').textContent })) }));
    cov.innerHTML = `<h1>Guía de diseño · LGDR y compensadores</h1><p class="gdpdf-sub">Laboratorio LGDR · Nise, cap. 8–9 · para estudiar con la hoja (ejemplos con P1–P7)</p>
      <ol class="gdpdf-toc">${grupos.map(G => `<li><a href="#${G.id}"><b>${G.k}</b> ${G.t}</a><ul>${G.items.map(i => `<li><a href="#${i.id}"><i>${i.tag}</i> ${i.t}</a></li>`).join('')}</ul></li>`).join('')}</ol>`;
    g.querySelector('.phead').after(cov);
    // Cada tema lleva «↑ Índice» al final.
    g.querySelectorAll('details.gd-acc>.gd-ab').forEach(b => { const a = document.createElement('a'); a.href = '#gdpdf-top'; a.className = 'gdpdf-up'; a.textContent = '↑ Índice'; b.appendChild(a); });
    cov.id = 'gdpdf-top';
    const doc = document.createElement('div'); doc.id = 'gdpdf'; doc.appendChild(g);
    [...document.body.children].forEach(e => { if (!/^(STYLE|SCRIPT|LINK)$/.test(e.tagName)) e.remove(); });
    document.body.appendChild(doc);
    document.documentElement.className = ''; document.documentElement.removeAttribute('data-theme');
    const st = document.createElement('style');
    st.textContent = `
      html,body,#gdpdf{background:#fff!important}
      body{padding:0!important;margin:0!important}
      body::before{display:none!important}
      #gdpdf{padding:0}
      #guia{display:block!important}
      #guia>*{margin-bottom:12px}
      .gdpdf-cov h1{font:700 28px/1.15 var(--f-display,var(--f-body));margin:0 0 8px}
      .gdpdf-sub{color:#5a6575;margin:0 0 16px}
      .gdpdf-toc{list-style:none;margin:0;padding:0;display:grid;gap:10px}
      .gdpdf-toc>li>a{font:600 15px var(--f-body);color:#16202c;text-decoration:none}
      .gdpdf-toc>li>a b{display:inline-block;width:22px;color:#1d4ed8}
      .gdpdf-toc ul{list-style:none;margin:4px 0 0 22px;padding:0;columns:2;column-gap:20px;font-size:12.5px}
      .gdpdf-toc ul a{color:#1d4ed8;text-decoration:none} .gdpdf-toc ul i{font-style:normal;font:600 11px var(--f-mono);color:#5a6575;display:inline-block;min-width:34px}
      .gdpdf-up{display:block;text-align:right;font-size:11px;color:#1d4ed8;text-decoration:none}
      .card{box-shadow:none!important}
      .gd-grp{break-before:page}
      .gd-st,.gd-fig,details.gd-acc>summary,table.gd-t tr,ol.gd-q>li{break-inside:avoid}
      details.gd-acc>summary{break-after:avoid}
      .gd-sep,.gd-h4{break-after:avoid}
      .gd-cv{display:none!important}
      /* v83 · compacto (se escribe en la libreta, no en la hoja) */
      #guia{font-size:12px}
      .gd-st{padding:6px 9px!important;gap:8px!important;grid-template-columns:24px minmax(0,1fr)!important}
      .gd-st>.gd-n{width:22px!important;height:22px!important;font-size:11px!important}
      .gd-st h4{font-size:13px!important;margin:1px 0 2px!important}
      .gd-st p,.gd-when,ol.gd-q,.gd-gi{font-size:12px!important}
      .gd-e{font-size:11.5px!important;padding:4px 8px!important}
      .gd-f .katex-display{margin:.15em 0!important}.gd-f .katex{font-size:1em!important}
      details.gd-acc>summary{min-height:0!important;padding:6px 10px!important}
      .gd-ab{padding:8px 10px 10px!important;gap:6px!important}
      .gd-ab>*,.gd-grp>*{margin-bottom:6px!important}
      .gd-ss{padding:5px 8px!important;margin-bottom:5px}
      .gd-sh{font-size:12.5px!important}.gd-sf{font-size:12.5px!important;gap:2px!important;line-height:1.35!important}
      .gd-r{font-size:12px!important;padding:2px 7px!important}
      .gd-ruta{font-size:11.5px!important}
      table.gd-t{font-size:11.5px!important}table.gd-t td,table.gd-t th{padding:3px 7px!important}
      .gd-leg{font-size:10px!important}.gd-fig figcaption{font-size:10.5px!important}
      .gd-nb{font-size:12px!important}
      .gd-ruta ol{columns:auto!important;display:inline;padding:0!important;margin:0 0 0 4px!important;counter-reset:r}
      .gd-ruta li{display:inline;counter-increment:r}.gd-ruta li::before{content:counter(r) " ";font-weight:700;color:#1d4ed8}
      .gd-ruta li:not(:last-child)::after{content:"  →  ";color:#5a6575}
      .gd-sf{font-size:12px!important}.gd-ss .gd-sh{font-size:12px!important}
      .gd-f,.gd-eg,.gd-tw{overflow:visible!important}
      #gC table.gd-t{min-width:0!important}
      .gd-fig{max-width:360px;margin:0 auto 4px!important}
      /* la fragmentación de grid de Chromium encima contenido entre páginas: en el PDF todo va en bloque */
      #guia .card,.gd-grp,.gd-accs,.gd-ab,ol.gd-l,ol.gd-q,ol.gd-sol,.gd-intro,.gd-fig{display:block!important}
      ol.gd-sol,ol.gd-l{columns:2;column-gap:10px} ol.gd-l>li{break-inside:avoid} ol.gd-sol>li{break-inside:avoid;display:block!important}
      .gd-tt{width:auto!important}
      .gd-accs>details{margin-bottom:8px}
      .gd-ab>*,.gd-grp>*{margin-bottom:10px}
      ol.gd-l>li{margin-bottom:5px} ol.gd-q>li{margin-bottom:3px}
      #guia>.phead{display:none!important}
    `;
    document.body.appendChild(st); // al final: la hoja principal de la página va en el <body> y ganaría en los empates
  });
  await page.waitForTimeout(400);
  await page.pdf({
    path: SALIDA, format: 'A4', printBackground: true, outline: true, tagged: true,
    margin: { top: '12mm', bottom: '14mm', left: '10mm', right: '10mm' },
    displayHeaderFooter: true, headerTemplate: '<div></div>',
    footerTemplate: '<div style="font:9px sans-serif;color:#888;width:100%;text-align:center">Guía de diseño · Laboratorio LGDR · <span class="pageNumber"></span> / <span class="totalPages"></span></div>'
  });
  await browser.close();
  if (errores.length) console.error('Errores de la página:', errores.join('\n'));
  console.log('Listo:', SALIDA);
})();
