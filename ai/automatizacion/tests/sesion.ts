import { Page } from '@playwright/test';
import { Plataforma } from './evaluar';
import { entrarATwenty } from './twenty/helper';

/**
 * Ingreso unificado a las tres plataformas.
 *
 * Cada una resuelve la autenticación de manera distinta —EspoCRM con usuario y
 * contraseña, Twenty atravesando su onboarding encadenado, Bitrix24 con la
 * sesión guardada— pero los tests de criterios no deberían tener que saberlo.
 */

export const ESPOCRM = { usuario: 'admin', clave: 'Admin1234!' };

/** Devuelve la plataforma del proyecto en curso. */
export function plataformaDe(nombreProyecto: string): Plataforma {
  if (nombreProyecto.startsWith('espocrm')) return 'espocrm';
  if (nombreProyecto.startsWith('twenty')) return 'twenty';
  return 'bitrix24';
}

export async function entrar(page: Page, plataforma: Plataforma) {
  if (plataforma === 'espocrm') return entrarAEspo(page);
  if (plataforma === 'twenty') return entrarATwenty(page, false);
  return entrarABitrix(page);
}

/**
 * Ingresa a EspoCRM con otra cuenta, para comprobar lo que ve ese usuario.
 * Hay que salir antes: el sistema conserva la sesión del administrador.
 */
export async function entrarComo(page: Page, usuario: string, clave: string) {
  await page.context().clearCookies();
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
  await entrarAEspo(page, usuario, clave);
}

async function entrarAEspo(page: Page, usuario = ESPOCRM.usuario, clave = ESPOCRM.clave) {
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  // Es una aplicación de página única: el formulario tarda en renderizarse.
  // Hay que esperarlo de verdad, no consultarlo con un plazo corto, o se saltea
  // el ingreso y después se espera un menú que nunca va a aparecer.
  const campo = page.locator('#field-userName');
  const menu = page.locator('#menu, .navbar, nav').first();

  await Promise.race([
    campo.waitFor({ state: 'visible', timeout: 30_000 }).catch(() => {}),
    menu.waitFor({ state: 'visible', timeout: 30_000 }).catch(() => {}),
  ]);

  if (await campo.isVisible().catch(() => false)) {
    await campo.fill(usuario);
    await page.locator('#field-password').fill(clave);
    await page.getByRole('button', { name: 'Iniciar sesión' }).click();
  }
  await menu.waitFor({ state: 'visible', timeout: 30_000 });
}

async function entrarABitrix(page: Page) {
  // La sesión viene de auth-bitrix.json; acá solo se confirma que sigue válida
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);
  const dentro = await page
    .locator('nav[aria-label="Menú principal"], a[href="/stream/"], a[href="/online/"]')
    .first().isVisible().catch(() => false);
  if (!dentro) {
    throw new Error(
      'La sesión de Bitrix24 caducó. Volver a generarla:\n' +
      '  npx playwright test --project=bitrix24-login --headed',
    );
  }
}
