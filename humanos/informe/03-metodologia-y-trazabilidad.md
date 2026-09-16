# 3. Metodología de evaluación y trazabilidad

## 3.1 La escala

Todos los criterios se puntúan con los mismos tres valores:

| Valor | | Significa |
|:---:|---|---|
| **3** | **Cumple** | La necesidad queda resuelta |
| **2** | **Cumple con reparo** | Queda resuelta, pero con un costo o una salvedad permanente |
| **1** | **No cumple** | No queda resuelta |

Lo único que cambia es **la pregunta**, y depende de qué clase de criterio se esté evaluando.

### Criterios funcionales — qué hace el sistema

> **¿El usuario puede hacerlo desde el sistema, cada vez que lo necesita?**

| Situación | Valor |
|---|:---:|
| El sistema lo hace | **3** |
| Hay que configurarlo una vez, después funciona | **3** |
| Está en un plan pago, y contratándolo funciona | **3** |
| Hay que exportar a una planilla y trabajar afuera | **2** |
| Hay que repetir un procedimiento manual en cada uso | **2** |
| No existe en ninguna edición del producto | **1** |

**Entre 3 y 2**, la frontera es si el trabajo extra se hace **una vez o cada vez**. Configurar es una vez: después el usuario opera normal. Exportar a una planilla es cada vez: la necesidad la resuelve el usuario por fuera, no el sistema.

**Entre 2 y 1**, la frontera es si existe alguna vía. Si hay forma de lograrlo, aunque sea incómoda, es 2.

Aplica a los criterios de los grupos A.1 a A.4 y B.2: capacidades concretas que alguien ejecuta.

### Criterios no funcionales — cómo se comporta el sistema

Acá la pregunta anterior no tiene sentido: nadie *ejecuta* la documentación en español ni el consumo de memoria. Son condiciones que el sistema satisface o no.

> **¿El sistema satisface la condición que el negocio requiere?**

| Situación | Valor |
|---|:---:|
| La satisface | **3** |
| La satisface con una limitación que la compañía debe asumir | **2** |
| No la satisface | **1** |

| Ejemplo de criterio | 3 | 2 | 1 |
|---|---|---|---|
| Documentación en español | Oficial y completa | Parcial, o mantenida por la comunidad | No hay |
| Persistencia sin uso continuo | Los datos permanecen sin condiciones | Permanecen si se cumple una condición de uso | Se pierden |
| Volumen productivo | Opera con el volumen esperado | Opera con degradación advertible | No opera |
| Concurrencia sobre un registro | Resuelve el conflicto entre usuarios | Lo permite pero deja constancia | Se pierden datos sin aviso |
| Consumo de infraestructura | Dentro de lo que la compañía puede sostener | Exige infraestructura por encima de lo previsto | Fuera de su alcance |

Aplica a los criterios del grupo A.5 y B.1: cualidades del sistema, no acciones sobre él.

**El valor 2 significa lo mismo en ambos casos**: la necesidad queda cubierta, pero con un costo o una salvedad que la compañía carga de forma permanente. Esa equivalencia es lo que permite sumar ambos tipos de criterio en un mismo puntaje.

### Dónde se declara qué pregunta corresponde

Cada grupo de criterios de la sección 4 indica cuál de las dos preguntas se le aplica. No se decide criterio por criterio: **está fijado por grupo**, y esa asignación no cambia durante la evaluación.

## 3.2 Por qué tres valores y no cinco

La precisión no viene de graduar cada criterio, viene de **tener muchos criterios finos**.

Una escala de cinco valores obliga a distinguir entre "cumple bastante" y "cumple casi del todo", y esa distinción depende de quién puntúa. Con tres valores la pregunta es cerrada y la respuesta es la misma para cualquiera que mire el sistema.

Lo que se pierde en graduación se recupera dividiendo el criterio.

> **Ejemplo.** *"Seguimiento de pólizas"* no se evalúa como una sola cosa con una nota de 1 a 5. Se divide en criterios independientes —representar la póliza, registrar su prima y vigencia, vincularla al asegurado, conservar su historial— y cada uno recibe 3, 2 o 1.
>
> Una plataforma que modela la póliza pero no guarda historial obtiene 3 en los primeros y 1 en el último. Otra que hace las cuatro cosas obtiene 3 en las cuatro. **La diferencia aparece en el total, con más nitidez que si ambas hubieran recibido una nota global.**

Esta es la razón por la que los veinte requerimientos del pedido se convirtieron en cuarenta y dos criterios: la granularidad está en el catálogo, no en la escala.

## 3.3 Lo que la escala no mide, y la segunda escala

**Cómo el sistema resuelve la necesidad no cambia el valor de cumplimiento.** Si una plataforma trae la capacidad de fábrica y otra exige configurarla una vez, ambas obtienen **3**: el usuario termina haciendo su trabajo desde el sistema en los dos casos.

Pero esa diferencia existe y hay que medirla. Por eso **cada criterio recibe dos valores**, uno por cada pregunta:

| | Pregunta | Alimenta |
|---|---|---|
| **Cumplimiento** | ¿El usuario puede hacerlo desde el sistema? | Oferta técnica |
| **Costo de implementación** | ¿Cuánto trabajo cuesta dejarlo funcionando? | Oferta económica |

### La segunda escala

> **¿Cuánto trabajo cuesta dejarlo funcionando?**

| Valor | | Significa |
|:---:|---|---|
| **3** | **Sin trabajo** | Viene listo. No hay nada que implementar |
| **2** | **Configuración** | Se resuelve una vez con las opciones del sistema, sin programar |
| **1** | **Desarrollo o trabajo permanente** | Hay que escribir código, o el procedimiento se repite en cada uso |

Misma forma que la primera: tres valores, más alto es mejor, una sola pregunta.

### Cómo se combinan

Los dos valores son independientes y juntos describen la situación completa:

| Cumplimiento | Costo | Qué significa |
|:---:|:---:|---|
| 3 | 3 | Lo resuelve y viene listo. El caso ideal |
| 3 | 2 | Lo resuelve, con configuración inicial |
| 3 | 1 | Lo resuelve, pero hay que programarlo |
| 2 | 1 | Se logra por fuera del sistema, con trabajo en cada uso |
| 1 | — | No lo resuelve. No hay implementación que costear |

Cuando el cumplimiento es **1**, el costo de implementación no se puntúa: no hay nada que implementar.

Cuando el cumplimiento es **2**, el costo es siempre **1**: un procedimiento que se repite en cada uso es la forma más cara de resolver una necesidad, aunque no requiera ninguna puesta en marcha.

### Los criterios no funcionales no llevan costo de implementación

La segunda escala solo tiene sentido donde hay algo que poner en marcha. Que la documentación esté en español, que exista una comunidad activa o que los datos persistan sin uso son cualidades del producto: no se implementan, vienen con él.

Esos criterios reciben **un solo valor**, el de cumplimiento, y quedan fuera del índice de implementación. La excepción son los pocos criterios no funcionales que sí describen algo configurable —la automatización de procesos, por ejemplo, o la restricción de acceso por usuario—, que llevan los dos valores como cualquier criterio funcional.

### La licencia va aparte

La licencia no es trabajo sino dinero, así que no entra en ninguna de las dos escalas. Se registra como un dato con su monto y su modalidad —pago único o abono recurrente— y se suma directamente a la proyección de costo a cinco años.

> Dos plataformas pueden obtener **3 en cumplimiento y 3 en costo** para el mismo criterio, y aun así diferir: una lo trae incluido y la otra dentro de un plan pago. La primera escala dice que ambas resuelven la necesidad; la segunda, que ninguna exige trabajo de implementación; y el registro de licencia, que una cuesta dinero y la otra no. **Las tres cosas son distintas y se miden por separado.**

## 3.4 Todos los criterios se puntúan en las tres plataformas

**Un criterio bien escrito siempre admite respuesta.** Si alguna plataforma no se puede evaluar en alguno, el criterio está formulado desde la solución en lugar de desde la necesidad, y corresponde reescribirlo.

> **Ejemplo.** *"Cuánta memoria consume el servidor"* no tiene respuesta para un servicio en la nube: no hay servidor. Pero la necesidad detrás existe en los tres casos, y es otra: **qué recursos debe disponer la compañía para sostener el sistema.** Formulado así las tres responden — una no exige nada, otra corre en una máquina de escritorio, otra pide un servidor dedicado— y la comparación vuelve a ser posible.

Esto importa sobre todo por imparcialidad. Un criterio escrito con las características de una modalidad adentro —*"acceso directo a la base de datos"*, *"control del servidor"*— le da la ventaja a esa modalidad **por definición y no por evaluación**: la alternativa en la nube no puede ganarlo nunca, no porque resuelva peor la necesidad sino por cómo está redactada la pregunta. Reescrito desde la necesidad —*"explotación de los datos por fuera del sistema"*— la ventaja puede seguir existiendo, pero como resultado del análisis y no como supuesto de partida.

Ocho criterios del catálogo tenían ese defecto y se reescribieron por esta razón.

### El único estado sin valor: sin verificar

Queda una sola situación en la que un criterio no recibe valor, y **no es un problema del criterio sino del avance del trabajo**: todavía no se comprobó.

Ocurre cuando la operación no se pudo completar o cuando la plataforma no expone ese aspecto a la inspección. Es un estado transitorio: cuando la comprobación se realiza, el criterio puntúa como cualquier otro.

**Se excluye del cálculo por los dos lados**: no suma al puntaje obtenido ni al máximo posible. El porcentaje de cada plataforma se calcula solo sobre lo efectivamente comprobado, porque **asignar un valor a algo que no se verificó convierte una ausencia de dato en un dato.**

Cada plataforma publica cuántos criterios quedaron sin verificar junto a su porcentaje. Sin ese dato el porcentaje engaña: **un 90 % sobre veinte criterios comprobados no significa lo mismo que un 90 % sobre cincuenta.**

## 3.5 Evidencia exigida

| Valor | Qué se exige |
|:---:|---|
| **3** | Registro del sistema resolviéndolo: captura, respuesta de la interfaz de programación o video |
| **2** | Descripción del procedimiento externo y del trabajo que agrega en cada uso |
| **1** | **Constancia en la documentación oficial del fabricante** de que la capacidad no existe |

El valor 1 es el más exigente de demostrar, y es deliberado. Que algo no aparezca en la instalación de prueba no prueba que el producto no lo tenga: puede estar en otro menú, requerir activación o depender de un módulo.

**Una prueba que falla no prueba que la plataforma falle.** Cada resultado negativo se revisa antes de convertirse en veredicto: se descarta primero que el fallo provenga del procedimiento, del instrumento de prueba o de una decisión de configuración propia.

## 3.6 Ponderación

**Por criticidad**, dentro de los criterios solicitados:

| Criticidad | Peso | Qué incluye |
|---|:---:|---|
| **Núcleo** | ×3 | Lo que la compañía no puede dejar de hacer: cartera, reclamos, ficha del asegurado |
| **Soporte** | ×2 | Lo que mejora la operación sin ser indispensable |
| **Accesorio** | ×1 | Lo que aporta valor marginal |

**Entre solicitados y no solicitados:** Parte A **85 %**, Parte B **15 %**. Con esa proporción, una plataforma que cubriera toda la Parte B y la mitad de la Parte A queda por debajo de otra que cubra la Parte A completa sin ninguna capacidad adicional. Lo que el cliente pidió pesa más que lo que no pidió.

### Las dos ponderaciones no se superponen

Podría parecer que la criticidad y la proporción 85/15 miden lo mismo dos veces: que un criterio de la Parte B ya pesa poco por ser accesorio, y encima se lo multiplica por 0,15. No es así, porque **cada parte se normaliza por su propio máximo**:

```
% de la parte = Σ(valor × peso) / Σ(3 × peso)
```

Al dividir por el máximo de esa misma parte, el resultado queda entre 0 y 100 con independencia de si sus criterios son de núcleo o accesorios. Los pesos no agrandan ni achican el total de la parte: **solo ordenan la importancia de los criterios entre sí dentro de ella.**

| Ponderación | Qué decide |
|---|---|
| **Criticidad ×3 / ×2 / ×1** | Cuánto pesa un criterio frente a los otros **de su misma parte** |
| **85 / 15** | Cuánto pesa **cada parte** en el resultado final |

De ahí se desprende cómo asignar la criticidad: **se compara cada criterio con los de su propia parte, no con los de la otra.** Dentro de la Parte B, la persistencia de la cartera pesa más que el asistente de inteligencia artificial, y eso se refleja con criticidades distintas. Sería un error asignarles a todos los criterios de la Parte B la criticidad más baja «porque la Parte B importa menos»: esa diferencia ya la introduce el 15 %, y repetirla anularía la distinción entre lo importante y lo marginal dentro del propio grupo.

## 3.7 Cálculo del resultado

**Oferta técnica**, a partir de la primera escala:

```
puntaje obtenido  =  Σ (cumplimiento × peso de criticidad)
puntaje máximo    =  Σ (3 × peso de criticidad)      solo sobre los criterios puntuados
% de cumplimiento =  puntaje obtenido / puntaje máximo × 100

oferta técnica    =  0,85 × (% Parte A)  +  0,15 × (% Parte B)
```

**Índice de implementación**, a partir de la segunda escala. Se calcula solo sobre los criterios que la plataforma cumple, porque lo que no resuelve no se implementa:

```
índice de implementación  =  Σ (costo) / (3 × criterios cumplidos) × 100
```

Un índice de 100 significa que todo viene listo; uno bajo, que la puesta en marcha exige trabajo.

**Oferta económica.** Combina tres componentes, proyectados a cinco años:

| Componente | De dónde sale |
|---|---|
| Licencias | Registro de licencia de cada criterio, con su modalidad |
| Implementación | Índice de implementación, convertido a horas de puesta en marcha |
| Operación | Infraestructura y administración según la modalidad de despliegue |

```
puntaje económico =  (costo total de la más barata / costo total de la alternativa) × 100
```

**Valor total:**

```
valor total  =  0,70 × oferta técnica  +  0,30 × puntaje económico
```

La proporción 70/30 refleja que la decisión es primero funcional: un sistema barato que no cubre lo que la compañía necesita no resuelve el problema. El 30 % alcanza para que una diferencia económica significativa altere el orden entre alternativas técnicamente parejas.

## 3.8 Origen de cada afirmación

| Referencia | Significado |
|---|---|
| `[REQ]` | Frase textual del pedido del cliente |
| `[CRIT n]` | Criterio n del marco técnico de evaluación |
| `[UI:sistema ruta]` | Comprobado en la instalación, en la pantalla indicada |
| `[API:método]` | Ejecutado contra la interfaz de programación, con su respuesta |
| `[TEST:id]` | Demostrado mediante prueba automatizada, con video |
| `[DOC:dirección]` | Documentación oficial del fabricante, no comprobado |
| `[RUBRO]` | Derivado de las características del negocio asegurador |

## 3.9 Cómo se produjo la evidencia

Las pruebas se automatizaron con una herramienta de automatización de navegador, con tres consecuencias sobre la calidad del análisis.

**El mismo procedimiento se ejecuta sobre las tres plataformas.** Cargar un asegurado en una y en otra no es una comparación entre dos personas operando a distinta velocidad, sino el mismo recorrido evaluado con la misma pregunta.

**El valor se registra durante la ejecución**, junto al código que lo comprueba. La matriz de la sección 5 se genera a partir de esos registros: **ningún valor del informe se transcribe a mano.**

**La evidencia queda registrada.** Cada ejecución produce video y capturas que respaldan el valor asignado y permiten reconstruir cómo se llegó a él.

## 3.10 Limitaciones de la evidencia

**El escenario es una instalación de prueba, no una compañía en operación.** Los volúmenes cargados son de decenas de miles de registros; las conclusiones sobre rendimiento valen para una compañía pequeña o mediana.

**Las instalaciones corrieron en una máquina compartida.** Los tiempos absolutos están afectados por su carga y deben leerse como comparación relativa entre las tres.

**El conjunto de criterios no es neutral.** Treinta y tres provienen del pedido del cliente y del marco técnico; el resto se buscó a propósito, y ese grupo se filtró dejando solo lo que discrimina entre las tres. Ese filtro inclina el recuento hacia las diferencias, no hacia las coincidencias.

**Una de las tres plataformas no admite inspección interna.** De las dos instalaciones propias se pudo revisar el código, la base de datos y los archivos de configuración; de la plataforma en la nube, solo lo que exponen su interfaz y su documentación. Esa asimetría explica que concentre la mayor cantidad de criterios sin verificar.

## 3.11 Correcciones aplicadas durante el análisis

**El sistema de puntuación se rehízo dos veces.** La primera versión puntuaba de 1 a 5 según la vía de obtención de cada capacidad, lo que hacía que dos plataformas con capacidades distintas obtuvieran el mismo valor por requerir ambas configuración: medía el camino en lugar del destino. La segunda definía una escala propia para cada criterio, lo que eliminaba la ambigüedad pero obligaba a manejar cincuenta y seis reglas distintas. La versión definitiva usa una sola pregunta y tres valores, y recupera la precisión dividiendo los criterios en unidades más finas.

**Detección de restricciones comerciales por texto de pantalla.** El primer procedimiento buscaba expresiones como "mejore su plan" en el contenido de la página. Daba positivo siempre en una de las plataformas, porque ese botón está fijo en su menú lateral con independencia de la función que se use. Se descartó: la restricción se determina completando la operación, nunca por la presencia de un texto.

**Error de servidor atribuido a la plataforma.** Al crear la entidad Póliza, una plataforma devolvió un error interno. El registro del servidor mostró que el fallo ocurría al recalcular cotizaciones de moneda —la instalación tenía una moneda local sin cotización cargada— y que **la entidad se había creado correctamente**. El error correspondía a un proceso posterior y a una decisión de configuración propia.

**Errores del instrumento atribuidos al producto.** Dos fallos iniciales resultaron ser de la herramienta de prueba: un campo que se completaba concatenando texto, porque el sistema autocompleta etiquetas mientras se escribe; y la creación de campos con opciones, que fallaba por la codificación de caracteres del entorno desde el que se enviaban.
