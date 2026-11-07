import numpy as np, math, cmath
from num4 import resp, info
OSd = 20
L = math.log(OSd / 100)
zeta = -L / math.sqrt(math.pi ** 2 + L ** 2)
th = math.degrees(math.acos(zeta)); tn = math.tan(math.acos(zeta))
R = {'zeta': zeta, 'th': th, 'tan': tn}
DEN = np.poly([-3, -6, -10])             # s^3+19s^2+108s+180
NUM = np.array([1.0, 8.0])
ZPI = 0.5


def angsum(sig, zs, ps, t=tn):
    s = complex(-sig, sig * t)
    return sum(math.degrees(cmath.phase(s - z)) for z in zs) - sum(math.degrees(cmath.phase(s - p)) for p in ps)


def search(zs, ps, lo, hi):
    f = lambda x: ((angsum(x, zs, ps) + 180 + 180) % 360) - 180
    for _ in range(200):
        m = (lo + hi) / 2
        if f(lo) * f(m) <= 0: hi = m
        else: lo = m
    sig = (lo + hi) / 2; s = complex(-sig, sig * tn)
    K = np.prod([abs(s - p) for p in ps]) / np.prod([abs(s - z) for z in zs])
    return sig, s, K


# ---------- referencia ----------
sig0, s0, K0 = search([-8], [-3, -6, -10], 4.5, 6.5)
R.update(sig0=sig0, s0=s0, K0=K0, wn0=abs(s0))
den0 = np.polyadd(DEN, K0 * NUM)
p, r0, r, c, er = resp(K0 * NUM, den0)
R.update(ref_poles=p, ref_r=r, ref_info=info(c, 3, 1e-5, yf=r0.real), ref_yf=r0.real, Kp0=8 * K0 / 180, e0=1 / (1 + 8 * K0 / 180), ref_c=c)
R['K1poles'] = np.roots(np.polyadd(DEN, NUM))
brk = np.roots(np.polysub(np.polymul(NUM, np.polyder(DEN)), np.polymul([1.0], DEN)))
R['brk'] = brk
sb = [x.real for x in brk if abs(x.imag) < 1e-9 and -6 < x.real < -3][0]
R['sb'] = sb; R['Kb'] = abs(np.polyval(DEN, sb) / np.polyval(NUM, sb))
# ---------- PD ----------
Tp0 = math.pi / s0.imag; Tpd = Tp0 * 2 / 3; wdd = math.pi / Tpd; sgd = wdd / tn; sd = complex(-sgd, wdd)
angs = [math.degrees(cmath.phase(sd + a)) for a in (3, 6, 10)]; ang8 = math.degrees(cmath.phase(sd + 8))
angG = ang8 - sum(angs); thz = -180 - angG
zc = sgd + wdd / math.tan(math.radians(thz))
Kpd = abs(sd + 3) * abs(sd + 6) * abs(sd + 10) / (abs(sd + 8) * abs(sd + zc))
R.update(Tp0=Tp0, Tpd=Tpd, wdd=wdd, sgd=sgd, sd=sd, angs=angs, ang8=ang8, angG=angG, thz=thz, zc=zc, Kpd=Kpd)
numPD = Kpd * np.polymul(NUM, [1, zc]); denPD = np.polyadd(DEN, numPD)
p, r0, r, c, er = resp(numPD, denPD)
R.update(pd_den=denPD, pd_poles=p, pd_r=r, pd_yf=r0.real, pd_info=info(c, 3, 1e-5, yf=r0.real), pd_e=1 - r0.real, Kp_pd=8 * zc * Kpd / 180)
# ---------- PI y re-búsqueda ----------
dpi = cmath.phase((sd + ZPI) / sd); mpi = abs((sd + ZPI) / sd)
R.update(dip_ang=math.degrees(dpi), dip_mag=mpi)
sigF, sF, KF = search([-8, -zc, -ZPI], [0, -3, -6, -10], 6.5, 8.5)
R.update(sigF=sigF, sF=sF, KF=KF, K1=KF * (zc + ZPI), K2=KF * zc * ZPI, K3=KF)
numF = KF * np.polymul(np.polymul(NUM, [1, zc]), [1, ZPI]); denF = np.polyadd(np.polymul(DEN, [1, 0]), numF)
p, r0, r, c, er = resp(numF, denF)
R.update(F_den=denF, F_num=numF, F_poles=p, F_r=r, F_info=info(c, 4, 1e-5, yf=1.0), F_c=c, Kv=KF * 8 * zc * ZPI / 180)
R['F_e12'] = 1 - c(np.array([12.0]))[0]
R['err'] = lambda t: (1 - R['ref_c'](t), 1 - (resp(numPD, denPD)[3])(t), 1 - c(t))
# Routh de 4.º orden con K = KF
a = denF; b1 = (a[1] * a[2] - a[3]) / a[1]; c1 = (b1 * a[3] - a[1] * a[4]) / b1
R.update(routh=(a, b1, c1))
if __name__ == '__main__':
    for k in ('zeta', 'th', 'tan', 'sig0', 's0', 'K0', 'wn0', 'ref_poles', 'ref_r', 'ref_info', 'ref_yf', 'Kp0', 'e0', 'K1poles', 'brk', 'sb', 'Kb',
              'Tp0', 'Tpd', 'wdd', 'sgd', 'sd', 'angs', 'ang8', 'angG', 'thz', 'zc', 'Kpd', 'pd_poles', 'pd_r', 'pd_yf', 'pd_info', 'pd_e', 'Kp_pd',
              'dip_ang', 'dip_mag', 'sigF', 'sF', 'KF', 'K1', 'K2', 'K3', 'F_den', 'F_poles', 'F_r', 'F_info', 'Kv', 'F_e12', 'routh'):
        print(k, R[k])
