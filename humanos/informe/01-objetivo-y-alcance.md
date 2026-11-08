# 1. Objetivo y alcance

El informe evalúa tres plataformas CRM sobre los requerimientos de una compañía de seguros y propone cuál se adecúa mejor a ese negocio. Cada característica se enuncia como algo que conviene tener, para que en cada plataforma haya una respuesta clara.

Las tres plataformas se instalaron o se dieron de alta, se configuraron y se operaron. Cada veredicto se apoya en una comprobación propia sobre el sistema en funcionamiento, no en la documentación comercial del fabricante. Donde no fue posible comprobarlo, el informe lo declara.

## 1.1 Qué queda fuera del alcance

El análisis de costos queda afuera. El informe evalúa qué cubre cada plataforma, no cuánto cuesta sostenerla. Los precios de lista de los planes pagos se informan como dato, junto a lo que agrega cada uno, pero no se proyecta un costo total ni entra en el resultado.

Tampoco se trata la migración desde un sistema preexistente. Se evalúa la capacidad de importar datos, no el proyecto de migración, que depende del sistema de origen y excede el análisis de producto.

Por último, no se dimensiona para una aseguradora grande. La evidencia sobre volumen se tomó con una cartera de referencia de veinticinco mil registros, unas quince veces la de la compañía (sección 4.7). Una compañía con millones de pólizas exige un análisis de infraestructura que este informe no aborda.

## 1.2 Qué se evalúa de cada plataforma

La evaluación se hace sobre **una versión concreta de cada plataforma** (EspoCRM Community, Twenty autoalojado y el plan gratuito de Bitrix24) y solo cuenta lo que esa versión trae. Funciona como una auditoría: que la versión resuelve una necesidad se demuestra operándola; si no se pudo demostrar, no se da por cubierta.

Lo que agregaría un plan superior o un módulo pago se informa como comentario junto al criterio que mejoraría, con el plan que lo incluye y su precio, pero no suma al puntaje.

## 1.3 El negocio asegurador

El sector atraviesa una situación competitiva particular. Los bancos ingresaron al negocio y proliferaron las plataformas de comparación en línea, lo que trasladó la prioridad de las aseguradoras hacia la captación y la retención. En ese contexto la calidad del vínculo con el asegurado pasa a ser el factor competitivo central, y de ahí que el cliente haya definido sus requerimientos alrededor de conocer mejor al asegurado y retenerlo.

La operación diaria involucra tres actores y un objeto de negocio. El **asegurado** contrata una cobertura, el **productor o corredor** la vende y atiende la cartera, y la **compañía** administra el conjunto. El objeto que los vincula es la **póliza**: el contrato con su tipo de cobertura, su vigencia, su prima y su estado de cobranza.

La compañía atiende alrededor de quinientos clientes. Las cifras contra las que se mide el volumen (sección 4.7) se fijan por encima de ese tamaño, para que el resultado siga valiendo cuando la cartera crezca.

## 1.4 Qué cubre un CRM

Un sistema de gestión de la relación con el cliente reúne en un solo lugar todo lo que la compañía sabe de cada cliente y de cada contacto que tuvo con él, de modo que cualquier área lo vea completo: es la **visión integral del cliente**. Cada contacto (una consulta, una cotización, un reclamo, un mensaje por una red social) es información que debería quedar registrada, administrada y compartida, para que el cliente no tenga que volver a explicar lo que ya contó.

Esa relación atraviesa tres etapas, y el sistema tiene que acompañar las tres:

- **Preventa.** Lo que ocurre antes de que el cliente contrate: interesados, cotizaciones, llamadas y campañas. Es la etapa de mayor volumen, que se va depurando (el embudo) hasta convertirse en venta.
- **Venta.** La emisión de la póliza, su forma de pago y su cobranza. Es la etapa que más se cruza con el sistema central de la compañía: el CRM refleja lo que ese sistema decide, sin duplicarlo ni contradecirlo.
- **Postventa.** La atención de reclamos, la renovación y la fidelización. Es la etapa que sostiene la cartera: el asegurado que encuentra respaldo es el que renueva.

Las tres forman un proceso continuo: quien atiende un reclamo necesita saber cómo fue la venta. Por eso, para una aseguradora, un sistema administrativo con un módulo comercial básico no alcanza.

Los criterios de la sección 4 cubren las tres etapas: la preventa en la captación y el marketing (grupos A.2 y A.4), la venta en la cartera de pólizas, el embudo y la emisión y cobranza (A.1, A.2 y A.12), y la postventa en la atención, la ficha única y la continuidad de la relación (A.5, A.6 y A.12).

## 1.5 Origen de las características evaluadas

Las características provienen de tres fuentes: los veinte requerimientos del pedido del cliente, que entran todos; los trece criterios técnicos de evaluación de software, leídos en clave del rubro; y las condiciones que impone el negocio asegurador, como la persistencia de pólizas que duran décadas o el resguardo de datos de salud. A ellas se suman, con menor peso, capacidades que ninguna fuente pide pero que distinguen a las plataformas. La sección 4 detalla cada fuente y sus criterios.
