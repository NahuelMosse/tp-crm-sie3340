#!/usr/bin/env node
/**
 * Genera ai/analisis/Trazabilidad-criterios.md.
 *
 *   node generar-trazabilidad.mjs [raiz-del-repo]
 *
 * Material de auditoria, no del informe: comprueba que el catalogo de la
 * seccion 4 cubre todo lo pedido y que ningun criterio quedo sin fuente.
 *
 * Los enunciados se extraen de los PDF en cada corrida, nunca se transcriben:
 * una cita parafraseada volveria inutil la trazabilidad, que existe
 * justamente para poder contrastar contra la fuente.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const AQUI = dirname(fileURLToPath(import.meta.url));
const RAIZ = process.argv[2] ?? join(AQUI, '..', '..');
const CONSIGNA = join(RAIZ, 'humanos', 'consigna');

/** Texto plano de un PDF, respetando la disposicion de la pagina. */
const leerPdf = (archivo) =>
  execFileSync('pdftotext', ['-enc', 'UTF-8', '-layout', join(CONSIGNA, archivo), '-'],
               { encoding: 'utf8', maxBuffer: 8 << 20 });

/** Une los renglones de un mismo parrafo: el PDF corta por ancho de pagina. */
const parrafos = (texto) =>
  texto.split(/\n\s*\n/).map(p => p.replace(/\s+/g, ' ').trim()).filter(Boolean);

// ── Requerimientos del cliente: un parrafo cada uno ──────────────────────────
const crudoReq = leerPdf('Requerimientos-TP-SIE3340.pdf');
const REQ = parrafos(crudoReq.slice(crudoReq.indexOf('Principales características')))
  .filter(p => !/^Principales características/.test(p));

// ── Marco tecnico: una lista con viñetas ─────────────────────────────────────
// El documento usa una fuente simbolica, asi que pdftotext devuelve la viñeta
// como U+F076, del area de uso privado. Es el separador entre criterios.
const crudoCrit = leerPdf('consigna-TP-SIE3340.pdf');
const CRIT = crudoCrit
  .slice(crudoCrit.indexOf('ASPECTOS Y CRITERIOS'))
  .split('\n').map(l => l.trim()).join(' ')
  .split('')
  .slice(1)
  .map(t => t.replace(/\s+/g, ' ').trim())
  .filter(Boolean);

if (REQ.length !== 20) throw new Error(`Se esperaban 20 requerimientos, se extrajeron ${REQ.length}`);
if (CRIT.length !== 13) throw new Error(`Se esperaban 13 criterios, se extrajeron ${CRIT.length}`);

// ── Origen de cada criterio ──────────────────────────────────────────────────
// Unico dato que se decide a mano: qué fuente originó cada criterio.
const ORIGEN = {
  'A.1.1': 'REQ 2', 'A.1.2': 'REQ 2', 'A.1.3': 'RUBRO', 'A.1.4': 'RUBRO',
  'A.1.5': 'REQ 17', 'A.1.6': 'REQ 3', 'A.1.7': 'REQ 17',
  'A.2.1': 'REQ 1', 'A.2.2': 'REQ 1, REQ 6', 'A.2.3': 'REQ 1',
  'A.2.4': 'REQ 6, REQ 4', 'A.2.5': 'REQ 6, RUBRO', 'A.2.6': 'REQ 2, REQ 17, REQ 6',
  'A.3.1': 'REQ 4', 'A.3.2': 'REQ 4', 'A.3.3': 'REQ 8', 'A.3.4': 'REQ 9',
  'A.4.1': 'REQ 11, REQ 16', 'A.4.2': 'REQ 10', 'A.4.3': 'REQ 10',
  'A.4.4': 'REQ 13', 'A.4.5': 'REQ 14, REQ 13', 'A.4.6': 'REQ 14', 'A.4.7': 'REQ 5',
  'A.5.1': 'REQ 12', 'A.5.2': 'REQ 12', 'A.5.3': 'REQ 12',
  'A.5.4': 'REQ 15', 'A.5.5': 'REQ 20', 'A.5.6': 'REQ 20',
  'A.6.1': 'REQ 2, REQ 7', 'A.6.2': 'REQ 7', 'A.6.3': 'REQ 16, REQ 14', 'A.6.4': 'REQ 7, RUBRO',
  'A.7.1': 'REQ 18, CRIT 7', 'A.7.2': 'REQ 18', 'A.7.3': 'REQ 19', 'A.7.4': 'REQ 19',
  'A.7.5': 'CRIT 7',
  'A.8.1': 'CRIT 6, RUBRO', 'A.8.2': 'CRIT 6', 'A.8.3': 'CRIT 6, REQ 8', 'A.8.4': 'RUBRO',
  'A.9.1': 'CRIT 8, REQ 4', 'A.9.2': 'CRIT 8', 'A.9.3': 'CRIT 8',
  'A.10.1': 'CRIT 9, REQ 3', 'A.10.2': 'CRIT 10, REQ 4', 'A.10.3': 'CRIT 10',
  'A.10.4': 'CRIT 11', 'A.10.5': 'CRIT 11',
  'A.11.1': 'CRIT 1', 'A.11.2': 'CRIT 2', 'A.11.3': 'CRIT 3', 'A.11.4': 'CRIT 4',
  'A.11.5': 'CRIT 4, RUBRO', 'A.11.6': 'CRIT 5', 'A.11.7': 'CRIT 12',
  'A.11.8': 'CRIT 13', 'A.11.9': 'CRIT 13', 'A.11.10': 'CRIT 13', 'A.11.11': 'RUBRO',
  'B.1.1': 'RUBRO', 'B.1.2': 'RUBRO', 'B.1.3': 'RUBRO', 'B.1.4': 'RUBRO',
  'B.1.5': 'RUBRO', 'B.1.6': 'RUBRO', 'B.1.7': 'RUBRO',
  'B.2.1': 'OBS', 'B.2.2': 'OBS', 'B.2.3': 'OBS', 'B.2.4': 'OBS', 'B.2.5': 'OBS',
};

// ── Catalogo, leido de la seccion 4 ──────────────────────────────────────────
const sec4 = readFileSync(join(RAIZ, 'humanos', 'informe', '04-criterios-de-analisis.md'), 'utf8');
const criterios = [];
for (const linea of sec4.split('\n')) {
  const celdas = linea.trim().replace(/^\||\|$/g, '').split('|').map(c => c.trim());
  if (!/^(A|B)\.\d+\.\d+$/.test(celdas[0])) continue;
  criterios.push({ id: celdas[0], nombre: celdas[1], criticidad: celdas.at(-1) });
}

const huerfanos = criterios.filter(c => !ORIGEN[c.id]).map(c => c.id);
if (huerfanos.length) throw new Error(`Criterios sin origen declarado: ${huerfanos.join(', ')}`);
const sobrantes = Object.keys(ORIGEN).filter(id => !criterios.some(c => c.id === id));
if (sobrantes.length) throw new Error(`Origen declarado para criterios inexistentes: ${sobrantes.join(', ')}`);

/** Criterios que citan una fuente dada. */
const cubren = (etiqueta) =>
  criterios.filter(c => ORIGEN[c.id].split(',').map(t => t.trim()).includes(etiqueta))
           .map(c => c.id);

// ── Documento ────────────────────────────────────────────────────────────────
const l = [];
l.push('# Trazabilidad de los criterios', '');
l.push('**Material de auditoría, no del informe.** Comprueba que el catálogo de la sección 4');
l.push('cubre todo lo pedido y que ningún criterio se inventó sin fuente.', '');
l.push('> Generado por `ai/automatizacion/generar-trazabilidad.mjs`. **Los enunciados se extraen');
l.push('> de los PDF en cada corrida**, nunca se copian a mano: una cita parafraseada volvería');
l.push('> inútil este documento, que existe para poder contrastar contra la fuente.', '');
l.push('| Fuente | Documento |', '|---|---|');
l.push('| `REQ n` | `humanos/consigna/Requerimientos-TP-SIE3340.pdf` |');
l.push('| `CRIT n` | `humanos/consigna/consigna-TP-SIE3340.pdf` |');
l.push('| `RUBRO` | Condición propia del negocio asegurador, que ninguna fuente enuncia |');
l.push('| `OBS` | Capacidad detectada al operar los sistemas |', '');

l.push('## Cobertura de las fuentes', '');
const faltan = [];
for (const [fam, textos] of [['REQ', REQ], ['CRIT', CRIT]]) {
  l.push(`### ${fam === 'REQ' ? 'Requerimientos del cliente' : 'Marco técnico de evaluación'}`, '');
  l.push('| | Enunciado textual | La comprueban |', '|:---:|---|---|');
  textos.forEach((texto, i) => {
    const etiqueta = `${fam} ${i + 1}`;
    const ids = cubren(etiqueta);
    if (!ids.length) faltan.push(etiqueta);
    l.push(`| **${i + 1}** | ${texto} | ${ids.join(', ') || '**— SIN CUBRIR**'} |`);
  });
  l.push('');
}

l.push('## Cada criterio y su fuente', '');
l.push('| Criterio | | Origen | Criticidad |', '|---|---|:---:|:---:|');
for (const c of criterios) l.push(`| ${c.id} | ${c.nombre} | \`${ORIGEN[c.id]}\` | ${c.criticidad} |`);
l.push('');

l.push('## Sin fuente externa', '');
l.push('| Origen | Criterios |', '|---|---|');
l.push(`| \`RUBRO\` | ${cubren('RUBRO').join(', ')} |`);
l.push(`| \`OBS\` | ${cubren('OBS').join(', ')} |`, '');

l.push('## Resultado', '');
l.push(`- **${REQ.length + CRIT.length} fuentes**: ${faltan.length ? `SIN CUBRIR ${faltan.join(', ')}` : 'todas cubiertas.'}`);
l.push(`- **${criterios.length} criterios**, todos con origen declarado.`, '');

const salida = join(RAIZ, 'ai', 'analisis', 'Trazabilidad-criterios.md');
writeFileSync(salida, l.join('\n'), 'utf8');
console.log(`Trazabilidad generada en ${salida}`);
console.log(`  ${REQ.length} requerimientos + ${CRIT.length} criterios · ${criterios.length} criterios del catálogo`);
if (faltan.length) console.log(`  SIN CUBRIR: ${faltan.join(', ')}`);
