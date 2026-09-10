import { test } from '@playwright/test';

test('extraer los planes de pago del portal', async ({ page }) => {
  test.setTimeout(180_000);

  await page.goto('/settings/license_all.php', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(9000);

  // Botón para ver los planes
  for (const nombre of [/Comprar un plan/i, /Mejore su plan/i, /Ver planes/i]) {
    const b = page.getByText(nombre).first();
    if (await b.isVisible().catch(() => false)) {
      await b.click().catch(() => {});
      await page.waitForTimeout(9000);
      break;
    }
  }

  console.log(`\n[Bitrix24] ${page.url()}`);

  const texto = await page.locator('body').innerText().catch(() => '');
  const lineas = [...new Set(texto.split('\n').map(l => l.trim()).filter(l => l.length > 1))];

  // Precios: cualquier línea con símbolo de moneda o "usuario/mes"
  const precios = lineas.filter(l => /[€$₽]|\bEUR\b|\bUSD\b|usuario|mes|año|anual/i.test(l) && /\d/.test(l));
  console.log('[Bitrix24] líneas con precio:');
  precios.slice(0, 40).forEach(l => console.log('   ', l));

  // Nombres de planes
  const planes = lineas.filter(l => /^(Free|Basic|Básico|Standard|Estándar|Professional|Profesional|Enterprise|Empresa)/i.test(l));
  console.log('[Bitrix24] planes:', planes.slice(0, 12).join(' | '));

  await page.screenshot({ path: 'evidencia/bitrix24-planes.png', fullPage: true });
});
