import { test, expect } from '@playwright/test';

const EMAIL = 'tp@unimoron.test';
const PASS = 'TpCrm2026!';

// Completa la activación del espacio de trabajo, que es el último paso del onboarding.

test('activar espacio de trabajo', async ({ page }) => {
  test.setTimeout(240_000);

  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  // Si pide login de nuevo, lo hacemos
  if (page.url().includes('/welcome')) {
    const btnEmail = page.getByRole('button', { name: /Continuar con el correo|Continue with email/i });
    if (await btnEmail.isVisible().catch(() => false)) {
      await btnEmail.click();
      await page.waitForTimeout(2000);
    }
    const email = page.locator('input[type="email"], input[autocomplete="email"]').first();
    if (await email.isVisible().catch(() => false)) {
      await email.fill(EMAIL);
      await page.keyboard.press('Enter');
      await page.waitForTimeout(3000);
    }
    const pass = page.locator('input[type="password"]').first();
    if (await pass.isVisible().catch(() => false)) {
      await pass.fill(PASS);
      await page.keyboard.press('Enter');
      await page.waitForTimeout(6000);
    }
  }

  console.log('\n[Twenty] estoy en:', page.url(), '|', await page.title());

  // Recorremos las pantallas de onboarding hasta llegar a la aplicación
  for (let paso = 1; paso <= 10; paso++) {
    const url = page.url();
    if (!/welcome|activation|create|onboarding|invite|sync/i.test(url)) {
      console.log(`[Twenty] fuera del onboarding en el paso ${paso}: ${url}`);
      break;
    }

    const titulo = await page.title();
    const inputs = await page.locator('input:visible').all();
    console.log(`[Twenty] paso ${paso} — "${titulo}" | ${inputs.length} input(s) | ${url}`);

    for (const inp of inputs) {
      const ph = (await inp.getAttribute('placeholder')) ?? '';
      if (await inp.inputValue()) continue;
      const texto = /espacio|work|empresa|company/i.test(ph) ? 'TP Universidad de Moron'
                  : /apellido|last/i.test(ph) ? 'Moron'
                  : /nombre|first|name/i.test(ph) ? 'TP'
                  : 'TP';
      await inp.fill(texto);
      console.log(`     "${ph}" -> "${texto}"`);
    }

    // Preferimos el botón visible; si no hay, Enter
    const botones = page.locator('button:visible').filter({ hasNotText: /^$/ });
    const cant = await botones.count();
    let clickeado = false;
    for (let i = 0; i < cant; i++) {
      const txt = ((await botones.nth(i).textContent()) ?? '').trim();
      if (/continuar|siguiente|crear|empezar|continue|next|create|start|finalizar/i.test(txt)) {
        console.log(`     click en "${txt}"`);
        await botones.nth(i).click();
        clickeado = true;
        break;
      }
    }
    if (!clickeado) await page.keyboard.press('Enter');

    await page.waitForTimeout(5000);
  }

  console.log('[Twenty] URL final:', page.url(), '|', await page.title());
  await page.screenshot({ path: 'evidencia/twenty-workspace-activo.png', fullPage: true });

  // Ya tiene que estar dentro de la aplicación
  expect(page.url()).not.toContain('/welcome');
  expect(page.url()).not.toContain('workspace-activation');
});
