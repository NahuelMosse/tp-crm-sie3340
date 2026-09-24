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

// Catálogo de criterios: id, nombre y criticidad. Debe coincidir con la sección 4.
const CRITERIOS = [
  ['A.1', 'Cartera de pólizas', [
    ['A.1.1', 'Modelado de la póliza como objeto propio', 'nucleo'],
    ['A.1.2', 'Campos de lista para el ramo y el estado de cobranza', 'nucleo'],
    ['A.1.3', 'Prima con importe y moneda', 'nucleo'],
    ['A.1.4', 'Vigencia con fecha de inicio y de fin', 'nucleo'],
    ['A.1.5', 'Aviso anticipado de vencimiento', 'soporte'],
    ['A.1.6', 'Consulta y filtrado de la cartera', 'nucleo'],
    ['A.1.7', 'Operación masiva sobre la cartera', 'soporte'],
  ]],
  ['A.2', 'Captación y proceso de venta', [
    ['A.2.1', 'Registro del solicitante con sus datos de contacto', 'nucleo'],
    ['A.2.2', 'Calificación y priorización del solicitante', 'nucleo'],
    ['A.2.3', 'Conversión del solicitante en oportunidad de venta', 'nucleo'],
    ['A.2.4', 'Embudo de oportunidades con etapas', 'nucleo'],
    ['A.2.5', 'Embudos diferenciados por ramo', 'soporte'],
    ['A.2.6', 'Oportunidades de cambio y ampliación sobre la cartera', 'nucleo'],
  ]],
  ['A.3', 'Productores y actividad comercial', [
    ['A.3.1', 'Registro de productores y asignación de cartera', 'nucleo'],
    ['A.3.2', 'Bitácora de la actividad con el cliente', 'nucleo'],
    ['A.3.3', 'Agenda y carga de trabajo del productor', 'soporte'],
    ['A.3.4', 'Proyección de los movimientos comerciales', 'soporte'],
  ]],
  ['A.4', 'Marketing, segmentación y reputación', [
    ['A.4.1', 'Segmentación reutilizable de la cartera', 'nucleo'],
    ['A.4.2', 'Diseño de campañas sobre un segmento', 'soporte'],
    ['A.4.3', 'Medición de los resultados de la campaña', 'soporte'],
    ['A.4.4', 'Captación de interesados desde redes sociales', 'soporte'],
    ['A.4.5', 'Escucha de menciones en canales públicos', 'accesorio'],
    ['A.4.6', 'Registro de la competencia y del motivo de pérdida', 'soporte'],
  ]],
  ['A.5', 'Atención al asegurado y reclamos', [
    ['A.5.1', 'Reclamo como caso con identidad propia', 'nucleo'],
    ['A.5.2', 'Estado y seguimiento del reclamo', 'nucleo'],
    ['A.5.3', 'Responsable asignado a cada reclamo', 'nucleo'],
    ['A.5.4', 'Base de conocimiento para la atención', 'soporte'],
    ['A.5.5', 'Tareas asignables con responsable y vencimiento', 'nucleo'],
    ['A.5.6', 'Aviso al usuario al que se le asigna una tarea', 'soporte'],
  ]],
  ['A.6', 'Ficha única del asegurado', [
    ['A.6.1', 'Vinculación de la póliza con su titular', 'nucleo'],
    ['A.6.2', 'La ficha reúne lo relacionado con el asegurado', 'nucleo'],
    ['A.6.3', 'Campos propios del rubro en la ficha', 'nucleo'],
    ['A.6.4', 'Unicidad de la ficha del asegurado', 'nucleo'],
  ]],
  ['A.7', 'Intercambio de datos y correo', [
    ['A.7.1', 'Importación de contactos desde planilla de cálculo', 'nucleo'],
    ['A.7.2', 'Importación de contactos desde las agendas de correo', 'soporte'],
    ['A.7.3', 'Sincronización del correo de varios usuarios', 'nucleo'],
    ['A.7.4', 'Vinculación automática del correo a la ficha', 'nucleo'],
    ['A.7.5', 'Exportación de la cartera sin pérdida de datos', 'soporte'],
  ]],
  ['A.8', 'Parametrización del modelo de negocio', [
    ['A.8.1', 'Creación de entidades sin programar', 'nucleo'],
    ['A.8.2', 'Campos calculados sobre datos propios', 'soporte'],
    ['A.8.3', 'Automatización de procesos', 'soporte'],
    ['A.8.4', 'Conservación de la parametrización al actualizar', 'nucleo'],
  ]],
  ['A.9', 'Control de acceso y trazabilidad', [
    ['A.9.1', 'Restricción de la cartera por productor', 'nucleo'],
    ['A.9.2', 'Autenticación de los usuarios bajo control de la compañía', 'nucleo'],
    ['A.9.3', 'Registro de quién modificó cada dato', 'nucleo'],
  ]],
  ['A.10', 'Explotación de la información', [
    ['A.10.1', 'Indicadores sobre la operación', 'soporte'],
    ['A.10.2', 'Generación de informes definidos por el usuario', 'nucleo'],
    ['A.10.3', 'Informe paramétrico reutilizable', 'soporte'],
    ['A.10.4', 'Intercambio de datos con otros sistemas de la compañía', 'soporte'],
    ['A.10.5', 'Intercambio sin límite de volumen que condicione la operación', 'soporte'],
  ]],
  ['A.11', 'Condiciones técnicas del producto', [
    ['A.11.1', 'Recursos que la compañía debe disponer para sostenerlo', 'soporte'],
    ['A.11.2', 'Puesta en marcha sin perfil técnico especializado', 'soporte'],
    ['A.11.3', 'Navegabilidad: pocos pasos para la operación diaria', 'soporte'],
    ['A.11.4', 'Aprendizaje sin capacitación previa', 'soporte'],
    ['A.11.5', 'Localización completa al español, modelo incluido', 'nucleo'],
    ['A.11.6', 'Operación concurrente sobre la misma cartera', 'nucleo'],
    ['A.11.7', 'Ecosistema de integraciones disponible', 'soporte'],
    ['A.11.8', 'Documentación en español', 'soporte'],
    ['A.11.9', 'Comunidad activa de usuarios', 'soporte'],
    ['A.11.10', 'Soporte técnico con compromiso de respuesta', 'soporte'],
    ['A.11.11', 'Continuidad de las versiones en uso', 'soporte'],
  ]],
  ['B.1', 'Condiciones que impone el negocio asegurador', [
    ['B.1.1', 'Persistencia de los datos sin uso continuo', 'nucleo'],
    ['B.1.2', 'Copia propia y completa de la cartera', 'nucleo'],
    ['B.1.3', 'Copia periódica sin intervención manual', 'soporte'],
    ['B.1.4', 'Búsqueda y operación con volumen productivo', 'nucleo'],
    ['B.1.5', 'Previsibilidad de los cambios del sistema', 'soporte'],
    ['B.1.6', 'Conocimiento y decisión sobre dónde residen los datos', 'soporte'],
    ['B.1.7', 'Continuidad de la atención ante una caída del enlace', 'soporte'],
  ]],
  ['B.2', 'Capacidades por encima de lo solicitado', [
    ['B.2.1', 'Asistente de inteligencia artificial', 'accesorio'],
    ['B.2.2', 'Aplicación móvil nativa', 'soporte'],
    ['B.2.3', 'Suite de trabajo integrada', 'accesorio'],
    ['B.2.4', 'Telefonía y videollamada integradas', 'accesorio'],
    ['B.2.5', 'Uso sin restricciones comerciales en la interfaz', 'soporte'],
  ]],
];

// Criticidad DENTRO de cada parte: ordena los criterios entre si, no decide
// cuanto vale la parte en el total. Cada parte se normaliza por su propio
// maximo, asi que estos pesos no se superponen con el reparto de abajo.
const PESO = {
  nucleo: 3,      // indispensable para operar
  soporte: 2,     // mejora la operacion
  accesorio: 1,   // valor marginal
  relevante: 2,   // Parte B: condicion que impone el negocio
  marginal: 1,    // Parte B: capacidad extra
};

// Reparto ENTRE partes: lo que el cliente pidio pesa mas que lo que no pidio.
const PARTE = { A: 0.85, B: 0.15 };

const TOTAL_BASE = CRITERIOS.reduce((n, g) => n + g[2].length, 0) * PLATAFORMAS.length;

// ── cargar resultados ────────────────────────────────────────────────────────
const res = {};
if (existsSync(RESULTADOS)) {
  for (const f of readdirSync(RESULTADOS).filter(x => x.endsWith('.json'))) {
    const d = JSON.parse(readFileSync(join(RESULTADOS, f), 'utf8'));
    (res[d.criterio] ??= {})[d.plataforma] = d;
  }
}

// Escala de la seccion 3: 3 cumple, 2 cumple con reparo, 1 no cumple.
const MAXIMO = 3;
const SIMBOLO = { 3: '●', 2: '◐', 1: '○' };

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

// ── matriz ───────────────────────────────────────────────────────────────────
let matriz = '';
let analisis = '';
const acum = { A: {}, B: {} };
for (const [, nom] of PLATAFORMAS) { acum.A[nom] = []; acum.B[nom] = []; }

for (const [gid, gnombre, items] of CRITERIOS) {
  const parte = gid[0];
  matriz += `\n### ${gid} ${gnombre}\n\n`;
  matriz += `| Criterio | ${PLATAFORMAS.map(p => p[1]).join(' | ')} |\n`;
  matriz += `|---|${PLATAFORMAS.map(() => ':---:').join('|')}|\n`;

  analisis += `\n## ${gid} ${gnombre}\n`;

  for (const [cid, cnombre, crit] of items) {
    matriz += `| ${cid} ${cnombre} | ${PLATAFORMAS.map(([k]) => simbolo(res[cid]?.[k])).join(' | ')} |\n`;

    analisis += `\n### ${cid} ${cnombre}\n`;
    analisis += `*Criticidad: ${crit}.*\n\n`;
    let algo = false;
    for (const [k, nom] of PLATAFORMAS) {
      const d = res[cid]?.[k];
      acum[parte][nom].push({ d, crit });
      if (d?.conPlan?.length) acum[parte].mejoraConPlan = true;
      if (!d) continue;
      algo = true;
      if (d.puntua === false) {
        analisis += `**${nom}** — *sin verificar.* ${d.motivo}\n\n`;
      } else {
        const ETIQUETA = { 3: 'cumple', 2: 'cumple con reparo', 1: 'no cumple' };
        const costo = d.costo ? ` · costo de implementación **${d.costo}**` : '';
        const lic = d.licencia
          ? ` Requiere ${d.licencia.plan}: ${d.licencia.monto} (${d.licencia.modalidad === 'unico' ? 'pago único' : 'abono recurrente'}).`
          : '';
        const doc = d.documentacion ? ` Constancia del fabricante: ${d.documentacion}.` : '';
        const med = d.medicion ? ` *${d.medicion}.*` : '';
        analisis += `**${nom}** · **${d.cumple}** (${ETIQUETA[d.cumple]})${costo} — ${d.justificacion}${lic}${doc}${med}\n\n`;
        for (const x of d.conPlan ?? []) {
          const c = x.costo ? ` · costo de implementación **${x.costo}**` : '';
          const precio = `${x.monto}${x.modalidad === 'unico' ? ', pago único' : ' por mes'}`;
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
  const v = acum[parte][nom].filter(x => puntua(x.d));
  if (!v.length) return null;
  const valor = (d) => (soloGratuito ? d : conPlanPago(d)).cumple;
  const obt = v.reduce((s, x) => s + valor(x.d) * PESO[x.crit], 0);
  const max = v.reduce((s, x) => s + MAXIMO * PESO[x.crit], 0);
  return obt / max * 100;
}

function resumen(parte) {
  let t = `\n| | ${PLATAFORMAS.map(p => p[1]).join(' | ')} |\n|---|${PLATAFORMAS.map(() => ':---:').join('|')}|\n`;
  const fila = (etiqueta, fn) =>
    `| ${etiqueta} | ${PLATAFORMAS.map(([, nom]) => acum[parte][nom].filter(fn).length).join(' | ')} |\n`;
  t += fila('Cumple ●', x => puntua(x.d) && x.d.cumple === 3);
  t += fila('Cumple con reparo ◐', x => puntua(x.d) && x.d.cumple === 2);
  t += fila('No cumple ○', x => puntua(x.d) && x.d.cumple === 1);
  t += fila('Sin verificar ◍', x => !x.d || x.d.puntua === false);
  t += fila('*— de los que cumplen, requieren licencia*', x => puntua(x.d) && x.d.cumple > 1 && x.d.licencia);
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
 * resultara 3, o todo 1. Mide cuanto depende el resultado de lo que falta.
 */
function banda(parte, nom) {
  const t = acum[parte][nom];
  const obt = t.filter(x => puntua(x.d))
    .reduce((s, x) => s + conPlanPago(x.d).cumple * PESO[x.crit], 0);
  const max = t.reduce((s, x) => s + MAXIMO * PESO[x.crit], 0);
  if (!max) return null;
  const pendiente = t.filter(x => !puntua(x.d)).reduce((s, x) => s + PESO[x.crit], 0);
  return { min: (obt + pendiente) / max * 100, max: (obt + pendiente * MAXIMO) / max * 100 };
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

**● 3 cumple  ◐ 2 cumple con reparo  ○ 1 no cumple  ◍ sin verificar**

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

El porcentaje de cada parte se calcula **solo sobre las características verificadas**, ponderadas por criticidad: núcleo ×3, soporte ×2, accesorio ×1. Las no verificadas quedan fuera del cálculo, tanto del puntaje obtenido como del máximo posible.

La oferta técnica combina las dos partes según lo que el cliente pidió: **85 % la Parte A y 15 % la Parte B.** Como cada parte se mide contra su propio máximo, los pesos de criticidad ordenan los criterios dentro de la parte pero no alteran cuánto vale esa parte en el total.

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
