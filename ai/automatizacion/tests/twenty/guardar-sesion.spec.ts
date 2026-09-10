import { test } from '@playwright/test';
import { entrarATwenty } from './helper';

/**
 * Guarda la sesión de Twenty en auth-twenty.json.
 *
 *   npx playwright test --project=twenty-login
 *
 * Twenty encadena pantallas de onboarding (welcome, workspace, perfil, apps,
 * invitar equipo) y redirige a ellas hasta completarlas. Guardando el estado
 * una vez, el resto de los tests entra directo.
 */
test('guardar sesión de Twenty', async ({ page }) => {
  test.setTimeout(240_000);

  await entrarATwenty(page);

  // Pantallas sueltas que quedan después del onboarding principal
  for (let i = 0; i < 5; i++) {
    const btn = page.getByRole('button', { name: /^Continuar$|^Continue$|^Empezar$|^Omitir$|^Skip$/i }).first();
    if (await btn.isVisible().catch(() => false)) {
      console.log(`[Twenty] pasando pantalla en ${page.url()}`);
      await btn.click().catch(() => {});
      await page.waitForTimeout(4000);
    } else break;
  }

  await page.goto('/objects/companies', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);
  console.log(`[Twenty] estado final: ${page.url()} | ${await page.title()}`);

  await page.context().storageState({ path: 'auth-twenty.json' });
  console.log('[Twenty] sesión guardada en auth-twenty.json');
});
