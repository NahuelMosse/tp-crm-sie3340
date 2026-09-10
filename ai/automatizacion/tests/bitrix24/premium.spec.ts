import { test } from '@playwright/test';

test('plan actual y funciones premium', async ({ page }) => {
  test.setTimeout(180_000);

  // Página de planes / licencia
  for (const ruta of ['/settings/license_all.php', '/settings/license/', '/crm/deal/']) {
    await page.goto(ruta, { waitUntil: 'domcontentloaded' }).catch(() => {});
    await page.waitForTimeout(6000);
    console.log(`\n[Bitrix24] ${ruta} -> ${page.url()} | ${await page.title()}`);
    if (!page.url().includes('crm/deal')) break;
  }

  const texto = await page.locator('body').innerText().catch(() => '');
  const lineas = texto.split('\n').map(l => l.trim()).filter(l => l.length > 3);

  // Qué plan tenemos
  const plan = lineas.filter(l => /gratis|free|plan|tarifa|básico|basic|standard|professional|enterprise/i.test(l));
  console.log('[Bitrix24] menciones de plan:', [...new Set(plan)].slice(0, 15).join(' | '));

  await page.screenshot({ path: 'evidencia/bitrix24-plan.png', fullPage: true });

  // Buscar candados / paywalls en el CRM
  await page.goto('/crm/deal/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(7000);

  const cuerpo = await page.locator('body').innerText().catch(() => '');
  const premium = cuerpo.split('\n').map(l => l.trim())
    .filter(l => /mejore su plan|actualizar|upgrade|disponible en|plan superior|prueba gratuita/i.test(l));
  console.log('[Bitrix24] señales de premium en el CRM:', [...new Set(premium)].slice(0, 10).join(' | '));

  // Las automatizaciones son pagas en Free: intentamos abrirlas
  const reglas = page.getByText(/Reglas de automatización/i).first();
  if (await reglas.isVisible().catch(() => false)) {
    await reglas.click().catch(() => {});
    await page.waitForTimeout(6000);
    const tras = await page.locator('body').innerText().catch(() => '');
    const bloqueo = tras.split('\n').map(l => l.trim())
      .filter(l => /disponible|plan|actualizar|mejorar|suscri/i.test(l));
    console.log('[Bitrix24] al abrir automatizaciones:', [...new Set(bloqueo)].slice(0, 8).join(' | '));
    await page.screenshot({ path: 'evidencia/bitrix24-paywall-automatizaciones.png', fullPage: true });
  }
});
