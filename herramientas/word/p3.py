# Contenido de la Práctica 3 (atraso de fase, Nise ejercicio 9.1) con el formato de la P2 (v45).
import math, cmath
import numpy as np
from build import *
import num3
RN = num3.R


def f(x, d=4):
    s = ('%.' + str(d) + 'f') % x
    return s


def m(x, d=4):  # número con signo explícito para ecuaciones
    return f(x, d)


Z = RN['zeta']; TH = RN['th']; TN = RN['tan']
s0 = RN['s0']; K0 = RN['K0']; WN = RN['wn0']; SG = 3.5; WD = s0.imag
Kv0 = RN['Kv0']; E0 = RN['e0']; RI = RN['ref_info']
OS2 = math.exp(-Z * math.pi / math.sqrt(1 - Z * Z)) * 100
TS2 = 4 / SG; TP2 = math.pi / WD
TRn = 1.768 * Z ** 3 - 0.417 * Z ** 2 + 1.039 * Z + 1; TR2 = TRn / WN
k1 = sorted(RN['K1poles'])
A = RN['A']; B = RN['B']


def parts(X):
    p = X['poles']; r = X['r']
    i1 = [i for i in range(3) if p[i].imag > 1e-9][0]; i3 = [i for i in range(3) if abs(p[i].imag) < 1e-9][0]
    return p[i1], r[i1], p[i3].real, r[i3].real


pA, rA1, p3A, r3A = parts(A); pB, rB1, p3B, r3B = parts(B)
KA = A['K']; KB = B['K']; IA = A['info']; IB = B['info']
mejA = E0 / A['e']; mejB = E0 / B['e']
difA = abs(pA - s0) / abs(s0) * 100
# ángulo y magnitud del dipolo en s0
angd = math.degrees(cmath.phase(s0 + 0.2) - cmath.phase(s0 + 0.01)); magd = abs(s0 + 0.2) / abs(s0 + 0.01)
a02 = 180 - math.degrees(math.atan(WD / (SG - 0.2))); a001 = 180 - math.degrees(math.atan(WD / (SG - 0.01)))
eA60 = A['er'](np.array([60.0]))[0]; eA20 = A['er'](np.array([20.0]))[0]; eA30 = A['er'](np.array([30.0]))[0]
eB400 = B['er'](np.array([400.0]))[0]; eB100 = B['er'](np.array([100.0]))[0]
tailA = -r3A / p3A; tailB = -r3B / p3B
cs = lambda z: '%s%sj%s' % (f(z.real, 4), '+' if z.imag >= 0 else '-', f(abs(z.imag), 4))
cs3 = lambda z: '%s%sj%s' % (f(z.real, 3), '+' if z.imag >= 0 else '-', f(abs(z.imag), 3))

out = []
add = out.extend
a1 = out.append

# =============== portada (sección 1) ===============
add(cover('Práctica 3: Compensador de atraso de fase'))
a1(resumen('En esta práctica se analizó el sistema tipo 1 con realimentación unitaria G(s) = K/[s(s + 7)] (Nise, ejercicio 9.1), que opera con '
           '15 %% de sobrepaso (ζ = 0.517), y se le diseñó un compensador de atraso de fase para mejorar 20 veces su error ante una rampa. '
           'Con el lugar geométrico de las raíces (LGDR) y las condiciones de ángulo y magnitud se obtuvo la ganancia de referencia K = %.2f '
           '(s~{0} = −3.5 ± j%.3f), con K~{v} = %.3f y error a rampa e(∞) = %.4f. Con G~{c}(s) = (s + 0.2)/(s + 0.01) la nueva búsqueda sobre la '
           'misma recta dio K = %.2f; el error bajó a %.5f (mejora ×%.2f; libro ×19.58). La simulación en MATLAB mostró %.2f %% de sobrepaso '
           'por el polo lento en %.4f; con el dipolo diez veces más cerca del origen (0.02/0.001, K = %.2f) se obtuvo %.2f %% y una mejora ×%.2f, '
           'a cambio de una cola del error más lenta.' % (K0, WD, Kv0, E0, KA, A['e'], mejA, IA['os'], p3A, KB, IB['os'], mejB)))
a1(keywords('Lugar geométrico de las raíces, Compensador de atraso de fase, Error a rampa, Constante de velocidad, Dipolo, MATLAB'))
out.append('#SECT1')

# =============== cuerpo (dos columnas) ===============
a1(h1('I.', 'Identificación y referencia del ejercicio'))
a1(caption('Tabla 1: Identificación de la práctica'))
add(table([1500, 3300], ['Dato', 'Valor'], [['Práctica', '3 · Compensador de atraso de fase'],
                                            ['Ejercicio', 'Ejercicio de evaluación de destreza 9.1, p. 510'],
                                            ['Libro', 'Nise, Sistemas de control para ingeniería (CECSA, 2006)'],
                                            ['Capítulo', '9. Diseño por medio del lugar geométrico de las raíces']], boldfirst=True))
a1(labeled('Objetivo.', 'Evaluar el error ante una rampa unitaria de un sistema tipo 1 que opera con 15 % de sobrepaso, diseñar un compensador de '
           'atraso de fase que lo mejore 20 veces sin cambiar apreciablemente la respuesta transitoria, y comprobar con el modelo completo en '
           'MATLAB cuánta mejoría se logró.'))
a1(labeled('Introducción.', 'Un sistema tipo 1 sigue una rampa con un error constante e(∞) = 1/K~{v}. Para reducirlo sin mover los polos dominantes '
           'no conviene subir K, porque eso cambia el sobrepaso. El compensador de atraso agrega un polo y un cero reales muy cerca del origen '
           '(dipolo), con el cero más lejos que el polo: en s = 0 multiplica K~{v} por z~{c}/p~{c}, y en el punto de operación casi no aporta ángulo '
           'ni magnitud, así que el LGDR casi no cambia cerca de los polos dominantes y sólo hay que recalcular K sobre la misma recta de ζ.', g=True))

a1(h1('II.', 'Planteamiento, modelo, diagrama y especificaciones'))
a1(h2('1. Planteamiento'))
a1(problem('**Problema:** Un sistema con realimentación unitaria con función en transferencia de la trayectoria directa $G(s)=\\f{K}{s(s+7)}$ '
           'está operando con una respuesta escalón en lazo cerrado que tiene 15% de sobrepaso. Haga lo siguiente:'))
for t in ('a) Evalúe el error en estado estable para una entrada de rampa unitaria.',
          'b) Diseñe un compensador de atraso de fase para mejorar el error en estado estable en un factor de 20.',
          'c) Evalúe el error en estado estable para una entrada de rampa unitaria a este sistema compensado.',
          'd) Evalúe cuánta mejoría en error en estado estable se realizó.'):
    a1(problem(t))
a1(para('El ejercicio no trae figura; el diagrama de bloques del punto 3 (Figura 1) es el del sistema compensado.'))
a1(h2('2. Modelo'))
a1(eq('G(s)=\\f{K}{s(s+7)}'))
a1(eq('G_{c}(s)=\\f{s+z_{c}}{s+p_{c}},   \\f{z_{c}}{p_{c}}=20,   H(s)=1'))
a1(para('Realimentación unitaria negativa; el compensador va en cascada con la planta y la ganancia K, antes de G(s). El libro usa '
        '$p_{c}=0.01$ y $z_{c}=0.2$.'))
a1(h2('3. Diagrama de bloques'))
SL = '''m = 'P3_atraso';          %% nombre del modelo
if bdIsLoaded(m), close_system(m,0); end
K = %.2f;                  %% IV · d)
new_system(m); open_system(m)
L = 'simulink/';
add_block([L 'Sources/Step'],[m '/Step'], ...
  'Time','0','After','1')
add_block([L 'Math Operations/Sum'], ...
  [m '/Sum'],'Inputs','|+-')
add_block([L 'Math Operations/Gain'], ...
  [m '/K'],'Gain','K')
add_block([L 'Continuous/Transfer Fcn'], ...
  [m '/Gc'],'Numerator','[1 0.2]', ...
  'Denominator','[1 0.01]')      %% (s+0.2)/(s+0.01)
add_block([L 'Continuous/Transfer Fcn'], ...
  [m '/G'],'Numerator','1', ...  %% planta
  'Denominator','[1 7 0]')
add_block([L 'Sinks/Scope'],[m '/Scope'])
add_line(m,'Step/1','Sum/1')
add_line(m,'Sum/1','K/1')
add_line(m,'K/1','Gc/1')
add_line(m,'Gc/1','G/1')
add_line(m,'G/1','Scope/1')
add_line(m,'G/1','Sum/2')    %% realimentación
Simulink.BlockDiagram.arrangeSystem(m)''' % KA
SL = SL.replace("m = 'P3_atraso';          % nombre del modelo", "m = 'P3_atraso';         % nombre del modelo")
add(figbox('Diagrama de bloques del sistema en lazo cerrado (Simulink): Step → Sum (+ −) → Gain (K) → G~{c}(s) → G(s) → Scope. '
           'Para el error a rampa se cambia el Step por un Ramp (Slope = 1).', '% Figura 1 · Modelo de Simulink con el atraso\n' + SL))
a1(figcap('Figura 1: Diagrama de bloques del sistema en lazo cerrado (Simulink)'))
a1(h2('4. Especificaciones'))
a1(caption('Tabla 2: Especificaciones de diseño'))
add(table([1500, 1500, 1800], ['Especificación', 'Meta', 'Cómo se verifica'],
          [['Sobrepaso', '15 % (ζ = 0.517)', 'Fija la K de referencia; se conserva'],
           ['Error a rampa', '×20 mejor: e(∞) ≤ %.5f' % (E0 / 20), '$e(∞)=1/K_{v}$'],
           ['Mejora lograda', 'Evaluar', 'Cociente de errores'],
           ['Validez de la aproximación', 'Juzgar', 'Residuos de los modos']]))

# ---------------- III ----------------
a1(h1('III.', 'Análisis inicial y desempeño de referencia'))
a1(h2link('Paso 1. Ganancia de referencia (no asumir que es uno)', 'III1'))
a1(para('El enunciado da la ganancia de forma indirecta: el sistema opera con 15 %% de sobrepaso, es decir, con $ζ=%.4f$. La ganancia de '
        'referencia es la que coloca los polos dominantes sobre esa recta; se busca con la condición de ángulo (polos de $G(s)$ en $0$ y $-7$) '
        'y se calcula con la de magnitud:' % Z))
a1(eq('ζ=\\f{-\\t{ln}(\\%OS/100)}{\\r{π^2+\\t{ln}^2(\\%OS/100)}},   θ=cos^{-1}ζ'))
a1(eq('-∑∠(s_0-p_i)=±180°'))
a1(eq('K=∏\\d{s_0-p_i}'))
a1(resultado())
a1(eq('ζ=%.4f,   θ=%.2f°,   s_0=-3.5+j%.3f' % (Z, TH, WD)))
a1(eq('K_{ref}=%.2f' % K0))
a1(para('Si se asumiera $K=1$, los polos en lazo cerrado serían $%.3f$ y $%.3f$: reales, sin sobrepaso, es decir, otro sistema y no el del enunciado.' % (k1[1], k1[0])))

a1(h2link('Paso 2. Polos, ceros, tipo y ecuación característica', 'III2'))
a1(caption('Tabla 3: Polos, ceros y tipo del sistema sin compensar'))
add(table([2259, 1412, 1129], ['Polos de lazo abierto', 'Ceros', 'Tipo'], [['$0, -7$  ($n=2$)', '— ($m=0$)', '1']]))
a1(para('Ecuación característica $1+KG(s)=0$:'))
a1(eq('s^2+7s+K=0'))
a1(resultado())
a1(eq('n=2,   m=0 ⇒ 2 \\t{ramas y }2 \\t{asíntotas}'))
a1(eq('\\t{LGDR en eje real: }[-7, 0]'))
a1(eq('σ_a=-3.5,   θ_a=90°, 270°'))
a1(eq('σ_b=-3.5,   K_b=12.25'))

a1(h2link('Paso 3. Estabilidad y rango de ganancia estable', 'III3'))
a1(caption('Tabla 4: Arreglo de Routh del sistema sin compensar'))
add(table([1600, 1600, 1600], ['Fila', 'Col. 1', 'Col. 2'], [['s^^{2}', '1', '$K$'], ['s^^{1}', '7', '0'], ['s^^{0}', '$K$', '']]))
a1(eq('0<7  \\t{y}  0<K'))
a1(resultado())
a1(eq('0<K<∞'))
a1(para('No hay $K_{crít}$: las ramas nunca cruzan el eje $jω$.'))

a1(h2link('Paso 4. Polos en lazo cerrado con la ganancia de referencia', 'III4'))
a1(para('Con $K_{ref}=%.2f$, la ecuación característica del Paso 2 queda:' % K0))
a1(eq('s^2+7s+%.2f=0' % K0))
a1(caption('Tabla 5: Polos en lazo cerrado de referencia'))
add(table([800, 1800, 2200], ['Polo', 'Valor', 'Observación'],
          [['p~{1}', '$-3.500+j%.3f$' % WD, 'Par complejo sobre la recta de ζ = 0.517'],
           ['p~{2}', '$-3.500-j%.3f$' % WD, 'Conjugado de $p_1$; no hay más polos (2.º orden puro)']]))
a1(resultado())
a1(eq('p_{1,2}=-3.500±j%.3f' % WD))
a1(para('Como el sistema es de segundo orden puro, las fórmulas de segundo orden del Paso 5 son exactas.'))

a1(h2link('Paso 5. Respuesta transitoria y error estacionario', 'III5'))
a1(para('Del par $p_{1,2}=-σ±jω_d$ del Paso 4 se obtienen los parámetros de segundo orden; con ellos se calculan el transitorio y el error ante rampa (inciso a):'))
a1(eq('ω_n=\\r{σ^2+ω_d^2},   ζ=\\f{σ}{ω_n}'))
a1(eq('\\%OS=e^{-ζπ/\\r{1-ζ^2}}×100'))
a1(eq('T_s=\\f{4}{σ},   T_p=\\f{π}{ω_d}'))
a1(eq('T_r≈\\f{1.768ζ^3-0.417ζ^2+1.039ζ+1}{ω_n}'))
a1(eq('K_v=\\lim{s→0}{sKG(s)},   e_{rampa}(∞)=\\f{1}{K_v}'))
a1(resultado())
a1(eq('σ=3.5,   ω_d=%.4f,   ω_n=%.4f  \\t{rad/s}' % (WD, WN)))
a1(eq('ζ=%.4f,  \\%%OS=%.1f \\t{%%}' % (Z, OS2)))
a1(eq('T_s=%.3f  \\t{s},   T_p=%.3f  \\t{s},   T_r≈%.3f  \\t{s}' % (TS2, TP2, TR2)))
a1(eq('K_v=%.3f,   e_{rampa}(∞)=%.4f' % (Kv0, E0)))
a1(h2('Evidencia de la etapa'))
add(figbox('LGDR inicial (sistema sin compensar) con la recta de ζ y el punto s~{0}', '''%% Figura 2 · LGDR sin compensar y recta de zeta
s = tf('s');
G = 1/(s*(s+7));                 %% planta
zeta = -log(0.15)/sqrt(pi^2+log(0.15)^2);   %% 0.5169
s0 = -3.5 + 5.7959i;             %% III · Paso 1
figure
rlocus(G); grid on               %% LGDR y rejilla
hold on
th = acos(zeta); r = [0 10];     %% recta de zeta
plot(-r*cos(th), r*sin(th),'m--', ...
     -r*cos(th),-r*sin(th),'m--')
plot(real(s0)*[1 1],imag(s0)*[1 -1],'r*')
axis([-9 2 -8 8])
title('LGDR sin compensar (\\zeta = 0.517)')
hold off'''))
a1(figcap('Figura 2: LGDR inicial (sistema sin compensar) con la recta de ζ'))
add(figbox('Respuesta temporal de referencia al escalón (y salida de stepinfo)', '''%% Figura 3 · Respuesta de referencia
s = tf('s');
G = 1/(s*(s+7));
K = %.2f;                  %% III · Paso 1
Tu = feedback(K*G, 1);      %% lazo cerrado
figure
step(Tu, 3); grid on
title('Respuesta al escalón sin compensar')
info = stepinfo(Tu)         %% %%OS, Ts, Tp, Tr
p = pole(Tu)''' % K0))
a1(figcap('Figura 3: Respuesta temporal de referencia al escalón'))
add(figbox('Error ante rampa unitaria e(t) = t − c(t) del sistema sin compensar', '''%% Figura 4 · Error a rampa sin compensar
s = tf('s');
G = 1/(s*(s+7));
K = %.2f;                  %% III · Paso 1
Tu = feedback(K*G, 1);
t = 0:0.001:5;
cu = lsim(Tu, t, t);        %% respuesta a la rampa
figure
plot(t, t' - cu); grid on
Kv = dcgain(minreal(s*K*G)) %% constante de velocidad
yline(1/Kv,'r--')           %% e(inf) = 1/Kv
xlabel('t (s)'); ylabel('e(t) = t - c(t)')
title('Error ante rampa unitaria, sin compensar')''' % K0))
a1(figcap('Figura 4: Error ante rampa unitaria e(t) = t − c(t) del sistema sin compensar'))
a1(caption('Tabla 6: Desempeño de referencia'))
add(table([1600, 1600, 1600], ['Magnitud', 'Analítico (2.º orden)', 'Simulación (MATLAB)'],
          [['%OS (%)', f(OS2, 1), f(RI['os'], 2)], ['$T_{s}$ (s)', f(TS2, 3), f(RI['ts'], 3)], ['$T_{p}$ (s)', f(TP2, 3), f(RI['tp'], 3)],
           ['$T_{r}$ (s)', f(TR2, 3), f(RI['tr'], 3)], ['$K_{v}$', f(Kv0, 3), f(Kv0, 3)], ['$e_{rampa}(∞)$', f(E0, 4), f(RN['ref_e'], 4)]]))
a1(para('La simulación se hizo con el modelo completo y $K=%.2f$. Como el sistema es de segundo orden puro, sólo $T_{s}$ y $T_{r}$ difieren: '
        '$4/σ$ y la fórmula de $T_{r}$ son aproximaciones.' % K0))

# ---------------- IV ----------------
a1(h1('IV.', 'Desarrollo y justificación del diseño'))
a1(gray('Para reducir el error a rampa hay que subir K~{v} sin mover los polos dominantes. Subir K no sirve: con K = 20(45.84) = 916.9 el sobrepaso '
        'llegaría a 69 %. El atraso pone un polo en −p~{c} y un cero en −z~{c} muy cerca del origen: en s = 0 multiplica K~{v} por z~{c}/p~{c} = 20 y en '
        'el punto de operación casi no aporta ángulo, así que se repite la búsqueda sobre la misma recta de ζ y se recalcula K. Después se '
        'revisan el polo nuevo y la estabilidad.'))
a1(h2link('a) Cómo el atraso multiplica la constante de velocidad', 'IVa'))
a1(eq('K_{v,comp}=\\lim{s→0}{sKG_c(s)G(s)}=\\f{K}{7}·\\f{z_c}{p_c}'))
a1(eq('\\f{e_{sin}}{e_{comp}}=\\f{K_{v,comp}}{K_v}≈\\f{z_c}{p_c}=20'))
a1(resultado())
a1(eq('p_c=0.01,   z_c=20p_c=0.2'))
a1(eq('e_{meta}(∞)=\\f{%.4f}{20}=%.5f' % (E0, E0 / 20)))
a1(para('La mejora sólo es exactamente 20 si K no cambia; como K se recalcula en d), la mejora real se evalúa en e).'))
a1(h2link('b) Ubicación del dipolo', 'IVb'))
a1(eq('∠G_c(s_0)=∠(s_0+0.2)-∠(s_0+0.01)'))
a1(eq('\\d{G_c(s_0)}=\\f{\\d{s_0+0.2}}{\\d{s_0+0.01}}'))
a1(resultado())
a1(eq('∠G_c(s_0)=%.2f°,  \\d{G_c(s_0)}=%.4f' % (angd, magd)))
a1(para('El dipolo casi no aporta ángulo ni cambia la magnitud: el punto $s_{0}$ queda muy cerca del nuevo LGDR.'))
a1(h2link('c) Nueva ecuación característica y estabilidad', 'IVc'))
a1(eq('1+KG_c(s)G(s)=0'))
a1(resultado())
a1(eq('s^3+7.01s^2+(0.07+K)s+0.2K=0'))
a1(eq('0<K<∞'))
a1(para('El lazo cerrado pasa a tercer orden (planta de segundo orden más el polo del compensador) y, con Routh, sigue siendo estable para toda $K>0$.'))
a1(h2link('d) Nueva búsqueda de K sobre ζ = 0.517', 'IVd'))
a1(eq('∠(s+0.2)-∠s-∠(s+7)-∠(s+0.01)=±180°'))
a1(eq('K=\\f{\\d{s}\\d{s+7}\\d{s+0.01}}{\\d{s+0.2}}'))
a1(resultado())
a1(eq('s_0=%s' % cs3(pA)))
a1(eq('K=%.2f' % KA))
a1(para('$K$ bajó %.1f %% respecto a $K_{ref}=%.2f$: el dipolo casi no alteró el LGDR cerca de $s_{0}$. El tercer polo queda en $%.4f$, junto al cero en $-0.2$.'
        % ((K0 - KA) / K0 * 100, K0, p3A)))
add(figbox('LGDR sin compensar y con atraso sobre la recta ζ = 0.517 (con acercamiento cerca del origen)', '''%% Figura 5 · LGDR sin compensar y con atraso
s = tf('s');
G  = 1/(s*(s+7));
Gc = (s + 0.2)/(s + 0.01);      %% atraso
zeta = -log(0.15)/sqrt(pi^2+log(0.15)^2);
s0c = %s;    %% IV · d)
th = acos(zeta); r = [0 10];    %% recta de zeta
figure
subplot(1,2,1)
rlocus(G, Gc*G); grid on
hold on
plot(-r*cos(th), r*sin(th),'m--', ...
     -r*cos(th),-r*sin(th),'m--')
plot(real(s0c)*[1 1],imag(s0c)*[1 -1],'r*')
axis([-9 2 -8 8])
legend('sin compensar','con atraso')
hold off
subplot(1,2,2)                  %% acercamiento
rlocus(Gc*G); grid on
axis([-0.4 0.1 -0.25 0.25])
title('Cerca del origen: dipolo')''' % ('%.4f + %.4fi' % (pA.real, pA.imag))))
a1(figcap('Figura 5: LGDR sin compensar y con atraso (acercamiento cerca del origen)'))
a1(h2link('e) Error compensado y mejora', 'IVe'))
a1(eq('K_v=\\f{K}{7}·\\f{z_c}{p_c},   e_{rampa}(∞)=\\f{1}{K_v},   \\t{mejora}=\\f{e_{sin}}{e_{comp}}'))
a1(resultado())
a1(eq('K_v=%.2f,   e_{rampa}(∞)=%.5f' % (A['Kv'], A['e'])))
a1(eq('\\t{mejora}=%.2f  \\t{(libro: 19.58)}' % mejA))
a1(para('La mejora queda un poco abajo de 20 porque $K$ bajó de $%.2f$ a $%.2f$; el libro reporta $e(∞)=0.0078$ (incisos c y d).' % (K0, KA)))

# ---------------- V ----------------
a1(h1('V.', 'Controlador final y parámetros'))
a1(eq('G_c(s)=\\f{s+0.2}{s+0.01}'))
a1(caption('Tabla 7: Parámetros del controlador final'))
add(table([2400, 2400], ['Parámetro', 'Valor obtenido'],
          [['K (diseño, IV · d)', f(KA, 2)], ['$z_{c}$ / $p_{c}$', '0.2 / 0.01 (cociente 20)'], ['$K_{v}$ compensado', f(A['Kv'], 2)],
           ['Variante ajustada (VII · Paso 7): $z_{c}$ / $p_{c}$', '0.02 / 0.001 (cociente 20)'], ['K de la variante', f(KB, 2)],
           ['ζ de diseño', '%.4f (θ = %.2f°)' % (Z, TH)]]))
a1(para('El cociente $z_{c}/p_{c}=20$ fija la mejora; la posición del dipolo (qué tan cerca del origen) decide cuánto se altera el transitorio. '
        'El diseño del libro (0.2/0.01) se verifica en VI y VII; como su sobrepaso simulado sale de 18.3 %%, en VII · Paso 7 se adopta la variante '
        '0.02/0.001 con $K=%.2f$.' % KB))

# ---------------- VI ----------------
a1(h1('VI.', 'Comprobación analítica'))
a1(h2link('Paso 1. Ecuación característica final y todos los polos en lazo cerrado', 'VI1'))
a1(para('$1+KG_{c}(s)G(s)=0$ con $G_{c}(s)=(s+0.2)/(s+0.01)$:'))
a1(eq('s^3+7.01s^2+(0.07+K)s+0.2K=0'))
a1(eq('K=%.2f:   s^3+7.01s^2+%.2f s+%.3f=0' % (KA, 0.07 + KA, 0.2 * KA)))
a1(caption('Tabla 8: Polos en lazo cerrado del sistema compensado'))
add(table([800, 1800, 2200], ['Polo', 'Valor', 'Observación'],
          [['p~{1}', '$%s$' % cs3(pA), 'Dominante'], ['p~{2}', '$%s$' % cs3(pA.conjugate()), 'Dominante (conjugado)'],
           ['p~{3}', '$%.4f$' % p3A, 'Real, junto al cero $-0.2$ (modo lento, τ = %.2f s)' % (-1 / p3A)]]))
a1(resultado())
a1(eq('p_{1,2}=-%.3f±j%.3f,   p_3=%.4f' % (-pA.real, pA.imag, p3A)))
a1(para('Todas las raíces tienen parte real negativa. No se descarta ningún modo: el orden en lazo cerrado (3) es el de la planta (2) más el polo del compensador (1).'))
a1(h2link('Paso 2. Estabilidad y comparación con los polos candidatos', 'VI2'))
b1 = (7.01 * (0.07 + KA) - 0.2 * KA) / 7.01
a1(caption('Tabla 9: Arreglo de Routh del sistema compensado'))
add(table([1200, 1200, 1200, 1200], ['Fila', 'Col. 1', 'Col. 2', 'Col. 3'],
          [['s^^{3}', '1', f(0.07 + KA, 2), '0'], ['s^^{2}', '7.01', f(0.2 * KA, 3), '0'], ['s^^{1}', f(b1, 2), '0', '0'], ['s^^{0}', f(0.2 * KA, 3), '', '']]))
a1(para('Con $K=%.2f$ la primera columna es toda positiva; como no hay cambios de signo, el sistema es estable.' % KA))
a1(caption('Tabla 10: Polos candidatos (diseño) contra polos obtenidos'))
add(table([1200, 1400, 1400, 800], ['Polos', 'Candidato', 'Obtenido', 'Dif. (%)'],
          [['Par dominante', '$-3.500$\n$±j%.3f$\n(sin comp.)' % WD, '$%.3f$\n$±j%.3f$' % (pA.real, pA.imag), f(difA, 1)],
           ['Polo del dipolo', '— (no se fija)', '$%.4f$' % p3A, '—']]))
a1(resultado())
a1(eq('0<K<∞   \\t{(no hay }K_{crít}\\t{)}'))
a1(eq('\\t{Dif. del par dominante}=%.1f \\t{%%}' % difA))
a1(para('Con $K=%.2f$ el par dominante queda a %.1f %% del punto de operación original y el sistema sigue estable para cualquier $K>0$.' % (KA, difA)))
a1(h2link('Paso 3. ¿Es razonable la aproximación de polos dominantes?', 'VI3'))
a1(caption('Tabla 11: Modos del sistema y residuos al escalón'))
add(table([1550, 1850, 1400], ['Polo', 'Residuo', 'Lectura'],
          [['$%s$' % ('-%.3f±j%.3f' % (-pA.real, pA.imag)), '$%.4f±j%.4f$\n(|r| = %.4f c/u)' % (rA1.real, rA1.imag, abs(rA1)), 'Dominante'],
           ['$%.4f$' % p3A, '$%.4f$' % r3A, 'Lento (τ = %.2f s): casi cancelado con el cero' % (-1 / p3A)],
           ['0 (escalón)', '1.000', 'Valor final c(∞)']]))
a1(blue('✎ Residuos en MATLAB: [num,den] = tfdata(Tc,\'v\'); [r,pp] = residue(num, conv(den,[1 0])).'))
a1(eq('r_i=\\f{N_T(p_i)}{p_iD_T\'(p_i)}'))
a1(resultado())
a1(eq('r_0=1,  \\d{r_{1,2}}=%.4f,   r_3=%.4f' % (abs(rA1), r3A)))
a1(para('Conclusión: el modo de $p_{3}$ pesa %.1f %% de cada modo dominante, así que el par dominante fija la forma de la respuesta. Sin embargo, ese modo '
        'casi no decae durante el pico (τ = %.2f s) y su residuo es positivo: se suma a la respuesta y sube el sobrepaso, además de alargar el '
        'asentamiento. Por eso el desempeño se verifica con el modelo completo.' % (r3A / abs(rA1) * 100, -1 / p3A)))
a1(h2link('Paso 4. Error estacionario correspondiente (analítico)', 'VI4'))
a1(eq('K_p=\\lim{s→0}{KG_c(s)G(s)}=∞,   K_v=\\lim{s→0}{sKG_c(s)G(s)}'))
a1(eq('e_{esc}(∞)=\\f{1}{1+K_p},   e_{rampa}(∞)=\\f{1}{K_v}'))
a1(resultado())
a1(eq('e_{esc}(∞)=0,   K_v=%.2f,   e_{rampa}(∞)=%.5f' % (A['Kv'], A['e'])))
a1(advert())

# ---------------- VII ----------------
a1(h1('VII.', 'Comprobación en MATLAB'))
a1(italic('Pasos 5, 6 y 7 de la verificación del sistema completo, con el modelo completo (sin simplificar polos).'))
a1(h2link('Paso 5. Simulación de las entradas requeridas y desempeño del modelo completo', 'VII5'))
a1(para('Entradas simuladas: escalón unitario (transitorio) y rampa unitaria (error), sin compensar y con atraso.'))
add(figbox('Respuesta al escalón sin compensar vs. con atraso', '''%% Figura 6 · Escalón: sin compensar vs. atraso
s = tf('s');
G  = 1/(s*(s+7));
Gc = (s + 0.2)/(s + 0.01);
Tu = feedback(%.2f*G, 1);       %% sin compensar
Tc = feedback(%.2f*Gc*G, 1);    %% con atraso
figure
step(Tu, Tc, 6); grid on
legend('sin compensar','con atraso')
title('Respuesta al escalón unitario')''' % (K0, KA)))
a1(figcap('Figura 6: Respuesta al escalón sin compensar vs. con atraso'))
add(figbox('Error ante rampa e(t) = t − c(t): sin compensar vs. con atraso', '''%% Figura 7 · Error a rampa: sin compensar vs. atraso
s = tf('s');
G  = 1/(s*(s+7));
Gc = (s + 0.2)/(s + 0.01);
Tu = feedback(%.2f*G, 1);
Tc = feedback(%.2f*Gc*G, 1);
t = 0:0.001:60;
cu = lsim(Tu, t, t);  cc = lsim(Tc, t, t);
figure
plot(t, t' - cu, t, t' - cc); grid on
ylim([0 0.2])
xlabel('t (s)'); ylabel('e(t) = t - c(t)')
legend('sin compensar','con atraso')
title('Error ante rampa unitaria')''' % (K0, KA)))
a1(figcap('Figura 7: Error ante rampa e(t) = t − c(t): sin compensar vs. con atraso'))
add(figbox('Salida de pole(Tc), stepinfo(Tc) y K~{v} en la Command Window (captura)', '''%% Figura 8 · Command Window
s = tf('s');
G  = 1/(s*(s+7));
Gc = (s + 0.2)/(s + 0.01);
K = %.2f;  Kc = %.2f;
Tu = feedback(K*G, 1);
Tc = feedback(Kc*Gc*G, 1);
pole(Tc)
stepinfo(Tu)
stepinfo(Tc)
Kv_u = dcgain(minreal(s*K*G));
Kv_c = dcgain(minreal(s*Kc*Gc*G))
e_u = 1/Kv_u
e_c = 1/Kv_c
mejora = e_u/e_c''' % (K0, KA)))
a1(figcap('Figura 8: Salida de pole(Tc), stepinfo(Tc) y Kv en la Command Window (captura)'))
a1(caption('Tabla 12: Especificaciones contra desempeño simulado'))
add(table([1350, 1050, 1300, 1100], ['Especificación', 'Meta', 'Obtenido', '¿Cumple?'],
          [['%OS', '15 %', '%.2f %%' % IA['os'], 'No (+%.1f puntos)' % (IA['os'] - 15)],
           ['$e_{rampa}(∞)$', '≤ %.5f' % (E0 / 20), f(A['e'], 5), 'Casi (+%.1f %%)' % ((A['e'] / (E0 / 20) - 1) * 100)],
           ['Mejora', '×20', '×%.2f' % mejA, 'Casi'],
           ['$T_{s}$ (dato)', '—', '%.3f s → %.3f s' % (RI['ts'], IA['ts']), 'No se pide (más lento)']]))
a1(eq('\\%OS=\\f{c_{máx}-c(∞)}{c(∞)}×100'))
a1(resultado())
a1(eq('t_p=%.3f  \\t{s},   c_{máx}=%.4f,   c(∞)=1' % (IA['tp'], IA['pk'])))
a1(eq('\\%%OS_{sim}=%.2f \\t{%%},   T_s=%.3f  \\t{s}  (K=%.2f)' % (IA['os'], IA['ts'], KA)))
a1(para('El error cumple casi exactamente (mejora ×%.2f), pero el sobrepaso sube de 15 %% a %.2f %%: el modo lento de $p_{3}=%.4f$ no queda '
        'cancelado del todo por el cero en $-0.2$ y se suma a la respuesta durante el pico.' % (mejA, IA['os'], p3A)))
a1(h2link('Paso 6. Error estacionario simulado', 'VII6'))
a1(eq('e_{sim}(∞)=\\lim{t→∞}{[t-c(t)]}'))
a1(resultado())
a1(eq('e_{sim}(60 \\t{ s})=%.5f ✓  \\t{(igual al analítico)}' % eA60))
a1(eq('\\t{Sin compensar: }e_{sim}(∞)=%.4f' % RN['ref_e']))
a1(para('El error con atraso no llega de inmediato a su valor final: a los 20 s todavía vale $%.4f$ y tarda unos 40 s en asentarse, porque lo '
        'gobierna el modo lento $e^{%.4ft}$.' % (eA20, p3A)))
a1(blue('✎ En MATLAB: e_sim = t(end) − cc(end) con la Figura 7 (t hasta 60 s).'))
a1(h2link('Paso 7. Ajuste del diseño y repetición de la verificación', 'VII7'))
a1(para('El sobrepaso no cumple (18.3 % > 15 %). Se conserva el cociente $z_{c}/p_{c}=20$ (la mejora) y se acerca el dipolo diez veces al '
        'origen, $G_{c}(s)=(s+0.02)/(s+0.001)$; se repite la búsqueda sobre la misma recta y la verificación completa:'))
a1(eq('∠(s+0.02)-∠s-∠(s+7)-∠(s+0.001)=±180°'))
a1(resultado())
a1(eq('s_0=%s,   K=%.2f' % (cs3(pB), KB)))
a1(eq('p_3=%.5f,   r_3=%.5f' % (p3B, r3B)))
a1(eq('\\%%OS_{sim}=%.2f \\t{%%},   T_s=%.3f  \\t{s}' % (IB['os'], IB['ts'])))
a1(eq('e_{rampa}(∞)=%.5f,   \\t{mejora}=%.2f' % (B['e'], mejB)))
a1(para('Con la variante el sobrepaso baja a %.2f %% (≈ 15 %%), $T_{s}$ vuelve a %.3f s y la mejora sube a ×%.2f, porque el residuo del modo '
        'lento bajó de %.4f a %.4f. El precio es que ese modo es diez veces más lento (τ = %.0f s): el error a rampa tarda varios minutos en '
        'llegar a su valor final.' % (IB['os'], IB['ts'], mejB, r3A, r3B, -1 / p3B)))
add(figbox('Respuesta al escalón y error a rampa con la variante 0.02/0.001', '''%% Figura 9 · Variante 0.02/0.001 (ajuste)
s = tf('s');
G   = 1/(s*(s+7));
Gc  = (s + 0.2)/(s + 0.01);     %% diseño del libro
Gc2 = (s + 0.02)/(s + 0.001);   %% variante
Tc  = feedback(%.2f*Gc*G, 1);
Tc2 = feedback(%.2f*Gc2*G, 1);  %% VII · Paso 7
figure
subplot(2,1,1)
step(Tc, Tc2, 6); grid on
legend('0.2/0.01','0.02/0.001')
title('Escalón unitario')
subplot(2,1,2)
t = 0:0.01:400;
c1 = lsim(Tc, t, t);  c2 = lsim(Tc2, t, t);
plot(t, t' - c1, t, t' - c2); grid on
ylim([0 0.05])
xlabel('t (s)'); ylabel('e(t) = t - c(t)')
legend('0.2/0.01','0.02/0.001')
title('Error ante rampa unitaria')
pole(Tc2)
stepinfo(Tc2)
e2 = 1/dcgain(minreal(s*%.2f*Gc2*G))''' % (KA, KB, KB)))
a1(figcap('Figura 9: Respuesta al escalón y error a rampa con la variante 0.02/0.001'))
a1(h2('Modelo en Simulink'))
SL2 = SL.replace("K = %.2f;                  %% IV · d)" % KA, "K = %.2f;                  %% VII · Paso 7" % KB) \
        .replace("[m '/Gc'],'Numerator','[1 0.2]', ...", "[m '/Gc'],'Numerator','[1 0.02]', ...") \
        .replace("'Denominator','[1 0.01]')      % (s+0.2)/(s+0.01)", "'Denominator','[1 0.001]')     % (s+0.02)/(s+0.001)")
assert SL2 != SL
add(figbox('Respuesta en el Scope de Simulink del sistema final (pega también la captura del modelo)',
           '% Figura 10 · Scope de Simulink (variante final)\n' + SL2 + "\nset_param(m,'StopTime','6')\nopen_system([m '/Scope'])\nsim(m);                      % corre 6 s"))
a1(figcap('Figura 10: Respuesta en el Scope de Simulink del sistema final'))

# ---------------- VIII ----------------
a1(h1('VIII.', 'Comparación y discusión'))
a1(caption('Tabla 13: Comparación: libro, cálculo analítico y MATLAB'))
add(table([1400, 1150, 1150, 1100], ['Magnitud', 'Libro', 'Analítico', 'MATLAB'],
          [['K sin compensar', '—', f(K0, 2), f(K0, 2)],
           ['Polos sin comp.', '—', '$-3.500$\n$±j%.3f$' % WD, '$-3.500$\n$±j%.3f$' % WD],
           ['$e_{rampa}$ sin compensar', '0.1527', f(E0, 4), f(RN['ref_e'], 4)],
           ['K con atraso', '—', f(KA, 2), f(KA, 2)],
           ['Polos con atraso', '—', '$%.3f$\n$±j%.3f$\n$%.4f$' % (pA.real, pA.imag, p3A), '$%.3f$\n$±j%.3f$\n$%.4f$' % (pA.real, pA.imag, p3A)],
           ['$e_{rampa}$ con atraso', '0.0078', f(A['e'], 5), f(eA60, 5)],
           ['Mejora', '×19.58', '×%.2f' % mejA, '×%.2f' % (RN['ref_e'] / eA60)],
           ['%OS con atraso', '—', '15 (2.º orden)', f(IA['os'], 2)],
           ['Variante 0.02/0.001', '—', 'K = %.2f\n×%.2f' % (KB, mejB), '%.2f %%\n×%.2f' % (IB['os'], mejB)]]))
a1(gray('Los errores analíticos coinciden con los del libro: 0.1527 sin compensar y 0.0078 con el atraso. La mejora del libro (×19.58) sale de '
        'redondear el error compensado a 0.0078; con más cifras queda ×%.2f, un poco menos de 20 porque K bajó de %.2f a %.2f al seguir sobre '
        'la recta de ζ. El libro no reporta el transitorio: la aproximación de segundo orden predice 15 %%, pero la simulación del modelo completo '
        'da %.2f %%, porque el polo en %.4f queda casi, pero no totalmente, cancelado por el cero en −0.2 (residuo %.4f). Esa es la diferencia '
        'importante con el cálculo analítico. Al acercar el dipolo diez veces al origen el residuo baja a %.4f y el sobrepaso a %.2f %%, con la misma '
        'mejora del error (×%.2f), a cambio de una cola del error mucho más lenta.' % (mejA, K0, KA, IA['os'], p3A, r3A, r3B, IB['os'], mejB)))

# ---------------- IX ----------------
a1(h1('IX.', 'Conclusiones y limitaciones demostradas'))
a1(gray('El compensador de atraso de fase mejoró el error ante rampa de 0.1527 a %.5f (×%.2f ≈ 20) sin cambiar apreciablemente los polos '
        'dominantes, que se movieron %.1f %%: el cociente z~{c}/p~{c} fija la mejora y el dipolo cerca del origen casi no mueve el LGDR.' % (A['e'], mejA, difA)))
a1(gray('La mejora real no es exactamente z~{c}/p~{c}, porque K se reajusta para seguir sobre la recta de ζ; por eso se obtuvo ×%.2f y no ×20.' % mejA))
a1(gray('Se demostró una limitación: el atraso deja un polo en lazo cerrado junto al cero (%.4f) cuyo modo es lento. Con 0.2/0.01 sube el '
        'sobrepaso a %.2f %%; con 0.02/0.001 casi desaparece del escalón (%.2f %%), pero el error a rampa tarda varios minutos en llegar a su valor '
        'final. Entre más cerca del origen el dipolo, menor su efecto en el transitorio y más lenta esa cola; por eso el diseño siempre se '
        'verifica con el modelo completo.' % (p3A, IA['os'], IB['os'])))
a1(h2('Conclusión individual'))
a1(gray('En esta práctica aprendí que el error ante rampa de un sistema tipo 1 se puede reducir sin rediseñar el transitorio, si se agrega '
        'un polo y un cero muy cerca del origen con el cociente z~{c}/p~{c} igual a la mejora que se busca. Lo más difícil fue entender por qué el '
        'dipolo casi no cambia el LGDR: al calcular su ángulo (%.2f°) y su magnitud (%.3f) en el punto de operación quedó claro.' % (angd, magd)))
a1(gray('Me pareció importante revisar los residuos: el polo lento tiene un residuo pequeño (%.4f), pero como casi no decae durante el pico, '
        'subió el sobrepaso de 15 %% a %.2f %%. Sin la simulación del modelo completo hubiera pensado que el diseño del libro cumplía todo.' % (r3A, IA['os'])))
a1(gray('Con MATLAB comprobé el error de %.5f y la mejora de ×%.2f, y al acercar el dipolo al origen recuperé el 15 %% de sobrepaso. Concluyo '
        'que el atraso es una buena solución cuando se necesita bajar el error en estado estable y se acepta que el error tarde en llegar a su '
        'valor final.' % (A['e'], mejA)))
out.append('#SECT2')
