# Contenido de la Práctica 6 (PID, Nise ejemplo 9.5) con el formato de la P1–P5 (v45/v47/v56/v57).
import math, cmath
import numpy as np
import build
from build import *
import num6
RN = num6.R


def f(x, d=4):
    return ('%.' + str(d) + 'f') % x


def code(src, **k):
    for a, b in k.items():
        src = src.replace('@' + a + '@', b)
    assert '@' not in src, src
    return src


Z = RN['zeta']; TH = RN['th']; TN = RN['tan']
SG = RN['sig0']; s0 = RN['s0']; WD = s0.imag; K0 = RN['K0']; WN = RN['wn0']
KP0 = RN['Kp0']; E0 = RN['e0']; RI = RN['ref_info']; YF0 = RN['ref_yf']
OS2 = math.exp(-Z * math.pi / math.sqrt(1 - Z * Z)) * 100
TS2 = 4 / SG; TP2 = math.pi / WD
TRn = 1.768 * Z ** 3 - 0.417 * Z ** 2 + 1.039 * Z + 1; TR2 = TRn / WN
k1 = sorted(RN['K1poles'])
SB = RN['sb']; KB_ = RN['Kb']
rp = RN['ref_poles']; rr = RN['ref_r']
iR3 = [i for i in range(3) if abs(rp[i].imag) < 1e-9][0]; iR1 = [i for i in range(3) if rp[i].imag > 1e-9][0]
P3R = rp[iR3].real; r3R = rr[iR3].real; r1R = rr[iR1]
TPD = RN['Tpd']; WDD = RN['wdd']; SD = RN['sgd']; sd = RN['sd']; WND = abs(sd)
ANG = RN['angs']; ANG8 = RN['ang8']; ANGG = RN['angG']; THZ = RN['thz']; ZC = RN['zc']; KPD = RN['Kpd']
TANZ = math.tan(math.radians(THZ))
MG = [abs(sd + 3), abs(sd + 6), abs(sd + 10), abs(sd + 8), abs(sd + ZC)]
IPD = RN['pd_info']; EPD = RN['pd_e']; KPPD = RN['Kp_pd']
DA = RN['dip_ang']; DM = RN['dip_mag']
SF = RN['sigF']; sF = RN['sF']; WF = sF.imag; KF = RN['KF']; K1 = RN['K1']; K2 = RN['K2']; K3 = RN['K3']
FP = RN['F_poles']; FR = RN['F_r']
iF1 = [i for i in range(4) if FP[i].imag > 1e-9][0]; reals = sorted([i for i in range(4) if abs(FP[i].imag) < 1e-9], key=lambda i: FP[i].real)
p1 = FP[iF1]; r1 = FR[iF1]; p3 = FP[reals[0]].real; r3 = FR[reals[0]].real; p4 = FP[reals[1]].real; r4 = FR[reals[1]].real
IF = RN['F_info']; KV = RN['Kv']; DENF = RN['F_den']; A, B1, C1 = RN['routh']
N3 = np.polymul(np.polymul([1, 8], [1, ZC]), [1, 0.5])
TSTAIL = math.log(abs(r4) / 0.02) / abs(p4)
TPMETA = TP2 * 2 / 3
cs3 = lambda z: '%s%sj%s' % (f(z.real, 3), '+' if z.imag >= 0 else '-', f(abs(z.imag), 3))

out = []
add = out.extend
a1 = out.append

# =============== portada ===============
add(cover('Práctica 6: Controlador PID'))
a1(resumen('En esta práctica se analizó el sistema tipo 0 con realimentación unitaria G(s) = K(s + 8)/[(s + 3)(s + 6)(s + 10)] (Nise, ejemplo 9.5), '
           'que opera con 20 %% de sobrepaso (ζ = %.3f), y se le diseñó un controlador PID para reducir su tiempo pico a dos tercios y obtener error '
           'cero ante escalón. Con el lugar geométrico de las raíces (LGDR) se obtuvo la referencia K = %.1f (s~{0} = −%.3f ± j%.3f), con T~{p} = %.3f s '
           'y e(∞) = %.4f. Primero se diseñó la parte PD: en s~{d} = −%.3f ± j%.3f faltan %.2f° que aporta un cero en −%.2f (K = %.3f). Después se '
           'agregó la parte PI con el cero en −0.5, que casi no mueve el LGDR, y se volvió a buscar el punto sobre la recta de ζ: K = %.3f, es decir, '
           'K~{1} = %.1f, K~{2} = %.1f y K~{3} = %.2f. La simulación del modelo completo en MATLAB dio T~{p} = %.3f s, %.2f %% de sobrepaso y error cero '
           'al escalón; la cola lenta del polo −%.3f (casi cancelado con el cero del PI) alarga el tiempo de asentamiento a %.2f s.'
           % (Z, K0, SG, WD, TP2, E0, SD, WDD, THZ, ZC, KPD, KF, K1, K2, K3, IF['tp'], IF['os'], -p4, IF['ts'])))
a1(keywords('Lugar geométrico de las raíces, Controlador PID, Condición de ángulo, Error en estado estable, MATLAB'))
out.append('#SECT1')

# =============== I ===============
a1(h1('I.', 'Identificación y referencia del ejercicio'))
a1(caption('Tabla 1: Identificación de la práctica'))
add(table([1500, 3300], ['Dato', 'Valor'], [['Práctica', '6 · Controlador PID'], ['Ejercicio', 'Ejemplo 9.5, p. 528'],
                                            ['Libro', 'Nise, Sistemas de control para ingeniería (CECSA, 2006)'],
                                            ['Capítulo', '9. Diseño por medio del lugar geométrico de las raíces']], boldfirst=True))
a1(labeled('Objetivo.', 'Diseñar un controlador PID que conserve el 20 % de sobrepaso, reduzca el tiempo pico a dos tercios del sistema sin compensar '
           'y dé error cero ante un escalón, y comprobar con el modelo completo en MATLAB si se cumplen las especificaciones.'))
a1(labeled('Introducción.', 'El PID junta dos compensadores: la parte PD (un cero) mejora la respuesta transitoria llevando los polos dominantes a un '
           'punto más rápido sobre la misma recta de ζ, y la parte PI (un polo en el origen y un cero cercano) vuelve al sistema tipo 1 para que el '
           'error al escalón sea cero, casi sin mover el LGDR. Se diseña primero el PD con las condiciones de ángulo y magnitud, se agrega el PI y se '
           'vuelve a buscar el punto de diseño con todo el controlador. El resultado se escribe como G~{c}(s) = K~{1} + K~{2}/s + K~{3}s.', g=True))

# =============== II ===============
a1(h1('II.', 'Planteamiento, modelo, diagrama y especificaciones'))
a1(h2('1. Planteamiento'))
a1(problem('**Problema:** Dado el sistema de la figura 9.31, diseñar un controlador PID para que el sistema pueda operar con un tiempo pico que es '
           'dos tercios del tiempo pico de un sistema no compensado a 20% de sobrepaso, y con error en estado estable cero para una entrada escalón.'))
a1(para('La figura 9.31 del libro («Sistema no compensado de control realimentado para el ejemplo 9.5») es el lazo con ganancia K y la planta G(s); '
        'el diagrama con el controlador está en el punto 3 (Figura 1).'))
a1(h2('2. Modelo'))
a1(eq('G(s)=\\f{K(s+8)}{(s+3)(s+6)(s+10)}'))
a1(eq('G_{c}(s)=\\f{(s+z_{PD})(s+z_{PI})}{s}=K_1+\\f{K_2}{s}+K_3s'))
a1(para('Realimentación unitaria negativa; el controlador va en cascada con la planta. El PD aporta el cero $s+z_{PD}$ y el PI el polo en el origen y el '
        'cero $s+z_{PI}$, con $z_{PI}=0.5$ como en el libro.'))
a1(h2('3. Diagrama de bloques'))
SL = code('''m = 'P6_PID';               % nombre del modelo
if bdIsLoaded(m), close_system(m,0); end
K1 = @K1@;  K2 = @K2@;  K3 = @K3@;   % V
new_system(m); open_system(m)
L = 'simulink/';
add_block([L 'Sources/Step'],[m '/Step'], ...
  'Time','0','After','1')
add_block([L 'Math Operations/Sum'], ...
  [m '/Sum'],'Inputs','|+-')
add_block([L 'Continuous/PID Controller'], ...
  [m '/PID'],'P','K1','I','K2','D','K3', ...
  'UseFilter','off')       % K1 + K2/s + K3 s
add_block([L 'Continuous/Transfer Fcn'], ...
  [m '/G'],'Numerator','[1 8]', ...  % planta
  'Denominator','[1 19 108 180]')
add_block([L 'Sinks/Scope'],[m '/Scope'])
add_line(m,'Step/1','Sum/1')
add_line(m,'Sum/1','PID/1')
add_line(m,'PID/1','G/1')
add_line(m,'G/1','Scope/1')
add_line(m,'G/1','Sum/2')    % realimentación
Simulink.BlockDiagram.arrangeSystem(m)''', K1=f(K1, 2), K2=f(K2, 2), K3=f(K3, 4))
add(figbox('Diagrama de bloques del sistema en lazo cerrado (Simulink): Step → Sum (+ −) → PID Controller (P = K~{1}, I = K~{2}, D = K~{3}, sin filtro) '
           '→ Transfer Fcn de la planta (s + 8)/[(s + 3)(s + 6)(s + 10)] → Scope.', '% Figura 1 · Modelo de Simulink con el PID\n' + SL))
a1(figcap('Figura 1: Diagrama de bloques del sistema en lazo cerrado (Simulink)'))
a1(h2('4. Especificaciones'))
a1(caption('Tabla 2: Especificaciones de diseño'))
add(table([1500, 1500, 1800], ['Especificación', 'Meta', 'Cómo se verifica'],
          [['Sobrepaso', '20 %% (ζ = %.3f)' % Z, 'Misma recta de ζ; %OS simulado'],
           ['Tiempo pico', '2/3 del $T_{p}$ sin compensar', '$ω_{d}$ 1.5 veces mayor; $T_{p}$ simulado'],
           ['Error al escalón', '$e(∞)=0$', 'Tipo 1 (PI); simulación'],
           ['Estabilidad', 'Estable', 'Routh y polos del modelo completo'],
           ['Validez de la aproximación', 'Juzgar', 'Residuos de los modos']]))

# =============== III ===============
a1(h1('III.', 'Análisis inicial y desempeño de referencia'))
a1(h2link('Paso 1. Ganancia de referencia (no asumir que es uno)', 'III1'))
a1(para('El enunciado da la ganancia de forma indirecta: el sistema opera con 20 %% de sobrepaso, es decir, con $ζ=%.4f$. La ganancia de referencia es '
        'la que coloca los polos dominantes sobre esa recta; se busca con la condición de ángulo (cero en $-8$, polos en $-3$, $-6$ y $-10$) y se '
        'calcula con la de magnitud:' % Z))
a1(eq('ζ=\\f{-\\t{ln}(\\%OS/100)}{\\r{π^2+\\t{ln}^2(\\%OS/100)}},   θ=cos^{-1}ζ'))
a1(eq('∠(s_0+8)-∑∠(s_0-p_i)=±180°'))
a1(eq('K=\\f{∏\\d{s_0-p_i}}{\\d{s_0+8}}'))
a1(resultado())
a1(eq('ζ=%.4f,   θ=%.2f°' % (Z, TH)))
a1(eq('s_0=-%.4f+j%.4f' % (SG, WD)))
a1(eq('K_{ref}=%.2f' % K0))
a1(para('Si se asumiera $K=1$, los polos en lazo cerrado serían $%.3f$, $%.3f$ y $%.3f$: todos reales, sin sobrepaso, es decir, otro sistema y no el '
        'del enunciado.' % (k1[2], k1[1], k1[0])))

a1(h2link('Paso 2. Polos, ceros, tipo y ecuación característica', 'III2'))
a1(caption('Tabla 3: Polos, ceros y tipo del sistema sin compensar'))
add(table([2259, 1412, 1129], ['Polos de lazo abierto', 'Ceros', 'Tipo'], [['$-3, -6, -10$  ($n=3$)', '$-8$  ($m=1$)', '0']]))
a1(para('Ecuación característica $1+KG(s)=0$:'))
a1(eq('s^3+19s^2+(108+K)s+(180+8K)=0'))
a1(resultado())
a1(eq('n=3,   m=1 ⇒ 3 \\t{ramas y }2 \\t{asíntotas}'))
a1(eq('\\t{LGDR en eje real: }[-6, -3] ∪ [-10, -8]'))
a1(eq('σ_a=-5.5,   θ_a=90°, 270°'))
a1(eq('σ_b=%.4f,   K_b=%.3f' % (SB, KB_)))

a1(h2link('Paso 3. Estabilidad y rango de ganancia estable', 'III3'))
a1(caption('Tabla 4: Arreglo de Routh del sistema sin compensar'))
add(table([1200, 1400, 1200, 1000], ['Fila', 'Col. 1', 'Col. 2', 'Col. 3'],
          [['s^^{3}', '1', '$108+K$', '0'], ['s^^{2}', '19', '$180+8K$', '0'], ['s^^{1}', '$\\f{1872+11K}{19}$', '0', '0'], ['s^^{0}', '$180+8K$', '', '']]))
a1(eq('\\f{1872+11K}{19}>0  \\t{y}  180+8K>0'))
a1(resultado())
a1(eq('0<K<∞'))
a1(eq('\\t{No hay }K_{crít}\\t{: el LGDR no cruza el eje }jω'))
a1(para('Con $K_{ref}=%.2f$ la fila $s^{1}$ vale $(1872+11·%.2f)/19=%.2f>0$: el sistema de referencia es estable.' % (K0, K0, (1872 + 11 * K0) / 19)))

a1(h2link('Paso 4. Polos en lazo cerrado con la ganancia de referencia', 'III4'))
a1(para('Con $K_{ref}=%.2f$, la ecuación característica del Paso 2 queda:' % K0))
a1(eq('s^3+19s^2+%.2fs+%.2f=0' % (108 + K0, 180 + 8 * K0)))
a1(caption('Tabla 5: Polos en lazo cerrado de referencia'))
add(table([800, 1800, 2200], ['Polo', 'Valor', 'Observación'],
          [['p~{1}', '$-%.3f+j%.3f$' % (SG, WD), 'Par dominante sobre la recta de ζ = %.3f' % Z],
           ['p~{2}', '$-%.3f-j%.3f$' % (SG, WD), 'Conjugado de $p_1$'],
           ['p~{3}', '$%.3f$' % P3R, 'Real, a %.3f del cero en −8: casi cancelado (residuo %.4f)' % (-8 - P3R, r3R)]]))
a1(resultado())
a1(eq('p_{1,2}=-%.3f±j%.3f,   p_3=%.3f' % (SG, WD, P3R)))
a1(para('El tercer polo está apenas a $%.2fσ$ del eje, pero casi encima del cero en $-8$: su residuo es sólo %.1f %% del dominante, así que la '
        'aproximación de segundo orden es razonable.' % (-P3R / SG, abs(r3R) / abs(r1R) * 100)))

a1(h2link('Paso 5. Respuesta transitoria y error estacionario', 'III5'))
a1(para('Del par $p_{1,2}=-σ±jω_d$ del Paso 4 se obtienen los parámetros de segundo orden; con ellos se estiman el transitorio y el error al escalón:'))
a1(eq('ω_n=\\r{σ^2+ω_d^2},   ζ=\\f{σ}{ω_n}'))
a1(eq('\\%OS=e^{-ζπ/\\r{1-ζ^2}}×100'))
a1(eq('T_s=\\f{4}{σ},   T_p=\\f{π}{ω_d}'))
a1(eq('T_r≈\\f{1.768ζ^3-0.417ζ^2+1.039ζ+1}{ω_n}'))
a1(eq('K_p=\\lim{s→0}{KG(s)},   e_{esc}(∞)=\\f{1}{1+K_p}'))
a1(resultado())
a1(eq('σ=%.4f,   ω_d=%.4f,   ω_n=%.4f  \\t{rad/s}' % (SG, WD, WN)))
a1(eq('ζ=%.4f,  \\%%OS=%.1f \\t{%%}' % (Z, OS2)))
a1(eq('T_s=%.3f  \\t{s},   T_p=%.4f  \\t{s},   T_r≈%.3f  \\t{s}' % (TS2, TP2, TR2)))
a1(eq('K_p=%.3f,   e_{esc}(∞)=%.4f' % (KP0, E0)))
a1(h2('Evidencia de la etapa'))
add(figbox('LGDR inicial (sistema sin compensar) con la recta de ζ y el punto s~{0}', code('''% Figura 2 · LGDR sin compensar y recta de zeta
s = tf('s');
G = (s+8)/((s+3)*(s+6)*(s+10));   % planta
zeta = -log(0.20)/sqrt(pi^2+log(0.20)^2);   % 0.4559
s0 = -@SG@ + @WD@i;            % III · Paso 1
figure
rlocus(G); grid on               % LGDR y rejilla
hold on
th = acos(zeta); r = [0 20];     % recta de zeta
plot(-r*cos(th), r*sin(th),'m--', ...
     -r*cos(th),-r*sin(th),'m--')
plot(real(s0)*[1 1],imag(s0)*[1 -1],'r*')
axis([-14 2 -16 16])
title('LGDR sin compensar (\\zeta = 0.456)')
hold off''', SG=f(SG), WD=f(WD))))
a1(figcap('Figura 2: LGDR inicial (sistema sin compensar) con la recta de ζ'))
add(figbox('Respuesta temporal de referencia al escalón (y salida de stepinfo)', code('''% Figura 3 · Respuesta de referencia
s = tf('s');
G = (s+8)/((s+3)*(s+6)*(s+10));
K = @K0@;                  % III · Paso 1
Tu = feedback(K*G, 1);      % lazo cerrado
figure
step(Tu, 1.5); grid on
title('Respuesta al escalón sin compensar')
info = stepinfo(Tu)         % %OS, Ts, Tp, Tr
p = pole(Tu)
e_u = 1 - dcgain(Tu)        % error al escalón''', K0=f(K0, 2))))
a1(figcap('Figura 3: Respuesta temporal de referencia al escalón'))
a1(caption('Tabla 6: Desempeño de referencia'))
add(table([1600, 1600, 1600], ['Magnitud', 'Analítico (2.º orden)', 'Simulación (MATLAB)'],
          [['%OS (%)', f(OS2, 1), f(RI['os'], 2)], ['$T_{s}$ (s)', f(TS2, 3), f(RI['ts'], 3)], ['$T_{p}$ (s)', f(TP2, 3), f(RI['tp'], 3)],
           ['$T_{r}$ (s)', f(TR2, 3), f(RI['tr'], 3)], ['$K_{p}$', f(KP0, 3), f(KP0, 3)], ['$e_{esc}(∞)$', f(E0, 4), f(1 - YF0, 4)]]))
a1(para('La simulación se hizo con $K=%.2f$ y el sobrepaso se mide respecto al valor final $c(∞)=%.4f$ (tipo 0). Las diferencias son pequeñas: el '
        'tercer polo $%.3f$ casi se cancela con el cero en $-8$ (residuo $%.4f$) y sólo adelanta un poco la respuesta (%.2f %%, $T_{p}=%.3f$ s). '
        'El libro reporta 20 %%, $T_{p}=0.297$ s, $T_{s}=0.739$ s y $e(∞)=0.156$.' % (K0, YF0, P3R, r3R, RI['os'], RI['tp'])))

# =============== IV ===============
a1(h1('IV.', 'Desarrollo y justificación del diseño'))
a1(gray('El diseño se hace en dos partes, como en el libro. Primero el PD: para reducir T~{p} a dos tercios con el mismo sobrepaso, los polos dominantes '
        'deben quedarse en la recta de ζ = %.3f con ω~{d} 1.5 veces mayor; ese punto no está en el LGDR original, así que se calcula el ángulo que '
        'falta y se pone el cero que lo aporta. Después el PI: un polo en el origen y un cero en −0.5 hacen al sistema tipo 1 (error cero al '
        'escalón) moviendo muy poco el LGDR; por eso se vuelve a buscar el punto sobre la recta y su K con todo el controlador.' % Z))
a1(h2link('a) Punto de diseño', 'IVa'))
a1(eq('T_{p,d}=\\f{2}{3}T_p,   ω_d=\\f{π}{T_{p,d}},   σ_d=\\f{ω_d}{tanθ}'))
a1(resultado())
a1(eq('T_{p,d}=%.4f  \\t{s},   ω_d=%.4f' % (TPD, WDD)))
a1(eq('s_d=-%.4f+j%.4f' % (SD, WDD)))
a1(para('El punto queda sobre la misma recta de ζ, con $ω_{n}=%.3f$ rad/s.' % WND))
a1(h2link('b) Ángulo faltante y cero del PD', 'IVb'))
a1(eq('∠G(s_d)=∠(s_d+8)-[∠(s_d+3)+∠(s_d+6)+∠(s_d+10)]'))
a1(eq('θ_z=-180°-∠G(s_d),   z_{PD}=σ_d+\\f{ω_d}{tanθ_z}'))
a1(resultado())
a1(eq('∠G(s_d)=%.2f°-(%.2f°+%.2f°+%.2f°)=%.2f°' % (ANG8, ANG[0], ANG[1], ANG[2], ANGG)))
a1(eq('θ_z=%.2f°' % THZ))
a1(eq('z_{PD}=%.2f  \\t{(libro: 55.92)}' % ZC))
a1(para('El ángulo que falta es pequeño, así que el cero queda lejos, en $-%.2f$.' % ZC))
a1(h2link('c) Ganancia y verificación del PD', 'IVc'))
a1(eq('K_{PD}=\\f{\\d{s_d+3}\\d{s_d+6}\\d{s_d+10}}{\\d{s_d+8}\\d{s_d+z_{PD}}}'))
a1(resultado())
a1(eq('K_{PD}=%.3f  \\t{(libro: 5.34)}' % KPD))
a1(eq('\\t{Con PD: }\\%%OS=%.2f \\t{%%},   t_p=%.3f  \\t{s}' % (IPD['os'], IPD['tp'])))
a1(eq('e(∞)=%.4f' % EPD))
a1(para('El PD ya cumple el tiempo pico, pero el error al escalón sigue (sólo bajó de $%.4f$ a $%.4f$): falta la parte PI.' % (E0, EPD)))
a1(h2link('d) Parte PI (cero en −0.5)', 'IVd'))
a1(eq('G_{PI}(s)=\\f{s+0.5}{s}'))
a1(eq('∠G_{PI}(s_d)=∠(s_d+0.5)-∠s_d,   \\d{G_{PI}(s_d)}=\\f{\\d{s_d+0.5}}{\\d{s_d}}'))
a1(resultado())
a1(eq('∠G_{PI}(s_d)=%.2f°,   \\d{G_{PI}(s_d)}=%.4f' % (DA, DM)))
a1(para('El PI casi no cambia el ángulo ni la magnitud en el punto de diseño: el LGDR apenas se mueve y el sistema pasa a ser tipo 1.'))
a1(h2link('e) Re‑búsqueda con el PID y nueva ecuación', 'IVe'))
a1(eq('1+K\\f{(s+8)(s+z_{PD})(s+0.5)}{s(s+3)(s+6)(s+10)}=0'))
a1(resultado())
a1(eq('s_0=-%.4f+j%.4f' % (SF, WF)))
a1(eq('K=%.4f  \\t{(libro: 4.6)}' % KF))
a1(eq('s^4+%.2fs^3+%.2fs^2+%.2fs+%.2f=0' % tuple(DENF[1:])))
a1(para('La condición de ángulo con el PID completo da un punto un poco más cerca del eje que $s_{d}$ (el PI resta $%.2f°$). Con K como variable, el '
        'arreglo de Routh y un barrido de K muestran que el sistema es estable para toda $K>0$.' % -DA))
add(figbox('LGDR sin compensar, con PD y con PID sobre la recta ζ = 0.456', code('''% Figura 4 · LGDR: sin compensar, PD y PID
s = tf('s');
G   = (s+8)/((s+3)*(s+6)*(s+10));
Gpd = s + @ZC@;                  % IV · b)
Gpi = (s + 0.5)/s;                 % IV · d)
zeta = -log(0.20)/sqrt(pi^2+log(0.20)^2);
th = acos(zeta); r = [0 25];
figure
rlocus(G, Gpd*G, Gpd*Gpi*G); grid on
hold on
plot(-r*cos(th), r*sin(th),'m--', -r*cos(th),-r*sin(th),'m--')
plot(-@SF@*[1 1], @WF@*[1 -1],'r*')   % IV · e)
axis([-20 2 -22 22])
legend('sin compensar','PD','PID')
title('LGDR con el controlador PID')
hold off''', ZC=f(ZC), SF=f(SF), WF=f(WF))))
a1(figcap('Figura 4: LGDR sin compensar, con PD y con PID sobre la recta ζ = 0.456'))

# =============== V ===============
a1(h1('V.', 'Controlador final y parámetros'))
a1(eq('G_c(s)=%.4f\\f{(s+%.2f)(s+0.5)}{s}' % (KF, ZC)))
a1(eq('G_c(s)=K_1+\\f{K_2}{s}+K_3s'))
a1(eq('K_1=K(z_{PD}+0.5),  K_2=0.5Kz_{PD},  K_3=K'))
a1(caption('Tabla 7: Parámetros del controlador final'))
add(table([1900, 1900, 1000], ['Parámetro', 'Obtenido', 'Libro'],
          [['Cero del PD $z_{PD}$', f(ZC, 2), '55.92'], ['Cero del PI $z_{PI}$', '0.5', '0.5'], ['K', f(KF, 3), '4.6'],
           ['$K_{1}$ (proporcional)', f(K1, 1), '259.5'], ['$K_{2}$ (integral)', f(K2, 1), '128.6'], ['$K_{3}$ (derivativo)', f(K3, 3), '4.6'],
           ['Punto $s_{0}$', '$-%.3f±j%.3f$' % (SF, WF), '—']]))
a1(para('Los ceros salen de las condiciones de ángulo (IV · b) y de la elección del PI (IV · d); K de la condición de magnitud en el punto re‑buscado '
        '(IV · e). En Simulink va un solo bloque PID Controller con P = K~{1}, I = K~{2}, D = K~{3} y sin filtro (Figura 1). La verificación (VI y VII) '
        'no requirió ajuste.'))

# =============== VI ===============
a1(h1('VI.', 'Comprobación analítica'))
a1(h2link('Paso 1. Ecuación característica final y todos los polos en lazo cerrado', 'VI1'))
a1(eq('s(s+3)(s+6)(s+10)+K(s+8)(s+z_{PD})(s+0.5)=0'))
a1(eq('K=%.4f:' % KF))
a1(eq('s^4+%.2fs^3+%.2fs^2+%.2fs+%.2f=0' % tuple(DENF[1:])))
a1(caption('Tabla 8: Polos en lazo cerrado del sistema compensado'))
add(table([800, 1800, 2200], ['Polo', 'Valor', 'Observación'],
          [['p~{1}', '$%s$' % cs3(p1), 'Dominante (= $s_{0}$ de IV · e)'], ['p~{2}', '$%s$' % cs3(p1.conjugate()), 'Dominante (conjugado)'],
           ['p~{3}', '$%.3f$' % p3, 'Junto al cero en −8 (casi cancelado)'], ['p~{4}', '$%.3f$' % p4, 'Junto al cero del PI en −0.5: modo lento']]))
a1(resultado())
a1(eq('p_{1,2}=%.3f±j%.3f,   p_3=%.3f,   p_4=%.3f' % (p1.real, p1.imag, p3, p4)))
a1(para('Todas las raíces tienen parte real negativa. No se descarta ningún modo: el PI agrega un polo, así que el sistema es de cuarto orden.'))
a1(h2link('Paso 2. Estabilidad y comparación con los polos candidatos', 'VI2'))
a1(caption('Tabla 9: Arreglo de Routh del sistema compensado (K = %.3f)' % KF))
add(table([1100, 1300, 1300, 1100], ['Fila', 'Col. 1', 'Col. 2', 'Col. 3'],
          [['s^^{4}', '1', f(A[2], 2), f(A[4], 2)], ['s^^{3}', f(A[1], 2), f(A[3], 2), '0'], ['s^^{2}', f(B1, 2), f(A[4], 2), '0'],
           ['s^^{1}', f(C1, 2), '0', '0'], ['s^^{0}', f(A[4], 2), '', '']]))
a1(para('La primera columna es toda positiva: no hay cambios de signo y el sistema es estable. Un barrido de K (de 10⁻⁴ a 10⁶) da siempre todas las '
        'raíces en el semiplano izquierdo: el rango estable es $0<K<∞$.'))
a1(caption('Tabla 10: Polos candidatos (diseño) contra polos obtenidos'))
difPD = abs(p1 - sd) / abs(sd) * 100; difF = abs(p1 - sF) / abs(sF) * 100
add(table([1200, 1400, 1400, 800], ['Polos', 'Candidato', 'Obtenido', 'Dif. (%)'],
          [['Par (punto del PD)', '$-%.3f$\n$±j%.3f$\n(IV · a)' % (SD, WDD), '$%.3f$\n$±j%.3f$' % (p1.real, p1.imag), f(difPD, 1)],
           ['Par (re‑búsqueda)', '$-%.3f$\n$±j%.3f$\n(IV · e)' % (SF, WF), '$%.3f$\n$±j%.3f$' % (p1.real, p1.imag), f(difF, 1)]]))
a1(resultado())
a1(eq('0<K<∞   \\t{(no hay }K_{crít}\\t{)}'))
a1(eq('Dif_{s_0}=%.1f \\t{%%},   Dif_{s_d}=%.1f \\t{%%}' % (difF, difPD)))
a1(para('Si se hubiera usado el punto del PD con el PID, los polos quedarían %.1f %% lejos: por eso se re‑busca el punto y K con el controlador completo.' % difPD))
a1(h2link('Paso 3. ¿Es razonable la aproximación de polos dominantes?', 'VI3'))
a1(caption('Tabla 11: Modos del sistema y residuos al escalón'))
add(table([1550, 1850, 1400], ['Polo', 'Residuo', 'Lectura'],
          [['$%.3f$\n$±j%.3f$' % (p1.real, p1.imag), '$%.4f$\n$±j%.4f$\n(|r| = %.4f c/u)' % (r1.real, r1.imag, abs(r1)), 'Dominante'],
           ['$%.3f$' % p3, '$%.4f$' % r3, 'Cancelado con el cero −8 (%.1f %%)' % (abs(r3) / abs(r1) * 100)],
           ['$%.3f$' % p4, '$%.4f$' % r4, 'Casi cancelado con −0.5 (%.1f %%); lento' % (abs(r4) / abs(r1) * 100)],
           ['0 (escalón)', '1.000', 'Valor final c(∞)']]))
a1(blue('✎ Residuos en MATLAB: [num,den] = tfdata(Tc,\'v\'); [r,pp] = residue(num, conv(den,[1 0])).'))
a1(eq('r_i=\\f{N_T(p_i)}{p_iD_T\'(p_i)}'))
a1(resultado())
a1(eq('\\d{r_{1,2}}=%.4f,   r_3=%.4f,   r_4=%.4f' % (abs(r1), r3, r4)))
a1(para('Conclusión: el par dominante manda el pico (los otros dos modos están casi cancelados por sus ceros), así que $T_{p}$ y el sobrepaso siguen '
        'la aproximación de segundo orden. Pero el modo del PI ($p_{4}=%.3f$, residuo negativo $%.4f$) es muy lento ($τ=%.2f$ s): no cambia el pico, '
        'pero hace que la respuesta llegue a 1 despacio y alarga el tiempo de asentamiento. Se verifica con el modelo completo.' % (p4, r4, -1 / p4)))
a1(h2link('Paso 4. Error estacionario correspondiente (analítico)', 'VI4'))
a1(eq('K_p=\\lim{s→0}{KG_c(s)G(s)}=∞'))
a1(eq('K_v=\\lim{s→0}{sKG_c(s)G(s)}=\\f{K(8)(z_{PD})(0.5)}{180}'))
a1(eq('e_{esc}(∞)=\\f{1}{1+K_p},   e_{rampa}(∞)=\\f{1}{K_v}'))
a1(resultado())
a1(eq('e_{esc}(∞)=0,   K_v=%.3f,   e_{rampa}(∞)=%.4f' % (KV, 1 / KV)))
a1(para('Con el polo del PI en el origen el sistema es tipo 1: el error al escalón es cero, como pide el problema (antes $%.4f$).' % E0))
a1(advert())

# =============== VII ===============
a1(h1('VII.', 'Comprobación en MATLAB'))
a1(italic('Pasos 5, 6 y 7 de la verificación del sistema completo, con el modelo completo (sin simplificar polos).'))
a1(h2link('Paso 5. Simulación de las entradas requeridas y desempeño del modelo completo', 'VII5'))
a1(para('Entrada simulada: escalón unitario (tiempo pico, sobrepaso y error, que es lo que se pide), sin compensar, sólo con el PD y con el PID.'))
SIMC = '''s = tf('s');
G   = (s+8)/((s+3)*(s+6)*(s+10));
Gpd = s + @ZC@;
Gpi = (s + 0.5)/s;
Tu  = feedback(@K0@*G, 1);              % sin compensar
Tpd = feedback(@KPD@*Gpd*G, 1);         % sólo PD
Tc  = feedback(@KF@*Gpd*Gpi*G, 1);     % PID'''
SIMK = dict(ZC=f(ZC), K0=f(K0, 2), KPD=f(KPD, 3), KF=f(KF, 4))
add(figbox('Respuesta al escalón: sin compensar, sólo PD y PID', code('% Figura 5 · Escalón: sin compensar, PD y PID\n' + SIMC + '''
figure
step(Tu, Tpd, Tc, 3); grid on
legend('sin compensar','PD','PID')
title('Respuesta al escalón unitario')''', **SIMK)))
a1(figcap('Figura 5: Respuesta al escalón sin compensar, con PD y con PID'))
add(figbox('Salida de pole(Tc), stepinfo y residuos en la Command Window (captura)', code('% Figura 6 · Command Window\n' + SIMC + '''
pole(Tc)
stepinfo(Tu)
stepinfo(Tc)
[num,den] = tfdata(Tc,'v');
[r,pp] = residue(num, conv(den,[1 0]))
e_c = 1 - dcgain(Tc)''', **SIMK)))
a1(figcap('Figura 6: Salida de pole(Tc), stepinfo y residuos en la Command Window (captura)'))
a1(caption('Tabla 12: Especificaciones contra desempeño simulado'))
add(table([1350, 1150, 1250, 1050], ['Especificación', 'Meta', 'Obtenido (PID)', '¿Cumple?'],
          [['%OS', '≤ 20 %', '%.2f %%' % IF['os'], 'Sí (más amortiguado)'],
           ['$T_{p}$', '≤ 2/3 · %.3f = %.3f s' % (TP2, TPMETA), '%.3f s' % IF['tp'], 'Sí'],
           ['$e_{esc}(∞)$', '0', '0', 'Sí'],
           ['Estabilidad', 'Estable', 'Polos con parte real < 0', 'Sí'],
           ['$T_{s}$ (dato)', '—', '%.3f s' % IF['ts'], 'No se pide (cola del PI)']]))
a1(eq('\\%OS=\\f{c_{máx}-c(∞)}{c(∞)}×100'))
a1(resultado())
a1(eq('t_p=%.3f  \\t{s},   c_{máx}=%.4f,   c(∞)=1' % (IF['tp'], IF['pk'])))
a1(eq('\\%%OS_{sim}=%.2f \\t{%%},   T_s=%.3f  \\t{s}' % (IF['os'], IF['ts'])))
a1(eq('\\f{T_{p,c}}{T_{p,u}}=\\f{%.3f}{%.3f}=%.3f' % (IF['tp'], RI['tp'], IF['tp'] / RI['tp'])))
a1(para('El PID cumple las tres especificaciones. El sobrepaso quedó en %.2f %%, menor que 20 %%: el modo lento del PI tiene residuo negativo y resta '
        'al pico. Sólo con el PD el sobrepaso era %.2f %% y el error %.4f.' % (IF['os'], IPD['os'], EPD)))
a1(h2link('Paso 6. Error estacionario simulado', 'VII6'))
add(figbox('Error ante escalón e(t) = 1 − c(t): sin compensar, sólo PD y PID', code('% Figura 7 · Error al escalón\n' + SIMC + '''
t = 0:0.001:12;
eu = 1 - step(Tu,t); epd = 1 - step(Tpd,t); ec = 1 - step(Tc,t);
figure
plot(t, eu, t, epd, t, ec); grid on
xlim([0 12]); ylim([-0.2 1])
xlabel('t (s)'); ylabel('e(t) = 1 - c(t)')
legend('sin compensar','PD','PID')
title('Error ante escalón unitario')
e_final = [eu(end) epd(end) ec(end)]''', **SIMK)))
a1(figcap('Figura 7: Error ante escalón e(t) = 1 − c(t): sin compensar, sólo PD y PID'))
a1(eq('e_{sim}(∞)=\\lim{t→∞}{[1-c(t)]}'))
a1(resultado())
a1(eq('e_u(12)=%.4f,   e_{PD}(12)=%.4f,   e_c(12)=%.5f' % (E0, EPD, RN['F_e12'])))
a1(para('Con el PID el error tiende a cero, pero despacio: la cola es $%.4fe^{-%.3ft}$, que tarda unos %.1f s en bajar del 2 %%.' % (-r4, -p4, TSTAIL)))
a1(h2link('Paso 7. Ajuste del diseño y repetición de la verificación', 'VII7'))
a1(para('No hizo falta ajustar: $T_{p}=%.3f$ s ≤ %.3f s, el sobrepaso (%.2f %%) es menor que el pedido y el error al escalón es cero. El tiempo de '
        'asentamiento no se pidió; se explica por el modo del PI:' % (IF['tp'], TPMETA, IF['os'])))
a1(eq('T_s≈\\f{\\t{ln}(\\d{r_4}/0.02)}{\\d{p_4}}=\\f{\\t{ln}(%.4f/0.02)}{%.4f}=%.2f  \\t{s}' % (abs(r4), -p4, TSTAIL)))
a1(para('Coincide con el simulado (%.2f s). Si se quisiera acortar, habría que alejar un poco el cero del PI del origen (lo que también mueve más el LGDR); '
        'como no es especificación, se conserva el diseño del libro.' % IF['ts']))
a1(h2('Modelo en Simulink'))
add(figbox('Respuesta en el Scope de Simulink del sistema final (pega también la captura del modelo)',
           '% Figura 8 · Scope de Simulink (sistema final)\n' + SL + "\nset_param(m,'StopTime','3')\nopen_system([m '/Scope'])\nsim(m);                      % corre 3 s"))
a1(figcap('Figura 8: Respuesta en el Scope de Simulink del sistema final'))

# =============== VIII ===============
a1(h1('VIII.', 'Comparación y discusión'))
a1(caption('Tabla 13: Comparación: libro, cálculo analítico y MATLAB'))
add(table([1400, 1150, 1150, 1100], ['Magnitud', 'Libro', 'Analítico', 'MATLAB'],
          [['K sin compensar', '121.5', f(K0, 2), '—'],
           ['$T_{p}$ sin compensar (s)', '0.297', f(TP2, 3), f(RI['tp'], 3)],
           ['$T_{s}$ sin compensar (s)', '0.739', f(TS2, 3), f(RI['ts'], 3)],
           ['$e_{esc}$ sin compensar', '0.156', f(E0, 4), f(1 - YF0, 4)],
           ['Cero del PD / $K_{PD}$', '−55.92 / 5.34', '−%.2f / %.3f' % (ZC, KPD), '—'],
           ['K con PID', '4.6', f(KF, 3), '—'],
           ['%OS con PID', '20 (pred.)', f(OS2, 1), f(IF['os'], 2)],
           ['$T_{p}$ con PID (s)', '0.214 (pred.)', f(math.pi / WF, 3), f(IF['tp'], 3)],
           ['$T_{s}$ con PID (s)', '0.532 (pred.)', f(4 / SF, 3), f(IF['ts'], 3)],
           ['$e_{esc}$ con PID', '0', '0', '0']]))
a1(gray('Los valores analíticos coinciden con la tabla 9.5 del libro (diferencias por redondeo). Las diferencias con MATLAB no son de redondeo: el análisis '
        'de segundo orden ignora los modos de los otros dos polos. El de −%.3f casi se cancela con el cero en −8 y no influye; el del PI (−%.3f) sí: con '
        'residuo negativo baja el sobrepaso a %.2f %% y, por ser lento, alarga T~{s} a %.2f s, aunque el pico llega antes (%.3f s) que lo predicho. Se '
        'cumplieron las tres especificaciones (tiempo pico, sobrepaso y error cero).' % (-p3, -p4, IF['os'], IF['ts'], IF['tp'])))

# =============== IX ===============
a1(h1('IX.', 'Conclusiones y limitaciones demostradas'))
a1(gray('El diseño por partes funcionó: el PD (cero en −%.2f) llevó los polos dominantes al punto con ω~{d} 1.5 veces mayor y el PI (cero en −0.5) hizo '
        'el error al escalón cero casi sin mover el LGDR. Con la re‑búsqueda, K = %.3f y el controlador final es K~{1} = %.1f, K~{2} = %.1f y '
        'K~{3} = %.2f.' % (ZC, KF, K1, K2, K3)))
a1(gray('Se demostró que el PI tiene un costo: su polo cerca del origen deja un modo lento casi cancelado (residuo %.4f) que no afecta el pico pero sí '
        'el tiempo de asentamiento (%.2f s contra %.3f s predichos). También se vio que el PD solo ya cumplía T~{p}, pero no el error.' % (r4, IF['ts'], 4 / SF)))
a1(gray('Como el controlador tiene parte derivativa pura, amplifica el ruido de alta frecuencia; en la práctica se usa el bloque PID con filtro en la derivada.'))
a1(h2('Conclusión individual'))
a1(gray('En esta práctica aprendí que el PID se puede diseñar en dos pasos independientes: primero el PD para la respuesta transitoria y luego el PI '
        'para el error, porque el cero del PI pegado al origen casi no cambia el LGDR.'))
a1(gray('Me sirvió revisar los residuos: dos de los cuatro polos quedan casi cancelados por ceros, por eso el pico se parece al de segundo orden; pero '
        'el modo del PI, aunque pequeño, es tan lento que el tiempo de asentamiento salió de %.2f s.' % IF['ts']))
a1(gray('Con MATLAB comprobé que T~{p} bajó de %.3f s a %.3f s y que el error al escalón llegó a cero. Concluyo que el PID combina las ventajas de los '
        'dos compensadores, siempre que se revise el efecto de cada polo agregado.' % (RI['tp'], IF['tp'])))
out.append('#SECT2')
