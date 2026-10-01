import { Page } from '@playwright/test';
import { administracion } from './espocrm/navegar';

/**
 * El editor de fórmulas de EspoCRM.
 *
 * Cada entidad tiene dos guiones, cada uno en su propia página de la
 * administración:
 *
 *   - antes de guardar: corre en cada guardado; según la propia pantalla,
 *     "se utiliza para configurar campos calculados";
 *   - antes de guardar por la interfaz de programación: corre en las altas y
 *     cambios que llegan por la API —la pantalla del producto también pasa por
 *     ahí—; "se utiliza para validación personalizada y comprobación de
 *     duplicados".
 */
export type Guion = 'beforeSaveCustomScript' | 'beforeSaveApiScript';

/**
 * Reemplaza el guion de una entidad en su editor: Administración › Entidades
 * › la entidad › Fórmula › el guion, y se lo tipea.
 *
 * El editor completa paréntesis y comillas, sangra y sugiere funciones
 * mientras se escribe: tecla por tecla el guion quedaría mal formado. Antes de
 * tipear se apagan esas ayudas del editor, como las apaga quien las conoce.
 */
export async function escribirGuion(page: Page, entidad: string, guion: Guion, texto: string) {
  await administracion(page, '#Admin/entityManager', `#Admin/entityManager/scope=${entidad}`,
    page.locator('#main [data-action="editFormula"]').first());
  // Si la pantalla anterior dejó un formulario abierto, el sistema pregunta si salir
  const salir = page.getByRole('button', { name: /^S[ií]$/ }).first();
  if (await salir.waitFor({ state: 'visible', timeout: 3000 }).then(() => true, () => false)) await salir.click();
  await page.locator(`.modal-dialog:visible a[href="#Admin/entityManager/formula&scope=${entidad}&type=${guion}"]`).first().click();
  const editor = page.locator('#main .ace_editor').first();
  if (!(await editor.waitFor({ state: 'visible', timeout: 20_000 }).then(() => true, () => false))) {
    await page.reload({ waitUntil: 'domcontentloaded' });
    await editor.waitFor({ state: 'visible', timeout: 40_000 });
  }
  await page.waitForTimeout(1500);
  await editor.evaluate(el => (window as any).ace.edit(el).setOptions({
    behavioursEnabled: false, enableAutoIndent: false, enableBasicAutocompletion: false, enableLiveAutocompletion: false,
  }));
  await editor.click();
  await page.keyboard.press('Control+a');
  await page.keyboard.press('Delete');
  const lineas = texto.split('\n');
  for (const [i, linea] of lineas.entries()) {
    if (linea) await page.keyboard.type(linea);
    if (i < lineas.length - 1) await page.keyboard.press('Enter');
  }
  await page.waitForTimeout(800);
  const escrito = await editor.evaluate(el => (window as any).ace.edit(el).getValue());
  if (escrito !== texto) throw new Error(`El editor de fórmulas no quedó con el guion indicado: «${escrito}»`);
}

/** Guarda el guion abierto. */
export async function guardarGuion(page: Page) {
  await page.locator('#main').getByRole('button', { name: /^Guardar$|^Save$/ }).first().click();
  await page.waitForTimeout(4000);
}
