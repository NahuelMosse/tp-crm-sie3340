# 6. Análisis por criterio

*Generado automáticamente a partir de las justificaciones registradas durante las pruebas.*

Cada criterio indica, para cada plataforma, el valor de cumplimiento, el costo de implementación cuando corresponde y la razón del valor. Las dos escalas están definidas en la sección 3; los procedimientos, en la sección 4.

## A.1 Cartera de pólizas

### A.1.1 Modelado de la póliza como objeto propio
**EspoCRM** · **2** (cumple) · costo de implementación **1** — El Administrador de Entidades crea la entidad Póliza desde la pantalla de administración, sin escribir código ni tocar archivos del servidor. Queda con identidad propia: figura en el modelo de datos, tiene su entrada en el menú principal, su listado y su ficha, y admite registros. A partir de ahí el usuario opera con la póliza igual que con las entidades que trae el producto —la busca, la filtra, la relaciona— de modo que la necesidad queda resuelta desde el sistema. Definirla es trabajo de una sola vez, y eso es lo que refleja el costo de implementación.

**Twenty** · **2** (cumple) · costo de implementación **1** — Desde Configuración › Modelo de datos se crea el objeto Póliza con su nombre en singular y plural, sin escribir código ni tocar el servidor. Queda con identidad propia: figura entre los objetos del modelo, aparece en el menú de la izquierda junto a los que trae el producto, tiene su listado y admite registros, que se cargan desde el mismo listado. Definirlo es trabajo de una sola vez.

**Bitrix24** · **0** (no cumple) — Las entidades propias de Bitrix24 son los procesos inteligentes, que se crean desde la barra del CRM sin programar: nombre, etapas, embudos y reglas de automatización. En la edición gratuita el formulario se completa, pero al guardar el sistema no crea la entidad y avisa que los procesos inteligentes requieren el plan Professional o el Enterprise. Sin ellos la póliza no tiene identidad propia: habría que forzarla dentro de otra entidad del producto.

> «SPA (smart process automation)»
>
> — https://www.bitrix24.com/promo/professional/, consultado el 29 de septiembre de 2026


### A.1.2 Campos de lista para el ramo y el estado de cobranza
**EspoCRM** · **2** (cumple) · costo de implementación **1** — El Administrador de Campos agrega campos de tipo lista y admite escribir sus valores, sin programar. Se definieron los ramos que comercializa la compañía —Automotor, Hogar, Vida, Salud— y los estados de cobranza, y se cargó una póliza de cada ramo desde el formulario: las cuatro quedaron con su ramo visible en el listado. El estado de cobranza se cambia desde la ficha y el cambio queda guardado. El usuario elige de la lista y no puede escribir un valor imprevisto, que es lo que vuelve confiable la clasificación de la cartera. El campo se define en una pantalla y se ubica en el formulario en otra, ambas de administración: es configuración inicial, no desarrollo. *4 ramos cargados y visibles en el listado.*

**Twenty** · **2** (cumple) · costo de implementación **1** — El modelo de datos admite campos de lista con las opciones que define la compañía. Se agregaron el ramo, con los cuatro que comercializa, y el estado de pago, con los cuatro estados de cobranza; se cargó por pantalla una póliza de cada ramo y a cada una se le cambió el estado desde su ficha, eligiendo la opción en un desplegable con buscador. Los valores quedan guardados como opciones de la lista, no como texto libre. Definir los campos es trabajo de una sola vez.

**Bitrix24** · **2** (cumple) · costo de implementación **1** — Desde el formulario de la negociación —que en la edición gratuita hace de póliza, a falta de entidades propias— se agregan campos de tipo lista sin programar. Se definieron los ramos —Automotor, Hogar, Vida, Salud— y los estados de cobranza, se cargó una póliza de cada ramo y a la de salud se le cambió el estado desde su ficha: todo quedó guardado. El usuario elige de la lista y no puede escribir un valor imprevisto. Definir los campos es configuración de una vez, en el mismo formulario. *4 ramos cargados.*


### A.1.3 Prima con importe y moneda
**EspoCRM** · **2** (cumple) · costo de implementación **1** — El producto ofrece un tipo de campo de importe con moneda, que se agrega desde la administración. Cargada una prima de 184.532,75, la ficha la devuelve con sus centavos y con la denominación, y el sistema la trata como importe y no como texto: guarda la moneda junto al valor y mantiene una lista de monedas habilitadas. Es lo que necesita una compañía que cobra primas en pesos y emite pólizas en dólares sin que los importes se mezclen al sumarlos. *Prima de 184.532,75 registrada y devuelta con centavos y denominación.*

**Twenty** · **2** (cumple) · costo de implementación **1** — El modelo de datos tiene un tipo de campo de importe con moneda. Se agregó la prima en pesos argentinos y se cargó 45.250,75 desde la ficha: quedó guardada con los centavos y con su moneda. Para eso el campo se define una vez con formato completo y dos decimales. Con la definición de fábrica —formato corto, sin decimales— el editor descarta el separador decimal y guarda el importe multiplicado por cien sin avisar, un error que el fabricante tiene registrado; quien define el campo tiene que saberlo. Definirlo bien es trabajo de una sola vez. *guardado 45250.75 ARS; en pantalla «45.250,75
45.250,75».*

> «In a currency field left at the default Number of decimals = 0, the editor rejects the typed decimal separator but keeps the digits after it. The amount is saved 10^n times too large, with no warning.»
>
> — https://github.com/twentyhq/twenty/issues/25870, consultado el 29 de septiembre de 2026

**Bitrix24** · **2** (cumple) · costo de implementación **1** — El formulario de la negociación, que hace de póliza en la edición gratuita, admite campos de tipo dinero: importe y moneda en el mismo campo. El peso argentino no venía entre las monedas del portal: se agregó desde la configuración del CRM, eligiéndolo de la lista de monedas y cargando su cotización. Se cargó una prima de 15.250,50 pesos y quedó guardada con sus centavos y su moneda. Agregar la moneda y el campo es configuración de una vez. *Guardado: 15250.5|ARS.*


### A.1.4 Vigencia con fecha de inicio y de fin
**EspoCRM** · **2** (cumple) · costo de implementación **1** — Los campos de inicio y de fin de vigencia se agregan como campos de fecha desde la administración, y el sistema los trata como tales y no como texto. Se cargaron dos pólizas, una que vence en doce días y otra en trescientos: ordenado por vencimiento, el listado pone primero la que vence antes, y la condición "vence en los próximos 30 días" devuelve la primera y deja afuera la segunda. El filtro ofrece 21 comparaciones propias de una fecha —próximos o últimos X días, antes, después, entre, mes o trimestre en curso—. Para poder filtrar por un campo propio hay que habilitarlo antes entre los filtros de búsqueda del listado, en la misma administración: configuración inicial, no desarrollo. *21 comparaciones de fecha en el filtro.*

**Twenty** · **2** (cumple) · costo de implementación **1** — El modelo de datos tiene un tipo de campo de fecha. Se agregaron el inicio y el fin de la vigencia y se cargaron dos pólizas desde su ficha. El sistema los trata como fechas: el listado ordenado por fin de vigencia pone primero la que vence antes, y el filtro sobre ese campo ofrece comparaciones propias de una fecha —antes, después, en el pasado, en el futuro, relativa—: «vence en los próximos 30 días» trae la póliza que vence en doce días y deja afuera la que vence en trescientos. Definir los campos es trabajo de una sola vez. *comparaciones del filtro de fecha: .*

**Bitrix24** · **2** (cumple) · costo de implementación **1** — El formulario de la negociación, que en la edición gratuita hace de póliza, admite campos de tipo fecha. Se agregaron el inicio y el fin de la vigencia desde el mismo formulario y se cargaron tres pólizas con sus fechas. El sistema las trata como fechas: con un clic en el encabezado de la columna el listado se ordena por calendario —no alfabéticamente— y otro clic invierte el orden; y el filtro sobre ese campo ofrece comparaciones propias de una fecha —hoy, próximos N días, rango, mes, trimestre—: «vence en los próximos 30 días» trajo solo la póliza que vence en doce días y dejó afuera las de 150 y 300. Definir los campos y mostrarlos como columna y en el filtro es trabajo de una sola vez. *orden POL-VENCE-PRONTO > POL-VENCE-MEDIO > POL-VENCE-TARDE · vencen en 30 días: POL-VENCE-PRONTO.*


### A.1.5 Aviso anticipado de vencimiento
**EspoCRM** · **1** (cumple con reparo) · costo de implementación **2** — La edición gratuita no incluye un motor de reglas: la administración ofrece tareas programadas del sistema, notificaciones y fórmulas, pero ninguna vía para que la compañía defina "avisar de lo que vence en treinta días" y el sistema lo emita solo. La necesidad se cubre con la consulta del listado —vence en los próximos 30 días, y su equivalente sobre el plazo de los reclamos—, que devuelve exactamente lo que hay que atender, pero que alguien tiene que abrir: el trabajo se repite cada día que la compañía quiere estar al tanto. Queda resuelta con un costo permanente. El fabricante vende el motor de flujos de trabajo como extensión, y con ella el aviso se define una vez y se emite solo.

> «Workflows»
>
> — https://www.espocrm.com/extensions/advanced-pack/, consultado el 28 de septiembre de 2026

> «$395.00 1 Year License + Upgrades»
>
> — https://www.espocrm.com/extensions/advanced-pack/, consultado el 28 de septiembre de 2026

> «1.1 Subject to your continuous compliance with the Agreement and payment of the applicable license fees, EspoCRM grants you a non-exclusive, non-transferable, worldwide, limited right to use the Software on a single EspoCRM Application instance on a single server for the Licensed Period. After the license period expires, you must renew or purchase a new license to continue using the Software. You may use or modify the Software only for your own internal business purposes or for non-commercial or personal use.»
>
> — https://www.espocrm.com/extension-license-agreement/, consultado el 28 de septiembre de 2026

> «Basic $15.00 per user/month minimum 3 users 3GB file storage per user 100,000 records SSL Encryption (256 bit keys, TLS 1.3) Full feature set All extensions included External access API 2000+ integrations * 12x5 (hours/days) support Sign Up Free Trial Free Trial is provided for 30 days»
>
> — https://www.espocrm.com/cloud/, consultado el 28 de septiembre de 2026

   ↳ **Con Advanced Pack** (US$ 395 por año y por instalación, abono recurrente) · **2** (cumple) · costo de implementación **1** — La extensión agrega los flujos de trabajo: la condición de vencimiento y la de plazo de reclamo se definen una vez desde la administración, y el sistema emite el aviso sin que nadie abra nada.

   ↳ **Con EspoCRM Cloud Basic** (US$ 15 por usuario por mes, mínimo 3 usuarios, abono recurrente) · **2** (cumple) · costo de implementación **1** — El servicio en la nube incluye todas las extensiones del fabricante, flujos de trabajo incluidos: el aviso se configura igual que con la extensión, sin comprarla aparte.

**Twenty** · **2** (cumple) · costo de implementación **1** — Los flujos de trabajo de la edición gratuita alcanzan para el aviso, armados desde el lienzo sin escribir código: un disparador programado busca las pólizas cuyo fin de vigencia cae en los próximos treinta días y los reclamos cuyo plazo de resolución vence en los próximos dos, y por cada uno deja una tarea con su nombre. Se activó el flujo y, sin que nadie interviniera, en la corrida siguiente del programador aparecieron los 9 avisos de pólizas por vencer y el del reclamo que alcanza su plazo; no avisó las pólizas que vencen más adelante ni el reclamo que tiene tres semanas. Armar el flujo es trabajo de una sola vez. *10 avisos emitidos sin intervención.*

**Bitrix24** · **2** (cumple) · costo de implementación **1** — Las reglas de automatización de la negociación aceptan un momento de ejecución relativo a una fecha: «N días antes» del valor de un campo de tipo fecha. Se definieron desde la pantalla, sin código, dos avisos por notificación al responsable: treinta días antes del fin de vigencia de la póliza y dos días antes del plazo de resolución del reclamo —que en la edición gratuita, sin entidad propia, es un campo de fecha de la negociación—, con fecha y hora. Se cargaron una póliza que vence dentro de treinta días y unos minutos, otra en 200, un reclamo que agota su plazo dentro de dos días y unos minutos y otro en 25 días, y nadie tocó nada más: a los 10 minutos llegaron las notificaciones de la póliza y del reclamo cuyo momento de aviso había llegado, y no las de los que todavía están lejos. El aviso se calcula sobre el valor del campo —la fecha y hora menos treinta días—, y un campo de solo fecha lo calcularía a la medianoche; el sistema lo ejecuta con su programador, con una demora de unos minutos sobre el instante calculado, sin consecuencia para avisos de días de anticipación. Cada aviso se marca «En paralelo»: por omisión una regla espera a que termine la anterior de su etapa, y con una regla previa de un día de retraso el aviso saldría un día tarde. La edición gratuita admite hasta 5 reglas y disparadores en total: el portal trae 2 reglas de muestra en la etapa inicial y, con ellas, los dos avisos entran sin pedir otro plan. Armar cada aviso es configuración de una vez. *Avisos emitidos sin intervención: 2, a los 10 minutos.*

> «Time ranges are available for fields with the Date and Date and time types.»
>
> — https://helpdesk.bitrix24.com/open/21174186/, consultado el 30 de septiembre de 2026


### A.1.6 Consulta y filtrado de la cartera
**EspoCRM** · **2** (cumple) · costo de implementación **1** — El listado de pólizas admite combinar condiciones: se pidieron a la vez el ramo Automotor, el estado de cobranza al día y un productor responsable, y de 20 pólizas el sistema devolvió 2, exactamente las que cumplen las tres al mismo tiempo. La consulta se arma desde el listado eligiendo campo, comparación y valor, sin escribir ninguna expresión. Los campos propios de la póliza no vienen habilitados como filtro: hay que agregarlos una vez a los filtros de búsqueda desde la administración, y ese paso es el costo de implementación. Es la consulta que el área comercial repite todos los días para saber a quién llamar. *2 de 20 pólizas cumplen las tres condiciones.*

**Twenty** · **2** (cumple) · costo de implementación **1** — El listado de pólizas combina filtros sobre cualquier campo: se filtró por ramo, por estado de pago y por productor responsable, y el resultado trajo exactamente las 2 pólizas de la cartera que cumplen las tres condiciones. La combinación se puede guardar como una vista con nombre. El productor responsable es un campo de relación con los usuarios que se agrega al modelo una vez: la póliza, como objeto propio, no lo trae. *2 pólizas con ramo Automotor, estado Al día y productor Pablo Gómez.*

**Bitrix24** · **2** (cumple) · costo de implementación **1** — El filtro del listado de negociaciones combina condiciones sobre cualquier campo. De una cartera de seis pólizas se filtró por ramo Automotor, estado de cobranza Al día y productor responsable, y el listado trajo exactamente las dos que cumplen las tres. El filtro se puede guardar con nombre. El productor responsable viene en toda negociación como «Persona responsable»; el ramo y el estado son campos propios que hay que mostrar en el filtro una vez, con «Agregar campo». *2 pólizas: ramo Automotor, estado Al día, productor Gómez Productor.*


### A.1.7 Operación masiva sobre la cartera
**EspoCRM** · **2** (cumple) · costo de implementación **1** — Se seleccionaron las 20 pólizas de los ramos Automotor y Hogar desde el listado, y el menú de acciones sobre la selección ofrece 8 operaciones: Eliminar, Unir, Actualización masiva, Exportar, Seguir, Dejar de seguir, Convertir moneda, Recalcular fórmula. Con la actualización masiva se eligió el estado de cobranza, se le dio un valor y el sistema lo aplicó en una sola operación: las 20 quedaron con el nuevo estado sin recorrerlas una por una. De fábrica la actualización masiva solo alcanza al usuario y al equipo asignados; para que incluya un campo propio hay que habilitarlo una vez desde la administración. Es lo que vuelve manejable un cambio de estado por lote de cobranza o una renovación de cartera. *20 pólizas modificadas con una sola acción.*

**Twenty** · **2** (cumple) — Se seleccionaron las 7 pólizas del ramo Hogar desde el listado y, con la selección hecha, la acción de actualizar abre un panel con los campos de la póliza: se eligió el estado de pago nuevo y se aplicó a todas de una vez, tras una confirmación que advierte que el cambio no se puede deshacer. Las seleccionadas quedaron con el estado nuevo. Viene listo: no hay nada que configurar. *7 de 7 pólizas actualizadas con una sola acción.*

**Bitrix24** · **2** (cumple) — Se filtró el listado por el ramo Hogar, se tildó la casilla del encabezado —que selecciona las 3 pólizas— y en el desplegable de acciones de la selección se eligió «Cambiar a la persona responsable»: con el productor Gómez Productor y un solo «Aplicar», todas quedaron a su cargo. Las acciones de la selección vienen con el producto y no hay nada que configurar; modificar en bloque otro campo propio, como el estado de cobranza, no figura entre ellas. *3 de 3 pólizas reasignadas con una sola acción.*


## A.2 Captación y proceso de venta

### A.2.1 Registro del solicitante con sus datos de contacto
**EspoCRM** · **2** (cumple) — El producto trae una entidad para quien todavía no contrató —el posible cliente— con nombre, teléfono, correo y domicilio desglosado en calle, ciudad, provincia, código postal y país. Se registró un solicitante con todos esos datos, que se guardaron completos, y se lo recuperó buscando su apellido desde el listado. Viene listo con la instalación, sin configurar nada.

**Twenty** · **2** (cumple) · costo de implementación **1** — Twenty no tiene una entidad para quien todavía no contrató: el solicitante se registra como una persona, igual que el asegurado. La persona trae nombre, correos y teléfonos con su código de país, pero no domicilio: se agregó un campo de dirección, desglosado en calle, ciudad, provincia, código postal y país. Se cargó una solicitante con todos esos datos desde su ficha y la búsqueda general la encontró por su nombre. Agregar el domicilio es trabajo de una sola vez.

**Bitrix24** · **2** (cumple) — La edición gratuita no incluye el módulo de prospectos: el solicitante se registra como un contacto, igual que el asegurado. El formulario del contacto trae nombre y apellido, teléfono, correo y dirección desglosada en código postal, país, provincia, ciudad y calle. Se cargó una solicitante con todos esos datos desde el formulario y quedaron guardados; la búsqueda del listado la encontró por su nombre. Viene listo: no hay nada que configurar.


### A.2.2 Calificación y priorización del solicitante
**EspoCRM** · **2** (cumple) · costo de implementación **1** — El posible cliente no trae cobertura pedida ni urgencia: se agregaron como dos campos de lista desde la administración y se los ubicó en el formulario y en el listado. Se cargaron tres solicitantes en desorden y, al ordenar el listado por urgencia, el sistema respetó el orden de la lista —alta, media, baja— y no el alfabético, de modo que los más cercanos a contratar quedan arriba. Configuración de una sola vez, sin programar. *Orden obtenido: Prioridad Alta · Prioridad Media · Prioridad Baja.*

**Twenty** · **2** (cumple) · costo de implementación **1** — La persona no trae cobertura pedida ni urgencia: se agregaron como dos campos de lista desde el modelo de datos. Se cargaron tres solicitantes en desorden y, al ordenar el listado por urgencia, quedaron en el orden de las opciones —primero la alta, después la media y al final la baja—, no alfabético: el orden sale de cómo se definió la lista. El orden se puede guardar en una vista. Definir los dos campos es trabajo de una sola vez.

**Bitrix24** · **2** (cumple) · costo de implementación **1** — El contacto no trae cobertura pedida ni urgencia: se agregaron como dos campos de lista desde su propio formulario. Se cargaron tres solicitantes en desorden y, con un clic en el encabezado de la columna «Urgencia», el listado quedó ordenado primero la alta, después la media y al final la baja —el orden de las opciones de la lista, no el alfabético—; otro clic lo invierte. Definir los dos campos es configuración de una sola vez. *orden: Vera > Sosa > Ríos.*


### A.2.3 Conversión del solicitante en oportunidad de venta
**EspoCRM** · **2** (cumple) — La ficha del solicitante trae la acción de convertir, que crea en un solo paso el asegurado y la oportunidad de venta. Los datos ya cargados pasaron solos: el formulario de conversión trajo el nombre escrito, y el asegurado quedó con el mismo correo, teléfono y domicilio del solicitante, sin volver a tipearlos. Solo se completó lo que el solicitante no tenía —monto y fecha de cierre de la venta—. El solicitante quedó marcado como convertido y la oportunidad, ligada al asegurado. Viene listo de fábrica.

**Twenty** · **2** (cumple) · costo de implementación **1** — Twenty no trae una acción de convertir al solicitante: la persona y la oportunidad son registros separados. Con un flujo de trabajo que se lanza a mano sobre la persona se armó esa acción, sin escribir código: crea la oportunidad con la cobertura que pidió el solicitante y lo deja como su contacto. Desde la ficha de la solicitante, la acción aparece en el menú de comandos; al lanzarla se creó la oportunidad con la cobertura cargada —«AUTOMOTOR»: el flujo toma el valor interno de la lista, no su etiqueta— y vinculada a ella, sin volver a escribir nada. Armar la acción es trabajo de una sola vez.

**Bitrix24** · **1** (cumple con reparo) · costo de implementación **2** — La conversión de un interesado en oportunidad es una acción del módulo de prospectos, y ese módulo no está en la edición gratuita: al abrir «Prospectos» el sistema informa que no está incluido en el plan. Con el solicitante como contacto, lo más cercano es crear la negociación desde su ficha: queda ligada a él y su teléfono y correo se ven en la negociación sin volver a escribirlos, pero no hay una acción que la arme con lo que el solicitante pidió: la cobertura solicitada, un campo propio del contacto, se vuelve a cargar a mano en cada negociación.

> «Todo lo incluido en Basic, más: Almacenamiento de 100 GB Prospectos ilimitados Facturas y cotizaciones Diseñador de formularios CRM Firma electrónica Marketing por WhatsApp Eficiencia de tareas (KPI) Proyectos ilimitados Tableros ilimitados»
>
> — https://www.bitrix24.es/prices/, consultado el 30 de septiembre de 2026

> «US$ 144»
>
> — https://www.bitrix24.es/prices/, consultado el 30 de septiembre de 2026

   ↳ **Con Bitrix24 Standard** (US$ 144 por mes, hasta 50 usuarios, abono recurrente) · **2** (cumple) · costo de implementación **1** — El plan Standard incluye prospectos ilimitados, con su acción de convertir el prospecto en contacto, compañía y negociación llevando los datos cargados. Los campos propios pasan a la negociación si existen con el mismo nombre en las dos entidades: crearlos es configuración de una vez.


### A.2.4 Embudo de oportunidades con etapas
**EspoCRM** · **2** (cumple) — Desde la ficha del asegurado, su panel de oportunidades crea una nueva ya ligada a él. El embudo viene definido de fábrica con 6 etapas y una probabilidad de cierre asociada a cada una. La oportunidad se hizo avanzar de calificación a propuesta, a negociación y a cerrada ganada: el sistema ajustó la probabilidad en cada paso, terminó en el cien por ciento, y la historia de la ficha conserva el recorrido completo. Las etapas se pueden renombrar para que sigan el proceso comercial de la compañía, pero tal como vienen ya lo resuelven. *Recorrido conservado: Qualification → Proposal → Negotiation → Closed Won.*

**Twenty** · **2** (cumple) — Desde la ficha del asegurado, su sección de oportunidades crea una nueva ya ligada a él como contacto. El embudo viene definido de fábrica con 6 etapas —New, Screening, Meeting, Proposal, Customer, Perdida— y una vista de tablero por etapa. La oportunidad se hizo avanzar etapa por etapa desde su ficha hasta la última, y el historial registró el avance —los cambios hechos seguidos por la misma persona se agrupan en una sola entrada—. Viene listo, aunque las etapas vienen con nombres en inglés y de una venta genérica: adaptarlas al seguro es configuración. *6 etapas recorridas; 1 entrada(s) de cambio de etapa en el historial.*

**Bitrix24** · **2** (cumple) — Desde la ficha del contacto, la solapa de negociaciones crea una nueva ya ligada a él. El embudo viene definido de fábrica —en desarrollo, crear documentos, factura, en progreso, factura final y el cierre, ganado o perdido— y la negociación se hizo avanzar con un clic en cada etapa de la barra de su ficha hasta cerrarla como ganada. Viene listo, aunque las etapas son las de una venta genérica: adaptarlas al seguro es configuración. *etapa final: WON.*


### A.2.5 Embudos diferenciados por ramo
**EspoCRM** · **2** (cumple) · costo de implementación **1** — Los embudos múltiples vienen en el producto y se habilitan por entidad, con una casilla de su configuración. Se creó un segundo embudo para los seguros de personas desde su propia pantalla, y su panel de etapas permitió adaptarlas al ramo: la calificación pasó a ser la declaración de salud, la propuesta la evaluación médica, y se quitó la negociación, que en ese ramo no existe. Quedaron 5 etapas contra las 6 del embudo general. Se cargó una oportunidad eligiendo ese embudo desde el formulario, y avanza por sus etapas y no por las del otro. Es configuración de una sola vez, sin programar. *Embudo nuevo: Prospección → Declaración de salud → Evaluación médica → Cerrado ganado → Cerrado perdido.*

**Twenty** · **1** (cumple con reparo) · costo de implementación **2** — Twenty tiene un solo embudo por objeto: las etapas de la oportunidad son un campo de lista, y el tablero agrupa por ese campo. Un segundo embudo se arma con un segundo campo de lista —para los seguros de personas: cotización, examen médico, emisión— y un tablero agrupado por él; se hizo así y la oportunidad quedó ubicada en el segundo embudo. Pero las dos listas conviven en todas las oportunidades: nada impide que una oportunidad de automotor tenga etapa de vida, ni separa qué embudo sigue cada una. Mantener esa separación queda a cargo de quien carga la oportunidad, en cada alta.

**Bitrix24** · **0** (no cumple) — La edición gratuita trae un solo embudo, el pipeline general. Desde «Pipelines y túneles de ventas», al pedir «Agregar pipeline» el sistema no abre el embudo nuevo: informa que la cantidad máxima de pipelines depende del plan y ofrece actualizar; la lista de embudos siguió con uno solo. El fabricante publica los embudos de ventas como función que se suma con el plan Basic.

> «Todo lo incluido en Free, más: Almacenamiento de 24 GB IA para el trabajo diario en Bitrix24 Embudos de ventas Negociaciones recurrentes Pagos en línea Integración de correo electrónico Integración de WhatsApp Integración de telefonía»
>
> — https://www.bitrix24.es/prices/, consultado el 30 de septiembre de 2026

> «Funciones clave: Almacenamiento de 5 GB CRM básico (negociaciones, contactos) Tareas (Kanban, Gantt) Calendarios compartidos Chat y videollamadas»
>
> — https://www.bitrix24.es/prices/, consultado el 30 de septiembre de 2026

> «Basic Ideal para emprendedores individuales y equipos pequeños que están empezando US$ 69 US$ 69 US$ 49 / compañía / mes / facturado mensualmente / compañía / mes / facturación anual Un pago de US$ 588 / año Ahorra US$ 240 al año incluye 5 usuarios Comprar Comprar Todo lo incluido en Free, más: Almacenamiento de 24 GB IA para el trabajo diario en Bitrix24 Embudos de ventas Negociaciones recurrentes Pagos en línea Integración de correo electrónico Integración de WhatsApp Integración de telefonía»
>
> — https://www.bitrix24.es/prices/, consultado el 30 de septiembre de 2026

   ↳ **Con Bitrix24 Basic** (US$ 69 por mes, hasta 5 usuarios, abono recurrente) · **2** (cumple) · costo de implementación **1** — Con el plan de entrada se pueden crear embudos adicionales, cada uno con sus propias etapas: uno por ramo y una negociación en el que corresponde. Definirlos es configuración de una vez. Los planes superiores suben la cantidad de embudos y no cambian lo que se resuelve.


### A.2.6 Oportunidades de cambio y ampliación sobre la cartera
**EspoCRM** · **1** (cumple con reparo) · costo de implementación **2** — El conjunto de los próximos a vencer sale directo: el listado de pólizas filtrado por vencimiento en treinta días muestra cada póliza con su titular. El otro conjunto no: el listado de asegurados no admite condiciones sobre el ramo de sus pólizas, y el de pólizas filtra una por una. Para obtener a los que tienen automotor y no hogar hay que sacar los dos listados y cruzarlos por fuera del sistema, trabajo que se repite cada vez que el área comercial arma una campaña de ampliación. El módulo de informes que vende el fabricante resuelve ese cruce con condiciones de pertenencia y de exclusión sobre los registros relacionados.

> «NOT IN provides the ability to filter records that don't meet specified criteria. E.g. listing accounts that don't have any opportunity with 'Closed Won' or 'Closed Lost' status.»
>
> — https://docs.espocrm.com/user-guide/reports/, consultado el 28 de septiembre de 2026

> «IN is similar to AND group but utilizes a sub-query.»
>
> — https://docs.espocrm.com/user-guide/reports/, consultado el 28 de septiembre de 2026

> «$395.00 1 Year License + Upgrades»
>
> — https://www.espocrm.com/extensions/advanced-pack/, consultado el 28 de septiembre de 2026

> «1.1 Subject to your continuous compliance with the Agreement and payment of the applicable license fees, EspoCRM grants you a non-exclusive, non-transferable, worldwide, limited right to use the Software on a single EspoCRM Application instance on a single server for the Licensed Period. After the license period expires, you must renew or purchase a new license to continue using the Software. You may use or modify the Software only for your own internal business purposes or for non-commercial or personal use.»
>
> — https://www.espocrm.com/extension-license-agreement/, consultado el 28 de septiembre de 2026

> «Basic $15.00 per user/month minimum 3 users 3GB file storage per user 100,000 records SSL Encryption (256 bit keys, TLS 1.3) Full feature set All extensions included External access API 2000+ integrations * 12x5 (hours/days) support Sign Up Free Trial Free Trial is provided for 30 days»
>
> — https://www.espocrm.com/cloud/, consultado el 28 de septiembre de 2026

   ↳ **Con Advanced Pack** (US$ 395 por año y por instalación, abono recurrente) · **2** (cumple) · costo de implementación **1** — Un informe de asegurados con un grupo de pertenencia —tienen pólizas de automotor— y uno de exclusión —no tienen de hogar— devuelve el conjunto directo, y se guarda para repetirlo.

   ↳ **Con EspoCRM Cloud Basic** (US$ 15 por usuario por mes, mínimo 3 usuarios, abono recurrente) · **2** (cumple) · costo de implementación **1** — El servicio en la nube incluye el módulo de informes, con las mismas condiciones.

**Twenty** · **1** (cumple con reparo) · costo de implementación **2** — El conjunto de los próximos a vencer sale directo: el listado de pólizas filtrado por vencimiento en los próximos treinta días muestra cada póliza con su titular. El otro conjunto no: el filtro del listado de asegurados solo ofrece sus propios campos, no las pólizas que tiene, así que «tiene automotor y no hogar» no se puede preguntar. Se obtiene filtrando las pólizas por cada ramo y comparando a mano las dos listas de titulares, cada vez que se quiere armar la oferta. *9 pólizas próximas a vencer.*

**Bitrix24** · **1** (cumple con reparo) · costo de implementación **2** — El conjunto de los próximos a vencer sale directo: el filtro del listado de negociaciones sobre la fecha de fin de vigencia, «próximos 30 días», trajo la póliza que vence en doce días y dejó afuera las demás, con su cliente en el listado. El otro conjunto no: el filtro del listado de contactos solo ofrece campos del propio contacto, no las pólizas que tiene, así que «tiene automotor y no hogar» no se puede preguntar. Se obtiene filtrando las pólizas por cada ramo y comparando a mano las dos listas de clientes, cada vez que se quiere armar la oferta. *61 campos filtrables del contacto, ninguno sobre sus pólizas · 1 póliza próxima a vencer.*


## A.3 Productores y actividad comercial

### A.3.1 Registro de productores y asignación de cartera
**EspoCRM** · **2** (cumple) — Se dio de alta una productora desde la administración de usuarios —con su rol, que la limita a lo propio— y se le asignaron tres asegurados de una sola vez, marcándolos en el listado y cambiando el responsable con la actualización masiva. Al ingresar con su cuenta, su listado de asegurados muestra exactamente esos tres. El responsable asignado viene de fábrica en todas las entidades, y la actualización masiva lo admite sin configurar nada.

**Twenty** · **2** (cumple) · costo de implementación **1** — El productor se suma como usuario del espacio de trabajo con el enlace de invitación, desde la pantalla de miembros: se registra con su correo y su clave, y queda con su propia cuenta. La persona no trae un responsable: se le agregó al modelo una relación con los usuarios. Se marcaron tres asegurados en el listado y, con la actualización masiva, se los dejó a cargo del productor de una sola vez. Agregar el responsable es trabajo de una sola vez.

**Bitrix24** · **2** (cumple) · costo de implementación **1** — Un usuario se da de alta como empleado desde «Empleados», con su propia cuenta y contraseña: es el productor. Sobre el listado de contactos —que en la edición gratuita hace de cartera de asegurados, a falta de una entidad propia— se seleccionan varios registros y se les cambia el responsable en bloque a ese productor, sin programar nada. El alta del usuario es un trámite de una vez por productor; asignar la cartera es una acción del listado que se repite cuando cambia la asignación. *3 asegurados asignados al productor gomez.*


### A.3.2 Bitácora de la actividad con el cliente
**EspoCRM** · **2** (cumple) — La ficha del asegurado trae un historial de actividades con acciones para registrar una llamada o una reunión sin salir de ella. Se registraron las dos, con un minuto de diferencia, y el historial las muestra ordenadas por fecha, la más reciente primero, cada una con su responsable y con quién la cargó. Viene de fábrica. Es lo que permite que cualquiera que atienda al asegurado sepa qué se habló antes. *Autor registrado: Admin.*

**Twenty** · **2** (cumple) — La ficha del asegurado tiene notas y un historial. Twenty no distingue llamadas de reuniones —las reuniones solo llegan sincronizando un calendario externo—, así que cada actividad se registró como una nota desde la pestaña de notas de la ficha. Las dos quedaron en el historial del asegurado, en orden de fecha y cada una con su autor y su hora. Viene listo; el tipo de actividad queda en el título que escribe quien la registra.

**Bitrix24** · **1** (cumple con reparo) · costo de implementación **2** — La línea de tiempo del contacto registra actividades con su autor y su momento, en orden cronológico, sin configurar nada. En la edición gratuita, sin embargo, la ficha no ofrece la llamada ni la reunión como tipos de actividad propios: la pestaña «Actividad» carga un pendiente de texto libre, y la llamada nativa exige telefonía y la reunión, una integración de videoconferencia. La llamada y la reunión se registran como pendientes que indican el tipo en el texto, de modo que el usuario debe escribirlo cada vez y no se puede filtrar el historial por tipo. *2 actividades registradas.*


### A.3.3 Agenda y carga de trabajo del productor
**EspoCRM** · **2** (cumple) — Al ingresar con la cuenta del productor, su página de inicio muestra sus próximas actividades —la visita agendada para el día siguiente figura ahí— y el calendario reúne reuniones, llamadas y tareas en vistas por día, semana y mes. Cada productor ve lo suyo sin preparar nada: el tablero y el calendario vienen de fábrica, y cada uno puede sumar a su inicio sus tareas, sus casos o sus oportunidades.

**Twenty** · **2** (cumple) — Al ingresar con la cuenta del productor, las tareas traen de fábrica una vista de las asignadas a él: ahí figuran sus pendientes con la fecha comprometida —la visita de mañana y la cotización de la semana—. Las tareas admiten además una vista de calendario por fecha de vencimiento. Las reuniones agendadas aparecen en la ficha solo si el productor conecta su calendario externo. Viene listo.

**Bitrix24** · **2** (cumple) — Con la sesión propia del productor, «Tareas» abre «Mis tareas» con lo que tiene asignado, con su fecha límite, y el Calendario del portal trae ese mismo compromiso; el CRM suma «Mis actividades» para las llamadas y reuniones de sus asegurados. Son vistas que vienen de fábrica en la edición gratuita, ya filtradas a su cuenta: no hay nada que configurar.


### A.3.4 Proyección de los movimientos comerciales
**EspoCRM** · **1** (cumple con reparo) · costo de implementación **2** — Se cargaron tres oportunidades del mes con monto y etapa, y el sistema les asignó la probabilidad de cada etapa. El tablero de canalización de ventas suma los montos por etapa para el período elegido —mes, trimestre, año, año fiscal o un rango—, de modo que muestra cuánto hay en juego en cada instancia. Lo que no calcula es la proyección: cada oportunidad tiene su monto ponderado por la probabilidad, pero ningún tablero ni listado los totaliza, y el total esperado del período —286.000 en este caso— se obtiene exportando y sumando afuera cada vez. El módulo de informes del fabricante suma cualquier campo agrupado por período, el ponderado incluido. *Por etapa: {"Prospecting":0,"Qualification":80000,"Proposal":300000,"Negotiation":150000,"Closed Won":0} · proyección ponderada no mostrada: 286000.*

> «Grid reports display summarized values, can be grouped by one or two fields, and support chart visualization.»
>
> — https://docs.espocrm.com/user-guide/reports/, consultado el 28 de septiembre de 2026

> «$395.00 1 Year License + Upgrades»
>
> — https://www.espocrm.com/extensions/advanced-pack/, consultado el 28 de septiembre de 2026

> «1.1 Subject to your continuous compliance with the Agreement and payment of the applicable license fees, EspoCRM grants you a non-exclusive, non-transferable, worldwide, limited right to use the Software on a single EspoCRM Application instance on a single server for the Licensed Period. After the license period expires, you must renew or purchase a new license to continue using the Software. You may use or modify the Software only for your own internal business purposes or for non-commercial or personal use.»
>
> — https://www.espocrm.com/extension-license-agreement/, consultado el 28 de septiembre de 2026

> «Basic $15.00 per user/month minimum 3 users 3GB file storage per user 100,000 records SSL Encryption (256 bit keys, TLS 1.3) Full feature set All extensions included External access API 2000+ integrations * 12x5 (hours/days) support Sign Up Free Trial Free Trial is provided for 30 days»
>
> — https://www.espocrm.com/cloud/, consultado el 28 de septiembre de 2026

   ↳ **Con Advanced Pack** (US$ 395 por año y por instalación, abono recurrente) · **2** (cumple) · costo de implementación **1** — Un informe agrupado por mes de cierre suma el monto ponderado y da la proyección del período.

   ↳ **Con EspoCRM Cloud Basic** (US$ 15 por usuario por mes, mínimo 3 usuarios, abono recurrente) · **2** (cumple) · costo de implementación **1** — El servicio en la nube incluye el módulo de informes.

**Twenty** · **1** (cumple con reparo) · costo de implementación **2** — Las oportunidades tienen monto y fecha de cierre, pero no probabilidad, y el modelo no admite campos calculados. Los tableros suman los montos por etapa y por fecha de cierre, de modo que muestran cuánto hay en juego en cada período, pero no el total ponderado por la probabilidad de cerrarlo. Una probabilidad se puede agregar como campo, pero el total proyectado hay que calcularlo fuera, cada vez que se lo quiere mirar.

**Bitrix24** · **1** (cumple con reparo) · costo de implementación **2** — La negociación, que hace de oportunidad comercial, admite monto y probabilidad: el campo «Probabilidad» existe pero viene oculto, y se agrega al formulario una vez con «Seleccionar campo». Se cargaron dos oportunidades (10.000 con 50 % y 20.000 con 25 %) y quedaron guardadas. Lo que no hay en la edición gratuita es el total proyectado por período: el listado suma importes sin ponderarlos por la probabilidad, y el informe de tendencia de ventas, en Analítica, no se abre y ofrece en su lugar BI Builder, que exige actualizar el plan. La proyección se calcula fuera del sistema cada vez que se la necesita. *2 oportunidades con monto y probabilidad.*


## A.4 Marketing, segmentación y reputación

### A.4.1 Segmentación reutilizable de la cartera
**EspoCRM** · **2** (cumple) · costo de implementación **1** — Desde el listado de asegurados se definió un conjunto por un criterio —los que viven en Buenos Aires— y se lo guardó con nombre desde el menú de filtros. Al volver al listado, el segmento figura entre los filtros guardados y devuelve el mismo conjunto sin rearmarlo. Guardar segmentos viene de fábrica; que la ciudad esté disponible como condición exigió habilitarla una vez entre los filtros de búsqueda. *4 asegurados en el segmento.*

**Twenty** · **2** (cumple) — Desde el listado de asegurados se definió un conjunto por un criterio —los que están a cargo de un productor— y se lo guardó con nombre como una vista, desde el propio filtro. Al volver al listado, el segmento figura en el selector de vistas; al abrirlo trajo de nuevo los mismos asegurados, y como el filtro se guarda y no la lista, un asegurado que cumpla el criterio más adelante entra solo. Viene listo. *3 asegurados en el segmento.*

**Bitrix24** · **2** (cumple) · costo de implementación **1** — Desde el listado de contactos se definió un conjunto por un criterio —los asegurados que llegaron por recomendación— y se lo guardó con nombre desde el propio filtro, sin programar. Al salir del listado y volver, el segmento figura entre los filtros guardados; al abrirlo trajo de nuevo los mismos asegurados, y como se guarda el criterio y no la lista, uno que lo cumpla más adelante entra solo. El origen no viene entre los campos visibles del filtro: agregarlo es configuración de una vez. *3 asegurados en el segmento.*


### A.4.2 Diseño de campañas sobre un segmento
**EspoCRM** · **2** (cumple) — El segmento guardado se volcó entero a una lista de destinatarios, seleccionando desde la lista con el mismo filtro guardado, y se creó una campaña de correo dirigida a esa lista. El contenido se escribió en una plantilla con marcadores que el sistema reemplaza por los datos de cada destinatario —el nombre en el asunto y en el saludo—, de modo que cada asegurado recibe un mensaje dirigido a él. Campañas, listas y plantillas vienen de fábrica. *4 destinatarios en la lista de la campaña.*

**Twenty** · **1** (cumple con reparo) · costo de implementación **2** — La edición evaluada no trae campañas: el fabricante las tiene en beta y las habilita a pedido. Se armó una con un flujo de trabajo que se lanza sobre los registros marcados y le envía a cada uno un correo desde la casilla comercial, con su nombre en el asunto. Se abrió el segmento guardado, se marcaron sus 3 asegurados, se lanzó la campaña y cada uno recibió su mensaje, personalizado —«Su póliza vence pronto, Sofía»—. Funciona, pero cada campaña nueva es un flujo nuevo que alguien tiene que armar, y no hay dónde programarla, darle de baja a un destinatario ni ver sus resultados. *3 de 3 mensajes recibidos.*

> «Beta Feature: Email campaigns are in beta. Contact us via chat to enable them for your workspace.»
>
> — https://docs.twenty.com/user-guide/email-campaigns/overview, consultado el 28 de septiembre de 2026

**Bitrix24** · **0** (no cumple) — En la edición gratuita no se puede crear una campaña: se abrió el segmento guardado, se marcaron sus 3 asegurados y se pidió «Crear boletín», y el sistema respondió que la herramienta «estará disponible una vez que actualice su plan»; desde Marketing, «Campaña de correo electrónico» dice que se desbloquea con el plan Standard o el Professional. El comparativo del fabricante lo confirma: el correo masivo no figura en la edición gratuita ni en el plan Basic. El producto sí la tiene: la campaña se dirige a un segmento existente y su contenido se personaliza con datos del CRM, como el nombre.

> «Correos electrónicos masivos Número máximo de direcciones de e-mails que se pueden usar para marketing por correo electrónico para cada plan»
>
> — https://www.bitrix24.es/prices/compare_cloud_plans.php, consultado el 29 de septiembre de 2026

> «Add personalization. Insert CRM data like name or birthdate.»
>
> — https://helpdesk.bitrix24.com/open/25753267/, consultado el 29 de septiembre de 2026

> «Select a segment. Click Select segment and choose an existing one.»
>
> — https://helpdesk.bitrix24.com/open/25753267/, consultado el 29 de septiembre de 2026

> «US$ 144»
>
> — https://www.bitrix24.es/prices/, consultado el 29 de septiembre de 2026

   ↳ **Con Bitrix24 Standard** (US$ 144 por mes, hasta 50 usuarios, abono recurrente) · **2** (cumple) · costo de implementación **1** — Con el plan Standard —el de entrada para el correo masivo, hasta 50.000 correos por mes— la campaña se arma sobre un segmento del CRM y se personaliza con variables como el nombre o la fecha de nacimiento, sin programar. Hay que dejar configurada una vez la casilla desde la que sale y el límite mensual.


### A.4.3 Medición de los resultados de la campaña
**EspoCRM** · **2** (cumple) · costo de implementación **1** — La campaña se envió a su lista y llegaron los 4 mensajes, cada uno con el nombre de su destinatario en el asunto —"Martina, su póliza de hogar vence pronto"—. El registro de la campaña anotó cada envío y, cuando uno de los asegurados abrió el mensaje, anotó también la apertura, con la fecha y el destinatario. Lo mismo hace con los clics en enlaces seguidos y las bajas. La medición viene en el producto; lo que hay que configurar una vez es el servidor de correo saliente de la compañía y activar, en esa misma configuración, el seguimiento de aperturas, que viene apagado. *4 envíos y 1 apertura registrados.*

**Twenty** · **1** (cumple con reparo) · costo de implementación **2** — De la campaña armada con un flujo de trabajo queda el registro del envío: cada lanzamiento es una corrida con el resultado de cada paso. Las respuestas llegan: el asegurado contestó y la casilla sincronizada trajo su respuesta a su ficha. Las aperturas no se registran, y nada reúne los resultados de la campaña: cuántos la recibieron, cuántos contestaron. Saberlo exige revisar las corridas y las fichas, una por una, después de cada envío. *1 corrida(s) registradas; respuesta en la ficha: sí.*

**Bitrix24** · **0** (no cumple) — En la edición gratuita no hay campañas que medir: el listado de Marketing › Campañas trae las columnas Estado, Estadística y Consentimiento pero está vacío, y crear una campaña de correo pide el plan Standard o el Professional. El fabricante documenta lo que el producto mide cuando la campaña sale: envíos, y con el seguimiento del correo activado, aperturas y clics.

> «Email tracking. Enable this option to track opens and clicks.»
>
> — https://helpdesk.bitrix24.com/open/25753267/, consultado el 29 de septiembre de 2026

> «Campaign parameters. Set a sending time limit, enable email read tracking, and configure consent to receive campaigns.»
>
> — https://helpdesk.bitrix24.com/open/24955986/, consultado el 29 de septiembre de 2026

> «Correos electrónicos masivos Número máximo de direcciones de e-mails que se pueden usar para marketing por correo electrónico para cada plan»
>
> — https://www.bitrix24.es/prices/compare_cloud_plans.php, consultado el 29 de septiembre de 2026

> «US$ 144»
>
> — https://www.bitrix24.es/prices/, consultado el 29 de septiembre de 2026

   ↳ **Con Bitrix24 Standard** (US$ 144 por mes, hasta 50 usuarios, abono recurrente) · **2** (cumple) · costo de implementación **1** — Con el plan Standard cada campaña registra su estadística en el listado de campañas; las aperturas y los clics se miden si se activa el seguimiento del correo y de los enlaces, una opción de configuración que se deja prendida una vez.


### A.4.4 Captación de interesados desde redes sociales
**EspoCRM** · **1** (cumple con reparo) · costo de implementación **2** — El producto no se conecta con ninguna red social: la administración de integraciones no ofrece ninguna y el catálogo del fabricante tampoco. Lo que sí trae es la captura de posibles clientes, un formulario web propio que carga solo a cada interesado que lo completa. Enlazado desde las publicaciones y los perfiles de la compañía, incorpora a la base a quien llega desde una red; pero cada campaña en la red tiene que llevar ese enlace, y los interesados que escriben por mensaje o comentan en la publicación se cargan a mano.

> «The Web-to-Lead feature provides the ability to create web forms for capturing information about website visitors and then save this information as new leads to the CRM instance.»
>
> — https://www.espocrm.com/features/web-to-lead/, consultado el 28 de septiembre de 2026

**Twenty** · **1** (cumple con reparo) · costo de implementación **2** — El producto no se conecta con ninguna red social: las cuentas que se pueden conectar son de correo y calendario, y el catálogo de aplicaciones no ofrece ninguna. Lo que sí trae es un disparador de flujos por webhook: se armó un flujo que recibe nombre, apellido y correo y da de alta a la persona, y un pedido con esos datos —lo que enviaría un intermediario al llegar un interesado desde un formulario de anuncios— la incorporó a la base. La conexión con cada red queda a cargo de ese intermediario, que hay que contratar y mantener aparte.

**Bitrix24** · **2** (cumple) · costo de implementación **1** — El centro de contacto del CRM ofrece conectar Facebook, Instagram, WhatsApp, Telegram y otros canales, y en la edición gratuita la conexión no encuentra ningún muro de pago: se abrió la de Facebook y el sistema llegó al paso de autorizar con la cuenta que administra la página de la compañía —esta evaluación no tiene una—, donde se detuvo la prueba. Según el fabricante, lo que llega por ahí queda en el CRM con su historial y cualquier chat puede convertirse en una negociación, es decir, en un interesado en la base. Conectar cada canal es configuración de una vez, a cargo de quien administra la página.

> «Facebook, Instagram, etc. Conecte sus cuentas en las redes sociales y mensajeros para recibir mensajes entrantes de sus clientes directamente en Bitrix24. Cualquier chat puede convertirse automáticamente en una negociación y el historial de mensajes se guardará en el CRM.»
>
> — https://www.bitrix24.es/prices/compare_cloud_plans.php, consultado el 29 de septiembre de 2026


### A.4.5 Escucha de menciones en canales públicos
**EspoCRM** · **0** (no cumple) — El producto no ofrece el seguimiento de lo que se dice de la compañía y de la competencia en redes y medios, en ninguna edición: la administración no tiene ninguna función de redes sociales y el catálogo oficial de extensiones —informes y automatización, ventas, proyectos, inteligencia artificial, telefonía, agenda de reuniones, integraciones con Outlook, Google, Zoom, Stripe y MailChimp— no incluye ninguna. La compañía tendría que resolverlo con otra herramienta.

> «Real Estate»
>
> — https://www.espocrm.com/extensions/, consultado el 28 de septiembre de 2026

**Twenty** · **0** (no cumple) — El producto no ofrece el seguimiento de lo que se dice de la compañía y de la competencia en redes y medios, en ninguna edición: la configuración no tiene ninguna función de redes sociales y el catálogo de aplicaciones del fabricante, dentro del propio producto, ofrece una sola —el seguimiento del último contacto con cada persona—. El fabricante presenta las aplicaciones como una vía para extender el producto con código propio: una escucha de redes habría que desarrollarla.

> «Extend Twenty with code — custom objects, server-side logic, UI components, and AI agents, all as TypeScript packages.»
>
> — https://docs.twenty.com/getting-started/core-concepts/apps, consultado el 28 de septiembre de 2026

**Bitrix24** · **1** (cumple con reparo) · costo de implementación **2** — El producto no trae un seguimiento de menciones en canales públicos ni de la competencia. Lo más cercano es el conector «Facebook: Comentarios» del centro de contacto, disponible en la edición gratuita, que trae los comentarios de la página propia de la compañía al CRM: cubre lo que se dice en sus propios canales, y solo ahí. El catálogo de aplicaciones tampoco ofrece una de escucha: se buscó «menciones», «social listening» y «brand monitoring» y no aparece ninguna. El fabricante promociona «monitoreo de redes desde el CRM», que en el producto es ese mismo intercambio de mensajes y comentarios propios. Para la competencia habría que resolverlo con una herramienta externa.

> «Redes sociales y messengers Vincule diferentes redes sociales y messengers, y permita que sus clientes se comuniquen mediante el canal de comunicación que más les convenga.»
>
> — https://www.bitrix24.es/prices/compare_cloud_plans.php, consultado el 29 de septiembre de 2026

> «Social media monitoring and engagement from your CRM»
>
> — https://www.bitrix24.com/articles/don-t-let-one-tweet-ruin-everything-10-social-media-crisis-hacks-you-need-to-know.php, consultado el 29 de septiembre de 2026


### A.4.6 Publicación en redes desde el sistema
**EspoCRM** · **0** (no cumple) — El producto no ofrece la publicación en redes sociales desde el propio sistema, en ninguna edición: la administración no tiene ninguna función de redes sociales y el catálogo oficial de extensiones —informes y automatización, ventas, proyectos, inteligencia artificial, telefonía, agenda de reuniones, integraciones con Outlook, Google, Zoom, Stripe y MailChimp— no incluye ninguna. La compañía tendría que resolverlo con otra herramienta.

> «Real Estate»
>
> — https://www.espocrm.com/extensions/, consultado el 28 de septiembre de 2026

**Twenty** · **0** (no cumple) — El producto no permite publicar en redes sociales desde el propio sistema, en ninguna edición: las cuentas que se pueden conectar son de correo y de calendario —IMAP, SMTP, CalDAV—, ninguna red social, y el catálogo de aplicaciones del fabricante no ofrece ninguna para eso. Publicar exigiría desarrollar una aplicación propia.

> «Extend Twenty with code — custom objects, server-side logic, UI components, and AI agents, all as TypeScript packages.»
>
> — https://docs.twenty.com/getting-started/core-concepts/apps, consultado el 28 de septiembre de 2026

**Bitrix24** · **0** (no cumple) — El sistema no publica en las redes: lo único que emite hacia Facebook e Instagram son anuncios pagos sobre publicaciones que ya existen en la red o sobre un segmento del CRM, desde «Marketing › Anuncios de Facebook», que en la edición gratuita pide actualizar al plan Standard o Professional. No hay donde componer un texto y emitirlo a la página conectada. El fabricante lo declara en su documentación de la integración con Facebook e Instagram: publicar en la página de Facebook figura entre las opciones que todavía no están disponibles. La conexión de la página que sí existe es la de comentarios y mensajes recibidos, no la de publicación.

> «Options like Post on Facebook page, Facebook page card, and Messenger chat are not available yet.»
>
> — https://helpdesk.bitrix24.com/open/24788840/, consultado el 30 de septiembre de 2026

> «Facebook Lance anuncios en Facebook dirigidos a un segmento de clientes específico. Esta es una excelente manera de optimizar sus gastos en publicidad.»
>
> — https://www.bitrix24.es/prices/compare_cloud_plans.php, consultado el 30 de septiembre de 2026


### A.4.7 Registro de la competencia y del motivo de pérdida
**EspoCRM** · **2** (cumple) · costo de implementación **1** — Al marcar una oportunidad como perdida, el sistema conserva por su cuenta la etapa en la que se perdió —negociación, en este caso—. El motivo y el competidor que la ganó no vienen de fábrica: se agregaron como dos campos de la oportunidad desde la administración, una lista de motivos y el nombre del competidor, y quedaron registrados junto con la pérdida. Con eso la compañía puede saber por qué pierde ventas y contra quién.

**Twenty** · **2** (cumple) · costo de implementación **1** — El embudo de fábrica termina en la etapa de cliente ganado: no trae una etapa de oportunidad perdida ni dónde anotar por qué se perdió. Se agregó la etapa «Perdida» a la lista de etapas y dos campos: el motivo, como lista, y el competidor que se quedó con la venta. Se marcó una oportunidad como perdida y se le registraron el motivo y el competidor desde su ficha. Agregarlos es trabajo de una sola vez.

**Bitrix24** · **2** (cumple) · costo de implementación **1** — Al cerrar una negociación como perdida el sistema pregunta solo el resultado —«Cerrado Perdido» o «Analizar la falla», las dos etapas de fábrica—: no trae dónde anotar por qué se perdió ni quién la ganó. Se agregaron dos campos propios a la negociación, el motivo, como lista, y el competidor, como texto; se marcó una oportunidad como perdida y se le registraron el motivo y el competidor desde su ficha, y quedaron guardados. Agregar los campos es configuración de una sola vez.


## A.5 Atención al asegurado y reclamos

### A.5.1 Reclamo como caso con identidad propia
**EspoCRM** · **2** (cumple) — El producto trae el caso de atención como entidad propia, con su entrada de menú, su listado y su ficha. Se registró un reclamo asociado a un asegurado y el sistema le asignó el número 93942 al guardarlo; la ficha muestra al asegurado y el reclamo figura en el listado de casos. No hubo que crear ni configurar nada: viene listo con la instalación. El número propio es lo que permite que la compañía y el asegurado hablen del mismo reclamo sin ambigüedad. *Reclamo número 93942.*

**Twenty** · **1** (cumple con reparo) · costo de implementación **2** — Twenty no trae un objeto de reclamos o casos: se definió como objeto propio, con estado, plazo de resolución, asegurado y responsable. Así tiene listado y ficha propios, y se crea desde el campo de reclamos de la ficha del asegurado, ya ligado a él. Pero no tiene número: ningún tipo de campo se numera solo, y el identificador interno no sirve para dictárselo a un asegurado. El número hay que asignarlo a mano en cada alta, o desarrollarlo.

**Bitrix24** · **1** (cumple con reparo) · costo de implementación **2** — La edición gratuita no tiene procesos inteligentes para crear una entidad Reclamo, y la alternativa que sugiere el modelo —una tarea vinculada al contacto— no está disponible: al pulsar «Tarea» en la ficha del asegurado el sistema informa que «Tareas en CRM» requiere al menos el plan Basic. El reclamo se lleva entonces como una negociación con el asegurado como cliente: recibe un número propio, abre su propia ficha y queda asociada al contacto (reclamo n.º 226). No tiene listado propio: comparte el de las demás negociaciones —pólizas y oportunidades—, y hay que distinguirlo por el nombre o con un filtro en cada uso. *reclamo n.º 226.*


### A.5.2 Estado y seguimiento del reclamo
**EspoCRM** · **2** (cumple) — El reclamo se pasó de nuevo a asignado, a pendiente y a cerrado, y la ficha conserva la secuencia completa en su historia: cada cambio de estado queda registrado con el valor anterior, el nuevo, quién lo hizo y cuándo. El estado del caso viene auditado de fábrica, sin configurar nada. Es lo que permite reconstruir cuánto estuvo un reclamo en cada instancia cuando el asegurado pregunta o cuando hay que responder ante un organismo de control. *Secuencia conservada: Assigned → Pending → Closed.*

**Twenty** · **2** (cumple) · costo de implementación **1** — El estado del reclamo es un campo de lista del objeto propio, con los estados que define la compañía. Se lo cambió tres veces desde la ficha y el historial del reclamo conserva la secuencia, con quién hizo cada cambio y cuándo: En curso → Resuelto → Cerrado. Los cambios que la misma persona hace sobre el mismo reclamo dentro de los diez minutos se funden en una sola entrada, que muestra el estado de partida y el último: un estado intermedio que dura menos que eso no queda registrado. Con el ritmo de un reclamo, que cambia de estado en días, cada paso queda por separado. Definir el estado es trabajo de una sola vez. *3 cambios de estado en el historial.*

**Bitrix24** · **1** (cumple con reparo) · costo de implementación **2** — Cada cambio de etapa de la negociación —que hace de reclamo— queda anotado en la línea de tiempo de su ficha como «Etapa cambiada», con la etapa anterior y la nueva, la hora y el usuario. Se pasó el reclamo por tres etapas y el sistema conservó las cuatro posiciones en orden, sin configurar nada. El reparo es que los estados no son propios del reclamo: son las etapas del embudo de ventas (En desarrollo, Crear documentos, Factura…), compartidas con las pólizas y las oportunidades, y la pestaña «Historial» de la ficha, que concentra el seguimiento, no se abre en la edición gratuita. *secuencia: NEW > PREPARATION > PREPAYMENT_INVOICE > EXECUTING.*


### A.5.3 Responsable asignado a cada reclamo
**EspoCRM** · **2** (cumple) — El caso trae un responsable asignado de fábrica. Se asignó el reclamo a un productor desde la ficha y, al ingresar con la cuenta de ese productor, el reclamo figura en su listado de casos. Cada reclamo tiene un dueño visible, que es lo que evita que un caso quede sin atender porque nadie sabía que era suyo.

**Twenty** · **2** (cumple) · costo de implementación **1** — El reclamo tiene un responsable, que es una relación con los usuarios del objeto propio. Se lo asignó al productor desde la ficha; al ingresar con su cuenta y filtrar los reclamos por los que tiene a su cargo, figura entre sus pendientes. Ese filtro se guarda como una vista para no rehacerlo. Definir el responsable es trabajo de una sola vez.

**Bitrix24** · **2** (cumple) · costo de implementación **1** — El responsable de un reclamo —la negociación del asegurado— se cambia en el listado, marcando el registro y eligiendo «Cambiar a la persona responsable». Con la sesión del productor, el reclamo asignado aparece en su listado de negociaciones, sin buscarlo. Los reclamos comparten ese listado con las pólizas y las oportunidades, y el usuario los distingue por el nombre: es una convención que se fija una vez.


### A.5.4 Base de conocimiento para la atención
**EspoCRM** · **2** (cumple) — El producto trae una base de conocimiento propia. Se escribió un artículo con una condición de cobertura —qué cubre la póliza de automotor ante granizo y qué excluye—, se lo publicó y se lo recuperó buscando "granizo" desde su listado. Viene lista: no hubo que crear ni configurar nada. Es lo que permite que quien atiende responda igual que su compañero de al lado, sin depender de la memoria.

**Twenty** · **2** (cumple) · costo de implementación **1** — Twenty no trae una base de conocimiento: el artículo se definió como un objeto propio, con su título y la condición de cobertura. Se cargó uno sobre el granizo en automotor y la búsqueda general lo encontró por su título. También lo encontró por una palabra del texto de la condición. Definir el objeto es trabajo de una sola vez.

**Bitrix24** · **2** (cumple) · costo de implementación **1** — Se creó el artículo desde «Empleados › Base de conocimientos»: una página en blanco con un bloque de texto, cuyo texto de ejemplo se reemplazó por la condición de cobertura de granizo, y se la buscó por «granizo» en la base publicada, que la devolvió. La base se arma una vez con una plantilla (la edición gratuita admite una sola).


### A.5.5 Tareas asignables con responsable y vencimiento
**EspoCRM** · **2** (cumple) — Se creó una tarea con vencimiento en tres días y se la asignó a un productor. Al ingresar con la cuenta de ese productor, la tarea figura en su listado con su fecha. Responsable y vencimiento son campos que la tarea trae de fábrica, sin configurar nada, y es lo que permite repartir el trabajo y saber qué se atrasa.

**Twenty** · **2** (cumple) — Las tareas vienen de fábrica con responsable y vencimiento. Se creó una desde el listado, se la asignó al productor y se le puso fecha y hora de vencimiento desde su ficha. Al ingresar con la cuenta del productor, figura en la vista de las tareas asignadas a él, con su vencimiento. Viene listo.

**Bitrix24** · **2** (cumple) — «Tareas › Crear» abre un formulario con título, responsable y fecha límite: se eligió al productor en el selector de responsable y el formulario ya propone un vencimiento. Con la sesión del productor, la tarea figura en «Mis tareas» con su fecha límite. Viene de fábrica en la edición gratuita, sin configurar nada.


### A.5.6 Aviso al usuario al que se le asigna una tarea
**EspoCRM** · **2** (cumple) — Al asignarle la tarea y el reclamo, el productor recibió el aviso en el propio sistema: al ingresar, el indicador de notificaciones lo muestra sin que tenga que abrir ningún listado, y cada aviso lleva al registro que le asignaron. Viene activado de fábrica. Es lo que asegura que el responsable se entere en el momento, y no cuando se le ocurre revisar.

**Twenty** · **2** (cumple) · costo de implementación **1** — Twenty no avisa por su cuenta: la interfaz no tiene un centro de notificaciones y asignar una tarea no le manda nada al responsable. El aviso se armó con un flujo de trabajo, sin escribir código: cuando a una tarea se le pone responsable, lo busca y le envía un correo desde la casilla de la compañía. Se creó una tarea desde el listado, se la asignó al productor en su ficha, y le llegó el correo «Tarea nueva: Llamar al perito por el siniestro» sin que tuviera que abrir el listado. Armar el flujo es trabajo de una sola vez.

**Bitrix24** · **2** (cumple) — Al asignarle una tarea, el productor la recibe como notificación en la campana de la barra superior del portal, con el título de la tarea y quién se la asignó, sin que tenga que abrir el listado de tareas. Viene activado de fábrica en la edición gratuita.


## A.6 Ficha única del asegurado

### A.6.1 Vinculación de la póliza con su titular
**EspoCRM** · **2** (cumple) · costo de implementación **1** — El Administrador de Relaciones liga la póliza con el contacto que es su titular, sin programar: se define una vez que cada póliza tiene un titular y que un asegurado puede tener muchas pólizas. Para que la ficha del asegurado muestre sus pólizas hay que agregar ese panel entre los inferiores, en el Gestor de Diseños. A partir de ahí, al cargar una póliza se elige el titular buscándolo por nombre; la póliza lo muestra en su ficha, y la del asegurado lista todas sus pólizas. Las dos puntas del vínculo quedan a la vista sin buscar en otro menú.

**Twenty** · **2** (cumple) · costo de implementación **1** — La póliza se liga con la persona que es su titular mediante un campo de relación, que se define una vez desde el modelo de datos, sin programar: cada póliza tiene un titular y una persona puede tener muchas pólizas. Al definirlo, la ficha de la persona suma sola el campo con sus pólizas. Se cargó una póliza, se eligió al titular buscándolo por nombre, y las dos puntas del vínculo quedaron a la vista: la póliza muestra al titular y la ficha del asegurado lista la póliza junto con las demás suyas.

**Bitrix24** · **2** (cumple) — La negociación —que hace de póliza en la edición gratuita— trae de fábrica el campo «Cliente», donde se elige el contacto por su nombre. Una vez guardada, la póliza figura en la pestaña «Negociaciones» de la ficha del contacto y su propia ficha muestra al titular, sin configurar nada: la relación se ve desde los dos lados.


### A.6.2 Vista única del asegurado
**EspoCRM** · **2** (cumple) · costo de implementación **1** — La ficha del asegurado reúne en paneles todo lo suyo: sus pólizas, sus reclamos, sus actividades pendientes y el historial de llamadas, reuniones y correos, además de la línea de tiempo de cambios. Desde ahí se llega a cada registro sin pasar por otro menú. Los reclamos y la actividad vienen de fábrica; el panel de pólizas aparece al definir la relación con el titular, que es configuración de una sola vez. *10 paneles en la ficha del asegurado.*

**Twenty** · **2** (cumple) · costo de implementación **1** — La ficha de la persona reúne lo suyo: a la izquierda, sus campos, entre ellos sus pólizas y sus reclamos, que se abren desde ahí; a la derecha, pestañas con la línea de tiempo de cambios, las tareas, las notas, los archivos, los correos y el calendario. Desde la ficha de un asegurado se llegó a su póliza, a su reclamo y a la tarea hecha con él sin pasar por otro menú. La actividad viene de fábrica; las pólizas y los reclamos aparecen al definir sus relaciones con la persona, que es configuración de una sola vez. *Pestañas de la ficha: .*

**Bitrix24** · **2** (cumple) · costo de implementación **1** — La ficha del contacto reúne en una sola pantalla lo del asegurado: la línea de tiempo con sus actividades registradas y, en la pestaña «Negociaciones», tanto la póliza como el reclamo, que en la edición gratuita son negociaciones con el contacto como cliente. No hace falta salir a otro menú ni buscarlo de nuevo. Como póliza y reclamo comparten esa pestaña, el usuario los distingue por el nombre que se les da al cargarlos: es una convención que hay que fijar una vez.


### A.6.3 Campos propios del rubro en la ficha
**EspoCRM** · **2** (cumple) · costo de implementación **1** — Se agregó a la ficha del asegurado un campo que el producto no trae —la valoración que dejó sobre la atención recibida, con cuatro valores— desde el Administrador de Campos. Quedó en el formulario, se cargó en un asegurado y se lo pudo usar como condición de búsqueda para listar a los que valoraron la atención como muy buena. Es configuración de una sola vez: se define el campo y se lo ubica en el formulario y entre los filtros, sin programar.

**Twenty** · **2** (cumple) · costo de implementación **1** — Se agregó a la persona un campo que el producto no trae —la valoración que dejó sobre la atención recibida, con cuatro valores— desde el modelo de datos. Apareció solo en la ficha, sin ubicarlo en ningún diseño; se cargó en un asegurado y se lo pudo usar enseguida como condición de filtro del listado para ver a los que valoraron la atención como muy buena. Es configuración de una sola vez, sin programar.

**Bitrix24** · **2** (cumple) · costo de implementación **1** — Desde el mismo formulario del contacto, «Crear campo» agrega un campo de tipo lista —aquí, la valoración de la atención, con sus cuatro opciones— sin programar. El campo queda en el formulario de alta: se eligió el valor «Buena» al cargar un asegurado y quedó guardado. En el listado, el filtro de búsqueda ofrece el campo nuevo para agregarlo como condición. Definir el campo es una configuración de una sola vez.


### A.6.4 Unicidad de la ficha del asegurado
**EspoCRM** · **2** (cumple) · costo de implementación **2** — De fábrica el producto busca duplicados por nombre y correo, pero no por documento: se cargó dos veces el mismo documento con el apellido escrito distinto y el sistema aceptó las dos fichas sin advertir nada. La pantalla de fórmula de cada entidad trae un guion que se ejecuta antes de guardar, pensado para validaciones y comprobación de duplicados; con tres líneas que buscan el documento, la segunda carga mostró el aviso de posible duplicado y remitió a la ficha existente. La necesidad queda resuelta desde el sistema, pero exige escribir ese guion: es desarrollo, breve, que alguien tiene que saber leer y mantener. *Sin la comprobación: 2 fichas con el mismo documento; con ella: 1.*

**Twenty** · **2** (cumple) · costo de implementación **1** — De fábrica la persona se compara por nombre, correo y perfil de LinkedIn para sugerir duplicados, pero no trae documento. Se agregó el documento como campo de texto y, al crearlo, se lo marcó como único con un interruptor de la misma pantalla. Se cargó un asegurado con su documento y, al cargar otro con el mismo documento y el apellido escrito distinto, el sistema rechazó el valor y avisó: «This record already exists. Please check your data and try again.». La necesidad queda resuelta con configuración de una sola vez, sin programar. *1 ficha con el documento repetido.*

**Bitrix24** · **1** (cumple con reparo) · costo de implementación **2** — En la edición gratuita, cargar dos veces al mismo asegurado con el mismo correo no dispara ninguna advertencia: el segundo contacto se guarda igual y quedan dos fichas. La herramienta «Buscar y fusionar duplicados» del listado de contactos no se abre y responde que está disponible en los planes de nivel superior. El fabricante documenta que el producto cuenta con ese control de duplicados para prospectos, contactos y compañías, que detecta las fichas repetidas y las fusiona, pero no publica en qué plan se incluye. El asistente de importación de planillas tiene un paso «Control de duplicados» —por nombre, correo o teléfono—, pero su acción ante un duplicado parte de «Allow» (importar todo sin revisar) y viene marcada con un candado; no se logró cambiarla en la edición gratuita. Detecta la duplicación después de cargada, no la advierte al cargar, y hay que ejecutar el escaneo cada vez.

> «Automatic duplicate merging is available for leads, contacts, and companies. Check if this option is available on your Bitrix24 plan.»
>
> — https://helpdesk.bitrix24.com/open/18346126/, consultado el 30 de septiembre de 2026


## A.7 Intercambio de datos y correo

### A.7.1 Importación de contactos desde planilla de cálculo
**EspoCRM** · **1** (cumple con reparo) · costo de implementación **2** — El asistente de importación admite archivos de texto separados por comas y la propia pantalla advierte que "debe ser codificado en UTF-8". Guardada así, la planilla ingresó completa: los cinco asegurados, cada columna en su campo, con tildes y eñes intactas. Guardada con la codificación predeterminada de las planillas en Windows, ingresaron todas las filas pero solo 0 de 5 conservaron nombres y domicilios sin alterar: las letras acentuadas llegaron corrompidas, sin que el sistema lo advirtiera. En los dos casos el asistente no reconoció los encabezados en español: dejó las 5 columnas sin asignar y hubo que indicar a mano a qué campo va cada una. La necesidad queda resuelta con un procedimiento que se repite en cada importación: guardar la planilla en el formato que pide el sistema y asignar sus columnas. *UTF-8: 5/5 intactos · codificación de Windows: 0/5 intactos.*

> «Select what type of records you need to import (Entity Type field). Select a CSV file. A file should be formatted in UTF-8. Select What to do?. Available options: Create Only, Create & Update, Update Only.»
>
> — https://docs.espocrm.com/administration/import/, consultado el 28 de septiembre de 2026

**Twenty** · **1** (cumple con reparo) · costo de implementación **2** — El listado de personas tiene un asistente de importación que acepta planillas de cálculo y archivos de texto separados por comas. Guardada en UTF-8, la planilla ingresó completa: los cinco asegurados, cada columna en su campo, con tildes y eñes intactas. Guardada con la codificación predeterminada de las planillas en Windows, el asistente leyó mal el archivo: las letras acentuadas llegaron corrompidas y en varias filas las columnas quedaron corridas o con la fila entera en el nombre; marcó algunas como erróneas y, al confirmar, las descartó. De las 5 filas ingresaron 4, 0 con nombres y domicilios intactos, y el sistema no advirtió la corrupción de las que aceptó. El asistente no reconoció los encabezados en español: dejó las 5 columnas sin asignar y hubo que indicar a mano a qué campo va cada una, abriendo las partes del nombre, del correo, del teléfono y del domicilio. La necesidad queda resuelta con un procedimiento que se repite en cada importación: guardar la planilla con la codificación correcta y asignar sus columnas. *UTF-8: 5/5 intactos · codificación de Windows: 4/5 ingresadas, 0/5 intactas, 3 con la fila entera en el nombre · 5 columnas sin reconocer.*

**Bitrix24** · **2** (cumple) — El listado de contactos trae un asistente de importación de planillas CSV, sin configurar nada: se sube el archivo con el botón «Subir archivo», se elige la codificación y el delimitador, se relacionan las columnas con los campos y se importa. El asistente reconoció solo nombre y apellido; la columna del correo, con otro rótulo, se relacionó a mano con «E-mail del trabajo» en el paso de mapeo. Se cargó una planilla de diez asegurados con tildes y eñes en los apellidos y ingresaron los diez con sus correos y la acentuación intacta. *10 de 10 contactos importados.*


### A.7.2 Importación de contactos desde las agendas de correo
**EspoCRM** · **1** (cumple con reparo) · costo de implementación **2** — El sistema no se conecta con la agenda de ningún correo para traer contactos. Las extensiones del fabricante para Google y Outlook sincronizan calendario y correo, y para los contactos hacen el camino inverso: envían los del sistema a la agenda, no los incorporan. La vía que queda es exportar la agenda del correo web o del gestor de escritorio a un archivo y pasarlo por el asistente de importación, que es un procedimiento que se repite cada vez que la agenda cambia.

> «The ability to push your EspoCRM contacts and leads to Google Contacts;»
>
> — https://docs.espocrm.com/extensions/google-integration/contacts/, consultado el 28 de septiembre de 2026

> «Provides the ability to import records from CSV files.»
>
> — https://docs.espocrm.com/administration/import/, consultado el 28 de septiembre de 2026

**Twenty** · **1** (cumple con reparo) · costo de implementación **2** — El sistema se conecta con las cuentas de Google y de Microsoft —en la instalación propia, después de registrar sus credenciales; la evaluada ofrece solo IMAP— y con cualquier casilla por IMAP, pero para sincronizar correo y calendario: no trae la agenda de contactos de ninguna. Lo que ofrece es crear personas a partir del correo sincronizado —cada dirección externa con la que se intercambian mensajes o reuniones pasa a ser un contacto—, que alcanza a quien ya escribió, no a la agenda entera. Para incorporar la agenda del correo web o del gestor de escritorio hay que exportarla a un archivo y pasarlo por el asistente de importación, un procedimiento que se repite cada vez que la agenda cambia.

> «Connect an additional Google or Microsoft account, or any other mail provider supporting IMAP/SMTP protocols»
>
> — https://docs.twenty.com/user-guide/calendar-emails/how-tos/connect-several-mailboxes-per-user, consultado el 28 de septiembre de 2026

> «For messages sent and received: Create contacts for all external email interactions»
>
> — https://docs.twenty.com/user-guide/calendar-emails/overview, consultado el 28 de septiembre de 2026

> «Twenty supports three file formats for import:»
>
> — https://docs.twenty.com/user-guide/data-migration/capabilities/file-formats, consultado el 28 de septiembre de 2026

**Bitrix24** · **1** (cumple con reparo) · costo de implementación **2** — El listado de contactos ofrece una importación para cada agenda de correo —Gmail, Outlook y Yahoo!—, pero todas parten de un archivo CSV que el usuario exporta antes desde su correo: no hay una conexión que lea la agenda directamente. Incorporar los contactos de la compañía exige, en cada carga, exportar el archivo desde el correo web o el gestor de escritorio e importarlo después con el asistente.


### A.7.3 Sincronización del correo de varios usuarios
**EspoCRM** · **2** (cumple) · costo de implementación **1** — Cada usuario puede tener su propia casilla sincronizada: la administración tiene una sección de cuentas de correo personales, y también de cuentas grupales para casillas compartidas. Se configuraron dos casillas personales, de dos usuarios distintos, contra el mismo servidor de correo, y el sistema trajo el mensaje de cada una a la bandeja de su dueño y solo a la suya. Configurar cada casilla es trabajo de una sola vez.

**Twenty** · **2** (cumple) · costo de implementación **1** — Cada usuario conecta su propia casilla desde su configuración personal, por IMAP y SMTP o con una cuenta de Google o Microsoft. El administrador tiene conectada la casilla comercial y el productor, desde su cuenta, conectó la suya contra el mismo servidor de correo: cada uno ve solo la propia en su lista de cuentas, y el mensaje que un asegurado le mandó al productor apareció en la ficha del asegurado. Configurar cada casilla es trabajo de una sola vez, y lo hace cada usuario.

**Bitrix24** · **0** (no cumple) — En la edición gratuita no se puede conectar ninguna casilla, ni la del administrador ni la de un productor. Webmail ofrece Gmail, Outlook, iCloud, Office365, Exchange, Yahoo!, Aol y «Buzón personalizado» (IMAP+SMTP), pero al elegir cualquiera de ellos, con el administrador y con la sesión del productor, el sistema no abre el formulario de conexión y responde «No disponible en su plan». «Conectar varios buzones» también pide otro plan: «para conectar y gestionar múltiples buzones de correo corporativos, actualiza a cualquier plan a partir del Professional». La comparación de planes del fabricante marca Webmail y la integración con servicios de correo de terceros como no incluidos en la edición gratuita, y la ayuda confirma que Webmail solo está en planes comerciales. Sin una casilla conectada no hay sincronización de ningún usuario. *IMAP propio: muro para el administrador y para el productor · otros proveedores con muro: 7 de 7.*

> «Número de bandejas de entrada de correo electrónico por usuario»
>
> — https://www.bitrix24.es/prices/compare_cloud_plans.php, consultado el 30 de septiembre de 2026

> «Integración con servicios de correo electrónico de terceros»
>
> — https://www.bitrix24.es/prices/compare_cloud_plans.php, consultado el 30 de septiembre de 2026

> «Webmail está disponible solo en algunos planes comerciales. Ver la página de planes y precios.»
>
> — https://helpdesk.bitrix24.es/open/22084704/, consultado el 30 de septiembre de 2026

> «Basic Ideal para emprendedores individuales y equipos pequeños que están empezando US$ 69 US$ 69 US$ 49 / compañía / mes / facturado mensualmente / compañía / mes / facturación anual Un pago de US$ 588 / año Ahorra US$ 240 al año incluye 5 usuarios Comprar Comprar Todo lo incluido en Free, más: Almacenamiento de 24 GB IA para el trabajo diario en Bitrix24 Embudos de ventas Negociaciones recurrentes Pagos en línea Integración de correo electrónico Integración de WhatsApp Integración de telefonía»
>
> — https://www.bitrix24.es/prices/, consultado el 30 de septiembre de 2026

   ↳ **Con Bitrix24 Basic** (US$ 69 por mes, hasta 5 usuarios, abono recurrente) · **2** (cumple) · costo de implementación **1** — Según la comparación de planes y la ayuda del fabricante, desde el plan Basic Webmail admite una casilla por usuario —cada usuario conecta la suya, una sola vez— y los planes superiores suben ese número (5 en Standard, 10 en Professional y Enterprise) sin cambiar lo que cada usuario puede hacer. No se contrató el plan, así que la conexión no se ejercitó.


### A.7.4 Vinculación automática del correo a la ficha
**EspoCRM** · **2** (cumple) · costo de implementación **1** — Con la casilla de atención de la compañía sincronizada, un asegurado escribió desde su propia dirección y el mensaje apareció en el historial de su ficha sin que nadie lo moviera: el sistema reconoció la dirección del remitente y lo vinculó con el asegurado que la tiene cargada. Configurar la casilla compartida es trabajo de una sola vez; la vinculación ocurre sola en cada mensaje.

**Twenty** · **2** (cumple) · costo de implementación **1** — Con la casilla comercial de la compañía conectada, un asegurado escribió desde su propia dirección y el mensaje apareció en la pestaña de correos de su ficha sin que nadie lo moviera: el sistema reconoció la dirección del remitente y lo vinculó con la persona que la tiene cargada. Conectar la casilla es trabajo de una sola vez; la vinculación ocurre sola en cada mensaje.

**Bitrix24** · **0** (no cumple) — En la edición gratuita el correo de un asegurado no llega a su ficha porque no se puede conectar la casilla de la compañía: «Buzón personalizado» responde «No disponible en su plan» y no abre el formulario. Con el asegurado cargado —ACT-Lucia Correo, lucia.correo@example.com— se mandó un mensaje desde esa dirección a la casilla de atención, que lo recibió, y después de esperar dos minutos la ficha no registra ninguna actividad de correo. La ayuda del fabricante describe que, con la opción «Integración de CRM» activada en el buzón, los correos entrantes aparecen en la ficha correspondiente; esa opción forma parte de la conexión del buzón, que la edición gratuita no permite. *correo recibido en la casilla de atención: sí · en la ficha tras 2 min: no.*

> «Si habilitas la opción Integración de CRM en la configuración de tu buzón, los correos electrónicos entrantes aparecerán en la ficha del elemento de CRM correspondiente.»
>
> — https://helpdesk.bitrix24.es/open/18295168/, consultado el 30 de septiembre de 2026

> «Integración con servicios de correo electrónico de terceros»
>
> — https://www.bitrix24.es/prices/compare_cloud_plans.php, consultado el 30 de septiembre de 2026

> «Basic Ideal para emprendedores individuales y equipos pequeños que están empezando US$ 69 US$ 69 US$ 49 / compañía / mes / facturado mensualmente / compañía / mes / facturación anual Un pago de US$ 588 / año Ahorra US$ 240 al año incluye 5 usuarios Comprar Comprar Todo lo incluido en Free, más: Almacenamiento de 24 GB IA para el trabajo diario en Bitrix24 Embudos de ventas Negociaciones recurrentes Pagos en línea Integración de correo electrónico Integración de WhatsApp Integración de telefonía»
>
> — https://www.bitrix24.es/prices/, consultado el 30 de septiembre de 2026

   ↳ **Con Bitrix24 Basic** (US$ 69 por mes, hasta 5 usuarios, abono recurrente) · **2** (cumple) · costo de implementación **1** — Con una casilla conectada desde el plan Basic, el fabricante documenta que activar «Integración de CRM» en la configuración del buzón hace que cada correo entrante quede como actividad en la ficha del CRM correspondiente, sin intervención. Activar la opción es configuración de una sola vez por casilla. No se contrató el plan, así que la vinculación no se ejercitó.


### A.7.5 Formatos de intercambio aceptados
**EspoCRM** · **1** (cumple con reparo) · costo de implementación **2** — Los datos salen en XLSX · Spreadsheet y CSV —los formatos de planilla que la compañía usa— y por la interfaz de programación en JSON, que es el formato de intercambio entre sistemas. Pero solo entran por archivo de texto separado por comas: el asistente de importación no acepta planillas de cálculo ni agendas en su formato propio. Cada vez que la compañía quiera cargar una planilla, tiene que guardarla antes como archivo de texto, con la codificación correcta. *Entrada: .csv · salida: XLSX · Spreadsheet, CSV · interfaz de programación: JSON.*

> «Most of API functions return JSON. POST and PUT requests usually need some data passed in the payload in JSON format. Whenever you send a JSON payload, add the header: Content-Type: application/json.»
>
> — https://docs.espocrm.com/development/api/, consultado el 28 de septiembre de 2026

**Twenty** · **2** (cumple) — Los datos entran por el asistente de importación de cada listado, que acepta .xls, .xlsx, .csv: la planilla de cálculo se sube tal cual, sin pasarla antes a texto. Salen exportando la vista del listado a un archivo CSV, que la planilla abre directamente, y por las interfaces de programación REST y GraphQL en JSON, que es el formato de intercambio entre sistemas. Los formatos que la compañía usa están cubiertos de fábrica. *Entrada: .xls, .xlsx, .csv · salida: .csv · interfaz de programación: JSON.*

> «REST and GraphQL APIs generated from your workspace schema.»
>
> — https://docs.twenty.com/developers/extend/api, consultado el 28 de septiembre de 2026

**Bitrix24** · **1** (cumple con reparo) · costo de implementación **2** — En la edición gratuita los datos entran por vCard y por CSV —con asistentes para las agendas de Gmail, Outlook y Yahoo! y una migración desde otro CRM— pero no salen: «Exportar a CSV» no se abre y el sistema responde que hay que actualizar a un plan superior. La comparación de planes del fabricante publica la opción de exportar contactos a CSV, Excel y Outlook en los planes de pago, desde el Basic. Sin ella la compañía solo puede compartir datos con sus otros sistemas en un sentido.

> «Opción para exportar contactos a CSV, Excel y Outlook»
>
> — https://www.bitrix24.es/prices/compare_cloud_plans.php, consultado el 30 de septiembre de 2026

> «Basic Ideal para emprendedores individuales y equipos pequeños que están empezando US$ 69 US$ 69 US$ 49 / compañía / mes / facturado mensualmente / compañía / mes / facturación anual Un pago de US$ 588 / año Ahorra US$ 240 al año incluye 5 usuarios Comprar Comprar Todo lo incluido en Free, más: Almacenamiento de 24 GB IA para el trabajo diario en Bitrix24 Embudos de ventas Negociaciones recurrentes Pagos en línea Integración de correo electrónico Integración de WhatsApp Integración de telefonía»
>
> — https://www.bitrix24.es/prices/, consultado el 30 de septiembre de 2026

   ↳ **Con Bitrix24 Basic** (US$ 69 por mes, hasta 5 usuarios, abono recurrente) · **2** (cumple) — Con el plan Basic se habilita la exportación de contactos a CSV, Excel y Outlook, que sumada a la importación por vCard y CSV cubre la entrada y la salida en los formatos que usan los demás sistemas.


### A.7.6 Exportación de la cartera sin pérdida de datos
**EspoCRM** · **2** (cumple) — Se exportaron desde el listado los asegurados importados y se comparó el archivo con la planilla original: salieron las 5 filas, cada una con nombre, apellido, correo y ciudad, y con las tildes y eñes intactas. La exportación viene de fábrica en todos los listados y toma los registros seleccionados o el resultado de un filtro. *5 de 5 filas idénticas al original.*

**Twenty** · **2** (cumple) — Se exportó la vista del listado de personas y se comparó el archivo con la planilla original: salieron las 5 filas importadas, cada una con nombre, apellido, correo y ciudad, y con las tildes y eñes intactas. El archivo trae todas las columnas de la vista, con los campos compuestos separados en sus partes, y la marca de codificación que la planilla necesita para abrirlo sin alterar los acentos. La exportación viene de fábrica en todos los listados. *5 de 5 filas idénticas al original.*

**Bitrix24** · **0** (no cumple) — En la edición gratuita no se puede exportar la cartera: «Exportar a CSV» no genera ningún archivo y el sistema responde que la función requiere actualizar a un plan superior. La comparación de planes del fabricante confirma que la opción de exportar contactos a CSV, Excel y Outlook no forma parte de la edición gratuita. Sin archivo no hay nada que comparar con la planilla original.

> «Opción para exportar contactos a CSV, Excel y Outlook»
>
> — https://www.bitrix24.es/prices/compare_cloud_plans.php, consultado el 30 de septiembre de 2026

> «Basic Ideal para emprendedores individuales y equipos pequeños que están empezando US$ 69 US$ 69 US$ 49 / compañía / mes / facturado mensualmente / compañía / mes / facturación anual Un pago de US$ 588 / año Ahorra US$ 240 al año incluye 5 usuarios Comprar Comprar Todo lo incluido en Free, más: Almacenamiento de 24 GB IA para el trabajo diario en Bitrix24 Embudos de ventas Negociaciones recurrentes Pagos en línea Integración de correo electrónico Integración de WhatsApp Integración de telefonía»
>
> — https://www.bitrix24.es/prices/, consultado el 30 de septiembre de 2026

   ↳ **Con Bitrix24 Basic** (US$ 69 por mes, hasta 5 usuarios, abono recurrente) · **2** (cumple) — El plan Basic incluye la opción de exportar contactos a CSV, Excel y Outlook, de modo que la cartera se puede sacar del sistema. No se contrató el plan, así que no se comparó el contenido del archivo con la planilla original.


## A.8 Parametrización del modelo de negocio

### A.8.1 Creación de entidades sin programar
**EspoCRM** · **2** (cumple) · costo de implementación **1** — El Administrador de Entidades crea una entidad desde un formulario de la administración: se creó el Endoso —la modificación de una póliza vigente— indicando el nombre, las etiquetas en singular y plural y el tipo, entre 5 que ofrece (Base, Base Plus, Evento, Persona, Empresa). No hizo falta escribir código, tocar archivos del servidor ni reiniciar nada: la entidad quedó disponible en el acto y admitió su primer registro. Es trabajo de configuración que se hace una vez, y es lo que permite que el modelo de datos siga al negocio asegurador en lugar de obligar al negocio a acomodarse a un modelo genérico. *Entidad creada y operativa en 20 segundos.*

**Twenty** · **2** (cumple) · costo de implementación **1** — Desde Configuración › Modelo de datos se creó una entidad que el producto no trae —la inspección del riesgo antes de emitir— con su nombre en singular y plural y una descripción, y se le agregó un campo de fecha. Apareció en el menú con su listado y su ficha, y admitió registros enseguida. No hizo falta escribir código en ningún paso: es configuración. *Entidad creada, con un campo y un registro cargado, en 120 segundos.*

**Bitrix24** · **0** (no cumple) — Las entidades nuevas de Bitrix24 son los procesos inteligentes: se crean desde la barra del CRM, con su nombre, sus etapas y sus campos, sin escribir código. En la edición gratuita el formulario se completa, pero al guardar el sistema no crea la entidad y avisa que los procesos inteligentes requieren el plan Professional o el Enterprise; la tabla comparativa del fabricante los lista entre las funciones que ese plan agrega. Con el plan Professional la entidad se crea igual que se hace con cualquier otra configuración del sistema, sin programar. Sin él, lo más cercano es forzar el concepto dentro de una negociación con campos propios, que no es una entidad nueva.

> «Cree sus propios procesos inteligentes y personalícelos según las necesidades de su empresa.»
>
> — https://www.bitrix24.es/prices/compare_cloud_plans.php, consultado el 29 de septiembre de 2026

> «SPA (smart process automation)»
>
> — https://www.bitrix24.com/promo/professional/, consultado el 29 de septiembre de 2026

> «Professional Ideal para empresas en crecimiento que utilizan automatización avanzada US$ 289 US$ 289US$ 199 / compañía / mes / facturado mensualmente / compañía / mes / facturación anualUn pago de US$ 2,388 / año Ahorra US$ 1,080 al año incluye 100 usuarios ≈ US$ 2.89 por usuario ≈ US$ 1.99 por usuario Comprar Comprar Todo lo incluido en Standard, más: Almacenamiento de 1 TB Automatización de ventas Seguimiento de llamadas Email Marketing Automatización de anuncios Reserva online Análisis e informes Control del tiempo en tareas Automatización de tareas Automatización Robótica (RPA) Herramientas de gestión de RR. HH. Control del tiempo de trabajo»
>
> — https://www.bitrix24.es/prices/, consultado el 29 de septiembre de 2026

   ↳ **Con Bitrix24 Professional** (US$ 289 por mes, hasta 100 usuarios, abono recurrente) · **2** (cumple) · costo de implementación **1** — Con el plan Professional los procesos inteligentes vienen incluidos: se crea la entidad desde la barra del CRM con su nombre, sus etapas y sus campos propios, sin escribir código. Es configuración de una vez.


### A.8.2 Campos calculados sobre datos propios
**EspoCRM** · **2** (cumple) · costo de implementación **1** — La administración de cada entidad trae una fórmula que, según la propia pantalla, "se ejecuta cada vez que se guarda una entidad" y "se utiliza para configurar campos calculados". Se definió la prima anual como doce veces la mensual con una sola expresión, del tipo de una fórmula de planilla, y al guardar una póliza con prima de 15.250,50 el sistema calculó 183006 sin intervención. El cálculo se escribe una vez desde la administración, sin instalar nada ni programar la aplicación: es configuración. *Prima anual calculada al guardar: 183006.*

**Twenty** · **2** (cumple) · costo de implementación **2** — Twenty no tiene campos calculados: ningún tipo de campo deriva su valor de otro. El cálculo se armó con un flujo de trabajo que corre cada vez que se guarda la prima de una póliza, con un paso de código que multiplica la prima mensual por doce y un paso que escribe el resultado en el campo de la prima anual. Al cargar desde la ficha una póliza con prima de 15.250,50 el sistema completó 183006 sin intervención. La necesidad queda resuelta desde el sistema, pero exige escribir una función en TypeScript —con la prima guardada en millonésimas— y, en la instalación propia, habilitar la ejecución de funciones, que viene deshabilitada. Es desarrollo, breve, que alguien tiene que saber leer y mantener. *Prima anual calculada al guardar: 183006, 11 segundos después.*

**Bitrix24** · **1** (cumple con reparo) · costo de implementación **2** — Bitrix24 no tiene campos calculados: entre los tipos de campo que ofrece el formulario —cadena, lista, fecha, dinero, número y los adicionales— ninguno deriva su valor de otro. El cálculo se arma con reglas de automatización de la negociación: «Ejecutar operaciones matemáticas» suma, resta, multiplica o divide campos numéricos y deja el resultado en una variable, y «Modificar elemento» lo escribe en el campo destino. Son dos reglas configuradas sin código, pero según el fabricante corren cuando la negociación llega a una etapa, no cada vez que se guarda un dato: el valor derivado no acompaña por sí solo a una prima corregida después. La necesidad se resuelve con esa salvedad permanente. La prueba recorrió los tipos de campo, el catálogo de reglas y la pantalla de la regla matemática; no llegó a ejecutar el cálculo, porque el portal gratuito ya trae más reglas de muestra que las cinco que admite (ver A.8.3). *Sin campo calculado; cálculo por dos reglas de automatización.*

> «This automation rule updates a variable with the result of a math operation. Four operations are available: addition, subtraction, multiplication, and division.»
>
> — https://helpdesk.bitrix24.com/open/14954920/, consultado el 29 de septiembre de 2026

> «When a CRM entity reaches a certain stage, the automation rule modifies the field values in that entity. For example, when a new deal appears in CRM, the rule changes its name and assigns another responsible user.»
>
> — https://helpdesk.bitrix24.com/open/22396442/, consultado el 29 de septiembre de 2026


### A.8.3 Automatización de procesos
**EspoCRM** · **2** (cumple) · costo de implementación **2** — Se definió una acción automática sobre un evento: cuando la cobranza de una póliza pasa a vencida, el sistema le crea una tarea de gestión a su productor. Se provocó el evento cambiando el estado desde la ficha, y la tarea "Gestionar cobranza de POL-VENCE-AUTOMATIZACION" apareció sola, asignada al productor y vinculada a la póliza. La edición gratuita lo resuelve, pero con la fórmula de la entidad, que para esto exige escribir un script con condiciones y funciones del sistema: es desarrollo, aunque sea breve, y lo tiene que mantener alguien que sepa leerlo. El fabricante vende un motor de flujos de trabajo que define la misma regla desde pantallas, sin escribir código. *Tarea creada automáticamente al cambiar el estado de cobranza.*

> «Workflows»
>
> — https://www.espocrm.com/extensions/advanced-pack/, consultado el 28 de septiembre de 2026

> «$395.00 1 Year License + Upgrades»
>
> — https://www.espocrm.com/extensions/advanced-pack/, consultado el 28 de septiembre de 2026

> «1.1 Subject to your continuous compliance with the Agreement and payment of the applicable license fees, EspoCRM grants you a non-exclusive, non-transferable, worldwide, limited right to use the Software on a single EspoCRM Application instance on a single server for the Licensed Period. After the license period expires, you must renew or purchase a new license to continue using the Software. You may use or modify the Software only for your own internal business purposes or for non-commercial or personal use.»
>
> — https://www.espocrm.com/extension-license-agreement/, consultado el 28 de septiembre de 2026

> «Basic $15.00 per user/month minimum 3 users 3GB file storage per user 100,000 records SSL Encryption (256 bit keys, TLS 1.3) Full feature set All extensions included External access API 2000+ integrations * 12x5 (hours/days) support Sign Up Free Trial Free Trial is provided for 30 days»
>
> — https://www.espocrm.com/cloud/, consultado el 28 de septiembre de 2026

   ↳ **Con Advanced Pack** (US$ 395 por año y por instalación, abono recurrente) · **2** (cumple) · costo de implementación **1** — Con los flujos de trabajo de la extensión, la condición y la acción se eligen desde la administración sin escribir código: la misma regla pasa de desarrollo a configuración.

   ↳ **Con EspoCRM Cloud Basic** (US$ 15 por usuario por mes, mínimo 3 usuarios, abono recurrente) · **2** (cumple) · costo de implementación **1** — El servicio en la nube incluye los flujos de trabajo entre todas las extensiones del fabricante: la regla se define desde pantallas, igual que con la extensión comprada aparte.

**Twenty** · **2** (cumple) · costo de implementación **1** — Los flujos de trabajo vienen en la edición evaluada y se arman desde un editor visual, sin escribir código. Se definió uno que escucha las actualizaciones de las pólizas, con la condición de que el estado de pago quede en vencida, y que crea una tarea de gestión a nombre del productor de la póliza. Se provocó el evento cambiando el estado desde la ficha y la tarea «Gestionar cobranza de POL-CART-01» apareció sola, asignada a Pablo Gómez. Definir el flujo es configuración de una sola vez. *Tarea creada automáticamente al cambiar el estado de pago.*

**Bitrix24** · **2** (cumple) · costo de implementación **1** — Las reglas de automatización de la negociación se arman desde la pantalla, sin código: se elige la etapa, la acción —comunicar, crear tareas, modificar campos, dejar comentarios— y el momento. Se definió una que deja un comentario en el historial al llegar a «En progreso». Para provocar el evento se abrió una póliza desde el listado y se la pasó a esa etapa con un clic en la barra de etapas de su ficha: sin que nadie hiciera nada más, el comentario «Póliza en emisión: verificar la documentación del asegurado» apareció en el historial de la póliza. La edición gratuita admite hasta 5 reglas y disparadores en total: con las de muestra del portal dejadas en 2, la regla entra. Definir cada regla es configuración de una vez. *Comentarios en la póliza tras el cambio de etapa: 1.*

> «When a CRM entity reaches a certain stage, the automation rule modifies the field values in that entity. For example, when a new deal appears in CRM, the rule changes its name and assigns another responsible user.»
>
> — https://helpdesk.bitrix24.com/open/22396442/, consultado el 30 de septiembre de 2026


### A.8.4 Conservación de la parametrización al actualizar
**EspoCRM** · **2** (cumple) — El procedimiento oficial de actualización distingue dos clases de personalización: la hecha desde la interfaz, que la actualización no debería romper, y la hecha con código, que sí puede romperse. Todo lo que este análisis parametrizó —la póliza, el endoso, sus campos, sus diseños y su fórmula— se hizo desde la administración, sin tocar código, de modo que queda del lado que el fabricante se compromete a conservar. No hay nada que preparar para que se conserve.

> «Espo upgrades should not break customizations made via the UI. But customizations made via code may break. To review breaking changes before upgrading, check release notes or GitHub issues marked with the change tag.»
>
> — https://docs.espocrm.com/administration/upgrading/, consultado el 28 de septiembre de 2026

**Twenty** · **2** (cumple) — Lo que la compañía parametriza —objetos, campos, relaciones, vistas y flujos— es parte del modelo de datos del espacio de trabajo, no del código del producto. El procedimiento oficial de actualización no pide nada sobre eso: al arrancar la versión nueva, el servidor corre solo las migraciones de cada espacio de trabajo, incluidos los registros ya cargados, y el fabricante indica respaldar la base antes, como en cualquier actualización. Todo lo que este análisis parametrizó se hizo por pantalla. No hay nada que preparar para que se conserve.

> «The server runs all required upgrade migrations automatically on startup. No manual command is needed.»
>
> — https://docs.twenty.com/developers/self-host/capabilities/upgrade-guide, consultado el 29 de septiembre de 2026

> «Always back up your database before starting the upgrade process»
>
> — https://docs.twenty.com/developers/self-host/capabilities/upgrade-guide, consultado el 29 de septiembre de 2026

**Bitrix24** · **2** (cumple) — El portal es un servicio en la nube que el fabricante actualiza por su cuenta: la compañía no aplica ningún procedimiento ni elige el momento, y el fabricante afirma que el servicio no se interrumpe durante las actualizaciones. Los campos, las listas y las monedas que este análisis creó desde la pantalla están guardados como datos del portal y siguen ahí, en el formulario, sin que nadie los rehaga. El fabricante no publica una frase que garantice expresamente que la parametrización se conserva al actualizar: la conclusión se apoya en que actualiza el servicio de todos sus clientes a la vez y en que lo parametrizado es información del portal y no código de la compañía. *Campos propios del portal: 5.*

> «Automatic updates. There's no need to track or manage version updates. Bitrix24 accounts automatically receive updates and new tools.»
>
> — https://helpdesk.bitrix24.com/open/23247978/, consultado el 29 de septiembre de 2026

> «Servicio ininterrumpido durante las actualizaciones del sistema y de la infraestructura»
>
> — https://www.bitrix24.es/prices/compare_cloud_plans.php, consultado el 29 de septiembre de 2026


## A.9 Control de acceso y trazabilidad

### A.9.1 Restricción de la cartera por productor
**EspoCRM** · **2** (cumple) · costo de implementación **1** — Los roles de la administración definen, entidad por entidad, si el usuario ve todo, lo de su equipo o solo lo suyo. Con un rol de productor restringido a lo propio, su listado de pólizas muestra solo la que tiene a cargo; al pegar en el navegador la dirección de una póliza ajena el sistema niega el acceso, y la interfaz de programación, consultada con sus credenciales, responde que no tiene permiso. La restricción se aplica en el servidor y no solo en la pantalla. Definir el rol es configuración de una vez. *Acceso a una póliza ajena por la interfaz de programación: respuesta 403.*

**Twenty** · **0** (no cumple) — En la edición evaluada los roles restringen por objeto —ver, editar, borrar— y por campo, pero no por registro: el productor, con el rol de miembro, abrió por dirección directa una póliza de otro productor y la vio completa. La pantalla del rol muestra el nivel de registro como función del plan Organization, y el fabricante lo confirma: los permisos por registro, que limitan a cada vendedor a lo suyo, son una función premium de ese plan. Sin él, la cartera de un productor queda a la vista de todos.

> «Row-level permissions are a Premium feature available on the Organization plan (Cloud and Self-Hosted).»
>
> — https://docs.twenty.com/user-guide/permissions-access/capabilities/permissions, consultado el 28 de septiembre de 2026

> «Cloud Pro is $9/user/month (yearly). Organization is $19/user/month and unlocks SSO and row-level permissions for teams that need finer access control.»
>
> — https://twenty.com/pricing, consultado el 28 de septiembre de 2026

> «Premium features are only available on the Organization plans (Cloud or Self-Hosted):»
>
> — https://docs.twenty.com/user-guide/billing/capabilities/pricing-plans, consultado el 28 de septiembre de 2026

   ↳ **Con Twenty Organization** (US$ 19 por usuario por mes, abono recurrente) · **2** (cumple) · costo de implementación **1** — Con el plan Organization, en la nube o en la instalación propia, el rol filtra los registros con una condición —el productor de la póliza es el usuario que entra—, que se define una vez desde la pantalla del rol.

**Bitrix24** · **0** (no cumple) — En la edición gratuita no se puede crear la restricción por productor: desde CRM › Más › Configuraciones › «Permisos de acceso al CRM» el editor deja armar el rol «Productor» con leer, agregar, editar y eliminar limitados a «Solo sus propios elementos» en contactos y negociaciones y asignárselo al productor, pero al guardar el sistema abre una pantalla de oferta —«En su plan actual, todos los empleados tienen los mismos permisos de acceso. Actualice a uno de los planes de nivel superior para asignar roles a los empleados»— y el rol no queda creado. Con la sesión del productor, sin rol propio, el asegurado ajeno figura en su listado y se abre al escribir la dirección de su ficha: todos los empleados comparten el mismo permiso, y no se puede distinguir a un productor de un supervisor ni ajustar el acceso de ninguno. El fabricante confirma que los permisos por rol del CRM no están en todos los planes, y su comparación de planes los publica desde el plan Basic.

> «Role-based access permissions in CRM are not available on all plans. Bitrix24 plans and pricing»
>
> — https://helpdesk.bitrix24.com/open/25911175/, consultado el 30 de septiembre de 2026

> «Permisos de acceso CRM Establezca y limite el acceso a los canales abiertos para cada usuario, de acuerdo con su función y los permisos asignados»
>
> — https://www.bitrix24.es/prices/compare_cloud_plans.php, consultado el 30 de septiembre de 2026

> «Basic Ideal para emprendedores individuales y equipos pequeños que están empezando US$ 69 US$ 69 US$ 49 / compañía / mes / facturado mensualmente / compañía / mes / facturación anual Un pago de US$ 588 / año Ahorra US$ 240 al año incluye 5 usuarios Comprar Comprar Todo lo incluido en Free, más: Almacenamiento de 24 GB IA para el trabajo diario en Bitrix24 Embudos de ventas Negociaciones recurrentes Pagos en línea Integración de correo electrónico Integración de WhatsApp Integración de telefonía»
>
> — https://www.bitrix24.es/prices/, consultado el 30 de septiembre de 2026

   ↳ **Con Bitrix24 Basic** (US$ 69 por mes, hasta 5 usuarios, abono recurrente) · **2** (cumple) · costo de implementación **1** — Los permisos de acceso del CRM por rol se incluyen desde el plan Basic, y el editor de roles permite limitar a cada productor a sus propios elementos con una configuración de una sola vez. No se contrató el plan: el editor es el mismo que se recorrió en la edición gratuita, que solo frena al guardar.


### A.9.2 Autenticación de los usuarios bajo control de la compañía
**EspoCRM** · **2** (cumple) · costo de implementación **1** — La pantalla de autenticación de la administración reúne las tres cosas: la política de contraseñas —longitud mínima y exigencia de letras, números y caracteres especiales—, el segundo factor para los usuarios, y el ingreso contra el directorio de la compañía entre 3 métodos (Espo, LDAP, OIDC). La compañía decide cómo se valida la identidad de cada usuario sin depender del fabricante. Viene en el producto y se activa desde esa pantalla: es configuración.

**Twenty** · **2** (cumple) · costo de implementación **1** — La seguridad del espacio de trabajo permite imponer el segundo factor a todos los usuarios en cada ingreso y apagar el ingreso con correo y contraseña, de modo que solo se entre con la cuenta de la compañía. La instalación propia admite el ingreso con cuentas de Google y de Microsoft registrando sus credenciales, que es como se unifica el acceso con el directorio de una compañía que usa esos servicios; la conexión por SAML u OIDC con cualquier otro directorio es del plan Organization. No hay una política de contraseñas que se configure —largo, vencimiento—, que deja de importar si el ingreso es con la cuenta de la compañía y segundo factor. Es configuración de una sola vez.

> «Authentication - Google/Microsoft OAuth, password settings»
>
> — https://docs.twenty.com/developers/self-host/capabilities/setup, consultado el 28 de septiembre de 2026

> «Organization plan (cloud and self-hosted workspaces)»
>
> — https://docs.twenty.com/user-guide/permissions-access/capabilities/sso-configuration, consultado el 28 de septiembre de 2026

**Bitrix24** · **1** (cumple con reparo) · costo de implementación **2** — Los ajustes de seguridad del portal ofrecen la autenticación de dos factores, que el administrador puede volver obligatoria para todos los empleados con un plazo para habilitarla, y una confirmación adicional del inicio de sesión en el dispositivo de confianza. La pantalla no ofrece ninguna política de contraseñas configurable —longitud, complejidad, vencimiento—. El acceso unificado con el directorio de la compañía existe como inicio de sesión único (SSO) con Microsoft Azure Active Directory, pero el fabricante lo limita a los planes Enterprise: en la edición gratuita no está.

> «Single Sign-On (SSO) is available on Bitrix24 Enterprise plans. It lets employees sign in with their Microsoft Azure Active Directory account without entering a password.»
>
> — https://helpdesk.bitrix24.com/open/24571280/, consultado el 30 de septiembre de 2026


### A.9.3 Registro de quién modificó cada dato
**EspoCRM** · **2** (cumple) · costo de implementación **1** — Un productor cambió el ramo de una póliza de automotor a hogar, y al abrirla con otro usuario la historia de la ficha muestra la constancia completa: el valor anterior, el nuevo, quién lo cambió y en qué momento. Para que un campo deje esa constancia se lo marca como auditado desde el Administrador de Campos, una sola vez y sin programar. Es lo que permite responder quién tocó un dato cuando un asegurado lo discute. *Constancia: Automotor → Hogar, el 2026-09-28 20:17:47.*

**Twenty** · **2** (cumple) — Cada registro trae de fábrica una línea de tiempo con sus cambios. El productor cambió el ramo de una póliza de Automotor a Hogar desde la ficha, y el administrador, con su cuenta, encontró la constancia en la línea de tiempo de la póliza: quién lo cambió, cuándo, y el valor anterior junto al nuevo. Viene listo, sin configurar nada. Los cambios seguidos de la misma persona sobre un registro, dentro de los diez minutos, se funden en una entrada con el primer valor y el último. El registro de auditoría de todo el espacio de trabajo es aparte, y es del plan Organization. *Automotor → Hogar, por Pablo Gómez, 2026-09-29T03:29:17.691Z.*

**Bitrix24** · **0** (no cumple) — Se cambió el ramo de una póliza de Hogar a Vida desde su ficha y el cambio quedó guardado, pero no dejó ninguna constancia: la línea de tiempo de la edición gratuita solo muestra la creación de la negociación —y los cambios de etapa—, sin el valor anterior, el autor ni el momento del cambio de un campo. La pestaña «Historial», que sí registra quién hizo cada acción y cuándo, no se abre: el sistema informa que el historial en CRM está disponible solo en los planes Standard, Professional y Enterprise.

> «The CRM history logs key changes to CRM items, such as exporting contacts or updating field values. Use it to track activity related to clients and deals.»
>
> — https://helpdesk.bitrix24.com/open/25803275/, consultado el 30 de septiembre de 2026

> «US$ 144»
>
> — https://www.bitrix24.es/prices/, consultado el 30 de septiembre de 2026

   ↳ **Con Bitrix24 Standard** (US$ 144 por mes, hasta 50 usuarios, abono recurrente) · **2** (cumple) — El historial en CRM, que el fabricante describe como un registro detallado de cada actividad de los usuarios con quién la realizó y en qué momento, se habilita desde el plan Standard. No se contrató el plan, así que no se comprobó que el cambio de ramo muestre el valor anterior.


## A.10 Explotación de la información

### A.10.1 Indicadores sobre la operación
**EspoCRM** · **1** (cumple con reparo) · costo de implementación **2** — Los indicadores que trae la edición gratuita son los de ventas —oportunidades por etapa, por origen y por mes—. Para las pólizas y los reclamos el tablero ofrece listas, como los tickets pendientes de cada usuario, pero ninguna suma ni promedia. Para obtener el total de primas por estado de cobranza o el tiempo promedio de resolución hay que exportar el listado —XLSX · Spreadsheet o CSV— y calcularlo en una planilla, cada vez que se quiere ver el número. El módulo de informes que vende el fabricante agrupa y resume con sumas y promedios, y lo muestra en el tablero.

> «The Reports feature is available in Advanced Pack. It provides the analytic capabilities and two additional functionalities: report panels and custom list view filters.»
>
> — https://docs.espocrm.com/user-guide/reports/, consultado el 28 de septiembre de 2026

> «Grid reports display summarized values, can be grouped by one or two fields, and support chart visualization.»
>
> — https://docs.espocrm.com/user-guide/reports/, consultado el 28 de septiembre de 2026

> «$395.00 1 Year License + Upgrades»
>
> — https://www.espocrm.com/extensions/advanced-pack/, consultado el 28 de septiembre de 2026

> «1.1 Subject to your continuous compliance with the Agreement and payment of the applicable license fees, EspoCRM grants you a non-exclusive, non-transferable, worldwide, limited right to use the Software on a single EspoCRM Application instance on a single server for the Licensed Period. After the license period expires, you must renew or purchase a new license to continue using the Software. You may use or modify the Software only for your own internal business purposes or for non-commercial or personal use.»
>
> — https://www.espocrm.com/extension-license-agreement/, consultado el 28 de septiembre de 2026

> «Basic $15.00 per user/month minimum 3 users 3GB file storage per user 100,000 records SSL Encryption (256 bit keys, TLS 1.3) Full feature set All extensions included External access API 2000+ integrations * 12x5 (hours/days) support Sign Up Free Trial Free Trial is provided for 30 days»
>
> — https://www.espocrm.com/cloud/, consultado el 28 de septiembre de 2026

   ↳ **Con Advanced Pack** (US$ 395 por año y por instalación, abono recurrente) · **2** (cumple) · costo de implementación **1** — Un informe agrupado suma las primas por estado de cobranza y promedia la resolución de reclamos, y se lo lleva al tablero.

   ↳ **Con EspoCRM Cloud Basic** (US$ 15 por usuario por mes, mínimo 3 usuarios, abono recurrente) · **2** (cumple) · costo de implementación **1** — El servicio en la nube incluye el módulo de informes.

**Twenty** · **1** (cumple con reparo) · costo de implementación **2** — Los tableros vienen de fábrica: se armó un gráfico con el total de primas por estado de cobranza eligiendo el objeto, el campo del eje y la suma de la prima, sin programar, y quedó guardado para consultarlo cuando se quiera. El tiempo promedio de resolución de los reclamos, en cambio, no se puede mostrar: el gráfico promedia campos numéricos, y el producto no calcula la duración de cada reclamo ni tiene campos que la deriven de sus fechas. Hay que agregar esa duración con un flujo con código que la escriba al cerrarse cada reclamo, que es desarrollo. *Primas por estado: Vencida 402000 · (sin estado) 45251 · Al día 354000 · Cancelada 201000 · En gestión 177000.*

**Bitrix24** · **1** (cumple con reparo) · costo de implementación **2** — El asistente de informes del CRM, que viene en la edición gratuita, arma sin programar el total de primas por estado de cobranza: agrupando por el campo de lista y sumando el importe de la negociación mostró Al día 900, Vencida 600, En gestión 900, las mismas cifras que suman las negociaciones cargadas. La suma va sobre el importe nativo: el campo propio de tipo dinero solo admite contarse. El tiempo promedio de resolución, en cambio, no se puede mostrar: sobre las fechas de la negociación el asistente ofrece solo Mínimo, Máximo, Único, sin promedio ni diferencia entre dos fechas. Los paneles de analítica que sí podrían medirlo piden un plan: el sistema informa que BI Builder se desbloquea a partir del Standard. *Primas por estado: Vencida 600 · Al día 900 · En gestión 900.*

> «BI Builder Crea informes de analíticas a partir de la información del CRM.»
>
> — https://www.bitrix24.es/prices/compare_cloud_plans.php, consultado el 29 de septiembre de 2026

> «Calculated columns: Add new fields using formulas. For example, create a column that adds 1 to the company_id value.»
>
> — https://helpdesk.bitrix24.com/open/19542946/, consultado el 29 de septiembre de 2026

> «US$ 144»
>
> — https://www.bitrix24.es/prices/, consultado el 29 de septiembre de 2026

   ↳ **Con Bitrix24 Standard** (US$ 144 por mes, hasta 50 usuarios, abono recurrente) · **2** (cumple) · costo de implementación **2** — Con el plan Standard se habilita BI Builder, donde cada conjunto de datos de negociaciones trae las fechas de creación y de cierre y admite columnas calculadas con fórmulas, según el fabricante: el tiempo de resolución se obtiene definiendo esa columna y promediándola. Hay que escribir la fórmula, y por eso el costo es el de desarrollo.


### A.10.2 Generación de informes definidos por el usuario
**EspoCRM** · **1** (cumple con reparo) · costo de implementación **2** — En la edición gratuita el listado de pólizas se filtra por productor y por período y se exporta en XLSX · Spreadsheet o CSV, pero no suma: el total de primas por productor se arma en la planilla exportada, a mano, cada vez que se pide el informe. El módulo de informes del fabricante agrupa por productor, suma las primas del período elegido y exporta el resultado ya calculado.

> «The Reports feature is available in Advanced Pack. It provides the analytic capabilities and two additional functionalities: report panels and custom list view filters.»
>
> — https://docs.espocrm.com/user-guide/reports/, consultado el 28 de septiembre de 2026

> «Grid reports display summarized values, can be grouped by one or two fields, and support chart visualization.»
>
> — https://docs.espocrm.com/user-guide/reports/, consultado el 28 de septiembre de 2026

> «It's possible to export grid report results to XLSX (spreadsheet) and CSV formats. Both a results table and chart are exported to XLSX.»
>
> — https://docs.espocrm.com/user-guide/reports/, consultado el 28 de septiembre de 2026

> «$395.00 1 Year License + Upgrades»
>
> — https://www.espocrm.com/extensions/advanced-pack/, consultado el 28 de septiembre de 2026

> «1.1 Subject to your continuous compliance with the Agreement and payment of the applicable license fees, EspoCRM grants you a non-exclusive, non-transferable, worldwide, limited right to use the Software on a single EspoCRM Application instance on a single server for the Licensed Period. After the license period expires, you must renew or purchase a new license to continue using the Software. You may use or modify the Software only for your own internal business purposes or for non-commercial or personal use.»
>
> — https://www.espocrm.com/extension-license-agreement/, consultado el 28 de septiembre de 2026

> «Basic $15.00 per user/month minimum 3 users 3GB file storage per user 100,000 records SSL Encryption (256 bit keys, TLS 1.3) Full feature set All extensions included External access API 2000+ integrations * 12x5 (hours/days) support Sign Up Free Trial Free Trial is provided for 30 days»
>
> — https://www.espocrm.com/cloud/, consultado el 28 de septiembre de 2026

   ↳ **Con Advanced Pack** (US$ 395 por año y por instalación, abono recurrente) · **2** (cumple) · costo de implementación **1** — El informe agrupado por productor suma las primas del período y se exporta a planilla.

   ↳ **Con EspoCRM Cloud Basic** (US$ 15 por usuario por mes, mínimo 3 usuarios, abono recurrente) · **2** (cumple) · costo de implementación **1** — El servicio en la nube incluye el módulo de informes.

**Twenty** · **1** (cumple con reparo) · costo de implementación **2** — El informe se armó desde un tablero, eligiendo los criterios sin programar: un gráfico con la suma de la prima de las pólizas agrupada por productor, filtrado por las que empezaron su vigencia en los últimos seis meses. Muestra el total de cada productor y queda guardado. Pero el gráfico no se exporta: el widget no ofrece descargarlo. Lo que se puede sacar es el listado de pólizas, a un archivo que la planilla abre, y los totales por productor hay que rehacerlos ahí cada vez que se necesita el informe fuera del sistema. *Totales esperados: Pablo Gómez 207000 · TP TP 207000 · (sin productor) 0 · 32 pólizas exportadas.*

**Bitrix24** · **2** (cumple) · costo de implementación **1** — El asistente de informes del CRM, incluido en la edición gratuita, armó sin programar el total de primas por productor en un período: se agrupó por la persona responsable, se sumó el importe de la negociación y se eligió el rango de fechas por la fecha de inicio de la póliza. Del 1 al 20 de septiembre el informe mostró Gómez Productor 900 y Nahuel Mosse 300, las mismas cifras que suman las negociaciones cargadas, y el menú del informe lo exportó a un archivo de Microsoft Excel con esos totales. Armar el informe es configuración: se elige una vez y se vuelve a abrir cuando se lo necesita. La suma se hace sobre el importe nativo de la negociación, no sobre un campo propio de tipo dinero. *Totales por productor: Gómez Productor 900 · Nahuel Mosse 300 · exportado a report.xls.*


### A.10.3 Informe paramétrico reutilizable
**EspoCRM** · **1** (cumple con reparo) · costo de implementación **2** — La edición gratuita guarda búsquedas con períodos relativos —mes actual, mes pasado, trimestre, próximos días, entre 21 opciones—, que se vuelven a abrir sin rearmarlas. Pero no es un informe con parámetro: para verlo sobre otro período hay que cambiar la condición, y el resultado sigue siendo un listado que hay que exportar y totalizar afuera. Los filtros al ejecutar del módulo de informes del fabricante piden el período cada vez que se corre el informe, sin editarlo.

> «Runtime Filters lets you narrow down the results each time you run the report, without needing to edit the report itself. It's useful when the report structure stays the same, but you want to change the criteria dynamically – like choosing a specific date range, customer, or status before generating the results.»
>
> — https://docs.espocrm.com/user-guide/reports/, consultado el 28 de septiembre de 2026

> «$395.00 1 Year License + Upgrades»
>
> — https://www.espocrm.com/extensions/advanced-pack/, consultado el 28 de septiembre de 2026

> «1.1 Subject to your continuous compliance with the Agreement and payment of the applicable license fees, EspoCRM grants you a non-exclusive, non-transferable, worldwide, limited right to use the Software on a single EspoCRM Application instance on a single server for the Licensed Period. After the license period expires, you must renew or purchase a new license to continue using the Software. You may use or modify the Software only for your own internal business purposes or for non-commercial or personal use.»
>
> — https://www.espocrm.com/extension-license-agreement/, consultado el 28 de septiembre de 2026

> «Basic $15.00 per user/month minimum 3 users 3GB file storage per user 100,000 records SSL Encryption (256 bit keys, TLS 1.3) Full feature set All extensions included External access API 2000+ integrations * 12x5 (hours/days) support Sign Up Free Trial Free Trial is provided for 30 days»
>
> — https://www.espocrm.com/cloud/, consultado el 28 de septiembre de 2026

   ↳ **Con Advanced Pack** (US$ 395 por año y por instalación, abono recurrente) · **2** (cumple) · costo de implementación **1** — El informe guardado pide el período al ejecutarse y se reutiliza sin editarlo.

   ↳ **Con EspoCRM Cloud Basic** (US$ 15 por usuario por mes, mínimo 3 usuarios, abono recurrente) · **2** (cumple) · costo de implementación **1** — El servicio en la nube incluye el módulo de informes.

**Twenty** · **2** (cumple) · costo de implementación **1** — El informe de primas por productor quedó guardado en su tablero con el período como condición del filtro. Para otro período se abrió el mismo gráfico y se cambió solo la fecha del filtro: los totales se recalcularon sin rehacer el informe, que conserva su fuente, su agrupación y su medida. El período no se pide al abrirlo: cambiarlo modifica el informe guardado para todos los que lo miran, o hay que duplicarlo. Armarlo es configuración de una sola vez. *Seis meses: Not Set Pablo Gómez TP TP 0 50k 100k 150k 200k 250k · un año: Not Set Pablo Gómez TP TP 0 200k 400k 600k 800k.*

**Bitrix24** · **2** (cumple) · costo de implementación **1** — El informe de primas por productor se guardó una sola vez, sin período fijo, y la pantalla del informe trae el período como parámetro: se ejecutó del 1 al 20 de septiembre y, sin volver a armarlo, se lo volvió a ejecutar del 1 de enero al 31 de marzo. Cada ejecución recalculó los totales por productor —Gómez Productor 900 y Nahuel Mosse 300 en septiembre; Nahuel Mosse 900 en el primer trimestre—, iguales a los que suman las negociaciones. Armarlo es configuración de una vez; el período se pide cada vez que se abre. *Septiembre: {"Gómez Productor":900,"Nahuel Mosse":300} · Primer trimestre: {"Nahuel Mosse":900}.*


### A.10.4 Intercambio de datos con otros sistemas de la compañía
**EspoCRM** · **2** (cumple) · costo de implementación **1** — El producto trae una interfaz de programación completa y un tipo de usuario pensado para otros sistemas: se dio de alta un usuario de integración con su propia clave y los permisos de un rol, sin contraseña de ninguna persona. Con esa clave, desde fuera del sistema, se creó un asegurado y se lo volvió a consultar. El sistema de emisión o el de cobranza de la compañía pueden cargar y leer datos por esa vía. Crear el usuario es configuración; lo que el otro sistema haga con la interfaz es trabajo de ese sistema, no de este.

> «Authentication by API Key»
>
> — https://docs.espocrm.com/development/api/, consultado el 28 de septiembre de 2026

**Twenty** · **2** (cumple) · costo de implementación **1** — El producto trae interfaces de programación REST y GraphQL que se generan solas a partir del modelo de datos, incluidos los objetos propios como la póliza. Desde Configuración se creó una clave para el otro sistema, que lleva un rol que define lo que puede hacer, sin la contraseña de ninguna persona; con esa clave, desde fuera del sistema, se dio de alta un asegurado y se lo volvió a consultar. Crear la clave es configuración; lo que el otro sistema haga con la interfaz es trabajo de ese sistema, no de este.

> «There is no static API reference for Twenty. Each workspace has its own schema — when you add a custom object (say Invoice), it immediately gets REST and GraphQL endpoints identical to built-in objects like Company or Person. The API is generated from the schema, so endpoints use your object and field names directly — no opaque IDs.»
>
> — https://docs.twenty.com/developers/extend/api, consultado el 29 de septiembre de 2026

**Bitrix24** · **0** (no cumple) — En la edición gratuita no hay forma de crear ni consultar registros desde fuera: Recursos para desarrolladores ofrece «Webhook entrante», y al abrirlo el sistema responde «No disponible en tu plan actual» y remite a los planes Vibe+. El comparativo del fabricante lo confirma: la API REST no figura en la edición gratuita ni en las ediciones Essential, y en los planes Vibe+ viene sin tope. El webhook entrante es una dirección secreta que el otro sistema llama para ejecutar métodos de la API, con los permisos del usuario que lo crea.

> «REST API Available on Vibe+ plans.»
>
> — https://www.bitrix24.es/prices/compare_cloud_plans.php, consultado el 30 de septiembre de 2026

> «Quick integrations, tests, scripts, and data exchange with an external system»
>
> — https://apidocs.bitrix24.com/local-integrations/local-webhooks.html, consultado el 30 de septiembre de 2026

> «Basic Vibe+ Ideal para emprendedores individuales y equipos pequeños que crean aplicaciones sin código US$ 89 US$ 89US$ 59-34% / compañía / mes / facturado mensualmente / compañía / mes / facturación anualUn pago de US$ 705 / año Ahorra US$ 363 al año incluye 5 usuarios Comprar Comprar Vibe+ Creador de aplicaciones Vibecode La creación de aplicaciones está incluida. Para ejecutarlas se utilizan Vibe Credits (solo costos de infraestructura) Aplicaciones de Market y REST API ilimitadas IA para el trabajo diario en Bitrix24 Funciones clave: Almacenamiento de 24 GB Embudos de ventas Negociaciones recurrentes Pagos en línea Integración de correo electrónico Integración de WhatsApp Integración de telefonía»
>
> — https://www.bitrix24.es/prices/, consultado el 30 de septiembre de 2026

> «Aplicaciones de Market y REST API ilimitadas»
>
> — https://www.bitrix24.es/prices/, consultado el 30 de septiembre de 2026

   ↳ **Con Bitrix24 Basic Vibe+** (US$ 89 por mes, hasta 5 usuarios, abono recurrente) · **2** (cumple) · costo de implementación **1** — Con el plan Basic en su edición Vibe+ la API REST no tiene tope y el webhook entrante se crea desde Recursos para desarrolladores, sin programar: el otro sistema llama a su dirección para crear y consultar negociaciones y contactos. Crear el webhook y elegir sus permisos es configuración de una vez; lo que el otro sistema haga con él es trabajo de ese sistema.


### A.10.5 Intercambio sin límite de volumen que condicione la operación
**EspoCRM** · **2** (cumple) — En la instalación propia la interfaz de programación no tiene un tope publicado: no lo impone el fabricante sino el equipo donde corre. Se mandó el movimiento de un día entero —500 altas— dos veces: en ráfaga, de a diez simultáneas, y de a una. Las dos veces el sistema aceptó las quinientas: en ráfaga llevó alrededor de un minuto, y de a una unos cinco. En una corrida anterior, con el equipo ocupado por otros procesos, tres de quinientas altas en ráfaga fueron rechazadas y pasaron al repetirlas: el límite es el del equipo, no una cuota del producto. El movimiento de un día entra con holgura en minutos, y la sincronización con otros sistemas no tiene que espaciarse más allá de reintentar lo que falle. *ráfaga de 10 simultáneas: {"200":500} en 157 s · de a una: {"200":500} en 629 s.*

> «Authentication by API Key»
>
> — https://docs.espocrm.com/development/api/, consultado el 28 de septiembre de 2026

**Twenty** · **2** (cumple) — El fabricante publica el límite de la interfaz de programación: cien pedidos por minuto, y hasta sesenta registros por pedido en las operaciones por lotes. Se mandó el movimiento de un día entero —500 altas— en ráfagas de diez simultáneas, de a un registro por pedido: entraron las 500 en 1.1 minutos, sin rechazos. El límite deja holgura sobre el movimiento de un día: lo que exige es que el otro sistema espacie sus pedidos o los agrupe, como hace cualquier sincronización. *500 de 500 aceptadas en 1.1 min y 1 ronda(s); 0 rechazos por límite · {"201":500}.*

> «100 per minute»
>
> — https://docs.twenty.com/developers/extend/api, consultado el 29 de septiembre de 2026

**Bitrix24** · **0** (no cumple) — En la edición gratuita el intercambio no está disponible —el webhook entrante responde «No disponible en tu plan actual»—, así que no hay operaciones que sincronizar ni límite que medir: la cartera no se puede sincronizar con otro sistema. Donde la API existe, el fabricante publica su límite: a dos pedidos por segundo se pueden hacer 172.800 por día, que deja holgura de sobra sobre las 500 operaciones diarias de la cartera.

> «REST API Available on Vibe+ plans.»
>
> — https://www.bitrix24.es/prices/compare_cloud_plans.php, consultado el 30 de septiembre de 2026

> «To estimate the allowable volume of requests, use the minimum sustainable intensity as a baseline calculation. At an intensity of 2 requests per second, 172,800 requests can be performed per day. The limit mechanism allows for brief increases in intensity beyond this value.»
>
> — https://apidocs.bitrix24.com/limits.html, consultado el 30 de septiembre de 2026

> «Basic Vibe+ Ideal para emprendedores individuales y equipos pequeños que crean aplicaciones sin código US$ 89 US$ 89US$ 59-34% / compañía / mes / facturado mensualmente / compañía / mes / facturación anualUn pago de US$ 705 / año Ahorra US$ 363 al año incluye 5 usuarios Comprar Comprar Vibe+ Creador de aplicaciones Vibecode La creación de aplicaciones está incluida. Para ejecutarlas se utilizan Vibe Credits (solo costos de infraestructura) Aplicaciones de Market y REST API ilimitadas IA para el trabajo diario en Bitrix24 Funciones clave: Almacenamiento de 24 GB Embudos de ventas Negociaciones recurrentes Pagos en línea Integración de correo electrónico Integración de WhatsApp Integración de telefonía»
>
> — https://www.bitrix24.es/prices/, consultado el 30 de septiembre de 2026

> «Aplicaciones de Market y REST API ilimitadas»
>
> — https://www.bitrix24.es/prices/, consultado el 30 de septiembre de 2026

   ↳ **Con Bitrix24 Basic Vibe+** (US$ 89 por mes, hasta 5 usuarios, abono recurrente) · **2** (cumple) — Con el plan Basic en su edición Vibe+ la API REST está habilitada. El fabricante publica que el límite se sostiene a dos pedidos por segundo, 172.800 por día, y admite ráfagas por encima: las 500 operaciones de un día son el 0,3 % de ese tope y no se acercan a él en una jornada intensa. No hay nada que configurar para el volumen.


## A.11 Condiciones técnicas del producto

### A.11.1 Recursos que la compañía debe disponer para sostenerlo
**EspoCRM** · **1** (cumple con reparo) — La edición gratuita se instala en infraestructura de la compañía: pide un servidor web, PHP y una base de datos. No exige un servidor dedicado: la instalación evaluada corre en un equipo de escritorio común, con la imagen oficial de contenedores, y ocupa 841 MB de memoria con la cartera de prueba cargada. La condición se satisface con una limitación que la compañía asume de forma permanente: alguien tiene que mantener ese equipo encendido, respaldado y actualizado. El servicio en la nube del fabricante elimina esa carga. *841 MB de memoria entre la aplicación y su base de datos.*

> «Web server: NGINX, Apache, or IIS;»
>
> — https://www.espocrm.com/download/, consultado el 28 de septiembre de 2026

> «Get EspoCRM running in minutes. The official Docker image sets up EspoCRM, NGINX, and MySQL automatically. No manual server configuration required.»
>
> — https://www.espocrm.com/download/, consultado el 28 de septiembre de 2026

> «Basic $15.00 per user/month minimum 3 users 3GB file storage per user 100,000 records SSL Encryption (256 bit keys, TLS 1.3) Full feature set All extensions included External access API 2000+ integrations * 12x5 (hours/days) support Sign Up Free Trial Free Trial is provided for 30 days»
>
> — https://www.espocrm.com/cloud/, consultado el 28 de septiembre de 2026

   ↳ **Con EspoCRM Cloud Basic** (US$ 15 por usuario por mes, mínimo 3 usuarios, abono recurrente) · **2** (cumple) — En la nube del fabricante la compañía no dispone ninguna infraestructura propia.

**Twenty** · **1** (cumple con reparo) — La edición gratuita se instala en infraestructura de la compañía, con cuatro contenedores: la aplicación, un proceso que ejecuta las tareas en segundo plano, la base de datos y una memoria intermedia. No exige un servidor dedicado: el fabricante pide al menos 2 GB de memoria, y la instalación evaluada corre en un equipo de escritorio común, donde ocupa 2322 MB con la cartera de prueba cargada. La condición se satisface con una limitación que la compañía asume de forma permanente: alguien tiene que mantener ese equipo encendido, respaldado y actualizado. El servicio en la nube del fabricante elimina esa carga. *2322 MB de memoria entre los cuatro contenedores.*

> «RAM: Ensure your environment has at least 2GB of RAM. Insufficient memory can cause processes to crash.»
>
> — https://docs.twenty.com/developers/self-host/capabilities/docker-compose, consultado el 28 de septiembre de 2026

> «Cloud Pro is $9/user/month (yearly). Organization is $19/user/month and unlocks SSO and row-level permissions for teams that need finer access control.»
>
> — https://twenty.com/pricing, consultado el 28 de septiembre de 2026

   ↳ **Con Twenty Cloud Pro** (US$ 9 por usuario por mes, con pago anual, abono recurrente) · **2** (cumple) — En la nube del fabricante la compañía no dispone ninguna infraestructura propia.

**Bitrix24** · **2** (cumple) — La edición evaluada es un servicio en la nube: se opera entera desde el navegador, sin ningún componente que la compañía instale, actualice o respalde. El fabricante aloja los datos en su propia infraestructura —en Amazon Web Services— y sostiene los servidores, las copias y la disponibilidad. La compañía no dispone ningún equipo propio para el sistema: solo necesita una conexión a internet y un navegador, que ya tiene para cualquier otra tarea.

> «Bitrix24 uses Amazon Web Services to host your data in US (Virginia) or European Union (Frankfurt, Germany). You can purchase on premise editions of Bitrix24 to host it in your country or on your server. AWS also maintains the following certifications: HIPAA, GDPR, ISO 27001, SOC 1/2/3, Directive 95/46/EC and PCI DSS Level 1.»
>
> — https://www.bitrix24.com/security/, consultado el 29 de septiembre de 2026


### A.11.2 Compatibilidad con la plataforma que la compañía usa
**EspoCRM** · **2** (cumple) — Corre sobre los tres servidores web más difundidos —NGINX, Apache e IIS— y sobre los tres motores de base de datos libres más usados —MySQL, MariaDB y PostgreSQL—, y el fabricante publica guías de instalación para Windows, macOS y Linux. Cualquiera sea la plataforma que la compañía ya administra, alguna de esas combinaciones es la suya: no la obliga a incorporar una tecnología nueva para sostenerlo.

> «Database: MySQL 8.0+, MariaDB 10.3+, or PostgreSQL 15.0+.»
>
> — https://www.espocrm.com/download/, consultado el 28 de septiembre de 2026

> «Install on Windows»
>
> — https://www.espocrm.com/download/, consultado el 28 de septiembre de 2026

**Twenty** · **1** (cumple con reparo) — La instalación propia corre sobre contenedores, que funcionan en Linux, en Windows y en macOS, pero con una sola combinación de componentes: PostgreSQL como base de datos —de la versión 15 en adelante— y Redis como memoria intermedia. No hay variante para otro motor de base de datos. Si la compañía ya administra contenedores y PostgreSQL, es su plataforma; si no, tiene que incorporar y sostener esas tecnologías para operar el sistema.

> «Docker Compose»
>
> — https://docs.twenty.com/developers/self-host/capabilities/docker-compose, consultado el 28 de septiembre de 2026

> «Twenty v2.34 requires PostgreSQL 15 or newer. The official Docker Compose configuration uses PostgreSQL 16. If your instance connects to an externally managed database, upgrade it before starting the v2.34 server.»
>
> — https://docs.twenty.com/developers/self-host/capabilities/upgrade-guide, consultado el 28 de septiembre de 2026

> «Cloud Pro is $9/user/month (yearly). Organization is $19/user/month and unlocks SSO and row-level permissions for teams that need finer access control.»
>
> — https://twenty.com/pricing, consultado el 28 de septiembre de 2026

   ↳ **Con Twenty Cloud Pro** (US$ 9 por usuario por mes, con pago anual, abono recurrente) · **2** (cumple) — En la nube no hay plataforma que administrar: se usa desde el navegador.

**Bitrix24** · **2** (cumple) — La edición evaluada no corre sobre un sistema operativo ni un motor de base de datos que la compañía administre: es un servicio en la nube que se abre con un navegador de uso común, en cualquier equipo con el que la compañía ya trabaje —Windows, macOS o Linux—. No hay versión que instalar ni versión que elegir según la plataforma propia, porque no hay plataforma propia de por medio. *Portal abierto con: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/153.0.8010.12 Safari/537.36.*

> «To ensure Bitrix24 runs smoothly, always use the latest version of your browser—Chrome, Edge, Firefox, Safari, or any other browser that supports Green Baseline technologies.»
>
> — https://helpdesk.bitrix24.com/open/25860387/, consultado el 29 de septiembre de 2026


### A.11.3 Puesta en marcha sin perfil técnico especializado
**EspoCRM** · **1** (cumple con reparo) — El fabricante ofrece una imagen oficial de contenedores que deja el sistema, el servidor web y la base de datos funcionando juntos, y un asistente que completa la configuración inicial. La instalación evaluada se llevó de cero a operativa por esa vía. Pero no la completa alguien sin perfil técnico: hay que instalar el motor de contenedores, escribir el archivo que los describe y resolver cómo se conservan los datos entre reinicios, y en esta instalación montar la carpeta equivocada dejó al sistema sin arrancar hasta corregirlo. Son conocimientos puntuales, guiados por la documentación, que la compañía necesita tener a mano cada vez que instala o reinstala.

> «Get EspoCRM running in minutes. The official Docker image sets up EspoCRM, NGINX, and MySQL automatically. No manual server configuration required.»
>
> — https://www.espocrm.com/download/, consultado el 28 de septiembre de 2026

> «4. Run EspoCRM installation wizard»
>
> — https://docs.espocrm.com/administration/installation/, consultado el 28 de septiembre de 2026

   ↳ **Con EspoCRM Cloud Basic** (US$ 15 por usuario por mes, mínimo 3 usuarios, abono recurrente) · **2** (cumple) — En la nube el fabricante entrega el sistema funcionando: no hay nada que instalar.

**Twenty** · **1** (cumple con reparo) — El fabricante ofrece un archivo de contenedores que deja la aplicación, las tareas en segundo plano, la base de datos y la memoria intermedia funcionando juntas, y el primer ingreso guía la creación del espacio de trabajo. La instalación evaluada se llevó de cero a operativa por esa vía. Pero no la completa alguien sin perfil técnico: hay que instalar el motor de contenedores, completar las variables del archivo —claves, dirección pública— y, para usar funciones del producto, cambiar variables de configuración que vienen apagadas: en esta instalación, 2, para conectar casillas de correo de la red propia y para ejecutar el código de los flujos. Son conocimientos puntuales, guiados por la documentación, que la compañía necesita tener a mano cada vez que instala o actualiza. *Variables de configuración cambiadas: LOGIC_FUNCTION_TYPE, OUTBOUND_HTTP_SAFE_MODE_ENABLED.*

> «Set the Postgres Password Update the PG_DATABASE_PASSWORD value in the .env file with a strong password without special characters. PG_DATABASE_PASSWORD=my_strong_password»
>
> — https://docs.twenty.com/developers/self-host/capabilities/docker-compose, consultado el 28 de septiembre de 2026

> «Cloud Pro is $9/user/month (yearly). Organization is $19/user/month and unlocks SSO and row-level permissions for teams that need finer access control.»
>
> — https://twenty.com/pricing, consultado el 28 de septiembre de 2026

   ↳ **Con Twenty Cloud Pro** (US$ 9 por usuario por mes, con pago anual, abono recurrente) · **2** (cumple) — En la nube el fabricante entrega el sistema funcionando: no hay nada que instalar ni configurar.

**Bitrix24** · **2** (cumple) — El alta del portal se completa con un correo y una contraseña, sin instalar nada ni preparar un servidor: el fabricante entrega el sistema funcionando de inmediato, con datos de ejemplo y un asistente inicial. Lo que sigue —crear los campos propios, cargar la cartera— es configuración desde la pantalla, guiada por el propio producto, sin conocimientos de instalación ni de administración de servidores. Lo completa cualquiera que sepa operar un sistema de oficina.

> «¡Sí, lo es! El plan Free es un estado de cuenta predeterminado, en el que se puede agregar un número ilimitado de usuarios y disfrutar de las herramientas disponibles de forma totalmente gratuita durante el tiempo ilimitado. Tenga en cuenta que algunas herramientas como Telefonía y aplicaciones de Bitrix24 Market están disponibles solo en los planes pagos.»
>
> — https://www.bitrix24.es/prices/, consultado el 29 de septiembre de 2026


### A.11.4 Menú y navegabilidad para la operación diaria
**EspoCRM** · **2** (cumple) — Desde el ingreso, el menú lleva directo a asegurados, y de ahí al alta. Guardado el asegurado, la póliza se carga desde su propia ficha, en el panel de sus pólizas, sin salir de ella y ya ligada a él. El recorrido completo pasó por 4 pantallas sin volver sobre ninguna y llevó 21 segundos. La póliza, que es una entidad creada por la compañía, figura en el menú dentro del grupo desplegable; el orden del menú se ajusta desde la administración. *4 pantallas, ninguna revisitada, 21 s.*

**Twenty** · **2** (cumple) — Desde el ingreso, el menú lateral lleva directo a las personas, y el alta se hace en el mismo listado, escribiendo nombre y apellido en una fila nueva. Guardado el asegurado, la póliza se carga desde su propia ficha, en el campo de sus pólizas, escribiendo su número y agregándola: queda creada y ligada a él sin salir de la ficha. El recorrido completo pasó por 2 pantallas sin volver sobre ninguna y llevó 62 segundos. Los objetos propios, como la póliza, aparecen en el mismo menú lateral que los de fábrica. *2 pantallas, ninguna revisitada, 62 s.*

**Bitrix24** · **2** (cumple) — Desde el ingreso, el menú lateral lleva directo al CRM, sobre el listado de negociaciones —que en la edición gratuita, sin entidades propias, hace de cartera de pólizas—, y el botón «Crear» del propio listado abre el formulario de alta en el mismo lugar, sin cambiar de pantalla. El alta se completó en 69 segundos, a través de 3 pantallas, sin volver sobre ninguna. *3 pantallas, 0 revisitadas, 69 s.*


### A.11.5 Aprendizaje sin capacitación previa
**EspoCRM** · **2** (cumple) — Tres agentes independientes, sin conocimiento previo de la plataforma, intentaron sin instrucción las cinco operaciones que un productor repite a diario —dar de alta un asegurado, cargarle una póliza, averiguar qué pólizas de su cartera vencen en los próximos 30 días, registrar un reclamo y agendar un llamado—, operando la pantalla como lo haría una persona. Completaron 15 de las quince, según lo que quedó guardado en el sistema. Los tres completaron las cinco tareas. *15 de 15 tareas completadas.*

**Twenty** · **1** (cumple con reparo) — Tres agentes independientes, sin conocimiento previo de la plataforma, intentaron sin instrucción las cinco operaciones que un productor repite a diario —dar de alta un asegurado, cargarle una póliza, averiguar qué pólizas de su cartera vencen en los próximos 30 días, registrar un reclamo y agendar un llamado—, operando la pantalla como lo haría una persona. Completaron 14 de las quince, según lo que quedó guardado en el sistema. Cada tarea la completó al menos uno, pero la tarea 3 quedó sin completar para el agente 1 (respondió 18; la respuesta correcta es 3), que no supo decir qué le faltó. Que quien no la terminó no sepa decir qué le faltó no impide que otro la complete: el sistema se deja aprender, con un tropiezo que la compañía asume en cada incorporación. *14 de 15 tareas completadas.*

**Bitrix24** · **1** (cumple con reparo) — Tres agentes independientes, sin conocimiento previo de la plataforma, intentaron sin instrucción las cinco operaciones que un productor repite a diario —dar de alta un asegurado, cargarle una póliza, averiguar qué pólizas de su cartera vencen en los próximos 30 días, registrar un reclamo y agendar un llamado—, operando la pantalla como lo haría una persona. Completaron 12 de las quince, según lo que quedó guardado en el sistema. Cada tarea la completó al menos uno, pero la tarea 3 quedó sin completar para el agente 1 (respondió 10; la respuesta correcta es 3), que no supo decir qué le faltó; la tarea 4 quedó sin completar para el agente 3 (ningún registro del reclamo del asegurado (distinto de la póliza, que hable del choque)), que dijo que le faltó «No encontré dónde registrar un reclamo: no hay menú, pipeline ni tipo de actividad de reclamos en el CRM, ni en la ficha del contacto ni en la de la póliza.»; la tarea 5 quedó sin completar para el agente 3 (actividades o tareas guardadas, ninguna vinculada al asegurado para mañana a las 10 (2026-10-01 10:00)), que no supo decir qué le faltó. Que quien no la terminó no sepa decir qué le faltó no impide que otro la complete: el sistema se deja aprender, con un tropiezo que la compañía asume en cada incorporación. *12 de 15 tareas completadas.*


### A.11.6 Localización completa al español, modelo incluido
**EspoCRM** · **1** (cumple con reparo) — El menú principal y la ficha del asegurado están en español, incluidos los campos del modelo y los que agregó la compañía. Queda en inglés la palabra "Ticket" para el caso de atención, que se entiende pero no es la que usa una aseguradora, y algunas traducciones son literales —"Posibles clientes", "Historia" para el registro de actividad—. Fuera del recorrido pedido, en los filtros de fecha la opción que significa "con algún valor" quedó traducida como "Nunca", que dice lo contrario. Se entiende en conjunto, con salvedades que la compañía puede corregir renombrando las etiquetas. *Palabras en inglés en el recorrido: tickets, ticket.*

**Twenty** · **1** (cumple con reparo) — Con el idioma de la interfaz en español, los menús de configuración, los botones y los mensajes están traducidos, pero los objetos y campos que trae el producto quedan con su nombre en inglés: en el menú y en la ficha del asegurado se leen Fields, General, Emails, Phones, Work, Company, Job Title, Social, entre otros. Son nombres que igual se entienden —personas, correos, teléfonos, empresa, cargo— y cada uno se puede renombrar desde el modelo de datos, que admite cambiar el nombre en singular y en plural. Lo que agregó la compañía, como la póliza y sus campos, queda con el nombre que ella le puso. *Nombres en inglés en el recorrido: Fields, General, Emails, Phones, Work, Company, Job Title, Social, Linkedin, System, Creation date, Created by.*

**Bitrix24** · **2** (cumple) — El menú principal y la ficha del contacto están enteramente en español, incluidos los objetos que trae el producto de fábrica. *Menú: Bitrix, Messenger, CoPilot, Feed, Calendario, Documentos, Tableros, Drive, Webmail, Proyectos, Tareas, CRM, Reserva, Gestión del inventario, Marketing, Sitios web y tiendas, Firma electrónica para RR.HH., Firma electrónica, BI Builder, Empleados, Automatización, Market, Recursos para desarrolladores, Base de conocimientos 2., Suscripción · en inglés: ninguno.*


### A.11.7 Cantidad de usuarios sin límite que condicione la operación
**EspoCRM** · **2** (cumple) — La edición evaluada se distribuye bajo una licencia libre que no limita la cantidad de usuarios, y la instalación no impone ningún tope: se dan de alta los que la compañía necesite, sea cual fuere su plantel de productores y de personal administrativo. El único límite es el del equipo donde corre. Los topes que publica el fabricante corresponden a los planes de la nube, que se cobran por usuario.

> «EspoCRM is an open-source project licensed under GNU AGPLv3.»
>
> — https://github.com/espocrm/espocrm, consultado el 28 de septiembre de 2026

**Twenty** · **2** (cumple) — La edición autoalojada es gratuita y se distribuye bajo una licencia libre que no limita la cantidad de usuarios, y la instalación no impone ningún tope: se invitan los que la compañía necesite, sea cual fuere su plantel de productores y de personal administrativo. El único límite es el del equipo donde corre. En la nube se paga por usuario, sin tope de cantidad.

> «The #1 Open-Source CRM»
>
> — https://github.com/twentyhq/twenty, consultado el 28 de septiembre de 2026

> «Host Twenty on your own infrastructure at no cost:»
>
> — https://docs.twenty.com/user-guide/billing/capabilities/pricing-plans, consultado el 28 de septiembre de 2026

**Bitrix24** · **2** (cumple) — El fabricante publica que la edición gratuita admite un número ilimitado de usuarios, sin costo. La compañía puede dar de alta a todo su plantel de productores y personal administrativo sin que la cantidad de usuarios sea una condición que limite la operación.

> «¡Sí, lo es! El plan Free es un estado de cuenta predeterminado, en el que se puede agregar un número ilimitado de usuarios y disfrutar de las herramientas disponibles de forma totalmente gratuita durante el tiempo ilimitado. Tenga en cuenta que algunas herramientas como Telefonía y aplicaciones de Bitrix24 Market están disponibles solo en los planes pagos.»
>
> — https://www.bitrix24.es/prices/, consultado el 29 de septiembre de 2026


### A.11.8 Operación concurrente sobre la misma cartera
**EspoCRM** · **2** (cumple) — Tres usuarios abrieron a la vez la misma póliza y guardaron un cambio cada uno. Tal como viene la entidad creada por la compañía, el sistema aceptó los tres guardados sin advertir el conflicto: quedó "cambio de la sesión 3" y los cambios anteriores se perdieron sin aviso. El producto trae un control de concurrencia que las entidades de atención, ventas y cuentas tienen activado de fábrica, y que en las entidades propias se activa con una casilla de su configuración. Activado, los guardados posteriores recibieron el aviso de que otro usuario había modificado el registro (2 avisos) y nadie pisó el trabajo de otro sin saberlo. La condición se satisface, con la precaución de activar el control en cada entidad propia. *Sin control: quedó «cambio de la sesión 3» sin aviso · con control: 2 avisos.*

**Twenty** · **2** (cumple) — Tres sesiones abrieron a la vez la misma póliza y cambiaron su ramo una detrás de otra, desde la ficha. Quedó el último cambio, Salud. Cada sesión vio aparecer el cambio de la anterior en su pantalla, sin recargar, antes de hacer el suyo: el sistema actualiza en vivo lo que otros modifican, así que nadie pisa el trabajo de otro sin verlo. *Final: Salud · actualización en vivo en las otras sesiones: sí.*

**Bitrix24** · **2** (cumple) — Tres sesiones con la misma cuenta abrieron, una detrás de otra, la misma negociación desde el listado del CRM y cada una cambió su título. Quedó el último cambio, «DOC-CONCURRENCIA-S3». Cada sesión, al abrir el formulario, ya veía el cambio que había dejado la anterior: el listado no guarda una versión vieja del registro entre una apertura y otra. *Título final: DOC-CONCURRENCIA-S3 · cada sesión vio el cambio anterior al abrir: sí.*


### A.11.9 Ecosistema de integraciones disponible
**EspoCRM** · **1** (cumple con reparo) — El catálogo oficial es corto y concentrado en lo que una oficina usa: correo de Outlook y de Google, telefonía, videollamadas, cobros y campañas por correo, más una interfaz de programación y ganchos para conectar lo que falte. Casi todos los conectores se venden aparte, con licencia anual que hay que renovar para seguir usándolos. La condición se satisface: los conectores que la compañía necesita existen y se consiguen directo del fabricante. La limitación es que cada uno suma una licencia renovable, y que fuera del catálogo la integración pasa a ser trabajo propio sobre la interfaz de programación.

> «Outlook Integration»
>
> — https://www.espocrm.com/extensions/, consultado el 28 de septiembre de 2026

> «1.1 Subject to your continuous compliance with the Agreement and payment of the applicable license fees, EspoCRM grants you a non-exclusive, non-transferable, worldwide, limited right to use the Software on a single EspoCRM Application instance on a single server for the Licensed Period. After the license period expires, you must renew or purchase a new license to continue using the Software. You may use or modify the Software only for your own internal business purposes or for non-commercial or personal use.»
>
> — https://www.espocrm.com/extension-license-agreement/, consultado el 28 de septiembre de 2026

**Twenty** · **1** (cumple con reparo) — El producto se conecta de fábrica con el correo y el calendario de Google y de Microsoft, y con cualquier casilla por IMAP. Más allá de eso no hay un catálogo de conectores: la sección de aplicaciones ofrece muy pocas, y las aplicaciones son paquetes de código que se desarrollan con el kit del fabricante. Lo que sí trae es la vía para integrar lo que falte —interfaces de programación, avisos a otros sistemas ante cada cambio y un servidor para asistentes de inteligencia artificial—, todo sin costo. La condición se satisface con una limitación: fuera del correo y el calendario, cada integración es trabajo propio.

> «Twenty apps are TypeScript packages that extend your workspace with custom objects, logic, UI components, and AI capabilities. They run on the Twenty platform with full sandboxing and permission controls.»
>
> — https://docs.twenty.com/developers/extend/apps/getting-started/concepts, consultado el 28 de septiembre de 2026

> «Get notified when records change — HTTP POST to your endpoint on every create, update, or delete.»
>
> — https://docs.twenty.com/developers/extend/webhooks, consultado el 28 de septiembre de 2026

**Bitrix24** · **1** (cumple con reparo) — El fabricante publica un catálogo de más de 810 aplicaciones e integraciones —telefonía, firma electrónica, mensajería, conectores con otros sistemas—, accesible desde Market en el propio portal. Pero instalar aplicaciones del catálogo es una función de los planes pagos, según la misma página que anuncia la edición gratuita: el catálogo se puede evaluar sin costo, pero usarlo exige pagar, incluso para un conector puntual.

> «Ver más de 810+ aplicaciones e integraciones»
>
> — https://www.bitrix24.es/apps/, consultado el 29 de septiembre de 2026

> «¡Sí, lo es! El plan Free es un estado de cuenta predeterminado, en el que se puede agregar un número ilimitado de usuarios y disfrutar de las herramientas disponibles de forma totalmente gratuita durante el tiempo ilimitado. Tenga en cuenta que algunas herramientas como Telefonía y aplicaciones de Bitrix24 Market están disponibles solo en los planes pagos.»
>
> — https://www.bitrix24.es/prices/, consultado el 29 de septiembre de 2026

> «Basic Ideal para emprendedores individuales y equipos pequeños que están empezando US$ 69 US$ 69 US$ 49 / compañía / mes / facturado mensualmente / compañía / mes / facturación anual Un pago de US$ 588 / año Ahorra US$ 240 al año incluye 5 usuarios Comprar Comprar Todo lo incluido en Free, más: Almacenamiento de 24 GB IA para el trabajo diario en Bitrix24 Embudos de ventas Negociaciones recurrentes Pagos en línea Integración de correo electrónico Integración de WhatsApp Integración de telefonía»
>
> — https://www.bitrix24.es/prices/, consultado el 29 de septiembre de 2026

   ↳ **Con Bitrix24 Basic** (US$ 69 por mes, hasta 5 usuarios, abono recurrente) · **2** (cumple) — Con el plan de entrada, la instalación de aplicaciones del catálogo queda habilitada.


### A.11.10 Documentación en español
**EspoCRM** · **1** (cumple con reparo) — La interfaz del sistema está en español, pero la documentación oficial está publicada solo en inglés: el sitio de documentación no ofrece selector de idioma ni versión en español. La necesidad se cubre con reparo: quien la consulte lo hace en inglés o con traducción automática del navegador, que es un procedimiento que se repite en cada consulta y que en la terminología técnica puede inducir a error.

> «It's recommended to upgrade whenever the new version is out. If you skip a few minor or major versions before deciding to upgrade, it's more likely that the upgrade will run unsmoothly. For minor or major releases it may be reasonable to wait for a few days before upgrading, as a very fresh release is likely to have yet undiscovered bugs.»
>
> — https://docs.espocrm.com/administration/upgrading/, consultado el 28 de septiembre de 2026

**Twenty** · **2** (cumple) — La documentación oficial se publica también en español: la guía de usuario y las páginas de configuración tienen su versión traducida, con el mismo contenido y la misma estructura que la original en inglés. Quien consulte cómo se usa o se configura el sistema lo hace en su idioma.

> «Controla el acceso a objetos, campos y ajustes con permisos basados en roles.»
>
> — https://docs.twenty.com/es/user-guide/permissions-access/capabilities/permissions, consultado el 28 de septiembre de 2026

**Bitrix24** · **2** (cumple) — El fabricante publica su centro de documentación completo en español, en un dominio propio —helpdesk.bitrix24.es—, con el mismo contenido y la misma organización por tema que la versión en inglés. Quien consulta cómo se usa o se configura el sistema lo hace en su idioma, sin depender de una traducción de terceros.

> «Todos los cursos de formación y documentación»
>
> — https://helpdesk.bitrix24.es/documentation.php, consultado el 29 de septiembre de 2026


### A.11.11 Material de capacitación para el usuario final
**EspoCRM** · **2** (cumple) — El fabricante publica una colección de videos de acceso libre que incluye material para quien opera el sistema y no solo para quien lo administra: cuentas, contactos, prospectos, seguimiento de oportunidades, calendario y actividades, importación y exportación de datos, impresión y reportes. Cubre las operaciones que un productor o un administrativo repiten a diario.

> «Opportunity Tracking»
>
> — https://www.espocrm.com/video/, consultado el 28 de septiembre de 2026

> «Calendar and Activities»
>
> — https://www.espocrm.com/video/, consultado el 28 de septiembre de 2026

**Twenty** · **2** (cumple) — El fabricante publica una guía de usuario de acceso libre, separada de la documentación para desarrolladores, con más de cien páginas: qué hace cada función y guías paso a paso para las tareas de todos los días —importar contactos, trabajar el correo y el calendario, armar vistas, tableros y flujos—. Está dirigida a quien opera el sistema, y está también en español.

> «Complete step-by-step guide to importing people/contacts into Twenty.»
>
> — https://docs.twenty.com/user-guide/data-migration/how-tos/import-contacts-via-csv, consultado el 28 de septiembre de 2026

> «Contact Auto-Creation»
>
> — https://docs.twenty.com/user-guide/calendar-emails/overview, consultado el 28 de septiembre de 2026

**Bitrix24** · **2** (cumple) — El fabricante reúne en un mismo centro los cursos y la documentación de uso diario —CRM, tareas, mensajería, calendario—, con artículos paso a paso y videos, separados de la documentación de la interfaz de programación. Está dirigido a quien opera el sistema todos los días, no solo a quien lo administra, y está publicado en español.

> «Todos los cursos de formación y documentación»
>
> — https://helpdesk.bitrix24.es/documentation.php, consultado el 29 de septiembre de 2026

> «Bitrix24 Helpdesk»
>
> — https://helpdesk.bitrix24.es/open/20616588/, consultado el 29 de septiembre de 2026


### A.11.12 Comunidad activa de usuarios
**EspoCRM** · **1** (cumple con reparo) — Se tomaron las 21 consultas más recientes de la sección de uso general del foro oficial que ya tenían más de una semana de publicadas. En 9 otro usuario respondió dentro de la semana y quien consultó confirmó después que la respuesta le había servido; en 12 hubo respuesta, pero llegó más tarde o sin que el autor confirmara que lo resolvía; ninguna quedó sin respuesta. La primera respuesta llegó, en el caso típico, a la hora. La consulta típica recibe respuesta, pero no queda constancia de que se resuelva dentro de la semana: la compañía puede contar con que alguien conteste, no con que la conteste a tiempo y a su medida. *9 resueltas en la semana · 12 con respuesta tardía o sin confirmar · 0 sin respuesta · primera respuesta típica a la hora.*

> «Without modifying the code, you can: - completely remove the Billing Address from the layout; - change the display order of the country, street, etc., under Administration > Settings > Address Format; - if you need to "remove" the State from the address field, simply leave it blank.»
>
> — https://forum.espocrm.com/forum/general/128009-change-billing-address-field, consultado el 28 de septiembre de 2026

> «This topic has been discussed at least twice on this forum. You can find the solution to the current problem at this link: https://forum.espocrm.com/forum/gene...152#post117152. Although it refers to the Opportunity entity, the process is exactly the same for the Lead entity.»
>
> — https://forum.espocrm.com/forum/general/128002-activities-history-tasks-disappeared-from-lead-side-panel, consultado el 28 de septiembre de 2026

> «Create an entity with Person type, and those fields will be there by default.»
>
> — https://forum.espocrm.com/forum/general/127998-create-a-field-like-person-name, consultado el 28 de septiembre de 2026

> «Have you tried the layout for the entity documents? Look for Liste and Liste (klein)»
>
> — https://forum.espocrm.com/forum/general/127989-name-of-documents-not-shown-in-accounts-and-opportunities, consultado el 28 de septiembre de 2026

> «For a reason. Because the inline edit will break field dependency logic.»
>
> — https://forum.espocrm.com/forum/general/127958-why-no-inline-edit-to-change-the-pipeline, consultado el 28 de septiembre de 2026

> «Hi, I'm not sure if I understood correctly. If it's about the columns should be swapped, then it's an intended order. It matches the link type, e.g, one-to-many, the one is at the left, the many at the right. IIRC, it used to be flipped and users tended to confuse, after we changed to the current…»
>
> — https://forum.espocrm.com/forum/general/127951-entity-manager-relationships-create-link-panel-form-fields-mixed-up, consultado el 28 de septiembre de 2026

> «We've done some implementations of EspoCRM for our clients. On of them was working in project base mode, so we've recommended to purchase a Project Management pack from EspoCRM & we've created separate entity for calculating the costs of the project. Additionally we've installed him our Time…»
>
> — https://forum.espocrm.com/forum/general/127945-long-term-projects-billable-hours-and-invoicing, consultado el 28 de septiembre de 2026

> «ciryaj, Please describe in more detail what you are trying to do. At first glance there are two problems: 1. There is a difference between cellphoneIds and cellphonIds -- the letter "e" is missing. 2. "$i = $i + 1" should be inside a while.»
>
> — https://forum.espocrm.com/forum/general/127914-syntax-error-with-while, consultado el 28 de septiembre de 2026

> «Greetings Daniel, The collaborator feature is not available for the Meetings entity since a similar User Attendees feature is already present there. In any other cases, collaborators' functionality would lead to unexpected behavior in the Meeting entity.»
>
> — https://forum.espocrm.com/forum/general/127902-collaborators-option-missing-in-meetings, consultado el 28 de septiembre de 2026

> «I had that issue before, but now it's fine. I'm working now on edge.»
>
> — https://forum.espocrm.com/forum/general/127897-login-problems, consultado el 28 de septiembre de 2026

> «Text search - EspoCRM Documentation https://docs.espocrm.com/user-guide/text-search/#full-text-search»
>
> — https://forum.espocrm.com/forum/general/127875-search-by-contact-name, consultado el 28 de septiembre de 2026

> «Hi Michael, Having a custom role level (on top of the existing all, account, contact, own, no) is not trivial. I think there's no future-proof way to extend it. It's worth to consider re-purposning the 'account' level while a custom access control logic will take into account the account type (of…»
>
> — https://forum.espocrm.com/forum/general/127872-extending-permission-schema-for-portal-roles, consultado el 28 de septiembre de 2026

> «Greetings, This functionality is intended, and you can change the general Label view for entire instance in Administration > Label Manager > Global. ​​»
>
> — https://forum.espocrm.com/forum/general/127821-error-in-activity-email-call-meeting-displayed-titles, consultado el 28 de septiembre de 2026

> «As Contact Name, Phone and Email are not direct Opportunity fields and belong to the linked Contact record. The safest approach is normally a two-step import: 1. Import the Contacts first, using a unique value such as the email address or an external ID. 2. Import the Opportunities afterward and…»
>
> — https://forum.espocrm.com/forum/general/127818-does-not-import-all-fields, consultado el 28 de septiembre de 2026

> «In this case I would recommend considering the Join Grid Reports functionality. However, the main issue that I see here is where to properly store aggregate values so they can be calculated further (or calculated values already so they can be used in the target Report). The easiest but definitely…»
>
> — https://forum.espocrm.com/forum/general/127791-percentage-report, consultado el 28 de septiembre de 2026

> «Hi, Currently, when an email falls to a group folder it receives only the group folder team(s) but it's not associated with all team members. It was planned to change it so that it is also associated with team members, and also unassociated when the email is moved out from the group folder. As a…»
>
> — https://forum.espocrm.com/forum/general/127760-content-of-group-inbox-not-visible-for-team-members, consultado el 28 de septiembre de 2026

> «Please describe in more detail what result you are trying to achieve.»
>
> — https://forum.espocrm.com/forum/general/127721-how-to-configure-email-access-for-different-users, consultado el 28 de septiembre de 2026

> «Hi Terry, Technically, everything a user can do via the UI can be done via the API. While there might be no single endpoint for a particular task, one can combine a few requests to achieve what is needed. For invoice email sending, it's two requests: - Prepare attributes for an email, with a POST…»
>
> — https://forum.espocrm.com/forum/general/127705-api-ability-to-send-pfd-invoices-via-email, consultado el 28 de septiembre de 2026

> «This documentation article describes AWS as an alternative to storing ALL attachments instead of the data/upload directory.»
>
> — https://forum.espocrm.com/forum/general/127704-upload-file-attachments-to-aws-s3-storage, consultado el 28 de septiembre de 2026

> «You can create your tax profiles and in the Entity Manager>Quote>Tax Profile - Select the Created Tax Profile as the Default one. Repeat the same in the Entity Manager for Sales Order, Invoice, and other Purchase Entities»
>
> — https://forum.espocrm.com/forum/general/127688-taxcode-by-default, consultado el 28 de septiembre de 2026

> «It's an expected behavior. Default value for link field shows ID · Issue #3302 · espocrm/espocrm https://github.com/espocrm/espocrm/issues/3302 Describe the bug I created a custom entity called CTimeOff. One of the fields is a Many-to-One relationship with Accounts. When creating a new CTimeOff…»
>
> — https://forum.espocrm.com/forum/general/127670-account-field-displays-id-instead-of-account-name-when-creating-a-case-from-portal, consultado el 28 de septiembre de 2026

**Twenty** · **1** (cumple con reparo) — El canal de la comunidad que ofrece el fabricante es un servidor de chat que solo se lee con cuenta, así que la medición se hizo sobre lo que la comunidad publica abierto: las discusiones del repositorio oficial. Se tomaron las 21 consultas más recientes con más de una semana, que alcanzan hasta 2025-09-04. En 1 otro usuario respondió dentro de la semana y quien consultó confirmó después que la respuesta le había servido; en 16 hubo respuesta, pero llegó más tarde o sin que el autor confirmara que lo resolvía; 4 no recibieron respuesta. La primera respuesta llegó, en el caso típico, a las 30 horas. La consulta típica recibe respuesta, pero no queda constancia de que se resuelva dentro de la semana: la compañía puede contar con que alguien conteste, no con que la conteste a tiempo y a su medida. *1 resueltas en la semana · 16 con respuesta tardía o sin confirmar · 4 sin respuesta · primera respuesta típica a las 30 horas.*

> «Community support via Discord»
>
> — https://docs.twenty.com/user-guide/billing/capabilities/pricing-plans, consultado el 28 de septiembre de 2026

> «Thank you for such detailed report! CC: @prastoin»
>
> — https://github.com/twentyhq/twenty/discussions/25802, consultado el 28 de septiembre de 2026

> «@neo773»
>
> — https://github.com/twentyhq/twenty/discussions/25319, consultado el 28 de septiembre de 2026

> «Issue has been created based on this discussion #25193»
>
> — https://github.com/twentyhq/twenty/discussions/25185, consultado el 28 de septiembre de 2026

> «@Weiko this is about override. Solutions: add a defineDefaultTabToFocusOnMobileAndSidePanelUniversalIdentifier boolean key in definePageLayoutTab definePageLayoutOverride that just update the defaultTabToFocusOnMobileAndSidePanelUniversalIdentifier of the existing standard tab What do you think?»
>
> — https://github.com/twentyhq/twenty/discussions/23388, consultado el 28 de septiembre de 2026

> «Scope & Context Many organisations use separate email domains for different teams, subsidiaries, or departments. Twenty currently treats only the connected mailbox’s primary domain as internal. Current behavior Internal emails are excluded when all participants share the connected mailbox’s domain.…»
>
> — https://github.com/twentyhq/twenty/discussions/23368, consultado el 28 de septiembre de 2026

> «The contents of this feature request applies to both select and multi select field types. Scope & Context Consider these two scenarios: I want to add a tags fields to Persons as multi select field. I want my users to freely create new options so that they can use them to filter views. However, I do…»
>
> — https://github.com/twentyhq/twenty/discussions/23345, consultado el 28 de septiembre de 2026

> «@hubyhuby if this record is soft-deleted, it's still counted when checking for uniqueness as it can be restored»
>
> — https://github.com/twentyhq/twenty/discussions/22954, consultado el 28 de septiembre de 2026

> «@martmull or @bosiraphael»
>
> — https://github.com/twentyhq/twenty/discussions/22382, consultado el 28 de septiembre de 2026

> «@hubyhuby yes, you need to add a relation to Workspace members, however, limiting access to only notes you own (called row level security) is behind an Organization license»
>
> — https://github.com/twentyhq/twenty/discussions/22298, consultado el 28 de septiembre de 2026

> «Hi @adamleigh87-gif, could you please reach out to us via Discord if you're self-hosted or via support chat if you're using cloud?»
>
> — https://github.com/twentyhq/twenty/discussions/20559, consultado el 28 de septiembre de 2026

> «@chrcha26 what are exact steps to reproduce this issue? There is no IS operand on front that user can actually use with custom value, do you mean "is empty" filter?»
>
> — https://github.com/twentyhq/twenty/discussions/20175, consultado el 28 de septiembre de 2026

> «Thanks for the idea! I agree this would add value»
>
> — https://github.com/twentyhq/twenty/discussions/20002, consultado el 28 de septiembre de 2026

> «This is a known limitation with Cloudflare's free tier SSL. Free plans only cover *.example.com (one level of wildcard), so app.crm.company.com (fourth level) won't get a valid certificate. Here are a few solutions: Option 1: Disable multi-workspace mode If you only need a single workspace, set…»
>
> — https://github.com/twentyhq/twenty/discussions/18476, consultado el 28 de septiembre de 2026

> «That's because Twenty treats the mail account as source of truth so if in mail account email is deleted, then upon synchronization it deletes too (messaging-message-list-fetch-service.ts for reference) so that's expected, when it comes to archived messages, it needs research how they're actually…»
>
> — https://github.com/twentyhq/twenty/discussions/17581, consultado el 28 de septiembre de 2026

> «You either have to wait for twentyhq/core-team-issues#214 or create a workflow/app which connects task with company based on details of task-related opportunity»
>
> — https://github.com/twentyhq/twenty/discussions/17461, consultado el 28 de septiembre de 2026

> «hey guys is this still active ? I want to ask why there is no gantt chart support ? I don't see it in roadmap/feature request (only this discussion), but every CRM or simple PM apps out there have gantt chart. Thank you so much for reading this because I love this app so much, but I still can't…»
>
> — https://github.com/twentyhq/twenty/discussions/17030, consultado el 28 de septiembre de 2026

> «Got this after upgrade 1.7 -> latest, any one face same, any easy fix? Thanks a lot. [Nest] 34 - 10/22/2025, 1:36:00 PM LOG [BullMQDriver] Processing job repeat:CronTriggerCronJob:1761140160000 with name CronTriggerCronJob on queue cron-queue query failed: SELECT "CronTrigger"."id" AS…»
>
> — https://github.com/twentyhq/twenty/discussions/15262, consultado el 28 de septiembre de 2026

> «@neo773 do you know if whitelist for email sync is planned by any chance?»
>
> — https://github.com/twentyhq/twenty/discussions/15018, consultado el 28 de septiembre de 2026

> «It's planned for next quarter twentyhq/core-team-issues#213»
>
> — https://github.com/twentyhq/twenty/discussions/14687, consultado el 28 de septiembre de 2026

> «Related to #16182»
>
> — https://github.com/twentyhq/twenty/discussions/14682, consultado el 28 de septiembre de 2026

> «Hi there, I'm trying to update the people table based on the output of a script workflow. My script looks like that: export const main = async (params: { inscription: Array<string>; }): Promise<object> => { const { inscription } = params; const newInscription = [...new Set([...inscription,…»
>
> — https://github.com/twentyhq/twenty/discussions/14302, consultado el 28 de septiembre de 2026

**Bitrix24** · **0** (no cumple) — El foro oficial público del fabricante está en ruso (dev.1c-bitrix.ru, subforo de Bitrix24), y la comunidad de la nube conversa en un espacio que exige cuenta para leer, así que la medición se hizo sobre el foro ruso; su muestra mezcla consultas de la instalación propia con las de la nube. Se tomaron las 21 consultas más recientes, sin los temas fijados, con más de una semana, que alcanzan hasta 2026-04-22. En 0 otro usuario respondió dentro de la semana y quien consultó confirmó después que la respuesta le había servido; en 5 hubo respuesta, pero llegó más tarde o sin que el autor confirmara que lo resolvía; 16 no recibieron respuesta. La primera respuesta llegó, en el caso típico, a las 44 horas. La consulta típica queda sin respuesta: la compañía no puede contar con la comunidad para resolver un problema de configuración. *0 resueltas en la semana · 5 con respuesta tardía o sin confirmar · 16 sin respuesta · primera respuesta típica a las 44 horas.*

> «Всем добрый день. Поставил Битрикс24 26.150.0 на BitrixVM (VMWare 17 Player)Захотел создать CRM форму. Захожу в раздел CRM формы (http://192.168.138.128/crm/webform/) Жму кнопку "Добавить" и почему то появляется раздел, где написано "Форма не найдена. Обратитесь к администратору…»
>
> — https://dev.1c-bitrix.ru/community/forums/forum23/topic164572/, consultado el 30 de septiembre de 2026

> «Мой облачный портал заблокирован из-за инструмента Потоки, который я тестировал. При использовании функционала система не предупредила меня, что после тестирования я потеряю доступ ко всему порталу и не смогу самостоятельно отключить этот инструмент. Сейчас я физически не могу выполнить инструкции…»
>
> — https://dev.1c-bitrix.ru/community/forums/forum23/topic164568/, consultado el 30 de septiembre de 2026

> «Всем привет!Есть проблема. В шаблоне компонента iblock.element.add.form отображаются поля для редактирования элемента инфоблока.Я хочу сделать так, чтоб по клику на кнопку подгружалась бы дополнительная информация по элементу инфоблока, и чтоб эта дополнительная информация отображалась бы в боковой…»
>
> — https://dev.1c-bitrix.ru/community/forums/forum23/topic164512/, consultado el 30 de septiembre de 2026

> «После обновления исчезла возможность при формировании шаблона регулярной задачи задавать в настройках опцию "Проконтролировать задачу после завершения".Регулярные задачи после завершения их исполнителем не становятся на контроль постановщику, много задач уходит из фокуса внимания, так как…»
>
> — https://dev.1c-bitrix.ru/community/forums/forum23/topic164360/, consultado el 30 de septiembre de 2026

> «При создании нового элемента можно передать пользовательские поля и они поддянутся, но вот с полями привязки к элементам смарта такое не работает.Что нужно передать?UF_NAC_GUID строковое -- отработает. (списки, числа работают)UF_LINK -- привязка к элементам смарта. не…»
>
> — https://dev.1c-bitrix.ru/community/forums/forum23/topic164358/, consultado el 30 de septiembre de 2026

> «Добрый день!Создаю лид используя CRest из Битрикс CMS в Битрикс24.В Б24 имеется пользовательское поле UF_CRM_XXXXXXXXXXX типа файл множественное. Лид создается, но кириллические имена файлов в лиде выглядят, как кракозябры. Константа C_REST_CURRENT_ENCODING в файле settings.php (пакета CRest) не…»
>
> — https://dev.1c-bitrix.ru/community/forums/forum23/topic164332/, consultado el 30 de septiembre de 2026

> «Вчера вечером обновлял наш портал, сегодня утром посыпались вопросы от сотрудников:1. Не работает прямой переход в чат из правой колонки2. Телефония не работает - из карточки клиента/компании при нажатии на кнопку звонка появляется такое сообщение3. В чате при выборе кнопки "Переслать" не работает…»
>
> — https://dev.1c-bitrix.ru/community/forums/forum23/topic164324/, consultado el 30 de septiembre de 2026

> «Добрый деньМного лет централизованно обновляли Windows версию Битрикс24 через установку exe приложения с ключом /SПри установке обычно закрывалось открытое приложение и устанавливалось новое приложение.Начиная с новой версии 23_0_32_91 при запуске с ключом /S ничего не происходит.Запускается…»
>
> — https://dev.1c-bitrix.ru/community/forums/forum23/topic164322/, consultado el 30 de septiembre de 2026

> «Зайдите в /home/bitrix/www/index.php - у вас, похоже, обрезана index-страница.»
>
> — https://dev.1c-bitrix.ru/community/forums/forum23/topic164306/, consultado el 30 de septiembre de 2026

> «А свой модуль подключили перед этим?»
>
> — https://dev.1c-bitrix.ru/community/forums/forum23/topic164298/, consultado el 30 de septiembre de 2026

> «Добрый день, поковырялся в новых компонентах задач на BitrixVue3, чтобы кастомизировать новую карточку, можно использовать вот этот инструментарий.https://apidocs.bitrix24.ru/api-reference/widgets/task/view-tab.htmlЭто если есть возможность использовать REST. Для нашей коробки же документации…»
>
> — https://dev.1c-bitrix.ru/community/forums/forum23/topic164280/, consultado el 30 de septiembre de 2026

> «Присоединяюсь, у нас таже проблема»
>
> — https://dev.1c-bitrix.ru/community/forums/forum23/topic164266/, consultado el 30 de septiembre de 2026

> «Добрый день! Кто-нибудь в курсе, в этой форме вставки значения в поле активити в дизайнере БП Автор и Руководитель - это кто?Контекст - CRM, сделкаНапрашивается, что Автор - это либо создатель сделки, либо ответственный, либо тот, кто запустил БП, и это могут быть разные люди. Соответственно, и…»
>
> — https://dev.1c-bitrix.ru/community/forums/forum23/topic164244/, consultado el 30 de septiembre de 2026

> «Всем привет! Подскажите, может кто сталкивался: нужно каким то образом сделать массовое редактирование задач в Битрикс24.Например я выделил в общем списке задач только 2 задачи, и хочу им проставить какой-либо тег.Сейчас я могу проставить теги только открывая каждую задачу, и отдельно внутри задачи…»
>
> — https://dev.1c-bitrix.ru/community/forums/forum23/topic164218/, consultado el 30 de septiembre de 2026

> «Здравствуйте! Возникла следующая проблема:#11) Сделана резервная копия штатными средствами Битрикс24 из административной панели (на BitrixVM 7.5.5, Версия PHP 8.2.30, Версия MySQL 8.0.45, Версия Модуль "Ядро" (main) 26.150.0)2) Развернута ВМ BitrixVM 9.0.9, смена hostname и ip (отличное от BitrixVM…»
>
> — https://dev.1c-bitrix.ru/community/forums/forum23/topic164150/, consultado el 30 de septiembre de 2026

> «Всем привет!Подскажите, как правильно восстанавливать битрикс-проекты из резервной копии, которая была сделана не штатными средствами битрикс, а вручную?Мне скинули 2 архива: в одном - файловая структура, а в другом - база данных.Я использую OpenServer 6.4.6 и MySQL-8.4Создал в нём новый проект,…»
>
> — https://dev.1c-bitrix.ru/community/forums/forum23/topic164108/, consultado el 30 de septiembre de 2026

> «Добрый день. В коробочной версии Битрикс в какой-то момент задублировались поля (2 раза повторяется строчное поле "Комментарий УГМ"). Одно из них переименовали в "Комментарий УГМ1". Сейчас периодически возникает проблема с тем, что в карточке одно из этих полей (то одно, то другое) неактивно, то…»
>
> — https://dev.1c-bitrix.ru/community/forums/forum23/topic164098/, consultado el 30 de septiembre de 2026

> «Может отдельно элементы и отдельно свойства типа такогоCIBlockElement::GetProperty( $id_block, $id, Array(), Array("PROPERTY_UL_FULL_NAME") );»
>
> — https://dev.1c-bitrix.ru/community/forums/forum23/topic164090/, consultado el 30 de septiembre de 2026

> «Столкнулись с проблемой синхронизации пользователей по фильтру. Нужно выгружать пользователей в б42 из конкретных контейнеров, а из других игнорировать. Со стандартным фильтром (&(objectClass=user)(objectCategory=person)) все отрабатывает, но он забирает всех пользователей из AD. Долго не могли…»
>
> — https://dev.1c-bitrix.ru/community/forums/forum23/topic164070/, consultado el 30 de septiembre de 2026

> «Добрый день!Столкнулся с такой проблемой:Битрикс. Коробочная версия.Создаю бизнес-процесс, который создает смарт-процесс из сделки.при заполнении поля Сделка = {{ID}} (что должно связать сделку с СП) после нажатия сохранения происходит "загрузка". Так "крутит" очень очень долго и в итоге ничего не…»
>
> — https://dev.1c-bitrix.ru/community/forums/forum23/topic164064/, consultado el 30 de septiembre de 2026

> «Всем привет. Есть метод, который ищет элементы инфоблока:Кодfunction getList($iblockId, $properties, $filter, $nav, $navParams, $sort) { unset($filter['PRESET_ID']); unset($filter['FILTER_ID']); unset($filter['FILTER_APPLIED']); unset($filter['FIND']); $filter['IBLOCK_ID'] = $iblockId;…»
>
> — https://dev.1c-bitrix.ru/community/forums/forum23/topic164062/, consultado el 30 de septiembre de 2026


### A.11.13 Soporte técnico con compromiso de respuesta
**EspoCRM** · **0** (no cumple) — La oferta de soporte del fabricante tiene tres canales y ninguno compromete un plazo: la asistencia paga se cobra por hora y se presta por correo, web y teléfono sin tiempo de respuesta garantizado; el servicio en la nube declara una cobertura de doce horas cinco días a la semana, que es un horario de atención y no un plazo; y el soporte gratuito es el foro de la comunidad. La condición que la compañía necesita —saber en cuánto tiempo le van a responder cuando el sistema falle— no la ofrece ninguna modalidad.

> «Our hourly support rate is in range of $50 – $100. We primarily assist via email, web and voice call. We help to resolve problems, assist with maintenance and guide with implementing business processes.»
>
> — https://www.espocrm.com/support/, consultado el 28 de septiembre de 2026

> «We provide 12×5 (hours/days) support via emails and Customer Portal. The scope of support covers functionalities that can be achieved through the user interface of EspoCRM. Designing business processes lies outside of the scope of support. We only advice about ways to implement them.»
>
> — https://www.espocrm.com/support/, consultado el 28 de septiembre de 2026

> «Get free technical support from EspoCRM users and our developers. Post your questions on our Community Forum.»
>
> — https://www.espocrm.com/support/, consultado el 28 de septiembre de 2026

**Twenty** · **0** (no cumple) — La oferta de soporte del fabricante tiene tres niveles y ninguno compromete un plazo: la edición gratuita se apoya en la comunidad, en su servidor de chat; el plan Organization en la nube agrega soporte prioritario, y en la instalación propia, soporte del equipo del fabricante, sin que ninguno declare en cuánto tiempo responde. La condición que la compañía necesita —saber en cuánto tiempo le van a responder cuando el sistema falle— no la ofrece ninguna modalidad publicada.

> «Community support via Discord»
>
> — https://docs.twenty.com/user-guide/billing/capabilities/pricing-plans, consultado el 28 de septiembre de 2026

> «Priority support»
>
> — https://docs.twenty.com/user-guide/billing/capabilities/pricing-plans, consultado el 28 de septiembre de 2026

> «Twenty team support»
>
> — https://docs.twenty.com/user-guide/billing/capabilities/pricing-plans, consultado el 28 de septiembre de 2026

**Bitrix24** · **1** (cumple con reparo) — El fabricante publica un acuerdo de nivel de servicio con plazos de respuesta por severidad del incidente —una hora, veinticuatro horas o setenta y dos horas—, pero ese compromiso cubre las caídas de la plataforma, no una consulta puntual de una compañía sobre su cuenta: el soporte personalizado, por chat o por ticket, queda reservado a los planes pagos, y la edición gratuita se apoya en la documentación y en la comunidad. La condición se satisface parcialmente: existe un compromiso público de plazo, pero no alcanza el tipo de consulta que un productor o un administrador hace en el día a día.

> «1 hour»
>
> — https://www.bitrix24.com/privacy/sla.php, consultado el 29 de septiembre de 2026

> «2.1. Bitrix24 Helpdesk provides 99.5% uptime commitment for support services. Bitrix24 support channels are available 24 hours per day, 7 days a week, 365 days a year. Tier 2 specialists are available between 6 a.m and 4 p.m UTC on business days. Issues should be reported to Bitrix24 through any of the support channels. Support team will respond according to the response time set forth in the table below:»
>
> — https://www.bitrix24.com/privacy/sla.php, consultado el 29 de septiembre de 2026

> «72 hours»
>
> — https://www.bitrix24.com/privacy/sla.php, consultado el 29 de septiembre de 2026


### A.11.14 Continuidad de las versiones en uso
**EspoCRM** · **0** (no cumple) — El fabricante no publica por cuánto tiempo corrige una versión: no hay política de soporte por versión ni versiones de soporte extendido. Lo que la documentación oficial indica es actualizar apenas sale una versión nueva, lo que equivale a sostener solo la última. La compañía no puede fijar la actualización en su plan anual: tiene que seguir el ritmo del fabricante para seguir recibiendo correcciones.

> «It's recommended to upgrade whenever the new version is out. If you skip a few minor or major versions before deciding to upgrade, it's more likely that the upgrade will run unsmoothly. For minor or major releases it may be reasonable to wait for a few days before upgrading, as a very fresh release is likely to have yet undiscovered bugs.»
>
> — https://docs.espocrm.com/administration/upgrading/, consultado el 28 de septiembre de 2026

**Twenty** · **0** (no cumple) — El fabricante no publica por cuánto tiempo corrige una versión: no hay política de soporte por versión ni versiones de soporte extendido. Publica versiones nuevas a un ritmo de 14.7 por mes, y la guía de actualización lo que asegura es poder saltar desde cualquier versión soportada directo a la última. La compañía no puede fijar la actualización en su plan anual: tiene que seguir el ritmo del fabricante para recibir correcciones. *30 versiones publicadas en 61 días.*

> «Starting from v1.23, Twenty supports cross-version upgrades. You can jump directly from any supported version to the latest release without stepping through each intermediate version.»
>
> — https://docs.twenty.com/developers/self-host/capabilities/upgrade-guide, consultado el 28 de septiembre de 2026

**Bitrix24** · **0** (no cumple) — La edición evaluada es un servicio en la nube de versión única: no hay "versiones" que la compañía elija sostener, porque el fabricante actualiza el portal de todos sus clientes a la vez y sin aviso previo, según sus propias condiciones de servicio. El fabricante no publica ningún compromiso de por cuánto tiempo una función o un comportamiento se mantienen estables: la compañía no puede planificar su propia actualización porque no la controla, y un cambio de comportamiento puede llegar en cualquier momento del ejercicio.

> «1.4. The terms of this Agreement may be updated by Alaio from time to time without notice. In case of the major changes, you will be provided with advance notification of the changes through a prominent notice within the Service and/or by email communication as set forth in section 34. Contact information. Contracting Entity. The amended Terms of Service will take effect upon the date mentioned above on the top of this page, unless otherwise provided in a notification to you. Please check these Terms of Service periodically for changes. Failure to provide or maintain accurate or current contact information by you will not obviate your responsibility to comply with these Terms of Service, as amended from time to time. If you do not agree to any changes to these Terms of Service, you must discontinue using any our services and Products and no longer access the Website. Your continued use of the Website, the Services, and the Products indicates your agreement to the changes. The version of these Terms of Service currently published at https://www.bitrix24.com/terms/ constitutes the binding and governing agreement applicable to all users at any given time.»
>
> — https://www.bitrix24.com/terms/, consultado el 29 de septiembre de 2026


## B.1 Condiciones que impone el negocio asegurador

### B.1.1 Persistencia de los datos sin uso continuo
**EspoCRM** · **2** (cumple) — En la instalación propia los datos quedan en el servidor de la compañía y no dependen de ninguna cuenta del fabricante: no hay condición de servicio que los afecte por falta de uso, porque no hay servicio de por medio. Una póliza puede quedar años sin que nadie la abra y sigue ahí mientras el equipo donde corre el sistema se mantenga.

> «Self-hosted (on-premise) — You install the software and have all the data stored on your own server. All the server maintenance, as well as data security, will be your responsibility.»
>
> — https://www.espocrm.com/self-hosted-vs-cloud-crm/, consultado el 28 de septiembre de 2026

**Twenty** · **2** (cumple) — En la instalación propia los datos quedan en el servidor de la compañía y no dependen de ninguna cuenta del fabricante: no hay condición de servicio que los afecte por falta de uso, porque no hay servicio de por medio, y el fabricante la ofrece con el control total de los datos. Una póliza puede quedar años sin que nadie la abra y sigue ahí mientras el equipo donde corre el sistema se mantenga.

> «Full control over your data»
>
> — https://docs.twenty.com/user-guide/billing/capabilities/pricing-plans, consultado el 29 de septiembre de 2026

**Bitrix24** · **0** (no cumple) — Las condiciones de servicio del fabricante habilitan la baja de la cuenta, con sus datos, después de cincuenta días corridos sin uso. Una póliza vigente puede pasar mucho más que cincuenta días sin que nadie la consulte —está vigente, pero no requiere actividad—, y ese silencio pone en riesgo toda la cartera, no solo el registro inactivo. La compañía tiene que sostener un ingreso periódico solo para conservar datos que de otro modo no necesitarían ninguna atención.

> «21.3.1. Alaio reserves the right to suspend your Bitrix24 Customer Account (temporary limit access to User Accounts and Administrator Accounts) in the following instances: (1) if you fail to comply with terms of these Terms of Service or other requirements described herein; (2) non-use of the Bitrix24 Customer Account for fifty (50) consecutive calendar days, provided that upon expiration of said period the Bitrix24 Customer Account remains under the Free Plan. Upon "non-use" we consider the absence of data in the Bitrix24 archive system about any activity in the Services and the Products within your Bitrix24 Customer Account; (3) non-deletion of User Content incompatible with a Free or cheaper Service Plan in accordance with Section 7.7. of these Terms of Service.»
>
> — https://www.bitrix24.com/terms/, consultado el 29 de septiembre de 2026


### B.1.2 Copia propia y completa de la cartera
**EspoCRM** · **2** (cumple) — Se obtuvo una copia completa con el procedimiento oficial: el volcado de la base de datos y el archivo de la carpeta de datos, que es donde el sistema guarda los adjuntos. La copia se restituyó en una base de datos aparte y la cartera volvió entera: 22 asegurados y 44 pólizas, los mismos que en el sistema en uso. La compañía tiene en su poder toda la información en formatos abiertos y no depende de nadie para recuperarla. *Base de 26255 KB y 73 archivos de datos en 392 KB; restituida sin diferencias.*

> «Create an archive of the entire directory contents of the EspoCRM instance. You can use the following command:»
>
> — https://docs.espocrm.com/administration/backup-and-restore/, consultado el 28 de septiembre de 2026

**Twenty** · **2** (cumple) — Se obtuvo una copia completa con el procedimiento que indica el fabricante: el volcado de la base de datos, y el archivo de la carpeta donde el servidor guarda los adjuntos. La copia se restituyó en una base de datos aparte y la cartera volvió entera: 31 personas, 32 pólizas y 8 reclamos, los mismos que en el sistema en uso. La compañía tiene en su poder toda la información, en el formato abierto de la base, y no depende de nadie para recuperarla. *Base de 1992 KB y 82 archivos adjuntos en 19945 KB; restituida sin diferencias.*

> «Regular backups protect your CRM data from loss.»
>
> — https://docs.twenty.com/developers/self-host/capabilities/docker-compose, consultado el 29 de septiembre de 2026

**Bitrix24** · **1** (cumple con reparo) — El listado de negociaciones —que en la edición gratuita hace de cartera de pólizas— ofrece la acción «Exportar», pero no aparece habilitada en el listado de la edición gratuita. La compañía igual obtiene una copia completa de sus datos, registro por registro, con la interfaz de programación de la misma cuenta: se leyeron 9 negociaciones y 10 contactos con todos sus campos, incluidos los propios. Lo que no se resuelve por pantalla en un solo paso es la copia de los archivos adjuntos de Drive, que el fabricante no ofrece como descarga masiva en la edición gratuita: hay que bajarlos uno por uno o contratar una aplicación de respaldo del catálogo. La compañía tiene en su poder los datos, con un procedimiento que se repite en cada copia. *9 negociaciones y 10 contactos leídos por la interfaz de programación.*


### B.1.3 Copia periódica sin intervención manual
**EspoCRM** · **1** (cumple con reparo) — El producto no trae una copia programada: sus tareas programadas son de mantenimiento propio y ninguna genera un respaldo. La documentación oficial resuelve la repetición afuera, con el programador de tareas del servidor, que ejecuta todas las noches el mismo procedimiento de copia. La condición se satisface con una limitación que la compañía asume: la copia se repite sola, pero la programa, la vigila y la guarda fuera del equipo alguien con acceso al servidor, porque el sistema no avisa si una noche falló.

> «Backups can be scheduled on the host by adding the following entry to the crontab:»
>
> — https://docs.espocrm.com/administration/backup-and-restore/, consultado el 28 de septiembre de 2026

**Twenty** · **1** (cumple con reparo) — El producto no trae una copia programada: su panel de administración muestra el estado del servidor y sus variables, y ninguna opción genera un respaldo. La documentación del fabricante resuelve la repetición afuera, con el programador de tareas del servidor, que ejecuta todas las noches el volcado de la base. La condición se satisface con una limitación que la compañía asume: la copia se repite sola, pero la programa, la vigila y la guarda fuera del equipo alguien con acceso al servidor, porque el sistema no avisa si una noche falló.

> «Automate Daily Backups»
>
> — https://docs.twenty.com/developers/self-host/capabilities/docker-compose, consultado el 29 de septiembre de 2026

**Bitrix24** · **1** (cumple con reparo) — El propio fabricante genera una copia diaria de toda la cuenta, sin que nadie la programe ni la ejecute: no es una tarea que la compañía tenga que sostener. La condición se satisface con una limitación: esa copia la administra el fabricante y no la compañía, se conserva solo siete días, y restituir una fecha concreta depende de pedirlo a soporte y de que el plan contratado lo permita, así que la compañía no controla ni la retención ni la restitución de su propio resguardo.

> «If you accidentally delete important data like SPAs, deals, or tasks, don't worry. Bitrix24 automatically creates daily backups of all your data and keeps them safe for seven days, allowing you to restore your information with ease.»
>
> — https://helpdesk.bitrix24.com/open/25110238/, consultado el 29 de septiembre de 2026


### B.1.4 Búsqueda y operación con volumen productivo
**EspoCRM** · **2** (cumple) — Se cargó la cartera de referencia —cinco mil asegurados, doce mil quinientas pólizas y siete mil quinientos reclamos, veinticinco mil registros— y con ella se repitieron las operaciones de todos los días: buscar un asegurado por texto y filtrar las pólizas por ramo, tres veces cada una. Buscar un asegurado entre cinco mil respondió en menos de medio segundo las tres veces, y filtrar las doce mil quinientas pólizas por ramo, en alrededor de medio segundo: no hay espera que el usuario perciba. Con la cartera de referencia cargada, el sistema responde como con una cartera chica. *texto 0.5 / 0.2 / 0.5 s · filtro 0.1 / 0.1 / 0.2 s · carga 1 min.*

**Twenty** · **2** (cumple) — Se cargó la cartera de referencia —cinco mil asegurados, doce mil quinientas pólizas y siete mil quinientos reclamos, veinticinco mil registros— y con ella se repitieron las operaciones de todos los días: buscar un asegurado por texto desde la búsqueda general y filtrar las pólizas por ramo, tres veces cada una. Buscar un asegurado entre cinco mil respondió en un cuarto de segundo o menos las tres veces, y filtrar las doce mil quinientas pólizas por ramo, en menos de dos décimas: no hay espera que el usuario perciba. Con la cartera de referencia cargada, el sistema responde como con una cartera chica. *texto 0.17 / 0.17 / 0.18 s · filtro 0.05 / 0.09 / 0.07 s · carga 0 min.*

**Bitrix24** · **1** (cumple con reparo) — No se cargó la cartera de referencia de veinticinco mil registros: el portal es compartido con otras pruebas en curso y una carga de ese tamaño las afectaría. Se midió la búsqueda por texto sobre la cartera real del portal —10 negociaciones y 6 contactos—, que respondió en 6.42 / 1.40 / 1.57 segundos. El fabricante no publica, para la edición gratuita, un tope numérico de registros de CRM que permita proyectar ese tiempo a una cartera de veinticinco mil: publica el límite de usuarios —sin tope— y el de almacenamiento de archivos —5 GB—, pero no uno sobre la cantidad de negociaciones o contactos que admite buscar. La compañía no tiene, de la propia documentación, una garantía de que la búsqueda siga respondiendo igual con su cartera productiva completa. *búsqueda por texto sobre 10 negociaciones y 6 contactos: 6.42 / 1.40 / 1.57 s.*

> «Funciones clave: Almacenamiento de 5 GB CRM básico (negociaciones, contactos) Tareas (Kanban, Gantt) Calendarios compartidos Chat y videollamadas»
>
> — https://www.bitrix24.es/prices/, consultado el 29 de septiembre de 2026


### B.1.5 Previsibilidad de los cambios del sistema
**EspoCRM** · **2** (cumple) — En la instalación propia la actualización no llega sola: la ejecuta el administrador de la compañía con un comando, cuando decide hacerlo. El propio fabricante recomienda esperar unos días después de cada versión nueva antes de aplicarla. La compañía elige el momento —fuera del horario de atención, después de probarla— y ningún cambio del sistema la sorprende durante la operación.

> «Command to run:»
>
> — https://docs.espocrm.com/administration/upgrading/, consultado el 28 de septiembre de 2026

> «It's recommended to upgrade whenever the new version is out. If you skip a few minor or major versions before deciding to upgrade, it's more likely that the upgrade will run unsmoothly. For minor or major releases it may be reasonable to wait for a few days before upgrading, as a very fresh release is likely to have yet undiscovered bugs.»
>
> — https://docs.espocrm.com/administration/upgrading/, consultado el 28 de septiembre de 2026

**Twenty** · **2** (cumple) — En la instalación propia la actualización no llega sola: el administrador de la compañía cambia la versión de la imagen, hace antes la copia de la base que pide el fabricante y reinicia; recién al arrancar la versión nueva el servidor aplica sus cambios. La compañía elige el momento —fuera del horario de atención, después de probarla— y ningún cambio del sistema la sorprende durante la operación. *Imagen en uso: twentycrm/twenty:latest.*

> «Always back up your database before starting the upgrade process»
>
> — https://docs.twenty.com/developers/self-host/capabilities/upgrade-guide, consultado el 29 de septiembre de 2026

> «The server runs all required upgrade migrations automatically on startup. No manual command is needed.»
>
> — https://docs.twenty.com/developers/self-host/capabilities/upgrade-guide, consultado el 29 de septiembre de 2026

**Bitrix24** · **0** (no cumple) — En un servicio en la nube de versión única, el fabricante decide cuándo cambia el sistema: actualiza el portal de todos sus clientes a la vez, y sus propias condiciones de servicio se reservan el derecho de modificarse sin aviso previo. La compañía no elige el momento del cambio, no lo prueba antes de que llegue a producción y puede encontrarse con una pantalla, un menú o un comportamiento distinto en medio de la atención, sin ninguna anticipación garantizada.

> «1.4. The terms of this Agreement may be updated by Alaio from time to time without notice. In case of the major changes, you will be provided with advance notification of the changes through a prominent notice within the Service and/or by email communication as set forth in section 34. Contact information. Contracting Entity. The amended Terms of Service will take effect upon the date mentioned above on the top of this page, unless otherwise provided in a notification to you. Please check these Terms of Service periodically for changes. Failure to provide or maintain accurate or current contact information by you will not obviate your responsibility to comply with these Terms of Service, as amended from time to time. If you do not agree to any changes to these Terms of Service, you must discontinue using any our services and Products and no longer access the Website. Your continued use of the Website, the Services, and the Products indicates your agreement to the changes. The version of these Terms of Service currently published at https://www.bitrix24.com/terms/ constitutes the binding and governing agreement applicable to all users at any given time.»
>
> — https://www.bitrix24.com/terms/, consultado el 29 de septiembre de 2026


### B.1.6 Conocimiento y decisión sobre dónde residen los datos
**EspoCRM** · **2** (cumple) — En la instalación propia la base de datos reside donde la compañía instala el sistema: en su propio servidor o en el proveedor que ella elija, en el país que ella elija. Sabe en todo momento dónde están los datos de sus asegurados y lo decide ella, que es lo que exige el tratamiento de datos sensibles de los seguros de personas. La contracara, que el fabricante declara, es que la seguridad de esos datos queda también a su cargo.

> «CRM database is stored locally»
>
> — https://www.espocrm.com/self-hosted-vs-cloud-crm/, consultado el 28 de septiembre de 2026

> «Self-hosted (on-premise) — You install the software and have all the data stored on your own server. All the server maintenance, as well as data security, will be your responsibility.»
>
> — https://www.espocrm.com/self-hosted-vs-cloud-crm/, consultado el 28 de septiembre de 2026

**Twenty** · **2** (cumple) — En la instalación propia la base de datos reside donde la compañía instala el sistema: en su propio servidor o en el proveedor que ella elija, en el país que ella elija, y los adjuntos van al disco del servidor o al almacenamiento que ella configure. Sabe en todo momento dónde están los datos de sus asegurados y lo decide ella, que es lo que exige el tratamiento de datos sensibles de los seguros de personas. La contracara es que la seguridad de esos datos queda también a su cargo.

> «Host Twenty on your own infrastructure at no cost:»
>
> — https://docs.twenty.com/user-guide/billing/capabilities/pricing-plans, consultado el 29 de septiembre de 2026

> «By default, Twenty stores uploaded files on the local filesystem. For production deployments, use S3 or an S3-compatible service (MinIO, DigitalOcean Spaces, etc.) to ensure files persist across container restarts and scale across multiple server instances.»
>
> — https://docs.twenty.com/developers/self-host/capabilities/setup, consultado el 29 de septiembre de 2026

**Bitrix24** · **1** (cumple con reparo) — El fabricante declara dónde aloja los datos —en la infraestructura de Amazon Web Services, en Virginia o en Fráncfort— y la compañía elige entre esas dos regiones al dar de alta el portal, según el dominio con el que se registra. La condición se satisface con una limitación: la elección es binaria, se fija una sola vez al crear la cuenta y no se puede cambiar después sin migrar a un portal nuevo, así que la compañía conoce dónde están sus datos sensibles pero no controla ese destino en el tiempo, como exige el tratamiento de datos de los seguros de personas.

> «Bitrix24 uses Amazon Web Services to host your data in US (Virginia) or European Union (Frankfurt, Germany). You can purchase on premise editions of Bitrix24 to host it in your country or on your server. AWS also maintains the following certifications: HIPAA, GDPR, ISO 27001, SOC 1/2/3, Directive 95/46/EC and PCI DSS Level 1.»
>
> — https://www.bitrix24.com/security/, consultado el 29 de septiembre de 2026


### B.1.7 Continuidad de la atención ante una caída del enlace
**EspoCRM** · **2** (cumple) — Con la salida a internet cortada —el navegador solo alcanzaba el servidor de la red propia— se ingresó al sistema, se buscó un asegurado y se registró un reclamo, que es la atención de todos los días. La instalación propia no necesita nada de afuera para operar: lo que se pierde durante el corte es lo que por naturaleza viaja por internet, como el envío y la recepción de correo. Con el sistema en la red de la compañía, una caída del enlace no detiene la atención. *0 pedidos a direcciones externas bloqueados durante la prueba.*

**Twenty** · **2** (cumple) — Con la salida a internet cortada —el navegador solo alcanzaba el servidor de la red propia— se ingresó al sistema, se buscó un asegurado y se registró un reclamo, que es la atención de todos los días. La instalación propia no necesita nada de afuera para operar: lo que se pierde durante el corte es lo que por naturaleza viaja por internet, como el correo y los logotipos de las empresas que la interfaz trae de un servicio externo. Con el sistema en la red de la compañía, una caída del enlace no detiene la atención. *10 pedidos a direcciones externas bloqueados durante la prueba (twenty-icons.com).*

**Bitrix24** · **1** (cumple con reparo) — Con la conexión externa cortada, el portal abierto en el navegador dejó de responder: no hay ningún componente del sistema en la red de la compañía al que seguir alcanzando, porque la edición evaluada vive entera en la nube del fabricante, y consultar un asegurado o registrar un reclamo en el CRM no es posible mientras dura el corte. El fabricante documenta, en cambio, un modo sin conexión en su aplicación de escritorio para enviar mensajes y trabajar con documentos, que se sincronizan al volver el enlace: una parte de la operación diaria sigue siendo posible, pero no la que depende del CRM. *Portal operable sin enlace externo: no.*

> «Offline mode. Send messages and work with documents without an internet connection. The data syncs later.»
>
> — https://helpdesk.bitrix24.com/open/23839416/, consultado el 29 de septiembre de 2026


## B.2 Capacidades por encima de lo solicitado

### B.2.1 Asistente de inteligencia artificial
**EspoCRM** · **0** (no cumple) — La edición gratuita no incluye un asistente de inteligencia artificial: la administración no ofrece ninguna función de ese tipo y el fabricante la vende como extensión aparte. Con ella el sistema resume registros, redacta correos y clasifica o extrae datos con fórmulas, usando el proveedor de inteligencia artificial que la compañía elija y contrate.

> «Summary»
>
> — https://www.espocrm.com/extensions/intelligence/, consultado el 28 de septiembre de 2026

> «$129.00 1 Year License + Upgrades»
>
> — https://www.espocrm.com/extensions/intelligence/, consultado el 28 de septiembre de 2026

> «1.1 Subject to your continuous compliance with the Agreement and payment of the applicable license fees, EspoCRM grants you a non-exclusive, non-transferable, worldwide, limited right to use the Software on a single EspoCRM Application instance on a single server for the Licensed Period. After the license period expires, you must renew or purchase a new license to continue using the Software. You may use or modify the Software only for your own internal business purposes or for non-commercial or personal use.»
>
> — https://www.espocrm.com/extension-license-agreement/, consultado el 28 de septiembre de 2026

   ↳ **Con Intelligence** (US$ 129 por año y por instalación, abono recurrente) · **2** (cumple) · costo de implementación **1** — La extensión agrega el resumen de registros y la redacción asistida. Requiere configurar la cuenta de un proveedor de inteligencia artificial, que se contrata y se paga aparte.

**Twenty** · **2** (cumple) · costo de implementación **1** — El producto trae un asistente de inteligencia artificial que se abre desde el menú, con un chat que consulta los registros con los permisos del usuario; el fabricante declara que resume la información del sistema en lenguaje natural. En la instalación propia hay que cargarle las credenciales de un proveedor de modelos —Anthropic, Google, Mistral, OpenAI o xAI—, que la compañía elige y contrata: se le pidió el resumen de la ficha de un asegurado y respondió que no hay modelos habilitados, porque esta evaluación no contrató ningún proveedor. Conectar un proveedor propio, como un modelo instalado en la red de la compañía, es del plan Organization. Habilitarlo es configuración de una sola vez, más el costo del proveedor. *Sin proveedor de modelos habilitado en la instalación evaluada.*

> «Ask questions about your data in natural language. The AI chatbot can query your CRM records, summarize information, and help you find what you’re looking for without building complex filters.»
>
> — https://docs.twenty.com/getting-started/core-concepts/ai, consultado el 29 de septiembre de 2026

**Bitrix24** · **2** (cumple) · costo de implementación **1** — El producto trae CoPilot, un asistente de inteligencia artificial disponible desde el propio registro, en la edición gratuita, con una cuota de usos gratuitos por mes. Se le pidió el resumen de una negociación desde su chat; el asistente recibió la consulta pero no devolvió respuesta en el minuto y medio de espera de la instalación evaluada, posiblemente por la cuota gratuita del portal. Queda disponible de fábrica, sin instalar nada: lo único que puede requerir una configuración de una vez es elegir o ampliar la cuota de uso cuando la gratuita se agota.

> «Su asistente potenciado por IA en Bitrix24»
>
> — https://www.bitrix24.es/features/copilot.php, consultado el 29 de septiembre de 2026


### B.2.2 Aplicación móvil nativa
**EspoCRM** · **0** (no cumple) — El fabricante no publica una aplicación móvil. En la tienda de aplicaciones, la búsqueda del producto devuelve 6 aplicaciones hechas para este producto, y todas son de desarrolladores independientes, sin respaldo del fabricante; ni su catálogo de extensiones ni su página de descarga ofrecen una. Lo que sí ofrece es la misma interfaz adaptada a la pantalla del teléfono, que se usa desde el navegador con conexión: el productor puede consultar y cargar durante una visita, pero no es una aplicación instalada. *6 aplicaciones para el producto en la tienda, 0 del fabricante.*

> «YouCRM for EspoCRM UP5 TECH Company Limited»
>
> — https://play.google.com/store/search?q=espocrm&c=apps, consultado el 28 de septiembre de 2026

**Twenty** · **0** (no cumple) — El fabricante no publica una aplicación móvil: en la tienda de aplicaciones, la búsqueda del producto devuelve 5 aplicaciones con su nombre y ninguna es del fabricante. Lo que ofrece es la misma interfaz en el navegador del teléfono, que se adapta a la pantalla: el productor puede consultar y cargar durante una visita, con conexión, pero no es una aplicación instalada. *5 aplicaciones con el nombre del producto en la tienda, 0 del fabricante.*

> «Acceder con Google»
>
> — https://play.google.com/store/search?q=twenty%20crm&c=apps, consultado el 29 de septiembre de 2026

**Bitrix24** · **2** (cumple) — El fabricante publica una aplicación móvil oficial, para Android en Google Play y para iOS en el App Store, con el CRM, las tareas, el chat y las notificaciones de la cuenta. El productor puede registrar la operación durante la visita al asegurado, desde su teléfono, sin instalar ni configurar nada además de bajar la aplicación e iniciar sesión.

> «El único software empresarial que necesitarás»
>
> — https://www.bitrix24.es/features/mobile-app.php, consultado el 29 de septiembre de 2026


### B.2.3 Suite de trabajo integrada
**EspoCRM** · **1** (cumple con reparo) · costo de implementación **2** — Además del CRM, el producto incluye correo, calendario, documentos, plantillas PDF y una línea de publicaciones internas en cada registro, y todas operan sobre los mismos datos: un correo queda en la ficha del asegurado, una reunión en su historial, un documento vinculado a su póliza. Faltan la mensajería instantánea entre usuarios, la edición colaborativa de documentos y la firma electrónica: para eso la compañía sigue necesitando otras herramientas, y pasar la información de una a otra es trabajo en cada uso.

**Twenty** · **1** (cumple con reparo) · costo de implementación **2** — Además del CRM, el producto incluye correo, calendario, notas, tareas, archivos, tableros, flujos de trabajo, asistente de IA, y todas operan sobre los mismos datos: la ficha del asegurado reúne en pestañas su línea de tiempo, sus tareas, sus notas, sus archivos, sus correos y sus reuniones, y los tableros y los flujos leen y escriben los mismos registros. Faltan la mensajería instantánea entre usuarios, la edición colaborativa de documentos y la firma electrónica: para eso la compañía sigue necesitando otras herramientas, y pasar la información de una a otra es trabajo en cada uso. *Pestañas de la ficha: Timeline, Tasks, Notes, Files, Emails, Calendar.*

**Bitrix24** · **1** (cumple con reparo) · costo de implementación **2** — Además del CRM, el producto incluye mensajería, tareas y proyectos, calendario, Drive (documentos), base de conocimientos, sitios web, todo en la misma cuenta y sobre los mismos contactos: desde la ficha de una negociación se abre un chat, una tarea, una reunión o un comentario (Tarea, Comentario) sin salir del registro. Falta la edición colaborativa de documentos de oficina y la firma electrónica en la edición gratuita —quedan en planes pagos o en aplicaciones del catálogo—, así que la compañía sigue necesitando otra herramienta para esa parte, con el trabajo de pasar la información de una a otra. *Acciones disponibles desde la ficha: Tarea, Comentario.*


### B.2.4 Telefonía y videollamada integradas
**EspoCRM** · **0** (no cumple) — La edición gratuita no integra telefonía ni videollamada: el número de teléfono de una ficha abre el marcador del equipo, pero la llamada ocurre afuera y se registra a mano. El fabricante vende las dos funciones como extensiones separadas: una conecta la central telefónica —3CX, Asterisk, Twilio, entre otras— y la otra agrega las videollamadas.

> «VoIP Integration extension is an official add-on for EspoCRM. It allows EspoCRM to integrate with the following IP telephony servers and services:»
>
> — https://www.espocrm.com/extensions/voip-integration/, consultado el 28 de septiembre de 2026

> «$388.00 1 Year License + Upgrades»
>
> — https://www.espocrm.com/extensions/voip-integration/, consultado el 28 de septiembre de 2026

> «1.1 Subject to your continuous compliance with the Agreement and payment of the applicable license fees, EspoCRM grants you a non-exclusive, non-transferable, worldwide, limited right to use the Software on a single EspoCRM Application instance on a single server for the Licensed Period. After the license period expires, you must renew or purchase a new license to continue using the Software. You may use or modify the Software only for your own internal business purposes or for non-commercial or personal use.»
>
> — https://www.espocrm.com/extension-license-agreement/, consultado el 28 de septiembre de 2026

> «$110.00 1 Year License + Upgrades»
>
> — https://www.espocrm.com/extensions/zoom-integration/, consultado el 28 de septiembre de 2026

> «1.1 Subject to your continuous compliance with the Agreement and payment of the applicable license fees, EspoCRM grants you a non-exclusive, non-transferable, worldwide, limited right to use the Software on a single EspoCRM Application instance on a single server for the Licensed Period. After the license period expires, you must renew or purchase a new license to continue using the Software. You may use or modify the Software only for your own internal business purposes or for non-commercial or personal use.»
>
> — https://www.espocrm.com/extension-license-agreement/, consultado el 28 de septiembre de 2026

> «Basic $15.00 per user/month minimum 3 users 3GB file storage per user 100,000 records SSL Encryption (256 bit keys, TLS 1.3) Full feature set All extensions included External access API 2000+ integrations * 12x5 (hours/days) support Sign Up Free Trial Free Trial is provided for 30 days»
>
> — https://www.espocrm.com/cloud/, consultado el 28 de septiembre de 2026

   ↳ **Con VoIP Integration + Zoom Integration** (US$ 498 por año y por instalación (US$ 388 + US$ 110), abono recurrente) · **2** (cumple) · costo de implementación **1** — Con las dos extensiones, las llamadas se atienden y se registran desde la ficha y las reuniones generan su enlace de videollamada. Requiere la central telefónica y la cuenta de videollamadas de la compañía.

   ↳ **Con EspoCRM Cloud Basic** (US$ 15 por usuario por mes, mínimo 3 usuarios, abono recurrente) · **2** (cumple) · costo de implementación **1** — El servicio en la nube incluye las dos extensiones entre todas las del fabricante.

**Twenty** · **1** (cumple con reparo) · costo de implementación **2** — La videollamada está integrada a medias: desde la ficha de un asegurado se crea una reunión en el calendario conectado de Google o Microsoft, con el enlace de videollamada de ese servicio, y la reunión queda en la línea de tiempo del registro. La telefonía no está: el número de una ficha no se marca desde el sistema, las llamadas ocurren afuera y se registran a mano, o hay que desarrollar la conexión con la central telefónica sobre la interfaz de programación.

> «Toggle Invitations to email guests, and Video call to add a meeting link»
>
> — https://docs.twenty.com/user-guide/calendar-emails/how-tos/can-i-book-meetings-from-twenty, consultado el 29 de septiembre de 2026

**Bitrix24** · **1** (cumple con reparo) · costo de implementación **2** — La videollamada está integrada de fábrica: desde la ficha de una negociación se inicia una reunión con video, sin salir del sistema. La telefonía no: el fabricante reserva la línea propia y la numeración de Bitrix24 Telephony a los planes pagos, así que en la edición gratuita llamar desde el sistema requiere contratar ese módulo o desarrollar la conexión con una central externa por la interfaz de programación. *Videollamada en la ficha: no detectada · acción de llamar: no.*

> «¡Sí, lo es! El plan Free es un estado de cuenta predeterminado, en el que se puede agregar un número ilimitado de usuarios y disfrutar de las herramientas disponibles de forma totalmente gratuita durante el tiempo ilimitado. Tenga en cuenta que algunas herramientas como Telefonía y aplicaciones de Bitrix24 Market están disponibles solo en los planes pagos.»
>
> — https://www.bitrix24.es/prices/, consultado el 29 de septiembre de 2026


### B.2.5 Uso sin restricciones comerciales en la interfaz
**EspoCRM** · **2** (cumple) — Se recorrieron las pantallas de uso diario —inicio, asegurados, pólizas, reclamos, oportunidades y calendario— y ninguna muestra avisos de venta, invitaciones a mejorar el plan ni funciones bloqueadas a la vista. Lo que no está en la edición gratuita simplemente no aparece: el usuario trabaja sin interrupciones comerciales.

**Twenty** · **2** (cumple) — Se recorrieron las pantallas de uso diario —asegurados, pólizas, reclamos, oportunidades, tareas y tableros— y ninguna muestra avisos de venta ni invitaciones a mejorar el plan. Las funciones del plan pago aparecen marcadas solo dentro de la configuración, donde las ve quien administra: el usuario trabaja sin interrupciones comerciales.

**Bitrix24** · **1** (cumple con reparo) · costo de implementación **2** — Se recorrieron las pantallas de uso diario —CRM, tareas, mensajería y calendario— y en todas hay avisos de venta permanentes en la propia interfaz (crm: Mejore su plan, Comprar ahora; tareas: Mejore su plan, Comprar ahora; mensajes: Mejore su plan, Comprar ahora; calendario: Mejore su plan, Comprar ahora), sin importar la tarea en curso. No impiden operar, pero el usuario trabaja con la oferta comercial siempre a la vista y la edición gratuita no ofrece ocultarla. *Avisos de venta en el contenido: 4.*

