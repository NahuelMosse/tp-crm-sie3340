#!/usr/bin/env node
// Imprime a PDF una página HTML del informe con el Chromium de Playwright:
//   node imprimir-informe.mjs <entrada.html> <salida.pdf>
// El tamaño de página, los márgenes y el pie los fija el @page de la propia página.
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const [html, pdf] = process.argv.slice(2).map((p) => resolve(p));

const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  await page.goto(pathToFileURL(html).href);
  await page.evaluate(() => document.fonts.ready);
  // outline: los títulos quedan como marcadores del PDF; tagged: el PDF lleva su estructura
  await page.pdf({ path: pdf, preferCSSPageSize: true, printBackground: true, outline: true, tagged: true });
} finally {
  await browser.close();
}
