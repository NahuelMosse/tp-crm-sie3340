import { Page } from '@playwright/test';
import { panel, panelListo, pestana, menuLateral, cerrarPaneles, asentar } from './navegar';

export const BASE = 'https://b24-orshha.bitrix24.es';

/** El texto visible de la página y del panel abierto, para comprobar lo que el usuario ve. */
export async function textoDe(page: Page) {
  // Los paneles y los avisos del sistema se dibujan en marcos propios: se lee cada uno
  const textos = await Promise.all(page.frames().map(f => f.locator('body').innerText({ timeout: 5000 }).catch(() => '')));
  return textos.join('\n');
}

// ── Interfaz de programación ────────────────────────────────────────────────

/**
 * Un método de la interfaz de programación de Bitrix24, llamado con la sesión
 * del navegador —la misma cuenta que opera la pantalla—. Solo prepara
 * escenarios y lee resultados: ningún veredicto sale de acá.
 */
export async function rest<T = any>(page: Page, metodo: string, parametros: object = {}): Promise<T> {
  const r = await page.evaluate(([m, p]) => new Promise<any>(res => {
    const BX = (window as any).BX;
    if (!BX?.rest?.callMethod) return res({ error: 'La página no ofrece la interfaz de programación' });
    BX.rest.callMethod(m, p).then((x: any) => res({ ok: x.data(), total: x.total?.() }),
      (e: any) => res({ error: String(e?.answer?.error_description ?? e?.answer?.error ?? e) }));
  }), [metodo, parametros] as const);
  if (r.error) throw new Error(`${metodo}: ${r.error}`);
  return r.ok;
}

/** Los procesos inteligentes del portal —las entidades propias—. */
export const procesos = async (page: Page) => (await rest(page, 'crm.type.list')).types as any[];

/** Un proceso inteligente por su nombre. */
export const proceso = async (page: Page, titulo: string) => (await procesos(page)).find(t => t.title === titulo);

/** Da de baja un proceso inteligente con sus registros, para volver a crearlo por pantalla. */
export async function borrarProceso(page: Page, titulo: string) {
  const t = await proceso(page, titulo);
  if (!t) return;
  for (;;) {
    const { items } = await rest(page, 'crm.item.list', { entityTypeId: t.entityTypeId, select: ['id'] });
    if (!items.length) break;
    for (const i of items) await rest(page, 'crm.item.delete', { entityTypeId: t.entityTypeId, id: i.id });
  }
  await rest(page, 'crm.type.delete', { id: t.id });
}

/** Los registros de un proceso inteligente. */
export async function registros(page: Page, entityTypeId: number, filtro: object = {}) {
  return (await rest(page, 'crm.item.list', { entityTypeId, filter: filtro })).items as any[];
}

// ── Campos propios y negociaciones ──────────────────────────────────────────
// En la edición gratuita no hay entidades propias: la póliza se lleva como una
// negociación del CRM, con sus campos propios.

/** La etiqueta de un campo propio en el idioma del portal. */
const etiquetaDe = (c: any): string => {
  const e = c.EDIT_FORM_LABEL;
  return typeof e === 'string' ? e : (e?.la ?? e?.es ?? e?.en ?? '');
};

/** Los campos propios de la negociación, con su etiqueta. */
export async function camposDeNegociacion(page: Page): Promise<any[]> {
  const lista = await rest<any[]>(page, 'crm.deal.userfield.list', { order: { SORT: 'ASC' } });
  const completos = [];
  for (const c of lista) completos.push(await rest(page, 'crm.deal.userfield.get', { id: c.ID }));
  return completos.map(c => ({ ...c, etiqueta: etiquetaDe(c) }));
}

/** Un campo propio de la negociación por su etiqueta. */
export const campoDeNegociacion = async (page: Page, etiqueta: string) =>
  (await camposDeNegociacion(page)).find(c => c.etiqueta === etiqueta);

/** Quita un campo propio de una corrida anterior, para volver a crearlo por pantalla. */
export async function quitarCampo(page: Page, etiqueta: string) {
  for (const c of (await camposDeNegociacion(page)).filter(c => c.etiqueta === etiqueta)) {
    await rest(page, 'crm.deal.userfield.delete', { id: c.ID });
  }
}

/** Las negociaciones cuyo nombre cumple el patrón. */
export async function negociaciones(page: Page, patron: RegExp, campos: string[] = ['*', 'UF_*']): Promise<any[]> {
  const todas: any[] = [];
  for (let desde = 0; ; desde += 50) {
    const r = await page.evaluate(([s, d]) => new Promise<any>(res => (window as any).BX.rest.callMethod('crm.deal.list',
      { select: s, order: { ID: 'ASC' }, start: d }).then((x: any) => res({ items: x.data(), mas: x.more() }), (e: any) => res({ error: String(e) }))),
      [campos, desde] as const);
    if (r.error) throw new Error(`crm.deal.list: ${r.error}`);
    todas.push(...r.items);
    if (!r.mas) break;
  }
  return todas.filter(n => patron.test(n.TITLE ?? ''));
}

/** Borra las negociaciones de una corrida anterior. */
export async function borrarNegociaciones(page: Page, patron: RegExp) {
  for (const n of await negociaciones(page, patron, ['ID', 'TITLE'])) await rest(page, 'crm.deal.delete', { id: n.ID });
}

/** El formulario de alta de una negociación, desde el botón «Crear» del listado. */
export async function altaDeNegociacion(page: Page) {
  await menuLateral(page, 'CRM');
  await page.locator('.ui-btn-main, a, button').filter({ hasText: /^\s*Crear\s*$/ }).filter({ visible: true }).first().click();
  await panelListo(page, panel(page).locator('input[name="TITLE"]'));
}

/**
 * Agrega un campo propio desde el formulario abierto: «Crear campo», el tipo,
 * su nombre y, si es una lista, sus valores.
 */
export async function crearCampo(page: Page, tipo: string, nombre: string, valores: string[] = []) {
  const f = panel(page);
  await f.getByText('Crear campo', { exact: true }).first().click();
  await page.waitForTimeout(1500);
  await f.getByText(tipo, { exact: true }).first().click();
  await page.waitForTimeout(1500);
  // El editor del campo nuevo aparece en el formulario, con su nombre de ejemplo
  const campoNombre = f.getByText('Nombre del campo', { exact: true }).last().locator('xpath=following::input[1]');
  await campoNombre.fill(nombre);
  const items = () => f.locator('input[placeholder="Nuevo artículo"]');
  for (const [i, v] of valores.entries()) {
    if (i > 0) {
      await f.getByText('Agregar', { exact: true }).filter({ visible: true }).first().click();
      await page.waitForTimeout(500);
    }
    await items().nth(i).fill(v);
  }
  await f.locator('span.ui-btn-primary').filter({ hasText: /^Guardar$/ }).filter({ visible: true }).first().click();
  await f.getByText(nombre, { exact: true }).first().waitFor({ state: 'visible', timeout: 20_000 });
  await page.waitForTimeout(1500);
}

/** Elige un valor en un campo de lista del formulario abierto. */
export async function elegirEnLista(page: Page, etiqueta: string, valor: string) {
  const f = panel(page);
  // El control va a continuación del título del campo
  const titulo = f.locator('label.ui-entity-editor-block-title-text').filter({ hasText: new RegExp(`^${etiqueta}$`) }).first();
  const control = titulo.locator('xpath=following::div[contains(@class,"main-ui-select")][1]');
  await control.click();
  await page.waitForTimeout(800);
  await f.locator('.main-ui-select-inner-item').filter({ hasText: new RegExp(`^\\s*${valor}\\s*$`) }).filter({ visible: true }).first().click();
  await page.waitForTimeout(600);
}

/** Escribe en un campo del formulario abierto, por su etiqueta. */
export async function escribirEn(page: Page, etiqueta: string, valor: string) {
  const f = panel(page);
  const titulo = f.locator('.ui-entity-editor-block-title-text').filter({ hasText: new RegExp(`^${etiqueta}$`) }).first();
  const entrada = titulo.locator('xpath=following::input[not(@type="hidden")][1]');
  await entrada.click();
  await entrada.fill(valor);
}

/** Guarda el formulario abierto con el botón de abajo y espera que se cierre la edición. */
export async function guardarFormulario(page: Page) {
  const f = panel(page);
  await f.locator('button, .ui-btn').filter({ hasText: /^\s*GUARDAR\s*$/i }).filter({ visible: true }).last().click();
  await page.waitForTimeout(5000);
  await descartarAvisos(page);
}

/**
 * Descarta lo que el sistema abre por su cuenta después de guardar: la
 * pregunta por el siguiente paso de la negociación y los globos de novedades.
 */
export async function descartarAvisos(page: Page) {
  const f = panel(page);
  // La pregunta llega un momento después de guardar, en el panel o sobre la página
  const siguiente = f.getByText('Siguiente paso en esta negociación', { exact: true }).first();
  if (await siguiente.waitFor({ state: 'visible', timeout: 6000 }).then(() => true, () => false)) {
    await siguiente.locator('xpath=ancestor::div[contains(@class,"popup-window")][1]')
      .getByText(/^\s*cancelar\s*$/i).first().click();
    await page.waitForTimeout(800);
  }
  for (const marco of [f, page]) {
    const cruz = marco.locator('.popup-window-close-icon, .ui-tour-popup-close').filter({ visible: true });
    for (let i = 0; i < 3 && await cruz.first().isVisible().catch(() => false); i++) {
      await cruz.first().click();
      await page.waitForTimeout(600);
    }
  }
}

/** Una sección de la configuración del CRM: «Más» › Configuraciones › Configuración CRM › la sección. */
export async function configuracionCrm(page: Page, seccion: string) {
  await menuLateral(page, 'CRM');
  await pestana(page, 'Configuraciones', 'Configuración CRM');
  await page.getByText(seccion, { exact: true }).filter({ visible: true }).first().click();
  await page.waitForTimeout(5000);
}

// ── Pantallas ────────────────────────────────────────────────────────────────

/** El listado de un proceso inteligente, desde la barra del CRM. */
export async function listadoDeProceso(page: Page, titulo: string) {
  await menuLateral(page, 'CRM');
  await pestana(page, titulo);
}

/** Espera a que el panel deslizante termine de cargar y devuelve su marco. */
export async function enPanel(page: Page, visible: string | RegExp) {
  await panelListo(page, visible);
  return panel(page);
}

export { cerrarPaneles, asentar };
