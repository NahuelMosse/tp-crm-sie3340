import { Page } from '@playwright/test';
import { menuLateral, panel, panelListo } from './navegar';
import { altaDeNegociacion, guardarFormulario, negociaciones, borrarNegociaciones } from './ui';

/**
 * Ayudantes propios de A.11, B.1 y B.2 sobre Bitrix24.
 *
 * Todo dato que estas pruebas crean en el portal lleva este prefijo, y se
 * borra al terminar cada test: el portal es compartido con otras pruebas.
 */
export const PREFIJO = 'DOC-';

/** Crea una negociación con el prefijo de estas pruebas, desde el formulario, y la devuelve. */
export async function crearNegociacionDoc(page: Page, nombre: string) {
  await altaDeNegociacion(page);
  const titulo = `${PREFIJO}${nombre}`;
  await panel(page).locator('input[name="TITLE"]').fill(titulo);
  await guardarFormulario(page);
  await page.waitForTimeout(1500);
  const [n] = await negociaciones(page, new RegExp(`^${titulo}$`));
  return n;
}

/** Borra las negociaciones de estas pruebas que empiecen con el prefijo dado. */
export const limpiarNegociacionesDoc = (page: Page, sufijo = '') =>
  borrarNegociaciones(page, new RegExp(`^${PREFIJO}${sufijo}`));

/** Abre el catálogo de aplicaciones de Bitrix24 Market, desde el menú lateral. */
export async function abrirMarket(page: Page) {
  await menuLateral(page, 'Market');
  await page.waitForTimeout(2000);
}

export { panel, panelListo };
