#!/usr/bin/env node
/**
 * Control de los resultados registrados, antes de generar la matriz.
 *
 *   node verificar-resultados.mjs [--plataforma espocrm]
 *
 * Aplica las reglas de la sección 3 sobre los archivos ya escritos, de modo
 * que un resultado editado a mano pase por el mismo control que uno recién
 * generado, e informa qué falta medir en cada plataforma.
 *
 * Termina con código 1 si encuentra algo mal: es lo que impide que un dato
 * defectuoso llegue al informe.
 */
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import catalogo from './catalogo.cjs';
import reglas from './reglas.cjs';

const { GRUPOS, CRITERIOS } = catalogo;
const { reparos } = reglas;

const AQUI = dirname(fileURLToPath(import.meta.url));
const RESULTADOS = join(AQUI, 'resultados');
const EVIDENCIA = join(AQUI, 'evidencia');

const PLATAFORMAS = ['espocrm', 'twenty', 'bitrix24'];
const i = process.argv.indexOf('--plataforma');
const SOLO = i >= 0 ? process.argv[i + 1] : null;
if (SOLO && !PLATAFORMAS.includes(SOLO)) {
  console.error(`Plataforma desconocida: ${SOLO}. Son ${PLATAFORMAS.join(', ')}`);
  process.exit(1);
}

const problemas = [];
const registros = [];

// ── cada archivo contra la sección 3 ─────────────────────────────────────────
if (existsSync(RESULTADOS)) {
  for (const f of readdirSync(RESULTADOS).filter(x => x.endsWith('.json')).sort()) {
    let d;
    try {
      d = JSON.parse(readFileSync(join(RESULTADOS, f), 'utf8'));
    } catch (err) {
      problemas.push([f, [`no es un JSON válido: ${err.message}`]]);
      continue;
    }

    const mal = reparos(d);

    // El nombre del archivo tiene que coincidir con lo que declara adentro:
    // si no, un renombre deja dos veredictos para el mismo criterio.
    const esperado = `${String(d.criterio).replace(/\./g, '-')}.${d.plataforma}.json`;
    if (f !== esperado) mal.push(`el archivo debería llamarse ${esperado}`);

    if (!PLATAFORMAS.includes(d.plataforma)) mal.push(`plataforma desconocida: ${d.plataforma}`);

    // Una captura declarada que no existe no respalda nada.
    for (const img of d.evidencia ?? []) {
      if (!existsSync(join(EVIDENCIA, img))) mal.push(`la evidencia ${img} no está en evidencia/`);
    }
    for (const fu of d.documentacion ?? []) {
      if (fu?.captura && !existsSync(join(EVIDENCIA, fu.captura))) {
        mal.push(`la captura de fuente ${fu.captura} no está en evidencia/`);
      }
    }

    if (mal.length) problemas.push([f, mal]);
    registros.push(d);
  }
}

// ── avance ───────────────────────────────────────────────────────────────────
const hay = (id, p) => registros.find(d => d.criterio === id && d.plataforma === p);
const puntua = (d) => d && d.puntua !== false;

console.log('Avance por plataforma\n');
console.log(`| ${'Grupo'.padEnd(34)} | ${PLATAFORMAS.map(p => p.padEnd(12)).join(' | ')} |`);
console.log(`|${'-'.repeat(36)}|${PLATAFORMAS.map(() => '-'.repeat(14)).join('|')}|`);
for (const g of GRUPOS) {
  const celdas = PLATAFORMAS.map(p => {
    const n = g.criterios.filter(c => puntua(hay(c.id, p))).length;
    const pend = g.criterios.filter(c => hay(c.id, p) && !puntua(hay(c.id, p))).length;
    return `${n}/${g.criterios.length}${pend ? ` (+${pend})` : ''}`.padEnd(12);
  });
  console.log(`| ${`${g.id} ${g.nombre}`.slice(0, 34).padEnd(34)} | ${celdas.join(' | ')} |`);
}
const totales = PLATAFORMAS.map(p => CRITERIOS.filter(c => puntua(hay(c.id, p))).length);
console.log(`| ${'TOTAL'.padEnd(34)} | ${totales.map((n, k) =>
  `${n}/${CRITERIOS.length}`.padEnd(12)).join(' | ')} |`);
console.log(`\n(+n) = criterios declarados sin verificar, que no puntúan.`);

if (SOLO) {
  const faltan = CRITERIOS.filter(c => !hay(c.id, SOLO)).map(c => c.id);
  console.log(`\nSin registrar en ${SOLO}: ${faltan.length ? faltan.join(', ') : 'ninguno'}`);
}

// ── veredicto ────────────────────────────────────────────────────────────────
if (problemas.length) {
  console.log(`\n${problemas.length} archivo(s) con reparos:\n`);
  for (const [f, mal] of problemas) console.log(`  ${f}\n    - ${mal.join('\n    - ')}`);
  process.exit(1);
}
console.log(`\n${registros.length} resultado(s) registrados, todos conformes con la sección 3.`);
