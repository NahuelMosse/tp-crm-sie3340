# 3. Metodología de evaluación y trazabilidad

## 3.1 La escala

Todos los criterios se puntúan con los mismos tres valores:

| Valor | | Significa |
|:---:|---|---|
| **2** | **Cumple** | La necesidad queda resuelta |
| **1** | **Cumple con reparo** | Queda resuelta, pero con un costo o una salvedad permanente |
| **0** | **No cumple** | No queda resuelta |

**No cumplir vale cero, y eso importa.** Si el valor más bajo sumara algo, una plataforma que no resolviera ninguna necesidad obtendría igual una parte del puntaje, y ninguna podría quedar en cero por más que fallara en todo. Con esta escala el resultado recorre el rango completo: **0 % es no resolver nada y 100 % es resolverlo todo.**

Lo único que cambia es **la pregunta**, y depende de qué clase de criterio se esté evaluando.

### Criterios funcionales — qué hace el sistema

> **¿El usuario puede hacerlo desde el sistema, cada vez que lo necesita?**

| Situación | Valor |
|---|:---:|
| El sistema lo hace | **2** |
| Hay que configurarlo una vez, después funciona | **2** |
| Está en un plan pago, y contratándolo funciona | **2**, y se registra en qué plan |
| Hay que exportar a una planilla y trabajar afuera | **1** |
| Hay que repetir un procedimiento manual en cada uso | **1** |
| No existe en ninguna edición del producto | **0** |

**Entre 2 y 1**, la frontera es si el trabajo extra se hace **una vez o cada vez**. Configurar es una vez: después el usuario opera normal. Exportar a una planilla es cada vez: la necesidad la resuelve el usuario por fuera, no el sistema.

**Entre 1 y 0**, la frontera es si existe alguna vía. Si hay forma de lograrlo, aunque sea incómoda, es 1.

Aplica a los criterios de los grupos A.1 a A.10 y B.2: capacidades concretas que alguien ejecuta.

Varias de ellas pasarían por técnicas en un análisis genérico —crear una entidad, definir un campo calculado, restringir el acceso, construir un informe—, pero acá son **acciones que una persona realiza para que el negocio funcione**, y por eso responden esta pregunta y no la siguiente.

### Criterios no funcionales — cómo se comporta el sistema

Acá la pregunta anterior no tiene sentido: nadie *ejecuta* la documentación en español ni el consumo de memoria. Son condiciones que el sistema satisface o no.

> **¿El sistema satisface la condición que el negocio requiere?**

| Situación | Valor |
|---|:---:|
| La satisface | **2** |
| La satisface con una limitación que la compañía debe asumir | **1** |
| No la satisface | **0** |

| Ejemplo de criterio | 2 | 1 | 0 |
|---|---|---|---|
| Documentación en español | Oficial y completa | Parcial, o mantenida por la comunidad | No hay |
| Persistencia sin uso continuo | Los datos permanecen sin condiciones | Permanecen si se cumple una condición de uso | Se pierden |
| Volumen productivo | Opera con el volumen esperado | Opera con degradación advertible | No opera |
| Concurrencia sobre un registro | Resuelve el conflicto entre usuarios | Lo permite pero deja constancia | Se pierden datos sin aviso |
| Consumo de infraestructura | Dentro de lo que la compañía puede sostener | Exige infraestructura por encima de lo previsto | Fuera de su alcance |

Aplica a los criterios del grupo A.11 y B.1: cualidades del sistema, no acciones sobre él.

**El valor 1 significa lo mismo en ambos casos**: la necesidad queda cubierta, pero con un costo o una salvedad que la compañía carga de forma permanente. Esa equivalencia es lo que permite sumar ambos tipos de criterio en un mismo puntaje.

### Dónde se declara qué pregunta corresponde

Cada grupo de criterios de la sección 4 indica cuál de las dos preguntas se le aplica. No se decide criterio por criterio: **está fijado por grupo**, y esa asignación no cambia durante la evaluación.

## 3.2 Por qué tres valores y no cinco

La precisión no viene de graduar cada criterio, viene de **tener muchos criterios finos**.

Una escala de cinco valores obliga a distinguir entre "cumple bastante" y "cumple casi del todo", y esa distinción depende de quién puntúa. Con tres valores la pregunta es cerrada y la respuesta es la misma para cualquiera que mire el sistema.

Lo que se pierde en graduación se recupera dividiendo el criterio.

> **Ejemplo.** *"Seguimiento de pólizas"* no se evalúa como una sola cosa con una nota de 1 a 5. Se divide en criterios independientes —representar la póliza, registrar su prima y vigencia, vincularla al asegurado, conservar su historial— y cada uno recibe 2, 1 o 0.
>
> Una plataforma que modela la póliza pero no guarda historial obtiene 2 en los primeros y 0 en el último. Otra que hace las cuatro cosas obtiene 2 en las cuatro. **La diferencia aparece en el total, con más nitidez que si ambas hubieran recibido una nota global.**

Esta es la razón por la que los veinte requerimientos del pedido se convirtieron en más del doble de criterios funcionales: la granularidad está en el catálogo, no en la escala. El recuento por grupo se publica al cierre de la sección 4.

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
| **0** | **Sin trabajo** | Viene listo. No hay nada que implementar |
| **1** | **Configuración** | Se resuelve una vez con las opciones del sistema, sin programar |
| **2** | **Desarrollo o trabajo permanente** | Hay que escribir código, o el procedimiento se repite en cada uso |

**Esta escala corre al revés que la primera, y es a propósito: mide costo, no mérito.** Un 2 en cumplimiento es bueno porque la necesidad queda resuelta; un 2 en costo es malo porque hay que programar. Leer "costo 2" como algo deseable sería confundir lo que se está midiendo.

### Cómo se combinan

Los dos valores son independientes y juntos describen la situación completa:

| Cumplimiento | Costo | Qué significa |
|:---:|:---:|---|
| 2 | 0 | Lo resuelve y viene listo. El caso ideal |
| 2 | 1 | Lo resuelve, con configuración inicial |
| 2 | 2 | Lo resuelve, pero hay que programarlo |
| 1 | 2 | Se logra por fuera del sistema, con trabajo en cada uso |
| 0 | — | No lo resuelve. No hay implementación que costear |

Cuando el cumplimiento es **0**, el costo de implementación no se puntúa: no hay nada que implementar.

Cuando el cumplimiento es **1**, el costo es siempre **2**: un procedimiento que se repite en cada uso es la forma más cara de resolver una necesidad, aunque no requiera ninguna puesta en marcha.

### Los criterios no funcionales no llevan costo de implementación

La segunda escala solo tiene sentido donde hay algo que poner en marcha. Que la documentación esté en español, que exista una comunidad activa o que los datos persistan sin uso son cualidades del producto: no se implementan, vienen con él.

Esos criterios reciben **un solo valor**, el de cumplimiento, y quedan fuera del esfuerzo de implementación. No hay excepciones: todo lo que se pone en marcha —crear una entidad, automatizar un proceso, restringir un acceso— está clasificado como funcional precisamente porque alguien lo ejecuta.

### La licencia va aparte

La licencia no es trabajo sino dinero, así que no entra en ninguna de las dos escalas. Se registra como un dato con su monto y su modalidad —pago único o abono recurrente— y se suma directamente a la proyección de costo a tres y cinco años.

> Dos plataformas pueden obtener **2 en cumplimiento y 2 en costo** para el mismo criterio, y aun así diferir: una lo trae incluido y la otra dentro de un plan pago. La primera escala dice que ambas resuelven la necesidad; la segunda, que ninguna exige trabajo de implementación; y el registro de licencia, que una cuesta dinero y la otra no. **Las tres cosas son distintas y se miden por separado.**

### Los criterios que un plan pago cambia se puntúan en cada nivel

**El cumplimiento mide la capacidad del producto, no la del plan contratado**, según la regla que fija la sección 1: si una plataforma resuelve la necesidad, la resuelve, y lo que cueste habilitarla se traslada íntegramente a la oferta económica. Penalizar el plan en la escala funcional cobraría dos veces lo mismo.

Eso no borra la diferencia entre conseguir algo gratis y conseguirlo pagando, y esa diferencia es información que la compañía necesita. **Cuando un criterio no se resuelve en la edición gratuita, se recorren todos los planes del producto** —enumerados en la sección 2— hasta determinar en cuáles queda resuelto, y se registra un valor por cada nivel en que la respuesta cambia:

| | Plan | Precio | Cumplimiento |
|---|---|---|:---:|
| Edición gratuita | Free | — | 0 |
| Primer plan que lo resuelve | Basic | $49 por mes | 1 |
| Plan donde queda resuelto del todo | Professional | $199 por mes | 2 |

**No alcanza con saber que "se consigue pagando".** Que una capacidad exija el plan de entrada o el más caro de la escala cambia por completo la decisión, y esa distancia solo aparece si se recorre la progresión entera.

Solo se evalúa más de una vez **lo que de verdad cambia al pagar**. La documentación en español, los recursos de infraestructura o la navegabilidad son los mismos en todos los planes de un producto, y se evalúan una sola vez.

**Un plan que solo agrega volumen no genera un valor nuevo**: más usuarios, más almacenamiento o alojamiento gestionado no cambian ninguna respuesta de la matriz. Ese precio entra en la proyección económica como costo del tamaño de la operación, no como capacidad.

La matriz marca con **↑** los criterios que mejoran contratando, y publica dos porcentajes por plataforma:

| Porcentaje | Qué responde | Dónde se usa |
|---|---|---|
| **Oferta técnica** | Qué resuelve el producto, contratando lo que haga falta | Entra en el valor total, junto a la oferta económica |
| *Solo con la edición gratuita* | Qué se consigue sin pagar nada | Informativo: muestra el punto de partida y qué exige desembolso |

Así el informe responde la pregunta que la compañía necesita: **cuánto más cubre cada plataforma por lo que cuesta, y si ese gasto se justifica.**

## 3.4 Todos los criterios se puntúan en las tres plataformas

**Un criterio bien escrito siempre admite respuesta.** Si alguna plataforma no se puede evaluar en alguno, el criterio está formulado desde la solución en lugar de desde la necesidad, y corresponde reescribirlo.

> **Ejemplo.** *"Cuánta memoria consume el servidor"* no tiene respuesta para un servicio en la nube: no hay servidor. Pero la necesidad detrás existe en los tres casos, y es otra: **qué recursos debe disponer la compañía para sostener el sistema.** Formulado así las tres responden — una no exige nada, otra corre en una máquina de escritorio, otra pide un servidor dedicado— y la comparación vuelve a ser posible.

Esto importa sobre todo por imparcialidad. Un criterio escrito con las características de una modalidad adentro —*"acceso directo a la base de datos"*, *"control del servidor"*— le da la ventaja a esa modalidad **por definición y no por evaluación**: la alternativa en la nube no puede ganarlo nunca, no porque resuelva peor la necesidad sino por cómo está redactada la pregunta. Reescrito desde la necesidad —*"intercambio de datos con otros sistemas de la compañía"*— la ventaja puede seguir existiendo, pero como resultado del análisis y no como supuesto de partida.

Ocho criterios del catálogo tenían ese defecto y se reescribieron por esta razón.

### El único estado sin valor: sin verificar

Queda una sola situación en la que un criterio no recibe valor, y **no es un problema del criterio sino del avance del trabajo**: todavía no se comprobó.

Ocurre cuando la operación no se pudo completar o cuando la plataforma no expone ese aspecto a la inspección. Es un estado transitorio: cuando la comprobación se realiza, el criterio puntúa como cualquier otro.

**Se excluye del cálculo por los dos lados**: no suma al puntaje obtenido ni al máximo posible. El porcentaje de cada plataforma se calcula solo sobre lo efectivamente comprobado, porque **asignar un valor a algo que no se verificó convierte una ausencia de dato en un dato.**

Cada plataforma publica cuántos criterios quedaron sin verificar junto a su porcentaje. Sin ese dato el porcentaje engaña: **un 90 % sobre veinte criterios comprobados no significa lo mismo que un 90 % sobre cincuenta.**

## 3.5 Evidencia exigida

| Valor | Qué se exige |
|:---:|---|
| **2** | Registro del sistema resolviéndolo: captura, respuesta de la interfaz de programación o video |
| **1** | Descripción del procedimiento externo y del trabajo que agrega en cada uso |
| **0** | **Constancia en la documentación oficial del fabricante** de que la capacidad no existe |

El valor 0 es el más exigente de demostrar, y es deliberado. Que algo no aparezca en la instalación de prueba no prueba que el producto no lo tenga: puede estar en otro menú, requerir activación o depender de un módulo.

**Una prueba que falla no prueba que la plataforma falle.** Cada resultado negativo se revisa antes de convertirse en veredicto: se descarta primero que el fallo provenga del procedimiento, del instrumento de prueba o de una decisión de configuración propia.

## 3.6 Ponderación

Cada criterio recibe 2, 1 o 0. Falta decir cómo esas notas sueltas se convierten en un número por plataforma. Se resuelve en tres pasos, y en cada uno se promedia.

### Paso 1 — Cada grupo saca su nota

El grupo es una función del negocio: la cartera de pólizas, la atención de reclamos, el intercambio de datos. Su nota es **qué porcentaje del máximo alcanzaron sus criterios**.

> **Ejemplo.** El grupo *Cartera de pólizas* tiene siete criterios. Una plataforma saca 3 en cinco de ellos, 2 en uno y 1 en el último:
>
> ```
> 2 + 2 + 2 + 2 + 2 + 1 + 0  =  11
> máximo posible: 7 × 2      =  14
> nota del grupo: 11 / 14    =  78.6 %
> ```

Dentro del grupo todos los criterios valen lo mismo. Como el grupo reúne criterios de una misma función, no hace falta ordenarlos entre sí: lo que importa es qué parte de esa función queda resuelta.

### Paso 2 — La parte promedia sus grupos

La Parte A tiene once grupos; la Parte B, dos. **La nota de la parte es el promedio simple de las notas de sus grupos.**

> Siguiendo el ejemplo, si *Cartera de pólizas* sacó 78.6 %, *Marketing* sacó 40 % y los otros nueve grupos promedian 70 %, la Parte A obtiene:
>
> ```
> (78.6 + 40 + 70 × 9) / 11  =  68.1 %
> ```

Un grupo sin ningún criterio verificado no entra en el promedio: el resultado nunca depende de lo que todavía no se midió.

### Paso 3 — Las dos partes se combinan

| Parte | Peso |
|---|:---:|
| **A — Solicitados** | **85 %** |
| **B — No solicitados** | **15 %** |

```
oferta técnica  =  0,85 × Parte A  +  0,15 × Parte B
```

Con esa proporción, una plataforma que cubriera toda la Parte B y la mitad de la Parte A queda por debajo de otra que cubra la Parte A completa sin ninguna capacidad adicional.

---

### Por qué se promedia por grupo y no se suman todos los criterios juntos

Porque **sumarlos le daría más peso a los grupos que tienen más criterios**, y la cantidad de criterios de un grupo no dice cuánto importa esa función: dice cuánto hubo que dividirla para que cada comprobación tuviera una sola respuesta.

> *Condiciones técnicas del producto* tiene catorce criterios y *Control de acceso y trazabilidad* tiene tres. Sumando todo junto, el primero pesaría casi cinco veces más que el segundo, sin que nadie lo hubiera decidido. Promediando por grupo, los dos valen lo mismo: un onceavo de la Parte A.

La consecuencia práctica es que **el catálogo se puede afinar sin mover ningún resultado.** Dividir un criterio en dos vuelve a ser lo que debe ser —una mejora de precisión— y no una forma de inflar la importancia de su grupo.

### Por qué todos los grupos pesan igual

**El pedido del cliente no jerarquiza.** Enumera sus necesidades sin decir cuál le importa más, y nada en él permite deducir que la gestión de la cartera valga más que el seguimiento de los productores, o que la atención de reclamos.

Ponerle un peso mayor a un grupo sería **suponer lo que el cliente necesita en lugar de evaluarlo**. Esa jerarquía la fija la compañía según su propia operación, y este informe no tiene ese dato: tiene una lista de necesidades que el cliente enunció como igualmente suyas.

Lo único que el informe pondera es lo que sí está fundado: **que lo que el cliente pidió pese más que lo que no pidió.** Ese es el 85/15, y es el único número de la ponderación que no sale de un promedio.

> Si la compañía quisiera darle más peso a una función —porque conoce su operación y sabe que ahí se le va el día—, el cálculo lo admite sin rehacer nada: alcanza con cambiar el peso de ese grupo en el paso 2. El informe entrega el reparto parejo porque es lo que la información disponible justifica.

## 3.7 Cálculo del resultado

**Oferta técnica**, a partir de la primera escala. Se resuelve un nivel por vez:

```
% del grupo      =  Σ (cumplimiento)  /  (2 × criterios verificados del grupo)  × 100

% de la parte    =  promedio de los % de sus grupos

oferta técnica   =  0,85 × % Parte A  +  0,15 × % Parte B
```

Un grupo sin ningún criterio verificado queda fuera del cálculo, y su peso se reparte entre los demás: así el resultado nunca depende de lo que todavía no se midió. El informe publica los dos porcentajes junto al total, para poder leer por separado cómo le fue a cada plataforma en lo solicitado y en lo que no lo era.

**Esfuerzo de implementación**, a partir de la segunda escala. Se calcula solo sobre los criterios que la plataforma cumple, porque lo que no resuelve no se implementa:

```
esfuerzo de implementación  =  Σ (costo) / (2 × criterios cumplidos) × 100
```

**Acá conviene lo bajo:** un 0 significa que todo viene listo, y un 100 que cada capacidad exige programar o repetir trabajo en cada uso. Ese porcentaje se traduce a horas de puesta en marcha y entra en la oferta económica, no en la técnica.

**Oferta económica.** Combina tres componentes, proyectados a tres y cinco años:

| Componente | De dónde sale |
|---|---|
| Licencias | Registro de licencia de cada criterio, con su modalidad |
| Implementación | Esfuerzo de implementación, convertido a horas de puesta en marcha |
| Operación | Infraestructura y administración según la modalidad de despliegue |

```
puntaje económico =  (costo total de la más barata / costo total de la alternativa) × 100
```

**Valor total:**

```
valor total  =  0,70 × oferta técnica  +  0,30 × puntaje económico
```

La proporción 70/30 refleja que la decisión es primero funcional: un sistema barato que no cubre lo que la compañía necesita no resuelve el problema. El 30 % alcanza para que una diferencia económica significativa altere el orden entre alternativas técnicamente parejas.

## 3.8 Cómo se produjo la evidencia

Las pruebas se automatizaron con una herramienta de automatización de navegador, con tres consecuencias sobre la calidad del análisis.

**El mismo procedimiento se ejecuta sobre las tres plataformas.** Cargar un asegurado en una y en otra no es una comparación entre dos personas operando a distinta velocidad, sino el mismo recorrido evaluado con la misma pregunta.

**El valor se registra durante la ejecución**, junto al código que lo comprueba. La matriz de la sección 5 se genera a partir de esos registros: **ningún valor del informe se transcribe a mano.**

**La evidencia queda registrada.** Cada ejecución produce video y capturas que respaldan el valor asignado y permiten reconstruir cómo se llegó a él.

### Lo que no se puede automatizar

No todos los criterios se responden operando el sistema. Tres clases quedan fuera de la automatización, y cada una tiene su propia forma de registro:

| Clase | Ejemplos | Cómo se resuelve |
|---|---|---|
| **Observación con personas** | Aprendizaje sin capacitación previa | Tres personas ajenas ejecutan la misma consigna; se registra el resultado de cada una |
| **Medición con espera** | Tiempo hasta la primera respuesta del foro | Se publica una consulta real y se mide el tiempo transcurrido |
| **Verificación documental** | Continuidad de las versiones, plazo de respuesta comprometido | Se consulta la documentación del fabricante y se cita la fuente |

En los tres casos el valor **se registra con el mismo procedimiento y entra en la misma matriz**: lo que cambia es el instrumento, no la escala ni la exigencia de justificación.

### Cuándo vale la documentación del fabricante como prueba

Un compromiso de servicio, un plazo de soporte o una política de versiones no son observables en la instalación: **existen como compromiso del fabricante o no existen.** Para esos criterios la documentación oficial es la prueba adecuada, y se cita con su dirección y su fecha de consulta.

Fuera de esa clase, la documentación **no sustituye a la comprobación**. Que un fabricante afirme que su producto hace algo no es evidencia de que lo haga: cuando la capacidad es observable, se observa. La documentación del fabricante solo alcanza por sí sola para sostener el valor **0**, según la regla de la subsección 3.5, porque probar que algo no existe exige una fuente que lo declare.

## 3.9 Limitaciones de la evidencia

**El escenario es una instalación de prueba, no una compañía en operación.** Los volúmenes cargados son de decenas de miles de registros; las conclusiones sobre rendimiento valen para una compañía pequeña o mediana.

**Las instalaciones corrieron en una máquina compartida.** Los tiempos absolutos están afectados por su carga y deben leerse como comparación relativa entre las tres.

**El conjunto de criterios no es neutral.** Treinta y tres provienen del pedido del cliente y del marco técnico; el resto se buscó a propósito, y ese grupo se filtró dejando solo lo que discrimina entre las tres. Ese filtro inclina el recuento hacia las diferencias, no hacia las coincidencias.

**Una de las tres plataformas no admite inspección interna.** De las dos instalaciones propias se pudo revisar el código, la base de datos y los archivos de configuración; de la plataforma en la nube, solo lo que exponen su interfaz y su documentación. Esa asimetría explica que concentre la mayor cantidad de criterios sin verificar.

## 3.10 Correcciones aplicadas durante el análisis

**El sistema de puntuación se rehízo dos veces.** La primera versión puntuaba de 1 a 5 según la vía de obtención de cada capacidad, lo que hacía que dos plataformas con capacidades distintas obtuvieran el mismo valor por requerir ambas configuración: medía el camino en lugar del destino. La segunda definía una escala propia para cada criterio, lo que eliminaba la ambigüedad pero obligaba a manejar tantas reglas distintas como criterios tiene el catálogo. La versión definitiva usa una sola pregunta y tres valores, y recupera la precisión dividiendo los criterios en unidades más finas.

**Detección de restricciones comerciales por texto de pantalla.** El primer procedimiento buscaba expresiones como "mejore su plan" en el contenido de la página. Daba positivo siempre en una de las plataformas, porque ese botón está fijo en su menú lateral con independencia de la función que se use. Se descartó: la restricción se determina completando la operación, nunca por la presencia de un texto.

**Error de servidor atribuido a la plataforma.** Al crear la entidad Póliza, una plataforma devolvió un error interno. El registro del servidor mostró que el fallo ocurría al recalcular cotizaciones de moneda —la instalación tenía una moneda local sin cotización cargada— y que **la entidad se había creado correctamente**. El error correspondía a un proceso posterior y a una decisión de configuración propia.

**Errores del instrumento atribuidos al producto.** Dos fallos iniciales resultaron ser de la herramienta de prueba: un campo que se completaba concatenando texto, porque el sistema autocompleta etiquetas mientras se escribe; y la creación de campos con opciones, que fallaba por la codificación de caracteres del entorno desde el que se enviaban.
