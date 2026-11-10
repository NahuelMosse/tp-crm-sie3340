# 5. Detalle por requerimiento

Cada requerimiento indica qué resuelve para la compañía y, para cada plataforma, el valor obtenido, cómo lo resuelve, las características de esa solución y la justificación del valor. Cuando un plan pago lo cambiaría, se agrega como comentario: no modifica el valor. Las escalas están definidas en la sección 2 y los procedimientos, en la sección 3.

## A.1 Cartera de pólizas

### A.1.1 Modelado de la póliza como objeto propio

**Qué resuelve.** Que la póliza, el producto que vende la compañía, se registre y se consulte como tal y no disfrazada de otra cosa.

**EspoCRM** · **2** (cumple) · costo de implementación **1**

- *Cómo lo hace.* El Administrador de Entidades crea la entidad Póliza desde la pantalla de administración, sin escribir código ni tocar archivos del servidor.
- *Características.* Queda con identidad propia: figura en el modelo de datos, tiene su entrada en el menú principal, su listado y su ficha, y admite registros. A partir de ahí el usuario opera con la póliza igual que con las entidades que trae el producto —la busca, la filtra, la relaciona— de modo que la necesidad queda resuelta desde el sistema.
- *Justificación.* Definirla es trabajo de una sola vez, y eso es lo que refleja el costo de implementación.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-1-1-espocrm-1-modelo, A-1-1-espocrm-2-menu, A-1-1-espocrm-3-listado.

**Twenty** · **2** (cumple) · costo de implementación **1**

- *Cómo lo hace.* Desde Configuración › Modelo de datos se crea el objeto Póliza con su nombre en singular y plural, sin escribir código ni tocar el servidor.
- *Características.* Queda con identidad propia: figura entre los objetos del modelo, aparece en el menú de la izquierda junto a los que trae el producto, tiene su listado y admite registros, que se cargan desde el mismo listado.
- *Justificación.* Definirlo es trabajo de una sola vez.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-1-1-twenty-1-modelo, A-1-1-twenty-2-menu, A-1-1-twenty-3-listado.

**Bitrix24** · **0** (no cumple)

- *Cómo lo hace.* La edición gratuita no crea entidades propias: al guardar, avisa que los procesos inteligentes requieren el plan Professional o el Enterprise.
- *Características.* Las entidades propias de Bitrix24 son los procesos inteligentes, que se crean desde la barra del CRM sin programar: nombre, etapas, embudos y reglas de automatización.
- *Justificación.* Sin ellos la póliza no tiene identidad propia: habría que forzarla dentro de otra entidad del producto.
- *Comentario — con Bitrix24 Professional* (US$ 289 por mes, hasta 100 usuarios, abono recurrente) sería **2** (cumple, costo 1). Con el plan Professional, el primero que incluye los procesos inteligentes, la póliza se crea como entidad propia desde la barra del CRM, con su nombre, sus etapas y sus campos, sin escribir código. Es configuración de una vez.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-1-1-bitrix24-1-formulario, A-1-1-bitrix24-2-al-guardar.

> «Cree sus propios procesos inteligentes y personalícelos según las necesidades de su empresa.»
>
> — https://www.bitrix24.es/prices/compare_cloud_plans.php, consultado el 9 de noviembre de 2026

> «SPA (smart process automation)»
>
> — https://www.bitrix24.com/promo/professional/, consultado el 9 de noviembre de 2026

> «Professional desde US$ 289 desde US$ 199 incluye 100 usuarios Empezar Empezar»
>
> — https://www.bitrix24.es/prices/, consultado el 9 de noviembre de 2026

### A.1.2 Campos de lista para el ramo y el estado de cobranza

**Qué resuelve.** Saber de un vistazo de qué ramo es cada póliza y si está al día, sin depender de cómo lo escriba cada usuario.

**EspoCRM** · **2** (cumple) · costo de implementación **1**

- *Cómo lo hace.* El Administrador de Campos agrega campos de tipo lista y admite escribir sus valores, sin programar: con él se definen los ramos que comercializa la compañía y los estados de cobranza, y cada póliza muestra su ramo en el listado. El estado de cobranza se cambia desde la ficha y el cambio queda guardado.
- *Características.* El usuario elige de la lista y no puede escribir un valor imprevisto, que es lo que vuelve confiable la clasificación de la cartera. 4 ramos cargados y visibles en el listado.
- *Justificación.* El campo se define en una pantalla y se ubica en el formulario en otra, ambas de administración: es configuración inicial, no desarrollo.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-1-2-espocrm-1-campos, A-1-2-espocrm-2-cartera, A-1-2-espocrm-3-estado.

**Twenty** · **2** (cumple) · costo de implementación **1**

- *Cómo lo hace.* Desde Configuración › Modelo de datos se agregan a la póliza el ramo, con los que comercializa la compañía, y el estado de pago, con los estados de cobranza; en cada póliza el estado se cambia desde su ficha, eligiendo la opción en un desplegable con buscador.
- *Características.* El modelo de datos admite campos de lista con las opciones que define la compañía. Los valores quedan guardados como opciones de la lista, no como texto libre.
- *Justificación.* Definir los campos es trabajo de una sola vez.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-1-2-twenty-1-campos, A-1-2-twenty-2-ficha-con-estado-cambiado, A-1-2-twenty-3-una-por-ramo.

**Bitrix24** · **2** (cumple) · costo de implementación **1**

- *Cómo lo hace.* Desde el formulario de la negociación —que en la edición gratuita hace de póliza, a falta de entidades propias— se agregan campos de tipo lista sin programar, por ejemplo el ramo y el estado de cobranza. Cada póliza se carga con valores elegidos de esas listas y el estado se cambia desde su ficha.
- *Características.* El usuario elige de la lista y no puede escribir un valor imprevisto. 4 ramos cargados.
- *Justificación.* Definir los campos es configuración de una vez, en el mismo formulario.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-1-2-bitrix24-1-campos, A-1-2-bitrix24-2-cartera, A-1-2-bitrix24-3-estado.

### A.1.3 Prima con importe y moneda

**Qué resuelve.** Registrar cuánto paga el asegurado con exactitud, en la moneda en que se pactó.

**EspoCRM** · **2** (cumple) · costo de implementación **1**

- *Cómo lo hace.* El campo de importe guarda la prima con sus centavos y con la denominación, y el sistema lo trata como importe y no como texto: guarda la moneda junto al valor y mantiene una lista de monedas habilitadas.
- *Características.* El producto ofrece un tipo de campo de importe con moneda, que se agrega desde la administración. Prima de 184.532,75 registrada y devuelta con centavos y denominación.
- *Justificación.* El campo de importe con moneda es lo que necesita una compañía que cobra primas en pesos y emite pólizas en dólares sin que los importes se mezclen al sumarlos.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-1-3-espocrm-1-prima.

**Twenty** · **2** (cumple) · costo de implementación **1**

- *Cómo lo hace.* Desde Configuración › Modelo de datos se agrega la prima como campo de importe en pesos argentinos: guarda el importe con centavos y su moneda. Para eso el campo se define una vez con formato completo y dos decimales.
- *Características.* El modelo de datos tiene un tipo de campo de importe con moneda. Con la definición de fábrica —formato corto, sin decimales— el editor descarta la coma decimal sin avisar: un importe con centavos como 45.250,75 queda guardado como 4.525.075. Es un error que el fabricante tiene registrado; quien define el campo tiene que saberlo. guardado 45250.75 ARS; en pantalla «45.250,75
45.250,75».
- *Justificación.* Definirlo bien es trabajo de una sola vez.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-1-3-twenty-1-campo-configurado, A-1-3-twenty-2-prima-cargada.

> «In a currency field left at the default Number of decimals = 0, the editor rejects the typed decimal separator but keeps the digits after it. The amount is saved 10^n times too large, with no warning.»
>
> — https://github.com/twentyhq/twenty/issues/25870, consultado el 30 de octubre de 2026

**Bitrix24** · **2** (cumple) · costo de implementación **1**

- *Cómo lo hace.* El peso argentino no viene entre las monedas del portal: se agrega desde la configuración del CRM, eligiéndolo de la lista de monedas y cargando su cotización. El campo de prima guarda el importe con centavos y su moneda.
- *Características.* El formulario de la negociación, que hace de póliza en la edición gratuita, admite campos de tipo dinero: importe y moneda en el mismo campo. Guardado: 15250.5|ARS.
- *Justificación.* Agregar la moneda y el campo es configuración de una vez.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-1-3-bitrix24-1-moneda, A-1-3-bitrix24-2-prima, A-1-3-bitrix24-3-guardada.

### A.1.4 Vigencia con fecha de inicio y de fin

**Qué resuelve.** Saber desde cuándo y hasta cuándo cubre cada póliza, y poder ordenar la cartera por esas fechas.

**EspoCRM** · **2** (cumple) · costo de implementación **1**

- *Cómo lo hace.* Los campos de inicio y de fin de vigencia se agregan como campos de fecha desde la administración, y el sistema los trata como tales y no como texto: el listado se ordena por vencimiento y admite la condición «vence en los próximos 30 días».
- *Características.* El filtro ofrece 21 comparaciones propias de una fecha —próximos o últimos X días, antes, después, entre, mes o trimestre en curso—. 21 comparaciones de fecha en el filtro.
- *Justificación.* Para poder filtrar por un campo propio hay que habilitarlo antes entre los filtros de búsqueda del listado, en la misma administración: configuración inicial, no desarrollo.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-1-4-espocrm-1-orden-por-vencimiento, A-1-4-espocrm-2-vencen-en-30-dias.

**Twenty** · **2** (cumple) · costo de implementación **1**

- *Cómo lo hace.* Desde Configuración › Modelo de datos se agregan el inicio y el fin de la vigencia, que el sistema trata como fechas: el listado ordenado por fin de vigencia pone primero la póliza que vence antes, y el filtro sobre ese campo ofrece comparaciones propias de una fecha —antes, después, en el pasado, en el futuro, relativa—, como «vence en los próximos 30 días».
- *Características.* El modelo de datos tiene un tipo de campo de fecha. comparaciones del filtro de fecha: .
- *Justificación.* Definir los campos es trabajo de una sola vez.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-1-4-twenty-1-orden-por-vencimiento, A-1-4-twenty-2-comparaciones-de-fecha, A-1-4-twenty-3-vencen-en-30-dias.

**Bitrix24** · **2** (cumple) · costo de implementación **1**

- *Cómo lo hace.* Desde el mismo formulario de la póliza se agregan campos de fecha para el inicio y el fin de la vigencia, que cada póliza guarda con sus fechas.
- *Características.* El formulario de la negociación, que en la edición gratuita hace de póliza, admite campos de tipo fecha. El sistema las trata como fechas: con un clic en el encabezado de la columna el listado se ordena por calendario —no alfabéticamente— y otro clic invierte el orden; y el filtro sobre ese campo ofrece comparaciones propias de una fecha —hoy, próximos N días, rango, mes, trimestre—: «vence en los próximos 30 días» trajo solo la póliza que vence en doce días y dejó afuera las de 150 y 300. orden POL-VENCE-PRONTO > POL-VENCE-MEDIO > POL-VENCE-TARDE · vencen en 30 días: POL-VENCE-PRONTO.
- *Justificación.* Definir los campos y mostrarlos como columna y en el filtro es trabajo de una sola vez.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-1-4-bitrix24-1-vigencia-en-la-poliza, A-1-4-bitrix24-2-orden-por-vencimiento, A-1-4-bitrix24-3-vencen-en-30-dias, A-1-4-bitrix24-4-listado-filtrado.

### A.1.5 Aviso anticipado de vencimiento

**Qué resuelve.** Que nadie se entere tarde de una póliza por vencer o de un reclamo fuera de plazo.

**EspoCRM** · **1** (cumple con reparo) · costo de implementación **2**

- *Cómo lo hace.* La necesidad se cubre con la consulta del listado —vence en los próximos 30 días, y su equivalente sobre el plazo de los reclamos—, que devuelve exactamente lo que hay que atender, pero que alguien tiene que abrir: el trabajo se repite cada día que la compañía quiere estar al tanto.
- *Características.* La edición gratuita no incluye un motor de reglas: la administración ofrece tareas programadas del sistema, notificaciones y fórmulas, pero ninguna vía para que la compañía defina "avisar de lo que vence en treinta días" y el sistema lo emita solo.
- *Justificación.* Queda resuelta con la consulta del listado de vencimientos, que alguien tiene que abrir cada día que la compañía quiere estar al tanto: un costo permanente. El fabricante vende el motor de flujos de trabajo como extensión, y con ella el aviso se define una vez y se emite solo.
- *Comentario — con Advanced Pack* (US$ 395 por año y por instalación, abono recurrente) sería **2** (cumple, costo 1). La extensión agrega los flujos de trabajo: la condición de vencimiento y la de plazo de reclamo se definen una vez desde la administración, y el sistema emite el aviso sin que nadie abra nada.
- *Comentario — con EspoCRM Cloud Basic* (US$ 15 por usuario por mes, mínimo 3 usuarios, abono recurrente) sería **2** (cumple, costo 1). El servicio en la nube incluye todas las extensiones del fabricante, flujos de trabajo incluidos: el aviso se configura igual que con la extensión, sin comprarla aparte.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-1-5-espocrm-1-administracion, A-1-5-espocrm-2-consulta-de-vencimientos.

> «Workflows»
>
> — https://www.espocrm.com/extensions/advanced-pack/, consultado el 30 de octubre de 2026

> «$395.00 1 Year License + Upgrades»
>
> — https://www.espocrm.com/extensions/advanced-pack/, consultado el 30 de octubre de 2026

> «1.1 Subject to your continuous compliance with the Agreement and payment of the applicable license fees, EspoCRM grants you a non-exclusive, non-transferable, worldwide, limited right to use the Software on a single EspoCRM Application instance on a single server for the Licensed Period. After the license period expires, you must renew or purchase a new license to continue using the Software. You may use or modify the Software only for your own internal business purposes or for non-commercial or personal use.»
>
> — https://www.espocrm.com/extension-license-agreement/, consultado el 30 de octubre de 2026

> «Basic $15.00 per user/month minimum 3 users 3GB file storage per user 100,000 records SSL Encryption (256 bit keys, TLS 1.3) Full feature set All extensions included External access API 2000+ integrations * 12x5 (hours/days) support Sign Up Free Trial Free Trial is provided for 30 days»
>
> — https://www.espocrm.com/cloud/, consultado el 30 de octubre de 2026

**Twenty** · **2** (cumple) · costo de implementación **1**

- *Cómo lo hace.* Un flujo de trabajo activado avisa sin que nadie intervenga, en cada corrida del programador, de las pólizas por vencer y de los reclamos que alcanzan su plazo; no avisa de las pólizas que vencen más adelante ni de los reclamos con plazo lejano.
- *Características.* Los flujos de trabajo de la edición gratuita alcanzan para el aviso, armados desde el lienzo sin escribir código: un disparador programado busca las pólizas cuyo fin de vigencia cae en los próximos treinta días y los reclamos cuyo plazo de resolución vence en los próximos dos, y por cada uno deja una tarea con su nombre. 10 avisos emitidos sin intervención.
- *Justificación.* Armar el flujo es trabajo de una sola vez.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-1-5-twenty-1-flujo-del-aviso, A-1-5-twenty-2-avisos-emitidos.

**Bitrix24** · **2** (cumple) · costo de implementación **1**

- *Cómo lo hace.* Se definen desde la pantalla, sin código, avisos por notificación al responsable, con fecha y hora, un tiempo antes de una fecha del registro: por ejemplo treinta días antes del fin de vigencia de la póliza o dos días antes del plazo de resolución del reclamo —que en la edición gratuita, sin entidad propia, es un campo de fecha de la negociación—. Sin que nadie toque nada más, llegan las notificaciones de los registros cuyo momento de aviso ya llegó, y no las de los que todavía están lejos.
- *Características.* Las reglas de automatización de la negociación aceptan un momento de ejecución relativo a una fecha: «N días antes» del valor de un campo de tipo fecha. El aviso se calcula sobre el valor del campo —la fecha y hora menos treinta días—, y un campo de solo fecha lo calcularía a la medianoche; el sistema lo ejecuta con su programador, con una demora de unos minutos sobre el instante calculado, sin consecuencia para avisos de días de anticipación. Cada aviso se marca «En paralelo»: por omisión una regla espera a que termine la anterior de su etapa, y con una regla previa de un día de retraso el aviso saldría un día tarde. La edición gratuita admite hasta 5 reglas y disparadores en total: el portal trae 2 reglas de muestra en la etapa inicial y, con ellas, los dos avisos entran sin pedir otro plan. Avisos emitidos sin intervención: 2, a los 10 minutos.
- *Justificación.* Armar cada aviso es configuración de una vez.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-1-5-bitrix24-1-avisos-definidos, A-1-5-bitrix24-2-avisos-guardados, A-1-5-bitrix24-3-avisos-emitidos.

> «Time ranges are available for fields with the Date and Date and time types.»
>
> — https://helpdesk.bitrix24.com/open/21174186/, consultado el 30 de septiembre de 2026

### A.1.6 Consulta y filtrado de la cartera

**Qué resuelve.** Responder preguntas sobre la cartera —qué pólizas de tal ramo están impagas en tal productor— sin armar listados a mano.

**EspoCRM** · **2** (cumple) · costo de implementación **1**

- *Cómo lo hace.* El listado de pólizas admite combinar condiciones —por ejemplo el ramo, el estado de cobranza y el productor responsable— y devuelve exactamente las pólizas que cumplen todas al mismo tiempo.
- *Características.* La consulta se arma desde el listado eligiendo campo, comparación y valor, sin escribir ninguna expresión. 2 de 20 pólizas cumplen las tres condiciones.
- *Justificación.* Los campos propios de la póliza no vienen habilitados como filtro: hay que agregarlos una vez a los filtros de búsqueda desde la administración, y ese paso es el costo de implementación. Es la consulta que el área comercial repite todos los días para saber a quién llamar.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-1-6-espocrm-1-filtros-combinados.

**Twenty** · **2** (cumple) · costo de implementación **1**

- *Cómo lo hace.* El listado de pólizas combina filtros sobre cualquier campo, como el ramo, el estado de pago y el productor responsable, y trae exactamente las pólizas que cumplen todas las condiciones.
- *Características.* La combinación se puede guardar como una vista con nombre. 2 pólizas con ramo Automotor, estado Al día y productor Pablo Gómez.
- *Justificación.* El productor responsable es un campo de relación con los usuarios que se agrega al modelo una vez: la póliza, como objeto propio, no lo trae.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-1-6-twenty-1-filtros-combinados.

**Bitrix24** · **2** (cumple) · costo de implementación **1**

- *Cómo lo hace.* El listado de negociaciones se filtra a la vez por ramo, estado de cobranza y productor responsable, y trae solo las pólizas que cumplen las tres condiciones.
- *Características.* El filtro del listado de negociaciones combina condiciones sobre cualquier campo. El filtro se puede guardar con nombre. 2 pólizas: ramo Automotor, estado Al día, productor Gómez Productor.
- *Justificación.* El productor responsable viene en toda negociación como «Persona responsable»; el ramo y el estado son campos propios que hay que mostrar en el filtro una vez, con «Agregar campo».
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-1-6-bitrix24-1-filtros-combinados, A-1-6-bitrix24-2-listado-resultante.

### A.1.7 Operación masiva sobre la cartera

**Qué resuelve.** Aplicar un mismo cambio a muchas pólizas sin abrirlas de a una.

**EspoCRM** · **2** (cumple) · costo de implementación **1**

- *Cómo lo hace.* Seleccionadas las pólizas desde el listado, el menú de acciones sobre la selección ofrece, entre otras, la actualización masiva: se elige un campo, como el estado de cobranza, se le da un valor y el sistema lo aplica en una sola operación a todas las seleccionadas, sin recorrerlas una por una.
- *Características.* De fábrica la actualización masiva solo alcanza al usuario y al equipo asignados; para que incluya un campo propio hay que habilitarlo una vez desde la administración. 20 pólizas modificadas con una sola acción.
- *Justificación.* Es lo que vuelve manejable un cambio de estado por lote de cobranza o una renovación de cartera.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-1-7-espocrm-1-seleccion, A-1-7-espocrm-2-acciones-sobre-la-seleccion, A-1-7-espocrm-3-resultado.

**Twenty** · **2** (cumple) · costo de implementación **0**

- *Cómo lo hace.* Con las pólizas seleccionadas desde el listado, la acción de actualizar abre un panel con los campos de la póliza: se elige el valor nuevo, por ejemplo el estado de pago, y se aplica a todas de una vez, tras una confirmación que advierte que el cambio no se puede deshacer.
- *Características.* Las seleccionadas quedaron con el estado nuevo. 7 de 7 pólizas actualizadas con una sola acción.
- *Justificación.* Viene listo: no hay nada que configurar.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-1-7-twenty-1-seleccion, A-1-7-twenty-2-actualizar-registros, A-1-7-twenty-3-confirmacion, A-1-7-twenty-4-resultado.

**Bitrix24** · **2** (cumple) · costo de implementación **0**

- *Cómo lo hace.* En el listado filtrado se tilda la casilla del encabezado, que selecciona todas las pólizas, y en el desplegable de acciones de la selección se elige «Cambiar a la persona responsable»: con el productor elegido y un solo «Aplicar», todas quedan a su cargo.
- *Características.* Las acciones de la selección vienen con el producto y no hay nada que configurar. 3 de 3 pólizas reasignadas con una sola acción.
- *Justificación.* Modificar en bloque otro campo propio, como el estado de cobranza, no figura entre ellas.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-1-7-bitrix24-1-seleccion, A-1-7-bitrix24-2-accion, A-1-7-bitrix24-3-resultado.

## A.2 Captación y proceso de venta

### A.2.1 Registro del solicitante con sus datos de contacto

**Qué resuelve.** Que ningún interesado se pierda: quien pide una cotización queda registrado y se lo vuelve a encontrar.

**EspoCRM** · **2** (cumple) · costo de implementación **0**

- *Cómo lo hace.* El formulario del posible cliente guarda todos sus datos —nombre, teléfono, correo y domicilio— y permite recuperarlo buscando su apellido desde el listado.
- *Características.* El producto trae una entidad para quien todavía no contrató —el posible cliente— con nombre, teléfono, correo y domicilio desglosado en calle, ciudad, provincia, código postal y país.
- *Justificación.* Viene listo con la instalación, sin configurar nada.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-2-1-espocrm-1-alta, A-2-1-espocrm-2-busqueda.

**Twenty** · **2** (cumple) · costo de implementación **1**

- *Cómo lo hace.* Twenty no tiene una entidad para quien todavía no contrató: el solicitante se registra como una persona, igual que el asegurado, con todos sus datos desde su ficha, y la búsqueda general lo encuentra por su nombre.
- *Características.* La persona trae nombre, correos y teléfonos con su código de país, pero no domicilio: se agregó un campo de dirección, desglosado en calle, ciudad, provincia, código postal y país.
- *Justificación.* Agregar el domicilio es trabajo de una sola vez.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-2-1-twenty-1-solicitante-cargado, A-2-1-twenty-2-busqueda.

**Bitrix24** · **2** (cumple) · costo de implementación **0**

- *Cómo lo hace.* La edición gratuita no incluye el módulo de prospectos: el solicitante se registra como un contacto, igual que el asegurado, con todos sus datos desde el formulario, y la búsqueda del listado lo encuentra por su nombre.
- *Características.* El formulario del contacto trae nombre y apellido, teléfono, correo y dirección desglosada en código postal, país, provincia, ciudad y calle.
- *Justificación.* Viene listo: no hay nada que configurar.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-2-1-bitrix24-1-solicitante-cargado, A-2-1-bitrix24-2-busqueda.

### A.2.2 Calificación y priorización del solicitante

**Qué resuelve.** Dedicar el esfuerzo comercial primero a los que más cerca están de contratar.

**EspoCRM** · **2** (cumple) · costo de implementación **1**

- *Cómo lo hace.* El posible cliente no trae cobertura pedida ni urgencia: se agregan como dos campos de lista desde la administración y se ubican en el formulario y en el listado.
- *Características.* Se cargaron tres solicitantes en desorden y, al ordenar el listado por urgencia, el sistema respetó el orden de la lista —alta, media, baja— y no el alfabético, de modo que los más cercanos a contratar quedan arriba. Orden obtenido: Prioridad Alta · Prioridad Media · Prioridad Baja.
- *Justificación.* Configuración de una sola vez, sin programar.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-2-2-espocrm-1-ordenado-por-urgencia.

**Twenty** · **2** (cumple) · costo de implementación **1**

- *Cómo lo hace.* La persona no trae cobertura pedida ni urgencia: se agregan como dos campos de lista desde el modelo de datos. Al ordenar el listado por urgencia, los solicitantes quedan en el orden de las opciones —primero la alta, después la media y al final la baja—, no alfabético: el orden sale de cómo se define la lista.
- *Características.* El orden se puede guardar en una vista.
- *Justificación.* Definir los dos campos es trabajo de una sola vez.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-2-2-twenty-1-calificacion, A-2-2-twenty-2-ordenados-por-urgencia.

**Bitrix24** · **2** (cumple) · costo de implementación **1**

- *Cómo lo hace.* El contacto no trae cobertura pedida ni urgencia: se agregan como dos campos de lista desde su propio formulario.
- *Características.* Se cargaron tres solicitantes en desorden y, con un clic en el encabezado de la columna «Urgencia», el listado quedó ordenado primero la alta, después la media y al final la baja —el orden de las opciones de la lista, no el alfabético—; otro clic lo invierte. orden: Vera > Sosa > Ríos.
- *Justificación.* Definir los dos campos es configuración de una sola vez.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-2-2-bitrix24-1-calificacion, A-2-2-bitrix24-2-ordenados-por-urgencia.

### A.2.3 Conversión del solicitante en oportunidad de venta

**Qué resuelve.** Pasar del interés a la venta sin volver a pedirle los datos al cliente.

**EspoCRM** · **2** (cumple) · costo de implementación **0**

- *Cómo lo hace.* Los datos ya cargados pasan solos: el formulario de conversión trae el nombre escrito, y el asegurado queda con el mismo correo, teléfono y domicilio del solicitante, sin volver a tipearlos. Solo se completa lo que el solicitante no tiene —monto y fecha de cierre de la venta—. El solicitante queda marcado como convertido y la oportunidad, ligada al asegurado.
- *Características.* La ficha del solicitante trae la acción de convertir, que crea en un solo paso el asegurado y la oportunidad de venta.
- *Justificación.* Viene listo de fábrica.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-2-3-espocrm-1-conversion, A-2-3-espocrm-2-asegurado-creado.

**Twenty** · **2** (cumple) · costo de implementación **1**

- *Cómo lo hace.* Con un flujo de trabajo que se lanza a mano sobre la persona se arma esa acción, sin escribir código: crea la oportunidad con la cobertura que pidió el solicitante y lo deja como su contacto. Desde la ficha del solicitante, la acción aparece en el menú de comandos; al lanzarla se crea la oportunidad con la cobertura cargada —el flujo toma el valor interno de la lista, no su etiqueta— y vinculada a la persona, sin volver a escribir nada.
- *Características.* Twenty no trae una acción de convertir al solicitante: la persona y la oportunidad son registros separados.
- *Justificación.* Armar la acción es trabajo de una sola vez.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-2-3-twenty-1-accion-de-convertir, A-2-3-twenty-2-oportunidad-creada.

**Bitrix24** · **1** (cumple con reparo) · costo de implementación **2**

- *Cómo lo hace.* Con el solicitante como contacto, lo más cercano es crear la negociación desde su ficha.
- *Características.* Queda ligada a él y su teléfono y correo se ven en la negociación sin volver a escribirlos, pero no hay una acción que la arme con lo que el solicitante pidió: la cobertura solicitada, un campo propio del contacto, se vuelve a cargar a mano en cada negociación.
- *Justificación.* El módulo de prospectos, que convierte al interesado en oportunidad, no está en la edición gratuita. La negociación se crea igual desde la ficha del solicitante y queda ligada a él, pero lo que pidió se vuelve a cargar a mano en cada caso.
- *Comentario — con Bitrix24 Standard* (US$ 144 por mes, hasta 50 usuarios, abono recurrente) sería **2** (cumple, costo 1). El plan Standard incluye prospectos ilimitados, con su acción de convertir el prospecto en contacto, compañía y negociación llevando los datos cargados. Los campos propios pasan a la negociación si existen con el mismo nombre en las dos entidades: crearlos es configuración de una vez.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-2-3-bitrix24-1-prospectos-no-incluidos, A-2-3-bitrix24-2-negociacion-desde-el-contacto, A-2-3-bitrix24-3-negociacion-guardada.

> «Todo lo incluido en Basic, más: Almacenamiento de 100 GB Prospectos ilimitados Facturas y cotizaciones Diseñador de formularios CRM Firma electrónica Marketing por WhatsApp Eficiencia de tareas (KPI) Proyectos ilimitados Tableros ilimitados»
>
> — https://www.bitrix24.es/prices/, consultado el 30 de septiembre de 2026

> «US$ 144»
>
> — https://www.bitrix24.es/prices/, consultado el 30 de septiembre de 2026

### A.2.4 Embudo de oportunidades con etapas

**Qué resuelve.** Saber en qué punto está cada venta y cuántas hay en cada etapa.

**EspoCRM** · **2** (cumple) · costo de implementación **0**

- *Cómo lo hace.* Desde la ficha del asegurado, su panel de oportunidades crea una nueva ya ligada a él. La oportunidad avanza de calificación a propuesta, a negociación y a cerrada ganada: el sistema ajusta la probabilidad en cada paso, termina en el cien por ciento, y la historia de la ficha conserva el recorrido completo.
- *Características.* El embudo viene definido de fábrica con 6 etapas y una probabilidad de cierre asociada a cada una. Recorrido conservado: Qualification → Proposal → Negotiation → Closed Won.
- *Justificación.* Las etapas se pueden renombrar para que sigan el proceso comercial de la compañía, pero tal como vienen ya lo resuelven.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-2-4-espocrm-1-desde-la-ficha, A-2-4-espocrm-2-cerrada-ganada.

**Twenty** · **2** (cumple) · costo de implementación **0**

- *Cómo lo hace.* Desde la ficha del asegurado, su sección de oportunidades crea una nueva ya ligada a él como contacto. La oportunidad avanza etapa por etapa desde su ficha hasta la última, y el historial registra el avance —los cambios hechos seguidos por la misma persona se agrupan en una sola entrada—.
- *Características.* El embudo viene definido de fábrica con 6 etapas —New, Screening, Meeting, Proposal, Customer, Perdida— y una vista de tablero por etapa. 6 etapas recorridas; 1 entrada(s) de cambio de etapa en el historial.
- *Justificación.* Viene listo, aunque las etapas vienen con nombres en inglés y de una venta genérica: adaptarlas al seguro es configuración.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-2-4-twenty-1-oportunidad-cerrada.

**Bitrix24** · **2** (cumple) · costo de implementación **0**

- *Cómo lo hace.* Desde la ficha del contacto, la solapa de negociaciones crea una nueva ya ligada a él.
- *Características.* El embudo viene definido de fábrica —en desarrollo, crear documentos, factura, en progreso, factura final y el cierre, ganado o perdido— y la negociación se hizo avanzar con un clic en cada etapa de la barra de su ficha hasta cerrarla como ganada. etapa final: WON.
- *Justificación.* Viene listo, aunque las etapas son las de una venta genérica: adaptarlas al seguro es configuración.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-2-4-bitrix24-1-etapas-recorridas, A-2-4-bitrix24-2-negociacion-cerrada.

### A.2.5 Embudos diferenciados por ramo

**Qué resuelve.** Seguir cada ramo con sus propios pasos, porque no se vende igual un seguro de vida que uno de automotor.

**EspoCRM** · **2** (cumple) · costo de implementación **1**

- *Cómo lo hace.* Se crea un segundo embudo para los seguros de personas desde su propia pantalla, y su panel de etapas permite adaptarlas al ramo: por ejemplo, la calificación pasa a ser la declaración de salud, la propuesta la evaluación médica, y se quita la negociación, que en ese ramo no existe. Una oportunidad se carga eligiendo ese embudo desde el formulario y avanza por sus etapas y no por las del otro.
- *Características.* Los embudos múltiples vienen en el producto y se habilitan por entidad, con una casilla de su configuración. Embudo nuevo: Prospección → Declaración de salud → Evaluación médica → Cerrado ganado → Cerrado perdido.
- *Justificación.* Es configuración de una sola vez, sin programar.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-2-5-espocrm-1-embudos-habilitados, A-2-5-espocrm-2-etapas-del-segundo-embudo, A-2-5-espocrm-3-oportunidad-en-el-embudo.

**Twenty** · **2** (cumple) · costo de implementación **1**

- *Cómo lo hace.* Un segundo embudo se arma con un segundo campo de lista —para los seguros de personas: cotización, examen médico, emisión— y un tablero agrupado por él, donde la oportunidad queda ubicada en el segundo embudo.
- *Características.* Twenty tiene un solo embudo por objeto: las etapas de la oportunidad son un campo de lista, y el tablero agrupa por ese campo. Pero las dos listas conviven en todas las oportunidades: nada impide que una oportunidad de automotor tenga etapa de vida, ni separa qué embudo sigue cada una.
- *Justificación.* El procedimiento pide crear un segundo embudo con etapas distintas y asignarle una oportunidad, y se logra con configuración de una vez. Que las listas de etapas convivan en todas las oportunidades no impide asignar cada una a su embudo, como en EspoCRM, donde también se elige el embudo en cada alta.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-2-5-twenty-1-segundo-embudo.

**Bitrix24** · **0** (no cumple)

- *Cómo lo hace.* Desde «Pipelines y túneles de ventas», al pedir «Agregar pipeline» el sistema no abre el embudo nuevo: informa que la cantidad máxima de pipelines depende del plan y ofrece actualizar; la lista de embudos sigue con uno solo.
- *Características.* La edición gratuita trae un solo embudo, el pipeline general.
- *Justificación.* El fabricante publica los embudos de ventas como función que se suma con el plan Basic.
- *Comentario — con Bitrix24 Basic* (US$ 69 por mes, hasta 5 usuarios, abono recurrente) sería **2** (cumple, costo 1). Con el plan de entrada se pueden crear embudos adicionales, cada uno con sus propias etapas: uno por ramo y una negociación en el que corresponde. Definirlos es configuración de una vez. Los planes superiores suben la cantidad de embudos y no cambian lo que se resuelve.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-2-5-bitrix24-1-al-agregar-el-embudo.

> «Todo lo incluido en Free, más: Almacenamiento de 24 GB IA para el trabajo diario en Bitrix24 Embudos de ventas Negociaciones recurrentes Pagos en línea Integración de correo electrónico Integración de WhatsApp Integración de telefonía»
>
> — https://www.bitrix24.es/prices/, consultado el 30 de septiembre de 2026

> «Funciones clave: Almacenamiento de 5 GB CRM básico (negociaciones, contactos) Tareas (Kanban, Gantt) Calendarios compartidos Chat y videollamadas»
>
> — https://www.bitrix24.es/prices/, consultado el 30 de septiembre de 2026

> «Basic Ideal para emprendedores individuales y equipos pequeños que están empezando US$ 69 US$ 69 US$ 49 / compañía / mes / facturado mensualmente / compañía / mes / facturación anual Un pago de US$ 588 / año Ahorra US$ 240 al año incluye 5 usuarios Comprar Comprar Todo lo incluido en Free, más: Almacenamiento de 24 GB IA para el trabajo diario en Bitrix24 Embudos de ventas Negociaciones recurrentes Pagos en línea Integración de correo electrónico Integración de WhatsApp Integración de telefonía»
>
> — https://www.bitrix24.es/prices/, consultado el 30 de septiembre de 2026

### A.2.6 Oportunidades de cambio y ampliación sobre la cartera

**Qué resuelve.** Venderle más al que ya es cliente: quién no tiene un ramo y a quién se le vence la póliza.

**EspoCRM** · **1** (cumple con reparo) · costo de implementación **2**

- *Cómo lo hace.* El conjunto de los próximos a vencer sale directo: el listado de pólizas filtrado por vencimiento en treinta días muestra cada póliza con su titular. Para obtener a los que tienen automotor y no hogar hay que sacar los dos listados y cruzarlos por fuera del sistema, trabajo que se repite cada vez que el área comercial arma una campaña de ampliación.
- *Características.* El otro conjunto no: el listado de asegurados no admite condiciones sobre el ramo de sus pólizas, y el de pólizas filtra una por una.
- *Justificación.* El conjunto de los próximos a vencer sale directo del listado filtrado, pero obtener a los que tienen automotor y no hogar exige sacar los dos listados y cruzarlos por fuera del sistema, trabajo que se repite en cada campaña de ampliación. El módulo de informes que vende el fabricante resuelve ese cruce con condiciones de pertenencia y de exclusión sobre los registros relacionados.
- *Comentario — con Advanced Pack* (US$ 395 por año y por instalación, abono recurrente) sería **2** (cumple, costo 1). Un informe de asegurados con un grupo de pertenencia —tienen pólizas de automotor— y uno de exclusión —no tienen de hogar— devuelve el conjunto directo, y se guarda para repetirlo.
- *Comentario — con EspoCRM Cloud Basic* (US$ 15 por usuario por mes, mínimo 3 usuarios, abono recurrente) sería **2** (cumple, costo 1). El servicio en la nube incluye el módulo de informes, con las mismas condiciones.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-2-6-espocrm-1-polizas-de-automotor, A-2-6-espocrm-2-polizas-de-hogar, A-2-6-espocrm-3-proximas-a-vencer, A-2-6-espocrm-4-condiciones-sobre-asegurados.

> «NOT IN provides the ability to filter records that don't meet specified criteria. E.g. listing accounts that don't have any opportunity with 'Closed Won' or 'Closed Lost' status.»
>
> — https://docs.espocrm.com/user-guide/reports/, consultado el 30 de octubre de 2026

> «IN is similar to AND group but utilizes a sub-query.»
>
> — https://docs.espocrm.com/user-guide/reports/, consultado el 30 de octubre de 2026

> «$395.00 1 Year License + Upgrades»
>
> — https://www.espocrm.com/extensions/advanced-pack/, consultado el 30 de octubre de 2026

> «1.1 Subject to your continuous compliance with the Agreement and payment of the applicable license fees, EspoCRM grants you a non-exclusive, non-transferable, worldwide, limited right to use the Software on a single EspoCRM Application instance on a single server for the Licensed Period. After the license period expires, you must renew or purchase a new license to continue using the Software. You may use or modify the Software only for your own internal business purposes or for non-commercial or personal use.»
>
> — https://www.espocrm.com/extension-license-agreement/, consultado el 30 de octubre de 2026

> «Basic $15.00 per user/month minimum 3 users 3GB file storage per user 100,000 records SSL Encryption (256 bit keys, TLS 1.3) Full feature set All extensions included External access API 2000+ integrations * 12x5 (hours/days) support Sign Up Free Trial Free Trial is provided for 30 days»
>
> — https://www.espocrm.com/cloud/, consultado el 30 de octubre de 2026

**Twenty** · **1** (cumple con reparo) · costo de implementación **2**

- *Cómo lo hace.* El conjunto de los próximos a vencer sale directo: el listado de pólizas filtrado por vencimiento en los próximos treinta días muestra cada póliza con su titular.
- *Características.* El otro conjunto no: el filtro del listado de asegurados solo ofrece sus propios campos, no las pólizas que tiene, así que «tiene automotor y no hogar» no se puede preguntar. 9 pólizas próximas a vencer.
- *Justificación.* Se obtiene filtrando las pólizas por cada ramo y comparando a mano las dos listas de titulares, cada vez que se quiere armar la oferta.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-2-6-twenty-1-filtros-del-asegurado, A-2-6-twenty-2-proximas-a-vencer.

**Bitrix24** · **1** (cumple con reparo) · costo de implementación **2**

- *Cómo lo hace.* El conjunto de los próximos a vencer sale directo: el filtro del listado de negociaciones sobre la fecha de fin de vigencia, «próximos 30 días», trae las pólizas que vencen en ese plazo y deja afuera las demás, con su cliente en el listado.
- *Características.* El otro conjunto no: el filtro del listado de contactos solo ofrece campos del propio contacto, no las pólizas que tiene, así que «tiene automotor y no hogar» no se puede preguntar. 61 campos filtrables del contacto, ninguno sobre sus pólizas · 1 póliza próxima a vencer.
- *Justificación.* Se obtiene filtrando las pólizas por cada ramo y comparando a mano las dos listas de clientes, cada vez que se quiere armar la oferta.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-2-6-bitrix24-1-filtros-del-contacto, A-2-6-bitrix24-2-polizas-por-ramo, A-2-6-bitrix24-3-proximas-a-vencer.

## A.3 Productores y actividad comercial

### A.3.1 Registro de productores y asignación de cartera

**Qué resuelve.** Que cada asegurado tenga un productor responsable y se sepa quién atiende a quién.

**EspoCRM** · **2** (cumple) · costo de implementación **0**

- *Cómo lo hace.* Una productora se da de alta desde la administración de usuarios, con su rol, que la limita a lo propio, y se le asignan varios asegurados de una sola vez, marcándolos en el listado y cambiando el responsable con la actualización masiva.
- *Características.* Al ingresar con su cuenta, su listado de asegurados muestra exactamente esos tres.
- *Justificación.* El responsable asignado viene de fábrica en todas las entidades, y la actualización masiva lo admite sin configurar nada.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-3-1-espocrm-1-alta-del-productor, A-3-1-espocrm-2-cartera-de-la-productora.

**Twenty** · **2** (cumple) · costo de implementación **1**

- *Cómo lo hace.* El productor se suma como usuario del espacio de trabajo con el enlace de invitación, desde la pantalla de miembros: se registra con su correo y su clave, y queda con su propia cuenta. Se marcan asegurados en el listado y, con la actualización masiva, se los deja a cargo del productor de una sola vez.
- *Características.* La persona no trae un responsable: se le agregó al modelo una relación con los usuarios.
- *Justificación.* Agregar el responsable es trabajo de una sola vez.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-3-1-twenty-1-miembros, A-3-1-twenty-2-seleccion, A-3-1-twenty-3-asignados.

**Bitrix24** · **2** (cumple) · costo de implementación **1**

- *Cómo lo hace.* Un usuario se da de alta como empleado desde «Empleados», con su propia cuenta y contraseña: es el productor.
- *Características.* Sobre el listado de contactos —que en la edición gratuita hace de cartera de asegurados, a falta de una entidad propia— se seleccionan varios registros y se les cambia el responsable en bloque a ese productor, sin programar nada. 3 asegurados asignados al productor gomez.
- *Justificación.* El alta del usuario es un trámite de una vez por productor; asignar la cartera es una acción del listado que se repite cuando cambia la asignación.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-3-1-bitrix24-1-productor-alta, A-3-1-bitrix24-2-asegurados, A-3-1-bitrix24-3-seleccion, A-3-1-bitrix24-4-asignados.

### A.3.2 Historial de la actividad con el cliente

**Qué resuelve.** Que cualquiera que atienda al cliente sepa qué se habló antes, sin preguntarle de nuevo.

**EspoCRM** · **2** (cumple) · costo de implementación **0**

- *Cómo lo hace.* Cada actividad se registra en la ficha y el historial las muestra ordenadas por fecha, la más reciente primero, cada una con su responsable y con quién la cargó.
- *Características.* La ficha del asegurado trae un historial de actividades con acciones para registrar una llamada o una reunión sin salir de ella. Autor registrado: Admin.
- *Justificación.* Viene de fábrica. Es lo que permite que cualquiera que atienda al asegurado sepa qué se habló antes.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-3-2-espocrm-1-bitacora.

**Twenty** · **2** (cumple) · costo de implementación **0**

- *Cómo lo hace.* Twenty no distingue llamadas de reuniones —las reuniones solo llegan sincronizando un calendario externo—, así que cada actividad se registra como una nota desde la pestaña de notas de la ficha. Quedan en el historial del asegurado, en orden de fecha y cada una con su autor y su hora.
- *Características.* La ficha del asegurado tiene notas y un historial.
- *Justificación.* Viene listo; el tipo de actividad queda en el título que escribe quien la registra.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-3-2-twenty-1-historial.

**Bitrix24** · **2** (cumple) · costo de implementación **0**

- *Cómo lo hace.* Desde la pestaña «Actividad» de la ficha se registran la llamada y la reunión como pendientes que indican el tipo en su texto; la línea de tiempo las muestra en orden cronológico, con su autor y su momento.
- *Características.* La línea de tiempo del contacto registra actividades con su autor y su momento, en orden cronológico, sin configurar nada. En la edición gratuita la llamada y la reunión no son tipos de actividad propios: la llamada nativa exige telefonía y la reunión, una integración de videoconferencia. 2 actividades registradas.
- *Justificación.* El procedimiento pide que la llamada y la reunión queden visibles en orden cronológico con su autor, y así quedan sin configurar nada; que no sean tipos propios no impide registrarlas.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-3-2-bitrix24-1-ficha, A-3-2-bitrix24-2-llamada, A-3-2-bitrix24-3-reunion.

### A.3.3 Agenda y carga de trabajo del productor

**Qué resuelve.** Que el productor organice su día con lo que tiene pendiente a la vista.

**EspoCRM** · **2** (cumple) · costo de implementación **0**

- *Cómo lo hace.* Al ingresar con la cuenta del productor, su página de inicio muestra sus próximas actividades —como una visita agendada— y el calendario reúne reuniones, llamadas y tareas en vistas por día, semana y mes.
- *Características.* Cada productor ve lo suyo sin preparar nada.
- *Justificación.* El tablero y el calendario vienen de fábrica, y cada uno puede sumar a su inicio sus tareas, sus casos o sus oportunidades.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-3-3-espocrm-1-inicio-del-productor, A-3-3-espocrm-2-calendario.

**Twenty** · **2** (cumple) · costo de implementación **0**

- *Cómo lo hace.* Al ingresar con la cuenta del productor, las tareas traen de fábrica una vista de las asignadas a él: ahí figuran sus pendientes con la fecha comprometida.
- *Características.* Las tareas admiten además una vista de calendario por fecha de vencimiento. Las reuniones agendadas aparecen en la ficha solo si el productor conecta su calendario externo.
- *Justificación.* Viene listo.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-3-3-twenty-1-asignadas-a-mi.

**Bitrix24** · **2** (cumple) · costo de implementación **0**

- *Cómo lo hace.* Con la sesión propia del productor, «Tareas» abre «Mis tareas» con lo que tiene asignado, con su fecha límite, y el Calendario del portal trae ese mismo compromiso; el CRM suma «Mis actividades» para las llamadas y reuniones de sus asegurados.
- *Características.* Son vistas que vienen de fábrica en la edición gratuita, ya filtradas a su cuenta.
- *Justificación.* No hay nada que configurar.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-3-3-bitrix24-1-mis-tareas, A-3-3-bitrix24-2-calendario, A-3-3-bitrix24-3-mis-actividades.

### A.3.4 Proyección de los movimientos comerciales

**Qué resuelve.** Anticipar cuánto se va a vender en el período con las oportunidades abiertas.

**EspoCRM** · **1** (cumple con reparo) · costo de implementación **2**

- *Cómo lo hace.* Cada oportunidad se carga con monto y etapa, y el sistema le asigna la probabilidad de la etapa.
- *Características.* El tablero de canalización de ventas suma los montos por etapa para el período elegido —mes, trimestre, año, año fiscal o un rango—, de modo que muestra cuánto hay en juego en cada instancia. Lo que no calcula es la proyección: cada oportunidad tiene su monto ponderado por la probabilidad, pero ningún tablero ni listado los totaliza, y el total esperado del período —286.000 en este caso— se obtiene exportando y sumando afuera cada vez. Por etapa: {"Prospecting":0,"Qualification":80000,"Proposal":300000,"Negotiation":150000,"Closed Won":0} · proyección ponderada no mostrada: 286000.
- *Justificación.* El tablero de canalización suma los montos por etapa, pero el total esperado del período se obtiene exportando y sumando afuera cada vez, porque ningún tablero ni listado totaliza el monto ponderado. El módulo de informes del fabricante suma cualquier campo agrupado por período, el ponderado incluido.
- *Comentario — con Advanced Pack* (US$ 395 por año y por instalación, abono recurrente) sería **2** (cumple, costo 1). Un informe agrupado por mes de cierre suma el monto ponderado y da la proyección del período.
- *Comentario — con EspoCRM Cloud Basic* (US$ 15 por usuario por mes, mínimo 3 usuarios, abono recurrente) sería **2** (cumple, costo 1). El servicio en la nube incluye el módulo de informes.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-3-4-espocrm-1-canalizacion-del-mes.

> «Grid reports display summarized values, can be grouped by one or two fields, and support chart visualization.»
>
> — https://docs.espocrm.com/user-guide/reports/, consultado el 30 de octubre de 2026

> «$395.00 1 Year License + Upgrades»
>
> — https://www.espocrm.com/extensions/advanced-pack/, consultado el 30 de octubre de 2026

> «1.1 Subject to your continuous compliance with the Agreement and payment of the applicable license fees, EspoCRM grants you a non-exclusive, non-transferable, worldwide, limited right to use the Software on a single EspoCRM Application instance on a single server for the Licensed Period. After the license period expires, you must renew or purchase a new license to continue using the Software. You may use or modify the Software only for your own internal business purposes or for non-commercial or personal use.»
>
> — https://www.espocrm.com/extension-license-agreement/, consultado el 30 de octubre de 2026

> «Basic $15.00 per user/month minimum 3 users 3GB file storage per user 100,000 records SSL Encryption (256 bit keys, TLS 1.3) Full feature set All extensions included External access API 2000+ integrations * 12x5 (hours/days) support Sign Up Free Trial Free Trial is provided for 30 days»
>
> — https://www.espocrm.com/cloud/, consultado el 30 de octubre de 2026

**Twenty** · **1** (cumple con reparo) · costo de implementación **2**

- *Cómo lo hace.* Los tableros suman los montos por etapa y por fecha de cierre, de modo que muestran cuánto hay en juego en cada período, pero no el total ponderado por la probabilidad de cerrarlo.
- *Características.* Las oportunidades tienen monto y fecha de cierre, pero no probabilidad, y el modelo no admite campos calculados.
- *Justificación.* Una probabilidad se puede agregar como campo, pero el total proyectado hay que calcularlo fuera, cada vez que se lo quiere mirar.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-3-4-twenty-1-tablero, A-3-4-twenty-2-tipos-de-campo.

**Bitrix24** · **1** (cumple con reparo) · costo de implementación **2**

- *Cómo lo hace.* La negociación, que hace de oportunidad comercial, se carga con su monto y su probabilidad, y quedan guardados.
- *Características.* La negociación, que hace de oportunidad comercial, admite monto y probabilidad: el campo «Probabilidad» existe pero viene oculto, y se agrega al formulario una vez con «Seleccionar campo». Lo que no hay en la edición gratuita es el total proyectado por período: el listado suma importes sin ponderarlos por la probabilidad, y el informe de tendencia de ventas, en Analítica, no se abre y ofrece en su lugar BI Builder, que exige actualizar el plan. 2 oportunidades con monto y probabilidad.
- *Justificación.* La proyección se calcula fuera del sistema cada vez que se la necesita.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-3-4-bitrix24-1-formulario, A-3-4-bitrix24-2-listado, A-3-4-bitrix24-3-tendencia-de-ventas.

## A.4 Marketing, segmentación y reputación

### A.4.1 Segmentación reutilizable de la cartera

**Qué resuelve.** Dirigirse a un grupo de asegurados con algo en común sin volver a armar la lista cada vez.

**EspoCRM** · **2** (cumple) · costo de implementación **1**

- *Cómo lo hace.* Desde el listado de asegurados se define un conjunto por un criterio —por ejemplo, los que viven en una ciudad— y se lo guarda con nombre desde el menú de filtros.
- *Características.* Al volver al listado, el segmento figura entre los filtros guardados y devuelve el mismo conjunto sin rearmarlo. 4 asegurados en el segmento.
- *Justificación.* Guardar segmentos viene de fábrica; que la ciudad esté disponible como condición exige habilitarla una vez entre los filtros de búsqueda.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-4-1-espocrm-1-segmento-guardado, A-4-1-espocrm-2-segmento-reabierto.

**Twenty** · **2** (cumple) · costo de implementación **0**

- *Cómo lo hace.* Desde el listado de asegurados se define un conjunto por un criterio —por ejemplo, los que están a cargo de un productor— y se lo guarda con nombre como una vista, desde el propio filtro.
- *Características.* Al volver al listado, el segmento figura en el selector de vistas; al abrirlo trajo de nuevo los mismos asegurados, y como el filtro se guarda y no la lista, un asegurado que cumpla el criterio más adelante entra solo. 3 asegurados en el segmento.
- *Justificación.* Viene listo.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-4-1-twenty-1-segmento-guardado, A-4-1-twenty-2-segmento-reabierto.

**Bitrix24** · **2** (cumple) · costo de implementación **1**

- *Cómo lo hace.* Desde el listado de contactos se define un conjunto por un criterio —por ejemplo, los asegurados que llegaron por recomendación— y se lo guarda con nombre desde el propio filtro, sin programar.
- *Características.* Al salir del listado y volver, el segmento figura entre los filtros guardados; al abrirlo trajo de nuevo los mismos asegurados, y como se guarda el criterio y no la lista, uno que lo cumpla más adelante entra solo. 3 asegurados en el segmento.
- *Justificación.* El origen no viene entre los campos visibles del filtro: agregarlo es configuración de una vez.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-4-1-bitrix24-1-segmento-guardado, A-4-1-bitrix24-2-segmento-reabierto.

### A.4.2 Diseño de campañas sobre un segmento

**Qué resuelve.** Hacer llegar una promoción a quienes les interesa, con un mensaje adaptado a cada uno.

**EspoCRM** · **2** (cumple) · costo de implementación **0**

- *Cómo lo hace.* El segmento guardado se vuelca entero a una lista de destinatarios, seleccionando desde el listado con el mismo filtro guardado, y se crea una campaña de correo dirigida a esa lista.
- *Características.* El contenido se escribió en una plantilla con marcadores que el sistema reemplaza por los datos de cada destinatario —el nombre en el asunto y en el saludo—, de modo que cada asegurado recibe un mensaje dirigido a él. 4 destinatarios en la lista de la campaña.
- *Justificación.* Campañas, listas y plantillas vienen de fábrica.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-4-2-espocrm-1-lista-desde-el-segmento, A-4-2-espocrm-2-contenido-personalizado, A-4-2-espocrm-3-campana.

**Twenty** · **2** (cumple) · costo de implementación **1**

- *Cómo lo hace.* Una campaña se arma con un flujo de trabajo que se lanza sobre los registros marcados y le envía a cada uno un correo desde la casilla comercial, con su nombre en el asunto: se abre el segmento guardado, se marcan sus asegurados, se lanza la campaña y cada uno recibe su mensaje personalizado.
- *Características.* La edición evaluada no trae campañas: el fabricante las tiene en beta y las habilita a pedido. 3 de 3 mensajes recibidos.
- *Justificación.* El procedimiento pide crear una campaña dirigida a un segmento guardado y personalizar su contenido, y se logra con una automatización configurada una vez. La baja de destinatarios y la medición se evalúan en B.2.9 y A.4.3.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-4-2-twenty-1-campana, A-4-2-twenty-2-campana-lanzada.

> «Beta Feature: Email campaigns are in beta. Contact us via chat to enable them for your workspace.»
>
> — https://docs.twenty.com/user-guide/email-campaigns/overview, consultado el 30 de octubre de 2026

**Bitrix24** · **0** (no cumple)

- *Cómo lo hace.* En la edición gratuita no se puede crear una campaña: al pedir «Crear boletín» sobre un segmento guardado, el sistema responde que la herramienta «estará disponible una vez que actualice su plan»; desde Marketing, «Campaña de correo electrónico» dice que se desbloquea con el plan Standard o el Professional.
- *Características.* El producto sí la tiene: la campaña se dirige a un segmento existente y su contenido se personaliza con datos del CRM, como el nombre.
- *Justificación.* El comparativo del fabricante lo confirma: el correo masivo no figura en la edición gratuita ni en el plan Basic.
- *Comentario — con Bitrix24 Standard* (US$ 144 por mes, hasta 50 usuarios, abono recurrente) sería **2** (cumple, costo 1). Con el plan Standard —el de entrada para el correo masivo, hasta 50.000 correos por mes— la campaña se arma sobre un segmento del CRM y se personaliza con variables como el nombre o la fecha de nacimiento, sin programar. Hay que dejar configurada una vez la casilla desde la que sale y el límite mensual.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-4-2-bitrix24-1-boletin-sobre-el-segmento, A-4-2-bitrix24-2-campana-de-correo.

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

### A.4.3 Medición de los resultados de la campaña

**Qué resuelve.** Saber si una campaña funcionó antes de repetirla.

**EspoCRM** · **2** (cumple) · costo de implementación **1**

- *Cómo lo hace.* La campaña se envía a su lista y cada destinatario recibe su mensaje con su propio nombre en el asunto.
- *Características.* El registro de la campaña anotó cada envío y, cuando uno de los asegurados abrió el mensaje, anotó también la apertura, con la fecha y el destinatario. Lo mismo hace con los clics en enlaces seguidos y las bajas. 4 envíos y 1 apertura registrados.
- *Justificación.* La medición viene en el producto; lo que hay que configurar una vez es el servidor de correo saliente de la compañía y activar, en esa misma configuración, el seguimiento de aperturas, que viene apagado.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-4-3-espocrm-0-envio-programado, A-4-3-espocrm-1-resultados-de-la-campana.

**Twenty** · **2** (cumple) · costo de implementación **1**

- *Cómo lo hace.* Las respuestas llegan: la casilla sincronizada trae la respuesta del asegurado a su ficha.
- *Características.* De la campaña armada con un flujo de trabajo queda el registro del envío: cada lanzamiento es una corrida con el resultado de cada paso. Las aperturas no se registran, y nada reúne los resultados de la campaña: cuántos la recibieron, cuántos contestaron. 1 corrida(s) registradas; respuesta en la ficha: sí.
- *Justificación.* El procedimiento pide registrar envíos, aperturas o respuestas: registra los envíos y las respuestas, con la automatización configurada una vez.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-4-3-twenty-1-envios, A-4-3-twenty-2-respuesta-en-la-ficha.

**Bitrix24** · **0** (no cumple)

- *Cómo lo hace.* El fabricante documenta lo que el producto mide cuando la campaña sale: envíos, y con el seguimiento del correo activado, aperturas y clics.
- *Justificación.* En la edición gratuita no hay campañas que medir: el listado de Marketing › Campañas trae las columnas Estado, Estadística y Consentimiento pero está vacío, y crear una campaña de correo pide el plan Standard o el Professional.
- *Comentario — con Bitrix24 Standard* (US$ 144 por mes, hasta 50 usuarios, abono recurrente) sería **2** (cumple, costo 1). Con el plan Standard cada campaña registra su estadística en el listado de campañas; las aperturas y los clics se miden si se activa el seguimiento del correo y de los enlaces, una opción de configuración que se deja prendida una vez.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-4-3-bitrix24-1-listado-de-campanas, A-4-3-bitrix24-2-crear-campana.

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

### A.4.4 Captación de interesados desde redes sociales

**Qué resuelve.** Que el contacto que llega por una red social entre a la base como cualquier otro.

**EspoCRM** · **1** (cumple con reparo) · costo de implementación **2**

- *Cómo lo hace.* Lo que sí trae es la captura de posibles clientes, un formulario web propio que carga solo a cada interesado que lo completa.
- *Características.* El producto no se conecta con ninguna red social: la administración de integraciones no ofrece ninguna y el catálogo del fabricante tampoco.
- *Justificación.* Enlazado desde las publicaciones y los perfiles de la compañía, incorpora a la base a quien llega desde una red; pero cada campaña en la red tiene que llevar ese enlace, y los interesados que escriben por mensaje o comentan en la publicación se cargan a mano.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-4-4-espocrm-1-integraciones, A-4-4-espocrm-2-captura-de-posibles-clientes.

> «The Web-to-Lead feature provides the ability to create web forms for capturing information about website visitors and then save this information as new leads to the CRM instance.»
>
> — https://www.espocrm.com/features/web-to-lead/, consultado el 28 de septiembre de 2026

**Twenty** · **1** (cumple con reparo) · costo de implementación **2**

- *Cómo lo hace.* Lo que sí trae es un disparador de flujos por webhook: un flujo recibe nombre, apellido y correo y da de alta a la persona, de modo que un pedido con esos datos —lo que enviaría un intermediario al llegar un interesado desde un formulario de anuncios— la incorpora a la base.
- *Características.* El producto no se conecta con ninguna red social: las cuentas que se pueden conectar son de correo y calendario, y el catálogo de aplicaciones no ofrece ninguna.
- *Justificación.* La conexión con cada red queda a cargo de ese intermediario, que hay que contratar y mantener aparte.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-4-4-twenty-1-entrada-por-webhook, A-4-4-twenty-2-interesado-incorporado.

**Bitrix24** · **2** (cumple) · costo de implementación **1**

- *Cómo lo hace.* En Clientes › Contact center se conecta una vez el bot de Telegram de la compañía al canal abierto, pegando su clave de acceso, sin planes de pago. Cuando un interesado le escribe al bot, el sistema crea solo, sin intervención de nadie, un contacto y una negociación (la ficha la menciona como prospecto); desde la ficha del contacto, con «Abrir», se ve la conversación con el mensaje tal como llegó.
- *Características.* El contacto queda con el origen «Telegram - Canal Abierto» y con el enlace al canal en la ficha; la negociación se llama «Nawi - Canal Abierto», se asigna al responsable de la cola del canal y la conversación completa queda en el historial del contacto. El texto del mensaje no se vuelca a campos (cobertura solicitada y urgencia quedan vacíos): se completan a mano desde la ficha. La edición gratuita incluye Telegram además de Facebook e Instagram.
- *Justificación.* La necesidad queda resuelta: el interesado que escribe por la red entra a la base como cualquier otro, con su origen. Conectar el canal es configuración de una sola vez, por eso el costo es 1; completar los datos del seguro en cada contacto es tarea del agente, pero no impide que el interesado esté en la base.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-4-4-bitrix24-1-canales, A-4-4-bitrix24-2-contacto-creado, A-4-4-bitrix24-3-conversacion.

### A.4.5 Escucha de menciones en canales públicos

**Qué resuelve.** Enterarse de lo que se dice de la compañía y de la competencia.

**EspoCRM** · **0** (no cumple)

- *Cómo lo hace.* El producto no ofrece el seguimiento de lo que se dice de la compañía y de la competencia en redes y medios, en ninguna edición: la administración no tiene ninguna función de redes sociales y el catálogo oficial de extensiones —informes y automatización, ventas, proyectos, inteligencia artificial, telefonía, agenda de reuniones, integraciones con Outlook, Google, Zoom, Stripe y MailChimp— no incluye ninguna.
- *Justificación.* La compañía tendría que resolverlo con otra herramienta.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-4-5-espocrm-1-administracion.

> «Real Estate»
>
> — https://www.espocrm.com/extensions/, consultado el 28 de septiembre de 2026

**Twenty** · **0** (no cumple)

- *Cómo lo hace.* El producto no ofrece el seguimiento de lo que se dice de la compañía y de la competencia en redes y medios, en ninguna edición: la configuración no tiene ninguna función de redes sociales y el catálogo de aplicaciones del fabricante, dentro del propio producto, ofrece una sola —el seguimiento del último contacto con cada persona—.
- *Justificación.* El fabricante presenta las aplicaciones como una vía para extender el producto con código propio: una escucha de redes habría que desarrollarla.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-4-5-twenty-1-catalogo-de-aplicaciones.

> «Extend Twenty with code — custom objects, server-side logic, UI components, and AI agents, all as TypeScript packages.»
>
> — https://docs.twenty.com/getting-started/core-concepts/apps, consultado el 28 de septiembre de 2026

**Bitrix24** · **1** (cumple con reparo) · costo de implementación **2**

- *Cómo lo hace.* Lo más cercano es el conector «Facebook: Comentarios» del centro de contacto, disponible en la edición gratuita, que trae los comentarios de la página propia de la compañía al CRM: cubre lo que se dice en sus propios canales, y solo ahí. El catálogo de aplicaciones tampoco ofrece una de escucha: para «menciones», «social listening» y «brand monitoring» no aparece ninguna.
- *Características.* El fabricante promociona «monitoreo de redes desde el CRM», que en el producto es ese mismo intercambio de mensajes y comentarios propios.
- *Justificación.* Cubre lo que se dice en los canales propios de la compañía, con el conector de comentarios de Facebook. No sigue menciones en canales públicos ni de la competencia: para eso hace falta una herramienta externa.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-4-5-bitrix24-1-comentarios-de-la-pagina, A-4-5-bitrix24-2-market-sin-escucha.

> «Redes sociales y messengers Vincule diferentes redes sociales y messengers, y permita que sus clientes se comuniquen mediante el canal de comunicación que más les convenga.»
>
> — https://www.bitrix24.es/prices/compare_cloud_plans.php, consultado el 29 de septiembre de 2026

> «Social media monitoring and engagement from your CRM»
>
> — https://www.bitrix24.com/articles/don-t-let-one-tweet-ruin-everything-10-social-media-crisis-hacks-you-need-to-know.php, consultado el 29 de septiembre de 2026

### A.4.6 Publicación en redes desde el sistema

**Qué resuelve.** Comunicar en las redes desde el mismo lugar donde se gestiona al cliente.

**EspoCRM** · **0** (no cumple)

- *Cómo lo hace.* El producto no ofrece la publicación en redes sociales desde el propio sistema, en ninguna edición: la administración no tiene ninguna función de redes sociales y el catálogo oficial de extensiones —informes y automatización, ventas, proyectos, inteligencia artificial, telefonía, agenda de reuniones, integraciones con Outlook, Google, Zoom, Stripe y MailChimp— no incluye ninguna.
- *Justificación.* La compañía tendría que resolverlo con otra herramienta.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-4-6-espocrm-1-administracion.

> «Real Estate»
>
> — https://www.espocrm.com/extensions/, consultado el 28 de septiembre de 2026

**Twenty** · **0** (no cumple)

- *Cómo lo hace.* El producto no permite publicar en redes sociales desde el propio sistema, en ninguna edición: las cuentas que se pueden conectar son de correo y de calendario —IMAP, SMTP, CalDAV—, ninguna red social, y el catálogo de aplicaciones del fabricante no ofrece ninguna para eso.
- *Justificación.* Publicar exigiría desarrollar una aplicación propia.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-4-6-twenty-1-cuentas-conectables.

> «Extend Twenty with code — custom objects, server-side logic, UI components, and AI agents, all as TypeScript packages.»
>
> — https://docs.twenty.com/getting-started/core-concepts/apps, consultado el 28 de septiembre de 2026

**Bitrix24** · **0** (no cumple)

- *Cómo lo hace.* El sistema no publica en las redes: lo único que emite hacia Facebook e Instagram son anuncios pagos sobre publicaciones que ya existen en la red o sobre un segmento del CRM, desde «Marketing › Anuncios de Facebook», que en la edición gratuita pide actualizar al plan Standard o Professional. No hay donde componer un texto y emitirlo a la página conectada.
- *Justificación.* El fabricante lo declara en su documentación de la integración con Facebook e Instagram: publicar en la página de Facebook figura entre las opciones que todavía no están disponibles. La conexión de la página que sí existe es la de comentarios y mensajes recibidos, no la de publicación.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-4-6-bitrix24-1-anuncio-de-facebook.

> «Options like Post on Facebook page, Facebook page card, and Messenger chat are not available yet.»
>
> — https://helpdesk.bitrix24.com/open/24788840/, consultado el 30 de septiembre de 2026

> «Facebook Lance anuncios en Facebook dirigidos a un segmento de clientes específico. Esta es una excelente manera de optimizar sus gastos en publicidad.»
>
> — https://www.bitrix24.es/prices/compare_cloud_plans.php, consultado el 30 de septiembre de 2026

### A.4.7 Registro de la competencia y del motivo de pérdida

**Qué resuelve.** Aprender de las ventas perdidas: por qué se perdieron y contra quién.

**EspoCRM** · **2** (cumple) · costo de implementación **1**

- *Cómo lo hace.* El motivo y el competidor que ganó la venta no vienen de fábrica: se agregan como dos campos de la oportunidad desde la administración, una lista de motivos y el nombre del competidor, y quedan registrados junto con la pérdida.
- *Características.* Al marcar una oportunidad como perdida, el sistema conserva por su cuenta la etapa en la que se perdió —negociación, en este caso—.
- *Justificación.* Con eso la compañía puede saber por qué pierde ventas y contra quién.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-4-7-espocrm-1-perdida-con-motivo.

**Twenty** · **2** (cumple) · costo de implementación **1**

- *Cómo lo hace.* Desde Configuración › Modelo de datos se agrega la etapa «Perdida» a la lista de etapas y dos campos: el motivo, como lista, y el competidor que se quedó con la venta. Al marcar una oportunidad como perdida, se registran el motivo y el competidor desde su ficha.
- *Características.* El embudo de fábrica termina en la etapa de cliente ganado: no trae una etapa de oportunidad perdida ni dónde anotar por qué se perdió.
- *Justificación.* Agregarlos es trabajo de una sola vez.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-4-7-twenty-1-oportunidad-perdida.

**Bitrix24** · **2** (cumple) · costo de implementación **1**

- *Cómo lo hace.* Se agregan dos campos propios a la negociación, el motivo, como lista, y el competidor, como texto; al marcar una oportunidad como perdida se registran el motivo y el competidor desde su ficha, y quedan guardados.
- *Características.* Al cerrar una negociación como perdida el sistema pregunta solo el resultado —«Cerrado Perdido» o «Analizar la falla», las dos etapas de fábrica—: no trae dónde anotar por qué se perdió ni quién la ganó.
- *Justificación.* Agregar los campos es configuración de una sola vez.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-4-7-bitrix24-1-cierre-de-la-negociacion, A-4-7-bitrix24-2-motivo-y-competidor.

## A.5 Atención al asegurado y reclamos

### A.5.1 Reclamo como caso con identidad propia

**Qué resuelve.** Que cada reclamo se pueda nombrar, buscar y seguir, en vez de quedar perdido en una nota.

**EspoCRM** · **2** (cumple) · costo de implementación **0**

- *Cómo lo hace.* Al guardar un reclamo asociado a un asegurado, el sistema le asigna un número; la ficha muestra al asegurado y el reclamo figura en el listado de casos.
- *Características.* El producto trae el caso de atención como entidad propia, con su entrada de menú, su listado y su ficha. Reclamo número 102447.
- *Justificación.* Viene listo con la instalación: no requiere crear ni configurar nada. El número propio es lo que permite que la compañía y el asegurado hablen del mismo reclamo sin ambigüedad.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-5-1-espocrm-1-alta, A-5-1-espocrm-2-ficha, A-5-1-espocrm-3-listado.

**Twenty** · **1** (cumple con reparo) · costo de implementación **2**

- *Cómo lo hace.* Twenty no trae un objeto de reclamos o casos: se define como objeto propio, con estado, plazo de resolución, asegurado y responsable.
- *Características.* Así tiene listado y ficha propios, y se crea desde el campo de reclamos de la ficha del asegurado, ya ligado a él. Pero no tiene número: ningún tipo de campo se numera solo, y el identificador interno no sirve para dictárselo a un asegurado.
- *Justificación.* El número hay que asignarlo a mano en cada alta, o desarrollarlo.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-5-1-twenty-1-ficha-del-reclamo, A-5-1-twenty-2-listado, A-5-1-twenty-3-tipos-de-campo.

**Bitrix24** · **1** (cumple con reparo) · costo de implementación **2**

- *Cómo lo hace.* El reclamo se lleva entonces como una negociación con el asegurado como cliente: recibe un número propio, abre su propia ficha y queda asociada al contacto.
- *Características.* No tiene listado propio: comparte el de las demás negociaciones —pólizas y oportunidades—, y hay que distinguirlo por el nombre o con un filtro en cada uso. reclamo n.º 226.
- *Justificación.* El procedimiento pide número, listado y ficha propios. La edición gratuita no permite crear una entidad Reclamo ni vincular tareas al asegurado: «Tareas en CRM» requiere al menos el plan Basic. El reclamo se lleva como una negociación, con número y ficha, pero comparte el listado con las pólizas y las oportunidades.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-5-1-bitrix24-1-formulario, A-5-1-bitrix24-2-ficha, A-5-1-bitrix24-3-listado, A-5-1-bitrix24-4-tarea-en-crm.

### A.5.2 Estado y seguimiento del reclamo

**Qué resuelve.** Responderle al asegurado en qué está su reclamo y por dónde pasó.

**EspoCRM** · **2** (cumple) · costo de implementación **0**

- *Cómo lo hace.* El reclamo pasa por los estados de asignado, pendiente y cerrado, y la ficha conserva la secuencia completa en su historia: cada cambio de estado queda registrado con el valor anterior, el nuevo, quién lo hizo y cuándo.
- *Características.* El estado del caso viene auditado de fábrica, sin configurar nada. Secuencia conservada: Assigned → Pending → Closed.
- *Justificación.* Es lo que permite reconstruir cuánto estuvo un reclamo en cada instancia cuando el asegurado pregunta o cuando hay que responder ante un organismo de control.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-5-2-espocrm-1-secuencia-de-estados.

**Twenty** · **2** (cumple) · costo de implementación **1**

- *Cómo lo hace.* El estado se cambia desde la ficha y el historial del reclamo conserva la secuencia de estados, con quién hizo cada cambio y cuándo.
- *Características.* El estado del reclamo es un campo de lista del objeto propio, con los estados que define la compañía. Los cambios que la misma persona hace sobre el mismo reclamo dentro de los diez minutos se funden en una sola entrada, que muestra el estado de partida y el último: un estado intermedio que dura menos que eso no queda registrado. 3 cambios de estado en el historial.
- *Justificación.* Con el ritmo de un reclamo, que cambia de estado en días, cada paso queda por separado. Definir el estado es trabajo de una sola vez.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-5-2-twenty-1-historial-de-estados.

**Bitrix24** · **2** (cumple) · costo de implementación **0**

- *Cómo lo hace.* El reclamo pasa por las etapas del embudo y el sistema conserva la posición de cada una en orden, sin configurar nada.
- *Características.* Cada cambio de etapa de la negociación —que hace de reclamo— queda anotado en la línea de tiempo de su ficha como «Etapa cambiada», con la etapa anterior y la nueva, la hora y el usuario. secuencia: NEW > PREPARATION > PREPAYMENT_INVOICE > EXECUTING.
- *Justificación.* El procedimiento pide que el sistema conserve la secuencia de estados: la línea de tiempo de la ficha registra las tres transiciones en orden, sin configurar nada. Las etapas son las del embudo, con los nombres que trae; que el reclamo comparta el listado con las pólizas se evalúa en A.5.1.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-5-2-bitrix24-2-linea-de-tiempo.

### A.5.3 Responsable asignado a cada reclamo

**Qué resuelve.** Que cada reclamo tenga quien lo resuelva y nadie suponga que lo atiende otro.

**EspoCRM** · **2** (cumple) · costo de implementación **0**

- *Cómo lo hace.* El reclamo se asigna a un productor desde la ficha y, al ingresar con la cuenta de ese productor, figura en su listado de casos.
- *Características.* El caso trae un responsable asignado de fábrica.
- *Justificación.* Cada reclamo tiene un dueño visible, que es lo que evita que un caso quede sin atender porque nadie sabía que era suyo.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-5-3-espocrm-1-asignacion, A-5-3-espocrm-2-pendientes-del-productor.

**Twenty** · **2** (cumple) · costo de implementación **1**

- *Cómo lo hace.* El reclamo se asigna al productor desde la ficha; al ingresar con su cuenta y filtrar los reclamos por los que tiene a su cargo, figura entre sus pendientes.
- *Características.* El reclamo tiene un responsable, que es una relación con los usuarios del objeto propio. Ese filtro se guarda como una vista para no rehacerlo.
- *Justificación.* Definir el responsable es trabajo de una sola vez.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-5-3-twenty-1-reclamo-asignado, A-5-3-twenty-2-reclamos-del-productor.

**Bitrix24** · **2** (cumple) · costo de implementación **1**

- *Cómo lo hace.* El responsable de un reclamo —la negociación del asegurado— se cambia en el listado, marcando el registro y eligiendo «Cambiar a la persona responsable».
- *Características.* Con la sesión del productor, el reclamo asignado aparece en su listado de negociaciones, sin buscarlo.
- *Justificación.* Los reclamos comparten ese listado con las pólizas y las oportunidades, y el usuario los distingue por el nombre: es una convención que se fija una vez.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-5-3-bitrix24-1-asignado, A-5-3-bitrix24-2-lista-del-productor.

### A.5.4 Base de conocimiento para la atención

**Qué resuelve.** Responder igual y bien las consultas frecuentes, sin depender de quién atienda.

**EspoCRM** · **2** (cumple) · costo de implementación **0**

- *Cómo lo hace.* Un artículo con una condición de cobertura —por ejemplo, qué cubre la póliza de automotor ante granizo y qué excluye— se escribe, se publica y se recupera buscando una palabra desde el listado de la base de conocimiento.
- *Características.* El producto trae una base de conocimiento propia.
- *Justificación.* Viene lista: no requiere crear ni configurar nada. Es lo que permite que quien atiende responda igual que su compañero de al lado, sin depender de la memoria.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-5-4-espocrm-1-busqueda.

**Twenty** · **2** (cumple) · costo de implementación **1**

- *Cómo lo hace.* Twenty no trae una base de conocimiento: el artículo se define como un objeto propio, con su título y la condición de cobertura. Al cargar un artículo, la búsqueda general lo encuentra por su título.
- *Características.* También lo encontró por una palabra del texto de la condición.
- *Justificación.* Definir el objeto es trabajo de una sola vez.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-5-4-twenty-1-articulo, A-5-4-twenty-2-busqueda.

**Bitrix24** · **2** (cumple) · costo de implementación **1**

- *Cómo lo hace.* El artículo se crea desde «Empleados › Base de conocimientos».
- *Características.* Una página en blanco con un bloque de texto, cuyo texto de ejemplo se reemplazó por la condición de cobertura de granizo, y se la buscó por «granizo» en la base publicada, que la devolvió.
- *Justificación.* La base se arma una vez con una plantilla (la edición gratuita admite una sola).
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-5-4-bitrix24-1-articulo-en-el-editor, A-5-4-bitrix24-2-articulo-publicado, A-5-4-bitrix24-3-base-publicada, A-5-4-bitrix24-4-busqueda.

### A.5.5 Tareas asignables con responsable y vencimiento

**Qué resuelve.** Repartir el trabajo con plazo y saber quién lo tiene.

**EspoCRM** · **2** (cumple) · costo de implementación **0**

- *Cómo lo hace.* La tarea se crea con vencimiento y se asigna a un productor.
- *Características.* Al ingresar con la cuenta de ese productor, la tarea figura en su listado con su fecha.
- *Justificación.* Responsable y vencimiento son campos que la tarea trae de fábrica, sin configurar nada, y es lo que permite repartir el trabajo y saber qué se atrasa.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-5-5-espocrm-1-alta, A-5-5-espocrm-2-desde-la-cuenta-del-productor.

**Twenty** · **2** (cumple) · costo de implementación **0**

- *Cómo lo hace.* La tarea se crea desde el listado, se asigna al productor y se le pone fecha y hora de vencimiento desde su ficha. Al ingresar con la cuenta del productor, figura en la vista de las tareas asignadas a él, con su vencimiento.
- *Características.* Las tareas vienen de fábrica con responsable y vencimiento.
- *Justificación.* Viene listo.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-5-5-twenty-1-tarea-asignada, A-5-5-twenty-2-desde-la-cuenta-del-productor.

**Bitrix24** · **2** (cumple) · costo de implementación **0**

- *Cómo lo hace.* «Tareas › Crear» abre un formulario con título, responsable y fecha límite: el productor se elige en el selector de responsable y el formulario ya propone un vencimiento.
- *Características.* Con la sesión del productor, la tarea figura en «Mis tareas» con su fecha límite.
- *Justificación.* Viene de fábrica en la edición gratuita, sin configurar nada.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-5-5-bitrix24-1-tarea-creada, A-5-5-bitrix24-2-tareas-del-productor.

### A.5.6 Aviso al usuario al que se le asigna una tarea

**Qué resuelve.** Que el responsable se entere de lo que le toca sin tener que ir a buscarlo.

**EspoCRM** · **2** (cumple) · costo de implementación **0**

- *Cómo lo hace.* Al asignarle una tarea o un reclamo, el productor recibe el aviso en el propio sistema: al ingresar, el indicador de notificaciones lo muestra sin que tenga que abrir ningún listado, y cada aviso lleva al registro asignado.
- *Características.* Viene activado de fábrica.
- *Justificación.* Es lo que asegura que el responsable se entere en el momento, y no cuando se le ocurre revisar.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-5-6-espocrm-1-notificaciones-del-productor.

**Twenty** · **2** (cumple) · costo de implementación **1**

- *Cómo lo hace.* El aviso se arma con un flujo de trabajo, sin escribir código: cuando a una tarea se le pone responsable, lo busca y le envía un correo desde la casilla de la compañía. Se crea la tarea desde el listado, se la asigna al productor en su ficha, y el correo le llega sin que tenga que abrir el listado.
- *Características.* Twenty no avisa por su cuenta: la interfaz no tiene un centro de notificaciones y asignar una tarea no le manda nada al responsable.
- *Justificación.* Armar el flujo es trabajo de una sola vez.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-5-6-twenty-1-sin-centro-de-avisos, A-5-6-twenty-2-flujo-del-aviso, A-5-6-twenty-3-tarea-asignada.

**Bitrix24** · **2** (cumple) · costo de implementación **0**

- *Cómo lo hace.* Al asignarle una tarea, el productor la recibe como notificación en la campana de la barra superior del portal.
- *Características.* La notificación lleva el título de la tarea y quién se la asignó, sin que tenga que abrir el listado de tareas.
- *Justificación.* Viene activado de fábrica en la edición gratuita.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-5-6-bitrix24-1-notificaciones.

### A.5.7 Registro de reclamos con los datos que exige la Superintendencia

**Qué resuelve.** Llevar el registro de reclamos que pide la normativa y no dejar ninguno sin respuesta en plazo [163].

**EspoCRM** · **1** (cumple con reparo) · costo de implementación **2**

- *Cómo lo hace.* El reclamo se carga como caso: el sistema le asigna un número de orden correlativo y registra cuándo se cargó. Se le agregaron como campos la fecha del reclamo, el carácter del reclamante, el ramo, el motivo y la resolución final, y la relación con la póliza; el reclamante es el contacto vinculado. Una expresión en la fórmula del caso calcula la fecha límite sumando diez días hábiles según el calendario laboral, y el listado filtra los casos con plazo vencido y estado abierto.
- *Características.* Número de orden, fecha de carga, contacto, estado y listado propios del caso; los demás datos exigidos se definen una vez como campos y se ubican en el formulario. El plazo usa el calendario laboral del sistema, que admite cargar feriados, de modo que los días hábiles no se cuentan a mano. Reclamos 18, 19, 20 y 21: correlativos; fecha límite del último 2026-11-18.
- *Justificación.* Registrar los datos exigidos es configuración, pero contar los diez días hábiles exige código en la fórmula del caso, con condiciones y funciones del sistema, de la misma clase que el que se valora como código en A.6.4 y A.8.3.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-5-7-espocrm-1-plazo-en-dias-habiles, A-5-7-espocrm-2-alta-del-reclamo, A-5-7-espocrm-3-ficha-con-sus-datos, A-5-7-espocrm-4-reclamos-vencidos-sin-resolver.

**Twenty** · **1** (cumple con reparo) · costo de implementación **2**

- *Cómo lo hace.* El reclamo se carga como registro del objeto propio. Se le agregaron como campos el número de orden, la fecha del reclamo, el carácter del reclamante, el ramo, el motivo y la resolución final, y la relación con la póliza; el reclamante es el asegurado vinculado. Un reclamo nuevo nace sin número: quien lo carga lo escribe, y también calcula y escribe el plazo de diez días hábiles. El listado filtra los reclamos con plazo en el pasado y estado abierto.
- *Características.* Los datos exigidos se definen una vez como campos del reclamo y se completan en su ficha. Ningún tipo de campo se numera solo: el número es un campo numérico común.
- *Justificación.* Con campos y filtros se registra y se consulta, pero el número correlativo y el vencimiento hábil dependen de que cada persona los calcule y los escriba en cada reclamo: un error de tipeo rompe la correlatividad. Resolverlos solos exigiría desarrollar código.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-5-7-twenty-1-alta-del-reclamo, A-5-7-twenty-2-ficha-con-sus-datos, A-5-7-twenty-3-reclamos-vencidos-sin-resolver.

**Bitrix24** · **1** (cumple con reparo) · costo de implementación **2**

- *Cómo lo hace.* El reclamo se carga como una negociación con el reclamante como cliente. Los datos que pide la normativa se agregan una vez como campos propios del formulario: carácter del reclamante (lista), ramo, póliza, motivo, resolución final y fecha de recepción. La consulta de los pendientes se arma en el filtro del listado: etapa en progreso y fecha de recepción hasta la fecha de corte.
- *Características.* El número de orden es el de la negociación: único y creciente, pero compartido con todas las ventas del portal y con saltos (287666, 287668, 287670). La póliza es un texto, sin vínculo con la ficha de la póliza. Los reclamos resueltos quedan fuera de la consulta al cerrar la negociación. números de orden 287666, 287668, 287670; sin resolver con más de 14 días corridos: 1.
- *Justificación.* Los datos se registran y se consultan sin escribir código, pero el reclamo no tiene numeración propia: el número es el de las negociaciones de todo el portal y avanza de a saltos, de modo que no sirve como número de orden correlativo de reclamos. Además el filtro no cuenta días hábiles: la persona calcula la fecha de corte cada vez que consulta. Cubre una parte de lo que se necesita.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-5-7-bitrix24-1-formulario, A-5-7-bitrix24-2-ficha, A-5-7-bitrix24-3-sin-resolver-mas-de-diez-dias.

## A.6 Ficha única del asegurado

### A.6.1 Vinculación de la póliza con su titular

**Qué resuelve.** Saber de quién es cada póliza y qué pólizas tiene cada asegurado.

**EspoCRM** · **2** (cumple) · costo de implementación **1**

- *Cómo lo hace.* El Administrador de Relaciones liga la póliza con el contacto que es su titular, sin programar: se define una vez que cada póliza tiene un titular y que un asegurado puede tener muchas pólizas. A partir de ahí, al cargar una póliza se elige el titular buscándolo por nombre; la póliza lo muestra en su ficha, y la del asegurado lista todas sus pólizas.
- *Características.* Las dos puntas del vínculo quedan a la vista sin buscar en otro menú.
- *Justificación.* Para que la ficha del asegurado muestre sus pólizas hay que agregar ese panel entre los inferiores, en el Gestor de Diseños.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-6-1-espocrm-1-poliza-con-titular, A-6-1-espocrm-2-ficha-del-titular.

**Twenty** · **2** (cumple) · costo de implementación **1**

- *Cómo lo hace.* Al cargar una póliza se elige al titular buscándolo por nombre, y las dos puntas del vínculo quedan a la vista: la póliza muestra al titular y la ficha del asegurado lista la póliza junto con las demás suyas.
- *Características.* La póliza se liga con la persona que es su titular mediante un campo de relación, que se define una vez desde el modelo de datos, sin programar: cada póliza tiene un titular y una persona puede tener muchas pólizas.
- *Justificación.* Al definirlo, la ficha de la persona suma sola el campo con sus pólizas.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-6-1-twenty-1-poliza-con-titular, A-6-1-twenty-2-ficha-del-titular.

**Bitrix24** · **2** (cumple) · costo de implementación **0**

- *Cómo lo hace.* Una vez guardada, la póliza figura en la pestaña «Negociaciones» de la ficha del contacto y su propia ficha muestra al titular, sin configurar nada.
- *Características.* La negociación —que hace de póliza en la edición gratuita— trae de fábrica el campo «Cliente», donde se elige el contacto por su nombre.
- *Justificación.* La relación se ve desde los dos lados.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-6-1-bitrix24-1-ficha-del-contacto, A-6-1-bitrix24-2-ficha-de-la-poliza.

### A.6.2 Vista única del asegurado

**Qué resuelve.** Ver todo lo del cliente en un solo lugar: la visión completa que sostiene la relación.

**EspoCRM** · **2** (cumple) · costo de implementación **1**

- *Cómo lo hace.* Desde ahí se llega a cada registro sin pasar por otro menú.
- *Características.* La ficha del asegurado reúne en paneles todo lo suyo: sus pólizas, sus reclamos, sus actividades pendientes y el historial de llamadas, reuniones y correos, además de la línea de tiempo de cambios. 12 paneles en la ficha del asegurado.
- *Justificación.* Los reclamos y la actividad vienen de fábrica; el panel de pólizas aparece al definir la relación con el titular, que es configuración de una sola vez.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-6-2-espocrm-1-ficha-completa.

**Twenty** · **2** (cumple) · costo de implementación **1**

- *Cómo lo hace.* Desde la ficha de un asegurado se llega a su póliza, a su reclamo y a las tareas hechas con él, sin pasar por otro menú.
- *Características.* La ficha de la persona reúne lo suyo: a la izquierda, sus campos, entre ellos sus pólizas y sus reclamos, que se abren desde ahí; a la derecha, pestañas con la línea de tiempo de cambios, las tareas, las notas, los archivos, los correos y el calendario. Pestañas de la ficha: .
- *Justificación.* La actividad viene de fábrica; las pólizas y los reclamos aparecen al definir sus relaciones con la persona, que es configuración de una sola vez.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-6-2-twenty-1-ficha-completa, A-6-2-twenty-2-reclamos-desde-la-ficha, A-6-2-twenty-3-actividad-desde-la-ficha.

**Bitrix24** · **2** (cumple) · costo de implementación **1**

- *Cómo lo hace.* La ficha del contacto reúne en una sola pantalla lo del asegurado: la línea de tiempo con sus actividades registradas y, en la pestaña «Negociaciones», tanto la póliza como el reclamo, que en la edición gratuita son negociaciones con el contacto como cliente.
- *Características.* No hace falta salir a otro menú ni buscarlo de nuevo.
- *Justificación.* Como póliza y reclamo comparten esa pestaña, el usuario los distingue por el nombre que se les da al cargarlos: es una convención que hay que fijar una vez.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-6-2-bitrix24-1-actividad, A-6-2-bitrix24-2-negociaciones.

### A.6.3 Campos propios del rubro en la ficha

**Qué resuelve.** Guardar del cliente lo que importa en el negocio asegurador y el producto no trae.

**EspoCRM** · **2** (cumple) · costo de implementación **1**

- *Cómo lo hace.* El Administrador de Campos agrega a la ficha del asegurado un campo que el producto no trae —por ejemplo, la valoración que dejó sobre la atención recibida, con una lista de valores—.
- *Características.* Quedó en el formulario, se cargó en un asegurado y se lo pudo usar como condición de búsqueda para listar a los que valoraron la atención como muy buena.
- *Justificación.* Es configuración de una sola vez: se define el campo y se lo ubica en el formulario y entre los filtros, sin programar.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-6-3-espocrm-1-en-el-formulario, A-6-3-espocrm-2-en-la-busqueda.

**Twenty** · **2** (cumple) · costo de implementación **1**

- *Cómo lo hace.* Desde Configuración › Modelo de datos se agrega a la persona un campo que el producto no trae, como la valoración que dejó sobre la atención recibida, con sus valores.
- *Características.* Apareció solo en la ficha, sin ubicarlo en ningún diseño; se cargó en un asegurado y se lo pudo usar enseguida como condición de filtro del listado para ver a los que valoraron la atención como muy buena.
- *Justificación.* Es configuración de una sola vez, sin programar.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-6-3-twenty-1-en-la-ficha, A-6-3-twenty-2-en-la-busqueda.

**Bitrix24** · **2** (cumple) · costo de implementación **1**

- *Cómo lo hace.* Desde el mismo formulario del contacto, «Crear campo» agrega un campo de tipo lista —por ejemplo, la valoración de la atención, con sus opciones— sin programar. El campo queda en el formulario de alta: su valor se elige al cargar un asegurado y queda guardado.
- *Características.* En el listado, el filtro de búsqueda ofrece el campo nuevo para agregarlo como condición.
- *Justificación.* Definir el campo es una configuración de una sola vez.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-6-3-bitrix24-1-campo-creado, A-6-3-bitrix24-2-filtro.

### A.6.4 Unicidad de la ficha del asegurado

**Qué resuelve.** Que un mismo cliente no tenga dos fichas con historias distintas.

**EspoCRM** · **1** (cumple con reparo) · costo de implementación **2**

- *Cómo lo hace.* De fábrica el producto busca duplicados por nombre y correo, pero no por documento: dos fichas con el mismo documento y el apellido escrito distinto se aceptan sin advertencia.
- *Características.* La pantalla de fórmula de cada entidad trae un guion que se ejecuta antes de guardar, pensado para validaciones y comprobación de duplicados; con tres líneas que buscan el documento, la segunda carga mostró el aviso de posible duplicado y remitió a la ficha existente. Sin la comprobación: 2 fichas con el mismo documento; con ella: 1.
- *Justificación.* El aviso de duplicado por documento solo se consigue escribiendo código en la fórmula de la entidad: es desarrollo, breve, que alguien tiene que saber leer y mantener.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-6-4-espocrm-1-sin-configurar, A-6-4-espocrm-2-comprobacion-por-documento, A-6-4-espocrm-3-duplicado-advertido.

**Twenty** · **2** (cumple) · costo de implementación **1**

- *Cómo lo hace.* Desde Configuración › Modelo de datos se agrega el documento como campo de texto y, al crearlo, se lo marca como único con un interruptor de la misma pantalla. Al cargar un asegurado con un documento ya registrado, aunque el apellido esté escrito distinto, el sistema rechaza el valor y avisa que el registro ya existe.
- *Características.* De fábrica la persona se compara por nombre, correo y perfil de LinkedIn para sugerir duplicados, pero no trae documento. 1 ficha con el documento repetido.
- *Justificación.* La necesidad queda resuelta con configuración de una sola vez, sin programar.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-6-4-twenty-1-campo-unico, A-6-4-twenty-2-duplicado-advertido.

**Bitrix24** · **0** (no cumple)

- *Cómo lo hace.* En la edición gratuita, cargar dos veces al mismo asegurado con el mismo correo no dispara ninguna advertencia: el segundo contacto se guarda igual y quedan dos fichas. La herramienta «Buscar y fusionar duplicados» del listado de contactos no se abre y responde que está disponible en los planes de nivel superior.
- *Justificación.* La edición gratuita no advierte la duplicación al cargar un asegurado ni permite buscarla después: el alta repetida queda guardada como una segunda ficha y la única herramienta de duplicados exige un plan superior. El fabricante documenta la fusión automática de duplicados para prospectos, contactos y compañías, pero la condiciona al plan contratado.
- *Comentario — con Bitrix24 Standard* (US$ 144 por mes, hasta 50 usuarios, abono recurrente) sería **1** (cumple con reparo, costo 2). El plan Standard, el primero que incluye el control de duplicados del CRM, permite buscar y fusionar las fichas repetidas del mismo asegurado. El alta repetida se guarda igual: la duplicación se detecta después, con una revisión que hay que repetir en cada uso.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-6-4-bitrix24-1-segunda-alta, A-6-4-bitrix24-2-buscar-duplicados.

> «Automatic duplicate merging is available for leads, contacts, and companies. Check if this option is available on your Bitrix24 plan.»
>
> — https://helpdesk.bitrix24.com/open/18346126/, consultado el 8 de noviembre de 2026

> «Control de duplicados en CRM (búsqueda de duplicados)»
>
> — https://www.bitrix24.es/prices/compare_cloud_plans.php, consultado el 8 de noviembre de 2026

> «US$ 144»
>
> — https://www.bitrix24.es/prices/, consultado el 8 de noviembre de 2026

## A.7 Intercambio de datos y correo

### A.7.1 Importación de contactos desde planilla de cálculo

**Qué resuelve.** Empezar a usar el sistema con la cartera que hoy está en planillas, sin cargarla a mano.

**EspoCRM** · **2** (cumple) · costo de implementación **1**

- *Cómo lo hace.* El asistente de importación incorpora la planilla completa, cada columna en su campo y con tildes y eñes intactas, siempre que se guarde en CSV con codificación UTF-8. Si se guarda con la codificación predeterminada de las planillas en Windows, ingresan todas las filas pero las letras acentuadas llegan corrompidas, sin que el sistema lo advierta. En ambos casos el asistente no reconoce los encabezados en español: deja las columnas sin asignar y hay que indicar a mano a qué campo va cada una.
- *Características.* El asistente de importación admite archivos de texto separados por comas y la propia pantalla advierte que "debe ser codificado en UTF-8". UTF-8: 5/5 intactos · codificación de Windows: 0/5 intactos.
- *Justificación.* La planilla entra completa y sin pérdida desde la pantalla de importación, que indica que el archivo debe estar en UTF-8. Guardarla en ese formato es un paso de la exportación desde la planilla, y asignar las columnas es parte del asistente.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-7-1-espocrm-1-pide-utf8, A-7-1-espocrm-2-planilla-de-windows, A-7-1-espocrm-3-planilla-utf8.

> «Select what type of records you need to import (Entity Type field). Select a CSV file. A file should be formatted in UTF-8. Select What to do?. Available options: Create Only, Create & Update, Update Only.»
>
> — https://docs.espocrm.com/administration/import/, consultado el 30 de octubre de 2026

**Twenty** · **2** (cumple) · costo de implementación **1**

- *Cómo lo hace.* Un libro de planilla (.xlsx) con diez asegurados ingresa completo: cada columna en su campo, con tildes y eñes intactas.
- *Características.* El listado de personas tiene un asistente de importación que acepta libros de planilla (.xlsx) y archivos de texto separados por comas. El libro con diez filas ingresó con 10 nombres, correos, teléfonos y ciudades intactos. Un CSV guardado con la codificación predeterminada de las planillas en Windows no se lee bien: 0 de 5 filas ingresaron intactas, con letras acentuadas corrompidas y columnas corridas, y el sistema no lo advirtió; guardado en UTF-8 ingresa completo. El asistente no reconoció los encabezados en español: dejó las 5 columnas sin asignar y hubo que indicar a mano a qué campo va cada una, abriendo las partes del nombre, del correo, del teléfono y del domicilio. .xlsx: 10/10 intactos · UTF-8: 5/5 intactos · codificación de Windows: 4/5 ingresadas, 0/5 intactas, 3 con la fila entera en el nombre · 5 columnas sin reconocer.
- *Justificación.* La planilla ingresa completa y sin pérdida; asignar las columnas en el asistente es parte de la importación y es configuración.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-7-1-twenty-3-planilla-xlsx, A-7-1-twenty-1-planilla-de-windows, A-7-1-twenty-2-planilla-utf8.

**Bitrix24** · **2** (cumple) · costo de implementación **1**

- *Cómo lo hace.* Se sube el archivo con el botón «Subir archivo»; en el mismo paso se elige la codificación del archivo (ofrece ASCII, UTF-8, UTF-16, Windows-1251 y 1252, ISO-8859-1 a 15 y KOI8-R; propone Windows-1251) y el delimitador. Luego se relacionan las columnas con los campos —la del correo, con otro rótulo, se relaciona con «E-mail del trabajo»— y se importa.
- *Características.* El listado de contactos trae un asistente de importación de planillas CSV, sin configurar nada. Una planilla de diez asegurados con tildes y eñes en los apellidos ingresó completa con sus correos y la acentuación intacta: la guardada en UTF-8 con la codificación UTF-8, y la guardada con la codificación predeterminada de Windows eligiendo Windows-1252 en el primer paso del asistente. UTF-8: 5/5 intactos · codificación de Windows: 5/5 intactos · 10 de 10 ingresados.
- *Justificación.* La cartera entra completa con el asistente que trae el producto. Elegir la codificación y relacionar la columna del correo son opciones del propio asistente, parte de usar la pantalla y no una tarea aparte.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-7-1-bitrix24-1-planilla-de-windows, A-7-1-bitrix24-2-planilla-utf8.

### A.7.2 Importación de contactos desde las agendas de correo

**Qué resuelve.** Sumar los contactos que cada productor tiene en su correo.

**EspoCRM** · **1** (cumple con reparo) · costo de implementación **2**

- *Cómo lo hace.* Las extensiones del fabricante para Google y Outlook sincronizan calendario y correo, y para los contactos hacen el camino inverso: envían los del sistema a la agenda, no los incorporan.
- *Características.* El sistema no se conecta con la agenda de ningún correo para traer contactos.
- *Justificación.* La vía que queda es exportar la agenda del correo web o del gestor de escritorio a un archivo y pasarlo por el asistente de importación, que es un procedimiento que se repite cada vez que la agenda cambia.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-7-2-espocrm-1-integraciones.

> «The ability to push your EspoCRM contacts and leads to Google Contacts;»
>
> — https://docs.espocrm.com/extensions/google-integration/contacts/, consultado el 28 de septiembre de 2026

> «Provides the ability to import records from CSV files.»
>
> — https://docs.espocrm.com/administration/import/, consultado el 28 de septiembre de 2026

**Twenty** · **1** (cumple con reparo) · costo de implementación **2**

- *Cómo lo hace.* Lo que ofrece es crear personas a partir del correo sincronizado —cada dirección externa con la que se intercambian mensajes o reuniones pasa a ser un contacto—, que alcanza a quien ya escribió, no a la agenda entera.
- *Características.* El sistema se conecta con las cuentas de Google y de Microsoft —en la instalación propia, después de registrar sus credenciales; la evaluada ofrece solo IMAP— y con cualquier casilla por IMAP, pero para sincronizar correo y calendario: no trae la agenda de contactos de ninguna.
- *Justificación.* Para incorporar la agenda del correo web o del gestor de escritorio hay que exportarla a un archivo y pasarlo por el asistente de importación, un procedimiento que se repite cada vez que la agenda cambia.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-7-2-twenty-1-cuentas-que-se-conectan.

> «Connect an additional Google or Microsoft account, or any other mail provider supporting IMAP/SMTP protocols»
>
> — https://docs.twenty.com/user-guide/calendar-emails/how-tos/connect-several-mailboxes-per-user, consultado el 30 de octubre de 2026

> «For messages sent and received: Create contacts for all external email interactions»
>
> — https://docs.twenty.com/user-guide/calendar-emails/overview, consultado el 30 de octubre de 2026

> «Twenty supports three file formats for import:»
>
> — https://docs.twenty.com/user-guide/data-migration/capabilities/file-formats, consultado el 30 de octubre de 2026

**Bitrix24** · **1** (cumple con reparo) · costo de implementación **2**

- *Cómo lo hace.* Incorporar los contactos de la compañía exige, en cada carga, exportar el archivo desde el correo web o el gestor de escritorio e importarlo después con el asistente.
- *Características.* El listado de contactos ofrece una importación para cada agenda de correo —Gmail, Outlook y Yahoo!—, pero todas parten de un archivo CSV que el usuario exporta antes desde su correo.
- *Justificación.* No hay una conexión que lea la agenda directamente.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-7-2-bitrix24-1-menu-de-importacion.

### A.7.3 Sincronización del correo de varios usuarios

**Qué resuelve.** Que el correo de cada usuario con los clientes llegue al sistema.

**EspoCRM** · **2** (cumple) · costo de implementación **1**

- *Cómo lo hace.* Cada usuario configura su casilla personal contra el servidor de correo, y el sistema trae el mensaje de cada una a la bandeja de su dueño y solo a la suya.
- *Características.* Cada usuario puede tener su propia casilla sincronizada: la administración tiene una sección de cuentas de correo personales, y también de cuentas grupales para casillas compartidas.
- *Justificación.* Configurar cada casilla es trabajo de una sola vez.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-7-3-espocrm-1-casillas-personales, A-7-3-espocrm-2-bandeja.

**Twenty** · **2** (cumple) · costo de implementación **1**

- *Cómo lo hace.* Cada usuario conecta su casilla: el administrador la comercial y el productor, desde su cuenta, la suya contra el mismo servidor de correo; cada uno ve solo la propia en su lista de cuentas, y el mensaje que un asegurado le manda al productor aparece en la ficha del asegurado.
- *Características.* Cada usuario conecta su propia casilla desde su configuración personal, por IMAP y SMTP o con una cuenta de Google o Microsoft.
- *Justificación.* Configurar cada casilla es trabajo de una sola vez, y lo hace cada usuario.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-7-3-twenty-1-casilla-del-productor, A-7-3-twenty-2-correo-sincronizado, A-7-3-twenty-3-casilla-del-administrador.

**Bitrix24** · **0** (no cumple)

- *Cómo lo hace.* En la edición gratuita no se puede conectar ninguna casilla, ni la del administrador ni la de un productor. Webmail ofrece Gmail, Outlook, iCloud, Office365, Exchange, Yahoo!, Aol y «Buzón personalizado» (IMAP+SMTP), pero al elegir cualquiera de ellos, con el administrador y con la sesión del productor, el sistema no abre el formulario de conexión y responde «No disponible en su plan». «Conectar varios buzones» también pide otro plan: «para conectar y gestionar múltiples buzones de correo corporativos, actualiza a cualquier plan a partir del Professional».
- *Justificación.* La comparación de planes del fabricante marca Webmail y la integración con servicios de correo de terceros como no incluidos en la edición gratuita, y la ayuda confirma que Webmail solo está en planes comerciales. Sin una casilla conectada no hay sincronización de ningún usuario.
- *Comentario — con Bitrix24 Basic* (US$ 69 por mes, hasta 5 usuarios, abono recurrente) sería **2** (cumple, costo 1). Según la comparación de planes y la ayuda del fabricante, desde el plan Basic Webmail admite una casilla por usuario —cada usuario conecta la suya, una sola vez— y los planes superiores suben ese número (5 en Standard, 10 en Professional y Enterprise) sin cambiar lo que cada usuario puede hacer. No se contrató el plan, así que la conexión no se ejercitó.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-7-3-bitrix24-1-integracion-del-buzon, A-7-3-bitrix24-2-buzon-personalizado-del-administrador, A-7-3-bitrix24-3-conectar-varios-buzones, A-7-3-bitrix24-4-buzon-personalizado-del-productor.

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

### A.7.4 Vinculación automática del correo a la ficha

**Qué resuelve.** Que cada mensaje con un cliente quede en su historia sin que alguien lo copie.

**EspoCRM** · **2** (cumple) · costo de implementación **1**

- *Cómo lo hace.* Con la casilla de atención de la compañía sincronizada, el mensaje que un asegurado escribe desde su propia dirección aparece en el historial de su ficha sin que nadie lo mueva.
- *Características.* El sistema reconoció la dirección del remitente y lo vinculó con el asegurado que la tiene cargada.
- *Justificación.* Configurar la casilla compartida es trabajo de una sola vez; la vinculación ocurre sola en cada mensaje.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-7-4-espocrm-1-correo-en-la-ficha.

**Twenty** · **2** (cumple) · costo de implementación **1**

- *Cómo lo hace.* Con la casilla comercial de la compañía conectada, el mensaje que un asegurado escribe desde su propia dirección aparece en la pestaña de correos de su ficha sin que nadie lo mueva.
- *Características.* El sistema reconoció la dirección del remitente y lo vinculó con la persona que la tiene cargada.
- *Justificación.* Conectar la casilla es trabajo de una sola vez; la vinculación ocurre sola en cada mensaje.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-7-4-twenty-1-correo-en-la-ficha.

**Bitrix24** · **0** (no cumple)

- *Cómo lo hace.* En la edición gratuita el correo que un asegurado envía a la casilla de atención de la compañía no queda registrado en su ficha: la ficha no muestra ninguna actividad de correo.
- *Características.* La ayuda del fabricante describe que, con la opción «Integración de CRM» activada en el buzón, los correos entrantes aparecen en la ficha correspondiente; esa opción forma parte de la conexión del buzón, que la edición gratuita no permite. correo recibido en la casilla de atención: sí · en la ficha tras 2 min: no.
- *Justificación.* En la edición gratuita el correo de un asegurado no llega a su ficha porque no se puede conectar la casilla de la compañía: «Buzón personalizado» responde «No disponible en su plan» y no abre el formulario.
- *Comentario — con Bitrix24 Basic* (US$ 69 por mes, hasta 5 usuarios, abono recurrente) sería **2** (cumple, costo 1). Con una casilla conectada desde el plan Basic, el fabricante documenta que activar «Integración de CRM» en la configuración del buzón hace que cada correo entrante quede como actividad en la ficha del CRM correspondiente, sin intervención. Activar la opción es configuración de una sola vez por casilla. No se contrató el plan, así que la vinculación no se ejercitó.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-7-4-bitrix24-1-conexion-de-la-casilla, A-7-4-bitrix24-2-ficha-del-asegurado.

> «Si habilitas la opción Integración de CRM en la configuración de tu buzón, los correos electrónicos entrantes aparecerán en la ficha del elemento de CRM correspondiente.»
>
> — https://helpdesk.bitrix24.es/open/18295168/, consultado el 30 de septiembre de 2026

> «Integración con servicios de correo electrónico de terceros»
>
> — https://www.bitrix24.es/prices/compare_cloud_plans.php, consultado el 30 de septiembre de 2026

> «Basic Ideal para emprendedores individuales y equipos pequeños que están empezando US$ 69 US$ 69 US$ 49 / compañía / mes / facturado mensualmente / compañía / mes / facturación anual Un pago de US$ 588 / año Ahorra US$ 240 al año incluye 5 usuarios Comprar Comprar Todo lo incluido en Free, más: Almacenamiento de 24 GB IA para el trabajo diario en Bitrix24 Embudos de ventas Negociaciones recurrentes Pagos en línea Integración de correo electrónico Integración de WhatsApp Integración de telefonía»
>
> — https://www.bitrix24.es/prices/, consultado el 30 de septiembre de 2026

### A.7.5 Exportación de la cartera sin pérdida de datos

**Qué resuelve.** Que la cartera se pueda sacar del sistema completa y legible.

**EspoCRM** · **2** (cumple) · costo de implementación **0**

- *Cómo lo hace.* Desde el listado se exportan los asegurados seleccionados a un archivo que conserva los datos tal como están en el sistema, con tildes y eñes intactas.
- *Características.* Salieron las 5 filas, cada una con nombre, apellido, correo y ciudad, y con las tildes y eñes intactas. 5 de 5 filas idénticas al original.
- *Justificación.* La exportación viene de fábrica en todos los listados y toma los registros seleccionados o el resultado de un filtro.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-7-5-espocrm-1-exportacion.

**Twenty** · **2** (cumple) · costo de implementación **0**

- *Cómo lo hace.* La vista del listado de personas se exporta a un archivo con todas sus filas, cada una con nombre, apellido, correo y ciudad, y con las tildes y eñes intactas.
- *Características.* El archivo trae todas las columnas de la vista, con los campos compuestos separados en sus partes, y la marca de codificación que la planilla necesita para abrirlo sin alterar las tildes. 5 de 5 filas idénticas al original.
- *Justificación.* La exportación viene de fábrica en todos los listados.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-7-5-twenty-1-exportacion.

**Bitrix24** · **0** (no cumple)

- *Cómo lo hace.* En la edición gratuita no se puede exportar la cartera: «Exportar a CSV» no genera ningún archivo y el sistema responde que la función requiere actualizar a un plan superior.
- *Justificación.* La comparación de planes del fabricante confirma que la opción de exportar contactos a CSV, Excel y Outlook no forma parte de la edición gratuita. Sin archivo no hay nada que comparar con la planilla original.
- *Comentario — con Bitrix24 Basic* (US$ 69 por mes, hasta 5 usuarios, abono recurrente) sería **2** (cumple, costo 0). El plan Basic incluye la opción de exportar contactos a CSV, Excel y Outlook, de modo que la cartera se puede sacar del sistema. No se contrató el plan, así que no se comparó el contenido del archivo con la planilla original.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-7-5-bitrix24-2-exportacion.

> «Opción para exportar contactos a CSV, Excel y Outlook»
>
> — https://www.bitrix24.es/prices/compare_cloud_plans.php, consultado el 30 de septiembre de 2026

> «Basic Ideal para emprendedores individuales y equipos pequeños que están empezando US$ 69 US$ 69 US$ 49 / compañía / mes / facturado mensualmente / compañía / mes / facturación anual Un pago de US$ 588 / año Ahorra US$ 240 al año incluye 5 usuarios Comprar Comprar Todo lo incluido en Free, más: Almacenamiento de 24 GB IA para el trabajo diario en Bitrix24 Embudos de ventas Negociaciones recurrentes Pagos en línea Integración de correo electrónico Integración de WhatsApp Integración de telefonía»
>
> — https://www.bitrix24.es/prices/, consultado el 30 de septiembre de 2026

## A.8 Parametrización del modelo de negocio

### A.8.1 Creación de entidades sin programar

**Qué resuelve.** Adaptar el sistema a cosas propias del negocio sin contratar un desarrollo.

**EspoCRM** · **2** (cumple) · costo de implementación **1**

- *Cómo lo hace.* El Administrador de Entidades crea una entidad desde un formulario de la administración: se indican el nombre, las etiquetas en singular y plural y el tipo, entre los 5 que ofrece (Base, Base Plus, Evento, Persona, Empresa).
- *Características.* No hizo falta escribir código, tocar archivos del servidor ni reiniciar nada: la entidad quedó disponible en el acto y admitió su primer registro. Entidad creada y operativa en 19 segundos.
- *Justificación.* Es trabajo de configuración que se hace una vez, y es lo que permite que el modelo de datos siga al negocio asegurador en lugar de obligar al negocio a acomodarse a un modelo genérico.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-8-1-espocrm-1-formulario, A-8-1-espocrm-2-primer-registro.

**Twenty** · **2** (cumple) · costo de implementación **1**

- *Cómo lo hace.* Desde Configuración › Modelo de datos se crea una entidad que el producto no trae —por ejemplo, la inspección del riesgo antes de emitir— con su nombre en singular y plural y una descripción, y se le agregan campos, como uno de fecha.
- *Características.* Apareció en el menú con su listado y su ficha, y admitió registros enseguida. Entidad creada, con un campo y un registro cargado, en 107 segundos.
- *Justificación.* No hace falta escribir código en ningún paso: es configuración.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-8-1-twenty-1-entidad-y-campo, A-8-1-twenty-2-registro-cargado.

**Bitrix24** · **0** (no cumple)

- *Cómo lo hace.* La edición gratuita no crea entidades propias: al guardar, avisa que los procesos inteligentes requieren el plan Professional o el Enterprise; la tabla comparativa del fabricante los lista entre las funciones que ese plan agrega.
- *Características.* Las entidades nuevas de Bitrix24 son los procesos inteligentes: se crean desde la barra del CRM, con su nombre, sus etapas y sus campos, sin escribir código. Con el plan Professional la entidad se crea igual que se hace con cualquier otra configuración del sistema, sin programar.
- *Justificación.* Sin él, lo más cercano es forzar el concepto dentro de una negociación con campos propios, que no es una entidad nueva.
- *Comentario — con Bitrix24 Professional* (US$ 289 por mes, hasta 100 usuarios, abono recurrente) sería **2** (cumple, costo 1). Con el plan Professional los procesos inteligentes vienen incluidos: se crea la entidad desde la barra del CRM con su nombre, sus etapas y sus campos propios, sin escribir código. Es configuración de una vez.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-8-1-bitrix24-1-formulario, A-8-1-bitrix24-2-al-guardar.

> «Cree sus propios procesos inteligentes y personalícelos según las necesidades de su empresa.»
>
> — https://www.bitrix24.es/prices/compare_cloud_plans.php, consultado el 29 de septiembre de 2026

> «SPA (smart process automation)»
>
> — https://www.bitrix24.com/promo/professional/, consultado el 29 de septiembre de 2026

> «Professional Ideal para empresas en crecimiento que utilizan automatización avanzada US$ 289 US$ 289US$ 199 / compañía / mes / facturado mensualmente / compañía / mes / facturación anualUn pago de US$ 2,388 / año Ahorra US$ 1,080 al año incluye 100 usuarios ≈ US$ 2.89 por usuario ≈ US$ 1.99 por usuario Comprar Comprar Todo lo incluido en Standard, más: Almacenamiento de 1 TB Automatización de ventas Seguimiento de llamadas Email Marketing Automatización de anuncios Reserva online Análisis e informes Control del tiempo en tareas Automatización de tareas Automatización Robótica (RPA) Herramientas de gestión de RR. HH. Control del tiempo de trabajo»
>
> — https://www.bitrix24.es/prices/, consultado el 29 de septiembre de 2026

### A.8.2 Campos calculados sobre datos propios

**Qué resuelve.** Que los valores que salen de otros se calculen solos y sin errores de cuenta.

**EspoCRM** · **2** (cumple) · costo de implementación **1**

- *Cómo lo hace.* El cálculo se define con una sola expresión, del tipo de una fórmula de planilla —por ejemplo, la prima anual como doce veces la mensual—, y al guardar una póliza el sistema lo calcula sin intervención.
- *Características.* La administración de cada entidad trae una fórmula que, según la propia pantalla, "se ejecuta cada vez que se guarda una entidad" y "se utiliza para configurar campos calculados". Prima anual calculada al guardar: 183006.
- *Justificación.* El cálculo se escribe una vez desde la administración, sin instalar nada ni programar la aplicación: es configuración.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-8-2-espocrm-1-formula, A-8-2-espocrm-2-calculado-al-guardar.

**Twenty** · **1** (cumple con reparo) · costo de implementación **2**

- *Cómo lo hace.* El cálculo se arma con un flujo de trabajo que corre cada vez que se guarda la prima de una póliza, con un paso de código que multiplica la prima mensual por doce y un paso que escribe el resultado en el campo de la prima anual: al cargar la prima desde la ficha, el sistema completa la anual sin intervención.
- *Características.* Twenty no tiene campos calculados: ningún tipo de campo deriva su valor de otro, y ninguna acción de las automatizaciones hace cuentas sin código. La necesidad queda resuelta desde el sistema, pero exige escribir unas líneas de código, con la prima guardada en millonésimas, y, en la instalación propia, habilitar la ejecución de código, que viene deshabilitada. Prima anual calculada al guardar: 183006, 10 segundos después.
- *Justificación.* El cálculo solo se consigue con un paso de código dentro del flujo: es desarrollo, breve, que alguien tiene que saber leer y mantener.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-8-2-twenty-1-tipos-de-campo, A-8-2-twenty-2-codigo-del-calculo, A-8-2-twenty-3-flujo-del-calculo, A-8-2-twenty-4-calculado-al-guardar.

**Bitrix24** · **1** (cumple con reparo) · costo de implementación **2**

- *Cómo lo hace.* El cálculo se arma con dos reglas de automatización de la etapa «En progreso»: «Ejecutar operaciones matemáticas» multiplica la prima neta por el factor del recargo y deja el resultado en una variable, y «Modificar elemento» lo escribe en el campo «Prima total». Al pasar una póliza a esa etapa desde su ficha, sin intervención, la prima total queda calculada.
- *Características.* Bitrix24 no tiene campos calculados: entre los tipos de campo que ofrece el formulario —cadena, lista, fecha, dinero, número y los adicionales— ninguno deriva su valor de otro. El cálculo se configura sin código, pero las reglas corren cuando la negociación llega a la etapa y la regla matemática solo toma campos numéricos, no los de dinero como la prima de la póliza. Al corregir después la prima neta a 2.000 por la interfaz de programación, la prima total siguió en 1210. Prima neta 1000 → prima total 1210; tras corregir la neta a 2000, total 1210.
- *Justificación.* El valor derivado se calcula una vez y no acompaña a la prima corregida después: la compañía tiene que volver a pasar la póliza por la etapa cada vez que cambia el dato de partida.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-8-2-bitrix24-1-tipos-de-campo, A-8-2-bitrix24-3-regla-matematica, A-8-2-bitrix24-4-modificar-elemento, A-8-2-bitrix24-5-valor-calculado.

> «This automation rule updates a variable with the result of a math operation. Four operations are available: addition, subtraction, multiplication, and division.»
>
> — https://helpdesk.bitrix24.com/open/14954920/, consultado el 8 de noviembre de 2026

> «When a CRM entity reaches a certain stage, the automation rule modifies the field values in that entity. For example, when a new deal appears in CRM, the rule changes its name and assigns another responsible user.»
>
> — https://helpdesk.bitrix24.com/open/22396442/, consultado el 8 de noviembre de 2026

### A.8.3 Automatización de procesos

**Qué resuelve.** Que los pasos repetitivos se hagan solos cuando ocurre algo.

**EspoCRM** · **1** (cumple con reparo) · costo de implementación **2**

- *Cómo lo hace.* Se define una acción automática sobre un evento: cuando la cobranza de una póliza pasa a vencida, el sistema crea una tarea de gestión a su productor. Al cambiar el estado desde la ficha, la tarea aparece sola, asignada al productor y vinculada a la póliza.
- *Características.* La edición gratuita lo resuelve, pero con la fórmula de la entidad, que para esto exige escribir un script con condiciones y funciones del sistema: es desarrollo, aunque sea breve, y lo tiene que mantener alguien que sepa leerlo. Tarea creada automáticamente al cambiar el estado de cobranza.
- *Justificación.* La acción automática solo se consigue escribiendo código: en la edición gratuita no hay forma de definirla sin programar. El fabricante vende un motor de flujos de trabajo que define la misma regla desde pantallas.
- *Comentario — con Advanced Pack* (US$ 395 por año y por instalación, abono recurrente) sería **2** (cumple, costo 1). Con los flujos de trabajo de la extensión, la condición y la acción se eligen desde la administración sin escribir código: la misma regla pasa de desarrollo a configuración.
- *Comentario — con EspoCRM Cloud Basic* (US$ 15 por usuario por mes, mínimo 3 usuarios, abono recurrente) sería **2** (cumple, costo 1). El servicio en la nube incluye los flujos de trabajo entre todas las extensiones del fabricante: la regla se define desde pantallas, igual que con la extensión comprada aparte.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-8-3-espocrm-1-regla, A-8-3-espocrm-2-tarea-creada-sola.

> «Workflows»
>
> — https://www.espocrm.com/extensions/advanced-pack/, consultado el 30 de octubre de 2026

> «$395.00 1 Year License + Upgrades»
>
> — https://www.espocrm.com/extensions/advanced-pack/, consultado el 30 de octubre de 2026

> «1.1 Subject to your continuous compliance with the Agreement and payment of the applicable license fees, EspoCRM grants you a non-exclusive, non-transferable, worldwide, limited right to use the Software on a single EspoCRM Application instance on a single server for the Licensed Period. After the license period expires, you must renew or purchase a new license to continue using the Software. You may use or modify the Software only for your own internal business purposes or for non-commercial or personal use.»
>
> — https://www.espocrm.com/extension-license-agreement/, consultado el 30 de octubre de 2026

> «Basic $15.00 per user/month minimum 3 users 3GB file storage per user 100,000 records SSL Encryption (256 bit keys, TLS 1.3) Full feature set All extensions included External access API 2000+ integrations * 12x5 (hours/days) support Sign Up Free Trial Free Trial is provided for 30 days»
>
> — https://www.espocrm.com/cloud/, consultado el 30 de octubre de 2026

**Twenty** · **2** (cumple) · costo de implementación **1**

- *Cómo lo hace.* Un flujo de trabajo escucha las actualizaciones de las pólizas, con la condición de que el estado de pago quede en vencida, y crea una tarea de gestión a nombre del productor de la póliza: al cambiar el estado desde la ficha, la tarea aparece sola, asignada al productor.
- *Características.* Los flujos de trabajo vienen en la edición evaluada y se arman desde un editor visual, sin escribir código. Tarea creada automáticamente al cambiar el estado de pago.
- *Justificación.* Definir el flujo es configuración de una sola vez.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-8-3-twenty-1-evento-y-condicion, A-8-3-twenty-2-accion, A-8-3-twenty-3-tarea-creada-sola.

**Bitrix24** · **2** (cumple) · costo de implementación **1**

- *Cómo lo hace.* Se define una regla que deja un comentario en el historial al llegar a «En progreso». Al pasar una póliza a esa etapa con un clic en la barra de etapas de su ficha, sin que nadie haga nada más, el comentario aparece en el historial de la póliza.
- *Características.* Las reglas de automatización de la negociación se arman desde la pantalla, sin código: se elige la etapa, la acción —comunicar, crear tareas, modificar campos, dejar comentarios— y el momento. La edición gratuita admite hasta 5 reglas y disparadores en total: con las de muestra del portal dejadas en 2, la regla entra. Comentarios en la póliza tras el cambio de etapa: 1.
- *Justificación.* Definir cada regla es configuración de una vez.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-8-3-bitrix24-1-regla, A-8-3-bitrix24-2-al-guardar, A-8-3-bitrix24-3-comentario-en-el-historial.

> «When a CRM entity reaches a certain stage, the automation rule modifies the field values in that entity. For example, when a new deal appears in CRM, the rule changes its name and assigns another responsible user.»
>
> — https://helpdesk.bitrix24.com/open/22396442/, consultado el 8 de noviembre de 2026

### A.8.4 Conservación de la parametrización al actualizar

**Qué resuelve.** No perder lo que se adaptó cada vez que sale una versión nueva.

**EspoCRM** · **2** (cumple) · costo de implementación **0**

- *Cómo lo hace.* Se aplica el procedimiento oficial para Docker: se cambia la imagen y se vuelve a crear el contenedor con la misma configuración y las mismas carpetas de datos. Tras ingresar con el administrador, las entidades creadas, las fórmulas, los campos propios con sus valores y los registros siguen en su lugar, y las automatizaciones siguen funcionando.
- *Características.* El procedimiento no pide exportar ni volver a cargar la parametrización: entidades, campos, diseños y fórmula viven en las carpetas de datos y en la base, que la actualización conserva. El fabricante declara que las personalizaciones hechas desde la interfaz no deberían romperse con una actualización.
- *Justificación.* Al pasar de una versión a otra no hay que rehacer ni reconfigurar nada de lo parametrizado, de modo que la conservación no suma trabajo.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-8-4-espocrm-3-entidades-propias, A-8-4-espocrm-4-formula-conservada, A-8-4-espocrm-5-poliza-anterior, A-8-4-espocrm-6-alta-nueva, A-8-4-espocrm-7-calculo-al-guardar, A-8-4-espocrm-8-tarea-creada-sola.

> «Within a few minutes the container will be upgraded to the latest version.»
>
> — https://docs.espocrm.com/administration/docker/installation/, consultado el 8 de noviembre de 2026

> «Espo upgrades should not break customizations made via the UI. But customizations made via code may break. To review breaking changes before upgrading, check release notes or GitHub issues marked with the change tag.»
>
> — https://docs.espocrm.com/administration/upgrading/, consultado el 8 de noviembre de 2026

**Twenty** · **2** (cumple) · costo de implementación **0**

- *Cómo lo hace.* Con el procedimiento oficial, la versión se actualiza cambiando la imagen y volviendo a levantar los contenedores, y el servidor corre solo sus migraciones al arrancar. Después de actualizar, los objetos propios y sus campos siguen en el modelo de datos, los flujos de trabajo siguen definidos, los registros cargados siguen en su lugar con todos sus valores, una póliza dada de alta de nuevo admite sus campos propios y un flujo activado en la versión nueva sigue operando, como el que crea la tarea de cobranza al pasar una póliza a vencida.
- *Características.* Lo que la compañía parametriza —objetos, campos, relaciones, vistas y flujos— es parte del modelo de datos del espacio de trabajo, no del código del producto: la actualización lo migra con los registros, sin pasos manuales.
- *Justificación.* Al pasar de una versión a la siguiente no hay que rehacer ni reconfigurar nada de lo parametrizado, de modo que la conservación no suma trabajo.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-8-4-twenty-3-objetos-propios, A-8-4-twenty-4-campos-de-la-poliza, A-8-4-twenty-5-flujos, A-8-4-twenty-6-poliza-anterior, A-8-4-twenty-7-alta-nueva, A-8-4-twenty-8-tarea-creada-sola.

> «The server runs all required upgrade migrations automatically on startup. No manual command is needed.»
>
> — https://docs.twenty.com/developers/self-host/capabilities/upgrade-guide, consultado el 8 de noviembre de 2026

> «Always back up your database before starting the upgrade process»
>
> — https://docs.twenty.com/developers/self-host/capabilities/upgrade-guide, consultado el 8 de noviembre de 2026

**Bitrix24** · **2** (cumple) · costo de implementación **0**

- *Cómo lo hace.* El fabricante actualiza el servicio por su cuenta, sin que la compañía aplique ningún procedimiento ni elija el momento. El registro de cambios oficial fecha el 22 de octubre de 2026 una versión nueva del módulo CRM, con métodos para trabajar con sus formularios, que llega a todas las cuentas en la nube.
- *Características.* Los campos propios creados por pantalla (Ramo, Estado de cobranza, Prima, Motivo de pérdida, Competidor, Plazo de resolución, Vigencia desde, Vigencia hasta, Forma de pago, Vencimiento de la cuota, Estado de la cuota, Plazo de resolución del reclamo, Vencimiento de la póliza) siguen en el formulario después de esa versión, y las 41 pólizas cargadas antes con esos campos conservan sus valores: la más antigua, del 29/09/2026, se abrió y muestra su ramo. Pólizas con campos propios anteriores a la actualización: 41.
- *Justificación.* Lo que la compañía parametrizó atravesó una versión nueva del CRM sin perderse ni tener que rehacerse, y no exige ningún trabajo de su parte.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-8-4-bitrix24-3-poliza-anterior-a-la-actualizacion.

> «Automatic updates. There's no need to track or manage version updates. Bitrix24 accounts automatically receive updates and new tools.»
>
> — https://helpdesk.bitrix24.com/open/23247978/, consultado el 8 de noviembre de 2026

> «Added the crm.form.* methods in REST 3.0 for working with CRM forms: searching for forms and retrieving their configuration, creating forms with configuration validation before saving, partial updates, activating and deactivating with the active forms limit taken into account, deleting, CRM form builder and CRM object field directories, the website embed code and button and auto-display settings, and viewing the website widgets and Open Channels of a form»
>
> — https://apidocs.bitrix24.com/whats-new.html, consultado el 8 de noviembre de 2026

## A.9 Control de acceso y trazabilidad

### A.9.1 Restricción de la cartera por productor

**Qué resuelve.** Que cada productor vea su cartera y no la de los demás.

**EspoCRM** · **2** (cumple) · costo de implementación **1**

- *Cómo lo hace.* Con un rol de productor restringido a lo propio, su listado de pólizas muestra solo las que tiene a cargo; la dirección de una póliza ajena abierta en el navegador niega el acceso, y la interfaz de programación, consultada con sus credenciales, responde que no tiene permiso.
- *Características.* Los roles de la administración definen, entidad por entidad, si el usuario ve todo, lo de su equipo o solo lo suyo. La restricción se aplica en el servidor y no solo en la pantalla. Acceso a una póliza ajena por la interfaz de programación: respuesta 403.
- *Justificación.* Definir el rol es configuración de una vez.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-9-1-espocrm-1-rol-del-productor, A-9-1-espocrm-2-solo-lo-suyo, A-9-1-espocrm-3-direccion-directa.

**Twenty** · **0** (no cumple)

- *Cómo lo hace.* En la edición evaluada los roles restringen por objeto —ver, editar, borrar— y por campo, pero no por registro: un productor, con el rol de miembro, puede abrir la póliza de otro productor y verla completa.
- *Justificación.* La pantalla del rol muestra el nivel de registro como función del plan Organization, y el fabricante lo confirma: los permisos por registro, que limitan a cada vendedor a lo suyo, son una función premium de ese plan. Sin él, la cartera de un productor queda a la vista de todos.
- *Comentario — con Twenty Organization* (US$ 39 por usuario por mes, con pago anual, abono recurrente) sería **2** (cumple, costo 1). Con el plan Organization, en la nube o en la instalación propia, el rol filtra los registros con una condición —el productor de la póliza es el usuario que entra—, que se define una vez desde la pantalla del rol.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-9-1-twenty-1-permisos-del-rol, A-9-1-twenty-2-poliza-ajena-abierta.

> «Row-level permissions are a Premium feature available on the Organization plan (Cloud and Self-Hosted).»
>
> — https://docs.twenty.com/user-guide/permissions-access/capabilities/permissions, consultado el 30 de octubre de 2026

> «Cloud Pro is $9/user/month and Organization is $39/user/month, billed yearly. Organization adds 5x more AI usage per member, custom roles with field and row-level permissions, and SSO. Self-hosting the open source core is free.»
>
> — https://twenty.com/pricing, consultado el 30 de octubre de 2026

> «Premium features are only available on the Organization plans (Cloud or Self-Hosted):»
>
> — https://docs.twenty.com/user-guide/billing/capabilities/pricing-plans, consultado el 30 de octubre de 2026

**Bitrix24** · **0** (no cumple)

- *Cómo lo hace.* En la edición gratuita no se puede crear la restricción por productor: desde CRM › Más › Configuraciones › «Permisos de acceso al CRM» el editor deja armar el rol «Productor» con leer, agregar, editar y eliminar limitados a «Solo sus propios elementos» en contactos y negociaciones y asignárselo al productor, pero al guardar el sistema abre una pantalla de oferta —«En su plan actual, todos los empleados tienen los mismos permisos de acceso. Actualice a uno de los planes de nivel superior para asignar roles a los empleados»— y el rol no queda creado. Con la sesión del productor, sin rol propio, el asegurado ajeno figura en su listado y se abre al escribir la dirección de su ficha: todos los empleados comparten el mismo permiso, y no se puede distinguir a un productor de un supervisor ni ajustar el acceso de ninguno.
- *Justificación.* El fabricante confirma que los permisos por rol del CRM no están en todos los planes, y su comparación de planes los publica desde el plan Basic.
- *Comentario — con Bitrix24 Basic* (US$ 69 por mes, hasta 5 usuarios, abono recurrente) sería **2** (cumple, costo 1). Los permisos de acceso del CRM por rol se incluyen desde el plan Basic, y el editor de roles permite limitar a cada productor a sus propios elementos con una configuración de una sola vez. No se contrató el plan: el editor es el mismo que se recorrió en la edición gratuita, que solo frena al guardar.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-9-1-bitrix24-1-rol-productor-contactos, A-9-1-bitrix24-2-rol-productor-negociaciones, A-9-1-bitrix24-3-rol-asignado, A-9-1-bitrix24-4-al-guardar, A-9-1-bitrix24-5-rol-tras-guardar, A-9-1-bitrix24-6-lista-del-productor, A-9-1-bitrix24-7-direccion-directa.

> «Role-based access permissions in CRM are not available on all plans. Bitrix24 plans and pricing»
>
> — https://helpdesk.bitrix24.com/open/25911175/, consultado el 30 de septiembre de 2026

> «Permisos de acceso CRM Establezca y limite el acceso a los canales abiertos para cada usuario, de acuerdo con su función y los permisos asignados»
>
> — https://www.bitrix24.es/prices/compare_cloud_plans.php, consultado el 30 de septiembre de 2026

> «Basic Ideal para emprendedores individuales y equipos pequeños que están empezando US$ 69 US$ 69 US$ 49 / compañía / mes / facturado mensualmente / compañía / mes / facturación anual Un pago de US$ 588 / año Ahorra US$ 240 al año incluye 5 usuarios Comprar Comprar Todo lo incluido en Free, más: Almacenamiento de 24 GB IA para el trabajo diario en Bitrix24 Embudos de ventas Negociaciones recurrentes Pagos en línea Integración de correo electrónico Integración de WhatsApp Integración de telefonía»
>
> — https://www.bitrix24.es/prices/, consultado el 30 de septiembre de 2026

### A.9.2 Autenticación de los usuarios bajo control de la compañía

**Qué resuelve.** Que solo entre quien debe, con las reglas de acceso que fija la compañía.

**EspoCRM** · **2** (cumple) · costo de implementación **1**

- *Cómo lo hace.* La pantalla de autenticación de la administración reúne las tres cosas: la política de contraseñas —longitud mínima y exigencia de letras, números y caracteres especiales—, el segundo factor para los usuarios, y el ingreso contra el directorio de la compañía entre 3 métodos (Espo, LDAP, OIDC).
- *Características.* La compañía decide cómo se valida la identidad de cada usuario sin depender del fabricante.
- *Justificación.* Viene en el producto y se activa desde esa pantalla: es configuración.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-9-2-espocrm-1-autenticacion, A-9-2-espocrm-2-metodos, A-9-2-espocrm-3-politica-de-contrasenas.

**Twenty** · **2** (cumple) · costo de implementación **1**

- *Cómo lo hace.* La seguridad del espacio de trabajo permite imponer el segundo factor a todos los usuarios en cada ingreso y apagar el ingreso con correo y contraseña, de modo que solo se entre con la cuenta de la compañía.
- *Características.* La instalación propia admite el ingreso con cuentas de Google y de Microsoft registrando sus credenciales, que es como se unifica el acceso con el directorio de una compañía que usa esos servicios; la conexión por SAML u OIDC con cualquier otro directorio es del plan Organization. Twenty no tiene una política de contraseñas propia: con el ingreso por la cuenta de la compañía, la que rige es la de su directorio.
- *Justificación.* Las reglas de acceso quedan en manos de la compañía: segundo factor obligatorio, ingreso solo con su cuenta y la política de contraseñas de su directorio. Se configura una vez desde la seguridad del espacio de trabajo.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-9-2-twenty-1-seguridad-del-espacio.

> «Authentication - Google/Microsoft OAuth, password settings»
>
> — https://docs.twenty.com/developers/self-host/capabilities/setup, consultado el 28 de septiembre de 2026

> «Organization plan (cloud and self-hosted workspaces)»
>
> — https://docs.twenty.com/user-guide/permissions-access/capabilities/sso-configuration, consultado el 28 de septiembre de 2026

**Bitrix24** · **1** (cumple con reparo) · costo de implementación **2**

- *Cómo lo hace.* La pantalla no ofrece ninguna política de contraseñas configurable —longitud, complejidad, vencimiento—.
- *Características.* Los ajustes de seguridad del portal ofrecen la autenticación de dos factores, que el administrador puede volver obligatoria para todos los empleados con un plazo para habilitarla, y una confirmación adicional del inicio de sesión en el dispositivo de confianza.
- *Justificación.* El acceso unificado con el directorio de la compañía existe como inicio de sesión único (SSO) con Microsoft Azure Active Directory, pero el fabricante lo limita a los planes Enterprise: en la edición gratuita no está.
- *Comentario — con Bitrix24 Enterprise* (US$ 579 por mes, desde 250 usuarios, abono recurrente) sería **2** (cumple, costo 1). Con el plan Enterprise, el primero que incluye el inicio de sesión único, los usuarios entran con su cuenta del directorio de Microsoft de la compañía, que aplica su propia política de contraseñas; junto con el segundo factor obligatorio, las reglas de acceso quedan bajo control de la compañía. Se configura una vez. No se contrató el plan, así que no se comprobó.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-9-2-bitrix24-1-seguridad.

> «Single Sign-On (SSO) is available on Bitrix24 Enterprise plans. It lets employees sign in with their Microsoft Azure Active Directory account without entering a password.»
>
> — https://helpdesk.bitrix24.com/open/24571280/, consultado el 9 de noviembre de 2026

> «US$ 579 US$ 579 US$ 399 US$ 919 US$ 919 US$ 639 US$ 1,149 US$ 1,149 US$ 799 US$ 2,299 US$ 2,299 US$ 1,599 US$ 3,449 US$ 3,449 US$ 2,399 US$ 4,599 US$ 4,599 US$ 3,199 US$ 5,749 US$ 5,749 US$ 3,999 US$ 6,899 US$ 6,899 US$ 4,799 US$ 8,049 US$ 8,049 US$ 5,599 US$ 9,199 US$ 9,199 US$ 6,399 US$ 10,349 US$ 10,349 US$ 7,199 US$ 11,499 US$ 11,499 US$ 7,999»
>
> — https://www.bitrix24.es/prices/, consultado el 9 de noviembre de 2026

### A.9.3 Registro de quién modificó cada dato

**Qué resuelve.** Saber quién cambió qué y cuándo, ante un error o una disputa.

**EspoCRM** · **2** (cumple) · costo de implementación **1**

- *Cómo lo hace.* Cuando un productor cambia el ramo de una póliza, al abrirla otro usuario la historia de la ficha muestra la constancia completa: el valor anterior, el nuevo, quién lo cambió y en qué momento.
- *Características.* Para que un campo deje esa constancia se lo marca como auditado desde el Administrador de Campos, una sola vez y sin programar. Constancia: Automotor → Hogar, el 2026-10-30 05:07:08.
- *Justificación.* Es lo que permite responder quién tocó un dato cuando un asegurado lo discute.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-9-3-espocrm-1-constancia-en-la-ficha.

**Twenty** · **2** (cumple) · costo de implementación **0**

- *Cómo lo hace.* Cuando el productor cambia el ramo de una póliza desde la ficha, el administrador, con su cuenta, encuentra la constancia en la línea de tiempo de la póliza: quién lo cambió, cuándo, y el valor anterior junto al nuevo.
- *Características.* Cada registro trae de fábrica una línea de tiempo con sus cambios. Los cambios seguidos de la misma persona sobre un registro, dentro de los diez minutos, se funden en una entrada con el primer valor y el último. Automotor → Hogar, por Pablo Gómez, 2026-09-29T03:29:17.691Z.
- *Justificación.* Viene listo, sin configurar nada. El registro de auditoría de todo el espacio de trabajo es aparte, y es del plan Organization.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-9-3-twenty-1-constancia-del-cambio.

**Bitrix24** · **0** (no cumple)

- *Cómo lo hace.* Al cambiar un campo de una póliza desde su ficha, por ejemplo el ramo, el cambio se guarda pero no deja ninguna constancia: la línea de tiempo de la edición gratuita solo muestra la creación de la negociación —y los cambios de etapa—, sin el valor anterior, el autor ni el momento del cambio de un campo.
- *Justificación.* La pestaña «Historial», que sí registra quién hizo cada acción y cuándo, no se abre: el sistema informa que el historial en CRM está disponible solo en los planes Standard, Professional y Enterprise.
- *Comentario — con Bitrix24 Standard* (US$ 144 por mes, hasta 50 usuarios, abono recurrente) sería **2** (cumple, costo 0). El historial en CRM, que el fabricante describe como un registro detallado de cada actividad de los usuarios con quién la realizó y en qué momento, se habilita desde el plan Standard. No se contrató el plan, así que no se comprobó que el cambio de ramo muestre el valor anterior.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-9-3-bitrix24-1-linea-de-tiempo, A-9-3-bitrix24-2-historial.

> «The CRM history logs key changes to CRM items, such as exporting contacts or updating field values. Use it to track activity related to clients and deals.»
>
> — https://helpdesk.bitrix24.com/open/25803275/, consultado el 30 de septiembre de 2026

> «US$ 144»
>
> — https://www.bitrix24.es/prices/, consultado el 30 de septiembre de 2026

## A.10 Explotación de la información

### A.10.1 Indicadores sobre la operación

**Qué resuelve.** Que la dirección vea cómo va el negocio sin pedir un informe.

**EspoCRM** · **1** (cumple con reparo) · costo de implementación **2**

- *Cómo lo hace.* Para obtener el total de primas por estado de cobranza o el tiempo promedio de resolución hay que exportar el listado —XLSX · Spreadsheet o CSV— y calcularlo en una planilla, cada vez que se quiere ver el número.
- *Características.* Los indicadores que trae la edición gratuita son los de ventas —oportunidades por etapa, por origen y por mes—. Para las pólizas y los reclamos el tablero ofrece listas, como los tickets pendientes de cada usuario, pero ninguna suma ni promedia.
- *Justificación.* Los totales y promedios sobre pólizas y reclamos se obtienen exportando el listado y calculándolos en una planilla cada vez, porque el tablero de la edición gratuita ofrece listas y ninguna suma ni promedia. El módulo de informes que vende el fabricante agrupa y resume con sumas y promedios, y lo muestra en el tablero.
- *Comentario — con Advanced Pack* (US$ 395 por año y por instalación, abono recurrente) sería **2** (cumple, costo 1). Un informe agrupado suma las primas por estado de cobranza y promedia la resolución de reclamos, y se lo lleva al tablero.
- *Comentario — con EspoCRM Cloud Basic* (US$ 15 por usuario por mes, mínimo 3 usuarios, abono recurrente) sería **2** (cumple, costo 1). El servicio en la nube incluye el módulo de informes.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-10-1-espocrm-1-cajas-del-tablero, A-10-1-espocrm-2-exportar-para-calcular-afuera.

> «The Reports feature is available in Advanced Pack. It provides the analytic capabilities and two additional functionalities: report panels and custom list view filters.»
>
> — https://docs.espocrm.com/user-guide/reports/, consultado el 30 de octubre de 2026

> «Grid reports display summarized values, can be grouped by one or two fields, and support chart visualization.»
>
> — https://docs.espocrm.com/user-guide/reports/, consultado el 30 de octubre de 2026

> «$395.00 1 Year License + Upgrades»
>
> — https://www.espocrm.com/extensions/advanced-pack/, consultado el 30 de octubre de 2026

> «1.1 Subject to your continuous compliance with the Agreement and payment of the applicable license fees, EspoCRM grants you a non-exclusive, non-transferable, worldwide, limited right to use the Software on a single EspoCRM Application instance on a single server for the Licensed Period. After the license period expires, you must renew or purchase a new license to continue using the Software. You may use or modify the Software only for your own internal business purposes or for non-commercial or personal use.»
>
> — https://www.espocrm.com/extension-license-agreement/, consultado el 30 de octubre de 2026

> «Basic $15.00 per user/month minimum 3 users 3GB file storage per user 100,000 records SSL Encryption (256 bit keys, TLS 1.3) Full feature set All extensions included External access API 2000+ integrations * 12x5 (hours/days) support Sign Up Free Trial Free Trial is provided for 30 days»
>
> — https://www.espocrm.com/cloud/, consultado el 30 de octubre de 2026

**Twenty** · **1** (cumple con reparo) · costo de implementación **2**

- *Cómo lo hace.* Los tableros vienen de fábrica: se arma un gráfico con el total de primas por estado de cobranza eligiendo el objeto, el campo del eje y la suma de la prima, sin programar, y queda guardado para consultarlo cuando se quiera.
- *Características.* El tiempo promedio de resolución de los reclamos, en cambio, no se puede mostrar: el gráfico promedia campos numéricos, y el producto no calcula la duración de cada reclamo ni tiene campos que la deriven de sus fechas. Primas por estado: Cancelada 201000 · Al día 354000 · En gestión 177000 · Vencida 402000 · (sin estado) 60501.
- *Justificación.* Para mostrar el tiempo promedio de resolución hay que agregar la duración de cada reclamo con un flujo con código que la escriba al cerrarse cada reclamo, que es desarrollo.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-10-1-twenty-1-primas-por-estado, A-10-1-twenty-2-medidas-sobre-reclamos.

**Bitrix24** · **1** (cumple con reparo) · costo de implementación **2**

- *Cómo lo hace.* El asistente de informes del CRM, que viene en la edición gratuita, arma sin programar el total de primas por estado de cobranza: se agrupa por el campo de lista y se suma el importe de la negociación, y el informe muestra por cada estado la suma de las negociaciones.
- *Características.* La suma va sobre el importe nativo: el campo propio de tipo dinero solo admite contarse. El tiempo promedio de resolución, en cambio, no se puede mostrar: sobre las fechas de la negociación el asistente ofrece solo Mínimo, Máximo, Único, sin promedio ni diferencia entre dos fechas. Primas por estado: Vencida 600 · Al día 900 · En gestión 900.
- *Justificación.* Los paneles de analítica que sí podrían medirlo piden un plan: el sistema informa que BI Builder se desbloquea a partir del Standard.
- *Comentario — con Bitrix24 Standard* (US$ 144 por mes, hasta 50 usuarios, abono recurrente) sería **2** (cumple, costo 1). Con el plan Standard se habilita BI Builder, donde cada conjunto de datos de negociaciones trae las fechas de creación y de cierre y admite columnas calculadas con fórmulas, según el fabricante: el tiempo de resolución se obtiene definiendo esa columna y promediándola. Definir la columna es configuración de una vez.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-10-1-bitrix24-1-armado-del-informe, A-10-1-bitrix24-2-primas-por-estado, A-10-1-bitrix24-3-calculos-sobre-fechas, A-10-1-bitrix24-4-paneles-de-analitica.

> «BI Builder Crea informes de analíticas a partir de la información del CRM.»
>
> — https://www.bitrix24.es/prices/compare_cloud_plans.php, consultado el 29 de septiembre de 2026

> «Calculated columns: Add new fields using formulas. For example, create a column that adds 1 to the company_id value.»
>
> — https://helpdesk.bitrix24.com/open/19542946/, consultado el 29 de septiembre de 2026

> «US$ 144»
>
> — https://www.bitrix24.es/prices/, consultado el 29 de septiembre de 2026

### A.10.2 Generación de informes definidos por el usuario

**Qué resuelve.** Responder una pregunta del negocio con los datos, sin depender de sistemas.

**EspoCRM** · **1** (cumple con reparo) · costo de implementación **2**

- *Cómo lo hace.* El total de primas por productor se arma en la planilla exportada, a mano, cada vez que se pide el informe.
- *Características.* En la edición gratuita el listado de pólizas se filtra por productor y por período y se exporta en XLSX · Spreadsheet o CSV, pero no suma.
- *Justificación.* El total de primas por productor se arma a mano en la planilla exportada cada vez que se pide, porque el listado de pólizas de la edición gratuita filtra por productor y período pero no suma. El módulo de informes del fabricante agrupa por productor, suma las primas del período elegido y exporta el resultado ya calculado.
- *Comentario — con Advanced Pack* (US$ 395 por año y por instalación, abono recurrente) sería **2** (cumple, costo 1). El informe agrupado por productor suma las primas del período y se exporta a planilla.
- *Comentario — con EspoCRM Cloud Basic* (US$ 15 por usuario por mes, mínimo 3 usuarios, abono recurrente) sería **2** (cumple, costo 1). El servicio en la nube incluye el módulo de informes.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-10-2-espocrm-1-listado-y-exportacion.

> «The Reports feature is available in Advanced Pack. It provides the analytic capabilities and two additional functionalities: report panels and custom list view filters.»
>
> — https://docs.espocrm.com/user-guide/reports/, consultado el 30 de octubre de 2026

> «Grid reports display summarized values, can be grouped by one or two fields, and support chart visualization.»
>
> — https://docs.espocrm.com/user-guide/reports/, consultado el 30 de octubre de 2026

> «It's possible to export grid report results to XLSX (spreadsheet) and CSV formats. Both a results table and chart are exported to XLSX.»
>
> — https://docs.espocrm.com/user-guide/reports/, consultado el 30 de octubre de 2026

> «$395.00 1 Year License + Upgrades»
>
> — https://www.espocrm.com/extensions/advanced-pack/, consultado el 30 de octubre de 2026

> «1.1 Subject to your continuous compliance with the Agreement and payment of the applicable license fees, EspoCRM grants you a non-exclusive, non-transferable, worldwide, limited right to use the Software on a single EspoCRM Application instance on a single server for the Licensed Period. After the license period expires, you must renew or purchase a new license to continue using the Software. You may use or modify the Software only for your own internal business purposes or for non-commercial or personal use.»
>
> — https://www.espocrm.com/extension-license-agreement/, consultado el 30 de octubre de 2026

> «Basic $15.00 per user/month minimum 3 users 3GB file storage per user 100,000 records SSL Encryption (256 bit keys, TLS 1.3) Full feature set All extensions included External access API 2000+ integrations * 12x5 (hours/days) support Sign Up Free Trial Free Trial is provided for 30 days»
>
> — https://www.espocrm.com/cloud/, consultado el 30 de octubre de 2026

**Twenty** · **1** (cumple con reparo) · costo de implementación **2**

- *Cómo lo hace.* El informe se arma desde un tablero, eligiendo los criterios sin programar: un gráfico con la suma de la prima de las pólizas agrupada por productor, filtrado por las que empezaron su vigencia en un período dado.
- *Características.* Muestra el total de cada productor y queda guardado. Pero el gráfico no se exporta: el widget no ofrece descargarlo. Totales esperados: TP TP 207000 · Pablo Gómez 207000 · (sin productor) 0 · 34 pólizas exportadas.
- *Justificación.* Lo que se puede sacar es el listado de pólizas, a un archivo que la planilla abre, y los totales por productor hay que rehacerlos ahí cada vez que se necesita el informe fuera del sistema.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-10-2-twenty-1-primas-por-productor, A-10-2-twenty-2-acciones-del-widget.

**Bitrix24** · **2** (cumple) · costo de implementación **1**

- *Cómo lo hace.* El asistente de informes del CRM, incluido en la edición gratuita, arma sin programar el total de primas por productor en un período: se agrupa por la persona responsable, se suma el importe de la negociación y se elige el rango de fechas por la fecha de inicio de la póliza. El menú del informe lo exporta a un archivo de Microsoft Excel con esos totales.
- *Características.* La suma se hace sobre el importe nativo de la negociación, no sobre un campo propio de tipo dinero. Totales por productor: Gómez Productor 900 · Nahuel Mosse 300 · exportado a report.xls.
- *Justificación.* Armar el informe es configuración: se elige una vez y se vuelve a abrir cuando se lo necesita.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-10-2-bitrix24-1-armado-del-informe, A-10-2-bitrix24-2-primas-por-productor, A-10-2-bitrix24-3-archivo-listo.

### A.10.3 Informe paramétrico reutilizable

**Qué resuelve.** Repetir cada mes el mismo informe cambiando solo el período.

**EspoCRM** · **1** (cumple con reparo) · costo de implementación **2**

- *Cómo lo hace.* Pero no es un informe con parámetro: para verlo sobre otro período hay que cambiar la condición, y el resultado sigue siendo un listado que hay que exportar y totalizar afuera.
- *Características.* La edición gratuita guarda búsquedas con períodos relativos —mes actual, mes pasado, trimestre, próximos días, entre 21 opciones—, que se vuelven a abrir sin rearmarlas.
- *Justificación.* La búsqueda guardada con período relativo no es un informe con parámetro: para verlo sobre otro período hay que cambiar la condición, y el resultado sigue siendo un listado que hay que exportar y totalizar afuera. Los filtros al ejecutar del módulo de informes del fabricante piden el período cada vez que se corre el informe, sin editarlo.
- *Comentario — con Advanced Pack* (US$ 395 por año y por instalación, abono recurrente) sería **2** (cumple, costo 1). El informe guardado pide el período al ejecutarse y se reutiliza sin editarlo.
- *Comentario — con EspoCRM Cloud Basic* (US$ 15 por usuario por mes, mínimo 3 usuarios, abono recurrente) sería **2** (cumple, costo 1). El servicio en la nube incluye el módulo de informes.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-10-3-espocrm-1-periodos-del-filtro.

> «Runtime Filters lets you narrow down the results each time you run the report, without needing to edit the report itself. It's useful when the report structure stays the same, but you want to change the criteria dynamically – like choosing a specific date range, customer, or status before generating the results.»
>
> — https://docs.espocrm.com/user-guide/reports/, consultado el 30 de octubre de 2026

> «$395.00 1 Year License + Upgrades»
>
> — https://www.espocrm.com/extensions/advanced-pack/, consultado el 30 de octubre de 2026

> «1.1 Subject to your continuous compliance with the Agreement and payment of the applicable license fees, EspoCRM grants you a non-exclusive, non-transferable, worldwide, limited right to use the Software on a single EspoCRM Application instance on a single server for the Licensed Period. After the license period expires, you must renew or purchase a new license to continue using the Software. You may use or modify the Software only for your own internal business purposes or for non-commercial or personal use.»
>
> — https://www.espocrm.com/extension-license-agreement/, consultado el 30 de octubre de 2026

> «Basic $15.00 per user/month minimum 3 users 3GB file storage per user 100,000 records SSL Encryption (256 bit keys, TLS 1.3) Full feature set All extensions included External access API 2000+ integrations * 12x5 (hours/days) support Sign Up Free Trial Free Trial is provided for 30 days»
>
> — https://www.espocrm.com/cloud/, consultado el 30 de octubre de 2026

**Twenty** · **2** (cumple) · costo de implementación **1**

- *Cómo lo hace.* El informe de primas por productor se guarda en su tablero con el período como condición del filtro. Para otro período se cambia solo la fecha del filtro del mismo gráfico: los totales se recalculan sin rehacer el informe, que conserva su fuente, su agrupación y su medida.
- *Características.* El período no se pide al abrirlo: cambiarlo modifica el informe guardado para todos los que lo miran, o hay que duplicarlo. Seis meses: Not Set Pablo Gómez TP TP 0 50k 100k 150k 200k 250k · un año: Not Set Pablo Gómez TP TP 0 200k 400k 600k 800k.
- *Justificación.* Armarlo es configuración de una sola vez.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-10-3-twenty-1-seis-meses, A-10-3-twenty-2-un-anio.

**Bitrix24** · **2** (cumple) · costo de implementación **1**

- *Cómo lo hace.* El informe de primas por productor se guarda una sola vez, sin período fijo, y la pantalla del informe trae el período como parámetro: se lo ejecuta para un rango de fechas y, sin volver a armarlo, se lo vuelve a ejecutar para otro.
- *Características.* Cada ejecución recalculó los totales por productor —Gómez Productor 900 y Nahuel Mosse 300 en septiembre; Nahuel Mosse 900 en el primer trimestre—, iguales a los que suman las negociaciones. Septiembre: {"Gómez Productor":900,"Nahuel Mosse":300} · Primer trimestre: {"Nahuel Mosse":900}.
- *Justificación.* Armarlo es configuración de una vez; el período se pide cada vez que se abre.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-10-3-bitrix24-1-septiembre, A-10-3-bitrix24-2-primer-trimestre, A-10-3-bitrix24-3-informe-guardado.

### A.10.4 Intercambio de datos con otros sistemas de la compañía

**Qué resuelve.** Que el sistema converse con los demás de la compañía sin cargar dos veces lo mismo.

**EspoCRM** · **2** (cumple) · costo de implementación **1**

- *Cómo lo hace.* Desde fuera del sistema, un usuario de integración con su propia clave puede crear registros —por ejemplo un asegurado— y volver a consultarlos por la interfaz de programación.
- *Características.* El producto trae una interfaz de programación completa y un tipo de usuario pensado para otros sistemas: se dio de alta un usuario de integración con su propia clave y los permisos de un rol, sin contraseña de ninguna persona. El sistema de emisión o el de cobranza de la compañía pueden cargar y leer datos por esa vía.
- *Justificación.* Crear el usuario de integración es configuración; lo que el otro sistema haga con la interfaz es trabajo de ese sistema, no de este.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-10-4-espocrm-1-usuario-de-integracion.

> «Authentication by API Key»
>
> — https://docs.espocrm.com/development/api/, consultado el 30 de octubre de 2026

**Twenty** · **2** (cumple) · costo de implementación **1**

- *Cómo lo hace.* Desde Configuración se crea una clave para el otro sistema, que lleva un rol que define lo que puede hacer, sin la contraseña de ninguna persona; con esa clave, desde fuera del sistema, el otro sistema da de alta y consulta registros.
- *Características.* El producto trae interfaces de programación REST y GraphQL que se generan solas a partir del modelo de datos, incluidos los objetos propios como la póliza.
- *Justificación.* Crear la clave del otro sistema es configuración; lo que el otro sistema haga con la interfaz es trabajo de ese sistema, no de este.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-10-4-twenty-1-clave-de-integracion.

> «There is no static API reference for Twenty. Each workspace has its own schema — when you add a custom object (say Invoice), it immediately gets REST and GraphQL endpoints identical to built-in objects like Company or Person. The API is generated from the schema, so endpoints use your object and field names directly — no opaque IDs.»
>
> — https://docs.twenty.com/developers/extend/api, consultado el 30 de octubre de 2026

**Bitrix24** · **0** (no cumple)

- *Cómo lo hace.* En la edición gratuita no hay forma de crear ni consultar registros desde fuera: Recursos para desarrolladores ofrece «Webhook entrante», y al abrirlo el sistema responde «No disponible en tu plan actual» y remite al plan Basic Vibe+.
- *Características.* El webhook entrante es una dirección secreta que el otro sistema llama para ejecutar métodos de la API, con los permisos del usuario que lo crea.
- *Justificación.* El comparativo del fabricante lo confirma: la API REST no figura en la edición gratuita ni en las demás ediciones sin Vibe+, y se habilita sin tope desde el plan Basic Vibe+.
- *Comentario — con Bitrix24 Basic Vibe+* (US$ 89 por mes, hasta 5 usuarios, abono recurrente) sería **2** (cumple, costo 1). Con el plan Basic en su edición Vibe+ la API REST no tiene tope y el webhook entrante se crea desde Recursos para desarrolladores, sin programar: el otro sistema llama a su dirección para crear y consultar negociaciones y contactos. Crear el webhook y elegir sus permisos es configuración de una vez; lo que el otro sistema haga con él es trabajo de ese sistema.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-10-4-bitrix24-1-webhook-entrante.

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

### A.10.5 Intercambio sin límite de volumen que condicione la operación

**Qué resuelve.** Que ese intercambio aguante el movimiento real de la compañía.

**Cifra de referencia: 500 operaciones diarias.** Son las altas, los cambios de estado y los cierres de reclamo de una jornada sobre la cartera de una compañía promedio.

| 2 | 1 | 0 |
|---|---|---|
| El límite publicado deja holgura sobre las 500 operaciones diarias | Las admite, pero se agota en una jornada intensa y obliga a espaciar los envíos | Queda por debajo de 500, o no está publicado |

**EspoCRM** · **2** (cumple) · costo de implementación **0**

- *Cómo lo hace.* La interfaz de programación acepta el movimiento de un día entero de altas, tanto en ráfaga —varias operaciones simultáneas— como de a una, en minutos.
- *Características.* En la instalación propia la interfaz de programación no tiene un tope publicado: no lo impone el fabricante sino el equipo donde corre. En una corrida anterior, con el equipo ocupado por otros procesos, tres de quinientas altas en ráfaga fueron rechazadas y pasaron al repetirlas: el límite es la capacidad del servidor, no una cuota del producto. ráfaga de 10 simultáneas: {"200":500} en 78 s · de a una: {"200":500} en 692 s.
- *Justificación.* El movimiento de un día entra con holgura en minutos, y la sincronización con otros sistemas no tiene que espaciarse más allá de reintentar lo que falle.

> «Authentication by API Key»
>
> — https://docs.espocrm.com/development/api/, consultado el 30 de octubre de 2026

**Twenty** · **2** (cumple) · costo de implementación **0**

- *Cómo lo hace.* La interfaz de programación admite el movimiento de un día entero de altas, enviadas en ráfagas de diez simultáneas, de a un registro por pedido, sin rechazos.
- *Características.* El fabricante publica el límite de la interfaz de programación: cien pedidos por minuto, y hasta sesenta registros por pedido en las operaciones por lotes. 500 de 500 altas aceptadas en 0,9 minutos, sin rechazos por límite.
- *Justificación.* El límite deja holgura sobre el movimiento de un día: lo que exige es que el otro sistema espacie sus pedidos o los agrupe, como hace cualquier sincronización.

> «100 per minute»
>
> — https://docs.twenty.com/developers/extend/api, consultado el 30 de octubre de 2026

**Bitrix24** · **0** (no cumple)

- *Cómo lo hace.* Donde la API existe, el fabricante publica su límite: a dos pedidos por segundo se pueden hacer 172.800 por día, que deja holgura de sobra sobre las 500 operaciones diarias de la cartera.
- *Justificación.* En la edición gratuita el intercambio no está disponible —el webhook entrante responde «No disponible en tu plan actual»—, así que no hay operaciones que sincronizar ni límite que medir: la cartera no se puede sincronizar con otro sistema.
- *Comentario — con Bitrix24 Basic Vibe+* (US$ 89 por mes, hasta 5 usuarios, abono recurrente) sería **2** (cumple, costo 0). Con el plan Basic en su edición Vibe+ la API REST está habilitada. El fabricante publica que el límite se sostiene a dos pedidos por segundo, 172.800 por día, y admite ráfagas por encima: las 500 operaciones de un día son el 0,3 % de ese tope y no se acercan a él en una jornada intensa. No hay nada que configurar para el volumen.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-10-5-bitrix24-1-webhook-entrante.

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

## A.11 Emisión, cobranza y continuidad de la relación

### A.11.1 Emisión de la póliza al cerrar la venta

**Qué resuelve.** Que la venta cerrada se convierta en póliza sin volver a cargar lo que ya se negoció.

**EspoCRM** · **1** (cumple con reparo) · costo de implementación **2**

- *Cómo lo hace.* Ganar la oportunidad no emite nada por sí solo: el producto trae la conversión del solicitante en asegurado y oportunidad, y de ahí en adelante la póliza se carga aparte. La emisión se resuelve con un guion en la fórmula de la entidad Oportunidad (Administración › Entidades › Oportunidad › Fórmula) que, cuando la etapa pasa a «Cerrada ganada», crea la póliza con el nombre, el importe como prima, la fecha de cierre como inicio de vigencia y el responsable de la oportunidad, y la liga al asegurado y a la oportunidad de origen. Al marcar ganada la oportunidad desde la ficha, la póliza aparece sola en el panel de pólizas de la oportunidad y en la ficha del asegurado.
- *Características.* La póliza nace vinculada al asegurado y a la oportunidad que la originó, con la prima tomada del importe negociado y sin volver a escribir ningún dato. El guion corre solo cuando la etapa cambia a ganada: guardar otra vez la oportunidad no emite una segunda póliza. Necesita definir antes la relación entre póliza y oportunidad y ubicarla en las pantallas. El ramo y el número definitivo no figuran en la oportunidad: la póliza nace con el ramo que la lista propone por defecto y con el nombre de la venta como número, hasta que se completen o los traiga el sistema central. Póliza POL-Seguro de hogar — Sandoval con prima 132500 ARS, titular y oportunidad de origen.
- *Justificación.* La póliza se emite sola al ganar la oportunidad, pero solo con código escrito en el sistema: el producto no lo resuelve sin programar. Ese código usa funciones del sistema —crear un registro, buscar el asegurado relacionado— y alguien tiene que mantenerlo cuando cambie el modelo de la póliza.
- *Comentario — con Advanced Pack* (US$ 395 por año y por instalación, abono recurrente) sería **2** (cumple, costo 1). Los flujos de trabajo de la extensión incluyen la acción «Crear registro» de cualquier entidad al cambiar un campo, de modo que la misma regla se arma desde pantallas, sin escribir el guion.
- *Comentario — con EspoCRM Cloud Basic* (US$ 15 por usuario por mes, mínimo 3 usuarios, abono recurrente) sería **2** (cumple, costo 1). El servicio en la nube trae las extensiones del fabricante, con los mismos flujos de trabajo.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-11-1-espocrm-1-guion, A-11-1-espocrm-2-oportunidad-con-su-poliza, A-11-1-espocrm-3-poliza-emitida, A-11-1-espocrm-4-ficha-del-asegurado.

> «The system will create a new record of any entity type. If there is a relationship between the target entity type and the entity type of records being created, it's possible to relate them.»
>
> — https://docs.espocrm.com/administration/workflows/, consultado el 30 de octubre de 2026

> «$395.00 1 Year License + Upgrades»
>
> — https://www.espocrm.com/extensions/advanced-pack/, consultado el 30 de octubre de 2026

> «1.1 Subject to your continuous compliance with the Agreement and payment of the applicable license fees, EspoCRM grants you a non-exclusive, non-transferable, worldwide, limited right to use the Software on a single EspoCRM Application instance on a single server for the Licensed Period. After the license period expires, you must renew or purchase a new license to continue using the Software. You may use or modify the Software only for your own internal business purposes or for non-commercial or personal use.»
>
> — https://www.espocrm.com/extension-license-agreement/, consultado el 30 de octubre de 2026

> «Basic $15.00 per user/month minimum 3 users 3GB file storage per user 100,000 records SSL Encryption (256 bit keys, TLS 1.3) Full feature set All extensions included External access API 2000+ integrations * 12x5 (hours/days) support Sign Up Free Trial Free Trial is provided for 30 days»
>
> — https://www.espocrm.com/cloud/, consultado el 30 de octubre de 2026

**Twenty** · **2** (cumple) · costo de implementación **1**

- *Cómo lo hace.* Un flujo de trabajo se dispara al actualizarse una oportunidad, filtra por la etapa «Customer» y crea un registro de Pólizas con el nombre de la oportunidad, el asegurado como titular y el monto como prima, tomados con el selector de variables. Al pasar la oportunidad a esa etapa desde su ficha, la póliza aparece vinculada al asegurado y se ve en su ficha, con la prima de la oportunidad.
- *Características.* Disparador por actualización de registro con condición sobre la etapa; paso «Crear registro» sobre el objeto propio de pólizas; variables del registro disparador para no recargar datos —el importe de la prima se arma con dos variables, el monto en micros y el código de moneda de la oportunidad—; la póliza queda en la ficha del asegurado.
- *Justificación.* El flujo se arma una sola vez y cada venta ganada emite la póliza con sus datos sin intervención. Configurar el flujo y el objeto de pólizas es trabajo de configuración, sin desarrollo.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-11-1-twenty-1-evento-y-condicion, A-11-1-twenty-2-datos-que-pasan-a-la-poliza, A-11-1-twenty-3-poliza-emitida, A-11-1-twenty-4-poliza-en-la-ficha-del-asegurado.

**Bitrix24** · **1** (cumple con reparo) · costo de implementación **2**

- *Cómo lo hace.* Una regla de automatización de la etapa «Cerrado Ganado» del embudo —«Crear un elemento CRM» de tipo negociación— crea la póliza con el nombre y el importe de la venta como variables del documento. El campo «Contacto» de la regla solo ofrece elegir contactos concretos, no una variable. Al marcar ganada la venta desde su ficha, la regla crea la negociación con el importe de la venta, sin el asegurado: se vincula a mano en cada venta.
- *Características.* La regla corre sola al llegar la negociación a la etapa; toma el título y el importe de la venta con variables del documento, sin volver a escribirlos, y la póliza queda en el listado de negociaciones.
- *Justificación.* La póliza se emite sola con el nombre y el importe de la venta, pero el asegurado no pasa: la regla no admite una variable en el campo del cliente y se vincula a mano en cada venta. La vinculación al asegurado es trabajo permanente en cada venta, además de definir la regla; la edición gratuita admite cinco reglas en total.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-11-1-bitrix24-1-regla-de-emision, A-11-1-bitrix24-2-listado-con-la-poliza, A-11-1-bitrix24-3-poliza-emitida.

### A.11.2 Plan de pago de la prima

**Qué resuelve.** Saber cómo paga cada asegurado y qué cuotas adeuda.

**EspoCRM** · **2** (cumple) · costo de implementación **1**

- *Cómo lo hace.* El producto no trae cuotas: se crea la entidad Cuota con el Administrador de Entidades, con importe, vencimiento y estado (pendiente o pagada) y una relación de muchas cuotas a una póliza, y se agrega a la póliza un campo de lista «Forma de pago». Desde la ficha de la póliza se elige la forma de pago y su panel de cuotas da de alta cada cuota con su vencimiento y su estado. El listado de cuotas, filtrado por estado pendiente, devuelve las impagas junto a su póliza.
- *Características.* Cada cuota es un registro con importe y moneda, vencimiento y estado, de modo que se filtra, se ordena por vencimiento y se llega desde ella a la póliza. La forma de pago es una lista de valores fijos. Las cuotas se cargan una por una o llegan del sistema central por la interfaz de programación: el producto no arma el cronograma a partir de la prima y la cantidad de cuotas, ni cambia solo el estado de una cuota vencida. Cuotas impagas devueltas: Cuota 3 de 3, Cuota 2 de 3.
- *Justificación.* Se resuelve configurando una vez, sin programar: la entidad, tres campos, la relación y su ubicación en las pantallas. Cada póliza nueva usa el mismo modelo, sin trabajo extra por póliza.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-11-2-espocrm-1-poliza-con-forma-de-pago-y-cuotas, A-11-2-espocrm-2-cuotas-impagas.

**Twenty** · **2** (cumple) · costo de implementación **1**

- *Cómo lo hace.* Twenty no trae cuotas: se crea un objeto propio «Cuotas» con vencimiento, importe y estado, ligado a la póliza, y a la póliza se le agrega un campo de lista «Forma de pago». Cada cuota se carga desde el listado de cuotas y queda en la ficha de la póliza. El listado de impagas es el listado de cuotas filtrado por el estado «Impaga», que trae las dos vencidas y ninguna de las otras.
- *Características.* Objeto propio con campos de fecha, moneda y lista; relación con la póliza que muestra las cuotas en su ficha; filtro por estado en el listado, sin desarrollo.
- *Justificación.* La forma de pago y las cuotas se registran y el listado de impagas sale con un filtro, en cada uso, sin trabajo extra. Definir el objeto de cuotas y sus campos es configuración que se hace una sola vez.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-11-2-twenty-1-forma-de-pago-y-cuotas-en-la-poliza, A-11-2-twenty-2-cuotas-impagas.

**Bitrix24** · **1** (cumple con reparo) · costo de implementación **2**

- *Cómo lo hace.* La póliza se lleva como una negociación con un campo de lista «Forma de pago». Sin entidades propias, cada cuota es una negociación con su vencimiento y su estado —pendiente, pagada o impaga— y el número de la póliza en el título. El listado de impagas es el listado de negociaciones filtrado por el estado de la cuota.
- *Características.* Campos propios de lista y de fecha en el formulario de la negociación, filtro por estado en el listado, sin programar.
- *Justificación.* El procedimiento pide registrar las cuotas de una póliza: se registran con vencimiento y estado y las impagas salen con un filtro, pero las cuotas no quedan vinculadas a la póliza, solo identificadas por su número en el título.
- *Comentario — con Bitrix24 Professional* (US$ 289 por mes, hasta 100 usuarios, abono recurrente) sería **2** (cumple, costo 1). El plan Professional trae procesos inteligentes: la cuota pasa a ser una entidad propia, con su listado, sus campos y su vínculo a la póliza, y el listado de impagas deja de mezclarse con las pólizas. Crear la entidad y sus campos es configuración de una vez.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-11-2-bitrix24-1-forma-de-pago-en-la-poliza, A-11-2-bitrix24-2-cuota, A-11-2-bitrix24-3-cuotas-impagas.

> «SPA (smart process automation)»
>
> — https://www.bitrix24.com/promo/professional/, consultado el 8 de noviembre de 2026

> «Professional desde US$ 289 desde US$ 199 incluye 100 usuarios Empezar Empezar»
>
> — https://www.bitrix24.es/prices/, consultado el 8 de noviembre de 2026

### A.11.3 Datos que administra el sistema central

**Qué resuelve.** Que lo que emite y cobra el sistema central llegue al CRM sin duplicarse ni ser modificado desde el CRM.

**EspoCRM** · **2** (cumple) · costo de implementación **1**

- *Cómo lo hace.* El sistema central usa un usuario de integración propio (Administración › Usuarios de API), con su clave y un rol con permiso de edición sobre la póliza. Busca la póliza por su número —una consulta con condición sobre el nombre— y la actualiza por el identificador que recibe: actualiza prima, estado de cobranza y vigencia, y si repite el envío sigue habiendo una sola póliza con ese número. Para los usuarios del CRM, un rol con seguridad por campo deja número, prima, estado de cobranza y vigencia en solo lectura: el operador, al abrir la edición de la póliza, ve los valores que mandó el central y el formulario solo ofrece editar los campos propios del CRM, como el ramo.
- *Características.* La seguridad por campo es del rol, de modo que el mismo campo se edita para el usuario de integración y se bloquea para el operador; el bloqueo se mantuvo también ante un intento de cambio del operador por la interfaz de programación. La actualización no es una operación única por clave: quien envía busca por número y decide, y un alta repetida del mismo número crea una segunda póliza, porque el producto no exige unicidad. La importación desde planilla sí ofrece «Crear y actualizar» con coincidencia por un campo, como el número. Pólizas con el número POL-A12-0003 tras dos actualizaciones: 1; tras un alta repetida: 2.
- *Justificación.* El central actualiza sin duplicar y el operador no puede modificar lo que el central administra. Configurar un usuario de integración, dos roles y marcar los campos en el rol se hace todo desde la administración y sin programar. Buscar antes de actualizar es parte del cliente de integración, como en cualquier interfaz que no ofrezca alta-o-actualización por clave.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-11-3-espocrm-1-rol-con-campos-de-solo-lectura, A-11-3-espocrm-2-edicion-del-operador.

> «By default, a User can read all fields if they can read the record. A User can edit any field if one can edit the record. You can restrict access to specific fields using the Field Level Security.»
>
> — https://docs.espocrm.com/administration/roles-management/, consultado el 30 de octubre de 2026

> «Create & Update − records will be created, if records with matching field values are found, they will be updated; you will be able to check what fields to match by on the Step 2.»
>
> — https://docs.espocrm.com/administration/import/, consultado el 30 de octubre de 2026

**Twenty** · **2** (cumple) · costo de implementación **1**

- *Cómo lo hace.* El sistema central trabaja por la interfaz de programación: busca la póliza por su número con una condición sobre el nombre y la actualiza por el identificador que recibe, de modo que actualizar estado de pago, prima y vigencia varias veces deja una sola póliza con ese número. Para el productor, una regla del rol sobre Pólizas deja en solo lectura número, prima, estado de pago y vigencia: esos campos no se abren a la edición, mientras que el ramo, que es del CRM, se edita con normalidad.
- *Características.* El permiso por campo es del rol —ver y editar por separado para cada campo de cada objeto—, así que el mismo dato lo escribe quien integra y el productor lo ve sin poder tocarlo. La actualización no es una operación única por clave: quien envía busca por número y decide, y un alta repetida con el mismo número, incluso pidiendo «upsert», crea una segunda póliza.
- *Justificación.* El central actualiza sin duplicar y el productor no puede modificar lo que el central administra, en cada uso y sin trabajo extra. Hace falta una regla en el rol del productor con cinco campos marcados, desde la pantalla de roles y sin programar; buscar antes de actualizar es parte del cliente de integración.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-11-3-twenty-1-rol-con-campos-de-solo-lectura, A-11-3-twenty-2-el-productor-no-puede-editar.

**Bitrix24** · **0** (no cumple)

- *Cómo lo hace.* En la edición gratuita el sistema central no tiene por dónde actualizar una póliza: en Recursos para desarrolladores se ofrece «Webhook entrante» y, al abrirlo, el sistema responde «No disponible en tu plan actual» y remite al plan Basic Vibe+.
- *Justificación.* Sin interfaz de programación habilitada no hay forma de actualizar desde afuera una póliza por su número, así que el primer tramo del procedimiento no se puede ejecutar. El comparativo del fabricante lo confirma: la API REST no figura en la edición gratuita.
- *Comentario — con Bitrix24 Basic Vibe+* (US$ 89 por mes, hasta 5 usuarios, abono recurrente) sería **1** (cumple con reparo, costo 2). Con el plan Basic en su edición Vibe+ la API REST no tiene tope y el sistema central puede buscar la póliza por su número y actualizarla sin duplicarla; ese cliente de integración lo desarrolla la compañía. La protección de los campos del central en el CRM no se evaluó en ese plan, por eso se computa con reparo.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-11-3-bitrix24-1-webhook-entrante.

> «REST API Available on Vibe+ plans.»
>
> — https://www.bitrix24.es/prices/compare_cloud_plans.php, consultado el 8 de noviembre de 2026

> «Basic Vibe+ desde US$ 89 desde US$ 59 incluye 5 usuarios Empezar Empezar»
>
> — https://www.bitrix24.es/prices/, consultado el 8 de noviembre de 2026

> «Aplicaciones de Market y REST API ilimitadas»
>
> — https://www.bitrix24.es/prices/, consultado el 8 de noviembre de 2026

### A.11.4 Continuidad del historial del solicitante al asegurado

**Qué resuelve.** Que lo hablado con el solicitante antes de la venta siga en la ficha cuando pasa a ser asegurado.

**EspoCRM** · **2** (cumple) · costo de implementación **0**

- *Cómo lo hace.* La llamada se registra desde el panel Historial de la ficha del solicitante. Al convertir al solicitante en asegurado, el sistema crea la ficha del asegurado, y la póliza se emite desde su formulario. La ficha del asegurado muestra, en su Historial, la llamada hecha antes de que fuera cliente, y en su panel de pólizas la póliza emitida.
- *Características.* El historial reúne llamadas, reuniones y correos en orden cronológico. La llamada es un único registro, que sigue ligado al solicitante y figura además entre los contactos del asegurado: no hay que copiar nada a mano. La ficha del solicitante queda marcada como convertida y conserva el vínculo con el asegurado creado.
- *Justificación.* Viene de fábrica: registrar la llamada, convertir y consultar el historial no requieren configurar nada. La póliza aparece en la ficha porque su relación con el titular ya está definida para el resto del catálogo (A.6.1).
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-11-4-espocrm-1-llamada-al-solicitante, A-11-4-espocrm-2-ficha-del-asegurado.

**Twenty** · **2** (cumple) · costo de implementación **1**

- *Cómo lo hace.* La llamada se registra como nota en la ficha de la persona que consulta. Al convertirla, la misma persona queda como contacto de una oportunidad que pasa a la etapa de venta ganada, y el flujo de emisión crea la póliza a su nombre. En la ficha del asegurado la llamada sigue estando, junto a la póliza.
- *Características.* Notas vinculadas a la persona; la misma persona pasa de solicitante a asegurado sin duplicarse; la ficha reúne notas, oportunidades y pólizas.
- *Justificación.* No hay una conversión que mueva o duplique datos: la persona es la misma desde la primera llamada y todo lo que se le registró queda en su ficha. La emisión depende del flujo configurado en A.11.1.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-11-4-twenty-1-ficha-del-asegurado, A-11-4-twenty-2-la-llamada-en-la-ficha.

**Bitrix24** · **2** (cumple) · costo de implementación **0**

- *Cómo lo hace.* El solicitante se registra como contacto y la llamada se anota en la pestaña «Actividad» de su ficha, como un pendiente de texto libre. Para emitirle la póliza se crea la negociación desde esa misma ficha, que queda a su nombre. En la ficha del asegurado la llamada sigue estando, junto a la póliza.
- *Características.* El mismo contacto es solicitante y asegurado, sin conversión que lo mueva ni lo duplique; su ficha reúne actividades y negociaciones.
- *Justificación.* El procedimiento pide que la llamada figure en la ficha del asegurado, y figura sin configurar nada. Que no haya una etapa de solicitante ni un tipo propio de llamada no impide seguir la historia.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-11-4-bitrix24-1-llamada-registrada, A-11-4-bitrix24-2-ficha-del-asegurado.

> «Todo lo incluido en Basic, más: Almacenamiento de 100 GB Prospectos ilimitados Facturas y cotizaciones Diseñador de formularios CRM Firma electrónica Marketing por WhatsApp Eficiencia de tareas (KPI) Proyectos ilimitados Tableros ilimitados»
>
> — https://www.bitrix24.es/prices/, consultado el 8 de noviembre de 2026

> «US$ 144»
>
> — https://www.bitrix24.es/prices/, consultado el 8 de noviembre de 2026

### A.11.5 Satisfacción después de la atención

**Qué resuelve.** Saber si el asegurado quedó conforme con la atención, que es lo que lo retiene.

**EspoCRM** · **2** (cumple) · costo de implementación **1**

- *Cómo lo hace.* El producto no trae encuestas: entre sus entidades no figura ninguna. Se agrega al reclamo un campo de lista «Satisfacción con la atención» con el Administrador de Campos y se lo ubica en el formulario y en el panel de reclamos de la ficha del asegurado. Al cerrar el reclamo se registra la respuesta del asegurado, y la ficha del asegurado muestra su reclamo cerrado con la satisfacción registrada.
- *Características.* La respuesta es un valor de una lista cerrada —muy satisfecho, satisfecho, insatisfecho—, de modo que se puede filtrar y contar por reclamo. Se registra a mano al cerrar: el producto no envía la encuesta ni recibe la respuesta por un formulario o un enlace. Reclamo cerrado con satisfacción «Muy satisfecho» visible en la ficha del asegurado.
- *Justificación.* El procedimiento pide enviar o registrar la encuesta y que la respuesta quede en la ficha del asegurado: se registra en un campo configurado una vez, sin programar, y queda en la ficha.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-11-5-espocrm-1-entidades-del-producto, A-11-5-espocrm-2-cierre-con-encuesta, A-11-5-espocrm-3-ficha-del-asegurado.

**Twenty** · **2** (cumple) · costo de implementación **1**

- *Cómo lo hace.* La encuesta es un objeto propio con puntaje, comentario y vínculos al asegurado y al reclamo. Al cerrar el reclamo desde su ficha, la respuesta que el asegurado dio por teléfono se registra desde su ficha como una encuesta nueva, ligada al reclamo, y queda listada en la ficha del asegurado.
- *Características.* Objeto propio con campo de lista para el puntaje, texto para el comentario y relaciones con persona y reclamo; la ficha del asegurado lista sus encuestas.
- *Justificación.* Cada respuesta se registra una vez y queda en la ficha del asegurado. No hay encuestas incorporadas ni envío automático al cerrar el reclamo; el objeto y sus campos se configuran una sola vez.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-11-5-twenty-1-encuesta-registrada, A-11-5-twenty-2-encuesta-en-la-ficha-del-asegurado.

**Bitrix24** · **2** (cumple) · costo de implementación **1**

- *Cómo lo hace.* El reclamo —una negociación— se cierra pasándolo a «Cerrado Ganado», y la respuesta del asegurado se registra en un campo de lista «Satisfacción con la atención», agregado a la ficha del contacto, donde queda guardada.
- *Características.* Campo de lista con cinco puntajes en el formulario del contacto, creado desde la propia pantalla, sin programar.
- *Justificación.* El procedimiento pide enviar o registrar la encuesta y que la respuesta quede en la ficha del asegurado: se registra en un campo configurado una vez, sin programar. Que cada respuesta reemplace a la anterior no lo exige el procedimiento.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-11-5-bitrix24-1-satisfaccion-en-la-ficha.

## A.12 Condiciones técnicas y operativas del producto

### A.12.1 Recursos que la compañía debe disponer para sostenerlo

**Qué resuelve.** Saber qué equipos e infraestructura hay que tener para que el sistema funcione.

**EspoCRM** · **1** (cumple con reparo)

- *Cómo lo hace.* No exige un servidor dedicado: corre en un equipo de escritorio común, con la imagen oficial de contenedores, con un consumo de memoria que ese equipo sostiene aun con una cartera cargada.
- *Características.* La edición gratuita se instala en infraestructura de la compañía: pide un servidor web, PHP y una base de datos. 471 MB de memoria entre la aplicación y su base de datos.
- *Justificación.* La condición se satisface con una limitación que la compañía asume de forma permanente: alguien tiene que mantener ese equipo encendido, respaldado y actualizado. El servicio en la nube del fabricante elimina esa carga.
- *Comentario — con EspoCRM Cloud Basic* (US$ 15 por usuario por mes, mínimo 3 usuarios, abono recurrente) sería **2** (cumple). En la nube del fabricante la compañía no dispone ninguna infraestructura propia.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-12-1-espocrm-3-requisitos-del-sistema.

> «Web server: NGINX, Apache, or IIS;»
>
> — https://www.espocrm.com/download/, consultado el 30 de octubre de 2026

> «Get EspoCRM running in minutes. The official Docker image sets up EspoCRM, NGINX, and MySQL automatically. No manual server configuration required.»
>
> — https://www.espocrm.com/download/, consultado el 30 de octubre de 2026

> «Basic $15.00 per user/month minimum 3 users 3GB file storage per user 100,000 records SSL Encryption (256 bit keys, TLS 1.3) Full feature set All extensions included External access API 2000+ integrations * 12x5 (hours/days) support Sign Up Free Trial Free Trial is provided for 30 days»
>
> — https://www.espocrm.com/cloud/, consultado el 30 de octubre de 2026

**Twenty** · **1** (cumple con reparo)

- *Cómo lo hace.* La edición gratuita se instala en infraestructura de la compañía, con cuatro contenedores: la aplicación, un proceso que ejecuta las tareas en segundo plano, la base de datos y una memoria intermedia. El servicio en la nube del fabricante elimina esa carga.
- *Características.* No exige un servidor dedicado: el fabricante pide al menos 2 GB de memoria, y la instalación evaluada corre en un equipo de escritorio común, donde ocupa 2421 MB con la cartera de prueba cargada. 2421 MB de memoria entre los cuatro contenedores.
- *Justificación.* La condición se satisface con una limitación que la compañía asume de forma permanente: alguien tiene que mantener ese equipo encendido, respaldado y actualizado.
- *Comentario — con Twenty Cloud Pro* (US$ 9 por usuario por mes, con pago anual, abono recurrente) sería **2** (cumple). En la nube del fabricante la compañía no dispone ninguna infraestructura propia.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-12-1-twenty-2-estado-del-servidor.

> «RAM: Ensure your environment has at least 2GB of RAM. Insufficient memory can cause processes to crash.»
>
> — https://docs.twenty.com/developers/self-host/capabilities/docker-compose, consultado el 30 de octubre de 2026

> «Cloud Pro is $9/user/month and Organization is $39/user/month, billed yearly. Organization adds 5x more AI usage per member, custom roles with field and row-level permissions, and SSO. Self-hosting the open source core is free.»
>
> — https://twenty.com/pricing, consultado el 30 de octubre de 2026

**Bitrix24** · **2** (cumple)

- *Cómo lo hace.* La edición evaluada es un servicio en la nube: se opera entera desde el navegador, sin ningún componente que la compañía instale, actualice o respalde.
- *Características.* El fabricante aloja los datos en su propia infraestructura —en Amazon Web Services— y sostiene los servidores, las copias y la disponibilidad.
- *Justificación.* La compañía no dispone ningún equipo propio para el sistema: solo necesita una conexión a internet y un navegador, que ya tiene para cualquier otra tarea.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-12-1-bitrix24-2-portal-en-el-navegador.

> «Bitrix24 uses Amazon Web Services to host your data in US (Virginia) or European Union (Frankfurt, Germany). You can purchase on premise editions of Bitrix24 to host it in your country or on your server. AWS also maintains the following certifications: HIPAA, GDPR, ISO 27001, SOC 1/2/3, Directive 95/46/EC and PCI DSS Level 1.»
>
> — https://www.bitrix24.com/security/, consultado el 29 de septiembre de 2026

### A.12.2 Compatibilidad con la plataforma que la compañía usa

**Qué resuelve.** No sumar una tecnología que la compañía no sabe administrar.

**EspoCRM** · **2** (cumple)

- *Cómo lo hace.* Corre sobre los tres servidores web más difundidos —NGINX, Apache e IIS— y sobre los tres motores de base de datos libres más usados —MySQL, MariaDB y PostgreSQL—, y el fabricante publica guías de instalación para Windows, macOS y Linux.
- *Características.* Cualquiera sea la plataforma que la compañía ya administra, alguna de esas combinaciones es la suya.
- *Justificación.* No la obliga a incorporar una tecnología nueva para sostenerlo.

> «Database: MySQL 8.0+, MariaDB 10.3+, or PostgreSQL 15.0+.»
>
> — https://www.espocrm.com/download/, consultado el 30 de octubre de 2026

> «Install on Windows»
>
> — https://www.espocrm.com/download/, consultado el 30 de octubre de 2026

**Twenty** · **1** (cumple con reparo)

- *Cómo lo hace.* La instalación propia corre sobre contenedores, que funcionan en Linux, en Windows y en macOS, pero con una sola combinación de tecnologías: PostgreSQL como base de datos —de la versión 15 en adelante— y Redis como memoria intermedia.
- *Características.* No hay variante para otro motor de base de datos.
- *Justificación.* Si la compañía ya administra contenedores y PostgreSQL, es su plataforma; si no, tiene que incorporar y sostener esas tecnologías para operar el sistema.
- *Comentario — con Twenty Cloud Pro* (US$ 9 por usuario por mes, con pago anual, abono recurrente) sería **2** (cumple). En la nube no hay plataforma que administrar: se usa desde el navegador.

> «Docker Compose»
>
> — https://docs.twenty.com/developers/self-host/capabilities/docker-compose, consultado el 30 de octubre de 2026

> «Twenty v2.34 requires PostgreSQL 15 or newer. The official Docker Compose configuration uses PostgreSQL 16. If your instance connects to an externally managed database, upgrade it before starting the v2.34 server.»
>
> — https://docs.twenty.com/developers/self-host/capabilities/upgrade-guide, consultado el 30 de octubre de 2026

> «Cloud Pro is $9/user/month and Organization is $39/user/month, billed yearly. Organization adds 5x more AI usage per member, custom roles with field and row-level permissions, and SSO. Self-hosting the open source core is free.»
>
> — https://twenty.com/pricing, consultado el 30 de octubre de 2026

**Bitrix24** · **2** (cumple)

- *Cómo lo hace.* Es un servicio en la nube que se abre con un navegador de uso común, en cualquier equipo con el que la compañía ya trabaje —Windows, macOS o Linux—.
- *Características.* La edición evaluada no corre sobre un sistema operativo ni un motor de base de datos que la compañía administre. Portal abierto con: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/153.0.8010.12 Safari/537.36.
- *Justificación.* No hay versión que instalar ni versión que elegir según la plataforma propia, porque no hay plataforma propia de por medio.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-12-2-bitrix24-2-portal-abierto.

> «To ensure Bitrix24 runs smoothly, always use the latest version of your browser—Chrome, Edge, Firefox, Safari, or any other browser that supports Green Baseline technologies.»
>
> — https://helpdesk.bitrix24.com/open/25860387/, consultado el 29 de septiembre de 2026

### A.12.3 Puesta en marcha sin perfil técnico especializado

**Qué resuelve.** Ponerlo en marcha sin contratar un perfil técnico que la compañía no tiene.

**EspoCRM** · **1** (cumple con reparo)

- *Cómo lo hace.* La instalación con la imagen oficial de contenedores lleva el sistema de cero a operativo. Pero no la completa alguien sin perfil técnico: hay que instalar el motor de contenedores, escribir el archivo que los describe y resolver cómo se conservan los datos entre reinicios, y montar la carpeta equivocada deja al sistema sin arrancar hasta corregirlo.
- *Características.* El fabricante ofrece una imagen oficial de contenedores que deja el sistema, el servidor web y la base de datos funcionando juntos, y un asistente que completa la configuración inicial.
- *Justificación.* Instalar con la imagen oficial exige conocimientos puntuales —el motor de contenedores, el archivo que los describe y la conservación de los datos—, guiados por la documentación, que la compañía necesita tener a mano cada vez que instala o reinstala.
- *Comentario — con EspoCRM Cloud Basic* (US$ 15 por usuario por mes, mínimo 3 usuarios, abono recurrente) sería **2** (cumple). En la nube el fabricante entrega el sistema funcionando: no hay nada que instalar.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-12-3-espocrm-3-operativo.

> «Get EspoCRM running in minutes. The official Docker image sets up EspoCRM, NGINX, and MySQL automatically. No manual server configuration required.»
>
> — https://www.espocrm.com/download/, consultado el 30 de octubre de 2026

> «4. Run EspoCRM installation wizard»
>
> — https://docs.espocrm.com/administration/installation/, consultado el 30 de octubre de 2026

**Twenty** · **1** (cumple con reparo)

- *Cómo lo hace.* La instalación se lleva de cero a operativa por esa vía, pero no la completa alguien sin perfil técnico: hay que instalar el motor de contenedores, completar las variables del archivo —claves, dirección pública— y, para usar funciones del producto, cambiar variables de configuración que vienen apagadas, como las que permiten conectar casillas de correo de la red propia y ejecutar el código de los flujos.
- *Características.* El fabricante ofrece un archivo de contenedores que deja la aplicación, las tareas en segundo plano, la base de datos y la memoria intermedia funcionando juntas, y el primer ingreso guía la creación del espacio de trabajo. Variables de configuración cambiadas: LOGIC_FUNCTION_TYPE, OUTBOUND_HTTP_SAFE_MODE_ENABLED.
- *Justificación.* Instalar con el archivo de contenedores exige conocimientos puntuales —el motor de contenedores, las variables del archivo y las variables de configuración apagadas—, guiados por la documentación, que la compañía necesita tener a mano cada vez que instala o actualiza.
- *Comentario — con Twenty Cloud Pro* (US$ 9 por usuario por mes, con pago anual, abono recurrente) sería **2** (cumple). En la nube el fabricante entrega el sistema funcionando: no hay nada que instalar ni configurar.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-12-3-twenty-2-variables-de-configuracion.

> «Set the Postgres Password Update the PG_DATABASE_PASSWORD value in the .env file with a strong password without special characters. The password is inserted unencoded into the Postgres connection URL, so characters such as @, /, # or % break the connection string. Generate one with: openssl rand -hex 32 PG_DATABASE_PASSWORD=my_strong_password»
>
> — https://docs.twenty.com/developers/self-host/capabilities/docker-compose, consultado el 30 de octubre de 2026

> «Cloud Pro is $9/user/month and Organization is $39/user/month, billed yearly. Organization adds 5x more AI usage per member, custom roles with field and row-level permissions, and SSO. Self-hosting the open source core is free.»
>
> — https://twenty.com/pricing, consultado el 30 de octubre de 2026

**Bitrix24** · **2** (cumple)

- *Cómo lo hace.* El alta del portal se completa con un correo y una contraseña, sin instalar nada ni preparar un servidor: el fabricante entrega el sistema funcionando de inmediato, con datos de ejemplo y un asistente inicial.
- *Características.* Lo que sigue —crear los campos propios, cargar la cartera— es configuración desde la pantalla, guiada por el propio producto, sin conocimientos de instalación ni de administración de servidores.
- *Justificación.* Lo completa cualquiera que sepa operar un sistema de oficina.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-12-3-bitrix24-2-portal-operativo.

> «¡Sí, lo es! El plan Free es un estado de cuenta predeterminado, en el que se puede agregar un número ilimitado de usuarios y disfrutar de las herramientas disponibles de forma totalmente gratuita durante el tiempo ilimitado. Tenga en cuenta que algunas herramientas como Telefonía y aplicaciones de Bitrix24 Market están disponibles solo en los planes pagos.»
>
> — https://www.bitrix24.es/prices/, consultado el 29 de septiembre de 2026

### A.12.4 Menú y navegabilidad para la operación diaria

**Qué resuelve.** Que el trabajo diario se haga sin vueltas ni pantallas de más.

**EspoCRM** · **2** (cumple)

- *Cómo lo hace.* Desde el ingreso, el menú lleva directo a asegurados, y de ahí al alta. Guardado el asegurado, la póliza se carga desde su propia ficha, en el panel de sus pólizas, sin salir de ella y ya ligada a él.
- *Características.* El recorrido completo pasó por cuatro pantallas sin volver sobre ninguna y llevó 28 segundos. 4 pantallas, ninguna revisitada, 28 s.
- *Justificación.* La póliza, que es una entidad creada por la compañía, figura en el menú dentro del grupo desplegable; el orden del menú se ajusta desde la administración.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-12-4-espocrm-1-asegurado-con-su-poliza.

**Twenty** · **2** (cumple)

- *Cómo lo hace.* Desde el ingreso, el menú lateral lleva directo a las personas, y el alta se hace en el mismo listado, escribiendo nombre y apellido en una fila nueva. Guardado el asegurado, la póliza se carga desde su propia ficha, en el campo de sus pólizas, escribiendo su número y agregándola: queda creada y ligada a él sin salir de la ficha.
- *Características.* El recorrido completo pasó por 2 pantallas sin volver sobre ninguna y llevó 49 segundos. 2 pantallas, ninguna revisitada, 49 s.
- *Justificación.* Los objetos propios, como la póliza, aparecen en el mismo menú lateral que los de fábrica.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-12-4-twenty-1-asegurado-con-su-poliza.

**Bitrix24** · **2** (cumple)

- *Cómo lo hace.* Desde el ingreso, el menú lateral lleva directo al CRM, sobre el listado de negociaciones.
- *Características.* —que en la edición gratuita, sin entidades propias, hace de cartera de pólizas—, y el botón «Crear» del propio listado abre el formulario de alta en el mismo lugar, sin cambiar de pantalla. 3 pantallas, 0 revisitadas, 69 s.
- *Justificación.* El alta se completa en pocas pantallas, sin volver sobre ninguna.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-12-4-bitrix24-1-formulario, A-12-4-bitrix24-2-poliza-creada.

### A.12.5 Aprendizaje sin capacitación previa

**Qué resuelve.** Que un empleado nuevo pueda usarlo sin un curso previo.

**Cifra de referencia: 5 tareas, 3 agentes.** Son las cinco operaciones que un productor repite a diario, y las hacen tres agentes independientes para que un recorrido individual no defina el resultado.

| 2 | 1 | 0 |
|---|---|---|
| Los tres completan las cinco tareas | Cada tarea la completa al menos uno, aunque no todos completan todas | Hay tareas que ninguno de los tres logra completar |

**EspoCRM** · **2** (cumple)

- *Cómo lo hace.* Las cinco operaciones que un productor repite a diario —dar de alta un asegurado, cargarle una póliza, averiguar qué pólizas de su cartera vencen en los próximos 30 días, registrar un reclamo y agendar un llamado— se resuelven desde la pantalla, sin instrucción ni conocimiento previo de la plataforma.
- *Características.* Completaron 15 de las quince, según lo que quedó guardado en el sistema. 15 de 15 tareas completadas.
- *Justificación.* Quien opera la pantalla sin instrucción previa completa las cinco tareas del productor.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-12-5-espocrm-p1-t1, A-12-5-espocrm-p1-t2, A-12-5-espocrm-p1-t3, A-12-5-espocrm-p1-t4, A-12-5-espocrm-p1-t5, A-12-5-espocrm-p2-t1, A-12-5-espocrm-p2-t2, A-12-5-espocrm-p2-t3, A-12-5-espocrm-p2-t4, A-12-5-espocrm-p2-t5, A-12-5-espocrm-p3-t1, A-12-5-espocrm-p3-t2, A-12-5-espocrm-p3-t3, A-12-5-espocrm-p3-t4, A-12-5-espocrm-p3-t5.

**Twenty** · **1** (cumple con reparo)

- *Cómo lo hace.* Sin instrucción previa, quien no conoce la plataforma opera la pantalla, como lo haría una persona, para resolver las cinco operaciones que un productor repite a diario —dar de alta un asegurado, cargarle una póliza, averiguar qué pólizas de su cartera vencen en los próximos 30 días, registrar un reclamo y agendar un llamado—.
- *Características.* Completaron 14 de las quince, según lo que quedó guardado en el sistema. La tarea 3 quedó sin completar para el agente 1 (respondió 18; la respuesta correcta es 3), que no supo decir qué le faltó. 14 de 15 tareas completadas.
- *Justificación.* Cada tarea la completa al menos uno de cada tres productores, aunque no todos completan todas: el sistema se deja aprender, con un tropiezo que la compañía asume en cada incorporación.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-12-5-twenty-p1-t1, A-12-5-twenty-p1-t2, A-12-5-twenty-p1-t3, A-12-5-twenty-p1-t4, A-12-5-twenty-p1-t5, A-12-5-twenty-p2-t1, A-12-5-twenty-p2-t2, A-12-5-twenty-p2-t3, A-12-5-twenty-p2-t4, A-12-5-twenty-p2-t5, A-12-5-twenty-p3-t1, A-12-5-twenty-p3-t2, A-12-5-twenty-p3-t3, A-12-5-twenty-p3-t4, A-12-5-twenty-p3-t5.

**Bitrix24** · **1** (cumple con reparo)

- *Cómo lo hace.* Las cinco operaciones que un productor repite a diario —dar de alta un asegurado, cargarle una póliza, averiguar qué pólizas de su cartera vencen en los próximos 30 días, registrar un reclamo y agendar un llamado— se operan desde la pantalla sin instrucción previa, con algún tropiezo en el aprendizaje.
- *Características.* Completaron 12 de las quince, según lo que quedó guardado en el sistema. La tarea 3 quedó sin completar para el agente 1 (respondió 10; la respuesta correcta es 3), que no supo decir qué le faltó; la tarea 4 quedó sin completar para el agente 3 (ningún registro del reclamo del asegurado (distinto de la póliza, que hable del choque)), que dijo que le faltó «No encontré dónde registrar un reclamo: no hay menú, pipeline ni tipo de actividad de reclamos en el CRM, ni en la ficha del contacto ni en la de la póliza.»; la tarea 5 quedó sin completar para el agente 3 (actividades o tareas guardadas, ninguna vinculada al asegurado para mañana a las 10 (2026-10-01 10:00)), que no supo decir qué le faltó. 12 de 15 tareas completadas.
- *Justificación.* Cada tarea la completó al menos uno de los tres, aunque no todos completaron todas: el sistema se deja aprender, con un tropiezo que la compañía asume en cada incorporación.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-12-5-bitrix24-p1-t1, A-12-5-bitrix24-p1-t2, A-12-5-bitrix24-p1-t3, A-12-5-bitrix24-p1-t4, A-12-5-bitrix24-p1-t5, A-12-5-bitrix24-p2-t1, A-12-5-bitrix24-p2-t2, A-12-5-bitrix24-p2-t3, A-12-5-bitrix24-p2-t4, A-12-5-bitrix24-p2-t5, A-12-5-bitrix24-p3-t1, A-12-5-bitrix24-p3-t2, A-12-5-bitrix24-p3-t3, A-12-5-bitrix24-p3-t4, A-12-5-bitrix24-p3-t5.

### A.12.6 Localización completa al español, modelo incluido

**Qué resuelve.** Que todo el personal entienda cada pantalla y cada dato.

**EspoCRM** · **2** (cumple)

- *Cómo lo hace.* El menú principal y la ficha del asegurado se presentan en español, con los campos del modelo y los que agrega la compañía.
- *Características.* El menú principal y la ficha del asegurado están en español, incluidos los campos del modelo y los que agregó la compañía. Queda en inglés la palabra "Ticket" para el caso de atención, que se entiende pero no es la que usa una aseguradora, y algunas traducciones son literales —"Posibles clientes", "Historia" para el registro de actividad—. Fuera del recorrido pedido, en los filtros de fecha la opción que significa "con algún valor" quedó traducida como "Nunca", que dice lo contrario. Palabras en inglés en el recorrido: tickets, ticket.
- *Justificación.* Lo que queda fuera de lugar se corrige desde Administración › Etiquetas, que permite cambiar cada texto de la interfaz: es configuración, y después todo el personal ve la pantalla en su idioma.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-12-6-espocrm-1-menu, A-12-6-espocrm-2-ficha, A-12-6-espocrm-3-gestor-de-etiquetas, A-12-6-espocrm-3-gestor-de-etiquetas-nunca.

**Twenty** · **2** (cumple)

- *Cómo lo hace.* Con el idioma de la interfaz en español, los menús de configuración, los botones y los mensajes están traducidos, pero los objetos y campos que trae el producto quedan con su nombre en inglés: en el menú y en la ficha del asegurado se leen Fields, General, Emails, Phones, Work, Company, Job Title, Social, entre otros.
- *Características.* Lo que agregó la compañía, como la póliza y sus campos, queda con el nombre que ella le puso. Nombres en inglés en el recorrido: Fields, General, Emails, Phones, Work, Company, Job Title, Social, Linkedin, System, Creation date, Created by.
- *Justificación.* Son nombres que igual se entienden, como personas, correos, teléfonos, empresa y cargo, y cada objeto y cada campo de fábrica admite cambiar su nombre desde Configuración › Modelo de datos: es configuración, y después todo el personal ve la pantalla en su idioma.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-12-6-twenty-1-idioma-elegido, A-12-6-twenty-2-ficha, A-12-6-twenty-3-renombrar-objeto, A-12-6-twenty-4-renombrar-campo.

**Bitrix24** · **2** (cumple)

- *Cómo lo hace.* Con el portal configurado en español, el menú principal y la ficha del contacto se muestran en ese idioma.
- *Características.* El menú principal y la ficha del contacto están enteramente en español, incluidos los objetos que trae el producto de fábrica. Menú: Bitrix, Messenger, CoPilot, Feed, Calendario, Documentos, Tableros, Drive, Webmail, Proyectos, Tareas, CRM, Reserva, Gestión del inventario, Marketing, Sitios web y tiendas, Firma electrónica para RR.HH., Firma electrónica, BI Builder, Empleados, Automatización, Market, Recursos para desarrolladores, Base de conocimientos 2., Suscripción · en inglés: ninguno.
- *Justificación.* Todo lo que el personal ve en la operación diaria está en su idioma, sin nada que corregir.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-12-6-bitrix24-1-menu-principal, A-12-6-bitrix24-2-listado-de-negociaciones.

### A.12.7 Cantidad de usuarios sin límite que condicione la operación

**Qué resuelve.** Que todo el plantel pueda usarlo sin quedar afuera por un tope de usuarios.

**EspoCRM** · **2** (cumple)

- *Cómo lo hace.* La edición evaluada se distribuye bajo una licencia libre que no limita la cantidad de usuarios, y la instalación no impone ningún tope: se dan de alta los que la compañía necesite, sea cual fuere su plantel de productores y de personal administrativo.
- *Características.* El único límite es la capacidad del servidor donde corre.
- *Justificación.* Los topes que publica el fabricante corresponden a los planes de la nube, que se cobran por usuario.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-12-7-espocrm-2-usuarios.

> «EspoCRM is an open-source project licensed under GNU AGPLv3.»
>
> — https://github.com/espocrm/espocrm, consultado el 30 de octubre de 2026

**Twenty** · **2** (cumple)

- *Cómo lo hace.* La edición autoalojada es gratuita y se distribuye bajo una licencia libre que no limita la cantidad de usuarios, y la instalación no impone ningún tope: se invitan los que la compañía necesite, sea cual fuere su plantel de productores y de personal administrativo.
- *Características.* En la nube se paga por usuario, sin tope de cantidad.
- *Justificación.* El único límite es la capacidad del servidor donde corre.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-12-7-twenty-3-usuarios.

> «The #1 Open-Source CRM»
>
> — https://github.com/twentyhq/twenty, consultado el 30 de octubre de 2026

> «Host Twenty on your own infrastructure at no cost:»
>
> — https://docs.twenty.com/user-guide/billing/capabilities/pricing-plans, consultado el 30 de octubre de 2026

**Bitrix24** · **2** (cumple)

- *Cómo lo hace.* El fabricante publica en su oferta cuántos usuarios admite la edición gratuita.
- *Características.* El fabricante publica que la edición gratuita admite un número ilimitado de usuarios, sin costo.
- *Justificación.* La compañía puede dar de alta a todo su plantel de productores y personal administrativo sin que la cantidad de usuarios sea una condición que limite la operación.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-12-7-bitrix24-2-portal.

> «¡Sí, lo es! El plan Free es un estado de cuenta predeterminado, en el que se puede agregar un número ilimitado de usuarios y disfrutar de las herramientas disponibles de forma totalmente gratuita durante el tiempo ilimitado. Tenga en cuenta que algunas herramientas como Telefonía y aplicaciones de Bitrix24 Market están disponibles solo en los planes pagos.»
>
> — https://www.bitrix24.es/prices/, consultado el 29 de septiembre de 2026

### A.12.8 Operación concurrente sobre la misma cartera

**Qué resuelve.** Que varios usuarios trabajen a la vez sobre la misma cartera sin pisarse.

**EspoCRM** · **2** (cumple)

- *Cómo lo hace.* La entidad creada por la compañía no advierte por sí sola el conflicto cuando varios usuarios abren a la vez la misma póliza: el último guardado se impone y los cambios anteriores se pierden sin aviso. Con el control de concurrencia activado en la entidad, quien guarda después de otro recibe el aviso de que otro usuario modificó el registro, y nadie pisa el trabajo ajeno sin saberlo.
- *Características.* El producto trae un control de concurrencia que las entidades de atención, ventas y cuentas tienen activado de fábrica, y que en las entidades propias se activa con una casilla de su configuración. Sin control: quedó «cambio de la sesión 3» sin aviso · con control: 2 avisos.
- *Justificación.* La condición se satisface, con la precaución de activar el control en cada entidad propia.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-12-8-espocrm-pol-concurrencia-sin-control, A-12-8-espocrm-pol-concurrencia-con-control.

**Twenty** · **1** (cumple con reparo)

- *Cómo lo hace.* Varias sesiones pueden abrir a la vez la misma póliza y cambiar su ramo, desde la ficha; las demás sesiones reciben el cambio en la pantalla sin recargar.
- *Características.* Una detrás de otra, las tres sesiones vieron el cambio anterior antes de hacer el suyo y quedó el último, Salud. Con las tres sesiones eligiendo un valor distinto del mismo campo (Automotor, Hogar, Vida) con 729 ms entre el primero y el último guardado, quedó «Automotor» (orden de guardado: Vida, Hogar, Automotor) y ninguna sesión recibió aviso de que otra había modificado el campo. Secuencial: Salud, actualización en vivo: no · simultáneo (729 ms): Automotor, avisos: ninguno.
- *Justificación.* La actualización en vivo evita pisar trabajo ajeno cuando la pantalla alcanza a refrescarse, pero no protege el caso en que dos personas guardan el mismo campo con el valor anterior aún en pantalla: el sistema acepta ambos guardados sin advertir y el último reemplaza al otro. La condición se satisface con esa limitación.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-12-8-twenty-1-primera-sesion-despues, A-12-8-twenty-2-edicion-simultanea.

**Bitrix24** · **0** (no cumple)

- *Cómo lo hace.* Tres usuarios con su propia sesión abren a la vez la misma negociación desde el listado del CRM, la editan desde el formulario y guardan uno detrás de otro.
- *Características.* Quedó el último cambio, «DOC-CONCURRENCIA-CTOLEDO». Ningún usuario recibió aviso de que otro había modificado el registro. Título final: DOC-CONCURRENCIA-CTOLEDO · aviso de conflicto: no.
- *Justificación.* Cada guardado reemplaza al anterior sin advertencia, aunque el formulario se haya abierto antes del cambio de otro usuario. Como la edición gratuita tampoco guarda quién cambió cada dato, los cambios de los demás se pierden sin aviso ni constancia: cuando dos personas trabajan la misma negociación, gana la última que guarda.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-12-8-bitrix24-1-primera-sesion-tras-los-tres-cambios.

### A.12.9 Ecosistema de integraciones disponible

**Qué resuelve.** Conectarlo con otras herramientas sin desarrollar cada conexión.

**EspoCRM** · **1** (cumple con reparo)

- *Cómo lo hace.* La condición se satisface: los conectores que la compañía necesita existen y se consiguen directo del fabricante.
- *Características.* El catálogo oficial es corto y concentrado en lo que una oficina usa: correo de Outlook y de Google, telefonía, videollamadas, cobros y campañas por correo, más una interfaz de programación y ganchos para conectar lo que falte. Casi todos los conectores se venden aparte, con licencia anual que hay que renovar para seguir usándolos.
- *Justificación.* La limitación es que cada conector suma una licencia renovable, y que fuera del catálogo la integración pasa a ser trabajo propio sobre la interfaz de programación.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-12-9-espocrm-3-integraciones-incluidas.

> «Outlook Integration»
>
> — https://www.espocrm.com/extensions/, consultado el 30 de octubre de 2026

> «1.1 Subject to your continuous compliance with the Agreement and payment of the applicable license fees, EspoCRM grants you a non-exclusive, non-transferable, worldwide, limited right to use the Software on a single EspoCRM Application instance on a single server for the Licensed Period. After the license period expires, you must renew or purchase a new license to continue using the Software. You may use or modify the Software only for your own internal business purposes or for non-commercial or personal use.»
>
> — https://www.espocrm.com/extension-license-agreement/, consultado el 30 de octubre de 2026

**Twenty** · **1** (cumple con reparo)

- *Cómo lo hace.* Lo que sí trae es la vía para integrar lo que falte —interfaces de programación, avisos a otros sistemas ante cada cambio y un servidor para asistentes de inteligencia artificial—, todo sin costo.
- *Características.* El producto se conecta de fábrica con el correo y el calendario de Google y de Microsoft, y con cualquier casilla por IMAP. Más allá de eso no hay un catálogo de conectores: la sección de aplicaciones ofrece muy pocas, y las aplicaciones son paquetes de código que se desarrollan con el kit del fabricante.
- *Justificación.* La condición se satisface con una limitación: fuera del correo y el calendario, cada integración es trabajo propio.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-12-9-twenty-1-aplicaciones, A-12-9-twenty-2-mcp-y-api.

> «How Twenty apps work — entity model, sandboxing, and the install lifecycle.»
>
> — https://docs.twenty.com/developers/extend/apps/getting-started/concepts, consultado el 30 de octubre de 2026

> «Get notified when records change — HTTP POST to your endpoint on every create, update, or delete.»
>
> — https://docs.twenty.com/developers/extend/webhooks, consultado el 30 de octubre de 2026

**Bitrix24** · **1** (cumple con reparo)

- *Cómo lo hace.* El catálogo se puede evaluar sin costo, pero usarlo exige pagar, incluso para un conector puntual.
- *Características.* El fabricante publica un catálogo de más de 810 aplicaciones e integraciones —telefonía, firma electrónica, mensajería, conectores con otros sistemas—, accesible desde Market en el propio portal.
- *Justificación.* La instalación de aplicaciones del catálogo es una función de los planes pagos, según la misma página que anuncia la edición gratuita; por eso el catálogo se puede evaluar sin costo, pero usarlo exige pagar.
- *Comentario — con Bitrix24 Basic* (US$ 69 por mes, hasta 5 usuarios, abono recurrente) sería **2** (cumple). Con el plan de entrada, la instalación de aplicaciones del catálogo queda habilitada.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-12-9-bitrix24-3-portal.

> «Ver más de 810+ aplicaciones e integraciones»
>
> — https://www.bitrix24.es/apps/, consultado el 29 de septiembre de 2026

> «¡Sí, lo es! El plan Free es un estado de cuenta predeterminado, en el que se puede agregar un número ilimitado de usuarios y disfrutar de las herramientas disponibles de forma totalmente gratuita durante el tiempo ilimitado. Tenga en cuenta que algunas herramientas como Telefonía y aplicaciones de Bitrix24 Market están disponibles solo en los planes pagos.»
>
> — https://www.bitrix24.es/prices/, consultado el 29 de septiembre de 2026

> «Basic Ideal para emprendedores individuales y equipos pequeños que están empezando US$ 69 US$ 69 US$ 49 / compañía / mes / facturado mensualmente / compañía / mes / facturación anual Un pago de US$ 588 / año Ahorra US$ 240 al año incluye 5 usuarios Comprar Comprar Todo lo incluido en Free, más: Almacenamiento de 24 GB IA para el trabajo diario en Bitrix24 Embudos de ventas Negociaciones recurrentes Pagos en línea Integración de correo electrónico Integración de WhatsApp Integración de telefonía»
>
> — https://www.bitrix24.es/prices/, consultado el 29 de septiembre de 2026

### A.12.10 Documentación en español

**Qué resuelve.** Resolver dudas de uso con material en el idioma de la compañía.

**EspoCRM** · **1** (cumple con reparo)

- *Cómo lo hace.* Quien la consulte lo hace en inglés o con traducción automática del navegador, que es un procedimiento que se repite en cada consulta y que en la terminología técnica puede inducir a error.
- *Características.* La interfaz del sistema está en español, pero la documentación oficial está publicada solo en inglés: el sitio de documentación no ofrece selector de idioma ni versión en español.
- *Justificación.* La documentación oficial está solo en inglés: se consulta con traducción automática, un paso que se repite en cada consulta y que puede confundir la terminología técnica.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-12-10-espocrm-2-portada-de-la-documentacion.

> «It's recommended to upgrade whenever the new version is out. If you skip a few minor or major versions before deciding to upgrade, it's more likely that the upgrade will run unsmoothly. For minor or major releases it may be reasonable to wait for a few days before upgrading, as a very fresh release is likely to have yet undiscovered bugs.»
>
> — https://docs.espocrm.com/administration/upgrading/, consultado el 30 de octubre de 2026

**Twenty** · **2** (cumple)

- *Cómo lo hace.* La documentación oficial se publica también en español.
- *Características.* La guía de usuario y las páginas de configuración tienen su versión traducida, con el mismo contenido y la misma estructura que la original en inglés.
- *Justificación.* Quien consulte cómo se usa o se configura el sistema lo hace en su idioma.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas A-12-10-twenty-2-guia-de-usuario-en-espanol.

> «Controla el acceso a objetos, campos y ajustes con permisos basados en roles.»
>
> — https://docs.twenty.com/es/user-guide/permissions-access/capabilities/permissions, consultado el 30 de octubre de 2026

**Bitrix24** · **2** (cumple)

- *Cómo lo hace.* El fabricante publica su centro de documentación completo en español, en un dominio propio.
- *Características.* —helpdesk.bitrix24.es—, con el mismo contenido y la misma organización por tema que la versión en inglés.
- *Justificación.* Quien consulta cómo se usa o se configura el sistema lo hace en su idioma, sin depender de una traducción de terceros.

> «Todos los cursos de formación y documentación»
>
> — https://helpdesk.bitrix24.es/documentation.php, consultado el 30 de octubre de 2026

### A.12.11 Material de capacitación para el usuario final

**Qué resuelve.** Capacitar a quienes operan el sistema con material del propio fabricante.

**EspoCRM** · **2** (cumple)

- *Cómo lo hace.* El fabricante publica una colección de videos de acceso libre que incluye material para quien opera el sistema y no solo para quien lo administra.
- *Características.* Cuentas, contactos, prospectos, seguimiento de oportunidades, calendario y actividades, importación y exportación de datos, impresión y reportes.
- *Justificación.* Cubre las operaciones que un productor o un administrativo repiten a diario.

> «Opportunity Tracking»
>
> — https://www.espocrm.com/video/, consultado el 30 de octubre de 2026

> «Calendar and Activities»
>
> — https://www.espocrm.com/video/, consultado el 30 de octubre de 2026

**Twenty** · **2** (cumple)

- *Cómo lo hace.* El fabricante publica una guía de usuario de acceso libre, separada de la documentación para desarrolladores, con más de cien páginas.
- *Características.* Qué hace cada función y guías paso a paso para las tareas de todos los días —importar contactos, trabajar el correo y el calendario, armar vistas, tableros y flujos—.
- *Justificación.* Está dirigida a quien opera el sistema, y está también en español.

> «Complete step-by-step guide to importing people/contacts into Twenty.»
>
> — https://docs.twenty.com/user-guide/data-migration/how-tos/import-contacts-via-csv, consultado el 30 de octubre de 2026

> «Contact Auto-Creation»
>
> — https://docs.twenty.com/user-guide/calendar-emails/overview, consultado el 30 de octubre de 2026

**Bitrix24** · **2** (cumple)

- *Cómo lo hace.* El fabricante reúne en un mismo centro los cursos y la documentación de uso diario.
- *Características.* —CRM, tareas, mensajería, calendario—, con artículos paso a paso y videos, separados de la documentación de la interfaz de programación.
- *Justificación.* El centro de cursos y documentación de uso diario está dirigido a quien opera el sistema todos los días, no solo a quien lo administra, y está publicado en español.

> «Todos los cursos de formación y documentación»
>
> — https://helpdesk.bitrix24.es/documentation.php, consultado el 30 de octubre de 2026

> «Bitrix24 Helpdesk»
>
> — https://helpdesk.bitrix24.es/open/20616588/, consultado el 30 de octubre de 2026

### A.12.12 Comunidad activa de usuarios

**Qué resuelve.** Tener a quién consultar cuando algo no sale.

**Cifra de referencia: una semana de espera.** Una consulta de configuración no puede detener la operación más de un ciclo semanal de trabajo. Las 21 consultas más recientes del canal público de la comunidad se clasifican con la tabla y se ordenan de la mejor atendida a la peor. El criterio toma el valor de la que queda en el medio, que refleja la experiencia típica.

| 2 | 1 | 0 |
|---|---|---|
| Llega una respuesta que resuelve la consulta dentro de la semana | Llega después de la semana, o antes pero sin resolver | No llega respuesta |

**EspoCRM** · **1** (cumple con reparo)

- *Cómo lo hace.* La comunidad responde en la sección de uso general del foro oficial, donde los usuarios publican sus consultas y otros usuarios las contestan.
- *Características.* En 7 otro usuario respondió dentro de la semana y quien consultó confirmó después que la respuesta le había servido; en 13 hubo respuesta, pero llegó más tarde o sin que el autor confirmara que lo resolvía; 1 no recibieron respuesta. La primera respuesta llegó, en el caso típico, a las 2 horas. 7 resueltas en la semana · 13 con respuesta tardía o sin confirmar · 1 sin respuesta · primera respuesta típica a las 2 horas.
- *Justificación.* La consulta típica recibe respuesta, pero no queda constancia de que se resuelva dentro de la semana: la compañía puede contar con que alguien conteste, no con que la conteste a tiempo y a su medida.

> «Hi, While you are still on a not updated PHP, I'd suggest either shutting it down or applying mitigations described here https://www.php.net/archive/2026.php. Docker images are being built. The official Dockerhub not yet updated. Hope they will do it soon.»
>
> — https://forum.espocrm.com/forum/general/128297-cve-2026-109618-cve-2026-109619, consultado el 30 de octubre de 2026

> «Maybe some non-numeric value is set? E.g. empty string instead of null? Does it resolve if you set some field value, the save, then set it empty back and save.»
>
> — https://forum.espocrm.com/forum/general/128278-10-0-10-most-likely-problem-is-active-since-10-0-8-empty-float-error-on-save, consultado el 30 de octubre de 2026

> «Hello David.D. have you tried shared calendars? Activities & calendar - EspoCRM Documentation»
>
> — https://forum.espocrm.com/forum/general/128265-calendar-problem, consultado el 30 de octubre de 2026

> «If it's the 'required' validation (mandatory field), one needs to add the Default Value for this field when importing.»
>
> — https://forum.espocrm.com/forum/general/128257-import-error-what-does-the-exclamation-field-mean, consultado el 30 de octubre de 2026

> «Could you provide an example? A screenshot?»
>
> — https://forum.espocrm.com/forum/general/128242-need-help, consultado el 30 de octubre de 2026

> «Hello. EspoCRM does not currently provide an official, built-in integration with SonarQube. However, SonarQube can still be used to perform SAST on an EspoCRM-based application, since EspoCRM is a PHP application with a JavaScript frontend and SonarQube supports static analysis for both languages.»
>
> — https://forum.espocrm.com/forum/general/128219-does-espocrm-support-sast-scanning-with-sonarqube, consultado el 30 de octubre de 2026

> «A similar topic has already been discussed here: https://forum.espocrm.com/forum/gene...name-from-mail.»
>
> — https://forum.espocrm.com/forum/general/128212-help-with-the-from-name-of-a-personal-email-account-please, consultado el 30 de octubre de 2026

> «It's old functionality: https://docs.espocrm.com/user-guide/...dar/#reminders. Here are some important points regarding the use of Reminders: 1. A user, an Assigned User, or an Attendee must be specified. That user's profile must contain a valid email address (since you are asking specifically…»
>
> — https://forum.espocrm.com/forum/general/128200-reminder-for-meetings, consultado el 30 de octubre de 2026

> «Hello, there are multiple approaches. The easiest one is to use roles and teams, which are already in the system. You can set permissions to the e-mails for whole teams. Alternative is to create custom ACL in code and set own approach based on your needs.»
>
> — https://forum.espocrm.com/forum/general/128196-best-practice-for-team-access-to-personal-inboxes, consultado el 30 de octubre de 2026

> «Hi everyone, I’d like to introduce DOT Calendar Feed, an extension we built for a recurring need in our EspoCRM projects: seeing selected CRM events in the calendar app you already use, without manual exports or a custom calendar script. How it works • An administrator enables the relevant event…»
>
> — https://forum.espocrm.com/forum/general/128175-dot-calendar-feed-%E2%80%94-personal-ics-subscriptions-for-espocrm-9-10, consultado el 30 de octubre de 2026

> «{{barcodeImage qrcode type='QRcode' height=25 width=25}} I use it this way and you can put it anywhere in the templat, using it like an image. Which PDF engine do you use and what exactliy do you want to achieve?»
>
> — https://forum.espocrm.com/forum/general/128161-qr-code-in-pdf-formular, consultado el 30 de octubre de 2026

> «Account and Contact have the Company and Person types, respectively. It makes more sense to create entities with precisely these types, rather than Base Plus.»
>
> — https://forum.espocrm.com/forum/general/128127-selection-of-email-recipients-when-creating-email-in-activities-panel, consultado el 30 de octubre de 2026

> «The topic name should mention "formula script"? E.g. "Better log reporting for Formula Script errors". The current error log reporting is fine. It prints file and line number, as well as trace. Absolutely no problem to track down where an error occurred, if it's a PHP-level error. You might deal…»
>
> — https://forum.espocrm.com/forum/general/128099-better-error-reporting-for-formula-script-errors, consultado el 30 de octubre de 2026

> «- Enable Debug mode: https://docs.espocrm.com/administrat...ng/#debug-mode. - Reproduce the error. - Provide part of the log with this error. EspoCRM log files are located in {ESPO_ROOT}/data/logs/ directory. Most errors are logger there. Also, please let me know if the error occurs when you add…»
>
> — https://forum.espocrm.com/forum/general/128059-internal-server-error, consultado el 30 de octubre de 2026

> «If you only want the Array values to appear on separate lines instead of being comma-separated, EspoCRM already supports this natively. Go to: Administration > Entity Manager > [Your Entity] > Fields > [Your Array Field] Enable “Display as List” and save the field. Each Array item should then be…»
>
> — https://forum.espocrm.com/forum/general/128039-type-array-list, consultado el 30 de octubre de 2026

> «How many such contacts do you have? Are we likely talking about a main account with subsidiary accounts? - If there are few of them, you could enter the primary address in the main address field and use custom text fields within the same account for the other addresses. - If there are many, it…»
>
> — https://forum.espocrm.com/forum/general/128032-multiple-addresses-for-one-contact, consultado el 30 de octubre de 2026

> «Without modifying the code, you can: - completely remove the Billing Address from the layout; - change the display order of the country, street, etc., under Administration > Settings > Address Format; - if you need to "remove" the State from the address field, simply leave it blank.»
>
> — https://forum.espocrm.com/forum/general/128009-change-billing-address-field, consultado el 30 de octubre de 2026

> «This topic has been discussed at least twice on this forum. You can find the solution to the current problem at this link: https://forum.espocrm.com/forum/gene...152#post117152. Although it refers to the Opportunity entity, the process is exactly the same for the Lead entity.»
>
> — https://forum.espocrm.com/forum/general/128002-activities-history-tasks-disappeared-from-lead-side-panel, consultado el 30 de octubre de 2026

> «Create an entity with Person type, and those fields will be there by default.»
>
> — https://forum.espocrm.com/forum/general/127998-create-a-field-like-person-name, consultado el 30 de octubre de 2026

> «Have you tried the layout for the entity documents? Look for Liste and Liste (klein)»
>
> — https://forum.espocrm.com/forum/general/127989-name-of-documents-not-shown-in-accounts-and-opportunities, consultado el 30 de octubre de 2026

> «For a reason. Because the inline edit will break field dependency logic.»
>
> — https://forum.espocrm.com/forum/general/127958-why-no-inline-edit-to-change-the-pipeline, consultado el 30 de octubre de 2026

**Twenty** · **1** (cumple con reparo)

- *Cómo lo hace.* El canal de la comunidad que ofrece el fabricante es un servidor de chat que solo se lee con cuenta; lo que la comunidad publica abierto son las discusiones del repositorio oficial.
- *Características.* En 2 otro usuario respondió dentro de la semana y quien consultó confirmó después que la respuesta le había servido; en 17 hubo respuesta, pero llegó más tarde o sin que el autor confirmara que lo resolvía; 2 no recibieron respuesta. La primera respuesta llegó, en el caso típico, a las 24 horas. 2 resueltas en la semana · 17 con respuesta tardía o sin confirmar · 2 sin respuesta · primera respuesta típica a las 24 horas.
- *Justificación.* La consulta típica recibe respuesta, pero no queda constancia de que se resuelva dentro de la semana: la compañía puede contar con que alguien conteste, no con que la conteste a tiempo y a su medida.

> «Community support via Discord»
>
> — https://docs.twenty.com/user-guide/billing/capabilities/pricing-plans, consultado el 30 de octubre de 2026

> «Is there an approach for whitelisting our customers that use @gmail addresses without just enabling non-professional emails for all email sync?»
>
> — https://github.com/twentyhq/twenty/discussions/28492, consultado el 30 de octubre de 2026

> «Given the fact that we currently allow only for depth=1 due to performance issues in the past with depth=2, I don't think it'll be implemented #12108 If you want to fetch data about object 4 relations away, I'd suggest starting from middle objects first»
>
> — https://github.com/twentyhq/twenty/discussions/28243, consultado el 30 de octubre de 2026

> «Twenty doesn't have official mobile app»
>
> — https://github.com/twentyhq/twenty/discussions/28048, consultado el 30 de octubre de 2026

> «The best workaround is to remove the access to Companies object in API key, this way you won't see it at all in API, alternatively rename the object and fields accordingly to your needs»
>
> — https://github.com/twentyhq/twenty/discussions/27674, consultado el 30 de octubre de 2026

> «That's expected as each workspace must have an live human admin managing such permissions»
>
> — https://github.com/twentyhq/twenty/discussions/27672, consultado el 30 de octubre de 2026

> «@neo773»
>
> — https://github.com/twentyhq/twenty/discussions/26733, consultado el 30 de octubre de 2026

> «Thank you for such detailed report! CC: @prastoin»
>
> — https://github.com/twentyhq/twenty/discussions/25802, consultado el 30 de octubre de 2026

> «@neo773»
>
> — https://github.com/twentyhq/twenty/discussions/25319, consultado el 30 de octubre de 2026

> «Issue has been created based on this discussion #25193»
>
> — https://github.com/twentyhq/twenty/discussions/25185, consultado el 30 de octubre de 2026

> «@Weiko this is about override. Solutions: add a defineDefaultTabToFocusOnMobileAndSidePanelUniversalIdentifier boolean key in definePageLayoutTab definePageLayoutOverride that just update the defaultTabToFocusOnMobileAndSidePanelUniversalIdentifier of the existing standard tab What do you think?»
>
> — https://github.com/twentyhq/twenty/discussions/23388, consultado el 30 de octubre de 2026

> «This feature is implemented in Pipedrive and is very useful Dont forget to set the default email account used for sending email»
>
> — https://github.com/twentyhq/twenty/discussions/23368, consultado el 30 de octubre de 2026

> «The contents of this feature request applies to both select and multi select field types. Scope & Context Consider these two scenarios: I want to add a tags fields to Persons as multi select field. I want my users to freely create new options so that they can use them to filter views. However, I do…»
>
> — https://github.com/twentyhq/twenty/discussions/23345, consultado el 30 de octubre de 2026

> «@hubyhuby if this record is soft-deleted, it's still counted when checking for uniqueness as it can be restored»
>
> — https://github.com/twentyhq/twenty/discussions/22954, consultado el 30 de octubre de 2026

> «@martmull or @bosiraphael»
>
> — https://github.com/twentyhq/twenty/discussions/22382, consultado el 30 de octubre de 2026

> «@hubyhuby yes, you need to add a relation to Workspace members, however, limiting access to only notes you own (called row level security) is behind an Organization license»
>
> — https://github.com/twentyhq/twenty/discussions/22298, consultado el 30 de octubre de 2026

> «Hi @adamleigh87-gif, could you please reach out to us via Discord if you're self-hosted or via support chat if you're using cloud?»
>
> — https://github.com/twentyhq/twenty/discussions/20559, consultado el 30 de octubre de 2026

> «@chrcha26 what are exact steps to reproduce this issue? There is no IS operand on front that user can actually use with custom value, do you mean "is empty" filter?»
>
> — https://github.com/twentyhq/twenty/discussions/20175, consultado el 30 de octubre de 2026

> «Thanks for the idea! I agree this would add value»
>
> — https://github.com/twentyhq/twenty/discussions/20002, consultado el 30 de octubre de 2026

> «This is a known limitation with Cloudflare's free tier SSL. Free plans only cover *.example.com (one level of wildcard), so app.crm.company.com (fourth level) won't get a valid certificate. Here are a few solutions: Option 1: Disable multi-workspace mode If you only need a single workspace, set…»
>
> — https://github.com/twentyhq/twenty/discussions/18476, consultado el 30 de octubre de 2026

> «That's because Twenty treats the mail account as source of truth so if in mail account email is deleted, then upon synchronization it deletes too (messaging-message-list-fetch-service.ts for reference) so that's expected, when it comes to archived messages, it needs research how they're actually…»
>
> — https://github.com/twentyhq/twenty/discussions/17581, consultado el 30 de octubre de 2026

> «You either have to wait for twentyhq/core-team-issues#214 or create a workflow/app which connects task with company based on details of task-related opportunity»
>
> — https://github.com/twentyhq/twenty/discussions/17461, consultado el 30 de octubre de 2026

**Bitrix24** · **0** (no cumple)

- *Cómo lo hace.* El foro oficial público del fabricante está en ruso (dev.1c-bitrix.ru, subforo de Bitrix24), y la comunidad de la nube conversa en un espacio que exige cuenta para leer: lo que se puede consultar públicamente es el foro ruso, cuya actividad mezcla consultas de la instalación propia con las de la nube.
- *Características.* En 0 otro usuario respondió dentro de la semana y quien consultó confirmó después que la respuesta le había servido; en 5 hubo respuesta, pero llegó más tarde o sin que el autor confirmara que lo resolvía; 16 no recibieron respuesta. La primera respuesta llegó, en el caso típico, a las 44 horas. 0 resueltas en la semana · 5 con respuesta tardía o sin confirmar · 16 sin respuesta · primera respuesta típica a las 44 horas.
- *Justificación.* La consulta típica queda sin respuesta: la compañía no puede contar con la comunidad para resolver un problema de configuración.

> «Добрый день! Подскажите почему не приходят письма со статистикой пока не авторизуешься админом?То есть я 1 месяц не заходил на портал под admin и мне не приходила статистика! Как зашел, сразу пришло много писем за месяц со статистикой! Где эти настройки найти?Обновления все установлены!»
>
> — https://dev.1c-bitrix.ru/community/forums/forum23/topic164588/, consultado el 30 de octubre de 2026

> «Всем добрый день. Поставил Битрикс24 26.150.0 на BitrixVM (VMWare 17 Player)Захотел создать CRM форму. Захожу в раздел CRM формы (http://192.168.138.128/crm/webform/) Жму кнопку "Добавить" и почему то появляется раздел, где написано "Форма не найдена. Обратитесь к администратору…»
>
> — https://dev.1c-bitrix.ru/community/forums/forum23/topic164572/, consultado el 30 de octubre de 2026

> «Мой облачный портал заблокирован из-за инструмента Потоки, который я тестировал. При использовании функционала система не предупредила меня, что после тестирования я потеряю доступ ко всему порталу и не смогу самостоятельно отключить этот инструмент. Сейчас я физически не могу выполнить инструкции…»
>
> — https://dev.1c-bitrix.ru/community/forums/forum23/topic164568/, consultado el 30 de octubre de 2026

> «Всем привет!Есть проблема. В шаблоне компонента iblock.element.add.form отображаются поля для редактирования элемента инфоблока.Я хочу сделать так, чтоб по клику на кнопку подгружалась бы дополнительная информация по элементу инфоблока, и чтоб эта дополнительная информация отображалась бы в боковой…»
>
> — https://dev.1c-bitrix.ru/community/forums/forum23/topic164512/, consultado el 30 de octubre de 2026

> «После обновления исчезла возможность при формировании шаблона регулярной задачи задавать в настройках опцию "Проконтролировать задачу после завершения".Регулярные задачи после завершения их исполнителем не становятся на контроль постановщику, много задач уходит из фокуса внимания, так как…»
>
> — https://dev.1c-bitrix.ru/community/forums/forum23/topic164360/, consultado el 30 de octubre de 2026

> «При создании нового элемента можно передать пользовательские поля и они поддянутся, но вот с полями привязки к элементам смарта такое не работает.Что нужно передать?UF_NAC_GUID строковое -- отработает. (списки, числа работают)UF_LINK -- привязка к элементам смарта. не…»
>
> — https://dev.1c-bitrix.ru/community/forums/forum23/topic164358/, consultado el 30 de octubre de 2026

> «Добрый день!Создаю лид используя CRest из Битрикс CMS в Битрикс24.В Б24 имеется пользовательское поле UF_CRM_XXXXXXXXXXX типа файл множественное. Лид создается, но кириллические имена файлов в лиде выглядят, как кракозябры. Константа C_REST_CURRENT_ENCODING в файле settings.php (пакета CRest) не…»
>
> — https://dev.1c-bitrix.ru/community/forums/forum23/topic164332/, consultado el 30 de octubre de 2026

> «Вчера вечером обновлял наш портал, сегодня утром посыпались вопросы от сотрудников:1. Не работает прямой переход в чат из правой колонки2. Телефония не работает - из карточки клиента/компании при нажатии на кнопку звонка появляется такое сообщение3. В чате при выборе кнопки "Переслать" не работает…»
>
> — https://dev.1c-bitrix.ru/community/forums/forum23/topic164324/, consultado el 30 de octubre de 2026

> «Добрый деньМного лет централизованно обновляли Windows версию Битрикс24 через установку exe приложения с ключом /SПри установке обычно закрывалось открытое приложение и устанавливалось новое приложение.Начиная с новой версии 23_0_32_91 при запуске с ключом /S ничего не происходит.Запускается…»
>
> — https://dev.1c-bitrix.ru/community/forums/forum23/topic164322/, consultado el 30 de octubre de 2026

> «Зайдите в /home/bitrix/www/index.php - у вас, похоже, обрезана index-страница.»
>
> — https://dev.1c-bitrix.ru/community/forums/forum23/topic164306/, consultado el 30 de octubre de 2026

> «А свой модуль подключили перед этим?»
>
> — https://dev.1c-bitrix.ru/community/forums/forum23/topic164298/, consultado el 30 de octubre de 2026

> «Добрый день, поковырялся в новых компонентах задач на BitrixVue3, чтобы кастомизировать новую карточку, можно использовать вот этот инструментарий.https://apidocs.bitrix24.ru/api-reference/widgets/task/view-tab.htmlЭто если есть возможность использовать REST. Для нашей коробки же документации…»
>
> — https://dev.1c-bitrix.ru/community/forums/forum23/topic164280/, consultado el 30 de octubre de 2026

> «Присоединяюсь, у нас таже проблема»
>
> — https://dev.1c-bitrix.ru/community/forums/forum23/topic164266/, consultado el 30 de octubre de 2026

> «Добрый день! Кто-нибудь в курсе, в этой форме вставки значения в поле активити в дизайнере БП Автор и Руководитель - это кто?Контекст - CRM, сделкаНапрашивается, что Автор - это либо создатель сделки, либо ответственный, либо тот, кто запустил БП, и это могут быть разные люди. Соответственно, и…»
>
> — https://dev.1c-bitrix.ru/community/forums/forum23/topic164244/, consultado el 30 de octubre de 2026

> «Всем привет! Подскажите, может кто сталкивался: нужно каким то образом сделать массовое редактирование задач в Битрикс24.Например я выделил в общем списке задач только 2 задачи, и хочу им проставить какой-либо тег.Сейчас я могу проставить теги только открывая каждую задачу, и отдельно внутри задачи…»
>
> — https://dev.1c-bitrix.ru/community/forums/forum23/topic164218/, consultado el 30 de octubre de 2026

> «Здравствуйте! Возникла следующая проблема:#11) Сделана резервная копия штатными средствами Битрикс24 из административной панели (на BitrixVM 7.5.5, Версия PHP 8.2.30, Версия MySQL 8.0.45, Версия Модуль "Ядро" (main) 26.150.0)2) Развернута ВМ BitrixVM 9.0.9, смена hostname и ip (отличное от BitrixVM…»
>
> — https://dev.1c-bitrix.ru/community/forums/forum23/topic164150/, consultado el 30 de octubre de 2026

> «Всем привет!Подскажите, как правильно восстанавливать битрикс-проекты из резервной копии, которая была сделана не штатными средствами битрикс, а вручную?Мне скинули 2 архива: в одном - файловая структура, а в другом - база данных.Я использую OpenServer 6.4.6 и MySQL-8.4Создал в нём новый проект,…»
>
> — https://dev.1c-bitrix.ru/community/forums/forum23/topic164108/, consultado el 30 de octubre de 2026

> «Добрый день. В коробочной версии Битрикс в какой-то момент задублировались поля (2 раза повторяется строчное поле "Комментарий УГМ"). Одно из них переименовали в "Комментарий УГМ1". Сейчас периодически возникает проблема с тем, что в карточке одно из этих полей (то одно, то другое) неактивно, то…»
>
> — https://dev.1c-bitrix.ru/community/forums/forum23/topic164098/, consultado el 30 de octubre de 2026

> «Может отдельно элементы и отдельно свойства типа такогоCIBlockElement::GetProperty( $id_block, $id, Array(), Array("PROPERTY_UL_FULL_NAME") );»
>
> — https://dev.1c-bitrix.ru/community/forums/forum23/topic164090/, consultado el 30 de octubre de 2026

> «Столкнулись с проблемой синхронизации пользователей по фильтру. Нужно выгружать пользователей в б42 из конкретных контейнеров, а из других игнорировать. Со стандартным фильтром (&(objectClass=user)(objectCategory=person)) все отрабатывает, но он забирает всех пользователей из AD. Долго не могли…»
>
> — https://dev.1c-bitrix.ru/community/forums/forum23/topic164070/, consultado el 30 de octubre de 2026

> «Добрый день!Столкнулся с такой проблемой:Битрикс. Коробочная версия.Создаю бизнес-процесс, который создает смарт-процесс из сделки.при заполнении поля Сделка = {{ID}} (что должно связать сделку с СП) после нажатия сохранения происходит "загрузка". Так "крутит" очень очень долго и в итоге ничего не…»
>
> — https://dev.1c-bitrix.ru/community/forums/forum23/topic164064/, consultado el 30 de octubre de 2026

### A.12.13 Soporte técnico con compromiso de respuesta

**Qué resuelve.** Saber en cuánto tiempo se obtiene ayuda ante una falla.

**EspoCRM** · **0** (no cumple)

- *Cómo lo hace.* La oferta de soporte del fabricante tiene tres canales y ninguno compromete un plazo: la asistencia paga se cobra por hora y se presta por correo, web y teléfono sin tiempo de respuesta garantizado; el servicio en la nube declara una cobertura de doce horas cinco días a la semana, que es un horario de atención y no un plazo; y el soporte gratuito es el foro de la comunidad.
- *Justificación.* La condición que la compañía necesita —saber en cuánto tiempo le van a responder cuando el sistema falle— no la ofrece ninguna modalidad.

> «Our hourly support rate is in range of $50 – $100. We primarily assist via email, web and voice call. We help to resolve problems, assist with maintenance and guide with implementing business processes.»
>
> — https://www.espocrm.com/support/, consultado el 30 de octubre de 2026

> «We provide 12×5 (hours/days) support via emails and Customer Portal. The scope of support covers functionalities that can be achieved through the user interface of EspoCRM. Designing business processes lies outside of the scope of support. We only advice about ways to implement them.»
>
> — https://www.espocrm.com/support/, consultado el 30 de octubre de 2026

> «Get free technical support from EspoCRM users and our developers. Post your questions on our Community Forum.»
>
> — https://www.espocrm.com/support/, consultado el 30 de octubre de 2026

**Twenty** · **0** (no cumple)

- *Cómo lo hace.* La oferta de soporte del fabricante tiene tres niveles y ninguno compromete un plazo: la edición gratuita se apoya en la comunidad, en su servidor de chat; el plan Organization en la nube agrega soporte prioritario, y en la instalación propia, soporte del equipo del fabricante, sin que ninguno declare en cuánto tiempo responde.
- *Justificación.* La condición que la compañía necesita —saber en cuánto tiempo le van a responder cuando el sistema falle— no la ofrece ninguna modalidad publicada.

> «Community support via Discord»
>
> — https://docs.twenty.com/user-guide/billing/capabilities/pricing-plans, consultado el 30 de octubre de 2026

> «Priority support»
>
> — https://docs.twenty.com/user-guide/billing/capabilities/pricing-plans, consultado el 30 de octubre de 2026

> «Twenty team support»
>
> — https://docs.twenty.com/user-guide/billing/capabilities/pricing-plans, consultado el 30 de octubre de 2026

**Bitrix24** · **0** (no cumple)

- *Cómo lo hace.* El fabricante publica un acuerdo de nivel de servicio con plazos de respuesta por severidad del incidente —una hora, veinticuatro horas o setenta y dos horas—, pero ese compromiso cubre las caídas de la plataforma, no una consulta puntual de una compañía sobre su cuenta.
- *Características.* En cualquier plan, el administrador de la cuenta puede consultar por el chat de soporte a un agente de inteligencia artificial; solo en los planes pagos ese chat se deriva a un especialista. Fuera de eso, la edición gratuita se apoya en la documentación y en la comunidad.
- *Justificación.* El acuerdo de nivel de servicio cubre a los usuarios con licencia paga. El chat con el agente de inteligencia artificial no compromete un plazo ni llega a una persona: no hay un canal con plazo comprometido.
- *Comentario — con Bitrix24 Basic* (US$ 69 por mes, hasta 5 usuarios, abono recurrente) sería **2** (cumple). Con el plan Basic, el primero con licencia paga, rige el acuerdo de nivel de servicio del fabricante, con plazos de respuesta por severidad de la falla: una hora para las críticas y altas, veinticuatro horas para las medias y setenta y dos horas para las bajas.

> «1 hour»
>
> — https://www.bitrix24.com/privacy/sla.php, consultado el 10 de noviembre de 2026

> «2.1. Bitrix24 Helpdesk provides 99.5% uptime commitment for support services. Bitrix24 support channels are available 24 hours per day, 7 days a week, 365 days a year. Tier 2 specialists are available between 6 a.m and 4 p.m UTC on business days. Issues should be reported to Bitrix24 through any of the support channels. Support team will respond according to the response time set forth in the table below:»
>
> — https://www.bitrix24.com/privacy/sla.php, consultado el 10 de noviembre de 2026

> «72 hours»
>
> — https://www.bitrix24.com/privacy/sla.php, consultado el 10 de noviembre de 2026

> «Chat with the AI support agent is available on any plan. Only commercial plans allow the AI agent to transfer your chat to a support specialist. Bitrix24 plans and pricing»
>
> — https://helpdesk.bitrix24.com/open/18291948/, consultado el 10 de noviembre de 2026

> «Basic desde US$ 69 desde US$ 49 incluye 5 usuarios Empezar Empezar»
>
> — https://www.bitrix24.es/prices/, consultado el 10 de noviembre de 2026

### A.12.14 Continuidad de las versiones en uso

**Qué resuelve.** Planificar las actualizaciones sin quedar con una versión sin correcciones.

**Cifra de referencia: 12 meses.** La compañía planifica sus cambios de sistema por ejercicio anual.

| 2 | 1 | 0 |
|---|---|---|
| El fabricante sostiene cada versión doce meses o más, de modo que la actualización entra en el plan del ejercicio | Publica un plazo menor, que obliga a adelantar la actualización | No publica ningún compromiso |

**EspoCRM** · **0** (no cumple)

- *Cómo lo hace.* El fabricante no publica por cuánto tiempo corrige una versión: no hay política de soporte por versión ni versiones de soporte extendido. Lo que la documentación oficial indica es actualizar apenas sale una versión nueva, lo que equivale a sostener solo la última.
- *Justificación.* La compañía no puede fijar la actualización en su plan anual: tiene que seguir el ritmo del fabricante para seguir recibiendo correcciones.

> «It's recommended to upgrade whenever the new version is out. If you skip a few minor or major versions before deciding to upgrade, it's more likely that the upgrade will run unsmoothly. For minor or major releases it may be reasonable to wait for a few days before upgrading, as a very fresh release is likely to have yet undiscovered bugs.»
>
> — https://docs.espocrm.com/administration/upgrading/, consultado el 30 de octubre de 2026

**Twenty** · **0** (no cumple)

- *Cómo lo hace.* El fabricante no publica por cuánto tiempo corrige una versión: no hay política de soporte por versión ni versiones de soporte extendido.
- *Características.* Publica versiones nuevas a un ritmo de 14,5 por mes, y la guía de actualización lo que asegura es poder saltar desde cualquier versión soportada directo a la última. 30 versiones publicadas en 62 días.
- *Justificación.* La compañía no puede fijar la actualización en su plan anual: tiene que seguir el ritmo del fabricante para recibir correcciones.

> «Starting from v1.23, Twenty supports cross-version upgrades. You can jump directly from any supported version to the latest release without stepping through each intermediate version.»
>
> — https://docs.twenty.com/developers/self-host/capabilities/upgrade-guide, consultado el 30 de octubre de 2026

**Bitrix24** · **0** (no cumple)

- *Cómo lo hace.* La edición evaluada es un servicio en la nube de versión única: no hay "versiones" que la compañía elija sostener, porque el fabricante actualiza el portal de todos sus clientes a la vez y sin aviso previo, según sus propias condiciones de servicio.
- *Justificación.* El fabricante no publica ningún compromiso de por cuánto tiempo una función o un comportamiento se mantienen estables: la compañía no puede planificar su propia actualización porque no la controla, y un cambio de comportamiento puede llegar en cualquier momento del ejercicio.

> «1.4. The terms of this Agreement may be updated by Alaio from time to time without notice. In case of the major changes, you will be provided with advance notification of the changes through a prominent notice within the Service and/or by email communication as set forth in section 34. Contact information. Contracting Entity. The amended Terms of Service will take effect upon the date mentioned above on the top of this page, unless otherwise provided in a notification to you. Please check these Terms of Service periodically for changes. Failure to provide or maintain accurate or current contact information by you will not obviate your responsibility to comply with these Terms of Service, as amended from time to time. If you do not agree to any changes to these Terms of Service, you must discontinue using any our services and Products and no longer access the Website. Your continued use of the Website, the Services, and the Products indicates your agreement to the changes. The version of these Terms of Service currently published at https://www.bitrix24.com/terms/ constitutes the binding and governing agreement applicable to all users at any given time.»
>
> — https://www.bitrix24.com/terms/, consultado el 30 de octubre de 2026

## B.1 Capacidades por encima de lo solicitado

### B.1.1 Asistente de inteligencia artificial

**Qué resuelve.** Resumir el historial de un asegurado o redactar una respuesta.

**EspoCRM** · **0** (no cumple)

- *Cómo lo hace.* La edición gratuita no incluye un asistente de inteligencia artificial: la administración no ofrece ninguna función de ese tipo y el fabricante la vende como extensión aparte.
- *Justificación.* Con ella el sistema resume registros, redacta correos y clasifica o extrae datos con fórmulas, usando el proveedor de inteligencia artificial que la compañía elija y contrate.
- *Comentario — con Intelligence* (US$ 129 por año y por instalación, abono recurrente) sería **2** (cumple, costo 1). La extensión agrega el resumen de registros y la redacción asistida. Requiere configurar la cuenta de un proveedor de inteligencia artificial, que se contrata y se paga aparte.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas B-1-1-espocrm-1-administracion.

> «Summary»
>
> — https://www.espocrm.com/extensions/intelligence/, consultado el 30 de octubre de 2026

> «$129.00 1 Year License + Upgrades»
>
> — https://www.espocrm.com/extensions/intelligence/, consultado el 30 de octubre de 2026

> «1.1 Subject to your continuous compliance with the Agreement and payment of the applicable license fees, EspoCRM grants you a non-exclusive, non-transferable, worldwide, limited right to use the Software on a single EspoCRM Application instance on a single server for the Licensed Period. After the license period expires, you must renew or purchase a new license to continue using the Software. You may use or modify the Software only for your own internal business purposes or for non-commercial or personal use.»
>
> — https://www.espocrm.com/extension-license-agreement/, consultado el 30 de octubre de 2026

**Twenty** · **2** (cumple) · costo de implementación **1**

- *Cómo lo hace.* El asistente se abre desde el menú, con la ficha a la vista. En la instalación propia hay que conectarlo a un servicio de inteligencia artificial (Anthropic, Google, Mistral, OpenAI o xAI), que la compañía elige, contrata y paga por uso; con el servicio conectado, el fabricante documenta que consulta los registros y resume su información.
- *Características.* El producto trae un asistente de inteligencia artificial que se abre desde el menú, con un chat que consulta los registros con los permisos del usuario y resume la información del sistema en lenguaje natural. Conectar un proveedor propio, como un modelo instalado en la red de la compañía, es del plan Organization. Sin un servicio de inteligencia artificial conectado: capacidad según la documentación oficial.
- *Justificación.* Habilitarlo es configuración de una sola vez, más el costo del proveedor.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas B-1-1-twenty-1-pedido-de-resumen, B-1-1-twenty-2-proveedores-de-modelos.

> «Ask questions about your data in natural language. The AI chatbot can query your CRM records, summarize information, and help you find what you’re looking for without building complex filters.»
>
> — https://docs.twenty.com/getting-started/core-concepts/ai, consultado el 8 de noviembre de 2026

**Bitrix24** · **2** (cumple) · costo de implementación **1**

- *Cómo lo hace.* Desde el chat de la negociación se le pide a CoPilot el resumen del registro: el asistente recibe la consulta, pero su respuesta puede depender de la cuota gratuita del portal.
- *Características.* El producto trae CoPilot, un asistente de inteligencia artificial disponible desde el propio registro, en la edición gratuita, con una cuota de usos gratuitos por mes.
- *Justificación.* Queda disponible de fábrica, sin instalar nada: lo único que puede requerir una configuración de una vez es elegir o ampliar la cuota de uso cuando la gratuita se agota.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas B-1-1-bitrix24-1-negociacion, B-1-1-bitrix24-2-copilot.

> «Su asistente potenciado por IA en Bitrix24»
>
> — https://www.bitrix24.es/features/copilot.php, consultado el 29 de septiembre de 2026

### B.1.2 Uso desde el teléfono durante la visita

**Qué resuelve.** El productor registra la operación durante la visita y se entera en el momento de lo que le asignan.

**EspoCRM** · **1** (cumple con reparo) · costo de implementación **2**

- *Cómo lo hace.* Con la pantalla de un teléfono, el productor entra, crea una tarea vinculada a un asegurado y queda guardada. Las notificaciones de Preferencias solo ofrecen avisos dentro del sistema (la campana, con la pestaña abierta, y un sonido opcional); no hay avisos del navegador ni al teléfono: en el código de la instalación no hay rastro de permisos de notificación, de procesos en segundo plano ni de envío de avisos al teléfono.
- *Características.* La misma interfaz se adapta a la pantalla del teléfono y permite cargar y consultar durante la visita. Los avisos de lo que se asigna aparecen en la campana, con el sistema abierto.
- *Justificación.* Se puede registrar la operación desde el teléfono sin configurar nada, pero el aviso de lo asignado no llega con el sistema cerrado: es el reparo.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas B-1-2-espocrm-2-alta-en-pantalla-de-telefono, B-1-2-espocrm-3-tarea-guardada, B-1-2-espocrm-4-avisos.

**Twenty** · **1** (cumple con reparo) · costo de implementación **2**

- *Cómo lo hace.* Con la pantalla de un teléfono, el productor busca al asegurado, abre su ficha y crea una tarea vinculada a él, que queda guardada. La configuración no tiene opciones de notificaciones y la interfaz no usa los avisos del navegador ni el envío de avisos al teléfono: no hay manera de enterarse de lo asignado sin abrir el sistema.
- *Características.* La misma interfaz se adapta a la pantalla del teléfono, con barra inferior de acceso rápido, y permite cargar y consultar durante la visita.
- *Justificación.* Se puede registrar la operación desde el teléfono sin configurar nada, pero ningún aviso de lo asignado llega al teléfono: es el reparo.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas B-1-2-twenty-2-alta-en-pantalla-de-telefono, B-1-2-twenty-3-tarea-guardada, B-1-2-twenty-4-avisos.

**Bitrix24** · **2** (cumple) · costo de implementación **0**

- *Cómo lo hace.* En la pantalla de un teléfono, el productor entra al portal y registra una operación, que queda guardada. Los avisos al teléfono los envía la aplicación oficial del fabricante, publicada en Google Play y en App Store: la documentación oficial indica que, para recibirlos, se activan en la configuración de esa aplicación.
- *Características.* El fabricante publica una aplicación oficial y gratuita para Android e iOS, con el CRM, las tareas, el chat y las notificaciones. Los avisos llegan al teléfono como notificaciones push y se configuran por tipo de aviso.
- *Justificación.* Viene lista: alcanza con instalar la aplicación e iniciar sesión. Los avisos al teléfono se sostienen con la documentación oficial; no se comprobó la llegada de un aviso a un teléfono real.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas B-1-2-bitrix24-2-alta-en-pantalla-de-telefono, B-1-2-bitrix24-3-operacion-guardada, B-1-2-bitrix24-1-google-play.

> «Mobile devices (push notifications) — to display notifications on your mobile device, enable them in the mobile app settings. Bitrix24 mobile app»
>
> — https://helpdesk.bitrix24.com/open/19423886/, consultado el 10 de noviembre de 2026

> «The Bitrix24 mobile app is free and available on the App Store, Google Play, Huawei AppGallery. Download the mobile app»
>
> — https://helpdesk.bitrix24.com/open/21659550/, consultado el 10 de noviembre de 2026

### B.1.3 Suite de trabajo integrada

**Qué resuelve.** Mensajería, documentos y firma en el mismo entorno.

**EspoCRM** · **1** (cumple con reparo) · costo de implementación **2**

- *Cómo lo hace.* Además del CRM, el producto incluye correo, calendario, documentos, plantillas PDF y una línea de publicaciones internas en cada registro, y todas operan sobre los mismos datos: un correo queda en la ficha del asegurado, una reunión en su historial, un documento vinculado a su póliza.
- *Características.* Faltan la mensajería instantánea entre usuarios, la edición colaborativa de documentos y la firma electrónica.
- *Justificación.* Para la mensajería instantánea entre usuarios, la edición colaborativa de documentos y la firma electrónica la compañía sigue necesitando otras herramientas, y pasar la información de una a otra es trabajo en cada uso.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas B-1-3-espocrm-1-herramientas.

**Twenty** · **1** (cumple con reparo) · costo de implementación **2**

- *Cómo lo hace.* Además del CRM, el producto incluye correo, calendario, notas, tareas, archivos, tableros, automatizaciones, asistente de IA, y todas operan sobre los mismos datos.
- *Características.* La ficha del asegurado reúne en pestañas su línea de tiempo, sus tareas, sus notas, sus archivos, sus correos y sus reuniones, y los tableros y las automatizaciones leen y escriben los mismos registros. Pestañas de la ficha: Timeline, Tasks, Notes, Files, Emails, Calendar.
- *Justificación.* Faltan la mensajería instantánea entre usuarios, la edición colaborativa de documentos y la firma electrónica: para eso la compañía sigue necesitando otras herramientas, y pasar la información de una a otra es trabajo en cada uso.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas B-1-3-twenty-1-herramientas-en-la-ficha, B-1-3-twenty-2-tableros.

**Bitrix24** · **1** (cumple con reparo) · costo de implementación **2**

- *Cómo lo hace.* Desde la ficha de una negociación se abre un chat, una tarea, una reunión o un comentario (Chat, Tarea, Comentario) sin salir del registro.
- *Características.* Además del CRM, el producto incluye mensajería, tareas y proyectos, calendario, Drive (documentos), base de conocimientos, sitios web, todo en la misma cuenta y sobre los mismos contactos. Acciones disponibles desde la ficha: Chat, Tarea, Comentario.
- *Justificación.* Falta la edición colaborativa de documentos de oficina y la firma electrónica en la edición gratuita —quedan en planes pagos o en aplicaciones del catálogo—, así que la compañía sigue necesitando otra herramienta para esa parte, con el trabajo de pasar la información de una a otra.
- *Comentario — con Bitrix24 Standard* (US$ 144 por mes, hasta 50 usuarios, abono recurrente) sería **2** (cumple, costo 1). El plan Standard es el primero que suma la edición colaborativa de documentos y la firma electrónica de la empresa, además de lo que ya trae la edición gratuita: la compañía deja de necesitar otra herramienta para esa parte. Requiere configurar una vez los documentos y la firma.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas B-1-3-bitrix24-1-herramientas-en-la-negociacion, B-1-3-bitrix24-2-drive.

> «Edición colaborativa de documentos Cree y edite documentos, hojas de cálculo y presentaciones en su cuenta de Bitrix24, sin necesidad de instalar aplicaciones/extensiones adicionales.»
>
> — https://www.bitrix24.es/prices/compare_cloud_plans.php, consultado el 8 de noviembre de 2026

> «Envía documentos para que los firmen varios empleados a la vez.»
>
> — https://www.bitrix24.es/prices/compare_cloud_plans.php, consultado el 8 de noviembre de 2026

> «US$ 144»
>
> — https://www.bitrix24.es/prices/, consultado el 8 de noviembre de 2026

### B.1.4 Telefonía y videollamada integradas

**Qué resuelve.** Atención sin cambiar de herramienta.

**EspoCRM** · **0** (no cumple)

- *Cómo lo hace.* La edición gratuita no integra telefonía ni videollamada: el número de teléfono de una ficha abre el marcador del equipo, pero la llamada ocurre afuera y se registra a mano.
- *Justificación.* El fabricante vende las dos funciones como extensiones separadas: una conecta la central telefónica —3CX, Asterisk, Twilio, entre otras— y la otra agrega las videollamadas.
- *Comentario — con VoIP Integration + Zoom Integration* (US$ 498 por año y por instalación (US$ 388 + US$ 110), abono recurrente) sería **2** (cumple, costo 1). Con las dos extensiones, las llamadas se atienden y se registran desde la ficha y las reuniones generan su enlace de videollamada. Requiere la central telefónica y la cuenta de videollamadas de la compañía.
- *Comentario — con EspoCRM Cloud Basic* (US$ 15 por usuario por mes, mínimo 3 usuarios, abono recurrente) sería **2** (cumple, costo 1). El servicio en la nube incluye las dos extensiones entre todas las del fabricante.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas B-1-4-espocrm-1-integraciones.

> «VoIP Integration extension is an official add-on for EspoCRM. It allows EspoCRM to integrate with the following IP telephony servers and services:»
>
> — https://www.espocrm.com/extensions/voip-integration/, consultado el 30 de octubre de 2026

> «$388.00 1 Year License + Upgrades»
>
> — https://www.espocrm.com/extensions/voip-integration/, consultado el 30 de octubre de 2026

> «1.1 Subject to your continuous compliance with the Agreement and payment of the applicable license fees, EspoCRM grants you a non-exclusive, non-transferable, worldwide, limited right to use the Software on a single EspoCRM Application instance on a single server for the Licensed Period. After the license period expires, you must renew or purchase a new license to continue using the Software. You may use or modify the Software only for your own internal business purposes or for non-commercial or personal use.»
>
> — https://www.espocrm.com/extension-license-agreement/, consultado el 30 de octubre de 2026

> «$110.00 1 Year License + Upgrades»
>
> — https://www.espocrm.com/extensions/zoom-integration/, consultado el 30 de octubre de 2026

> «1.1 Subject to your continuous compliance with the Agreement and payment of the applicable license fees, EspoCRM grants you a non-exclusive, non-transferable, worldwide, limited right to use the Software on a single EspoCRM Application instance on a single server for the Licensed Period. After the license period expires, you must renew or purchase a new license to continue using the Software. You may use or modify the Software only for your own internal business purposes or for non-commercial or personal use.»
>
> — https://www.espocrm.com/extension-license-agreement/, consultado el 30 de octubre de 2026

> «Basic $15.00 per user/month minimum 3 users 3GB file storage per user 100,000 records SSL Encryption (256 bit keys, TLS 1.3) Full feature set All extensions included External access API 2000+ integrations * 12x5 (hours/days) support Sign Up Free Trial Free Trial is provided for 30 days»
>
> — https://www.espocrm.com/cloud/, consultado el 30 de octubre de 2026

**Twenty** · **0** (no cumple)

- *Cómo lo hace.* La videollamada está integrada a medias: desde la ficha de un asegurado se crea una reunión en el calendario conectado de Google o Microsoft, con el enlace de videollamada de ese servicio, y la reunión queda en la línea de tiempo del registro.
- *Características.* La telefonía no está.
- *Justificación.* El procedimiento pide la función dentro del sistema, y la videollamada y la llamada ocurren en herramientas externas. Que la reunión quede en la línea de tiempo con su enlace no la vuelve una función propia, como tampoco en EspoCRM.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas B-1-4-twenty-1-acciones-de-la-ficha.

> «Toggle Invitations to email guests, and Video call to add a meeting link»
>
> — https://docs.twenty.com/user-guide/calendar-emails/how-tos/can-i-book-meetings-from-twenty, consultado el 30 de octubre de 2026

**Bitrix24** · **1** (cumple con reparo) · costo de implementación **2**

- *Cómo lo hace.* Desde la ficha de una negociación se inicia una reunión con video, sin salir del sistema.
- *Características.* La videollamada está integrada de fábrica. Videollamada en la ficha: no detectada · acción de llamar: no.
- *Justificación.* La telefonía no: el fabricante reserva la línea propia y la numeración de Bitrix24 Telephony a los planes pagos, así que en la edición gratuita llamar desde el sistema requiere contratar ese módulo o desarrollar la conexión con una central externa por la interfaz de programación.
- *Comentario — con Bitrix24 Basic* (US$ 69 por mes, hasta 5 usuarios, abono recurrente) sería **2** (cumple, costo 1). Desde el plan Basic, el primero que incluye la telefonía integrada, se llama desde la ficha del cliente y se puede conectar una central propia por el conector SIP, sin desarrollo. Requiere dar de alta la línea o la central una vez.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas B-1-4-bitrix24-1-acciones-de-la-negociacion.

> «¡Sí, lo es! El plan Free es un estado de cuenta predeterminado, en el que se puede agregar un número ilimitado de usuarios y disfrutar de las herramientas disponibles de forma totalmente gratuita durante el tiempo ilimitado. Tenga en cuenta que algunas herramientas como Telefonía y aplicaciones de Bitrix24 Market están disponibles solo en los planes pagos.»
>
> — https://www.bitrix24.es/prices/, consultado el 8 de noviembre de 2026

> «Bitrix24 cuenta con telefonía incorporada que no necesita configuración ni integración»
>
> — https://www.bitrix24.es/prices/compare_cloud_plans.php, consultado el 8 de noviembre de 2026

> «Basic desde US$ 69 desde US$ 49 incluye 5 usuarios Empezar Empezar»
>
> — https://www.bitrix24.es/prices/, consultado el 8 de noviembre de 2026

## B.2 Condiciones que impone el negocio asegurador

### B.2.1 Persistencia de los datos sin uso continuo

**Por qué importa.** La normativa de la Superintendencia exige conservar los registros de la actividad, sin alterarlos, por al menos diez años [162].

**EspoCRM** · **2** (cumple)

- *Cómo lo hace.* En la instalación propia los datos quedan en el servidor de la compañía y no dependen de ninguna cuenta del fabricante.
- *Características.* No hay condición de servicio que los afecte por falta de uso, porque no hay servicio de por medio.
- *Justificación.* Una póliza puede quedar años sin que nadie la abra y sigue ahí mientras el equipo donde corre el sistema se mantenga.

> «Self-hosted (on-premise) — You install the software and have all the data stored on your own server. All the server maintenance, as well as data security, will be your responsibility.»
>
> — https://www.espocrm.com/self-hosted-vs-cloud-crm/, consultado el 30 de octubre de 2026

**Twenty** · **2** (cumple)

- *Cómo lo hace.* En la instalación propia los datos quedan en el servidor de la compañía y no dependen de ninguna cuenta del fabricante.
- *Características.* No hay condición de servicio que los afecte por falta de uso, porque no hay servicio de por medio, y el fabricante la ofrece con el control total de los datos.
- *Justificación.* Una póliza puede quedar años sin que nadie la abra y sigue ahí mientras el equipo donde corre el sistema se mantenga.

> «Full control over your data»
>
> — https://docs.twenty.com/user-guide/billing/capabilities/pricing-plans, consultado el 30 de octubre de 2026

**Bitrix24** · **0** (no cumple)

- *Cómo lo hace.* Las condiciones de servicio del fabricante habilitan la baja de la cuenta, con sus datos, después de cincuenta días corridos sin uso.
- *Justificación.* Una póliza vigente puede pasar mucho más que cincuenta días sin que nadie la consulte —está vigente, pero no requiere actividad—, y ese silencio pone en riesgo toda la cartera, no solo el registro inactivo. La compañía tiene que sostener un ingreso periódico solo para conservar datos que de otro modo no necesitarían ninguna atención.
- *Comentario — con Bitrix24 Basic* (US$ 69 por mes, hasta 5 usuarios, abono recurrente) sería **2** (cumple). La baja por falta de uso solo rige mientras la cuenta sigue en la edición gratuita: las condiciones la condicionan a que, vencido el plazo, la cuenta «remains under the Free Plan». Con el plan Basic, el más barato de los pagos, esa baja deja de aplicar y los datos se conservan aunque nadie ingrese.

> «21.3.1. Alaio reserves the right to suspend your Bitrix24 Customer Account (temporary limit access to User Accounts and Administrator Accounts) in the following instances: (1) if you fail to comply with terms of these Terms of Service or other requirements described herein; (2) non-use of the Bitrix24 Customer Account for fifty (50) consecutive calendar days, provided that upon expiration of said period the Bitrix24 Customer Account remains under the Free Plan. Upon "non-use" we consider the absence of data in the Bitrix24 archive system about any activity in the Services and the Products within your Bitrix24 Customer Account; (3) non-deletion of User Content incompatible with a Free or cheaper Service Plan in accordance with Section 7.7. of these Terms of Service.»
>
> — https://www.bitrix24.com/terms/, consultado el 8 de noviembre de 2026

> «21.3.1. Alaio reserves the right to suspend your Bitrix24 Customer Account (temporary limit access to User Accounts and Administrator Accounts) in the following instances: (1) if you fail to comply with terms of these Terms of Service or other requirements described herein; (2) non-use of the Bitrix24 Customer Account for fifty (50) consecutive calendar days, provided that upon expiration of said period the Bitrix24 Customer Account remains under the Free Plan. Upon "non-use" we consider the absence of data in the Bitrix24 archive system about any activity in the Services and the Products within your Bitrix24 Customer Account; (3) non-deletion of User Content incompatible with a Free or cheaper Service Plan in accordance with Section 7.7. of these Terms of Service.»
>
> — https://www.bitrix24.com/terms/, consultado el 8 de noviembre de 2026

> «Basic desde US$ 69 desde US$ 49 incluye 5 usuarios Empezar Empezar»
>
> — https://www.bitrix24.es/prices/, consultado el 8 de noviembre de 2026

### B.2.2 Copia propia y completa de la cartera

**Por qué importa.** La compañía tiene que poder respaldar y recuperar sus datos por sí misma, como piden las medidas de seguridad recomendadas por la autoridad de protección de datos [167].

**EspoCRM** · **2** (cumple)

- *Cómo lo hace.* La copia se restituye en una base de datos aparte y la cartera vuelve entera, con los mismos asegurados y pólizas que en el sistema en uso.
- *Características.* Se obtuvo una copia completa con el procedimiento oficial: el volcado de la base de datos y el archivo de la carpeta de datos, que es donde el sistema guarda los adjuntos. Base de 28019 KB y 80 archivos de datos en 400 KB; restituida sin diferencias.
- *Justificación.* La compañía tiene en su poder toda la información en formatos abiertos y no depende de nadie para recuperarla.

> «Create an archive of the entire directory contents of the EspoCRM instance. You can use the following command:»
>
> — https://docs.espocrm.com/administration/backup-and-restore/, consultado el 30 de octubre de 2026

**Twenty** · **2** (cumple)

- *Cómo lo hace.* Se obtiene una copia completa con el procedimiento que indica el fabricante: el volcado de la base de datos, y el archivo de la carpeta donde el servidor guarda los adjuntos.
- *Características.* La copia se restituyó en una base de datos aparte y la cartera volvió entera: 29 personas, 35 pólizas y 6 reclamos, los mismos que en el sistema en uso. Base de 2231 KB y 127 archivos adjuntos en 28519 KB; restituida sin diferencias.
- *Justificación.* La compañía tiene en su poder toda la información, en el formato abierto de la base, y no depende de nadie para recuperarla.

> «Regular backups protect your CRM data from loss.»
>
> — https://docs.twenty.com/developers/self-host/capabilities/docker-compose, consultado el 30 de octubre de 2026

**Bitrix24** · **0** (no cumple)

- *Cómo lo hace.* El listado de negociaciones, que en la edición gratuita hace de cartera de pólizas, no ofrece una acción «Exportar» habilitada. La exportación de contactos pide actualizar a un plan superior y el webhook entrante, que es el camino para que otro sistema lea los datos, no está disponible en el plan actual. El respaldo diario del fabricante no se descarga: solo se restituye pidiéndolo a soporte.
- *Justificación.* Para la compañía no hay función del producto que entregue una copia de su cartera: la exportación y el acceso desde otros sistemas son de planes pagos, y el respaldo es del fabricante y no se puede bajar. Lo único que devuelve los datos completos es la llamada interna que usan las pantallas del portal, que solo un programador puede invocar desde la consola del navegador: no es una función ofrecida al usuario, así que no cuenta como medio.
- *Comentario — con Bitrix24 Basic* (US$ 69 por mes, hasta 5 usuarios, abono recurrente) sería **1** (cumple con reparo). El plan Basic incluye la exportación de contactos a CSV, Excel y Outlook, con lo que una parte de la cartera se puede sacar del sistema. El reparo es que el fabricante solo publica esa opción para contactos, y los archivos adjuntos se siguen bajando uno por uno. La interfaz de programación completa llega recién con el plan Basic Vibe+.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas B-2-2-bitrix24-1-listado, B-2-2-bitrix24-2-opcion-de-exportar.

> «Opción para exportar contactos a CSV, Excel y Outlook»
>
> — https://www.bitrix24.es/prices/compare_cloud_plans.php, consultado el 8 de noviembre de 2026

> «Basic desde US$ 69 desde US$ 49 incluye 5 usuarios Empezar Empezar»
>
> — https://www.bitrix24.es/prices/, consultado el 8 de noviembre de 2026

### B.2.3 Copia periódica sin intervención manual

**Por qué importa.** El respaldo necesita una periodicidad definida y pruebas de recuperación; que se ejecute solo evita depender de que alguien lo haga [167].

**EspoCRM** · **1** (cumple con reparo)

- *Cómo lo hace.* La documentación oficial resuelve la repetición afuera, con el programador de tareas del servidor, que ejecuta todas las noches el mismo procedimiento de copia.
- *Características.* El producto no trae una copia programada: sus tareas programadas son de mantenimiento propio y ninguna genera un respaldo.
- *Justificación.* La condición se satisface con una limitación que la compañía asume: la copia se repite sola, pero la programa, la vigila y la guarda fuera del equipo alguien con acceso al servidor, porque el sistema no avisa si una noche falló.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas B-2-3-espocrm-2-tareas-programadas.

> «Backups can be scheduled on the host by adding the following entry to the crontab:»
>
> — https://docs.espocrm.com/administration/backup-and-restore/, consultado el 30 de octubre de 2026

**Twenty** · **1** (cumple con reparo)

- *Cómo lo hace.* La documentación del fabricante resuelve la repetición afuera, con el programador de tareas del servidor, que ejecuta todas las noches el volcado de la base.
- *Características.* El producto no trae una copia programada: su panel de administración muestra el estado del servidor y sus variables, y ninguna opción genera un respaldo.
- *Justificación.* La condición se satisface con una limitación que la compañía asume: la copia se repite sola, pero la programa, la vigila y la guarda fuera del equipo alguien con acceso al servidor, porque el sistema no avisa si una noche falló.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas B-2-3-twenty-2-panel-de-administracion.

> «Automate Daily Backups»
>
> — https://docs.twenty.com/developers/self-host/capabilities/docker-compose, consultado el 30 de octubre de 2026

**Bitrix24** · **0** (no cumple)

- *Cómo lo hace.* El propio fabricante genera una copia diaria de toda la cuenta, sin que nadie la programe ni la ejecute: no es una tarea que la compañía tenga que sostener.
- *Características.* Esa copia la administra el fabricante y no la compañía, se conserva solo siete días, y restituir una fecha concreta depende de pedirlo a soporte y de que el plan contratado lo permita, así que la compañía no controla ni la retención ni la restitución de su propio resguardo.
- *Justificación.* El procedimiento pide programar la copia propia de B.2.2, y en la edición gratuita esa copia no existe: la copia diaria del fabricante no la controla ni la conserva la compañía.

> «If you accidentally delete important data like SPAs, deals, or tasks, don't worry. Bitrix24 automatically creates daily backups of all your data and keeps them safe for seven days, allowing you to restore your information with ease.»
>
> — https://helpdesk.bitrix24.com/open/25110238/, consultado el 30 de octubre de 2026

### B.2.4 Búsqueda y operación con volumen productivo

**Por qué importa.** La cartera de prueba suma veinticinco mil registros, unas quince veces la de una compañía promedio, como margen para el crecimiento.

**Cifra de referencia: 25.000 registros.** Una compañía promedio, con quinientos clientes, tiene unas setecientas cincuenta pólizas [170] [171] y ochenta reclamos por año [169]. La cartera de prueba es unas quince veces más grande, para cubrir el crecimiento.

| 2 | 1 | 0 |
|---|---|---|
| Con la cartera cargada, la búsqueda responde sin espera perceptible | Responde con una demora que el usuario nota y tolera | La operación se vuelve impracticable, o falla |

**EspoCRM** · **2** (cumple)

- *Cómo lo hace.* Con una cartera de referencia de veinticinco mil registros —cinco mil asegurados, doce mil quinientas pólizas y siete mil quinientos reclamos— el sistema resuelve las operaciones de todos los días: buscar un asegurado por texto y filtrar las pólizas por ramo.
- *Características.* Buscar un asegurado entre cinco mil y filtrar las doce mil quinientas pólizas por ramo respondió en menos de medio segundo las tres veces: no hay espera que el usuario perciba. texto 0.3 / 0.1 / 0.1 s · filtro 0.1 / 0.1 / 0.2 s · carga 0 min.
- *Justificación.* Con la cartera de referencia cargada, el sistema responde como con una cartera chica.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas B-2-4-espocrm-1-busqueda-por-texto, B-2-4-espocrm-2-filtrado-por-ramo.

**Twenty** · **2** (cumple)

- *Cómo lo hace.* Las operaciones de todos los días —buscar un asegurado por texto desde la búsqueda general y filtrar las pólizas por ramo— se hacen sobre una cartera de veinticinco mil registros: cinco mil asegurados, doce mil quinientas pólizas y siete mil quinientos reclamos.
- *Características.* Buscar un asegurado entre cinco mil respondió en un cuarto de segundo o menos las tres veces, y filtrar las doce mil quinientas pólizas por ramo, en menos de dos décimas: no hay espera que el usuario perciba. texto 0.12 / 0.17 / 0.25 s · filtro 0.04 / 0.03 / 0.04 s · carga 0 min.
- *Justificación.* Con la cartera de referencia cargada, el sistema responde como con una cartera chica.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas B-2-4-twenty-1-busqueda-por-texto, B-2-4-twenty-2-filtrado-por-ramo.

**Bitrix24** · **0** (no cumple)

- *Cómo lo hace.* Se cargó la cartera de referencia —cinco mil asegurados, doce mil quinientas pólizas y siete mil quinientos reclamos, veinticinco mil registros— y con ella se repitieron las operaciones de todos los días: buscar un asegurado por texto y filtrar las pólizas por ramo.
- *Características.* Con la cartera cargada, buscar un asegurado por texto respondió en 0,77, 0,76 y 0,62 segundos. En el listado de negociaciones, donde la edición gratuita lleva las pólizas y los reclamos, mostró el aviso «Alcanzó el límite de búsqueda de negociaciones (1000)» 36 minutos después de empezar a cargar las negociaciones, con las mil superadas desde los primeros minutos: la búsqueda por texto dejó de filtrar y el aviso tapa los campos del filtro, de modo que solo quedan los filtros predeterminados, como las negociaciones en progreso o las cerradas. texto 0.77 / 0.76 / 0.62 s (VOL-00777 sí, VOL-04321 sí, VOL-02468 sí) · filtro sin medir · carga {"contactos":5000,"polizas":12500,"reclamos":7500} en 39 min · bloqueo a los 36 min de empezar la carga de negociaciones · aviso del sistema (negociaciones): Alcanzó el límite de búsqueda de negociaciones (1000). Nos esforzamos por mejorar la calidad y el rendimiento del servicio para adaptarnos a la escala de su empresa. La cantidad de datos aumenta a medida que su empresa crece: cada día se crean nuevas tareas, negociaciones y otras entidades..
- *Justificación.* Con más de mil registros, la edición gratuita deja de buscar por texto y de filtrar por campo en el listado; solo quedan los filtros predeterminados, que no ubican una póliza ni un asegurado puntual. La compañía, con unas setecientas cincuenta pólizas por año y los reclamos de cinco años, supera ese número en las negociaciones, y lo superaría en los asegurados al crecer: la operación diaria sobre la cartera se vuelve impracticable.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas B-2-4-bitrix24-limite-negociaciones, B-2-4-bitrix24-3-busqueda-por-texto-de-una-poliza, B-2-4-bitrix24-4-filtro-por-campo-tapado-por-el-aviso, B-2-4-bitrix24-5-filtro-predeterminado-negociaciones-en-progreso, B-2-4-bitrix24-1-busqueda-por-texto.

### B.2.5 Previsibilidad de los cambios del sistema

**Por qué importa.** Los cambios en producción tienen que poder planificarse y comunicarse antes de aplicarse, como recomiendan las pautas oficiales de seguridad de la información [167] [168].

**EspoCRM** · **2** (cumple)

- *Cómo lo hace.* En la instalación propia la actualización no llega sola: la ejecuta el administrador de la compañía con un comando, cuando decide hacerlo.
- *Características.* El propio fabricante recomienda esperar unos días después de cada versión nueva antes de aplicarla.
- *Justificación.* La compañía elige el momento —fuera del horario de atención, después de probarla— y ningún cambio del sistema la sorprende durante la operación.

> «Command to run:»
>
> — https://docs.espocrm.com/administration/upgrading/, consultado el 30 de octubre de 2026

> «It's recommended to upgrade whenever the new version is out. If you skip a few minor or major versions before deciding to upgrade, it's more likely that the upgrade will run unsmoothly. For minor or major releases it may be reasonable to wait for a few days before upgrading, as a very fresh release is likely to have yet undiscovered bugs.»
>
> — https://docs.espocrm.com/administration/upgrading/, consultado el 30 de octubre de 2026

**Twenty** · **2** (cumple)

- *Cómo lo hace.* En la instalación propia la actualización no llega sola: el administrador de la compañía cambia la versión de la imagen, hace antes la copia de la base que pide el fabricante y reinicia.
- *Características.* Recién al arrancar la versión nueva el servidor aplica sus cambios. Imagen en uso: twentycrm/twenty:latest.
- *Justificación.* La compañía elige el momento —fuera del horario de atención, después de probarla— y ningún cambio del sistema la sorprende durante la operación.

> «Always back up your database before starting the upgrade process»
>
> — https://docs.twenty.com/developers/self-host/capabilities/upgrade-guide, consultado el 30 de octubre de 2026

> «The server runs all required upgrade migrations automatically on startup. No manual command is needed.»
>
> — https://docs.twenty.com/developers/self-host/capabilities/upgrade-guide, consultado el 30 de octubre de 2026

**Bitrix24** · **0** (no cumple)

- *Cómo lo hace.* En un servicio en la nube de versión única, el fabricante decide cuándo cambia el sistema: actualiza el portal de todos sus clientes a la vez, y sus propias condiciones de servicio se reservan el derecho de modificarse sin aviso previo.
- *Justificación.* La compañía no elige el momento del cambio, no lo prueba antes de que llegue a producción y puede encontrarse con una pantalla, un menú o un comportamiento distinto en medio de la atención, sin ninguna anticipación garantizada.

> «1.4. The terms of this Agreement may be updated by Alaio from time to time without notice. In case of the major changes, you will be provided with advance notification of the changes through a prominent notice within the Service and/or by email communication as set forth in section 34. Contact information. Contracting Entity. The amended Terms of Service will take effect upon the date mentioned above on the top of this page, unless otherwise provided in a notification to you. Please check these Terms of Service periodically for changes. Failure to provide or maintain accurate or current contact information by you will not obviate your responsibility to comply with these Terms of Service, as amended from time to time. If you do not agree to any changes to these Terms of Service, you must discontinue using any our services and Products and no longer access the Website. Your continued use of the Website, the Services, and the Products indicates your agreement to the changes. The version of these Terms of Service currently published at https://www.bitrix24.com/terms/ constitutes the binding and governing agreement applicable to all users at any given time.»
>
> — https://www.bitrix24.com/terms/, consultado el 30 de octubre de 2026

### B.2.6 Alojamiento de los datos en un país con protección adecuada

**Por qué importa.** La Ley 25.326 prohíbe transferir datos personales a países sin protección adecuada, y los datos de salud de los seguros de personas son datos sensibles [164] [147] [166].

**EspoCRM** · **2** (cumple)

- *Cómo lo hace.* El sistema y su base de datos corren donde la compañía los instala. En la prueba corren como dos contenedores de un equipo propio, sin que el fabricante intervenga ni reciba los datos; la compañía decide en qué servidor y en qué país los aloja.
- *Características.* El fabricante declara que los datos quedan en el servidor de quien instala el sistema y que su seguridad es responsabilidad de esa compañía. Alojar en un servidor dentro del país elimina la transferencia internacional. Instalación en contenedores tp-espocrm (espocrm/espocrm:10.0.4), tp-espocrm-db (mariadb:11) sobre el equipo «docker-desktop».
- *Justificación.* No hay transferencia de datos a otro país que justificar: el país es el que la compañía elige, y uno argentino cumple la condición de la ley de protección de datos personales.

> «Self-hosted (on-premise) — You install the software and have all the data stored on your own server. All the server maintenance, as well as data security, will be your responsibility.»
>
> — https://www.espocrm.com/self-hosted-vs-cloud-crm/, consultado el 9 de noviembre de 2026

> «Self-hosted (on-premise) — You install the software and have all the data stored on your own server. All the server maintenance, as well as data security, will be your responsibility.»
>
> — https://www.espocrm.com/self-hosted-vs-cloud-crm/, consultado el 9 de noviembre de 2026

**Twenty** · **2** (cumple)

- *Cómo lo hace.* Con la instalación propia, la base de datos y los archivos residen en el servidor donde la compañía instala el sistema. Si lo aloja en Argentina, los datos no salen del país. El fabricante declara que no recoge ni accede a los datos de una instalación propia.
- *Características.* La compañía elige el país de alojamiento. Si decidiera alojarlo en el exterior, la transferencia sería una decisión suya y no del fabricante.
- *Justificación.* No hay un tercero que reciba los datos, así que la compañía puede mantenerlos en un país que le resulte adecuado. La seguridad física y lógica del servidor queda a su cargo.

> «> ## Documentation Index > Fetch the complete documentation index at: https://docs.twenty.com/llms.txt > Use this file to discover all available pages before exploring further. # Self-Host > Deploy and manage Twenty on your own infrastructure. ## Overview Twenty can be self-hosted on your own infrastructure, giving you full control over your data and deployment. ## Why Self-Host? * **Data ownership**: Keep all CRM data on your own servers * **Compliance**: Meet regulatory requirements for data residency * **Customization**: Full access to modify and extend the platform ## Getting Started > [card] > > Docker Compose > Quick setup with Docker > > [Open](https://docs.twenty.com/developers/self-host/capabilities/docker-compose.md) This documentation is built and hosted on [Mintlify](https://mintlify.com), a developer documentation platform.»
>
> — https://docs.twenty.com/developers/self-host/self-host.md, consultado el 10 de noviembre de 2026

> «2. Customer Data (CRM Data): If you are using Twenty’s cloud-based CRM application, you may input or upload personal information about third parties (such as your customers, leads, or contacts) into our Service. This Customer Data may include names, contact details, communications, transaction histories, and other information relevant to customer relationship management. In these cases, you (or your organization) act as the Data Controller for such Customer Data, and Twenty acts as a Data Processor on your behalf. We process this data solely to provide our CRM services to you and in accordance with your instructions. If you use Twenty in a self-hosted environment, we do not collect or have access to the Customer Data in your self-hosted instance; all such data remains under your control on your own servers. (Note: We may collect limited information from self-hosted deployments, such as workspace or user emails for license verification and optional telemetry, but this does not include your customer records. Telemetry is optional and can be disabled by you at any time)»
>
> — https://twenty.com/legal/privacy, consultado el 10 de noviembre de 2026

**Bitrix24** · **0** (no cumple)

- *Cómo lo hace.* El fabricante declara que las cuentas de la zona Bitrix24.es se alojan en Estados Unidos. Ofrece un acuerdo de tratamiento de datos y, para las transferencias fuera de Europa, las cláusulas tipo de la Comisión Europea; no publica las cláusulas contractuales tipo que aprobó la autoridad argentina.
- *Justificación.* La disposición de la autoridad argentina reconoce como países adecuados a la Unión Europea y a un grupo de países, y Estados Unidos no figura. Los datos de la compañía, entre ellos los datos de salud de los seguros de personas, quedarían en un país sin protección adecuada y sin las cláusulas aprobadas para transferirlos. El fabricante reserva el traslado a los centros de datos de la Unión Europea a las cuentas comerciales.
- *Comentario — con Bitrix24 Basic* (US$ 69 por mes, hasta 5 usuarios, abono recurrente) sería **2** (cumple). Con el plan Basic, el más barato de los comerciales, la compañía puede pedir al soporte del fabricante que traslade sus datos a los centros de datos de la Unión Europea, que la autoridad argentina reconoce como país adecuado.

> «Bitrix24.com, Bitrix24.co, Bitrix24.in, Bitrix24.es, Bitrix24.in, Bitrix24.id, Bitrix24.jp, Bitrix24.mx, Bitrix24.vn Bitrix24.com.br, and Bitrix24.cn accounts are hosted in the United States subject to EU-U.S. Data Privacy Framework self-certification.Please note that commercial Bitrix24 account users can request their data to be transferred to the EU data centers via helpdesk - https://helpdesk.bitrix24.com/ticket.php. On-premise Bitrix24 editions are also available for purchase.»
>
> — https://www.bitrix24.com/gdpr/, consultado el 9 de noviembre de 2026

> «Alaio may process User Personal Data outside European Union area subject to appropriate safeguards under article 46 GDPR (specifically by the standard data protection clauses adopted by the European Commission in accordance with the examination procedure).»
>
> — https://www.bitrix24.com/privacy/, consultado el 9 de noviembre de 2026

> «ARTÍCULO 3° — A los fines de la aplicación de la presente disposición se consideran países con legislación adecuada a los siguientes: Estados miembros de la UNIÓN EUROPEA y miembros del espacio económico europeo (EEE), CONFEDERACIÓN SUIZA, GUERNSEY, JERSEY, ISLA DE MAN, ISLAS FEROE, CANADÁ sólo respecto de su sector privado, PRINCIPADO DE ANDORRA, NUEVA ZELANDA, REPÚBLICA ORIENTAL DEL URUGUAY y ESTADO DE ISRAEL sólo respecto de los datos que reciban un tratamiento automatizado.»
>
> — https://www.argentina.gob.ar/normativa/nacional/267922/texto, consultado el 9 de noviembre de 2026

> «Basic desde US$ 69 desde US$ 49 incluye 5 usuarios Empezar Empezar»
>
> — https://www.bitrix24.es/prices/, consultado el 9 de noviembre de 2026

### B.2.7 Continuidad de la atención ante una caída del enlace

**Por qué importa.** Las pautas oficiales de continuidad piden poder seguir operando mientras se restablece un servicio caído [168].

**EspoCRM** · **2** (cumple)

- *Cómo lo hace.* Con la salida a internet cortada y solo la red propia alcanzable, el sistema permite ingresar, buscar un asegurado y registrar un reclamo, que es la atención de todos los días.
- *Características.* La instalación propia no necesita nada de afuera para operar: lo que se pierde durante el corte es lo que por naturaleza viaja por internet, como el envío y la recepción de correo. 0 pedidos a direcciones externas bloqueados durante la prueba.
- *Justificación.* Con el sistema en la red de la compañía, una caída del enlace no detiene la atención.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas B-2-7-espocrm-1-operando-sin-enlace.

**Twenty** · **2** (cumple)

- *Cómo lo hace.* Con la salida a internet cortada, el sistema sigue operando desde la red propia: se ingresa, se busca un asegurado y se registra un reclamo, que es la atención de todos los días.
- *Características.* La instalación propia no necesita nada de afuera para operar: lo que se pierde durante el corte es lo que por naturaleza viaja por internet, como el correo y los logotipos de las empresas que la interfaz trae de un servicio externo. 18 pedidos a direcciones externas bloqueados durante la prueba (twenty-icons.com).
- *Justificación.* Con el sistema en la red de la compañía, una caída del enlace no detiene la atención.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas B-2-7-twenty-1-operando-sin-enlace.

**Bitrix24** · **0** (no cumple)

- *Cómo lo hace.* Con la conexión externa cortada, el portal abierto en el navegador dejó de responder.
- *Características.* El fabricante documenta un modo sin conexión en su aplicación de escritorio para escribir mensajes y trabajar con documentos, que se sincronizan al volver el enlace. No alcanza al CRM. Portal operable sin enlace externo: no.
- *Justificación.* La atención al asegurado depende del CRM, que en la edición evaluada vive entero en la nube del fabricante: mientras dura el corte no se puede atender. Lo que permite el modo sin conexión se envía recién al volver el enlace, así que no sostiene la atención.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas B-2-7-bitrix24-1-sin-enlace.

> «Offline mode. Send messages and work with documents without an internet connection. The data syncs later.»
>
> — https://helpdesk.bitrix24.com/open/23839416/, consultado el 29 de septiembre de 2026

### B.2.8 Atención de los derechos del titular de los datos

**Por qué importa.** La Ley 25.326 da al titular derecho de acceso, rectificación y supresión de sus datos, con plazos de respuesta [164].

**EspoCRM** · **1** (cumple con reparo)

- *Cómo lo hace.* Los datos del asegurado se exportan a una planilla desde el listado de contactos, y los de su póliza desde el de pólizas. El dato se corrige en la ficha. La ventana de datos personales de la ficha permite borrar los campos personales, que quedan reemplazados por una marca de borrado y la ficha subsiste. Cada corrección queda en un registro de acciones —quién, cuándo y qué registro—, que no tiene pantalla propia en la administración; el borrado de datos personales no deja en él una entrada propia.
- *Características.* La exportación admite todos los campos y formato CSV o planilla. El borrado deja la ficha y sus pólizas, con nombre, correo y teléfono reemplazados. El registro de acciones anota quién modificó la ficha y cuándo, sin el valor anterior, y no anota el borrado; el historial de la ficha solo conserva la creación, porque el teléfono no se audita de fábrica. 1 modificación anotada en el registro de acciones (borrado sin anotar); 0 cambios en el historial de la ficha.
- *Justificación.* El pedido se atiende, con una limitación que la compañía asume: no hay una descarga única con todo lo del titular, sino una exportación por cada tipo de registro (el contacto no trae sus pólizas), y la constancia de qué valor cambió, y del borrado, exige marcar los campos como auditados o llevarla aparte.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas B-2-8-espocrm-1-datos-personales, B-2-8-espocrm-2-exportacion-del-asegurado, B-2-8-espocrm-2-borrar-datos, B-2-8-espocrm-4-historial-de-la-ficha.

**Twenty** · **1** (cumple con reparo)

- *Cómo lo hace.* Desde el listado de personas se marca al asegurado y se exporta: el archivo trae sus datos propios. La corrección se hace en la ficha y el historial guarda el valor anterior, el nuevo y quién lo cambió. La supresión se pide desde el listado: la ficha pasa a eliminados y desde ahí se destruye definitivamente. No hay forma de bloquearla en lugar de suprimirla.
- *Características.* La exportación trae los datos del asegurado, no los de sus pólizas y reclamos, que se exportan por separado desde sus propios listados. Al destruir la ficha desaparece también su historial, y las pólizas y reclamos quedan sin titular. No queda ningún registro de que el pedido se atendió.
- *Justificación.* Los tres pedidos se pueden atender, pero la compañía tiene que asumir que reunir todos los datos del titular lleva una exportación por cada tipo de registro, y que la constancia de haber respondido en plazo debe llevarla por fuera del sistema.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas B-2-8-twenty-1-ficha-del-asegurado, B-2-8-twenty-2-menu-con-la-fila-marcada, B-2-8-twenty-3-dato-corregido, B-2-8-twenty-4-ficha-borrada, B-2-8-twenty-6-menu-de-eliminados, B-2-8-twenty-7-destruido.

**Bitrix24** · **1** (cumple con reparo)

- *Cómo lo hace.* La ficha del contacto muestra sus datos en pantalla; el apellido se corrige con «editar» y la ficha se suprime con «Eliminar» en su menú. Exportar el contacto a un archivo pide actualizar el plan, y la pestaña «Historial» de la ficha también.
- *Características.* No hay un bloqueo de la ficha, solo la supresión. Del cambio queda únicamente la fecha de la última modificación y su autor, y de la supresión no queda nada en el sistema.
- *Justificación.* La compañía puede rectificar y suprimir, pero tiene que armar a mano la respuesta de acceso —leer la ficha y las negociaciones una por una— y llevar por su cuenta el registro de cada pedido y de su fecha, porque el sistema no deja constancia ni de la corrección ni de la baja. Es una limitación que la compañía debe asumir.
- *Comentario — con Bitrix24 Standard* (US$ 144 por mes, hasta 50 usuarios, abono recurrente) sería **2** (cumple). El plan Standard suma el historial de CRM, que registra los cambios de campos y las exportaciones, y la exportación de contactos a CSV o Excel que el plan Basic ya incluye: la compañía obtiene los datos de una vez y conserva constancia de cada corrección. Es el primer plan que resuelve las dos cosas.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas B-2-8-bitrix24-1-ficha-del-asegurado, B-2-8-bitrix24-2-exportar-pide-plan, B-2-8-bitrix24-3-historial-pide-plan, B-2-8-bitrix24-4-confirmar-supresion, B-2-8-bitrix24-5-tras-suprimir.

> «The CRM history logs key changes to CRM items, such as exporting contacts or updating field values. Use it to track activity related to clients and deals.»
>
> — https://helpdesk.bitrix24.com/open/25803275/, consultado el 9 de noviembre de 2026

> «Opción para exportar contactos a CSV, Excel y Outlook»
>
> — https://www.bitrix24.es/prices/compare_cloud_plans.php, consultado el 9 de noviembre de 2026

> «US$ 144»
>
> — https://www.bitrix24.es/prices/, consultado el 9 de noviembre de 2026

### B.2.9 Baja de las comunicaciones comerciales por medio

**Por qué importa.** La Ley 25.326 permite al titular pedir en cualquier momento que no se le envíe publicidad, por todos los medios o por uno solo [164] [165].

**EspoCRM** · **2** (cumple)

- *Cómo lo hace.* Se marca el correo del asegurado como dado de baja en su ficha. Al enviar una campaña a una lista que lo incluye, el sistema no le manda el mensaje y sí lo manda al otro asegurado de la lista.
- *Características.* La exclusión rige para todas las campañas y listas. Los mensajes de campaña llevan un enlace de baja que, al usarlo el asegurado, marca su correo como dado de baja sin intervención de nadie. GreenMail: 1 mensaje al asegurado vigente y 0 al dado de baja; enlace de baja: sí.
- *Justificación.* Viene de fábrica: no requiere configurar nada para que la baja se respete, que es lo que la ley exige para cualquier medio de publicidad.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas B-2-9-espocrm-1-asegurado-dado-de-baja, B-2-9-espocrm-2-resultado-de-la-campana.

**Twenty** · **1** (cumple con reparo)

- *Cómo lo hace.* La ficha no trae dónde registrar la baja: se agrega un campo de verdadero o falso, que viene en verdadero. Para dar de baja a un asegurado se pasa a falso en su ficha. El segmento de la campaña se arma con un filtro por ese campo, y entonces el asegurado dado de baja no figura entre los destinatarios.
- *Características.* La baja es un dato del asegurado, sin fecha ni medio de contacto, y no se aplica al enviar: el listado completo sigue incluyendo al dado de baja, así que quien lance una campaña sobre él lo alcanza. Los envíos masivos con baja del destinatario están en una función de campañas todavía en prueba.
- *Justificación.* La compañía puede registrar la baja y excluirla del segmento, pero debe asumir que la exclusión depende de que cada campaña se arme sobre la vista filtrada. No se completó el envío de prueba hasta el buzón porque exige cambiar una variable de seguridad del servidor.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas B-2-9-twenty-1-ficha-sin-campo-de-baja, B-2-9-twenty-2-asegurado-dado-de-baja, B-2-9-twenty-3-segmento-completo, B-2-9-twenty-4-segmento-filtrado.

> «Campaigns come from an address on your domain, so people know who sent them. Twenty walks you through domain verification and puts the unsubscribe page on your domain too.»
>
> — https://docs.twenty.com/user-guide/email-campaigns/overview, consultado el 10 de noviembre de 2026

**Bitrix24** · **0** (no cumple)

- *Cómo lo hace.* La ficha del contacto no ofrece ningún campo para registrar que no quiere recibir correos comerciales. La campaña de correo electrónico, desde Marketing, pide el plan Standard o el Professional.
- *Justificación.* La compañía no puede registrar la baja de un asegurado en el sistema ni enviar una campaña que la respete: tendría que llevar la lista de bajas fuera del sistema y excluir a esas personas a mano de cualquier envío.
- *Comentario — con Bitrix24 Standard* (US$ 144 por mes, hasta 50 usuarios, abono recurrente) sería **1** (cumple con reparo). Con el plan Standard, el de entrada para el correo masivo, cada campaña lleva obligatoriamente un enlace de baja. Esa baja la hace el destinatario desde el correo recibido; el fabricante no publica una marca en la ficha del contacto para decidir por medio, y no se comprobó el envío porque exige el plan.
- *Evidencia.* Prueba sobre el sistema, con video y las capturas B-2-9-bitrix24-1-campos-del-contacto, B-2-9-bitrix24-2-campana-de-correo.

> «Every email campaign must include a clear unsubscribe option.»
>
> — https://helpdesk.bitrix24.com/open/14294110/, consultado el 9 de noviembre de 2026

> «US$ 144»
>
> — https://www.bitrix24.es/prices/, consultado el 9 de noviembre de 2026

### B.2.10 Evolución sostenida del producto

**Por qué importa.** La cartera de pólizas se administra durante años: el sistema tiene que seguir mejorando y tener un fabricante que lo sostenga en ese plazo.

| 2 | 1 | 0 |
|---|---|---|
| Agrega funciones a lo largo de todo el año, y el fabricante ya sostuvo el producto a través de varias versiones mayores | Cumple solo una de las dos: agrega funciones pero el producto todavía no tiene trayectoria, o tiene trayectoria pero casi no agrega funciones | No agrega funciones y no tiene trayectoria que lo respalde |

**EspoCRM** · **2** (cumple)

- *Cómo lo hace.* Las notas de versión oficiales listan, versión por versión, las funciones agregadas. En el último año 30 versiones publicadas, de las cuales 5 trajeron funciones o mejoras (10.1, 10.0, 9.3 y alguna corrección con mejoras menores). El fabricante publicó la primera versión en 2014.
- *Características.* Cada versión mayor o menor trae funciones propias —varios embudos, servidor de autorización, bloqueo de registros, especificación de la interfaz— y entre ellas se publican correcciones. 30 versiones publicadas entre 11/11/2025 y 10/11/2026; 5 con funciones o mejoras (10.1.0, 10.0.8, 10.0.5, 10.0.0, 9.3.0); repositorio público creado el 2014-09-25.
- *Justificación.* Las funciones llegan repartidas en el año, no concentradas en un solo lanzamiento, y el producto lleva más de once años mantenido por el mismo fabricante a través de diez versiones mayores: cubre las dos condiciones de la escala.

> «OAuth 2.0 server #3782»
>
> — https://github.com/espocrm/espocrm/releases/tag/10.1.0, consultado el 10 de noviembre de 2026

> «Multiple pipelines #3623»
>
> — https://github.com/espocrm/espocrm/releases/tag/10.0.0, consultado el 10 de noviembre de 2026

> «OpenAPI specification generation #3535»
>
> — https://github.com/espocrm/espocrm/releases/tag/9.3.0, consultado el 10 de noviembre de 2026

> «Since 2011, our company helps businesses to develop faster and succeed. In 2014, we released EspoCRM, a platform that solves simple and tough challenges a company faces at each stage of its lifecycle, from basic customer relationship management to complex business process automation. Now, EspoCRM is a technology that is focused on putting customers at the heart of your business and accelerating your company’s growth.»
>
> — https://www.espocrm.com/about-us/, consultado el 10 de noviembre de 2026

**Twenty** · **2** (cumple)

- *Cómo lo hace.* La página oficial de novedades tiene 48 entradas con fecha dentro del último año, cada una con las funciones que agrega. En GitHub, 69 versiones del producto en 67 líneas (de la 1.11 a la 2.57), 28 de ellas con una sección de funciones nuevas. El repositorio público se creó el 2022-12-01.
- *Características.* Las notas describen cada función con lenguaje de usuario y con la fecha de la versión. En el año salió la versión 2.0, que reorganizó el producto como plataforma para construir aplicaciones, después de la 1.0 del año anterior. 48 entradas de novedades con fecha entre 11/11/2025 y 10/11/2026; 69 versiones del producto en GitHub (67 líneas x.y), 28 con sección de funciones nuevas; repositorio creado el 2022-12-01.
- *Justificación.* Agrega funciones durante todo el año, con un ritmo muy superior al de los otros dos productos, y lleva casi cuatro años de trayectoria pública con dos versiones mayores sostenidas (1.0 y 2.0). La trayectoria es la más corta de las tres plataformas, pero ya incluye más de una versión mayor, que es lo que pide la escala.

> «Edit field values in place»
>
> — https://twenty.com/releases, consultado el 10 de noviembre de 2026

> «Your workspace is backed by a git repo, so you can branch, review in pull requests, and roll back changes the same way you ship code.»
>
> — https://twenty.com/releases, consultado el 10 de noviembre de 2026

> «Create and manage custom roles. Grant or revoke access for each object to Read/Create/Edit/Delete records. Give granular access to settings like the ability to manage users, data models or APIs.»
>
> — https://twenty.com/releases, consultado el 10 de noviembre de 2026

> «Developers can now use webhooks to synchronize customer data updates in real-time across applications.»
>
> — https://twenty.com/releases, consultado el 10 de noviembre de 2026

**Bitrix24** · **2** (cumple)

- *Cómo lo hace.* La ayuda oficial conserva 8 notas de novedades de 2026 (October 2026, September 2026, August 2026, June 2026, Bitrix24 Vibe, April 2026, March 2026, February 2026), con 29 funciones o mejoras anunciadas, incluido el lanzamiento mayor «Bitrix24 Vibe». El producto salió al público en abril de 2012.
- *Características.* Las notas describen cada función con lenguaje de usuario y una guía. El fabricante no numera sus versiones: publica novedades por mes y lanzamientos estacionales. 8 notas de novedades (What's new? October 2026; What's new? September 2026; What's new? August 2026; What's new? June 2026; Bitrix24 Vibe; What's new? April 2026; What's new? March 2026; What's new? February 2026); 29 funciones anunciadas; producto público desde abril de 2012.
- *Justificación.* Agrega funciones casi todos los meses y lleva catorce años en el mercado. El archivo de notas que conserva la ayuda arranca en febrero de 2026, así que el conteo no cubre noviembre a enero; la trayectoria sí cumple la segunda condición de la escala.

> «A brief overview of the most important updates from the past month.»
>
> — https://helpdesk.bitrix24.com/open/25907955/, consultado el 10 de noviembre de 2026

> «We are pleased to present the new features of Bitrix24 Vibe release.»
>
> — https://helpdesk.bitrix24.com/open/25971891/, consultado el 10 de noviembre de 2026

> «Alaio Vibecode is a platform for building AI-powered solutions for Bitrix24.»
>
> — https://helpdesk.bitrix24.com/open/26062415/, consultado el 10 de noviembre de 2026

> «A year or so later, we thought “Hey, we have this really great CRM we’re offering to our clients - why not marry it with the online collaboration platform we’re using inside the company?”. The idea took off and the initial beta-testing showed very promising results, which inspired us to commit to the product full-time and finally release it to the public in April of 2012.»
>
> — https://www.bitrix24.com/about/, consultado el 10 de noviembre de 2026

### B.2.11 Mejoras incluidas en la versión gratuita

**Por qué importa.** Que el sistema mejore sin que cada mejora se convierta en un costo nuevo para la compañía.

| 2 | 1 | 0 |
|---|---|---|
| La mayoría de las funciones nuevas llega a la versión gratuita | Llegan algunas, pero las principales quedan en un plan o una extensión paga | Casi todas las funciones nuevas quedan en un plan o una extensión paga |

**EspoCRM** · **1** (cumple con reparo)

- *Cómo lo hace.* Las notas del producto base listan 48 funciones y mejoras del último año, todas disponibles en la versión evaluada. Las extensiones pagas publican sus propias notas, con unos 74 renglones de novedades en el mismo período: reportes y procesos (Advanced Pack), facturación y suscripciones (Sales Pack), asistente de inteligencia artificial (Intelligence) e integraciones con el correo y las reuniones.
- *Características.* Del producto base llegan varios embudos por entidad, bloqueo de registros, servidor de autorización y agrupación de notificaciones. Quedan en extensión paga las mejoras de reportes, procesos, facturación e inteligencia artificial. Producto base: 48 funciones y mejoras en las notas. Extensiones pagas con versiones en el período: advanced-pack: 3 versiones (3.14.0, 3.13.0, 3.12.0); sales-pack: 5 versiones (4.4.0, 4.3.0, 4.2.0, 4.1.0, 4.0.0); intelligence: 3 versiones (1.2.0, 1.1.0, 1.0.0); outlook-integration: 2 versiones (1.8.0, 1.7.0); zoom-integration: 1 versiones (1.1.0); unos 74 renglones de novedades (cuenta aproximada de líneas de las notas).
- *Justificación.* Las funciones que la compañía más usa para cobrar y reportar mejoran en extensiones pagas, que la versión evaluada no trae; el producto base también mejora, pero parte importante del avance del año queda fuera de él. Por eso llegan algunas, no la mayoría.
- *Comentario — con EspoCRM Cloud Basic* (US$ 15 por usuario por mes, mínimo 3 usuarios, abono recurrente) sería **2** (cumple). El plan de entrada del servicio en la nube trae todas las extensiones del fabricante, de modo que las funciones nuevas de ambos lados llegan juntas. Las licencias sueltas de cada extensión cubren solo una parte.

> «Job processing with workers, RabbitMQ implementation #3724»
>
> — https://github.com/espocrm/espocrm/releases/tag/10.1.0, consultado el 10 de noviembre de 2026

> «Non-aggregated columns in Grid report export.»
>
> — https://www.espocrm.com/extensions/advanced-pack/release-notes, consultado el 10 de noviembre de 2026

> «Tax-inclusive pricing.»
>
> — https://www.espocrm.com/extensions/sales-pack/release-notes, consultado el 10 de noviembre de 2026

> «Basic $15.00 per user/month minimum 3 users 3GB file storage per user 100,000 records SSL Encryption (256 bit keys, TLS 1.3) Full feature set All extensions included External access API 2000+ integrations * 12x5 (hours/days) support Sign Up Free Trial Free Trial is provided for 30 days»
>
> — https://www.espocrm.com/cloud/, consultado el 10 de noviembre de 2026

**Twenty** · **2** (cumple)

- *Cómo lo hace.* Las notas de GitHub del último año listan 358 funciones nuevas, y 18 nombran una función del plan Organization o su licencia. El fabricante declara qué es premium: roles propios, permisos por registro, acceso unificado, registro de auditoría y límites de uso. Todo lo demás —paneles, flujos, agentes, editor de notas, importación— viene en la gratuita.
- *Características.* Las notas de versión no marcan función por función qué plan la trae: se la identifica contra la lista de funciones premium del fabricante. Las novedades de chat, flujos, paneles y correo se prueban en la instalación propia sin licencia. 358 funciones nuevas en las secciones «New features» de 28 versiones; 18 nombran funciones premium (twenty/v2.53.1, twenty/v2.48.0, twenty/v2.47.0, twenty/v2.46.0, twenty/v2.43.0, twenty/v2.43.0, twenty/v2.43.0, twenty/v2.43.0, twenty/v2.43.0, twenty/v2.43.0, twenty/v2.43.0, twenty/v2.41.0, twenty/v2.41.0, twenty/v2.41.0, twenty/v2.40.0, twenty/v2.40.0, twenty/v2.40.0, twenty/v2.39.0). Criterio de clasificación: coincidencia con la lista premium del fabricante.
- *Justificación.* La proporción de novedades que depende del plan pago es mínima y se concentra en funciones de seguridad que esta compañía no necesita para comenzar; el producto evoluciona sin que cada mejora sea un costo nuevo. En el año el fabricante además pasó a la licencia paga la compartición de registros y las reglas de validación, lo que reduce un poco lo gratuito.

> «Premium features are only available on the Organization plans (Cloud or Self-Hosted):»
>
> — https://docs.twenty.com/user-guide/billing/capabilities/pricing-plans, consultado el 10 de noviembre de 2026

> «Premium features: custom roles, row-level permissions, SSO and more»
>
> — https://docs.twenty.com/user-guide/billing/capabilities/pricing-plans, consultado el 10 de noviembre de 2026

> «Recovery codes for two-factor authentication»
>
> — https://twenty.com/releases, consultado el 10 de noviembre de 2026

**Bitrix24** · **1** (cumple con reparo)

- *Cómo lo hace.* De las 29 funciones anunciadas en las 8 notas del año, 8 corresponden a capacidades que la tabla de planes del fabricante marca como no incluidas en la gratuita (BI Analytics, Vibecode app builder, E-signature, AI call analysis & scripts), 4 a capacidades incluidas (mensajería) y 17 no tienen fila propia en esa tabla.
- *Características.* Quedan en planes pagos el análisis con BI Builder (anunciado en cinco notas), la inteligencia artificial de llamadas, la firma electrónica y el constructor Vibecode, exclusivo de la familia Vibe+. Llegan a la gratuita las mejoras de mensajería: invitados al chat, carpetas personales y filtros de no leídos. 29 funciones anunciadas: 8 no incluidas en la gratuita (BI Builder: dashboard period from a filter [What's new? October 2026]; Alaio Vibecode [What's new? September 2026]; BI Builder: Use external MySQL and PostgreSQL databases [What's new? June 2026]; Document editor in e-Signature for HR [Bitrix24 Vibe]; BI Builder [Bitrix24 Vibe]; CoPilot in CRM [Bitrix24 Vibe]; BI Builder: time zone and report language [What's new? April 2026]; BI Builder datasets: inventory management [What's new? February 2026]); 4 incluidas; 17 sin fila en la tabla de planes.
- *Justificación.* Las novedades que el fabricante destaca como las del año —inteligencia artificial, análisis y construcción de aplicaciones— quedan en planes pagos, mientras que las de mensajería llegan a la gratuita. La clasificación toma solo las funciones que la tabla de planes permite ubicar; las demás se cuentan aparte y no se asumen gratuitas ni pagas.
- *Comentario — con Bitrix24 Professional* (US$ 289 por mes, hasta 100 usuarios, abono recurrente) sería **2** (cumple). El plan Standard suma el análisis con BI Builder y la inteligencia artificial de llamadas, pero no la firma electrónica; con Professional llegan también la firma electrónica y el diseñador de flujos con inteligencia artificial. Vibecode exige además un plan de la familia Vibe+.

> «Vibe+ exclusive features Vibecode app builder Create custom apps for your Bitrix24 by simply asking AI what you want to achieve. No coding skills required AI in CRM, tasks, etc. AI-powered deal autocompletion, call transcription, voice-to-task automation, and more. Limited Limited Limited Limited Limited Limited Unlimited Unlimited Unlimited REST API Connect your Bitrix24 securely to external tools that your business relies on Unlimited Unlimited Unlimited Unlimited MCP server Integrate your Bitrix24 with external AI tools for more versatility Bitrix24 Market Get access to 750+ apps, extensions, and integrations developed by our Partners 2 apps 4 apps 7 apps 10 apps Unlimited apps Unlimited apps Unlimited apps Unlimited apps»
>
> — https://www.bitrix24.com/prices/, consultado el 10 de noviembre de 2026

> «Create custom apps for your Bitrix24 by simply asking AI what you want to achieve. No coding skills required»
>
> — https://www.bitrix24.com/prices/, consultado el 10 de noviembre de 2026

> «Set the report period in BI Builder using a filter: Open the dashboard for the period you need without additional setup.»
>
> — https://helpdesk.bitrix24.com/open/26086059/, consultado el 10 de noviembre de 2026

> «Professional desde US$ 289 desde US$ 199 incluye 100 usuarios Empezar Empezar»
>
> — https://www.bitrix24.es/prices/, consultado el 10 de noviembre de 2026
