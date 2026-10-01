import { Page } from '@playwright/test';
import { menuLateral, panel, panelListo, cerrarPaneles } from './navegar';
import { rest } from './ui';

/**
 * Reglas de automatización de las negociaciones (robots), recorridas con el ratón.
 * Las etapas del pipeline general, de izquierda a derecha.
 */
export const ETAPAS = ['En desarrollo', 'Crear documentos', 'Factura', 'En progreso', 'Factura final', 'Cerrado Ganado', 'Cerrado Perdido', 'Analizar la falla'];

/** CRM › Negociaciones › «Reglas de automatización», con el globo de novedades cerrado. */
export async function abrirReglas(page: Page) {
  await menuLateral(page, 'CRM');
  await page.waitForTimeout(3000);
  await page.getByText('Reglas de automatización', { exact: true }).filter({ visible: true }).first().click();
  await panelListo(page, 'Reglas de automatización y disparadores');
  await page.waitForTimeout(4000);
  const cruz = panel(page).locator('.popup-window-close-icon, .ui-tour-popup-close').filter({ visible: true });
  for (let i = 0; i < 3 && await cruz.first().isVisible().catch(() => false); i++) {
    await cruz.first().click();
    await page.waitForTimeout(800);
  }
}

/** Agrega una regla a una etapa: el «+» de la etapa, el grupo y «Agregar» en la regla. */
export async function agregarRegla(page: Page, etapa: string, grupo: string, regla: string) {
  const f = panel(page);
  await f.locator('span.bizproc-automation-robot-btn-add').nth(ETAPAS.indexOf(etapa)).click();
  await page.waitForTimeout(3000);
  const g = f.getByText(grupo, { exact: true }).first();
  await g.scrollIntoViewIfNeeded();
  await g.click();
  await page.waitForTimeout(2000);
  await f.getByText(regla, { exact: true }).locator('xpath=following::*[normalize-space(text())="Agregar"][1]').click();
  await f.locator('.bizproc-automation-popup-settings, .bizproc-automation-popup-settings-title').first()
    .waitFor({ state: 'visible', timeout: 20_000 }).catch(() => {});
  await page.waitForTimeout(3000);
}

/** La regla se ejecuta apenas la negociación llega a la etapa: «Hora › Tiempo actual». */
export async function ejecutarAlInstante(page: Page) {
  const f = panel(page);
  await f.getByText(/^En \d+ días?$|^inmediatamente$/).last().click();
  await page.waitForTimeout(1500);
  await f.getByText('Tiempo actual', { exact: true }).first().click();
  await page.waitForTimeout(500);
  await f.getByText('OK', { exact: true }).last().click();
  await page.waitForTimeout(1200);
}

/** Guarda la regla abierta y después el conjunto de reglas de abajo. */
export async function guardarRegla(page: Page) {
  const f = panel(page);
  await f.getByText(/^guardar$/i).last().click();
  await page.waitForTimeout(2500);
  await f.getByText(/^guardar$/i).first().click();
  await page.waitForTimeout(6000);
}

/** El texto de la pantalla de reglas: lo que el usuario lee en ella. */
export const textoDeReglas = async (page: Page) => (await panel(page).locator('body').innerText()).replace(/\n+/g, ' | ');

/** Da de baja las reglas de una etapa cuyo texto coincide, con la cruz de cada tarjeta. */
export async function borrarReglasDe(page: Page, etapa: string, patron: RegExp) {
  const f = panel(page);
  const tarjetas = f.locator('.bizproc-automation-robot-container').filter({ hasText: patron });
  for (let i = 0; i < 6 && await tarjetas.count(); i++) {
    const t = tarjetas.first();
    await t.hover();
    await t.locator('.bizproc-automation-robot-btn-delete').first().click();
    await page.waitForTimeout(1200);
    await f.getByText(/^guardar$/i).first().click().catch(() => {});
    await page.waitForTimeout(4000);
  }
}

/** Comentarios de la línea de tiempo de una negociación. */
export async function comentariosDe(page: Page, id: string | number) {
  return (await rest<any[]>(page, 'crm.timeline.comment.list', { filter: { ENTITY_ID: id, ENTITY_TYPE: 'deal' } })).map(c => String(c.COMMENT));
}

export { cerrarPaneles };

/**
 * Cierra la pantalla de reglas con su cruz. Con reglas sin guardar el sistema
 * pregunta si se sale: se elige «Salir sin guardar».
 */
export async function cerrarReglas(page: Page) {
  const cruz = page.locator('button.side-panel-label.--close-label').filter({ visible: true });
  for (let i = 0; i < 6 && await cruz.count(); i++) {
    await cruz.last().click();
    for (const marco of [panel(page), page]) {
      const salir = marco.getByText(/^\s*salir sin guardar\s*$/i).first();
      if (await salir.waitFor({ state: 'visible', timeout: 2500 }).then(() => true, () => false)) {
        await salir.click();
        break;
      }
    }
    await page.waitForTimeout(1500);
  }
}
