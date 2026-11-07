/* =====================================================================================================
   entrenar/motor.js · Motor de ejercicios del apartado «Entrenar» (Laboratorio LGDR) · etapas 1–6
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
     · Casillas de plano s (etapa 2, campo con plane:true): la respuesta es una lista de polos (x), ceros (o) y puntos (.)
       guardada como texto «x:-2,0;o:-1,0» (ptsStr / readPts). Con sym:true se guarda un representante por par conjugado
       (Im ≥ 0) y expandPts agrega el conjugado; con real:true todo va sobre el eje real. Se califica emparejando cada punto
       esperado con uno del mismo tipo a ±max(tol·|s|, abs) (abs por omisión 0.15): ni de más ni de menos (matchPts).
     · Guardado (localStorage['lgdr-entrena-v1'], entra en la sincronización): solo números y una lista, para
       que la combinación genérica (máximo de cada número, la lista más larga) funcione:
         {v:1, tot, ex:{<id>:{n, ok, best, t, var, tarea, m:{<inciso>:fallos}, mz:{<inciso>:fallos ya corregidos}}}, h:[{e, s, t, x, r}],
          xh:[{t, n, s, d}] (exámenes de varios ejercicios), xn (cuántos), xb (mejor % de un simulacro de 6 o más)}
       El intento en curso va aparte (localStorage['lgdr-entrena-actual'], solo este dispositivo).
   ===================================================================================================== */

export const KEY = 'lgdr-entrena-v1';
export const CUR = 'lgdr-entrena-actual';
export const EXK = 'lgdr-entrena-examen';   // examen de varios ejercicios en curso o terminado (solo este dispositivo)
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

/* etapa 3 · Ans y memorias (A–F, x, y, z, M) de la calculadora en las casillas: se leen de lo que la calculadora guardó
   (localStorage['lgdr-calc-v1'], que se actualiza con cada cálculo). La interfaz cambia la expresión por su valor al salir de
   la casilla (freeze), para que la calificación no cambie si después se usa la calculadora otra vez. */
const CALC_KEY = 'lgdr-calc-v1', MEMS = ['A', 'B', 'C', 'D', 'E', 'F', 'x', 'y', 'z', 'M'];
const toZ = a => Array.isArray(a) && Number.isFinite(+a[0]) && Number.isFinite(+a[1]) ? C(+a[0], +a[1]) : null;
export function calcEnv(){
  let S = null; try { S = JSON.parse(localStorage.getItem(CALC_KEY) || 'null'); } catch (e) {}
  const vars = {}, mem = (S && S.mem) || {};
  MEMS.forEach(k => { const z = toZ(mem[k]); if (z) vars[k] = z; });
  return { deg: true, vars, ans: toZ(S && S.ans) || C(0, 0) };
}
/* ¿la expresión usa Ans o una memoria? */
export function usesVars(n){
  if (!n || typeof n !== 'object') return false;
  if (n.k === 'var' || n.k === 'ans') return true;
  return Object.values(n).some(v => Array.isArray(v) ? v.some(usesVars) : (v && typeof v === 'object' && usesVars(v)));
}
/* valor para dejar en la casilla en lugar de la expresión con Ans / memorias (null si no hace falta) */
export function freeze(raw){
  const p = parseAns(raw); if (!p.ok || !p.vars) return null;
  const t = v => String(+v.toPrecision(10));
  return p.v.im ? `${t(p.v.re)}${p.v.im < 0 ? '-' : '+'}${t(Math.abs(p.v.im))}i` : t(p.v.re);
}

/* lee lo que escribió el alumno → {ok, v:{re,im}, vars} o {ok:false, err} */
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
  try { const node = E.parse(s), vars = usesVars(node), z = E.evaluate(node, calcEnv());
    if (Number.isFinite(z.re) && Number.isFinite(z.im)) return { ok: true, v: C(z.re, z.im), vars }; }
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

/* ------------------------------------------------------------------ plano s (etapa 2) */
export const isPlane = fl => !!(fl && fl.plane);
const r4 = v => Math.round(v * 1e4) / 1e4;
/* lista de representantes → texto para guardar (y al revés) */
export const ptsStr = L => (L || []).map(p => `${p.t}:${r4(p.re)},${r4(p.im)}`).join(';');
export function readPts(raw){
  const out = [];
  String(raw == null ? '' : raw).split(';').forEach(s => { const m = /^\s*([xo.]):(-?[\d.]+(?:e-?\d+)?),(-?[\d.]+(?:e-?\d+)?)\s*$/i.exec(s);
    if (m && Number.isFinite(+m[2]) && Number.isFinite(+m[3])) out.push({ t: m[1].toLowerCase(), re: +m[2], im: +m[3] }); });
  return out;
}
/* representantes → lista completa (con sym agrega el conjugado justo después; mismo orden que entrenar/plano.js) */
export function expandPts(reps, fl){
  const out = [];
  reps.forEach(p => { const im = fl.real ? 0 : p.im; out.push({ t: p.t, re: p.re, im });
    if (fl.sym && !fl.real && Math.abs(im) > 1e-9) out.push({ t: p.t, re: p.re, im: -im }); });
  return out;
}
export function parsePts(raw, fl){
  const reps = readPts(raw);
  if (!reps.length) return { ok: false, empty: true };
  return { ok: true, v: expandPts(reps, fl) };
}
/* tolerancia de un punto esperado b */
export const ptTol = (b, fl) => Math.max((fl.tol != null ? fl.tol : TOL) * Math.hypot(b.re, b.im), fl.abs != null ? fl.abs : 0.15);
/* empareja lo ubicado (got) con lo esperado (exp): los pares más cercanos primero, solo del mismo tipo y dentro de la tolerancia.
   → {ok, good:[bool por cada ubicado], hit:[bool por cada esperado], n:esperados, m:ubicados, h:aciertos} */
export function matchPts(got, exp, fl){
  got = got || []; exp = exp || [];
  const one = !fl.marks || fl.marks.length < 2, ty = p => one ? '*' : (p.t || fl.marks[0]);
  const pairs = [];
  got.forEach((a, i) => exp.forEach((b, j) => { if (ty(a) !== ty(b)) return; const d = Math.hypot(a.re - b.re, a.im - b.im); if (d <= ptTol(b, fl)) pairs.push([d, i, j]); }));
  pairs.sort((u, v) => u[0] - v[0]);
  const good = got.map(() => false), hit = exp.map(() => false);
  pairs.forEach(([, i, j]) => { if (!good[i] && !hit[j]) { good[i] = true; hit[j] = true; } });
  const h = hit.filter(Boolean).length;
  return { ok: h === exp.length && got.length === exp.length, good, hit, n: exp.length, m: got.length, h };
}
/* ¿a y b son la misma respuesta para esta casilla? */
const same = (a, b, fl) => isPlane(fl) ? matchPts(a, b, fl).ok : close(a, b, fl);

/* ------------------------------------------------------------------ armar un ejercicio
   Definición de ejercicio (ver entrenar/ejercicios.js):
     {id, tema, t, nivel, gen(r, tarea) → P, enun(P, h) → html, inc:[{k, q(P,h), f:[{k, l, u, tol, abs, ang}], sol(P, A) → {campo: valor}, how(P, A, S, h) → html}]}
   h = utilidades de dibujo (tx = KaTeX, n = número en TeX) que pone la interfaz. */
export function build(def, seed){
  seed = +seed || 0;
  /* semilla 0 = caso de la tarea; semilla −N = caso de la práctica N (ejercicios con def.casos, etapa 5); > 0 = variante */
  const tarea = seed <= 0;
  const P = def.gen(rng(seed > 0 ? seed : 1), tarea ? (seed < 0 ? -seed : true) : false);
  /* etapa 6: ejercicios cuyos incisos dependen de los datos (tema 16) → copia de la definición con su lista */
  if (def.incOf) def = Object.assign({}, def, { inc: def.incOf(P) });
  return { def, seed, tarea, P };
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
      const p = isPlane(fl) ? parsePts(answers[fl.k], fl) : parseAns(answers[fl.k]);
      const fr = r.f[fl.k] = { st: 'vacio' };
      if (p.empty) { all = false; okT = okC = false; return; }
      any = true;
      if (!p.ok) { fr.st = 'err'; fr.err = p.err; bad = true; okT = okC = false; return; }
      fr.v = p.v;
      const t = same(p.v, S[fl.k], fl), c = same(p.v, Sc[fl.k], fl);
      fr.st = t ? 'ok' : c ? 'arr' : 'no';
      if (isPlane(fl)) fr.pm = matchPts(p.v, !t && c ? Sc[fl.k] : S[fl.k], fl);
      if (!t) okT = false; if (!c) okC = false;
    });
    /* lo que se arrastra a los incisos siguientes: lo escrito si se entiende; si no, lo correcto */
    fs.forEach(fl => { const fr = r.f[fl.k]; T[fl.k] = S[fl.k]; A[fl.k] = fr && fr.v ? (isPlane(fl) ? fr.v : isC(S[fl.k]) || fr.v.im ? fr.v : fr.v.re) : S[fl.k]; });
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
const differs = (S, Sc, fs) => fs.some(fl => !same(Sc[fl.k], S[fl.k], fl));
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
  if (!isObj(e.mz)) e.mz = {};
  /* m = fallos de cada inciso (solo suben); mz = cuántos de esos ya se corrigieron (al acertar el inciso sin ver la solución,
     mz alcanza a m). Pendientes = m − mz (repaso de errores). Los dos solo suben, así la sincronización (máximo) no los rompe. */
  Object.entries(res.inc).forEach(([k, r]) => { if (r.pts < 1 || (seen && seen[k])) e.m[k] = (e.m[k] || 0) + 1; else if (e.m[k]) e.mz[k] = e.m[k]; });
  D.h.unshift({ e: id, s: pct, t: now, x: mode === 'x' ? 1 : 0, r: X.seed });
  if (D.h.length > 50) D.h.length = 50;
  save(D);
  return D;
}
/* etapa 6 · examen de varios ejercicios: historial (≤ 20) y mejor calificación de un simulacro (6 ejercicios o más) */
export const SIM_N = 6;
export function recordExam(n, pct, ms){
  const D = load();
  if (!Array.isArray(D.xh)) D.xh = [];
  D.xh.unshift({ t: Date.now(), n, s: pct, d: Math.round(ms || 0) });
  if (D.xh.length > 20) D.xh.length = 20;
  D.xn = (D.xn || 0) + 1;
  if (n >= SIM_N) D.xb = Math.max(D.xb || 0, pct);
  save(D); return D;
}
/* etapa 6 · repaso de errores: ejercicios con incisos fallados que aún no se corrigen, del que más tiene al que menos
   → [{id, p (pendientes), m (fallos en total), ks:[[inciso, pendientes]], best}] */
export function pending(defs){
  const D = load(), out = [];
  defs.forEach(def => { const e = D.ex[def.id]; if (!e || !isObj(e.m)) return;
    const mz = isObj(e.mz) ? e.mz : {}, ks = Object.keys(e.m).map(k => [k, Math.max(0, (e.m[k] || 0) - (mz[k] || 0))]).filter(x => x[1] > 0).sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1));
    if (!ks.length) return;
    out.push({ id: def.id, p: ks.reduce((a, x) => a + x[1], 0), m: Object.values(e.m).reduce((a, v) => a + (v || 0), 0), ks, best: e.best || 0 }); });
  return out.sort((a, b) => b.p - a.p || a.best - b.best);
}
export function setTotal(n){ const D = load(); if (D.tot !== n) { D.tot = n; save(D); } }
export function resetAll(){ try { localStorage.removeItem(KEY); localStorage.removeItem(CUR); localStorage.removeItem(EXK); } catch (e) {} }
export function loadExam(){ try { const o = JSON.parse(localStorage.getItem(EXK) || 'null'); return isObj(o) && Array.isArray(o.items) && o.items.length ? o : null; } catch (e) { return null; } }
export function saveExam(o){ try { if (o) localStorage.setItem(EXK, JSON.stringify(o)); else localStorage.removeItem(EXK); } catch (e) {} }

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
