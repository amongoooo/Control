# Anexo «C. Cálculos» de la P3 (mismo orden que el reporte, desarrollo completo).
import math, cmath
import numpy as np
from build import calc_box
import num3
from p3 import (Z, TH, TN, s0, K0, WN, WD, Kv0, E0, OS2, TS2, TP2, TRn, TR2, k1, A, B, pA, rA1, p3A, r3A, pB, rB1, p3B, r3B,
                KA, KB, IA, IB, mejA, mejB, difA, angd, magd, eA20, eA60, tailA, tailB, f)
RN = num3.R
deg = math.degrees
atd = lambda y, x: deg(math.atan(y / x))
ln15 = math.log(0.15)
C = []


def box(t, k, items): C.extend(calc_box(t, k, items))


# ---------- III · Paso 1 ----------
s = 3.5
tr = lambda sig: 180 - TH + atd(sig * TN, 7 - sig)
box('III · Paso 1. Ganancia de referencia (no asumir que es uno)', 'III1', [
    ('s', 'Factor de amortiguamiento a partir del sobrepaso'),
    ('e', 'ζ=\\f{-\\t{ln}(\\%OS/100)}{\\r{π^2+\\t{ln}^2(\\%OS/100)}}'), ('g',),
    ('e', 'ζ=\\f{-\\t{ln}(0.15)}{\\r{π^2+\\t{ln}^2(0.15)}}=\\f{%.4f}{\\r{%.4f+%.4f}}=\\f{%.4f}{%.4f}' % (-ln15, math.pi ** 2, ln15 ** 2, -ln15, math.sqrt(math.pi ** 2 + ln15 ** 2))),
    ('g',), ('e', 'ζ=%.4f' % Z), ('g',),
    ('s', 'Ángulo de la recta de ζ (θ)'),
    ('e', 'θ=cos^{-1}ζ=cos^{-1}(%.4f)' % Z), ('g',), ('e', 'θ=%.2f°,  tanθ=%.4f' % (TH, TN)), ('g',),
    ('s', 'Punto sobre la recta de ζ (s~{0}) con la condición de ángulo'),
    ('e', 's=-σ+jω_d,   ω_d=σtanθ'),
    ('e', '-∑∠(s-p_i)=-[∠s+∠(s+7)]=±180°'),
    ('n', 'Sobre la recta, ∠s = 180° − θ = %.2f° para cualquier σ; ∠(s + 7) = tan⁻¹[ω~{d}/(7 − σ)]. Se prueban valores de σ:' % (180 - TH)),
    ('e', 'σ=3.0: ∑∠=%.2f°,   σ=3.5: ∑∠=%.2f°,   σ=4.0: ∑∠=%.2f°' % (tr(3.0), tr(3.5), tr(4.0))),
    ('t', 'La suma vale 180° exactamente cuando ∠(s + 7) = θ, es decir, cuando 7 − σ = σ:'),
    ('e', '7-σ=σ ⇒ σ=3.5,   ω_d=3.5(%.4f)=%.4f' % (TN, WD)),
    ('e', '∠s_0=180°-tan^{-1}(\\f{%.4f}{3.5})=%.2f°,   ∠(s_0+7)=tan^{-1}(\\f{%.4f}{3.5})=%.2f°' % (WD, 180 - TH, WD, TH)),
    ('e', '-(%.2f°+%.2f°)=-180.00° ≡ ±180°' % (180 - TH, TH)), ('g',),
    ('e', 's_0=-3.5+j%.4f' % WD), ('g',),
    ('s', 'Ganancia de referencia (condición de magnitud)'),
    ('e', 'K=\\f{∏\\d{s_0-p_i}}{∏\\d{s_0-z_i}},  \\d{s_0+a}=\\r{(a-σ)^2+ω_d^2}'),
    ('n', 'Sin ceros finitos, el denominador vale 1.'), ('g',),
    ('e', '\\d{s_0}=\\r{3.5^2+%.4f^2}=%.4f' % (WD, WN)),
    ('e', '\\d{s_0+7}=\\r{(7-3.5)^2+%.4f^2}=%.4f' % (WD, WN)),
    ('e', 'K=\\f{(%.4f)(%.4f)}{1}' % (WN, WN)), ('g',),
    ('e', 'K_{ref}=%.2f' % K0), ('g',),
    ('s', 'Si se asumiera K = 1'),
    ('e', 's^2+7s+1=0'),
    ('e', 's=\\f{-7±\\r{7^2-4(1)(1)}}{2}=\\f{-7±\\r{45}}{2}=\\f{-7±6.7082}{2}'),
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
    ('e', '\\t{núm. ramas}=n,  \\t{núm. asíntotas}=n-m'), ('e', 'n=2,   m=0,   n-m=2'), ('g',),
    ('e', '\\t{núm. ramas}=2,  \\t{núm. asíntotas}=2'),
    ('s', 'Tramos del eje real'),
    ('t', 'Entre 0 y −7 hay 1 polo(s)/cero(s) a la derecha, como es impar, pertenece al LGDR.'),
    ('t', 'Entre −7 y −∞ hay 2 polo(s)/cero(s) a la derecha, como es par, no pertenece al LGDR.'),
    ('e', '[-7, 0]'),
    ('s', 'Centroide de las asíntotas (σ~{a})'),
    ('e', 'σ_a=\\f{∑p_i-∑z_i}{n-m}'),
    ('e', 'σ_a=\\f{(0)+(-7)-0}{2-0}=\\f{-7}{2}'), ('g',), ('e', 'σ_a=-3.5'),
    ('s', 'Ángulos de las asíntotas (θ~{a})'),
    ('e', 'θ_a=\\f{(2k+1) 180°}{n-m}'), ('e', 'k=0, 1,…,n-m-1'),
    ('e', 'θ_a=\\f{(2k+1) 180°}{2},   k=0, 1'), ('g',), ('e', 'θ_a=90°, 270°'),
    ('s', 'Punto de ruptura (σ~{b})'),
    ('e', 'K(σ)=-\\f{D(σ)}{N(σ)},   \\f{dK}{dσ}=0'),
    ('e', 'N(σ) D\'(σ)-N\'(σ) D(σ)=0'),
    ('e', 'N=1 ⇒ D\'(σ)=0'),
    ('e', 'D(σ)=σ^2+7σ ⇒ D\'(σ)=2σ+7=0'), ('g',),
    ('e', 'σ_b=-3.5  \\t{(está en LGDR)}'),
    ('s', 'Ganancia en el punto de ruptura (K~{b})'),
    ('e', 'K_b=\\d{\\f{D(σ_b)}{N(σ_b)}}'),
    ('e', 'D(σ_b)=σ_b(σ_b+7)=(-3.5)(-3.5+7)=(-3.5)(3.5)'),
    ('e', 'K_b=\\d{\\f{(-3.5)(3.5)}{1}}'), ('g',), ('e', 'K_b=12.25'),
    ('n', 'Para K > 12.25 los polos son complejos con parte real −3.5: la rama sube en vertical (asíntotas a ±90°).')])

# ---------- III · Paso 3 ----------
box('III · Paso 3. Estabilidad y rango de ganancia estable', 'III3', [
    ('s', 'Arreglo de Routh, sistema (2.º orden)'),
    ('e', 's^2+a_1s+a_0=0'),
    ('e', '\\m{s^2&1&a_0\\\\s^1&a_1&0\\\\s^0&a_0&}'), ('g',),
    ('e', 's^2+7s+K=0'), ('e', 'a_1=7,   a_0=K'),
    ('e', '\\m{s^2&1&K\\\\s^1&7&0\\\\s^0&K&}'), ('g',),
    ('e', '7>0 \\t{ siempre},   K>0'), ('g',), ('e', '0<K<∞'),
    ('s', 'Ganancia crítica y cruce con el eje jω'),
    ('n', 'Para cruzar el eje jω tendría que anularse un elemento de la primera columna con K > 0; la fila s¹ vale 7 para toda K.'),
    ('e', '\\t{No hay }K_{crít}\\t{: el LGDR nunca cruza el eje }jω')])

# ---------- III · Paso 4 ----------
disc = 49 - 4 * K0
box('III · Paso 4. Polos en lazo cerrado con la ganancia de referencia', 'III4', [
    ('s', 'Ecuación característica con la ganancia de referencia'),
    ('e', 's^2+7s+K=0'), ('e', 'K=%.2f:' % K0), ('e', 's^2+7s+%.2f=0' % K0),
    ('s', 'Raíces (fórmula general)'),
    ('e', 's=\\f{-7±\\r{7^2-4(%.2f)}}{2}=\\f{-7±\\r{%.2f}}{2}' % (K0, disc)),
    ('e', 's=-3.5±j\\f{\\r{%.2f}}{2}=-3.5±j%.4f' % (-disc, WD)), ('g',),
    ('e', 'p_{1,2}=-3.5±j%.4f' % WD),
    ('s', 'Comprobación con la suma y el producto de raíces'),
    ('e', 'p_1+p_2=2(-3.5)=-7=-a_1 ✓'),
    ('e', 'p_1p_2=3.5^2+%.4f^2=%.2f=a_0 ✓' % (WD, K0))])

# ---------- III · Paso 5 ----------
box('III · Paso 5. Respuesta transitoria y error estacionario', 'III5', [
    ('s', 'Parámetros del par dominante'),
    ('e', 'p_1=-σ+jω_d,   ω_n=\\r{σ^2+ω_d^2},   ζ=\\f{σ}{ω_n}'),
    ('e', 'σ=3.5,   ω_d=%.4f' % WD),
    ('e', 'ω_n=\\r{3.5^2+%.4f^2}=\\r{%.2f},   ζ=\\f{3.5}{%.4f}' % (WD, K0, WN)), ('g',),
    ('e', 'ω_n=%.4f  \\t{rad/s},   ζ=%.4f' % (WN, Z)),
    ('s', 'Sobrepaso correspondiente'),
    ('e', '\\%OS=e^{-ζπ/\\r{1-ζ^2}}×100'),
    ('e', '\\%%OS=e^{-%.4fπ/\\r{1-%.4f^2}}×100=e^{-%.4f}×100' % (Z, Z, Z * math.pi / math.sqrt(1 - Z * Z))), ('g',),
    ('e', '\\%%OS=%.2f \\t{%%}' % OS2),
    ('s', 'Estimaciones de 2.º orden'),
    ('e', 'T_s=\\f{4}{ζω_n}=\\f{4}{σ},   T_p=\\f{π}{ω_d}'),
    ('e', 'T_r≈\\f{1.768ζ^3-0.417ζ^2+1.039ζ+1}{ω_n}  \\t{(Nise, cap. 4)}'),
    ('e', 'T_s=\\f{4}{3.5},   T_p=\\f{π}{%.4f}' % WD),
    ('e', 'T_r≈\\f{1.768(%.4f)^3-0.417(%.4f)^2+1.039(%.4f)+1}{%.4f}=\\f{%.4f}{%.4f}' % (Z, Z, Z, WN, TRn, WN)), ('g',),
    ('e', 'T_s=%.4f \\t{s},   T_p=%.4f \\t{s},   T_r≈%.4f \\t{s}' % (TS2, TP2, TR2)),
    ('s', 'Error ante rampa unitaria (tipo 1) — inciso a)'),
    ('e', 'K_v=\\lim{s→0}{sKG(s)},   e_{rampa}(∞)=\\f{1}{K_v}'),
    ('e', 'K_v=\\lim{s→0}{s\\f{%.2f}{s(s+7)}}=\\lim{s→0}{\\f{%.2f}{s+7}}=\\f{%.2f}{7}' % (K0, K0, K0)),
    ('e', 'e_{rampa}(∞)=\\f{1}{%.4f}' % Kv0), ('g',),
    ('e', 'K_v=%.4f,   e_{rampa}(∞)=%.4f' % (Kv0, E0)),
    ('n', 'Al escalón el error es cero, porque K~{p} = ∞ (tipo 1).')])

# ---------- IV · a) ----------
box('IV · a) Cómo el atraso multiplica K~{v}', 'IVa', [
    ('s', 'Constante de velocidad con el compensador'),
    ('e', 'KG_c(s)G(s)=K\\f{s+z_c}{s+p_c}·\\f{1}{s(s+7)}'),
    ('e', 'K_{v,comp}=\\lim{s→0}{sK\\f{s+z_c}{(s+p_c)s(s+7)}}=\\f{Kz_c}{7p_c}=\\f{K}{7}·\\f{z_c}{p_c}'),
    ('s', 'Mejora del error (si K casi no cambia)'),
    ('e', '\\f{e_{sin}}{e_{comp}}=\\f{1/K_v}{1/K_{v,comp}}=\\f{K_{v,comp}}{K_v}=\\f{z_c}{p_c}'),
    ('e', '\\f{z_c}{p_c}=20'),
    ('s', 'Elección del dipolo'),
    ('n', 'El polo se pone muy cerca del origen para que el par polo-cero casi no aporte ángulo en s₀; el libro usa p~{c} = 0.01.'),
    ('e', 'p_c=0.01 ⇒ z_c=20(0.01)=0.2'), ('g',),
    ('e', 'e_{meta}(∞)=\\f{e_{sin}}{20}=\\f{%.4f}{20}=%.5f' % (E0, E0 / 20))])

# ---------- IV · b) ----------
z1 = s0 + 0.2; z2 = s0 + 0.01
box('IV · b) Ubicación del dipolo', 'IVb', [
    ('s', 'Ángulo del compensador en s~{0}'),
    ('e', '∠G_c(s_0)=∠(s_0+0.2)-∠(s_0+0.01)'),
    ('e', 's_0+0.2=-3.5+j%.4f+0.2=%.2f+j%.4f' % (WD, z1.real, WD)),
    ('e', 's_0+0.01=-3.5+j%.4f+0.01=%.2f+j%.4f' % (WD, z2.real, WD)),
    ('n', 'Las dos partes reales son negativas: los ángulos están en el segundo cuadrante, 180° − tan⁻¹(ω~{d}/|parte real|).'),
    ('e', '∠(s_0+0.2)=180°-tan^{-1}(\\f{%.4f}{%.2f})=180°-%.2f°=%.2f°' % (WD, -z1.real, atd(WD, -z1.real), 180 - atd(WD, -z1.real))),
    ('e', '∠(s_0+0.01)=180°-tan^{-1}(\\f{%.4f}{%.2f})=180°-%.2f°=%.2f°' % (WD, -z2.real, atd(WD, -z2.real), 180 - atd(WD, -z2.real))), ('g',),
    ('e', '∠G_c(s_0)=%.2f°-%.2f°=%.2f°' % (180 - atd(WD, -z1.real), 180 - atd(WD, -z2.real), angd)),
    ('s', 'Magnitud del compensador en s~{0}'),
    ('e', '\\d{s_0+0.2}=\\r{%.2f^2+%.4f^2}=%.4f' % (-z1.real, WD, abs(z1))),
    ('e', '\\d{s_0+0.01}=\\r{%.2f^2+%.4f^2}=%.4f' % (-z2.real, WD, abs(z2))), ('g',),
    ('e', '\\d{G_c(s_0)}=\\f{%.4f}{%.4f}=%.4f' % (abs(z1), abs(z2), magd)),
    ('n', 'Ángulo casi 0° y magnitud casi 1: el punto de operación casi no se mueve al agregar el compensador.')])

# ---------- IV · c) ----------
box('IV · c) Nueva ecuación característica y estabilidad', 'IVc', [
    ('s', 'Ecuación característica con el atraso'),
    ('e', '1+K\\f{s+0.2}{s(s+7)(s+0.01)}=0 ⇒ s(s+7)(s+0.01)+K(s+0.2)=0'),
    ('e', 's(s+7)(s+0.01)=s(s^2+7.01s+0.07)=s^3+7.01s^2+0.07s'),
    ('e', 's^3+7.01s^2+0.07s+Ks+0.2K=0'), ('g',),
    ('e', 's^3+7.01s^2+(0.07+K)s+0.2K=0'),
    ('s', 'Arreglo de Routh con K como variable'),
    ('e', '\\m{s^3&1&0.07+K\\\\s^2&7.01&0.2K\\\\s^1&b_1&0\\\\s^0&0.2K&}'),
    ('e', 'b_1=\\f{7.01(0.07+K)-0.2K}{7.01}=\\f{0.4907+6.81K}{7.01}'), ('g',),
    ('e', 'b_1>0 ⇒ K>-0.072,   0.2K>0 ⇒ K>0'), ('g',),
    ('e', '0<K<∞'),
    ('n', 'El atraso no quita estabilidad: el sistema compensado es estable para cualquier K > 0.')])

# ---------- IV · d) ----------
ta = lambda sig: num3.angsum(sig, [-0.2], [0, -7, -0.01])
sg = -pA.real; wd = pA.imag; sA = pA
ang = [180 - atd(wd, sg - 0.2), 180 - TH, atd(wd, 7 - sg), 180 - atd(wd, sg - 0.01)]
mg = [abs(sA), abs(sA + 7), abs(sA + 0.01), abs(sA + 0.2)]
box('IV · d) Nueva búsqueda de K sobre ζ = 0.517', 'IVd', [
    ('s', 'Condición de ángulo con el compensador'),
    ('e', '∑∠(s-z_i)-∑∠(s-p_i)=±180°'),
    ('e', '∠(s+0.2)-[∠s+∠(s+7)+∠(s+0.01)]=±180°'),
    ('n', 'Sobre la recta de ζ se cumple siempre ∠s = 180° − θ = %.2f°. Se prueban valores de σ (con ω~{d} = σ tan θ):' % (180 - TH)),
    ('e', 'σ=3.2: %.2f°,   σ=3.3: %.2f°,   σ=3.4: %.2f°,   σ=3.5: %.2f°' % (ta(3.2), ta(3.3), ta(3.4), ta(3.5))),
    ('e', 'σ≈3.4+\\f{-180-(%.2f)}{%.2f-(%.2f)}(3.5-3.4)=%.3f' % (ta(3.4), ta(3.5), ta(3.4), 3.4 + (-180 - ta(3.4)) / (ta(3.5) - ta(3.4)) * 0.1)),
    ('t', 'Afinando con la calculadora:'),
    ('e', 'σ=%.4f,   ω_d=%.4f(%.4f)=%.4f' % (sg, sg, TN, wd)),
    ('e', '∠(s_0+0.2)=180°-tan^{-1}(\\f{%.4f}{%.4f})=%.2f°' % (wd, sg - 0.2, ang[0])),
    ('e', '∠s_0=180°-tan^{-1}(\\f{%.4f}{%.4f})=%.2f°' % (wd, sg, ang[1])),
    ('e', '∠(s_0+7)=tan^{-1}(\\f{%.4f}{7-%.4f})=%.2f°' % (wd, sg, ang[2])),
    ('e', '∠(s_0+0.01)=180°-tan^{-1}(\\f{%.4f}{%.4f})=%.2f°' % (wd, sg - 0.01, ang[3])),
    ('e', '%.2f°-(%.2f°+%.2f°+%.2f°)=%.2f° ≡ ±180°' % (ang[0], ang[1], ang[2], ang[3], ang[0] - ang[1] - ang[2] - ang[3])), ('g',),
    ('e', 's_0=-%.4f+j%.4f' % (sg, wd)),
    ('s', 'Ganancia por la condición de magnitud'),
    ('e', 'K=\\f{∏\\d{s_0-p_i}}{∏\\d{s_0-z_i}}=\\f{\\d{s_0}\\d{s_0+7}\\d{s_0+0.01}}{\\d{s_0+0.2}}'),
    ('e', '\\d{s_0}=\\r{%.4f^2+%.4f^2}=%.4f' % (sg, wd, mg[0])),
    ('e', '\\d{s_0+7}=\\r{(7-%.4f)^2+%.4f^2}=%.4f' % (sg, wd, mg[1])),
    ('e', '\\d{s_0+0.01}=\\r{%.4f^2+%.4f^2}=%.4f' % (sg - 0.01, wd, mg[2])),
    ('e', '\\d{s_0+0.2}=\\r{%.4f^2+%.4f^2}=%.4f' % (sg - 0.2, wd, mg[3])),
    ('e', 'K=\\f{(%.4f)(%.4f)(%.4f)}{%.4f}=\\f{%.2f}{%.4f}' % (mg[0], mg[1], mg[2], mg[3], mg[0] * mg[1] * mg[2], mg[3])), ('g',),
    ('e', 'K=%.2f' % KA),
    ('e', '\\f{K_{ref}-K}{K_{ref}}×100=\\f{%.2f-%.2f}{%.2f}×100=%.1f \\t{%%}' % (K0, KA, K0, (K0 - KA) / K0 * 100)),
    ('s', 'Tercer polo (suma de raíces)'),
    ('e', 'p_1+p_2+p_3=-7.01 ⇒ p_3=-7.01-2(-%.4f)=%.4f' % (sg, p3A))])

# ---------- IV · e) ----------
box('IV · e) Error compensado y mejora', 'IVe', [
    ('s', 'Constante de velocidad y error — incisos c) y d)'),
    ('e', 'K_v=\\f{K}{7}·\\f{z_c}{p_c}=\\f{%.2f}{7}·\\f{0.2}{0.01}=(%.4f)(20)' % (KA, KA / 7)), ('g',),
    ('e', 'K_v=%.2f' % A['Kv']),
    ('e', 'e_{rampa}(∞)=\\f{1}{%.2f}=%.5f' % (A['Kv'], A['e'])),
    ('s', 'Mejora lograda'),
    ('e', '\\t{mejora}=\\f{e_{sin}}{e_{comp}}=\\f{%.4f}{%.5f}=%.2f' % (E0, A['e'], mejA)),
    ('e', '\\t{también: }\\f{K_{v,comp}}{K_v}=\\f{%.2f}{%.4f}=%.2f' % (A['Kv'], Kv0, mejA)),
    ('n', 'Libro: e(∞) = 0.0078 y mejora 19.58 (0.1527/0.0078, con el error redondeado). No es 20 exacto porque K bajó %.1f %%.' % ((K0 - KA) / K0 * 100))])

# ---------- VI · Paso 1 ----------
a1 = 0.07 + KA; a0 = 0.2 * KA; q = sg ** 2 + wd ** 2
box('VI · Paso 1. Ecuación característica final y todos los polos en lazo cerrado', 'VI1', [
    ('e', '1+KG_c(s)G(s)=0,   G_c(s)=\\f{s+0.2}{s+0.01}'),
    ('e', 's(s+7)(s+0.01)+K(s+0.2)=s^3+7.01s^2+(0.07+K)s+0.2K=0'),
    ('e', 's^3+7.01s^2+(0.07+%.2f)s+0.2(%.2f)=s^3+7.01s^2+%.2f s+%.3f=0' % (KA, KA, a1, a0)),
    ('s', 'Polos (par conocido de IV · d y suma de raíces)'),
    ('e', '(s-p_1)(s-p_2)=s^2+2σs+(σ^2+ω_d^2)=s^2+%.4f s+%.4f' % (2 * sg, q)),
    ('e', '\\f{s^3+7.01s^2+%.2f s+%.3f}{s^2+%.4f s+%.4f}=s+%.4f' % (a1, a0, 2 * sg, q, -p3A)), ('g',),
    ('e', 'p_{1,2}=-%.4f±j%.4f,   p_3=%.4f' % (sg, wd, p3A)),
    ('s', 'Comprobación con la suma y el producto de raíces'),
    ('e', 'p_1+p_2+p_3=2(-%.4f)+(%.4f)=-7.01=-a_2 ✓' % (sg, p3A)),
    ('e', 'p_1p_2p_3=(%.4f)(%.4f)=%.3f ⇒ -p_1p_2p_3=a_0=%.3f ✓' % (q, p3A, q * p3A, a0))])

# ---------- VI · Paso 2 ----------
b1 = (7.01 * a1 - a0) / 7.01
box('VI · Paso 2. Estabilidad y comparación con los polos candidatos', 'VI2', [
    ('s', 'Arreglo de Routh, sistema (3.er orden)'),
    ('e', 's^3+a_2s^2+a_1s+a_0=0'),
    ('e', '\\m{s^3&1&a_1\\\\s^2&a_2&a_0\\\\s^1&b_1&0\\\\s^0&a_0&}'),
    ('e', 'b_1=\\f{a_2a_1-a_0}{a_2}'),
    ('s', 'Con K como variable (rango estable)'),
    ('e', 'a_2=7.01,   a_1=0.07+K,   a_0=0.2K'),
    ('e', 'b_1=\\f{7.01(0.07+K)-0.2K}{7.01}=\\f{0.4907+6.81K}{7.01}>0 ⇒ K>-0.072'),
    ('e', 'a_0=0.2K>0 ⇒ K>0'), ('g',), ('e', '0<K<∞   \\t{(no hay }K_{crít}\\t{)}'),
    ('s', 'Arreglo de Routh con K = %.2f' % KA),
    ('e', 'a_1=0.07+%.2f=%.2f,   a_0=0.2(%.2f)=%.3f' % (KA, a1, KA, a0)),
    ('e', 'b_1=\\f{(7.01)(%.2f)-%.3f}{7.01}=\\f{%.2f}{7.01}=%.2f' % (a1, a0, 7.01 * a1 - a0, b1)),
    ('e', '\\t{primera columna: }1,   7.01,   %.2f,   %.3f>0 ⇒ \\t{estable}' % (b1, a0)),
    ('s', 'Diferencia entre el polo candidato y el obtenido'),
    ('e', '\\t{Dif.}=\\f{\\d{p_{obt}-s_0}}{\\d{s_0}}×100'),
    ('e', '\\t{Dif.}=\\f{\\d{(-%.4f+j%.4f)-(-3.5+j%.4f)}}{%.4f}×100=\\f{\\d{%.4f-j%.4f}}{%.4f}×100=\\f{%.4f}{%.4f}×100' %
     (sg, wd, WD, WN, 3.5 - sg, WD - wd, WN, abs(pA - s0), WN)), ('g',),
    ('e', '\\t{Dif.}=%.1f \\t{%%}' % difA)])

# ---------- VI · Paso 3 ----------
p1 = pA; p3 = p3A
d13 = p3 - p1; m13 = abs(d13) ** 2
r3 = KA * (p3 + 0.2) / (p3 * m13)
mr1 = KA * abs(p1 + 0.2) / (abs(p1) * abs(p1 - p1.conjugate()) * abs(p1 - p3))
a_r = [deg(cmath.phase(p1 + 0.2)), deg(cmath.phase(p1)), 90.0, deg(cmath.phase(p1 - p3))]
ar1 = a_r[0] - a_r[1] - a_r[2] - a_r[3]
ar1n = ar1 + 360 if ar1 < -180 else ar1
box('VI · Paso 3. ¿Es razonable la aproximación de polos dominantes?', 'VI3', [
    ('s', 'Función de transferencia en lazo cerrado'),
    ('e', 'T(s)=\\f{KG_c(s)G(s)}{1+KG_c(s)G(s)}=\\f{K(s+0.2)}{s^3+7.01s^2+(0.07+K)s+0.2K}'),
    ('e', 'T(s)=\\f{%.2f(s+0.2)}{s^3+7.01s^2+%.2f s+%.3f}=\\f{%.2f(s+0.2)}{(s-p_1)(s-p_2)(s-p_3)}' % (KA, a1, a0, KA)),
    ('s', 'Descomposición de la respuesta al escalón'),
    ('e', 'C(s)=\\f{T(s)}{s}=\\f{r_0}{s}+\\f{r_1}{s-p_1}+\\f{r_2}{s-p_2}+\\f{r_3}{s-p_3}'),
    ('e', 'r_i=(s-p_i)C(s)\\t{, evaluado en }s=p_i ⇒ r_i=\\f{K(p_i+0.2)}{p_i∏_{j≠i}(p_i-p_j)}'),
    ('n', 'Cada residuo es el peso del modo e^(pᵢt) en c(t): mientras más pequeño, menos influye en la respuesta.'),
    ('s', 'Polo en el origen (valor final)'),
    ('e', 'r_0=T(0)=\\f{K(0+0.2)}{0.2K}=1'),
    ('s', 'Polo lento p~{3} = %.4f' % p3),
    ('e', 'r_3=\\f{%.2f(p_3+0.2)}{p_3(p_3-p_1)(p_3-p_2)}' % KA),
    ('e', 'p_3+0.2=%.4f+0.2=%.4f' % (p3, p3 + 0.2)),
    ('e', 'p_3-p_1=%.4f-(-%.4f+j%.4f)=%.4f-j%.4f' % (p3, sg, wd, d13.real, wd)),
    ('e', '(p_3-p_1)(p_3-p_2)=%.4f^2+%.4f^2=%.4f' % (d13.real, wd, m13)),
    ('n', 'Son números conjugados: (x − jy)(x + jy) = x² + y².'),
    ('e', 'r_3=\\f{%.2f(%.4f)}{(%.4f)(%.4f)}=\\f{%.4f}{%.4f}=%.4f' % (KA, p3 + 0.2, p3, m13, KA * (p3 + 0.2), p3 * m13, r3)),
    ('s', 'Par dominante p~{1,2} = %s' % ('−%.4f ± j%.4f' % (sg, wd))),
    ('e', 'r_1=\\f{%.2f(p_1+0.2)}{p_1(p_1-p_2)(p_1-p_3)}' % KA),
    ('e', 'p_1+0.2=%.4f+j%.4f,   p_1-p_2=j%.4f,   p_1-p_3=%.4f+j%.4f' % ((p1 + 0.2).real, wd, 2 * wd, (p1 - p3).real, wd)),
    ('t', 'Magnitudes de cada factor:'),
    ('e', '\\d{p_1+0.2}=%.4f,  \\d{p_1}=%.4f,  \\d{p_1-p_2}=%.4f,  \\d{p_1-p_3}=%.4f' % (abs(p1 + 0.2), abs(p1), 2 * wd, abs(p1 - p3))),
    ('e', '\\d{r_1}=\\f{%.2f(%.4f)}{(%.4f)(%.4f)(%.4f)}=%.4f' % (KA, abs(p1 + 0.2), abs(p1), 2 * wd, abs(p1 - p3), mr1)),
    ('t', 'Ángulos de cada factor:'),
    ('e', '∠(p_1+0.2)=%.2f°,  ∠p_1=%.2f°,  ∠(p_1-p_2)=90°,  ∠(p_1-p_3)=%.2f°' % (a_r[0], a_r[1], a_r[3])),
    ('e', '∠r_1=%.2f°-(%.2f°+90°+%.2f°)=%.2f° ≡ %.2f°' % (a_r[0], a_r[1], a_r[3], ar1, ar1n)),
    ('t', 'De forma polar a rectangular:'),
    ('e', 'r_1=%.4f(cos%.2f°+j\\t{sen}%.2f°)=%.4f+j%.4f' % (mr1, ar1n, ar1n, rA1.real, rA1.imag)),
    ('e', 'r_2=%.4f-j%.4f  \\t{(conjugado de }r_1\\t{)}' % (rA1.real, rA1.imag)),
    ('s', 'Comprobación'),
    ('e', 'c(0)=r_0+r_1+r_2+r_3=1+2(%.4f)+%.4f=%.4f ✓' % (rA1.real, r3, 1 + 2 * rA1.real + r3)),
    ('s', 'Comparación con el polo dominante'),
    ('e', '\\f{\\d{r_3}}{\\d{r_1}}=\\f{%.4f}{%.4f}=%.3f,   τ_3=\\f{1}{\\d{p_3}}=\\f{1}{%.4f}=%.2f \\t{s}' % (r3, mr1, r3 / mr1, -p3, -1 / p3)),
    ('n', 'El modo de p₃ pesa poco, pero durante el pico (t ≈ 0.56 s) todavía vale %.4f·e^(−0.115) ≈ %.4f y se suma a la respuesta: '
          'por eso el sobrepaso simulado es mayor que 15 %%.' % (r3, r3 * math.exp(p3 * 0.5566)))])

# ---------- VI · Paso 4 ----------
box('VI · Paso 4. Error estacionario correspondiente (analítico)', 'VI4', [
    ('e', 'K_p=\\lim{s→0}{KG_c(s)G(s)},   K_v=\\lim{s→0}{sKG_c(s)G(s)}'),
    ('e', 'K_p=\\lim{s→0}{\\f{%.2f(s+0.2)}{s(s+7)(s+0.01)}}=∞' % KA),
    ('e', 'K_v=\\lim{s→0}{\\f{%.2f(s+0.2)}{(s+7)(s+0.01)}}=\\f{%.2f(0.2)}{(7)(0.01)}=\\f{%.4f}{0.07}' % (KA, KA, 0.2 * KA)),
    ('e', 'e_{esc}(∞)=\\f{1}{1+∞}=0,   e_{rampa}(∞)=\\f{1}{%.2f}' % A['Kv']), ('g',),
    ('e', 'K_p=∞,   K_v=%.2f,   e_{esc}(∞)=0,   e_{rampa}(∞)=%.5f' % (A['Kv'], A['e']))])

# ---------- VII · Paso 5 ----------
Ac = -2 * rA1.real; Bc = 2 * rA1.imag
d1 = sg * Ac - wd * Bc; d2 = sg * Bc + wd * Ac
dc = lambda t: r3 * p3 * math.exp(p3 * t) + math.exp(-sg * t) * (d1 * math.cos(wd * t) + d2 * math.sin(wd * t))
tp = IA['tp']; ct = lambda t: 1 + r3 * math.exp(p3 * t) - math.exp(-sg * t) * (Ac * math.cos(wd * t) + Bc * math.sin(wd * t))
box('VII · Paso 5. Simulación de las entradas requeridas y desempeño del modelo completo', 'VII5', [
    ('s', 'Armado de c(t) (Laplace inversa de cada término)'),
    ('e', '\\t{L}^{-1}\\b{\\f{r_0}{s}}=r_0,  \\t{L}^{-1}\\b{\\f{r_i}{s-p_i}}=r_ie^{p_it}'),
    ('t', 'El par complejo se junta en un solo término real. Con r₁ = a + jb, r₂ = a − jb, p₁,₂ = −σ ± jω~{d} y la fórmula de Euler:'),
    ('e', 'r_1e^{p_1t}+r_2e^{p_2t}=2e^{-σt}[a cos(ω_dt)-b \\t{sen}(ω_dt)]'),
    ('s', 'Sistema con atraso (K = %.2f): c(t) con los residuos de VI · Paso 3' % KA),
    ('t', 'Sustitución con r₀ = 1, r₃ = %.4f, a = %.4f, b = %.4f, σ = %.4f, ω~{d} = %.4f:' % (r3, rA1.real, rA1.imag, sg, wd)),
    ('e', 'c(t)=1+%.4fe^{%.4f t}-e^{-%.4f t}[%.4f cos(%.4f t)+%.4f \\t{sen}(%.4f t)]' % (r3, p3, sg, Ac, wd, Bc, wd)),
    ('e', 'c(0)=1+%.4f-%.4f=%.4f ✓' % (r3, Ac, 1 + r3 - Ac)),
    ('s', 'Tiempo pico: c′(t) = 0'),
    ('e', 'c\'(t)=%.5fe^{%.4f t}+e^{-%.4f t}[%.4f cos(%.4f t)+%.4f \\t{sen}(%.4f t)]' % (r3 * p3, p3, sg, d1, wd, d2, wd)),
    ('e', 'c\'(0.55)=%.4f>0,   c\'(0.56)=%.4f<0 ⇒ 0.55<t_p<0.56' % (dc(0.55), dc(0.56))),
    ('t', 'Con calculadora:'), ('e', 't_p=%.4f \\t{s}' % tp),
    ('s', 'Valor máximo c~{máx} = c(t~{p})'),
    ('e', 'c_{máx}=1+%.4fe^{%.4f}-e^{-%.4f}[%.4f cos(%.4f)+%.4f \\t{sen}(%.4f)]' % (r3, p3 * tp, sg * tp, Ac, wd * tp, Bc, wd * tp)),
    ('e', 'c_{máx}=1+%.4f-%.4f[%.4f(%.4f)+%.4f(%.4f)]=%.4f' % (r3 * math.exp(p3 * tp), math.exp(-sg * tp), Ac, math.cos(wd * tp), Bc, math.sin(wd * tp), ct(tp))),
    ('s', 'Sobrepaso'),
    ('e', '\\%%OS=\\f{c_{máx}-c(∞)}{c(∞)}×100=\\f{%.4f-1}{1}×100=%.2f \\t{%%}' % (IA['pk'], IA['os'])),
    ('s', 'Tiempo de asentamiento (banda de 2 %)'),
    ('t', 'Después de unos 1.2 s el término oscilatorio vale menos de 2 %% (e^(−%.3f·1.2) = %.4f); queda sobre todo el modo lento:' % (sg, math.exp(-sg * 1.2))),
    ('e', '\\d{r_3}e^{p_3T_s}=0.02 ⇒ T_s≈\\f{\\t{ln}(\\d{r_3}/0.02)}{\\d{p_3}}=\\f{\\t{ln}(%.4f/0.02)}{%.4f}=%.2f \\t{s}' % (r3, -p3, math.log(r3 / 0.02) / -p3)),
    ('n', 'Es una cota: el término oscilatorio todavía resta un poco y la respuesta entra antes a la banda.'),
    ('e', 'T_{s,sim}=%.3f \\t{s (stepinfo)}' % IA['ts']),
    ('s', 'Sin compensar (K = %.2f)' % K0),
    ('n', 'Es de segundo orden puro: c~{máx} = 1 + e^(−ζπ/√(1−ζ²)) = 1.1500, t~{p} = π/ω~{d} = %.4f s; T~{s} simulado %.3f s.' % (TP2, RN['ref_info']['ts']))])

# ---------- VII · Paso 6 ----------
rp = [rA1 / p1, rA1.conjugate() / p1.conjugate(), r3 / p3]
einf = sum(rp).real
box('VII · Paso 6. Error estacionario simulado', 'VII6', [
    ('s', 'Error ante rampa en el tiempo'),
    ('e', 'e(t)=t-c_{rampa}(t),   c_{rampa}(t)=∫_0^tc_{esc}(τ)dτ'),
    ('e', 'c_{rampa}(t)=r_0t+∑\\f{r_i}{p_i}(e^{p_it}-1)'),
    ('e', 'e(t)=∑\\f{r_i}{p_i}-∑\\f{r_i}{p_i}e^{p_it}   \\t{(con }r_0=1\\t{)}'),
    ('s', 'Valor final'),
    ('e', '\\f{r_3}{p_3}=\\f{%.4f}{%.4f}=%.4f' % (r3, p3, (r3 / p3))),
    ('n', 'r₁/p₁ y r₂/p₂ son conjugados: su suma es el doble de la parte real de r₁/p₁.'),
    ('e', '\\f{r_1}{p_1}+\\f{r_2}{p_2}=2(%.4f)=%.4f' % ((rA1 / p1).real, 2 * (rA1 / p1).real)),
    ('e', 'e(∞)=%.4f+(%.4f)=%.5f ✓  (=1/K_v)' % (2 * (rA1 / p1).real, r3 / p3, einf)),
    ('s', 'Cola lenta del error'),
    ('e', 'e(t)≈%.5f+%.4fe^{%.4f t}  \\t{(después de 2 s)}' % (einf, tailA, p3)),
    ('e', 'e(20)=%.4f,   e(60)=%.5f' % (eA20, eA60)),
    ('e', 'e_{sim}(∞)=%.5f,   e_{u,sim}(∞)=%.4f  \\t{(sin compensar)}' % (eA60, RN['ref_e']))])

# ---------- VII · Paso 7 ----------
tb = lambda sig: num3.angsum(sig, [-0.02], [0, -7, -0.001])
sgB = -pB.real; wdB = pB.imag
mB = [abs(pB), abs(pB + 7), abs(pB + 0.001), abs(pB + 0.02)]
mq = (p3B - pB.real) ** 2 + wdB ** 2
box('VII · Paso 7. Ajuste del diseño y repetición de la verificación', 'VII7', [
    ('s', 'Revisión de las especificaciones'),
    ('e', '\\%%OS=%.2f \\t{%%}>15 \\t{%%} ✗,   \\t{mejora}=%.2f≈20' % (IA['os'], mejA)),
    ('n', 'Se conserva z~{c}/p~{c} = 20 y se acerca el dipolo diez veces al origen: G~{c}(s) = (s + 0.02)/(s + 0.001).'),
    ('s', 'Nueva búsqueda sobre ζ = 0.517'),
    ('e', '∠(s+0.02)-[∠s+∠(s+7)+∠(s+0.001)]=±180°'),
    ('e', 'σ=3.45: %.2f°,   σ=3.48: %.2f°,   σ=3.50: %.2f°' % (tb(3.45), tb(3.48), tb(3.50))),
    ('t', 'Afinando con la calculadora:'),
    ('e', 'σ=%.4f,   ω_d=%.4f,   s_0=-%.4f+j%.4f' % (sgB, wdB, sgB, wdB)),
    ('e', 'K=\\f{\\d{s_0}\\d{s_0+7}\\d{s_0+0.001}}{\\d{s_0+0.02}}=\\f{(%.4f)(%.4f)(%.4f)}{%.4f}=%.2f' % (mB[0], mB[1], mB[2], mB[3], KB)),
    ('s', 'Polo del dipolo y su residuo'),
    ('e', 's^3+7.001s^2+(0.007+K)s+0.02K=0 ⇒ p_3=-7.001+2(%.4f)=%.5f' % (sgB, p3B)),
    ('e', 'r_3=\\f{K(p_3+0.02)}{p_3[(p_3+σ)^2+ω_d^2]}=\\f{%.2f(%.5f)}{(%.5f)(%.4f)}=%.5f' % (KB, p3B + 0.02, p3B, mq, r3B)),
    ('s', 'Error y mejora'),
    ('e', 'K_v=\\f{%.2f}{7}·\\f{0.02}{0.001}=%.2f,   e_{rampa}(∞)=%.5f,   \\t{mejora}=\\f{%.4f}{%.5f}=%.2f' % (KB, B['Kv'], B['e'], E0, B['e'], mejB)),
    ('s', 'Desempeño simulado de la variante'),
    ('e', '\\%%OS=%.2f \\t{%%},   t_p=%.4f \\t{s},   T_s=%.3f \\t{s}' % (IB['os'], IB['tp'], IB['ts'])),
    ('e', 'e(t)≈%.5f+%.4fe^{%.5f t},   τ=\\f{1}{%.5f}=%.0f \\t{s}' % (B['e'], tailB, p3B, -p3B, -1 / p3B)),
    ('e', '\\t{Para que la cola baje a 1 %% de }e(∞)\\t{: }t=\\f{\\t{ln}(%.4f/%.6f)}{%.5f}=%.0f \\t{s}' % (tailB, 0.01 * B['e'], -p3B, math.log(tailB / (0.01 * B['e'])) / -p3B)),
    ('n', 'La variante cumple el sobrepaso (≈ 15 %%) y la mejora (×20), pero el error tarda varios minutos en llegar a su valor final. Se adopta la variante: K = %.2f, z~{c} = 0.02, p~{c} = 0.001.' % KB)])
