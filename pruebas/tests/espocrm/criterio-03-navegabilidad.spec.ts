import { test, expect } from '@playwright/test';

const USER = 'admin';
const PASS = 'Admin1234!';

async function login(page) {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.locator('#field-userName').waitFor({ state: 'visible' });
  await page.locator('#field-userName').fill(USER);
  await page.locator('#field-password').fill(PASS);
  await page.getByRole('button', { name: 'Iniciar sesión' }).click();
  // La SPA carga el menú principal después de autenticar
  await page.locator('#menu, .navbar, nav').first().waitFor({ state: 'visible', timeout: 30_000 });
}

test('C03-01 — clicks y tiempo desde login hasta crear un contacto', async ({ page }) => {
  const t0 = Date.now();
  let clicks = 0;

  await login(page);
  const tLogin = Date.now() - t0;
  console.log(`\n[EspoCRM] login completado en ${tLogin} ms`);

  // Ir a Contactos
  await page.goto('/#Contact', { waitUntil: 'domcontentloaded' });
  clicks++;
  await page.waitForTimeout(2500);

  // Botón de crear
  const crear = page.getByRole('link', { name: /Crear Contacto|Create Contact/i })
    .or(page.locator('a[data-action="create"], button[data-action="create"]')).first();
  await crear.click();
  clicks++;

  // Formulario
  await page.locator('input[data-name="firstName"], #field-firstName').first()
    .waitFor({ state: 'visible', timeout: 20_000 });
  await page.locator('input[data-name="firstName"], #field-firstName').first().fill('TP-TEST-UI');
  await page.locator('input[data-name="lastName"], #field-lastName').first().fill('Navegabilidad');
  clicks += 2;

  await page.getByRole('button', { name: /^Guardar$|^Save$/i }).first().click();
  clicks++;

  // Confirmar que quedó guardado
  await expect(page.getByText('TP-TEST-UI').first()).toBeVisible({ timeout: 25_000 });

  const total = Date.now() - t0;
  console.log(`[EspoCRM] contacto creado — clicks: ${clicks} | tiempo total: ${total} ms`);
  await page.screenshot({ path: 'evidencia/espocrm-C03-01-contacto-creado.png', fullPage: true });
});

test('C04-06 — la interfaz está en español', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.locator('#field-userName').waitFor({ state: 'visible' });

  // El botón del login ya viene traducido sin configurar nada
  await expect(page.getByRole('button', { name: 'Iniciar sesión' })).toBeVisible();
  console.log('\n[EspoCRM] login en español: "Iniciar sesión" ✓');

  await login(page);
  const textos = await page.locator('#menu a, nav a').allTextContents();
  console.log('[EspoCRM] menú:', textos.map(t => t.trim()).filter(Boolean).slice(0, 12).join(' | '));
  await page.screenshot({ path: 'evidencia/espocrm-C04-06-espanol.png', fullPage: true });
});
