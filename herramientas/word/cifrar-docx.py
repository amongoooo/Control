#!/usr/bin/env python3
"""Cifra / descifra el Word de los reportes para el botón «Descargar Word» de la página (v49).

  python3 -I herramientas/word/cifrar-docx.py cifrar    entrada.docx  reportes/Reporte_P1-P7.docx.enc
  python3 -I herramientas/word/cifrar-docx.py descifrar reportes/Reporte_P1-P7.docx.enc  salida.docx

El PIN se lee de la variable de entorno LGDR_PIN o se pregunta (no se guarda en ningún archivo; pedírselo al usuario).
Formato: b'LGDR1' + iteraciones (4 bytes, big-endian) + sal (16) + iv (12) + texto cifrado AES-256-GCM (con la etiqueta al final,
como lo espera WebCrypto). Clave = PBKDF2-SHA256(PIN, sal, iteraciones). La página lo descifra en el navegador."""
import os, sys, struct, getpass
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives import hashes

MAGIC = b'LGDR1'
ITER = 600_000


def key(pin, salt, it):
    return PBKDF2HMAC(algorithm=hashes.SHA256(), length=32, salt=salt, iterations=it).derive(pin.encode('utf-8'))


def main():
    if len(sys.argv) != 4 or sys.argv[1] not in ('cifrar', 'descifrar'):
        sys.exit(__doc__)
    mode, src, dst = sys.argv[1:]
    pin = os.environ.get('LGDR_PIN') or getpass.getpass('PIN: ')
    data = open(src, 'rb').read()
    if mode == 'cifrar':
        salt, iv = os.urandom(16), os.urandom(12)
        out = MAGIC + struct.pack('>I', ITER) + salt + iv + AESGCM(key(pin, salt, ITER)).encrypt(iv, data, None)
    else:
        assert data[:5] == MAGIC, 'no es un archivo cifrado LGDR1'
        it = struct.unpack('>I', data[5:9])[0]
        salt, iv, ct = data[9:25], data[25:37], data[37:]
        out = AESGCM(key(pin, salt, it)).decrypt(iv, ct, None)
    open(dst, 'wb').write(out)
    print(mode, src, '→', dst, len(out), 'bytes')


if __name__ == '__main__':
    main()
