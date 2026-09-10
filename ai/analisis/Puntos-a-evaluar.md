# Puntos a evaluar — Fase 1

**Caso de estudio: compañía de seguros** *(definido por la cátedra en `Requerimientos-TP-SIE3340.pdf`, no es una elección del grupo).*

Este documento define **qué se va a evaluar**. La escala de puntuación se define en la Fase 2.

---

## Trazabilidad

Cada punto dice de dónde salió. Jerarquía: **lo verificado en la instancia vale más que lo que dice el fabricante.**

| Código | Significa |
|---|---|
| `[REQ]` | Frase textual del PDF de requerimientos |
| `[CONS n]` | Criterio n de la consigna |
| `[UI:app ruta]` | **Visto en la instancia** con captura |
| `[DOC:url]` | Documentación oficial, sin verificar en la instancia |
| `[API:método]` | Verificado por API |
| `[TEST:id]` | Demostrado por un test automatizado con video |
| `[RUBRO]` | Derivado del negocio asegurador |

Estado de cada celda: **✔ verificado** en la instancia · **◻ por verificar** · **✖ confirmado que no está**

---

# TABLA 1 — Requerimientos funcionales

Qué tiene que **hacer** el sistema. Origen: `[REQ]`.

| ID | Requerimiento textual del cliente | Qué significa en un CRM | Cómo se verifica | Criticidad |
|---|---|---|---|---|
| **RF-01** | *"Cuando un cliente quiere solicitar una póliza, registrar todos los datos y calificar sus necesidades para concretar la venta"* | Alta de prospecto con datos de contacto + campos de calificación (necesidad, capacidad de pago, tipo de cobertura buscada) | Crear un lead con campos custom de calificación y convertirlo en oportunidad | Núcleo |
| **RF-02** | *"Seguimiento de pólizas. Qué tipo de póliza tiene, el estado de pago y si hay posibilidad de cambio"* | **Entidad Póliza** con tipo, vigencia, prima, estado de cobranza, relacionada al asegurado, con historial | ¿Se puede crear una entidad nueva sin programar? ¿Se relaciona a Contacto? ¿Tiene estados? ¿Guarda historial? | Núcleo |
| **RF-03** | *"Gestionar una amplia fuente de información sobre ventas y pólizas para captar nuevos clientes"* | Base consultable y filtrable de ventas y pólizas → listas para prospección | Filtrar pólizas por tipo/vencimiento y generar una lista de contactos a partir del filtro | Núcleo |
| **RF-04** | *"Gestión de corredores y agentes. Evaluar las ventas por parte de los empleados y ver todas las actividades que realizan en torno al cliente"* | Usuarios con rol agente, oportunidades asignadas, ranking por vendedor y timeline de actividad por cliente | Crear 2 agentes, asignarles oportunidades, ver el total por agente y el historial de actividad sobre un cliente | Núcleo |
| **RF-05** | *"Analizar los factores de la competencia"* | Registro de competidores y del motivo de pérdida de una oportunidad | ¿Hay entidad Competidor o campo "motivo de pérdida" configurable? | Soporte |
| **RF-06** | *"Conocer nuevas oportunidades de negocio a partir de las necesidades de clientes y prospectos"* | Pipeline de oportunidades vinculado al cliente, con detección de venta cruzada | Crear una oportunidad desde un cliente existente y verla en el embudo | Núcleo |
| **RF-07** | *"Conocer la información del cliente, centralizarla y centrar a la organización alrededor del cliente"* | Ficha 360°: datos, pólizas, actividad, correos y reclamos en una sola pantalla | Abrir un cliente y contar cuánta información contextual muestra sin navegar a otro lado | Núcleo |
| **RF-08** | *"Optimizar las actividades de los vendedores"* | Tareas, recordatorios y agenda por vendedor | Crear una tarea, asignarla y verla en la agenda del asignado | Soporte |
| **RF-09** | *"Pronosticar todos los movimientos comerciales"* | Forecast de ventas por etapa, probabilidad y monto esperado | ¿Existe forecast nativo? ¿El embudo suma montos por etapa? | Soporte |
| **RF-10** | *"Diseñar campañas de marketing personalizables. Análisis de campañas realizadas"* | Módulo de campañas con envío masivo, plantillas y métricas de apertura y clicks | Crear una campaña, ver si registra envíos, aperturas y clicks | Soporte |
| **RF-11** | *"Segmentación de clientes"* | Listas o segmentos por criterios, estáticos o dinámicos | Crear un segmento "asegurados con póliza por vencer" y guardarlo | Núcleo |
| **RF-12** | *"Manejar quejas y reclamaciones"* | Módulo de casos/tickets con estado, responsable y SLA, vinculado al cliente | Crear un reclamo asociado a un cliente y seguir su estado | Núcleo |
| **RF-13** | *"Información de los clientes y conseguir nuevos, así como conocer a la competencia que esté presente en las redes"* | Conectores de redes sociales para captación y escucha | ¿Hay integración con Facebook, Instagram u otra red para captar leads? | Soporte |
| **RF-14** | *"Cambiar la imagen y reputación a partir de las opiniones y comentarios de los clientes y tener mayor repercusión en las redes"* | Publicación y monitoreo de menciones y comentarios | ¿Permite publicar o monitorear menciones? | Accesorio |
| **RF-15** | *"Mejora de la calidad del servicio y la atención al cliente"* | Historial de interacciones, plantillas de respuesta, base de conocimiento | ¿Hay base de conocimiento o plantillas de respuesta? | Soporte |
| **RF-16** | *"Conocer y agrupar la información de los clientes"* | Agrupamiento por categoría, etiquetas, vistas agrupadas *(se superpone con RF-07 y RF-11)* | Agrupar la lista de clientes por un campo y ver totales | Soporte |
| **RF-17** | *"Gestionar de manera eficaz todas las pólizas de los clientes y generar nuevas oportunidades de venta"* | Operación masiva sobre pólizas + generación de oportunidad desde una póliza *(se superpone con RF-02 y RF-06)* | Editar varias pólizas a la vez y crear una oportunidad desde una | Núcleo |
| **RF-18** | *"Importar contactos desde Excel, Gmail y Outlook"* | Importación desde los **tres** orígenes, no solo CSV | Importar un .xlsx, conectar Gmail y conectar Outlook | Soporte |
| **RF-19** | *"Sincronizar el email de todos en tu empresa para que se guarde automáticamente en las fichas de los clientes"* | Sincronización IMAP multiusuario con vinculación automática del correo a la ficha | Configurar una casilla, enviar un correo y ver si aparece en la ficha del cliente | Núcleo |
| **RF-20** | *"Crear tareas y asignar a personas de la empresa"* | Tareas con responsable, vencimiento y estado | Crear una tarea y asignarla a otro usuario | Soporte |

### Estado de lo ya verificado en las instancias

| ID | EspoCRM | Twenty | Bitrix24 |
|---|---|---|---|
| RF-02 Entidad Póliza | ✔ **Entity Manager** con "Crear entidad" `[UI:espocrm /#Admin/entityManager]` | ✔ **"Objetos → Añadir objeto"** `[UI:twenty /settings/objects]` | ✔ **"Automatización Inteligente de Procesos"** `[UI:bitrix24 /crm/type/]` |
| RF-06/09 Oportunidades | ✔ Módulo Oportunidades `[UI:espocrm /#Opportunity]` | ✔ Opportunities con Amount y Close date `[UI:twenty /objects/opportunities]` | ✔ Negociaciones con embudo `[UI:bitrix24 /crm/deal/]` |
| RF-10 Campañas | ✔ **Módulo Campañas nativo** con listas de objetivo `[UI:espocrm /#Campaign]` · métricas de envío, apertura, clicks, rebotes `[DOC:docs.espocrm.com/user-guide/campaigns]` | ✖ No existe módulo de campañas `[UI:twenty]` | ✔ **Muy completo**: campañas de correo, SMS, Messengers, voz `[UI:bitrix24 /marketing/]` |
| RF-11 Segmentación | ✔ **Listas de objetivo** `[UI:espocrm /#TargetList]` | ◻ Vistas con filtros, sin segmentos como entidad | ✔ Sección **Segmentos** `[UI:bitrix24 /marketing/]` |
| RF-12 Reclamos | ✔ **Módulo Tickets** (Case) bajo Soporte `[UI:espocrm /#Case]` | ✖ No hay módulo de casos `[UI:twenty]` | ◻ Se resolvería con pipeline propio |
| RF-13/14 Redes | ✖ Sin conector de redes | ✖ Sin conector de redes | ✔ **Audiencias de Facebook, anuncios de Facebook e Instagram, Google Ads** `[UI:bitrix24 /marketing/]` |
| RF-15 Base de conocimiento | ✔ **Base de conocimiento** nativa `[UI:espocrm menú]` | ✔ Notes `[UI:twenty /objects/notes]` | ◻ Por verificar |
| RF-18 Importación | 🟡 **Solo CSV en UTF-8** — sin Excel, Gmail ni Outlook `[UI:espocrm /#Import]` | ◻ Por verificar | ◻ Por verificar |
| RF-19 Email | ✔ Correos entrantes con cuentas personales y grupales `[UI:espocrm /#Admin/inboundEmails]` | ✔ **Cuentas conectadas** `[UI:twenty /settings/accounts]` | ✔ Webmail integrado `[UI:bitrix24 /mail/]` |
| RF-20 Tareas | ✔ Módulo Tareas `[UI:espocrm menú]` | ✔ Tasks con Assignee y Due Date `[UI:twenty /objects/tasks]` | ✔ Módulo Tareas `[UI:bitrix24 menú]` |

> **Hallazgo que cambia el análisis:** dábamos por perdidos los requerimientos de redes sociales (RF-13/14) en las tres. **Bitrix24 los cubre**: tiene audiencias y anuncios de Facebook e Instagram, y Google Ads, accesibles desde el plan Free. Falta confirmar si al usarlos aparece paywall.

---

# TABLA 2 — Requerimientos no funcionales

Cómo tiene que **comportarse** el sistema. Tres orígenes distintos.

## a) Exigidos por la cátedra `[CONS]`

| ID | Criterio | Qué se mide |
|---|---|---|
| NF-01 | Restricciones tecnológicas `[CONS 1]` | Plataforma, SO, RAM, CPU, almacenamiento |
| NF-02 | Instalación y configuración `[CONS 2]` | Tiempo, pasos, dependencias, errores |
| NF-03 | Menú y navegabilidad `[CONS 3]` | Clicks y segundos por tarea típica |
| NF-04 | Interfaz y facilidad de aprendizaje `[CONS 4]` | Autonomía de un usuario nuevo sin capacitación |
| NF-05 | Usuarios concurrentes y limitaciones `[CONS 5]` | Comportamiento con varios usuarios sobre el mismo registro |
| NF-06 | Parametrización `[CONS 6]` | Campos, entidades y procesos configurables sin programar |
| NF-07 | Importación / exportación `[CONS 7]` | Formatos, mapeo, deduplicación, pérdida de datos |
| NF-08 | Seguridad, roles y auditoría `[CONS 8]` | Perfiles, ACL, doble factor, pistas de auditoría |
| NF-09 | Explotación de datos `[CONS 9]` | Tableros, indicadores, análisis |
| NF-10 | Reportes paramétricos y ad hoc `[CONS 10]` | Generación y exportación de informes |
| NF-11 | Interfaz con otras aplicaciones `[CONS 11]` | API, webhooks, formatos de intercambio |
| NF-12 | Posibilidades de integración `[CONS 12]` | Ecosistema, marketplace, conectores |
| NF-13 | Soporte y capacitación `[CONS 13]` | Documentación, comunidad, tiempo de respuesta |

## b) Implícitos en lo que pidió el cliente `[REQ]`

El cliente no los nombra, pero se desprenden de sus propias frases.

| ID | Frase que lo origina | No funcional que impone |
|---|---|---|
| NF-14 | *"Sincronizar el email de **todos** en tu empresa"* | Multiusuario real: la sincronización tiene que escalar a toda la empresa, no a una casilla |
| NF-15 | *"Centralizar la información y centrar a la organización alrededor del cliente"* | **Fuente única de verdad**: sin duplicados, con integridad referencial entre cliente, póliza y reclamo |
| NF-16 | *"Optimizar las actividades de los vendedores"* | **Eficiencia operativa medible**: menos pasos por tarea repetitiva |
| NF-17 | *"Resolver los problemas de forma eficiente"* (introducción del PDF) | Tiempo de respuesta y trazabilidad del reclamo de punta a punta |
| NF-18 | *"Ver todas las actividades que los agentes o corredores realizan en torno al cliente"* | **Auditoría de actividad por usuario**, no solo del dato final |
| NF-19 | *"La máxima prioridad de las aseguradoras es captar clientes"* (introducción) | El sistema tiene que soportar volumen de prospección sin degradarse |

## c) Impuestos por el negocio asegurador `[RUBRO]`

Ninguna de las dos fuentes los escribe, pero el rubro los exige. Van fundamentados.

| ID | No funcional | Por qué en seguros |
|---|---|---|
| NF-20 | **Retención de datos a largo plazo** | Una póliza de vida dura décadas; el histórico de siniestros no se puede perder |
| NF-21 | **Volumen de registros** | Una aseguradora chica maneja decenas de miles de pólizas, y cada una con endosos y siniestros |
| NF-22 | **Confidencialidad de datos sensibles** | Los seguros de salud implican datos de salud, que son datos sensibles bajo la Ley 25.326 |
| NF-23 | **Trazabilidad ante reclamos** | Frente a una disputa hay que reconstruir quién modificó qué y cuándo |
| NF-24 | **Continuidad y respaldo** | Si el CRM se cae no se pueden emitir pólizas ni atender siniestros |
| NF-25 | **Concurrencia entre sucursales y corredores** | Varios corredores operan sobre la misma cartera al mismo tiempo |
| NF-26 | **Soberanía de los datos** | Dónde se alojan importa para el cumplimiento normativo local |

> **El puente entre las dos tablas.** Ninguno de los tres CRM tiene un módulo de pólizas: son CRM genéricos. Entonces **RF-02, RF-03 y RF-17 se resuelven a través de NF-06 (parametrización)**. Sin capacidad de crear entidades propias, esos tres requerimientos funcionales son imposibles. Esa dependencia es el eje del análisis y va explícita en el informe.

---

# TABLA 3 — No requeridos

Diferenciales que nadie pidió. **No se mezclan con las tablas anteriores.**

## A favor

| ID | Diferencial | Herramienta | Estado |
|---|---|---|---|
| NR-01 | **CoPilot (IA) en el plan gratuito** | Bitrix24 | ✔ `[UI:bitrix24 menú lateral]` |
| NR-02 | **Suite completa**: chat, drive, calendario, webmail, proyectos, firma electrónica, BI Builder | Bitrix24 | ✔ `[UI:bitrix24 menú lateral]` |
| NR-03 | Gestión de inventario y sitios web integrados | Bitrix24 | ✔ `[UI:bitrix24 menú lateral]` |
| NR-04 | App móvil nativa | Bitrix24 | ◻ por verificar |
| NR-05 | Telefonía y videollamadas | Bitrix24 | ◻ por verificar |
| NR-06 | **36 idiomas de fábrica**, español completo incluido el modelo de datos | EspoCRM | ✔ `[TEST:C04-06]` con video |
| NR-07 | **Detección de duplicados** al dar de alta | EspoCRM | ✔ `[TEST:C03-01]` con video |
| NR-08 | Base de conocimiento nativa | EspoCRM | ✔ `[UI:espocrm menú]` |
| NR-09 | Acceso directo a la base de datos | EspoCRM, Twenty | ✔ verificado |
| NR-10 | **API GraphQL** con explorador interactivo | Twenty | ✔ `[UI:twenty]` |
| NR-11 | Workflows de automatización incluidos | Twenty | ✔ `[UI:twenty /objects/workflows]` |
| NR-12 | Tableros (Dashboards) nativos | Twenty | ✔ `[UI:twenty menú]` |

## En contra — riesgos no pedidos que pesan en la decisión

| ID | Riesgo | Herramienta | Estado |
|---|---|---|---|
| NR-13 | **El portal se elimina a los 50 días sin login**, con los datos adentro | Bitrix24 | ✔ `[UI:bitrix24 /settings/license_all.php]` + `[DOC:helpdesk.bitrix24.com/open/25990955]` |
| NR-14 | **Búsqueda por texto rota pasados ~1.000 registros** | Bitrix24 | ◻ a demostrar con carga |
| NR-15 | **El modelo de datos queda en inglés**: Companies, People, Opportunities | Twenty | ✔ `[TEST:C04-06]` con video |
| NR-16 | **Sin módulo de reportes** en ninguna edición | Twenty | ✔ verificado |
| NR-17 | Los reportes son del Advanced Pack: **$395 pago único** | EspoCRM | ✔ `[UI:espocrm]` + `[DOC]` |
| NR-18 | Paywall permanente a la vista: botón "Mejore su plan" fijo | Bitrix24 | ✔ `[UI:bitrix24]` |

---

# Qué falta verificar antes de puntuar

| Punto | Herramienta | Cómo se resuelve |
|---|---|---|
| RF-18 Excel, Gmail y Outlook | Twenty, Bitrix24 | Entrar al importador de cada una |
| RF-12 Reclamos | Bitrix24 | Ver si el pipeline propio sirve como gestión de casos |
| RF-13/14 ¿Las redes de Bitrix24 tienen paywall? | Bitrix24 | Hacer click en Audiencia de Facebook y ver si pide plan |
| RF-05 Competencia | Las tres | Buscar entidad Competidor o campo "motivo de pérdida" |
| RF-09 Forecast nativo | Las tres | Buscar pronóstico de ventas |
| NR-04, NR-05 App móvil y telefonía | Bitrix24 | Documentación oficial |
| NF-20 a NF-26 | Las tres | Varios se responden con lo ya relevado; el resto por documentación |

---

## Puntos de control de la consigna

| Punto de control | Estado |
|---|---|
| Identificación de la herramienta y recopilación de información | ✅ `Propuestas-CRM.md` |
| Ámbito de aplicación (empresa/rubro) | ✅ **Compañías de seguros**, definido por la cátedra |
| Identificación de alternativas de mercado | ✅ 12 CRMs comparados |
| Determinación de requerimientos | ✅ **Este documento** |
| Análisis de la solución | 🔄 Fase 2 y 3 |
| Matriz FODA | ⬜ Pendiente |
| Definición de propuesta y justificación organizacional | ⬜ Pendiente |
| Soporte necesario y consideraciones | ⬜ Pendiente |
| Presentación en clase práctica | ⬜ Pendiente |

---

**Próximo paso — Fase 2:** definir la escala de puntuación y la ponderación sobre este universo de puntos.
