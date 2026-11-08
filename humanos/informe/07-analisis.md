# 7. Análisis de los resultados

Cada afirmación de esta sección remite al criterio que la sostiene; la justificación de cada valor está en la sección 6.

## 7.1 Cómo se lee la matriz

Cada fila de la matriz de la sección 5 es una necesidad de la compañía, y cada columna, una plataforma en la versión elegida. El círculo lleno (●) indica que la plataforma resuelve la necesidad, el medio círculo (◐) que la resuelve con un trabajo o una salvedad que la compañía va a cargar todos los días, y el círculo vacío (○) que la versión evaluada no la resuelve. La flecha (↑) avisa que un plan pago del fabricante mejoraría ese valor, como dato para la decisión y sin sumar puntos. Conviene mirar primero el subtotal de cada grupo, que muestra en qué funciones del negocio se separan las plataformas.

Tres términos aparecen seguido más abajo. Una **entidad** es un tipo de registro propio del sistema, como Póliza o Reclamo; un **flujo** es una automatización que se arma desde la pantalla, sin programar; un **guion** es un programa corto que tiene que escribir alguien con conocimientos técnicos.

## 7.2 El panorama general

EspoCRM y Twenty resuelven más de ocho de cada diez necesidades que planteó la compañía, con un punto y medio de diferencia entre ellas. Bitrix24, en su plan gratuito, cubre seis de cada diez. Las dos primeras llegan a un puntaje parecido por caminos distintos, y cada una deja sin resolver cosas diferentes.

En varios grupos las tres se comportan parecido. La actividad de los productores (A.3) queda resuelta en las tres, con diferencias menores; la ficha única del asegurado (A.6) también, salvo que Bitrix24 gratuito no advierte cuando se carga dos veces al mismo asegurado (A.6.4). Además, las tres cumplen en operación concurrente, cantidad de usuarios y material de capacitación (A.11.7, A.11.8, A.11.11). Sobre usuarios hay un matiz. En las dos que se instalan, cuántos trabajan a la vez lo limita solo el servidor de la compañía; en Bitrix24 lo fija el proveedor. Su plan gratuito no tiene tope, pero cada plan pago sí (cinco usuarios el Basic, cincuenta el Standard, cien el Professional), así que contratar una función obliga a elegir el plan también por el tamaño del plantel.

EspoCRM y Twenty resuelven todo el ciclo de venta y postventa (A.12). Emiten la póliza al cerrar la venta, registran su plan de pago, reciben lo que decide el sistema central, conservan la historia desde el primer contacto y registran la satisfacción. En las dos se configura una vez, aunque en EspoCRM emitir la póliza automáticamente exige un guion (A.12.1), y ninguna envía sola la encuesta de satisfacción (A.12.5). Bitrix24 resuelve este ciclo a medias: emite la póliza sin el asegurado, que se vincula a mano (A.12.1), las cuotas son negociaciones sueltas que hay que filtrar en cada uso (A.12.2) y el sistema central no puede actualizar pólizas (A.12.3).

Tres necesidades no las resuelve bien ninguna, y no se arreglan cambiando de plataforma:

- **Seguimiento de menciones en redes** (A.4.5). Ninguna lo trae como función propia; Bitrix24 ofrece una aproximación.
- **Soporte con plazo de respuesta comprometido** (A.11.13). Ninguna versión gratuita lo incluye, y quien lo necesite tiene que contratarlo.
- **Continuidad de las versiones** (A.11.14). Ningún fabricante publica por cuánto tiempo corrige una versión, de modo que la compañía va a actualizar al ritmo que fije cada uno.

## 7.3 Dónde se diferencian

### Entre EspoCRM y Twenty

Las dos son instalaciones propias, gratuitas y completas, con las mismas cargas de infraestructura. Lo que las separa se concentra en pocos grupos:

| Necesidad | EspoCRM | Twenty | Qué significa para la compañía |
|---|:---:|:---:|---|
| Que cada productor vea solo su cartera (A.9.1) | ● | ○↑ | En Twenty gratuito todos ven todo; restringirlo exige el plan Organization |
| Avisos automáticos de vencimiento (A.1.5) | ◐↑ | ● | En EspoCRM gratuito alguien consulta el listado cada día |
| Informe con totales por productor (A.10.2) | ◐↑ | ◐ | En las dos, el total para usar fuera del sistema se arma en una planilla |
| Informe que se reutiliza para otro período (A.10.3) | ◐↑ | ● | Twenty lo guarda y lo recalcula cambiando la fecha |
| Campañas y su medición (A.4.2, A.4.3) | ● | ◐ | Twenty las arma con un flujo y no reúne sus resultados |
| Reclamo como caso propio (A.5.1) | ● | ◐ | En Twenty el número del reclamo se asigna a mano |
| Aprendizaje sin capacitación (A.11.5) | ● | ◐ | En EspoCRM los usuarios nuevos completaron todo |
| Documentación en español (A.11.10) | ◐ | ● | La de EspoCRM está solo en inglés |

La diferencia más sensible para una aseguradora es la primera. Si un productor puede abrir la cartera de otro, la información comercial de la compañía queda al alcance de quien no debe verla, y en Twenty gratuito eso no se puede impedir (A.9.1).

En EspoCRM, en cambio, lo que falta (avisos automáticos e informes con totales) se resuelve con una sola extensión, el Advanced Pack, que cuesta US$ 395 por año (A.1.5, A.10.2, A.10.3).

### Bitrix24 frente a las otras dos

Bitrix24 es un servicio en la nube y no exige ninguna infraestructura. En lo técnico es la que menos le pide a la compañía, porque no hay nada que instalar ni que mantener (A.11.1, A.11.3), y es la única con aplicación móvil oficial (B.2.2). Su plan gratuito, sin embargo, deja afuera varias de las cosas que una aseguradora más necesita:

- La póliza no puede tener entidad propia (A.1.1) y queda registrada como negociación, mezclada con las oportunidades de venta.
- No restringe la cartera por productor ni registra quién cambió cada dato (A.9.1, A.9.3). El grupo de control de acceso es el más bajo de toda la matriz.
- No conecta el correo ni exporta la cartera (A.7.3, A.7.4, A.7.6), así que lo cargado no se puede sacar del sistema sin pagar.
- Guarda dos veces al mismo asegurado sin advertirlo, y la herramienta que busca y fusiona duplicados exige un plan superior (A.6.4).
- No permite crear entidades (A.8.1), lo que limita cualquier adaptación al negocio.
- Deja de buscar y filtrar en un listado cuando pasa de mil registros, tanto en las negociaciones como en los contactos (B.1.4). Como en el plan gratuito las pólizas y los reclamos son negociaciones, la cartera de la compañía supera ese tope en pocos años.

Dos condiciones del servicio gratuito afectan la permanencia de los datos. El fabricante puede dar de baja la cuenta, con sus datos, después de cincuenta días sin uso (B.1.1), y aplica los cambios del sistema cuando decide (B.1.5). Para una cartera de pólizas que dura años, las dos son un riesgo.

Casi todo lo que le falta se resuelve contratando. La sección 5.5 muestra que, con los planes que mejoran algún criterio, Bitrix24 se acercaría a las otras dos sin alcanzarlas. Varias de esas capacidades exigen el plan Professional, y el abono es por organización y crece con el tamaño de la compañía.

## 7.4 Cuánto pesa cada diferencia en el puntaje

El puntaje resume, pero no decide. La distancia entre EspoCRM y Twenty es menor que el peso de un solo grupo. Si la compañía considera imprescindible restringir la cartera por productor, EspoCRM queda primera sin discusión; si puede trabajar sin esa restricción y valora los avisos automáticos y los informes reutilizables sin pagar extensiones, le conviene Twenty. Ninguna de las dos lecturas sale del promedio, sino de mirar los grupos.

Los opcionales mueven poco el resultado. En las capacidades que nadie pidió, Twenty y Bitrix24 suman más que EspoCRM, como la videollamada integrada y, en Bitrix24, la aplicación móvil (B.2), pero los opcionales pesan el 15 % y no compensan una necesidad original sin resolver.

La infraestructura pesa más de lo que muestra la matriz. EspoCRM y Twenty obtienen medio círculo en recursos y puesta en marcha (A.11.1, A.11.3), y detrás de ese reparo hay un trabajo permanente: alguien tiene que instalarlas, mantener el servidor y hacer las copias. Bitrix24 no tiene ese costo.

## 7.5 Cada plataforma en síntesis

### EspoCRM

Es la que resuelve más necesidades originales con su versión gratuita. Tiene el control de acceso más completo, con cartera por productor, historial de cambios y políticas de contraseña (A.9), la mejor gestión de reclamos (A.5) y campañas de correo con su medición (A.4.2, A.4.3). Los usuarios nuevos la aprendieron sin ayuda (A.11.5).

En contra, sin el Advanced Pack no emite avisos solos ni arma informes con totales (A.1.5, A.10.2, A.10.3), y su documentación está en inglés (A.11.10). No trae asistente de inteligencia artificial ni aplicación móvil (B.2.1, B.2.2). Exige un servidor propio y alguien que lo administre.

### Twenty

Es la más moderna de las tres y la que menos reserva para los planes pagos: los avisos automáticos y los informes reutilizables vienen en la versión gratuita (A.1.5, A.10.3). La cartera de pólizas y la ficha del asegurado quedan resueltas por completo (A.1, A.6), y la documentación está en español (A.11.10).

Su punto débil es que no restringe la cartera por productor sin pagar el plan Organization (A.9.1), la falta más delicada para una aseguradora. No trae campañas de correo propias (A.4.2, A.4.3) y el reclamo no tiene numeración propia (A.5.1). Como EspoCRM, exige un servidor propio, y además publica versiones nuevas a un ritmo muy alto que obliga a actualizar seguido (A.11.14).

### Bitrix24

No exige infraestructura ni conocimientos técnicos para ponerla en marcha (A.11.1, A.11.3). Es la única con aplicación móvil oficial (B.2.2), importa la cartera desde una planilla con tildes y eñes intactas (A.7.1) y reúne mensajería, tareas, documentos y videollamada en la misma cuenta. La telefonía y la firma electrónica quedan para los planes pagos (B.2.3, B.2.4).

En contra, su plan gratuito no da entidad propia a la póliza (A.1.1), no restringe la cartera por productor ni registra los cambios (A.9.1, A.9.3), no conecta el correo ni exporta la cartera (A.7.3, A.7.4, A.7.6) y puede dar de baja la cuenta tras cincuenta días sin uso (B.1.1). Casi todo eso se resuelve pagando, pero entonces deja de ser la alternativa gratuita.
