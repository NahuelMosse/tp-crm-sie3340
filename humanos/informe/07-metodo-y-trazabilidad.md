# 7. Método de verificación y trazabilidad

## 7.1 Principio de trabajo

Ningún veredicto de la matriz se completa por deducción. Cada uno se apoya en una de estas tres situaciones, y el informe declara cuál:

| Clase | Qué significa | Cómo se registra |
|---|---|---|
| **Verificado** | Se ejecutó la operación sobre el sistema y se observó el resultado | Captura de pantalla o video de la prueba |
| **Declarado** | Lo afirma la documentación del fabricante, sin comprobación propia | Dirección del documento consultado |
| **Inferido** | Se desprende por contraste con otra característica comprobada | La característica de la que se deriva |

La distinción importa porque durante las pruebas aparecieron diferencias entre lo declarado y lo verificado. Presentar ambas cosas como equivalentes debilitaría las conclusiones que sí se comprobaron.

**Una operación que no se pudo completar no se convierte en veredicto negativo.** Si una función no se logró ejecutar, el informe registra que no se verificó, no que la plataforma carece de ella. La diferencia entre "no lo pude hacer" y "no se puede hacer" es la que separa una evaluación de una opinión.

## 7.2 Origen de cada afirmación

| Referencia | Significado |
|---|---|
| `[REQ]` | Frase textual del documento de requerimientos del cliente |
| `[CONS n]` | Criterio n de la consigna de la cátedra |
| `[UI:sistema ruta]` | Comprobado en la instalación, en la pantalla indicada |
| `[API:método]` | Ejecutado contra la interfaz de programación, con su respuesta |
| `[TEST:id]` | Demostrado mediante prueba automatizada, con video |
| `[DOC:dirección]` | Documentación oficial del fabricante, no comprobado |
| `[RUBRO]` | Derivado de las características del negocio asegurador |

## 7.3 Cómo se produjo la evidencia

Las pruebas se automatizaron con Playwright, una herramienta de automatización de navegador. Esa decisión tuvo tres consecuencias sobre la calidad del análisis.

**El mismo procedimiento se ejecuta sobre las tres plataformas.** Cargar un asegurado en EspoCRM y en Twenty no es una comparación entre dos personas operando a distinta velocidad, sino el mismo recorrido medido de igual manera.

**La evidencia se genera sola.** Cada prueba produce video, capturas y una traza navegable sin trabajo adicional. El registro completo está en el anexo de evidencia, indexado por característica.

**Las mediciones se toman sin intervención.** Para la cantidad de pasos y los tiempos de operación se ejecutan dos corridas: una limpia, que produce los números, y otra con carteles explicativos para el video didáctico. Los tiempos de la segunda no se usan como dato, porque las pausas y las anotaciones los alteran: la misma prueba dio diez segundos en la corrida limpia y treinta y ocho en la narrada.

## 7.4 Limitaciones de la evidencia

**El escenario es una instalación de prueba, no una aseguradora en operación.** Los volúmenes que se cargaron son de decenas de miles de registros, no de millones. Las conclusiones sobre rendimiento valen para una compañía pequeña o mediana.

**Las instalaciones corrieron en una máquina compartida.** Los tiempos absolutos de instalación y de arranque están afectados por la carga de esa máquina y deben leerse como comparación relativa entre las tres, no como valores de referencia.

**El conjunto de características no es neutral.** Treinta y tres provienen del pedido del cliente y de la consigna; el resto se buscó a propósito, enumerando las condiciones del negocio asegurador y las capacidades que aparecieron al operar los sistemas. Ese último grupo se filtró con un criterio explícito —solo entra la característica que discrimina entre las tres— y ese filtro inclina el recuento hacia las diferencias, no hacia las coincidencias.

**Una de las tres plataformas es un servicio en la nube y no admite inspección interna.** De EspoCRM y Twenty se pudo revisar el código, la base de datos y los archivos de configuración. De Bitrix24 solo lo que expone su interfaz y su documentación. Esa asimetría no se puede resolver y afecta al bloque de características técnicas: varias que en las otras dos se comprobaron directamente, en Bitrix24 quedaron como declaradas.

## 7.5 Correcciones aplicadas durante el análisis

Se registran porque afectan la lectura de los resultados.

**Detección de restricciones comerciales por texto de pantalla.** El primer procedimiento buscaba expresiones como "Mejore su plan" en el contenido de la página para determinar si una función estaba bloqueada. El método daba positivo siempre en Bitrix24, porque ese botón está fijo en el menú lateral con independencia de la función que se esté usando. Se descartó el procedimiento: la restricción se determina completando la operación y observando si se bloquea, nunca por la presencia de un texto en pantalla.

**Error de servidor atribuido a la plataforma.** Al crear la entidad Póliza, EspoCRM devolvió un error interno. El registro del servidor mostró que el fallo ocurría al recalcular cotizaciones de moneda —la instalación tenía configurada una moneda local sin cotización cargada— y que **la entidad se había creado correctamente**. El error correspondía a un proceso posterior y a una decisión de configuración propia, no a una limitación del producto. La observación quedó en el informe como consideración de puesta en marcha.

**Errores de la herramienta de prueba atribuidos al producto.** Dos fallos iniciales resultaron ser del instrumento y no de las plataformas: un campo que se completaba concatenando texto, porque el sistema autocompleta etiquetas mientras se escribe; y la creación de campos con opciones, que fallaba por la codificación de caracteres del entorno desde el que se enviaban, no por el producto.

Las tres correcciones apuntan a lo mismo: **una prueba que falla no prueba que la plataforma falle**. Cada resultado negativo se revisó antes de convertirse en veredicto.
