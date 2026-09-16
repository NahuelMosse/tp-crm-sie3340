# 4. Criterios de análisis

Esta sección define **qué se evalúa**. Cada criterio se enuncia como una capacidad y se acompaña del procedimiento concreto que se ejecuta para comprobarla. El resultado de ese procedimiento se convierte en un valor de 1 a 5 mediante la escala definida en la sección anterior; los resultados obtenidos se presentan en las secciones 5 y 6.

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

De la ejecución surgen dos datos:

1. **Si la capacidad existe**, y por qué vía se obtuvo: disponible al instalar, configurando desde la administración, programando, o solo por fuera del sistema.
2. **Si requiere licencia**, dato que no afecta el valor técnico y se traslada a la oferta económica.

El primero determina el valor de 1 a 5 según el árbol de decisión de la sección 3. El procedimiento describe **qué hacer**; el árbol, **cómo puntuar lo observado**.

Los procedimientos se ejecutaron de forma automatizada siempre que fue posible, de modo que la misma secuencia de acciones corriera sobre las tres plataformas sin variaciones de operador.

---

## 4.5 Parte A — Criterios solicitados

### A.1 Gestión de la cartera de pólizas

*Criterios funcionales. Pregunta: ¿el usuario puede hacerlo desde el sistema?*

| ID | Criterio | Procedimiento de verificación | Criticidad |
|---|---|---|:---:|
| A.1.1 | Modelado de la póliza como objeto propio | Crear una entidad Póliza con identidad propia y comprobar que aparece en el menú del sistema y admite registros | Núcleo |
| A.1.2 | Tipos de dato adecuados para prima, vigencia y cobranza | Agregar a esa entidad un campo de importe con moneda, dos de fecha y uno de lista con los estados de cobranza; cargar un registro con los cuatro completos | Núcleo |
| A.1.3 | Vinculación de la póliza con el asegurado | Relacionar la póliza con un contacto, abrir la ficha del contacto y comprobar que la póliza figura allí; abrir la póliza y comprobar que muestra al titular | Núcleo |
| A.1.4 | Consulta y filtrado de la cartera para prospección | Filtrar las pólizas cuya vigencia vence en los próximos treinta días y obtener el listado resultante | Núcleo |
| A.1.5 | Operación masiva sobre la cartera | Seleccionar varias pólizas del listado y modificar un campo en todas con una sola acción | Soporte |

### A.2 Gestión comercial y de marketing

*Criterios funcionales. Pregunta: ¿el usuario puede hacerlo desde el sistema?*

| ID | Criterio | Procedimiento de verificación | Criticidad |
|---|---|---|:---:|
| A.2.1 | Registro y calificación del solicitante | Crear un prospecto, agregarle un campo propio de calificación de riesgo y convertirlo en oportunidad | Núcleo |
| A.2.2 | Embudo de oportunidades vinculado al asegurado | Crear una oportunidad desde la ficha de un asegurado y comprobar que avanza entre etapas | Núcleo |
| A.2.3 | Embudos múltiples por ramo | Crear un segundo embudo con etapas distintas al primero y asignarle una oportunidad | Soporte |
| A.2.4 | Segmentación reutilizable de la cartera | Definir un conjunto de asegurados por un criterio, guardarlo con nombre y volver a abrirlo | Núcleo |
| A.2.5 | Campañas con medición de resultados | Crear una campaña sobre ese segmento y comprobar que el sistema registra envíos, aperturas o respuestas | Soporte |
| A.2.6 | Captación de prospectos desde redes sociales | Buscar en el sistema la conexión con alguna red social y comprobar que permite incorporar interesados | Soporte |
| A.2.7 | Escucha de menciones y reputación | Buscar la función de seguimiento de menciones en canales públicos | Accesorio |
| A.2.8 | Proyección de ventas | Cargar oportunidades con monto y probabilidad, y comprobar si el sistema calcula un total proyectado | Soporte |
| A.2.9 | Registro de la competencia y motivos de pérdida | Marcar una oportunidad como perdida y comprobar si admite registrar el motivo y el competidor | Soporte |

### A.3 Atención al asegurado

*Criterios funcionales. Pregunta: ¿el usuario puede hacerlo desde el sistema?*

| ID | Criterio | Procedimiento de verificación | Criticidad |
|---|---|---|:---:|
| A.3.1 | Gestión de reclamos como casos con seguimiento | Crear un reclamo asociado a un asegurado, asignarle responsable y estado, y cambiarlo de estado | Núcleo |
| A.3.2 | Ficha integral del asegurado | Abrir la ficha de un asegurado con póliza, actividad y reclamo cargados, y contar cuántos de esos elementos se ven sin navegar a otra pantalla | Núcleo |
| A.3.3 | Base de conocimiento para la atención | Crear un artículo con una condición de cobertura y recuperarlo mediante búsqueda | Soporte |
| A.3.4 | Tareas con responsable y vencimiento | Crear una tarea, asignarla a otro usuario con fecha de vencimiento y verificarla desde la cuenta de ese usuario | Soporte |
| A.3.5 | Agenda y carga de trabajo por productor | Ingresar con un usuario y comprobar que dispone de una vista de sus pendientes | Soporte |

### A.4 Intercambio de datos y correo

*Criterios funcionales. Pregunta: ¿el usuario puede hacerlo desde el sistema?*

| ID | Criterio | Procedimiento de verificación | Criticidad |
|---|---|---|:---:|
| A.4.1 | Importación desde los formatos que usa el cliente | Intentar importar un archivo de planilla de cálculo, y verificar si ofrece conexión con correo electrónico y agenda de contactos | Soporte |
| A.4.2 | Sincronización de correo multiusuario | Configurar una casilla y comprobar si la configuración admite hacerlo para varios usuarios o solo para uno | Núcleo |
| A.4.3 | Vinculación automática del correo a la ficha | Enviar un mensaje a la dirección de un asegurado cargado y comprobar si queda registrado en su ficha sin intervención | Núcleo |
| A.4.4 | Exportación de la cartera sin pérdida de datos | Exportar los registros importados y comparar el archivo resultante con el original: cantidad de filas, acentuación y campos vacíos | Soporte |

### A.5 Criterios técnicos de evaluación

*Criterios no funcionales. Pregunta: ¿el sistema satisface la condición que el negocio requiere?*

| ID | Criterio | Procedimiento de verificación | Criticidad |
|---|---|---|:---:|
| A.5.1 | Recursos que la compañía debe disponer para sostenerlo | Determinar qué infraestructura exige el sistema y contrastarla con la que una compañía pequeña tiene disponible | Soporte |
| A.5.2 | Puesta en marcha sin perfil técnico especializado | Llevar el sistema desde cero hasta operativo, registrando pasos, tiempo y si exige conocimientos que la compañía no tiene | Soporte |
| A.5.3 | Navegabilidad: pocos pasos para la operación diaria | Contar las acciones necesarias para registrar un asegurado con su póliza, desde el ingreso al sistema | Soporte |
| A.5.4 | Aprendizaje sin capacitación previa | Pedir a una persona ajena al proyecto que complete cinco tareas frecuentes sin instrucción, y registrar cuántas logra | Soporte |
| A.5.5 | Localización completa al español, modelo incluido | Recorrer el menú principal y una ficha, y contar cuántos nombres de objetos y campos permanecen en otro idioma | Núcleo |
| A.5.6 | Operación concurrente sobre la misma cartera | Abrir el mismo registro con tres usuarios simultáneos, modificarlo en los tres y observar el comportamiento del sistema | Núcleo |
| A.5.7 | Creación de entidades sin programar | Crear una entidad nueva desde la administración y registrar si fue necesario escribir código | Núcleo |
| A.5.8 | Relaciones entre entidades desde la interfaz | Vincular dos entidades creadas y comprobar que la relación queda navegable | Núcleo |
| A.5.9 | Campos calculados sobre datos propios | Definir un campo cuyo valor derive de otro y comprobar que se calcula al guardar | Soporte |
| A.5.10 | Automatización de procesos | Definir una acción automática ante un evento y provocar ese evento para comprobar que se ejecuta | Soporte |
| A.5.11 | Restricción de la cartera por productor | Crear un usuario con acceso restringido e intentar abrir un registro ajeno, incluso por dirección directa | Núcleo |
| A.5.12 | Registro de quién modificó cada dato | Modificar un registro con un usuario y buscar desde otro la constancia del cambio, con autor y momento | Núcleo |
| A.5.13 | Indicadores de producción y cobranza | Construir una vista que muestre el total de primas por estado de cobranza | Soporte |
| A.5.14 | Generación de informes | Producir un informe de producción por productor con criterios definidos por el usuario y exportarlo | Soporte |
| A.5.15 | Intercambio de datos con otros sistemas de la compañía | Crear y consultar registros desde fuera del sistema, y verificar si existen límites de volumen que condicionen el intercambio | Soporte |
| A.5.16 | Ecosistema de integraciones disponible | Revisar el catálogo de conectores disponibles y su accesibilidad | Soporte |
| A.5.17 | Documentación en español | Consultar la documentación oficial y verificar la disponibilidad del idioma | Soporte |
| A.5.18 | Comunidad activa de usuarios | Publicar una consulta real en el foro oficial y medir el tiempo hasta la primera respuesta | Soporte |
| A.5.19 | Soporte técnico con compromiso de respuesta | Verificar en la documentación comercial la existencia de un canal con plazo comprometido | Soporte |

---

## 4.6 Parte B — Criterios no solicitados

### B.1 Condiciones que impone el negocio asegurador

*Criterios no funcionales. Pregunta: ¿el sistema satisface la condición que el negocio requiere?*

| ID | Criterio | Procedimiento de verificación | Fundamento |
|---|---|---|---|
| B.1.1 | Persistencia de los datos sin uso continuo | Verificar en las condiciones del servicio si existe un plazo de inactividad que afecte la cuenta o los datos | Una póliza permanece vigente años aunque nadie la consulte |
| B.1.2 | Posibilidad de conservar una copia propia de la cartera | Obtener una copia completa de la información, incluidos los archivos adjuntos, y verificar si puede repetirse de forma periódica | La cartera es el activo principal de la compañía |
| B.1.3 | Búsqueda y operación con volumen productivo | Cargar mil doscientos registros y buscar uno por texto; repetir el filtrado por campo | Una compañía pequeña administra decenas de miles de pólizas |
| B.1.4 | Previsibilidad de los cambios del sistema | Determinar quién decide cuándo se aplica una actualización y con cuánta anticipación se anuncia | Un cambio inesperado durante la operación interrumpe la atención |
| B.1.5 | Conocimiento y decisión sobre dónde residen los datos | Determinar dónde se alojan los datos y en qué medida la compañía puede elegirlo | Los seguros de personas involucran datos sensibles (Ley 25.326) |
| B.1.6 | Integridad de la ficha única del asegurado | Cargar dos veces el mismo asegurado y observar si el sistema advierte la duplicación | La doble ficha es el error más costoso de una cartera |
| B.1.7 | Continuidad de la atención ante una caída del enlace | Interrumpir la conexión externa y determinar qué parte de la operación diaria sigue siendo posible | La atención no debería detenerse por una falla de conectividad |

### B.2 Capacidades por encima de lo solicitado

*Criterios funcionales. Pregunta: ¿el usuario puede hacerlo desde el sistema?*

| ID | Criterio | Procedimiento de verificación | Aplicación en el rubro |
|---|---|---|---|
| B.2.1 | Asistente de inteligencia artificial | Buscar la función en el sistema y solicitarle el resumen de un registro | Resumir el historial de un asegurado o redactar una respuesta |
| B.2.2 | Aplicación móvil nativa | Verificar la existencia de aplicación oficial en las tiendas de aplicaciones | El productor registra la operación durante la visita |
| B.2.3 | Suite de trabajo integrada | Enumerar las herramientas incluidas más allá del CRM y comprobar que operan sobre los mismos datos | Mensajería, documentos y firma en el mismo entorno |
| B.2.4 | Telefonía y videollamada integradas | Verificar la existencia de la función dentro del sistema | Atención sin cambiar de herramienta |
| B.2.5 | Detección de registros duplicados al cargar | Intentar crear un asegurado ya existente y observar si el sistema lo advierte antes de guardar | Evita la doble ficha antes de que se produzca |
| B.2.6 | Explotación de los datos por fuera del sistema | Extraer información para cruzarla con otros sistemas o auditarla, por la vía que cada plataforma habilite | Cruces con el sistema de emisión y auditorías propias |
| B.2.7 | Uso sin restricciones comerciales en la interfaz | Recorrer las pantallas de uso diario y registrar la presencia de avisos de venta | Operación sin interrupciones comerciales |

---

## 4.7 Criterios descartados

Se evaluó su incorporación y se resolvió excluirlos. El motivo común: **no discriminan**. Una capacidad que las tres plataformas resuelven de manera equivalente no aporta información para decidir.

| Criterio considerado | Motivo de la exclusión |
|---|---|
| Cantidad de idiomas disponibles | Las tres superan holgadamente lo necesario; solo importa la calidad del español, evaluada en A.5.5 |
| Estilo de la interfaz de programación | Las tres ofrecen una; el estilo es una preferencia técnica sin consecuencia para el negocio |
| Existencia de tableros visuales | Cubierto por A.5.13, que evalúa la capacidad y no su presentación |
| Navegación por teclado | Diferencia real entre las plataformas, pero sin impacto medible en la operación |
| Gestión de inventario y constructor de sitios web | Funciones ajenas al problema que se busca resolver |

## 4.8 Resumen

| Parte | Categoría | Criterios |
|---|---|:---:|
| A | A.1 Gestión de la cartera de pólizas | 5 |
| A | A.2 Gestión comercial y de marketing | 9 |
| A | A.3 Atención al asegurado | 5 |
| A | A.4 Intercambio de datos y correo | 4 |
| A | A.5 Criterios técnicos de evaluación | 19 |
| | **Subtotal Parte A** | **42** |
| B | B.1 Condiciones del negocio asegurador | 7 |
| B | B.2 Capacidades por encima de lo solicitado | 7 |
| | **Subtotal Parte B** | **14** |
| | **Total** | **56** |
