# Bloques de párrafo con el XML exacto de la P2 del Word (v45).
import re
from xml.sax.saxutils import escape
from omml import omath

BOX = ('<w:pBdr><w:top w:val="dashed" w:sz="6" w:space="6" w:color="8C8C8C"/><w:left w:val="dashed" w:sz="6" w:space="6" w:color="8C8C8C"/>'
       '<w:bottom w:val="dashed" w:sz="6" w:space="6" w:color="8C8C8C"/><w:right w:val="dashed" w:sz="6" w:space="6" w:color="8C8C8C"/></w:pBdr>')
SHD = '<w:shd w:val="clear" w:color="auto" w:fill="F2F2F2"/>'
IND = '<w:ind w:left="120" w:right="120"/>'
GRAY = '7F7F7F'


def T(t):
    return '<w:t xml:space="preserve">' + escape(t) + '</w:t>'


def rpr(b=False, i=False, color=None, sz=None, va=None, font=None):
    x = ''
    if font: x += '<w:rFonts w:ascii="%s" w:eastAsia="%s" w:hAnsi="%s" w:cs="%s"/>' % (font, font, font, font)
    if b: x += '<w:b/><w:bCs/>'
    if i: x += '<w:i/><w:iCs/>'
    if font: x += '<w:noProof/>'
    if color: x += '<w:color w:val="%s"/>' % color
    if sz: x += '<w:sz w:val="%d"/><w:szCs w:val="%d"/>' % (sz, sz)
    if va: x += '<w:vertAlign w:val="%s"/>' % va
    return '<w:rPr>' + x + '</w:rPr>' if x else ''


def R(t, **k):
    return '<w:r>' + rpr(**k) + T(t) + '</w:r>'


TOK = re.compile(r'(\$[^$]+\$|\*\*[^*]+\*\*|~\{[^}]*\}|\^\^\{[^}]*\})')


def rich(s, **k):
    """texto con $math$, **negritas**, ~{subíndice}, ^^{superíndice}"""
    out = []
    for part in TOK.split(s):
        if not part: continue
        if part.startswith('$'): out.append(omath(part[1:-1]))
        elif part.startswith('**'): out.append(R(part[2:-2], **dict(k, b=True)))
        elif part.startswith('~{'): out.append(R(part[2:-1], **dict(k, va='subscript')))
        elif part.startswith('^^{'): out.append(R(part[3:-1], **dict(k, va='superscript')))
        else: out.append(R(part, **k))
    return ''.join(out)


def P(ppr, body):
    return '<w:p><w:pPr>' + ppr + '</w:pPr>' + body + '</w:p>'


# ---------- portada ----------
def cover(title):
    return [P('<w:jc w:val="center"/>', R('Tecnológico Nacional de México en Celaya', b=True, sz=28)),
            P('<w:jc w:val="center"/>', R('Departamento de Ingeniería Mecatrónica', b=True, sz=28)),
            P('<w:jc w:val="center"/>', R(title, b=True, sz=28)),
            P('<w:jc w:val="center"/>', ''),
            P('<w:jc w:val="center"/>', R('Bocanegra González Jorge 23030312@itcelaya.edu.mx', b=True)),
            P('<w:jc w:val="center"/>', ''),
            P('<w:keepNext/><w:jc w:val="both"/>', R('Resumen', b=True))]


def resumen(s): return P('<w:spacing w:after="160"/><w:jc w:val="both"/>', rich(s, color=GRAY))


def keywords(s):
    return P('<w:spacing w:before="120" w:after="160"/><w:jc w:val="both"/>', R('Palabras Clave', b=True) + R(': ' + s))


# ---------- títulos ----------
def h1(num, title):
    return P('<w:pStyle w:val="Ttulo1"/><w:tabs><w:tab w:val="left" w:pos="560"/></w:tabs>',
             R(num) + '<w:r><w:tab/></w:r>' + R(title, b=True))


def h2(t): return P('<w:pStyle w:val="Ttulo2"/>', R(t))


BM = [900]
PRE = ['P3']   # prefijo de los marcadores (P3_r_*, P3_c_*); assemble.py lo cambia según la práctica


def h2link(t, key):
    BM[0] += 1; i = BM[0]
    return ('<w:p><w:pPr><w:pStyle w:val="Ttulo2"/></w:pPr><w:bookmarkStart w:id="%d" w:name="%s_r_%s"/>' % (i, PRE[0], key) + R(t) + R('  ') +
            '<w:hyperlink w:anchor="%s_c_%s" w:history="1"><w:r><w:rPr><w:rStyle w:val="Hipervnculo"/><w:b w:val="0"/><w:bCs w:val="0"/>'
            '<w:sz w:val="18"/><w:szCs w:val="18"/></w:rPr>' % (PRE[0], key) + T('→ cálculos') + '</w:r></w:hyperlink><w:bookmarkEnd w:id="%d"/></w:p>' % i)


# ---------- texto ----------
def para(s, after=120): return P('<w:spacing w:after="%d"/><w:jc w:val="both"/>' % after, rich(s))
def gray(s, after=120): return P('<w:spacing w:after="%d"/><w:jc w:val="both"/>' % after, rich(s, color=GRAY))
def italic(s): return P('<w:spacing w:after="160"/><w:jc w:val="both"/>', rich(s, i=True))
def blue(s): return P('<w:spacing w:after="120"/><w:jc w:val="both"/>', rich(s, color='1F5FBF', sz=22))
def labeled(lbl, s, g=False):
    c = GRAY if g else None
    return P('<w:spacing w:after="160"/><w:jc w:val="both"/>', R(lbl, b=True, color=c) + rich(' ' + s, color=c))
def problem(s): return P('<w:spacing w:after="80"/><w:ind w:left="240"/><w:jc w:val="both"/>', rich(s))
def resultado(): return P('<w:keepNext/><w:spacing w:after="40"/><w:jc w:val="both"/>', R('Resultado:', b=True))
def eq(src): return P('<w:spacing w:before="40" w:after="80"/><w:jc w:val="center"/>', '<m:oMathPara>' + omath(src) + '</m:oMathPara>')
def spacer(): return P('<w:spacing w:after="120"/><w:jc w:val="both"/>', '')
def advert():
    return P('<w:pBdr><w:left w:val="single" w:sz="18" w:space="8" w:color="C00000"/></w:pBdr><w:spacing w:before="80" w:after="200"/><w:ind w:left="160"/><w:jc w:val="both"/>',
             R('Advertencia de la guía: ', b=True, sz=22) +
             R('La apariencia acotada de una simulación no demuestra estabilidad. Una cancelación tampoco justifica ignorar modos inestables. Revisar los modos del sistema antes de efectuar simplificaciones.', i=True, sz=22))


def caption(s): return P('<w:keepNext/><w:spacing w:before="120" w:after="80"/><w:jc w:val="center"/>', R(s, b=True, sz=20))
def figcap(s): return P('<w:spacing w:before="80" w:after="200"/><w:jc w:val="center"/>', R(s, b=True, sz=20))


# ---------- recuadro gris con imagen y código ----------
def figbox(desc, code):
    K = '<w:keepNext/><w:keepLines/>' + BOX + SHD
    out = [P(K + IND + '<w:jc w:val="center"/>', R('[ Pega aquí la imagen ]', b=True, color='595959', sz=22)),
           P(K + '<w:spacing w:line="260" w:lineRule="auto"/>' + IND + '<w:jc w:val="center"/>', rich(desc, i=True, color='595959', sz=20)),
           P(K + '<w:spacing w:before="60" w:after="20"/>' + IND + '<w:jc w:val="left"/>',
             R('Código MATLAB (completo, para correrlo en un MATLAB recién abierto):', b=True, color='595959', sz=16))]
    for ln in code.strip('\n').split('\n'):
        out.append(P(K + '<w:spacing w:after="0" w:line="240" w:lineRule="auto"/>' + IND + '<w:jc w:val="left"/><w:rPr><w:sz w:val="16"/><w:szCs w:val="16"/></w:rPr>',
                     R(ln, font='Courier New', sz=16)))
    out.append(P(K + '<w:spacing w:line="260" w:lineRule="auto"/>' + IND + '<w:jc w:val="center"/>', ''))
    return out


# ---------- tablas ----------
BRD = ('<w:tcBorders><w:top w:val="single" w:sz="4" w:space="0" w:color="808080"/><w:left w:val="single" w:sz="4" w:space="0" w:color="808080"/>'
       '<w:bottom w:val="single" w:sz="4" w:space="0" w:color="808080"/><w:right w:val="single" w:sz="4" w:space="0" w:color="808080"/></w:tcBorders>')
MAR = '<w:tcMar><w:top w:w="40" w:type="dxa"/><w:left w:w="80" w:type="dxa"/><w:bottom w:w="40" w:type="dxa"/><w:right w:w="80" w:type="dxa"/></w:tcMar>'


def cellp(s, center, bold=False, keep=False):
    return '<w:p><w:pPr>' + ('<w:keepNext/>' if keep else '') + ('<w:jc w:val="center"/>' if center else '') + '</w:pPr>' + rich(s, b=bold, sz=19) + '</w:p>'


def table(widths, head, rows, boldfirst=False):
    tw = sum(widths)
    x = ('<w:tbl><w:tblPr><w:tblW w:w="%d" w:type="dxa"/><w:jc w:val="center"/><w:tblBorders><w:top w:val="single" w:sz="4" w:space="0" w:color="auto"/>'
         '<w:left w:val="single" w:sz="4" w:space="0" w:color="auto"/><w:bottom w:val="single" w:sz="4" w:space="0" w:color="auto"/>'
         '<w:right w:val="single" w:sz="4" w:space="0" w:color="auto"/><w:insideH w:val="single" w:sz="4" w:space="0" w:color="auto"/>'
         '<w:insideV w:val="single" w:sz="4" w:space="0" w:color="auto"/></w:tblBorders><w:tblCellMar><w:left w:w="10" w:type="dxa"/>'
         '<w:right w:w="10" w:type="dxa"/></w:tblCellMar><w:tblLook w:val="04A0" w:firstRow="1" w:lastRow="0" w:firstColumn="1" w:lastColumn="0" '
         'w:noHBand="0" w:noVBand="1"/></w:tblPr><w:tblGrid>' % tw) + ''.join('<w:gridCol w:w="%d"/>' % w for w in widths) + '</w:tblGrid>'
    small = len(rows) <= 4          # tablas cortas: sin encabezado repetido y sin partirse (LibreOffice perdía la fila al pasar de columna)
    x += '<w:tr><w:trPr><w:cantSplit/>' + ('' if small else '<w:tblHeader/>') + '</w:trPr>'
    for w, h in zip(widths, head):
        x += ('<w:tc><w:tcPr><w:tcW w:w="%d" w:type="dxa"/>' % w + BRD + '<w:shd w:val="clear" w:color="auto" w:fill="D9D9D9"/>' + MAR +
              '<w:vAlign w:val="center"/></w:tcPr>' + cellp(h, True, True, keep=True) + '</w:tc>')   # encabezado junto a la 1.ª fila
    x += '</w:tr>'
    for k, r in enumerate(rows):
        x += '<w:tr><w:trPr><w:cantSplit/><w:trHeight w:val="340"/></w:trPr>'
        for j, (w, c) in enumerate(zip(widths, r)):
            x += '<w:tc><w:tcPr><w:tcW w:w="%d" w:type="dxa"/>' % w + BRD + MAR + '<w:vAlign w:val="center"/></w:tcPr>'
            x += ''.join(cellp(l, j > 0, boldfirst and j == 0, keep=small and k < len(rows) - 1) for l in c.split('\n'))
            x += '</w:tc>'
        x += '</w:tr>'
    return [x + '</w:tbl>', spacer()]


# ---------- anexo de cálculos (una columna, recuadros punteados) ----------
def calc_title(t, key):
    BM[0] += 1; i = BM[0]
    return ('<w:p><w:pPr><w:keepNext/>' + BOX + '<w:spacing w:before="40"/>' + IND + '<w:jc w:val="center"/></w:pPr>'
            '<w:bookmarkStart w:id="%d" w:name="%s_c_%s"/>' % (i, PRE[0], key) + R(t, b=True, sz=22) + '<w:r>' + T('   ') + '</w:r>'
            '<w:hyperlink w:anchor="%s_r_%s" w:history="1"><w:r><w:rPr><w:rStyle w:val="Hipervnculo"/><w:sz w:val="18"/><w:szCs w:val="18"/></w:rPr>' % (PRE[0], key)
            + T('↑ volver al reporte') + '</w:r></w:hyperlink><w:bookmarkEnd w:id="%d"/></w:p>' % i)


def c_sub(t): return P('<w:keepNext/>' + BOX + '<w:spacing w:before="100" w:after="20"/>' + IND, rich(t, b=True, sz=21))
def c_eq(src): return P(BOX + '<w:spacing w:before="20" w:after="60"/>' + IND + '<w:jc w:val="center"/>', '<m:oMathPara>' + omath(src) + '</m:oMathPara>')
def c_gap(): return P('<w:keepNext/>' + BOX + '<w:spacing w:before="30" w:after="30"/>' + IND + '<w:jc w:val="center"/>', '')
def c_note(s): return P(BOX + '<w:spacing w:after="20"/>' + IND + '<w:jc w:val="both"/>', rich(s, i=True, color='595959', sz=18))
def c_text(s): return P('<w:keepNext/>' + BOX + '<w:spacing w:before="40" w:after="20"/>' + IND + '<w:jc w:val="left"/>', rich(s, sz=21))
def c_sep(): return '<w:p><w:r><w:rPr><w:sz w:val="12"/><w:szCs w:val="12"/></w:rPr>' + T(' ') + '</w:r></w:p>'


def calc_box(title, key, items):
    """items: lista de ('s',subtítulo) ('e',ecuación) ('g',) ('n',nota gris) ('t',texto)"""
    out = [calc_title(title, key)]
    for it in items:
        k = it[0]
        if k == 's': out.append(c_sub(it[1]))
        elif k == 'e': out.append(c_eq(it[1]))
        elif k == 'g': out.append(c_gap())
        elif k == 'n': out.append(c_note(it[1]))
        elif k == 't': out.append(c_text(it[1]))
    out.append(c_sep())
    return out
