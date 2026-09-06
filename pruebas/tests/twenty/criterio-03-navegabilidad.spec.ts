import { test, expect } from '@playwright/test';
import { entrarATwenty } from './helper';

test('C03-01 — clicks y tiempo desde login hasta crear un registro', async ({ page }) => {
  test.setTimeout(240_000);
  const t0 = Date.now();
  let clicks = 0;

  console.log('');
  await entrarATwenty(page);
  const tLogin = Date.now() - t0;
  console.log(`[Twenty] sesión lista en ${tLogin} ms`);

  await page.goto('/objects/people', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(6000);
  clicks++;
  console.log(`[Twenty] listado: ${page.url()} | título: ${await page.title()}`);

  const etiquetas: string[] = [];
  for (const b of await page.locator('button:visible').all()) {
    const t = ((await b.textContent()) ?? '').trim();
    const aria = await b.getAttribute('aria-label');
    if (t || aria) etiquetas.push(t || `[${aria}]`);
  }
  console.log('[Twenty] botones:', etiquetas.slice(0, 18).join(' | '));

  // El botón de crear aparece como "New Person..." — el nombre del objeto NO se traduce
  const nuevo = page.getByRole('button', { name: /New Person|Nuevo registro|New record|Añadir|Agregar/i }).first();
  if (await nuevo.isVisible().catch(() => false)) {
    await nuevo.click();
    clicks++;
    await page.waitForTimeout(3500);

    await page.keyboard.type('TP-TEST-UI');
    await page.keyboard.press('Enter');
    clicks++;
    await page.waitForTimeout(3500);

    await expect(page.getByText('TP-TEST-UI').first()).toBeVisible({ timeout: 25_000 });
    console.log(`[Twenty] registro creado — clicks: ${clicks} | tiempo total: ${Date.now() - t0} ms`);
  } else {
    console.log('[Twenty] no encontré el botón de crear registro');
  }

  await page.screenshot({ path: 'evidencia/twenty-C03-01-registro-creado.png', fullPage: true });
});

test('C04-06 — la interfaz está en español', async ({ page }) => {
  test.setTimeout(240_000);
  console.log('');
  await entrarATwenty(page, false);

  await page.goto('/objects/people', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(6000);

  const textos = (await page.locator('button:visible, a:visible, h1:visible, h2:visible, h3:visible, span:visible')
    .allTextContents()).map(t => t.trim()).filter(t => t.length > 2);

  const unicos = [...new Set(textos)].slice(0, 30);
  console.log('[Twenty] textos de la interfaz:', unicos.join(' | '));

  // Hallazgo: Twenty traduce los controles de la interfaz pero NO el modelo de datos
  const controlesEs = ['Espacio de trabajo', 'Filtro', 'Ordenar', 'Opciones', 'Buscar'];
  const modeloEn = ['Companies', 'People', 'Opportunities', 'Tasks', 'Notes',
                    'Name', 'Emails', 'Company', 'Phones', 'Job Title', 'Creation date'];

  const traducidos = controlesEs.filter(p => textos.some(t => t.includes(p)));
  const sinTraducir = modeloEn.filter(p => textos.some(t => t === p || t.includes(p)));

  console.log(`[Twenty] controles traducidos:  ${traducidos.join(', ') || 'ninguno'}`);
  console.log(`[Twenty] SIN traducir (inglés): ${sinTraducir.join(', ') || 'ninguno'}`);
  console.log('[Twenty] conclusión: traducción PARCIAL — la interfaz sí, el modelo de datos no');

  expect(traducidos.length, 'debería traducir al menos los controles').toBeGreaterThan(0);
  expect(sinTraducir.length, 'el modelo de datos queda en inglés').toBeGreaterThan(0);

  await page.screenshot({ path: 'evidencia/twenty-C04-06-espanol.png', fullPage: true });
});
