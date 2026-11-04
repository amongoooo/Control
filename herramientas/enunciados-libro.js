// Regenera los 7 figure.bkq de index.html (Planteamiento de P1–P7): texto idéntico al libro (Nise, CECSA) + diagrama de bloques SVG.
// Uso: node herramientas/enunciados-libro.js  (usa el KaTeX de la página y mide el texto con sus fuentes).
const { chromium } = require('playwright');
const fs = require('fs');
const FILE = require('path').join(__dirname, '..', 'index.html');

const DATA = {
  p1: { ej: true, ref: 'Nise · Ejercicio de evaluación de destreza 8.6 · p. 457',
    pre: 'Dado un sistema con realimentación unitaria que tiene una función de transferencia de la trayectoria directa,',
    eq: 'G(s)=\\dfrac{K}{(s+2)(s+4)(s+6)}', post: 'haga lo siguiente:',
    items: ['Trace el lugar geométrico de las raíces.',
      'Con el uso de una aproximación de segundo orden, diseñe el valor de $K$ para obtener 10% de sobrepaso para una entrada escalón unitaria.',
      'Estime el tiempo de asentamiento, tiempo pico, tiempo de levantamiento y error en estado estable para el valor de $K$ diseñado en b).',
      'Determine la validez de su aproximación de segundo orden.'],
    rows: [{ blocks: [{ n: 'K', d: '(s + 2)(s + 4)(s + 6)' }] }] },
  p2: { ref: 'Nise · Ejemplo 9.1 · p. 501 · Efecto de un compensador integral ideal',
    text: 'Dado que el sistema de la figura 9.4(a), que opera con un factor de amortiguamiento relativo de 0.174, demuestre que la adición del compensador integral ideal que se ilustra en la figura 9.4(b) reduce a cero el error de estado estable para una entrada escalón, sin afectar de manera apreciable la respuesta transitoria. La red de compensación se selecciona con un polo en el origen para aumentar el tipo de sistema y un cero en −0.1, cerca del polo del compensador, de modo que la aportación angular del compensador evaluada en los polos de segundo orden originales, dominantes, es aproximadamente cero. De este modo, los polos en lazo cerrado de segundo orden originales, dominantes, están todavía aproximadamente sobre el nuevo lugar geométrico de las raíces.',
    rows: [
      { tag: 'a)', blocks: [{ t: 'Ganancia', n: 'K' }, { t: 'Planta', n: '1', d: '(s + 1)(s + 2)(s + 10)' }] },
      { tag: 'b)', blocks: [{ t: 'Compensador', n: 'K(s + 0.1)', d: 's' }, { t: 'Planta', n: '1', d: '(s + 1)(s + 2)(s + 10)' }] }],
    cap: '<b>Figura 9.4</b> Sistema en lazo cerrado para el ejemplo 9.1: a) antes de compensación; b) después de compensación integral ideal.' },
  p3: { ej: true, ref: 'Nise · Ejercicio de evaluación de destreza 9.1 · p. 510',
    pre: 'Un sistema con realimentación unitaria con función en transferencia de la trayectoria directa,',
    eq: 'G(s)=\\dfrac{K}{s(s+7)}', post: 'está operando con una respuesta escalón en lazo cerrado que tiene 15% de sobrepaso. Haga lo siguiente:',
    items: ['Evalúe el error en estado estable para una entrada de rampa unitaria.',
      'Diseñe un compensador de atraso de fase para mejorar el error en estado estable en un factor de 20.',
      'Evalúe el error en estado estable para una entrada de rampa unitaria a este sistema compensado.',
      'Evalúe cuánta mejoría en error en estado estable se realizó.'],
    rows: [{ blocks: [{ n: 'K', d: 's(s + 7)' }] }] },
  p4: { ref: 'Nise · Ejemplo 9.3 · p. 515 · Diseño de un compensador derivativo ideal',
    text: 'Dado el sistema de la figura 9.17, diseñar un compensador derivativo ideal para obtener un sobrepaso de 16%, con una reducción de umbral en el tiempo de asentamiento.',
    rows: [{ blocks: [{ n: 'K', d: 's(s + 4)(s + 6)' }] }],
    cap: '<b>Figura 9.17</b> Sistema de control realimentado para el ejemplo 9.3.' },
  p5: { ej: true, ref: 'Nise · Ejercicio de evaluación de destreza 9.2 · p. 526',
    pre: 'Un sistema con realimentación unitaria con una función de transferencia en la trayectoria directa,',
    eq: 'G(s)=\\dfrac{K}{s(s+7)}', post: 'está operando con una respuesta escalón en lazo cerrado que tiene 15% de sobrepaso. Haga lo siguiente:',
    items: ['Evalúe el tiempo de asentamiento.',
      'Diseñe un compensador de adelanto de fase para reducir el tiempo de asentamiento en un factor de tres. Seleccione el cero del compensador que se encuentra en −10.'],
    rows: [{ blocks: [{ n: 'K', d: 's(s + 7)' }] }] },
  p6: { ref: 'Nise · Ejemplo 9.5 · p. 528 · Diseño de un controlador PID',
    text: 'Dado el sistema de la figura 9.31, diseñar un controlador PID para que el sistema pueda operar con un tiempo pico que es dos tercios del tiempo pico de un sistema no compensado a 20% de sobrepaso, y con error en estado estable cero para una entrada escalón.',
    rows: [{ blocks: [{ n: 'K(s + 8)', d: '(s + 3)(s + 6)(s + 10)' }] }],
    cap: '<b>Figura 9.31</b> Sistema no compensado de control realimentado para el ejemplo 9.5.' },
  p7: { ej: true, ref: 'Nise · Ejercicio de evaluación de destreza 9.3 · p. 541',
    pre: 'Un sistema con realimentación unitaria con una función de transferencia en la trayectoria directa,',
    eq: 'G(s)=\\dfrac{K}{s(s+7)}', post: 'está operando con una respuesta escalón en lazo cerrado que tiene 20% de sobrepaso. Haga lo siguiente:',
    items: ['Evalúe el tiempo de asentamiento.',
      'Evalúe el error en estado estable para una entrada rampa unitaria.',
      'Diseñe un compensador de adelanto-atraso de fase para reducir el tiempo de asentamiento en un factor de 2, y disminuir en 10 veces el error en estado estable para una entrada de rampa unitaria. Ponga el cero de adelanto de fase en −3.'],
    rows: [{ blocks: [{ n: 'K', d: 's(s + 7)' }] }] },
};

(async () => {
  const b = await chromium.launch();
  const page = await b.newPage();
  await page.goto('file://' + FILE);
  await page.waitForFunction(() => window.katex);
  await page.evaluate(async () => { await document.fonts.load('17px KaTeX_Main'); await document.fonts.load('italic 17px KaTeX_Math'); await document.fonts.load('13px "IBM Plex Sans"'); await document.fonts.ready; });
  const out = await page.evaluate((DATA) => {
    const K = (t, d) => katex.renderToString(t, { displayMode: !!d, output: 'html', throwOnError: true });
    const inl = s => s.replace(/\$([^$]+)\$/g, (m, t) => K(t));
    // ---- medición de texto ----
    const NS = 'http://www.w3.org/2000/svg';
    const host = document.createElementNS(NS, 'svg'); host.setAttribute('style', 'position:absolute;left:-9999px;top:0');
    host.setAttribute('class', 'bkq-svg'); document.body.appendChild(host);
    const FM = 17; // tamaño de las fórmulas en el viewBox
    const mt = s => s.replace(/[A-Za-z]/g, c => `<tspan class="v">${c}</tspan>`); // variables en cursiva
    function width(markup, cls) {
      const t = document.createElementNS(NS, 'text'); t.setAttribute('class', cls); t.innerHTML = markup; host.appendChild(t);
      const w = t.getComputedTextLength(); t.remove(); return w;
    }
    const r1 = v => Math.round(v * 10) / 10;
    function row(R, y0) {
      // devuelve {svg, w, h}
      const lab = R.blocks.some(b => b.t), frac = R.blocks.some(b => b.d);
      const bh = frac ? 54 : 36, yc = y0 + (lab ? 22 : 8) + bh / 2 + (lab ? 0 : 10);
      let s = '', x = 0;
      const arrow = (x1, x2) => `<path class="l" d="M${r1(x1)} ${yc}H${r1(x2 - 7)}"/><path class="a" d="M${r1(x2 - 9)} ${yc - 4.5}L${r1(x2)} ${yc}L${r1(x2 - 9)} ${yc + 4.5}z"/>`;
      const sig = (txt, xx, yy) => `<text class="m" x="${r1(xx)}" y="${r1(yy)}">${mt(txt)}</text>`;
      // entrada
      const cx = 62, r = 11;
      s += sig('R(s)', 2, yc - 8) + arrow(2, cx - r);
      s += `<text class="p" x="${cx - r - 10}" y="${yc - 5}">+</text>`;
      s += `<circle class="b" cx="${cx}" cy="${yc}" r="${r}"/>`;
      const k = r * 0.7071;
      s += `<path class="l" d="M${r1(cx - k)} ${r1(yc - k)}L${r1(cx + k)} ${r1(yc + k)}M${r1(cx - k)} ${r1(yc + k)}L${r1(cx + k)} ${r1(yc - k)}"/>`;
      s += `<text class="p" x="${cx - r - 13}" y="${yc + r + 13}">−</text>`;
      x = cx + r;
      R.blocks.forEach((B, i) => {
        const wn = width(mt(B.n), 'm'), wd = B.d ? width(mt(B.d), 'm') : 0;
        const bw = Math.max(wn, wd) + 18, gap = i === 0 ? 50 : 32;
        const x0 = x + gap;
        if (i === 0) s += sig('E(s)', x + 7, yc - 8);
        s += arrow(x, x0);
        s += `<rect class="b" x="${r1(x0)}" y="${yc - bh / 2}" width="${r1(bw)}" height="${bh}"/>`;
        if (B.t) s += `<text class="t" x="${r1(x0 + bw / 2)}" y="${yc - bh / 2 - 7}" text-anchor="middle">${B.t}</text>`;
        if (B.d) {
          const fl = Math.max(wn, wd) + 6;
          s += `<text class="m" x="${r1(x0 + bw / 2)}" y="${yc - 7}" text-anchor="middle">${mt(B.n)}</text>`;
          s += `<path class="l f" d="M${r1(x0 + bw / 2 - fl / 2)} ${yc}H${r1(x0 + bw / 2 + fl / 2)}"/>`;
          s += `<text class="m" x="${r1(x0 + bw / 2)}" y="${yc + 18}" text-anchor="middle">${mt(B.d)}</text>`;
        } else s += `<text class="m" x="${r1(x0 + bw / 2)}" y="${yc + 6}" text-anchor="middle">${mt(B.n)}</text>`;
        x = x0 + bw;
      });
      const xo = x + 20, xe = xo + 46, yf = yc + bh / 2 + 22;
      s += `<path class="l" d="M${r1(x)} ${yc}H${r1(xo)}"/>` + arrow(xo, xe) + sig('C(s)', xo + 6, yc - 8);
      s += `<circle class="a" cx="${r1(xo)}" cy="${yc}" r="2.8"/>`;
      s += `<path class="l" d="M${r1(xo)} ${yc}V${yf}H${cx}V${yc + r + 7}"/><path class="a" d="M${cx - 4.5} ${yc + r + 9}L${cx} ${yc + r}L${cx + 4.5} ${yc + r + 9}z"/>`;
      let h = yf + 4 - y0;
      return { s, w: xe + 2, h, tag: R.tag };
    }
    function diagram(D) {
      let y = 0, parts = [], W = 0;
      D.rows.forEach(R => { const o = row(R, y); parts.push({ ...o, y }); W = Math.max(W, o.w); y += o.h; if (R.tag) y += 26; else y += 2; if (D.rows.length > 1) y += 6; });
      let s = '';
      parts.forEach(p => {
        const dx = r1((W - p.w) / 2);
        s += `<g transform="translate(${dx} 0)">${p.s}</g>`;
        if (p.tag) s += `<text class="m g" x="${r1(W / 2)}" y="${p.y + p.h + 18}" text-anchor="middle"><tspan class="v">${p.tag[0]}</tspan>)</text>`;
      });
      const H = Math.ceil(y - (D.rows.length > 1 ? 6 : 0));
      const W2 = Math.ceil(W);
      const aria = D.ej ? 'Diagrama de bloques con realimentación unitaria (elaborado para esta página)' : 'Diagrama de bloques del libro: ' + D.cap.replace(/<[^>]+>/g, '');
      const svg = `<svg class="bkq-svg" viewBox="0 0 ${W2} ${H}" width="${W2}" height="${H}" style="--bw:${W2}" role="img" aria-label="${aria}">${s}</svg>`;
      const cap = D.ej
        ? `<figcaption class="bkq-fc"><span class="bkq-tag">No viene del libro</span> Diagrama de bloques elaborado para esta página con los datos del enunciado (realimentación unitaria y <span class="bkq-mi">G</span>(<span class="bkq-mi">s</span>) en la trayectoria directa); el libro no trae figura para este ejercicio.</figcaption>`
        : `<figcaption class="bkq-fc">${D.cap}</figcaption>`;
      return `<figure class="bkq-fig${D.ej ? ' nb' : ''}"><div class="bkq-sv">${svg}</div>${cap}</figure>`;
    }
    const res = {};
    for (const [id, D] of Object.entries(DATA)) {
      let q;
      if (D.ej) {
        q = `<p><b>Problema:</b> ${D.pre}</p><div class="bkq-eq">${K(D.eq, true)}</div><p>${D.post}</p><ol class="bkq-l">${D.items.map(t => `<li>${inl(t)}</li>`).join('')}</ol>`;
      } else q = `<p><b class="bkq-pb">Problema</b> ${D.text}</p>`;
      res[id] = `<figure class="bkq" data-bkq="${id}"><figcaption><span class="bkq-k">Enunciado del libro</span><span class="bkq-r">${D.ref}</span></figcaption><blockquote>${q}</blockquote>${diagram(D)}</figure>`;
    }
    host.remove();
    return res;
  }, DATA);
  await b.close();
  let s = fs.readFileSync(FILE, 'utf8');
  for (const [id, h] of Object.entries(out)) {
    const re = new RegExp(`<figure class="bkq" data-bkq="${id}">[\\s\\S]*?</blockquote>(?:<figure class="bkq-fig[\\s\\S]*?</figure>)?</figure>`);
    if (!re.test(s)) throw new Error('no encontré ' + id);
    s = s.replace(re, () => h);
  }
  fs.writeFileSync(FILE, s);
  console.log('ok', Object.keys(out).join(' '));
})();
