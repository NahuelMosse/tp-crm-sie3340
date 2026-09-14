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

async function entrarAEspo(page: Page) {
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  // Es una aplicación de página única: el formulario tarda en renderizarse.
  // Hay que esperarlo de verdad, no consultarlo con un plazo corto, o se saltea
  // el ingreso y después se espera un menú que nunca va a aparecer.
  const usuario = page.locator('#field-userName');
  const menu = page.locator('#menu, .navbar, nav').first();

  await Promise.race([
    usuario.waitFor({ state: 'visible', timeout: 30_000 }).catch(() => {}),
    menu.waitFor({ state: 'visible', timeout: 30_000 }).catch(() => {}),
  ]);

  if (await usuario.isVisible().catch(() => false)) {
    await usuario.fill(ESPOCRM.usuario);
    await page.locator('#field-password').fill(ESPOCRM.clave);
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

/**
 * Navega a una ruta equivalente en cada plataforma.
 * Los tests de criterios describen la intención; el mapa resuelve la ruta.
 */
const RUTAS: Record<string, Record<Plataforma, string>> = {
  contactos:      { espocrm: '/#Contact',                twenty: '/objects/people',        bitrix24: '/crm/contact/list/' },
  oportunidades:  { espocrm: '/#Opportunity',            twenty: '/objects/opportunities', bitrix24: '/crm/deal/' },
  tareas:         { espocrm: '/#Task',                   twenty: '/objects/tasks',         bitrix24: '/company/personal/user/1/tasks/' },
  modeloDeDatos:  { espocrm: '/#Admin/entityManager',    twenty: '/settings/objects',      bitrix24: '/crm/type/' },
  usuarios:       { espocrm: '/#Admin/users',            twenty: '/settings/members',      bitrix24: '/company/' },
  correo:         { espocrm: '/#Admin/inboundEmails',    twenty: '/settings/accounts',     bitrix24: '/mail/' },
  importar:       { espocrm: '/#Import',                 twenty: '/settings/objects',      bitrix24: '/crm/contact/list/' },
  administracion: { espocrm: '/#Admin',                  twenty: '/settings/general',      bitrix24: '/configs/' },
};

export async function irA(page: Page, destino: keyof typeof RUTAS, plataforma: Plataforma) {
  const ruta = RUTAS[destino][plataforma];
  await page.goto(ruta, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(plataforma === 'bitrix24' ? 7000 : 3500);
  return ruta;
}
