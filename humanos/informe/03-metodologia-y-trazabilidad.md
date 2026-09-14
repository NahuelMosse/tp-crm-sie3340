# 3. Metodología de evaluación y trazabilidad

Esta sección define **cómo se puntúa**. Se presenta antes del catálogo de criterios porque cada uno de ellos remite a esta escala: sin conocerla, los criterios de la sección 4 no se pueden interpretar.

## 3.1 Qué mide la escala

Cada característica recibe un valor de **1 a 5** que mide una sola cosa: **cuánto esfuerzo exige la plataforma para cubrir esa necesidad**.

No mide qué tan completa es la función, ni qué tan bien resuelta está, ni cuánto cuesta. Esas son dimensiones distintas y mezclarlas vuelve el puntaje discutible. La completitud se resuelve descomponiendo la característica hasta que sea verificable de manera binaria; el costo se traslada íntegramente a la oferta económica.

| Valor | Nivel | Significado |
|:---:|---|---|
| **5** | **Nativo** | La función existe y opera sin configuración previa. Se instala el sistema y está disponible |
| **4** | **Configurable** | Se obtiene desde el panel de administración, sin escribir código |
| **3** | **Requiere desarrollo** | Se obtiene programando: interfaz de programación, script o extensión de terceros |
| **2** | **Resoluble por fuera** | La única vía es salir del sistema: exportar a planilla, usar otra herramienta, ejecutar un proceso manual |
| **1** | **No disponible** | No existe forma de obtenerla en ninguna edición del producto |

## 3.2 Cómo se determina el nivel

El valor no se elige: se deriva de cinco preguntas cerradas, en este orden. La primera que se responde afirmativamente fija el nivel.

| # | Pregunta | Si la respuesta es sí |
|---|---|---|
| 1 | ¿Existe la función en alguna edición del producto, incluidas las pagas? | Si **no** → **1** |
| 2 | ¿Está disponible al instalar, sin tocar configuración? | **5** |
| 3 | ¿Se logra desde el panel de administración, sin escribir código? | **4** |
| 4 | ¿Se logra mediante código, interfaz de programación o una extensión? | **3** |
| 5 | ¿La única vía es operar fuera del sistema? | **2** |

El orden importa: una función que se puede resolver tanto configurando como programando recibe **4**, porque la pregunta 3 se responde antes. La escala premia el camino más simple disponible, no el que el evaluador haya usado.

### Reglas de resolución

**Ante duda entre dos niveles, se asigna el menor.** La escala no infla: si no se pudo determinar si algo era configurable o requería desarrollo, se asigna el valor más bajo de los dos.

**Si una característica admite dos niveles según el aspecto que se mire, está mal descompuesta.** El caso típico: "importación desde Excel, Gmail y Outlook" no admite un valor único si el sistema importa uno de los tres. Corresponde dividirla en tres características independientes, cada una con su valor. Esta regla es la que lleva los veinte requerimientos del pedido a las cuarenta y tantas características evaluadas.

**Un límite cuantitativo no baja el nivel; lo marca.** Si una función opera pero con un tope —cantidad de registros, de envíos o de llamadas—, el nivel refleja el esfuerzo de obtenerla y el tope se consigna aparte, porque se levanta con una licencia y eso pertenece a la oferta económica.

## 3.3 Evidencia exigida por nivel

Ningún valor se asigna sin el respaldo que le corresponde.

| Valor | Qué se exige para asignarlo |
|:---:|---|
| **5** | Captura de la función operando sin configuración previa |
| **4** | Registro de la configuración realizada, con el resultado funcionando |
| **3** | Constancia documental del método de programación, o su ejecución |
| **2** | Descripción del procedimiento externo y la cantidad de pasos que agrega |
| **1** | **Constancia en la documentación oficial del fabricante** de que la función no existe |

El nivel 1 es el más exigente de demostrar, y es deliberado. Que una función no aparezca en la instalación de prueba no prueba que el producto no la tenga: puede estar en otro menú, requerir activación o depender de un módulo. Afirmar que algo no existe requiere respaldo del propio fabricante.

## 3.4 Cuando una función exige licencia

El puntaje técnico **no se modifica**. Una función nativa de un módulo pago vale 5, igual que si viniera incluida: el producto la tiene y la resuelve sin esfuerzo de implementación.

Lo que se registra es un **indicador de licencia** junto al valor, que alimenta la oferta económica de la sección 8.

> **Ejemplo.** La generación de informes es nativa en EspoCRM dentro del Advanced Pack y nativa en Bitrix24 dentro de sus planes pagos. Ambas puntúan **5**. La diferencia entre una licencia de pago único y un abono mensual no aparece en el puntaje técnico: aparece en la proyección de costo a tres y cinco años, que es donde esa diferencia se vuelve material.

El criterio evita penalizar dos veces el mismo hecho. Una plataforma que resuelve mediante un módulo pago no es funcionalmente inferior a otra que lo trae incluido; es más cara, y eso se mide donde corresponde.

## 3.5 Características sin verificar

Una característica no verificada **no recibe valor** y se excluye del cálculo, tanto del puntaje obtenido como del máximo posible. No se le asigna un valor intermedio ni se completa por deducción.

La consecuencia es que el porcentaje de cumplimiento se calcula sobre las características efectivamente verificadas, y el informe declara cuántas quedaron fuera. Un resultado sobre treinta características verificadas es más sólido que uno sobre cuarenta donde diez se completaron por suposición.

## 3.6 Ponderación

No todas las características pesan igual. Se aplican dos ponderaciones sucesivas.

### Por criticidad, dentro de las características solicitadas

| Criticidad | Peso | Qué incluye |
|---|:---:|---|
| **Núcleo** | ×3 | Lo que la compañía no puede dejar de hacer: seguimiento de la cartera, gestión de reclamos, ficha del asegurado |
| **Soporte** | ×2 | Lo que mejora la operación sin ser indispensable: campañas, proyección de ventas, agenda |
| **Accesorio** | ×1 | Lo que aporta valor marginal: escucha de menciones en redes |

### Entre características solicitadas y no solicitadas

| Grupo | Peso |
|---|:---:|
| **Parte A** — solicitadas | **85 %** |
| **Parte B** — no solicitadas | **15 %** |

La diferencia de peso responde a un riesgo concreto: las capacidades no solicitadas no deben compensar el incumplimiento de lo que el cliente pidió. Con esta proporción, una plataforma que cubriera la totalidad de la Parte B y la mitad de la Parte A quedaría por debajo de otra que cubriera la Parte A completa sin ninguna capacidad adicional, que es el orden correcto.

## 3.7 Cálculo del resultado

**Puntaje de cada parte:**

```
puntaje obtenido  =  Σ (valor × peso de criticidad)
puntaje máximo    =  Σ (5 × peso de criticidad)     sobre las características verificadas
% de cumplimiento =  puntaje obtenido / puntaje máximo × 100
```

**Oferta técnica:**

```
oferta técnica = 0,85 × (% cumplimiento Parte A) + 0,15 × (% cumplimiento Parte B)
```

**Oferta económica.** Se calcula sobre el costo total proyectado a cinco años, incluyendo licencias, infraestructura y el tiempo de administración estimado. La alternativa de menor costo recibe 100 puntos; las demás reciben un puntaje proporcional inverso:

```
puntaje económico = (costo de la alternativa más barata / costo de la alternativa) × 100
```

**Valor total:**

```
valor total = 0,70 × oferta técnica + 0,30 × oferta económica
```

La proporción 70/30 refleja que la decisión es primero funcional: un sistema barato que no cubre lo que la compañía necesita no resuelve el problema. El 30 % asignado al costo es suficiente para que una diferencia económica significativa altere el orden entre alternativas técnicamente parejas, que es exactamente lo que debe hacer.

## 3.8 Ejemplos resueltos

Tres casos del análisis, con el árbol de decisión aplicado.

**Modelado de la póliza — EspoCRM: 4**
¿Existe la función? Sí. ¿Viene lista al instalar? No: EspoCRM no trae una entidad Póliza. ¿Se logra desde el panel de administración sin programar? **Sí** — el Administrador de Entidades permite crearla y agregarle los campos del rubro. Nivel **4**, no 5: hay trabajo de configuración, pero no de desarrollo.

**Generación de informes — Twenty: 1**
¿Existe la función en alguna edición? **No.** La documentación del producto no incluye un módulo de informes y sus planes pagos solo agregan alojamiento gestionado. Nivel **1**, con la constancia documental que el nivel exige.

**Captación de prospectos desde redes sociales — Bitrix24: 5**
¿Existe? Sí. ¿Viene lista al instalar? **Sí** — la sección de marketing ofrece audiencias de Facebook y anuncios de Instagram sin configuración previa. Nivel **5**, con indicador de licencia pendiente de verificar: falta confirmar si su uso efectivo exige un plan pago.

## 3.9 Origen de cada afirmación

| Referencia | Significado |
|---|---|
| `[REQ]` | Frase textual del pedido del cliente |
| `[CRIT n]` | Criterio n del marco técnico de evaluación |
| `[UI:sistema ruta]` | Comprobado en la instalación, en la pantalla indicada |
| `[API:método]` | Ejecutado contra la interfaz de programación, con su respuesta |
| `[TEST:id]` | Demostrado mediante prueba automatizada, con video |
| `[DOC:dirección]` | Documentación oficial del fabricante, no comprobado |
| `[RUBRO]` | Derivado de las características del negocio asegurador |

La distinción entre lo comprobado y lo declarado por el fabricante es deliberada: durante las pruebas aparecieron diferencias entre ambas fuentes.

## 3.10 Cómo se produjo la evidencia

Las pruebas se automatizaron con Playwright, una herramienta de automatización de navegador. Esa decisión tuvo tres consecuencias sobre la calidad del análisis.

**El mismo procedimiento se ejecuta sobre las tres plataformas.** Cargar un asegurado en una y en otra no es una comparación entre dos personas operando a distinta velocidad, sino el mismo recorrido medido de igual manera.

**La evidencia queda registrada.** Cada ejecución produce un video del recorrido y capturas de cada paso. Ese registro respalda los valores asignados y permite reconstruir cómo se llegó a cada uno. Los hallazgos que surgieron de esas ejecuciones están volcados en las secciones 5 a 8 de este informe.

**Las mediciones se toman sin intervención.** Para la cantidad de pasos y los tiempos de operación se ejecutan dos corridas: una limpia, que produce los números, y otra con carteles explicativos para el video. Los tiempos de la segunda no se usan como dato: la misma prueba dio diez segundos en la corrida limpia y treinta y ocho en la narrada.

## 3.11 Limitaciones de la evidencia

**El escenario es una instalación de prueba, no una compañía en operación.** Los volúmenes cargados son de decenas de miles de registros. Las conclusiones sobre rendimiento valen para una compañía pequeña o mediana.

**Las instalaciones corrieron en una máquina compartida.** Los tiempos absolutos de instalación y arranque están afectados por la carga de esa máquina y deben leerse como comparación relativa entre las tres, no como valores de referencia.

**El conjunto de características no es neutral.** Treinta y tres provienen del pedido del cliente y del marco técnico de evaluación; el resto se buscó a propósito, enumerando las condiciones del negocio asegurador y las capacidades que aparecieron al operar los sistemas. Ese último grupo se filtró con un criterio explícito —solo entra la característica que discrimina entre las tres— y ese filtro inclina el recuento hacia las diferencias, no hacia las coincidencias.

**Una de las tres plataformas no admite inspección interna.** De las dos instalaciones propias se pudo revisar el código, la base de datos y los archivos de configuración. De la plataforma en la nube, solo lo que exponen su interfaz y su documentación. Esa asimetría no se puede resolver y explica que concentre la mayor cantidad de características sin verificar.

## 3.12 Correcciones aplicadas durante el análisis

Se registran porque afectan la lectura de los resultados.

**Detección de restricciones comerciales por texto de pantalla.** El primer procedimiento buscaba expresiones como "Mejore su plan" en el contenido de la página para determinar si una función estaba bloqueada. El método daba positivo siempre en una de las plataformas, porque ese botón está fijo en su menú lateral con independencia de la función que se esté usando. Se descartó: la restricción se determina completando la operación y observando si se bloquea, nunca por la presencia de un texto en pantalla.

**Error de servidor atribuido a la plataforma.** Al crear la entidad Póliza, EspoCRM devolvió un error interno. El registro del servidor mostró que el fallo ocurría al recalcular cotizaciones de moneda —la instalación tenía configurada una moneda local sin cotización cargada— y que **la entidad se había creado correctamente**. El error correspondía a un proceso posterior y a una decisión de configuración propia, no a una limitación del producto.

**Errores del instrumento atribuidos al producto.** Dos fallos iniciales resultaron ser de la herramienta de prueba: un campo que se completaba concatenando texto, porque el sistema autocompleta etiquetas mientras se escribe; y la creación de campos con opciones, que fallaba por la codificación de caracteres del entorno desde el que se enviaban.

Las tres apuntan a lo mismo: **una prueba que falla no prueba que la plataforma falle**. Cada resultado negativo se revisó antes de convertirse en veredicto.
