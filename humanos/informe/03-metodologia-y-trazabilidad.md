# 3. Metodología de evaluación y trazabilidad

## 3.1 La regla, en una frase

**Cada criterio tiene cinco escalones. Se marca el más alto que el sistema alcanza.**

Los escalones describen **qué resuelve** el sistema, en orden creciente. Cada uno incluye al anterior: si alcanza el cuarto, cumple también el tercero. Evaluar un criterio consiste en leer los cinco renglones y señalar hasta dónde llega.

> **Ejemplo — modelado de la póliza**
>
> | | Escalón |
> |:---:|---|
> | **1** | La póliza no se puede representar |
> | **2** | Se representa con campos agregados a una entidad existente |
> | **3** | Se representa como entidad propia, con sus campos |
> | **4** | Además, vinculada al asegurado en ambos sentidos |
> | **5** | Además, con historial de cambios de cada póliza |
>
> EspoCRM alcanza el escalón 5. Twenty, el 3: su objeto propio existe pero no conserva historial.

No hay cuentas, ni promedios, ni escalas que interpretar. **Dos personas que miren el mismo sistema marcan el mismo escalón**, porque cada uno describe un hecho observable y no un grado de satisfacción.

## 3.2 Lo que el escalón NO mide

**Cómo el sistema consigue resolverlo no cambia el escalón.** Si una plataforma trae la capacidad de fábrica y otra exige configurarla, ambas alcanzan el mismo escalón siempre que el resultado sea el mismo. La necesidad del cliente queda igualmente satisfecha.

Lo que cambia es el **costo**, y ahí sí se distinguen:

| Vía | Costo que implica | Dónde se mide |
|---|---|---|
| Viene de fábrica | Ninguno | — |
| Se configura | Horas de puesta en marcha | Oferta económica |
| Se programa | Horas de desarrollo y de mantenimiento posterior | Oferta económica |
| Exige un plan pago | Licencia | Oferta económica |

Cada evaluación registra la vía junto al escalón, pero como insumo del costo. **Configurar no hace peor al sistema: hace más caro el proyecto.**

Esta separación corrige un error de la primera versión de esta metodología, que puntuaba según la vía de obtención. Producía un resultado engañoso: una plataforma que modela la póliza con relaciones e historial obtenía el mismo valor que otra que solo admite campos sueltos, porque ambas requerían configuración. El puntaje medía el camino en lugar del destino.

## 3.3 Cómo se escribe una escalera

Cada criterio de la sección 4 publica la suya. Se construyen con tres reglas.

**Cada escalón describe un hecho observable, no un grado.** No *"cumple parcialmente"* sino *"se representa como entidad propia"*. La prueba de que un escalón está bien escrito es que dos personas no puedan discrepar sobre si el sistema lo alcanza.

**El escalón 5 es lo que el negocio necesita, no lo máximo imaginable.** No se reserva para una capacidad ideal que ningún producto tiene: se ubica en lo que resuelve la necesidad de una compañía de seguros. Una plataforma puede y debe poder alcanzarlo.

**El escalón 1 es la ausencia.** Siempre significa que la necesidad no se cubre por ninguna vía.

Las escaleras de criterios con medición numérica fijan sus cortes **antes de medir**, contra lo que la operación requiere y no contra lo que obtuvo la mejor de las tres. Si los cortes dependieran de los resultados, el valor de una plataforma cambiaría al agregar o quitar otra del análisis.

> **Ejemplo con medición — consumo de memoria**
>
> | | Escalón |
> |:---:|---|
> | **1** | Más de 4 GB |
> | **2** | Entre 2 y 4 GB |
> | **3** | Entre 1 y 2 GB |
> | **4** | Entre 500 MB y 1 GB |
> | **5** | Menos de 500 MB |

> **Ejemplo con comportamiento — carga de un asegurado duplicado**
>
> | | Escalón |
> |:---:|---|
> | **1** | Crea el duplicado y afecta la ficha original |
> | **2** | Crea el duplicado sin dejar rastro |
> | **3** | Crea el duplicado, pero queda registrado quién y cuándo |
> | **4** | Advierte antes de guardar y permite decidir |
> | **5** | Advierte y ofrece unificar las fichas |

La misma forma sirve para capacidades, mediciones y comportamientos. **No hay tipos de escala que elegir ni casos que caigan en dos categorías.**

## 3.4 Cuando el criterio no puntúa

Tres situaciones quedan fuera. En todas el criterio se documenta pero **no recibe escalón**, y se excluye del puntaje obtenido y del máximo posible.

| Estado | Cuándo | Ejemplo |
|---|---|---|
| **No aplica** | La pregunta carece de sentido para esa plataforma | El consumo de servidor en un servicio en la nube |
| **Sin verificar** | La comprobación no se pudo completar | Un aspecto que la plataforma no expone |
| **Condicionado** | El resultado lo determina la organización, no el producto | Dónde residen los datos en una instalación propia |

Si "no aplica" contara como cumplimiento, la plataforma en la nube ganaría puntos por no tener servidor; si contara como incumplimiento, los perdería por lo mismo. Ninguna refleja la realidad. **Completar por deducción convierte una ausencia de dato en un dato.**

El informe declara cuántos criterios quedaron en cada estado: un porcentaje calculado sobre veinte criterios no es comparable con uno calculado sobre cincuenta.

## 3.5 Evidencia exigida

| Situación | Qué se exige |
|---|---|
| Se marca un escalón | Registro del sistema alcanzándolo: captura, respuesta de la interfaz de programación o video |
| Se marca el escalón 1 | **Constancia en la documentación oficial del fabricante** de que la capacidad no existe |

La segunda es la más exigente, y es deliberado. Que algo no aparezca en la instalación de prueba no prueba que el producto no lo tenga: puede estar en otro menú, requerir activación o depender de un módulo.

**Una prueba que falla no prueba que la plataforma falle.** Cada resultado negativo se revisa antes de convertirse en veredicto: se descarta primero que el fallo provenga del procedimiento, del instrumento de prueba o de una decisión de configuración propia.

## 3.6 Ponderación

**Por criticidad**, dentro de los criterios solicitados:

| Criticidad | Peso | Qué incluye |
|---|:---:|---|
| **Núcleo** | ×3 | Lo que la compañía no puede dejar de hacer: cartera, reclamos, ficha del asegurado |
| **Soporte** | ×2 | Lo que mejora la operación sin ser indispensable |
| **Accesorio** | ×1 | Lo que aporta valor marginal |

**Entre solicitados y no solicitados:** Parte A **85 %**, Parte B **15 %**. Con esa proporción, una plataforma que cubriera toda la Parte B y la mitad de la Parte A queda por debajo de otra que cubra la Parte A completa sin ninguna capacidad adicional. Lo que el cliente pidió pesa más que lo que no pidió.

## 3.7 Cálculo del resultado

```
puntaje obtenido  =  Σ (escalón × peso de criticidad)
puntaje máximo    =  Σ (5 × peso de criticidad)      solo sobre los criterios puntuados
% de cumplimiento =  puntaje obtenido / puntaje máximo × 100

oferta técnica    =  0,85 × (% Parte A)  +  0,15 × (% Parte B)
puntaje económico =  (costo de la más barata / costo de la alternativa) × 100
valor total       =  0,70 × oferta técnica  +  0,30 × puntaje económico
```

El costo proyectado a cinco años incluye licencias, infraestructura, horas de implementación según la vía registrada en cada criterio, y administración.

La proporción 70/30 refleja que la decisión es primero funcional: un sistema barato que no cubre lo que la compañía necesita no resuelve el problema. El 30 % alcanza para que una diferencia económica significativa altere el orden entre alternativas técnicamente parejas, que es lo que debe hacer.

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

**El mismo procedimiento se ejecuta sobre las tres plataformas.** Cargar un asegurado en una y en otra no es una comparación entre dos personas operando a distinta velocidad, sino el mismo recorrido evaluado con la misma escalera.

**El escalón se marca durante la ejecución**, junto al código que lo comprueba. La matriz de la sección 5 se genera a partir de esos registros: **ningún valor del informe se transcribe a mano.**

**La evidencia queda registrada.** Cada ejecución produce video y capturas que respaldan el escalón marcado y permiten reconstruir cómo se llegó a él.

## 3.10 Limitaciones de la evidencia

**El escenario es una instalación de prueba, no una compañía en operación.** Los volúmenes cargados son de decenas de miles de registros; las conclusiones sobre rendimiento valen para una compañía pequeña o mediana.

**Las instalaciones corrieron en una máquina compartida.** Los tiempos absolutos están afectados por su carga y deben leerse como comparación relativa entre las tres.

**El conjunto de criterios no es neutral.** Treinta y tres provienen del pedido del cliente y del marco técnico; el resto se buscó a propósito, y ese grupo se filtró dejando solo lo que discrimina entre las tres. Ese filtro inclina el recuento hacia las diferencias, no hacia las coincidencias.

**Una de las tres plataformas no admite inspección interna.** De las dos instalaciones propias se pudo revisar el código, la base de datos y los archivos de configuración; de la plataforma en la nube, solo lo que exponen su interfaz y su documentación. Esa asimetría explica que concentre la mayor cantidad de criterios sin verificar.

## 3.11 Correcciones aplicadas durante el análisis

**El sistema de puntuación se rehízo.** La primera versión puntuaba según la vía de obtención, lo que hacía que dos plataformas con capacidades distintas obtuvieran el mismo valor por requerir ambas configuración. Se reemplazó por la escalera de cinco escalones, y el esfuerzo de implementación pasó a la oferta económica.

**Detección de restricciones comerciales por texto de pantalla.** El primer procedimiento buscaba expresiones como "mejore su plan" en el contenido de la página. Daba positivo siempre en una de las plataformas, porque ese botón está fijo en su menú lateral con independencia de la función que se use. Se descartó: la restricción se determina completando la operación, nunca por la presencia de un texto.

**Error de servidor atribuido a la plataforma.** Al crear la entidad Póliza, una plataforma devolvió un error interno. El registro del servidor mostró que el fallo ocurría al recalcular cotizaciones de moneda —la instalación tenía una moneda local sin cotización cargada— y que **la entidad se había creado correctamente**. El error correspondía a un proceso posterior y a una decisión de configuración propia.

**Errores del instrumento atribuidos al producto.** Dos fallos iniciales resultaron ser de la herramienta de prueba: un campo que se completaba concatenando texto, porque el sistema autocompleta etiquetas mientras se escribe; y la creación de campos con opciones, que fallaba por la codificación de caracteres del entorno desde el que se enviaban.
