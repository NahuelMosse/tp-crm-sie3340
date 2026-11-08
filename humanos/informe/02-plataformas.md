# 2. Las tres plataformas evaluadas

## 2.1 Cómo se llegó a estas tres

Se relevaron doce sistemas del mercado (Odoo CRM, EspoCRM, Salesforce en su edición para desarrolladores, Dolibarr, YetiForce, SuiteCRM, HubSpot CRM, Zoho CRM, Twenty, Vtiger, Krayin y Bitrix24) y se les aplicaron tres condiciones de admisión:

| Condición | Fundamento |
|---|---|
| Utilizable sin costo durante todo el período de evaluación | Permite operar el sistema en profundidad, no limitarse a una demostración |
| Interfaz en español | Los usuarios finales son productores y personal administrativo |
| Obtenible por autogestión, sin intermediación comercial | Evita que la evaluación dependa de la disponibilidad de un vendedor |

## 2.2 EspoCRM 10.0.4 Community — instalación propia

CRM de código abierto bajo licencia AGPL v3, desarrollado desde 2014. Se instala sobre una plataforma PHP con base de datos MySQL, MariaDB o PostgreSQL, sin límite de usuarios ni de registros impuesto por licencia.

La versión Community incluye la funcionalidad completa de gestión comercial y de atención: cuentas, contactos, prospectos, oportunidades, campañas, listas de segmentación, tickets y base de conocimiento. Su herramienta de parametrización, el Administrador de Entidades, permite crear entidades nuevas y relacionarlas entre sí desde la interfaz de administración. Queda fuera de la versión gratuita el paquete Advanced Pack, que incorpora el módulo de informes, los flujos de trabajo automatizados y la gestión de procesos de negocio.

## 2.3 Twenty v2.37.4 — instalación propia

CRM de código abierto bajo licencia AGPL v3, con desarrollo iniciado en 2023. Se despliega mediante contenedores sobre Node.js, PostgreSQL y Redis.

Es el más reciente de los tres y se distingue por su enfoque: un modelo de datos abierto donde los objetos se definen desde la interfaz, una interfaz de programación GraphQL y una interfaz de usuario de diseño contemporáneo. No incorpora módulos de campañas ni de atención de casos, y los informes se arman como gráficos en tableros. En la versión instalable casi no hay funciones reservadas a un plan pago, porque lo que se comercializa es sobre todo el alojamiento gestionado. La excepción relevante es restringir qué registros ve cada usuario, que exige el plan Organization.

## 2.4 Bitrix24 plan Free — servicio en la nube

Plataforma comercial de origen ruso, disponible desde 2012, ofrecida como servicio en la nube con un plan gratuito sin vencimiento y sin límite de usuarios.

Excede el alcance de un CRM: integra mensajería, videollamadas, calendario, gestión documental, correo web, proyectos, firma electrónica y constructor de sitios. En sus planes pagos, su módulo de marketing es el más completo de los tres, con campañas de correo, mensajería y voz, y conexión con audiencias de redes sociales; el plan gratuito no incluye las campañas de correo. Sí trae reglas de automatización y el asistente de informes del CRM, con límites. Los embudos múltiples, el correo conectado, la exportación de datos y la instalación de aplicaciones del catálogo quedan para los planes pagos.

## 2.5 Los planes comerciales de cada plataforma

Se evalúa la versión gratuita de cada producto, que es la marcada en negrita en cada tabla. Una capacidad ausente en ella puede estar disponible en uno o varios planes pagos, y no siempre en el más barato. Por eso se identifican todos, aunque lo que agregan se informe como comentario y no puntúe.

### EspoCRM

La instalación propia es gratuita y completa. Por separado se comercializan **extensiones**, con licencia anual por instalación que hay que renovar para seguir usándolas, y un servicio de nube que las incluye.

| Plan | Precio | Qué agrega |
|---|---|---|
| **Community, instalación propia** | **Gratis** | Producto completo. Usuarios y registros sin límite |
| Advanced Pack *(extensión)* | $395 por año y por instalación | Informes, flujos de trabajo automatizados y gestión de procesos |
| Intelligence *(extensión)* | $129 por año y por instalación | Asistente de inteligencia artificial |
| VoIP Integration y Zoom Integration *(extensiones)* | $388 y $110 por año y por instalación | Telefonía y videollamada desde el sistema |
| Sales Pack, Project Management, Google, Outlook, MailChimp, Stripe *(extensiones)* | Licencia anual cada una, por separado | Integraciones y módulos de rubro |
| Cloud Basic | $15 por usuario y mes, mínimo 3 | Alojamiento gestionado, todas las extensiones incluidas, hasta 100.000 registros |
| Cloud Enterprise | $25 por usuario y mes, mínimo 5 | Hasta 10.000.000 de registros |
| Cloud Ultimate | $69 por usuario y mes, mínimo 10 | Registros sin límite, dirección de red dedicada y dominio propio |

### Twenty

Es el que menos capacidades retiene en su versión gratuita: los planes pagos venden sobre todo alojamiento y administración. La restricción de registros por usuario, en cambio, exige el plan Organization.

| Plan | Precio | Qué agrega |
|---|---|---|
| **Autoalojado** | **Gratis** | Producto completo, salvo los permisos por registro |
| Cloud Pro | $9 por usuario y mes, contrato anual | Alojamiento gestionado, aplicaciones propias y asistentes automáticos |
| Cloud Organization | $39 por usuario y mes, contrato anual | Permisos por registro, identificación unificada, dominio propio y atención prioritaria |
| Enterprise | Desde $50.000 por año | Instalación aislada, restricción por dirección de red, alta automática de usuarios y compromiso de servicio |

### Bitrix24

Es el único que cobra **por organización y no por usuario**, y el que más capacidades reserva a los planes pagos. Cada plan incluye a los anteriores.

| Plan | Precio mensual | Contrato anual | Usuarios | Qué agrega |
|---|---|---|---|---|
| **Free** | **$0** | **$0** | Sin límite | Busca y filtra hasta mil negociaciones y mil contactos |
| Basic | $69 | $49 | 5 | Embudos múltiples, correo conectado, exportación de datos, restricción de la cartera por usuario y aplicaciones del catálogo |
| Basic Vibe+ | $89 | $59 | 5 | Lo del Basic, más la interfaz de programación para conectar otros sistemas |
| Standard | $144 | $99 | 50 | Marketing ampliado y documentación de la cartera |
| Professional | $289 | $199 | 100 | Gestión de procesos, control de tiempos y registros sin límite |
| Enterprise | $579 o más | $399 o más | 250 o más | Escalado para varias sucursales y control de accesos ampliado |

### Cómo entran los planes en el análisis

El puntaje es el de la versión evaluada. Cuando una capacidad no está en ella, se determina en cuáles de los planes sí está, empezando por el más económico, y se consigna como comentario junto al criterio. Puede aparecer en uno y mejorar en otro superior, y esa progresión se registra completa, porque no es lo mismo resolverla con el plan de entrada que necesitar el más caro. Un plan que solo agrega volumen (más usuarios, más almacenamiento, alojamiento gestionado) no cambia ninguna respuesta del análisis funcional.

## 2.6 Cuadro comparativo de partida

| | EspoCRM | Twenty | Bitrix24 |
|---|---|---|---|
| Modalidad | Instalación propia | Instalación propia | Servicio en la nube |
| Licencia | AGPL v3 | AGPL v3 | Propietaria |
| Año de origen | 2014 | 2023 | 2012 |
| Plataforma | PHP + MySQL, MariaDB o PostgreSQL | Node.js + PostgreSQL + Redis | No expuesta |
| Usuarios en la versión evaluada | Sin límite | Sin límite | Sin límite |
| Qué habilita el plan pago | Informes, flujos de trabajo | Alojamiento gestionado y permisos por registro | Embudos múltiples, correo, exportación, permisos por usuario |

## 2.7 Sobre la comparación entre modalidades distintas

Dos de las plataformas se instalan y una se contrata como servicio, y esa diferencia condiciona varias características de forma sistemática. Una instalación propia otorga control sobre la localización de los datos, sobre el momento de actualizar y sobre la disponibilidad del respaldo, pero traslada a la organización la responsabilidad de sostener la infraestructura. Un servicio en la nube invierte esa relación: elimina el trabajo de operación a cambio de ceder esas tres decisiones al proveedor.

El informe no considera una modalidad superior a la otra. Registra en cada característica cuál de las dos favorece, y en la sección de conclusiones expone en qué condiciones conviene cada una según el perfil de la aseguradora.
