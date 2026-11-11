# PRES-1 · presentación del trabajo y consulta por criterio

status: proposed
cap: 240 min
sources: mensajes del usuario en la sesión (pedido de la presentación, pedido del kit en modo poc, respuestas sobre dónde instalarlo y en qué formato)
not_read: no hay card de Jira ni diseño de referencia; los datos salen de ../../ai/automatizacion/resultados y de ../informe

## Specs

- S1 · "presentacion del trabajo"
- S2 · "que herramientas se analizan"
- S3 · "la metodologia"
- S4 · "tabla resumen (aprovechar los subtotales)"
- S5 · "tener una presentacion secundaria con la tabla completa y el detalle por criterio"
- S6 · "hitos del analisis"
- S7 · "conclusion"
- S8 · "Hay que tener data para 20 minutos"
- S9 · "estar preparado para que pregunten sobre cada criterio en particular"
- S10 · "una segunda ppt con cada criterio, la explicacion completa del por que y su video si tiene"
- PRES-1-ASM-01 · los hitos del análisis son los hallazgos que definen el resultado, cada uno con su criterio, no una cronología del trabajo · S6
- PRES-1-ASM-02 · 20 minutos son unas 16 diapositivas en la presentación principal, cada una con notas del orador que se abren con una tecla · S8
- PRES-1-ASM-03 · los datos son una instantánea JSON generada por un script desde los resultados y el informe del repositorio; ningún número se escribe a mano · S4, S5, S10
- PRES-1-ASM-04 · los videos se reproducen desde ai/automatizacion/evidencia/videos por ruta relativa, sin copiarlos; las presentaciones se abren desde la copia del repositorio · S10
- PRES-1-ASM-05 · la presentación secundaria tiene la matriz completa por grupo y una vista por criterio con qué resuelve, el procedimiento, y por plataforma el valor, cómo lo hace, características, justificación, lo que cambiaría un plan pago, las citas y las capturas; se llega a un criterio por su código o buscándolo · S5, S9, S10

## Look

- ref: PRES-1-ASM-06 · principal: https://pudding.cool/2026/10/kevin-bacon (una idea por pantalla, flechas para avanzar) · lateral: https://ciechanow.ski/moon/ (la explicación trae sus propios controles) · secundaria, ref-kind product: https://linear.app/features y https://stockanalysis.com/stocks/aapl/ (hechos clave arriba, propiedades en columna, el detalle abajo por peso)
- behavior: load · la diapositiva entra con un desplazamiento corto de 8 px y opacidad, 240 ms, una vez por diapositiva
- behavior: cursor · flechas, barra espaciadora y clic avanzan; N abre las notas del orador; los controles responden a hover, press y focus
- behavior: view · en la secundaria, elegir un criterio cambia el detalle sin recargar; el video se reproduce solo cuando se lo pide
- behavior: empty · un criterio sin video muestra que su respaldo es documental, con las citas
- tokens: mood sobrio, editorial, de informe técnico para un decisor · genre presentación de resultados · spacing 4 8 12 16 24 32 48 64 · easing out cubic-bezier(.22,1,.36,1) 240 ms
- copy: 82,9 % · 82,2 % · 59,7 % de cumplimiento total; 258 evaluaciones, 219 videos; habla el equipo evaluador, en tercera persona impersonal

## Log

- L1 · presentacion del trabajo / que herramientas se analizan / la metodologia / tabla resumen (aprovechar los subtotales) / tener una presentacion secundaria con la tabla completa y el detalle por criterio / hitos del analisis / conclusion || te voy a pedir que te traigas el kit de mi gh para armar la presentacion en modo poc, porque es bastante mala la presentacion, y el kit hace interfaces excelentes. Hay que tener data para 20 minutos y admeas estar preparado para que pregunten sobre cada criterio en particular, asi que necesito una segunda ppt con cada criterio, la explicacion completa del por que y su video si tiene
- L2 · 2026-11-10 · respuesta del usuario: el kit va en una subcarpeta del repo del TP (humanos/presentacion); el formato es web (HTML)
- L3 · 2026-11-10 · kit: la sesión corre desde la raíz del repo del TP, así que los hooks y agentes del kit (builder, designer) no se cargan; el trabajo sigue el método a mano y se queda en la rama main, donde trabaja el equipo
- L4 · 2026-11-10 · Hecho: index.html (16 diapositivas con notas del orador) y criterios.html (matriz por grupo y registro completo de cada criterio con su video); datos en data/data.js, generados por data/build-data.mjs y verificados contra la sección 4 del informe; lint 0 FAIL 0 WARN; inspect --app sobre criterios.html 0 FAIL
- L5 · 2026-11-10 · criterios.html pasa a presentación de 362 diapositivas que se recorren solo hacia adelante y hacia atrás (flechas, Page Up/Down, espacio: lo que manda un control de presentaciones): por grupo su matriz, por criterio un resumen y una diapositiva por plataforma con la justificación completa y el video, que arranca solo; con teclado, tipear el código y Enter salta al criterio
