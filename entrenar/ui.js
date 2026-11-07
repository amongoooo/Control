/* =====================================================================================================
   entrenar/ui.js · Pestaña «Entrenar» del Laboratorio LGDR · etapa 1 (pestaña, motor y guardado)
   ---------------------------------------------------------------------------------------------------
   index.html la carga con import() la primera vez que se abre #entrenar y llama init(section) cada vez que se muestra.
   Vistas: inicio (avance, modo, temas con sus ejercicios, historial) y ejercicio (enunciado, incisos con casillas,
   Comprobar / Ver solución en modo práctica, Entregar en modo examen, resultado).
   Calculadora: la de la página (entrenar/calc.js vía window.__lgdrCalcUI). Con un ejercicio abierto aparece su botón
   flotante y «→ Respuesta» escribe en la última casilla tocada (o la primera vacía).
   Preferencias (modo y caso/variante) en localStorage['lgdr-entrena-pref'] (solo este dispositivo).
   ===================================================================================================== */
import * as M from './motor.js?v=1';
import { TEMAS, EJ, byId } from './ejercicios.js?v=1';

const d = document, root = d.documentElement, PREF = 'lgdr-entrena-pref';
const K_ = () => window.katex;
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const strip = s => String(s).replace(/<[^>]+>/g, '');

/* utilidades de dibujo para los ejercicios */
const tx = (t, disp) => { const k = K_(); if (!k) return `<code>${esc(t)}</code>`;
  try { return k.renderToString(t, { displayMode: !!disp, throwOnError: false, strict: 'ignore' }); } catch (e) { return `<code>${esc(t)}</code>`; } };
const nT = v => { if (v && typeof v === 'object') v = v.re; if (!Number.isFinite(v)) return v > 0 ? '\\infty' : '—';
  if (Math.abs(v) < 1e-10) return '0'; const a = Math.abs(v);
  if (a >= 1e5 || a < 1e-3) { const [m, e] = v.toExponential(3).split('e'); return `${+m}\\times10^{${+e}}`; }
  return String(+v.toPrecision(a >= 100 ? 5 : 4)); };
const H = { tx, n: nT, f: v => M.fmt(v) };

let SEC = null, BOX = null, view = 'home', X = null, ST = null, built = false;
const pref = () => { try { return Object.assign({ mode: 'p', src: 't' }, JSON.parse(localStorage.getItem(PREF) || '{}')); } catch (e) { return { mode: 'p', src: 't' }; } };
const setPref = o => { try { localStorage.setItem(PREF, JSON.stringify(Object.assign(pref(), o))); } catch (e) {} };

/* ------------------------------------------------------------------ calculadora */
function calcOn(on){ root.classList.toggle('en-ex', !!on); if (window.__lgdrCcSync) window.__lgdrCcSync(); }
function calcOpen(){ const cu = window.__lgdrCalcUI; if (cu) cu.toggle(); }
/* para leer expresiones en las casillas hace falta el motor de la calculadora */
function needCalc(){ const cu = window.__lgdrCalcUI; if (window.LGDRCalc || !cu || !cu.load) return Promise.resolve(); return cu.load().catch(() => {}); }

/* ------------------------------------------------------------------ inicio */
function pctTag(e){
  if (!e || !e.n) return '<span class="pill">Nuevo</span>';
  const b = e.best || 0;
  return b >= M.PASS ? `<span class="pill ok">Dominado · ${b} %</span>` : `<span class="pill warn">Mejor ${b} %</span>`;
}
function home(){
  view = 'home'; X = null; calcOn(false);
  const D = M.load(), S = M.stats(EJ), P = pref(), cur = M.loadCur(), cd = cur && byId(cur.e);
  const ring = S.tot ? S.dom / S.tot : 0;
  const when = t => { const x = new Date(t); return x.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' }) + ' ' + x.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }); };
  const hist = D.h.filter(h => byId(h.e)).slice(0, 8);
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
  ${cd ? `<div class="card en-cont"><div><b>Continuar:</b> ${esc(cd.t)} <span class="en-mut">· ${cur.seed ? 'variante #' + cur.seed : 'caso de la tarea'} · ${cur.mode === 'x' ? 'examen' : 'práctica'}</span></div>
    <div class="en-row"><button class="btn primary" data-cont>Continuar →</button><button class="btn" data-drop>Descartar</button></div></div>` : ''}
  <h3 class="en-h3">Temas</h3>
  <div class="en-temas">${TEMAS.map(T => { const xs = EJ.filter(e => e.tema === T.n);
    return `<div class="en-tema${xs.length ? '' : ' soon'}"><div class="en-tt"><span class="en-tn">${T.n}</span><b>${esc(T.t)}</b></div>${xs.length
      ? xs.map(e => `<button class="en-ej" data-ej="${e.id}"><span class="en-ejt">${esc(e.t)}<small>${esc(e.d)}</small></span>${pctTag(D.ex[e.id])}<i aria-hidden="true">›</i></button>`).join('')
      : `<p class="en-mut en-soon">Sus ejercicios llegan en la etapa ${T.e}.</p>`}</div>`; }).join('')}</div>
  <h3 class="en-h3">Últimos intentos</h3>
  ${hist.length ? `<div class="card en-hist"><table><thead><tr><th>Ejercicio</th><th>Datos</th><th>Modo</th><th>Calificación</th><th>Fecha</th></tr></thead><tbody>${hist.map(h => `<tr><td>${esc(byId(h.e).t)}</td><td>${h.r ? '#' + h.r : 'Tarea'}</td><td>${h.x ? 'Examen' : 'Práctica'}</td><td><b class="${h.s >= M.PASS ? 'ok' : 'bad'}">${h.s} %</b></td><td>${when(h.t)}</td></tr>`).join('')}</tbody></table></div>`
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
  SEC.scrollIntoView({ block: 'start' }); window.scrollBy(0, -8);
}
const save = () => M.saveCur(ST && !ST.done ? ST : null);

function fieldHTML(inc, fl){
  const id = `en-${inc.k}-${fl.k}`, v = ST.A[fl.k] || '';
  return `<label class="en-f" for="${id}"><span class="en-fl">${fl.l}</span><span class="en-fi"><input id="${id}" data-ans data-k="${fl.k}" data-inc="${inc.k}" data-label="${esc(inc.k + ') ' + strip(fl.l))}" value="${esc(v)}" autocomplete="off" autocapitalize="off" spellcheck="false" enterkeyhint="next" aria-label="${esc(strip(fl.l))}">${fl.u ? `<span class="en-u">${fl.u}</span>` : ''}<span class="en-st" aria-hidden="true"></span></span><span class="en-pv" data-pv="${fl.k}"></span></label>`;
}
function render(){
  const { def, P } = X, T = TEMAS.find(t => t.n === def.tema), ex = ST.mode === 'x';
  BOX.innerHTML = `
  <div class="en-top">
    <button class="btn" data-home>← Temas</button>
    <div class="en-tit"><small>Tema ${def.tema} · ${esc(T ? T.t : '')}</small><b>${esc(def.t)}</b></div>
    <div class="en-row en-tags"><span class="pill ${ex ? 'bad' : 'ok'}">${ex ? 'Examen' : 'Práctica'}</span><span class="pill">${X.tarea ? 'Caso de la tarea (P1)' : 'Variante #' + X.seed}</span></div>
  </div>
  <div class="en-tools en-row">
    <button class="btn" data-new="v">Otra variante</button>${X.tarea ? '' : '<button class="btn" data-new="t">Caso de la tarea</button>'}
    <button class="btn en-cbtn" data-calc><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><rect x="5" y="2.5" width="14" height="19" rx="2.5"/><path d="M8.5 6.5h7M8.5 11h.01M12 11h.01M15.5 11h.01M8.5 14.5h.01M12 14.5h.01M15.5 14.5h.01M8.5 18h.01M12 18h.01M15.5 18h.01" stroke-width="2.4"/></svg>Calculadora</button>
  </div>
  <div class="card en-enun">${def.enun(P, H)}</div>
  <ol class="en-incs">${def.inc.map(inc => `<li class="card en-inc" data-i="${inc.k}">
      <div class="en-q"><span class="en-ik">${inc.k})</span><div>${inc.q(P, H)}</div></div>
      <div class="en-fs">${M.fields(inc, P).map(fl => fieldHTML(inc, fl)).join('')}</div>
      ${ex ? '' : `<div class="en-row en-ib"><button class="btn primary sm" data-chk="${inc.k}">Comprobar</button><button class="btn sm" data-sol="${inc.k}">Ver solución</button></div>`}
      <div class="en-fb" data-fb="${inc.k}" role="status" aria-live="polite"></div>
      <div class="en-sol" data-sl="${inc.k}" hidden></div>
    </li>`).join('')}</ol>
  <div class="en-end">
    <div class="en-res" data-res hidden></div>
    <div class="en-row" data-endb><button class="btn primary" data-fin>${ex ? 'Entregar examen' : 'Terminar y guardar'}</button></div>
  </div>`;
  if (!ex) def.inc.forEach(inc => { if (ST.ck[inc.k]) check(inc.k, true); if (ST.seen[inc.k]) showSol(inc.k); });
  preview();
}
function preview(){
  BOX.querySelectorAll('input[data-ans]').forEach(i => { const pv = BOX.querySelector(`[data-pv="${i.dataset.k}"]`); if (!pv) return;
    const s = i.value.trim(); if (!s || Number.isFinite(Number(s.replace(',', '.')))) { pv.textContent = ''; return; }
    const p = M.parseAns(s); pv.textContent = p.ok ? '= ' + M.fmt(p.v, 6) : (p.err || ''); pv.classList.toggle('bad', !p.ok); });
}
const MSG = {
  ok: '✓ Correcto.', arr: '✓ Correcto con arrastre: usaste bien el valor que obtuviste antes (aunque ese valor estaba mal).',
  no: '✗ No coincide. Revisa tu cálculo e inténtalo otra vez, o abre la solución.', vacio: 'Escribe tu respuesta en las casillas.', err: ''
};
/* califica un inciso (modo práctica) y pinta sus casillas */
function check(k, quiet){
  const g = M.grade(X, ST.A), r = g.inc[k], li = BOX.querySelector(`.en-inc[data-i="${k}"]`); if (!li || !r) return r;
  paintInc(li, r);
  const fb = li.querySelector('[data-fb]'), errs = Object.values(r.f).filter(f => f.err).map(f => f.err);
  fb.className = 'en-fb ' + r.st; fb.textContent = r.st === 'err' ? errs[0] : MSG[r.st];
  if (!quiet) { ST.ck[k] = r.st; save(); }
  return r;
}
function paintInc(li, r){
  li.dataset.st = r.st;
  li.querySelectorAll('input[data-ans]').forEach(i => { const f = r.f[i.dataset.k] || {}; i.closest('.en-f').dataset.st = f.st || 'vacio'; });
}
function showSol(k){
  const g = M.grade(X, ST.A), r = g.inc[k], inc = X.def.inc.find(i => i.k === k), box = BOX.querySelector(`[data-sl="${k}"]`); if (!box) return;
  const fs = M.fields(inc, X.P);
  box.innerHTML = `<div class="en-sh">Solución</div>${inc.how(X.P, r.T, r.S, H)}<p class="en-ans">Respuesta: ${fs.map(fl => `${fl.l} = <b>${M.fmt(r.S[fl.k], 5)}</b>${fl.u ? ' ' + fl.u : ''}`).join(' · ')}</p>${r.st === 'arr' ? `<p class="en-mut">Con tus valores anteriores daba: ${fs.map(fl => `${fl.l} = ${M.fmt(r.Sc[fl.k], 5)}`).join(' · ')}.</p>` : ''}`;
  box.hidden = false;
  const b = BOX.querySelector(`[data-sol="${k}"]`); if (b) { b.textContent = 'Solución abierta'; b.disabled = true; }
}
function finish(){
  const g = M.grade(X, ST.A), ex = ST.mode === 'x';
  /* en práctica, los incisos con la solución abierta no cuentan */
  let pts = 0; Object.entries(g.inc).forEach(([k, r]) => { if (!ex && ST.seen[k]) r.pts = 0; pts += r.pts; });
  g.pts = pts; g.pct = g.max ? Math.round(100 * pts / g.max) : 0;
  M.record(X, g, ST.mode, ex ? null : ST.seen);
  ST.done = 1; save();
  BOX.querySelectorAll('.en-inc').forEach(li => { const k = li.dataset.i, r = g.inc[k]; paintInc(li, r);
    const fb = li.querySelector('[data-fb]'); fb.className = 'en-fb ' + r.st;
    fb.textContent = (!ex && ST.seen[k] ? 'Solución vista: este inciso no cuenta. ' : '') + (r.st === 'err' ? 'No se entendió lo que escribiste.' : MSG[r.st].replace(' Revisa tu cálculo e inténtalo otra vez, o abre la solución.', ''));
    showSol(k); li.querySelectorAll('input').forEach(i => { i.readOnly = true; }); li.querySelectorAll('[data-chk],[data-sol]').forEach(b => b.remove()); });
  const ok = g.pct >= M.PASS, res = BOX.querySelector('[data-res]');
  const cnt = s => Object.values(g.inc).filter(r => r.st === s).length;
  res.innerHTML = `<div class="en-score ${ok ? 'ok' : 'bad'}"><b>${g.pct} %</b><span>${g.pts} de ${g.max} incisos${cnt('arr') ? ` · ${cnt('arr')} con arrastre` : ''}${!ex && Object.keys(ST.seen).length ? ` · ${Object.keys(ST.seen).length} con la solución vista` : ''}</span></div>
    <p>${ok ? '¡Bien! Ejercicio dominado. Prueba una variante para asegurarte.' : `Te faltó para el ${M.PASS} %. Lee las soluciones y vuelve a intentarlo con otra variante.`}</p>`;
  res.hidden = false;
  BOX.querySelector('[data-endb]').innerHTML = `<button class="btn primary" data-new="v">Otra variante</button><button class="btn" data-again>Repetir estos datos</button><button class="btn" data-home>← Temas</button>`;
  res.scrollIntoView({ block: 'center', behavior: 'smooth' });
  calcOn(false);
}

/* ------------------------------------------------------------------ eventos */
let resetArm = 0;
function onClick(e){
  const b = e.target.closest('button'); if (!b || !BOX.contains(b)) return;
  const P = pref();
  if (b.closest('[data-pref]')) { const k = b.closest('[data-pref]').dataset.pref; setPref({ [k]: b.dataset.v }); home(); return; }
  if (b.dataset.ej) { start(b.dataset.ej, P.src === 'v' ? M.newSeed() : 0, P.mode); return; }
  if ('cont' in b.dataset) { const c = M.loadCur(); if (c) start(c.e, c.seed, c.mode, c); return; }
  if ('drop' in b.dataset) { M.saveCur(null); home(); return; }
  if ('home' in b.dataset) { home(); SEC.scrollIntoView({ block: 'start' }); return; }
  if (b.dataset.new) { start(X.def.id, b.dataset.new === 'v' ? M.newSeed() : 0, ST ? ST.mode : P.mode); return; }
  if ('again' in b.dataset) { start(X.def.id, X.seed, ST.mode); return; }
  if ('calc' in b.dataset) { calcOpen(); return; }
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
  const li = i.closest('.en-inc'); if (li && li.dataset.st) { delete li.dataset.st; i.closest('.en-f').dataset.st = 'vacio'; const fb = li.querySelector('[data-fb]'); fb.textContent = ''; fb.className = 'en-fb'; }
  preview();
}
function onKey(e){
  const i = e.target; if (e.key !== 'Enter' || !i.matches || !i.matches('input[data-ans]')) return;
  e.preventDefault();
  const all = [...BOX.querySelectorAll('input[data-ans]:not([readonly])')], li = i.closest('.en-inc'), mine = [...li.querySelectorAll('input[data-ans]')];
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
    addEventListener('hashchange', () => { if (location.hash !== '#entrenar') calcOn(false); else if (view === 'ex' && ST && !ST.done) calcOn(true); });
    await needCalc();
    home();
  } else if (view === 'ex' && ST && !ST.done) calcOn(true);
  else if (view === 'home') home();
}
export const api = { M, EJ, TEMAS, start: (id, seed, mode) => start(id, seed || 0, mode || 'p'), home, get X(){ return X; }, get ST(){ return ST; } };
