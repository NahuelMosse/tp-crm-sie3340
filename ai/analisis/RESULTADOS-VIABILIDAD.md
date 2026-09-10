# Resultados de la prueba de viabilidad

Ejecutado el 2026-09-02 en la máquina de trabajo. Docker 29.4.3, Node 24.13.1.
Puertos asignados por el gobernador de recursos: EspoCRM **8705**, Twenty **8704**.

---

## EspoCRM Community — ✅ FUNCIONA

| Verificación | Resultado |
|---|---|
| Levanta en Docker | ✅ Sí |
| Responde HTTP | ✅ 200, título `<title>EspoCRM</title>` |
| Login de admin | ✅ `admin` / `Admin1234!` |
| API REST autenticada | ✅ `GET /api/v1/App/user` devuelve el usuario admin |
| Crear registro por API | ✅ Contacto creado y verificado (id `6a987fff083b6419c`) |
| Idiomas de fábrica | ✅ **36 idiomas**, incluidos `es_ES` y `es_MX` |
| URL | http://localhost:8705 |

### Dato medido para el criterio 1

**RAM real en reposo con la app instalada: 167 MB en total.**

| Contenedor | RAM | CPU |
|---|---|---|
| `tp-espocrm` (Apache + PHP) | 45,4 MB | 0,00 % |
| `tp-espocrm-db` (MariaDB 11) | 121,5 MB | 0,05 % |

Es **bastante menos de lo estimado** (había puesto ~300 MB en el plan). Corregir el valor en `Casos-de-prueba.md` C01-01 y en la fortaleza `F01-E1`.

### Traducción al español verificada

Muestra real de `es_ES/Global.json`:

```json
"Email": "Correo", "User": "Usuario", "Team": "Equipo", "Role": "Rol",
"EmailTemplate": "Plantilla de Correo", "ScheduledJob": "Tarea Programada"
```

Confirma la fortaleza `F04-E1` (mejor español de las tres) con evidencia.

### Hallazgo de instalación — sirve para el criterio 2

El primer intento **falló** y el motivo es material para el informe:

1. Monté `/var/www/html` como volumen, que es el método que figura en muchos tutoriales viejos. La imagen avisa:
   `warning: LEGACY INSTALLATION METHOD DETECTED` y `No further EspoCRM upgrades will be available`.
2. Con ese montaje el volumen vacío **pisa los archivos de la imagen** y el instalador muere:
   `PHP Fatal error: Failed opening required 'install/entry.php'` → HTTP 500.
3. La forma correcta es montar solo tres subdirectorios: `custom`, `data` y `client/custom`.

**Conclusión para el criterio 2:** EspoCRM instala fácil *siguiendo la documentación vigente*, pero la documentación desactualizada que circula lleva a una instalación rota que no da un error claro. Vale como observación real de "facilidad de instalación".

### Segundo hallazgo — corrupción por corte a mitad de la inicialización

Al detener el contenedor de MariaDB antes de que terminara de inicializar, el volumen quedó inservible:

```
[ERROR] InnoDB: The data file './ibdata1' has the wrong space ID
[ERROR] Unknown/unsupported storage engine: InnoDB
```

Hubo que borrar el volumen y empezar de nuevo. **Lección operativa:** esperar a que la base termine de inicializar antes de tocar nada, y sacar backup antes de cada avance.

---

## Twenty CRM — ✅ FUNCIONA

| Verificación | Resultado |
|---|---|
| Repositorio | ✅ Clonado (sparse checkout de `packages/twenty-docker`) |
| Imagen Docker | ✅ **1,77 GB** contra los ~600 MB de EspoCRM |
| PostgreSQL 16 + Redis | ✅ Up (healthy) |
| Server | ✅ `Nest application successfully started` |
| Worker | ✅ Up |
| Migración de base | ✅ `Successfully migrated DB!` |
| Responde HTTP | ✅ 200, título `<title>Twenty</title>` |
| Healthcheck | ✅ `/healthz` devuelve 200 |
| API GraphQL | ✅ El endpoint `/graphql` responde (rechaza introspección por seguridad, que es la configuración correcta en producción) |
| Idiomas | ✅ **30 idiomas**, incluido `es-ES` |
| URL | http://localhost:8704 |

### Corrección importante — el español de Twenty está mejor de lo que suponíamos

En `Propuestas-CRM.md` y en la fortaleza `F04-T*` habíamos puesto el español de Twenty como 🟡 *parcial, con cadenas sin traducir*. **La traducción existe y se ve completa.** Muestra real de `es-ES.js`:

```
"Detalles del evento", "Lista", "No tiene permiso para..."
```

Hay 30 locales generados: `af-ZA ar-SA ca-ES cs-CZ da-DK de-DE el-GR en es-ES fi-FI fr-FR he-IL hu-HU it-IT ja-JP ko-KR nl-NL no-NO pl-PL pt-BR pt-PT ro-RO ru-RU sr-Cyrl sv-SE tr-TR uk-UA vi-VN zh-CN zh-TW`.

**Pendiente:** confirmar en la interfaz cuántas pantallas quedan sin traducir (caso C04-08). El dato de los archivos dice que la cobertura es buena, así que la evaluación 🟡 hay que revisarla con la UI a la vista antes de escribirla en el informe.

### Configuración necesaria — dato para el criterio 2

A diferencia de EspoCRM, **no hay instalador**: hay que crear un `.env` a mano con `SERVER_URL`, `APP_SECRET` (generado con `openssl rand -base64 32`) y la contraseña de PostgreSQL. Confirma la evaluación 🟡 del criterio 2.

Son **4 contenedores** (server, worker, db, redis) contra los 2 de EspoCRM.

### Hallazgo de configuración — los puertos en Docker Compose

Intenté cambiar el puerto con un `docker-compose.override.yml` y **no funciona**: en Compose las listas de `ports` **se suman en lugar de reemplazarse**, así que seguía intentando el 3000 ocupado y fallaba con
`ports are not available: exposing port TCP 0.0.0.0:3000`.
Hubo que editar el `docker-compose.yml` principal.

---

## Comparativa de consumo — dato medido para el criterio 1

Con las dos herramientas corriendo y en reposo:

| Herramienta | Contenedores | RAM total |
|---|---|---|
| **EspoCRM** | 2 (Apache+PHP, MariaDB) | **203 MB** |
| **Twenty** | 4 (server, worker, PostgreSQL, Redis) | **1.770 MB** |

**Twenty consume 8,7× más RAM que EspoCRM.** El detalle:

| Contenedor | RAM |
|---|---|
| `twenty-worker-1` | 960,7 MB |
| `twenty-server-1` | 754,1 MB |
| `twenty-db-1` | 48,6 MB |
| `twenty-redis-1` | 7,1 MB |
| `tp-espocrm-db` | 122,4 MB |
| `tp-espocrm` | 80,9 MB |

Esto **confirma y agranda** la fortaleza `F01-E1`: había estimado "6× menos" y la medición real da 8,7×. Corregir el número en `Casos-de-prueba.md` C01-01 / C01-05 y en `Fortalezas-cruzadas.md`.

Dato llamativo para el informe: **el worker de Twenty consume más RAM que todo EspoCRM junto** (960 MB contra 203 MB).

---

## Playwright — ✅ CONECTA Y MANEJA LAS DOS

Playwright **1.62.1** instalado en `D:\tp-crm`. Chromium ya estaba en la máquina.

**4 tests corridos, 4 pasados**, con video, captura y traza de cada uno.

### Resultados medidos

| Métrica | EspoCRM | Twenty |
|---|---|---|
| Login / sesión lista | **2.922 ms** | 26.386 ms (incluye atravesar el onboarding) |
| Crear un registro por UI | **5 clicks · 6.473 ms** | **3 clicks · 33.632 ms** |
| Registro creado y verificado | ✅ `TP-TEST-UI Navegabilidad` | ✅ `TP-TEST-UI` |

Twenty gana en clicks (3 contra 5) porque crea la fila con edición en línea, pero es **5× más lento** de punta a punta.

### Selectores que funcionan

| | Login | Crear |
|---|---|---|
| **EspoCRM** | `#field-userName`, `#field-password`, botón `Iniciar sesión` | `input[data-name="firstName"]`, botón `Guardar` |
| **Twenty** | botón `Continuar con el correo electrónico`, `input[type=email]`, `input[type=password]` | botón `New Person...`, después escribir y Enter |

En las dos alcanza con `getByRole` y `getByText`. **No hace falta CSS frágil en ninguna.**

### Hallazgo grande — el español de Twenty es parcial, y ahora sé por qué

Ayer dije que había que corregir el 🟡 de Twenty porque los archivos de traducción estaban completos. **Estaba equivocado: el 🟡 original era correcto**, y la razón es más interesante de lo que parecía.

Twenty traduce **los controles de la interfaz** pero **no el modelo de datos**:

| En español ✅ | En inglés ❌ |
|---|---|
| Espacio de trabajo, Nuevo chat, Filtro, Ordenar, Opciones, Agregar nuevo, Calcular, "hace 7 minutos" | **Companies, People, Opportunities, Tasks, Notes, Dashboards, Workflows** · New Person, All People · **Name, Emails, Created by, Company, Phones, Creation date, Job Title** |

O sea: los nombres de los objetos y de los campos del CRM son **metadata del workspace**, se crean en inglés al inicializar y los archivos de i18n no los tocan. Un usuario final ve el menú principal entero en inglés.

**EspoCRM en cambio traduce todo**, modelo incluido: Inicio, Cuentas, Contactos, Posibles clientes, Oportunidades, Actividades, Correos, Reuniones, Llamadas, Tareas, Calendario, Soporte, Tickets, Base de conocimiento, Guardar, Cancelar, Nombre, Correo, Dirección, Calle, Ciudad, Estado, País, Descripción.

**Para el informe:** esta es la diferencia real en el criterio 0 y en el 4, y da para una comparación de capturas lado a lado muy contundente. Actualizar `F04-E1` con este fundamento: no es "mejor traducción", es que **EspoCRM traduce el modelo de datos y Twenty no**.

### Otros dos hallazgos que salieron sin buscarlos

**Detección de duplicados de EspoCRM (caso C07-05, fortaleza `F07-E3`).** Al correr el test dos veces, EspoCRM interceptó el segundo alta:
> *"El registro que está creando parece ser un duplicado"*, con el listado del registro existente y botones Crear / Cancelar.

Funciona, está en español, y quedó filmado. Twenty no hizo nada equivalente: creó el segundo registro sin chistar.

**Twenty viene con datos de ejemplo.** El workspace nuevo trae 5 personas y 5 empresas de muestra (Brian Chesky/Airbnb, Dario Amodei/Anthropic, Patrick Collison/Stripe, Dylan Field/Figma, Ivan Zhao/Notion). Hay que **borrarlos antes de cargar el dataset del TP** o las mediciones de volumen salen contaminadas. EspoCRM arranca vacío.

### El onboarding de Twenty es una cadena de pantallas

Para llegar al CRM hay que atravesar, en orden: `/welcome` → `/workspace-activation` → `/create/profile` → `/install-apps` → `/invite-team` → `/objects/companies`. **Redirigen siempre hasta completarse**, así que el test tiene que recorrerlas. Quedó resuelto en `tests/twenty/helper.ts` con un bucle que llena lo que aparece y aprieta Continuar u Omitir.

Eso explica los 26 segundos de "login" contra los 2,9 de EspoCRM, y es material para el criterio 2.

### Evidencia generada automáticamente

```
evidencia/  8,9 MB
├── 4 videos .webm (uno por test)
├── 8 capturas .png
└── 4 trace.zip navegables con  npx playwright show-trace
informe/    reporte HTML con el video embebido en cada test
```

Los comandos que funcionan:

```bash
cd D:\tp-crm
npx playwright test                      # todo
npx playwright test --project=espocrm    # solo una herramienta
npx playwright test criterio-03          # un criterio
npx playwright show-report               # informe HTML
```

---

## Bitrix24 — ✅ FUNCIONA

Portal: **https://b24-orshha.bitrix24.es** · Plan Free (permanente, usuarios ilimitados).

| Verificación | Resultado |
|---|---|
| Login manual único | ✅ Hecho, sesión en `auth-bitrix.json` (16 KB) |
| Entrar sin login ni captcha | ✅ **9.691 ms**, va directo a `/online/` |
| Navegar al CRM | ✅ `/crm/deal/` — módulo "Negociaciones" |
| Idioma | ✅ **Español completo**, modelo de datos incluido |
| Tests corridos | ✅ 3 de 3 pasados |

### El login único funciona — está probado

El flujo quedó validado de punta a punta:

```bash
# UNA sola vez (abre ventana, la persona se loguea, guarda la sesión)
npx playwright test --project=bitrix24-login --headed

# De ahí en más, sin login ni captcha
npx playwright test --project=bitrix24
```

`auth-bitrix.json` está en el `.gitignore`: es una credencial que da acceso al portal.

### Detalle de implementación que costó dos intentos

La detección de "ya estoy adentro" **no puede basarse en la ausencia del formulario de login**: Bitrix24 mantiene `input[type="password"]` ocultos en el DOM aun estando autenticado, así que esa condición nunca se cumple y el test expira aunque el login haya funcionado.

Lo que sí funciona es detectar la **presencia** del menú del portal:

```ts
document.querySelector('nav[aria-label="Menú principal"]') ||
document.querySelector('a[href="/stream/"], a[href="/online/"]')
```

### Corrección — el español de Bitrix24 está mejor de lo que decíamos

En `Propuestas-CRM.md` figuraba con 🟡: *"traducción irregular, hay pantallas que quedan en inglés o ruso"*. **La evidencia no lo respalda.** El portal está en español completo, modelo de datos incluido:

> Negociaciones · Inventario · Clientes · Ventas · Analítica · Más · Crear · Pipeline general · Negociaciones en progreso · Etapa · Actividad · Cliente · Importe/Moneda · Responsable · Creado · Reglas de automatización · Mensajería Instantánea

Menú lateral entero traducido: Messenger, CoPilot, Feed, Calendario, Documentos, Tableros, Drive, Webmail, Proyectos, Tareas, CRM, Reserva, Gestión del inventario, Marketing, Sitios web y tiendas, Firma electrónica, Configuración.

**Cero palabras en inglés detectadas.** Hay que subir el criterio 0 de Bitrix24 de 🟡 a ✅, salvo que aparezcan pantallas sin traducir en secciones más profundas — vale seguir mirando, pero la evaluación previa era injusta.

### Confirmado de paso

- **CoPilot está en el menú del plan Free** → confirma la fortaleza `FE2-B1` (IA incluida gratis), que ni EspoCRM ni Twenty tienen.
- **"Reglas de automatización" aparece pero es del plan pago** → el paywall del caso C06-08 se puede filmar.
- El botón **"Mejore su plan"** está fijo abajo a la izquierda: presión comercial permanente, material para el criterio 4.
- El CRM arranca **vacío** ("Sin datos"), a diferencia de Twenty que trae registros de ejemplo.

---

## Versiones y planes exactos (verificados en las instancias)

| | Versión | Plan / edición | Licencia | Base de datos |
|---|---|---|---|---|
| **EspoCRM** | **10.0.4** | Community | AGPL v3 | MariaDB 11.8.8 |
| **Twenty** | **v2.37.4** | Self-hosted (no hay ediciones) | AGPL v3 | PostgreSQL 16.14 + Redis 8.10.1 |
| **Bitrix24** | Cloud (versión no expuesta) | **Free** — confirmado en `/settings/license_all.php` | Propietaria | No expuesta |

Runtime: Twenty corre sobre Node 24.19.0. Las imágenes: `espocrm/espocrm:latest` (3 semanas), `twentycrm/twenty:latest` (2 días).

> Para el informe conviene **fijar el tag de versión** en vez de `latest`, así la instancia no cambia sola a mitad del cuatrimestre: `espocrm/espocrm:10.0.4` y `twentycrm/twenty:v2.37.4`.

## ⚠️ CRÍTICO — Bitrix24 borra el portal a los 50 días

Texto textual de la página de plan del portal:

> *"Puede utilizar su Bitrix24 de forma gratuita todo el tiempo que desee, siempre y cuando lo utilice de forma regular. Eso significa que debe iniciar sesión en su Bitrix24 por lo menos una vez al mes. **Si no inicia sesión en un lapso de 50 días, se eliminará su Bitrix24.** Esta condición solo aplica a los planes gratuitos."*

**No lo suspende: lo elimina.** Con los datos adentro.

Es el mismo riesgo que Salesforce Developer Edition (45 días), y hay que tratarlo igual: **entrar al portal una vez por mes**, y sacar export de los datos cargados después de cada avance. Si el portal desaparece en noviembre, se pierde toda la evidencia de Bitrix24.

## Funciones de pago en cada una — verificado en la instancia

### EspoCRM — hay pago, y afecta al TP

- **El módulo de reportes NO está** en la instalación limpia. Confirmado: la sección Informes no aparece en el menú. Es del **Advanced Pack** (~$150/año), que además trae workflows y BPM.
- Hay un panel de **Extensiones** ("Instalar o desinstalar extensiones") preparado para instalar los packs pagos.
- Todo lo demás del core está disponible sin límite.

### Twenty — no hay paywall en self-hosted

- `/settings/billing` **no existe**: redirige a general. No hay sección de facturación ni de planes.
- El menú de configuración completo: Usuario, Perfil, Experiencia, Cuentas, Correos electrónicos, Calendarios, Espacio de trabajo, General, Modelo de datos, Diseño, Miembros, MCP y API, Aplicaciones, Panel de administración, Comunidad.
- Confirma lo que decíamos: **en la versión self-hosted no hay funciones retenidas**. Lo que se paga es Twenty Cloud (hosting).

### Bitrix24 — el paywall está a la vista todo el tiempo

- Plan actual: **Free**, confirmado en la página de licencia.
- Al abrir **Reglas de automatización** aparecen las palabras *"Suscripción"*, *"Mejore su plan"* y *"Planeado"* → **el paywall del caso C06-08 quedó capturado**.
- El botón **"Mejore su plan"** está fijo en el menú lateral, siempre visible.
- La página de plan ofrece *"IA, Vibecode y aplicaciones ilimitadas: todo en un nuevo plan"* con botón *"Probar gratis"*, y tiene secciones **"Verificación de compatibilidad del plan"** y **"Límites del plan"** — esta última sirve para documentar los topes del criterio E5 con la fuente oficial del propio portal.

**Conclusión de los tres modelos, ahora con evidencia:** EspoCRM retiene funciones concretas que el TP necesita (reportes); Twenty no retiene nada pero tampoco las tiene; Bitrix24 retiene mucho y te lo recuerda en cada pantalla.

---

## Estado final: las tres funcionan y se automatizan

| | EspoCRM | Twenty | Bitrix24 |
|---|---|---|---|
| Levanta / accede | ✅ | ✅ | ✅ |
| Playwright conecta | ✅ | ✅ | ✅ |
| Tests pasados | 2/2 | 2/2 | 3/3 |
| Login automatizado | ✅ directo | ✅ directo | ✅ vía `storageState` |
| Idioma español | ✅ completo | 🟡 parcial (modelo en inglés) | ✅ completo |
| Datos de ejemplo | vacío | 5 personas + 5 empresas | vacío |

**7 tests, 7 pasados.** La automatización con Playwright es viable en las tres, incluida Bitrix24, que era la dudosa.

---

## Nota sobre el entorno

La máquina está compartida con otros agentes y el gobernador de recursos repartió entre **0,1 y 2 slots de CPU** de 11 durante estas pruebas. Eso hizo que la inicialización de MariaDB tardara ~80 segundos y que la de Twenty sea lenta. **No es un problema de las herramientas**: en una máquina libre los tiempos son bastante menores. Al medir los tiempos del criterio 2 hay que aclarar la carga de la máquina, o repetir la medición cuando esté descargada.
