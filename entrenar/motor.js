/* =====================================================================================================
   entrenar/motor.js · Motor de ejercicios del apartado «Entrenar» (Laboratorio LGDR) · etapa 1
   ---------------------------------------------------------------------------------------------------
   Sin interfaz. Lo usa entrenar/ui.js.
     · Variantes: cada ejercicio se arma con una semilla (0 = el caso de la tarea; otra = variante aleatoria
       reproducible con mulberry32), así una variante se puede repetir o retomar.
     · Respuestas: se leen con el motor de la calculadora (window.LGDRCalc.engine), así que se puede escribir
       «-12/3», «sqrt(2)/2», «2.5e3», «-2+3i» o «2,5» (coma decimal). Sin calculadora cargada, solo números.
     · Tolerancia: ±1 % del valor correcto (con un mínimo absoluto por casilla para los valores cercanos a 0).
       Ángulos (ang:true) se comparan módulo 360°. Complejos por la distancia |a − b|.
     · Calificación con arrastre: cada inciso calcula su solución dos veces, con los valores correctos de los
       incisos anteriores y con los que escribió el alumno. Si el alumno se equivocó antes pero aquí aplicó bien
       el método con su propio valor, el inciso cuenta completo y se marca «con arrastre».
     · Guardado (localStorage['lgdr-entrena-v1'], entra en la sincronización): solo números y una lista, para
       que la combinación genérica (máximo de cada número, la lista más larga) funcione:
         {v:1, tot, ex:{<id>:{n, ok, best, t, var, tarea, m:{<inciso>:fallos}}}, h:[{e, s, t, x, r}]}
       El intento en curso va aparte (localStorage['lgdr-entrena-actual'], solo este dispositivo).
   ===================================================================================================== */

export const KEY = 'lgdr-entrena-v1';
export const CUR = 'lgdr-entrena-actual';
export const TOL = 0.01;          // ±1 %
export const PASS = 80;           // % para dar por dominado un ejercicio

/* ------------------------------------------------------------------ azar reproducible */
export function rng(seed){
  let a = (seed >>> 0) || 1;
  const r = () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  r.int = (lo, hi) => lo + Math.floor(r() * (hi - lo + 1));
  r.pick = arr => arr[Math.floor(r() * arr.length)];
  r.step = (lo, hi, st) => { const n = Math.round((hi - lo) / st); return +(lo + st * r.int(0, n)).toFixed(10); };
  r.distinct = (k, lo, hi) => { const s = new Set(); let g = 0; while (s.size < k && g++ < 500) s.add(r.int(lo, hi)); return [...s]; };
  return r;
}
export const newSeed = () => 1 + Math.floor(Math.random() * 999999);

/* ------------------------------------------------------------------ números */
const isC = v => v && typeof v === 'object' && 're' in v;
export const C = (re, im) => ({ re: +re || 0, im: +im || 0 });
const toC = v => isC(v) ? v : C(v, 0);

/* lee lo que escribió el alumno → {ok, v:{re,im}} o {ok:false, err} */
export function parseAns(raw){
  let s = String(raw == null ? '' : raw).trim();
  if (!s) return { ok: false, empty: true };
  s = s.replace(/[−–]/g, '-').replace(/\s+/g, '').replace(/°$/, '');
  if (/^[-+]?\d+,\d+$/.test(s) || (/,/.test(s) && !/[a-z(]/i.test(s))) s = s.replace(/,/g, '.');   // coma decimal
  if (/%$/.test(s)) s = s.slice(0, -1);
  const n = Number(s);
  if (s !== '' && Number.isFinite(n)) return { ok: true, v: C(n, 0) };
  const E = window.LGDRCalc && window.LGDRCalc.engine;
  if (!E) return { ok: false, err: 'Escribe solo un número (la calculadora aún no carga).' };
  try { const z = E.calc(s, { deg: true }); if (Number.isFinite(z.re) && Number.isFinite(z.im)) return { ok: true, v: C(z.re, z.im) }; }
  catch (e) { return { ok: false, err: e && e.calc === 'math' ? 'Error matemático en lo que escribiste.' : 'No entiendo lo que escribiste (revisa paréntesis y signos).' }; }
  return { ok: false, err: 'No entiendo lo que escribiste.' };
}

/* ¿a está a ±tol de b? (abs = tolerancia absoluta mínima; ang = comparar ángulos módulo 360°) */
export function close(a, b, f){
  f = f || {};
  const tol = f.tol != null ? f.tol : TOL, ab = f.abs != null ? f.abs : 1e-3;
  a = toC(a); b = toC(b);
  if (f.ang) { const d = ((a.re - b.re) % 360 + 540) % 360 - 180; return Math.abs(d) <= Math.max(tol * Math.max(Math.abs(b.re), 1), ab, 0.5); }
  const d = Math.hypot(a.re - b.re, a.im - b.im), m = Math.hypot(b.re, b.im);
  return d <= Math.max(tol * m, ab);
}

/* número bonito para mostrar (texto, no TeX) */
export function fmt(v, sig){
  sig = sig || 4;
  const one = x => { if (!Number.isFinite(x)) return x > 0 ? '∞' : x < 0 ? '−∞' : '—';
    if (Math.abs(x) < 1e-10) return '0';
    const a = Math.abs(x); let s;
    if (a >= 1e5 || a < 1e-3) s = x.toExponential(sig - 1).replace(/e\+?(-?)(\d+)/, (m, g, e) => ' × 10^' + g + e);
    else s = String(+x.toPrecision(sig));
    return s.replace(/^-/, '−'); };
  if (isC(v)) { if (Math.abs(v.im) < 1e-10 * Math.max(1, Math.abs(v.re))) return one(v.re);
    const re = Math.abs(v.re) < 1e-10 ? '' : one(v.re), im = one(Math.abs(v.im));
    return (re ? re + (v.im < 0 ? ' − ' : ' + ') : (v.im < 0 ? '−' : '')) + 'j' + im; }
  return one(v);
}

/* ------------------------------------------------------------------ armar un ejercicio
   Definición de ejercicio (ver entrenar/ejercicios.js):
     {id, tema, t, nivel, gen(r, tarea) → P, enun(P, h) → html, inc:[{k, q(P,h), f:[{k, l, u, tol, abs, ang}], sol(P, A) → {campo: valor}, how(P, A, S, h) → html}]}
   h = utilidades de dibujo (tx = KaTeX, n = número en TeX) que pone la interfaz. */
export function build(def, seed){
  const tarea = !seed;
  const P = def.gen(rng(seed || 1), tarea);
  return { def, seed: seed || 0, tarea, P };
}

/* calificar: answers = {campo: texto}. Devuelve por inciso {st:'ok'|'arr'|'no'|'vacio'|'err', pts, S (correcta), Sc (con arrastre), T / A (valores anteriores
   correctos / del alumno), f:{campo:{st, v, err}}} */
export function grade(X, answers, only){
  const { def, P } = X, A = {}, T = {}, out = {};
  let pts = 0, max = 0;
  def.inc.forEach((inc, i) => {
    const S = inc.sol(P, T);            // con los valores correctos de antes
    const Sc = inc.sol(P, A);           // con lo que escribió el alumno antes (o lo correcto si lo dejó vacío)
    const r = { st: 'vacio', pts: 0, S, Sc, f: {}, T: Object.assign({}, T), A: Object.assign({}, A) };
    let all = true, okT = true, okC = true, any = false, bad = false;
    const fs = fields(inc, P);
    fs.forEach(fl => {
      const p = parseAns(answers[fl.k]);
      const fr = r.f[fl.k] = { st: 'vacio' };
      if (p.empty) { all = false; okT = okC = false; return; }
      any = true;
      if (!p.ok) { fr.st = 'err'; fr.err = p.err; bad = true; okT = okC = false; return; }
      fr.v = p.v;
      const t = close(p.v, S[fl.k], fl), c = close(p.v, Sc[fl.k], fl);
      fr.st = t ? 'ok' : c ? 'arr' : 'no';
      if (!t) okT = false; if (!c) okC = false;
    });
    /* lo que se arrastra a los incisos siguientes: lo escrito si se entiende; si no, lo correcto */
    fs.forEach(fl => { const fr = r.f[fl.k]; T[fl.k] = S[fl.k]; A[fl.k] = fr && fr.v ? (isC(S[fl.k]) || fr.v.im ? fr.v : fr.v.re) : S[fl.k]; });
    if (!any) r.st = 'vacio';
    else if (bad) r.st = 'err';
    else if (all && okT) r.st = 'ok';
    else if (all && okC && differs(S, Sc, fs)) r.st = 'arr';
    else r.st = 'no';
    r.pts = r.st === 'ok' || r.st === 'arr' ? 1 : 0;
    if (!only || only.includes(inc.k)) { pts += r.pts; max += 1; }
    out[inc.k] = r;
  });
  return { inc: out, pts, max, pct: max ? Math.round(100 * pts / max) : 0 };
}
const differs = (S, Sc, fs) => fs.some(fl => !close(Sc[fl.k], S[fl.k], fl));
/* casillas de un inciso (pueden depender de la variante: f puede ser una función de P) */
export const fields = (inc, P) => typeof inc.f === 'function' ? inc.f(P) : inc.f;

/* ------------------------------------------------------------------ guardado */
const isObj = v => !!v && typeof v === 'object' && !Array.isArray(v);
export function load(){
  try { const o = JSON.parse(localStorage.getItem(KEY) || 'null'); if (isObj(o)) { if (!isObj(o.ex)) o.ex = {}; if (!Array.isArray(o.h)) o.h = []; o.v = 1; return o; } } catch (e) {}
  return { v: 1, ex: {}, h: [] };
}
export function save(D){ try { localStorage.setItem(KEY, JSON.stringify(D)); return true; } catch (e) { return false; } }

/* registra un intento terminado. res = grade(...); mode 'p' práctica | 'x' examen; seen = incisos con la solución vista (no cuentan) */
export function record(X, res, mode, seen){
  const D = load(), id = X.def.id, e = D.ex[id] = isObj(D.ex[id]) ? D.ex[id] : {};
  const pct = res.pct, now = Date.now();
  e.n = (e.n || 0) + 1;
  if (pct >= 100) e.ok = (e.ok || 0) + 1;
  e.best = Math.max(e.best || 0, pct);
  e.t = now;
  if (X.tarea) e.tarea = Math.max(e.tarea || 0, pct); else e.var = Math.max(e.var || 0, pct);
  if (!isObj(e.m)) e.m = {};
  Object.entries(res.inc).forEach(([k, r]) => { if (r.pts < 1 || (seen && seen[k])) e.m[k] = (e.m[k] || 0) + 1; });
  D.h.unshift({ e: id, s: pct, t: now, x: mode === 'x' ? 1 : 0, r: X.seed });
  if (D.h.length > 50) D.h.length = 50;
  save(D);
  return D;
}
export function setTotal(n){ const D = load(); if (D.tot !== n) { D.tot = n; save(D); } }
export function resetAll(){ try { localStorage.removeItem(KEY); localStorage.removeItem(CUR); } catch (e) {} }

/* intento en curso (solo este dispositivo) */
export function loadCur(){ try { const o = JSON.parse(localStorage.getItem(CUR) || 'null'); return isObj(o) ? o : null; } catch (e) { return null; } }
export function saveCur(o){ try { if (o) localStorage.setItem(CUR, JSON.stringify(o)); else localStorage.removeItem(CUR); } catch (e) {} }

/* resumen para la Ruta y la sincronización */
export function stats(defs){
  const D = load(), ids = defs.map(d => d.id);
  const dom = ids.filter(id => D.ex[id] && (D.ex[id].best || 0) >= PASS).length;
  const tried = ids.filter(id => D.ex[id] && D.ex[id].n).length;
  return { dom, tried, tot: ids.length, n: ids.reduce((a, id) => a + ((D.ex[id] && D.ex[id].n) || 0), 0) };
}
