import numpy as np
P = np.polynomial.polynomial
DEG = 180/np.pi

def poly(roots):  # coeficientes en orden descendente
    return np.real(np.poly(roots)) if len(roots) else np.array([1.0])

def zOS(os):
    l = np.log(os/100); return -l/np.sqrt(np.pi**2+l*l)
def osZ(z):
    return 100*np.exp(-z*np.pi/np.sqrt(1-z*z))

def angG(s, Z, Pp):
    a = sum(np.angle(s-z) for z in Z) - sum(np.angle(s-p) for p in Pp)
    return a
def magK(s, Z, Pp):
    num = np.prod([abs(s-z) for z in Z]) if Z else 1.0
    den = np.prod([abs(s-p) for p in Pp])
    return den/num
def wrap(a):  # a -> (-pi, pi]
    return (a+np.pi) % (2*np.pi) - np.pi

def on_zeta(z, Z, Pp, rmax=200, last=True):
    """punto del LGDR sobre la recta de ζ: ángulo = 180°. Devuelve el cruce (el último, como rmin de MATLAB salta dipolos)."""
    th = np.arccos(z); d = np.exp(1j*(np.pi-th))
    rs = np.linspace(1e-3, rmax, 200001)
    f = np.array([wrap(angG(r*d, Z, Pp)-np.pi) for r in rs])
    roots = []
    for i in range(len(rs)-1):
        if f[i] == 0 or (np.sign(f[i]) != np.sign(f[i+1]) and abs(f[i]-f[i+1]) < 1):
            a, b = rs[i], rs[i+1]
            for _ in range(80):
                m = (a+b)/2
                fm = wrap(angG(m*d, Z, Pp)-np.pi)
                if np.sign(fm) == np.sign(wrap(angG(a*d, Z, Pp)-np.pi)): a = m
                else: b = m
            roots.append((a+b)/2*d)
    return roots

def cl_poles(K, Z, Pp):
    D = poly(Pp); N = poly(Z)
    N = np.concatenate([np.zeros(len(D)-len(N)), N])
    return np.roots(D + K*N), D + K*N

def step_info(K, Z, Pp, tf=None):
    """respuesta al escalón de T = K N / (D + K N) por residuos."""
    D = poly(Pp); N = poly(Z)
    Nf = np.concatenate([np.zeros(len(D)-len(N)), N])*K
    Dc = D + Nf
    pc = np.roots(Dc)
    # C(s) = Nf/(s Dc); residuos
    num = np.trim_zeros(Nf, 'f')
    cinf = np.polyval(num, 0)/np.polyval(Dc, 0)
    res = []
    dDc = np.polyder(Dc)
    for p in pc:
        res.append(np.polyval(num, p)/(p*np.polyval(dDc, p)))
    slow = min(abs(np.real(pc)))
    if tf is None: tf = 12/slow
    t = np.linspace(0, tf, 400001)
    y = cinf + sum((r*np.exp(p*t)) for r, p in zip(res, pc)).real
    i = np.argmax(y); pk = y[i]
    os = 100*(pk-cinf)/cinf
    out = np.where(abs(y-cinf) > 0.02*abs(cinf))[0]
    ts = t[out[-1]+1] if len(out) else 0
    return dict(os=os, tp=t[i], ts=ts, cinf=cinf, poles=pc, res=res)

def Kconst(K, Z, Pp, kind):
    # Kp (tipo 0) o Kv (tipo 1)
    Zs = [z for z in Z if abs(z) > 1e-12]; Ps = [p for p in Pp if abs(p) > 1e-12]
    nz = len(Pp)-len(Ps) - (len(Z)-len(Zs))
    val = K*np.prod([-z for z in Zs])/np.prod([-p for p in Ps]) if Ps else K*np.prod([-z for z in Zs])
    return val, nz

def routh_kcrit(Z, Pp, lo=1e-3, hi=1e5):
    def stable(K):
        p, _ = cl_poles(K, Z, Pp); return np.all(np.real(p) < -1e-9)
    if stable(hi): return None
    a, b = lo, hi
    if not stable(a): return 0
    for _ in range(200):
        m = np.sqrt(a*b) if b/a > 2 else (a+b)/2
        if stable(m): a = m
        else: b = m
    p, _ = cl_poles(b, Z, Pp)
    w = max(abs(np.imag(p[np.argmin(abs(np.real(p)))])), 0)
    return a, w
