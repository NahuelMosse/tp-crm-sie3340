#!/usr/bin/env node
/**
 * Builds data/data.js, the snapshot both decks read: the catalog, every result, the subtotals per group
 * and the totals, computed exactly as ai/automatizacion/generar-matriz.mjs does.
 *
 *   node data/build-data.mjs
 *
 * No number is written by hand: if the totals differ from section 4 of the report, the script stops.
 * The output is a script (window.DATA = …) so the decks open from the file system without a server.
 */
import { readFileSync, readdirSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..', '..', '..');
const AUTO = join(ROOT, 'ai', 'automatizacion');
const REPORT = join(ROOT, 'humanos', 'informe');
const require = createRequire(import.meta.url);
const catalog = require(join(AUTO, 'catalogo.cjs'));

const PLATFORMS = [['espocrm', 'EspoCRM'], ['twenty', 'Twenty'], ['bitrix24', 'Bitrix24']];
const read = (p) => readFileSync(p, 'utf8');
const stripRefs = (t) => (t ?? '').replace(/\s*\{\{[^}]+\}\}/g, '').trim();

// Weights between parts, read from the generator so they never drift
const weights = (() => {
  const m = read(join(AUTO, 'generar-matriz.mjs')).match(/const PARTE = \{ A: ([\d.]+), B: ([\d.]+) \}/);
  if (!m) throw new Error('PARTE not found in generar-matriz.mjs');
  return { A: Number(m[1]), B: Number(m[2]) };
})();

// Results, keyed by criterion and platform
const results = {};
for (const f of readdirSync(join(AUTO, 'resultados')).filter((f) => f.endsWith('.json'))) {
  const d = JSON.parse(read(join(AUTO, 'resultados', f)));
  (results[d.criterio] ??= {})[d.plataforma] = d;
}

const videoFile = (id, p) => `${id.replace(/\./g, '-')}.${p}.webm`;
const hasVideo = (id, p) => existsSync(join(AUTO, 'evidencia', 'videos', videoFile(id, p)));
const hasFile = (f) => existsSync(join(AUTO, 'evidencia', f));

// The words the report uses for each value (exportar-informe.py, costo_en_palabras)
function label(d, functional) {
  if (d.cumple === 0) return 'No cumple';
  if (d.cumple === 2) {
    if (!functional) return 'Cumple';
    return d.costo === 0 ? 'Viene listo' : 'Se configura una vez';
  }
  if (!functional) return 'Cumple con reparo';
  return { codigo: 'Exige código', manual: 'Exige una tarea manual', parcial: 'Resuelve una parte' }[d.reparo] ?? 'Cumple con reparo';
}

// Reference figures of the criteria that have one (cifras-de-referencia.md)
const figures = {};
{
  const text = read(join(REPORT, 'cifras-de-referencia.md'));
  for (const block of text.split(/^## /m).slice(1)) {
    const [head, ...rest] = block.split('\n');
    const body = rest.join('\n');
    const lead = body.split('\n').filter((l) => l.trim() && !l.startsWith('|')).join(' ');
    const rows = body.split('\n').filter((l) => l.startsWith('|') && !/^\|\s*-/.test(l));
    const scale = rows.length >= 2 ? rows[1].split('|').slice(1, -1).map((c) => c.trim()) : null;
    figures[head.trim()] = { lead: stripRefs(lead).replace(/\*\*/g, ''), scale };
  }
}

// Paid plans of section 4.4, as the report prints them
const plans = {};
{
  const text = read(join(REPORT, '04-matriz-de-veredictos.md'));
  const part = text.slice(text.indexOf('## 4.4'));
  for (const sec of part.split(/^### /m).slice(1)) {
    const name = sec.split('\n')[0].trim();
    const key = PLATFORMS.find(([, n]) => n === name)?.[0];
    if (!key) continue;
    plans[key] = sec.split('\n').filter((l) => l.startsWith('|') && !/^\|\s*-|Versión/.test(l)).map((l) => {
      const c = l.split('|').slice(1, -1).map((x) => x.trim().replace(/\*/g, ''));
      return { version: c[0].replace(/\s*\(evaluada\)/, ''), evaluated: /evaluada/.test(l), price: c[1], improves: c[2], total: c[3] };
    });
  }
}

const groups = catalog.GRUPOS.map((g) => ({ id: g.id, part: g.parte, name: g.nombre, criteria: g.criterios.map((c) => c.id) }));

function points(ids, p) {
  let got = 0, max = 0;
  for (const id of ids) { const d = results[id]?.[p]; if (d && typeof d.cumple === 'number') { got += d.cumple; max += 2; } }
  return { got, max, pct: max ? (got / max) * 100 : null };
}

const subtotals = {};
for (const g of groups) {
  subtotals[g.id] = {};
  for (const [p] of PLATFORMS) {
    const byType = {};
    for (const t of ['tecnica', 'operativa']) {
      const ids = g.criteria.filter((id) => catalog.CRITERIOS.find((c) => c.id === id).tipo === t);
      if (ids.length) byType[t] = points(ids, p);
    }
    subtotals[g.id][p] = { ...points(g.criteria, p), byType };
  }
}

const parts = {};
const totals = {};
for (const [p] of PLATFORMS) {
  const avg = (part) => {
    const v = groups.filter((g) => g.part === part).map((g) => subtotals[g.id][p].pct).filter((x) => x !== null);
    return v.reduce((a, b) => a + b, 0) / v.length;
  };
  parts[p] = { A: avg('A'), B: avg('B') };
  totals[p] = weights.A * parts[p].A + weights.B * parts[p].B;
}

// Stop if the snapshot and the report disagree
{
  const text = read(join(REPORT, '04-matriz-de-veredictos.md'));
  const row = (label) => {
    const line = text.split('\n').find((l) => l.replace(/\*/g, '').startsWith(`| ${label}`));
    if (!line) throw new Error(`row ${label} not found in section 4`);
    return line.split('|').slice(2, 5).map((c) => Number(c.replace(/[*%\s]/g, '').replace(',', '.')));
  };
  const checks = [['Originales', (p) => parts[p].A], ['Deseables', (p) => parts[p].B], ['Cumplimiento total', (p) => totals[p]]];
  for (const [name, fn] of checks) {
    const expected = row(name);
    PLATFORMS.forEach(([p], i) => {
      if (Math.abs(Number(fn(p).toFixed(1)) - expected[i]) > 0.05) throw new Error(`${name} ${p}: ${fn(p).toFixed(1)} ≠ ${expected[i]} in the report`);
    });
  }
}

const criteria = catalog.CRITERIOS.map((c) => ({
  id: c.id, name: c.nombre, need: stripRefs(c.necesidad), procedure: stripRefs(c.procedimiento),
  type: c.tipo, group: c.grupo, part: c.parte, functional: c.tipo === 'funcional',
  figure: figures[c.id] ?? null,
  platforms: Object.fromEntries(PLATFORMS.map(([p]) => {
    const d = results[c.id]?.[p];
    if (!d) return [p, null];
    return [p, {
      value: d.cumple, label: label(d, c.tipo === 'funcional'), cost: d.costo ?? null,
      summary: stripRefs(d.resumen), how: stripRefs(d.comoLoHace), features: stripRefs(d.caracteristicas),
      why: stripRefs(d.justificacion), measure: d.medicion ?? null,
      video: hasVideo(c.id, p) ? videoFile(c.id, p) : null,
      captures: (d.evidencia ?? []).filter(hasFile),
      plans: (d.conPlan ?? []).map((x) => ({ plan: x.plan, price: x.monto, value: x.cumple, why: stripRefs(x.justificacion) })),
      sources: (d.documentacion ?? []).map((x) => ({ url: x.url, quote: x.cita, date: x.consultado, capture: x.captura && hasFile(x.captura) ? x.captura : null })),
    }];
  })),
}));

const evidence = {
  evaluations: Object.values(results).reduce((n, x) => n + Object.keys(x).length, 0),
  videos: readdirSync(join(AUTO, 'evidencia', 'videos')).filter((f) => f.endsWith('.webm')).length,
  captures: new Set(Object.values(results).flatMap((x) => Object.values(x)).flatMap((d) => (d.evidencia ?? []).filter(hasFile))).size,
  sources: (read(join(REPORT, '08-fuentes.md')).match(/^- https?:\/\//gm) ?? []).length,
};

const coverText = read(join(REPORT, '00-portada.md'));
// The day the work is presented; the report keeps its own date on its cover
const PRESENTED = '19 de noviembre de 2026';

const meta = {
  presented: PRESENTED,
  date: (coverText.match(/\*\*Fecha\*\* \| ([^|]+)\|/) ?? [])[1]?.trim() ?? '',
  team: (coverText.match(/\*\*Elaborado por\*\* \| ([^|]+)\|/) ?? [])[1]?.trim() ?? '',
  institution: (coverText.match(/\*\*Institución\*\* \| ([^|]+)\|/) ?? [])[1]?.trim() ?? '',
};

// The report's cover, as 00-portada.md writes it, for the designed cover of the PDF
const cover = (() => {
  const text = coverText;
  const line = (re) => (text.match(re) ?? [])[1]?.trim() ?? '';
  const rows = [...text.matchAll(/^\| \*\*([^*]+)\*\* \| ([^|]+)\|/gm)].map((m) => [m[1].trim(), m[2].trim()]);
  return { label: line(/^# (.+)$/m), title: line(/^## (.+)$/m), subtitle: line(/^### (.+)$/m), rows,
    note: text.split(/\r?\n/).filter((l) => l.trim() && !/^[#|]/.test(l)).pop()?.trim() ?? '' };
})();

const data = { meta, cover, weights, platforms: PLATFORMS.map(([key, name]) => ({ key, name })), groups, criteria, subtotals, parts, totals, plans, evidence,
  paths: { videos: '../../ai/automatizacion/evidencia/videos/', captures: '../../ai/automatizacion/evidencia/' } };

writeFileSync(join(HERE, 'data.js'), `// Generated by data/build-data.mjs from the repository's results. Do not edit.\nwindow.DATA = ${JSON.stringify(data)};\n`);
console.log(`data.js · ${criteria.length} criteria · ${evidence.evaluations} evaluations · totals ${PLATFORMS.map(([p]) => totals[p].toFixed(1)).join(' / ')}`);
