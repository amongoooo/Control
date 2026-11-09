/* =====================================================================================================
   entrenar/ui.js · Pestaña «Entrenar» del Laboratorio LGDR · etapa 1 (pestaña, motor y guardado) + etapa 2 (plano s)
   ---------------------------------------------------------------------------------------------------
   index.html la carga con import() la primera vez que se abre #entrenar y llama init(section) cada vez que se muestra.
   Vistas: inicio (avance, modo, temas con sus ejercicios, historial) y ejercicio (enunciado, incisos con casillas,
   Comprobar / Ver solución en modo práctica, Entregar en modo examen, resultado).
   Calculadora: la de la página (entrenar/calc.js vía window.__lgdrCalcUI). Con un ejercicio abierto aparece su botón
   flotante y «→ Respuesta» escribe en la última casilla tocada (o la primera vacía).
   Casillas de plano s (etapa 2): entrenar/plano.js; lo ubicado se guarda en ST.A[campo] como texto (motor.ptsStr).
   Etapa 3 (calculadora en los ejercicios): «→ Respuesta» también escribe en los planos (complejos y todas las raíces de
   «Ecuación»), botones por inciso que abren Ecuación grado n / Solver / Complejos (inc.tools), y Ans y memorias en las casillas.
   Etapa 5: ejercicios con def.casos (temas 14 y 15) muestran botones P2…P7 para elegir el caso de la tarea (semilla −N).
   Etapa 4: casillas de opción (fl.ch = [{v, l}], p. ej. Sí / No) como botones; la respuesta guardada es el número v.
   Etapa 6: tema 16 (problema completo; sus incisos van agrupados por partes con inc.sec), examen de varios ejercicios seguidos
   (sin calificación hasta entregar; resultados por ejercicio, total, tiempo y revisión de cada uno con sus soluciones; estado en
   localStorage['lgdr-entrena-examen']) y repaso de errores (ejercicios con incisos fallados que aún no corriges, motor.pending).
   Preferencias (modo, caso/variante, imán y opciones del examen) en localStorage['lgdr-entrena-pref'] (solo este dispositivo).
   ===================================================================================================== */
import * as M from './motor.js?v=5';
import { TEMAS, EJ, byId } from './ejercicios.js?v=9';
import { mountPlane, fmtList } from './plano.js?v=2';

const d = document, root = d.documentElement, PREF = 'lgdr-entrena-pref';
const TIPO = { p: 'ganancia', pi: 'PI', atraso: 'atraso', pd: 'PD', adelanto: 'adelanto', pid: 'PID', adatr: 'adelanto‑atraso' };
const K_ = () => window.katex;
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const strip = s => String(s).replace(/<[^>]+>/g, '');
/* v73 · una fórmula en línea y la puntuación que la sigue («…T(s)», «%)?») no se separan al cambiar de renglón */
function glue(el){
  el.querySelectorAll('.katex:not(.katex-display .katex)').forEach(k => {
    const t = k.nextSibling; if (!t || t.nodeType !== 3) return;
    const m = /^[.,;:)?!]+/.exec(t.data); if (!m || (k.parentNode && k.parentNode.classList && k.parentNode.classList.contains('en-nw'))) return;
    const w = d.createElement('span'); w.className = 'en-nw';
    k.parentNode.insertBefore(w, k); w.appendChild(k); w.appendChild(d.createTextNode(m[0])); t.data = t.data.slice(m[0].length);
  });
}

/* utilidades de dibujo para los ejercicios */
/* v73 · en pantallas angostas, dos ecuaciones lado a lado («A,\qquad B») van una debajo de otra (sin deslizar de lado) */
const NARROW = window.matchMedia('(max-width: 600px)');
function stack(t){
  const out = []; let dep = 0, env = 0, last = 0;
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (c === '\\') { if (t.startsWith('\\begin{', i)) env++; else if (t.startsWith('\\end{', i)) env--;
      else if (!dep && !env && t.startsWith('\\qquad', i) && !/[a-zA-Z]/.test(t[i + 6] || '')) { out.push(t.slice(last, i).replace(/(\s|~|\\[,;:! ])*[,;]?(\s|~|\\[,;:! ])*$/, '')); last = i + 6; }
      i++; continue; }
    if (c === '{') dep++; else if (c === '}') dep--;
  }
  if (!out.length) return t;
  out.push(t.slice(last));
  return `\\begin{gathered}${out.map(x => x.trim()).filter(Boolean).join(' \\\\[2pt] ')}\\end{gathered}`;
}
/* respaldo: «A = B = C» que no cabe → un «=» por renglón (aligned). null si no hay qué partir */
function breakEq(t){
  const parts = [], ops = []; let dep = 0, last = 0;
  if (/\\begin\{/.test(t)) return null;
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (c === '\\') { const m = /^\\(Rightarrow|approx)(?![a-zA-Z])/.exec(t.slice(i));
      if (m && !dep) { parts.push(t.slice(last, i)); ops.push(m[0]); last = i + m[0].length; i = last - 1; continue; }
      i++; continue; }
    if (c === '{') dep++; else if (c === '}') dep--;
    else if (c === '=' && !dep) { parts.push(t.slice(last, i)); ops.push('='); last = i + 1; }
  }
  if (!ops.length) return null;
  parts.push(t.slice(last));
  /* con «⇒» se parte solo ahí (lo de cada lado se lee junto); los tramos cortos siguen en el mismo renglón */
  const cl = x => x.trim().replace(/^(\\[,;:! ]|~|\s)+|(\\[,;:! ]|~|\s)+$/g, '');
  const imp = ops.includes('\\Rightarrow'), rows = [cl(parts[0]) + ' &' + ops[0] + ' ' + cl(parts[1])];
  ops.slice(1).forEach((o, j) => { const seg = cl(parts[j + 2]);
    if ((imp && o !== "\\Rightarrow") || (seg.length < 12 && rows.length > 1)) rows[rows.length - 1] += ` ${o} ${seg}`; else rows.push(`&${o} ${seg}`); });
  if (imp && ops[0] !== '\\Rightarrow') { const i = ops.indexOf('\\Rightarrow'); rows.length = 0;
    const L = parts.slice(0, i + 1).map((x, j) => (j ? ops[j - 1] + ' ' : '') + cl(x)).join(' '), R = parts.slice(i + 1).map((x, j) => (j ? ops[i + j] + ' ' : '') + cl(x)).join(' ');
    return `\\begin{gathered}${L} \\\\ \\Rightarrow\\; ${R}\\end{gathered}`; }
  return rows.length > 1 ? `\\begin{aligned}${rows.join(' \\\\ ')}\\end{aligned}` : null;
}
/* fórmulas en bloque que no caben a lo ancho (ya visibles): se vuelven a dibujar partidas */
function fit(el){
  const k = K_(); if (!k) return;
  el.querySelectorAll('.katex-display').forEach(dv => {
    if (dv.dataset.fit || !dv.clientWidth || dv.scrollWidth <= dv.clientWidth + 1) return;
    const a = dv.querySelector('annotation'), b = a && breakEq(a.textContent); dv.dataset.fit = '1'; if (!b) return;
    try { dv.outerHTML = k.renderToString(b, { displayMode: true, throwOnError: false, strict: 'ignore' }).replace('class="katex-display"', 'class="katex-display" data-fit="1"'); } catch (e) {}
  });
}
const tx = (t, disp) => { const k = K_(); if (!k) return `<code>${esc(t)}</code>`;
  if (disp && NARROW.matches) t = stack(t);
  try { return k.renderToString(t, { displayMode: !!disp, throwOnError: false, strict: 'ignore' }); } catch (e) { return `<code>${esc(t)}</code>`; } };
const nT = v => { if (v && typeof v === 'object') v = v.re; if (!Number.isFinite(v)) return v > 0 ? '\\infty' : '—';
  if (Math.abs(v) < 1e-10) return '0'; const a = Math.abs(v);
  if (a >= 1e5 || a < 1e-3) { const [m, e] = v.toExponential(3).split('e'); return `${+m}\\times10^{${+e}}`; }
  return String(+v.toPrecision(a >= 100 ? 5 : 4)); };
const H = { tx, n: nT, f: v => M.fmt(v) };

let SEC = null, BOX = null, view = 'home', X = null, ST = null, built = false, PL = {}, XM = null;
const dropPlanes = () => { Object.values(PL).forEach(p => p.destroy()); PL = {}; };
const PDEF = { mode: 'p', src: 't', mag: 1, xn: '6', xc: 'all', xd: 'v' };
/* «etiqueta = valor» sin repetir el «=» cuando la etiqueta ya lo trae («Tramo 1: de σ =») */
const eqL = l => strip(l) === 'Respuesta' ? '' : /=\s*$/.test(strip(l)) ? l : l + ' =';
const pref = () => { try { return Object.assign({}, PDEF, JSON.parse(localStorage.getItem(PREF) || '{}')); } catch (e) { return Object.assign({}, PDEF); } };
const setPref = o => { try { localStorage.setItem(PREF, JSON.stringify(Object.assign(pref(), o))); } catch (e) {} };

/* ------------------------------------------------------------------ calculadora */
function calcOn(on){ root.classList.toggle('en-ex', !!on); if (window.__lgdrCcSync) window.__lgdrCcSync(); }
function calcOpen(){ const cu = window.__lgdrCalcUI; if (cu) cu.toggle(); }
/* etapa 3 · botones de herramienta de cada inciso (inc.tools): abren la calculadora en esa app y dejan «→ Respuesta»
   apuntando al inciso (su plano o su primera casilla vacía). t = {app:'eqn', n} | {app:'solve'} | {app:'cplx'} */
const TOOL_ICO = '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><rect x="5" y="2.5" width="14" height="19" rx="2.5"/><path d="M8.5 6.5h7M8.5 11h.01M12 11h.01M15.5 11h.01M8.5 14.5h.01M12 14.5h.01M15.5 14.5h.01M8.5 18h.01M12 18h.01M15.5 18h.01" stroke-width="2.4"/></svg>';
const toolsOf = (inc, P) => { const t = typeof inc.tools === 'function' ? inc.tools(P) : inc.tools; return Array.isArray(t) ? t.filter(Boolean) : []; };
const toolLbl = t => t.app === 'eqn' ? `Ecuación · grado ${t.n}` : t.app === 'solve' ? 'Solver' : t.app === 'cplx' ? 'Complejos' : 'Calculadora';
function toolGo(k, j){
  const inc = X.def.inc.find(i => i.k === k), t = inc && toolsOf(inc, X.P)[+j], cu = window.__lgdrCalcUI; if (!t || !cu || !cu.use) return;
  const li = BOX.querySelector(`.en-inc[data-i="${k}"]`), ins = [...li.querySelectorAll('input[data-ans]:not([readonly])')];
  cu.setTarget(li.querySelector('.en-pl') || ins.find(i => !i.value.trim()) || ins[0]);
  cu.use(c => { if (t.app === 'eqn' && c.poly) c.poly(t.n); else if (t.app === 'solve' && c.solver) c.solver(); else if (c.app) c.app(t.app); });
}
/* Ans o memorias en una casilla → su valor (al salir de la casilla, al comprobar y al entregar) */
function freezeIn(i){
  if (!i || !ST || ST.done || i.readOnly) return false;
  const v = M.freeze(i.value); if (v == null) return false;
  const pv = BOX.querySelector(`[data-pv="${i.dataset.k}"]`);
  i.value = v; ST.A[i.dataset.k] = v; save();
  if (pv) { pv.textContent = 'tomado de la calculadora'; pv.classList.remove('bad'); pv.dataset.frz = '1'; }
  return true;
}
const freezeAll = scope => (scope || BOX).querySelectorAll('input[data-ans]').forEach(freezeIn);
/* para leer expresiones en las casillas hace falta el motor de la calculadora */
function needCalc(){ const cu = window.__lgdrCalcUI; if (window.LGDRCalc || !cu || !cu.load) return Promise.resolve(); return cu.load().catch(() => {}); }

/* ------------------------------------------------------------------ inicio */
function pctTag(e){
  if (!e || !e.n) return '<span class="pill">Nuevo</span>';
  const b = e.best || 0;
  return b >= M.PASS ? `<span class="pill ok">Dominado · ${b} %</span>` : `<span class="pill warn">Mejor ${b} %</span>`;
}
function home(){
  view = 'home'; X = null; ST = null; calcOn(false); dropPlanes();
  const D = M.load(), S = M.stats(EJ), P = pref(), cur = M.loadCur(), cd = cur && byId(cur.e);
  const ring = S.tot ? S.dom / S.tot : 0;
  const when = t => { const x = new Date(t); return x.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' }) + ' ' + x.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }); };
  const hist = D.h.filter(h => byId(h.e)).slice(0, 8);
  XM = M.loadExam();
  BOX.innerHTML = `
  <div class="card en-hero">
    <div class="en-ring" style="--v:${ring}" aria-hidden="true"><b>${Math.round(ring * 100)}<small>%</small></b></div>
    <div class="en-hm">
      <p class="en-big"><b>${S.dom}</b> de <b>${S.tot}</b> ejercicios dominados <span class="en-mut">(${M.PASS} % o más)</span></p>
      <p class="en-mut">${S.n} ${S.n === 1 ? 'intento' : 'intentos'} · tu avance se guarda en este navegador y entra en «Sincronizar progreso».</p>
      <div class="en-opts">
        <div class="en-opt"><span>Modo</span><div class="seg" data-pref="mode" role="group" aria-label="Modo">
          <button data-v="p" aria-pressed="${P.mode === 'p'}">Práctica</button><button data-v="x" aria-pressed="${P.mode === 'x'}">Examen</button></div></div>
        <div class="en-opt"><span>Datos</span><div class="seg" data-pref="src" role="group" aria-label="Datos del ejercicio">
          <button data-v="t" aria-pressed="${P.src === 't'}">Caso de la tarea</button><button data-v="v" aria-pressed="${P.src === 'v'}">Variante aleatoria</button></div></div>
      </div>
      <p class="en-help">${P.mode === 'p' ? '<b>Práctica:</b> comprueba cada inciso al momento y, si te atoras, abre su solución (ese inciso ya no cuenta).' : '<b>Examen:</b> sin ayudas; al entregar ves tu calificación y todas las soluciones.'}
        Se acepta ±1 % del valor correcto, y si un error tuyo se arrastra a los incisos siguientes pero el método está bien, esos incisos cuentan completos (<i>con arrastre</i>).</p>
    </div>
  </div>
  ${cd ? `<div class="card en-cont"><div><b>Continuar:</b> ${esc(cd.t)} <span class="en-mut">· ${cur.seed > 0 ? 'variante #' + cur.seed : 'caso de la tarea' + (cur.seed < 0 ? ' P' + (-cur.seed) : '')} · ${cur.mode === 'x' ? 'examen' : 'práctica'}</span></div>
    <div class="en-row"><button class="btn primary" data-cont>Continuar →</button><button class="btn" data-drop>Descartar</button></div></div>` : ''}
  ${XM && !XM.done ? `<div class="card en-cont"><div><b>Examen en curso:</b> ejercicio ${XM.i + 1} de ${XM.items.length} <span class="en-mut">· ${XM.items.filter((it, i) => answered(i)).length} con respuestas · ⏱ ${clock(XM.el)}</span></div>
    <div class="en-row"><button class="btn primary" data-xcont>Continuar examen →</button><button class="btn" data-xdrop>Abandonar</button></div></div>` : ''}
  ${p9Card(D)}
  <div class="en-two">${examCard(P, D)}${repasoCard()}</div>
  <h3 class="en-h3">Temas</h3>
  <div class="en-temas">${TEMAS.map(T => { const xs = EJ.filter(e => e.tema === T.n);
    return `<div class="en-tema${xs.length ? '' : ' soon'}"><div class="en-tt"><span class="en-tn">${T.n}</span><b>${esc(T.t)}</b></div>${xs.length
      ? xs.map(e => `<button class="en-ej" data-ej="${e.id}"><span class="en-ejt">${esc(e.t)}<small>${esc(e.d)}</small></span>${pctTag(D.ex[e.id])}<i aria-hidden="true">›</i></button>`).join('')
      : `<p class="en-mut en-soon">Sus ejercicios llegan en la etapa ${T.e}.</p>`}</div>`; }).join('')}</div>
  <h3 class="en-h3">Últimos intentos</h3>
  ${hist.length ? `<div class="card en-hist"><table><thead><tr><th>Ejercicio</th><th>Datos</th><th>Modo</th><th>Calificación</th><th>Fecha</th></tr></thead><tbody>${hist.map(h => `<tr><td>${esc(byId(h.e).t)}</td><td>${h.r > 0 ? '#' + h.r : h.r < 0 ? 'Tarea P' + (-h.r) : 'Tarea'}</td><td>${h.x ? 'Examen' : 'Práctica'}</td><td><b class="${h.s >= M.PASS ? 'ok' : 'bad'}">${h.s} %</b></td><td>${when(h.t)}</td></tr>`).join('')}</tbody></table></div>`
    : '<p class="en-mut">Todavía no terminas ningún ejercicio. Empieza por cualquiera de los temas de arriba.</p>'}
  <div class="en-foot"><button class="btn" data-reset>Borrar mi progreso de Entrenar</button></div>`;
  M.setTotal(EJ.length);
}

/* ------------------------------------------------------------------ ejercicio */
function start(id, seed, mode, restore){
  const def = byId(id); if (!def) return home();
  X = M.build(def, seed);
  ST = restore || { e: id, seed: X.seed, mode, A: {}, ck: {}, seen: {}, done: 0 };
  ST.mode = ST.mode || mode; save();
  view = 'ex'; render(); calcOn(true);
  toTop();
}
/* «Cómo escribir las respuestas»: en computadora empieza abierto y en el celular cerrado; luego se recuerda (preferencia hw) */
const calchOpen = () => { const h = pref().hw; return h === 1 || (h == null && !NARROW.matches); };
const save = () => {
  if (ST && ST.xm) { if (!ST.done && XM && !XM.done) { XM.A[XM.i] = ST.A; M.saveExam(XM); } return; }
  M.saveCur(ST && !ST.done ? ST : null);
};

function fieldHTML(inc, fl){
  if (M.isPlane(fl)) return `<div class="en-f en-pf" data-pk="${fl.k}"><span class="en-fl">${fl.l}</span><div class="en-pl" data-pl="${fl.k}" data-inc="${inc.k}"></div></div>`;
  if (fl.ch) { const lg = fl.ch.reduce((n, c) => n + strip(c.l).length, 0) > 26; return `<div class="en-f en-cf${lg ? ' en-lg' : ''}" data-ck="${fl.k}"><span class="en-fl">${fl.l}</span><span class="en-fi"><span class="seg en-seg${lg ? ' v' : ''}" role="group" aria-label="${esc(inc.k + ') ' + strip(fl.l))}">${fl.ch.map(c => `<button type="button" data-cv="${inc.k}:${fl.k}:${c.v}" aria-pressed="${ST.A[fl.k] === String(c.v)}">${c.l}</button>`).join('')}</span><span class="en-st" aria-hidden="true"></span></span></div>`; }
  const id = `en-${inc.k}-${fl.k}`, v = ST.A[fl.k] || '';
  return `<label class="en-f" for="${id}"><span class="en-fl">${fl.l}</span><span class="en-fi"><input id="${id}" data-ans data-k="${fl.k}" data-inc="${inc.k}" data-label="${esc(inc.k + ') ' + strip(fl.l))}" value="${esc(v)}" autocomplete="off" autocapitalize="off" spellcheck="false" enterkeyhint="next" aria-label="${esc(strip(fl.l))}">${fl.u ? `<span class="en-u">${fl.u}</span>` : ''}<span class="en-st" aria-hidden="true"></span></span><span class="en-pv" data-pv="${fl.k}"></span></label>`;
}
function render(){
  const { def, P } = X, T = TEMAS.find(t => t.n === def.tema), ex = ST.mode === 'x', xm = !!(ST.xm && XM), fails = !ex && !def.incOf ? pendOf(def.id) : {};
  const datos = X.tarea ? 'Caso de la tarea (' + (P.caso || 'P1') + ')' : 'Variante #' + X.seed + (P.tipo && def.casos ? ' · ' + TIPO[P.tipo] : '');
  BOX.innerHTML = `
  <div class="en-top">
    ${xm ? `<button class="btn" data-xout>${ST.done ? '← Resultados del examen' : '← Salir del examen'}</button>` : '<button class="btn" data-home>← Temas</button>'}
    <div class="en-tit"><small>Tema ${def.tema} · ${esc(T ? T.t : '')}</small><b>${esc(def.t)}</b></div>
    <div class="en-row en-tags">${xm ? `<span class="pill bad">Examen · ${XM.i + 1} de ${XM.items.length}</span>${ST.done ? '' : `<span class="pill en-clk" data-clock>⏱ ${clock(XM.el)}</span>`}` : `<span class="pill ${ex ? 'bad' : 'ok'}">${ex ? 'Examen' : 'Práctica'}</span>`}<span class="pill">${datos}</span></div>
  </div>
  ${xm ? xbarHTML() : ''}
  ${ST.rp ? `<p class="note en-rpn"><b>Repaso de errores.</b> Los incisos marcados en rojo son los que has fallado y aún no corriges; acierta cada uno (sin abrir la solución) para quitarlo de la lista.</p>` : ''}
  <div class="en-tools en-row">
    ${xm ? '' : `<button class="btn" data-new="v">Otra variante</button>${def.casos ? `<span class="seg en-casos" role="group" aria-label="Caso de la tarea">${def.casos.map(n => `<button data-new="t${n}" aria-pressed="${X.tarea && P.caso === 'P' + n}" title="Caso de la tarea de la práctica ${n}">P${n}</button>`).join('')}</span>` : X.tarea ? '' : '<button class="btn" data-new="t">Caso de la tarea</button>'}`}
    <button class="btn en-cbtn" data-calc><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><rect x="5" y="2.5" width="14" height="19" rx="2.5"/><path d="M8.5 6.5h7M8.5 11h.01M12 11h.01M15.5 11h.01M8.5 14.5h.01M12 14.5h.01M15.5 14.5h.01M8.5 18h.01M12 18h.01M15.5 18h.01" stroke-width="2.4"/></svg>Calculadora</button>
  </div>
  ${ST.done ? '' : `<details class="en-mut en-calch"${calchOpen() ? ' open' : ''}><summary>Cómo escribir las respuestas</summary>En las casillas puedes escribir operaciones (<code>12*44-48</code>, <code>sqrt(40)</code>), <code>Ans</code> o una memoria de la calculadora (<code>A</code>–<code>F</code>, <code>M</code>); al salir de la casilla se cambia por su valor. «→ Respuesta» de la calculadora escribe en la última casilla o plano que tocaste.</details>`}
  <div class="card en-enun">${def.enun(P, H)}</div>
  ${p9HTML()}
  <ol class="en-incs">${def.inc.map(inc => `${inc.sec ? `<li class="en-sech" aria-hidden="true"${inc.step ? ` data-p9h="${inc.step}"` : ''}>${esc(inc.sec)}</li>` : ''}<li class="card en-inc" data-i="${inc.k}">
      <div class="en-q"><span class="en-ik">${inc.k})</span><div>${fails[inc.k] ? `<span class="pill bad en-fx">Fallaste aquí ${fails[inc.k]} ${fails[inc.k] === 1 ? 'vez' : 'veces'}</span> ` : ''}${inc.q(P, H)}</div></div>
      <div class="en-fs">${M.fields(inc, P).map(fl => fieldHTML(inc, fl)).join('')}</div>
      ${toolsOf(inc, P).length ? `<div class="en-row en-tl"><span class="en-mut">Calculadora:</span>${toolsOf(inc, P).map((t, j) => `<button class="btn sm en-tb" data-tool="${inc.k}:${j}">${TOOL_ICO}${toolLbl(t)}</button>`).join('')}</div>` : ''}
      ${ex ? '' : `<div class="en-row en-ib"><button class="btn primary sm" data-chk="${inc.k}">Comprobar</button><button class="btn sm" data-sol="${inc.k}">Ver solución</button></div>`}
      <div class="en-fb" data-fb="${inc.k}" role="status" aria-live="polite"></div>
      <div class="en-sol" data-sl="${inc.k}" hidden></div>
    </li>`).join('')}</ol>
  ${def.formulas ? `<div class="card en-f9"><h3 data-p9h="f">∑ Formulario · los 9 pasos (despejados)</h3>${def.formulas(H)}</div>` : ''}
  <div class="en-end">
    <div class="en-res" data-res hidden></div>
    <div class="en-row" data-endb>${xm ? xendHTML() : `<button class="btn primary" data-fin>${ex ? 'Entregar examen' : 'Terminar y guardar'}</button>`}</div>
  </div>`;
  if (xm) BOX.insertAdjacentHTML('beforeend', xnavHTML());
  BOX.classList.toggle('en-xmode', ex && !ST.done);
  glue(BOX); fit(BOX);
  mountPlanes();
  if (!ex) def.inc.forEach(inc => { if (ST.ck[inc.k]) check(inc.k, true); if (ST.seen[inc.k]) showSol(inc.k); });
  preview();
  if (xm && ST.done) { const g = gradeX(true); paintDone(g, true);
    const res = BOX.querySelector('[data-res]'); res.innerHTML = scoreHTML(g, true); res.hidden = false; }
  p9Paint(ST.done ? M.grade(X, ST.A) : null);
}
/* planos s de las casillas con plane:true */
function mountPlanes(){
  dropPlanes();
  X.def.inc.forEach(inc => M.fields(inc, X.P).forEach(fl => {
    if (!M.isPlane(fl)) return;
    const host = BOX.querySelector(`[data-pl="${fl.k}"]`); if (!host) return;
    PL[fl.k] = mountPlane(host, {
      view: fl.view || X.P.view, marks: fl.marks || ['x'], sym: !!fl.sym, real: !!fl.real, snap: fl.snap != null ? fl.snap : 0.5, max: fl.max || 12,
      magnet: pref().mag !== 0, value: M.readPts(ST.A[fl.k]), label: `${inc.k}) ${strip(fl.l)}`,
      onChange: reps => onPlane(inc.k, fl.k, reps),
      onMagnet: on => { setPref({ mag: on ? 1 : 0 }); Object.values(PL).forEach(p => p.setMagnet(on)); }
    });
  }));
}
function onPlane(ik, k, reps){
  if (!ST || ST.done) return;
  if (reps.length) ST.A[k] = M.ptsStr(reps); else delete ST.A[k];
  save(); clearInc(BOX.querySelector(`.en-inc[data-i="${ik}"]`));
  if (ST.mode === 'x') p9Paint();
}
/* al cambiar una respuesta se borra la calificación que tenía el inciso */
function clearInc(li){
  if (!li || !li.dataset.st) return;
  delete li.dataset.st;
  li.querySelectorAll('.en-f').forEach(f => { f.dataset.st = 'vacio'; });
  li.querySelectorAll('[data-pl]').forEach(h => { const p = PL[h.dataset.pl]; if (p) p.mark(null); });
  const fb = li.querySelector('[data-fb]'); fb.textContent = ''; fb.className = 'en-fb';
}
/* detalle de una casilla de plano mal ubicada: cuántos coinciden, sobran o faltan */
function planeDet(r){
  const out = [];
  X.def.inc.forEach(inc => M.fields(inc, X.P).forEach(fl => { const f = r.f[fl.k]; if (!M.isPlane(fl) || !f || !f.pm || f.st === 'ok' || f.st === 'arr') return;
    const m = f.pm; out.push(`${strip(fl.l)}: ${m.h} de ${m.n} bien ubicados${m.m > m.n ? ` · sobran ${m.m - m.n}` : m.m < m.n ? ` · faltan ${m.n - m.m}` : ''}`); }));
  return out.length ? ' (' + out.join('; ') + ')' : '';
}
function preview(){
  BOX.querySelectorAll('input[data-ans]').forEach(i => { const pv = BOX.querySelector(`[data-pv="${i.dataset.k}"]`); if (!pv) return;
    const s = i.value.trim(); if (pv.dataset.frz) { delete pv.dataset.frz; return; }
    if (!s || Number.isFinite(Number(s.replace(',', '.')))) { pv.textContent = ''; return; }
    const p = M.parseAns(s); pv.textContent = p.ok ? '= ' + M.fmt(p.v, 6) + (p.vars ? ' (de la calculadora)' : '') : (p.err || ''); pv.classList.toggle('bad', !p.ok); });
}
const MSG = {
  ok: '✓ Correcto.', arr: '✓ Correcto con arrastre: usaste bien el valor que obtuviste antes (aunque ese valor estaba mal).',
  no: '✗ No coincide. Revisa tu cálculo e inténtalo otra vez, o abre la solución.', vacio: 'Escribe tu respuesta en las casillas.', err: ''
};
/* califica un inciso (modo práctica) y pinta sus casillas */
function check(k, quiet){
  if (!quiet) freezeAll(BOX.querySelector(`.en-inc[data-i="${k}"]`));
  const g = M.grade(X, ST.A), r = g.inc[k], li = BOX.querySelector(`.en-inc[data-i="${k}"]`); if (!li || !r) return r;
  paintInc(li, r);
  const fb = li.querySelector('[data-fb]'), errs = Object.values(r.f).filter(f => f.err).map(f => f.err);
  fb.className = 'en-fb ' + r.st; fb.textContent = r.st === 'err' ? errs[0] : MSG[r.st] + (r.st === 'no' ? planeDet(r) : '');
  if (!quiet) { ST.ck[k] = r.st; save(); p9Paint(); }
  return r;
}
function paintInc(li, r){
  li.dataset.st = r.st;
  li.querySelectorAll('input[data-ans]').forEach(i => { const f = r.f[i.dataset.k] || {}; i.closest('.en-f').dataset.st = f.st || 'vacio'; });
  li.querySelectorAll('[data-ck]').forEach(w => { const f = r.f[w.dataset.ck] || {}; w.dataset.st = f.st || 'vacio'; });
  li.querySelectorAll('[data-pk]').forEach(w => { const k = w.dataset.pk, f = r.f[k] || {}; w.dataset.st = f.st || 'vacio'; if (PL[k]) PL[k].mark(f.pm ? f.pm.good : null); });
}
function showSol(k){
  const g = M.grade(X, ST.A), r = g.inc[k], inc = X.def.inc.find(i => i.k === k), box = BOX.querySelector(`[data-sl="${k}"]`); if (!box) return;
  const fs = M.fields(inc, X.P), val = (fl, v) => M.isPlane(fl) ? fmtList(v, fl.marks) : fl.ch ? chLbl(fl, v) : M.fmt(v, 5);
  box.innerHTML = `<div class="en-sh">Solución</div>${inc.how(X.P, r.T, r.S, H)}<p class="en-ans">Respuesta: ${fs.map(fl => M.isPlane(fl) ? `${fl.l}: <b>${val(fl, r.S[fl.k])}</b>` : `${eqL(fl.l)} <b>${val(fl, r.S[fl.k])}</b>${fl.u ? ' ' + fl.u : ''}`).join(' · ')}</p>${fs.some(M.isPlane) ? '<p class="en-mut">En el plano, la respuesta correcta se ve en verde con su círculo de tolerancia.</p>' : ''}${r.st === 'arr' ? `<p class="en-mut">Con tus valores anteriores daba: ${fs.map(fl => `${eqL(fl.l)} ${val(fl, r.Sc[fl.k])}`).join(' · ')}.</p>` : ''}`;
  glue(box);
  fs.forEach(fl => { if (M.isPlane(fl) && PL[fl.k]) PL[fl.k].solution(r.S[fl.k], b => M.ptTol(b, fl)); });
  box.hidden = false; fit(box);
  const b = BOX.querySelector(`[data-sol="${k}"]`); if (b) { b.textContent = 'Solución abierta'; b.disabled = true; }
}
/* texto de una opción (v puede venir como número o complejo del motor) */
const chLbl = (fl, v) => { const n = Math.round(v && typeof v === 'object' ? v.re : +v), c = fl.ch.find(o => o.v === n); return c ? c.l : M.fmt(v); };
/* calificación del intento (en práctica, los incisos con la solución abierta no cuentan) */
function gradeX(ex){
  const g = M.grade(X, ST.A);
  let pts = 0; Object.entries(g.inc).forEach(([k, r]) => { if (!ex && ST.seen[k]) r.pts = 0; pts += r.pts; });
  g.pts = pts; g.pct = g.max ? Math.round(100 * pts / g.max) : 0;
  return g;
}
const scoreHTML = (g, ex) => { const cnt = s => Object.values(g.inc).filter(r => r.st === s).length;
  return `<div class="en-score ${g.pct >= M.PASS ? 'ok' : 'bad'}"><b>${g.pct} %</b><span>${g.pts} de ${g.max} incisos${cnt('arr') ? ` · ${cnt('arr')} con arrastre` : ''}${!ex && Object.keys(ST.seen).length ? ` · ${Object.keys(ST.seen).length} con la solución vista` : ''}</span></div>`; };
function finish(){
  freezeAll();
  const ex = ST.mode === 'x', g = gradeX(ex);
  M.record(X, g, ST.mode, ex ? null : ST.seen);
  ST.done = 1; save();
  BOX.classList.remove('en-xmode');
  paintDone(g, ex); p9Paint(g);
  const ok = g.pct >= M.PASS, res = BOX.querySelector('[data-res]');
  res.innerHTML = `${scoreHTML(g, ex)}
    <p>${ok ? '¡Bien! Ejercicio dominado. Prueba una variante para asegurarte.' : `Te faltó para el ${M.PASS} %. Lee las soluciones y vuelve a intentarlo con otra variante.`}</p>`;
  res.hidden = false;
  BOX.querySelector('[data-endb]').innerHTML = `<button class="btn primary" data-new="v">Otra variante</button><button class="btn" data-again>Repetir estos datos</button><button class="btn" data-home>← Temas</button>`;
  res.scrollIntoView({ block: 'center', behavior: 'smooth' });
  calcOn(false);
}
/* pinta un intento terminado: casillas, mensajes y soluciones de todos los incisos; deja todo de solo lectura */
function paintDone(g, ex){
  BOX.querySelectorAll('.en-inc').forEach(li => { const k = li.dataset.i, r = g.inc[k]; paintInc(li, r);
    const fb = li.querySelector('[data-fb]'); fb.className = 'en-fb ' + r.st;
    fb.textContent = (!ex && ST.seen[k] ? 'Solución vista: este inciso no cuenta. ' : '') + (r.st === 'err' ? 'No se entendió lo que escribiste.' : MSG[r.st].replace(' Revisa tu cálculo e inténtalo otra vez, o abre la solución.', '') + (r.st === 'no' ? planeDet(r) : ''));
    showSol(k); li.querySelectorAll('input[data-ans]').forEach(i => { i.readOnly = true; }); li.querySelectorAll('[data-cv]').forEach(b => { b.disabled = true; }); li.querySelectorAll('[data-chk],[data-sol]').forEach(b => b.remove()); });
  Object.values(PL).forEach(p => p.readOnly(true));
}

/* ------------------------------------------------------------------ etapa 6 · examen de varios ejercicios y repaso de errores
   XM = {v:1, items:[{e, seed}], A:[respuestas de cada ejercicio], i (el abierto), el (ms de trabajo), done, res:[{pct, pts, max}], tot, tf, c:{n, xc, xd}}
   Se guarda en localStorage['lgdr-entrena-examen'] (solo este dispositivo). Al entregar, cada ejercicio se registra como un intento
   en modo examen (cuenta para «dominado» y para el repaso de errores) y el examen en el historial (motor.recordExam). */
/* sube al inicio del ejercicio (debajo de la barra fija), no al encabezado de la pestaña */
function toTop(){
  const ab = d.getElementById('appbar'), h = ab ? Math.max(0, ab.getBoundingClientRect().bottom) : 0, r = BOX.getBoundingClientRect();
  if (r.top < h || r.top > innerHeight * 0.4) window.scrollTo(0, Math.max(0, scrollY + r.top - h - 10));
}
const clock = ms => { const t = Math.floor((ms || 0) / 1000), h = Math.floor(t / 3600), m = Math.floor(t / 60) % 60, s = t % 60;
  return (h ? h + ':' + String(m).padStart(2, '0') : m) + ':' + String(s).padStart(2, '0'); };
/* ¿el ejercicio i del examen tiene alguna respuesta? */
const answered = i => { const A = XM && XM.A[i]; return !!A && Object.values(A).some(v => String(v == null ? '' : v).trim()); };
/* fallos pendientes de cada inciso de un ejercicio → {inciso: n} */
const pendOf = id => { const it = M.pending(EJ).find(x => x.id === id); return it ? Object.fromEntries(it.ks) : {}; };
const XC = { all: 'Todo', b: 'Temas 1–12', c: 'Temas 13–16', err: 'Mis errores' };
const minsOf = def => def.tema === 16 ? 25 : def.tema === 17 ? 15 : def.tema >= 13 ? 8 : 5;
function examCard(P, D){
  const last = Array.isArray(D.xh) && D.xh[0], n = +P.xn, ex = XM && XM.done ? XM : null;
  const seg = (k, opts) => `<div class="seg" data-pref="${k}" role="group">${opts.map(([v, l]) => `<button data-v="${v}" aria-pressed="${String(P[k]) === v}">${l}</button>`).join('')}</div>`;
  return `<div class="card en-xcfg">
    <h3>Examen de varios ejercicios</h3>
    <p class="en-mut">Ejercicios seguidos <b>sin ayudas</b>: no ves si vas bien hasta entregar. Al final, la calificación de cada uno, el total, el tiempo y todas las soluciones. Con ${M.SIM_N} o más es un <b>simulacro</b> (cuenta en la Ruta con ${M.PASS} %).</p>
    <div class="en-opts">
      <div class="en-opt"><span>Ejercicios</span>${seg('xn', [['4', '4'], ['6', '6'], ['8', '8']])}</div>
      <div class="en-opt"><span>Contenido</span>${seg('xc', Object.entries(XC))}</div>
      <div class="en-opt"><span>Datos</span>${seg('xd', [['v', 'Variantes'], ['t', 'Casos de la tarea']])}</div>
    </div>
    <div class="en-row"><button class="btn primary" data-xstart>Empezar examen</button><span class="en-mut">Tiempo sugerido: ${n * 6}–${n * 9} min.</span></div>
    ${last ? `<p class="en-mut en-xlast">Último: <b class="${last.s >= M.PASS ? 'ok' : 'bad'}">${last.s} %</b> en ${last.n} ejercicios (⏱ ${clock(last.d)})${D.xb ? ` · mejor simulacro: <b>${D.xb} %</b>` : ''}${ex ? ' · <button class="btn sm" data-xres>Ver resultados</button>' : ''}</p>` : ''}
  </div>`;
}
function repasoCard(){
  const L = M.pending(EJ);
  return `<div class="card en-rp" id="enRepaso">
    <h3>Repaso de errores</h3>
    ${L.length ? `<p class="en-mut">Los ejercicios con incisos que fallaste (o donde viste la solución) y aún no corriges, del que más tiene al que menos. Acierta el inciso sin ver la solución para quitarlo.</p>
    <div class="en-rpl">${L.slice(0, 6).map(x => { const d = byId(x.id);
      return `<div class="en-rpi"><div class="en-rpt"><b>${esc(d.t)}</b><small>Tema ${d.tema} · ${x.p} ${x.p === 1 ? 'fallo pendiente' : 'fallos pendientes'} · incisos ${x.ks.slice(0, 5).map(([k, n]) => `${k})${n > 1 ? ' ×' + n : ''}`).join(', ')}${x.ks.length > 5 ? '…' : ''}</small></div><button class="btn sm" data-rp="${x.id}">Repasar</button></div>`; }).join('')}</div>
    ${L.length > 6 ? `<p class="en-mut">Y ${L.length - 6} más.</p>` : ''}
    <div class="en-row"><button class="btn" data-xerr>Examen con mis errores</button></div>`
    : '<p class="en-mut">No tienes errores pendientes. Cuando falles un inciso (o abras su solución) el ejercicio aparece aquí para repasarlo con otra variante.</p>'}
  </div>`;
}
/* v84 · modo «Los 9 pasos del LGDR»: tarjeta del inicio que abre el ejercicio lgdr9 con el caso de cada práctica o una variante */
function p9Card(D){
  const def = byId('lgdr9'); if (!def) return '';
  const e = D.ex[def.id];
  return `<div class="card en-p9c">
    <div class="en-p9h"><h3>Modo completo · los 9 pasos del LGDR</h3>${pctTag(e)}</div>
    <p class="en-mut">Traza el lugar geométrico de las raíces de principio a fin, paso por paso, como en Nise 8.5–8.6. Cada paso trae su regla plegada, se califica al momento (o al entregar en modo examen) y al final ves el LGDR completo dibujado. Las variantes traen también polos o ceros complejos (ángulos de salida y llegada) y puntos de llegada.</p>
    <ol class="en-p9l">${def.p9.map((t, i) => `<li><span>${i + 1}</span>${esc(t)}</li>`).join('')}</ol>
    <div class="en-row"><span class="en-mut">Planta de:</span><span class="seg en-casos" role="group" aria-label="Caso de la tarea">${def.casos.map(n => `<button data-p9go="t${n}" title="Planta sin compensar de la práctica ${n}">P${n}</button>`).join('')}</span><button class="btn primary" data-p9go="v">Variante aleatoria</button></div>
    ${def.formulas ? `<details class="en-f9d"><summary>∑ Formulario de los 9 pasos (despejados)</summary>${def.formulas(H)}</details>` : ''}
  </div>`;
}
/* barra de los 9 pasos dentro del ejercicio: estado de cada paso según sus incisos (ok / mal / a medias) */
function p9HTML(){
  const def = X.def; if (!def.p9) return '';
  return `<nav class="en-p9" aria-label="Pasos del trazo">${def.p9.map((t, i) => { const has = def.inc.some(c => c.step === i + 1);
    return `<button type="button" data-p9="${i + 1}"${has ? '' : ' disabled'} title="Paso ${i + 1} · ${esc(t)}"><b>${i + 1}</b><span>${esc(t)}</span></button>`; }).join('')}${def.formulas ? '<button type="button" data-p9="f" class="en-p9f" title="Formulario de los 9 pasos (despejados)"><b>∑</b><span>Fórmulas</span></button>' : ''}</nav>`;
}
function p9Paint(g){
  if (!X || !X.def.p9) return;
  const ex = ST.mode === 'x' && !ST.done;
  BOX.querySelectorAll('.en-p9 [data-p9]:not([data-p9="f"])').forEach(b => {
    const ks = X.def.inc.filter(c => c.step === +b.dataset.p9).map(c => c.k);
    const sts = ks.map(k => g ? (g.inc[k] || {}).st : ST.ck[k]), ok = s => s === 'ok' || s === 'arr';
    b.dataset.st = ex ? (X.def.inc.some(c => c.step === +b.dataset.p9 && M.fields(c, X.P).some(fl => String(ST.A[fl.k] == null ? '' : ST.A[fl.k]).trim())) ? 'part' : '')
      : sts.length && sts.every(ok) ? 'ok' : sts.some(s => s === 'no' || s === 'err') ? 'no' : sts.some(ok) ? 'part' : '';
  });
}
/* arma la lista del examen según las preferencias */
function examItems(P){
  const n = +P.xn || 6, shuf = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  let ids;
  if (P.xc === 'err') { const L = M.pending(EJ).map(x => x.id); ids = L.slice(0, n).concat(shuf(EJ.map(d => d.id).filter(id => !L.includes(id)))).slice(0, n); }
  else ids = shuf(EJ.filter(d => P.xc === 'b' ? d.tema <= 12 || d.tema === 17 : P.xc === 'c' ? d.tema >= 13 && d.tema <= 16 : true).map(d => d.id)).slice(0, n);
  ids.sort((a, b) => EJ.findIndex(d => d.id === a) - EJ.findIndex(d => d.id === b));
  return ids.map(id => { const d = byId(id); return { e: id, seed: P.xd === 'v' ? M.newSeed() : d.casos ? -d.casos[Math.floor(Math.random() * d.casos.length)] : 0 }; });
}
function startExam(items){
  const P = pref();
  items = items || examItems(P);
  XM = { v: 1, items, A: items.map(() => ({})), i: 0, el: 0, done: 0, res: null, c: { n: items.length, xc: P.xc, xd: P.xd } };
  M.saveExam(XM); examGo(0);
}
/* abre el ejercicio i del examen (para responder o, si ya se entregó, para revisarlo) */
function examGo(i){
  if (!XM) return home();
  if (ST && ST.xm && !ST.done && !XM.done) { freezeAll(); XM.A[XM.i] = ST.A; }
  XM.i = Math.max(0, Math.min(XM.items.length - 1, +i)); M.saveExam(XM);
  const it = XM.items[XM.i], def = byId(it.e); if (!def) return home();
  X = M.build(def, it.seed);
  ST = { e: it.e, seed: X.seed, mode: 'x', A: XM.A[XM.i] || {}, ck: {}, seen: {}, done: XM.done ? 1 : 0, xm: 1 };
  view = 'ex'; render(); calcOn(!XM.done);
  toTop();
}
const xbarHTML = () => `<nav class="en-xbar" aria-label="Ejercicios del examen">${XM.items.map((it, i) => { const d = byId(it.e), r = XM.res && XM.res[i];
  return `<button data-xgo="${i}" class="${i === XM.i ? 'cur' : ''}${r ? (r.pct >= M.PASS ? ' ok' : ' bad') : answered(i) ? ' ans' : ''}" aria-current="${i === XM.i ? 'step' : 'false'}" title="${esc((i + 1) + '. ' + (d ? d.t : ''))}${r ? ' · ' + r.pct + ' %' : ''}"><b>${i + 1}</b>${r ? `<small>${r.pct} %</small>` : ''}</button>`; }).join('')}</nav>`;
function xendHTML(){
  const i = XM.i, last = i === XM.items.length - 1;
  if (XM.done) return `${i ? `<button class="btn" data-xgo="${i - 1}">← Anterior</button>` : ''}${last ? '' : `<button class="btn primary" data-xgo="${i + 1}">Siguiente →</button>`}<button class="btn" data-xres>Resultados del examen</button>`;
  return `${i ? `<button class="btn" data-xgo="${i - 1}">← Anterior</button>` : ''}${last ? '' : `<button class="btn primary" data-xgo="${i + 1}">Siguiente ejercicio →</button>`}<button class="btn${last ? ' primary' : ''}" data-xfin>Entregar examen</button>`;
}
/* v73 · barra fija abajo para el examen en el celular (a la mano del pulgar; deja el lugar del botón de la calculadora) */
function xnavHTML(){
  const i = XM.i, N = XM.items.length, last = i === N - 1, ar = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>';
  return `<nav class="en-xnav${XM.done ? ' rev' : ''}" aria-label="Moverse por el examen">
    <button class="btn" data-xgo="${i - 1}"${i ? '' : ' disabled'} aria-label="Ejercicio anterior">${ar}</button>
    <button class="btn en-xn" data-xtop aria-label="Ir a la lista de ejercicios"><b>${i + 1}</b> de ${N}</button>
    ${last ? (XM.done ? '<button class="btn primary" data-xres>Resultados</button>' : '<button class="btn primary" data-xfin data-short>Entregar</button>')
      : `<button class="btn primary" data-xgo="${i + 1}">Siguiente <span class="en-rot">${ar}</span></button>`}
  </nav>`;
}
function finishExam(){
  if (!XM || XM.done) return;
  if (ST && ST.xm && !ST.done) { freezeAll(); XM.A[XM.i] = ST.A; }
  XM.res = XM.items.map((it, i) => { const def = byId(it.e); if (!def) return { pct: 0, pts: 0, max: 0 };
    const Xi = M.build(def, it.seed), g = M.grade(Xi, XM.A[i] || {}); M.record(Xi, g, 'x');
    return { pct: g.pct, pts: g.pts, max: g.max, arr: Object.values(g.inc).filter(r => r.st === 'arr').length }; });
  XM.tot = Math.round(XM.res.reduce((a, r) => a + r.pct, 0) / XM.res.length);
  XM.done = 1; XM.tf = Date.now();
  M.recordExam(XM.items.length, XM.tot, XM.el); M.saveExam(XM);
  examResults();
}
function examResults(){
  if (!XM || !XM.done) return home();
  view = 'xres'; X = null; ST = null; calcOn(false); dropPlanes();
  const ok = XM.tot >= M.PASS, sim = XM.items.length >= M.SIM_N, pts = XM.res.reduce((a, r) => a + r.pts, 0), max = XM.res.reduce((a, r) => a + r.max, 0);
  BOX.innerHTML = `
  <div class="en-top"><button class="btn" data-home>← Temas</button><div class="en-tit"><small>${sim ? 'Simulacro' : 'Examen'} · ${XM.items.length} ejercicios · ${XC[XM.c && XM.c.xc] || 'Todo'} · ${XM.c && XM.c.xd === 't' ? 'casos de la tarea' : 'variantes'}</small><b>Resultados del examen</b></div></div>
  <div class="card en-hero en-xhero">
    <div class="en-ring" style="--v:${XM.tot / 100}" aria-hidden="true"><b>${XM.tot}<small>%</small></b></div>
    <div class="en-hm">
      <p class="en-big"><b class="${ok ? 'ok' : 'bad'}">${ok ? 'Aprobado' : 'No aprobado'}</b> · promedio de ${XM.items.length} ejercicios (${pts} de ${max} incisos)</p>
      <p class="en-mut">⏱ ${clock(XM.el)} de trabajo${XM.tf ? ' · entregado el ' + new Date(XM.tf).toLocaleString('es-MX', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''}</p>
      <p class="en-mut">Cada ejercicio quedó registrado en modo examen; los incisos fallados pasan al <b>Repaso de errores</b>.</p>
      <p>${ok ? (sim ? '¡Simulacro aprobado! Ya cuenta en la Ruta del curso.' : '¡Bien! Para que cuente en la Ruta haz uno de ' + M.SIM_N + ' u 8 ejercicios.') : `Te faltó para el ${M.PASS} %. Revisa las soluciones de los que fallaste y repásalos.`}</p>
    </div>
  </div>
  <div class="card en-hist en-xres"><table><thead><tr><th>#</th><th>Ejercicio</th><th>Datos</th><th>Incisos</th><th>Calificación</th><th></th></tr></thead><tbody>${XM.items.map((it, i) => { const d = byId(it.e), r = XM.res[i];
    return `<tr><td>${i + 1}</td><td><b>${esc(d ? d.t : it.e)}</b><br><small class="en-mut">Tema ${d ? d.tema : '—'}</small></td><td>${it.seed > 0 ? '#' + it.seed : it.seed < 0 ? 'Tarea P' + (-it.seed) : 'Tarea'}</td><td>${r.pts}/${r.max}${r.arr ? ` <small class="en-mut">(${r.arr} con arrastre)</small>` : ''}</td><td><b class="${r.pct >= M.PASS ? 'ok' : 'bad'}">${r.pct} %</b>${answered(i) ? '' : ' <small class="en-mut">sin respuestas</small>'}</td><td><button class="btn sm" data-xgo="${i}">Revisar</button></td></tr>`; }).join('')}</tbody></table></div>
  <div class="en-row en-xact"><button class="btn primary" data-xagain>Nuevo examen igual</button>${XM.res.some(r => r.pct < 100) ? '<button class="btn" data-xrp>Repasar mis errores</button>' : ''}<button class="btn" data-home>← Temas</button></div>`;
  toTop();
}
/* cronómetro del examen: solo cuenta con el examen a la vista */
let tick = 0;
setInterval(() => {
  if (!(XM && !XM.done && view === 'ex' && ST && ST.xm && !ST.done && location.hash === '#entrenar' && d.visibilityState === 'visible')) return;
  XM.el += 1000; const c = BOX && BOX.querySelector('[data-clock]'); if (c) c.textContent = '⏱ ' + clock(XM.el);
  if (++tick % 10 === 0) M.saveExam(XM);
}, 1000);
addEventListener('pagehide', () => { if (XM && !XM.done) M.saveExam(XM); });

/* ------------------------------------------------------------------ eventos */
let resetArm = 0;
/* acción con confirmación de dos toques (sin confirm(), que saca de pantalla completa) */
function twoTap(b, txt, fn){
  if (b.dataset.arm) { delete b.dataset.arm; fn(); return; }
  const t0 = b.textContent; b.dataset.arm = '1'; b.textContent = txt; b.classList.add('danger');
  setTimeout(() => { if (b.isConnected && b.dataset.arm) { delete b.dataset.arm; b.textContent = t0; b.classList.remove('danger'); } }, 4000);
}
function onClick(e){
  const b = e.target.closest('button'); if (!b || !BOX.contains(b)) return;
  const P = pref();
  if (b.closest('[data-pref]')) { const k = b.closest('[data-pref]').dataset.pref; setPref({ [k]: b.dataset.v }); home(); return; }
  if (b.dataset.cv) { if (!ST || ST.done) return; const [ik, k, v] = b.dataset.cv.split(':');
    ST.A[k] = v; save(); b.parentNode.querySelectorAll('[data-cv]').forEach(o => o.setAttribute('aria-pressed', String(o === b)));
    clearInc(b.closest('.en-inc')); if (ST.mode === 'x') p9Paint(); return; }
  if (b.dataset.ej) { start(b.dataset.ej, P.src === 'v' ? M.newSeed() : 0, P.mode); return; }
  if (b.dataset.p9go) { const n = b.dataset.p9go; start('lgdr9', n === 'v' ? M.newSeed() : -(+n.slice(1)), P.mode); return; }
  if (b.dataset.p9 && X) { const hd = BOX.querySelector(`[data-p9h="${b.dataset.p9}"]`); if (hd) { const ab = d.getElementById('appbar'), top = ab ? Math.max(0, ab.getBoundingClientRect().bottom) : 0, bar = BOX.querySelector('.en-p9');
      window.scrollTo({ top: scrollY + hd.getBoundingClientRect().top - top - (bar ? bar.offsetHeight : 0) - 12, behavior: 'smooth' }); } return; }
  /* etapa 6 · examen y repaso */
  if ('xstart' in b.dataset) { startExam(); return; }
  if ('xcont' in b.dataset) { XM = M.loadExam(); if (XM && !XM.done) examGo(XM.i); else home(); return; }
  if ('xdrop' in b.dataset) { twoTap(b, '¿Seguro? Toca otra vez', () => { M.saveExam(null); XM = null; home(); }); return; }
  if ('xout' in b.dataset) { if (XM && XM.done) examResults(); else { if (ST && !ST.done) { freezeAll(); save(); } home(); SEC.scrollIntoView({ block: 'start' }); } return; }
  if (b.dataset.xgo != null) { examGo(+b.dataset.xgo); return; }
  if ('xfin' in b.dataset) { if (ST && !ST.done) { freezeAll(); XM.A[XM.i] = ST.A; }
    const miss = XM.items.filter((it, i) => !answered(i)).length;
    twoTap(b, 'short' in b.dataset ? (miss ? `${miss} sin resp. · otra vez` : 'Toca otra vez') : miss ? `${miss} ${miss === 1 ? 'ejercicio sin' : 'ejercicios sin'} respuestas · toca otra vez para entregar` : '¿Entregar? Toca otra vez', finishExam); return; }
  if ('xtop' in b.dataset) { const x = BOX.querySelector('.en-xbar'); if (x) { x.scrollIntoView({ block: 'center', behavior: 'smooth' }); const c = x.querySelector('.cur'); if (c) c.focus({ preventScroll: true }); } return; }
  if ('xres' in b.dataset) { XM = XM || M.loadExam(); examResults(); return; }
  if ('xagain' in b.dataset) { const c = (XM && XM.c) || {}; startExam(examItems(Object.assign(pref(), { xn: String(c.n || 6), xc: c.xc || 'all', xd: c.xd || 'v' }))); return; }
  if ('xrp' in b.dataset) { home(); const r = d.getElementById('enRepaso'); if (r) r.scrollIntoView({ block: 'start' }); return; }
  if ('xerr' in b.dataset) { startExam(examItems(Object.assign(pref(), { xc: 'err' }))); return; }
  if (b.dataset.rp) { start(b.dataset.rp, M.newSeed(), 'p'); ST.rp = 1; save(); render(); return; }
  if ('cont' in b.dataset) { const c = M.loadCur(); if (c) start(c.e, c.seed, c.mode, c); return; }
  if ('drop' in b.dataset) { M.saveCur(null); home(); return; }
  if ('home' in b.dataset) { home(); SEC.scrollIntoView({ block: 'start' }); return; }
  if (b.dataset.new) { const n = b.dataset.new, rp = ST && ST.rp; start(X.def.id, n === 'v' ? M.newSeed() : /^t\d$/.test(n) ? -(+n.slice(1)) : 0, ST && !ST.xm ? ST.mode : P.mode); if (rp) { ST.rp = 1; save(); render(); } return; }
  if ('again' in b.dataset) { start(X.def.id, X.seed, ST.mode); return; }
  if ('calc' in b.dataset) { calcOpen(); return; }
  if (b.dataset.tool) { const [k, j] = b.dataset.tool.split(':'); toolGo(k, j); return; }
  if (b.dataset.chk) { check(b.dataset.chk); return; }
  if (b.dataset.sol) { ST.seen[b.dataset.sol] = 1; save(); showSol(b.dataset.sol); return; }
  if ('fin' in b.dataset) { finish(); return; }
  if ('reset' in b.dataset) {
    if (!resetArm) { resetArm = 1; b.textContent = '¿Seguro? Toca otra vez para borrar'; b.classList.add('danger'); setTimeout(() => { resetArm = 0; if (b.isConnected) { b.textContent = 'Borrar mi progreso de Entrenar'; b.classList.remove('danger'); } }, 4000); return; }
    resetArm = 0; M.resetAll(); home(); return; }
}
function onInput(e){
  const i = e.target; if (!i.matches || !i.matches('input[data-ans]') || !ST || ST.done) return;
  ST.A[i.dataset.k] = i.value; save();
  clearInc(i.closest('.en-inc'));
  if (ST.mode === 'x') p9Paint();
  preview();
}
function onKey(e){
  const i = e.target; if (e.key !== 'Enter' || !i.matches || !i.matches('input[data-ans]')) return;
  e.preventDefault();
  const all = [...BOX.querySelectorAll('input[data-ans]:not([readonly])')], li = i.closest('.en-inc'), mine = [...li.querySelectorAll('input[data-ans]')];
  freezeIn(i);
  if (i === mine[mine.length - 1] && ST.mode !== 'x' && !ST.done) check(li.dataset.i);
  const n = all[all.indexOf(i) + 1]; if (n) n.focus({ preventScroll: false });
}

/* ------------------------------------------------------------------ arranque */
export async function init(section){
  SEC = section;
  if (!built) {
    built = true;
    BOX = section.querySelector('[data-en]');
    BOX.addEventListener('click', onClick);
    BOX.addEventListener('input', onInput);
    BOX.addEventListener('keydown', onKey);
    BOX.addEventListener('toggle', e => { if (e.target.matches && e.target.matches('.en-calch')) setPref({ hw: e.target.open ? 1 : 0 });
      if (e.target.matches && e.target.matches('.en-f9d') && e.target.open) fit(e.target); }, true);
    BOX.addEventListener('change', e => { if (e.target.matches && e.target.matches('input[data-ans]')) freezeIn(e.target); });
    addEventListener('hashchange', () => { if (location.hash !== '#entrenar') calcOn(false); else if (view === 'ex' && ST && !ST.done) calcOn(true); });
    await needCalc();
    home();
  } else if (view === 'ex' && ST && !ST.done) calcOn(true);
  else if (view === 'home') home();
}
export const api = { M, EJ, TEMAS, start: (id, seed, mode) => start(id, seed || 0, mode || 'p'), home, startExam, examGo, finishExam, examResults, get X(){ return X; }, get ST(){ return ST; }, get XM(){ return XM; } };
