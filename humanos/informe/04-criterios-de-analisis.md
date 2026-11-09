# 4. Criterios de análisis

Cada criterio se enuncia como una capacidad y se comprueba con un procedimiento concreto, idéntico en las tres plataformas.

## 4.1 De dónde provienen

Los criterios tienen cuatro orígenes, y la distinción determina su peso en el resultado.

El primero es el pedido del cliente: veinte requerimientos relevados, en lenguaje de negocio, que describen qué debe hacer el sistema. Entran todos, sin excepción.

El segundo es el marco técnico de evaluación de software. Son trece criterios que describen cómo debe comportarse una herramienta con independencia de su función: restricciones tecnológicas, instalación, navegabilidad, usabilidad, concurrencia, parametrización, intercambio de datos, seguridad, explotación de la información, reportes, interfaces, integración y soporte. Se incorporan completos, leídos en clave del rubro.

El tercero es el negocio asegurador: condiciones que ninguna de las dos fuentes anteriores menciona pero que una compañía de seguros no puede ignorar. Se incorporan con su fundamento explícito.

El cuarto son capacidades que ninguna fuente pide pero que distinguen a las plataformas.

## 4.2 Del requerimiento al criterio verificable

Los requerimientos del cliente están escritos en lenguaje de negocio y no son verificables tal como se enuncian: *"Mejora de la calidad del servicio y la atención al cliente"* no admite comprobación. El trabajo previo consistió en traducirlos a capacidades comprobables con una regla: si un requerimiento admite verificaciones independientes, se divide hasta que cada criterio tenga una sola respuesta posible.

## 4.3 Cómo se evalúa cada criterio

El pedido del cliente y el marco técnico, junto con cuatro condiciones del rubro que hacen a la cartera (la prima, la vigencia, la conservación de lo adaptado y la continuidad de las versiones), forman la **Parte A**, que pesa el 85 %; las condiciones del negocio y las capacidades por encima de lo pedido forman la **Parte B**, que pesa el 15 % (sección 3.6).

Cinco criterios necesitan, además de su procedimiento, una cifra de referencia para valorar lo observado, como cuántos registros son muchos o cuánta espera es tarde: esas cifras salen del tamaño de la compañía, se fijaron antes de medir y figuran en la sección 6 junto a su criterio.

---

## 4.4 Parte A — Criterios solicitados

### A.1 Cartera de pólizas

*Criterios funcionales. Pregunta: ¿el usuario puede hacerlo desde el sistema?*

| ID | Criterio | Qué resuelve | Procedimiento de verificación |
|---|---|---|---|
| A.1.1 | Modelado de la póliza como objeto propio | Que la póliza, el producto que vende la compañía, se registre y se consulte como tal y no disfrazada de otra cosa | Crear una entidad Póliza con identidad propia y comprobar que aparece en el menú del sistema y admite registros |
| A.1.2 | Campos de lista para el ramo y el estado de cobranza | Saber de un vistazo de qué ramo es cada póliza y si está al día, sin depender de cómo lo escriba cada usuario | Agregar dos campos de lista —uno con los ramos que comercializa la compañía y otro con los estados de cobranza—, cargar una póliza de cada ramo y cambiarle el estado |
| A.1.3 | Prima con importe y moneda | Registrar cuánto paga el asegurado con exactitud, en la moneda en que se pactó | Agregar un campo de importe con moneda y cargar una prima, comprobando que conserva los decimales y la denominación |
| A.1.4 | Vigencia con fecha de inicio y de fin | Saber desde cuándo y hasta cuándo cubre cada póliza, y poder ordenar la cartera por esas fechas | Agregar dos campos de fecha y comprobar que el sistema los trata como fechas: admite orden y comparación |
| A.1.5 | Aviso anticipado de vencimiento | Que nadie se entere tarde de una póliza por vencer o de un reclamo fuera de plazo | Definir un aviso sobre las pólizas que vencen en los próximos treinta días y sobre los reclamos que alcanzan su plazo de resolución, y comprobar que el sistema los emite sin intervención |
| A.1.6 | Consulta y filtrado de la cartera | Responder preguntas sobre la cartera —qué pólizas de tal ramo están impagas en tal productor— sin armar listados a mano | Filtrar de forma combinada por ramo, por estado de cobranza y por productor responsable, y obtener el listado resultante |
| A.1.7 | Operación masiva sobre la cartera | Aplicar un mismo cambio a muchas pólizas sin abrirlas de a una | Seleccionar varias pólizas del listado y modificar un campo en todas con una sola acción |

### A.2 Captación y proceso de venta

*Criterios funcionales. Pregunta: ¿el usuario puede hacerlo desde el sistema?*

| ID | Criterio | Qué resuelve | Procedimiento de verificación |
|---|---|---|---|
| A.2.1 | Registro del solicitante con sus datos de contacto | Que ningún interesado se pierda: quien pide una cotización queda registrado y se lo vuelve a encontrar | Crear un solicitante con nombre, teléfono, correo y domicilio, y recuperarlo por búsqueda |
| A.2.2 | Calificación y priorización del solicitante | Dedicar el esfuerzo comercial primero a los que más cerca están de contratar | Registrar qué cobertura pide el solicitante y con cuánta urgencia, y obtener la lista ordenada por esa urgencia para atender primero a los que más cerca están de contratar |
| A.2.3 | Conversión del solicitante en oportunidad de venta | Pasar del interés a la negociación sin volver a pedirle los datos al cliente | Convertir el solicitante en oportunidad y comprobar que los datos cargados se trasladan sin volver a escribirlos |
| A.2.4 | Embudo de oportunidades con etapas | Saber en qué punto está cada venta y cuántas hay en cada etapa | Crear una oportunidad desde la ficha de un asegurado y hacerla avanzar entre etapas hasta el cierre |
| A.2.5 | Embudos diferenciados por ramo | Seguir cada ramo con sus propios pasos, porque no se vende igual un seguro de vida que uno de automotor | Crear un segundo embudo con etapas distintas del primero y asignarle una oportunidad |
| A.2.6 | Oportunidades de cambio y ampliación sobre la cartera | Venderle más al que ya es cliente: quién no tiene un ramo y a quién se le vence la póliza | Obtener el conjunto de asegurados que tienen un ramo contratado y no otro, y el de los que están próximos a vencer, como base para ofrecer una cobertura adicional o un cambio de póliza |

### A.3 Productores y actividad comercial

*Criterios funcionales. Pregunta: ¿el usuario puede hacerlo desde el sistema?*

| ID | Criterio | Qué resuelve | Procedimiento de verificación |
|---|---|---|---|
| A.3.1 | Registro de productores y asignación de cartera | Que cada asegurado tenga un productor responsable y se sepa quién atiende a quién | Crear un usuario productor y asignarle un conjunto de asegurados como responsable |
| A.3.2 | Bitácora de la actividad con el cliente | Que cualquiera que atienda al cliente sepa qué se habló antes, sin preguntarle de nuevo | Registrar una llamada y una reunión sobre un asegurado, y comprobar que ambas quedan visibles en orden cronológico con su autor |
| A.3.3 | Agenda y carga de trabajo del productor | Que el productor organice su día con lo que tiene pendiente a la vista | Ingresar con un usuario productor y comprobar que dispone de una vista de sus pendientes y compromisos |
| A.3.4 | Proyección de los movimientos comerciales | Anticipar cuánto se va a vender en el período con las oportunidades abiertas | Cargar oportunidades con monto y probabilidad, y comprobar si el sistema calcula un total proyectado por período |

### A.4 Marketing, segmentación y reputación

*Criterios funcionales. Pregunta: ¿el usuario puede hacerlo desde el sistema?*

| ID | Criterio | Qué resuelve | Procedimiento de verificación |
|---|---|---|---|
| A.4.1 | Segmentación reutilizable de la cartera | Dirigirse a un grupo de asegurados con algo en común sin volver a armar la lista cada vez | Definir un conjunto de asegurados por un criterio, guardarlo con nombre y volver a abrirlo |
| A.4.2 | Diseño de campañas sobre un segmento | Hacer llegar una promoción a quienes les interesa, con un mensaje adaptado a cada uno | Crear una campaña dirigida a un segmento guardado y personalizar su contenido |
| A.4.3 | Medición de los resultados de la campaña | Saber si una campaña funcionó antes de repetirla | Comprobar que el sistema registra envíos, aperturas o respuestas de la campaña realizada |
| A.4.4 | Captación de interesados desde redes sociales | Que el contacto que llega por una red social entre a la base como cualquier otro | Buscar la conexión con alguna red social y comprobar que permite incorporar interesados a la base |
| A.4.5 | Escucha de menciones en canales públicos | Enterarse de lo que se dice de la compañía y de la competencia | Buscar la función de seguimiento de menciones de la compañía y de la competencia |
| A.4.6 | Publicación en redes desde el sistema | Comunicar en las redes desde el mismo lugar donde se gestiona al cliente | Componer una publicación y emitirla a una red conectada desde el propio sistema, sin pasar por la herramienta de la red |
| A.4.7 | Registro de la competencia y del motivo de pérdida | Aprender de las ventas perdidas: por qué se perdieron y contra quién | Marcar una oportunidad como perdida y comprobar si admite registrar el motivo y el competidor que la ganó |

### A.5 Atención al asegurado y reclamos

*Criterios funcionales. Pregunta: ¿el usuario puede hacerlo desde el sistema?*

| ID | Criterio | Qué resuelve | Procedimiento de verificación |
|---|---|---|---|
| A.5.1 | Reclamo como caso con identidad propia | Que cada reclamo se pueda nombrar, buscar y seguir, en vez de quedar perdido en una nota | Crear un reclamo asociado a un asegurado y comprobar que tiene número, listado y ficha propios |
| A.5.2 | Estado y seguimiento del reclamo | Responderle al asegurado en qué está su reclamo y por dónde pasó | Cambiar el reclamo de estado y comprobar que el sistema conserva la secuencia de estados por los que pasó |
| A.5.3 | Responsable asignado a cada reclamo | Que cada reclamo tenga quien lo resuelva y nadie suponga que lo atiende otro | Asignar el reclamo a un usuario y comprobar que aparece entre sus pendientes |
| A.5.4 | Base de conocimiento para la atención | Responder igual y bien las consultas frecuentes, sin depender de quién atienda | Crear un artículo con una condición de cobertura y recuperarlo mediante búsqueda |
| A.5.5 | Tareas asignables con responsable y vencimiento | Repartir el trabajo con plazo y saber quién lo tiene | Crear una tarea, asignarla a otro usuario con fecha de vencimiento y verificarla desde la cuenta de ese usuario |
| A.5.6 | Aviso al usuario al que se le asigna una tarea | Que el responsable se entere de lo que le toca sin tener que ir a buscarlo | Comprobar si el usuario asignado recibe una notificación sin tener que consultar el listado |

### A.6 Ficha única del asegurado

*Criterios funcionales. Pregunta: ¿el usuario puede hacerlo desde el sistema?*

| ID | Criterio | Qué resuelve | Procedimiento de verificación |
|---|---|---|---|
| A.6.1 | Vinculación de la póliza con su titular | Saber de quién es cada póliza y qué pólizas tiene cada asegurado | Relacionar la póliza con un contacto, abrir la ficha del contacto y comprobar que la póliza figura allí; abrir la póliza y comprobar que muestra al titular |
| A.6.2 | Vista única del asegurado | Ver todo lo del cliente en un solo lugar: la visión completa que sostiene la relación | Abrir la ficha de un asegurado y comprobar si desde allí se llega a todo lo suyo —pólizas, actividad y reclamos— sin buscarlo en otro menú |
| A.6.3 | Campos propios del rubro en la ficha | Guardar del cliente lo que le importa a una aseguradora y el producto no trae | Agregar a la ficha del asegurado un campo que el producto no trae —la valoración que dejó sobre la atención recibida— y comprobar que queda disponible en el alta y en la búsqueda |
| A.6.4 | Unicidad de la ficha del asegurado | Que un mismo cliente no tenga dos fichas con historias distintas | Cargar dos veces un asegurado con el mismo documento y comprobar si el sistema advierte la duplicación |

### A.7 Intercambio de datos y correo

*Criterios funcionales. Pregunta: ¿el usuario puede hacerlo desde el sistema?*

| ID | Criterio | Qué resuelve | Procedimiento de verificación |
|---|---|---|---|
| A.7.1 | Importación de contactos desde planilla de cálculo | Empezar a usar el sistema con la cartera que hoy está en planillas, sin cargarla a mano | Importar un archivo de planilla con contactos y determinar si ingresan todos conservando la acentuación y los campos, o si hay pérdida |
| A.7.2 | Importación de contactos desde las agendas de correo | Sumar los contactos que cada productor tiene en su correo | Buscar la conexión con el correo web y con el gestor de escritorio que usa la compañía, e incorporar contactos desde la agenda de cada uno |
| A.7.3 | Sincronización del correo de varios usuarios | Que el correo de cada usuario con los clientes llegue al sistema | Configurar una casilla y comprobar si la configuración admite hacerlo para varios usuarios o solo para uno |
| A.7.4 | Vinculación automática del correo a la ficha | Que cada mensaje con un cliente quede en su historia sin que alguien lo copie | Enviar un mensaje a la dirección de un asegurado cargado y comprobar si queda registrado en su ficha sin intervención |
| A.7.5 | Exportación de la cartera sin pérdida de datos | Que la cartera se pueda sacar del sistema completa y legible | Exportar los registros importados y comparar el archivo con el original: si coincide, si pierde acentuación o campos, o si faltan filas |

### A.8 Parametrización del modelo de negocio

*Criterios funcionales. Pregunta: ¿el usuario puede hacerlo desde el sistema?*

| ID | Criterio | Qué resuelve | Procedimiento de verificación |
|---|---|---|---|
| A.8.1 | Creación de entidades sin programar | Adaptar el sistema a cosas propias del negocio sin contratar un desarrollo | Crear una entidad nueva desde la administración y registrar si fue necesario escribir código |
| A.8.2 | Campos calculados sobre datos propios | Que los valores que salen de otros se calculen solos y sin errores de cuenta | Definir un campo cuyo valor derive de otro y comprobar que se calcula al guardar |
| A.8.3 | Automatización de procesos | Que los pasos repetitivos se hagan solos cuando ocurre algo | Definir una acción automática ante un evento y provocar ese evento para comprobar que se ejecuta |
| A.8.4 | Conservación de la parametrización al actualizar | No perder lo que se adaptó cada vez que sale una versión nueva | Aplicar o consultar el procedimiento de actualización y determinar qué ocurre con las entidades y campos creados por la compañía |

### A.9 Control de acceso y trazabilidad

*Criterios funcionales. Pregunta: ¿el usuario puede hacerlo desde el sistema?*

| ID | Criterio | Qué resuelve | Procedimiento de verificación |
|---|---|---|---|
| A.9.1 | Restricción de la cartera por productor | Que cada productor vea su cartera y no la de los demás | Crear un usuario con acceso restringido e intentar abrir un registro ajeno, incluso por dirección directa |
| A.9.2 | Autenticación de los usuarios bajo control de la compañía | Que solo entre quien debe, con las reglas de acceso que fija la compañía | Revisar qué exige el sistema para validar la identidad: política de contraseñas, segundo factor y acceso unificado con el directorio de la compañía |
| A.9.3 | Registro de quién modificó cada dato | Saber quién cambió qué y cuándo, ante un error o una disputa | Cambiar el ramo de una póliza vigente con un usuario y buscar desde otro la constancia del cambio: valor anterior, autor y momento |

### A.10 Explotación de la información

*Criterios funcionales. Pregunta: ¿el usuario puede hacerlo desde el sistema?*

| ID | Criterio | Qué resuelve | Procedimiento de verificación |
|---|---|---|---|
| A.10.1 | Indicadores sobre la operación | Que la dirección vea cómo va el negocio sin pedir un informe | Construir vistas que muestren el total de primas por estado de cobranza y el tiempo promedio de resolución de los reclamos |
| A.10.2 | Generación de informes definidos por el usuario | Responder una pregunta del negocio con los datos, sin depender de sistemas | Producir un informe con el total de primas vendidas por cada productor en un período, eligiendo los criterios, y exportarlo |
| A.10.3 | Informe paramétrico reutilizable | Repetir cada mes el mismo informe cambiando solo el período | Guardar un informe con el período como parámetro y volver a ejecutarlo para otro período sin rehacerlo |
| A.10.4 | Intercambio de datos con otros sistemas de la compañía | Que el sistema converse con los demás de la compañía sin cargar dos veces lo mismo | Crear y consultar registros desde fuera del sistema, por la vía que la plataforma habilite |
| A.10.5 | Intercambio sin límite de volumen que condicione la operación | Que ese intercambio aguante el movimiento real de la compañía | Determinar si el límite de operaciones del intercambio deja holgura sobre el movimiento diario de la cartera, si se alcanza en una jornada intensa, o si impide sincronizarla |

### A.11 Condiciones técnicas y operativas del producto

*Criterios no funcionales. Pregunta: ¿el sistema satisface la condición que el negocio requiere?*

| ID | Tipo | Criterio | Qué resuelve | Procedimiento de verificación |
|---|---|---|---|---|
| A.11.1 | Técnica | Recursos que la compañía debe disponer para sostenerlo | Saber qué equipos e infraestructura hay que tener para que el sistema funcione | Determinar si el sistema no exige infraestructura propia, si corre en un equipo de escritorio de los que la compañía ya tiene, o si pide un servidor dedicado |
| A.11.2 | Técnica | Compatibilidad con la plataforma que la compañía usa | No sumar una tecnología que la compañía no sabe administrar | Determinar sobre qué sistemas operativos y motores de base de datos corre, y si alguno de ellos es de los que la compañía ya administra |
| A.11.3 | Técnica | Puesta en marcha sin perfil técnico especializado | Ponerlo en marcha sin contratar un perfil técnico que la compañía no tiene | Llevar el sistema de cero a operativo y determinar si lo completa alguien sin perfil técnico, si exige conocimientos puntuales guiados por la documentación, o si requiere un perfil que la compañía no tiene |
| A.11.4 | Operativa | Menú y navegabilidad para la operación diaria | Que el trabajo diario se haga sin rodeos ni pantallas de más | Registrar un asegurado con su póliza desde el ingreso, y determinar si el menú lleva a cada función donde se la espera y si el alta se completa en un solo recorrido, o si obliga a volver sobre pantallas ya visitadas |
| A.11.5 | Operativa | Aprendizaje sin capacitación previa | Que un empleado nuevo pueda usarlo sin un curso previo | Dar a tres agentes independientes, sin conocimiento previo de la plataforma, las mismas cinco tareas sin instrucción, y registrar si los tres las completan, si alguna queda pendiente aunque quien la intentó sepa decir qué le faltó, o si hay tareas que ninguno logra |
| A.11.6 | Operativa | Localización completa al español, modelo incluido | Que todo el personal entienda cada pantalla y cada dato | Recorrer el menú principal y una ficha, y determinar si todo está en español, si queda algún nombre en otro idioma que igual se entiende, o si hay nombres que impiden saber qué guarda el campo |
| A.11.7 | Operativa | Cantidad de usuarios sin límite que condicione la operación | Que todo el plantel pueda usarlo sin quedar afuera por un tope de usuarios | Determinar cuántos usuarios admite la edición evaluada y contrastarlo con el plantel de productores y personal administrativo de la compañía |
| A.11.8 | Operativa | Operación concurrente sobre la misma cartera | Que varios usuarios trabajen a la vez sobre la misma cartera sin pisarse | Abrir el mismo registro con tres usuarios simultáneos, modificarlo en los tres y observar el comportamiento del sistema |
| A.11.9 | Técnica | Ecosistema de integraciones disponible | Conectarlo con otras herramientas sin desarrollar cada conexión | Revisar el catálogo de conectores disponibles y su accesibilidad |
| A.11.10 | Operativa | Documentación en español | Resolver dudas de uso con material en el idioma de la compañía | Consultar la documentación oficial y verificar la disponibilidad del idioma |
| A.11.11 | Operativa | Material de capacitación para el usuario final | Capacitar a quienes operan el sistema con material del propio fabricante | Buscar en la oferta del fabricante material de formación —cursos, videos o guías de uso— dirigido a quien opera el sistema y no a quien lo administra |
| A.11.12 | Operativa | Comunidad activa de usuarios | Tener a quién consultar cuando algo no sale | Tomar las 21 consultas más recientes del canal público de la comunidad que ya cumplieron la espera aceptable, y registrar para la consulta típica si recibió una respuesta que la resolvió dentro de esa espera, si llegó más tarde o sin resolver, o si no llegó |
| A.11.13 | Operativa | Soporte técnico con compromiso de respuesta | Saber en cuánto tiempo se obtiene ayuda ante una falla | Verificar en la documentación comercial la existencia de un canal con plazo comprometido |
| A.11.14 | Técnica | Continuidad de las versiones en uso | Planificar las actualizaciones sin quedar con una versión sin correcciones | Determinar si el fabricante publica por cuánto tiempo sostiene con correcciones una versión, y si ese plazo cubre el horizonte de planificación o fuerza a adelantar la actualización |

### A.12 Emisión, cobranza y continuidad de la relación

*Criterios funcionales. Pregunta: ¿el usuario puede hacerlo desde el sistema?*

La venta no termina cuando el cliente dice que sí: hay que emitir la póliza, cobrarla y sostener la relación. Este grupo cubre ese tramo y la frontera con el sistema central de la compañía, que es el que emite y cobra; el CRM tiene que reflejar lo que ese sistema decide sin contradecirlo.

| ID | Criterio | Qué resuelve | Procedimiento de verificación |
|---|---|---|---|
| A.12.1 | Emisión de la póliza al cerrar la venta | Que la venta cerrada se convierta en póliza sin volver a cargar lo que ya se negoció | Marcar ganada una oportunidad y obtener la póliza vinculada al asegurado con los datos de la oportunidad, sin volver a cargarlos |
| A.12.2 | Plan de pago de la prima | Saber cómo paga cada asegurado y qué cuotas adeuda | Registrar la forma de pago y las cuotas de una póliza, cada una con vencimiento y estado, y obtener el listado de cuotas impagas |
| A.12.3 | Datos que administra el sistema central | Que lo que emite y cobra el sistema central llegue al CRM sin duplicarse ni ser modificado desde el CRM | Actualizar desde afuera una póliza por su número, sin que se duplique, y comprobar que los campos que administra el sistema central quedan de solo lectura para el usuario del CRM |
| A.12.4 | Historia del cliente desde el primer contacto | Conocer toda la relación, desde la primera consulta hasta hoy, en la ficha del cliente | Registrar una llamada sobre un solicitante, convertirlo y emitirle la póliza, y comprobar que la llamada figura en la ficha del asegurado |
| A.12.5 | Satisfacción después de la atención | Saber si el asegurado quedó conforme con la atención, que es lo que lo retiene | Al cerrar un reclamo, enviar o registrar una encuesta y comprobar que la respuesta queda en la ficha del asegurado |

---

## 4.5 Parte B — Criterios no solicitados

### B.1 Condiciones que impone el negocio asegurador

*Criterios no funcionales. Pregunta: ¿el sistema satisface la condición que el negocio requiere?*

| ID | Tipo | Criterio | Procedimiento de verificación | Fundamento |
|---|---|---|---|---|
| B.1.1 | Operativa | Persistencia de los datos sin uso continuo | Verificar en las condiciones del servicio si existe un plazo de inactividad que afecte la cuenta o los datos | Una póliza permanece vigente años aunque nadie la consulte |
| B.1.2 | Técnica | Copia propia y completa de la cartera | Obtener una copia de toda la información, incluidos los archivos adjuntos, y comprobar que puede restituirse | La cartera es el activo principal de la compañía |
| B.1.3 | Técnica | Copia periódica sin intervención manual | Determinar si esa copia puede programarse para repetirse sola, sin que alguien la ejecute cada vez | Una copia que depende de que alguien se acuerde no es un resguardo |
| B.1.4 | Operativa | Búsqueda y operación con volumen productivo | Cargar la cartera de referencia, buscar un registro por texto y repetir el filtrado por campo: determinar si responde sin espera perceptible, con una demora que el usuario nota y tolera, o de forma impracticable | Una cartera de cinco mil asegurados con dos pólizas y media en promedio y sus reclamos suma veinticinco mil registros |
| B.1.5 | Operativa | Previsibilidad de los cambios del sistema | Determinar quién decide cuándo se aplica una actualización y con cuánta anticipación se anuncia | Un cambio inesperado durante la operación interrumpe la atención |
| B.1.6 | Técnica | Conocimiento y decisión sobre dónde residen los datos | Determinar dónde se alojan los datos y en qué medida la compañía puede elegirlo | Los seguros de personas involucran datos sensibles (Ley 25.326) |
| B.1.7 | Técnica | Continuidad de la atención ante una caída del enlace | Interrumpir la conexión externa y determinar qué parte de la operación diaria sigue siendo posible | La atención no debería detenerse por una falla de conectividad |

### B.2 Capacidades por encima de lo solicitado

*Criterios funcionales. Pregunta: ¿el usuario puede hacerlo desde el sistema?*

| ID | Criterio | Procedimiento de verificación | Aplicación en el rubro |
|---|---|---|---|
| B.2.1 | Asistente de inteligencia artificial | Buscar la función en el sistema y solicitarle el resumen de un registro | Resumir el historial de un asegurado o redactar una respuesta |
| B.2.2 | Aplicación móvil nativa | Verificar la existencia de aplicación oficial en las tiendas de aplicaciones | El productor registra la operación durante la visita |
| B.2.3 | Suite de trabajo integrada | Enumerar las herramientas incluidas más allá del CRM y comprobar que operan sobre los mismos datos | Mensajería, documentos y firma en el mismo entorno |
| B.2.4 | Telefonía y videollamada integradas | Verificar la existencia de la función dentro del sistema | Atención sin cambiar de herramienta |

---

## 4.6 Resumen

Todos los grupos de una parte pesan lo mismo (sección 3.6): 8,3 % cada uno en la Parte A y 50 % en la Parte B.

| Categoría | Criterios |
|---|:---:|
| A.1 Cartera de pólizas | 7 |
| A.2 Captación y proceso de venta | 6 |
| A.3 Productores y actividad comercial | 4 |
| A.4 Marketing, segmentación y reputación | 7 |
| A.5 Atención al asegurado y reclamos | 6 |
| A.6 Ficha única del asegurado | 4 |
| A.7 Intercambio de datos y correo | 5 |
| A.8 Parametrización del modelo de negocio | 4 |
| A.9 Control de acceso y trazabilidad | 3 |
| A.10 Explotación de la información | 5 |
| A.11 Condiciones técnicas y operativas del producto | 14 |
| A.12 Emisión, cobranza y continuidad de la relación | 5 |
| **Subtotal Parte A** | **70** |
| B.1 Condiciones que impone el negocio asegurador | 7 |
| B.2 Capacidades por encima de lo solicitado | 4 |
| **Subtotal Parte B** | **11** |
| **Total** | **81** |


Ningún criterio repite el procedimiento de otro: evaluar dos veces lo mismo le daría a esa capacidad un peso que nadie decidió. La única excepción es la póliza como entidad propia (A.1.1), que se evalúa aparte de la creación de entidades (A.8.1) porque es el objeto central del negocio y el pedido del cliente la nombra.

Cuando un procedimiento abarca dos objetos y el sistema resuelve solo uno, el criterio puntúa 1.
