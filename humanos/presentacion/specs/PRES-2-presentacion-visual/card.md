# PRES-2 · presentación visual, con menos texto y más animación

status: proposed
cap: 180 min
sources: mensaje del usuario en la sesión, después de ver la presentación de PRES-1
not_read: no hay card de Jira ni referencia visual; la presentación de PRES-1 (index.html) se conserva sin cambios

## Specs

- S1 · "podemos hacer una que tenga menos texto"
- S2 · "tenga mas animaciones y vida"
- S3 · "y sea mucho mas visual"
- PRES-2-ASM-01 · la presentación de PRES-1 se guarda tal cual en index.html y la nueva va en visual.html, con el mismo contenido, los mismos datos y la misma estética · S1
- PRES-2-ASM-02 · como se presenta con un control que solo avanza y retrocede, la animación se arma con construcciones: cada «siguiente» revela el próximo elemento de la diapositiva antes de pasar a la siguiente · S2
- PRES-2-ASM-03 · lo visual sale de los datos reales y de la evidencia: gráficos animados con los porcentajes, puntos por criterio, capturas y videos de las pruebas, sin imágenes de archivo · S3

## Look

- ref: PRES-2-ASM-04 · https://pudding.cool/2026/10/kevin-bacon (una idea por pantalla, el dato se dibuja delante del público) · lateral: https://ciechanow.ski/moon/ (la explicación se construye paso a paso)
- behavior: load · el título de cada diapositiva entra con una máscara que sube, 600 ms, una vez por visita
- behavior: cursor · cada «siguiente» revela un paso: una barra que crece, un número que cuenta, un punto que aparece; «anterior» deshace el último paso
- behavior: view · las capturas a pantalla completa se acercan despacio mientras la diapositiva está a la vista
- behavior: reduce · con movimiento reducido todo aparece sin desplazamiento ni escala, y las construcciones se mantienen
- tokens: mood sobrio y editorial, con el mismo papel blanco, tinta negra y un acento azul · genre presentación de resultados · spacing 8 16 24 32 48 64 96 · easing out cubic-bezier(.22,1,.36,1) 600 ms, pop cubic-bezier(.34,1.56,.64,1) 450 ms
- copy: 82,9 % · 82,2 % · 59,7 %; una idea por diapositiva, en menos de diez palabras

## Log

- L1 · y me gusta mucho la estetica se ve muy profesional, me la guardaria porque esta bien, pero podemos hacer una que tenga menos texto, tenga mas animaciones y vida y sea mucho mas visual?
- L2 · 2026-11-10 · Hecho: visual.html, 16 diapositivas con construcciones paso a paso, gráficos dibujados con los datos (barras, puntos, signos), dos videos de pruebas y capturas en movimiento; lint 0 FAIL; revisadas las 16 con todas sus construcciones reveladas
- L3 · 2026-11-10 · Pedido del usuario: sin pantallas de las herramientas y una sola etapa por diapositiva. Capturas y videos reemplazados por gráficos de los datos y dibujos de línea que se trazan al entrar; cada diapositiva anima sola lo principal y reserva un solo paso para el remate
- L4 · 2026-11-10 · La visual pasa a index.html como presentación principal; la anterior queda en presentacion-sobria.html. Íconos de Lucide en lugar de los dibujos propios; «Cómo se suma» explicado en tres diapositivas con un ejemplo (A.9); «Grupo por grupo» como tabla de cifras grandes con el mejor de cada fila resaltado, legible de lejos
- L5 · 2026-11-10 · Para 20 minutos: 32 diapositivas (contexto, método con la cartera de prueba, resultados por parte, más hallazgos de Bitrix24, EspoCRM y Twenty, lo que ninguna resuelve, planes pagos y servidor propio) y notas del orador ampliadas a unas 3.000 palabras; íconos de Lucide con el trazo completo al final de la animación
