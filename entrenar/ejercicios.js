/* =====================================================================================================
   entrenar/ejercicios.js · Temas y ejercicios del apartado «Entrenar» · etapas 1–5
   ---------------------------------------------------------------------------------------------------
   TEMAS = los 16 temas del plan (los que aún no tienen ejercicios dicen en qué etapa llegan).
   EJ    = ejercicios. Etapa 4: temas 1–12 con el piloto de la P1 (caso de la tarea: G = K/[(s+2)(s+4)(s+6)], %OS = 10,
           s₀ = −2.0285 ± j2.7677, K = 45.53) y variantes aleatorias (3 polos enteros, a veces uno en el origen o un cero).
   Etapa 5: temas 13–15 (compensadores con el caso de P2–P7, verificación y Simulink; ver más abajo).
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

/* =====================================================================================================
   Etapa 5 · temas 13–15: compensadores con el caso de cada práctica (P2 PI · P3 atraso · P4 PD · P5 adelanto · P6 PID ·
   P7 adelanto‑atraso) y variantes; verificación del diseño (ecuación final, polos, modos y simulación contra las metas)
   y Simulink (parámetros de los bloques). Los números se calculan aquí mismo (nada escrito a mano):
     · el par sin compensar es el primer cruce de la condición de ángulo con la recta de ζ (design);
     · con PI / atraso / PI del PID / atraso del adelanto‑atraso se re‑busca el cruce más cercano al punto anterior (nearDesign);
     · la respuesta al escalón es la suma exacta de modos (residuos de C(s) = T(s)/s), como MATLAB.
   En los temas 14 y 15 el «caso de la tarea» se elige (P2…P7): motor.build pasa a gen el número de práctica (semilla −N).
   ===================================================================================================== */
const osOf = z => 100 * Math.exp(-z * Math.PI / Math.sqrt(Math.max(1e-12, 1 - z * z)));
const tanD = a => Math.tan(a / DEG);
const n360 = a => ((a % 360) + 360) % 360;
const prodN = a => a.reduce((x, v) => x * v, 1);
const nz = a => a.filter(v => Math.abs(v) > 1e-12);
const fullOf = (P, g) => ({ p: P.p.concat(g.p), z: P.z.concat(g.z) });
const typeOf = F => F.p.filter(v => Math.abs(v) < 1e-12).length;
const closedPoly = (F, K) => padd(polyOf(F.p), pscale(polyOf(F.z), K));
const cA = (a, b) => ({ re: a.re + b.re, im: a.im + b.im });
const cM = (a, b) => ({ re: a.re * b.re - a.im * b.im, im: a.re * b.im + a.im * b.re });
const cD = (a, b) => { const m = b.re * b.re + b.im * b.im; return { re: (a.re * b.re + a.im * b.im) / m, im: (a.im * b.re - a.re * b.im) / m }; };
const cEv = (c, w) => c.reduce((s, v) => cA(cM(s, w), { re: v, im: 0 }), { re: 0, im: 0 });
const cAbs = w => Math.hypot(w.re, w.im);
const near = (a, list, e) => list.some(v => Math.abs(v - a) < (e || 0.05));
/* cruce de la condición de ángulo sobre la recta de ζ más cercano a σ = sg0 (para re‑buscar tras agregar un dipolo o el PI) */
function nearDesign(F, z, sg0){
  const tn = Math.tan(Math.acos(z)), f = sg => wrap(angG(F, { re: -sg, im: sg * tn }) + 180), h = sg0 / 3000;
  const bis = (lo, hi) => { let flo = f(lo); for (let i = 0; i < 60; i++) { const m = (lo + hi) / 2, fm = f(m); if (Math.sign(fm) === Math.sign(flo)) { lo = m; flo = fm; } else hi = m; } const s = (lo + hi) / 2; return { sg: s, wd: s * tn }; };
  for (let d = 0; d < sg0 * 0.95; d += h) for (const [a, b] of [[sg0 + d, sg0 + d + h], [sg0 - d - h, sg0 - d]]) {
    if (a <= 0) continue; const fa = f(a), fb = f(b);
    if (Math.sign(fa) !== Math.sign(fb) && Math.abs(fa) < 90 && Math.abs(fb) < 90) return bis(a, b);
  }
  return null;
}
/* tipo del lazo y error: q = orden de la entrada (0 escalón, 1 rampa) → {kk (Kp o Kv), e} */
function errOf(F, K, q){
  const n = typeOf(F), kk = n === q ? K * prodN(nz(F.z)) / prodN(nz(F.p)) : n > q ? Infinity : 0;
  return { kk, e: n > q ? 0 : n < q ? Infinity : q === 0 ? 1 / (1 + kk) : 1 / kk };
}
/* respuesta al escalón del lazo cerrado K·N/(D + K·N): suma exacta de modos → {c(t), cf, cmax, tp, ts, os, pl, rs} */
function simStep(F, K){
  const N = polyOf(F.z), D = polyOf(F.p), Dt = padd(D, pscale(N, K)), dD = pder(Dt), pl = roots(Dt);
  const cf = K * peval(N, 0) / peval(Dt, 0);
  const rs = pl.map(p => cD(cM({ re: K, im: 0 }, cEv(N, p)), cM(p, cEv(dD, p))));
  const c = t => pl.reduce((a, p, i) => { const e = Math.exp(p.re * t); return a + e * (rs[i].re * Math.cos(p.im * t) - rs[i].im * Math.sin(p.im * t)); }, cf);
  const slow = Math.min(...pl.map(p => Math.abs(p.re))), H = Math.min(14 / slow, 4000), n = 40000, dt = H / n, band = 0.02 * Math.abs(cf);
  let im = 0, cm = -Infinity, last = -1;
  for (let i = 0; i <= n; i++) { const v = c(i * dt); if (v > cm) { cm = v; im = i; } if (Math.abs(v - cf) > band) last = i; }
  let a = Math.max(0, (im - 1) * dt), b = (im + 1) * dt;
  for (let k = 0; k < 80; k++) { const m1 = a + (b - a) / 3, m2 = b - (b - a) / 3; if (c(m1) < c(m2)) a = m1; else b = m2; }
  const tp = (a + b) / 2, cmax = c(tp);
  let ts = 0; if (last >= 0) { let lo = last * dt, hi = (last + 1) * dt; for (let k = 0; k < 60; k++) { const m = (lo + hi) / 2; if (Math.abs(c(m) - cf) > band) lo = m; else hi = m; } ts = (lo + hi) / 2; }
  return { c, cf, cmax, tp, ts, os: cmax > cf ? (cmax - cf) / cf * 100 : 0, pl, rs, H };
}
/* lo común de un diseño terminado (lo usan los temas 14 y 15) */
function finDesign(P){
  P.q = typeOf(P);                                    // tipo de la planta: 0 → error al escalón, 1 → a la rampa
  P.F = fullOf(P, P.gc);
  P.ch = closedPoly(P.F, P.K); P.cl = roots(P.ch);
  P.err = errOf(P.F, P.K, P.q);
  P.view = viewPts(P.cl);
  return P;
}
function viewPts(ws, xs){
  const all = ws.map(w => w.re).concat(xs || [], [0]);
  let x0 = Math.floor(Math.min(...all)) - 1; const x1 = 1; if (x1 - x0 < 6) x0 = x1 - 6;
  const ym = Math.max(2, Math.ceil(Math.max(0, ...ws.map(w => Math.abs(w.im)))) + 1);
  return { x0, x1, y0: -ym, y1: ym };
}
const stable = P => P.cl.every(w => w.re < -0.02);
const TN = { pi: 'PI ideal', atraso: 'compensador de atraso', pd: 'PD ideal', adelanto: 'compensador de adelanto', pid: 'PID (PD + PI)', adatr: 'compensador de adelanto‑atraso' };
/* Gc(s) en TeX */
const gcTeX = (g, h, pre) => `${pre || 'G_c(s)'} = ${g.p.length ? `\\dfrac{${g.z.map(fac).join('')}}{${g.p.map(fac).join('')}}` : g.z.map(fac).join('')}`;
const s0TeX = (s, h, nm) => `${nm || 's_0'} = ${h.n(s.re)} \\pm j${h.n(s.im)}`;
const sinComp = (P, h) => `<p>Sin compensar (temas 7–9), con ${h.tx(`\\zeta = ${h.n(P.z_)}`)} (${h.f(P.os)} % de sobrepaso) el par dominante está en ${h.tx(s0TeX(P.s0, h))} con ${h.tx(`K = ${h.n(P.K0)}`)}.</p>`;
const sdOf = A => ({ re: -A.sg, im: A.wd });
const rootsTeX = (ws, h) => ws.filter(w => w.im >= 0).map(w => w.im ? `${h.n(w.re)} \\pm j${h.n(w.im)}` : h.n(w.re)).join(',\\; ');

/* ------------------------------------------------------------------ generadores de cada tipo (caso de la práctica o variante) */
function genPI(r, tarea){
  for (let g = 0; g < 300; g++) {
    const P = tarea ? { caso: 'P2', p: [1, 2, 10], z: [], z_: 0.174, zc: 0.1 }
      : { p: r.distinct(3, 1, 10).sort((a, b) => a - b), z: [], z_: r.step(0.2, 0.6, 0.01), zc: r.pick([0.05, 0.1, 0.1, 0.2, 0.2, 0.5, 1]) };
    if (near(P.zc, P.p)) continue;
    P.tipo = 'pi'; P.os = osOf(P.z_);
    const d = design(P, P.z_); if (!d || (!tarea && (d.wd < 0.6 || d.wd > 9))) continue;
    P.s0 = { re: -d.sg, im: d.wd }; P.K0 = magK(P, P.s0);
    P.kp = P.K0 / prodN(P.p); P.eu = 1 / (1 + P.kp);
    P.gc = { z: [P.zc], p: [0] };
    const d2 = nearDesign(fullOf(P, P.gc), P.z_, d.sg); if (!d2 || (!tarea && Math.abs(d2.sg / d.sg - 1) > 0.3)) continue;
    P.sd = { re: -d2.sg, im: d2.wd }; P.K = magK(fullOf(P, P.gc), P.sd);
    P.dang = argD(P.s0, P.zc) - argD(P.s0, 0); P.dmag = dist(P.s0, P.zc) / dist(P.s0, 0);
    finDesign(P); if (!tarea && !stable(P)) continue;
    P.meta = { k: 'e0', v: 0 }; P.blk = [{ k: 'tf', z: P.zc, p: 0, l: 'PI' }];
    return P;
  }
  return genPI(r, true);
}
function genAtr(r, tarea){
  for (let g = 0; g < 300; g++) {
    let P;
    if (tarea) P = { caso: 'P3', p: [0, 7], z: [], os: 15, M: 20, pc: 0.01 };
    else { const a = r.int(3, 12); P = { p: r() < 0.3 ? [0, a, a + r.int(2, 8)] : [0, a], z: [], os: r.int(5, 20), M: r.pick([5, 10, 15, 20, 25]), pc: r.pick([0.005, 0.01, 0.01, 0.02]) }; }
    P.tipo = 'atraso'; P.z_ = zetaOf(P.os); P.zc = +(P.M * P.pc).toFixed(6);
    const d = design(P, P.z_); if (!d || (!tarea && (d.wd < 0.6 || d.wd > 9 || P.zc > 0.15 * d.sg))) continue;
    P.s0 = { re: -d.sg, im: d.wd }; P.K0 = magK(P, P.s0);
    P.kv = P.K0 / prodN(nz(P.p)); P.eu = 1 / P.kv;
    P.gc = { z: [P.zc], p: [P.pc] };
    P.dang = argD(P.s0, P.zc) - argD(P.s0, P.pc); P.dmag = dist(P.s0, P.zc) / dist(P.s0, P.pc);
    const d2 = nearDesign(fullOf(P, P.gc), P.z_, d.sg); if (!d2 || (!tarea && Math.abs(d2.sg / d.sg - 1) > 0.3)) continue;
    P.sd = { re: -d2.sg, im: d2.wd }; P.K = magK(fullOf(P, P.gc), P.sd);
    finDesign(P); if (!tarea && !stable(P)) continue;
    P.kvc = P.err.kk; P.ec = P.err.e; P.mj = P.eu / P.ec;
    P.meta = { k: 'e', v: P.eu / P.M }; P.blk = [{ k: 'tf', z: P.zc, p: P.pc, l: 'Atraso' }];
    return P;
  }
  return genAtr(r, true);
}
/* punto de diseño con T_s (o T_p) más chico y el mismo ζ */
function fastPoint(P, d, F){ const tn = Math.tan(Math.acos(P.z_)); P.ts0 = 4 / d.sg; P.tsd = P.ts0 / F; P.sgd = 4 / P.tsd; P.wdd = P.sgd * tn; P.sdd = { re: -P.sgd, im: P.wdd }; }
function genPD(r, tarea){
  for (let g = 0; g < 300; g++) {
    let P;
    if (tarea) P = { caso: 'P4', p: [0, 4, 6], z: [], os: 16, Fx: 3 };
    else { const p = r.distinct(3, 1, 10).sort((a, b) => a - b); if (r() < 0.6) p[0] = 0; P = { p, z: [], os: r.int(5, 20), Fx: r.pick([2, 3]) }; }
    P.tipo = 'pd'; P.z_ = zetaOf(P.os);
    const d = design(P, P.z_); if (!d || (!tarea && (d.wd < 0.5 || d.wd > 6))) continue;
    P.s0 = { re: -d.sg, im: d.wd }; P.K0 = magK(P, P.s0);
    fastPoint(P, d, P.Fx);
    P.gA = angG(P, P.sdd); P.tz = n360(-180 - P.gA); if (P.tz <= 4 || P.tz >= 176) continue;
    P.zc = P.sgd + P.wdd / tanD(P.tz); if (!(P.zc > 0.2) || near(P.zc, P.p, 0.1)) continue;
    P.gc = { z: [P.zc], p: [] }; P.sd = P.sdd; P.K = magK(fullOf(P, P.gc), P.sd);
    finDesign(P); if (!tarea && !stable(P)) continue;
    P.meta = { k: 'ts', v: P.tsd }; P.blk = [{ k: 'pd', P: P.zc, D: 1 }];
    return P;
  }
  return genPD(r, true);
}
function genAd(r, tarea){
  for (let g = 0; g < 300; g++) {
    let P;
    if (tarea) P = { caso: 'P5', p: [0, 7], z: [], os: 15, Fx: 3, zl: 10 };
    else { const a = r.int(2, 10); P = { p: r() < 0.3 ? [0, a, a + r.int(2, 8)] : [0, a], z: [], os: r.int(5, 20), Fx: r.pick([2, 3]) }; }
    P.tipo = 'adelanto'; P.z_ = zetaOf(P.os);
    const d = design(P, P.z_); if (!d || (!tarea && (d.wd < 0.5 || d.wd > 6))) continue;
    P.s0 = { re: -d.sg, im: d.wd }; P.K0 = magK(P, P.s0);
    fastPoint(P, d, P.Fx);
    if (!tarea) { P.zl = r.int(Math.max(1, Math.ceil(0.4 * P.sgd)), Math.max(2, Math.ceil(1.2 * P.sgd))); if (near(P.zl, P.p, 0.5)) continue; }
    P.sA = angG({ p: P.p, z: P.z.concat([P.zl]) }, P.sdd); P.tp = P.sA + 180; if (!(P.tp > 3 && P.tp < 87)) continue;
    P.pc = P.sgd + P.wdd / tanD(P.tp); if (P.pc <= P.zl + 0.3 || P.pc > 60) continue;
    P.gc = { z: [P.zl], p: [P.pc] }; P.sd = P.sdd; P.K = magK(fullOf(P, P.gc), P.sd);
    finDesign(P); if (!tarea && !stable(P)) continue;
    P.meta = { k: 'ts', v: P.tsd }; P.blk = [{ k: 'tf', z: P.zl, p: P.pc, l: 'Adelanto' }];
    return P;
  }
  return genAd(r, true);
}
function genPID(r, tarea){
  for (let g = 0; g < 300; g++) {
    let P;
    if (tarea) P = { caso: 'P6', p: [3, 6, 10], z: [8], os: 20, f: 2 / 3, zpi: 0.5 };
    else { const p = r.distinct(3, 1, 12).sort((a, b) => a - b); let z; do { z = r.int(1, 12); } while (p.includes(z));
      P = { p, z: [z], os: r.int(8, 25), f: r.pick([2 / 3, 0.5]), zpi: r.pick([0.1, 0.2, 0.5, 1]) }; if (near(P.zpi, P.p)) continue; }
    P.tipo = 'pid'; P.z_ = zetaOf(P.os); const tn = Math.tan(Math.acos(P.z_));
    const d = design(P, P.z_); if (!d || (!tarea && (d.wd < 0.8 || d.wd > 12))) continue;
    P.s0 = { re: -d.sg, im: d.wd }; P.K0 = magK(P, P.s0);
    P.kp0 = P.K0 * prodN(P.z) / prodN(P.p); P.eu = 1 / (1 + P.kp0);
    P.tp0 = Math.PI / d.wd; P.tpd = P.f * P.tp0; P.wdd = Math.PI / P.tpd; P.sgd = P.wdd / tn; P.sdd = { re: -P.sgd, im: P.wdd };
    P.gA = angG(P, P.sdd); P.tz = n360(-180 - P.gA); if (P.tz <= 3 || P.tz >= 176) continue;
    P.zpd = P.sgd + P.wdd / tanD(P.tz); if (!(P.zpd > 0.3) || P.zpd > 200 || near(P.zpd, P.p.concat(P.z), 0.1)) continue;
    P.Kpd = magK({ p: P.p, z: P.z.concat([P.zpd]) }, P.sdd);
    P.gc = { z: [P.zpd, P.zpi], p: [0] };
    const d2 = nearDesign(fullOf(P, P.gc), P.z_, P.sgd); if (!d2 || (!tarea && Math.abs(d2.sg / P.sgd - 1) > 0.25)) continue;
    P.sd = { re: -d2.sg, im: d2.wd }; P.K = magK(fullOf(P, P.gc), P.sd);
    P.K1 = P.K * (P.zpd + P.zpi); P.K2 = P.K * P.zpd * P.zpi; P.K3 = P.K;
    finDesign(P); if (!tarea && !stable(P)) continue;
    P.meta = { k: 'tp', v: P.tpd }; P.blk = [{ k: 'pid', P: P.zpd + P.zpi, I: P.zpd * P.zpi, D: 1 }];
    return P;
  }
  return genPID(r, true);
}
function genAA(r, tarea){
  for (let g = 0; g < 300; g++) {
    let P;
    if (tarea) P = { caso: 'P7', p: [0, 7], z: [], os: 20, Fx: 2, zl: 3, M: 10, pa: 0.01 };
    else { const a = r.int(3, 10); P = { p: r() < 0.25 ? [0, a, a + r.int(2, 8)] : [0, a], z: [], os: r.int(10, 25), Fx: r.pick([2, 3]), M: r.pick([5, 10]), pa: r.pick([0.005, 0.01]) }; }
    P.tipo = 'adatr'; P.z_ = zetaOf(P.os);
    const d = design(P, P.z_); if (!d || (!tarea && (d.wd < 0.5 || d.wd > 6))) continue;
    P.s0 = { re: -d.sg, im: d.wd }; P.K0 = magK(P, P.s0); P.kv0 = P.K0 / prodN(nz(P.p));
    fastPoint(P, d, P.Fx);
    if (!tarea) { P.zl = r.int(1, Math.max(1, Math.round(0.8 * P.sgd))); if (near(P.zl, P.p, 0.5)) continue; }
    P.sA = angG({ p: P.p, z: P.z.concat([P.zl]) }, P.sdd); P.tp = P.sA + 180; if (!(P.tp > 3 && P.tp < 87)) continue;
    P.pad = P.sgd + P.wdd / tanD(P.tp); if (P.pad <= P.zl + 0.3 || P.pad > 60) continue;
    P.Kad = magK({ p: P.p.concat([P.pad]), z: P.z.concat([P.zl]) }, P.sdd); P.kva = P.Kad * P.zl / (prodN(nz(P.p)) * P.pad);
    P.kvr = P.M * P.kv0; P.rt = P.kvr / P.kva; P.za = P.rt * P.pa; if (!tarea && (P.rt < 1.5 || P.za > 0.15 * P.sgd)) continue;
    P.dang = argD(P.sdd, P.za) - argD(P.sdd, P.pa);
    P.gc = { z: [P.zl, P.za], p: [P.pad, P.pa] };
    const d2 = nearDesign(fullOf(P, P.gc), P.z_, P.sgd); if (!d2 || (!tarea && Math.abs(d2.sg / P.sgd - 1) > 0.25)) continue;
    P.sd = { re: -d2.sg, im: d2.wd }; P.K = magK(fullOf(P, P.gc), P.sd);
    finDesign(P); if (!tarea && !stable(P)) continue;
    P.meta = { k: 'ts', v: P.ts0 / P.Fx }; P.blk = [{ k: 'tf', z: P.zl, p: P.pad, l: 'Adelanto' }, { k: 'tf', z: P.za, p: P.pa, l: 'Atraso' }];
    return P;
  }
  return genAA(r, true);
}
const GENS = { pi: genPI, atraso: genAtr, pd: genPD, adelanto: genAd, pid: genPID, adatr: genAA };
const PRAC = { 2: 'pi', 3: 'atraso', 4: 'pd', 5: 'adelanto', 6: 'pid', 7: 'adatr' };
/* temas 14 y 15: tarea = número de práctica (true → P2); variante = un tipo al azar (ok(P) filtra) */
function caso(r, tarea, ok){
  if (tarea) return GENS[PRAC[tarea === true ? 2 : tarea] || 'pi'](r, true);
  for (let g = 0; g < 60; g++) { const P = GENS[r.pick(Object.keys(GENS))](r, false); if (P && !P.caso && (!ok || ok(P))) return P; }
  return GENS.pi(r, true);
}
/* figura del plano con planta + compensador y un punto */
const figComp = (P, s, sl) => { const pp = P.p.concat(P.gc ? P.gc.p : []), zz = P.z.concat(P.gc ? P.gc.z : []);
  return figS(viewFor({ p: pp.filter(v => v < 40), z: zz.filter(v => v < 40) }, s), { p: pp.filter(v => v < 40), z: zz.filter(v => v < 40), s0: s, conj: true, sl, alt: 'Planta y compensador en el plano s' }); };
/* diseño con T_s menor: inciso común (T_s sin compensar, σ_d y ω_d) */
const incFast = (k) => ({ k, q: (P, h) => `Punto de diseño: mismo ${h.tx('\\zeta')} y ${h.tx('T_s')} ${P.Fx} veces menor. Calcula ${h.tx('T_s = 4/\\sigma')} sin compensar, ${h.tx('\\sigma_d = 4/T_{s,d}')} y ${h.tx('\\omega_d = \\sigma_d\\tan\\theta')} (con ${h.tx('\\theta = \\cos^{-1}\\zeta')}).`,
  f: [{ k: 'ts', l: 'T<sub>s</sub> sin compensar', u: 's' }, { k: 'sg', l: 'σ<sub>d</sub>' }, { k: 'wd', l: 'ω<sub>d</sub>' }],
  sol: P => ({ ts: P.ts0, sg: P.sgd, wd: P.wdd }),
  how: (P, A, S, h) => h.tx(`\\begin{aligned}T_s &= \\dfrac{4}{${h.n(-P.s0.re)}} = ${h.n(S.ts)}\\ \\text{s} \\\\ T_{s,d} &= \\dfrac{${h.n(S.ts)}}{${P.Fx}} = ${h.n(S.ts / P.Fx)}\\ \\text{s} \\\\ \\sigma_d &= \\dfrac{4}{T_{s,d}} = ${h.n(S.sg)} \\\\ \\omega_d &= ${h.n(S.sg)}\\tan(${h.n(Math.acos(P.z_) * DEG)}^\\circ) = ${h.n(S.wd)}\\end{aligned}`, true) + `<p>Punto de diseño: ${h.tx(s0TeX({ re: -S.sg, im: S.wd }, h, 's_d'))}.</p>` });
/* ángulos de todos los polos y ceros a s_d, en TeX */
const angList = (F, s, h) => F.p.map(p => `-\\angle${sfacT(p).replace('s_0', 's_d')}`).concat(F.z.map(z => `+\\angle${sfacT(z).replace('s_0', 's_d')}`)).join(' ').replace(/^\+/, '');
const angVals = (F, s, h) => F.p.map(p => `-{${h.n(argD(s, p))}}^\\circ`).concat(F.z.map(z => `+{${h.n(argD(s, z))}}^\\circ`)).join(' ').replace(/^\+/, '');

/* ------------------------------------------------------------------ tema 13 · PI ideal (P2) */
const exPI = {
  id: 'pi', tema: 13, t: 'Compensador PI ideal (P2)', d: 'Error sin compensar, aporte del dipolo en s₀, tipo nuevo y polos con el PI.',
  gen: (r, t) => genPI(r, !!t),
  enun: (P, h) => `<p>Con realimentación unitaria y</p>${h.tx(GTeX(P), true)}${sinComp(P, h)}<p>Para quitar el error al escalón sin cambiar el transitorio se agrega un <b>PI ideal</b> (un polo en el origen y un cero muy cerca):</p>${h.tx(`G_c(s) = \\dfrac{s + ${h.n(P.zc)}}{s}`, true)}${figComp(P, P.s0)}`,
  inc: [
    { k: 'a', q: (P, h) => `Sin compensar: constante de posición ${h.tx('K_p = \\lim_{s\\to0} KG(s)')} y error ante un escalón unitario.`,
      f: [{ k: 'kp', l: 'K<sub>p</sub>' }, { k: 'eu', l: 'e(∞)' }],
      sol: P => ({ kp: P.kp, eu: P.eu }),
      how: (P, A, S, h) => h.tx(`K_p = \\dfrac{${h.n(P.K0)}}{${P.p.join('\\cdot')}} = ${h.n(S.kp)},\\qquad e(\\infty) = \\dfrac{1}{1 + K_p} = ${h.n(S.eu)}`, true) },
    { k: 'b', q: (P, h) => `¿Cuánto aporta el PI en ${h.tx('s_0')}? ${h.tx('\\angle G_c(s_0) = \\angle(s_0 + z_c) - \\angle s_0')} y ${h.tx('|G_c(s_0)| = |s_0 + z_c|/|s_0|')}.`,
      tools: () => [{ app: 'cplx' }],
      f: [{ k: 'an', l: '∠G<sub>c</sub>(s₀)', u: '°', ang: true }, { k: 'mg', l: '|G<sub>c</sub>(s₀)|' }],
      sol: P => ({ an: P.dang, mg: P.dmag }),
      how: (P, A, S, h) => `${h.tx(`\\begin{aligned}\\angle G_c &= \\angle(${h.n(P.s0.re + P.zc)} + j${h.n(P.s0.im)}) - \\angle(${h.n(P.s0.re)} + j${h.n(P.s0.im)}) \\\\ &= {${h.n(argD(P.s0, P.zc))}}^\\circ - {${h.n(argD(P.s0, 0))}}^\\circ = {${h.n(S.an)}}^\\circ \\\\ |G_c| &= \\dfrac{${h.n(dist(P.s0, P.zc))}}{${h.n(dist(P.s0, 0))}} = ${h.n(S.mg)}\\end{aligned}`, true)}<p>En la calculadora (Complejos): <code>arg(${n4(P.s0.re + P.zc)}+${n4(P.s0.im)}i)−arg(${n4(P.s0.re)}+${n4(P.s0.im)}i)</code>.</p>` },
    { k: 'c', q: () => '¿El PI casi no mueve el LGDR cerca de s₀? (regla: |∠G<sub>c</sub>| < 5° y 0.9 < |G<sub>c</sub>| < 1.1)',
      f: [{ k: 'ok', l: 'Respuesta', ch: [{ v: 1, l: 'Sí' }, { v: 0, l: 'No' }] }],
      sol: (P, A) => ({ ok: Math.abs(A.an) < 5 && A.mg > 0.9 && A.mg < 1.1 ? 1 : 0 }),
      how: (P, A, S, h) => `<p>${S.ok ? `Sí: el dipolo aporta ${h.f(A.an)}° y una magnitud ≈ 1, así que el par casi no se mueve y la K casi no cambia. Por eso se pone el cero <b>muy cerca</b> del origen.` : `No: el cero está demasiado lejos del origen (aporta ${h.f(A.an)}°). El par se mueve y el transitorio cambia; habría que acercar el cero al origen.`}</p>` },
    { k: 'd', q: () => 'Con el PI: tipo del sistema y error ante el escalón unitario.',
      f: [{ k: 'N', l: 'Tipo', abs: 0.01 }, { k: 'ec', l: 'e(∞)' }],
      sol: P => ({ N: typeOf(P.F), ec: P.err.e }),
      how: () => '<p>El PI agrega un polo en el origen: el tipo sube de 0 a 1, ' + 'K<sub>p</sub> → ∞ y e(∞) = 1/(1 + ∞) = <b>0</b>.</p>' },
    { k: 'e', q: (P, h) => `Re‑buscando sobre la recta de ζ con el PI se obtiene ${h.tx(`K = ${h.n(P.K)}`)}. Ubica los <b>polos de lazo cerrado</b> (×), raíces de ${h.tx('s\\,D(s) + K(s + z_c) = 0')}.`,
      tools: P => [{ app: 'eqn', n: P.ch.length - 1 }],
      f: P => [{ k: 'cl', l: 'Polos de T(s)', plane: true, marks: ['x'], sym: true, snap: 0.25, abs: 0.15, tol: 0.02, max: 6, view: P.view }],
      sol: P => ({ cl: P.cl.map(w => ({ t: 'x', re: w.re, im: w.im })) }),
      how: (P, A, S, h) => `${h.tx(`\\begin{aligned}&s${den(P.p)} + ${h.n(P.K)}(s + ${h.n(P.zc)}) \\\\ &= ${polyTeX(P.ch, h)} = 0\\end{aligned}`, true)}<p>Raíces: ${h.tx(rootsTeX(P.cl, h))}. El polo real junto al cero del PI es el modo lento que deja el PI.</p>` }
  ]
};

/* ------------------------------------------------------------------ tema 13 · atraso (P3) */
const exAtr = {
  id: 'atraso', tema: 13, t: 'Compensador de atraso (P3)', d: 'Error a la rampa, razón z_c/p_c, aporte del dipolo, mejora y polos.',
  gen: (r, t) => genAtr(r, !!t),
  enun: (P, h) => `<p>Con realimentación unitaria y</p>${h.tx(GTeX(P), true)}${sinComp(P, h)}<p>Se pide <b>mejorar ${P.M} veces el error ante una rampa</b> con un compensador de atraso con el polo en ${h.tx(`p_c = ${h.n(P.pc)}`)}:</p>${h.tx('G_c(s) = \\dfrac{s + z_c}{s + p_c}', true)}`,
  inc: [
    { k: 'a', q: (P, h) => `Sin compensar: ${h.tx('K_v = \\lim_{s\\to0} sKG(s)')} y error ante la rampa unitaria.`,
      f: [{ k: 'kv', l: 'K<sub>v</sub>' }, { k: 'eu', l: 'e(∞)' }],
      sol: P => ({ kv: P.kv, eu: P.eu }),
      how: (P, A, S, h) => h.tx(`K_v = \\dfrac{${h.n(P.K0)}}{${nz(P.p).join('\\cdot')}} = ${h.n(S.kv)},\\qquad e(\\infty) = \\dfrac{1}{K_v} = ${h.n(S.eu)}`, true) },
    { k: 'b', q: (P, h) => `El atraso multiplica ${h.tx('K_v')} por ${h.tx('z_c/p_c')} (si K casi no cambia). ¿Qué razón hace falta y dónde va el cero?`,
      f: [{ k: 'rt', l: 'z<sub>c</sub>/p<sub>c</sub>' }, { k: 'zc', l: 'z<sub>c</sub>' }],
      sol: P => ({ rt: P.M, zc: P.zc }),
      how: (P, A, S, h) => `${h.tx(`\\dfrac{z_c}{p_c} = ${P.M} \\;\\Rightarrow\\; z_c = ${P.M}\\cdot${h.n(P.pc)} = ${h.n(S.zc)}`, true)}<p>${h.tx(`G_c(s) = \\dfrac{s + ${h.n(S.zc)}}{s + ${h.n(P.pc)}}`)}: los dos quedan muy cerca del origen comparados con ${h.tx(`\\sigma = ${h.n(-P.s0.re)}`)}.</p>` },
    { k: 'c', q: (P, h) => `Aporte del dipolo en el punto sin compensar ${h.tx('s_0')}: ${h.tx('\\angle G_c(s_0)')} y ${h.tx('|G_c(s_0)|')}.`,
      tools: () => [{ app: 'cplx' }],
      f: [{ k: 'an', l: '∠G<sub>c</sub>(s₀)', u: '°', ang: true }, { k: 'mg', l: '|G<sub>c</sub>(s₀)|' }],
      sol: (P, A) => ({ an: argD(P.s0, A.zc) - argD(P.s0, P.pc), mg: dist(P.s0, A.zc) / dist(P.s0, P.pc) }),
      how: (P, A, S, h) => `${h.tx(`\\begin{aligned}\\angle G_c &= {${h.n(argD(P.s0, A.zc))}}^\\circ - {${h.n(argD(P.s0, P.pc))}}^\\circ = {${h.n(S.an)}}^\\circ \\\\ |G_c| &= \\dfrac{${h.n(dist(P.s0, A.zc))}}{${h.n(dist(P.s0, P.pc))}} = ${h.n(S.mg)}\\end{aligned}`, true)}<p>Unos cuantos grados y magnitud ≈ 1: el LGDR casi no se mueve cerca de ${h.tx('s_0')}.</p>` },
    { k: 'd', q: (P, h) => `Re‑buscando sobre la recta de ζ con el atraso se obtiene ${h.tx(`K = ${h.n(P.K)}`)}. Calcula la ${h.tx('K_v')} nueva, el error y la mejora ${h.tx('e_{\\text{sin}}/e_{\\text{con}}')}.`,
      f: [{ k: 'kvc', l: 'K<sub>v</sub> nueva' }, { k: 'ec', l: 'e(∞)' }, { k: 'mj', l: 'Mejora', u: '×' }],
      sol: (P, A) => { const kvc = P.K * A.zc / (prodN(nz(P.p)) * P.pc), ec = 1 / kvc; return { kvc, ec, mj: A.eu / ec }; },
      how: (P, A, S, h) => h.tx(`\\begin{aligned}K_v &= \\dfrac{${h.n(P.K)}\\cdot${h.n(A.zc)}}{${nz(P.p).join('\\cdot')}\\cdot${h.n(P.pc)}} = ${h.n(S.kvc)} \\\\ e(\\infty) &= \\dfrac{1}{${h.n(S.kvc)}} = ${h.n(S.ec)} \\\\ \\text{mejora} &= \\dfrac{${h.n(A.eu)}}{${h.n(S.ec)}} = ${h.n(S.mj)}\\end{aligned}`, true) + `<p>Casi ${P.M}: un poco menos porque la K re‑buscada es algo menor que la de antes.</p>` },
    { k: 'e', q: (P, h) => `Ubica los <b>polos de lazo cerrado</b> con ${h.tx(`K = ${h.n(P.K)}`)} (×).`,
      tools: P => [{ app: 'eqn', n: P.ch.length - 1 }],
      f: P => [{ k: 'cl', l: 'Polos de T(s)', plane: true, marks: ['x'], sym: true, snap: 0.25, abs: 0.15, tol: 0.02, max: 6, view: P.view }],
      sol: P => ({ cl: P.cl.map(w => ({ t: 'x', re: w.re, im: w.im })) }),
      how: (P, A, S, h) => `${h.tx(`\\begin{aligned}&${den(P.p)}(s + ${h.n(P.pc)}) + ${h.n(P.K)}(s + ${h.n(P.zc)}) \\\\ &= ${polyTeX(P.ch, h)} = 0\\end{aligned}`, true)}<p>Raíces: ${h.tx(rootsTeX(P.cl, h))}. El polo real pegado al cero del atraso casi se cancela (su modo es lento pero pequeño).</p>` }
  ]
};

/* ------------------------------------------------------------------ tema 13 · PD ideal (P4) */
const exPD = {
  id: 'pd', tema: 13, t: 'Compensador PD ideal (P4)', d: 'Punto de diseño más rápido, ángulo que falta, cero del PD, K y ganancias K_P y K_D.',
  gen: (r, t) => genPD(r, !!t),
  enun: (P, h) => `<p>Con realimentación unitaria y</p>${h.tx(GTeX(P), true)}${sinComp(P, h)}<p>Se pide el <b>mismo sobrepaso con un tiempo de asentamiento ${P.Fx} veces menor</b> usando un PD ideal ${h.tx('G_c(s) = s + z_c')}.</p>`,
  inc: [
    incFast('a'),
    { k: 'b', q: (P, h) => `Suma de ángulos de la planta en ${h.tx('s_d')}: ${h.tx('\\angle G(s_d)')}, y el ángulo ${h.tx('\\theta_z')} que debe aportar el cero para llegar a −180° (entre 0° y 180°).`,
      tools: () => [{ app: 'cplx' }],
      f: [{ k: 'g', l: '∠G(s<sub>d</sub>)', u: '°', ang: true }, { k: 'tz', l: 'θ<sub>z</sub>', u: '°', ang: true }],
      sol: (P, A) => { const g = angG(P, sdOf(A)); return { g, tz: n360(-180 - g) }; },
      how: (P, A, S, h) => `${h.tx(`\\begin{aligned}\\angle G(s_d) &= ${angList(P, sdOf(A), h)} \\\\ &= ${angVals(P, sdOf(A), h)} = {${h.n(S.g)}}^\\circ \\\\ \\theta_z &= -180^\\circ - ({${h.n(S.g)}}^\\circ) = {${h.n(S.tz)}}^\\circ\\end{aligned}`, true)}` },
    { k: 'c', q: (P, h) => `Ubicación del cero: ${h.tx('z_c = \\sigma_d + \\dfrac{\\omega_d}{\\tan\\theta_z}')}.`, f: [{ k: 'zc', l: 'z<sub>c</sub>' }],
      sol: (P, A) => ({ zc: A.sg + A.wd / tanD(A.tz) }),
      how: (P, A, S, h) => `${h.tx(`z_c = ${h.n(A.sg)} + \\dfrac{${h.n(A.wd)}}{\\tan(${h.n(A.tz)}^\\circ)} = ${h.n(A.sg)} ${A.tz > 90 ? '-' : '+'} ${h.n(Math.abs(A.wd / tanD(A.tz)))} = ${h.n(S.zc)}`, true)}<p>${A.tz > 90 ? 'Con θ<sub>z</sub> > 90° la tangente es negativa: el cero queda a la <b>derecha</b> de σ<sub>d</sub>.' : 'Con θ<sub>z</sub> < 90° el cero queda a la izquierda de σ<sub>d</sub>.'}</p>` },
    { k: 'd', q: (P, h) => `Ubica en el plano el <b>cero del PD</b> (○) y el <b>punto de diseño</b> ${h.tx('s_d')} (•; su conjugado se pone solo).`,
      f: P => [{ k: 'pt', l: 'Cero y s<sub>d</sub>', plane: true, marks: ['o', '.'], sym: true, snap: 0.25, abs: 0.15, tol: 0.02, max: 4, view: viewPts([P.sdd], [-P.zc, ...P.p.map(v => -v)]) }],
      sol: (P, A) => ({ pt: [{ t: 'o', re: -A.zc, im: 0 }, { t: '.', re: -A.sg, im: A.wd }, { t: '.', re: -A.sg, im: -A.wd }] }),
      how: (P, A, S, h) => `<p>Cero en ${h.tx(`s = -${h.n(A.zc)}`)} y ${h.tx(s0TeX({ re: -A.sg, im: A.wd }, h, 's_d'))}. Con el cero, el LGDR se dobla hacia la izquierda y pasa por ${h.tx('s_d')}.</p>` },
    { k: 'e', q: (P, h) => `Ganancia con la condición de magnitud: ${h.tx('K = \\dfrac{\\prod|s_d + p_i|}{|s_d + z_c|\\prod|s_d + z_i|}')}.`,
      tools: () => [{ app: 'cplx' }], f: [{ k: 'K', l: 'K' }],
      sol: (P, A) => ({ K: magK({ p: P.p, z: P.z.concat([A.zc]) }, sdOf(A)) }),
      how: (P, A, S, h) => { const s = sdOf(A); return h.tx(`K = \\dfrac{${P.p.map(p => h.n(dist(s, p))).join('\\cdot')}}{${h.n(dist(s, A.zc))}} = ${h.n(S.K)}`, true); } },
    { k: 'f', q: (P, h) => `Forma de ganancias del controlador: ${h.tx('K(s + z_c) = K_D\\,s + K_P')}.`,
      f: [{ k: 'kp', l: 'K<sub>P</sub>' }, { k: 'kd', l: 'K<sub>D</sub>' }],
      sol: (P, A) => ({ kp: A.K * A.zc, kd: A.K }),
      how: (P, A, S, h) => `${h.tx(`K_D = K = ${h.n(S.kd)},\\qquad K_P = K\\,z_c = ${h.n(A.K)}\\cdot${h.n(A.zc)} = ${h.n(S.kp)}`, true)}<p>El PD ideal amplifica el ruido de alta frecuencia (|K·G<sub>c</sub>(jω)| crece con ω).</p>` }
  ]
};

/* ------------------------------------------------------------------ tema 13 · adelanto (P5) */
const exAd = {
  id: 'adelanto', tema: 13, t: 'Compensador de adelanto (P5)', d: 'Punto de diseño, ángulo que aporta el polo, ubicación del polo y K.',
  gen: (r, t) => genAd(r, !!t),
  enun: (P, h) => `<p>Con realimentación unitaria y</p>${h.tx(GTeX(P), true)}${sinComp(P, h)}<p>Se pide el <b>mismo sobrepaso con un tiempo de asentamiento ${P.Fx} veces menor</b> con un compensador de adelanto con el cero en ${h.tx(`-${h.n(P.zl)}`)}:</p>${h.tx(`G_c(s) = \\dfrac{s + ${h.n(P.zl)}}{s + p_c}`, true)}`,
  inc: [
    incFast('a'),
    { k: 'b', q: (P, h) => `Suma de ángulos de la planta <b>y del cero</b> del adelanto en ${h.tx('s_d')}, y el ángulo ${h.tx('\\theta_p')} que debe restar el polo para llegar a −180°.`,
      tools: () => [{ app: 'cplx' }],
      f: [{ k: 'g', l: '∑∠ en s<sub>d</sub>', u: '°', ang: true }, { k: 'tp', l: 'θ<sub>p</sub>', u: '°', ang: true }],
      sol: (P, A) => { const g = angG({ p: P.p, z: P.z.concat([P.zl]) }, sdOf(A)); return { g, tp: n360(g + 180) }; },
      how: (P, A, S, h) => { const F = { p: P.p, z: P.z.concat([P.zl]) }; return `${h.tx(`\\begin{aligned}\\textstyle\\sum\\angle &= ${angList(F, sdOf(A), h)} \\\\ &= ${angVals(F, sdOf(A), h)} = {${h.n(S.g)}}^\\circ \\\\ \\theta_p &= {${h.n(S.g)}}^\\circ + 180^\\circ = {${h.n(S.tp)}}^\\circ\\end{aligned}`, true)}<p>El polo resta θ<sub>p</sub>: ${h.tx(`${h.n(S.g)} - ${h.n(S.tp)} = -180`)}.</p>`; } },
    { k: 'c', q: (P, h) => `Ubicación del polo: ${h.tx('p_c = \\sigma_d + \\dfrac{\\omega_d}{\\tan\\theta_p}')}.`, f: [{ k: 'pc', l: 'p<sub>c</sub>' }],
      sol: (P, A) => ({ pc: A.sg + A.wd / tanD(A.tp) }),
      how: (P, A, S, h) => h.tx(`p_c = ${h.n(A.sg)} + \\dfrac{${h.n(A.wd)}}{\\tan(${h.n(A.tp)}^\\circ)} = ${h.n(S.pc)}`, true) },
    { k: 'd', q: () => 'Ubica el <b>polo (×)</b> y el <b>cero (○)</b> del compensador sobre el eje real.',
      f: P => [{ k: 'pz', l: 'Compensador', plane: true, marks: ['x', 'o'], real: true, snap: 0.5, abs: 0.25, tol: 0.02, max: 4, view: { x0: Math.floor(-P.pc) - 2, x1: 1, y0: -1.5, y1: 1.5 } }],
      sol: (P, A) => ({ pz: [{ t: 'x', re: -A.pc, im: 0 }, { t: 'o', re: -P.zl, im: 0 }] }),
      how: (P, A, S, h) => `<p>Polo en ${h.tx(`-${h.n(A.pc)}`)} y cero en ${h.tx(`-${h.n(P.zl)}`)}: el cero queda más cerca del origen que el polo, por eso aporta ángulo positivo neto (adelanto).</p>` },
    { k: 'e', q: (P, h) => `Ganancia: ${h.tx('K = \\dfrac{\\prod|s_d + p_i|\\cdot|s_d + p_c|}{|s_d + z_c|}')}.`,
      tools: () => [{ app: 'cplx' }], f: [{ k: 'K', l: 'K' }],
      sol: (P, A) => ({ K: magK({ p: P.p.concat([A.pc]), z: P.z.concat([P.zl]) }, sdOf(A)) }),
      how: (P, A, S, h) => { const s = sdOf(A); return `${h.tx(`K = \\dfrac{${P.p.concat([A.pc]).map(p => h.n(dist(s, p))).join('\\cdot')}}{${h.n(dist(s, P.zl))}} = ${h.n(S.K)}`, true)}<p>Falta verificar con la simulación: el tercer polo del lazo cerrado puede cambiar el sobrepaso (tema 14).</p>`; } }
  ]
};

/* ------------------------------------------------------------------ tema 13 · PID (P6) */
const exPID = {
  id: 'pid', tema: 13, t: 'Compensador PID (P6)', d: 'PD para el T_p, PI para el error y ganancias K_P, K_I, K_D.',
  gen: (r, t) => genPID(r, !!t),
  enun: (P, h) => `<p>Con realimentación unitaria y</p>${h.tx(GTeX(P), true)}${sinComp(P, h)}<p>Se pide el mismo sobrepaso, un <b>tiempo pico ${P.f < 0.6 ? 'de la mitad' : 'de 2/3'}</b> del actual y <b>error cero al escalón</b>. Se diseña primero un PD ideal ${h.tx('s + z_{PD}')} y luego un PI ideal ${h.tx(`\\dfrac{s + ${h.n(P.zpi)}}{s}`)}.</p>`,
  inc: [
    { k: 'a', q: (P, h) => `Tiempo pico sin compensar ${h.tx('T_p = \\pi/\\omega_d')}, la ${h.tx('\\omega_d')} del punto de diseño (${h.tx(`T_{p,d} = ${P.f < 0.6 ? '\\tfrac12' : '\\tfrac23'}T_p`)}) y su ${h.tx('\\sigma_d = \\omega_d/\\tan\\theta')}.`,
      f: [{ k: 'tp', l: 'T<sub>p</sub> sin compensar', u: 's' }, { k: 'wd', l: 'ω<sub>d</sub>' }, { k: 'sg', l: 'σ<sub>d</sub>' }],
      sol: P => ({ tp: P.tp0, wd: P.wdd, sg: P.sgd }),
      how: (P, A, S, h) => h.tx(`\\begin{aligned}T_p &= \\dfrac{\\pi}{${h.n(P.s0.im)}} = ${h.n(S.tp)}\\ \\text{s} \\\\ T_{p,d} &= ${h.n(P.f)}\\cdot${h.n(S.tp)} = ${h.n(P.tpd)}\\ \\text{s} \\\\ \\omega_d &= \\dfrac{\\pi}{T_{p,d}} = ${h.n(S.wd)} \\\\ \\sigma_d &= \\dfrac{${h.n(S.wd)}}{\\tan(${h.n(Math.acos(P.z_) * DEG)}^\\circ)} = ${h.n(S.sg)}\\end{aligned}`, true) },
    { k: 'b', q: (P, h) => `${h.tx('\\angle G(s_d)')} (planta con su cero) y el ángulo ${h.tx('\\theta_z')} que debe aportar el cero del PD.`,
      tools: () => [{ app: 'cplx' }],
      f: [{ k: 'g', l: '∠G(s<sub>d</sub>)', u: '°', ang: true }, { k: 'tz', l: 'θ<sub>z</sub>', u: '°', ang: true }],
      sol: (P, A) => { const g = angG(P, sdOf(A)); return { g, tz: n360(-180 - g) }; },
      how: (P, A, S, h) => h.tx(`\\begin{aligned}\\angle G(s_d) &= ${angList(P, sdOf(A), h)} \\\\ &= ${angVals(P, sdOf(A), h)} = {${h.n(S.g)}}^\\circ \\\\ \\theta_z &= -180^\\circ - ({${h.n(S.g)}}^\\circ) = {${h.n(S.tz)}}^\\circ\\end{aligned}`, true) },
    { k: 'c', q: (P, h) => `Cero del PD ${h.tx('z_{PD} = \\sigma_d + \\omega_d/\\tan\\theta_z')} y la ganancia del diseño PD ${h.tx('K_{PD}')} (condición de magnitud).`,
      f: [{ k: 'zpd', l: 'z<sub>PD</sub>' }, { k: 'kpd', l: 'K<sub>PD</sub>' }],
      sol: (P, A) => { const zpd = A.sg + A.wd / tanD(A.tz); return { zpd, kpd: magK({ p: P.p, z: P.z.concat([zpd]) }, sdOf(A)) }; },
      how: (P, A, S, h) => { const s = sdOf(A); return h.tx(`\\begin{aligned}z_{PD} &= ${h.n(A.sg)} + \\dfrac{${h.n(A.wd)}}{\\tan(${h.n(A.tz)}^\\circ)} = ${h.n(S.zpd)} \\\\ K_{PD} &= \\dfrac{${P.p.map(p => h.n(dist(s, p))).join('\\cdot')}}{${P.z.concat([S.zpd]).map(z => h.n(dist(s, z))).join('\\cdot')}} = ${h.n(S.kpd)}\\end{aligned}`, true); } },
    { k: 'd', q: (P, h) => `Se agrega el PI y, re‑buscando sobre la recta de ζ, queda ${h.tx(`K = ${h.n(P.K)}`)}. Escribe el PID como ${h.tx(`K\\dfrac{(s + z_{PD})(s + ${h.n(P.zpi)})}{s} = K_P + \\dfrac{K_I}{s} + K_D s`)}.`,
      f: [{ k: 'k1', l: 'K<sub>P</sub>' }, { k: 'k2', l: 'K<sub>I</sub>' }, { k: 'k3', l: 'K<sub>D</sub>' }],
      sol: (P, A) => ({ k1: P.K * (A.zpd + P.zpi), k2: P.K * A.zpd * P.zpi, k3: P.K }),
      how: (P, A, S, h) => h.tx(`\\begin{aligned}K_P &= K(z_{PD} + z_{PI}) = ${h.n(P.K)}(${h.n(A.zpd)} + ${h.n(P.zpi)}) = ${h.n(S.k1)} \\\\ K_I &= K\\,z_{PD}\\,z_{PI} = ${h.n(S.k2)} \\\\ K_D &= K = ${h.n(S.k3)}\\end{aligned}`, true) },
    { k: 'e', q: () => 'Con el PID: tipo del sistema y error ante el escalón unitario.',
      f: [{ k: 'N', l: 'Tipo', abs: 0.01 }, { k: 'ec', l: 'e(∞)' }],
      sol: P => ({ N: typeOf(P.F), ec: P.err.e }),
      how: (P, A, S, h) => `<p>Sin compensar ${h.tx(`K_p = ${h.n(P.kp0)}`)} y ${h.tx(`e(\\infty) = ${h.n(P.eu)}`)}. El PI del PID agrega el polo en el origen: tipo 1 y ${h.tx('e(\\infty) = 0')}.</p>` }
  ]
};

/* ------------------------------------------------------------------ tema 13 · adelanto‑atraso (P7) */
const exAA = {
  id: 'adatr', tema: 13, t: 'Compensador de adelanto‑atraso (P7)', d: 'Adelanto para el T_s, atraso para el error y su efecto en s_d.',
  gen: (r, t) => genAA(r, !!t),
  enun: (P, h) => `<p>Con realimentación unitaria y</p>${h.tx(GTeX(P), true)}${sinComp(P, h)}<p>Se pide el mismo sobrepaso, un <b>T<sub>s</sub> ${P.Fx} veces menor</b> y el <b>error a la rampa ${P.M} veces menor</b>. Primero un adelanto con el cero en ${h.tx(`-${h.n(P.zl)}`)} y luego un atraso con el polo en ${h.tx(`-${h.n(P.pa)}`)}:</p>${h.tx(`G_c(s) = \\dfrac{s + ${h.n(P.zl)}}{s + p_{ad}}\\cdot\\dfrac{s + z_{at}}{s + ${h.n(P.pa)}}`, true)}`,
  inc: [
    { k: 'a', q: (P, h) => `Punto de diseño: ${h.tx(`\\sigma_d = ${P.Fx}\\sigma`)} (porque ${h.tx('T_s = 4/\\sigma')}) y ${h.tx('\\omega_d = \\sigma_d\\tan\\theta')}.`,
      f: [{ k: 'sg', l: 'σ<sub>d</sub>' }, { k: 'wd', l: 'ω<sub>d</sub>' }],
      sol: P => ({ sg: P.sgd, wd: P.wdd }),
      how: (P, A, S, h) => h.tx(`\\sigma_d = ${P.Fx}\\cdot${h.n(-P.s0.re)} = ${h.n(S.sg)},\\qquad \\omega_d = ${h.n(S.sg)}\\tan(${h.n(Math.acos(P.z_) * DEG)}^\\circ) = ${h.n(S.wd)}`, true) },
    { k: 'b', q: (P, h) => `Adelanto: ángulo ${h.tx('\\theta_p')} que debe restar su polo (suma de planta + cero, más 180°) y su ubicación ${h.tx('p_{ad}')}.`,
      tools: () => [{ app: 'cplx' }],
      f: [{ k: 'tp', l: 'θ<sub>p</sub>', u: '°', ang: true }, { k: 'pad', l: 'p<sub>ad</sub>' }],
      sol: (P, A) => { const tp = n360(angG({ p: P.p, z: P.z.concat([P.zl]) }, sdOf(A)) + 180); return { tp, pad: A.sg + A.wd / tanD(tp) }; },
      how: (P, A, S, h) => { const F = { p: P.p, z: P.z.concat([P.zl]) }; return h.tx(`\\begin{aligned}\\textstyle\\sum\\angle &= ${angVals(F, sdOf(A), h)} = {${h.n(angG(F, sdOf(A)))}}^\\circ \\\\ \\theta_p &= {${h.n(S.tp)}}^\\circ \\\\ p_{ad} &= ${h.n(A.sg)} + \\dfrac{${h.n(A.wd)}}{\\tan(${h.n(S.tp)}^\\circ)} = ${h.n(S.pad)}\\end{aligned}`, true); } },
    { k: 'c', q: (P, h) => `Ganancia con el adelanto ${h.tx('K_{ad}')} (magnitud en ${h.tx('s_d')}) y su ${h.tx('K_v')}.`,
      tools: () => [{ app: 'cplx' }],
      f: [{ k: 'kad', l: 'K<sub>ad</sub>' }, { k: 'kva', l: 'K<sub>v</sub>' }],
      sol: (P, A) => { const kad = magK({ p: P.p.concat([A.pad]), z: P.z.concat([P.zl]) }, sdOf(A)); return { kad, kva: kad * P.zl / (prodN(nz(P.p)) * A.pad) }; },
      how: (P, A, S, h) => { const s = sdOf(A); return h.tx(`\\begin{aligned}K_{ad} &= \\dfrac{${P.p.concat([A.pad]).map(p => h.n(dist(s, p))).join('\\cdot')}}{${h.n(dist(s, P.zl))}} = ${h.n(S.kad)} \\\\ K_v &= \\dfrac{${h.n(S.kad)}\\cdot${h.n(P.zl)}}{${nz(P.p).join('\\cdot')}\\cdot${h.n(A.pad)}} = ${h.n(S.kva)}\\end{aligned}`, true); } },
    { k: 'd', q: (P, h) => `Atraso: la ${h.tx('K_v')} requerida (${P.M} veces la sin compensar, ${h.tx(`K_v = ${h.n(P.kv0)}`)}), la razón ${h.tx('z_{at}/p_{at}')} que falta y el cero ${h.tx('z_{at}')}.`,
      f: [{ k: 'kvr', l: 'K<sub>v</sub> requerida' }, { k: 'rt', l: 'z<sub>at</sub>/p<sub>at</sub>' }, { k: 'za', l: 'z<sub>at</sub>' }],
      sol: (P, A) => { const kvr = P.M * P.kv0, rt = kvr / A.kva; return { kvr, rt, za: rt * P.pa }; },
      how: (P, A, S, h) => h.tx(`\\begin{aligned}K_{v,req} &= ${P.M}\\cdot${h.n(P.kv0)} = ${h.n(S.kvr)} \\\\ \\dfrac{z_{at}}{p_{at}} &= \\dfrac{${h.n(S.kvr)}}{${h.n(A.kva)}} = ${h.n(S.rt)} \\\\ z_{at} &= ${h.n(S.rt)}\\cdot${h.n(P.pa)} = ${h.n(S.za)}\\end{aligned}`, true) },
    { k: 'e', q: (P, h) => `¿Cuánto mueve el atraso el punto de diseño? ${h.tx('\\angle\\dfrac{s_d + z_{at}}{s_d + p_{at}}')}.`,
      tools: () => [{ app: 'cplx' }], f: [{ k: 'an', l: '∠ del atraso', u: '°', ang: true, abs: 0.15 }],
      sol: (P, A) => ({ an: argD(sdOf(A), A.za) - argD(sdOf(A), P.pa) }),
      how: (P, A, S, h) => h.tx(`{${h.n(argD(sdOf(A), A.za))}}^\\circ - {${h.n(argD(sdOf(A), P.pa))}}^\\circ = {${h.n(S.an)}}^\\circ`, true) },
    { k: 'f', q: () => '¿El atraso casi no cambia el transitorio que logró el adelanto (|∠| < 5°)?',
      f: [{ k: 'ok', l: 'Respuesta', ch: [{ v: 1, l: 'Sí' }, { v: 0, l: 'No' }] }],
      sol: (P, A) => ({ ok: Math.abs(A.an) < 5 ? 1 : 0 }),
      how: (P, A, S, h) => `<p>${S.ok ? 'Sí' : 'No'}: aporta ${h.f(A.an)}°. Re‑buscando con los dos compensadores queda ${h.tx(`K = ${h.n(P.K)}`)} en ${h.tx(s0TeX(P.sd, h, 's'))}; falta verificar el ${h.tx('T_s')} con la simulación (tema 14).</p>` }
  ]
};

/* =====================================================================================================
   Tema 14 · verificación del diseño
   ===================================================================================================== */
const CASOS = [2, 3, 4, 5, 6, 7];
const designTxt = (P, h) => `<p><b>${P.caso ? 'Práctica ' + P.caso.slice(1) + ' · ' : ''}${TN[P.tipo]}.</b> Con realimentación unitaria:</p>${h.tx(GTeX(P), true)}${h.tx(gcTeX(P.gc, h), true)}${h.tx(`K = ${h.n(P.K)}`, true)}`;
/* modos: el par dominante (el complejo más cercano a s_d) y el polo real más lento */
function modes(P){
  const S = simStep(P.F, P.K), idx = S.pl.map((w, i) => i);
  const cx = idx.filter(i => S.pl[i].im > 1e-9).sort((a, b) => Math.hypot(S.pl[a].re - P.sd.re, S.pl[a].im - P.sd.im) - Math.hypot(S.pl[b].re - P.sd.re, S.pl[b].im - P.sd.im));
  const re = idx.filter(i => !S.pl[i].im).sort((a, b) => S.pl[b].re - S.pl[a].re);
  return { S, dom: cx[0], slow: re[0], nCx: cx.length };
}
const verifpol = {
  id: 'verifpol', tema: 14, t: 'Verificación: ecuación final, polos y modos', d: 'Ecuación del lazo cerrado, polos en el plano, estabilidad, ζ obtenido y peso del modo extra.',
  casos: CASOS,
  gen(r, tarea){
    const P = caso(r, tarea, Q => { const m = modes(Q); return m.nCx === 1 && m.slow != null; });
    const m = modes(P); P.S = m.S; P.dom = m.S.pl[m.dom]; P.rd = m.S.rs[m.dom]; P.p3 = m.S.pl[m.slow].re; P.r3 = m.S.rs[m.slow].re;
    return P;
  },
  enun: (P, h) => `${designTxt(P, h)}<p>El diseño buscaba el par dominante en ${h.tx(s0TeX(P.sd, h, 's_d'))}. Verifica el modelo completo (guía: «Verificación del sistema completo», pasos 1–3).</p>`,
  inc: [
    { k: 'a', q: (P, h) => `Ecuación característica ${h.tx('D(s)D_c(s) + K\\,N(s)N_c(s) = 0')} en forma ${h.tx(`s^{${P.ch.length - 1}} + \\dots`)}: escribe sus coeficientes.`,
      f: P => Array.from({ length: P.ch.length - 1 }, (_, i) => { const e = P.ch.length - 2 - i; return { k: 'b' + e, l: powLbl('b', e) + (e ? ` (s<sup>${e}</sup>)` : '') }; }),
      sol: P => { const o = {}; P.ch.slice(1).forEach((v, i) => { o['b' + (P.ch.length - 2 - i)] = v; }); return o; },
      how: (P, A, S, h) => `${h.tx(`\\begin{aligned}&${den(P.p)}${P.gc.p.map(fac).join('')} \\\\ &\\quad + ${h.n(P.K)}${P.z.concat(P.gc.z).map(fac).join('') || ''} \\\\ &= ${polyTeX(P.ch, h)}\\end{aligned}`, true)}<p>En MATLAB: <code>T = feedback(K*Gc*G, 1); [n, d] = tfdata(T, 'v')</code> → <code>d</code>.</p>` },
    { k: 'b', q: () => 'Ubica <b>todos los polos de lazo cerrado</b> (×).',
      tools: P => [{ app: 'eqn', n: P.ch.length - 1 }],
      f: P => [{ k: 'cl', l: 'Polos de T(s)', plane: true, marks: ['x'], sym: true, snap: 0.25, abs: 0.15, tol: 0.02, max: 6, view: P.view }],
      sol: (P, A) => { const c = [1].concat(Array.from({ length: P.ch.length - 1 }, (_, i) => A['b' + (P.ch.length - 2 - i)])); return { cl: roots(c).map(w => ({ t: 'x', re: w.re, im: w.im })) }; },
      how: (P, A, S, h) => `<p>Raíces: ${h.tx(rootsTeX(S.cl.map(w => ({ re: w.re, im: w.im })), h))}. En MATLAB: <code>pole(T)</code>.</p>` },
    { k: 'c', q: () => '¿El lazo cerrado es estable con esa K?',
      f: [{ k: 'st', l: 'Respuesta', ch: [{ v: 1, l: 'Sí' }, { v: 0, l: 'No' }] }],
      sol: (P, A) => { const c = [1].concat(Array.from({ length: P.ch.length - 1 }, (_, i) => A['b' + (P.ch.length - 2 - i)])); return { st: roots(c).every(w => w.re < 0) ? 1 : 0 }; },
      how: (P, A, S, h) => `<p>${S.st ? '<b>Sí</b>: todos los polos tienen parte real negativa.' : '<b>No</b>: hay polos con parte real ≥ 0.'} (Con Routh: todos los coeficientes positivos y la primera columna sin cambios de signo.)</p>` },
    { k: 'd', q: (P, h) => `ζ del par dominante que resultó: ${h.tx('\\zeta = \\sigma/|s|')} (el par complejo más cercano a ${h.tx('s_d')}).`,
      f: [{ k: 'z', l: 'ζ obtenido' }],
      sol: P => ({ z: -P.dom.re / cAbs(P.dom) }),
      how: (P, A, S, h) => `${h.tx(`\\zeta = \\dfrac{${h.n(-P.dom.re)}}{\\sqrt{${h.n(P.dom.re)}^2 + ${h.n(P.dom.im)}^2}} = ${h.n(S.z)}`, true)}<p>El de diseño es ${h.tx(`\\zeta = ${h.n(P.z_)}`)}${Math.abs(S.z / P.z_ - 1) < 0.02 ? ': el par quedó donde se diseñó.' : '.'}</p>` },
    { k: 'e', q: (P, h) => `MATLAB (<code>residue</code> de C(s) = T(s)/s) da el residuo del par dominante ${h.tx(`r_1 = ${h.n(P.rd.re)} ${P.rd.im < 0 ? '-' : '+'} j${h.n(Math.abs(P.rd.im))}`)} y el del polo real más lento ${h.tx(`r_3 = ${h.n(P.r3)}`)}. Escribe ese polo ${h.tx('p_3')} y la razón ${h.tx('|r_3|/|r_1|')}.`,
      f: [{ k: 'p3', l: 'p<sub>3</sub>' }, { k: 'rr', l: '|r<sub>3</sub>|/|r<sub>1</sub>|' }],
      sol: P => ({ p3: P.p3, rr: Math.abs(P.r3) / cAbs(P.rd) }),
      how: (P, A, S, h) => h.tx(`p_3 = ${h.n(S.p3)},\\qquad \\dfrac{|r_3|}{|r_1|} = \\dfrac{${h.n(Math.abs(P.r3))}}{${h.n(cAbs(P.rd))}} = ${h.n(S.rr)}`, true) },
    { k: 'f', q: () => '¿Qué dice el modo de p<sub>3</sub>? (regla de la página: si |r<sub>3</sub>| < 12 % de |r<sub>1</sub>| casi se cancela)',
      f: [{ k: 'md', l: 'Respuesta', ch: [{ v: 1, l: 'Casi se cancela: vale el 2.º orden' }, { v: 0, l: 'Pesa: hay que simular' }] }],
      sol: (P, A) => ({ md: A.rr < 0.12 ? 1 : 0 }),
      how: (P, A, S, h) => { const zz = P.z.concat(P.gc.z), zn = zz.length ? zz.reduce((a, z) => Math.abs(-z - P.p3) < Math.abs(-a - P.p3) ? z : a) : null;
        return `<p>${h.f(A.rr * 100)} % ${A.rr < 0.12 ? '< 12 %: el modo casi no aparece en la respuesta.' : '≥ 12 %: el modo se nota (sobrepaso o asentamiento distintos a los del 2.º orden), así que la simulación manda.'}${zn != null ? ` El cero más cercano está en ${h.tx(`-${h.n(zn)}`)}.` : ''}</p>`; } }
  ]
};

/* simulación contra las metas */
const CH3 = [{ v: 2, l: 'Cumple' }, { v: 1, l: 'Casi (≤ 5 % arriba)' }, { v: 0, l: 'No cumple' }];
const judge = (got, meta) => meta <= 1e-12 ? (got <= 1e-6 ? 2 : 0) : got <= meta * 1.01 ? 2 : got <= meta * 1.05 ? 1 : 0;
const metaName = k => ({ e0: 'e(∞) al escalón', e: 'e(∞) a la rampa', ts: 'T<sub>s</sub>', tp: 'T<sub>p</sub>' }[k]);
function figStep(si, P){
  const W = 380, H = 200, L = 30, R = 8, T = 10, B = 22, tE = P.tE;
  const yM = Math.max(si.cmax, si.cf) * 1.15, X = t => (L + (W - L - R) * t / tE).toFixed(1), Y = v => (T + (H - T - B) * (1 - v / yM)).toFixed(1);
  let d = ''; for (let i = 0; i <= 360; i++) { const t = tE * i / 360; d += (i ? 'L' : 'M') + X(t) + ' ' + Y(si.c(t)); }
  let st = 0.05; for (const s of [0.05, 0.1, 0.2, 0.25, 0.5, 1, 2, 5, 10, 20, 50, 100, 200]) { st = s; if (tE / s <= 6) break; }
  let tk = ''; for (let t = 0; t <= tE + 1e-9; t += st) tk += `<path class="fg-g" d="M${X(t)} ${T}V${H - B}"/><text x="${X(t)}" y="${H - 7}" text-anchor="middle">${n4(t)}</text>`;
  for (let v = 0; v <= yM; v += 0.5) tk += `<text x="${L - 4}" y="${(+Y(v) + 4).toFixed(1)}" text-anchor="end">${n4(v)}</text>`;
  const b1 = Y(si.cf * 1.02), b0 = Y(si.cf * 0.98);
  let s = `<g class="fg-tk">${tk}</g><rect class="fg-b" x="${L}" y="${b1}" width="${W - L - R}" height="${(b0 - b1).toFixed(1)}"/><path class="fg-ax" d="M${L} ${T}V${H - B}H${W - R}"/><path class="fg-f" d="M${L} ${Y(si.cf)}H${W - R}"/>`;
  if (si.ts > 0 && si.ts <= tE) s += `<path class="fg-f" d="M${X(si.ts)} ${T}V${H - B}"/><text class="fg-t" x="${(+X(si.ts) + 4).toFixed(1)}" y="${H - B - 6}">T<tspan baseline-shift="sub" font-size="8">s</tspan></text>`;
  s += `<path class="fg-c" d="${d}"/>`;
  if (si.os > 0.05) s += `<circle class="fg-m" cx="${X(si.tp)}" cy="${Y(si.cmax)}" r="4"/><text class="fg-t" x="${(+X(si.tp) + 7).toFixed(1)}" y="${(+Y(si.cmax) - 4).toFixed(1)}">pico</text>`;
  return `<figure class="en-fig"><svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="Respuesta al escalón">${s}</svg><figcaption>Respuesta al escalón unitario (modelo completo). ${si.os > 0.05 ? `Pico: <b>c<sub>max</sub> = ${si.cmax.toFixed(4)}</b> en <b>t = ${si.tp.toFixed(3)} s</b> · ` : ''}valor final <b>${si.cf.toFixed(4)}</b> · entra y se queda en la banda de ±2 % en <b>T<sub>s</sub> = ${si.ts.toFixed(3)} s</b>.</figcaption></figure>`;
}
const metaTxt = (P, h) => { const m = P.meta;
  const two = m.k === 'ts' ? `${h.tx(`T_s \\le T_{s,\\text{sin}}/${P.Fx}`)}, con ${h.tx(`T_{s,\\text{sin}} = ${h.n(P.ts0 || 4 / -P.s0.re)}\\ \\text{s}`)}`
    : m.k === 'tp' ? `${h.tx(`T_p \\le ${P.f < 0.6 ? '\\tfrac12' : '\\tfrac23'}T_{p,\\text{sin}}`)}, con ${h.tx(`T_{p,\\text{sin}} = ${h.n(P.tp0)}\\ \\text{s}`)}`
    : m.k === 'e' ? `error a la rampa ${P.M} veces menor que sin compensar (${h.tx(`e_{\\text{sin}} = ${h.n(P.eu)}`)})` : 'error cero al escalón';
  return `<p><b>Metas:</b> sobrepaso ${h.tx(`\\%OS \\le ${h.n(P.os)}\\,\\%`)} y ${two}.</p>`; };
const verifsim = {
  id: 'verifsim', tema: 14, t: 'Verificación con la simulación y ajuste', d: 'Lee la respuesta al escalón, compárala con las metas y decide si hace falta ajustar.',
  casos: CASOS,
  gen(r, tarea){
    let P;
    for (let g = 0; g < 40; g++) {
      P = caso(r, tarea); P.si = simStep(P.F, P.K);
      if (tarea) break;
      const v2 = P.meta.k === 'ts' ? P.si.ts : P.meta.k === 'tp' ? P.si.tp : P.err.e, rs = [P.si.os / P.os, P.meta.v ? v2 / P.meta.v : 0];
      if (rs.every(x => Math.abs(x - 1.01) > 0.006 && Math.abs(x - 1.05) > 0.006) && P.si.os > 0.3) break;
    }
    const si = P.si; P.tE = Math.min(si.H, Math.max(si.ts * 1.35, si.tp * 3));
    return P;
  },
  enun: (P, h) => `${designTxt(P, h)}${metaTxt(P, h)}${figStep(P.si, P)}<p class="en-mut">Criterio de la página: <b>cumple</b> si queda dentro de la meta (±1 %), <b>casi</b> si se pasa hasta 5 %, y <b>no cumple</b> si se pasa más.</p>`,
  inc: [
    { k: 'a', q: (P, h) => `Sobrepaso obtenido: ${h.tx('\\%OS = \\dfrac{c_{max} - c_{final}}{c_{final}}\\cdot100')}.`,
      f: [{ k: 'os', l: '%OS', u: '%', abs: 0.05 }],
      sol: P => ({ os: (+P.si.cmax.toFixed(4) - +P.si.cf.toFixed(4)) / +P.si.cf.toFixed(4) * 100 }),
      how: (P, A, S, h) => `${h.tx(`\\%OS = \\dfrac{${P.si.cmax.toFixed(4)} - ${P.si.cf.toFixed(4)}}{${P.si.cf.toFixed(4)}}\\cdot100 = ${h.n(S.os)}\\,\\%`, true)}<p>En MATLAB: <code>stepinfo(T)</code> → <code>Overshoot</code>.</p>` },
    { k: 'b', q: (P, h) => `¿Cumple la meta de sobrepaso (${h.tx(`\\le ${h.n(P.os)}\\,\\%`)})?`,
      f: [{ k: 'c1', l: 'Sobrepaso', ch: CH3 }],
      sol: (P, A) => ({ c1: judge(A.os, P.os) }),
      how: (P, A, S, h) => `<p>${h.f(A.os)} % contra ${h.f(P.os)} %: ${['no cumple', 'casi (se pasa ' + h.f((A.os / P.os - 1) * 100) + ' %)', 'cumple'][S.c1]}.</p>` },
    { k: 'c', q: P => P.meta.k === 'e' ? 'Valor de la meta de error y el error que da el diseño (1/K<sub>v</sub> con el compensador).' : P.meta.k === 'e0' ? 'Error ante el escalón con el compensador (la meta es 0).' : `Valor de la meta de ${metaName(P.meta.k)} (en segundos).`,
      f: P => P.meta.k === 'e' ? [{ k: 'm2', l: 'e meta', abs: 1e-5 }, { k: 'eo', l: 'e(∞) del diseño', abs: 1e-5 }] : P.meta.k === 'e0' ? [{ k: 'eo', l: 'e(∞)' }] : [{ k: 'm2', l: `${metaName(P.meta.k)} meta`, u: 's' }],
      sol: P => P.meta.k === 'e' ? { m2: P.meta.v, eo: P.err.e } : P.meta.k === 'e0' ? { eo: P.err.e } : { m2: P.meta.v },
      how: (P, A, S, h) => P.meta.k === 'e' ? h.tx(`e_{meta} = \\dfrac{${h.n(P.eu)}}{${P.M}} = ${h.n(S.m2)},\\qquad K_v = ${h.n(P.err.kk)} \\Rightarrow e = ${h.n(S.eo)}`, true)
        : P.meta.k === 'e0' ? `<p>El PI deja el sistema tipo 1: ${h.tx('e(\\infty) = 0')}.</p>`
        : P.meta.k === 'ts' ? h.tx(`T_{s,meta} = \\dfrac{${h.n(P.ts0)}}{${P.Fx}} = ${h.n(S.m2)}\\ \\text{s}`, true) : h.tx(`T_{p,meta} = ${h.n(P.f)}\\cdot${h.n(P.tp0)} = ${h.n(S.m2)}\\ \\text{s}`, true) },
    { k: 'd', q: P => `¿Cumple la meta de ${metaName(P.meta.k)}?${P.meta.k === 'ts' || P.meta.k === 'tp' ? ' (lee el valor obtenido en la gráfica)' : ''}`,
      f: P => [{ k: 'c2', l: metaName(P.meta.k), ch: CH3 }],
      sol: (P, A) => { const k = P.meta.k, got = k === 'ts' ? P.si.ts : k === 'tp' ? P.si.tp : A.eo; return { c2: judge(got, k === 'e0' ? 0 : A.m2) }; },
      how: (P, A, S, h) => { const k = P.meta.k, got = k === 'ts' ? P.si.ts : k === 'tp' ? P.si.tp : A.eo, mt = k === 'e0' ? 0 : A.m2;
        return `<p>Obtenido ${h.f(got)} contra meta ${h.f(mt)}: ${['no cumple', 'casi', 'cumple'][S.c2]}.</p>`; } },
    { k: 'e', q: () => '¿Qué ajuste hace falta?',
      f: [{ k: 'aj', l: 'Ajuste', ch: [{ v: 0, l: 'Ninguno: cumple (o casi) todo' }, { v: 1, l: 'Bajar el sobrepaso (más ζ de diseño, o dipolo más cerca del origen)' }, { v: 2, l: 'Hacerlo más rápido (T<sub>s</sub> o T<sub>p</sub> objetivo menor)' }, { v: 3, l: 'Mejorar el error (más razón del atraso)' }] }],
      sol: (P, A) => ({ aj: A.c1 === 0 ? 1 : A.c2 === 0 ? (P.meta.k === 'ts' || P.meta.k === 'tp' ? 2 : 3) : 0 }),
      how: (P, A, S, h) => `<p>${['Ninguno: las metas se cumplen (o casi), como en la página.', 'El sobrepaso se pasa de la meta: se rediseña con un ζ mayor (P5 lo hizo con ζ<sub>d</sub> = 0.6273) o, si es por el modo lento de un atraso, acercando el dipolo al origen (P3: 0.02/0.001).', 'El tiempo no llega a la meta: se rediseña pidiendo un T<sub>s</sub> (o T<sub>p</sub>) un poco menor, como el ajuste de P7.', 'El error no llega: se aumenta la razón z<sub>c</sub>/p<sub>c</sub> del atraso.'][S.aj]} Después se vuelve a verificar.</p>` }
  ]
};

/* =====================================================================================================
   Tema 15 · Simulink
   ===================================================================================================== */
function figSL(P){
  const bl = [{ t: 'Step', s: 'o Ramp' }, { t: 'Σ', s: 'Sum', c: 1 }, { t: 'K', s: 'Gain' }]
    .concat(P.blk.map(b => b.k === 'tf' ? { t: b.l, s: 'Transfer Fcn' } : { t: 'PID(s)', s: 'PID Controller' }), [{ t: 'G(s)', s: 'Transfer Fcn' }, { t: 'Scope', s: '', sc: 1 }]);
  const bw = 66, gap = 22, W = bl.length * (bw + gap) - gap + 12, H = 112, y = 18, bh = 38;
  let s = '', xs = [];
  bl.forEach((b, i) => { const x = 6 + i * (bw + gap); xs.push(x);
    if (b.c) s += `<circle class="sl-b" cx="${x + bw / 2}" cy="${y + bh / 2}" r="14"/><text class="sl-t" x="${x + bw / 2}" y="${y + bh / 2 + 4}" text-anchor="middle">Σ</text><text class="sl-s" x="${x + bw / 2 - 20}" y="${y + bh / 2 - 6}">+</text><text class="sl-s" x="${x + bw / 2 - 9}" y="${y + bh + 6}">−</text>`;
    else s += `<rect class="sl-b" x="${x}" y="${y}" width="${bw}" height="${bh}" rx="${b.sc ? 8 : 3}"/><text class="sl-t" x="${x + bw / 2}" y="${y + bh / 2 + 4}" text-anchor="middle">${b.t}</text>`;
    s += `<text class="sl-s" x="${x + bw / 2}" y="${y + bh + 18}" text-anchor="middle">${b.s}</text>`;
    if (i) { const x0 = xs[i - 1] + (bl[i - 1].c ? bw / 2 + 14 : bw), x1 = b.c ? x + bw / 2 - 14 : x; s += `<path class="sl-w" d="M${x0} ${y + bh / 2}H${x1 - 4}"/><path class="sl-a" d="M${x1 - 6} ${y + bh / 2 - 4}L${x1} ${y + bh / 2}L${x1 - 6} ${y + bh / 2 + 4}Z"/>`; } });
  const xg = xs[bl.length - 2] + bw + gap / 2, xc = xs[1] + bw / 2, yb = H - 6;
  s += `<path class="sl-w" d="M${xg} ${y + bh / 2}V${yb}H${xc}V${y + bh / 2 + 18}"/><path class="sl-a" d="M${xc - 4} ${y + bh / 2 + 20}L${xc} ${y + bh / 2 + 14}L${xc + 4} ${y + bh / 2 + 20}Z"/>`;
  return `<figure class="en-fig sl"><div class="sl-sc"><svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="Modelo de Simulink">${s}</svg></div><figcaption>Modelo a armar en Simulink (realimentación unitaria).</figcaption></figure>`;
}
const vecTxt = c => '[' + c.map(v => n4(v)).join(' ') + ']';
const simulink = {
  id: 'simulink', tema: 15, t: 'Simulink: parámetros de los bloques', d: 'Signos del Sum, Gain, vectores de los Transfer Fcn, PID Controller, fuente y error en el Scope.',
  casos: CASOS,
  gen: (r, tarea) => caso(r, tarea),
  enun: (P, h) => `${designTxt(P, h)}${figSL(P)}<p>Llena los parámetros de cada bloque. En los <b>Transfer Fcn</b> los vectores van de la potencia mayor a la menor (p. ej. ${h.tx('s^2 + 3s')} → <code>[1 3 0]</code>). ${P.blk.some(b => b.k !== 'tf') ? 'El <b>PID Controller</b> (forma paralela, sin filtro) va normalizado porque la K ya está en el Gain.' : ''}</p>`,
  inc: [
    { k: 'a', q: () => 'Signos del bloque Sum (la referencia entra arriba/izquierda y la realimentación abajo).',
      f: [{ k: 'sg', l: 'List of signs', ch: [{ v: 0, l: '|+-' }, { v: 1, l: '|++' }, { v: 2, l: '|-+' }] }],
      sol: () => ({ sg: 0 }), how: () => '<p><code>|+-</code>: la referencia suma y la salida realimentada resta (e = r − c). Con <code>|++</code> la realimentación sería positiva.</p>' },
    { k: 'b', q: () => 'Valor del bloque Gain.', f: [{ k: 'K', l: 'Gain' }],
      sol: P => ({ K: P.K }), how: (P, A, S, h) => `<p>${h.tx(`K = ${h.n(P.K)}`)} (en MATLAB, <code>set_param('modelo/Gain', 'Gain', '${n4(P.K)}')</code>).</p>` },
    { k: 'c', q: () => 'Transfer Fcn de la <b>planta</b> (sin K): coeficientes de Numerator y Denominator.',
      f: P => { const N = polyOf(P.z), D = polyOf(P.p);
        return N.map((v, i) => ({ k: 'n' + i, l: `Num · s<sup>${N.length - 1 - i}</sup>` })).concat(D.map((v, i) => ({ k: 'd' + i, l: `Den · s<sup>${D.length - 1 - i}</sup>` }))); },
      sol: P => { const o = {}; polyOf(P.z).forEach((v, i) => { o['n' + i] = v; }); polyOf(P.p).forEach((v, i) => { o['d' + i] = v; }); return o; },
      how: (P, A, S, h) => `<p>Numerator <code>${vecTxt(polyOf(P.z))}</code> · Denominator <code>${vecTxt(polyOf(P.p))}</code>, porque ${h.tx(`${den(P.p)} = ${polyTeX(polyOf(P.p), h)}`)}. Otra forma: <code>conv([1 a],[1 b])</code>.</p>` },
    { k: 'd', q: P => P.blk.length > 1 ? 'Dos Transfer Fcn del compensador: en cada uno, Numerator [1 a] y Denominator [1 b].' : P.blk[0].k === 'tf' ? `Transfer Fcn del compensador (${P.blk[0].l}): Numerator [1 a] y Denominator [1 b].` : `PID Controller (${P.blk[0].k === 'pd' ? 'Controller: PD' : 'PID'}): sus ganancias normalizadas.`,
      f: P => P.blk[0].k === 'pd' ? [{ k: 'kP', l: 'P' }, { k: 'kD', l: 'D' }] : P.blk[0].k === 'pid' ? [{ k: 'kP', l: 'P' }, { k: 'kI', l: 'I' }, { k: 'kD', l: 'D' }]
        : P.blk.flatMap((b, i) => [{ k: 'a' + i, l: `${b.l}: a (Num [1 a])`, abs: 1e-4 }, { k: 'b' + i, l: `${b.l}: b (Den [1 b])`, abs: 1e-4 }]),
      sol: P => { const b = P.blk[0]; if (b.k === 'pd') return { kP: b.P, kD: b.D }; if (b.k === 'pid') return { kP: b.P, kI: b.I, kD: b.D };
        const o = {}; P.blk.forEach((q, i) => { o['a' + i] = q.z; o['b' + i] = q.p; }); return o; },
      how: (P, A, S, h) => { const b = P.blk[0];
        if (b.k === 'pd') return `<p>${h.tx(`s + ${h.n(b.P)} = P + D\\,s`)} → P = ${h.f(b.P)}, D = 1 (UseFilter = off). Un PD ideal en un Transfer Fcn daría error (más ceros que polos). Otra forma: Gain = 1 y P = K·z<sub>c</sub> = ${h.f(P.K * b.P)}, D = K = ${h.f(P.K)}.</p>`;
        if (b.k === 'pid') return `<p>${h.tx(`\\dfrac{(s + ${h.n(P.zpd)})(s + ${h.n(P.zpi)})}{s} = (z_{PD} + z_{PI}) + \\dfrac{z_{PD}z_{PI}}{s} + s`)} → P = ${h.f(b.P)}, I = ${h.f(b.I)}, D = 1. Otra forma: Gain = 1 y P/I/D = K<sub>P</sub>/K<sub>I</sub>/K<sub>D</sub> = ${h.f(P.K * b.P)}/${h.f(P.K * b.I)}/${h.f(P.K)}.</p>`;
        return `<p>${P.blk.map(q => `${q.l}: Numerator <code>[1 ${n4(q.z)}]</code>, Denominator <code>[1 ${n4(q.p)}]</code>`).join(' · ')}.</p>`; } },
    { k: 'e', q: () => '¿Qué fuente usas para verificar el error estacionario que pide el problema?',
      f: [{ k: 'src', l: 'Fuente', ch: [{ v: 0, l: 'Step (escalón)' }, { v: 1, l: 'Ramp (rampa)' }] }],
      sol: P => ({ src: P.q ? 1 : 0 }),
      how: (P, A, S, h) => `<p>La planta es tipo ${P.q}: ${P.q ? 'ante el escalón el error ya es cero; el error finito (K<sub>v</sub>) se mide con la <b>rampa</b> (Ramp, Slope = 1).' : 'el error finito es al <b>escalón</b> (K<sub>p</sub>).'} El transitorio (%OS, T<sub>s</sub>) siempre se mide con el escalón.</p>` },
    { k: 'f', q: (P, h) => `Con esa fuente, ¿a qué valor tiende ${h.tx('e(t) = r(t) - c(t)')} (sale de otro Sum a un Scope)?`,
      f: [{ k: 'e', l: 'e(∞)', abs: 1e-4 }],
      sol: P => ({ e: P.err.e }),
      how: (P, A, S, h) => `<p>${P.err.e === 0 ? `El lazo es tipo ${typeOf(P.F)}, mayor que el de la entrada: ${h.tx('e(\\infty) = 0')}.` : h.tx(P.q ? `K_v = ${h.n(P.err.kk)},\\quad e(\\infty) = 1/K_v = ${h.n(P.err.e)}` : `K_p = ${h.n(P.err.kk)},\\quad e(\\infty) = \\dfrac{1}{1+K_p} = ${h.n(P.err.e)}`)} Pon un Stop time suficiente para que se estabilice.</p>` }
  ]
};

/* orden: por tema (la página los agrupa por tema) */
export const EJ = [polos, plano, ecuacion, ejereal, asint, ruptura, routh, zeta, angulo, magnitud, lazo, transitoria, error,
  exPI, exAtr, exPD, exAd, exPID, exAA, verifpol, verifsim, simulink];
export const byId = id => EJ.find(e => e.id === id);
