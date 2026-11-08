# 3. Metodología de evaluación y trazabilidad

## 3.1 La escala

Todos los criterios se puntúan con los mismos tres valores:

| Valor | | Significa |
|:---:|---|---|
| **2** | **Cumple** | La necesidad queda resuelta |
| **1** | **Cumple con reparo** | Queda resuelta, pero con un costo o una salvedad permanente |
| **0** | **No cumple** | No queda resuelta |

No cumplir vale cero porque, si el valor más bajo sumara algo, una plataforma que no resolviera ninguna necesidad obtendría igual una parte del puntaje, y ninguna podría quedar en cero por más que fallara en todo. Con esta escala el resultado recorre el rango completo: **0 % es no resolver nada y 100 % es resolverlo todo.**

Lo único que cambia es la pregunta, que depende de qué clase de criterio se evalúe.

### Criterios funcionales — qué hace el sistema

> **¿El usuario puede hacerlo desde el sistema, cada vez que lo necesita?**

| Situación | Valor |
|---|:---:|
| El sistema lo hace | **2** |
| Hay que configurarlo una vez, después funciona | **2** |
| Hay que exportar a una planilla y trabajar afuera | **1** |
| Hay que repetir un procedimiento manual en cada uso | **1** |
| La versión evaluada no lo trae, aunque un plan pago o un módulo lo agregue (el plan se consigna como comentario) | **0** |

Entre 2 y 1, la frontera es si el trabajo extra se hace una vez o cada vez. Configurar es una vez: después el usuario opera normal. Exportar a una planilla es cada vez, porque la necesidad la resuelve el usuario por fuera del sistema. Entre 1 y 0, la frontera es si existe alguna vía: si hay forma de lograrlo, aunque sea incómoda, es 1.

Esta pregunta se aplica a los criterios de los grupos A.1 a A.10, A.12 y B.2, que son capacidades concretas que alguien ejecuta. En un análisis genérico varias de ellas pasarían por técnicas (crear una entidad, definir un campo calculado, restringir el acceso, construir un informe), pero acá son acciones que una persona realiza para que el negocio funcione, y por eso responden esta pregunta.

### Criterios no funcionales — cómo se comporta el sistema

La pregunta anterior no tiene sentido para estos criterios, porque nadie *ejecuta* la documentación en español ni el consumo de memoria. Son condiciones que el sistema satisface o no.

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

Estos criterios corresponden a los grupos A.11 y B.1 y describen cualidades del sistema, no acciones sobre él. Se dividen en dos tipos: los **técnicos** responden qué exige el sistema para funcionar y sostenerse (infraestructura, compatibilidad, puesta en marcha, resguardo de los datos) y los **operativos**, cómo se comporta en el trabajo diario (navegación, aprendizaje, idioma, usuarios simultáneos, soporte).

El valor 1 significa lo mismo en ambos casos: la necesidad queda cubierta, pero con un costo o una salvedad que la compañía carga de forma permanente. Esa equivalencia permite sumar ambos tipos de criterio en un mismo puntaje.

### Dónde se declara qué pregunta corresponde

Cada grupo de criterios de la sección 4 indica cuál de las dos preguntas se le aplica. La asignación está fijada por grupo, no se decide criterio por criterio y no cambia durante la evaluación. En los grupos no funcionales, cada criterio declara además si es técnico u operativo.

Quedan así los tres tipos de requerimiento (**funcionales, técnicos y operativos**) y, dentro de cada uno, los **originales**, que pidió el cliente (Parte A), y los **opcionales**, que se agregaron (Parte B). La matriz de la sección 5 se ordena de esa forma y cierra cada grupo y cada tipo con su subtotal.

## 3.2 Por qué tres valores y no cinco

La precisión no viene de graduar cada criterio sino de tener muchos criterios finos. Una escala de cinco valores obliga a distinguir entre "cumple bastante" y "cumple casi del todo", y esa distinción depende de quién puntúa. Con tres valores la pregunta es cerrada y la respuesta es la misma para cualquiera que mire el sistema. Lo que se pierde en graduación se recupera dividiendo el criterio: la cartera de pólizas no recibe una nota global, sino que se separa en representar la póliza, registrar su prima, su vigencia y su estado, y cada parte recibe su valor.

Por eso los veinte requerimientos del pedido se convirtieron en más del doble de criterios funcionales: la granularidad está en el catálogo, no en la escala. El recuento por grupo se publica al cierre de la sección 4.

## 3.3 Lo que la escala no mide, y la segunda escala

El modo en que el sistema resuelve la necesidad no cambia el valor de cumplimiento. Si una plataforma trae la capacidad de fábrica y otra exige configurarla una vez, ambas obtienen **2**, porque el usuario termina haciendo su trabajo desde el sistema en los dos casos. Esa diferencia existe y hay que medirla, y por eso cada criterio recibe dos valores, uno por cada pregunta:

| | Pregunta | Alimenta |
|---|---|---|
| **Cumplimiento** | ¿El usuario puede hacerlo desde el sistema? | Cumplimiento total |
| **Costo de implementación** | ¿Cuánto trabajo cuesta dejarlo funcionando? | Esfuerzo de implementación |

### La segunda escala

> **¿Cuánto trabajo cuesta dejarlo funcionando?**

| Valor | | Significa |
|:---:|---|---|
| **0** | **Sin trabajo** | Viene listo. No hay nada que implementar |
| **1** | **Configuración** | Se resuelve una vez con las opciones del sistema, sin programar |
| **2** | **Desarrollo o trabajo permanente** | Hay que escribir código, o el procedimiento se repite en cada uso |

Esta escala corre al revés que la primera a propósito, porque mide costo y no mérito. Un 2 en cumplimiento es bueno porque la necesidad queda resuelta; un 2 en costo es malo porque hay que programar.

### Cómo se combinan

Los dos valores son independientes y juntos describen la situación completa:

| Cumplimiento | Costo | Qué significa |
|:---:|:---:|---|
| 2 | 0 | Lo resuelve y viene listo. El caso ideal |
| 2 | 1 | Lo resuelve, con configuración inicial |
| 2 | 2 | Lo resuelve, pero hay que programarlo |
| 1 | 2 | Se logra por fuera del sistema, con trabajo en cada uso |
| 0 | — | No lo resuelve. No hay implementación que costear |

Cuando el cumplimiento es **0**, el costo de implementación no se puntúa, porque no hay nada que implementar. Cuando es **1**, el costo es siempre **2**: un procedimiento que se repite en cada uso es la forma más cara de resolver una necesidad, aunque no requiera ninguna puesta en marcha.

### Los criterios no funcionales no llevan costo de implementación

La segunda escala solo tiene sentido donde hay algo que poner en marcha. Que la documentación esté en español, que exista una comunidad activa o que los datos persistan sin uso son cualidades del producto: no se implementan, vienen con él. Esos criterios reciben un solo valor, el de cumplimiento, y quedan fuera del esfuerzo de implementación. No hay excepciones, porque todo lo que se pone en marcha (crear una entidad, automatizar un proceso, restringir un acceso) está clasificado como funcional, ya que alguien lo ejecuta.

### Lo que agrega un plan pago se informa como comentario

Se puntúa solo lo que trae la versión elegida (sección 1.2). Cuando un plan del fabricante resolvería un criterio, se registra como comentario: en qué plan queda resuelto, a qué precio y cómo cambiaría el valor. Se recorren los planes hasta el primero que lo resuelve, porque no es lo mismo conseguirlo con el plan de entrada que con el más caro. Un plan que solo agrega volumen (más usuarios, más almacenamiento, alojamiento gestionado) no genera comentario.

La matriz marca esos criterios con **↑**, y la sección 5.5 reúne los planes que los cambian, con su precio y el resultado que alcanzaría cada plataforma contratándolos. Ese resultado no reemplaza al puntaje: muestra cuánto margen de crecimiento tiene cada una.

## 3.4 Todos los criterios se puntúan en las tres plataformas

Un criterio bien escrito siempre admite respuesta. Si alguna plataforma no se puede evaluar en alguno, el criterio está formulado desde la solución en lugar de desde la necesidad, y corresponde reescribirlo.

> Por ejemplo, *"Cuánta memoria consume el servidor"* no tiene respuesta para un servicio en la nube, porque no hay servidor. Pero la necesidad detrás existe en los tres casos, y es otra: **qué recursos debe disponer la compañía para sostener el sistema.** Formulado así, las tres responden (una no exige nada, otra corre en una máquina de escritorio, otra pide un servidor dedicado) y la comparación vuelve a ser posible.

Esto importa sobre todo por imparcialidad. Un criterio escrito con las características de una modalidad adentro, como *"acceso directo a la base de datos"* o *"control del servidor"*, le da la ventaja a esa modalidad por definición y no por evaluación: la alternativa en la nube no puede ganarlo nunca, no porque resuelva peor la necesidad sino por cómo está redactada la pregunta. Reescrito desde la necesidad (*"intercambio de datos con otros sistemas de la compañía"*), la ventaja puede seguir existiendo, pero como resultado del análisis y no como supuesto de partida.

### El único estado sin valor: no se pudo verificar

Queda una sola situación en la que un criterio no recibe valor: todavía no se comprobó. Ese estado describe el avance del trabajo, no a la plataforma. Ocurre cuando la operación no se pudo completar o cuando la plataforma no expone ese aspecto a la inspección. Es un estado transitorio, y cuando la comprobación se realiza el criterio puntúa como cualquier otro.

Se excluye del cálculo por los dos lados: no suma al puntaje obtenido ni al máximo posible. El porcentaje de cada plataforma se calcula solo sobre lo efectivamente comprobado, porque asignar un valor a algo que no se verificó convierte una ausencia de dato en un dato.

La matriz informa cuántas evaluaciones quedaron sin verificar. Sin ese dato el porcentaje engaña: un 90 % sobre veinte criterios comprobados no significa lo mismo que un 90 % sobre cincuenta.

## 3.5 Evidencia exigida

La evaluación funciona como una auditoría sobre la versión elegida: lo que se afirma de una plataforma se demuestra, con lo observado al operarla o con la documentación oficial que la describe.

| Valor | Qué se exige |
|:---:|---|
| **2** | Registro del sistema resolviéndolo: captura, respuesta de la interfaz de programación o video |
| **1** | El mismo registro, más la descripción del trabajo que agrega en cada uso |
| **0** | Registro de lo que ocurre al intentarlo en la versión evaluada (la función ausente, el aviso de que exige otro plan) o la constancia del fabricante de que esa versión no la incluye |

Lo que no se pudo comprobar no se da por cubierto ni por ausente: queda como **no se pudo verificar**, el único estado sin valor (3.4).

Una prueba que falla no prueba que la plataforma falle. Cada resultado negativo se revisa antes de convertirse en veredicto, y se descarta primero que el fallo provenga del procedimiento, del instrumento de prueba o de una decisión de configuración propia.

Las restricciones de un plan se determinan completando la operación, nunca por la presencia de un aviso en pantalla: uno de los sistemas muestra un botón fijo para mejorar el plan, cualquiera sea la función que se use.

## 3.6 Ponderación

Cada criterio recibe 2, 1 o 0. Falta decir cómo esas notas sueltas se convierten en un número por plataforma. Se resuelve en tres pasos, y en cada uno se promedia.

### Paso 1 — Cada grupo saca su nota

El grupo es una función del negocio: la cartera de pólizas, la atención de reclamos, el intercambio de datos. Su nota es el porcentaje del máximo que alcanzaron sus criterios.

> Por ejemplo, el grupo *Cartera de pólizas* tiene siete criterios. Una plataforma saca 2 en cinco de ellos, 1 en uno y 0 en el último:
>
> ```
> 2 + 2 + 2 + 2 + 2 + 1 + 0  =  11
> máximo posible: 7 × 2      =  14
> nota del grupo: 11 / 14    =  78.6 %
> ```

Dentro del grupo todos los criterios valen lo mismo. Como reúne criterios de una misma función, no hace falta ordenarlos entre sí: importa qué parte de esa función queda resuelta.

### Paso 2 — La parte promedia sus grupos

La Parte A tiene doce grupos y la Parte B, dos. **La nota de la parte es el promedio simple de las notas de sus grupos.**

> Siguiendo el ejemplo, si *Cartera de pólizas* sacó 78.6 %, *Marketing* sacó 40 % y los otros diez grupos promedian 70 %, la Parte A obtiene:
>
> ```
> (78.6 + 40 + 70 × 10) / 12  =  68.2 %
> ```

Un grupo sin ningún criterio verificado no entra en el promedio, de modo que el resultado nunca depende de lo que todavía no se midió.

La sección 5 publica además el subtotal de cada grupo (los puntos obtenidos sobre el máximo posible) y el de cada tipo de requerimiento. El subtotal por tipo suma los puntos de todos sus criterios y sirve para leer cómo se comporta cada plataforma en lo funcional, lo técnico y lo operativo, pero el puntaje de la parte sigue saliendo del promedio de sus grupos.

### Paso 3 — Las dos partes se combinan

| Parte | Peso |
|---|:---:|
| **A — Solicitados** | **85 %** |
| **B — No solicitados** | **15 %** |

```
cumplimiento total  =  0,85 × Parte A  +  0,15 × Parte B
```

Con esa proporción, una plataforma que cubriera toda la Parte B y la mitad de la Parte A queda por debajo de otra que cubra la Parte A completa sin ninguna capacidad adicional.

---

### Por qué se promedia por grupo y no se suman todos los criterios juntos

Sumarlos le daría más peso a los grupos que tienen más criterios, y la cantidad de criterios de un grupo no dice cuánto importa esa función. Dice cuánto hubo que dividirla para que cada comprobación tuviera una sola respuesta.

> *Condiciones técnicas y operativas del producto* tiene catorce criterios y *Control de acceso y trazabilidad* tiene tres. Sumando todo junto, el primero pesaría casi cinco veces más que el segundo, sin que nadie lo hubiera decidido. Promediando por grupo, los dos valen lo mismo: un doceavo de la Parte A.

En la práctica, el catálogo se puede afinar sin mover ningún resultado. Dividir un criterio en dos mejora la precisión sin inflar la importancia de su grupo.

### Por qué todos los grupos pesan igual

El pedido del cliente no jerarquiza. Enumera sus necesidades sin decir cuál le importa más, y nada en él permite deducir que la gestión de la cartera valga más que el seguimiento de los productores, o que la atención de reclamos.

Ponerle un peso mayor a un grupo sería suponer lo que el cliente necesita en lugar de evaluarlo. Esa jerarquía la fija la compañía según su propia operación, y este informe no tiene ese dato: tiene una lista de necesidades que el cliente enunció como igualmente suyas. La única ponderación que sí tiene fundamento es que lo pedido por el cliente pese más que lo que no pidió. Ese es el 85/15, el único número de la ponderación que no sale de un promedio.

> Si la compañía quisiera darle más peso a una función, porque conoce su operación y sabe que ahí se le va el día, el cálculo lo admite sin rehacer nada: alcanza con cambiar el peso de ese grupo en el paso 2. El informe entrega el reparto parejo porque es lo que la información disponible justifica.

## 3.7 Cálculo del resultado

El **cumplimiento total** se calcula a partir de la primera escala, un nivel por vez:

```
% del grupo      =  Σ (cumplimiento)  /  (2 × criterios verificados del grupo)  × 100

% de la parte    =  promedio de los % de sus grupos

cumplimiento total   =  0,85 × % Parte A  +  0,15 × % Parte B
```

El informe publica los dos porcentajes junto al total, para poder leer por separado cómo le fue a cada plataforma en lo solicitado y en lo que no lo era.

El **esfuerzo de implementación** sale de la segunda escala. Se calcula solo sobre los criterios que la plataforma cumple, porque lo que no resuelve no se implementa:

```
esfuerzo de implementación  =  Σ (costo) / (2 × criterios cumplidos) × 100
```

En este caso conviene lo bajo: un 0 significa que todo viene listo, y un 100 que cada capacidad exige programar o repetir trabajo en cada uso. Se publica junto al cumplimiento total, sin sumarse a él, porque dos plataformas pueden resolver lo mismo con muy distinto trabajo de puesta en marcha.

## 3.8 Cómo se produjo la evidencia

Todos los criterios se resolvieron con un procedimiento automatizado, ejecutado con una herramienta de automatización de navegador. Eso tiene tres consecuencias sobre la calidad del análisis.

El mismo procedimiento se ejecuta sobre las tres plataformas. Cargar un asegurado en una y en otra no es una comparación entre dos personas operando a distinta velocidad, sino el mismo recorrido evaluado con la misma pregunta.

El valor se registra durante la ejecución, junto al código que lo comprueba. La matriz de la sección 5 se genera a partir de esos registros, y ningún valor del informe se transcribe a mano.

Cada ejecución produce además video y capturas que respaldan el valor asignado y permiten reconstruir cómo se llegó a él.

### Los cuatro instrumentos

No todos los criterios se responden operando el sistema, pero todos se responden con un procedimiento que se ejecuta solo y deja su constancia:

| Instrumento | Ejemplos | Cómo se resuelve |
|---|---|---|
| **Operación del sistema** | Alta de pólizas, filtros, importación, permisos | La prueba recorre la pantalla como un usuario y comprueba el resultado sobre los datos guardados |
| **Verificación documental** | Continuidad de las versiones, plazo de respuesta comprometido, precios | La prueba abre la página oficial, comprueba que el texto esté publicado y lo registra textual, con su captura y la fecha de consulta |
| **Agentes sin conocimiento previo** | Aprendizaje sin capacitación previa | Tres agentes de software independientes reciben solo la consigna escrita y operan el sistema mirando la pantalla; la prueba comprueba sobre los datos guardados qué tareas quedaron completas |
| **Medición sobre lo publicado** | Comunidad activa de usuarios | La prueba lee las consultas del foro oficial que ya cumplieron la espera aceptable y clasifica cada una según la respuesta que recibió |

En todos los casos el valor se registra con el mismo procedimiento y entra en la misma matriz. Cambia el instrumento, no la escala ni la exigencia de justificación.

Los agentes de la prueba de aprendizaje no conocen la plataforma ni el resto del análisis, y cada uno trabaja con su propio usuario. Solo pueden usar lo que la pantalla ofrece, sin direcciones internas, interfaz de programación ni documentación. Si una tarea quedó completa lo comprueba la prueba sobre los datos guardados, y el agente no lo declara.

En el foro, una consulta cuenta como **resuelta** cuando otro usuario la respondió y quien la hizo confirmó después, en el mismo hilo, que la respuesta le sirvió. Lo que no se confirma no se da por resuelto.

### Cuándo vale la documentación del fabricante como prueba

Un compromiso de servicio, un plazo de soporte o una política de versiones no son observables en la instalación: existen como compromiso del fabricante o no existen. Para esos criterios la documentación oficial es la prueba adecuada, y se cita con su dirección y su fecha de consulta.

Fuera de esa clase, la documentación no sustituye a la comprobación. Que un fabricante afirme que su producto hace algo no es evidencia de que lo haga, y cuando la capacidad es observable, se observa. La documentación del fabricante alcanza por sí sola solo para sostener el valor **0**, según la regla de la subsección 3.5, porque probar que algo no existe exige una fuente que lo declare.

## 3.9 Limitaciones de la evidencia

El escenario es una instalación de prueba, distinta de una compañía en operación. La cartera cargada, de veinticinco mil registros, es unas quince veces la de la compañía, de modo que las conclusiones sobre rendimiento valen para ese tamaño y su crecimiento, no para una aseguradora grande.

La prueba de aprendizaje no la hicieron personas. Un agente de software conoce de antemano cómo suelen organizarse los sistemas de gestión, igual que un usuario habituado a la computadora, pero no reproduce las dudas de alguien que nunca usó uno. Antes de la puesta en marcha conviene repetirla con los usuarios de la compañía.

La comunidad se mide por lo que queda escrito. Una consulta resuelta por mensaje privado, o cuyo autor no volvió a agradecer, figura como no confirmada, así que la medición puede quedar por debajo de la ayuda que la comunidad presta de verdad, nunca por encima.

Dos evaluaciones quedaron sin valor porque dependen de cuentas de terceros que aporta la compañía. El asistente de inteligencia artificial de Twenty (B.2.1) solo responde con las credenciales de un proveedor de modelos, y la conexión de Bitrix24 con las redes sociales (A.4.4) exige la cuenta que administra la página de la compañía. Aun con el mejor valor posible en las dos, el orden de las plataformas no cambia.

Las instalaciones corrieron en una máquina compartida. Los tiempos absolutos están afectados por su carga y deben leerse como comparación relativa entre las tres.

El conjunto de criterios tampoco es neutral. Los criterios de la Parte A traducen el pedido del cliente, el marco técnico de evaluación y las etapas de la relación con el cliente; el resto se buscó a propósito, y ese grupo se filtró dejando solo lo que discrimina entre las tres. Ese filtro inclina el recuento hacia las diferencias y no hacia las coincidencias.

Por último, una de las tres plataformas no admite inspección interna. De las dos instalaciones propias se pudo revisar el código, la base de datos y los archivos de configuración; de la plataforma en la nube, solo lo que exponen su interfaz y su documentación. Esa asimetría hace que en ella más criterios se resuelvan con la documentación del fabricante y menos con la inspección directa.
