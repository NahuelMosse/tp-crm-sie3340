# Plan de pruebas — TP SIE 3340

**Bitrix24 Free · EspoCRM Community · Twenty CRM**
Automatización con Playwright. Los tests graban video solos y quedan como evidencia del informe.

---

## 1. Viabilidad

**Entorno verificado:** Node 24.13.1 · npm 11.8.0 · Docker 29.4.3 · puertos 8080/3000/3306 libres · **EspoCRM probado, levanta bien**.

| | Automatizable | Qué hace falta |
|---|---|---|
| EspoCRM | ✅ punta a punta | Nada. Docker local, sin login externo |
| Twenty | ✅ punta a punta | Nada. Pide ~3 GB de RAM |
| Bitrix24 | ✅ tras un login manual único | Crear el portal y loguearse **una vez** |

**8 de 13 criterios se automatizan del todo**, 2 a medias (4 y 10), 3 no (1, 2 y 13 — son de otra naturaleza, no se pierde nada).

El ahorro no está en escribir el test la primera vez, sino en **repetirlo**: cargar el dataset pasa de ~3 h a ~5 min por herramienta, y la evidencia sale sola.

**Riesgo:** los tests de Bitrix24 se pueden romper solos, es SaaS y actualiza cuando quiere. EspoCRM y Twenty quedan con versión fija en Docker.

---

## 2. Setup

```bash
# EspoCRM — ya está armado en D:\tp-crm
cd D:\tp-crm && docker compose up -d        # http://localhost:8080  (admin / Admin1234!)

# Twenty
git clone https://github.com/twentyhq/twenty && cd twenty
docker compose up -d                         # http://localhost:3000
```

**Bitrix24:** registro en `bitrix24.es` con Gmail. Anotar la URL del portal.

> Para el criterio 2 hay que instalar EspoCRM **también sobre XAMPP**, siguiendo el instalador web y con cronómetro. Docker no sirve como evidencia de "facilidad de instalación".

---

## 3. Login de Bitrix24 — una vez, dura semanas

El captcha se resuelve una sola vez a mano. Después los tests entran solos.

```ts
// tests/bitrix24/login-manual.spec.ts
// Correr UNA vez:  npx playwright test login-manual --headed
import { test } from '@playwright/test';

test('guardar sesión', async ({ page }) => {
  await page.goto('https://TUPORTAL.bitrix24.es/');
  console.log('>>> Logueate a mano. Tenés 3 minutos.');
  await page.waitForURL('**/stream/**', { timeout: 180_000 });
  await page.context().storageState({ path: 'auth-bitrix.json' });
});
```

En `playwright.config.ts`:

```ts
projects: [
  { name: 'espocrm',  use: { baseURL: 'http://localhost:8080' } },
  { name: 'twenty',   use: { baseURL: 'http://localhost:3000' } },
  { name: 'bitrix24', use: { storageState: 'auth-bitrix.json' } },
]
```

Cuando la sesión caduque (semanas), se vuelve a correr ese único test. `auth-bitrix.json` va al `.gitignore`: son credenciales.

### Reglas para que los tests de Bitrix24 no se rompan

Nunca CSS — las clases son autogeneradas y cambian. Siempre rol o texto:

```ts
await page.click('.ui-btn.ui-btn-success');            // ❌
await page.getByRole('button', { name: 'Guardar' });   // ✅
```

Los *sliders* (paneles laterales) son `div`, no iframes. Para iframes reales: `page.frameLocator(...)`.
Config: `actionTimeout: 15_000`, `slowMo: 300`, `headless: false` — más estable y mejor video.

**Limpieza:** todo lo que crea el test lleva prefijo `TP-TEST-`. Un `afterAll` filtra por ese prefijo y hace borrado masivo desde la UI.

---

## 4. Aviso: el punto flojo de la terna

**Ninguna de las tres tiene reportes ad hoc gratis** (criterio 10): EspoCRM 💰 Advanced Pack · Twenty ❌ no existe · Bitrix24 💰 plan pago.

Se resuelve así, y encima queda como hallazgo propio:
1. Documentar el hueco — es un resultado válido del análisis.
2. Demostrar la vía alternativa: exportar a CSV y armar el reporte en Excel, midiendo cuántos pasos cuesta de más.
3. Mostrar el módulo pago con la documentación oficial, aclarando "disponible en plan X".

---

## 5. Dataset común

Mismos datos en las tres, si no la comparación no vale.

| Archivo | Registros |
|---|---|
| `cuentas.csv` | 50 |
| `contactos.csv` | 100 |
| `oportunidades.csv` | 30 |

Meter a propósito **casos borde** para el criterio 7: tildes y ñ, un email inválido, una fila duplicada, un campo obligatorio vacío. Ahí se ve qué tan flexible es cada importador.

---

## 6. Los 13 criterios

| # | Criterio | Cómo se prueba | Auto |
|---|---|---|---|
| 1 | Tecnológicas | `docker stats`: RAM/CPU en reposo y con el dataset. Bitrix24: no aplica | ❌ |
| 2 | Instalación | EspoCRM sobre XAMPP y Twenty por Docker, con cronómetro y bitácora | ❌ |
| 3 | Navegabilidad | Clicks y segundos desde login hasta crear un lead | ✅ |
| 4 | Facilidad de uso | Métrica automatizada + encuesta a 3 personas ajenas al grupo | 🟡 |
| 5 | Usuarios concurrentes | 3 sesiones en paralelo sobre el mismo registro: ¿bloquea, avisa, o se pisan? | ✅ |
| 6 | Parametrización | Crear campo custom "Origen del contacto" y una etapa nueva de pipeline | ✅ |
| 7 | Import / Export | Importar, exportar y comparar archivos: qué se perdió | ✅ |
| 8 | Seguridad y roles | Rol restringido que no ve un registro ajeno + rastro en la auditoría | ✅ |
| 9 | Explotación de datos | Dashboard con monto total por etapa | ✅ |
| 10 | Reportes | Ver sección 4 | 🟡 |
| 11 | Interfaz con otras apps | Crear un registro por API y verificarlo en la UI | ✅ |
| 12 | Integración | Webhook saliente contra `webhook.site`, verificar el payload | ✅ |
| 13 | Soporte | **Postear una consulta real en los 3 foros** y medir cuánto tardan | ❌ |

**El criterio 13 hay que arrancarlo la primera semana** para darles tiempo a responder. Casi nadie lo prueba de verdad.

**Prueba destacada para Bitrix24:** cargar 1.200 leads y filmar cómo el plan Free **rompe la búsqueda por texto** pasados los ~1.000. Es el mejor hallazgo que sale de esta terna.

---

## 7. Repo

```
D:\tp-crm\
├── docker-compose.yml          ✅ hecho
├── playwright.config.ts
├── .gitignore                  # auth-bitrix.json, .env
├── datos/*.csv
├── tests/
│   ├── espocrm/criterio-NN-*.spec.ts
│   ├── twenty/
│   └── bitrix24/
└── evidencia/                  # videos y capturas, se generan solos
```

```ts
// playwright.config.ts
use: { video: 'on', screenshot: 'on', trace: 'on', locale: 'es-AR',
       viewport: { width: 1440, height: 900 } }
```

Nombrar los tests `criterio-08-roles.spec.ts` → la carpeta `evidencia/` queda ordenada igual que el informe, con el mismo test corrido contra las tres herramientas.

---

## 8. Orden de trabajo

| Paso | Qué | Depende de |
|---|---|---|
| 1 | **EspoCRM**: esqueleto de tests que después se adapta a las otras dos | Nada, ya levanta |
| 2 | **Twenty**: mismo esqueleto | Verificar RAM |
| 3 | **Bitrix24**: login manual único, después los tests | **Portal creado** |
| 4 | Criterios 1, 2 y 13 (los manuales) | En paralelo, desde la semana 1 |
| 5 | FODA por herramienta, scoring ponderado, propuesta final | Todo lo anterior |

**Lo único que necesito para arrancar con las tres: el portal de Bitrix24 creado y un login hecho.**

---

## 9. Hipótesis

- **EspoCRM** gana en 2, 6 y 8 (instalación, parametrización, seguridad). Es el más maduro.
- **Twenty** gana en 3 y 4 (navegabilidad y uso), pierde feo en 10 por no tener reportes.
- **Bitrix24** gana en 5 y 12 (usuarios ilimitados, trae CRM + tareas + chat), pierde en 8 y 10.

Si se confirma, la propuesta final se justifica sola según el rubro: EspoCRM para quien necesita control y trazabilidad, Bitrix24 para muchos empleados con presupuesto cero, Twenty para equipo chico y técnico.
