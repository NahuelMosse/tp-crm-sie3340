# Puntos a evaluar — Fase 1

**Caso de estudio: compañía de seguros** *(definido por la cátedra en `Requerimientos-TP-SIE3340.pdf`).*

Define **qué** se evalúa. La escala de puntuación se define en la Fase 2.

---

## Dos reglas de redacción

**1. Todos los puntos se enuncian como capacidad, nunca como defecto.**
En vez de *"Bitrix24 borra la cuenta a los 50 días"*, el punto es **"Persistencia de los datos sin uso continuo"** — y ahí EspoCRM y Twenty suman. Así el que cumple gana puntos, en lugar de que el otro los pierda. La conclusión numérica es la misma, pero la tabla es defendible y no parece escrita contra una herramienta.

**2. Solo entran puntos que discriminan.**
Si las tres lo cumplen igual y sin matices, el punto no aporta a la decisión: se documenta pero no se evalúa. Los 20 requerimientos del cliente y los 13 criterios de la consigna entran completos porque son obligatorios; el resto tiene que ganarse el lugar.

---

## Trazabilidad

Cada punto dice de dónde salió. **Lo verificado en la instancia vale más que lo que dice el fabricante.**

| Código | Significa |
|---|---|
| `[REQ]` | Frase textual del PDF de requerimientos |
| `[CONS n]` | Criterio n de la consigna |
| `[UI:app ruta]` | **Visto en la instancia**, con captura |
| `[API:método]` | **Ejecutado contra la API**, con respuesta |
| `[TEST:id]` | Demostrado por un test automatizado con video |
| `[DOC:url]` | Documentación oficial, **sin verificar en la instancia** |
| `[RUBRO]` | Derivado del negocio asegurador |

---

# TABLA 1 — Requerimientos funcionales

Qué tiene que **hacer** el sistema. Los 20 del cliente, sin excepción.

| ID | Frase del cliente `[REQ]` | Capacidad a evaluar | Cómo se verifica | Criticidad |
|---|---|---|---|---|
| **RF-01** | *"Registrar todos los datos y calificar sus necesidades para concretar la venta"* | Alta de prospecto con campos de calificación del riesgo | Crear un lead con campos propios de calificación y convertirlo | Núcleo |
| **RF-02** | *"Seguimiento de pólizas: tipo, estado de pago y posibilidad de cambio"* | **Modelar la entidad Póliza** con tipo, vigencia, prima y estado de cobranza | Crear la entidad, agregarle los campos del rubro y cargar una póliza | Núcleo |
| **RF-03** | *"Gestionar una amplia fuente de información sobre ventas y pólizas para captar nuevos clientes"* | Consultar y filtrar la cartera para generar prospección | Filtrar pólizas por vencimiento y obtener una lista accionable | Núcleo |
| **RF-04** | *"Gestión de corredores y agentes… evaluar las ventas por empleado… ver todas las actividades que realizan en torno al cliente"* | Asignación por agente, medición de su producción y timeline de su actividad | Crear 2 agentes, asignar cartera, ver producción por agente y su historial | Núcleo |
| **RF-05** | *"Analizar los factores de la competencia"* | Registrar competidores y motivos de pérdida | ¿Hay entidad de competidor o campo de motivo de pérdida configurable? | Soporte |
| **RF-06** | *"Conocer nuevas oportunidades de negocio a partir de las necesidades"* | Pipeline de oportunidades ligado al asegurado | Crear una oportunidad desde un cliente existente y verla en el embudo | Núcleo |
| **RF-07** | *"Conocer la información del cliente, centralizarla y centrar a la organización alrededor del cliente"* | Ficha 360°: datos, pólizas, actividad, correos y reclamos en una pantalla | Abrir un asegurado y medir cuánto contexto muestra sin navegar afuera | Núcleo |
| **RF-08** | *"Optimizar las actividades de los vendedores"* | Agenda, recordatorios y carga de trabajo por vendedor | Crear una actividad y verla en la agenda del responsable | Soporte |
| **RF-09** | *"Pronosticar todos los movimientos comerciales"* | Proyección de ventas por etapa, probabilidad y monto | ¿Hay forecast nativo? ¿El embudo totaliza por etapa? | Soporte |
| **RF-10** | *"Diseñar campañas de marketing personalizables. Análisis de campañas realizadas"* | Envío masivo segmentado con métricas de resultado | Crear una campaña y verificar que registre envíos, aperturas y clicks | Soporte |
| **RF-11** | *"Segmentación de clientes"* | Segmentos por criterios, reutilizables | Crear el segmento "pólizas por vencer" y guardarlo | Núcleo |
| **RF-12** | *"Manejar quejas y reclamaciones"* | Gestión de casos con estado, responsable y seguimiento | Crear un reclamo sobre un asegurado y seguir su ciclo | Núcleo |
| **RF-13** | *"Información de los clientes y conseguir nuevos… conocer a la competencia que esté presente en las redes"* | Captación de leads desde redes sociales | ¿Hay conector con alguna red para captar prospectos? | Soporte |
| **RF-14** | *"Cambiar la imagen y reputación a partir de opiniones y comentarios… mayor repercusión en las redes"* | Publicación y escucha de menciones | ¿Permite publicar o monitorear menciones? | Accesorio |
| **RF-15** | *"Mejora de la calidad del servicio y la atención al cliente"* | Historial de interacción y base de conocimiento para respuestas | ¿Hay base de conocimiento o plantillas de respuesta? | Soporte |
| **RF-16** | *"Conocer y agrupar la información de los clientes"* | Agrupamiento y vistas por categoría *(se apoya en RF-07 y RF-11)* | Agrupar la cartera por un campo y obtener totales | Soporte |
| **RF-17** | *"Gestionar de manera eficaz todas las pólizas y generar nuevas oportunidades de venta"* | Operación masiva sobre la cartera y venta cruzada *(se apoya en RF-02)* | Editar varias pólizas a la vez y generar una oportunidad desde una | Núcleo |
| **RF-18** | *"Importar contactos desde Excel, Gmail y Outlook"* | Importación desde los **tres** orígenes | Importar un .xlsx, conectar Gmail, conectar Outlook | Soporte |
| **RF-19** | *"Sincronizar el email de todos en tu empresa para que se guarde automáticamente en las fichas"* | Sincronización multiusuario con vinculación automática a la ficha | Configurar una casilla, enviar un correo y verlo aparecer en la ficha | Núcleo |
| **RF-20** | *"Crear tareas y asignar a personas de la empresa"* | Tareas con responsable, vencimiento y estado | Crear una tarea y asignarla a otro usuario | Soporte |

---

# TABLA 2 — Requerimientos no funcionales

Cómo tiene que **comportarse**. Los 13 de la consigna van completos, **adaptados al rubro asegurador**. Después, solo los que discriminan.

## a) Los 13 de la consigna, leídos en clave de seguros `[CONS]`

| ID | Criterio | Adaptación al rubro |
|---|---|---|
| NF-01 | Restricciones tecnológicas `[CONS 1]` | Qué infraestructura necesita una aseguradora chica para sostenerlo |
| NF-02 | Instalación y configuración `[CONS 2]` | Cuánto tarda en estar operativo desde cero |
| NF-03 | Menú y navegabilidad `[CONS 3]` | Pasos para la operación diaria del corredor: cargar asegurado y póliza |
| NF-04 | Interfaz y aprendizaje `[CONS 4]` | Cuánto tarda un corredor nuevo en operar sin capacitación |
| NF-05 | Usuarios concurrentes `[CONS 5]` | Varios corredores sobre la misma cartera al mismo tiempo |
| NF-06 | **Parametrización** `[CONS 6]` | **Modelar pólizas, siniestros y coberturas sin programar.** Es el criterio que habilita RF-02, RF-03 y RF-17 |
| NF-07 | Importación y exportación `[CONS 7]` | Migrar la cartera existente sin perder datos |
| NF-08 | Seguridad, roles y auditoría `[CONS 8]` | Que un corredor vea solo su cartera, y que quede registro de quién tocó qué |
| NF-09 | Explotación de datos `[CONS 9]` | Indicadores de producción, siniestralidad y cobranza |
| NF-10 | Reportes `[CONS 10]` | Informes de producción por agente y de vencimientos |
| NF-11 | Interfaz con otras aplicaciones `[CONS 11]` | Conectar con el sistema de emisión de pólizas o de facturación |
| NF-12 | Posibilidades de integración `[CONS 12]` | Ecosistema disponible para crecer |
| NF-13 | Soporte y capacitación `[CONS 13]` | A quién recurrir cuando algo falla en producción |

## b) Los que salen de lo que pidió el cliente `[REQ]`

Solo los que discriminan de verdad entre las tres.

| ID | Frase que lo origina | Capacidad a evaluar |
|---|---|---|
| NF-14 | *"Sincronizar el email de **todos** en tu empresa"* | **Sincronización de correo multiusuario**: que escale a toda la empresa, no a una casilla suelta |
| NF-15 | *"Centralizar… y centrar a la organización alrededor del cliente"* | **Integridad de la ficha única**: evitar duplicados al cargar el mismo asegurado dos veces |
| NF-18 | *"Ver todas las actividades que los agentes realizan en torno al cliente"* | **Trazabilidad de la actividad por usuario**, no solo del dato final |

## c) Los que impone el negocio asegurador `[RUBRO]`

| ID | Capacidad a evaluar | Por qué en seguros |
|---|---|---|
| NF-20 | **Persistencia de los datos sin uso continuo** | Una cartera de pólizas no se puede perder por falta de actividad; la póliza vive años aunque nadie la toque por meses |
| NF-21 | **Búsqueda y operación con volumen productivo** | Una aseguradora chica maneja decenas de miles de pólizas; el sistema tiene que seguir encontrando un asegurado con esa masa de datos |
| NF-22 | **Control sobre dónde residen los datos** | Los seguros de salud implican datos sensibles bajo la Ley 25.326 |
| NF-24 | **Continuidad y respaldo propio** | Si el CRM no está disponible no se emiten pólizas ni se atienden siniestros |
| NF-26 | **Autonomía frente al proveedor** | Poder migrar o seguir operando sin depender de decisiones de un tercero |

> **El eje del análisis.** Ninguno de los tres tiene módulo de pólizas: son CRM genéricos. **RF-02, RF-03 y RF-17 se resuelven a través de NF-06 (parametrización).** Sin capacidad de modelar entidades propias, esos tres requerimientos del cliente son inalcanzables. Ese puente es la conclusión central del informe.

---

# TABLA 3 — Capacidades diferenciales

No las pidió el cliente. Suman aparte. **Solo las que inclinan la decisión** — se descartaron las que no discriminan.

| ID | Capacidad | Por qué importa en una aseguradora |
|---|---|---|
| **NR-01** | **Asistente de IA incluido sin costo** | Resumir el historial de un siniestro o redactar la respuesta a un reclamo |
| **NR-02** | **Suite de trabajo integrada** (chat, drive, calendario, videollamada, firma electrónica) | Un corredor opera todo el día en una sola herramienta; la firma electrónica sirve para la póliza |
| **NR-03** | **Aplicación móvil nativa** | El productor visita al cliente y carga la operación en el momento |
| **NR-04** | **Localización completa al español, incluido el modelo de datos** | El corredor no tiene por qué leer "Opportunities" o "Policy"; afecta la adopción real |
| **NR-05** | **Detección de duplicados al cargar** | Evita dos fichas del mismo asegurado, que es el error más caro en una cartera |
| **NR-06** | **Base de conocimiento interna** | Condiciones de cobertura y procedimientos al alcance del que atiende |
| **NR-07** | **Acceso directo a la base de datos** | Permite cruzar con el sistema de emisión o hacer auditorías propias |
| **NR-08** | **Automatización de procesos incluida** | Avisar el vencimiento de una póliza sin que nadie lo recuerde |
| **NR-09** | **Uso sin restricciones comerciales en la interfaz** | Trabajar sin avisos de venta permanentes en pantalla |
| **NR-10** | **Reportes disponibles sin costo adicional** | Poder medir producción sin una compra extra |

*(Se descartaron por no discriminar o no aportar al rubro: cantidad de idiomas, tipo de API, tableros nativos, navegación por teclado, gestión de inventario, constructor de sitios web.)*

---

# Evidencia ya obtenida

Lo verificado hasta ahora, con su fuente. **Sin puntaje**: solo el estado del hecho.

## RF-02 · Modelar la entidad Póliza — la prueba más importante

| | Resultado | Fuente |
|---|---|---|
| **EspoCRM** | ✔ **Completo.** Entidad creada, **5 campos del rubro** cargados (Tipo de póliza, Prima mensual en moneda, Vigencia desde, Vigencia hasta, Estado de pago) y la póliza `POL-2026-0001` cargada y visible en el listado | `[TEST:RF-02]` + `[API:/EntityManager/action/createEntity]` + `[API:/Admin/fieldManager/CPoliza]` |
| **Twenty** | ✔ **Objeto creado** desde Configuración → Modelo de datos, en 29 s, visible en el listado de objetos | `[TEST:RF-02]` + `[UI:twenty /settings/objects]` |
| **Bitrix24** | ◻ **El diálogo se abre** — "Crear una Automatización Inteligente de Procesos (SPA)" con tres opciones — pero no logré completar la creación de forma automatizada. **Falta verificar a mano si el plan Free permite terminarla** | `[UI:bitrix24 /crm/type/]` con captura |

> **Un falso positivo propio, para no repetirlo.** Mi primera detección dio "paywall" en Bitrix24 porque busqué las palabras *"Mejore su plan"* en el texto de toda la página — y ese botón está fijo en el menú, aparezca o no un bloqueo. **La captura muestra que el diálogo se abre normalmente.** Regla que queda: el paywall se determina completando la acción, nunca por texto suelto de la pantalla.

## Resto de lo verificado en las instancias

| Punto | EspoCRM | Twenty | Bitrix24 |
|---|---|---|---|
| RF-10 Campañas | ✔ Módulo Campañas con listas de objetivo `[UI:/#Campaign]` · métricas de apertura, clicks y rebotes `[DOC:docs.espocrm.com/user-guide/campaigns]` | ✖ No existe `[UI]` | ✔ **El más completo**: correo, SMS, Messengers, difusión de voz y llamada de audio `[UI:/marketing/]` |
| RF-11 Segmentación | ✔ Listas de objetivo `[UI:/#TargetList]` | ◻ Vistas con filtros | ✔ Sección Segmentos `[UI:/marketing/]` |
| RF-12 Reclamos | ✔ Módulo Tickets bajo Soporte `[UI:/#Case]` | ✖ Sin módulo de casos `[UI]` | ◻ Por verificar con pipeline propio |
| RF-13/14 Redes | ✖ Sin conector | ✖ Sin conector | ✔ **Audiencias de Facebook, anuncios de Facebook e Instagram, Google Ads** `[UI:/marketing/]` |
| RF-15 Base de conocimiento | ✔ Nativa `[UI:menú]` | 🟡 Notes `[UI:/objects/notes]` | ◻ Por verificar |
| RF-18 Importación | 🟡 **Solo CSV en UTF-8** `[UI:/#Import]` | ◻ Por verificar | ◻ Por verificar |
| RF-19 Email | ✔ Correos entrantes, cuentas personales y grupales `[UI:/#Admin/inboundEmails]` | ✔ Cuentas conectadas `[UI:/settings/accounts]` | ✔ Webmail integrado `[UI:/mail/]` |
| RF-20 Tareas | ✔ Módulo Tareas `[UI:menú]` | ✔ Tasks con responsable y vencimiento `[UI:/objects/tasks]` | ✔ Módulo Tareas `[UI:menú]` |
| NF-06 Parametrización | ✔ Entity Manager con relaciones 1:N, N:1, N:N `[UI:/#Admin/entityManager]` | ✔ Añadir objeto `[UI:/settings/objects]` | ◻ SPA, por confirmar en Free |
| NF-20 Persistencia sin uso | ✔ Sin vencimiento (self-hosted) | ✔ Sin vencimiento (self-hosted) | ⚠ La cuenta se elimina a los 50 días sin ingresar `[UI:/settings/license_all.php]` + `[DOC:helpdesk.bitrix24.com/open/25990955]` |
| NR-04 Español del modelo | ✔ Completo `[TEST:C04-06]` con video | 🟡 Controles en español, modelo en inglés `[TEST:C04-06]` con video | ✔ Completo `[TEST]` |
| NR-05 Duplicados | ✔ Avisa al crear un repetido `[TEST:C03-01]` con video | ✖ Creó el duplicado sin avisar `[TEST]` | ◻ Por verificar |
| NR-08 Automatización | 🟡 Advanced Pack | ✔ Workflows incluidos `[UI:/objects/workflows]` | ◻ Reglas de automatización, por confirmar |

## Un hallazgo de configuración que vale para el informe

Al crear la entidad Póliza, EspoCRM devolvió **Internal server error**. El log mostró `DivisionByZeroError` en `DatabasePopulator.php:84`: la instalación tenía **moneda por defecto ARS sin cotización cargada**, y al reconstruir la caché el sistema divide por una tasa en cero.

Dos cosas que salen de ahí:

1. **La entidad se creó igual.** El error ocurrió en el rebuild posterior, no en la creación: la Póliza quedó operativa y se le pudieron cargar campos y registros. Un error visible no siempre significa que la operación falló.
2. **Configurar moneda local exige cargar la cotización.** Una aseguradora argentina va a operar en pesos: es una observación concreta de puesta en marcha, y sale de haberlo roto de verdad.

`[UI:espocrm /#Admin/entityManager]` + log del contenedor + `[API:/Settings]`

---

# Qué falta verificar antes de puntuar

| Punto | Herramienta | Cómo se resuelve |
|---|---|---|
| RF-02 ¿el Free completa la creación de la entidad? | Bitrix24 | Completar el diálogo SPA a mano |
| RF-18 Excel, Gmail y Outlook | Twenty, Bitrix24 | Entrar al importador de cada una |
| RF-12 Reclamos con pipeline propio | Bitrix24 | Crear un embudo de reclamos |
| RF-05 Competencia y motivo de pérdida | Las tres | Buscar el campo en Oportunidades |
| RF-09 Forecast nativo | Las tres | Buscar proyección de ventas |
| NF-21 Búsqueda con volumen | Bitrix24 | Cargar 1.200 registros y buscar |
| NR-03 Aplicación móvil | Las tres | Documentación oficial y tiendas |
| NF-08 Roles por cartera | Las tres | Crear un rol restringido y probar el acceso |

---

## Puntos de control de la consigna

| Punto de control | Estado |
|---|---|
| Identificación de la herramienta y recopilación de información | ✅ `Propuestas-CRM.md` |
| Ámbito de aplicación (empresa/rubro) | ✅ Compañías de seguros |
| Identificación de alternativas de mercado | ✅ 12 CRMs comparados |
| Determinación de requerimientos | ✅ Este documento |
| Análisis de la solución | 🔄 En curso |
| Matriz FODA | ⬜ Pendiente |
| Propuesta y justificación organizacional | ⬜ Pendiente |
| Soporte necesario y consideraciones | ⬜ Pendiente |
| Presentación en clase práctica | ⬜ Pendiente |

**Próximo paso — Fase 2:** definir la escala de puntuación y la ponderación sobre este universo de puntos.
