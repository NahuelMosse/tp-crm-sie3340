# Casos de prueba — TP SIE 3340

**Bitrix24 Free · EspoCRM Community · Twenty CRM**

21 criterios: los 13 del PDF de la consigna + 8 propios.
**Auto:** ✅ automatizable con Playwright · 🟡 parcial · ❌ manual
**ID:** `C05-01` = criterio 05, caso 01. Los extras van `E1-01`. Se usan en los nombres de los tests y en las referencias del informe.

---

## Criterio 1 — Restricciones tecnológicas

Plataforma, sistema operativo, hardware, almacenamiento, memoria.

| ID | Herram. | Caso de prueba | Resultado esperado | Auto | Evidencia |
|---|---|---|---|---|---|
| C01-01 | EspoCRM | Medir RAM del contenedor en reposo (`docker stats`) | ~250-400 MB entre app y base | ❌ | Captura de consola |
| C01-02 | EspoCRM | Medir RAM con el dataset de 180 registros cargado | Sube poco: <500 MB | ❌ | Captura |
| C01-03 | EspoCRM | Verificar versión mínima de PHP que exige el instalador | Rechaza PHP < 8.1 con mensaje claro | ❌ | Captura del check |
| C01-04 | EspoCRM | Instalar sobre XAMPP en Windows sin Docker | Funciona: es LAMP estándar | ❌ | Bitácora |
| C01-05 | Twenty | Medir RAM en reposo (Node + PostgreSQL + Redis) | ~1,5-2 GB: **6× más que EspoCRM** | ❌ | Captura |
| C01-06 | Twenty | Intentar apuntarlo a MySQL en vez de PostgreSQL | Falla: exige PostgreSQL sí o sí | ❌ | Log de error |
| C01-07 | Twenty | Medir espacio en disco de las imágenes Docker | ~2-3 GB contra ~600 MB de EspoCRM | ❌ | `docker images` |
| C01-08 | Bitrix24 | Buscar requisitos de hardware en la documentación | **No aplica**: es SaaS. Solo pide navegador | ❌ | Captura de la doc |
| C01-09 | Bitrix24 | Verificar qué navegadores declara soportar | Chrome, Edge, Firefox, Safari recientes | ❌ | Captura |
| C01-10 | Los 3 | Medir tamaño de la base después de cargar el dataset | Comparativa de eficiencia de almacenamiento | ❌ | Tabla |
| C01-11 | Los 3 | Desconectar internet y usar la herramienta | Espo y Twenty siguen andando; **Bitrix24 muere** | 🟡 | Video |
| C01-12 | Espo/Twenty | Medir pico de CPU durante la importación del CSV | Comparativa de consumo | ❌ | Captura |
| C01-13 | Los 3 | Abrir en pantalla 1366×768 (notebook común) | Se usa sin scroll horizontal | ✅ | Captura |
| C01-14 | Los 3 | Medir tiempo de arranque en frío del servicio | Espo ~15 s, Twenty ~60 s, Bitrix24 instantáneo | ❌ | Cronómetro |

---

## Criterio 2 — Facilidad de instalación y configuración

| ID | Herram. | Caso de prueba | Resultado esperado | Auto | Evidencia |
|---|---|---|---|---|---|
| C02-01 | EspoCRM | Instalar por el asistente web sobre XAMPP, cronometrado | Termina en ~20 min sin tocar consola | ❌ | Bitácora + capturas |
| C02-02 | EspoCRM | Contar pasos del asistente hasta el primer login | ~6 pantallas guiadas | ❌ | Capturas |
| C02-03 | EspoCRM | Verificar que el asistente detecta dependencias faltantes | Lista qué falta y cómo resolverlo | ❌ | Captura |
| C02-04 | EspoCRM | Levantar por Docker con un solo comando | Andando en <5 min | ❌ | Consola |
| C02-05 | Twenty | Levantar con `docker compose up -d`, cronometrado | Andando, pero tarda más por las 3 imágenes | ❌ | Consola |
| C02-06 | Twenty | Buscar un instalador gráfico | **No existe**: solo Docker o código fuente | ❌ | Doc oficial |
| C02-07 | Twenty | Contar variables de entorno obligatorias | Hay que editar el `.env`: más fricción | ❌ | Captura del `.env` |
| C02-08 | Bitrix24 | Cronometrar el alta desde el registro hasta el CRM usable | <5 min, sin instalar nada | ❌ | Video |
| C02-09 | Bitrix24 | Contar los pasos del asistente inicial de configuración | Pide rubro, equipo, módulos: es largo | 🟡 | Capturas |
| C02-10 | Los 3 | Cambiar el idioma a español después de instalado | Espo y Bitrix por preferencias; Twenty parcial | ✅ | Video |
| C02-11 | Los 3 | Configurar SMTP para envío de correo | Comparar pasos de cada una | 🟡 | Capturas |
| C02-12 | Espo/Twenty | Desinstalar por completo y verificar que no queda basura | `docker compose down -v` limpia todo | ❌ | Consola |
| C02-13 | Bitrix24 | Buscar cómo eliminar la cuenta y los datos | Está, pero enterrado en configuración | ❌ | Captura |
| C02-14 | EspoCRM | Reinstalar apuntando a una base existente | Reconoce los datos y no los pisa | ❌ | Bitácora |

---

## Criterio 3 — Menú de funcionalidades, despliegue y navegabilidad

| ID | Herram. | Caso de prueba | Resultado esperado | Auto | Evidencia |
|---|---|---|---|---|---|
| C03-01 | Los 3 | Contar clicks desde el login hasta crear un contacto | Número comparable entre las tres | ✅ | Video + contador |
| C03-02 | Los 3 | Medir segundos desde el login hasta guardar un negocio | Métrica objetiva | ✅ | Video |
| C03-03 | Los 3 | Contar los módulos visibles en el menú principal | Bitrix24 abruma; Twenty es minimalista | ✅ | Captura |
| C03-04 | EspoCRM | Reordenar las pestañas del menú desde configuración | Se puede sin tocar código | ✅ | Video |
| C03-05 | EspoCRM | Agrupar módulos en un desplegable | Soporta grupos de tabs | ✅ | Video |
| C03-06 | Twenty | Navegar de punta a punta **solo con el teclado** | Tiene atajos y navegación por teclado | ✅ | Video |
| C03-07 | Twenty | Alternar entre vista tabla y kanban | Cambio instantáneo, sin recargar | ✅ | Video |
| C03-08 | Bitrix24 | Buscar el módulo de CRM entre el resto de la suite | Está mezclado con chat, tareas, drive: cuesta | ✅ | Video |
| C03-09 | Bitrix24 | Abrir un negocio y contar cuántos paneles se superponen | Los *sliders* se apilan y confunden | ✅ | Video |
| C03-10 | Los 3 | Usar el buscador global con un término parcial | Comparar calidad de resultados | ✅ | Video |
| C03-11 | Los 3 | Volver atrás con el botón del navegador después de guardar | ¿Mantiene el estado o se pierde? | ✅ | Video |
| C03-12 | Los 3 | Guardar una vista filtrada y volver a abrirla | Las tres lo permiten, con distinta facilidad | ✅ | Video |
| C03-13 | Los 3 | Contar clicks para llegar a la configuración de usuarios | Comparativa | ✅ | Video |
| C03-14 | Twenty | Usar el buscador por comando (estilo paleta) | Atajo de teclado abre búsqueda universal | ✅ | Video |
| C03-15 | Bitrix24 | Personalizar el menú lateral quitando módulos | Se puede ocultar lo que no se usa | ✅ | Video |

---

## Criterio 4 — Interfaz, facilidad de uso y aprendizaje

| ID | Herram. | Caso de prueba | Resultado esperado | Auto | Evidencia |
|---|---|---|---|---|---|
| C04-01 | Los 3 | Dar 5 tareas a 3 personas ajenas al grupo, sin explicar nada | Medir cuántas completan y en cuánto | ❌ | Planilla + grabación |
| C04-02 | Los 3 | Contar errores cometidos por esas personas en cada una | Indicador de claridad de la interfaz | ❌ | Planilla |
| C04-03 | Los 3 | Encuesta 1 a 5 de satisfacción tras usar cada una | Ranking subjetivo | ❌ | Planilla |
| C04-04 | Los 3 | Crear un contacto sin leer documentación | ¿Es autoexplicativo? | ✅ | Video |
| C04-05 | Los 3 | Buscar la ayuda contextual dentro de la app | Bitrix24 tiene tours; las otras menos | ✅ | Captura |
| C04-06 | Los 3 | Verificar la calidad del español de la interfaz | Espo bien; Twenty incompleto; Bitrix irregular | 🟡 | Capturas |
| C04-07 | Bitrix24 | Buscar pantallas sin traducir al español | Aparecen textos en inglés o ruso | 🟡 | Capturas |
| C04-08 | Twenty | Buscar cadenas sin traducir | i18n reciente: quedan partes en inglés | 🟡 | Capturas |
| C04-09 | Los 3 | Deshacer una acción recién hecha | ¿Hay undo o hay que rehacer a mano? | ✅ | Video |
| C04-10 | Los 3 | Provocar un error de validación y leer el mensaje | ¿El mensaje explica cómo arreglarlo? | ✅ | Captura |
| C04-11 | Los 3 | Medir tiempo de respuesta al abrir una lista de 100 registros | Percepción de fluidez | ✅ | Video |
| C04-12 | Twenty | Editar un campo directo desde la vista de tabla | Edición en línea sin abrir el registro | ✅ | Video |
| C04-13 | Los 3 | Usar la app en modo oscuro | Twenty sí; Espo y Bitrix parcial | ✅ | Captura |
| C04-14 | Los 3 | Contar cuántos campos obligatorios pide crear un negocio | Menos fricción = mejor | ✅ | Captura |

---

## Criterio 5 — Usuarios concurrentes y limitaciones

| ID | Herram. | Caso de prueba | Resultado esperado | Auto | Evidencia |
|---|---|---|---|---|---|
| C05-01 | EspoCRM | 3 sesiones editan el mismo negocio y guardan a la vez | Detecta la colisión y avisa | ✅ | Video 3 pantallas |
| C05-02 | Bitrix24 | Ídem | El último guardado pisa a los anteriores, sin aviso | ✅ | Video |
| C05-03 | Twenty | Ídem | Sincroniza en vivo: los otros ven el cambio sin refrescar | ✅ | Video |
| C05-04 | Los 3 | Crear usuarios hasta llegar al tope del plan | Los 3 son ilimitados: ninguno corta | ✅ | Video |
| C05-05 | Bitrix24 | Verificar si muestra quién está viendo el mismo registro | Tiene indicador de presencia | ✅ | Video |
| C05-06 | Twenty | Verificar si refleja cambios de otro usuario en vivo | Actualización en tiempo real | ✅ | Video |
| C05-07 | EspoCRM | Verificar el bloqueo optimista al guardar en conflicto | Avisa que el registro cambió | ✅ | Video |
| C05-08 | Los 3 | 5 sesiones simultáneas listando 100 registros | Medir degradación del tiempo de respuesta | ✅ | Video + tiempos |
| C05-09 | Los 3 | Un usuario borra un registro que otro tiene abierto | ¿Qué mensaje recibe el segundo? | ✅ | Video |
| C05-10 | EspoCRM | Dos usuarios de equipos distintos sobre el mismo registro | El ACL por equipo filtra correctamente | ✅ | Video |
| C05-11 | Bitrix24 | Chatear sobre un negocio desde dos sesiones | Chat integrado al registro | ✅ | Video |
| C05-12 | Los 3 | Cerrar sesión en una pestaña con otra abierta | ¿La otra se entera? | ✅ | Video |
| C05-13 | Los 3 | Medir cuántas sesiones simultáneas aguanta antes de degradarse | Límite práctico, no de licencia | ✅ | Tiempos |
| C05-14 | Twenty | Dos usuarios editan campos distintos del mismo registro | Merge sin conflicto | ✅ | Video |

---

## Criterio 6 — Parametrización y posibilidades de cambio

| ID | Herram. | Caso de prueba | Resultado esperado | Auto | Evidencia |
|---|---|---|---|---|---|
| C06-01 | Los 3 | Crear el campo custom "Origen del contacto" (lista desplegable) | Aparece en formulario y en vista de lista | ✅ | Video |
| C06-02 | Los 3 | Agregar una etapa nueva al pipeline de oportunidades | Se refleja en el kanban | ✅ | Video |
| C06-03 | EspoCRM | Crear una **entidad nueva** desde Entity Manager | Se puede sin tocar código | ✅ | Video |
| C06-04 | Twenty | Crear un **objeto custom** desde la UI | Se puede desde configuración | ✅ | Video |
| C06-05 | Bitrix24 | Intentar crear un módulo nuevo | **No se puede**: solo campos custom | ✅ | Captura |
| C06-06 | EspoCRM | Reordenar campos con el Layout Manager (arrastrar) | Cambio visual inmediato | ✅ | Video |
| C06-07 | EspoCRM | Crear una fórmula que calcule un campo automáticamente | Motor de fórmulas incluido | ✅ | Video |
| C06-08 | Bitrix24 | Intentar crear una automatización (robot) en el plan Free | 💰 **Bloqueado**: es de plan pago | ✅ | Captura del paywall |
| C06-09 | Los 3 | Hacer obligatorio un campo que no lo era | Valida al guardar | ✅ | Video |
| C06-10 | Los 3 | Crear un segundo pipeline de ventas | Bitrix24 Free 💰 no deja; las otras sí | ✅ | Captura |
| C06-11 | Los 3 | Verificar si el cambio requiere reiniciar el servicio | Ninguna debería pedirlo | ✅ | Video |
| C06-12 | EspoCRM | Crear una relación entre dos entidades | Relaciones N:N desde la UI | ✅ | Video |
| C06-13 | Los 3 | Borrar un campo custom con datos cargados | ¿Avisa de la pérdida de datos? | ✅ | Video |
| C06-14 | Twenty | Cambiar el tipo de dato de un campo existente | ¿Lo permite o hay que recrearlo? | ✅ | Video |
| C06-15 | Los 3 | Personalizar la vista de lista: columnas y orden | Comparar facilidad | ✅ | Video |

---

## Criterio 7 — Importación y exportación de datos

| ID | Herram. | Caso de prueba | Resultado esperado | Auto | Evidencia |
|---|---|---|---|---|---|
| C07-01 | Los 3 | Importar `contactos.csv` (100 filas) | Las 100 quedan cargadas | ✅ | Video + conteo |
| C07-02 | Los 3 | Exportar lo importado y comparar archivos | Diff automático: qué se perdió | ✅ | Diff |
| C07-03 | Los 3 | Importar una fila con **tildes y ñ** | Se guarda sin romper el encoding | ✅ | Captura |
| C07-04 | Los 3 | Importar una fila con **email inválido** | Rechaza esa fila e informa cuál | ✅ | Captura del error |
| C07-05 | Los 3 | Importar una **fila duplicada** | ¿Deduplica, avisa o duplica? | ✅ | Video |
| C07-06 | Los 3 | Importar con un **campo obligatorio vacío** | Rechaza con mensaje claro | ✅ | Captura |
| C07-07 | Los 3 | Verificar si el importador deja **mapear columnas** | Comparar flexibilidad | ✅ | Video |
| C07-08 | Los 3 | Importar un CSV con separador `;` en vez de `,` | ¿Lo detecta o falla? | ✅ | Video |
| C07-09 | Los 3 | Exportar a Excel además de CSV | Comparar formatos disponibles | ✅ | Captura |
| C07-10 | Los 3 | Exportar solo los registros filtrados de una vista | Respeta el filtro aplicado | ✅ | Video |
| C07-11 | EspoCRM | Acceder a la base MySQL y consultar por SQL | Acceso total a los datos | ❌ | Captura |
| C07-12 | Twenty | Exportar por la API GraphQL | Otra vía de salida de datos | ✅ | Log |
| C07-13 | Bitrix24 | Exportar todos los contactos del CRM | Se puede, con límites del plan | ✅ | Video |
| C07-14 | Los 3 | Importar 1.000 registros y medir el tiempo | Comparativa de rendimiento | ✅ | Tiempos |
| C07-15 | Los 3 | Deshacer una importación equivocada | ¿Hay rollback o hay que borrar a mano? | ✅ | Video |
| C07-16 | Los 3 | Importar con una columna que no existe en el destino | ¿Ofrece crear el campo o descarta? | ✅ | Video |

---

## Criterio 8 — Seguridad, autenticación, roles y auditoría

| ID | Herram. | Caso de prueba | Resultado esperado | Auto | Evidencia |
|---|---|---|---|---|---|
| C08-01 | Los 3 | Crear un rol restringido que solo vea sus propios registros | Se puede en Espo y Twenty; Bitrix24 Free 💰 limitado | ✅ | Video |
| C08-02 | Los 3 | Con ese rol, intentar abrir un registro ajeno por URL directa | Devuelve 403 o "no encontrado" | ✅ | Video del bloqueo |
| C08-03 | EspoCRM | Restringir la visibilidad de **un campo** puntual | ACL a nivel de campo | ✅ | Video |
| C08-04 | EspoCRM | Modificar un registro y buscar el rastro en Action History | Queda registrado quién y cuándo | ✅ | Captura |
| C08-05 | Bitrix24 | Modificar un registro y buscar la pista de auditoría | 💰 **No hay auditoría en Free**: hallazgo | ✅ | Captura de la ausencia |
| C08-06 | Twenty | Modificar un registro y revisar la traza | Timeline por registro, sin auditoría global | ✅ | Captura |
| C08-07 | Los 3 | Activar autenticación de dos factores | Espo sí; Bitrix sí; Twenty limitado | 🟡 | Video |
| C08-08 | Los 3 | Intentar 5 logins fallidos seguidos | ¿Bloquea la cuenta o deja seguir? | ✅ | Video |
| C08-09 | Los 3 | Verificar si fuerza contraseña fuerte al crear usuario | Comparar políticas | ✅ | Captura |
| C08-10 | EspoCRM | Crear dos equipos y verificar que no se ven entre sí | Aislamiento por equipo | ✅ | Video |
| C08-11 | Los 3 | Revisar si registra los inicios de sesión | Espo y Bitrix sí; Twenty parcial | ✅ | Captura |
| C08-12 | Los 3 | Desactivar un usuario y probar que no puede entrar | Acceso denegado inmediato | ✅ | Video |
| C08-13 | Espo/Twenty | Verificar si la app corre sobre HTTPS o solo HTTP | Self-hosted: hay que configurarlo uno | ❌ | Captura |
| C08-14 | Bitrix24 | Verificar el HTTPS y el certificado del portal | Viene resuelto por ser SaaS | ✅ | Captura |
| C08-15 | Los 3 | Borrar un registro y ver si va a papelera o se pierde | ¿Hay recuperación? | ✅ | Video |
| C08-16 | Los 3 | Exportar datos con un rol restringido | ¿Puede sacar lo que no debería ver? | ✅ | Video |

---

## Criterio 9 — Explotación de datos y medición de resultados

| ID | Herram. | Caso de prueba | Resultado esperado | Auto | Evidencia |
|---|---|---|---|---|---|
| C09-01 | Los 3 | Armar un panel con monto total de oportunidades por etapa | Comparar facilidad y resultado | ✅ | Captura |
| C09-02 | Los 3 | Ver el embudo de ventas gráfico | Las tres tienen alguna versión | ✅ | Captura |
| C09-03 | EspoCRM | Agregar dashlets al panel principal | Panel configurable por usuario | ✅ | Video |
| C09-04 | EspoCRM | Buscar herramientas de BI avanzado | 💰 Están en el Advanced Pack | ✅ | Captura |
| C09-05 | Twenty | Agrupar la vista de oportunidades por etapa y sumar montos | Agrupación con totales | ✅ | Video |
| C09-06 | Bitrix24 | Abrir la analítica de ventas del CRM | Widgets básicos en Free | ✅ | Captura |
| C09-07 | Bitrix24 | Intentar abrir un informe analítico avanzado | 💰 Bloqueado por plan | ✅ | Captura del paywall |
| C09-08 | Los 3 | Filtrar por rango de fechas y ver el total actualizado | Recalcula bien | ✅ | Video |
| C09-09 | Los 3 | Medir la conversión entre dos etapas del pipeline | ¿Lo calcula solo o hay que hacerlo aparte? | ✅ | Captura |
| C09-10 | Los 3 | Ver el ranking de vendedores por monto cerrado | Comparar disponibilidad | ✅ | Captura |
| C09-11 | Los 3 | Compartir un panel con otro usuario | ¿Se puede o es personal? | ✅ | Video |
| C09-12 | Los 3 | Verificar si los paneles se actualizan solos o hay que refrescar | Comparar | ✅ | Video |
| C09-13 | Los 3 | Cambiar el rango del panel a "este mes" y verificar | Filtros temporales predefinidos | ✅ | Video |
| C09-14 | Twenty | Buscar gráficos nativos | ⚠ Muy limitado: es su punto flojo | ✅ | Captura |

---

## Criterio 10 — Reportes paramétricos y ad hoc

> **Las tres fallan acá.** EspoCRM 💰 Advanced Pack · Twenty ❌ no existe · Bitrix24 💰 plan pago. Los casos apuntan a documentar el hueco y probar la vía alternativa.

| ID | Herram. | Caso de prueba | Resultado esperado | Auto | Evidencia |
|---|---|---|---|---|---|
| C10-01 | EspoCRM | Buscar el módulo de reportes en el menú | 💰 No está: es del Advanced Pack | ✅ | Captura |
| C10-02 | EspoCRM | Documentar qué trae el Advanced Pack y su precio | ~$150/año, con reportes y BPM | ❌ | Captura de la web oficial |
| C10-03 | Twenty | Buscar cualquier función de reportes | ❌ **No existe en ninguna edición** | ✅ | Captura + doc |
| C10-04 | Bitrix24 | Intentar generar un informe de CRM | 💰 Paywall | ✅ | Captura |
| C10-05 | Los 3 | **Vía alternativa**: exportar a CSV y armar el reporte en Excel | Funciona en las tres. Contar pasos de más | 🟡 | Video + planilla |
| C10-06 | Los 3 | Medir cuántos minutos cuesta el reporte por la vía alternativa | Costo real de no tener el módulo | 🟡 | Cronómetro |
| C10-07 | Los 3 | Verificar si se puede programar un envío periódico de reporte | Ninguna en versión gratuita | ✅ | Captura |
| C10-08 | Los 3 | Exportar una vista filtrada como base del informe | Sustituto parcial del reporte | ✅ | Video |
| C10-09 | Los 3 | Verificar si se puede imprimir o exportar a PDF una vista | Comparar | ✅ | Captura |
| C10-10 | EspoCRM | Crear una vista guardada con filtros complejos y totales | Sustituto más cercano a un reporte | ✅ | Video |
| C10-11 | Bitrix24 | Usar el embudo de ventas como reporte visual | Lo que sí ofrece el Free | ✅ | Captura |
| C10-12 | Los 3 | Documentar qué reporte pediría una PyME real y si se puede | Conclusión para el informe | ❌ | Redacción |
| C10-13 | Twenty | Verificar si la API GraphQL permite armar el reporte afuera | Vía técnica de escape | ✅ | Log |

---

## Criterio 11 — Interfaz con otras aplicaciones

| ID | Herram. | Caso de prueba | Resultado esperado | Auto | Evidencia |
|---|---|---|---|---|---|
| C11-01 | EspoCRM | Crear un contacto por la API REST y verlo en la UI | Se crea y aparece | ✅ | Log + captura |
| C11-02 | Twenty | Crear un registro por la API GraphQL y verlo en la UI | Ídem | ✅ | Log + captura |
| C11-03 | Bitrix24 | Crear un lead por webhook REST y verlo en la UI | Ídem. **La API está completa en Free** | ✅ | Log + captura |
| C11-04 | Los 3 | Generar la credencial de API desde la interfaz | Comparar facilidad | ✅ | Video |
| C11-05 | Los 3 | Listar registros por API con paginación | Comparar diseño de la API | ✅ | Log |
| C11-06 | Los 3 | Llamar con una credencial inválida | Devuelve 401, no filtra información | ✅ | Log |
| C11-07 | Bitrix24 | Superar el límite de 2 req/s y observar el error | Devuelve 429 `OPERATION_TIME_LIMIT` | ✅ | Log |
| C11-08 | Los 3 | Buscar la documentación oficial de la API | Comparar calidad | ❌ | Capturas |
| C11-09 | Los 3 | Conectar la casilla de correo | Comparar pasos de integración con e-mail | 🟡 | Video |
| C11-10 | Twenty | Probar el explorador de la API (GraphQL playground) | Herramienta interactiva incluida | ✅ | Captura |
| C11-11 | EspoCRM | Verificar autenticación por API Key por usuario | Credencial por usuario, no global | ✅ | Video |
| C11-12 | Los 3 | Actualizar un registro por API y ver el cambio en la UI abierta | ¿Se refresca solo? | ✅ | Video |
| C11-13 | Los 3 | Borrar por API un registro que no existe | Manejo de error correcto | ✅ | Log |
| C11-14 | Los 3 | Medir el tiempo de respuesta de la API en 50 llamadas | Comparativa de rendimiento | ✅ | Tiempos |

---

## Criterio 12 — Posibilidades de integración en un contexto más amplio

| ID | Herram. | Caso de prueba | Resultado esperado | Auto | Evidencia |
|---|---|---|---|---|---|
| C12-01 | Los 3 | Configurar un webhook saliente hacia `webhook.site` | Llega el payload al crear un registro | ✅ | Captura del payload |
| C12-02 | Los 3 | Contar las integraciones disponibles de fábrica | Bitrix24 gana por volumen | ❌ | Capturas |
| C12-03 | Bitrix24 | Abrir el Marketplace de aplicaciones | 💰 Restringido en el plan Free | ✅ | Captura |
| C12-04 | EspoCRM | Revisar las extensiones oficiales disponibles | Catálogo chico pero existente | ❌ | Captura |
| C12-05 | Twenty | Revisar el estado de su ecosistema de integraciones | ⚠ Muy nuevo: casi nada listo | ❌ | Captura |
| C12-06 | Bitrix24 | Probar el chat, las tareas y el drive incluidos | Es una suite completa, no solo CRM | ✅ | Video |
| C12-07 | Bitrix24 | Verificar la telefonía integrada | Incluida en la plataforma | 🟡 | Captura |
| C12-08 | Los 3 | Integrar con Google Calendar | Comparar disponibilidad y pasos | 🟡 | Video |
| C12-09 | Los 3 | Verificar si hay conector con alguna herramienta de facturación | Ninguna de las 3 factura | ❌ | Captura |
| C12-10 | Los 3 | Evaluar la conexión con un ERP externo | Solo por API en las tres | ❌ | Redacción |
| C12-11 | Espo/Twenty | Consultar la base directamente desde otra aplicación | Ventaja del self-hosted | ❌ | Captura |
| C12-12 | Los 3 | Probar la integración con correo entrante | ¿Convierte mails en registros? | 🟡 | Video |
| C12-13 | Los 3 | Verificar si soportan Zapier o Make | Bitrix24 sí; las otras vía API | ❌ | Captura |
| C12-14 | Bitrix24 | Probar la videollamada integrada | Función que las otras no tienen | 🟡 | Video |

---

## Criterio 13 — Soporte técnico, capacitación y comunidad

> **Arrancar la semana 1**, para dar tiempo a que respondan.

| ID | Herram. | Caso de prueba | Resultado esperado | Auto | Evidencia |
|---|---|---|---|---|---|
| C13-01 | Los 3 | **Postear la misma consulta real en los 3 foros el mismo día** | Medir horas hasta la primera respuesta | ❌ | Capturas fechadas |
| C13-02 | Los 3 | Evaluar la calidad de esa respuesta (resuelve / no resuelve) | Comparativa cualitativa | ❌ | Capturas |
| C13-03 | Los 3 | Verificar si hay documentación oficial en español | Espo sí; Bitrix parcial; Twenty no | ❌ | Capturas |
| C13-04 | Los 3 | Buscar cursos o material de capacitación gratuito | Comparar | ❌ | Capturas |
| C13-05 | Los 3 | Contar los mensajes del último mes en el foro o comunidad | Indicador de comunidad viva | ❌ | Captura |
| C13-06 | Los 3 | Buscar en YouTube tutoriales en español y contar resultados | Material informal disponible | ❌ | Captura |
| C13-07 | Bitrix24 | Intentar abrir un ticket de soporte técnico desde el Free | 💰 Solo planes pagos | ❌ | Captura |
| C13-08 | Twenty | Entrar al Discord de la comunidad y medir la actividad | Muy activo pese a ser joven | ❌ | Captura |
| C13-09 | EspoCRM | Buscar en el foro un problema real y ver si está resuelto | Foro maduro con historial | ❌ | Captura |
| C13-10 | Los 3 | Verificar si hay partners o consultoras en Argentina | Comparar soporte local | ❌ | Búsqueda |
| C13-11 | Los 3 | Revisar si la documentación está actualizada a la versión vigente | Comparar | ❌ | Capturas |
| C13-12 | Los 3 | Buscar respuestas en Stack Overflow y contar preguntas | Indicador de adopción técnica | ❌ | Captura |
| C13-13 | Los 3 | Evaluar si la doc tiene ejemplos de código utilizables | Comparar calidad técnica | ❌ | Capturas |

---
---

# Criterios extra (fuera del PDF)

Ocho líneas propias que el PDF no contempla y que separan bien a estas tres herramientas.

---

## E1 — Movilidad y uso en celular

| ID | Herram. | Caso de prueba | Resultado esperado | Auto | Evidencia |
|---|---|---|---|---|---|
| E1-01 | Bitrix24 | Instalar la app oficial en Android/iOS y entrar | App nativa propia, gratis | ❌ | Video de celular |
| E1-02 | EspoCRM | Buscar app oficial en la tienda | ⚠ Hay apps de terceros, no oficial gratuita | ❌ | Captura |
| E1-03 | Twenty | Buscar app nativa | ❌ No hay: solo web responsive | ❌ | Captura |
| E1-04 | Los 3 | Abrir en el navegador del celular y crear un contacto | Comparar usabilidad real en pantalla chica | ❌ | Video |
| E1-05 | Los 3 | Verificar si la web es responsive de verdad o solo se achica | Comparar | ✅ | Captura a 390 px |
| E1-06 | Bitrix24 | Probar notificaciones push en el celular | Solo Bitrix24 las tiene | ❌ | Captura |
| E1-07 | Bitrix24 | Usar la app sin conexión y ver qué pasa | Modo offline parcial | ❌ | Video |
| E1-08 | Los 3 | Escanear una tarjeta o cargar un contacto desde el celular | Bitrix24 tiene escáner de tarjetas | ❌ | Video |
| E1-09 | Los 3 | Medir cuántos clicks cuesta crear un negocio desde el celular | Comparativa | ❌ | Video |
| E1-10 | Los 3 | Verificar acceso a la cámara para adjuntar una foto | Comparar | ❌ | Video |
| E1-11 | Espo/Twenty | Verificar si se puede acceder desde afuera de la red local | Requiere exponer el servidor: fricción real | ❌ | Redacción |

---

## E2 — Inteligencia artificial integrada

| ID | Herram. | Caso de prueba | Resultado esperado | Auto | Evidencia |
|---|---|---|---|---|---|
| E2-01 | Bitrix24 | Buscar y usar CoPilot en el plan gratuito | Tiene IA integrada con créditos gratuitos | ✅ | Video |
| E2-02 | Bitrix24 | Pedirle a la IA que resuma un negocio | Genera el resumen | ✅ | Captura |
| E2-03 | Bitrix24 | Verificar cuántos créditos de IA da el Free y qué pasa al agotarlos | Límite mensual, después 💰 | ✅ | Captura |
| E2-04 | EspoCRM | Buscar funciones de IA | ❌ No trae nada nativo | ✅ | Captura |
| E2-05 | Twenty | Buscar funciones de IA | ⚠ Hay integración incipiente, no comparable | ✅ | Captura |
| E2-06 | Espo/Twenty | Evaluar si se puede sumar IA por API externa | Posible pero hay que desarrollarlo | ❌ | Redacción |
| E2-07 | Bitrix24 | Probar la transcripción de llamadas o notas | Función de CoPilot | ❌ | Video |
| E2-08 | Los 3 | Evaluar si hay scoring automático de leads | Solo Bitrix24, y limitado | ✅ | Captura |
| E2-09 | Los 3 | Verificar si la IA procesa datos en servidores externos | Implicancia de privacidad: material para E7 | ❌ | Doc oficial |
| E2-10 | Bitrix24 | Redactar un email con IA desde el CRM | Asistente de redacción | ✅ | Video |

---

## E3 — Vendor lock-in y costo de salida

| ID | Herram. | Caso de prueba | Resultado esperado | Auto | Evidencia |
|---|---|---|---|---|---|
| E3-01 | Espo/Twenty | Sacar un dump completo de la base de datos | Acceso total: `mysqldump` / `pg_dump` | ❌ | Consola |
| E3-02 | Bitrix24 | Intentar obtener un respaldo completo de todo el portal | Solo exporta lo que su UI permite | ✅ | Captura |
| E3-03 | Los 3 | Medir qué porcentaje de los datos se puede exportar | Comparativa concreta | 🟡 | Tabla |
| E3-04 | Los 3 | Verificar si los adjuntos se exportan junto con los registros | Suele ser el punto débil | ✅ | Video |
| E3-05 | Espo/Twenty | Migrar la instalación completa a otra máquina | Copiar volúmenes y listo | ❌ | Bitácora |
| E3-06 | Bitrix24 | Buscar si existe una vía de migración a otro CRM | Comparar | ❌ | Captura |
| E3-07 | Los 3 | Revisar la licencia y qué permite hacer con el software | GPL / AGPL / propietario | ❌ | Doc |
| E3-08 | Bitrix24 | Verificar qué pasa con los datos si se deja de pagar | Política de retención | ❌ | Términos de servicio |
| E3-09 | Los 3 | Estimar horas de trabajo para migrar a otra herramienta | Costo real de salida | ❌ | Estimación |
| E3-10 | Espo/Twenty | Verificar si se puede modificar el código fuente | Sí: es open source | ❌ | Captura del repo |
| E3-11 | Los 3 | Verificar si el formato de exportación es abierto o propietario | CSV es abierto; comparar | ✅ | Captura |

---

## E4 — Vigencia y salud del proyecto

| ID | Herram. | Caso de prueba | Resultado esperado | Auto | Evidencia |
|---|---|---|---|---|---|
| E4-01 | Espo/Twenty | Revisar la fecha del último commit en GitHub | Ambos activos; Twenty muy activo | ❌ | Captura |
| E4-02 | Espo/Twenty | Contar releases del último año | Indicador de ritmo de desarrollo | ❌ | Captura |
| E4-03 | Espo/Twenty | Contar estrellas y forks del repositorio | Adopción de la comunidad | ❌ | Captura |
| E4-04 | Espo/Twenty | Ver cuántos contribuidores distintos tiene | Riesgo de proyecto de una sola persona | ❌ | Captura |
| E4-05 | Bitrix24 | Buscar changelog público de versiones | ⚠ Opaco: no hay repo que auditar | ❌ | Captura |
| E4-06 | Espo/Twenty | Revisar issues abiertos vs cerrados | Salud del mantenimiento | ❌ | Captura |
| E4-07 | Los 3 | Averiguar el año de nacimiento del proyecto | Espo 2014, Bitrix24 2012, Twenty 2023 | ❌ | Doc |
| E4-08 | Espo/Twenty | Ver si hay vulnerabilidades reportadas sin resolver | Security advisories del repo | ❌ | Captura |
| E4-09 | Twenty | Evaluar el riesgo de ser un proyecto joven | Cambios rompientes entre versiones | ❌ | Changelog |
| E4-10 | Los 3 | Buscar la empresa detrás y su situación | Quién banca el desarrollo | ❌ | Redacción |
| E4-11 | Espo/Twenty | Verificar si aceptan aportes externos | PRs mergeados de la comunidad | ❌ | Captura |

---

## E5 — Rendimiento con volumen

| ID | Herram. | Caso de prueba | Resultado esperado | Auto | Evidencia |
|---|---|---|---|---|---|
| E5-01 | Bitrix24 | **Cargar 1.200 leads y buscar uno por texto** | ⚠ **La búsqueda deja de funcionar pasados ~1.000** | ✅ | Video — hallazgo clave |
| E5-02 | Bitrix24 | Verificar si filtrar por campo sigue andando con 1.200 | Filtros sí, búsqueda de texto no | ✅ | Video |
| E5-03 | Espo/Twenty | Cargar 5.000 registros y buscar por texto | Siguen respondiendo | ✅ | Video + tiempos |
| E5-04 | Los 3 | Medir el tiempo de carga de una lista con 1.000 registros | Comparativa | ✅ | Tiempos |
| E5-05 | Los 3 | Medir el tiempo de la importación de 1.000 registros | Comparativa | ✅ | Tiempos |
| E5-06 | Los 3 | Aplicar un filtro complejo sobre 1.000 registros | Comparar tiempos | ✅ | Tiempos |
| E5-07 | Los 3 | Exportar 1.000 registros y medir | Comparativa | ✅ | Tiempos |
| E5-08 | Espo/Twenty | Medir el crecimiento de la base con 5.000 registros | Eficiencia de almacenamiento | ❌ | Consola |
| E5-09 | Los 3 | Paginar hasta la última página de una lista grande | ¿Se degrada al final? | ✅ | Video |
| E5-10 | Espo/Twenty | Ver el consumo de RAM bajo carga | `docker stats` durante la prueba | ❌ | Captura |
| E5-11 | Bitrix24 | Verificar si avisa al acercarse al límite del plan | ⚠ No avisa: se descubre cuando falla | ✅ | Video |
| E5-12 | Los 3 | Ordenar por una columna no indexada con volumen | Comparar | ✅ | Tiempos |

---

## E6 — Accesibilidad

| ID | Herram. | Caso de prueba | Resultado esperado | Auto | Evidencia |
|---|---|---|---|---|---|
| E6-01 | Los 3 | Recorrer el alta de un contacto **solo con Tab y Enter** | Twenty el mejor; comparar | ✅ | Video |
| E6-02 | Los 3 | Verificar que el foco del teclado se vea siempre | Indicador visible de foco | ✅ | Video |
| E6-03 | Los 3 | Pasar un validador automático de accesibilidad | Contar errores por herramienta | ✅ | Reporte |
| E6-04 | Los 3 | Medir el contraste de texto sobre fondo | Comparar con el mínimo recomendado | ✅ | Captura |
| E6-05 | Los 3 | Probar con un lector de pantalla (NVDA) | ¿Anuncia bien los campos? | ❌ | Grabación de audio |
| E6-06 | Los 3 | Verificar si los formularios tienen etiquetas asociadas | Requisito para lectores de pantalla | ✅ | Inspección |
| E6-07 | Los 3 | Ampliar el zoom al 200% y usar la app | ¿Se rompe el diseño? | ✅ | Captura |
| E6-08 | Twenty | Probar los atajos de teclado documentados | Su fuerte: pensado para teclado | ✅ | Video |
| E6-09 | Los 3 | Verificar si las imágenes tienen texto alternativo | Comparar | ✅ | Inspección |
| E6-10 | Los 3 | Usar la app en modo alto contraste del sistema | Comparar | ❌ | Captura |

---

## E7 — Datos personales y normativa

| ID | Herram. | Caso de prueba | Resultado esperado | Auto | Evidencia |
|---|---|---|---|---|---|
| E7-01 | Bitrix24 | Averiguar en qué país se alojan los datos | Servidores fuera de Argentina | ❌ | Términos |
| E7-02 | Espo/Twenty | Verificar dónde quedan los datos self-hosted | Donde uno los ponga: control total | ❌ | Redacción |
| E7-03 | Los 3 | Evaluar el cumplimiento de la Ley 25.326 de datos personales | Self-hosted lo facilita | ❌ | Análisis |
| E7-04 | Los 3 | Borrar todos los datos de una persona (derecho al olvido) | ¿Se puede de forma completa? | ✅ | Video |
| E7-05 | Bitrix24 | Leer la política de privacidad y qué hace con los datos | Análisis del documento | ❌ | Capturas |
| E7-06 | Los 3 | Verificar si los datos se cifran en reposo | Comparar | ❌ | Doc |
| E7-07 | Los 3 | Verificar si registra el consentimiento de contacto | Campo o función específica | ✅ | Captura |
| E7-08 | Los 3 | Exportar todos los datos de una persona (portabilidad) | Derecho de acceso | ✅ | Video |
| E7-09 | Bitrix24 | Buscar cláusulas sobre uso de los datos para entrenar IA | Punto sensible con CoPilot | ❌ | Términos |
| E7-10 | Los 3 | Evaluar el riesgo de una filtración según el modelo | SaaS concentra riesgo; self-hosted lo distribuye | ❌ | Análisis |

---

## E8 — Ciclo de actualizaciones

| ID | Herram. | Caso de prueba | Resultado esperado | Auto | Evidencia |
|---|---|---|---|---|---|
| E8-01 | Bitrix24 | Verificar si se puede elegir cuándo actualizar | ❌ No: actualiza el proveedor cuando quiere | ❌ | Doc |
| E8-02 | Espo/Twenty | Quedarse en una versión fija todo el cuatrimestre | Sí: la versión la elige uno | ❌ | `docker images` |
| E8-03 | EspoCRM | Actualizar a la versión siguiente y ver si algo se rompe | Proceso de upgrade documentado | ❌ | Bitácora |
| E8-04 | Twenty | Actualizar la imagen Docker a la última | Riesgo de cambios rompientes por ser joven | ❌ | Bitácora |
| E8-05 | Los 3 | Buscar si avisan de los cambios antes de aplicarlos | Comparar comunicación | ❌ | Captura |
| E8-06 | Bitrix24 | Documentar si una actualización rompió algo durante el TP | Riesgo real para los tests automatizados | ❌ | Bitácora |
| E8-07 | Espo/Twenty | Verificar si se puede volver atrás tras actualizar | Rollback con backup previo | ❌ | Bitácora |
| E8-08 | Los 3 | Averiguar cada cuánto sacan versiones nuevas | Comparar ritmo | ❌ | Changelog |
| E8-09 | Espo/Twenty | Medir el tiempo de indisponibilidad al actualizar | Downtime real | ❌ | Cronómetro |
| E8-10 | Los 3 | Verificar si hay entorno de prueba antes de actualizar | Sandbox: ninguna en versión gratuita | ❌ | Captura |

---

## Resumen

| Bloque | Criterios | Casos |
|---|---|---|
| PDF de la consigna | 13 | 186 |
| Extras propios | 8 | 85 |
| **Total** | **21** | **271** |

Mínimo 10 casos por criterio, sin IDs repetidos. Automatizables con Playwright: ~165. El resto son mediciones de sistema, análisis documental o pruebas con personas.

Las fortalezas diferenciales de cada herramienta, criterio por criterio, están en `Fortalezas-cruzadas.md`.
