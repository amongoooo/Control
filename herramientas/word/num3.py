import numpy as np, math, cmath
P=np.poly1d
zeta=-math.log(0.15)/math.sqrt(math.pi**2+math.log(0.15)**2)
th=math.degrees(math.acos(zeta)); tn=math.tan(math.acos(zeta))
def resp(num,den):
    """lazo cerrado N/D; devuelve polos, residuos al escalón (r0, ri) y funciones c(t), e_rampa(t)"""
    N=P(num); D=P(den); p=D.r; dD=D.deriv()
    r0=N(0)/D(0); r=[N(pi)/(pi*dD(pi)) for pi in p]
    def c(t): return np.real(r0+sum(ri*np.exp(pi*t) for ri,pi in zip(r,p)))
    def er(t): return np.real(t-(r0*t+sum(ri*(np.exp(pi*t)-1)/pi for ri,pi in zip(r,p))))
    return p,r0,r,c,er
def info(c,T=40,dt=1e-4,yf=1.0):
    t=np.arange(0,T,dt); y=c(t)
    # valor final exacto
    i=np.argmax(y); pk=y[i]; tp=t[i]
    os_=(pk-yf)/yf*100
    out=np.where(np.abs(y-yf)>0.02*yf)[0]; ts=t[out[-1]+1] if len(out) else 0
    t10=t[np.argmax(y>=0.1*yf)]; t90=t[np.argmax(y>=0.9*yf)]
    return dict(os=os_,tp=tp,pk=pk,ts=ts,tr=t90-t10,yf=yf)
def angsum(sig,zs,ps):
    s=complex(-sig,sig*tn)
    return sum(math.degrees(cmath.phase(s-z)) for z in zs)-sum(math.degrees(cmath.phase(s-p)) for p in ps)
def search(zs,ps,lo,hi):
    f=lambda x: angsum(x,zs,ps)+180
    for _ in range(200):
        m=(lo+hi)/2
        if f(lo)*f(m)<=0: hi=m
        else: lo=m
    sig=(lo+hi)/2; s=complex(-sig,sig*tn)
    K=np.prod([abs(s-p) for p in ps])/np.prod([abs(s-z) for z in zs] or [1])
    return sig,s,K
R={}
R['zeta']=zeta; R['th']=th; R['tan']=tn
# referencia
sig=3.5; s0=complex(-3.5,3.5*tn); K0=abs(s0)*abs(s0+7)
R['s0']=s0; R['K0']=K0; R['wn0']=abs(s0)
p,r0,r,c,er=resp([K0],[1,7,K0]); R['ref_poles']=p; R['ref_r']=r; R['ref_info']=info(c,10)
R['ref_e']=er(np.array([30.0]))[0]; R['Kv0']=K0/7; R['e0']=7/K0
R['K1poles']=np.roots([1,7,1])
def lag(zc,pc,lo=2.5,hi=4):
    sig,s,K=search([-zc],[0,-7,-pc],lo,hi)
    den=np.polyadd(np.polymul([1,7,0],[1,pc]),np.polymul([K],[1,zc]))
    p,r0,r,c,er=resp(np.polymul([K],[1,zc]),den)
    Kv=K*zc/(7*pc)
    return dict(sig=sig,s=s,K=K,den=den,poles=p,r=r,r0=r0,info=info(c,40),Kv=Kv,e=1/Kv,esim=er(np.array([600.0]))[0],c=c,er=er)
A=lag(0.2,0.01); B=lag(0.02,0.001)
R['A']=A; R['B']=B
if __name__=='__main__':
    print('zeta',zeta,'th',th,'tan',tn)
    print('s0',s0,'K0',K0,'wn',abs(s0),'Kv',K0/7,'e',7/K0)
    print('ref',R['ref_info'],'erampa sim',R['ref_e'],'K=1 poles',R['K1poles'])
    print('ref residues',r0,R['ref_r'])
    for n,X in (('A',A),('B',B)):
        print(n,'sig',X['sig'],'s',X['s'],'K',X['K'],'den',X['den'])
        print('  poles',X['poles']); print('  r0',X['r0'],'r',X['r'])
        print('  info',X['info']); print('  Kv',X['Kv'],'e',X['e'],'esim',X['esim'],'mejora',(7/K0)/X['e'])
    for x in (3.2,3.3,3.4,3.5): print('sig',x,angsum(x,[-0.2],[0,-7,-0.01]))
    s=s0; print('dip ang', math.degrees(cmath.phase(s+0.2)-cmath.phase(s+0.01)), abs(s+0.2)/abs(s+0.01))
