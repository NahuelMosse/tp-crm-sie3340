import { test } from '@playwright/test';

/**
 * Exploración de EspoCRM contra los requerimientos del rubro seguros.
 * No valida nada: recorre y reporta qué existe, para llenar las tablas de puntos.
 */

async function login(page) {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.locator('#field-userName').waitFor({ state: 'visible' });
  await page.locator('#field-userName').fill('admin');
  await page.locator('#field-password').fill('Admin1234!');
  await page.getByRole('button', { name: 'Iniciar sesión' }).click();
  await page.locator('#menu, .navbar, nav').first().waitFor({ state: 'visible', timeout: 30_000 });
}

async function ver(page, ruta: string, etiqueta: string, captura?: string) {
  await page.goto(ruta, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3500);
  const txt = await page.locator('body').innerText().catch(() => '');
  const limpio = [...new Set(txt.split('\n').map(l => l.trim()).filter(l => l.length > 2))];
  const err = /no encontrado|not found|404|no tiene acceso|forbidden/i.test(txt.slice(0, 400));
  console.log(`\n### ${etiqueta}  [UI:espocrm ${ruta}]`);
  console.log(err ? '   NO EXISTE / SIN ACCESO' : '   ' + limpio.slice(0, 22).join(' | '));
  if (captura) await page.screenshot({ path: `evidencia/explorar-espocrm-${captura}.png`, fullPage: true });
}

test('explorar EspoCRM para el rubro seguros', async ({ page }) => {
  test.setTimeout(300_000);
  await login(page);

  // RF-10 Campañas de marketing
  await ver(page, '/#Campaign', 'RF-10 · Campañas de marketing', 'campanias');
  // RF-11 Segmentación → listas objetivo
  await ver(page, '/#TargetList', 'RF-11 · Segmentación / Listas objetivo', 'segmentacion');
  // RF-12 Quejas y reclamaciones → casos
  await ver(page, '/#Case', 'RF-12 · Casos / Reclamos', 'casos');
  // RF-02 Pólizas → Entity Manager
  await ver(page, '/#Admin/entityManager', 'RF-02 · Entity Manager (crear entidad Póliza)', 'entitymanager');
  // RF-18 Importación
  await ver(page, '/#Import', 'RF-18 · Importación de datos', 'import');
  // RF-19 Sincronización de email
  await ver(page, '/#Admin/inboundEmails', 'RF-19 · Cuentas de correo entrante', 'email');
  // RF-09 Forecast
  await ver(page, '/#Opportunity', 'RF-09 · Oportunidades / Forecast', 'oportunidades');
  // Extensiones disponibles
  await ver(page, '/#Admin/extensions', 'Extensiones instaladas', 'extensiones');
  // Panel de administración completo: qué módulos hay
  await ver(page, '/#Admin', 'Panel de administración', 'admin');
});
