# TP SIE 3340 — Evaluación de sistemas CRM

Universidad de Morón · Sistemas de Información de la Empresa (3340)
**EspoCRM 10.0.4 · Twenty v2.37.4 · Bitrix24 Free**

---

## Dos carpetas, dos públicos

```
humanos/     ← acá trabajan ustedes
ai/          ← acá trabaja Claude
```

**Regla:** ustedes editan `humanos/`. Yo mantengo `ai/`. Si algo de `ai/` les sirve, lo leen — pero no hace falta que lo toquen.

---

## `humanos/` — lo que importa para entregar

| Carpeta | Qué es |
|---|---|
| **`informe/`** | **El documento a entregar.** Una sección por archivo, versionado |
| **`pruebas/`** | Evidencia: capturas y videos de las pruebas sobre las 3 herramientas |
| **`consigna/`** | Los PDF de la cátedra |

### El informe

| Archivo | Contenido | Responsable |
|---|---|---|
| `01-introduccion.md` | Objetivo, alcance, rubro del caso de estudio | |
| `02-herramientas.md` | Presentación de las 3 herramientas | |
| `03-criterios.md` | Los 13 criterios evaluados, con evidencia | |
| `04-foda.md` | Matriz FODA de cada herramienta | |
| `05-propuesta.md` | Recomendación final y justificación | |

*(Completar Responsable en la primera reunión. **Un archivo por persona** evita pisarse.)*

---

## `ai/` — el trabajo de fondo

| Carpeta | Qué hay |
|---|---|
| `analisis/` | Investigación: comparativas, casos de prueba, fortalezas, precios |
| `automatizacion/` | Tests de Playwright, docker-compose de las instancias |
| `datos/` | Dataset común para cargar en las 3 herramientas |

Lo consultable si les sirve:

| Documento | Para qué |
|---|---|
| [`Propuestas-CRM.md`](ai/analisis/Propuestas-CRM.md) | Comparativa de 12 CRMs y por qué quedaron estos 3 |
| [`Casos-de-prueba.md`](ai/analisis/Casos-de-prueba.md) | 271 casos sobre 21 criterios |
| [`Fortalezas-cruzadas.md`](ai/analisis/Fortalezas-cruzadas.md) | 244 fortalezas de cada uno contra los otros |
| [`Planes-de-pago.md`](ai/analisis/Planes-de-pago.md) | Precios verificados |
| [`RESULTADOS-VIABILIDAD.md`](ai/analisis/RESULTADOS-VIABILIDAD.md) | Qué se probó y qué se encontró |

---

## Cómo editar sin saber Git

Todo desde el navegador, sin instalar nada:

1. Abrí el archivo (ej. `humanos/informe/01-introduccion.md`)
2. Botón del **lápiz** ✏️ arriba a la derecha
3. Escribí
4. Abajo: **Commit changes** → una línea de qué cambiaste → **Commit**

Queda guardado con tu nombre y la fecha.

### Markdown en 5 líneas

| Escribís | Sale |
|---|---|
| `# Título` | Título grande |
| `## Subtítulo` | Subtítulo |
| `**negrita**` | **negrita** |
| `- item` | viñeta |
| `![](../pruebas/foto.png)` | inserta una imagen |

---

## Estado

- [x] Investigación de mercado y selección de las 3 herramientas
- [x] Instancias levantadas y accesibles
- [x] Automatización con Playwright andando en las 3
- [x] Casos de prueba y fortalezas cruzadas definidos
- [ ] Dataset común cargado
- [ ] Ejecución de los 21 criterios
- [ ] Redacción del informe
- [ ] Presentación

---

## Ojo con esto

> ⚠️ **Bitrix24 se borra a los 50 días sin login.** No lo suspende: lo elimina con los datos adentro. Entrar una vez por mes y exportar después de cada avance.

> ⚠️ **Twenty trae 5 personas y 5 empresas de ejemplo.** Borrarlas antes de cargar el dataset o las mediciones salen contaminadas.

---

## Entorno

| | URL | Acceso |
|---|---|---|
| EspoCRM 10.0.4 | http://localhost:8705 | admin |
| Twenty v2.37.4 | http://localhost:8704 | tp@unimoron.test |
| Bitrix24 Free | https://b24-orshha.bitrix24.es | cuenta del grupo |

Las dos primeras corren en Docker en una máquina del grupo; no son públicas.

## Exportar el informe

```bash
pandoc humanos/informe/*.md -o TP-SIE3340.docx --toc
```
