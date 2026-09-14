# 3. Metodología de evaluación y trazabilidad

Esta sección define **cómo se puntúa**. Se presenta antes del catálogo de criterios porque cada uno de ellos remite a estas escalas: sin conocerlas, los criterios de la sección 4 no se pueden interpretar.

Todos los criterios se puntúan de **1 a 5**. Lo que cambia entre un criterio y otro es qué mide esa escala, y por eso se definen cuatro variantes. **Cada criterio declara cuál usa.**

| Escala | Cuándo se aplica | Qué mide |
|---|---|---|
| **E — Esfuerzo** | Capacidades del sistema | Cuánto trabajo exige obtener la capacidad |
| **M — Magnitud** | Mediciones numéricas | El valor medido contra umbrales fijados de antemano |
| **C — Comportamiento** | Reacción ante una situación | Qué hace el sistema cuando ocurre algo |
| **D — Declaración** | Hechos documentales | Si el hecho existe y con qué respaldo |

---

## 3.1 Escala E — Esfuerzo

Se aplica a la mayoría de los criterios: aquellos donde la pregunta es si el sistema puede hacer algo y cuánto cuesta lograrlo.

| Valor | Nivel | Definición precisa |
|:---:|---|---|
| **5** | Nativo | La capacidad está disponible al terminar la instalación. El usuario la encuentra y la usa sin modificar la configuración del sistema |
| **4** | Configurable | Se obtiene mediante opciones que el propio sistema ofrece: crear campos, activar módulos incluidos, definir reglas o instalar una extensión oficial que funciona sin adaptarla. **No se escribe código** |
| **3** | Desarrollo | Se obtiene únicamente escribiendo código: llamadas a la interfaz de programación, guiones propios, o adaptación de una extensión |
| **2** | Externo | El sistema no la provee por ninguna vía interna. Se resuelve extrayendo los datos y operándolos en otra herramienta, o mediante un procedimiento manual repetido |
| **1** | Inexistente | No existe forma de obtenerla en ninguna edición del producto, ni siquiera saliendo del sistema con los datos que este entrega |

### Qué cuenta y qué no cuenta para cada nivel

Estas precisiones resuelven los casos donde dos personas podrían discrepar.

| Situación | Nivel | Razón |
|---|:---:|---|
| La capacidad existe pero hay que cargar datos antes de usarla | **5** | Cargar datos es usar el sistema, no configurarlo |
| Hay que activar un módulo que viene incluido | **4** | Activar es configurar, aunque el módulo ya esté presente |
| Hay que instalar una extensión oficial que funciona sin tocarla | **4** | No se escribió código |
| Hay que instalar una extensión y adaptarla | **3** | Se escribió código |
| Existe pero solo mediante la interfaz de programación | **3** | Requiere desarrollo, aunque no haya que instalar nada |
| Se resuelve exportando y trabajando en una planilla | **2** | La capacidad no está en el sistema |
| Se resuelve con un procedimiento manual repetido en cada uso | **2** | Equivale a no tenerla, con costo operativo |
| Existe únicamente en un plan pago | **el que corresponda** | La licencia no altera el nivel; se marca aparte |
| Existe en el producto pero no en la región o el idioma evaluados | **1** | Si no está disponible para este caso, no está |

### Reglas de resolución

**Ante duda entre dos niveles, se asigna el menor.** La escala no infla.

**El nivel lo fija la vía más simple disponible, no la que usó el evaluador.** Si algo se puede resolver configurando y también programando, el valor es 4 aunque se haya probado por código.

**Si un criterio admite dos niveles según el aspecto que se mire, está mal descompuesto.** Corresponde dividirlo hasta que cada parte tenga una sola respuesta. Esta regla es la que lleva los veinte requerimientos del pedido a los cuarenta y dos criterios de la Parte A.

**Un límite cuantitativo no baja el nivel.** Si la capacidad opera pero con un tope de registros, envíos o llamadas, el nivel refleja la vía de obtención y el tope se consigna aparte.

### El árbol de decisión

El valor no se elige: se deriva de cinco preguntas en orden fijo. La primera que se responde afirmativamente lo determina.

| # | Pregunta | Resultado |
|---|---|---|
| 1 | ¿Existe en alguna edición del producto, incluidas las pagas? | Si **no** → **1** |
| 2 | ¿Está disponible al terminar la instalación, sin modificar configuración? | **5** |
| 3 | ¿Se obtiene con opciones del sistema, sin escribir código? | **4** |
| 4 | ¿Se obtiene escribiendo código? | **3** |
| 5 | ¿La única vía es operar fuera del sistema? | **2** |

---

## 3.2 Escala M — Magnitud

Se aplica a criterios que producen un número: consumo de memoria, cantidad de pasos, tiempo de instalación, elementos sin traducir.

La escala por esfuerzo no sirve acá: no hay una vía de obtención que evaluar, hay una cantidad. **Los umbrales se fijan antes de medir**, a partir de lo que el negocio necesita, y no se ajustan después según los resultados obtenidos.

| Valor | Definición |
|:---:|---|
| **5** | Supera con holgura lo que la operación requiere |
| **4** | Cumple lo requerido |
| **3** | Cumple con reservas: funciona, pero condiciona la operación |
| **2** | Queda por debajo de lo requerido y exige compensarlo |
| **1** | Impide la operación tal como se necesita |

Cada criterio de esta escala **publica sus umbrales en la sección 4**, con la unidad y los cortes. Por ejemplo, para el consumo de memoria se declara qué cantidad corresponde a cada valor antes de medir ninguna plataforma.

**Por qué umbrales absolutos y no comparación entre las tres.** Si el valor dependiera de cuál consume menos, el puntaje de una plataforma cambiaría al agregar o quitar otra del análisis, y una diferencia irrelevante entre dos valores igualmente aceptables se convertiría en ventaja. Los umbrales se fijan contra la necesidad, no contra los competidores.

---

## 3.3 Escala C — Comportamiento

Se aplica a criterios donde la pregunta no es si el sistema puede hacer algo, sino **qué hace cuando ocurre una situación**: dos usuarios editando el mismo registro, un asegurado cargado dos veces, una importación con datos inválidos.

| Valor | Definición |
|:---:|---|
| **5** | Previene el problema: lo detecta antes de que ocurra y ofrece resolverlo |
| **4** | Advierte al usuario en el momento y le deja decidir |
| **3** | Lo permite, pero deja registro de lo ocurrido para poder revertirlo |
| **2** | Lo permite sin dejar registro: el problema queda, y detectarlo es trabajo del usuario |
| **1** | Produce pérdida de datos o un estado inconsistente |

> **Ejemplo.** Ante la carga de un asegurado ya existente: **5** si lo detecta y ofrece unificar; **4** si advierte "parece un duplicado" y permite continuar; **3** si lo crea pero queda registrado quién y cuándo; **2** si lo crea sin más; **1** si la duplicación corrompe la ficha original.

---

## 3.4 Escala D — Declaración

Se aplica a hechos que no se ejecutan sino que se constatan: existencia de documentación en un idioma, plazo de respuesta comprometido, condiciones del servicio, presencia en tiendas de aplicaciones.

| Valor | Definición |
|:---:|---|
| **5** | El hecho existe y se comprobó directamente |
| **4** | El hecho existe según la documentación oficial del fabricante |
| **3** | Existe de manera parcial o con condiciones que lo limitan |
| **2** | No existe, pero hay una alternativa de terceros que lo suple |
| **1** | No existe y no hay alternativa |

La diferencia entre 5 y 4 es deliberada: **lo comprobado vale más que lo declarado por quien vende el producto.** Durante las pruebas aparecieron diferencias entre ambas fuentes.

---

## 3.5 Criterios que no admiten ninguna escala

Tres situaciones quedan fuera del sistema de puntuación. En todas, el criterio **se documenta pero no puntúa**, y se excluye del cálculo tanto del puntaje obtenido como del máximo posible.

### No aplica por la naturaleza de la plataforma

Un criterio puede carecer de sentido para una de las tres. El consumo de infraestructura no se evalúa en un servicio en la nube: no hay servidor que dimensionar. No es una ventaja ni una desventaja, es que la pregunta no corresponde.

Se registra como **no aplica**, con la razón. El criterio sigue puntuando para las plataformas donde sí corresponde, y el máximo posible se calcula solo sobre ellas.

> Esto importa para no distorsionar el resultado. Si "no aplica" se contara como cumplimiento, la plataforma en la nube ganaría puntos por no tener servidor; si se contara como incumplimiento, los perdería por lo mismo. Ninguna de las dos refleja la realidad.

### No verificado

La comprobación no se pudo completar: la operación falló por razones del instrumento, la plataforma no admite inspección de ese aspecto, o el procedimiento requiere condiciones que no se dieron.

Se registra como **sin verificar**, con el motivo. **No se completa por deducción ni se le asigna un valor intermedio.** El informe declara cuántos criterios quedaron en este estado, porque un porcentaje calculado sobre veinte criterios verificados no es comparable con uno calculado sobre cincuenta.

### Depende de una decisión de la organización

Algunos criterios no tienen respuesta en el producto sino en cómo se lo implemente. Dónde residen los datos en una instalación propia depende de dónde se la instale, no del sistema.

Se registra como **condicionado**, con la explicación de qué decide el resultado. Estos criterios aportan a las conclusiones —son insumo para la recomendación— pero no suman puntaje, porque puntuar una decisión que la compañía todavía no tomó sería atribuirle al producto algo que no le corresponde.

---

## 3.6 Cuando una capacidad exige licencia

El puntaje técnico **no se modifica**. Una capacidad nativa de un módulo pago vale 5, igual que si viniera incluida: el producto la tiene y la resuelve sin esfuerzo de implementación.

Se registra un **indicador de licencia** junto al valor, que alimenta la oferta económica de la sección 8.

> **Ejemplo.** La generación de informes es nativa en una plataforma dentro de un módulo adicional de pago único, y nativa en otra dentro de su plan mensual. Ambas puntúan **5**. La diferencia entre un pago por única vez y un abono recurrente no aparece en el puntaje técnico: aparece en la proyección de costo a tres y cinco años, que es donde se vuelve material.

El criterio evita penalizar dos veces el mismo hecho. Una plataforma que resuelve mediante un módulo pago no es funcionalmente inferior a otra que lo trae incluido; es más cara, y eso se mide donde corresponde.

---

## 3.7 Evidencia exigida por valor

Ningún valor se asigna sin el respaldo que le corresponde.

| Valor | Qué se exige |
|:---:|---|
| **5** | Registro de la capacidad operando, obtenido sin configuración previa |
| **4** | Registro de la configuración realizada y del resultado funcionando |
| **3** | Constancia del método de programación empleado, o su ejecución |
| **2** | Descripción del procedimiento externo y la cantidad de pasos que agrega |
| **1** | **Constancia en la documentación oficial del fabricante** de que la capacidad no existe |

El valor 1 es el más exigente de demostrar, y es deliberado. Que una capacidad no aparezca en la instalación de prueba no prueba que el producto no la tenga: puede estar en otro menú, requerir activación o depender de un módulo. Afirmar que algo no existe requiere respaldo del propio fabricante.

**Una prueba que falla no prueba que la plataforma falle.** Cada resultado negativo se revisa antes de convertirse en veredicto: se descarta primero que el fallo sea del procedimiento, del instrumento de prueba o de una decisión de configuración propia.

---

## 3.8 Ponderación

### Por criticidad, dentro de los criterios solicitados

| Criticidad | Peso | Qué incluye |
|---|:---:|---|
| **Núcleo** | ×3 | Lo que la compañía no puede dejar de hacer: seguimiento de la cartera, gestión de reclamos, ficha del asegurado |
| **Soporte** | ×2 | Lo que mejora la operación sin ser indispensable: campañas, proyección de ventas, agenda |
| **Accesorio** | ×1 | Lo que aporta valor marginal |

### Entre criterios solicitados y no solicitados

| Grupo | Peso |
|---|:---:|
| **Parte A** — solicitados | **85 %** |
| **Parte B** — no solicitados | **15 %** |

Con esta proporción, una plataforma que cubriera la totalidad de la Parte B y la mitad de la Parte A quedaría por debajo de otra que cubriera la Parte A completa sin ninguna capacidad adicional, que es el orden correcto: lo que el cliente pidió pesa más que lo que no pidió.

---

## 3.9 Cálculo del resultado

**Por parte:**

```
puntaje obtenido  =  Σ (valor × peso de criticidad)
puntaje máximo    =  Σ (5 × peso de criticidad)     solo sobre los criterios puntuados
% de cumplimiento =  puntaje obtenido / puntaje máximo × 100
```

Los criterios sin verificar, los que no aplican y los condicionados quedan fuera de ambos términos.

**Oferta técnica:**

```
oferta técnica = 0,85 × (% cumplimiento Parte A) + 0,15 × (% cumplimiento Parte B)
```

**Oferta económica.** Se calcula sobre el costo total proyectado a cinco años, incluyendo licencias, infraestructura y el tiempo de administración estimado. La alternativa de menor costo recibe 100 puntos; las demás, un puntaje proporcional inverso:

```
puntaje económico = (costo de la alternativa más barata / costo de la alternativa) × 100
```

**Valor total:**

```
valor total = 0,70 × oferta técnica + 0,30 × oferta económica
```

La proporción refleja que la decisión es primero funcional: un sistema barato que no cubre lo que la compañía necesita no resuelve el problema. El 30 % asignado al costo alcanza para que una diferencia económica significativa altere el orden entre alternativas técnicamente parejas, que es lo que debe hacer.

---

## 3.10 Origen de cada afirmación

| Referencia | Significado |
|---|---|
| `[REQ]` | Frase textual del pedido del cliente |
| `[CRIT n]` | Criterio n del marco técnico de evaluación |
| `[UI:sistema ruta]` | Comprobado en la instalación, en la pantalla indicada |
| `[API:método]` | Ejecutado contra la interfaz de programación, con su respuesta |
| `[TEST:id]` | Demostrado mediante prueba automatizada, con video |
| `[DOC:dirección]` | Documentación oficial del fabricante, no comprobado |
| `[RUBRO]` | Derivado de las características del negocio asegurador |

---

## 3.11 Cómo se produjo la evidencia

Las pruebas se automatizaron con una herramienta de automatización de navegador. Esa decisión tuvo tres consecuencias sobre la calidad del análisis.

**El mismo procedimiento se ejecuta sobre las tres plataformas.** Cargar un asegurado en una y en otra no es una comparación entre dos personas operando a distinta velocidad, sino el mismo recorrido medido de igual manera.

**El veredicto se registra durante la ejecución.** Cada prueba consigna el valor asignado, la vía por la que se obtuvo la capacidad y la razón de ese valor, junto al código que lo comprueba. La matriz de la sección 5 se genera a partir de esos registros: **ningún valor del informe se transcribe a mano.**

**La evidencia queda registrada.** Cada ejecución produce un video del recorrido y capturas de cada paso, que respaldan el valor asignado y permiten reconstruir cómo se llegó a él.

---

## 3.12 Limitaciones de la evidencia

**El escenario es una instalación de prueba, no una compañía en operación.** Los volúmenes cargados son de decenas de miles de registros. Las conclusiones sobre rendimiento valen para una compañía pequeña o mediana.

**Las instalaciones corrieron en una máquina compartida.** Los tiempos absolutos de instalación y arranque están afectados por la carga de esa máquina y deben leerse como comparación relativa entre las tres, no como valores de referencia.

**El conjunto de criterios no es neutral.** Treinta y tres provienen del pedido del cliente y del marco técnico de evaluación; el resto se buscó a propósito, enumerando las condiciones del negocio asegurador y las capacidades que aparecieron al operar los sistemas. Ese último grupo se filtró con un criterio explícito —solo entra el que discrimina entre las tres— y ese filtro inclina el recuento hacia las diferencias, no hacia las coincidencias.

**Una de las tres plataformas no admite inspección interna.** De las dos instalaciones propias se pudo revisar el código, la base de datos y los archivos de configuración. De la plataforma en la nube, solo lo que exponen su interfaz y su documentación. Esa asimetría no se puede resolver y explica que concentre la mayor cantidad de criterios sin verificar.

---

## 3.13 Correcciones aplicadas durante el análisis

Se registran porque afectan la lectura de los resultados.

**Detección de restricciones comerciales por texto de pantalla.** El primer procedimiento buscaba expresiones como "mejore su plan" en el contenido de la página para determinar si una función estaba bloqueada. El método daba positivo siempre en una de las plataformas, porque ese botón está fijo en su menú lateral con independencia de la función que se esté usando. Se descartó: la restricción se determina completando la operación y observando si se bloquea, nunca por la presencia de un texto en pantalla.

**Error de servidor atribuido a la plataforma.** Al crear la entidad Póliza, una de las plataformas devolvió un error interno. El registro del servidor mostró que el fallo ocurría al recalcular cotizaciones de moneda —la instalación tenía configurada una moneda local sin cotización cargada— y que **la entidad se había creado correctamente**. El error correspondía a un proceso posterior y a una decisión de configuración propia, no a una limitación del producto.

**Errores del instrumento atribuidos al producto.** Dos fallos iniciales resultaron ser de la herramienta de prueba: un campo que se completaba concatenando texto, porque el sistema autocompleta etiquetas mientras se escribe; y la creación de campos con opciones, que fallaba por la codificación de caracteres del entorno desde el que se enviaban.
