/* Genera la plantilla de reportes en Word (P1–P7) con el formato de «Reporte_P2_Equipo_5»
   (Times New Roman, carta, logos en el encabezado, título centrado, Resumen y Palabras clave a una
   columna y el cuerpo a dos columnas) y la estructura de la guía (10 puntos del reporte + todos los
   pasos del procedimiento obligatorio).
   Uso:  node herramientas/plantilla-reportes.js            (escribe los .docx en plantillas/)
   Datos de cada práctica: herramientas/plantilla/datos.js · código MATLAB: se lee de index.html. */
const fs = require('fs');
const path = require('path');
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, ImageRun, Header, Tab,
  AlignmentType, BorderStyle, ShadingType, WidthType, SectionType, TabStopType, LevelFormat,
  VerticalAlign, Math: OMath, MathRun, MathFraction, MathSuperScript, MathSubScript, MathRadical, MathAngledBrackets,
  HeightRule
} = require('docx');

const JSZip = (() => { try { return require('jszip'); } catch (e) { return require(path.join(path.dirname(require.resolve('docx')), '..', '..', 'jszip')); } })();
const ROOT = path.join(__dirname, '..');
const P = require('./plantilla/datos.js');
/* enunciados del libro (cotejados con las fotos de Nise, CECSA): se leen de enunciados-libro.js sin ejecutarlo */
const ENUN = (() => {
  const s = fs.readFileSync(path.join(__dirname, 'enunciados-libro.js'), 'utf8');
  const a = s.indexOf('const DATA = {'), b = s.indexOf('\n};', a);
  return new Function(s.slice(a, b + 3) + '\nreturn DATA;')();
})();
const OUT = path.join(ROOT, 'plantillas');

/* ── formato (igual al reporte de la práctica 2) ── */
const FONT = 'Times New Roman';
const PAGE = { w: 12240, h: 15840 };            // carta
const MAR = { top: 2520, bottom: 1134, left: 1134, right: 1134, header: 700, footer: 500 };
const TW = PAGE.w - MAR.left - MAR.right;        // 9972
const GAP = 360;
const CW = Math.floor((TW - GAP) / 2) - 6;       // ancho de columna ≈ 4800
const HINT = '1F5FBF';                           // azul de las indicaciones ✎
const EQUIPO = 'Equipo 5';
const AUTORES = [
  ['Hector Dario Campos Cofradia', '22030879@itcelaya.edu.mx'],
  ['Kevin Santiago Sánchez Rojas', '21030216@itcelaya.edu.mx'],
  ['Cristian Leonardo López Bernal', '21031379@itcelaya.edu.mx']
];
const LIBRO = 'N. S. Nise, Sistemas de control para ingeniería, 3.ª ed. (1.ª ed. en español), 3.ª reimpresión. México: Compañía Editorial Continental (CECSA), 2006.';

/* ── código MATLAB de la página ── */
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const unesc = s => s.replace(/<[^>]+>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"')
  .replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&');
function codeOf(n) {
  const i = html.indexOf(`id="p${n}-mat"`), j = html.indexOf('</details>', i);
  const m = html.slice(i, j).match(/<pre[^>]*>([\s\S]*?)<\/pre>/);
  return m ? unesc(m[1]).replace(/\s+$/, '') : '';
}
const PZ = (() => {
  const i = html.indexOf('function [s0'); const j = html.lastIndexOf('<pre', i);
  return unesc(html.slice(html.indexOf('>', j) + 1, html.indexOf('</pre>', i))).replace(/\s+$/, '');
})();

/* ── texto con marcado: _x _{xy} ^x ^{xy} **negritas** \_ ── */
function runs(str, o = {}) {
  const out = []; let buf = '', bold = !!o.bold; let i = 0;
  const base = { font: o.font || FONT, size: o.size || 24, italics: o.italics, color: o.color };
  const flush = () => { if (buf) { out.push(new TextRun({ ...base, text: buf, bold })); buf = ''; } };
  while (i < str.length) {
    const c = str[i];
    if (c === '\\' && str[i + 1] === '_') { buf += '_'; i += 2; continue; }
    if (c === '*' && str[i + 1] === '*') { flush(); bold = !bold; i += 2; continue; }
    if ((c === '_' || c === '^') && i + 1 < str.length && str[i + 1] !== ' ') {
      flush(); let t;
      if (str[i + 1] === '{') { const k = str.indexOf('}', i); t = str.slice(i + 2, k); i = k + 1; }
      else { t = str[i + 1]; i += 2; }
      out.push(new TextRun({ ...base, text: t, bold, [c === '_' ? 'subScript' : 'superScript']: true }));
      continue;
    }
    buf += c; i++;
  }
  flush(); return out;
}

/* ── ecuaciones de Word desde un TeX mínimo ── */
function mparse(s) {
  let i = 0;
  function group() {                       // lee {…} o un carácter
    if (s[i] === '{') { let d = 0, j = i; for (; j < s.length; j++) { if (s[j] === '{') d++; else if (s[j] === '}' && --d === 0) break; } const g = s.slice(i + 1, j); i = j + 1; return mparseStr(g); }
    const ch = s[i++]; return [new MathRun(ch)];
  }
  function mparseStr(g) { const save = [s, i]; s = g; i = 0; const r = seq(); [s, i] = save; return r; }
  function seq() {
    const out = []; let buf = '';
    const flush = () => { if (buf) { out.push(new MathRun(buf)); buf = ''; } };
    while (i < s.length) {
      if (s.startsWith('\\frac', i)) { flush(); i += 5; const a = group(), b = group(); out.push(new MathFraction({ numerator: a, denominator: b })); continue; }
      if (s.startsWith('\\abs', i)) { flush(); i += 4; out.push(new MathAngledBrackets({ children: group() })); continue; }
      if (s.startsWith('\\sqrt', i)) { flush(); i += 5; out.push(new MathRadical({ children: group() })); continue; }
      const c = s[i];
      if (c === '^' || c === '_') {
        let baseRun;
        if (buf) { baseRun = [new MathRun(buf.slice(-1))]; buf = buf.slice(0, -1); flush(); }
        else baseRun = [out.pop()];
        i++; const g = group();
        out.push(c === '^' ? new MathSuperScript({ children: baseRun, superScript: g }) : new MathSubScript({ children: baseRun, subScript: g }));
        continue;
      }
      buf += c; i++;
    }
    flush(); return out;
  }
  return seq();
}
const eqP = tex => new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 60, after: 120 }, children: [new OMath({ children: mparse(tex) })] });

/* ── bloques ── */
const J = AlignmentType.JUSTIFIED, C = AlignmentType.CENTER;
const p = (str, o = {}) => new Paragraph({ alignment: o.align || J, spacing: { after: o.after ?? 160, before: o.before || 0 }, keepNext: o.keepNext, children: runs(str, o) });
const hint = (str, o = {}) => new Paragraph({ alignment: J, spacing: { after: 140 }, children: [new TextRun({ text: '✎ ', font: FONT, size: 22, color: HINT, bold: true }), ...runs(str, { size: 22, italics: true, color: HINT })], ...o });
const hintB = str => new Paragraph({ alignment: J, numbering: { reference: 'vin', level: 0 }, spacing: { after: 60 }, children: runs(str, { size: 22, italics: true, color: HINT }) });
const blank = (label, o = {}) => p(`${label} ________________________________`, { after: 160, ...o });
const H1 = (num, title) => new Paragraph({ heading: 'Heading1', spacing: { before: 240, after: 160 }, keepNext: true,
  children: [new TextRun({ text: num + '.', font: FONT, size: 24 }), new TextRun({ children: [new Tab()], font: FONT }), new TextRun({ text: title, font: FONT, size: 24, bold: true })],
  tabStops: [{ type: TabStopType.LEFT, position: 560 }] });
const H2 = str => new Paragraph({ heading: 'Heading2', spacing: { before: 200, after: 120 }, keepNext: true, children: runs(str, { bold: true }) });

function figBox(ctx, cap, lines, o = {}) {
  ctx.fig++;
  const bd = { style: BorderStyle.DASHED, size: 6, color: '8C8C8C', space: 6 };
  const box = { top: bd, left: bd, bottom: bd, right: bd };
  const sh = { type: ShadingType.CLEAR, color: 'auto', fill: 'F2F2F2' };
  const mk = (children, extra = {}) => new Paragraph({ alignment: C, border: box, shading: sh, indent: { left: 120, right: 120 }, keepNext: true, keepLines: true, spacing: { after: 0, line: 260 }, children, ...extra });
  const out = [mk([new TextRun({ text: '[ Pega aquí la imagen ]', font: FONT, size: 22, bold: true, color: '595959' })], { spacing: { before: 0, after: 0 } })];
  out.push(mk(runs(cap, { size: 20, italics: true, color: '595959' })));
  for (const l of lines) {
    if (typeof l === 'object') out.push(mk([new TextRun({ text: 'MATLAB: ', font: FONT, size: 18, bold: true, color: HINT }), new TextRun({ text: l.code, font: 'Courier New', size: 16, color: HINT })]));
    else out.push(mk(runs(l, { size: 18, italics: true, color: HINT })));
  }
  for (let k = 0; k < (o.short ? 0 : o.tall ? 5 : 3); k++) out.push(mk([new TextRun({ text: '', size: 20 })]));
  out.push(new Paragraph({ alignment: C, spacing: { before: 80, after: 200 }, children: [new TextRun({ text: `Figura ${ctx.fig}: `, font: FONT, size: 20, bold: true }), ...runs(cap, { size: 20, bold: true })] }));
  return out;
}

function table(ctx, cap, head, rows, widths, o = {}) {
  ctx.tab++;
  const W = o.width || CW;
  const sum = widths.reduce((a, b) => a + b, 0); const ws = widths.map(x => Math.round(x * W / sum)); ws[ws.length - 1] += W - ws.reduce((a, b) => a + b, 0);
  const b = { style: BorderStyle.SINGLE, size: 4, color: '808080' };
  const borders = { top: b, bottom: b, left: b, right: b };
  const cell = (txt, k, hdr, rowO = {}) => new TableCell({
    width: { size: ws[k], type: WidthType.DXA }, borders, verticalAlign: VerticalAlign.CENTER,
    shading: hdr ? { type: ShadingType.CLEAR, color: 'auto', fill: 'D9D9D9' } : (rowO.fill ? { type: ShadingType.CLEAR, color: 'auto', fill: rowO.fill } : undefined),
    margins: { top: 40, bottom: 40, left: 80, right: 80 },
    children: [new Paragraph({ alignment: k === 0 && !hdr && !o.center0 ? AlignmentType.LEFT : C, children: runs(txt ?? '', { size: 19, bold: hdr || (k === 0 && o.bold0), font: o.mono && !hdr && k > 0 ? 'Courier New' : FONT }) })]
  });
  const trs = [new TableRow({ tableHeader: true, children: head.map((h, k) => cell(h, k, true)) })];
  for (const r of rows) trs.push(new TableRow({ height: { value: 340, rule: HeightRule.ATLEAST }, children: head.map((_, k) => cell(r[k], k, false)) }));
  return [
    new Paragraph({ alignment: C, keepNext: true, spacing: { before: 120, after: 80 }, children: [new TextRun({ text: `Tabla ${ctx.tab}: `, font: FONT, size: 20, bold: true }), ...runs(cap, { size: 20, bold: true })] }),
    new Table({ width: { size: W, type: WidthType.DXA }, columnWidths: ws, rows: trs }),
    new Paragraph({ spacing: { after: 120 }, children: [] })
  ];
}

const sRows = n => Array.from({ length: n + 1 }, (_, k) => [`s^${n - k}`, '', '', '']);
const blanks = (n, first = '') => Array.from({ length: n }, (_, k) => [first ? `${first} ${k + 1}` : '', '', '']);

function codeBlock(text) {
  const sh = { type: ShadingType.CLEAR, color: 'auto', fill: 'F5F5F5' };
  return text.split('\n').map(l => new Paragraph({ shading: sh, spacing: { after: 0, line: 240 }, children: [new TextRun({ text: l || ' ', font: 'Courier New', size: 16 })] }));
}

/* ── encabezado con logos ── */
const LOGO_L = fs.readFileSync(path.join(__dirname, 'plantilla/tecnm.png'));
const LOGO_R = fs.readFileSync(path.join(__dirname, 'plantilla/dsm.png'));
const header = () => new Header({ children: [new Paragraph({
  tabStops: [{ type: TabStopType.RIGHT, position: TW }],
  children: [
    new ImageRun({ type: 'png', data: LOGO_L, transformation: { width: 79, height: 96 }, altText: { title: 'TecNM Celaya', description: 'Logo del TecNM Celaya', name: 'tecnm' } }),
    new TextRun({ children: [new Tab()] }),
    new ImageRun({ type: 'png', data: LOGO_R, transformation: { width: 111, height: 96 }, altText: { title: 'TecNM Celaya DSM', description: 'Logo 4.0 TecNM Celaya DSM', name: 'dsm' } })
  ]
})] });

const pageProps = (cols, type) => ({
  type, page: { size: { width: PAGE.w, height: PAGE.h }, margin: MAR },
  column: cols === 2 ? { count: 2, space: GAP, equalWidth: true } : { count: 1, space: GAP }
});

/* ── página de instrucciones ── */
function instrucciones() {
  const ctx = { fig: 0, tab: 0 };
  const ch = [
    p('Plantilla de reportes', { align: C, bold: true, size: 32, after: 60 }),
    p('Prácticas de diseño de compensadores mediante el lugar geométrico de las raíces', { align: C, bold: true, size: 26, after: 240 }),
    hint('Esta página es sólo una guía de uso: **bórrala antes de entregar**.'),
    p('**Cómo está organizada.** Cada práctica empieza en una página nueva con el formato del reporte de la práctica 2 (encabezado con logos, datos del equipo, Resumen y Palabras clave) y sigue a dos columnas con los 10 puntos de la «Estructura del reporte» de la guía. Los 5 pasos de la etapa «Análisis del sistema de referencia» están en el punto III y los 6 pasos de la «Verificación del sistema completo» en los puntos VI (pasos 1, 2, 3 y 5) y VII (pasos 4, 5 y 6).', { size: 22, after: 100 }),
    p('**Qué significa cada cosa:**', { size: 22, after: 80 }),
    hint('Texto azul con el lápiz = indicación o valores de la página para comparar. Bórralo cuando escribas tu texto.'),
    ...figBox(ctx, 'Recuadro gris = lugar para pegar una imagen de MATLAB, Simulink o una foto de tus cálculos', [{ code: 'comando sugerido para obtener la gráfica' }, 'Toca dentro del recuadro, borra el texto y usa Insertar → Imagen. Si quieres, quita el borde después.'], { short: true }),
    p('Las tablas tienen los encabezados listos; llena las celdas vacías con tus resultados. Las líneas «________» son para valores que calcules. Los números de figura y tabla ya están puestos (empiezan en 1 en cada práctica); si borras una figura que no uses, renumera las siguientes.', { size: 22, after: 100 }),
    p('**Para sacar las imágenes de MATLAB:** en la ventana de la figura, Archivo → Guardar como → PNG, o en la Command Window:', { size: 22, after: 80 }),
    ...codeBlock("exportgraphics(gcf, 'P1_fig3.png', 'Resolution', 200)   % guarda la figura actual\n% Salidas de texto (pole, stepinfo, …): captura de pantalla de la Command Window"),
    p('**Código MATLAB.** En el anexo (punto X) de cada práctica está el código de la página, ordenado por etapas, y la función auxiliar puntoZeta.m (guárdala en la misma carpeta). Córrelo sección por sección para obtener cada figura.', { size: 22, after: 100 }),
    p('**Antes de entregar:** borra esta página, todos los textos azules ✎ y los recuadros grises que no uses; revisa que cada figura y tabla esté citada en el texto. Para la fecha y los nombres usa los datos del equipo que ya están en la portada de cada práctica.', { size: 22, after: 100 }),
    ...table(ctx, 'Secuencia de prácticas (de la guía)', ['Práctica', 'Tema y producto principal', 'Ejercicio y página'],
      P.map(x => [String(x.n), x.tema, `${x.ej}. Página ${x.pag}.`]), [1, 3.2, 3.2], { width: TW, center0: true })
  ];
  return ch;
}

/* enunciado textual del libro */
function enunciado(n) {
  const D = ENUN['p' + n]; if (!D) return [hint('Copia aquí el enunciado del libro.')];
  const clean = x => x.replace(/\$([^$]*)\$/g, '$1').replace(/<[^>]+>/g, '');
  const q = (children, o = {}) => new Paragraph({ alignment: J, indent: { left: 240, ...(o.indent || {}) }, spacing: { after: o.after ?? 80 }, keepNext: o.keepNext, children });
  const out = [p(`Enunciado del libro (${D.ref.replace(/^Nise · /, 'Nise, ').replace(/ · /g, ', ')}):`, { after: 80, keepNext: true, italics: true })];
  const label = D.ej ? [new TextRun({ text: 'Problema: ', font: FONT, size: 24, bold: true })] : [new TextRun({ text: 'Problema ', font: FONT, size: 24, bold: true, italics: true })];
  if (D.ej) {
    out.push(q([...label, ...runs(clean(D.pre))], { keepNext: true }));
    out.push(eqP(D.eq.replace(/\\dfrac/g, '\\frac')));
    out.push(q(runs(clean(D.post)), { keepNext: true }));
    D.items.forEach((it, k) => out.push(q([new TextRun({ text: String.fromCharCode(97 + k) + ')', font: FONT, size: 24 }), new TextRun({ children: [new Tab()], font: FONT }), ...runs(clean(it))], { indent: { left: 600, hanging: 360 } })));
  } else {
    out.push(q([...label, ...runs(clean(D.text))]));
    if (D.cap) out.push(hint('La figura del enunciado (' + clean(D.cap).replace(/\.$/, '') + ') es el diagrama del punto 3; puedes pegar ahí la del libro o la de Simulink.'));
  }
  out.push(p('', { after: 60 }));
  return out;
}

/* ── una práctica ── */
function practica(X) {
  const ctx = { fig: 0, tab: 0 };
  const n = X.n, R = X.ref, V = X.ver, M = X.mat;

  /* Sección A: título, autores, resumen, palabras clave (una columna) */
  const A = [
    ...['Tecnológico Nacional de México en Celaya', 'Departamento de Ingeniería Mecatrónica', `Práctica ${n}: ${X.tema}`, EQUIPO]
      .map(t => p(t, { align: C, bold: true, size: 28, after: 0 })),
    p('', { after: 120 }),
    ...AUTORES.map(([a, m]) => p(`${a} ${m}`, { align: C, bold: true, after: 0 })),
    p('', { after: 120 }),
    p('**Resumen**', { after: 0, keepNext: true }),
    hint('Escribe aquí el resumen (5–7 líneas): qué sistema se estudió, qué se diseñó y con qué método (LGDR, condiciones de ángulo y magnitud), los resultados clave con números y si se cumplieron las especificaciones. ' + X.resumen),
    new Paragraph({ alignment: J, spacing: { before: 120, after: 160 }, children: [new TextRun({ text: 'Palabras Clave', font: FONT, size: 24, bold: true }), new TextRun({ text: ': ' + X.claves, font: FONT, size: 24 })] })
  ];

  /* Sección B: cuerpo a dos columnas */
  const B = [];
  // I
  B.push(H1('I', 'Identificación y referencia del ejercicio'));
  B.push(...table(ctx, 'Identificación de la práctica', ['Dato', 'Valor'], [
    ['Práctica', `${n} · ${X.tema}`], ['Ejercicio', `${X.ej}, p. ${X.pag}`], ['Libro', 'Nise, Sistemas de control para ingeniería (CECSA, 2006)'],
    ['Capítulo', X.cap], ['Equipo', '5'], ['Fecha de realización', ''], ['Archivo MATLAB', `Practica${n}\\_Equipo5.m`]
  ], [1, 1.9], { bold0: true }));
  B.push(p('**Objetivo.** ' + X.obj));
  B.push(hint('Si lo pide el profesor, agrega aquí 2–3 líneas de introducción: qué hace este tipo de compensador y por qué se usa el LGDR para diseñarlo.'));

  // II
  B.push(H1('II', 'Planteamiento, modelo, diagrama y especificaciones'));
  B.push(H2('1. Planteamiento'));
  B.push(...enunciado(n));
  B.push(H2('2. Modelo'));
  X.model.forEach(t => B.push(eqP(t)));
  B.push(p(X.modelNota));
  B.push(H2('3. Diagrama de bloques'));
  B.push(...figBox(ctx, 'Diagrama de bloques del sistema en lazo cerrado (Simulink)', ['Pega la captura del modelo de Simulink (o dibuja el diagrama).', 'Bloques: ' + X.cadena]));
  B.push(H2('4. Especificaciones'));
  B.push(...table(ctx, 'Especificaciones de diseño', ['Especificación', 'Meta', 'Cómo se verifica'], X.specs, [1.3, 1.2, 1.3]));

  // III
  B.push(H1('III', 'Análisis inicial y desempeño de referencia'));
  B.push(p('Etapa del procedimiento obligatorio: análisis del sistema de referencia (pasos 1 a 5 y evidencia).', { italics: true }));
  B.push(H2('Paso 1. Ganancia de referencia (no asumir que es uno)'));
  B.push(blank('K de referencia ='));
  B.push(hint(R.k));
  B.push(H2('Paso 2. Polos, ceros, tipo y ecuación característica'));
  B.push(...table(ctx, 'Polos, ceros y tipo del sistema sin compensar', ['Polos de lazo abierto', 'Ceros', 'Tipo'], [['', '', '']], [1.6, 1, 0.8]));
  B.push(p('Ecuación característica 1 + KG(s) = 0:', { after: 0 }));
  B.push(eqP(R.eq));
  B.push(hint(R.polos + ' ' + R.forma));
  B.push(...figBox(ctx, 'Cálculos a mano: polos, ceros, asíntotas y punto de ruptura', ['Foto de tu hoja de cálculos (opcional si los escribes aquí).']));
  B.push(H2('Paso 3. Estabilidad y rango de ganancia estable'));
  B.push(...table(ctx, 'Arreglo de Routh del sistema sin compensar', ['Fila', 'Col. 1', 'Col. 2', 'Col. 3'], sRows(R.orden), [0.7, 1.4, 1.4, 1]));
  B.push(blank('Rango de K estable:'));
  B.push(hint(R.routh + ' En MATLAB: [Gm,~,wcg] = margin(G) da la K crítica.'));
  B.push(H2('Paso 4. Polos en lazo cerrado con la ganancia de referencia'));
  B.push(...table(ctx, 'Polos en lazo cerrado de referencia', ['Polo', 'Valor', 'Observación'], blanks(R.orden, 'p'), [0.6, 1.6, 1.6]));
  B.push(hint(R.polosLC + ' En MATLAB: pole(feedback(K*G,1)).'));
  B.push(H2('Paso 5. Respuesta transitoria y error estacionario'));
  B.push(hint(R.desemp));
  B.push(blank(''));
  B.push(H2('Evidencia de la etapa'));
  B.push(...figBox(ctx, 'LGDR inicial (sistema sin compensar) con la recta de ζ', [{ code: R.lgdr }]));
  B.push(...figBox(ctx, 'Respuesta temporal de referencia al escalón', [{ code: R.resp }]));
  if (R.extraFig) B.push(...figBox(ctx, R.extraFig[0], R.extraFig.slice(1)));
  B.push(...table(ctx, 'Desempeño de referencia', ['Magnitud', 'Analítico (2.º orden)', 'Simulación (MATLAB)'], R.tab.map(r => [r[0], '', '']), [1.2, 1.2, 1.2]));
  B.push(hint('Guía analítica: ' + R.tab.map(r => `${r[0]} = ${r[1]}`).join('; ') + '. ' + R.tabGuia));

  // IV
  B.push(H1('IV', 'Desarrollo y justificación del diseño'));
  B.push(hint('Justifica cada decisión (por qué ese punto de diseño, por qué ese cero o polo). Escribe las ecuaciones con tus valores o pega fotos de tus cálculos.'));
  for (const d of X.dis) {
    B.push(H2(d.t));
    (d.eq || []).forEach(t => B.push(eqP(t)));
    if (d.h) B.push(hint(d.h));
    B.push(blank(''));
    if (d.fig) B.push(...figBox(ctx, d.fig[0], d.fig.slice(1)));
  }

  // V
  B.push(H1('V', 'Controlador final y parámetros'));
  X.ctrl.eq.forEach(t => B.push(eqP(t)));
  B.push(...table(ctx, 'Parámetros del controlador final', ['Parámetro', 'Valor obtenido', 'Guía (página)'], X.ctrl.rows.map(r => [r[0], '', r[1]]), [1.5, 1.1, 1.2]));
  B.push(hint(X.ctrl.h));

  // VI
  B.push(H1('VI', 'Comprobación analítica'));
  B.push(p('Etapa del procedimiento obligatorio: verificación del sistema completo (pasos 1, 2, 3 y 5).', { italics: true }));
  B.push(H2('Paso 1. Ecuación característica final y todos los polos en lazo cerrado'));
  B.push(blank('1 + K·G_c(s)·G(s) = 0 →'));
  B.push(...table(ctx, 'Polos en lazo cerrado del sistema compensado', ['Polo', 'Valor', 'Observación'], blanks(V.orden, 'p'), [0.6, 1.6, 1.6]));
  B.push(hint(V.eq));
  B.push(H2('Paso 2. Estabilidad y comparación con los polos candidatos'));
  B.push(...table(ctx, 'Arreglo de Routh del sistema compensado', ['Fila', 'Col. 1', 'Col. 2', 'Col. 3'], sRows(V.orden), [0.7, 1.4, 1.4, 1]));
  B.push(blank('Rango de K estable:'));
  B.push(hint(V.est));
  B.push(...table(ctx, 'Polos candidatos (diseño) contra polos obtenidos', ['Polos', 'Candidato', 'Obtenido', 'Dif. (%)'], V.cand.map(r => [r[0], r[1], '', '']), [1.2, 1.3, 1.3, 0.7]));
  B.push(hint('Guía: ' + V.cand.map(r => `${r[0]} obtenido = ${r[2]}`).join('; ') + '. ' + V.candH));
  B.push(H2('Paso 3. ¿Es razonable la aproximación de polos dominantes?'));
  B.push(...table(ctx, 'Modos del sistema y residuos al escalón', ['Polo', 'Residuo', 'Lectura'], blanks(V.modos.length), [1.3, 0.9, 1.6]));
  B.push(hint('Guía: ' + V.modos.map(r => `${r[0]} → ${r[1]}`).join('; ') + '. ' + V.aprox));
  B.push(hint('Residuos en MATLAB: [num,den] = tfdata(T,\'v\'); [r,pp] = residue(num, conv(den,[1 0])).'));
  B.push(blank('Conclusión:'));
  B.push(H2('Paso 5. Error estacionario correspondiente (analítico)'));
  B.push(blank('K_p / K_v ='));
  B.push(blank('e(∞) ='));
  B.push(hint(V.err));
  B.push(new Paragraph({ alignment: J, spacing: { before: 80, after: 200 },
    border: { left: { style: BorderStyle.SINGLE, size: 18, color: 'C00000', space: 8 } }, indent: { left: 160 },
    children: [new TextRun({ text: 'Advertencia de la guía: ', font: FONT, size: 22, bold: true }), new TextRun({ text: 'La apariencia acotada de una simulación no demuestra estabilidad. Una cancelación tampoco justifica ignorar modos inestables. Revisar los modos del sistema antes de efectuar simplificaciones.', font: FONT, size: 22, italics: true })] }));

  // VII
  B.push(H1('VII', 'Comprobación en MATLAB'));
  B.push(p('Pasos 4, 5 y 6 de la verificación del sistema completo, con el modelo completo (sin simplificar polos).', { italics: true }));
  B.push(H2('Paso 4. Simulación de las entradas requeridas y desempeño del modelo completo'));
  B.push(p('Entradas simuladas: ' + M.entradas));
  M.figs.forEach(f => B.push(...figBox(ctx, f[0], f.slice(1), { tall: /Respuesta|Error/.test(f[0]) })));
  B.push(...table(ctx, 'Especificaciones contra desempeño simulado', ['Especificación', 'Meta', 'Obtenido', '¿Cumple?'], M.metas.map(r => [r[0], r[1], '', '']), [1.3, 1.0, 1.05, 0.85]));
  B.push(hint('Guía (simulación de la página): ' + M.metas.map(r => `${r[0]}: ${r[2]}`).join('; ') + '.'));
  B.push(H2('Paso 5. Error estacionario simulado'));
  B.push(blank('e(∞) simulado ='));
  B.push(hint(M.errSim));
  B.push(H2('Paso 6. Ajuste del diseño y repetición de la verificación'));
  B.push(hint(M.ajuste));
  B.push(blank(''));
  if (M.ajusteFig) B.push(...figBox(ctx, M.ajusteFig[0], M.ajusteFig.slice(1), { tall: true }));
  B.push(H2('Modelo en Simulink'));
  B.push(...figBox(ctx, 'Respuesta en el Scope de Simulink del sistema final', ['Bloques: ' + X.cadena, 'Escalón: Step time = 0, Final value = 1. Ajusta el Stop time para ver el asentamiento.'], { tall: true }));

  // VIII
  B.push(H1('VIII', 'Comparación y discusión'));
  B.push(...table(ctx, 'Comparación: libro, cálculo analítico y MATLAB', ['Magnitud', 'Libro', 'Analítico', 'MATLAB'], X.cmp.map(r => [r[0], r[1], '', '']), [1.4, 1.1, 0.9, 0.9]));
  B.push(hint('Explica las diferencias: ¿de redondeo o por un polo/cero que la aproximación ignora? ¿Se cumplieron todas las especificaciones? ' + X.disc));
  B.push(blank(''));

  // IX
  B.push(H1('IX', 'Conclusiones y limitaciones demostradas'));
  B.push(hint('Ideas de la página para redactar (escríbelas con tus resultados):'));
  X.con.forEach(c => B.push(hintB(c)));
  B.push(blank(''));
  B.push(H2('Conclusiones individuales'));
  AUTORES.forEach(([a]) => { B.push(p(a, { after: 80, keepNext: true })); B.push(hint(`Conclusión de ${a.split(' ')[0]} (5–8 líneas): qué aprendiste, qué fue difícil y qué te dicen los resultados.`)); });

  /* Sección C: anexo y referencias (una columna, para que el código quepa) */
  const Cc = [];
  Cc.push(H1('X', 'Anexo con archivo ejecutable y cálculos'));
  Cc.push(H2('A. Archivo ejecutable'));
  Cc.push(hint(`Guarda el código como Practica${n}\\_Equipo5.m (junto con puntoZeta.m) y pega aquí la versión que usaste. Abajo está el de la página como punto de partida; córrelo sección por sección (Ctrl + Enter) para obtener cada figura.`));
  Cc.push(...codeBlock(codeOf(n)));
  Cc.push(p('', { after: 120 }));
  Cc.push(H2('B. Función auxiliar puntoZeta.m'));
  Cc.push(...codeBlock(PZ));
  Cc.push(p('', { after: 120 }));
  Cc.push(H2('C. Cálculos'));
  Cc.push(...figBox(ctx, 'Hojas de cálculos a mano', ['Fotos de tus cálculos (Routh, ángulos, magnitudes, error). Agrega más recuadros si hace falta.'], { tall: true }));
  Cc.push(new Paragraph({ heading: 'Heading1', spacing: { before: 240, after: 160 }, keepNext: true, children: [new TextRun({ text: 'Referencias', font: FONT, size: 24, bold: true })] }));
  const refs = [
    `[1] ${LIBRO}`,
    '[2] Prácticas de diseño de compensadores mediante el lugar geométrico de las raíces. Guía de trabajo.',
    '[3] MathWorks, MATLAB Documentation: Control System Toolbox, 2024. [En línea]. Disponible en: https://www.mathworks.com/help/control/',
    '[4] K. Ogata, Ingeniería de control moderna, 5.ª ed., Pearson Educación, 2010.'
  ];
  refs.forEach(r => Cc.push(new Paragraph({ alignment: J, spacing: { after: 40 }, children: [new TextRun({ text: r, font: 'Calibri', size: 22 })] })));
  Cc.push(hint('Agrega aquí cualquier otra fuente que consulten.'));

  return [
    { properties: pageProps(1, SectionType.NEXT_PAGE), headers: { default: header() }, children: A },
    { properties: pageProps(2, SectionType.CONTINUOUS), headers: { default: header() }, children: B },
    { properties: pageProps(1, SectionType.CONTINUOUS), headers: { default: header() }, children: Cc.filter(Boolean) }
  ];
}

function doc(sections) {
  return new Document({
    creator: 'Equipo 5', title: 'Reportes de prácticas · LGDR', description: 'Plantilla de reportes P1–P7',
    styles: {
      default: { document: { run: { font: FONT, size: 24 } } },
      paragraphStyles: [
        { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { font: FONT, size: 24, color: '000000' }, paragraph: { spacing: { before: 240, after: 160 }, keepNext: true, outlineLevel: 0 } },
        { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { font: FONT, size: 24, bold: true, color: '000000' }, paragraph: { spacing: { before: 200, after: 120 }, keepNext: true, outlineLevel: 1 } }
      ]
    },
    numbering: { config: [{ reference: 'vin', levels: [{ level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 360, hanging: 240 } }, run: { color: HINT } } }] }] },
    sections
  });
}

async function pack(d) {
  const z = await JSZip.loadAsync(await Packer.toBuffer(d));
  const x = (await z.file('word/document.xml').async('string')).replace(/m:val="〈"/g, 'm:val="|"').replace(/m:val="〉"/g, 'm:val="|"')
    // el esquema pide los bordes de párrafo en orden top, left, bottom, right
    .replace(/<w:pBdr>(<w:top [^>]*\/>)?(<w:bottom [^>]*\/>)?(<w:left [^>]*\/>)?(<w:right [^>]*\/>)?<\/w:pBdr>/g,
      (_, t, b, l, r) => `<w:pBdr>${t || ''}${l || ''}${b || ''}${r || ''}</w:pBdr>`);
  z.file('word/document.xml', x);
  return z.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const intro = { properties: pageProps(1, SectionType.NEXT_PAGE), headers: { default: header() }, children: instrucciones() };
  const all = [intro, ...P.flatMap(practica)];
  fs.writeFileSync(path.join(OUT, 'Reportes_P1-P7_Equipo_5.docx'), await pack(doc(all)));
  for (const X of P) {
    const secs = practica(X); secs[0] = { ...secs[0] };
    fs.writeFileSync(path.join(OUT, `Reporte_P${X.n}_Equipo_5.docx`), await pack(doc([{ ...intro, children: instrucciones() }, ...secs])));
  }
  console.log('Listo:', fs.readdirSync(OUT).join(', '));
})();
