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

const PLATAFORMAS = [
  ['espocrm', 'EspoCRM'],
  ['twenty', 'Twenty'],
  ['bitrix24', 'Bitrix24'],
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

// Peso por criterio. Unica ponderacion del calculo: la proporcion entre las
// partes surge de la distribucion de los criterios, no de un segundo reparto.
const PESO = {
  nucleo: 6,      // solicitado, indispensable
  soporte: 4,     // solicitado, mejora la operacion
  accesorio: 2,   // solicitado, valor marginal
  relevante: 2,   // no solicitado, condicion del negocio
  marginal: 1,    // no solicitado, capacidad extra
};

// ── cargar resultados ────────────────────────────────────────────────────────
const res = {};
if (existsSync(RESULTADOS)) {
  for (const f of readdirSync(RESULTADOS).filter(x => x.endsWith('.json'))) {
    const d = JSON.parse(readFileSync(join(RESULTADOS, f), 'utf8'));
    (res[d.criterio] ??= {})[d.plataforma] = d;
  }
}

const SIN_PUNTAJE = { 'sin-verificar': '◍' };

const simbolo = (d) => {
  if (!d) return '◍';
  if (d.puntua === false) return SIN_PUNTAJE[d.estado] ?? '◍';
  if (d.nivel === 1) return '○';
  return d.licencia ? '◐' : '●';
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
      if (!d) continue;
      algo = true;
      if (d.puntua === false) {
        const ETIQUETA = {
          'sin-verificar': 'sin verificar',
          'no-aplica': 'no aplica a esta plataforma',
          'condicionado': 'depende de la implementación',
        };
        analisis += `**${nom}** — *${ETIQUETA[d.estado] ?? 'sin verificar'}.* ${d.motivo}\n\n`;
      } else {
        const lic = d.licencia ? ` Requiere licencia${d.detalleLicencia ? `: ${d.detalleLicencia}` : ''}.` : '';
        const med = d.medicion ? ` *${d.medicion}.*` : '';
        analisis += `**${nom}** · **${d.nivel}** (${d.via}) — ${d.justificacion}${lic}${med}\n\n`;
      }
    }
    if (!algo) analisis += `*Pendiente de evaluación en las tres plataformas.*\n\n`;
  }
}

// ── recuentos ────────────────────────────────────────────────────────────────
function resumen(parte) {
  let t = `\n| | ${PLATAFORMAS.map(p => p[1]).join(' | ')} |\n|---|${PLATAFORMAS.map(() => ':---:').join('|')}|\n`;
  const fila = (etiqueta, fn) =>
    `| ${etiqueta} | ${PLATAFORMAS.map(([, nom]) => acum[parte][nom].filter(fn).length).join(' | ')} |\n`;
  t += fila('Cubiertas de fábrica ●', x => puntua(x.d) && x.d.nivel > 1 && !x.d.licencia);
  t += fila('Cubiertas con licencia ◐', x => puntua(x.d) && x.d.nivel > 1 && x.d.licencia);
  t += fila('No disponibles ○', x => puntua(x.d) && x.d.nivel === 1);
  t += fila('Sin verificar ◍', x => !x.d || x.d.puntua === false);
  t += `| **% de cumplimiento** | ${PLATAFORMAS.map(([, nom]) => {
    const v = acum[parte][nom].filter(x => puntua(x.d));
    if (!v.length) return '—';
    const obt = v.reduce((s, x) => s + x.d.nivel * PESO[x.crit], 0);
    const max = v.reduce((s, x) => s + 5 * PESO[x.crit], 0);
    return `**${(obt / max * 100).toFixed(1)} %**`;
  }).join(' | ')} |\n`;
  return t;
}

const evaluadas = Object.values(res).reduce((n, x) => n + Object.keys(x).length, 0);
const cab = `# 5. Matriz de veredictos

*Generada automáticamente a partir de los resultados registrados por las pruebas. No se transcribe ningún valor a mano.*

**● cubierta  ◐ cubierta mediante licencia adicional  ○ no disponible en ninguna edición**
**◍ sin verificar**

Lo no verificado no recibe puntaje y queda fuera del cálculo, tanto del obtenido como del máximo posible. Es un estado transitorio del trabajo, no una característica de la plataforma.

La distinción entre ● y ◐ no altera el veredicto técnico: ambas indican que el producto resuelve la necesidad. El símbolo ◐ marca las que requieren una licencia, y esas filas alimentan la oferta económica. El símbolo ○ se reserva para lo que no existe en ninguna edición.

Estado: **${evaluadas} de ${CRITERIOS.reduce((n, g) => n + g[2].length, 0) * 3} evaluaciones registradas.**

---

# PARTE A — Criterios solicitados
`;

const partes = matriz.split('\n### B.1');
const salidaMatriz = cab + partes[0] +
  `\n### Recuento de la Parte A\n${resumen('A')}\n---\n\n# PARTE B — Criterios no solicitados\n\n### B.1` +
  partes[1] +
  `\n### Recuento de la Parte B\n${resumen('B')}
\n---\n
## 5.1 Cómo leer estos recuentos

El porcentaje de cumplimiento se calcula **solo sobre las características verificadas**, ponderadas por criticidad: núcleo ×3, soporte ×2, accesorio ×1. Las no verificadas quedan fuera del cálculo, tanto del puntaje obtenido como del máximo posible.

Un porcentaje alto sobre pocas características verificadas no es comparable con uno sobre el total. La cantidad de evaluaciones registradas por plataforma figura en la fila correspondiente.
`;

mkdirSync(SALIDA, { recursive: true });
writeFileSync(join(SALIDA, '05-matriz-de-veredictos.md'), salidaMatriz, 'utf8');
writeFileSync(join(SALIDA, '06-analisis-por-categoria.md'),
  `# 6. Análisis por criterio

*Generado automáticamente a partir de las justificaciones registradas durante las pruebas.*

Cada criterio indica el valor asignado a cada plataforma, la vía por la que se obtuvo la capacidad y la razón del valor. La escala está definida en la sección 3; los procedimientos, en la sección 4.
${analisis}`, 'utf8');

console.log(`Matriz y análisis generados en ${SALIDA}`);
console.log(`  ${evaluadas} evaluaciones registradas de ${CRITERIOS.reduce((n, g) => n + g[2].length, 0) * 3} posibles`);
