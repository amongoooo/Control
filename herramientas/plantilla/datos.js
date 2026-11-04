/* Datos de las 7 prácticas para la plantilla de reportes (Word).
   Valores de «Guía» tomados de la página (Laboratorio LGDR), que a su vez coinciden con el libro.
   Marcado en el texto: _x  _{xy} = subíndice · ^x  ^{xy} = superíndice · **negritas** · \_ = guion bajo literal.
   Ecuaciones (eq): \frac{a}{b}, ^{}, _{}, \sqrt{} (se convierten a ecuaciones de Word). */

const P = [];

/* ───────────────────────── Práctica 1 ───────────────────────── */
P.push({
  n: 1, tema: 'Ajuste de ganancia', ej: 'Ejercicio de evaluación de destreza 8.6', pag: 457,
  cap: '8. Técnicas del lugar geométrico de las raíces',
  claves: 'Lugar geométrico de las raíces, Ajuste de ganancia, Sobrepaso, Aproximación de segundo orden, MATLAB',
  resumen: 'Datos clave de la página: K = 45.53 sobre ζ = 0.591; polos −2.029 ± j2.768 y −7.943; la aproximación de segundo orden no es válida (tercer polo a 3.9σ); simulación 8.82 % de sobrepaso; K ajustada = 49.38 da 10.00 %.',
  obj: 'Ajustar únicamente la ganancia K de un sistema de tercer orden para obtener 10 % de sobrepaso; estimar con la aproximación de segundo orden T_s, T_p, T_r y e(∞) al escalón, y juzgar si esa aproximación es válida.',
  model: ['G(s)=\\frac{K}{(s+2)(s+4)(s+6)}', 'H(s)=1,  G_c(s)=1'],
  modelNota: 'Realimentación unitaria negativa. No hay compensador: el diseño consiste en elegir el punto del LGDR original donde quedan los polos.',
  cadena: 'Step → Sum (+ −) → Gain (K) → Transfer Fcn G(s) → Scope, con realimentación unitaria desde la salida al Sum.',
  specs: [['Sobrepaso', '%OS = 10 %', 'Fija ζ'], ['T_s, T_p, T_r', 'Estimar', '2.º orden y simulación'], ['e(∞) al escalón', 'Estimar', 'Tipo 0: 1/(1 + K_p)'], ['Validez de la aproximación', 'Juzgar', 'Tercer polo y residuos']],
  ref: {
    k: 'El enunciado no fija K: es la incógnita del diseño. No supongas K = 1 (con K = 1 los polos serían −2.139, −3.746 y −6.115, otro sistema). La referencia es la K del punto de diseño: K = 45.53.',
    polos: 'Polos de lazo abierto en −2, −4 y −6; sin ceros finitos (n = 3, m = 0). Tipo 0: error finito al escalón e infinito a la rampa.',
    eq: 's^3+12s^2+44s+(48+K)=0',
    forma: 'Eje real en [−4, −2] y (−∞, −6]; asíntotas σ_a = −4 con 60°, 180° y 300°; punto de ruptura en s = −2.845.',
    orden: 3,
    routh: 'Fila s^1 = (480 − K)/12 → estable para 0 < K < 480; cruza el eje jω en ±j6.633.',
    polosLC: 'Con K = 45.53: s^3 + 12s^2 + 44s + 93.53 = 0 → s = −2.029 ± j2.768 y −7.943 (suma de raíces = −12 ✓).',
    desemp: 'ζ = 0.591, ω_n = 3.431 → T_s ≈ 1.97 s, T_p ≈ 1.135 s, T_r ≈ 0.534 s; K_p = K/48 = 0.9485 → e(∞) = 1/(1 + K_p) = 0.513.',
    lgdr: 'figure; rlocus(G); sgrid(0.591, 0)',
    resp: 'T = feedback(K*G,1); step(T, T2, \'--\')   % 3er orden vs. 2.º orden',
    tab: [['%OS (%)', '10'], ['T_s (s)', '1.97'], ['T_p (s)', '1.135'], ['T_r (s)', '0.534'], ['e(∞) escalón', '0.513']],
    tabGuia: 'Simulación con K = 45.53: 8.82 %, T_s = 1.865 s, T_p = 1.293 s, T_r = 0.592 s, e(∞) = 0.513.'
  },
  dis: [
    { t: 'a) Del sobrepaso a ζ', eq: ['ζ=\\frac{-ln(0.10)}{\\sqrt{π^2+ln^2(0.10)}}'], h: 'Guía: ζ = 0.591 y θ = cos^{−1}ζ = 53.76°.' },
    { t: 'b) Punto de diseño (condición de ángulo)', h: 'Recorre la recta ζ = 0.591 hasta donde la suma de ángulos de los polos vale 180°. Guía: s_0 = −2.028 + j2.768 (90.59° + 54.54° + 34.87° = 180°).', fig: ['LGDR con la recta ζ = 0.591 y el punto s_0 marcado', { code: 'rlocus(G); sgrid(0.591,0); hold on; plot(real(s0),imag(s0),\'rx\')' }] },
    { t: 'c) Ganancia (condición de magnitud)', eq: ['K=\\abs{s_0+2}·\\abs{s_0+4}·\\abs{s_0+6}'], h: 'Guía: K = 2.768 · 3.398 · 4.841 = 45.53 (libro: 45.55). Como 0 < 45.53 < 480, el diseño es estable.' },
    { t: 'd) Estimaciones de segundo orden', eq: ['T_s=\\frac{4}{ζω_n},  T_p=\\frac{π}{ω_d}'], h: 'Guía: T_s = 1.97 s, T_p = 1.135 s, T_r ≈ 0.534 s, e(∞) = 0.513.' },
    { t: 'e) Validez de la aproximación', h: 'Con la suma de raíces: p_3 = −12 − 2(−2.028) = −7.943. Está a sólo 3.9 veces la parte real dominante (menos de 5) y ningún cero lo cancela → la aproximación NO es válida (igual que el libro). La decisión final se toma con la simulación.' }
  ],
  ctrl: { eq: ['G_c(s)=1'], rows: [['K de diseño (LGDR)', '45.53'], ['K ajustada (verificación, paso 6)', '49.38'], ['ζ de diseño', '0.591']], h: 'El diseño pedido es sólo de ganancia. La K = 49.38 es el ajuste del paso 6 de la verificación, con la que el modelo completo da exactamente 10 %.' },
  ver: {
    eq: 'Guía: con K = 45.53, s^3 + 12s^2 + 44s + 93.53 = 0 → s = −2.029 ± j2.768 y −7.943. No se descarta ningún modo: el orden 3 coincide con el de la planta.',
    orden: 3,
    est: 'Todas las raíces con parte real negativa; por Routh 0 < K < 480 y K = 45.53 está dentro.',
    cand: [['Par dominante', '−2.028 ± j2.768', '−2.029 ± j2.768']],
    candH: 'Con K = 45.53 el par cae exactamente en el candidato; con la K ajustada se mueve 3 % sobre el LGDR hacia un ζ algo menor.',
    modos: [['−2.029 ± j2.768', 'Dominante (≈ 0.367 c/u)'], ['−7.943', '0.134 — no despreciable']],
    aprox: 'El residuo del tercer polo (0.134) es un tercio del de cada polo dominante (0.367): el modo e^{−7.94t} no es despreciable → la aproximación de polos dominantes no es razonable.',
    err: 'e(∞) = 1/(1 + K/48): 0.5132 con K = 45.53 y 0.4929 con K = 49.38.'
  },
  mat: {
    entradas: 'Escalón unitario.',
    figs: [['Respuesta al escalón: modelo completo (3.^{er} orden) vs. aproximación de 2.º orden', { code: 'step(T, T2, \'--\', 6); grid on; legend(\'3er orden\',\'2º orden\')' }],
      ['Salida de stepinfo(T) y pole(T) en la Command Window (captura)', { code: 'polosLC = pole(T), info = stepinfo(T)' }]],
    metas: [['%OS', '10 %', '8.82 % (K = 45.53)'], ['T_s', 'Estimar', '1.865 s'], ['T_p', 'Estimar', '1.293 s'], ['e(∞) escalón', 'Estimar', '0.513']],
    errSim: 'Valor final simulado 0.4868 → e = 1 − 0.4868 = 0.5132 ✓ (usa 1 − dcgain(T)).',
    ajuste: 'La simulación no da 10 % con la K del LGDR. Se busca la K que da 10 % en el modelo completo con fzero → K = 49.38: 10.00 %, T_s = 1.826 s, e(∞) = 0.493. Repite la verificación con esa K.',
    ajusteFig: ['Respuesta al escalón con la K ajustada (49.38)', { code: 'K_aj = fzero(@(k) stepinfo(feedback(k*G,1)).Overshoot - 10, [40 70])' }],
    rampa: false
  },
  cmp: [['K', '45.55'], ['%OS', '10'], ['T_s (s)', '1.97'], ['T_p (s)', '1.13'], ['T_r (s)', '0.53'], ['e(∞) escalón', '0.51']],
  disc: 'Guía: los valores analíticos coinciden con el libro (diferencias de redondeo). El libro concluye que la aproximación no es válida por el tercer polo y la simulación lo confirma: el sobrepaso real es 1.2 puntos menor y T_p 14 % mayor, porque el modo e^{−7.94t} frena el arranque. El error coincide en todos los casos porque sólo depende de K_p.',
  con: ['El ajuste de ganancia sólo coloca los polos sobre el LGDR existente: no permite fijar a la vez ζ y la velocidad.', 'En un sistema tipo 0, la K que da 10 % deja un error al escalón de 51 %; reducirlo sin cambiar el transitorio requiere un compensador (P2 y P3).', 'Limitación demostrada: el tercer polo en −7.94 (a 3.9σ) invalida la aproximación de segundo orden; la verificación debe hacerse con el modelo completo.']
});

/* ───────────────────────── Práctica 2 ───────────────────────── */
P.push({
  n: 2, tema: 'Compensador integral ideal (PI)', ej: 'Ejemplo 9.1', pag: 501,
  cap: '9. Diseño por medio del lugar geométrico de las raíces',
  claves: 'Lugar geométrico de las raíces, Compensador integral ideal, Error en estado estacionario, Dipolo, MATLAB',
  resumen: 'Datos clave de la página: referencia K = 164.5 (ζ = 0.174), e(∞) = 0.108; con PI (s + 0.1)/s, K = 158.1, e(∞) = 0; polos dominantes movidos sólo 2.3 %; T_s pasa de 5.14 s a 17.8 s por el modo −0.090.',
  obj: 'Demostrar que un compensador integral ideal (PI) lleva a cero el error al escalón de un sistema que opera con ζ = 0.174, sin afectar apreciablemente su respuesta transitoria.',
  model: ['G(s)=\\frac{K}{(s+1)(s+2)(s+10)}', 'G_c(s)=\\frac{s+0.1}{s}'],
  modelNota: 'Realimentación unitaria negativa; el compensador va en cascada con la planta.',
  cadena: 'Step → Sum (+ −) → Gain (K) → Transfer Fcn G_c = [1 0.1]/[1 0] → Transfer Fcn G(s) → Scope, con realimentación unitaria.',
  specs: [['Punto de operación', 'ζ = 0.174', 'Fija la K de referencia'], ['Error al escalón', 'e(∞) = 0', 'Subir a tipo 1'], ['Transitorio', 'Sin cambio apreciable', 'Polos dominantes, pico y T_p']],
  ref: {
    k: 'El enunciado la da de forma indirecta: el sistema opera con ζ = 0.174 (θ = 79.98°). Condición de ángulo en s_0 = −0.694 + j3.926 y de magnitud K = 3.937 · 4.137 · 10.10 = 164.5. Con K = 1 los polos serían −1.130, −1.857, −10.01 (otro sistema).',
    polos: 'Polos en −1, −2 y −10; sin ceros. Tipo 0: K_p finito, queda error al escalón.',
    eq: 's^3+13s^2+32s+(20+K)=0',
    forma: 'Eje real en [−2, −1] y (−∞, −10]; asíntotas σ_a = −4.333 con ±60° y 180°; ruptura en −1.485.',
    orden: 3,
    routh: '0 < K < 396, con cruce del eje jω en ±j5.657 rad/s.',
    polosLC: 'Con K = 164.5: s = −0.694 ± j3.925 y −11.61. El tercer polo está 16.7 veces más lejos (más de 5): la aproximación de 2.º orden es válida en la referencia.',
    desemp: '%OS = 57.4 %, T_s = 5.76 s, T_p = 0.80 s; K_p = 164.5/20 = 8.23 → e(∞) = 1/(1 + 8.23) = 0.108.',
    lgdr: 'figure; rlocus(G); sgrid(0.174, 0)',
    resp: 'Tu = feedback(K*G,1); step(Tu, 10); stepinfo(Tu)',
    tab: [['%OS (%)', '57.4'], ['T_s (s)', '5.76'], ['T_p (s)', '0.80'], ['e(∞) escalón', '0.108']],
    tabGuia: 'Simulación: pico 1.374 (≈ 54 % sobre el valor final 0.8916), T_p = 0.888 s, T_s = 5.14 s, e(∞) = 0.108.'
  },
  dis: [
    { t: 'a) Polo en el origen', h: 'Con G_c = (s + z_c)/s el lazo abierto gana un integrador: el sistema pasa a tipo 1, K_p = ∞ y e_{escalón}(∞) = 0.' },
    { t: 'b) Cero en −0.1 (dipolo)', eq: ['∠G_c(s_0)=∠(s_0+0.1)-∠s_0'], h: 'Guía: ∠G_c(s_0) = 98.60° − 100.02° = −1.42° y |s_0 + 0.1|/|s_0| = 0.996: ángulo casi nulo y magnitud casi unitaria → los polos dominantes casi no se mueven.' },
    { t: 'c) Nueva ecuación característica', eq: ['s^4+13s^3+32s^2+(20+K)s+0.1K=0'] },
    { t: 'd) Nueva búsqueda de K sobre ζ = 0.174', h: 'Guía: s_0 = −0.678 + j3.836 y K = 158.1 (libro: 158.2). K bajó sólo 4 %: el dipolo casi no alteró el LGDR cerca de s_0.', fig: ['LGDR sin compensar y con PI sobre la recta ζ = 0.174', { code: 'rlocus(G, Gc*G); sgrid(0.174,0); legend(\'sin comp.\',\'PI\')' }] },
    { t: 'e) Polos compensados y estabilidad', h: 'Guía: −0.678 ± j3.836, −11.55 y −0.0902 (junto al cero −0.1: cancelación aproximada). Routh: 0 < K < 379.9 (antes 396).' }
  ],
  ctrl: { eq: ['G_c(s)=\\frac{s+0.1}{s}'], rows: [['K (con PI)', '158.1'], ['K_P = K', '158.1'], ['K_I = 0.1K', '15.81']], h: 'El cero en −0.1 lo fija el enunciado; sólo se recalcula K para seguir sobre ζ = 0.174.' },
  ver: {
    eq: 'Guía: s^4 + 13s^3 + 32s^2 + 178.1s + 15.81 = 0 → s = −0.090, −0.678 ± j3.836 y −11.55 (suma = −13 ✓; orden 4 = planta + compensador).',
    orden: 4,
    est: 'Todas las raíces en el semiplano izquierdo; Routh: 0 < K < 379.9, cruce en ±j5.547.',
    cand: [['Par dominante', '−0.694 ± j3.926 (sin comp.)', '−0.678 ± j3.836']],
    candH: 'El par dominante se movió sólo 2.3 % respecto al punto de operación original.',
    modos: [['−0.678 ± j3.836', 'Dominante'], ['−11.55', 'Pequeño (lejano)'], ['−0.090', '0.100 — modo lento']],
    aprox: 'El modo −0.090 tiene residuo 0.100: pequeño pero no nulo. No altera el pico, pero sí la cola de la respuesta (asentamiento largo).',
    err: 'Tipo 1 → e_{escalón}(∞) = 0. Dato extra: K_v = 0.7905 y e_{rampa} = 1.265.'
  },
  mat: {
    entradas: 'Escalón unitario (sin compensar y con PI).',
    figs: [['Respuesta al escalón sin compensar vs. con PI', { code: 'step(Tu, Tc, 40); grid on; legend(\'sin comp.\',\'PI\')' }],
      ['Salida de stepinfo(Tu), stepinfo(Tc) y pole(Tc) (captura)', { code: 'pole(Tc), stepinfo(Tu), stepinfo(Tc), e_c = 1 - dcgain(Tc)' }]],
    metas: [['e(∞) escalón', '0', '0 (valor final 1.0000)'], ['Pico', 'Sin cambio apreciable', '1.374 → 1.396'], ['T_p', 'Sin cambio apreciable', '0.888 → 0.909 s'], ['T_s (dato)', '—', '5.14 → 17.8 s']],
    errSim: 'Valor final 1.0000 (antes 0.8916) → e = 0 ✓ (usa 1 − dcgain(Tc)).',
    ajuste: 'Guía: no hizo falta ajuste; todas las especificaciones se cumplen. Escríbelo así si tu verificación también cumple.',
    rampa: false
  },
  cmp: [['K con PI', '158.2'], ['T_s sin compensar (s)', '≈ 6 (sim.)'], ['T_s con PI (s)', '≈ 18 (sim.)'], ['e(∞) sin compensar', '0.108'], ['e(∞) con PI', '0']],
  disc: 'Guía: los resultados coinciden con el ejemplo del libro. «Sin afectar apreciablemente el transitorio» queda demostrado: polos dominantes movidos 2.3 %, pico 1.6 %, T_p 2.4 %. El %OS baja de 54 % a 39.6 % sólo porque se mide contra un valor final distinto (1 en vez de 0.89). El precio del PI es el asentamiento largo (17.8 s).',
  con: ['El PI ideal elimina el error al escalón conservando los polos dominantes.', 'Limitación demostrada: requiere un integrador (circuito activo) y deja un modo lento (−0.090) que alarga el asentamiento a casi 18 s.', 'Acercar el cero al origen reduce el residuo de ese modo, pero lo vuelve aún más lento.']
});

/* ───────────────────────── Práctica 3 ───────────────────────── */
P.push({
  n: 3, tema: 'Compensador de atraso de fase', ej: 'Ejercicio de evaluación de destreza 9.1', pag: 510,
  cap: '9. Diseño por medio del lugar geométrico de las raíces',
  claves: 'Lugar geométrico de las raíces, Compensador de atraso, Error a rampa, Constante de velocidad, MATLAB',
  resumen: 'Datos clave de la página: referencia K = 45.84 (15 %), K_v = 6.549, e_{rampa} = 0.1527; atraso (s + 0.2)/(s + 0.01) con K = 44.64 → e = 0.00784 (×19.5); simulación 18.31 %; variante 0.02/0.001 con K = 45.73 → 15.33 % y ×19.95.',
  obj: 'Evaluar el error a rampa de un sistema tipo 1 que opera con 15 % de sobrepaso, diseñar un compensador de atraso que lo mejore 20 veces sin cambiar apreciablemente el transitorio y evaluar la mejora lograda.',
  model: ['G(s)=\\frac{K}{s(s+7)}', 'G_c(s)=\\frac{s+z_c}{s+p_c},  \\frac{z_c}{p_c}=20'],
  modelNota: 'Realimentación unitaria negativa; compensador en cascada.',
  cadena: 'Step (y después Ramp) → Sum (+ −) → Gain (K) → Transfer Fcn G_c = [1 0.2]/[1 0.01] → Transfer Fcn G(s) → Scope, con realimentación unitaria.',
  specs: [['Sobrepaso', '15 %', 'Se conserva'], ['Error a rampa', '×20 mejor: e ≤ 0.00763', '1/K_v'], ['Mejora lograda', 'Evaluar', 'Cociente de errores']],
  ref: {
    k: 'El sistema «opera con 15 % de sobrepaso» → ζ = 0.517 (no K = 1, que daría polos en −0.146 y −6.854). Como es de 2.º orden, 2ζω_n = 7 fija σ = 3.5: ω_n = 3.5/0.517 = 6.771 → K = ω_n^2 = 45.84.',
    polos: 'Polos en 0 y −7, sin ceros; tipo 1 (error nulo al escalón, finito a la rampa).',
    eq: 's^2+7s+K=0',
    forma: 'Eje real en [−7, 0]; las ramas se unen en −3.5 y suben en vertical (asíntotas ±90°).',
    orden: 2,
    routh: 'Polinomio de 2.º orden con coeficientes positivos: estable para todo K > 0.',
    polosLC: 's = −3.500 ± j5.796. Sistema de 2.º orden puro: las fórmulas son exactas.',
    desemp: '%OS = 15 %, T_s = 1.143 s, T_p = 0.542 s; K_v = K/7 = 6.549 → e_{rampa}(∞) = 0.1527.',
    lgdr: 'figure; rlocus(G); sgrid(0.517, 0)',
    resp: 'Tu = feedback(K*G,1); step(Tu); figure; t=0:0.001:15; plot(t, t\'-lsim(Tu,t,t))',
    tab: [['%OS (%)', '15'], ['T_s (s)', '1.143'], ['T_p (s)', '0.542'], ['K_v', '6.549'], ['e_{rampa}(∞)', '0.1527']],
    tabGuia: 'Simulación: 15 %, T_s ≈ 1.16 s, T_p = 0.542 s, e_{rampa} = 0.1527.',
    extraFig: ['Error ante rampa unitaria e(t) = t − c(t) del sistema sin compensar', { code: 't = 0:0.001:15; plot(t, t\'-lsim(Tu,t,t)); grid on' }]
  },
  dis: [
    { t: 'a) Cómo el atraso multiplica K_v', eq: ['K_{v,comp}=\\frac{K}{7}·\\frac{z_c}{p_c}'], h: 'Si K casi no cambia, la mejora es z_c/p_c; se elige z_c/p_c = 20.' },
    { t: 'b) Ubicación del dipolo', h: 'Con p_c = 0.01 y z_c = 0.2 (cerca del origen) el compensador aporta en s_0 sólo ∠G_c(s_0) = −1.40°: el LGDR casi no se mueve y el sobrepaso se conserva.' },
    { t: 'c) Nueva ecuación y estabilidad', eq: ['s^3+7.01s^2+(0.07+K)s+0.2K=0'], h: 'Routh: 7.01(0.07 + K) > 0.2K para todo K > 0 → sigue siendo estable siempre.' },
    { t: 'd) Nueva búsqueda de K sobre ζ = 0.517', h: 'Guía: s_0 = −3.402 ± j5.634, K = 44.64; tercer polo p_3 = −7.01 − 2(−3.402) = −0.206.', fig: ['LGDR sin compensar y con atraso (acercamiento cerca del origen)', { code: 'rlocus(G, Gc*G); sgrid(0.517,0); legend(\'sin comp.\',\'atraso\')' }] },
    { t: 'e) Error compensado y mejora', eq: ['K_v=\\frac{44.64}{7}·\\frac{0.2}{0.01}'], h: 'Guía: K_v = 127.5 → e_{rampa}(∞) = 0.00784; mejora 0.1527/0.00784 = 19.5 (no 20 exacto porque K bajó 2.6 %). Libro: 0.0078 y 19.58.' }
  ],
  ctrl: { eq: ['G_c(s)=\\frac{s+0.2}{s+0.01}'], rows: [['K (diseño)', '44.64'], ['z_c / p_c', '0.2 / 0.01'], ['Variante ajustada: z_c / p_c', '0.02 / 0.001'], ['K de la variante', '45.73']], h: 'La variante con el dipolo diez veces más cerca del origen se adoptó en el paso 6 de la verificación para recuperar el 15 %.' },
  ver: {
    eq: 'Guía: s^3 + 7.010s^2 + 44.71s + 8.928 = 0 → s = −0.206 y −3.402 ± j5.633 (suma = −7.010 ✓).',
    orden: 3,
    est: 'Estable para todo K > 0; K = 44.64 cumple.',
    cand: [['Par dominante', '−3.500 ± j5.796 (sin comp.)', '−3.402 ± j5.633']],
    candH: 'El par dominante se movió 2.8 %: el transitorio se conserva aproximadamente.',
    modos: [['−3.402 ± j5.633', 'Dominante'], ['−0.206', '0.032 — junto al cero −0.2']],
    aprox: 'El polo −0.206 queda a 0.006 del cero −0.2 (residuo 0.032): pequeño, pero suficiente para subir el pico y alargar T_s.',
    err: 'K_v = 127.5 → e_{rampa} = 0.00784; al escalón, 0 (tipo 1).'
  },
  mat: {
    entradas: 'Escalón unitario (transitorio) y rampa unitaria (error).',
    figs: [['Respuesta al escalón sin compensar vs. con atraso', { code: 'step(Tu, Tc, 6); grid on; legend(\'sin comp.\',\'atraso\')' }],
      ['Error ante rampa e(t) = t − c(t): sin compensar vs. con atraso', { code: 'plot(t, t\'-cu, t, t\'-cc); grid on' }],
      ['Salida de stepinfo, pole(Tc) y Kv en la Command Window (captura)', { code: 'pole(Tc), stepinfo(Tc), Kv_c = dcgain(minreal(s*Kc*Gc*G))' }]],
    metas: [['%OS', '15 %', '18.31 % (0.2/0.01)'], ['e_{rampa}', '≤ 0.00763', '0.00784'], ['Mejora', '×20', '×19.5']],
    errSim: 'Compara el valor final de e(t) en la gráfica de rampa con 1/K_v. Guía: 0.00784.',
    ajuste: 'Con 0.2/0.01 el sobrepaso sale 18.31 % (el modo −0.206 no se cancela del todo). Variante 0.02/0.001 con K = 45.73: 15.33 %, T_s = 0.858 s y e_{rampa} = 0.00765 (×19.95). Repite la verificación con la variante.',
    ajusteFig: ['Respuesta al escalón y error a rampa con la variante 0.02/0.001', { code: 'Gc2 = (s+0.02)/(s+0.001); [~,K2] = puntoZeta(Gc2*G, zeta, 1)' }],
    rampa: true
  },
  cmp: [['e_{rampa} sin compensar', '0.1527'], ['e_{rampa} con atraso', '0.0078'], ['Mejora', '×19.58'], ['%OS con atraso (sim.)', '—'], ['Variante 0.02/0.001', '—']],
  disc: 'Guía: el error coincide con el libro. El libro no reporta el transitorio simulado; la simulación muestra 18.3 % por el polo −0.206, casi cancelado pero no del todo. La variante con el dipolo más cerca del origen cumple 15.33 % y ×19.95, a cambio de una cola del error más lenta (modo e^{−0.020t}).',
  con: ['El atraso cumple la meta del error (×19.5 ≈ 20) manteniendo aproximadamente el sobrepaso.', 'La mejora real no es exactamente z_c/p_c porque K se reajusta para seguir sobre la recta de ζ.', 'Limitación demostrada: el error tarda en llegar a su valor final (modo lento); entre más cerca del origen el dipolo, menor su efecto en el transitorio pero más lenta esa cola.']
});

/* ───────────────────────── Práctica 4 ───────────────────────── */
P.push({
  n: 4, tema: 'Compensador derivativo ideal (PD)', ej: 'Ejemplo 9.3', pag: 515,
  cap: '9. Diseño por medio del lugar geométrico de las raíces',
  claves: 'Lugar geométrico de las raíces, Compensador derivativo ideal, Condición de ángulo, Tiempo de asentamiento, MATLAB',
  resumen: 'Datos clave de la página: referencia K = 43.38 (16 %), T_s = 3.32 s; PD con cero en −3.005 y K = 47.47; simulación 11.98 % y T_s = 1.153 s (3.01 veces menor); e_{rampa} 0.553 → 0.168.',
  obj: 'Diseñar un compensador derivativo ideal (PD) para obtener 16 % de sobrepaso con una reducción de tres veces en el tiempo de asentamiento.',
  model: ['G(s)=\\frac{K}{s(s+4)(s+6)}', 'G_c(s)=s+z_c'],
  modelNota: 'Realimentación unitaria negativa; compensador en cascada.',
  cadena: 'Step → Sum (+ −) → Gain (K) → PID Controller (modo PD: P = z_c, D = 1, sin filtro) → Transfer Fcn G(s) → Scope, con realimentación unitaria.',
  specs: [['Sobrepaso', '16 %', 'Misma recta ζ = 0.504'], ['Tiempo de asentamiento', 'T_s/3', 'σ tres veces mayor']],
  ref: {
    k: '16 % de sobrepaso para el sistema sin compensar: ζ = 0.504, θ = 59.74°. Condición de ángulo en s_0 = −1.204 ± j2.065 (120.26° + 36.45° + 23.30° = 180°) y K = 2.390 · 3.476 · 5.221 = 43.38. Con K = 1 los polos serían −0.042, −3.878, −6.079.',
    polos: 'Polos en 0, −4 y −6; sin ceros; tipo 1 (error a rampa 1/K_v).',
    eq: 's^3+10s^2+24s+K=0',
    forma: 'Eje real en [−4, 0] y (−∞, −6]; asíntotas σ_a = −3.333 con ±60° y 180°; ruptura en −1.5695.',
    orden: 3,
    routh: '0 < K < 240, cruce en ±j4.899.',
    polosLC: 's = −1.204 ± j2.065 y −7.591; el tercer polo está 6.3 veces más lejos (más de 5): aproximación válida.',
    desemp: 'T_s = 3.32 s, T_p = 1.52 s; K_v = K/24 = 1.807 → e_{rampa} = 0.553.',
    lgdr: 'figure; rlocus(G); sgrid(0.504, 0)',
    resp: 'Tu = feedback(K*G,1); step(Tu, 6); stepinfo(Tu)',
    tab: [['%OS (%)', '16'], ['T_s (s)', '3.32'], ['T_p (s)', '1.52'], ['e_{rampa}(∞)', '0.553']],
    tabGuia: 'Simulación: 15.08 %, T_s = 3.471 s, T_p = 1.673 s (libro sim.: 14.8 %, 3.6 s, 1.7 s).'
  },
  dis: [
    { t: 'a) Punto de diseño', eq: ['T_{s,d}=\\frac{3.32}{3}=1.107 s ⇒ σ=3.613'], h: 'Guía: ω_d = 3.613 · tan 59.74° = 6.194 → s_d = −3.613 + j6.194, sobre la misma recta de ζ. No está en el LGDR original: hace falta un cero.' },
    { t: 'b) Ángulo faltante', eq: ['∠G(s_d)=-(120.26°+86.43°+68.93°)'], h: 'Guía: ∠G(s_d) = −275.61°. Para pertenecer al LGDR debe valer −180°: el cero debe aportar +95.61°.' },
    { t: 'c) Ubicación del cero', eq: ['z_c=σ+\\frac{ω_d}{tan(95.61°)}'], h: 'Guía: z_c = 3.613 − 0.608 = 3.005 (libro: 3.006). Como el ángulo es mayor de 90°, el cero queda a la derecha de −σ.', fig: ['Construcción geométrica del cero (cálculo a mano o figura del LGDR con s_d)', 'Puedes pegar la foto de tu hoja de cálculos.'] },
    { t: 'd) Ganancia', eq: ['K=\\frac{\\abs{s_d}·\\abs{s_d+4}·\\abs{s_d+6}}{\\abs{s_d+3.005}}'], h: 'Guía: K = 7.171 · 6.206 · 6.638 / 6.224 = 47.47.' },
    { t: 'e) Nueva ecuación y estabilidad', eq: ['s^3+10s^2+(24+K)s+3.005K=0'], h: 'Routh: 10(24 + K) > 3.005K siempre → estable para todo K > 0. Tercer polo: −10 − 2(−3.613) = −2.773.', fig: ['LGDR compensado con la recta ζ = 0.504', { code: 'rlocus(Gc*G); sgrid(0.504,0)' }] },
    { t: 'f) Efecto en el error', eq: ['K_v=\\frac{47.47·3.005}{24}'], h: 'Guía: K_v = 5.94 → e_{rampa} = 0.168.' }
  ],
  ctrl: { eq: ['G_c(s)=s+3.005'], rows: [['z_c', '3.005'], ['K', '47.47'], ['K_D = K', '47.47'], ['K_P = K·z_c', '142.6']], h: 'El cero se obtuvo con la condición de ángulo y K con la de magnitud; la verificación no requirió ajuste.' },
  ver: {
    eq: 'Guía: s^3 + 10s^2 + 71.47s + 142.6 = 0 → s = −2.773 y −3.613 ± j6.194 (suma = −10 ✓).',
    orden: 3,
    est: 'Estable para todo K > 0 (antes sólo para K < 240).',
    cand: [['Par dominante', '−3.613 ± j6.194', '−3.613 ± j6.194']],
    candH: 'El par dominante coincide con el candidato.',
    modos: [['−3.613 ± j6.194', 'Dominante'], ['−2.773', '0.101 — cancelación parcial con el cero −3.005']],
    aprox: 'El tercer polo −2.773 está más cerca del eje que el par dominante (0.77σ) y a 0.23 del cero; su residuo (0.101) es casi 1/5 del dominante: la cancelación es sólo parcial, como señala el libro.',
    err: 'K_v = 5.942 → e_{rampa} = 0.168 (antes 0.553); al escalón, 0.'
  },
  mat: {
    entradas: 'Escalón unitario.',
    figs: [['Respuesta al escalón sin compensar vs. con PD', { code: 'step(Tu, Tc, 5); grid on; legend(\'sin comp.\',\'PD\')' }],
      ['Salida de pole(Tc), zero(Tc) y stepinfo (captura)', { code: 'pole(Tc), zero(Tc), stepinfo(Tu), stepinfo(Tc)' }]],
    metas: [['%OS', '16 %', '11.98 %'], ['T_s', '≤ 3.471/3 ≈ 1.157 s', '1.153 s (×3.01)'], ['T_p (dato)', '—', '0.523 s']],
    errSim: 'Calcula e_{rampa} simulado (opcional, con lsim) y compáralo con 0.168.',
    ajuste: 'Guía: no hizo falta ajuste. El libro acepta el diseño porque el sobrepaso difiere unos 3 % y la velocidad mejora unas tres veces.',
    rampa: false
  },
  cmp: [['%OS sin compensar', '16 (sim. 14.8)'], ['T_s sin compensar (s)', '3.320 (sim. 3.6)'], ['T_p sin compensar (s)', '1.522 (sim. 1.7)'], ['%OS con PD', '16 (sim. 11.8)'], ['T_s con PD (s)', '1.107 (sim. 1.2)'], ['T_p con PD (s)', '0.507 (sim. 0.5)'], ['e_{rampa} con PD', '0.168']],
  disc: 'Guía: coincide con la tabla 9.3 del libro (cero en −3.006; aquí −3.005). El sobrepaso menor (11.98 %) se explica por el tercer polo −2.773 sin cancelar del todo. Como efecto extra, el error a rampa mejoró 3.3 veces sin haberlo pedido.',
  con: ['Un cero bien ubicado aporta el ángulo que falta y desplaza el LGDR hasta el punto de diseño.', 'El cero hizo al sistema estable para cualquier K y mejoró el error a rampa.', 'Limitación demostrada: el PD ideal es activo y amplifica el ruido de alta frecuencia; el tercer polo deja el sobrepaso en 12 % y no en 16 %.']
});

/* ───────────────────────── Práctica 5 ───────────────────────── */
P.push({
  n: 5, tema: 'Compensador de adelanto de fase', ej: 'Ejercicio de evaluación de destreza 9.2', pag: 526,
  cap: '9. Diseño por medio del lugar geométrico de las raíces',
  claves: 'Lugar geométrico de las raíces, Compensador de adelanto, Tiempo de asentamiento, Condición de ángulo, MATLAB',
  resumen: 'Datos clave de la página: referencia K = 45.84 (15 %), T_s = 1.143 s; adelanto (s + 10)/(s + 25.54) con K = 476.2 → simulación 21.07 % (no cumple); ajuste con ζ = 0.627: p_c = 27.00, K = 364.1 → 15.00 % y T_s = 0.363 s.',
  obj: 'Evaluar el tiempo de asentamiento de un sistema que opera con 15 % de sobrepaso y diseñar un compensador de adelanto, con el cero en −10, que lo reduzca tres veces.',
  model: ['G(s)=\\frac{K}{s(s+7)}', 'G_c(s)=\\frac{s+10}{s+p_c}'],
  modelNota: 'Realimentación unitaria negativa; compensador pasivo en cascada.',
  cadena: 'Step → Sum (+ −) → Gain (K) → Transfer Fcn G_c = [1 10]/[1 p_c] → Transfer Fcn G(s) → Scope, con realimentación unitaria.',
  specs: [['Sobrepaso', '15 %', 'ζ = 0.517'], ['Tiempo de asentamiento', 'T_s/3 ≤ 0.381 s', 'σ = 10.5'], ['Cero del compensador', '−10 (impuesto)', 'Sólo se calcula el polo']],
  ref: {
    k: 'Indicada: opera con 15 % de sobrepaso → ζ = 0.517, K = ω_n^2 = (3.5/0.517)^2 = 45.84, T_s = 4/3.5 = 1.143 s. Con K = 1 los polos serían −0.146 y −6.854.',
    polos: 'Polos en 0 y −7; tipo 1. σ = 3.5 fijo.',
    eq: 's^2+7s+K=0',
    forma: 'Eje real en [−7, 0]; ruptura en −3.5 y ramas verticales.',
    orden: 2,
    routh: 'Estable para todo K > 0 (primera columna de Routh: 1, 7, K).',
    polosLC: 's = −3.500 ± j5.796.',
    desemp: '%OS = 15 %, T_s = 1.143 s, T_p = 0.542 s; K_v = 6.549 → e_{rampa} = 0.1527.',
    lgdr: 'figure; rlocus(G); sgrid(0.517, 0)',
    resp: 'Tu = feedback(K*G,1); step(Tu, 2); stepinfo(Tu)',
    tab: [['%OS (%)', '15'], ['T_s (s)', '1.143'], ['T_p (s)', '0.542'], ['e_{rampa}(∞)', '0.1527']],
    tabGuia: 'Simulación: 15 %, T_s = 1.161 s.'
  },
  dis: [
    { t: 'a) Punto de diseño', eq: ['T_{s,d}=\\frac{1.143}{3}=0.381 s ⇒ σ=10.5'], h: 'Guía: ω_d = 10.5 · tan 58.87° = 17.39 → s_d = −10.5 + j17.39.' },
    { t: 'b) Ángulo con el cero ya puesto', eq: ['∠(s_d+10)-∠s_d-∠(s_d+7)'], h: 'Guía: 91.65° − 121.13° − 101.38° = −130.86°. Para llegar a −180° el polo del compensador debe restar 49.14°.' },
    { t: 'c) Ubicación del polo', eq: ['p_c=σ+\\frac{ω_d}{tan(49.14°)}'], h: 'Guía: p_c = 10.5 + 15.04 = 25.54 (libro: 25.52). p_c > z_c: el polo queda a la izquierda del cero.', fig: ['Construcción geométrica del polo del compensador (cálculo a mano)', 'Puedes pegar la foto de tu hoja de cálculos.'] },
    { t: 'd) Ganancia', eq: ['K=\\frac{\\abs{s_d}·\\abs{s_d+7}·\\abs{s_d+25.54}}{\\abs{s_d+10}}'], h: 'Guía: K = 20.31 · 17.74 · 22.99 / 17.40 = 476.2 (libro: 476.3).' },
    { t: 'e) Ecuación característica y tercer polo', eq: ['s^3+32.54s^2+(178.8+K)s+10K=0'], h: 'Guía: p_3 = −32.54 − 2(−10.5) = −11.54. Routh: 32.54(178.8 + K) > 10K siempre → estable para todo K > 0.', fig: ['LGDR compensado con la recta ζ = 0.517', { code: 'rlocus(Gc*G); sgrid(0.517,0)' }] }
  ],
  ctrl: { eq: ['G_c(s)=\\frac{s+10}{s+27.00}'], rows: [['Libro: p_c / K', '25.54 / 476.2'], ['Ajustado: ζ de diseño', '0.627 (σ = 10.5)'], ['Ajustado: p_c', '27.00'], ['Ajustado: K', '364.1']], h: 'El compensador del libro no cumple el sobrepaso en la simulación; el controlador final es el ajustado (ζ = 0.627, misma σ y cero en −10). Si tu verificación da otra cosa, pon tus valores.' },
  ver: {
    eq: 'Guía (libro): s^3 + 32.54s^2 + 654.9s + 4761.6 = 0 → −10.50 ± j17.39 y −11.54. Ajustado: s^3 + 34.00s^2 + 553.1s + 3640.8 = 0 → −10.50 ± j13.03 y −13.00.',
    orden: 3,
    est: 'Ambos diseños son estables para todo K > 0.',
    cand: [['Par dominante (libro)', '−10.5 ± j17.39', '−10.50 ± j17.39'], ['Par dominante (ajustado)', '−10.5 ± j13.03', '−10.50 ± j13.03']],
    candH: 'Los polos complejos quedan donde se diseñaron; el problema no es su ubicación, sino el tercer polo y el cero.',
    modos: [['−10.50 ± j17.39', 'Dominante'], ['−11.54', '0.210 — sin cancelar']],
    aprox: 'El tercer polo −11.54 está a sólo 1.1σ y el cero −10 queda más cerca del eje que él: no hay cancelación (residuo 0.210) → la aproximación de polos dominantes no es razonable.',
    err: 'K_v = 10K/(7p_c): 26.63 con el diseño del libro (e = 0.0375) y 19.27 con el ajustado (e = 0.0519); al escalón, 0.'
  },
  mat: {
    entradas: 'Escalón unitario.',
    figs: [['Respuesta al escalón sin compensar vs. con adelanto (diseño del libro)', { code: 'step(Tu, Tc, 2); grid on; legend(\'sin comp.\',\'adelanto\')' }],
      ['Salida de pole(Tc), zero(Tc) y stepinfo(Tc) (captura)', { code: 'pole(Tc), zero(Tc), stepinfo(Tc)' }]],
    metas: [['%OS', '≤ 15 %', '21.07 % ✗ (libro) · 15.00 % ✓ (ajustado)'], ['T_s', '≤ 0.381 s', '0.391 s (libro) · 0.363 s ✓ (ajustado)']],
    errSim: 'Error a rampa: 0.0375 (libro) y 0.0519 (ajustado). Compáralo con tu simulación de rampa si la haces.',
    ajuste: 'El diseño del libro da 21.07 % (no cumple). Repite el diseño con ζ mayor manteniendo σ = 10.5 y el cero en −10; busca la ζ que da 15 % (bisección o fzero) → ζ = 0.627, p_c = 27.00, K = 364.1: 15.00 % y T_s = 0.363 s. Repite la verificación.',
    ajusteFig: ['Respuesta al escalón con el adelanto ajustado (p_c = 27.00, K = 364.1)', { code: 'Gc2 = (s+10)/(s+27.00); Tc2 = feedback(364.1*Gc2*G,1); step(Tc2); stepinfo(Tc2)' }],
    rampa: false
  },
  cmp: [['T_s sin compensar (s)', '1.143'], ['p_c', '25.52'], ['K', '476.3'], ['%OS con adelanto (sim.)', 'no lo reporta'], ['Ajuste p_c / K', '—'], ['%OS y T_s ajustado', '—']],
  disc: 'Guía: el compensador coincide con el libro, que sólo da G_c y K y no verifica el sobrepaso del modelo completo. La guía sí lo exige: la simulación da 21 %. Rediseñando con ζ = 0.627 y la misma σ se cumplen el 15 % y T_s; el costo es el error a rampa (K_v 26.6 → 19.3).',
  con: ['El adelanto reduce T_s tres veces sin circuito activo.', 'Con el cero impuesto en −10 la aproximación de segundo orden falla; se compensa con más ζ de diseño.', 'Limitación demostrada: más amortiguamiento cuesta K_v (26.6 → 19.3).']
});

/* ───────────────────────── Práctica 6 ───────────────────────── */
P.push({
  n: 6, tema: 'Controlador PID', ej: 'Ejemplo 9.5', pag: 528,
  cap: '9. Diseño por medio del lugar geométrico de las raíces',
  claves: 'Lugar geométrico de las raíces, Controlador PID, Tiempo pico, Error en estado estacionario, MATLAB',
  resumen: 'Datos clave de la página: referencia K = 121.5 (20 %), T_p = 0.297 s, e = 0.156; PD con cero en −55.96; PI (s + 0.5)/s; K = 4.592 → K_1 = 259.3, K_2 = 128.5, K_3 = 4.592; simulación 14.15 %, T_p = 0.194 s, e = 0.',
  obj: 'Diseñar un controlador PID para que el sistema opere con 20 % de sobrepaso, tiempo pico igual a 2/3 del sistema sin compensar y error cero al escalón.',
  model: ['G(s)=\\frac{K(s+8)}{(s+3)(s+6)(s+10)}', 'G_c(s)=K_1+\\frac{K_2}{s}+K_3 s'],
  modelNota: 'Realimentación unitaria negativa. El PID se diseña como producto de un PD (transitorio) y un PI (error).',
  cadena: 'Step → Sum (+ −) → PID Controller (P = K_1, I = K_2, D = K_3, sin filtro) → Transfer Fcn G(s) = [1 8]/conv(conv([1 3],[1 6]),[1 10]) → Scope, con realimentación unitaria.',
  specs: [['Sobrepaso', '20 %', 'ζ = 0.456'], ['Tiempo pico', '(2/3)T_p ≤ 0.198 s', 'Parte PD'], ['Error al escalón', '0', 'Parte PI']],
  ref: {
    k: 'Indicada: el sistema sin compensar opera con 20 % → ζ = 0.456, θ = 62.87°, s_0 = −5.416 ± j10.57; condición de magnitud K = 10.84 · 10.59 · 11.52 / 10.88 = 121.5. Con K = 1 los polos serían −3.256, −5.814, −9.929.',
    polos: 'Polos en −3, −6 y −10; cero en −8. Tipo 0: error finito al escalón.',
    eq: 's^3+19s^2+(108+K)s+(180+8K)=0',
    forma: 'Eje real en [−6, −3] y [−10, −8]; 2 asíntotas a ±90° desde σ_a = −5.5; ruptura en −4.623.',
    orden: 3,
    routh: 'Fila s^1 = (1872 + 11K)/19 > 0 para todo K > 0 → estable siempre.',
    polosLC: 'Con K = 121.5: s = −5.416 ± j10.57 y −8.169. El tercer polo está junto al cero −8 (cancelación aproximada): la aproximación de 2.º orden es razonable.',
    desemp: 'T_p = π/10.57 = 0.297 s, T_s = 0.739 s; K_p = 8K/180 = 5.40 → e(∞) = 1/6.40 = 0.156.',
    lgdr: 'figure; rlocus(G); sgrid(0.456, 0)',
    resp: 'Tu = feedback(K*G,1); step(Tu, 3); stepinfo(Tu)',
    tab: [['%OS (%)', '20'], ['T_p (s)', '0.297'], ['T_s (s)', '0.739'], ['e(∞) escalón', '0.156']],
    tabGuia: 'Simulación: 20.73 %, T_p = 0.295 s, e(∞) = 0.156.'
  },
  dis: [
    { t: 'a) Punto de diseño desde T_p', eq: ['T_{p,d}=\\frac{2}{3}(0.297)=0.198 s'], h: 'Guía: ω_d = π/0.198 = 15.86, σ = 15.86/tan 62.87° = 8.123 → s_d = −8.123 + j15.86.' },
    { t: 'b) Cero del PD (condición de ángulo)', eq: ['∠G(s_d)=90.45°-(107.91°+97.63°+83.25°)'], h: 'Guía: ∠G(s_d) = −198.34° → θ_z = 18.34°; z_{PD} = 8.123 + 15.86/tan 18.34° = 55.96 y K_{PD} = 5.326. El ángulo faltante es pequeño, por eso el cero queda lejos.', fig: ['Respuesta con sólo el PD (comprobación intermedia)', { code: 'Tpd = feedback(Kpd*Gpd*G,1); step(Tpd); stepinfo(Tpd)' }] },
    { t: 'c) PI ideal', eq: ['G_{PI}(s)=\\frac{s+0.5}{s}'], h: 'El polo en el origen da tipo 1 (error cero) y el cero cercano hace que el dipolo casi no mueva los polos del PD.' },
    { t: 'd) Ecuación característica con el PID completo', eq: ['s^4+(19+K)s^3+(108+64.46K)s^2', '+(180+479.7K)s+223.8K=0'] },
    { t: 'e) Nueva búsqueda de K y ganancias', eq: ['K_1=K(55.96+0.5)', 'K_2=K(55.96)(0.5),  K_3=K'], h: 'Guía: s_0 = −7.513 ± j14.66, K = 4.592 → K_1 = 259.3, K_2 = 128.5, K_3 = 4.592 (libro: 259.5, 128.6, 4.6).', fig: ['LGDR con el PID completo y la recta ζ = 0.456', { code: 'rlocus(Gpd*Gpi*G); sgrid(0.456,0)' }] }
  ],
  ctrl: { eq: ['G_c(s)=259.3+\\frac{128.5}{s}+4.592s'], rows: [['z_{PD}', '55.96'], ['Cero del PI', '0.5'], ['K', '4.592'], ['K_1 (proporcional)', '259.3'], ['K_2 (integral)', '128.5'], ['K_3 (derivativa)', '4.592']], h: 'Se implementa en forma paralela con pid(K1, K2, K3).' },
  ver: {
    eq: 'Guía: s^4 + 23.59s^3 + 404.0s^2 + 2382.5s + 1027.8 = 0 → s = −0.467, −7.513 ± j14.66 y −8.099 (suma = −23.59 ✓; orden 4).',
    orden: 4,
    est: 'Todas las raíces en el semiplano izquierdo; estable para todo K > 0.',
    cand: [['Par dominante', '−8.123 ± j15.86 (PD)', '−7.513 ± j14.66']],
    candH: 'Con el PI el par dominante se corrió 7.5 % respecto al punto del PD (el PI no es un dipolo perfecto); por eso se verifica T_p en la simulación.',
    modos: [['−7.513 ± j14.66', 'Dominante'], ['−8.099', '0.012 — junto al cero −8'], ['−0.467', '0.066 — junto al cero −0.5']],
    aprox: 'Hay dos cancelaciones aproximadas: −8.099 junto al cero −8 y −0.467 junto al cero −0.5. Ambos polos son estables y de residuo pequeño.',
    err: 'El polo del PI en el origen da tipo 1: K_p = ∞ → e_{escalón} = 0. Dato extra: K_v = 5.710, error a rampa 0.175.'
  },
  mat: {
    entradas: 'Escalón unitario.',
    figs: [['Respuesta al escalón: sin compensar, PD y PID', { code: 'step(Tu, Tpd, Tpid, 3); grid on; legend(\'sin comp.\',\'PD\',\'PID\')' }],
      ['Salida de pole(Tpid), zero(Tpid), stepinfo y 1 − dcgain (captura)', { code: 'pole(Tpid), zero(Tpid), stepinfo(Tpid), e_esc = 1 - dcgain(Tpid)' }]],
    metas: [['%OS', '≤ 20 %', '14.15 %'], ['T_p', '≤ 0.198 s', '0.194 s'], ['e(∞) escalón', '0', '0'], ['T_s (dato)', '—', '2.56 s']],
    errSim: 'Valor final 1 → e = 0 ✓ (usa 1 − dcgain(Tpid)).',
    ajuste: 'Guía: no hizo falta ajuste; las tres especificaciones se cumplen en el modelo completo.',
    rampa: false
  },
  cmp: [['%OS / T_p sin compensar', '20 % · 0.297 s'], ['e(∞) sin compensar', '0.156'], ['K_1 · K_2 · K_3', '259.5 · 128.6 · 4.6'], ['%OS con PID', '20 (pred.)'], ['T_p con PID (s)', '0.214 (pred.)'], ['T_s con PID (s)', '0.532 (pred.)'], ['e(∞) con PID', '0']],
  disc: 'Guía: las ganancias coinciden con el libro. Su tabla 9.5 predice con 2.º orden T_p = 0.214 s (no cumpliría 0.198 s), pero la simulación del modelo completo da 0.194 s y sí cumple: la predicción no basta. La diferencia en T_s (0.53 s previsto contra 2.56 s simulado) se debe al modo lento del PI (−0.467).',
  con: ['Diseñar primero el PD y después el PI evita que la segunda etapa deshaga la primera.', 'Las tres especificaciones se cumplen en el modelo completo, aunque la predicción de segundo orden no lo garantizaba.', 'Limitación demostrada: el PID requiere circuito activo, el término derivativo es sensible al ruido (en la práctica se agrega un filtro) y el PI deja un asentamiento largo.']
});

/* ───────────────────────── Práctica 7 ───────────────────────── */
P.push({
  n: 7, tema: 'Compensador de adelanto‑atraso de fase', ej: 'Ejercicio de evaluación de destreza 9.3', pag: 541,
  cap: '9. Diseño por medio del lugar geométrico de las raíces',
  claves: 'Lugar geométrico de las raíces, Compensador de adelanto‑atraso, Tiempo de asentamiento, Error a rampa, MATLAB',
  resumen: 'Datos clave de la página: referencia K = 58.93 (20 %), T_s = 1.143 s, e_{rampa} = 0.1188; adelanto p_{ad} = 9.609, atraso 0.0921/0.01, K = 203.7 → T_s = 0.627 s (no cumple); ajuste p_{ad} = 12.29, z_{atr} = 0.0827, K = 290.3 → T_s = 0.569 s, e = 0.01194 (÷9.95).',
  obj: 'Para un sistema que opera con 20 % de sobrepaso, evaluar T_s y el error a rampa, y diseñar un compensador de adelanto‑atraso, con el cero de adelanto en −3, que reduzca T_s dos veces y el error a rampa diez veces.',
  model: ['G(s)=\\frac{K}{s(s+7)}', 'G_c(s)=\\frac{(s+3)(s+z_{atr})}{(s+p_{ad})(s+p_{atr})}'],
  modelNota: 'Realimentación unitaria negativa; primero se diseña el adelanto (transitorio) y después el atraso (error).',
  cadena: 'Step (y después Ramp) → Sum (+ −) → Gain (K) → Transfer Fcn adelanto [1 3]/[1 p_{ad}] → Transfer Fcn atraso [1 z_{atr}]/[1 p_{atr}] → Transfer Fcn G(s) → Scope, con realimentación unitaria.',
  specs: [['Sobrepaso', '20 %', 'ζ = 0.456'], ['Tiempo de asentamiento', 'T_s/2 ≤ 0.571 s', 'Adelanto'], ['Error a rampa', '÷10: e ≈ 0.0119', 'Atraso'], ['Cero del adelanto', '−3 (impuesto)', '—']],
  ref: {
    k: 'Indicada: opera con 20 % → ζ = 0.456, ω_n = 3.5/0.456 = 7.676, K = 58.93, T_s = 4/3.5 = 1.143 s. Con K = 1 los polos serían −0.146 y −6.854.',
    polos: 'Polos en 0 y −7; tipo 1. σ = 3.5.',
    eq: 's^2+7s+K=0',
    forma: 'Eje real en [−7, 0]; ramas verticales desde −3.5.',
    orden: 2,
    routh: 'Coeficientes positivos: estable para todo K > 0.',
    polosLC: 's = −3.500 ± j6.832.',
    desemp: '%OS = 20 %, T_s = 1.143 s, T_p = 0.460 s; K_v = 58.93/7 = 8.418 → e_{rampa} = 0.1188.',
    lgdr: 'figure; rlocus(G); sgrid(0.456, 0)',
    resp: 'Tu = feedback(K*G,1); step(Tu, 2); figure; t=0:0.001:30; plot(t, t\'-lsim(Tu,t,t))',
    tab: [['%OS (%)', '20'], ['T_s (s)', '1.143'], ['T_p (s)', '0.460'], ['K_v', '8.418'], ['e_{rampa}(∞)', '0.1188']],
    tabGuia: 'Simulación: 20 %, T_s = 1.085 s, e_{rampa} = 0.1188.',
    extraFig: ['Error ante rampa unitaria del sistema sin compensar', { code: 't = 0:0.001:30; plot(t, t\'-lsim(Tu,t,t)); grid on' }]
  },
  dis: [
    { t: 'a) Punto de diseño', eq: ['T_{s,d}=\\frac{1.143}{2}=0.571 s ⇒ σ=7'], h: 'Guía: ω_d = 7 · tan 62.87° = 13.66 → s_d = −7 + j13.66.' },
    { t: 'b) Polo del adelanto (cero fijo en −3)', eq: ['p_{ad}=σ+\\frac{ω_d}{tan(θ_p)}'], h: 'Guía: 106.32° − 117.13° − 90° = −100.81° → θ_p = 79.19°; p_{ad} = 7 + 13.66/tan 79.19° = 9.609; K_{ad} = 15.35 · 13.66 · 13.91 / 14.24 = 205.0.' },
    { t: 'c) Error que deja el adelanto', eq: ['K_{v,ad}=\\frac{205.0·3}{7·9.609}'], h: 'Guía: K_{v,ad} = 9.14. El adelanto casi no mejoró el error (8.42 → 9.14): el resto lo da el atraso.' },
    { t: 'd) Atraso', eq: ['\\frac{z_{atr}}{p_{atr}}=\\frac{10·8.418}{9.14}'], h: 'Guía: K_{v,meta} = 84.18 → z_{atr}/p_{atr} = 9.21 → p_{atr} = 0.01, z_{atr} = 0.0921.' },
    { t: 'e) Ecuación final y nueva búsqueda de K', eq: ['s^4+16.62s^3+(67.43+K)s^2', '+(0.673+3.092K)s+0.2763K=0'], h: 'Guía: s_0 = −6.966 ± j13.60, K = 203.7; K_v = 83.65 → e_{rampa} = 0.01195 (÷9.9).', fig: ['LGDR con el adelanto‑atraso y la recta ζ = 0.456', { code: 'rlocus(Glead*Glag*G); sgrid(0.456,0)' }] }
  ],
  ctrl: { eq: ['G_c(s)=\\frac{(s+3)(s+0.0827)}{(s+12.29)(s+0.01)}'], rows: [['Libro: p_{ad} / z_{atr} / K', '9.609 / 0.0921 / 203.7'], ['Ajustado: p_{ad}', '12.29'], ['Ajustado: z_{atr} / p_{atr}', '0.0827 / 0.01'], ['Ajustado: K', '290.3']], h: 'El diseño del libro no cumple T_s en la simulación; el controlador final es el ajustado (adelanto rediseñado para T_s = 0.48 s y atraso recalculado). Si tu verificación da otra cosa, pon tus valores.' },
  ver: {
    eq: 'Guía (libro): s^4 + 16.62s^3 + 271.1s^2 + 630.4s + 56.27 = 0 → −0.093, −2.593, −6.966 ± j13.60. Ajustado: s^4 + 19.30s^3 + 376.5s^2 + 895.8s + 72.05 = 0 → −0.083, −2.607, −8.303 ± j16.21.',
    orden: 4,
    est: 'Ambos son estables para todo K > 0.',
    cand: [['Par dominante (libro)', '−7 ± j13.66', '−6.966 ± j13.60'], ['Par dominante (ajustado)', 'Tu candidato', '−8.303 ± j16.21']],
    candH: 'El atraso movió el par dominante sólo 0.5 %: el adelanto‑atraso respeta el punto de diseño.',
    modos: [['−6.966 ± j13.60', 'Dominante'], ['−2.593', '0.157 — cancelación parcial con −3'], ['−0.093', '0.0094 — junto al cero −0.0921']],
    aprox: '−2.593 está más cerca del eje que los dominantes (0.37σ) y a 0.41 del cero −3: cancelación sólo parcial (residuo 0.157). −0.093 queda pegado al cero −0.0921.',
    err: 'K_v = 83.66 (e = 0.01195) con el diseño del libro y 83.78 (e = 0.01194) con el ajustado: mejora ÷9.94 y ÷9.95.'
  },
  mat: {
    entradas: 'Escalón unitario (transitorio) y rampa unitaria (error).',
    figs: [['Respuesta al escalón: sin compensar, adelanto y adelanto‑atraso', { code: 'step(Tu, Tl, Tf, 2); grid on; legend(\'sin comp.\',\'adelanto\',\'adelanto-atraso\')' }],
      ['Error ante rampa: sin compensar vs. adelanto‑atraso', { code: 'plot(t, t\'-lsim(Tu,t,t), t, t\'-lsim(Tf,t,t)); grid on' }],
      ['Salida de pole(Tf), zero(Tf), stepinfo(Tf) y e_f (captura)', { code: 'pole(Tf), zero(Tf), stepinfo(Tf), e_f = 1/dcgain(minreal(s*Kf*Glead*Glag*G))' }]],
    metas: [['T_s', '≤ 0.571 s', '0.627 s ✗ (libro) · 0.569 s ✓ (ajustado)'], ['%OS (dato)', '20 %', '9.05 % (ajustado)'], ['e_{rampa}', '≈ 0.0119', '0.01195 · 0.01194']],
    errSim: 'Compara el valor final de e(t) en la gráfica de rampa con 1/K_v. Guía: 0.01195 (130 s de simulación para que se asiente).',
    ajuste: 'El diseño del libro da T_s = 0.627 s (10 % sobre la meta) por el modo −2.59 sin cancelar. Rediseña el adelanto para un T_s objetivo menor (prueba 0.54, 0.51, 0.48 s) y recalcula el atraso → p_{ad} = 12.29, z_{atr} = 0.0827, K = 290.3: T_s = 0.569 s, 9.05 %, e = 0.01194. Repite la verificación.',
    ajusteFig: ['Respuesta al escalón con el adelanto‑atraso ajustado', { code: 'Ts_obj = 0.48;   % en la sección 2) del código y vuelve a correr' }],
    rampa: true
  },
  cmp: [['T_s sin compensar (s)', '1.143'], ['e_{rampa} sin compensar', '0.1189'], ['K', '205.4'], ['T_s con adelanto‑atraso (sim.)', 'no lo reporta'], ['e_{rampa} final', '—']],
  disc: 'Guía: el libro da K = 205.4 (ganancia del adelanto solo); con el atraso puesto, la K sobre ζ = 0.456 es 203.7 y ambas dan casi la misma respuesta. El error cumple (÷9.94) pero T_s no: el polo −2.59 cerca del cero −3 alarga el asentamiento. Rediseñar el adelanto para T_s = 0.48 s compensa ese efecto.',
  con: ['El adelanto‑atraso resuelve el transitorio y el error por separado y sin circuitos activos.', 'El orden importa: el atraso se calcula con el K_v que ya dejó el adelanto.', 'Limitación demostrada: con el cero de adelanto impuesto en −3 queda un polo lento sin cancelar del todo; T_s debe verificarse por simulación y ajustarse.']
});

module.exports = P;
