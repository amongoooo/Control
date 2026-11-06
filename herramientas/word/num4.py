import numpy as np, math, cmath
P=np.poly1d
OSd=16
L=math.log(OSd/100)
zeta=-L/math.sqrt(math.pi**2+L**2)
th=math.degrees(math.acos(zeta)); tn=math.tan(math.acos(zeta))
def resp(num,den):
    N=P(num); D=P(den); p=D.r; dD=D.deriv()
    r0=N(0)/D(0); r=[N(pi)/(pi*dD(pi)) for pi in p]
    def c(t): return np.real(r0+sum(ri*np.exp(pi*t) for ri,pi in zip(r,p)))
    def er(t): return np.real(t-(r0*t+sum(ri*(np.exp(pi*t)-1)/pi for ri,pi in zip(r,p))))
    return p,r0,r,c,er
def info(c,T=20,dt=1e-5,yf=1.0):
    t=np.arange(0,T,dt); y=c(t)
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
R={'zeta':zeta,'th':th,'tan':tn}
PS=[0,-4,-6]
sig0,s0,K0=search([],PS,0.5,2.5)
R.update(sig0=sig0,s0=s0,K0=K0,wn0=abs(s0))
den0=np.polyadd([1,10,24,0],[K0])
p,r0,r,c,er=resp([K0],den0)
R.update(ref_poles=p,ref_r=r,ref_info=info(c,15),ref_e=er(np.array([40.0]))[0],Kv0=K0/24,e0=24/K0)
R['K1poles']=np.roots([1,10,24,1])
# ruptura
br=np.roots([3,20,24]); R['br']=br
sb=max(br); R['sb']=sb; R['Kb']=abs(sb*(sb+4)*(sb+6))
# diseño
Ts0=4/sig0; Tsd=Ts0/3; sgd=4/Tsd; wdd=sgd*tn; sd=complex(-sgd,wdd)
angs=[math.degrees(cmath.phase(sd-pp)) for pp in PS]
angG=-sum(angs); thz=-180-angG
zc=sgd+wdd/math.tan(math.radians(thz))
Kc=abs(sd)*abs(sd+4)*abs(sd+6)/abs(sd+zc)
R.update(Ts0=Ts0,Tsd=Tsd,sgd=sgd,wdd=wdd,sd=sd,angs=angs,angG=angG,thz=thz,zc=zc,Kc=Kc)
denc=np.polyadd([1,10,24,0],np.polymul([Kc],[1,zc]))
p,r0,r,c,er=resp(np.polymul([Kc],[1,zc]),denc)
R.update(c_den=denc,c_poles=p,c_r=r,c_info=info(c,15),c_e=er(np.array([40.0]))[0],Kvc=Kc*zc/24,ec=24/(Kc*zc),cfun=c,erfun=er)
# K para 16 % simulado con el mismo cero
def osK(K):
    d=np.polyadd([1,10,24,0],np.polymul([K],[1,zc])); return info(resp(np.polymul([K],[1,zc]),d)[3],10,1e-4)
lo,hi=Kc,400
for _ in range(50):
    m=(lo+hi)/2
    if osK(m)['os']<16: lo=m
    else: hi=m
R['K16']=lo; R['K16info']=osK(lo); R['K16poles']=np.roots(np.polyadd([1,10,24,0],np.polymul([lo],[1,zc])))
if __name__=='__main__':
    for k in ('zeta','th','tan','sig0','s0','K0','wn0','ref_poles','ref_r','ref_info','ref_e','Kv0','e0','K1poles','br','Kb','Ts0','Tsd','sgd','wdd','angs','angG','thz','zc','Kc','c_den','c_poles','c_r','c_info','c_e','Kvc','ec','K16','K16info','K16poles'):
        print(k,R[k])
    for x in (1.0,1.1,1.2,1.3,1.4): print('sig',x,angsum(x,[],PS))
