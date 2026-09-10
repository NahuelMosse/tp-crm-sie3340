# Propuestas de CRM — TP SIE 3340

Hay que elegir **3**. Filtros aplicados: gratis permanente u open source · interfaz en español · alta sin tarjeta ni vendedor.
Detalle completo de cada herramienta: `Propuestas-CRM-detalle.md`.

## Recomendación

**Dolibarr + Odoo Community + Zoho CRM.**

Las dos primeras cubren los 13 criterios sin pagar nada, se instalan de verdad (criterios 1 y 2, que ninguna nube deja evaluar) y se automatizan sin pelear. Zoho aporta el contraste SaaS: su free muestra los agujeros del modelo freemium y su trial de 15 días permite demostrar lo pago.

---

## Tabla maestra

| Herramienta | Cómo se consigue gratis | Qué compra el pago | Criterios gratis | Automatizable |
|---|---|---|---|---|
| **Dolibarr** | Instalador DoliWamp 1 clic, sin registro | Nada de features. Módulos sueltos + hosting | **13/13** | ✅ muy fácil |
| **Odoo Community** | Docker/GitHub, sin dejar mail | Studio, upgrades de versión, soporte | **13/13** | ✅ fácil |
| **YetiForce** | GitHub, sin registro | Solo soporte | **13/13** | ✅ fácil |
| **SuiteCRM 8** | GitHub, sin registro | Hosting + SLA | **13/13** | ✅ fácil |
| **EspoCRM** | Descarga directa, sin registro | Reportes y workflows (~$150/año) | 11/13 | ✅ muy fácil |
| **Salesforce DE** | Signup con Gmail, no vence | **Derecho de uso comercial**, capacidad, SLA | 11/13 | 🟡 con esfuerzo |
| **Twenty** | Docker Compose, sin registro | Solo hosting | 11/13 | ✅ muy fácil |
| **Vtiger Pilot** | Signup, 10 usuarios | Topes, Module Designer, reportes | 10/13 | 🟡 sí, con un truco |
| **Krayin** | GitHub, sin registro | Extensiones | 10/13 | ✅ fácil |
| **Zoho CRM** | Signup con Gmail, 3 users | Workflows, audit log, Blueprints, IA | 9/13 (**13 en trial**) | 🟡 sí, con un truco |
| **HubSpot Free** | Signup con Gmail, 2 users | Branding, automatización, reportes, auditoría | 9/13 | 🟡 sí, con un truco |
| **Bitrix24 Free** | Signup, usuarios ilimitados | Búsqueda >1.000 reg., reportes, roles | 8/13 | ❌ no conviene |

**Dos modelos de negocio.** Open source (Dolibarr, YetiForce, SuiteCRM, Twenty, Krayin): producto completo, el dinero paga *servicio*. Freemium (Zoho, HubSpot, Bitrix24, Vtiger): al gratis le faltan justo automatización, reportes y auditoría. Salesforce es un tercer caso: todo gratis para aprender, prohibido usarlo comercialmente.

---

## ¿Gratis, pago o inexistente?

✅ se prueba gratis · 💰 existe pero es pago (igual sirve: se documenta o se ve en el trial) · ❌ no existe · — no aplica (es SaaS)

| Criterio | Dolibarr | Odoo | YetiForce | SuiteCRM | EspoCRM | Salesf. | Twenty | Zoho | Vtiger | HubSpot | Krayin | Bitrix |
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
| **Gratis** | **13** | **13** | **13** | **13** | 11 | 11 | 11 | 9 | 10 | 9 | 10 | 8 |
| **Solo pagando** | 0 | 0 | 0 | 0 | 2 | 0 | 0 | 4 | 2 | 4 | 0 | 4 |

Un 💰 no descalifica: se describe con documentación oficial o se filma durante el trial. La excepción es **HubSpot criterio 8** — la auditoría es Enterprise, no entra ni en el trial.

---

## Tres combos

| Opción | Terna | Gratis | Automatizable | Cuándo |
|---|---|---|---|---|
| **A ⭐** | Dolibarr + Odoo + Zoho | 13+13+9 | ✅✅🟡 | Equilibrada. Dos self-hosted fáciles de automatizar + SaaS con mejor español y trial que cubre lo pago |
| **B** | Dolibarr + Odoo + Salesforce DE | 13+13+11 | ✅✅🟡 difícil | Más prestigio. En Salesforce nada está bloqueado por precio, pero hay que ir por API o a mano |
| **C** | EspoCRM + Twenty + HubSpot | 11+11+9 | ✅✅🟡 | La más rápida de montar si el tiempo apremia |

---

## ¿Se puede automatizar con Playwright?

**Sí, en 11 de las 12.** Lo que cambia es el esfuerzo, y depende de dos cosas: el stack del front-end y si hay defensas anti-bot en el login.

| Herramienta | Stack del front | Veredicto |
|---|---|---|
| **Dolibarr** | HTML renderizado en servidor, formularios clásicos | ✅ **Lo más fácil de todo.** HTML plano, sin JS dinámico ni shadow DOM: el selector que escribís hoy sigue andando mañana |
| **EspoCRM** | Backbone.js, DOM plano con atributos `data-name` | ✅ **Muy fácil.** Selectores estables que no cambian entre versiones |
| **Twenty** | React con **`data-testid` en los componentes** | ✅ **Muy fácil.** Está pensado para testear: cada componente ya trae su identificador |
| **Odoo** | Cliente OWL, sin shadow DOM | ✅ Fácil. Además Odoo trae su propio framework de *tours* JS |
| **YetiForce** | PHP + jQuery, IDs estables | ✅ Fácil, sin complicaciones |
| **Krayin** | Laravel + Vue | ✅ Fácil, DOM plano |
| **SuiteCRM 8** | Angular + Symfony | ✅ Fácil; ojo con los módulos legacy que se renderizan embebidos |
| **Zoho / HubSpot / Vtiger** | React o similar, DOM manejable | 🟡 El problema no es el DOM, es el **login**: captcha y detección de bots |
| **Salesforce** | Lightning Web Components | 🟡 **El caso duro**: shadow DOM, y **Lightning Web Security fuerza modo `closed`** en parte de los componentes, así que ni los locators por rol/texto lo atraviesan. Sumale MFA, re-render asíncrono y 3 releases al año que cambian el DOM |
| **Bitrix24** | DOM legacy, iframes anidados | ❌ Automatizarlo cuesta más que hacerlo a mano |

**El truco para los SaaS** (Zoho, HubSpot, Vtiger): loguearte a mano una vez y guardar la sesión. Los tests arrancan ya autenticados y nunca ven el captcha.

```ts
// setup.ts — se corre una sola vez
await context.storageState({ path: 'auth.json' });
// después, en playwright.config.ts:  use: { storageState: 'auth.json' }
```

**Para Salesforce**, en vez de pelear con el shadow DOM conviene ir por su **API REST** (crear registros, verificar permisos, leer el audit trail) y dejar la UI para capturas manuales. La API está documentada y es la vía que Salesforce sí habilita.

**Qué criterios se automatizan bien:** 3, 5 (varios `browserContext` en paralelo = concurrencia real), 6, 7 (importar CSV, exportar, comparar archivos), 8 (dos roles, verificar que el restringido recibe 403), 9, 10, 11.
**Qué no:** 1 y 2 (se miden con `docker stats` y cronómetro), 13 (es cualitativo).

**Aviso legal:** HubSpot y Salesforce restringen el acceso automatizado en sus términos de servicio. Para un TP sobre tu propia cuenta gratuita el riesgo práctico es bajo, pero lo prudente es automatizar fuerte sobre los self-hosted y en los SaaS usar la API oficial.

### Alternativas a Playwright

Todas gratis. Si Playwright no cierra:

| Herramienta | Cuándo conviene |
|---|---|
| **Selenium WebDriver** | El estándar de la industria. Más verboso, pero es lo que se enseña en la mayoría de las materias de testing |
| **Cypress** (core open source) | Más simple de arrancar, buen visor en vivo. Limitación: no maneja múltiples pestañas ni orígenes con soltura → **no sirve para el criterio 5** |
| **Puppeteer** | Solo Chrome. Más liviano si únicamente necesitás capturas |
| **Robot Framework + Browser library** | Se escribe en tablas, casi sin código. Por debajo usa Playwright igual |
| **k6** | Para el criterio 5 en serio: simular decenas de usuarios concurrentes por HTTP |
| **Bruno / Postman free** | Para el criterio 11: probar las APIs sin navegador |

Playwright sigue siendo la mejor opción: gratis, MIT, corre en Node/Python/Java/.NET, y `npx playwright codegen <url>` te genera el código grabando lo que clickeás — no hace falta saber programar para el primer test.

### De paso, la evidencia sale sola

Con esto en `playwright.config.ts` cada test deja video, captura y traza navegable sin escribir nada extra:

```ts
use: { video: 'on', screenshot: 'on', trace: 'on', locale: 'es-AR' }
```

Nombrando los tests `criterio-08-roles-y-auditoria.spec.ts`, la carpeta de salida queda ordenada igual que el informe, con el mismo test corrido contra las 3 herramientas.

---

## Descartadas

| Herramienta | Motivo |
|---|---|
| **EngageBay** | UI en inglés — incumple el requisito de español |
| **Freshsales** | Puede rechazar Gmail (pide mail corporativo) y su free es el más pobre |
| **Pipedrive** | Sin plan gratis, solo trial de 14 días |
| **monday CRM** | El free es para proyectos, no CRM |

Otros revisados y no incluidos, útiles para citar como alternativas de mercado: Agile CRM, Flowlu, Capsule, Insightly, Bigin, Brevo, Frappe CRM, ERPNext, CiviCRM, OroCRM, Corteza.

---

## Notas de mantenimiento

- **Salesforce DE:** se desactiva si pasan **45 días sin ingresar**. Entrar una vez por mes.
- **Zoho:** al día 15 cae solo a Free, sin perder datos.
- **Self-hosted:** no vencen. Backup de la base al cerrar cada avance.
- Dar de alta con Gmail personal, no institucional.
- Precios cambian seguido: verificar contra las páginas oficiales antes de entregar.
