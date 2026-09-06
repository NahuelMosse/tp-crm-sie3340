# Propuestas de CRM — TP SIE 3340

Evaluación de candidatos para el TP *"Planteo de recomendaciones para la selección de un Sistema CRM"*.
Precios en USD, referencia agosto 2026, facturación anual salvo aclaración.

## Reglas de selección aplicadas

1. **Plan gratuito permanente o licencia open source.** Un trial de 14 días no alcanza para sostener el trabajo durante todo el cuatrimestre, así que las herramientas sin plan gratis quedan descartadas (ver sección *Descartadas*).
2. **Interfaz en español — requisito obligatorio.** La aplicación tiene que poder usarse en español, no solo la documentación. Se evalúa como criterio 0 en cada tabla.
3. **Alta autoservicio para una persona común — requisito obligatorio.** Registro online e inmediato, sin tarjeta de crédito, sin llamada ni formulario de "contactar a ventas", sin necesidad de acreditar una empresa real ni de tener dominio propio de e-mail.
4. **Automatizable con Playwright — deseable, no obligatorio.** Se evalúa como criterio A porque permite generar la evidencia del TP de forma automática (ver sección *Automatización de las pruebas*).

**Resultado:** 12 herramientas pasan los tres filtros obligatorios. Ninguna exige hablar con un vendedor para acceder a su plan gratuito.

## Los 13 criterios de la consigna

1. Restricciones tecnológicas (plataforma, SO, hardware, almacenamiento, memoria)
2. Facilidad de instalación y configuración
3. Facilidades y menú de funcionalidades. Despliegue y navegabilidad
4. Interfaz con usuarios, facilidad de uso y aprendizaje
5. Usuarios concurrentes. Limitaciones
6. Parametrización, facilidad y posibilidades de cambios
7. Importación / Exportación de datos. Flexibilidad
8. Seguridad, autenticación, roles y perfiles, pistas de auditoría
9. Herramientas de explotación de datos y medición de resultados
10. Generación de reportes e informes. Paramétricos y Ad Hoc
11. Factibilidad de interfaz con otras aplicaciones locales o remotas
12. Posibilidades de integración en un contexto más amplio
13. Soporte técnico, capacitación, blog de usuarios

Más dos criterios propios: **0. Idioma español** (obligatorio) y **A. Automatizable con Playwright** (deseable, no suma al score).

Leyenda: ✅ cumple · 🟡 parcial · ❌ no cumple / no evaluable

> **Observación clave:** los criterios 1 y 2 solo se pueden evaluar de verdad sobre un CRM **self-hosted**. En un SaaS puro la respuesta es siempre "navegador web, no aplica". Por eso conviene que la terna incluya uno instalable.

---

## 1. Odoo CRM — score 27/28

**Gratis:** dos caminos. **"One App Free"** en la nube (usuarios ilimitados con una sola app, para siempre) y **Odoo Community**, open source LGPLv3, self-hosted, sin límites.

**¿Qué se paga entonces?** Standard ~$24,90 y Custom ~$37,40 por usuario/mes compran cuatro cosas que Community no tiene:

- **Odoo Studio**: parametrizar con drag & drop. En Community lo mismo se hace editando vistas XML, o sea que se puede, pero a mano.
- **Apps propietarias**: contabilidad con conciliación bancaria automática, firma digital, marketing automation, calidad y mantenimiento en producción.
- **Upgrades automáticos entre versiones mayores.** Esto es lo que más duele en Community: migrar de la 17 a la 18 es un trabajo manual serio. En Enterprise lo hace Odoo.
- **Hosting gestionado, backups diarios y soporte.**
- En el plan "One App Free", el pago se dispara **apenas activás una segunda app**.

**Prueba:** 15 días con todas las apps habilitadas, autoservicio.

| Criterio | Cumple | Detalle |
|---|---|---|
| **0. Idioma español** | ✅ | Traducción completa, incluye variante **es_AR** con localización fiscal argentina |
| 1. Tecnológicas | ✅ | Community: Python 3 + PostgreSQL. Linux/Windows/Docker. Mínimo real 2 GB RAM, 2 vCPU, 10 GB disco |
| 2. Instalación | 🟡 | Instalable por .deb, Docker o fuente; más exigente que EspoCRM o Dolibarr, pero bien documentada |
| 3. Menú y navegabilidad | ✅ | Menús por app, vistas lista/kanban/calendario/pivot/gráfico conmutables |
| 4. Facilidad de uso | ✅ | UI moderna y coherente entre módulos, en español |
| 5. Usuarios concurrentes | ✅ | Ilimitados en One App Free y en Community |
| 6. Parametrización | ✅ | Modo desarrollador: campos, vistas y reglas desde la UI. Studio es pago; en Community se parametriza por XML |
| 7. Import / Export | ✅ | Import CSV/XLSX con mapeo, export nativo de cualquier vista, acceso a PostgreSQL |
| 8. Seguridad y auditoría | ✅ | Grupos, record rules por campo, 2FA, log de auditoría en cada registro |
| 9. Explotación de datos | ✅ | Vista pivot y gráficos nativos en todos los módulos, sin herramienta externa |
| 10. Reportes | ✅ | Pivot ad hoc + reportes QWeb paramétricos e imprimibles |
| 11. Interfaz con otras apps | ✅ | API XML-RPC y JSON-RPC, webhooks, conectores de e-mail y telefonía |
| 12. Integración | ✅ | **El mejor del lote**: detrás del CRM hay un ERP completo — ventas, stock, facturación, contabilidad, RRHH |
| 13. Soporte y capacitación | ✅ | Odoo eLearning, documentación oficial, foro muy activo, partners locales en Argentina |
| **A. Playwright** | ✅ | Cliente web OWL, **sin shadow DOM**. Corre en localhost sin captcha ni MFA. Odoo trae además su propio framework de *tours* JS |

---

## 2. EspoCRM Community — score 24/28

**Gratis:** open source GPLv3, self-hosted, ilimitado en usuarios. Se instala en XAMPP local o VPS.

**¿Qué se paga entonces?** El core es completo, pero hay tres cosas afuera:

- **Advanced Pack** (~$150/año): motor de **workflows** automáticos, BPM y —lo más importante para el TP— el **módulo de Reportes**. Sin él, el criterio 10 se cubre a mano con vistas filtradas y export.
- **Packs verticales** (Sales Pack, Real Estate Pack): funcionalidad de rubro.
- **EspoCRM Cloud** (~$15/usuario/mes): no agrega features, te ahorra administrar el servidor, los backups y las actualizaciones.

**Prueba:** Community no la necesita, es libre. EspoCRM Cloud ofrece 30 días.

| Criterio | Cumple | Detalle |
|---|---|---|
| **0. Idioma español** | ✅ | Incluido en el core, +20 idiomas. Variantes es_ES y es_MX. Se cambia por usuario desde Preferencias |
| 1. Tecnológicas | ✅ | PHP 8.x + MySQL/MariaDB + Apache/Nginx. Mínimo real: 1 vCPU, 1-2 GB RAM, ~2 GB disco. Corre en una notebook |
| 2. Instalación | ✅ | Instalador web paso a paso, ~20 min |
| 3. Menú y navegabilidad | ✅ | Tabs y grupos de tabs configurables desde la UI, sin tocar código |
| 4. Facilidad de uso | ✅ | UI liviana, rápida y responsive; curva de aprendizaje corta |
| 5. Usuarios concurrentes | ✅ | Sin límite de licencia; solo lo que aguante el hardware |
| 6. Parametrización | ✅ | **Entity Manager**: entidades y campos nuevos sin código. Layout Manager, fórmulas, plantillas |
| 7. Import / Export | ✅ | Import CSV con mapeo, export CSV/XLSX, y acceso directo a la base MySQL |
| 8. Seguridad y auditoría | ✅ | Roles, equipos, ACL a nivel de campo, 2FA, **Action History / Audit Log** |
| 9. Explotación de datos | 🟡 | Dashlets y KPIs en el dashboard; BI avanzado solo en Advanced Pack |
| 10. Reportes | 🟡 | **El módulo Reports es pago**; en Community se sustituye con vistas filtradas + export |
| 11. Interfaz con otras apps | ✅ | API REST completa, webhooks, integración SMTP/IMAP, Google y Outlook |
| 12. Integración | 🟡 | Extensiones oficiales y de terceros, pero ecosistema chico |
| 13. Soporte y capacitación | 🟡 | Documentación buena y foro comunitario; soporte oficial es pago |
| **A. Playwright** | ✅ | **El más fácil de automatizar.** Backbone.js, DOM plano, atributos `data-name` estables. Localhost, sin captcha |

---

## 3. Salesforce Developer Edition — score 23/28

**Gratis:** **Developer Edition, sin vencimiento**, 2 usuarios, con la funcionalidad de una edición Enterprise.

**¿Qué se paga entonces?** Acá el pago no compra features, compra **capacidad y derecho de uso**:

- **Licencia de uso comercial.** La Developer Edition es solo para desarrollo, prueba y aprendizaje: **no se puede usar para operar un negocio real**. Es la diferencia principal.
- **Capacidad**: la DE trae ~5 MB de datos y ~20 MB de archivos, contra los GB de una org paga. Y ~15.000 llamadas de API por día.
- **Usuarios**: 2 en DE. Cada usuario productivo cuesta desde $25 (Starter) hasta $175 (Enterprise) o $350 (Unlimited) por mes.
- **Soporte con SLA** y funcionalidad de tier alto: Territory Management, forecasting avanzado, Agentforce/IA ($550 el tier de agentes).

Para el TP esto es ideal: se evalúa la herramienta completa sin pagar, y en la conclusión se explica que el costo real aparece al pasar a producción.

**Prueba:** 30 días de Sales Cloud sin tarjeta, en paralelo a la DE que no vence.

| Criterio | Cumple | Detalle |
|---|---|---|
| **0. Idioma español** | ✅ | Interfaz completa en español por usuario; Trailhead también en español |
| 1. Tecnológicas | ❌ | 100% cloud multi-tenant; no hay requisitos de hardware que documentar |
| 2. Instalación | 🟡 | Sin instalación; sí hay configuración inicial guiada desde Setup |
| 3. Menú y navegabilidad | ✅ | Lightning App Builder: apps, tabs y páginas por drag & drop |
| 4. Facilidad de uso | 🟡 | Muy potente, pero la curva de aprendizaje más alta del lote |
| 5. Usuarios concurrentes | 🟡 | 2 usuarios en Developer Edition |
| 6. Parametrización | ✅ | Objetos y campos custom, Flow Builder, validation rules, Apex |
| 7. Import / Export | ✅ | Data Import Wizard, Data Loader, exports programados |
| 8. Seguridad y auditoría | ✅ | **El más completo**: perfiles, roles jerárquicos, permission sets, MFA, Setup Audit Trail, Field History Tracking |
| 9. Explotación de datos | ✅ | Dashboards dinámicos, Einstein básico, fórmulas de resumen |
| 10. Reportes | ✅ | Report Builder ad hoc (tabulares, sumarios, matriciales, joined) + paramétricos |
| 11. Interfaz con otras apps | ✅ | REST, SOAP y Bulk API, Outbound Messages, Platform Events |
| 12. Integración | ✅ | AppExchange con +7.000 apps, MuleSoft, Slack |
| 13. Soporte y capacitación | ✅ | Trailhead gratis con certificaciones, Trailblazer Community |
| **A. Playwright** | 🟡 | **El más difícil.** Los Lightning Web Components encapsulan todo en shadow DOM y **Lightning Web Security fuerza modo `closed`** en parte de los componentes; los locators por rol y texto atraviesan solo el shadow abierto. Sumale re-render asíncrono, MFA y 3 releases al año que rompen selectores |

---

## 4. Dolibarr ERP/CRM — score 23/28

**Gratis:** open source GPLv3, self-hosted, **sin edición paga con features retenidas**. Versión estable 23.0.2 (abril 2026).

**¿Qué se paga entonces?** Prácticamente nada, y esto es su diferencial más fuerte para un TP: **no hay funcionalidad escondida detrás de un paywall**. Lo único pago es opcional:

- **Módulos de terceros del DoliStore**: conectores, plantillas, integraciones específicas. Sueltos, entre €10 y €100 por módulo, de una vez.
- **DoliCloud** (~€9 a €25 por mes): hosting gestionado por el proyecto, para no administrar el servidor. Mismo software.
- Soporte comercial de partners, opcional.

**Prueba:** no aplica. Se descarga el instalador y listo.

| Criterio | Cumple | Detalle |
|---|---|---|
| **0. Idioma español** | ✅ | Traducción completa incluida y muy cuidada; el sitio oficial y gran parte de la comunidad son hispanohablantes |
| 1. Tecnológicas | ✅ | PHP + MySQL/MariaDB. Requisitos muy bajos, corre en hosting compartido |
| 2. Instalación | ✅ | **El más fácil de todos**: instaladores automáticos todo-en-uno (DoliWamp para Windows incluye Apache + MySQL + PHP) para usuarios sin conocimientos técnicos |
| 3. Menú y navegabilidad | 🟡 | Los módulos se activan uno por uno, así que arranca simple y crece; la UI es densa |
| 4. Facilidad de uso | 🟡 | Funcional y clara, pero estéticamente anticuada |
| 5. Usuarios concurrentes | ✅ | Ilimitados |
| 6. Parametrización | ✅ | Módulos activables/desactivables con un clic, atributos extra por entidad desde la UI, diccionarios editables |
| 7. Import / Export | ✅ | Módulos nativos de importación y exportación con asistente y perfiles guardables |
| 8. Seguridad y auditoría | ✅ | Permisos muy granulares por módulo y por acción, grupos, log de eventos y de conexiones |
| 9. Explotación de datos | 🟡 | Estadísticas por módulo; no es BI |
| 10. Reportes | 🟡 | Informes predefinidos y exports configurables; ad hoc limitado |
| 11. Interfaz con otras apps | ✅ | API REST nativa, webhooks |
| 12. Integración | ✅ | Es un ERP completo: facturación, stock, compras, contabilidad, proyectos, RRHH |
| 13. Soporte y capacitación | 🟡 | Wiki y foro grandes con **mucho material en español**; el soporte pago es de partners |
| **A. Playwright** | ✅ | HTML renderizado en servidor, formularios clásicos, sin shadow DOM ni SPA. **Lo más simple de automatizar de todo el lote** |

---

## 5. YetiForce CRM — score 22/28

**Gratis:** open source, self-hosted, sin límite de usuarios. Fork muy avanzado de Vtiger, con 80+ módulos y 90+ paneles de configuración.

**¿Qué se paga entonces?** El software es completo y gratis. Se paga solo servicio:

- **Soporte oficial del equipo** y desarrollo a medida, por hora o por paquete.
- **Instalación y hosting gestionado**, opcional.
- No hay edición "Pro" con features extra: lo que ves es todo lo que hay.

**Prueba:** no aplica, se descarga.

| Criterio | Cumple | Detalle |
|---|---|---|
| **0. Idioma español** | ✅ | Paquete de idioma español disponible y mantenido |
| 1. Tecnológicas | ✅ | PHP + MySQL/PostgreSQL. Más exigente que Dolibarr: ~4 GB RAM recomendados y varias extensiones PHP |
| 2. Instalación | 🟡 | Instalador web, pero pide bastantes extensiones y ajustes de servidor |
| 3. Menú y navegabilidad | 🟡 | 80+ módulos: es abrumador al principio |
| 4. Facilidad de uso | 🟡 | Interfaz densa, orientada a usuario experto |
| 5. Usuarios concurrentes | ✅ | Ilimitados |
| 6. Parametrización | ✅ | 90+ paneles de configuración: campos, layouts y workflows por módulo, todo desde la UI |
| 7. Import / Export | ✅ | Import/export en todos los módulos |
| 8. Seguridad y auditoría | ✅ | **El más fuerte del open source**: permisos por campo, roles y perfiles, 2FA, encriptación de datos, auditoría detallada |
| 9. Explotación de datos | 🟡 | Widgets y KPIs; sin BI real |
| 10. Reportes | ✅ | Módulo de reportes propio incluido y gratis |
| 11. Interfaz con otras apps | ✅ | Web services / API REST, webhooks |
| 12. Integración | 🟡 | Ecosistema chico comparado con Odoo o Salesforce |
| 13. Soporte y capacitación | 🟡 | Documentación en inglés (proyecto polaco), comunidad chica |
| **A. Playwright** | ✅ | PHP + jQuery, DOM plano con IDs estables. Localhost, sin captcha |

---

## 6. SuiteCRM 8 — score 20/28

**Gratis:** open source GPLv3, self-hosted, sin límite de usuarios. Fork de SugarCRM Community Edition.

**¿Qué se paga entonces?** El software completo es gratis, incluido el módulo de reportes. Se paga:

- **SuiteCRM:OnDemand** (desde ~£95/mes): hosting oficial gestionado, backups, actualizaciones y **soporte con SLA**. No agrega funcionalidad.
- **Extensiones y themes del SuiteCRM Store**: pago por única vez, opcionales.
- Es decir: pagás por no administrar el servidor y por tener a quién llamar.

**Prueba:** no aplica, se descarga.

| Criterio | Cumple | Detalle |
|---|---|---|
| **0. Idioma español** | 🟡 | **No viene de fábrica**: hay que bajar `es_ES.zip` de SourceForge, instalarlo por Admin → Module Loader y correr Quick Repair and Rebuild. La traducción de los módulos nuevos de la v8 queda incompleta |
| 1. Tecnológicas | ✅ | LAMP: PHP 8 + MySQL/MariaDB + Apache. ~2 GB RAM, ~4 GB disco |
| 2. Instalación | 🟡 | Instalador web, pero exige ajustar permisos, cron y límites de PHP |
| 3. Menú y navegabilidad | 🟡 | Muchísimos módulos; menú cargado y poco intuitivo |
| 4. Facilidad de uso | ❌ | UI pesada y anticuada; su punto flojo |
| 5. Usuarios concurrentes | ✅ | Ilimitados |
| 6. Parametrización | ✅ | **Studio** para crear módulos, campos y relaciones. Motor de **Workflow** incluido |
| 7. Import / Export | ✅ | Import/export CSV en todos los módulos |
| 8. Seguridad y auditoría | ✅ | Roles, **Security Groups**, auditoría activable campo a campo, tracker de accesos |
| 9. Explotación de datos | 🟡 | Dashlets y gráficos básicos |
| 10. Reportes | ✅ | **Módulo Reports ad hoc incluido y gratis** — ventaja concreta sobre EspoCRM Community |
| 11. Interfaz con otras apps | ✅ | API V8 REST con OAuth2, API V4.1 legacy |
| 12. Integración | 🟡 | SuiteCRM Store, mucho menor que AppExchange |
| 13. Soporte y capacitación | 🟡 | Documentación y foro comunitario; soporte y formación pagos |
| **A. Playwright** | ✅ | v8 es Angular + Symfony, DOM accesible. Ojo con los módulos legacy que se renderizan embebidos |

---

## 7. HubSpot CRM Free — score 20/28

**Gratis:** permanente. 2 usuarios, 1.000 contactos, 1 pipeline, 2.000 emails/mes.

**¿Qué se paga entonces?** Es el caso donde el pago compra más cosas, y varias son justo criterios del TP:

- **Quitar el "Powered by HubSpot"** de los formularios y emails.
- **Automatizaciones y workflows** (Professional, ~$100/asiento): en Free no hay ninguna.
- **Reportes y dashboards custom** (Professional): en Free estás limitado a los prearmados.
- **Roles y permisos granulares** y **audit log** (Enterprise, ~$150/asiento): el criterio 8 en Free es directamente ❌.
- **Más asientos** (Free son 2) y **más contactos de marketing**.
- Starter (~$20/asiento) es el escalón chico: saca el branding y sube los límites, pero no trae automatización.

**Prueba:** 14 días de Professional; el plan Free no vence nunca.

| Criterio | Cumple | Detalle |
|---|---|---|
| **0. Idioma español** | ✅ | Interfaz en español, y **HubSpot Academy con certificaciones gratis en español** |
| 1. Tecnológicas | ❌ | Cloud puro |
| 2. Instalación | ✅ | **El onboarding más simple del mercado**: cuenta operativa en menos de 5 minutos |
| 3. Menú y navegabilidad | ✅ | Navegación clara por objetos, vistas guardadas, buscador global |
| 4. Facilidad de uso | ✅ | **La mejor UX del lote**; casi no requiere capacitación |
| 5. Usuarios concurrentes | 🟡 | 2 usuarios — el grupo es de 3, uno queda afuera |
| 6. Parametrización | 🟡 | Propiedades custom sí; objetos custom y automatizaciones son pagos |
| 7. Import / Export | ✅ | Import CSV/XLSX con mapeo y deduplicación, export de cualquier vista |
| 8. Seguridad y auditoría | ❌ | Sin roles granulares ni registro de auditoría en Free |
| 9. Explotación de datos | 🟡 | Dashboards prearmados; personalización limitada |
| 10. Reportes | 🟡 | Hasta 3 dashboards con 10 reportes; sin reportes custom ad hoc |
| 11. Interfaz con otras apps | ✅ | API REST, webhooks, sincronización nativa con Gmail y Outlook |
| 12. Integración | ✅ | +1.700 apps en el App Marketplace |
| 13. Soporte y capacitación | ✅ | Academy, blog y comunidad enormes |
| **A. Playwright** | 🟡 | React con `data-test-id` razonables, pero el login tiene **detección de bots y captcha**. Hay que loguearse a mano una vez y reusar la sesión con `storageState`. Además su ToS restringe el acceso automatizado |

---

## 8. Zoho CRM Free — score 20/28

**Gratis:** permanente, 3 usuarios, ~5.000 registros.

**¿Qué se paga entonces?** El Free es una versión recortada en parametrización y control:

- **Standard** (~$14/usuario/mes): reglas de **workflow**, más campos custom, vistas y funciones de scoring.
- **Professional** (~$23): **Blueprints** (procesos guiados), gestión de inventario, **y el audit log** — sin esto el criterio 8 queda en 🟡.
- **Enterprise** (~$40): **módulos custom**, Zia (IA), forecasting, permisos a nivel de campo, portales multiusuario.
- **Ultimate** (~$52): Zoho Analytics avanzado.
- También compra **más de 3 usuarios** y más registros.

**Prueba:** **15 días de Enterprise** al registrarse; al vencer degrada automáticamente a Free sin perder datos.

| Criterio | Cumple | Detalle |
|---|---|---|
| **0. Idioma español** | ✅ | **La mejor localización del lote**: interfaz, ayuda, soporte y facturación en español, con presencia comercial en Latinoamérica |
| 1. Tecnológicas | ❌ | Cloud puro |
| 2. Instalación | 🟡 | Sin instalación; asistente de configuración por módulos |
| 3. Menú y navegabilidad | ✅ | Módulos reordenables, vistas lista/Kanban/Canvas |
| 4. Facilidad de uso | ✅ | UI clara, traducción cuidada, buena app móvil |
| 5. Usuarios concurrentes | 🟡 | 3 usuarios — **coincide justo con el tamaño del grupo del TP** |
| 6. Parametrización | 🟡 | Campos y layouts sí; módulos custom, Blueprint y workflows son pagos |
| 7. Import / Export | ✅ | Import CSV/XLS con deduplicación, export completo |
| 8. Seguridad y auditoría | 🟡 | Roles y perfiles sí; **el audit log es de planes pagos** |
| 9. Explotación de datos | 🟡 | Reportes y dashboards estándar; sin Zia ni forecasting |
| 10. Reportes | 🟡 | Estándar y algunos custom; los avanzados son pagos |
| 11. Interfaz con otras apps | ✅ | API REST, webhooks, Zoho Flow, scripting Deluge |
| 12. Integración | ✅ | Zoho One (45+ apps), Marketplace, Google Workspace y Microsoft 365 |
| 13. Soporte y capacitación | ✅ | Zoho Academy, comunidad activa, **soporte en español** |
| **A. Playwright** | 🟡 | DOM manejable, pero el login puede pedir captcha y algunos módulos usan iframes. Conviene `storageState` y, para cargar datos, la API oficial |

> **Táctica para el TP:** usar los 15 días de Enterprise para documentar con capturas la auditoría, los Blueprints y los reportes avanzados; después seguir en Free.

---

## 9. Twenty CRM — score 20/28

**Gratis:** open source (AGPL), self-hosted por Docker, ilimitado. Es el CRM open source más moderno del lote: React + NestJS + GraphQL, UI estilo Notion/Airtable.

**¿Qué se paga entonces?** El código es el mismo; lo que se paga es **Twenty Cloud**, el hosting gestionado por el equipo (por usuario/mes según plan). No hay features retenidas en la versión self-hosted, aunque sí hay funcionalidad que **todavía no existe en el producto** — es joven.

**Prueba:** no aplica self-hosted; la nube tiene registro autoservicio.

| Criterio | Cumple | Detalle |
|---|---|---|
| **0. Idioma español** | 🟡 | Tiene i18n y español disponible, pero es reciente: quedan cadenas sin traducir |
| 1. Tecnológicas | ✅ | Node.js + PostgreSQL + Redis, vía Docker Compose. ~2 GB RAM |
| 2. Instalación | 🟡 | Un comando de Docker Compose, pero no hay instalador gráfico y hay que tocar variables de entorno |
| 3. Menú y navegabilidad | ✅ | UI limpia, vistas tabla/kanban, navegación por teclado |
| 4. Facilidad de uso | ✅ | **La mejor UX del grupo open source** |
| 5. Usuarios concurrentes | ✅ | Ilimitados |
| 6. Parametrización | ✅ | Objetos y campos custom desde la UI, workflows |
| 7. Import / Export | ✅ | Import/export CSV, API GraphQL y REST |
| 8. Seguridad y auditoría | 🟡 | Roles y permisos existen pero son jóvenes; auditoría básica |
| 9. Explotación de datos | 🟡 | Vistas, filtros y agrupaciones; sin BI |
| 10. Reportes | ❌ | **No tiene módulo de reportes** |
| 11. Interfaz con otras apps | ✅ | API GraphQL y REST, webhooks |
| 12. Integración | 🟡 | Ecosistema muy nuevo, pocas integraciones listas |
| 13. Soporte y capacitación | 🟡 | Documentación buena y Discord activo, pero producto joven |
| **A. Playwright** | ✅ | React moderno **con `data-testid` en los componentes** — pensado para testear. Localhost, sin captcha |

---

## 10. Vtiger CRM — One Pilot — score 19/28

**Gratis:** plan **One Pilot**, hasta **10 usuarios**, con topes de registros y funciones. Existe además una edición open source self-hosted, más limitada y con menos mantenimiento.

**¿Qué se paga entonces?**

- **One Growth** (~$12/usuario/mes): levanta los topes de registros y emails, workflows básicos.
- **One Professional** (~$30): **Module Designer**, reportes custom y programados, telefonía integrada, automatización de procesos.
- **One Enterprise** (~$42): permisos avanzados, sandbox, límites altos de API, soporte prioritario.
- El Free es explícitamente un "piloto": sirve para probar, no para operar.

**Prueba:** 15 días.

| Criterio | Cumple | Detalle |
|---|---|---|
| **0. Idioma español** | ✅ | Interfaz traducida y seleccionable por usuario; documentación mayormente en inglés |
| 1. Tecnológicas | ❌ | One Pilot es cloud (la edición open source sí es LAMP instalable) |
| 2. Instalación | 🟡 | Alta inmediata en la nube |
| 3. Menú y navegabilidad | ✅ | Módulos agrupados por área: ventas, soporte, marketing |
| 4. Facilidad de uso | ✅ | UI ordenada, más simple que SuiteCRM |
| 5. Usuarios concurrentes | ✅ | **10 usuarios gratis — el tope más alto entre los SaaS con free permanente** |
| 6. Parametrización | 🟡 | Campos y layouts custom sí; Module Designer es pago |
| 7. Import / Export | ✅ | Import/export CSV en todos los módulos |
| 8. Seguridad y auditoría | 🟡 | Roles, perfiles, grupos y jerarquía; login history sí, auditoría de campos limitada |
| 9. Explotación de datos | 🟡 | Insights y dashboards básicos |
| 10. Reportes | 🟡 | Estándar sí; custom y programados son pagos |
| 11. Interfaz con otras apps | ✅ | API REST, webhooks, telefonía y WhatsApp |
| 12. Integración | 🟡 | Extension Store propio, chico |
| 13. Soporte y capacitación | 🟡 | Documentación y comunidad; soporte prioritario pago |
| **A. Playwright** | 🟡 | DOM razonable, pero es SaaS: puede aparecer captcha y el alta pide verificación por SMS |

---

## 11. Krayin CRM — score 16/28

**Gratis:** open source **licencia MIT** — la más permisiva del lote. Laravel + Vue.js, self-hosted.

**¿Qué se paga entonces?** El core es gratis y la licencia MIT te deja incluso revenderlo. Se paga:

- **Extensiones oficiales del marketplace de Krayin**: WhatsApp, integraciones de e-mail, módulos de rubro. Pago único por extensión.
- **Soporte y desarrollo a medida** del equipo de Webkul.

**Prueba:** no aplica.

| Criterio | Cumple | Detalle |
|---|---|---|
| **0. Idioma español** | 🟡 | Tiene paquete de idiomas con español, con partes sin traducir |
| 1. Tecnológicas | ✅ | PHP + MySQL, requisitos bajos |
| 2. Instalación | 🟡 | Vía Composer y Artisan: hay que usar consola |
| 3. Menú y navegabilidad | ✅ | UI simple, pocos módulos bien ordenados |
| 4. Facilidad de uso | ✅ | Liviana y clara |
| 5. Usuarios concurrentes | ✅ | Ilimitados |
| 6. Parametrización | 🟡 | Atributos custom desde la UI; extender de verdad requiere programar en Laravel |
| 7. Import / Export | 🟡 | Import/export básico |
| 8. Seguridad y auditoría | 🟡 | Roles y grupos; auditoría limitada |
| 9. Explotación de datos | ❌ | Sin analítica |
| 10. Reportes | 🟡 | Reportes básicos |
| 11. Interfaz con otras apps | 🟡 | API REST parcial |
| 12. Integración | ❌ | Ecosistema mínimo |
| 13. Soporte y capacitación | 🟡 | Documentación correcta, comunidad chica |
| **A. Playwright** | ✅ | Laravel + Vue, DOM plano, localhost. Fácil |

---

## 12. Bitrix24 Free — score 13/28

**Gratis:** permanente, **usuarios ilimitados**, 5 GB. Con más de ~1.000 registros por módulo la búsqueda por texto deja de devolver resultados.

**¿Qué se paga entonces?** El Free es muy amplio en usuarios pero muy recortado en el CRM en sí:

- **Que la búsqueda siga funcionando** con más de ~1.000 registros, y el historial de leads.
- **Pipelines múltiples** y **automatizaciones** (robots y triggers): en Free no hay ninguna.
- **Reportes de CRM**: en Free son ❌.
- **Roles y permisos granulares**.
- **Telefonía**, más almacenamiento y acceso al Marketplace de apps.
- Se cobra **por organización, no por usuario**: Basic ~$49/mes (5 users) · Standard ~$99 (50) · Professional ~$199 (100) · Enterprise ~$399 (250). Para equipos grandes es de los más baratos por cabeza.
- Existe una **versión On-Premise** con licencia perpetua paga, que sí permitiría evaluar los criterios 1 y 2.

**Prueba:** 15-30 días de los planes pagos.

| Criterio | Cumple | Detalle |
|---|---|---|
| **0. Idioma español** | 🟡 | Disponible, pero la traducción es irregular: hay pantallas que quedan en inglés o ruso |
| 1. Tecnológicas | ❌ | Cloud en Free; la On-Premise es paga |
| 2. Instalación | 🟡 | Alta inmediata, pero la configuración inicial es larga |
| 3. Menú y navegabilidad | 🟡 | Es una intranet completa (CRM + tareas + chat + drive + telefonía): abruma |
| 4. Facilidad de uso | 🟡 | Jerarquía de menús confusa |
| 5. Usuarios concurrentes | ✅ | **Ilimitados — el único con concurrencia sin tope en su plan gratis** |
| 6. Parametrización | 🟡 | Campos custom sí; automatizaciones y pipelines múltiples son pagos |
| 7. Import / Export | ✅ | Import/export CSV de leads, contactos, empresas y negocios |
| 8. Seguridad y auditoría | ❌ | Sin roles granulares ni pistas de auditoría en Free |
| 9. Explotación de datos | 🟡 | Widgets de analítica básicos |
| 10. Reportes | ❌ | Reservados a los planes pagos |
| 11. Interfaz con otras apps | 🟡 | API REST sí, Marketplace bloqueado en Free |
| 12. Integración | 🟡 | Amplitud propia alta, integración con terceros limitada |
| 13. Soporte y capacitación | 🟡 | Cursos y webinars; soporte técnico solo pago |
| **A. Playwright** | ❌ | **El peor caso**: iframes anidados, DOM legacy muy pesado, captcha en login y mucho render dinámico |

---

## Matriz comparativa consolidada

| Criterio | Odoo | EspoCRM | Salesforce | Dolibarr | YetiForce | SuiteCRM | HubSpot | Zoho | Twenty | Vtiger | Krayin | Bitrix24 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **0. Español** | ✅ | ✅ | ✅ | ✅ | ✅ | 🟡 | ✅ | ✅ | 🟡 | ✅ | 🟡 | 🟡 |
| 1. Tecnológicas | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ✅ | ❌ |
| 2. Instalación | 🟡 | ✅ | 🟡 | ✅ | 🟡 | 🟡 | ✅ | 🟡 | 🟡 | 🟡 | 🟡 | 🟡 |
| 3. Navegabilidad | ✅ | ✅ | ✅ | 🟡 | 🟡 | 🟡 | ✅ | ✅ | ✅ | ✅ | ✅ | 🟡 |
| 4. Facilidad de uso | ✅ | ✅ | 🟡 | 🟡 | 🟡 | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | 🟡 |
| 5. Usuarios concurr. | ✅ | ✅ | 🟡 (2) | ✅ | ✅ | ✅ | 🟡 (2) | 🟡 (3) | ✅ | ✅ (10) | ✅ | ✅ |
| 6. Parametrización | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 🟡 | 🟡 | ✅ | 🟡 | 🟡 | 🟡 |
| 7. Import / Export | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 🟡 | ✅ |
| 8. Seguridad / audit. | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | 🟡 | 🟡 | 🟡 | 🟡 | ❌ |
| 9. Explotación datos | ✅ | 🟡 | ✅ | 🟡 | 🟡 | 🟡 | 🟡 | 🟡 | 🟡 | 🟡 | ❌ | 🟡 |
| 10. Reportes ad hoc | ✅ | 🟡 | ✅ | 🟡 | ✅ | ✅ | 🟡 | 🟡 | ❌ | 🟡 | 🟡 | ❌ |
| 11. Interfaz apps | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 🟡 | 🟡 |
| 12. Integración | ✅ | 🟡 | ✅ | ✅ | 🟡 | 🟡 | ✅ | ✅ | 🟡 | 🟡 | ❌ | 🟡 |
| 13. Soporte / capac. | ✅ | 🟡 | ✅ | 🟡 | 🟡 | 🟡 | ✅ | ✅ | 🟡 | 🟡 | 🟡 | 🟡 |
| **Score (máx. 28)** | **27** | **24** | **23** | **23** | **22** | **20** | **20** | **20** | **20** | **19** | **16** | **13** |
| **A. Playwright** | ✅ | ✅ | 🟡 | ✅ | ✅ | ✅ | 🟡 | 🟡 | ✅ | 🟡 | ✅ | ❌ |

---

## Qué se paga, en una tabla

| Herramienta | Qué te da gratis | Qué compra el pago |
|---|---|---|
| **Dolibarr** | Todo el producto | Nada de funcionalidad: solo módulos sueltos del DoliStore y hosting gestionado (DoliCloud) |
| **YetiForce** | Todo el producto | Solo servicio: soporte, instalación, desarrollo a medida |
| **Twenty** | Todo el producto | Solo el hosting gestionado (Twenty Cloud) |
| **Krayin** | Todo el core (MIT) | Extensiones del marketplace y soporte |
| **SuiteCRM** | Todo, incluidos los reportes | Hosting gestionado + SLA (OnDemand), extensiones del store |
| **EspoCRM** | Core completo | **Módulo de reportes, workflows y BPM** (Advanced Pack ~$150/año), packs verticales, hosting |
| **Odoo** | CRM completo self-hosted | **Studio**, apps propietarias, **upgrades automáticos de versión**, hosting y soporte |
| **Salesforce** | Funcionalidad Enterprise completa | **Derecho de uso comercial**, capacidad (datos, archivos, API), usuarios, SLA, features de tier alto |
| **Vtiger** | 10 usuarios con topes | Levantar topes, Module Designer, reportes custom, telefonía |
| **Zoho** | 3 usuarios, lo básico | Workflows, **audit log**, Blueprints, módulos custom, IA, más usuarios |
| **HubSpot** | 2 usuarios, 1.000 contactos | Quitar branding, **automatizaciones**, **reportes custom**, **roles y audit log**, más asientos |
| **Bitrix24** | Usuarios ilimitados, CRM básico | **Búsqueda con >1.000 registros**, pipelines múltiples, **automatizaciones**, **reportes**, roles, telefonía |

**Lectura para el TP:** hay dos modelos de negocio distintos y conviene decirlo en la conclusión.

- **Open source puro** (Dolibarr, YetiForce, Twenty, Krayin, SuiteCRM): el producto está completo y el dinero paga *servicio* — que alguien administre el servidor y te atienda el teléfono. El costo real es el tiempo del que lo mantiene.
- **Freemium** (HubSpot, Zoho, Bitrix24, Vtiger): el plan gratis es una demo funcional a la que le faltan justo las piezas que una empresa necesita — automatización, reportes y auditoría. El costo aparece cuando el uso se vuelve serio.
- **Salesforce** es un tercer caso: te da todo gratis para aprender, pero prohíbe usarlo para trabajar.

---

## Facilidad de alta — ¿lo puede conseguir una persona cualquiera?

Ninguna pide tarjeta de crédito ni contacto con un vendedor para su plan gratuito.

| Herramienta | Dónde se saca | Tarjeta | ¿Pide empresa? | Gmail | Fricción |
|---|---|---|---|---|---|
| **Dolibarr** | dolibarr.org/downloads o GitHub — instalador DoliWamp para Windows | No | No | Sin registro | **Nula** |
| **EspoCRM** | espocrm.com/download o GitHub Releases | No | No | Sin registro | **Nula** |
| **SuiteCRM** | suitecrm.com/download o GitHub Releases | No | No | Sin registro | **Nula** |
| **YetiForce** | yetiforce.com o GitHub | No | No | Sin registro | **Nula** |
| **Krayin** | GitHub (krayin/laravel-crm) | No | No | Sin registro | **Nula** |
| **Twenty** | GitHub + Docker Compose | No | No | Sin registro | **Nula** |
| **Odoo Community** | Docker Hub o GitHub (la descarga del instalador sí pide nombre y mail) | No | No | Sin registro por Docker | **Nula** |
| **Zoho CRM Free** | zoho.com/crm, o login con Google | No | Texto libre | Sí | Baja |
| **Bitrix24 Free** | bitrix24.es, e-mail o cuenta de Google | No | No | Sí | Baja |
| **HubSpot Free** | hubspot.com → "Empezar gratis" | No | Texto libre | Sí | Baja |
| **Salesforce DE** | developer.salesforce.com/signup | No | Campo "Company" obligatorio, texto libre | Sí | Baja — el *username* va con formato de e-mail y puede ser inventado |
| **Vtiger One Pilot** | vtiger.com, plan gratuito | No | Texto libre | Sí | Baja — puede pedir verificación por SMS |

**Mantenimiento de las cuentas:**

- **Salesforce DE:** no vence *mientras se use*. Si pasan **45 días sin ingresar**, la org se desactiva. Entrar una vez por mes.
- **Zoho:** al día 15 el trial de Enterprise cae solo a Free, sin perder datos.
- **Self-hosted:** no hay cuenta que caducar. Lo único a cuidar es no perder la máquina o el contenedor — sacar backup de la base al cerrar cada avance.

**Recomendación:** dar de alta con un Gmail personal, no con el institucional, para que quede bajo control del grupo.

---

## Automatización de las pruebas

La consigna pide *probar* trece cosas en cada herramienta. Hacerlo a mano tres veces es mucho trabajo y, peor, deja evidencia despareja. Automatizarlo resuelve las dos cosas.

### La herramienta

**Playwright** (Microsoft, licencia MIT, gratis y sin límites). Corre en Node.js, Python, Java y .NET. Tres cosas lo hacen ideal para este TP:

- **`npx playwright codegen <url>`** abre un navegador, graba lo que hacés y escribe el código solo. No hace falta saber programar para el primer test.
- **Genera la evidencia sola**: `--screenshot=on`, `--video=on` y el **trace viewer** producen capturas, videos y una traza navegable de cada paso. Eso es exactamente el material que va al informe.
- **Múltiples `browserContext` en paralelo** = varios usuarios simultáneos de verdad, cada uno con su sesión.

Alternativas gratuitas si Playwright no cierra: **Selenium WebDriver**, **Cypress** (core open source), **Puppeteer**, o **Robot Framework** con la Browser library (que por debajo usa Playwright y se escribe en tablas, sin código). Para carga y concurrencia real, **k6**. Para probar las APIs del criterio 11, **Bruno** o **Postman** en su plan gratuito.

### Qué criterio se puede automatizar y cómo

| Criterio | ¿Automatizable? | Cómo |
|---|---|---|
| 1. Tecnológicas | No con Playwright | `docker stats` / Monitor de recursos midiendo RAM y CPU en reposo y bajo uso |
| 2. Instalación | No con Playwright | Script de shell que instala y **mide el tiempo**; se documenta la salida |
| 3. Navegabilidad | ✅ | Contar clicks y medir tiempo desde el login hasta crear un lead. Playwright mide y captura cada paso |
| 4. Facilidad de uso | Parcial | Se automatiza la métrica (clicks, tiempos, errores); la percepción sigue siendo subjetiva |
| 5. Usuarios concurrentes | ✅ **el mejor caso** | N `browserContext` en paralelo editando el mismo registro: se ve si hay bloqueo, si se pisan los datos o si el plan corta el acceso |
| 6. Parametrización | ✅ | Crear un campo custom por UI y verificar que aparece en el formulario y en la vista de lista |
| 7. Import / Export | ✅ | Importar un CSV, exportarlo y **comparar los dos archivos** — diferencias de formato, encoding y campos perdidos |
| 8. Seguridad y roles | ✅ **muy demostrativo** | Dos contextos con roles distintos: el restringido intenta abrir el registro y se verifica que recibe 403 o no lo ve. Igual para la auditoría: hacer un cambio y verificar que quedó registrado |
| 9. Explotación de datos | ✅ | Cargar el dataset, abrir el dashboard, captura |
| 10. Reportes | ✅ | Generar el reporte, descargar el PDF/CSV y verificar el contenido |
| 11. Interfaz con otras apps | ✅ | Con `request` de Playwright o con Bruno: crear un registro por API y verificar en la UI que apareció |
| 12. Integración | Parcial | Se puede probar un webhook end-to-end; el resto es análisis |
| 13. Soporte | No | Es cualitativo |

### Dónde conviene automatizar y dónde no

**Los self-hosted son el terreno ideal** (Dolibarr, EspoCRM, Odoo, YetiForce, SuiteCRM, Twenty, Krayin): corren en `localhost`, sin Cloudflare, sin captcha, sin MFA, sin rate limits. Se puede resetear la base entre pruebas para que cada test arranque limpio, y sembrar datos por API o por SQL en lugar de clickear.

**En los SaaS hay tres obstáculos reales:**

1. **Detección de bots y captcha en el login** (HubSpot, Zoho, Bitrix24, Vtiger). Se resuelve logueándose a mano una vez y guardando la sesión con `context.storageState({path:'auth.json'})`, para que los tests arranquen ya autenticados.
2. **MFA obligatoria** (Salesforce). En una org Developer Edition se puede eximir con el permiso correspondiente.
3. **Los términos de servicio.** HubSpot y Salesforce restringen el acceso automatizado no autorizado a sus plataformas. Para un TP académico sobre la propia cuenta gratuita el riesgo práctico es bajo, pero lo prudente es **automatizar fuerte sobre los self-hosted y en los SaaS usar la API oficial** (que sí está documentada y permitida) más recorridos manuales con captura.

**Caso especial, Salesforce:** es el más difícil de automatizar por UI. Los Lightning Web Components encapsulan todo en shadow DOM y **Lightning Web Security fuerza modo `closed`** en parte de ellos; los locators por rol y texto de Playwright atraviesan solo el shadow abierto. Sumale el re-render asíncrono y tres releases al año que cambian el DOM. Para Salesforce conviene ir por su **API REST** y dejar la UI para capturas manuales.

**Caso especial, Bitrix24:** iframes anidados y DOM legacy pesado. Es el único del lote donde automatizar cuesta más que hacerlo a mano.

### Cómo aprovecharlo en el informe

Un solo repositorio con un test por criterio, corrido contra las tres herramientas elegidas, produce:

- Capturas y videos numerados que se pegan directo en el informe, todos tomados con el mismo dataset y los mismos pasos.
- Números comparables y no opinables: clicks para crear un lead, segundos hasta que carga el dashboard, cuántos usuarios simultáneos aguanta.
- Una sección de "método de evaluación" que rara vez aparece en un TP de esta materia.

---

## TABLA DE DECISIÓN — para elegir las 3

Esta es la tabla para decidir. Tres conceptos distintos que conviene no mezclar:

- **Demostrable gratis**: criterios que se pueden *probar y filmar* sin pagar un peso. Es lo que sostiene el informe.
- **Solo pagando**: el producto **sí cumple** el criterio, pero la función está detrás del paywall. Igual sirve: se describe con documentación oficial y capturas del sitio, o se demuestra durante el trial. En el informe se aclara "disponible en plan X".
- **No existe**: el producto no lo tiene en ninguna edición. Es el único caso que realmente resta.

### Cuadro de decisión

| Herramienta | Cómo conseguirlo gratis | Esquema de pago | Criterios demostrables gratis | Criterios que quedan para la parte paga | Videos automáticos con Playwright |
|---|---|---|---|---|---|
| **Dolibarr** | Descarga directa, instalador DoliWamp de 1 clic. Sin registro | No hay edición paga. Solo módulos sueltos del DoliStore (€10-100 c/u) y hosting DoliCloud (€9-25/mes) | **13 de 13** | **Ninguno** | ✅ **Muy fácil** — HTML server-side, formularios clásicos, cero shadow DOM |
| **Odoo Community** | Docker o GitHub, sin dejar mail. (One App Free en la nube como plan B) | Standard $24,90 / Custom $37,40 por user/mes: Studio, apps propietarias, upgrades de versión, soporte | **13 de 13** | Solo el *confort* del criterio 6 (Studio drag & drop); en Community se hace por XML | ✅ **Fácil** — cliente OWL sin shadow DOM, localhost |
| **YetiForce** | Descarga directa de GitHub. Sin registro | No hay edición paga. Solo soporte y desarrollo a medida | **13 de 13** | **Ninguno** | ✅ **Fácil** — PHP + jQuery, IDs estables |
| **SuiteCRM 8** | Descarga directa de GitHub. Sin registro | OnDemand desde £95/mes = hosting + SLA. Extensiones del store | **13 de 13** (el español pide instalar el pack a mano) | **Ninguno** | ✅ **Fácil** — Angular; ojo con módulos legacy embebidos |
| **EspoCRM** | Descarga directa. Sin registro | Advanced Pack ~$150/año (reportes, workflows, BPM); Cloud ~$15/user/mes | **11 de 13** | **9** (BI) y **10** (módulo de reportes) → Advanced Pack | ✅ **El más fácil de todos** — DOM plano con `data-name` |
| **Salesforce DE** | developer.salesforce.com/signup, Gmail, sin tarjeta, no vence | $25 a $550/user/mes. Compra **derecho de uso comercial**, capacidad y SLA — no features | **11 de 13** (1 y 2 no aplican por ser cloud) | **Ninguno por precio.** Todo Enterprise está en la DE gratis | 🟡 **Difícil** — shadow DOM con Lightning Web Security en modo `closed`, MFA, re-render async. Conviene API + capturas manuales |
| **Twenty** | GitHub + Docker Compose. Sin registro | Twenty Cloud (hosting). Sin features retenidas | **11 de 13** | **Ninguno** | ✅ **Fácil y limpio** — React con `data-testid` en todo |
| **Zoho CRM** | zoho.com/crm con Gmail. Arranca en trial Enterprise 15 d → cae solo a Free (3 users) | $14 a $52/user/mes: workflows, **audit log**, Blueprints, módulos custom, Zia | **9 de 13** en Free — **13 de 13 durante los 15 días** | **6, 8, 9, 10** → todos demostrables en el trial. **Ninguno queda sin evidencia** | 🟡 **Media** — captcha en login, algunos iframes. Usar `storageState` |
| **Vtiger One Pilot** | vtiger.com, 10 usuarios gratis | $12 a $42/user/mes: topes, Module Designer, reportes custom | **10 de 13** | **6, 10** → cubribles en el trial de 15 días | 🟡 **Media** — SaaS, posible captcha y SMS en el alta |
| **HubSpot Free** | hubspot.com, Gmail, 2 users | $20 a $150/asiento/mes: branding, automatización, reportes custom, roles y **audit log** (Enterprise) | **9 de 13** | **6, 9, 10** en el trial Pro de 14 d. **8 (auditoría) es Enterprise: no se puede demostrar ni con trial** | 🟡 **Media** — detección de bots en login, `storageState` obligatorio |
| **Krayin** | GitHub. Sin registro | Extensiones del marketplace y soporte | **10 de 13** | Ninguno | ✅ **Fácil** — Laravel + Vue |
| **Bitrix24 Free** | bitrix24.es con Gmail, usuarios ilimitados | $49 a $399/mes **por empresa**: búsqueda >1.000 reg., pipelines, automatización, reportes, roles | **8 de 13** | **6, 8, 10** → cubribles en el trial de 15-30 días | ❌ **Malo** — iframes anidados, DOM legacy, captcha. Cuesta más que hacerlo a mano |

### ¿Gratis, pago o inexistente? — criterio por criterio

✅ = se prueba gratis · 💰 = existe, pero hay que pagar (o usar el trial) · ❌ = no existe en ninguna edición · — = no aplica

| Criterio | Dolibarr | Odoo | YetiForce | SuiteCRM | EspoCRM | Salesforce | Twenty | Zoho | Vtiger | HubSpot | Krayin | Bitrix24 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1. Tecnológicas | ✅ | ✅ | ✅ | ✅ | ✅ | — | ✅ | — | — | — | ✅ | — |
| 2. Instalación | ✅ | ✅ | ✅ | ✅ | ✅ | — | ✅ | — | — | — | ✅ | — |
| 3. Navegabilidad | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 4. Facilidad de uso | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 5. Usuarios concurr. | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ (2) | ✅ | ✅ (3) | ✅ (10) | ✅ (2) | ✅ | ✅ |
| 6. Parametrización | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 💰 | 💰 | 💰 | ✅ | 💰 |
| 7. Import / Export | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 8. Seguridad / audit. | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 💰 | 💰 | 💰 | ✅ | 💰 |
| 9. Explotación datos | ✅ | ✅ | ✅ | ✅ | 💰 | ✅ | ✅ | 💰 | ✅ | 💰 | ❌ | ✅ |
| 10. Reportes ad hoc | ✅ | ✅ | ✅ | ✅ | 💰 | ✅ | ❌ | 💰 | 💰 | 💰 | ✅ | 💰 |
| 11. Interfaz apps | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| 12. Integración | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |
| 13. Soporte | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Gratis** | **13** | **13** | **13** | **13** | **11** | **11** | **11** | **9** | **10** | **9** | **10** | **8** |
| **Solo pagando** | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 4 | 2 | 4 | 0 | 4 |
| **No existe** | 0 | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | 2 | 0 |

Los guiones de Salesforce, Zoho, Vtiger, HubSpot y Bitrix24 en los criterios 1 y 2 no son una falla del producto: son SaaS, no hay hardware ni instalación que evaluar. En el informe se escribe "no aplica" y se explica por qué — eso también es una conclusión válida.

### Tres combinaciones posibles

| Opción | Terna | Gratis demostrable | Videos automáticos | Para qué caso |
|---|---|---|---|---|
| **A — recomendada** | **Dolibarr + Odoo Community + Zoho CRM** | 13 + 13 + 9 (13 en el trial) | ✅ ✅ 🟡 | La más equilibrada. Dos self-hosted que dan videos sin pelear y un SaaS conocido, con el mejor español del lote, cuyo trial de 15 días demuestra hasta lo pago |
| **B — más prestigio** | **Dolibarr + Odoo Community + Salesforce DE** | 13 + 13 + 11 | ✅ ✅ 🟡 difícil | Si querés el nombre grande en el informe y no te importa hacer las capturas de Salesforce a mano. Ventaja fuerte: en Salesforce **nada está bloqueado por precio** |
| **C — más rápida de montar** | **EspoCRM + Twenty + HubSpot Free** | 11 + 11 + 9 | ✅ ✅ 🟡 | Si el tiempo apremia: EspoCRM instala en 20 min y Twenty con un `docker compose up`. Ambos son los más amigables para Playwright. HubSpot aporta el contraste de UX |

**Elijo la A.** Dolibarr y Odoo cubren los 13 criterios **sin pagar nada y sin nada escondido**, se instalan de verdad (criterios 1 y 2, que son los que ninguna nube te deja evaluar) y se automatizan sin fricción. Zoho suma el contrapunto de SaaS freemium: su plan gratis muestra los agujeros típicos del modelo (sin auditoría, sin workflows) y el trial de 15 días te deja demostrar esos mismos criterios antes de que caiga a Free. Con eso el TP queda con **los 13 criterios demostrados con evidencia en al menos dos herramientas**, y con material para explicar los tres modelos de negocio.

Si el grupo prefiere sonar más "empresarial" frente al curso, la B es igual de sólida — solo hay que aceptar que las pruebas de Salesforce se filman a mano.

### Videos automáticos — la configuración concreta

Playwright graba video, saca capturas y guarda una traza navegable de cada test sin escribir una línea extra. Alcanza con este `playwright.config.ts`:

```ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  outputDir: 'evidencia',
  use: {
    video: 'on',            // graba TODOS los tests, no solo los que fallan
    screenshot: 'on',
    trace: 'on',
    locale: 'es-AR',        // fuerza la UI en español: sirve para el criterio 0
    viewport: { width: 1440, height: 900 },
  },
  reporter: [['html', { outputFolder: 'informe-playwright' }]],
});
```

Flujo de trabajo, sin saber programar:

```bash
npm init playwright@latest          # instala todo
npx playwright codegen http://localhost:8080   # grabás clickeando, sale el código
npx playwright test                 # corre y deja los videos en evidencia/
npx playwright show-report          # informe HTML con video embebido por test
```

Nombrar cada test con el número de criterio (`criterio-08-roles-y-auditoria.spec.ts`) hace que la carpeta `evidencia/` quede ordenada igual que el informe, con un video por criterio y por herramienta.

**Detalle práctico:** el mismo test corrido contra las tres herramientas produce videos comparables lado a lado. Eso es lo que hace fuerte la comparación — no son tres demos distintas, es la misma prueba tres veces.

---

## Variantes según el caso de estudio

| Si el caso es… | Usar… | Motivo |
|---|---|---|
| Se quiere la instalación más simple posible | **Dolibarr** | Instalador DoliWamp de un clic en Windows, con Apache, MySQL y PHP incluidos |
| Se prefiere algo liviano y prolijo de administrar | **EspoCRM** | 20 min de instalación, score 24, el más fácil de automatizar |
| El foco es seguridad, roles y auditoría | **YetiForce** | Permisos por campo, 2FA y encriptación, todo gratis |
| Se quieren reportes ad hoc gratis y self-hosted | **SuiteCRM 8** | Módulo Reports incluido; ojo con el pack de español manual |
| Se busca mostrar un CRM moderno | **Twenty** | La mejor UX open source y `data-testid` en todo, ideal para Playwright |
| Empresa grande con presupuesto cero | **Bitrix24 Free** | Usuarios ilimitados, aunque flojo en 8 y 10 y difícil de automatizar |
| Equipo de hasta 10 personas en la nube | **Vtiger One Pilot** | Mejor tope de usuarios entre los SaaS gratis |
| Se prioriza capacitación y facilidad de uso | **HubSpot Free** | Academy en español y la mejor UX del mercado |

---

## Descartadas

| Herramienta | Motivo | Precio | Prueba |
|---|---|---|---|
| **EngageBay** | **Idioma**: el plan gratis es muy atractivo (15 usuarios, 250 contactos, sin tarjeta), pero la interfaz es principalmente en inglés y no hay español confirmado. Incumple el requisito obligatorio | desde ~$12,74/user/mes | Free permanente |
| **Freshsales** | **Riesgo de alta**: Freshworks empuja a registrarse con e-mail corporativo y puede rechazar Gmail. Y su plan Free es el más pobre del lote — sin reportes, sin analítica, sin campos custom | Growth ~$9 · Pro ~$39 · Enterprise ~$59 /user/mes | 21 días |
| **Pipedrive** | Sin plan gratuito: el trial se agota antes de la presentación final | desde ~$14/user/mes anual | 14 días |
| **monday CRM** | El free de monday.com es para proyectos, no CRM | Basic ~$12 · Standard ~$17 · Pro ~$28 /asiento/mes | 14 días |

> **Sobre Freshsales y el mail de la facultad:** un dominio institucional como `@alumnos.unimoron.edu.ar` probablemente pase el filtro de "business email", porque no es un proveedor gratuito. No está confirmado, y no conviene atar el TP a que un formulario acepte cierto dominio habiendo 12 alternativas que entran con cualquier Gmail. Si alguien del grupo prueba y entra, se puede reincorporar.

**Otros CRM gratuitos revisados y no incluidos**, por ser demasiado limitados, estar poco mantenidos o no ser CRM de ventas: Agile CRM (10 usuarios gratis, producto estancado), Flowlu, Capsule e Insightly (2 usuarios), Bigin de Zoho (1 usuario), Brevo (orientado a e-mail marketing), Frappe CRM y ERPNext (open source, español parcial), CiviCRM (para ONGs), OroCRM y Corteza (open source B2B, comunidad chica), Monica (CRM personal, no empresarial). Sirven para citar en la sección *"Identificación de alternativas de mercado"*.

---

## Cómo estirar las pruebas si hiciera falta

- El grupo son 3 personas → **3 trials por herramienta**, escalonados: uno arranca en septiembre, otro en octubre, otro en noviembre.
- Alias de Gmail (`nombre+tp1@gmail.com`, `+tp2`, `+tp3`) generan cuentas distintas sobre la misma casilla; funciona en Zoho, HubSpot, Bitrix24 y Vtiger.
- Salesforce Developer Edition: se pueden crear varias org sin costo y ninguna vence.
- Los self-hosted no tienen vencimiento — conviene anclar ahí la evidencia pesada del trabajo.

---

## Fuentes

- [Zoho CRM Pricing](https://www.zoho.com/crm/zohocrm-pricing.html)
- [Salesforce Sales Pricing](https://www.salesforce.com/sales/pricing/)
- [Salesforce — política de expiración de las org Developer Edition](https://help.salesforce.com/s/articleView?id=release-notes.rn_de_org_expiration.htm&language=en_US&release=238&type=5)
- [Bitrix24 CRM gratis](https://www.bitrix24.com/tools/crm/)
- [HubSpot Free Plan Limits 2026](https://www.usecarly.com/blog/hubspot-free-plan-limits/)
- [Dolibarr — sitio oficial en español](https://www.dolibarr.org/?lang=es&l=es) · [descargas](https://www.dolibarr.org/downloads.php)
- [Twenty CRM](https://twenty.com/)
- [Krayin CRM](https://krayincrm.com/) · [GitHub](https://github.com/krayin/laravel-crm)
- [EspoCRM en español](https://www.espocrm.com/es/)
- [SuiteCRM — instalación de language packs](https://docs.suitecrm.com/8.x/admin/installation-guide/languages/install-a-new-language/)
- [Comparativa CRM open source 2026](https://growcrm.io/2026/01/04/top-20-open-source-self-hosted-crms-in-2025/) · [benchmark Marmelab](https://marmelab.com/blog/2026/01/09/open-source-crm-benchmark-2026.html)
- [EngageBay pricing](https://www.engagebay.com/pricing/all-in-one)
- [Salesforce testing con Playwright — desafíos de shadow DOM](https://gearset.com/blog/salesforce-ui-testing-challenges/)
- [Playwright storageState](https://www.browserstack.com/guide/playwright-storage-state) · [detección de bots](https://www.browserstack.com/guide/playwright-bot-detection)

> Los precios cambian seguido. Verificar contra las páginas oficiales antes de la entrega.
