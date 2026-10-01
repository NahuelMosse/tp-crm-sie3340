import { Page } from '@playwright/test';
import { menuLateral, pestana, panel, panelListo, cerrarPaneles } from './navegar';
import { rest, guardarFormulario, descartarAvisos } from './ui';

/** Va al listado de Contactos, desde CRM › Clientes › Contactos. */
export async function irAContactos(page: Page) {
  await menuLateral(page, 'CRM');
  await pestana(page, 'Clientes', 'Contactos');
}

/**
 * Ayudantes propios de A.3, A.5, A.6, A.7 y A.9 sobre Bitrix24: contactos,
 * tareas y actividades del CRM (llamadas, reuniones), y el productor con
 * cuenta propia (`escenario.ts`). No se tocan `navegar.ts` ni `ui.ts`,
 * compartidos con el resto de las pruebas.
 *
 * En la edición gratuita no hay entidades propias: el asegurado se lleva
 * como un contacto del CRM, y el reclamo, a falta de un proceso inteligente,
 * como una tarea vinculada a ese contacto.
 */

export const PREFIJO = 'ACT-';

// ── Contactos ────────────────────────────────────────────────────────────────

/** El formulario de alta de un contacto, desde el botón «Crear» del listado. */
export async function altaDeContacto(page: Page) {  for (let intento = 0; intento < 2; intento++) {    await irAContactos(page);    await page.locator('.ui-btn-main, a, button').filter({ hasText: /^s*Crears*$/ }).filter({ visible: true }).first().click();    if (await panelListo(page, panel(page).locator('input[name="NAME"]')).then(() => true, () => false)) return;    await cerrarPaneles(page);  }  throw new Error('El formulario de alta de contacto no se cargó');}

/** Completa nombre y apellido en el formulario de contacto abierto, y lo guarda. */
export async function llenarContacto(page: Page, nombre: string, apellido: string) {
  const f = panel(page);
  await f.locator('input[name="NAME"]').fill(nombre);
  await f.locator('input[name="LAST_NAME"]').fill(apellido);
}

export const guardarContacto = guardarFormulario;

/** Los contactos cuyo nombre o apellido cumple el patrón. */
export async function contactos(page: Page, patron: RegExp, campos: string[] = ['*', 'UF_*']): Promise<any[]> {
  const todos: any[] = [];
  for (let start = 0; ; start += 50) {
    const r = await page.evaluate(([s, d]) => new Promise<any>(res => (window as any).BX.rest.callMethod('crm.contact.list',
      { select: s, order: { ID: 'ASC' }, start: d }).then((x: any) => res({ items: x.data(), mas: x.more() }), (e: any) => res({ error: String(e) }))),
      [campos, start] as const);
    if (r.error) throw new Error(`crm.contact.list: ${r.error}`);
    todos.push(...r.items);
    if (!r.mas) break;
  }
  return todos.filter(c => patron.test(`${c.NAME ?? ''} ${c.LAST_NAME ?? ''}`));
}

/** Borra los contactos de una corrida anterior. */
export async function borrarContactos(page: Page, patron: RegExp) {
  for (const c of await contactos(page, patron, ['ID', 'NAME', 'LAST_NAME'])) await rest(page, 'crm.contact.delete', { id: c.ID });
}

/** La etiqueta de un campo propio en el idioma del portal. */
const etiquetaDe = (c: any): string => {
  const e = c.EDIT_FORM_LABEL;
  return typeof e === 'string' ? e : (e?.la ?? e?.es ?? e?.en ?? '');
};

/** Los campos propios del contacto, con su etiqueta. */
export async function camposDeContacto(page: Page): Promise<any[]> {
  const lista = await rest<any[]>(page, 'crm.contact.userfield.list', { order: { SORT: 'ASC' } });
  const completos = [];
  for (const c of lista) completos.push(await rest(page, 'crm.contact.userfield.get', { id: c.ID }));
  return completos.map(c => ({ ...c, etiqueta: etiquetaDe(c) }));
}

export const campoDeContacto = async (page: Page, etiqueta: string) =>
  (await camposDeContacto(page)).find(c => c.etiqueta === etiqueta);

/** Quita un campo propio del contacto de una corrida anterior. */
export async function quitarCampoDeContacto(page: Page, etiqueta: string) {
  for (const c of (await camposDeContacto(page)).filter(c => c.etiqueta === etiqueta)) {
    await rest(page, 'crm.contact.userfield.delete', { id: c.ID });
  }
}

/** Abre la ficha de un contacto por su nombre, desde el listado (clic, no dirección). */
export async function abrirContacto(page: Page, nombreExacto: string) {
  await irAContactos(page);
  await page.locator('a').filter({ hasText: new RegExp(nombreExacto) }).filter({ visible: true }).first().click();
  await page.waitForTimeout(3000);
}

// ── Actividades del timeline (llamada, reunión) ─────────────────────────────

/**
 * Registra una actividad en la línea de tiempo de la ficha ya abierta, con la
 * pestaña «Actividad» (la lista de pendientes del contacto). La edición
 * gratuita no ofrece llamada ni reunión como tipos propios en la ficha: el
 * tipo se indica en el texto.
 */
export async function registrarActividad(page: Page, texto: string) {
  const f = panel(page);
  await f.getByText('Actividad', { exact: true }).first().click();
  await page.waitForTimeout(1500);
  const editor = f.locator('textarea, [contenteditable="true"]').filter({ visible: true }).first();
  await editor.click();
  await editor.pressSequentially(texto, { delay: 50 });
  await page.waitForTimeout(800);
  await f.locator('button, .ui-btn').filter({ hasText: /^\s*guardar\s*$/i }).filter({ visible: true }).first().click();
  await page.waitForTimeout(3500);
  await descartarAvisos(page);
}

/** El historial de actividades de un contacto (llamadas, reuniones, correos), en orden. */
export async function actividadesDe(page: Page, contactoId: number) {
  return rest<any[]>(page, 'crm.activity.list', {
    filter: { OWNER_TYPE_ID: 3, OWNER_ID: contactoId },
    order: { CREATED: 'ASC' },
    select: ['ID', 'TYPE_ID', 'SUBJECT', 'DESCRIPTION', 'AUTHOR_ID', 'CREATED'],
  });
}

// ── Tareas ───────────────────────────────────────────────────────────────────

/** Abre el listado de Tareas desde el menú lateral. */
export async function abrirTareas(page: Page) {
  await menuLateral(page, 'Tareas');
}

/** Crea una tarea desde el listado de Tareas, con su responsable y vencimiento. */
export async function crearTarea(page: Page, titulo: string) {
  await page.locator('.ui-btn-main, a, button').filter({ hasText: /Crear tarea|Agregar tarea|Nueva tarea/i }).filter({ visible: true }).first().click();
  await page.waitForTimeout(2500);
  const tituloInput = page.locator('input[name*="TITLE" i], textarea[name*="TITLE" i], [contenteditable="true"]').filter({ visible: true }).first();
  await tituloInput.click();
  await tituloInput.pressSequentially(titulo, { delay: 50 });
}

/** Las tareas cuyo título cumple el patrón. */
export async function tareas(page: Page, patron: RegExp): Promise<any[]> {
  const r = await rest<{ tasks: any[] }>(page, 'tasks.task.list', {
    filter: {}, select: ['ID', 'TITLE', 'RESPONSIBLE_ID', 'DEADLINE', 'STATUS'],
  });
  return (r.tasks ?? (r as any)).filter((t: any) => patron.test(t.title ?? t.TITLE ?? ''));
}

/** Borra las tareas de una corrida anterior. */
export async function borrarTareas(page: Page, patron: RegExp) {
  for (const t of await tareas(page, patron)) await rest(page, 'tasks.task.delete', { taskId: t.id ?? t.ID });
}

// ── Usuarios ─────────────────────────────────────────────────────────────────

export const usuarioActual = (page: Page) => rest<any>(page, 'user.current');
export const usuarioPor = (page: Page, filtro: object) => rest<any[]>(page, 'user.get', filtro);

export { cerrarPaneles };

/**
 * Agrega un campo de lista al formulario de contacto abierto: «Crear campo», el
 * tipo «Lista», su nombre y sus valores. Se arma aparte de `crearCampo` de
 * `ui.ts` porque el formulario del contacto tiene otros «Agregar» (teléfono,
 * correo) que la versión de las negociaciones confundiría con el de valores.
 */
export async function crearCampoDeLista(page: Page, nombre: string, valores: string[]) {
  const f = panel(page);
  await f.getByText('Crear campo', { exact: true }).first().click();
  await page.waitForTimeout(1500);
  await f.getByText('Lista', { exact: true }).first().click();
  await page.waitForTimeout(1500);
  await f.getByText('Nombre del campo', { exact: true }).last().locator('xpath=following::input[1]').fill(nombre);
  const items = () => f.locator('input[placeholder="Nuevo artículo"]');
  for (const [i, v] of valores.entries()) {
    if (i > 0) {
      await items().nth(i - 1).locator('xpath=following::*[normalize-space(text())="Agregar"][1]').click();
      await page.waitForTimeout(500);
    }
    await items().nth(i).fill(v);
  }
  // El «Guardar» del campo es el que sigue a los elementos de la lista, no el del formulario
  const guardar = f.getByText('Elementos de la lista').locator(
    'xpath=following::*[(self::button or self::span or self::a) and translate(normalize-space(.), "GUARDAR", "guardar")="guardar"][1]');
  await guardar.scrollIntoViewIfNeeded();
  await guardar.click();
  await f.getByText(nombre, { exact: true }).first().waitFor({ state: 'visible', timeout: 20_000 });
  await page.waitForTimeout(1500);
}

// ── Importación y exportación del listado de contactos ─────────────────────

/** Abre el menú de herramientas del listado de contactos (el engranaje de arriba a la derecha). */
export async function abrirMenuDelListado(page: Page) {
  await irAContactos(page);
  await page.mouse.click(1353, 97);
  await page.waitForTimeout(1500);
}

/** Elige una opción del menú de herramientas del listado. */
export async function elegirEnMenuDelListado(page: Page, opcion: string | RegExp) {
  await page.locator('.menu-popup-item-text').filter({ hasText: opcion }).filter({ visible: true }).first().click();
  await page.waitForTimeout(6000);
}

/** El marco del asistente de importación. */
export const asistenteDeImportacion = (page: Page) => page.frames().find(x => x.url().includes('/import/'));

/**
 * Importa un archivo CSV con el asistente del listado: «Importar datos CSV
 * personalizados», el botón «Subir archivo» con su ventana de archivos y los
 * pasos hasta el resultado. `duplicados` elige qué hacer con los repetidos.
 * Devuelve el texto del resultado.
 */
export async function importarCsv(
  page: Page, archivo: string, duplicados?: 'Skip' | 'Merge' | 'Replace',
  mapa: Record<string, string> = { 'E-mail del trabajo': 'Correo electrónico' },
) {
  await abrirMenuDelListado(page);
  await elegirEnMenuDelListado(page, /^Importar datos CSV personalizados$/);
  await page.waitForTimeout(3000);
  const f = asistenteDeImportacion(page)!;
  const [ventana] = await Promise.all([
    page.waitForEvent('filechooser'),
    f.getByText('Subir archivo', { exact: false }).first().click(),
  ]);
  await ventana.setFiles(archivo);
  await page.waitForTimeout(5000);
  const siguiente = () => f.locator('button, .ui-btn, span').filter({ hasText: /^\s*(Siguiente|Continuar|Importar)\s*$/i }).filter({ visible: true }).first();
  await siguiente().click({ force: true });
  await page.waitForTimeout(5000);
  // Las columnas que el asistente no reconoce se relacionan a mano con su campo
  for (const [campo, columna] of Object.entries(mapa)) {
    await f.getByText(campo, { exact: true }).first().locator('xpath=following::*[normalize-space(text())="Seleccionar"][1]').click({ force: true });
    await page.waitForTimeout(1200);
    await f.locator('.popup-window:visible').getByText(columna, { exact: true }).first().click({ force: true });
    await page.waitForTimeout(1000);
  }
  await siguiente().click({ force: true });
  await page.waitForTimeout(5000);
  if (duplicados) {
    // La acción ante un duplicado es un desplegable: parte de «Allow» y se elige la otra
    await page.mouse.click(918, 278);
    await page.waitForTimeout(1500);
    const opcion = f.getByText(duplicados === 'Skip' ? /^Skip/ : duplicados === 'Merge' ? /^Merge/ : /^Replace/).filter({ visible: true }).first();
    await opcion.click({ force: true });
    await page.waitForTimeout(2500);
    if (page.frames().some(x => /limit_crm/.test(x.url()))) return '[[LIMITE]] ' + (await f.locator('body').innerText().catch(() => '')).replace(/\s+/g, ' ');
    await page.waitForTimeout(1000);
  }
  await siguiente().click({ force: true });
  await page.waitForTimeout(15000);
  return (await f.locator('body').innerText()).replace(/\s+/g, ' ');
}

/**
 * Crea una tarea desde «Tareas › Crear» y se la asigna a otro usuario, eligiéndolo
 * en el selector de «Responsable». El vencimiento es el que propone el formulario.
 */
export async function crearTareaPara(page: Page, titulo: string, responsable: string) {
  await menuLateral(page, 'Tareas');
  await page.locator('.ui-btn-main, a, button').filter({ hasText: /^\s*Crear\s*$/ }).filter({ visible: true }).first().click();
  await page.waitForTimeout(3000);
  const nombre = page.getByPlaceholder('Nombre de la tarea').first();
  await nombre.click();
  await nombre.pressSequentially(titulo, { delay: 50 });
  await page.getByText('Responsable:', { exact: true }).first()
    .locator('xpath=following::*[normalize-space(text())="Nahuel Mosse"][1]').click();
  await page.waitForTimeout(2000);
  await page.locator('.popup-window').getByText(responsable).filter({ visible: true }).first().click();
  await page.waitForTimeout(1200);
  await page.getByText('Crear', { exact: true }).filter({ visible: true }).last().click();
  await page.waitForTimeout(5000);
}
