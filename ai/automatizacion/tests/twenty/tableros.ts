import { Page } from '@playwright/test';
import { clicReal, esperarCarga } from './ui';
import { listado } from './navegar';

/**
 * Los tableros de Twenty: un tablero tiene pestañas y cada pestaña, widgets.
 * El widget de gráfico se configura en el panel de la derecha, renglón por
 * renglón —fuente, eje X, eje Y, filtro—; cada renglón abre su menú al hacer
 * clic sobre el renglón entero, no sobre su etiqueta.
 */

/** Crea un tablero vacío y deja abierta su edición. */
export async function nuevoTablero(page: Page, titulo: string) {
  await listado(page, 'dashboards');
  await clicReal(page, page.locator('div:text-is("New Dashboard") >> visible=true')
    .or(page.locator('div:text-is("Nuevo Dashboard") >> visible=true')).first());
  await page.waitForURL(/\/object\/dashboard\//, { timeout: 30_000 });
  await esperarCarga(page, 4000);
  // Nace sin título: se lo nombra desde la barra de arriba. Recién creado, el título ya está abierto para
  // escribir; si no, se abre con un clic sobre «Sin título»
  const campo = page.getByPlaceholder(/^Title$|^Título$/).filter({ visible: true }).first();
  await clicReal(page, (await campo.isVisible().catch(() => false)) ? campo
    : page.getByText(/^Sin título$|^Untitled$/).filter({ visible: true }).first());
  await page.waitForTimeout(800);
  await page.keyboard.press('Control+a');
  await page.keyboard.press('Backspace');
  await page.keyboard.type(titulo);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(1500);
}

/** Agrega un widget de gráfico de barras en el primer lugar libre. */
export async function agregarGrafico(page: Page) {
  const primero = page.getByText(/^Haga clic para añadir su primer widget$|^Click to add your first widget$/).first();
  await clicReal(page, (await primero.isVisible().catch(() => false)) ? primero
    : page.getByText(/^Agregar widget$|^Add widget$/).first());
  await clicReal(page, page.getByText(/^Gráfico$|^Chart$/).last());
  await page.waitForTimeout(3000);
}

/** Abre el menú de un renglón del panel del widget; `n` elige entre renglones con la misma etiqueta. */
export async function renglon(page: Page, etiqueta: string | RegExp, n = 0) {
  const cajas = await page.getByText(etiqueta, { exact: typeof etiqueta === 'string' }).filter({ visible: true })
    .evaluateAll(es => es.map(e => e.getBoundingClientRect()).map(r => ({ x: r.x, y: r.y, h: r.height })));
  const ancho = page.viewportSize()?.width ?? 1440;
  const c = cajas.filter(c => c.x > ancho * 0.7)[n];
  if (!c) throw new Error(`No está el renglón ${etiqueta} en el panel del widget`);
  await page.mouse.move(ancho - 200, c.y + c.h / 2, { steps: 8 });
  await page.mouse.down();
  await page.waitForTimeout(70);
  await page.mouse.up();
  await page.waitForTimeout(1800);
}

/**
 * Elige una opción del menú abierto, que se despliega sobre el panel de la
 * derecha. El menú lateral repite nombres —Pólizas, Reclamos— y un clic ahí
 * se va del tablero: solo cuentan las opciones del lado derecho.
 */
export async function opcion(page: Page, texto: string) {
  const ancho = page.viewportSize()?.width ?? 1440;
  const candidatos = page.getByText(texto, { exact: true }).filter({ visible: true });
  let i = -1;
  for (let espera = 0; espera < 10 && i < 0; espera++) {
    const xs = await candidatos.evaluateAll(es => es.map(e => e.getBoundingClientRect().x));
    i = xs.map((x, k) => ({ x, k })).filter(c => c.x > ancho * 0.6).map(c => c.k).pop() ?? -1;
    if (i < 0) await page.waitForTimeout(800);
  }
  if (i < 0) throw new Error(`No se abrió el menú con la opción ${texto}`);
  await clicReal(page, candidatos.nth(i));
  await page.waitForTimeout(1800);
}

/**
 * Configura el gráfico: de qué objeto, qué va en el eje X y qué medida en el
 * eje Y —un campo y cómo se resume: Suma, Promedio, Contar todo—.
 */
export async function configurarGrafico(page: Page, g: { fuente: string; ejeX: string; ejeY: string; resumen: string }) {
  await enRenglon(page, /^Fuente$|^Source$/, 0, g.fuente);
  await enRenglon(page, /^Datos en pantalla$|^Data on display$/, 0, g.ejeX);
  await enRenglon(page, /^Datos en pantalla$|^Data on display$/, 1, g.ejeY);
  await opcion(page, g.resumen);
  await page.waitForTimeout(2500);
}

/**
 * Abre el menú de un renglón y elige la opción. El panel recién dibujado a
 * veces descarta el primer clic: se vuelve a hacer clic en el renglón hasta
 * que el menú muestre la opción.
 */
export async function enRenglon(page: Page, etiqueta: string | RegExp, n: number, texto: string) {
  const ancho = page.viewportSize()?.width ?? 1440;
  const enElMenu = async () => (await page.getByText(texto, { exact: true }).filter({ visible: true })
    .evaluateAll(es => es.map(e => e.getBoundingClientRect().x))).some(x => x > ancho * 0.6);
  for (let intento = 0; intento < 4; intento++) {
    await page.getByText(etiqueta).filter({ visible: true }).first().waitFor({ state: 'visible', timeout: 30_000 });
    await renglon(page, etiqueta, n);
    if (await enElMenu()) break;
    await page.waitForTimeout(2000);
  }
  await opcion(page, texto);
}

/** Un filtro del gráfico sobre un campo de fecha: «es posterior o igual a» o «es antes» de un día. */
export async function filtroDeFecha(page: Page, campo: string, operador: 'desde' | 'antes', ddmmaaaa: string) {
  const agregar = page.getByText(/^Agregar filtro$|^Add filter$|^Agregar regla de filtro$|^Add filter rule$/).filter({ visible: true }).last();
  await clicReal(page, agregar);
  await page.waitForTimeout(1500);
  // La regla nueva queda al final: su campo, su operador y su valor, uno debajo del otro
  const campos = page.getByText(/^Name$|^Nombre$/).filter({ visible: true });
  await clicReal(page, campos.last());
  await page.keyboard.type(campo.slice(0, 10), { delay: 60 });
  await opcion(page, campo);
  // Sobre una fecha, el operador arranca en «Es relativo»
  const operadores = page.getByText(/^Es( relativo)?$|^Is( relative)?$/).filter({ visible: true });
  await clicReal(page, operadores.last());
  await opcion(page, operador === 'desde' ? 'Es posterior o igual a' : 'Es antes');
  const valor = page.locator('input:visible').last();
  await clicReal(page, valor);
  await valor.press('Control+a');
  await valor.pressSequentially(ddmmaaaa, { delay: 60 });
  await valor.press('Enter');
  await page.waitForTimeout(2500);
}

/** Guarda el tablero. */
export async function guardarTablero(page: Page) {
  await clicReal(page, page.getByText(/^Save$|^Guardar$/).filter({ visible: true }).first());
  await page.waitForTimeout(4000);
}

/** Las etiquetas del gráfico —categorías y valores— tal como se ven. */
export async function etiquetasDelGrafico(page: Page): Promise<string[]> {
  const grafico = page.locator('svg').filter({ has: page.locator('text') }).first();
  // Los textos de un SVG no tienen innerText: se lee su contenido
  return (await grafico.locator('text').evaluateAll(es => es.map(e => (e.textContent ?? '').trim()))).filter(Boolean);
}
