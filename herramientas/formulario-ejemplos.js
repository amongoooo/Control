// v78 · Formulario (dialog#fxDlg): «Desarrollo y ejemplo» en las fórmulas que no lo tenían (sobre v74/v76)
// y filas nuevas que faltaban. Uso: node herramientas/formulario-ejemplos.js   (reescribe index.html; se puede
// volver a correr: primero borra lo que puso antes).
// - Desarrollo dentro de una fila:  { sec:'fxs12', row:7, ej:{lab, b} }
// - Fila nueva después de una fila: { sec:'fxs9', after:2, add:{m, n, k, ej} }
//   row/after = n.º de hijo de la sección (h3 = 0; 1 = primera fila), como en la lista que da el volcado del formulario.
//   m = TeX (si empieza con $$ va centrado/en varias líneas) o mh = HTML; n = nota (HTML); k = palabras para el buscador.
// En los textos: $…$ = TeX en línea, $$…$$ = TeX centrado; «\qquad» a profundidad 0 = salto de línea (para 390 px).
const fs = require('fs'), path = require('path'), vm = require('vm');
const FILE = path.join(__dirname, '..', 'index.html');
let html = fs.readFileSync(FILE, 'utf8');
const i0 = html.indexOf('!function(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t()');
const mod = { exports: {} };
vm.runInNewContext(html.slice(i0, html.indexOf('</script>', i0)), { module: mod, exports: mod.exports, self: {}, document: undefined, console });
const katex = mod.exports;
const tx = (t, d) => katex.renderToString(t, { displayMode: !!d, throwOnError: true, strict: 'ignore', output: 'html' });
function wrap(t) {
  if (t.includes('\\begin')) return t;
  let o = '', d = 0;
  for (let i = 0; i < t.length; i++) {
    const c = t[i]; if (c === '{') d++; else if (c === '}') d--;
    if (!d && t.startsWith('\\qquad', i)) { o = o.replace(/,\s*$/, '') + '\\\\ '; i += 5; continue; }
    o += c;
  }
  if (!/\\\\/.test(o)) return o;
  return o.includes('&') ? `\\begin{aligned}${o}\\end{aligned}` : `\\begin{gathered}${o}\\end{gathered}`;
}
const md = s => s.replace(/\$\$([\s\S]+?)\$\$/g, (_, t) => tx(wrap(t.trim()), true)).replace(/\$([^$]+?)\$/g, (_, t) => tx(t, false));
const body = b => b.map(l => l.startsWith('$$') ? md(l) : `<p>${md(l)}</p>`).join('');
const ejHTML = ej => `<details class="fx-ej"><summary>${ej.lab || 'Desarrollo y ejemplo'}</summary><div class="fx-ejb">${body(ej.b)}</div></details>`;
const addHTML = a => `<!--fx-add--><div class="fx-r fx-add"${a.k ? ` data-k="${a.k}"` : ''}><div class="fx-m">${a.mh || (a.m.startsWith('$$') ? md(a.m) : tx(a.m, false))}</div><div class="fx-n">${a.n}</div>${a.ej ? ejHTML(a.ej) : ''}</div><!--/fx-add-->`;

const E = [
// ---------------- Parte II ----------------
{ sec: 'fxs9', row: 2, ej: { lab: 'Desarrollo con variables · P1 y P6', b: [
  'Con $G=N/D$, multiplica $1+K\\dfrac{N}{D}=0$ por $D$: queda $D(s)+K\\,N(s)=0$.',
  'Tres polos sin ceros ($N=1$, $D=(s+a)(s+b)(s+c)$). Al multiplicar los factores, los coeficientes son la suma, la suma de productos por pares y el producto:',
  '$$\\begin{aligned}&(s+a)(s+b)(s+c)\\\\ &=s^3+(a+b+c)\\,s^2+(ab+ac+bc)\\,s+abc\\end{aligned}$$',
  '$$\\begin{aligned}&s^3+(a+b+c)\\,s^2\\\\ &+(ab+ac+bc)\\,s+(abc+K)=0\\end{aligned}$$',
  '<b>P1</b> ($a,b,c=2,4,6$): $a+b+c=12$, $ab+ac+bc=8+12+24=44$, $abc=48$:',
  '$$s^3+12s^2+44s+(48+K)=0$$',
  '<b>Con un cero</b> (P6: $N=s+8$, $D=(s+3)(s+6)(s+10)=s^3+19s^2+108s+180$):',
  '$$s^3+19s^2+(108+K)\\,s+(180+8K)=0$$' ] } },
{ sec: 'fxs9', row: 6, ej: { lab: 'Ejemplo · P1', b: [
  'Con $s=\\sigma$ real, $D(\\sigma)+K\\,N(\\sigma)=0$ da la $K$ que pone un polo de lazo cerrado justo en $\\sigma$. P1 ($N=1$): $K(\\sigma)=-(\\sigma+2)(\\sigma+4)(\\sigma+6)$.',
  '$$\\begin{aligned}\\sigma=-3:\\ K&=-(-1)(1)(3)=3\\\\ \\sigma=-7:\\ K&=-(-5)(-3)(-1)=15\\\\ \\sigma=-1:\\ K&=-(1)(3)(5)=-15<0\\end{aligned}$$',
  'Con $K=3$ hay un polo en $-3$; con $K=15$, uno en $-7$. En $-1$ sale $K<0$: ese punto no es del LGDR (para $K>0$). El máximo de $K(\\sigma)$ entre $-4$ y $-2$ es la ruptura (sección 12: $K_b=3.079$ en $-2.845$).' ] } },
{ sec: 'fxs9', row: 7, ej: { lab: 'Ejemplo · P1', b: [
  '$$\\begin{aligned}T(0)&=\\frac{K\\,N(0)}{D(0)+K\\,N(0)}=\\frac{45.53}{48+45.53}\\\\ &=\\frac{45.53}{93.53}=0.487\\\\ e_{esc}&=1-0.487=0.513\\end{aligned}$$',
  'Mismo resultado que $1/(1+K_p)$ con $K_p=45.53/48=0.9485$. En MATLAB: <code>1 - dcgain(T)</code>.' ] } },
{ sec: 'fxs9', after: 7, add: {
  m: '$$\\begin{aligned}&s^n+a_{n-1}s^{n-1}+\\dots+a_1s+a_0=0\\\\ &\\textstyle\\sum p_i=-a_{n-1},\\qquad \\prod p_i=(-1)^n a_0\\end{aligned}$$',
  n: 'Suma y producto de los polos en lazo cerrado (relaciones de Vieta). Si n − m ≥ 2, a<sub>n−1</sub> no tiene K: <b>la suma de los polos no cambia con K</b>. Sirve para sacar el polo que falta (el tercer polo) sin resolver el polinomio.',
  k: 'suma de polos producto de polos tercer polo vieta polo que falta division',
  ej: { lab: 'Ejemplo · P1 (tercer polo)', b: [
    'Con $K=45.53$: $s^3+12s^2+44s+93.53=0$ y los dominantes son $-2.0285\\pm j2.7677$.',
    '$$\\begin{aligned}p_3&=-12-\\big(p_1+p_2\\big)\\\\ &=-12-2(-2.0285)=-7.943\\end{aligned}$$',
    'Comprobación con el producto ($n=3$, $-p_1p_2p_3=a_0=48+K$):',
    '$$\\begin{aligned}&(2.0285^2+2.7677^2)(7.943)\\\\ &=11.775\\cdot7.943=93.53=48+45.53\\ \\checkmark\\end{aligned}$$',
    'Otra forma: dividir entre el factor del par, $s^2+2\\sigma s+(\\sigma^2+\\omega_d^2)=s^2+4.057s+11.775$:',
    '$$\\frac{s^3+12s^2+44s+93.53}{s^2+4.057s+11.775}=s+7.943$$' ] } } },
{ sec: 'fxs10', row: 5, ej: { lab: 'Ejemplo · P4 (T<sub>s</sub> ÷ 3) y P6 (T<sub>p</sub> × 2/3)', b: [
  'P4: sin compensar $T_s=3.321$ s; se pide la tercera parte con el mismo $\\zeta=0.5039$ ($\\tan\\theta=1.7143$):',
  '$$T_{s,d}=\\frac{3.321}{3}=1.107\\ \\text{s}\\qquad \\sigma_d=\\frac{4}{1.107}=3.613\\qquad \\omega_d=3.613\\cdot1.7143=6.194$$',
  '$$s_d=-3.613+j6.194$$',
  'P6: $T_p=0.2972$ s y se pide $\\tfrac23$, con $\\zeta=0.4559$ ($\\tan\\theta=1.9520$):',
  '$$T_{p,d}=0.1981\\ \\text{s}\\qquad \\omega_d=\\frac{\\pi}{0.1981}=15.86\\qquad \\sigma_d=\\frac{15.86}{1.9520}=8.123$$' ] } },
{ sec: 'fxs11', row: 3, ej: { lab: 'Ejemplo · P1 (ángulos y distancias a s<sub>0</sub>)', b: [
  'Vector del polo en $-a$ al punto $s_0=-\\sigma+j\\omega$: $\\theta=\\operatorname{atan2}(\\omega,\\ a-\\sigma)$, $d=\\sqrt{(a-\\sigma)^2+\\omega^2}$.',
  'P1, $s_0=-2.0285+j2.7677$, polos en $-2,-4,-6$:',
  '$$\\begin{aligned}\\theta_2&=180^\\circ-\\arctan\\tfrac{2.7677}{0.0285}=90.59^\\circ\\\\ \\theta_4&=\\arctan\\tfrac{2.7677}{1.9715}=54.54^\\circ\\\\ \\theta_6&=\\arctan\\tfrac{2.7677}{3.9715}=34.87^\\circ\\end{aligned}$$',
  '$$\\begin{aligned}\\angle G&=-(90.59^\\circ+54.54^\\circ+34.87^\\circ)\\\\ &=-180.0^\\circ\\ \\Rightarrow\\ \\text{está en el LGDR}\\end{aligned}$$',
  '$$\\begin{aligned}d_2&=\\sqrt{0.0285^2+2.7677^2}=2.768\\\\ d_4&=\\sqrt{1.9715^2+2.7677^2}=3.398\\\\ d_6&=\\sqrt{3.9715^2+2.7677^2}=4.841\\end{aligned}$$',
  '$$K=\\frac{\\prod d_{polos}}{\\prod d_{ceros}}=2.768\\cdot3.398\\cdot4.841=45.53$$',
  '($\\theta_2$ pasa de 90° porque el polo en $-2$ queda a la derecha del punto: $a=2<\\sigma=2.0285$.)' ] } },
{ sec: 'fxs12', row: 3, ej: { lab: 'Desarrollo con variables · P1 y P6', b: [
  'Sobre el eje real ($s=\\sigma$): $K(\\sigma)=-\\dfrac{D(\\sigma)}{N(\\sigma)}$. La ruptura es donde $K(\\sigma)$ tiene su máximo (entre dos polos) o su mínimo (llegada, entre dos ceros):',
  '$$\\frac{dK}{d\\sigma}=-\\frac{N\\,D\'-N\'D}{N^2}=0\\qquad \\iff\\ N\\,D\'-N\'D=0$$',
  '<b>1) Tres polos sin ceros</b> ($N=1$, $N\'=0$): queda $D\'(\\sigma)=0$ con $D=\\sigma^3+(a+b+c)\\sigma^2+(ab+ac+bc)\\sigma+abc$:',
  '$$3\\sigma^2+2(a+b+c)\\,\\sigma+(ab+ac+bc)=0$$',
  '$$\\sigma_b=\\frac{-(a+b+c)\\pm\\sqrt{\\Delta}}{3}\\qquad \\Delta=(a+b+c)^2-3(ab+ac+bc)$$',
  '<b>P1</b> ($a,b,c=2,4,6$):',
  '$$\\begin{aligned}&3\\sigma^2+24\\sigma+44=0\\\\ &\\sigma=\\frac{-24\\pm\\sqrt{576-528}}{6}=\\frac{-24\\pm6.928}{6}\\end{aligned}$$',
  '$$\\sigma=-2.845\\quad\\text{o}\\quad\\sigma=-5.155$$',
  '$-5.155$ está entre $-6$ y $-4$: a su derecha hay 2 polos (par), no es LGDR → se descarta. $\\sigma_b=-2.845$ (entre $-4$ y $-2$: 1 polo a la derecha ✓).',
  '<b>2) Con un cero</b> (P6): $N=\\sigma+8$, $N\'=1$, $D=\\sigma^3+19\\sigma^2+108\\sigma+180$, $D\'=3\\sigma^2+38\\sigma+108$:',
  '$$\\begin{aligned}&(\\sigma+8)(3\\sigma^2+38\\sigma+108)\\\\ &-(\\sigma^3+19\\sigma^2+108\\sigma+180)\\\\ &=2\\sigma^3+43\\sigma^2+304\\sigma+684=0\\end{aligned}$$',
  'Raíces: $-4.623$ y $-8.438\\pm j1.664$ (complejas, no cuentan) → $\\sigma_b=-4.623$, en el tramo $[-6,-3]$ del LGDR ✓. Su $K_b$ está en la fila de $K_b$ (abajo).' ] } },
{ sec: 'fxs12', row: 5, ej: { lab: 'Ejemplo con variables', b: [
  '$G=\\dfrac{1}{s\\,[(s+1)^2+1]}$: polos en $0$ y $-1\\pm j$. Salida desde $p_k=-1+j$ (sin ceros):',
  '$$\\angle(0\\to p_k)=\\operatorname{atan2}(1,-1)=135^\\circ\\qquad \\angle(-1-j\\to p_k)=90^\\circ$$',
  '$$\\theta_{sal}=180^\\circ+0-(135^\\circ+90^\\circ)=-45^\\circ$$',
  'La rama sale de $-1+j$ hacia abajo y a la derecha (−45°); la de $-1-j$ sale a +45° (simetría).',
  'En P1–P7 todos los polos y ceros de lazo abierto son reales: este paso del trazo no se usa en las prácticas.' ] } },
{ sec: 'fxs12', row: 6, ej: { lab: 'Ejemplo con variables', b: [
  '$G=\\dfrac{(s+1)^2+1}{s\\,(s+3)}$: ceros en $-1\\pm j$, polos en $0$ y $-3$. Llegada a $z_k=-1+j$:',
  '$$\\angle(0\\to z_k)=135^\\circ\\qquad \\angle(-3\\to z_k)=\\arctan\\tfrac{1}{2}=26.57^\\circ\\qquad \\angle(-1-j\\to z_k)=90^\\circ$$',
  '$$\\begin{aligned}\\theta_{lleg}&=180^\\circ+(135^\\circ+26.57^\\circ)-90^\\circ\\\\ &=251.57^\\circ\\equiv-108.43^\\circ\\end{aligned}$$' ] } },
{ sec: 'fxs12', row: 7, ej: { lab: 'Desarrollo con variables · P1 y P6', b: [
  'Es la condición de magnitud en el punto de ruptura: $K_b=\\dfrac{1}{|G(\\sigma_b)|}=\\left|\\dfrac{D(\\sigma_b)}{N(\\sigma_b)}\\right|=\\dfrac{\\prod|\\sigma_b+p_i|}{\\prod|\\sigma_b+z_i|}$ (distancias de cada polo y cero a $\\sigma_b$).',
  '<b>Tres polos sin ceros</b>, $G=\\dfrac{1}{(s+a)(s+b)(s+c)}$:',
  '$$K_b=|\\sigma_b+a|\\,|\\sigma_b+b|\\,|\\sigma_b+c|$$',
  '<b>P1</b> ($a,b,c=2,4,6$, $\\sigma_b=-2.845$ de la fila de arriba):',
  '$$\\begin{aligned}K_b&=\\lvert -2.845+2\\rvert \\,\\lvert -2.845+4\\rvert \\,\\lvert -2.845+6\\rvert \\\\ &=0.845\\cdot1.155\\cdot3.155=3.079\\end{aligned}$$',
  'Lectura: con $K<3.079$ los tres polos son reales (sin sobrepaso); en $K=3.079$ dos chocan en $-2.845$; con $K>3.079$ salen del eje como par complejo. La $K$ de diseño (45.53) es mayor, por eso hay sobrepaso.',
  '<b>Con un cero</b>, $G=\\dfrac{s+z}{(s+a)(s+b)(s+c)}$:', '$$K_b=\\frac{|\\sigma_b+a|\\,|\\sigma_b+b|\\,|\\sigma_b+c|}{|\\sigma_b+z|}$$', '<b>P6</b> ($\\sigma_b=-4.623$):',
  '$$\\begin{aligned}K_b&=\\frac{\\lvert -4.623+3\\rvert \\,\\lvert -4.623+6\\rvert \\,\\lvert -4.623+10\\rvert }{\\lvert -4.623+8\\rvert }\\\\ &=\\frac{1.623\\cdot1.377\\cdot5.377}{3.377}\\\\ &=\\frac{12.02}{3.377}=3.558\\end{aligned}$$',
  'MATLAB: <code>Kb = abs(polyval(den,sb)/polyval(num,sb))</code>.' ] } },
{ sec: 'fxs12', row: 8, ej: { lab: 'Ejemplo · P1 y P6', b: [
  'P1 (sin ceros, el lado de los ceros vale 0):',
  '$$\\frac{1}{\\sigma+2}+\\frac{1}{\\sigma+4}+\\frac{1}{\\sigma+6}=0$$',
  'Multiplica por $(\\sigma+2)(\\sigma+4)(\\sigma+6)$:',
  '$$\\begin{aligned}&(\\sigma+4)(\\sigma+6)+(\\sigma+2)(\\sigma+6)+(\\sigma+2)(\\sigma+4)\\\\ &=3\\sigma^2+24\\sigma+44=0\\ \\Rightarrow\\ \\sigma_b=-2.845\\end{aligned}$$',
  'Es el mismo polinomio que con $dK/d\\sigma=0$. P6: $\\dfrac{1}{\\sigma+8}=\\dfrac{1}{\\sigma+3}+\\dfrac{1}{\\sigma+6}+\\dfrac{1}{\\sigma+10}$ → $2\\sigma^3+43\\sigma^2+304\\sigma+684=0$.' ] } },
{ sec: 'fxs12', row: 9, ej: { lab: 'Ejemplo · P1', b: [
  'Con $j^2=-1$, $j^3=-j$, separa parte real e imaginaria:',
  '$$\\begin{aligned}&(j\\omega)^3+12(j\\omega)^2+44(j\\omega)+48+K\\\\ &=\\big(48+K-12\\omega^2\\big)+j\\,\\omega\\big(44-\\omega^2\\big)=0\\end{aligned}$$',
  '$$\\text{Im}:\\ \\omega^2=44\\ \\Rightarrow\\ \\omega=6.633\\ \\text{rad/s}\\qquad \\text{Re}:\\ K=12(44)-48=480$$',
  'Igual que con Routh: estable para $0<K<480$; en $K=480$ los polos cruzan en $\\pm j6.633$.' ] } },
{ sec: 'fxs13', row: 4, ej: { lab: 'Ejemplo de 4.º orden · P2 con PI', b: [
  '$$b_1=\\frac{a_{n-1}a_{n-2}-a_n a_{n-3}}{a_{n-1}}\\qquad b_2=\\frac{a_{n-1}a_{n-4}-a_n a_{n-5}}{a_{n-1}}\\qquad c_1=\\frac{b_1a_{n-3}-a_{n-1}b_2}{b_1}$$',
  '$s(s+1)(s+2)(s+10)+K(s+0.1)=s^4+13s^3+32s^2+(20+K)s+0.1K$:',
  '$$\\def\\arraystretch{1.7}\\begin{array}{c|ccc} s^4 & 1 & 32 & 0.1K\\\\ s^3 & 13 & 20+K & \\\\ s^2 & \\dfrac{396-K}{13} & 0.1K & \\\\ s^1 & c_1 & & \\\\ s^0 & 0.1K & & \\end{array}$$',
  '$$b_1=\\frac{13\\cdot32-1\\cdot(20+K)}{13}=\\frac{396-K}{13}\\qquad c_1=\\frac{(396-K)(20+K)-16.9K}{396-K}$$',
  '$$\\begin{aligned}&c_1>0:\\ -K^2+359.1K+7920>0\\\\ &\\Rightarrow\\ 0<K<379.95\\end{aligned}$$' ] } },
{ sec: 'fxs13', row: 6, ej: { lab: 'Ejemplo con variables', b: [
  '$s^4+s^3+2s^2+2s+3$: la fila $s^2$ empieza en $\\dfrac{1\\cdot2-1\\cdot2}{1}=0$ (pero no es toda cero) → se cambia por $\\varepsilon$:',
  '$$\\def\\arraystretch{1.5}\\begin{array}{c|ccc|c} s^4 & 1 & 2 & 3 & +\\\\ s^3 & 1 & 2 & & +\\\\ s^2 & \\varepsilon & 3 & & +\\\\ s^1 & 2-\\dfrac{3}{\\varepsilon} & & & -\\\\ s^0 & 3 & & & +\\end{array}$$',
  'Con $\\varepsilon\\to0^+$, $2-3/\\varepsilon$ es muy negativo: hay 2 cambios de signo ($+\\to-\\to+$) → 2 polos en el semiplano derecho.' ] } },
{ sec: 'fxs13', row: 7, ej: { lab: 'Ejemplo · P1 en K crítica (K = 480)', b: [
  '$s^3+12s^2+44s+528$: la fila $s^1=\\dfrac{12\\cdot44-528}{12}=0$ queda toda en cero.',
  '$$P(s)=12s^2+528\\qquad \\frac{dP}{ds}=24s\\ \\Rightarrow\\ \\text{fila } s^1:\\ 24$$',
  '$$12s^2+528=0\\ \\Rightarrow\\ s=\\pm j\\sqrt{44}=\\pm j6.633$$',
  'Debajo no hay cambios de signo (12, 24, 528): las raíces están sobre $j\\omega$ → oscila sostenido con $\\omega=6.633$ rad/s.' ] } },
{ sec: 'fxs15', row: 3, ej: { lab: 'Desarrollo con variables · P1 y P3', b: [
  'Escalón, $R=1/s$:',
  '$$\\begin{aligned}e(\\infty)&=\\lim_{s\\to0}s\\,\\frac{1/s}{1+KG}\\\\ &=\\frac{1}{1+\\lim_{s\\to0}KG}=\\frac{1}{1+K_p}\\end{aligned}$$',
  'Rampa, $R=1/s^2$:',
  '$$e(\\infty)=\\lim_{s\\to0}\\frac{1}{s+s\\,KG}=\\frac{1}{\\lim_{s\\to0}s\\,KG}=\\frac{1}{K_v}$$',
  '<b>P1</b> (tipo 0): $K_p=\\dfrac{K}{2\\cdot4\\cdot6}=\\dfrac{45.53}{48}=0.9485$, $\\;e_{esc}=\\dfrac{1}{1.9485}=0.513$.',
  '<b>P3</b> (tipo 1): $K_v=\\lim_{s\\to0}s\\,\\dfrac{K}{s(s+7)}=\\dfrac{45.84}{7}=6.549$, $\\;e_{rampa}=\\dfrac{1}{6.549}=0.1527$.' ] } },
{ sec: 'fxs16', row: 2, ej: { lab: 'Ejemplo · P3 (atraso 0.2 / 0.01)', b: [
  '$$\\begin{aligned}K_v&=\\lim_{s\\to0}s\\,K\\frac{s+0.2}{s+0.01}\\,\\frac{1}{s(s+7)}\\\\ &=\\frac{K\\,(0.2)}{7\\,(0.01)}=\\frac{44.64\\cdot0.2}{0.07}=127.5\\end{aligned}$$',
  '$$e_{rampa}=\\frac{1}{127.5}=0.00784\\qquad\\text{antes }\\frac{1}{6.549}=0.1527\\ (\\times19.5)$$',
  'No es exactamente ×20 = $z_c/p_c$ porque $K$ bajó de 45.84 a 44.64 al re‑buscar el punto sobre la recta de $\\zeta$.' ] } },
{ sec: 'fxs16', row: 3, ej: { lab: 'Ejemplo · P2 (PI, z<sub>c</sub> = 0.1)', b: [
  'En $s_0=-0.6936+j3.9255$ (punto sin compensar), el cero en $-0.1$ y el polo en $0$:',
  '$$\\begin{aligned}\\angle(s_0+0.1)&=\\operatorname{atan2}(3.9255,\\,-0.5936)=98.60^\\circ\\\\ \\angle(s_0)&=\\operatorname{atan2}(3.9255,\\,-0.6936)=100.02^\\circ\\\\ \\angle G_c(s_0)&=98.60^\\circ-100.02^\\circ=-1.42^\\circ\\end{aligned}$$',
  '$$|G_c(s_0)|=\\frac{\\sqrt{0.5936^2+3.9255^2}}{\\sqrt{0.6936^2+3.9255^2}}=\\frac{3.970}{3.986}=0.996$$',
  '$|\\angle|<5^\\circ$ y $|G_c|\\approx1$: los polos dominantes casi no se mueven (con PI: $-0.6778\\pm j3.8359$, $K=158.10$; $K_P=158.10$, $K_I=15.81$).' ] } },
{ sec: 'fxs17', row: 1, ej: { lab: 'Ejemplo · P4 (PD)', b: [
  'Planta $\\dfrac{1}{s(s+4)(s+6)}$, $s_d=-3.613+j6.194$. Ángulo de cada polo al punto:',
  '$$\\begin{aligned}\\theta_0&=180^\\circ-\\arctan\\tfrac{6.194}{3.613}=120.26^\\circ\\\\ \\theta_4&=\\arctan\\tfrac{6.194}{0.387}=86.43^\\circ\\\\ \\theta_6&=\\arctan\\tfrac{6.194}{2.387}=68.93^\\circ\\end{aligned}$$',
  '$$\\begin{aligned}\\angle G(s_d)&=-(120.26^\\circ+86.43^\\circ+68.93^\\circ)\\\\ &=-275.61^\\circ\\end{aligned}$$',
  '$$\\theta_c=-180^\\circ-(-275.61^\\circ)=95.61^\\circ$$' ] } },
{ sec: 'fxs17', row: 2, ej: { lab: 'Ejemplo · P4 (cero) y P5 (polo del adelanto)', b: [
  'P4: el cero debe aportar $\\theta_z=95.61^\\circ$; como pasa de 90°, la tangente es negativa y el cero queda a la derecha de $\\sigma$:',
  '$$\\begin{aligned}z_c&=3.613+\\frac{6.194}{\\tan 95.61^\\circ}=3.613+\\frac{6.194}{-10.18}\\\\ &=3.613-0.609=3.005\\end{aligned}$$',
  'P5: $s_d=-10.5+j17.39$, cero fijo en $-10$. Ángulo sin el polo y lo que debe restar el polo:',
  '$$\\begin{aligned}\\angle&=91.65^\\circ-121.12^\\circ-101.38^\\circ=-130.86^\\circ\\\\ \\theta_p&=180^\\circ-130.86^\\circ=49.14^\\circ\\end{aligned}$$',
  '$$\\begin{aligned}p_c&=10.5+\\frac{17.39}{\\tan 49.14^\\circ}=10.5+\\frac{17.39}{1.1563}\\\\ &=10.5+15.04=25.54\\end{aligned}$$' ] } },
{ sec: 'fxs17', row: 9, ej: { lab: 'Ejemplo · P4 y P5', b: [
  'P4: distancias de los polos $0,-4,-6$ a $s_d$: $7.171,\\ 6.206,\\ 6.638$; del cero $-3.005$: $6.224$.',
  '$$K=\\frac{7.171\\cdot6.206\\cdot6.638}{6.224}=47.47$$',
  'P5: polos $0,-7,-25.54$ a $s_d$: $20.31,\\ 17.74,\\ 22.99$; cero $-10$: $17.40$.',
  '$$K=\\frac{20.31\\cdot17.74\\cdot22.99}{17.40}=476.2$$' ] } },
{ sec: 'fxs18', row: 1, ej: { lab: 'Desarrollo con variables · P6', b: [
  '$$\\begin{aligned}K\\,\\frac{(s+a)(s+b)}{s}&=K\\,\\frac{s^2+(a+b)s+ab}{s}\\\\ &=\\underbrace{K(a+b)}_{K_1}+\\underbrace{K\\,ab}_{K_2}\\,\\frac{1}{s}+\\underbrace{K}_{K_3}\\,s\\end{aligned}$$',
  'P6 ($K=4.5915$, $z_{PD}=55.96$, $z_{PI}=0.5$):',
  '$$K_1=4.5915(56.46)=259.2\\qquad K_2=4.5915(55.96)(0.5)=128.5\\qquad K_3=4.59$$' ] } },
{ sec: 'fxs20', after: 'end', add: {
  mh: '<code>[num,den] = tfdata(G,\'v\');<br>[q,~] = polyder(num,den);<br>sb = roots(q)<br>Kb = -polyval(den,sb)./polyval(num,sb)</code>',
  n: 'Puntos de ruptura y su ganancia en MATLAB (<code>polyder(num,den)</code> da el numerador de la derivada de N/D, o sea N′D − ND′). Quédate con las σ<sub>b</sub> reales sobre el LGDR (K<sub>b</sub> &gt; 0). P1: −2.845 → 3.079.',
  k: 'ruptura matlab polyder kb ganancia en el punto de ruptura' } },
];

// --- quitar lo generado antes ---
html = html.replace(/<details class="fx-ej">[\s\S]*?<\/details>/g, '');
html = html.replace(/<!--fx-add-->[\s\S]*?<!--\/fx-add-->/g, '');

function sectionRange(id) {
  const a0 = html.indexOf(`id="${id}"`); if (a0 < 0) throw new Error('no está ' + id);
  const a = html.lastIndexOf('<section', a0);
  const re = /<section\b|<\/section>/g; re.lastIndex = a; let n = 0, m;
  while ((m = re.exec(html))) { n += m[0][1] === '/' ? -1 : 1; if (!n) return [a, m.index]; }
  throw new Error('sección sin cerrar ' + id);
}
// Hijos directos div/figure de la sección: [{s, e, tag}] (s = inicio de la etiqueta, e = después del cierre)
function children(id) {
  const [a, b] = sectionRange(id), out = [];
  const re = /<(\/?)(div|figure)\b[^>]*>/g; re.lastIndex = html.indexOf('>', a) + 1;
  let d = 0, cur = null, m;
  while ((m = re.exec(html)) && m.index < b) {
    if (!m[1]) { if (!d) cur = { s: m.index, tag: m[2], open: m[0] }; d++; }
    else { d--; if (!d && cur) { cur.e = re.lastIndex; out.push(cur); cur = null; } }
  }
  return { list: out, end: b };
}
// Ordenar: por sección y, dentro, de abajo hacia arriba (las filas nuevas mueven los índices de las de abajo)
const pos = e => e.ej ? e.row : (e.after === 'end' ? 1e9 : e.after + 0.5);
const order = E.map((e, i) => ({ e, i })).sort((x, y) => x.e.sec < y.e.sec ? -1 : x.e.sec > y.e.sec ? 1 : (pos(y.e) - pos(x.e) || y.i - x.i));
for (const { e } of order) {
  const { list, end } = children(e.sec);
  if (e.ej) {
    const c = list[e.row - 1]; if (!c || !/class="fx-r/.test(c.open)) throw new Error(`${e.sec} fila ${e.row}: ${c && c.open}`);
    const p = c.e - `</${c.tag}>`.length;
    html = html.slice(0, p) + ejHTML(e.ej) + html.slice(p);
  } else {
    const p = e.after === 'end' ? end : list[e.after - 1].e;
    html = html.slice(0, p) + addHTML(e.add) + html.slice(p);
  }
}
fs.writeFileSync(FILE, html);
console.log('formulario: ' + E.length + ' desarrollos/filas');
