#!/usr/bin/env node
/**
 * Arma el entregable a partir de las secciones del informe.
 *
 *   node exportar-informe.mjs [raiz-del-repo] [--hasta 4]
 *
 * Produce el .docx y, si LibreOffice esta instalado, el .pdf. Los dos quedan
 * en la raiz del repositorio y no se versionan: se regeneran.
 *
 * --hasta n  exporta solo hasta esa seccion, para entregar un avance.
 */
import { execFileSync } from 'node:child_process';
import { readdirSync, existsSync, readFileSync, writeFileSync, unlinkSync, mkdtempSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const AQUI = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const RAIZ = args.find(a => !a.startsWith('--')) ?? join(AQUI, '..', '..');
const iHasta = args.indexOf('--hasta');
const HASTA = iHasta >= 0 ? Number(args[iHasta + 1]) : null;

const INFORME = join(RAIZ, 'humanos', 'informe');
const secciones = readdirSync(INFORME)
  .filter(f => /^\d\d-.*\.md$/.test(f))
  .filter(f => HASTA === null || Number(f.slice(0, 2)) <= HASTA)
  .sort();
if (!secciones.length) throw new Error(`No hay secciones en ${INFORME}`);

/**
 * Indice armado desde los titulos de cada seccion.
 *
 * Pandoc sabe generar uno con --toc, pero en docx lo deja como un campo de
 * Word que solo se rellena al abrir el archivo en Word: convertido a PDF sale
 * vacio. Escribirlo como texto evita esa dependencia, a cambio de no llevar
 * numeros de pagina.
 */
const SALTO = '\n```{=openxml}\n<w:p><w:r><w:br w:type="page"/></w:r></w:p>\n```\n';
const indice = ['## Índice'];
for (const f of secciones.slice(1)) {          // la portada no se indexa a si misma
  for (const l of readFileSync(join(INFORME, f), 'utf8').split('\n')) {
    const h1 = l.match(/^# (.+)$/);
    const h2 = l.match(/^## (.+)$/);
    if (h1) indice.push('', `**${h1[1]}**`, '');
    else if (h2) indice.push(`> ${h2[1]}`, '');
  }
}

const tmp = mkdtempSync(join(tmpdir(), 'informe-'));
const fIndice = join(tmp, 'indice.md');
writeFileSync(fIndice, indice.join('\n') + '\n' + SALTO, 'utf8');

const sufijo = HASTA === null ? '' : `-secciones-1-a-${HASTA}`;
const docx = join(RAIZ, `TP-SIE3340${sufijo}.docx`);

// La portada primero, despues el indice, despues el resto
execFileSync('pandoc', [
  join(INFORME, secciones[0]), fIndice, ...secciones.slice(1).map(f => join(INFORME, f)),
  '-o', docx,
], { stdio: 'inherit' });
unlinkSync(fIndice);
console.log(`Documento: ${resolve(docx)}`);

// ── PDF, si hay LibreOffice ──────────────────────────────────────────────────
const SOFFICE = 'C:\\Program Files\\LibreOffice\\program\\soffice.com';
if (!existsSync(SOFFICE)) {
  console.log('  LibreOffice no está instalado: el PDF se obtiene abriendo el .docx en Word');
} else {
  // Perfil propio: con una instancia de LibreOffice abierta, termina sin convertir
  execFileSync(SOFFICE, [
    '-env:UserInstallation=file:///C:/Temp/lo-informe',
    '--headless', '--norestore', '--convert-to', 'pdf', '--outdir', RAIZ, docx,
  ], { stdio: 'ignore' });
  console.log(`PDF:       ${resolve(docx).replace(/\.docx$/, '.pdf')}`);
}
