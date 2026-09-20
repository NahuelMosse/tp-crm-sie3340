# Trazabilidad de los criterios

**Material de trabajo, no del informe.** Sirve para auditar que el catálogo de la sección 4
cubre todo lo pedido y que ningún criterio se inventó sin fuente.

Fuentes: `humanos/consigna/Requerimientos-TP-SIE3340.pdf` (20 requerimientos) y
`humanos/consigna/consigna-TP-SIE3340.pdf` (13 criterios mínimos).

| Origen | Significado |
|---|---|
| `REQ n` | Requerimiento n del pedido del cliente |
| `CRIT n` | Criterio n del marco técnico |
| `RUBRO` | Condición propia del negocio asegurador, que ninguna fuente enuncia |
| `OBS` | Capacidad detectada al operar los sistemas |

## Cada criterio y su fuente

| Criterio | | Origen | Criticidad |
|---|---|:---:|:---:|
| A.1.1 | Modelado de la póliza como objeto propio | `REQ 2` | Núcleo |
| A.1.2 | Campos de lista para el ramo y el estado de cobranza | `REQ 2` | Núcleo |
| A.1.3 | Prima con importe y moneda | `REQ 2` | Núcleo |
| A.1.4 | Vigencia con fecha de inicio y de fin | `REQ 2` | Núcleo |
| A.1.5 | Aviso anticipado de vencimiento | `REQ 17` | Soporte |
| A.1.6 | Consulta y filtrado de la cartera | `REQ 3` | Núcleo |
| A.1.7 | Operación masiva sobre la cartera | `REQ 17` | Soporte |
| A.2.1 | Registro del solicitante con sus datos de contacto | `REQ 1` | Núcleo |
| A.2.2 | Calificación y priorización del solicitante | `REQ 1` | Núcleo |
| A.2.3 | Conversión del solicitante en oportunidad de venta | `REQ 1` | Núcleo |
| A.2.4 | Embudo de oportunidades con etapas | `REQ 6` | Núcleo |
| A.2.5 | Embudos diferenciados por ramo | `REQ 6 · RUBRO` | Soporte |
| A.2.6 | Detección de oportunidades sobre la cartera existente | `REQ 17` | Núcleo |
| A.3.1 | Registro de productores y asignación de cartera | `REQ 4` | Núcleo |
| A.3.2 | Bitácora de la actividad con el cliente | `REQ 4` | Núcleo |
| A.3.3 | Agenda y carga de trabajo del productor | `REQ 8` | Soporte |
| A.3.4 | Proyección de los movimientos comerciales | `REQ 9` | Soporte |
| A.4.1 | Segmentación reutilizable de la cartera | `REQ 11` | Núcleo |
| A.4.2 | Diseño de campañas sobre un segmento | `REQ 10` | Soporte |
| A.4.3 | Medición de los resultados de la campaña | `REQ 10` | Soporte |
| A.4.4 | Captación de interesados desde redes sociales | `REQ 13` | Soporte |
| A.4.5 | Escucha de menciones en canales públicos | `REQ 14` | Accesorio |
| A.4.6 | Registro de la competencia y del motivo de pérdida | `REQ 5` | Soporte |
| A.5.1 | Reclamo como caso con identidad propia | `REQ 12` | Núcleo |
| A.5.2 | Estado y seguimiento del reclamo | `REQ 12` | Núcleo |
| A.5.3 | Responsable asignado a cada reclamo | `REQ 12` | Núcleo |
| A.5.4 | Base de conocimiento para la atención | `REQ 15` | Soporte |
| A.5.5 | Tareas asignables con responsable y vencimiento | `REQ 20` | Núcleo |
| A.5.6 | Aviso al usuario al que se le asigna una tarea | `REQ 20` | Soporte |
| A.6.1 | Vinculación de la póliza con su titular | `REQ 2 · 7` | Núcleo |
| A.6.2 | Ficha integral del asegurado | `REQ 7` | Núcleo |
| A.6.3 | Campos propios del rubro en la ficha | `REQ 16` | Núcleo |
| A.6.4 | Unicidad de la ficha del asegurado | `REQ 7 · RUBRO` | Núcleo |
| A.7.1 | Importación de contactos desde planilla de cálculo | `REQ 18` | Núcleo |
| A.7.2 | Importación de contactos desde las agendas de correo | `REQ 18` | Soporte |
| A.7.3 | Sincronización del correo de varios usuarios | `REQ 19` | Núcleo |
| A.7.4 | Vinculación automática del correo a la ficha | `REQ 19` | Núcleo |
| A.7.5 | Exportación de la cartera sin pérdida de datos | `CRIT 7` | Soporte |
| A.8.1 | Creación de entidades sin programar | `CRIT 6 · RUBRO` | Núcleo |
| A.8.2 | Campos calculados sobre datos propios | `CRIT 6` | Soporte |
| A.8.3 | Automatización de procesos | `CRIT 6 · REQ 8` | Soporte |
| A.8.4 | Conservación de la parametrización al actualizar | `RUBRO` | Núcleo |
| A.9.1 | Restricción de la cartera por productor | `CRIT 8 · REQ 4` | Núcleo |
| A.9.2 | Registro de quién modificó cada dato | `CRIT 8` | Núcleo |
| A.10.1 | Indicadores sobre la operación | `CRIT 9` | Soporte |
| A.10.2 | Generación de informes definidos por el usuario | `CRIT 10 · REQ 4` | Núcleo |
| A.10.3 | Intercambio de datos con otros sistemas de la compañía | `CRIT 11` | Soporte |
| A.10.4 | Intercambio sin límite de volumen que condicione la operación | `CRIT 11` | Soporte |
| A.11.1 | Recursos que la compañía debe disponer para sostenerlo | `CRIT 1` | Soporte |
| A.11.2 | Puesta en marcha sin perfil técnico especializado | `CRIT 2` | Soporte |
| A.11.3 | Navegabilidad: pocos pasos para la operación diaria | `CRIT 3` | Soporte |
| A.11.4 | Aprendizaje sin capacitación previa | `CRIT 4` | Soporte |
| A.11.5 | Localización completa al español, modelo incluido | `CRIT 4 · RUBRO` | Núcleo |
| A.11.6 | Operación concurrente sobre la misma cartera | `CRIT 5` | Núcleo |
| A.11.7 | Ecosistema de integraciones disponible | `CRIT 12` | Soporte |
| A.11.8 | Documentación en español | `CRIT 13` | Soporte |
| A.11.9 | Comunidad activa de usuarios | `CRIT 13` | Soporte |
| A.11.10 | Soporte técnico con compromiso de respuesta | `CRIT 13` | Soporte |
| A.11.11 | Continuidad de las versiones en uso | `RUBRO` | Soporte |
| B.1.1 | Persistencia de los datos sin uso continuo | `RUBRO` | Núcleo |
| B.1.2 | Copia propia y completa de la cartera | `RUBRO` | Núcleo |
| B.1.3 | Copia periódica sin intervención manual | `RUBRO` | Soporte |
| B.1.4 | Búsqueda y operación con volumen productivo | `RUBRO` | Núcleo |
| B.1.5 | Previsibilidad de los cambios del sistema | `RUBRO` | Soporte |
| B.1.6 | Conocimiento y decisión sobre dónde residen los datos | `RUBRO` | Soporte |
| B.1.7 | Continuidad de la atención ante una caída del enlace | `RUBRO` | Soporte |
| B.2.1 | Asistente de inteligencia artificial | `OBS` | Accesorio |
| B.2.2 | Aplicación móvil nativa | `OBS` | Soporte |
| B.2.3 | Suite de trabajo integrada | `OBS` | Accesorio |
| B.2.4 | Telefonía y videollamada integradas | `OBS` | Accesorio |
| B.2.5 | Uso sin restricciones comerciales en la interfaz | `OBS` | Soporte |

## Cobertura inversa

Si alguna fila queda vacía, esa fuente no se está evaluando.

| Fuente | Enunciado | La comprueban |
|---|---|---|
| **REQ 1** | Registrar los datos del solicitante y calificar sus necesidades para concretar la venta | A.2.1, A.2.2, A.2.3 |
| **REQ 2** | Seguimiento de pólizas: qué tipo tiene, el estado de pago y si hay posibilidad de cambio | A.1.1, A.1.2, A.1.3, A.1.4, A.6.1 |
| **REQ 3** | Gestionar una amplia fuente de información sobre ventas y pólizas para captar clientes | A.1.6 |
| **REQ 4** | Gestión de corredores y agentes: evaluar sus ventas, seguir prospectos y ver su actividad | A.3.1, A.3.2, A.9.1, A.10.2 |
| **REQ 5** | Analizar los factores de la competencia | A.4.6 |
| **REQ 6** | Conocer nuevas oportunidades de negocio a partir de las necesidades de clientes y prospectos | A.2.4, A.2.5 |
| **REQ 7** | Conocer la información del cliente y centralizarla | A.6.1, A.6.2, A.6.4 |
| **REQ 8** | Optimizar las actividades de los vendedores | A.3.3, A.8.3 |
| **REQ 9** | Pronosticar los movimientos comerciales | A.3.4 |
| **REQ 10** | Diseñar campañas de marketing personalizables y analizar las realizadas | A.4.2, A.4.3 |
| **REQ 11** | Segmentación de clientes | A.4.1 |
| **REQ 12** | Manejar quejas y reclamaciones | A.5.1, A.5.2, A.5.3 |
| **REQ 13** | Conocer a la competencia presente en las redes | A.4.4 |
| **REQ 14** | Cambiar la imagen y la reputación a partir de las opiniones de los clientes | A.4.5 |
| **REQ 15** | Mejorar la calidad del servicio y la atención al cliente | A.5.4 |
| **REQ 16** | Conocer y agrupar la información de los clientes | A.6.3 |
| **REQ 17** | Gestionar de manera eficaz todas las pólizas y generar nuevas oportunidades de venta | A.1.5, A.1.7, A.2.6 |
| **REQ 18** | Importar contactos desde Excel, Gmail y Outlook | A.7.1, A.7.2 |
| **REQ 19** | Sincronizar el email de todos en la empresa para que se guarde en las fichas | A.7.3, A.7.4 |
| **REQ 20** | Crear tareas y asignar a personas de la empresa | A.5.5, A.5.6 |
| **CRIT 1** | Restricciones tecnológicas: plataforma, SO, hardware, almacenamiento, memoria | A.11.1 |
| **CRIT 2** | Facilidad en su instalación y configuración | A.11.2 |
| **CRIT 3** | Facilidades y menú de funcionalidades. Despliegue y navegabilidad | A.11.3 |
| **CRIT 4** | Interface con usuarios, facilidad de uso y aprendizaje | A.11.4, A.11.5 |
| **CRIT 5** | Usuarios concurrentes. Limitaciones | A.11.6 |
| **CRIT 6** | Parametrización, facilidad y posibilidades de cambios | A.8.1, A.8.2, A.8.3 |
| **CRIT 7** | Importación / Exportación de datos. Flexibilidad | A.7.5 |
| **CRIT 8** | Seguridad, autenticación, roles y perfiles, pistas de auditoría | A.9.1, A.9.2 |
| **CRIT 9** | Herramientas de explotación de datos y medición de resultados | A.10.1 |
| **CRIT 10** | Generación de reportes e informes. Paramétricos y Ad Hoc | A.10.2 |
| **CRIT 11** | Factibilidad de interfaz con otras aplicaciones locales o remotas | A.10.3, A.10.4 |
| **CRIT 12** | Posibilidades de integración en un contexto más amplio | A.11.7 |
| **CRIT 13** | Soporte técnico, capacitación, blog de usuarios | A.11.8, A.11.9, A.11.10 |

## Sin fuente externa

| Origen | Criterios |
|---|---|
| `RUBRO` | A.2.5, A.6.4, A.8.1, A.8.4, A.11.5, A.11.11, B.1.1, B.1.2, B.1.3, B.1.4, B.1.5, B.1.6, B.1.7 |
| `OBS` | B.2.1, B.2.2, B.2.3, B.2.4, B.2.5 |

## Resultado

- **33 fuentes**, todas cubiertas.
- **71 criterios** en el catálogo.
