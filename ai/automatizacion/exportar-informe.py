# -*- coding: utf-8 -*-
"""Arma el entregable a partir de las secciones del informe.

    python exportar-informe.py [raiz-del-repo]

Lee humanos/informe/*.md y escribe un .docx con el formato de los informes de análisis del
equipo: carátula, índice con páginas, resumen ejecutivo, tablas con filete fino y encabezado
gris, matriz con círculos y fuentes numeradas. Word actualiza el índice y exporta el PDF a
humanos/entregas/; el .docx queda en la raíz, sin versionar.

El markdown es lo único que se corrige: este script solo le da forma.
"""
import json
import os
import re
import subprocess
import sys
import tempfile

from docx import Document
from docx.enum.section import WD_SECTION
from docx.enum.table import WD_ALIGN_VERTICAL, WD_ROW_HEIGHT_RULE, WD_TABLE_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.opc.constants import RELATIONSHIP_TYPE as RT
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Cm, Pt, RGBColor

AQUI = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else os.path.join(AQUI, "..", ".."))
INFORME = os.path.join(RAIZ, "humanos", "informe")
ENTREGAS = os.path.join(RAIZ, "humanos", "entregas")
NOMBRE = "TP SIE 3340 - Selección de un Sistema CRM (resolución)"
TITULO_CORTO = "Selección de un sistema CRM para una compañía de seguros"

# Formato de informe académico sobrio: texto negro, tablas con filete fino y encabezado gris, sin
# bandas de color. El encabezado oscuro con letra blanca y los títulos azules son el aspecto
# típico de un documento generado, y se evitan.
NEGRO = RGBColor(0x26, 0x26, 0x26)
GRIS = RGBColor(0x59, 0x59, 0x59)
VINCULO = RGBColor(0x05, 0x63, 0xC1)
FUENTE = "Cambria"          # cuerpo con serifa, como un informe editado
FUENTE_TITULOS = "Arial"
GRIS_HDR = "D9D9D9"         # encabezado de tabla en gris claro, más oscuro que la fila de grupo
GRIS_GRUPO = "F2F2F2"
ANCHO_UTIL = 16.0  # cm: A4 con márgenes de 2,5
CIRCULOS = set("●◐○↑ ")
URL = re.compile(r"https?://[^\s,;)]+")


# --------------------------------------------------------------- oxml
def add_field(par, instr, placeholder=""):
    r = par.add_run()
    b = OxmlElement('w:fldChar'); b.set(qn('w:fldCharType'), 'begin'); b.set(qn('w:dirty'), 'true')
    it = OxmlElement('w:instrText'); it.set(qn('xml:space'), 'preserve'); it.text = instr
    s = OxmlElement('w:fldChar'); s.set(qn('w:fldCharType'), 'separate')
    t = OxmlElement('w:t'); t.text = placeholder
    e = OxmlElement('w:fldChar'); e.set(qn('w:fldCharType'), 'end')
    for el in (b, it, s, t, e):
        r._r.append(el)


def shade(cell, hexcolor):
    shd = OxmlElement('w:shd')
    shd.set(qn('w:val'), 'clear'); shd.set(qn('w:color'), 'auto'); shd.set(qn('w:fill'), hexcolor)
    cell._tc.get_or_add_tcPr().append(shd)


def vcenter(cell):
    va = OxmlElement('w:vAlign'); va.set(qn('w:val'), 'center')
    cell._tc.get_or_add_tcPr().append(va)


def fila_propiedad(row, nombre):
    el = OxmlElement('w:' + nombre); el.set(qn('w:val'), 'true')
    row._tr.get_or_add_trPr().append(el)


def sin_margen_de_celda(table):
    mar = OxmlElement('w:tblCellMar')
    for lado, valor in (('top', 55), ('bottom', 55), ('left', 100), ('right', 100)):
        el = OxmlElement('w:' + lado); el.set(qn('w:w'), str(valor)); el.set(qn('w:type'), 'dxa')
        mar.append(el)
    table._tbl.tblPr.append(mar)


def filete_inferior(pPr, color="7F7F7F", grosor="6"):
    """Línea fina bajo un párrafo: separa cada sección sin recurrir al color."""
    bdr = OxmlElement('w:pBdr')
    linea = OxmlElement('w:bottom')
    for k, v in (('val', 'single'), ('sz', grosor), ('space', '3'), ('color', color)):
        linea.set(qn('w:' + k), v)
    bdr.append(linea)
    pPr.append(bdr)


def filetes(table):
    """Cuadrícula completa con bordes grises finos: se sigue cada fila y cada columna con la vista."""
    tblPr = table._tbl.tblPr
    for viejo in tblPr.findall(qn('w:tblBorders')):
        tblPr.remove(viejo)
    bordes = OxmlElement('w:tblBorders')
    for lado in ('top', 'left', 'bottom', 'right', 'insideH', 'insideV'):
        val, sz, color = 'single', '4', '8C8C8C'
        el = OxmlElement('w:' + lado)
        el.set(qn('w:val'), val); el.set(qn('w:sz'), sz); el.set(qn('w:space'), '0'); el.set(qn('w:color'), color)
        bordes.append(el)
    tblPr.append(bordes)


def filete_bajo_celda(cell):
    tcPr = cell._tc.get_or_add_tcPr()
    b = OxmlElement('w:tcBorders')
    el = OxmlElement('w:bottom')
    el.set(qn('w:val'), 'single'); el.set(qn('w:sz'), '8'); el.set(qn('w:space'), '0'); el.set(qn('w:color'), '262626')
    b.append(el)
    tcPr.append(b)



MARCADORES = [0]


def marcar_destino(par, nombre):
    MARCADORES[0] += 1
    ini = OxmlElement('w:bookmarkStart'); ini.set(qn('w:id'), str(MARCADORES[0])); ini.set(qn('w:name'), nombre)
    fin = OxmlElement('w:bookmarkEnd'); fin.set(qn('w:id'), str(MARCADORES[0]))
    pPr = par._p.find(qn('w:pPr'))
    par._p.insert(list(par._p).index(pPr) + 1 if pPr is not None else 0, ini)
    par._p.append(fin)


def enlace(par, texto, size, destino, externo, color=None, negrita=False):
    """Hipervínculo a una dirección (azul y subrayado, como los pone Word) o a un marcador (negro)."""
    r = par.add_run(texto)
    r.font.size = Pt(size); r.bold = negrita
    if externo and color is None:
        color = VINCULO
        r.font.underline = True
    if color is not None:
        r.font.color.rgb = color
    h = OxmlElement('w:hyperlink')
    if externo:
        h.set(qn('r:id'), par.part.relate_to(destino, RT.HYPERLINK, is_external=True))
    else:
        h.set(qn('w:anchor'), destino)
    par._p.remove(r._r)
    h.append(r._r)
    par._p.append(h)


# --------------------------------------------------------------- fuentes numeradas
# Cada fuente de la sección 9 lleva un número en el orden en que se lista; las citas de la
# sección 6 remiten a ese número, como en una bibliografía.
NUMERO_DE_URL = {}


def numerar_fuentes(texto):
    for linea in texto.splitlines():
        m = re.match(r"^- (https?://\S+)", linea)
        if m and m.group(1) not in NUMERO_DE_URL:
            NUMERO_DE_URL[m.group(1)] = len(NUMERO_DE_URL) + 1


def ancla(n):
    return "fuente_%d" % n


# --------------------------------------------------------------- estilo
def style_base(doc):
    st = doc.styles['Normal']
    st.font.name = FUENTE; st.font.size = Pt(11)
    st.element.rPr.rFonts.set(qn('w:eastAsia'), FUENTE)
    st.paragraph_format.line_spacing = 1.25
    st.paragraph_format.space_after = Pt(7)
    for name, size, antes, despues in (('Heading 1', 15, 18, 8), ('Heading 2', 12, 12, 4),
                                       ('Heading 3', 11, 8, 3), ('Heading 4', 10.5, 6, 2)):
        h = doc.styles[name]
        h.font.name = FUENTE_TITULOS; h.font.size = Pt(size); h.font.color.rgb = NEGRO
        h.font.bold = True; h.font.italic = name == 'Heading 4'
        h.paragraph_format.space_before = Pt(antes)
        h.paragraph_format.space_after = Pt(despues)
        h.paragraph_format.line_spacing = 1.0 if name in ('Heading 3', 'Heading 4') else 1.15
        h.paragraph_format.keep_with_next = True
        if name == 'Heading 1':
            filete_inferior(h.element.get_or_add_pPr())
        rFonts = h.element.rPr.find(qn('w:rFonts'))
        for k in ('w:asciiTheme', 'w:hAnsiTheme', 'w:eastAsiaTheme', 'w:cstheme'):
            if rFonts is not None and rFonts.get(qn(k)) is not None:
                del rFonts.attrib[qn(k)]


def pie_con_numero(section):
    section.footer.is_linked_to_previous = False
    par = section.footer.paragraphs[0]
    par.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    par.text = ""
    # Filete fino arriba del pie, como en un informe editado
    bdr = OxmlElement('w:pBdr')
    arriba = OxmlElement('w:top')
    for k, v in (('val', 'single'), ('sz', '4'), ('space', '4'), ('color', 'A6A6A6')):
        arriba.set(qn('w:' + k), v)
    bdr.append(arriba)
    par._p.get_or_add_pPr().append(bdr)
    par.add_run(TITULO_CORTO + "   ·   Página ")
    add_field(par, ' PAGE   \\* MERGEFORMAT ', '2')
    par.add_run(" de ")
    add_field(par, ' NUMPAGES ', '2')
    for r in par.runs:
        r.font.size = Pt(8.5); r.font.name = FUENTE_TITULOS; r.font.color.rgb = GRIS


def nueva_seccion(doc):
    sec = doc.add_section(WD_SECTION.NEW_PAGE)
    sec.page_width, sec.page_height = Cm(21.0), Cm(29.7)
    sec.left_margin = sec.right_margin = sec.top_margin = sec.bottom_margin = Cm(2.5)
    pie_con_numero(sec)


# --------------------------------------------------------------- texto en línea
INLINE = re.compile(r"(\*\*.+?\*\*|(?<![\w*])\*[^*\s][^*]*?\*(?![\w*])|`[^`]+`)")


def runs(par, texto, size=11, bold=False, italic=False, color=None):
    """Agrega el texto con sus negritas, cursivas y código, y las direcciones como enlace."""
    for trozo in INLINE.split(texto):
        if not trozo:
            continue
        b, i, mono = bold, italic, False
        if trozo.startswith("**") and trozo.endswith("**") and len(trozo) > 4:
            trozo, b = trozo[2:-2], True
        elif trozo.startswith("`") and trozo.endswith("`"):
            trozo, mono = trozo[1:-1], True
        elif trozo.startswith("*") and trozo.endswith("*") and len(trozo) > 2:
            trozo, i = trozo[1:-1], not italic
        # Un trozo puede traer a su vez negritas dentro de cursivas, o al revés
        if INLINE.search(trozo):
            runs(par, trozo, size, b, i, color)
            continue
        pos = 0
        for m in URL.finditer(trozo):
            _run(par, trozo[pos:m.start()], size, b, i, mono, color)
            enlace(par, m.group(0), size, m.group(0), True, color=color, negrita=b)
            pos = m.end()
        _run(par, trozo[pos:], size, b, i, mono, color)


def _run(par, texto, size, b, i, mono, color):
    if not texto:
        return
    r = par.add_run(texto)
    r.font.size = Pt(size); r.bold = b; r.italic = i
    if mono:
        r.font.name = 'Consolas'
    if color is not None:
        r.font.color.rgb = color


def parrafo(doc, texto, size=11, align=WD_ALIGN_PARAGRAPH.LEFT, space_after=6, style=None,
            indent=None, italic=False):
    par = doc.add_paragraph(style=style) if style else doc.add_paragraph()
    par.alignment = align
    par.paragraph_format.space_after = Pt(space_after)
    if indent is not None:
        par.paragraph_format.left_indent = Cm(indent)
    runs(par, texto, size, italic=italic)
    return par


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


def anchos(filas):
    """Ancho de columna según el texto más largo, sin que ninguna corte una palabra al medio."""
    n = len(filas[0])
    celdas = [[re.sub(r"\*", "", f[j]) if j < len(f) else "" for f in filas] for j in range(n)]
    pesos = [min(max(len(c) for c in col), 70) for col in celdas]
    # Arial en negrita ocupa más que el promedio: la palabra más larga define el piso de la columna
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


def es_valor(texto):
    t = texto.replace("*", "").strip()
    return len(t) <= 22 and not re.search(r"[a-z]{4,}", t)


def tabla(doc, filas, size=9.5, grupos=None, matriz=False):
    """Tabla con filete fino y encabezado gris. `grupos` intercala filas de rótulo
    —el nombre de cada grupo de la matriz— antes de la fila indicada."""
    grupos = grupos or {}
    total = len(filas) + len(grupos)
    ncol = len(filas[0])
    t = doc.add_table(rows=total, cols=ncol)
    t.style = 'Table Grid'
    filetes(t)
    t.alignment = WD_TABLE_ALIGNMENT.CENTER
    if matriz:
        w = [ANCHO_UTIL - 3.0 * (ncol - 1)] + [3.0] * (ncol - 1)
    elif [c.replace("*", "") for c in filas[0]] == ["Versión", "Precio", "Criterios que cambia", "Cumplimiento total"]:
        # Las tres tablas de planes de la sección 5.5 comparten columnas
        w = [4.4, 4.4, 4.4, 2.8]
    else:
        w = anchos(filas)
    # El encabezado se alinea como su columna: centrado solo sobre columnas de valores
    def de_valores(j):
        celdas = [fl[j] for fl in filas[1:] if j < len(fl) and fl[j].strip()]
        return j > 0 and bool(celdas) and all(es_valor(c) for c in celdas)
    k = 0
    for f, fila in enumerate(filas):
        if f in grupos:
            celda = t.cell(k, 0).merge(t.cell(k, ncol - 1))
            celda_texto(celda, grupos[f], size + 0.5, True, None, WD_ALIGN_PARAGRAPH.LEFT, GRIS_GRUPO)
            k += 1
        encabezado = f == 0
        subtotal = fila[0].startswith("**")
        for j in range(ncol):
            valor = fila[j] if j < len(fila) else ""
            circulo = valor and set(valor.replace("*", "")) <= CIRCULOS
            if encabezado:
                celda_texto(t.cell(k, j), valor, size, True, None,
                            WD_ALIGN_PARAGRAPH.CENTER if de_valores(j) else WD_ALIGN_PARAGRAPH.LEFT, GRIS_HDR)
            else:
                relleno = None
                if subtotal and matriz:
                    # El porcentaje no se separa de su signo; el renglón se corta después del «·»
                    valor = valor.replace(' %', ' %')
                celda_texto(t.cell(k, j), valor, size + (1.5 if circulo else 0),
                            subtotal and matriz,
                            None, WD_ALIGN_PARAGRAPH.CENTER if (de_valores(j) and es_valor(valor)) else WD_ALIGN_PARAGRAPH.LEFT,
                            relleno)
        k += 1
    sin_margen_de_celda(t)
    t.autofit = False
    for row in t.rows:
        for j, cell in enumerate(row.cells):
            cell.width = Cm(w[j])
        fila_propiedad(row, 'cantSplit')
        row.height_rule = WD_ROW_HEIGHT_RULE.AT_LEAST
        row.height = Cm(0.5)
    fila_propiedad(t.rows[0], 'tblHeader')
    # Las tablas cortas no se parten entre dos páginas
    if total <= 18:
        for row in t.rows[:-1]:
            for cell in row.cells:
                for par in cell.paragraphs:
                    par.paragraph_format.keep_with_next = True
    doc.add_paragraph().paragraph_format.space_after = Pt(2)


def celda_texto(celda, texto, size, bold, color, align, relleno):
    celda.text = ""
    par = celda.paragraphs[0]
    par.alignment = align
    par.paragraph_format.space_after = Pt(0)
    par.paragraph_format.space_before = Pt(0)
    par.paragraph_format.line_spacing = 1.05
    runs(par, texto, size, bold=bold, color=color)
    # En las tablas, la letra sin serifa se lee mejor a cuerpo chico
    for r in par.runs:
        r.font.name = FUENTE_TITULOS
        r._element.get_or_add_rPr().get_or_add_rFonts().set(qn('w:eastAsia'), FUENTE_TITULOS)
    celda.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
    if relleno:
        shade(celda, relleno)
    vcenter(celda)


def cita(doc, internos, size):
    """Destacado («Ojo», ejemplos) o cita textual de una fuente con su número."""
    for b in internos:
        if b[0] == "p" and b[1].startswith("— "):
            fuente = b[1][2:]
            m = URL.search(fuente)
            par = doc.add_paragraph()
            par.paragraph_format.left_indent = Cm(1.0)
            par.paragraph_format.space_after = Pt(6)
            par.alignment = WD_ALIGN_PARAGRAPH.LEFT
            if m and m.group(0) in NUMERO_DE_URL:
                n = NUMERO_DE_URL[m.group(0)]
                _run(par, "— Fuente ", size - 1, False, False, False, None)
                enlace(par, "[%d]" % n, size - 1, ancla(n), False, negrita=True)
                _run(par, fuente[m.end():], size - 1, False, False, False, None)
            else:
                runs(par, fuente, size - 1)
            continue
        if b[0] == "p":
            textual = b[1].startswith("«")
            par = parrafo(doc, b[1], size=size - (1 if textual else 0), space_after=0 if textual else 4,
                          indent=1.0 if textual else 0, italic=textual)
            if textual:
                par.paragraph_format.keep_with_next = True
        elif b[0] == "codigo":
            codigo(doc, b[1], indent=0.4)
        else:
            render(doc, [b], size)


def codigo(doc, lineas, indent=0.0):
    par = doc.add_paragraph()
    par.paragraph_format.left_indent = Cm(indent + 0.6)
    par.paragraph_format.space_after = Pt(8)
    par.paragraph_format.line_spacing = 1.0
    for j, l in enumerate(lineas):
        r = par.add_run(l)
        r.font.name = 'Consolas'; r.font.size = Pt(9.5)
        if j < len(lineas) - 1:
            r.add_break()


def render(doc, bs, size=11, matriz=False):
    i = 0
    while i < len(bs):
        b = bs[i]
        tipo = b[0]
        if tipo == "h":
            nivel, titulo = b[1], b[2]
            # En la matriz, cada grupo es un rótulo dentro de la tabla de su origen
            if matriz and nivel == 4 and i + 1 < len(bs) and bs[i + 1][0] == "tabla":
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
                tabla(doc, filas, grupos=grupos, matriz=True)
                continue
            h = doc.add_heading(titulo, level=min(nivel, 4))
            # Página nueva solo para el resumen y para el comienzo del cuerpo; el resto corre seguido
            if nivel == 1 and (titulo == "Resumen ejecutivo" or titulo.startswith("1. ")):
                h.paragraph_format.page_break_before = True
                h.paragraph_format.space_before = Pt(0)
        elif tipo == "p":
            texto = b[1]
            plataforma = re.match(r"^\*\*(EspoCRM|Twenty|Bitrix24)\*\* ", texto)
            par = parrafo(doc, texto, size=size, space_after=3 if plataforma else 6)
            # Cada veredicto breve dice en qué se apoya: la prueba sobre el sistema, la documentación
            # oficial por su número en la sección 9, o las dos
            if len(b) > 2 and b[2]:
                respaldo = b[2]
                numeros = sorted({NUMERO_DE_URL[u] for u in respaldo["fuentes"] if u in NUMERO_DE_URL})
                # Solo con la prueba va entre paréntesis; las fuentes solas ya llevan sus corchetes
                entre = respaldo["prueba"]
                _run(par, " (prueba" + ("; " if numeros else "") if entre else " ",
                     size - 1, False, False, False, None)
                for k, (a, b) in enumerate(tramos(numeros)):
                    if k:
                        _run(par, ", ", size - 1, False, False, False, None)
                    enlace(par, "[%d]" % a, size - 1, ancla(a), False)
                    if b != a:
                        _run(par, "–", size - 1, False, False, False, None)
                        enlace(par, "[%d]" % b, size - 1, ancla(b), False)
                if entre:
                    _run(par, ")", size - 1, False, False, False, None)
            siguiente_es_veredicto = (i + 1 < len(bs) and bs[i + 1][0] == "p"
                                      and re.match(r"^\*\*(EspoCRM|Twenty|Bitrix24)\*\* ", bs[i + 1][1]))
            if plataforma:
                par.paragraph_format.space_before = Pt(6)
                # En la versión completa el veredicto sigue con su lista
                par.paragraph_format.keep_with_next = bool(siguiente_es_veredicto) or (
                    i + 1 < len(bs) and bs[i + 1][0] == "lista")
            elif texto.startswith(("**Qué resuelve", "**Por qué importa", "**Cifra de referencia")):
                par.paragraph_format.keep_with_next = True
            bajada = texto.startswith("*") and texto.endswith("*") and not texto.startswith("**")
            if bajada:
                par.alignment = WD_ALIGN_PARAGRAPH.LEFT
            # La bajada de un título y lo que presenta una tabla no quedan solos al pie de página
            siguiente = bs[i + 1][0] if i + 1 < len(bs) else None
            if siguiente == "tabla" or (bajada and siguiente == "h"):
                par.paragraph_format.keep_with_next = True
        elif tipo == "lista":
            for j, item in enumerate(b[2], 1):
                par = parrafo(doc, ("%d. " % j if b[1] else "") + item, size=size, space_after=3,
                              style=None if b[1] else 'List Bullet', indent=0.6 if b[1] else None)
        elif tipo == "tabla":
            # Solo las tablas con una columna por plataforma llevan el ancho fijo de la matriz
            por_plataforma = all(c.replace("*", "").strip() in ("EspoCRM", "Twenty", "Bitrix24") for c in b[1][0][1:])
            tabla(doc, b[1], size=9.5 if size >= 11 else 9, matriz=matriz and por_plataforma)
        elif tipo == "cita":
            cita(doc, b[1], size)
        elif tipo == "codigo":
            codigo(doc, b[1])
        elif tipo == "salto":
            pass
        i += 1


# --------------------------------------------------------------- partes del documento
def caratula(doc, texto, completa):
    bs = bloques(texto)
    rotulo = next(b[2] for b in bs if b[0] == "h" and b[1] == 1)
    if completa:
        rotulo += " — VERSIÓN COMPLETA"
    titulo = next(b[2] for b in bs if b[0] == "h" and b[1] == 2)
    bajada = next(b[2] for b in bs if b[0] == "h" and b[1] == 3)
    datos = next(b[1] for b in bs if b[0] == "tabla")
    pie = next(b[1] for b in bs if b[0] == "p")

    def linea(txt, size, bold=False, italic=False, color=None, after=6):
        par = doc.add_paragraph()
        par.alignment = WD_ALIGN_PARAGRAPH.CENTER
        par.paragraph_format.space_after = Pt(after)
        r = par.add_run(txt); r.font.size = Pt(size); r.bold = bold; r.italic = italic
        r.font.name = FUENTE_TITULOS if bold else FUENTE
        if color is not None:
            r.font.color.rgb = color
        return par

    linea("", 11, after=60)
    linea(rotulo, 10, bold=True, color=GRIS, after=36)
    filete_inferior(linea("", 6, after=14)._p.get_or_add_pPr(), color="262626", grosor="12")
    linea(titulo, 22, bold=True, after=8)
    filete_inferior(linea(bajada, 12, italic=True, after=90)._p.get_or_add_pPr(), color="262626", grosor="12")
    filas = [f for f in datos if any(c for c in f)]
    t = doc.add_table(rows=len(filas), cols=2)
    t.alignment = WD_TABLE_ALIGNMENT.CENTER
    for fila, (etiqueta, valor) in zip(t.rows, filas):
        for celda, txt, negrita in ((fila.cells[0], etiqueta.replace("*", ""), True),
                                    (fila.cells[1], valor.replace("*", ""), False)):
            celda.text = ""
            par = celda.paragraphs[0]
            par.paragraph_format.space_after = Pt(5)
            par.paragraph_format.line_spacing = 1.0
            r = par.add_run(txt); r.bold = negrita; r.font.size = Pt(11)
    for row in t.rows:
        row.cells[0].width, row.cells[1].width = Cm(5.2), Cm(8.0)
    linea("", 11, after=24)
    linea(pie, 9, italic=True)


def tramos(numeros):
    """[3, 4, 5, 9] -> [(3, 5), (9, 9)]: los números seguidos se citan como rango."""
    out = []
    for n in numeros:
        if out and n == out[-1][1] + 1:
            out[-1] = (out[-1][0], n)
        else:
            out.append((n, n))
    return out


# Canales de la comunidad que mide A.11.12: sus consultas son el material de un solo criterio
CANALES = (("forum.espocrm.com", "Foro oficial de EspoCRM"),
           ("github.com/twentyhq/twenty/discussions", "Discusiones del repositorio oficial de Twenty"),
           ("dev.1c-bitrix.ru", "Foro oficial de Bitrix24"))


def canal(url):
    return next((nombre for clave, nombre in CANALES if clave in url), None)


def fuentes(doc, texto, completa=True):
    """Sección 9: cada fuente con su número y su enlace. En la entrega, las consultas de un mismo
    canal de la comunidad se agrupan en una entrada con su rango de números."""
    for b in bloques(texto):
        if b[0] == "lista" and not completa:
            items, grupo = [], None
            for item in b[2]:
                m = re.match(r"^(https?://\S+)", item)
                nombre = canal(m.group(1)) if m else None
                if nombre and grupo and grupo[0] == nombre:
                    grupo[1].append(m.group(1))
                    continue
                grupo = [nombre, [m.group(1)]] if nombre else None
                items.append(grupo if nombre else item)
            for it in items:
                if isinstance(it, list):
                    nums = [NUMERO_DE_URL[u] for u in it[1] if u in NUMERO_DE_URL]
                    par = doc.add_paragraph()
                    par.alignment = WD_ALIGN_PARAGRAPH.LEFT
                    fmt = par.paragraph_format
                    fmt.space_after = Pt(2); fmt.line_spacing = 1.0
                    fmt.left_indent = Cm(1.7); fmt.first_line_indent = Cm(-1.7)
                    r0 = par.add_run("[%d]–[%d]\t" % (min(nums), max(nums))); r0.bold = True; r0.font.size = Pt(8.5)
                    runs(par, "%s: las %d consultas medidas en A.11.12." % (it[0], len(nums)), 8.5)
                    for n in nums:
                        marcar_destino(par, ancla(n))
                else:
                    fuentes(doc, "- " + it, completa=True)
            continue
        if b[0] == "lista":
            for item in b[2]:
                par = doc.add_paragraph()
                par.alignment = WD_ALIGN_PARAGRAPH.LEFT
                fmt = par.paragraph_format
                fmt.space_after = Pt(2); fmt.line_spacing = 1.0
                fmt.left_indent = Cm(1.7); fmt.first_line_indent = Cm(-1.7)
                m = re.match(r"^(https?://\S+)(?: — (.*))?$", item)
                if m and m.group(1) in NUMERO_DE_URL:
                    n = NUMERO_DE_URL[m.group(1)]
                    r0 = par.add_run("[%d]\t" % n); r0.bold = True; r0.font.size = Pt(8.5)
                    enlace(par, m.group(1), 8.5, m.group(1), True)
                    if m.group(2):
                        runs(par, ". " + m.group(2)[0].upper() + m.group(2)[1:], 8.5)
                    marcar_destino(par, ancla(n))
                else:
                    runs(par, item, 9)
        else:
            render(doc, [b], 10)


# La entrega reduce la sección 6 al veredicto breve de cada plataforma.
REMISION_DETALLE = (
    "Cada veredicto cierra con su respaldo: «(prueba)» si se comprobó operando el sistema, "
    "con video y capturas, y entre corchetes el número de la fuente oficial de la sección 9 si se apoya en documentación.")

SIMBOLO = {2: "●", 1: "◐", 0: "○"}
PLATAFORMAS = (("espocrm", "EspoCRM"), ("twenty", "Twenty"), ("bitrix24", "Bitrix24"))
RESULTADOS = os.path.join(os.path.dirname(os.path.abspath(__file__)), "resultados")


def costo_en_palabras(d):
    """El costo de implementación dicho como trabajo, no como número."""
    if d.get("costo") is None or d["cumple"] == 0:
        return ""
    if d["cumple"] == 1:
        return "trabajo en cada uso"
    return ("viene listo", "se configura una vez", "requiere programar")[d["costo"]]


def detalle_breve(bs):
    """La sección 6 de la entrega: por criterio, qué resuelve y, por plataforma, el símbolo, el costo
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
                    continue
                if d.get("puntua") is False:
                    motivo = re.match(r".+?\.(?=\s|$)", d["motivo"]).group(0)
                    pendientes.append(("p", f"**{nombre}** ◍ sin verificar. {motivo}"))
                    continue
                costo = costo_en_palabras(d)
                rotulo = f"**{nombre}** {SIMBOLO[d['cumple']]}" + (f" *{costo[0].upper() + costo[1:]}.*" if costo else "")
                respaldo = {"prueba": bool(d.get("evidencia")), "fuentes": [x["url"] for x in d.get("documentacion") or []]}
                pendientes.append(("p", f"{rotulo} {d.get('resumen') or d['comoLoHace']}", respaldo))
        elif b[0] == "tabla" or (b[0] == "p" and b[1].startswith(("**Qué resuelve", "**Por qué importa", "**Cifra de referencia"))):
            out.append(b)
    out += pendientes
    return out


REMISION_CATALOGO = {
    "4.4": "Los criterios de la Parte A se presentan con su valor en cada plataforma en la matriz de "
           "la sección 5, y con lo que resuelve para la compañía en la sección 6.",
    "4.5": "Los criterios de la Parte B se presentan del mismo modo en las secciones 5 y 6.",
}

def sin_catalogo(bs):
    """La sección 4 sin las tablas de criterios: cada parte queda con su remisión a la matriz."""
    out, saltar = [], False
    for b in bs:
        if b[0] == "h" and b[1] == 2:
            clave = b[2].split(" ")[0]
            saltar = clave in REMISION_CATALOGO
            out.append(b)
            if saltar:
                out.append(("p", REMISION_CATALOGO[clave]))
            continue
        if not saltar:
            out.append(b)
    return out


def main():
    for completa in (False, True):
        generar(completa)


def generar(completa):
    nombre = NOMBRE + (" - versión completa" if completa else "")
    archivos = sorted(f for f in os.listdir(INFORME) if re.match(r"^\d\d-.*\.md$", f))
    leer = lambda f: open(os.path.join(INFORME, f), encoding="utf-8").read()
    portada = next(f for f in archivos if "portada" in f)
    resumen = next((f for f in archivos if "resumen" in f), None)
    cuerpo = [f for f in archivos if f not in (portada, resumen)]
    for f in cuerpo:
        if "fuentes" in f:
            numerar_fuentes(leer(f))

    doc = Document()
    style_base(doc)
    sec0 = doc.sections[0]
    sec0.page_height, sec0.page_width = Cm(29.7), Cm(21.0)
    for attr in ('top_margin', 'bottom_margin', 'left_margin', 'right_margin'):
        setattr(sec0, attr, Cm(2.5))
    sec0.footer.is_linked_to_previous = False
    caratula(doc, leer(portada), completa)

    nueva_seccion(doc)
    par = doc.add_paragraph()
    r = par.add_run("Índice"); r.font.size = Pt(15); r.bold = True; r.font.name = FUENTE_TITULOS
    par.paragraph_format.space_after = Pt(12)
    add_field(doc.add_paragraph(), ' TOC \\o "1-2" \\h \\z \\u ', 'Índice')

    if resumen:
        render(doc, bloques(leer(resumen)), 11)

    for f in cuerpo:
        texto = leer(f)
        if "fuentes" in f:
            bs = bloques(texto)
            render(doc, bs[:1])
            fuentes(doc, "\n".join(texto.splitlines()[1:]), completa)
        elif f.startswith("06-") and completa:
            render(doc, bloques(texto), 10)
        elif f.startswith("06-"):
            bs = bloques(texto)
            render(doc, bs[:1])
            parrafo(doc, REMISION_DETALLE)
            render(doc, detalle_breve(bs[1:]), 10)
        elif f.startswith("04-") and not completa:
            render(doc, sin_catalogo(bloques(texto)), 11)
        else:
            render(doc, bloques(texto), 11, matriz=f.startswith("05-"))

    os.makedirs(ENTREGAS, exist_ok=True)
    docx = os.path.join(RAIZ, nombre + ".docx")
    doc.save(docx)
    print("Documento:", docx)
    exportar_pdf(docx, os.path.join(ENTREGAS, nombre + ".pdf"))


def exportar_pdf(docx, pdf):
    """Word rellena el índice con sus páginas y exporta: LibreOffice deja el índice vacío."""
    ps = r'''
$word = New-Object -ComObject Word.Application
$word.Visible = $false
$word.DisplayAlerts = 0
try {
    $doc = $word.Documents.Open($env:DOCX)
    $doc.Fields.Update() | Out-Null
    foreach ($toc in $doc.TablesOfContents) {
        $toc.Update()
        $toc.Range.ParagraphFormat.SpaceBefore = 0
        $toc.Range.ParagraphFormat.SpaceAfter = 1.5
        $toc.Range.ParagraphFormat.LineSpacingRule = 0
    }
    $doc.Save()
    $doc.ExportAsFixedFormat($env:PDF, 17)
    "Páginas:   " + $doc.ComputeStatistics(2)
    $doc.Close(0)
} finally {
    $word.Quit()
}
'''
    with tempfile.NamedTemporaryFile("w", suffix=".ps1", delete=False, encoding="utf-8-sig") as f:
        f.write(ps)
    try:
        env = dict(os.environ, DOCX=docx, PDF=pdf)
        subprocess.run(["powershell", "-NoProfile", "-ExecutionPolicy", "Bypass", "-File", f.name],
                       check=True, env=env)
        print("PDF:      ", pdf)
    finally:
        os.unlink(f.name)


if __name__ == "__main__":
    main()
