/* =====================================================================================================
   entrenar/calc.js · Calculadora científica del Laboratorio LGDR (v2: forma y uso de una fx‑991CW, diseño propio)
   ---------------------------------------------------------------------------------------------------
   Misma distribución y flujo que una científica de la serie ClassWiz CW, sin su marca:
     · arriba SHIFT · ALPHA · HOME · SETTINGS, la cruceta con OK y BACK, VARIABLE · FUNCTION · CATALOG · TOOLS;
       luego 3 filas de funciones (plantillas ■/□, √■, x², x^■, log■□…) y el teclado numérico con DEL · AC · FORMAT · EXE.
     · pantalla natural: lo que escribes se ve como en el cuaderno y el cursor entra en fracciones, raíces y potencias
       (◀ ▶ entran y salen de los huecos, ▲ ▼ pasan entre numerador y denominador; también se puede tocar).
     · HOME con 4 apps: Calcular (reales + SOLVE en TOOLS), Complejos (i, ∠, a+bi / r∠θ), Ecuación (polinomio de
       grado 2–4 y sistemas lineales de 2–4 incógnitas) y Tabla de función (f(x), g(x), hasta 45 filas).
     · SETTINGS (solo lo básico de Calc Settings): unidad de ángulo, entrada/salida natural o lineal, formato de
       número Norm 1/2 · Fix · Sci y forma del resultado complejo. CATALOG con lo que no tiene tecla.
     · historial (▲ o toca; dos toques lo reutiliza), Ans, variables A–F, x, y, z, M (VARIABLE, STO, M+ / M−),
       FORMAT (estándar, decimal, a+bi, r∠θ), «→ Respuesta» para escribir el resultado en una casilla.
   Sin dependencias: si existe window.katex se usa para los resultados exactos; si no, se muestran en texto.

   Uso:
     const calc = LGDRCalc.mount(contenedor, {
       storageKey: 'lgdr-calc-v1',          // dónde se guardan historial, memorias y configuración (null = no guardar)
       katex: window.katex,                 // opcional
       answer: () => ({input, label})|null, // opcional: campo al que «→ Respuesta» manda el resultado
       onClose: () => …                     // opcional: muestra el botón ✕
     });
     calc.focus(); calc.refresh(); calc.setTab('calc'|'cplx'|'eqn'|'tbl'|'solve'); calc.key('@exe');
   Motor sin interfaz: LGDRCalc.engine.{parse, evaluate, calc, toTeX, format, formatLin, polyRoots, quadExact, solve, linsolve}
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
    if((ch==='f'||ch==='g')&&src[p+1]==='('){ t.push({t:'fn',v:'u'+ch,s:ch,p}); p++; continue; }
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
        case 'uf': case 'ug': { const F=env.funcs&&env.funcs[n.f[1]]; if(!F) throw MATH((n.f[1])+'(x) no está definida');
          if((env.depth||0)>8) throw MATH('Definición circular');
          return evaluate(typeof F==='string'?parse(F):F,Object.assign({},env,{depth:(env.depth||0)+1,vars:Object.assign({},V,{x:a})})); }
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
        case 'uf': case 'ug': return n.f[1]+'\\left('+T(strip(A[0]))+'\\right)';
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
/* decimal según el formato de número: nf = {m:'norm',n:1|2} · {m:'fix',n:0–9} · {m:'sci',n:0–9 (0 = 10 cifras)}
   Norm 1: notación científica fuera de 10⁻² … 10¹⁰ · Norm 2: fuera de 10⁻⁹ … 10¹⁰ (10 cifras significativas) */
let NF={m:'norm',n:2};
function sciOf(ax,d){ let e=Math.floor(Math.log10(ax)); let m=(ax/Math.pow(10,e)).toFixed(d-1); if(+m>=10){ e++; m=(ax/Math.pow(10,e)).toFixed(d-1); } return {m,e}; }
function dec(x,nf){ nf=nf&&typeof nf==='object'?nf:NF; const neg=x<0, ax=Math.abs(x);
  if(nf.m==='sci'){ const d=nf.n||10; if(ax===0) return {m:(0).toFixed(d-1),e:0,neg:false}; const r=sciOf(ax,d); return {m:r.m,e:r.e,neg}; }
  if(nf.m==='fix'){ if(ax>=1e10){ const r=sciOf(ax,10); return {m:String(+r.m),e:r.e,neg}; } const s=ax.toFixed(nf.n); return {m:s,e:null,neg:neg&&+s!==0}; }
  if(x===0) return {m:'0',e:null,neg:false};
  let e=Math.floor(Math.log10(ax)); let m=+(ax/Math.pow(10,e)).toPrecision(10); if(m>=10){ m/=10; e++; }
  if(ax>=1e10||ax<(nf.n===1?1e-2:1e-9)) return {m:String(+m.toPrecision(10)),e,neg};
  const d=Math.min(20,Math.max(0,9-e)); let s=ax.toFixed(d); if(s.includes('.')) s=s.replace(/0+$/,'').replace(/\.$/,'');
  return {m:s,e:null,neg}; }
const decTeX=(x,nf)=>{ const d=dec(x,nf); return (d.neg?'-':'')+d.m+(d.e!=null?'\\times10^{'+d.e+'}':''); };
const decTxt=(x,nf)=>{ const d=dec(x,nf); return (d.neg?'−':'')+d.m+(d.e!=null?'×10^'+d.e:''); };
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
  if(o.lin) return '\\text{'+formatLin(z,o).replace(/[{}\\$&#^_%~]/g,'')+'}';
  const P=x=>(o.nat&&natural(x))||decTeX(x,o.nf);
  const imT=v=>{ const a=Math.abs(v); return Math.abs(a-1)<1e-15?'i':P(a)+'i'; };
  if(o.polar&&(z.im!==0||z.re<0)){ const r=abs(z), t=argR(z); return P(r)+'\\angle '+P(o.deg!==false?t/D2R:t); }
  if(z.im===0) return P(z.re);
  if(z.re===0) return (z.im<0?'-':'')+imT(z.im);
  return P(z.re)+(z.im<0?'-':'+')+imT(z.im); }
function formatTxt(z,o){ o=o||{}; z=tidy(z); const T=x=>decTxt(x,o.nf);
  if(o.polar&&(z.im!==0||z.re<0)) return T(abs(z))+'∠'+T(o.deg!==false?argR(z)/D2R:argR(z));
  if(z.im===0) return T(z.re); const im=Math.abs(z.im)===1?'i':T(Math.abs(z.im))+'i';
  if(z.re===0) return (z.im<0?'−':'')+im; return T(z.re)+(z.im<0?' − ':' + ')+im; }
/* salida lineal (texto plano en TeX \text): fracciones como p⌟q, lo demás en decimal */
function formatLin(z,o){ const R=x=>{ if(o.nat&&x!==0&&Math.abs(x)<1e10&&Math.abs(x)>=1e-9&&Math.abs(x-Math.round(x))>1e-12*Math.max(1,Math.abs(x))){ const f=frac(Math.abs(x),10000); if(f) return (x<0?'−':'')+f[0]+'⌟'+f[1]; } return decTxt(x,o.nf); };
  let s; if(o.polar&&(z.im!==0||z.re<0)) s=R(abs(z))+'∠'+R(o.deg!==false?argR(z)/D2R:argR(z));
  else if(z.im===0) s=R(z.re); else { const im=Math.abs(z.im)===1?'i':R(Math.abs(z.im))+'i'; s=z.re===0?(z.im<0?'−':'')+im:R(z.re)+(z.im<0?'−':'+')+im; }
  return s; }
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

/* ------------------------------------------------------------------ sistema lineal A·x = b (complejos, pivoteo parcial)
   → {x:[…]} o {none:true} (sin solución) o {inf:true} (infinitas soluciones) */
function linsolve(A,b){ const n=A.length, M=A.map((r,k)=>r.map(z=>C(z.re,z.im)).concat([C(b[k].re,b[k].im)]));
  let sc=0; M.forEach(r=>r.forEach(z=>{ sc=Math.max(sc,abs(z)); })); const eps=1e-11*Math.max(1,sc);
  let row=0; const piv=[];
  for(let c=0;c<n&&row<n;c++){ let p=row; for(let r=row+1;r<n;r++) if(abs(M[r][c])>abs(M[p][c])) p=r;
    if(abs(M[p][c])<=eps) continue; [M[row],M[p]]=[M[p],M[row]];
    for(let r=0;r<n;r++){ if(r===row) continue; const f=div(M[r][c],M[row][c]); if(f.re===0&&f.im===0) continue; for(let k=c;k<=n;k++) M[r][k]=sub(M[r][k],mul(f,M[row][k])); }
    piv.push(c); row++; }
  if(row<n){ for(let r=row;r<n;r++) if(abs(M[r][n])>eps*1e3) return {none:true}; return {inf:true}; }
  return {x:piv.map((c,k)=>tidy(div(M[k][n],M[k][c])))}; }

const engine={parse,evaluate,calc,toTeX,format,formatTxt,formatLin,plain,natural,polyRoots,quadExact,solve,linsolve,lex,dec,frac,C,setNF:nf=>{ NF=nf||{m:'norm',n:2}; }};

/* ===================================================================================================== editor natural
   Lo escrito es un árbol: una fila es una lista de elementos; cada elemento es un carácter/ficha {t:'c', v} o una
   plantilla con huecos (fracción, raíz, potencia, raíz n‑ésima, log con base, valor absoluto). El cursor es (fila, índice):
   ◀ ▶ entran y salen de los huecos, ▲ ▼ pasan entre numerador y denominador. Se convierte a texto lineal para el motor. */
const SLOTS={frac:['a','b'],sqrt:['a'],root:['n','a'],pow:['a'],logb:['n','a'],abs:['a']};
const chi=v=>({t:'c',v});
function tpl(t,init){ const n={t}; SLOTS[t].forEach(s=>{ n[s]=init&&init[s]?init[s]:[]; }); return n; }
function cloneRow(row){ return (row||[]).map(it=>{ if(!it||typeof it!=='object') return chi(String(it)); if(it.t==='c') return chi(String(it.v)); if(!SLOTS[it.t]) return chi('?'); const n={t:it.t}; SLOTS[it.t].forEach(s=>{ n[s]=cloneRow(it[s]); }); return n; }); }
const TOKS=Object.keys(FN).map(k=>k+'(').concat(['Ans','⁻¹','f(','g(']).sort((a,b)=>b.length-a.length);
const NORM={'*':'×','/':'÷','-':'−','–':'−','·':'×'};
function fromText(s){ const out=[]; let p=0; s=String(s||'');
  while(p<s.length){ const t=TOKS.find(k=>s.startsWith(k,p)); if(t){ out.push(chi(t)); p+=t.length; continue; }
    const c=s[p]; p++; if(/\s/.test(c)) continue; out.push(chi(NORM[c]||c)); }
  return out; }
class Ed{
  constructor(items){ this.set(items||[]); }
  set(items){ this.root=items; this.row=items; this.i=items.length; }
  clear(){ this.set([]); }
  empty(){ return !this.root.length; }
  parent(target){ const st=[this.root];
    while(st.length){ const r=st.pop(); for(let k=0;k<r.length;k++){ const it=r[k]; if(it.t==='c') continue;
      for(const s of SLOTS[it.t]){ if(it[s]===target) return {prow:r,idx:k,node:it,slot:s}; st.push(it[s]); } } }
    return null; }
  right(){ const r=this.row, i=this.i;
    if(i<r.length){ const it=r[i]; if(it.t!=='c'){ this.row=it[SLOTS[it.t][0]]; this.i=0; } else this.i++; return; }
    const P=this.parent(r); if(!P){ this.i=0; return; }
    const sl=SLOTS[P.node.t], k=sl.indexOf(P.slot);
    if(k<sl.length-1){ this.row=P.node[sl[k+1]]; this.i=0; } else { this.row=P.prow; this.i=P.idx+1; } }
  left(){ const r=this.row, i=this.i;
    if(i>0){ const it=r[i-1]; if(it.t!=='c'){ const sl=SLOTS[it.t]; this.row=it[sl[sl.length-1]]; this.i=this.row.length; } else this.i--; return; }
    const P=this.parent(r); if(!P){ this.i=r.length; return; }
    const sl=SLOTS[P.node.t], k=sl.indexOf(P.slot);
    if(k>0){ this.row=P.node[sl[k-1]]; this.i=this.row.length; } else { this.row=P.prow; this.i=P.idx; } }
  /* ▲ (d = −1) / ▼ (d = +1) entre numerador y denominador; false si no hay a dónde */
  vert(d){ let r=this.row, P=this.parent(r);
    while(P){ if(P.node.t==='frac'&&((d<0&&P.slot==='b')||(d>0&&P.slot==='a'))){ const to=P.node[d<0?'a':'b'];
        const f=r===this.row&&r.length?this.i/r.length:1; this.row=to; this.i=Math.round(f*to.length); return true; }
      r=P.prow; P=this.parent(r); }
    return false; }
  home(){ this.row=this.root; this.i=0; }
  end(){ this.row=this.root; this.i=this.root.length; }
  insC(v){ this.row.splice(this.i,0,chi(v)); this.i++; }
  insT(node,enter){ this.row.splice(this.i,0,node); if(enter){ this.row=node[enter]; this.i=node[enter].length; } else this.i++; }
  del(){ const r=this.row, i=this.i;
    if(i>0){ const it=r[i-1]; if(it.t==='c'||SLOTS[it.t].every(s=>!it[s].length)){ r.splice(i-1,1); this.i--; return; }
      const sl=SLOTS[it.t]; this.row=it[sl[sl.length-1]]; this.i=this.row.length; return; }
    const P=this.parent(r); if(!P) return; const n=P.node;
    if(SLOTS[n.t].every(s=>!n[s].length)){ P.prow.splice(P.idx,1); this.row=P.prow; this.i=P.idx; return; }
    if(SLOTS[n.t].length===1&&n.t!=='pow'){ const inner=n[SLOTS[n.t][0]]; P.prow.splice(P.idx,1,...inner); this.row=P.prow; this.i=P.idx; return; }   /* √ y |x|: se quita la plantilla y queda lo de adentro */
    this.left(); }
  /* texto para el motor + mapa (posición en el texto → lugar del cursor) para señalar errores */
  ser(){ return serRow(this.root); }
  at(pos){ const m=this.ser().map; let best=null; for(const e of m){ if(e[0]<=pos) best=e; else break; } if(best){ this.row=best[1]; this.i=best[2]; } }
  json(){ return cloneRow(this.root); }
}
function serRow(root){ const out={s:'',map:[]};
  const w=row=>{ if(!row.length){ out.map.push([out.s.length,row,0]); out.s+='□'; return; }
    row.forEach((it,k)=>{ out.map.push([out.s.length,row,k]);
      if(it.t==='c'){ out.s+=it.v; return; }
      switch(it.t){
        case 'frac': out.s+='(('; w(it.a); out.s+=')÷('; w(it.b); out.s+='))'; break;
        case 'sqrt': out.s+='sqrt('; w(it.a); out.s+=')'; break;
        case 'root': out.s+='root('; w(it.n); out.s+=','; w(it.a); out.s+=')'; break;
        case 'pow': out.s+='^('; w(it.a); out.s+=')'; break;
        case 'logb': out.s+='log('; w(it.n); out.s+=','; w(it.a); out.s+=')'; break;
        case 'abs': out.s+='Abs('; w(it.a); out.s+=')'; break; } });
    out.map.push([out.s.length,row,row.length]); };
  w(root); return out; }

/* dibujo del editor (HTML propio: así el cursor puede ir dentro de fracciones, raíces y potencias) */
const escH=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const FNDISP={'sin⁻¹(':'sin<sup>−1</sup>(','cos⁻¹(':'cos<sup>−1</sup>(','tan⁻¹(':'tan<sup>−1</sup>(','sinh⁻¹(':'sinh<sup>−1</sup>(','cosh⁻¹(':'cosh<sup>−1</sup>(','tanh⁻¹(':'tanh<sup>−1</sup>(','f(':'<i>f</i>(','g(':'<i>g</i>(','√(':'√(','∛(':'∛('};
const CDISP={'×':'×','÷':'÷','−':'−','ᴇ':'<span class="e-E">ᴇ</span>','⁻¹':'<sup>−1</sup>','²':'<sup>2</sup>','³':'<sup>3</sup>','□':'<span class="e-box"></span>','=':'<span class="e-op">=</span>','+':'<span class="e-op">+</span>'};
function cDisp(v){ if(CDISP[v]) return CDISP[v]; if(FNDISP[v]) return FNDISP[v]; if(/^[A-FMxyzie]$/.test(v)) return '<i>'+v+'</i>'; return escH(v); }
const CUR='<span class="e-cur" aria-hidden="true"></span>';
/* ed = Ed o null (sin cursor); lin = forma lineal; reg = lista para tocar y poner el cursor */
function edHTML(root,ed,lin,reg){
  const on=(row,i)=>ed&&ed.row===row&&ed.i===i;
  const isNum=row=>row.every(it=>it.t==='c'&&/^[0-9.]$/.test(it.v));
  const R=row=>{ if(!row.length){ const id=reg?reg.push([row,0])-1:-1; return `<span class="e-box${on(row,0)?' on':''}" data-k="${id}">${on(row,0)?CUR:''}</span>`; }
    let s=''; row.forEach((it,k)=>{ if(on(row,k)) s+=CUR; const id=reg?reg.push([row,k])-1:-1; s+=item(it,id); }); if(on(row,row.length)) s+=CUR; return s; };
  const G=row=>row.length>1&&!isNum(row)?'('+R(row)+')':R(row);
  function item(it,id){ const d=` data-k="${id}"`;
    if(it.t==='c') return `<span class="e-c"${d}>${cDisp(it.v)}</span>`;
    if(lin) switch(it.t){
      case 'frac': return `<span class="e-t"${d}>${G(it.a)}<span class="e-op">⌟</span>${G(it.b)}</span>`;
      case 'sqrt': return `<span class="e-t"${d}>√(${R(it.a)})</span>`;
      case 'root': return `<span class="e-t"${d}>${G(it.n)}<sup>x</sup>√(${R(it.a)})</span>`;
      case 'pow': { const v=it.a.map(x=>x.t==='c'?x.v:'#').join(''); if(!(ed&&ed.row===it.a)&&(v==='2'||v==='3')) return `<span class="e-t"${d}><sup>${v}</sup></span>`; if(!(ed&&ed.row===it.a)&&v==='−1') return `<span class="e-t"${d}><sup>−1</sup></span>`; return `<span class="e-t"${d}>^(${R(it.a)})</span>`; }
      case 'logb': return `<span class="e-t"${d}>log(${R(it.n)},${R(it.a)})</span>`;
      case 'abs': return `<span class="e-t"${d}>Abs(${R(it.a)})</span>`; }
    switch(it.t){
      case 'frac': return `<span class="e-fr"${d}><span class="e-n">${R(it.a)}</span><span class="e-d">${R(it.b)}</span></span>`;
      case 'sqrt': return `<span class="e-sq"${d}><span class="e-ra">${R(it.a)}</span></span>`;
      case 'root': return `<span class="e-rt"${d}><span class="e-ix">${R(it.n)}</span><span class="e-sq"><span class="e-ra">${R(it.a)}</span></span></span>`;
      case 'pow': return `<span class="e-sup"${d}>${R(it.a)}</span>`;
      case 'logb': return `<span class="e-lg"${d}>log<span class="e-sub">${R(it.n)}</span><span class="e-pa">(${R(it.a)})</span></span>`;
      case 'abs': return `<span class="e-abs"${d}>${R(it.a)}</span>`; }
    return ''; }
  return R(root); }

/* ===================================================================================================== interfaz */
const CSS=`
.lc{--lc-ink:var(--ink,#111);--lc-mu:var(--muted,#5b6472);--lc-ln:var(--line,#d9dde3);--lc-ac:var(--accent,#1d4ed8);--lc-sf:var(--surface,#fff);--lc-bad:var(--bad,#b42318);--lc-ok:var(--ok,#157f3c);
  --b0:#1c1d1f;--b1:#2a2b2e;--kf:#3b3c3f;--kfh:#4a4b4f;--ky:#e6c065;--kgold:#c6a65c;
  --lcd:#d3d8ca;--lcdi:#16191a;--lcdm:#545b55;--lcdl:#b6bdae;--lcds:#e9f0ff;
  container-type:size;display:flex;flex-direction:column;height:100%;min-height:0;background:var(--b0);color:#f3f4f6;font:14px var(--f-body,system-ui,sans-serif);-webkit-tap-highlight-color:transparent;
  --kd:clamp(28px,min(calc((100cqw - 44px) / 6 * .8),calc((100cqh - 390px) / 8.8)),54px);
  --kn:min(calc(var(--kd) * 1.1),calc((100cqw - 40px) / 5 * .84))}
@media (prefers-color-scheme:dark){:root:not([data-theme=light]) .lc{--lcd:#c5cbbb;--lcdl:#a9b0a1}}
:root[data-theme=dark] .lc{--lcd:#c5cbbb;--lcdl:#a9b0a1}
.lc *{box-sizing:border-box}
:where(.lc) button{font:inherit;color:inherit;-webkit-user-select:none;user-select:none;touch-action:manipulation}
.lc:focus,.lc:focus-visible{outline:none}
.lc-hd{flex:none;display:flex;align-items:center;gap:8px;padding:8px 10px 6px;padding-top:max(8px,env(safe-area-inset-top,0px))}
.lc-ttl{font:700 13px var(--f-body,system-ui);letter-spacing:.06em;text-transform:uppercase;color:#aeb4bf}
.lc-ttl b{color:#fff;letter-spacing:0;text-transform:none;font-weight:700;margin-left:6px}
.lc-hsp{flex:1}
.lc-x{display:grid;place-items:center;width:32px;height:32px;border:1px solid #4a515d;border-radius:999px;background:var(--b1);color:#e5e7eb;cursor:pointer}
.lc-x:hover{border-color:#ff8a80;color:#ff8a80}
.lc-lcdw{flex:1 1 auto;min-height:118px;margin:0 10px;padding:6px;border-radius:12px;background:#111418;box-shadow:inset 0 0 0 1px #000,0 1px 0 #3a404b;display:flex}
.lc-lcd{flex:1;min-width:0;min-height:0;display:flex;flex-direction:column;border-radius:7px;background:var(--lcd);color:var(--lcdi);overflow:hidden;position:relative}
.lc-st{flex:none;display:flex;align-items:center;gap:6px;padding:3px 8px;min-height:20px;font:700 10.5px var(--f-mono,ui-monospace,monospace);color:var(--lcdm);border-bottom:1px solid var(--lcdl)}
.lc-st .on{color:var(--lcdi)}.lc-st .sh{background:#7a5b00;color:#fff;padding:0 4px;border-radius:3px}.lc-st .al{background:#9c2f27;color:#fff;padding:0 4px;border-radius:3px}
.lc-st .app{margin-left:auto;font:700 11px var(--f-body,system-ui);color:var(--lcdi)}
.lc-scr{flex:1;min-height:0;overflow:auto;overscroll-behavior:contain;scrollbar-width:thin;display:flex;flex-direction:column;padding:4px 8px 6px}
.lc-v[hidden]{display:none!important}
.lc-vc{display:flex;flex-direction:column;min-height:100%}
.lc-log{margin-top:auto;display:flex;flex-direction:column}
.lc-h{all:unset;display:block;padding:3px 4px;border-bottom:1px dotted var(--lcdl);cursor:pointer;border-radius:4px}
.lc-h:hover{background:rgba(0,0,0,.05)}
.lc-h.sel{background:var(--lcdi);color:var(--lcd)}
.lc-h .he{font-size:14px;overflow:hidden;white-space:nowrap;text-overflow:clip;color:inherit;opacity:.85}
.lc-h .hr{display:block;text-align:right;font-size:15px;white-space:nowrap;overflow-x:auto;scrollbar-width:none}
.lc-cur{padding-top:4px}
.lc-edl{font-size:22px;min-height:1.6em;overflow-x:auto;overflow-y:hidden;white-space:nowrap;scrollbar-width:none;padding:4px 2px 6px;cursor:text}
.lc-res{display:flex;align-items:center;min-height:36px;gap:6px}
.lc-rv{margin-left:auto;font-size:24px;white-space:nowrap;overflow-x:auto;overflow-y:hidden;scrollbar-width:none;max-width:100%;text-align:right}
.lc-rv.pv{font-size:15px;color:var(--lcdm)}
.lc-rv.err{font:700 14px var(--f-body,system-ui);color:#9c2f27;white-space:normal;text-align:right}
.lc-rv .lc-ap{font-size:.7em;color:var(--lcdm);margin-right:4px}
.lc-lin{font-family:var(--f-mono,ui-monospace,monospace);font-size:.9em}
.lc-ttl2{font:700 12.5px var(--f-body,system-ui);color:var(--lcdm);padding:2px 0 4px}
.lc-hint{font-size:11.5px;color:var(--lcdm);padding:4px 0}
.lc-li{all:unset;box-sizing:border-box;width:100%;display:flex;align-items:center;gap:8px;padding:5px 8px;border-radius:5px;cursor:pointer;font-size:14px;min-height:30px}
.lc-li .n{font:700 12px var(--f-mono,ui-monospace,monospace);color:var(--lcdm);min-width:16px}
.lc-li .r{margin-left:auto;font-size:12.5px;color:var(--lcdm);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:55%}
.lc-li.sel{background:var(--lcdi);color:var(--lcd)}.lc-li.sel .n,.lc-li.sel .r{color:var(--lcdl)}
.lc-li[aria-disabled=true]{opacity:.45}
.lc-home{display:grid;grid-template-columns:repeat(3,1fr);gap:4px 6px;padding:6px 0 2px}
.lc-app{all:unset;box-sizing:border-box;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;padding:6px 4px;border-radius:8px;border:1px solid var(--lcdl);cursor:pointer;text-align:center;font:500 13px var(--f-body,system-ui);line-height:1.15;border-color:transparent;padding:5px 2px 4px}
.lc-app svg{width:26px;height:26px}
.lc-app small{font-weight:500;font-size:10.5px;color:var(--lcdm)}
.lc-app.sel{background:var(--lcdi);color:var(--lcd);border-color:var(--lcdi)}.lc-app.sel small{color:var(--lcdl)}
.lc-fld{display:flex;align-items:center;gap:6px;padding:4px 4px;border-radius:5px;border:1px solid transparent;min-height:36px}
.lc-fld.sel{border-color:var(--lcdi)}
.lc-fld .fl{font:italic 600 15px KaTeX_Main,Georgia,serif;white-space:nowrap}
.lc-fld .fe{flex:1;min-width:0;font-size:19px;overflow-x:auto;overflow-y:hidden;white-space:nowrap;scrollbar-width:none}
.lc-sols{display:grid;gap:3px;margin-top:4px}
.lc-sr{all:unset;box-sizing:border-box;width:100%;display:flex;align-items:center;gap:8px;padding:4px 6px;border-radius:5px;cursor:pointer;min-height:34px}
.lc-sr .sx{font:italic 600 15px KaTeX_Main,Georgia,serif;flex:none}
.lc-sr .sv{flex:1;min-width:0;text-align:right;white-space:nowrap;overflow-x:auto;overflow-y:hidden;scrollbar-width:none;font-size:17px}
.lc-sr.sel{background:var(--lcdi);color:var(--lcd)}
.lc-grid{display:grid;gap:3px;margin:2px 0 4px}
.lc-cell{all:unset;display:block;padding:3px 4px;border:1px solid var(--lcdl);border-radius:4px;text-align:right;font:500 13px var(--f-mono,ui-monospace,monospace);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;cursor:pointer;min-height:24px;min-width:0}
.lc-cell.sel{border-color:var(--lcdi);background:var(--lcdi);color:var(--lcd)}
.lc-cell.ed{background:var(--lcds);color:var(--lcdi)}
.lc-gh{font:italic 600 12.5px KaTeX_Main,Georgia,serif;text-align:center;color:var(--lcdm)}
.lc-eform{font-size:16px;padding:2px 0 4px;overflow-x:auto;white-space:nowrap;scrollbar-width:none}
.lc-edit{border-top:1px solid var(--lcdl);margin-top:4px;padding-top:4px}
.lc-go{all:unset;display:inline-block;margin-top:6px;padding:4px 12px;border-radius:999px;background:var(--lcdi);color:var(--lcd);font:700 12.5px var(--f-body,system-ui);cursor:pointer}
.lc-tb{width:100%;border-collapse:collapse;font:500 12.5px var(--f-mono,ui-monospace,monospace)}
.lc-tb th{text-transform:none;letter-spacing:0;position:sticky;top:-4px;background:var(--lcd);font:italic 600 13px KaTeX_Main,Georgia,serif;padding:3px 4px;border-bottom:1.5px solid var(--lcdi)}
.lc-tb td{padding:2px 4px;text-align:right;border-bottom:1px solid var(--lcdl);white-space:nowrap;cursor:pointer}
.lc-tb td.n{color:var(--lcdm);text-align:center;font-size:10.5px;width:1%}
.lc-tb td.sel{background:var(--lcdi);color:var(--lcd)}
.lc-tbv{position:sticky;bottom:-6px;background:var(--lcd);border-top:1.5px solid var(--lcdi);padding:4px 2px;margin-top:4px;text-align:right;font-size:17px;white-space:nowrap;overflow-x:auto;scrollbar-width:none}
.lc.lc-off .lc-lcd{background:#a7ad9f}
.lc.lc-off .lc-lcd>*{visibility:hidden}
.lc.lc-off .lc-lcd::after{content:"Apagada · presiona ON";position:absolute;inset:0;display:grid;place-items:center;font:600 12px var(--f-body,system-ui);color:rgba(0,0,0,.28);letter-spacing:.04em}
.lc.lc-off .lc-bar>.lc-a{display:none}
.lc-bar{flex:none;display:flex;align-items:center;gap:6px;padding:6px 10px 2px;min-height:34px;flex-wrap:wrap}
.lc-a{border:1px solid #4a515d;background:var(--b1);color:#e5e7eb;font:600 12px var(--f-body,system-ui);padding:4px 10px;border-radius:999px;cursor:pointer;min-height:28px}
.lc-a:hover{border-color:#9aa3b2}
.lc-a.pri{border-color:#5b8cff;color:#cfe0ff;background:#22345e;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.lc-a[hidden]{display:none}
.lc-msg{font-size:12px;color:#9be3b5;margin-left:auto;text-align:right;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.lc-msg.bad{color:#ffb4ab}
.lc-kp{flex:none;padding:0 12px max(10px,env(safe-area-inset-bottom,0px));display:flex;flex-direction:column;gap:3px}
.lc-g{display:grid;column-gap:4px;row-gap:2px;justify-items:center;align-items:end}
.lc-gt{grid-template-columns:repeat(6,minmax(0,1fr));grid-template-rows:repeat(3,auto);row-gap:0;margin-bottom:4px}
.lc-g6{grid-template-columns:repeat(6,minmax(0,1fr))}
.lc-g5{grid-template-columns:repeat(5,minmax(0,1fr));margin-top:2px}
.lc-c{display:flex;flex-direction:column;align-items:center;width:100%;min-width:0}
.lc-lg{height:14px;width:100%;display:flex;align-items:flex-end;justify-content:flex-start;padding:0 0 2px 1px;font:700 10px var(--f-body,system-ui);line-height:1;white-space:nowrap;overflow:visible;pointer-events:none}
.lc-lg .ks{color:var(--ky);display:inline-flex;align-items:flex-end;gap:1px}
.lc-lg .ks::after{content:"";width:5px;height:5px;border-left:1px solid currentColor;border-bottom:1px solid currentColor;margin:0 0 -1px 1px;opacity:.7}
.lc-lg .tl{width:100%;text-align:center;color:#e9e9ea;font-size:8.5px;letter-spacing:.04em}
.lc-k{position:relative;display:flex;align-items:center;justify-content:center;width:var(--kd);height:var(--kd);border:0;border-radius:50%;background:var(--kf);color:#f4f4f5;cursor:pointer;padding:0;line-height:1;font:600 15px var(--f-body,system-ui);box-shadow:inset 0 2px 1px rgba(255,255,255,.13),inset 0 -3px 4px rgba(0,0,0,.35),0 2px 3px rgba(0,0,0,.55)}
.lc-k:hover{background:var(--kfh)}
.lc-k:active,.lc-k.dn{transform:translateY(1px) scale(.97);box-shadow:inset 0 1px 1px rgba(255,255,255,.1),inset 0 -1px 3px rgba(0,0,0,.4),0 1px 1px rgba(0,0,0,.5)}
.lc-k .kl{white-space:nowrap;pointer-events:none;display:inline-block;line-height:1}
.lc-k svg{width:58%;height:58%;pointer-events:none}
.lc-k .kl svg{width:1.35em;height:1.35em;vertical-align:middle}
.lc-k.sm{font-size:13px}
.lc-k.n{width:var(--kn);height:var(--kn);font-size:20px;font-weight:500}
.lc-k.n.sm2{font-size:13.5px}
.lc-k.n.fm{font-size:9.5px;font-weight:700;letter-spacing:.02em;flex-direction:column;gap:1px}
.lc-k.tk{width:calc(var(--kd)*.8);height:calc(var(--kd)*.8);background:#141516}
.lc-k.tk:hover{background:#26282b}
.lc-k.tk.on{width:calc(var(--kd)*.62);height:calc(var(--kd)*.62);margin-top:calc(var(--kd)*.1)}
.lc-k.shf{background:var(--kgold);color:#2a2410}
.lc-k.shf:hover{background:#d6b56a}
.lc.s-sh .lc-k.shf{box-shadow:0 0 0 2px var(--ky),0 0 10px rgba(242,193,78,.6)}
.lc.s-sh .lc-lg .ks{text-decoration:underline}
.lc.s-sh .lc-k.hs .kl{opacity:.45}
.lc-k.ar{width:calc(var(--kd)*.72);height:calc(var(--kd)*.72);background:#1d1e20}
.lc-k.ar:hover{background:#2c2e31}
.lc-k.okk{width:calc(var(--kd)*.86);height:calc(var(--kd)*.86);background:#1d1e20;font:800 12px var(--f-body,system-ui)}
.lc-pg{grid-column:6;grid-row:1/3;align-self:center;display:flex;flex-direction:column;width:calc(var(--kd)*.72);height:calc(var(--kd)*1.75);border-radius:999px;background:#141516;box-shadow:inset 0 2px 1px rgba(255,255,255,.1),0 2px 3px rgba(0,0,0,.55);overflow:hidden}
.lc-pg button{all:unset;flex:1;display:grid;place-items:center;color:#e9e9ea;cursor:pointer}
.lc-pg button:hover{background:#26282b}
.lc-pg svg{width:52%;height:auto}
.lc-k i{font-family:KaTeX_Math,Georgia,"Times New Roman",serif;font-weight:400;font-size:1.15em}
.lc-k sup{font-size:.62em;line-height:0;vertical-align:.6em}
.lc-k .bx{display:inline-block;width:.6em;height:.6em;border:1.3px solid currentColor;border-radius:1px;vertical-align:-.05em}
.lc-k .bx.f{background:currentColor}
.lc-k .bx.s{width:.42em;height:.42em}
.lc-k .fr{display:inline-flex;flex-direction:column;align-items:center;gap:2px}.lc-k .fr .bx{width:.5em;height:.42em}.lc-k .fr hr{width:.8em;border:0;border-top:1.4px solid currentColor;margin:0}
.lc-k:focus-visible,.lc-pg button:focus-visible{outline:2px solid #8fb2ff;outline-offset:2px}
/* editor natural */
.lc-e{font-family:KaTeX_Main,"Times New Roman",serif;line-height:1.25}
.lc-e i{font-family:KaTeX_Math,"Times New Roman",serif;font-style:italic}
.lc-e sup{font-size:.68em;vertical-align:.55em;line-height:0}
.lc-e .e-c{display:inline-block}
.lc-e .e-op{padding:0 .12em}
.lc-e .e-E{font-size:.75em;padding:0 .05em}
.lc-e .e-fr{display:inline-flex;flex-direction:column;align-items:center;vertical-align:middle;margin:0 .12em;font-size:.94em}
.lc-e .e-fr>.e-n{padding:0 .15em .05em;border-bottom:1.5px solid currentColor;min-width:100%;text-align:center}
.lc-e .e-fr>.e-d{padding:.05em .15em 0;text-align:center}
.lc-e .e-sq{display:inline-block;position:relative;padding-left:.62em;margin-left:.04em;vertical-align:baseline}
.lc-e .e-sq::before{content:"";position:absolute;left:0;top:.08em;bottom:-.05em;width:.6em;background:currentColor;-webkit-mask:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 24' preserveAspectRatio='none'%3E%3Cpath d='M0 14.5 L2.6 13 L6 22.5 L11 0.6 L12 0.6 L12 1.8 L6.6 24 L5.4 24 L2 15.3 L0.6 16 Z'/%3E%3C/svg%3E") 0 0/100% 100% no-repeat;mask:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 24' preserveAspectRatio='none'%3E%3Cpath d='M0 14.5 L2.6 13 L6 22.5 L11 0.6 L12 0.6 L12 1.8 L6.6 24 L5.4 24 L2 15.3 L0.6 16 Z'/%3E%3C/svg%3E") 0 0/100% 100% no-repeat}
.lc-e .e-ra{display:inline-block;border-top:1.5px solid currentColor;padding:.1em .1em 0 .06em}
.lc-e .e-rt{display:inline-block;white-space:nowrap}
.lc-e .e-ix{font-size:.6em;vertical-align:.9em;margin-right:-.5em;position:relative;z-index:1}
.lc-e .e-sup{display:inline-block;font-size:.7em;vertical-align:.62em;margin-left:.02em}
.lc-e .e-lg .e-sub{display:inline-block;font-size:.7em;vertical-align:-.35em;margin-right:.05em}
.lc-e .e-abs{display:inline-block;border-left:1.5px solid currentColor;border-right:1.5px solid currentColor;padding:0 .18em;margin:0 .1em}
.lc-e .e-box{display:inline-block;min-width:.62em;height:.86em;border:1px solid currentColor;opacity:.45;vertical-align:-.12em;margin:0 .04em;border-radius:1px;position:relative}
.lc-e .e-box.on{opacity:1;border-color:var(--lc-ac);background:rgba(29,78,216,.08)}
.lc-e .e-box .e-cur{position:absolute;left:1px;top:-.08em}
.lc-e .e-cur{display:inline-block;width:0;height:1.05em;border-left:2px solid var(--lc-ac);margin:0 -1px;vertical-align:-.18em;animation:lcblink 1.06s steps(1) infinite}
.lc-e.lin{font-family:var(--f-mono,ui-monospace,monospace);font-size:.82em}
.lc-e.lin i{font-family:inherit}
@keyframes lcblink{50%{opacity:0}}
@media (prefers-reduced-motion:reduce){.lc-e .e-cur{animation:none}.lc-k:active{transform:none}}
.lc .katex{font-size:1.02em;color:inherit}
`;
function injectCSS(){ if(document.getElementById('lgdr-calc-css')) return; const s=document.createElement('style'); s.id='lgdr-calc-css'; s.textContent=CSS; document.head.appendChild(s); }

/* teclas: [etiqueta, acción, [SHIFT etiqueta, acción], [ALPHA etiqueta, acción], clase]
   Acciones: texto = se escribe; '#…' = plantilla; '@…' = tecla de control. */
/* teclas: [cara, acción, [leyenda SHIFT, acción con SHIFT] | null, clase]
   Acciones: texto = se escribe; '#…' = plantilla; '@…' = tecla de control; '!…' = función que esta calculadora no tiene (avisa).
   Distribución de la fx‑991CW (sin ALPHA: las variables van con SHIFT + 4 5 6 1 2 3 0 . ×10ˣ). */
const BX='<span class="bx"></span>', BXF='<span class="bx f"></span>', BXS='<span class="bx s"></span>';
const SV=(d,w)=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${w||2}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const IC={
  home:SV('<path d="M3.5 11 12 4l8.5 7"/><path d="M6 9.5V19h12V9.5"/>'),
  set:SV('<path d="M4 7h16M4 12h16M4 17h16"/><circle cx="9" cy="7" r="1.8" fill="currentColor"/><circle cx="15" cy="12" r="1.8" fill="currentColor"/><circle cx="8" cy="17" r="1.8" fill="currentColor"/>',1.6),
  back:SV('<path d="M9 7 4.5 11.5 9 16"/><path d="M5 11.5h9a5 5 0 0 1 0 10h-2"/>'),
  shift:SV('<path d="M12 4 5 11h4v8h6v-8h4z"/>',1.7),
  vari:SV('<path d="M3 8h9M9 5l3 3-3 3M14 16H5M8 13l-3 3 3 3"/><text x="14.5" y="13" font-size="9" font-style="italic" font-family="Georgia,serif" fill="currentColor" stroke="none">x</text>',1.5),
  fun:'<span style="font:italic 500 12.5px Georgia,serif">f(<i style="font-size:1em">x</i>)</span>',
  cat:SV('<path d="M12 6.5c-2-1.6-5-2-8-1.5v13c3-.5 6-.1 8 1.5 2-1.6 5-2 8-1.5V5c-3-.5-6-.1-8 1.5z"/><path d="M12 6.5v13"/>',1.6),
  tools:SV('<circle cx="5.5" cy="12" r="1.9" fill="currentColor"/><circle cx="12" cy="12" r="1.9" fill="currentColor"/><circle cx="18.5" cy="12" r="1.9" fill="currentColor"/>',1),
  up:SV('<path d="M6 15l6-6 6 6"/>',2.4), dn:SV('<path d="M6 9l6 6 6-6"/>',2.4), lf:SV('<path d="M15 6l-6 6 6 6"/>',2.4), rt:SV('<path d="M9 6l6 6-6 6"/>',2.4),
  pu:SV('<path d="M6 13l6-6 6 6M6 19l6-6 6 6"/>',2.2), pd:SV('<path d="M6 5l6 6 6-6M6 11l6 6 6-6"/>',2.2),
  del:SV('<path d="M9 5h11v14H9l-6-7z" fill="currentColor" stroke="none"/><path d="M12.5 9.5l5 5M17.5 9.5l-5 5" stroke="#3a3b3e" stroke-width="2"/>',1),
  fmt:'<span>FORMAT</span>'};
/* zona de arriba: [leyenda arriba, cara, acción, columna, fila, clase] */
const KTOP=[
  ['ON','','@on',1,1,'tk on'],['HOME',IC.home,'@home',2,1,'tk'],['',IC.up,'@up',4,1,'ar'],
  ['SETTINGS',IC.set,'@set',1,2,'tk'],['',IC.back,'@back',2,2,'tk'],['',IC.lf,'@left',3,2,'ar'],['','OK','@ok',4,2,'okk'],['',IC.rt,'@right',5,2,'ar'],
  ['SHIFT',IC.shift,'@shift',1,3,'tk shf'],['VARIABLE',IC.vari,'@var',2,3,'tk'],['FUNCTION',IC.fun,'@fun',3,3,'tk'],['',IC.dn,'@down',4,3,'ar'],['CATALOG',IC.cat,'@cat',5,3,'tk'],['TOOLS',IC.tools,'@tools',6,3,'tk']];
const TNAME={'@on':'Encender / borrar','@home':'HOME: menú de apps','@up':'Arriba','@set':'SETTINGS: configuración','@back':'BACK: regresar','@left':'Izquierda','@ok':'OK','@right':'Derecha','@shift':'SHIFT','@var':'VARIABLE: variables','@fun':'FUNCTION: f(x) y g(x)','@down':'Abajo','@cat':'CATALOG: catálogo de funciones','@tools':'TOOLS: herramientas'};
const KEYS6=[
  ['<i>x</i>','x',['QR','!QR'],''],
  ['<span class="fr">'+BXF+'<hr>'+BX+'</span>','#frac',['<span style="font-size:8px">□□/□</span>','!mix'],''],
  ['√'+BX,'#sqrt',['ⁿ√','#root'],''],
  [BX+'<sup>'+BXS+'</sup>','#pow',['x⁻¹','#inv'],''],
  [BX+'<sup>2</sup>','#sq',['log','log('],''],
  ['log<sub style="font-size:.55em">'+BXS+'</sub>'+BX,'#logb',['ln','ln('],'sm'],
  ['Ans','Ans',null,'sm'],
  ['sin','sin(',['sin⁻¹','sin⁻¹('],''],
  ['cos','cos(',['cos⁻¹','cos⁻¹('],''],
  ['tan','tan(',['tan⁻¹','tan⁻¹('],''],
  ['(','(',['=','='],''],
  [')',')',[',',','],'']];
const KEYS5=[
  ['7','7',['π','π'],''],['8','8',['e','e'],''],['9','9',['<i>i</i>','i'],''],['<span class="kl">'+IC.del+'</span>','@del',['INS','!INS'],''],['AC','@ac',['OFF','@off'],'sm2'],
  ['4','4',['A','A'],''],['5','5',['B','B'],''],['6','6',['C','C'],''],['×','×',null,''],['÷','÷',null,''],
  ['1','1',['D','D'],''],['2','2',['E','E'],''],['3','3',['F','F'],''],['+','+',['°′″','!DMS'],''],['−','−',['(−)','−'],''],
  ['0','0',['<i>x</i>','x'],''],['.','.',['<i>y</i>','y'],''],['×10<sup><i>x</i></sup>','ᴇ',['<i>z</i>','z'],'sm2'],[IC.fmt,'@fmt',null,'fm'],['EXE','@exe',['≈','@approx'],'sm2']];
const KNAME={'#frac':'Fracción','#sqrt':'Raíz cuadrada','#root':'Raíz n‑ésima','#sq':'Al cuadrado','#pow':'Potencia','#logb':'Logaritmo con base','#inv':'Recíproco','@del':'DEL: borrar','@ac':'AC: borrar todo','@exe':'EXE: ejecutar','@approx':'Resultado decimal','@fmt':'FORMAT: forma del resultado','@off':'Apagar (cerrar)','ᴇ':'Por diez a la','−':'Menos','×':'Por','÷':'Entre','x':'Variable x','i':'Unidad imaginaria','Ans':'Ans'};
const NOTHAVE={'!QR':'QR: esta calculadora no genera códigos QR','!mix':'Fracción mixta: aquí se usan fracciones impropias','!INS':'INS: aquí el cursor siempre inserta','!DMS':'°′″ (sexagesimal) no se usa en LGDR'};

const MEMS=['A','B','C','D','E','F','x','y','z','M'];
const OPSTART=/^(?:[+−×÷!∠]|⁻¹|#sq|#cube|#pow|#inv)$/;
const APPS=[
  {id:'calc',n:'Calcular',d:'Operaciones con números reales (historial, Ans, variables)',ic:'<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="5" y="4" width="22" height="24" rx="3"/><path d="M10 10h12M11 16h2M16 16h0M21 16h0M11 21h0M16 21h0M21 21h0" stroke-width="2.6"/><path d="M11 16h0"/></svg>'},
  {id:'cplx',n:'Complejos',d:'a+bi y r∠θ; i con SHIFT 9; ∠, arg, conj en CATALOG',ic:'<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 26h22M8 29V4"/><path d="M8 26 22 9"/><circle cx="22" cy="9" r="2.2" fill="currentColor"/><path d="M14 26a6 6 0 0 0-1.8-4.3"/></svg>'},
  {id:'eqn',n:'Ecuación',d:'Sistemas de 2–4 incógnitas, polinomios de grado 2–4 y Solver',ic:'<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 12h8M5 20h8M18 12l4 4 4-4M22 16v8"/><path d="M15 9v14"/></svg>'},
  {id:'tbl',n:'Tabla',d:'Tabla de f(x) y g(x): hasta 30 filas con las dos o 45 con una',ic:'<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="5" width="22" height="22" rx="2"/><path d="M5 11h22M13 5v22M5 17h22M5 23h22"/></svg>'}];
const NFLBL=nf=>nf.m==='fix'?'Fix '+nf.n:nf.m==='sci'?'Sci '+nf.n:'Norm '+nf.n;
const IOLBL={MM:'Natural / Natural',MD:'Natural / Decimal',LL:'Lineal / Lineal',LD:'Lineal / Decimal'};

function mount(host,opts){ opts=opts||{}; injectCSS();
  const KX=opts.katex||G.katex, SK=opts.storageKey===undefined?'lgdr-calc-v1':opts.storageKey;
  const tex=t=>{ if(KX) try{ return KX.renderToString(t,{throwOnError:false,displayMode:false,strict:'ignore',output:'html'}); }catch(e){} return escH(t); };
  /* ---------- estado guardado */
  let S={v:1,deg:true,polar:false,ans:[0,0],mem:{},hist:[],app:'calc',io:'MM',nf:{m:'norm',n:1},fn:{f:[],g:[]},
    eq:{type:'poly',n:2,P:{},M:{}},tb:{start:'1',end:'5',step:'1'},sol:{e:'',x0:'0'}};
  const load=()=>{ if(!SK) return; try{ const v=JSON.parse(localStorage.getItem(SK)||'null'); if(v&&v.v===1) S=Object.assign(S,v); }catch(e){} };
  const save=()=>{ if(!SK) return; try{ localStorage.setItem(SK,JSON.stringify(S)); }catch(e){} };
  load();
  if(!Array.isArray(S.hist)) S.hist=[]; if(!S.mem||typeof S.mem!=='object') S.mem={};
  if(!IOLBL[S.io]) S.io='MM'; if(!S.nf||!/^(norm|fix|sci)$/.test(S.nf.m)) S.nf={m:'norm',n:1};
  if(!S.fn||typeof S.fn!=='object') S.fn={f:[],g:[]}; if(!S.eq||typeof S.eq!=='object') S.eq={type:'poly',n:2,P:{},M:{}}; S.eq.P=S.eq.P||{}; S.eq.M=S.eq.M||{};
  if(!S.tb) S.tb={start:'1',end:'5',step:'1'}; if(!APPS.some(a=>a.id===S.app)) S.app='calc';
  /* coeficientes de la v1 (S.eqn.c, texto) → polinomio */
  if(S.eqn&&Array.isArray(S.eqn.c)&&!Object.keys(S.eq.P).length){ S.eqn.c.forEach((t,k)=>{ if(t&&t!=='0') S.eq.P['0,'+k]=fromText(t); }); if(S.eqn.n>=2&&S.eqn.n<=4) S.eq.n=S.eqn.n; }
  const z2a=z=>[z.re,z.im], a2z=a=>Array.isArray(a)?C(a[0],a[1]):C(0,0);
  const natIn=()=>S.io[0]==='M', natOut=()=>S.io==='MM'||S.io==='LL', linOut=()=>S.io[0]==='L';
  let fnCache={k:'',v:null};
  function funcs(){ const k=JSON.stringify(S.fn); if(fnCache.k===k) return fnCache.v; const v={};
    ['f','g'].forEach(n=>{ const r=S.fn[n]; if(r&&r.length){ try{ v[n]=parse(serRow(r).s); }catch(e){} } }); fnCache={k,v}; return v; }
  const env=()=>{ const vars={}; MEMS.forEach(k=>{ if(S.mem[k]) vars[k]=a2z(S.mem[k]); }); return {deg:S.deg,vars,ans:a2z(S.ans),funcs:funcs()}; };
  /* resultado → HTML. f = {dec, polar} (lo que pide FORMAT) */
  function fmtHTML(z,f){ f=f||{}; const pol=f.polar!=null?f.polar:(S.app==='cplx'&&S.polar);
    const o={nat:natOut()&&!f.dec,polar:pol,deg:S.deg,nf:S.nf};
    if(linOut()||!KX) return '<span class="lc-lin">'+escH(linOut()?formatLin(z,o):formatTxt(z,o))+'</span>';
    return tex(format(z,o)); }
  const txt=z=>formatTxt(z,{polar:S.app==='cplx'&&S.polar,deg:S.deg,nf:S.nf});

  /* ---------- armado */
  const root=document.createElement('div'); root.className='lc'; root.tabIndex=0; root.setAttribute('role','application'); root.setAttribute('aria-label','Calculadora científica');
  const keyBtn=(k)=>{ const [l,a,sh,cls]=k; const nm=KNAME[a]||l.replace(/<[^>]+>/g,'').replace(/\s+/g,' ').trim()||a;
    return `<div class="lc-c"><span class="lc-lg">${sh?`<span class="ks">${sh[0]}</span>`:''}</span><button type="button" class="lc-k n ${cls||''}${sh?' hs':''}" data-a="${escH(a)}"${sh?` data-s="${escH(sh[1])}"`:''} aria-label="${escH(nm)}${sh?' (SHIFT: '+escH(sh[0].replace(/<[^>]+>/g,''))+')':''}"><span class="kl">${l}</span></button></div>`; };
  const topBtn=([t,l,a,col,row,cls])=>`<div class="lc-c" style="grid-column:${col};grid-row:${row}"><span class="lc-lg"><span class="tl">${t}</span></span><button type="button" class="lc-k ${cls}" data-a="${a}" aria-label="${escH(TNAME[a]||t)}" title="${escH(TNAME[a]||t)}">${l}</button></div>`;
  root.innerHTML=`<div class="lc-hd"><span class="lc-ttl">Calculadora<b data-appn></b></span><span class="lc-hsp"></span>${opts.onClose?'<button type="button" class="lc-x" data-close aria-label="Cerrar la calculadora" title="Cerrar (Esc)"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button>':''}</div>
  <div class="lc-lcdw"><div class="lc-lcd"><div class="lc-st" data-st></div><div class="lc-scr" data-scr>
    <div class="lc-v lc-vc" data-vc><div class="lc-log" data-log></div><div class="lc-cur"><div class="lc-edl lc-e" data-ed></div><div class="lc-res"><span class="lc-rv" data-rv aria-live="polite"></span></div></div></div>
    <div class="lc-v" data-vo hidden></div></div></div></div>
  <div class="lc-bar"><button type="button" class="lc-a" data-copy hidden>Copiar</button><button type="button" class="lc-a" data-toans hidden title="Guardar en Ans">→ Ans</button><button type="button" class="lc-a pri" data-ansput hidden>→ Respuesta</button><button type="button" class="lc-a pri" data-ansall hidden title="Todas las raíces al plano">→ todas</button><span class="lc-msg" data-msg aria-live="polite"></span></div>
  <div class="lc-kp" data-kp role="group" aria-label="Teclado">
    <div class="lc-g lc-gt">${KTOP.map(topBtn).join('')}<div class="lc-pg" role="group" aria-label="Página"><button type="button" data-a="@pgup" aria-label="Página arriba" title="Página arriba">${IC.pu}</button><button type="button" data-a="@pgdn" aria-label="Página abajo" title="Página abajo">${IC.pd}</button></div></div>
    <div class="lc-g lc-g6">${KEYS6.map(keyBtn).join('').replace(/lc-k n /g,'lc-k ')}</div>
    <div class="lc-g lc-g5">${KEYS5.map(keyBtn).join('')}</div></div>`;
  host.appendChild(root);
  const $=s=>root.querySelector(s);
  const scr=$('[data-scr]'), vc=$('[data-vc]'), vo=$('[data-vo]'), edEl=$('[data-ed]'), rv=$('[data-rv]'), logEl=$('[data-log]'), st=$('[data-st]'), msgEl=$('[data-msg]');
  const bCopy=$('[data-copy]'), bAns=$('[data-toans]'), bPut=$('[data-ansput]'), bAll=$('[data-ansall]');
  if(opts.onClose) $('[data-close]').addEventListener('click',()=>opts.onClose());

  /* ---------- estado de la sesión */
  let shift=false, alpha=false, msgT=0;
  let view='calc';          /* calc · solve · eqmenu · eqn · eqedit · eqsol · tbdef · tbrng · tbl · fdef */
  const ov=[];              /* menús encima (HOME, SETTINGS, CATALOG, TOOLS, VARIABLE, FUNCTION, FORMAT) */
  const main=new Ed([]); let fresh=false, last=null, lastF=null, hsel=-1, undo=[];
  /* SOLVE */ const sEq=new Ed(fromText(S.sol.e||'')), sX0=new Ed(fromText(S.sol.x0||'0')); let sFld=0, sRes=null;
  /* Ecuación */ let eqSel=[0,0], eqEd=null, eqRes=null, eqRS=0, eqDec=false, eqMenuSel=0, eqNSel=0;
  /* Tabla */ const tF=new Ed(cloneRow(S.fn.f)), tG=new Ed(cloneRow(S.fn.g)); let tFld=0;
  const tR=[new Ed(fromText(S.tb.start)),new Ed(fromText(S.tb.end)),new Ed(fromText(S.tb.step))]; let rFld=0, tRows=null, tSel=[0,1], fdefBack=null;

  function say(t,bad){ msgEl.textContent=t; msgEl.classList.toggle('bad',!!bad); clearTimeout(msgT); msgT=setTimeout(()=>{ msgEl.textContent=''; },bad?5000:2600); }
  function errText(e){ return e.calc==='syntax'?(e.message&&!/^(syntax|Error de sintaxis)$/.test(e.message)?'Error de sintaxis: '+e.message:'Error de sintaxis'):e.calc==='math'?(e.message||'Error matemático'):e.calc==='solve'?e.message:'Error'; }

  /* ---------- teclado en pantalla */
  root.addEventListener('pointerdown',e=>{ if(e.target.closest('button,[data-k]')) e.preventDefault(); try{ root.focus({preventScroll:true}); }catch(err){} });
  $('[data-kp]').addEventListener('click',e=>{ const b=e.target.closest('[data-a]'); if(!b) return;
    let a=b.dataset.a; if(off){ key(a); return; } if(a==='@shift'){ setMod(!shift,false); return; }
    if(shift&&b.dataset.s) a=b.dataset.s;
    setMod(false,false); if(a[0]==='!'){ say(NOTHAVE[a]||'No disponible',true); if(physSh) setMod(true,false); return; } key(a); if(physSh) setMod(true,false); });
  function setMod(s,a){ shift=s; alpha=a; root.classList.toggle('s-sh',s); root.classList.toggle('s-al',a); renderSt(); }

  /* ---------- teclado físico */
  const PK={Enter:'@exe',Backspace:'@del',Delete:'@del',ArrowLeft:'@left',ArrowRight:'@right',ArrowUp:'@up',ArrowDown:'@down',Home:'@home0',End:'@end0',
    '+':'+','-':'−','*':'×','/':'#frac',':':'÷','÷':'÷','^':'#pow','(':'(',')':')',',':',',';':',','!':'!','.':'.','s':'sin(','c':'cos(','t':'tan(','l':'ln(','r':'#sqrt','p':'π','e':'e','i':'i','j':'i','x':'x','y':'y','z':'z','a':'Ans','M':'M','A':'A','B':'B','C':'C','D':'D','E':'E','F':'F','f':'f(','g':'g(','=':'='};
  /* v77: ^ también con Ctrl+Alt+{ / AltGr (latinoamericano, puede llegar como tecla muerta) o Shift+` (España) */
  root.addEventListener('keydown',e=>{ if(off) return; const ag=(e.ctrlKey&&e.altKey)||(e.getModifierState&&e.getModifierState('AltGraph'));
    if(e.key==='^'||(e.key==='Dead'&&(ag||(e.shiftKey&&e.code==='BracketLeft')))){ e.preventDefault(); e.stopPropagation(); setMod(false,false); key('#pow'); if(physSh) setMod(true,false); } },true);
  /* v77: mientras se mantiene presionado Shift en el teclado, el SHIFT de la calculadora también (2.ª función en pantalla) */
  let physSh=false;
  const shOn=()=>root.isConnected&&root.getClientRects().length>0;
  const physKD=e=>{ if(e.key==='Shift'&&!e.repeat&&!physSh&&!off&&shOn()){ physSh=true; setMod(true,false); } };
  const physKU=e=>{ if(e.key==='Shift'&&physSh){ physSh=false; setMod(false,false); } };
  const physOut=()=>{ if(physSh){ physSh=false; setMod(false,false); } };
  addEventListener('keydown',physKD,true); addEventListener('keyup',physKU,true); addEventListener('blur',physOut);
  root.addEventListener('keydown',e=>{ if(e.ctrlKey||e.metaKey||e.altKey||off) return;
    if(e.key==='Escape'){ if(ov.length||/^(solve|eqn|eqedit|eqsol|tbrng|tbl|fdef)$/.test(view)||(view==='calc'&&hsel>=0)){ e.preventDefault(); e.stopPropagation(); key('@back'); } return; }
    let a=/^[0-9]$/.test(e.key)?e.key:PK[e.key]; if(!a) return;
    if(a==='='&&!(view==='solve'&&sFld===0)) a='@exe';
    e.preventDefault(); setMod(false,false); key(a); if(physSh) setMod(true,false); });
  root.addEventListener('paste',e=>{ const t=(e.clipboardData||window.clipboardData).getData('text'); const E=curEd(); if(!t||!E) return; e.preventDefault(); prepEdit(E,'1'); fromText(t).forEach(it=>{ E.row.splice(E.i,0,it); E.i++; }); render(); });

  /* ---------- editor activo de la vista */
  function curEd(){ switch(view){ case 'calc': return main; case 'solve': return sFld?sX0:sEq; case 'eqedit': return eqEd; case 'tbdef': case 'fdef': return tFld?tG:tF; case 'tbrng': return tR[rFld]; } return null; }
  function snap(){ undo.push({j:JSON.stringify(main.root)}); if(undo.length>30) undo.shift(); }
  /* antes de escribir en el campo principal tras un resultado: un operador sigue con Ans; lo demás empieza de nuevo */
  function prepEdit(E,a){ if(E===main){ hsel=-1; if(fresh){ fresh=false; snap(); main.clear(); if(OPSTART.test(a)) main.insC('Ans'); } else snap(); } }
  function edInsert(E,a){ prepEdit(E,a); if(E.repl){ E.repl=false; E.clear(); }
    switch(a){
      case '#frac': { /* como en la calculadora: el número que va antes del cursor pasa al numerador */
        let j=E.i; while(j>0&&E.row[j-1].t==='c'&&/^[0-9.ᴇ]$/.test(E.row[j-1].v)) j--;
        if(j<E.i&&!(j>0&&E.row[j-1].t==='c'&&E.row[j-1].v==='ᴇ')){ const num=E.row.splice(j,E.i-j); E.i=j; E.insT(tpl('frac',{a:num}),'b'); } else E.insT(tpl('frac'),'a'); break; }
      case '#abs': E.insT(tpl('abs'),'a'); break;
      case '#sqrt': E.insT(tpl('sqrt'),'a'); break;
      case '#cbrt': E.insT(tpl('root',{n:[chi('3')]}),'a'); break;
      case '#root': E.insT(tpl('root'),'n'); break;
      case '#sq': E.insT(tpl('pow',{a:[chi('2')]}),null); break;
      case '#cube': E.insT(tpl('pow',{a:[chi('3')]}),null); break;
      case '#inv': E.insT(tpl('pow',{a:[chi('−'),chi('1')]}),null); break;
      case '#pow': E.insT(tpl('pow'),'a'); break;
      case '#logb': E.insT(tpl('logb'),'n'); break;
      case '#10x': E.insC('1'); E.insC('0'); E.insT(tpl('pow'),'a'); break;
      case '#ex': E.insC('e'); E.insT(tpl('pow'),'a'); break;
      case ')': { const n=E.row[E.i]; if(n&&n.t==='c'&&n.v===')') E.i++; else E.insC(')'); break; }
      default: E.insC(a); if(/\($/.test(a)){ E.insC(')'); E.i--; } } }
  /* teclas de edición comunes; devuelve true si las usó */
  function edKey(E,a){ if(!E) return false; if(a[0]==='@'&&a!=='@exe') E.repl=false;
    if(a==='@left'||a==='@right'){ if(E===main&&fresh){ fresh=false; hsel=-1; a==='@left'?main.end():main.home(); return true; } a==='@left'?E.left():E.right(); return true; }
    if(a==='@home0'){ E.home(); return true; } if(a==='@end0'){ E.end(); return true; }
    if(a==='@del'){ if(E===main){ hsel=-1; if(fresh){ fresh=false; main.end(); } snap(); }
      const r=E.row, i=E.i; if(i>0&&i<r.length&&r[i-1].t==='c'&&/\($/.test(r[i-1].v)&&r[i].t==='c'&&r[i].v===')') r.splice(i,1);
      E.del(); return true; }
    if(a[0]!=='@'){ edInsert(E,a); return true; }
    return false; }

  /* ---------- despacho de teclas */
  /* AC / ON: borran la pantalla y los resultados (historial); las variables y Ans se quedan, como en la calculadora */
  function clearAll(){ snap(); main.clear(); fresh=false; last=null; hsel=-1; errMsg=''; if(S.hist.length){ S.hist=[]; histDirty=true; save(); } }
  let off=false;
  function key(a){
    if(off){ if(a==='@on'){ off=false; root.classList.remove('lc-off'); goApp(S.app); render(); say('Encendida'); } return; }
    if(a==='@off'){ ovAll(); setMod(false,false); clearAll(); undo.length=0; off=true; root.classList.add('lc-off'); render(); clearTimeout(msgT); msgEl.textContent=''; return; }
    if(a==='@home'){ openHome(); return render(); }
    if(a==='@set'){ openSettings(); return render(); }
    if(a==='@cat'){ openCatalog(); return render(); }
    if(a==='@var'){ openVar(false); return render(); }
    if(a==='@fun'){ openFun(); return render(); }
    if(a==='@tools'){ openTools(); return render(); }
    if(a==='@on'){ ovAll(); if(view==='calc') clearAll(); else goApp(S.app); return render(); }
    if(a==='@pgup'||a==='@pgdn'){ const d=a==='@pgup'?-1:1, o=ov[ov.length-1];
      if(o&&!o.home){ o.sel=Math.max(0,Math.min(o.items.length-1,o.sel+5*d)); return render(); }
      if(view==='tbl'&&tRows){ tSel=[Math.max(0,Math.min(tRows.length-1,tSel[0]+8*d)),tSel[1]]; return render(); }
      scr.scrollBy({top:d*scr.clientHeight*.8}); return; }
    if(ov.length){ ovKey(a); return render(); }
    if(a==='@fmt'){ openFormat(); return render(); }
    if(a==='@m+'||a==='@m-'){ memAdd(a==='@m+'?1:-1); return render(); }
    if(a==='i'&&S.app==='calc'&&view==='calc'){ say('Para usar i abre la app Complejos (HOME)',true); return; }
    VK[view](a); render(); }

  /* ---------- Calcular / Complejos */
  const VK={};
  VK.calc=a=>{
    if(a==='@up'||a==='@down'){ if(!fresh&&hsel<0&&main.vert(a==='@up'?-1:1)) return; histMove(a==='@up'?-1:1); return; }
    if((a==='@ok'||a==='@exe')&&hsel>=0){ const h=S.hist[hsel]; if(h){ snap(); main.set(h.n?cloneRow(h.n):fromText(h.e)); fresh=false; hsel=-1; } return; }
    if(a==='@exe'||a==='@approx'){ equals(a==='@approx'); return; }
    if(a==='@ok'){ return; }
    if(a==='@ac'){ clearAll(); return; }
    if(a==='@back'){ if(hsel>=0){ hsel=-1; return; } if(fresh){ fresh=false; main.end(); } return; }
    edKey(main,a); };
  function histMove(d){ const H=histShown(); if(!H.length) return; let k=hsel<0?(d<0?H.length:-1):H.indexOf(hsel);
    k+=d; if(k>=H.length){ hsel=-1; return; } if(k<0) k=0; hsel=H[k]; }
  const histShown=()=>{ const n=S.hist.length; const out=[]; for(let k=Math.max(0,n-25);k<(fresh&&last?n-1:n);k++) out.push(k); return out; };
  function equals(approx){ const E=main; if(E.empty()){ return; }
    const {s}=E.ser(); hsel=-1;
    try{ const z=tidy(evaluate(parse(s),env()));
      if(S.app==='calc'&&z.im!==0) throw CalcErr('math','Error matemático: el resultado es complejo (usa la app Complejos)');
      last=z; lastF=approx?{dec:true}:null; S.ans=z2a(z); S.hist.push({e:s,n:E.json(),r:z2a(z),a:S.app}); if(S.hist.length>40) S.hist.splice(0,S.hist.length-40); save();
      fresh=true; histDirty=true; }
    catch(e){ if(!e.calc) throw e; last=null; fresh=false; errMsg=errText(e); if(e.pos!=null) E.at(e.pos); } }
  var errMsg='', histDirty=true;
  function memAdd(sg){ const z=pick(); if(!z){ say('Primero calcula algo',true); return; } const m=a2z(S.mem.M); S.mem.M=z2a(sg>0?add(m,z):sub(m,z)); save(); say('M = '+txt(a2z(S.mem.M))); }

  /* ---------- SOLVE (TOOLS de Calcular) */
  VK.solve=a=>{ const E=sFld?sX0:sEq;
    if(a==='@up'||a==='@down'){ if(E.vert(a==='@up'?-1:1)) return; sFld=sFld?0:1; if(sFld) sX0.repl=true; return; }
    if(a==='@exe'||a==='@ok'){ if(sFld===0){ sFld=1; sX0.repl=true; return; } doSolve(); return; }
    if(a==='@ac'){ E.clear(); sRes=null; return; }
    if(a==='@back'){ view=S.app==='eqn'?'eqmenu':'calc'; return; }
    if(edKey(E,a)){ sRes=null; S.sol={e:sEq.ser().s.replace(/□/g,''),x0:sX0.ser().s.replace(/□/g,'')}; save(); } };
  function doSolve(){ const src=sEq.ser().s; if(sEq.empty()){ say('Escribe una ecuación con x',true); sFld=0; return; }
    if(!/x/.test(src.replace(/exp|Ans/g,''))){ say('La ecuación debe tener la variable x',true); sFld=0; return; }
    let x0=0; try{ if(!sX0.empty()){ const z=evaluate(parse(sX0.ser().s),env()); x0=z.re; } }catch(e){ say('x inicial: '+errText(e),true); return; }
    try{ sRes=solve(src,env(),x0); S.mem.x=[sRes.x,0]; S.ans=[sRes.x,0]; save(); }
    catch(e){ if(!e.calc) throw e; sRes=null; say(errText(e),true); } }

  /* ---------- Ecuación */
  const LET='abcde', UNK='xyzt';
  const eqKey=()=>S.eq.type==='poly'?'P':'M';
  const cell=(r,k)=>S.eq[eqKey()][r+','+k];
  const eqDims=()=>S.eq.type==='poly'?[1,S.eq.n+1]:[S.eq.n,S.eq.n+1];
  function cellVal(r,k){ const c=cell(r,k); if(!c||!c.length) return C(0,0); return evaluate(parse(serRow(c).s),env()); }
  function cellTxt(r,k){ const c=cell(r,k); if(!c||!c.length) return '0'; try{ const z=tidy(cellVal(r,k)); const s=formatTxt(z,{nf:{m:'norm',n:1}}); return s.length>9?(+z.re.toPrecision(5)+(z.im?'…':'')):s; }catch(e){ return '?'; } }
  VK.eqmenu=a=>{ if(a==='@up'){ eqMenuSel=(eqMenuSel+2)%3; return; } if(a==='@down'){ eqMenuSel=(eqMenuSel+1)%3; return; }
    if(/^[123]$/.test(a)){ eqMenuSel=+a-1; a='@ok'; }
    if(a==='@ok'||a==='@exe'||a==='@right'){ if(eqMenuSel===2){ view='solve'; sFld=0; sRes=null; return; } S.eq.type=eqMenuSel?'poly':'sim'; save(); eqNSel=Math.max(0,Math.min(2,S.eq.n-2)); view='eqn'; } };
  VK.eqn=a=>{ if(a==='@up'){ eqNSel=(eqNSel+2)%3; return; } if(a==='@down'){ eqNSel=(eqNSel+1)%3; return; }
    if(/^[234]$/.test(a)){ eqNSel=+a-2; a='@ok'; }
    if(a==='@ok'||a==='@exe'||a==='@right'){ S.eq.n=eqNSel+2; save(); eqSel=[0,0]; eqEd=null; eqRes=null; view='eqedit'; return; }
    if(a==='@back'||a==='@left'){ view='eqmenu'; } };
  function eqCommit(){ if(!eqEd) return true; const [r,k]=eqSel;
    if(!eqEd.empty()){ try{ evaluate(parse(eqEd.ser().s),env()); }catch(e){ if(!e.calc) throw e; say('Coeficiente: '+errText(e),true); if(e.pos!=null) eqEd.at(e.pos); return false; } }
    S.eq[eqKey()][r+','+k]=eqEd.json(); if(!eqEd.root.length) delete S.eq[eqKey()][r+','+k]; save(); eqEd=null; return true; }
  function eqMove(dr,dk){ const [R,K]=eqDims(); let [r,k]=eqSel; k+=dk; r+=dr;
    if(k>=K){ k=0; r++; } if(k<0){ k=K-1; r--; } if(r>=R) r=0; if(r<0) r=R-1; eqSel=[r,k]; }
  VK.eqedit=a=>{
    if(eqEd){ if(a==='@exe'||a==='@ok'){ if(eqCommit()) eqMove(0,1); return; }
      if(a==='@up'||a==='@down'){ if(eqEd.vert(a==='@up'?-1:1)) return; if(eqCommit()) eqMove(a==='@up'?-1:1,0); return; }
      if(a==='@ac'){ eqEd.clear(); return; } if(a==='@back'){ eqEd=null; return; }
      edKey(eqEd,a); return; }
    if(a==='@left'){ eqMove(0,-1); return; } if(a==='@right'){ eqMove(0,1); return; }
    if(a==='@up'){ eqMove(-1,0); return; } if(a==='@down'){ eqMove(1,0); return; }
    if(a==='@exe'){ eqSolve(); return; }
    if(a==='@ok'){ eqEd=new Ed(cloneRow(cell(...eqSel)||[])); return; }
    if(a==='@ac'){ S.eq[eqKey()]={}; save(); say('Coeficientes en 0'); return; }
    if(a==='@back'){ view='eqn'; return; }
    if(a==='@del'){ eqEd=new Ed(cloneRow(cell(...eqSel)||[])); eqEd.del(); return; }
    if(a[0]!=='@'){ eqEd=new Ed([]); edKey(eqEd,a); } };
  function eqSolve(){ if(!eqCommit()) return; const [R,K]=eqDims(); let M=[];
    try{ for(let r=0;r<R;r++){ const row=[]; for(let k=0;k<K;k++){ try{ row.push(tidy(cellVal(r,k))); }catch(e){ e.cell=[r,k]; throw e; } } M.push(row); } }
    catch(e){ if(!e.calc) throw e; eqSel=e.cell||eqSel; say(errText(e),true); return; }
    try{ if(S.eq.type==='poly'){ if(M[0][0].re===0&&M[0][0].im===0){ say('El coeficiente a no puede ser 0',true); eqSel=[0,0]; return; }
        let roots=polyRoots(M[0]); const all=roots.length; if(S.eq.cx===false) roots=roots.filter(z=>z.im===0);
        const extra=[]; if(M[0].every(z=>z.im===0)){ const c=M[0].map(z=>z.re);
          if(S.eq.n===2){ const w=c[0]>0?'mín':'máx'; extra.push({l:'x '+w,z:C(-c[1]/(2*c[0]),0)},{l:'y '+w,z:C(c[2]-c[1]*c[1]/(4*c[0]),0)}); }
          else if(S.eq.n===3){ const [a,b,cc,d]=c, Dd=4*b*b-12*a*cc;
            if(Dd>0){ const q=Math.sqrt(Dd), f=x=>((a*x+b)*x+cc)*x+d; [(-2*b+q)/(6*a),(-2*b-q)/(6*a)].map(x=>({x,mx:6*a*x+2*b<0})).sort((u,v)=>v.mx-u.mx).forEach(({x,mx})=>{ const w=mx?'máx':'mín'; extra.push({l:'x '+w,z:C(x,0)},{l:'y '+w,z:C(f(x),0)}); }); }
            else extra.push({l:'Sin máx./mín. local',z:null}); } }
        eqRes={roots,exact:S.eq.n===2&&roots.length===all?quadExact(M[0]):null,extra,noReal:!roots.length}; }
      else { const r=linsolve(M.map(x=>x.slice(0,-1)),M.map(x=>x[x.length-1])); eqRes=r.x?{roots:r.x}:{none:r.none,inf:r.inf}; }
      eqRS=0; eqDec=false; if(eqRes.roots&&eqRes.roots.length) S.ans=z2a(eqRes.roots[0]); save(); view='eqsol'; }
    catch(e){ if(!e.calc) throw e; say(errText(e),true); } }
  const eqList=()=>eqRes&&eqRes.roots?eqRes.roots.map((z,k)=>({l:S.eq.type==='poly'?'x'+(k+1):UNK[k],z,k})).concat((eqRes.extra||[]).filter(e=>e.z)):[];
  VK.eqsol=a=>{ const n=eqList().length;
    if(a==='@up'){ eqRS=Math.max(0,eqRS-1); return; } if(a==='@down'){ eqRS=Math.min(n-1,eqRS+1); return; }
    if(a==='@exe'){ if(eqRS<n-1) eqRS++; else view='eqedit'; return; }
    if(a==='@approx'){ eqDec=!eqDec; return; }
    if(a==='@back'){ if(eqRS>0) eqRS--; else view='eqedit'; return; }
    if(a==='@ac'||a==='@left'){ view='eqedit'; return; }
    if(a==='@ok'&&n){ const it=eqList()[eqRS]; S.ans=z2a(it.z); save(); say(it.l+' → Ans'); } };

  /* ---------- Tabla de función (y definir f/g desde FUNCTION) */
  function saveFn(){ S.fn={f:tF.json(),g:tG.json()}; save(); }
  VK.tbdef=VK.fdef=a=>{ const E=tFld?tG:tF;
    if(a==='@up'||a==='@down'){ if(E.vert(a==='@up'?-1:1)) return; tFld=tFld?0:1; return; }
    if(a==='@exe'||a==='@ok'){ if(!checkFn(E)) return; saveFn(); if(tFld===0){ tFld=1; return; } if(view==='fdef'){ view=fdefBack||'calc'; say('f(x) y g(x) guardadas'); return; } if(tF.empty()&&tG.empty()){ say('Define f(x) o g(x)',true); tFld=0; return; } view='tbrng'; rFld=0; tR[0].repl=true; return; }
    if(a==='@ac'){ E.clear(); saveFn(); return; }
    if(a==='@back'){ saveFn(); if(view==='fdef') view=fdefBack||'calc'; return; }
    if(edKey(E,a)) saveFn(); };
  function checkFn(E){ if(E.empty()) return true; const s=E.ser().s; if(/[fg]\(/.test(s)){ say('f(x) y g(x) no pueden usar f( ni g(',true); return false; }
    try{ parse(s); return true; }catch(e){ if(!e.calc) throw e; say(errText(e),true); if(e.pos!=null) E.at(e.pos); return false; } }
  VK.tbrng=a=>{ const E=tR[rFld];
    if(a==='@up'){ if(!E.vert(-1)){ rFld=(rFld+2)%3; tR[rFld].repl=true; } return; } if(a==='@down'){ if(!E.vert(1)){ rFld=(rFld+1)%3; tR[rFld].repl=true; } return; }
    if(a==='@exe'||a==='@ok'){ if(rFld<2){ rFld++; tR[rFld].repl=true; return; } makeTable(); return; }
    if(a==='@ac'){ E.clear(); return; }
    if(a==='@back'){ view='tbdef'; return; }
    if(edKey(E,a)) S.tb={start:tR[0].ser().s.replace(/□/g,''),end:tR[1].ser().s.replace(/□/g,''),step:tR[2].ser().s.replace(/□/g,''),type:S.tb.type||'fg'}, save(); };
  function makeTable(){ let v;
    try{ v=tR.map((E,k)=>{ try{ const z=evaluate(parse(E.ser().s),env()); if(z.im!==0) throw MATH('Debe ser real'); return z.re; }catch(e){ e.f=k; throw e; } }); }
    catch(e){ if(!e.calc) throw e; rFld=e.f; say(['Inicio','Fin','Paso'][e.f]+': '+errText(e),true); return; }
    const [a,b,h]=v; if(h===0||(b-a)/h<-1e-9){ say('Paso inválido: con este paso no se llega del inicio al fin',true); rFld=2; return; }
    const F=funcs(), ty=S.tb.type||'fg', uf=ty!=='g'&&!!F.f, ug=ty!=='f'&&!!F.g;
    if(!uf&&!ug){ say(ty==='g'?'Define g(x) (TOOLS › Definir)':ty==='f'?'Define f(x) (TOOLS › Definir)':'Define f(x) o g(x)',true); view='tbdef'; return; }
    const mx=uf&&ug?30:45, n=Math.floor((b-a)/h+1e-9)+1; if(n>mx){ say(`Son ${n} filas: el máximo es ${mx} (sube el paso${uf&&ug?' o usa una sola función':''})`,true); rFld=2; return; }
    tCols=[0].concat(uf?[1]:[]).concat(ug?[2]:[]);
    const E0=env(), ev=(fn,x)=>{ if(!F[fn]) return null; try{ const z=tidy(evaluate(F[fn],Object.assign({},E0,{vars:Object.assign({},E0.vars,{x:C(x,0)})}))); return z; }catch(e){ return 'err'; } };
    tRows=[]; for(let k=0;k<n;k++){ const x=+(a+k*h).toPrecision(12); tRows.push([C(x,0),ev('f',x),ev('g',x)]); }
    tSel=[0,tCols[1]]; view='tbl'; }
  let tCols=[0,1];
  VK.tbl=a=>{ if(!tRows) { view='tbdef'; return; } const cols=tCols;
    let [r,c]=tSel; const ci=Math.max(0,cols.indexOf(c));
    if(a==='@up') r=Math.max(0,r-1); else if(a==='@down') r=Math.min(tRows.length-1,r+1);
    else if(a==='@left') c=cols[Math.max(0,ci-1)]; else if(a==='@right') c=cols[Math.min(cols.length-1,ci+1)];
    else if(a==='@back'||a==='@ac'){ view='tbrng'; return; }
    else if(a==='@ok'||a==='@exe'){ const z=tCell(); if(z){ S.ans=z2a(z); save(); say('→ Ans'); } return; }
    tSel=[r,c]; };
  const tCell=()=>{ if(!tRows) return null; const v=tRows[tSel[0]]&&tRows[tSel[0]][tSel[1]]; return v&&v!=='err'?v:null; };

  /* ---------- menús (lista genérica) */
  function openList(title,items,sel,extra){ ov.push(Object.assign({title,items,sel:sel||0},extra||{})); }
  function closeOv(){ ov.pop(); }
  function ovKey(a){ const o=ov[ov.length-1];
    if(o.home){ const n=APPS.length; if(a==='@left') o.sel=(o.sel+n-1)%n; else if(a==='@right') o.sel=(o.sel+1)%n; else if(a==='@up') o.sel=Math.max(0,o.sel-3); else if(a==='@down') o.sel=Math.min(n-1,o.sel+3);
      else if(/^[1-4]$/.test(a)){ o.sel=+a-1; goApp(APPS[o.sel].id); } else if(a==='@ok'||a==='@exe') goApp(APPS[o.sel].id); else if(a==='@back') closeOv(); else if(a==='@ac') ovAll(); return; }
    const n=o.items.length;
    if(a==='@up') o.sel=(o.sel+n-1)%n; else if(a==='@down') o.sel=(o.sel+1)%n;
    else if(a==='@ok'||a==='@exe'||a==='@right') act(o,o.sel);
    else if(a==='@back'||a==='@left') closeOv(); else if(a==='@ac') ovAll();
    else if(/^[1-9]$/.test(a)&&+a<=n) act(o,+a-1); }
  function act(o,k){ const it=o.items[k]; if(!it||it.dis){ if(it&&it.dis) say(it.dis,true); return; } o.sel=k; it.act(); }
  function ovAll(){ ov.length=0; }
  function goApp(id){ ovAll(); S.app=id; save(); hsel=-1;
    if(id==='calc'||id==='cplx'){ view='calc'; histDirty=true; }
    else if(id==='eqn'){ view='eqmenu'; eqMenuSel=S.eq.type==='poly'?1:0; }
    else { view='tbdef'; tFld=0; } }
  function openHome(){ if(ov.length&&ov[ov.length-1].home){ closeOv(); return; } ovAll(); ov.push({home:true,sel:Math.max(0,APPS.findIndex(a=>a.id===S.app))}); }
  function openSettings(){ ovAll();
    const items=[
      {l:'Unidad de ángulo',r:()=>S.deg?'Grados (D)':'Radianes (R)',act:()=>choose('Unidad de ángulo',[['Grados (D)',true],['Radianes (R)',false]],()=>S.deg,v=>{ S.deg=v; })},
      {l:'Entrada / salida',r:()=>IOLBL[S.io],act:()=>choose('Entrada / salida',Object.keys(IOLBL).map(k=>[IOLBL[k]+(k==='MM'?' (como libro)':''),k]),()=>S.io,v=>{ S.io=v; histDirty=true; })},
      {l:'Formato de número',r:()=>NFLBL(S.nf),act:()=>choose('Formato de número',[['Norm 1  (científica si < 0.01)','n1'],['Norm 2  (científica si < 10⁻⁹)','n2'],['Fix  (decimales fijos)','fix'],['Sci  (cifras significativas)','sci']],()=>S.nf.m==='norm'?'n'+S.nf.n:S.nf.m,v=>{
        if(v==='n1'||v==='n2'){ S.nf={m:'norm',n:+v[1]}; histDirty=true; return; }
        const L=v==='fix'?[0,1,2,3,4,5,6,7,8,9]:[1,2,3,4,5,6,7,8,9,10];
        choose(v==='fix'?'Fix: número de decimales':'Sci: cifras significativas',L.map(n=>[String(n),n]),()=>S.nf.m===v?(S.nf.n||10):-1,n=>{ S.nf={m:v,n:v==='sci'&&n===10?0:n}; histDirty=true; },2); return 'keep'; })},
      {l:'Resultado complejo',r:()=>S.polar?'r∠θ':'a+bi',act:()=>choose('Resultado complejo',[['a+bi',false],['r∠θ',true]],()=>S.polar,v=>{ S.polar=v; histDirty=true; })},
      {l:'Restablecer configuración',r:()=>'',act:()=>{ S.deg=true; S.io='MM'; S.nf={m:'norm',n:1}; S.polar=false; save(); histDirty=true; ovAll(); say('Configuración inicial'); }}];
    openList('Configuración de cálculo',items); }
  function choose(title,opts2,get,set,closeN){ const cur=get(); openList(title,opts2.map(([l,v])=>({l,r:()=>v===cur?'●':'',act:()=>{ const keep=set(v); save(); if(keep!=='keep') for(let k=0;k<(closeN||1);k++) closeOv(); }})),Math.max(0,opts2.findIndex(x=>x[1]===cur))); }
  function insertAny(t){ ovAll(); const E=curEd(); if(!E){ say('Aquí no se puede escribir',true); return; } if(t==='i'&&S.app==='calc'){ say('Para usar i abre la app Complejos (HOME)',true); return; } edKey(E,t); }
  function openCatalog(){ ovAll();
    const it=(l,t)=>({l,r:()=>'',act:()=>insertAny(t)}), cats=[];
    if(S.app==='cplx') cats.push(['Complejos',[it('i  unidad imaginaria','i'),it('∠  ángulo (r∠θ)','∠'),it('Argumento  arg(','arg('),it('Conjugado  conj(','conj('),it('Parte real  Re(','Re('),it('Parte imaginaria  Im(','Im(')]]);
    cats.push(['Análisis de funciones',[it('logₐb  logaritmo con base','#logb'),it('log  base 10','log('),it('ln  logaritmo natural','ln('),it('f(  función definida','f('),it('g(  función definida','g(')]],
      ['Probabilidad',[it('x!  factorial','!')]],
      ['Cálculo numérico',[it('Abs  valor absoluto','#abs')]],
      ['Hiperbólicas / trig.',['sinh','cosh','tanh','sinh⁻¹','cosh⁻¹','tanh⁻¹','sin','cos','tan','sin⁻¹','cos⁻¹','tan⁻¹'].map(f=>it(f,f+'('))],
      ['Otros',[it('Ans','Ans'),it('π','π'),it('e','e'),it('√  raíz cuadrada','#sqrt'),it('ˣ√  raíz n‑ésima','#root'),it('∛  raíz cúbica','#cbrt'),it('⁻¹  recíproco','#inv'),it('²  cuadrado','#sq'),it('³  cubo','#cube'),it('^(  potencia','#pow'),it('eˣ','#ex'),it('10ˣ','#10x'),it('(−)  negativo','−'),it(',  coma',','),it('(','('),it(')',')'),it('=  (para Solver)','=')]]);
    openList('Catálogo',cats.map(([n,items])=>({l:n,r:()=>'▶',act:()=>openList(n,items)}))); }
  function openVar(sto){ ovAll(); const z=sto?pick():null; if(sto&&!z){ say('No hay un resultado para guardar',true); }
    const items=MEMS.map(k=>({l:k,r:()=>S.mem[k]?txt(a2z(S.mem[k])):'0',act:()=>{ const o=ov[ov.length-1];
      if(o.sto){ const v=pick(); if(!v){ say('No hay un resultado para guardar',true); return; } S.mem[k]=z2a(v); save(); ovAll(); say(txt(v)+' → '+k); }
      else insertAny(k); }}));
    items.push({l:'Guardar el resultado (STO) / Recuperar',r:()=>'⇄',act:()=>{ const o=ov[ov.length-1]; o.sto=!o.sto; o.title=o.sto?'Guardar en…':'Variables · recuperar'; }});
    items.push({l:'Borrar todas las variables',r:()=>'',act:()=>{ S.mem={}; save(); ovAll(); say('Variables borradas'); }});
    openList(sto?'Guardar en…':'Variables · recuperar',items,0,{sto:!!(sto&&z)}); }
  function openFun(){ ovAll(); const pv=n=>S.fn[n].length?serRow(S.fn[n]).s:'sin definir';
    openList('Funciones f(x) y g(x)',[
      {l:'Escribir f(…)',r:()=>pv('f'),act:()=>insertAny('f(')},
      {l:'Escribir g(…)',r:()=>pv('g'),act:()=>insertAny('g(')},
      {l:'Definir f(x) y g(x)',r:()=>'▶',act:()=>{ ovAll(); if(S.app==='tbl'){ view='tbdef'; } else { fdefBack=view==='fdef'?fdefBack:view; view='fdef'; } tF.set(cloneRow(S.fn.f)); tG.set(cloneRow(S.fn.g)); tFld=0; }}]); }
  function openTools(){ ovAll(); const L=[];
    if(view==='solve'){ L.push({l:'Volver al menú de Ecuación',r:()=>'',act:()=>{ ovAll(); view='eqmenu'; }}); }
    else if(view==='calc'){
      L.push({l:'Deshacer',r:()=>'',act:()=>{ ovAll(); if(view!=='calc') view='calc'; const u=undo.pop(); if(!u){ say('Nada que deshacer',true); return; } main.set(JSON.parse(u.j)); fresh=false; }});
      L.push({l:'Sumar a la memoria (M+)',r:()=>'',act:()=>{ ovAll(); memAdd(1); }},{l:'Restar de la memoria (M−)',r:()=>'',act:()=>{ ovAll(); memAdd(-1); }});
      L.push({l:'Borrar historial',r:()=>'',act:()=>{ S.hist=[]; save(); histDirty=true; hsel=-1; ovAll(); say('Historial borrado'); }});
      }
    else if(S.app==='eqn'){ L.push({l:'Tipo de ecuación',r:()=>'▶',act:()=>{ ovAll(); eqEd=null; view='eqmenu'; }},
      {l:'Grado / incógnitas',r:()=>'▶',act:()=>{ ovAll(); eqEd=null; eqNSel=S.eq.n-2; view='eqn'; }},
      {l:'Borrar coeficientes',r:()=>'',act:()=>{ S.eq[eqKey()]={}; save(); eqEd=null; ovAll(); view='eqedit'; say('Coeficientes en 0'); }},
      {l:'Raíces complejas',r:()=>S.eq.cx===false?'No':'Sí',act:()=>{ S.eq.cx=S.eq.cx===false; save(); ovAll(); if(view==='eqsol') eqSolve(); say('Raíces complejas: '+(S.eq.cx===false?'No':'Sí')); }}); }
    else { L.push({l:'Definir f(x) y g(x)',r:()=>'▶',act:()=>{ ovAll(); view=S.app==='tbl'?'tbdef':'fdef'; tFld=0; }});
      if(S.app==='tbl') L.push({l:'Rango de la tabla',r:()=>'▶',act:()=>{ ovAll(); view='tbrng'; rFld=0; }},
        {l:'Tipo de tabla',r:()=>({fg:'f(x) y g(x)',f:'Solo f(x)',g:'Solo g(x)'})[S.tb.type||'fg'],act:()=>choose('Tipo de tabla',[['f(x) y g(x)  (máx. 30 filas)','fg'],['Solo f(x)  (máx. 45 filas)','f'],['Solo g(x)  (máx. 45 filas)','g']],()=>S.tb.type||'fg',v=>{ S.tb.type=v; if(view==='tbl') makeTable(); },2)}); }
    openList('Herramientas',L); }
  function openFormat(){ const z=pick(); if(!z){ say('FORMAT cambia la forma de un resultado',true); return; }
    const set=f=>{ ovAll(); if(view==='calc'){ lastF=f; } else if(view==='eqsol'){ eqDec=!!f.dec; } else fmtSel=f; };
    const L=[{l:'Estándar',r:()=>'',act:()=>set({})},{l:'Decimal',r:()=>'',act:()=>set({dec:true})}];
    if(S.app==='cplx'||z.im!==0) L.push({l:'Rectangular  a+bi',r:()=>'',act:()=>set({polar:false})},{l:'Polar  r∠θ',r:()=>'',act:()=>set({polar:true})});
    openList('FORMAT',L); }
  let fmtSel=null;

  /* lo que está seleccionado: resultado, raíz, x de SOLVE o celda de la tabla */
  function pick(){ switch(view){
    case 'calc': return fresh&&last?last:(hsel>=0&&S.hist[hsel]?a2z(S.hist[hsel].r):null);
    case 'solve': return sRes?C(sRes.x,0):null;
    case 'eqsol': { const it=eqList()[eqRS]; return it?it.z:null; }
    case 'tbl': return tCell(); }
    return null; }

  /* ---------- dibujo */
  const appName=()=>APPS.find(a=>a.id===S.app).n;
  function renderSt(){ const m=S.mem.M&&(S.mem.M[0]||S.mem.M[1]);
    st.innerHTML=`${shift?'<span class="sh">S</span>':''}${alpha?'<span class="al">A</span>':''}<span class="on">${S.deg?'D':'R'}</span><span>${natIn()?'Math':'Line'}</span>${S.nf.m!=='norm'?'<span class="on">'+NFLBL(S.nf).toUpperCase()+'</span>':''}${S.app==='cplx'?'<span>'+(S.polar?'r∠θ':'a+bi')+'</span>':''}${m?'<span class="on">M</span>':''}<span class="app">${appName()}</span>`;
    $('[data-appn]').textContent='· '+appName(); root.classList.toggle('app-calc',S.app==='calc'); }
  const EH=(E,on)=>`<span class="lc-e${natIn()?'':' lin'}">${edHTML(E.root,on?E:null,!natIn(),on?REG:null)}</span>`;
  let REG=[], REGED=null;
  function render(){ REG=[]; REGED=curEd(); renderSt();
    const o=ov[ov.length-1];
    if(o){ vc.hidden=true; vo.hidden=false; vo.innerHTML=o.home?homeHTML(o):listHTML(o); bar(); keepSel(); return; }
    if(view==='calc'){ vc.hidden=false; vo.hidden=true; renderCalc(); bar(); return; }
    vc.hidden=true; vo.hidden=false; vo.innerHTML=VH[view](); bar(); keepSel(); }
  function keepSel(){ const s=vo.querySelector('.sel,.lc-fld.sel'); if(s) s.scrollIntoView({block:'nearest'}); }
  function homeHTML(o){ return `<div class="lc-home">${APPS.map((a,k)=>`<button type="button" class="lc-app${k===o.sel?' sel':''}" data-oi="${k}">${a.ic}<span>${a.n}</span></button>`).join('')}</div><div class="lc-hint"><b>${APPS[o.sel].n}:</b> ${APPS[o.sel].d}<br>◀ ▶ ▲ ▼ y OK · BACK regresa</div>`; }
  function listHTML(o){ return `<div class="lc-ttl2">${escH(o.title)}</div>`+o.items.map((it,k)=>`<button type="button" class="lc-li${k===o.sel?' sel':''}" data-oi="${k}"${it.dis?' aria-disabled="true"':''}><span class="n">${k<9?k+1+':':''}</span><span>${escH(it.l)}</span><span class="r">${escH(it.r?it.r():'')}</span></button>`).join('')+`<div class="lc-hint">▲ ▼ y OK (o el número) · BACK para regresar</div>`; }
  scr.addEventListener('click',e=>{ const b=e.target.closest('[data-oi]'); if(b&&ov.length){ const o=ov[ov.length-1]; if(o.home){ o.sel=+b.dataset.oi; goApp(APPS[o.sel].id); } else act(o,+b.dataset.oi); render(); return; }
    const c=e.target.closest('[data-v]'); if(c){ tapView(c.dataset.v); render(); } });
  /* tocar dentro de una fórmula pone el cursor ahí */
  scr.addEventListener('click',e=>{ if(view==='calc'&&!ov.length&&fresh&&e.target.closest('[data-ed]')){ fresh=false; hsel=-1; main.end(); render(); e.stopPropagation(); return; }
    const t=e.target.closest('[data-k]'); if(!t||!REGED) return; const id=+t.dataset.k; if(!(id>=0)||!REG[id]) return;
    const [row,k]=REG[id]; const r=t.getBoundingClientRect(); const after=row.length&&k<row.length&&(row[k].t==='c')&&e.clientX>r.left+r.width/2;
    if(REGED===main){ if(fresh){ fresh=false; } hsel=-1; }
    REGED.row=row; REGED.i=row.length?k+(after?1:0):0; render(); e.stopPropagation(); },true);
  function tapView(v){ const [k,a,b]=v.split(':');
    if(k==='h'){ const i=+a; if(i===hsel){ const h=S.hist[i]; snap(); main.set(h.n?cloneRow(h.n):fromText(h.e)); fresh=false; hsel=-1; } else hsel=i; }
    else if(k==='hr'){ const h=S.hist[+a]; if(h){ const E=main; if(fresh||E.empty()){ prepEdit(E,'1'); } else snap(); fromText(plain(a2z(h.r),true)).forEach(it=>{ E.row.splice(E.i,0,it); E.i++; }); hsel=-1; } }
    else if(k==='sf'){ if(+a&&!sFld) sX0.repl=true; sFld=+a; } else if(k==='sgo'){ doSolve(); }
    else if(k==='em'){ eqMenuSel=+a; VK.eqmenu('@ok'); } else if(k==='en'){ eqNSel=+a; VK.eqn('@ok'); }
    else if(k==='ec'){ if(eqEd&&!eqCommit()) return; eqSel=[+a,+b]; }
    else if(k==='ego'){ eqSolve(); } else if(k==='es'){ eqRS=+a; } else if(k==='eback'){ view='eqedit'; }
    else if(k==='tf'){ tFld=+a; } else if(k==='tgo'){ VK.tbdef('@exe'); if(view==='tbdef'&&tFld===1) VK.tbdef('@exe'); }
    else if(k==='rf'){ if(rFld!==+a) tR[+a].repl=true; rFld=+a; } else if(k==='rgo'){ makeTable(); }
    else if(k==='tc'){ tSel=[+a,+b]; } }
  function renderCalc(){
    if(histDirty){ histDirty=false; logCache=null; }
    const H=histShown();
    const key=H.join(',')+'|'+hsel+'|'+S.io+'|'+JSON.stringify(S.nf)+S.deg+S.polar+S.app;
    if(logCache!==key){ logCache=key;
      logEl.innerHTML=H.map(i=>{ const h=S.hist[i]; const nodes=h.n?h.n:fromText(h.e); const z=a2z(h.r);
        return `<div class="lc-h${i===hsel?' sel':''}" data-v="h:${i}" role="button" tabindex="-1" title="Toca dos veces para reutilizar"><div class="he"><span class="lc-e${natIn()?'':' lin'}">${edHTML(nodes,null,!natIn(),null)}</span></div><span class="hr" data-v="hr:${i}" title="Escribir este resultado">${fmtHTML(z)}</span></div>`; }).join(''); }
    edEl.innerHTML=EH(main,!fresh);
    if(fresh&&last){ rv.className='lc-rv'; rv.innerHTML=(lastF&&lastF.dec?'<span class="lc-ap">≈</span>':'')+fmtHTML(last,lastF||{}); }
    else if(errMsg){ rv.className='lc-rv err'; rv.textContent=errMsg+' · ◀ ▶ para corregir'; errMsg=''; }
    else { rv.className='lc-rv pv'; rv.innerHTML=''; if(!main.empty()){ try{ const z=tidy(evaluate(parse(main.ser().s),env())); if(!(S.app==='calc'&&z.im!==0)) rv.innerHTML='= '+fmtHTML(z,{dec:true}); }catch(e){} } }
    fitRes(rv);
    edEl.scrollLeft=edEl.scrollWidth; const c=edEl.querySelector('.e-cur'); if(c){ const r=c.getBoundingClientRect(), p=edEl.getBoundingClientRect(); if(r.left<p.left||r.right>p.right) edEl.scrollLeft+=r.left-p.left-p.width/2; }
    if(hsel>=0){ const s=logEl.querySelector('.lc-h.sel'); if(s) s.scrollIntoView({block:'nearest'}); } else scr.scrollTop=scr.scrollHeight; }
  let logCache=null;
  function fitRes(el){ el.style.fontSize=''; if(el.classList.contains('err')) return; for(const f of [20,17,14,12]){ if(el.scrollWidth<=el.clientWidth+1) break; el.style.fontSize=f+'px'; } }
  const fld=(lbl,E,on,v)=>`<div class="lc-fld${on?' sel':''}" data-v="${v}"><span class="fl">${lbl}</span><span class="fe">${EH(E,on)}</span></div>`;
  const VH={};
  VH.solve=()=>{ let r=`<div class="lc-ttl2">Solver · resolver una ecuación con <i>x</i> (sin «=» se resuelve … = 0)</div>`+fld('',sEq,sFld===0,'sf:0')+fld('x₀ =',sX0,sFld===1,'sf:1');
    if(sRes) r+=`<div class="lc-sols"><div class="lc-sr sel"><span class="sx">x =</span><span class="sv">${fmtHTML(C(sRes.x,0),fmtSel||{})}</span></div><div class="lc-sr"><span class="sx">L−R =</span><span class="sv">${fmtHTML(C(sRes.lr,0),{dec:true})}</span></div></div>`;
    else r+=`<button type="button" class="lc-go" data-v="sgo">Resolver (EXE)</button><div class="lc-hint">«=» está en SHIFT + ( (o en CATALOG › Otros). x₀ es el valor inicial de la búsqueda.</div>`;
    return r; };
  VH.eqmenu=()=>`<div class="lc-ttl2">Ecuación · tipo</div>`+[['Simultánea (sistema lineal)','2 a 4 incógnitas'],['Polinómica','grado 2 a 4'],['Solver','f(x) = g(x), Newton']].map(([l,r],k)=>`<button type="button" class="lc-li${k===eqMenuSel?' sel':''}" data-v="em:${k}"><span class="n">${k+1}:</span><span>${l}</span><span class="r">${r}</span></button>`).join('');
  VH.eqn=()=>`<div class="lc-ttl2">${S.eq.type==='poly'?'Polinómica · grado':'Simultánea · número de incógnitas'}</div>`+[2,3,4].map((n,k)=>`<button type="button" class="lc-li${k===eqNSel?' sel':''}" data-v="en:${k}"><span class="n">${n}:</span><span>${S.eq.type==='poly'?tex(eqForm(n)):n+' incógnitas ('+UNK.slice(0,n).split('').join(', ')+')'}</span></button>`).join('');
  function eqForm(n){ const t=[]; for(let k=0;k<=n;k++){ const p=n-k; t.push(LET[k]+(p>1?'x^{'+p+'}':p===1?'x':'')); } return t.join('+')+'=0'; }
  VH.eqedit=()=>{ const [R,K]=eqDims(), poly=S.eq.type==='poly';
    let h=`<div class="lc-ttl2">${poly?'Polinómica · grado '+S.eq.n:'Sistema de '+S.eq.n+' incógnitas'}</div>`;
    h+=`<div class="lc-eform">${poly?tex(eqForm(S.eq.n)):tex(UNK.slice(0,S.eq.n).split('').map((u,k)=>LET[k]+'_n'+u).join('+')+'='+LET[S.eq.n]+'_n')}</div>`;
    h+=`<div class="lc-grid" style="grid-template-columns:${poly?'':'auto '}repeat(${K},minmax(0,1fr))">`;
    if(!poly){ h+='<span></span>'; for(let k=0;k<K;k++) h+=`<span class="lc-gh">${k<S.eq.n?UNK[k]:'='}</span>`; }
    else for(let k=0;k<K;k++) h+=`<span class="lc-gh">${LET[k]}</span>`;
    for(let r=0;r<R;r++){ if(!poly) h+=`<span class="lc-gh">${r+1}</span>`; for(let k=0;k<K;k++){ const s=eqSel[0]===r&&eqSel[1]===k; h+=`<button type="button" class="lc-cell${s?' sel':''}${s&&eqEd?' ed':''}" data-v="ec:${r}:${k}">${escH(cellTxt(r,k))}</button>`; } }
    h+='</div>';
    const nm=poly?LET[eqSel[1]]:LET[eqSel[1]]+(eqSel[0]+1);
    h+=`<div class="lc-edit">${fld(nm+' =',eqEd||new Ed(cloneRow(cell(...eqSel)||[])),!!eqEd,'ec:'+eqSel.join(':'))}</div>`;
    h+=`<button type="button" class="lc-go" data-v="ego">Resolver (EXE)</button><div class="lc-hint">${eqEd?'EXE guarda el coeficiente y pasa al siguiente.':'Escribe para cambiar la casilla; ◀ ▶ ▲ ▼ para moverte; EXE resuelve.'}</div>`;
    return h; };
  VH.eqsol=()=>{ let h=`<div class="lc-ttl2">${S.eq.type==='poly'?'Raíces de '+tex(eqForm(S.eq.n)):'Solución del sistema'}</div>`;
    if(!eqRes||!eqRes.roots) return h+`<div class="lc-rv err" style="text-align:left">${eqRes&&eqRes.inf?'Infinitas soluciones':'Sin solución'}</div><button type="button" class="lc-go" data-v="eback">Volver a los coeficientes</button>`;
    const L=eqList(), nl=s2=>s2.replace(/^x(\d)$/,'<i>x</i><sub>$1</sub>').replace(/^([xy]) (m..)$/,'<i>$1</i> <small>$2</small>');
    h+=(eqRes.noReal?'<div class="lc-rv err" style="text-align:left">Sin raíces reales</div>':'')+'<div class="lc-sols">'+L.map((it,k)=>{ const ex=it.k!=null&&!eqDec&&natOut()&&!linOut()&&eqRes.exact&&eqRes.exact[it.k]; return `<button type="button" class="lc-sr${k===eqRS?' sel':''}" data-v="es:${k}"><span class="sx">${nl(it.l)} =</span><span class="sv">${ex?tex(ex):fmtHTML(it.z,{dec:eqDec})}</span></button>`; }).join('')
      +(eqRes.extra||[]).filter(e=>!e.z).map(e=>`<div class="lc-hint">${e.l}</div>`).join('')+'</div>';
    return h+`<div class="lc-hint">▲ ▼ elige · OK la guarda en Ans · FORMAT o SHIFT EXE: decimal · BACK: coeficientes</div>`; };
  VH.tbdef=VH.fdef=()=>`<div class="lc-ttl2">${view==='fdef'?'Definir f(x) y g(x) · se usan como f(2), g(A)…':'Tabla de función · define f(x) y, si quieres, g(x)'}</div>`+fld('<i>f</i>(<i>x</i>) =',tF,tFld===0,'tf:0')+fld('<i>g</i>(<i>x</i>) =',tG,tFld===1,'tf:1')+(view==='tbdef'?`<button type="button" class="lc-go" data-v="tgo">Siguiente: rango (EXE)</button><div class="lc-hint">Ejemplo LGDR: <i>f</i>(<i>x</i>) = −(x+2)(x+4)(x+6) para buscar la K máxima en el eje real (ruptura).</div>`:`<div class="lc-hint">EXE guarda · BACK regresa</div>`);
  VH.tbrng=()=>`<div class="lc-ttl2">Rango de la tabla (máximo ${(S.tb.type||'fg')==='fg'&&S.fn.f.length&&S.fn.g.length?30:45} filas)</div>`+fld('Inicio =',tR[0],rFld===0,'rf:0')+fld('Fin =',tR[1],rFld===1,'rf:1')+fld('Paso =',tR[2],rFld===2,'rf:2')+`<button type="button" class="lc-go" data-v="rgo">Ver la tabla (EXE)</button>`;
  VH.tbl=()=>{ if(!tRows) return ''; const hf=tCols.includes(1), hg=tCols.includes(2); const cell2=v=>v==null?'':v==='err'?'ERROR':escH(formatTxt(v,{nf:S.nf.m==='norm'?{m:'norm',n:1}:S.nf}));
    let h=`<table class="lc-tb"><thead><tr><th></th><th>x</th>${hf?'<th>f(x)</th>':''}${hg?'<th>g(x)</th>':''}</tr></thead><tbody>`;
    tRows.forEach((r,i)=>{ h+=`<tr><td class="n">${i+1}</td>`+[0,1,2].filter(c=>c===0||(c===1&&hf)||(c===2&&hg)).map(c=>`<td class="${tSel[0]===i&&tSel[1]===c?'sel':''}" data-v="tc:${i}:${c}">${cell2(r[c])}</td>`).join('')+'</tr>'; });
    const z=tCell(); h+=`</tbody></table><div class="lc-tbv">${z?fmtHTML(z,fmtSel||{}):(tRows[tSel[0]]&&tRows[tSel[0]][tSel[1]]==='err'?'ERROR':'')}</div>`; return h; };
  /* «→ Respuesta»: opts.answer() da la casilla ({input,label}) o, en un plano s, {label, put(z), putAll(lista)}
     (put acepta complejos; putAll recibe todas las raíces de «Ecuación») */
  const eqRoots=()=>view==='eqsol'&&eqRes&&eqRes.roots?eqRes.roots:[];
  function bar(){ const z=pick(), t=opts.answer&&opts.answer();
    bCopy.hidden=!z; bAns.hidden=!z||view==='calc'; bPut.hidden=!(z&&t&&(t.input||t.put)); if(t&&t.label) bPut.textContent='→ '+t.label;
    const n=eqRoots().length; bAll.hidden=!(t&&t.putAll&&n>1); bAll.textContent='→ las '+n+' raíces'; }
  bCopy.addEventListener('click',()=>{ const z=pick(); if(!z) return; const t=plain(z); (navigator.clipboard?navigator.clipboard.writeText(t):Promise.reject()).then(()=>say('Copiado: '+t),()=>say(t)); });
  bAns.addEventListener('click',()=>{ const z=pick(); if(!z) return; S.ans=z2a(z); save(); say('→ Ans'); });
  bPut.addEventListener('click',()=>{ const t=opts.answer&&opts.answer(), z0=pick(); if(!t||!(t.input||t.put)||!z0) return; const z=tidy(z0);
    if(t.put){ const r=t.put(z)||{}; say(r.err||r.msg||'Listo',!!r.err); bar(); return; }
    if(z.im!==0){ say('Esta casilla solo acepta un número real (las raíces complejas van en el plano s)',true); return; }
    const v=String(+z.re.toPrecision(7)); t.input.value=v; t.input.dispatchEvent(new Event('input',{bubbles:true})); say(`Escrito ${v} en ${t.label||'la respuesta'}`); });

  bAll.addEventListener('click',()=>{ const t=opts.answer&&opts.answer(), L=eqRoots(); if(!t||!t.putAll||!L.length) return; const r=t.putAll(L.map(tidy))||{}; say(r.err||r.msg||'Listo',!!r.err); bar(); });

  /* ---------- inicio */
  goApp(S.app); render();
  return {
    el:root, engine,
    focus(){ try{ root.focus({preventScroll:true}); }catch(e){} },
    refresh(){ histDirty=true; render(); },
    insert(t){ if(view!=='calc'){ ovAll(); if(S.app!=='calc'&&S.app!=='cplx') goApp('calc'); view='calc'; } fromText(t).forEach(it=>{ prepEdit(main,it.v); main.row.splice(main.i,0,it); main.i++; }); render(); },
    answerChanged(){ bar(); },
    setTab(t){ if(t==='eqn') goApp('eqn'); else if(t==='solve'){ goApp('eqn'); view='solve'; } else if(t==='tbl') goApp('tbl'); else if(t==='cplx') goApp('cplx'); else goApp('calc'); render(); },
    key(a){ key(a); },
    /* etapa 3 de «Entrenar»: abrir una app directo desde un ejercicio */
    poly(n){ n=Math.max(2,Math.min(4,n|0)); if(off) key('@on'); goApp('eqn'); S.eq.type='poly'; if(S.eq.n!==n){ S.eq.n=n; S.eq.P={}; } save(); eqSel=[0,0]; eqEd=null; eqRes=null; view='eqedit'; render(); },
    solver(){ if(off) key('@on'); goApp('eqn'); view='solve'; sFld=0; sRes=null; render(); },
    app(id){ if(off) key('@on'); goApp(id==='cplx'?'cplx':'calc'); render(); },
    get ans(){ return a2z(S.ans); },
    get state(){ return {app:S.app,view,ov:ov.length}; },
    destroy(){ root.remove(); }
  };
}

G.LGDRCalc={mount,engine,version:'2'};
})(typeof window!=='undefined'?window:globalThis);
