import numpy as np, math, cmath
from num4 import resp, info
OSd = 20
L = math.log(OSd / 100)
zeta = -L / math.sqrt(math.pi ** 2 + L ** 2)
th = math.degrees(math.acos(zeta)); tn = math.tan(math.acos(zeta))
R = {'zeta': zeta, 'th': th, 'tan': tn}
ZL = 3.0          # cero del adelanto (impuesto)
PATR = 0.01       # polo del atraso


def angsum(sig, zs, ps):
    s = complex(-sig, sig * tn)
    return sum(math.degrees(cmath.phase(s - z)) for z in zs) - sum(math.degrees(cmath.phase(s - p)) for p in ps)


def search(zs, ps, lo, hi):
    f = lambda x: ((angsum(x, zs, ps) + 360) % 360) - 180
    for _ in range(200):
        m = (lo + hi) / 2
        if f(lo) * f(m) <= 0: hi = m
        else: lo = m
    sig = (lo + hi) / 2; s = complex(-sig, sig * tn)
    K = np.prod([abs(s - p) for p in ps]) / np.prod([abs(s - z) for z in zs])
    return sig, s, K


# ---------- referencia ----------
sig0 = 3.5; wd0 = sig0 * tn; s0 = complex(-sig0, wd0); K0 = abs(s0) * abs(s0 + 7)
p, r0, r, c, er = resp([K0], [1, 7, K0])
R.update(sig0=sig0, wd0=wd0, s0=s0, K0=K0, wn0=abs(s0), ref_poles=p, ref_r=r, ref_info=info(c, 4), ref_e=er(np.array([30.0]))[0],
         Kv0=K0 / 7, e0=7 / K0, K1poles=np.roots([1, 7, 1]))
Ts0 = 4 / sig0
R['Ts0'] = Ts0; R['meta'] = Ts0 / 2; R['Kvmeta'] = 10 * K0 / 7


def design(TsObj):
    sg = 4 / TsObj; wd = sg * tn; sd = complex(-sg, wd)
    angs = [math.degrees(cmath.phase(sd)), math.degrees(cmath.phase(sd + 7))]; angz = math.degrees(cmath.phase(sd + ZL))
    angG = angz - sum(angs); thp = angG + 180
    pad = sg + wd / math.tan(math.radians(thp))
    Kad = abs(sd) * abs(sd + 7) * abs(sd + pad) / abs(sd + ZL)
    Kvad = Kad * ZL / (7 * pad); ratio = R['Kvmeta'] / Kvad; zat = ratio * PATR
    dip = cmath.phase((sd + zat) / (sd + PATR)); dipm = abs((sd + zat) / (sd + PATR))
    sgF, sF, KF = search([-ZL, -zat], [0, -7, -pad, -PATR], sg - 1.5, sg + 0.8)
    num = KF * np.polymul([1, ZL], [1, zat]); den = np.polyadd(np.polymul(np.polymul([1, 7, 0], [1, pad]), [1, PATR]), num)
    p, r0, r, c, er = resp(num, den)
    return dict(Ts=TsObj, sg=sg, wd=wd, sd=sd, angs=angs, angz=angz, angG=angG, thp=thp, pad=pad, Kad=Kad, Kvad=Kvad, ratio=ratio, zat=zat,
                dip=math.degrees(dip), dipm=dipm, sgF=sgF, sF=sF, K=KF, den=den, num=num, poles=p, r=r, c=c, er=er,
                Kv=KF * ZL * zat / (7 * pad * PATR))


def sim(D, T=8, dt=1e-5):
    D['info'] = info(D['c'], T, dt); D['e'] = D['er'](np.array([130.0]))[0]; return D


B = sim(design(Ts0 / 2))
R['B'] = B
R['tests'] = []
A = None
for t in (0.571, 0.54, 0.51, 0.48):
    D = sim(design(t), 4, 2e-5); R['tests'].append((t, D['pad'], D['zat'], D['K'], D['info']['ts'], D['info']['os']))
    if A is None and D['info']['ts'] <= R['meta'] and t != round(Ts0 / 2, 3): A = t
R['A'] = sim(design(A))
if __name__ == '__main__':
    for k in ('zeta', 'th', 'tan', 'wd0', 'K0', 'ref_info', 'ref_e', 'Kv0', 'e0', 'K1poles', 'Ts0', 'meta', 'Kvmeta'):
        print(k, R[k])
    for nm in 'BA':
        D = R[nm]
        print(nm, {k: v for k, v in D.items() if k not in ('c', 'er', 'num')})
    for t in R['tests']: print('test', t)
