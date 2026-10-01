import { Page, Locator, FrameLocator } from '@playwright/test';

/**
 * Cómo se llega a cada pantalla de Bitrix24 con el ratón, como lo hace el
 * usuario: el menú de la izquierda para cada herramienta, la barra de arriba
 * de cada herramienta —con lo que no entra, en «Más»— y, dentro de cada
 * pantalla, sus botones. Ninguna pantalla se abre por su dirección.
 *
 * Bitrix24 abre fichas, formularios y configuraciones en un panel que se
 * desliza desde la derecha, con la pantalla adentro de un marco: lo que se
 * hace ahí se busca en `panel()`.
 */

/** Espera a que la pantalla termine de dibujarse. */
export async function asentar(page: Page, ms = 3000) {
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(ms);
}

/** El panel deslizante de más arriba, el que está a la vista. */
export const panel = (page: Page): FrameLocator => page.frameLocator('iframe.side-panel-iframe').last();

/** La cruz de cada panel abierto, a su izquierda. Los marcos cerrados quedan en la página: se cuentan las cruces. */
const cruces = (page: Page) => page.locator('button.side-panel-label.--close-label').filter({ visible: true });

/** Cuántos paneles deslizantes hay abiertos. */
export const panelesAbiertos = (page: Page) => cruces(page).count();

/** Cierra el panel de más arriba con su cruz. */
export async function cerrarPanel(page: Page) {
  const antes = await panelesAbiertos(page);
  if (!antes) return;
  await cruces(page).last().click();
  // Al dejar una negociación sin próximo paso agendado, el sistema lo pregunta antes de cerrarla
  // (vive dentro del marco del panel: un localizador de la página y otro del marco no se combinan)
  const pregunta = panel(page).getByText('Siguiente paso en esta negociación', { exact: true }).first();
  if (await pregunta.waitFor({ state: 'visible', timeout: 3000 }).then(() => true, () => false)) {
    // El botón dice «Cancelar»: las mayúsculas las pone la hoja de estilos
    await pregunta.locator('xpath=ancestor::div[contains(@class,"popup-window")][1]')
      .getByText(/^\s*cancelar\s*$/i).first().click();
    await page.waitForTimeout(1000);
    if ((await panelesAbiertos(page)) >= antes) await cruces(page).last().click();
  }
  for (let i = 0; i < 20 && (await panelesAbiertos(page)) >= antes; i++) await page.waitForTimeout(300);
  await page.waitForTimeout(800);
}

/** Cierra todos los paneles abiertos. */
export async function cerrarPaneles(page: Page) {
  for (let i = 0; i < 5 && (await panelesAbiertos(page)); i++) await cerrarPanel(page);
}

/**
 * Una herramienta del menú de la izquierda. Las que el portal esconde quedan
 * bajo «Mostrar todos» al final del menú.
 */
export async function menuLateral(page: Page, texto: string | RegExp) {
  await cerrarPaneles(page);
  const menu = page.locator('nav[aria-label="Menú principal"]').first();
  const nombre = typeof texto === 'string' ? new RegExp(`^\\s*${texto}\\s*\\d*\\s*$`) : texto;
  let item = menu.locator('a').filter({ hasText: nombre }).filter({ visible: true }).first();
  if (!(await item.isVisible().catch(() => false))) {
    const todos = menu.getByText(/^Mostrar todos$|^Show all$/).first();
    if (await todos.isVisible().catch(() => false)) {
      await todos.click();
      await page.waitForTimeout(800);
    }
    item = menu.locator('a').filter({ hasText: nombre }).filter({ visible: true }).first();
  }
  const antes = page.url();
  await item.click();
  await page.waitForURL(u => u.href !== antes, { timeout: 30_000 }).catch(() => {});
  await asentar(page, 4000);
}

/**
 * Una pestaña de la barra de arriba de la herramienta. Las que no entran están
 * en «Más»; si la pestaña despliega un submenú, se elige `opcion` ahí.
 */
export async function pestana(page: Page, nombre: string | RegExp, opcion?: string | RegExp) {
  await cerrarPaneles(page);
  const exacto = (t: string | RegExp) => typeof t === 'string' ? new RegExp(`^${t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`) : t;
  const visible = page.locator('.main-buttons-item-text-title').filter({ hasText: exacto(nombre) }).filter({ visible: true }).first();
  const antes = page.url();
  // La barra reparte las pestañas al terminar de dibujarse: las que no entran siguen en la página,
  // detrás de «Más». Una pestaña está a mano si queda a la izquierda de «Más»
  await page.waitForTimeout(1500);
  const caja = await visible.boundingBox().catch(() => null);
  const masCaja = await page.locator('.main-buttons-item-more').filter({ visible: true }).first().boundingBox().catch(() => null);
  const aMano = !!caja && caja.width > 0 && (!masCaja || caja.x + caja.width <= masCaja.x + 2);
  if (aMano) {
    if (opcion) {
      await visible.hover();
      await page.waitForTimeout(1000);
      await elegirEnMenu(page, opcion);
    } else {
      await visible.click();
    }
  } else {
    // «Más» se abre con solo pasar el ratón; un clic encima lo vuelve a cerrar
    const mas = page.locator('.main-buttons-item-more').filter({ visible: true }).first();
    const item = page.locator('.menu-popup-item-text').filter({ hasText: exacto(nombre) }).filter({ visible: true }).first();
    await mas.hover();
    if (!(await item.waitFor({ state: 'visible', timeout: 2500 }).then(() => true, () => false))) await mas.click();
    await item.hover();
    await page.waitForTimeout(1000);
    // Las entradas con submenú repiten su nombre como primera opción del submenú
    const sub = page.locator('.menu-popup-item-text').filter({ hasText: exacto(opcion ?? nombre) }).filter({ visible: true });
    if (opcion || (await sub.count()) > 1) await sub.last().click();
    else await item.click();
  }
  await page.waitForURL(u => u.href !== antes, { timeout: 30_000 }).catch(() => {});
  await asentar(page, 4000);
}

/** Elige una opción de un menú desplegable abierto. */
export async function elegirEnMenu(page: Page, opcion: string | RegExp) {
  const texto = typeof opcion === 'string' ? new RegExp(`^\\s*${opcion.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$`) : opcion;
  await page.locator('.menu-popup-item-text, .menu-popup-item').filter({ hasText: texto }).filter({ visible: true }).last().click();
  await page.waitForTimeout(1200);
}

/** Espera a que el panel deslizante termine de cargar su pantalla. */
export async function panelListo(page: Page, visible: Locator | string | RegExp) {
  const l = typeof visible === 'object' && 'waitFor' in visible ? visible : panel(page).getByText(visible as string | RegExp).first();
  await l.waitFor({ state: 'visible', timeout: 40_000 });
  await page.waitForTimeout(1200);
}
