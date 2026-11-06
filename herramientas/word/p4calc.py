# Anexo «C. Cálculos» de la P4 (mismo orden que el reporte, desarrollo completo).
import math, cmath
import numpy as np
from build import calc_box
import num4
from p4 import (Z, TH, TN, SG, s0, WD, K0, WN, Kv0, E0, OS2, TS2, TP2, TRn, TR2, k1, SB, KB_, P3R, r3R, r1R,
                TSD, SD, WDD, sd, WND, ANG, ANGG, THZ, ZC, KC, TANZ, MG, A1, A0, p1, r1, p3, r3, IC, KVC, EC, MEJ, TSR, TSMETA,
                SIGA, eC2, eC10, K16, I16, p16, p16r, Z16, RI, f)
RN = num4.R
deg = math.degrees
atd = lambda y, x: deg(math.atan(y / x))
ln16 = math.log(0.16)
C = []


def box(t, k, items): C.extend(calc_box(t, k, items))


PS = [0, -4, -6]
ta = lambda sig: num4.angsum(sig, [], PS)

# ---------- III · Paso 1 ----------
g = [180 - TH, atd(WD, 4 - SG), atd(WD, 6 - SG)]
m0 = [abs(s0), abs(s0 + 4), abs(s0 + 6)]
sig_i = 1.2 + (-180 - ta(1.2)) / (ta(1.3) - ta(1.2)) * 0.1
box('III · Paso 1. Ganancia de referencia (no asumir que es uno)', 'III1', [
    ('s', 'Factor de amortiguamiento a partir del sobrepaso'),
    ('e', 'ζ=\\f{-\\t{ln}(\\%OS/100)}{\\r{π^2+\\t{ln}^2(\\%OS/100)}}'), ('g',),
    ('e', 'ζ=\\f{-\\t{ln}(0.16)}{\\r{π^2+\\t{ln}^2(0.16)}}=\\f{%.4f}{\\r{%.4f+%.4f}}=\\f{%.4f}{%.4f}' % (-ln16, math.pi ** 2, ln16 ** 2, -ln16, math.sqrt(math.pi ** 2 + ln16 ** 2))),
    ('g',), ('e', 'ζ=%.4f' % Z), ('g',),
    ('s', 'Ángulo de la recta de ζ (θ)'),
    ('e', 'θ=cos^{-1}ζ=cos^{-1}(%.4f)' % Z), ('g',), ('e', 'θ=%.2f°,  tanθ=%.4f' % (TH, TN)), ('g',),
    ('s', 'Punto sobre la recta de ζ (s~{0}) con la condición de ángulo'),
    ('e', 's=-σ+jω_d,   ω_d=σtanθ'),
    ('e', '-∑∠(s-p_i)=-[∠s+∠(s+4)+∠(s+6)]=±180°'),
    ('n', 'Sobre la recta, ∠s = 180° − θ = %.2f° para cualquier σ; ∠(s + a) = tan⁻¹[ω~{d}/(a − σ)] si a > σ. Se prueban valores de σ:' % (180 - TH)),
    ('e', 'σ=1.0: %.2f°,   σ=1.1: %.2f°,   σ=1.2: %.2f°,   σ=1.3: %.2f°' % (ta(1.0), ta(1.1), ta(1.2), ta(1.3))),
    ('e', 'σ≈1.2+\\f{-180-(%.2f)}{%.2f-(%.2f)}(1.3-1.2)=%.4f' % (ta(1.2), ta(1.3), ta(1.2), sig_i)),
    ('t', 'Afinando con la calculadora:'),
    ('e', 'σ=%.4f,   ω_d=%.4f(%.4f)=%.4f' % (SG, SG, TN, WD)),
    ('e', '∠s_0=180°-tan^{-1}(\\f{%.4f}{%.4f})=%.2f°' % (WD, SG, g[0])),
    ('e', '∠(s_0+4)=tan^{-1}(\\f{%.4f}{4-%.4f})=%.2f°' % (WD, SG, g[1])),
    ('e', '∠(s_0+6)=tan^{-1}(\\f{%.4f}{6-%.4f})=%.2f°' % (WD, SG, g[2])),
    ('e', '-(%.2f°+%.2f°+%.2f°)=%.2f° ≡ ±180°' % (g[0], g[1], g[2], -sum(g))), ('g',),
    ('e', 's_0=-%.4f+j%.4f' % (SG, WD)), ('g',),
    ('s', 'Ganancia de referencia (condición de magnitud)'),
    ('e', 'K=\\f{∏\\d{s_0-p_i}}{∏\\d{s_0-z_i}},  \\d{s_0+a}=\\r{(a-σ)^2+ω_d^2}'),
    ('n', 'Sin ceros finitos, el denominador vale 1.'), ('g',),
    ('e', '\\d{s_0}=\\r{%.4f^2+%.4f^2}=%.4f' % (SG, WD, m0[0])),
    ('e', '\\d{s_0+4}=\\r{(4-%.4f)^2+%.4f^2}=%.4f' % (SG, WD, m0[1])),
    ('e', '\\d{s_0+6}=\\r{(6-%.4f)^2+%.4f^2}=%.4f' % (SG, WD, m0[2])),
    ('e', 'K=\\f{(%.4f)(%.4f)(%.4f)}{1}' % tuple(m0)), ('g',),
    ('e', 'K_{ref}=%.2f' % K0), ('g',),
    ('s', 'Si se asumiera K = 1'),
    ('e', 's^3+10s^2+24s+1=0'),
    ('n', 'Ecuación de 3.er grado: se resuelve con la calculadora (o roots([1 10 24 1]) en MATLAB).'),
    ('e', 's=%.4f,   %.4f,   %.4f' % (k1[2], k1[1], k1[0])),
    ('n', 'Las tres raíces son reales (sin oscilación): no corresponden a 16 % de sobrepaso, por eso no se puede asumir K = 1.')])

# ---------- III · Paso 2 ----------
disc = 20 ** 2 - 4 * 3 * 24
SB2 = min(RN['br'])
box('III · Paso 2. Polos, ceros, tipo y ecuación característica', 'III2', [
    ('s', 'Polos y ceros de lazo abierto'),
    ('e', 'D(s)=0 ⇒ p_1, p_2,…,p_n'), ('e', 'N(s)=0 ⇒ z_1,…,z_m'), ('g',),
    ('e', 'D(s)=s(s+4)(s+6)=0'), ('e', 'N(s)=1'), ('g',),
    ('e', 'p=0, -4, -6'), ('e', 'n=3,   m=0'),
    ('s', 'Tipo del sistema'),
    ('e', 'G(s)=\\f{K N(s)}{s^N D_0(s)} ⇒ \\t{tipo}=N'),
    ('n', 'N = número de polos en el origen.'),
    ('e', 'G(s)=\\f{K}{s^1 (s+4)(s+6)}'), ('g',), ('e', 'N=1 ⇒ \\t{tipo }1'),
    ('s', 'Ecuación característica'),
    ('e', '1+K G(s)=0 ⇒ D(s)+K N(s)=0'),
    ('e', 's(s+4)(s+6)+K=s(s^2+10s+24)+K=0'), ('g',), ('e', 's^3+10s^2+24s+K=0'),
    ('s', 'Ramas y asíntotas'),
    ('e', '\\t{núm. ramas}=n,  \\t{núm. asíntotas}=n-m'), ('e', 'n=3,   m=0,   n-m=3'), ('g',),
    ('e', '\\t{núm. ramas}=3,  \\t{núm. asíntotas}=3'),
    ('s', 'Tramos del eje real'),
    ('t', 'Entre 0 y −4 hay 1 polo(s)/cero(s) a la derecha, como es impar, pertenece al LGDR.'),
    ('t', 'Entre −4 y −6 hay 2 polo(s)/cero(s) a la derecha, como es par, no pertenece al LGDR.'),
    ('t', 'A la izquierda de −6 hay 3 polo(s)/cero(s) a la derecha, como es impar, pertenece al LGDR.'),
    ('e', '[-4, 0] ∪ (-∞, -6]'),
    ('s', 'Centroide de las asíntotas (σ~{a})'),
    ('e', 'σ_a=\\f{∑p_i-∑z_i}{n-m}'),
    ('e', 'σ_a=\\f{(0)+(-4)+(-6)-0}{3-0}=\\f{-10}{3}'), ('g',), ('e', 'σ_a=-3.333'),
    ('s', 'Ángulos de las asíntotas (θ~{a})'),
    ('e', 'θ_a=\\f{(2k+1) 180°}{n-m}'), ('e', 'k=0, 1,…,n-m-1'),
    ('e', 'θ_a=\\f{(2k+1) 180°}{3},   k=0, 1, 2'), ('g',), ('e', 'θ_a=60°, 180°, 300°'),
    ('s', 'Punto de ruptura (σ~{b})'),
    ('e', 'K(σ)=-\\f{D(σ)}{N(σ)},   \\f{dK}{dσ}=0'),
    ('e', 'N(σ) D\'(σ)-N\'(σ) D(σ)=0'),
    ('e', 'N=1 ⇒ D\'(σ)=0'),
    ('e', 'D(σ)=σ^3+10σ^2+24σ ⇒ D\'(σ)=3σ^2+20σ+24=0'),
    ('e', 'σ=\\f{-20±\\r{20^2-4(3)(24)}}{2(3)}=\\f{-20±\\r{%d}}{6}=\\f{-20±%.4f}{6}' % (disc, math.sqrt(disc))), ('g',),
    ('e', 'σ_b=%.4f  \\t{(está en LGDR)}' % SB),
    ('n', 'Se descarta %.4f: está entre −4 y −6, que no es tramo del LGDR.' % SB2),
    ('s', 'Ganancia en el punto de ruptura (K~{b})'),
    ('e', 'K_b=\\d{\\f{D(σ_b)}{N(σ_b)}}'),
    ('e', 'D(σ_b)=σ_b(σ_b+4)(σ_b+6)=(%.4f)(%.4f)(%.4f)' % (SB, SB + 4, SB + 6)),
    ('e', 'K_b=\\d{\\f{(%.4f)(%.4f)(%.4f)}{1}}' % (SB, SB + 4, SB + 6)), ('g',), ('e', 'K_b=%.2f' % KB_),
    ('n', 'Para K > %.2f los dos polos que salen de 0 y −4 se vuelven complejos: la K de diseño (43.38) debe ser mayor.' % KB_)])

# ---------- III · Paso 3 ----------
box('III · Paso 3. Estabilidad y rango de ganancia estable', 'III3', [
    ('s', 'Arreglo de Routh, sin compensar (3.er orden)'),
    ('e', 's^3+a_2s^2+a_1s+a_0=0'),
    ('e', '\\m{s^3&1&a_1\\\\s^2&a_2&a_0\\\\s^1&b_1&0\\\\s^0&a_0&}'),
    ('e', 'b_1=\\f{a_2a_1-a_0}{a_2}'),
    ('n', 'Estable si toda la primera columna es positiva (a₂ > 0, b₁ > 0, a₀ > 0).'), ('g',),
    ('e', 's^3+10s^2+24s+K=0'), ('e', 'a_2=10,   a_1=24,   a_0=K'),
    ('e', 'b_1=\\f{(10)(24)-(K)}{10}=\\f{240-K}{10}'), ('g',),
    ('e', '\\f{240-K}{10}>0 ⇒ K<240,   K>0'), ('g',), ('e', '0<K<240'),
    ('s', 'Ganancia crítica (K~{crít}) y cruce con el eje jω'),
    ('e', 'b_1=0 ⇒ a_2a_1=a_0,   a_2s^2+a_0=0 ⇒ ω=\\r{a_0/a_2}'),
    ('n', 'El polinomio auxiliar sale de la fila s².'),
    ('e', '240-K=0 ⇒ K=240'),
    ('e', '10s^2+240=0 ⇒ ω=\\r{240/10}'), ('g',),
    ('e', 'K_{crít}=240,   s=±j4.899'),
    ('s', 'Con la ganancia de referencia'),
    ('e', 'b_1=\\f{240-%.2f}{10}=%.2f>0 ⇒ \\t{estable}' % (K0, (240 - K0) / 10))])

# ---------- III · Paso 4 ----------
q0 = SG ** 2 + WD ** 2
box('III · Paso 4. Polos en lazo cerrado con la ganancia de referencia', 'III4', [
    ('s', 'Ecuación característica con la ganancia de referencia'),
    ('e', 's^3+10s^2+24s+K=0'), ('e', 'K=%.2f:' % K0), ('e', 's^3+10s^2+24s+%.2f=0' % K0),
    ('s', 'Par dominante (de III · Paso 1) y tercer polo'),
    ('e', '(s-p_1)(s-p_2)=s^2+2σs+(σ^2+ω_d^2)=s^2+%.4fs+%.4f' % (2 * SG, q0)),
    ('e', '\\f{s^3+10s^2+24s+%.2f}{s^2+%.4fs+%.4f}=s+%.4f' % (K0, 2 * SG, q0, -P3R)),
    ('e', 'p_1+p_2+p_3=-a_2 ⇒ p_3=-10+2(%.4f)=%.4f' % (SG, P3R)), ('g',),
    ('e', 'p_{1,2}=-%.4f±j%.4f,   p_3=%.4f' % (SG, WD, P3R)),
    ('s', 'Comprobación con el producto de raíces'),
    ('e', 'p_1p_2p_3=(%.4f)(%.4f)=%.2f=-a_0 ✓' % (q0, P3R, q0 * P3R)),
    ('s', 'Validez de la aproximación de 2.º orden'),
    ('e', '\\f{\\d{p_3}}{σ}=\\f{%.4f}{%.4f}=%.2f>5' % (-P3R, SG, -P3R / SG)),
    ('n', 'El tercer polo está a más de 5σ del eje: su modo decae mucho más rápido que el del par dominante.')])

# ---------- III · Paso 5 ----------
box('III · Paso 5. Respuesta transitoria y error estacionario', 'III5', [
    ('s', 'Parámetros del par dominante'),
    ('e', 'p_1=-σ+jω_d,   ω_n=\\r{σ^2+ω_d^2},   ζ=\\f{σ}{ω_n}'),
    ('e', 'σ=%.4f,   ω_d=%.4f' % (SG, WD)),
    ('e', 'ω_n=\\r{%.4f^2+%.4f^2}=\\r{%.4f},   ζ=\\f{%.4f}{%.4f}' % (SG, WD, q0, SG, WN)), ('g',),
    ('e', 'ω_n=%.4f  \\t{rad/s},   ζ=%.4f' % (WN, Z)),
    ('s', 'Sobrepaso correspondiente'),
    ('e', '\\%OS=e^{-ζπ/\\r{1-ζ^2}}×100'),
    ('e', '\\%%OS=e^{-%.4fπ/\\r{1-%.4f^2}}×100=e^{-%.4f}×100' % (Z, Z, Z * math.pi / math.sqrt(1 - Z * Z))), ('g',),
    ('e', '\\%%OS=%.2f \\t{%%}' % OS2),
    ('s', 'Estimaciones de 2.º orden'),
    ('e', 'T_s=\\f{4}{ζω_n}=\\f{4}{σ},   T_p=\\f{π}{ω_d}'),
    ('e', 'T_r≈\\f{1.768ζ^3-0.417ζ^2+1.039ζ+1}{ω_n}  \\t{(Nise, cap. 4)}'),
    ('e', 'T_s=\\f{4}{%.4f},   T_p=\\f{π}{%.4f}' % (SG, WD)),
    ('e', 'T_r≈\\f{1.768(%.4f)^3-0.417(%.4f)^2+1.039(%.4f)+1}{%.4f}=\\f{%.4f}{%.4f}' % (Z, Z, Z, WN, TRn, WN)), ('g',),
    ('e', 'T_s=%.4f \\t{s},   T_p=%.4f \\t{s},   T_r≈%.4f \\t{s}' % (TS2, TP2, TR2)),
    ('s', 'Error en estado estable (tipo 1)'),
    ('e', 'K_v=\\lim{s→0}{sKG(s)},   e_{rampa}(∞)=\\f{1}{K_v}'),
    ('e', 'K_v=\\lim{s→0}{s\\f{%.2f}{s(s+4)(s+6)}}=\\lim{s→0}{\\f{%.2f}{(s+4)(s+6)}}=\\f{%.2f}{24}' % (K0, K0, K0)),
    ('e', 'e_{rampa}(∞)=\\f{1}{%.4f}' % Kv0), ('g',),
    ('e', 'K_v=%.4f,   e_{rampa}(∞)=%.4f' % (Kv0, E0)),
    ('n', 'Al escalón el error es cero, porque K~{p} = ∞ (tipo 1).')])

# ---------- IV · a) ----------
box('IV · a) Punto de diseño', 'IVa', [
    ('s', 'Tiempo de asentamiento deseado'),
    ('e', 'T_{s,d}=\\f{T_s}{3}=\\f{%.4f}{3}=%.4f \\t{s}' % (TS2, TSD)),
    ('s', 'Parte real y parte imaginaria del punto de diseño'),
    ('e', 'σ_d=\\f{4}{T_{s,d}}=\\f{4}{%.4f}=%.4f' % (TSD, SD)),
    ('n', 'Es lo mismo que 3σ = 3(%.4f) = %.4f: el punto se aleja tres veces del eje imaginario.' % (SG, 3 * SG)),
    ('e', 'ω_d=σ_dtanθ=%.4f(%.4f)=%.4f' % (SD, TN, WDD)), ('g',),
    ('e', 's_d=-%.4f+j%.4f' % (SD, WDD)),
    ('s', 'Comprobación: sigue sobre la recta de ζ'),
    ('e', 'ω_n=\\r{%.4f^2+%.4f^2}=%.4f,   ζ=\\f{%.4f}{%.4f}=%.4f ✓' % (SD, WDD, WND, SD, WND, SD / WND))])

# ---------- IV · b) ----------
box('IV · b) Ángulo faltante', 'IVb', [
    ('s', 'Ángulo de G(s) en el punto de diseño'),
    ('e', '∠G(s_d)=-∑∠(s_d-p_i)=-[∠s_d+∠(s_d+4)+∠(s_d+6)]'),
    ('e', 's_d+4=%.4f+j%.4f,   s_d+6=%.4f+j%.4f' % (4 - SD, WDD, 6 - SD, WDD)),
    ('n', 's~{d} está en el segundo cuadrante (parte real negativa); s~{d} + 4 y s~{d} + 6 tienen parte real positiva (primer cuadrante).'),
    ('e', '∠s_d=180°-tan^{-1}(\\f{%.4f}{%.4f})=%.2f°' % (WDD, SD, ANG[0])),
    ('e', '∠(s_d+4)=tan^{-1}(\\f{%.4f}{%.4f})=%.2f°' % (WDD, 4 - SD, ANG[1])),
    ('e', '∠(s_d+6)=tan^{-1}(\\f{%.4f}{%.4f})=%.2f°' % (WDD, 6 - SD, ANG[2])), ('g',),
    ('e', '∠G(s_d)=-(%.2f°+%.2f°+%.2f°)=%.2f°' % (ANG[0], ANG[1], ANG[2], ANGG)),
    ('s', 'Ángulo que debe aportar el cero'),
    ('e', 'θ_z+∠G(s_d)=-180° ⇒ θ_z=-180°-(%.2f°)' % ANGG), ('g',),
    ('e', 'θ_z=%.2f°' % THZ),
    ('n', 'Como ∠G(s~{d}) ≠ −180°, s~{d} no está en el LGDR sin compensar.')])

# ---------- IV · c) ----------
zv = sd + ZC
box('IV · c) Ubicación del cero (construcción geométrica)', 'IVc', [
    ('s', 'Ángulo del cero (θ~{z})'),
    ('n', 'Triángulo entre s~{d} = −σ~{d} + jω~{d} y el cero en −z~{c}: el cateto vertical es ω~{d} y el horizontal z~{c} − σ~{d}.'),
    ('e', 'tanθ_z=\\f{ω_d}{z_c-σ_d}'),
    ('e', 'tan(%.2f°)=%.4f' % (THZ, TANZ)),
    ('s', 'Ubicación del cero (z~{c})'),
    ('e', 'z_c=σ_d+\\f{ω_d}{tanθ_z}'),
    ('n', 'Si θ~{z} > 90°, tan θ~{z} < 0 y el cero queda a la derecha de −σ~{d}.'),
    ('e', 'z_c=%.4f+\\f{%.4f}{%.4f}=%.4f+(%.4f)' % (SD, WDD, TANZ, SD, WDD / TANZ)), ('g',),
    ('e', 'z_c=%.4f ⇒ \\t{cero en }s=-%.4f' % (ZC, ZC)),
    ('s', 'Comprobación de la condición de ángulo con el cero'),
    ('e', 's_d+z_c=%.4f+j%.4f ⇒ ∠(s_d+z_c)=180°-tan^{-1}(\\f{%.4f}{%.4f})=%.2f°' % (zv.real, WDD, WDD, -zv.real, 180 - atd(WDD, -zv.real))),
    ('e', '%.2f°+(%.2f°)=%.2f° ✓' % (180 - atd(WDD, -zv.real), ANGG, 180 - atd(WDD, -zv.real) + ANGG))])

# ---------- IV · d) ----------
box('IV · d) Ganancia con el PD (condición de magnitud)', 'IVd', [
    ('e', 'K=\\f{∏\\d{s_d-p_i}}{∏\\d{s_d-z_i}}=\\f{\\d{s_d}\\d{s_d+4}\\d{s_d+6}}{\\d{s_d+z_c}}'),
    ('e', '\\d{s_d}=\\r{%.4f^2+%.4f^2}=%.4f' % (SD, WDD, MG[0])),
    ('e', '\\d{s_d+4}=\\r{%.4f^2+%.4f^2}=%.4f' % (4 - SD, WDD, MG[1])),
    ('e', '\\d{s_d+6}=\\r{%.4f^2+%.4f^2}=%.4f' % (6 - SD, WDD, MG[2])),
    ('e', '\\d{s_d+z_c}=\\r{(%.4f-%.4f)^2+%.4f^2}=%.4f' % (ZC, SD, WDD, MG[3])),
    ('e', 'K=\\f{(%.4f)(%.4f)(%.4f)}{%.4f}=\\f{%.2f}{%.4f}' % (MG[0], MG[1], MG[2], MG[3], MG[0] * MG[1] * MG[2], MG[3])), ('g',),
    ('e', 'K=%.2f' % KC),
    ('e', '\\f{K-K_{ref}}{K_{ref}}×100=\\f{%.2f-%.2f}{%.2f}×100=%.1f \\t{%%}' % (KC, K0, K0, (KC - K0) / K0 * 100))])

# ---------- IV · e) ----------
B1v = 10 - ZC
box('IV · e) Nueva ecuación característica y estabilidad', 'IVe', [
    ('s', 'Ecuación característica con el PD'),
    ('e', '1+K\\f{s+z_c}{s(s+4)(s+6)}=0 ⇒ s(s+4)(s+6)+K(s+z_c)=0'),
    ('e', 's^3+10s^2+24s+Ks+%.4fK=0' % ZC), ('g',),
    ('e', 's^3+10s^2+(24+K)s+%.4fK=0' % ZC),
    ('s', 'Arreglo de Routh con K como variable'),
    ('e', '\\m{s^3&1&24+K\\\\s^2&10&%.4fK\\\\s^1&b_1&0\\\\s^0&%.4fK&}' % (ZC, ZC)),
    ('e', 'b_1=\\f{10(24+K)-%.4fK}{10}=\\f{240+%.4fK}{10}' % (ZC, B1v)), ('g',),
    ('e', 'b_1>0  \\t{y}  %.4fK>0  \\t{para toda }K>0' % ZC), ('g',),
    ('e', '0<K<∞'),
    ('n', 'b₁ no se anula para ninguna K > 0: el LGDR compensado no cruza el eje jω.'),
    ('s', 'Tercer polo (suma de raíces)'),
    ('e', 'p_1+p_2+p_3=-10 ⇒ p_3=-10-2(-%.4f)=%.4f' % (SD, p3)),
    ('e', '\\f{\\d{p_3}}{σ_d}=\\f{%.4f}{%.4f}=%.3f<5' % (-p3, SD, -p3 / SD)),
    ('n', 'Está más cerca del eje que el par dominante, pero a sólo %.4f del cero en −%.4f: se revisa con los residuos (VI · Paso 3).' % (ZC + p3, ZC)),
    ('s', 'Forma del LGDR compensado'),
    ('e', 'n=3,   m=1,   n-m=2'),
    ('t', 'Tramos del eje real: entre 0 y −%.3f (1 a la derecha, impar) y entre −4 y −6 (3 a la derecha, impar).' % ZC),
    ('e', '[-%.3f, 0] ∪ [-6, -4]' % ZC),
    ('e', 'σ_a=\\f{(0-4-6)-(-%.4f)}{2}=%.4f,   θ_a=\\f{(2k+1)180°}{2}=90°, 270°' % (ZC, SIGA))])

# ---------- IV · f) ----------
box('IV · f) Efecto en el error', 'IVf', [
    ('s', 'Constante de velocidad con el PD'),
    ('e', 'K_v=\\lim{s→0}{sK\\f{s+z_c}{s(s+4)(s+6)}}=\\f{Kz_c}{(4)(6)}'),
    ('e', 'K_v=\\f{%.2f(%.4f)}{24}=\\f{%.2f}{24}' % (KC, ZC, KC * ZC)), ('g',),
    ('e', 'K_v=%.4f,   e_{rampa}(∞)=\\f{1}{%.4f}=%.4f' % (KVC, KVC, EC)),
    ('s', 'Mejora del error (no se pidió)'),
    ('e', '\\f{e_{sin}}{e_{comp}}=\\f{%.4f}{%.4f}=%.2f' % (E0, EC, MEJ))])

# ---------- VI · Paso 1 ----------
q = SD ** 2 + WDD ** 2
box('VI · Paso 1. Ecuación característica final y todos los polos en lazo cerrado', 'VI1', [
    ('e', '1+KG_c(s)G(s)=0,   G_c(s)=s+%.4f' % ZC),
    ('e', 's^3+10s^2+(24+K)s+%.4fK=0' % ZC),
    ('e', 's^3+10s^2+(24+%.2f)s+%.4f(%.2f)=s^3+10s^2+%.2fs+%.2f=0' % (KC, ZC, KC, A1, A0)),
    ('s', 'Polos (par conocido de IV · a y división)'),
    ('e', '(s-p_1)(s-p_2)=s^2+2σ_ds+(σ_d^2+ω_d^2)=s^2+%.4fs+%.4f' % (2 * SD, q)),
    ('e', '\\f{s^3+10s^2+%.2fs+%.2f}{s^2+%.4fs+%.4f}=s+%.4f' % (A1, A0, 2 * SD, q, -p3)), ('g',),
    ('e', 'p_{1,2}=-%.4f±j%.4f,   p_3=%.4f' % (SD, WDD, p3)),
    ('s', 'Comprobación con la suma y el producto de raíces'),
    ('e', 'p_1+p_2+p_3=2(-%.4f)+(%.4f)=-10=-a_2 ✓' % (SD, p3)),
    ('e', 'p_1p_2p_3=(%.4f)(%.4f)=%.2f=-a_0 ✓' % (q, p3, q * p3))])

# ---------- VI · Paso 2 ----------
B1 = (10 * A1 - A0) / 10
box('VI · Paso 2. Estabilidad y comparación con los polos candidatos', 'VI2', [
    ('s', 'Arreglo de Routh, sistema compensado (3.er orden)'),
    ('e', 's^3+a_2s^2+a_1s+a_0=0'),
    ('e', '\\m{s^3&1&a_1\\\\s^2&a_2&a_0\\\\s^1&b_1&0\\\\s^0&a_0&}'),
    ('e', 'b_1=\\f{a_2a_1-a_0}{a_2}'),
    ('s', 'Con K como variable (rango estable)'),
    ('e', 'a_2=10,   a_1=24+K,   a_0=%.4fK' % ZC),
    ('e', 'b_1=\\f{240+%.4fK}{10}>0  \\t{y}  a_0>0 ⇒ 0<K<∞' % (10 - ZC)),
    ('s', 'Arreglo de Routh con K = %.2f' % KC),
    ('e', 'a_1=24+%.2f=%.2f,   a_0=%.4f(%.2f)=%.2f' % (KC, A1, ZC, KC, A0)),
    ('e', 'b_1=\\f{(10)(%.2f)-%.2f}{10}=\\f{%.2f}{10}=%.2f' % (A1, A0, 10 * A1 - A0, B1)),
    ('e', '\\t{primera columna: }1,   10,   %.2f,   %.2f>0 ⇒ \\t{estable}' % (B1, A0)),
    ('s', 'Diferencia entre el polo candidato y el obtenido'),
    ('e', '\\t{Dif.}=\\f{\\d{p_{obt}-s_d}}{\\d{s_d}}×100'),
    ('e', '\\t{Dif.}=\\f{\\d{(%.4f+j%.4f)-(-%.4f+j%.4f)}}{%.4f}×100=%.1f \\t{%%}' % (p1.real, p1.imag, SD, WDD, WND, abs(p1 - sd) / abs(sd) * 100)),
    ('n', 'El par dominante cae exactamente en s~{d} porque K se calculó con la condición de magnitud en ese punto.')])

# ---------- VI · Paso 3 ----------
d13 = p3 - p1; m13 = abs(d13) ** 2
r3c = KC * (p3 + ZC) / (p3 * m13)
mr1 = KC * abs(p1 + ZC) / (abs(p1) * abs(p1 - p1.conjugate()) * abs(p1 - p3))
a_r = [deg(cmath.phase(p1 + ZC)), deg(cmath.phase(p1)), 90.0, deg(cmath.phase(p1 - p3))]
ar1 = a_r[0] - a_r[1] - a_r[2] - a_r[3]
ar1n = ar1 + 360 if ar1 < -180 else ar1
tpk = IC['tp']
box('VI · Paso 3. ¿Es razonable la aproximación de polos dominantes?', 'VI3', [
    ('s', 'Función de transferencia en lazo cerrado'),
    ('e', 'T(s)=\\f{KG_c(s)G(s)}{1+KG_c(s)G(s)}=\\f{K(s+z_c)}{s^3+10s^2+(24+K)s+Kz_c}'),
    ('e', 'T(s)=\\f{%.2f(s+%.4f)}{s^3+10s^2+%.2fs+%.2f}=\\f{%.2f(s+%.4f)}{(s-p_1)(s-p_2)(s-p_3)}' % (KC, ZC, A1, A0, KC, ZC)),
    ('s', 'Descomposición de la respuesta al escalón'),
    ('e', 'C(s)=\\f{T(s)}{s}=\\f{r_0}{s}+\\f{r_1}{s-p_1}+\\f{r_2}{s-p_2}+\\f{r_3}{s-p_3}'),
    ('e', 'r_i=(s-p_i)C(s)\\t{, evaluado en }s=p_i ⇒ r_i=\\f{K(p_i+z_c)}{p_i∏_{j≠i}(p_i-p_j)}'),
    ('n', 'Cada residuo es el peso del modo e^(pᵢt) en c(t): mientras más pequeño, menos influye en la respuesta.'),
    ('s', 'Polo en el origen (valor final)'),
    ('e', 'r_0=T(0)=\\f{Kz_c}{Kz_c}=1'),
    ('s', 'Tercer polo p~{3} = −%.4f' % -p3),
    ('e', 'r_3=\\f{%.2f(p_3+%.4f)}{p_3(p_3-p_1)(p_3-p_2)}' % (KC, ZC)),
    ('e', 'p_3+z_c=%.4f+%.4f=%.4f' % (p3, ZC, p3 + ZC)),
    ('e', 'p_3-p_1=%.4f-(-%.4f+j%.4f)=%.4f-j%.4f' % (p3, SD, WDD, d13.real, WDD)),
    ('e', '(p_3-p_1)(p_3-p_2)=%.4f^2+%.4f^2=%.4f' % (d13.real, WDD, m13)),
    ('n', 'Son números conjugados: (x − jy)(x + jy) = x² + y².'),
    ('e', 'r_3=\\f{%.2f(%.4f)}{(%.4f)(%.4f)}=\\f{%.4f}{%.4f}=%.4f' % (KC, p3 + ZC, p3, m13, KC * (p3 + ZC), p3 * m13, r3c)),
    ('n', 'El factor p₃ + z~{c} = %.4f es pequeño porque el polo está junto al cero: por eso el residuo es chico (cancelación parcial).' % (p3 + ZC)),
    ('s', 'Par dominante p~{1,2} = −%.4f ± j%.4f' % (SD, WDD)),
    ('e', 'r_1=\\f{%.2f(p_1+%.4f)}{p_1(p_1-p_2)(p_1-p_3)}' % (KC, ZC)),
    ('e', 'p_1+z_c=%.4f+j%.4f,   p_1-p_2=j%.4f,   p_1-p_3=%.4f+j%.4f' % ((p1 + ZC).real, WDD, 2 * WDD, (p1 - p3).real, WDD)),
    ('t', 'Magnitudes de cada factor:'),
    ('e', '\\d{p_1+z_c}=%.4f,  \\d{p_1}=%.4f,  \\d{p_1-p_2}=%.4f,  \\d{p_1-p_3}=%.4f' % (abs(p1 + ZC), abs(p1), 2 * WDD, abs(p1 - p3))),
    ('e', '\\d{r_1}=\\f{%.2f(%.4f)}{(%.4f)(%.4f)(%.4f)}=%.4f' % (KC, abs(p1 + ZC), abs(p1), 2 * WDD, abs(p1 - p3), mr1)),
    ('t', 'Ángulos de cada factor:'),
    ('e', '∠(p_1+z_c)=%.2f°,  ∠p_1=%.2f°,  ∠(p_1-p_2)=90°,  ∠(p_1-p_3)=%.2f°' % (a_r[0], a_r[1], a_r[3])),
    ('e', '∠r_1=%.2f°-(%.2f°+90°+%.2f°)=%.2f° ≡ %.2f°' % (a_r[0], a_r[1], a_r[3], ar1, ar1n)),
    ('t', 'De forma polar a rectangular:'),
    ('e', 'r_1=%.4f(cos%.2f°+j\\t{sen}%.2f°)=%.4f+j%.4f' % (mr1, ar1n, ar1n, r1.real, r1.imag)),
    ('e', 'r_2=%.4f-j%.4f  \\t{(conjugado de }r_1\\t{)}' % (r1.real, r1.imag)),
    ('s', 'Comprobación'),
    ('e', 'c(0)=r_0+r_1+r_2+r_3=1+2(%.4f)+(%.4f)=%.4f ✓' % (r1.real, r3c, abs(1 + 2 * r1.real + r3c))),
    ('s', 'Comparación con el polo dominante'),
    ('e', '\\f{\\d{r_3}}{\\d{r_1}}=\\f{%.4f}{%.4f}=%.3f,   τ_3=\\f{1}{\\d{p_3}}=\\f{1}{%.4f}=%.3f \\t{s}' % (abs(r3c), mr1, abs(r3c) / mr1, -p3, -1 / p3)),
    ('n', 'Durante el pico (t ≈ %.3f s) ese modo vale −%.4f·e^(−%.4f) = −%.4f: resta unos %.1f puntos al sobrepaso, por eso el simulado es menor que 16 %%.'
          % (tpk, -r3c, -p3 * tpk, -r3c * math.exp(p3 * tpk), -100 * r3c * math.exp(p3 * tpk)))])

# ---------- VI · Paso 4 ----------
box('VI · Paso 4. Error estacionario correspondiente (analítico)', 'VI4', [
    ('e', 'K_p=\\lim{s→0}{KG_c(s)G(s)},   K_v=\\lim{s→0}{sKG_c(s)G(s)}'),
    ('e', 'K_p=\\lim{s→0}{\\f{%.2f(s+%.4f)}{s(s+4)(s+6)}}=∞' % (KC, ZC)),
    ('e', 'K_v=\\lim{s→0}{\\f{%.2f(s+%.4f)}{(s+4)(s+6)}}=\\f{%.2f(%.4f)}{24}=\\f{%.2f}{24}' % (KC, ZC, KC, ZC, KC * ZC)),
    ('e', 'e_{esc}(∞)=\\f{1}{1+∞}=0,   e_{rampa}(∞)=\\f{1}{%.4f}' % KVC), ('g',),
    ('e', 'K_p=∞,   K_v=%.4f,   e_{esc}(∞)=0,   e_{rampa}(∞)=%.4f' % (KVC, EC))])

# ---------- VII · Paso 5 ----------
sg = SD; wd = WDD
Ac = -2 * r1.real; Bc = 2 * r1.imag
d1 = sg * Ac - wd * Bc; d2 = sg * Bc + wd * Ac
ct = lambda t: 1 + r3 * math.exp(p3 * t) - math.exp(-sg * t) * (Ac * math.cos(wd * t) + Bc * math.sin(wd * t))
dc = lambda t: r3 * p3 * math.exp(p3 * t) + math.exp(-sg * t) * (d1 * math.cos(wd * t) + d2 * math.sin(wd * t))
tp = IC['tp']; ts = IC['ts']
box('VII · Paso 5. Simulación de las entradas requeridas y desempeño del modelo completo', 'VII5', [
    ('s', 'Armado de c(t) (Laplace inversa de cada término)'),
    ('e', '\\t{L}^{-1}\\b{\\f{r_0}{s}}=r_0,  \\t{L}^{-1}\\b{\\f{r_i}{s-p_i}}=r_ie^{p_it}'),
    ('t', 'El par complejo se junta en un solo término real. Con r₁ = a + jb, r₂ = a − jb, p₁,₂ = −σ ± jω~{d} y la fórmula de Euler:'),
    ('e', 'r_1e^{p_1t}+r_2e^{p_2t}=2e^{-σt}[a cos(ω_dt)-b \\t{sen}(ω_dt)]'),
    ('s', 'Sistema con PD (K = %.2f): c(t) con los residuos de VI · Paso 3' % KC),
    ('t', 'Sustitución con r₀ = 1, r₃ = −%.4f, a = −%.4f, b = %.4f, σ = %.4f, ω~{d} = %.4f:' % (-r3, -r1.real, r1.imag, sg, wd)),
    ('e', 'c(t)=1-%.4fe^{-%.4f t}-e^{-%.4f t}[%.4f cos(%.4f t)+%.4f \\t{sen}(%.4f t)]' % (-r3, -p3, sg, Ac, wd, Bc, wd)),
    ('e', 'c(0)=1-%.4f-%.4f=%.4f ✓' % (-r3, Ac, abs(1 + r3 - Ac))),
    ('s', 'Tiempo pico: c′(t) = 0'),
    ('e', 'c\'(t)=%.4fe^{-%.4f t}+e^{-%.4f t}[%.4f cos(%.4f t)+%.4f \\t{sen}(%.4f t)]' % (r3 * p3, -p3, sg, d1, wd, d2, wd)),
    ('e', 'c\'(0.52)=%.4f>0,   c\'(0.53)=%.4f<0 ⇒ 0.52<t_p<0.53' % (dc(0.52), dc(0.53))),
    ('t', 'Con calculadora:'), ('e', 't_p=%.4f \\t{s}' % tp),
    ('s', 'Valor máximo c~{máx} = c(t~{p})'),
    ('e', 'c_{máx}=1-%.4fe^{-%.4f}-e^{-%.4f}[%.4f cos(%.4f)+%.4f \\t{sen}(%.4f)]' % (-r3, -p3 * tp, sg * tp, Ac, wd * tp, Bc, wd * tp)),
    ('e', 'c_{máx}=1-%.4f-%.4f[%.4f(%.4f)+%.4f(%.4f)]=%.4f' % (-r3 * math.exp(p3 * tp), math.exp(-sg * tp), Ac, math.cos(wd * tp), Bc, math.sin(wd * tp), ct(tp))),
    ('s', 'Sobrepaso'),
    ('e', '\\%%OS=\\f{c_{máx}-c(∞)}{c(∞)}×100=\\f{%.4f-1}{1}×100=%.2f \\t{%%}' % (IC['pk'], IC['os'])),
    ('s', 'Tiempo de asentamiento (banda de 2 %)'),
    ('t', 'Es el último instante en que |c(t) − 1| = 0.02. Después del primer mínimo la respuesta sube hacia 1 desde abajo:'),
    ('e', 'c(1.15)=%.4f<0.98,   c(1.16)=%.4f>0.98' % (ct(1.15), ct(1.16))),
    ('t', 'Con calculadora (o stepinfo):'),
    ('e', 'T_s=%.3f \\t{s}' % ts),
    ('s', 'Comparación con el sistema sin compensar'),
    ('e', '\\f{T_{s,u}}{T_{s,c}}=\\f{%.3f}{%.3f}=%.2f ≥ 3 ✓' % (RI['ts'], ts, TSR)),
    ('n', 'Sin compensar (K = %.2f), el modelo completo da %.2f %%, t~{p} = %.3f s y T~{s} = %.3f s (stepinfo); la meta es T~{s} ≤ %.3f s.' % (K0, RI['os'], RI['tp'], RI['ts'], TSMETA))])

# ---------- VII · Paso 6 ----------
q1 = r1 / p1; q3 = r3 / p3
box('VII · Paso 6. Error estacionario simulado', 'VII6', [
    ('s', 'Error ante rampa en el tiempo'),
    ('e', 'e(t)=t-c_{rampa}(t),   c_{rampa}(t)=∫_0^tc_{esc}(τ)dτ'),
    ('e', 'c_{rampa}(t)=r_0t+∑\\f{r_i}{p_i}(e^{p_it}-1)'),
    ('e', 'e(t)=∑\\f{r_i}{p_i}-∑\\f{r_i}{p_i}e^{p_it}   \\t{(con }r_0=1\\t{)}'),
    ('s', 'Valor final'),
    ('e', '\\f{r_3}{p_3}=\\f{%.4f}{%.4f}=%.4f' % (r3, p3, q3)),
    ('n', 'r₁/p₁ y r₂/p₂ son conjugados: su suma es el doble de la parte real de r₁/p₁.'),
    ('e', '\\f{r_1}{p_1}+\\f{r_2}{p_2}=2(%.4f)=%.4f' % (q1.real, 2 * q1.real)),
    ('e', 'e(∞)=%.4f+%.4f=%.4f ✓  (=1/K_v)' % (2 * q1.real, q3, 2 * q1.real + q3)),
    ('s', 'Qué tan rápido llega'),
    ('e', 'e(2)=%.4f,   e(10)=%.4f' % (eC2, eC10)),
    ('n', 'El modo más lento es el de p₃ (τ = %.3f s): a los 2 s ya pasaron más de 5τ.' % (-1 / p3)),
    ('e', 'e_{sim}(∞)=%.4f,   e_{u,sim}(∞)=%.4f  \\t{(sin compensar)}' % (eC10, RN['ref_e']))])

# ---------- VII · Paso 7 ----------
zc_ = RN['zc']
def osK(K):
    d = np.polyadd([1, 10, 24, 0], np.polymul([K], [1, zc_]))
    return num4.info(num4.resp(np.polymul([K], [1, zc_]), d)[3], 10, 1e-4)
tri = [(K, osK(K)) for K in (50, 54, 56, 60)]
box('VII · Paso 7. Ajuste del diseño y repetición de la verificación', 'VII7', [
    ('s', 'Revisión de las especificaciones'),
    ('e', 'T_s=%.3f \\t{s}≤%.3f \\t{s} ✓,   \\%%OS=%.2f \\t{%%}<16 \\t{%%}' % (IC['ts'], TSMETA, IC['os'])),
    ('n', 'Menos sobrepaso que el pedido: el sistema queda más amortiguado. Se acepta (el libro también) y no se ajusta.'),
    ('s', 'Comprobación: K que daría 16 % con el mismo cero'),
    ('t', 'Se simula el modelo completo con z~{c} = %.4f y varias K:' % ZC),
    ('e', ',   '.join('K=%g: %.2f \\t{%%}' % (K, i['os']) for K, i in tri)),
    ('t', 'Entre 56 y 60 se busca por bisección (MATLAB: fzero con stepinfo):'),
    ('e', 'K=%.2f:   \\%%OS=%.2f \\t{%%},   t_p=%.3f \\t{s},   T_s=%.3f \\t{s}' % (K16, I16['os'], I16['tp'], I16['ts'])),
    ('e', 'p_{1,2}=%.4f±j%.4f,   p_3=%.4f' % (p16.real, p16.imag, p16r)),
    ('e', 'ζ=\\f{σ}{\\r{σ^2+ω_d^2}}=\\f{%.4f}{\\r{%.4f^2+%.4f^2}}=%.4f' % (-p16.real, -p16.real, p16.imag, Z16)),
    ('n', 'Con esa K los polos dominantes salen de la recta de diseño (ζ = %.3f < %.3f). Se conserva K = %.2f y z~{c} = %.3f.' % (Z16, Z, KC, ZC))])
