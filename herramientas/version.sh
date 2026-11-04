#!/bin/sh
# Pone la versión de la barra superior (#abVer) con la hora del centro de México: v1.día.mes.horaminuto (p. ej. v1.3.11.1503).
# Uso: sh herramientas/version.sh   (correrlo justo antes de cada commit que cambie index.html)
cd "$(dirname "$0")/.." || exit 1
V="v1.$(TZ=America/Mexico_City date +%-d.%-m.%H%M)"
T="Versión del $(TZ=America/Mexico_City date +%-d/%-m/%Y), $(TZ=America/Mexico_City date +%H:%M) (hora del centro de México)"
sed -i -E "s#<span class=\"abver\" id=\"abVer\"[^>]*>[^<]*</span>#<span class=\"abver\" id=\"abVer\" title=\"$T\">$V</span>#" index.html
grep -o '<span class="abver" id="abVer"[^>]*>[^<]*</span>' index.html
