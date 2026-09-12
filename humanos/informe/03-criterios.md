# 3. Criterios de evaluación

## 3.1 Cómo se construyó el marco de evaluación

Los criterios provienen de tres fuentes distintas, y esa distinción es relevante porque no todos tienen el mismo peso ni la misma naturaleza.

**Lo que el cliente pidió.** El documento de requerimientos enumera veinte necesidades del negocio asegurador. Son requerimientos funcionales: describen qué debe hacer el sistema. Entran todos, sin excepción, porque constituyen el pedido concreto que se debe satisfacer.

**Lo que la cátedra exige evaluar.** Los trece criterios mínimos de la consigna describen cómo debe comportarse una herramienta con independencia de su función. Son requerimientos no funcionales y se incorporan completos, aunque leídos en clave del rubro: no se evalúa "facilidad de uso" en abstracto sino la facilidad con que un productor de seguros carga una póliza.

**Lo que impone el negocio.** Ni el cliente ni la consigna mencionan la retención de datos a largo plazo o la confidencialidad de información sensible, pero una compañía de seguros no puede operar sin ellas. Estos criterios se incorporaron con su fundamento explícito.

A esas tres fuentes se agrega una cuarta categoría, separada del puntaje: las **capacidades diferenciales** que ninguna fuente solicita pero que aparecieron durante las pruebas y pueden inclinar una decisión entre alternativas parejas.

### Un criterio de redacción

Todos los puntos se enuncian como capacidades a cumplir. Donde podría decirse que un sistema "elimina la cuenta por inactividad", el criterio se formula como **persistencia de los datos sin uso continuo**, y suman los sistemas que la garantizan. La diferencia no es cosmética: un marco enunciado en positivo se puede aplicar a cualquier herramienta futura, mientras que una lista de defectos solo describe a las evaluadas.

### Un criterio de selección

Los veinte requerimientos del cliente y los trece de la cátedra son obligatorios. Para el resto se aplicó una regla: **solo entra el criterio que discrimina**. Si las tres herramientas lo resuelven de manera equivalente, el punto no aporta información para decidir y se documenta sin evaluarse. Bajo esa regla se descartaron, entre otros, la cantidad de idiomas disponibles, el estilo de la interfaz de programación y la existencia de tableros nativos.

---

## 3.2 Criterios funcionales

Cada requerimiento del cliente se tradujo a una capacidad verificable. La columna *criticidad* anticipa la ponderación de la fase siguiente: distingue lo que hace al núcleo del negocio asegurador de lo accesorio.

| ID | Requerimiento del cliente | Capacidad a evaluar | Criticidad |
|---|---|---|---|
| RF-01 | Registrar los datos del solicitante y calificar sus necesidades | Alta de prospecto con campos de calificación del riesgo | Núcleo |
| RF-02 | Seguimiento de pólizas: tipo, estado de pago y posibilidad de cambio | **Modelar la entidad Póliza** con tipo, vigencia, prima y estado de cobranza | Núcleo |
| RF-03 | Gestionar información de ventas y pólizas para captar clientes | Consultar y filtrar la cartera para generar prospección | Núcleo |
| RF-04 | Gestión de corredores: evaluar sus ventas y ver su actividad sobre el cliente | Asignación por agente, medición de producción y registro de actividad | Núcleo |
| RF-05 | Analizar los factores de la competencia | Registrar competidores y motivos de pérdida de negocio | Soporte |
| RF-06 | Conocer nuevas oportunidades a partir de las necesidades del cliente | Pipeline de oportunidades vinculado al asegurado | Núcleo |
| RF-07 | Centralizar la información y centrar la organización en el cliente | Ficha integral: datos, pólizas, actividad, correos y reclamos | Núcleo |
| RF-08 | Optimizar las actividades de los vendedores | Agenda, recordatorios y carga de trabajo por vendedor | Soporte |
| RF-09 | Pronosticar los movimientos comerciales | Proyección de ventas por etapa, probabilidad y monto | Soporte |
| RF-10 | Diseñar campañas personalizables y analizar las realizadas | Envío masivo segmentado con métricas de resultado | Soporte |
| RF-11 | Segmentación de clientes | Segmentos por criterios, reutilizables | Núcleo |
| RF-12 | Manejar quejas y reclamaciones | Gestión de casos con estado, responsable y seguimiento | Núcleo |
| RF-13 | Conocer clientes y competencia presentes en redes sociales | Captación de prospectos desde redes sociales | Soporte |
| RF-14 | Mejorar imagen y reputación a partir de opiniones en redes | Publicación y escucha de menciones | Accesorio |
| RF-15 | Mejorar la calidad del servicio y la atención | Historial de interacción y base de conocimiento | Soporte |
| RF-16 | Conocer y agrupar la información de los clientes | Agrupamiento y vistas por categoría | Soporte |
| RF-17 | Gestionar las pólizas y generar nuevas oportunidades de venta | Operación masiva sobre la cartera y venta cruzada | Núcleo |
| RF-18 | Importar contactos desde Excel, Gmail y Outlook | Importación desde los tres orígenes solicitados | Soporte |
| RF-19 | Sincronizar el correo de la empresa con las fichas de clientes | Sincronización multiusuario con vinculación automática | Núcleo |
| RF-20 | Crear tareas y asignarlas a personas de la empresa | Tareas con responsable, vencimiento y estado | Soporte |

### Observación sobre la interdependencia de RF-02, RF-03 y RF-17

Los tres requerimientos giran alrededor de la póliza, que ninguno de los sistemas evaluados incorpora como módulo nativo. Su cumplimiento depende por completo de la capacidad de parametrización de cada herramienta —el criterio NF-06—, que es lo que permite crear entidades propias y relacionarlas con el resto del modelo.

Esta dependencia es la observación central del análisis: **en el rubro asegurador, la parametrización deja de ser un criterio técnico de segundo orden y se convierte en la condición que habilita el núcleo del negocio.** Un CRM que no permita modelar la póliza es inaplicable, por completo que sea su resto de funcionalidades.

---

## 3.3 Criterios no funcionales

### 3.3.1 Los criterios mínimos de la cátedra, aplicados al rubro

| ID | Criterio | Lectura en clave aseguradora |
|---|---|---|
| NF-01 | Restricciones tecnológicas | Infraestructura necesaria para sostenerlo en una aseguradora pequeña |
| NF-02 | Instalación y configuración | Tiempo y complejidad hasta tener el sistema operativo |
| NF-03 | Menú y navegabilidad | Pasos que exige la operación diaria: cargar un asegurado y su póliza |
| NF-04 | Interfaz y facilidad de aprendizaje | Autonomía de un productor nuevo sin capacitación previa |
| NF-05 | Usuarios concurrentes | Varios corredores operando sobre la misma cartera simultáneamente |
| NF-06 | **Parametrización** | **Modelar pólizas, siniestros y coberturas sin programar** |
| NF-07 | Importación y exportación | Migrar la cartera existente sin pérdida de información |
| NF-08 | Seguridad, roles y auditoría | Que cada corredor acceda solo a su cartera y quede registro de las modificaciones |
| NF-09 | Explotación de datos | Indicadores de producción, siniestralidad y cobranza |
| NF-10 | Reportes | Informes de producción por agente y de vencimientos próximos |
| NF-11 | Interfaz con otras aplicaciones | Conexión con los sistemas de emisión y facturación |
| NF-12 | Posibilidades de integración | Ecosistema disponible para crecer |
| NF-13 | Soporte y capacitación | Recursos disponibles ante una falla en producción |

### 3.3.2 Criterios derivados de lo que pidió el cliente

Tres condiciones que el cliente no enuncia como tales pero que se desprenden de sus propios requerimientos.

| ID | Origen en el pedido del cliente | Capacidad a evaluar |
|---|---|---|
| NF-14 | "Sincronizar el email de **todos** en tu empresa" | Sincronización de correo que escale a toda la organización, no a una casilla individual |
| NF-15 | "Centralizar la información y centrar a la organización alrededor del cliente" | Integridad de la ficha única: impedir que un mismo asegurado se cargue dos veces |
| NF-18 | "Ver todas las actividades que los agentes realizan en torno al cliente" | Trazabilidad de la actividad por usuario, no solo del estado final del dato |

### 3.3.3 Criterios impuestos por el negocio asegurador

Ninguna de las fuentes anteriores los menciona; el rubro los vuelve indispensables.

| ID | Capacidad a evaluar | Fundamento |
|---|---|---|
| NF-20 | **Persistencia de los datos sin uso continuo** | Una póliza de vida permanece vigente durante décadas. La cartera no puede depender de que alguien acceda al sistema con cierta frecuencia |
| NF-21 | **Búsqueda y operación con volumen productivo** | Una aseguradora pequeña administra decenas de miles de pólizas; el sistema debe seguir localizando un asegurado con ese volumen |
| NF-22 | **Control sobre la localización de los datos** | Los seguros de salud involucran datos sensibles alcanzados por la Ley 25.326 de Protección de Datos Personales |
| NF-24 | **Continuidad y respaldo bajo control propio** | La indisponibilidad del CRM interrumpe la emisión de pólizas y la atención de siniestros |
| NF-26 | **Autonomía frente al proveedor** | Posibilidad de migrar o continuar operando sin depender de decisiones de un tercero |

---

## 3.4 Capacidades diferenciales

Funciones que ninguna fuente solicita, detectadas durante las pruebas. Se evalúan por separado y no se suman al puntaje principal: su función es desempatar entre alternativas equivalentes y aportar argumentos cualitativos a la propuesta final. Se incorporaron únicamente las que tienen aplicación concreta en el negocio asegurador.

| ID | Capacidad | Aplicación en una aseguradora |
|---|---|---|
| NR-01 | Asistente de inteligencia artificial incluido | Resumir el historial de un siniestro, redactar la respuesta a un reclamo |
| NR-02 | Suite de trabajo integrada | El corredor opera todo el día en una sola herramienta; la firma electrónica aplica a la póliza |
| NR-03 | Aplicación móvil nativa | El productor visita al cliente y registra la operación en el momento |
| NR-04 | Localización completa al español, incluido el modelo de datos | Afecta directamente la adopción por parte de usuarios no técnicos |
| NR-05 | Detección de registros duplicados | Evita la doble ficha del mismo asegurado, el error más costoso de una cartera |
| NR-06 | Base de conocimiento interna | Condiciones de cobertura y procedimientos accesibles para quien atiende |
| NR-07 | Acceso directo a la base de datos | Permite cruzar información con el sistema de emisión y auditar por cuenta propia |
| NR-08 | Automatización de procesos incluida | Notificar vencimientos de póliza sin intervención manual |
| NR-09 | Uso sin restricciones comerciales en la interfaz | Operación sin avisos de venta permanentes en pantalla |
| NR-10 | Reportes disponibles sin costo adicional | Medir producción sin requerir una compra adicional |

---

## 3.5 Método de verificación

Cada criterio se comprobó operando los sistemas, no consultando su documentación comercial. Las pruebas se automatizaron para que el mismo procedimiento se ejecute sobre las tres herramientas y produzca registros comparables.

Toda afirmación del informe indica su origen mediante una referencia:

| Referencia | Significado |
|---|---|
| `[REQ]` | Frase textual del documento de requerimientos |
| `[CONS n]` | Criterio n de la consigna de la cátedra |
| `[UI:sistema ruta]` | Comprobado en la instalación, con captura de pantalla |
| `[API:método]` | Ejecutado contra la interfaz de programación, con su respuesta |
| `[TEST:id]` | Demostrado mediante prueba automatizada, con video |
| `[DOC:url]` | Documentación oficial del fabricante, no verificado por el grupo |
| `[RUBRO]` | Derivado de las características del negocio asegurador |

La distinción entre `[UI]`, `[API]` y `[TEST]` por un lado y `[DOC]` por el otro es deliberada. Lo que el fabricante declara en su documentación se consigna como tal y no se presenta como hecho comprobado. Durante las pruebas se registraron diferencias entre ambas fuentes, lo que justifica mantener la distinción.
