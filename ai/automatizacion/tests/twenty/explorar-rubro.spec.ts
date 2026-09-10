import { test } from '@playwright/test';
import { entrarATwenty } from './helper';

/**
 * Exploración de Twenty contra los requerimientos del rubro seguros.
 */

async function ver(page, ruta: string, etiqueta: string, captura?: string) {
  await page.goto(ruta, { waitUntil: 'domcontentloaded' }).catch(() => {});
  await page.waitForTimeout(5000);
  const txt = await page.locator('body').innerText().catch(() => '');
  const limpio = [...new Set(txt.split('\n').map(l => l.trim()).filter(l => l.length > 2))];
  console.log(`\n### ${etiqueta}  [UI:twenty ${ruta}]`);
  console.log('   URL final:', page.url());
  console.log('   ' + limpio.slice(0, 24).join(' | '));
  if (captura) await page.screenshot({ path: `evidencia/explorar-twenty-${captura}.png`, fullPage: true });
}

test('explorar Twenty para el rubro seguros', async ({ page }) => {
  test.setTimeout(400_000);
  await entrarATwenty(page, false);

  // RF-02 Pólizas → modelo de datos, objetos custom
  await ver(page, '/settings/objects', 'RF-02 · Modelo de datos / objetos custom', 'objetos');
  // Qué objetos trae de fábrica
  await ver(page, '/objects/opportunities', 'RF-06/09 · Oportunidades', 'oportunidades');
  await ver(page, '/objects/tasks', 'RF-20 · Tareas asignables', 'tareas');
  await ver(page, '/objects/notes', 'RF-15 · Notas', 'notas');
  // RF-19 Email
  await ver(page, '/settings/accounts', 'RF-19 · Cuentas de correo y calendario', 'cuentas');
  // Marketplace / integraciones
  await ver(page, '/settings/integrations', 'Integraciones disponibles', 'integraciones');
  // Panel de administración
  await ver(page, '/settings/admin-panel', 'Panel de administración', 'admin');
  // Workflows: ¿automatización?
  await ver(page, '/objects/workflows', 'Automatización / Workflows', 'workflows');
});
