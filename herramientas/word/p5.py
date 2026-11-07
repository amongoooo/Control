# Contenido de la Práctica 5 (adelanto de fase, Nise ejercicio 9.2) con el formato de la P1–P4 (v45/v47/v56).
import math, cmath
import numpy as np
import build
from build import *
import num5
RN = num5.R


def f(x, d=4):
    return ('%.' + str(d) + 'f') % x


def code(src, **k):
    """código MATLAB con marcas @x@ (evita los %% de Python)"""
    for a, b in k.items():
        src = src.replace('@' + a + '@', b)
    assert '@' not in src, src
    return src


# ---------- incisos del problema con «→ respuesta» y títulos con «↑ inciso» (v51) ----------
def link(anchor, text):
    return ('<w:hyperlink w:anchor="%s" w:history="1"><w:r><w:rPr><w:rStyle w:val="Hipervnculo"/><w:b w:val="0"/><w:bCs w:val="0"/>'
            '<w:sz w:val="18"/><w:szCs w:val="18"/></w:rPr>' % anchor + T(text) + '</w:r></w:hyperlink>')


def inciso(letter, s, key, ans):
    build.BM[0] += 1; i = build.BM[0]
    return P('<w:spacing w:after="80"/><w:ind w:left="240"/><w:jc w:val="both"/>',
             '<w:bookmarkStart w:id="%d" w:name="%s_q_%s"/>' % (i, build.PRE[0], letter) + rich(letter + ') ' + s) + R('  ') +
             link('%s_r_%s' % (build.PRE[0], key), '→ respuesta: ' + ans) + '<w:bookmarkEnd w:id="%d"/>' % i)


def h2q(t, key, letter):
    """título con «→ cálculos» y «↑ inciso x)»"""
    x = h2link(t, key)
    j = x.rindex('<w:bookmarkEnd')
    return x[:j] + R('  ') + link('%s_q_%s' % (build.PRE[0], letter), '↑ inciso %s)' % letter) + x[j:]


deg = math.degrees
Z = RN['zeta']; TH = RN['th']; TN = RN['tan']
SG = RN['sig0']; s0 = RN['s0']; WD = RN['wd0']; K0 = RN['K0']; WN = RN['wn0']
Kv0 = RN['Kv0']; E0 = RN['e0']; RI = RN['ref_info']
OS2 = math.exp(-Z * math.pi / math.sqrt(1 - Z * Z)) * 100
TS2 = 4 / SG; TP2 = math.pi / WD
TRn = 1.768 * Z ** 3 - 0.417 * Z ** 2 + 1.039 * Z + 1; TR2 = TRn / WN
k1 = sorted(RN['K1poles'])
r1R = RN['ref_r'][0]
TSD = RN['Tsd']; SD = RN['sgd']
ZL = num5.ZL
# diseño del libro (B) y ajustado (A)
B = RN['B']; A = RN['A']; BC = RN['BC']; AC = RN['AC']
WDD = B['wd']; sd = B['sd']; WND = abs(sd); ANG = B['angs']; ANGZ = B['angz']; ANGG = B['angG']; THP = B['thp']
PC = B['pc']; KC = B['K']; TANP = math.tan(math.radians(THP))
MG = [abs(sd), abs(sd + 7), abs(sd + PC), abs(sd + ZL)]


def split(C):
    p = C['poles']; r = C['r']
    i1 = [i for i in range(3) if p[i].imag > 1e-9][0]; i3 = [i for i in range(3) if abs(p[i].imag) < 1e-9][0]
    return p[i1], r[i1], p[i3].real, r[i3].real


p1, r1, p3, r3 = split(BC)
q1, s1, q3, s3 = split(AC)
IB = BC['info']; IA = AC['info']
KVB = BC['Kv']; EB = BC['ec']; KVA = AC['Kv']; EA = AC['ec']
TSMETA = TS2 / 3
A2B = 7 + PC; A1B = 7 * PC + KC; A0B = ZL * KC
A2A = 7 + A['pc']; A1A = 7 * A['pc'] + A['K']; A0A = ZL * A['K']
B1B = (A2B * A1B - A0B) / A2B; B1A = (A2A * A1A - A0A) / A2A
SIGA = (-7 - PC + ZL) / 2
TSRB = RI['ts'] / IB['ts']; TSRA = RI['ts'] / IA['ts']
eB = BC['er']; eA = AC['er']
ZD = A['zd']; WDA = A['wd']; sdA = A['sd']; PCA = A['pc']; KA = A['K']
TESTS = RN['tests']
cs3 = lambda z: '%s%sj%s' % (f(z.real, 3), '+' if z.imag >= 0 else '-', f(abs(z.imag), 3))

out = []
add = out.extend
a1 = out.append

# =============== portada (sección 1) ===============
add(cover('Práctica 5: Compensador de adelanto de fase'))
a1(resumen('En esta práctica se analizó el sistema tipo 1 con realimentación unitaria G(s) = K/[s(s + 7)] (Nise, ejercicio 9.2), que opera '
           'con 15 %% de sobrepaso (ζ = %.3f), y se le diseñó un compensador de adelanto de fase con el cero en −10 para reducir tres veces su '
           'tiempo de asentamiento. Con el lugar geométrico de las raíces (LGDR) se obtuvo la referencia K = %.2f (s~{0} = −3.5 ± j%.3f), con '
           'T~{s} = %.3f s. En el punto de diseño s~{d} = −%.1f ± j%.3f la condición de ángulo ubicó el polo del compensador en −%.2f y la de '
           'magnitud dio K = %.1f, como en el libro. La simulación del modelo completo en MATLAB mostró que ese diseño no cumple: el tercer polo '
           'en −%.2f no se cancela con el cero y el sobrepaso sube a %.2f %%. Se ajustó el ζ de diseño (ζ~{d} = %.4f) con el mismo σ y el mismo '
           'cero: G~{c}(s) = (s + 10)/(s + %.2f) y K = %.1f dan %.2f %% de sobrepaso y T~{s} = %.3f s, que cumplen las dos especificaciones.'
           % (Z, K0, WD, TS2, SD, WDD, PC, KC, -p3, IB['os'], ZD, PCA, KA, IA['os'], IA['ts'])))
a1(keywords('Lugar geométrico de las raíces, Compensador de adelanto de fase, Condición de ángulo, Tiempo de asentamiento, MATLAB'))
out.append('#SECT1')

# =============== cuerpo (dos columnas) ===============
a1(h1('I.', 'Identificación y referencia del ejercicio'))
a1(caption('Tabla 1: Identificación de la práctica'))
add(table([1500, 3300], ['Dato', 'Valor'], [['Práctica', '5 · Compensador de adelanto de fase'],
                                            ['Ejercicio', 'Ejercicio de evaluación de destreza 9.2, p. 526'],
                                            ['Libro', 'Nise, Sistemas de control para ingeniería (CECSA, 2006)'],
                                            ['Capítulo', '9. Diseño por medio del lugar geométrico de las raíces']], boldfirst=True))
a1(labeled('Objetivo.', 'Evaluar el tiempo de asentamiento del sistema con 15 % de sobrepaso, diseñar un compensador de adelanto de fase con el '
           'cero en −10 que lo reduzca tres veces y comprobar con el modelo completo en MATLAB si se cumplen las especificaciones.'))
a1(labeled('Introducción.', 'En un sistema de segundo orden como éste, la parte real de los polos en lazo cerrado no depende de K: el tiempo de '
           'asentamiento no se puede mejorar sólo con la ganancia. Para llevar los polos dominantes más a la izquierda sobre la misma recta de ζ '
           'hay que cambiar la forma del LGDR. El compensador de adelanto G~{c}(s) = (s + z~{c})/(s + p~{c}), con el polo a la izquierda del cero, '
           'aporta un ángulo positivo neto, como el PD, pero es pasivo: no amplifica sin límite el ruido de alta frecuencia. Con el cero fijo, la '
           'condición de ángulo ubica el polo y la de magnitud da K.', g=True))

a1(h1('II.', 'Planteamiento, modelo, diagrama y especificaciones'))
a1(h2('1. Planteamiento'))
a1(problem('**Problema:** Un sistema con realimentación unitaria con una función de transferencia en la trayectoria directa,'))
a1(eq('G(s)=\\f{K}{s(s+7)}'))
a1(problem('está operando con una respuesta escalón en lazo cerrado que tiene 15% de sobrepaso. Haga lo siguiente:'))
a1(inciso('a', 'Evalúe el tiempo de asentamiento.', 'III5', 'III · Paso 5 · Tₛ = %.3f s' % TS2))
a1(inciso('b', 'Diseñe un compensador de adelanto de fase para reducir el tiempo de asentamiento en un factor de tres. Seleccione el cero del '
          'compensador que se encuentra en −10.', 'IVd', 'IV · d) · (s + 10)/(s + %.2f), K = %.1f' % (PC, KC)))
a1(para('Es un ejercicio de evaluación de destreza: el libro no trae figura; el diagrama de bloques del punto 3 (Figura 1) se armó con la función '
        'de transferencia del enunciado.'))
a1(h2('2. Modelo'))
a1(eq('G(s)=\\f{K}{s(s+7)}'))
a1(eq('G_{c}(s)=\\f{s+z_{c}}{s+p_{c}},   z_{c}=10,   H(s)=1'))
a1(para('Realimentación unitaria negativa; el compensador va en cascada con la ganancia K y la planta. Con el compensador, el lazo abierto es '
        '$KG_{c}(s)G(s)=K(s+10)/[s(s+7)(s+p_{c})]$.'))
a1(h2('3. Diagrama de bloques'))
SL = code('''m = 'P5_adelanto';         % nombre del modelo
if bdIsLoaded(m), close_system(m,0); end
K  = @K@;                 % VII · Paso 7 (ajustado)
zc = 10;                     % cero impuesto
pc = @PC@;                % VII · Paso 7 (ajustado)
new_system(m); open_system(m)
L = 'simulink/';
add_block([L 'Sources/Step'],[m '/Step'], ...
  'Time','0','After','1')
add_block([L 'Math Operations/Sum'], ...
  [m '/Sum'],'Inputs','|+-')
add_block([L 'Math Operations/Gain'], ...
  [m '/K'],'Gain','K')
add_block([L 'Continuous/Transfer Fcn'], ...
  [m '/Gc'],'Numerator','[1 zc]', ... % adelanto
  'Denominator','[1 pc]')
add_block([L 'Continuous/Transfer Fcn'], ...
  [m '/G'],'Numerator','1', ...  % planta
  'Denominator','[1 7 0]')
add_block([L 'Sinks/Scope'],[m '/Scope'])
add_line(m,'Step/1','Sum/1')
add_line(m,'Sum/1','K/1')
add_line(m,'K/1','Gc/1')
add_line(m,'Gc/1','G/1')
add_line(m,'G/1','Scope/1')
add_line(m,'G/1','Sum/2')    % realimentación
Simulink.BlockDiagram.arrangeSystem(m)''', K=f(KA, 2), PC=f(PCA, 4))
add(figbox('Diagrama de bloques del sistema en lazo cerrado (Simulink): Step → Sum (+ −) → Gain (K) → Transfer Fcn del adelanto '
           '(s + 10)/(s + p~{c}) → Transfer Fcn de la planta 1/[s(s + 7)] → Scope.', '% Figura 1 · Modelo de Simulink con el adelanto\n' + SL))
a1(figcap('Figura 1: Diagrama de bloques del sistema en lazo cerrado (Simulink)'))
a1(h2('4. Especificaciones'))
a1(caption('Tabla 2: Especificaciones de diseño'))
add(table([1500, 1500, 1800], ['Especificación', 'Meta', 'Cómo se verifica'],
          [['Sobrepaso', '15 %% (ζ = %.3f)' % Z, 'Misma recta de ζ; %OS simulado'],
           ['Tiempo de asentamiento', '$T_{s}$/3 (tres veces menor)', 'σ tres veces mayor; $T_{s}$ simulado'],
           ['Cero del compensador', 'Impuesto en −10', 'El polo $p_{c}$ se calcula'],
           ['Estabilidad', 'Estable', 'Routh y polos del modelo completo'],
           ['Validez de la aproximación', 'Juzgar', 'Residuos de los modos']]))

# ---------------- III ----------------
a1(h1('III.', 'Análisis inicial y desempeño de referencia'))
a1(h2link('Paso 1. Ganancia de referencia (no asumir que es uno)', 'III1'))
a1(para('El enunciado da la ganancia de forma indirecta: el sistema opera con 15 %% de sobrepaso, es decir, con $ζ=%.4f$. La ganancia de '
        'referencia es la que coloca los polos en lazo cerrado sobre esa recta. Como la planta es de segundo orden, su ecuación característica '
        '$s^2+7s+K=0$ fija la parte real de los polos complejos en $σ=7/2=3.5$ para cualquier K; con la recta de ζ se obtiene $ω_{d}$ y con '
        'la condición de magnitud, K:' % Z))
a1(eq('ζ=\\f{-\\t{ln}(\\%OS/100)}{\\r{π^2+\\t{ln}^2(\\%OS/100)}},   θ=cos^{-1}ζ'))
a1(eq('ω_d=σtanθ,   K=∏\\d{s_0-p_i}'))
a1(resultado())
a1(eq('ζ=%.4f,   θ=%.2f°,   s_0=-%.1f+j%.4f' % (Z, TH, SG, WD)))
a1(eq('K_{ref}=%.2f' % K0))
a1(para('Si se asumiera $K=1$, los polos en lazo cerrado serían $%.3f$ y $%.3f$: reales, sin sobrepaso, es decir, otro sistema y no el del '
        'enunciado.' % (k1[1], k1[0])))

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
a1(para('El LGDR es el segmento entre $0$ y $-7$ y, desde la ruptura en $-3.5$, la recta vertical $σ=-3.5$: los polos complejos siempre tienen '
        '$σ=3.5$.'))

a1(h2link('Paso 3. Estabilidad y rango de ganancia estable', 'III3'))
a1(caption('Tabla 4: Arreglo de Routh del sistema sin compensar'))
add(table([1600, 1600, 1600], ['Fila', 'Col. 1', 'Col. 2'], [['s^^{2}', '1', '$K$'], ['s^^{1}', '7', '0'], ['s^^{0}', '$K$', '']]))
a1(eq('0<7  \\t{y}  0<K'))
a1(resultado())
a1(eq('0<K<∞'))
a1(eq('\\t{No hay }K_{crít}\\t{: el LGDR no cruza el eje }jω'))
a1(para('Con $K_{ref}=%.2f$ la primera columna (1, 7, %.2f) es positiva: el sistema de referencia es estable.' % (K0, K0)))

a1(h2link('Paso 4. Polos en lazo cerrado con la ganancia de referencia', 'III4'))
a1(para('Con $K_{ref}=%.2f$, la ecuación característica del Paso 2 queda:' % K0))
a1(eq('s^2+7s+%.2f=0' % K0))
a1(caption('Tabla 5: Polos en lazo cerrado de referencia'))
add(table([800, 1800, 2200], ['Polo', 'Valor', 'Observación'],
          [['p~{1}', '$-%.3f+j%.3f$' % (SG, WD), 'Par dominante sobre la recta de ζ = %.3f' % Z],
           ['p~{2}', '$-%.3f-j%.3f$' % (SG, WD), 'Conjugado de $p_1$; no hay más polos: el sistema es de 2.º orden puro']]))
a1(resultado())
a1(eq('p_{1,2}=-%.3f±j%.3f' % (SG, WD)))
a1(para('Como no hay tercer polo ni ceros, las fórmulas de segundo orden son exactas para este sistema.'))

a1(h2q('Paso 5. Respuesta transitoria y error estacionario', 'III5', 'a'))
a1(para('Del par $p_{1,2}=-σ±jω_d$ del Paso 4 se obtienen los parámetros de segundo orden; con ellos se evalúa el tiempo de asentamiento '
        '(inciso a) y el error:'))
a1(eq('ω_n=\\r{σ^2+ω_d^2},   ζ=\\f{σ}{ω_n}'))
a1(eq('\\%OS=e^{-ζπ/\\r{1-ζ^2}}×100'))
a1(eq('T_s=\\f{4}{σ},   T_p=\\f{π}{ω_d}'))
a1(eq('T_r≈\\f{1.768ζ^3-0.417ζ^2+1.039ζ+1}{ω_n}'))
a1(eq('K_v=\\lim{s→0}{sKG(s)},   e_{rampa}(∞)=\\f{1}{K_v}'))
a1(resultado())
a1(eq('σ=%.1f,   ω_d=%.4f,   ω_n=%.4f  \\t{rad/s}' % (SG, WD, WN)))
a1(eq('ζ=%.4f,  \\%%OS=%.1f \\t{%%}' % (Z, OS2)))
a1(eq('T_s=%.3f  \\t{s},   T_p=%.3f  \\t{s},   T_r≈%.3f  \\t{s}' % (TS2, TP2, TR2)))
a1(eq('K_v=%.3f,   e_{rampa}(∞)=%.4f,   e_{esc}(∞)=0' % (Kv0, E0)))
a1(para('Respuesta del inciso a): $T_{s}=4/σ=%.3f$ s, igual que el libro.' % TS2))
a1(h2('Evidencia de la etapa'))
add(figbox('LGDR inicial (sistema sin compensar) con la recta de ζ y el punto s~{0}', code('''% Figura 2 · LGDR sin compensar y recta de zeta
s = tf('s');
G = 1/(s*(s+7));                 % planta
zeta = -log(0.15)/sqrt(pi^2+log(0.15)^2);   % 0.5169
s0 = -3.5 + @WD@i;              % III · Paso 1
figure
rlocus(G); grid on               % LGDR y rejilla
hold on
th = acos(zeta); r = [0 12];     % recta de zeta
plot(-r*cos(th), r*sin(th),'m--', ...
     -r*cos(th),-r*sin(th),'m--')
plot(real(s0)*[1 1],imag(s0)*[1 -1],'r*')
axis([-10 2 -10 10])
title('LGDR sin compensar (\\zeta = 0.517)')
hold off''', WD=f(WD))))
a1(figcap('Figura 2: LGDR inicial (sistema sin compensar) con la recta de ζ'))
add(figbox('Respuesta temporal de referencia al escalón (y salida de stepinfo)', code('''% Figura 3 · Respuesta de referencia
s = tf('s');
G = 1/(s*(s+7));
K = @K0@;                  % III · Paso 1
Tu = feedback(K*G, 1);      % lazo cerrado
figure
step(Tu, 2); grid on
title('Respuesta al escalón sin compensar')
info = stepinfo(Tu)         % %OS, Ts, Tp, Tr
p = pole(Tu)''', K0=f(K0, 2))))
a1(figcap('Figura 3: Respuesta temporal de referencia al escalón'))
a1(caption('Tabla 6: Desempeño de referencia'))
add(table([1600, 1600, 1600], ['Magnitud', 'Analítico (2.º orden)', 'Simulación (MATLAB)'],
          [['%OS (%)', f(OS2, 1), f(RI['os'], 2)], ['$T_{s}$ (s)', f(TS2, 3), f(RI['ts'], 3)], ['$T_{p}$ (s)', f(TP2, 3), f(RI['tp'], 3)],
           ['$T_{r}$ (s)', f(TR2, 3), f(RI['tr'], 3)], ['$K_{v}$', f(Kv0, 3), f(Kv0, 3)], ['$e_{rampa}(∞)$', f(E0, 4), f(RN['ref_e'], 4)]]))
a1(para('La simulación se hizo con $K=%.2f$. Como el sistema es de segundo orden puro, el sobrepaso y $T_{p}$ coinciden exactamente. $T_{s}$ difiere '
        'un poco (%.3f s contra %.3f s) porque $4/σ$ usa la envolvente $e^{-σt}$, mientras que MATLAB mide el último instante en que la respuesta '
        'real sale de la banda de 2 %%.' % (K0, RI['ts'], TS2)))

# ---------------- IV ----------------
a1(h1('IV.', 'Desarrollo y justificación del diseño'))
a1(gray('Para reducir T~{s} tres veces con el mismo sobrepaso, los polos dominantes deben quedarse en la recta de ζ = %.3f pero con σ tres veces '
        'mayor. Subir K no sirve: los polos se moverían por la recta vertical σ = −3.5 y saldrían de la recta de ζ. Ese nuevo punto no pertenece '
        'al LGDR sin compensar; con el cero del adelanto fijo en −10, se calcula cuánto ángulo le falta, se ubica el polo del compensador para que '
        'la suma sea −180° y se obtiene K con la condición de magnitud. Después se revisan la estabilidad, el tercer polo y el error.' % Z))
a1(h2link('a) Punto de diseño', 'IVa'))
a1(eq('T_{s,d}=\\f{T_s}{3},   σ_d=\\f{4}{T_{s,d}},   ω_d=σ_dtanθ'))
a1(resultado())
a1(eq('T_{s,d}=%.3f  \\t{s},   σ_d=%.1f' % (TSD, SD)))
a1(eq('s_d=-%.1f+j%.4f' % (SD, WDD)))
a1(para('Se usa el $T_{s}=4/σ=%.3f$ s del inciso a); así $σ_{d}=3σ=10.5$. El punto queda sobre la misma recta de ζ, con $ω_{n}=%.3f$ rad/s.' % (TS2, WND)))
a1(h2link('b) Ángulo con el cero del compensador', 'IVb'))
a1(eq('∠[(s_d+10)G(s_d)]=∠(s_d+10)-∠s_d-∠(s_d+7)'))
a1(eq('θ_p=∠[(s_d+10)G(s_d)]+180°'))
a1(resultado())
a1(eq('%.2f°-%.2f°-%.2f°=%.2f°' % (ANGZ, ANG[0], ANG[1], ANGG)))
a1(eq('θ_p=%.2f°' % THP))
a1(para('Con el cero en $-10$ todavía faltan $%.2f°$ para llegar a $-180°$; como el cero aporta de más, el polo del compensador debe restar '
        '$θ_{p}=%.2f°$.' % (THP, THP)))
a1(h2link('c) Ubicación del polo', 'IVc'))
a1(eq('tanθ_p=\\f{ω_d}{p_c-σ_d}  ⇒  p_c=σ_d+\\f{ω_d}{tanθ_p}'))
a1(resultado())
a1(eq('tan(%.2f°)=%.4f' % (THP, TANP)))
a1(eq('p_c=%.2f  \\t{(libro: 25.52)}' % PC))
a1(eq('G_c(s)=\\f{s+10}{s+%.2f}' % PC))
a1(para('El polo queda a la izquierda del cero ($p_{c}>z_{c}$), como debe ser en un compensador de adelanto.'))
a1(h2q('d) Ganancia', 'IVd', 'b'))
a1(eq('K=\\f{\\d{s_d}\\d{s_d+7}\\d{s_d+p_c}}{\\d{s_d+10}}'))
a1(resultado())
a1(eq('K=\\f{(%.3f)(%.3f)(%.3f)}{%.3f}' % tuple(MG)))
a1(eq('K=%.1f  \\t{(libro: 476.3)}' % KC))
a1(para('Respuesta del inciso b) (diseño del libro): $G_{c}(s)=(s+10)/(s+%.2f)$ con $K=%.1f$. La verificación (VII · Paso 5) muestra que el '
        'modelo completo no cumple el sobrepaso y en VII · Paso 7 se ajusta.' % (PC, KC)))
a1(h2link('e) Nueva ecuación y estabilidad', 'IVe'))
a1(eq('s(s+7)(s+p_c)+K(s+10)=0'))
a1(resultado())
a1(eq('s^3+%.2fs^2+(%.2f+K)s+10K=0' % (A2B, 7 * PC)))
a1(eq('0<K<∞'))
a1(eq('p_3=-%.2f+2σ_d=%.3f' % (A2B, p3)))
a1(eq('σ_a=%.3f,   θ_a=90°, 270°' % SIGA))
a1(para('El sistema compensado es de tercer orden y sigue estable para toda $K>0$. El tercer polo queda en $%.3f$, a $%.3f$ del cero en $-10$: '
        'no hay cancelación, así que la aproximación de segundo orden se revisa con los residuos (VI · Paso 3).' % (p3, -p3 - 10)))
add(figbox('LGDR sin compensar y con el adelanto sobre la recta ζ = 0.517 (con el punto de diseño s~{d})', code('''% Figura 4 · LGDR sin compensar y con adelanto
s = tf('s');
G  = 1/(s*(s+7));
Gc = (s + 10)/(s + @PC@);       % adelanto (libro)
zeta = -log(0.15)/sqrt(pi^2+log(0.15)^2);
sd = -10.5 + @WD@i;            % IV · a)
th = acos(zeta); r = [0 30];    % recta de zeta
figure
rlocus(G, Gc*G); grid on
hold on
plot(-r*cos(th), r*sin(th),'m--', ...
     -r*cos(th),-r*sin(th),'m--')
plot(real(sd)*[1 1],imag(sd)*[1 -1],'r*')
axis([-30 2 -25 25])
legend('sin compensar','con adelanto')
title('LGDR con el compensador de adelanto')
hold off''', PC=f(PC), WD=f(WDD))))
a1(figcap('Figura 4: LGDR sin compensar y con adelanto sobre la recta ζ = 0.517'))

# ---------------- V ----------------
a1(h1('V.', 'Controlador final y parámetros'))
a1(eq('G_c(s)=\\f{s+10}{s+%.2f},   K=%.1f' % (PCA, KA)))
a1(caption('Tabla 7: Parámetros del controlador final'))
add(table([1600, 1600, 1600], ['Parámetro', 'Diseño del libro', 'Ajustado (final)'],
          [['ζ de diseño', f(Z, 4), f(ZD, 4)], ['$s_{d}$', '$-10.5±j%.3f$' % WDD, '$-10.5±j%.3f$' % WDA],
           ['Cero $z_{c}$', '10 (impuesto)', '10 (impuesto)'], ['Polo $p_{c}$', f(PC, 2), f(PCA, 2)],
           ['K', f(KC, 1), f(KA, 1)], ['$K_{v}$', f(KVB, 2), f(KVA, 2)]]))
a1(para('El diseño del libro se obtuvo con las condiciones de ángulo y magnitud (IV). La verificación con el modelo completo dio %.2f %% de '
        'sobrepaso (VII · Paso 5), así que se ajustó el ζ de diseño con el mismo $σ_{d}=10.5$ y el mismo cero (VII · Paso 7). El controlador '
        'final es el ajustado. El adelanto es propio (un cero y un polo): en Simulink va en un Transfer Fcn con Numerator [1 10] y Denominator '
        '[1 %.2f], después del Gain K (Figura 1).' % (IB['os'], PCA)))

# ---------------- VI ----------------
a1(h1('VI.', 'Comprobación analítica'))
a1(h2link('Paso 1. Ecuación característica final y todos los polos en lazo cerrado', 'VI1'))
a1(para('$1+KG_{c}(s)G(s)=0$ con $G_{c}(s)=(s+10)/(s+p_{c})$:'))
a1(eq('s^3+(7+p_c)s^2+(7p_c+K)s+10K=0'))
a1(eq('\\t{Libro: }s^3+%.2fs^2+%.2fs+%.1f=0' % (A2B, A1B, A0B)))
a1(eq('\\t{Ajustado: }s^3+%.2fs^2+%.2fs+%.1f=0' % (A2A, A1A, A0A)))
a1(caption('Tabla 8: Polos en lazo cerrado del sistema compensado'))
add(table([900, 1950, 1950], ['Polo', 'Diseño del libro', 'Ajustado (final)'],
          [['p~{1}', '$%s$' % cs3(p1), '$%s$' % cs3(q1)], ['p~{2}', '$%s$' % cs3(p1.conjugate()), '$%s$' % cs3(q1.conjugate())],
           ['p~{3}', '$%.3f$' % p3, '$%.3f$' % q3]]))
a1(resultado())
a1(eq('\\t{Libro: }p_{1,2}=-10.5±j%.3f,   p_3=%.3f' % (p1.imag, p3)))
a1(eq('\\t{Ajustado: }p_{1,2}=-10.5±j%.3f,   p_3=%.3f' % (q1.imag, q3)))
a1(para('Todas las raíces tienen parte real negativa. No se descarta ningún modo: el adelanto agrega un polo, así que el sistema compensado es de '
        'tercer orden.'))
a1(h2link('Paso 2. Estabilidad y comparación con los polos candidatos', 'VI2'))
a1(caption('Tabla 9: Arreglo de Routh del sistema compensado'))
add(table([900, 1000, 1000, 950, 950], ['Fila', 'Libro col. 1', 'Libro col. 2', 'Ajust. col. 1', 'Ajust. col. 2'],
          [['s^^{3}', '1', f(A1B, 2), '1', f(A1A, 2)], ['s^^{2}', f(A2B, 2), f(A0B, 1), f(A2A, 2), f(A0A, 1)],
           ['s^^{1}', f(B1B, 2), '0', f(B1A, 2), '0'], ['s^^{0}', f(A0B, 1), '', f(A0A, 1), '']]))
a1(para('En los dos diseños la primera columna es toda positiva: no hay cambios de signo y el sistema es estable. Con K como variable, '
        '$b_{1}=[(7+p_{c})(7p_{c}+K)-10K]/(7+p_{c})>0$ para toda $K>0$, porque $7+p_{c}>10$.'))
a1(caption('Tabla 10: Polos candidatos (diseño) contra polos obtenidos'))
difB = abs(p1 - sd) / abs(sd) * 100; difA = abs(q1 - sdA) / abs(sdA) * 100
add(table([1200, 1400, 1400, 800], ['Polos', 'Candidato', 'Obtenido', 'Dif. (%)'],
          [['Par (libro)', '$-10.5$\n$±j%.3f$\n($s_{d}$, IV · a)' % WDD, '$%.3f$\n$±j%.3f$' % (p1.real, p1.imag), f(difB, 1)],
           ['Tercer polo (libro)', '$%.3f$\n(IV · e)' % (-A2B + 21), '$%.3f$' % p3, f(0, 1)],
           ['Par (ajustado)', '$-10.5$\n$±j%.3f$\n(VII · 7)' % WDA, '$%.3f$\n$±j%.3f$' % (q1.real, q1.imag), f(difA, 1)]]))
a1(resultado())
a1(eq('0<K<∞   \\t{(no hay }K_{crít}\\t{)}'))
a1(eq('\\t{Dif. del par dominante}=%.1f \\t{%%}' % difB))
a1(para('El par dominante cae exactamente en el punto de diseño porque K se calculó con la condición de magnitud en $s_{d}$. Lo que falla no son los '
        'polos, sino la suposición de que el tercer polo no influye.'))
a1(h2link('Paso 3. ¿Es razonable la aproximación de polos dominantes?', 'VI3'))
a1(caption('Tabla 11: Modos del sistema y residuos al escalón'))
add(table([1300, 1250, 1250, 1000], ['Polo', 'Residuo (libro)', 'Residuo (ajustado)', 'Lectura'],
          [['$p_{1,2}$', '$%.4f$\n$±j%.4f$\n(|r| = %.4f)' % (r1.real, r1.imag, abs(r1)), '$%.4f$\n$±j%.4f$\n(|r| = %.4f)' % (s1.real, s1.imag, abs(s1)), 'Dominante'],
           ['$p_{3}$', '$%.4f$\n(%.0f %% del dominante)' % (r3, abs(r3) / abs(r1) * 100), '$%.4f$\n(%.0f %% del dominante)' % (s3, abs(s3) / abs(s1) * 100),
            'No despreciable'],
           ['0 (escalón)', '1.000', '1.000', 'Valor final c(∞)']]))
a1(blue('✎ Residuos en MATLAB: [num,den] = tfdata(Tc,\'v\'); [r,pp] = residue(num, conv(den,[1 0])).'))
a1(eq('r_i=\\f{N_T(p_i)}{p_iD_T\'(p_i)}'))
a1(resultado())
a1(eq('\\t{Libro: }\\d{r_{1,2}}=%.4f,   r_3=%.4f' % (abs(r1), r3)))
a1(eq('\\t{Ajustado: }\\d{r_{1,2}}=%.4f,   r_3=%.4f' % (abs(s1), s3)))
a1(para('Conclusión: la aproximación de segundo orden no es razonable. El tercer polo ($%.3f$) está casi a la misma distancia del eje que el par '
        'dominante ($%.2fσ_{d}$) y el cero en $-10$ no lo cancela (le queda a %.2f). Su residuo es positivo y pesa %.0f %% de cada modo dominante: '
        'ese modo suma al pico, así que el sobrepaso real será mayor que 15 %%. Por eso el desempeño se verifica con el modelo completo.'
        % (p3, -p3 / SD, -p3 - 10, abs(r3) / abs(r1) * 100)))
a1(h2link('Paso 4. Error estacionario correspondiente (analítico)', 'VI4'))
a1(eq('K_p=\\lim{s→0}{KG_c(s)G(s)}=∞'))
a1(eq('K_v=\\lim{s→0}{sKG_c(s)G(s)}=\\f{10K}{7p_c}'))
a1(eq('e_{esc}(∞)=\\f{1}{1+K_p},   e_{rampa}(∞)=\\f{1}{K_v}'))
a1(resultado())
a1(eq('\\t{Libro: }K_v=%.2f,   e_{rampa}(∞)=%.4f' % (KVB, EB)))
a1(eq('\\t{Ajustado: }K_v=%.2f,   e_{rampa}(∞)=%.4f' % (KVA, EA)))
a1(para('El sistema sigue siendo tipo 1: error cero al escalón. El error a rampa no se pidió, pero bajó de $%.4f$ a $%.4f$ (×%.2f) con el diseño '
        'del libro y a $%.4f$ (×%.2f) con el ajustado.' % (E0, EB, E0 / EB, EA, E0 / EA)))
a1(advert())

# ---------------- VII ----------------
a1(h1('VII.', 'Comprobación en MATLAB'))
a1(italic('Pasos 5, 6 y 7 de la verificación del sistema completo, con el modelo completo (sin simplificar polos).'))
a1(h2link('Paso 5. Simulación de las entradas requeridas y desempeño del modelo completo', 'VII5'))
a1(para('Entradas simuladas: escalón unitario (sobrepaso y tiempo de asentamiento, que es lo que se pide) y rampa unitaria (error, como dato), sin '
        'compensar, con el diseño del libro y con el ajustado.'))
add(figbox('Respuesta al escalón: sin compensar, adelanto del libro y adelanto ajustado', code('''% Figura 5 · Escalón: sin compensar vs. adelanto
s = tf('s');
G  = 1/(s*(s+7));
Tu = feedback(@K0@*G, 1);                       % sin compensar
Tb = feedback(@KB@*(s+10)/(s+@PB@)*G, 1);       % libro
Ta = feedback(@KA@*(s+10)/(s+@PA@)*G, 1);       % ajustado
figure
step(Tu, Tb, Ta, 1.5); grid on
legend('sin compensar','libro','ajustado')
title('Respuesta al escalón unitario')''', K0=f(K0, 2), KB=f(KC, 1), PB=f(PC, 2), KA=f(KA, 1), PA=f(PCA, 2))))
a1(figcap('Figura 5: Respuesta al escalón sin compensar, con el adelanto del libro y con el ajustado'))
add(figbox('Salida de pole, stepinfo y residuos en la Command Window (captura)', code('''% Figura 6 · Command Window
s = tf('s');
G  = 1/(s*(s+7));
Tu = feedback(@K0@*G, 1);
Tb = feedback(@KB@*(s+10)/(s+@PB@)*G, 1);
Ta = feedback(@KA@*(s+10)/(s+@PA@)*G, 1);
pole(Tb), pole(Ta)
stepinfo(Tu)
stepinfo(Tb)
stepinfo(Ta)
[num,den] = tfdata(Ta,'v');
[r,pp] = residue(num, conv(den,[1 0]))
Kv_a = dcgain(minreal(s*@KA@*(s+10)/(s+@PA@)*G))''', K0=f(K0, 2), KB=f(KC, 1), PB=f(PC, 2), KA=f(KA, 1), PA=f(PCA, 2))))
a1(figcap('Figura 6: Salida de pole, stepinfo y residuos en la Command Window (captura)'))
a1(caption('Tabla 12: Especificaciones contra desempeño simulado'))
add(table([1150, 1050, 1300, 1300], ['Especificación', 'Meta', 'Libro', 'Ajustado (final)'],
          [['%OS', '15 %', '%.2f %%\nNo cumple' % IB['os'], '%.2f %%\nSí' % IA['os']],
           ['$T_{s}$', '≤ %.3f/3 = %.3f s' % (TS2, TSMETA), '%.3f s\nCasi (%.1f %% arriba)' % (IB['ts'], (IB['ts'] / TSMETA - 1) * 100), '%.3f s\nSí' % IA['ts']],
           ['Estabilidad', 'Estable', 'Sí', 'Sí'],
           ['$T_{p}$ (dato)', '—', '%.3f s' % IB['tp'], '%.3f s' % IA['tp']],
           ['$e_{rampa}(∞)$ (dato)', '—', f(EB, 4), f(EA, 4)]]))
a1(eq('\\%OS=\\f{c_{máx}-c(∞)}{c(∞)}×100'))
a1(resultado())
a1(eq('\\t{Libro: }c_{máx}=%.4f,   t_p=%.3f  \\t{s}' % (IB['pk'], IB['tp'])))
a1(eq('\\%%OS_{sim}=%.2f \\t{%%},   T_s=%.3f  \\t{s}' % (IB['os'], IB['ts'])))
a1(eq('\\t{Ajustado: }c_{máx}=%.4f,   t_p=%.3f  \\t{s}' % (IA['pk'], IA['tp'])))
a1(eq('\\%%OS_{sim}=%.2f \\t{%%},   T_s=%.3f  \\t{s}' % (IA['os'], IA['ts'])))
a1(para('El diseño del libro no cumple: el modo del tercer polo (residuo positivo, VI · Paso 3) sube el sobrepaso a %.2f %% y $T_{s}$ queda en %.3f s, '
        'un poco arriba de la meta (con la simulación de referencia, %.3f/%.3f = %.2f veces). El ajustado cumple las dos: %.2f %% y $T_{s}=%.3f$ s '
        '(%.2f veces menor que el simulado sin compensar).' % (IB['os'], IB['ts'], RI['ts'], IB['ts'], TSRB, IA['os'], IA['ts'], TSRA)))
a1(h2link('Paso 6. Error estacionario simulado', 'VII6'))
add(figbox('Error ante rampa e(t) = t − c(t): sin compensar, libro y ajustado', code('''% Figura 7 · Error a rampa
s = tf('s');
G  = 1/(s*(s+7));
Tu = feedback(@K0@*G, 1);
Tb = feedback(@KB@*(s+10)/(s+@PB@)*G, 1);
Ta = feedback(@KA@*(s+10)/(s+@PA@)*G, 1);
t = 0:0.001:3;
cu = lsim(Tu,t,t); cb = lsim(Tb,t,t); ca = lsim(Ta,t,t);
figure
plot(t, t'-cu, t, t'-cb, t, t'-ca); grid on
ylim([0 0.25])
xlabel('t (s)'); ylabel('e(t) = t - c(t)')
legend('sin compensar','libro','ajustado')
title('Error ante rampa unitaria')
e_u = t(end)-cu(end), e_b = t(end)-cb(end), e_a = t(end)-ca(end)''', K0=f(K0, 2), KB=f(KC, 1), PB=f(PC, 2), KA=f(KA, 1), PA=f(PCA, 2))))
a1(figcap('Figura 7: Error ante rampa e(t) = t − c(t): sin compensar, libro y ajustado'))
a1(eq('e_{sim}(∞)=\\lim{t→∞}{[t-c(t)]}'))
a1(resultado())
a1(eq('e_{u}(3 \\t{ s})=%.4f,   e_{b}(3 \\t{ s})=%.4f,   e_{a}(3 \\t{ s})=%.4f' % (RN['ref_e'], eB(np.array([3.0]))[0], eA(np.array([3.0]))[0])))
a1(para('Los tres valores simulados coinciden con los analíticos (III · Paso 5 y VI · Paso 4): todos los modos son rápidos y a los 3 s el error ya '
        'llegó a su valor final.'))
a1(h2link('Paso 7. Ajuste del diseño y repetición de la verificación', 'VII7'))
a1(para('El sobrepaso del libro (%.2f %%) no cumple. Como el tercer polo suma sobrepaso, se piden polos dominantes más amortiguados: se conservan '
        '$σ_{d}=10.5$ (para no perder $T_{s}$) y el cero en $-10$ (lo impone el enunciado), y se prueba un ζ de diseño mayor. Para cada $ζ_{d}$ se '
        'repiten IV · a)–d) y se simula el modelo completo:' % IB['os']))
for z, d, o in TESTS:
    a1(eq('ζ_d=%.3f:   p_c=%.2f,   K=%.1f,   \\%%OS_{sim}=%.2f \\t{%%}' % (z, d['pc'], d['K'], o)))
a1(para('El 15 % queda entre 0.60 y 0.65; se afina por bisección (en MATLAB, fzero con stepinfo):'))
a1(resultado())
a1(eq('ζ_d=%.4f,   s_d=-10.5±j%.3f' % (ZD, WDA)))
a1(eq('p_c=%.2f,   K=%.1f' % (PCA, KA)))
a1(eq('\\%%OS_{sim}=%.2f \\t{%%},   T_s=%.3f  \\t{s},   T_p=%.3f  \\t{s}' % (IA['os'], IA['ts'], IA['tp'])))
a1(para('Re‑verificación: polos $-10.5±j%.3f$ y $%.3f$ (VI · Paso 1), estable para toda K (VI · Paso 2), $e_{rampa}(∞)=%.4f$ (VI · Paso 4). Cumple las '
        'dos especificaciones; el precio es un error a rampa un poco mayor que con el diseño del libro (%.4f), que no se pidió.' % (WDA, q3, EA, EB)))
add(figbox('Ajuste: %OS simulado contra ζ de diseño y respuesta del libro contra la ajustada', ('''% Figura 8 · Ajuste del zeta de diseño
s = tf('s');
G = 1/(s*(s+7));
sig = 10.5;  zc = 10;               % sigma de diseño y cero impuesto
sd  = @(z) -sig + 1i*sig*tan(acos(z));
thp = @(z) pi + angle(sd(z)+zc) - angle(sd(z)) - angle(sd(z)+7);
pc  = @(z) sig + imag(sd(z))/tan(thp(z));       % polo del adelanto
Kd  = @(z) abs(sd(z))*abs(sd(z)+7)*abs(sd(z)+pc(z))/abs(sd(z)+zc);
T   = @(z) feedback(Kd(z)*(s+zc)/(s+pc(z))*G, 1);
OS  = @(z) getfield(stepinfo(T(z)),'Overshoot');
zz = 0.50:0.01:0.70;
os = arrayfun(OS, zz);
zd = fzero(@(z) OS(z)-15, [0.60 0.65])   % zeta ajustado
pc_aj = pc(zd), K_aj = Kd(zd)
figure
subplot(2,1,1)
plot(zz, os, 'b.-', zd, 15, 'ro'); grid on
yline(15,'m--'); xlabel('\\zeta de diseño'); ylabel('%OS simulado')
subplot(2,1,2)
step(T(0.5169), T(zd), 0.8); grid on
legend('libro (\\zeta = 0.517)','ajustado')''')))
a1(figcap('Figura 8: Ajuste: %OS simulado contra ζ de diseño y respuesta del libro contra la ajustada'))
a1(h2('Modelo en Simulink'))
add(figbox('Respuesta en el Scope de Simulink del sistema final (pega también la captura del modelo)',
           '% Figura 9 · Scope de Simulink (sistema final)\n' + SL + "\nset_param(m,'StopTime','1')\nopen_system([m '/Scope'])\nsim(m);                      % corre 1 s"))
a1(figcap('Figura 9: Respuesta en el Scope de Simulink del sistema final'))

# ---------------- VIII ----------------
a1(h1('VIII.', 'Comparación y discusión'))
a1(caption('Tabla 13: Comparación: libro, cálculo analítico y MATLAB'))
add(table([1400, 1150, 1150, 1100], ['Magnitud', 'Libro', 'Analítico', 'MATLAB'],
          [['$T_{s}$ sin compensar (s)', '1.143', f(TS2, 3), f(RI['ts'], 3)],
           ['%OS sin compensar', '15', f(OS2, 1), f(RI['os'], 2)],
           ['Polo del adelanto', '−25.52', '−%.2f' % PC, '—'],
           ['K con adelanto', '476.3', f(KC, 1), '—'],
           ['%OS con adelanto (libro)', '15', f(OS2, 1), f(IB['os'], 2)],
           ['$T_{s}$ con adelanto (libro) (s)', '0.381', f(TSD, 3), f(IB['ts'], 3)],
           ['Ajustado: $p_{c}$ / K', '—', '%.2f / %.1f' % (PCA, KA), '—'],
           ['%OS ajustado', '—', '—', f(IA['os'], 2)],
           ['$T_{s}$ ajustado (s)', '—', f(4 / 10.5, 3), f(IA['ts'], 3)],
           ['$e_{rampa}$ libro / ajustado', '—', '%.4f / %.4f' % (EB, EA), '%.4f / %.4f' % (eB(np.array([3.0]))[0], eA(np.array([3.0]))[0])]]))
a1(gray('Los valores analíticos coinciden con la respuesta del libro (polo en −25.52 y K = 476.3; aquí −%.2f y %.1f, por redondeo de σ~{d} y ω~{d}). '
        'Sin compensar, el sistema es de segundo orden puro y la simulación coincide con el análisis. Con el adelanto ya no: el tercer polo en '
        '−%.2f queda casi a la misma distancia del eje que el par dominante y el cero en −10 no lo cancela; su modo suma al pico y el sobrepaso '
        'real fue %.2f %%. El libro da el diseño sin simularlo; la verificación de la guía obligó a ajustarlo. Con ζ~{d} = %.4f el modelo '
        'completo da %.2f %% y T~{s} = %.3f s.' % (PC, KC, -p3, IB['os'], ZD, IA['os'], IA['ts'])))

# ---------------- IX ----------------
a1(h1('IX.', 'Conclusiones y limitaciones demostradas'))
a1(gray('Con el cero fijo en −10, la condición de ángulo ubicó el polo del adelanto en −%.2f (el polo debía restar %.2f°) y la de magnitud dio '
        'K = %.1f: los polos dominantes quedaron exactamente en s~{d} = −10.5 ± j%.3f, tres veces más lejos del eje imaginario.' % (PC, THP, KC, WDD)))
a1(gray('Se demostró la limitación de la aproximación de segundo orden: el tercer polo (−%.2f) no está lejos del eje ni cancelado por el cero, y su '
        'residuo positivo subió el sobrepaso a %.2f %%. Ajustando el ζ de diseño a %.4f, con el mismo σ y el mismo cero, el modelo completo cumplió: '
        '%.2f %% y T~{s} = %.3f s, con G~{c}(s) = (s + 10)/(s + %.2f) y K = %.1f.' % (-p3, IB['os'], ZD, IA['os'], IA['ts'], PCA, KA)))
a1(gray('A diferencia del PD, el adelanto es pasivo y su ganancia en alta frecuencia está limitada (K·1 en lugar de crecer con ω); como efecto '
        'extra, el error a rampa bajó de %.4f a %.4f.' % (E0, EA)))
a1(h2('Conclusión individual'))
a1(gray('En esta práctica aprendí que, en un sistema de segundo orden, el tiempo de asentamiento no se puede mejorar sólo con K, porque la parte real '
        'de los polos se queda en −3.5. El compensador de adelanto cambia la forma del LGDR para que pase por el punto que se necesita, y con el '
        'cero ya fijo la condición de ángulo dice dónde poner el polo.'))
a1(gray('Lo más importante fue la verificación: el diseño del libro cumple en el papel, pero con el modelo completo dio %.2f %% de sobrepaso, '
        'porque el tercer polo no queda cancelado. Con los residuos entendí por qué, y con MATLAB ajusté el ζ de diseño hasta obtener 15 %%.' % IB['os']))
a1(gray('Concluyo que las fórmulas de segundo orden son un buen punto de partida, pero siempre hay que comprobar el diseño con el sistema completo '
        'antes de darlo por bueno.'))
out.append('#SECT2')
