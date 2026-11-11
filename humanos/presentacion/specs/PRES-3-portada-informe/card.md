# PRES-3 · portada del informe

status: proposed
cap: 60 min
sources: mensaje del usuario en la sesión
not_read: no hay referencia visual; la carátula actual es la que arma ai/automatizacion/exportar-informe.py con python-docx

## Specs

- S1 · "la portada del informe de CRM, la podriamos rehacer con el kit"
- S2 · "que la piense para una portada de un informe"
- PRES-3-ASM-01 · la portada se diseña en HTML a tamaño A4, se imprime a PDF y reemplaza la primera página de los dos PDF entregables; el .docx conserva la carátula de Word · S1
- PRES-3-ASM-02 · el texto de la portada sale de humanos/informe/00-portada.md, sin escribirlo a mano, y la imagen de la portada son los 258 veredictos del informe, una marca por criterio y plataforma · S2

## Look

- ref: PRES-3-ASM-03 · tapa de informe anual editorial, título grande en serif, datos en dos columnas, sin color de acento, como el resto del informe
- behavior: load · página impresa, sin movimiento
- tokens: mood sobrio, editorial · genre portada de informe técnico · márgenes 20 a 22 mm · tinta #161616, gris #626262
- copy: el título, la bajada y los datos de la carátula de 00-portada.md

## Log

- L1 · la portada del informe de CRM, la podriamos rehacer con el kit, que dise;a muy piola, que la piense para una portada de un informe
- L2 · 2026-11-10 · Hecho: portada/index.html (A4) y portada/render.mjs; exportar-informe.py la imprime y la pone como primera página de los dos PDF, conservando los vínculos del índice
- L3 · 2026-11-10 · export: el informe se arma en HTML y se imprime con Chromium (ai/automatizacion/exportar-informe.py); ya no hay .docx, así que la portada diseñada reemplaza una primera página en blanco del cuerpo
