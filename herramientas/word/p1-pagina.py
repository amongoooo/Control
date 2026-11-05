#!/usr/bin/env python3
"""P1 de la página en el orden del Word del usuario (v52).

  python3 -I herramientas/word/p1-pagina.py <Word descifrado .docx>

Lee la «Práctica 1» del Word (pandoc → HTML con TeX), la separa en las secciones I–IX y sus pasos, mete el
anexo «C. Cálculos» dentro de cada paso (plegable) y cambia cada figura por una simulación (`div.wsim[data-wsim=fN]`,
la arma el script «P1 · simulaciones del Word» de index.html). Las fórmulas se dibujan con el KaTeX de la página.
El resultado reemplaza lo que hay entre <!--p1w--> y <!--/p1w--> en index.html.

No se copian a la página (el Word va cifrado con PIN): portada (nombre, correo), Resumen, «Conclusión individual»,
Referencias y las capturas de MATLAB."""
import sys, re, json, subprocess, html as H, os, urllib.parse
from lxml import html as LH, etree

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
src = sys.argv[1]
full = subprocess.run(['pandoc', '-f', 'docx', '-t', 'html', '--mathjax', '--wrap=none', src],
                      check=True, capture_output=True, text=True).stdout
i = full.find('Práctica 1: Ajuste'); j = full.find('Práctica 2: Compensador integral')
assert i > 0 and j > i, 'no encontré la Práctica 1'
frag = full[full.rfind('<p', 0, i):full.rfind('<p', 0, j)]
doc = LH.fragment_fromstring('<div>' + frag + '</div>')
kids = list(doc)

txt = lambda e: re.sub(r'\s+', ' ', ''.join(e.itertext())).strip()
ser = lambda e: etree.tostring(e, encoding='unicode', method='html', with_tail=False)

# ---------------- TeX: palabras en texto recto, espacios que KaTeX no tiene ----------------
KEEP = {'ln': r'\ln ', 'tan': r'\tan ', 'cos': r'\cos ', 'sin': r'\sin ', 'max': r'\max ', 'min': r'\min ', 'lim': r'\lim ',
        'Re': r'\operatorname{Re}', 'Im': r'\operatorname{Im}'}
PROT = re.compile(r'\\(?:text|textbf|begin|end|mathrm|operatorname|mathbf)\{[^{}]*\}|\\[A-Za-z]+')
WORD = re.compile(r'[A-Za-zÁÉÍÓÚáéíóúñÑü]{2,}\.?')
def word(m):
    w = m.group(0)
    if w in KEEP: return KEEP[w]
    if re.fullmatch(r'[A-Z]{1,2}', w) or re.fullmatch(r'd[A-Z]', w): return w      # KG, KN, OS, dK: siguen en cursiva
    return r'\text{' + w + '}'
def fixtex(t):
    t = t.replace(r'\mspace{6mu}', r'\;').replace(r'\text{~}', r'\,')
    out, k = [], 0
    for m in PROT.finditer(t):
        out.append(WORD.sub(word, t[k:m.start()])); out.append(m.group(0)); k = m.end()
    out.append(WORD.sub(word, t[k:]))
    t = ''.join(out)
    return re.sub(r'\\text\{([^{}]*)\}((?:\\ +|\s)*)\\text\{', lambda m: r'\text{' + m.group(1) + ' ' * max(1, m.group(2).count('\\')), t)  # une palabras seguidas

MATH = []
def mathify(s):
    """\\( … \\) y \\[ … \\] → marcadores que luego llena KaTeX"""
    def rep(m, d):
        tex = H.unescape(m.group(1)); MATH.append({'t': fixtex(tex), 'd': d}); return '\x00M%d\x00' % (len(MATH) - 1)
    s = re.sub(r'<span class="math display">\\\[(.*?)\\\]</span>', lambda m: rep(m, True), s, flags=re.S)
    s = re.sub(r'<span class="math inline">\\\((.*?)\\\)</span>', lambda m: rep(m, False), s, flags=re.S)
    return s

# ---------------- recorrido del Word ----------------
SECS = []          # {num,title,intro:[html],steps:[step]}
cur = None; step = None; grp = None; annex = {}; ann_key = None
mode = 'pre'
pend_img = False
def new_step(h, sub=False):
    global step
    a = h.xpath('.//a[starts-with(@href,"#P1_c_")]')
    ck = a[0].get('href')[6:] if a else None
    up = [x for x in h.xpath('.//a') if x.get('href', '').startswith('#P1_q_')]
    for x in h.xpath('.//a'): x.drop_tree()
    t = txt(h)
    step = {'title': t, 'ck': ck, 'slug': h.get('id'), 'body': [], 'up': [u.get('href')[6:] for u in up], 'sub': sub, 'kids': []}
    if sub: grp['kids'].append(step)
    else: cur['steps'].append(step)
    return step
def add(html_):
    (step['body'] if step else cur['intro']).append(html_)

for e in kids:
    t = txt(e)
    if mode == 'annex':
        if e.tag == 'blockquote':
            for p in e:
                sp = p.xpath('.//span[starts-with(@id,"P1_c_")]')
                if sp:
                    ann_key = sp[0].get('id')[5:]; annex[ann_key] = []; continue
                if ann_key is None: continue
                if p.tag == 'p' and len(p) == 1 and p[0].tag == 'strong' and not (p.text or '').strip() and not (p[0].tail or '').strip():
                    annex[ann_key].append('<h5>' + H.escape(txt(p)) + '</h5>')
                else:
                    annex[ann_key].append(ser(p))
            continue
        if t.startswith('Referencias'): break
        continue
    if e.tag == 'h1':
        m = re.match(r'([IVX]+)\.\s*(.*)', t)
        cur = {'num': m.group(1), 'title': m.group(2), 'intro': [], 'steps': []}; SECS.append(cur)
        step = None; grp = None; mode = 'sec'; continue
    if mode == 'pre': continue
    if e.tag == 'h2' and t.startswith('C. Cálculos'): mode = 'annex'; continue
    if e.tag == 'h2' and t.startswith('Conclusión individual'): mode = 'skip'; continue
    if mode == 'skip': continue
    if e.tag in ('h2', 'h3') and e.xpath('.//img') and not t:
        pend_img = True; continue
    if e.tag == 'h2':
        grp = None
        s = new_step(e)
        if s['title'].startswith('Trazo del LGDR'): grp = s; s['grp'] = True; step = s
        continue
    if e.tag == 'h3' and grp is not None:
        new_step(e, sub=True); continue
    if e.tag == 'p' and e.xpath('.//img') and not t:
        pend_img = True; continue
    m = re.match(r'Figura (\d+):\s*(.*)', t)
    if e.tag == 'p' and m and pend_img:
        pend_img = False
        add('<figure class="wfig" data-fig="%s"><div class="wsim" data-wsim="f%s"><p class="wsim-ld">Cargando la simulación…</p></div>'
            '<figcaption><b>Figura %s:</b> %s <span class="wfsub">· simulación con el caso de la tarea</span></figcaption></figure>'
            % (m.group(1), m.group(1), m.group(1), H.escape(m.group(2))))
        continue
    m = re.match(r'Tabla (\d+):\s*(.*)', t)
    if e.tag == 'p' and m and len(e) == 1 and e[0].tag == 'strong':
        add('<p class="wcap"><b>Tabla %s:</b> %s</p>' % (m.group(1), H.escape(m.group(2)))); continue
    if e.tag == 'p' and t == 'Resultado:':
        add('\x01RES'); continue
    if e.tag == 'p' and t.startswith('✎'):
        code = re.sub(r'^✎\s*En MATLAB:\s*', '', t)
        if code != t: add('<p class="wml"><span>MATLAB</span><code>%s</code></p>' % H.escape(code.replace('−', '-')))
        else: add('<p class="wnote">%s</p>' % H.escape(t[1:].strip()))
        continue
    if e.tag == 'table':
        for c in e.xpath('.//colgroup'): c.drop_tree()
        for x in e.xpath('.//*[@style]'): x.attrib.pop('style')
        for x in e.xpath('.//tr[@class]'): x.attrib.pop('class')
        e.attrib.clear()
        add('<div class="tablewrap"><table class="wtab">' + ''.join(ser(c) for c in e) + '</table></div>'); continue
    if e.tag == 'blockquote':
        for sp in e.xpath('.//span[starts-with(@id,"P1_q_")]'):
            p = sp.getparent(); p.set('id', 'p1w-q-' + sp.get('id')[5:]); p.set('class', 'winc'); sp.drop_tree()
        add('<div class="wq">' + ''.join(ser(c) for c in e) + '</div>'); continue
    add(ser(e))

# ---------------- ids, vínculos y armado ----------------
SLUG = {}
n = 0
for S in SECS:
    for s in S['steps']:
        for x in [s] + s['kids']:
            n += 1
            x['id'] = 'p1w-' + (x['ck'] if x['ck'] else 's%d' % n)
            if x['slug']: SLUG[x['slug']] = x['id']
def links(h):
    def a(m):
        href, inner = urllib.parse.unquote(H.unescape(m.group(1))), m.group(2)
        if href.startswith('#'):
            k = href[1:]
            tgt = SLUG.get(k) or ('p1w-q-' + k[5:] if k.startswith('P1_q_') else None)
            if tgt: return '<button type="button" class="wgo" data-wgo="%s">%s</button>' % (tgt, inner)
        return inner
    return re.sub(r'<a href="([^"]*)"[^>]*>(.*?)</a>', a, h, flags=re.S)
def body(parts):
    """«Resultado:» + las fórmulas que le siguen → recuadro .wres"""
    out, i = [], 0
    while i < len(parts):
        p = parts[i]
        if p == '\x01RES':
            j = i + 1; box = []
            while j < len(parts) and re.fullmatch(r'<p><span class="math display">.*?</span></p>', parts[j].strip(), flags=re.S): box.append(parts[j]); j += 1
            out.append('<div class="wres"><b class="wres-h">Resultado</b>' + ''.join(box) + '</div>'); i = j; continue
        out.append(p); i += 1
    return ''.join(out)
def stepH(s, sec):
    up = ''.join('<button type="button" class="wgo wup" data-wgo="p1w-q-%s">↑ inciso %s)</button>' % (u, u) for u in s['up'])
    cal = annex.get(s['ck']) if s['ck'] else None
    calH = ('<details class="wcalc"><summary>Cálculos <small>· anexo C</small></summary><div class="wcalc-b">%s</div></details>' % ''.join(cal)) if cal else ''
    pre = 'Trazo · ' if s['sub'] else ''
    cls = 'xstep wstep' + (' wgrp' if s.get('grp') else '') + (' wsub' if s['sub'] else '')
    kids = ''.join(stepH(k, sec) for k in s['kids'])
    return ('<div class="%s" id="%s"><h4>%s%s</h4>%s%s%s%s</div>' % (cls, s['id'], pre, H.escape(s['title']), up, body(s['body']), calH, kids))
SHORT = {'I': 'Identificación', 'II': 'Planteamiento', 'III': 'Análisis inicial', 'IV': 'Diseño', 'V': 'Controlador final',
         'VI': 'Comprobación analítica', 'VII': 'Comprobación en MATLAB', 'VIII': 'Comparación', 'IX': 'Conclusiones'}
ROM = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X']
out = []
for S in SECS:
    k = 'w%d' % (ROM.index(S['num']) + 1)
    out.append('<div class="card xsec wsec" id="p1w-%s" data-fk="%s" data-short="%s"><h3 class="xh"><span>%s</span>%s</h3>%s%s</div>'
               % (S['num'], k, SHORT.get(S['num'], ''), S['num'], H.escape(S['title']),
                  ('<div class="wintro">' + body(S['intro']) + '</div>') if S['intro'] else '', ''.join(stepH(s, S) for s in S['steps'])))
res = links(mathify('\n'.join(out)))
res = re.sub(r'<p>\s*(\x00M\d+\x00)\s*</p>', r'<div class="mathd">\1</div>', res)
r = subprocess.run(['node', os.path.join(os.path.dirname(__file__), 'katex-batch.js')], input=json.dumps(MATH), capture_output=True, text=True, check=True)
if r.stderr: sys.stderr.write(r.stderr)
K = json.loads(r.stdout)
res = re.sub(r'\x00M(\d+)\x00', lambda m: K[int(m.group(1))], res)
# vacíos y restos
res = res.replace('<p></p>', '').replace('<strong>', '<b>').replace('</strong>', '</b>')
assert '\x00' not in res and '\x01' not in res
# privacidad: nada de la portada
for bad in ('Bocanegra', '@itcelaya', '23030312', 'Conclusión individual'):
    assert bad not in res, bad

ix = open(os.path.join(ROOT, 'index.html'), encoding='utf-8').read()
a, b = ix.find('<!--p1w-->'), ix.find('<!--/p1w-->')
assert a > 0 and b > a, 'faltan los marcadores <!--p1w--> … <!--/p1w--> en index.html'
ix = ix[:a + 10] + '\n' + res + '\n' + ix[b:]
open(os.path.join(ROOT, 'index.html'), 'w', encoding='utf-8').write(ix)
print('P1 (Word):', len(SECS), 'secciones,', sum(len(S['steps']) + sum(len(s['kids']) for s in S['steps']) for S in SECS), 'pasos,',
      len(MATH), 'fórmulas,', len(annex), 'cálculos del anexo,', res.count('data-wsim'), 'simulaciones,', len(res), 'bytes')
missing = [s['ck'] for S in SECS for s in S['steps'] + [k for x in S['steps'] for k in x['kids']] if s['ck'] and s['ck'] not in annex]
if missing: print('Sin cálculos en el anexo:', missing)
