/**
 * El navegador de un aprendiz en la prueba de aprendizaje (A.11.5).
 *
 * Mantiene abierta una página con la sesión del productor y la deja operar
 * como la operaría una persona: mirar la pantalla, hacer clic, escribir, usar
 * el teclado y la rueda del ratón. No ofrece abrir direcciones ni ejecutar
 * código en la página, que la consigna prohíbe.
 *
 *   node tests/aprendizaje/navegador.mjs <puerto> <sesión.json> <dirección de inicio>
 *
 * Órdenes (POST con cuerpo JSON, o GET para /ver):
 *   GET  /ver                         captura de la pantalla y su árbol de accesibilidad
 *   POST /clic      {texto, n?}       clic en el texto visible (el n-ésimo, desde 0)
 *   POST /clic      {rol, nombre, n?} clic en un control por su rol (button, link, textbox, …) y nombre
 *   POST /clic      {x, y}            clic en un punto de la pantalla
 *   POST /escribir  {texto}           tipea en el campo que tiene el cursor
 *   POST /tecla     {tecla}           una tecla o combinación (Enter, Tab, Escape, Control+a, …)
 *   POST /rueda     {dy, x?, y?}      desplaza con la rueda del ratón
 *   POST /esperar   {ms}              deja pasar el tiempo
 *   POST /captura   {archivo}         guarda la pantalla en ese archivo
 */
import http from 'node:http';
import { chromium } from '@playwright/test';

const [puerto, sesion, inicio] = process.argv.slice(2);
const navegador = await chromium.launch();
const contexto = await navegador.newContext({ storageState: sesion, locale: 'es-AR', timezoneId: 'America/Argentina/Buenos_Aires', viewport: { width: 1440, height: 900 } });
const pagina = await contexto.newPage();
await pagina.goto(inicio, { waitUntil: 'domcontentloaded', timeout: 90_000 });
await pagina.waitForTimeout(5000);
const CAPTURA = `${process.env.TEMP ?? '/tmp'}/aprendiz-${puerto}.png`;

/** Los marcos visibles de la página: la principal y los paneles que se abren encima. */
const marcos = () => pagina.frames().filter(f => f === pagina.mainFrame() || f.url().startsWith('http'));

async function ver() {
  await pagina.waitForTimeout(800);
  await pagina.screenshot({ path: CAPTURA });
  const partes = [];
  for (const f of marcos()) {
    const arbol = await f.locator('body').ariaSnapshot({ timeout: 5000 }).catch(() => '');
    if (arbol.trim()) partes.push(arbol);
  }
  const texto = partes.join('\n---\n');
  return { titulo: await pagina.title(), captura: CAPTURA, pantalla: texto.length > 30_000 ? texto.slice(0, 30_000) + '\n…(recortado)' : texto };
}

/** El n-ésimo elemento visible que coincide, buscando en la página y en sus paneles. */
async function encontrar(hacer) {
  const visibles = [];
  for (const f of marcos()) {
    const l = hacer(f);
    const cantidad = await l.count().catch(() => 0);
    for (let i = 0; i < cantidad; i++) if (await l.nth(i).isVisible().catch(() => false)) visibles.push(l.nth(i));
  }
  return visibles;
}

async function clic(o) {
  if (o.x !== undefined) { await pagina.mouse.click(o.x, o.y); return { hecho: `clic en ${o.x},${o.y}` }; }
  const candidatos = o.rol
    ? await encontrar(f => f.getByRole(o.rol, o.nombre ? { name: o.nombre } : {}))
    : await encontrar(f => f.getByText(o.texto, { exact: false }));
  const n = o.n ?? 0;
  if (!candidatos[n]) return { error: `no hay en pantalla ${candidatos.length ? `un elemento número ${n}` : 'ningún elemento'} que coincida`, coincidencias: candidatos.length };
  await candidatos[n].click({ timeout: 10_000 });
  return { hecho: 'clic', coincidencias: candidatos.length };
}

const ordenes = {
  '/clic': clic,
  // Las letras sin tecla propia (tildes, eñe) van con insertText: keyboard.type a veces las pierde
  '/escribir': async o => {
    for (const c of String(o.texto)) {
      if (/[\x20-\x7e]/.test(c)) await pagina.keyboard.type(c); else await pagina.keyboard.insertText(c);
      await pagina.waitForTimeout(30);
    }
    return { hecho: 'escrito' };
  },
  '/tecla': async o => { await pagina.keyboard.press(o.tecla); return { hecho: `tecla ${o.tecla}` }; },
  '/rueda': async o => { if (o.x !== undefined) await pagina.mouse.move(o.x, o.y); await pagina.mouse.wheel(0, o.dy ?? 400); return { hecho: 'desplazado' }; },
  '/esperar': async o => { await pagina.waitForTimeout(Math.min(o.ms ?? 1000, 30_000)); return { hecho: 'esperado' }; },
  '/captura': async o => { await pagina.screenshot({ path: o.archivo }); return { hecho: `guardada en ${o.archivo}` }; },
};

http.createServer(async (pedido, respuesta) => {
  let cuerpo = '';
  for await (const trozo of pedido) cuerpo += trozo;
  let r;
  try {
    const ruta = pedido.url.split('?')[0];
    if (ruta === '/ver') r = await ver();
    else if (ordenes[ruta]) { r = await ordenes[ruta](cuerpo ? JSON.parse(cuerpo) : {}); await pagina.waitForTimeout(700); }
    else r = { error: `orden desconocida: ${ruta}` };
  } catch (e) { r = { error: String(e.message ?? e).split('\n')[0] }; }
  respuesta.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
  respuesta.end(JSON.stringify(r));
}).listen(Number(puerto), '127.0.0.1', () => console.log(`LISTO ${puerto}`));
