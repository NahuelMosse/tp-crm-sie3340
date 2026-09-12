# 1. Introducción

## 1.1 Objetivo del trabajo

Este trabajo evalúa tres sistemas CRM del mercado y propone cuál se adecúa mejor a las necesidades de una compañía de seguros. La evaluación no se limita a comparar listas de funcionalidades publicadas por los fabricantes: cada sistema fue instalado o dado de alta, configurado y probado sobre un mismo conjunto de casos, de modo que las conclusiones se apoyan en evidencia propia y verificable.

## 1.2 Ámbito de aplicación: el negocio asegurador

El rubro de aplicación es el de las **compañías de seguros**, definido por la cátedra en el documento de requerimientos.

El sector atraviesa una situación competitiva particular. Los bancos ingresaron al negocio y proliferaron las plataformas de comparación de seguros en línea, lo que trasladó la prioridad de las aseguradoras hacia la captación y la retención de clientes. En ese contexto, la calidad del vínculo con el asegurado deja de ser un aspecto secundario y pasa a ser el factor competitivo central: resolver con agilidad, conocer al cliente y anticipar sus necesidades.

Esto vuelve al CRM una pieza crítica y no un sistema de apoyo. La operación diaria de una aseguradora se organiza alrededor de cuatro objetos de negocio que el sistema debe poder representar:

| Objeto | Qué es |
|---|---|
| **Asegurado** | La persona o empresa que contrata la cobertura |
| **Póliza** | El contrato: tipo de cobertura, vigencia, prima y estado de cobranza |
| **Siniestro o reclamo** | El evento que activa la cobertura y su gestión |
| **Productor o corredor** | El intermediario que vende y atiende la cartera |

De estos cuatro, **ninguno de los CRM analizados incluye la póliza ni el siniestro como módulos nativos**. Los tres son sistemas de gestión comercial genéricos. Esta constatación, lejos de invalidar el análisis, define su eje: la evaluación debe centrarse en la **capacidad de cada sistema para modelar el negocio asegurador** a partir de sus herramientas de parametrización.

## 1.3 Alcance

Se analizaron en profundidad tres herramientas, seleccionadas de un relevamiento previo de doce sistemas del mercado:

| Sistema | Versión evaluada | Modalidad |
|---|---|---|
| **EspoCRM** | 10.0.4 Community | Instalación propia, licencia AGPL v3 |
| **Twenty** | v2.37.4 | Instalación propia, licencia AGPL v3 |
| **Bitrix24** | Plan Free | Servicio en la nube |

El criterio de selección exigió que las tres fueran accesibles sin costo durante todo el cuatrimestre, contaran con interfaz en español y pudieran obtenerse por autogestión, sin intermediación comercial. El relevamiento completo de las doce alternativas y los motivos de descarte se detallan en el anexo correspondiente.

## 1.4 Metodología

La evaluación se organizó en fases.

**Definición de los criterios.** Antes de realizar prueba alguna se estableció qué se iba a evaluar, a partir de tres fuentes: los requerimientos funcionales del cliente, los criterios mínimos fijados por la cátedra y las condiciones que impone el propio negocio asegurador. Este orden es deliberado: definir los criterios después de conocer las herramientas habría sesgado la evaluación hacia lo que cada una sabe hacer.

**Verificación sobre las instalaciones.** Cada punto se comprobó operando los sistemas. Las pruebas se automatizaron con Playwright, lo que permitió ejecutar el mismo procedimiento sobre las tres herramientas y obtener registros comparables en video y capturas de pantalla.

**Trazabilidad.** Cada afirmación del informe indica su origen: la frase del cliente que la motiva, la pantalla del sistema donde se comprobó, el método de la interfaz de programación que se ejecutó o la documentación oficial consultada. Se distingue explícitamente lo verificado por el grupo de lo que solo declara el fabricante.

**Enunciado en positivo.** Los criterios se formulan como capacidades que un sistema puede cumplir, no como defectos que se le señalan. Donde una herramienta no alcanza un criterio, el efecto es que no suma en ese punto, no que se la penalice. La conclusión cuantitativa es equivalente, pero el análisis resulta más riguroso y no queda escrito en contra de ningún producto.
