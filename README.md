# TP SIE 3340 — Evaluación de sistemas CRM

Universidad de Morón · Sistemas de Información de la Empresa (3340)
Herramientas evaluadas: **EspoCRM 10.0.4 · Twenty v2.37.4 · Bitrix24 Free**

---

## Cómo trabajar acá (sin saber Git)

Todo se edita **desde el navegador**, no hace falta instalar nada:

1. Entrá al archivo que quieras editar (por ejemplo `informe/01-introduccion.md`)
2. Botón del **lápiz** ✏️ arriba a la derecha
3. Escribí
4. Abajo, **Commit changes** → poné en una línea qué cambiaste → **Commit**

Listo. Queda guardado, con tu nombre y la fecha.

**Si dos editan el mismo archivo al mismo tiempo**, GitHub avisa y no se pisa nada — pero para evitar el problema, mejor repartirse archivos distintos (ver *Reparto* más abajo).

### Formato: Markdown

| Lo que escribís | Cómo se ve |
|---|---|
| `# Título` | Título grande |
| `## Subtítulo` | Subtítulo |
| `**negrita**` | **negrita** |
| `- item` | lista con viñetas |
| `![](../evidencia/foto.png)` | inserta una imagen |

No hace falta más que eso. El formato final (tipografías, portada, índice) se aplica al exportar.

---

## Qué hay en cada carpeta

| Carpeta | Qué contiene | Quién la toca |
|---|---|---|
| `informe/` | **El documento a entregar**, dividido en secciones | Los 3 |
| `analisis/` | Investigación previa: comparativas, casos de prueba, precios | Generado, se consulta |
| `evidencia/` | Capturas y videos de las pruebas | Se genera solo |
| `datos/` | El dataset común (CSV) para cargar en las 3 herramientas | — |
| `pruebas/` | Tests automatizados con Playwright | — |

### Documentos de análisis ya hechos

| Archivo | Para qué sirve |
|---|---|
| [`analisis/Propuestas-CRM.md`](analisis/Propuestas-CRM.md) | Comparativa de 12 CRMs y por qué quedaron estos 3 |
| [`analisis/Casos-de-prueba.md`](analisis/Casos-de-prueba.md) | **271 casos** sobre 21 criterios |
| [`analisis/Fortalezas-cruzadas.md`](analisis/Fortalezas-cruzadas.md) | **244 fortalezas** de cada herramienta contra las otras |
| [`analisis/Planes-de-pago.md`](analisis/Planes-de-pago.md) | Precios verificados de los 3 |
| [`analisis/RESULTADOS-VIABILIDAD.md`](analisis/RESULTADOS-VIABILIDAD.md) | Qué se probó y qué se encontró |
| [`analisis/Plan-de-pruebas.md`](analisis/Plan-de-pruebas.md) | Metodología y cronograma |

---

## Reparto sugerido del informe

Cada uno toma sus archivos y no toca los del otro. Así no hay conflictos.

| Archivo | Contenido | Responsable |
|---|---|---|
| `informe/01-introduccion.md` | Objetivo, alcance, rubro del caso de estudio | |
| `informe/02-herramientas.md` | Presentación de las 3 herramientas | |
| `informe/03-criterios.md` | Los 13 criterios evaluados, con evidencia | |
| `informe/04-foda.md` | Matriz FODA de cada herramienta | |
| `informe/05-propuesta.md` | Recomendación final y justificación | |

*(Completar la columna Responsable en la primera reunión.)*

---

## Estado del trabajo

- [x] Investigación de mercado y selección de herramientas
- [x] Las 3 instancias levantadas y accesibles
- [x] Automatización con Playwright funcionando en las 3
- [x] Casos de prueba y fortalezas cruzadas definidos
- [ ] Dataset común cargado en las 3
- [ ] Ejecución de los 21 criterios
- [ ] Redacción del informe
- [ ] Presentación

---

## Recordatorios importantes

> ⚠️ **Bitrix24 se elimina a los 50 días sin login.** No lo suspende: lo **borra**, con los datos adentro. Entrar al portal al menos una vez por mes y exportar los datos después de cada avance.

> ⚠️ **Twenty trae 5 personas y 5 empresas de ejemplo.** Borrarlas antes de cargar el dataset o las mediciones de volumen salen contaminadas.

---

## Entorno de pruebas

| | URL | Acceso |
|---|---|---|
| EspoCRM 10.0.4 | http://localhost:8705 | admin / *(ver con el equipo)* |
| Twenty v2.37.4 | http://localhost:8704 | tp@unimoron.test |
| Bitrix24 Free | https://b24-orshha.bitrix24.es | cuenta del grupo |

Las dos primeras corren en Docker en la máquina de un integrante; no son públicas.

---

## Exportar el informe final

```bash
pandoc informe/*.md -o TP-SIE3340.docx --toc
```
