/* =====================================================================================================
   entrenar/calc.js · Calculadora científica del Laboratorio LGDR
   ---------------------------------------------------------------------------------------------------
   Funciones útiles de una científica tipo fx‑991CW, hecha desde cero (no copia su diseño):
     · pantalla natural: lo que escribes se ve como fórmula (fracciones, raíces, potencias) y el resultado
       sale exacto cuando se puede (1/3, √3/2, π/4…); S⇔D lo cambia a decimal.
     · complejos: i (o j), a+bi y r∠θ (entrada y salida), Abs, arg, Re, Im, conj.
     · grados / radianes.
     · ecuación polinómica de grado 2, 3 o 4 (raíces reales y complejas; exactas en grado 2).
     · SOLVE: resuelve f(x) = g(x) (o f(x) = 0) desde un x inicial (Newton + búsqueda de cambio de signo).
     · historial (toca para reutilizar), Ans, memorias A–F, x, y, z y M (M+ / M−), STO / VAR.
   Es un archivo aparte para reutilizarlo después (p. ej. en «Entrenar»). Sin dependencias: si existe
   window.katex se usa para dibujar las fórmulas; si no, se muestran en texto.

   Uso:
     const calc = LGDRCalc.mount(contenedor, {
       storageKey: 'lgdr-calc-v1',          // dónde se guardan historial, memorias y modos (null = no guardar)
       katex: window.katex,                 // opcional
       answer: () => ({input, label})|null  // opcional: campo al que «→ Respuesta» manda el resultado
     });
     calc.focus(); calc.refresh();
   Motor sin interfaz: LGDRCalc.engine.{parse, evaluate, toTeX, polyRoots, solve, format, natural}
   ===================================================================================================== */
(function(G){
'use strict';
if(G.LGDRCalc) return;

/* ------------------------------------------------------------------ números complejos */
const C=(re,im)=>({re:+re||0,im:+im||0});
const ZERO=C(0,0);
const CalcErr=(kind,msg,pos)=>{ const e=new Error(msg||kind); e.calc=kind; if(pos!=null) e.pos=pos; return e; };
const MATH=m=>CalcErr('math',m||'Error matemático');
const SYN=(pos,m)=>CalcErr('syntax',m||'Error de sintaxis',pos);
const fin=z=>{ if(!Number.isFinite(z.re)||!Number.isFinite(z.im)) throw MATH(); return z; };
const cl=(x,ref)=>Math.abs(x)<=2e-15*ref?0:x;          // ruido de cancelación → 0 (como una calculadora de 15 dígitos)
const isR=z=>z.im===0;
function add(a,b){ return C(cl(a.re+b.re,Math.max(Math.abs(a.re),Math.abs(b.re))),cl(a.im+b.im,Math.max(Math.abs(a.im),Math.abs(b.im)))); }
function sub(a,b){ return add(a,C(-b.re,-b.im)); }
function mul(a,b){ if(isR(a)&&isR(b)) return C(a.re*b.re,0);
  const p=a.re*b.re, q=a.im*b.im, r=a.re*b.im, s=a.im*b.re;
  return C(cl(p-q,Math.abs(p)+Math.abs(q)),cl(r+s,Math.abs(r)+Math.abs(s))); }
function div(a,b){ if(b.re===0&&b.im===0) throw MATH('División entre cero');
  if(isR(a)&&isR(b)) return C(a.re/b.re,0);
  let re,im;
  if(Math.abs(b.re)>=Math.abs(b.im)){ const r=b.im/b.re, d=b.re+b.im*r; re=(a.re+a.im*r)/d; im=(a.im-a.re*r)/d; }
  else { const r=b.re/b.im, d=b.re*r+b.im; re=(a.re*r+a.im)/d; im=(a.im*r-a.re)/d; }
  const m=Math.hypot(re,im)*1e-15; return C(Math.abs(re)<m?0:re,Math.abs(im)<m?0:im); }
const abs=z=>z.im===0?Math.abs(z.re):Math.hypot(z.re,z.im);
const argR=z=>Math.atan2(z.im,z.re);
function cexp(z){ const m=Math.exp(z.re); if(z.im===0) return C(m,0); return C(m*Math.cos(z.im),m*Math.sin(z.im)); }
function clog(z){ if(z.re===0&&z.im===0) throw MATH(); if(z.im===0&&z.re>0) return C(Math.log(z.re),0); return C(Math.log(abs(z)),argR(z)); }
function csqrt(z){ if(z.im===0){ return z.re>=0?C(Math.sqrt(z.re),0):C(0,Math.sqrt(-z.re)); }
  const r=abs(z); let re=Math.sqrt((r+z.re)/2), im=Math.sqrt(Math.max(0,(r-z.re)/2)); if(z.im<0) im=-im; return C(re,im); }
function ipow(a,n){ let r=C(1,0), b=a, k=Math.abs(n); while(k>0){ if(k&1) r=mul(r,b); b=mul(b,b); k=Math.floor(k/2); } return n<0?div(C(1,0),r):r; }
function cpow(a,b){
  if(a.re===0&&a.im===0){ if(b.im===0&&b.re>0) return C(0,0); throw MATH(); }
  if(b.im===0){ const n=b.re;
    if(a.im===0&&(a.re>0||Number.isInteger(n))) return C(Math.pow(a.re,n),0);
    if(Number.isInteger(n)&&Math.abs(n)<=1024) return ipow(a,n); }
  return cexp(mul(b,clog(a))); }
function nthRoot(z,n){ if(!(n.im===0)||n.re===0) throw MATH();
  const k=n.re; if(z.im===0&&z.re<0&&Number.isInteger(k)&&Math.abs(k)%2===1) return C(-Math.pow(-z.re,1/k),0);
  return cpow(z,C(1/k,0)); }

/* trigonometría con la unidad de ángulo */
const D2R=Math.PI/180;
function toRad(z,deg){ return deg?C(z.re*D2R,z.im*D2R):z; }
function fromRad(z,deg){ return deg?C(z.re/D2R,z.im/D2R):z; }
function rsin(x,deg){ if(deg){ const r=((x%360)+360)%360; if(r%180===0) return 0; if(r===90) return 1; if(r===270) return -1; if(r===30||r===150) return .5; if(r===210||r===330) return -.5; }
  const t=deg?x*D2R:x, v=Math.sin(t); return Math.abs(t)>=.5&&Math.abs(v)<1e-15*Math.abs(t)?0:v; }
function rcos(x,deg){ if(deg){ const r=((x%360)+360)%360; if(r===90||r===270) return 0; if(r===0) return 1; if(r===180) return -1; if(r===60||r===300) return .5; if(r===120||r===240) return -.5; }
  const t=deg?x*D2R:x, v=Math.cos(t); return Math.abs(t)>=.5&&Math.abs(v)<1e-15*Math.abs(t)?0:v; }
function csin(z,deg){ if(z.im===0) return C(rsin(z.re,deg),0); const t=toRad(z,deg); return C(Math.sin(t.re)*Math.cosh(t.im),Math.cos(t.re)*Math.sinh(t.im)); }
function ccos(z,deg){ if(z.im===0) return C(rcos(z.re,deg),0); const t=toRad(z,deg); return C(Math.cos(t.re)*Math.cosh(t.im),-Math.sin(t.re)*Math.sinh(t.im)); }
function ctan(z,deg){ const c=ccos(z,deg); if(c.re===0&&c.im===0) throw MATH(); return div(csin(z,deg),c); }
const I=C(0,1), ONE=C(1,0);
function casin(z,deg){ if(z.im===0&&Math.abs(z.re)<=1) return fromRad(C(Math.asin(z.re),0),deg);
  const w=clog(add(mul(I,z),csqrt(sub(ONE,mul(z,z))))); return fromRad(C(w.im,-w.re),deg); }
function cacos(z,deg){ if(z.im===0&&Math.abs(z.re)<=1) return fromRad(C(Math.acos(z.re),0),deg);
  const a=casin(z,false); return fromRad(C(Math.PI/2-a.re,-a.im),deg); }
function catan(z,deg){ if(z.im===0) return fromRad(C(Math.atan(z.re),0),deg);
  if(z.re===0&&Math.abs(z.im)===1) throw MATH();
  const w=clog(div(add(I,z),sub(I,z))); return fromRad(C(-w.im/2,w.re/2),deg); }
function csinh(z){ if(z.im===0) return C(Math.sinh(z.re),0); return C(Math.sinh(z.re)*Math.cos(z.im),Math.cosh(z.re)*Math.sin(z.im)); }
function ccosh(z){ if(z.im===0) return C(Math.cosh(z.re),0); return C(Math.cosh(z.re)*Math.cos(z.im),Math.sinh(z.re)*Math.sin(z.im)); }
function ctanh(z){ return div(csinh(z),ccosh(z)); }
function casinh(z){ if(z.im===0) return C(Math.asinh(z.re),0); return clog(add(z,csqrt(add(mul(z,z),ONE)))); }
function cacosh(z){ if(z.im===0&&z.re>=1) return C(Math.acosh(z.re),0); return clog(add(z,mul(csqrt(add(z,ONE)),csqrt(sub(z,ONE))))); }
function catanh(z){ if(z.im===0&&Math.abs(z.re)<1) return C(Math.atanh(z.re),0); const w=clog(div(add(ONE,z),sub(ONE,z))); return C(w.re/2,w.im/2); }
function polar(r,t,deg){ if(r.im!==0||t.im!==0) throw MATH('r y θ deben ser reales'); return C(r.re*rcos(t.re,deg),r.re*rsin(t.re,deg)); }
function fact(z){ if(z.im!==0||z.re<0||!Number.isInteger(z.re)||z.re>170) throw MATH(); let r=1; for(let k=2;k<=z.re;k++) r*=k; return C(r,0); }

/* ------------------------------------------------------------------ analizador (lexer + parser) */
const FN={'sin⁻¹':'asin','cos⁻¹':'acos','tan⁻¹':'atan','sinh⁻¹':'asinh','cosh⁻¹':'acosh','tanh⁻¹':'atanh',
  asin:'asin',acos:'acos',atan:'atan',asinh:'asinh',acosh:'acosh',atanh:'atanh',arcsin:'asin',arccos:'acos',arctan:'atan',
  sinh:'sinh',cosh:'cosh',tanh:'tanh',sin:'sin',cos:'cos',tan:'tan',sen:'sin',
  ln:'ln',log:'log',sqrt:'sqrt',cbrt:'cbrt',root:'root',Abs:'abs',abs:'abs',Re:'re',Im:'im',arg:'arg',Arg:'arg',conj:'conj',Conjg:'conj',exp:'exp'};
const FNAMES=Object.keys(FN).sort((a,b)=>b.length-a.length);
const VARS='ABCDEFMxyz';
const VALIAS={X:'x',Y:'y',Z:'z'};
const OPS={'+':'+','-':'−','−':'−','–':'−','*':'×','×':'×','·':'×','⋅':'×','/':'÷','÷':'÷','^':'^','∠':'∠','=':'='};
function lex(src){
  const t=[]; let p=0; const n=src.length;
  while(p<n){ const ch=src[p];
    if(/\s/.test(ch)){ p++; continue; }
    if(/[0-9]/.test(ch)||(ch==='.'&&/[0-9]/.test(src[p+1]||''))){
      const m=/^(\d+\.?\d*|\.\d+)/.exec(src.slice(p)); let s=m[0], q=p+s.length, ex=null;
      if(src[q]==='ᴇ'){ const e=/^ᴇ([+\-−]?)(\d+)/.exec(src.slice(q)); if(!e) throw SYN(q+1); ex=(e[1]&&e[1]!=='+'?'-':'')+e[2]; q+=e[0].length; }
      else if(/[eE]/.test(src[q]||'')){ const e=/^[eE]([+\-−]?)(\d+)/.exec(src.slice(q)); if(e){ ex=(e[1]&&e[1]!=='+'?'-':'')+e[2]; q+=e[0].length; } }
      const v=Number(s+(ex!=null?'e'+ex:'')); t.push({t:'num',v,s,ex,p}); p=q; continue; }
    if(src.startsWith('Ans',p)){ t.push({t:'ans',p}); p+=3; continue; }
    if(src.startsWith('pi',p)){ t.push({t:'const',v:'π',p}); p+=2; continue; }
    const f=FNAMES.find(k=>src.startsWith(k,p));
    if(f){ t.push({t:'fn',v:FN[f],s:f,p}); p+=f.length; continue; }
    if(ch==='π'){ t.push({t:'const',v:'π',p}); p++; continue; }
    if(ch==='e'){ t.push({t:'const',v:'e',p}); p++; continue; }
    if(ch==='i'||ch==='j'){ t.push({t:'const',v:'i',s:ch,p}); p++; continue; }
    if(VARS.includes(ch)||VALIAS[ch]){ t.push({t:'var',v:VALIAS[ch]||ch,p}); p++; continue; }
    if(ch==='□'){ t.push({t:'hole',p}); p++; continue; }
    if(OPS[ch]){ t.push({t:'op',v:OPS[ch],p}); p++; continue; }
    if(ch==='⁻'&&src[p+1]==='¹'){ t.push({t:'post',v:'⁻¹',p}); p+=2; continue; }
    if(ch==='²'||ch==='³'||ch==='!'){ t.push({t:'post',v:ch,p}); p++; continue; }
    if(ch==='√'||ch==='∛'){ t.push({t:'pre',v:ch,p}); p++; continue; }
    if(ch==='('||ch===')'){ t.push({t:ch,p}); p++; continue; }
    if(ch===','||ch===';'){ t.push({t:',',p}); p++; continue; }
    throw SYN(p);
  }
  return t;
}
/* Prioridad (de menor a mayor): =  ·  + −  ·  ∠  ·  × ÷  ·  multiplicación implícita (2π, 3(4), 2sin30)  ·  signo  ·  ^  ·  ² ³ ⁻¹ !
   Como en las calculadoras científicas, la multiplicación sin signo va antes que × y ÷: 1÷2π = 1/(2π). */
function parse(src){
  const T=lex(src), N=src.length; let i=0;
  const pk=()=>T[i], nx=()=>T[i++], at=()=>T[i]?T[i].p:N;
  const isOp=(t,o)=>t&&t.t==='op'&&t.v===o;
  const starts=t=>t&&(t.t==='num'||t.t==='const'||t.t==='var'||t.t==='ans'||t.t==='fn'||t.t==='pre'||t.t==='('||t.t==='hole');
  function eq(){ const a=sum(); if(isOp(pk(),'=')){ nx(); const b=sum(); return {k:'eq',a,b}; } return a; }
  function sum(){ let a=ang(); while(pk()&&pk().t==='op'&&(pk().v==='+'||pk().v==='−')){ const o=nx().v; a={k:'bin',op:o,a,b:ang()}; } return a; }
  function ang(){ let a=term(); if(isOp(pk(),'∠')){ nx(); a={k:'bin',op:'∠',a,b:term()}; } return a; }
  function term(){ let a=imp(); while(pk()&&pk().t==='op'&&(pk().v==='×'||pk().v==='÷')){ const o=nx().v; a={k:'bin',op:o,a,b:imp()}; } return a; }
  function imp(){ let a=unary(); while(starts(pk())) a={k:'bin',op:'imp',a,b:power()}; return a; }
  function unary(){ const t=pk(); if(t&&t.t==='op'&&(t.v==='−'||t.v==='+')){ nx(); const a=unary(); return t.v==='−'?{k:'neg',a}:a; } return power(); }
  function power(){ const b=postfix(); if(isOp(pk(),'^')){ nx(); return {k:'bin',op:'^',a:b,b:unary()}; } return b; }
  function postfix(){ let a=primary(); while(pk()&&pk().t==='post') a={k:'post',op:nx().v,a}; return a; }
  function close(){ if(pk()&&pk().t===')'){ nx(); return; } if(i>=T.length) return; throw SYN(at()); }   // ')' final opcional
  function primary(){ const t=pk(); if(!t) throw SYN(N);
    switch(t.t){
      case 'num': nx(); return {k:'num',v:t.v,s:t.s,ex:t.ex};
      case 'const': nx(); return {k:'const',n:t.v,s:t.s};
      case 'var': nx(); return {k:'var',n:t.v};
      case 'ans': nx(); return {k:'ans'};
      case 'hole': nx(); return {k:'hole'};
      case '(': { nx(); const a=sum(); close(); return {k:'par',a}; }
      case 'pre': { nx(); const a=postfix(); return {k:'fn',f:t.v==='√'?'sqrt':'cbrt',args:[a]}; }
      case 'fn': { nx(); let args;
        if(pk()&&pk().t==='('){ nx(); args=[sum()]; while(pk()&&pk().t===','){ nx(); args.push(sum()); } close(); }
        else args=[power()];
        const need=t.v==='root'?[2]:t.v==='log'?[1,2]:[1];
        if(!need.includes(args.length)) throw SYN(t.p,t.v==='root'?'root(n, x): faltan argumentos':'Número de argumentos incorrecto');
        return {k:'fn',f:t.v,args,paren:true}; }
    }
    throw SYN(t.p); }
  if(!T.length) throw SYN(0,'Vacío');
  const r=eq(); if(i<T.length) throw SYN(at()); return r;
}

/* ------------------------------------------------------------------ evaluación */
function evaluate(node,env){ env=env||{}; const deg=env.deg!==false, V=env.vars||{};
  const ev=n=>{ switch(n.k){
    case 'num': return C(n.v,0);
    case 'const': return n.n==='π'?C(Math.PI,0):n.n==='e'?C(Math.E,0):C(0,1);
    case 'var': { const v=V[n.n]; return v?C(v.re,v.im):C(0,0); }
    case 'ans': return env.ans?C(env.ans.re,env.ans.im):C(0,0);
    case 'hole': throw SYN(null);
    case 'neg': { const a=ev(n.a); return C(-a.re,-a.im); }
    case 'par': return ev(n.a);
    case 'eq': throw SYN(null,'Para resolver una ecuación usa SOLVE');
    case 'post': { const a=ev(n.a);
      if(n.op==='²') return mul(a,a); if(n.op==='³') return mul(mul(a,a),a); if(n.op==='⁻¹') return div(ONE,a); return fact(a); }
    case 'bin': { const a=ev(n.a), b=ev(n.b);
      switch(n.op){ case '+': return add(a,b); case '−': return sub(a,b); case '×': case 'imp': return mul(a,b); case '÷': return div(a,b);
        case '^': return cpow(a,b); case '∠': return polar(a,b,deg); } break; }
    case 'fn': { const A=n.args.map(ev), a=A[0];
      switch(n.f){
        case 'sin': return csin(a,deg); case 'cos': return ccos(a,deg); case 'tan': return ctan(a,deg);
        case 'asin': return casin(a,deg); case 'acos': return cacos(a,deg); case 'atan': return catan(a,deg);
        case 'sinh': return csinh(a); case 'cosh': return ccosh(a); case 'tanh': return ctanh(a);
        case 'asinh': return casinh(a); case 'acosh': return cacosh(a); case 'atanh': return catanh(a);
        case 'ln': return clog(a);
        case 'log': if(A.length===2){ const lb=clog(a); if(lb.re===0&&lb.im===0) throw MATH(); return div(clog(A[1]),lb); }
          if(a.im===0&&a.re>0) return C(Math.log10(a.re),0); { const l=clog(a); return C(l.re/Math.LN10,l.im/Math.LN10); }
        case 'sqrt': return csqrt(a); case 'cbrt': return nthRoot(a,C(3,0)); case 'root': return nthRoot(A[1],a);
        case 'abs': return C(abs(a),0); case 're': return C(a.re,0); case 'im': return C(a.im,0);
        case 'arg': if(a.re===0&&a.im===0) throw MATH(); return C(deg?argR(a)/D2R:argR(a),0);
        case 'conj': return C(a.re,-a.im); case 'exp': return cexp(a);
      } } }
    throw SYN(null); };
  return fin(ev(node));
}
function calc(src,env){ return evaluate(parse(src),env); }

/* ------------------------------------------------------------------ fórmula (TeX) de lo escrito */
const FTEX={sin:'\\sin',cos:'\\cos',tan:'\\tan',asin:'\\sin^{-1}',acos:'\\cos^{-1}',atan:'\\tan^{-1}',sinh:'\\sinh',cosh:'\\cosh',tanh:'\\tanh',
  asinh:'\\sinh^{-1}',acosh:'\\cosh^{-1}',atanh:'\\tanh^{-1}',ln:'\\ln',log:'\\log',re:'\\operatorname{Re}',im:'\\operatorname{Im}',arg:'\\arg'};
const numTeX=n=>{ let m=n.s; if(m.startsWith('.')) m='0'+m; return n.ex!=null?(m+'\\times10^{'+n.ex.replace('-','-')+'}'):m; };
const strip=n=>n.k==='par'?n.a:n;
const atom=n=>n.k==='const'||n.k==='var'||n.k==='ans'||n.k==='par'||n.k==='hole'||(n.k==='num'&&n.ex==null)||(n.k==='fn');
function leftLeaf(n){ while(n){ if(n.k==='bin'&&n.op!=='÷') n=n.a; else if(n.k==='post') n=n.a; else return n; } return n; }
function toTeX(n){ const T=toTeX;
  switch(n.k){
    case 'num': return numTeX(n);
    case 'const': return n.n==='π'?'\\pi ':n.n==='e'?'e':(n.s||'i');
    case 'var': return n.n;
    case 'ans': return '\\mathrm{Ans}';
    case 'hole': return '\\square ';
    case 'neg': return '-'+(n.a.k==='neg'?'\\left('+T(n.a)+'\\right)':T(n.a));
    case 'par': return '\\left('+T(n.a)+'\\right)';
    case 'eq': return T(n.a)+'='+T(n.b);
    case 'post': { const b=atom(n.a)?T(n.a):'\\left('+T(n.a)+'\\right)';
      return n.op==='!'?b+'!':b+'^{'+(n.op==='²'?'2':n.op==='³'?'3':'-1')+'}'; }
    case 'bin': { const a=n.a, b=n.b;
      switch(n.op){
        case '+': return T(a)+'+'+T(b);
        case '−': return T(a)+'-'+(b.k==='neg'?'\\left('+T(b)+'\\right)':T(b));
        case '×': return T(a)+'\\times '+T(b);
        case '÷': return '\\frac{'+T(strip(a))+'}{'+T(strip(b))+'}';
        case 'imp': { const l=leftLeaf(b); return T(a)+(l&&l.k==='num'?'\\cdot ':'')+T(b); }
        case '^': return (atom(a)&&a.k!=='fn'?T(a):'\\left('+T(a)+'\\right)')+'^{'+T(strip(b))+'}';
        case '∠': return T(a)+'\\angle '+T(b);
      } break; }
    case 'fn': { const A=n.args;
      switch(n.f){
        case 'sqrt': return '\\sqrt{'+T(strip(A[0]))+'}';
        case 'cbrt': return '\\sqrt[3]{'+T(strip(A[0]))+'}';
        case 'root': return '\\sqrt['+T(strip(A[0]))+']{'+T(strip(A[1]))+'}';
        case 'abs': return '\\left|'+T(strip(A[0]))+'\\right|';
        case 'conj': return '\\overline{'+T(strip(A[0]))+'}';
        case 'exp': return 'e^{'+T(strip(A[0]))+'}';
        case 'log': if(A.length===2) return '\\log_{'+T(strip(A[0]))+'}\\left('+T(strip(A[1]))+'\\right)';
      }
      return (FTEX[n.f]||n.f)+'\\left('+A.map(x=>T(strip(x))).join(',')+'\\right)'; }
  }
  return '';
}

/* ------------------------------------------------------------------ formato de resultados */
function gcd(a,b){ a=Math.abs(a); b=Math.abs(b); while(b){ [a,b]=[b,a%b]; } return a; }
function frac(x,maxDen){ if(!Number.isFinite(x)) return null; const ax=Math.abs(x), tol=1e-12*Math.max(1,ax);
  let h0=0,h1=1,k0=1,k1=0,b=ax;
  for(let it=0;it<40;it++){ const a=Math.floor(b), h=a*h1+h0, k=a*k1+k0; if(k>maxDen||h>1e12) break;
    h0=h1; h1=h; k0=k1; k1=k; if(Math.abs(ax-h/k)<=tol) return [h*(x<0?-1:1),k]; const r=b-a; if(r<1e-13) break; b=1/r; }
  return null; }
/* decimal con 10 cifras significativas; notación científica fuera de 10⁻⁹ … 10¹⁰ */
function dec(x,digits){ digits=digits||10; if(x===0) return {m:'0',e:null,neg:false}; const neg=x<0, ax=Math.abs(x);
  let e=Math.floor(Math.log10(ax)); let m=+(ax/Math.pow(10,e)).toPrecision(digits); if(m>=10){ m/=10; e++; }
  if(ax>=1e10||ax<1e-9){ return {m:String(+m.toPrecision(digits)),e,neg}; }
  const d=Math.min(20,Math.max(0,digits-1-e)); let s=ax.toFixed(d); if(s.includes('.')) s=s.replace(/0+$/,'').replace(/\.$/,'');
  return {m:s,e:null,neg}; }
const decTeX=x=>{ const d=dec(x); return (d.neg?'-':'')+d.m+(d.e!=null?'\\times10^{'+d.e+'}':''); };
const decTxt=x=>{ const d=dec(x); return (d.neg?'−':'')+d.m+(d.e!=null?'×10^'+d.e:''); };
/* forma exacta (natural) de un real: p/q, a√b/c o pπ/q; null si no hay una corta */
function natural(x){
  if(x===0) return null; const ax=Math.abs(x), sg=x<0?'-':'';
  if(ax>=1e10||ax<1e-9) return null;
  if(Math.abs(ax-Math.round(ax))<=1e-12*Math.max(1,ax)) return null;
  let f=frac(ax,10000); if(f) return sg+'\\frac{'+f[0]+'}{'+f[1]+'}';
  f=frac(ax*ax,10000);
  if(f&&f[0]*f[1]<=1e9){ const n=f[0]*f[1], q=f[1]; let s=1;
    for(let k=Math.floor(Math.sqrt(n));k>=2;k--){ if(n%(k*k)===0){ s=k; break; } }
    const r=n/(s*s);
    if(r>1&&r<=1e5){ const g=gcd(s,q), a=s/g, b=q/g;
      if(Math.abs(a*Math.sqrt(r)/b-ax)<=1e-11*ax){ const core=(a===1?'':a)+'\\sqrt{'+r+'}'; return sg+(b===1?core:'\\frac{'+core+'}{'+b+'}'); } } }
  f=frac(ax/Math.PI,12); if(f&&f[0]<=100){ const core=(f[0]===1?'':f[0])+'\\pi '; return sg+(f[1]===1?core:'\\frac{'+core+'}{'+f[1]+'}'); }
  return null; }
function tidy(z){ let re=z.re, im=z.im; const m=Math.max(Math.abs(re),Math.abs(im));
  if(Math.abs(im)<=1e-12*m) im=0; if(Math.abs(re)<=1e-12*m) re=0; return C(re,im); }
/* z → TeX.  o = {nat:bool, polar:bool, deg:bool} */
function format(z,o){ o=o||{}; z=tidy(z);
  const P=x=>(o.nat&&natural(x))||decTeX(x);
  const imT=v=>{ const a=Math.abs(v); return Math.abs(a-1)<1e-15?'i':P(a)+'i'; };
  if(o.polar&&(z.im!==0||z.re<0)){ const r=abs(z), t=argR(z); return P(r)+'\\angle '+P(o.deg!==false?t/D2R:t); }
  if(z.im===0) return P(z.re);
  if(z.re===0) return (z.im<0?'-':'')+imT(z.im);
  return P(z.re)+(z.im<0?'-':'+')+imT(z.im); }
function formatTxt(z,o){ o=o||{}; z=tidy(z);
  if(o.polar&&(z.im!==0||z.re<0)) return decTxt(abs(z))+'∠'+decTxt(o.deg!==false?argR(z)/D2R:argR(z));
  if(z.im===0) return decTxt(z.re); const im=Math.abs(z.im)===1?'i':decTxt(Math.abs(z.im))+'i';
  if(z.re===0) return (z.im<0?'−':'')+im; return decTxt(z.re)+(z.im<0?' − ':' + ')+im; }
/* texto para volver a escribirlo en una expresión (12 cifras) */
const n12=x=>{ let s=String(+x.toPrecision(12)); return s.replace('-','−'); };
function plain(z,wrap){ z=tidy(z); let s;
  if(z.im===0) s=n12(z.re); else if(z.re===0) s=(z.im<0?'−':'')+(Math.abs(z.im)===1?'':n12(Math.abs(z.im)))+'i';
  else s=n12(z.re)+(z.im<0?'−':'+')+(Math.abs(z.im)===1?'':n12(Math.abs(z.im)))+'i';
  return wrap&&(z.im!==0||z.re<0||/e/.test(s))?'('+s+')':s; }

/* ------------------------------------------------------------------ raíces de polinomios (grado 1…4, coeficientes complejos) */
function peval(c,z){ let r=C(0,0); for(const a of c) r=add(mul(r,z),a); return r; }
function polyRoots(coef){
  let c=coef.map(z=>C(z.re,z.im)); while(c.length&&c[0].re===0&&c[0].im===0) c.shift();
  const n=c.length-1; if(n<1) throw MATH('El coeficiente principal no puede ser 0');
  const a0=c[0]; c=c.map(z=>div(z,a0));
  if(n===1) return [C(-c[1].re,-c[1].im)];
  if(n===2){ const b=c[1], cc=c[2], d=csqrt(sub(mul(b,b),mul(C(4,0),cc)));
    const s1=add(b,d), s2=sub(b,d), s=abs(s1)>=abs(s2)?s1:s2;
    if(abs(s)===0) return [C(0,0),C(0,0)];
    const q=C(-s.re/2,-s.im/2); const r1=q, r2=div(cc,q);
    /* orden: x1 = (−b + √D)/2a, x2 = (−b − √D)/2a */
    const p=C(-b.re/2,-b.im/2), h=C(d.re/2,d.im/2), x1=add(p,h);
    return abs(sub(x1,r1))<=abs(sub(x1,r2))?[r1,r2]:[r2,r1]; }
  /* Durand–Kerner y luego Newton sobre el polinomio original */
  let R=1; for(let k=1;k<=n;k++) R=Math.max(R,Math.pow(abs(c[k]),1/k)*2);
  let z=[]; for(let k=0;k<n;k++){ const t=2*Math.PI*k/n+0.4; z.push(C(R*Math.cos(t),R*Math.sin(t))); }
  for(let it=0;it<3000;it++){ let mx=0; const nz=[];   /* versión paralela (Weierstrass): conserva la suma de las raíces */
    for(let k=0;k<n;k++){ let den=C(1,0); for(let j=0;j<n;j++) if(j!==k) den=mul(den,sub(z[k],z[j]));
      if(den.re===0&&den.im===0) den=C(1e-12,0);
      const dz=div(peval(c,z[k]),den); nz.push(sub(z[k],dz)); mx=Math.max(mx,abs(dz)/(1+abs(z[k]))); }
    z=nz; if(mx<1e-15) break; }
  /* raíces múltiples: el promedio del grupo es mucho más exacto que cada una (Durand–Kerner conserva la suma) */
  const used=new Array(n).fill(false), grp=[];
  for(let k=0;k<n;k++){ if(used[k]) continue; const g=[k]; used[k]=true;
    for(let j=k+1;j<n;j++) if(!used[j]&&abs(sub(z[k],z[j]))<3e-3*(1+abs(z[k]))){ g.push(j); used[j]=true; }
    let m=C(0,0); g.forEach(j=>m=add(m,z[j])); grp.push({m:C(m.re/g.length,m.im/g.length),n:g.length,src:g.map(j=>z[j])}); }
  /* las raíces simples se pulen con Newton sobre el polinomio original */
  /* una raíz de multiplicidad m es raíz simple de la derivada (m−1): ahí se pule con Newton */
  const der=q=>q.slice(0,-1).map((a,k)=>mul(a,C(q.length-1-k,0)));
  const newton=(p,r)=>{ const dp=der(p); for(let k=0;k<8;k++){ const d=peval(dp,r); if(abs(d)<1e-300) break; const nr=sub(r,div(peval(p,r),d)); if(!(Number.isFinite(nr.re)&&Number.isFinite(nr.im))) break; if(abs(peval(p,nr))>abs(peval(p,r))) break; r=nr; } return r; };
  const scale=r=>{ let s=0; c.forEach((a,k)=>{ s+=abs(a)*Math.pow(Math.max(1,abs(r)),n-k); }); return s; };
  const out=[]; grp.forEach(({m,n:cnt,src})=>{ if(cnt===1){ out.push(newton(c,m)); return; }
    let p=c; for(let k=1;k<cnt;k++) p=der(p); const r=newton(p,m);
    if(abs(peval(c,r))<=1e-9*scale(r)) for(let k=0;k<cnt;k++) out.push(r);   /* de verdad es una raíz múltiple */
    else src.forEach(q=>out.push(newton(c,q))); });
  const realCoef=coef.every(q=>q.im===0);
  return out.map(r=>{ if(realCoef&&Math.abs(r.im)<1e-7*Math.max(1,abs(r))) r=C(r.re,0); return tidy(r); })
    .sort((a,b)=>{ if((a.im!==0)!==(b.im!==0)) return a.im!==0?1:-1; const dr=a.re-b.re;
      if(a.im===0) return b.re-a.re; if(Math.abs(dr)>1e-9*(1+Math.abs(a.re))) return dr; return b.im-a.im; }); }
/* forma exacta de las raíces de una cuadrática con coeficientes racionales: (−b ± s√f)/(2a) */
function quadExact(coef){
  if(coef.some(z=>z.im!==0)) return null; const fr=coef.map(z=>frac(z.re,1000)||(Number.isInteger(z.re)?[z.re,1]:null)); if(fr.some(f=>!f)) return null;
  let L=1; fr.forEach(f=>{ L=L/gcd(L,f[1])*f[1]; }); if(L>1e6) return null;
  const [a,b,c]=fr.map(f=>Math.round(f[0]*L/f[1])); if(!a) return null;
  const D=b*b-4*a*c; if(Math.abs(D)>1e12) return null;
  const AD=Math.abs(D), sq=Math.round(Math.sqrt(AD)); if(sq*sq===AD) return null;   // racionales: ya salen con natural()
  let s=1; for(let k=Math.floor(Math.sqrt(AD));k>=2;k--){ if(AD%(k*k)===0){ s=k; break; } } const f=AD/(s*s);
  let p=-b, q=s, den=2*a; if(den<0){ p=-p; den=-den; } const g=gcd(gcd(p,q),den); p/=g; q/=g; den/=g;
  const rad=(q===1?'':q)+'\\sqrt{'+f+'}'+(D<0?'i':'');
  const one=sgn=>{ const sg=den<0?-sgn:sgn; if(p===0) return (sg<0?'-':'')+(den===1?rad:'\\frac{'+rad+'}{'+den+'}');
    const num=p+(sg<0?'-':'+')+rad; return den===1?num:'\\frac{'+num+'}{'+den+'}'; };
  return [one(1),one(-1)]; }

/* ------------------------------------------------------------------ SOLVE: f(x) = g(x) */
function solve(src,env,x0){
  const ast=parse(src), L=ast.k==='eq'?ast.a:ast, R=ast.k==='eq'?ast.b:null;
  const base=Object.assign({},env), V=Object.assign({},env.vars||{});
  const f=x=>{ V.x=C(x,0); const e=Object.assign({},base,{vars:V}); try{ const l=evaluate(L,e), r=R?evaluate(R,e):ZERO, d=sub(l,r);
      if(Math.abs(d.im)>1e-9*Math.max(1,Math.abs(d.re))) return NaN; return d.re; }catch(err){ if(err.calc==='syntax') throw err; return NaN; } };
  x0=Number.isFinite(x0)?x0:0;
  const done=x=>({x,lr:f(x)});
  const ok=(x,fx)=>Number.isFinite(fx)&&Math.abs(fx)<=1e-12*Math.max(1,Math.abs(x));
  /* Newton amortiguado */
  let x=x0, fx=f(x);
  if(Number.isFinite(fx)){
    for(let it=0;it<200;it++){ if(fx===0) return done(x);
      const h=1e-6*Math.max(1,Math.abs(x)), d=(f(x+h)-f(x-h))/(2*h); if(!Number.isFinite(d)||d===0) break;
      const st=fx/d; let lam=1, xn=x-st, fn=f(xn);
      while(!(Number.isFinite(fn)&&Math.abs(fn)<Math.abs(fx))&&lam>1e-6){ lam/=2; xn=x-lam*st; fn=f(xn); }
      if(!(Number.isFinite(fn)&&Math.abs(fn)<=Math.abs(fx))) break;
      const moved=Math.abs(xn-x); x=xn; fx=fn;
      if(ok(x,fx)||moved<=1e-14*Math.max(1,Math.abs(x))) break; }
    if(ok(x,fx)||(Number.isFinite(fx)&&Math.abs(fx)<1e-9)) return polish(x); }
  /* buscar un cambio de signo alrededor de x0 y bisección */
  let prev=null;
  for(let k=0;k<60;k++){ const span=0.05*(1+Math.abs(x0))*Math.pow(1.35,k);
    for(const s of [1,-1]){ const a=x0+s*span*(k?1/1.35:0), b=x0+s*span, fa=f(a), fb=f(b);
      if(Number.isFinite(fa)&&Number.isFinite(fb)&&fa*fb<=0) return polish(bisect(a,b,fa,fb)); } }
  throw CalcErr('solve','No se encontró solución: prueba con otro x inicial');
  function bisect(a,b,fa,fb){ for(let it=0;it<200;it++){ const m=(a+b)/2, fm=f(m); if(!Number.isFinite(fm)) break; if(fm===0) return m; if(fa*fm<0){ b=m; fb=fm; } else { a=m; fa=fm; } if(Math.abs(b-a)<=1e-15*Math.max(1,Math.abs(m))) break; } return (a+b)/2; }
  function polish(x){ let fx=f(x); for(let it=0;it<8;it++){ const h=1e-7*Math.max(1,Math.abs(x)), d=(f(x+h)-f(x-h))/(2*h); if(!Number.isFinite(d)||d===0) break; const xn=x-fx/d, fn=f(xn); if(!(Math.abs(fn)<Math.abs(fx))) break; x=xn; fx=fn; }
    if(!Number.isFinite(fx)||Math.abs(fx)>1e-6*Math.max(1,Math.abs(x))) throw CalcErr('solve','No se encontró solución: prueba con otro x inicial');
    return {x,lr:fx}; }
}

const engine={parse,evaluate,calc,toTeX,format,formatTxt,plain,natural,polyRoots,quadExact,solve,lex,C};

/* ===================================================================================================== interfaz */
const CSS=`
.lc{--lc-bg:var(--bg,#f6f7f9);--lc-sf:var(--surface,#fff);--lc-ink:var(--ink,#111);--lc-mu:var(--muted,#5b6472);--lc-ln:var(--line,#d9dde3);--lc-ac:var(--accent,#1d4ed8);--lc-as:var(--accent-soft,#e3eaff);--lc-bad:var(--bad,#b42318);--lc-ok:var(--ok,#157f3c);--lc-sh:var(--warn,#a15c07);
  display:flex;flex-direction:column;height:100%;min-height:0;background:var(--lc-sf);color:var(--lc-ink);font:15px var(--f-body,system-ui,sans-serif);-webkit-tap-highlight-color:transparent}
.lc *{box-sizing:border-box}
.lc-top{display:flex;align-items:center;gap:6px;padding:10px 10px 8px;flex-wrap:wrap}
.lc-tabs{display:flex;gap:2px;padding:2px;border:1px solid var(--lc-ln);border-radius:999px;background:var(--lc-bg)}
.lc-tabs button{border:0;background:transparent;color:var(--lc-mu);font:600 12.5px var(--f-body,system-ui);padding:5px 10px;border-radius:999px;cursor:pointer;min-height:28px}
.lc-tabs button[aria-selected=true]{background:var(--lc-ac);color:var(--lc-sf)}
.lc-mode{margin-left:auto;display:flex;gap:4px}
.lc-chip{border:1px solid var(--lc-ln);background:var(--lc-sf);color:var(--lc-ink);font:600 11.5px var(--f-mono,ui-monospace,monospace);padding:4px 8px;border-radius:7px;cursor:pointer;min-height:28px}
.lc-chip:hover,.lc-tabs button:hover{border-color:var(--lc-ac)}
.lc-x{display:grid;place-items:center;width:30px;height:30px;border:1px solid var(--lc-ln);border-radius:999px;background:var(--lc-bg);color:var(--lc-ink);cursor:pointer;margin-left:2px}
.lc-x:hover{border-color:var(--lc-bad);color:var(--lc-bad)}
.lc button:focus-visible,.lc input:focus-visible{outline:2px solid var(--lc-ac);outline-offset:1px}
.lc-disp{flex:1 1 auto;min-height:96px;overflow:auto;overscroll-behavior:contain;margin:0 10px;border:1px solid var(--lc-ln);border-radius:12px;background:var(--lc-bg);padding:8px 10px;display:flex;flex-direction:column;gap:6px;scrollbar-width:thin}
.lc-pane{display:flex;flex-direction:column;gap:6px}
.lc-pane[hidden]{display:none!important}
.lc-log{display:flex;flex-direction:column;gap:2px;margin-top:auto}
.lc-h{all:unset;box-sizing:border-box;display:grid;gap:1px;padding:4px 6px;border-radius:8px;cursor:pointer;border-bottom:1px dashed var(--lc-ln)}
.lc-h:hover{background:var(--lc-as)}
.lc-h .lc-he{font-size:13px;color:var(--lc-mu);overflow-x:auto;overflow-y:hidden;white-space:nowrap;scrollbar-width:none}
.lc-h .lc-hr{text-align:right;font-size:14px;overflow-x:auto;overflow-y:hidden;white-space:nowrap;scrollbar-width:none}
.lc-logt{display:flex;justify-content:space-between;align-items:center;font-size:11.5px;color:var(--lc-mu)}
.lc-logt button{all:unset;cursor:pointer;color:var(--lc-ac);font-size:11.5px;padding:2px 4px}
.lc-cur{display:flex;flex-direction:column;gap:4px}
.lc-nat{min-height:30px;font-size:17px;overflow-x:auto;overflow-y:hidden;white-space:nowrap;padding:2px 0;scrollbar-width:thin}
.lc-nat.ph{color:var(--lc-mu);font-size:13px}
.lc-in{width:100%;border:1px solid var(--lc-ln);border-radius:8px;background:var(--lc-sf);color:var(--lc-ink);font:500 15px var(--f-mono,ui-monospace,monospace);padding:7px 9px;caret-color:var(--lc-ac)}
.lc-in:focus{border-color:var(--lc-ac);outline:none;box-shadow:0 0 0 2px var(--lc-as)}
.lc-res{display:flex;align-items:center;justify-content:flex-end;gap:8px;min-height:38px}
.lc-rv{font-size:22px;overflow-x:auto;overflow-y:hidden;white-space:nowrap;max-width:100%;scrollbar-width:thin;text-align:right}
.lc-rv.pv{font-size:15px;color:var(--lc-mu)}
.lc-rv.err{font:600 14px var(--f-body,system-ui);color:var(--lc-bad)}
.lc-acts{display:flex;gap:6px;justify-content:flex-end;flex-wrap:wrap}
.lc-acts[hidden]{display:none}
.lc-a{border:1px solid var(--lc-ln);background:var(--lc-sf);color:var(--lc-ink);font:600 12.5px var(--f-body,system-ui);padding:5px 10px;border-radius:999px;cursor:pointer;min-height:30px}
.lc-a.pri{border-color:var(--lc-ac);color:var(--lc-ac)}
.lc-a:hover{background:var(--lc-as)}
.lc-ind{display:flex;gap:8px;font:600 10.5px var(--f-mono,ui-monospace,monospace);color:var(--lc-mu)}
.lc-ind b{color:var(--lc-sh)}
.lc-msg{font-size:12.5px;color:var(--lc-ok);min-height:0}
.lc-msg:empty{display:none}
.lc-msg.bad{color:var(--lc-bad)}
.lc-row{display:flex;gap:6px;align-items:center;flex-wrap:wrap}
.lc-lbl{font-size:12.5px;color:var(--lc-mu)}
.lc-seg{display:inline-flex;gap:2px;padding:2px;border:1px solid var(--lc-ln);border-radius:999px;background:var(--lc-sf)}
.lc-seg button{border:0;background:transparent;color:var(--lc-mu);font:600 12.5px var(--f-body,system-ui);padding:4px 11px;border-radius:999px;cursor:pointer;min-height:28px}
.lc-seg button[aria-pressed=true]{background:var(--lc-ac);color:var(--lc-sf)}
.lc-form{font-size:16px;overflow-x:auto;overflow-y:hidden;white-space:nowrap;padding:2px 0}
.lc-co{display:grid;grid-template-columns:repeat(auto-fill,minmax(118px,1fr));gap:6px}
.lc-co label{display:flex;align-items:center;gap:6px;font:italic 600 15px Georgia,"Times New Roman",serif}
.lc-co .lc-in{padding:6px 8px;font-size:14px}
.lc-sol{display:grid;gap:4px}
.lc-sol .lc-sr{display:flex;align-items:center;gap:8px;padding:4px 6px;border-radius:8px;background:var(--lc-sf);border:1px solid var(--lc-ln)}
.lc-sol .lc-sr .lc-sx{flex:none;font-size:14px}
.lc-sol .lc-sr .lc-sv{flex:1;min-width:0;text-align:right;overflow-x:auto;overflow-y:hidden;white-space:nowrap;font-size:16px;scrollbar-width:none}
.lc-sol .lc-sr button{flex:none}
.lc-note{font-size:12px;color:var(--lc-mu)}
.lc-keys{flex:none;display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:5px;padding:8px 10px 10px}
.lc-k{position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;height:var(--lc-kh,40px);border:1px solid var(--lc-ln);border-radius:10px;background:var(--lc-bg);color:var(--lc-ink);font:600 15px var(--f-body,system-ui);cursor:pointer;padding:0 2px;line-height:1;touch-action:manipulation;user-select:none;-webkit-user-select:none}
.lc-k small{position:absolute;top:2px;left:0;right:0;text-align:center;font:600 9.5px var(--f-body,system-ui);color:var(--lc-sh);white-space:nowrap;overflow:hidden;pointer-events:none}
.lc-k .lc-kl{margin-top:7px;white-space:nowrap}
.lc-k:hover{border-color:var(--lc-ac)}
.lc-k:active{transform:scale(.95)}
.lc-k.n{background:var(--lc-sf);font-size:17px}
.lc-k.o{background:var(--lc-as);color:var(--lc-ac);font-size:17px}
.lc-k.eq{background:var(--lc-ac);color:var(--lc-sf);border-color:var(--lc-ac);font-size:19px}
.lc-k.eq small{color:inherit;opacity:.8}
.lc-k.del{color:var(--lc-bad)}
.lc-k.sh{color:var(--lc-sh);font-size:12px}
.lc.shift .lc-k.sh{background:var(--lc-sh);color:var(--lc-sf);border-color:var(--lc-sh)}
.lc.shift .lc-k small{font-size:10.5px;text-decoration:underline}
.lc.shift .lc-k.hs .lc-kl{opacity:.35}
.lc-k.f{font-size:13.5px}
.lc-k i{font-family:Georgia,"Times New Roman",serif;font-weight:400;font-size:1.12em}
.lc-k sup{font-size:.7em;line-height:0}
.lc-mem{flex:none;display:none;padding:8px 10px 10px;gap:6px;flex-direction:column}
.lc.memo .lc-mem{display:flex}
.lc.memo .lc-keys{display:none}
.lc-mem .lc-mt{display:flex;justify-content:space-between;align-items:center;font:600 13px var(--f-body,system-ui)}
.lc-mg{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:5px}
.lc-mg button{display:flex;flex-direction:column;align-items:center;gap:1px;height:calc(var(--lc-kh,40px) + 6px);border:1px solid var(--lc-ln);border-radius:10px;background:var(--lc-bg);color:var(--lc-ink);cursor:pointer;padding:3px 2px;min-width:0}
.lc-mg button b{font:italic 600 16px Georgia,"Times New Roman",serif}
.lc-mg button span{font:500 10px var(--f-mono,ui-monospace,monospace);color:var(--lc-mu);max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.lc-mg button:hover{border-color:var(--lc-ac)}
.lc .katex{font-size:1.05em}
@media (pointer:coarse){.lc-in,.lc-co .lc-in{font-size:16px}}
@media (prefers-reduced-motion:reduce){.lc-k:active{transform:none}}
`;
function injectCSS(){ if(document.getElementById('lgdr-calc-css')) return; const s=document.createElement('style'); s.id='lgdr-calc-css'; s.textContent=CSS; document.head.appendChild(s); }

/* teclas: [etiqueta, acción o texto, etiqueta con SHIFT, acción con SHIFT, clase] */
const K=[
  ['SHIFT','@shift','','','sh'],
  ['VAR','@var','STO','@sto','f'],
  ['<i>i</i>','i','arg','arg(','f'],
  ['∠','∠','conj','conj(','f'],
  ['M+','@m+','M−','@m-','f'],
  ['S⇔D','@sd','Re','Re(','f'],
  ['<i>x</i><sup>−1</sup>','⁻¹','x!','!','f'],
  ['√▫','√(','∛','∛(','f'],
  ['<i>x</i><sup>2</sup>','²','x³','³','f'],
  ['<i>x</i><sup>▫</sup>','^(','ⁿ√','root(','f'],
  ['log','log(','10ˣ','10^(','f'],
  ['ln','ln(','eˣ','e^(','f'],
  ['|<i>x</i>|','Abs(','Im','Im(','f'],
  ['sin','sin(','sin⁻¹','sin⁻¹(','f'],
  ['cos','cos(','cos⁻¹','cos⁻¹(','f'],
  ['tan','tan(','tan⁻¹','tan⁻¹(','f'],
  ['(','(',',',',','f'],
  [')',')','=','=','f'],
  ['7','7','','','n'],['8','8','','','n'],['9','9','','','n'],['DEL','@del','','','del f'],['AC','@ac','','','del f'],['π','π','e','e','f'],
  ['4','4','','','n'],['5','5','','','n'],['6','6','','','n'],['×','×','','','o'],['÷','÷','','','o'],['<i>x</i>','x','y','y','f'],
  ['1','1','','','n'],['2','2','','','n'],['3','3','','','n'],['+','+','','','o'],['−','−','','','o'],['Ans','Ans','z','z','f'],
  ['0','0','','','n'],['.','.','','','n'],['×10<sup>x</sup>','ᴇ','','','f'],['◀','@left','','','f'],['▶','@right','','','f'],['=','@eq','','','eq']];
const KLBL={'@del':'Borrar','@ac':'Borrar todo','@eq':'Igual','@shift':'Shift','@var':'Variables','@sto':'Guardar en memoria','@m+':'Sumar a la memoria M','@m-':'Restar de la memoria M','@sd':'Exacto o decimal','@left':'Mover el cursor a la izquierda','@right':'Mover el cursor a la derecha','ᴇ':'Por diez a la','⁻¹':'Recíproco','²':'Al cuadrado','³':'Al cubo','^(':'Potencia','√(':'Raíz cuadrada','∛(':'Raíz cúbica','root(':'Raíz n‑ésima: root(n, x)','Abs(':'Valor absoluto','∠':'Ángulo (forma polar)','i':'Unidad imaginaria','−':'Menos','×':'Por','÷':'Entre'};
const MEMS=['A','B','C','D','E','F','x','y','z','M'];
const TOKS=Object.keys(FN).map(k=>k+'(').concat(['Ans','⁻¹','^(']).sort((a,b)=>b.length-a.length);
const OPSTART=/^(?:[+−×÷^²³!∠]|⁻¹)/;

function mount(host,opts){ opts=opts||{}; injectCSS();
  const KX=opts.katex||G.katex, SK=opts.storageKey===undefined?'lgdr-calc-v1':opts.storageKey;
  const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const tex=t=>{ if(KX) try{ return KX.renderToString('\\displaystyle '+t,{throwOnError:false,displayMode:false,strict:'ignore',output:'html'}); }catch(e){} return esc(t); };
  /* estado guardado */
  let S={v:1,deg:true,polar:false,ans:[0,0],mem:{},hist:[],eqn:{n:2,c:['1','0','−1','0','0']},sol:{e:'',x0:'0'}};
  const load=()=>{ if(!SK) return; try{ const v=JSON.parse(localStorage.getItem(SK)||'null'); if(v&&v.v===1) S=Object.assign(S,v); }catch(e){} };
  const save=()=>{ if(!SK) return; try{ localStorage.setItem(SK,JSON.stringify(S)); }catch(e){} };
  load(); if(!Array.isArray(S.hist)) S.hist=[]; if(!S.mem||typeof S.mem!=='object') S.mem={};
  const z2a=z=>[z.re,z.im], a2z=a=>Array.isArray(a)?C(a[0],a[1]):C(0,0);
  const env=()=>{ const vars={}; MEMS.forEach(k=>{ if(S.mem[k]) vars[k]=a2z(S.mem[k]); }); return {deg:S.deg,vars,ans:a2z(S.ans)}; };
  const fmt=(z,nat)=>tex(format(z,{nat:nat!==false&&!dec,polar:S.polar,deg:S.deg}));

  const root=document.createElement('div'); root.className='lc';
  root.innerHTML=`<div class="lc-top"><div class="lc-tabs" role="tablist" aria-label="Modo de la calculadora">
      <button type="button" role="tab" data-tab="calc" aria-selected="true">Calcular</button><button type="button" role="tab" data-tab="eqn" aria-selected="false" title="Ecuación polinómica de grado 2 a 4">Ecuación</button><button type="button" role="tab" data-tab="solve" aria-selected="false" title="Resolver f(x) = g(x)">SOLVE</button></div>
    <div class="lc-mode"><button type="button" class="lc-chip" data-ang title="Unidad de ángulo"></button><button type="button" class="lc-chip" data-cpx title="Forma de los complejos"></button>${opts.onClose?'<button type="button" class="lc-x" data-close aria-label="Cerrar la calculadora" title="Cerrar (Esc)"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button>':''}</div></div>
  <div class="lc-disp" data-disp>
    <div class="lc-pane" data-p="calc">
      <div class="lc-log" data-log></div>
      <div class="lc-cur"><div class="lc-ind" data-ind></div><div class="lc-nat" data-nat></div>
        <input class="lc-in lc-f" data-main inputmode="none" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Operación">
        <div class="lc-res"><span class="lc-rv" data-rv aria-live="polite"></span></div>
        <div class="lc-acts" data-acts hidden><button type="button" class="lc-a" data-copy>Copiar</button><button type="button" class="lc-a pri" data-ansput hidden>→ Respuesta</button></div>
        <div class="lc-msg" data-msg></div></div>
    </div>
    <div class="lc-pane" data-p="eqn" hidden>
      <div class="lc-row"><span class="lc-lbl">Grado</span><span class="lc-seg" data-deg><button type="button" data-n="2">2</button><button type="button" data-n="3">3</button><button type="button" data-n="4">4</button></span></div>
      <div class="lc-form" data-eform></div>
      <div class="lc-co" data-co></div>
      <div class="lc-row"><button type="button" class="lc-a pri" data-esolve>Resolver</button><span class="lc-note">Los coeficientes aceptan operaciones (1/3, 2π, Ans, A…).</span></div>
      <div class="lc-sol" data-esol></div><div class="lc-msg" data-emsg></div>
    </div>
    <div class="lc-pane" data-p="solve" hidden>
      <span class="lc-lbl">Ecuación con <i>x</i> (sin «=» se resuelve … = 0)</span>
      <div class="lc-nat" data-snat></div>
      <input class="lc-in lc-f" data-seq inputmode="none" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Ecuación con x">
      <div class="lc-row"><span class="lc-lbl">x inicial</span><input class="lc-in lc-f" data-sx0 inputmode="none" autocomplete="off" spellcheck="false" style="width:110px" aria-label="x inicial"><button type="button" class="lc-a pri" data-ssolve>Resolver</button></div>
      <div class="lc-sol" data-ssol></div><div class="lc-msg" data-smsg></div>
    </div>
  </div>
  <div class="lc-mem" data-memp><div class="lc-mt"><span data-memt></span><span><button type="button" class="lc-a" data-memclr>Borrar memorias</button> <button type="button" class="lc-a" data-memx>Cancelar</button></span></div><div class="lc-mg" data-mg></div></div>
  <div class="lc-keys" data-keys role="group" aria-label="Teclado"></div>`;
  host.appendChild(root);
  if(opts.onClose) root.querySelector('[data-close]').addEventListener('click',()=>opts.onClose());
  const $=s=>root.querySelector(s);
  const main=$('[data-main]'), nat=$('[data-nat]'), rv=$('[data-rv]'), logEl=$('[data-log]'), disp=$('[data-disp]'), msg=$('[data-msg]'), acts=$('[data-acts]'), ansBtn=$('[data-ansput]'), ind=$('[data-ind]');
  let tab='calc', shift=false, fresh=false, dec=false, last=null, active=main, memMode=null, msgT=0;

  /* teclado */
  const keys=$('[data-keys]');
  K.forEach(([l,a,sl,sa,cls])=>{ const b=document.createElement('button'); b.type='button'; b.className='lc-k '+(cls||'')+(sl?' hs':''); b.dataset.a=a; if(sa) b.dataset.s=sa;
    b.innerHTML=(sl?`<small>${sl}</small>`:'')+`<span class="lc-kl">${l}</span>`; const nm=KLBL[a]||l.replace(/<[^>]+>/g,''); b.setAttribute('aria-label',nm+(sl?` (Shift: ${sl})`:'')); b.title=nm+(sl?` · Shift: ${sl}`:''); keys.appendChild(b); });
  root.addEventListener('pointerdown',e=>{ if(e.target.closest('button')) e.preventDefault(); });   // los botones no le quitan el foco (ni el cursor) al campo
  keys.addEventListener('click',e=>{ const b=e.target.closest('.lc-k'); if(!b) return; const a=shift&&b.dataset.s?b.dataset.s:b.dataset.a; if(a!=='@shift') setShift(false); press(a); });
  function setShift(v){ shift=v; root.classList.toggle('shift',v); }
  function press(a){
    switch(a){
      case '@shift': return setShift(!shift);
      case '@del': return del();
      case '@ac': return ac();
      case '@eq': return equals();
      case '@sd': dec=!dec; renderRes(); renderLog(); renderEqn(true); renderSolve(true); return;
      case '@var': return openMem('var');
      case '@sto': return openMem('sto');
      case '@m+': case '@m-': return memAdd(a==='@m+'?1:-1);
      case '@left': case '@right': { const f=active||main; if(f===main) fresh=false; const p=Math.max(0,Math.min(f.value.length,(f.selectionStart??f.value.length)+(a==='@left'?-1:1))); try{ f.focus({preventScroll:true}); f.setSelectionRange(p,p); }catch(e){} return; }
    }
    insert(a); }
  function fieldInsert(f,txt){ const s=f.selectionStart??f.value.length, e=f.selectionEnd??s; f.value=f.value.slice(0,s)+txt+f.value.slice(e); const p=s+txt.length; try{ f.setSelectionRange(p,p); }catch(err){} }
  function insert(txt){ const f=active||main;
    if(f===main&&fresh){ fresh=false; main.value=OPSTART.test(txt)?'Ans':''; try{ main.setSelectionRange(main.value.length,main.value.length); }catch(e){} }
    fieldInsert(f,txt); changed(f); keepVisible(f); }
  function keepVisible(f){ try{ if(document.activeElement!==f) f.focus({preventScroll:true}); }catch(e){} }
  function del(){ const f=active||main; if(f===main&&fresh){ fresh=false; }
    let s=f.selectionStart??f.value.length, e=f.selectionEnd??s;
    if(s!==e){ f.value=f.value.slice(0,s)+f.value.slice(e); try{ f.setSelectionRange(s,s); }catch(err){} changed(f); return; }
    if(s===0) return; const before=f.value.slice(0,s); const t=TOKS.find(k=>before.endsWith(k)); const n=t?t.length:1;
    f.value=f.value.slice(0,s-n)+f.value.slice(s); try{ f.setSelectionRange(s-n,s-n); }catch(err){} changed(f); }
  function ac(){ const f=active||main; f.value=''; if(f===main){ fresh=false; last=null; } changed(f); }

  /* campo principal */
  const NORM={'*':'×','/':'÷','-':'−'};
  function normalize(f){ const v=f.value; if(!/[*\/-]/.test(v)) return; const s=f.selectionStart, e=f.selectionEnd; f.value=v.replace(/[*\/-]/g,c=>NORM[c]); try{ f.setSelectionRange(s,e); }catch(err){} }
  root.addEventListener('focusin',e=>{ if(e.target.classList&&e.target.classList.contains('lc-f')) active=e.target; });
  root.addEventListener('input',e=>{ const f=e.target; if(!f.classList||!f.classList.contains('lc-f')) return; normalize(f); if(f===main) fresh=false; changed(f); });
  main.addEventListener('beforeinput',e=>{ if(fresh&&e.inputType==='insertText'&&e.data){ e.preventDefault(); active=main; insert(NORM[e.data]||e.data); } });
  ['click','keydown'].forEach(ev=>main.addEventListener(ev,e=>{ if(ev==='click'||/Arrow|Home|End/.test(e.key)) fresh=false; }));
  root.addEventListener('keydown',e=>{ const f=e.target; if(!f.classList||!f.classList.contains('lc-f')) return;
    if(e.key==='Enter'){ e.preventDefault(); if(f===main) equals(); else if(f.dataset.c!=null){ const n=+f.dataset.c, nx=root.querySelector(`[data-c="${n+1}"]`); if(nx) nx.focus(); else solveEqn(); } else doSolve(); } });
  let rq=0; function changed(f){ if(f===main){ if(!rq) rq=requestAnimationFrame(()=>{ rq=0; renderMain(); }); } else if(f.dataset.c!=null){ S.eqn.c[+f.dataset.c]=f.value; save(); }
    else if(f.hasAttribute('data-seq')){ S.sol.e=f.value; save(); renderSNat(); } else if(f.hasAttribute('data-sx0')){ S.sol.x0=f.value; save(); } }
  function natOf(src){ if(!src.trim()) return null; let ast=null;
    try{ ast=parse(src); }catch(e){ if(e.calc==='syntax'&&(e.pos==null||e.pos>=src.length)){ try{ ast=parse(src+'□'); }catch(e2){} } }
    return ast?tex(toTeX(ast)):null; }
  function renderMain(){ if(logFor!==fresh) renderLog(); const v=main.value, h=natOf(v);
    if(!v.trim()){ nat.className='lc-nat ph'; nat.textContent='Escribe una operación…'; } else { nat.className='lc-nat'; nat.innerHTML=h||esc(v); }
    nat.scrollLeft=nat.scrollWidth;
    if(!fresh){ last=null; acts.hidden=true; rv.className='lc-rv pv'; rv.innerHTML='';
      if(v.trim()){ try{ const ast=parse(v); if(ast.k!=='eq'){ const z=evaluate(ast,env()); rv.innerHTML='= '+tex(format(z,{nat:false,polar:S.polar,deg:S.deg})); } }catch(e){} } } }
  function renderRes(){ if(!last){ renderMain(); return; } rv.className='lc-rv'; rv.innerHTML=fmt(last); rv.scrollLeft=rv.scrollWidth; acts.hidden=false; updAnswer(); }
  function renderInd(){ ind.innerHTML=`<span>${S.deg?'D':'R'}</span><span>${S.polar?'r∠θ':'a+bi'}</span>${shift?'<b>S</b>':''}${S.mem.M&&(S.mem.M[0]||S.mem.M[1])?'<span>M</span>':''}`;
    $('[data-ang]').textContent=S.deg?'DEG':'RAD'; $('[data-ang]').setAttribute('aria-label',S.deg?'Ángulos en grados (cambiar a radianes)':'Ángulos en radianes (cambiar a grados)');
    $('[data-cpx]').textContent=S.polar?'r∠θ':'a+bi'; $('[data-cpx]').setAttribute('aria-label',S.polar?'Complejos en forma polar (cambiar a a+bi)':'Complejos en forma a+bi (cambiar a polar)'); }
  function say(t,bad,el){ el=el||msg; el.textContent=t; el.classList.toggle('bad',!!bad); clearTimeout(msgT); msgT=setTimeout(()=>{ el.textContent=''; },bad?5000:2200); }
  function errText(e){ return e.calc==='syntax'?(e.message&&e.message!=='syntax'&&e.message!=='Error de sintaxis'?'Error de sintaxis: '+e.message:'Error de sintaxis'):e.calc==='math'?e.message:e.calc==='solve'?e.message:'Error'; }
  function equals(){ if(tab==='eqn') return solveEqn(); if(tab==='solve') return doSolve();
    if(rq){ cancelAnimationFrame(rq); rq=0; renderMain(); }   /* que el dibujo pendiente no tape el resultado */
    const v=main.value; if(!v.trim()) return;
    try{ const z=evaluate(parse(v),env()); last=z; S.ans=z2a(z); S.hist.push({e:v,r:z2a(z)}); if(S.hist.length>40) S.hist.splice(0,S.hist.length-40); save();
      fresh=true; dec=false; renderRes(); renderLog(); renderInd(); disp.scrollTop=disp.scrollHeight; return z; }
    catch(e){ if(!e.calc) throw e; last=null; fresh=false; rv.className='lc-rv err'; rv.textContent=errText(e); acts.hidden=true;
      if(e.pos!=null){ try{ main.focus({preventScroll:true}); main.setSelectionRange(e.pos,Math.min(v.length,e.pos+1)); }catch(err){} } return null; } }
  function current(){ if(!fresh&&main.value.trim()) return equals(); return last||a2z(S.ans); }
  let logFor=null;
  function renderLog(){ logFor=fresh; const H=S.hist.slice(-25,fresh&&last&&S.hist.length?-1:undefined);   /* el último ya está abajo, como resultado actual */ logEl.innerHTML=H.length?`<div class="lc-logt"><span>Historial · toca para reutilizar</span><button type="button" data-hclr>Borrar</button></div>`+H.map((h,i)=>{ const z=a2z(h.r); return `<button type="button" class="lc-h" data-hi="${S.hist.length-H.length+i}" title="Reutilizar esta operación"><span class="lc-he">${natOf(h.e)||esc(h.e)}</span><span class="lc-hr">= ${fmt(z)}</span></button>`; }).join(''):''; }
  logEl.addEventListener('click',e=>{ if(e.target.closest('[data-hclr]')){ S.hist=[]; save(); renderLog(); return; }
    const b=e.target.closest('[data-hi]'); if(!b) return; const h=S.hist[+b.dataset.hi]; if(!h) return;
    if(e.target.closest('.lc-hr')&&!fresh&&main.value){ active=main; insert(plain(a2z(h.r),true)); return; }
    main.value=h.e; fresh=false; active=main; try{ main.focus({preventScroll:true}); main.setSelectionRange(h.e.length,h.e.length); }catch(err){} renderMain(); });
  $('[data-copy]').addEventListener('click',()=>{ if(!last) return; const t=plain(last); (navigator.clipboard?navigator.clipboard.writeText(t):Promise.reject()).then(()=>say('Copiado: '+t),()=>say(t)); });
  function updAnswer(){ const t=opts.answer&&opts.answer(); ansBtn.hidden=!(t&&t.input&&last); if(t&&t.label) ansBtn.textContent='→ '+t.label; }
  ansBtn.addEventListener('click',()=>{ const t=opts.answer&&opts.answer(); if(!t||!t.input||!last) return; const z=tidy(last);
    if(z.im!==0){ say('La respuesta debe ser un número real',true); return; }
    const v=String(+z.re.toPrecision(7)); t.input.value=v; t.input.dispatchEvent(new Event('input',{bubbles:true})); say(`Escrito ${v} en ${t.label||'la respuesta'}`); });
  $('[data-ang]').addEventListener('click',()=>{ S.deg=!S.deg; save(); renderInd(); if(fresh) renderRes(); else renderMain(); renderLog(); });
  $('[data-cpx]').addEventListener('click',()=>{ S.polar=!S.polar; save(); renderInd(); if(fresh) renderRes(); else renderMain(); renderLog(); renderEqn(true); });

  /* memorias */
  const mg=$('[data-mg]');
  function openMem(mode){ if(mode==='sto'){ const z=current(); if(!z) return; memMode={mode,z}; } else memMode={mode};
    $('[data-memt]').textContent=mode==='sto'?'Guardar '+formatTxt(memMode.z,{polar:false})+' en…':'Variables · toca para escribirla';
    $('[data-memclr]').hidden=mode==='sto';
    mg.innerHTML=MEMS.map(k=>{ const v=S.mem[k]; return `<button type="button" data-m="${k}" aria-label="${k}${v?' = '+esc(formatTxt(a2z(v),{polar:false})):' (vacía)'}"><b>${k}</b><span>${v?esc(formatTxt(a2z(v),{polar:false})):'0'}</span></button>`; }).join('');
    root.classList.add('memo'); }
  function closeMem(){ memMode=null; root.classList.remove('memo'); }
  mg.addEventListener('pointerdown',e=>{ if(e.target.closest('button')) e.preventDefault(); });
  mg.addEventListener('click',e=>{ const b=e.target.closest('[data-m]'); if(!b||!memMode) return; const k=b.dataset.m;
    if(memMode.mode==='sto'){ S.mem[k]=z2a(memMode.z); save(); say(`${formatTxt(memMode.z,{polar:false})} → ${k}`); renderInd(); closeMem(); }
    else { closeMem(); insert(k); } });
  $('[data-memx]').addEventListener('click',closeMem);
  $('[data-memclr]').addEventListener('click',()=>{ S.mem={}; save(); renderInd(); closeMem(); say('Memorias borradas'); });
  function memAdd(sg){ const z=current(); if(!z) return; const m=a2z(S.mem.M); S.mem.M=z2a(sg>0?add(m,z):sub(m,z)); save(); renderInd(); say(`M = ${formatTxt(a2z(S.mem.M),{polar:false})}`); }

  /* pestañas */
  root.querySelectorAll('[data-tab]').forEach(b=>b.addEventListener('click',()=>setTab(b.dataset.tab)));
  function setTab(t){ tab=t; closeMem(); root.querySelectorAll('[data-tab]').forEach(b=>b.setAttribute('aria-selected',b.dataset.tab===t)); root.querySelectorAll('[data-p]').forEach(p=>p.hidden=p.dataset.p!==t);
    if(t==='calc'){ active=main; renderLog(); disp.scrollTop=disp.scrollHeight; } else if(t==='eqn'){ renderEqn(); active=root.querySelector('[data-c="0"]'); } else { renderSolve(); active=$('[data-seq]'); }
    keepVisible(active); }

  /* ecuación polinómica */
  const LET='abcde';
  let eqRes=null;
  function renderEqn(keep){ const n=S.eqn.n; root.querySelectorAll('[data-deg] button').forEach(b=>b.setAttribute('aria-pressed',+b.dataset.n===n));
    const terms=[]; for(let k=0;k<=n;k++){ const p=n-k; terms.push(LET[k]+(p>1?'x^{'+p+'}':p===1?'x':'')); }
    $('[data-eform]').innerHTML=tex(terms.join('+')+'=0');
    const co=$('[data-co]'); if(!keep||co.children.length!==n+1){ co.innerHTML=''; for(let k=0;k<=n;k++){ const l=document.createElement('label'); l.innerHTML=`<span>${LET[k]}</span>`; const i=document.createElement('input'); i.className='lc-in lc-f'; i.dataset.c=k; i.setAttribute('inputmode','none'); i.autocomplete='off'; i.spellcheck=false; i.setAttribute('aria-label','Coeficiente '+LET[k]); i.value=S.eqn.c[k]??'0'; l.appendChild(i); co.appendChild(l); } }
    renderESol(); }
  function showIn(el){ requestAnimationFrame(()=>{ const r=el.getBoundingClientRect(), dr=disp.getBoundingClientRect(); if(r.bottom>dr.bottom||r.top<dr.top) disp.scrollTop+=r.top-dr.top-Math.max(8,dr.height-r.height-8); }); }
  function renderESol(){ const box=$('[data-esol]'); if(!eqRes){ box.innerHTML=''; return; }
    box.innerHTML=eqRes.roots.map((z,i)=>{ const ex=!dec&&eqRes.exact&&eqRes.exact[i]; const v=ex?tex(ex):fmt(z);
      return `<div class="lc-sr"><span class="lc-sx">${tex('x_{'+(i+1)+'}=')}</span><span class="lc-sv">${v}</span><button type="button" class="lc-a" data-ri="${i}" title="Guardar en Ans">Ans</button></div>`; }).join(''); }
  root.querySelector('[data-deg]').addEventListener('click',e=>{ const b=e.target.closest('[data-n]'); if(!b) return; S.eqn.n=+b.dataset.n; save(); eqRes=null; renderEqn(); active=root.querySelector('[data-c="0"]'); keepVisible(active); });
  $('[data-esolve]').addEventListener('click',solveEqn);
  $('[data-esol]').addEventListener('click',e=>{ const b=e.target.closest('[data-ri]'); if(!b||!eqRes) return; const z=eqRes.roots[+b.dataset.ri]; S.ans=z2a(z); save(); say(`x${+b.dataset.ri+1} → Ans`,false,$('[data-emsg]')); });
  function solveEqn(){ const n=S.eqn.n, em=$('[data-emsg]'); const E=env(); let cs;
    try{ cs=[]; for(let k=0;k<=n;k++){ const s=(S.eqn.c[k]||'').trim()||'0'; try{ cs.push(evaluate(parse(s),E)); }catch(e){ e.coef=LET[k]; throw e; } } }
    catch(e){ eqRes=null; renderESol(); say((e.coef?`Coeficiente ${e.coef}: `:'')+errText(e),true,em); return; }
    if(cs[0].re===0&&cs[0].im===0){ eqRes=null; renderESol(); say('El coeficiente a no puede ser 0',true,em); return; }
    try{ const roots=polyRoots(cs); eqRes={roots,exact:n===2?quadExact(cs):null}; S.ans=z2a(roots[0]); save(); dec=false; renderESol(); em.textContent=''; showIn($('[data-esol]')); }
    catch(e){ eqRes=null; renderESol(); say(errText(e),true,em); } }

  /* SOLVE */
  let sRes=null;
  function renderSNat(){ const v=$('[data-seq]').value, h=natOf(v), el=$('[data-snat]'); if(!v.trim()){ el.className='lc-nat ph'; el.textContent='Ejemplo: x³+6x²+8x=48  ·  sin(x)=0.5'; } else { el.className='lc-nat'; el.innerHTML=h||esc(v); } }
  function renderSolve(keep){ const q=$('[data-seq]'), x0=$('[data-sx0]'); if(!keep){ if(document.activeElement!==q) q.value=S.sol.e||''; if(document.activeElement!==x0) x0.value=S.sol.x0||'0'; } renderSNat();
    const box=$('[data-ssol]'); box.innerHTML=sRes?`<div class="lc-sr"><span class="lc-sx">${tex('x=')}</span><span class="lc-sv">${fmt(C(sRes.x,0))}</span><button type="button" class="lc-a" data-sans title="Guardar en Ans">Ans</button></div><div class="lc-sr"><span class="lc-sx">${tex('L-R=')}</span><span class="lc-sv">${tex(decTeX(sRes.lr))}</span></div>`:''; }
  $('[data-ssolve]').addEventListener('click',doSolve);
  $('[data-ssol]').addEventListener('click',e=>{ if(e.target.closest('[data-sans]')&&sRes){ S.ans=[sRes.x,0]; save(); say('x → Ans',false,$('[data-smsg]')); } });
  function doSolve(){ const sm=$('[data-smsg]'), src=$('[data-seq]').value; if(!src.trim()){ say('Escribe una ecuación con x',true,sm); return; }
    if(!/x|X/.test(src.replace(/exp|Ans/g,''))){ say('La ecuación debe tener la variable x',true,sm); return; }
    let x0=0; try{ const s=$('[data-sx0]').value.trim(); if(s){ const z=evaluate(parse(s),env()); x0=z.re; } }catch(e){ say('x inicial: '+errText(e),true,sm); return; }
    try{ sRes=solve(src,env(),x0); S.mem.x=[sRes.x,0]; S.ans=[sRes.x,0]; save(); dec=false; renderSolve(true); sm.textContent=''; renderInd(); showIn($('[data-ssol]')); }
    catch(e){ if(!e.calc) throw e; sRes=null; renderSolve(true); say(errText(e),true,sm); } }

  /* inicio */
  renderInd(); renderLog(); renderMain();
  return {
    el:root, engine,
    focus(){ const f=active||main; try{ f.focus({preventScroll:true}); const n=f.value.length; if(f===main&&document.activeElement===f) f.setSelectionRange(n,n); }catch(e){} },
    refresh(){ renderInd(); if(fresh) renderRes(); else renderMain(); renderLog(); disp.scrollTop=disp.scrollHeight; updAnswer(); },
    insert(t){ active=main; insert(t); },
    answerChanged(){ updAnswer(); },
    setTab, get ans(){ return a2z(S.ans); },
    destroy(){ root.remove(); }
  };
}

G.LGDRCalc={mount,engine,version:'1'};
})(typeof window!=='undefined'?window:globalThis);
