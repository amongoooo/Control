# Anexo «C. Cálculos» de la P5 (mismo orden que el reporte, desarrollo completo).
import math, cmath
import numpy as np
from build import calc_box
import num5
from p5 import (Z, TH, TN, SG, s0, WD, K0, WN, Kv0, E0, OS2, TS2, TP2, TRn, TR2, k1, r1R, TSD, SD, WDD, sd, WND, ANG, ANGZ, ANGG, THP,
                PC, KC, TANP, MG, p1, r1, p3, r3, q1, s1, q3, s3, IB, IA, KVB, EB, KVA, EA, TSMETA, A2B, A1B, A0B, A2A, A1A, A0A, B1B, B1A,
                SIGA, TSRB, TSRA, eB, eA, ZD, WDA, sdA, PCA, KA, TESTS, RI, A, B, f)
RN = num5.R
deg = math.degrees
atd = lambda y, x: deg(math.atan(y / x))
ln15 = math.log(0.15)
C = []


def box(t, k, items): C.extend(calc_box(t, k, items))


# ---------- III · Paso 1 ----------
m0 = [abs(s0), abs(s0 + 7)]
box('III · Paso 1. Ganancia de referencia (no asumir que es uno)', 'III1', [
    ('s', 'Factor de amortiguamiento a partir del sobrepaso'),
    ('e', 'ζ=\\f{-\\t{ln}(\\%OS/100)}{\\r{π^2+\\t{ln}^2(\\%OS/100)}}'), ('g',),
    ('e', 'ζ=\\f{-\\t{ln}(0.15)}{\\r{π^2+\\t{ln}^2(0.15)}}=\\f{%.4f}{\\r{%.4f+%.4f}}=\\f{%.4f}{%.4f}' % (-ln15, math.pi ** 2, ln15 ** 2, -ln15, math.sqrt(math.pi ** 2 + ln15 ** 2))),
    ('g',), ('e', 'ζ=%.4f' % Z), ('g',),
    ('s', 'Ángulo de la recta de ζ (θ)'),
    ('e', 'θ=cos^{-1}ζ=cos^{-1}(%.4f)' % Z), ('g',), ('e', 'θ=%.2f°,  tanθ=%.4f' % (TH, TN)), ('g',),
    ('s', 'Parte real de los polos complejos'),
    ('e', 's^2+7s+K=0 ⇒ s=\\f{-7±\\r{49-4K}}{2}'),
    ('n', 'Si K > 49/4 = 12.25, la raíz es negativa y los polos son complejos con parte real −7/2 para cualquier K.'),
    ('e', 'σ=\\f{7}{2}=3.5'), ('g',),
    ('s', 'Punto sobre la recta de ζ (s~{0})'),
    ('e', 'ω_d=σtanθ=3.5(%.4f)=%.4f' % (TN, WD)), ('g',),
    ('e', 's_0=-3.5+j%.4f' % WD),
    ('n', 'La condición de ángulo se cumple sola: ∠s~{0} + ∠(s~{0} + 7) = %.2f° + %.2f° = 180°, porque el LGDR es la recta σ = −3.5.'
          % (180 - atd(WD, SG), atd(WD, 7 - SG))), ('g',),
    ('s', 'Ganancia de referencia (condición de magnitud)'),
    ('e', 'K=\\d{s_0}\\d{s_0+7},  \\d{s_0+a}=\\r{(a-σ)^2+ω_d^2}'),
    ('e', '\\d{s_0}=\\r{3.5^2+%.4f^2}=%.4f' % (WD, m0[0])),
    ('e', '\\d{s_0+7}=\\r{(7-3.5)^2+%.4f^2}=%.4f' % (WD, m0[1])),
    ('e', 'K=(%.4f)(%.4f)' % tuple(m0)), ('g',),
    ('e', 'K_{ref}=%.2f' % K0),
    ('n', 'Comprobación: en 2.º orden K = ω~{n}² = 3.5² + %.4f² = %.2f.' % (WD, WN ** 2)), ('g',),
    ('s', 'Si se asumiera K = 1'),
    ('e', 's^2+7s+1=0 ⇒ s=\\f{-7±\\r{49-4}}{2}=\\f{-7±%.4f}{2}' % math.sqrt(45)),
    ('e', 's=%.4f,   %.4f' % (k1[1], k1[0])),
    ('n', 'Las dos raíces son reales (sin oscilación): no corresponden a 15 % de sobrepaso, por eso no se puede asumir K = 1.')])

# ---------- III · Paso 2 ----------
box('III · Paso 2. Polos, ceros, tipo y ecuación característica', 'III2', [
    ('s', 'Polos y ceros de lazo abierto'),
    ('e', 'D(s)=0 ⇒ p_1, p_2,…,p_n'), ('e', 'N(s)=0 ⇒ z_1,…,z_m'), ('g',),
    ('e', 'D(s)=s(s+7)=0'), ('e', 'N(s)=1'), ('g',),
    ('e', 'p=0, -7'), ('e', 'n=2,   m=0'),
    ('s', 'Tipo del sistema'),
    ('e', 'G(s)=\\f{K N(s)}{s^N D_0(s)} ⇒ \\t{tipo}=N'),
    ('n', 'N = número de polos en el origen.'),
    ('e', 'G(s)=\\f{K}{s^1 (s+7)}'), ('g',), ('e', 'N=1 ⇒ \\t{tipo }1'),
    ('s', 'Ecuación característica'),
    ('e', '1+K G(s)=0 ⇒ D(s)+K N(s)=0'),
    ('e', 's(s+7)+K=0'), ('g',), ('e', 's^2+7s+K=0'),
    ('s', 'Ramas y asíntotas'),
    ('e', '\\t{núm. ramas}=n,  \\t{núm. asíntotas}=n-m'), ('e', 'n=2,   m=0,   n-m=2'),
    ('s', 'Tramos del eje real'),
    ('t', 'Entre 0 y −7 hay 1 polo(s)/cero(s) a la derecha, como es impar, pertenece al LGDR.'),
    ('t', 'A la izquierda de −7 hay 2 polo(s)/cero(s) a la derecha, como es par, no pertenece al LGDR.'),
    ('e', '[-7, 0]'),
    ('s', 'Asíntotas'),
    ('e', 'σ_a=\\f{∑p_i-∑z_i}{n-m}=\\f{0+(-7)}{2}=-3.5'),
    ('e', 'θ_a=\\f{(2k+1) 180°}{2},   k=0, 1 ⇒ θ_a=90°, 270°'),
    ('s', 'Punto de ruptura (σ~{b})'),
    ('e', 'K(σ)=-\\f{D(σ)}{N(σ)}=-(σ^2+7σ),   \\f{dK}{dσ}=0'),
    ('e', '-(2σ+7)=0 ⇒ σ_b=-3.5'),
    ('e', 'K_b=\\d{σ_b(σ_b+7)}=\\d{(-3.5)(3.5)}=12.25'),
    ('n', 'Para K > 12.25 los polos son complejos y se mueven por la recta σ = −3.5: la K de referencia (45.84) es mayor.')])

# ---------- III · Paso 3 ----------
box('III · Paso 3. Estabilidad y rango de ganancia estable', 'III3', [
    ('s', 'Arreglo de Routh, sin compensar (2.º orden)'),
    ('e', 's^2+a_1s+a_0=0'),
    ('e', '\\m{s^2&1&a_0\\\\s^1&a_1&0\\\\s^0&a_0&}'),
    ('n', 'Estable si toda la primera columna es positiva (a₁ > 0, a₀ > 0).'), ('g',),
    ('e', 's^2+7s+K=0'), ('e', 'a_1=7,   a_0=K'),
    ('e', '\\m{s^2&1&K\\\\s^1&7&0\\\\s^0&K&}'), ('g',),
    ('e', '7>0  \\t{y}  K>0'), ('g',), ('e', '0<K<∞'),
    ('n', 'Ninguna fila se anula para K > 0: no hay ganancia crítica ni cruce con el eje jω.'),
    ('s', 'Con la ganancia de referencia'),
    ('e', '\\t{primera columna: }1,   7,   %.2f>0 ⇒ \\t{estable}' % K0)])

# ---------- III · Paso 4 ----------
box('III · Paso 4. Polos en lazo cerrado con la ganancia de referencia', 'III4', [
    ('e', 's^2+7s+%.2f=0' % K0),
    ('e', 's=\\f{-7±\\r{49-4(%.2f)}}{2}=\\f{-7±\\r{%.2f}}{2}=\\f{-7±j%.4f}{2}' % (K0, 49 - 4 * K0, math.sqrt(4 * K0 - 49))), ('g',),
    ('e', 'p_{1,2}=-3.5±j%.4f' % WD),
    ('s', 'Comprobación con la suma y el producto de raíces'),
    ('e', 'p_1+p_2=-7=-a_1 ✓,   p_1p_2=3.5^2+%.4f^2=%.2f=a_0 ✓' % (WD, SG ** 2 + WD ** 2)),
    ('n', 'Sólo hay dos polos: el sistema es de segundo orden puro y las fórmulas de 2.º orden son exactas.')])

# ---------- III · Paso 5 ----------
q0 = SG ** 2 + WD ** 2
box('III · Paso 5. Respuesta transitoria y error estacionario', 'III5', [
    ('s', 'Parámetros del par dominante'),
    ('e', 'p_1=-σ+jω_d,   ω_n=\\r{σ^2+ω_d^2},   ζ=\\f{σ}{ω_n}'),
    ('e', 'ω_n=\\r{3.5^2+%.4f^2}=\\r{%.4f},   ζ=\\f{3.5}{%.4f}' % (WD, q0, WN)), ('g',),
    ('e', 'ω_n=%.4f  \\t{rad/s},   ζ=%.4f' % (WN, Z)),
    ('s', 'Sobrepaso correspondiente'),
    ('e', '\\%%OS=e^{-%.4fπ/\\r{1-%.4f^2}}×100=e^{-%.4f}×100' % (Z, Z, Z * math.pi / math.sqrt(1 - Z * Z))), ('g',),
    ('e', '\\%%OS=%.2f \\t{%%}' % OS2),
    ('s', 'Tiempo de asentamiento (inciso a)'),
    ('e', 'T_s=\\f{4}{ζω_n}=\\f{4}{σ}=\\f{4}{3.5}'), ('g',),
    ('e', 'T_s=%.4f \\t{s}' % TS2),
    ('s', 'Tiempo pico y tiempo de subida'),
    ('e', 'T_p=\\f{π}{ω_d}=\\f{π}{%.4f}=%.4f \\t{s}' % (WD, TP2)),
    ('e', 'T_r≈\\f{1.768(%.4f)^3-0.417(%.4f)^2+1.039(%.4f)+1}{%.4f}=\\f{%.4f}{%.4f}=%.4f \\t{s}' % (Z, Z, Z, WN, TRn, WN, TR2)),
    ('s', 'Error en estado estable (tipo 1)'),
    ('e', 'K_v=\\lim{s→0}{s\\f{%.2f}{s(s+7)}}=\\f{%.2f}{7}=%.4f' % (K0, K0, Kv0)),
    ('e', 'e_{rampa}(∞)=\\f{1}{%.4f}=%.4f' % (Kv0, E0)),
    ('n', 'Al escalón el error es cero, porque K~{p} = ∞ (tipo 1).')])

# ---------- IV · a) ----------
box('IV · a) Punto de diseño', 'IVa', [
    ('s', 'Tiempo de asentamiento deseado'),
    ('e', 'T_{s,d}=\\f{T_s}{3}=\\f{%.4f}{3}=%.4f \\t{s}' % (TS2, TSD)),
    ('s', 'Parte real y parte imaginaria del punto de diseño'),
    ('e', 'σ_d=\\f{4}{T_{s,d}}=\\f{4}{%.4f}=%.1f' % (TSD, SD)),
    ('n', 'Es lo mismo que 3σ = 3(3.5) = 10.5.'),
    ('e', 'ω_d=σ_dtanθ=10.5(%.4f)=%.4f' % (TN, WDD)), ('g',),
    ('e', 's_d=-10.5+j%.4f' % WDD),
    ('s', 'Comprobación: sigue sobre la recta de ζ'),
    ('e', 'ω_n=\\r{10.5^2+%.4f^2}=%.4f,   ζ=\\f{10.5}{%.4f}=%.4f ✓' % (WDD, WND, WND, SD / WND))])

# ---------- IV · b) ----------
box('IV · b) Ángulo con el cero del compensador', 'IVb', [
    ('s', 'Ángulos de los polos y del cero en s~{d}'),
    ('e', 's_d+7=-3.5+j%.4f,   s_d+10=-0.5+j%.4f' % (WDD, WDD)),
    ('n', 's~{d}, s~{d} + 7 y s~{d} + 10 tienen parte real negativa: los tres ángulos están en el segundo cuadrante (180° − tan⁻¹).'),
    ('e', '∠s_d=180°-tan^{-1}(\\f{%.4f}{10.5})=%.2f°' % (WDD, ANG[0])),
    ('e', '∠(s_d+7)=180°-tan^{-1}(\\f{%.4f}{3.5})=%.2f°' % (WDD, ANG[1])),
    ('e', '∠(s_d+10)=180°-tan^{-1}(\\f{%.4f}{0.5})=%.2f°' % (WDD, ANGZ)), ('g',),
    ('e', '∠(s_d+10)-∠s_d-∠(s_d+7)=%.2f°-%.2f°-%.2f°=%.2f°' % (ANGZ, ANG[0], ANG[1], ANGG)),
    ('s', 'Ángulo que debe restar el polo'),
    ('e', '%.2f°-θ_p=-180° ⇒ θ_p=%.2f°+180°' % (ANGG, ANGG)), ('g',),
    ('e', 'θ_p=%.2f°' % THP)])

# ---------- IV · c) ----------
pv = sd + PC
box('IV · c) Ubicación del polo (construcción geométrica)', 'IVc', [
    ('n', 'Triángulo entre s~{d} = −σ~{d} + jω~{d} y el polo en −p~{c}: el cateto vertical es ω~{d} y el horizontal p~{c} − σ~{d}.'),
    ('e', 'tanθ_p=\\f{ω_d}{p_c-σ_d}'),
    ('e', 'tan(%.2f°)=%.4f' % (THP, TANP)),
    ('e', 'p_c=σ_d+\\f{ω_d}{tanθ_p}=10.5+\\f{%.4f}{%.4f}=10.5+%.4f' % (WDD, TANP, WDD / TANP)), ('g',),
    ('e', 'p_c=%.4f ⇒ \\t{polo en }s=-%.4f' % (PC, PC)),
    ('s', 'Comprobación de la condición de ángulo'),
    ('e', '∠(s_d+p_c)=tan^{-1}(\\f{%.4f}{%.4f})=%.2f°' % (WDD, pv.real, atd(WDD, pv.real))),
    ('e', '%.2f°-%.2f°=%.2f° ✓' % (ANGG, atd(WDD, pv.real), ANGG - atd(WDD, pv.real)))])

# ---------- IV · d) ----------
box('IV · d) Ganancia con el adelanto (condición de magnitud)', 'IVd', [
    ('e', 'K=\\f{∏\\d{s_d-p_i}}{∏\\d{s_d-z_i}}=\\f{\\d{s_d}\\d{s_d+7}\\d{s_d+p_c}}{\\d{s_d+10}}'),
    ('e', '\\d{s_d}=\\r{10.5^2+%.4f^2}=%.4f' % (WDD, MG[0])),
    ('e', '\\d{s_d+7}=\\r{3.5^2+%.4f^2}=%.4f' % (WDD, MG[1])),
    ('e', '\\d{s_d+p_c}=\\r{%.4f^2+%.4f^2}=%.4f' % (pv.real, WDD, MG[2])),
    ('e', '\\d{s_d+10}=\\r{0.5^2+%.4f^2}=%.4f' % (WDD, MG[3])),
    ('e', 'K=\\f{(%.4f)(%.4f)(%.4f)}{%.4f}=\\f{%.1f}{%.4f}' % (MG[0], MG[1], MG[2], MG[3], MG[0] * MG[1] * MG[2], MG[3])), ('g',),
    ('e', 'K=%.1f' % KC)])

# ---------- IV · e) ----------
box('IV · e) Nueva ecuación característica y estabilidad', 'IVe', [
    ('s', 'Ecuación característica con el adelanto'),
    ('e', '1+K\\f{s+10}{s(s+7)(s+p_c)}=0 ⇒ s(s+7)(s+p_c)+K(s+10)=0'),
    ('e', 's^3+(7+p_c)s^2+7p_cs+Ks+10K=0'),
    ('e', 's^3+(7+%.4f)s^2+(7(%.4f)+K)s+10K=0' % (PC, PC)), ('g',),
    ('e', 's^3+%.4fs^2+(%.4f+K)s+10K=0' % (A2B, 7 * PC)),
    ('s', 'Arreglo de Routh con K como variable'),
    ('e', '\\m{s^3&1&%.2f+K\\\\s^2&%.2f&10K\\\\s^1&b_1&0\\\\s^0&10K&}' % (7 * PC, A2B)),
    ('e', 'b_1=\\f{%.4f(%.4f+K)-10K}{%.4f}=\\f{%.2f+%.4fK}{%.4f}' % (A2B, 7 * PC, A2B, A2B * 7 * PC, A2B - 10, A2B)), ('g',),
    ('e', 'b_1>0  \\t{y}  10K>0  \\t{para toda }K>0'), ('g',), ('e', '0<K<∞'),
    ('s', 'Tercer polo (suma de raíces)'),
    ('e', 'p_1+p_2+p_3=-%.4f ⇒ p_3=-%.4f-2(-10.5)=%.4f' % (A2B, A2B, p3)),
    ('e', '\\f{\\d{p_3}}{σ_d}=\\f{%.4f}{10.5}=%.3f<5' % (-p3, -p3 / SD)),
    ('n', 'Está casi tan cerca del eje como el par dominante y a %.4f del cero en −10: no hay cancelación (se revisa en VI · Paso 3).' % (-p3 - 10)),
    ('s', 'Forma del LGDR compensado'),
    ('e', 'n=3,   m=1,   n-m=2'),
    ('t', 'Tramos del eje real: entre 0 y −7 (1 a la derecha, impar) y entre −10 y −%.2f (3 a la derecha, impar).' % PC),
    ('e', '[-7, 0] ∪ [-%.2f, -10]' % PC),
    ('e', 'σ_a=\\f{(0-7-%.4f)-(-10)}{2}=%.4f,   θ_a=90°, 270°' % (PC, SIGA))])

# ---------- VI · Paso 1 ----------
qb = 10.5 ** 2 + WDD ** 2; qa = 10.5 ** 2 + WDA ** 2
box('VI · Paso 1. Ecuación característica final y todos los polos en lazo cerrado', 'VI1', [
    ('e', 's^3+(7+p_c)s^2+(7p_c+K)s+10K=0'),
    ('s', 'Diseño del libro (p~{c} = %.4f, K = %.1f)' % (PC, KC)),
    ('e', 's^3+%.4fs^2+(%.4f+%.1f)s+10(%.1f)=s^3+%.4fs^2+%.2fs+%.1f=0' % (A2B, 7 * PC, KC, KC, A2B, A1B, A0B)),
    ('e', '(s-p_1)(s-p_2)=s^2+21s+%.4f' % qb),
    ('e', '\\f{s^3+%.4fs^2+%.2fs+%.1f}{s^2+21s+%.4f}=s+%.4f' % (A2B, A1B, A0B, qb, -p3)), ('g',),
    ('e', 'p_{1,2}=-10.5±j%.4f,   p_3=%.4f' % (WDD, p3)),
    ('e', 'p_1p_2p_3=(%.4f)(%.4f)=%.1f=-a_0 ✓' % (qb, p3, qb * p3)),
    ('s', 'Diseño ajustado (p~{c} = %.4f, K = %.1f)' % (PCA, KA)),
    ('e', 's^3+%.4fs^2+(%.4f+%.1f)s+10(%.1f)=s^3+%.4fs^2+%.2fs+%.1f=0' % (A2A, 7 * PCA, KA, KA, A2A, A1A, A0A)),
    ('e', '(s-p_1)(s-p_2)=s^2+21s+%.4f' % qa),
    ('e', '\\f{s^3+%.4fs^2+%.2fs+%.1f}{s^2+21s+%.4f}=s+%.4f' % (A2A, A1A, A0A, qa, -q3)), ('g',),
    ('e', 'p_{1,2}=-10.5±j%.4f,   p_3=%.4f' % (WDA, q3)),
    ('e', 'p_1p_2p_3=(%.4f)(%.4f)=%.1f=-a_0 ✓' % (qa, q3, qa * q3))])

# ---------- VI · Paso 2 ----------
box('VI · Paso 2. Estabilidad y comparación con los polos candidatos', 'VI2', [
    ('s', 'Arreglo de Routh, sistema compensado (3.er orden)'),
    ('e', '\\m{s^3&1&a_1\\\\s^2&a_2&a_0\\\\s^1&b_1&0\\\\s^0&a_0&}'),
    ('e', 'b_1=\\f{a_2a_1-a_0}{a_2}'),
    ('s', 'Diseño del libro'),
    ('e', 'b_1=\\f{(%.4f)(%.2f)-%.1f}{%.4f}=%.2f' % (A2B, A1B, A0B, A2B, B1B)),
    ('e', '\\t{primera columna: }1,   %.2f,   %.2f,   %.1f>0 ⇒ \\t{estable}' % (A2B, B1B, A0B)),
    ('s', 'Diseño ajustado'),
    ('e', 'b_1=\\f{(%.4f)(%.2f)-%.1f}{%.4f}=%.2f' % (A2A, A1A, A0A, A2A, B1A)),
    ('e', '\\t{primera columna: }1,   %.2f,   %.2f,   %.1f>0 ⇒ \\t{estable}' % (A2A, B1A, A0A)),
    ('s', 'Con K como variable'),
    ('e', 'b_1=\\f{(7+p_c)(7p_c+K)-10K}{7+p_c}=\\f{7p_c(7+p_c)+(p_c-3)K}{7+p_c}'),
    ('n', 'Con p~{c} > 3 los dos términos son positivos para toda K > 0: no hay ganancia crítica.'),
    ('s', 'Diferencia entre el polo candidato y el obtenido'),
    ('e', '\\t{Dif.}=\\f{\\d{p_{obt}-s_d}}{\\d{s_d}}×100=%.1f \\t{%%}' % (abs(p1 - sd) / abs(sd) * 100)),
    ('n', 'El par dominante cae exactamente en s~{d} porque K se calculó con la condición de magnitud en ese punto.')])

# ---------- VI · Paso 3 ----------
def resid(K, pa, pb, pc_):
    return K * (pa + 10) / (pa * (pa - pb) * (pa - pc_))


d13 = p3 - p1; m13 = abs(d13) ** 2
r3c = KC * (p3 + 10) / (p3 * m13)
mr1 = KC * abs(p1 + 10) / (abs(p1) * abs(p1 - p1.conjugate()) * abs(p1 - p3))
a_r = [deg(cmath.phase(p1 + 10)), deg(cmath.phase(p1)), 90.0, deg(cmath.phase(p1 - p3))]
ar1 = a_r[0] - a_r[1] - a_r[2] - a_r[3]
ar1n = ar1 + 360 if ar1 < -180 else ar1
m13a = abs(q3 - q1) ** 2
box('VI · Paso 3. ¿Es razonable la aproximación de polos dominantes?', 'VI3', [
    ('s', 'Función de transferencia en lazo cerrado'),
    ('e', 'T(s)=\\f{K(s+10)}{s^3+(7+p_c)s^2+(7p_c+K)s+10K}=\\f{K(s+10)}{(s-p_1)(s-p_2)(s-p_3)}'),
    ('s', 'Descomposición de la respuesta al escalón'),
    ('e', 'C(s)=\\f{T(s)}{s}=\\f{r_0}{s}+\\f{r_1}{s-p_1}+\\f{r_2}{s-p_2}+\\f{r_3}{s-p_3}'),
    ('e', 'r_i=\\f{K(p_i+10)}{p_i∏_{j≠i}(p_i-p_j)},   r_0=T(0)=\\f{10K}{10K}=1'),
    ('n', 'Cada residuo es el peso del modo e^(pᵢt) en c(t): mientras más pequeño, menos influye en la respuesta.'),
    ('s', 'Diseño del libro: tercer polo p~{3} = −%.4f' % -p3),
    ('e', 'p_3+10=%.4f,   (p_3-p_1)(p_3-p_2)=%.4f^2+%.4f^2=%.4f' % (p3 + 10, d13.real, WDD, m13)),
    ('e', 'r_3=\\f{%.1f(%.4f)}{(%.4f)(%.4f)}=%.4f' % (KC, p3 + 10, p3, m13, r3c)),
    ('n', 'p₃ + 10 = %.4f no es pequeño: el cero no cancela al polo, y el residuo positivo suma al pico.' % (p3 + 10)),
    ('s', 'Diseño del libro: par dominante'),
    ('e', '\\d{p_1+10}=%.4f,  \\d{p_1}=%.4f,  \\d{p_1-p_2}=%.4f,  \\d{p_1-p_3}=%.4f' % (abs(p1 + 10), abs(p1), 2 * WDD, abs(p1 - p3))),
    ('e', '\\d{r_1}=\\f{%.1f(%.4f)}{(%.4f)(%.4f)(%.4f)}=%.4f' % (KC, abs(p1 + 10), abs(p1), 2 * WDD, abs(p1 - p3), mr1)),
    ('e', '∠r_1=%.2f°-(%.2f°+90°+%.2f°)=%.2f°' % (a_r[0], a_r[1], a_r[3], ar1n)),
    ('e', 'r_1=%.4f+j%.4f,   r_2=%.4f-j%.4f' % (r1.real, r1.imag, r1.real, r1.imag)),
    ('e', 'c(0)=1+2(%.4f)+%.4f=%.4f ✓' % (r1.real, r3c, abs(1 + 2 * r1.real + r3c))),
    ('e', '\\f{r_3}{\\d{r_1}}=\\f{%.4f}{%.4f}=%.3f' % (r3c, mr1, r3c / mr1)),
    ('s', 'Diseño ajustado'),
    ('e', 'r_3=\\f{%.1f(%.4f+10)}{(%.4f)(%.4f)}=%.4f' % (KA, q3, q3, m13a, s3)),
    ('e', 'r_{1,2}=%.4f±j%.4f,   \\d{r_1}=%.4f' % (s1.real, s1.imag, abs(s1))),
    ('e', 'c(0)=1+2(%.4f)+%.4f=%.4f ✓' % (s1.real, s3, abs(1 + 2 * s1.real + s3))),
    ('n', 'En el ajustado el tercer modo pesa todavía más, pero el par dominante está más amortiguado (ζ~{d} = %.4f), así que el total da 15 %%.' % ZD)])

# ---------- VI · Paso 4 ----------
box('VI · Paso 4. Error estacionario correspondiente (analítico)', 'VI4', [
    ('e', 'K_p=\\lim{s→0}{K\\f{s+10}{s(s+7)(s+p_c)}}=∞ ⇒ e_{esc}(∞)=0'),
    ('e', 'K_v=\\lim{s→0}{sK\\f{s+10}{s(s+7)(s+p_c)}}=\\f{10K}{7p_c}'),
    ('s', 'Diseño del libro'),
    ('e', 'K_v=\\f{10(%.1f)}{7(%.4f)}=\\f{%.1f}{%.3f}=%.4f,   e_{rampa}(∞)=\\f{1}{%.4f}=%.4f' % (KC, PC, 10 * KC, 7 * PC, KVB, KVB, EB)),
    ('s', 'Diseño ajustado'),
    ('e', 'K_v=\\f{10(%.1f)}{7(%.4f)}=\\f{%.1f}{%.3f}=%.4f,   e_{rampa}(∞)=\\f{1}{%.4f}=%.4f' % (KA, PCA, 10 * KA, 7 * PCA, KVA, KVA, EA)),
    ('s', 'Mejora respecto al sistema sin compensar'),
    ('e', '\\f{%.4f}{%.4f}=%.2f,   \\f{%.4f}{%.4f}=%.2f' % (E0, EB, E0 / EB, E0, EA, E0 / EA))])


# ---------- VII · Paso 5 ----------
def cfun(r1_, r3_, p1_, p3_):
    sg = -p1_.real; wd = p1_.imag; Ac = -2 * r1_.real; Bc = 2 * r1_.imag
    ct = lambda t: 1 + r3_ * math.exp(p3_ * t) - math.exp(-sg * t) * (Ac * math.cos(wd * t) + Bc * math.sin(wd * t))
    return sg, wd, Ac, Bc, ct


def brk(ct, a, b, h):
    """último cruce de la banda ±2 % entre a y b (paso h)"""
    t = b
    while t > a and abs(ct(t) - 1) <= 0.02: t -= h
    return t, t + h


items = [('s', 'Armado de c(t) (Laplace inversa de cada término)'),
         ('e', 'r_1e^{p_1t}+r_2e^{p_2t}=2e^{-σt}[a cos(ω_dt)-b \\t{sen}(ω_dt)],   r_1=a+jb')]
for nm, (rr1, rr3, pp1, pp3, I) in (('Diseño del libro', (r1, r3, p1, p3, IB)), ('Diseño ajustado', (s1, s3, q1, q3, IA))):
    sg, wd, Ac, Bc, ct = cfun(rr1, rr3, pp1, pp3)
    tp = I['tp']; t0 = math.floor(tp * 100) / 100
    ta, tb = brk(ct, 0.2, 1.0, 0.01)
    items += [('s', nm),
              ('e', 'c(t)=1+%.4fe^{-%.4f t}-e^{-10.5 t}[%.4f cos(%.4f t)+%.4f \\t{sen}(%.4f t)]' % (rr3, -pp3, Ac, wd, Bc, wd)),
              ('e', 'c(0)=1+%.4f-%.4f=%.4f ✓' % (rr3, Ac, abs(1 + rr3 - Ac))),
              ('t', 'Tiempo pico (c′(t) = 0), con calculadora:'),
              ('e', 'c(%.2f)=%.4f,   c(%.4f)=%.4f,   c(%.2f)=%.4f' % (t0, ct(t0), tp, ct(tp), t0 + 0.01, ct(t0 + 0.01))),
              ('e', 't_p=%.4f \\t{s},   \\%%OS=\\f{%.4f-1}{1}×100=%.2f \\t{%%}' % (tp, I['pk'], I['os'])),
              ('t', 'Tiempo de asentamiento (último instante con |c(t) − 1| = 0.02):'),
              ('e', 'c(%.2f)=%.4f,   c(%.2f)=%.4f ⇒ T_s=%.3f \\t{s}' % (ta, ct(ta), tb, ct(tb), I['ts']))]
items += [('s', 'Comparación con la meta'),
          ('e', 'T_{s,meta}=\\f{%.4f}{3}=%.4f \\t{s}' % (TS2, TSMETA)),
          ('e', '\\t{Libro: }%.2f \\t{%%}>15 \\t{%%} ✗,   %.3f>%.3f ✗' % (IB['os'], IB['ts'], TSMETA)),
          ('e', '\\t{Ajustado: }%.2f \\t{%%} ✓,   %.3f<%.3f ✓' % (IA['os'], IA['ts'], TSMETA)),
          ('n', 'Sin compensar, el modelo completo da %.2f %%, t~{p} = %.3f s y T~{s} = %.3f s (stepinfo).' % (RI['os'], RI['tp'], RI['ts']))]
box('VII · Paso 5. Simulación de las entradas requeridas y desempeño del modelo completo', 'VII5', items)

# ---------- VII · Paso 6 ----------
items = [('s', 'Error ante rampa en el tiempo'),
         ('e', 'e(t)=t-c_{rampa}(t),   c_{rampa}(t)=r_0t+∑\\f{r_i}{p_i}(e^{p_it}-1)'),
         ('e', 'e(∞)=∑\\f{r_i}{p_i}   \\t{(con }r_0=1\\t{)}')]
for nm, (rr1, rr3, pp1, pp3, E) in (('Diseño del libro', (r1, r3, p1, p3, EB)), ('Diseño ajustado', (s1, s3, q1, q3, EA))):
    a = rr1 / pp1; b = rr3 / pp3
    items += [('s', nm), ('e', '\\f{r_1}{p_1}+\\f{r_2}{p_2}+\\f{r_3}{p_3}=2(%.4f)+(%.4f)=%.4f ✓' % (a.real, b, 2 * a.real + b))]
items += [('s', 'Valores simulados'),
          ('e', 'e_u(3)=%.4f,   e_b(3)=%.4f,   e_a(3)=%.4f' % (RN['ref_e'], eB(np.array([3.0]))[0], eA(np.array([3.0]))[0])),
          ('n', 'El modo más lento con adelanto es el par dominante (τ = 1/10.5 = 0.095 s): a los 3 s el error ya llegó a su valor final.')]
box('VII · Paso 6. Error estacionario simulado', 'VII6', items)

# ---------- VII · Paso 7 ----------
angA = A['angs']; angzA = A['angz']; thpA = A['thp']; pvA = sdA + PCA
MA = [abs(sdA), abs(sdA + 7), abs(sdA + PCA), abs(sdA + 10)]
items = [('s', 'Criterio del ajuste'),
         ('n', 'Se conservan σ~{d} = 10.5 (T~{s}) y el cero en −10 (enunciado); se sube ζ~{d} para compensar el sobrepaso que agrega el tercer polo.'),
         ('e', 's_d=-10.5+j10.5tan(cos^{-1}ζ_d)'),
         ('t', 'Para cada ζ~{d} se repiten IV · b)–d) y se simula el modelo completo:')]
for z, d, o in TESTS:
    items.append(('e', 'ζ_d=%.3f:   ω_d=%.3f,   p_c=%.3f,   K=%.1f,   \\%%OS=%.2f \\t{%%}' % (z, d['wd'], d['pc'], d['K'], o)))
items += [('t', 'Entre 0.60 y 0.65 el sobrepaso cruza 15 %; por bisección (fzero):'),
          ('e', 'ζ_d=%.4f,   θ=%.2f°,   tanθ=%.4f' % (ZD, deg(math.acos(ZD)), WDA / 10.5)),
          ('s', 'Punto, ángulos y polo con ζ~{d} = %.4f' % ZD),
          ('e', 's_d=-10.5+j%.4f' % WDA),
          ('e', '∠s_d=%.2f°,  ∠(s_d+7)=%.2f°,  ∠(s_d+10)=%.2f°' % (angA[0], angA[1], angzA)),
          ('e', 'θ_p=%.2f°-%.2f°-%.2f°+180°=%.2f°' % (angzA, angA[0], angA[1], thpA)),
          ('e', 'p_c=10.5+\\f{%.4f}{tan(%.2f°)}=10.5+%.4f=%.4f' % (WDA, thpA, WDA / math.tan(math.radians(thpA)), PCA)),
          ('s', 'Ganancia'),
          ('e', 'K=\\f{(%.4f)(%.4f)(%.4f)}{%.4f}=%.1f' % tuple(MA + [KA])),
          ('s', 'Re‑verificación'),
          ('e', 's^3+%.4fs^2+%.2fs+%.1f=0 ⇒ p_{1,2}=-10.5±j%.4f,   p_3=%.4f' % (A2A, A1A, A0A, WDA, q3)),
          ('e', '\\%%OS=%.2f \\t{%%},   T_s=%.3f \\t{s},   T_p=%.3f \\t{s},   e_{rampa}(∞)=%.4f' % (IA['os'], IA['ts'], IA['tp'], EA))]
box('VII · Paso 7. Ajuste del diseño y repetición de la verificación', 'VII7', items)
