import numpy as np, math, cmath
from num4 import resp, info
P = np.poly1d
OSd = 15
L = math.log(OSd / 100)
zeta = -L / math.sqrt(math.pi ** 2 + L ** 2)
th = math.degrees(math.acos(zeta)); tn = math.tan(math.acos(zeta))
R = {'zeta': zeta, 'th': th, 'tan': tn}
ZL = 10.0                                   # cero del adelanto (impuesto)
# ---------- referencia: s^2 + 7s + K, sigma = 3.5 fijo ----------
sig0 = 3.5; wd0 = sig0 * tn; s0 = complex(-sig0, wd0); K0 = abs(s0) * abs(s0 + 7)
R.update(sig0=sig0, wd0=wd0, s0=s0, K0=K0, wn0=abs(s0))
p, r0, r, c, er = resp([K0], [1, 7, K0])
R.update(ref_poles=p, ref_r=r, ref_info=info(c, 6), ref_e=er(np.array([30.0]))[0], Kv0=K0 / 7, e0=7 / K0, ref_c=c)
R['K1poles'] = np.roots([1, 7, 1])
R['sb'] = -3.5; R['Kb'] = 3.5 * 3.5
# ---------- diseño del libro (zeta de 15 %) ----------
Ts0 = 4 / sig0; Tsd = Ts0 / 3; sgd = 4 / Tsd


def design(zd):
    t = math.tan(math.acos(zd)); wd = sgd * t; sd = complex(-sgd, wd)
    angs = [math.degrees(cmath.phase(sd)), math.degrees(cmath.phase(sd + 7))]
    angz = math.degrees(cmath.phase(sd + ZL))
    angG = angz - sum(angs)                 # ángulo de (s+10)/[s(s+7)] en sd
    thp = angG + 180                        # lo que debe restar el polo
    pc = sgd + wd / math.tan(math.radians(thp))
    K = abs(sd) * abs(sd + 7) * abs(sd + pc) / abs(sd + ZL)
    return dict(zd=zd, wd=wd, sd=sd, angs=angs, angz=angz, angG=angG, thp=thp, pc=pc, K=K)


def closed(K, pc, T=3, dt=1e-5):
    num = np.polymul([K], [1, ZL]); den = np.polyadd(np.polymul([1, 7, 0], [1, pc]), num)
    p, r0, r, c, er = resp(num, den)
    return dict(den=den, poles=p, r=r, info=info(c, T, dt), e=er(np.array([30.0]))[0], Kv=K * ZL / (7 * pc), ec=7 * pc / (K * ZL), c=c, er=er)


D = design(zeta)
R.update(Ts0=Ts0, Tsd=Tsd, sgd=sgd, B=D, BC=closed(D['K'], D['pc']))
# ---------- ajuste: zeta de diseño tal que el modelo completo dé 15 % (bisección) ----------
osz = lambda zd: closed(design(zd)['K'], design(zd)['pc'], 2, 1e-5)['info']['os']
lo, hi = zeta, 0.75
for _ in range(45):
    m = (lo + hi) / 2
    if osz(m) > 15: lo = m
    else: hi = m
A = design((lo + hi) / 2)
R.update(A=A, AC=closed(A['K'], A['pc']))
R['tests'] = [(z, design(z), osz(z)) for z in (zeta, 0.55, 0.60, 0.65)]
if __name__ == '__main__':
    for k in ('zeta', 'th', 'tan', 'sig0', 'wd0', 'K0', 'wn0', 'ref_poles', 'ref_r', 'ref_info', 'ref_e', 'Kv0', 'e0', 'K1poles', 'Ts0', 'Tsd', 'sgd'):
        print(k, R[k])
    for nm in ('B', 'A'):
        d = R[nm]; c = R[nm + 'C']
        print(nm, {k: v for k, v in d.items()})
        print('  poles', c['poles'], 'r', c['r'], c['info'], 'e', c['e'], 'Kv', c['Kv'], 'ec', c['ec'], 'den', c['den'])
    for z, d, o in R['tests']: print('test', z, d['pc'], d['K'], o)
