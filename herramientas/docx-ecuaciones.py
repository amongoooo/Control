"""Copia un .docx y marca como «texto normal» (m:nor) las corridas de ecuación que el importador OMML de
LibreOffice no sabe leer (#, corchetes sueltos, %, «sim», operadores sin término a la izquierda).
Sólo afecta la conversión a PDF; el texto y los números no cambian.
Uso: python3 -I herramientas/docx-ecuaciones.py entrada.docx salida.docx
     soffice --headless --convert-to pdf salida.docx      (requiere el paquete libreoffice-math)"""
import re, sys, zipfile

src, dst = sys.argv[1], sys.argv[2]
OPS = '=+<>≈⇒≡⋅·→⇔≤≥±&'
KW = {'sim', 'in', 'and', 'or', 'not', 'over', 'times', 'cdot', 'def', 'neq', 'approx', 'to', 'from', 'size', 'color', 'font'}
n = 0

def fix_run(m):
    global n
    run = m.group(0)
    t = re.search(r'<m:t(?: [^>]*)?>([^<]*)</m:t>', run)
    if not t:
        return run
    s = t.group(1).replace('&lt;', '<').replace('&gt;', '>').replace('&amp;', '&')
    bad = (any(c in s for c in '#%&"') or s.strip() in KW or (s.strip()[:1] in OPS and m.start() in first))
    if not bad and ('[' in s or ']' in s):
        # corchetes sueltos: cada corchete en su propia corrida de texto normal; el resto queda igual
        n += 1
        pre, post = run[:t.start(1)], run[t.end(1):]
        nor = re.sub(r'<m:rPr>.*?</m:rPr>', '<m:rPr><m:nor/></m:rPr>', pre, flags=re.S) if '<m:rPr>' in pre \
            else pre.replace('<m:r>', '<m:r><m:rPr><m:nor/></m:rPr>', 1)
        raw = t.group(1)
        return ''.join((nor if c in '[]' else pre) + c + post for c in re.findall(r'[\[\]]|[^\[\]]+', raw))
    if not bad:
        return run
    n += 1
    if '<m:rPr>' in run:
        rpr = re.search(r'<m:rPr>.*?</m:rPr>', run, re.S).group(0)
        new = re.sub(r'<m:(sty|scr)[^>]*/>', '', rpr)
        if '<m:nor' not in new:
            new = new.replace('<m:rPr>', '<m:rPr><m:nor/>', 1)
        return run.replace(rpr, new, 1)
    return run.replace('<m:r>', '<m:r><m:rPr><m:nor/></m:rPr>', 1)

zin = zipfile.ZipFile(src)
zout = zipfile.ZipFile(dst, 'w', zipfile.ZIP_DEFLATED)
for item in zin.infolist():
    data = zin.read(item.filename)
    if item.filename == 'word/document.xml':
        x = data.decode('utf-8')
        # corridas que son la primera de su contenedor (ecuación, argumento, numerador…)
        first = set(mm.end() for mm in re.finditer(r'<m:(?:oMath|e|num|den|sub|sup|deg|fName)>(?=<m:r>)', x))
        x = re.sub(r'<m:r>.*?</m:r>', fix_run, x, flags=re.S)
        # celdas vacías de matrices (arreglos de Routh): LibreOffice pone «¿»
        x = x.replace('<m:e/>', '<m:e><m:r><m:rPr><m:nor/></m:rPr><m:t xml:space="preserve"> </m:t></m:r></m:e>')
        data = x.encode('utf-8')
    zout.writestr(item, data)
zout.close()
print('corridas marcadas:', n)
