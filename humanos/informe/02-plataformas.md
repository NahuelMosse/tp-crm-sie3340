# 2. Las tres plataformas evaluadas

## 2.1 Cómo se llegó a estas tres

Se relevaron doce sistemas del mercado y se aplicaron tres condiciones de admisión:

| Condición | Fundamento |
|---|---|
| Utilizable sin costo durante todo el período de evaluación | Permite operar el sistema en profundidad, no limitarse a una demostración |
| Interfaz en español | Los usuarios finales son productores y personal administrativo |
| Obtenible por autogestión, sin intermediación comercial | Evita que la evaluación dependa de la disponibilidad de un vendedor |

Nueve quedaron excluidos:

| Sistema | Motivo de la exclusión |
|---|---|
| Pipedrive, monday CRM | Sin versión gratuita permanente: solo período de prueba |
| Freshsales | El registro exige correo corporativo y su versión gratuita carece de informes y de campos propios |
| EngageBay | Interfaz sin traducción al español |
| Odoo | Su versión gratuita habilita una sola aplicación; incorporar el CRM junto a otra función obliga a licencia |
| SuiteCRM | El español requiere instalar un paquete de idioma por separado, con traducción incompleta |
| Vtiger | Versión gratuita acotada en volumen, orientada a evaluación y no a operación |
| Salesforce | Su edición gratuita es para desarrollo y prohíbe el uso productivo |
| HubSpot | Versión gratuita limitada a dos usuarios, insuficiente para una cartera con varios productores |

Las tres restantes son las que se analizan en este informe.

## 2.2 Las plataformas

## 2.1 EspoCRM 10.0.4 Community — instalación propia

CRM de código abierto bajo licencia AGPL v3, desarrollado desde 2014. Se instala sobre una plataforma PHP con base de datos MySQL o MariaDB, sin límite de usuarios ni de registros impuesto por licencia.

La versión Community incluye la funcionalidad completa de gestión comercial y de atención: cuentas, contactos, prospectos, oportunidades, campañas, listas de segmentación, tickets y base de conocimiento. Su herramienta de parametrización —el Administrador de Entidades— permite crear entidades nuevas y relacionarlas entre sí desde la interfaz de administración.

Queda fuera de la versión gratuita el paquete Advanced Pack, que incorpora el módulo de informes, los flujos de trabajo automatizados y la gestión de procesos de negocio.

## 2.2 Twenty v2.37.4 — instalación propia

CRM de código abierto bajo licencia AGPL v3, con desarrollo iniciado en 2023. Se despliega mediante contenedores sobre Node.js, PostgreSQL y Redis.

Es el más reciente de los tres y su diferencia está en el enfoque: modelo de datos abierto donde los objetos se definen desde la interfaz, interfaz de programación GraphQL y una interfaz de usuario de diseño contemporáneo. No incorpora módulos de campañas, de atención de casos ni de informes.

En la versión instalable no existen funciones reservadas a un plan pago: lo que se comercializa es el servicio de alojamiento gestionado, no funcionalidad adicional.

## 2.3 Bitrix24 plan Free — servicio en la nube

Plataforma comercial de origen ruso, disponible desde 2012, ofrecida como servicio en la nube con un plan gratuito sin vencimiento y sin límite de usuarios.

Excede el alcance de un CRM: integra mensajería, videollamadas, calendario, gestión documental, correo web, proyectos, firma electrónica y constructor de sitios. Su módulo de marketing es el más completo de los tres, con campañas de correo, mensajería y voz, y conexión con audiencias de redes sociales.

El plan gratuito reserva a los planes pagos las automatizaciones de procesos, los informes de CRM, los embudos múltiples y el acceso al mercado de aplicaciones.

## 2.4 Cuadro comparativo de partida

| | EspoCRM | Twenty | Bitrix24 |
|---|---|---|---|
| Modalidad | Instalación propia | Instalación propia | Servicio en la nube |
| Licencia | AGPL v3 | AGPL v3 | Propietaria |
| Año de origen | 2014 | 2023 | 2012 |
| Plataforma | PHP + MySQL | Node.js + PostgreSQL + Redis | No expuesta |
| Usuarios en la versión evaluada | Sin límite | Sin límite | Sin límite |
| Qué habilita el plan pago | Informes, flujos de trabajo | Solo alojamiento gestionado | Automatizaciones, informes, embudos múltiples |

## 2.5 Sobre la comparación entre modalidades distintas

Dos de las plataformas se instalan y una se contrata como servicio. La diferencia no es accesoria: condiciona varias características de forma sistemática.

Una instalación propia otorga control sobre la localización de los datos, sobre el momento de actualizar y sobre la disponibilidad del respaldo, pero traslada a la organización la responsabilidad de sostener la infraestructura. Un servicio en la nube invierte esa relación: elimina el trabajo de operación a cambio de ceder esas tres decisiones al proveedor.

El informe no considera una modalidad superior a la otra. Registra en cada característica cuál de las dos favorece, y en la sección de conclusiones expone en qué condiciones conviene cada una según el perfil de la aseguradora.
