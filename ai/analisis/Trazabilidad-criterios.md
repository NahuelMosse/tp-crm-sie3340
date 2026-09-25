# Trazabilidad de los criterios

**Material de auditoría, no del informe.** Comprueba que el catálogo de la sección 4
cubre todo lo pedido y que ningún criterio se inventó sin fuente.

> Generado por `ai/automatizacion/generar-trazabilidad.mjs`. **Los enunciados se extraen
> de los PDF en cada corrida**, nunca se copian a mano: una cita parafraseada volvería
> inútil este documento, que existe para poder contrastar contra la fuente.

| Fuente | Documento |
|---|---|
| `REQ n` | `humanos/consigna/Requerimientos-TP-SIE3340.pdf` |
| `CRIT n` | `humanos/consigna/consigna-TP-SIE3340.pdf` |
| `RUBRO` | Condición propia del negocio asegurador, que ninguna fuente enuncia |
| `OBS` | Capacidad detectada al operar los sistemas |

## Cobertura de las fuentes

### Requerimientos del cliente

| | Enunciado textual | La comprueban |
|:---:|---|---|
| **1** | Cuando un cliente quiere solicitar una póliza de seguro, queremos registrar todos los datos y calificar sus necesidades para concretar la venta según lo que nos está pidiendo. | A.2.1, A.2.2, A.2.3 |
| **2** | Realizar un seguimiento de pólizas. Gestionando los datos de los clientes queremos saber qué tipo de póliza tiene, el estado de pago y si hay una posibilidad de cambio de póliza. | A.1.1, A.1.2, A.2.6, A.6.1 |
| **3** | Gestionar una amplia fuente de información sobre ventas y pólizas que podemos utilizar para captar nuevos clientes. | A.1.6, A.10.1 |
| **4** | Gestión de los corredores y agentes de seguros y podremos conocer y evaluar las ventas de seguros por parte de los empleados y el seguimiento de los clientes potenciales. Ver todas las actividades que los agentes o corredores de seguros realizan en torno al cliente. | A.2.4, A.3.1, A.3.2, A.9.1, A.10.2 |
| **5** | Analizar los factores de la competencia, para podemos ofrecer un mejor servicio que aumente nuestras ventas y fidelice nuevos clientes al ofrecer un servicio adecuado a sus necesidades. | A.4.7 |
| **6** | Conocer nuevas oportunidades de negocio, a partir de las necesidades de nuestros clientes y prospectos. | A.2.2, A.2.4, A.2.5, A.2.6 |
| **7** | Conocer la información del cliente, centralizarla y centrar a la organización alrededor del cliente. | A.6.1, A.6.2, A.6.4 |
| **8** | Optimizar las actividades de los vendedores. | A.3.3, A.8.3 |
| **9** | Pronosticar todos los movimientos comerciales. | A.3.4 |
| **10** | Diseñar campañas de marketing personalizables. Análisis de campañas realizadas. | A.4.2, A.4.3 |
| **11** | Segmentación de clientes. | A.4.1 |
| **12** | Manejar quejas y reclamaciones. | A.5.1, A.5.2, A.5.3 |
| **13** | Información de los clientes y conseguir nuevos, así como conocer a la competencia que esté presente en las redes. | A.4.4, A.4.5 |
| **14** | Conseguir cambiar la imagen y reputación, a partir de las opiniones y comentarios de los clientes y tener mayor repercusión en las redes. | A.4.5, A.4.6, A.6.3 |
| **15** | Mejora de la calidad del servicio y la atención al cliente. | A.5.4, A.10.1 |
| **16** | Conocer y agrupar la información de los clientes. | A.4.1, A.6.3 |
| **17** | Gestionar de manera eficaz todas las pólizas de los clientes y generar nuevas oportunidades e venta. | A.1.5, A.1.7, A.2.6 |
| **18** | Importar contactos desde Excel, Gmail y Outlook. | A.7.1, A.7.2 |
| **19** | Sincronizar el email de todos en tu empresa para que se guarde automáticamente en las fichas de los clientes | A.7.3, A.7.4 |
| **20** | Crear tareas y asignar a personas de la empresa | A.5.5, A.5.6 |

### Marco técnico de evaluación

| | Enunciado textual | La comprueban |
|:---:|---|---|
| **1** | Restricciones de tipo tecnológicas, como ser plataforma, Sistema Operativo, requerimientos de hardware, de almacenamiento, memoria de trabajo, etc. | A.11.1, A.11.2 |
| **2** | Facilidad en su instalación y configuración. | A.11.3 |
| **3** | Facilidades y menú de funcionalidades. Despliegue y navegabilidad. | A.11.4 |
| **4** | Interface con usuarios, facilidad de uso y aprendizaje para usuarios finales, etc. | A.11.5, A.11.6 |
| **5** | Usuarios concurrentes. Limitaciones. | A.11.7, A.11.8 |
| **6** | Parametrización, facilidad y posibilidades de cambios. | A.8.1, A.8.2, A.8.3 |
| **7** | Importación / Exportación de datos. Flexibilidad | A.7.1, A.7.5, A.7.6 |
| **8** | Seguridad de la información, autentificación de usuarios, esquema de roles y perfiles, pistas de auditoría, etc. | A.9.1, A.9.2, A.9.3 |
| **9** | Herramientas de explotación de datos y medición de resultados. | A.10.1 |
| **10** | Generación de reportes e informes. Paramétricos y Ad Hoc | A.10.2, A.10.3 |
| **11** | Factibilidad de interfaz con otras aplicaciones locales o remotas. | A.10.4, A.10.5 |
| **12** | Posibilidades de integración: relacionado con la facilidad que posee para ser incorporada en un contexto más amplio. | A.11.9 |
| **13** | Soporte técnico, capacitación, blog de usuarios, etc. | A.11.10, A.11.11, A.11.12, A.11.13 |

## Cada criterio y su fuente

| Criterio | | Origen | Criticidad |
|---|---|:---:|:---:|
| A.1.1 | Modelado de la póliza como objeto propio | `REQ 2` | Núcleo |
| A.1.2 | Campos de lista para el ramo y el estado de cobranza | `REQ 2` | Núcleo |
| A.1.3 | Prima con importe y moneda | `RUBRO` | Núcleo |
| A.1.4 | Vigencia con fecha de inicio y de fin | `RUBRO` | Núcleo |
| A.1.5 | Aviso anticipado de vencimiento | `REQ 17` | Soporte |
| A.1.6 | Consulta y filtrado de la cartera | `REQ 3` | Núcleo |
| A.1.7 | Operación masiva sobre la cartera | `REQ 17` | Soporte |
| A.2.1 | Registro del solicitante con sus datos de contacto | `REQ 1` | Núcleo |
| A.2.2 | Calificación y priorización del solicitante | `REQ 1, REQ 6` | Núcleo |
| A.2.3 | Conversión del solicitante en oportunidad de venta | `REQ 1` | Núcleo |
| A.2.4 | Embudo de oportunidades con etapas | `REQ 6, REQ 4` | Núcleo |
| A.2.5 | Embudos diferenciados por ramo | `REQ 6, RUBRO` | Soporte |
| A.2.6 | Oportunidades de cambio y ampliación sobre la cartera | `REQ 2, REQ 17, REQ 6` | Núcleo |
| A.3.1 | Registro de productores y asignación de cartera | `REQ 4` | Núcleo |
| A.3.2 | Bitácora de la actividad con el cliente | `REQ 4` | Núcleo |
| A.3.3 | Agenda y carga de trabajo del productor | `REQ 8` | Soporte |
| A.3.4 | Proyección de los movimientos comerciales | `REQ 9` | Soporte |
| A.4.1 | Segmentación reutilizable de la cartera | `REQ 11, REQ 16` | Núcleo |
| A.4.2 | Diseño de campañas sobre un segmento | `REQ 10` | Soporte |
| A.4.3 | Medición de los resultados de la campaña | `REQ 10` | Soporte |
| A.4.4 | Captación de interesados desde redes sociales | `REQ 13` | Soporte |
| A.4.5 | Escucha de menciones en canales públicos | `REQ 14, REQ 13` | Accesorio |
| A.4.6 | Publicación en redes desde el sistema | `REQ 14` | Soporte |
| A.4.7 | Registro de la competencia y del motivo de pérdida | `REQ 5` | Soporte |
| A.5.1 | Reclamo como caso con identidad propia | `REQ 12` | Núcleo |
| A.5.2 | Estado y seguimiento del reclamo | `REQ 12` | Núcleo |
| A.5.3 | Responsable asignado a cada reclamo | `REQ 12` | Núcleo |
| A.5.4 | Base de conocimiento para la atención | `REQ 15` | Soporte |
| A.5.5 | Tareas asignables con responsable y vencimiento | `REQ 20` | Núcleo |
| A.5.6 | Aviso al usuario al que se le asigna una tarea | `REQ 20` | Soporte |
| A.6.1 | Vinculación de la póliza con su titular | `REQ 2, REQ 7` | Núcleo |
| A.6.2 | Vista única del asegurado | `REQ 7` | Núcleo |
| A.6.3 | Campos propios del rubro en la ficha | `REQ 16, REQ 14` | Núcleo |
| A.6.4 | Unicidad de la ficha del asegurado | `REQ 7, RUBRO` | Núcleo |
| A.7.1 | Importación de contactos desde planilla de cálculo | `REQ 18, CRIT 7` | Núcleo |
| A.7.2 | Importación de contactos desde las agendas de correo | `REQ 18` | Soporte |
| A.7.3 | Sincronización del correo de varios usuarios | `REQ 19` | Núcleo |
| A.7.4 | Vinculación automática del correo a la ficha | `REQ 19` | Núcleo |
| A.7.5 | Formatos de intercambio aceptados | `CRIT 7` | Soporte |
| A.7.6 | Exportación de la cartera sin pérdida de datos | `CRIT 7` | Soporte |
| A.8.1 | Creación de entidades sin programar | `CRIT 6, RUBRO` | Núcleo |
| A.8.2 | Campos calculados sobre datos propios | `CRIT 6` | Soporte |
| A.8.3 | Automatización de procesos | `CRIT 6, REQ 8` | Soporte |
| A.8.4 | Conservación de la parametrización al actualizar | `RUBRO` | Núcleo |
| A.9.1 | Restricción de la cartera por productor | `CRIT 8, REQ 4` | Núcleo |
| A.9.2 | Autenticación de los usuarios bajo control de la compañía | `CRIT 8` | Núcleo |
| A.9.3 | Registro de quién modificó cada dato | `CRIT 8` | Núcleo |
| A.10.1 | Indicadores sobre la operación | `CRIT 9, REQ 3, REQ 15` | Soporte |
| A.10.2 | Generación de informes definidos por el usuario | `CRIT 10, REQ 4` | Núcleo |
| A.10.3 | Informe paramétrico reutilizable | `CRIT 10` | Soporte |
| A.10.4 | Intercambio de datos con otros sistemas de la compañía | `CRIT 11` | Soporte |
| A.10.5 | Intercambio sin límite de volumen que condicione la operación | `CRIT 11` | Soporte |
| A.11.1 | Recursos que la compañía debe disponer para sostenerlo | `CRIT 1` | Soporte |
| A.11.2 | Compatibilidad con la plataforma que la compañía usa | `CRIT 1` | Soporte |
| A.11.3 | Puesta en marcha sin perfil técnico especializado | `CRIT 2` | Soporte |
| A.11.4 | Menú y navegabilidad para la operación diaria | `CRIT 3` | Soporte |
| A.11.5 | Aprendizaje sin capacitación previa | `CRIT 4` | Soporte |
| A.11.6 | Localización completa al español, modelo incluido | `CRIT 4, RUBRO` | Núcleo |
| A.11.7 | Cantidad de usuarios sin límite que condicione la operación | `CRIT 5` | Núcleo |
| A.11.8 | Operación concurrente sobre la misma cartera | `CRIT 5` | Núcleo |
| A.11.9 | Ecosistema de integraciones disponible | `CRIT 12` | Soporte |
| A.11.10 | Documentación en español | `CRIT 13` | Soporte |
| A.11.11 | Material de capacitación para el usuario final | `CRIT 13` | Soporte |
| A.11.12 | Comunidad activa de usuarios | `CRIT 13` | Soporte |
| A.11.13 | Soporte técnico con compromiso de respuesta | `CRIT 13` | Soporte |
| A.11.14 | Continuidad de las versiones en uso | `RUBRO` | Soporte |
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

## Sin fuente externa

| Origen | Criterios |
|---|---|
| `RUBRO` | A.1.3, A.1.4, A.2.5, A.6.4, A.8.1, A.8.4, A.11.6, A.11.14, B.1.1, B.1.2, B.1.3, B.1.4, B.1.5, B.1.6, B.1.7 |
| `OBS` | B.2.1, B.2.2, B.2.3, B.2.4, B.2.5 |

## Resultado

- **33 fuentes**: todas cubiertas.
- **78 criterios**, todos con origen declarado.
