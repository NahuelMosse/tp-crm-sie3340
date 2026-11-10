# 2. Metodología de evaluación y trazabilidad

## 2.1 La escala

Todos los criterios se puntúan con los mismos tres valores:

| Valor | | Significa |
|:---:|---|---|
| **2** | **Cumple** | La necesidad queda resuelta |
| **1** | **Cumple con reparo** | Queda resuelta, pero con un costo o una salvedad permanente |
| **0** | **No cumple** | No queda resuelta |

Con tres valores la respuesta es cerrada: cualquiera que mire el sistema llega al mismo valor. La precisión se logra dividiendo cada requerimiento en criterios que tienen una sola respuesta posible, formulados desde la necesidad para no favorecer a ninguna plataforma. Ningún criterio repite el procedimiento de otro, salvo la póliza como entidad propia (A.1.1), que se evalúa aparte de la creación de entidades (A.8.1) por ser el objeto central del negocio. Cuando un procedimiento abarca dos objetos y el sistema resuelve solo uno, el criterio vale 1.

Qué situación corresponde a cada valor depende de lo que el criterio mide: algo que el sistema hace o una condición que tiene que cumplir.

### Criterios funcionales — qué hace el sistema

| Situación | Valor |
|---|:---:|
| El sistema lo hace | **2** |
| Hay que configurarlo una vez desde las pantallas, sin escribir código, y después funciona | **2** |
| Hay que escribir código, aunque sea una sola vez | **1** |
| Hay que exportar a una planilla y trabajar afuera | **1** |
| Hay que repetir un procedimiento manual en cada uso | **1** |
| Resuelve solo una parte de lo que se necesita | **1** |
| La versión evaluada no lo trae, aunque un plan pago o un módulo lo agregue (el plan se consigna como comentario) | **0** |

Entre 2 y 1, la frontera es si lo resuelve el sistema o lo resuelve alguien: configurarlo una vez es 2; escribir código, repetir una tarea en cada uso o cubrir solo una parte es 1. Entre 1 y 0, si existe alguna vía, aunque sea incómoda. Esta tabla se aplica a los grupos A.1 a A.11 y B.1.

### Criterios no funcionales — cómo se comporta el sistema

| Situación | Valor |
|---|:---:|
| La satisface | **2** |
| La satisface con una limitación que la compañía debe asumir | **1** |
| No la satisface | **0** |

| Ejemplo de criterio | 2 | 1 | 0 |
|---|---|---|---|
| Documentación en español | Oficial y completa | Solo en otro idioma, consultable con traducción automática, o mantenida por la comunidad | No hay |
| Persistencia sin uso continuo | Los datos permanecen sin condiciones | Permanecen, pero conservarlos exige un trabajo de la compañía | El fabricante puede eliminarlos si no se cumple una condición de uso |
| Concurrencia sobre un registro | Resuelve el conflicto entre usuarios | Lo permite pero deja constancia | Se pierden datos sin aviso |

Estos criterios, los de los grupos A.12 y B.2, describen condiciones que el sistema tiene que cumplir. Se separan en dos tipos:

- **Técnicos:** lo que hace falta para instalarlo y mantenerlo funcionando, como la infraestructura, la compatibilidad, la puesta en marcha y las copias de los datos.
- **Operativos:** cómo es usarlo todos los días, como lo fácil que resulta recorrerlo y aprenderlo, el idioma, cuántos usuarios pueden trabajar a la vez y el soporte del fabricante.

En las dos tablas el 1 significa lo mismo, que se resuelve pero con un costo o una limitación, así que todos los criterios suman en el mismo puntaje.

### Originales y deseables

Además de su tipo, cada requerimiento es **original**, si fue solicitado (Parte A), o **deseable**, si no se solicitó pero suma valor (Parte B). La matriz de veredictos presenta primero los originales y después los deseables, cada parte separada en funcionales y no funcionales, y cierra cada grupo y cada parte con su subtotal.

## 2.2 Costo de implementación y planes pagos

El detalle de cada criterio funcional dice cuánto trabajo exige dejar resuelta la capacidad:

- **Viene lista:** funciona apenas se instala el sistema. Cumple.
- **Se configura una vez:** hay que ajustarla una sola vez desde las pantallas del sistema, sin escribir código. También cumple.
- **Exige código:** hay que escribir código, aunque sea una sola vez. Cumple con reparo, y el detalle dice qué hay que programar.
- **Exige una tarea manual:** alguien tiene que hacer a mano una tarea cada vez que se usa. Cumple con reparo, y el detalle dice qué tarea se repite.
- **Resuelve una parte:** el sistema cubre solo una parte de lo que se necesita. Cumple con reparo, y el detalle dice qué falta.

Las dos primeras valen lo mismo, y las tres últimas también. La aclaración no cambia el valor: sirve para saber qué trabajo hay que hacer, antes de empezar a usarla o cada vez que se usa.

Los criterios no funcionales no llevan esta aclaración, porque describen cómo se comporta el sistema y no algo que haya que dejar funcionando. Tampoco la llevan los que no cumplen, porque no hay nada que dejar resuelto.

Se puntúa solo lo que trae la versión elegida. Si un plan pago mejoraría un criterio, se anota como comentario el plan más barato que lo logra, con su precio; ese comentario no suma puntos. La matriz marca esos criterios con **↑**, y una tabla aparte muestra cuánto alcanzaría cada plataforma contratándolos.

## 2.3 Ponderación y cálculo del resultado

El resultado de cada plataforma se calcula en tres pasos:

1. Cada grupo obtiene el porcentaje de los puntos posibles que sumaron sus criterios. Todos los criterios de un grupo valen lo mismo.
2. Cada parte promedia los porcentajes de sus grupos. Todos los grupos valen lo mismo, aunque tengan distinta cantidad de criterios.
3. El resultado combina las dos partes: lo solicitado (Parte A) pesa el 90 % y lo deseable (Parte B), el 10 %.

Los grupos pesan igual porque lo solicitado no dice qué necesidad importa más, y la cantidad de criterios de un grupo solo refleja en cuántas comprobaciones hubo que dividirlo. Lo solicitado pesa más para que una capacidad extra no compense una necesidad sin resolver, y con ese reparto cada grupo solicitado pesa más que cada grupo deseable.

En fórmulas:

```
% del grupo      =  suma de los valores de sus criterios  /  (2 × cantidad de criterios del grupo)  × 100

% de la parte    =  promedio de los % de sus grupos

cumplimiento total   =  0,90 × % Parte A  +  0,10 × % Parte B
```

## 2.4 Cómo se produjo la evidencia

Cada valor se apoya en lo que se observó al usar la versión evaluada, que quedó registrado, o en la documentación oficial del fabricante, citada textual. Si una función parecía no estar, se volvió a buscar antes de darla por ausente, para descartar un error al usarla.

Cinco criterios necesitan, además de su procedimiento, una cifra de referencia para valorar lo observado, como cuántos registros son muchos o cuánta espera es tarde. Como no hay datos reales de la compañía, esas cifras salen de una compañía promedio, de alrededor de quinientos clientes. Se fijaron antes de medir y figuran junto al detalle de su criterio.

### Los cuatro instrumentos

| Instrumento | Ejemplos | Cómo se resuelve |
|---|---|---|
| **Operación del sistema** | Alta de pólizas, filtros, importación, permisos | Se usa el sistema desde la pantalla, como un usuario, y se comprueba el resultado en los datos guardados |
| **Verificación documental** | Continuidad de las versiones, plazo de respuesta comprometido, precios | Se consulta la página oficial del fabricante y se cita textual, con la fecha de consulta |
| **Usuarios sin conocimiento previo** | Aprendizaje sin capacitación previa | Tres agentes independientes, que nunca usaron el sistema, reciben solo instrucciones escritas; se comprueba en los datos guardados qué tareas completaron |
| **Medición sobre lo publicado** | Comunidad activa de usuarios | Se leen las consultas publicadas en el canal público de la comunidad y se clasifica cada una según la respuesta que recibió |

### Cuándo vale la documentación del fabricante

Lo que se puede observar usando el sistema, se observa: que el fabricante diga que algo funciona no alcanza. La documentación oficial, citada textual, se usa en tres casos: para lo que solo existe en lo que el fabricante publica, como un compromiso de servicio o una política de versiones; para confirmar que algo no existe; y cuando una prueba no se puede completar por una causa ajena a la plataforma, como el asistente de Twenty de la sección siguiente.

## 2.5 Qué tener en cuenta al leer los resultados

- **Datos de prueba.** Los sistemas se probaron con una cartera de prueba, no con una compañía en funcionamiento. Esa cartera es unas quince veces más grande que la de una compañía promedio, así que lo observado sobre la velocidad vale para ese tamaño.
- **Aprendizaje.** La prueba de aprendizaje la hicieron agentes de software, no personas. Saben cómo suelen organizarse estos sistemas, pero no tienen las dudas de quien nunca usó uno.
- **Asistente de Twenty.** El asistente de inteligencia artificial de Twenty (B.1.1) funciona con un servicio que contrata la compañía y no se pudo probar completo, así que se valoró por su documentación. Si en lugar de ● se le hubiera dado ○, Twenty quedaría apenas por debajo de EspoCRM en el puntaje total.
