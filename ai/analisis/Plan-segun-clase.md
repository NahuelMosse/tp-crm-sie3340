# Ajuste del trabajo a las pautas de la clase

Notas de la clase en la que el profesor explicó cómo resolver el TP. Se contrastan con lo hecho hasta ahora.

---

## Los ocho pasos y dónde estamos

| # | Paso | Estado |
|---|---|---|
| 1 | Identificación de herramientas | ✅ 12 relevadas, 3 seleccionadas |
| 2 | Determinación de requisitos original | ✅ los 20 del enunciado |
| 3 | Análisis en las 3 herramientas | 🔄 en curso |
| 4 | **Lista de requerimientos definitiva** = original + agregados | ⬜ **lo que sigue** |
| 5 | **Definir metodología**, bien definida y no opinable | ⬜ |
| 6 | **Un número por requerimiento, con el porqué explicado** | ⬜ |
| 7 | Suma de valores por herramienta | ⬜ |
| 8 | Conclusión: cuál conviene para el caso | ⬜ |

---

## Lo que hay que corregir de lo hecho

### 1. El análisis económico entra, y yo lo había excluido

En `01-objetivo-y-alcance.md` escribí que la comparación de precios quedaba fuera del alcance. **Según las pautas de la clase eso es un error.** El profesor pide:

- Separar el análisis funcional del económico, con la recomendación de **entregarlos diferenciados dentro del mismo documento**
- Un **polinomio de valor total**: `N% oferta técnica + M% oferta económica`
- En la oferta económica, **la más barata recibe 100 puntos** y las demás bajan proporcionalmente
- **Proyectar el precio a 3 o 5 años**, para que se destapen los costos que arrancan bajos y se acumulan

Corresponde reescribir el alcance: lo económico no se excluye, se analiza por separado. Y el dato de la proyección a 3-5 años es el que vuelve visible lo que ya detectamos: una herramienta gratuita con un pago único de licencia contra otra gratuita que cobra por usuario y por mes dan resultados muy distintos al tercer año.

### 2. De 20 requerimientos hay que llegar a 40-50 funciones

La consigna trae 20 requerimientos en lenguaje de negocio. El profesor indicó **transformarlos en funciones reales, unas 40 o 50**. Hoy la tabla tiene los 20 sin descomponer.

Ejemplo de lo que falta hacer, sobre un requerimiento:

> *"Seguimiento de pólizas: qué tipo tiene, el estado de pago y si hay posibilidad de cambio"*

se descompone en funciones verificables por separado:

| Función derivada |
|---|
| Registrar el tipo de cobertura de la póliza |
| Registrar la vigencia, con fecha de inicio y de fin |
| Registrar la prima con su moneda |
| Registrar el estado de cobranza |
| Vincular la póliza al asegurado |
| Conservar el historial de cambios de la póliza |

Seis funciones de un solo requerimiento. Cada una se puntúa por separado, y así el número final refleja qué tan completo es el cumplimiento y no una impresión general.

### 3. La escala: impar, de 3 o 5 valores, con criterio por cada valor

La matriz actual usa ● ventaja / ○ desventaja, que es binaria. El profesor pide:

- **Rango no muy amplio: 3 o 5 valores**
- **Preferentemente impar**
- **Un criterio definido para cada valor de la escala**, de modo que la puntuación no sea opinable

La escala binaria no distingue entre "lo hace de fábrica" y "lo hace pero hay que configurarlo entero", que es justamente donde se separan las tres herramientas. Hay que pasar a una escala de 5.

### 4. Ponderar lo solicitado por encima de lo agregado

Instrucción textual: *"ponderar más los requerimientos solicitados sobre los no solicitados, con cuidado de que los extra no compensen a una herramienta que no cumple lo requerido"*.

Esto valida separar los agregados, pero corrige el enfoque: **no van en una tabla aparte fuera del puntaje**, van en la lista definitiva con un peso menor. El riesgo que el profesor marca es concreto y en este caso es real: Bitrix24 suma inteligencia artificial, aplicación móvil y suite integrada, ninguna pedida por el cliente. Si esos extras pesaran igual que modelar una póliza, la conclusión se distorsiona.

### 5. Calcular porcentaje de cumplimiento

El profesor menciona que en años anteriores se calculó el **porcentaje de cumplimiento** por herramienta. Es una salida más comparable que el puntaje absoluto: dice qué proporción de lo que el cliente pidió cubre cada plataforma.

---

## Lo que ya estaba alineado

- **Separar requerimientos originales de agregados.** El paso 4 pide exactamente esa distinción.
- **Metodología definida y no opinable.** Es el paso 5, y coincide con haber definido los criterios antes de probar.
- **Explicar el porqué de cada valor.** El paso 6 lo exige; la trazabilidad que venimos aplicando lo cubre.
- **Enunciar en positivo.** Permite que cada función reciba un número sin ambigüedad.

---

## Qué hacer ahora

| Orden | Tarea |
|---|---|
| 1 | Descomponer los 20 requerimientos en 40-50 funciones verificables |
| 2 | Sumar las funciones agregadas a la misma lista, marcadas como no solicitadas |
| 3 | Definir la escala de 5 valores con su criterio para cada valor |
| 4 | Definir los pesos: solicitado contra agregado, y criticidad dentro de lo solicitado |
| 5 | Definir el polinomio: qué porcentaje pesa lo técnico y qué porcentaje lo económico |
| 6 | Corregir el alcance del informe para incorporar el análisis económico |
| 7 | Proyectar el costo de cada plataforma a 3 y 5 años |
