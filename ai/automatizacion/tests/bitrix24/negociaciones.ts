import { Page } from '@playwright/test';
import { menuLateral, pestana, panel, panelListo, cerrarPaneles } from './navegar';
import { rest, camposDeNegociacion, altaDeNegociacion, escribirEn, guardarFormulario } from './ui';

/**
 * La cartera de pólizas de la edición gratuita de Bitrix24: la póliza se lleva
 * como una negociación con campos propios. Acá están las pantallas del listado
 * —filtro, columnas, orden, acciones sobre la selección— que usan los criterios
 * de los grupos A.1 y A.2.
 */

/** Fecha de hoy más `dias`, como se escribe en el portal: DD/MM/AAAA. */
export function enDias(dias: number) {
  const d = new Date(Date.now() + dias * 86_400_000);
  const dos = (n: number) => String(n).padStart(2, '0');
  return `${dos(d.getDate())}/${dos(d.getMonth() + 1)}/${d.getFullYear()}`;
}

/** Fecha de hoy más `dias`, como la devuelve la interfaz de programación: AAAA-MM-DD. */
export const isoEnDias = (dias: number) => new Date(Date.now() + dias * 86_400_000).toLocaleDateString('sv-SE');

/** Vuelve a crear los campos propios que falten y deja cerrado el formulario de alta. */
export async function asegurarCampos(page: Page, campos: { tipo: string; nombre: string; valores?: string[] }[]) {
  const hay = (await camposDeNegociacion(page)).map(c => c.etiqueta);
  const faltan = campos.filter(c => !hay.includes(c.nombre));
  if (!faltan.length) return;
  await altaDeNegociacion(page);
  for (const c of faltan) await crearCampoPropio(page, c.tipo, c.nombre, c.valores ?? []);
  await cerrarPaneles(page);
}

/** El listado de negociaciones, en la vista de lista. */
export async function abrirListado(page: Page) {
  await menuLateral(page, 'CRM');
  // La vista de lista es la que el portal recuerda; solo si abrió otra se cambia con su pestaña
  if (!(await page.locator('.main-grid-table').first().isVisible().catch(() => false))) {
    await page.locator('.ui-nav-panel__item-title').filter({ hasText: /^Lista$/ }).first().click({ force: true });
    await page.waitForTimeout(3500);
  }
}

/** Los títulos de las negociaciones que muestra el listado, en el orden en que aparecen. */
export async function filasDelListado(page: Page, patron = /^(POL|OPO)-/): Promise<string[]> {
  await page.waitForTimeout(1500);
  const ts = await page.locator('tr.main-grid-row-body').locator('a').allTextContents();
  return ts.map(t => t.trim()).filter(t => patron.test(t));
}

// ── Filtro ───────────────────────────────────────────────────────────────────

export async function abrirFiltro(page: Page) {
  const panelDelFiltro = page.getByText('Agregar campo', { exact: true }).filter({ visible: true }).first();
  if (await panelDelFiltro.isVisible().catch(() => false)) return;
  await page.locator('.main-ui-filter-search').first().click();
  await panelDelFiltro.waitFor({ state: 'visible', timeout: 15_000 });
  await page.waitForTimeout(800);
}

/** Cierra el panel del filtro sin tocar lo elegido. */
export async function cerrarFiltro(page: Page) {
  await page.mouse.click(700, 100);
  await page.waitForTimeout(800);
}

/** Muestra en el panel del filtro los campos que todavía no están: «Agregar campo», tildarlos y «Aplicar». */
export async function agregarCamposAlFiltro(page: Page, etiquetas: string[]) {
  await abrirFiltro(page);
  const ya = await page.locator('.main-ui-filter-wield-with-label .main-ui-control-field-label').allTextContents();
  const faltan = etiquetas.filter(e => !ya.map(t => t.trim()).includes(e));
  if (!faltan.length) return;
  await page.getByText('Agregar campo', { exact: true }).filter({ visible: true }).first().click();
  await page.waitForTimeout(1500);
  for (const e of faltan) {
    await page.locator('label').filter({ hasText: new RegExp(`^${e}$`) }).filter({ visible: true }).first().click();
  }
  await page.getByText('Aplicar', { exact: true }).filter({ visible: true }).first().click();
  await page.waitForTimeout(2500);
}

const campoDelFiltro = (page: Page, etiqueta: string) =>
  page.locator('.main-ui-filter-wield-with-label').filter({ has: page.locator('.main-ui-control-field-label', { hasText: new RegExp(`^${etiqueta}$`) }) }).first();

/** Elige valores en un campo de lista del filtro. */
export async function filtrarLista(page: Page, etiqueta: string, ...valores: string[]) {
  await agregarCamposAlFiltro(page, [etiqueta]);
  const campo = campoDelFiltro(page, etiqueta);
  for (const v of valores) {
    await campo.locator('.main-ui-control').first().click();
    await page.waitForTimeout(1000);
    await page.locator('.main-ui-select-inner-item, .main-ui-popup-item').filter({ hasText: new RegExp(`^\\s*${v}\\s*$`) })
      .filter({ visible: true }).first().click();
    await page.waitForTimeout(800);
  }
}

/** Elige una persona en «Persona responsable»: se escribe el nombre y se toma la sugerencia. */
export async function filtrarResponsable(page: Page, nombre: string) {
  await abrirFiltro(page);
  const entrada = campoDelFiltro(page, 'Persona responsable').locator('input[name="ASSIGNED_BY_ID_label"]');
  await entrada.click();
  await entrada.pressSequentially(nombre.split(' ')[0], { delay: 90 });
  await page.waitForTimeout(2500);
  await page.locator('.ui-selector-item-title, .ui-tag-selector-item, .main-ui-popup-item').filter({ hasText: nombre })
    .filter({ visible: true }).first().click();
  await page.waitForTimeout(1000);
}

/** Aplica lo elegido con el botón «Buscar» del filtro y espera el listado. */
export async function buscarConFiltro(page: Page) {
  await abrirFiltro(page);
  await page.locator('button.main-ui-filter-find').filter({ visible: true }).first().click();
  await page.waitForTimeout(4000);
}

/** Deja el filtro sin condiciones propias: «Reiniciar». */
export async function reiniciarFiltro(page: Page) {
  await abrirFiltro(page);
  await page.locator('button.main-ui-filter-reset').filter({ visible: true }).first().click();
  await page.waitForTimeout(3000);
}

// ── Columnas y orden ─────────────────────────────────────────────────────────

/**
 * Deja a la vista columnas del listado. Los campos propios ya vienen como columnas; si alguna no está,
 * se tilda en la configuración de la vista, desde el engranaje de la tabla.
 */
export async function mostrarColumnas(page: Page, etiquetas: string[]) {
  const enTabla = async (e: string) => (await page.locator('.main-grid-head-title').filter({ hasText: new RegExp(`^\\s*${e}\\s*$`) }).count()) > 0;
  const faltan: string[] = [];
  for (const e of etiquetas) if (!(await enTabla(e))) faltan.push(e);
  if (!faltan.length) return;
  await page.locator('.main-grid-interface-settings-icon').first().click();
  await page.waitForTimeout(1500);
  for (const e of faltan) {
    await page.getByText(e, { exact: true }).filter({ visible: true }).first().click();
  }
  await page.getByText('Aplicar', { exact: true }).filter({ visible: true }).first().click();
  await page.waitForTimeout(3500);
}

/** Ordena el listado con un clic en el encabezado de la columna. */
export async function ordenarPor(page: Page, columna: string) {
  await page.locator('.main-grid-cell-head').filter({ hasText: new RegExp(`^\\s*${columna}\\s*$`) }).first().click();
  await page.waitForTimeout(4000);
}

/** Abre la ficha de una negociación desde el listado, con un clic en su título. */
export async function abrirFicha(page: Page, titulo: string) {
  await page.locator('a').filter({ hasText: new RegExp(`^${titulo}$`) }).filter({ visible: true }).first().click();
  // La ficha abierta muestra la barra de etapas de la negociación
  await panelListo(page, panel(page).locator('.crm-entity-section-status-step, .crm-entity-widget-progress-step').first());
}

export { escribirEn, guardarFormulario, rest };

// ── Fechas, cartera y personas ───────────────────────────────────────────────

/** Escribe una fecha (DD/MM/AAAA) en un campo de fecha del formulario abierto y sale del campo. */
export async function escribirFecha(page: Page, etiqueta: string, fecha: string) {
  const f = panel(page);
  const titulo = f.locator('.ui-entity-editor-block-title-text').filter({ hasText: new RegExp(`^${etiqueta}$`) }).first();
  const entrada = titulo.locator('xpath=following::input[not(@type="hidden")][1]');
  await entrada.click();
  await entrada.pressSequentially(fecha, { delay: 90 });
  // Un clic en el título cierra el calendario y confirma lo escrito
  await titulo.click();
  await page.waitForTimeout(600);
}

/** Las personas del portal que pueden ser responsables, con su nombre como se ve en pantalla. */
export async function personas(page: Page) {
  const usuarios = await rest<any[]>(page, 'user.get', { FILTER: { ACTIVE: true } });
  return usuarios.map(u => ({ id: String(u.ID), nombre: `${u.NAME} ${u.LAST_NAME}`.trim() }));
}

/** El valor de un campo de lista, por su etiqueta. */
export const idDeOpcion = (campo: any, texto: string) => String(campo.LIST.find((l: any) => l.VALUE === texto)?.ID);

/** Vuelve a dejar el filtro con sus campos de fábrica, para no cambiarle la pantalla a quien use la cuenta. */
export async function restaurarFiltro(page: Page) {
  await abrirFiltro(page);
  await page.getByText('Restaurar campos predeterminados', { exact: true }).filter({ visible: true }).first().click();
  await page.waitForTimeout(2500);
  await cerrarFiltro(page);
}

/** Condición sobre un campo de fecha del filtro: «Próximos N días», por ejemplo. */
export async function filtrarFecha(page: Page, etiqueta: string, opcion: string | RegExp, dias?: string) {
  await agregarCamposAlFiltro(page, [etiqueta]);
  const campo = campoDelFiltro(page, etiqueta);
  await campo.locator('.main-ui-control').first().click();
  await page.waitForTimeout(1000);
  const texto = typeof opcion === 'string' ? new RegExp(`^\s*${opcion}\s*$`) : opcion;
  await page.locator('.main-ui-select-inner-item, .main-ui-popup-item').filter({ hasText: texto }).filter({ visible: true }).first().click();
  await page.waitForTimeout(1000);
  if (dias) {
    const n = campo.locator('input.main-ui-number-input').filter({ visible: true }).first();
    await n.click();
    await n.pressSequentially(dias, { delay: 90 });
    await page.waitForTimeout(600);
  }
}

/** Tilda todas las filas del listado y deja a la vista las acciones sobre la selección. */
export async function seleccionarTodas(page: Page) {
  await page.locator('.main-grid-check-all').first().click();
  await page.waitForTimeout(1500);
}

/** Elige una acción del desplegable «Seleccione la acción» que aparece con la selección. */
export async function elegirAccion(page: Page, accion: string) {
  await page.locator('.main-dropdown').filter({ visible: true }).last().click();
  await page.waitForTimeout(1000);
  await page.getByText(accion, { exact: true }).filter({ visible: true }).first().click();
  await page.waitForTimeout(1500);
}

/**
 * Como `crearCampo` de `ui.ts`, pero el botón «Guardar» del editor del campo puede ser un
 * `span` o un `button` según el tipo: se busca por su clase, sea cual sea la etiqueta.
 */
export async function crearCampoPropio(page: Page, tipo: string, nombre: string, valores: string[] = []) {
  const f = panel(page);
  await f.getByText('Crear campo', { exact: true }).first().click();
  await page.waitForTimeout(1500);
  await f.getByText(tipo, { exact: true }).first().click();
  await page.waitForTimeout(1500);
  const campoNombre = f.getByText('Nombre del campo', { exact: true }).last().locator('xpath=following::input[1]');
  await campoNombre.fill(nombre);
  const items = () => f.locator('input[placeholder="Nuevo artículo"]');
  for (const [i, v] of valores.entries()) {
    if (i > 0) {
      // El «Agregar» de la lista es el que sigue a su último valor; el formulario tiene otros, como el del teléfono
      await items().last().locator('xpath=following::*[normalize-space(text())="Agregar"][1]').click();
      await page.waitForTimeout(500);
    }
    await items().nth(i).fill(v);
  }
  await f.locator('.ui-btn-primary').filter({ hasText: /^Guardar$/ }).filter({ visible: true }).first().click();
  await f.getByText(nombre, { exact: true }).first().waitFor({ state: 'visible', timeout: 20_000 });
  await page.waitForTimeout(1500);
}

/**
 * En la regla abierta, ajusta «Hora» para que corra N días antes de la fecha de un campo
 * de la negociación: la tercera opción del selector de tiempo.
 */
export async function correrAntesDe(page: Page, dias: string, campo: string) {
  const f = panel(page);
  // El valor de «Hora» de la regla abierta, no el de las tarjetas del tablero que tiene detrás
  await f.getByText('Hora', { exact: true }).last().locator('xpath=following::*[normalize-space(text())][1]').click();
  await page.waitForTimeout(1500);
  // La tercera opción del selector es «N días antes de un campo»
  await f.locator('input[type="radio"]').nth(2).click({ force: true });
  const n = f.locator('input[type="radio"]').nth(2).locator('xpath=following::input[not(@type="radio") and not(@type="hidden")][1]');
  await n.click();
  await n.press('Control+a');
  await n.pressSequentially(dias, { delay: 90 });
  // En la fila, el enlace que sigue al número es el campo de la fecha
  await n.locator('xpath=following::span[contains(@class,"bizproc-automation-popup-settings-link")][1]').click();
  await page.waitForTimeout(1200);
  // El campo se elige en el menú que abre ese enlace, no en los que ya muestran las demás opciones
  await f.locator('.menu-popup-item-text').filter({ hasText: new RegExp('^' + campo + '$') }).filter({ visible: true }).first().click();
  await page.waitForTimeout(800);
  await f.getByText('OK', { exact: true }).last().click();
  await page.waitForTimeout(1200);
  // Al aceptar, el resumen de «Hora» tiene que decir lo que se pidió
  const resumen = await f.getByText('Hora', { exact: true }).last().locator('xpath=following::*[normalize-space(text())][1]').innerText();
  if (!resumen.includes('antes de') || !resumen.includes(campo)) throw new Error('La hora quedó como «' + resumen + '»');
}

// ── Contactos (solicitantes y asegurados) ───────────────────────────────────

/** Los campos propios del contacto, con su etiqueta en el idioma del portal. */
export async function camposDeContacto(page: Page): Promise<any[]> {
  const lista = await rest<any[]>(page, 'crm.contact.userfield.list', { order: { SORT: 'ASC' } });
  const completos = [];
  for (const c of lista) completos.push(await rest(page, 'crm.contact.userfield.get', { id: c.ID }));
  return completos.map(c => {
    const e = c.EDIT_FORM_LABEL;
    return { ...c, etiqueta: typeof e === 'string' ? e : (e?.la ?? e?.es ?? e?.en ?? '') };
  });
}

export const campoDeContacto = async (page: Page, etiqueta: string) => (await camposDeContacto(page)).find(c => c.etiqueta === etiqueta);

export async function quitarCampoDeContacto(page: Page, etiqueta: string) {
  for (const c of (await camposDeContacto(page)).filter(c => c.etiqueta === etiqueta)) {
    await rest(page, 'crm.contact.userfield.delete', { id: c.ID });
  }
}

/** Los contactos de esta prueba: su apellido empieza con «OPO-». */
export async function contactosDePrueba(page: Page, campos: string[] = ['*', 'PHONE', 'EMAIL', 'UF_*']): Promise<any[]> {
  return rest<any[]>(page, 'crm.contact.list', { filter: { '%LAST_NAME': 'OPO-' }, select: campos, order: { ID: 'ASC' } });
}

/** Borra los contactos de esta prueba con sus negociaciones. */
export async function borrarContactosDePrueba(page: Page, apellidos = /./) {
  for (const c of (await contactosDePrueba(page, ['ID', 'LAST_NAME'])).filter(c => apellidos.test(c.LAST_NAME))) {
    for (const d of await rest<any[]>(page, 'crm.deal.list', { filter: { CONTACT_ID: c.ID }, select: ['ID'] })) {
      await rest(page, 'crm.deal.delete', { id: d.ID });
    }
    await rest(page, 'crm.contact.delete', { id: c.ID });
  }
}

/** El formulario de alta de un contacto: «Clientes › Contactos › Crear». */
export async function altaDeContacto(page: Page) {
  await menuLateral(page, 'CRM');
  await pestana(page, 'Clientes', 'Contactos');
  await page.locator('.ui-btn-main, a, button').filter({ hasText: /^\s*Crear\s*$/ }).filter({ visible: true }).first().click();
  await panelListo(page, panel(page).getByText('Apellido', { exact: true }).first());
}

/** Crea un contacto de prueba por la interfaz de programación —armar el escenario no es lo que se mide—. */
export async function contactoDePrueba(page: Page, apellido: string, nombre: string, extra: object = {}) {
  const previo = (await contactosDePrueba(page, ['ID', 'LAST_NAME'])).find(c => c.LAST_NAME === apellido);
  if (previo) return String(previo.ID);
  return String(await rest(page, 'crm.contact.add', { fields: { LAST_NAME: apellido, NAME: nombre, ...extra } }));
}

/** El listado de contactos: «Clientes › Contactos». */
export async function abrirContactos(page: Page) {
  await menuLateral(page, 'CRM');
  await pestana(page, 'Clientes', 'Contactos');
  await page.waitForTimeout(2500);
}

/** Abre la ficha de un contacto desde el listado, con un clic en su nombre. */
export async function abrirContacto(page: Page, apellido: RegExp) {
  await page.locator('a').filter({ hasText: apellido }).filter({ visible: true }).first().click();
  await panelListo(page, panel(page).getByText('Negociaciones', { exact: true }).first());
}

/** Elige un valor en un campo de lista del formulario de un contacto (el control sigue al título del campo). */
export async function elegirEnListaDeContacto(page: Page, etiqueta: string, valor: string) {
  const f = panel(page);
  const titulo = f.locator('label.ui-entity-editor-block-title-text').filter({ hasText: new RegExp('^' + etiqueta + '$') }).first();
  await titulo.locator('xpath=following::div[contains(@class,"main-ui-select")][1]').click();
  await page.waitForTimeout(800);
  await f.locator('.main-ui-select-inner-item').filter({ hasText: new RegExp('^\\s*' + valor + '\\s*$') }).filter({ visible: true }).first().click();
  await page.waitForTimeout(600);
}

/**
 * Como `agregarRegla` de `negociaciones-a8.ts`, pero pensada para agregar varias reglas seguidas:
 * con una ya en el tablero, el nombre de la regla también aparece en su tarjeta, y la del catálogo
 * es la última.
 */
export async function agregarOtraRegla(page: Page, etapa: string, grupo: string, regla: string) {
  const f = panel(page);
  const etapas = ['En desarrollo', 'Crear documentos', 'Factura', 'En progreso', 'Factura final', 'Cerrado Ganado', 'Cerrado Perdido', 'Analizar la falla'];
  await f.locator('span.bizproc-automation-robot-btn-add').nth(etapas.indexOf(etapa)).click();
  await page.waitForTimeout(3000);
  const g = f.getByText(grupo, { exact: true }).last();
  await g.scrollIntoViewIfNeeded();
  await g.click();
  await page.waitForTimeout(2000);
  await f.getByText(regla, { exact: true }).last().locator('xpath=following::*[normalize-space(text())="Agregar"][1]').click();
  await f.locator('.bizproc-automation-popup-settings, .bizproc-automation-popup-settings-title').first()
    .waitFor({ state: 'visible', timeout: 20_000 }).catch(() => {});
  await page.waitForTimeout(3000);
}

/**
 * Deja la regla abierta para que corra apenas la negociación llega a la etapa. El momento que
 * propone el sistema depende de la última regla agregada: si ya es «Inmediatamente», no se toca.
 */
export async function correrAlInstante(page: Page) {
  const f = panel(page);
  const hora = f.getByText('Hora', { exact: true }).last().locator('xpath=following::*[normalize-space(text())][1]');
  if (/inmediatamente/i.test(await hora.innerText())) return;
  await hora.click();
  await page.waitForTimeout(1500);
  await f.getByText('Tiempo actual', { exact: true }).first().click();
  await page.waitForTimeout(500);
  await f.getByText('OK', { exact: true }).last().click();
  await page.waitForTimeout(1200);
}

/** Escribe en el cuadro de búsqueda del listado y confirma: deja solo lo que coincide. */
export async function buscarEnElListado(page: Page, texto: string) {
  const caja = page.locator('.main-ui-filter-search input[type="text"]').first();
  await caja.click();
  await caja.pressSequentially(texto, { delay: 90 });
  await caja.press('Enter');
  await page.waitForTimeout(4000);
}
