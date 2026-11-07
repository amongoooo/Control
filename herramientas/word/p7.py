# Contenido de la Práctica 7 (adelanto-atraso, Nise ejercicio 9.3) con el formato de la P1–P6 (v45/v47/v56/v57/v60).
import math, cmath
import numpy as np
import build
from build import *
import num7
RN = num7.R


def f(x, d=4):
    return ('%.' + str(d) + 'f') % x


def code(src, **k):
    for a, b in k.items():
        src = src.replace('@' + a + '@', b)
    assert '@' not in src, src
    return src


def link(anchor, text):
    return ('<w:hyperlink w:anchor="%s" w:history="1"><w:r><w:rPr><w:rStyle w:val="Hipervnculo"/><w:b w:val="0"/><w:bCs w:val="0"/>'
            '<w:sz w:val="18"/><w:szCs w:val="18"/></w:rPr>' % anchor + T(text) + '</w:r></w:hyperlink>')


def inciso(letter, s, key, ans):
    build.BM[0] += 1; i = build.BM[0]
    return P('<w:spacing w:after="80"/><w:ind w:left="240"/><w:jc w:val="both"/>',
             '<w:bookmarkStart w:id="%d" w:name="%s_q_%s"/>' % (i, build.PRE[0], letter) + rich(letter + ') ' + s) + R('  ') +
             link('%s_r_%s' % (build.PRE[0], key), '→ respuesta: ' + ans) + '<w:bookmarkEnd w:id="%d"/>' % i)


def h2q(t, key, letters):
    x = h2link(t, key)
    j = x.rindex('<w:bookmarkEnd')
    return x[:j] + ''.join(R('  ') + link('%s_q_%s' % (build.PRE[0], l), '↑ inciso %s)' % l) for l in letters) + x[j:]


Z = RN['zeta']; TH = RN['th']; TN = RN['tan']
SG = RN['sig0']; s0 = RN['s0']; WD = RN['wd0']; K0 = RN['K0']; WN = RN['wn0']
KV0 = RN['Kv0']; E0 = RN['e0']; RI = RN['ref_info']
OS2 = math.exp(-Z * math.pi / math.sqrt(1 - Z * Z)) * 100
TS2 = 4 / SG; TP2 = math.pi / WD
TRn = 1.768 * Z ** 3 - 0.417 * Z ** 2 + 1.039 * Z + 1; TR2 = TRn / WN
k1 = sorted(RN['K1poles'])
META = RN['meta']; KVM = RN['Kvmeta']; EMETA = E0 / 10
B = RN['B']; A = RN['A']; TESTS = RN['tests']
WDD = B['wd']; sd = B['sd']; SD = B['sg']; WND = abs(sd); ANG = B['angs']; ANGZ = B['angz']; ANGG = B['angG']; THP = B['thp']
PAD = B['pad']; KAD = B['Kad']; KVAD = B['Kvad']; RAT = B['ratio']; ZAT = B['zat']; TANP = math.tan(math.radians(THP))
MG = [abs(sd), abs(sd + 7), abs(sd + PAD), abs(sd + 3)]


def split(D):
    p = D['poles']; r = D['r']
    i1 = [i for i in range(4) if p[i].imag > 1e-9][0]; rs = sorted([i for i in range(4) if abs(p[i].imag) < 1e-9], key=lambda i: p[i].real)
    return p[i1], r[i1], p[rs[0]].real, r[rs[0]].real, p[rs[1]].real, r[rs[1]].real


p1, r1, p3, r3, p4, r4 = split(B)
q1, s1, q3, s3, q4, s4 = split(A)
IB = B['info']; IA = A['info']; KB = B['K']; KA = A['K']; EB = B['e']; EA = A['e']
DB = B['den']; DA_ = A['den']


def routh4(a):
    b1 = (a[1] * a[2] - a[3]) / a[1]; c1 = (b1 * a[3] - a[1] * a[4]) / b1
    return b1, c1


RB = routh4(DB); RA = routh4(DA_)
cs3 = lambda z: '%s%sj%s' % (f(z.real, 3), '+' if z.imag >= 0 else '-', f(abs(z.imag), 3))

out = []
add = out.extend
a1 = out.append

# =============== portada ===============
add(cover('Práctica 7: Compensador de adelanto-atraso de fase'))
a1(resumen('En esta práctica se analizó el sistema tipo 1 con realimentación unitaria G(s) = K/[s(s + 7)] (Nise, ejercicio 9.3), que opera con 20 %% '
           'de sobrepaso (ζ = %.3f), y se le diseñó un compensador de adelanto-atraso para reducir dos veces su tiempo de asentamiento y diez veces su '
           'error ante rampa, con el cero del adelanto en −3. La referencia es K = %.2f (s~{0} = −3.5 ± j%.3f), con T~{s} = %.3f s y e = %.4f. El '
           'adelanto (polo en −%.3f, K = %.1f) llevó los polos dominantes a s~{d} = −7 ± j%.3f; el atraso (cero en −%.4f, polo en −0.01) subió K~{v} '
           '%.2f veces casi sin mover el LGDR. Con la re‑búsqueda, K = %.1f. La simulación del modelo completo dio T~{s} = %.3f s, que no cumple la '
           'meta de %.3f s; se ajustó el T~{s} de diseño a %.2f s: polo del adelanto en −%.2f, cero del atraso en −%.4f y K = %.1f, que dan '
           'T~{s} = %.3f s, %.2f %% de sobrepaso y e = %.4f (×%.2f).'
           % (Z, K0, WD, TS2, E0, PAD, KAD, WDD, ZAT, RAT, KB, IB['ts'], META, A['Ts'], A['pad'], A['zat'], KA, IA['ts'], IA['os'], EA, E0 / EA)))
a1(keywords('Lugar geométrico de las raíces, Compensador de adelanto-atraso, Condición de ángulo, Error en estado estable, MATLAB'))
out.append('#SECT1')

# =============== I ===============
a1(h1('I.', 'Identificación y referencia del ejercicio'))
a1(caption('Tabla 1: Identificación de la práctica'))
add(table([1500, 3300], ['Dato', 'Valor'], [['Práctica', '7 · Compensador de adelanto-atraso de fase'],
                                            ['Ejercicio', 'Ejercicio de evaluación de destreza 9.3, p. 541'],
                                            ['Libro', 'Nise, Sistemas de control para ingeniería (CECSA, 2006)'],
                                            ['Capítulo', '9. Diseño por medio del lugar geométrico de las raíces']], boldfirst=True))
a1(labeled('Objetivo.', 'Evaluar el tiempo de asentamiento y el error ante rampa del sistema con 20 % de sobrepaso, diseñar un compensador de '
           'adelanto-atraso (cero del adelanto en −3) que reduzca dos veces T~{s} y diez veces el error, y comprobar con el modelo completo en MATLAB '
           'si se cumplen las especificaciones.'))
a1(labeled('Introducción.', 'El compensador de adelanto-atraso junta los dos efectos: el adelanto (s + z~{ad})/(s + p~{ad}) cambia la forma del LGDR '
           'para llevar los polos dominantes a un punto más rápido sobre la misma recta de ζ, y el atraso (s + z~{at})/(s + p~{at}), con el cero y el '
           'polo muy cerca del origen, multiplica la constante K~{v} por z~{at}/p~{at} casi sin mover el LGDR. Primero se diseña el adelanto, luego se '
           'elige el atraso para la mejora del error que falta, y al final se vuelve a buscar K con el compensador completo.', g=True))

# =============== II ===============
a1(h1('II.', 'Planteamiento, modelo, diagrama y especificaciones'))
a1(h2('1. Planteamiento'))
a1(problem('**Problema:** Un sistema con realimentación unitaria con una función de transferencia en la trayectoria directa,'))
a1(eq('G(s)=\\f{K}{s(s+7)}'))
a1(problem('está operando con una respuesta escalón en lazo cerrado que tiene 20% de sobrepaso. Haga lo siguiente:'))
a1(inciso('a', 'Evalúe el tiempo de asentamiento.', 'III5', 'III · Paso 5 · Tₛ = %.3f s' % TS2))
a1(inciso('b', 'Evalúe el error en estado estable para una entrada rampa unitaria.', 'III5', 'III · Paso 5 · e(∞) = %.4f' % E0))
a1(inciso('c', 'Diseñe un compensador de adelanto-atraso de fase para reducir el tiempo de asentamiento en un factor de 2, y disminuir en 10 veces '
          'el error en estado estable para una entrada de rampa unitaria. Ponga el cero de adelanto de fase en −3.', 'IVe',
          'IV · e) · K = %.1f (ajuste en VII · 7)' % KB))
a1(para('Es un ejercicio de evaluación de destreza: el libro no trae figura; el diagrama de bloques del punto 3 (Figura 1) se armó con la función de '
        'transferencia del enunciado.'))
a1(h2('2. Modelo'))
a1(eq('G(s)=\\f{K}{s(s+7)}'))
a1(eq('G_{c}(s)=\\f{s+3}{s+p_{ad}}·\\f{s+z_{at}}{s+p_{at}},   H(s)=1'))
a1(para('Realimentación unitaria negativa; el adelanto y el atraso van en cascada con la ganancia K y la planta. Con el compensador, el lazo abierto es '
        '$K(s+3)(s+z_{at})/[s(s+7)(s+p_{ad})(s+p_{at})]$.'))
a1(h2('3. Diagrama de bloques'))
SL = code('''m = 'P7_adelanto_atraso';  % nombre del modelo
if bdIsLoaded(m), close_system(m,0); end
K   = @K@;               % VII · Paso 7 (ajustado)
pad = @PAD@;              % polo del adelanto
zat = @ZAT@;              % cero del atraso
new_system(m); open_system(m)
L = 'simulink/';
add_block([L 'Sources/Step'],[m '/Step'], ...
  'Time','0','After','1')
add_block([L 'Math Operations/Sum'], ...
  [m '/Sum'],'Inputs','|+-')
add_block([L 'Math Operations/Gain'], ...
  [m '/K'],'Gain','K')
add_block([L 'Continuous/Transfer Fcn'], ...
  [m '/Adelanto'],'Numerator','[1 3]', ...
  'Denominator','[1 pad]')
add_block([L 'Continuous/Transfer Fcn'], ...
  [m '/Atraso'],'Numerator','[1 zat]', ...
  'Denominator','[1 0.01]')
add_block([L 'Continuous/Transfer Fcn'], ...
  [m '/G'],'Numerator','1', ...  % planta
  'Denominator','[1 7 0]')
add_block([L 'Sinks/Scope'],[m '/Scope'])
add_line(m,'Step/1','Sum/1')
add_line(m,'Sum/1','K/1')
add_line(m,'K/1','Adelanto/1')
add_line(m,'Adelanto/1','Atraso/1')
add_line(m,'Atraso/1','G/1')
add_line(m,'G/1','Scope/1')
add_line(m,'G/1','Sum/2')    % realimentación
Simulink.BlockDiagram.arrangeSystem(m)''', K=f(KA, 2), PAD=f(A['pad'], 4), ZAT=f(A['zat'], 5))
add(figbox('Diagrama de bloques del sistema en lazo cerrado (Simulink): Step → Sum (+ −) → Gain (K) → Transfer Fcn del adelanto (s + 3)/(s + p~{ad}) '
           '→ Transfer Fcn del atraso (s + z~{at})/(s + 0.01) → Transfer Fcn de la planta 1/[s(s + 7)] → Scope.',
           '% Figura 1 · Modelo de Simulink con el adelanto-atraso\n' + SL))
a1(figcap('Figura 1: Diagrama de bloques del sistema en lazo cerrado (Simulink)'))
a1(h2('4. Especificaciones'))
a1(caption('Tabla 2: Especificaciones de diseño'))
add(table([1500, 1500, 1800], ['Especificación', 'Meta', 'Cómo se verifica'],
          [['Sobrepaso', '20 %% (ζ = %.3f)' % Z, 'Misma recta de ζ; %OS simulado'],
           ['Tiempo de asentamiento', '$T_{s}$/2 (dos veces menor)', 'σ dos veces mayor; $T_{s}$ simulado'],
           ['Error a rampa', '10 veces menor ($K_{v}$ ×10)', 'Atraso; error simulado'],
           ['Cero del adelanto', 'Impuesto en −3', 'El polo $p_{ad}$ se calcula'],
           ['Estabilidad', 'Estable', 'Routh y polos del modelo completo']]))

# =============== III ===============
a1(h1('III.', 'Análisis inicial y desempeño de referencia'))
a1(h2link('Paso 1. Ganancia de referencia (no asumir que es uno)', 'III1'))
a1(para('El enunciado da la ganancia de forma indirecta: el sistema opera con 20 %% de sobrepaso, es decir, con $ζ=%.4f$. Como la planta es de segundo '
        'orden, $s^2+7s+K=0$ fija la parte real de los polos complejos en $σ=3.5$ para cualquier K; con la recta de ζ se obtiene $ω_{d}$ y con la '
        'condición de magnitud, K:' % Z))
a1(eq('ζ=\\f{-\\t{ln}(\\%OS/100)}{\\r{π^2+\\t{ln}^2(\\%OS/100)}},   θ=cos^{-1}ζ'))
a1(eq('ω_d=σtanθ,   K=∏\\d{s_0-p_i}'))
a1(resultado())
a1(eq('ζ=%.4f,   θ=%.2f°,   s_0=-3.5+j%.4f' % (Z, TH, WD)))
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
a1(resultado())
a1(eq('0<K<∞'))
a1(eq('\\t{No hay }K_{crít}\\t{: el LGDR no cruza el eje }jω'))
a1(para('Con $K_{ref}=%.2f$ la primera columna (1, 7, %.2f) es positiva: el sistema de referencia es estable.' % (K0, K0)))
a1(h2link('Paso 4. Polos en lazo cerrado con la ganancia de referencia', 'III4'))
a1(eq('s^2+7s+%.2f=0' % K0))
a1(caption('Tabla 5: Polos en lazo cerrado de referencia'))
add(table([800, 1800, 2200], ['Polo', 'Valor', 'Observación'],
          [['p~{1}', '$-3.500+j%.3f$' % WD, 'Par dominante sobre la recta de ζ = %.3f' % Z],
           ['p~{2}', '$-3.500-j%.3f$' % WD, 'Conjugado de $p_1$; no hay más polos: 2.º orden puro']]))
a1(resultado())
a1(eq('p_{1,2}=-3.5±j%.3f' % WD))
a1(h2q('Paso 5. Respuesta transitoria y error estacionario', 'III5', 'ab'))
a1(para('Del par $p_{1,2}=-σ±jω_d$ se evalúan el tiempo de asentamiento (inciso a) y el error ante rampa unitaria (inciso b):'))
a1(eq('ω_n=\\r{σ^2+ω_d^2},   \\%OS=e^{-ζπ/\\r{1-ζ^2}}×100'))
a1(eq('T_s=\\f{4}{σ},   T_p=\\f{π}{ω_d}'))
a1(eq('T_r≈\\f{1.768ζ^3-0.417ζ^2+1.039ζ+1}{ω_n}'))
a1(eq('K_v=\\lim{s→0}{sKG(s)}=\\f{K}{7},   e_{rampa}(∞)=\\f{1}{K_v}'))
a1(resultado())
a1(eq('ω_n=%.4f  \\t{rad/s},  \\%%OS=%.1f \\t{%%}' % (WN, OS2)))
a1(eq('T_s=%.3f  \\t{s},   T_p=%.3f  \\t{s},   T_r≈%.3f  \\t{s}' % (TS2, TP2, TR2)))
a1(eq('K_v=%.3f,   e_{rampa}(∞)=%.4f' % (KV0, E0)))
a1(para('Respuestas: a) $T_{s}=4/σ=%.3f$ s; b) $e_{rampa}(∞)=1/K_{v}=%.4f$.' % (TS2, E0)))
a1(h2('Evidencia de la etapa'))
add(figbox('LGDR inicial (sistema sin compensar) con la recta de ζ y el punto s~{0}', code('''% Figura 2 · LGDR sin compensar y recta de zeta
s = tf('s');
G = 1/(s*(s+7));                 % planta
zeta = -log(0.20)/sqrt(pi^2+log(0.20)^2);   % 0.4559
s0 = -3.5 + @WD@i;              % III · Paso 1
figure
rlocus(G); grid on
hold on
th = acos(zeta); r = [0 12];     % recta de zeta
plot(-r*cos(th), r*sin(th),'m--', -r*cos(th),-r*sin(th),'m--')
plot(real(s0)*[1 1],imag(s0)*[1 -1],'r*')
axis([-10 2 -12 12])
title('LGDR sin compensar (\\zeta = 0.456)')
hold off''', WD=f(WD))))
a1(figcap('Figura 2: LGDR inicial (sistema sin compensar) con la recta de ζ'))
add(figbox('Respuesta de referencia al escalón (inciso a) y error ante rampa (inciso b)', code('''% Figura 3 · Respuesta de referencia y error a rampa
s = tf('s');
G = 1/(s*(s+7));
K = @K0@;                   % III · Paso 1
Tu = feedback(K*G, 1);
t = 0:0.001:4;
figure
subplot(2,1,1); step(Tu, 2); grid on
title('Respuesta al escalón sin compensar')
subplot(2,1,2); cu = lsim(Tu, t, t);
plot(t, t' - cu); grid on; ylim([0 0.2])
xlabel('t (s)'); ylabel('e(t) = t - c(t)')
info = stepinfo(Tu)
e_u = t(end) - cu(end)''', K0=f(K0, 2))))
a1(figcap('Figura 3: Respuesta de referencia al escalón y error ante rampa'))
a1(caption('Tabla 6: Desempeño de referencia'))
add(table([1600, 1600, 1600], ['Magnitud', 'Analítico (2.º orden)', 'Simulación (MATLAB)'],
          [['%OS (%)', f(OS2, 1), f(RI['os'], 2)], ['$T_{s}$ (s)', f(TS2, 3), f(RI['ts'], 3)], ['$T_{p}$ (s)', f(TP2, 3), f(RI['tp'], 3)],
           ['$T_{r}$ (s)', f(TR2, 3), f(RI['tr'], 3)], ['$K_{v}$', f(KV0, 3), f(KV0, 3)], ['$e_{rampa}(∞)$', f(E0, 4), f(RN['ref_e'], 4)]]))
a1(para('Como el sistema es de segundo orden puro, sobrepaso, $T_{p}$ y error coinciden. $T_{s}$ difiere (%.3f s contra %.3f s) porque $4/σ$ usa la '
        'envolvente, mientras MATLAB mide el último cruce real de la banda de 2 %%. La meta del inciso c) se toma del valor de $4/σ$: '
        '$T_{s}≤%.3f$ s, como en el libro.' % (RI['ts'], TS2, META)))

# =============== IV ===============
a1(h1('IV.', 'Desarrollo y justificación del diseño'))
a1(gray('Primero el adelanto: para reducir T~{s} a la mitad con el mismo sobrepaso, los polos dominantes van a la recta de ζ = %.3f con σ dos veces '
        'mayor; con el cero fijo en −3 se calcula el polo que completa −180° y K con la condición de magnitud. Después el atraso: se calcula cuánto '
        'falta para que K~{v} sea diez veces el de referencia y se ponen el cero y el polo cerca del origen con esa razón. Al final se vuelve a buscar '
        'el punto sobre la recta y su K con todo el compensador.' % Z))
a1(h2link('a) Punto de diseño', 'IVa'))
a1(eq('T_{s,d}=\\f{T_s}{2},   σ_d=\\f{4}{T_{s,d}},   ω_d=σ_dtanθ'))
a1(resultado())
a1(eq('T_{s,d}=%.4f  \\t{s},   σ_d=7' % META))
a1(eq('s_d=-7+j%.4f' % WDD))
a1(h2link('b) Ángulo con el cero y polo del adelanto', 'IVb'))
a1(eq('θ_p=∠(s_d+3)-∠s_d-∠(s_d+7)+180°'))
a1(eq('p_{ad}=σ_d+\\f{ω_d}{tanθ_p}'))
a1(resultado())
a1(eq('%.2f°-%.2f°-%.2f°=%.2f°' % (ANGZ, ANG[0], ANG[1], ANGG)))
a1(eq('θ_p=%.2f°,   p_{ad}=%.3f' % (THP, PAD)))
a1(eq('G_{ad}(s)=\\f{s+3}{s+%.3f}' % PAD))
a1(h2link('c) Ganancia del adelanto y mejora de error que falta', 'IVc'))
a1(eq('K_{ad}=\\f{\\d{s_d}\\d{s_d+7}\\d{s_d+p_{ad}}}{\\d{s_d+3}},   K_{v,ad}=\\f{3K_{ad}}{7p_{ad}}'))
a1(resultado())
a1(eq('K_{ad}=%.2f,   K_{v,ad}=%.3f' % (KAD, KVAD)))
a1(eq('K_{v,meta}=10K_{v,ref}=%.2f ⇒ \\f{z_{at}}{p_{at}}=\\f{%.2f}{%.3f}=%.3f' % (KVM, KVM, KVAD, RAT)))
a1(para('El adelanto solo mejora el error de $%.4f$ a $%.4f$; el atraso debe multiplicar $K_{v}$ otras %.2f veces.' % (E0, 1 / KVAD, RAT)))
a1(h2link('d) Compensador de atraso', 'IVd'))
a1(eq('p_{at}=0.01,   z_{at}=%.3f·0.01=%.4f' % (RAT, ZAT)))
a1(eq('∠\\f{s_d+z_{at}}{s_d+p_{at}}=%.2f°,   \\d{\\f{s_d+z_{at}}{s_d+p_{at}}}=%.4f' % (B['dip'], B['dipm'])))
a1(resultado())
a1(eq('G_{at}(s)=\\f{s+%.4f}{s+0.01}' % ZAT))
a1(para('El dipolo cambia el ángulo apenas $%.2f°$ en $s_{d}$: el LGDR casi no se mueve.' % B['dip']))
a1(h2q('e) Re‑búsqueda con el adelanto‑atraso y nueva ecuación', 'IVe', 'c'))
a1(eq('1+K\\f{(s+3)(s+z_{at})}{s(s+7)(s+p_{ad})(s+0.01)}=0'))
a1(resultado())
a1(eq('s_0=%.4f+j%.4f,   K=%.2f  \\t{(libro: 205.4)}' % (B['sF'].real, B['sF'].imag, KB)))
a1(eq('s^4+%.3fs^3+%.2fs^2+%.2fs+%.3f=0' % tuple(DB[1:])))
a1(eq('K_v=\\f{3Kz_{at}}{7p_{ad}(0.01)}=%.2f' % B['Kv']))
a1(para('Respuesta del inciso c) (diseño del libro): $G_{c}(s)=\\f{s+3}{s+%.3f}·\\f{s+%.4f}{s+0.01}$ con $K=%.1f$. La verificación (VII · Paso 5) da '
        '$T_{s}=%.3f$ s, que no cumple, y en VII · Paso 7 se ajusta.' % (PAD, ZAT, KB, IB['ts'])))
add(figbox('LGDR sin compensar, con adelanto y con adelanto-atraso sobre la recta ζ = 0.456', code('''% Figura 4 · LGDR: sin compensar, adelanto y adelanto-atraso
s = tf('s');
G   = 1/(s*(s+7));
Gad = (s + 3)/(s + @PAD@);      % IV · b)
Gat = (s + @ZAT@)/(s + 0.01);   % IV · d)
zeta = -log(0.20)/sqrt(pi^2+log(0.20)^2);
th = acos(zeta); r = [0 20];
figure
rlocus(G, Gad*G, Gad*Gat*G); grid on
hold on
plot(-r*cos(th), r*sin(th),'m--', -r*cos(th),-r*sin(th),'m--')
plot(-7*[1 1], @WD@*[1 -1],'r*')   % IV · a)
axis([-16 2 -18 18])
legend('sin compensar','adelanto','adelanto-atraso')
title('LGDR con el compensador de adelanto-atraso')
hold off''', PAD=f(PAD), ZAT=f(ZAT, 5), WD=f(WDD))))
a1(figcap('Figura 4: LGDR sin compensar, con adelanto y con adelanto-atraso'))

# =============== V ===============
a1(h1('V.', 'Controlador final y parámetros'))
a1(eq('G_c(s)=\\f{s+3}{s+%.2f}·\\f{s+%.4f}{s+0.01},   K=%.1f' % (A['pad'], A['zat'], KA)))
a1(caption('Tabla 7: Parámetros del controlador final'))
add(table([1300, 1700, 1800], ['Parámetro', 'Diseño del libro', 'Ajustado (final)'],
          [['$T_{s}$ de diseño', '%.3f s' % META, '%.2f s' % A['Ts']], ['$s_{d}$', '$-7±j%.3f$' % WDD, '$-%.3f±j%.3f$' % (A['sg'], A['wd'])],
           ['Cero / polo del adelanto', '3 / %.3f' % PAD, '3 / %.3f' % A['pad']], ['Cero / polo del atraso', '%.4f / 0.01' % ZAT, '%.4f / 0.01' % A['zat']],
           ['K (re‑búsqueda)', f(KB, 1), f(KA, 1)], ['$K_{v}$', f(B['Kv'], 2), f(A['Kv'], 2)]]))
a1(para('El controlador final es el ajustado (VII · Paso 7). En Simulink van dos Transfer Fcn en cascada después del Gain K: adelanto [1 3]/[1 %.2f] y '
        'atraso [1 %.4f]/[1 0.01] (Figura 1).' % (A['pad'], A['zat'])))

# =============== VI ===============
a1(h1('VI.', 'Comprobación analítica'))
a1(h2link('Paso 1. Ecuación característica final y todos los polos en lazo cerrado', 'VI1'))
a1(eq('s(s+7)(s+p_{ad})(s+0.01)+K(s+3)(s+z_{at})=0'))
a1(eq('\\t{Libro: }s^4+%.2fs^3+%.2fs^2+%.2fs+%.2f=0' % tuple(DB[1:])))
a1(eq('\\t{Ajustado: }s^4+%.2fs^3+%.2fs^2+%.2fs+%.2f=0' % tuple(DA_[1:])))
a1(caption('Tabla 8: Polos en lazo cerrado del sistema compensado'))
add(table([900, 1950, 1950], ['Polo', 'Diseño del libro', 'Ajustado (final)'],
          [['p~{1,2}', '$%s$' % cs3(p1).replace('+', '±'), '$%s$' % cs3(q1).replace('+', '±')], ['p~{3}', '$%.3f$' % p3, '$%.3f$' % q3],
           ['p~{4}', '$%.4f$' % p4, '$%.4f$' % q4]]))
a1(resultado())
a1(eq('\\t{Libro: }p_{1,2}=%.3f±j%.3f' % (p1.real, p1.imag)))
a1(eq('p_3=%.3f,   p_4=%.4f' % (p3, p4)))
a1(eq('\\t{Ajustado: }p_{1,2}=%.3f±j%.3f' % (q1.real, q1.imag)))
a1(eq('p_3=%.3f,   p_4=%.4f' % (q3, q4)))
a1(para('Todas las raíces tienen parte real negativa. El sistema compensado es de cuarto orden: un polo junto al cero del adelanto ($-3$) y otro junto '
        'al cero del atraso.'))
a1(h2link('Paso 2. Estabilidad y comparación con los polos candidatos', 'VI2'))
a1(caption('Tabla 9: Arreglo de Routh del sistema compensado (primera columna)'))
add(table([1400, 1700, 1700], ['Fila', 'Libro', 'Ajustado'],
          [['s^^{4}', '1', '1'], ['s^^{3}', f(DB[1], 3), f(DA_[1], 3)], ['s^^{2}', f(RB[0], 3), f(RA[0], 3)], ['s^^{1}', f(RB[1], 3), f(RA[1], 3)],
           ['s^^{0}', f(DB[4], 3), f(DA_[4], 3)]]))
a1(para('En los dos diseños la primera columna es toda positiva: el sistema es estable. Con K como variable, un barrido de 10⁻⁴ a 10⁶ da siempre todas '
        'las raíces en el semiplano izquierdo: $0<K<∞$.'))
a1(caption('Tabla 10: Polos candidatos (diseño) contra polos obtenidos'))
difB = abs(p1 - sd) / abs(sd) * 100; difA = abs(q1 - A['sd']) / abs(A['sd']) * 100
add(table([1200, 1400, 1400, 800], ['Polos', 'Candidato', 'Obtenido', 'Dif. (%)'],
          [['Par (libro)', '$-7$\n$±j%.3f$\n(IV · a)' % WDD, '$%.3f$\n$±j%.3f$' % (p1.real, p1.imag), f(difB, 1)],
           ['Par (ajustado)', '$-%.3f$\n$±j%.3f$\n(VII · 7)' % (A['sg'], A['wd']), '$%.3f$\n$±j%.3f$' % (q1.real, q1.imag), f(difA, 1)]]))
a1(resultado())
a1(eq('0<K<∞,   Dif_{libro}=%.1f \\t{%%}' % difB))
a1(para('La diferencia es pequeña porque el atraso casi no cambia el ángulo; la re‑búsqueda la corrige.'))
a1(h2link('Paso 3. ¿Es razonable la aproximación de polos dominantes?', 'VI3'))
a1(caption('Tabla 11: Modos del sistema y residuos al escalón'))
add(table([1300, 1250, 1250, 1000], ['Polo', 'Residuo (libro)', 'Residuo (ajustado)', 'Lectura'],
          [['$p_{1,2}$', '$%.4f$\n$±j%.4f$\n(|r| = %.4f)' % (r1.real, r1.imag, abs(r1)), '$%.4f$\n$±j%.4f$\n(|r| = %.4f)' % (s1.real, s1.imag, abs(s1)), 'Dominante'],
           ['$p_{3}$ (junto a −3)', '$%.4f$ (%.0f %%)' % (r3, abs(r3) / abs(r1) * 100), '$%.4f$ (%.0f %%)' % (s3, abs(s3) / abs(s1) * 100), 'Cancelación parcial'],
           ['$p_{4}$ (atraso)', '$%.4f$ (%.1f %%)' % (r4, abs(r4) / abs(r1) * 100), '$%.4f$ (%.1f %%)' % (s4, abs(s4) / abs(s1) * 100), 'Casi cancelado; lento'],
           ['0 (escalón)', '1.000', '1.000', 'Valor final']]))
a1(blue('✎ Residuos en MATLAB: [num,den] = tfdata(Tc,\'v\'); [r,pp] = residue(num, conv(den,[1 0])).'))
a1(resultado())
a1(eq('\\t{Libro: }\\d{r_{1,2}}=%.4f,   r_3=%.4f,   r_4=%.4f' % (abs(r1), r3, r4)))
a1(eq('\\t{Ajustado: }\\d{r_{1,2}}=%.4f,   r_3=%.4f,   r_4=%.4f' % (abs(s1), s3, s4)))
a1(para('Conclusión: el polo $p_{3}≈%.2f$ está más cerca del eje que el par dominante y el cero en $-3$ sólo lo cancela en parte (residuo negativo, '
        '%.0f %% del dominante): su modo frena la llegada a 1 y alarga $T_{s}$. El modo del atraso es muy lento pero casi no pesa. La aproximación de '
        'segundo orden no es suficiente: se verifica con el modelo completo.' % (p3, abs(r3) / abs(r1) * 100)))
a1(h2link('Paso 4. Error estacionario correspondiente (analítico)', 'VI4'))
a1(eq('K_v=\\lim{s→0}{sKG_c(s)G(s)}=\\f{3Kz_{at}}{7p_{ad}p_{at}},   e_{rampa}(∞)=\\f{1}{K_v}'))
a1(resultado())
a1(eq('\\t{Libro: }K_v=%.2f,   e=%.5f  (×%.2f)' % (B['Kv'], 1 / B['Kv'], B['Kv'] / KV0)))
a1(eq('\\t{Ajustado: }K_v=%.2f,   e=%.5f  (×%.2f)' % (A['Kv'], 1 / A['Kv'], A['Kv'] / KV0)))
a1(para('La mejora queda un poco abajo de 10 porque la re‑búsqueda bajó K respecto a $K_{ad}$ (el atraso se calculó con $K_{ad}$); la diferencia es menor '
        'que 1 %%. Al escalón el error sigue siendo cero (tipo 1).'))
a1(advert())

# =============== VII ===============
a1(h1('VII.', 'Comprobación en MATLAB'))
a1(italic('Pasos 5, 6 y 7 de la verificación del sistema completo, con el modelo completo (sin simplificar polos).'))
a1(h2link('Paso 5. Simulación de las entradas requeridas y desempeño del modelo completo', 'VII5'))
SIMC = '''s = tf('s');
G  = 1/(s*(s+7));
Tu = feedback(@K0@*G, 1);                                       % sin compensar
Tb = feedback(@KB@*(s+3)/(s+@PB@)*(s+@ZB@)/(s+0.01)*G, 1);    % libro
Ta = feedback(@KA@*(s+3)/(s+@PA@)*(s+@ZA@)/(s+0.01)*G, 1);    % ajustado'''
SIMK = dict(K0=f(K0, 2), KB=f(KB, 2), PB=f(PAD, 3), ZB=f(ZAT, 4), KA=f(KA, 2), PA=f(A['pad'], 3), ZA=f(A['zat'], 4))
add(figbox('Respuesta al escalón: sin compensar, diseño del libro y ajustado', code('% Figura 5 · Escalón\n' + SIMC + '''
figure
step(Tu, Tb, Ta, 1.5); grid on
legend('sin compensar','libro','ajustado')
title('Respuesta al escalón unitario')''', **SIMK)))
a1(figcap('Figura 5: Respuesta al escalón sin compensar, con el diseño del libro y con el ajustado'))
add(figbox('Salida de pole, stepinfo y residuos en la Command Window (captura)', code('% Figura 6 · Command Window\n' + SIMC + '''
pole(Tb), pole(Ta)
stepinfo(Tu)
stepinfo(Tb)
stepinfo(Ta)
[num,den] = tfdata(Ta,'v');
[r,pp] = residue(num, conv(den,[1 0]))''', **SIMK)))
a1(figcap('Figura 6: Salida de pole, stepinfo y residuos en la Command Window (captura)'))
a1(caption('Tabla 12: Especificaciones contra desempeño simulado'))
add(table([1150, 1050, 1300, 1300], ['Especificación', 'Meta', 'Libro', 'Ajustado (final)'],
          [['$T_{s}$', '≤ %.3f s' % META, '%.3f s\nNo cumple' % IB['ts'], '%.3f s\nSí' % IA['ts']],
           ['%OS', '≈ 20 %', '%.2f %%' % IB['os'], '%.2f %%\nSí (menor)' % IA['os']],
           ['$e_{rampa}(∞)$', '≤ %.4f (÷10)' % EMETA, '%.5f\nCasi (×%.2f)' % (EB, E0 / EB), '%.5f\nCasi (×%.2f)' % (EA, E0 / EA)],
           ['Estabilidad', 'Estable', 'Sí', 'Sí']]))
a1(resultado())
a1(eq('\\t{Libro: }T_s=%.3f  \\t{s},   \\%%OS=%.2f \\t{%%}' % (IB['ts'], IB['os'])))
a1(eq('\\t{Ajustado: }T_s=%.3f  \\t{s},   \\%%OS=%.2f \\t{%%}' % (IA['ts'], IA['os'])))
a1(para('El diseño del libro no cumple $T_{s}$ (%.3f s > %.3f s): el modo del polo $%.2f$, parcialmente cancelado con el cero en −3, retrasa la llegada '
        'a la banda de 2 %%. El sobrepaso bajó a %.2f %% por la misma razón. El ajustado cumple $T_{s}$.' % (IB['ts'], META, p3, IB['os'])))
a1(h2link('Paso 6. Error estacionario simulado', 'VII6'))
add(figbox('Error ante rampa e(t) = t − c(t): sin compensar, libro y ajustado', code('% Figura 7 · Error a rampa\n' + SIMC + '''
t = 0:0.005:130;
cu = lsim(Tu,t,t); cb = lsim(Tb,t,t); ca = lsim(Ta,t,t);
figure
plot(t, t'-cu, t, t'-cb, t, t'-ca); grid on
xlim([0 60]); ylim([0 0.15])
xlabel('t (s)'); ylabel('e(t) = t - c(t)')
legend('sin compensar','libro','ajustado')
title('Error ante rampa unitaria')
e_u = t(end)-cu(end), e_b = t(end)-cb(end), e_a = t(end)-ca(end)''', **SIMK)))
a1(figcap('Figura 7: Error ante rampa e(t) = t − c(t): sin compensar, libro y ajustado'))
a1(resultado())
a1(eq('e_u(130)=%.4f,   e_b(130)=%.5f,   e_a(130)=%.5f' % (RN['ref_e'], EB, EA)))
a1(para('El error llega a su valor final despacio por el modo del atraso ($τ≈%.0f$ s); a los 130 s ya coincide con el analítico: %.2f veces menor que sin '
        'compensar.' % (-1 / q4, E0 / EA)))
a1(h2link('Paso 7. Ajuste del diseño y repetición de la verificación', 'VII7'))
a1(para('Como $T_{s}$ no cumple, se repite el diseño completo (IV · a–e) pidiendo un $T_{s}$ de diseño menor, con el mismo cero en −3, $p_{at}=0.01$ y la '
        'razón del atraso recalculada para $K_{v}$ ×10. Se simula el modelo completo con cada prueba:'))
for t, pad, zat, K, ts, os_ in TESTS:
    a1(eq('T_{s,d}=%.3f:   p_{ad}=%.2f,   K=%.1f,   T_{s,sim}=%.3f' % (t, pad, K, ts)))
a1(para('La primera prueba que cumple es $T_{s,d}=%.2f$ s:' % A['Ts']))
a1(resultado())
a1(eq('s_d=-%.3f±j%.3f,   p_{ad}=%.3f,   z_{at}=%.4f' % (A['sg'], A['wd'], A['pad'], A['zat'])))
a1(eq('K=%.2f,   T_s=%.3f  \\t{s},   \\%%OS=%.2f \\t{%%}' % (KA, IA['ts'], IA['os'])))
a1(eq('K_v=%.2f,   e=%.5f  (×%.2f)' % (A['Kv'], EA, E0 / EA)))
a1(para('Re‑verificación: polos $%.3f±j%.3f$, $%.3f$ y $%.4f$ (VI · Paso 1), estable para toda K (VI · Paso 2). Cumple $T_{s}$ y el error queda 9.9 veces '
        'menor (prácticamente 10).' % (q1.real, q1.imag, q3, q4)))
add(figbox('Ajuste: T~{s} simulado contra el T~{s} de diseño y respuesta del libro contra la ajustada', '''% Figura 8 · Ajuste del Ts de diseño
s = tf('s');
G = 1/(s*(s+7));
zeta = -log(0.20)/sqrt(pi^2+log(0.20)^2); Kv_meta = 10*''' + f(K0, 4) + '''/7;
for Tsd = [0.571 0.54 0.51 0.48]
  sg = 4/Tsd; sd = -sg + 1i*sg*tan(acos(zeta));
  thp = pi + angle(sd+3) - angle(sd) - angle(sd+7);
  pad = sg + imag(sd)/tan(thp);                      % polo del adelanto
  Kad = abs(sd)*abs(sd+7)*abs(sd+pad)/abs(sd+3);
  zat = 0.01*Kv_meta/(3*Kad/(7*pad));                % cero del atraso
  L = (s+3)/(s+pad)*(s+zat)/(s+0.01)*G;
  [k,p] = rlocfind(L, sd);                            % K cerca de sd
  info = stepinfo(feedback(k*L,1));
  fprintf('Tsd=%.3f pad=%.3f zat=%.4f K=%.1f Ts=%.3f\\n', ...
          Tsd, pad, zat, k, info.SettlingTime)
end'''))
a1(figcap('Figura 8: Ajuste: Tₛ simulado contra el Tₛ de diseño'))
a1(h2('Modelo en Simulink'))
add(figbox('Respuesta en el Scope de Simulink del sistema final (pega también la captura del modelo)',
           '% Figura 9 · Scope de Simulink (sistema final)\n' + SL + "\nset_param(m,'StopTime','2')\nopen_system([m '/Scope'])\nsim(m);                      % corre 2 s"))
a1(figcap('Figura 9: Respuesta en el Scope de Simulink del sistema final'))

# =============== VIII ===============
a1(h1('VIII.', 'Comparación y discusión'))
a1(caption('Tabla 13: Comparación: libro, cálculo analítico y MATLAB'))
add(table([1400, 1150, 1150, 1100], ['Magnitud', 'Libro', 'Analítico', 'MATLAB'],
          [['$T_{s}$ sin compensar (s)', '1.143', f(TS2, 3), f(RI['ts'], 3)],
           ['$e_{rampa}$ sin compensar', '0.1188', f(E0, 4), f(RN['ref_e'], 4)],
           ['Polo del adelanto', '—', '−%.3f' % PAD, '—'],
           ['K (libro)', '205.4', f(KB, 1), '—'],
           ['$T_{s}$ libro (s)', '0.571', f(4 / -p1.real, 3), f(IB['ts'], 3)],
           ['%OS libro', '20', f(OS2, 1), f(IB['os'], 2)],
           ['$e_{rampa}$ libro', '0.0119', f(1 / B['Kv'], 5), f(EB, 5)],
           ['Ajustado: $p_{ad}$ / K', '—', '%.2f / %.1f' % (A['pad'], KA), '—'],
           ['$T_{s}$ ajustado (s)', '—', f(4 / -q1.real, 3), f(IA['ts'], 3)],
           ['$e_{rampa}$ ajustado', '—', f(1 / A['Kv'], 5), f(EA, 5)]]))
a1(gray('Los valores analíticos coinciden con el libro. Las diferencias con MATLAB no son de redondeo: el análisis de segundo orden ignora el polo junto '
        'al cero del adelanto (−%.2f), que sólo se cancela en parte y alarga T~{s} a %.3f s, y el modo del atraso, lento pero de residuo muy pequeño. '
        'Por eso la verificación obligó a ajustar: con T~{s} de diseño %.2f s el modelo completo da %.3f s y cumple, con el error %.2f veces menor.'
        % (-p3, IB['ts'], A['Ts'], IA['ts'], E0 / EA)))

# =============== IX ===============
a1(h1('IX.', 'Conclusiones y limitaciones demostradas'))
a1(gray('El adelanto, con el cero fijo en −3, ubicó su polo en −%.3f y llevó los polos dominantes al doble de σ; el atraso, con razón z~{at}/p~{at} = %.2f, '
        'subió K~{v} casi sin mover el LGDR (−%.2f°). Juntos atacan dos especificaciones distintas: transitorio y error.' % (PAD, RAT, -B['dip'])))
a1(gray('Se demostró la limitación de la aproximación de segundo orden: el polo junto al cero −3 no se cancela del todo y el T~{s} real (%.3f s) no cumplió; '
        'se ajustó el T~{s} de diseño a %.2f s y el sistema final cumple con T~{s} = %.3f s y error %.2f veces menor.' % (IB['ts'], A['Ts'], IA['ts'], E0 / EA)))
a1(gray('El precio del atraso es un modo muy lento (τ ≈ %.0f s): el error a rampa tarda en llegar a su valor final.' % (-1 / q4)))
a1(h2('Conclusión individual'))
a1(gray('En esta práctica aprendí que el adelanto-atraso se diseña en dos partes independientes: el adelanto para la velocidad de la respuesta y el atraso '
        'para el error, porque su cero y su polo pegados al origen casi no cambian el LGDR.'))
a1(gray('Lo más importante fue la verificación: con el diseño del libro el tiempo de asentamiento salió de %.3f s y no cumplía; con los residuos entendí '
        'que el culpable era el polo junto al cero −3, y con MATLAB probé varios T~{s} de diseño hasta cumplir.' % IB['ts']))
a1(gray('Concluyo que hay que comprobar siempre el diseño con el modelo completo, porque cada polo que agrega el compensador puede cambiar la respuesta.'))
out.append('#SECT2')
