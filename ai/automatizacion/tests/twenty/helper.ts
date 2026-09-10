import { Page } from '@playwright/test';

export const EMAIL = 'tp@unimoron.test';
export const PASS = 'TpCrm2026!';

/** URLs que forman parte del onboarding de Twenty y redirigen hasta completarse. */
const ONBOARDING = /welcome|activation|create\/|install-apps|invite|onboarding|sync|plan-required/i;

/**
 * Entra a Twenty y atraviesa todas las pantallas de onboarding que queden pendientes.
 * Twenty encadena varias (workspace, perfil, apps, equipo) y redirige a ellas
 * hasta que se completan, así que hay que recorrerlas antes de poder usar el CRM.
 */
export async function entrarATwenty(page: Page, log = true) {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  // Login si hace falta
  if (page.url().includes('/welcome')) {
    const btn = page.getByRole('button', { name: /Continuar con el correo|Continue with email/i });
    if (await btn.isVisible().catch(() => false)) { await btn.click(); await page.waitForTimeout(2000); }

    const email = page.locator('input[type="email"], input[autocomplete="email"]').first();
    if (await email.isVisible().catch(() => false)) {
      await email.fill(EMAIL); await page.keyboard.press('Enter'); await page.waitForTimeout(3500);
    }
    const pass = page.locator('input[type="password"]').first();
    if (await pass.isVisible().catch(() => false)) {
      await pass.fill(PASS); await page.keyboard.press('Enter'); await page.waitForTimeout(6000);
    }
  }

  // Recorrer el onboarding
  for (let paso = 1; paso <= 12; paso++) {
    const url = page.url();
    if (!ONBOARDING.test(url)) break;

    if (log) console.log(`   [onboarding ${paso}] "${await page.title()}" — ${url}`);

    // Llenar inputs vacíos con algo razonable según el placeholder
    for (const inp of await page.locator('input:visible').all()) {
      if (await inp.inputValue().catch(() => 'x')) continue;
      const ph = (await inp.getAttribute('placeholder')) ?? '';
      const texto = /espacio|work|empresa|company/i.test(ph) ? 'TP Universidad de Moron'
                  : /apellido|last/i.test(ph) ? 'Moron'
                  : 'TP';
      await inp.fill(texto).catch(() => {});
    }

    // Avanzar: primero Continuar/Siguiente/Crear, si no está probamos Omitir
    let avanzo = false;
    for (const patron of [/^Continuar$|^Continue$|^Siguiente$|^Next$|^Crear|^Create|^Empezar|^Finalizar/i,
                          /^Omitir$|^Skip$/i]) {
      const b = page.getByRole('button', { name: patron }).first();
      if (await b.isVisible().catch(() => false)) {
        await b.click().catch(() => {});
        avanzo = true;
        break;
      }
    }
    if (!avanzo) await page.keyboard.press('Enter');

    await page.waitForTimeout(4500);

    // Si no se movió, no seguimos girando en falso
    if (page.url() === url && paso > 6) {
      if (log) console.log(`   [onboarding] trabado en ${url}`);
      break;
    }
  }

  if (log) console.log(`   [Twenty] dentro de la app: ${page.url()}`);
  return page.url();
}
