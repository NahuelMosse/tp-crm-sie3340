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

**Cumplimiento** — ¿queda resuelta la necesidad? `2` cumple · `1` cumple con reparo · `0` no cumple. No cumplir vale cero para que el resultado recorra de 0 a 100: si el minimo sumara, ninguna plataforma podria quedar en cero.
Configurar una vez es **2**: lo que distingue al 2 del 1 es si el trabajo extra se hace una vez o en cada uso.

**Costo de implementación** — ¿cuánto trabajo cuesta dejarlo funcionando? `0` viene listo · `1` configuración · `2` desarrollo o trabajo permanente. **Corre al reves que el cumplimiento**: mide costo, no merito, asi que acá el cero es lo bueno.
No lo llevan los criterios no funcionales ni los que no cumplen.

**El cumplimiento mide la capacidad del producto, no la del plan contratado.** Si una función existe en un plan pago, cumple: lo que cuesta habilitarla va a la oferta económica. Penalizarla en la escala la cobraría dos veces. Son tres herramientas y tres columnas.

**Un criterio que un plan pago cambia lleva un valor adicional por cada nivel que lo cambia**, en `conPlan`, con el precio de ese plan. Cuando algo no está en la edición gratuita se recorren **todos** los planes: no es lo mismo resolverlo con el de entrada que necesitar el más caro. Solo se evalúa dos veces lo que de verdad cambia al pagar; la documentación, la infraestructura y la navegabilidad son iguales en todos los planes. Un plan que solo agrega volumen no genera valor nuevo.

**Cuando un procedimiento devuelve un número, el número es evidencia y no el veredicto.** El valor sale de la misma pregunta de la sección 3, anclada en lo que la compañía puede sostener; la sección 4.7 declara qué significa cada valor en esos criterios. **No inventes cortes numéricos** —"hasta ocho pasos vale 3"—: parecen objetivos, pero alguien eligió el ocho y esa elección decide el resultado sin que nadie pueda discutirla. Es justo lo que la escala de tres valores evita.

**Ponderación en tres niveles:** el criterio da su nota, el grupo promedia las de sus criterios, y la parte promedia las de sus grupos. **Todos los grupos pesan igual** —el pedido del cliente no jerarquiza sus necesidades y el análisis no las jerarquiza por él— y entre partes rige 85 % / 15 %. Que un grupo tenga más criterios no lo hace pesar más: así el catálogo se puede afinar sin mover ningún resultado.

**`sin verificar` es el único estado sin valor**, y describe el avance del trabajo, no a la plataforma. Si un criterio parece "no aplicar" a alguna, está mal escrito: se reformula desde la necesidad del negocio.

## La matriz se genera, no se transcribe

Desde `ai/automatizacion/`:

```bash
npx playwright test --project=espocrm  # evalúa los criterios sobre una plataforma
NARRAR=1 npx playwright test           # video didáctico con carteles
node verificar-resultados.mjs          # control de los veredictos y avance por plataforma
node generar-matriz.mjs ../..          # secciones 5 y 6 del informe
node generar-doc.mjs ../..             # documentación HTML de las pruebas
```

El video de cada criterio lo conserva `videos.reporter.ts` en `evidencia/videos/`, porque Playwright vacía `test-results/` en cada corrida. **No pases `--reporter` por línea de comandos**: reemplaza los de la configuración y el video no se guarda.

`generar-matriz.mjs` lee `resultados/*.json` —uno por evaluación, escrito por los tests— y produce las secciones 5 y 6. **Sin el argumento `../..` escribe fuera del repositorio.**

Ningún número del informe se escribe a mano. Transcribir la matriz ya produjo cuatro errores de recuento, uno de los cuales sostenía una afirmación falsa sobre qué plataforma cubría menos.

La justificación se escribe **en el test**, junto al código que comprueba el hecho: la redacta quien vio el resultado.

**El catálogo vive en la sección 4 y en ningún otro lado.** `catalogo.cjs` lo lee de `04-criterios-de-analisis.md` en cada corrida, y de ahí lo toman la matriz, la trazabilidad y el verificador. Agregar o renombrar un criterio se hace en el informe; la automatización lo sigue sola.

**Las reglas de la sección 3 viven en `reglas.cjs`**, y las aplican tanto los tests al registrar como `verificar-resultados.mjs` sobre los archivos ya escritos. Un resultado editado a mano pasa por el mismo control.

## Cómo se evalúa un criterio

Un archivo por grupo en `tests/criterios/`, con cada criterio como un test que **cita textual el procedimiento de la sección 4**. Las plataformas todavía sin evaluar se saltan con `soloEn(...)`: saltar no escribe resultado, y sin resultado el criterio figura como sin verificar. Twenty tiene sus propios archivos, con los mismos nombres, en `tests/criterios/twenty/`, y sus ayudantes en `tests/twenty/` (`ui.ts`, `flujos.ts`, `tableros.ts`, `escenario.ts`, `aprendizaje.ts`).

### Toda prueba se hace como la haría una persona

El video de cada criterio es evidencia y lo mira alguien que no escribió la prueba: tiene que verse a una persona usando el sistema. Las reglas valen para las dos plataformas y para toda prueba nueva:

- **Se importa `test` y `expect` desde `tests/humano.ts`**, nunca desde `@playwright/test`. Ese módulo pone el puntero visible con la onda de cada clic, resalta el campo que se completa y fija el ritmo (`slowMo` de 350 ms, 700 con `NARRAR=1`). Antes de cada clic el puntero recorre el camino hasta el elemento y se detiene ahí: Playwright aprieta en el acto, y sin esa espera el clic se ve antes de que llegue el puntero.
- **Todo por clics.** A ninguna pantalla del sistema se entra por su dirección: `page.goto` a una ruta interna hace fallar la prueba. Se llega por los menús con `tests/twenty/navegar.ts` (menú lateral, menú del espacio de trabajo › Configuración, búsqueda general) y `tests/espocrm/navegar.ts` (pestañas, menú de la cuenta › Administración, enlaces de cada pantalla). `goto` solo se usa para el ingreso y para sitios de afuera. Si una pantalla nueva no tiene cómo llegar, se agrega el camino al `navegar.ts` de su plataforma.
- **Todo lo que se escribe se ve tecla por tecla**, a 90 ms por tecla (`TECLA_MS`). `fill`, `type` e `insertText` ya tipean así; no se asigna un valor por código ni se pega un texto. Si un editor completa llaves o sugiere mientras se escribe, se apagan esas ayudas del editor y se tipea igual (`escribirGuion`, `escribirCodigo`).
- **Los archivos se eligen con el botón** y la ventana de archivos (`waitForEvent('filechooser')`), no con `setInputFiles` sobre el campo.
- **Recargar es un clic**: `page.reload()` muestra un botón «⟳ Recargar» y el puntero hace clic ahí. La única dirección que se escribe es la que el procedimiento pide escribir —abrir un registro ajeno por su dirección en A.9.1—, con `escribirDireccion()`, que dibuja la barra y tipea.
- **Antes de tipear en un campo que aparece solo** —la fila nueva de un listado, un buscador— se espera a que tenga el cursor: lo que se tipea antes se pierde.
- **Lo que el criterio evalúa se hace por pantalla.** La interfaz de programación queda para preparar el escenario y limpiar, que no se ve, y para leer lo que quedó guardado. Solo es el hecho medido cuando el criterio mide justamente eso: el intercambio con otros sistemas (A.10.4, A.10.5) o lo que llega desde afuera, como un correo o un formulario externo.

Los tramos en que la prueba no hace nada —la preparación, las esperas al sistema— no quedan en el video. `humano.ts` anota el momento de cada clic, tecla y movimiento del ratón, y `videos.reporter.ts` acorta a un segundo cada tramo sin acciones de más de un segundo y medio. También corta el comienzo en blanco hasta un segundo antes de la primera acción. Por eso no hace falta apurar las esperas: se ven cortas igual. Hace falta ffmpeg en el PATH; sin ffmpeg el video se guarda entero.

**Antes de rehacer una suite, se prueba con un criterio y se mira su video**: se extraen cuadros con ffmpeg y se revisa que se vea lo que dice la justificación.

**Todo veredicto se respalda**, y el verificador lo exige: o una captura del sistema resolviéndolo (`evidencia`, en `evidencia/`), o una fuente oficial con **su texto textual** y la fecha de consulta (`documentacion`). Lo que no se puede comprobar ejercitando el sistema se resuelve consultando al fabricante, nunca afirmando. `citar()` abre la página, comprueba que el fragmento esté publicado y devuelve el párrafo completo con su captura: si el texto no está, el test falla.

**La prueba de aprendizaje (A.11.5) la hacen tres agentes, no un test.** `npx playwright test --project=aprendizaje-preparar` deja tres productores (`arios`, `bsalas`, `ctoledo`, clave `Aprendiz1234!`) con su cartera y sin restos de otra corrida; en Twenty, `--project=aprendizaje-preparar-twenty`, con los mismos usuarios como `<usuario>@aseguradora.test`. Después, de a uno —comparten el navegador—: se inicia sesión con ese productor y se lanza un agente nuevo, sin el contexto de la conversación, con `aprendizaje/consigna.md` completada con sus datos (`PERSONAS` en `tests/aprendizaje.ts`). Cada agente deja `aprendizaje/<plataforma>-p<n>.json` y sus capturas. El test de A.11.5 no le cree al agente: comprueba cada tarea sobre los datos guardados. Otras pruebas de Twenty rehacen el modelo —A.1.1 vuelve a crear la póliza— y se llevan esos datos: sin la cartera de aprendizaje, el test se salta y queda el resultado registrado al comprobarlo. Para volver a medir, se prepara de nuevo y se repite la prueba con los agentes.

**La comunidad (A.11.12) se mide sobre lo ya publicado**, con `foro.ts`: las 21 consultas más recientes del foro oficial con más de una semana, cada una clasificada con la escala, y el valor de la del medio. Twenty no tiene foro público —su comunidad conversa en Discord, que solo se lee con cuenta—: se mide sobre las discusiones del repositorio con `consultasGitHub`, que usa `gh`. Resuelta es solo la que su autor confirma en su propio texto; la regla está en `CONFIRMA` y `NIEGA`, y cambiarla puede mover el valor.

`preparar.ts` y `datos.ts` montan el escenario —campos puestos en pantalla, cartera de referencia cargada— y **no deciden ningún veredicto**. Cuando el criterio pregunta si el usuario puede hacerlo desde el sistema, la respuesta sale de recorrer la interfaz.

## Al evaluar una plataforma

- **Una prueba que falla no prueba que la plataforma falle.** Descartá primero el procedimiento, el instrumento y la configuración propia.
- **El valor 0 exige constancia en la documentación oficial del fabricante.** Que algo no aparezca en la instalación de prueba no prueba que el producto no lo tenga.
- **El muro de pago se determina completando la operación**, no buscando texto en la página: Bitrix24 tiene un botón fijo "Mejore su plan" en la barra lateral que da falso positivo siempre.
- La evidencia de las tres plataformas no es simétrica. Las instalables se inspeccionan por dentro; el servicio en la nube se evalúa por su comportamiento. La sección 3 lo reconoce explícitamente.

## Entorno

| | URL | Acceso |
|---|---|---|
| EspoCRM 10.0.4 Community | http://localhost:8705 | `admin` / `Admin1234!` |
| Twenty v2.37.4 | http://localhost:8704 | `tp@unimoron.test` / `TpCrm2026!`; productor `pgomez@aseguradora.test` / `Productor1234!` |
| Bitrix24 Free | https://b24-orshha.bitrix24.es | sesión en `auth-bitrix.json` |

Las dos primeras corren en Docker. Los puertos se piden con `rg_port`; no se hardcodean.

**Bitrix24 se elimina a los 50 días sin ingreso**, con los datos adentro. Entrar una vez por mes.

El correo se prueba contra un **GreenMail** en un contenedor del gobernador (`tp-crm/correo-greenmail`), con SMTP e IMAP reales. EspoCRM lo alcanza por `host.docker.internal`; los puertos son los de `tp-crm/correo-smtp`, `-imap` y `-api`, y están en `tests/correo.ts`.

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
| EspoCRM: un campo nuevo no aparece en el formulario | Definirlo en el Gestor de Campos no lo ubica en la pantalla. Segundo paso en el Gestor de Diseños, arrastrando (`preparar.ts`) |
| EspoCRM: `selectOption` no encuentra el desplegable | El producto lo reemplaza por uno propio y oculta el original. Usar `elegirLista()` |
| EspoCRM: un importe o una fecha no se guarda | Esos campos toman el valor de los eventos de teclado. Tipear con `pressSequentially`, no `fill` |
| EspoCRM: el listado aparece recortado o vacío | Recuerda la última búsqueda de cada listado por usuario. Abrirlo con `listadoLimpio()` |
| EspoCRM: el botón de filtros está deshabilitado | Ningún campo habilitado en «Filtros de búsqueda». Los propios no vienen habilitados: es configuración y va al costo |
| EspoCRM: una fórmula guardada rompe todas las altas de la entidad (error 500) | El editor completa paréntesis y sugiere funciones al tipear. Cargar el guion con `escribirGuion()`, que lo pega |
| EspoCRM: el campo de lista aparece pero `selectOption` falla | El desplegable propio se arma después que el campo. `elegirLista()` lo espera; las etiquetas traducidas no sirven para escribir el valor |
| EspoCRM: al salir de una ficha aparece «¿Seguro que quieres salir?» | El editor de texto enriquecido la deja marcada como modificada aunque ya se guardó. Confirmar con «Si» |
| EspoCRM: «Editar» no cambia la dirección | La ficha pasa a edición en el lugar. Lo que indica que se abrió es el botón «Guardar» (`edicion()`) |
| EspoCRM: la ficha vuelve sola después de cambiar de pestaña | Se salió mientras decía «Guardando...»: al terminar, el sistema vuelve a la ficha guardada. `navegar.ts` espera que termine |
| EspoCRM: el clic en la fila de un listado no abre la ficha | El listado se redibuja cuando llega la búsqueda. Esperar la respuesta de la búsqueda antes del clic (`ficha()`) |
| EspoCRM: la base de conocimiento no tiene «Crear» | Solo ofrece el alta rápida en una ventana; de ahí, «Formulario completo» (`alta()`) |
| EspoCRM: los usuarios de integración no están en el listado de usuarios | Están en Administración › Usuarios de API |
| EspoCRM: en la pantalla del teléfono no aparecen las pestañas | El menú queda plegado detrás del botón de las tres rayas (`pestana()`) |
| B.1.2 tarda o falla la restauración | La base aparte (MariaDB) se inicializa dos veces y, con la máquina cargada, tarda minutos. Se espera a su registro, no a un plazo fijo |
| EspoCRM: la relación nueva no aparece en la ficha del otro lado | La ficha tiene sus paneles inferiores definidos. Agregarla en el diseño `relationships` |
| EspoCRM: el historial no muestra los cambios de estado como actualización de campo | El cambio del campo de estado queda como nota `Update` con el valor nuevo en `data.value` y `fields` vacío |
| EspoCRM: la campaña no sale | El envío masivo corre a los minutos 10, 30 y 50. Correr `cron.php` cada minuto hasta la ventana (`correrTareas()`) |
| Registros «VOL-…» en los listados | Restos de una medición de volumen cortada a mitad. Las mediciones limpian en `finally`; si igual quedan, borrarlos por `MassAction` |
| `docker compose up` crea volúmenes vacíos | El prefijo sale del directorio. El compose fija `name: tp-crm` para adoptar la instalación existente |
| Twenty: un clic no hace nada | Varios controles descartan el clic sintético. `clicReal()`: mover, apretar, esperar 70 ms, soltar |
| Twenty: la interfaz de programación devuelve CSRF | La sesión es la cookie del navegador y exige `Origin: http://localhost:8704` (`apiTwenty()`). Un webhook llamado desde Playwright falla igual: usar `fetch` de Node |
| Twenty: no conecta la casilla de GreenMail | Rechaza direcciones internas. `OUTBOUND_HTTP_SAFE_MODE_ENABLED=false`, en Panel de administración › Variables de configuración, que se guarda en la base |
| Twenty: casilla en «Configuración incompleta» | Falta el botón «Agregar cuenta» del final, con visibilidad «Todo» (`completarCasilla()`) |
| Twenty: el paso de código de un flujo no se activa | `LOGIC_FUNCTION_TYPE` viene en `DISABLED`; ponerlo en `LOCAL` desde las variables de configuración. La primera corrida tarda minutos |
| Twenty: la prima se guarda multiplicada | El campo de moneda viene con 0 decimales y descarta el separador. Formato completo y 2 decimales (`comoImporte()`) |
| Twenty: el historial muestra un solo cambio | Los cambios de la misma persona sobre un registro dentro de 10 minutos se funden en una entrada, con el primer valor y el último |
| Twenty: `entrar()` sigue con la cuenta del productor | `entrar()` no cierra la sesión que haya. Para cambiar de usuario, `entrarComo()` |
| Twenty: el editor de flujos pierde el paso o lo duplica | El lienzo tarda en guardar. `agregarPaso()` recarga, cuenta los nodos y solo reintenta si no quedó; el texto va antes de la variable, nunca después |
| Twenty: el clic en un campo de relación abre el registro al costado | Con registros vinculados, el valor es un enlace. Se edita con el lápiz que aparece al pasar el ratón |
| Twenty: la planilla de Windows entra corrompida | El asistente lee el archivo como UTF-8: las tildes se rompen y las columnas se corren. Marca filas con error y pide «Enviar» para descartarlas |
| Twenty: la búsqueda escribe a continuación de lo anterior | El buscador conserva la última búsqueda. Clic en el campo, borrar y tipear (`ficha()`) |
| Twenty: la búsqueda abre otro registro con el mismo nombre | Los resultados mezclan objetos —una tarea puede llamarse como una póliza—. Cada fila termina en «· Póliza», «· Task»: se elige por eso |
| Twenty: una tarea o una nota no se abre como página | Se abre en el panel lateral; «Expandir registro» lleva a la ficha completa |
| Twenty: un registro nuevo no aparece en la búsqueda | Nace «Sin título» o tarda en indexarse. Se le pone nombre con un clic en el título, como a una oportunidad o un tablero |
| Twenty: con el productor, la interfaz de programación da 403 | No tiene permiso sobre el modelo de datos. Lo que prepara la prueba se lee con la sesión del administrador |
| Twenty: un tablero nuevo muestra una sola columna «Sin valor» | Hay vistas de otra corrida con el mismo nombre, agrupadas por un campo que ya no existe. Se borran antes de crear la nueva |

## Cómo trabajar acá

**Primero el criterio, después las pruebas.** Mientras la metodología esté en discusión, no se migran tests ni se reescriben resultados: ese trabajo se rehace con cada cambio.

**Verificá dónde estás editando.** Antes de afirmar que un archivo cambió, confirmá la ruta y que esté versionado.

**Trazabilidad en todo lo que se afirma:** `[REQ]` pedido del cliente · `[CRIT n]` criterio · `[UI:app ruta]` · `[API:método]` · `[TEST:id]` · `[DOC:url]` · `[RUBRO]` propio del negocio asegurador.
