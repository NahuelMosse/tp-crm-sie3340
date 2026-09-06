import { test } from '@playwright/test';

test('versión y funciones de pago', async ({ page }) => {
  test.setTimeout(150_000);

  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.locator('#field-userName').waitFor({ state: 'visible' });
  await page.locator('#field-userName').fill('admin');
  await page.locator('#field-password').fill('Admin1234!');
  await page.getByRole('button', { name: 'Iniciar sesión' }).click();
  await page.waitForTimeout(6000);

  // Panel de administración: ahí figura la versión y las extensiones
  await page.goto('/#Admin', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(6000);

  const texto = await page.locator('body').innerText().catch(() => '');
  const version = texto.split('\n').map(l => l.trim())
    .filter(l => /versión|version|\d+\.\d+\.\d+/i.test(l));
  console.log('\n[EspoCRM] versión:', [...new Set(version)].slice(0, 6).join(' | '));

  const pago = texto.split('\n').map(l => l.trim())
    .filter(l => /advanced pack|sales pack|extensión|extension|comprar|buy|suscri|licencia/i.test(l));
  console.log('[EspoCRM] menciones de pago:', [...new Set(pago)].slice(0, 12).join(' | ') || 'ninguna');

  await page.screenshot({ path: 'evidencia/espocrm-admin.png', fullPage: true });

  // Buscamos el módulo de reportes, que es del Advanced Pack
  const hayReportes = await page.getByText(/^Informes$|^Reportes$|^Reports$/i).first().isVisible().catch(() => false);
  console.log(`[EspoCRM] módulo de reportes visible: ${hayReportes ? 'SÍ' : 'NO (es del Advanced Pack, pago)'}`);

  // Lista de extensiones instaladas
  await page.goto('/#Admin/extensions', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);
  const ext = await page.locator('body').innerText().catch(() => '');
  console.log('[EspoCRM] extensiones:', ext.split('\n').map(l => l.trim())
    .filter(l => l.length > 3).slice(0, 8).join(' | '));
  await page.screenshot({ path: 'evidencia/espocrm-extensiones.png', fullPage: true });
});
