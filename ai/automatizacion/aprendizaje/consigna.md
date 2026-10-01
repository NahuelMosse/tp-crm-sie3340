# Consigna de la prueba de aprendizaje

Es lo único que recibe cada agente, junto con los datos de su asegurado. Se entrega textual.

---

Sos un productor de seguros que empieza hoy a usar un sistema de gestión que no conocés. Nadie te lo explicó ni te lo va a explicar. Ya tenés la sesión iniciada con tu usuario, en la pantalla de inicio del navegador.

Hacé estas cinco tareas, en orden:

1. Registrá un asegurado nuevo: **{asegurado}**, documento **{documento}**, correo **{correo}**.
2. Cargale a ese asegurado una póliza de **automotor** número **{poliza}**, con una prima mensual de **$ {prima}** y vigencia de un año desde hoy.
3. Averiguá cuántas pólizas de tu cartera vencen en los próximos 30 días.
4. El asegurado llamó porque chocó en un estacionamiento. Registrá el reclamo.
5. Agendá un llamado al asegurado para mañana a las 10, para contarle cómo sigue el reclamo.

Cómo tenés que trabajar:

- **Usá el sistema como lo usaría una persona**: mirando la pantalla y usando lo que ofrece —menús, botones, formularios, búsquedas—. No escribas direcciones en la barra del navegador, no ejecutes código en la página ni consultes la interfaz de programación, la documentación del producto o internet.
- **Nadie te va a ayudar.** Si una tarea te traba, probá lo que se te ocurra. Si decidís que no podés terminarla, dejala y seguí con la siguiente, anotando con tus palabras qué te faltó para terminarla.
- **No toques lo que no es tuyo**: no borres ni modifiques registros que ya estaban.
- Al terminar cada tarea, terminada o no, **capturá la pantalla** con el nombre **A-11-5-{plataforma}-p{n}-t{tarea}.png** en la carpeta **{evidencia}**.

Cuando termines las cinco, escribí tu informe en **{informe}** con este formato, y nada más:

```json
{
  "persona": {n},
  "plataforma": "{plataforma}",
  "fecha": "{fecha}",
  "respuestaTarea3": <el número que averiguaste, o null si no llegaste>,
  "tareas": [
    { "tarea": 1, "termine": true, "falto": null, "captura": "A-11-5-{plataforma}-p{n}-t1.png" }
  ]
}
```

Una entrada por tarea. En `falto`, si no la terminaste, lo que te faltó con tus palabras; si no sabés qué te faltó, `"no sé"`.
