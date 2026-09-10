# Fortalezas cruzadas — TP SIE 3340

Por cada criterio, las fortalezas de cada herramienta **que son debilidad en las otras dos**.

**Código:** `F05-E2` = criterio 05, EspoCRM, fortaleza 2. `E` EspoCRM · `B` Bitrix24 · `T` Twenty.
Cada fortaleza se demuestra con el caso de prueba de `Casos-de-prueba.md` que se indica entre paréntesis.

> **Aclaración metodológica.** El piso es 3 fortalezas por herramienta por criterio; donde hay material genuino se llega a 5 o 6. Donde no llega, se marca ⚠ con el motivo en vez de inventar. Esos huecos son hallazgos del análisis, no faltantes del trabajo — el caso más claro es Twenty en el criterio 10.

---

## Criterio 1 — Restricciones tecnológicas

**EspoCRM**
- `F01-E1` Corre con ~300 MB de RAM: **6× menos que Twenty** (C01-01, C01-05)
- `F01-E2` LAMP estándar: anda en cualquier hosting compartido barato (C01-04)
- `F01-E3` Imagen Docker de ~600 MB contra los ~3 GB de Twenty (C01-07)
- `F01-E4` Arranca en frío en ~15 s contra ~60 s de Twenty (C01-14)
- `F01-E5` Acepta MySQL o MariaDB, indistinto (C01-03)
↳ **Débil en:** Twenty (pesado), Bitrix24 (no se puede medir, es caja negra)

**Bitrix24**
- `F01-B1` Cero requisitos de hardware: no hay servidor que mantener (C01-08)
- `F01-B2` Escala sin que el usuario haga nada (C01-08)
- `F01-B3` No consume recursos de la máquina del usuario (C01-01 comparado)
- `F01-B4` Disponible desde cualquier dispositivo sin instalar (C01-09)
↳ **Débil en:** EspoCRM y Twenty, que exigen una máquina encendida

**Twenty**
- `F01-T1` Stack moderno Node + PostgreSQL, más escalable en concurrencia (C01-05)
- `F01-T2` PostgreSQL da mejor integridad y consultas que MySQL (C01-06)
- `F01-T3` Arquitectura pensada para contenedores desde el diseño (C01-07)
- `F01-T4` Redis integrado para caché: mejor rendimiento con volumen (E5-03)
↳ **Débil en:** EspoCRM (arquitectura PHP clásica), Bitrix24 (no se conoce el stack)

---

## Criterio 2 — Instalación y configuración

**EspoCRM**
- `F02-E1` **El único con instalador web guiado** paso a paso (C02-01)
- `F02-E2` Se instala sin tocar la consola (C02-01)
- `F02-E3` Detecta y explica las dependencias que faltan (C02-03)
- `F02-E4` ~20 minutos de punta a punta (C02-01)
- `F02-E5` Reinstalable sobre una base existente sin perder datos (C02-14)
↳ **Débil en:** Twenty (solo consola), Bitrix24 (no aplica, pero tampoco se puede instalar)

**Bitrix24**
- `F02-B1` **Cero instalación**: usable en menos de 5 minutos (C02-08)
- `F02-B2` Sin dependencias, versiones ni servidor que configurar (C02-08)
- `F02-B3` Asistente inicial que arma el CRM según el rubro (C02-09)
- `F02-B4` HTTPS y certificado ya resueltos (C08-14)
↳ **Débil en:** EspoCRM y Twenty, donde HTTPS hay que configurarlo a mano

**Twenty**
- `F02-T1` Un solo `docker compose up -d` levanta todo el stack (C02-05)
- `F02-T2` Entorno reproducible: mismo resultado en cualquier máquina (C02-05)
- `F02-T3` Desinstalación limpia con `down -v`, sin residuos (C02-12)
- `F02-T4` Configuración declarativa en un `.env` versionable (C02-07)
↳ **Débil en:** EspoCRM sobre XAMPP (deja rastros), Bitrix24 (no se puede borrar del todo, C02-13)

---

## Criterio 3 — Menú, despliegue y navegabilidad

**EspoCRM**
- `F03-E1` Pestañas reordenables desde configuración, sin código (C03-04)
- `F03-E2` Agrupación de módulos en desplegables (C03-05)
- `F03-E3` Menú acotado y entendible: solo CRM, sin ruido (C03-03)
- `F03-E4` Vistas filtradas guardables y reutilizables (C03-12)
↳ **Débil en:** Bitrix24 (menú saturado por la suite), Twenty (menos configurable)

**Bitrix24**
- `F03-B1` Buscador global que cruza CRM, tareas, chat y archivos (C03-10)
- `F03-B2` Menú lateral personalizable ocultando módulos (C03-15)
- `F03-B3` Acceso a muchas herramientas sin cambiar de aplicación (C03-08)
- `F03-B4` Vista de embudo integrada al listado (C09-02)
↳ **Débil en:** EspoCRM y Twenty, que solo buscan dentro del CRM

**Twenty**
- `F03-T1` **Navegación completa por teclado**, sin tocar el mouse (C03-06)
- `F03-T2` Paleta de comandos con atajo, estilo herramienta moderna (C03-14)
- `F03-T3` Cambio instantáneo tabla ↔ kanban sin recargar (C03-07)
- `F03-T4` Menor cantidad de clicks para crear un registro (C03-01)
- `F03-T5` Interfaz sin superposición de paneles (C03-09 comparado)
↳ **Débil en:** Bitrix24 (sliders que se apilan), EspoCRM (navegación clásica con mouse)

---

## Criterio 4 — Interfaz y facilidad de uso

**EspoCRM**
- `F04-E1` **El mejor español de las tres**: traducción completa y coherente (C04-06)
- `F04-E2` Interfaz predecible, de curva de aprendizaje corta (C04-04)
- `F04-E3` Mensajes de validación claros y en español (C04-10)
- `F04-E4` Menos campos obligatorios para dar de alta un registro (C04-14)
↳ **Débil en:** Bitrix24 (traducción irregular, C04-07), Twenty (cadenas sin traducir, C04-08)

**Bitrix24**
- `F04-B1` Tours guiados y ayuda contextual dentro de la aplicación (C04-05)
- `F04-B2` Material de capacitación propio muy abundante (C13-04)
- `F04-B3` Interfaz familiar para quien usó redes sociales corporativas (C04-01)
- `F04-B4` Onboarding asistido en el primer ingreso (C02-09)
↳ **Débil en:** EspoCRM y Twenty, que no tienen tours ni ayuda contextual

**Twenty**
- `F04-T1` **La interfaz más moderna** de las tres (C04-03)
- `F04-T2` Edición en línea desde la tabla, sin abrir el registro (C04-12)
- `F04-T3` Modo oscuro nativo y completo (C04-13)
- `F04-T4` Respuesta más fluida al listar registros (C04-11)
- `F04-T5` Interfaz limpia, sin funciones que distraigan (C04-01)
↳ **Débil en:** EspoCRM (estética funcional pero antigua), Bitrix24 (saturada)

---

## Criterio 5 — Usuarios concurrentes

**EspoCRM**
- `F05-E1` **Detecta la colisión al guardar** y avisa (C05-01, C05-07)
- `F05-E2` ACL por equipos: aísla lo que cada grupo ve (C05-10)
- `F05-E3` Sin tope de usuarios por licencia (C05-04)
- `F05-E4` Avisa cuando otro usuario borró el registro abierto (C05-09)
↳ **Débil en:** Bitrix24 (el último guardado pisa sin avisar, C05-02), Twenty (permisos jóvenes)

**Bitrix24**
- `F05-B1` **Indicador de presencia**: muestra quién está viendo el registro (C05-05)
- `F05-B2` Chat integrado sobre el propio registro (C05-11)
- `F05-B3` Usuarios ilimitados sin infraestructura propia (C05-04)
- `F05-B4` Notificaciones en vivo entre usuarios (E1-06)
↳ **Débil en:** EspoCRM y Twenty, que no tienen presencia ni chat

**Twenty**
- `F05-T1` **Sincronización en tiempo real**: el cambio aparece sin refrescar (C05-03, C05-06)
- `F05-T2` Merge sin conflicto cuando se editan campos distintos (C05-14)
- `F05-T3` Sin tope de usuarios (C05-04)
- `F05-T4` Arquitectura Node más eficiente con sesiones simultáneas (C05-08)
↳ **Débil en:** EspoCRM (hay que refrescar), Bitrix24 (sin merge por campo)

---

## Criterio 6 — Parametrización

**EspoCRM**
- `F06-E1` **Entity Manager**: crea entidades nuevas completas sin código (C06-03)
- `F06-E2` Layout Manager con arrastrar y soltar (C06-06)
- `F06-E3` **Motor de fórmulas** para campos calculados (C06-07)
- `F06-E4` Relaciones N:N entre entidades desde la UI (C06-12)
- `F06-E5` Ningún cambio requiere reiniciar el servicio (C06-11)
- `F06-E6` Pipelines múltiples sin costo (C06-10)
↳ **Débil en:** Bitrix24 (no crea módulos, C06-05; automatización 💰, C06-08), Twenty (sin fórmulas)

**Bitrix24**
- `F06-B1` Campos custom con muchos tipos de dato disponibles (C06-01)
- `F06-B2` Configuración por rubro predefinida al arrancar (C02-09)
- `F06-B3` Los cambios se propagan a la app móvil sin trabajo extra (E1-01)
- ⚠ Solo 3: en el plan Free la parametrización real está limitada — no crea módulos y las automatizaciones son pagas
↳ **Débil en:** ninguna de forma decisiva. **Es su criterio más flojo**

**Twenty**
- `F06-T1` Objetos custom desde la interfaz, con buena experiencia de uso (C06-04)
- `F06-T2` Los campos custom aparecen automáticamente en la API GraphQL (C11-02)
- `F06-T3` Cambio de tipo de dato sin recrear el campo (C06-14)
- `F06-T4` Personalización de vista de lista muy flexible (C06-15)
↳ **Débil en:** Bitrix24 (no crea objetos), EspoCRM (la API no se actualiza tan directo)

---

## Criterio 7 — Importación y exportación

**EspoCRM**
- `F07-E1` **Acceso directo a MySQL**: se consulta y extrae por SQL (C07-11)
- `F07-E2` Importador con mapeo de columnas y vista previa (C07-07)
- `F07-E3` Detección de duplicados durante la importación (C07-05)
- `F07-E4` Exporta CSV y XLSX respetando el filtro aplicado (C07-09, C07-10)
- `F07-E5` Permite deshacer una importación equivocada (C07-15)
↳ **Débil en:** Bitrix24 (sin acceso a la base), Twenty (import más básico)

**Bitrix24**
- `F07-B1` Importación desde otros CRM con plantillas ya armadas (C07-01)
- `F07-B2` Importa contactos desde el correo y el celular (E1-08)
- `F07-B3` Exportación disponible en el plan gratuito (C07-13)
- `F07-B4` Carga masiva por API REST sin costo (C11-03)
↳ **Débil en:** EspoCRM y Twenty, sin plantillas de migración desde otros CRM

**Twenty**
- `F07-T1` **API GraphQL** para extraer datos con la forma exacta que se necesita (C07-12)
- `F07-T2` Acceso directo a PostgreSQL (C07-11 equivalente)
- `F07-T3` Import CSV con detección automática de tipos (C07-16)
- `F07-T4` Formato de exportación limpio y estándar (C07-11)
↳ **Débil en:** EspoCRM (API REST menos flexible), Bitrix24 (sin acceso a la base)

---

## Criterio 8 — Seguridad, roles y auditoría

**EspoCRM**
- `F08-E1` **ACL a nivel de campo**: oculta campos puntuales por rol (C08-03)
- `F08-E2` **Action History**: auditoría de quién cambió qué y cuándo (C08-04)
- `F08-E3` Equipos con aislamiento real entre grupos (C08-10)
- `F08-E4` Autenticación de dos factores incluida (C08-07)
- `F08-E5` Registro de inicios de sesión (C08-11)
- `F08-E6` Papelera con recuperación de registros borrados (C08-15)
↳ **Débil en:** Bitrix24 (**sin auditoría en Free**, C08-05), Twenty (permisos jóvenes, C08-06)

**Bitrix24**
- `F08-B1` HTTPS y certificado gestionados por el proveedor (C08-14)
- `F08-B2` Doble factor disponible en el plan gratuito (C08-07)
- `F08-B3` Backups del lado del proveedor, sin trabajo del usuario (E3-08)
- `F08-B4` Registro de accesos al portal (C08-11)
↳ **Débil en:** EspoCRM y Twenty, donde HTTPS y backups los tiene que resolver uno

**Twenty**
- `F08-T1` Timeline por registro: historial visible de cada cambio (C08-06)
- `F08-T2` Modelo de permisos basado en workspaces (C08-01)
- `F08-T3` Control total del servidor y del cifrado (E7-02)
- ⚠ Solo 3 sólidas: su modelo de seguridad es el menos maduro de los tres
↳ **Débil en:** Bitrix24 (que no da control de infraestructura)

---

## Criterio 9 — Explotación de datos

**EspoCRM**
- `F09-E1` Panel con dashlets configurables por usuario (C09-03)
- `F09-E2` Cada usuario arma su propio tablero (C09-03)
- `F09-E3` Vistas guardadas con totales por columna (C10-10)
- `F09-E4` Los filtros recalculan los totales en vivo (C09-08)
↳ **Débil en:** Twenty (sin gráficos nativos, C09-14), Bitrix24 (analítica atada al plan)

**Bitrix24**
- `F09-B1` **Embudo de ventas visual** listo, sin configurar (C09-02)
- `F09-B2` Widgets de analítica de ventas en el plan gratuito (C09-06)
- `F09-B3` Ranking de vendedores incluido (C09-10)
- `F09-B4` Métricas de actividad del equipo, no solo de ventas (C09-06)
↳ **Débil en:** EspoCRM y Twenty, sin analítica de equipo lista para usar

**Twenty**
- `F09-T1` Agrupación de vistas con totales por grupo (C09-05)
- `F09-T2` Filtros combinables muy flexibles (C09-08)
- `F09-T3` Los datos se pueden explotar afuera vía GraphQL (C10-13)
- ⚠ Solo 3: **es su criterio más flojo junto con el 10**
↳ **Débil en:** ninguna de forma decisiva

---

## Criterio 10 — Reportes

> **Ninguna cumple gratis.** Este criterio es el hallazgo negativo del trabajo.

**EspoCRM**
- `F10-E1` **El único con módulo de reportes real disponible**, aunque sea pago (C10-02)
- `F10-E2` Vistas guardadas con filtros complejos como sustituto (C10-10)
- `F10-E3` Exportación configurable como base del informe (C10-08)
- `F10-E4` Camino de crecimiento claro: ~$150/año y lo tiene (C10-02)
↳ **Débil en:** Twenty (no existe ni pagando), Bitrix24 (solo con salto de plan)

**Bitrix24**
- `F10-B1` Embudo visual que funciona como reporte gráfico en el Free (C10-11)
- `F10-B2` Los reportes existen en el producto, es cuestión de plan (C10-04)
- `F10-B3` Exportación disponible para armar el reporte afuera (C10-05)
↳ **Débil en:** Twenty, donde no hay reportes en ninguna edición

**Twenty**
- ⚠ **NINGUNA FORTALEZA.** No tiene reportes en ninguna edición (C10-03)
- `F10-T1` Único atenuante: la API GraphQL permite construir el reporte por fuera (C10-13)
↳ **Este vacío es el mejor argumento del informe** para explicar que un CRM moderno y lindo no es necesariamente un CRM completo

---

## Criterio 11 — Interfaz con otras aplicaciones

**EspoCRM**
- `F11-E1` API Key **por usuario**, no una credencial global (C11-11)
- `F11-E2` API REST documentada y estable (C11-08)
- `F11-E3` Sin límite de llamadas: es el servidor propio (C11-07 comparado)
- `F11-E4` Webhooks configurables desde la interfaz (C12-01)
↳ **Débil en:** Bitrix24 (2 req/s y bloqueo por 429, C11-07), Twenty (documentación más pobre)

**Bitrix24**
- `F11-B1` **API REST completa y gratuita**, igual que en los planes pagos (C11-03)
- `F11-B2` Webhooks que se crean desde la UI en dos minutos (C11-04)
- `F11-B3` Catálogo de métodos enorme, cubre toda la plataforma (C11-08)
- `F11-B4` Documentación oficial muy extensa (C11-08)
↳ **Débil en:** ninguna en cobertura. **Su mejor criterio junto con el 12**

**Twenty**
- `F11-T1` **API GraphQL**: se pide exactamente el dato que se necesita (C11-02)
- `F11-T2` Playground interactivo para explorar la API (C11-10)
- `F11-T3` Los campos custom aparecen solos en el esquema (C06-04)
- `F11-T4` Ofrece REST además de GraphQL (C11-02)
↳ **Débil en:** EspoCRM y Bitrix24, ambos solo REST, sin consultas a medida

---

## Criterio 12 — Integración en un contexto amplio

**EspoCRM**
- `F12-E1` Base de datos consultable desde cualquier otra aplicación (C12-11)
- `F12-E2` Extensiones oficiales para casos de negocio concretos (C12-04)
- `F12-E3` Integración con Google y Outlook para calendario y correo (C12-08)
- `F12-E4` Al ser open source, se puede integrar modificando el código (E3-10)
↳ **Débil en:** Bitrix24 (base inaccesible), Twenty (ecosistema casi vacío)

**Bitrix24**
- `F12-B1` **Es una suite completa**: CRM + tareas + chat + drive + intranet (C12-06)
- `F12-B2` Telefonía integrada en la plataforma (C12-07)
- `F12-B3` Videollamadas nativas (C12-14)
- `F12-B4` Compatible con Zapier y Make (C12-13)
- `F12-B5` El mayor catálogo de integraciones de las tres (C12-02)
↳ **Débil en:** EspoCRM y Twenty, que son CRM a secas y nada más

**Twenty**
- `F12-T1` Acceso directo a PostgreSQL para integrar con lo que sea (C12-11)
- `F12-T2` GraphQL facilita integrar con front-ends modernos (C11-02)
- `F12-T3` Licencia open source que permite adaptarlo (E3-10)
- ⚠ Solo 3: **su ecosistema es el más pobre** por ser proyecto nuevo (C12-05)
↳ **Débil en:** Bitrix24, que no permite tocar nada por dentro

---

## Criterio 13 — Soporte y capacitación

**EspoCRM**
- `F13-E1` **Documentación oficial en español** (C13-03)
- `F13-E2` Foro maduro con años de problemas ya resueltos (C13-09)
- `F13-E3` Documentación técnica con ejemplos de código utilizables (C13-13)
- `F13-E4` Base de conocimiento acumulada desde 2014 (E4-07)
↳ **Débil en:** Twenty (proyecto de 2023, poco historial), Bitrix24 (documentación dispersa)

**Bitrix24**
- `F13-B1` Mayor volumen de material de capacitación gratuito (C13-04)
- `F13-B2` Muchos tutoriales en español en YouTube (C13-06)
- `F13-B3` Red de partners e integradores, también en Argentina (C13-10)
- `F13-B4` Helpdesk propio con artículos guiados (C13-03)
↳ **Débil en:** EspoCRM y Twenty, sin red comercial de partners local

**Twenty**
- `F13-T1` **Discord muy activo** con respuesta rápida (C13-08)
- `F13-T2` Los desarrolladores responden directo en GitHub (C13-08)
- `F13-T3` Documentación técnica moderna y bien organizada (C13-11)
- `F13-T4` Issues públicos: se ve qué está roto y qué se está arreglando (E4-06)
↳ **Débil en:** Bitrix24 (**sin soporte técnico en el Free**, C13-07 — y sin repositorio público)

---
---

# Criterios extra

## E1 — Movilidad

**Bitrix24**
- `FE1-B1` **App nativa oficial y gratuita** para Android e iOS (E1-01)
- `FE1-B2` Notificaciones push al celular (E1-06)
- `FE1-B3` Funcionamiento parcial sin conexión (E1-07)
- `FE1-B4` Escáner de tarjetas personales desde la cámara (E1-08)
- `FE1-B5` Accesible desde cualquier lado sin exponer un servidor (E1-11)
↳ **Débil en:** EspoCRM (sin app oficial gratuita, E1-02), Twenty (sin app, E1-03)

**Twenty**
- `FE1-T1` Web responsive bien resuelta en pantalla chica (E1-05)
- `FE1-T2` La interfaz moderna se adapta mejor al celular que EspoCRM (E1-04)
- ⚠ Solo 2: **no tiene app nativa**. Es una debilidad, no una fortaleza
↳ **Débil en:** frente a Bitrix24 en todo lo móvil

**EspoCRM**
- `FE1-E1` Interfaz responsive utilizable desde el navegador móvil (E1-04)
- `FE1-E2` Existen apps de terceros que consumen su API (E1-02)
- `FE1-E3` Al ser open source, se puede desarrollar una app propia (E3-10)
- ⚠ Las tres son atenuantes, no fortalezas reales
↳ **Débil en:** frente a Bitrix24

---

## E2 — Inteligencia artificial

**Bitrix24**
- `FE2-B1` **CoPilot incluido en el plan gratuito** con créditos mensuales (E2-01)
- `FE2-B2` Resumen automático de negocios (E2-02)
- `FE2-B3` Redacción de correos asistida (E2-10)
- `FE2-B4` Transcripción de llamadas y notas (E2-07)
- `FE2-B5` Scoring de leads asistido (E2-08)
↳ **Débil en:** EspoCRM (nada nativo, E2-04), Twenty (incipiente, E2-05)

**EspoCRM**
- `FE2-E1` Sin IA nativa, pero sin envío de datos a terceros: **ventaja de privacidad** (E2-09)
- `FE2-E2` Se puede integrar IA propia por API, con control de qué se manda (E2-06)
- ⚠ Solo 2: **es una debilidad clara** frente a Bitrix24
↳ **Débil en:** frente a Bitrix24

**Twenty**
- `FE2-T1` Integración de IA en desarrollo, con arquitectura preparada (E2-05)
- `FE2-T2` Al ser self-hosted, la IA se puede conectar sin ceder datos (E2-09)
- ⚠ Solo 2, y ambas son promesas más que funciones
↳ **Débil en:** frente a Bitrix24

---

## E3 — Vendor lock-in y costo de salida

**EspoCRM**
- `FE3-E1` **Dump completo de la base con un comando** (E3-01)
- `FE3-E2` Licencia GPL: el software es de uno para siempre (E3-07)
- `FE3-E3` Migración a otra máquina copiando volúmenes (E3-05)
- `FE3-E4` Código fuente modificable (E3-10)
- `FE3-E5` Costo de salida prácticamente nulo (E3-09)
↳ **Débil en:** Bitrix24 (solo exporta lo que su UI permite, E3-02)

**Twenty**
- `FE3-T1` Dump completo de PostgreSQL (E3-01)
- `FE3-T2` Licencia open source (E3-07)
- `FE3-T3` Exportación por GraphQL con control total del formato (C07-12)
- `FE3-T4` Migración por contenedores, reproducible (E3-05)
↳ **Débil en:** Bitrix24

**Bitrix24**
- `FE3-B1` Exportación de contactos y negocios disponible en el Free (C07-13)
- `FE3-B2` API REST completa como vía de extracción masiva (C11-03)
- `FE3-B3` No hay infraestructura propia que desmontar al irse (E3-05 comparado)
- ⚠ Es el más atado de los tres: la fortaleza real acá es de los otros dos
↳ **Débil en:** frente a los dos self-hosted

---

## E4 — Vigencia del proyecto

**Twenty**
- `FE4-T1` **El proyecto más activo**: mayor ritmo de commits y releases (E4-01, E4-02)
- `FE4-T2` Comunidad de contribuidores creciendo rápido (E4-04)
- `FE4-T3` Issues y roadmap públicos y auditables (E4-06)
- `FE4-T4` Respaldo de inversión detrás del desarrollo (E4-10)
↳ **Débil en:** Bitrix24 (sin repositorio público que auditar, E4-05)

**EspoCRM**
- `FE4-E1` **Más de 10 años de trayectoria** sostenida (E4-07)
- `FE4-E2` Releases regulares y predecibles, sin cambios rompientes (E4-02)
- `FE4-E3` Historial de vulnerabilidades atendidas públicamente (E4-08)
- `FE4-E4` Estabilidad de API entre versiones (E4-09 comparado)
↳ **Débil en:** Twenty (joven, cambios rompientes, E4-09), Bitrix24 (opaco)

**Bitrix24**
- `FE4-B1` Empresa establecida desde 2012 con producto comercial vivo (E4-07)
- `FE4-B2` Millones de cuentas registradas: adopción masiva (E4-10)
- `FE4-B3` Actualizaciones continuas sin trabajo del usuario (E8-01)
- ⚠ Solo 3, y ninguna verificable de forma independiente: **no hay repositorio público** (E4-05)
↳ **Débil en:** frente a los open source, que se pueden auditar

---

## E5 — Rendimiento con volumen

**EspoCRM**
- `FE5-E1` Sin límite artificial de registros: solo el del hardware (E5-03)
- `FE5-E2` Búsqueda que sigue funcionando con 5.000 registros (E5-03)
- `FE5-E3` Índices de base ajustables por uno mismo (E5-12)
- `FE5-E4` Consumo de RAM estable bajo carga (E5-10)
↳ **Débil en:** Bitrix24 (**rompe la búsqueda pasados ~1.000**, E5-01)

**Twenty**
- `FE5-T1` PostgreSQL + Redis: mejor rendimiento con volumen (E5-03)
- `FE5-T2` Sin límite de registros (E5-03)
- `FE5-T3` Paginación eficiente en listas grandes (E5-09)
- `FE5-T4` Arquitectura moderna preparada para escalar (E5-04)
↳ **Débil en:** Bitrix24

**Bitrix24**
- `FE5-B1` No requiere que el usuario administre el rendimiento (E5-10 comparado)
- `FE5-B2` Los filtros por campo siguen funcionando pasado el límite (E5-02)
- ⚠ Solo 2. **Este es su peor criterio**: el tope de 1.000 registros del plan Free rompe la búsqueda y ni siquiera avisa (E5-01, E5-11)
↳ **Débil en:** frente a los dos self-hosted

---

## E6 — Accesibilidad

**Twenty**
- `FE6-T1` **Navegación completa por teclado** (E6-01, E6-08)
- `FE6-T2` Atajos de teclado documentados (E6-08)
- `FE6-T3` Foco visible y bien marcado (E6-02)
- `FE6-T4` Contraste cuidado en claro y oscuro (E6-04)
- `FE6-T5` Componentes modernos con semántica correcta (E6-06)
↳ **Débil en:** EspoCRM (navegación clásica), Bitrix24 (interfaz densa)

**EspoCRM**
- `FE6-E1` Formularios con etiquetas correctamente asociadas (E6-06)
- `FE6-E2` Interfaz simple, más fácil de recorrer con lector de pantalla (E6-05)
- `FE6-E3` Al ser open source, se puede corregir lo que falte (E3-10)
↳ **Débil en:** frente a Twenty

**Bitrix24**
- `FE6-B1` Ajustes de tamaño de fuente en la aplicación (E6-07)
- `FE6-B2` App móvil que hereda la accesibilidad del sistema operativo (E1-01)
- ⚠ Solo 2: la densidad de la interfaz juega en contra (E6-03)
↳ **Débil en:** frente a Twenty

---

## E7 — Datos personales y normativa

**EspoCRM**
- `FE7-E1` **Los datos quedan donde uno decida**, incluso en Argentina (E7-02)
- `FE7-E2` Cumplimiento de la Ley 25.326 mucho más simple (E7-03)
- `FE7-E3` Borrado real y verificable de los datos de una persona (E7-04)
- `FE7-E4` Ningún tercero accede a la información (E7-10)
- `FE7-E5` Cifrado y respaldo bajo control propio (E7-06)
↳ **Débil en:** Bitrix24 (servidores en el exterior, E7-01)

**Twenty**
- `FE7-T1` Mismo control de localización de los datos (E7-02)
- `FE7-T2` Exportación completa para el derecho de portabilidad (E7-08)
- `FE7-T3` Sin procesamiento por terceros (E7-09)
- `FE7-T4` Código auditable para verificar qué hace con los datos (E3-10)
↳ **Débil en:** Bitrix24

**Bitrix24**
- `FE7-B1` Política de privacidad formal y pública (E7-05)
- `FE7-B2` Infraestructura con certificaciones de seguridad del proveedor (E7-06)
- `FE7-B3` Backups y continuidad gestionados profesionalmente (E3-08)
- ⚠ Contrapeso: los datos salen del país y la IA los procesa afuera (E7-01, E7-09)
↳ **Débil en:** frente a los self-hosted en soberanía de datos

---

## E8 — Ciclo de actualizaciones

**EspoCRM**
- `FE8-E1` **La versión la elige uno**: se puede congelar todo el cuatrimestre (E8-02)
- `FE8-E2` Upgrade documentado y con posibilidad de volver atrás (E8-03, E8-07)
- `FE8-E3` Nada cambia sin que uno lo decida: los tests no se rompen solos (E8-06 comparado)
- `FE8-E4` Se puede probar la actualización en una copia antes (E8-10)
↳ **Débil en:** Bitrix24 (actualiza cuando quiere, E8-01)

**Twenty**
- `FE8-T1` Versión fijada por tag de Docker (E8-02)
- `FE8-T2` Rollback simple volviendo a la imagen anterior (E8-07)
- `FE8-T3` Changelog público y detallado (E8-08)
- `FE8-T4` Actualización con downtime mínimo (E8-09)
↳ **Débil en:** Bitrix24

**Bitrix24**
- `FE8-B1` Siempre en la última versión, sin trabajo del usuario (E8-01)
- `FE8-B2` Parches de seguridad aplicados automáticamente (E8-01)
- `FE8-B3` Sin ventanas de indisponibilidad a cargo del usuario (E8-09)
- ⚠ Contrapeso: **puede romper los tests automatizados en medio del TP** (E8-06)
↳ **Débil en:** frente a los self-hosted en previsibilidad

---
---

# Resumen de dominancia

| Criterio | Gana | Segundo | Último |
|---|---|---|---|
| 1. Tecnológicas | EspoCRM | Bitrix24 | Twenty |
| 2. Instalación | EspoCRM | Bitrix24 | Twenty |
| 3. Navegabilidad | Twenty | EspoCRM | Bitrix24 |
| 4. Facilidad de uso | Twenty | EspoCRM | Bitrix24 |
| 5. Concurrencia | Twenty | EspoCRM | Bitrix24 |
| 6. Parametrización | **EspoCRM** | Twenty | Bitrix24 |
| 7. Import / Export | EspoCRM | Twenty | Bitrix24 |
| 8. Seguridad y auditoría | **EspoCRM** | Twenty | Bitrix24 |
| 9. Explotación de datos | Bitrix24 | EspoCRM | Twenty |
| 10. Reportes | EspoCRM | Bitrix24 | **Twenty (cero)** |
| 11. Interfaz con apps | Twenty | Bitrix24 | EspoCRM |
| 12. Integración amplia | **Bitrix24** | EspoCRM | Twenty |
| 13. Soporte | EspoCRM | Bitrix24 | Twenty |
| E1. Movilidad | **Bitrix24** | Twenty | EspoCRM |
| E2. IA | **Bitrix24** | Twenty | EspoCRM |
| E3. Lock-in | EspoCRM | Twenty | **Bitrix24** |
| E4. Vigencia | Twenty | EspoCRM | Bitrix24 |
| E5. Rendimiento | Twenty | EspoCRM | **Bitrix24** |
| E6. Accesibilidad | **Twenty** | EspoCRM | Bitrix24 |
| E7. Datos personales | EspoCRM | Twenty | Bitrix24 |
| E8. Actualizaciones | EspoCRM | Twenty | Bitrix24 |

**Conteo:** EspoCRM gana 11 · Twenty gana 6 · Bitrix24 gana 4.

### Perfil de cada una

- **EspoCRM — el equilibrado.** Gana la mitad de los criterios y **nunca sale último en los del PDF**. Fuerte donde una empresa lo necesita: parametrización, seguridad, auditoría, datos y soporte. Su techo es la analítica.
- **Bitrix24 — el especialista.** Gana pocos criterios pero los gana **por goleada**: es el único con app nativa, IA y suite completa. Y pierde por goleada en lo que un CRM serio necesita: sin auditoría, sin reportes, y se rompe a los 1.000 registros.
- **Twenty — el prometedor.** Gana en experiencia de uso, accesibilidad y arquitectura. Pierde en todo lo que requiere madurez: cero reportes, ecosistema vacío, seguridad joven.

### Conclusión para la propuesta

La recomendación cambia según el rubro del caso de estudio:

| Si la empresa… | Conviene | Porque |
|---|---|---|
| Necesita trazabilidad y control de datos | **EspoCRM** | Auditoría, ACL por campo y datos propios |
| Tiene muchos empleados y presupuesto cero | **Bitrix24** | Usuarios ilimitados y suite completa — con el techo de los 1.000 registros |
| Es un equipo chico y técnico | **Twenty** | La mejor experiencia de uso y API moderna — asumiendo que no necesita reportes |
