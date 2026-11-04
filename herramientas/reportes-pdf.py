#!/usr/bin/env python3
"""Actualiza el PDF de los reportes P1–P7 que abre el botón «PDF de reportes» de la ventana del Reporte.

Uso:  python3 -I herramientas/reportes-pdf.py <pdf-subido-por-el-usuario>
      python3 -I herramientas/reportes-pdf.py            (sólo recalcula las páginas de reportes.pdf)

- Copia el PDF a reportes.pdf (raíz del repositorio).
- Busca la página donde empieza cada práctica (portada con «Práctica N» / «Practica N» y el nombre del
  Tecnológico o «Equipo») y escribe el mapa en index.html, en la línea marcada con /*REP_PDF*/.
  Si una práctica no aparece, el botón abre el PDF desde el principio.
Requiere pdftotext (poppler)."""
import re, shutil, subprocess, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DEST = ROOT / 'reportes.pdf'
HTML = ROOT / 'index.html'

if len(sys.argv) > 1:
    src = Path(sys.argv[1]).resolve()
    if src != DEST:
        shutil.copyfile(src, DEST)

txt = subprocess.run(['pdftotext', '-layout', str(DEST), '-'], capture_output=True, text=True, check=True).stdout
pages = txt.split('\f')
start = {}
for n in range(1, 8):
    linea = re.compile(r'^\s*Pr[aá]ctica\s*' + str(n) + r'(?!\d)', re.I | re.M)   # «Práctica N» como renglón propio
    pat = re.compile(r'Pr[aá]ctica\s*' + str(n) + r'(?!\d)', re.I)
    for prueba in (lambda pg: linea.search(pg) and re.search(r'Tecnol[oó]gico', pg, re.I),
                   lambda pg: linea.search(pg),
                   lambda pg: pat.search(pg) and re.search(r'Tecnol[oó]gico', pg, re.I)):
        k = next((k for k, pg in enumerate(pages, 1) if prueba(pg)), None)
        if k:
            start[n] = k
            break

mapa = '{' + ','.join(f'p{n}:{k}' for n, k in sorted(start.items())) + '}'
html = HTML.read_text(encoding='utf-8')
html2, c = re.subn(r'const REP_PDF=\{[^}]*\}; /\*REP_PDF\*/', f'const REP_PDF={mapa}; /*REP_PDF*/', html)
if c != 1:
    sys.exit('No encontré la línea /*REP_PDF*/ en index.html')
HTML.write_text(html2, encoding='utf-8')
print(f'{DEST.name}: {len(pages) - 1 if pages[-1].strip() == "" else len(pages)} páginas · inicio de cada práctica: {mapa}')
falta = [n for n in range(1, 8) if n not in start]
if falta:
    print('Sin portada encontrada para:', ', '.join(f'P{n}' for n in falta), '(se abre al inicio del PDF)')
