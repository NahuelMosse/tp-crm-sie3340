import { test } from '@playwright/test';

// Test exploratorio: no valida nada, solo reporta qué hay en la pantalla de login
// para escribir los selectores reales de los tests de verdad.

test('descubrir formulario de login', async ({ page }, testInfo) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(6000); // las dos son SPA: hay que esperar el render

  console.log(`\n===== ${testInfo.project.name.toUpperCase()} =====`);
  console.log('URL final:', page.url());
  console.log('Título:', await page.title());

  const inputs = await page.locator('input:visible').all();
  console.log(`\nInputs visibles: ${inputs.length}`);
  for (const [i, inp] of inputs.entries()) {
    const attrs = await inp.evaluate((el: HTMLInputElement) => ({
      type: el.type, name: el.name, id: el.id,
      placeholder: el.placeholder, ariaLabel: el.getAttribute('aria-label'),
      testid: el.getAttribute('data-testid'),
    }));
    console.log(`  [${i}]`, JSON.stringify(attrs));
  }

  const botones = await page.locator('button:visible, a[role="button"]:visible').all();
  console.log(`\nBotones visibles: ${botones.length}`);
  for (const [i, b] of botones.entries()) {
    const txt = (await b.textContent())?.trim().slice(0, 40);
    const testid = await b.getAttribute('data-testid');
    console.log(`  [${i}] "${txt}"${testid ? ` testid=${testid}` : ''}`);
  }

  await page.screenshot({ path: `evidencia/login-${testInfo.project.name}.png`, fullPage: true });
});
