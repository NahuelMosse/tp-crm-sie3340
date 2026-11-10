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
const ORIGEN = { A: 'Requerimientos originales (solicitados)', B: 'Requerimientos deseables (no solicitados)' };
const TIPOS = [
  ['funcional', 'Funcionales'],
  ['tecnica', 'Técnicos'],
  ['operativa', 'Operativos'],
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

// ── 5. matriz, por origen → tipo → grupo ─────────────────────────────────────
const cabeza = `| Criterio | ${PLATAFORMAS.map(p => p[1]).join(' | ')} |\n|---|${PLATAFORMAS.map(() => ':---:').join('|')}|\n`;
const cabezaSimple = `| | ${PLATAFORMAS.map(p => p[1]).join(' | ')} |\n|---|${PLATAFORMAS.map(() => ':---:').join('|')}|\n`;
let matriz = '';
let nParte = 0;
for (const parte of ['A', 'B']) {
  const deLaParte = GRUPOS.filter(g => g.parte === parte);
  if (!deLaParte.length) continue;
  nParte++;
  matriz += `\n## 4.${nParte} ${ORIGEN[parte]}\n`;
  const porTipo = [];
  for (const [tipo, titulo] of TIPOS) {
    const grupos = deLaParte.map(g => ({ ...g, criterios: g.criterios.filter(c => c.tipo === tipo) }))
      .filter(g => g.criterios.length);
    if (!grupos.length) continue;
    porTipo.push([titulo, grupos.flatMap(g => g.criterios)]);
    // Los no funcionales van en una sola tabla: técnicos y operativos abren cada uno su franja
    if (tipo === 'funcional') matriz += `\n### ${titulo}\n`;
    else if (tipo === 'tecnica' || !porTipo.some(([t]) => t === 'Técnicos')) matriz += `\n### No funcionales\n`;
    for (const g of grupos) {
      // Un grupo que reparte sus criterios entre tipos lleva el tipo en el título
      const parcial = g.criterios.length < GRUPOS.find(x => x.id === g.id).criterios.length;
      const sufijo = parcial ? ` — ${titulo.toLowerCase()}` : '';
      matriz += `\n#### ${g.id} ${g.nombre}${sufijo}\n\n${cabeza}`;
      for (const c of g.criterios) {
        matriz += `| ${c.id} ${c.nombre} | ${PLATAFORMAS.map(([k]) => simbolo(res[c.id]?.[k])).join(' | ')} |\n`;
      }
      matriz += `| **Subtotal ${g.id}${sufijo}** | ${PLATAFORMAS.map(([k]) => `**${subtotal(g.criterios, k)}**`).join(' | ')} |\n`;
    }
  }
  // Subtotal de la parte por tipo
  matriz += `\n### Subtotal por tipo\n\n${cabezaSimple}`;
  for (const [titulo, criterios] of porTipo) {
    matriz += `| ${titulo} | ${PLATAFORMAS.map(([k]) => subtotal(criterios, k)).join(' | ')} |\n`;
  }
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
  resultado += `| ${parte === 'A' ? 'Originales' : 'Deseables'} (${(PARTE[parte] * 100).toFixed(0)} %) | ${PLATAFORMAS.map(([k]) => {
    const c = cumplimiento(parte, k);
    return c === null ? '—' : pct(c);
  }).join(' | ')} |\n`;
}
resultado += `| **Cumplimiento total** | ${PLATAFORMAS.map(([k]) => {
  const o = oferta(k);
  return o === null ? '—' : `**${pct(o)}**`;
}).join(' | ')} |\n`;
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
    // Cada fila se compara contra la versión gratuita: en los planes que acumulan, lista también lo que
    // ya traían los más baratos
    const criterios = [...new Set(lista.filter(x => incluidos.has(x.plan)).flatMap(x => x.criterios))];
    return { ...v, criterios, oferta: oferta(k, valor) };
  });
}

const orden = (a, b) => a.localeCompare(b, 'es', { numeric: true });
const VERSION_EVALUADA = { espocrm: 'Community, instalación propia', twenty: 'Autoalojado', bitrix24: 'Free' };
let pagas = '';
for (const [k, nom] of PLATAFORMAS) {
  const lista = versiones(k);
  if (!lista.length) continue;
  pagas += `\n### ${nom}\n\n| Versión | Precio | Criterios que mejora respecto de la gratuita | Cumplimiento total |\n|---|---|---|:---:|\n`;
  pagas += `| **${VERSION_EVALUADA[k]}** *(evaluada)* | **Gratis** | — | **${pct(oferta(k))}** |\n`;
  for (const v of lista) {
    pagas += `| ${v.plan} | ${v.monto} | ${v.criterios.sort(orden).join(', ')} | *${pct(v.oferta)}* |\n`;
  }
}

const salidaMatriz = `# 4. Matriz de veredictos

**● 2 cumple  ◐ 1 cumple con reparo  ○ 0 no cumple${faltan ? '  ◍ sin verificar' : ''}  ↑ un plan pago lo mejoraría**

**Subtotal: puntos obtenidos / máximo · %**
${faltan ? `
Estado: **${evaluadas - sinVerificar} de ${TOTAL_BASE} evaluaciones completas.**
` : ''}${matriz}
## 4.${nParte + 1} Resultado

### Recuento de los originales
${recuento('A')}
### Recuento de los deseables
${recuento('B')}
### Cumplimiento total
${resultado}
${mejoraConPlan ? `
## 4.${nParte + 2} Lo que agregarían las versiones pagas

Cada tabla compara las versiones pagas de una plataforma con su versión gratuita, la evaluada. Cada fila muestra el precio, todos los criterios que esa versión mejora respecto de la gratuita y el cumplimiento total que alcanzaría la plataforma con ella. En Twenty y en Bitrix24 cada plan incluye todo lo de los más baratos, así que su fila repite los criterios de los planes anteriores. En EspoCRM, en cambio, cada extensión se compra por separado y su fila muestra solo lo que agrega esa extensión. Las versiones pagas no se operaron: lo que sigue surge de la documentación de cada fabricante.
${pagas}` : ''}`;


// ── 6. detalle por requerimiento ─────────────────────────────────────────────
// Las cifras de referencia de los criterios que las necesitan van con su criterio, debajo del «qué resuelve»
const CIFRAS = Object.fromEntries(
  readFileSync(join(AQUI, '..', '..', 'humanos', 'informe', 'cifras-de-referencia.md'), 'utf8')
    .replace(/\r/g, '').split(/^## /m).slice(1)
    .map(b => { const [id, ...resto] = b.split('\n'); return [id.trim(), resto.join('\n').trim()]; }));
let detalle = '';
for (const g of GRUPOS) {
  detalle += `\n## ${g.id} ${g.nombre}\n`;
  for (const c of g.criterios) {
    // B.2 trae su fundamento, no una capacidad: se rotula como tal
    const rotulo = c.id.startsWith('B.2.') ? 'Por qué importa' : 'Qué resuelve';
    detalle += `\n### ${c.id} ${c.nombre}\n\n**${rotulo}.** ${c.necesidad}.\n`;
    if (CIFRAS[c.id]) detalle += `\n${CIFRAS[c.id]}\n`;
    for (const [k, nom] of PLATAFORMAS) {
      const d = res[c.id]?.[k];
      if (!d) { detalle += `\n**${nom}** — *sin verificar.*\n`; continue; }
      if (!puntua(d)) { detalle += `\n**${nom}** — *sin verificar.* ${d.motivo}\n`; continue; }
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
      if (d.evidencia?.length) {
        detalle += `- *Evidencia.* Prueba sobre el sistema, con video y las capturas ${d.evidencia.map(x => x.replace(/\.png$/, '')).join(', ')}.\n`;
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
      porUrl.set(f.url, { plataforma: previa?.plataforma && previa.plataforma !== nom ? 'Varias' : nom });
    }
  }
}
let fuentes = '';
for (const nom of [...PLATAFORMAS.map(p => p[1]), 'Varias']) {
  const lista = [...porUrl].filter(([, v]) => v.plataforma === nom).sort(([a], [b]) => orden(a, b));
  if (!lista.length) continue;
  fuentes += `\n### ${nom === 'Varias' ? 'Fuentes comunes a más de una plataforma' : nom}\n\n`;
  for (const [url, v] of lista) {
    fuentes += `- ${url}\n`;
  }
}

mkdirSync(SALIDA, { recursive: true });
writeFileSync(join(SALIDA, '04-matriz-de-veredictos.md'), salidaMatriz, 'utf8');
rmSync(join(SALIDA, '06-analisis-por-categoria.md'), { force: true });
// Las cifras de referencia citan sus fuentes como {{dirección}}: llevan el número que esa fuente
// tiene en la sección 8, en el mismo orden en que el exportador las numera
const salidaFuentes = `# 8. Fuentes

## 8.1 Documentación oficial de las plataformas

${fuentes}
## 8.2 Marco normativo

- https://www.argentina.gob.ar/normativa/nacional/39520/texto — Ley 17.418 de Seguros, República Argentina.
- https://www.argentina.gob.ar/normativa/nacional/238219/texto — Superintendencia de Seguros de la Nación, *Reglamento General de la Actividad Aseguradora* (Resolución SSN 38.708/2014).
- https://www.argentina.gob.ar/sites/default/files/ssn_reso225_2022.pdf — Superintendencia de Seguros de la Nación, Resolución 225/2022, *Manual Operativo y de Procedimientos para la Tramitación de Consultas y Denuncias*.
- https://servicios.infoleg.gob.ar/infolegInternet/anexos/60000-64999/64790/texact.htm — Ley 25.326 de Protección de los Datos Personales, República Argentina, texto actualizado en InfoLEG.
- https://www.argentina.gob.ar/normativa/nacional/decreto-1558-2001-70368/texto — Decreto 1558/2001, reglamentario de la Ley 25.326.
- https://www.argentina.gob.ar/normativa/nacional/267922/texto — Dirección Nacional de Protección de Datos Personales, Disposición 60-E/2016, países con protección adecuada y cláusulas contractuales tipo.
- https://www.boletinoficial.gob.ar/detalleAviso/primera/202373/20190226 — Agencia de Acceso a la Información Pública, Resolución 34/2019, actualización de la lista de países con protección adecuada.
- https://www.argentina.gob.ar/normativa/nacional/resoluci%C3%B3n-47-2018-312662/texto — Agencia de Acceso a la Información Pública, Resolución 47/2018, *Medidas de seguridad recomendadas para el tratamiento y conservación de los datos personales*.
- https://www.bcra.gob.ar/archivos/Pdfs/Texord/t-rmgcti.pdf — Banco Central de la República Argentina, *Requisitos mínimos para la gestión y control de los riesgos de tecnología y seguridad de la información*, texto ordenado. Rige para entidades financieras; se cita como referencia de buenas prácticas.

## 8.3 Datos del mercado asegurador

- https://www.argentina.gob.ar/superintendencia-de-seguros/estadisticas/polizas-siniestros-y-primas — Superintendencia de Seguros de la Nación, *Pólizas y Cantidad de Siniestros, 1er trimestre de 2026* (IF-2026-59950848-APN-GEYE#SSN).
- https://karriere.mckinsey.de/industries/financial-services/our-insights/unlocking-the-potential-of-deeper-customer-agent-insurer-relationships — McKinsey & Company, *Unlocking the potential of deeper customer-agent-insurer relationships*.
- https://www.muysegura.com/reflexiones-sobre-la-venta-cruzada-de-seguros/ — Isidre Martínez Ivars, *Reflexiones sobre la venta cruzada de seguros*, Muy Segura, 25 de mayo de 2021.
`;
const NUMERO = {};
for (const m of salidaFuentes.matchAll(/^- (https?:\/\/\S+)/gm)) NUMERO[m[1]] ??= Object.keys(NUMERO).length + 1;
const citar = (t) => t.replace(/ ?\{\{(https?:\/\/[^}]+)\}\}/g, (_, u) => {
  if (!NUMERO[u]) throw new Error(`Una cifra de referencia cita una fuente que no está en la sección 8: ${u}`);
  return ` [${NUMERO[u]}]`;
});

writeFileSync(join(SALIDA, '05-detalle-por-requerimiento.md'),
  `# 5. Detalle por requerimiento

Cada requerimiento indica qué resuelve para la compañía y, para cada plataforma, el valor obtenido, cómo lo resuelve, las características de esa solución y la justificación del valor. Cuando un plan pago lo cambiaría, se agrega como comentario: no modifica el valor. Las escalas están definidas en la sección 2 y los procedimientos, en la sección 3.
${citar(detalle)}`, 'utf8');
writeFileSync(join(SALIDA, '08-fuentes.md'), salidaFuentes, 'utf8');

console.log(`Matriz, detalle y fuentes generados en ${SALIDA}`);
console.log(`  ${evaluadas - sinVerificar} evaluaciones completas de ${TOTAL_BASE} posibles · ${porUrl.size} fuentes`);
