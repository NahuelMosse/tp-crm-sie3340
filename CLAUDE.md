# Guía del proyecto — TP SIE 3340

Evaluación de tres CRM para una **compañía de seguros**. El rubro lo fijó la cátedra, no se elige.
Equipo: Nestor Arakaki, Nahuel Mosse, Pedro Zornio.

**Leé el `README.md` antes de tocar nada.** Define la división `humanos/` · `ai/` y cómo trabaja el equipo.

---

## El repositorio es la única fuente

Todo vive acá: informe, automatización, resultados y evidencia. Remoto: `github.com/NahuelMosse/tp-crm-sie3340` (privado).

**Antes de editar, `git fetch` y comprobá que estás al día.** Existen copias sueltas del proyecto fuera del repositorio; una edición sobre cualquiera de ellas se pierde y el equipo no la ve. Si un archivo no está bajo `git status`, no es parte del trabajo.

**Tres personas trabajan sobre este repositorio.** No commitees ni pushees por tu cuenta: dejá los cambios en el árbol y avisá qué quedó listo, para no pisar lo que otro está escribiendo.

## El informe

`humanos/informe/`, una sección por archivo. Es lo único que se corrige.

| Archivo | Sección |
|---|---|
| `00-portada.md` | Portada |
| `01-objetivo-y-alcance.md` | Objetivo y alcance |
| `02-plataformas.md` | Las tres plataformas evaluadas |
| `03-metodologia-y-trazabilidad.md` | Escalas, ponderación y trazabilidad |
| `04-criterios-de-analisis.md` | El catálogo de criterios con su procedimiento |
| `05-matriz-de-veredictos.md` | **Generado** |
| `06-analisis-por-categoria.md` | **Generado** |

Faltan las secciones de análisis por plataforma, conclusiones y fuentes.

### Cómo se escribe

- **Informe formal para una empresa real.** Nunca se nombra la consigna, la cátedra ni la asignatura.
- **Se lee solo.** Nada de "ver anexo" ni referencias a `ai/`. Lo que sostiene una conclusión va adentro del informe.
- **Todo criterio se enuncia como capacidad a tener**, nunca como defecto. Un riesgo se reformula como la fortaleza que otros tienen.
- **Las conclusiones no van en la introducción.**
- **Nada que no se haya pedido.** Antes de agregar un tema al alcance, verificá que salga del pedido del cliente.
- **El entregable muestra el resultado, no el camino.** Sin notas de cambio, sin texto viejo comentado, sin marcas de versión.

## Las escalas

Dos escalas de tres valores, definidas en la sección 3. **Si cambian, cambian ahí primero**, y después en `evaluar.ts` y `generar-matriz.mjs`.

**Cumplimiento** — ¿queda resuelta la necesidad? `3` cumple · `2` cumple con reparo · `1` no cumple.
Configurar una vez es **3**: lo que distingue al 3 del 2 es si el trabajo extra se hace una vez o en cada uso.

**Costo de implementación** — ¿cuánto trabajo cuesta dejarlo funcionando? `3` viene listo · `2` configuración · `1` desarrollo o trabajo permanente.
No lo llevan los criterios no funcionales ni los que no cumplen.

**El cumplimiento mide la capacidad del producto, no la del plan contratado.** Si una función existe en un plan pago, cumple: lo que cuesta habilitarla va a la oferta económica. Penalizarla en la escala la cobraría dos veces. Son tres herramientas y tres columnas.

**Un criterio que un plan pago cambia lleva un valor adicional por cada nivel que lo cambia**, en `conPlan`, con el precio de ese plan. Cuando algo no está en la edición gratuita se recorren **todos** los planes: no es lo mismo resolverlo con el de entrada que necesitar el más caro. Solo se evalúa dos veces lo que de verdad cambia al pagar; la documentación, la infraestructura y la navegabilidad son iguales en todos los planes. Un plan que solo agrega volumen no genera valor nuevo.

**Cuando un procedimiento devuelve un número, el número es evidencia y no el veredicto.** El valor sale de la misma pregunta de la sección 3, anclada en lo que la compañía puede sostener; la sección 4.7 declara qué significa cada valor en esos criterios. **No inventes cortes numéricos** —"hasta ocho pasos vale 3"—: parecen objetivos, pero alguien eligió el ocho y esa elección decide el resultado sin que nadie pueda discutirla. Es justo lo que la escala de tres valores evita.

**Ponderación en tres niveles:** el criterio da su nota, el grupo promedia las de sus criterios, y la parte promedia las de sus grupos. **Todos los grupos pesan igual** —el pedido del cliente no jerarquiza sus necesidades y el análisis no las jerarquiza por él— y entre partes rige 85 % / 15 %. Que un grupo tenga más criterios no lo hace pesar más: así el catálogo se puede afinar sin mover ningún resultado.

**`sin verificar` es el único estado sin valor**, y describe el avance del trabajo, no a la plataforma. Si un criterio parece "no aplicar" a alguna, está mal escrito: se reformula desde la necesidad del negocio.

## La matriz se genera, no se transcribe

Desde `ai/automatizacion/`:

```bash
npx playwright test                    # medición limpia (los tiempos valen)
NARRAR=1 npx playwright test           # video didáctico con carteles
node generar-matriz.mjs ../..          # secciones 5 y 6 del informe
node generar-doc.mjs ../..             # documentación HTML de las pruebas
```

`generar-matriz.mjs` lee `resultados/*.json` —uno por evaluación, escrito por los tests— y produce las secciones 5 y 6. **Sin el argumento `../..` escribe fuera del repositorio.**

Ningún número del informe se escribe a mano. Transcribir la matriz ya produjo cuatro errores de recuento, uno de los cuales sostenía una afirmación falsa sobre qué plataforma cubría menos.

La justificación se escribe **en el test**, junto al código que comprueba el hecho: la redacta quien vio el resultado.

## Al evaluar una plataforma

- **Una prueba que falla no prueba que la plataforma falle.** Descartá primero el procedimiento, el instrumento y la configuración propia.
- **El valor 1 exige constancia en la documentación oficial del fabricante.** Que algo no aparezca en la instalación de prueba no prueba que el producto no lo tenga.
- **El muro de pago se determina completando la operación**, no buscando texto en la página: Bitrix24 tiene un botón fijo "Mejore su plan" en la barra lateral que da falso positivo siempre.
- La evidencia de las tres plataformas no es simétrica. Las instalables se inspeccionan por dentro; el servicio en la nube se evalúa por su comportamiento. La sección 3 lo reconoce explícitamente.

## Entorno

| | URL | Acceso |
|---|---|---|
| EspoCRM 10.0.4 Community | http://localhost:8705 | `admin` / `Admin1234!` |
| Twenty v2.37.4 | http://localhost:8704 | tp@unimoron.test |
| Bitrix24 Free | https://b24-orshha.bitrix24.es | sesión en `auth-bitrix.json` |

Las dos primeras corren en Docker. Los puertos se piden con `rg_port`; no se hardcodean.

**Bitrix24 se elimina a los 50 días sin ingreso**, con los datos adentro. Entrar una vez por mes.

La sesión de Bitrix24 se genera una sola vez y dura semanas:

```bash
npx playwright test --project=bitrix24-login --headed
```

Estar dentro se detecta por la **presencia** del menú del portal (`nav[aria-label="Menú principal"]`), nunca por la ausencia de un campo de contraseña: Bitrix24 conserva campos ocultos con la sesión iniciada.

## Trampas conocidas

| Síntoma | Causa |
|---|---|
| EspoCRM: `Failed opening 'install/entry.php'` | Montar `/var/www/html` tapa los archivos de la imagen. Montá solo `custom`, `data` y `client/custom` |
| El puerto del compose no cambia | Las listas de puertos se **fusionan** entre archivos, no se reemplazan. Editá el compose principal |
| MariaDB no arranca, `ibdata1` corrupto | Contenedor interrumpido durante la inicialización. `docker compose down -v` |
| Capturas que desaparecen | Playwright vacía `outputDir` en cada corrida. Las capturas manuales van fuera de esa carpeta |
| EspoCRM concatena texto en un campo | Autocompleta mientras se escribe. `clear()` antes de `fill()` |
| "Malformed UTF-8 characters" | Codificación de la consola de Git Bash, no un fallo del producto |
| El ingreso se saltea y después no aparece el menú | Aplicación de página única: esperar de verdad con `Promise.race`, no consultar con un plazo corto |

## Cómo trabajar acá

**Primero el criterio, después las pruebas.** Mientras la metodología esté en discusión, no se migran tests ni se reescriben resultados: ese trabajo se rehace con cada cambio.

**Verificá dónde estás editando.** Antes de afirmar que un archivo cambió, confirmá la ruta y que esté versionado.

**Trazabilidad en todo lo que se afirma:** `[REQ]` pedido del cliente · `[CRIT n]` criterio · `[UI:app ruta]` · `[API:método]` · `[TEST:id]` · `[DOC:url]` · `[RUBRO]` propio del negocio asegurador.
