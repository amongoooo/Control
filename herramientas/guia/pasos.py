"""Genera los desarrollos «paso a paso para la libreta» de los ejercicios E1–E18 de la pestaña «Guía».

Uso, desde la raíz del repositorio:   python3 -I herramientas/guia/pasos.py index.html
Reemplaza en index.html lo que hay entre /*GSOL*/ y /*/GSOL*/ por  const GSOL={...};  (un objeto por ejercicio:
{ruta:[títulos de los pasos], st:[{t, in, f:[TeX], tb:{h:[...], r:[[...]]}, r: HTML}]}).
Sólo necesita numpy. Los números salen de la condición de ángulo, la de magnitud y la respuesta exacta por residuos.
"""
import json, re, sys, os
import numpy as np
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from lgdr import zOS, osZ, poly, angG, magK, on_zeta, cl_poles, step_info, DEG

# ---------------------------------------------------------------- formato
def F(x, d=4):
    if abs(x) < 0.5 * 10 ** (-d): x = 0.0
    s = f'{x:.{d}f}'
    if '.' in s: s = s.rstrip('0').rstrip('.')
    return '0' if s in ('-0', '') else s
def H(s):  # texto para HTML: signo menos tipográfico
    return re.sub(r'(?<![\w.])-(?=\d)', '−', s)
def cpx(s, d=4):
    return f'{F(s.real, d)} ± j{F(abs(s.imag), d)}'
def fac(a, d=4):  # (s + a) en TeX
    if abs(a) < 1e-12: return 's'
    return f'(s+{F(a, d)})' if a > 0 else f'(s-{F(-a, d)})'
def polyTeX(c, d=4):
    c = list(np.real(c)); n = len(c) - 1; out = ''
    for i, v in enumerate(c):
        p = n - i
        if abs(v) < 1e-12: continue
        sg = '-' if v < 0 else '+'
        a = abs(v)
        num = '' if (abs(a - 1) < 1e-12 and p > 0) else F(a, d)
        term = num + ('s' if p >= 1 else '') + (f'^{{{p}}}' if p >= 2 else '')
        out += (('-' if sg == '-' else '') if out == '' else sg) + term
    return out or '0'
def roots_txt(rs, d=4):
    rs = sorted(rs, key=lambda r: (-r.real, abs(r.imag)))
    out, used = [], set()
    for i, r in enumerate(rs):
        if i in used: continue
        if abs(r.imag) > 1e-6:
            for j in range(i + 1, len(rs)):
                if j not in used and abs(rs[j] - np.conj(r)) < 1e-6: used.add(j); break
            out.append(cpx(r, d))
        else:
            out.append(F(r.real, d))
    return ', '.join(out)

# ---------------------------------------------------------------- piezas de cálculo
def angle_terms(s, Z, P):
    """ángulo de cada factor (s+a) en el punto s; devuelve líneas TeX y la suma."""
    sg, w = -s.real, s.imag
    def one(a, nm):
        if abs(a - sg) < 1e-9: return 90.0, rf'\theta_{{{fac(a).strip("()")}}}=90^\circ'
        if a > sg:
            v = np.degrees(np.arctan(w / (a - sg)))
            return v, rf'\theta_{{{fac(a).strip("()")}}}=\tan^{{-1}}\frac{{{F(w)}}}{{{F(a)}-{F(sg)}}}={{{F(v, 2)}}}^\circ'
        v = 180 - np.degrees(np.arctan(w / (sg - a)))
        return v, rf'\theta_{{{fac(a).strip("()")}}}=180^\circ-\tan^{{-1}}\frac{{{F(w)}}}{{{F(sg)}-{F(a)}}}={{{F(v, 2)}}}^\circ'
    lines, sz, sp, tz, tp = [], 0, 0, [], []
    for i, z in enumerate(Z):
        v, l = one(-z, f'z{i+1}'); lines.append(l); sz += v; tz.append(F(v, 2))
    for i, p in enumerate(P):
        v, l = one(-p, f'p{i+1}'); lines.append(l); sp += v; tp.append(F(v, 2))
    tot = sz - sp
    zs = '+'.join(tz) if tz else '0'
    lines.append(rf'\angle G=\textstyle\sum\theta_z-\sum\theta_p=({zs})-({"+".join(tp)})={{{F(tot, 2)}}}^\circ')
    return lines, tot

def dist_terms(s, Z, P):
    sg, w = -s.real, s.imag
    def one(a):
        d = abs(s + a)
        return d, rf'|{fac(a)}|=\sqrt{{({F(a)}-{F(sg)})^2+{F(w)}^2}}={F(d)}'
    lines, dp, dz = [], [], []
    for p in P:
        d, l = one(-p); lines.append(l); dp.append(d)
    for z in Z:
        d, l = one(-z); lines.append(l); dz.append(d)
    K = np.prod(dp) / (np.prod(dz) if dz else 1)
    den = r'\cdot '.join(F(x) for x in dz) if dz else '1'
    lines.append(rf'K=\frac{{\prod|s+p_i|}}{{\prod|s+z_i|}}=\frac{{{r"\cdot ".join(F(x) for x in dp)}}}{{{den}}}={F(K, 2 if K >= 10 else 4)}')
    return lines, K

def trial_rows(z, Z, P, s0, mode='z', fixed=None):
    """tabla de tanteo sobre la recta de ζ (o vertical/horizontal)."""
    t = np.tan(np.arccos(z)) if mode == 'z' else None
    sg0, w0 = -s0.real, s0.imag
    rows = []
    def ang_at(s):
        a = angG(s, Z, P) * DEG
        return (a + 540) % 360 - 540 if a > 0 else a
    if mode == 'z':
        tri = sorted({round(sg0 * 0.75, 2), round(sg0 * 1.25, 2)})
        for sg in tri + [sg0]:
            s = complex(-sg, sg * t)
            rows.append([F(sg, 4 if sg == sg0 else 2), F(sg * t, 4 if sg == sg0 else 3), F(ang_at(s), 2) + '°'])
    else:  # recta vertical σ fijo: se tantea ω
        tri = sorted({round(w0 * 0.75, 2), round(w0 * 1.25, 2)})
        for w in tri + [w0]:
            s = complex(-sg0, w)
            rows.append([F(sg0), F(w, 4 if w == w0 else 2), F(ang_at(s), 2) + '°'])
    return rows

def pick_point(z, Z, P, near=None, first=False):
    r = on_zeta(z, Z, P)
    if near is not None: return min(r, key=lambda s: abs(s - near))
    return r[0] if first else r[-1]

def Kconst(K, Z, P):
    """tipo y constante (Kp, Kv o Ka) con su expresión TeX."""
    n0 = sum(1 for p in P if abs(p) < 1e-12) - sum(1 for z in Z if abs(z) < 1e-12)
    zs = [-z for z in Z if abs(z) > 1e-12]; ps = [-p for p in P if abs(p) > 1e-12]
    val = K * np.prod(zs) / np.prod(ps) if ps else K * np.prod(zs)
    nm = ['K_p', 'K_v', 'K_a'][min(n0, 2)]
    num = F(K, 2) + (r'\cdot ' + r'\cdot '.join(F(x) for x in zs) if zs else '')
    den = r'\cdot '.join(F(x) for x in ps) if ps else '1'
    tex = rf'{nm}=\lim_{{s\to0}}s^{{{n0}}}KG(s)=\frac{{{num}}}{{{den}}}={F(val)}' if n0 else rf'{nm}=\lim_{{s\to0}}KG(s)=\frac{{{num}}}{{{den}}}={F(val)}'
    if n0 == 0: e = 1 / (1 + val); et = rf'e_{{\text{{escalón}}}}=\frac{{1}}{{1+K_p}}=\frac{{1}}{{1+{F(val)}}}={F(e)}'
    elif n0 == 1: e = 1 / val; et = rf'e_{{\text{{escalón}}}}=0\qquad e_{{\text{{rampa}}}}=\frac{{1}}{{K_v}}=\frac{{1}}{{{F(val)}}}={F(e)}'
    else: e = 1 / val; et = rf'e_{{\text{{parábola}}}}=\frac{{1}}{{K_a}}={F(e)}'
    return n0, nm, val, e, [tex, et]

def charpoly(K, Z, P):
    D = poly(P); N = poly(Z)
    N = np.concatenate([np.zeros(len(D) - len(N)), N])
    return D + K * N, D, N

def sim(K, Z, P, tf=None):
    s = step_info(K, Z, P, tf)
    return s

# ---------------------------------------------------------------- constructor de pasos
class Sol:
    def __init__(s): s.st = []
    def add(s, t, f=None, r='', tb=None, inc=''):
        s.st.append(dict(t=t, inc=inc, f=f or [], tb=tb, r=H(r)))
    def out(s):
        return dict(ruta=[x['t'] for x in s.st], st=s.st)

def step_zeta(S, os=None, z=None, inc=''):
    if z is None:
        L = np.log(os / 100); z = zOS(os)
        f = [rf'\zeta=\frac{{-\ln({F(os/100)})}}{{\sqrt{{\pi^2+\ln^2({F(os/100)})}}}}=\frac{{{F(-L)}}}{{\sqrt{{9.8696+{F(L*L)}}}}}={F(z)}']
    else:
        f = [rf'\%OS=100\,e^{{-\zeta\pi/\sqrt{{1-\zeta^2}}}}=100\,e^{{-{F(z)}\pi/\sqrt{{1-{F(z)}^2}}}}={F(osZ(z), 2)}\,\%']
    th = np.degrees(np.arccos(z))
    f.append(rf'\theta=\cos^{{-1}}\zeta=\cos^{{-1}}({F(z)})={{{F(th, 2)}}}^\circ\qquad\tan\theta={F(np.tan(np.radians(th)))}')
    S.add('ζ, θ y tan θ de la recta', f, f'ζ = {F(z)}, θ = {F(th, 2)}°, tan θ = {F(np.tan(np.radians(th)))}', inc=inc)
    return z

def step_point(S, z, Z, P, s0, name='s₀', what='LGDR sin compensar', inc='', comp=''):
    rows = trial_rows(z, Z, P, s0)
    lines, tot = angle_terms(s0, Z, P)
    S.add(f'Busca {name} sobre la recta: condición de ángulo' + (f' ({comp})' if comp else ''),
          [r'\angle G(s)=\textstyle\sum\theta_z-\sum\theta_p=-180^\circ\qquad s=-\sigma+j\,\sigma\tan\theta'] + lines,
          f'{name} = {cpx(s0)} (la suma da {F(tot, 2)}°)',
          tb=dict(h=['σ (prueba)', 'ω = σ·tan θ', '∠G'], r=rows), inc=inc)

def step_K(S, Z, P, s0, name='s₀', inc='', comp=''):
    lines, K = dist_terms(s0, Z, P)
    S.add('K con la condición de magnitud' + (f' ({comp})' if comp else ''), lines, f'K = {F(K, 2 if K >= 10 else 4)}', inc=inc)
    return K

def step_cl(S, K, Z, P, s0, inc='', sig_ref=None):
    c, D, N = charpoly(K, Z, P)
    rs, _ = cl_poles(K, Z, P)
    f = [rf'D(s)+K\,N(s)={polyTeX(c)}=0']
    deg = len(c) - 1
    extra = [r for r in rs if abs(r - s0) > 1e-4 and abs(r - np.conj(s0)) > 1e-4]
    r = f'Polos: {roots_txt(rs)}'
    if deg == 3 and len(extra) == 1:
        p3 = extra[0].real
        f.append(rf'p_3=-a_2-2\,\mathrm{{Re}}(s_0)=-{F(c[1])}-2({F(s0.real)})={F(p3)}')
    if sig_ref and extra:
        rr = [abs(x.real) / sig_ref for x in extra if abs(x.imag) < 1e-6]
        if rr:
            f.append(rf'\frac{{|p_3|}}{{\sigma}}=\frac{{{F(max(abs(x.real) for x in extra if abs(x.imag)<1e-6))}}}{{{F(sig_ref)}}}={F(max(rr), 2)}\ (\text{{regla: }}\ge5)')
    S.add(f'Polos de lazo cerrado (ecuación de grado {deg}; con la calculadora: Ecuación)', f, r, inc=inc)
    return rs

def step_time(S, s0, inc='', os=None):
    sg, w = -s0.real, s0.imag
    f = [rf'T_s=\frac{{4}}{{\sigma}}=\frac{{4}}{{{F(sg)}}}={F(4/sg, 3)}\text{{ s}}\qquad T_p=\frac{{\pi}}{{\omega_d}}=\frac{{\pi}}{{{F(w)}}}={F(np.pi/w, 3)}\text{{ s}}']
    r = f'Ts = {F(4/sg, 3)} s, Tp = {F(np.pi/w, 3)} s'
    if os is None:
        zz = sg / abs(s0)
        f.append(rf'\zeta=\frac{{\sigma}}{{|s_0|}}=\frac{{{F(sg)}}}{{{F(abs(s0))}}}={F(zz)}\;\Rightarrow\;\%OS={F(osZ(zz), 1)}\,\%')
        r += f', ζ = {F(zz)}, %OS = {F(osZ(zz), 1)} %'
    S.add('Transitorio de 2.º orden con ese punto', f, r, inc=inc)

def step_err(S, K, Z, P, inc='', t='Tipo, constante de error y error'):
    n0, nm, val, e, f = Kconst(K, Z, P)
    r = f'tipo 0; Kp = {F(val)} → e(escalón) = {F(e)}' if n0 == 0 else (f'tipo 1; e(escalón) = 0; Kv = {F(val)} → e(rampa) = {F(e)}' if n0 == 1 else f'tipo {n0}; e(escalón) = e(rampa) = 0; Ka = {F(val)}')
    S.add(t, [rf'\text{{tipo}}={n0}\ (\text{{polos en el origen}})'] + f, r, inc=inc)
    return val, e

def step_sim(S, K, Z, P, inc='', tf=None, extra=''):
    si = sim(K, Z, P, tf)
    r = f'Simulación (o MATLAB step): %OS = {F(si["os"], 2)} %, Ts = {F(si["ts"], 3)} s, Tp = {F(si["tp"], 3)} s' if si['os'] > 0.05 else \
        f'Simulación: sin sobrepaso respecto al valor final; Ts = {F(si["ts"], 2)} s'
    S.add('Verifica con la simulación', [], r + (' · ' + extra if extra else ''), inc=inc)
    return si

def step_sd(S, z, inc='', Ts=None, Tp=None, sig=None, how=''):
    t = np.tan(np.arccos(z))
    if Ts is not None:
        sg = 4 / Ts; w = sg * t
        f = [rf'\sigma_d=\frac{{4}}{{T_{{s,d}}}}=\frac{{4}}{{{F(Ts)}}}={F(sg)}\qquad\omega_d=\sigma_d\tan\theta={F(sg)}\cdot{F(t)}={F(w)}']
    elif Tp is not None:
        w = np.pi / Tp; sg = w / t
        f = [rf'\omega_d=\frac{{\pi}}{{T_{{p,d}}}}=\frac{{\pi}}{{{F(Tp)}}}={F(w)}\qquad\sigma_d=\frac{{\omega_d}}{{\tan\theta}}=\frac{{{F(w)}}}{{{F(t)}}}={F(sg)}']
    else:
        sg = sig; w = sg * t
        f = [rf'\sigma_d={F(sg)}\qquad\omega_d=\sigma_d\tan\theta={F(sg)}\cdot{F(t)}={F(w)}']
    S.add('Punto de diseño s_d' + (f' ({how})' if how else ''), f, f's_d = −{F(sg)} ± j{F(w)}', inc=inc)
    return complex(-sg, w)

def step_angd(S, sd, Z, P, kind, inc=''):
    lines, tot = angle_terms(sd, Z, P)
    if kind == 'zero':
        th = -180 - tot; th = (th + 180) % 360 - 180
        lines.append(rf'\theta_z=-180^\circ-\angle G(s_d)=-180^\circ-({F(tot, 2)}^\circ)={{{F(th, 2)}}}^\circ')
        r = f'∠G(s_d) = {F(tot, 2)}° → el cero debe aportar θz = {F(th, 2)}°'
    else:
        th = tot + 180; th = (th + 180) % 360 - 180
        lines.append(rf'\theta_p=\angle G(s_d)+180^\circ={F(tot, 2)}^\circ+180^\circ={{{F(th, 2)}}}^\circ')
        r = f'∠ = {F(tot, 2)}° (ya con el cero) → el polo debe quitar θp = {F(th, 2)}°'
    S.add('Ángulos en s_d y ángulo que falta', lines, r, inc=inc)
    return th

def step_geo(S, sd, th, kind, inc=''):
    sg, w = -sd.real, sd.imag
    v = sg + w / np.tan(np.radians(th))
    nm = 'z_c' if kind == 'zero' else 'p_c'
    f = [rf'{nm}=\sigma_d+\frac{{\omega_d}}{{\tan\theta}}={F(sg)}+\frac{{{F(w)}}}{{\tan({F(th, 2)}^\circ)}}={F(sg)}+({F(w/np.tan(np.radians(th)))})={F(v)}']
    S.add('Cero del compensador por geometría' if kind == 'zero' else 'Polo del compensador por geometría', f,
          (f'z_c = {F(v)} → G_c = s + {F(v)}' if kind == 'zero' else f'p_c = {F(v)}'), inc=inc)
    return v

def step_dip(S, s0, zc, pc, inc=''):
    a1 = np.degrees(np.angle(s0 + zc)); a2 = np.degrees(np.angle(s0 + pc)); m = abs(s0 + zc) / abs(s0 + pc)
    pn = 's_0' if abs(pc) < 1e-12 else f's_0+{F(pc)}'
    f = [rf'\angle G_c(s_0)=\angle(s_0+{F(zc)})-\angle({pn})={F(a1, 2)}^\circ-{F(a2, 2)}^\circ={{{F(a1-a2, 2)}}}^\circ',
         rf'|G_c(s_0)|=\frac{{|s_0+{F(zc)}|}}{{|{pn}|}}=\frac{{{F(abs(s0+zc))}}}{{{F(abs(s0+pc))}}}={F(m)}']
    S.add('Efecto del dipolo en s₀', f, f'{F(a1-a2, 2)}°, |G_c| = {F(m)}: el punto casi no se mueve' if abs(a1-a2) < 5 else f'{F(a1-a2, 2)}°: ya no es un dipolo chico', inc=inc)

# ---------------------------------------------------------------- ejercicios
G = {}

def ex_gain(id, P, Z, os=None, z=None, lgdr=False, adj=None, Ts=None, incs='abcd'):
    S = Sol(); a, b, c, d = (list(incs) + ['', '', '', ''])[:4]
    if lgdr:
        n, m = len(P), len(Z)
        sa = (sum(P) - sum(Z)) / (n - m)
        f = [rf'\sigma_a=\frac{{\sum p-\sum z}}{{n-m}}=\frac{{{F(sum(P))}-({F(sum(Z))})}}{{{n}-{m}}}={F(sa)}\qquad\theta_a=\frac{{(2k+1)180^\circ}}{{{n-m}}}=' + r',\ '.join(f'{F((2*k+1)*180/(n-m),0)}^\\circ' for k in range(n-m)) + '']
        D = poly(P); N = poly(Z); Nd = np.polyder(N) if len(N) > 1 else np.array([0.0]); Dd = np.polyder(D)
        Q = np.polysub(np.polymul(N, Dd), np.polymul(np.polyder(N) if len(N) > 1 else [0], D))
        rq = np.roots(Q); rq = [x.real for x in rq if abs(x.imag) < 1e-9]
        # raíz que está sobre el LGDR (K > 0)
        good = [x for x in rq if -np.polyval(D, x) / np.polyval(N, x) > 0]
        sb = good[0]; Kb = -np.polyval(D, sb) / np.polyval(N, sb)
        f.append(rf'N\,D^{{\prime}}-N^{{\prime}}D=0:\ {polyTeX(Q)}=0\;\Rightarrow\;\sigma={", ".join(F(x) for x in sorted(rq, reverse=True))}')
        f.append(rf'\sigma_b={F(sb)}\ (\text{{está en el LGDR}})\qquad K_b=\left|\frac{{D(\sigma_b)}}{{N(\sigma_b)}}\right|={F(Kb, 3)}')
        # Routh 3.er orden s^3 + a s^2 + b s + (c+K)
        cD = D / D[0]
        if len(cD) == 4 and len(Z) == 0:
            Kc = cD[1] * cD[2] - cD[3]; w = np.sqrt(cD[2])
            f.append(rf'\text{{Routh: }}s^3+{F(cD[1])}s^2+{F(cD[2])}s+({F(cD[3])}+K)\;\Rightarrow\;K_{{\text{{crít}}}}={F(cD[1])}\cdot{F(cD[2])}-{F(cD[3])}={F(Kc, 2)},\ \omega=\sqrt{{{F(cD[2])}}}={F(w)}')
        segs = sorted(P + Z, reverse=True)
        S.add('Reglas del LGDR: asíntotas, ruptura y cruce con jω', f,
              f'σa = {F(sa)}; ruptura σb = {F(sb)} (K = {F(Kb, 3)})' + (f'; estable 0 < K < {F(Kc, 2)}, cruce ±j{F(w)}' if len(cD) == 4 and not Z else ''), inc=a)
    if Ts is None:
        zz = step_zeta(S, os=os, z=z, inc=b if lgdr else a)
        s0 = pick_point(zz, Z, P, first=True)
        step_point(S, zz, Z, P, s0, inc=b if lgdr else a)
    else:
        sg = 4 / Ts
        S.add('Traduce Ts a la recta vertical', [rf'\sigma=\frac{{4}}{{T_s}}=\frac{{4}}{{{F(Ts)}}}={F(sg)}\qquad s=-{F(sg)}+j\omega'], f'Se busca sobre la recta σ = {F(sg)}', inc=a)
        # punto sobre la vertical: ∠G = -180
        ws = np.linspace(1e-3, 50, 200001); fv = [((angG(complex(-sg, w), Z, P) * DEG + 180 + 180) % 360) - 180 for w in ws]
        i = next(i for i in range(len(ws) - 1) if np.sign(fv[i]) != np.sign(fv[i + 1]) and abs(fv[i] - fv[i + 1]) < 10)
        lo, hi = ws[i], ws[i + 1]
        for _ in range(80):
            mi = (lo + hi) / 2
            fm = ((angG(complex(-sg, mi), Z, P) * DEG + 360) % 360) - 180
            fl = ((angG(complex(-sg, lo), Z, P) * DEG + 360) % 360) - 180
            if np.sign(fm) == np.sign(fl): lo = mi
            else: hi = mi
        s0 = complex(-sg, (lo + hi) / 2)
        rows = trial_rows(None, Z, P, s0, mode='v')
        lines, tot = angle_terms(s0, Z, P)
        S.add('Busca s₀ sobre la recta vertical: condición de ángulo', [r'\angle G(-\sigma+j\omega)=-180^\circ'] + lines,
              f's₀ = {cpx(s0)} (suma {F(tot, 2)}°)', tb=dict(h=['σ', 'ω (prueba)', '∠G'], r=rows), inc=b)
    K = step_K(S, Z, P, s0, inc=b if (lgdr or Ts) else b)
    if Ts is None:
        step_cl(S, K, Z, P, s0, inc=d if lgdr else b, sig_ref=-s0.real)
        step_time(S, s0, inc=c if lgdr else c, os=os)
    else:
        step_cl(S, K, Z, P, s0, inc=b, sig_ref=-s0.real)
        step_time(S, s0, inc=c, os=None)
    step_err(S, K, Z, P, inc=c)
    si = step_sim(S, K, Z, P, inc=d if lgdr else c)
    if adj:
        lo, hi = K, K * 1.5
        for _ in range(60):
            mi = (lo + hi) / 2
            if sim(mi, Z, P)['os'] < adj: lo = mi
            else: hi = mi
        S.add('Ajuste: K para el %OS pedido (simulando)', [rf'\text{{se sube }}K\text{{ hasta que el }}\%OS\text{{ simulado sea }}{F(adj,0)}\,\%'], f'K ≈ {F((lo+hi)/2, 2)} → {F(sim((lo+hi)/2, Z, P)["os"], 2)} %', inc=d if lgdr else c)
    return S.out()

def ex_lagpi(id, P, Z, zc, pc, os=None, z=None, factor=None, m=None, cl0=None):
    S = Sol(); m = m or {}
    g = lambda k: m.get(k, '')
    zz = step_zeta(S, os=os, z=z, inc=g('ref'))
    s0 = pick_point(zz, Z, P, first=True)
    step_point(S, zz, Z, P, s0, inc=g('ref'))
    K0 = step_K(S, Z, P, s0, inc=g('ref'))
    if cl0: step_cl(S, K0, Z, P, s0, inc=cl0, sig_ref=-s0.real)
    v0, e0 = step_err(S, K0, Z, P, inc=g('err0'), t='Error sin compensar')
    if factor:
        S.add('Factor de mejora y atraso', [rf'\frac{{z_c}}{{p_c}}\approx\text{{factor}}={F(factor,0)}\;\Rightarrow\;p_c={F(pc)},\ z_c={F(factor)}\cdot{F(pc)}={F(zc)}'],
              f'G_c = (s + {F(zc)})/(s + {F(pc)})', inc=g('dip'))
    step_dip(S, s0, zc, pc, inc=g('dip'))
    Zc, Pc = Z + [-zc], P + [-pc]
    s1 = pick_point(zz, Zc, Pc, near=s0)
    step_point(S, zz, Zc, Pc, s1, inc=g('reb'), comp='con el compensador')
    K1 = step_K(S, Zc, Pc, s1, inc=g('reb'), comp='con el compensador')
    step_cl(S, K1, Zc, Pc, s1, inc=g('reb'))
    v1, e1 = step_err(S, K1, Zc, Pc, inc=g('reb'), t='Error con el compensador')
    if pc != 0:
        nm = 'K_p' if abs(sum(1 for x in P if abs(x) < 1e-12)) == 0 else 'K_v'
        S.add('Mejora del error', [rf'\frac{{{nm},\text{{nueva}}}}{{{nm},\text{{antes}}}}=\frac{{{F(v1)}}}{{{F(v0)}}}={F(v1/v0, 2)}\qquad\frac{{e_{{\text{{antes}}}}}}{{e_{{\text{{después}}}}}}=\frac{{{F(e0)}}}{{{F(e1)}}}={F(e0/e1, 2)}'],
              f'constante ×{F(v1/v0, 2)}; error ×{F(e0/e1, 2)} menor', inc=g('mej'))
    step_sim(S, K1, Zc, Pc, inc=g('sim'), tf=400)
    return S.out()

def ex_pdlead(id, P, Z, os, Ts=None, Tsdiv=None, zlead=None, adjz=False, m=None, ref=False, err0=False):
    S = Sol(); m = m or {}
    g = lambda k: m.get(k, '')
    zz = step_zeta(S, os=os, inc=g('ref') or g('sd'))
    if Tsdiv or ref:
        s0 = pick_point(zz, Z, P, first=True)
        step_point(S, zz, Z, P, s0, inc=g('ref'))
        K0 = step_K(S, Z, P, s0, inc=g('ref'))
        Ts0 = 4 / -s0.real
        if Tsdiv:
            S.add('Ts sin compensar y Ts pedido', [rf'T_s=\frac{{4}}{{{F(-s0.real)}}}={F(Ts0)}\text{{ s}}\qquad T_{{s,d}}=\frac{{{F(Ts0)}}}{{{F(Tsdiv,0)}}}={F(Ts0/Tsdiv)}\text{{ s}}'],
                  f'T_s,d = {F(Ts0/Tsdiv)} s', inc=g('ref'))
            Ts = Ts0 / Tsdiv
        else:
            S.add('Ts sin compensar', [rf'T_s=\frac{{4}}{{\sigma}}=\frac{{4}}{{{F(-s0.real)}}}={F(Ts0)}\text{{ s}}'], f'Ts = {F(Ts0)} s (se pide {F(Ts)} s)', inc=g('ref'))
        if err0: step_err(S, K0, Z, P, inc=g('ref'), t='Error sin compensar')
    sd = step_sd(S, zz, inc=g('sd'), Ts=Ts)
    if zlead is None:
        th = step_angd(S, sd, Z, P, 'zero', inc=g('comp'))
        zc = step_geo(S, sd, th, 'zero', inc=g('comp'))
        Zc, Pc = Z + [-zc], P
    else:
        th = step_angd(S, sd, Z + [-zlead], P, 'pole', inc=g('comp'))
        pc = step_geo(S, sd, th, 'pole', inc=g('comp'))
        Zc, Pc = Z + [-zlead], P + [-pc]
    K = step_K(S, Zc, Pc, sd, name='s_d', inc=g('K'), comp='en s_d con el compensador')
    step_cl(S, K, Zc, Pc, sd, inc=g('K'), sig_ref=-sd.real)
    step_err(S, K, Zc, Pc, inc=g('K'))
    step_sim(S, K, Zc, Pc, inc=g('K'))
    if adjz:  # P5: ajuste de ζd con σ y cero fijos
        def dis(zd):
            sg = -sd.real; w = sg * np.tan(np.arccos(zd)); s = complex(-sg, w)
            a_ = angG(s, Z + [-zlead], P) * DEG; tp = a_ + 180; tp = (tp + 180) % 360 - 180
            p_ = sg + w / np.tan(np.radians(tp)); K_ = magK(s, Z + [-zlead], P + [-p_])
            return p_, K_, sim(K_, Z + [-zlead], P + [-p_])['os']
        lo, hi = zz, 0.9
        for _ in range(40):
            mi = (lo + hi) / 2
            if dis(mi)[2] > os: lo = mi
            else: hi = mi
        p_, K_, o_ = dis((lo + hi) / 2)
        S.add('Ajuste: sube ζ_d (mismo σ_d y mismo cero) hasta cumplir', [rf'\zeta_d={F((lo+hi)/2)}\;\Rightarrow\;p_c={F(p_,2)},\ K={F(K_,1)}'], f'p_c = {F(p_, 2)}, K = {F(K_, 1)} → {F(o_, 2)} %', inc=g('K'))
    return S.out()

def ex_pid(id, P, Z, os, Tpmul, zpi, incs='abcd'):
    S = Sol(); a, b, c, d = (list(incs) + ['', '', '', ''])[:4]
    zz = step_zeta(S, os=os, inc=a)
    s0 = pick_point(zz, Z, P, first=True)
    step_point(S, zz, Z, P, s0, inc=a)
    K0 = step_K(S, Z, P, s0, inc=a)
    Tp0 = np.pi / s0.imag
    S.add('Tp sin compensar y Tp pedido', [rf'T_p=\frac{{\pi}}{{{F(s0.imag)}}}={F(Tp0)}\text{{ s}}\qquad T_{{p,d}}=\tfrac{{2}}{{3}}\cdot{F(Tp0)}={F(Tp0*Tpmul)}\text{{ s}}'], f'T_p,d = {F(Tp0*Tpmul)} s', inc=a)
    step_err(S, K0, Z, P, inc=a, t='Error sin compensar')
    sd = step_sd(S, zz, inc=b, Tp=Tp0 * Tpmul)
    th = step_angd(S, sd, Z, P, 'zero', inc=b)
    zpd = step_geo(S, sd, th, 'zero', inc=b)
    Kpd = step_K(S, Z + [-zpd], P, sd, name='s_d', inc=b, comp='sólo el PD')
    step_dip(S, sd, zpi, 0, inc=c)
    Zc, Pc = Z + [-zpd, -zpi], P + [0]
    s1 = pick_point(zz, Zc, Pc, near=sd)
    step_point(S, zz, Zc, Pc, s1, inc=c, comp='con el PID')
    K = step_K(S, Zc, Pc, s1, inc=c, comp='con el PID')
    K1, K2, K3 = K * (zpd + zpi), K * zpd * zpi, K
    S.add('Ganancias del PID', [rf'K_1=K(z_{{PD}}+z_{{PI}})={F(K,4)}({F(zpd)}+{F(zpi)})={F(K1,2)}',
                                rf'K_2=K\,z_{{PD}}\,z_{{PI}}={F(K,4)}\cdot{F(zpd)}\cdot{F(zpi)}={F(K2,2)}\qquad K_3=K={F(K3,4)}'],
          f'K1 = {F(K1, 2)}, K2 = {F(K2, 2)}, K3 = {F(K3, 4)}', inc=d)
    step_cl(S, K, Zc, Pc, s1, inc=d)
    step_err(S, K, Zc, Pc, inc=d)
    step_sim(S, K, Zc, Pc, inc=d, tf=40)
    return S.out()

def ex_ll(id, P, Z, os, Tsdiv, zlead, kvmul, plag, incs='abcd'):
    S = Sol(); a, b, c, d = (list(incs) + ['', '', '', ''])[:4]
    zz = step_zeta(S, os=os, inc=a)
    s0 = pick_point(zz, Z, P, first=True)
    step_point(S, zz, Z, P, s0, inc=a)
    K0 = step_K(S, Z, P, s0, inc=a)
    v0, e0 = step_err(S, K0, Z, P, inc=a, t='Error sin compensar')
    Ts0 = 4 / -s0.real
    sd = step_sd(S, zz, inc=b, Ts=Ts0 / Tsdiv, how=f'Ts = {F(Ts0)}/{F(Tsdiv,0)} = {F(Ts0/Tsdiv)} s')
    th = step_angd(S, sd, Z + [-zlead], P, 'pole', inc=b)
    pl = step_geo(S, sd, th, 'pole', inc=b)
    Zl, Pl = Z + [-zlead], P + [-pl]
    Kl = step_K(S, Zl, Pl, sd, name='s_d', inc=b, comp='con el adelanto')
    vl, el = step_err(S, Kl, Zl, Pl, inc=b, t='K_v con el adelanto')
    fac_ = kvmul * v0 / vl; zl = fac_ * plag
    S.add('Factor del atraso', [rf'K_{{v,\text{{pedida}}}}={F(kvmul,0)}\cdot{F(v0)}={F(kvmul*v0)}\qquad\text{{factor}}=\frac{{{F(kvmul*v0)}}}{{{F(vl)}}}={F(fac_)}',
                                rf'z_c=\text{{factor}}\cdot p_c={F(fac_)}\cdot{F(plag)}={F(zl)}'], f'atraso (s + {F(zl)})/(s + {F(plag)})', inc=c)
    step_dip(S, sd, zl, plag, inc=c)
    Zc, Pc = Zl + [-zl], Pl + [-plag]
    s1 = pick_point(zz, Zc, Pc, near=sd)
    step_point(S, zz, Zc, Pc, s1, inc=d, comp='con adelanto y atraso')
    K = step_K(S, Zc, Pc, s1, inc=d, comp='final')
    step_cl(S, K, Zc, Pc, s1, inc=d)
    step_err(S, K, Zc, Pc, inc=d, t='Error final')
    step_sim(S, K, Zc, Pc, inc=d, tf=200)
    return S.out()

G['e1'] = ex_gain('e1', [-2, -4, -6], [], os=10, lgdr=True, adj=10)
G['e2'] = ex_lagpi('e2', [-1, -2, -10], [], 0.1, 0, z=0.174, m=dict(ref='a', err0='b', dip='c', reb='d', sim='d'))
G['e3'] = ex_lagpi('e3', [0, -7], [], 0.2, 0.01, os=15, factor=20, m=dict(ref='a', err0='a', dip='b', reb='b', mej='c', sim='c'))
G['e4'] = ex_pdlead('e4', [0, -4, -6], [], 16, Tsdiv=3, m=dict(ref='a', sd='b', comp='c', K='d'))
G['e5'] = ex_pdlead('e5', [0, -7], [], 15, Tsdiv=3, zlead=10, adjz=True, m=dict(ref='a', sd='a', comp='b', K='c'))
G['e6'] = ex_pid('e6', [-3, -6, -10], [-8], 20, 2/3, 0.5)
G['e7'] = ex_ll('e7', [0, -7], [], 20, 2, 3, 10, 0.01)
G['e8'] = ex_gain('e8', [-2, -4, -6], [], os=20, incs='abc')
G['e9'] = ex_gain('e9', [0, -4, -6], [], Ts=4, incs='abc')
G['e10'] = ex_pdlead('e10', [0, -7], [], 10, Ts=0.5, m=dict(sd='a', comp='b', K='c'))
G['e11'] = ex_lagpi('e11', [-1, -2, -10], [], 0.1, 0.01, os=20, factor=10, m=dict(ref='a', err0='a', dip='b', reb='c', mej='c', sim='c'))
G['e12'] = ex_pdlead('e12', [0, -4, -6], [], 20, Ts=2, zlead=5, m=dict(sd='a', comp='b', K='c'))
G['e13'] = ex_lagpi('e13', [-3, -5, -8], [], 0.1, 0, os=15, cl0='b', m=dict(ref='a', err0='b', dip='c', reb='d', sim='e'))
G['e14'] = ex_lagpi('e14', [0, -3, -9], [], 0.1, 0.01, os=15, factor=10, cl0='a', m=dict(ref='a', err0='a', dip='b', reb='c', mej='c', sim='d'))
G['e15'] = ex_pdlead('e15', [-1, -5, -10], [], 15, Tsdiv=2, err0=True, m=dict(ref='a', sd='b', comp='c', K='d'))
G['e16'] = ex_pdlead('e16', [0, -2, -8], [], 20, Ts=2, zlead=2, ref=True, err0=True, m=dict(ref='a', sd='b', comp='c', K='d'))
G['e17'] = ex_pid('e17', [-0.5, -4, -10], [], 15, 2/3, 0.5)
G['e18'] = ex_ll('e18', [0, -5, -10], [], 15, 2, 4, 10, 0.01)

if __name__ == '__main__':
    if len(sys.argv) > 1:
        p = sys.argv[1]; s = open(p, encoding='utf-8').read()
        js = '/*GSOL*/const GSOL=' + json.dumps(G, ensure_ascii=False, separators=(',', ':')) + ';/*/GSOL*/'
        s2, n = re.subn(r'/\*GSOL\*/.*?/\*/GSOL\*/', lambda m: js, s, flags=re.S)
        if n != 1: sys.exit('No encontré los marcadores /*GSOL*/ … /*/GSOL*/')
        open(p, 'w', encoding='utf-8').write(s2)
        print('GSOL:', len(js), 'caracteres,', sum(len(v['st']) for v in G.values()), 'pasos')
    else:
        for k, v in G.items():
            print('==', k)
            for i, st in enumerate(v['st'], 1): print(f'  {i}. [{st["inc"]}] {st["t"]} → {st["r"]}')
