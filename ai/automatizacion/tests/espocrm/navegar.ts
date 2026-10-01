import { Page, Locator } from '@playwright/test';
import { apiEspo } from '../api';

/**
 * Cómo se llega a cada pantalla de EspoCRM con el ratón, como lo hace el
 * usuario: las pestañas del menú —las que no entran, en el desplegable «más»—,
 * el menú de la cuenta para la administración, y dentro de cada pantalla, sus
 * enlaces y botones. Ninguna pantalla se abre por su dirección.
 */

const hash = (page: Page) => decodeURIComponent(new URL(page.url()).hash);

/** Espera a que la aplicación termine de dibujar la pantalla nueva. */
async function asentar(page: Page, ms = 2500) {
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(ms);
}

/**
 * Espera a que termine un guardado en curso: si se deja la pantalla mientras
 * dice «Guardando...», el sistema vuelve a la ficha guardada al terminar.
 */
async function sinGuardarEnCurso(page: Page) {
  await page.getByText(/^(Guardando|Saving)/).filter({ visible: true }).first()
    .waitFor({ state: 'hidden', timeout: 30_000 }).catch(() => {});
}

/** Si la pantalla que se deja tenía un formulario modificado, el sistema pregunta si salir: se confirma. */
async function confirmarSalida(page: Page) {
  const salir = page.locator('.modal-dialog:visible').getByRole('button', { name: /^S[ií]$|^Yes$/ }).first();
  if (await salir.waitFor({ state: 'visible', timeout: 2500 }).then(() => true, () => false)) await salir.click();
}

/** Un enlace visible de la pantalla que lleva a esa dirección interna. */
const enlace = (page: Page, destino: string, dentroDe = 'body') =>
  page.locator(`${dentroDe} a[href="${destino}"]`).filter({ visible: true }).first();

/**
 * Una pestaña del menú principal. Las que no entran en la barra están en el
 * desplegable del final: se lo abre y se elige ahí.
 */
export async function pestana(page: Page, entidad: string) {
  const destino = `#${entidad}`;
  await sinGuardarEnCurso(page);
  // En la pantalla del teléfono el menú queda plegado detrás del botón de las tres rayas
  const plegado = page.locator('#navbar .navbar-toggle').filter({ visible: true }).first();
  if (await plegado.isVisible().catch(() => false)) {
    await plegado.click();
    await page.waitForTimeout(700);
  }
  let visible = enlace(page, destino, '#navbar');
  if (!(await visible.isVisible().catch(() => false))) {
    await page.locator('#navbar .dropdown.more > a.dropdown-toggle').first().click();
    await page.waitForTimeout(700);
    visible = enlace(page, destino, '#navbar');
  }
  await visible.click();
  await confirmarSalida(page);
  await page.waitForFunction(d => decodeURIComponent(location.hash) === d, destino, { timeout: 30_000 });
  await asentar(page);
}

/**
 * Un listado, desde su pestaña, sin las condiciones que haya dejado la última
 * búsqueda: el producto las recuerda por usuario.
 */
export async function listado(page: Page, entidad: string) {
  await pestana(page, entidad);
  await page.locator('.search-container').first().waitFor({ state: 'visible', timeout: 40_000 });
  await page.waitForTimeout(1500);
  const resetear = page.locator('.search-container [data-action="reset"]').first();
  if (await resetear.isVisible().catch(() => false)) {
    await resetear.click();
    await page.waitForTimeout(3000);
  }
}

/** El formulario de alta, con el botón «Crear» del listado. */
export async function alta(page: Page, entidad: string) {
  await listado(page, entidad);
  const crear = enlace(page, `#${entidad}/create`, '#main')
    .or(page.locator('#main [data-action="create"]').filter({ visible: true }).first()).first();
  const rapido = page.locator('#main [data-action="quickCreate"]').filter({ visible: true }).first();
  if (await crear.isVisible().catch(() => false)) {
    await crear.click();
  } else {
    // Algunas entidades solo ofrecen el alta rápida en una ventana: de ahí se pasa al formulario completo
    await rapido.click();
    await page.locator('.modal-dialog:visible button[data-name="fullForm"]').first().click({ timeout: 20_000 });
  }
  await page.waitForFunction(d => location.hash.startsWith(d), `#${entidad}/create`, { timeout: 30_000 });
  await asentar(page);
}

/**
 * La ficha de un registro: su listado, la búsqueda por su nombre y el enlace
 * de la fila, como lo encuentra el usuario.
 */
export async function ficha(page: Page, entidad: string, id: string) {
  if (hash(page) === `#${entidad}/view/${id}`) {
    await page.reload({ waitUntil: 'domcontentloaded' });
    await asentar(page, 3000);
    return;
  }
  const api = await apiEspo();
  const registro = await (await api.get(`${entidad}/${id}`)).json();
  await api.dispose();
  const nombre: string = registro.name ?? [registro.firstName, registro.lastName].filter(Boolean).join(' ');

  await listado(page, entidad);
  const buscar = page.locator('.search-container input.text-filter').first();
  if (nombre) {
    await buscar.fill(nombre);
    // Se espera la respuesta de la búsqueda: hasta que llega, el listado muestra las filas de antes
    const resultado = page.waitForResponse(r => r.url().includes(`/api/v1/${entidad}?`) && r.url().includes('where'),
      { timeout: 30_000 }).catch(() => null);
    await page.locator('.search-container [data-action="search"]').first().click();
    await resultado;
    await page.waitForTimeout(1500);
  }
  // El listado todavía puede estar redibujándose por la búsqueda y tragarse el
  // clic: si no quedó la ficha abierta, se vuelve a hacer clic en la fila
  for (let intento = 0; ; intento++) {
    await enlace(page, `#${entidad}/view/${id}`, '#main').click({ timeout: 30_000 });
    await page.waitForFunction(d => location.hash === d, `#${entidad}/view/${id}`, { timeout: 30_000 });
    await asentar(page, 3000);
    const abierta = await page.locator('#main .detail-button-container').first()
      .waitFor({ state: 'visible', timeout: 10_000 }).then(() => true, () => false);
    if (abierta || intento === 2) return;
  }
}

/** El formulario de edición de un registro: su ficha y el botón «Editar». */
export async function edicion(page: Page, entidad: string, id: string) {
  await ficha(page, entidad, id);
  await clicAccion(page, page.locator('#main [data-action="edit"]').first());
  // La ficha pasa a edición en el lugar, sin cambiar de dirección: aparece «Guardar»
  await page.locator('#main [data-action="save"]').filter({ visible: true }).first().waitFor({ timeout: 30_000 });
  await asentar(page);
}

/**
 * La administración, desde el menú de la cuenta, y dentro de ella los
 * enlaces sucesivos hasta la pantalla pedida: cada paso es un enlace o un
 * botón de la pantalla anterior.
 */
export async function administracion(page: Page, ...pasos: (string | Locator)[]) {
  await sinGuardarEnCurso(page);
  if (!hash(page).startsWith('#Admin')) {
    await page.locator('#navbar .menu-container > a.dropdown-toggle').first().click();
    await page.waitForTimeout(700);
    await enlace(page, '#Admin', '#navbar').click();
    await confirmarSalida(page);
    await page.waitForFunction(() => location.hash === '#Admin', undefined, { timeout: 30_000 });
    await asentar(page);
  } else if (hash(page) !== '#Admin' && pasos.length) {
    // Se vuelve al índice de la administración por su migaja de pan
    const indice = enlace(page, '#Admin', '#main');
    if (await indice.isVisible().catch(() => false)) {
      await indice.click();
      await asentar(page);
    }
  }
  for (const paso of pasos) {
    const objetivo = typeof paso === 'string' ? enlace(page, paso, '#main') : paso;
    await objetivo.waitFor({ state: 'visible', timeout: 30_000 });
    await objetivo.click();
    await asentar(page, 3000);
  }
}

/** Un enlace de la administración que lleva a esa dirección interna. */
export const enlaceA = (page: Page, destino: string) => enlace(page, destino, '#main');

/** El inicio, con el logotipo del menú. */
export async function inicio(page: Page) {
  await page.locator('#navbar a.navbar-brand, #navbar a[href="#"]').filter({ visible: true }).first().click();
  await asentar(page, 3000);
}

/** Una acción que puede estar en el desplegable del botón: si no se ve, se abre el desplegable. */
async function clicAccion(page: Page, accion: Locator) {
  if (!(await accion.isVisible().catch(() => false))) {
    await accion.locator('xpath=ancestor::*[contains(concat(" ", @class, " "), " btn-group ")][1]')
      .locator('.dropdown-toggle').first().click();
  }
  await accion.click();
}
