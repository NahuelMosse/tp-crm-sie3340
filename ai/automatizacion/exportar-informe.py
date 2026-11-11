# -*- coding: utf-8 -*-
"""Arma el entregable a partir de las secciones del informe.

    python exportar-informe.py [raiz-del-repo]

Lee humanos/informe/*.md, arma cada versión como una página HTML y la imprime a PDF con el
Chromium de Playwright (imprimir-informe.mjs), en humanos/entregas/: portada, índice con páginas,
resumen ejecutivo, tablas con filete fino y encabezado gris, matriz con círculos y fuentes
numeradas. La letra es la de la portada, Gambarino y General Sans, que la página toma de
humanos/presentacion/assets/fonts.css: no hace falta instalar nada.

El markdown es lo único que se corrige: este script solo le da forma.
"""
import html
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

from pypdf import PdfReader, PdfWriter

AQUI = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else os.path.join(AQUI, "..", ".."))
INFORME = os.path.join(RAIZ, "humanos", "informe")
ENTREGAS = os.path.join(RAIZ, "humanos", "entregas")
PRESENTACION = os.path.join(RAIZ, "humanos", "presentacion")
NOMBRE = "TP SIE 3340 - Selección de un Sistema CRM (resolución)"
TITULO_CORTO = "Selección de un sistema CRM para una compañía de seguros"
IMPRIMIR = os.path.join(AQUI, "imprimir-informe.mjs")
PORTADA = os.path.join(PRESENTACION, "portada", "render.mjs")
RESULTADOS = os.path.join(AQUI, "resultados")

CIRCULOS = set("●◐○↑ ")
URL = re.compile(r"https?://[^\s,;)]+")
SIGNOS = re.compile(r"([●◐○◍↑]+)")
INLINE = re.compile(r"(\*\*.+?\*\*|(?<![\w*])\*[^*\s][^*]*?\*(?![\w*])|`[^`]+`)")
PLATAFORMA = re.compile(r"^\*\*(EspoCRM|Twenty|Bitrix24)\*\* [·●◐○◍]")

# Monocromo, como un informe editado: texto casi negro, tablas con filetes horizontales finos y encabezado
# sin relleno, sin bandas. El encabezado oscuro con letra blanca y los títulos de color son el aspecto
# típico de un documento generado, y se evitan. Las medidas son las del formato de los informes del
# equipo, pensado en Cambria a 11 pt con interlineado de 1,25: General Sans es más angosta, y a 10,5 pt
# una línea ocupa lo mismo. Los interlineados y espacios son los que Word daba a ese formato, para que
# cada página lleve lo mismo: entre dos párrafos queda el mayor de los dos espacios, no la suma.
CSS = """
@page {
  size: A4; margin: 25mm;
  @bottom-right {
    content: "%(titulo)s   ·   Página " counter(page) " de " counter(pages);
    font: 400 8pt/1 "General Sans", sans-serif; color: #595959; white-space: pre;
    vertical-align: top; padding-top: 3mm; border-top: 0.5pt solid #a6a6a6; width: 100%%;
  }
}
@page :first { @bottom-right { content: none; border: 0; } }
:root { --tinta: #262626; --gris: #595959; --filete: #8c8c8c; }
* { box-sizing: border-box; }
html { font: 400 10.5pt/1.535 "General Sans", sans-serif; color: var(--tinta); -webkit-print-color-adjust: exact; }
body { margin: 0; }
b, strong { font-weight: 600; }
p { margin: 0 0 6pt; orphans: 2; widows: 2; }
a { color: inherit; text-decoration: none; }
a.url { color: #0563c1; text-decoration: underline; overflow-wrap: anywhere; }
code, pre { font-family: Consolas, "Cascadia Mono", monospace; font-size: 9pt; }
pre { margin: 0 0 8pt 0.6cm; white-space: pre-wrap; font-size: 9.5pt; line-height: 11.1pt; }
h1, h2, h3, h4 { font-family: "Gambarino", Georgia, serif; font-weight: 400; color: var(--tinta);
  break-after: avoid; break-inside: avoid; }
h1 { font-size: 15pt; line-height: 19.8pt; margin: 18pt 0 8pt; padding-bottom: 3pt; border-bottom: 0.75pt solid #7f7f7f; }
h2 { font-size: 12pt; line-height: 15.9pt; margin: 12pt 0 4pt; }
h3 { font-size: 11pt; line-height: 12.65pt; margin: 8pt 0 3pt; }
h4 { font-size: 10.5pt; line-height: 12.1pt; margin: 6pt 0 2pt; font-style: italic; }
h1.pagina { break-before: page; margin-top: 0; }
.tapa { height: 1px; break-after: page; }
.chico { font-size: 9.55pt; }
.sigue { break-after: avoid; }
.veredicto { margin-top: 6pt; margin-bottom: 3pt; }
.bajada { font-style: italic; }
ul { margin: 0 0 3pt; padding-left: 1.27cm; }
ol { margin: 0; padding-left: 0.6cm; list-style: none; }
ul li { margin: 0; padding: 0.6pt 0 0; }
/* La viñeta va a 11 pt aunque el ítem sea más chico: la primera línea de cada ítem es más alta */
.chico ul li { padding-top: 1.55pt; }
ol li { margin: 0 0 3pt; }
.textual { margin: 0 0 0 1cm; font-style: italic; font-size: 0.909em; break-after: avoid; }
.en-cita { margin-bottom: 4pt; }
.de-fuente { margin: 0 0 6pt 1cm; font-size: 0.909em; }
.respaldo { font-size: 0.909em; }

/* Signos de la escala dibujados, todos del mismo tamaño */
.sig { display: inline-block; width: 0.74em; height: 0.74em; vertical-align: -0.06em; }
.flecha { display: inline-block; width: 0.5em; height: 0.92em; vertical-align: -0.14em; margin-left: 0.1em; }
.valor { position: relative; display: inline-block; line-height: 1; }
/* En la tabla la flecha va al costado, para que el círculo quede centrado como los demás */
.valor .flecha { position: absolute; left: 100%%; top: -0.02em; margin-left: 0.14em; }

/* Índice */
.indice h1 { border: 0; margin: 0 0 12pt; font-size: 15pt; }
.indice a { display: flex; align-items: baseline; gap: 4pt; margin-bottom: 0.5pt; line-height: 1.2; font-size: 10pt; }
.indice a .puntos { flex: 1; border-bottom: 0.6pt dotted #8c8c8c; transform: translateY(-2.5pt); }
.indice .n1 { margin-top: 2pt; }
.indice .n2 { padding-left: 0.5cm; }

/* Tablas sin líneas verticales: un filete negro arriba, bajo el encabezado y al cierre, y entre filas uno
   gris muy fino. El encabezado va sin relleno y en gris, para que el peso lo lleven los datos */
/* General Sans entra más ajustada que Arial: con 0,16 pt entre letras cada celda corta donde cortaba */
table { width: 100%%; table-layout: fixed; border-collapse: collapse; margin: 0; font-size: 9.5pt; line-height: 11.47pt; letter-spacing: 0.16pt; }
table.chica { font-size: 9pt; line-height: 10.87pt; }
table.corta { break-inside: avoid; }
/* El párrafo vacío que sigue a cada tabla, con el alto de una línea de texto */
.tras-tabla { height: 16.1pt; margin-bottom: 2pt; }
th, td { border: 0; border-bottom: 0.5pt solid #d6d6d6; padding: 2.75pt 5pt; height: 14.2pt; text-align: left; vertical-align: top; }
/* Las celdas de texto largo se leen desde arriba; la matriz y los valores van centrados en su fila */
table.matriz td, td.c { vertical-align: middle; }
thead th { font: 400 10.5pt/11.47pt "Gambarino", Georgia, serif; color: var(--tinta); letter-spacing: 0;
  vertical-align: bottom; border-top: 0.8pt solid var(--tinta); border-bottom: 0.8pt solid var(--tinta); }
/* Cada plataforma es una franja de su color, el mismo de la presentación: una barra arriba y un tinte
   tenue debajo. Las filas y las franjas se separan con blanco, así cada veredicto queda en su casilla */
th.p-espocrm, td.p-espocrm { --franja: #111111; --tinte: #efefef; }
th.p-twenty, td.p-twenty { --franja: #1a4be0; --tinte: #ebf0fd; }
th.p-bitrix24, td.p-bitrix24 { --franja: #9a9a9a; --tinte: #f5f5f5; }
thead th[class*="p-"] { border-top: 2.5pt solid var(--franja); background: var(--tinte); border-left: 1.5pt solid #fff; }
td[class*="p-"] { background: var(--tinte); border-bottom-color: #fff; border-left: 1.5pt solid #fff; }
tbody tr:last-child td[class*="p-"] { border-bottom-color: var(--tinta); }
.frac { color: var(--gris); font-weight: 400; }
.pct { font-weight: 600; }
tbody tr:last-child td { border-bottom: 0.8pt solid var(--tinta); }
tr { break-inside: avoid; }
td.c, th.c { text-align: center; font-variant-numeric: tabular-nums; }
tr.grupo td { font: 400 10.5pt/11.47pt "Gambarino", Georgia, serif; letter-spacing: 0; border-top: 0.8pt solid var(--tinta); background: #fff; }
.cod { color: var(--gris); font-variant-numeric: tabular-nums; }
tr.subtotal td { font-weight: 600; border-top: 0.5pt solid #8c8c8c; }
td.c .sig { width: 0.9em; height: 0.9em; }
/* Los veredictos llevan un punto y medio más que el texto de la celda: la fila es algo más alta */
table td.c { line-height: 13.3pt; }
table.chica td.c { line-height: 12.7pt; }
table.matriz td.c, table.matriz th.c { white-space: nowrap; }

/* Fuentes numeradas */
.fuente { margin: 0 0 2pt; padding-left: 1.7cm; text-indent: -1.7cm; font-size: 8.1pt; line-height: 9.96pt; }
.fuente b { display: inline-block; width: 1.7cm; text-indent: 0; }
"""


# --------------------------------------------------------------- fuentes numeradas
# Cada fuente de la sección 8 lleva un número en el orden en que se lista; las citas de la
# sección 5 remiten a ese número, como en una bibliografía.
NUMERO_DE_URL = {}


def numerar_fuentes(texto):
    for linea in texto.splitlines():
        m = re.match(r"^- (https?://\S+)", linea)
        if m and m.group(1) not in NUMERO_DE_URL:
            NUMERO_DE_URL[m.group(1)] = len(NUMERO_DE_URL) + 1


def citas(texto):
    """Las citas escritas como {{dirección}} llevan el número que esa fuente tiene en la sección de fuentes."""
    def numero(m):
        if m.group(1) not in NUMERO_DE_URL:
            raise SystemExit("Una cita apunta a una fuente que no está en la sección de fuentes: " + m.group(1))
        return " [%d]" % NUMERO_DE_URL[m.group(1)]
    return re.sub(r" ?\{\{(https?://[^}]+)\}\}", numero, texto)


def ancla(n):
    return "fuente_%d" % n


# --------------------------------------------------------------- texto en línea
def signo(ch):
    """●, ◐, ○ y ◍ dibujados: una letra los toma de fuentes distintas y salen de tamaños distintos."""
    if ch == "↑":
        return ('<svg class="flecha" viewBox="0 0 6 11" preserveAspectRatio="none" aria-label="un plan pago lo mejoraría">'
                '<path d="M3 10.6V1.2M0.5 3.9L3 1.2l2.5 2.7" fill="none" stroke="currentColor" stroke-width="1.05"/></svg>')
    aro = '<circle cx="5" cy="5" r="4.45" fill="none" stroke="currentColor" stroke-width="1.1"%s/>'
    cuerpo = {
        "●": '<circle cx="5" cy="5" r="5" fill="currentColor"/>',
        "◐": '<path d="M5 0A5 5 0 0 0 5 10Z" fill="currentColor"/>' + aro % "",
        "○": aro % "",
        "◍": aro % ' stroke-dasharray="1.6 1.2"',
    }[ch]
    nombre = {"●": "cumple", "◐": "cumple con reparo", "○": "no cumple", "◍": "sin verificar"}[ch]
    return '<svg class="sig" viewBox="0 0 10 10" role="img" aria-label="%s">%s</svg>' % (nombre, cuerpo)


def texto_plano(t):
    out = []
    for trozo in SIGNOS.split(t):
        if SIGNOS.fullmatch(trozo or "x"):
            out.extend(signo(c) for c in trozo)
        else:
            out.append(html.escape(trozo, quote=False))
    return "".join(out)


def enlinea(texto):
    """El texto con sus negritas, cursivas y código, y las direcciones como enlace."""
    out = []
    for trozo in INLINE.split(texto):
        if not trozo:
            continue
        if trozo.startswith("**") and trozo.endswith("**") and len(trozo) > 4:
            out.append("<b>%s</b>" % enlinea(trozo[2:-2]))
        elif trozo.startswith("`") and trozo.endswith("`"):
            out.append("<code>%s</code>" % html.escape(trozo[1:-1], quote=False))
        elif trozo.startswith("*") and trozo.endswith("*") and len(trozo) > 2:
            out.append("<i>%s</i>" % enlinea(trozo[1:-1]))
        else:
            pos = 0
            for m in URL.finditer(trozo):
                out.append(texto_plano(trozo[pos:m.start()]))
                u = m.group(0)
                out.append('<a class="url" href="%s">%s</a>' % (html.escape(u), html.escape(u, quote=False)))
                pos = m.end()
            out.append(texto_plano(trozo[pos:]))
    return "".join(out)


def p(texto, clase=None, extra=""):
    c = ' class="%s"' % clase if clase else ""
    return "<p%s>%s%s</p>" % (c, enlinea(texto), extra)


# --------------------------------------------------------------- bloques del markdown
def bloques(texto):
    """Parte el markdown en bloques: título, párrafo, lista, tabla, cita, código, salto."""
    lineas = texto.splitlines()
    i, out = 0, []
    while i < len(lineas):
        l = lineas[i]
        if not l.strip() or l.strip() == "---":
            i += 1
            continue
        if l.startswith("```"):
            fin = i + 1
            while fin < len(lineas) and not lineas[fin].startswith("```"):
                fin += 1
            cuerpo = lineas[i + 1:fin]
            out.append(("salto",) if "{=openxml}" in l else ("codigo", cuerpo))
            i = fin + 1
            continue
        m = re.match(r"^(#{1,4}) (.+)$", l)
        if m:
            out.append(("h", len(m.group(1)), m.group(2).strip()))
            i += 1
            continue
        if l.startswith("|"):
            filas = []
            while i < len(lineas) and lineas[i].startswith("|"):
                celdas = [c.strip() for c in lineas[i].strip().strip("|").split("|")]
                if not all(re.fullmatch(r":?-{3,}:?", c) for c in celdas):  # la fila separadora
                    filas.append(celdas)
                i += 1
            out.append(("tabla", filas))
            continue
        if l.startswith(">"):
            cuerpo = []
            while i < len(lineas) and lineas[i].startswith(">"):
                cuerpo.append(re.sub(r"^> ?", "", lineas[i]))
                i += 1
            out.append(("cita", bloques("\n".join(cuerpo))))
            continue
        if re.match(r"^(- |\d+\. )", l):
            numerada = not l.startswith("- ")
            items = []
            while i < len(lineas) and lineas[i].strip():
                if re.match(r"^(- |\d+\. )", lineas[i]):
                    items.append(re.sub(r"^(- |\d+\. )", "", lineas[i]))
                else:
                    items[-1] += " " + lineas[i].strip()
                i += 1
            out.append(("lista", numerada, items))
            continue
        texto_par = [l.strip()]
        i += 1
        while i < len(lineas) and lineas[i].strip() and not re.match(r"^(#|\||>|```|- |\d+\. )", lineas[i]):
            texto_par.append(lineas[i].strip())
            i += 1
        out.append(("p", " ".join(texto_par)))
    return out


def es_valor(texto):
    t = texto.replace("*", "").strip()
    return len(t) <= 22 and not re.search(r"[a-z]{4,}", t)


def es_signo(texto):
    t = texto.replace("*", "").strip()
    return bool(t) and set(t) <= CIRCULOS


def celda_valor(texto):
    """Un veredicto en su celda: la flecha del plan pago queda al costado del círculo."""
    t = texto.replace("*", "").strip()
    return '<span class="valor">%s%s</span>' % ("".join(signo(c) for c in t if c != "↑"), signo("↑") if "↑" in t else "")


ANCHO_UTIL = 16.0  # cm: A4 con márgenes de 2,5


def anchos(filas):
    """Ancho de columna según el texto más largo, sin que ninguna corte una palabra al medio."""
    n = len(filas[0])
    celdas = [[re.sub(r"\*", "", f[j]) if j < len(f) else "" for f in filas] for j in range(n)]
    pesos = [min(max(len(c) for c in col), 70) for col in celdas]
    # La palabra más larga define el piso de la columna
    piso = [max(1.2, 0.23 * max(len(w) for c in col for w in (c.split() or [""])) + 0.5) for col in celdas]
    # Un rótulo corto («Cumple con reparo») entra entero en su renglón
    piso = [max(p, max((0.21 * len(c) + 0.5 for c in col[1:] if len(c) <= 18), default=0)) for p, col in zip(piso, celdas)]
    fijas = set()
    while True:
        libre = ANCHO_UTIL - sum(piso[j] for j in fijas)
        resto = sum(pesos[j] for j in range(n) if j not in fijas)
        w = [piso[j] if j in fijas else libre * pesos[j] / resto for j in range(n)]
        nuevas = {j for j in range(n) if j not in fijas and w[j] < piso[j]}
        if not nuevas:
            return w
        fijas |= nuevas


PLANES = ["Versión", "Precio", "Criterios que mejora respecto de la gratuita", "Cumplimiento total"]


def tabla(filas, chica=False, grupos=None, matriz=False):
    """Tabla con filetes horizontales y una franja por plataforma. `grupos` intercala filas de rótulo
    —el nombre de cada grupo de la matriz— antes de la fila indicada."""
    grupos = grupos or {}
    ncol = len(filas[0])
    total = len(filas) + len(grupos)

    # El encabezado se alinea como su columna: centrado solo sobre columnas de valores
    def de_valores(j):
        celdas = [fl[j] for fl in filas[1:] if j < len(fl) and fl[j].strip()]
        return j > 0 and bool(celdas) and all(es_valor(c) for c in celdas)

    clases = [c for c, si in (("chica", chica), ("matriz", matriz), ("corta", total <= 18)) if si]
    out = ['<table%s>' % (' class="%s"' % " ".join(clases) if clases else "")]
    if matriz:
        w = [ANCHO_UTIL - 3.0 * (ncol - 1)] + [3.0] * (ncol - 1)
    elif [c.replace("*", "") for c in filas[0]] == PLANES:
        # Las tablas de planes de la sección 4.4 comparten columnas
        w = [3.0, 3.6, 6.8, 2.6]
    else:
        w = anchos(filas)
    out.append("<colgroup>%s</colgroup>" % "".join('<col style="width:%.2fcm">' % x for x in w))
    # Cada columna de una plataforma es una franja de su color, de arriba abajo
    franja = [next(("p-" + k for k, nombre in PLATAFORMAS if nombre == c.replace("*", "").strip()), None) for c in filas[0]]

    def cabecera(j):
        texto = filas[0][j].replace("**", "")
        clases = (["c"] if de_valores(j) else []) + ([franja[j]] if franja[j] else [])
        return '<th%s>%s</th>' % (' class="%s"' % " ".join(clases) if clases else "", enlinea(texto))
    out.append("<thead><tr>%s</tr></thead><tbody>" % "".join(cabecera(j) for j in range(ncol)))
    for f, fila in enumerate(filas[1:], 1):
        if f in grupos:
            g = re.match(r"^([AB]\.\d+) (.+)$", grupos[f])
            rotulo = '<span class="cod">%s</span> %s' % (g.group(1), enlinea(g.group(2))) if g else enlinea(grupos[f])
            out.append('<tr class="grupo"><td colspan="%d">%s</td></tr>' % (ncol, rotulo))
        subtotal = matriz and fila[0].startswith("**")
        celdas = []
        for j in range(ncol):
            valor = fila[j] if j < len(fila) else ""
            centro = de_valores(j) and es_valor(valor)
            if subtotal:
                valor = valor.replace("**", "").replace(" %", " %")
            contenido = celda_valor(valor) if es_signo(valor) else enlinea(valor)
            # En la matriz, el código del criterio va en gris: se lee primero el nombre
            m = re.match(r"^([AB]\.\d+\.\d+) (.+)$", valor) if matriz and j == 0 else None
            if m:
                contenido = '<span class="cod">%s</span> %s' % (m.group(1), enlinea(m.group(2)))
            # En el subtotal pesa el porcentaje; los puntos sobre el máximo lo acompañan en gris
            t = re.match(r"^(\d+/\d+ ·) (.+%)$", valor) if subtotal else None
            if t:
                contenido = '<span class="frac">%s</span> <span class="pct">%s</span>' % (t.group(1), t.group(2))
            clases = (["c"] if centro else []) + ([franja[j]] if franja[j] else [])
            celdas.append('<td%s>%s</td>' % (' class="%s"' % " ".join(clases) if clases else "", contenido))
        out.append('<tr%s>%s</tr>' % (' class="subtotal"' if subtotal else "", "".join(celdas)))
    out.append('</tbody></table><div class="tras-tabla"></div>')
    return "".join(out)


def tramos(numeros):
    """[3, 4, 5, 9] -> [(3, 5), (9, 9)]: los números seguidos se citan como rango."""
    out = []
    for n in numeros:
        if out and n == out[-1][1] + 1:
            out[-1] = (out[-1][0], n)
        else:
            out.append((n, n))
    return out


def respaldo(r):
    """Cada veredicto breve dice en qué se apoya: la prueba sobre el sistema, la documentación
    oficial por su número en la sección 8, o las dos."""
    numeros = sorted({NUMERO_DE_URL[u] for u in r["fuentes"] if u in NUMERO_DE_URL})
    enlaces = []
    for a, b in tramos(numeros):
        e = '<a href="#%s">[%d]</a>' % (ancla(a), a)
        if b != a:
            e += '–<a href="#%s">[%d]</a>' % (ancla(b), b)
        enlaces.append(e)
    # Solo con la prueba va entre paréntesis; las fuentes solas ya llevan sus corchetes
    if r["prueba"]:
        return ' <span class="respaldo">(prueba%s)</span>' % ("; " + ", ".join(enlaces) if enlaces else "")
    return ' <span class="respaldo">%s</span>' % ", ".join(enlaces) if enlaces else ""


def cita(internos, chico):
    """Destacado («Ojo», ejemplos) o cita textual de una fuente con su número."""
    out = []
    for b in internos:
        if b[0] == "p" and b[1].startswith("— "):
            fuente = b[1][2:]
            m = URL.search(fuente)
            if m and m.group(0) in NUMERO_DE_URL:
                n = NUMERO_DE_URL[m.group(0)]
                out.append('<p class="de-fuente">— Fuente <a href="#%s"><b>[%d]</b></a>%s</p>'
                           % (ancla(n), n, enlinea(fuente[m.end():])))
            else:
                out.append(p(fuente, "de-fuente"))
        elif b[0] == "p":
            out.append(p(b[1], "textual" if b[1].startswith("«") else "en-cita"))
        elif b[0] == "codigo":
            out.append("<pre>%s</pre>" % html.escape("\n".join(b[1]), quote=False))
        else:
            out.append(render([b], chico))
    return "".join(out)


TITULOS = []


def titulo(nivel, texto):
    """Los títulos de nivel 1 y 2 van al índice; cada uno lleva su destino para el número de página."""
    ident = "t%d" % (len(TITULOS) + 1)
    if nivel <= 2:
        TITULOS.append((nivel, texto, ident))
    # Página nueva solo para el resumen y para el comienzo del cuerpo; el resto corre seguido
    pagina = nivel == 1 and (texto == "Resumen ejecutivo" or texto.startswith("1. "))
    return '<h%d id="%s"%s>%s</h%d>' % (min(nivel, 4), ident, ' class="pagina"' if pagina else "",
                                        enlinea(texto), min(nivel, 4))


def render(bs, chico=False, matriz=False):
    out, i = [], 0
    while i < len(bs):
        b = bs[i]
        tipo = b[0]
        siguiente = bs[i + 1] if i + 1 < len(bs) else None
        if tipo == "h":
            nivel, texto = b[1], b[2]
            # En la matriz, cada grupo es un rótulo dentro de la tabla de su origen
            if matriz and nivel == 4 and siguiente and siguiente[0] == "tabla":
                filas, grupos = [], {}
                while i + 1 < len(bs) and bs[i][0] == "h" and bs[i][1] == 4 and bs[i + 1][0] == "tabla":
                    t = bs[i + 1][1]
                    if filas and t[0] != filas[0]:
                        break
                    if not filas:
                        filas.append(t[0])
                    grupos[len(filas)] = bs[i][2]
                    filas.extend(t[1:])
                    i += 2
                out.append(tabla(filas, grupos=grupos, matriz=True))
                continue
            out.append(titulo(nivel, texto))
        elif tipo == "p":
            texto = b[1]
            clases = []
            if PLATAFORMA.match(texto):
                clases.append("veredicto")
                # Un veredicto sigue con el de la plataforma siguiente o con su lista
                if siguiente and (siguiente[0] == "lista" or (siguiente[0] == "p" and PLATAFORMA.match(siguiente[1]))):
                    clases.append("sigue")
            elif texto.startswith(("**Qué resuelve", "**Por qué importa", "**Cifra de referencia")):
                clases.append("sigue")
            bajada = texto.startswith("*") and texto.endswith("*") and not texto.startswith("**")
            if bajada:
                clases.append("bajada")
            # La bajada de un título y lo que presenta una tabla no quedan solos al pie de página
            if siguiente and (siguiente[0] == "tabla" or (bajada and siguiente[0] == "h")):
                clases.append("sigue")
            extra = respaldo(b[2]) if len(b) > 2 and b[2] else ""
            out.append(p(texto, " ".join(dict.fromkeys(clases)) or None, extra))
        elif tipo == "lista":
            tag = "ol" if b[1] else "ul"
            out.append("<%s>%s</%s>" % (tag, "".join("<li>%s%s</li>" % ("%d. " % k if b[1] else "", enlinea(x)) for k, x in enumerate(b[2], 1)), tag))
        elif tipo == "tabla":
            # Solo las tablas con una columna por plataforma llevan el ancho fijo de la matriz
            por_plataforma = all(c.replace("*", "").strip() in ("EspoCRM", "Twenty", "Bitrix24") for c in b[1][0][1:])
            out.append(tabla(b[1], chica=chico, matriz=matriz and por_plataforma))
        elif tipo == "cita":
            out.append(cita(b[1], chico))
        elif tipo == "codigo":
            out.append("<pre>%s</pre>" % html.escape("\n".join(b[1]), quote=False))
        i += 1
    return "".join(out)


def fuentes(texto):
    """Sección de fuentes: cada fuente con su número y su enlace."""
    out = []
    for b in bloques(texto):
        if b[0] == "lista":
            for item in b[2]:
                m = re.match(r"^(https?://\S+)(?: — (.*))?$", item)
                if m and m.group(1) in NUMERO_DE_URL:
                    n, u = NUMERO_DE_URL[m.group(1)], m.group(1)
                    desc = enlinea(". " + m.group(2)[0].upper() + m.group(2)[1:]) if m.group(2) else ""
                    out.append('<p class="fuente" id="%s"><b>[%d]</b><a class="url" href="%s">%s</a>%s</p>'
                               % (ancla(n), n, html.escape(u), html.escape(u, quote=False), desc))
                else:
                    out.append(p(item, "fuente"))
        else:
            out.append(render([b], True))
    return "".join(out)


# La entrega reduce la sección 5 al veredicto breve de cada plataforma.
REMISION_DETALLE = (
    "Cada veredicto cierra con su respaldo: «(prueba)» si se comprobó usando el sistema, y entre "
    "corchetes el número de la fuente oficial de la sección 8 si se apoya en documentación.")

SIMBOLO = {2: "●", 1: "◐", 0: "○"}
PLATAFORMAS = (("espocrm", "EspoCRM"), ("twenty", "Twenty"), ("bitrix24", "Bitrix24"))


def costo_en_palabras(d):
    """Cuánto trabajo exige dejarlo resuelto, dicho en palabras: en un «cumple», si viene listo o se
    configura una vez; en un «cumple con reparo», por qué no lo resuelve el sistema solo."""
    if d["cumple"] == 1:
        return {"codigo": "exige código", "manual": "exige una tarea manual", "parcial": "resuelve una parte"}.get(d.get("reparo"), "")
    if d.get("costo") is None or d["cumple"] != 2:
        return ""
    return ("viene listo", "se configura una vez")[d["costo"]]


def detalle_breve(bs):
    """La sección 5 de la entrega: por criterio, qué resuelve y, por plataforma, el símbolo, el costo
    en palabras, el resumen del veredicto y su respaldo."""
    res = {}
    for f in os.listdir(RESULTADOS):
        if f.endswith(".json"):
            d = json.load(open(os.path.join(RESULTADOS, f), encoding="utf-8"))
            res[(d["criterio"], d["plataforma"])] = d
    out, pendientes = [], []
    for b in bs:
        if b[0] == "h":
            # Los veredictos de un criterio van después de su «qué resuelve» y su cifra de referencia
            out += pendientes
            pendientes = []
            out.append(b)
            m = re.match(r"^([AB]\.\d+\.\d+) ", b[2]) if b[1] == 3 else None
            if not m:
                continue
            criterio = m.group(1)
            for k, nombre in PLATAFORMAS:
                d = res.get((criterio, k))
                if not d:
                    pendientes.append(("p", f"**{nombre}** ◍ sin verificar."))
                    continue
                if d.get("puntua") is False:
                    motivo = re.match(r".+?\.(?=\s|$)", d["motivo"]).group(0)
                    pendientes.append(("p", f"**{nombre}** ◍ sin verificar. {motivo}"))
                    continue
                costo = costo_en_palabras(d)
                rotulo = f"**{nombre}** {SIMBOLO[d['cumple']]}{'↑' if d.get('conPlan') else ''}" + (f" *{costo[0].upper() + costo[1:]}.*" if costo else "")
                r = {"prueba": bool(d.get("evidencia")), "fuentes": [x["url"] for x in d.get("documentacion") or []]}
                pendientes.append(("p", f"{rotulo} {d.get('resumen') or d['comoLoHace']}", r))
        elif b[0] == "tabla" or (b[0] == "p" and b[1].startswith(("**Qué resuelve", "**Por qué importa", "**Cifra de referencia"))):
            out.append(b)
    out += pendientes
    return out


# En la entrega, la sección 3 no lleva el catálogo: los criterios de cada parte ya figuran con su
# valor en la matriz y con lo que resuelven en el detalle. Sin esas tablas, las subsecciones quedan
# vacías, así que la sección corre sin subtítulos.
PARTES_DEL_CATALOGO = ("3.2", "3.3")


def sin_catalogo(bs):
    """La sección 3 de la entrega: los orígenes de los criterios y su reparto por grupo, sin subtítulos."""
    out, saltar = [], False
    for b in bs:
        if b[0] == "h" and b[1] == 2:
            saltar = b[2].split(" ")[0] in PARTES_DEL_CATALOGO
            continue
        if not saltar:
            out.append(b)
    return out


# --------------------------------------------------------------- armado e impresión
def indice(paginas):
    filas = "".join(
        '<a class="n%d" href="#%s"><span>%s</span><span class="puntos"></span><span>%s</span></a>'
        % (nivel, ident, enlinea(texto), paginas.get(ident, "000"))
        for nivel, texto, ident in TITULOS)
    return '<nav class="indice"><h1>Índice</h1>%s</nav>' % filas


def cuerpo_html(completa):
    archivos = sorted(f for f in os.listdir(INFORME) if re.match(r"^\d\d-.*\.md$", f))
    leer = lambda f: citas(open(os.path.join(INFORME, f), encoding="utf-8").read())
    resumen = next((f for f in archivos if "resumen" in f), None)
    cuerpo = [f for f in archivos if "portada" not in f and f != resumen]
    NUMERO_DE_URL.clear()
    for f in cuerpo:
        if "fuentes" in f:
            numerar_fuentes(leer(f))
    TITULOS.clear()
    out = []
    if resumen:
        out.append(render(bloques(leer(resumen))))
    for f in cuerpo:
        texto = leer(f)
        if "fuentes" in f:
            bs = bloques(texto)
            out.append(render(bs[:1]))
            out.append(fuentes("\n".join(texto.splitlines()[1:])))
        elif f.startswith("05-") and completa:
            out.append('<div class="chico">%s</div>' % render(bloques(texto), chico=True))
        elif f.startswith("05-"):
            bs = bloques(texto)
            out.append(render(bs[:1]))
            out.append(p(REMISION_DETALLE))
            out.append('<div class="chico">%s</div>' % render(detalle_breve(bs[1:]), chico=True))
        elif f.startswith("03-") and not completa:
            out.append(render(sin_catalogo(bloques(texto))))
        else:
            out.append(render(bloques(texto), matriz=f.startswith("04-")))
    return "".join(out)


def pagina(cuerpo, paginas, completa):
    fuentes_css = Path(PRESENTACION, "assets", "fonts.css").as_uri()
    titulo_doc = NOMBRE + (" - versión completa" if completa else "")
    # La primera página queda en blanco: ahí va la portada diseñada
    return ('<!doctype html><html lang="es"><head><meta charset="utf-8"><title>%s</title>'
            '<link rel="stylesheet" href="%s"><style>%s</style></head><body>'
            '<div class="tapa"></div>%s%s</body></html>'
            % (html.escape(titulo_doc), fuentes_css, CSS % {"titulo": TITULO_CORTO}, indice(paginas), cuerpo))


def imprimir(html_path, pdf_path):
    subprocess.run(["node", IMPRIMIR, html_path, pdf_path], check=True)


def paginas_de_titulos(pdf_path):
    r = PdfReader(pdf_path)
    return {k.lstrip("/"): r.get_destination_page_number(v) + 1 for k, v in r.named_destinations.items()}


def con_portada(pdf_path, completa, tmp):
    """Pone la portada diseñada (humanos/presentacion/portada) en la primera página, que el cuerpo deja en blanco."""
    subprocess.run(["node", PORTADA, tmp], check=True)
    tapa = PdfReader(os.path.join(tmp, "portada-completa.pdf" if completa else "portada.pdf"))
    # Clonar el documento conserva los vínculos, los marcadores y las fuentes; solo cambia la primera página
    out = PdfWriter(clone_from=pdf_path)
    out.insert_page(tapa.pages[0], 0)
    del out.pages[1]
    with open(pdf_path, "wb") as f:
        out.write(f)
    return len(out.pages)


def generar(completa, tmp):
    nombre = NOMBRE + (" - versión completa" if completa else "")
    cuerpo = cuerpo_html(completa)
    html_path = os.path.join(tmp, "informe%s.html" % ("-completo" if completa else ""))
    pdf_tmp = os.path.join(tmp, "informe%s.pdf" % ("-completo" if completa else ""))
    # Primera pasada para saber en qué página cae cada título; la segunda imprime el índice con esas páginas
    Path(html_path).write_text(pagina(cuerpo, {}, completa), encoding="utf-8")
    imprimir(html_path, pdf_tmp)
    paginas = paginas_de_titulos(pdf_tmp)
    Path(html_path).write_text(pagina(cuerpo, paginas, completa), encoding="utf-8")
    imprimir(html_path, pdf_tmp)
    if paginas_de_titulos(pdf_tmp) != paginas:
        raise SystemExit("El índice cambió la paginación de " + nombre)
    total = con_portada(pdf_tmp, completa, tmp)
    os.makedirs(ENTREGAS, exist_ok=True)
    pdf = os.path.join(ENTREGAS, nombre + ".pdf")
    shutil.copy(pdf_tmp, pdf)
    print("PDF:      ", pdf, "·", total, "páginas")


def main():
    with tempfile.TemporaryDirectory() as tmp:
        for completa in (False, True):
            generar(completa, tmp)


if __name__ == "__main__":
    main()
