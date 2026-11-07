/* =====================================================================================================
   entrenar/ejercicios.js · Temas y ejercicios del apartado «Entrenar» · etapa 1
   ---------------------------------------------------------------------------------------------------
   TEMAS = los 16 temas del plan (los que aún no tienen ejercicios dicen en qué etapa llegan).
   EJ    = ejercicios. Etapa 1 trae 4 de muestra, con el caso de la tarea de la P1 (G = K/[(s+2)(s+4)(s+6)]) y
           variantes aleatorias, para probar el motor: arrastre, ángulos, complejos y casillas que cambian con la variante.
   Formato de un ejercicio (lo lee entrenar/motor.js):
     {id, tema, t, d, gen(r, tarea) → P, enun(P,h) → html,
      inc:[{k, q(P,h) → html, f:[{k, l, u, tol, abs, ang}] | (P) → [...], sol(P, A) → {campo: valor}, how(P, A, S, h) → html}]}
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
    if (tarea) return { os: 10, sg: 2.0285 };
    return { os: r.int(4, 30), sg: r.step(0.8, 6, 0.1) };
  },
  enun: (P, h) => `<p>Se pide un sobrepaso de <b>${P.os} %</b>. El par dominante debe quedar sobre la recta de ${h.tx('\\zeta')} constante, en un punto con parte real ${h.tx(`-\\sigma = ${h.n(-P.sg)}`)}.</p>`,
  inc: [
    { k: 'a', q: () => 'Factor de amortiguamiento ζ.', f: [{ k: 'z', l: 'ζ' }],
      sol: P => { const L = Math.log(P.os / 100); return { z: -L / Math.sqrt(Math.PI ** 2 + L * L) }; },
      how: (P, A, S, h) => h.tx(`\\zeta = \\dfrac{-\\ln(${h.n(P.os / 100)})}{\\sqrt{\\pi^2 + \\ln^2(${h.n(P.os / 100)})}} = ${h.n(S.z)}`, true) },
    { k: 'b', q: (P, h) => `Ángulo de la recta medido desde el eje real negativo: ${h.tx('\\theta = \\cos^{-1}\\zeta')} (en grados).`, f: [{ k: 'th', l: 'θ', u: '°' }],
      sol: (P, A) => ({ th: Math.acos(Math.max(-1, Math.min(1, A.z != null ? A.z : zeta.inc[0].sol(P).z))) * 180 / Math.PI }),
      how: (P, A, S, h) => h.tx(`\\theta = \\cos^{-1}(${h.n(A.z != null ? A.z : zeta.inc[0].sol(P).z)}) = ${h.n(S.th)}^\\circ`, true) },
    { k: 'c', q: (P, h) => `Pendiente de la recta: ${h.tx('\\omega_d/\\sigma = \\tan\\theta')}.`, f: [{ k: 'tn', l: 'tan θ' }],
      sol: (P, A) => ({ tn: Math.tan((A.th != null ? A.th : 0) * Math.PI / 180) }),
      how: (P, A, S, h) => h.tx(`\\tan(${h.n(A.th)}^\\circ) = ${h.n(S.tn)}`, true) },
    { k: 'd', q: (P, h) => `Punto de la recta con parte real ${h.tx(`${h.n(-P.sg)}`)}: ¿cuánto vale ${h.tx('\\omega_d')}?`, f: [{ k: 'wd', l: 'ω<sub>d</sub>' }],
      sol: (P, A) => ({ wd: P.sg * A.tn }),
      how: (P, A, S, h) => `${h.tx(`\\omega_d = \\sigma\\tan\\theta = ${h.n(P.sg)}\\cdot${h.n(A.tn)} = ${h.n(S.wd)}`, true)}<p>Punto de prueba: ${h.tx(`s_0 = ${h.n(-P.sg)} \\pm j${h.n(S.wd)}`)}.</p>` }
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

export const EJ = [asint, routh, zeta, error];
export const byId = id => EJ.find(e => e.id === id);
