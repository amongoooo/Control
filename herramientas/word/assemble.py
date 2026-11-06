# Reemplaza la práctica N del document.xml (conservando sus 3 sectPr) con el contenido generado (pN.py y pNcalc.py).
# Uso (desde herramientas/word/): python3 assemble.py entrada/document.xml salida/document.xml [N=3]
import sys, copy, re
from lxml import etree
W = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'
M = 'http://schemas.openxmlformats.org/officeDocument/2006/math'
src, dst = sys.argv[1], sys.argv[2]
N = int(sys.argv[3]) if len(sys.argv) > 3 else 3
import importlib
tree = etree.parse(src)
root = tree.getroot(); body = root.find('{%s}body' % W)
kids = list(body)
txt = lambda e: ''.join(e.itertext())
is_sect = lambda e: e.tag == '{%s}p' % W and e.find('{%s}pPr/{%s}sectPr' % (W, W)) is not None

# bookmarks existentes -> ids nuevos por encima del máximo
mx = max(int(b.get('{%s}id' % W)) for b in root.iter('{%s}bookmarkStart' % W))
import build
build.BM[0] = mx + 100
build.PRE[0] = 'P%d' % N
pN = importlib.import_module('p%d' % N); pNcalc = importlib.import_module('p%dcalc' % N)

i_t3 = next(i for i, e in enumerate(kids) if txt(e).strip().startswith('Práctica %d:' % N))
# piezas que se reutilizan («C. Cálculos» y Referencias): de la P2, ya llenada con este formato
i_t2 = next(i for i, e in enumerate(kids) if txt(e).strip().startswith('Práctica 2:'))
i_t2n = next(i for i, e in enumerate(kids) if txt(e).strip().startswith('Práctica 3:'))
start = max(i for i in range(i_t3) if is_sect(kids[i])) + 1           # después del sectPr final de la práctica anterior
sects = [i for i in range(i_t3, len(kids)) if is_sect(kids[i])][:3]
end = sects[2]
print('P%d de' % N, start, 'a', end, 'sects', sects)
# piezas de la P2 que se reutilizan tal cual
p2end = max(i for i in range(i_t2n) if is_sect(kids[i])) + 1
p2sects = [i for i in range(i_t2, p2end) if is_sect(kids[i])]
p2_calc_h = next(i for i in range(p2sects[1], p2end) if txt(kids[i]).strip() == 'C. Cálculos')
p2_refs = next(i for i in range(p2sects[1], p2end) if txt(kids[i]).strip() == 'Referencias')
refs = [copy.deepcopy(kids[i]) for i in range(p2_refs, p2sects[2])]
calc_h = [copy.deepcopy(kids[p2_calc_h]), copy.deepcopy(kids[p2_calc_h + 1])]

NS = ' '.join('xmlns:%s="%s"' % (k, v) for k, v in root.nsmap.items() if k)


def parse(chunks):
    xml = '<root %s>%s</root>' % (NS, ''.join(chunks))
    return list(etree.fromstring(xml.encode('utf-8')))


s1, s2, s3 = (kids[i] for i in sects)
o = pN.out
j1 = o.index('#SECT1'); j2 = o.index('#SECT2')
new = parse(o[:j1]) + [s1] + parse(o[j1 + 1:j2]) + [s2] + calc_h + parse(pNcalc.C) + refs + [s3]
for e in kids[start:end + 1]:
    body.remove(e)
anchor = kids[start - 1]
for e in reversed(new):
    anchor.addnext(e)
tree.write(dst, xml_declaration=True, encoding='UTF-8', standalone=True)
print('nuevos elementos', len(new))
