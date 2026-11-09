# 3. Metodología de evaluación y trazabilidad

## 3.1 La escala

Todos los criterios se puntúan con los mismos tres valores:

| Valor | | Significa |
|:---:|---|---|
| **2** | **Cumple** | La necesidad queda resuelta |
| **1** | **Cumple con reparo** | Queda resuelta, pero con un costo o una salvedad permanente |
| **0** | **No cumple** | No queda resuelta |

No cumplir vale cero para que el resultado recorra el rango completo: **0 % es no resolver nada y 100 %, resolverlo todo.**

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

Entre 2 y 1, la frontera es si el trabajo extra se hace una vez o en cada uso; entre 1 y 0, si existe alguna vía, aunque sea incómoda.

Esta pregunta se aplica a los grupos A.1 a A.10, A.12 y B.2, que son capacidades que alguien ejecuta.

### Criterios no funcionales — cómo se comporta el sistema

> **¿El sistema satisface la condición que el negocio requiere?**

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

Estos criterios corresponden a los grupos A.11 y B.1. Se dividen en dos tipos: los **técnicos** responden qué exige el sistema para funcionar y sostenerse (infraestructura, compatibilidad, puesta en marcha, resguardo de los datos) y los **operativos**, cómo se comporta en el trabajo diario (navegación, aprendizaje, idioma, usuarios simultáneos, soporte).

Como el 1 significa lo mismo en los dos casos, ambos tipos se suman en un mismo puntaje.

### Los tipos de requerimiento

La pregunta que corresponde está fijada por grupo, y no se decide criterio por criterio. Quedan así los tres tipos de requerimiento (**funcionales, técnicos y operativos**) y, dentro de cada uno, los **originales**, que pidió el cliente (Parte A), y los **opcionales**, que se agregaron (Parte B). La matriz de la sección 5 se ordena de esa forma y cierra cada grupo y cada tipo con su subtotal.

## 3.2 Por qué tres valores y no cinco

Una escala de cinco valores obliga a distinguir entre «cumple bastante» y «cumple casi del todo», y esa distinción depende de quién puntúa. Con tres valores la pregunta es cerrada y la respuesta es la misma para cualquiera que mire el sistema. La precisión se obtiene dividiendo cada requerimiento en criterios finos: la cartera de pólizas se divide en representar la póliza, registrar su prima, su vigencia y su estado, y cada parte recibe su valor.

## 3.3 Lo que la escala no mide, y la segunda escala

Que una capacidad venga de fábrica o haya que configurarla una vez no cambia el cumplimiento: esa diferencia la mide una segunda escala, que alimenta el esfuerzo de implementación.

### La segunda escala

> **¿Cuánto trabajo cuesta dejarlo funcionando?**

| Valor | | Significa |
|:---:|---|---|
| **0** | **Sin trabajo** | Viene listo: no hay nada que implementar |
| **1** | **Configuración** | Se configura una vez con las opciones del sistema, sin programar |
| **2** | **Desarrollo o trabajo permanente** | Requiere programar, o hay trabajo en cada uso |

Esta escala corre al revés que la primera porque mide costo y no mérito: acá el 0 es lo bueno. En la sección 6 el costo se nombra con esas palabras: «viene listo», «se configura una vez», «requiere programar» o «trabajo en cada uso».

Con cumplimiento **0** el costo no se puntúa; con **1** es siempre **2**, porque repetir trabajo en cada uso es la forma más cara de resolver una necesidad. Los criterios no funcionales no llevan costo: son cualidades del producto, que no hace falta poner en marcha.

### Lo que agrega un plan pago se informa como comentario

Se puntúa solo lo que trae la versión elegida. Cuando un plan del fabricante resolvería un criterio, se registra como comentario: en qué plan queda resuelto, a qué precio y cómo cambiaría el valor. Se recorren los planes hasta el primero que lo resuelve, porque no es lo mismo conseguirlo con el plan de entrada que con el más caro. Un plan que solo agrega más usuarios o más almacenamiento no genera comentario; el alojamiento gestionado sí, porque cambia lo que la compañía tiene que sostener (A.11.1 a A.11.3).

La matriz marca esos criterios con **↑**, y la sección 5.5 reúne los planes que los cambian, con su precio y el resultado que alcanzaría cada plataforma contratándolos.

## 3.4 Todos los criterios se puntúan en las tres plataformas

Todo criterio se formula desde la necesidad y no desde la solución, de modo que admite respuesta en las tres plataformas y ninguno favorece a una modalidad por cómo está redactado: por ejemplo, se pregunta qué recursos tiene que disponer la compañía para sostener el sistema, en lugar de cuánta memoria consume el servidor.

### El único estado sin valor: no se pudo verificar

Un criterio queda sin valor solo si todavía no se pudo comprobar, y ese estado describe el avance del trabajo, no a la plataforma. Se excluye del cálculo por los dos lados, del puntaje obtenido y del máximo posible, porque asignarle un valor convertiría una ausencia de dato en un dato. La matriz informa cuántas evaluaciones quedaron en ese estado.

## 3.5 Evidencia exigida

La evaluación funciona como una auditoría sobre la versión elegida: lo que se afirma de una plataforma se demuestra, con lo observado al operarla o con la documentación oficial que la describe.

| Valor | Qué se exige |
|:---:|---|
| **2** | Registro del sistema resolviéndolo: captura, respuesta de la interfaz de programación o video |
| **1** | El mismo registro, más la descripción del trabajo que agrega en cada uso |
| **0** | Registro de lo que ocurre al intentarlo en la versión evaluada (la función ausente, el aviso de que exige otro plan) o la constancia del fabricante de que esa versión no la incluye |

Que una prueba falle no alcanza para concluir que la plataforma falla: cada resultado negativo se revisa antes de convertirse en veredicto, y se descarta primero que el fallo provenga del procedimiento, del instrumento de prueba o de una decisión de configuración propia.

Las restricciones de un plan se determinan completando la operación, no por un aviso en pantalla.

## 3.6 Ponderación

Las notas de los criterios se convierten en un número por plataforma en tres pasos, y en cada uno se promedia.

### Paso 1 — Cada grupo saca su nota

El grupo es una función del negocio: la cartera de pólizas, la atención de reclamos, el intercambio de datos. Su nota es el porcentaje del máximo que alcanzaron sus criterios.

Dentro del grupo todos los criterios valen lo mismo.

### Paso 2 — La parte promedia sus grupos

La Parte A tiene doce grupos y la Parte B, dos. **La nota de la parte es el promedio simple de las notas de sus grupos.**

Un grupo sin ningún criterio verificado no entra en el promedio, de modo que el resultado nunca depende de lo que todavía no se midió.

### Paso 3 — Las dos partes se combinan

| Parte | Peso |
|---|:---:|
| **A — Solicitados** | **85 %** |
| **B — No solicitados** | **15 %** |

Con esa proporción, una plataforma que cubriera toda la Parte B y la mitad de la Parte A queda por debajo de otra que cubra la Parte A completa sin ninguna capacidad adicional.

Se promedia por grupo, y todos los grupos pesan igual, porque la cantidad de criterios de un grupo dice cuánto hubo que dividirlo para que cada comprobación tuviera una sola respuesta, no cuánto importa, y porque el pedido del cliente no dice cuál de sus necesidades le importa más. La única ponderación con fundamento es que lo pedido pese más que lo que no se pidió: el 85/15. Si la compañía quisiera darle más peso a una función, alcanza con cambiar el peso de ese grupo en el paso 2.

## 3.7 Cálculo del resultado

El **cumplimiento total** se calcula a partir de la primera escala, un nivel por vez:

```
% del grupo      =  Σ (cumplimiento)  /  (2 × criterios verificados del grupo)  × 100

% de la parte    =  promedio de los % de sus grupos

cumplimiento total   =  0,85 × % Parte A  +  0,15 × % Parte B
```

El **esfuerzo de implementación** sale de la segunda escala. Se calcula solo sobre los criterios que la plataforma cumple, porque lo que no resuelve no se implementa:

```
esfuerzo de implementación  =  Σ (costo) / (2 × criterios cumplidos) × 100
```

Conviene lo bajo: 0 % es que todo viene listo y 100 %, que cada capacidad exige programar o repetir trabajo en cada uso. Se publica junto al cumplimiento total, sin sumarse a él.

## 3.8 Cómo se produjo la evidencia

Cada criterio se resolvió con un procedimiento automatizado que opera las tres plataformas por su pantalla, como un usuario, y deja video y capturas; el valor de la matriz es el que registró esa ejecución.

### Los cuatro instrumentos

| Instrumento | Ejemplos | Cómo se resuelve |
|---|---|---|
| **Operación del sistema** | Alta de pólizas, filtros, importación, permisos | La prueba recorre la pantalla como un usuario y comprueba el resultado sobre los datos guardados |
| **Verificación documental** | Continuidad de las versiones, plazo de respuesta comprometido, precios | La prueba abre la página oficial, comprueba que el texto esté publicado y lo registra textual, con su captura y la fecha de consulta |
| **Agentes sin conocimiento previo** | Aprendizaje sin capacitación previa | Tres agentes de software independientes reciben solo las instrucciones escritas y operan el sistema mirando la pantalla; la prueba comprueba sobre los datos guardados qué tareas quedaron completas |
| **Medición sobre lo publicado** | Comunidad activa de usuarios | La prueba lee las consultas del canal público de la comunidad (el foro oficial o, en Twenty, las discusiones de su repositorio) que ya cumplieron la espera aceptable y clasifica cada una según la respuesta que recibió |

Los agentes de la prueba de aprendizaje trabajan cada uno con su propio usuario y solo con lo que la pantalla ofrece, sin direcciones internas, interfaz de programación ni documentación.

### Cuándo vale la documentación del fabricante como prueba

Hay criterios que no se observan operando la instalación: un compromiso de servicio, una política de versiones o de conservación de los datos, el lugar donde residen, un límite publicado, la documentación y el material que el fabricante pone a disposición. Como esos criterios solo constan en lo que publica el fabricante, su documentación oficial es la prueba adecuada, y se cita textual con su dirección y su fecha de consulta.

Fuera de esa clase, la documentación no sustituye a la comprobación: que un fabricante afirme que su producto hace algo no es evidencia de que lo haga, y cuando la capacidad es observable, se observa. En esos criterios la documentación sola alcanza en dos casos. El primero es el valor **0**: que algo no existe solo se prueba con una fuente que lo declare. El segundo es una capacidad cuya prueba no puede completarse por una condición ajena a la plataforma, como las credenciales de un servicio que contrata la compañía; ese caso se declara en la sección 3.9.

## 3.9 Limitaciones de la evidencia

El escenario es una instalación de prueba, distinta de una compañía en operación. La cartera cargada, de veinticinco mil registros, es unas quince veces la de la compañía, de modo que las conclusiones sobre rendimiento valen para ese tamaño y su crecimiento, no para una aseguradora grande.

La prueba de aprendizaje no la hicieron personas. Un agente de software conoce de antemano cómo suelen organizarse los sistemas de gestión, igual que un usuario habituado a la computadora, pero no reproduce las dudas de alguien que nunca usó uno. Antes de la puesta en marcha conviene repetirla con los usuarios de la compañía.

En la comunidad, una consulta cuenta como resuelta solo si su autor confirma en el hilo que la respuesta le sirvió; lo resuelto en privado o sin confirmación queda afuera, así que la medición puede quedar por debajo de la ayuda real, nunca por encima.

Una capacidad se valoró por su documentación oficial sin poder observarla completa. El asistente de inteligencia artificial de Twenty (B.2.1) responde solo con un proveedor de modelos que contrata la compañía; se comprobó que existe y dónde se habilita, pero con el modelo de prueba consultó los registros sin devolver el resumen, y su valor sale de lo que el fabricante documenta. Aun con el menor valor posible, el orden de las plataformas no cambia.

Las instalaciones corrieron en una máquina compartida. Los tiempos absolutos están afectados por su carga y deben leerse como comparación relativa entre las tres.

Los criterios agregados (Parte B) se buscaron privilegiando lo que distingue a las plataformas, lo que inclina el recuento hacia las diferencias y no hacia las coincidencias.

Por último, una de las tres plataformas no admite inspección interna. De las dos instalaciones propias se pudo revisar el código, la base de datos y los archivos de configuración; de la plataforma en la nube, solo lo que exponen su interfaz y su documentación. Esa asimetría hace que en ella más criterios se resuelvan con la documentación del fabricante y menos con la inspección directa.
