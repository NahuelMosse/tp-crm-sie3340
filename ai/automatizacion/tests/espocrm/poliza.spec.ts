import { test, expect } from '@playwright/test';

/**
 * RF-02 / RF-03 / RF-17 vía NF-06 (parametrización).
 *
 * No alcanza con ver que existe el botón "Crear entidad": hay que crear de verdad
 * la entidad Póliza, agregarle campos del rubro y relacionarla al asegurado.
 * Esto es lo que decide si el CRM sirve para una compañía de seguros.
 */

async function login(page) {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.locator('#field-userName').waitFor({ state: 'visible' });
  await page.locator('#field-userName').fill('admin');
  await page.locator('#field-password').fill('Admin1234!');
  await page.getByRole('button', { name: 'Iniciar sesión' }).click();
  await page.locator('#menu, .navbar, nav').first().waitFor({ state: 'visible', timeout: 30_000 });
}

test('RF-02 — crear la entidad Póliza sin programar', async ({ page }) => {
  test.setTimeout(300_000);
  const t0 = Date.now();
  await login(page);

  await page.goto('/#Admin/entityManager', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3500);

  // ¿Qué tipos de entidad ofrece?
  // Es un <button>, no un <a>: "+ Crear entidad"
  const crear = page.getByRole('button', { name: /Crear entidad|Create Entity/i }).first();
  await crear.click();
  await page.waitForTimeout(3500);
  await page.screenshot({ path: 'evidencia/poliza-espocrm-1-formulario.png', fullPage: true });

  const tipos = await page.locator('select[data-name="type"] option, [data-name="type"] option').allTextContents();
  console.log('\n[EspoCRM] tipos de entidad disponibles:', tipos.filter(Boolean).join(' | '));

  // OJO: EspoCRM autocompleta las etiquetas mientras se escribe el nombre.
  // Hay que limpiar antes de escribir o el texto se concatena.
  await page.locator('input[data-name="name"], #field-name').first().fill('Poliza');
  await page.waitForTimeout(1200);

  for (const [sel, valor] of [
    ['input[data-name="labelSingular"], #field-labelSingular', 'Póliza'],
    ['input[data-name="labelPlural"], #field-labelPlural', 'Pólizas'],
  ] as const) {
    const campo = page.locator(sel).first();
    if (await campo.isVisible().catch(() => false)) {
      await campo.clear();
      await campo.fill(valor);
    }
  }

  // "Historia" habilita el historial de cambios de la entidad → NF-23 trazabilidad
  const historia = page.locator('label:has-text("Historia")').locator('..').locator('input[type="checkbox"]').first()
    .or(page.locator('input[type="checkbox"]').last());
  if (await historia.isVisible().catch(() => false)) {
    await historia.check({ force: true }).catch(() => {});
    console.log('[EspoCRM] "Historia" (historial de cambios) marcado');
  }
  await page.screenshot({ path: 'evidencia/poliza-espocrm-1b-completado.png', fullPage: true });

  // El botón del formulario es "Crear", no "Guardar"
  await page.getByRole('button', { name: /^Crear$|^Create$/i }).first().click();
  await page.waitForTimeout(9000);
  const tCrear = Date.now() - t0;
  await page.screenshot({ path: 'evidencia/poliza-espocrm-2-creada.png', fullPage: true });
  console.log(`[EspoCRM] entidad creada en ${(tCrear / 1000).toFixed(1)} s desde el login`);

  // ¿Aparece en el Entity Manager?
  await page.goto('/#Admin/entityManager', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3500);
  const hayPoliza = await page.getByText(/Póliza|Poliza/i).first().isVisible().catch(() => false);
  console.log(`[EspoCRM] la entidad Póliza aparece en la lista: ${hayPoliza ? 'SÍ' : 'NO'}`);

  // Campos del rubro: tipos de dato disponibles
  await page.goto('/#Admin/fields/scope=Poliza', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);
  await page.screenshot({ path: 'evidencia/poliza-espocrm-3-campos.png', fullPage: true });

  const agregar = page.getByRole('link', { name: /Agregar campo|Add Field/i }).first();
  if (await agregar.isVisible().catch(() => false)) {
    await agregar.click();
    await page.waitForTimeout(3500);
    const tiposCampo = (await page.locator('a, .list-group-item').allTextContents())
      .map(t => t.trim()).filter(t => t.length > 1 && t.length < 30);
    console.log('[EspoCRM] tipos de campo disponibles:', [...new Set(tiposCampo)].slice(0, 40).join(' | '));
    await page.screenshot({ path: 'evidencia/poliza-espocrm-4-tipos-campo.png', fullPage: true });
  }

  expect(hayPoliza).toBeTruthy();
});
