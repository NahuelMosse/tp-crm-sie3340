#!/usr/bin/env node
// Prints the designed cover of the report to A4 PDFs, one for each version:
//   node portada/render.mjs <outDir>   →   <outDir>/portada.pdf and <outDir>/portada-completa.pdf
// Uses the Playwright of ai/automatizacion, so it installs nothing.
import { createRequire } from 'node:module';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const require = createRequire(join(HERE, '..', '..', '..', 'ai', 'automatizacion', 'package.json'));
const { chromium } = require('playwright');
const out = process.argv[2] ?? HERE;

const browser = await chromium.launch();
const page = await browser.newPage();
for (const [query, name] of [['', 'portada.pdf'], ['?completa', 'portada-completa.pdf']]) {
  await page.goto(pathToFileURL(join(HERE, 'index.html')).href + query);
  await page.evaluate(() => document.fonts.ready);
  await page.pdf({ path: join(out, name), format: 'A4', printBackground: true, margin: { top: 0, right: 0, bottom: 0, left: 0 } });
}
await browser.close();
console.log(`cover printed to ${out}`);
