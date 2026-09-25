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

// Peso de cada grupo dentro de su parte, definido en la seccion 3.6.
// La cantidad de criterios de un grupo no decide cuanto pesa: afinar el
// catalogo no mueve ningun puntaje.
const CRITERIOS = [
  ['A.1', 'Cartera de pólizas', 1, [
    ['A.1.1', 'Modelado de la póliza como objeto propio'],
    ['A.1.2', 'Campos de lista para el ramo y el estado de cobranza'],
    ['A.1.3', 'Prima con importe y moneda'],
    ['A.1.4', 'Vigencia con fecha de inicio y de fin'],
    ['A.1.5', 'Aviso anticipado de vencimiento'],
    ['A.1.6', 'Consulta y filtrado de la cartera'],
    ['A.1.7', 'Operación masiva sobre la cartera'],
  ]],
  ['A.2', 'Captación y proceso de venta', 1, [
    ['A.2.1', 'Registro del solicitante con sus datos de contacto'],
    ['A.2.2', 'Calificación y priorización del solicitante'],
    ['A.2.3', 'Conversión del solicitante en oportunidad de venta'],
    ['A.2.4', 'Embudo de oportunidades con etapas'],
    ['A.2.5', 'Embudos diferenciados por ramo'],
    ['A.2.6', 'Oportunidades de cambio y ampliación sobre la cartera'],
  ]],
  ['A.3', 'Productores y actividad comercial', 1, [
    ['A.3.1', 'Registro de productores y asignación de cartera'],
    ['A.3.2', 'Bitácora de la actividad con el cliente'],
    ['A.3.3', 'Agenda y carga de trabajo del productor'],
    ['A.3.4', 'Proyección de los movimientos comerciales'],
  ]],
  ['A.4', 'Marketing, segmentación y reputación', 1, [
    ['A.4.1', 'Segmentación reutilizable de la cartera'],
    ['A.4.2', 'Diseño de campañas sobre un segmento'],
    ['A.4.3', 'Medición de los resultados de la campaña'],
    ['A.4.4', 'Captación de interesados desde redes sociales'],
    ['A.4.5', 'Escucha de menciones en canales públicos'],
    ['A.4.6', 'Publicación en redes desde el sistema'],
    ['A.4.7', 'Registro de la competencia y del motivo de pérdida'],
  ]],
  ['A.5', 'Atención al asegurado y reclamos', 1, [
    ['A.5.1', 'Reclamo como caso con identidad propia'],
    ['A.5.2', 'Estado y seguimiento del reclamo'],
    ['A.5.3', 'Responsable asignado a cada reclamo'],
    ['A.5.4', 'Base de conocimiento para la atención'],
    ['A.5.5', 'Tareas asignables con responsable y vencimiento'],
    ['A.5.6', 'Aviso al usuario al que se le asigna una tarea'],
  ]],
  ['A.6', 'Ficha única del asegurado', 1, [
    ['A.6.1', 'Vinculación de la póliza con su titular'],
    ['A.6.2', 'Vista única del asegurado'],
    ['A.6.3', 'Campos propios del rubro en la ficha'],
    ['A.6.4', 'Unicidad de la ficha del asegurado'],
  ]],
  ['A.7', 'Intercambio de datos y correo', 1, [
    ['A.7.1', 'Importación de contactos desde planilla de cálculo'],
    ['A.7.2', 'Importación de contactos desde las agendas de correo'],
    ['A.7.3', 'Sincronización del correo de varios usuarios'],
    ['A.7.4', 'Vinculación automática del correo a la ficha'],
    ['A.7.5', 'Formatos de intercambio aceptados'],
    ['A.7.6', 'Exportación de la cartera sin pérdida de datos'],
  ]],
  ['A.8', 'Parametrización del modelo de negocio', 1, [
    ['A.8.1', 'Creación de entidades sin programar'],
    ['A.8.2', 'Campos calculados sobre datos propios'],
    ['A.8.3', 'Automatización de procesos'],
    ['A.8.4', 'Conservación de la parametrización al actualizar'],
  ]],
  ['A.9', 'Control de acceso y trazabilidad', 1, [
    ['A.9.1', 'Restricción de la cartera por productor'],
    ['A.9.2', 'Autenticación de los usuarios bajo control de la compañía'],
    ['A.9.3', 'Registro de quién modificó cada dato'],
  ]],
  ['A.10', 'Explotación de la información', 1, [
    ['A.10.1', 'Indicadores sobre la operación'],
    ['A.10.2', 'Generación de informes definidos por el usuario'],
    ['A.10.3', 'Informe paramétrico reutilizable'],
    ['A.10.4', 'Intercambio de datos con otros sistemas de la compañía'],
    ['A.10.5', 'Intercambio sin límite de volumen que condicione la operación'],
  ]],
  ['A.11', 'Condiciones técnicas del producto', 1, [
    ['A.11.1', 'Recursos que la compañía debe disponer para sostenerlo'],
    ['A.11.2', 'Compatibilidad con la plataforma que la compañía usa'],
    ['A.11.3', 'Puesta en marcha sin perfil técnico especializado'],
    ['A.11.4', 'Menú y navegabilidad para la operación diaria'],
    ['A.11.5', 'Aprendizaje sin capacitación previa'],
    ['A.11.6', 'Localización completa al español, modelo incluido'],
    ['A.11.7', 'Cantidad de usuarios sin límite que condicione la operación'],
    ['A.11.8', 'Operación concurrente sobre la misma cartera'],
    ['A.11.9', 'Ecosistema de integraciones disponible'],
    ['A.11.10', 'Documentación en español'],
    ['A.11.11', 'Material de capacitación para el usuario final'],
    ['A.11.12', 'Comunidad activa de usuarios'],
    ['A.11.13', 'Soporte técnico con compromiso de respuesta'],
    ['A.11.14', 'Continuidad de las versiones en uso'],
  ]],
  ['B.1', 'Condiciones que impone el negocio asegurador', 1, [
    ['B.1.1', 'Persistencia de los datos sin uso continuo'],
    ['B.1.2', 'Copia propia y completa de la cartera'],
    ['B.1.3', 'Copia periódica sin intervención manual'],
    ['B.1.4', 'Búsqueda y operación con volumen productivo'],
    ['B.1.5', 'Previsibilidad de los cambios del sistema'],
    ['B.1.6', 'Conocimiento y decisión sobre dónde residen los datos'],
    ['B.1.7', 'Continuidad de la atención ante una caída del enlace'],
  ]],
  ['B.2', 'Capacidades por encima de lo solicitado', 1, [
    ['B.2.1', 'Asistente de inteligencia artificial'],
    ['B.2.2', 'Aplicación móvil nativa'],
    ['B.2.3', 'Suite de trabajo integrada'],
    ['B.2.4', 'Telefonía y videollamada integradas'],
    ['B.2.5', 'Uso sin restricciones comerciales en la interfaz'],
  ]],
];


// Reparto ENTRE partes: lo que el cliente pidio pesa mas que lo que no pidio.
const PARTE = { A: 0.85, B: 0.15 };

const TOTAL_BASE = CRITERIOS.reduce((n, g) => n + g[3].length, 0) * PLATAFORMAS.length;

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

// ── matriz ───────────────────────────────────────────────────────────────────
let matriz = '';
let analisis = '';
const acum = { A: {}, B: {} };
for (const [, nom] of PLATAFORMAS) { acum.A[nom] = []; acum.B[nom] = []; }

for (const [gid, gnombre, pesoGrupo, items] of CRITERIOS) {
  const parte = gid[0];
  matriz += `\n### ${gid} ${gnombre}\n\n`;
  matriz += `| Criterio | ${PLATAFORMAS.map(p => p[1]).join(' | ')} |\n`;
  matriz += `|---|${PLATAFORMAS.map(() => ':---:').join('|')}|\n`;

  analisis += `\n## ${gid} ${gnombre}\n`;

  for (const [cid, cnombre] of items) {
    matriz += `| ${cid} ${cnombre} | ${PLATAFORMAS.map(([k]) => simbolo(res[cid]?.[k])).join(' | ')} |\n`;

    analisis += `\n### ${cid} ${cnombre}\n`;

    let algo = false;
    for (const [k, nom] of PLATAFORMAS) {
      const d = res[cid]?.[k];
      acum[parte][nom].push({ d, gid, pesoGrupo });
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
  const valor = (d) => (soloGratuito ? d : conPlanPago(d)).cumple;
  let suma = 0, pesos = 0;
  for (const [gid, , pesoGrupo] of CRITERIOS) {
    if (gid[0] !== parte) continue;
    const v = acum[parte][nom].filter(x => x.gid === gid && puntua(x.d));
    if (!v.length) continue;   // un grupo sin verificar no arrastra: su peso se reparte
    const pct = v.reduce((s, x) => s + valor(x.d), 0) / (MAXIMO * v.length) * 100;
    suma += pct * pesoGrupo;
    pesos += pesoGrupo;
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
  t += fila('*— de los que cumplen, requieren licencia*', x => puntua(x.d) && x.d.cumple > 0 && x.d.licencia);
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
  let lo = 0, hi = 0, pesos = 0;
  for (const [gid, , pesoGrupo] of CRITERIOS) {
    if (gid[0] !== parte) continue;
    const t = acum[parte][nom].filter(x => x.gid === gid);
    if (!t.length) continue;
    const obt = t.filter(x => puntua(x.d)).reduce((s, x) => s + conPlanPago(x.d).cumple, 0);
    const falta = t.filter(x => !puntua(x.d)).length;
    const max = MAXIMO * t.length;
    lo += obt / max * 100 * pesoGrupo;
    hi += (obt + falta * MAXIMO) / max * 100 * pesoGrupo;
    pesos += pesoGrupo;
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
