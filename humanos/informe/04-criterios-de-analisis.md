# 4. Criterios de análisis

Esta sección define **qué se evalúa**. Cada criterio se enuncia como una capacidad y se acompaña del procedimiento concreto que se ejecuta para comprobarla. El resultado de ese procedimiento se convierte en un valor de 1 a 3 en cada una de las dos escalas definidas en la sección anterior; los resultados obtenidos se presentan en las secciones 5 y 6.

## 4.1 De dónde provienen

Los criterios tienen tres orígenes, y la distinción determina su peso en el resultado.

**El pedido del cliente.** Veinte requerimientos relevados, en lenguaje de negocio. Describen qué debe hacer el sistema. Entran todos, sin excepción.

**El marco técnico de evaluación de software.** Trece criterios que describen cómo debe comportarse una herramienta con independencia de su función: restricciones tecnológicas, instalación, navegabilidad, usabilidad, concurrencia, parametrización, intercambio de datos, seguridad, explotación de la información, reportes, interfaces, integración y soporte. Se incorporan completos, leídos en clave del rubro.

**El negocio asegurador.** Condiciones que ninguna de las dos fuentes anteriores menciona pero que una compañía de seguros no puede ignorar. Se incorporan con su fundamento explícito.

A esas tres se suma lo que apareció al operar los sistemas: **capacidades que las plataformas ofrecen por encima de lo pedido**.

## 4.2 Por qué se dividen en dos partes

| Parte | Contiene | Peso |
|---|---|:---:|
| **A — Solicitados** | Pedido del cliente + marco técnico de evaluación | 85 % |
| **B — No solicitados** | Condiciones del negocio + capacidades por encima de lo pedido | 15 % |

La separación responde a un riesgo concreto. Una plataforma puede ofrecer inteligencia artificial, aplicación móvil y telefonía integrada —ninguna solicitada— y compensar con eso el incumplimiento de algo que la compañía sí necesita. Con los conjuntos separados y ponderados, ese intercambio no es posible.

## 4.3 Del requerimiento al criterio verificable

Los requerimientos del cliente están escritos en lenguaje de negocio y no son verificables tal como se enuncian. *"Mejora de la calidad del servicio y la atención al cliente"* no admite comprobación.

El trabajo previo consistió en traducirlos a capacidades comprobables, aplicando una regla: **si un requerimiento admite verificaciones independientes, se divide hasta que cada criterio tenga una sola respuesta posible.**

> **Ejemplo.** El requerimiento *"seguimiento de pólizas: qué tipo tiene, el estado de pago y si hay posibilidad de cambio"* se descompone en el modelado de la póliza como objeto, los tipos de dato que admite, su vinculación con el asegurado y la operación sobre el conjunto. Cada uno se comprueba por separado.

## 4.4 Cómo se evalúa cada criterio

Cada criterio lleva un **procedimiento de verificación**: la acción concreta que se ejecuta sobre cada plataforma. El procedimiento es idéntico en las tres, lo que hace comparables los resultados.

De la ejecución surgen tres datos, uno por cada cosa que el informe mide por separado:

1. **Si la capacidad existe**, que determina el valor de **cumplimiento**.
2. **Por qué vía se obtuvo** —disponible al instalar, configurando desde la administración, o programando—, que determina el **costo de implementación**.
3. **Si requiere un plan pago**, que no afecta ninguno de los dos valores y se traslada a la oferta económica.

Los tres se puntúan de 1 a 3 según las escalas de la sección 3. El procedimiento describe **qué hacer**; la escala, **cómo puntuar lo observado**.

Los procedimientos se ejecutaron de forma automatizada siempre que fue posible, de modo que la misma secuencia de acciones corriera sobre las tres plataformas sin variaciones de operador.

---

## 4.5 Parte A — Criterios solicitados

### A.1 Cartera de pólizas

*Criterios funcionales. Pregunta: ¿el usuario puede hacerlo desde el sistema?*

| ID | Criterio | Procedimiento de verificación | Criticidad |
|---|---|---|:---:|
| A.1.1 | Modelado de la póliza como objeto propio | Crear una entidad Póliza con identidad propia y comprobar que aparece en el menú del sistema y admite registros | Núcleo |
| A.1.2 | Campos de lista para el ramo y el estado de cobranza | Agregar dos campos de lista —uno con los ramos que comercializa la compañía y otro con los estados de cobranza—, cargar una póliza de cada ramo y cambiarle el estado | Núcleo |
| A.1.3 | Prima con importe y moneda | Agregar un campo de importe con moneda y cargar una prima, comprobando que conserva los decimales y la denominación | Núcleo |
| A.1.4 | Vigencia con fecha de inicio y de fin | Agregar dos campos de fecha y comprobar que el sistema los trata como fechas: admite orden y comparación | Núcleo |
| A.1.5 | Aviso anticipado de vencimiento | Definir un aviso sobre las pólizas que vencen en los próximos treinta días y sobre los reclamos que alcanzan su plazo de resolución, y comprobar que el sistema los emite sin intervención | Soporte |
| A.1.6 | Consulta y filtrado de la cartera | Filtrar de forma combinada por ramo, por estado de cobranza y por productor responsable, y obtener el listado resultante | Núcleo |
| A.1.7 | Operación masiva sobre la cartera | Seleccionar varias pólizas del listado y modificar un campo en todas con una sola acción | Soporte |

### A.2 Captación y proceso de venta

*Criterios funcionales. Pregunta: ¿el usuario puede hacerlo desde el sistema?*

| ID | Criterio | Procedimiento de verificación | Criticidad |
|---|---|---|:---:|
| A.2.1 | Registro del solicitante con sus datos de contacto | Crear un solicitante con nombre, teléfono, correo y domicilio, y recuperarlo por búsqueda | Núcleo |
| A.2.2 | Calificación y priorización del solicitante | Asignar a los solicitantes un nivel de urgencia y obtener la lista ordenada por ese nivel, para atender primero a los que más cerca están de contratar | Núcleo |
| A.2.3 | Conversión del solicitante en oportunidad de venta | Convertir el solicitante en oportunidad y comprobar que los datos cargados se trasladan sin volver a escribirlos | Núcleo |
| A.2.4 | Embudo de oportunidades con etapas | Crear una oportunidad desde la ficha de un asegurado y hacerla avanzar entre etapas hasta el cierre | Núcleo |
| A.2.5 | Embudos diferenciados por ramo | Crear un segundo embudo con etapas distintas del primero y asignarle una oportunidad | Soporte |
| A.2.6 | Oportunidades de cambio y ampliación sobre la cartera | Obtener el conjunto de asegurados que tienen un ramo contratado y no otro, y el de los que están próximos a vencer, como base para ofrecer una cobertura adicional o un cambio de póliza | Núcleo |

### A.3 Productores y actividad comercial

*Criterios funcionales. Pregunta: ¿el usuario puede hacerlo desde el sistema?*

| ID | Criterio | Procedimiento de verificación | Criticidad |
|---|---|---|:---:|
| A.3.1 | Registro de productores y asignación de cartera | Crear un usuario productor y asignarle un conjunto de asegurados como responsable | Núcleo |
| A.3.2 | Bitácora de la actividad con el cliente | Registrar una llamada y una reunión sobre un asegurado, y comprobar que ambas quedan visibles en orden cronológico con su autor | Núcleo |
| A.3.3 | Agenda y carga de trabajo del productor | Ingresar con un usuario productor y comprobar que dispone de una vista de sus pendientes y compromisos | Soporte |
| A.3.4 | Proyección de los movimientos comerciales | Cargar oportunidades con monto y probabilidad, y comprobar si el sistema calcula un total proyectado por período | Soporte |

### A.4 Marketing, segmentación y reputación

*Criterios funcionales. Pregunta: ¿el usuario puede hacerlo desde el sistema?*

| ID | Criterio | Procedimiento de verificación | Criticidad |
|---|---|---|:---:|
| A.4.1 | Segmentación reutilizable de la cartera | Definir un conjunto de asegurados por un criterio, guardarlo con nombre y volver a abrirlo | Núcleo |
| A.4.2 | Diseño de campañas sobre un segmento | Crear una campaña dirigida a un segmento guardado y personalizar su contenido | Soporte |
| A.4.3 | Medición de los resultados de la campaña | Comprobar que el sistema registra envíos, aperturas o respuestas de la campaña realizada | Soporte |
| A.4.4 | Captación de interesados desde redes sociales | Buscar la conexión con alguna red social y comprobar que permite incorporar interesados a la base | Soporte |
| A.4.5 | Escucha de menciones en canales públicos | Buscar la función de seguimiento de menciones de la compañía y de la competencia | Accesorio |
| A.4.6 | Registro de la competencia y del motivo de pérdida | Marcar una oportunidad como perdida y comprobar si admite registrar el motivo y el competidor que la ganó | Soporte |

### A.5 Atención al asegurado y reclamos

*Criterios funcionales. Pregunta: ¿el usuario puede hacerlo desde el sistema?*

| ID | Criterio | Procedimiento de verificación | Criticidad |
|---|---|---|:---:|
| A.5.1 | Reclamo como caso con identidad propia | Crear un reclamo asociado a un asegurado y comprobar que tiene número, listado y ficha propios | Núcleo |
| A.5.2 | Estado y seguimiento del reclamo | Cambiar el reclamo de estado y comprobar que el sistema conserva la secuencia de estados por los que pasó | Núcleo |
| A.5.3 | Responsable asignado a cada reclamo | Asignar el reclamo a un usuario y comprobar que aparece entre sus pendientes | Núcleo |
| A.5.4 | Base de conocimiento para la atención | Crear un artículo con una condición de cobertura y recuperarlo mediante búsqueda | Soporte |
| A.5.5 | Tareas asignables con responsable y vencimiento | Crear una tarea, asignarla a otro usuario con fecha de vencimiento y verificarla desde la cuenta de ese usuario | Núcleo |
| A.5.6 | Aviso al usuario al que se le asigna una tarea | Comprobar si el usuario asignado recibe una notificación sin tener que consultar el listado | Soporte |

### A.6 Ficha única del asegurado

*Criterios funcionales. Pregunta: ¿el usuario puede hacerlo desde el sistema?*

| ID | Criterio | Procedimiento de verificación | Criticidad |
|---|---|---|:---:|
| A.6.1 | Vinculación de la póliza con su titular | Relacionar la póliza con un contacto, abrir la ficha del contacto y comprobar que la póliza figura allí; abrir la póliza y comprobar que muestra al titular | Núcleo |
| A.6.2 | Ficha integral del asegurado | Abrir la ficha de un asegurado con póliza, actividad y reclamo cargados, y contar cuántos de esos elementos se ven sin navegar a otra pantalla | Núcleo |
| A.6.3 | Campos propios del rubro en la ficha | Agregar a la ficha del asegurado dos campos que el producto no trae —uno de ellos para registrar la valoración que dejó— y comprobar que quedan disponibles en el alta y en la búsqueda | Núcleo |
| A.6.4 | Unicidad de la ficha del asegurado | Cargar dos veces un asegurado con el mismo documento y comprobar si el sistema advierte la duplicación | Núcleo |

### A.7 Intercambio de datos y correo

*Criterios funcionales. Pregunta: ¿el usuario puede hacerlo desde el sistema?*

| ID | Criterio | Procedimiento de verificación | Criticidad |
|---|---|---|:---:|
| A.7.1 | Importación de contactos desde planilla de cálculo | Importar un archivo de planilla con contactos y comprobar cuántos ingresan completos | Núcleo |
| A.7.2 | Importación de contactos desde las agendas de correo | Buscar la conexión con el correo web y con el gestor de escritorio que usa la compañía, e incorporar contactos desde la agenda de cada uno | Soporte |
| A.7.3 | Sincronización del correo de varios usuarios | Configurar una casilla y comprobar si la configuración admite hacerlo para varios usuarios o solo para uno | Núcleo |
| A.7.4 | Vinculación automática del correo a la ficha | Enviar un mensaje a la dirección de un asegurado cargado y comprobar si queda registrado en su ficha sin intervención | Núcleo |
| A.7.5 | Exportación de la cartera sin pérdida de datos | Exportar los registros importados y comparar el archivo resultante con el original: cantidad de filas, acentuación y campos vacíos | Soporte |

### A.8 Parametrización del modelo de negocio

*Criterios funcionales. Pregunta: ¿el usuario puede hacerlo desde el sistema?*

| ID | Criterio | Procedimiento de verificación | Criticidad |
|---|---|---|:---:|
| A.8.1 | Creación de entidades sin programar | Crear una entidad nueva desde la administración y registrar si fue necesario escribir código | Núcleo |
| A.8.2 | Campos calculados sobre datos propios | Definir un campo cuyo valor derive de otro y comprobar que se calcula al guardar | Soporte |
| A.8.3 | Automatización de procesos | Definir una acción automática ante un evento y provocar ese evento para comprobar que se ejecuta | Soporte |
| A.8.4 | Conservación de la parametrización al actualizar | Aplicar o consultar el procedimiento de actualización y determinar qué ocurre con las entidades y campos creados por la compañía | Núcleo |

### A.9 Control de acceso y trazabilidad

*Criterios funcionales. Pregunta: ¿el usuario puede hacerlo desde el sistema?*

| ID | Criterio | Procedimiento de verificación | Criticidad |
|---|---|---|:---:|
| A.9.1 | Restricción de la cartera por productor | Crear un usuario con acceso restringido e intentar abrir un registro ajeno, incluso por dirección directa | Núcleo |
| A.9.2 | Autenticación de los usuarios bajo control de la compañía | Revisar qué exige el sistema para validar la identidad: política de contraseñas, segundo factor y acceso unificado con el directorio de la compañía | Núcleo |
| A.9.3 | Registro de quién modificó cada dato | Cambiar el ramo de una póliza vigente con un usuario y buscar desde otro la constancia del cambio: valor anterior, autor y momento | Núcleo |

### A.10 Explotación de la información

*Criterios funcionales. Pregunta: ¿el usuario puede hacerlo desde el sistema?*

| ID | Criterio | Procedimiento de verificación | Criticidad |
|---|---|---|:---:|
| A.10.1 | Indicadores sobre la operación | Construir vistas que muestren el total de primas por estado de cobranza y el tiempo promedio de resolución de los reclamos | Soporte |
| A.10.2 | Generación de informes definidos por el usuario | Producir un informe con el total de primas vendidas por cada productor en un período, eligiendo los criterios, y exportarlo | Núcleo |
| A.10.3 | Informe paramétrico reutilizable | Guardar un informe con el período como parámetro y volver a ejecutarlo para otro período sin rehacerlo | Soporte |
| A.10.4 | Intercambio de datos con otros sistemas de la compañía | Crear y consultar registros desde fuera del sistema, por la vía que la plataforma habilite | Soporte |
| A.10.5 | Intercambio sin límite de volumen que condicione la operación | Determinar cuántas operaciones por unidad de tiempo admite ese intercambio y contrastarlo con el movimiento diario de una cartera | Soporte |

### A.11 Condiciones técnicas del producto

*Criterios no funcionales. Pregunta: ¿el sistema satisface la condición que el negocio requiere?*

| ID | Criterio | Procedimiento de verificación | Criticidad |
|---|---|---|:---:|
| A.11.1 | Recursos que la compañía debe disponer para sostenerlo | Determinar qué infraestructura exige el sistema y contrastarla con la que una compañía pequeña tiene disponible | Soporte |
| A.11.2 | Puesta en marcha sin perfil técnico especializado | Llevar el sistema desde cero hasta operativo, registrando pasos, tiempo y si exige conocimientos que la compañía no tiene | Soporte |
| A.11.3 | Navegabilidad: pocos pasos para la operación diaria | Contar las acciones necesarias para registrar un asegurado con su póliza, desde el ingreso al sistema | Soporte |
| A.11.4 | Aprendizaje sin capacitación previa | Pedir a tres personas ajenas al proyecto que completen las mismas cinco tareas frecuentes sin instrucción, y registrar cuántas logra cada una | Soporte |
| A.11.5 | Localización completa al español, modelo incluido | Recorrer el menú principal y una ficha, y contar cuántos nombres de objetos y campos permanecen en otro idioma | Núcleo |
| A.11.6 | Operación concurrente sobre la misma cartera | Abrir el mismo registro con tres usuarios simultáneos, modificarlo en los tres y observar el comportamiento del sistema | Núcleo |
| A.11.7 | Ecosistema de integraciones disponible | Revisar el catálogo de conectores disponibles y su accesibilidad | Soporte |
| A.11.8 | Documentación en español | Consultar la documentación oficial y verificar la disponibilidad del idioma | Soporte |
| A.11.9 | Comunidad activa de usuarios | Publicar una consulta real en el foro oficial y medir el tiempo hasta la primera respuesta | Soporte |
| A.11.10 | Soporte técnico con compromiso de respuesta | Verificar en la documentación comercial la existencia de un canal con plazo comprometido | Soporte |
| A.11.11 | Continuidad de las versiones en uso | Determinar durante cuánto tiempo el fabricante mantiene con correcciones una versión publicada | Soporte |

---

## 4.6 Parte B — Criterios no solicitados

### B.1 Condiciones que impone el negocio asegurador

*Criterios no funcionales. Pregunta: ¿el sistema satisface la condición que el negocio requiere?*

| ID | Criterio | Procedimiento de verificación | Fundamento | Criticidad |
|---|---|---|---|:---:|
| B.1.1 | Persistencia de los datos sin uso continuo | Verificar en las condiciones del servicio si existe un plazo de inactividad que afecte la cuenta o los datos | Una póliza permanece vigente años aunque nadie la consulte | Núcleo |
| B.1.2 | Copia propia y completa de la cartera | Obtener una copia de toda la información, incluidos los archivos adjuntos, y comprobar que puede restituirse | La cartera es el activo principal de la compañía | Núcleo |
| B.1.3 | Copia periódica sin intervención manual | Determinar si esa copia puede programarse para repetirse sola, sin que alguien la ejecute cada vez | Una copia que depende de que alguien se acuerde no es un resguardo | Soporte |
| B.1.4 | Búsqueda y operación con volumen productivo | Cargar veinticinco mil registros y buscar uno por texto; repetir el filtrado por campo | Una cartera de cinco mil asegurados con dos pólizas y media en promedio, más sus contactos y reclamos, supera los veinte mil registros | Núcleo |
| B.1.5 | Previsibilidad de los cambios del sistema | Determinar quién decide cuándo se aplica una actualización y con cuánta anticipación se anuncia | Un cambio inesperado durante la operación interrumpe la atención | Soporte |
| B.1.6 | Conocimiento y decisión sobre dónde residen los datos | Determinar dónde se alojan los datos y en qué medida la compañía puede elegirlo | Los seguros de personas involucran datos sensibles (Ley 25.326) | Soporte |
| B.1.7 | Continuidad de la atención ante una caída del enlace | Interrumpir la conexión externa y determinar qué parte de la operación diaria sigue siendo posible | La atención no debería detenerse por una falla de conectividad | Soporte |

### B.2 Capacidades por encima de lo solicitado

*Criterios funcionales. Pregunta: ¿el usuario puede hacerlo desde el sistema?*

| ID | Criterio | Procedimiento de verificación | Aplicación en el rubro | Criticidad |
|---|---|---|---|:---:|
| B.2.1 | Asistente de inteligencia artificial | Buscar la función en el sistema y solicitarle el resumen de un registro | Resumir el historial de un asegurado o redactar una respuesta | Accesorio |
| B.2.2 | Aplicación móvil nativa | Verificar la existencia de aplicación oficial en las tiendas de aplicaciones | El productor registra la operación durante la visita | Soporte |
| B.2.3 | Suite de trabajo integrada | Enumerar las herramientas incluidas más allá del CRM y comprobar que operan sobre los mismos datos | Mensajería, documentos y firma en el mismo entorno | Accesorio |
| B.2.4 | Telefonía y videollamada integradas | Verificar la existencia de la función dentro del sistema | Atención sin cambiar de herramienta | Accesorio |
| B.2.5 | Uso sin restricciones comerciales en la interfaz | Recorrer las pantallas de uso diario y registrar la presencia de avisos de venta | Operación sin interrupciones comerciales | Soporte |

---

## 4.7 Qué significa cada valor en los criterios que producen una medición

Algunos procedimientos no devuelven un hecho sino un número: cuántos pasos, cuántos segundos, cuánta memoria. **El número se registra como evidencia, pero no es el que decide el valor**: el valor sale de la misma pregunta de la sección 3, y esta tabla declara qué significa cada respuesta en esos criterios.

La distinción importa. Un corte numérico —"hasta ocho pasos vale 3, nueve vale 2"— parece objetivo y no lo es: alguien eligió el ocho, y esa elección decide el resultado sin que nadie pueda discutirla. La sección 3 evita eso de forma deliberada, anclando cada valor en **lo que la compañía puede sostener** y no en una cifra universal.

| Criterio | Lo que se mide | 3 | 2 | 1 |
|---|---|---|---|---|
| A.6.2 Ficha integral del asegurado | Cuántos de los tres elementos —póliza, actividad y reclamo— se ven sin cambiar de pantalla | Los tres | Dos | Uno o ninguno |
| A.7.1 Importación desde planilla | Registros que ingresan completos, sobre el total del archivo | Ingresan todos, sin pérdida | Ingresan todos, con pérdida de acentuación o de algún campo | Quedan registros sin ingresar, o no hay importación |
| A.7.5 Exportación de la cartera | Diferencias entre el archivo exportado y el original | Ninguna | Pérdida de acentuación o de campos vacíos | Faltan filas, o no hay exportación |
| A.10.5 Intercambio sin límite de volumen | Operaciones que admite el intercambio, contra las que exige sincronizar la cartera a diario | El límite queda holgado frente a esa operación | Se alcanza en una jornada de uso intenso y obliga a espaciar los envíos | Impide sincronizar la cartera, o no está publicado |
| A.11.1 Recursos que la compañía debe disponer | Qué infraestructura hay que aportar para sostener el sistema con la cartera cargada | No exige ninguna | Corre en un equipo de escritorio ya disponible | Exige un servidor dedicado |
| A.11.2 Puesta en marcha | Qué hace falta para llevar el sistema de cero a operativo | Lo completa alguien sin perfil técnico | Lo completa alguien con conocimientos puntuales, siguiendo la documentación | Exige un perfil técnico que la compañía no tiene |
| A.11.3 Navegabilidad | Acciones necesarias para registrar un asegurado con su póliza, desde el ingreso | El registro se completa en un solo recorrido | Obliga a volver sobre pantallas ya visitadas o a repetir datos | No se completa sin recurrir a otra vía |
| A.11.4 Aprendizaje sin capacitación previa | Tareas completadas sin instrucción, sobre cinco, por cada una de las tres personas | Las tres completan las cinco | Alguna queda sin completar, y quien la intentó sabe decir qué le faltó | Hay tareas que ninguna de las tres logra completar |
| A.11.5 Localización completa al español | Nombres de objetos y campos en otro idioma, en el menú principal y en una ficha | Ninguno | Queda alguno, y aun así se entiende qué hace | Hay nombres que impiden saber qué guarda el campo |
| A.11.9 Comunidad activa de usuarios | Qué respuesta recibe una consulta real publicada en el foro oficial | Respuesta que resuelve la consulta, en el plazo de una semana | Respuesta tardía, o que no resuelve | Sin respuesta |
| A.11.11 Continuidad de las versiones | Por cuánto tiempo el fabricante sostiene con correcciones una versión publicada | Publica el plazo, y alcanza para planificar la actualización con tiempo | Publica el plazo, pero obliga a actualizar antes de lo que la compañía preveía | No hay compromiso publicado |
| B.1.4 Volumen productivo | Comportamiento de una búsqueda por texto con veinticinco mil registros cargados | Responde sin espera perceptible | Responde con una demora que el usuario nota y tolera | La operación se vuelve impracticable, o falla |

**El dato medido se publica junto al veredicto.** Que EspoCRM ocupe 203 MB y otra plataforma 1.770 no cambia el valor de ninguna de las dos si ambas corren en el equipo que la compañía ya tiene, pero es información que la compañía necesita y queda registrada en el análisis por criterio.

## 4.8 Criterios descartados

Se evaluó su incorporación y se resolvió excluirlos, por tres motivos distintos.

**No discriminan.** Una capacidad que las tres plataformas resuelven de manera equivalente no aporta información para decidir.

| Criterio considerado | Por qué no discrimina |
|---|---|
| Cantidad de idiomas disponibles | Las tres superan holgadamente lo necesario; solo importa la calidad del español, evaluada en A.11.5 |
| Estilo de la interfaz de programación | Las tres ofrecen una; el estilo es una preferencia técnica sin consecuencia para el negocio |

**Ya están cubiertos por otro criterio.**

| Criterio considerado | Dónde se evalúa |
|---|---|
| Existencia de tableros visuales | A.10.1, que evalúa la capacidad de construir indicadores y no su presentación |

**Discriminan, pero sin consecuencia para la operación.** Existe diferencia entre las plataformas y aun así no entran, porque puntuarlos movería el resultado por algo que la compañía no llega a percibir.

| Criterio considerado | Por qué no entra |
|---|---|
| Navegación por teclado | La diferencia es real, pero no altera el tiempo ni la calidad de la operación diaria |

**Están fuera del alcance.** Resuelven un problema distinto del que la compañía planteó.

| Criterio considerado | Por qué no entra |
|---|---|
| Gestión de inventario y constructor de sitios web | Funciones ajenas a la relación con el asegurado, que es lo que este análisis evalúa |

## 4.9 Resumen

Cada grupo pesa dentro de su parte lo que suman las criticidades de sus criterios. La última columna publica ese reparto, que **es una consecuencia del catálogo y no una decisión aparte**: se muestra para poder discutirlo.

| Parte | Categoría | Criterios | Peso en su parte |
|---|---|:---:|:---:|
| A | A.1 Cartera de pólizas | 7 | 12.4 % |
| A | A.2 Captación y proceso de venta | 6 | 11.1 % |
| A | A.3 Productores y actividad comercial | 4 | 6.5 % |
| A | A.4 Marketing, segmentación y reputación | 6 | 7.8 % |
| A | A.5 Atención al asegurado y reclamos | 6 | 10.5 % |
| A | A.6 Ficha única del asegurado | 4 | 7.8 % |
| A | A.7 Intercambio de datos y correo | 5 | 8.5 % |
| A | A.8 Parametrización del modelo de negocio | 4 | 6.5 % |
| A | A.9 Control de acceso y trazabilidad | 3 | 5.9 % |
| A | A.10 Explotación de la información | 5 | 7.2 % |
| A | A.11 Condiciones técnicas del producto | 11 | 15.7 % |
| | **Subtotal Parte A** | **61** | **100 %** |
| B | B.1 Condiciones que impone el negocio asegurador | 7 | 70.8 % |
| B | B.2 Capacidades por encima de lo solicitado | 5 | 29.2 % |
| | **Subtotal Parte B** | **12** | **100 %** |
| | **Total** | **73** | |

**50 de los 61 criterios de la Parte A son funcionales**: describen algo que un usuario ejecuta sobre el sistema. Reúnen el 84 % del peso. Las condiciones técnicas del producto —lo que se cumple o no con independencia de quién lo use— quedan en 11 criterios y el 16 % restante.

La proporción es deliberada: **lo que la compañía pidió pesa más que las condiciones generales que cualquier software debe cumplir.** Varias capacidades que un análisis genérico trataría como técnicas —crear entidades, definir un campo calculado, construir un informe— se evalúan como funcionales, porque en este rubro son la vía por la que se modela la póliza y se mide la producción.
**Ningún criterio repite el procedimiento de otro.** Cuando dos capacidades se comprobaban con la misma acción sobre distinto objeto —el historial de una póliza y el de cualquier registro, el total de primas por productor y el informe que lo produce— se conservó una sola, con el procedimiento ampliado para cubrir ambos casos. Evaluar dos veces lo mismo le daría a esa capacidad un peso que nadie decidió.

**Cuando un procedimiento ampliado abarca dos objetos y el sistema resuelve solo uno, el criterio puntúa 2.** Si una plataforma conecta con la agenda del correo web pero no con la del gestor de escritorio, la necesidad queda cubierta con una salvedad permanente, que es exactamente lo que la sección 3 define como *cumple con reparo*.

**Tres criterios dependen del mismo motor de automatización** —el aviso de vencimiento, el aviso al usuario asignado y la automatización de procesos— porque responden a disparadores distintos: una fecha, una asignación y un evento. Una plataforma sin ese motor pierde los tres, y eso está decidido a propósito: en una compañía de seguros el trabajo que nadie dispara a mano —renovaciones, avisos de cobranza, derivación de reclamos— es la diferencia entre una cartera atendida y una cartera olvidada.
