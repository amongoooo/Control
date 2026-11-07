# Anexo «C. Cálculos» de la P6 (mismo orden que el reporte).
import math, cmath
import numpy as np
from build import calc_box
import num6
from p6 import (Z, TH, TN, SG, s0, WD, K0, WN, KP0, E0, OS2, TS2, TP2, TRn, TR2, k1, SB, KB_, P3R, r3R, r1R, TPD, WDD, SD, sd, WND, ANG, ANG8, ANGG,
                THZ, ZC, KPD, TANZ, MG, IPD, EPD, KPPD, DA, DM, SF, sF, WF, KF, K1, K2, K3, p1, r1, p3, r3, p4, r4, IF, KV, DENF, A, B1, C1, N3,
                TSTAIL, TPMETA, RI, YF0, f)
RN = num6.R
deg = math.degrees
atd = lambda y, x: deg(math.atan(y / x))
ln20 = math.log(0.20)
C = []


def box(t, k, items): C.extend(calc_box(t, k, items))


ta = lambda sig: num6.angsum(sig, [-8], [-3, -6, -10])
g = [deg(cmath.phase(s0 + a)) for a in (8, 3, 6, 10)]
m0 = [abs(s0 + a) for a in (3, 6, 10, 8)]
box('III · Paso 1. Ganancia de referencia (no asumir que es uno)', 'III1', [
    ('s', 'Factor de amortiguamiento a partir del sobrepaso'),
    ('e', 'ζ=\\f{-\\t{ln}(0.20)}{\\r{π^2+\\t{ln}^2(0.20)}}=\\f{%.4f}{\\r{%.4f+%.4f}}=%.4f' % (-ln20, math.pi ** 2, ln20 ** 2, Z)),
    ('e', 'θ=cos^{-1}(%.4f)=%.2f°,   tanθ=%.4f' % (Z, TH, TN)), ('g',),
    ('s', 'Punto sobre la recta de ζ con la condición de ángulo'),
    ('e', 's=-σ+jσtanθ,   ∠(s+8)-∠(s+3)-∠(s+6)-∠(s+10)=±180°'),
    ('n', 'Se prueban valores de σ:'),
    ('e', 'σ=5.0: %.2f°,   σ=5.3: %.2f°,   σ=5.5: %.2f°' % (ta(5.0), ta(5.3), ta(5.5))),
    ('t', 'Afinando con la calculadora:'),
    ('e', 'σ=%.4f,   ω_d=%.4f(%.4f)=%.4f' % (SG, SG, TN, WD)),
    ('e', '%.2f°-(%.2f°+%.2f°+%.2f°)=%.2f° ≡ -180°' % (g[0], g[1], g[2], g[3], g[0] - g[1] - g[2] - g[3])), ('g',),
    ('e', 's_0=-%.4f+j%.4f' % (SG, WD)),
    ('s', 'Ganancia de referencia (condición de magnitud)'),
    ('e', 'K=\\f{\\d{s_0+3}\\d{s_0+6}\\d{s_0+10}}{\\d{s_0+8}}=\\f{(%.4f)(%.4f)(%.4f)}{%.4f}' % tuple(m0)), ('g',),
    ('e', 'K_{ref}=%.2f' % K0),
    ('s', 'Si se asumiera K = 1'),
    ('e', 's^3+19s^2+109s+188=0 ⇒ s=%.4f,  %.4f,  %.4f' % (k1[2], k1[1], k1[0])),
    ('n', 'Las tres raíces son reales: no corresponden a 20 % de sobrepaso, por eso no se puede asumir K = 1.')])

box('III · Paso 2. Polos, ceros, tipo y ecuación característica', 'III2', [
    ('e', 'D(s)=(s+3)(s+6)(s+10)=s^3+19s^2+108s+180,   N(s)=s+8'),
    ('e', 'p=-3, -6, -10,   z=-8,   n=3,   m=1'),
    ('e', '\\t{Ningún polo en el origen} ⇒ \\t{tipo }0'),
    ('e', 'D(s)+KN(s)=0 ⇒ s^3+19s^2+(108+K)s+(180+8K)=0'),
    ('s', 'Tramos del eje real'),
    ('t', 'Entre −3 y −6 hay 1 polo a la derecha (impar): sí. Entre −6 y −8 hay 2 (par): no. Entre −8 y −10 hay 3 (impar): sí. A la izquierda de −10 hay 4: no.'),
    ('e', '[-6, -3] ∪ [-10, -8]'),
    ('s', 'Asíntotas'),
    ('e', 'σ_a=\\f{(-3-6-10)-(-8)}{3-1}=\\f{-11}{2}=-5.5,   θ_a=\\f{(2k+1)180°}{2}=90°, 270°'),
    ('s', 'Punto de ruptura'),
    ('e', 'N(σ)D\'(σ)-N\'(σ)D(σ)=0'),
    ('e', '(σ+8)(3σ^2+38σ+108)-(σ^3+19σ^2+108σ+180)=2σ^3+43σ^2+304σ+684=0'),
    ('e', 'σ_b=%.4f  \\t{(en el tramo }[-6,-3]\\t{)}' % SB),
    ('e', 'K_b=\\d{\\f{D(σ_b)}{N(σ_b)}}=%.4f' % KB_),
    ('n', 'Las otras dos raíces son complejas (no son rupturas).')])

box('III · Paso 3. Estabilidad y rango de ganancia estable', 'III3', [
    ('e', '\\m{s^3&1&108+K\\\\s^2&19&180+8K\\\\s^1&b_1&0\\\\s^0&180+8K&}'),
    ('e', 'b_1=\\f{19(108+K)-(180+8K)}{19}=\\f{1872+11K}{19}'),
    ('e', 'b_1>0  \\t{y}  180+8K>0  \\t{para toda }K>0 ⇒ 0<K<∞'),
    ('e', 'K=%.2f:   b_1=\\f{1872+11(%.2f)}{19}=%.2f>0' % (K0, K0, (1872 + 11 * K0) / 19))])

q0 = SG ** 2 + WD ** 2
box('III · Paso 4. Polos en lazo cerrado con la ganancia de referencia', 'III4', [
    ('e', 's^3+19s^2+%.2fs+%.2f=0' % (108 + K0, 180 + 8 * K0)),
    ('e', '(s-p_1)(s-p_2)=s^2+%.4fs+%.4f' % (2 * SG, q0)),
    ('e', 'p_3=-19+2(%.4f)=%.4f' % (SG, P3R)),
    ('e', 'p_1p_2p_3=(%.4f)(%.4f)=%.2f=-(180+8K) ✓' % (q0, P3R, q0 * P3R)),
    ('e', 'r_3=%.4f,   \\d{r_1}=%.4f ⇒ \\f{\\d{r_3}}{\\d{r_1}}=%.3f' % (r3R, abs(r1R), abs(r3R) / abs(r1R))),
    ('n', 'El tercer polo está a %.3f del cero en −8: casi se cancela.' % (-8 - P3R))])

box('III · Paso 5. Respuesta transitoria y error estacionario', 'III5', [
    ('e', 'ω_n=\\r{%.4f^2+%.4f^2}=%.4f,   ζ=\\f{%.4f}{%.4f}=%.4f' % (SG, WD, WN, SG, WN, Z)),
    ('e', '\\%%OS=e^{-%.4fπ/\\r{1-%.4f^2}}×100=%.2f \\t{%%}' % (Z, Z, OS2)),
    ('e', 'T_s=\\f{4}{%.4f}=%.4f \\t{s},   T_p=\\f{π}{%.4f}=%.4f \\t{s}' % (SG, TS2, WD, TP2)),
    ('e', 'T_r≈\\f{%.4f}{%.4f}=%.4f \\t{s}' % (TRn, WN, TR2)),
    ('s', 'Error al escalón (tipo 0)'),
    ('e', 'K_p=\\lim{s→0}{\\f{%.2f(s+8)}{(s+3)(s+6)(s+10)}}=\\f{8(%.2f)}{180}=%.4f' % (K0, K0, KP0)),
    ('e', 'e_{esc}(∞)=\\f{1}{1+%.4f}=%.4f' % (KP0, E0))])

box('IV · a) Punto de diseño', 'IVa', [
    ('e', 'T_{p,d}=\\f{2}{3}(%.4f)=%.4f \\t{s}' % (TP2, TPD)),
    ('e', 'ω_d=\\f{π}{%.4f}=%.4f,   σ_d=\\f{%.4f}{%.4f}=%.4f' % (TPD, WDD, WDD, TN, SD)), ('g',),
    ('e', 's_d=-%.4f+j%.4f' % (SD, WDD)),
    ('e', 'ζ=\\f{%.4f}{\\r{%.4f^2+%.4f^2}}=%.4f ✓' % (SD, SD, WDD, SD / WND))])

box('IV · b) Ángulo faltante y cero del PD', 'IVb', [
    ('e', '∠(s_d+8)=180°-tan^{-1}(\\f{%.4f}{%.4f})=%.2f°' % (WDD, SD - 8, ANG8)),
    ('e', '∠(s_d+3)=180°-tan^{-1}(\\f{%.4f}{%.4f})=%.2f°' % (WDD, SD - 3, ANG[0])),
    ('e', '∠(s_d+6)=180°-tan^{-1}(\\f{%.4f}{%.4f})=%.2f°' % (WDD, SD - 6, ANG[1])),
    ('e', '∠(s_d+10)=tan^{-1}(\\f{%.4f}{%.4f})=%.2f°' % (WDD, 10 - SD, ANG[2])),
    ('n', 'Sólo s~{d} + 10 tiene parte real positiva (primer cuadrante); s~{d} + 8 casi apunta hacia arriba (%.2f°).' % ANG8),
    ('e', '∠G(s_d)=%.2f°-(%.2f°+%.2f°+%.2f°)=%.2f°' % (ANG8, ANG[0], ANG[1], ANG[2], ANGG)),
    ('e', 'θ_z=-180°-(%.2f°)=%.2f°' % (ANGG, THZ)),
    ('s', 'Ubicación del cero'),
    ('e', 'z_{PD}=σ_d+\\f{ω_d}{tanθ_z}=%.4f+\\f{%.4f}{%.4f}=%.4f' % (SD, WDD, TANZ, ZC))])

box('IV · c) Ganancia y verificación del PD', 'IVc', [
    ('e', '\\d{s_d+3}=%.4f,  \\d{s_d+6}=%.4f,  \\d{s_d+10}=%.4f' % (MG[0], MG[1], MG[2])),
    ('e', '\\d{s_d+8}=%.4f,  \\d{s_d+z_{PD}}=%.4f' % (MG[3], MG[4])),
    ('e', 'K_{PD}=\\f{(%.4f)(%.4f)(%.4f)}{(%.4f)(%.4f)}=%.4f' % tuple(MG + [KPD])),
    ('s', 'Error con sólo el PD'),
    ('e', 'K_p=\\f{8(%.4f)(%.4f)}{180}=%.4f,   e(∞)=\\f{1}{1+%.4f}=%.4f' % (ZC, KPD, KPPD, KPPD, EPD)),
    ('e', '\\t{Con PD: }\\%%OS=%.2f \\t{%%},   t_p=%.4f \\t{s}' % (IPD['os'], IPD['tp']))])

box('IV · d) Parte PI (cero en −0.5)', 'IVd', [
    ('e', 's_d+0.5=%.4f+j%.4f' % (-SD + 0.5, WDD)),
    ('e', '∠(s_d+0.5)-∠s_d=%.2f°-%.2f°=%.2f°' % (deg(cmath.phase(sd + 0.5)), deg(cmath.phase(sd)), DA)),
    ('e', '\\f{\\d{s_d+0.5}}{\\d{s_d}}=\\f{%.4f}{%.4f}=%.4f' % (abs(sd + 0.5), abs(sd), DM)),
    ('n', 'El dipolo (polo en 0, cero en −0.5) cambia el ángulo apenas %.2f°: el LGDR casi no se mueve.' % DA)])

ga = num6.angsum
tF = lambda x: ga(x, [-8, -ZC, -0.5], [0, -3, -6, -10])
mF = [abs(sF), abs(sF + 3), abs(sF + 6), abs(sF + 10), abs(sF + 8), abs(sF + ZC), abs(sF + 0.5)]
box('IV · e) Re‑búsqueda con el PID y nueva ecuación', 'IVe', [
    ('e', '∠(s+8)+∠(s+z_{PD})+∠(s+0.5)-∠s-∠(s+3)-∠(s+6)-∠(s+10)=±180°'),
    ('e', 'σ=7.4: %.2f°,   σ=7.5: %.2f°,   σ=7.6: %.2f°' % (tF(7.4), tF(7.5), tF(7.6))),
    ('e', 'σ=%.4f ⇒ s_0=-%.4f+j%.4f' % (SF, SF, WF)),
    ('e', 'K=\\f{\\d{s_0}\\d{s_0+3}\\d{s_0+6}\\d{s_0+10}}{\\d{s_0+8}\\d{s_0+z_{PD}}\\d{s_0+0.5}}'),
    ('e', 'K=\\f{(%.3f)(%.3f)(%.3f)(%.3f)}{(%.3f)(%.3f)(%.3f)}=%.4f' % tuple(mF + [KF])),
    ('s', 'Nueva ecuación característica'),
    ('e', 's(s^3+19s^2+108s+180)+K(s^3+%.3fs^2+%.3fs+%.3f)=0' % tuple(N3[1:])),
    ('e', 's^4+%.3fs^3+%.3fs^2+%.3fs+%.3f=0' % tuple(DENF[1:]))])

q = SF ** 2 + WF ** 2
box('VI · Paso 1. Ecuación característica final y todos los polos en lazo cerrado', 'VI1', [
    ('e', 's^4+%.3fs^3+%.3fs^2+%.3fs+%.3f=0' % tuple(DENF[1:])),
    ('e', '(s-p_1)(s-p_2)=s^2+%.4fs+%.4f' % (2 * SF, q)),
    ('e', '\\f{s^4+%.2fs^3+%.2fs^2+%.2fs+%.2f}{s^2+%.4fs+%.4f}=s^2+%.4fs+%.4f' % (tuple(DENF[1:]) + (2 * SF, q, -(p3 + p4), p3 * p4))),
    ('e', 's^2+%.4fs+%.4f=0 ⇒ p_3=%.4f,   p_4=%.4f' % (-(p3 + p4), p3 * p4, p3, p4)),
    ('e', 'p_1+p_2+p_3+p_4=%.4f=-a_3 ✓' % (2 * SF * -1 + p3 + p4))])

box('VI · Paso 2. Estabilidad y comparación con los polos candidatos', 'VI2', [
    ('e', '\\m{s^4&1&a_2&a_0\\\\s^3&a_3&a_1&0\\\\s^2&b_1&a_0&\\\\s^1&c_1&0&\\\\s^0&a_0&&}'),
    ('e', 'b_1=\\f{a_3a_2-a_1}{a_3},   c_1=\\f{b_1a_1-a_3a_0}{b_1}'),
    ('e', 'b_1=\\f{(%.3f)(%.3f)-%.3f}{%.3f}=%.3f' % (A[1], A[2], A[3], A[1], B1)),
    ('e', 'c_1=\\f{(%.3f)(%.3f)-(%.3f)(%.3f)}{%.3f}=%.3f' % (B1, A[3], A[1], A[4], B1, C1)),
    ('e', '\\t{primera columna: }1,  %.2f,  %.2f,  %.2f,  %.2f>0 ⇒ \\t{estable}' % (A[1], B1, C1, A[4])),
    ('n', 'Con K como variable se revisaron K de 10⁻⁴ a 10⁶: todas las raíces quedan con parte real negativa.'),
    ('e', '\\t{Dif.}=\\f{\\d{p_1-s_0}}{\\d{s_0}}×100=%.1f \\t{%%}' % (abs(p1 - sF) / abs(sF) * 100))])

box('VI · Paso 3. ¿Es razonable la aproximación de polos dominantes?', 'VI3', [
    ('e', 'T(s)=\\f{K(s+8)(s+z_{PD})(s+0.5)}{(s-p_1)(s-p_2)(s-p_3)(s-p_4)},   r_i=\\f{N_T(p_i)}{p_iD_T\'(p_i)}'),
    ('e', 'r_3=\\f{%.4f(p_3+8)(p_3+%.2f)(p_3+0.5)}{p_3∏_{j≠3}(p_3-p_j)}=%.4f' % (KF, ZC, r3)),
    ('e', 'r_4=\\f{%.4f(p_4+8)(p_4+%.2f)(p_4+0.5)}{p_4∏_{j≠4}(p_4-p_j)}=%.4f' % (KF, ZC, r4)),
    ('n', 'Los factores p₃ + 8 = %.4f y p₄ + 0.5 = %.4f son pequeños: cada polo está junto a un cero (cancelación casi total y parcial).' % (p3 + 8, p4 + 0.5)),
    ('e', 'r_{1,2}=%.4f±j%.4f,   \\d{r_1}=%.4f' % (r1.real, r1.imag, abs(r1))),
    ('e', 'c(0)=1+2(%.4f)+%.4f+(%.4f)=%.4f ✓' % (r1.real, r3, r4, abs(1 + 2 * r1.real + r3 + r4))),
    ('e', 'τ_4=\\f{1}{\\d{p_4}}=%.3f \\t{s}' % (-1 / p4))])

box('VI · Paso 4. Error estacionario correspondiente (analítico)', 'VI4', [
    ('e', 'K_p=\\lim{s→0}{%.4f\\f{(s+8)(s+%.2f)(s+0.5)}{s(s+3)(s+6)(s+10)}}=∞ ⇒ e_{esc}(∞)=0' % (KF, ZC)),
    ('e', 'K_v=\\f{%.4f(8)(%.4f)(0.5)}{180}=%.4f,   e_{rampa}(∞)=%.4f' % (KF, ZC, KV, 1 / KV))])

c = RN['F_c']; tp = IF['tp']; t0 = math.floor(tp * 100) / 100
box('VII · Paso 5. Simulación de las entradas requeridas y desempeño del modelo completo', 'VII5', [
    ('e', 'c(t)=1+2e^{%.4ft}[%.4f cos(%.4ft)-%.4f \\t{sen}(%.4ft)]+%.4fe^{%.4ft}%.4fe^{%.4ft}' % (p1.real, r1.real, WF, r1.imag, WF, r3, p3, r4, p4)),
    ('e', 'c(%.2f)=%.4f,   c(%.4f)=%.4f,   c(%.2f)=%.4f' % (t0, c(np.array([t0]))[0], tp, IF['pk'], t0 + 0.01, c(np.array([t0 + 0.01]))[0])),
    ('e', 't_p=%.4f \\t{s},   \\%%OS=\\f{%.4f-1}{1}×100=%.2f \\t{%%}' % (tp, IF['pk'], IF['os'])),
    ('e', 'T_{p,meta}=\\f{2}{3}(%.4f)=%.4f \\t{s} ⇒ %.4f<%.4f ✓' % (TP2, TPMETA, tp, TPMETA)),
    ('e', 'T_s=%.3f \\t{s}  \\t{(stepinfo)}' % IF['ts'])])

box('VII · Paso 6. Error estacionario simulado', 'VII6', [
    ('e', 'e(t)=1-c(t)'),
    ('e', 'e(∞)=-(r_1+r_2+r_3+r_4)=-(%.4f+%.4f+%.4f)=%.4f ⇒ 0' % (2 * r1.real, r3, r4, -(2 * r1.real + r3 + r4) + 1 - 1)),
    ('e', 'e(12)≈%.4fe^{%.4f(12)}=%.5f' % (-r4, p4, RN['F_e12'])),
    ('e', 'e_u(∞)=%.4f,   e_{PD}(∞)=%.4f' % (E0, EPD))])

box('VII · Paso 7. Ajuste del diseño y repetición de la verificación', 'VII7', [
    ('e', 't_p=%.3f≤%.3f ✓,   \\%%OS=%.2f \\t{%%}≤20 \\t{%%} ✓,   e(∞)=0 ✓' % (tp, TPMETA, IF['os'])),
    ('s', 'Tiempo de asentamiento por la cola del PI'),
    ('e', '\\d{r_4}e^{p_4T_s}=0.02 ⇒ T_s=\\f{\\t{ln}(%.4f/0.02)}{%.4f}=%.3f \\t{s}' % (abs(r4), -p4, TSTAIL)),
    ('n', 'Coincide con stepinfo (%.3f s). No se pidió T~{s}, así que no se ajusta.' % IF['ts'])])
