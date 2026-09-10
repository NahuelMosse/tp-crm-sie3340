import { test } from '@playwright/test';

/**
 * Exploración de Bitrix24 Free contra los requerimientos del rubro seguros.
 * Interesa sobre todo distinguir qué está disponible y qué muestra paywall.
 */

async function ver(page, ruta: string, etiqueta: string, captura?: string) {
  await page.goto(ruta, { waitUntil: 'domcontentloaded' }).catch(() => {});
  await page.waitForTimeout(6000);
  const txt = await page.locator('body').innerText().catch(() => '');
  const limpio = [...new Set(txt.split('\n').map(l => l.trim()).filter(l => l.length > 2))];
  const pago = limpio.filter(l => /mejore su plan|suscripci|actualizar|disponible en|plan superior|comprar/i.test(l));
  console.log(`\n### ${etiqueta}  [UI:bitrix24 ${ruta}]`);
  console.log('   URL final:', page.url());
  console.log('   ' + limpio.slice(0, 22).join(' | '));
  if (pago.length) console.log('   ⚠ PAYWALL:', [...new Set(pago)].slice(0, 5).join(' | '));
  if (captura) await page.screenshot({ path: `evidencia/explorar-bitrix24-${captura}.png`, fullPage: true });
}

test('explorar Bitrix24 para el rubro seguros', async ({ page }) => {
  test.setTimeout(400_000);

  // RF-02 Pólizas → Smart Processes (entidades propias)
  await ver(page, '/crm/type/', 'RF-02 · Procesos inteligentes / entidades propias', 'smartprocess');
  // RF-10 Campañas de marketing
  await ver(page, '/marketing/', 'RF-10 · Marketing y campañas', 'marketing');
  // RF-12 Quejas y reclamaciones
  await ver(page, '/crm/deal/category/0/', 'RF-12 · Pipelines / embudos', 'pipelines');
  // RF-13/14 Redes sociales → contact center
  await ver(page, '/contact_center/', 'RF-13/14 · Contact center y canales (redes)', 'contactcenter');
  // RF-19 Email
  await ver(page, '/mail/', 'RF-19 · Webmail / sincronización de correo', 'mail');
  // RF-09 Forecast → analítica de ventas
  await ver(page, '/crm/analytics/', 'RF-09 · Analítica de ventas / forecast', 'analitica');
  // Campos custom
  await ver(page, '/crm/configs/fields/', 'RF-02 · Campos personalizados', 'campos');
  // Marketplace
  await ver(page, '/marketplace/', 'Marketplace de aplicaciones', 'marketplace');
});
