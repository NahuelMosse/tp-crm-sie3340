import { test } from '@playwright/test';

test('límites reales del plan Free', async ({ page }) => {
  test.setTimeout(200_000);

  // La página de licencia tiene una sección "Límites del plan"
  await page.goto('/settings/license_all.php', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(9000);

  const link = page.getByText(/Límites del plan/i).first();
  if (await link.isVisible().catch(() => false)) {
    await link.click().catch(() => {});
    await page.waitForTimeout(9000);
  }
  console.log(`\n[Bitrix24] ${page.url()}`);

  const texto = await page.locator('body').innerText().catch(() => '');
  const lineas = [...new Set(texto.split('\n').map(l => l.trim()).filter(l => l.length > 2))];

  const usuarios = lineas.filter(l => /usuario|user|empleado|colaborador|miembro/i.test(l));
  console.log('[Bitrix24] menciones de usuarios:');
  usuarios.slice(0, 20).forEach(l => console.log('   ', l));

  const limites = lineas.filter(l => /límite|limit|GB|almacenamiento|registro|máximo/i.test(l));
  console.log('[Bitrix24] límites:');
  limites.slice(0, 20).forEach(l => console.log('   ', l));

  await page.screenshot({ path: 'evidencia/bitrix24-limites.png', fullPage: true });

  // La lista de usuarios del portal dice cuántos podemos tener
  await page.goto('/company/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(8000);
  const empresa = await page.locator('body').innerText().catch(() => '');
  const cupo = [...new Set(empresa.split('\n').map(l => l.trim()))]
    .filter(l => /usuario|invitar|plan|límite|de \d+/i.test(l) && l.length < 120);
  console.log('\n[Bitrix24] en la sección Empresa/usuarios:');
  cupo.slice(0, 15).forEach(l => console.log('   ', l));
  await page.screenshot({ path: 'evidencia/bitrix24-usuarios.png', fullPage: true });
});
