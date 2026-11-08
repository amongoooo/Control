# -*- coding: utf-8 -*-
"""v74 · Formulario (dialog#fxDlg): fórmulas que faltaban, gráficas SVG, buscador e índice.

Se corre UNA vez sobre index.html (agrega filas a las 20 secciones existentes sin cambiar las que ya estaban,
salvo la aclaración del ángulo θc de la sección 17). Si ya se aplicó (existe id="fxQ"), no hace nada.
Uso:  python3 -I herramientas/formulario-v74.py index.html
Los números de las gráficas y de la tabla ζ–%OS se calculan aquí (numpy).
"""
import math, re, sys
import numpy as np

PATH = sys.argv[1] if len(sys.argv) > 1 else 'index.html'
src = open(PATH, encoding='utf-8').read()
if 'id="fxQ"' in src:
    print('Ya aplicado (id="fxQ" existe).'); sys.exit(0)

# ------------------------------------------------------------------ ayudas de marcado (mismo estilo que el formulario)
def I(x): return f'<i>{x}</i>'
def sb(x): return f'<sub>{x}</sub>'
def sp(x): return f'<sup>{x}</sup>'
def fr(a, b): return f'<span class="fr"><span>{a}</span><span>{b}</span></span>'
def rt(x): return f'√<span class="rt">{x}</span>'
Gp = '<span class="fx-g"></span>'
s, K, σ, ω, ζ, θ = I('s'), I('K'), I('σ'), I('ω'), 'ζ', I('θ')
ωd, ωn, Ts, Tp, Tr = ω + sb('d'), ω + sb('n'), I('T') + sb('s'), I('T') + sb('p'), I('T') + sb('r')
sd, s0 = s + sb('d'), s + sb('0')
zc, pc = I('z') + sb('c'), I('p') + sb('c')
Gc = I('G') + sb('c')
G = I('G')
Kv, Kp, Ka = K + sb('v'), K + sb('p'), K + sb('a')
N, D = I('N'), I('D')

def row(m, n='', k=''):
    ka = f' data-k="{k}"' if k else ''
    nn = f'<div class="fx-n">{n}</div>' if n else ''
    return f'<div class="fx-r"{ka}><div class="fx-m">{m}</div>{nn}</div>'

def table(head, rows, k='', note='', tid=''):
    th = ''.join(f'<th>{h}</th>' for h in head)
    tb = ''.join('<tr>' + ''.join(f'<td>{c}</td>' for c in r) + '</tr>' for r in rows)
    ka = f' data-k="{k}"' if k else ''
    ia = f' id="{tid}"' if tid else ''
    nn = f'<div class="fx-n">{note}</div>' if note else ''
    return (f'<div class="fx-r"{ka}{ia}><div class="fx-m"><div class="fx-scr"><table class="fx-t"><thead><tr>{th}</tr></thead>'
            f'<tbody>{tb}</tbody></table></div></div>{nn}</div>')

def fig(fid, svg, cap, k):
    return (f'<figure class="fx-r fx-fig" id="{fid}" data-k="{k}">{svg}<figcaption>{cap}</figcaption></figure>')

# ------------------------------------------------------------------ SVG: ayudas
def t(x, y, txt, cls='', anc='start', extra=''):
    c = f' class="{cls}"' if cls else ''
    a = f' text-anchor="{anc}"' if anc != 'start' else ''
    return f'<text x="{x:.1f}" y="{y:.1f}"{c}{a}{extra}>{txt}</text>'

def it(x): return f'<tspan class="v">{x}</tspan>'          # variable en cursiva
def tsub(x): return f'<tspan dy="3" font-size="8.5">{x}</tspan><tspan dy="-3"> </tspan>'

def svg(vb, body, label):
    return (f'<svg class="fxg" viewBox="{vb}" role="img" aria-label="{label}">{body}</svg>')

def ln(x1, y1, x2, y2, cls='ax', extra=''):
    return f'<line x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}" class="{cls}"{extra}/>'

def path(pts, cls):
    d = 'M' + ' L'.join(f'{x:.1f} {y:.1f}' for x, y in pts)
    return f'<path d="{d}" class="{cls}"/>'

def cross(x, y, r=4.5, cls='mk'):
    return f'<path d="M{x-r:.1f} {y-r:.1f}L{x+r:.1f} {y+r:.1f}M{x-r:.1f} {y+r:.1f}L{x+r:.1f} {y-r:.1f}" class="{cls}"/>'

AR = ' marker-end="url(#fxArM)"'
ARA = ' marker-end="url(#fxArA)"'
AR2 = ' marker-start="url(#fxArM)" marker-end="url(#fxArM)"'

DEFS = ('<svg class="fx-defs" width="0" height="0" aria-hidden="true" focusable="false"><defs>'
        '<marker id="fxArM" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse"><path d="M0 0L8 4L0 8z" class="ahm"/></marker>'
        '<marker id="fxArA" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse"><path d="M0 0L8 4L0 8z" class="aha"/></marker>'
        '</defs></svg>')

# ---- A. plano s: recta de ζ, σ, ωd, ωn, θ
def fig_plano():
    O = (236, 112); r = 100; z = 0.6; th = math.acos(z)
    P = (O[0] - r * z, O[1] - r * math.sin(th)); Pc = (P[0], O[1] + r * math.sin(th))
    b = []
    b.append(f'<rect x="8" y="6" width="{O[0]-8}" height="212" class="lhp"/>')
    b.append(ln(10, O[1], 310, O[1], 'ax', AR)); b.append(ln(O[0], 216, O[0], 6, 'ax', AR))
    b.append(t(306, O[1] + 15, it('σ'), 'tm', 'end')); b.append(t(O[0] + 6, 16, it('j') + it('ω'), 'tm'))
    ext = 1.32
    b.append(ln(O[0], O[1], O[0] + (P[0]-O[0]) * ext, O[1] + (P[1]-O[1]) * ext, 'ac dsh'))
    b.append(ln(O[0], O[1], O[0] + (Pc[0]-O[0]) * ext, O[1] + (Pc[1]-O[1]) * ext, 'ac dsh'))
    b.append(ln(O[0], O[1], P[0], P[1], 'ac'))
    b.append(ln(P[0], P[1], P[0], O[1], 'dot')); b.append(ln(P[0], P[1], O[0], P[1], 'dot'))
    b.append(ln(P[0], O[1] + 0.5, O[0], O[1] + 0.5, 'c3 thk'))                         # σ
    b.append(ln(O[0] + 0.5, O[1], O[0] + 0.5, P[1], 'c2 thk'))                         # ωd
    b.append(t((P[0] + O[0]) / 2, O[1] + 16, it('σ') + ' = ζ' + it('ω') + tsub('n'), 'tc3', 'middle'))
    b.append(t(O[0] + 7, (O[1] + P[1]) / 2 + 4, it('ω') + tsub('d'), 'tc2'))
    mx, my = (O[0] + P[0]) / 2, (O[1] + P[1]) / 2
    b.append(t(mx + 8, my - 4, it('ω') + tsub('n'), 'ta'))
    a0 = (O[0] - 30, O[1]); a1 = (O[0] - 30 * z, O[1] - 30 * math.sin(th))
    b.append(f'<path d="M{a0[0]:.1f} {a0[1]:.1f}A30 30 0 0 1 {a1[0]:.1f} {a1[1]:.1f}" class="ax"/>')
    am = math.pi + th / 2
    b.append(t(O[0] + 42 * math.cos(am), O[1] - 42 * math.sin(th / 2) + 4, it('θ'), '', 'middle'))
    b.append(cross(*P, cls='mk ac2')); b.append(cross(*Pc, cls='mk ac2'))
    b.append(t(P[0] - 10, P[1] + 4, it('s') + ' = −' + it('σ') + ' + ' + it('j') + it('ω') + tsub('d'), '', 'end'))
    b.append(t(Pc[0] - 8, Pc[1] + 4, 'conjugado', 'tm', 'end'))
    b.append(t(14, 150, 'cos ' + it('θ') + ' = ζ', 'ta'))
    b.append(t(14, 166, 'recta de ζ (mismo %OS)', 'tm sm'))
    b.append(t(14, 208, '← más rápido (mayor σ)', 'tm sm'))
    return svg('0 0 320 222', ''.join(b), 'Plano s con la recta de zeta, sigma, omega d y omega n')

# ---- B. respuesta al escalón: %OS, Tp, Ts, banda ±2 %
def fig_escalon():
    z, wn = 0.5, 1.0; sg = z * wn; wd = wn * math.sqrt(1 - z * z)
    tt = np.linspace(0, 12, 400)
    y = 1 - np.exp(-sg * tt) * (np.cos(wd * tt) + sg / wd * np.sin(wd * tt))
    X = lambda v: 36 + v * 23; Y = lambda v: 172 - v * 100
    tp = math.pi / wd; ymax = 1 + math.exp(-z * math.pi / math.sqrt(1 - z * z))
    out = np.where(np.abs(y - 1) > 0.02)[0]; ts = tt[out[-1] + 1]
    b = []
    b.append(f'<rect x="{X(0):.1f}" y="{Y(1.02):.1f}" width="{X(12)-X(0):.1f}" height="{Y(0.98)-Y(1.02):.1f}" class="band"/>')
    b.append(ln(X(0), Y(1.02), X(12), Y(1.02), 'bl')); b.append(ln(X(0), Y(0.98), X(12), Y(0.98), 'bl'))
    b.append(ln(X(0), Y(0), X(12.3), Y(0), 'ax', AR)); b.append(ln(X(0), Y(0), X(0), Y(1.35), 'ax', AR))
    b.append(t(X(12.3), Y(0) + 15, it('t'), 'tm', 'end')); b.append(t(X(0) + 5, Y(1.35) + 4, it('c') + '(' + it('t') + ')', 'tm'))
    b.append(ln(X(0), Y(1), X(12), Y(1), 'dsh ax')); b.append(t(X(0) - 4, Y(1) + 4, '1', 'tm', 'end'))
    b.append(t(X(12), Y(1) - 7, '±2 %', 'ta sm', 'end'))
    b.append(path([(X(a), Y(c)) for a, c in zip(tt, y)], 'ac'))
    b.append(ln(X(tp), Y(ymax), X(tp), Y(0), 'dot')); b.append(t(X(tp), Y(0) + 14, it('T') + tsub('p'), '', 'middle'))
    b.append(ln(X(ts), Y(1), X(ts), Y(0), 'dot')); b.append(t(X(ts), Y(0) + 14, it('T') + tsub('s'), '', 'middle'))
    xa = X(tp) + 16
    b.append(ln(xa, Y(1) - 1, xa, Y(ymax) + 1, 'c2', AR2))
    b.append(t(xa + 4, Y(ymax) - 4, '%OS = 16.3 %', 'tc2'))
    b.append(t(X(tp) - 5, Y(ymax) - 5, it('c') + tsub('máx'), 'tm', 'end'))
    b.append(t(X(8.5), Y(0.45), 'ζ = 0.5', 'tm sm'))
    return svg('0 0 330 192', ''.join(b), 'Respuesta al escalón con sobrepaso, tiempo pico, tiempo de asentamiento y banda de 2 por ciento')

# ---- C. %OS contra ζ
def os_of(z): return 100 * math.exp(-z * math.pi / math.sqrt(1 - z * z)) if z < 1 else 0.0
def fig_os():
    X = lambda z: 40 + z * 268; Y = lambda o: 160 - o * 1.42
    b = []
    for o in (20, 40, 60, 80, 100):
        b.append(ln(X(0), Y(o), X(1), Y(o), 'gr')); b.append(t(X(0) - 5, Y(o) + 4, str(o), 'tm sm', 'end'))
    for z in (0.2, 0.4, 0.6, 0.8, 1.0):
        b.append(ln(X(z), Y(0), X(z), Y(100), 'gr')); b.append(t(X(z), Y(0) + 13, f'{z:.1f}', 'tm sm', 'middle'))
    b.append(ln(X(0), Y(0), X(1.03), Y(0), 'ax', AR)); b.append(ln(X(0), Y(0), X(0), Y(106), 'ax', AR))
    b.append(t(X(0), Y(0) + 13, '0', 'tm sm', 'middle'))
    b.append(t(X(1.03), Y(0) - 6, 'ζ', 'tm', 'end')); b.append(t(X(0) + 5, Y(106) + 6, '%OS', 'tm'))
    zz = np.linspace(0.0005, 0.9999, 240)
    b.append(path([(X(z), Y(os_of(z))) for z in zz], 'ac'))
    pts = [(0.174, 'P2 · 57.4 %', 8, -3, 'start'), (0.4559, 'P6, P7 · 20 %', 8, -6, 'start'),
           (0.5169, 'P3–P5 · 15–16 %', 8, 0, 'start'), (0.5912, 'P1 · 10 %', 8, 6, 'start'),
           (0.7071, '0.707 · 4.3 %', 6, -6, 'start')]
    for i, (z, lab, dx, dy, anc) in enumerate(pts):
        o = os_of(z)
        if i == 0:
            b.append(t(X(z) + dx, Y(o) + dy, lab, 'sm', anc))
        else:
            ty = 46 + (i - 1) * 16
            b.append(ln(X(z), Y(o), 226, ty - 4, 'dot'))
            b.append(t(229, ty, lab, 'sm'))
        b.append(f'<circle cx="{X(z):.1f}" cy="{Y(o):.1f}" r="3.2" class="pt"/>')
    b.append(f'<circle cx="{X(0.5039):.1f}" cy="{Y(os_of(0.5039)):.1f}" r="3.2" class="pt"/>')
    return svg('0 0 320 182', ''.join(b), 'Curva del sobrepaso contra zeta con los valores de las prácticas')

# ---- D. lazo cerrado con K, Gc y G
def fig_lazo():
    b = []
    y = 40; cx = 54
    b.append(ln(8, y, cx - 10, y, 'ink', AR.replace('M)', 'M)'))); b.append(t(8, y - 9, it('R') + '(' + it('s') + ')', ''))
    b.append(f'<circle cx="{cx}" cy="{y}" r="10" class="bx"/>')
    b.append(t(cx - 14, y - 10, '+', 'sm', 'middle')); b.append(t(cx - 9, y + 23, '−', '', 'middle'))
    boxes = [(84, 112, it('K')), (130, 186, it('G') + tsub('c') + '(' + it('s') + ')'), (204, 260, it('G') + '(' + it('s') + ')')]
    b.append(ln(cx + 10, y, boxes[0][0], y, 'ink', AR)); b.append(t((cx + 10 + boxes[0][0]) / 2, y - 8, it('E'), 'tm sm', 'middle'))
    for i, (x0, x1, lab) in enumerate(boxes):
        b.append(f'<rect x="{x0}" y="{y-15}" width="{x1-x0}" height="30" rx="4" class="bx"/>')
        b.append(t((x0 + x1) / 2, y + 4.5, lab, '', 'middle'))
        if i < 2: b.append(ln(x1, y, boxes[i + 1][0], y, 'ink', AR))
    b.append(ln(260, y, 314, y, 'ink', AR)); b.append(t(314, y - 9, it('C') + '(' + it('s') + ')', '', 'end'))
    b.append(f'<path d="M286 {y}V84H{cx}V{y+11}" class="ink" fill="none"{AR}/>')
    b.append(f'<circle cx="286" cy="{y}" r="2.6" class="dotf"/>')
    b.append(t(170, 99, 'realimentación unitaria', 'tm sm', 'middle'))
    b.append(t(98, y + 28, 'ganancia', 'tm sm', 'middle')); b.append(t(158, y + 28, 'compensador', 'tm sm', 'middle'))
    b.append(t(232, y + 28, 'planta', 'tm sm', 'middle'))
    return svg('0 0 320 106', ''.join(b), 'Diagrama del lazo cerrado con K, Gc y G y realimentación unitaria')

# ---- E. LGDR de ejemplo (P1): asíntotas, ruptura, cruce con jω y s0
def fig_lgdr():
    sc = 14.5; ox = 20 + 10.6 * sc; oy = 124
    X = lambda v: ox + v * sc; Y = lambda w: oy - w * sc
    den = np.poly([-2, -4, -6])
    def roots(Kk):
        c = den.copy(); c[-1] += Kk; return np.roots(c)
    Ks = np.concatenate([np.linspace(0, 3.08, 120), np.linspace(3.08, 3.0792, 2), np.geomspace(3.081, 1400, 500)])
    br = [[], [], []]; prev = np.array([-2.0, -4.0, -6.0], dtype=complex)
    for Kk in Ks:
        r = roots(Kk); used = set(); cur = []
        for p in prev:
            j = min((i for i in range(3) if i not in used), key=lambda i: abs(r[i] - p)); used.add(j); cur.append(r[j])
        prev = np.array(cur)
        for i in range(3): br[i].append(prev[i])
    b = []
    b.append(ln(12, oy, 312, oy, 'ax', AR)); b.append(ln(X(0), 244, X(0), 6, 'ax', AR))
    b.append(t(310, oy + 14, it('σ'), 'tm', 'end')); b.append(t(X(0) - 5, 15, it('j') + it('ω'), 'tm', 'end'))
    for v in (-10, -8):
        b.append(ln(X(v), oy - 3, X(v), oy + 3, 'ax')); b.append(t(X(v), oy + 14, str(v).replace('-', '−'), 'tm sm', 'middle'))
    L = 9.5
    for a in (60, -60):
        b.append(ln(X(-4), Y(0), X(-4) + L * sc * math.cos(math.radians(a)), Y(0) - L * sc * math.sin(math.radians(a)), 'c2 dsh'))
    for brn in br:
        pts = [(X(p.real), Y(p.imag)) for p in brn if -10.4 <= p.real <= 3.2 and abs(p.imag) <= 8.0]
        if pts: b.append(path(pts, 'ac'))
    z = 0.5912; th = math.acos(z)
    b.append(ln(X(0), Y(0), X(-4.9 * z), Y(4.9 * math.sin(th)), 'dsh ax'))
    b.append(t(X(-4.9 * z) - 2, Y(4.9 * math.sin(th)) - 4, 'ζ = 0.591', 'tm sm', 'end'))
    for p in (-2, -4, -6): b.append(cross(X(p), Y(0)))
    b.append(f'<circle cx="{X(-2.8453):.1f}" cy="{Y(0):.1f}" r="3.4" class="pt c2f"/>')
    b.append(t(X(-2.8453) + 4, oy + 17, it('σ') + tsub('b'), 'tc2 sm'))
    b.append(t(X(-4) - 9, oy - 9, it('σ') + tsub('a'), 'tc2 sm', 'end'))
    for w in (6.633, -6.633): b.append(f'<circle cx="{X(0):.1f}" cy="{Y(w):.1f}" r="3.4" class="pt okf"/>')
    for w in (2.7677, -2.7677): b.append(f'<rect x="{X(-2.0285)-3.4:.1f}" y="{Y(w)-3.4:.1f}" width="6.8" height="6.8" class="pt" transform="rotate(45 {X(-2.0285):.1f} {Y(w):.1f})"/>')
    lx = 194
    lg = [('×', 'polos: −2, −4, −6', 'tm'), ('', it('σ') + tsub('a') + ' = −4, ±60°', 'tc2'),
          ('', it('σ') + tsub('b') + ' = −2.845, ' + it('K') + ' = 3.08', 'tc2'),
          ('', '±' + it('j') + '6.633 (' + it('K') + ' = 480)', 'tok'), ('', 's₀ = −2.03 ± ' + it('j') + '2.77', 'ta'), ('', it('K') + ' = 45.53', 'ta')]
    for i, (_, txt, cl) in enumerate(lg):
        b.append(t(lx, 30 + i * 15, txt, cl + ' sm'))
    b.append(t(lx, 236, 'P1: ' + it('K') + '/[(' + it('s') + '+2)(' + it('s') + '+4)(' + it('s') + '+6)]', 'tm sm'))
    return svg('0 0 320 250', ''.join(b), 'Lugar geométrico de las raíces de la práctica 1 con asíntotas, punto de ruptura y cruce con el eje j omega')

# ---- F. geometría del cero (o polo) del compensador
def fig_cero():
    oy = 136; Ox = 300; sdx, sdy = 196, 34; zx = 104
    b = []
    b.append(ln(10, oy, 314, oy, 'ax', AR)); b.append(ln(Ox, 160, Ox, 8, 'ax', AR))
    b.append(t(312, oy + 14, it('σ'), 'tm', 'end')); b.append(t(Ox - 5, 16, it('j') + it('ω'), 'tm', 'end'))
    b.append(ln(zx, oy, sdx, sdy, 'c3'))
    b.append(ln(sdx, sdy, sdx, oy, 'c2 dot2')); b.append(t(sdx + 6, (sdy + oy) / 2, it('ω') + tsub('d'), 'tc2'))
    b.append(ln(zx, oy + 18, sdx, oy + 18, 'ax', AR2)); b.append(t((zx + sdx) / 2, oy + 31, it('z') + tsub('c') + ' − ' + it('σ') + tsub('d'), 'sm', 'middle'))
    b.append(ln(sdx, oy + 18, Ox, oy + 18, 'ax', AR2)); b.append(t((sdx + Ox) / 2, oy + 31, it('σ') + tsub('d'), 'sm', 'middle'))
    ang = math.atan2(oy - sdy, sdx - zx); r = 30
    b.append(f'<path d="M{zx + r:.1f} {oy}A{r} {r} 0 0 0 {zx + r*math.cos(ang):.1f} {oy - r*math.sin(ang):.1f}" class="c3"/>')
    b.append(t(zx + 38, oy - 9, it('θ') + tsub('z'), 'tc3'))
    b.append(f'<circle cx="{zx}" cy="{oy}" r="5" class="zc"/>'); b.append(t(zx - 9, oy - 7, '−' + it('z') + tsub('c'), '', 'end'))
    b.append(f'<rect x="{sdx-4}" y="{sdy-4}" width="8" height="8" class="pt" transform="rotate(45 {sdx} {sdy})"/>')
    b.append(t(sdx + 9, sdy - 4, it('s') + tsub('d') + ' = −' + it('σ') + tsub('d') + ' + ' + it('j') + it('ω') + tsub('d')))
    b.append(t(12, 22, 'tan ' + it('θ') + tsub('z') + ' = ' + it('ω') + tsub('d') + ' / (' + it('z') + tsub('c') + ' − ' + it('σ') + tsub('d') + ')', 'ta sm'))
    b.append(t(12, 38, 'polo: igual con ' + it('θ') + tsub('p') + ' y ' + it('p') + tsub('c'), 'tm sm'))
    return svg('0 0 320 172', ''.join(b), 'Geometría para ubicar el cero del compensador a partir del ángulo theta z')

# ------------------------------------------------------------------ tabla ζ – %OS
def zeta_of(o):
    l = math.log(o / 100); return -l / math.sqrt(math.pi ** 2 + l * l)
ZT = []
for o, pr in ((2, ''), (4.32, 'ζ = 0.707'), (5, ''), (10, 'P1'), (15, 'P3, P5'), (16, 'P4'), (20, 'P6, P7'), (25, ''), (30, ''), (40, ''), (57.4, 'P2')):
    z = zeta_of(o); th = math.degrees(math.acos(z)); tn = math.tan(math.radians(th))
    os_s = (f'{o:g}').replace('.', '.')
    if pr == 'ζ = 0.707': z, th, tn = 1 / math.sqrt(2), 45.0, 1.0
    ZT.append([os_s, f'{z:.4f}', f'{th:.2f}°', f'{tn:.4f}', pr])

# ------------------------------------------------------------------ filas nuevas por sección
X = {}
X[1] = [
    row(f'{I("e")}{sp(I("σt"))} cos {I("ωt")} = ½({I("e")}{sp("(" + I("σ") + " + " + I("jω") + ")" + I("t"))} + {I("e")}{sp("(" + I("σ") + " − " + I("jω") + ")" + I("t"))})',
        'Por eso los polos complejos de un sistema real van en pares conjugados (simétricos al eje real).', 'conjugado par euler'),
]
X[2] = [
    row(f'Valor final: lím<sub>{I("t")}→∞</sub> {I("f")}({I("t")}) = lím<sub>{I("s")}→0</sub> {s}·{I("F")}({s})',
        'Teorema del valor final. Sólo vale si todos los polos de s·F(s) están en el semiplano izquierdo (el sistema llega a un valor fijo). Con un escalón: y(∞) = G(0).',
        'teorema valor final tvf limite estado estable'),
    row(f'Valor inicial: {I("f")}(0⁺) = lím<sub>{I("s")}→∞</sub> {s}·{I("F")}({s})', 'Sirve para revisar con qué valor arranca la respuesta.', 'teorema valor inicial'),
    row(f'Escalón de altura {I("A")}: {I("R")}({s}) = {fr(I("A"), s)}{Gp}Rampa {I("A")}·{I("t")}: {I("R")}({s}) = {fr(I("A"), s + "²")}', 'Con A = 1 son el escalón y la rampa unitarios de las prácticas.', 'entrada escalon rampa amplitud'),
]
X[4] = [
    row(f'{I("y")}(τ) = 63.2 %{Gp}{I("y")}(4τ) = 98.2 %', 'De ahí sale T<sub>s</sub> ≈ 4τ al 2 %.', 'constante de tiempo tau'),
]
X[5] = [
    row(f'ζ = 1: {I("y")}({I("t")}) = 1 − {I("e")}{sp("−" + I("ω") + "<sub>n</sub>" + I("t"))}(1 + {ωn}{I("t")})', 'Polo doble en −ω<sub>n</sub>: lo más rápido sin sobrepaso.', 'criticamente amortiguado polo doble'),
    row(f'0 &lt; ζ &lt; 1: {I("y")}({I("t")}) = 1 − {I("e")}{sp("−" + I("σt"))}(cos {ωd}{I("t")} + {fr(σ, ωd)} sin {ωd}{I("t")})', 'Respuesta al escalón del 2.º orden subamortiguado (σ = ζω<sub>n</sub>).', 'subamortiguado respuesta escalon segundo orden'),
]
X[6] = [
    fig('fxf-plano', fig_plano(), 'Plano s: la recta de ζ sale del origen; σ fija T<sub>s</sub> y ω<sub>d</sub> fija T<sub>p</sub>.', 'grafica plano s recta zeta sigma omega theta'),
    fig('fxf-escalon', fig_escalon(), 'Respuesta al escalón: %OS, T<sub>p</sub> y T<sub>s</sub> (desde ahí ya no sale de la banda de ±2 %).', 'grafica respuesta escalon sobrepaso tiempo pico asentamiento banda'),
    row(f'%OS = {fr(I("c") + sb("máx") + " − " + I("c") + sb("final"), I("c") + sb("final"))}·100', 'Así se mide en la simulación (stepinfo) cuando c(∞) ≠ 1.', 'sobrepaso medido simulacion stepinfo cmax'),
    row(f'{Ts} = {fr("−ln(0.02" + rt("1 − ζ²") + ")", "ζ" + ωn)}', 'Fórmula exacta de la envolvente (Nise); 4/σ es su aproximación.', 'tiempo de asentamiento exacto'),
]
X[7] = [
    row(f'Par {I("p")}, {I("p")}* con residuos {I("A")}, {I("A")}*: {I("A")}{I("e")}{sp(I("pt"))} + {I("A")}*{I("e")}{sp(I("p") + "*" + I("t"))} = 2|{I("A")}| {I("e")}{sp("−" + I("σt"))} cos({ωd}{I("t")} + ∠{I("A")})', 'Un par complejo da una sola oscilación; su tamaño es 2|A|.', 'residuo complejo par conjugado'),
    row(f'|{I("r")}{sb("3")}| &lt; 0.12·|{I("r")}{sb("1")}| ⇒ el modo de {I("p")}{sb("3")} casi no aparece', 'Regla del residuo (12 %) de la página: r<sub>1</sub> = residuo del par dominante. Si |r<sub>3</sub>| ≥ 12 % el modo se nota (cancelación parcial) y manda la simulación.', 'regla residuo 12 por ciento despreciar polo cancelacion'),
    row(f'{Ts} ≈ {fr("ln(|" + I("r") + "|/0.02)", "|" + I("p") + "|")}', 'Cuando un modo lento (p real, residuo r) es el último en apagarse. P2 con PI: ln(0.0997/0.02)/0.0902 = 17.8 s.', 'tiempo asentamiento polo lento cola residuo'),
]
X[8] = [
    row('Cero cerca de un polo ⇒ residuo pequeño ⇒ ese modo casi se cancela', 'Un cero no crea modos: sólo cambia el peso (residuo) de cada uno.', 'cero cancelacion residuo'),
]
X[9] = [
    fig('fxf-lazo', fig_lazo(), 'Lazo cerrado de las prácticas: K · G<sub>c</sub> · G con realimentación unitaria.', 'grafica diagrama de bloques lazo cerrado realimentacion'),
    row(f'{I("T")}({s}) = {fr(K + N + "(" + s + ")", D + "(" + s + ") + " + K + N + "(" + s + ")")}{Gp}{I("E")}({s}) = {fr(I("R") + "(" + s + ")", "1 + " + K + Gc + G)}', 'Con G = N/D (y G<sub>c</sub> incluido en N y D si lo hay).', 'funcion de transferencia lazo cerrado error'),
    row(f'Con {Gc} = {fr(N + sb("c"), D + sb("c"))}: {D}{D}{sb("c")} + {K}{N}{N}{sb("c")} = 0', 'Ecuación característica con el compensador (verificación del diseño).', 'ecuacion caracteristica compensador'),
    row(f'{K} = −{fr(D + "(" + σ + ")", N + "(" + σ + ")")}', 'K que pone un polo de lazo cerrado en el punto real s = σ (sale de D + KN = 0).', 'k polo real punto'),
    row(f'{I("T")}(0) = {fr(K + N + "(0)", D + "(0) + " + K + N + "(0)")}', 'Ganancia DC del lazo cerrado; e<sub>escalón</sub> = 1 − T(0).', 'ganancia dc lazo cerrado'),
]
X[10] = [
    row(f'tan {θ} = {fr(ωd, σ)} = {fr(rt("1 − ζ²"), "ζ")}{Gp}{θ} = cos⁻¹ ζ', 'Pendiente de la recta de ζ (θ desde el eje real negativo).', 'pendiente recta zeta tangente theta'),
    row(f'{Ts}: {σ}{sb("d")} = {fr("4", I("T") + sb("s,d"))}, {ωd} = {σ}{sb("d")} tan {θ}{Gp}{Tp}: {ωd} = {fr("π", I("T") + sb("p,d"))}, {σ}{sb("d")} = {fr(ωd, "tan " + θ)}', 'Punto de diseño s<sub>d</sub> = −σ<sub>d</sub> + jω<sub>d</sub> según qué tiempo pide el problema.', 'punto de diseno sd ts tp'),
    row(f'“{Ts} {I("n")} veces menor, mismo %OS” ⇒ {sd} = {I("n")}·{s0}', 'σ y ω<sub>d</sub> se multiplican por n (P4, P5: n = 3; P7: n = 2). “T<sub>p</sub> × 2/3” (P6) ⇒ ω<sub>d</sub> × 3/2.', 'veces mas rapido reducir ts'),
    table(['%OS', 'ζ', 'θ', 'tan θ', ''], ZT, 'tabla zeta sobrepaso theta tangente', 'ζ contra %OS (θ = cos⁻¹ζ desde el eje real negativo).', 'fxt-zeta'),
    fig('fxf-os', fig_os(), '%OS contra ζ (sólo depende de ζ). Puntos: las especificaciones de las prácticas.', 'grafica curva sobrepaso zeta'),
]
X[11] = [
    row(f'Polo real en −{I("a")}, punto {s0} = −{σ} + {I("j")}{ω}: {θ} = atan2({ω}, {I("a")} − {σ})', 'Si el polo queda a la derecha del punto (a &lt; σ), el ángulo pasa de 90°. El origen (a = 0): θ = 180° − tan⁻¹(ω/σ).', 'angulo vector polo atan2'),
    row(f'Δ = ∠{G}({s0}) − (−180°)', 'Lo que le falta o le sobra al punto para estar en el LGDR (entre −180° y 180°). Δ = 0 ⇒ s<sub>0</sub> está en el LGDR.', 'deficit angulo falta sobra'),
    row(f'{K} = {fr("∏|" + s0 + " + " + I("p") + sb("i") + "|", "∏|" + s0 + " + " + I("z") + sb("i") + "|")}', 'Con G escrita con K = 1 (sin ceros: el denominador es 1).', 'magnitud distancias ganancia'),
]
X[12] = [
    fig('fxf-lgdr', fig_lgdr(), 'LGDR de la P1: asíntotas (−4, ±60°), ruptura en −2.845, cruce con jω en K = 480 y s<sub>0</sub> sobre ζ = 0.591.', 'grafica lgdr asintotas ruptura cruce ejemplo p1'),
    row(f'{θ}{sb("sal")} = 180° + Σ∠(ceros → {I("p")}{sb("k")}) − Σ∠(otros polos → {I("p")}{sb("k")})', 'Ángulo de salida desde un polo complejo p<sub>k</sub> (se mide desde el eje real positivo).', 'angulo de salida partida polo complejo'),
    row(f'{θ}{sb("lleg")} = 180° + Σ∠(polos → {I("z")}{sb("k")}) − Σ∠(otros ceros → {I("z")}{sb("k")})', 'Ángulo de llegada a un cero complejo z<sub>k</sub>.', 'angulo de llegada cero complejo'),
    row(f'{K}{sb("b")} = |{fr(D + "(" + σ + sb("b") + ")", N + "(" + σ + sb("b") + ")")}|', 'Ganancia en el punto de ruptura. Si K &gt; K<sub>b</sub> los polos ya son complejos (hay sobrepaso).', 'ganancia ruptura kb'),
    row(f'Σ {fr("1", σ + " + " + I("z") + sb("i"))} = Σ {fr("1", σ + " + " + I("p") + sb("i"))}', 'Otra forma de la ruptura, sin derivar (polos en −p<sub>i</sub>, ceros en −z<sub>i</sub>).', 'ruptura sin derivar suma inversos'),
    row(f'Cruce con {I("j")}{ω}: {D}({I("j")}{ω}) + {K}{N}({I("j")}{ω}) = 0 ⇒ Re = 0 e Im = 0', 'Dos ecuaciones para ω y K (da lo mismo que Routh). En una ruptura de 2 ramas salen a ±90°.', 'cruce eje imaginario jw sustituir'),
    row('9 pasos del trazo: 1 ramas · 2 simetría · 3 eje real · 4 inicio y fin · 5 asíntotas · 6 ruptura/llegada · 7 cruce con jω · 8 ángulos de salida/llegada · 9 graficar y calibrar (K en puntos clave)', 'Orden del «Trazo del LGDR» del reporte (Nise 8.5–8.6).', 'trazo pasos reglas'),
]
X[13] = [
    row(f'{I("b")}{sb("1")} = {fr(I("a") + sb("n−1") + I("a") + sb("n−2") + " − " + I("a") + sb("n") + I("a") + sb("n−3"), I("a") + sb("n−1"))}', 'Regla general: cada elemento = −(determinante 2×2 de las dos filas de arriba, columna 1 y la siguiente) ÷ el primero de la fila de arriba.', 'routh elemento general determinante'),
    row('Necesario: todos los coeficientes con el mismo signo y ninguno cero', 'Si falla, ya hay polos en el semiplano derecho o sobre jω (no hace falta el arreglo).', 'condicion necesaria coeficientes'),
    row(f'Cero en la 1.ª columna (fila no toda cero) ⇒ cámbialo por ε &gt; 0 pequeño y sigue', 'Cuenta los cambios de signo con ε → 0⁺. Otra forma: arreglo del polinomio con los coeficientes en orden inverso.', 'caso especial cero primera columna epsilon'),
    row(f'Fila de ceros ⇒ {I("P")}({s}) con la fila de arriba; cambia la fila por los coeficientes de {I("dP")}/{I("ds")}', 'P(s) = polinomio auxiliar (potencias que bajan de 2 en 2). Sus raíces son simétricas al origen: sin cambios de signo debajo, están sobre jω (oscila; K crítica).', 'caso especial fila de ceros polinomio auxiliar derivada'),
    row(f'P1: {s}³ + 12{s}² + 44{s} + (48 + {K}) ⇒ 0 &lt; {K} &lt; 480, {ω} = {rt("44")} = 6.633', 'Ejemplo con la fórmula de arriba (a = 12, b = 44, c = 48). P2: 396 · P4: 240.', 'ejemplo p1 k critica'),
]
X[14] = [
    row(f'|Re {I("p")}{sb("3")}| ≥ 5·{σ}', 'Regla de 5× (σ = parte real del par dominante). P1: p<sub>3</sub> = −7.94 = 3.92σ ⇒ el 2.º orden no basta.', 'regla cinco veces dominancia'),
    row(f'|{I("r")}{sb("3")}| / |{I("r")}{sb("1")}| &lt; 12 % ⇒ casi cancelado', 'Regla del residuo. P4: |r<sub>3</sub>| = 19 % del dominante ⇒ cancelación parcial (por eso 12 % y no 16 %).', 'regla residuo 12 por ciento cancelacion'),
]
X[15] = [
    row(f'{I("e")}(∞) = lím<sub>{I("s")}→0</sub> {fr(s + I("R") + "(" + s + ")", "1 + " + K + Gc + G + "(" + s + ")")}', 'Teorema del valor final aplicado al error (sólo si el lazo cerrado es estable).', 'error teorema valor final'),
    row(f'Tipo 1: {Kv} = {fr(K + "·∏" + I("z") + sb("i"), "∏" + I("p") + sb("j"))}', 'Producto de ceros y de polos sin el polo en el origen. P3: K<sub>v</sub> = 45.84/7 = 6.549.', 'kv tipo 1 producto'),
    row(f'Escalón de altura {I("A")}: {I("e")} = {fr(I("A"), "1 + " + Kp)}{Gp}Rampa {I("A")}{I("t")}: {I("e")} = {fr(I("A"), Kv)}', 'MATLAB: 1 − dcgain(T) (escalón) y 1/dcgain(minreal(s·K·Gc·G)) (rampa).', 'error amplitud escalon rampa'),
]
X[16] = [
    row(f'∠{Gc}({s0}) = ∠({s0} + {zc}) − ∠({s0} + {pc}){Gp}|{Gc}({s0})| = {fr("|" + s0 + " + " + zc + "|", "|" + s0 + " + " + pc + "|")}', 'Aporte del dipolo en el punto (PI: p<sub>c</sub> = 0). Casi no mueve el LGDR si |∠| &lt; 5° y 0.9 &lt; |G<sub>c</sub>| &lt; 1.1.', 'dipolo aporte angulo magnitud pi atraso'),
    row(f'Mejora = {fr(I("e") + sb("sin"), I("e") + sb("con"))} = {fr(K + sb("v,con"), K + sb("v,sin"))} = {fr(K + sb("con"), K + sb("sin"))}·{fr(zc, pc)} ≈ {fr(zc, pc)}', 'Mejora del error con atraso. P3: ×19.48 con 0.2/0.01 (la K bajó un poco: 44.64 vs 45.84).', 'mejora del error atraso razon'),
    row(f'{zc} = {pc}·{fr(K + sb("v,deseada"), K + sb("v,sin"))}', 'Diseño del atraso: se elige p<sub>c</sub> pequeño (0.01) y el cero sale de la razón (con algo de margen). Luego se re‑busca K.', 'diseno atraso cero razon'),
    row(f'Polo lento ≈ −{zc}: {I("e")}({I("t")}) ≈ {I("e")}(∞) + {I("c")}·{I("e")}{sp("−|" + I("p") + "|" + I("t"))}', 'Cola lenta del dipolo: alarga el tiempo en que el error llega a su valor final (ver T<sub>s</sub> por un modo lento, sección 7).', 'polo lento cola dipolo'),
]
X[17] = [
    fig('fxf-cero', fig_cero(), 'Ubicar el cero por geometría: el triángulo con ω<sub>d</sub> y z<sub>c</sub> − σ<sub>d</sub>.', 'grafica geometria cero polo adelanto pd'),
    row(f'PD: {θ}{sb("z")} = {θ}{sb("c")}{Gp}Adelanto: {θ}{sb("p")} = {θ}{sb("z")} − {θ}{sb("c")}', 'En el adelanto se fija el cero (o el polo) y el otro sale del ángulo que falta. Si θ<sub>z</sub> &gt; 90°, tan &lt; 0 y el cero queda a la derecha de σ<sub>d</sub>.', 'angulo cero polo adelanto pd theta'),
    row(f'{K}({s} + {zc}) = {K}{sb("D")}{s} + {K}{sb("P")}{Gp}{K}{sb("D")} = {K},{Gp}{K}{sb("P")} = {K}·{zc}', 'PD en forma de ganancias. P4: K<sub>D</sub> = 47.47, K<sub>P</sub> = 47.47·3.005 = 142.6.', 'pd kp kd ganancias proporcional derivativo'),
    row(f'|{K}{Gc}({I("j")}{ω})| = {K}{rt(ω + "² + " + zc + "²")}', 'El PD ideal amplifica el ruido de alta frecuencia (crece con ω); el adelanto lo limita con su polo.', 'ruido alta frecuencia pd'),
    row(f'PD: {K} = {fr("∏|" + sd + " + " + I("p") + sb("i") + "|", "|" + sd + " + " + zc + "|·∏|" + sd + " + " + I("z") + sb("i") + "|")}{Gp}Adelanto: ×|{sd} + {pc}|', 'Condición de magnitud con el compensador.', 'magnitud k adelanto pd'),
]
X[18] = [
    row(f'{K}{sb("P")} = {K}{sb("1")},{Gp}{K}{sb("I")} = {K}{sb("2")},{Gp}{K}{sb("D")} = {K}{sb("3")}', 'Mismas ganancias con otro nombre. P6: K<sub>1</sub> = 259.3, K<sub>2</sub> = 128.5, K<sub>3</sub> = 4.59. Simulink: PID Controller con P, I, D (sin filtro).', 'pid kp ki kd simulink'),
    row(f'{I("z")}{sb("atr")} = {fr(K + sb("v,deseada"), K + sb("v,con adelanto"))}·{I("p")}{sb("atr")}', 'P7: 84.18/9.14 = 9.21 ⇒ z<sub>atr</sub> = 0.0921 con p<sub>atr</sub> = 0.01. Revisa que |∠ atraso en s<sub>d</sub>| &lt; 5°.', 'adelanto atraso cero razon zat pat'),
]
X[19] = [
    row(f'Dif = {fr("|obtenido − meta|", "meta")}·100 %', 'Para comparar candidato contra simulado (tablas del reporte).', 'diferencia porcentaje comparar'),
    row('No cumple el %OS ⇒ más ζ de diseño (o dipolo más cerca del origen) · Lento ⇒ T<sub>s</sub> o T<sub>p</sub> objetivo menor', 'Ajuste y re‑verificación (P5: ζ<sub>d</sub> = 0.6273; P7: T<sub>s,d</sub> = 0.48 s).', 'ajuste rediseno no cumple'),
]
X[20] = [
    row('<code>[r,p,k] = residue(num,conv(den,[1 0]))</code> · <code>rlocfind(G)</code> · <code>step(T)</code> · <code>lsim(T,t,t)</code> · <code>zpk(T)</code>', 'residue de C(s) = T(s)/s da los residuos al escalón (regla del 12 %).', 'matlab residue rlocfind lsim'),
    table(['Bloque', 'Parámetro'], [
        ['Step / Ramp', 'Final value 1 · Slope 1'],
        ['Sum', '|+−'],
        ['Gain', 'K'],
        ['Transfer Fcn', 'Numerator [1 z<sub>c</sub>] · Denominator [1 p<sub>c</sub>]'],
        ['Planta', 'Denominator = conv(...): P1 [1 12 44 48]'],
        ['PID Controller', 'P, I, D (Filter off); PD: P = z<sub>c</sub>, D = 1 tras el Gain'],
        ['Error', 'otro Sum r − c → Scope'],
    ], 'simulink bloques parametros step ramp sum gain transfer fcn pid scope', 'Simulink: parámetros de los bloques.', 'fxt-sl'),
]

# ------------------------------------------------------------------ aplicar
a = src.index('<dialog class="sync fxd" id="fxDlg"')
b = src.index('</dialog>', a) + len('</dialog>')
dlg = src[a:b]

# 17: aclaración del ángulo que falta (la fórmula no cambia)
old17 = '<i>θ</i><sub>c</sub> = −180° − Σ∠(planta en <i>s</i><sub>d</sub>)</div><div class="fx-n">Ángulo faltante que aporta el compensador.</div>'
new17 = ('<i>θ</i><sub>c</sub> = −180° − ∠<i>G</i>(<i>s</i><sub>d</sub>)</div><div class="fx-n">Ángulo que falta y aporta el compensador; '
         '∠G(s<sub>d</sub>) = Σθ<sub>ceros</sub> − Σθ<sub>polos</sub> de la planta. Si sale fuera de 0°–180°, suma o resta 360° (P4: −180° + 275.61° = 95.61°).</div>')
assert old17 in dlg, 'no se encontró la fila del ángulo de la 17'
dlg = dlg.replace(old17, new17)

KW = {1: 'plano s euler', 2: 'laplace transformada', 3: 'polos ceros ganancia dc', 4: 'primer orden tau',
      5: 'segundo orden zeta omega n amortiguamiento', 6: 'ts tp os sobrepaso tiempo pico asentamiento',
      7: 'residuos fracciones parciales modos', 8: 'cero', 9: 'lazo cerrado ecuacion caracteristica',
      10: 'especificaciones punto de diseno', 11: 'angulo magnitud', 12: 'lgdr reglas trazo',
      13: 'routh hurwitz estabilidad', 14: 'dominantes dominancia', 15: 'error estado estacionario',
      16: 'pi atraso lag integral', 17: 'pd adelanto lead derivativo', 18: 'pid adelanto atraso',
      19: 'verificar verificacion', 20: 'matlab simulink comandos'}

def sec_sub(m):
    body = m.group(0); n = int(re.search(r'<h3><span>(\d+)</span>', body).group(1))
    body = body.replace('<section class="fx-s">', f'<section class="fx-s" id="fxs{n}" data-k="{KW[n]}">', 1)
    extra = ''.join(X.get(n, []))
    return body[:-len('</section>')] + extra + '</section>'
dlg, ns = re.subn(r'<section class="fx-s">.*?</section>', sec_sub, dlg, flags=re.S)
assert ns == 20, ns

# encabezado de cada parte para el modo búsqueda
for p, lab in (('I', 'Parte I · Fundamentos'), ('II', 'Parte II · Lazo cerrado y LGDR'), ('III', 'Parte III · Compensadores')):
    tag = f'<div class="fx-pane" data-fx-pane="{p}"'
    i = dlg.index(tag); j = dlg.index('>', i) + 1
    dlg = dlg[:j] + f'<p class="fx-ph">{lab}</p>' + dlg[j:]

# barra superior fija: título + buscador + cerrar · pestañas + índice
SEARCH_IC = '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5L20 20"/></svg>'
IDX_IC = '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M9 6h11M9 12h11M9 18h11"/><path d="M4.5 6h.01M4.5 12h.01M4.5 18h.01" stroke-width="3"/></svg>'
hd_old = re.search(r'<div class="sy-hd"><h2 id="fxTtl">Formulario</h2>(<button type="button" class="abicon" data-fx-close.*?</button>)</div>', dlg, re.S)
seg_old = re.search(r'<div class="sy-seg fx-seg".*?</div>', dlg, re.S)
top = ('<div class="fx-top">'
       f'<div class="sy-hd"><h2 id="fxTtl"><span aria-hidden="true">∑ </span>Formulario</h2>'
       f'<label class="fx-find">{SEARCH_IC}<input id="fxQ" type="search" placeholder="Buscar: routh, ruptura, kv…" autocomplete="off" autocapitalize="off" spellcheck="false" enterkeyhint="search" aria-label="Buscar en el formulario" aria-controls="fxCnt"></label>'
       f'{hd_old.group(1).replace("data-fx-close", "data-fx-close autofocus", 1)}</div>'
       f'<div class="fx-nav">{seg_old.group(0)}<button type="button" class="fx-ib" id="fxIdxB" aria-expanded="false" aria-controls="fxIdx">{IDX_IC}<span>Índice</span></button></div>'
       '<p class="fx-cnt" id="fxCnt" role="status" aria-live="polite" hidden></p>'
       '</div>')
dlg = dlg.replace(hd_old.group(0), '', 1).replace(seg_old.group(0), top + DEFS + '<div class="fx-idx" id="fxIdx" hidden></div>', 1)

dlg = dlg.replace('<th>ζ</th><th>θ</th><th>tan θ</th>', '<th class="nc">ζ</th><th class="nc">θ</th><th class="nc">tan θ</th>')
i = dlg.index('id="fxt-sl"'); j = dlg.index('class="fx-t"', i); dlg = dlg[:j] + 'class="fx-t fx-tw"' + dlg[j + len('class="fx-t"'):]
src = src[:a] + dlg + src[b:]
open(PATH, 'w', encoding='utf-8').write(src)
print('Formulario v74 aplicado:', sum(len(v) for v in X.values()), 'filas nuevas;', len(dlg), 'bytes en el diálogo')
