# Contenido de la Práctica 4 (PD ideal, Nise ejemplo 9.3) con el formato de la P1–P3 (v45/v47).
import math, cmath
import numpy as np
from build import *
import num4
RN = num4.R


def f(x, d=4):
    return ('%.' + str(d) + 'f') % x


def code(src, **k):
    """código MATLAB con marcas @x@ (evita los %% de Python)"""
    for a, b in k.items():
        src = src.replace('@' + a + '@', b)
    assert '@' not in src, src
    return src


deg = math.degrees
Z = RN['zeta']; TH = RN['th']; TN = RN['tan']
SG = RN['sig0']; s0 = RN['s0']; WD = s0.imag; K0 = RN['K0']; WN = RN['wn0']
Kv0 = RN['Kv0']; E0 = RN['e0']; RI = RN['ref_info']
OS2 = math.exp(-Z * math.pi / math.sqrt(1 - Z * Z)) * 100
TS2 = 4 / SG; TP2 = math.pi / WD
TRn = 1.768 * Z ** 3 - 0.417 * Z ** 2 + 1.039 * Z + 1; TR2 = TRn / WN
k1 = sorted(RN['K1poles'])
SB = RN['sb']; KB_ = RN['Kb']
P3R = -10 + 2 * SG                                   # tercer polo de referencia
rr = RN['ref_r']; rp = RN['ref_poles']
iR3 = [i for i in range(3) if abs(rp[i].imag) < 1e-9][0]; iR1 = [i for i in range(3) if rp[i].imag > 1e-9][0]
r3R = rr[iR3].real; r1R = rr[iR1]
# diseño
TSD = RN['Tsd']; SD = RN['sgd']; WDD = RN['wdd']; sd = RN['sd']; WND = abs(sd)
ANG = RN['angs']; ANGG = RN['angG']; THZ = RN['thz']; ZC = RN['zc']; KC = RN['Kc']
TANZ = math.tan(math.radians(THZ))
MG = [abs(sd), abs(sd + 4), abs(sd + 6), abs(sd + ZC)]
A1 = 24 + KC; A0 = ZC * KC
cp = RN['c_poles']; cr = RN['c_r']
i1 = [i for i in range(3) if cp[i].imag > 1e-9][0]; i3 = [i for i in range(3) if abs(cp[i].imag) < 1e-9][0]
p1 = cp[i1]; r1 = cr[i1]; p3 = cp[i3].real; r3 = cr[i3].real
IC = RN['c_info']; KVC = RN['Kvc']; EC = RN['ec']
MEJ = E0 / EC
TSR = RI['ts'] / IC['ts']                            # cuántas veces más rápido (simulado)
TSMETA = RI['ts'] / 3
TPD = math.pi / WDD
SIGA = (-10 + ZC) / 2
er = RN['erfun']; eC2 = er(np.array([2.0]))[0]; eC10 = er(np.array([10.0]))[0]
K16 = RN['K16']; I16 = RN['K16info']; P16 = RN['K16poles']
p16 = [x for x in P16 if x.imag > 1e-9][0]; p16r = [x for x in P16 if abs(x.imag) < 1e-9][0].real
Z16 = -p16.real / abs(p16)
cs3 = lambda z: '%s%sj%s' % (f(z.real, 3), '+' if z.imag >= 0 else '-', f(abs(z.imag), 3))

out = []
add = out.extend
a1 = out.append

# =============== portada (sección 1) ===============
add(cover('Práctica 4: Compensador derivativo ideal (PD)'))
a1(resumen('En esta práctica se analizó el sistema tipo 1 con realimentación unitaria G(s) = K/[s(s + 4)(s + 6)] (Nise, ejemplo 9.3), '
           'que opera con 16 %% de sobrepaso (ζ = %.3f), y se le diseñó un compensador derivativo ideal (PD) para reducir tres veces su '
           'tiempo de asentamiento sin cambiar el sobrepaso. Con el lugar geométrico de las raíces (LGDR) y las condiciones de ángulo y '
           'magnitud se obtuvo la ganancia de referencia K = %.2f (s~{0} = −%.3f ± j%.3f, T~{s} = %.3f s). El nuevo punto de diseño '
           's~{d} = −%.3f ± j%.3f no pertenece al LGDR original: le faltan %.2f° que aporta el cero del PD en −%.3f, y con la condición de '
           'magnitud K = %.2f, es decir, G~{c}(s) = s + %.3f. La simulación del modelo completo en MATLAB dio T~{s} = %.3f s (%.2f veces menor) y '
           '%.2f %% de sobrepaso, menor que 16 %% por el tercer polo en −%.3f, parcialmente cancelado por el cero. Además, el error a rampa '
           'bajó de %.4f a %.4f.' % (Z, K0, SG, WD, TS2, SD, WDD, THZ, ZC, KC, ZC, IC['ts'], TSR, IC['os'], -p3, E0, EC)))
a1(keywords('Lugar geométrico de las raíces, Compensador derivativo ideal, Condición de ángulo, Tiempo de asentamiento, MATLAB'))
out.append('#SECT1')

# =============== cuerpo (dos columnas) ===============
a1(h1('I.', 'Identificación y referencia del ejercicio'))
a1(caption('Tabla 1: Identificación de la práctica'))
add(table([1500, 3300], ['Dato', 'Valor'], [['Práctica', '4 · Compensador derivativo ideal (PD)'],
                                            ['Ejercicio', 'Ejemplo 9.3, p. 515'],
                                            ['Libro', 'Nise, Sistemas de control para ingeniería (CECSA, 2006)'],
                                            ['Capítulo', '9. Diseño por medio del lugar geométrico de las raíces']], boldfirst=True))
a1(labeled('Objetivo.', 'Diseñar un compensador derivativo ideal (PD) que conserve el 16 % de sobrepaso del sistema y reduzca tres veces su '
           'tiempo de asentamiento, y comprobar con el modelo completo en MATLAB si se cumplen las especificaciones.'))
a1(labeled('Introducción.', 'Con sólo ajustar K los polos se mueven por el mismo LGDR: para conservar el sobrepaso hay que quedarse en la recta de ζ, '
           'y ahí el tiempo de asentamiento queda fijo. Para hacerlo más rápido, los polos dominantes deben ir más a la izquierda sobre la misma '
           'recta, en un punto que el LGDR original no toca. El compensador derivativo ideal G~{c}(s) = s + z~{c} agrega un cero que aporta el '
           'ángulo que falta para que el LGDR pase por ese punto; la condición de ángulo ubica el cero y la de magnitud da la nueva K. Su '
           'desventaja es que es activo (derivada pura) y amplifica el ruido de alta frecuencia.', g=True))

a1(h1('II.', 'Planteamiento, modelo, diagrama y especificaciones'))
a1(h2('1. Planteamiento'))
a1(problem('**Problema:** Dado el sistema de la figura 9.17, diseñar un compensador derivativo ideal para obtener un sobrepaso de 16%, '
           'con una reducción de umbral en el tiempo de asentamiento.'))
a1(para('La figura 9.17 del libro («Sistema de control realimentado para el ejemplo 9.3») es el diagrama de bloques del punto 3 (Figura 1). '
        'En el original en inglés se pide una reducción de tres veces (threefold) en el tiempo de asentamiento.'))
a1(h2('2. Modelo'))
a1(eq('G(s)=\\f{K}{s(s+4)(s+6)}'))
a1(eq('G_{c}(s)=s+z_{c},   H(s)=1'))
a1(para('Realimentación unitaria negativa; el compensador va en cascada con la planta y la ganancia K, antes de G(s). '
        'Con el compensador, el lazo abierto es $KG_{c}(s)G(s)=K(s+z_{c})/[s(s+4)(s+6)]$.'))
a1(h2('3. Diagrama de bloques'))
SL = code('''m = 'P4_PD';              % nombre del modelo
if bdIsLoaded(m), close_system(m,0); end
K  = @K@;                 % IV · d)
zc = @ZC@;                 % IV · c)
new_system(m); open_system(m)
L = 'simulink/';
add_block([L 'Sources/Step'],[m '/Step'], ...
  'Time','0','After','1')
add_block([L 'Math Operations/Sum'], ...
  [m '/Sum'],'Inputs','|+-')
add_block([L 'Math Operations/Gain'], ...
  [m '/K'],'Gain','K')
add_block([L 'Continuous/PID Controller'], ...
  [m '/PD'],'Controller','PD', ... % s + zc
  'P','zc','D','1','UseFilter','off')
add_block([L 'Continuous/Transfer Fcn'], ...
  [m '/G'],'Numerator','1', ...  % planta
  'Denominator','[1 10 24 0]')
add_block([L 'Sinks/Scope'],[m '/Scope'])
add_line(m,'Step/1','Sum/1')
add_line(m,'Sum/1','K/1')
add_line(m,'K/1','PD/1')
add_line(m,'PD/1','G/1')
add_line(m,'G/1','Scope/1')
add_line(m,'G/1','Sum/2')    % realimentación
Simulink.BlockDiagram.arrangeSystem(m)''', K=f(KC, 2), ZC=f(ZC, 4))
add(figbox('Diagrama de bloques del sistema en lazo cerrado (Simulink): Step → Sum (+ −) → Gain (K) → PID Controller en modo PD '
           '(P = z~{c}, D = 1, sin filtro, es decir, s + z~{c}) → G(s) → Scope.', '% Figura 1 · Modelo de Simulink con el PD\n' + SL))
a1(figcap('Figura 1: Diagrama de bloques del sistema en lazo cerrado (Simulink)'))
a1(h2('4. Especificaciones'))
a1(caption('Tabla 2: Especificaciones de diseño'))
add(table([1500, 1500, 1800], ['Especificación', 'Meta', 'Cómo se verifica'],
          [['Sobrepaso', '16 %% (ζ = %.3f)' % Z, 'Misma recta de ζ; %OS simulado'],
           ['Tiempo de asentamiento', '$T_{s}$/3 (tres veces menor)', 'σ tres veces mayor; $T_{s}$ simulado'],
           ['Estabilidad', 'Estable', 'Routh y polos del modelo completo'],
           ['Validez de la aproximación', 'Juzgar', 'Residuos de los modos']]))

# ---------------- III ----------------
a1(h1('III.', 'Análisis inicial y desempeño de referencia'))
a1(h2link('Paso 1. Ganancia de referencia (no asumir que es uno)', 'III1'))
a1(para('El enunciado da la ganancia de forma indirecta: el sistema opera con 16 %% de sobrepaso, es decir, con $ζ=%.4f$. La ganancia de '
        'referencia es la que coloca los polos dominantes sobre esa recta; se busca con la condición de ángulo (polos de $G(s)$ en $0$, $-4$ '
        'y $-6$) y se calcula con la de magnitud:' % Z))
a1(eq('ζ=\\f{-\\t{ln}(\\%OS/100)}{\\r{π^2+\\t{ln}^2(\\%OS/100)}},   θ=cos^{-1}ζ'))
a1(eq('-∑∠(s_0-p_i)=±180°'))
a1(eq('K=∏\\d{s_0-p_i}'))
a1(resultado())
a1(eq('ζ=%.4f,   θ=%.2f°,   s_0=-%.4f+j%.4f' % (Z, TH, SG, WD)))
a1(eq('K_{ref}=%.2f' % K0))
a1(para('Si se asumiera $K=1$, los polos en lazo cerrado serían $%.3f$, $%.3f$ y $%.3f$: todos reales, sin sobrepaso, es decir, otro sistema '
        'y no el del enunciado.' % (k1[2], k1[1], k1[0])))

a1(h2link('Paso 2. Polos, ceros, tipo y ecuación característica', 'III2'))
a1(caption('Tabla 3: Polos, ceros y tipo del sistema sin compensar'))
add(table([2259, 1412, 1129], ['Polos de lazo abierto', 'Ceros', 'Tipo'], [['$0, -4, -6$  ($n=3$)', '— ($m=0$)', '1']]))
a1(para('Ecuación característica $1+KG(s)=0$:'))
a1(eq('s^3+10s^2+24s+K=0'))
a1(resultado())
a1(eq('n=3,   m=0 ⇒ 3 \\t{ramas y }3 \\t{asíntotas}'))
a1(eq('\\t{LGDR en eje real: }[-4, 0] ∪ (-∞, -6]'))
a1(eq('σ_a=-3.333,   θ_a=60°, 180°, 300°'))
a1(eq('σ_b=%.4f,   K_b=%.2f' % (SB, KB_)))

a1(h2link('Paso 3. Estabilidad y rango de ganancia estable', 'III3'))
a1(caption('Tabla 4: Arreglo de Routh del sistema sin compensar'))
add(table([1200, 1200, 1200, 1200], ['Fila', 'Col. 1', 'Col. 2', 'Col. 3'],
          [['s^^{3}', '1', '24', '0'], ['s^^{2}', '10', '$K$', '0'], ['s^^{1}', '$\\f{240-K}{10}$', '0', '0'], ['s^^{0}', '$K$', '', '']]))
a1(eq('0<\\f{240-K}{10}  \\t{y}  0<K'))
a1(resultado())
a1(eq('0<K<240'))
a1(eq('K_{crít}=240,   s=±j4.899'))
a1(para('Con $K_{ref}=%.2f$ la fila $s^{1}$ vale $(240-%.2f)/10=%.2f>0$: el sistema de referencia es estable.' % (K0, K0, (240 - K0) / 10)))

a1(h2link('Paso 4. Polos en lazo cerrado con la ganancia de referencia', 'III4'))
a1(para('Con $K_{ref}=%.2f$, la ecuación característica del Paso 2 queda:' % K0))
a1(eq('s^3+10s^2+24s+%.2f=0' % K0))
a1(caption('Tabla 5: Polos en lazo cerrado de referencia'))
add(table([800, 1800, 2200], ['Polo', 'Valor', 'Observación'],
          [['p~{1}', '$-%.3f+j%.3f$' % (SG, WD), 'Par dominante sobre la recta de ζ = %.3f' % Z],
           ['p~{2}', '$-%.3f-j%.3f$' % (SG, WD), 'Conjugado de $p_1$'],
           ['p~{3}', '$%.3f$' % P3R, 'Real, a %.2fσ del eje (más de 5σ): la aproximación de 2.º orden es razonable' % (-P3R / SG)]]))
a1(resultado())
a1(eq('p_{1,2}=-%.3f±j%.3f,   p_3=%.3f' % (SG, WD, P3R)))
a1(eq('\\f{\\d{p_3}}{σ}=%.2f>5' % (-P3R / SG)))

a1(h2link('Paso 5. Respuesta transitoria y error estacionario', 'III5'))
a1(para('Del par $p_{1,2}=-σ±jω_d$ del Paso 4 se obtienen los parámetros de segundo orden; con ellos se estiman el transitorio y el error:'))
a1(eq('ω_n=\\r{σ^2+ω_d^2},   ζ=\\f{σ}{ω_n}'))
a1(eq('\\%OS=e^{-ζπ/\\r{1-ζ^2}}×100'))
a1(eq('T_s=\\f{4}{σ},   T_p=\\f{π}{ω_d}'))
a1(eq('T_r≈\\f{1.768ζ^3-0.417ζ^2+1.039ζ+1}{ω_n}'))
a1(eq('K_v=\\lim{s→0}{sKG(s)},   e_{rampa}(∞)=\\f{1}{K_v}'))
a1(resultado())
a1(eq('σ=%.4f,   ω_d=%.4f,   ω_n=%.4f  \\t{rad/s}' % (SG, WD, WN)))
a1(eq('ζ=%.4f,  \\%%OS=%.1f \\t{%%}' % (Z, OS2)))
a1(eq('T_s=%.3f  \\t{s},   T_p=%.3f  \\t{s},   T_r≈%.3f  \\t{s}' % (TS2, TP2, TR2)))
a1(eq('K_v=%.3f,   e_{rampa}(∞)=%.4f,   e_{esc}(∞)=0' % (Kv0, E0)))
a1(h2('Evidencia de la etapa'))
add(figbox('LGDR inicial (sistema sin compensar) con la recta de ζ y el punto s~{0}', code('''% Figura 2 · LGDR sin compensar y recta de zeta
s = tf('s');
G = 1/(s*(s+4)*(s+6));           % planta
zeta = -log(0.16)/sqrt(pi^2+log(0.16)^2);   % 0.5039
s0 = -@SG@ + @WD@i;              % III · Paso 1
figure
rlocus(G); grid on               % LGDR y rejilla
hold on
th = acos(zeta); r = [0 10];     % recta de zeta
plot(-r*cos(th), r*sin(th),'m--', ...
     -r*cos(th),-r*sin(th),'m--')
plot(real(s0)*[1 1],imag(s0)*[1 -1],'r*')
axis([-10 2 -8 8])
title('LGDR sin compensar (\\zeta = 0.504)')
hold off''', SG=f(SG), WD=f(WD))))
a1(figcap('Figura 2: LGDR inicial (sistema sin compensar) con la recta de ζ'))
add(figbox('Respuesta temporal de referencia al escalón (y salida de stepinfo)', code('''% Figura 3 · Respuesta de referencia
s = tf('s');
G = 1/(s*(s+4)*(s+6));
K = @K0@;                  % III · Paso 1
Tu = feedback(K*G, 1);      % lazo cerrado
figure
step(Tu, 6); grid on
title('Respuesta al escalón sin compensar')
info = stepinfo(Tu)         % %OS, Ts, Tp, Tr
p = pole(Tu)''', K0=f(K0, 2))))
a1(figcap('Figura 3: Respuesta temporal de referencia al escalón'))
a1(caption('Tabla 6: Desempeño de referencia'))
add(table([1600, 1600, 1600], ['Magnitud', 'Analítico (2.º orden)', 'Simulación (MATLAB)'],
          [['%OS (%)', f(OS2, 1), f(RI['os'], 2)], ['$T_{s}$ (s)', f(TS2, 3), f(RI['ts'], 3)], ['$T_{p}$ (s)', f(TP2, 3), f(RI['tp'], 3)],
           ['$T_{r}$ (s)', f(TR2, 3), f(RI['tr'], 3)], ['$K_{v}$', f(Kv0, 3), f(Kv0, 3)], ['$e_{rampa}(∞)$', f(E0, 4), f(RN['ref_e'], 4)]]))
a1(para('La simulación se hizo con el modelo completo y $K=%.2f$. Las diferencias no son de redondeo: el tercer polo $%.3f$ (residuo $%.4f$) '
        'resta un poco a la respuesta, así que el sobrepaso baja a %.2f %% y la respuesta se retrasa ($T_{s}=%.3f$ s y $T_{p}=%.3f$ s). '
        'El libro reporta, por simulación, 14.8 %%, 3.6 s y 1.7 s.' % (K0, P3R, r3R, RI['os'], RI['ts'], RI['tp'])))

# ---------------- IV ----------------
a1(h1('IV.', 'Desarrollo y justificación del diseño'))
a1(gray('Para reducir T~{s} tres veces con el mismo sobrepaso, los polos dominantes deben quedarse en la recta de ζ = %.3f pero tres veces más a la '
        'izquierda (σ tres veces mayor). Subir K no sirve: los polos se moverían por la misma rama y saldrían de la recta. Ese nuevo punto no '
        'pertenece al LGDR sin compensar, así que se calcula cuánto ángulo le falta, se coloca el cero del PD para aportarlo y se obtiene K con '
        'la condición de magnitud. Después se revisan la estabilidad, el tercer polo y el error.' % Z))
a1(h2link('a) Punto de diseño', 'IVa'))
a1(eq('T_{s,d}=\\f{T_s}{3},   σ_d=\\f{4}{T_{s,d}},   ω_d=σ_dtanθ'))
a1(resultado())
a1(eq('T_{s,d}=%.3f  \\t{s},   σ_d=%.4f' % (TSD, SD)))
a1(eq('s_d=-%.4f+j%.4f' % (SD, WDD)))
a1(para('Se usa el $T_{s}=4/σ=%.3f$ s del sistema de referencia, como el libro; así $σ_{d}=3σ$. El punto queda sobre la misma recta de ζ, con '
        '$ω_{n}=%.3f$ rad/s.' % (TS2, WND)))
a1(h2link('b) Ángulo faltante', 'IVb'))
a1(eq('∠G(s_d)=-[∠s_d+∠(s_d+4)+∠(s_d+6)]'))
a1(eq('θ_z=-180°-∠G(s_d)'))
a1(resultado())
a1(eq('∠G(s_d)=-(%.2f°+%.2f°+%.2f°)=%.2f°' % (ANG[0], ANG[1], ANG[2], ANGG)))
a1(eq('θ_z=%.2f°' % THZ))
a1(para('Como $∠G(s_{d})≠-180°$, el punto de diseño no está en el LGDR original; el cero del PD debe aportar $+%.2f°$ para que lo esté.' % THZ))
a1(h2link('c) Ubicación del cero', 'IVc'))
a1(eq('tanθ_z=\\f{ω_d}{z_c-σ_d}  ⇒  z_c=σ_d+\\f{ω_d}{tanθ_z}'))
a1(resultado())
a1(eq('tan(%.2f°)=%.3f' % (THZ, TANZ)))
a1(eq('z_c=%.4f  \\t{(libro: 3.006)}' % ZC))
a1(eq('G_c(s)=s+%.3f' % ZC))
a1(para('Como $θ_{z}>90°$, el cero queda a la derecha de $-σ_{d}$: en $-%.3f$, entre el polo en el origen y el polo en $-4$.' % ZC))
a1(h2link('d) Ganancia', 'IVd'))
a1(eq('K=\\f{\\d{s_d}\\d{s_d+4}\\d{s_d+6}}{\\d{s_d+z_c}}'))
a1(resultado())
a1(eq('K=\\f{(%.3f)(%.3f)(%.3f)}{%.3f}' % (MG[0], MG[1], MG[2], MG[3])))
a1(eq('K=%.2f' % KC))
a1(para('Es apenas %.1f %% mayor que $K_{ref}=%.2f$: el cambio grande lo hace el cero, no la ganancia.' % ((KC - K0) / K0 * 100, K0)))
a1(h2link('e) Nueva ecuación y estabilidad', 'IVe'))
a1(eq('1+K(s+z_c)G(s)=0'))
a1(resultado())
a1(eq('s^3+10s^2+(24+K)s+%.3fK=0' % ZC))
a1(eq('0<K<∞'))
a1(eq('p_3=-10+2σ_d=%.3f' % p3))
a1(eq('σ_a=%.3f,   θ_a=90°, 270°' % SIGA))
a1(para('Con el cero, el LGDR tiene dos asíntotas verticales y ya no cruza el eje $jω$: el sistema es estable para toda $K>0$ (antes sólo para '
        '$K<240$). El tercer polo queda en $%.3f$, a $%.3f$ del cero en $-%.3f$.' % (p3, ZC + p3, ZC)))
add(figbox('LGDR sin compensar y con PD sobre la recta ζ = 0.504 (con el punto de diseño s~{d})', code('''% Figura 4 · LGDR sin compensar y con PD
s = tf('s');
G  = 1/(s*(s+4)*(s+6));
zc = @ZC@;
Gc = s + zc;                    % PD ideal
zeta = -log(0.16)/sqrt(pi^2+log(0.16)^2);
sd = -@SD@ + @WD@i;          % IV · a)
th = acos(zeta); r = [0 12];    % recta de zeta
figure
rlocus(G, Gc*G); grid on
hold on
plot(-r*cos(th), r*sin(th),'m--', ...
     -r*cos(th),-r*sin(th),'m--')
plot(real(sd)*[1 1],imag(sd)*[1 -1],'r*')
axis([-12 2 -10 10])
legend('sin compensar','con PD')
title('LGDR con el compensador PD')
hold off''', ZC=f(ZC), SD=f(SD), WD=f(WDD))))
a1(figcap('Figura 4: LGDR sin compensar y con PD sobre la recta ζ = 0.504'))
a1(h2link('f) Efecto en el error', 'IVf'))
a1(eq('K_v=\\lim{s→0}{sK(s+z_c)G(s)}=\\f{Kz_c}{24},   e_{rampa}(∞)=\\f{1}{K_v}'))
a1(resultado())
a1(eq('K_v=%.3f,   e_{rampa}(∞)=%.4f' % (KVC, EC)))
a1(para('El error a rampa no se pidió, pero mejoró %.2f veces (antes $%.4f$): el cero en $s=-z_{c}$ multiplica la ganancia en baja frecuencia.' % (MEJ, E0)))

# ---------------- V ----------------
a1(h1('V.', 'Controlador final y parámetros'))
a1(eq('G_c(s)=s+%.3f' % ZC))
a1(eq('K(s+z_c)=K_Ds+K_P'))
a1(caption('Tabla 7: Parámetros del controlador final'))
add(table([2400, 2400], ['Parámetro', 'Valor obtenido'],
          [['$z_{c}$ (IV · c)', '%.3f (cero en −%.3f)' % (ZC, ZC)], ['K (IV · d)', f(KC, 2)],
           ['$K_{D}$ = K', f(KC, 2)], ['$K_{P}$ = K·$z_{c}$', f(KC * ZC, 1)],
           ['Punto de diseño $s_{d}$', '$-%.3f±j%.3f$' % (SD, WDD)], ['ζ de diseño', '%.4f (θ = %.2f°)' % (Z, TH)]]))
a1(para('El cero se obtuvo con la condición de ángulo y K con la de magnitud; la verificación (VI y VII) no requirió ajuste. El PD ideal tiene un '
        'cero y ningún polo, así que es impropio: en Simulink no cabe en un Transfer Fcn y se usa el bloque PID Controller en modo PD con '
        '$P=z_{c}$, $D=1$ y sin filtro, después del Gain K (Figura 1).'))

# ---------------- VI ----------------
a1(h1('VI.', 'Comprobación analítica'))
a1(h2link('Paso 1. Ecuación característica final y todos los polos en lazo cerrado', 'VI1'))
a1(para('$1+KG_{c}(s)G(s)=0$ con $G_{c}(s)=s+%.3f$:' % ZC))
a1(eq('s^3+10s^2+(24+K)s+%.3fK=0' % ZC))
a1(eq('K=%.2f:   s^3+10s^2+%.2fs+%.2f=0' % (KC, A1, A0)))
a1(caption('Tabla 8: Polos en lazo cerrado del sistema compensado'))
add(table([800, 1800, 2200], ['Polo', 'Valor', 'Observación'],
          [['p~{1}', '$%s$' % cs3(p1), 'Dominante (= $s_{d}$)'], ['p~{2}', '$%s$' % cs3(p1.conjugate()), 'Dominante (conjugado)'],
           ['p~{3}', '$%.3f$' % p3, 'Real, a %.3f del cero $-%.3f$ (cancelación parcial)' % (ZC + p3, ZC)]]))
a1(resultado())
a1(eq('p_{1,2}=-%.3f±j%.3f,   p_3=%.3f' % (-p1.real, p1.imag, p3)))
a1(para('Todas las raíces tienen parte real negativa. No se descarta ningún modo: el orden en lazo cerrado (3) es el de la planta, porque el PD no '
        'agrega polos.'))
a1(h2link('Paso 2. Estabilidad y comparación con los polos candidatos', 'VI2'))
B1 = (10 * A1 - A0) / 10
a1(caption('Tabla 9: Arreglo de Routh del sistema compensado'))
add(table([1200, 1200, 1200, 1200], ['Fila', 'Col. 1', 'Col. 2', 'Col. 3'],
          [['s^^{3}', '1', f(A1, 2), '0'], ['s^^{2}', '10', f(A0, 2), '0'], ['s^^{1}', f(B1, 2), '0', '0'], ['s^^{0}', f(A0, 2), '', '']]))
a1(para('Con $K=%.2f$ la primera columna es toda positiva; como no hay cambios de signo, el sistema es estable.' % KC))
a1(caption('Tabla 10: Polos candidatos (diseño) contra polos obtenidos'))
difP = abs(p1 - sd) / abs(sd) * 100; difT = abs(p3 - (-10 + 2 * SD)) / abs(p3) * 100
add(table([1200, 1400, 1400, 800], ['Polos', 'Candidato', 'Obtenido', 'Dif. (%)'],
          [['Par dominante', '$-%.3f$\n$±j%.3f$\n($s_{d}$, IV · a)' % (SD, WDD), '$%.3f$\n$±j%.3f$' % (p1.real, p1.imag), f(difP, 1)],
           ['Tercer polo', '$%.3f$\n(IV · e)' % (-10 + 2 * SD), '$%.3f$' % p3, f(difT, 1)]]))
a1(resultado())
a1(eq('0<K<∞   \\t{(no hay }K_{crít}\\t{; antes }0<K<240\\t{)}'))
a1(eq('\\t{Dif. del par dominante}=%.1f \\t{%%}' % difP))
a1(para('El par dominante cae exactamente en el punto de diseño porque K se calculó con la condición de magnitud en $s_{d}$.'))
a1(h2link('Paso 3. ¿Es razonable la aproximación de polos dominantes?', 'VI3'))
a1(caption('Tabla 11: Modos del sistema y residuos al escalón'))
add(table([1550, 1850, 1400], ['Polo', 'Residuo', 'Lectura'],
          [['$-%.3f$\n$±j%.3f$' % (-p1.real, p1.imag), '$%.4f$\n$±j%.4f$\n(|r| = %.4f c/u)' % (r1.real, r1.imag, abs(r1)), 'Dominante'],
           ['$%.3f$' % p3, '$%.4f$' % r3, 'Cancelación parcial con el cero $-%.3f$ (%.0f %% del dominante)' % (ZC, abs(r3) / abs(r1) * 100)],
           ['0 (escalón)', '1.000', 'Valor final c(∞)']]))
a1(blue('✎ Residuos en MATLAB: [num,den] = tfdata(Tc,\'v\'); [r,pp] = residue(num, conv(den,[1 0])).'))
a1(eq('r_i=\\f{N_T(p_i)}{p_iD_T\'(p_i)}'))
a1(resultado())
a1(eq('r_0=1,  \\d{r_{1,2}}=%.4f,   r_3=%.4f' % (abs(r1), r3)))
a1(para('Conclusión: por distancia, el tercer polo no se puede despreciar: está más cerca del eje que el par dominante ($%.2fσ_{d}$). Lo que lo '
        'vuelve poco importante es el cero en $-%.3f$, que lo cancela en parte: su residuo pesa %.0f %% de cada modo dominante. Como el residuo '
        'es negativo, ese modo resta al pico: el sobrepaso real será menor que 16 %%. La aproximación sirve para el diseño, pero el desempeño se '
        'verifica con el modelo completo.' % (-p3 / SD, ZC, abs(r3) / abs(r1) * 100)))
a1(h2link('Paso 4. Error estacionario correspondiente (analítico)', 'VI4'))
a1(eq('K_p=\\lim{s→0}{KG_c(s)G(s)}=∞'))
a1(eq('K_v=\\lim{s→0}{sKG_c(s)G(s)}'))
a1(eq('e_{esc}(∞)=\\f{1}{1+K_p},   e_{rampa}(∞)=\\f{1}{K_v}'))
a1(resultado())
a1(eq('e_{esc}(∞)=0,   K_v=%.3f,   e_{rampa}(∞)=%.4f' % (KVC, EC)))
a1(para('El sistema sigue siendo tipo 1 (el PD no agrega polos en el origen): error cero al escalón y error a rampa %.2f veces menor que sin compensar.' % MEJ))
a1(advert())

# ---------------- VII ----------------
a1(h1('VII.', 'Comprobación en MATLAB'))
a1(italic('Pasos 5, 6 y 7 de la verificación del sistema completo, con el modelo completo (sin simplificar polos).'))
a1(h2link('Paso 5. Simulación de las entradas requeridas y desempeño del modelo completo', 'VII5'))
a1(para('Entradas simuladas: escalón unitario (sobrepaso y tiempo de asentamiento, que es lo que se pide) y rampa unitaria (error, como dato), '
        'sin compensar y con PD.'))
add(figbox('Respuesta al escalón sin compensar vs. con PD', code('''% Figura 5 · Escalón: sin compensar vs. PD
s = tf('s');
G  = 1/(s*(s+4)*(s+6));
Gc = s + @ZC@;                % PD ideal
Tu = feedback(@K0@*G, 1);      % sin compensar
Tc = feedback(@KC@*Gc*G, 1);   % con PD
figure
step(Tu, Tc, 6); grid on
legend('sin compensar','con PD')
title('Respuesta al escalón unitario')''', ZC=f(ZC), K0=f(K0, 2), KC=f(KC, 2))))
a1(figcap('Figura 5: Respuesta al escalón sin compensar vs. con PD'))
add(figbox('Salida de pole(Tc), zero(Tc), stepinfo y residuos en la Command Window (captura)', code('''% Figura 6 · Command Window
s = tf('s');
G  = 1/(s*(s+4)*(s+6));
Gc = s + @ZC@;
K = @K0@;  Kc = @KC@;
Tu = feedback(K*G, 1);
Tc = feedback(Kc*Gc*G, 1);
pole(Tc)
zero(Tc)
stepinfo(Tu)
stepinfo(Tc)
[num,den] = tfdata(Tc,'v');
[r,pp] = residue(num, conv(den,[1 0]))
Kv_c = dcgain(minreal(s*Kc*Gc*G))''', ZC=f(ZC), K0=f(K0, 2), KC=f(KC, 2))))
a1(figcap('Figura 6: Salida de pole(Tc), zero(Tc), stepinfo y residuos en la Command Window (captura)'))
a1(caption('Tabla 12: Especificaciones contra desempeño simulado'))
add(table([1350, 1150, 1250, 1050], ['Especificación', 'Meta', 'Obtenido', '¿Cumple?'],
          [['%OS', '16 %', '%.2f %%' % IC['os'], 'Sí, con menos sobrepaso (%.1f puntos)' % (IC['os'] - 16)],
           ['$T_{s}$', '≤ %.3f/3 = %.3f s' % (RI['ts'], TSMETA), '%.3f s (×%.2f)' % (IC['ts'], TSR), 'Sí'],
           ['Estabilidad', 'Estable', 'Polos con parte real < 0', 'Sí'],
           ['$T_{p}$ (dato)', '—', '%.3f s → %.3f s' % (RI['tp'], IC['tp']), 'No se pide'],
           ['$e_{rampa}(∞)$ (dato)', '—', '%.4f → %.4f' % (E0, EC), 'No se pide (mejora ×%.2f)' % MEJ]]))
a1(eq('\\%OS=\\f{c_{máx}-c(∞)}{c(∞)}×100'))
a1(resultado())
a1(eq('t_p=%.3f  \\t{s},   c_{máx}=%.4f,   c(∞)=1' % (IC['tp'], IC['pk'])))
a1(eq('\\%%OS_{sim}=%.2f \\t{%%},   T_s=%.3f  \\t{s}  (K=%.2f)' % (IC['os'], IC['ts'], KC)))
a1(eq('\\f{T_{s,u}}{T_{s,c}}=\\f{%.3f}{%.3f}=%.2f' % (RI['ts'], IC['ts'], TSR)))
a1(para('El tiempo de asentamiento bajó %.2f veces con el modelo completo. El sobrepaso quedó en %.2f %%, menor que el 16 %% de diseño, por el '
        'modo del tercer polo $%.3f$ (residuo negativo, VI · Paso 3); el libro obtiene lo mismo en su simulación (11.8 %% y 1.2 s).' % (TSR, IC['os'], p3)))
a1(h2link('Paso 6. Error estacionario simulado', 'VII6'))
add(figbox('Error ante rampa e(t) = t − c(t): sin compensar vs. con PD', code('''% Figura 7 · Error a rampa: sin compensar vs. PD
s = tf('s');
G  = 1/(s*(s+4)*(s+6));
Gc = s + @ZC@;
Tu = feedback(@K0@*G, 1);
Tc = feedback(@KC@*Gc*G, 1);
t = 0:0.001:10;
cu = lsim(Tu, t, t);  cc = lsim(Tc, t, t);
figure
plot(t, t' - cu, t, t' - cc); grid on
ylim([0 0.7])
xlabel('t (s)'); ylabel('e(t) = t - c(t)')
legend('sin compensar','con PD')
title('Error ante rampa unitaria')
e_u = t(end) - cu(end)
e_c = t(end) - cc(end)''', ZC=f(ZC), K0=f(K0, 2), KC=f(KC, 2))))
a1(figcap('Figura 7: Error ante rampa e(t) = t − c(t): sin compensar vs. con PD'))
a1(eq('e_{sim}(∞)=\\lim{t→∞}{[t-c(t)]}'))
a1(resultado())
a1(eq('e_{sim}(10 \\t{ s})=%.4f ✓  \\t{(igual al analítico)}' % eC10))
a1(eq('\\t{Sin compensar: }e_{sim}(∞)=%.4f' % RN['ref_e']))
a1(para('Con el PD todos los modos son rápidos, así que el error llega casi de inmediato a su valor final: a los 2 s ya vale $%.4f$.' % eC2))
a1(h2link('Paso 7. Ajuste del diseño y repetición de la verificación', 'VII7'))
a1(para('No hizo falta ajustar: $T_{s}$ cumple (×%.2f) y el sobrepaso (%.2f %%) es menor que el pedido, lo que se acepta porque el sistema queda '
        'más amortiguado; el libro acepta el diseño por la misma razón. Como comprobación, se buscó con el mismo cero la K que daría exactamente '
        '16 %% en el modelo completo:' % (TSR, IC['os'])))
a1(eq('\\%%OS_{sim}(K)=16 \\t{%%}  \\t{(bisección con }z_c=%.3f\\t{)}' % ZC))
a1(resultado())
a1(eq('K=%.2f:   \\%%OS=%.2f \\t{%%},   T_s=%.3f  \\t{s}' % (K16, I16['os'], I16['ts'])))
a1(eq('p_{1,2}=%s,   p_3=%.3f,   ζ=%.3f' % ('%.3f±j%.3f' % (p16.real, p16.imag), p16r, Z16)))
a1(para('Esa K también cumple $T_{s}$, pero saca a los polos dominantes de la recta de diseño (ζ = %.3f). Se conserva el diseño $K=%.2f$, '
        '$z_{c}=%.3f$, que cumple las dos especificaciones con los polos exactamente en $s_{d}$.' % (Z16, KC, ZC)))
a1(h2('Modelo en Simulink'))
add(figbox('Respuesta en el Scope de Simulink del sistema final (pega también la captura del modelo)',
           '% Figura 8 · Scope de Simulink (sistema final)\n' + SL + "\nset_param(m,'StopTime','3')\nopen_system([m '/Scope'])\nsim(m);                      % corre 3 s"))
a1(figcap('Figura 8: Respuesta en el Scope de Simulink del sistema final'))

# ---------------- VIII ----------------
a1(h1('VIII.', 'Comparación y discusión'))
a1(caption('Tabla 13: Comparación: libro, cálculo analítico y MATLAB'))
add(table([1400, 1150, 1150, 1100], ['Magnitud', 'Libro', 'Analítico', 'MATLAB'],
          [['%OS sin compensar', '16 (sim. 14.8)', f(OS2, 1), f(RI['os'], 2)],
           ['$T_{s}$ sin compensar (s)', '3.320 (sim. 3.6)', f(TS2, 3), f(RI['ts'], 3)],
           ['$T_{p}$ sin compensar (s)', '1.522 (sim. 1.7)', f(TP2, 3), f(RI['tp'], 3)],
           ['Cero del PD', '−3.006', '−%.3f' % ZC, '—'],
           ['%OS con PD', '16 (sim. 11.8)', f(OS2, 1), f(IC['os'], 2)],
           ['$T_{s}$ con PD (s)', '1.107 (sim. 1.2)', f(TSD, 3), f(IC['ts'], 3)],
           ['$T_{p}$ con PD (s)', '0.507 (sim. 0.5)', f(TPD, 3), f(IC['tp'], 3)],
           ['$e_{rampa}$ con PD', '0.168', f(EC, 4), f(eC10, 4)]]))
a1(gray('Los valores analíticos coinciden con la tabla 9.3 del libro (cero en −3.006; aquí −%.3f, por redondeo de σ y ω~{d}), y las '
        'simulaciones coinciden con las del libro. Las diferencias entre «Analítico» y «MATLAB» no son de redondeo: el análisis de segundo orden '
        'ignora el tercer polo. Sin compensar, ese polo está a %.2fσ y sólo baja un poco el sobrepaso (%.2f %%) y retrasa la respuesta. Con el PD, '
        'el tercer polo −%.3f queda más cerca del eje que el par dominante y no se cancela del todo con el cero en −%.3f (residuo −%.4f): deja el '
        'sobrepaso en %.2f %% y no en 16 %%. Se cumplió la especificación importante (T~{s} %.2f veces menor) y, como efecto extra, el error a '
        'rampa mejoró %.2f veces sin haberlo pedido.' % (ZC, -P3R / SG, RI['os'], -p3, ZC, -r3, IC['os'], TSR, MEJ)))

# ---------------- IX ----------------
a1(h1('IX.', 'Conclusiones y limitaciones demostradas'))
a1(gray('Un cero bien ubicado aporta el ángulo que le falta al punto de diseño (%.2f°) y desplaza el LGDR hasta él: con G~{c}(s) = s + %.3f y '
        'K = %.2f los polos dominantes quedaron exactamente en s~{d} = −%.3f ± j%.3f y T~{s} bajó de %.3f s a %.3f s.' % (THZ, ZC, KC, SD, WDD, RI['ts'], IC['ts'])))
a1(gray('El cero también cambió la forma del LGDR: con dos asíntotas verticales el sistema quedó estable para cualquier K (antes sólo para K < 240) '
        'y el error a rampa bajó de %.4f a %.4f.' % (E0, EC)))
a1(gray('Se demostraron dos limitaciones: el tercer polo −%.3f no queda lejos del eje y sólo se cancela en parte con el cero, por lo que el '
        'sobrepaso real fue %.2f %% y no 16 %%; y el PD ideal es activo y amplifica el ruido de alta frecuencia (su ganancia crece con ω), así '
        'que en la práctica se le agrega un filtro o se usa un compensador de adelanto.' % (-p3, IC['os'])))
a1(h2('Conclusión individual'))
a1(gray('En esta práctica aprendí que, para hacer más rápida la respuesta sin cambiar el sobrepaso, no basta con mover K: hay que llevar los polos '
        'dominantes a un punto que el LGDR original no toca, y eso se logra agregando un cero. Lo más interesante fue ver que el ángulo que le '
        'faltaba al punto de diseño (%.2f°) dice exactamente dónde poner el cero, con una simple construcción geométrica.' % THZ))
a1(gray('Me pareció importante revisar los residuos: el tercer polo está más cerca del eje que el par dominante y, por distancia, la aproximación '
        'de segundo orden no sería válida; lo que la salva es que el cero en −%.3f lo cancela en parte (residuo −%.4f). Por eso el sobrepaso '
        'simulado salió de %.2f %% y no de 16 %%.' % (ZC, -r3, IC['os'])))
a1(gray('Con MATLAB comprobé que T~{s} bajó %.2f veces y que el sistema quedó estable para cualquier K. Concluyo que el PD es la forma más '
        'directa de mejorar la respuesta transitoria, siempre que se acepte su sensibilidad al ruido.' % TSR))
out.append('#SECT2')
