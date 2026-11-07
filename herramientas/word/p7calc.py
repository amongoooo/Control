# Anexo «C. Cálculos» de la P7 (mismo orden que el reporte).
import math, cmath
import numpy as np
from build import calc_box
import num7
from p7 import (Z, TH, TN, SG, s0, WD, K0, WN, KV0, E0, OS2, TS2, TP2, TRn, TR2, k1, META, KVM, EMETA, B, A, TESTS, WDD, sd, SD, WND, ANG, ANGZ,
                ANGG, THP, PAD, KAD, KVAD, RAT, ZAT, TANP, MG, p1, r1, p3, r3, p4, r4, q1, s1, q3, s3, q4, s4, IB, IA, KB, KA, EB, EA, DB, DA_, RB,
                RA, RI, f)
RN = num7.R
deg = math.degrees
atd = lambda y, x: deg(math.atan(y / x))
ln20 = math.log(0.20)
C = []


def box(t, k, items): C.extend(calc_box(t, k, items))


box('III · Paso 1. Ganancia de referencia (no asumir que es uno)', 'III1', [
    ('s', 'Factor de amortiguamiento a partir del sobrepaso'),
    ('e', 'ζ=\\f{-\\t{ln}(0.20)}{\\r{π^2+\\t{ln}^2(0.20)}}=\\f{%.4f}{\\r{%.4f+%.4f}}=%.4f' % (-ln20, math.pi ** 2, ln20 ** 2, Z)),
    ('e', 'θ=cos^{-1}(%.4f)=%.2f°,   tanθ=%.4f' % (Z, TH, TN)), ('g',),
    ('s', 'Parte real de los polos complejos'),
    ('e', 's^2+7s+K=0 ⇒ s=\\f{-7±\\r{49-4K}}{2} ⇒ σ=3.5  (K>12.25)'),
    ('e', 'ω_d=σtanθ=3.5(%.4f)=%.4f ⇒ s_0=-3.5+j%.4f' % (TN, WD, WD)),
    ('s', 'Ganancia de referencia (condición de magnitud)'),
    ('e', 'K=\\d{s_0}\\d{s_0+7}=(\\r{3.5^2+%.4f^2})^2=%.4f^2' % (WD, WN)), ('g',),
    ('e', 'K_{ref}=%.2f' % K0),
    ('s', 'Si se asumiera K = 1'),
    ('e', 's^2+7s+1=0 ⇒ s=%.4f,   %.4f' % (k1[1], k1[0])),
    ('n', 'Las dos raíces son reales: no corresponden a 20 % de sobrepaso.')])

box('III · Paso 2. Polos, ceros, tipo y ecuación característica', 'III2', [
    ('e', 'D(s)=s(s+7),   N(s)=1 ⇒ p=0, -7,   n=2,   m=0'),
    ('e', 'G(s)=\\f{K}{s^1(s+7)} ⇒ \\t{tipo }1'),
    ('e', 's(s+7)+K=0 ⇒ s^2+7s+K=0'),
    ('t', 'Entre 0 y −7 hay 1 polo a la derecha (impar): pertenece al LGDR. A la izquierda de −7 hay 2 (par): no.'),
    ('e', 'σ_a=\\f{0+(-7)}{2}=-3.5,   θ_a=\\f{(2k+1)180°}{2}=90°, 270°'),
    ('e', 'K(σ)=-(σ^2+7σ),   \\f{dK}{dσ}=-(2σ+7)=0 ⇒ σ_b=-3.5,   K_b=12.25')])

box('III · Paso 3. Estabilidad y rango de ganancia estable', 'III3', [
    ('e', '\\m{s^2&1&K\\\\s^1&7&0\\\\s^0&K&}'),
    ('e', '7>0  \\t{y}  K>0 ⇒ 0<K<∞'),
    ('e', '\\t{primera columna con }K_{ref}\\t{: }1,   7,   %.2f>0 ⇒ \\t{estable}' % K0)])

box('III · Paso 4. Polos en lazo cerrado con la ganancia de referencia', 'III4', [
    ('e', 's^2+7s+%.2f=0 ⇒ s=\\f{-7±\\r{49-4(%.2f)}}{2}=\\f{-7±j%.4f}{2}' % (K0, K0, math.sqrt(4 * K0 - 49))),
    ('e', 'p_{1,2}=-3.5±j%.4f' % WD),
    ('e', 'p_1+p_2=-7 ✓,   p_1p_2=3.5^2+%.4f^2=%.2f=K ✓' % (WD, K0))])

box('III · Paso 5. Respuesta transitoria y error estacionario', 'III5', [
    ('e', 'ω_n=\\r{3.5^2+%.4f^2}=%.4f,   ζ=\\f{3.5}{%.4f}=%.4f' % (WD, WN, WN, Z)),
    ('e', '\\%%OS=e^{-%.4fπ/\\r{1-%.4f^2}}×100=%.2f \\t{%%}' % (Z, Z, OS2)),
    ('s', 'Inciso a)'),
    ('e', 'T_s=\\f{4}{σ}=\\f{4}{3.5}=%.4f \\t{s}' % TS2),
    ('e', 'T_p=\\f{π}{%.4f}=%.4f \\t{s},   T_r≈\\f{%.4f}{%.4f}=%.4f \\t{s}' % (WD, TP2, TRn, WN, TR2)),
    ('s', 'Inciso b)'),
    ('e', 'K_v=\\lim{s→0}{s\\f{%.2f}{s(s+7)}}=\\f{%.2f}{7}=%.4f' % (K0, K0, KV0)),
    ('e', 'e_{rampa}(∞)=\\f{1}{%.4f}=%.4f' % (KV0, E0))])

box('IV · a) Punto de diseño', 'IVa', [
    ('e', 'T_{s,d}=\\f{%.4f}{2}=%.4f \\t{s}' % (TS2, META)),
    ('e', 'σ_d=\\f{4}{%.4f}=7,   ω_d=7(%.4f)=%.4f' % (META, TN, WDD)),
    ('e', 's_d=-7+j%.4f' % WDD)])

pv = sd + PAD
box('IV · b) Ángulo con el cero y polo del adelanto', 'IVb', [
    ('e', '∠s_d=180°-tan^{-1}(\\f{%.4f}{7})=%.2f°' % (WDD, ANG[0])),
    ('e', '∠(s_d+7)=∠(j%.4f)=90°' % WDD),
    ('e', '∠(s_d+3)=180°-tan^{-1}(\\f{%.4f}{4})=%.2f°' % (WDD, ANGZ)),
    ('e', '%.2f°-%.2f°-90°=%.2f°' % (ANGZ, ANG[0], ANGG)),
    ('e', '%.2f°-θ_p=-180° ⇒ θ_p=%.2f°' % (ANGG, THP)),
    ('s', 'Ubicación del polo'),
    ('e', 'p_{ad}=7+\\f{%.4f}{tan(%.2f°)}=7+\\f{%.4f}{%.4f}=%.4f' % (WDD, THP, WDD, TANP, PAD)),
    ('e', '∠(s_d+p_{ad})=tan^{-1}(\\f{%.4f}{%.4f})=%.2f° ✓' % (WDD, pv.real, atd(WDD, pv.real)))])

box('IV · c) Ganancia del adelanto y mejora de error que falta', 'IVc', [
    ('e', '\\d{s_d}=%.4f,  \\d{s_d+7}=%.4f,  \\d{s_d+p_{ad}}=%.4f,  \\d{s_d+3}=%.4f' % tuple(MG)),
    ('e', 'K_{ad}=\\f{(%.4f)(%.4f)(%.4f)}{%.4f}=%.3f' % tuple(MG + [KAD])),
    ('e', 'K_{v,ad}=\\f{3(%.3f)}{7(%.4f)}=%.4f' % (KAD, PAD, KVAD)),
    ('e', 'K_{v,meta}=10(%.4f)=%.3f' % (KV0, KVM)),
    ('e', '\\f{z_{at}}{p_{at}}=\\f{%.3f}{%.4f}=%.4f' % (KVM, KVAD, RAT))])

box('IV · d) Compensador de atraso', 'IVd', [
    ('e', 'p_{at}=0.01 ⇒ z_{at}=%.4f(0.01)=%.5f' % (RAT, ZAT)),
    ('e', '∠(s_d+z_{at})-∠(s_d+0.01)=%.2f° ' % B['dip']),
    ('e', '\\f{\\d{s_d+z_{at}}}{\\d{s_d+0.01}}=%.4f' % B['dipm']),
    ('n', 'El dipolo casi no cambia el ángulo ni la magnitud en s~{d}.')])

ga = num7.angsum
tF = lambda x: ga(x, [-3, -ZAT], [0, -7, -PAD, -0.01])
sF = B['sF']; mF = [abs(sF), abs(sF + 7), abs(sF + PAD), abs(sF + 0.01), abs(sF + 3), abs(sF + ZAT)]
box('IV · e) Re‑búsqueda con el adelanto‑atraso y nueva ecuación', 'IVe', [
    ('e', '∠(s+3)+∠(s+z_{at})-∠s-∠(s+7)-∠(s+p_{ad})-∠(s+0.01)=±180°'),
    ('e', 'σ=6.9: %.2f°,   σ=7.0: %.2f°' % (tF(6.9), tF(7.0))),
    ('e', 'σ=%.4f ⇒ s_0=%.4f+j%.4f' % (B['sgF'], sF.real, sF.imag)),
    ('e', 'K=\\f{(%.3f)(%.3f)(%.3f)(%.3f)}{(%.3f)(%.3f)}=%.2f' % tuple(mF + [KB])),
    ('s', 'Nueva ecuación característica'),
    ('e', 's(s+7)(s+%.4f)(s+0.01)+%.2f(s+3)(s+%.5f)=0' % (PAD, KB, ZAT)),
    ('e', 's^4+%.4fs^3+%.3fs^2+%.3fs+%.3f=0' % tuple(DB[1:])),
    ('e', 'K_v=\\f{3(%.2f)(%.5f)}{7(%.4f)(0.01)}=%.3f' % (KB, ZAT, PAD, B['Kv']))])

qb = p1.real ** 2 + p1.imag ** 2; qa = q1.real ** 2 + q1.imag ** 2
box('VI · Paso 1. Ecuación característica final y todos los polos en lazo cerrado', 'VI1', [
    ('s', 'Diseño del libro'),
    ('e', '(s-p_1)(s-p_2)=s^2+%.4fs+%.4f' % (-2 * p1.real, qb)),
    ('e', '\\f{s^4+%.3fs^3+%.2fs^2+%.2fs+%.3f}{s^2+%.4fs+%.4f}=s^2+%.4fs+%.5f' % (tuple(DB[1:]) + (-2 * p1.real, qb, -(p3 + p4), p3 * p4))),
    ('e', 'p_3=%.4f,   p_4=%.5f' % (p3, p4)),
    ('s', 'Diseño ajustado'),
    ('e', 's^4+%.3fs^3+%.2fs^2+%.2fs+%.3f=0' % tuple(DA_[1:])),
    ('e', 'p_{1,2}=%.4f±j%.4f,   p_3=%.4f,   p_4=%.5f' % (q1.real, q1.imag, q3, q4))])

box('VI · Paso 2. Estabilidad y comparación con los polos candidatos', 'VI2', [
    ('e', '\\m{s^4&1&a_2&a_0\\\\s^3&a_3&a_1&0\\\\s^2&b_1&a_0&\\\\s^1&c_1&0&\\\\s^0&a_0&&}'),
    ('e', 'b_1=\\f{a_3a_2-a_1}{a_3},   c_1=\\f{b_1a_1-a_3a_0}{b_1}'),
    ('e', '\\t{Libro: }b_1=\\f{(%.3f)(%.3f)-%.3f}{%.3f}=%.3f' % (DB[1], DB[2], DB[3], DB[1], RB[0])),
    ('e', 'c_1=\\f{(%.3f)(%.3f)-(%.3f)(%.3f)}{%.3f}=%.3f' % (RB[0], DB[3], DB[1], DB[4], RB[0], RB[1])),
    ('e', '\\t{Ajustado: }b_1=%.3f,   c_1=%.3f' % RA),
    ('e', '\\t{primera columna positiva en los dos} ⇒ \\t{estables}'),
    ('n', 'Con K como variable se revisaron K de 10⁻⁴ a 10⁶: todas las raíces quedan con parte real negativa.'),
    ('e', 'Dif=\\f{\\d{p_1-s_d}}{\\d{s_d}}×100=%.1f \\t{%%}' % (abs(p1 - sd) / abs(sd) * 100))])

box('VI · Paso 3. ¿Es razonable la aproximación de polos dominantes?', 'VI3', [
    ('e', 'T(s)=\\f{K(s+3)(s+z_{at})}{(s-p_1)(s-p_2)(s-p_3)(s-p_4)},   r_i=\\f{N_T(p_i)}{p_iD_T\'(p_i)}'),
    ('e', '\\t{Libro: }r_3=\\f{%.2f(p_3+3)(p_3+%.4f)}{p_3∏_{j≠3}(p_3-p_j)}=%.4f' % (KB, ZAT, r3)),
    ('e', 'r_4=%.5f,   r_{1,2}=%.4f±j%.4f' % (r4, r1.real, r1.imag)),
    ('e', 'c(0)=1+2(%.4f)+(%.4f)+%.5f=%.4f ✓' % (r1.real, r3, r4, abs(1 + 2 * r1.real + r3 + r4))),
    ('n', 'p₃ + 3 = %.4f: el cero del adelanto sólo cancela en parte al polo; p₄ + z~{at} = %.5f: el atraso casi se cancela.' % (p3 + 3, p4 + ZAT)),
    ('e', '\\t{Ajustado: }r_3=%.4f,   r_4=%.5f,   r_{1,2}=%.4f±j%.4f' % (s3, s4, s1.real, s1.imag))])

box('VI · Paso 4. Error estacionario correspondiente (analítico)', 'VI4', [
    ('e', 'K_v=\\lim{s→0}{sK\\f{(s+3)(s+z_{at})}{s(s+7)(s+p_{ad})(s+0.01)}}=\\f{3Kz_{at}}{7p_{ad}(0.01)}'),
    ('e', '\\t{Libro: }K_v=%.3f,   e=\\f{1}{%.3f}=%.5f,   \\f{%.4f}{%.5f}=%.2f' % (B['Kv'], B['Kv'], 1 / B['Kv'], E0, 1 / B['Kv'], B['Kv'] / KV0)),
    ('e', '\\t{Ajustado: }K_v=%.3f,   e=%.5f,   ×%.2f' % (A['Kv'], 1 / A['Kv'], A['Kv'] / KV0))])

box('VII · Paso 5. Simulación de las entradas requeridas y desempeño del modelo completo', 'VII5', [
    ('e', 'c(t)=1+2e^{%.4ft}[%.4f cos(%.4ft)-%.4f \\t{sen}(%.4ft)]' % (p1.real, r1.real, p1.imag, r1.imag, p1.imag)),
    ('e', '     -%.4fe^{%.4ft}+%.5fe^{%.5ft}' % (-r3, p3, r4, p4)),
    ('e', '\\t{Libro: }t_p=%.4f,   \\%%OS=%.2f \\t{%%},   T_s=%.4f \\t{s}' % (IB['tp'], IB['os'], IB['ts'])),
    ('e', '\\t{Ajustado: }t_p=%.4f,   \\%%OS=%.2f \\t{%%},   T_s=%.4f \\t{s}' % (IA['tp'], IA['os'], IA['ts'])),
    ('e', 'T_{s,meta}=%.4f ⇒ %.4f>%.4f ✗,   %.4f<%.4f ✓' % (META, IB['ts'], META, IA['ts'], META)),
    ('n', 'Sin compensar el modelo completo da %.2f %% y T~{s} = %.4f s (stepinfo).' % (RI['os'], RI['ts']))])

a = r1 / p1; bq = r3 / p3; cq = r4 / p4
box('VII · Paso 6. Error estacionario simulado', 'VII6', [
    ('e', 'e(∞)=\\f{r_1}{p_1}+\\f{r_2}{p_2}+\\f{r_3}{p_3}+\\f{r_4}{p_4}   \\t{(con }r_0=1\\t{)}'),
    ('e', '\\t{Libro: }2(%.5f)+(%.5f)+(%.5f)=%.5f ✓' % (a.real, bq, cq, 2 * a.real + bq + cq)),
    ('e', 'e_u(130)=%.4f,   e_b(130)=%.5f,   e_a(130)=%.5f' % (RN['ref_e'], EB, EA)),
    ('e', 'τ_4=\\f{1}{\\d{p_4}}=%.2f \\t{s}' % (-1 / p4))])

items = [('s', 'Pruebas con T~{s} de diseño menor (mismo procedimiento IV · a–e)')]
for t, pad, zat, K, ts, os_ in TESTS:
    items.append(('e', 'T_{s,d}=%.3f:   p_{ad}=%.3f,   z_{at}=%.4f,   K=%.1f,   T_{s,sim}=%.3f' % (t, pad, zat, K, ts)))
sA = A['sF']
items += [('s', 'Diseño ajustado (T~{s,d} = %.2f s)' % A['Ts']),
          ('e', 'σ_d=\\f{4}{%.2f}=%.4f,   ω_d=%.4f' % (A['Ts'], A['sg'], A['wd'])),
          ('e', 'θ_p=%.2f°-%.2f°-%.2f°+180°=%.2f°' % (A['angz'], A['angs'][0], A['angs'][1], A['thp'])),
          ('e', 'p_{ad}=%.4f+\\f{%.4f}{tan(%.2f°)}=%.4f' % (A['sg'], A['wd'], A['thp'], A['pad'])),
          ('e', 'K_{ad}=%.3f,   K_{v,ad}=%.4f,   z_{at}=\\f{%.3f}{%.4f}(0.01)=%.5f' % (A['Kad'], A['Kvad'], KVM, A['Kvad'], A['zat'])),
          ('e', 's_0=%.4f+j%.4f,   K=%.2f' % (sA.real, sA.imag, KA)),
          ('e', 'T_s=%.3f \\t{s},   \\%%OS=%.2f \\t{%%},   K_v=%.3f,   e=%.5f' % (IA['ts'], IA['os'], A['Kv'], EA))]
box('VII · Paso 7. Ajuste del diseño y repetición de la verificación', 'VII7', items)
