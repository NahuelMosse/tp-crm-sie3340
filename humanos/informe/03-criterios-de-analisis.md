# 3. Criterios de análisis

Esta sección define **qué se evalúa**. Cada criterio se enuncia como una capacidad, se indica de dónde proviene y qué demuestra su cumplimiento. La escala con que se puntúa está en la sección 8; los resultados, en las secciones 4 y 5.

## 3.1 De dónde provienen

Los criterios tienen tres orígenes, y la distinción determina su peso en el resultado.

**El pedido del cliente.** Veinte requerimientos relevados, en lenguaje de negocio. Describen qué debe hacer el sistema. Entran todos, sin excepción.

**El marco técnico de evaluación de software.** Trece criterios que describen cómo debe comportarse una herramienta con independencia de su función: restricciones tecnológicas, instalación, navegabilidad, usabilidad, concurrencia, parametrización, intercambio de datos, seguridad, explotación de la información, reportes, interfaces, integración y soporte. Se incorporan completos, leídos en clave del rubro.

**El negocio asegurador.** Condiciones que ninguna de las dos fuentes anteriores menciona pero que una compañía de seguros no puede ignorar. Se incorporan con su fundamento explícito.

A esas tres se suma lo que apareció al operar los sistemas: **capacidades que las plataformas ofrecen por encima de lo pedido**.

## 3.2 Por qué se dividen en dos partes

Los criterios se agrupan en dos conjuntos que no se mezclan:

| Parte | Contiene | Peso |
|---|---|:---:|
| **A — Solicitados** | Pedido del cliente + marco técnico de evaluación | 85 % |
| **B — No solicitados** | Condiciones del negocio + capacidades por encima de lo pedido | 15 % |

La separación responde a un riesgo concreto. Una plataforma puede ofrecer inteligencia artificial, aplicación móvil y telefonía integrada —ninguna solicitada— y compensar con eso el incumplimiento de algo que la compañía sí necesita. Con los conjuntos separados y ponderados, ese intercambio no es posible: cubrir la totalidad de la Parte B no alcanza para superar a quien cubre la Parte A.

## 3.3 Del requerimiento al criterio verificable

Los requerimientos del cliente están escritos en lenguaje de negocio y no son verificables tal como se enuncian. *"Mejora de la calidad del servicio y la atención al cliente"* no admite una comprobación: no hay forma de determinar si un sistema la cumple.

El trabajo previo a la evaluación consistió en traducirlos a capacidades comprobables, aplicando una regla: **si un requerimiento admite verificaciones independientes, se divide hasta que cada criterio tenga una sola respuesta posible.**

> **Ejemplo.** El requerimiento *"seguimiento de pólizas: qué tipo tiene, el estado de pago y si hay posibilidad de cambio"* no se evalúa como una unidad. Se descompone en el modelado de la póliza como objeto, los tipos de dato que admite para prima y vigencia, su vinculación con el asegurado y la conservación de su historial. Cada uno se comprueba por separado y recibe su propio valor.

Esa descomposición lleva los veinte requerimientos del pedido —sumados a los trece del marco técnico— a los cuarenta y dos criterios de la Parte A.

---

## 3.4 Parte A — Criterios solicitados

### A.1 Gestión de la cartera de pólizas

Derivan de los requerimientos de seguimiento de pólizas, gestión de la información de ventas y administración de la cartera para generar venta cruzada.

| ID | Criterio | Qué se comprueba | Criticidad |
|---|---|---|:---:|
| A.1.1 | Modelado de la póliza como objeto propio | Que el sistema permita representar la póliza como una entidad con identidad propia, no como un campo de texto dentro del contacto | Núcleo |
| A.1.2 | Tipos de dato adecuados para prima, vigencia y cobranza | Que admita importe con moneda, rango de fechas y estado seleccionable de una lista | Núcleo |
| A.1.3 | Vinculación de la póliza con el asegurado | Que la relación sea navegable en ambos sentidos: desde el asegurado se ven sus pólizas y desde la póliza su titular | Núcleo |
| A.1.4 | Consulta y filtrado de la cartera para prospección | Que permita obtener el subconjunto de pólizas que cumple una condición, por ejemplo las que vencen en un plazo dado | Núcleo |
| A.1.5 | Operación masiva sobre la cartera | Que permita modificar varios registros en una sola acción, sin recorrerlos de a uno | Soporte |

### A.2 Gestión comercial y de marketing

Derivan de los requerimientos de registro y calificación del solicitante, detección de oportunidades, campañas, segmentación, análisis de competencia, pronóstico y presencia en redes.

| ID | Criterio | Qué se comprueba | Criticidad |
|---|---|---|:---:|
| A.2.1 | Registro y calificación del solicitante | Que permita registrar a quien solicita una cobertura junto con los datos que determinan su perfil de riesgo | Núcleo |
| A.2.2 | Embudo de oportunidades vinculado al asegurado | Que la oportunidad de venta exista como objeto con etapas, asociada al asegurado | Núcleo |
| A.2.3 | Embudos múltiples por ramo | Que admita procesos de venta distintos según el tipo de cobertura, con etapas propias | Soporte |
| A.2.4 | Segmentación reutilizable de la cartera | Que un conjunto de asegurados definido por criterios pueda guardarse y volver a usarse | Núcleo |
| A.2.5 | Campañas con medición de resultados | Que permita enviar comunicaciones masivas y registrar qué ocurrió con ellas | Soporte |
| A.2.6 | Captación de prospectos desde redes sociales | Que exista conexión con alguna red social que permita incorporar interesados al sistema | Soporte |
| A.2.7 | Escucha de menciones y reputación | Que permita conocer lo que se dice de la compañía en canales públicos | Accesorio |
| A.2.8 | Proyección de ventas | Que estime el resultado comercial futuro a partir de las oportunidades en curso | Soporte |
| A.2.9 | Registro de la competencia y motivos de pérdida | Que permita consignar por qué se perdió un negocio y ante quién | Soporte |

### A.3 Atención al asegurado

Derivan de los requerimientos de manejo de quejas y reclamaciones, centralización de la información, mejora de la atención, creación de tareas y optimización de la actividad comercial.

| ID | Criterio | Qué se comprueba | Criticidad |
|---|---|---|:---:|
| A.3.1 | Gestión de reclamos como casos con seguimiento | Que el reclamo exista como objeto con estado, responsable y fecha, no como una nota | Núcleo |
| A.3.2 | Ficha integral del asegurado | Que desde la ficha se acceda a sus pólizas, su actividad, sus comunicaciones y sus reclamos sin navegar a otra pantalla | Núcleo |
| A.3.3 | Base de conocimiento para la atención | Que exista un repositorio consultable de condiciones y procedimientos | Soporte |
| A.3.4 | Tareas con responsable y vencimiento | Que una tarea pueda asignarse a otro usuario con fecha de vencimiento y estado | Soporte |
| A.3.5 | Agenda y carga de trabajo por productor | Que cada usuario disponga de una vista de sus pendientes y compromisos | Soporte |

### A.4 Intercambio de datos y correo

Derivan de los requerimientos de importación de contactos y sincronización del correo con las fichas.

| ID | Criterio | Qué se comprueba | Criticidad |
|---|---|---|:---:|
| A.4.1 | Importación desde los formatos que usa el cliente | Que admita los orígenes solicitados: planilla de cálculo, correo electrónico y agenda de contactos | Soporte |
| A.4.2 | Sincronización de correo multiusuario | Que la sincronización alcance a las casillas de todos los usuarios, no a una sola | Núcleo |
| A.4.3 | Vinculación automática del correo a la ficha | Que un mensaje intercambiado con un asegurado quede registrado en su ficha sin acción manual | Núcleo |
| A.4.4 | Exportación de la cartera sin pérdida de datos | Que la información pueda extraerse completa y en formato abierto | Soporte |

### A.5 Criterios técnicos de evaluación

Corresponden al marco técnico, leídos en clave del negocio asegurador.

| ID | Criterio | Qué se comprueba | Criticidad |
|---|---|---|:---:|
| A.5.1 | Requerimientos de infraestructura moderados | Que la infraestructura necesaria esté al alcance de una compañía pequeña | Soporte |
| A.5.2 | Instalación guiada sin conocimientos técnicos | Que la puesta en marcha no exija un perfil especializado | Soporte |
| A.5.3 | Navegabilidad: pocos pasos para la operación diaria | Cantidad de acciones necesarias para registrar un asegurado con su póliza | Soporte |
| A.5.4 | Aprendizaje sin capacitación previa | Que un usuario nuevo complete las tareas frecuentes sin instrucción | Soporte |
| A.5.5 | Localización completa al español, modelo incluido | Que la traducción alcance a los nombres de los objetos del sistema y no solo a los botones | Núcleo |
| A.5.6 | Operación concurrente sobre la misma cartera | Comportamiento del sistema cuando varios usuarios trabajan sobre el mismo registro | Núcleo |
| A.5.7 | Creación de entidades sin programar | Que puedan definirse objetos nuevos desde la administración | Núcleo |
| A.5.8 | Relaciones entre entidades desde la interfaz | Que los objetos creados puedan vincularse entre sí sin desarrollo | Núcleo |
| A.5.9 | Campos calculados sobre datos propios | Que un valor pueda derivarse de otros, por ejemplo el vencimiento a partir del inicio de vigencia | Soporte |
| A.5.10 | Automatización de procesos | Que el sistema ejecute acciones ante un evento, sin intervención | Soporte |
| A.5.11 | Restricción de la cartera por productor | Que un usuario acceda solo a los asegurados que le corresponden | Núcleo |
| A.5.12 | Registro de quién modificó cada dato | Que quede constancia de autor y momento de cada cambio | Núcleo |
| A.5.13 | Indicadores de producción y cobranza | Que ofrezca visualizaciones del estado del negocio | Soporte |
| A.5.14 | Generación de informes | Que permita producir informes con criterios definidos por el usuario | Soporte |
| A.5.15 | Interfaz de programación sin restricciones de uso | Que exista una interfaz de programación y que su uso no esté limitado por volumen | Soporte |
| A.5.16 | Ecosistema de integraciones disponible | Que existan conectores con otras herramientas del mercado | Soporte |
| A.5.17 | Documentación en español | Que la documentación oficial esté disponible en el idioma de los usuarios | Soporte |
| A.5.18 | Comunidad activa de usuarios | Que exista un espacio donde consultar problemas y obtener respuesta | Soporte |
| A.5.19 | Soporte técnico con compromiso de respuesta | Que exista un canal de soporte con plazo comprometido | Soporte |

---

## 3.5 Parte B — Criterios no solicitados

### B.1 Condiciones que impone el negocio asegurador

Ninguna aparece en el pedido, pero una compañía de seguros no puede operar sin resolverlas. Se incorporan con su fundamento.

| ID | Criterio | Fundamento |
|---|---|---|
| B.1.1 | Persistencia de los datos sin uso continuo | Una póliza permanece vigente durante años aunque nadie la consulte; la cartera no puede depender de la frecuencia de acceso al sistema |
| B.1.2 | Respaldo bajo control de la organización | La cartera es el activo principal de la compañía y su resguardo no debería depender de un tercero |
| B.1.3 | Búsqueda y operación con volumen productivo | Una compañía pequeña administra decenas de miles de pólizas; el sistema debe seguir localizando un asegurado con ese volumen |
| B.1.4 | Control sobre el momento de actualizar | Una actualización aplicada durante la operación interrumpe la atención |
| B.1.5 | Control sobre la localización de los datos | Los seguros de personas involucran datos sensibles alcanzados por la Ley 25.326 de Protección de Datos Personales |
| B.1.6 | Integridad de la ficha única del asegurado | La duplicación de fichas es el error más costoso en la administración de una cartera |
| B.1.7 | Operación sin conexión a internet | La atención no debería interrumpirse ante una caída del enlace |

### B.2 Capacidades por encima de lo solicitado

Funciones detectadas al operar los sistemas, que el cliente no pidió y tienen aplicación en el rubro.

| ID | Criterio | Aplicación en una compañía de seguros |
|---|---|---|
| B.2.1 | Asistente de inteligencia artificial | Resumir el historial de un asegurado o redactar la respuesta a un reclamo |
| B.2.2 | Aplicación móvil nativa | El productor registra la operación durante la visita al cliente |
| B.2.3 | Suite de trabajo integrada | Mensajería, documentos y firma electrónica en el mismo entorno de trabajo |
| B.2.4 | Telefonía y videollamada integradas | Atención del asegurado sin cambiar de herramienta |
| B.2.5 | Detección de registros duplicados al cargar | Evita la doble ficha antes de que se produzca, en lugar de corregirla después |
| B.2.6 | Acceso directo a la base de datos | Permite cruces con otros sistemas de la compañía y auditorías propias |
| B.2.7 | Uso sin restricciones comerciales en la interfaz | Operación sin avisos de venta permanentes en pantalla |

---

## 3.6 Criterios descartados

Se evaluó su incorporación y se resolvió excluirlos. El motivo común: **no discriminan**. Una capacidad que las tres plataformas resuelven de manera equivalente no aporta información para decidir, y agregarla solo diluye el resultado.

| Criterio considerado | Motivo de la exclusión |
|---|---|
| Cantidad de idiomas disponibles | Las tres superan holgadamente lo necesario; solo importa la calidad del español, que sí se evalúa en A.5.5 |
| Estilo de la interfaz de programación | Las tres ofrecen una; el estilo es una preferencia técnica sin consecuencia para el negocio |
| Existencia de tableros visuales | Cubierto por A.5.13, que evalúa la capacidad y no su presentación |
| Navegación por teclado | Diferencia real entre las plataformas, pero sin impacto medible en la operación de una aseguradora |
| Gestión de inventario y constructor de sitios web | Funciones ajenas al problema que se busca resolver |

## 3.7 Resumen

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
