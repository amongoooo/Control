# -*- coding: utf-8 -*-
r"""v76 · Completa el «∑ Formulario» (dialog#fxDlg) de index.html sin quitar nada de v74.

Uso:  python3 -I herramientas/formulario-v76.py index.html

En cada sección `section#fxsN` agrega, justo antes de `</section>` y entre `<!--v76:N-->` y `<!--/v76:N-->`
(se puede volver a correr: primero borra lo que había entre esos marcadores):
  · filas nuevas con lo que hacía falta para contestar las preguntas de las evaluaciones (CHK y VAR),
  · «Despejes» de las fórmulas de la sección,
  · «Ideas clave» (para las preguntas de concepto) y
  · «Variables» (símbolo y qué es).
Todo va en filas `div.fx-r` hijas directas de la sección, con `data-k`, así el buscador de v74 las filtra.

Mini‑lenguaje (fórmulas y celdas):
  \f{num}{den} fracción · \r{x} raíz · \t{texto} texto recto · \i{x} cursiva · \b{x} negritas
  _x  _{xx} subíndice · ^x  ^{xx} superíndice · dos espacios = separación (la fórmula sólo se parte ahí)
  Letras = variables en cursiva, salvo las palabras de FUNCS (cos, sen, ln…). Notas, ideas y variables: sin
  cursivas automáticas (sí \f, \r, _ y ^). Subíndices de varias letras siempre con llaves: z_{PD}.
"""
import re, sys, html

FUNCS = {'cos', 'sen', 'tan', 'arccos', 'arctan', 'ln', 'lím', 'OS', 'máx', 'mín', 'rad', 'Re', 'Im',
         'atan', 'dB'}
GREEK_IT = set('σωζθτφα')


def esc(c):
    return html.escape(c, quote=False)


def italics(txt):
    """Cursivas en las variables de un tramo de texto plano (ya sin macros)."""
    out = []
    for tok in re.findall(r'[A-Za-zÁÉÍÓÚáéíóúñ]+| {2,}|.', txt, re.S):
        if tok.startswith('  '):
            out.append('<span class="fx-g"></span>' if len(tok) >= 4 else '<span class="fx-g s"></span>')
        elif re.match(r'[A-Za-zÁÉÍÓÚáéíóúñ]', tok):
            if tok in FUNCS:
                out.append(esc(tok))
            else:
                out.append(''.join(f'<i>{esc(ch)}</i>' for ch in tok))
        elif tok in GREEK_IT:
            out.append(f'<i>{tok}</i>')
        else:
            out.append(esc(tok))
    return ''.join(out)


def parse(s, it=True):
    i = 0
    out = []
    buf = []

    def flush():
        if buf:
            t = ''.join(buf)
            out.append(italics(t) if it else re.sub(r' {2,}', ' ', esc(t)))
            buf.clear()

    def group(j):
        """Lee {…} desde s[j] == '{'; devuelve (contenido, índice siguiente)."""
        assert s[j] == '{', (s, j)
        d = 0
        for k in range(j, len(s)):
            if s[k] == '{':
                d += 1
            elif s[k] == '}':
                d -= 1
                if d == 0:
                    return s[j + 1:k], k + 1
        raise ValueError('llave sin cerrar: ' + s)

    while i < len(s):
        c = s[i]
        if c == '\\' and i + 1 < len(s) and s[i + 1] in '{}%':
            buf.append(s[i + 1])
            i += 2
        elif c == '\\' and i + 1 < len(s) and s[i + 1] in 'frtib' and i + 2 < len(s) and s[i + 2] == '{':
            flush()
            m = s[i + 1]
            a, j = group(i + 2)
            if m == 'f':
                b, j = group(j)
                out.append(f'<span class="fr"><span>{parse(a, it)}</span><span>{parse(b, it)}</span></span>')
            elif m == 'r':
                out.append(f'√<span class="rt">{parse(a, it)}</span>')
            elif m == 't':
                out.append(parse(a, False))
            elif m == 'i':
                out.append(f'<i>{parse(a, False)}</i>')
            elif m == 'b':
                out.append(f'<b>{parse(a, it)}</b>')
            i = j
        elif c in '_^' and i + 1 < len(s):
            flush()
            tag = 'sub' if c == '_' else 'sup'
            if s[i + 1] == '{':
                a, j = group(i + 1)
            else:
                a, j = s[i + 1], i + 2
            inner = parse(a, it and c == '^')  # subíndices rectos, exponentes con cursivas
            out.append(f'<{tag}>{inner}</{tag}>')
            i = j
        else:
            buf.append(c)
            i += 1
    flush()
    return ''.join(out)


def N(s):
    """Notas: sin cursivas automáticas; **negritas**."""
    s = re.sub(r'\*\*(.+?)\*\*', r'\\b{\1}', s)
    return parse(s, False)




def split_top(x):
    """Parte una línea en los espacios dobles (o más) que no están dentro de llaves."""
    out, d, cur, i = [], 0, '', 0
    while i < len(x):
        c = x[i]
        if c == '{' and not (i and x[i - 1] == '\\'):
            d += 1
        elif c == '}' and not (i and x[i - 1] == '\\'):
            d -= 1
        if c == ' ' and d == 0 and x[i:i + 2] == '  ':
            j = i
            while j < len(x) and x[j] == ' ':
                j += 1
            out.append((cur, j - i))
            cur, i = '', j
            continue
        cur += c
        i += 1
    out.append((cur, 0))
    return out


def line(x):
    """Una línea de fórmula: cada tramo entre espacios dobles no se parte; entre tramos sí."""
    h = ''
    for seg, gap in split_top(x):
        if seg and re.fullmatch(r'\\t\{[^{}]*\}', seg):  # sólo texto: puede partirse
            h += parse(seg)
        elif seg:
            h += f'<span class="fx-it">{parse(seg)}</span>'
        if gap:
            h += '<span class="fx-g"></span> ' if gap >= 4 else '<span class="fx-g s"></span> '
    return h




# ------------------------------------------------------------------------------------------
# Contenido por sección (número de la sección del formulario = número en Teoría).
#   R(líneas…, d=[despejes], n='nota', k='palabras para el buscador')   fila de fórmula
#   T(encabezados, filas, n='nota', k='…')                               tabla
#   D(['fórmula ⇒ despeje', …])                                          fila «Despejes»
#   ideas: lista de frases · vars: [(símbolo, qué es)]
# ------------------------------------------------------------------------------------------
ADD = {}


def R(*m, d=(), n='', k=''):
    return dict(m=list(m), d=list(d), n=n, k=k)


def T(head, rows, n='', k=''):
    return dict(tab=(head, rows), n=n, k=k)


def D(items, n=''):
    return dict(dsp=list(items), n=n)


def sec(n, rows=(), ideas=(), vars=()):
    ADD[n] = dict(rows=list(rows), ideas=list(ideas), vars=list(vars))


# ============================== Parte I ==============================
sec(1, [
    T(['σ', 'ω', '\\t{La señal es…}'], [
        ['σ < 0', 'ω = 0', '\\t{una exponencial que decae}'],
        ['σ > 0', 'ω = 0', '\\t{una exponencial que crece}'],
        ['σ = 0', 'ω > 0', '\\t{una oscilación sostenida}'],
        ['σ < 0', 'ω > 0', '\\t{una oscilación que se apaga}'],
        ['σ > 0', 'ω > 0', '\\t{una oscilación que crece}']], k='decae crece sostenida oscilacion punto plano'),
    T(['\\t{Si mueves el punto…}', '\\t{la señal…}'], [
        ['\\t{hacia arriba (mismo σ, ω mayor)}', '\\t{oscila más rápido y se apaga igual}'],
        ['\\t{a la izquierda (σ más negativo)}', '\\t{oscila igual y se apaga más rápido}'],
        ['\\t{hacia abajo hasta el eje real (ω → 0)}', '\\t{deja de oscilar y se apaga igual}'],
        ['\\t{a la derecha cruzando el eje jω}', '\\t{oscila igual y pasa a crecer}'],
        ['\\t{a la izquierda y hacia abajo}', '\\t{oscila más lento y se apaga más rápido}']], k='mover arriba izquierda abajo derecha'),
    D(['T = \\f{2π}{ω}  ⇒  ω = \\f{2π}{T}', 'f = \\f{1}{T} = \\f{ω}{2π}'],
      n='Ej.: s = −0.5 ± j3 → T = 2π/3 = 2.09 s (σ no cambia el periodo; ω es la parte imaginaria sin el ±).'),
], ideas=['La envolvente e^{σt} sólo depende de σ; qué tan rápido oscila sólo depende de ω.'],
   vars=[('s', 'variable compleja de Laplace (un punto del plano s)'), ('σ', 'parte real: ritmo de decaimiento (1/s)'),
         ('ω', 'parte imaginaria: frecuencia de oscilación (rad/s)'), ('j', '\\r{−1}'), ('t', 'tiempo (s)'),
         ('T', 'periodo de oscilación (s)'), ('f', 'frecuencia en Hz')])

sec(2, [
    R('ℒ\\{3ẋ\\} = 3sX(s)    ℒ\\{ẋ + x\\} = (s + 1)X(s)    ℒ\\{∫_0^t x dτ\\} = \\f{X(s)}{s}',
      n='Las constantes se quedan, la transformada de una suma es la suma, cada derivada da un factor s (ẍ → s²) e integrar divide entre s.',
      k='laplace derivada integral constante suma'),
    R('aÿ + bẏ + cy = d·u(t)  ⇒  G(s) = \\f{Y(s)}{U(s)} = \\f{d}{as^2 + bs + c}',
      d=['G(0) = \\f{d}{c}', 'Y(s) = G(s)·U(s)'],
      n='Ganancia DC: pon s = 0 (sólo quedan los términos sin derivada). Ej.: 2ÿ + 8ẏ + 6y = u → G(0) = 1/6 = 0.167; polos 2(s + 1)(s + 3) = 0 → −1 y −3.',
      k='ganancia dc g(0) ecuacion diferencial coeficientes'),
    R('\\t{Sin entrada, con} x = e^{st}:  e^{st}·D(s) = 0  ⇒  D(s) = 0',
      n='Por eso las raíces del denominador (los polos) son los modos naturales: como e^{st} ≠ 0, la ecuación sin entrada sólo se cumple si D(s) = 0.',
      k='modos naturales por que polos raices denominador'),
], vars=[('x(t), X(s)', 'señal en el tiempo y su transformada'), ('ẋ, ẍ', 'primera y segunda derivada'),
         ('u, y', 'entrada y salida'), ('G(s)', 'función de transferencia = Y(s)/U(s)'),
         ('G(0)', 'ganancia DC = valor final ante un escalón unitario (si es estable)'),
         ('D(s)', 'denominador de G (sus raíces son los polos)'), ('a, b, c, d', 'coeficientes de la ecuación'),
         ('m, b, k', 'masa, amortiguamiento y resorte')])

sec(3, [
    R('(s + a)  ⇒  \\t{raíz en}  s = −a',
      n='Ojo con el signo. Ej.: (s + 5)/[s(s + 2)(s + 10)] → polos 0, −2 y −10; cero en −5. Si arriba sólo hay un número (p. ej. 10), no tiene ceros finitos.',
      k='signo factor polo cero raiz'),
    R('d = |s_0 − p| = \\r{(σ_0 − p)^2 + ω_0^2}',
      n='Distancia de un polo o cero real p al punto s_0 = σ_0 + jω_0 (para |G|; el ángulo está en la sección 11). Ej.: 10/[(s + 1)(s + 4)] en −1 + j4: d = 4 y 5 → |G| = 10/(4·5) = 0.5.',
      k='distancia vector magnitud'),
    D(['b^2 − 4ac < 0  ⇒  s = −\\f{b}{2a} ± j\\f{\\r{4ac − b^2}}{2a}', 'b^2 − 4ac ≥ 0  ⇒  \\t{dos polos reales}'],
      n='Fórmula general con discriminante negativo: polos complejos con parte real −b/2a.'),
], ideas=['En un cero |G| = 0 (el numerador vale 0: el punto “clavado al piso” de la carpa).',
          'En un polo |G| → ∞ (el denominador vale 0: un “poste” de la carpa).'],
   vars=[('K', 'ganancia'), ('N(s), D(s)', 'numerador y denominador'), ('z_i', 'ceros: raíces de N (○)'),
         ('p_i', 'polos: raíces de D (×)'), ('m, n', 'número de ceros y de polos'), ('s_0', 'punto donde se evalúa G'),
         ('d', 'distancia de un polo o cero al punto'), ('θ', 'ángulo de ese vector')])

sec(4, [
    R('y(mτ) = 1 − e^{−m}', d=['t = −τ·ln(1 − y)'], n='Fracción del valor final a las m constantes de tiempo, y el tiempo para llegar a una fracción y.',
      k='porcentaje constante de tiempo tau 63 86 95 98'),
    T(['t', 'τ/2', 'τ', '2τ', '3τ', '4τ', '5τ'], [['y \\t{(%)}', '39.3', '63.2', '86.5', '95.0', '98.2', '99.3']],
      k='tabla porcentaje tau'),
    R('\\f{τ_{nueva}}{τ} = \\f{a}{a_{nueva}}',
      n='Si el polo pasa de −a a −a_{nueva}, τ y T_s se multiplican por a/a_{nueva}: la respuesta es a_{nueva}/a veces más rápida (o a/a_{nueva} veces más lenta). Ej.: −2 → −8: 4 veces más rápida; −6 → −2: 3 veces más lenta. Un polo real nunca oscila.',
      k='mas rapida lenta veces mover polo'),
    D(['τ = \\f{1}{a}  ⇒  a = \\f{1}{τ}', 'T_s ≈ \\f{4}{a}  ⇒  a = \\f{4}{T_s}', 'τ = \\f{T_s}{4}'],
      n='Ej.: polo en −2.5 → τ = 0.4 s y T_s = 4/2.5 = 1.6 s.'),
], vars=[('a', 'distancia del polo al origen (1/s); el polo está en −a'), ('τ', 'constante de tiempo (s)'),
         ('T_s', 'tiempo de asentamiento al 2 % (s)'), ('T_r', 'tiempo de subida 10 % → 90 % (s)'),
         ('y(t)', 'salida normalizada (valor final 1)'), ('m', 'número de constantes de tiempo')])

sec(5, [
    T(['ζ', '\\t{Nombre}', '\\t{Polos}'], [
        ['ζ > 1', '\\t{sobreamortiguado}', '\\t{dos reales distintos}'],
        ['ζ = 1', '\\t{críticamente amortiguado}', '\\t{uno real doble}'],
        ['0 < ζ < 1', '\\t{subamortiguado}', '\\t{complejos conjugados}'],
        ['ζ = 0  \\t{(sin término} s\\t{)}', '\\t{sin amortiguamiento}', '\\t{sobre el eje jω: oscila siempre}'],
        ['ζ < 0', '\\t{inestable}', '\\t{semiplano derecho}']], k='clasificacion sobreamortiguado subamortiguado critico sin amortiguamiento'),
    D(['ω_n = \\r{c}  ⇒  c = ω_n^2', 'ζ = \\f{b}{2ω_n}  ⇒  b = 2ζω_n', 'ζ = \\f{b}{2\\r{c}}', 'ζ = cos θ  ⇒  θ = arccos ζ', 'σ = ζω_n'],
      n='Ej.: s² + 6s + 25 → ω_n = 5, ζ = 0.6 (polos −3 ± j4). s² + 10s + 16 → ω_n = 4, ζ = 1.25 (polos −2 y −8).'),
], ideas=['ζ fija el ángulo (la forma y el %OS); ω_n es la distancia al origen (la rapidez). Con ζ fija, duplicar ω_n da la misma forma pero el doble de rápida: todos los tiempos a la mitad.'],
   vars=[('ω_n', 'frecuencia natural = distancia del polo al origen (rad/s)'), ('ζ', 'factor de amortiguamiento (sin unidades)'),
         ('ω_d', 'frecuencia amortiguada = parte imaginaria (rad/s)'), ('σ', 'parte real del polo, sin signo (1/s)'),
         ('θ', 'ángulo del polo medido desde el eje real negativo'), ('b, c', 'coeficientes de s² + bs + c')])

sec(6, [
    T(['\\t{Si comparten…}', '\\t{Igual}', '\\t{En el plano s}'], [
        ['\\t{la parte real} σ', 'T_s', '\\t{recta vertical}'],
        ['\\t{la parte imaginaria} ω_d', 'T_p', '\\t{recta horizontal}'],
        ['ζ \\t{(el mismo ángulo)}', '\\%OS', '\\t{recta radial}'],
        ['\\t{la distancia al origen}', 'ω_n', '\\t{círculo}']],
      n='Ej.: −2 ± j3 y −2 ± j6 → mismo T_s (2 s); −2 ± j3 y −5 ± j3 → mismo T_p; −2 ± j3 y −4 ± j6 → mismo %OS; −3 ± j4 y −4 ± j3 → mismo ω_n = 5.',
      k='igual comparten mismo ts tp os wn'),
    D(['T_s ≈ \\f{4}{σ}  ⇒  σ = \\f{4}{T_s}', 'T_p = \\f{π}{ω_d}  ⇒  ω_d = \\f{π}{T_p}', 'ζ = \\f{σ}{ω_n}  ⇒  σ = ζω_n',
       'ω_d = ω_n\\r{1 − ζ^2}', 'tan θ = \\f{ω_d}{σ}', 'ζ = \\f{−ln(\\%OS/100)}{\\r{π^2 + ln^2(\\%OS/100)}}'],
      n='Ej.: −4 ± j3 → ω_n = 5, ζ = 0.8 → %OS = 100·e^{−0.8π/0.6} = 1.52 %.'),
], vars=[('\\%OS', 'sobrepaso en porcentaje'), ('T_s', 'tiempo de asentamiento al 2 % (s)'), ('T_p', 'tiempo pico (s)'),
         ('T_r', 'tiempo de subida 10 % → 90 % (s)'), ('σ', 'parte real del par, sin signo'), ('ω_d', 'parte imaginaria del par (rad/s)'),
         ('ω_n', 'distancia del par al origen'), ('ζ', 'amortiguamiento'), ('c_{máx}, c_{final}', 'pico y valor final de la respuesta'),
         ('ln', 'logaritmo natural')])

sec(7, [
    R('G(s) = \\f{c}{(s + p_1)(s + p_2)}:    A_1 = \\f{c}{(−p_1)(p_2 − p_1)}    A_2 = \\f{c}{(−p_2)(p_1 − p_2)}',
      d=['A_0 = G(0) = \\f{c}{p_1p_2}', 'A_0 + A_1 + A_2 = y(0) = 0'],
      n='Dos polos reales (en −p_1 y −p_2). Ej.: 6/[(s + 2)(s + 3)] → A_1 = 6/(−2·1) = −3, A_2 = 6/(−3·(−1)) = 2, A_0 = 1. Comprobación: 1 − 3 + 2 = 0.',
      k='residuo dos polos a1 a2 ejemplo'),
], ideas=['El término que tarda más en apagarse es el del polo más cercano al eje jω (el dominante). Ej.: polos −1, −2 y −20 → el de −1.',
          'Un cero muy cerca de un polo hace pequeño el residuo de ese polo (es proporcional a la distancia polo‑cero): el modo existe pero pesa poco.'],
   vars=[('A_i', 'residuo: peso del modo e^{p_it} en la respuesta'), ('A_0', 'residuo en s = 0 = valor final'),
         ('p_i', 'polo i (con su signo)'), ('e^{p_it}', 'modo natural del polo p_i'), ('r_1, r_3', 'residuos del par dominante y del tercer polo')])

sec(8, [
    T(['\\t{Cero en}', 'c = −1/z', '\\t{Efecto}'], [
        ['z < 0 \\t{(izquierdo)}', 'c > 0', '\\t{suma la derivada → más sobrepaso}'],
        ['z > 0 \\t{(derecho)}', 'c < 0', '\\t{resta la derivada → subpaso (fase no mínima)}']], k='cero izquierdo derecho subpaso sobrepaso'),
    D(['y = y_0 + c·ẏ_0  con  c = −\\f{1}{z}', 'z = −\\f{1}{c}'], n='z es la posición del cero (con su signo). Ej.: z = −4 → c = 0.25; z = 2 → c = −0.5.'),
], ideas=['Entre más cerca del origen esté un cero izquierdo, más grande es |c| = 1/|z| y más sobrepaso agrega. Ej.: con polos −1 ± j2, un cero en −1.5 (c = 0.67) sube más el %OS que uno en −8 (0.125) o en −20 (0.05).',
          'Agregar un cero NO cambia los polos (los modos): sólo cambia sus residuos y la forma de la respuesta.'],
   vars=[('z', 'ubicación del cero en el eje real (con signo)'), ('T_0, y_0', 'sistema sin el cero y su respuesta al escalón'),
         ('ẏ_0', 'derivada de y_0'), ('c', 'coeficiente que multiplica a la derivada')])

# ============================== Parte II ==============================
sec(9, [
    R('G = \\f{1}{s(s + a)}:  s^2 + as + K = 0  ⇒  s = \\f{−a ± \\r{a^2 − 4K}}{2}',
      d=['K > \\f{a^2}{4}:  s = −\\f{a}{2} ± j\\f{\\r{4K − a^2}}{2}', 'ω_n = \\r{K}', 'ζ = \\f{a}{2\\r{K}}'],
      n='Ej.: a = 4, K = 8 → s = −2 ± j2 (parte real −2, ζ = 0.707).', k='ecuacion caracteristica segundo orden parte real'),
], vars=[('K', 'ganancia (lo que mueve el LGDR)'), ('G', 'planta'), ('G_c', 'compensador'),
         ('T(s)', 'función de transferencia en lazo cerrado'), ('N, D', 'numerador y denominador de G'),
         ('E(s), R(s)', 'error y referencia (entrada)')])

sec(10, [
    T(['\\t{Especificación}', '\\t{En el plano s}'], [
        ['T_s  \\t{(o} σ\\t{)}', '\\t{recta vertical}'], ['T_p  \\t{(o} ω_d\\t{)}', '\\t{recta horizontal}'],
        ['\\%OS  \\t{(o} ζ\\t{)}', '\\t{recta radial desde el origen}'], ['ω_n', '\\t{círculo centrado en el origen}']],
      k='especificacion recta vertical horizontal radial circulo'),
    D(['σ = \\f{4}{T_s}  ⇒  T_s = \\f{4}{σ}', 'ω_d = \\f{π}{T_p}  ⇒  T_p = \\f{π}{ω_d}', 'ω_d = σ·tan θ  ⇒  σ = \\f{ω_d}{tan θ}',
       '\\%OS = 100·e^{−ζπ/\\r{1 − ζ^2}}'],
      n='Ej.: %OS = 10 % y T_s = 2 s → ζ = 0.591, θ = 53.76°, σ = 2, ω_d = 2·1.364 = 2.73 rad/s.'),
], ideas=['Menos %OS → ζ mayor → ángulo θ menor → el punto queda más cerca del eje real (negativo).',
          'T_s menor → σ mayor → el punto queda más a la izquierda (más lejos del eje jω).'],
   vars=[('s_d', 'punto de diseño (polo deseado en lazo cerrado)'), ('σ, σ_d', 'parte real de s_d, sin signo'),
         ('ω_d', 'parte imaginaria de s_d'), ('θ', 'ángulo de la recta de ζ desde el eje real negativo'), ('n', 'veces más rápido')])

sec(11, [
    R('G = \\f{1}{s(s + a)}  \\t{en}  s = −\\f{a}{2} + jb:   |s| = |s + a| = \\r{(a/2)^2 + b^2}  ⇒  K = (\\f{a}{2})^2 + b^2',
      n='Ej.: 1/[s(s + 6)] en −3 + j4 → distancias 5 y 5 → K = 5·5 = 25.', k='magnitud ejemplo distancia'),
    D(['K = \\f{1}{|G(s)|}  ⇔  |G(s)| = \\f{1}{K}', '\\t{Si} G = g·\\f{N}{D}:  K = \\f{∏ d_{polos}}{g·∏ d_{ceros}}']),
], ideas=['Ángulo → dice si el punto pertenece al LGDR (no depende de K). Magnitud → dice qué K pone un polo ahí.',
          'En un punto del LGDR, Σθ_{ceros} − Σθ_{polos} = ±180° (−180°, 180°, 540°…), porque KG(s) = −1.'],
   vars=[('θ', 'ángulo del vector desde un polo o cero hasta el punto (desde el eje real positivo)'), ('k', 'entero: 0, ±1, ±2…'),
         ('d', 'distancia de un polo o cero al punto'), ('g', 'número del numerador de G (su ganancia propia)'), ('Δ', 'ángulo que le falta o sobra al punto')])

sec(12, [
    R('\\t{n.º de asíntotas} = n − m', n='Las ramas que se van al infinito. Ej.: 4 polos y 1 cero → 3 asíntotas (a 60°, 180° y 300°); 2 polos sin ceros → 2 (±90°).',
      k='numero de asintotas cuantas'),
    T(['n − m', '1', '2', '3', '4'], [['θ_a', '180°', '±90°', '60°, 180°, 300°', '±45°, ±135°']], k='angulos asintotas'),
    R('\\t{Eje real: cuenta de derecha a izquierda los polos + ceros reales; impar = es del LGDR}',
      n='Ej.: 1/[s(s + 2)(s + 5)] → [−2, 0] (1) y (−∞, −5] (3); [−5, −2] no (2). (s + 4)/[s(s + 2)] → [−2, 0] y (−∞, −4]. (s + 3)/[(s + 1)(s + 5)(s + 8)] → [−3, −1] y [−8, −5].',
      k='eje real tramos impar'),
    D(['σ_a = \\f{Σp − Σz}{n − m}', 'Σp = σ_a(n − m) + Σz'],
      n='Suma los polos y ceros con su signo. Ej.: (s + 1)/[s(s + 3)(s + 4)(s + 8)] → σ_a = [(0 − 3 − 4 − 8) − (−1)]/3 = −14/3 = −4.67.'),
], vars=[('n, m', 'número de polos y de ceros de lazo abierto'), ('σ_a', 'centroide (de donde salen) las asíntotas'),
         ('θ_a', 'ángulos de las asíntotas'), ('Σp, Σz', 'suma de los polos y de los ceros (con signo)'),
         ('σ_b, K_b', 'punto de ruptura y su ganancia'), ('N′, D′', 'derivadas de N y D respecto a s'),
         ('θ_{sal}, θ_{lleg}', 'ángulos de salida (de un polo) y de llegada (a un cero)')])

sec(13, [
    R('G = \\f{1}{s(s + p)(s + q)}:  s^3 + (p + q)s^2 + pq·s + K = 0  ⇒  K_{crít} = (p + q)·pq',
      d=['ω = \\r{pq}', '0 < K < (p + q)pq'],
      n='Es la fórmula de arriba con a = p + q, b = pq y c = 0. Ej.: 1/[s(s + 2)(s + 4)] → s³ + 6s² + 8s + K → K_{crít} = 6·8 = 48, ω = \\r{8} = 2.83 rad/s.',
      k='k critica ganancia limite estabilidad tres polos'),
    D(['K_{crít} = ab − c', 'ω_{cruce} = \\r{\\f{c + K_{crít}}{a}} = \\r{b}']),
], ideas=['El número de cambios de signo en la 1.ª columna = número de polos en el semiplano derecho. 0 cambios → estable; 1 cambio → 1 polo inestable; 2 → 2; 3 → 3.',
          'En la K crítica los polos en lazo cerrado están sobre el eje jω: es el cruce del LGDR con el eje jω (oscilación sostenida).'],
   vars=[('a_i', 'coeficientes del polinomio característico'), ('b_1', 'elemento calculado de una fila de Routh'),
         ('K_{crít}', 'ganancia en el límite de estabilidad'), ('ω_{cruce}', 'frecuencia de la oscilación en K crítica (rad/s)'),
         ('P(s)', 'polinomio auxiliar'), ('ε', 'número positivo muy pequeño')])

sec(14, [
    D(['\\t{razón} = \\f{|Re p_3|}{σ}  ≥ 5  ⇒  \\t{se puede despreciar}'],
      n='Ej.: −2 ± j3 y −15 → 15/2 = 7.5 ≥ 5: válida. −1 ± j2 y −4 → 4 < 5: no. P1: 7.94/2.03 = 3.9 < 5.'),
], ideas=['Tercer polo cercano sin un cero que lo cancele → la respuesta real es más lenta y con menos sobrepaso que la de 2.º orden.',
          'Que el tercer polo sea real no basta: lo que importa es qué tan lejos está (5×) o si un cero lo cancela.'],
   vars=[('p_3', 'polo extra (no dominante)'), ('σ', 'parte real del par dominante, sin signo'), ('r_1, r_3', 'residuos del par dominante y de p_3')])

sec(15, [
    D(['e = \\f{1}{1 + K_p}  ⇒  K_p = \\f{1}{e} − 1', 'e = \\f{1}{K_v}  ⇒  K_v = \\f{1}{e}', 'e = \\f{1}{K_a}  ⇒  K_a = \\f{1}{e}', 'e_{escalón} = 1 − T(0)'],
      n='Ej.: KG = 20/[(s + 2)(s + 5)] → K_p = KG(0) = 20/10 = 2 → e = 1/3 = 0.333. Para c/[(s + p)(s + q)]: K_p = c/(pq).'),
], ideas=['El tipo cuenta sólo los polos en s = 0 (integradores) del lazo abierto: no todos los polos, ni los ceros, ni los de lazo cerrado.',
          'Tipo 1 ante escalón: K_p → ∞ y el error es cero. Tipo 0 ante rampa: K_v = 0 y el error es infinito. Tipo 2 ante rampa: error cero.'],
   vars=[('K_p, K_v, K_a', 'constantes de posición, velocidad y aceleración'), ('e(∞)', 'error en estado estable'),
         ('\\t{tipo}', 'número de integradores 1/s del lazo abierto KG_cG'), ('A', 'altura del escalón o pendiente de la rampa'),
         ('R(s)', 'entrada (referencia)')])

# ============================== Parte III ==============================
sec(16, [
    D(['G_c = \\f{s + z_c}{s} = 1 + \\f{z_c}{s}  ⇒  K_P = K,  K_I = K·z_c',
       '\\f{z_c}{p_c} = \\f{K_{v,deseada}}{K_v}', 'p_c = z_c·\\f{K_v}{K_{v,deseada}}', 'e_{nuevo} ≈ e·\\f{p_c}{z_c}'],
      n='Ej.: K_v = 5 → 40 con p_c = 0.01: z_c/p_c = 8 → z_c = 0.08.'),
], ideas=['PI ideal: el polo en el origen agrega un integrador y sube el tipo en 1 → tipo 0: error al escalón = 0; tipo 1: error a la rampa = 0.',
          'Atraso: su polo NO está en el origen, así que no cambia el tipo; el error se reduce unas z_c/p_c veces (K_v o K_p se multiplican por z_c/p_c).',
          'El polo y el cero se ponen muy cerca entre sí y del origen para no mover los polos dominantes: vistos desde s_0 sus vectores casi se anulan.'],
   vars=[('z_c, p_c', 'cero y polo del compensador (están en −z_c y −p_c)'), ('K_v', 'constante de velocidad sin compensar'),
         ('K_{v,deseada}', 'la que pide la especificación'), ('K_P, K_I', 'ganancias proporcional e integral'),
         ('\\t{dipolo}', 'polo y cero muy juntos cerca del origen')])

sec(17, [
    D(['tan θ_z = \\f{ω_d}{z_c − σ}  ⇒  z_c = σ + \\f{ω_d}{tan θ_z}', 'p_c = σ + \\f{ω_d}{tan θ_p}', 'θ_c = θ_z − θ_p  ⇒  θ_p = θ_z − θ_c', 'θ_z = θ_c + θ_p',
       '\\t{PD:}  K_D = K,  K_P = K·z_c'],
      n='El cero va en s = −z_c. Ej.: s_d = −4 + j6 y θ_z = 60° → z_c = 4 + 6/1.732 = 7.46 → cero en −7.46. Con θ_z = 90° el cero queda justo debajo de s_d (z_c = σ).'),
], ideas=['θ_c = −180° − Σ∠(planta en s_d). Ej.: Σ∠ = −215° → θ_c = +35°. Positivo → hace falta un cero (PD o adelanto). Negativo → hay que restar ángulo (un polo).',
          'En el adelanto (s + z_c)/(s + p_c) el polo está más lejos que el cero: p_c > z_c, así θ_{cero} > θ_{polo} y el ángulo neto es positivo.'],
   vars=[('θ_c', 'ángulo que debe aportar el compensador'), ('θ_z, θ_p', 'ángulos del cero y del polo del compensador vistos desde s_d'),
         ('z_c, p_c', 'cero y polo del compensador (en −z_c y −p_c)'), ('σ, ω_d', 'parte real (sin signo) e imaginaria de s_d'),
         ('K_P, K_D', 'ganancias proporcional y derivativa')])

sec(18, [
    D(['K = K_3', 'z_{PD} + z_{PI} = \\f{K_1}{K_3}', 'z_{PD}·z_{PI} = \\f{K_2}{K_3}', 'z_{atr} = p_{atr}·\\f{K_{v,deseada}}{K_{v,con adelanto}}'],
      n='Ej.: K = 2, z_{PD} = 10, z_{PI} = 0.5 → K_1 = 2·10.5 = 21, K_2 = 2·10·0.5 = 10, K_3 = 2.'),
], ideas=['K_1 es la proporcional, K_2 la integral (va con 1/s) y K_3 la derivativa (va con s): K·s + K(z_{PD} + z_{PI}) + K·z_{PD}z_{PI}/s.',
          'Método de Nise: primero el PD (transitorio) y después el PI (error), porque el dipolo del PI casi no mueve los polos dominantes y no deshace lo que hizo el PD.'],
   vars=[('K_1, K_2, K_3', 'ganancias proporcional, integral y derivativa (= K_P, K_I, K_D)'), ('z_{PD}', 'cero del PD'),
         ('z_{PI}', 'cero del PI'), ('z_{atr}, p_{atr}', 'cero y polo del atraso')])

sec(19, [], ideas=[
    'La estabilidad se demuestra con los polos en lazo cerrado (todos con parte real negativa) o con Routh; no con que una simulación finita “se vea acotada”, ni con que el LGDR pase por s_d, ni con el %OS medido.',
    'Cancelar un polo inestable con un cero NO elimina el modo inestable: sólo lo oculta de C/R; internamente (p. ej. en la señal de control) crece.',
    'Si la simulación no cumple (p. ej. 21 % cuando se pide 15 %): ajustar el diseño y volver a verificar. No se reporta la aproximación ni se cambia la especificación.'],
   vars=[('Dif', 'diferencia en % entre lo obtenido y la meta'), ('ζ_d, T_{s,d}', 'valores de diseño que se ajustan')])

sec(20, [
    T(['\\t{Comando}', '\\t{Qué da}'], [
        ['<code>T = feedback(K*Gc*G, 1)</code>', '\\t{el lazo cerrado (realimentación unitaria)}'],
        ['<code>pole(T)</code>', '\\t{todos los polos en lazo cerrado}'],
        ['<code>pole(G)</code>', '\\t{sólo los polos de lazo abierto}'],
        ['<code>stepinfo(T)</code>', '\\t{%OS, Ts, Tp y Tr medidos en la respuesta simulada}'],
        ['<code>dcgain(T)</code>', '\\t{valor final ante un escalón unitario}'],
        ['<code>1 - dcgain(T)</code>', '\\t{error en estado estable al escalón}'],
        ['<code>evalfr(G, sd)</code>', '\\t{G(s_d): abs → magnitud, angle → ángulo}'],
        ['<code>rlocus(G); sgrid(zeta, 0)</code>', '\\t{LGDR con la recta de ζ}']],
      n='Primero se cierra el lazo con feedback: pole(G) no da los polos en lazo cerrado.', k='comando matlab que da polos lazo cerrado stepinfo dcgain'),
])


# ------------------------------------------------------------------------------------------
def cell(c):
    return c if c.startswith('<code>') else line(c)


def kattr(k):
    return f' data-k="{html.escape(k)}"' if k else ''


def row_html(r):
    if 'tab' in r:
        head, rows = r['tab']
        th = ''.join(f'<th>{parse(h)}</th>' for h in head)
        body = ''.join('<tr>' + ''.join(f'<td>{cell(c)}</td>' for c in rw) + '</tr>' for rw in rows)
        t = f'<div class="fx-scr"><table class="fx-t fx-tx"><thead><tr>{th}</tr></thead><tbody>{body}</tbody></table></div>'
        return f'<div class="fx-r fx-v76"{kattr(r["k"])}>{t}' + (f'<div class="fx-n">{N(r["n"])}</div>' if r['n'] else '') + '</div>'
    if 'dsp' in r:
        items = ''.join(f'<span>{line(x)}</span>' for x in r['dsp'])
        n = f'<div class="fx-n">{N(r["n"])}</div>' if r['n'] else ''
        return f'<div class="fx-r fx-v76 fx-dpr" data-k="despejes despejar"><div class="fx-m fx-dp"><span class="fx-tg">Despejes</span>{items}</div>{n}</div>'
    m = ''.join(f'<div class="fx-m">{line(x)}</div>' for x in r['m'])
    d = ''
    if r['d']:
        d = '<div class="fx-m fx-dp"><span class="fx-tg">Despejes</span>' + ''.join(f'<span>{line(x)}</span>' for x in r['d']) + '</div>'
    n = f'<div class="fx-n">{N(r["n"])}</div>' if r['n'] else ''
    return f'<div class="fx-r fx-v76"{kattr(r["k"])}>{m}{d}{n}</div>'


def block(num):
    a = ADD[num]
    h = ''.join(row_html(r) for r in a['rows'])
    if a['ideas']:
        h += ('<div class="fx-r fx-v76 fx-kr" data-k="ideas clave concepto por que"><span class="fx-tg">Ideas clave</span><ul class="fx-k">'
              + ''.join(f'<li>{N(x)}</li>' for x in a['ideas']) + '</ul></div>')
    if a['vars']:
        h += ('<div class="fx-r fx-v76 fx-vr" data-k="variables simbolos significado que es"><span class="fx-tg">Variables</span><dl class="fx-v">'
              + ''.join(f'<div><dt>{parse(s)}</dt><dd>{N(t)}</dd></div>' for s, t in a['vars']) + '</dl></div>')
    return f'<!--v76:{num}-->{h}<!--/v76:{num}-->'


def apply(src):
    src = re.sub(r'<!--v76:(\d+)-->.*?<!--/v76:\1-->', '', src, flags=re.S)
    for num in sorted(ADD):
        m = re.search(rf'<section class="fx-s"[^>]*\bid="fxs{num}"', src)
        if not m:
            raise SystemExit(f'No encontré section#fxs{num}')
        end = src.find('</section>', m.end())
        src = src[:end] + block(num) + src[end:]
    return src


if __name__ == '__main__':
    path = sys.argv[1]
    src = open(path, encoding='utf-8').read()
    new = apply(src)
    open(path, 'w', encoding='utf-8').write(new)
    print('v76: secciones completadas:', len(ADD), '· +', len(new) - len(src), 'caracteres')
