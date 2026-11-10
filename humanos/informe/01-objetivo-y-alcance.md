# 1. Objetivo y alcance

El objetivo es recomendar un sistema CRM para gestionar la relación con los asegurados de una compañía de seguros. Para eso se evalúan EspoCRM, Twenty y Bitrix24, cada una en su versión gratuita, contra los veinte requerimientos solicitados, a los que se suman criterios técnicos y del negocio asegurador. El resultado indica cuál se adecúa mejor, qué le falta a cada una y qué cambiaría contratando sus planes pagos.

## 1.1 Cómo leer este informe

Cada requerimiento lleva un código. La letra indica la parte: **A** reúne lo solicitado y **B**, lo que el análisis agrega por el negocio asegurador. El primer número es el grupo y el segundo, el criterio dentro del grupo. Por ejemplo, A.9 es el grupo de control de acceso y A.9.1, que cada productor vea solo su cartera.

Algunos términos aparecen seguido:

- **Entidad:** un tipo de registro del sistema, como Póliza o Reclamo.
- **Ramo:** el tipo de seguro, como automotor, hogar o vida.
- **Productor:** el productor asesor de seguros, el vendedor matriculado que trabaja con la compañía y atiende su propia cartera de clientes.
- **Automatización:** una secuencia de pasos que el sistema ejecuta solo, armada desde sus pantallas, sin escribir código.
- **Código:** instrucciones que tiene que escribir y mantener alguien con conocimientos técnicos.
- **Interfaz de programación:** la vía por la que otro sistema de la compañía lee y carga datos sin intervención de un usuario.
- **Contenedores:** la forma estándar de instalar estos sistemas en un servidor propio. Instalarlos y mantenerlos exige una persona con conocimientos técnicos.

## 1.2 Alcance

El sistema tiene que acompañar las tres etapas de la relación con el asegurado: la preventa (A.2 y A.4), la venta, con la emisión y el cobro de la póliza (A.1, A.2 y A.11), y la postventa, con los reclamos y la renovación (A.5, A.6 y A.11).

Quedan fuera dos temas. No se analizan los costos. Los precios de lista de los planes pagos se informan como dato, sin proyectar un costo total ni sumarlos al resultado.

Tampoco se trata la migración de los datos del sistema actual, porque depende de cuál sea. Se evalúa si cada plataforma permite importarlos (A.7).

## 1.3 Las plataformas evaluadas

**EspoCRM 10.0.4 Community.** CRM de código abierto que se instala en un servidor propio. La versión Community es gratuita. El fabricante vende extensiones con licencia anual por instalación y una versión en la nube que opera él.

**Twenty v2.37.4.** CRM de código abierto que se instala en un servidor propio. La versión autoalojada es gratuita. El fabricante vende una versión en la nube que opera él, con planes que se cobran por usuario.

**Bitrix24 plan Free.** Plataforma comercial que funciona solo en la nube del fabricante. El plan Free es gratuito y no vence. Los planes pagos se cobran por organización, no por usuario.
