#!/usr/bin/env node
// Arma una carpeta autónoma con las presentaciones, para llevarla en un pendrive y abrirla con doble clic:
//   node build.mjs [destino]          (por defecto, dist/ junto a este archivo)
// Lleva la presentación (index.html), el anexo de consulta por criterio (criterios.html) y la versión sobria,
// con los videos y capturas que el anexo muestra copiados adentro, achicados: no depende del resto del
// repositorio. Las letras viajan dentro de assets/fonts.css, así que no hace falta instalar nada ni conexión.
// Necesita ffmpeg en el PATH; la primera corrida convierte toda la evidencia y tarda, las siguientes usan .cache/.
import { execFile, execFileSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, renameSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { availableParallelism } from 'node:os';
import { createHash } from 'node:crypto';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const EVIDENCIA = join(HERE, '..', '..', 'ai', 'automatizacion', 'evidencia');
const OUT = resolve(process.argv[2] ?? join(HERE, 'dist'));

// Los datos se regeneran desde los resultados: así la carpeta lleva lo mismo que el informe
execFileSync(process.execPath, [join(HERE, 'data', 'build-data.mjs')], { stdio: 'inherit' });

const PAGES = ['index.html', 'criterios.html', 'presentacion-sobria.html'];
const ASSETS = ['deck.css', 'deck.js', 'fonts.css', 'icons.js', 'visual.css', 'visual-slides.js', 'consulta-slides.js', 'slides.js'];

if (existsSync(OUT)) rmSync(OUT, { recursive: true, force: true });
for (const dir of ['assets', 'data', 'evidencia/videos', 'licencias']) mkdirSync(join(OUT, dir), { recursive: true });

for (const f of PAGES) copyFileSync(join(HERE, f), join(OUT, f));
for (const f of ASSETS) copyFileSync(join(HERE, 'assets', f), join(OUT, 'assets', f));
copyFileSync(join(HERE, 'CREDITS.md'), join(OUT, 'licencias', 'CREDITS.md'));
copyFileSync(join(HERE, 'assets', 'icons', 'LICENSE'), join(OUT, 'licencias', 'LUCIDE-LICENSE'));

// data.js apunta a la evidencia del repositorio; en la carpeta, a su propia copia
global.window = {};
const source = readFileSync(join(HERE, 'data', 'data.js'), 'utf8');
new Function('window', source)(global.window);
const D = global.window.DATA;
D.paths = { videos: 'evidencia/videos/', captures: 'evidencia/' };

// Solo viaja lo que alguna diapositiva muestra: en el anexo, el video de cada prueba o, si no hay video,
// una captura (la primera de la prueba o la de la fuente citada); en la versión sobria, las capturas que nombra
const videos = new Set();
const captures = new Set();
for (const c of D.criteria) {
  for (const x of Object.values(c.platforms)) {
    if (!x) continue;
    const shot = x.captures[0] ?? x.sources.find((s) => s.capture)?.capture ?? null;
    if (x.video) videos.add(x.video);
    else if (shot) captures.add(shot);
    x.captures = !x.video && x.captures.length ? [shot] : [];
    for (const s of x.sources) if (s.capture && (x.video || s.capture !== shot)) s.capture = null;
  }
}
const NOMBRAN = ['slides.js', 'visual-slides.js'];
for (const f of NOMBRAN) {
  for (const m of readFileSync(join(HERE, 'assets', f), 'utf8').matchAll(/[\w-]+\.png/g)) {
    if (existsSync(join(EVIDENCIA, m[0]))) captures.add(m[0]);
  }
}
// Las copias se achican: los videos de Playwright vienen en VP8 a 1 Mbps y 25 cuadros por segundo, y pasan a
// AV1 a 15, unas veinte veces más livianos con el texto igual de legible (lo reproducen Chrome, Edge y
// Firefox); las capturas pasan de PNG a WebP. Los originales del repositorio no se tocan: son la evidencia.
// Cada archivo se convierte una vez y queda en .cache/.
const webp = (f) => f.replace(/\.png$/i, '.webp');
const final = (f) => (enPng.has(f) ? f : webp(f));
const jobs = [
  ...[...videos].map((f) => ({ from: join(EVIDENCIA, 'videos', f), to: join('videos', f),
    args: ['-r', '15', '-c:v', 'libsvtav1', '-crf', '50', '-preset', '10', '-g', '300', '-svtav1-params', 'tune=0', '-an'] })),
  ...[...captures].map((f) => ({ from: join(EVIDENCIA, f), to: webp(f), original: f,
    args: ['-c:v', 'libwebp', '-quality', '85', '-compression_level', '6'] })),
];
const CACHE = join(HERE, '.cache');
let bytes = 0, hechos = 0, convertidos = 0;
// WebP no admite más de 16.383 px por lado: las capturas de página completa más largas quedan en PNG,
// que con pantallas de colores planos pesa menos que un JPEG
const enPng = new Set();
const usados = new Set();
const convertir = async ({ from, to, args, original }) => {
  const st = statSync(from);
  // La clave lleva el original y los parámetros: si cambia cualquiera de los dos, se vuelve a convertir
  const clave = createHash('sha1').update(`${st.size}-${Math.round(st.mtimeMs)}-${args.join(' ')}`).digest('hex').slice(0, 12);
  let cached = join(CACHE, `${to}.${clave}${to.slice(to.lastIndexOf('.'))}`);
  if (!existsSync(cached)) {
    mkdirSync(dirname(cached), { recursive: true });
    try {
      await new Promise((ok, fail) => execFile('ffmpeg', ['-v', 'error', '-y', '-i', from, ...args, cached + '.tmp' + to.slice(to.lastIndexOf('.'))],
        (err) => (err ? fail(err) : ok())));
      renameSync(cached + '.tmp' + to.slice(to.lastIndexOf('.')), cached);
      convertidos++;
    } catch (err) {
      if (!original) throw err;
      rmSync(cached + '.tmp' + to.slice(to.lastIndexOf('.')), { force: true });
      enPng.add(original);
      to = original;
      cached = from;
    }
  }
  usados.add(cached);
  const dest = join(OUT, 'evidencia', to);
  mkdirSync(dirname(dest), { recursive: true });
  copyFileSync(cached, dest);
  bytes += statSync(dest).size;
  if (++hechos % 50 === 0) console.log(`  ${hechos} de ${jobs.length} archivos`);
};
const cola = [...jobs];
await Promise.all(Array.from({ length: Math.max(1, Math.floor(availableParallelism() / 2)) }, async () => {
  while (cola.length) await convertir(cola.shift());
}));

for (const c of D.criteria) {
  for (const x of Object.values(c.platforms)) {
    if (!x) continue;
    x.captures = (x.captures ?? []).map(final);
    for (const s of x.sources ?? []) if (s.capture) s.capture = final(s.capture);
  }
}
// La caché conserva solo lo que este build usó: una versión vieja o una captura que ya no se muestra se borra
for (const f of readdirSync(CACHE, { recursive: true })) {
  const ruta = join(CACHE, f);
  if (statSync(ruta).isFile() && !usados.has(ruta)) rmSync(ruta);
}
// Las diapositivas que nombran una captura la piden con su nombre nuevo
for (const f of NOMBRAN) {
  const js = readFileSync(join(HERE, 'assets', f), 'utf8').replace(/[\w-]+\.png/g, (m) => (captures.has(m) ? final(m) : m));
  writeFileSync(join(OUT, 'assets', f), js);
}
writeFileSync(join(OUT, 'data', 'data.js'), source.replace(/window\.DATA = .*;\s*$/s, `window.DATA = ${JSON.stringify(D)};\n`));

console.log(`Presentaciones en ${OUT}`);
console.log(`  index.html: la presentación · criterios.html: el anexo de consulta por criterio`);
console.log(`  ${videos.size} videos y ${captures.size} capturas, ${(bytes / 1e6).toFixed(0)} MB de evidencia (${convertidos} convertidos ahora; ${enPng.size} capturas largas en PNG)`);
