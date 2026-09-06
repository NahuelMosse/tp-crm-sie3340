import { test, expect } from '@playwright/test';

// Estos tests usan auth-bitrix.json: entran directo, sin login ni captcha.

test('sesión guardada — entra sin login', async ({ page }) => {
  test.setTimeout(120_000);
  const t0 = Date.now();

  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(6000);

  console.log(`\n[Bitrix24] URL: ${page.url()}`);
  console.log(`[Bitrix24] título: ${await page.title()}`);
  console.log(`[Bitrix24] entró en ${Date.now() - t0} ms`);

  // Si estuviéramos afuera veríamos el formulario de login
  await expect(page.locator('nav[aria-label="Menú principal"], a[href="/stream/"], a[href="/online/"]').first())
    .toBeVisible({ timeout: 30_000 });
  console.log('[Bitrix24] menú del portal visible: la sesión funciona ✓');

  await page.screenshot({ path: 'evidencia/bitrix24-sesion-reusada.png', fullPage: true });
});

test('C03-01 — navegar al CRM y listar los módulos', async ({ page }) => {
  test.setTimeout(150_000);

  await page.goto('/crm/deal/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(8000);

  console.log(`\n[Bitrix24] CRM: ${page.url()} | ${await page.title()}`);

  const enlaces = (await page.locator('nav a:visible, .menu-item-link:visible').allTextContents())
    .map(t => t.trim()).filter(t => t.length > 1);
  console.log('[Bitrix24] menú:', [...new Set(enlaces)].slice(0, 22).join(' | '));

  const botones = (await page.locator('button:visible').allTextContents())
    .map(t => t.trim()).filter(Boolean);
  console.log('[Bitrix24] botones:', [...new Set(botones)].slice(0, 15).join(' | '));

  await page.screenshot({ path: 'evidencia/bitrix24-C03-01-crm.png', fullPage: true });
});

test('C04-06 — idioma de la interfaz', async ({ page }) => {
  test.setTimeout(150_000);

  await page.goto('/crm/deal/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(8000);

  const textos = (await page.locator('a:visible, button:visible, h1:visible, span:visible').allTextContents())
    .map(t => t.trim()).filter(t => t.length > 2);
  const unicos = [...new Set(textos)];

  const es = ['Negocios', 'Clientes', 'Contactos', 'Empresas', 'Actividades', 'Crear', 'Filtro',
              'Buscar', 'Ajustes', 'Configuración', 'Informes', 'Prospectos', 'Ventas'];
  const en = ['Deals', 'Contacts', 'Companies', 'Leads', 'Activities', 'Create', 'Settings', 'Reports'];

  const traducidos = es.filter(p => unicos.some(t => t.includes(p)));
  const sinTraducir = en.filter(p => unicos.some(t => t === p));

  console.log('\n[Bitrix24] muestra de la interfaz:', unicos.slice(0, 25).join(' | '));
  console.log(`[Bitrix24] en español: ${traducidos.join(', ') || 'ninguno'}`);
  console.log(`[Bitrix24] en inglés:  ${sinTraducir.join(', ') || 'ninguno'}`);

  await page.screenshot({ path: 'evidencia/bitrix24-C04-06-idioma.png', fullPage: true });
});
