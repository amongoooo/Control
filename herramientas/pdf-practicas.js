// Genera practicas.pdf (P1–P7 en un solo archivo, con índice y enlaces internos) a partir de index.html.
// Uso, desde la raíz del repositorio:  node herramientas/pdf-practicas.js
// Requiere Playwright (en las sesiones en la nube ya viene instalado). No modifica index.html.
const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');

const RAIZ = path.resolve(__dirname, '..');
const SALIDA = path.join(RAIZ, 'practicas.pdf');
const ANCHO = 718; // ancho útil de A4 con márgenes de 10 mm, en px CSS

(async () => {
  const proxy = process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY } : undefined;
  const browser = await chromium.launch({ proxy });
  const page = await browser.newPage({
    viewport: { width: ANCHO, height: 1000 }, deviceScaleFactor: 2, colorScheme: 'light', reducedMotion: 'reduce'
  });
  const errores = [];
  page.on('pageerror', e => errores.push(String(e)));
  // Tema claro, sin imán y sin recordar plegables del usuario (perfil limpio).
  await page.addInitScript(() => { try { localStorage.setItem('lgdr-tema', 'light'); } catch (e) {} });
  await page.goto('file://' + path.join(RAIZ, 'index.html'));
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(600);

  // Abrir cada práctica, desplegar todo, armar el diagrama de Simulink y capturar las gráficas del banco.
  for (let i = 1; i <= 7; i++) {
    await page.evaluate(n => { location.hash = '#p' + n; }, i);
    await page.waitForTimeout(500);
    await page.evaluate(n => {
      const s = document.getElementById('p' + n);
      s.querySelectorAll('.fold-b').forEach(b => b.removeAttribute('hidden'));
      s.querySelectorAll('details').forEach(d => { d.open = true; });
      // Diagrama de Simulink (etapa propia desde v26): se arma aquí por si aún no se armó.
      s.querySelectorAll('.bd[data-bd]').forEach(b => { if (!b.__bdDone && b.__bdRender) { b.__bdDone = 1; b.__bdRender(); } });
      // Resolución paso a paso: en papel van todos los pasos seguidos.
      s.querySelectorAll('.card.pasos').forEach(c => { const b = c.querySelector('[data-all]'); if (b && !c.classList.contains('all')) b.click(); });
    }, i);
    await page.waitForTimeout(700);
    await page.evaluate(n => {
      document.querySelectorAll(`#p${n} .card.bench canvas, #p${n} .card.pasos canvas`).forEach(cv => {
        const img = new Image(); img.src = cv.toDataURL('image/png'); img.className = 'pdfcv'; img.alt = '';
        img.style.aspectRatio = cv.clientWidth + ' / ' + cv.clientHeight;
        cv.replaceWith(img);
      });
    }, i);
  }

  await page.evaluate(() => {
    const P = [...Array(7)].map((_, i) => document.getElementById('p' + (i + 1)));
    const nombres = P.map(s => s.id).map(id => {
      const a = document.querySelector(`#tabs a[href="#${id}"]`);
      return (a.querySelector('small') || {}).textContent || '';
    });
    const titulo = s => s.querySelector('.phead h2').textContent.trim();
    const fuente = s => (s.querySelector('.phead .src') || {}).textContent || '';

    // Quitar los plegables (cada tarjeta recupera su propio título) y anotar las secciones.
    const secciones = P.map((s, i) => {
      const n = i + 1, out = [];
      s.querySelectorAll(':scope > .fold').forEach((f, k) => {
        const t = (f.querySelector('.ftt') || {}).textContent || 'Sección ' + (k + 1);
        const body = f.querySelector('.fold-b');
        const first = body.firstElementChild;
        if (first) { if (!first.id) first.id = `p${n}-f${k + 1}`; out.push({ id: first.id, txt: t.replace(/^\s*\d+\s*/, '').trim() }); }
        f.replaceWith(...body.childNodes);
      });
      const code = s.querySelector('details.code');
      if (code) { if (!code.id) code.id = `p${n}-mat`; out.push({ id: code.id, txt: 'Código MATLAB' }); }
      return out;
    });

    // Lo interactivo no sirve en papel.
    document.querySelectorAll('.card.bench').forEach(b => {
      const src = b.querySelector('.phead .src'); if (src) src.textContent = 'Captura con la K de diseño (en la página es interactivo)';
    });
    document.querySelectorAll('.psnav, .psctl, .pasos [data-all], .mlbar, .fbar, .repbtn, .zbar, [data-mag], .kctl, .fxhead, [data-fx], .seg, [data-reset], [data-copy], .bd button, .bd .seg')
      .forEach(e => { e.style.setProperty('display', 'none', 'important'); });
    document.querySelectorAll('details').forEach(d => { d.open = true; });
    // Número de sección por CSS para que los marcadores digan «Análisis…» y no «1Análisis…».
    document.querySelectorAll('.xh > span:first-child').forEach(sp => { sp.dataset.n = sp.textContent.trim(); sp.textContent = ''; });

    const navTxt = (i, extra) => {
      const prev = i > 0 ? `<a href="#p${i}">◀ P${i} ${nombres[i - 1]}</a>` : '<span></span>';
      const next = i < 6 ? `<a href="#p${i + 2}">P${i + 2} ${nombres[i + 1]} ▶</a>` : '<span></span>';
      return `<nav class="pdfnav ${extra || ''}">${prev}<a href="#pdf-indice">Índice</a>${next}</nav>`;
    };

    const doc = document.createElement('main'); doc.id = 'pdfdoc';
    const hoy = new Date().toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });
    doc.insertAdjacentHTML('beforeend', `<section class="pdfcover" id="pdf-indice">
      <p class="pdfeye">Laboratorio LGDR</p>
      <h1>Prácticas de diseño por lugar geométrico de las raíces</h1>
      <p class="pdfsub">Las 7 prácticas completas. Toca cualquier título para ir a esa parte; cada práctica tiene enlaces a la anterior, a la siguiente y a este índice.</p>
      <ol class="pdftoc">${P.map((s, i) => `<li><a class="pdft" href="#p${i + 1}"><b>P${i + 1}</b><span>${titulo(s).replace(/^Práctica \d+ · /, '')}</span><small>${fuente(s)}</small></a>
        <div class="pdfsubs">${secciones[i].map(x => `<a href="#${x.id}">${x.txt}</a>`).join('')}</div></li>`).join('')}</ol>
      <p class="pdffoot">Versión en línea (interactiva): <a href="https://amongoooo.github.io/Control/">amongoooo.github.io/Control</a> · generado el ${hoy}</p>
    </section>`);
    P.forEach((s, i) => {
      s.hidden = false; s.classList.add('pdfp');
      s.insertAdjacentHTML('afterbegin', navTxt(i));
      s.querySelector('.phead').insertAdjacentHTML('afterend',
        `<nav class="pdfjump">${secciones[i].map(x => `<a href="#${x.id}">${x.txt}</a>`).join('')}</nav>`);
      secciones[i].forEach(x => {
        const el = document.getElementById(x.id);
        if (el && el.tagName !== 'DETAILS') el.insertAdjacentHTML('beforeend', `<p class="pdfup"><a href="#p${i + 1}">↑ Inicio de P${i + 1}</a> · <a href="#pdf-indice">Índice</a></p>`);
      });
      // La barra inferior va dentro del último bloque para que no quede sola en una página.
      const last = s.querySelector('details.code') || s.lastElementChild || s;
      last.insertAdjacentHTML('beforeend', navTxt(i, 'pdfend'));
      doc.appendChild(s);
    });
    [...document.body.children].forEach(e => { if (!/^(STYLE|SCRIPT|LINK)$/.test(e.tagName)) e.remove(); });
    document.body.appendChild(doc);
    document.documentElement.className = '';

    const st = document.createElement('style');
    st.textContent = `
      @page{size:A4;margin:10mm 10mm 12mm}
      html,body,#pdfdoc{background:#fff!important}
      body::before{display:none!important}
      body{padding:0!important;margin:0!important}
      #pdfdoc{display:block;max-width:none;margin:0;padding:0}
      /* La fragmentación de grid entre páginas superpone contenido: en el PDF todo va en bloque. */
      .pdfp{display:block!important;break-before:page;padding:0!important;margin:0!important;animation:none!important}
      .pdfp>*+*{margin-top:14px}
      .pdfp .bench,.pdfp .plots,.pdfp .xsec,.pdfp .statement{display:block!important}
      .pdfp .bench>*+*,.pdfp .plots>*+*,.pdfp .statement>*+*{margin-top:12px}
      .pdfp .xsec>*+*{margin-top:6px}
      .pdfcover{padding:36px 6px 0}
      .pdfeye{font:600 12px var(--f-mono);letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin:0 0 8px}
      .pdfcover h1{font:700 30px/1.15 var(--f-display,var(--f-body));margin:0 0 12px}
      .pdfsub{color:var(--muted);font-size:14px;line-height:1.5;margin:0 0 22px;max-width:62ch}
      .pdftoc{list-style:none;margin:0;padding:0;display:grid;gap:10px}
      .pdftoc li{border:1px solid var(--line);border-radius:10px;padding:10px 14px;break-inside:avoid}
      .pdft{display:grid;grid-template-columns:44px 1fr;gap:0 10px;text-decoration:none;color:var(--ink)}
      .pdft b{grid-row:span 2;font:700 22px var(--f-mono);color:var(--accent);align-self:center}
      .pdft span{font-weight:600;font-size:15px}
      .pdft small{color:var(--muted);font-size:12px}
      .pdfsubs{display:flex;flex-wrap:wrap;gap:4px 12px;margin:6px 0 0 54px;font-size:12px}
      .pdfsubs a,.pdfjump a,.pdfup a,.pdfnav a,.pdffoot a{color:var(--accent);text-decoration:none}
      .pdffoot{margin-top:22px;font-size:12px;color:var(--muted)}
      .pdfnav{display:flex;justify-content:space-between;gap:10px;font:500 12px var(--f-body);border-bottom:1px solid var(--line);padding-bottom:6px}
      .pdfnav.pdfend{border-bottom:0;border-top:1px solid var(--line);padding:8px 0 0;margin-top:10px;break-before:avoid;break-inside:avoid}
      .pdfjump{display:flex;flex-wrap:wrap;gap:6px}
      .pdfjump a{border:1px solid var(--line);border-radius:999px;padding:3px 10px;font-size:12px}
      .pdfup{margin:6px 0 0;font-size:11.5px;text-align:right}
      .pdfcv{display:block;width:100%;height:auto}
      .pdfp .pasos,.pdfp .psbody,.pdfp .pstep{display:block!important}
      .pdfp .pstep>*+*{margin-top:10px}
      .pdfp .psgrid,.pdfp .psA,.pdfp .psB,.pdfp .psf{display:block!important}
      .pdfp .psA>*+*,.pdfp .psB>*+*,.pdfp .psgrid>*+*{margin-top:10px}
      .pdfp .psf>*+*{margin-top:8px}
      .psh{break-after:avoid}
      .pdfp .pasos .psfig{width:60%}
      .pdfp .pasos .psfig{break-inside:avoid}
      .psf .fx,.mlr,.mlo,.psb{break-inside:avoid}
      .pssvg{overflow:visible!important}.pssvg svg{min-width:0!important}
      .xstep,.gsub,.tablewrap,.plot,.gfig,figure,.statement>div,.disc li{break-inside:avoid}
      .xh,h3,h4,h5{break-after:avoid}
      .card{box-shadow:none!important}
      .codebox pre{white-space:pre-wrap;overflow:visible!important;max-height:none!important;orphans:2;widows:2}
      .tablewrap{overflow:visible!important}
      .chip{cursor:default}
      .xh>span:first-child::before{content:attr(data-n)}
      details>summary{list-style:none}
      details>summary::-webkit-details-marker{display:none}
      *{-webkit-print-color-adjust:exact;print-color-adjust:exact}
    `;
    document.head.appendChild(st);
  });
  await page.evaluate(() => Promise.all([...document.images].map(i => i.decode().catch(() => {}))));
  await page.waitForTimeout(300);

  await page.pdf({
    path: SALIDA, format: 'A4', printBackground: true, outline: true, tagged: true,
    margin: { top: '10mm', bottom: '12mm', left: '10mm', right: '10mm' },
    displayHeaderFooter: true, headerTemplate: '<span></span>',
    footerTemplate: '<div style="font:9px sans-serif;color:#888;width:100%;text-align:center">Laboratorio LGDR · <span class="pageNumber"></span> / <span class="totalPages"></span></div>'
  });
  await browser.close();
  if (errores.length) console.error('Errores en la página:', errores);
  console.log('Listo:', SALIDA, fs.statSync(SALIDA).size, 'bytes');
})();
