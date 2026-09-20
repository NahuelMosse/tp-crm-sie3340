# 2. Las tres plataformas evaluadas

## 2.1 Cómo se llegó a estas tres

Se relevaron doce sistemas del mercado y se aplicaron tres condiciones de admisión:

| Condición | Fundamento |
|---|---|
| Utilizable sin costo durante todo el período de evaluación | Permite operar el sistema en profundidad, no limitarse a una demostración |
| Interfaz en español | Los usuarios finales son productores y personal administrativo |
| Obtenible por autogestión, sin intermediación comercial | Evita que la evaluación dependa de la disponibilidad de un vendedor |

## 2.2 EspoCRM 10.0.4 Community — instalación propia

CRM de código abierto bajo licencia AGPL v3, desarrollado desde 2014. Se instala sobre una plataforma PHP con base de datos MySQL o MariaDB, sin límite de usuarios ni de registros impuesto por licencia.

La versión Community incluye la funcionalidad completa de gestión comercial y de atención: cuentas, contactos, prospectos, oportunidades, campañas, listas de segmentación, tickets y base de conocimiento. Su herramienta de parametrización —el Administrador de Entidades— permite crear entidades nuevas y relacionarlas entre sí desde la interfaz de administración.

Queda fuera de la versión gratuita el paquete Advanced Pack, que incorpora el módulo de informes, los flujos de trabajo automatizados y la gestión de procesos de negocio.

## 2.3 Twenty v2.37.4 — instalación propia

CRM de código abierto bajo licencia AGPL v3, con desarrollo iniciado en 2023. Se despliega mediante contenedores sobre Node.js, PostgreSQL y Redis.

Es el más reciente de los tres y su diferencia está en el enfoque: modelo de datos abierto donde los objetos se definen desde la interfaz, interfaz de programación GraphQL y una interfaz de usuario de diseño contemporáneo. No incorpora módulos de campañas, de atención de casos ni de informes.

En la versión instalable no existen funciones reservadas a un plan pago: lo que se comercializa es el servicio de alojamiento gestionado, no funcionalidad adicional.

## 2.4 Bitrix24 plan Free — servicio en la nube

Plataforma comercial de origen ruso, disponible desde 2012, ofrecida como servicio en la nube con un plan gratuito sin vencimiento y sin límite de usuarios.

Excede el alcance de un CRM: integra mensajería, videollamadas, calendario, gestión documental, correo web, proyectos, firma electrónica y constructor de sitios. Su módulo de marketing es el más completo de los tres, con campañas de correo, mensajería y voz, y conexión con audiencias de redes sociales.

El plan gratuito reserva a los planes pagos las automatizaciones de procesos, los informes de CRM, los embudos múltiples y el acceso al mercado de aplicaciones.

## 2.5 Los planes comerciales de cada plataforma

El análisis parte de la edición gratuita de cada producto, pero una capacidad ausente allí puede estar disponible en uno o varios planes pagos, y no siempre en el más barato. Por eso se identifican todos.

### EspoCRM

La instalación propia es gratuita y completa. Lo que se comercializa por separado son **extensiones**, de pago único, y un servicio de nube que las incluye.

| Plan | Precio | Qué agrega |
|---|---|---|
| **Community, instalación propia** | **Gratis** | Producto completo. Usuarios y registros sin límite |
| Advanced Pack *(extensión)* | $395, pago único | Informes, flujos de trabajo automatizados y gestión de procesos |
| Sales Pack, Project Management, VoIP, Google, Outlook, MailChimp, Zoom, Stripe *(extensiones)* | Pago único, por separado | Integraciones y módulos de rubro |
| Cloud Basic | $15 por usuario y mes, mínimo 3 | Alojamiento gestionado, todas las extensiones incluidas, hasta 100.000 registros |
| Cloud Enterprise | $25 por usuario y mes, mínimo 5 | Hasta 10.000.000 de registros |
| Cloud Ultimate | $69 por usuario y mes, mínimo 10 | Registros sin límite, dirección de red dedicada y dominio propio |

### Twenty

Es el único de los tres cuya versión gratuita no retiene ninguna capacidad del sistema: los planes pagos venden alojamiento y administración, no funciones.

| Plan | Precio | Qué agrega |
|---|---|---|
| **Autoalojado** | **Gratis** | Producto completo. Sin funciones reservadas |
| Cloud Pro | $9 por usuario y mes, contrato anual | Alojamiento gestionado, aplicaciones propias y asistentes automáticos |
| Cloud Organization | $19 por usuario y mes, contrato anual | Permisos por registro, identificación unificada, dominio propio y atención prioritaria |
| Enterprise | Desde $50.000 por año | Instalación aislada, restricción por dirección de red, alta automática de usuarios y compromiso de servicio |

### Bitrix24

El único que cobra **por organización y no por usuario**, y el único cuyo plan gratuito reserva capacidades del sistema. Cada plan incluye a los anteriores.

| Plan | Precio mensual | Contrato anual | Usuarios | Qué agrega |
|---|---|---|---|---|
| **Free** | **$0** | **$0** | Sin límite | Opera hasta aproximadamente mil registros |
| Basic | $69 | $49 | 5 | Automatizaciones, informes de gestión comercial y embudos múltiples |
| Standard | $144 | $99 | 50 | Marketing ampliado y documentación de la cartera |
| Professional | $289 | $199 | 100 | Gestión de procesos, control de tiempos y registros sin límite |
| Enterprise | $579 o más | $399 o más | 250 o más | Escalado para varias sucursales y control de accesos ampliado |

### Cómo entran los planes en el análisis

**Cuando una capacidad no está en la edición gratuita, se determina en cuáles de los planes sí está**, empezando por el más económico. Puede aparecer en uno y mejorar en otro superior, y esa progresión se registra completa: no alcanza con saber que "se consigue pagando", porque no es lo mismo resolverla con el plan de entrada que necesitar el más caro.

Un plan que solo agrega volumen —más usuarios, más almacenamiento, alojamiento gestionado— no cambia ninguna respuesta del análisis funcional. Su precio entra en la proyección económica como costo del tamaño de la operación.

## 2.6 Cuadro comparativo de partida

| | EspoCRM | Twenty | Bitrix24 |
|---|---|---|---|
| Modalidad | Instalación propia | Instalación propia | Servicio en la nube |
| Licencia | AGPL v3 | AGPL v3 | Propietaria |
| Año de origen | 2014 | 2023 | 2012 |
| Plataforma | PHP + MySQL | Node.js + PostgreSQL + Redis | No expuesta |
| Usuarios en la versión evaluada | Sin límite | Sin límite | Sin límite |
| Qué habilita el plan pago | Informes, flujos de trabajo | Solo alojamiento gestionado | Automatizaciones, informes, embudos múltiples |

## 2.7 Sobre la comparación entre modalidades distintas

Dos de las plataformas se instalan y una se contrata como servicio. La diferencia no es accesoria: condiciona varias características de forma sistemática.

Una instalación propia otorga control sobre la localización de los datos, sobre el momento de actualizar y sobre la disponibilidad del respaldo, pero traslada a la organización la responsabilidad de sostener la infraestructura. Un servicio en la nube invierte esa relación: elimina el trabajo de operación a cambio de ceder esas tres decisiones al proveedor.

El informe no considera una modalidad superior a la otra. Registra en cada característica cuál de las dos favorece, y en la sección de conclusiones expone en qué condiciones conviene cada una según el perfil de la aseguradora.
