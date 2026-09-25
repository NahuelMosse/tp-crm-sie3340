#!/usr/bin/env node
/**
 * Arma el entregable a partir de las secciones del informe.
 *
 *   node exportar-informe.mjs [raiz-del-repo] [--hasta 4]
 *
 * Produce un .docx con los estilos del informe anterior y, si LibreOffice
 * esta instalado, tambien el .pdf. Ambos quedan en la carpeta del repositorio.
 *
 * --hasta n  exporta solo hasta esa seccion, para entregar un avance.
 */
import { execFileSync } from 'node:child_process';
import { readdirSync, existsSync, readFileSync, writeFileSync, unlinkSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const AQUI = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const RAIZ = args.find(a => !a.startsWith('--')) ?? join(AQUI, '..', '..');
const iHasta = args.indexOf('--hasta');
const HASTA = iHasta >= 0 ? Number(args[iHasta + 1]) : null;

const INFORME = join(RAIZ, 'humanos', 'informe');
const PLANTILLA = join(RAIZ, 'ai', 'plantilla-informe.docx');

const secciones = readdirSync(INFORME)
  .filter(f => /^\d\d-.*\.md$/.test(f))
  .filter(f => HASTA === null || Number(f.slice(0, 2)) <= HASTA)
  .sort();

if (!secciones.length) throw new Error(`No hay secciones en ${INFORME}`);

const sufijo = HASTA === null ? '' : `-secciones-1-a-${HASTA}`;
const docx = join(RAIZ, `TP-SIE3340${sufijo}.docx`);

execFileSync('pandoc', [
  ...secciones.map(f => join(INFORME, f)),
  '-o', docx,
  '--toc',
  '--toc-depth=2',
  '-M', 'toc-title=Índice',
  ...(existsSync(PLANTILLA) ? ['--reference-doc=' + PLANTILLA] : []),
], { stdio: 'inherit' });

console.log(`Documento: ${docx}`);

// ── PDF, si hay LibreOffice ──────────────────────────────────────────────────
const SOFFICE = 'C:\\Program Files\\LibreOffice\\program\\soffice.com';
if (!existsSync(SOFFICE)) {
  console.log('  LibreOffice no está instalado: el PDF se genera abriendo el .docx en Word');
} else {
  // Perfil propio: si no, una instancia abierta hace que termine sin convertir
  execFileSync(SOFFICE, [
    '-env:UserInstallation=file:///C:/Temp/lo-tp3',
    '--headless', '--norestore', '--convert-to', 'pdf', '--outdir', RAIZ, docx,
  ], { stdio: 'ignore' });
  console.log(`PDF:       ${docx.replace(/\.docx$/, '.pdf')}`);
}
