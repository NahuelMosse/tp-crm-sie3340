#!/usr/bin/env node
/**
 * Genera la matriz de veredictos y el análisis por criterio desde los
 * resultados registrados por los tests.
 *
 *   node generar-matriz.mjs [raiz-del-repo]
 *
 * Ningún número del informe se escribe a mano: todo sale de resultados/*.json
 */
import { readdirSync, readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import catalogo from './catalogo.cjs';

const AQUI = dirname(fileURLToPath(import.meta.url));
const RAIZ = process.argv[2] ?? AQUI;
const RESULTADOS = join(AQUI, 'resultados');
const SALIDA = join(RAIZ, 'humanos', 'informe');

// Tres herramientas, tres columnas. El veredicto se registra sobre la edicion
// gratuita, que es la que cualquiera puede usar sin contratar nada.
//
// Los criterios que un plan pago resuelve de otra manera llevan ademas un
// veredicto por cada plan que los cambia, dentro del mismo criterio. Eso da el
// desglose por nivel de pago sin multiplicar las columnas ni el trabajo: solo
// se evalua dos veces lo que de verdad cambia al pagar.
const PLATAFORMAS = [
  ['espocrm', 'EspoCRM'],
  ['twenty', 'Twenty'],
  ['bitrix24', 'Bitrix24'],
];

// Los grupos y sus criterios salen de la seccion 4 del informe, que es donde
// estan definidos. Todos pesan igual dentro de su parte: el pedido del cliente
// no jerarquiza sus necesidades, de modo que el analisis tampoco lo hace, y
// afinar el catalogo no mueve ningun puntaje.
const { GRUPOS } = catalogo;
const PESO_GRUPO = 1;


// Reparto ENTRE partes: lo que el cliente pidio pesa mas que lo que no pidio.
const PARTE = { A: 0.85, B: 0.15 };

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

// La licencia no cambia el simbolo: es dinero, no cumplimiento. Va en su
// propia fila del recuento y alimenta la oferta economica.
const simbolo = (d) => {
  if (!puntua(d)) return '◍';
  // La flecha avisa que un plan pago mejora este veredicto; el detalle va en la seccion 6
  return SIMBOLO[d.cumple] + (d.conPlan?.length ? '↑' : '');
};

/** Mejor veredicto alcanzable contratando un plan, o el de la edicion gratuita. */
const conPlanPago = (d) => {
  if (!puntua(d) || !d.conPlan?.length) return d;
  return d.conPlan.reduce((mejor, x) => (x.cumple > mejor.cumple ? x : mejor), d);
};

const puntua = (d) => d && d.puntua !== false;

/** Fecha en el formato del informe. Lo publicado cambia: la constancia lleva el dia. */
// La fecha se guarda como día calendario: se lee en UTC para que el huso horario no la corra un día
const fecha = (iso) => new Date(iso).toLocaleDateString('es-AR',
  { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

// ── matriz ───────────────────────────────────────────────────────────────────
let matriz = '';
let analisis = '';
const acum = { A: {}, B: {} };
for (const [, nom] of PLATAFORMAS) { acum.A[nom] = []; acum.B[nom] = []; }

for (const { id: gid, nombre: gnombre, parte, criterios: items } of GRUPOS) {
  matriz += `\n### ${gid} ${gnombre}\n\n`;
  matriz += `| Criterio | ${PLATAFORMAS.map(p => p[1]).join(' | ')} |\n`;
  matriz += `|---|${PLATAFORMAS.map(() => ':---:').join('|')}|\n`;

  analisis += `\n## ${gid} ${gnombre}\n`;

  for (const { id: cid, nombre: cnombre } of items) {
    matriz += `| ${cid} ${cnombre} | ${PLATAFORMAS.map(([k]) => simbolo(res[cid]?.[k])).join(' | ')} |\n`;

    analisis += `\n### ${cid} ${cnombre}\n`;

    let algo = false;
    for (const [k, nom] of PLATAFORMAS) {
      const d = res[cid]?.[k];
      acum[parte][nom].push({ d, gid });
      if (d?.conPlan?.length) acum[parte].mejoraConPlan = true;
      if (!d) continue;
      algo = true;
      if (d.puntua === false) {
        analisis += `**${nom}** — *sin verificar.* ${d.motivo}\n\n`;
      } else {
        const ETIQUETA = { 2: 'cumple', 1: 'cumple con reparo', 0: 'no cumple' };
        const costo = d.costo ? ` · costo de implementación **${d.costo}**` : '';
        const lic = d.licencia
          ? ` Requiere ${d.licencia.plan}: ${d.licencia.monto} (${d.licencia.modalidad === 'unico' ? 'pago único' : 'abono recurrente'}).`
          : '';
        const med = d.medicion ? ` *${d.medicion}.*` : '';
        analisis += `**${nom}** · **${d.cumple}** (${ETIQUETA[d.cumple]})${costo} — ${d.justificacion}${lic}${med}\n\n`;
        // La constancia va textual: una parafrasis no se puede contrastar
        for (const f of d.documentacion ?? []) {
          analisis += `> «${f.cita}»\n>\n> — ${f.url}, consultado el ${fecha(f.consultado)}\n\n`;
        }
        for (const x of d.conPlan ?? []) {
          const c = x.costo ? ` · costo de implementación **${x.costo}**` : '';
          // El monto trae su propio periodo: no todos los abonos son mensuales
          const precio = `${x.monto}, ${x.modalidad === 'unico' ? 'pago único' : 'abono recurrente'}`;
          analisis += `   ↳ **Con ${x.plan}** (${precio}) · **${x.cumple}** (${ETIQUETA[x.cumple]})${c} — ${x.justificacion}

`;
        }
      }
    }
    if (!algo) analisis += `*Pendiente de evaluación en todas las alternativas.*\n\n`;
  }
}

// ── recuentos ────────────────────────────────────────────────────────────────

/** % de cumplimiento de una plataforma en una parte, sobre el maximo de esa misma parte. */
function cumplimiento(parte, nom, soloGratuito = false) {
  const valor = (d) => (soloGratuito ? d : conPlanPago(d)).cumple;
  let suma = 0, pesos = 0;
  for (const { id: gid, parte: suParte } of GRUPOS) {
    if (suParte !== parte) continue;
    const v = acum[parte][nom].filter(x => x.gid === gid && puntua(x.d));
    if (!v.length) continue;   // un grupo sin verificar no arrastra: su peso se reparte
    const pct = v.reduce((s, x) => s + valor(x.d), 0) / (MAXIMO * v.length) * 100;
    suma += pct * PESO_GRUPO;
    pesos += PESO_GRUPO;
  }
  return pesos ? suma / pesos : null;
}

function resumen(parte) {
  let t = `\n| | ${PLATAFORMAS.map(p => p[1]).join(' | ')} |\n|---|${PLATAFORMAS.map(() => ':---:').join('|')}|\n`;
  const fila = (etiqueta, fn) =>
    `| ${etiqueta} | ${PLATAFORMAS.map(([, nom]) => acum[parte][nom].filter(fn).length).join(' | ')} |\n`;
  t += fila('Cumple ●', x => puntua(x.d) && x.d.cumple === 2);
  t += fila('Cumple con reparo ◐', x => puntua(x.d) && x.d.cumple === 1);
  t += fila('No cumple ○', x => puntua(x.d) && x.d.cumple === 0);
  t += fila('Sin verificar ◍', x => !x.d || x.d.puntua === false);
  // Lo que un plan pago resuelve o mejora: se registra como licencia o como veredicto con plan
  t += fila('*— mejoran contratando un plan*', x => puntua(x.d) && (x.d.licencia || x.d.conPlan?.length));
  t += `| **% de cumplimiento** | ${PLATAFORMAS.map(([, nom]) => {
    const c = cumplimiento(parte, nom);
    return c === null ? '—' : `**${c.toFixed(1)} %**`;
  }).join(' | ')} |\n`;
  // Solo cuando algun criterio mejora al contratar: si no, la fila repite la anterior
  if (acum[parte].mejoraConPlan) {
    t += `| *% solo con la edición gratuita* | ${PLATAFORMAS.map(([, nom]) => {
      const c = cumplimiento(parte, nom, true);
      return c === null ? '—' : `*${c.toFixed(1)} %*`;
    }).join(' | ')} |\n`;
  }
  return t;
}

/**
 * Extremos en que caeria el porcentaje de una parte si todo lo pendiente
 * cumpliera, o si nada cumpliera. Mide cuanto depende el resultado de lo que
 * todavia no se midio.
 */
function banda(parte, nom) {
  let lo = 0, hi = 0, pesos = 0;
  for (const { id: gid, parte: suParte } of GRUPOS) {
    if (suParte !== parte) continue;
    const t = acum[parte][nom].filter(x => x.gid === gid);
    if (!t.length) continue;
    const obt = t.filter(x => puntua(x.d)).reduce((s, x) => s + conPlanPago(x.d).cumple, 0);
    const falta = t.filter(x => !puntua(x.d)).length;
    const max = MAXIMO * t.length;
    lo += obt / max * 100 * PESO_GRUPO;
    hi += (obt + falta * MAXIMO) / max * 100 * PESO_GRUPO;
    pesos += PESO_GRUPO;
  }
  return pesos ? { min: lo / pesos, max: hi / pesos } : null;
}

/** Puntaje tecnico: las dos partes combinadas segun el reparto 85/15. */
function tecnico() {
  let t = `\n| | ${PLATAFORMAS.map(p => p[1]).join(' | ')} |\n|---|${PLATAFORMAS.map(() => ':---:').join('|')}|\n`;
  const fila = (etiqueta, parte) =>
    `| ${etiqueta} | ${PLATAFORMAS.map(([, nom]) => {
      const c = cumplimiento(parte, nom);
      return c === null ? '—' : `${c.toFixed(1)} %`;
    }).join(' | ')} |\n`;
  t += fila(`Parte A — solicitados (${(PARTE.A * 100).toFixed(0)} %)`, 'A');
  t += fila(`Parte B — no solicitados (${(PARTE.B * 100).toFixed(0)} %)`, 'B');
  const falta = PLATAFORMAS.some(([, nom]) =>
    ['A', 'B'].some(p => acum[p][nom].some(x => !puntua(x.d))));
  if (falta) {
    t += `| *Rango posible según lo que falta verificar* | ${PLATAFORMAS.map(([, nom]) => {
      const a = banda('A', nom), b = banda('B', nom);
      if (!a || !b) return '—';
      const lo = a.min * PARTE.A + b.min * PARTE.B;
      const hi = a.max * PARTE.A + b.max * PARTE.B;
      return `*${lo.toFixed(1)} a ${hi.toFixed(1)} %*`;
    }).join(' | ')} |\n`;
  }
  t += `| **Oferta técnica** | ${PLATAFORMAS.map(([, nom]) => {
    const a = cumplimiento('A', nom), b = cumplimiento('B', nom);
    if (a === null && b === null) return '—';
    // Si una parte no tiene evaluaciones, el total se reparte sobre la otra.
    const pa = a === null ? 0 : PARTE.A, pb = b === null ? 0 : PARTE.B;
    const total = ((a ?? 0) * pa + (b ?? 0) * pb) / (pa + pb);
    return `**${total.toFixed(1)} %**`;
  }).join(' | ')} |\n`;
  return t;
}

const evaluadas = Object.values(res).reduce((n, x) => n + Object.keys(x).length, 0);
const cab = `# 5. Matriz de veredictos

*Generada automáticamente a partir de los resultados registrados por las pruebas. No se transcribe ningún valor a mano.*

**● 2 cumple  ◐ 1 cumple con reparo  ○ 0 no cumple  ◍ sin verificar**

Ambos, ● y ◐, indican que la necesidad queda resuelta. El ◐ marca que queda resuelta con un costo o una salvedad que la compañía carga de forma permanente. El ○ se reserva para lo que no existe en ninguna edición del producto, y exige constancia del fabricante.

Que una capacidad requiera un plan pago no cambia su símbolo: eso es dinero, no cumplimiento, y se contabiliza aparte para la oferta económica.

Lo no verificado no recibe valor y queda fuera del cálculo, tanto del obtenido como del máximo posible. Es un estado transitorio del trabajo, no una característica de la plataforma.

Estado: **${evaluadas} de ${TOTAL_BASE} evaluaciones registradas.**

---

# PARTE A — Criterios solicitados
`;

const partes = matriz.split('\n### B.1');
const salidaMatriz = cab + partes[0] +
  `\n### Recuento de la Parte A\n${resumen('A')}\n---\n\n# PARTE B — Criterios no solicitados\n\n### B.1` +
  partes[1] +
  `\n### Recuento de la Parte B\n${resumen('B')}
\n---\n
## 5.1 Oferta técnica
${tecnico()}
## 5.2 Cómo leer estos recuentos

El porcentaje de cada grupo se calcula **solo sobre sus características verificadas**, y el de la parte es el promedio de sus grupos. Un grupo sin nada verificado queda fuera, de modo que el resultado nunca depende de lo que todavía no se midió.

La oferta técnica combina las dos partes según lo que el cliente pidió: **85 % la Parte A y 15 % la Parte B.** Dentro de cada parte los grupos pesan lo mismo entre sí: el pedido del cliente no jerarquiza sus necesidades, de modo que el análisis tampoco lo hace.

El **rango posible** muestra dónde caería el resultado si todo lo pendiente resultara favorable y dónde si resultara desfavorable. Mientras esa banda sea ancha, el orden entre plataformas todavía no está decidido por la evidencia sino por lo que falta medir.

Un porcentaje alto sobre pocas características verificadas no es comparable con uno sobre el total. La cantidad de evaluaciones registradas por plataforma figura en la fila correspondiente.
`;

mkdirSync(SALIDA, { recursive: true });
writeFileSync(join(SALIDA, '05-matriz-de-veredictos.md'), salidaMatriz, 'utf8');
writeFileSync(join(SALIDA, '06-analisis-por-categoria.md'),
  `# 6. Análisis por criterio

*Generado automáticamente a partir de las justificaciones registradas durante las pruebas.*

Cada criterio indica, para cada plataforma, el valor de cumplimiento, el costo de implementación cuando corresponde y la razón del valor. Las dos escalas están definidas en la sección 3; los procedimientos, en la sección 4.
${analisis}`, 'utf8');

console.log(`Matriz y análisis generados en ${SALIDA}`);
console.log(`  ${evaluadas} evaluaciones registradas de ${TOTAL_BASE} posibles`);
