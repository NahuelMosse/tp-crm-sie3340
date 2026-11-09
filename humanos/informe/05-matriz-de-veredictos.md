# 5. Matriz de veredictos

**● 2 cumple  ◐ 1 cumple con reparo  ○ 0 no cumple**

La flecha **↑** marca los criterios que un plan pago o una extensión del fabricante mejorarían. Es un comentario y no cambia el valor: qué plan lo incluye y cuánto cuesta figura en la sección 5.5.

Cada grupo cierra con su **subtotal**: puntos obtenidos sobre el máximo posible y su porcentaje.

## 5.1 Requerimientos funcionales

*¿El usuario puede hacerlo desde el sistema?*

### Originales — solicitados por el cliente

#### A.1 Cartera de pólizas

| Criterio | EspoCRM | Twenty | Bitrix24 |
|---|:---:|:---:|:---:|
| A.1.1 Modelado de la póliza como objeto propio | ● | ● | ○↑ |
| A.1.2 Campos de lista para el ramo y el estado de cobranza | ● | ● | ● |
| A.1.3 Prima con importe y moneda | ● | ● | ● |
| A.1.4 Vigencia con fecha de inicio y de fin | ● | ● | ● |
| A.1.5 Aviso anticipado de vencimiento | ◐↑ | ● | ● |
| A.1.6 Consulta y filtrado de la cartera | ● | ● | ● |
| A.1.7 Operación masiva sobre la cartera | ● | ● | ● |
| **Subtotal A.1** | **13/14 · 92,9 %** | **14/14 · 100,0 %** | **12/14 · 85,7 %** |

#### A.2 Captación y proceso de venta

| Criterio | EspoCRM | Twenty | Bitrix24 |
|---|:---:|:---:|:---:|
| A.2.1 Registro del solicitante con sus datos de contacto | ● | ● | ● |
| A.2.2 Calificación y priorización del solicitante | ● | ● | ● |
| A.2.3 Conversión del solicitante en oportunidad de venta | ● | ● | ◐↑ |
| A.2.4 Embudo de oportunidades con etapas | ● | ● | ● |
| A.2.5 Embudos diferenciados por ramo | ● | ◐ | ○↑ |
| A.2.6 Oportunidades de cambio y ampliación sobre la cartera | ◐↑ | ◐ | ◐ |
| **Subtotal A.2** | **11/12 · 91,7 %** | **10/12 · 83,3 %** | **8/12 · 66,7 %** |

#### A.3 Productores y actividad comercial

| Criterio | EspoCRM | Twenty | Bitrix24 |
|---|:---:|:---:|:---:|
| A.3.1 Registro de productores y asignación de cartera | ● | ● | ● |
| A.3.2 Bitácora de la actividad con el cliente | ● | ● | ◐ |
| A.3.3 Agenda y carga de trabajo del productor | ● | ● | ● |
| A.3.4 Proyección de los movimientos comerciales | ◐↑ | ◐ | ◐ |
| **Subtotal A.3** | **7/8 · 87,5 %** | **7/8 · 87,5 %** | **6/8 · 75,0 %** |

#### A.4 Marketing, segmentación y reputación

| Criterio | EspoCRM | Twenty | Bitrix24 |
|---|:---:|:---:|:---:|
| A.4.1 Segmentación reutilizable de la cartera | ● | ● | ● |
| A.4.2 Diseño de campañas sobre un segmento | ● | ◐ | ○↑ |
| A.4.3 Medición de los resultados de la campaña | ● | ◐ | ○↑ |
| A.4.4 Captación de interesados desde redes sociales | ◐ | ◐ | ● |
| A.4.5 Escucha de menciones en canales públicos | ○ | ○ | ◐ |
| A.4.6 Publicación en redes desde el sistema | ○ | ○ | ○ |
| A.4.7 Registro de la competencia y del motivo de pérdida | ● | ● | ● |
| **Subtotal A.4** | **9/14 · 64,3 %** | **7/14 · 50,0 %** | **7/14 · 50,0 %** |

#### A.5 Atención al asegurado y reclamos

| Criterio | EspoCRM | Twenty | Bitrix24 |
|---|:---:|:---:|:---:|
| A.5.1 Reclamo como caso con identidad propia | ● | ◐ | ◐ |
| A.5.2 Estado y seguimiento del reclamo | ● | ● | ◐ |
| A.5.3 Responsable asignado a cada reclamo | ● | ● | ● |
| A.5.4 Base de conocimiento para la atención | ● | ● | ● |
| A.5.5 Tareas asignables con responsable y vencimiento | ● | ● | ● |
| A.5.6 Aviso al usuario al que se le asigna una tarea | ● | ● | ● |
| **Subtotal A.5** | **12/12 · 100,0 %** | **11/12 · 91,7 %** | **10/12 · 83,3 %** |

#### A.6 Ficha única del asegurado

| Criterio | EspoCRM | Twenty | Bitrix24 |
|---|:---:|:---:|:---:|
| A.6.1 Vinculación de la póliza con su titular | ● | ● | ● |
| A.6.2 Vista única del asegurado | ● | ● | ● |
| A.6.3 Campos propios del rubro en la ficha | ● | ● | ● |
| A.6.4 Unicidad de la ficha del asegurado | ● | ● | ○↑ |
| **Subtotal A.6** | **8/8 · 100,0 %** | **8/8 · 100,0 %** | **6/8 · 75,0 %** |

#### A.7 Intercambio de datos y correo

| Criterio | EspoCRM | Twenty | Bitrix24 |
|---|:---:|:---:|:---:|
| A.7.1 Importación de contactos desde planilla de cálculo | ◐ | ◐ | ◐ |
| A.7.2 Importación de contactos desde las agendas de correo | ◐ | ◐ | ◐ |
| A.7.3 Sincronización del correo de varios usuarios | ● | ● | ○↑ |
| A.7.4 Vinculación automática del correo a la ficha | ● | ● | ○↑ |
| A.7.5 Exportación de la cartera sin pérdida de datos | ● | ● | ○↑ |
| **Subtotal A.7** | **8/10 · 80,0 %** | **8/10 · 80,0 %** | **2/10 · 20,0 %** |

#### A.8 Parametrización del modelo de negocio

| Criterio | EspoCRM | Twenty | Bitrix24 |
|---|:---:|:---:|:---:|
| A.8.1 Creación de entidades sin programar | ● | ● | ○↑ |
| A.8.2 Campos calculados sobre datos propios | ● | ● | ◐ |
| A.8.3 Automatización de procesos | ●↑ | ● | ● |
| A.8.4 Conservación de la parametrización al actualizar | ● | ● | ● |
| **Subtotal A.8** | **8/8 · 100,0 %** | **8/8 · 100,0 %** | **5/8 · 62,5 %** |

#### A.9 Control de acceso y trazabilidad

| Criterio | EspoCRM | Twenty | Bitrix24 |
|---|:---:|:---:|:---:|
| A.9.1 Restricción de la cartera por productor | ● | ○↑ | ○↑ |
| A.9.2 Autenticación de los usuarios bajo control de la compañía | ● | ● | ◐↑ |
| A.9.3 Registro de quién modificó cada dato | ● | ● | ○↑ |
| **Subtotal A.9** | **6/6 · 100,0 %** | **4/6 · 66,7 %** | **1/6 · 16,7 %** |

#### A.10 Explotación de la información

| Criterio | EspoCRM | Twenty | Bitrix24 |
|---|:---:|:---:|:---:|
| A.10.1 Indicadores sobre la operación | ◐↑ | ◐ | ◐↑ |
| A.10.2 Generación de informes definidos por el usuario | ◐↑ | ◐ | ● |
| A.10.3 Informe paramétrico reutilizable | ◐↑ | ● | ● |
| A.10.4 Intercambio de datos con otros sistemas de la compañía | ● | ● | ○↑ |
| A.10.5 Intercambio sin límite de volumen que condicione la operación | ● | ● | ○↑ |
| **Subtotal A.10** | **7/10 · 70,0 %** | **8/10 · 80,0 %** | **5/10 · 50,0 %** |

#### A.12 Emisión, cobranza y continuidad de la relación

| Criterio | EspoCRM | Twenty | Bitrix24 |
|---|:---:|:---:|:---:|
| A.12.1 Emisión de la póliza al cerrar la venta | ●↑ | ● | ◐ |
| A.12.2 Plan de pago de la prima | ● | ● | ◐↑ |
| A.12.3 Datos que administra el sistema central | ● | ● | ○↑ |
| A.12.4 Historia del cliente desde el primer contacto | ● | ● | ◐↑ |
| A.12.5 Satisfacción después de la atención | ● | ● | ◐ |
| **Subtotal A.12** | **10/10 · 100,0 %** | **10/10 · 100,0 %** | **4/10 · 40,0 %** |

### Opcionales — no solicitados

#### B.2 Capacidades por encima de lo solicitado

| Criterio | EspoCRM | Twenty | Bitrix24 |
|---|:---:|:---:|:---:|
| B.2.1 Asistente de inteligencia artificial | ○↑ | ● | ● |
| B.2.2 Aplicación móvil nativa | ○ | ○ | ● |
| B.2.3 Suite de trabajo integrada | ◐ | ◐ | ◐↑ |
| B.2.4 Telefonía y videollamada integradas | ○↑ | ◐ | ◐↑ |
| **Subtotal B.2** | **1/8 · 12,5 %** | **4/8 · 50,0 %** | **6/8 · 75,0 %** |

#### Subtotal de los requerimientos funcionales

| | EspoCRM | Twenty | Bitrix24 |
|---|:---:|:---:|:---:|
| Originales | 99/112 · 88,4 % | 95/112 · 84,8 % | 66/112 · 58,9 % |
| Opcionales | 1/8 · 12,5 % | 4/8 · 50,0 % | 6/8 · 75,0 % |
| **Todos los requerimientos funcionales** | **100/120 · 83,3 %** | **99/120 · 82,5 %** | **72/120 · 60,0 %** |

## 5.2 Requerimientos técnicos

*¿Qué exige el sistema para funcionar y sostenerse?*

### Originales — solicitados por el cliente

#### A.11 Condiciones técnicas y operativas del producto — técnicos

| Criterio | EspoCRM | Twenty | Bitrix24 |
|---|:---:|:---:|:---:|
| A.11.1 Recursos que la compañía debe disponer para sostenerlo | ◐↑ | ◐↑ | ● |
| A.11.2 Compatibilidad con la plataforma que la compañía usa | ● | ◐↑ | ● |
| A.11.3 Puesta en marcha sin perfil técnico especializado | ◐↑ | ◐↑ | ● |
| A.11.9 Ecosistema de integraciones disponible | ◐ | ◐ | ◐↑ |
| A.11.14 Continuidad de las versiones en uso | ○ | ○ | ○ |
| **Subtotal A.11 — técnicos** | **5/10 · 50,0 %** | **4/10 · 40,0 %** | **7/10 · 70,0 %** |

### Opcionales — no solicitados

#### B.1 Condiciones que impone el negocio asegurador — técnicos

| Criterio | EspoCRM | Twenty | Bitrix24 |
|---|:---:|:---:|:---:|
| B.1.2 Copia propia y completa de la cartera | ● | ● | ○↑ |
| B.1.3 Copia periódica sin intervención manual | ◐ | ◐ | ◐ |
| B.1.6 Conocimiento y decisión sobre dónde residen los datos | ● | ● | ◐ |
| B.1.7 Continuidad de la atención ante una caída del enlace | ● | ● | ◐ |
| **Subtotal B.1 — técnicos** | **7/8 · 87,5 %** | **7/8 · 87,5 %** | **3/8 · 37,5 %** |

#### Subtotal de los requerimientos técnicos

| | EspoCRM | Twenty | Bitrix24 |
|---|:---:|:---:|:---:|
| Originales | 5/10 · 50,0 % | 4/10 · 40,0 % | 7/10 · 70,0 % |
| Opcionales | 7/8 · 87,5 % | 7/8 · 87,5 % | 3/8 · 37,5 % |
| **Todos los requerimientos técnicos** | **12/18 · 66,7 %** | **11/18 · 61,1 %** | **10/18 · 55,6 %** |

## 5.3 Requerimientos operativos

*¿Cómo se comporta en la operación diaria de la compañía?*

### Originales — solicitados por el cliente

#### A.11 Condiciones técnicas y operativas del producto — operativos

| Criterio | EspoCRM | Twenty | Bitrix24 |
|---|:---:|:---:|:---:|
| A.11.4 Menú y navegabilidad para la operación diaria | ● | ● | ● |
| A.11.5 Aprendizaje sin capacitación previa | ● | ◐ | ◐ |
| A.11.6 Localización completa al español, modelo incluido | ◐ | ◐ | ● |
| A.11.7 Cantidad de usuarios sin límite que condicione la operación | ● | ● | ● |
| A.11.8 Operación concurrente sobre la misma cartera | ● | ● | ○ |
| A.11.10 Documentación en español | ◐ | ● | ● |
| A.11.11 Material de capacitación para el usuario final | ● | ● | ● |
| A.11.12 Comunidad activa de usuarios | ◐ | ◐ | ○ |
| A.11.13 Soporte técnico con compromiso de respuesta | ○ | ○ | ◐ |
| **Subtotal A.11 — operativos** | **13/18 · 72,2 %** | **13/18 · 72,2 %** | **12/18 · 66,7 %** |

### Opcionales — no solicitados

#### B.1 Condiciones que impone el negocio asegurador — operativos

| Criterio | EspoCRM | Twenty | Bitrix24 |
|---|:---:|:---:|:---:|
| B.1.1 Persistencia de los datos sin uso continuo | ● | ● | ○↑ |
| B.1.4 Búsqueda y operación con volumen productivo | ● | ● | ○ |
| B.1.5 Previsibilidad de los cambios del sistema | ● | ● | ○ |
| **Subtotal B.1 — operativos** | **6/6 · 100,0 %** | **6/6 · 100,0 %** | **0/6 · 0,0 %** |

#### Subtotal de los requerimientos operativos

| | EspoCRM | Twenty | Bitrix24 |
|---|:---:|:---:|:---:|
| Originales | 13/18 · 72,2 % | 13/18 · 72,2 % | 12/18 · 66,7 % |
| Opcionales | 6/6 · 100,0 % | 6/6 · 100,0 % | 0/6 · 0,0 % |
| **Todos los requerimientos operativos** | **19/24 · 79,2 %** | **19/24 · 79,2 %** | **12/24 · 50,0 %** |

## 5.4 Resultado

### Recuento de los originales

| | EspoCRM | Twenty | Bitrix24 |
|---|:---:|:---:|:---:|
| Cumple ● | 51 | 47 | 33 |
| Cumple con reparo ◐ | 15 | 18 | 19 |
| No cumple ○ | 4 | 5 | 18 |
| *— un plan pago lo mejoraría* | 10 | 4 | 20 |
| **% de cumplimiento** | **87,5 %** | **83,3 %** | **57,7 %** |

### Recuento de los opcionales

| | EspoCRM | Twenty | Bitrix24 |
|---|:---:|:---:|:---:|
| Cumple ● | 6 | 7 | 2 |
| Cumple con reparo ◐ | 2 | 3 | 5 |
| No cumple ○ | 3 | 1 | 4 |
| *— un plan pago lo mejoraría* | 2 | 0 | 4 |
| **% de cumplimiento** | **52,7 %** | **71,4 %** | **48,2 %** |

### Cumplimiento total

| | EspoCRM | Twenty | Bitrix24 |
|---|:---:|:---:|:---:|
| Originales (85 %) | 87,5 % | 83,3 % | 57,7 % |
| Opcionales (15 %) | 52,7 % | 71,4 % | 48,2 % |
| **Cumplimiento total** | **82,3 %** | **81,5 %** | **56,3 %** |
| Esfuerzo de implementación *(conviene lo bajo)* | 46,4 % | 53,6 % | 60,0 % |
| *Comentario: contratando los planes que mejoran algún criterio* | *90,7 %* | *84,7 %* | *83,3 %* |

### Cómo leer estos recuentos

El resultado de cada plataforma es el cumplimiento total de esta sección, que pondera originales y opcionales 85/15. El porcentaje de cada parte promedia los de sus grupos (sección 3.6); por eso difiere de los subtotales por tipo de las secciones 5.1 a 5.3, que suman los puntos de todos sus criterios y solo sirven para comparar dentro de cada tipo.

## 5.5 Lo que agregarían las versiones pagas

Las versiones pagas no se operaron: lo que sigue surge de la documentación de cada fabricante. En Twenty y en Bitrix24 cada plan incluye lo de los más baratos; en EspoCRM cada extensión se compra por separado y agrega solo lo suyo.

### EspoCRM

| Versión | Precio | Criterios que cambia | Cumplimiento total |
|---|---|---|:---:|
| **Community, instalación propia** *(evaluada)* | **Gratis** | — | **82,3 %** |
| Intelligence | US$ 129 por año y por instalación | B.2.1 | *84,2 %* |
| Advanced Pack | US$ 395 por año y por instalación | A.1.5, A.2.6, A.3.4, A.8.3, A.10.1, A.10.2, A.10.3, A.12.1 | *86,4 %* |
| VoIP Integration + Zoom Integration | US$ 498 por año y por instalación (US$ 388 + US$ 110) | B.2.4 | *84,2 %* |
| Cloud Basic | US$ 15 por usuario por mes, mínimo 3 usuarios | A.1.5, A.2.6, A.3.4, A.8.3, A.10.1, A.10.2, A.10.3, A.11.1, A.11.3, A.12.1, B.2.4 | *88,8 %* |

### Twenty

| Versión | Precio | Criterios que cambia | Cumplimiento total |
|---|---|---|:---:|
| **Autoalojado** *(evaluada)* | **Gratis** | — | **81,5 %** |
| Cloud Pro | US$ 9 por usuario por mes, con pago anual | A.11.1, A.11.2, A.11.3 | *82,3 %* |
| Organization | US$ 39 por usuario por mes, con pago anual | A.9.1 | *84,7 %* |

### Bitrix24

| Versión | Precio | Criterios que cambia | Cumplimiento total |
|---|---|---|:---:|
| **Free** *(evaluada)* | **Gratis** | — | **56,3 %** |
| Basic | US$ 69 por mes, hasta 5 usuarios | A.2.5, A.7.3, A.7.4, A.7.5, A.9.1, A.11.9, B.1.1, B.1.2, B.2.4 | *66,9 %* |
| Basic Vibe+ | US$ 89 por mes, hasta 5 usuarios | A.10.4, A.10.5, A.12.3 | *70,4 %* |
| Standard | US$ 144 por mes, hasta 50 usuarios | A.2.3, A.4.2, A.4.3, A.6.4, A.9.3, A.10.1, A.12.4, B.2.3 | *78,6 %* |
| Professional | US$ 289 por mes, hasta 100 usuarios | A.1.1, A.8.1, A.12.2 | *82,1 %* |
| Enterprise | US$ 579 por mes, desde 250 usuarios | A.9.2 | *83,3 %* |
