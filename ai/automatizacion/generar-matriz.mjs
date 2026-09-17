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

// Alternativas, no plataformas: un plan que cambia lo que el producto
// resuelve se evalua por separado. Los que solo agregan volumen no entran.
const PLATAFORMAS = [
  ['espocrm', 'EspoCRM Community'],
  ['espocrm-advanced', 'EspoCRM + Advanced Pack'],
  ['twenty', 'Twenty autoalojado'],
  ['bitrix24', 'Bitrix24 Free'],
  ['bitrix24-basic', 'Bitrix24 Basic'],
];

// Catálogo de criterios: id, nombre y criticidad. Debe coincidir con la sección 4.
const CRITERIOS = [
  ['A.1', 'Gestión de la cartera de pólizas', [
    ['A.1.1', 'Modelado de la póliza como objeto propio', 'nucleo'],
    ['A.1.2', 'Tipos de dato adecuados para prima, vigencia y cobranza', 'nucleo'],
    ['A.1.3', 'Vinculación de la póliza con el asegurado', 'nucleo'],
    ['A.1.4', 'Consulta y filtrado de la cartera para prospección', 'nucleo'],
    ['A.1.5', 'Operación masiva sobre la cartera', 'soporte'],
  ]],
  ['A.2', 'Gestión comercial y de marketing', [
    ['A.2.1', 'Registro y calificación del solicitante', 'nucleo'],
    ['A.2.2', 'Embudo de oportunidades vinculado al asegurado', 'nucleo'],
    ['A.2.3', 'Embudos múltiples por ramo', 'soporte'],
    ['A.2.4', 'Segmentación reutilizable de la cartera', 'nucleo'],
    ['A.2.5', 'Campañas con medición de resultados', 'soporte'],
    ['A.2.6', 'Captación de prospectos desde redes sociales', 'soporte'],
    ['A.2.7', 'Escucha de menciones y reputación', 'accesorio'],
    ['A.2.8', 'Proyección de ventas', 'soporte'],
    ['A.2.9', 'Registro de la competencia y motivos de pérdida', 'soporte'],
  ]],
  ['A.3', 'Atención al asegurado', [
    ['A.3.1', 'Gestión de reclamos como casos con seguimiento', 'nucleo'],
    ['A.3.2', 'Ficha integral del asegurado', 'nucleo'],
    ['A.3.3', 'Base de conocimiento para la atención', 'soporte'],
    ['A.3.4', 'Tareas con responsable y vencimiento', 'soporte'],
    ['A.3.5', 'Agenda y carga de trabajo por productor', 'soporte'],
  ]],
  ['A.4', 'Intercambio de datos y correo', [
    ['A.4.1', 'Importación desde los formatos que usa el cliente', 'soporte'],
    ['A.4.2', 'Sincronización de correo multiusuario', 'nucleo'],
    ['A.4.3', 'Vinculación automática del correo a la ficha', 'nucleo'],
    ['A.4.4', 'Exportación de la cartera sin pérdida de datos', 'soporte'],
  ]],
  ['A.5', 'Criterios técnicos de evaluación', [
    ['A.5.1', 'Requerimientos de infraestructura moderados', 'soporte'],
    ['A.5.2', 'Instalación guiada sin conocimientos técnicos', 'soporte'],
    ['A.5.3', 'Navegabilidad: pocos pasos para la operación diaria', 'soporte'],
    ['A.5.4', 'Aprendizaje sin capacitación previa', 'soporte'],
    ['A.5.5', 'Localización completa al español, modelo incluido', 'nucleo'],
    ['A.5.6', 'Operación concurrente sobre la misma cartera', 'nucleo'],
    ['A.5.7', 'Creación de entidades sin programar', 'nucleo'],
    ['A.5.8', 'Relaciones entre entidades desde la interfaz', 'nucleo'],
    ['A.5.9', 'Campos calculados sobre datos propios', 'soporte'],
    ['A.5.10', 'Automatización de procesos', 'soporte'],
    ['A.5.11', 'Restricción de la cartera por productor', 'nucleo'],
    ['A.5.12', 'Registro de quién modificó cada dato', 'nucleo'],
    ['A.5.13', 'Indicadores de producción y cobranza', 'soporte'],
    ['A.5.14', 'Generación de informes', 'soporte'],
    ['A.5.15', 'Interfaz de programación sin restricciones de uso', 'soporte'],
    ['A.5.16', 'Ecosistema de integraciones disponible', 'soporte'],
    ['A.5.17', 'Documentación en español', 'soporte'],
    ['A.5.18', 'Comunidad activa de usuarios', 'soporte'],
    ['A.5.19', 'Soporte técnico con compromiso de respuesta', 'soporte'],
    ['A.5.20', 'Actualización conservando la parametrización', 'nucleo'],
    ['A.5.21', 'Continuidad de las versiones en uso', 'soporte'],
  ]],
  ['B.1', 'Condiciones que impone el negocio asegurador', [
    ['B.1.1', 'Persistencia de los datos sin uso continuo', 'relevante'],
    ['B.1.2', 'Respaldo bajo control de la organización', 'relevante'],
    ['B.1.3', 'Búsqueda y operación con volumen productivo', 'relevante'],
    ['B.1.4', 'Control sobre el momento de actualizar', 'relevante'],
    ['B.1.5', 'Control sobre la localización de los datos', 'relevante'],
    ['B.1.6', 'Integridad de la ficha única del asegurado', 'relevante'],
    ['B.1.7', 'Operación sin conexión a internet', 'relevante'],
  ]],
  ['B.2', 'Capacidades por encima de lo solicitado', [
    ['B.2.1', 'Asistente de inteligencia artificial', 'marginal'],
    ['B.2.2', 'Aplicación móvil nativa', 'marginal'],
    ['B.2.3', 'Suite de trabajo integrada', 'marginal'],
    ['B.2.4', 'Telefonía y videollamada integradas', 'marginal'],
    ['B.2.5', 'Detección de registros duplicados al cargar', 'marginal'],
    ['B.2.6', 'Acceso directo a la base de datos', 'marginal'],
    ['B.2.7', 'Uso sin restricciones comerciales en la interfaz', 'marginal'],
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
const simbolo = (d) => (puntua(d) ? SIMBOLO[d.cumple] : '◍');

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
      }
    }
    if (!algo) analisis += `*Pendiente de evaluación en las tres plataformas.*\n\n`;
  }
}

// ── recuentos ────────────────────────────────────────────────────────────────

/** % de cumplimiento de una plataforma en una parte, sobre el maximo de esa misma parte. */
function cumplimiento(parte, nom) {
  const v = acum[parte][nom].filter(x => puntua(x.d));
  if (!v.length) return null;
  const obt = v.reduce((s, x) => s + x.d.cumple * PESO[x.crit], 0);
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
  return t;
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

Estado: **${evaluadas} de ${CRITERIOS.reduce((n, g) => n + g[2].length, 0) * PLATAFORMAS.length} evaluaciones registradas.**

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
console.log(`  ${evaluadas} evaluaciones registradas de ${CRITERIOS.reduce((n, g) => n + g[2].length, 0) * PLATAFORMAS.length} posibles`);
