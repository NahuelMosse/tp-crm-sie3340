# 3. Matriz de veredictos

Cada fila es una característica y cada columna una plataforma. El número de cada fila remite a la sección que la desarrolla. Las características están enunciadas de modo que tenerlas sea siempre la ventaja, así que ningún cruce queda indeciso.

**● ventaja  ○ desventaja  ◍ sin verificar aún**

*(Estado del borrador: las filas marcadas ◍ corresponden a verificaciones en curso. Ninguna se completa por deducción: o se comprueba sobre el sistema, o queda declarada como no verificada.)*

| Característica | EspoCRM | Twenty | Bitrix24 |
|---|:---:|:---:|:---:|
| **4.1 Gestión de la cartera de pólizas** | | | |
| 4.1.1 Modelado de la póliza como objeto propio del negocio | ● | ● | ◍ |
| 4.1.2 Tipos de dato adecuados para prima, vigencia y cobranza | ● | ◍ | ◍ |
| 4.1.3 Vinculación de la póliza con el asegurado | ● | ◍ | ◍ |
| 4.1.4 Consulta y filtrado de la cartera para prospección | ● | ● | ● |
| 4.1.5 Operación masiva sobre la cartera | ◍ | ◍ | ◍ |
| **4.2 Gestión comercial y de marketing** | | | |
| 4.2.1 Registro y calificación del solicitante | ● | ● | ● |
| 4.2.2 Embudo de oportunidades vinculado al asegurado | ● | ● | ● |
| 4.2.3 Segmentación reutilizable de la cartera | ● | ○ | ● |
| 4.2.4 Campañas con medición de resultados | ● | ○ | ● |
| 4.2.5 Captación de prospectos desde redes sociales | ○ | ○ | ● |
| 4.2.6 Escucha de menciones y reputación | ○ | ○ | ◍ |
| 4.2.7 Proyección de ventas | ◍ | ◍ | ◍ |
| 4.2.8 Registro de la competencia y motivos de pérdida | ◍ | ◍ | ◍ |
| **4.3 Atención al asegurado** | | | |
| 4.3.1 Gestión de reclamos como casos con seguimiento | ● | ○ | ◍ |
| 4.3.2 Ficha integral del asegurado | ● | ● | ● |
| 4.3.3 Base de conocimiento para la atención | ● | ○ | ◍ |
| 4.3.4 Tareas con responsable y vencimiento | ● | ● | ● |
| 4.3.5 Agenda y carga de trabajo por productor | ● | ◍ | ● |
| **4.4 Parametrización y modelo de datos** | | | |
| 4.4.1 Creación de entidades sin programar | ● | ● | ◍ |
| 4.4.2 Relaciones entre entidades desde la interfaz | ● | ◍ | ◍ |
| 4.4.3 Campos calculados sobre datos propios | ● | ○ | ○ |
| 4.4.4 Automatización de procesos incluida | ○ | ● | ○ |
| **4.5 Tecnología e implantación** | | | |
| 4.5.1 Requerimientos de infraestructura moderados | ● | ○ | ● |
| 4.5.2 Instalación guiada sin conocimientos técnicos | ● | ○ | ● |
| 4.5.3 Operación sin conexión a internet | ● | ● | ○ |
| 4.5.4 Importación desde los formatos que usa el cliente | ○ | ◍ | ◍ |
| 4.5.5 Localización completa al español, modelo incluido | ● | ○ | ● |
| **4.6 Seguridad, roles y trazabilidad** | | | |
| 4.6.1 Restricción de la cartera por productor | ● | ◍ | ◍ |
| 4.6.2 Registro de quién modificó cada dato | ● | ◍ | ○ |
| 4.6.3 Integridad de la ficha única del asegurado | ● | ○ | ◍ |
| 4.6.4 Control sobre la localización de los datos | ● | ● | ○ |
| **4.7 Interfaces e integración** | | | |
| 4.7.1 Interfaz de programación sin restricciones de uso | ● | ● | ○ |
| 4.7.2 Acceso directo a la base de datos | ● | ● | ○ |
| 4.7.3 Sincronización de correo multiusuario | ● | ● | ● |
| 4.7.4 Ecosistema de integraciones disponible | ○ | ○ | ● |
| **4.8 Continuidad y autonomía** | | | |
| 4.8.1 Persistencia de los datos sin uso continuo | ● | ● | ○ |
| 4.8.2 Respaldo bajo control de la organización | ● | ● | ○ |
| 4.8.3 Búsqueda y operación con volumen productivo | ● | ● | ○ |
| 4.8.4 Control sobre el momento de actualizar | ● | ● | ○ |
| 4.8.5 Uso sin restricciones comerciales en la interfaz | ● | ● | ○ |
| **4.9 Soporte y capacitación** | | | |
| 4.9.1 Documentación en español | ● | ○ | ● |
| 4.9.2 Comunidad activa de usuarios | ● | ● | ● |
| 4.9.3 Soporte técnico disponible en la versión evaluada | ○ | ○ | ○ |
| 4.9.4 Informes disponibles sin costo adicional | ○ | ○ | ○ |

## 3.1 Recuento provisorio

| | EspoCRM | Twenty | Bitrix24 |
|---|:---:|:---:|:---:|
| Ventajas verificadas | 29 | 18 | 14 |
| Desventajas verificadas | 6 | 13 | 13 |
| Pendientes de verificación | 5 | 9 | 13 |

El recuento es provisorio y no constituye la conclusión del informe: una ventaja en la interfaz de programación no pesa lo mismo que la imposibilidad de modelar una póliza. La ponderación por criticidad se desarrolla en la sección 6.

## 3.2 Tres observaciones sobre la matriz

**Las filas 4.4.1 a 4.4.3 gobiernan las filas 4.1.1 a 4.1.3.** La capacidad de crear entidades, relacionarlas y calcular sobre ellas es lo que habilita modelar la póliza. Son características distintas y se evalúan por separado, pero su dependencia explica por qué una plataforma que pierde en 4.4 no puede ganar en 4.1.

**El bloque 4.8 se resuelve por modalidad, no por producto.** Las cinco características de continuidad y autonomía favorecen a las dos instalaciones propias por la misma razón estructural: quien controla el servidor controla el respaldo, el momento de actualizar y la permanencia de los datos. No son cinco hallazgos independientes sino una consecuencia de la modalidad, y así se interpreta en las conclusiones.

**La fila 4.9.4 no tiene ganador.** Ninguna de las tres ofrece informes en su versión gratuita. Es la única carencia común y se analiza como tal en la sección 6, junto con la vía alternativa que las tres habilitan: exportar y construir el informe por fuera del sistema.
