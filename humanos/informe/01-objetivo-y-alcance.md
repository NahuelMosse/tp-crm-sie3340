# 1. Objetivo y alcance

El informe evalúa tres plataformas CRM sobre los requerimientos de una compañía de seguros y propone cuál se adecúa mejor a ese negocio. La compañía atiende alrededor de quinientos clientes.

## 1.1 Qué queda fuera del alcance

El análisis de costos queda afuera: los precios de lista de los planes pagos se informan como dato, sin proyectar un costo total ni sumarlos al resultado.

Tampoco se trata la migración desde un sistema preexistente, que depende del sistema de origen; se evalúa la capacidad de importar datos.

## 1.2 Cómo leer este informe

Cada requerimiento lleva un código. La letra indica la parte: **A** reúne lo que pidió la compañía y **B**, lo que el análisis agrega por el negocio asegurador. El primer número es el grupo y el segundo, el criterio dentro del grupo: A.9 es el grupo de control de acceso y A.9.1, que cada productor vea solo su cartera. Cada criterio recibe uno de tres valores: ● cumple, ◐ cumple con reparo, ○ no cumple. Junto a cada valor se indica su respaldo: «(prueba)» si se comprobó operando el sistema, con video y capturas, y entre corchetes el número de la fuente oficial de la sección 9.

Algunos términos aparecen seguido:

- **Entidad:** un tipo de registro del sistema, como Póliza o Reclamo.
- **Flujo:** una automatización que se arma desde la pantalla, sin programar.
- **Guion:** un programa corto que tiene que escribir alguien con conocimientos técnicos.
- **Interfaz de programación:** la vía por la que otro sistema de la compañía lee y carga datos sin intervención de un usuario.
- **Contenedores:** la forma estándar de instalar estos sistemas en un servidor propio; instalarlos y mantenerlos exige una persona con conocimientos técnicos.
- **Negociación:** el registro de venta de Bitrix24; en su plan gratuito, la póliza y el reclamo se registran como negociaciones.

## 1.3 Las etapas de la relación con el asegurado

El sistema tiene que acompañar las tres etapas de la relación con el asegurado. La preventa reúne a los interesados, las cotizaciones, las llamadas y las campañas (A.2 y A.4). La venta abarca la emisión, la forma de pago y la cobranza; es donde más se cruza con el sistema central de la compañía, y el CRM refleja lo que ese sistema decide, sin duplicarlo ni contradecirlo (A.1, A.2 y A.12). La postventa comprende los reclamos, la renovación y la fidelización (A.5, A.6 y A.12).
