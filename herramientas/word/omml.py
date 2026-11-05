# Mini-lenguaje -> OMML con el formato de la P1/P2 (Cambria Math 10.5 pt; letras en cursiva, lo demás m:sty p).
#  \f{a}{b} fracción · \r{x} raíz · \d{x} |x| · \p{x} (x) que crece · \lim{s→0}{cuerpo} · \m{a&b\\c&d} matriz
#  \t{texto} texto recto · _x ^x _{..} ^{..} subíndice/superíndice · {..} grupo
from xml.sax.saxutils import escape
RPR = '<w:rPr><w:rFonts w:ascii="Cambria Math" w:hAnsi="Cambria Math"/><w:sz w:val="21"/><w:szCs w:val="21"/></w:rPr>'
CTRL = '<m:ctrlPr>' + RPR + '</m:ctrlPr>'
FUN = ('cos', 'sen', 'sin', 'tan', 'ln', 'lim', 'exp', 'log', 'máx', 'mín')
LET = set('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZáéíóúñαβγδεζηθικλμνξπρστυφχψωΓΔΘΛΞΠΣΦΨΩ')


def run(text, it):
    sty = '' if it else '<m:rPr><m:sty m:val="p"/></m:rPr>'
    return '<m:r>' + sty + RPR + '<m:t xml:space="preserve">' + escape(text) + '</m:t></m:r>'


class Parser:
    def __init__(s, src):
        s.s = src; s.i = 0

    def peek(s):
        return s.s[s.i] if s.i < len(s.s) else ''

    def group(s):
        # lee {...} y devuelve la lista de nodos
        assert s.peek() == '{', (s.s, s.i)
        s.i += 1
        n = s.seq('}')
        s.i += 1
        return n

    def seq(s, end=''):
        out = []
        while s.i < len(s.s) and s.peek() != end:
            a = s.atom()
            if a is None:
                continue
            sub = sup = None
            while s.peek() in ('_', '^'):
                c = s.peek(); s.i += 1
                arg = s.group() if s.peek() == '{' else [s.atom()]
                if c == '_': sub = arg
                else: sup = arg
            if sub is not None or sup is not None:
                out.append(('ss', a, sub, sup))
            else:
                out.append(a)
        return out

    def atom(s):
        c = s.peek()
        if c == '\\':
            j = s.i + 1
            while j < len(s.s) and s.s[j].isalpha():
                j += 1
            cmd = s.s[s.i + 1:j]; s.i = j
            if cmd == '':
                s.i += 1
                return ('r', s.s[s.i - 1], False)
            if cmd == 'f': return ('f', s.group(), s.group())
            if cmd == 'r': return ('rad', s.group())
            if cmd == 'd': return ('d', s.group(), '|', '|')
            if cmd == 'p': return ('d', s.group(), None, None)
            if cmd == 'b': return ('d', s.group(), '[', ']')
            if cmd == 'lim': return ('lim', s.group(), s.group())
            if cmd == 't':
                assert s.peek() == '{'
                j = s.s.index('}', s.i)
                t = s.s[s.i + 1:j]; s.i = j + 1
                return ('r', t, False)
            if cmd == 'm':
                assert s.peek() == '{'
                depth = 0; j = s.i
                while True:
                    if s.s[j] == '{': depth += 1
                    elif s.s[j] == '}':
                        depth -= 1
                        if depth == 0: break
                    j += 1
                body = s.s[s.i + 1:j]; s.i = j + 1
                rows = [[Parser(c.strip()).seq() for c in r.split('&')] for r in body.split('\\\\')]
                return ('m', rows)
            raise ValueError('cmd ' + cmd)
        if c == '{':
            return ('g', s.group())
        if c in LET:
            for f in FUN:
                if s.s.startswith(f, s.i) and not (s.i + len(f) < len(s.s) and s.s[s.i + len(f)] in LET):
                    s.i += len(f); return ('r', f, False)
            s.i += 1
            return ('r', c, True)
        if c.isdigit() or c == '.':
            j = s.i
            while j < len(s.s) and (s.s[j].isdigit() or s.s[j] == '.'):
                j += 1
            t = s.s[s.i:j]; s.i = j
            return ('r', t, False)
        s.i += 1
        return ('r', c.replace('-', '-'), False)


def merge(nodes):
    out = []
    for n in nodes:
        if n[0] == 'r' and out and out[-1][0] == 'r' and out[-1][2] == n[2] and '%' not in n[1] + out[-1][1]:
            out[-1] = ('r', out[-1][1] + n[1], n[2])
        else:
            out.append(n)
    return out


def emit(nodes):
    x = []
    for n in merge(nodes):
        k = n[0]
        if k == 'r': x.append(run(n[1], n[2]))
        elif k == 'g': x.append(emit(n[1]))
        elif k == 'f':
            x.append('<m:f><m:fPr>' + CTRL + '</m:fPr><m:num>' + emit(n[1]) + '</m:num><m:den>' + emit(n[2]) + '</m:den></m:f>')
        elif k == 'rad':
            x.append('<m:rad><m:radPr><m:degHide m:val="1"/>' + CTRL + '</m:radPr><m:deg/><m:e>' + emit(n[1]) + '</m:e></m:rad>')
        elif k == 'd':
            ch = ''
            if n[2]: ch = '<m:begChr m:val="%s"/><m:endChr m:val="%s"/>' % (n[2], n[3])
            x.append('<m:d><m:dPr>' + ch + CTRL + '</m:dPr><m:e>' + emit(n[1]) + '</m:e></m:d>')
        elif k == 'lim':
            x.append('<m:func><m:funcPr>' + CTRL + '</m:funcPr><m:fName><m:limLow><m:limLowPr>' + CTRL +
                     '</m:limLowPr><m:e>' + run('lim', False) + '</m:e><m:lim>' + emit(n[1]) +
                     '</m:lim></m:limLow></m:fName><m:e>' + emit(n[2]) + '</m:e></m:func>')
        elif k == 'ss':
            b = emit([n[1]])
            if n[2] is not None and n[3] is not None:
                x.append('<m:sSubSup><m:sSubSupPr>' + CTRL + '</m:sSubSupPr><m:e>' + b + '</m:e><m:sub>' + emit(n[2]) +
                         '</m:sub><m:sup>' + emit(n[3]) + '</m:sup></m:sSubSup>')
            elif n[2] is not None:
                x.append('<m:sSub><m:sSubPr>' + CTRL + '</m:sSubPr><m:e>' + b + '</m:e><m:sub>' + emit(n[2]) + '</m:sub></m:sSub>')
            else:
                x.append('<m:sSup><m:sSupPr>' + CTRL + '</m:sSupPr><m:e>' + b + '</m:e><m:sup>' + emit(n[3]) + '</m:sup></m:sSup>')
        elif k == 'm':
            ncol = max(len(r) for r in n[1])
            rows = ''
            for r in n[1]:
                cells = ''
                for j in range(ncol):
                    c = r[j] if j < len(r) else []
                    if not c:
                        cells += '<m:e><m:r><m:rPr><m:nor/></m:rPr>' + RPR + '<m:t xml:space="preserve"> </m:t></m:r></m:e>'
                    else:
                        cells += '<m:e>' + emit(c) + '</m:e>'
                rows += '<m:mr>' + cells + '</m:mr>'
            x.append('<m:m><m:mPr><m:plcHide m:val="1"/><m:mcs><m:mc><m:mcPr><m:count m:val="%d"/><m:mcJc m:val="center"/></m:mcPr></m:mc></m:mcs>' % ncol
                     + CTRL + '</m:mPr>' + rows + '</m:m>')
    return ''.join(x)


def omath(src):
    return '<m:oMath>' + emit(Parser(src).seq()) + '</m:oMath>'


if __name__ == '__main__':
    import sys
    print(omath(sys.argv[1]))
