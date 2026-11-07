/* =====================================================================================================
   entrenar/ejercicios.js · Temas y ejercicios del apartado «Entrenar» · etapas 1–4
   ---------------------------------------------------------------------------------------------------
   TEMAS = los 16 temas del plan (los que aún no tienen ejercicios dicen en qué etapa llegan).
   EJ    = ejercicios. Etapa 4: temas 1–12 con el piloto de la P1 (caso de la tarea: G = K/[(s+2)(s+4)(s+6)], %OS = 10,
           s₀ = −2.0285 ± j2.7677, K = 45.53) y variantes aleatorias (3 polos enteros, a veces uno en el origen o un cero).
   Formato de un ejercicio (lo lee entrenar/motor.js):
     {id, tema, t, d, gen(r, tarea) → P, enun(P,h) → html,
      inc:[{k, q(P,h) → html, tools?: (P) → [{app:'eqn', n} | {app:'solve'} | {app:'cplx'}], f:[{k, l, u, tol, abs, ang}] | (P) → [...], sol(P, A) → {campo: valor}, how(P, A, S, h) → html}]}
   Casilla de plano s (etapa 2): {k, l, plane:true, marks:['x','o','.'], sym, real, snap, abs, tol, max, view}; su solución es una lista
   [{t, re, im}] completa (con los dos conjugados).
   Casilla de opción (etapa 4): {k, l, ch:[{v, l}]} → botones; la respuesta es el número v (p. ej. 1 = Sí, 0 = No).
   A = valores de los incisos anteriores (los correctos o los del alumno, para el arrastre).
   h = {tx(TeX, display), n(número) → TeX, f(número) → texto}.
   ===================================================================================================== */

export const TEMAS = [
  { n: 1,  t: 'Polos, ceros y tipo en el plano s', e: 4 },
  { n: 2,  t: 'Ecuación característica', e: 4 },
  { n: 3,  t: 'LGDR sobre el eje real', e: 4 },
  { n: 4,  t: 'Asíntotas', e: 4 },
  { n: 5,  t: 'Puntos de ruptura', e: 4 },
  { n: 6,  t: 'Routh: K crítica y cruce con jω', e: 4 },
  { n: 7,  t: 'ζ, %OS y la recta de ζ', e: 4 },
  { n: 8,  t: 'Condición de ángulo', e: 4 },
  { n: 9,  t: 'Condición de magnitud (K)', e: 4 },
  { n: 10, t: 'Polos en lazo cerrado', e: 4 },
  { n: 11, t: 'Respuesta transitoria', e: 4 },
  { n: 12, t: 'Error en estado estacionario', e: 4 },
  { n: 13, t: 'Compensadores (PI, atraso, PD, adelanto, PID, adelanto‑atraso)', e: 5 },
  { n: 14, t: 'Verificación del diseño', e: 5 },
  { n: 15, t: 'Simulink', e: 5 },
  { n: 16, t: 'Problema completo', e: 6 }
];

/* ------------------------------------------------------------------ utilidades */
const sum = a => a.reduce((x, y) => x + y, 0);
const sgn = v => (v < 0 ? '-' : '+');
/* (s + a) con el signo correcto; a = 0 → s */
const fac = a => (Math.abs(a) < 1e-12 ? 's' : `(s ${sgn(a)} ${Math.abs(+a.toFixed(4))})`);
const den = ps => ps.map(fac).join('');
/* planta K·Π(s+z)/Π(s+p) en TeX */
const GTeX = (P, k) => `G(s) = \\dfrac{${k || 'K'}${(P.z || []).map(fac).join('')}}{${den(P.p)}}`;
/* coeficientes de Π(s + p) (mayor a menor) */
function polyOf(ps){ let c = [1]; ps.forEach(p => { const n = c.concat(0); for (let i = 0; i < c.length; i++) n[i + 1] += c[i] * p; c = n; }); return c; }
/* polos de la planta para las variantes: 3 enteros distintos (sin repetir la tarea) */
function plant(r, tarea, opt){
  opt = opt || {};
  if (tarea) return { p: [2, 4, 6], z: [] };
  let p;
  do { p = r.distinct(3, opt.lo || 1, opt.hi || 9).sort((a, b) => a - b); } while (p.join() === '2,4,6');
  if (opt.zero0 && r() < 0.35) p[0] = 0;
  return { p, z: [] };
}

/* ------------------------------------------------------------------ tema 4 · asíntotas */
const asint = {
  id: 'asint', tema: 4, t: 'Asíntotas del LGDR', d: 'Número de asíntotas, centroide y ángulos.',
  gen(r, tarea){
    const P = plant(r, tarea);
    if (!tarea && r() < 0.45) { let z; do { z = r.int(1, 12); } while (P.p.includes(z)); P.z = [z]; }
    P.n = P.p.length; P.m = P.z.length;
    return P;
  },
  enun: (P, h) => `<p>Para el sistema con realimentación unitaria</p>${h.tx(GTeX(P), true)}<p>encuentra las asíntotas del lugar geométrico de las raíces.</p>`,
  inc: [
    { k: 'a', q: () => '¿Cuántas asíntotas tiene el LGDR (n − m)?', f: [{ k: 'na', l: 'n − m', abs: 0.01 }],
      sol: P => ({ na: P.n - P.m }),
      how: (P, A, S, h) => `<p>n = ${P.n} polos finitos y m = ${P.m} ${P.m === 1 ? 'cero finito' : 'ceros finitos'}: las ramas que no terminan en un cero se van al infinito por las asíntotas.</p>${h.tx(`n - m = ${P.n} - ${P.m} = ${S.na}`, true)}` },
    { k: 'b', q: () => 'Centroide de las asíntotas σ<sub>a</sub>.', f: [{ k: 'sa', l: 'σ<sub>a</sub>', abs: 0.005 }],
      sol: (P, A) => ({ sa: (sum(P.p.map(v => -v)) - sum(P.z.map(v => -v))) / (A.na != null ? A.na : P.n - P.m) }),
      how: (P, A, S, h) => { const sp = sum(P.p.map(v => -v)), sz = sum(P.z.map(v => -v)), q = A.na != null ? A.na : P.n - P.m;
        return `<p>Suma de los polos menos suma de los ceros, entre el número de asíntotas:</p>${h.tx(`\\sigma_a = \\dfrac{\\sum p - \\sum z}{n-m} = \\dfrac{(${P.p.map(v => h.n(-v)).join(')+(')})${P.m ? ` - (${P.z.map(v => h.n(-v)).join(')+(')})` : ''}}{${h.n(q)}} = \\dfrac{${h.n(sp - sz)}}{${h.n(q)}} = ${h.n(S.sa)}`, true)}`; } },
    { k: 'c', q: P => `Ángulos de las asíntotas θ<sub>k</sub> para k = 0${P.n - P.m > 1 ? ' … ' + (P.n - P.m - 1) : ''} (en grados, entre 0° y 360°).`,
      f: P => Array.from({ length: P.n - P.m }, (_, k) => ({ k: 'th' + k, l: `θ<sub>${k}</sub>`, u: '°', ang: true })),
      sol: (P, A) => { const q = A.na != null ? A.na : P.n - P.m, o = {}; for (let k = 0; k < P.n - P.m; k++) o['th' + k] = (2 * k + 1) * 180 / q; return o; },
      how: (P, A, S, h) => { const q = A.na != null ? A.na : P.n - P.m;
        return `${h.tx(`\\theta_k = \\dfrac{(2k+1)\\,180^\\circ}{n-m} = \\dfrac{(2k+1)\\,180^\\circ}{${h.n(q)}}`, true)}<p>${Object.keys(S).map((c, k) => `k = ${k}: ${h.f(S[c])}°`).join(' · ')}</p>`; } }
  ]
};

/* ------------------------------------------------------------------ tema 6 · Routh */
const routh = {
  id: 'routh', tema: 6, t: 'K crítica con Routh', d: 'Coeficientes, fila s¹ y cruce con el eje jω.',
  gen(r, tarea){ const P = plant(r, tarea, { zero0: true }); P.c = polyOf(P.p); return P; },
  enun: (P, h) => `<p>Para el sistema con realimentación unitaria</p>${h.tx(GTeX(P), true)}<p>la ecuación característica es ${h.tx('1 + G(s) = 0')}. Usa el arreglo de Routh para encontrar la ganancia crítica y la frecuencia a la que el LGDR cruza el eje ${h.tx('j\\omega')}.</p>`,
  inc: [
    { k: 'a', q: (P, h) => `Escribe la ecuación característica como ${h.tx('s^3 + a_2 s^2 + a_1 s + (a_0 + K) = 0')}: ¿cuánto valen a<sub>2</sub>, a<sub>1</sub> y a<sub>0</sub>?`,
      f: [{ k: 'a2', l: 'a<sub>2</sub>' }, { k: 'a1', l: 'a<sub>1</sub>' }, { k: 'a0', l: 'a<sub>0</sub>' }],
      sol: P => ({ a2: P.c[1], a1: P.c[2], a0: P.c[3] }),
      how: (P, A, S, h) => `<p>Multiplica el denominador y súmale K:</p>${h.tx(`\\begin{aligned}&${den(P.p)} + K \\\\ &= s^3 + ${h.n(S.a2)}s^2 + ${h.n(S.a1)}s + ${h.n(S.a0)} + K\\end{aligned}`, true)}` },
    { k: 'b', q: () => 'La fila s¹ del arreglo se anula en la ganancia crítica: ¿cuánto vale K<sub>crít</sub>?', f: [{ k: 'kc', l: 'K<sub>crít</sub>' }],
      sol: (P, A) => ({ kc: (A.a2 != null ? A.a2 : P.c[1]) * (A.a1 != null ? A.a1 : P.c[2]) - (A.a0 != null ? A.a0 : P.c[3]) }),
      how: (P, A, S, h) => { const a2 = A.a2 != null ? A.a2 : P.c[1], a1 = A.a1 != null ? A.a1 : P.c[2], a0 = A.a0 != null ? A.a0 : P.c[3];
        return `<p>Arreglo de Routh:</p>${h.tx(`\\begin{array}{c|cc} s^3 & 1 & ${h.n(a1)} \\\\ s^2 & ${h.n(a2)} & ${h.n(a0)}+K \\\\ s^1 & \\dfrac{${h.n(a2)}\\cdot${h.n(a1)} - (${h.n(a0)}+K)}{${h.n(a2)}} & \\\\ s^0 & ${h.n(a0)}+K & \\end{array}`, true)}<p>La fila s¹ se hace cero cuando</p>${h.tx(`K_{crít} = ${h.n(a2)}\\cdot${h.n(a1)} - ${h.n(a0)} = ${h.n(S.kc)}`, true)}<p>Estable para ${h.tx(`${h.n(-a0)} < K < ${h.n(S.kc)}`)} (con K &gt; 0: ${h.tx(`0 < K < ${h.n(S.kc)}`)}).</p>`; } },
    { k: 'c', q: (P, h) => `Con K = K<sub>crít</sub>, la fila s² da el polinomio auxiliar. ¿A qué frecuencia ω cruza el LGDR el eje ${h.tx('j\\omega')}?`, f: [{ k: 'w', l: 'ω', u: 'rad/s' }],
      sol: (P, A) => { const a2 = A.a2 != null ? A.a2 : P.c[1], a0 = A.a0 != null ? A.a0 : P.c[3], kc = A.kc != null ? A.kc : P.c[1] * P.c[2] - P.c[3]; return { w: Math.sqrt(Math.max(0, (a0 + kc) / a2)) }; },
      how: (P, A, S, h) => { const a2 = A.a2 != null ? A.a2 : P.c[1], a0 = A.a0 != null ? A.a0 : P.c[3], kc = A.kc != null ? A.kc : P.c[1] * P.c[2] - P.c[3];
        return `${h.tx(`${h.n(a2)}s^2 + (${h.n(a0)} + ${h.n(kc)}) = 0 \\;\\Rightarrow\\; s = \\pm j\\sqrt{\\dfrac{${h.n(a0 + kc)}}{${h.n(a2)}}} = \\pm j\\,${h.n(S.w)}`, true)}`; } }
  ]
};

/* ------------------------------------------------------------------ tema 7 · ζ y la recta */
const zeta = {
  id: 'zeta', tema: 7, t: 'ζ, ángulo y punto sobre la recta', d: 'De %OS a ζ, θ, pendiente y ωd.',
  gen(r, tarea){
    const P = tarea ? { os: 10, sg: 2.0285 } : { os: r.int(4, 30), sg: r.step(0.8, 6, 0.1) };
    /* vista del plano para el inciso e) (s₀ y su conjugado) */
    const L = Math.log(P.os / 100), z = -L / Math.sqrt(Math.PI ** 2 + L * L), wd = P.sg * Math.tan(Math.acos(z));
    const x0 = Math.min(-4, Math.floor(-P.sg) - 2), ym = Math.max(3, Math.ceil(wd) + 1);
    P.view = { x0, x1: 1, y0: -ym, y1: ym };
    return P;
  },
  enun: (P, h) => `<p>Se pide un sobrepaso de <b>${P.os} %</b>. El par dominante debe quedar sobre la recta de ${h.tx('\\zeta')} constante, en un punto con parte real ${h.tx(`-\\sigma = ${h.n(-P.sg)}`)}.</p>`,
  inc: [
    { k: 'a', q: () => 'Factor de amortiguamiento ζ.', f: [{ k: 'z', l: 'ζ' }],
      sol: P => { const L = Math.log(P.os / 100); return { z: -L / Math.sqrt(Math.PI ** 2 + L * L) }; },
      how: (P, A, S, h) => h.tx(`\\zeta = \\dfrac{-\\ln(${h.n(P.os / 100)})}{\\sqrt{\\pi^2 + \\ln^2(${h.n(P.os / 100)})}} = ${h.n(S.z)}`, true) },
    { k: 'b', q: (P, h) => `Ángulo de la recta medido desde el eje real negativo: ${h.tx('\\theta = \\cos^{-1}\\zeta')} (en grados).`, f: [{ k: 'th', l: 'θ', u: '°' }],
      sol: (P, A) => ({ th: Math.acos(Math.max(-1, Math.min(1, A.z != null ? A.z : zeta.inc[0].sol(P).z))) * 180 / Math.PI }),
      how: (P, A, S, h) => h.tx(`\\theta = \\cos^{-1}(${h.n(A.z != null ? A.z : zeta.inc[0].sol(P).z)}) = {${h.n(S.th)}}^\\circ`, true) },
    { k: 'c', q: (P, h) => `Pendiente de la recta: ${h.tx('\\omega_d/\\sigma = \\tan\\theta')}.`, f: [{ k: 'tn', l: 'tan θ' }],
      sol: (P, A) => ({ tn: Math.tan((A.th != null ? A.th : 0) * Math.PI / 180) }),
      how: (P, A, S, h) => h.tx(`\\tan({${h.n(A.th)}}^\\circ) = ${h.n(S.tn)}`, true) },
    { k: 'd', q: (P, h) => `Punto de la recta con parte real ${h.tx(`${h.n(-P.sg)}`)}: ¿cuánto vale ${h.tx('\\omega_d')}?`, f: [{ k: 'wd', l: 'ω<sub>d</sub>' }],
      sol: (P, A) => ({ wd: P.sg * A.tn }),
      how: (P, A, S, h) => `${h.tx(`\\omega_d = \\sigma\\tan\\theta = ${h.n(P.sg)}\\cdot${h.n(A.tn)} = ${h.n(S.wd)}`, true)}<p>Punto de prueba: ${h.tx(`s_0 = ${h.n(-P.sg)} \\pm j${h.n(S.wd)}`)}.</p>` },
    { k: 'e', q: (P, h) => `Ubica el punto de prueba ${h.tx('s_0')} en el plano s (•). Su conjugado se pone solo. Fíjate que queda sobre la recta que sale del origen con el ángulo θ.`,
      f: [{ k: 's0', l: 'Punto de prueba s₀', plane: true, marks: ['.'], sym: true, snap: 0.25, abs: 0.15, tol: 0.02, max: 2 }],
      sol: (P, A) => { const w = Math.abs(A.wd != null ? A.wd : 0); return { s0: [{ t: '.', re: -P.sg, im: w }, { t: '.', re: -P.sg, im: -w }] }; },
      how: (P, A, S, h) => `<p>Parte real ${h.tx(`-\\sigma = ${h.n(-P.sg)}`)} y parte imaginaria ${h.tx(`\\omega_d = ${h.n(A.wd)}`)}: ${h.tx(`s_0 = ${h.n(-P.sg)} \\pm j${h.n(A.wd)}`)}. En el plano, escribe Re = ${h.f(-P.sg)} e Im = ${h.f(A.wd)} en las casillas del punto (o «→ Respuesta» desde la calculadora).</p>` }
  ]
};
/* el inciso c y d necesitan los valores anteriores correctos cuando no hay arrastre: el motor ya pasa A con lo correcto */

/* ------------------------------------------------------------------ tema 12 · error */
const error = {
  id: 'error', tema: 12, t: 'Error en estado estacionario', d: 'Tipo del sistema, constante de error y e(∞).',
  gen(r, tarea){
    const P = plant(r, tarea, { zero0: true });
    P.K = tarea ? 45.53 : r.step(5, 120, 0.5);
    P.N = P.p.filter(v => v === 0).length;
    return P;
  },
  enun: (P, h) => `<p>Con realimentación unitaria y</p>${h.tx(GTeX(P, h.n(P.K)), true)}<p>calcula el error en estado estacionario ante ${P.N ? 'una <b>rampa unitaria</b>' : 'un <b>escalón unitario</b>'}.</p>`,
  inc: [
    { k: 'a', q: () => 'Tipo del sistema (número de integradores puros en G).', f: [{ k: 'N', l: 'Tipo', abs: 0.01 }],
      sol: P => ({ N: P.N }),
      how: (P, A, S, h) => `<p>${P.N ? 'Hay un polo en s = 0' : 'Ningún polo está en s = 0'}: tipo ${S.N}.</p>` },
    { k: 'b', q: (P, h) => P.N ? `Constante de velocidad ${h.tx('K_v = \\lim_{s\\to0} sG(s)')}.` : `Constante de posición ${h.tx('K_p = \\lim_{s\\to0} G(s)')}.`,
      f: P => [{ k: 'kk', l: P.N ? 'K<sub>v</sub>' : 'K<sub>p</sub>' }],
      sol: P => ({ kk: P.K / P.p.filter(v => v !== 0).reduce((a, v) => a * v, 1) }),
      how: (P, A, S, h) => { const q = P.p.filter(v => v !== 0);
        return h.tx(`${P.N ? 'K_v' : 'K_p'} = \\dfrac{${h.n(P.K)}}{${q.map(v => h.n(v)).join('\\cdot')}} = ${h.n(S.kk)}`, true); } },
    { k: 'c', q: P => `Error en estado estacionario e(∞) ante ${P.N ? 'la rampa' : 'el escalón'}.`, f: [{ k: 'e', l: 'e(∞)' }],
      sol: (P, A) => ({ e: P.N ? 1 / A.kk : 1 / (1 + A.kk) }),
      how: (P, A, S, h) => h.tx(P.N ? `e(\\infty) = \\dfrac{1}{K_v} = \\dfrac{1}{${h.n(A.kk)}} = ${h.n(S.e)}` : `e(\\infty) = \\dfrac{1}{1+K_p} = \\dfrac{1}{1+${h.n(A.kk)}} = ${h.n(S.e)}`, true) }
  ]
};

/* ------------------------------------------------------------------ polinomios (mayor a menor) */
const ptrim = c => { let i = 0; while (i < c.length - 1 && Math.abs(c[i]) < 1e-12) i++; return c.slice(i); };
const padd = (a, b) => { const n = Math.max(a.length, b.length), A = Array(n - a.length).fill(0).concat(a), B = Array(n - b.length).fill(0).concat(b); return ptrim(A.map((v, i) => v + B[i])); };
const pmul = (a, b) => { const o = Array(a.length + b.length - 1).fill(0); a.forEach((x, i) => b.forEach((y, j) => { o[i + j] += x * y; })); return o; };
const pder = c => c.length < 2 ? [0] : c.slice(0, -1).map((v, i) => v * (c.length - 1 - i));
const pscale = (c, k) => c.map(v => v * k);
/* raíces (Durand–Kerner + limpieza): [{re, im}] */
function roots(c){
  c = ptrim(c); const n = c.length - 1; if (n < 1) return [];
  const a = c.map(v => v / c[0]), R0 = 1 + Math.max(...a.slice(1).map(Math.abs));
  let z = Array.from({ length: n }, (_, i) => ({ re: R0 * Math.cos(2 * Math.PI * i / n + 0.4), im: R0 * Math.sin(2 * Math.PI * i / n + 0.4) }));
  const ev = w => a.reduce((s, v) => ({ re: s.re * w.re - s.im * w.im + v, im: s.re * w.im + s.im * w.re }), { re: 0, im: 0 });
  for (let it = 0; it < 800; it++) {
    let mv = 0;
    z = z.map((w, i) => { const p = ev(w); let d = { re: 1, im: 0 };
      z.forEach((u, j) => { if (j !== i) { const dr = w.re - u.re, di = w.im - u.im; d = { re: d.re * dr - d.im * di, im: d.re * di + d.im * dr }; } });
      const m = d.re * d.re + d.im * d.im || 1e-30, q = { re: (p.re * d.re + p.im * d.im) / m, im: (p.im * d.re - p.re * d.im) / m };
      mv = Math.max(mv, Math.hypot(q.re, q.im)); return { re: w.re - q.re, im: w.im - q.im }; });
    if (mv < 1e-13) break;
  }
  return z.map(w => Math.abs(w.im) < 1e-7 * Math.max(1, Math.abs(w.re)) ? { re: w.re, im: 0 } : w).sort((u, v) => v.re - u.re || v.im - u.im);
}
/* polinomio en TeX: [1, 12, 44, 48] → s^3 + 12s^2 + 44s + 48 */
function polyTeX(c, h){
  const n = c.length - 1; let s = '';
  c.forEach((v, i) => { const e = n - i; if (Math.abs(v) < 1e-12) return;
    const a = Math.abs(v), co = e && Math.abs(a - 1) < 1e-12 ? '' : h.n(a), pw = e === 0 ? '' : e === 1 ? 's' : `s^{${e}}`;
    s += (s ? (v < 0 ? ' - ' : ' + ') : (v < 0 ? '-' : '')) + co + pw; });
  return s || '0';
}
/* ¿el punto σ del eje real está en el LGDR (K > 0)? impar de polos + ceros reales a su derecha */
const onLocus = (x, P) => P.p.concat(P.z).filter(v => -v > x + 1e-9).length % 2 === 1;

/* ------------------------------------------------------------------ tema 1 · plano s (etapa 2: respuestas en el plano) */
const plano = {
  id: 'plano', tema: 1, t: 'Polos, ceros y lazo cerrado en el plano s', d: 'Ubica en el plano: polos y ceros, ruptura y polos de T(s).',
  gen(r, tarea){
    let P;
    for (let g = 0; g < 120; g++) {
      P = plant(r, tarea, { zero0: true });
      if (!tarea && r() < 0.4) { let z; do { z = r.int(1, 10); } while (P.p.includes(z)); P.z = [z]; }
      P.N = P.p.filter(v => v === 0).length;
      P.D = polyOf(P.p); P.Nu = polyOf(P.z);
      /* N·D′ − N′·D = 0 → candidatos; solo los que caen en un tramo del LGDR */
      P.R = padd(pmul(P.Nu, pder(P.D)), pscale(pmul(pder(P.Nu), P.D), -1));
      P.rb = roots(P.R).filter(w => !w.im && onLocus(w.re, P)).map(w => w.re);
      P.K = tarea ? 45.53 : r.step(4, 160, 0.5);
      P.ch = padd(P.D, pscale(P.Nu, P.K));
      P.cl = roots(P.ch);
      if (tarea) break;
      const cx = P.cl.filter(w => w.im), stable = P.cl.every(w => w.re < -0.1);
      /* variante legible: hay ruptura, lazo cerrado estable con un par complejo que no se confunda con el eje real */
      if (P.rb.length && stable && cx.length && cx.every(w => Math.abs(w.im) >= 0.8 && Math.abs(w.im) <= 6.5)) break;
    }
    const xs = [0].concat(P.p.map(v => -v), P.z.map(v => -v), P.cl.map(w => w.re), P.rb), ys = P.cl.map(w => Math.abs(w.im));
    let x0 = Math.floor(Math.min(...xs)) - 1, x1 = Math.max(1, Math.ceil(Math.max(...xs)) + 1);
    if (x1 - x0 < 7) x0 = x1 - 7;
    const ym = Math.max(2, Math.ceil(Math.max(0, ...ys)) + 1, Math.ceil((x1 - x0) * 0.3));
    P.view = { x0, x1, y0: -ym, y1: ym };
    return P;
  },
  enun: (P, h) => `<p>Para el sistema con realimentación unitaria</p>${h.tx(GTeX(P), true)}<p>responde <b>ubicando en el plano s</b>: toca para poner un elemento, arrástralo para moverlo y usa las casillas Re/Im para afinarlo. El <b>imán</b> lo pega a la cuadrícula y al eje real (apágalo si quieres moverlo libre). Se acepta el punto dentro de un pequeño círculo de tolerancia alrededor del valor correcto.</p>`,
  inc: [
    { k: 'a', q: (P, h) => `Ubica los <b>polos (×)</b> y los <b>ceros (○)</b> finitos de ${h.tx('G(s)')} en lazo abierto.`,
      f: [{ k: 'pz', l: 'Polos y ceros de G(s)', plane: true, marks: ['x', 'o'], snap: 0.5, abs: 0.2, tol: 0.02, max: 8 }],
      sol: P => ({ pz: P.p.map(v => ({ t: 'x', re: -v, im: 0 })).concat(P.z.map(v => ({ t: 'o', re: -v, im: 0 }))) }),
      how: (P, A, S, h) => `<p><b>Polos:</b> raíces del denominador, ${h.tx(`${den(P.p)} = 0`)} → ${h.tx(P.p.map(v => `s = ${h.n(-v)}`).join(',\\; '))}.</p><p><b>Ceros:</b> ${P.z.length ? `raíces del numerador, ${h.tx(`${P.z.map(fac).join('')} = 0`)} → ${h.tx(P.z.map(v => `s = ${h.n(-v)}`).join(',\\; '))}.` : `el numerador es solo K, así que <b>no hay ceros finitos</b> (los ${P.p.length} ceros están en el infinito, por eso hay ${P.p.length} asíntotas).`}</p>` },
    { k: 'b', q: () => 'Tipo del sistema (número de polos en s = 0).', f: [{ k: 'N', l: 'Tipo', abs: 0.01 }],
      sol: P => ({ N: P.N }),
      how: (P, A, S, h) => `<p>${P.N ? 'Hay un polo en el origen (un integrador)' : 'Ningún polo está en el origen'}: tipo ${S.N}. ${P.N ? 'Error finito a la rampa y cero al escalón.' : 'Error finito al escalón.'}</p>` },
    { k: 'c', q: (P, h) => `Marca sobre el eje real ${P.rb.length > 1 ? 'los puntos' : 'el punto'} de <b>ruptura o de llegada</b> del LGDR (•). Pista: ${h.tx("\\tfrac{dK}{d\\sigma} = 0 \\iff N D' - N' D = 0")}, y solo valen las raíces que caen en un tramo del LGDR.`,
      tools: P => [{ app: 'eqn', n: Math.max(2, Math.min(4, P.R.length - 1)) }],
      f: P => [{ k: 'rb', l: 'Ruptura', plane: true, marks: ['.'], real: true, snap: 0.25, abs: 0.15, tol: 0.02, max: 4, view: Object.assign({}, P.view, { y0: -1.5, y1: 1.5 }) }],
      sol: P => ({ rb: P.rb.map(x => ({ t: '.', re: x, im: 0 })) }),
      how: (P, A, S, h) => { const all = roots(P.R).filter(w => !w.im).map(w => w.re);
        return `<p>Con ${h.tx(`N(s) = ${polyTeX(P.Nu, h)}`)} y ${h.tx(`D(s) = ${polyTeX(P.D, h)}`)}:</p>${h.tx(`N D' - N' D = ${polyTeX(P.R, h)} = 0`, true)}<p>Raíces reales: ${all.map(x => `${h.tx(`\\sigma = ${h.n(x)}`)} ${onLocus(x, P) ? '<b>✓ está en el LGDR</b>' : '✗ no está en el LGDR (a su derecha hay un número par de polos y ceros)'}`).join(' · ') || 'ninguna'}.</p><p>En la calculadora: Ecuación › Polinómica con los coeficientes ${P.R.map(v => h.f(v)).join(', ')}.</p>`; } },
    { k: 'd', q: (P, h) => `Con ${h.tx(`K = ${h.n(P.K)}`)}, ubica los <b>polos en lazo cerrado</b> (×), es decir, las raíces de ${h.tx('D(s) + K\\,N(s) = 0')}. Los complejos se ponen en par conjugado: basta con ubicar uno. Usa la calculadora: <i>Ecuación › Polinómica</i>.`,
      tools: P => [{ app: 'eqn', n: Math.max(2, Math.min(4, P.ch.length - 1)) }],
      f: [{ k: 'cl', l: 'Polos de T(s)', plane: true, marks: ['x'], sym: true, snap: 0.25, abs: 0.15, tol: 0.02, max: 6 }],
      sol: P => ({ cl: P.cl.map(w => ({ t: 'x', re: w.re, im: w.im })) }),
      how: (P, A, S, h) => `${h.tx(`\\begin{aligned}&D(s) + ${h.n(P.K)}\\,N(s) \\\\ &= ${polyTeX(P.ch, h)} = 0\\end{aligned}`, true)}<p>Raíces: ${h.tx(P.cl.filter(w => w.im >= 0).map(w => w.im ? `s = ${h.n(w.re)} \\pm j${h.n(w.im)}` : `s = ${h.n(w.re)}`).join(',\\; '))}.</p><p>En la calculadora: Ecuación › Polinómica, grado ${P.ch.length - 1}, coeficientes ${P.ch.map(v => h.f(v)).join(', ')}.${P.cl.some(w => w.im) ? ' Activa «Raíces complejas» en TOOLS si no las muestra.' : ''}</p>` }
  ]
};

/* =====================================================================================================
   Etapa 4 · temas 1–12 con el piloto de la P1 (caso de la tarea y variantes)
   ===================================================================================================== */
const DEG = 180 / Math.PI;
const n4 = v => { const s = String(+(+v).toFixed(4)); return s === '-0' ? '0' : s; };
const peval = (c, x) => c.reduce((a, v) => a * x + v, 0);
const wrap = a => ((a % 360) + 540) % 360 - 180;                      // → [−180, 180)
const argD = (s, p) => Math.atan2(s.im, s.re + p) * DEG;              // ∠(s + p) en grados
const dist = (s, p) => Math.hypot(s.re + p, s.im);                    // |s + p|
const angG = (P, s) => P.z.reduce((a, z) => a + argD(s, z), 0) - P.p.reduce((a, p) => a + argD(s, p), 0);
const magK = (P, s) => P.p.reduce((a, p) => a * dist(s, p), 1) / P.z.reduce((a, z) => a * dist(s, z), 1);
const zetaOf = os => { const L = Math.log(os / 100); return -L / Math.sqrt(Math.PI ** 2 + L * L); };
/* (s₀ + a) en texto para las etiquetas de las casillas */
const sfac = a => (Math.abs(a) < 1e-12 ? 's₀' : `(s₀ + ${a})`);
const sfacT = a => (Math.abs(a) < 1e-12 ? 's_0' : `(s_0 + ${a})`);
/* agrega a veces un cero entero (sin repetir un polo) */
function addZero(r, P, prob, lo, hi){
  if (r() < prob) { let z; do { z = r.int(lo || 1, hi || 12); } while (P.p.includes(z)); P.z = [z]; }
  return P;
}
/* tramos del eje real que pertenecen al LGDR (K > 0): puntos críticos de derecha a izquierda; [der, izq] (izq = −∞ si es el último) */
function segments(P){
  const c = P.p.map(v => -v).concat(P.z.map(v => -v)).sort((a, b) => b - a), out = [];
  for (let i = 0; i < c.length; i += 2) out.push([c[i], i + 1 < c.length ? c[i + 1] : -Infinity]);
  return out;
}
/* punto de la recta de ζ que cumple la condición de ángulo (el primero desde el origen, como el diseño de la P1) */
function design(P, z){
  const tn = Math.tan(Math.acos(z)), f = sg => wrap(angG(P, { re: -sg, im: sg * tn }) + 180);
  let a = 0.005, fa = f(a);
  for (let sg = 0.01; sg <= 40; sg += 0.01) {
    const fb = f(sg);
    if (Math.sign(fb) !== Math.sign(fa) && Math.abs(fa) < 90 && Math.abs(fb) < 90) {
      let lo = a, hi = sg, flo = fa;
      for (let i = 0; i < 60; i++) { const m = (lo + hi) / 2, fm = f(m); if (Math.sign(fm) === Math.sign(flo)) { lo = m; flo = fm; } else hi = m; }
      const sgm = (lo + hi) / 2; return { sg: sgm, wd: sgm * tn };
    }
    a = sg; fa = fb;
  }
  return null;
}
/* raíces reales de un polinomio, de derecha a izquierda */
const realRoots = c => roots(c).filter(w => !w.im).map(w => w.re).sort((a, b) => b - a);
/* coeficientes de la mayor potencia a la menor como casillas: s³, s², s, 1 */
const SUP = ['⁰', '¹', '²', '³', '⁴', '⁵'];
const powLbl = (pre, e) => e === 0 ? `${pre}<sub>0</sub>` : `${pre}<sub>${e}</sub>`;
/* figura del plano s (solo para ver): polos ×, ceros ○, punto de prueba • y los vectores desde cada polo y cero */
function figS(view, o){
  const W = 380, k = W / (view.x1 - view.x0), H = Math.round((view.y1 - view.y0) * k);
  const X = x => ((x - view.x0) * k).toFixed(1), Y = y => ((view.y1 - y) * k).toFixed(1);
  let st = 1; for (const s of [0.5, 1, 2, 5, 10]) { if (s * k >= 26) { st = s; break; } st = s; }
  let g = '', t = '';
  for (let x = Math.ceil(view.x0 / st) * st; x <= view.x1 + 1e-9; x += st) { g += `M${X(x)} 0V${H}`; if (Math.abs(x) > 1e-9 && Math.abs(x / st) % (k * st < 34 ? 2 : 1) < 1e-9) t += `<text x="${X(x)}" y="${Math.min(H - 3, +Y(0) + 13)}" text-anchor="middle">${n4(x).replace('-', '−')}</text>`; }
  for (let y = Math.ceil(view.y0 / st) * st; y <= view.y1 + 1e-9; y += st) g += `M0 ${Y(y)}H${W}`;
  let s = `<path class="fg-g" d="${g}"/><path class="fg-ax" d="M0 ${Y(0)}H${W}M${X(0)} 0V${H}"/><g class="fg-tk">${t}</g>`;
  const pts = (o.p || []).map(v => ({ t: 'x', re: -v })).concat((o.z || []).map(v => ({ t: 'o', re: -v })));
  if (o.s0 && o.vec) pts.forEach((q, i) => {
    s += `<path class="fg-v" d="M${X(q.re)} ${Y(0)}L${X(o.s0.re)} ${Y(o.s0.im)}"/>`;
    if (o.lab) s += `<text class="fg-l" x="${(+X(q.re) + 6).toFixed(1)}" y="${(+Y(0) - 5).toFixed(1)}">${o.lab[i] || ''}</text>`;
  });
  pts.forEach(q => { const x = +X(q.re), y = +Y(0), r = 5;
    s += q.t === 'x' ? `<path class="fg-p" d="M${x - r} ${y - r}L${x + r} ${y + r}M${x - r} ${y + r}L${x + r} ${y - r}"/>` : `<circle class="fg-z" cx="${x}" cy="${y}" r="${r + 0.5}"/>`; });
  if (o.s0) { s += `<circle class="fg-s" cx="${X(o.s0.re)}" cy="${Y(o.s0.im)}" r="4.5"/><text class="fg-sl" x="${(+X(o.s0.re) + 8).toFixed(1)}" y="${(+Y(o.s0.im) - 6).toFixed(1)}">${o.sl || 's₀'}</text>`;
    if (o.conj) s += `<circle class="fg-s c" cx="${X(o.s0.re)}" cy="${Y(-o.s0.im)}" r="3.5"/>`; }
  return `<figure class="en-fig"><svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${o.alt || 'Plano s'}">${s}</svg>${o.cap ? `<figcaption>${o.cap}</figcaption>` : ''}</figure>`;
}
/* vista que contiene polos, ceros y el punto s₀ */
function viewFor(P, s0){
  const xs = [0].concat(P.p.map(v => -v), P.z.map(v => -v), s0 ? [s0.re] : []);
  const x0 = Math.floor(Math.min(...xs)) - 1, x1 = 1, y1 = Math.max(2, s0 ? Math.ceil(s0.im) + 1 : 2);
  return { x0, x1, y0: -0.9, y1 };
}
/* planta de 3 polos con un punto de diseño sobre la recta de ζ (variantes de los temas 8, 9 y 11) */
function plantDesign(r, tarea, opt){
  if (tarea) return { p: [2, 4, 6], z: [], os: 10, z_: zetaOf(10), s0: { re: -2.0285, im: 2.7677 } };
  for (let g = 0; g < 200; g++) {
    const P = plant(r, false, { zero0: true });
    if (opt && opt.zero) addZero(r, P, opt.zero, 1, 12);
    P.os = r.int(opt && opt.os ? opt.os[0] : 5, opt && opt.os ? opt.os[1] : 15);
    P.z_ = zetaOf(P.os);
    const d = design(P, P.z_);
    if (!d || d.wd < 0.6 || d.wd > 9 || d.sg < 0.3) continue;
    P.d = d; P.s0 = { re: -+d.sg.toFixed(4), im: +d.wd.toFixed(4) };
    return P;
  }
  return { p: [2, 4, 6], z: [], os: 10, z_: zetaOf(10), s0: { re: -2.0285, im: 2.7677 } };
}

/* ------------------------------------------------------------------ tema 1 · polos y ceros de un denominador expandido */
const polos = {
  id: 'polos', tema: 1, t: 'Polos, ceros y tipo', d: 'Raíces del denominador en el plano s, n, m, tipo y ramas.',
  gen(r, tarea){
    const P = plant(r, tarea, { zero0: true });
    if (!tarea) addZero(r, P, 0.5, 1, 10);
    P.D = polyOf(P.p); P.Nu = polyOf(P.z); P.N = P.p.filter(v => v === 0).length;
    const xs = [0].concat(P.p.map(v => -v), P.z.map(v => -v));
    P.view = { x0: Math.min(-7, Math.floor(Math.min(...xs)) - 1), x1: 1.5, y0: -2.5, y1: 2.5 };
    return P;
  },
  enun: (P, h) => `<p>Un sistema con realimentación unitaria tiene la planta</p>${h.tx(`G(s) = \\dfrac{K${P.z.length ? `(${polyTeX(P.Nu, h)})` : ''}}{${polyTeX(P.D, h)}}`, true)}<p>El denominador está multiplicado: para ubicar los polos hay que sacar sus raíces (la calculadora lo hace con <i>Ecuación › Polinómica</i>).</p>`,
  inc: [
    { k: 'a', q: (P, h) => `Ubica en el plano s los <b>polos (×)</b> y los <b>ceros (○)</b> finitos de ${h.tx('G(s)')}.`,
      tools: P => [{ app: 'eqn', n: P.D.length - 1 }],
      f: [{ k: 'pz', l: 'Polos y ceros de G(s)', plane: true, marks: ['x', 'o'], snap: 0.5, abs: 0.2, tol: 0.02, max: 8 }],
      sol: P => ({ pz: P.p.map(v => ({ t: 'x', re: -v, im: 0 })).concat(P.z.map(v => ({ t: 'o', re: -v, im: 0 }))) }),
      how: (P, A, S, h) => `<p><b>Polos:</b> raíces de ${h.tx(`${polyTeX(P.D, h)} = 0`)}. En la calculadora: Ecuación › Polinómica, grado ${P.D.length - 1}, coeficientes ${P.D.map(v => h.f(v)).join(', ')}${P.N ? ' (el último es 0: hay un polo en el origen, se puede sacar s de factor común)' : ''} → ${h.tx(P.p.map(v => `s = ${h.n(-v)}`).join(',\\; '))}.</p><p>Así ${h.tx(`${polyTeX(P.D, h)} = ${den(P.p)}`)}.</p><p><b>Ceros:</b> ${P.z.length ? `${h.tx(`${polyTeX(P.Nu, h)} = 0`)} → ${h.tx(`s = ${h.n(-P.z[0])}`)}.` : 'el numerador es solo K: <b>no hay ceros finitos</b>.'}</p>` },
    { k: 'b', q: () => '¿Cuántos polos finitos (n) y cuántos ceros finitos (m) tiene G(s)?',
      f: [{ k: 'n', l: 'n', abs: 0.01 }, { k: 'm', l: 'm', abs: 0.01 }],
      sol: P => ({ n: P.p.length, m: P.z.length }),
      how: (P, A, S, h) => `<p>n = grado del denominador = ${S.n}; m = grado del numerador = ${S.m}.</p>` },
    { k: 'c', q: () => 'Tipo del sistema (polos en s = 0).', f: [{ k: 'N', l: 'Tipo', abs: 0.01 }],
      sol: P => ({ N: P.N }),
      how: (P, A, S, h) => `<p>${P.N ? `El término independiente del denominador es 0, así que ${h.tx('s = 0')} es raíz: un integrador, tipo 1.` : `El término independiente (${h.f(P.D[P.D.length - 1])}) no es 0: ningún polo en el origen, tipo 0.`}</p>` },
    { k: 'd', q: () => '¿Cuántas ramas tiene el LGDR y cuántas se van al infinito?',
      f: [{ k: 'ra', l: 'Ramas', abs: 0.01 }, { k: 'ri', l: 'Al infinito', abs: 0.01 }],
      sol: (P, A) => { const n = A.n != null ? A.n : P.p.length, m = A.m != null ? A.m : P.z.length; return { ra: Math.max(n, m), ri: Math.abs(n - m) }; },
      how: (P, A, S, h) => `<p>Hay una rama por cada polo en lazo cerrado: ${h.tx(`\\max(n, m) = ${h.n(S.ra)}`)}. Empiezan en los polos de lazo abierto (K = 0) y terminan en los ceros; las que no encuentran un cero finito se van al infinito por las asíntotas: ${h.tx(`n - m = ${h.n(S.ri)}`)}.</p>` }
  ]
};

/* ------------------------------------------------------------------ tema 2 · ecuación característica */
const ecuacion = {
  id: 'ecuacion', tema: 2, t: 'Ecuación característica y T(s)', d: 'Expandir D(s), sumar K·N(s), ganancia en CD y K para un polo dado.',
  gen(r, tarea){
    const P = plant(r, tarea, { zero0: true });
    if (!tarea) addZero(r, P, 0.4, 1, 10);
    P.D = polyOf(P.p); P.Nu = polyOf(P.z);
    P.K = tarea ? 45.53 : r.step(5, 150, 0.5);
    if (tarea) P.sg = -7.943;
    else { const sg = segments(P), sgm = r.pick(sg);
      P.sg = sgm[1] === -Infinity ? sgm[0] - r.int(1, 3) : (sgm[0] + sgm[1]) / 2; }
    return P;
  },
  enun: (P, h) => `<p>Con realimentación unitaria y</p>${h.tx(GTeX(P), true)}<p>arma la ecuación característica ${h.tx('1 + G(s) = 0')}, que multiplicada por el denominador queda ${h.tx('D(s) + K\\,N(s) = 0')}.</p>`,
  inc: [
    { k: 'a', q: (P, h) => `Multiplica el denominador: ${h.tx('D(s) = ' + den(P.p) + ' = s^3 + a_2 s^2 + a_1 s + a_0')}. ¿Cuánto valen a<sub>2</sub>, a<sub>1</sub> y a<sub>0</sub>?`,
      f: [{ k: 'a2', l: 'a<sub>2</sub>' }, { k: 'a1', l: 'a<sub>1</sub>' }, { k: 'a0', l: 'a<sub>0</sub>' }],
      sol: P => ({ a2: P.D[1], a1: P.D[2], a0: P.D[3] }),
      how: (P, A, S, h) => `<p>Multiplica dos factores y luego el tercero:</p>${h.tx(`\\begin{aligned}${den(P.p.slice(0, 2))} &= ${polyTeX(polyOf(P.p.slice(0, 2)), h)} \\\\ (${polyTeX(polyOf(P.p.slice(0, 2)), h)})${fac(P.p[2])} &= ${polyTeX(P.D, h)}\\end{aligned}`, true)}<p>Atajo: ${h.tx('a_2')} = suma de las raíces cambiada de signo (${h.f(S.a2)}), ${h.tx('a_1')} = suma de los productos de dos en dos, ${h.tx('a_0')} = producto (${h.f(S.a0)}).</p>` },
    { k: 'b', q: (P, h) => `Con ${h.tx(`K = ${h.n(P.K)}`)}, escribe la ecuación característica ${h.tx('s^3 + b_2 s^2 + b_1 s + b_0 = 0')}.`,
      f: [{ k: 'b2', l: 'b<sub>2</sub>' }, { k: 'b1', l: 'b<sub>1</sub>' }, { k: 'b0', l: 'b<sub>0</sub>' }],
      sol: (P, A) => { const z = P.z.length ? P.z[0] : 0, one = P.z.length ? 1 : 0;
        return { b2: A.a2, b1: A.a1 + P.K * one, b0: A.a0 + P.K * (P.z.length ? z : 1) }; },
      how: (P, A, S, h) => `${h.tx(`\\begin{aligned}&D(s) + K\\,N(s) \\\\ &= (s^3 + ${h.n(A.a2)}s^2 + ${h.n(A.a1)}s + ${h.n(A.a0)}) + ${h.n(P.K)}${P.z.length ? fac(P.z[0]) : ''} \\\\ &= s^3 + ${h.n(S.b2)}s^2 + ${h.n(S.b1)}s + ${h.n(S.b0)}\\end{aligned}`, true)}<p>${P.z.length ? 'Como hay un cero, K multiplica también a s: cambia b₁ y b₀.' : 'Como N(s) = 1, la K solo se suma al término independiente.'}</p>` },
    { k: 'c', q: (P, h) => `Ganancia en estado estacionario de lazo cerrado ${h.tx('T(0)')}, con ${h.tx('T(s) = \\dfrac{K\\,N(s)}{D(s) + K\\,N(s)}')}.`,
      f: [{ k: 't0', l: 'T(0)' }],
      sol: (P, A) => ({ t0: P.K * peval(P.Nu, 0) / A.b0 }),
      how: (P, A, S, h) => `${h.tx(`T(0) = \\dfrac{${h.n(P.K)}\\cdot${h.n(peval(P.Nu, 0))}}{${h.n(A.b0)}} = ${h.n(S.t0)}`, true)}<p>${Math.abs(S.t0 - 1) < 1e-6 ? 'Vale 1 porque hay un integrador: el error al escalón es 0.' : `Error al escalón: ${h.tx(`1 - T(0) = ${h.n(1 - S.t0)}`)} (es el mismo ${h.tx('1/(1+K_p)')} del tema 12).`}</p>` },
    { k: 'd', q: (P, h) => `¿Con qué K queda un polo de lazo cerrado exactamente en ${h.tx(`s = ${n4(P.sg)}`)}? Pista: si ${h.tx('s')} es raíz, ${h.tx('D(s) + K\\,N(s) = 0 \\Rightarrow K = -D(s)/N(s)')}.`,
      f: [{ k: 'K', l: 'K' }],
      sol: (P, A) => { const x = P.sg, D = x ** 3 + A.a2 * x * x + A.a1 * x + A.a0; return { K: -D / peval(P.Nu, x) }; },
      how: (P, A, S, h) => { const x = P.sg, D = x ** 3 + A.a2 * x * x + A.a1 * x + A.a0;
        return `${h.tx(`\\begin{aligned}D(${n4(x)}) &= ${P.p.map(v => `(${n4(x + v)})`).join('')} = ${h.n(D)} \\\\ K &= -\\dfrac{D(${n4(x)})}{N(${n4(x)})} = -\\dfrac{${h.n(D)}}{${h.n(peval(P.Nu, x))}} = ${h.n(S.K)}\\end{aligned}`, true)}<p>${h.tx('K > 0')}: el punto sí está en el LGDR.${Math.abs(x + 7.943) < 1e-9 ? ' Es el tercer polo de la P1: con K = 45.53 el polo real queda en −7.943.' : ''}</p>`; } }
  ]
};

/* ------------------------------------------------------------------ tema 3 · LGDR sobre el eje real */
const ejereal = {
  id: 'ejereal', tema: 3, t: 'Tramos del LGDR sobre el eje real', d: 'Extremos de cada tramo y prueba de un punto.',
  gen(r, tarea){
    const P = plant(r, tarea, { zero0: true });
    if (!tarea) addZero(r, P, 0.5, 1, 11);
    P.S = segments(P);
    const c = P.p.map(v => -v).concat(P.z.map(v => -v)), lo = Math.min(...c) - 2;
    if (tarea) P.t = -5;
    else { let t; do { t = r.step(lo, -0.5, 0.5); } while (c.some(v => Math.abs(v - t) < 1e-9)); P.t = t; }
    return P;
  },
  enun: (P, h) => `<p>Para el sistema con realimentación unitaria</p>${h.tx(GTeX(P), true)}<p>(con ${h.tx('K > 0')}) encuentra qué partes del eje real pertenecen al lugar geométrico de las raíces. Regla: un punto del eje real está en el LGDR si a su <b>derecha</b> hay un número <b>impar</b> de polos y ceros reales.</p>${figS({ x0: Math.min(...P.p.map(v => -v), ...P.z.map(v => -v), P.t) - 1.5, x1: 1, y0: -1, y1: 1.2 }, { p: P.p, z: P.z, s0: { re: P.t, im: 0 }, sl: `σ = ${n4(P.t).replace('-', '−')}`, alt: 'Polos y ceros sobre el eje real y el punto de prueba' })}`,
  inc: [
    { k: 'a', q: P => `Escribe los tramos del eje real que pertenecen al LGDR, de derecha a izquierda (cada extremo es un polo o un cero).${P.S.some(s => s[1] === -Infinity) ? ' El último tramo se va a −∞: escribe solo dónde empieza.' : ''}`,
      f: P => P.S.flatMap((s, j) => s[1] === -Infinity ? [{ k: 'inf', l: 'Tramo a −∞ empieza en σ =', abs: 0.02 }]
        : [{ k: 'd' + j, l: `Tramo ${j + 1}: de σ =`, abs: 0.02 }, { k: 'i' + j, l: 'a σ =', abs: 0.02 }]),
      sol: P => { const o = {}; P.S.forEach((s, j) => { if (s[1] === -Infinity) o.inf = s[0]; else { o['d' + j] = s[0]; o['i' + j] = s[1]; } }); return o; },
      how: (P, A, S, h) => `<p>Polos y ceros reales de derecha a izquierda: ${P.p.map(v => -v).concat(P.z.map(v => -v)).sort((a, b) => b - a).map(v => h.f(v)).join(', ')}. Se toman de dos en dos: del 1.º al 2.º, del 3.º al 4.º…; si sobra uno, de ahí a −∞.</p><p>${P.S.map(s => h.tx(s[1] === -Infinity ? `(-\\infty,\\; ${h.n(s[0])}]` : `[${h.n(s[1])},\\; ${h.n(s[0])}]`)).join(' y ')}</p>` },
    { k: 'b', q: (P, h) => `Punto de prueba ${h.tx(`\\sigma = ${h.n(P.t)}`)}: ¿cuántos polos y ceros reales hay a su derecha?`,
      f: [{ k: 'nr', l: 'Cuántos', abs: 0.01 }],
      sol: P => ({ nr: P.p.map(v => -v).concat(P.z.map(v => -v)).filter(v => v > P.t).length }),
      how: (P, A, S, h) => `<p>A la derecha de ${h.f(P.t)}: ${P.p.map(v => -v).concat(P.z.map(v => -v)).filter(v => v > P.t).sort((a, b) => b - a).map(v => h.f(v)).join(', ') || 'ninguno'} → ${S.nr}.</p><p>(Los polos y ceros complejos no cuentan: sus ángulos se cancelan por pares.)</p>` },
    { k: 'c', q: (P, h) => `¿El punto ${h.tx(`\\sigma = ${h.n(P.t)}`)} está en el LGDR?`,
      f: [{ k: 'on', l: 'Respuesta', ch: [{ v: 1, l: 'Sí' }, { v: 0, l: 'No' }] }],
      sol: (P, A) => ({ on: Math.round(A.nr) % 2 === 1 ? 1 : 0 }),
      how: (P, A, S, h) => `<p>${h.f(A.nr)} es ${S.on ? '<b>impar</b>: la suma de ángulos da 180°, <b>sí</b> está' : '<b>par</b>: la suma de ángulos da 0° (o 360°), <b>no</b> está'} en el LGDR.</p>` }
  ]
};

/* ------------------------------------------------------------------ tema 5 · punto de ruptura */
const ruptura = {
  id: 'ruptura', tema: 5, t: 'Punto de ruptura y su ganancia', d: 'N·D′ − N′·D, sus raíces en el LGDR y K en la ruptura.',
  gen(r, tarea){
    let P;
    for (let g = 0; g < 100; g++) {
      P = plant(r, tarea, { zero0: true });
      if (!tarea) addZero(r, P, 0.4, 1, 10);
      P.D = polyOf(P.p); P.Nu = polyOf(P.z);
      P.R = padd(pmul(P.Nu, pder(P.D)), pscale(pmul(pder(P.Nu), P.D), -1));
      const all = roots(P.R);
      P.rb = all.filter(w => !w.im && onLocus(w.re, P)).map(w => w.re).sort((a, b) => b - a);
      if (tarea) break;
      if (P.rb.length && P.rb.length <= 2 && P.rb.every(x => P.p.concat(P.z).every(v => Math.abs(x + v) > 0.15))) break;
    }
    return P;
  },
  enun: (P, h) => `<p>Para</p>${h.tx(GTeX(P), true)}<p>escribe ${h.tx('G(s) = K\\,\\dfrac{N(s)}{D(s)}')} con ${h.tx(`N(s) = ${polyTeX(P.Nu, h)}`)} y ${h.tx(`D(s) = ${polyTeX(P.D, h)}`)}. Sobre el eje real, ${h.tx('K(\\sigma) = -D(\\sigma)/N(\\sigma)')}; en la ruptura (o llegada) esa K tiene un máximo (o mínimo): ${h.tx("\\tfrac{dK}{d\\sigma} = 0 \\iff N D' - N' D = 0")}.</p>`,
  inc: [
    { k: 'a', q: (P, h) => `Calcula ${h.tx("N D' - N' D")} y escribe sus coeficientes, de la mayor potencia a la menor.`,
      f: P => P.R.map((_, i) => ({ k: 'r' + i, l: `s${SUP[P.R.length - 1 - i]}`, abs: 0.01 })),
      sol: P => { const o = {}; P.R.forEach((v, i) => { o['r' + i] = v; }); return o; },
      how: (P, A, S, h) => `${h.tx(P.z.length ? `\\begin{aligned}N D' - N' D &= (${polyTeX(P.Nu, h)})(${polyTeX(pder(P.D), h)}) - (1)(${polyTeX(P.D, h)}) \\\\ &= ${polyTeX(P.R, h)}\\end{aligned}` : `N = 1,\\; N' = 0 \\;\\Rightarrow\\; N D' - N' D = D'(s) = ${polyTeX(P.R, h)}`, true)}` },
    { k: 'b', q: (P, h) => `Raíces de ese polinomio que caen en un tramo del LGDR (de derecha a izquierda): ${P.rb.length > 1 ? 'son los puntos de ruptura/llegada' : 'es el punto de ruptura'} ${h.tx('\\sigma_b')}.`,
      tools: P => [{ app: 'eqn', n: P.R.length - 1 }],
      f: P => P.rb.map((_, i) => ({ k: 'sb' + i, l: P.rb.length > 1 ? `σ<sub>b${i + 1}</sub>` : 'σ<sub>b</sub>', abs: 0.01 })),
      sol: (P, A) => { const c = P.R.map((v, i) => A['r' + i] != null ? A['r' + i] : v), o = {};
        let rr = realRoots(c).filter(x => onLocus(x, P)); if (rr.length !== P.rb.length) rr = P.rb;
        rr.forEach((x, i) => { o['sb' + i] = x; }); return o; },
      how: (P, A, S, h) => { const c = P.R.map((v, i) => A['r' + i] != null ? A['r' + i] : v), all = realRoots(c);
        return `<p>Ecuación › Polinómica, grado ${c.length - 1}, coeficientes ${c.map(v => h.f(v)).join(', ')}. Raíces reales: ${all.map(x => `${h.tx(`${h.n(x)}`)} ${onLocus(x, P) ? '<b>✓ en el LGDR</b>' : '✗ no está en el LGDR (se descarta)'}`).join(' · ')}.</p>`; } },
    { k: 'c', q: (P, h) => `Ganancia en ${P.rb.length > 1 ? 'el primer punto' : 'el punto de ruptura'}: ${h.tx('K_b = \\left|D(\\sigma_b)/N(\\sigma_b)\\right|')}.`,
      f: [{ k: 'kb', l: 'K<sub>b</sub>' }],
      sol: (P, A) => { const x = A.sb0; return { kb: Math.abs(peval(P.D, x) / peval(P.Nu, x)) }; },
      how: (P, A, S, h) => { const x = A.sb0;
        return `${h.tx(`K_b = \\left|\\dfrac{${P.p.map(v => `(${n4(x + v)})`).join('')}}{${P.z.length ? `${n4(x + P.z[0])}` : '1'}}\\right| = ${h.n(S.kb)}`, true)}<p>Para ${h.tx(`K > ${h.n(S.kb)}`)} los dos polos que chocan en ${h.f(x)} salen del eje real y se vuelven complejos (aparece sobrepaso). La K de diseño tiene que ser mayor.</p>`; } }
  ]
};

/* ------------------------------------------------------------------ tema 8 · condición de ángulo */
const angulo = {
  id: 'angulo', tema: 8, t: 'Condición de ángulo', d: 'Ángulo desde cada polo y cero a s₀, suma y si s₀ está en el LGDR.',
  gen(r, tarea){
    let P = plantDesign(r, tarea, { zero: 0.3 });
    if (!tarea && r() < 0.5) {   /* punto fuera del LGDR: misma recta, otro σ */
      for (let g = 0; g < 30; g++) {
        const f = 1 + (r() < 0.5 ? -1 : 1) * r.step(0.15, 0.4, 0.05), sg = P.d.sg * f, s = { re: -+sg.toFixed(4), im: +(sg * Math.tan(Math.acos(P.z_))).toFixed(4) };
        if (Math.abs(wrap(angG(P, s) + 180)) >= 4) { P.s0 = s; break; }
      }
    }
    P.view = viewFor(P, P.s0);
    return P;
  },
  enun: (P, h) => `<p>Para</p>${h.tx(GTeX(P), true)}<p>se prueba el punto ${h.tx(`s_0 = ${n4(P.s0.re)} + j${n4(P.s0.im)}`)} (sobre la recta de ${h.tx(`\\zeta = ${h.n(P.z_)}`)}, ${P.os} % de sobrepaso). Cada ángulo se mide desde el polo o cero hasta ${h.tx('s_0')}, contra el eje real positivo: ${h.tx('\\angle(s_0 + a) = \\tan^{-1}\\dfrac{\\omega}{\\sigma_0 + a}')} (si el denominador es negativo, súmale 180°).</p>${figS(P.view, { p: P.p, z: P.z, s0: P.s0, vec: true, lab: P.p.map((_, i) => `θ${i + 1}`).concat(P.z.map(() => 'φ')), alt: 'Vectores desde los polos y ceros hasta s₀' })}`,
  inc: [
    { k: 'a', q: (P, h) => `Ángulo de cada vector (en grados). ${P.z.length ? 'Los de los polos restan y el del cero suma.' : ''}`,
      tools: () => [{ app: 'cplx' }],
      f: P => P.p.map((p, i) => ({ k: 'tp' + i, l: `θ${i + 1} = ∠${sfac(p)}`, u: '°', ang: true })).concat(P.z.map((z, i) => ({ k: 'tz' + i, l: `φ = ∠${sfac(z)}`, u: '°', ang: true }))),
      sol: P => { const o = {}; P.p.forEach((p, i) => { o['tp' + i] = argD(P.s0, p); }); P.z.forEach((z, i) => { o['tz' + i] = argD(P.s0, z); }); return o; },
      how: (P, A, S, h) => `${h.tx(`\\begin{aligned}${P.p.map((p, i) => `\\theta_${i + 1} &= \\angle${sfacT(p)} = \\angle(${n4(P.s0.re + p)} + j${n4(P.s0.im)}) = {${h.n(S['tp' + i])}}^\\circ`).concat(P.z.map((z, i) => `\\varphi &= \\angle${sfacT(z)} = \\angle(${n4(P.s0.re + z)} + j${n4(P.s0.im)}) = {${h.n(S['tz' + i])}}^\\circ`)).join(' \\\\ ')}\\end{aligned}`, true)}<p>En la calculadora (Complejos): <code>arg(${n4(P.s0.re + P.p[0])}+${n4(P.s0.im)}i)</code> en grados.</p>` },
    { k: 'b', q: (P, h) => `Ángulo total ${h.tx('\\angle G(s_0) = \\sum \\varphi_{\\text{ceros}} - \\sum \\theta_{\\text{polos}}')}.`,
      f: [{ k: 'g', l: '∠G(s₀)', u: '°', ang: true }],
      sol: (P, A) => ({ g: P.z.reduce((a, z, i) => a + A['tz' + i], 0) - P.p.reduce((a, p, i) => a + A['tp' + i], 0) }),
      how: (P, A, S, h) => h.tx(`\\angle G(s_0) = ${P.z.length ? P.z.map((z, i) => h.n(A['tz' + i])).join(' + ') : ''}${P.p.map((p, i) => ` - ${h.n(A['tp' + i])}`).join('')} = {${h.n(S.g)}}^\\circ`, true) },
    { k: 'c', q: (P, h) => `¿Cuánto le falta o le sobra para cumplir la condición? ${h.tx('\\Delta = \\angle G(s_0) - (-180^\\circ)')}, entre −180° y 180°.`,
      f: [{ k: 'dl', l: 'Δ', u: '°', ang: true, abs: 0.6 }],
      sol: (P, A) => ({ dl: wrap(A.g + 180) }),
      how: (P, A, S, h) => `${h.tx(`\\Delta = {${h.n(A.g)}}^\\circ + 180^\\circ = {${h.n(S.dl)}}^\\circ`, true)}<p>(Un ángulo y ese mismo más o menos 360° son el mismo: −180° = 180° = 540°.)</p>` },
    { k: 'd', q: (P, h) => `¿${h.tx('s_0')} está en el LGDR (es decir, hay una K > 0 que lo vuelve polo de lazo cerrado)?`,
      f: [{ k: 'on', l: 'Respuesta', ch: [{ v: 1, l: 'Sí' }, { v: 0, l: 'No' }] }],
      sol: (P, A) => ({ on: Math.abs(A.dl) <= 1.5 ? 1 : 0 }),
      how: (P, A, S, h) => `<p>${S.on ? `Δ ≈ 0: la suma da −180° (un múltiplo impar de 180°), así que <b>sí</b> está. Su K se saca con la condición de magnitud (tema 9).` : `Δ = ${h.f(A.dl)}°: no da −180°, así que <b>no</b> está. Hay que mover el punto sobre la recta (cambiar σ) hasta que Δ = 0: eso hace «Buscar s₀» en la P1.`}</p>${P.d ? `<p>Sobre esta recta, el punto del LGDR está en ${h.tx(`s = ${h.n(-P.d.sg)} + j${h.n(P.d.wd)}`)}.</p>` : ''}` }
  ]
};

/* ------------------------------------------------------------------ tema 9 · condición de magnitud */
const magnitud = {
  id: 'magnitud', tema: 9, t: 'Condición de magnitud (K)', d: 'Distancias a s₀, K de diseño y K en el cruce con jω.',
  gen(r, tarea){
    const P = plantDesign(r, tarea);
    P.c = polyOf(P.p); P.wc = Math.sqrt(P.c[2]); P.kc = P.c[1] * P.c[2] - P.c[3];
    P.view = viewFor(P, P.s0);
    return P;
  },
  enun: (P, h) => `<p>Para</p>${h.tx(GTeX(P), true)}<p>el punto ${h.tx(`s_0 = ${n4(P.s0.re)} + j${n4(P.s0.im)}`)} cumple la condición de ángulo (está en el LGDR, ${P.os} % de sobrepaso). La K que lo vuelve polo de lazo cerrado sale de ${h.tx('|K\\,G(s_0)| = 1')}:</p>${h.tx('K = \\dfrac{\\prod |s_0 + p_i|}{\\prod |s_0 + z_i|} = \\dfrac{\\text{producto de distancias a los polos}}{\\text{producto de distancias a los ceros}}', true)}${figS(P.view, { p: P.p, z: P.z, s0: P.s0, vec: true, lab: P.p.map((_, i) => `L${i + 1}`), alt: 'Distancias desde los polos hasta s₀' })}`,
  inc: [
    { k: 'a', q: () => 'Distancia (longitud del vector) desde cada polo hasta s₀.',
      tools: () => [{ app: 'cplx' }],
      f: P => P.p.map((p, i) => ({ k: 'l' + i, l: `L${i + 1} = |${sfac(p)}|` })),
      sol: P => { const o = {}; P.p.forEach((p, i) => { o['l' + i] = dist(P.s0, p); }); return o; },
      how: (P, A, S, h) => `${h.tx(`\\begin{aligned}${P.p.map((p, i) => `L_${i + 1} &= \\sqrt{(${n4(P.s0.re + p)})^2 + ${n4(P.s0.im)}^2} = ${h.n(S['l' + i])}`).join(' \\\\ ')}\\end{aligned}`, true)}<p>En la calculadora (Complejos): <code>Abs(${n4(P.s0.re + P.p[0])}+${n4(P.s0.im)}i)</code>.</p>` },
    { k: 'b', q: () => 'Ganancia K que pone un polo de lazo cerrado en s₀.', f: [{ k: 'K', l: 'K' }],
      sol: (P, A) => ({ K: P.p.reduce((a, p, i) => a * A['l' + i], 1) }),
      how: (P, A, S, h) => `${h.tx(`K = ${P.p.map((p, i) => h.n(A['l' + i])).join('\\cdot')} = ${h.n(S.K)}`, true)}<p>No hay ceros finitos, así que el denominador es 1.${Math.abs(S.K - 45.53) < 0.05 ? ' Es la K de la P1 (45.53).' : ''}</p>` },
    { k: 'c', q: (P, h) => `Con Routh, el LGDR cruza el eje ${h.tx('j\\omega')} en ${h.tx(`s = j${n4(P.wc)}`)}. Usa la misma condición de magnitud con ${h.tx(`s = j${n4(P.wc)}`)}: ¿qué K da ahí?`,
      f: [{ k: 'kc', l: 'K en el cruce' }],
      sol: P => ({ kc: P.p.reduce((a, p) => a * Math.hypot(p, P.wc), 1) }),
      how: (P, A, S, h) => `${h.tx(`K = ${P.p.map(p => p ? `\\sqrt{${p}^2 + ${n4(P.wc)}^2}` : n4(P.wc)).join('\\cdot')} = ${h.n(S.kc)}`, true)}<p>Coincide con la K crítica de Routh: ${h.tx(`a_2 a_1 - a_0 = ${h.n(P.c[1])}\\cdot${h.n(P.c[2])} - ${h.n(P.c[3])} = ${h.n(P.kc)}`)}.</p>` },
    { k: 'd', q: () => 'Con la K del inciso b), ¿el lazo cerrado es estable?',
      f: [{ k: 'st', l: 'Respuesta', ch: [{ v: 1, l: 'Sí' }, { v: 0, l: 'No' }] }],
      sol: (P, A) => ({ st: A.K > 0 && A.K < A.kc ? 1 : 0 }),
      how: (P, A, S, h) => `<p>${h.tx(`${h.n(A.K)} ${A.K < A.kc ? '<' : '>'} ${h.n(A.kc)}`)}: ${S.st ? '<b>sí</b>, está dentro del rango estable 0 < K < K<sub>crít</sub>' : '<b>no</b>, pasa la K crítica'}.</p>` }
  ]
};

/* ------------------------------------------------------------------ tema 10 · polos en lazo cerrado */
const lazo = {
  id: 'lazo', tema: 10, t: 'Polos en lazo cerrado', d: 'Ecuación con K, sus raíces en el plano s, tercer polo y aproximación de 2.º orden.',
  gen(r, tarea){
    let P;
    for (let g = 0; g < 150; g++) {
      P = plant(r, tarea, { zero0: true });
      P.D = polyOf(P.p); P.K = tarea ? 45.53 : r.step(4, 200, 0.5);
      P.ch = padd(P.D, [P.K]); P.cl = roots(P.ch);
      if (tarea) break;
      const cx = P.cl.filter(w => w.im);
      if (P.cl.every(w => w.re < -0.2) && cx.length === 2 && cx.every(w => Math.abs(w.im) >= 0.8 && Math.abs(w.im) <= 6.5)) break;
    }
    const xs = [0].concat(P.p.map(v => -v), P.cl.map(w => w.re)), ym = Math.max(3, Math.ceil(Math.max(...P.cl.map(w => Math.abs(w.im)))) + 1);
    P.view = { x0: Math.floor(Math.min(...xs)) - 1, x1: 1, y0: -ym, y1: ym };
    return P;
  },
  enun: (P, h) => `<p>Para</p>${h.tx(GTeX(P), true)}<p>con ${h.tx(`K = ${h.n(P.K)}`)}, encuentra los polos de lazo cerrado y decide si el sistema se comporta como uno de 2.º orden.</p>`,
  inc: [
    { k: 'a', q: (P, h) => `Ecuación característica con esa K: ${h.tx('s^3 + b_2 s^2 + b_1 s + b_0 = 0')}.`,
      f: [{ k: 'b2', l: 'b<sub>2</sub>' }, { k: 'b1', l: 'b<sub>1</sub>' }, { k: 'b0', l: 'b<sub>0</sub>' }],
      sol: P => ({ b2: P.ch[1], b1: P.ch[2], b0: P.ch[3] }),
      how: (P, A, S, h) => h.tx(`${den(P.p)} + ${h.n(P.K)} = ${polyTeX(P.ch, h)}`, true) },
    { k: 'b', q: () => 'Ubica los <b>polos de lazo cerrado</b> (×) en el plano s (el par complejo se pone completo con uno). Usa el botón de la calculadora: con «→ las 3 raíces» se ponen solas.',
      tools: () => [{ app: 'eqn', n: 3 }],
      f: [{ k: 'cl', l: 'Polos de T(s)', plane: true, marks: ['x'], sym: true, snap: 0.25, abs: 0.15, tol: 0.02, max: 6 }],
      sol: (P, A) => ({ cl: roots([1, A.b2, A.b1, A.b0]).map(w => ({ t: 'x', re: w.re, im: w.im })) }),
      how: (P, A, S, h) => { const cl = roots([1, A.b2, A.b1, A.b0]);
        return `<p>Ecuación › Polinómica, grado 3, coeficientes 1, ${h.f(A.b2)}, ${h.f(A.b1)}, ${h.f(A.b0)} → ${h.tx(cl.filter(w => w.im >= 0).map(w => w.im ? `${h.n(w.re)} \\pm j${h.n(w.im)}` : h.n(w.re)).join(',\\; '))}.</p>`; } },
    { k: 'c', q: () => 'Polo real (el tercer polo) p<sub>3</sub>.', f: [{ k: 'p3', l: 'p<sub>3</sub>' }],
      sol: (P, A) => { const re = roots([1, A.b2, A.b1, A.b0]).filter(w => !w.im).map(w => w.re); return { p3: re.length ? re[re.length - 1] : P.cl.find(w => !w.im).re }; },
      how: (P, A, S, h) => { const cx = roots([1, A.b2, A.b1, A.b0]).find(w => w.im > 0);
        return `<p>Comprobación con la suma de raíces (= −b₂): ${cx ? h.tx(`p_3 = -${h.n(A.b2)} - 2(${h.n(cx.re)}) = ${h.n(-A.b2 - 2 * cx.re)}`) : ''}.</p>`; } },
    { k: 'd', q: (P, h) => `Razón ${h.tx('|p_3| / \\sigma')}, donde ${h.tx('-\\sigma')} es la parte real del par complejo.`, f: [{ k: 'rt', l: '|p<sub>3</sub>|/σ' }],
      sol: (P, A) => { const cx = roots([1, A.b2, A.b1, A.b0]).find(w => w.im > 0) || P.cl.find(w => w.im > 0); return { rt: Math.abs(A.p3) / Math.abs(cx.re) }; },
      how: (P, A, S, h) => { const cx = roots([1, A.b2, A.b1, A.b0]).find(w => w.im > 0) || P.cl.find(w => w.im > 0);
        return h.tx(`\\dfrac{|p_3|}{\\sigma} = \\dfrac{${h.n(Math.abs(A.p3))}}{${h.n(Math.abs(cx.re))}} = ${h.n(S.rt)}`, true); } },
    { k: 'e', q: () => '¿Se puede aproximar como sistema de 2.º orden (regla: el tercer polo a 5 veces o más de la parte real del par)?',
      f: [{ k: 'ap', l: 'Respuesta', ch: [{ v: 1, l: 'Sí' }, { v: 0, l: 'No' }] }],
      sol: (P, A) => ({ ap: A.rt >= 5 ? 1 : 0 }),
      how: (P, A, S, h) => `<p>${h.f(A.rt)} ${A.rt >= 5 ? '≥' : '<'} 5: ${S.ap ? '<b>sí</b>, el tercer polo se apaga rápido y el par complejo domina.' : '<b>no</b> se cumple la regla: hay que verificar con la simulación (como en la P1, donde el sobrepaso real queda en 8.8 % en lugar de 10 %).'}</p>` }
  ]
};

/* ------------------------------------------------------------------ tema 11 · respuesta transitoria */
const transitoria = {
  id: 'transitoria', tema: 11, t: 'Respuesta transitoria del par dominante', d: 'ωn, ζ, Ts, Tp y %OS a partir de los polos.',
  gen(r, tarea){
    if (tarea) return { sg: 2.0285, wd: 2.7677 };
    for (let g = 0; g < 100; g++) {
      const sg = r.step(0.5, 6, 0.1), wd = r.step(0.8, 9, 0.1), z = sg / Math.hypot(sg, wd);
      if (z > 0.25 && z < 0.9) return { sg, wd };
    }
    return { sg: 2, wd: 3 };
  },
  enun: (P, h) => `<p>El par dominante de lazo cerrado de un sistema es</p>${h.tx(`s = ${n4(-P.sg)} \\pm j${n4(P.wd)}`, true)}<p>Calcula las características de su respuesta al escalón (aproximación de 2.º orden).</p>${figS({ x0: Math.min(-3, Math.floor(-P.sg) - 1), x1: 1, y0: -0.8, y1: Math.max(2, Math.ceil(P.wd) + 1) }, { s0: { re: -P.sg, im: P.wd }, conj: true, alt: 'Par dominante' })}`,
  inc: [
    { k: 'a', q: (P, h) => `Frecuencia natural ${h.tx('\\omega_n = |s|')}.`, f: [{ k: 'wn', l: 'ω<sub>n</sub>', u: 'rad/s' }],
      sol: P => ({ wn: Math.hypot(P.sg, P.wd) }),
      how: (P, A, S, h) => h.tx(`\\omega_n = \\sqrt{${n4(P.sg)}^2 + ${n4(P.wd)}^2} = ${h.n(S.wn)}`, true) },
    { k: 'b', q: (P, h) => `Factor de amortiguamiento ${h.tx('\\zeta = \\sigma/\\omega_n')}.`, f: [{ k: 'z', l: 'ζ' }],
      sol: (P, A) => ({ z: P.sg / A.wn }),
      how: (P, A, S, h) => h.tx(`\\zeta = \\dfrac{${n4(P.sg)}}{${h.n(A.wn)}} = ${h.n(S.z)}`, true) },
    { k: 'c', q: (P, h) => `Tiempo de asentamiento (2 %) ${h.tx('T_s = 4/\\sigma')}.`, f: [{ k: 'ts', l: 'T<sub>s</sub>', u: 's' }],
      sol: P => ({ ts: 4 / P.sg }),
      how: (P, A, S, h) => h.tx(`T_s = \\dfrac{4}{${n4(P.sg)}} = ${h.n(S.ts)}\\ \\text{s}`, true) },
    { k: 'd', q: (P, h) => `Tiempo pico ${h.tx('T_p = \\pi/\\omega_d')}.`, f: [{ k: 'tp', l: 'T<sub>p</sub>', u: 's' }],
      sol: P => ({ tp: Math.PI / P.wd }),
      how: (P, A, S, h) => h.tx(`T_p = \\dfrac{\\pi}{${n4(P.wd)}} = ${h.n(S.tp)}\\ \\text{s}`, true) },
    { k: 'e', q: (P, h) => `Sobrepaso ${h.tx('\\%OS = 100\\,e^{-\\zeta\\pi/\\sqrt{1-\\zeta^2}}')}.`, f: [{ k: 'os', l: '%OS', u: '%' }],
      sol: (P, A) => ({ os: 100 * Math.exp(-A.z * Math.PI / Math.sqrt(Math.max(1e-9, 1 - A.z * A.z))) }),
      how: (P, A, S, h) => `${h.tx(`\\%OS = 100\\,e^{-${h.n(A.z)}\\pi/\\sqrt{1-${h.n(A.z)}^2}} = ${h.n(S.os)}\\,\\%`, true)}<p>Atajo: ${h.tx('\\zeta\\pi/\\sqrt{1-\\zeta^2} = \\pi\\sigma/\\omega_d')}.${Math.abs(P.sg - 2.0285) < 1e-9 ? ' Es el 10 % que pide la P1.' : ''}</p>` }
  ]
};

/* orden: por tema (la página los agrupa por tema) */
export const EJ = [polos, plano, ecuacion, ejereal, asint, ruptura, routh, zeta, angulo, magnitud, lazo, transitoria, error];
export const byId = id => EJ.find(e => e.id === id);
