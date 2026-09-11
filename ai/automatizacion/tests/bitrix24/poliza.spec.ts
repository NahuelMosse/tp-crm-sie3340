import { test } from '@playwright/test';

/**
 * RF-02 en Bitrix24 — crear la entidad Póliza con "Automatización Inteligente
 * de Procesos" (Smart Process Automation), y ver si el plan Free lo permite.
 */

test('RF-02 — crear la entidad Póliza y detectar paywall', async ({ page }) => {
  test.setTimeout(300_000);

  await page.goto('/crm/type/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(9000);
  await page.screenshot({ path: 'evidencia/poliza-bitrix24-1-listado.png', fullPage: true });

  const botones = (await page.locator('button:visible, a:visible').allTextContents())
    .map(t => t.trim()).filter(t => t.length > 1 && t.length < 40);
  console.log('\n[Bitrix24] acciones disponibles:', [...new Set(botones)].slice(0, 20).join(' | '));

  // Botón de crear
  const crear = page.getByText(/^Crear$|^Añadir$|^Agregar$|^Create$|^Nuevo/i).first();
  if (await crear.isVisible().catch(() => false)) {
    await crear.click();
    await page.waitForTimeout(8000);
    await page.screenshot({ path: 'evidencia/poliza-bitrix24-2-formulario.png', fullPage: true });

    // OJO: no detectar paywall por el texto global de la página. El botón fijo
    // "Mejore su plan" y "Comprar ahora" del menú dan falso positivo.
    // Hay que completar la acción y ver si se bloquea de verdad.
    const opciones = (await page.locator('[role="dialog"], .ui-side-panel-wrap').allTextContents())
      .join(' ').slice(0, 300);
    console.log('[Bitrix24] opciones del diálogo:', opciones || '(sin diálogo)');

    const vacio = page.getByText(/SPA vac[ií]o|Solo esenciales/i).first();
    if (await vacio.isVisible().catch(() => false)) {
      await vacio.click();
      await page.waitForTimeout(9000);
      await page.screenshot({ path: 'evidencia/poliza-bitrix24-2b-tipo-elegido.png', fullPage: true });

      // Nombre de la entidad
      const nombre = page.locator('input[type="text"]:visible').first();
      if (await nombre.isVisible().catch(() => false)) {
        await nombre.fill('Poliza');
        console.log('[Bitrix24] nombre de entidad cargado');
      }
      const guardar = page.getByRole('button', { name: /Guardar|Crear|Save|Continuar/i }).first();
      if (await guardar.isVisible().catch(() => false)) {
        await guardar.click();
        await page.waitForTimeout(10_000);
      }
      await page.screenshot({ path: 'evidencia/poliza-bitrix24-2c-resultado.png', fullPage: true });

      // Ahora sí: ¿quedó creada o apareció bloqueo?
      await page.goto('/crm/type/', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(8000);
      const lista = await page.locator('body').innerText().catch(() => '');
      console.log('[Bitrix24] ¿la entidad Poliza aparece en el listado?:', /Poliza/i.test(lista) ? 'SÍ' : 'NO');
      await page.screenshot({ path: 'evidencia/poliza-bitrix24-2d-listado-final.png', fullPage: true });
    }
  } else {
    console.log('[Bitrix24] no encontré botón de crear en /crm/type/');
  }

  // Campos personalizados del CRM
  await page.goto('/crm/configs/fields/', { waitUntil: 'domcontentloaded' }).catch(() => {});
  await page.waitForTimeout(8000);
  await page.screenshot({ path: 'evidencia/poliza-bitrix24-3-campos.png', fullPage: true });
  const t2 = await page.locator('body').innerText().catch(() => '');
  const pay2 = t2.split('\n').map(l => l.trim()).filter(l => /mejore su plan|suscripci|disponible en/i.test(l));
  console.log('[Bitrix24] ¿paywall en campos personalizados?:', pay2.length ? pay2.slice(0, 3).join(' | ') : 'NO aparece');
});
