import { test } from '@playwright/test';
import { entrarATwenty } from './helper';

test('versión y funciones de pago', async ({ page }) => {
  test.setTimeout(180_000);

  await entrarATwenty(page, false);

  for (const ruta of ['/settings/general', '/settings/billing', '/settings/workspace']) {
    await page.goto(ruta, { waitUntil: 'domcontentloaded' }).catch(() => {});
    await page.waitForTimeout(5000);
    const t = await page.locator('body').innerText().catch(() => '');
    const lineas = [...new Set(t.split('\n').map(l => l.trim()).filter(l => l.length > 2))];
    console.log(`\n[Twenty] ${ruta} -> ${page.url()}`);
    console.log('   ', lineas.slice(0, 18).join(' | '));

    const pago = lineas.filter(l => /enterprise|pro\b|billing|plan|upgrade|suscri|pago|licen|cloud/i.test(l));
    if (pago.length) console.log('    menciones de pago:', pago.slice(0, 8).join(' | '));
  }

  await page.screenshot({ path: 'evidencia/twenty-settings.png', fullPage: true });
});
