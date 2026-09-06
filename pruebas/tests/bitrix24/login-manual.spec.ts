import { test } from '@playwright/test';

/**
 * LOGIN MANUAL — se corre UNA sola vez:
 *
 *   npx playwright test --project=bitrix24-login --headed
 *
 * Abre una ventana de Chromium, esperá a que la persona se loguee (captcha incluido)
 * y guarda la sesión en auth-bitrix.json. A partir de ahí todos los tests del proyecto
 * "bitrix24" entran directo, sin login ni captcha, durante semanas.
 *
 * Cuando la sesión caduque, se vuelve a correr este mismo comando.
 */

test('guardar la sesión de Bitrix24', async ({ page }) => {
  test.setTimeout(360_000); // 6 minutos para loguearse con calma

  await page.goto('/', { waitUntil: 'domcontentloaded' });

  console.log('\n' + '='.repeat(68));
  console.log('  ABRÍ LA VENTANA DE CHROMIUM QUE APARECIÓ Y LOGUEATE EN BITRIX24');
  console.log('  Tenés 5 minutos. El test sigue solo cuando detecte que entraste.');
  console.log('='.repeat(68) + '\n');

  // Detectamos por PRESENCIA del menú del portal, no por ausencia del login:
  // Bitrix24 deja inputs de password ocultos en el DOM aun estando adentro,
  // así que "no hay campo de contraseña" nunca se cumple.
  await page.waitForFunction(
    () => {
      const menu = document.querySelector('nav[aria-label="Menú principal"], nav[aria-label="Main menu"]');
      const linkFeed = document.querySelector('a[href="/stream/"], a[href="/online/"]');
      return Boolean(menu || linkFeed);
    },
    undefined,
    { timeout: 330_000, polling: 2000 },
  );

  await page.waitForTimeout(4000);
  console.log(`[Bitrix24] sesión detectada en: ${page.url()}`);
  console.log(`[Bitrix24] título: ${await page.title()}`);

  await page.context().storageState({ path: 'auth-bitrix.json' });
  console.log('[Bitrix24] sesión guardada en auth-bitrix.json ✓');

  await page.screenshot({ path: 'evidencia/bitrix24-sesion-guardada.png', fullPage: true });
});
