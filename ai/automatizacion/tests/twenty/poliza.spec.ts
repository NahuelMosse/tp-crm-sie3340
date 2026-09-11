import { test, expect } from '@playwright/test';
import { entrarATwenty } from './helper';

/**
 * RF-02 en Twenty — crear el objeto Póliza desde la interfaz.
 * Misma prueba que en EspoCRM, para poder comparar.
 */

test('RF-02 — crear el objeto Póliza sin programar', async ({ page }) => {
  test.setTimeout(300_000);
  const t0 = Date.now();
  await entrarATwenty(page, false);

  await page.goto('/settings/objects', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);
  await page.screenshot({ path: 'evidencia/poliza-twenty-1-objetos.png', fullPage: true });

  const añadir = page.getByRole('button', { name: /Añadir objeto|Add object|Nuevo objeto/i })
    .or(page.getByText(/Añadir objeto|Add object/i)).first();
  await añadir.click();
  await page.waitForTimeout(4000);
  await page.screenshot({ path: 'evidencia/poliza-twenty-2-formulario.png', fullPage: true });

  // Campos del formulario de alta de objeto
  const inputs = await page.locator('input:visible').all();
  console.log(`\n[Twenty] el formulario de objeto nuevo tiene ${inputs.length} campos`);
  for (const [i, inp] of inputs.entries()) {
    const ph = await inp.getAttribute('placeholder');
    console.log(`   [${i}] placeholder="${ph}"`);
  }

  // Los campos son Singular y Plurales; el primer input es el selector de ícono
  await page.getByPlaceholder('Listado', { exact: true }).fill('Poliza');
  await page.getByPlaceholder('Listados', { exact: true }).fill('Polizas');
  await page.getByPlaceholder(/descripci/i).fill('Polizas de seguro del asegurado').catch(() => {});
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'evidencia/poliza-twenty-3-completado.png', fullPage: true });

  const guardar = page.getByRole('button', { name: /Guardar|Save|Crear|Create/i }).first();
  if (await guardar.isVisible().catch(() => false)) {
    await guardar.click();
    await page.waitForTimeout(7000);
  }
  const tCrear = Date.now() - t0;
  await page.screenshot({ path: 'evidencia/poliza-twenty-4-creado.png', fullPage: true });
  console.log(`[Twenty] objeto creado en ${(tCrear / 1000).toFixed(1)} s desde el login`);

  // ¿Aparece en el listado de objetos?
  await page.goto('/settings/objects', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);
  const txt = await page.locator('body').innerText().catch(() => '');
  const hay = /Poliza/i.test(txt);
  console.log(`[Twenty] el objeto Póliza aparece en la lista: ${hay ? 'SÍ' : 'NO'}`);
  await page.screenshot({ path: 'evidencia/poliza-twenty-5-lista.png', fullPage: true });

  // Tipos de campo disponibles para agregarle
  if (hay) {
    await page.getByText(/Poliza/i).first().click().catch(() => {});
    await page.waitForTimeout(4000);
    await page.screenshot({ path: 'evidencia/poliza-twenty-6-detalle.png', fullPage: true });
  }
  expect(hay).toBeTruthy();
});
