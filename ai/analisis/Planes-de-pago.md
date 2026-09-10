# Planes de pago — EspoCRM · Twenty · Bitrix24

Precios de fuentes oficiales, agosto-septiembre 2026, en USD.
**Lo que usamos en el TP es siempre la fila gratuita.**

---

## EspoCRM

Versión probada: **10.0.4 Community** (AGPL v3).

| Plan | Precio | Usuarios | Almacenamiento | Registros | Extensiones |
|---|---|---|---|---|---|
| **Community (self-hosted)** | **Gratis** | Ilimitados | El del servidor | Ilimitados | ❌ se compran aparte |
| Cloud Basic | $15 /usuario/mes | **mín. 3** | 3 GB por usuario | 100.000 | ✅ todas incluidas |
| Cloud Enterprise | $25 /usuario/mes | **mín. 5** | 10 GB por usuario | 10.000.000 | ✅ todas incluidas |
| Cloud Ultimate | $69 /usuario/mes | **mín. 10** | 400 GB total | Ilimitados | ✅ + IP dedicada y dominio propio |

**Extensiones para self-hosted** (se compran sueltas, pago único por instancia):

| Extensión | Precio | Qué trae |
|---|---|---|
| **Advanced Pack** | **$395 pago único** | **Reportes**, Workflows, BPM |
| Sales Pack, Project Management, VoIP, Google, Outlook, MailChimp, Zoom, Stripe | Sueltas | Integraciones y módulos de rubro |

> **Corrección:** en documentos anteriores figuraba el Advanced Pack como "~$150/año". Es **$395 una sola vez por instancia**, no una suscripción. El dato viejo estaba mal.

**Lo que esto significa para el TP:** el criterio 10 (reportes) se resuelve con $395 únicos, o gratis pasando a Cloud Basic con 3 usuarios ($45/mes) que ya incluye todo.

---

## Twenty

Versión probada: **v2.37.4 self-hosted** (AGPL v3).

| Plan | Precio | Qué agrega |
|---|---|---|
| **Self-hosted** | **Gratis** | Todo el producto. Sin funciones retenidas |
| Cloud Pro | $9 /usuario/mes (anual) | Hosting gestionado, apps personalizadas, agentes IA, 50 créditos de workflow al año |
| Cloud Organization | $19 /usuario/mes (anual) | + permisos a nivel de fila, SSO SAML/OIDC, dominio propio, soporte prioritario |
| Enterprise | **desde $50.000/año** | + aislamiento single-tenant, whitelist de IP, SCIM, SLA dedicado |

**Confirmado en la instancia:** `/settings/billing` no existe, redirige a general. En self-hosted **no hay ningún paywall**.

El salto de Organization ($19) a Enterprise ($50k/año) es brutal: no hay nada en el medio.

---

## Bitrix24

Plan actual del portal `b24-orshha.bitrix24.es`: **Free**.

**Se cobra por organización, no por usuario** — la diferencia más importante de las tres.

| Plan | Mensual | Anual (~30% off) | Usuarios | Almacenamiento |
|---|---|---|---|---|
| **Free** | **$0** | **$0** | **Ilimitados** | 5 GB |
| Basic | $69/mes | $49/mes | 5 | 24 GB |
| Standard | $144/mes | $99/mes | 50 | 100 GB |
| Professional | $289/mes | $199/mes | 100 | 1 TB |
| Enterprise | $579+/mes | $399+/mes | 250+ | 3 TB+ |

> **Ojo con una confusión frecuente:** el Free tiene **usuarios ilimitados**; el límite de 5 usuarios es del plan **Basic**, que es pago. Varias comparativas de internet lo mezclan. La fuente oficial (helpdesk de Bitrix24) confirma que Free es ilimitado.

**Qué desbloquea el pago** (verificado en el portal):
- Búsqueda por texto con más de ~1.000 registros
- **Reglas de automatización** — al abrirlas aparece *"Suscripción / Mejore su plan"*
- Pipelines múltiples, reportes de CRM, roles granulares, telefonía, Marketplace

---

## Comparación de costo real según el tamaño del equipo

Acá se ve lo que importa: **EspoCRM y Twenty cobran por usuario, Bitrix24 por organización.**

| Equipo | EspoCRM Cloud Basic | Twenty Cloud Pro | Bitrix24 |
|---|---|---|---|
| 5 personas | $75/mes | $45/mes | **$49/mes** (Basic) |
| 20 personas | $300/mes | $180/mes | **$99/mes** (Standard) |
| 50 personas | $750/mes | $450/mes | **$99/mes** (Standard) |
| 100 personas | $1.500/mes | $900/mes | **$199/mes** (Professional) |

**Conclusión para la propuesta final:** el modelo por organización de Bitrix24 lo vuelve imbatible a partir de ~15 personas. Con 50 empleados cuesta **7,5 veces menos** que EspoCRM Cloud. Con 100, ocho veces menos.

Al revés: para un equipo de 3 a 5 personas, la diferencia es chica y ahí pesan más las funciones que el precio.

Y la opción que no aparece en ninguna lista de precios: **self-hosted a $0**, donde el costo real es el servidor (~$20-40/mes en un VPS) y las horas de quien lo mantiene.

---

## Resumen para el informe

| | Modelo de cobro | Gratis sirve para producción | Qué cuesta salir del gratis |
|---|---|---|---|
| **EspoCRM** | Por usuario (Cloud) o pago único (extensiones) | ✅ Sí, sin límite de usuarios ni registros | $395 una vez por los reportes |
| **Twenty** | Por usuario (solo Cloud) | ✅ Sí, el self-hosted es completo | Nada: no hay funciones retenidas |
| **Bitrix24** | **Por organización** | 🟡 Hasta ~1.000 registros | $49/mes, y ahí ya entran automatización y reportes |

## Fuentes

- [EspoCRM — precios Cloud](https://www.espocrm.com/pricing/) · [Advanced Pack](https://www.espocrm.com/extensions/advanced-pack/)
- [Twenty — precios](https://twenty.com/pricing)
- [Bitrix24 — precios](https://www.bitrix24.es/prices/) · [usuarios en planes Cloud](https://helpdesk.bitrix24.com/open/18397244/)
- Página de licencia del propio portal: `b24-orshha.bitrix24.es/settings/license_all.php`

> Los precios cambian seguido. Verificar contra las páginas oficiales antes de entregar.
