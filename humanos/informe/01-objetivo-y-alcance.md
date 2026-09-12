# 1. Objetivo y alcance

El informe evalúa tres plataformas CRM sobre los requerimientos de una compañía de seguros y propone cuál se adecúa mejor a ese negocio. La comparación se hace sobre características enunciadas de modo que tenerlas sea siempre la ventaja, de manera que ningún cruce de la matriz quede indeciso.

Las tres plataformas se instalaron o se dieron de alta, se configuraron y se operaron. Cada veredicto se apoya en una comprobación propia sobre el sistema en funcionamiento, no en la documentación comercial del fabricante. Donde no fue posible comprobarlo, el informe lo declara.

## 1.1 Qué queda fuera del alcance

**La negociación de condiciones comerciales.** El análisis económico toma los precios de lista publicados por cada fabricante y los proyecta a tres y cinco años. No contempla descuentos por volumen ni condiciones particulares, que dependen de una negociación concreta y no admiten comparación general.

**La migración desde un sistema preexistente.** Se evalúa la capacidad de importar datos, no el proyecto de migración, que depende del sistema de origen y excede el análisis de producto.

**El dimensionamiento para una aseguradora grande.** La evidencia sobre volumen se tomó en instalaciones de prueba con decenas de miles de registros. Una compañía con millones de pólizas exige un análisis de infraestructura que este informe no aborda.

**La evaluación de los módulos de emisión y siniestros.** Ninguna de las tres plataformas los incorpora: son sistemas de gestión comercial. El informe evalúa su capacidad de representar la póliza como objeto de negocio, no de reemplazar al sistema de emisión.

## 1.2 Análisis técnico y análisis económico, separados

El informe distingue dos evaluaciones que se mantienen diferenciadas hasta la conclusión.

La **oferta técnica** mide en qué medida cada plataforma cubre las funciones que el negocio necesita. La **oferta económica** mide el costo total de sostenerla, proyectado a tres y cinco años.

Se mantienen separadas porque responden preguntas distintas y porque mezclarlas oculta el análisis: una plataforma puede cubrir mejor las funciones y aun así resultar inconveniente por su costo de crecimiento, y esa tensión es información para decidir, no un empate que haya que resolver promediando.

La integración de ambas se hace al final, mediante un polinomio de valor que asigna un peso explícito a cada una. En la oferta económica, la alternativa de menor costo total recibe el puntaje máximo y las demás se ubican en proporción.

La proyección a tres y cinco años es deliberada: las tres plataformas son gratuitas en su punto de partida, y es el paso del tiempo el que revela la diferencia entre un pago único de licencia, un abono por usuario y un abono por organización.

## 1.3 Por qué el rubro define el análisis

La operación de una aseguradora se organiza alrededor de cuatro objetos: el **asegurado**, la **póliza** que lo vincula a una cobertura, el **siniestro** que la activa y el **productor** que vende y atiende la cartera.

De los cuatro, los CRM del mercado modelan solamente dos. El asegurado equivale al contacto y el productor al usuario del sistema, pero **la póliza y el siniestro no existen como módulos nativos en ninguna de las tres plataformas evaluadas**. Son sistemas de gestión comercial genéricos, pensados para vender productos, no para administrar contratos de cobertura con vigencia, prima y estado de cobranza.

Esto determina el eje del informe. Si la póliza no viene incorporada, la pregunta deja de ser cuál de las tres tiene mejores funciones de venta y pasa a ser **cuál permite construir el modelo del negocio asegurador sobre su propia estructura**. La capacidad de parametrización —que en un análisis genérico sería un criterio técnico de segundo orden— se convierte acá en la condición que habilita el núcleo del negocio.

Tres requerimientos del cliente dependen por completo de esa capacidad: el seguimiento de pólizas, la gestión de la información de ventas y pólizas para prospección, y la administración de la cartera para generar venta cruzada. Una plataforma que no permita modelar la póliza no puede cumplirlos, por completo que sea el resto de su funcionalidad.

## 1.4 Origen de las características evaluadas

Las características provienen de tres fuentes, y la distinción importa porque no todas tienen el mismo carácter obligatorio.

**Los veinte requerimientos del cliente**, tomados del documento de requerimientos de la cátedra. Describen qué debe hacer el sistema y entran todos, sin excepción, porque constituyen el pedido a satisfacer.

**Los trece criterios mínimos de la consigna**, que describen cómo debe comportarse una herramienta con independencia de su función. Se incorporan completos, pero leídos en clave del rubro: no se evalúa la facilidad de uso en abstracto sino la facilidad con que un productor carga una póliza.

**Las condiciones que impone el negocio asegurador**, que ninguna de las dos fuentes anteriores menciona. Una póliza de vida permanece vigente durante décadas y los seguros de salud involucran datos sensibles alcanzados por la Ley 25.326: de ahí salen exigencias de persistencia, de volumen y de control sobre la localización de los datos que una empresa de otro rubro no tendría.

A esas tres se suma una cuarta categoría, evaluada por separado y fuera del puntaje principal: las **capacidades diferenciales** que ninguna fuente solicita, detectadas durante las pruebas, que sirven para desempatar entre alternativas equivalentes.

## 1.5 Dos salvedades sobre el conjunto de características

**El conjunto no es neutral.** Veinte características salieron del pedido del cliente y trece de la consigna; las restantes se buscaron a propósito, enumerando las condiciones que el negocio asegurador impone y las capacidades que aparecieron al operar los sistemas. Ese último grupo se seleccionó con un criterio explícito: solo entró la característica que discrimina entre las tres plataformas. Una capacidad que las tres resuelven de manera equivalente no aporta información para decidir, y quedó documentada sin evaluarse. Bajo esa regla se descartaron, entre otras, la cantidad de idiomas disponibles, el estilo de la interfaz de programación y la existencia de tableros nativos.

**El escenario evaluado es el de las versiones gratuitas.** Las tres plataformas ofrecen planes pagos que habilitan funcionalidad adicional, y varias características que aparecen como desventaja en la matriz se resuelven pagando. El informe lo señala en cada caso, porque la decisión de una aseguradora pequeña con presupuesto acotado no es la misma que la de una que puede afrontar una licencia. Donde una funcionalidad existe pero exige un plan pago, el veredicto refleja el escenario evaluado y el texto aclara qué plan la habilita.
