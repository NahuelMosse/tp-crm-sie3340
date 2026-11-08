#!/usr/bin/env node
/**
 * Genera la matriz de veredictos, el detalle por requerimiento y las fuentes
 * desde los resultados registrados por los tests.
 *
 *   node generar-matriz.mjs [raiz-del-repo]
 *
 * Ningún número del informe se escribe a mano: todo sale de resultados/*.json
 */
import { readdirSync, readFileSync, writeFileSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import catalogo from './catalogo.cjs';

const AQUI = dirname(fileURLToPath(import.meta.url));
const RAIZ = process.argv[2] ?? AQUI;
const RESULTADOS = join(AQUI, 'resultados');
const SALIDA = join(RAIZ, 'humanos', 'informe');

// Tres herramientas, tres columnas. Se puntúa la versión elegida de cada una;
// lo que un plan pago cambiaría se registra aparte y se informa como comentario.
const PLATAFORMAS = [
  ['espocrm', 'EspoCRM'],
  ['twenty', 'Twenty'],
  ['bitrix24', 'Bitrix24'],
];

// Los grupos y sus criterios salen de la seccion 4 del informe. Todos pesan
// igual dentro de su parte: el pedido del cliente no jerarquiza sus
// necesidades, de modo que el analisis tampoco lo hace.
const { GRUPOS } = catalogo;

// Reparto ENTRE partes: lo que el cliente pidio pesa mas que lo que no pidio.
const PARTE = { A: 0.85, B: 0.15 };
const ORIGEN = { A: 'Originales — solicitados por el cliente', B: 'Opcionales — no solicitados' };
const TIPOS = [
  ['funcional', 'Requerimientos funcionales', '¿El usuario puede hacerlo desde el sistema?'],
  ['tecnica', 'Requerimientos técnicos', '¿Qué exige el sistema para funcionar y sostenerse?'],
  ['operativa', 'Requerimientos operativos', '¿Cómo se comporta en la operación diaria de la compañía?'],
];

const TOTAL_BASE = GRUPOS.reduce((n, g) => n + g.criterios.length, 0) * PLATAFORMAS.length;

// ── cargar resultados ────────────────────────────────────────────────────────
const res = {};
if (existsSync(RESULTADOS)) {
  for (const f of readdirSync(RESULTADOS).filter(x => x.endsWith('.json'))) {
    const d = JSON.parse(readFileSync(join(RESULTADOS, f), 'utf8'));
    (res[d.criterio] ??= {})[d.plataforma] = d;
  }
}

// Escala de la seccion 3: 2 cumple, 1 cumple con reparo, 0 no cumple.
const MAXIMO = 2;
const SIMBOLO = { 2: '●', 1: '◐', 0: '○' };
const ETIQUETA = { 2: 'cumple', 1: 'cumple con reparo', 0: 'no cumple' };

const puntua = (d) => d && d.puntua !== false;

// La flecha avisa que un plan pago lo mejoraría: es un comentario, no cambia el valor
const simbolo = (d) => (!puntua(d) ? '◍' : SIMBOLO[d.cumple] + (d.conPlan?.length ? '↑' : ''));

/** Mejor valor que se alcanzaría contratando un plan; solo para el comentario. */
const conPlanPago = (d) => {
  if (!puntua(d) || !d.conPlan?.length) return d;
  return d.conPlan.reduce((mejor, x) => (x.cumple > mejor.cumple ? x : mejor), d);
};

/** Fecha en el formato del informe. Lo publicado cambia: la constancia lleva el dia. */
// La fecha se guarda como día calendario: se lee en UTC para que el huso horario no la corra un día
const fecha = (iso) => new Date(iso).toLocaleDateString('es-AR',
  { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

const pct = (x) => `${x.toFixed(1).replace('.', ',')} %`;

/** Puntos obtenidos sobre el máximo de un conjunto de criterios, para una plataforma. */
function puntos(criterios, k, valor = (d) => d.cumple) {
  let obt = 0, max = 0;
  for (const c of criterios) {
    const d = res[c.id]?.[k];
    if (!puntua(d)) continue;
    obt += valor(d);
    max += MAXIMO;
  }
  return { obt, max };
}

const subtotal = (criterios, k) => {
  const { obt, max } = puntos(criterios, k);
  return max ? `${obt}/${max} · ${pct(obt / max * 100)}` : '—';
};

// ── 5. matriz, por tipo → origen → grupo ─────────────────────────────────────
const cabeza = `| Criterio | ${PLATAFORMAS.map(p => p[1]).join(' | ')} |\n|---|${PLATAFORMAS.map(() => ':---:').join('|')}|\n`;
let matriz = '';
let nTipo = 0;
for (const [tipo, titulo, pregunta] of TIPOS) {
  const delTipo = GRUPOS.map(g => ({ ...g, criterios: g.criterios.filter(c => c.tipo === tipo) }))
    .filter(g => g.criterios.length);
  if (!delTipo.length) continue;
  nTipo++;
  matriz += `\n## 5.${nTipo} ${titulo}\n\n*${pregunta}*\n`;
  for (const parte of ['A', 'B']) {
    const grupos = delTipo.filter(g => g.parte === parte);
    if (!grupos.length) continue;
    matriz += `\n### ${ORIGEN[parte]}\n`;
    for (const g of grupos) {
      // Un grupo que reparte sus criterios entre tipos lleva el tipo en el título
      const parcial = g.criterios.length < GRUPOS.find(x => x.id === g.id).criterios.length;
      const sufijo = parcial ? ` — ${titulo.replace('Requerimientos ', '')}` : '';
      matriz += `\n#### ${g.id} ${g.nombre}${sufijo}\n\n${cabeza}`;
      for (const c of g.criterios) {
        matriz += `| ${c.id} ${c.nombre} | ${PLATAFORMAS.map(([k]) => simbolo(res[c.id]?.[k])).join(' | ')} |\n`;
      }
      matriz += `| **Subtotal ${g.id}${sufijo}** | ${PLATAFORMAS.map(([k]) => `**${subtotal(g.criterios, k)}**`).join(' | ')} |\n`;
    }
  }
  // Subtotal del tipo: originales, opcionales y los dos juntos
  const todos = (parte) => delTipo.filter(g => !parte || g.parte === parte).flatMap(g => g.criterios);
  matriz += `\n#### Subtotal de los ${titulo.toLowerCase()}\n\n| | ${PLATAFORMAS.map(p => p[1]).join(' | ')} |\n|---|${PLATAFORMAS.map(() => ':---:').join('|')}|\n`;
  for (const parte of ['A', 'B']) {
    if (todos(parte).length) matriz += `| ${parte === 'A' ? 'Originales' : 'Opcionales'} | ${PLATAFORMAS.map(([k]) => subtotal(todos(parte), k)).join(' | ')} |\n`;
  }
  matriz += `| **Total** | ${PLATAFORMAS.map(([k]) => `**${subtotal(todos(), k)}**`).join(' | ')} |\n`;
}

// ── recuentos y resultado ────────────────────────────────────────────────────
const deParte = (parte) => GRUPOS.filter(g => g.parte === parte);

/** % de una parte: el promedio de los % de sus grupos, sobre lo verificado. */
function cumplimiento(parte, k, valor = (d) => d.cumple) {
  const notas = deParte(parte).map(g => puntos(g.criterios, k, valor)).filter(p => p.max)
    .map(p => p.obt / p.max * 100);
  return notas.length ? notas.reduce((a, b) => a + b, 0) / notas.length : null;
}

function oferta(k, valor) {
  const a = cumplimiento('A', k, valor), b = cumplimiento('B', k, valor);
  if (a === null && b === null) return null;
  // Si una parte no tiene evaluaciones, el total se reparte sobre la otra.
  const pa = a === null ? 0 : PARTE.A, pb = b === null ? 0 : PARTE.B;
  return ((a ?? 0) * pa + (b ?? 0) * pb) / (pa + pb);
}

const sinVerificar = Object.values(res).flatMap(x => Object.values(x)).filter(d => !puntua(d)).length;
const evaluadas = Object.values(res).reduce((n, x) => n + Object.keys(x).length, 0);
const faltan = TOTAL_BASE - evaluadas + sinVerificar;
const mejoraConPlan = Object.values(res).some(x => Object.values(x).some(d => puntua(d) && d.conPlan?.length));

function recuento(parte) {
  const criterios = deParte(parte).flatMap(g => g.criterios);
  const fila = (etiqueta, fn) =>
    `| ${etiqueta} | ${PLATAFORMAS.map(([k]) => criterios.filter(c => fn(res[c.id]?.[k])).length).join(' | ')} |\n`;
  let t = `\n| | ${PLATAFORMAS.map(p => p[1]).join(' | ')} |\n|---|${PLATAFORMAS.map(() => ':---:').join('|')}|\n`;
  t += fila('Cumple ●', d => puntua(d) && d.cumple === 2);
  t += fila('Cumple con reparo ◐', d => puntua(d) && d.cumple === 1);
  t += fila('No cumple ○', d => puntua(d) && d.cumple === 0);
  if (faltan) t += fila('Sin verificar ◍', d => !puntua(d));
  t += fila('*— un plan pago lo mejoraría*', d => puntua(d) && d.conPlan?.length);
  t += `| **% de cumplimiento** | ${PLATAFORMAS.map(([k]) => {
    const c = cumplimiento(parte, k);
    return c === null ? '—' : `**${pct(c)}**`;
  }).join(' | ')} |\n`;
  return t;
}

let resultado = `\n| | ${PLATAFORMAS.map(p => p[1]).join(' | ')} |\n|---|${PLATAFORMAS.map(() => ':---:').join('|')}|\n`;
for (const parte of ['A', 'B']) {
  resultado += `| ${parte === 'A' ? 'Originales' : 'Opcionales'} (${(PARTE[parte] * 100).toFixed(0)} %) | ${PLATAFORMAS.map(([k]) => {
    const c = cumplimiento(parte, k);
    return c === null ? '—' : pct(c);
  }).join(' | ')} |\n`;
}
resultado += `| **Cumplimiento total** | ${PLATAFORMAS.map(([k]) => {
  const o = oferta(k);
  return o === null ? '—' : `**${pct(o)}**`;
}).join(' | ')} |\n`;
// La segunda escala: se publica al lado, sin sumarse; acá conviene lo bajo
const esfuerzo = (k) => {
  const ds = Object.values(res).map(x => x[k]).filter(d => puntua(d) && d.cumple > 0 && d.costo != null);
  return ds.length ? ds.reduce((s, d) => s + d.costo, 0) / (MAXIMO * ds.length) * 100 : null;
};
resultado += `| Esfuerzo de implementación *(conviene lo bajo)* | ${PLATAFORMAS.map(([k]) => {
  const e = esfuerzo(k);
  return e === null ? '—' : pct(e);
}).join(' | ')} |
`;
if (mejoraConPlan) {
  resultado += `| *Comentario: contratando los planes que mejoran algún criterio* | ${PLATAFORMAS.map(([k]) => {
    const o = oferta(k, (d) => conPlanPago(d).cumple);
    return o === null ? '—' : `*${pct(o)}*`;
  }).join(' | ')} |\n`;
}

// ── versiones pagas, como comentario ─────────────────────────────────────────
// En Bitrix24 y en Twenty cada plan incluye a los más baratos; en EspoCRM las
// extensiones se compran por separado y cada una agrega solo lo suyo.
const ACUMULA = { espocrm: false, twenty: true, bitrix24: true };
const importe = (monto) => Number(/[\d.,]+/.exec(monto)?.[0].replace(/[.,]/g, '') ?? 0);

function versiones(k) {
  const planes = new Map();
  const nombre = (plan) => plan.replace(new RegExp(`^${PLATAFORMAS.find(p => p[0] === k)[1]} `), '');
  for (const x of Object.values(res)) {
    const d = x[k];
    if (!puntua(d)) continue;
    for (const p of d.conPlan ?? []) {
      const v = planes.get(p.plan) ?? { plan: nombre(p.plan), monto: p.monto, criterios: [] };
      v.criterios.push(d.criterio);
      planes.set(p.plan, v);
    }
  }
  // Las extensiones de EspoCRM se listan antes que su nube, que se cobra por usuario
  const nube = (v) => (k === 'espocrm' && /Cloud/.test(v.plan) ? 1 : 0);
  const lista = [...planes.values()].sort((a, b) => nube(a) - nube(b) || importe(a.monto) - importe(b.monto));
  return lista.map((v, i) => {
    const incluidos = new Set(ACUMULA[k] ? lista.slice(0, i + 1).map(x => x.plan) : [v.plan]);
    // conPlan guarda el nombre completo; la tabla, sin la plataforma
    const incluye = (p) => incluidos.has(p.plan.replace(new RegExp(`^${PLATAFORMAS.find(x => x[0] === k)[1]} `), ''));
    const valor = (d) => Math.max(d.cumple, ...(d.conPlan ?? []).filter(incluye).map(p => p.cumple));
    return { ...v, oferta: oferta(k, valor) };
  });
}

const orden = (a, b) => a.localeCompare(b, 'es', { numeric: true });
const VERSION_EVALUADA = { espocrm: 'Community, instalación propia', twenty: 'Autoalojado', bitrix24: 'Free' };
let pagas = '';
for (const [k, nom] of PLATAFORMAS) {
  const lista = versiones(k);
  if (!lista.length) continue;
  pagas += `\n### ${nom}\n\n| Versión | Precio | Criterios que cambia | Cumplimiento total |\n|---|---|---|:---:|\n`;
  pagas += `| **${VERSION_EVALUADA[k]}** *(evaluada)* | **Gratis** | — | **${pct(oferta(k))}** |\n`;
  for (const v of lista) {
    pagas += `| ${v.plan} | ${v.monto} | ${v.criterios.sort(orden).join(', ')} | *${pct(v.oferta)}* |\n`;
  }
}

const conMejora = GRUPOS.flatMap(g => g.criterios)
  .filter(c => PLATAFORMAS.some(([k]) => puntua(res[c.id]?.[k]) && res[c.id][k].conPlan?.length));
let porCriterio = `\n| Criterio con ↑ | ${PLATAFORMAS.map(p => p[1]).join(' | ')} |\n|---|${PLATAFORMAS.map(() => '---').join('|')}|\n`;
for (const c of conMejora) {
  porCriterio += `| ${c.id} ${c.nombre} | ${PLATAFORMAS.map(([k]) => {
    const d = res[c.id]?.[k];
    if (!puntua(d) || !d.conPlan?.length) return '';
    return d.conPlan.map(p => `${p.plan.replace(`${PLATAFORMAS.find(x => x[0] === k)[1]} `, '')}: ${SIMBOLO[d.cumple]}→${SIMBOLO[p.cumple]}`).join('; ');
  }).join(' | ')} |\n`;
}

const salidaMatriz = `# 5. Matriz de veredictos

*Generada automáticamente a partir de los resultados registrados por las pruebas. No se transcribe ningún valor a mano.*

**● 2 cumple  ◐ 1 cumple con reparo  ○ 0 no cumple${faltan ? '  ◍ no se pudo verificar' : ''}**

Se evalúa la versión elegida de cada plataforma (EspoCRM Community, Twenty autoalojado y Bitrix24 en su plan gratuito) y solo lo que esa versión trae. El ● y el ◐ indican que la necesidad queda resuelta; el ◐, que queda resuelta con un costo o una salvedad que la compañía carga de forma permanente. El ○ indica que la versión evaluada no la resuelve.

La flecha **↑** marca los criterios que un plan pago o una extensión del fabricante mejorarían. Es un comentario y no cambia el valor: qué plan lo incluye y cuánto cuesta figura en la sección 5.${nTipo + 2}.

La tabla se ordena como se relevaron los requerimientos: primero por tipo (funcionales, técnicos y operativos), dentro de cada tipo por origen (lo que pidió el cliente y lo que se agregó) y dentro de cada origen por grupo. Cada grupo cierra con su **subtotal**: los puntos obtenidos sobre el máximo posible y el porcentaje que representan.

Estado: **${evaluadas - sinVerificar} de ${TOTAL_BASE} evaluaciones completas.**
${matriz}
## 5.${nTipo + 1} Resultado

### Recuento de los originales
${recuento('A')}
### Recuento de los opcionales
${recuento('B')}
### Cumplimiento total
${resultado}
### Cómo leer estos recuentos

El porcentaje de los originales y el de los opcionales es el promedio de los porcentajes de sus grupos: cada grupo pesa lo mismo, aunque tenga más criterios que otro. Por eso puede diferir del subtotal por tipo, que suma los puntos de todos los criterios del tipo.

El cumplimiento total combina las dos partes: **85 % los originales y 15 % los opcionales** (sección 3.6).

El esfuerzo de implementación mide, sobre lo que cada plataforma cumple, cuánto trabajo exige dejarlo funcionando: 0 % si todo viene listo, 100 % si todo exige programar o repetir trabajo en cada uso. Se publica junto al cumplimiento total y no se suma a él.${mejoraConPlan ? `

La última fila es un comentario: muestra dónde quedaría cada plataforma si se contrataran los planes que mejoran algún criterio. No es su puntaje, porque se evalúa la versión elegida.` : ''}${faltan ? `

Lo que no se pudo verificar no recibe valor y queda fuera del cálculo, tanto del obtenido como del máximo posible.` : ''}
${mejoraConPlan ? `
## 5.${nTipo + 2} Lo que agregarían las versiones pagas

Las versiones pagas no se operaron: lo que sigue surge de la documentación de cada fabricante y se informa como comentario, sin cambiar el puntaje de la versión evaluada. Se listan solo las versiones que cambian algún criterio; las que agregan únicamente usuarios, almacenamiento o alojamiento figuran con su precio en la sección 2.5.

La columna de cumplimiento total indica dónde quedaría la plataforma contratando esa versión. En Twenty y en Bitrix24 cada plan incluye lo de los más baratos; en EspoCRM cada extensión se compra por separado y agrega solo lo suyo.
${pagas}
### Qué versión cambia cada criterio

Para cada criterio, el valor en la versión evaluada y el que tendría con cada versión paga que lo cambia. Cuando el símbolo no cambia, la versión paga reduce el costo de implementación.
${porCriterio}` : ''}`;


// ── 6. detalle por requerimiento ─────────────────────────────────────────────
let detalle = '';
for (const g of GRUPOS) {
  detalle += `\n## ${g.id} ${g.nombre}\n`;
  for (const c of g.criterios) {
    detalle += `\n### ${c.id} ${c.nombre}\n\n**Qué resuelve.** ${c.necesidad}.\n`;
    for (const [k, nom] of PLATAFORMAS) {
      const d = res[c.id]?.[k];
      if (!d) { detalle += `\n**${nom}** — *pendiente de evaluación.*\n`; continue; }
      if (!puntua(d)) { detalle += `\n**${nom}** — *no se pudo verificar.* ${d.motivo}\n`; continue; }
      const costo = d.costo !== undefined && d.costo !== null ? ` · costo de implementación **${d.costo}**` : '';
      detalle += `\n**${nom}** · **${d.cumple}** (${ETIQUETA[d.cumple]})${costo}\n\n`;
      if (d.comoLoHace) detalle += `- *Cómo lo hace.* ${d.comoLoHace}\n`;
      if (d.caracteristicas) detalle += `- *Características.* ${d.caracteristicas}${d.medicion ? ` ${d.medicion}.` : ''}\n`;
      detalle += `- *Justificación.* ${d.justificacion}`;
      if (d.licencia) {
        detalle += ` Requiere ${d.licencia.plan}: ${d.licencia.monto} (${d.licencia.modalidad === 'unico' ? 'pago único' : 'abono recurrente'}).`;
      }
      detalle += '\n';
      for (const x of d.conPlan ?? []) {
        const cx = x.costo !== undefined && x.costo !== null ? `, costo ${x.costo}` : '';
        // El monto trae su propio periodo: no todos los abonos son mensuales
        const precio = `${x.monto}, ${x.modalidad === 'unico' ? 'pago único' : 'abono recurrente'}`;
        detalle += `- *Comentario — con ${x.plan}* (${precio}) sería **${x.cumple}** (${ETIQUETA[x.cumple]}${cx}). ${x.justificacion}\n`;
      }
      // La constancia va textual: una parafrasis no se puede contrastar
      for (const f of d.documentacion ?? []) {
        detalle += `\n> «${f.cita}»\n>\n> — ${f.url}, consultado el ${fecha(f.consultado)}\n`;
      }
    }
  }
}

// ── 9. fuentes ───────────────────────────────────────────────────────────────
const porUrl = new Map();
for (const [k, nom] of PLATAFORMAS) {
  for (const x of Object.values(res)) {
    const d = x[k];
    if (!puntua(d)) continue;
    for (const f of d.documentacion ?? []) {
      const previa = porUrl.get(f.url);
      const criterios = new Set([...(previa?.criterios ?? []), d.criterio]);
      porUrl.set(f.url, {
        plataforma: previa?.plataforma && previa.plataforma !== nom ? 'Varias' : nom,
        consultado: !previa || f.consultado > previa.consultado ? f.consultado : previa.consultado,
        criterios,
      });
    }
  }
}
let fuentes = '';
for (const nom of [...PLATAFORMAS.map(p => p[1]), 'Varias']) {
  const lista = [...porUrl].filter(([, v]) => v.plataforma === nom).sort(([a], [b]) => orden(a, b));
  if (!lista.length) continue;
  fuentes += `\n### ${nom === 'Varias' ? 'Fuentes comunes a más de una plataforma' : nom}\n\n`;
  for (const [url, v] of lista) {
    fuentes += `- ${url} — consultado el ${fecha(v.consultado)}. Sostiene ${[...v.criterios].sort(orden).join(', ')}.\n`;
  }
}

mkdirSync(SALIDA, { recursive: true });
writeFileSync(join(SALIDA, '05-matriz-de-veredictos.md'), salidaMatriz, 'utf8');
rmSync(join(SALIDA, '06-analisis-por-categoria.md'), { force: true });
writeFileSync(join(SALIDA, '06-detalle-por-requerimiento.md'),
  `# 6. Detalle por requerimiento

*Generado automáticamente a partir de lo registrado durante las pruebas.*

Cada requerimiento indica qué resuelve para la compañía y, para cada plataforma, el valor obtenido, cómo lo resuelve, las características de esa solución y la justificación del valor. Cuando un plan pago lo cambiaría, se agrega como comentario: no modifica el valor. Las escalas están definidas en la sección 3 y los procedimientos, en la sección 4.
${detalle}`, 'utf8');
writeFileSync(join(SALIDA, '09-fuentes.md'), `# 9. Fuentes

*Generada automáticamente a partir de las constancias registradas durante las pruebas.*

## 9.1 Documentación oficial de las plataformas

Cada dirección se consultó en la fecha indicada.
${fuentes}
## 9.2 Evidencia propia

Los valores asignados en la sección 5 surgen de ejecutar los procedimientos de la sección 4 sobre cada plataforma. Cada ejecución dejó registro en video y capturas de pantalla, conservados por el equipo y disponibles ante consulta.

Este informe no depende de ese material para su lectura: los hallazgos relevantes están volcados en las secciones 5 a 8, con el detalle necesario para sostener cada conclusión.

## 9.3 Marco normativo

- Ley 25.326 de Protección de Datos Personales, República Argentina. Sostiene el criterio B.1.6.

## 9.4 Datos del mercado asegurador

- https://www.argentina.gob.ar/superintendencia-de-seguros/estadisticas/polizas-siniestros-y-primas — Superintendencia de Seguros de la Nación, *Pólizas y Cantidad de Siniestros, 1er trimestre de 2026* (IF-2026-59950848-APN-GEYE#SSN), consultado el 7 de noviembre de 2026. Sostiene la cifra de referencia de la sección 4.7.
- https://karriere.mckinsey.de/industries/financial-services/our-insights/unlocking-the-potential-of-deeper-customer-agent-insurer-relationships — McKinsey & Company, *Unlocking the potential of deeper customer-agent-insurer relationships*, consultado el 7 de noviembre de 2026. Sostiene la cifra de referencia de la sección 4.7.
- https://www.muysegura.com/reflexiones-sobre-la-venta-cruzada-de-seguros/ — Isidre Martínez Ivars, *Reflexiones sobre la venta cruzada de seguros*, Muy Segura, 25 de mayo de 2021, consultado el 7 de noviembre de 2026. Sostiene la cifra de referencia de la sección 4.7.
`, 'utf8');

console.log(`Matriz, detalle y fuentes generados en ${SALIDA}`);
console.log(`  ${evaluadas - sinVerificar} evaluaciones completas de ${TOTAL_BASE} posibles · ${porUrl.size} fuentes`);
