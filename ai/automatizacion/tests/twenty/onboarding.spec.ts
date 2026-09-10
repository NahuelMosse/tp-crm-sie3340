import { test, expect } from '@playwright/test';

const EMAIL = 'tp@unimoron.test';
const PASS = 'TpCrm2026!';

// Twenty arranca sin cuenta: hay que hacer el registro inicial y crear el workspace.
// Este test lo hace paso a paso y reporta cada pantalla, para poder escribir los
// tests de criterios sobre una instancia ya inicializada.

test('inicializar workspace de Twenty', async ({ page }) => {
  test.setTimeout(180_000);

  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);
  console.log('\n[Twenty] paso 1 —', page.url(), '|', await page.title());

  // Si ya está inicializado, cortamos acá
  if (!page.url().includes('/welcome') && !page.url().includes('sign')) {
    console.log('[Twenty] ya inicializado, no hace falta onboarding');
    await page.screenshot({ path: 'evidencia/twenty-ya-inicializado.png', fullPage: true });
    return;
  }

  await page.getByRole('button', { name: /Continuar con el correo|Continue with email/i }).click();
  await page.waitForTimeout(2500);
  console.log('[Twenty] paso 2 — tras elegir email:', page.url());

  const email = page.locator('input[type="email"], input[name="email"], input[autocomplete="email"]').first();
  await email.waitFor({ state: 'visible', timeout: 20_000 });
  await email.fill(EMAIL);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(3000);
  console.log('[Twenty] paso 3 — tras el email:', page.url());

  const pass = page.locator('input[type="password"]').first();
  await pass.waitFor({ state: 'visible', timeout: 20_000 });
  await pass.fill(PASS);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(6000);
  console.log('[Twenty] paso 4 — tras la contraseña:', page.url());
  await page.screenshot({ path: 'evidencia/twenty-paso4.png', fullPage: true });

  // Onboarding: nombre del workspace y del usuario. Los campos varían según versión,
  // así que vamos llenando lo que aparezca y avanzando con Enter.
  for (let i = 0; i < 6; i++) {
    const visibles = await page.locator('input:visible').all();
    if (visibles.length === 0) break;

    console.log(`[Twenty] onboarding ${i + 1} — ${visibles.length} input(s) en ${page.url()}`);
    for (const [n, inp] of visibles.entries()) {
      const ph = await inp.getAttribute('placeholder');
      const val = await inp.inputValue();
      if (!val) {
        const texto = /work|espacio|empresa|company/i.test(ph ?? '') ? 'TP Universidad de Moron'
                    : /last|apellido/i.test(ph ?? '') ? 'Moron'
                    : 'TP';
        await inp.fill(texto);
        console.log(`   input[${n}] placeholder="${ph}" -> "${texto}"`);
      }
    }
    await page.keyboard.press('Enter');
    await page.waitForTimeout(4000);
  }

  console.log('[Twenty] estado final —', page.url(), '|', await page.title());
  await page.screenshot({ path: 'evidencia/twenty-final.png', fullPage: true });

  // Debe haber salido de las pantallas de registro
  expect(page.url()).not.toContain('/welcome');
});
