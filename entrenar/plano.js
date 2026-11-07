/* =====================================================================================================
   entrenar/plano.js · Plano s interactivo para responder en «Entrenar» · etapa 2
   ---------------------------------------------------------------------------------------------------
   mountPlane(host, opts) arma, dentro de host, una barra de herramientas y un plano s (SVG a escala 1:1, así los
   ángulos se ven como son) donde el alumno ubica polos (×), ceros (○) y puntos (•).
     opts = {view:{x0,x1,y0,y1}, marks:['x','o','.'], sym (pares conjugados), real (solo eje real), snap (paso del
             imán, en unidades del plano), max (cuántos elementos como máximo), magnet (imán encendido), ro (solo
             lectura), value (lista guardada), label, onChange(lista), onMagnet(encendido)}
   Devuelve {get, set, setMagnet, readOnly, mark, solution, destroy, el}.
   · Tocar el plano agrega un elemento de la herramienta elegida (y se puede arrastrar sin soltar); tocar uno existente
     lo selecciona y lo arrastra. Casillas Re/Im para el seleccionado (precisión y teclado); flechas lo mueven, Supr lo quita.
   · Imán: cada coordenada se pega a la cuadrícula (múltiplos de snap) si está a menos de 10 px (14 px en táctil) y a menos
     del 30 % del paso, y la parte imaginaria se pega al eje real. Si las líneas quedan a menos de 8 px, solo actúa el eje real.
     Regla para los ejercicios: tolerancia (abs) > 0.3·snap, así el imán nunca vuelve incorrecto un punto bien ubicado.
   · Con sym, la lista guarda un representante por par (Im ≥ 0) y se dibuja también su conjugado; el motor expande igual
     (entrenar/motor.js · expandPts), así que el índice de cada elemento dibujado coincide con el de la calificación.
   · mark(estados) colorea cada elemento dibujado (true = bien, false = mal); solution(lista, tol) dibuja la respuesta
     correcta con su círculo de tolerancia.
   ===================================================================================================== */

export const MK = {
  x: { n: 'Polo', s: '×', pl: 'Polos' },
  o: { n: 'Cero', s: '○', pl: 'Ceros' },
  '.': { n: 'Punto', s: '•', pl: 'Puntos' }
};
const r2 = v => Math.round(v * 100) / 100;
const num = v => { const s = String(+(+v).toFixed(3)); return s === '-0' ? '0' : s.replace(/^-/, '−'); };
/* texto de un punto (o de un par conjugado si pair) */
export function fmtPt(p, pair){
  const re = Math.abs(p.re) < 5e-4 ? 0 : p.re, im = Math.abs(p.im) < 5e-4 ? 0 : p.im;
  if (!im) return num(re);
  const sg = pair ? ' ± ' : im < 0 ? ' − ' : ' + ';
  return (re ? num(re) + sg : (pair ? '±' : im < 0 ? '−' : '')) + 'j' + num(Math.abs(im));
}
/* lista expandida → texto agrupado por tipo, juntando pares conjugados */
export function fmtList(list, marks){
  marks = marks || ['x', 'o', '.'];
  const by = t => { const L = list.filter(p => (marks.length === 1 || p.t === t)), used = new Set(), out = [];
    L.forEach((p, i) => { if (used.has(i)) return; used.add(i);
      if (Math.abs(p.im) > 1e-9) { const j = L.findIndex((q, k) => !used.has(k) && Math.abs(q.re - p.re) < 1e-6 && Math.abs(q.im + p.im) < 1e-6);
        if (j >= 0) { used.add(j); out.push(fmtPt({ re: p.re, im: Math.abs(p.im) }, true)); return; } }
      out.push(fmtPt(p)); });
    return out; };
  return marks.map(t => { const o = by(t); return `${MK[t].pl} (${MK[t].s}): ${o.length ? o.join(', ') : 'ninguno'}`; }).join(' · ');
}

const GLYPH = {
  x: (x, y, r) => `<path d="M${x - r} ${y - r}L${x + r} ${y + r}M${x - r} ${y + r}L${x + r} ${y - r}"/>`,
  o: (x, y, r) => `<circle cx="${x}" cy="${y}" r="${r * 1.05}"/>`,
  '.': (x, y, r) => `<circle cx="${x}" cy="${y}" r="${r * 0.72}"/>`
};
const ICON = t => `<svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true" class="pl-ic pl-${t === '.' ? 'p' : t}">${GLYPH[t](10, 10, 5.5)}</svg>`;
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
let UID = 0;

export function mountPlane(host, opts){
  const o = Object.assign({ marks: ['x'], sym: false, real: false, snap: 0.5, max: 12, magnet: true, ro: false, label: 'Plano s' }, opts || {});
  const V = o.view, uid = 'pl' + (++UID);
  let items = [], sel = -1, tool = o.marks[0], mag = !!o.magnet, ro = !!o.ro, marks = null, sol = null, drag = null;
  let W = 0, H = 0, k = 1, touch = false, msgT = 0;

  host.classList.add('pl');
  host.innerHTML = `
    <div class="pl-bar" role="toolbar" aria-label="Herramientas del plano">
      ${o.marks.length > 1 ? `<div class="seg pl-tools" role="group" aria-label="Qué agregar">${o.marks.map(t => `<button type="button" data-tool="${t === '.' ? 'p' : t}" aria-pressed="${t === tool}">${ICON(t)}${MK[t].n}</button>`).join('')}</div>`
        : `<span class="pl-one">${ICON(tool)}${MK[tool].pl}${o.sym ? ' <small>(pares conjugados)</small>' : ''}${o.real ? ' <small>(sobre el eje real)</small>' : ''}</span>`}
      <span class="pl-sp"></span>
      <button type="button" class="btn sm pl-mag" data-mag aria-pressed="${mag}" title="Pegar a la cuadrícula y al eje real"><svg viewBox="0 0 20 20" width="15" height="15" aria-hidden="true"><path d="M5 3v7a5 5 0 0 0 10 0V3h-3.5v7a1.5 1.5 0 0 1-3 0V3z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M5 6h3.5M11.5 6H15" stroke="currentColor" stroke-width="1.8"/></svg>Imán</button>
      <button type="button" class="btn sm" data-add title="Agregar en el centro y escribir sus coordenadas">+ Agregar</button>
      <button type="button" class="btn sm" data-del disabled>Quitar</button>
      <button type="button" class="btn sm" data-clr>Limpiar</button>
    </div>
    <div class="pl-wrap"><svg class="pl-svg" tabindex="0" role="application" aria-roledescription="plano s" aria-label="${esc(o.label)}: toca para agregar, arrastra para mover; flechas mueven el seleccionado y Supr lo quita" aria-describedby="${uid}-l"></svg><div class="pl-msg" aria-live="polite"></div></div>
    <div class="pl-ed" hidden><span class="pl-edk"></span>
      <label>Re <input data-pc="re" data-label="Re del seleccionado" autocomplete="off" spellcheck="false" aria-label="Parte real del seleccionado"></label>
      <label>Im <input data-pc="im" data-label="Im del seleccionado" autocomplete="off" spellcheck="false" aria-label="Parte imaginaria del seleccionado"></label></div>
    <div class="pl-list" id="${uid}-l" aria-live="polite"></div>`;
  const svg = host.querySelector('svg.pl-svg'), wrap = host.querySelector('.pl-wrap'), ed = host.querySelector('.pl-ed'), list = host.querySelector('.pl-list'), msg = host.querySelector('.pl-msg');
  const inRe = ed.querySelector('[data-pc=re]'), inIm = ed.querySelector('[data-pc=im]');

  /* ---------------------------------------------------------------- geometría */
  const X = re => (re - V.x0) * k, Y = im => (V.y1 - im) * k;
  const world = e => { const r = svg.getBoundingClientRect(); return { re: V.x0 + (e.clientX - r.left) * (W / r.width) / k, im: V.y1 - (e.clientY - r.top) * (H / r.height) / k }; };
  const clampV = p => ({ re: Math.min(V.x1, Math.max(V.x0, p.re)), im: Math.min(V.y1, Math.max(V.y0, p.im)) });
  function snapPt(p){
    let { re, im } = clampV(p), hx = false, hy = false;
    if (o.real) { im = 0; hy = true; }
    if (mag) {
      const R = touch ? 14 : 10, g = o.snap;
      /* se pega a la línea de la cuadrícula solo si está cerca (≤ 30 % del paso): así nunca mueve un punto bien ubicado
         más de 0.3·snap, y la tolerancia de cada casilla se elige mayor que eso */
      if (g && g * k >= 8) {
        const lim = Math.min(R, g * k * 0.3);
        const gx = Math.round(re / g) * g; if (Math.abs(gx - re) * k <= lim) { re = gx; hx = true; }
        const gy = Math.round(im / g) * g; if (!o.real && Math.abs(gy - im) * k <= lim) { im = gy; hy = true; }
      }
      if (!o.real && Math.abs(im) * k <= R * 1.3) { im = 0; hy = true; }
    }
    return { re: r2(re), im: r2(im), hit: hx && hy };
  }
  /* lo dibujado: cada representante y, con sym, su conjugado (mismo orden que motor.expandPts) */
  function shown(){
    const out = [];
    items.forEach((p, i) => { const im = o.real ? 0 : p.im; out.push({ i, m: false, t: p.t, re: p.re, im });
      if (o.sym && !o.real && Math.abs(im) > 1e-9) out.push({ i, m: true, t: p.t, re: p.re, im: -im }); });
    return out;
  }
  const count = t => shown().filter(p => p.t === t).length;
  const total = () => shown().length;

  /* ---------------------------------------------------------------- dibujo */
  function size(){
    const cw = wrap.clientWidth; if (!cw) return false;
    const asp = (V.y1 - V.y0) / (V.x1 - V.x0), maxH = Math.max(220, Math.min(innerHeight * 0.6, 480));
    let w = cw, h = w * asp; if (h > maxH) { h = maxH; w = h / asp; }
    W = Math.round(w); H = Math.round(h); k = W / (V.x1 - V.x0);
    svg.setAttribute('width', W); svg.setAttribute('height', H); svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    return true;
  }
  function majorStep(){ for (const s of [0.5, 1, 2, 5, 10, 20, 50]) if (s * k >= 44) return s; return 100; }
  function draw(){
    if (!W && !size()) return;
    let g = '';
    /* cuadrícula fina (la del imán) y gruesa con números */
    const st = majorStep(), fine = o.snap && o.snap * k >= 8 ? o.snap : 0;
    const lines = (step, cls) => { let s = '';
      for (let x = Math.ceil(V.x0 / step) * step; x <= V.x1 + 1e-9; x += step) s += `M${X(x).toFixed(1)} 0V${H}`;
      for (let y = Math.ceil(V.y0 / step) * step; y <= V.y1 + 1e-9; y += step) s += `M0 ${Y(y).toFixed(1)}H${W}`;
      return `<path class="${cls}" d="${s}"/>`; };
    if (fine && fine < st) g += lines(fine, 'pl-g0');
    g += lines(st, 'pl-g1');
    g += `<path class="pl-ax" d="M0 ${Y(0)}H${W}M${X(0)} 0V${H}"/>`;
    const yl = Math.min(H - 4, Math.max(12, Y(0) + 13)), xl = Math.min(W - 4, Math.max(4, X(0) - 5));
    let t = '';
    for (let x = Math.ceil(V.x0 / st) * st; x <= V.x1 + 1e-9; x += st) if (Math.abs(x) > 1e-9 && X(x) > 8 && X(x) < W - 8) t += `<text x="${X(x).toFixed(1)}" y="${yl}" text-anchor="middle">${num(x)}</text>`;
    for (let y = Math.ceil(V.y0 / st) * st; y <= V.y1 + 1e-9; y += st) if (Math.abs(y) > 1e-9 && Y(y) > 10 && Y(y) < H - 6) t += `<text x="${xl}" y="${(Y(y) + 4).toFixed(1)}" text-anchor="end">${y < 0 ? '−' : ''}j${num(Math.abs(y))}</text>`;
    g += `<g class="pl-tk">${t}<text x="${W - 5}" y="${Math.max(12, Y(0) - 6)}" text-anchor="end" class="pl-axn">σ</text><text x="${X(0) + 6}" y="13" class="pl-axn">jω</text></g>`;
    /* respuesta correcta (después de calificar o con la solución abierta) */
    if (sol) sol.list.forEach(p => { const r = Math.max(6, sol.tol(p) * k);
      g += `<g class="pl-sol"><circle class="pl-tol" cx="${X(p.re)}" cy="${Y(p.im)}" r="${r}"/><g class="pl-m">${GLYPH[o.marks.includes(p.t) ? p.t : o.marks[0]](X(p.re), Y(p.im), 6)}</g></g>`; });
    /* elementos del alumno */
    const S = shown(), rr = touch ? 8 : 7;
    S.forEach((p, n) => {
      const cx = X(p.re), cy = Y(p.im), on = p.i === sel, mk = marks && marks[n] != null ? (marks[n] ? ' ok' : ' bad') : '';
      if (on && !ro) g += `<path class="pl-guide" d="M${cx} ${cy}V${Y(0)}M${cx} ${cy}H${X(0)}"/><circle class="pl-halo${drag && drag.hit ? ' hit' : ''}" cx="${cx}" cy="${cy}" r="${rr + 7}"/>`;
      g += `<g class="pl-it pl-${p.t === '.' ? 'p' : p.t}${p.m ? ' mir' : ''}${mk}">${GLYPH[p.t](cx, cy, rr)}</g>`;
      if (mk === ' bad') g += `<circle class="pl-badr" cx="${cx}" cy="${cy}" r="${rr + 5}"/>`;
    });
    /* coordenadas del seleccionado */
    if (sel >= 0 && items[sel] && !ro) {
      const p = items[sel], im = o.real ? 0 : p.im, cx = X(p.re), cy = Y(im), s = fmtPt({ re: p.re, im }, o.sym && Math.abs(im) > 1e-9);
      const w = s.length * 7.4 + 12, lx = Math.min(W - w - 2, Math.max(2, cx + 12)), ly = cy - 30 < 2 ? cy + 14 : cy - 30;
      g += `<g class="pl-rd${drag && drag.hit ? ' hit' : ''}"><rect x="${lx}" y="${ly}" width="${w}" height="20" rx="5"/><text x="${lx + 6}" y="${ly + 14}">${s}</text></g>`;
    }
    svg.innerHTML = g;
  }
  function side(){
    /* barra, editor y lista */
    host.querySelectorAll('[data-tool]').forEach(b => b.setAttribute('aria-pressed', String((b.dataset.tool === 'p' ? '.' : b.dataset.tool) === tool)));
    host.querySelector('[data-mag]').setAttribute('aria-pressed', String(mag));
    host.querySelector('[data-del]').disabled = ro || sel < 0;
    host.querySelector('[data-clr]').disabled = ro || !items.length;
    host.querySelector('[data-add]').disabled = ro;
    host.classList.toggle('ro', ro);
    const p = items[sel];
    ed.hidden = ro || !p;
    if (p) {
      ed.querySelector('.pl-edk').innerHTML = `${ICON(p.t)}${MK[p.t].n}${o.sym && Math.abs(p.im) > 1e-9 ? ' (y su conjugado)' : ''}`;
      if (document.activeElement !== inRe) inRe.value = num(p.re).replace('−', '-');
      if (document.activeElement !== inIm) inIm.value = num(o.real ? 0 : p.im).replace('−', '-');
      inIm.disabled = !!o.real; inIm.parentNode.hidden = !!o.real;
    }
    const S = shown();
    list.innerHTML = items.length ? items.map((q, i) => { const im = o.real ? 0 : q.im, pair = o.sym && Math.abs(im) > 1e-9;
      const ns = S.map((s, n) => s.i === i ? n : -1).filter(n => n >= 0), st = marks ? (ns.every(n => marks[n]) ? ' ok' : ns.some(n => marks[n] === false) ? ' bad' : '') : '';
      return `<button type="button" class="pl-chip${i === sel ? ' on' : ''}${st}" data-sel="${i}" ${ro ? 'tabindex="-1"' : ''}>${ICON(q.t)}${fmtPt({ re: q.re, im }, pair)}</button>`; }).join('')
      : `<span class="pl-empty">${ro ? 'No ubicaste nada.' : 'Toca el plano para agregar.'}</span>`;
  }
  const paint = () => { draw(); side(); };
  const emit = () => { marks = null; if (o.onChange) o.onChange(get()); };
  const say = s => { msg.textContent = s; msg.classList.add('on'); clearTimeout(msgT); msgT = setTimeout(() => msg.classList.remove('on'), 2200); };

  /* ---------------------------------------------------------------- acciones */
  function add(t, p){
    if (total() >= o.max) { say(`Máximo ${o.max} en este plano. Quita uno o arrastra uno que ya pusiste.`); return -1; }
    const q = { t, re: p.re, im: o.real ? 0 : (o.sym ? Math.abs(p.im) : p.im) };
    if (o.sym && Math.abs(q.im) > 1e-9 && total() + 2 > o.max) { say(`Máximo ${o.max}: un par conjugado cuenta como dos.`); return -1; }
    items.push(q); sel = items.length - 1; return sel;
  }
  function remove(i){ if (i < 0 || !items[i]) return; items.splice(i, 1); sel = -1; paint(); emit(); }
  function moveTo(i, p, mir){
    const q = items[i]; if (!q) return;
    q.re = p.re; q.im = o.real ? 0 : o.sym ? Math.abs(p.im) : (mir ? -p.im : p.im);
  }
  function hitTest(e){
    const r = svg.getBoundingClientRect(), px = (e.clientX - r.left) * (W / r.width), py = (e.clientY - r.top) * (H / r.height);
    const R = touch ? 22 : 14; let best = null, bd = R;
    shown().forEach(p => { const d = Math.hypot(X(p.re) - px, Y(p.im) - py); if (d <= bd) { bd = d; best = p; } });
    return best;
  }

  svg.addEventListener('pointerdown', e => {
    if (ro || (e.button != null && e.button > 0)) return;
    touch = e.pointerType === 'touch' || e.pointerType === 'pen';
    const h = hitTest(e);
    let i, mir = false, hit = false;
    if (h) { i = h.i; mir = h.m; sel = i; }
    else { const p = snapPt(world(e)); i = add(tool, p); if (i < 0) { paint(); return; } mir = o.sym && p.im < 0; hit = p.hit; }
    drag = { i, mir, hit, id: e.pointerId, add: !h, moved: false };
    try { svg.setPointerCapture(e.pointerId); } catch (_) {}
    e.preventDefault(); svg.focus({ preventScroll: true, focusVisible: false });
    paint();
  });
  svg.addEventListener('pointermove', e => {
    if (!drag || e.pointerId !== drag.id) return;
    const p = snapPt(world(e)); drag.hit = p.hit; drag.moved = true;
    moveTo(drag.i, p, drag.mir); draw();
  });
  const up = e => { if (!drag || e.pointerId !== drag.id) return; const ch = drag.moved || drag.add; drag = null; paint(); if (ch) emit(); };
  svg.addEventListener('pointerup', up); svg.addEventListener('pointercancel', up);
  svg.addEventListener('keydown', e => {
    if (ro) return;
    if (sel < 0) { if (/^Arrow/.test(e.key) && items.length) { sel = 0; paint(); e.preventDefault(); } return; }
    const q = items[sel], st = e.shiftKey ? 0.01 : (o.snap || 0.1);
    const dx = { ArrowLeft: -st, ArrowRight: st }[e.key] || 0, dy = o.real ? 0 : ({ ArrowUp: st, ArrowDown: -st }[e.key] || 0);
    if (dx || dy) { e.preventDefault(); moveTo(sel, clampV({ re: r2(q.re + dx), im: r2(q.im + dy) })); paint(); emit(); return; }
    if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); remove(sel); return; }
    if (e.key === 'Escape') { sel = -1; paint(); return; }
    if (e.key === 'n' || e.key === 'N') { sel = (sel + 1) % items.length; paint(); }
  });
  host.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b || !host.contains(b) || ro) return;
    if (b.dataset.tool) { tool = b.dataset.tool === 'p' ? '.' : b.dataset.tool; side(); return; }
    if ('mag' in b.dataset) { mag = !mag; side(); if (o.onMagnet) o.onMagnet(mag); say(mag ? 'Imán encendido: se pega a la cuadrícula y al eje real.' : 'Imán apagado: posición libre.'); return; }
    if ('add' in b.dataset) { const c = { re: r2((V.x0 + V.x1) / 2), im: 0 }; if (add(tool, c) >= 0) { paint(); emit(); inRe.focus(); inRe.select(); } else paint(); return; }
    if ('del' in b.dataset) { remove(sel); return; }
    if ('clr' in b.dataset) { items = []; sel = -1; paint(); emit(); return; }
    if (b.dataset.sel != null) { sel = +b.dataset.sel; paint(); return; }
  });
  const rd = s => { s = String(s).trim().replace(/[−–]/g, '-').replace(',', '.'); if (!/^[-+]?(\d+\.?\d*|\.\d+)(e[-+]?\d+)?$/i.test(s)) return null; return +s; };
  ed.addEventListener('input', e => {
    const q = items[sel]; if (!q || ro) return;
    const v = rd(e.target.value); if (v == null) return;
    const p = { re: q.re, im: q.im }; if (e.target === inRe) p.re = v; else p.im = v;
    moveTo(sel, p); draw(); side(); emit();
  });
  ed.addEventListener('change', () => side());
  ed.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); side(); svg.focus({ preventScroll: true }); } });

  const ro_ = new ResizeObserver(() => { if (size()) draw(); });
  ro_.observe(wrap);

  /* ---------------------------------------------------------------- API */
  function get(){ return items.map(p => ({ t: p.t, re: r2(p.re), im: o.real ? 0 : r2(p.im) })); }
  function set(v){ items = (v || []).filter(p => p && MK[p.t] && Number.isFinite(p.re) && Number.isFinite(p.im)).map(p => ({ t: o.marks.includes(p.t) ? p.t : o.marks[0], re: p.re, im: o.real ? 0 : o.sym ? Math.abs(p.im) : p.im })); sel = -1; marks = null; paint(); }
  set(o.value);
  return {
    el: host, get, set,
    setMagnet(b){ mag = !!b; side(); },
    readOnly(b){ ro = !!b; if (ro) { sel = -1; drag = null; } paint(); },
    mark(m){ marks = m || null; paint(); },
    solution(lst, tol){ sol = lst ? { list: lst, tol: typeof tol === 'function' ? tol : () => tol || 0.15 } : null; draw(); },
    destroy(){ ro_.disconnect(); host.innerHTML = ''; host.classList.remove('pl', 'ro'); }
  };
}
