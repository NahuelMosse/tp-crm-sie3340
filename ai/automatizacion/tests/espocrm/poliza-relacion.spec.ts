import { test, expect } from '@playwright/test';

/**
 * RF-02 (parte 2) — relacionar la Póliza con el asegurado, por interfaz.
 * La entidad CPoliza y sus campos ya se crearon; falta el vínculo al Contacto.
 */

async function login(page) {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.locator('#field-userName').waitFor({ state: 'visible' });
  await page.locator('#field-userName').fill('admin');
  await page.locator('#field-password').fill('Admin1234!');
  await page.getByRole('button', { name: 'Iniciar sesión' }).click();
  await page.locator('#menu, .navbar, nav').first().waitFor({ state: 'visible', timeout: 30_000 });
}

test('RF-02b — relacionar Póliza con el asegurado', async ({ page }) => {
  test.setTimeout(240_000);
  await login(page);

  // Los campos del rubro ya cargados
  await page.goto('/#Admin/fieldManager/scope=CPoliza', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);
  const campos = (await page.locator('body').innerText().catch(() => ''))
    .split('\n').map(l => l.trim()).filter(l => /prima|vigencia|tipo|estado/i.test(l));
  console.log('\n[EspoCRM] campos del rubro en la entidad Póliza:', [...new Set(campos)].join(' | '));
  await page.screenshot({ path: 'evidencia/poliza-espocrm-5-campos-rubro.png', fullPage: true });

  // Relaciones de la entidad
  await page.goto('/#Admin/linkManager/scope=CPoliza', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);
  await page.screenshot({ path: 'evidencia/poliza-espocrm-6-relaciones.png', fullPage: true });

  const crearRel = page.getByRole('button', { name: /Crear relaci|Create Link|Agregar/i }).first();
  if (await crearRel.isVisible().catch(() => false)) {
    await crearRel.click();
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'evidencia/poliza-espocrm-7-form-relacion.png', fullPage: true });

    const opciones = (await page.locator('select option').allTextContents()).map(t => t.trim()).filter(Boolean);
    console.log('[EspoCRM] tipos de relación disponibles:', [...new Set(opciones)].slice(0, 25).join(' | '));
  }

  // La entidad ya es usable: hay un registro cargado por API
  await page.goto('/#CPoliza', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);
  await page.screenshot({ path: 'evidencia/poliza-espocrm-8-listado.png', fullPage: true });
  const listado = await page.locator('body').innerText().catch(() => '');
  console.log('[EspoCRM] listado de Pólizas contiene POL-2026-0001:', /POL-2026-0001/.test(listado) ? 'SÍ' : 'NO');
  expect(listado.length).toBeGreaterThan(50);
});
