# 1. Objetivo y alcance

El informe evalúa tres plataformas CRM sobre los requerimientos de una compañía de seguros y propone cuál se adecúa mejor a ese negocio. La comparación se hace sobre características enunciadas de modo que tenerlas sea siempre la ventaja, de manera que ningún cruce de la matriz quede indeciso.

Las tres plataformas se instalaron o se dieron de alta, se configuraron y se operaron. Cada veredicto se apoya en una comprobación propia sobre el sistema en funcionamiento, no en la documentación comercial del fabricante. Donde no fue posible comprobarlo, el informe lo declara.

## 1.1 Qué queda fuera del alcance

**La negociación de condiciones comerciales.** El análisis económico toma los precios de lista publicados por cada fabricante y los proyecta a tres y cinco años. No contempla descuentos por volumen ni condiciones particulares, que dependen de una negociación concreta y no admiten comparación general.

**La migración desde un sistema preexistente.** Se evalúa la capacidad de importar datos, no el proyecto de migración, que depende del sistema de origen y excede el análisis de producto.

**El dimensionamiento para una aseguradora grande.** La evidencia sobre volumen se tomó en instalaciones de prueba con decenas de miles de registros. Una compañía con millones de pólizas exige un análisis de infraestructura que este informe no aborda.

## 1.2 Análisis técnico y análisis económico, separados

El informe distingue dos evaluaciones que se mantienen diferenciadas hasta la conclusión.

La **oferta técnica** mide en qué medida cada plataforma cubre las funciones que el negocio necesita. La **oferta económica** mide el costo total de sostenerla, proyectado a tres y cinco años.

Se mantienen separadas porque responden preguntas distintas y porque mezclarlas oculta el análisis: una plataforma puede cubrir mejor las funciones y aun así resultar inconveniente por su costo de crecimiento, y esa tensión es información para decidir, no un empate que haya que resolver promediando.

La integración de ambas se hace al final, mediante un polinomio de valor que asigna un peso explícito a cada una. En la oferta económica, la alternativa de menor costo total recibe el puntaje máximo y las demás se ubican en proporción.

De esa separación se desprende la regla que gobierna toda la evaluación técnica: **una función que el producto puede realizar está cubierta, con independencia del plan que la habilite**. Si exige una licencia adicional, eso encarece la solución y se refleja en el costo proyectado, no en el puntaje funcional.

La proyección a tres y cinco años es deliberada: las tres plataformas son gratuitas en su punto de partida, y es el paso del tiempo el que revela la diferencia entre un pago único de licencia, un abono por usuario y un abono por organización.

## 1.3 El negocio asegurador

El sector atraviesa una situación competitiva particular. Los bancos ingresaron al negocio y proliferaron las plataformas de comparación en línea, lo que trasladó la prioridad de las aseguradoras hacia la captación y la retención. En ese contexto la calidad del vínculo con el asegurado pasa a ser el factor competitivo central, y de ahí que el cliente haya definido sus requerimientos alrededor de conocer, atender y retener.

La operación diaria involucra tres actores y un objeto de negocio. El **asegurado** contrata una cobertura; el **productor o corredor** la vende y atiende la cartera; la **compañía** administra el conjunto. El objeto que los vincula es la **póliza**: el contrato con su tipo de cobertura, su vigencia, su prima y su estado de cobranza.

Esa estructura explica varios de los requerimientos del pedido. El seguimiento de pólizas, la evaluación de la producción por corredor y la gestión de reclamos no son funciones genéricas de venta: responden a la forma en que opera una aseguradora. Su evaluación se desarrolla en la sección 6, con el resto de las características.

## 1.4 Origen de las características evaluadas

Las características provienen de tres fuentes, y la distinción importa porque no todas tienen el mismo carácter obligatorio.

**Los veinte requerimientos funcionales del pedido**, relevados con el cliente. Describen qué debe hacer el sistema y entran todos, sin excepción, porque constituyen la necesidad a satisfacer.

**Los trece criterios técnicos de evaluación de software**, que describen cómo debe comportarse una herramienta con independencia de su función: restricciones tecnológicas, instalación, navegabilidad, usabilidad, concurrencia, parametrización, intercambio de datos, seguridad, explotación de la información, reportes, interfaces, integración y soporte. Se incorporan completos, pero leídos en clave del rubro: no se evalúa la facilidad de uso en abstracto sino la facilidad con que un productor carga una póliza.

**Las condiciones que impone el negocio asegurador**, que ninguna de las dos fuentes anteriores menciona. Una póliza de vida permanece vigente durante décadas y los seguros de salud involucran datos sensibles alcanzados por la Ley 25.326: de ahí salen exigencias de persistencia, de volumen y de control sobre la localización de los datos que una empresa de otro rubro no tendría.

A esas tres se suma una cuarta categoría, evaluada por separado y fuera del puntaje principal: las **capacidades diferenciales** que ninguna fuente solicita, detectadas durante las pruebas, que sirven para desempatar entre alternativas equivalentes.

## 1.5 Dos salvedades sobre el conjunto de características

**El conjunto no es neutral.** Veinte características salieron del pedido del cliente y trece del marco técnico de evaluación; las restantes se buscaron a propósito, enumerando las condiciones que el negocio asegurador impone y las capacidades que aparecieron al operar los sistemas. Ese último grupo se seleccionó con un criterio explícito: solo entró la característica que discrimina entre las tres plataformas. Una capacidad que las tres resuelven de manera equivalente no aporta información para decidir, y quedó documentada sin evaluarse. Bajo esa regla se descartaron, entre otras, la cantidad de idiomas disponibles, el estilo de la interfaz de programación y la existencia de tableros nativos.

**La evaluación técnica mide la capacidad del producto, no la del plan contratado.** Si una plataforma dispone de una función —aunque requiera una licencia, un módulo adicional o un plan superior— la característica se considera cubierta. Lo que ese requisito cuesta se traslada íntegramente a la oferta económica, donde corresponde.

El criterio evita un error de análisis frecuente: penalizar dos veces lo mismo. Una plataforma que resuelve una necesidad mediante un módulo pago no es funcionalmente inferior a otra que la trae incluida; es más cara. Esa diferencia es económica y se mide como tal.

Solo se consigna como no cubierta la característica que **no existe en ninguna edición del producto**. Esa es una limitación real y ningún presupuesto la resuelve.
