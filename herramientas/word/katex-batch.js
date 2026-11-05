// Renderiza fórmulas TeX con el mismo KaTeX que trae index.html (sin dependencias).
// Uso: node herramientas/word/katex-batch.js < entrada.json > salida.json
//   entrada: [{"t": "\\frac{a}{b}", "d": true}, ...]   salida: ["<span class=\"katex\">…", ...]
const fs = require('fs'), path = require('path'), vm = require('vm');
const html = fs.readFileSync(path.join(__dirname, '..', '..', 'index.html'), 'utf8');
const i = html.indexOf('!function(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t()');
const j = html.indexOf('</script>', i);
const mod = { exports: {} };
vm.runInNewContext(html.slice(i, j), { module: mod, exports: mod.exports, self: {}, document: undefined, console });
const katex = mod.exports;
const inp = JSON.parse(fs.readFileSync(0, 'utf8'));
const errs = [];
const out = inp.map(({ t, d }, k) => {
  try { return katex.renderToString(t, { displayMode: !!d, throwOnError: true, strict: 'ignore', output: process.env.KATEX_OUT || 'html' }); }
  catch (e) { errs.push(k + ': ' + e.message + '  ←  ' + t); return katex.renderToString(t, { displayMode: !!d, throwOnError: false, strict: 'ignore' }); }
});
if (errs.length) process.stderr.write('KaTeX:\n' + errs.join('\n') + '\n');
process.stdout.write(JSON.stringify(out));
